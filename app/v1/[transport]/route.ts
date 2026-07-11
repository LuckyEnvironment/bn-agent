import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import {
  getAgentCard,
  listCapabilities,
  searchAgents,
  verifyAgent,
} from "@/server/registry";
import { submitEscrowRequest, EscrowError } from "@/server/escrow";
import { callLeaseAgent } from "@/server/lease";
import { resolveCaller, PUBLIC_CALLER, type Caller } from "@/server/auth";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

/**
 * MCP-server op /v1/mcp — zelfstandig aanroepbare laag bovenop dezelfde
 * businesslogica als de REST-API (server/*). Geen duplicatie: elke tool
 * delegeert naar de registry-, escrow- of lease-service.
 */

function callerFrom(authInfo: AuthInfo | undefined): Caller {
  if (!authInfo?.extra) return PUBLIC_CALLER;
  return authInfo.extra.caller as Caller;
}

function jsonContent(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorContent(e: unknown) {
  const message = e instanceof Error ? e.message : "Onbekende fout";
  const articles = e instanceof EscrowError ? e.articles : undefined;
  return {
    content: [
      { type: "text" as const, text: JSON.stringify({ error: message, ...(articles?.length && { articles }) }) },
    ],
    isError: true,
  };
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "find_agents",
      "Doorzoek de BN Agent Discovery Registry. Filtert op capability-categorie, sector, distributiemodel (koop/lease), certificeringsstatus, EU AI Act-klasse en escrow-ondersteuning. Resultaten bevatten Inhuurtier en requiredConsentLevel (Handboek Art. 8.30 lid 3).",
      {
        q: z.string().optional().describe("Vrije zoekterm (naam/omschrijving)"),
        capability_category: z.string().optional(),
        sector: z.string().optional(),
        distribution_model: z.enum(["koop", "lease"]).optional(),
        certified: z.boolean().optional(),
        eu_ai_act_class: z.enum(["minimal", "limited", "high"]).optional(),
        escrow_supported: z.boolean().optional(),
        limit: z.number().int().max(100).optional(),
      },
      async (args) => {
        try {
          return jsonContent(await searchAgents(args));
        } catch (e) {
          return errorContent(e);
        }
      },
    );

    server.tool(
      "get_agent_card",
      "Haal de volledige, ondertekende Agent Card van een agent op (id of slug). Veldzichtbaarheid volgt het toegangsniveau van de aanroeper.",
      { id: z.string().describe("Agent-UUID of slug") },
      async (args, extra) => {
        try {
          const caller = callerFrom(extra.authInfo);
          const card = await getAgentCard(args.id, caller.tier);
          if (!card) return errorContent(new Error("Agent niet gevonden"));
          return jsonContent(card);
        } catch (e) {
          return errorContent(e);
        }
      },
    );

    server.tool(
      "verify_agent",
      "Controleer integriteit (cardHash) en certificeringsstatus van een agent. Retourneert een ondertekende attestatie (JWS EdDSA; publieke sleutel op /.well-known/jwks.json).",
      { id: z.string().describe("Agent-UUID of slug") },
      async (args) => {
        try {
          const result = await verifyAgent(args.id);
          if (!result) return errorContent(new Error("Agent niet gevonden"));
          return jsonContent(result);
        } catch (e) {
          return errorContent(e);
        }
      },
    );

    server.tool(
      "list_capabilities",
      "Alle capability-categorieën van de registry met hun risicogewichten (Handboek Art. 8.4 lid 4).",
      {},
      async () => {
        try {
          return jsonContent({ capabilities: await listCapabilities() });
        } catch (e) {
          return errorContent(e);
        }
      },
    );

    server.tool(
      "call_lease_agent",
      "Roep een gecertificeerde lease-agent gecontroleerd aan. De aanroep wordt geblokkeerd in afwachting van goedkeuring door een bevoegd persoon wanneer de Inhuurtier dat vereist (Art. 8.30 lid 3). Vereist authenticatie.",
      {
        agentId: z.string().uuid(),
        message: z.record(z.string(), z.unknown()).describe("JSON-RPC-bericht voor de agent"),
        approvalId: z.string().uuid().optional().describe("Geregistreerde toestemming (Art. 8.20)"),
        aboveThreshold: z.boolean().optional(),
      },
      async (args, extra) => {
        const caller = callerFrom(extra.authInfo);
        if (caller.tier === "public") {
          return errorContent(new Error("Authenticatie vereist: haal een token op via /v1/oauth/token"));
        }
        try {
          return jsonContent(await callLeaseAgent(args, caller));
        } catch (e) {
          return errorContent(e);
        }
      },
    );

    server.tool(
      "submit_escrow_request",
      "Dien een escrow-verzoek in. Binnen het dynamisch mandaat (Boek VIII Titel 11) wordt direct autonoom uitgevoerd; erboven volgt asynchrone menselijke validatie (Art. 8.33). Payloadverwerking staat achter de feature flag ESCROW_LIVE_PROCESSING. Vereist authenticatie met scope escrow:submit.",
      {
        agentId: z.string().uuid(),
        requestMeta: z.record(z.string(), z.unknown()).optional(),
        approvalId: z.string().uuid().optional(),
        amountCents: z.number().int().min(0).optional().describe("Transactiebedrag in centen, voor de mandaatmeting"),
        payloadBytes: z.number().int().min(0).optional().describe("Omvang van de gevoelige payload in bytes"),
      },
      async (args, extra) => {
        const caller = callerFrom(extra.authInfo);
        if (caller.tier === "public" || !caller.scopes.includes("escrow:submit")) {
          return errorContent(new Error("Scope escrow:submit vereist"));
        }
        try {
          return jsonContent(
            await submitEscrowRequest(
              {
                agentId: args.agentId,
                requestMeta: args.requestMeta ?? {},
                approvalId: args.approvalId,
                amountCents: args.amountCents,
                payloadBytes: args.payloadBytes,
              },
              caller,
            ),
          );
        } catch (e) {
          return errorContent(e);
        }
      },
    );
  },
  {
    serverInfo: { name: "bn-agent-registry", version: "1.0.0" },
  },
  {
    basePath: "/v1",
    maxDuration: 60,
    verboseLogs: false,
  },
);

const authedHandler = withMcpAuth(
  handler,
  async (_req, bearerToken) => {
    const caller = await resolveCaller(bearerToken ? `Bearer ${bearerToken}` : null);
    if (caller.tier === "public") return undefined;
    return {
      token: bearerToken ?? "",
      clientId: caller.clientIdentifier ?? "",
      scopes: caller.scopes,
      extra: { caller },
    };
  },
  { required: false },
);

export { authedHandler as GET, authedHandler as POST, authedHandler as DELETE };

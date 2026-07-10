import { jsonPublic } from "@/lib/api";
import { baseUrl } from "@/lib/flags";

/**
 * GET /.well-known/agent.json — de Agent Card van het BN Agent-platform zelf,
 * conform de A2A v1.0-conventie die het Handboek (Boek VI) aan elke
 * lease-agent oplegt. Practice what you certify.
 */
export async function GET() {
  const base = baseUrl();
  return jsonPublic(
    {
      protocolVersion: "1.0",
      name: "BN Agent Discovery Registry",
      description:
        "Gecertificeerde discovery-registry en escrow-laag voor AI-agents. Exposeert zoeken, verificatie en escrow-indiening via REST (/v1) en MCP (/v1/mcp).",
      url: `${base}/v1`,
      preferredTransport: "HTTP+JSON",
      version: "1.0.0",
      provider: { organization: "BN Agent", url: base, country: "NL" },
      capabilities: { streaming: false, pushNotifications: false },
      defaultInputModes: ["application/json"],
      defaultOutputModes: ["application/json"],
      skills: [
        { id: "find_agents", name: "Agents zoeken", description: "Doorzoek de Discovery Registry op capability, sector, distributiemodel, certificering en risicoklasse." },
        { id: "get_agent_card", name: "Agent Card ophalen", description: "Volledige, ondertekende Agent Card van een geregistreerde agent." },
        { id: "verify_agent", name: "Agent verifiëren", description: "Ondertekende attestatie van cardintegriteit en certificeringsstatus." },
        { id: "list_capabilities", name: "Capabilities opsommen", description: "Alle capability-categorieën met risicogewichten." },
        { id: "call_lease_agent", name: "Lease-agent aanroepen", description: "Gecontroleerde aanroep van een lease-agent met Tier-gating (Boek VIII)." },
        { id: "submit_escrow_request", name: "Escrow-verzoek indienen", description: "Escrow-transactie starten; payloadverwerking achter feature flag." },
      ],
      bna: {
        schemaVersion: "1.0",
        slug: "bn-agent-registry",
        registryUrl: `${base}/v1/registry`,
        distributionModel: "lease",
        sector: "compliance",
        openapi: `${base}/openapi.json`,
        jwks: `${base}/.well-known/jwks.json`,
        mcp: `${base}/v1/mcp`,
      },
    },
    { cacheSeconds: 3600 },
  );
}

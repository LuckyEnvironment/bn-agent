import agentCardSchema from "./schemas/agent-card.v1.json";

/**
 * OpenAPI 3.1-specificatie van de BN Agent API v1. Eén bron van waarheid:
 * het Agent Card-schema wordt hergebruikt uit lib/schemas/agent-card.v1.json.
 */
export function buildOpenApiSpec(baseUrl: string) {
  return {
    openapi: "3.1.0",
    info: {
      title: "BN Agent API",
      version: "1.0.0",
      description:
        "Discovery Registry, verificatieprotocol en escrow-laag voor gecertificeerde AI-agents. Stateless REST; agent-toegang via OAuth 2.1 client credentials met Dynamic Client Registration (RFC 7591). Machine-leesbare velden verwijzen naar artikelen van het BN Agent Handboek.",
      contact: { email: "registry@bnagent.nl" },
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          flows: {
            clientCredentials: {
              tokenUrl: `${baseUrl}/v1/oauth/token`,
              scopes: {
                "registry:read": "Registry lezen (uitgebreide velden)",
                "registry:write": "Agent Cards publiceren en updaten",
                "escrow:submit": "Escrow-verzoeken en toestemmingen indienen",
              },
            },
          },
        },
      },
      schemas: {
        AgentCard: agentCardSchema,
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                status: { type: "integer" },
                message: { type: "string" },
                details: {},
              },
            },
          },
        },
      },
    },
    paths: {
      "/v1/registry/agents": {
        get: {
          summary: "Agents zoeken/filteren in de Discovery Registry",
          parameters: [
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "capability_category", in: "query", schema: { type: "string" } },
            { name: "sector", in: "query", schema: { type: "string" } },
            { name: "distribution_model", in: "query", schema: { type: "string", enum: ["koop", "lease"] } },
            { name: "certified", in: "query", schema: { type: "boolean" } },
            { name: "eu_ai_act_class", in: "query", schema: { type: "string", enum: ["minimal", "limited", "high"] } },
            { name: "escrow_supported", in: "query", schema: { type: "boolean" } },
            { name: "limit", in: "query", schema: { type: "integer", maximum: 100 } },
            { name: "offset", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            "200": { description: "Zoekresultaat met total/limit/offset en agent-samenvattingen" },
          },
        },
        post: {
          summary: "Agent Card publiceren of updaten",
          description:
            "Valideert tegen het canonieke JSON Schema. Het riskScoring-blok wordt server-side berekend (Handboek Art. 8.30 lid 2); aangeleverde waarden worden genegeerd. EU AI Act-klasse 'unacceptable' wordt geweigerd (Art. 8.16 lid 2).",
          security: [{ oauth2: ["registry:write"] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AgentCard" } } },
          },
          responses: {
            "201": { description: "Gepubliceerd; bevat agentId, cardHash, signature en berekend riskScoring" },
            "401": { description: "Geen geldige authenticatie", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "422": { description: "Schemavalidatie of Handboek-regel geschonden", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/v1/registry/agents/{id}": {
        get: {
          summary: "Volledige Agent Card ophalen",
          description:
            "Veldzichtbaarheid hangt af van de aanroeper: publiek (discovery-kern), geauthenticeerd (endpoints en toezichtmaatregelen), betalend (volledig risicoprofiel). id mag ook de slug zijn.",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Agent Card + cardHash + handtekening" }, "404": { description: "Niet gevonden" } },
        },
      },
      "/v1/registry/agents/{id}/verify": {
        get: {
          summary: "Integriteits- en certificeringscontrole",
          description:
            "Retourneert een ondertekende attestatie (JWS, EdDSA): cardHashValid, certificationValid, certificationExpiresAt, trustScore, inhuurTier, checkedAt. Publieke sleutel: /.well-known/jwks.json.",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { "200": { description: "Attestatie" }, "404": { description: "Niet gevonden" } },
        },
      },
      "/v1/capabilities": {
        get: { summary: "Capability-categorieën met risicogewichten (Bijlage A)", responses: { "200": { description: "Lijst" } } },
      },
      "/v1/sectors": {
        get: { summary: "Sectoren met risicogewichten en regelgeving (Bijlage B)", responses: { "200": { description: "Lijst" } } },
      },
      "/v1/oauth/register": {
        post: {
          summary: "Dynamic Client Registration (RFC 7591)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["client_name"],
                  properties: {
                    client_name: { type: "string" },
                    scope: { type: "string", description: "Spatiegescheiden; standaard registry:read" },
                  },
                },
              },
            },
          },
          responses: { "201": { description: "client_id + client_secret (eenmalig getoond)" } },
        },
      },
      "/v1/oauth/token": {
        post: {
          summary: "OAuth 2.1 token endpoint (client_credentials)",
          responses: { "200": { description: "Bearer-token (JWT, EdDSA, 1 uur geldig)" }, "401": { description: "invalid_client" } },
        },
      },
      "/v1/escrow/requests": {
        post: {
          summary: "Escrow-verzoek indienen",
          description:
            "Tier-gating conform Handboek Boek VIII: Tier D en Tier C boven drempel worden geblokkeerd tot een geregistreerde toestemming (Art. 8.15/8.16). Zolang ESCROW_LIVE_PROCESSING uit staat worden uitsluitend metadata aangenomen; payloads worden geweigerd.",
          security: [{ oauth2: ["escrow:submit"] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["agentId"],
                  properties: {
                    agentId: { type: "string", format: "uuid" },
                    requestMeta: { type: "object" },
                    approvalId: { type: "string", format: "uuid" },
                    aboveThreshold: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Aangenomen (accepted_not_processed zolang flag uit staat)" },
            "202": { description: "blocked_awaiting_consent — toestemming vereist" },
            "403": { description: "Niet toelaatbaar (Art. 8.13/8.28)" },
          },
        },
      },
      "/v1/escrow/approvals": {
        post: {
          summary: "Toestemming bevoegd persoon vastleggen (Art. 8.20)",
          security: [{ oauth2: ["escrow:submit"] }],
          responses: { "201": { description: "approvalId; vastgelegd in append-only auditlog" } },
        },
      },
      "/v1/leads": {
        post: { summary: "Wachtlijst/leadcapture", responses: { "201": { description: "Ontvangen" } } },
      },
    },
  };
}

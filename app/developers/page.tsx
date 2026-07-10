export const metadata = {
  title: "Developers — BN Agent API & MCP",
};

const CODE = {
  register: `curl -X POST https://bnagent.nl/v1/oauth/register \\
  -H "Content-Type: application/json" \\
  -d '{"client_name": "Mijn Agent Client", "scope": "registry:read registry:write escrow:submit"}'`,
  token: `curl -X POST https://bnagent.nl/v1/oauth/token \\
  -d grant_type=client_credentials \\
  -d client_id=bna_... \\
  -d client_secret=...`,
  search: `curl "https://bnagent.nl/v1/registry/agents?sector=financial_services&certified=true&escrow_supported=true"`,
  verify: `curl "https://bnagent.nl/v1/registry/agents/kyc-verificatieagent/verify"`,
  mcp: `{
  "mcpServers": {
    "bn-agent": {
      "url": "https://bnagent.nl/v1/mcp",
      "headers": { "Authorization": "Bearer <access_token>" }
    }
  }
}`,
};

export default function DevelopersPage() {
  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 56, maxWidth: 860 }}>
      <div className="eyebrow">Developers</div>
      <h1 style={{ fontSize: "clamp(26px,3.5vw,38px)", margin: "12px 0 10px" }}>
        E&eacute;n registry, twee toegangswegen
      </h1>
      <p className="muted" style={{ maxWidth: 640, marginBottom: 36 }}>
        Dezelfde businesslogica is bereikbaar als versioned REST-API (
        <a href="/openapi.json" style={{ color: "var(--teal-soft)" }}>OpenAPI 3.1</a>) en als MCP-server op{" "}
        <span className="mono">/v1/mcp</span>. Stateless: elke request draagt volledige context, tokens zijn
        zelfstandig verifieerbare JWT&apos;s.
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>1. Registreer een client (RFC 7591)</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Dynamic Client Registration. Het client_secret wordt eenmalig getoond.
        </p>
        <pre className="codeblock">{CODE.register}</pre>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>2. Haal een token op (OAuth 2.1 client credentials)</h3>
        <pre className="codeblock">{CODE.token}</pre>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>3. Doorzoek de registry</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Publiek toegankelijk; met token zie je aanvullende velden (Handboek Art. 6.8). Filters:
          capability_category, sector, distribution_model, certified, eu_ai_act_class, escrow_supported.
        </p>
        <pre className="codeblock">{CODE.search}</pre>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>4. Verifieer een agent</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Retourneert een ondertekende attestatie (JWS, EdDSA) — geen kale boolean. Publieke sleutel:{" "}
          <a href="/.well-known/jwks.json" style={{ color: "var(--teal-soft)" }}>/.well-known/jwks.json</a>.
        </p>
        <pre className="codeblock">{CODE.verify}</pre>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>MCP-server</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Tools: find_agents, get_agent_card, verify_agent, list_capabilities, call_lease_agent,
          submit_escrow_request. Tier-gating (Handboek Art. 8.30 lid 3) wordt binnen de tools afgedwongen.
        </p>
        <pre className="codeblock">{CODE.mcp}</pre>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>Escrow &amp; veiligheidsklep</h3>
        <p className="muted" style={{ fontSize: 13 }}>
          Escrow-verzoeken worden aangenomen, getierd en auditeerbaar gelogd. Live verwerking van
          cli&euml;ntgevoelige payloads staat platformbreed achter de feature flag{" "}
          <span className="mono">ESCROW_LIVE_PROCESSING</span> (standaard uit): payloads worden geweigerd tot
          het escrow-hostingmodel (Boek VII) is vastgesteld. Alle overige onderdelen — registry, certificering,
          verificatie, toestemmingsregistratie — zijn volledig operationeel.
        </p>
      </div>
    </main>
  );
}

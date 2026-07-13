import {
  BN_CONNECTORS,
  CONNECTOR_STATUS_LABELS,
  CONNECTOR_AUTH_LABELS,
  type Connector,
} from "@/lib/connectors-data";

export const dynamic = "force-dynamic";

const CATEGORIES = [...new Set(BN_CONNECTORS.map((c) => c.category))].sort();
const STATUSES = [...new Set(BN_CONNECTORS.map((c) => c.status))];

function statusBadge(status: string) {
  const label = CONNECTOR_STATUS_LABELS[status] ?? status;
  if (status === "actief") return <span className="badge badge-ok"><span className="dot" />{label}</span>;
  if (status.includes("validatie")) return <span className="badge badge-warn"><span className="dot" />{label}</span>;
  return <span className="badge">{label}</span>;
}

export default async function ConnectorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const category = params.category ?? "";
  const status = params.status ?? "";

  const filtered = BN_CONNECTORS.filter((c: Connector) => {
    if (category && c.category !== category) return false;
    if (status && c.status !== status) return false;
    if (q) {
      const hay = [c.name, c.provider, c.description, c.category, ...c.scopes].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="eyebrow">Connectorcatalogus</div>
      <h1 style={{ fontSize: "clamp(26px,3.5vw,38px)", margin: "12px 0 10px" }}>
        Gecertificeerde systeemconnectors
      </h1>
      <p className="muted" style={{ maxWidth: 640, marginBottom: 34 }}>
        Elke connector is een gecertificeerde koppeling naar een extern systeem (iDIN, KVK, DigiD,
        eHerkenning, Microsoft Graph, &hellip;) met een ondertekend manifest. Agents verwijzen ernaar
        via <code>connectorIds</code>; de manifesthash (<code>integrity.manifestHash</code>) wordt bij
        certificering gepind onder de <code>card_hash</code> van de agent.
      </p>

      <form
        method="get"
        className="card"
        style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 28 }}
      >
        <div className="field" style={{ flex: 2, minWidth: 200 }}>
          <label htmlFor="q">Zoekterm</label>
          <input id="q" name="q" type="text" defaultValue={params.q ?? ""} placeholder="bijv. KVK, betalen, iDIN" style={{ width: "100%" }} />
        </div>
        <div className="field" style={{ minWidth: 200 }}>
          <label htmlFor="category">Categorie</label>
          <select id="category" name="category" defaultValue={category} style={{ width: "100%" }}>
            <option value="">Alle</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: 160 }}>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status} style={{ width: "100%" }}>
            <option value="">Alle</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{CONNECTOR_STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" type="submit">Filter</button>
      </form>

      <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
        {filtered.length} van {BN_CONNECTORS.length} connectors
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
        {filtered.map((c) => (
          <div key={c.connectorId} className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: 16 }}>{c.name}</h3>
              {statusBadge(c.status)}
            </div>
            <p className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
              {c.provider} · {c.category} · v{c.version}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", flex: 1 }}>{c.description}</p>

            <div className="mono" style={{ fontSize: 11, color: "var(--muted)", display: "flex", gap: 14, flexWrap: "wrap" }}>
              <span>auth: {CONNECTOR_AUTH_LABELS[c.authType] ?? c.authType}</span>
              <span>residentie: {c.dataResidency}</span>
              <span>ZDR: {c.zeroDataRetention ? "ja" : "nee"}</span>
              <span>risicobijdrage: {c.riskContribution}</span>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {c.scopes.map((s) => (
                <span key={s} className="badge" style={{ fontSize: 10.5 }}>{s}</span>
              ))}
            </div>

            {c.integrity ? (
              <p className="mono" style={{ fontSize: 10, color: "var(--muted)", wordBreak: "break-all" }}>
                manifestHash: {c.integrity.manifestHash.slice(0, 24)}…
              </p>
            ) : (
              <p className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>in validatie — nog geen manifesthash</p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card muted" style={{ textAlign: "center", padding: 48 }}>
            Geen connectors gevonden met deze filters.
          </div>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgentCard, verifyAgent } from "@/server/registry";

export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, string> = {
  A: "autonome inhuur, steekproef achteraf",
  B: "goedkeuring bij eerste inzet",
  C: "goedkeuring boven drempel",
  D: "goedkeuring per transactie",
};

const COMPONENT_LABEL: Record<string, { label: string; max: number }> = {
  sector: { label: "Sectorgewicht", max: 25 },
  euAiActClass: { label: "EU AI Act-klasse", max: 30 },
  capabilityCategory: { label: "Capability-categorie", max: 20 },
  dataSensitivity: { label: "Datagevoeligheid", max: 15 },
  autonomyLevel: { label: "Autonomieniveau", max: 10 },
};

function artikelHref(art: string): string {
  const m = art.match(/Art\. (\d+)\./);
  const boeken: Record<string, string> = {
    "1": "boek-i", "2": "boek-ii", "3": "boek-iii", "4": "boek-iv",
    "5": "boek-v", "6": "boek-vi", "8": "boek-viii",
  };
  const boek = m ? boeken[m[1]] : undefined;
  const anchor = art.match(/Art\. (\d+\.\d+)/)?.[1];
  return boek ? `/handboek/${boek}#art-${anchor}` : "/handboek";
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Publieke pagina toont bewust het volledige kaartbeeld ('paying'-weergave is
  // hier het eigen platform dat rendert); de API filtert per externe aanroeper.
  const [result, verification] = await Promise.all([
    getAgentCard(slug, "paying"),
    verifyAgent(slug),
  ]);
  if (!result) notFound();

  const card = result.card as Record<string, unknown>;
  const bna = card.bna as Record<string, unknown>;
  const rs = (bna.riskScoring ?? {}) as Record<string, unknown>;
  const cert = (bna.certification ?? {}) as Record<string, unknown>;
  const provider = (card.provider ?? {}) as Record<string, unknown>;
  const caps = (bna.capabilities ?? []) as Record<string, unknown>[];
  const oversight = (bna.humanOversightMeasures ?? []) as Record<string, string>[];
  const components = (rs.riskFactorComponents ?? {}) as Record<string, number>;
  const tier = rs.inhuurTier as string;

  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <p className="mono" style={{ fontSize: 12, marginBottom: 18 }}>
        <Link href="/registry" style={{ color: "var(--muted)" }}>Registry</Link>
        <span className="muted"> / {bna.slug as string}</span>
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
        <h1 style={{ fontSize: "clamp(24px,3vw,34px)" }}>{card.name as string}</h1>
        <span className={`badge ${bna.distributionModel === "koop" ? "badge-copper" : "badge-ok"}`}>
          <span className="dot" />
          {bna.distributionModel === "koop" ? "Koop" : "Lease"}
        </span>
        {cert.status === "certified" ? (
          <span className="badge badge-ok">gecertificeerd</span>
        ) : (
          <span className="badge badge-warn">certificering: {String(cert.status)}</span>
        )}
        {Boolean(rs.suspended) && <span className="badge badge-bad">geschorst</span>}
      </div>
      <p className="muted" style={{ maxWidth: 680, marginBottom: 8 }}>{card.description as string}</p>
      <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 36 }}>
        {provider.organization as string} · v{card.version as string} · sector {bna.sector as string}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }} className="detail-grid">
        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 16 }}>Risicoscoring — Boek VIII</div>
          <div style={{ display: "flex", gap: 26, alignItems: "center", marginBottom: 22, flexWrap: "wrap" }}>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>RISICOFACTOR</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36 }}>
                {rs.riskFactorScore as number}
                <span style={{ fontSize: 14, color: "var(--muted)" }}> /100 · {rs.riskFactorClass as string}</span>
              </div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>VERTROUWENSSCORE</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36 }}>
                {rs.trustScore as number}
                <span style={{ fontSize: 14, color: "var(--muted)" }}> /100</span>
              </div>
            </div>
            <span className={`tier-pill tier-${tier}`} style={{ marginLeft: "auto" }}>
              <span className="t-label">Inhuurtier {tier}</span>
              {TIER_LABEL[tier]}
            </span>
          </div>
          {Object.entries(COMPONENT_LABEL).map(([key, meta]) => (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span className="muted">{meta.label}</span>
                <span className="mono">{components[key] ?? 0}/{meta.max}</span>
              </div>
              <div className="meter">
                <div
                  className={`meter-fill ${((components[key] ?? 0) / meta.max) > 0.7 ? "red" : ((components[key] ?? 0) / meta.max) > 0.4 ? "amber" : ""}`}
                  style={{ width: `${((components[key] ?? 0) / meta.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <p className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 16 }}>
            toestemmingsniveau: {rs.requiredConsentLevel as string} · herberekend:{" "}
            {new Date(rs.trustScoreLastCalculated as string).toLocaleDateString("nl-NL")}
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {((rs.applicableArticles ?? []) as string[]).map((art) => (
              <Link key={art} href={artikelHref(art)} className="badge badge-neutral">{art}</Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="eyebrow" style={{ marginBottom: 16 }}>Verificatie — Boek VI</div>
          {verification && (
            <table className="datatable">
              <tbody>
                <tr>
                  <td className="muted">Card-integriteit (sha256)</td>
                  <td>
                    {verification.cardHashValid ? (
                      <span className="badge badge-ok"><span className="dot" />cardHash geldig</span>
                    ) : (
                      <span className="badge badge-bad"><span className="dot" />cardHash ongeldig</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Certificering</td>
                  <td>
                    {verification.certificationValid ? (
                      <span className="badge badge-ok"><span className="dot" />geldig</span>
                    ) : (
                      <span className="badge badge-warn"><span className="dot" />{verification.certificationStatus}</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Certificering verloopt</td>
                  <td className="mono" style={{ fontSize: 12 }}>
                    {verification.certificationExpiresAt
                      ? new Date(verification.certificationExpiresAt).toLocaleDateString("nl-NL")
                      : "—"}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Certificerende instantie</td>
                  <td className="mono" style={{ fontSize: 12 }}>
                    {(cert.certifiedBy as string) === "notified_body"
                      ? `aangemelde instantie${cert.notifiedBodyName ? ` — ${cert.notifiedBodyName}` : ""}`
                      : "BN Agent"}
                  </td>
                </tr>
                <tr>
                  <td className="muted">Laatst gecontroleerd</td>
                  <td className="mono" style={{ fontSize: 12 }}>
                    {new Date(verification.checkedAt).toLocaleString("nl-NL")}
                  </td>
                </tr>
                <tr>
                  <td className="muted">cardHash</td>
                  <td className="mono" style={{ fontSize: 10.5, wordBreak: "break-all" }}>
                    {(verification.cardHash as string) ?? "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          <p className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 14 }}>
            Ondertekende attestatie:{" "}
            <a href={`/v1/registry/agents/${result.agentId}/verify`} style={{ color: "var(--teal-soft)" }}>
              /v1/registry/agents/{bna.slug as string}/verify
            </a>
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Capabilities</div>
        <table className="datatable">
          <thead>
            <tr>
              <th>Categorie</th>
              <th>Naam</th>
              <th>Datagevoeligheid</th>
              <th>Autonomie</th>
              <th>Datacategorie&euml;n</th>
            </tr>
          </thead>
          <tbody>
            {caps.map((c, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 12 }}>{c.category as string}</td>
                <td>{c.name as string}</td>
                <td className="mono" style={{ fontSize: 12 }}>{c.dataSensitivity as string}</td>
                <td className="mono" style={{ fontSize: 12 }}>{c.autonomyLevel as string}</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {((c.dataCategories ?? []) as string[]).join(", ") || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Menselijk toezicht — Boek V</div>
        <table className="datatable">
          <thead>
            <tr>
              <th>Artikel</th>
              <th>Maatregel</th>
              <th>Trigger</th>
            </tr>
          </thead>
          <tbody>
            {oversight.map((m, i) => (
              <tr key={i}>
                <td>
                  <Link href={artikelHref(m.article)} className="mono" style={{ fontSize: 12, color: "var(--teal-soft)" }}>
                    {m.article}
                  </Link>
                </td>
                <td>{m.measure}</td>
                <td className="mono" style={{ fontSize: 12 }}>{m.trigger ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="eyebrow" style={{ marginBottom: 16 }}>Agent Card (JSON)</div>
        <pre className="codeblock" style={{ maxHeight: 420, overflow: "auto" }}>
          {JSON.stringify(card, null, 2)}
        </pre>
        <p className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}>
          API:{" "}
          <a href={`/v1/registry/agents/${result.agentId}`} style={{ color: "var(--teal-soft)" }}>
            GET /v1/registry/agents/{bna.slug as string}
          </a>{" "}
          — veldzichtbaarheid verschilt per toegangsniveau (Art. 6.8)
        </p>
      </div>
    </main>
  );
}

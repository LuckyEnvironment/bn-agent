import Link from "next/link";
import { verifyAgent } from "@/server/registry";

export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, string> = {
  A: "autonoom",
  B: "eerste inzet",
  C: "boven drempel",
  D: "per transactie",
};

/**
 * Publieke certificaatcheck — het doel van het "Powered by BN Agent"-watermerk.
 * Verifieert server-side (verifyAgent, zelfde code als /v1/.../verify) de
 * Agent Card-integriteit en certificeringsstatus. Cert-only: de transactie-
 * (audittrail-)controle wordt hier niet aangeboden zolang er geen audit-route is.
 */
export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const id = (params.id ?? params.agent ?? "").trim();
  const verification = id ? await verifyAgent(id) : null;

  const v = (verification ?? {}) as Record<string, unknown>;
  const tier = (v.inhuurTier as string) ?? "";
  const valid = Boolean(v.certificationValid) && Boolean(v.cardHashValid);

  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 56, maxWidth: 800 }}>
      <div className="eyebrow">Publieke certificaatcheck</div>
      <h1 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "12px 0 10px" }}>
        Verifieer een BN Agent-certificaat
      </h1>
      <p className="muted" style={{ maxWidth: 640, marginBottom: 28 }}>
        Controleer onafhankelijk of een agent gecertificeerd is en of de integriteit van zijn Agent
        Card (cardHash) klopt — het doel van het &ldquo;Powered by BN Agent&rdquo;-watermerk. De
        ondertekende attestatie is verifieerbaar tegen{" "}
        <a href="/.well-known/jwks.json" style={{ color: "var(--teal-soft)" }}>/.well-known/jwks.json</a>.
      </p>

      <form
        method="get"
        className="card"
        style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap" }}
      >
        <div className="field" style={{ flex: 1, minWidth: 240 }}>
          <label htmlFor="id">Agent-id of slug</label>
          <input
            id="id"
            name="id"
            type="text"
            defaultValue={id}
            placeholder="bijv. document-extractie-agent"
            style={{ width: "100%" }}
          />
        </div>
        <button className="btn btn-primary btn-sm" type="submit">Controleer</button>
      </form>

      {id && !verification && (
        <div className="card">
          <span className="badge badge-bad"><span className="dot" />niet gevonden</span>
          <p className="muted" style={{ marginTop: 12 }}>
            Geen agent gevonden voor &ldquo;{id}&rdquo;. Controleer de id of slug in de{" "}
            <Link href="/registry" style={{ color: "var(--teal-soft)" }}>registry</Link>.
          </p>
        </div>
      )}

      {verification && (
        <div className="card">
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 18 }}>
            <h2 style={{ fontSize: 20 }}>{v.slug as string}</h2>
            {valid ? (
              <span className="badge badge-ok"><span className="dot" />geldig certificaat</span>
            ) : (
              <span className="badge badge-warn"><span className="dot" />controle vereist</span>
            )}
            {Boolean(v.suspended) && <span className="badge badge-bad">geschorst</span>}
          </div>

          <table className="datatable">
            <tbody>
              <tr>
                <td className="muted">Card-integriteit (sha256)</td>
                <td>
                  {v.cardHashValid ? (
                    <span className="badge badge-ok"><span className="dot" />cardHash geldig</span>
                  ) : (
                    <span className="badge badge-bad"><span className="dot" />cardHash ongeldig</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="muted">Certificering</td>
                <td>
                  {v.certificationValid ? (
                    <span className="badge badge-ok"><span className="dot" />geldig</span>
                  ) : (
                    <span className="badge badge-warn"><span className="dot" />{String(v.certificationStatus)}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="muted">Certificering verloopt</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {v.certificationExpiresAt
                    ? new Date(v.certificationExpiresAt as string).toLocaleDateString("nl-NL")
                    : "—"}
                </td>
              </tr>
              <tr>
                <td className="muted">Inhuurtier</td>
                <td>
                  {tier ? (
                    <span className={`tier-pill tier-${tier}`}>
                      <span className="t-label">Tier {tier}</span>
                      {TIER_LABEL[tier] ?? ""}
                    </span>
                  ) : "—"}
                </td>
              </tr>
              <tr>
                <td className="muted">Vertrouwensscore</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {typeof v.trustScore === "number" ? `${v.trustScore} /100` : "—"}
                </td>
              </tr>
              <tr>
                <td className="muted">Laatst gecontroleerd</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {new Date(v.checkedAt as string).toLocaleString("nl-NL")}
                </td>
              </tr>
              <tr>
                <td className="muted">cardHash</td>
                <td className="mono" style={{ fontSize: 10.5, wordBreak: "break-all" }}>
                  {(v.cardHash as string) ?? "—"}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: "flex", gap: 18, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
            <Link href={`/registry/${v.slug as string}`} className="btn btn-sm">
              Volledige Agent Card →
            </Link>
            <a
              href={`/v1/registry/agents/${v.slug as string}/verify`}
              className="mono"
              style={{ fontSize: 11, color: "var(--teal-soft)" }}
            >
              ondertekende attestatie (JWS, EdDSA)
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { listCapabilities, listSectors, searchAgents } from "@/server/registry";
import { JackStrip } from "@/components/PatchPanel";
import type { EuAiActClass } from "@/lib/risk";

export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, string> = {
  A: "autonoom",
  B: "eerste inzet",
  C: "boven drempel",
  D: "per transactie",
};

function parseBool(v: string | undefined): boolean | undefined {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

export default async function RegistryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [result, sectors, capabilities] = await Promise.all([
    searchAgents({
      q: params.q,
      capability_category: params.capability_category || undefined,
      sector: params.sector || undefined,
      distribution_model: (params.distribution_model as "koop" | "lease") || undefined,
      certified: parseBool(params.certified),
      eu_ai_act_class: (params.eu_ai_act_class as EuAiActClass) || undefined,
      escrow_supported: parseBool(params.escrow_supported),
    }),
    listSectors(),
    listCapabilities(),
  ]);

  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="eyebrow">Discovery Registry</div>
      <h1 style={{ fontSize: "clamp(26px,3.5vw,38px)", margin: "12px 0 10px" }}>
        Gecertificeerde agents, doorzoekbaar en verifieerbaar
      </h1>
      <p className="muted" style={{ maxWidth: 620, marginBottom: 34 }}>
        Elke agent publiceert een ondertekende Agent Card met risicoclassificatie, capabilities en
        toestemmingsniveau. Dezelfde data is beschikbaar via{" "}
        <a href="/openapi.json" style={{ color: "var(--teal-soft)" }}>REST</a> en MCP.
      </p>

      <form method="get" className="card" style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 28 }}>
        <div className="field" style={{ flex: 2, minWidth: 180 }}>
          <label htmlFor="q">Zoekterm</label>
          <input id="q" name="q" type="text" defaultValue={params.q ?? ""} placeholder="bijv. KYC, contract" style={{ width: "100%" }} />
        </div>
        <div className="field" style={{ minWidth: 170 }}>
          <label htmlFor="sector">Sector</label>
          <select id="sector" name="sector" defaultValue={params.sector ?? ""} style={{ width: "100%" }}>
            <option value="">Alle</option>
            {sectors.map((s) => (
              <option key={s.code} value={s.code}>{s.name_nl}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: 170 }}>
          <label htmlFor="capability_category">Capability</label>
          <select id="capability_category" name="capability_category" defaultValue={params.capability_category ?? ""} style={{ width: "100%" }}>
            <option value="">Alle</option>
            {capabilities.map((c) => (
              <option key={c.code} value={c.code}>{c.name_nl}</option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: 130 }}>
          <label htmlFor="distribution_model">Distributie</label>
          <select id="distribution_model" name="distribution_model" defaultValue={params.distribution_model ?? ""} style={{ width: "100%" }}>
            <option value="">Alle</option>
            <option value="koop">Koop</option>
            <option value="lease">Lease</option>
          </select>
        </div>
        <div className="field" style={{ minWidth: 130 }}>
          <label htmlFor="eu_ai_act_class">EU AI Act</label>
          <select id="eu_ai_act_class" name="eu_ai_act_class" defaultValue={params.eu_ai_act_class ?? ""} style={{ width: "100%" }}>
            <option value="">Alle</option>
            <option value="minimal">Minimal</option>
            <option value="limited">Limited</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="field" style={{ minWidth: 140 }}>
          <label htmlFor="certified">Certificering</label>
          <select id="certified" name="certified" defaultValue={params.certified ?? ""} style={{ width: "100%" }}>
            <option value="">Alle</option>
            <option value="true">Gecertificeerd</option>
            <option value="false">In behandeling</option>
          </select>
        </div>
        <div className="field" style={{ minWidth: 120 }}>
          <label htmlFor="escrow_supported">Escrow</label>
          <select id="escrow_supported" name="escrow_supported" defaultValue={params.escrow_supported ?? ""} style={{ width: "100%" }}>
            <option value="">Alle</option>
            <option value="true">Ondersteund</option>
            <option value="false">Niet</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" type="submit">Filter</button>
      </form>

      <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
        {result.total} agent{result.total === 1 ? "" : "s"} gevonden
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {result.agents.map((agent) => {
          const a = agent as Record<string, unknown>;
          const tier = a.inhuur_tier as string;
          return (
            <Link key={a.id as string} href={`/registry/${a.slug}`} className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 17 }}>{a.name as string}</h3>
                  <span className={`badge ${a.distribution_model === "koop" ? "badge-copper" : "badge-ok"}`}>
                    <span className="dot" />
                    {a.distribution_model === "koop" ? "Koop" : "Lease"}
                  </span>
                  {a.certified ? (
                    <span className="badge badge-ok">gecertificeerd</span>
                  ) : (
                    <span className="badge badge-warn">certificering in behandeling</span>
                  )}
                  {Boolean(a.suspended) && <span className="badge badge-bad">geschorst</span>}
                </div>
                <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 640 }}>{a.description as string}</p>
                <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span>sector: {a.sector_code as string}</span>
                  <span>EU AI Act: {a.eu_ai_act_class as string}</span>
                  <span>risicoklasse: {(a.risk_factor_class as string) ?? "—"}</span>
                  <span>vertrouwensscore: {a.trust_score as number}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <span className={`tier-pill tier-${tier}`}>
                  <span className="t-label">Inhuurtier {tier}</span>
                  {TIER_LABEL[tier] ?? ""}
                </span>
                <JackStrip
                  states={[
                    a.certified ? "teal" : "off",
                    a.escrow_supported ? (a.distribution_model === "koop" ? "copper" : "teal") : "off",
                    a.suspended ? "off" : "teal",
                  ]}
                />
              </div>
            </Link>
          );
        })}
        {result.agents.length === 0 && (
          <div className="card muted" style={{ textAlign: "center", padding: 48 }}>
            Geen agents gevonden met deze filters.
          </div>
        )}
      </div>
    </main>
  );
}

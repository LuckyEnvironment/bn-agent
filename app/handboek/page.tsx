import Link from "next/link";
import { BOEKEN } from "@/lib/handboek/data";

export const metadata = {
  title: "Handboek Agent Communicatieprotocol — BN Agent",
};

export default function HandboekIndexPage() {
  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="eyebrow">Handboek Agent Communicatieprotocol</div>
      <h1 style={{ fontSize: "clamp(26px,3.5vw,38px)", margin: "12px 0 10px" }}>
        Het wetboek voor agent-verkeer
      </h1>
      <p className="muted" style={{ maxWidth: 640, marginBottom: 16 }}>
        Acht boeken regelen definities, risicoprofielen, sectorale reglementen, risiconormen, menselijk
        toezicht, verificatie en het inhuurprotocol. Elk normatief artikel is gekoppeld aan machine-leesbare
        velden in de Agent Card en wordt door het platform afgedwongen.
      </p>
      <p className="mono" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 36 }}>
        Gelaagdheid: kernhandboek (alle agents, alle sectoren) → sectorbijlagen (Boek III) →
        certificeringsdossier per agent · machine-leesbaar via{" "}
        <a href="/v1/handboek" style={{ color: "var(--teal-soft)" }}>GET /v1/handboek</a>
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {BOEKEN.map((boek) => {
          const artikelCount = boek.titels.reduce((n, t) => n + t.artikelen.length, 0);
          const inner = (
            <div className="card" style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center", opacity: boek.status === "gereserveerd" ? 0.65 : 1 }}>
              <div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
                  <span className="mono" style={{ fontSize: 13, color: "var(--copper-soft)" }}>Boek {boek.nr}</span>
                  {boek.status === "vastgesteld" && <span className="badge badge-ok">vastgesteld</span>}
                  {boek.status === "concept" && <span className="badge badge-warn">concept</span>}
                  {boek.status === "gereserveerd" && <span className="badge badge-neutral">gereserveerd</span>}
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>{boek.naam}</h3>
                {boek.considerans && (
                  <p style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 680 }}>
                    {boek.considerans.length > 220 ? `${boek.considerans.slice(0, 220)}…` : boek.considerans}
                  </p>
                )}
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>
                {artikelCount > 0 ? `${artikelCount} artikelen` : "—"}
              </div>
            </div>
          );
          return boek.status === "gereserveerd" ? (
            <div key={boek.slug}>{inner}</div>
          ) : (
            <Link key={boek.slug} href={`/handboek/${boek.slug}`}>{inner}</Link>
          );
        })}
      </div>

      <p className="mono" style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 32 }}>
        Ter interne uitwerking; behoeft juridische toetsing voorafgaand aan externe publicatie of gebruik in
        aansprakelijkheidsclausules.
      </p>
    </main>
  );
}

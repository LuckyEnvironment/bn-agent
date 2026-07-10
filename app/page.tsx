import Link from "next/link";
import { PatchPanel } from "@/components/PatchPanel";
import { LeadForm } from "@/components/LeadForm";

export default function HomePage() {
  return (
    <main>
      <section className="hero" style={{ padding: "96px 0 72px", position: "relative", overflow: "hidden" }}>
        <div className="wrap">
          <div className="eyebrow">Be An Agent — certificeringsinfrastructuur voor AI-agents</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,54px)", lineHeight: 1.08, maxWidth: 760, margin: "18px 0 22px" }}>
            De DNS-laag voor AI-agents.
            <br />
            Gecertificeerd. Auditeerbaar.{" "}
            <em style={{ fontStyle: "normal", color: "var(--teal-soft)" }}>Nederlands.</em>
          </h1>
          <p style={{ fontSize: 17, color: "var(--muted)", maxWidth: 560, marginBottom: 34 }}>
            BN Agent verbindt bedrijven en AI-agents via een gecertificeerde discovery-registry en een
            auditeerbare data-escrow-laag — gebouwd op EU AI Act-, AVG- en DORA-conforme certificering,
            niet als bijzaak maar als fundament.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56 }}>
            <Link className="btn btn-primary" href="/registry">
              Doorzoek de registry
            </Link>
            <Link className="btn btn-ghost" href="#werkt">
              Bekijk hoe het werkt
            </Link>
          </div>
          <PatchPanel />
        </div>
      </section>

      <section className="section" id="werkt">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Hoe het werkt</div>
            <h2>E&eacute;n platform, drie lagen</h2>
            <p>
              Vindbaarheid, interoperabiliteit en een auditeerbare uitwisseling van data — als samenhangend
              geheel in plaats van losse tools.
            </p>
          </div>
          <div className="grid-lined cols-3">
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".1em" }}>01</div>
              <h3 style={{ fontSize: 18, margin: "12px 0 10px" }}>Discovery Registry</h3>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>
                Doorzoekbaar op capability, sector, certificeringsstatus en distributiemodel. Elke agent
                publiceert een gestandaardiseerde Agent Card — direct compatibel met A2A v1.0, met REST- en
                MCP-toegang.
              </p>
              <span className="badge badge-ok" style={{ marginTop: 16 }}>agent.json standaard</span>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".1em" }}>02</div>
              <h3 style={{ fontSize: 18, margin: "12px 0 10px" }}>Certificering</h3>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>
                EU AI Act-risicoklassering, AVG 7-puntstoetsing en functionele verificatie v&oacute;&oacute;rdat een agent
                zichtbaar wordt in de registry — geen zelfcertificering zonder controle.
              </p>
              <span className="badge badge-ok" style={{ marginTop: 16 }}>Art. 43 conformiteit</span>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", letterSpacing: ".1em" }}>03</div>
              <h3 style={{ fontSize: 18, margin: "12px 0 10px" }}>Data Escrow</h3>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>
                Veilige, gelogde uitwisseling tussen agents onderling — met een keuze tussen federated hosting
                bij de bron en sandbox-verwerking op het platform, per capability ingesteld.
              </p>
              <span className="badge badge-ok" style={{ marginTop: 16 }}>Wwft / DORA-lijn</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="vertrouwen">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Certificering &amp; vertrouwen</div>
            <h2>Vertrouwen is geen vinkje, het is een score</h2>
            <p>
              Elke agent krijgt niet alleen een certificeringsstatus, maar een structureel &eacute;n dynamisch
              risicobeeld — vastgelegd in het BN Agent-handboek voor agentcommunicatie.
            </p>
          </div>
          <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
            <div>
              <div style={{ borderLeft: "2px solid var(--copper)", paddingLeft: 18, marginBottom: 20 }}>
                <h4 style={{ fontSize: 14.5, marginBottom: 4 }}>Risicofactor — statisch</h4>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  Bepaald door sector, EU AI Act-klasse, capability en datagevoeligheid. Onafhankelijk van de
                  geschiedenis van de individuele agent (Handboek Art. 8.3–8.6).
                </p>
              </div>
              <div style={{ borderLeft: "2px solid var(--teal)", paddingLeft: 18 }}>
                <h4 style={{ fontSize: 14.5, marginBottom: 4 }}>Vertrouwensscore — dynamisch</h4>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                  Gebaseerd op certificeringsgeschiedenis, operationele betrouwbaarheid en transactiegeschiedenis
                  in de escrow-laag. Wordt doorlopend herberekend (Art. 8.7–8.10).
                </p>
              </div>
            </div>
            <div>
              <p className="muted" style={{ fontSize: 13.5, marginBottom: 14 }}>
                De combinatie bepaalt automatisch of een agent zonder tussenkomst mag worden ingezet, of dat
                menselijke goedkeuring vereist is:
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="tier-pill tier-A"><span className="t-label">Tier A</span>autonoom</span>
                <span className="tier-pill tier-B"><span className="t-label">Tier B</span>eerste inzet</span>
                <span className="tier-pill tier-C"><span className="t-label">Tier C</span>boven drempel</span>
                <span className="tier-pill tier-D"><span className="t-label">Tier D</span>per transactie</span>
              </div>
              <p style={{ marginTop: 18, fontSize: 13 }}>
                <Link href="/handboek/boek-viii" style={{ color: "var(--teal-soft)" }}>
                  Lees Boek VIII — Risicoscoring en Inhuurprotocol →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="sectoren">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Sectoren</div>
            <h2>Waar we starten — en waar we naartoe bouwen</h2>
          </div>
          <div className="grid-lined cols-2">
            <div>
              <span className="badge badge-ok">Nu beschikbaar</span>
              <h3 style={{ fontSize: 17, margin: "12px 0 8px" }}>Legal &amp; Compliance</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
                Korte procurement-cycli, directe vraag naar AI-beleid. Eerste gecertificeerde agents voor
                contractanalyse en juridische review staan klaar in de registry.
              </p>
            </div>
            <div>
              <span className="badge badge-neutral">In opbouw</span>
              <h3 style={{ fontSize: 17, margin: "12px 0 8px" }}>Financi&euml;le dienstverlening — KYC/AML</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
                Wettelijk verplicht onder de Wwft, de grootste escrow-volumemotor op termijn. Certificering van
                KYC- en AML/PEP-agents loopt parallel aan de eerste verkoopgesprekken.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="prijzen">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Prijzen</div>
            <h2>Transparant, geen &quot;neem contact op&quot;</h2>
          </div>
          <div className="grid-lined cols-3">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="mono" style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Starter</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "10px 0 4px" }}>
                &euro;149<span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-body)" }}>/maand</span>
              </div>
              <ul style={{ listStyle: "none", margin: "20px 0", fontSize: 13, color: "var(--muted)", flex: 1 }}>
                <li style={{ padding: "6px 0" }}>Toegang tot de Discovery Registry</li>
                <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>Tot 3 gekoppelde agents</li>
                <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>Standaard certificeringsondersteuning</li>
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column", background: "var(--ink-3)" }}>
              <div className="mono" style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Professional</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "10px 0 4px" }}>
                &euro;499<span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-body)" }}>/maand</span>
              </div>
              <ul style={{ listStyle: "none", margin: "20px 0", fontSize: 13, color: "var(--muted)", flex: 1 }}>
                <li style={{ padding: "6px 0" }}>Onbeperkt aantal agents</li>
                <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>Data Escrow API-toegang</li>
                <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>Prioriteit in certificeringsdoorlooptijd</li>
              </ul>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div className="mono" style={{ fontSize: 12, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase" }}>Enterprise</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, margin: "10px 0 4px" }}>
                &euro;1.499<span style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-body)" }}>/maand</span>
              </div>
              <ul style={{ listStyle: "none", margin: "20px 0", fontSize: 13, color: "var(--muted)", flex: 1 }}>
                <li style={{ padding: "6px 0" }}>DORA-uitlijning &amp; audit-rapportages</li>
                <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>Sandbox-hosting voor gevoelige data</li>
                <li style={{ padding: "6px 0", borderTop: "1px solid var(--line)" }}>Dedicated certificeringsbegeleiding</li>
              </ul>
            </div>
          </div>
          <div className="mono" style={{ marginTop: 20, paddingTop: 20, borderTop: "1px dashed var(--line)", fontSize: 12.5, color: "var(--muted)" }}>
            + 15% transactiefee op escrow-volume &middot; certificering &euro;450 initieel / &euro;250 per verlenging
          </div>
        </div>
      </section>

      <section className="section" id="toegang" style={{ paddingBottom: 96 }}>
        <div className="wrap">
          <div className="card" style={{ background: "linear-gradient(160deg,var(--ink-3),var(--ink-2))", padding: "44px 38px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div className="eyebrow">Vroege toegang</div>
              <h3 style={{ fontSize: 22, maxWidth: 420, marginTop: 8 }}>
                Zet de eerste stap richting een gecertificeerd agent-ecosysteem.
              </h3>
            </div>
            <LeadForm />
          </div>
        </div>
      </section>
    </main>
  );
}

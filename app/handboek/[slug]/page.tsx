import Link from "next/link";
import { notFound } from "next/navigation";
import { BOEKEN, getBoek } from "@/lib/handboek/data";

export function generateStaticParams() {
  return BOEKEN.filter((b) => b.status !== "gereserveerd").map((b) => ({ slug: b.slug }));
}

export default async function BoekPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const boek = getBoek(slug);
  if (!boek || boek.status === "gereserveerd") notFound();

  const index = BOEKEN.filter((b) => b.status !== "gereserveerd");
  const pos = index.findIndex((b) => b.slug === boek.slug);
  const prev = pos > 0 ? index[pos - 1] : null;
  const next = pos < index.length - 1 ? index[pos + 1] : null;

  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 56, maxWidth: 860 }}>
      <p className="mono" style={{ fontSize: 12, marginBottom: 18 }}>
        <Link href="/handboek" style={{ color: "var(--muted)" }}>Handboek</Link>
        <span className="muted"> / Boek {boek.nr}</span>
      </p>

      <div className="eyebrow">Boek {boek.nr} · {boek.status}</div>
      <h1 style={{ fontSize: "clamp(24px,3vw,34px)", margin: "12px 0 18px" }}>{boek.naam}</h1>

      {boek.considerans && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--copper-soft)", marginBottom: 8 }}>
            Considerans
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>{boek.considerans}</p>
        </div>
      )}

      <div className="wetboek">
        {boek.titels.map((titel) => (
          <section key={titel.nr}>
            <h2 className="titel">
              <span className="mono" style={{ fontSize: 13, color: "var(--copper-soft)", marginRight: 10 }}>
                Titel {titel.nr}
              </span>
              {titel.naam}
            </h2>
            {titel.artikelen.map((artikel) => (
              <article key={artikel.nr} className="artikel" id={`art-${artikel.nr}`}>
                <h3>
                  <span className="artnr">Art. {artikel.nr}</span>
                  {artikel.titel}
                </h3>
                <ol className="leden">
                  {artikel.leden.map((lid, i) => (
                    <li key={i}>{lid}</li>
                  ))}
                </ol>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {artikel.machineFields?.map((f) => (
                    <span key={f} className="machinelink" title="Machine-leesbaar veld in de Agent Card">
                      {f}
                    </span>
                  ))}
                  {artikel.verwijzingen?.map((v) => {
                    const target = v.match(/Art\. (\d+)\./)?.[1];
                    const slugMap: Record<string, string> = {
                      "1": "boek-i", "2": "boek-ii", "3": "boek-iii", "4": "boek-iv",
                      "5": "boek-v", "6": "boek-vi", "8": "boek-viii",
                    };
                    const anchor = v.match(/Art\. (\d+\.\d+)/)?.[1];
                    const href = target && slugMap[target] ? `/handboek/${slugMap[target]}#art-${anchor}` : "/handboek";
                    return (
                      <Link key={v} href={href} className="machinelink" style={{ color: "var(--teal-soft)" }}>
                        → {v}
                      </Link>
                    );
                  })}
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 56, gap: 12, flexWrap: "wrap" }}>
        {prev ? (
          <Link className="btn btn-ghost btn-sm" href={`/handboek/${prev.slug}`}>
            ← Boek {prev.nr} — {prev.naam}
          </Link>
        ) : <span />}
        {next ? (
          <Link className="btn btn-ghost btn-sm" href={`/handboek/${next.slug}`}>
            Boek {next.nr} — {next.naam} →
          </Link>
        ) : <span />}
      </div>
    </main>
  );
}

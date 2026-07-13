"use client";

import { useEffect, useState } from "react";
import type { AuditEntry } from "@/lib/audit-data";

type Cell = "pending" | "ok" | "broken";

async function sha256hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Herrekent de hashketen live in de browser (crypto.subtle) tegen
 * entry_hash = SHA-256(transaction_id | timestamp | prev_entry_hash||"genesis").
 */
export function AuditVerifier({ entries }: { entries: AuditEntry[] }) {
  const [cells, setCells] = useState<Cell[]>(() => entries.map(() => "pending"));
  const [chain, setChain] = useState<Cell>("pending");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: Cell[] = [];
      let prev: string | null = null;
      let ok = true;
      for (const e of entries) {
        const expect = await sha256hex(
          `${e.log_header.transaction_id}|${e.log_header.timestamp}|${prev || "genesis"}`,
        );
        const valid =
          expect === e.integrity_chain.entry_hash &&
          (e.integrity_chain.prev_entry_hash || null) === prev;
        out.push(valid ? "ok" : "broken");
        if (!valid) ok = false;
        prev = e.integrity_chain.entry_hash;
      }
      if (!cancelled) {
        setCells(out);
        setChain(ok ? "ok" : "broken");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entries]);

  const okCount = cells.filter((c) => c === "ok").length;

  return (
    <>
      <div
        className="card"
        style={{ marginBottom: 24, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
      >
        <span className="eyebrow" style={{ margin: 0 }}>Ketenverificatie</span>
        {chain === "pending" && <span className="badge"><span className="dot" />bezig met naverekenen&hellip;</span>}
        {chain === "ok" && (
          <span className="badge badge-ok"><span className="dot" />keten geldig — {okCount}/{entries.length} entries</span>
        )}
        {chain === "broken" && (
          <span className="badge badge-bad"><span className="dot" />keten gebroken — {okCount}/{entries.length} geldig</span>
        )}
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>
          entry_hash = SHA-256(transaction_id | timestamp | prev_entry_hash)
        </span>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {entries.map((e, i) => {
          const c = cells[i];
          const ch = e.integrity_chain;
          const ci = e.compliance_integrity;
          return (
            <div key={ch.entry_hash} className="card">
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: 13 }}>{e.log_header.transaction_id}</span>
                {c === "pending" && <span className="badge">&hellip;</span>}
                {c === "ok" && <span className="badge badge-ok"><span className="dot" />hash geldig</span>}
                {c === "broken" && <span className="badge badge-bad"><span className="dot" />hash gebroken</span>}
                <span className="mono" style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>
                  {new Date(e.log_header.timestamp).toLocaleString("nl-NL")} · {e.log_header.environment}
                </span>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 11.5,
                  color: "var(--muted)",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
                  gap: "6px 18px",
                }}
              >
                <span>agent: {e.identities.agent.agent_id} v{e.identities.agent.version}</span>
                <span>organisatie: {e.identities.organization_id}</span>
                <span>EU AI Act: {ci.ai_act_risk_category}</span>
                <span>DORA: {ci.dora_incident_status}</span>
                <span>HITL-gate: {e.human_in_the_loop.hitl_gate_triggered ? "geactiveerd" : "n.v.t."}</span>
                <span>PII-masking: {ci.pii_masking_applied ? "toegepast" : "n.v.t."}</span>
                <span>responstijd: {e.system_integrity.response_time_ms} ms</span>
              </div>
              <p className="mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, wordBreak: "break-all" }}>
                entry_hash: {ch.entry_hash}
                <br />
                prev: {ch.prev_entry_hash || "genesis"}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

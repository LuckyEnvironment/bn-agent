"use client";

import { useState } from "react";

export function LeadForm() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("busy");
    try {
      const res = await fetch("/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: data.get("companyName"),
          email: data.get("email"),
          sectorCode: data.get("sectorCode"),
        }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mono" style={{ color: "var(--teal-soft)", fontSize: 14 }}>
        Aanvraag ontvangen — we nemen contact op.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap", minWidth: 280 }}>
      <input className="input" name="companyName" type="text" placeholder="Bedrijfsnaam" required style={{ flex: 1, minWidth: 180 }} />
      <input className="input" name="email" type="email" placeholder="E-mailadres" required style={{ flex: 1, minWidth: 180 }} />
      <select className="select" name="sectorCode" defaultValue="legal">
        <option value="legal">Sector — Legal &amp; Compliance</option>
        <option value="financial_services">Sector — Financi&euml;le dienstverlening</option>
        <option value="general">Sector — Anders</option>
      </select>
      <button className="btn btn-primary" type="submit" disabled={state === "busy"}>
        {state === "busy" ? "Versturen..." : "Vraag toegang aan"}
      </button>
      {state === "error" && (
        <p className="mono" style={{ color: "var(--red)", fontSize: 12, width: "100%" }}>
          Versturen mislukt — probeer het opnieuw.
        </p>
      )}
    </form>
  );
}

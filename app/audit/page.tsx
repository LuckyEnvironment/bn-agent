import { BN_AUDIT_LOG } from "@/lib/audit-data";
import { AuditVerifier } from "@/components/AuditVerifier";

export const dynamic = "force-dynamic";

/**
 * WORM-audittrail (demo). Toont een append-only logboek met vier waarborgen per
 * transactie; de hashketen wordt client-side naverrekend. Demodata — er is nog
 * geen live audit-backend (server/audit.ts bestaat, maar geen publieke route).
 */
export default function AuditPage() {
  return (
    <main className="wrap" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div className="eyebrow">WORM-audittrail</div>
      <h1 style={{ fontSize: "clamp(26px,3.5vw,38px)", margin: "12px 0 10px" }}>
        Onwijzigbaar audittrail met naverekenbare hashketen
      </h1>
      <p className="muted" style={{ maxWidth: 660, marginBottom: 30 }}>
        Elke transactie levert een append-only logregel met vier waarborgen — identiteit, dataherkomst,
        compliance en systeemintegriteit. De hashketen wordt hieronder live in je browser naverrekend
        (<span className="mono">crypto.subtle</span>). Dit is demodata; er is nog geen live audit-backend.
      </p>
      <AuditVerifier entries={BN_AUDIT_LOG} />
    </main>
  );
}

import { escrowLiveProcessing } from "@/lib/flags";
import { supabaseAnon, supabaseService } from "@/lib/supabase";
import { appendAudit } from "./audit";
import type { Caller } from "./auth";

/**
 * Escrow-laag — logisch gescheiden service (eigen routes; latere fysieke
 * scheiding is een deploy-beslissing). Implementeert de toelaatbaarheids-
 * en toestemmingslogica van Boek VIII Titel 5/6.
 *
 * VEILIGHEIDSKLEP: zolang ESCROW_LIVE_PROCESSING=false wordt géén
 * cliëntgevoelige payload verwerkt of opgeslagen — uitsluitend metadata,
 * tiering en audit. Zie lib/flags.ts.
 */

export interface EscrowSubmission {
  agentId: string;
  requestMeta: Record<string, unknown>;
  approvalId?: string;
  aboveThreshold?: boolean;
}

export class EscrowError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly articles: string[] = [],
  ) {
    super(message);
  }
}

export async function submitEscrowRequest(input: EscrowSubmission, caller: Caller) {
  const { data: agent, error } = await supabaseAnon()
    .from("bna_agents")
    .select(
      "id, slug, status, certified, escrow_supported, suspended, inhuur_tier, required_consent_level, risk_factor_score, trust_score",
    )
    .eq("id", input.agentId)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new EscrowError(error.message, 500);
  if (!agent) throw new EscrowError("Agent niet gevonden of niet gepubliceerd", 404);

  // Art. 8.13 — algemene toelaatbaarheidsvoorwaarden
  if (agent.suspended) {
    throw new EscrowError(
      "Agent is geschorst en kan niet worden ingehuurd",
      403,
      ["Art. 8.28 lid 1"],
    );
  }
  if (!agent.certified) {
    throw new EscrowError(
      "Agent heeft geen geldige certificering conform Boek IV en Boek VI",
      403,
      ["Art. 8.13 lid 1 sub a"],
    );
  }
  if (!agent.escrow_supported) {
    throw new EscrowError("Agent ondersteunt geen escrow-verkeer", 422);
  }

  // Titel 6 — verplichte toetsingsmomenten
  const tier = agent.inhuur_tier as "A" | "B" | "C" | "D";
  const needsConsent =
    tier === "D" || (tier === "C" && input.aboveThreshold !== false);

  const db = supabaseService();
  let approvalValid = false;
  if (input.approvalId) {
    const { data: approval } = await db
      .from("bna_approvals")
      .select("id, agent_id, client_id")
      .eq("id", input.approvalId)
      .eq("agent_id", agent.id)
      .maybeSingle();
    approvalValid =
      Boolean(approval) &&
      (!approval!.client_id || approval!.client_id === caller.clientId);
  }

  const blocked = needsConsent && !approvalValid;
  const live = escrowLiveProcessing();

  const status = blocked
    ? "blocked_awaiting_consent"
    : live
      ? "processed"
      : "accepted_not_processed";

  const { data: tx, error: txError } = await db
    .from("bna_escrow_transactions")
    .insert({
      agent_id: agent.id,
      client_id: caller.clientId ?? null,
      status,
      live_processing: live && !blocked,
      request_meta: input.requestMeta,
      payload_ref: null, // payloads worden pas bij live verwerking opgeslagen
      consent_approval_id: approvalValid ? input.approvalId : null,
      tier_at_submission: tier,
    })
    .select("id, status, created_at")
    .single();
  if (txError) throw new EscrowError(txError.message, 500);

  await appendAudit({
    actorType: "api_client",
    actorId: caller.clientIdentifier ?? "onbekend",
    action: `escrow.transaction.${status}`,
    subjectType: "escrow_transaction",
    subjectId: tx.id,
    payload: {
      agentId: agent.id,
      tier,
      liveProcessing: live && !blocked,
      approvalId: approvalValid ? input.approvalId : null,
    },
  });

  return {
    transactionId: tx.id,
    status: tx.status,
    tier,
    liveProcessing: live && !blocked,
    ...(blocked && {
      requiredConsentLevel: agent.required_consent_level,
      consentInstruction:
        tier === "D"
          ? "Voorafgaande, uitdrukkelijke goedkeuring per transactie vereist (Art. 8.16 lid 1); registreer de goedkeuring via POST /v1/escrow/approvals en dien opnieuw in met approvalId."
          : "Goedkeuring vereist voor transacties boven de drempel (Art. 8.15 lid 2); registreer de goedkeuring via POST /v1/escrow/approvals en dien opnieuw in met approvalId.",
      articles:
        tier === "D"
          ? ["Art. 8.16 lid 1", "Art. 8.19", "Art. 8.20"]
          : ["Art. 8.15 lid 2", "Art. 8.20"],
    }),
    ...(!blocked &&
      !live && {
        notice:
          "ESCROW_LIVE_PROCESSING staat uit: het verzoek is aangenomen, getierd en gelogd, maar de payload is niet verwerkt of opgeslagen.",
      }),
  };
}

/** Art. 8.20 — vastlegging van toestemming door een bevoegd persoon. */
export async function recordApproval(
  input: {
    agentId: string;
    approvedByName: string;
    approvedByRole: string;
    approvalScope: "eerste_inhuur" | "transactie" | "drempel";
  },
  caller: Caller,
) {
  const { data: agent } = await supabaseAnon()
    .from("bna_agents")
    .select("id, inhuur_tier, risk_factor_score, trust_score")
    .eq("id", input.agentId)
    .eq("status", "published")
    .maybeSingle();
  if (!agent) throw new EscrowError("Agent niet gevonden", 404);

  const db = supabaseService();
  const { data: approval, error } = await db
    .from("bna_approvals")
    .insert({
      agent_id: agent.id,
      client_id: caller.clientId ?? null,
      approved_by_name: input.approvedByName,
      approved_by_role: input.approvedByRole,
      approval_scope: input.approvalScope,
      tier_at_approval: agent.inhuur_tier,
      risk_factor_at_approval: agent.risk_factor_score,
      trust_score_at_approval: agent.trust_score,
    })
    .select("id, created_at")
    .single();
  if (error) throw new EscrowError(error.message, 500);

  // Art. 8.20 lid 2 — opname in het append-only auditlog
  await appendAudit({
    actorType: "api_client",
    actorId: caller.clientIdentifier ?? "onbekend",
    action: "escrow.approval.recorded",
    subjectType: "approval",
    subjectId: approval.id,
    payload: {
      agentId: agent.id,
      approvedBy: input.approvedByName,
      role: input.approvedByRole,
      scope: input.approvalScope,
      tierAtApproval: agent.inhuur_tier,
      riskFactorAtApproval: agent.risk_factor_score,
      trustScoreAtApproval: agent.trust_score,
    },
  });

  return { approvalId: approval.id, recordedAt: approval.created_at };
}

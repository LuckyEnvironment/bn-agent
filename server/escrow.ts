import { escrowLiveProcessing } from "@/lib/flags";
import { supabaseAnon, supabaseService } from "@/lib/supabase";
import { appendAudit } from "./audit";
import { computeMandate, debitBudget, type BudgetDecision, type InhuurTier } from "./budget";
import type { Caller } from "./auth";

/**
 * Escrow-laag — logisch gescheiden service (eigen routes; latere fysieke
 * scheiding is een deploy-beslissing). Implementeert de toelaatbaarheids-
 * en toestemmingslogica van Boek VIII Titel 5/6 en het dynamisch mandaat
 * van Titel 11 (Dynamic Autonomous Escrow).
 *
 * Autonomie is de standaard: binnen het realtime mandaat (Tier × α) wordt
 * elke transactie direct uitgevoerd, zonder toetsingsmoment vooraf
 * (Art. 8.32). Pas bij uitputting of overschrijding schakelt de flow naar
 * asynchrone menselijke validatie via het bestaande approvals-mechanisme
 * (Art. 8.33 jo. 8.20). De drempel wordt server-side gemeten — het eerdere
 * caller-declared `aboveThreshold` is vervangen: de gecontroleerde partij
 * verklaart niet langer zelf of hij boven de drempel zit.
 *
 * VEILIGHEIDSKLEP: zolang ESCROW_LIVE_PROCESSING=false wordt géén
 * cliëntgevoelige payload verwerkt of opgeslagen — uitsluitend metadata,
 * tiering, mandaatadministratie en audit. Zie lib/flags.ts.
 */

export interface EscrowSubmission {
  agentId: string;
  requestMeta: Record<string, unknown>;
  approvalId?: string;
  /** Transactiebedrag in centen; 0 voor niet-financiële leveringen. */
  amountCents?: number;
  /** Omvang van de (aangekondigde) gevoelige payload in bytes. */
  payloadBytes?: number;
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

  const tier = agent.inhuur_tier as InhuurTier;
  const amountCents = Math.max(0, Math.round(input.amountCents ?? 0));
  const payloadBytes = Math.max(0, Math.round(input.payloadBytes ?? 0));

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

  // Art. 8.31 — het mandaat is een afgeleide van Tier × α(Vertrouwensscore).
  const mandate = computeMandate(tier, agent.trust_score, true);

  // Tier D: menselijke goedkeuring per individuele transactie, zonder
  // uitzondering (Art. 8.15 lid 3) — mandaat 0 is hier norm, geen instelling.
  // Voor A/B/C is autonomie de standaard: alleen de mandaatmeting kan een
  // transactie nog naar het validatiepad sturen (Art. 8.32/8.33). Een geldige
  // approval ís die validatie en passeert de bucket zonder afboeking.
  let budget: BudgetDecision | null = null;
  if (tier !== "D" && !approvalValid) {
    budget = await debitBudget(agent.id, mandate, amountCents, payloadBytes);
  }

  const blocked = tier === "D" ? !approvalValid : budget ? !budget.granted : false;
  const live = escrowLiveProcessing();

  const status = blocked
    ? tier === "D"
      ? "blocked_awaiting_consent"
      : "blocked_budget_exceeded"
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
      amount_cents: amountCents,
      payload_bytes: payloadBytes,
      mandate_at_submission: { mandate, budget },
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
      amountCents,
      payloadBytes,
      mandate,
      ...(budget && { budget }),
    },
  });

  return {
    transactionId: tx.id,
    status: tx.status,
    tier,
    liveProcessing: live && !blocked,
    mandate,
    ...(budget && {
      budget: {
        granted: budget.granted,
        financialRemainingCents: budget.financialRemainingCents,
        dataRemainingBytes: budget.dataRemainingBytes,
        ...(budget.retryAfterSeconds !== null && {
          retryAfterSeconds: budget.retryAfterSeconds,
        }),
      },
    }),
    ...(blocked &&
      tier === "D" && {
        requiredConsentLevel: agent.required_consent_level,
        consentInstruction:
          "Voorafgaande, uitdrukkelijke goedkeuring per transactie vereist (Art. 8.15 lid 3); registreer de goedkeuring via POST /v1/escrow/approvals en dien opnieuw in met approvalId.",
        articles: ["Art. 8.15 lid 3", "Art. 8.19", "Art. 8.20"],
      }),
    ...(blocked &&
      tier !== "D" && {
        requiredConsentLevel: agent.required_consent_level,
        consentInstruction:
          budget!.retryAfterSeconds !== null
            ? `Uurmandaat tijdelijk uitgeput (${budget!.reason}); dien opnieuw in na ${budget!.retryAfterSeconds} seconden, of laat een bevoegd persoon valideren via POST /v1/escrow/approvals (scope 'drempel') en dien opnieuw in met approvalId.`
            : `Transactie overschrijdt het mandaat (${budget!.reason}); asynchrone menselijke validatie vereist via POST /v1/escrow/approvals (scope 'drempel'), daarna opnieuw indienen met approvalId.`,
        articles: ["Art. 8.32", "Art. 8.33", "Art. 8.20"],
      }),
    ...(!blocked &&
      !live && {
        notice:
          "ESCROW_LIVE_PROCESSING staat uit: het verzoek is aangenomen, getierd, binnen het mandaat afgeboekt en gelogd, maar de payload is niet verwerkt of opgeslagen.",
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

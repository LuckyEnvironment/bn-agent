import { supabaseAnon, supabaseService } from "@/lib/supabase";

/**
 * Dynamic Autonomous Escrow (DEB) — Boek VIII Titel 11 (Art. 8.31–8.34).
 *
 * Elke inzetbare agent krijgt een realtime risicomandaat, afgeleid van
 * Inhuurtier × α(Vertrouwensscore). Binnen het mandaat handelt de agent
 * volledig autonoom (Art. 8.32); menselijke validatie is de uitzondering
 * bij uitputting of overschrijding, nooit de standaard (Art. 8.33).
 *
 * Beleid leeft hier (basisbedragen, alpha, refill); het atomaire
 * token-bucket-mechanisme leeft in Postgres (bna_budget_debit, migratie
 * 0003) zodat parallelle aanroepen nooit dubbel afboeken.
 *
 * Tier D heeft mandaat 0: Art. 8.15 lid 3 schrijft menselijke goedkeuring
 * per individuele transactie voor, zonder uitzondering. Autonomie voor
 * Tier D vereist eerst een wijziging van het Handboek, niet van deze code.
 */

export type InhuurTier = "A" | "B" | "C" | "D";

export class BudgetError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly articles: string[] = [],
  ) {
    super(message);
  }
}

/** Basismandaat per tier (Art. 8.31 lid 2); effectief = basis × α. */
const MANDATE_BASE: Record<
  InhuurTier,
  { perTxCents: number; perHourCents: number; dataBytesPerMinute: number }
> = {
  A: { perTxCents: 100_000, perHourCents: 1_000_000, dataBytesPerMinute: 268_435_456 },
  B: { perTxCents: 50_000, perHourCents: 500_000, dataBytesPerMinute: 134_217_728 },
  C: { perTxCents: 10_000, perHourCents: 100_000, dataBytesPerMinute: 33_554_432 },
  D: { perTxCents: 0, perHourCents: 0, dataBytesPerMinute: 0 },
};

export interface Mandate {
  financialPerTxCents: number;
  financialPerHourCents: number;
  dataBytesPerMinute: number;
  alpha: number;
  computedAt: string;
}

/**
 * Art. 8.31 lid 3: α is een afleiding van de bestaande Vertrouwensscore
 * (Art. 8.8) — géén eigen reputatiecurve. "Direct naar nul" bestaat al en
 * heet schorsing (Art. 8.27): een niet-inzetbare agent krijgt mandaat 0.
 */
export function computeMandate(
  tier: InhuurTier,
  trustScore: number,
  eligible: boolean,
): Mandate {
  const alpha = eligible ? Math.min(100, Math.max(0, trustScore)) / 100 : 0;
  const base = MANDATE_BASE[tier];
  return {
    financialPerTxCents: Math.floor(base.perTxCents * alpha),
    financialPerHourCents: Math.floor(base.perHourCents * alpha),
    dataBytesPerMinute: Math.floor(base.dataBytesPerMinute * alpha),
    alpha,
    computedAt: new Date().toISOString(),
  };
}

export interface BudgetDecision {
  granted: boolean;
  financialRemainingCents: number;
  dataRemainingBytes: number;
  /** Seconden tot hervulling volstaat; null = hervulling volstaat nooit. */
  retryAfterSeconds: number | null;
  /** true zodra alleen asynchrone menselijke validatie de transactie nog vrijgeeft. */
  requiresValidation: boolean;
  reason?: string;
}

interface DebitRow {
  granted: boolean;
  financial_remaining_cents: number;
  data_remaining_bytes: number;
  retry_after_seconds: number | null;
}

async function rpcDebit(
  agentId: string,
  mandate: Mandate,
  amountCents: number,
  payloadBytes: number,
): Promise<DebitRow> {
  const { data, error } = await supabaseService().rpc("bna_budget_debit", {
    p_agent_id: agentId,
    p_amount_cents: amountCents,
    p_bytes: payloadBytes,
    p_fin_capacity: mandate.financialPerHourCents,
    p_fin_refill_per_sec: mandate.financialPerHourCents / 3600,
    p_data_capacity: mandate.dataBytesPerMinute,
    p_data_refill_per_sec: mandate.dataBytesPerMinute / 60,
  });
  if (error) throw new BudgetError(error.message, 500);
  return data as DebitRow;
}

/**
 * Art. 8.32/8.33 — atomaire mandaatcheck. Volgorde:
 * 1. per-transactielimiet (hervulling helpt hier nooit → direct validatiepad);
 * 2. token bucket (uur- en datadimensie) met continue hervulling.
 */
export async function debitBudget(
  agentId: string,
  mandate: Mandate,
  amountCents: number,
  payloadBytes: number,
): Promise<BudgetDecision> {
  if (amountCents > mandate.financialPerTxCents) {
    const state = await rpcDebit(agentId, mandate, 0, 0); // alleen verversen/aflezen
    return {
      granted: false,
      financialRemainingCents: state.financial_remaining_cents,
      dataRemainingBytes: state.data_remaining_bytes,
      retryAfterSeconds: null,
      requiresValidation: true,
      reason: `bedrag overschrijdt het per-transactiemandaat (${mandate.financialPerTxCents} cent)`,
    };
  }
  const row = await rpcDebit(agentId, mandate, amountCents, payloadBytes);
  return {
    granted: row.granted,
    financialRemainingCents: row.financial_remaining_cents,
    dataRemainingBytes: row.data_remaining_bytes,
    retryAfterSeconds: row.granted ? null : row.retry_after_seconds,
    requiresValidation: !row.granted && row.retry_after_seconds === null,
    ...(row.granted
      ? {}
      : {
          reason:
            row.retry_after_seconds === null
              ? "aanvraag overschrijdt de mandaatcapaciteit"
              : "uurmandaat tijdelijk uitgeput; hervulling loopt",
        }),
  };
}

/** GET /v1/escrow/budget/{agentId} — realtime mandaat en saldo. */
export async function getBudgetStatus(agentId: string) {
  const { data: agent, error } = await supabaseAnon()
    .from("bna_agents")
    .select("id, certified, suspended, inhuur_tier, trust_score")
    .eq("id", agentId)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new BudgetError(error.message, 500);
  if (!agent) throw new BudgetError("Agent niet gevonden of niet gepubliceerd", 404);

  const tier = (agent.inhuur_tier ?? "D") as InhuurTier;
  const eligible = Boolean(agent.certified) && !agent.suspended;
  const mandate = computeMandate(tier, agent.trust_score, eligible);
  const state = await rpcDebit(agent.id, mandate, 0, 0); // verversen zonder afboeking

  return {
    agentId: agent.id,
    tier,
    eligible,
    mandate,
    remaining: {
      financialCents: state.financial_remaining_cents,
      dataBytes: state.data_remaining_bytes,
    },
    ...(tier === "D" && {
      notice:
        "Tier D kent geen autonoom mandaat: menselijke goedkeuring per transactie (Art. 8.15 lid 3).",
    }),
    ...(!eligible && {
      notice: "Agent is geschorst of niet gecertificeerd: mandaat is 0 (Art. 8.28).",
    }),
  };
}

import { canonicalize, computeCardHash } from "@/lib/canonical";
import {
  buildAgentCard,
  type AgentRow,
  type CapabilityRow,
  type CertificationRow,
  type VendorRow,
} from "@/lib/agent-card";
import {
  computeRiskScoring,
  UnacceptableRiskError,
  type EuAiActClass,
  type RiskScoringBlock,
} from "@/lib/risk";
import { signClaims, signingConfigured } from "@/lib/signing";
import { supabaseAnon, supabaseService } from "@/lib/supabase";
import { validateAgentCard } from "@/lib/validate";
import { filterCardForTier, type AccessTier } from "@/lib/visibility";
import { baseUrl } from "@/lib/flags";
import { appendAudit } from "./audit";
import type { Caller } from "./auth";

/**
 * Discovery Registry — businesslogica. Eén implementatie, aangeroepen door
 * zowel de REST-laag (/v1/registry/...) als de MCP-tools; geen duplicatie.
 * Leesoperaties lopen via de anon-client (RLS: alleen gepubliceerd);
 * schrijfoperaties via de service-client na autorisatie in de API-laag.
 */

export interface SearchFilters {
  q?: string;
  capability_category?: string;
  sector?: string;
  distribution_model?: "koop" | "lease";
  certified?: boolean;
  eu_ai_act_class?: EuAiActClass;
  escrow_supported?: boolean;
  limit?: number;
  offset?: number;
}

const AGENT_SUMMARY_COLUMNS =
  "id, slug, name, description, version, distribution_model, sector_code, eu_ai_act_class, certified, escrow_supported, risk_factor_class, trust_score, inhuur_tier, required_consent_level, suspended, updated_at";

export async function searchAgents(filters: SearchFilters) {
  const db = supabaseAnon();
  let query = db
    .from("bna_agents")
    .select(
      filters.capability_category
        ? `${AGENT_SUMMARY_COLUMNS}, bna_agent_capabilities!inner(category_code)`
        : AGENT_SUMMARY_COLUMNS,
      { count: "exact" },
    )
    .eq("status", "published");

  if (filters.capability_category) {
    query = query.eq(
      "bna_agent_capabilities.category_code",
      filters.capability_category,
    );
  }
  if (filters.sector) query = query.eq("sector_code", filters.sector);
  if (filters.distribution_model)
    query = query.eq("distribution_model", filters.distribution_model);
  if (filters.certified !== undefined)
    query = query.eq("certified", filters.certified);
  if (filters.eu_ai_act_class)
    query = query.eq("eu_ai_act_class", filters.eu_ai_act_class);
  if (filters.escrow_supported !== undefined)
    query = query.eq("escrow_supported", filters.escrow_supported);
  if (filters.q) {
    const safe = filters.q.replace(/[%_,()]/g, " ").trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  const limit = Math.min(filters.limit ?? 25, 100);
  const offset = filters.offset ?? 0;
  const { data, error, count } = await query
    .order("trust_score", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(`Registry-zoekopdracht mislukt: ${error.message}`);

  return {
    total: count ?? 0,
    limit,
    offset,
    agents: (data ?? []).map((a) => {
      const { bna_agent_capabilities: _drop, ...rest } =
        a as unknown as Record<string, unknown> & { bna_agent_capabilities?: unknown };
      return rest;
    }),
  };
}

interface FullAgent {
  agent: AgentRow;
  vendor: VendorRow;
  capabilities: CapabilityRow[];
  certification: CertificationRow | null;
}

async function loadFullAgent(idOrSlug: string): Promise<FullAgent | null> {
  const db = supabaseAnon();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  const { data: agent, error } = await db
    .from("bna_agents")
    .select("*")
    .eq(isUuid ? "id" : "slug", idOrSlug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`Agent laden mislukt: ${error.message}`);
  if (!agent) return null;

  const [vendorRes, capsRes, certRes] = await Promise.all([
    db.from("bna_vendors").select("id, name, country, website, kvk_number").eq("id", agent.vendor_id).single(),
    db.from("bna_agent_capabilities").select("*").eq("agent_id", agent.id).order("created_at"),
    db
      .from("bna_certifications")
      .select("*")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (vendorRes.error) throw new Error(vendorRes.error.message);
  if (capsRes.error) throw new Error(capsRes.error.message);

  return {
    agent: agent as AgentRow,
    vendor: vendorRes.data as VendorRow,
    capabilities: (capsRes.data ?? []) as CapabilityRow[],
    certification: (certRes.data ?? null) as CertificationRow | null,
  };
}

function riskScoringFromRow(agent: AgentRow): RiskScoringBlock {
  return {
    riskFactorScore: agent.risk_factor_score ?? 0,
    riskFactorClass: agent.risk_factor_class ?? "laag",
    riskFactorComponents: {
      sector: agent.risk_factor_components?.sector ?? 0,
      euAiActClass: agent.risk_factor_components?.euAiActClass ?? 0,
      capabilityCategory: agent.risk_factor_components?.capabilityCategory ?? 0,
      dataSensitivity: agent.risk_factor_components?.dataSensitivity ?? 0,
      autonomyLevel: agent.risk_factor_components?.autonomyLevel ?? 0,
    },
    trustScore: agent.trust_score,
    trustScoreLastCalculated: agent.trust_score_last_calculated,
    inhuurTier: agent.inhuur_tier ?? "D",
    applicableArticles: agent.applicable_articles,
    requiredConsentLevel:
      agent.required_consent_level as RiskScoringBlock["requiredConsentLevel"],
    suspended: agent.suspended,
    ...(agent.suspension_reason && { suspensionReason: agent.suspension_reason }),
  };
}

/** Levert de Agent Card, gefilterd op zichtbaarheidsniveau van de aanroeper. */
export async function getAgentCard(idOrSlug: string, tier: AccessTier) {
  const full = await loadFullAgent(idOrSlug);
  if (!full) return null;

  // De opgeslagen card is de ondertekende, canonieke waarheid. Als een agent
  // via seed/beheer zonder card is opgevoerd, wordt hij hier opgebouwd.
  const card =
    full.agent.card && Object.keys(full.agent.card).length > 0
      ? full.agent.card
      : buildAgentCard({
          ...full,
          riskScoring: riskScoringFromRow(full.agent),
          registryBaseUrl: baseUrl(),
        });

  return {
    card: filterCardForTier(card as Record<string, unknown>, tier),
    cardHash: full.agent.card_hash,
    signature: full.agent.card_signature,
    signedAt: full.agent.card_signed_at,
    agentId: full.agent.id,
  };
}

/**
 * GET .../verify — integriteits- en certificeringscontrole (Boek VI).
 * Retourneert een ondertekende attestatie, niet alleen een boolean.
 */
export async function verifyAgent(idOrSlug: string) {
  const full = await loadFullAgent(idOrSlug);
  if (!full) return null;
  const { agent, certification } = full;

  const hasStoredCard = agent.card && Object.keys(agent.card).length > 0;
  const recomputedHash = hasStoredCard ? computeCardHash(agent.card) : null;
  const cardHashValid =
    Boolean(agent.card_hash) && recomputedHash === agent.card_hash;

  const now = Date.now();
  const certificationValid =
    certification?.status === "certified" &&
    (!certification.expires_at || Date.parse(certification.expires_at) > now);

  const claims = {
    sub: agent.id,
    slug: agent.slug,
    cardHash: agent.card_hash,
    cardHashValid,
    certificationValid,
    certificationStatus: certification?.status ?? "pending",
    certificationExpiresAt: certification?.expires_at ?? null,
    inhuurTier: agent.inhuur_tier,
    trustScore: agent.trust_score,
    suspended: agent.suspended,
    checkedAt: new Date().toISOString(),
  };

  const attestation = signingConfigured()
    ? await signClaims(claims, "24h")
    : null;

  return { ...claims, attestation, attestationFormat: "JWS (EdDSA), verifieerbaar via /.well-known/jwks.json" };
}

export class PublishError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

/**
 * POST /v1/registry/agents — publiceren/updaten van een Agent Card.
 * Valideert tegen het canonieke JSON Schema, berekent riskScoring server-side
 * (vendor-invoer voor dit blok wordt genegeerd, Art. 8.30 lid 2), canonicaliseert,
 * hasht en ondertekent.
 */
export async function publishAgent(cardInput: Record<string, unknown>, caller: Caller) {
  // riskScoring/afgeleide velden uit de invoer strippen vóór validatie:
  const input = structuredClone(cardInput);
  const bnaIn = (input.bna ?? {}) as Record<string, unknown>;
  delete bnaIn.riskScoring;
  delete bnaIn.agentId;
  delete bnaIn.registryUrl;
  delete bnaIn.cardHash;
  delete input.signatures;
  input.bna = bnaIn;

  const validation = validateAgentCard(input);
  if (!validation.valid) {
    throw new PublishError("Agent Card voldoet niet aan het schema", 422, validation.errors);
  }

  const euClass = ((bnaIn.certification as Record<string, unknown>)?.euAiAct as Record<string, unknown>)
    ?.riskClass as EuAiActClass;
  if (euClass === "unacceptable") {
    throw new PublishError(
      "EU AI Act-klasse 'unacceptable': agent wordt niet in de registry opgenomen (Art. 8.16 lid 2)",
      422,
    );
  }

  const db = supabaseService();
  const slug = bnaIn.slug as string;
  const provider = input.provider as Record<string, unknown>;

  // vendor koppelen: via de API-client of aanmaken op basis van provider-blok
  let vendorId: string | null = null;
  if (caller.clientId) {
    const { data: client } = await db
      .from("bna_api_clients")
      .select("vendor_id")
      .eq("id", caller.clientId)
      .maybeSingle();
    vendorId = client?.vendor_id ?? null;
  }
  if (!vendorId) {
    const { data: vendor, error } = await db
      .from("bna_vendors")
      .insert({
        name: provider.organization as string,
        website: (provider.url as string) ?? null,
        country: (provider.country as string) ?? "NL",
        kvk_number: (provider.kvkNumber as string) ?? null,
      })
      .select("id")
      .single();
    if (error) throw new PublishError(`Vendor aanmaken mislukt: ${error.message}`, 500);
    vendorId = vendor.id;
    if (caller.clientId) {
      await db.from("bna_api_clients").update({ vendor_id: vendorId }).eq("id", caller.clientId);
    }
  }

  // bestaande agent (zelfde slug) mag alleen door dezelfde vendor geüpdatet worden
  const { data: existing } = await db
    .from("bna_agents")
    .select("id, vendor_id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing && existing.vendor_id !== vendorId) {
    throw new PublishError("Slug is al in gebruik door een andere vendor", 409);
  }

  const capsIn = (bnaIn.capabilities ?? []) as Record<string, unknown>[];
  const categoryCodes = capsIn.map((c) => c.category as string);
  const [{ data: sector }, { data: categories }] = await Promise.all([
    db.from("bna_sectors").select("code, risk_weight").eq("code", bnaIn.sector as string).maybeSingle(),
    db.from("bna_capability_categories").select("code, risk_weight").in("code", categoryCodes),
  ]);
  if (!sector) throw new PublishError(`Onbekende sector: ${bnaIn.sector}`, 422);
  const categoryWeights = new Map(
    (categories ?? []).map((c) => [c.code, c.risk_weight as number]),
  );
  for (const code of categoryCodes) {
    if (!categoryWeights.has(code)) {
      throw new PublishError(`Onbekende capability-categorie: ${code}`, 422);
    }
  }

  // Vertrouwensscore: bestaande events bij update, basiswaarde 50 bij nieuw (Art. 8.9)
  let trustEvents: { component: string; delta: number }[] = [];
  if (existing) {
    const { data: events } = await db
      .from("bna_trust_events")
      .select("component, delta")
      .eq("agent_id", existing.id);
    trustEvents = events ?? [];
  }

  let riskScoring: RiskScoringBlock;
  try {
    riskScoring = computeRiskScoring({
      sectorWeight: sector.risk_weight,
      euAiActClass: euClass ?? "minimal",
      capabilities: capsIn.map((c) => ({
        categoryWeight: categoryWeights.get(c.category as string) ?? 3,
        dataSensitivity: (c.dataSensitivity ?? "none") as never,
        autonomyLevel: (c.autonomyLevel ?? "advisory") as never,
      })),
      trustEvents,
    });
  } catch (e) {
    if (e instanceof UnacceptableRiskError) throw new PublishError(e.message, 422);
    throw e;
  }

  // agent-rij schrijven
  const agentValues = {
    slug,
    vendor_id: vendorId,
    name: input.name as string,
    description: input.description as string,
    version: input.version as string,
    status: "published",
    distribution_model: bnaIn.distributionModel as string,
    sector_code: bnaIn.sector as string,
    endpoint_url: (input.url as string) ?? null,
    well_known_url: (bnaIn.wellKnownUrl as string) ?? null,
    eu_ai_act_class: euClass ?? "minimal",
    certified: false, // certificering volgt het Boek VI-proces, nooit zelfverklaard
    escrow_supported: Boolean(bnaIn.escrowSupported),
    risk_factor_score: riskScoring.riskFactorScore,
    risk_factor_class: riskScoring.riskFactorClass,
    risk_factor_components: riskScoring.riskFactorComponents,
    trust_score: riskScoring.trustScore,
    trust_score_last_calculated: riskScoring.trustScoreLastCalculated,
    inhuur_tier: riskScoring.inhuurTier,
    required_consent_level: riskScoring.requiredConsentLevel,
    applicable_articles: riskScoring.applicableArticles,
    suspended: riskScoring.suspended,
    suspension_reason: riskScoring.suspensionReason ?? null,
  };

  let agentId: string;
  if (existing) {
    const { error } = await db.from("bna_agents").update(agentValues).eq("id", existing.id);
    if (error) throw new PublishError(`Agent updaten mislukt: ${error.message}`, 500);
    agentId = existing.id;
    await db.from("bna_agent_capabilities").delete().eq("agent_id", agentId);
  } else {
    const { data: created, error } = await db
      .from("bna_agents")
      .insert(agentValues)
      .select("id")
      .single();
    if (error) throw new PublishError(`Agent aanmaken mislukt: ${error.message}`, 500);
    agentId = created.id;
  }

  const { error: capsError } = await db.from("bna_agent_capabilities").insert(
    capsIn.map((c) => ({
      agent_id: agentId,
      category_code: c.category as string,
      name: c.name as string,
      description: (c.description as string) ?? "",
      data_categories: (c.dataCategories as string[]) ?? [],
      data_sensitivity: (c.dataSensitivity as string) ?? "none",
      autonomy_level: (c.autonomyLevel as string) ?? "advisory",
    })),
  );
  if (capsError) throw new PublishError(`Capabilities opslaan mislukt: ${capsError.message}`, 500);

  // certificeringsdossier openen indien nog niet aanwezig
  if (!existing) {
    await db.from("bna_certifications").insert({
      agent_id: agentId,
      status: "pending",
      certified_by: "bn_agent",
      eu_ai_act_class: euClass ?? "minimal",
    });
  }

  // canonieke card opbouwen, hashen en ondertekenen
  const { data: rows, error: reloadError } = await db
    .from("bna_agents")
    .select("*")
    .eq("id", agentId)
    .single();
  if (reloadError) throw new PublishError(reloadError.message, 500);
  const [vendorRow, capRows, certRow] = await Promise.all([
    db.from("bna_vendors").select("id, name, country, website, kvk_number").eq("id", vendorId).single(),
    db.from("bna_agent_capabilities").select("*").eq("agent_id", agentId),
    db
      .from("bna_certifications")
      .select("*")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const card = buildAgentCard({
    agent: rows as AgentRow,
    vendor: vendorRow.data as VendorRow,
    capabilities: (capRows.data ?? []) as CapabilityRow[],
    certification: (certRow.data ?? null) as CertificationRow | null,
    riskScoring,
    registryBaseUrl: baseUrl(),
  });
  const cardHash = computeCardHash(card);
  const signature = signingConfigured()
    ? await signClaims({ sub: agentId, cardHash }, "365d")
    : null;

  const { error: cardError } = await db
    .from("bna_agents")
    .update({
      card,
      card_hash: cardHash,
      card_signature: signature,
      card_signed_at: new Date().toISOString(),
    })
    .eq("id", agentId);
  if (cardError) throw new PublishError(cardError.message, 500);

  await appendAudit({
    actorType: "api_client",
    actorId: caller.clientIdentifier ?? "onbekend",
    action: existing ? "registry.agent.updated" : "registry.agent.published",
    subjectType: "agent",
    subjectId: agentId,
    payload: { slug, cardHash, tier: riskScoring.inhuurTier },
  });

  return {
    agentId,
    slug,
    cardHash,
    signature,
    riskScoring,
    canonical: canonicalize(card),
  };
}

export async function listCapabilities() {
  const { data, error } = await supabaseAnon()
    .from("bna_capability_categories")
    .select("code, name_nl, name_en, risk_weight")
    .order("risk_weight", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listSectors() {
  const { data, error } = await supabaseAnon()
    .from("bna_sectors")
    .select("code, name_nl, name_en, risk_weight, regulations")
    .eq("active", true)
    .order("risk_weight", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

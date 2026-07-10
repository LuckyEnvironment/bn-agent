import type {
  AutonomyLevel,
  DataSensitivity,
  EuAiActClass,
  RiskScoringBlock,
} from "./risk";

/** Databaserijen (bna_-tabellen) zoals gelezen via Supabase. */
export interface AgentRow {
  id: string;
  slug: string;
  vendor_id: string;
  name: string;
  description: string;
  version: string;
  status: "draft" | "published" | "suspended" | "revoked";
  distribution_model: "koop" | "lease";
  sector_code: string;
  endpoint_url: string | null;
  well_known_url: string | null;
  card: Record<string, unknown>;
  card_hash: string | null;
  card_signature: string | null;
  card_signed_at: string | null;
  eu_ai_act_class: EuAiActClass;
  certified: boolean;
  escrow_supported: boolean;
  risk_factor_score: number | null;
  risk_factor_class: "laag" | "midden" | "hoog" | null;
  risk_factor_components: Record<string, number> | null;
  trust_score: number;
  trust_score_last_calculated: string;
  inhuur_tier: "A" | "B" | "C" | "D" | null;
  required_consent_level: string;
  applicable_articles: string[];
  suspended: boolean;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorRow {
  id: string;
  name: string;
  country: string;
  website: string | null;
  kvk_number: string | null;
}

export interface CapabilityRow {
  id: string;
  agent_id: string;
  category_code: string;
  name: string;
  description: string;
  data_categories: string[];
  data_sensitivity: DataSensitivity;
  autonomy_level: AutonomyLevel;
}

export interface CertificationRow {
  id: string;
  agent_id: string;
  status: "pending" | "certified" | "expired" | "revoked" | "suspended";
  certified_by: "bn_agent" | "notified_body";
  notified_body_name: string | null;
  eu_ai_act_class: EuAiActClass;
  avg_checklist: Record<string, boolean>;
  issued_at: string | null;
  expires_at: string | null;
}

export interface HumanOversightMeasure {
  article: string;
  measure: string;
  trigger?: string;
}

/** Standaard-toezichtmaatregelen per toestemmingsniveau (Boek V, Titel 2). */
export function defaultOversightMeasures(
  consentLevel: string,
): HumanOversightMeasure[] {
  const base: HumanOversightMeasure[] = [
    {
      article: "Art. 5.2",
      measure:
        "Eenmalige beoordeling door een bevoegd persoon bij eerste inhuur door een afnemende onderneming",
      trigger: "eerste_inhuur",
    },
  ];
  switch (consentLevel) {
    case "geen":
      return [
        ...base,
        {
          article: "Art. 5.4",
          measure: "Periodieke steekproefcontrole van ten minste vijf procent van de transacties",
          trigger: "steekproef",
        },
      ];
    case "eenmalig":
      return [
        ...base,
        {
          article: "Art. 5.4",
          measure: "Periodieke steekproefcontrole na goedgekeurde eerste inhuur",
          trigger: "steekproef",
        },
      ];
    case "drempelgebonden":
      return [
        ...base,
        {
          article: "Art. 5.5",
          measure:
            "Voorafgaande goedkeuring door een bevoegd persoon voor elke transactie boven de vastgestelde drempel",
          trigger: "drempeloverschrijding",
        },
      ];
    default: // per_transactie
      return [
        ...base,
        {
          article: "Art. 5.6",
          measure: "Voorafgaande, uitdrukkelijke goedkeuring per individuele transactie",
          trigger: "elke_transactie",
        },
        {
          article: "Art. 5.7",
          measure:
            "Verplichte menselijke beslissing bij onomkeerbare, voor betrokkene nadelige uitkomsten",
          trigger: "onomkeerbare_uitkomst",
        },
      ];
  }
}

/**
 * Bouwt de canonieke Agent Card v1.0 uit relationele registrydata.
 * riskScoring komt uit de engine (lib/risk.ts) — nooit uit vendor-invoer.
 */
export function buildAgentCard(input: {
  agent: AgentRow;
  vendor: VendorRow;
  capabilities: CapabilityRow[];
  certification: CertificationRow | null;
  riskScoring: RiskScoringBlock;
  registryBaseUrl: string;
}): Record<string, unknown> {
  const { agent, vendor, capabilities, certification, riskScoring } = input;
  return {
    protocolVersion: "1.0",
    name: agent.name,
    description: agent.description,
    ...(agent.endpoint_url && { url: agent.endpoint_url }),
    preferredTransport: "JSONRPC",
    version: agent.version,
    provider: {
      organization: vendor.name,
      ...(vendor.website && { url: vendor.website }),
      country: vendor.country,
      ...(vendor.kvk_number && { kvkNumber: vendor.kvk_number }),
    },
    capabilities: { streaming: false, pushNotifications: false },
    defaultInputModes: ["application/json"],
    defaultOutputModes: ["application/json"],
    skills: capabilities.map((c) => ({
      id: c.category_code,
      name: c.name,
      description: c.description,
      tags: [agent.sector_code, c.category_code],
    })),
    bna: {
      schemaVersion: "1.0",
      agentId: agent.id,
      slug: agent.slug,
      registryUrl: `${input.registryBaseUrl}/v1/registry/agents/${agent.id}`,
      distributionModel: agent.distribution_model,
      sector: agent.sector_code,
      ...(agent.well_known_url && { wellKnownUrl: agent.well_known_url }),
      capabilities: capabilities.map((c) => ({
        category: c.category_code,
        name: c.name,
        description: c.description,
        dataCategories: c.data_categories,
        dataSensitivity: c.data_sensitivity,
        autonomyLevel: c.autonomy_level,
      })),
      certification: {
        status: certification?.status ?? "pending",
        ...(certification && {
          certifiedBy: certification.certified_by,
          notifiedBodyName: certification.notified_body_name,
          avgChecklist: certification.avg_checklist,
          issuedAt: certification.issued_at,
          expiresAt: certification.expires_at,
        }),
        euAiAct: { riskClass: agent.eu_ai_act_class },
      },
      escrowSupported: agent.escrow_supported,
      humanOversightMeasures: defaultOversightMeasures(
        riskScoring.requiredConsentLevel,
      ),
      riskScoring,
    },
  };
}

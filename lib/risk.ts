/**
 * Risicoscoring-engine — implementeert Handboek Boek VIII (Risicoscoring &
 * Inhuurprotocol) letterlijk: Risicofactor (Art. 8.3–8.6), Vertrouwensscore
 * (Art. 8.7–8.10), Inhuurtier (Art. 8.11–8.12) en de daaruit volgende
 * machine-leesbare velden (Art. 8.30).
 *
 * In de I–VI-structuur is dit mechanisme genormeerd in Boek II Titel 3
 * (Risicofactor als onderdeel van het risicoprofiel) en Boek IV Titel 2
 * (toetsingskader per risicoklasse); de Tier-gating vormt de brug naar
 * Boek V (menselijk toezicht). Zie lib/handboek/data.ts.
 */

export type EuAiActClass = "minimal" | "limited" | "high" | "unacceptable";
export type DataSensitivity = "none" | "personal" | "special_or_biometric";
export type AutonomyLevel =
  | "advisory"
  | "autonomous_reversible"
  | "autonomous_irreversible";
export type RiskClass = "laag" | "midden" | "hoog";
export type Tier = "A" | "B" | "C" | "D";
export type ConsentLevel =
  | "geen"
  | "eenmalig"
  | "drempelgebonden"
  | "per_transactie";

export interface RiskFactorComponents {
  sector: number;
  euAiActClass: number;
  capabilityCategory: number;
  dataSensitivity: number;
  autonomyLevel: number;
}

export interface CapabilityRiskInput {
  categoryWeight: number; // uit bna_capability_categories.risk_weight (Art. 8.4 lid 4)
  dataSensitivity: DataSensitivity;
  autonomyLevel: AutonomyLevel;
}

// Art. 8.4 lid 3
const EU_AI_ACT_WEIGHTS: Record<Exclude<EuAiActClass, "unacceptable">, number> = {
  high: 30,
  limited: 15,
  minimal: 0,
};

// Art. 8.4 lid 5
const DATA_SENSITIVITY_WEIGHTS: Record<DataSensitivity, number> = {
  special_or_biometric: 15,
  personal: 8,
  none: 0,
};

// Art. 8.4 lid 6
const AUTONOMY_WEIGHTS: Record<AutonomyLevel, number> = {
  autonomous_irreversible: 10,
  autonomous_reversible: 5,
  advisory: 0,
};

export class UnacceptableRiskError extends Error {
  constructor() {
    super(
      "Agent met EU AI Act-klasse 'unacceptable' ontvangt geen Risicofactor en is niet inhuurbaar (Art. 8.6 lid 4, Art. 8.16 lid 2)",
    );
  }
}

/**
 * Art. 8.4/8.5 — Risicofactor: som van vijf componenten, max 100.
 * Bij meerdere capabilities telt de zwaarst wegende (Art. 8.5 lid 1);
 * de zwaarte wordt bepaald door de gezamenlijke bijdrage van categorie,
 * datagevoeligheid en autonomie.
 */
export function computeRiskFactor(input: {
  sectorWeight: number;
  euAiActClass: EuAiActClass;
  capabilities: CapabilityRiskInput[];
}): { score: number; klasse: RiskClass; components: RiskFactorComponents } {
  if (input.euAiActClass === "unacceptable") throw new UnacceptableRiskError();
  if (input.capabilities.length === 0) {
    throw new Error("Risicofactor vereist ten minste één capability (Art. 8.4)");
  }

  const heaviest = input.capabilities
    .map((c) => ({
      cat: Math.min(c.categoryWeight, 20),
      data: DATA_SENSITIVITY_WEIGHTS[c.dataSensitivity],
      auto: AUTONOMY_WEIGHTS[c.autonomyLevel],
    }))
    .reduce((a, b) => (b.cat + b.data + b.auto > a.cat + a.data + a.auto ? b : a));

  const components: RiskFactorComponents = {
    sector: Math.min(input.sectorWeight, 25),
    euAiActClass: EU_AI_ACT_WEIGHTS[input.euAiActClass],
    capabilityCategory: heaviest.cat,
    dataSensitivity: heaviest.data,
    autonomyLevel: heaviest.auto,
  };

  const score = Math.min(
    100,
    Math.round(
      components.sector +
        components.euAiActClass +
        components.capabilityCategory +
        components.dataSensitivity +
        components.autonomyLevel,
    ),
  );

  return { score, klasse: riskClassOf(score), components };
}

/** Art. 8.6 — drempelwaarden Risicoklasse. */
export function riskClassOf(score: number): RiskClass {
  if (score <= 33) return "laag";
  if (score <= 66) return "midden";
  return "hoog";
}

/** Bandbreedtes per component, Art. 8.8 lid 1. */
const TRUST_BANDS: Record<string, { min: number; max: number }> = {
  certification_history: { min: -20, max: 15 },
  operational_reliability: { min: -15, max: 10 },
  escrow_history: { min: -20, max: 15 },
  vendor_portfolio: { min: -10, max: 10 },
  incident_history: { min: -25, max: 0 },
  registry_reviews: { min: -5, max: 5 },
};

export const TRUST_BASE = 50; // Art. 8.8 lid 1 / Art. 8.9 lid 1

/**
 * Art. 8.8 — Vertrouwensscore: basiswaarde 50, bijgesteld per component binnen
 * de bandbreedtes, begrensd 0–100. Lid 3: een negatieve incident-bijstelling
 * kan binnen dezelfde periode niet boven de basiswaarde worden gecompenseerd.
 */
export function computeTrustScore(
  events: { component: string; delta: number }[],
): number {
  const perComponent = new Map<string, number>();
  for (const e of events) {
    perComponent.set(e.component, (perComponent.get(e.component) ?? 0) + e.delta);
  }

  let score = TRUST_BASE;
  let incidentNegative = false;
  for (const [component, sum] of perComponent) {
    const band = TRUST_BANDS[component];
    if (!band) continue;
    const clamped = Math.max(band.min, Math.min(band.max, sum));
    if (component === "incident_history" && clamped < 0) incidentNegative = true;
    score += clamped;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  if (incidentNegative) score = Math.min(score, TRUST_BASE); // Art. 8.8 lid 3
  return score;
}

/** Art. 8.11 — Tiermatrix (Risicoklasse × Vertrouwensscore-band). */
export function computeTier(riskClass: RiskClass, trustScore: number): Tier {
  const band: "hoog" | "midden" | "laag" =
    trustScore > 70 ? "hoog" : trustScore >= 40 ? "midden" : "laag";
  const matrix: Record<RiskClass, Record<typeof band, Tier>> = {
    laag: { hoog: "A", midden: "A", laag: "B" },
    midden: { hoog: "A", midden: "B", laag: "C" },
    hoog: { hoog: "B", midden: "C", laag: "D" },
  };
  return matrix[riskClass][band];
}

/** Art. 8.12 j.o. Art. 8.30 lid 3 — toestemmingsniveau per Tier. */
export function consentLevelOf(tier: Tier): ConsentLevel {
  return { A: "geen", B: "eenmalig", C: "drempelgebonden", D: "per_transactie" }[
    tier
  ] as ConsentLevel;
}

/** Art. 8.30 lid 2 — applicableArticles, automatisch gevuld op basis van Tier. */
export function applicableArticlesOf(tier: Tier): string[] {
  switch (tier) {
    case "A":
      return ["Art. 8.12 lid 1", "Art. 8.14", "Art. 8.17"];
    case "B":
      return ["Art. 8.12 lid 2", "Art. 8.15 lid 1", "Art. 8.17"];
    case "C":
      return ["Art. 8.12 lid 3", "Art. 8.15 lid 2", "Art. 8.17", "Art. 8.18", "Art. 8.20"];
    case "D":
      return [
        "Art. 8.12 lid 4",
        "Art. 8.16 lid 1",
        "Art. 8.17",
        "Art. 8.18",
        "Art. 8.19",
        "Art. 8.20",
      ];
  }
}

/** Art. 8.27 — schorsingsgrond bij Vertrouwensscore onder 20. */
export const SUSPENSION_TRUST_THRESHOLD = 20;

export interface RiskScoringBlock {
  riskFactorScore: number;
  riskFactorClass: RiskClass;
  riskFactorComponents: RiskFactorComponents;
  trustScore: number;
  trustScoreLastCalculated: string;
  inhuurTier: Tier;
  applicableArticles: string[];
  requiredConsentLevel: ConsentLevel;
  suspended: boolean;
  suspensionReason?: string;
}

/** Volledige berekening → het riskScoring-blok van Art. 8.30 lid 1. */
export function computeRiskScoring(input: {
  sectorWeight: number;
  euAiActClass: EuAiActClass;
  capabilities: CapabilityRiskInput[];
  trustEvents: { component: string; delta: number }[];
  suspended?: boolean;
  suspensionReason?: string;
}): RiskScoringBlock {
  const rf = computeRiskFactor(input);
  const ts = computeTrustScore(input.trustEvents);
  const tier = computeTier(rf.klasse, ts);
  const suspended =
    (input.suspended ?? false) || ts < SUSPENSION_TRUST_THRESHOLD;
  return {
    riskFactorScore: rf.score,
    riskFactorClass: rf.klasse,
    riskFactorComponents: rf.components,
    trustScore: ts,
    trustScoreLastCalculated: new Date().toISOString(),
    inhuurTier: tier,
    applicableArticles: applicableArticlesOf(tier),
    requiredConsentLevel: consentLevelOf(tier),
    suspended,
    ...(suspended && {
      suspensionReason:
        input.suspensionReason ??
        (ts < SUSPENSION_TRUST_THRESHOLD
          ? "Vertrouwensscore onder 20 (Art. 8.27)"
          : undefined),
    }),
  };
}

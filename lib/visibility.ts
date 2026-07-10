/**
 * Toegangscontrole-laag op veldniveau (Handboek Boek VI Titel 4):
 * bepaalt per aanroepersklasse welke velden van een Agent Card zichtbaar zijn.
 *
 * - public:        discovery-kern + certificeringsstatus + Tier (transparantie
 *                  zonder operationele details)
 * - authenticated: + endpoints, skills, volledige capabilities en toezichtmaatregelen
 * - paying:        + volledig riskScoring-blok met componentopbouw en datacategorieën
 */

export type AccessTier = "public" | "authenticated" | "paying";

type Card = Record<string, unknown>;

export function filterCardForTier(card: Card, tier: AccessTier): Card {
  if (tier === "paying") return card;

  const c = structuredClone(card);
  const bna = c.bna as Card | undefined;

  if (tier === "authenticated") {
    if (bna?.riskScoring) {
      const rs = bna.riskScoring as Card;
      // componentopbouw is onderdeel van het betaalde risicoprofiel
      delete rs.riskFactorComponents;
    }
    return c;
  }

  // public
  delete c.url;
  delete c.skills;
  delete c.securitySchemes;
  delete c.security;
  if (bna) {
    delete bna.wellKnownUrl;
    delete bna.humanOversightMeasures;
    if (Array.isArray(bna.capabilities)) {
      bna.capabilities = (bna.capabilities as Card[]).map((cap) => ({
        category: cap.category,
        name: cap.name,
        dataSensitivity: cap.dataSensitivity,
        autonomyLevel: cap.autonomyLevel,
      }));
    }
    if (bna.riskScoring) {
      const rs = bna.riskScoring as Card;
      bna.riskScoring = {
        riskFactorClass: rs.riskFactorClass,
        inhuurTier: rs.inhuurTier,
        requiredConsentLevel: rs.requiredConsentLevel,
        suspended: rs.suspended,
      };
    }
  }
  return c;
}

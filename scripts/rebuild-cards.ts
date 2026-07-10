/**
 * Herbouwt de canonieke Agent Cards van alle gepubliceerde agents met exact
 * dezelfde code als de publicatieroute (buildAgentCard/computeCardHash/
 * signClaims) en schrijft UPDATE-statements naar stdout of past ze direct toe
 * wanneer SUPABASE_SERVICE_ROLE_KEY beschikbaar is.
 *
 * Draaien: node scripts/rebuild-cards.ts   (Node >= 22, type stripping)
 */
import { createClient } from "@supabase/supabase-js";
import { buildAgentCard } from "../lib/agent-card.ts";
import { computeCardHash } from "../lib/canonical.ts";
import { signClaims } from "../lib/signing.ts";

process.loadEnvFile(".env.local");

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const { data: agents, error } = await db
  .from("bna_agents")
  .select("*")
  .eq("status", "published");
if (error) throw new Error(error.message);

const statements: string[] = [];

for (const agent of agents ?? []) {
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

  const card = buildAgentCard({
    agent,
    vendor: vendorRes.data,
    capabilities: capsRes.data ?? [],
    certification: certRes.data ?? null,
    riskScoring: {
      riskFactorScore: agent.risk_factor_score ?? 0,
      riskFactorClass: agent.risk_factor_class ?? "laag",
      riskFactorComponents: agent.risk_factor_components ?? {
        sector: 0, euAiActClass: 0, capabilityCategory: 0, dataSensitivity: 0, autonomyLevel: 0,
      },
      trustScore: agent.trust_score,
      trustScoreLastCalculated: agent.trust_score_last_calculated,
      inhuurTier: agent.inhuur_tier ?? "D",
      applicableArticles: agent.applicable_articles,
      requiredConsentLevel: agent.required_consent_level,
      suspended: agent.suspended,
      ...(agent.suspension_reason && { suspensionReason: agent.suspension_reason }),
    },
    registryBaseUrl: baseUrl,
  });

  const cardHash = computeCardHash(card);
  const signature = await signClaims({ sub: agent.id, cardHash }, "365d");
  const cardJson = JSON.stringify(card).replace(/'/g, "''");

  statements.push(
    `update public.bna_agents set card = '${cardJson}'::jsonb, card_hash = '${cardHash}', card_signature = '${signature}', card_signed_at = now() where id = '${agent.id}';`,
  );
  console.error(`ok ${agent.slug} ${cardHash}`);
}

console.log(statements.join("\n"));

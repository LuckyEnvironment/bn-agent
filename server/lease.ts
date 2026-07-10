import { supabaseAnon, supabaseService } from "@/lib/supabase";
import { appendAudit } from "./audit";
import type { Caller } from "./auth";

/**
 * Gecontroleerde aanroep van een lease-agent (MCP-tool call_lease_agent).
 * Leest requiredConsentLevel uit en blokkeert de aanroep in afwachting van
 * goedkeuring door een bevoegd persoon (Handboek Art. 8.30 lid 3).
 */

export interface LeaseCallResult {
  status: "forwarded" | "blocked_awaiting_consent" | "unreachable";
  agentId: string;
  tier: string | null;
  requiredConsentLevel: string;
  articles?: string[];
  upstream?: unknown;
  error?: string;
}

export async function callLeaseAgent(
  input: {
    agentId: string;
    message: Record<string, unknown>;
    approvalId?: string;
    aboveThreshold?: boolean;
  },
  caller: Caller,
): Promise<LeaseCallResult> {
  const { data: agent, error } = await supabaseAnon()
    .from("bna_agents")
    .select(
      "id, slug, status, certified, suspended, distribution_model, endpoint_url, inhuur_tier, required_consent_level, applicable_articles",
    )
    .eq("id", input.agentId)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!agent) throw new Error("Agent niet gevonden of niet gepubliceerd");
  if (agent.distribution_model !== "lease") {
    throw new Error("Agent heeft Koop-distributie en is niet via het platform aanroepbaar");
  }
  if (agent.suspended) {
    throw new Error("Agent is geschorst (Art. 8.28 lid 1)");
  }
  if (!agent.certified) {
    throw new Error("Agent heeft geen geldige certificering (Art. 8.13 lid 1 sub a)");
  }
  if (!agent.endpoint_url) {
    throw new Error("Agent heeft geen aanroep-endpoint geregistreerd");
  }

  const tier = agent.inhuur_tier as "A" | "B" | "C" | "D" | null;
  const needsConsent =
    tier === "D" || (tier === "C" && input.aboveThreshold !== false);

  let approvalValid = false;
  if (input.approvalId && caller.clientId) {
    const { data: approval } = await supabaseService()
      .from("bna_approvals")
      .select("id")
      .eq("id", input.approvalId)
      .eq("agent_id", agent.id)
      .maybeSingle();
    approvalValid = Boolean(approval);
  }

  if (needsConsent && !approvalValid) {
    await appendAudit({
      actorType: "api_client",
      actorId: caller.clientIdentifier ?? "onbekend",
      action: "lease.call.blocked_awaiting_consent",
      subjectType: "agent",
      subjectId: agent.id,
      payload: { tier, requiredConsentLevel: agent.required_consent_level },
    });
    return {
      status: "blocked_awaiting_consent",
      agentId: agent.id,
      tier,
      requiredConsentLevel: agent.required_consent_level,
      articles: agent.applicable_articles,
    };
  }

  let upstream: unknown;
  let unreachable: string | null = null;
  try {
    const res = await fetch(agent.endpoint_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input.message),
      signal: AbortSignal.timeout(10_000),
    });
    upstream = await res.json().catch(() => ({ status: res.status }));
  } catch (e) {
    unreachable = e instanceof Error ? e.message : "onbereikbaar";
  }

  await appendAudit({
    actorType: "api_client",
    actorId: caller.clientIdentifier ?? "onbekend",
    action: unreachable ? "lease.call.unreachable" : "lease.call.forwarded",
    subjectType: "agent",
    subjectId: agent.id,
    payload: { tier, approvalId: approvalValid ? input.approvalId : null },
  });

  if (unreachable) {
    return {
      status: "unreachable",
      agentId: agent.id,
      tier,
      requiredConsentLevel: agent.required_consent_level,
      error: unreachable,
    };
  }
  return {
    status: "forwarded",
    agentId: agent.id,
    tier,
    requiredConsentLevel: agent.required_consent_level,
    upstream,
  };
}

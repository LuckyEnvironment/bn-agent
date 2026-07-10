import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate, jsonPublic } from "@/lib/api";
import type { EuAiActClass } from "@/lib/risk";
import { resolveCaller, requireScope } from "@/server/auth";
import { publishAgent, PublishError, searchAgents } from "@/server/registry";

function parseBool(v: string | null): boolean | undefined {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

/** GET /v1/registry/agents — zoeken/filteren in de Discovery Registry. */
export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams;
    const result = await searchAgents({
      q: p.get("q") ?? undefined,
      capability_category: p.get("capability_category") ?? undefined,
      sector: p.get("sector") ?? undefined,
      distribution_model:
        (p.get("distribution_model") as "koop" | "lease") ?? undefined,
      certified: parseBool(p.get("certified")),
      eu_ai_act_class: (p.get("eu_ai_act_class") as EuAiActClass) ?? undefined,
      escrow_supported: parseBool(p.get("escrow_supported")),
      limit: p.get("limit") ? Number(p.get("limit")) : undefined,
      offset: p.get("offset") ? Number(p.get("offset")) : undefined,
    });
    return jsonPublic(result);
  } catch (e) {
    return handleUnknown(e);
  }
}

/** POST /v1/registry/agents — publiceren/updaten van een Agent Card. */
export async function POST(request: NextRequest) {
  try {
    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") {
      return apiError(401, "Authenticatie vereist (OAuth 2.1 client credentials, zie /v1/oauth/token)");
    }
    if (!requireScope(caller, "registry:write")) {
      return apiError(403, "Scope registry:write vereist");
    }
    const body = (await request.json()) as Record<string, unknown>;
    const result = await publishAgent(body, caller);
    return jsonPrivate(result, 201);
  } catch (e) {
    if (e instanceof PublishError) {
      return apiError(e.status, e.message, e.details);
    }
    return handleUnknown(e);
  }
}

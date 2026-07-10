import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate, jsonPublic } from "@/lib/api";
import { resolveCaller } from "@/server/auth";
import { getAgentCard } from "@/server/registry";

/** GET /v1/registry/agents/{id} — volledige Agent Card (veldfiltering per aanroeper). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const caller = await resolveCaller(request.headers.get("authorization"));
    const result = await getAgentCard(id, caller.tier);
    if (!result) return apiError(404, "Agent niet gevonden");

    const body = {
      agentId: result.agentId,
      card: result.card,
      cardHash: result.cardHash,
      signature: result.signature,
      signedAt: result.signedAt,
    };
    return caller.tier === "public" ? jsonPublic(body) : jsonPrivate(body);
  } catch (e) {
    return handleUnknown(e);
  }
}

import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate } from "@/lib/api";
import { resolveCaller, requireScope } from "@/server/auth";
import { EscrowError, submitEscrowRequest } from "@/server/escrow";

/**
 * POST /v1/escrow/requests — escrow-verzoek indienen.
 * Tier-gating conform Boek VIII Titel 5/6; payloadverwerking staat achter
 * de veiligheidsklep ESCROW_LIVE_PROCESSING (default uit).
 */
export async function POST(request: NextRequest) {
  try {
    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") {
      return apiError(401, "Authenticatie vereist");
    }
    if (!requireScope(caller, "escrow:submit")) {
      return apiError(403, "Scope escrow:submit vereist");
    }

    const body = (await request.json()) as {
      agentId?: string;
      requestMeta?: Record<string, unknown>;
      approvalId?: string;
      aboveThreshold?: boolean;
      payload?: unknown;
    };
    if (!body.agentId) return apiError(400, "agentId is verplicht");
    if (body.payload !== undefined) {
      // Veiligheidsklep: payloads met (mogelijk) cliëntgevoelige data worden in
      // deze fase categorisch geweigerd — ook met een geldige toestemming.
      return apiError(
        422,
        "Payloads worden nog niet aangenomen: live escrow-verwerking is uitgeschakeld (ESCROW_LIVE_PROCESSING=false). Dien het verzoek in met uitsluitend requestMeta.",
      );
    }

    const result = await submitEscrowRequest(
      {
        agentId: body.agentId,
        requestMeta: body.requestMeta ?? {},
        approvalId: body.approvalId,
        aboveThreshold: body.aboveThreshold,
      },
      caller,
    );
    return jsonPrivate(result, result.status === "blocked_awaiting_consent" ? 202 : 201);
  } catch (e) {
    if (e instanceof EscrowError) {
      return apiError(e.status, e.message, { articles: e.articles });
    }
    return handleUnknown(e);
  }
}

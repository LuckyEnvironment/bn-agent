import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate } from "@/lib/api";
import { resolveCaller, requireScope } from "@/server/auth";
import { EscrowError, recordApproval } from "@/server/escrow";

/**
 * POST /v1/escrow/approvals — toestemming van een bevoegd persoon vastleggen
 * (Art. 8.20: identiteit, tijdstip, Tier en scores ten tijde van goedkeuring;
 * opgenomen in het append-only auditlog).
 */
export async function POST(request: NextRequest) {
  try {
    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") return apiError(401, "Authenticatie vereist");
    if (!requireScope(caller, "escrow:submit")) {
      return apiError(403, "Scope escrow:submit vereist");
    }

    const body = (await request.json()) as {
      agentId?: string;
      approvedByName?: string;
      approvedByRole?: string;
      approvalScope?: "eerste_inhuur" | "transactie" | "drempel";
    };
    if (!body.agentId || !body.approvedByName || !body.approvedByRole || !body.approvalScope) {
      return apiError(
        400,
        "agentId, approvedByName, approvedByRole en approvalScope zijn verplicht (Art. 8.20 lid 1)",
      );
    }

    const result = await recordApproval(
      {
        agentId: body.agentId,
        approvedByName: body.approvedByName,
        approvedByRole: body.approvedByRole,
        approvalScope: body.approvalScope,
      },
      caller,
    );
    return jsonPrivate(result, 201);
  } catch (e) {
    if (e instanceof EscrowError) {
      return apiError(e.status, e.message, { articles: e.articles });
    }
    return handleUnknown(e);
  }
}

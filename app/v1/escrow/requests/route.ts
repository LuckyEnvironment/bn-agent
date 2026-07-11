import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate } from "@/lib/api";
import { resolveCaller, requireScope } from "@/server/auth";
import { EscrowError, submitEscrowRequest } from "@/server/escrow";

/**
 * POST /v1/escrow/requests — escrow-verzoek indienen.
 *
 * Dynamic Autonomous Escrow (Boek VIII Titel 11): binnen het realtime
 * mandaat (Tier × α op basis van de Vertrouwensscore) wordt de transactie
 * direct autonoom uitgevoerd — geen toetsingsmoment vooraf (Art. 8.32).
 * Bij uitputting van het uurmandaat of overschrijding van de
 * per-transactielimiet schakelt de flow naar asynchrone menselijke
 * validatie via het approvals-mechanisme (Art. 8.33 jo. 8.20); de agent
 * blijft intussen operationeel voor overige transacties. De drempel wordt
 * server-side gemeten: het veld `aboveThreshold` is vervallen.
 *
 * Payloadverwerking staat achter de veiligheidsklep
 * ESCROW_LIVE_PROCESSING (default uit); de mandaatadministratie loopt
 * onafhankelijk daarvan gewoon door.
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
      amountCents?: number;
      payloadBytes?: number;
      payload?: unknown;
    };
    if (!body.agentId) return apiError(400, "agentId is verplicht");
    if (
      body.amountCents !== undefined &&
      (!Number.isInteger(body.amountCents) || body.amountCents < 0)
    ) {
      return apiError(400, "amountCents moet een geheel getal >= 0 zijn (bedrag in centen)");
    }
    if (
      body.payloadBytes !== undefined &&
      (!Number.isInteger(body.payloadBytes) || body.payloadBytes < 0)
    ) {
      return apiError(400, "payloadBytes moet een geheel getal >= 0 zijn");
    }
    if (body.payload !== undefined) {
      // Veiligheidsklep: payloads met (mogelijk) cliëntgevoelige data worden in
      // deze fase categorisch geweigerd — ook met een geldige toestemming.
      return apiError(
        422,
        "Payloads worden nog niet aangenomen: live escrow-verwerking is uitgeschakeld (ESCROW_LIVE_PROCESSING=false). Dien het verzoek in met uitsluitend requestMeta (incl. amountCents/payloadBytes voor de mandaatmeting).",
      );
    }

    const result = await submitEscrowRequest(
      {
        agentId: body.agentId,
        requestMeta: body.requestMeta ?? {},
        approvalId: body.approvalId,
        amountCents: body.amountCents,
        payloadBytes: body.payloadBytes,
      },
      caller,
    );
    const pending =
      result.status === "blocked_awaiting_consent" ||
      result.status === "blocked_budget_exceeded";
    return jsonPrivate(result, pending ? 202 : 201);
  } catch (e) {
    if (e instanceof EscrowError) {
      return apiError(e.status, e.message, { articles: e.articles });
    }
    return handleUnknown(e);
  }
}

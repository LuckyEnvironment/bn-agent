import type { NextRequest } from "next/server";
import { apiError, handleUnknown } from "@/lib/api";
import { registerClient } from "@/server/auth";
import { NextResponse } from "next/server";

/**
 * POST /v1/oauth/register — Dynamic Client Registration (RFC 7591).
 * Open registratie levert een client met tier 'authenticated' en standaard
 * alleen registry:read; ruimere scopes en tier 'paying' worden via het
 * accountproces toegekend.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { client_name?: string; scope?: string };
    if (!body.client_name || body.client_name.trim().length < 2) {
      return apiError(400, "client_name is verplicht (RFC 7591)");
    }
    const registration = await registerClient({
      client_name: body.client_name.trim(),
      scope: body.scope,
    });
    return NextResponse.json(registration, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return handleUnknown(e);
  }
}

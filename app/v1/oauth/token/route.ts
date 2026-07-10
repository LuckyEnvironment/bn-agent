import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiError, handleUnknown } from "@/lib/api";
import { issueToken } from "@/server/auth";

/**
 * POST /v1/oauth/token — OAuth 2.1 client credentials grant.
 * Accepteert application/x-www-form-urlencoded (spec) en JSON (gemak).
 */
export async function POST(request: NextRequest) {
  try {
    let params: Record<string, string>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      params = (await request.json()) as Record<string, string>;
    } else {
      params = Object.fromEntries(new URLSearchParams(await request.text()));
    }

    if (params.grant_type !== "client_credentials") {
      return apiError(400, "unsupported_grant_type: alleen client_credentials");
    }
    if (!params.client_id || !params.client_secret) {
      return apiError(400, "invalid_request: client_id en client_secret zijn verplicht");
    }

    const result = await issueToken({
      client_id: params.client_id,
      client_secret: params.client_secret,
      scope: params.scope,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, error_description: result.error_description },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    const { ok: _ok, ...token } = result;
    return NextResponse.json(token, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return handleUnknown(e);
  }
}

import { NextResponse } from "next/server";

/**
 * TEMPORARY diagnostic — reports the SHAPE of signing-key env vars without
 * leaking any secret material (no raw key bytes). Remove after debugging.
 */
function shape(v: string | undefined) {
  if (v === undefined) return { present: false };
  return {
    present: true,
    length: v.length,
    startsWithDashes: v.startsWith("-----"),
    hasBeginMarker: /-----BEGIN [A-Z0-9 ]+-----/.test(v),
    hasEndMarker: /-----END [A-Z0-9 ]+-----/.test(v),
    hasLiteralBackslashN: v.includes("\\n"),
    hasRealNewline: v.includes("\n"),
    looksLikePlaceholder: v.includes("<") || v.toLowerCase().includes("pem"),
  };
}

export async function GET() {
  return NextResponse.json({
    BNA_SIGNING_PUBLIC_KEY: shape(process.env.BNA_SIGNING_PUBLIC_KEY),
    BNA_SIGNING_PRIVATE_KEY: shape(process.env.BNA_SIGNING_PRIVATE_KEY),
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? null,
    SUPABASE_SERVICE_ROLE_KEY_present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}

import { NextResponse } from "next/server";
import { ServiceKeyMissingError } from "./supabase";

/**
 * API-conventies: JSON-antwoorden met nette foutstructuur; edge-cache op
 * publieke read-only registry-endpoints (CDN s-maxage), nooit op
 * geauthenticeerde of schrijvende paden.
 */

export function jsonPublic(data: unknown, opts?: { cacheSeconds?: number }) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${opts?.cacheSeconds ?? 60}, stale-while-revalidate=300`,
      Vary: "Authorization",
    },
  });
}

export function jsonPrivate(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store", Vary: "Authorization" },
  });
}

export function apiError(status: number, message: string, details?: unknown) {
  return NextResponse.json(
    { error: { status, message, ...(details !== undefined && { details }) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function handleUnknown(e: unknown) {
  if (e instanceof ServiceKeyMissingError) {
    return apiError(503, e.message);
  }
  console.error(e);
  return apiError(500, e instanceof Error ? e.message : "Interne fout");
}

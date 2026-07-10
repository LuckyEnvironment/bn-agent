import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Twee clients:
 * - anon: leest via RLS uitsluitend gepubliceerde registry-data (alle GET-paden)
 * - service: schrijfpaden (publicatie, escrow, audit); vereist
 *   SUPABASE_SERVICE_ROLE_KEY en bestaat alleen server-side
 */

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function supabaseAnon(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      { auth: { persistSession: false } },
    );
  }
  return anonClient;
}

export function supabaseService(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new ServiceKeyMissingError();
  }
  if (!serviceClient) {
    serviceClient = createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), key, {
      auth: { persistSession: false },
    });
  }
  return serviceClient;
}

export class ServiceKeyMissingError extends Error {
  constructor() {
    super(
      "SUPABASE_SERVICE_ROLE_KEY is niet geconfigureerd; schrijfpaden zijn uitgeschakeld",
    );
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} ontbreekt in de omgeving`);
  return v;
}

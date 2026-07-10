import { createHash, randomBytes } from "crypto";
import { signClaims, verifyClaims } from "@/lib/signing";
import { supabaseService } from "@/lib/supabase";
import type { AccessTier } from "@/lib/visibility";

/**
 * Agent-toegang: OAuth 2.1 client credentials + Dynamic Client Registration
 * (RFC 7591). Access tokens zijn stateless JWT's (EdDSA) met tier en scopes,
 * zodat elke request volledige context draagt en horizontaal schaalt.
 * Menselijke gebruikers (vendors, inkopers) lopen via Supabase Auth.
 */

const TOKEN_TTL = "1h";
export const SUPPORTED_SCOPES = [
  "registry:read",
  "registry:write",
  "escrow:submit",
] as const;

function sha256(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

export interface Caller {
  tier: AccessTier;
  clientId?: string; // bna_api_clients.id (uuid)
  clientIdentifier?: string; // OAuth client_id
  scopes: string[];
}

export const PUBLIC_CALLER: Caller = { tier: "public", scopes: [] };

/** RFC 7591 — Dynamic Client Registration. */
export async function registerClient(input: {
  client_name: string;
  scope?: string;
}): Promise<Record<string, unknown>> {
  const requested = (input.scope ?? "registry:read").split(/\s+/).filter(Boolean);
  const scopes = requested.filter((s) =>
    (SUPPORTED_SCOPES as readonly string[]).includes(s),
  );
  if (scopes.length === 0) scopes.push("registry:read");

  const clientId = `bna_${randomBytes(12).toString("hex")}`;
  const clientSecret = randomBytes(32).toString("hex");
  const registrationToken = randomBytes(32).toString("hex");

  const { data, error } = await supabaseService()
    .from("bna_api_clients")
    .insert({
      client_id: clientId,
      client_secret_hash: sha256(clientSecret),
      client_name: input.client_name,
      scopes,
      access_tier: "authenticated",
      registration_access_token_hash: sha256(registrationToken),
    })
    .select("id")
    .single();
  if (error) throw new Error(`Clientregistratie mislukt: ${error.message}`);

  return {
    client_id: clientId,
    client_secret: clientSecret,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_secret_expires_at: 0,
    client_name: input.client_name,
    scope: scopes.join(" "),
    grant_types: ["client_credentials"],
    token_endpoint_auth_method: "client_secret_post",
    registration_access_token: registrationToken,
    registration_client_uri: `/v1/oauth/register/${data.id}`,
  };
}

/** OAuth 2.1 client credentials → JWT access token. */
export async function issueToken(input: {
  client_id: string;
  client_secret: string;
  scope?: string;
}): Promise<
  | { ok: true; access_token: string; token_type: "Bearer"; expires_in: number; scope: string }
  | { ok: false; error: string; error_description: string }
> {
  const { data: client } = await supabaseService()
    .from("bna_api_clients")
    .select("id, client_id, client_secret_hash, scopes, access_tier, disabled")
    .eq("client_id", input.client_id)
    .maybeSingle();

  if (
    !client ||
    client.disabled ||
    client.client_secret_hash !== sha256(input.client_secret)
  ) {
    return {
      ok: false,
      error: "invalid_client",
      error_description: "Onbekende client of ongeldig client_secret",
    };
  }

  const requested = input.scope?.split(/\s+/).filter(Boolean) ?? client.scopes;
  const scopes = requested.filter((s: string) => client.scopes.includes(s));

  const access_token = await signClaims(
    {
      sub: client.id,
      client_id: client.client_id,
      tier: client.access_tier,
      scope: scopes.join(" "),
      aud: "bna-api",
    },
    TOKEN_TTL,
  );
  return { ok: true, access_token, token_type: "Bearer", expires_in: 3600, scope: scopes.join(" ") };
}

/** Stateless caller-resolutie uit de Authorization-header. */
export async function resolveCaller(authorization: string | null): Promise<Caller> {
  if (!authorization?.startsWith("Bearer ")) return PUBLIC_CALLER;
  try {
    const claims = await verifyClaims(authorization.slice(7));
    if (claims.aud !== "bna-api") return PUBLIC_CALLER;
    return {
      tier: claims.tier === "paying" ? "paying" : "authenticated",
      clientId: typeof claims.sub === "string" ? claims.sub : undefined,
      clientIdentifier:
        typeof claims.client_id === "string" ? claims.client_id : undefined,
      scopes: typeof claims.scope === "string" ? claims.scope.split(" ") : [],
    };
  } catch {
    return PUBLIC_CALLER;
  }
}

export function requireScope(caller: Caller, scope: string): boolean {
  return caller.scopes.includes(scope);
}

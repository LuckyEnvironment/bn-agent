import { SignJWT, jwtVerify, importPKCS8, importSPKI, exportJWK } from "jose";

/**
 * Cryptografische ondertekening (Ed25519/EdDSA) van Agent Cards en
 * verify-attestaties, uitgelijnd met A2A v1.0 (JWS). De publieke sleutel is
 * opvraagbaar via /.well-known/jwks.json zodat afnemers attestaties
 * onafhankelijk kunnen verifiëren.
 */

const ALG = "EdDSA";
export const SIGNING_KID = "bna-registry-2026-07";

function pem(env: string | undefined, name: string): string {
  if (!env) throw new Error(`${name} ontbreekt in de omgeving`);
  return env.replace(/\\n/g, "\n");
}

async function privateKey() {
  return importPKCS8(pem(process.env.BNA_SIGNING_PRIVATE_KEY, "BNA_SIGNING_PRIVATE_KEY"), ALG);
}

async function publicKey() {
  return importSPKI(pem(process.env.BNA_SIGNING_PUBLIC_KEY, "BNA_SIGNING_PUBLIC_KEY"), ALG);
}

export function signingConfigured(): boolean {
  return Boolean(process.env.BNA_SIGNING_PRIVATE_KEY && process.env.BNA_SIGNING_PUBLIC_KEY);
}

/** Ondertekent een claims-object als compacte JWS (JWT). */
export async function signClaims(
  claims: Record<string, unknown>,
  expiresIn: string = "30d",
): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: ALG, kid: SIGNING_KID, typ: "JWT" })
    .setIssuer("https://bnagent.nl")
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(await privateKey());
}

export async function verifyClaims(jws: string) {
  const { payload } = await jwtVerify(jws, await publicKey(), {
    issuer: "https://bnagent.nl",
  });
  return payload;
}

/** Publieke sleutel als JWKS voor /.well-known/jwks.json. */
export async function publicJwks() {
  const jwk = await exportJWK(await publicKey());
  return { keys: [{ ...jwk, kid: SIGNING_KID, use: "sig", alg: ALG }] };
}

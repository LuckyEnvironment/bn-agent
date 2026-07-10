import { apiError, handleUnknown, jsonPublic } from "@/lib/api";
import { verifyAgent } from "@/server/registry";

/**
 * GET /v1/registry/agents/{id}/verify — integriteits- en certificerings-
 * controle. Retourneert een ondertekende attestatie (JWS, EdDSA) met
 * cardHashValid, certificationValid en geldigheidstermijnen; publieke
 * sleutel via /.well-known/jwks.json.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await verifyAgent(id);
    if (!result) return apiError(404, "Agent niet gevonden");
    // korte cache: attestaties bevatten checkedAt en zijn 24u geldig
    return jsonPublic(result, { cacheSeconds: 30 });
  } catch (e) {
    return handleUnknown(e);
  }
}

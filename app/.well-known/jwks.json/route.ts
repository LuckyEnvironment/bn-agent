import { handleUnknown, jsonPublic } from "@/lib/api";
import { publicJwks, signingConfigured } from "@/lib/signing";
import { apiError } from "@/lib/api";

/** GET /.well-known/jwks.json — publieke sleutel voor attestatie-verificatie. */
export async function GET() {
  try {
    if (!signingConfigured()) {
      return apiError(503, "Ondertekening is niet geconfigureerd");
    }
    return jsonPublic(await publicJwks(), { cacheSeconds: 3600 });
  } catch (e) {
    return handleUnknown(e);
  }
}

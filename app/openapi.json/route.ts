import { jsonPublic } from "@/lib/api";
import { baseUrl } from "@/lib/flags";
import { buildOpenApiSpec } from "@/lib/openapi";

/** GET /openapi.json — OpenAPI 3.1-specificatie van de API v1. */
export async function GET() {
  return jsonPublic(buildOpenApiSpec(baseUrl()), { cacheSeconds: 3600 });
}

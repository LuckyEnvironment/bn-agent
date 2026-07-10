import { handleUnknown, jsonPublic } from "@/lib/api";
import { listCapabilities } from "@/server/registry";

/** GET /v1/capabilities — capability-categorieën (Bijlage A) met risicogewichten. */
export async function GET() {
  try {
    return jsonPublic({ capabilities: await listCapabilities() }, { cacheSeconds: 300 });
  } catch (e) {
    return handleUnknown(e);
  }
}

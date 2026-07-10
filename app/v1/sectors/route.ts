import { handleUnknown, jsonPublic } from "@/lib/api";
import { listSectors } from "@/server/registry";

/** GET /v1/sectors — sectoren (Bijlage B) met risicogewichten en regelgeving. */
export async function GET() {
  try {
    return jsonPublic({ sectors: await listSectors() }, { cacheSeconds: 300 });
  } catch (e) {
    return handleUnknown(e);
  }
}

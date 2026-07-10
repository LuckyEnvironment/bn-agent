import { jsonPublic } from "@/lib/api";
import { BOEKEN } from "@/lib/handboek/data";

/** GET /v1/handboek — het volledige Handboek, machine-leesbaar. */
export async function GET() {
  return jsonPublic({ handboek: BOEKEN }, { cacheSeconds: 3600 });
}

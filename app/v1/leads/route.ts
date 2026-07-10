import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate } from "@/lib/api";
import { supabaseAnon } from "@/lib/supabase";

/** POST /v1/leads — wachtlijst/leadcapture (anon insert via RLS-policy). */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      companyName?: string;
      email?: string;
      sectorCode?: string;
      message?: string;
    };
    if (!body.companyName || !body.email || !/.+@.+\..+/.test(body.email)) {
      return apiError(400, "companyName en een geldig email zijn verplicht");
    }
    const { error } = await supabaseAnon().from("bna_leads").insert({
      company_name: body.companyName.slice(0, 200),
      email: body.email.slice(0, 200),
      sector_code: body.sectorCode ?? null,
      message: body.message?.slice(0, 2000) ?? null,
      source: "website",
    });
    if (error) return apiError(500, error.message);
    return jsonPrivate({ received: true }, 201);
  } catch (e) {
    return handleUnknown(e);
  }
}

import { supabaseService } from "@/lib/supabase";

/**
 * Append-only auditlog (Handboek Art. 8.20 lid 2 en Boek VI Titel 5).
 * Schrijffouten gooien: een registry- of escrow-mutatie zonder auditregel
 * mag niet doorgaan.
 */
export async function appendAudit(entry: {
  actorType: "system" | "api_client" | "vendor" | "admin" | "anonymous";
  actorId?: string;
  action: string;
  subjectType: string;
  subjectId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await supabaseService().from("bna_audit_log").insert({
    actor_type: entry.actorType,
    actor_id: entry.actorId ?? null,
    action: entry.action,
    subject_type: entry.subjectType,
    subject_id: entry.subjectId ?? null,
    payload: entry.payload ?? {},
  });
  if (error) {
    throw new Error(`Auditlog-schrijffout: ${error.message}`);
  }
}

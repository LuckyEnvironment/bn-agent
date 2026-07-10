import { createHash } from "crypto";

/**
 * Canonieke JSON-serialisatie: keys recursief gesorteerd, geen witruimte.
 * De cardHash is sha256 (hex) over deze canonieke vorm — vastgelegd in de
 * Agent Card Standaard en Handboek Boek VI (integriteitscontrole).
 */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries
    .map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`)
    .join(",")}}`;
}

export function computeCardHash(card: unknown): string {
  return createHash("sha256").update(canonicalize(card), "utf8").digest("hex");
}

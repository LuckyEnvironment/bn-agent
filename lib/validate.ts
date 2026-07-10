import Ajv from "ajv/dist/2020";
import type { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import agentCardSchema from "./schemas/agent-card.v1.json";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validateCard = ajv.compile(agentCardSchema);

export interface ValidationResult {
  valid: boolean;
  errors: { path: string; message: string }[];
}

export function validateAgentCard(card: unknown): ValidationResult {
  const valid = validateCard(card) as boolean;
  return {
    valid,
    errors: (validateCard.errors ?? []).map((e: ErrorObject) => ({
      path: e.instancePath || "/",
      message: e.message ?? "ongeldig",
    })),
  };
}

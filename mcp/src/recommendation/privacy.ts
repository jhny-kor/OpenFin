import type { RecommendationContext } from "./context.ts";

const SENSITIVE = /(?:account_?(?:number|no)|resident_?(?:registration|number)|registration_?(?:number|no)|rrn|ssn|card_?(?:number|no|pan|cvv|cvc)|password|secret|token|credential|private.?key|pin|auth(?:entication|orization)?)/i;
export function assertRecommendationContextSafe(context: RecommendationContext): void {
  const scan = (value: unknown, path: string): void => {
    if (SENSITIVE.test(path)) throw new Error(`sensitive field is not accepted: ${path}`);
    if (typeof value === "string" && (value.length > 4096 || /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/.test(value) || /\b\d{10,19}\b/.test(value))) throw new Error(`unsafe value is not accepted: ${path}`);
    if (Array.isArray(value)) value.forEach((item, index) => scan(item, `${path}[${index}]`));
    else if (value && typeof value === "object") Object.entries(value as Record<string, unknown>).forEach(([key, item]) => scan(item, `${path}.${key}`));
  };
  scan(context, "context");
}

export function recommendationAuditMetadata(context: RecommendationContext, domain: string, generation: string | null, candidateIds: readonly string[] = []): Record<string, unknown> {
  return { request_id: crypto.randomUUID(), domain, input_fields: [...new Set(["as_of", ...Object.keys(context.goal).map((key) => `goal.${key}`), ...Object.keys(context.facts).map((key) => `facts.${key}`), ...Object.keys(context.hard_constraints).map((key) => `hard_constraints.${key}`), ...Object.keys(context.preferences).map((key) => `preferences.${key}`)])].sort(), candidate_ids: candidateIds, generation_id: generation, policy_version: "openfin-recommendation-policy-v2" };
}

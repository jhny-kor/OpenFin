import type { RecommendationContext } from "./context.ts";
import { canonicalFactKey, contextFacts, CRITICAL_FACT_KEYS, FACT_SOURCE_CLASSES, normalizeFactSources, RECOMMENDATION_FACT_KEYS, REGISTERED_FACT_KEYS } from "./context.ts";

/** Facts accepted by decision rules; raw user objects never enter the rule engine. */
export type RecommendationFacts = Record<string, unknown>;
export function toRecommendationFacts(context: RecommendationContext): RecommendationFacts {
  return contextFacts(context);
}

export function hasFact(facts: RecommendationFacts, key: string): boolean {
  const value = key.split(".").reduce<unknown>((current, segment) => current && typeof current === "object" ? (current as Record<string, unknown>)[segment] : undefined, facts);
  return value !== undefined && value !== null;
}

export function registeredFact(key: string): boolean {
  return REGISTERED_FACT_KEYS.has(key) || REGISTERED_FACT_KEYS.has(canonicalFactKey(key));
}

export function validateFactSources(value: unknown): Record<string, string> {
  return normalizeFactSources(value, false);
}

export function criticalFactSource(facts: RecommendationFacts, key: string): string | undefined {
  const sources = validateFactSources(facts.fact_sources);
  return sources[canonicalFactKey(key)];
}

export function trustedCriticalFact(facts: RecommendationFacts, key: string): boolean {
  return !CRITICAL_FACT_KEYS.has(canonicalFactKey(key)) || ["user_asserted", "official_confirmed"].includes(criticalFactSource(facts, key) ?? "");
}

export { FACT_SOURCE_CLASSES };

import type { RecommendationContext } from "./context.ts";
import { contextFacts, RECOMMENDATION_FACT_KEYS } from "./context.ts";

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
  return key.startsWith("user.") ? RECOMMENDATION_FACT_KEYS.has(key.slice(5)) : key.startsWith("decision.") ? ["as_of", "term_months", "liquidity_horizon_months"].includes(key.slice(9)) : ["as_of", ...RECOMMENDATION_FACT_KEYS].includes(key);
}

import type { RecommendationContext } from "./context.ts";

/** Facts accepted by decision rules; raw user objects never enter the rule engine. */
export type RecommendationFacts = Record<string, unknown>;
export function toRecommendationFacts(context: RecommendationContext): RecommendationFacts {
  return {
    ...context.facts,
    ...Object.fromEntries(Object.entries(context.goal).filter(([, value]) => value != null).map(([key, value]) => [`goal.${key}`, value])),
    ...Object.fromEntries(Object.entries(context.hard_constraints).filter(([, value]) => value != null).map(([key, value]) => [`constraint.${key}`, value])),
  };
}

export function hasFact(facts: RecommendationFacts, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(facts, key) && facts[key] !== undefined && facts[key] !== null;
}

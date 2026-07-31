type RecordLike = Record<string, unknown>;
import { evaluateRules, type StructuredRule } from "./rule-engine.ts";

const finite = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : null;
const structuredBonusRules = (value: unknown): StructuredRule[] => Array.isArray(value)
  ? value.filter((entry): entry is StructuredRule => Boolean(entry) && typeof entry === "object" && (entry as RecordLike).rule_type === "bonus-rate" && typeof (entry as RecordLike).rule_id === "string" && Boolean((entry as RecordLike).predicate))
  : [];

/** Resolve only rates whose bonus predicates are explicitly satisfied by the user. */
export function resolveAttainableRate(item: RecordLike, preferences: RecordLike = {}) {
  const explicitBase = finite(item.base_rate_percent);
  // Legacy catalog rows often only expose a single rate. Preserve lookup
  // ranking for those rows, but mark the source scenario as legacy/unknown.
  const base = explicitBase ?? finite(item.maximum_rate_percent);
  const maximum = finite(item.maximum_rate_percent);
  if (base === null) return { rate_percent: null, base_rate_percent: null, maximum_rate_percent: maximum, scenario: "unknown", unknown_conditions: ["base_rate_unknown"], matched_conditions: [] };
  const userFacts = preferences.user_facts && typeof preferences.user_facts === "object" && !Array.isArray(preferences.user_facts) ? preferences.user_facts as RecordLike : preferences;
  const bonuses = structuredBonusRules(item.bonus_rate_rules);
  let rate = base;
  const matched_conditions: string[] = [];
  const unknown_conditions: string[] = [];
  const evaluated = evaluateRules(bonuses, { ...userFacts, as_of: userFacts.as_of ?? preferences.as_of ?? new Date().toISOString() });
  for (const bonus of bonuses) {
    if (!evaluated.matched.includes(bonus.rule_id)) continue;
    const bonusRate = finite(bonus.effect?.additional_rate_percent);
    if (bonusRate === null) continue;
    rate += bonusRate;
    matched_conditions.push(bonus.rule_id);
  }
  unknown_conditions.push(...evaluated.unknown);
  // Legacy condition strings remain searchable metadata only. They never
  // change an attainable rate without a structured, asserted rule.
  if (!bonuses.length && (Array.isArray(item.preferential_rate_bonuses) || Array.isArray(item.preferential_rate_conditions))) unknown_conditions.push("structured_bonus_rate_rules_missing");
  if (maximum !== null) rate = Math.min(rate, maximum);
  const scenario = explicitBase === null ? "legacy_single_rate" : matched_conditions.length ? "attainable" : (maximum !== null && maximum > base ? "base_with_unknown_bonuses" : "base");
  return { rate_percent: rate, base_rate_percent: base, attainable_rate_percent: rate, optimistic_rate_percent: maximum, maximum_rate_percent: maximum, scenario, unknown_conditions: [...new Set(unknown_conditions)].sort(), matched_conditions: [...new Set(matched_conditions)].sort() };
}

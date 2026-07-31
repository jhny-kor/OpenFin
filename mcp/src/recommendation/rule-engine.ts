export type RuleStatus = "matched" | "failed" | "unknown";
export type Predicate = { fact?: string; operator: string; expected?: unknown; conditions?: Predicate[] };
export type StructuredRule = { rule_id: string; rule_type: string; predicate: Predicate; effect?: Record<string, unknown>; unknown_policy?: "not_applied" | "exclude" | "review"; valid_from?: string | null; valid_to?: string | null; field_assertions?: unknown[] };

const has = (facts: Record<string, unknown>, key: string): boolean => Object.prototype.hasOwnProperty.call(facts, key) && facts[key] !== null && facts[key] !== undefined;
function compare(actual: unknown, operator: string, expected: unknown): RuleStatus {
  if (actual === undefined || actual === null) return "unknown";
  if (operator === "eq") return actual === expected ? "matched" : "failed";
  if (operator === "neq") return actual !== expected ? "matched" : "failed";
  if (operator === "in") return Array.isArray(expected) && expected.includes(actual) ? "matched" : "failed";
  if (operator === "not_in") return Array.isArray(expected) && !expected.includes(actual) ? "matched" : "failed";
  if (operator === "gte") return typeof actual === "number" && typeof expected === "number" ? (actual >= expected ? "matched" : "failed") : "unknown";
  if (operator === "lte") return typeof actual === "number" && typeof expected === "number" ? (actual <= expected ? "matched" : "failed") : "unknown";
  if (operator === "between") return Array.isArray(expected) && expected.length === 2 && typeof actual === "number" && typeof expected[0] === "number" && typeof expected[1] === "number" ? (actual >= expected[0] && actual <= expected[1] ? "matched" : "failed") : "unknown";
  if (operator === "contains") return Array.isArray(actual) ? (actual.includes(expected) ? "matched" : "failed") : "unknown";
  return "unknown";
}
export function evaluatePredicate(predicate: Predicate, facts: Record<string, unknown>): RuleStatus {
  if (["and", "or", "not"].includes(predicate.operator)) {
    const statuses = (predicate.conditions ?? []).map((condition) => evaluatePredicate(condition, facts));
    if (!statuses.length) return "unknown";
    if (predicate.operator === "and") return statuses.includes("failed") ? "failed" : statuses.includes("unknown") ? "unknown" : "matched";
    if (predicate.operator === "or") return statuses.includes("matched") ? "matched" : statuses.includes("unknown") ? "unknown" : "failed";
    return statuses[0] === "matched" ? "failed" : statuses[0] === "failed" ? "matched" : "unknown";
  }
  return predicate.fact && has(facts, predicate.fact) ? compare(facts[predicate.fact], predicate.operator, predicate.expected) : "unknown";
}
export function evaluateRules(rules: readonly StructuredRule[], facts: Record<string, unknown>) {
  const matched: string[] = []; const failed: string[] = []; const unknown: string[] = []; const effects: Record<string, unknown>[] = [];
  for (const rule of rules) {
    if (!Array.isArray(rule.field_assertions) || rule.field_assertions.length === 0) { unknown.push(rule.rule_id); continue; }
    const asOf = typeof facts.as_of === "string" ? facts.as_of : new Date().toISOString();
    if ((rule.valid_from && asOf < rule.valid_from) || (rule.valid_to && asOf > rule.valid_to)) { unknown.push(rule.rule_id); continue; }
    const status = evaluatePredicate(rule.predicate, facts);
    if (status === "matched") { matched.push(rule.rule_id); if (rule.effect) effects.push(rule.effect); }
    else if (status === "failed") failed.push(rule.rule_id);
    else if (rule.unknown_policy === "exclude") failed.push(rule.rule_id);
    else unknown.push(rule.rule_id);
  }
  return { matched, failed, unknown, effects };
}

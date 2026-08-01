export type RuleStatus = "matched" | "failed" | "unknown";
export type Predicate = { fact?: string; operator: string; expected?: unknown; conditions?: Predicate[] };
export type StructuredRule = { rule_id: string; rule_type: string; predicate: Predicate; effect?: Record<string, unknown>; unknown_policy?: "not_applied" | "exclude" | "review"; valid_from?: string | null; valid_to?: string | null; field_assertions?: unknown[] };

const read = (facts: Record<string, unknown>, key: string): unknown => {
  if (Object.prototype.hasOwnProperty.call(facts, key)) return facts[key];
  return key.split(".").reduce<unknown>((value, segment) => value && typeof value === "object" ? (value as Record<string, unknown>)[segment] : undefined, facts);
};
const has = (facts: Record<string, unknown>, key: string): boolean => read(facts, key) !== null && read(facts, key) !== undefined;
function compare(actual: unknown, operator: string, expected: unknown): RuleStatus {
  if (actual === undefined || actual === null) return "unknown";
  if (operator === "eq") return actual === expected ? "matched" : "failed";
  if (operator === "neq") return actual !== expected ? "matched" : "failed";
  if (operator === "in") return Array.isArray(expected) && expected.includes(actual) ? "matched" : "failed";
  if (operator === "not_in") return Array.isArray(expected) && !expected.includes(actual) ? "matched" : "failed";
  if (operator === "gte") return typeof actual === "number" && typeof expected === "number" ? (actual >= expected ? "matched" : "failed") : "unknown";
  if (operator === "lte") return typeof actual === "number" && typeof expected === "number" ? (actual <= expected ? "matched" : "failed") : "unknown";
  if (operator === "gt") return typeof actual === "number" && typeof expected === "number" ? (actual > expected ? "matched" : "failed") : "unknown";
  if (operator === "lt") return typeof actual === "number" && typeof expected === "number" ? (actual < expected ? "matched" : "failed") : "unknown";
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
  return predicate.fact && has(facts, predicate.fact) ? compare(read(facts, predicate.fact), predicate.operator, predicate.expected) : "unknown";
}
const criticalFact = (fact: string) => new Set(["user.age_years", "user.residency_code", "user.is_new_customer", "user.customer_type", "user.gender", "user.employment_type"]).has(fact);
const predicateFacts = (predicate: Predicate): string[] => [
  ...(typeof predicate.fact === "string" ? [predicate.fact] : []),
  ...(predicate.conditions ?? []).flatMap(predicateFacts),
];
const ruleAssertionsReady = (rule: StructuredRule, asOf: string | undefined) => {
  const assertions = Array.isArray(rule.field_assertions) ? rule.field_assertions.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object") : [];
  if (!assertions.length) return false;
  const legacySynthetic = assertions.every(assertion => assertion.verification_status === "verified" && assertion.source_id === undefined);
  return assertions.every(assertion => assertion.verification_status === "verified"
    && (assertion.freshness_status === undefined || assertion.freshness_status === "current")
    && assertion.conflict !== true
    && (legacySynthetic || Boolean(assertion.reviewer && assertion.reviewed_at && assertion.receipt_checksum))
    && (!asOf || !assertion.valid_to || String(assertion.valid_to) >= asOf));
};
export function evaluateRules(rules: readonly StructuredRule[], facts: Record<string, unknown>) {
  const matched: string[] = []; const failed: string[] = []; const unknown: string[] = []; const effects: Record<string, unknown>[] = [];
  for (const rule of rules) {
    const asOfValue = typeof facts.as_of === "string" ? facts.as_of : typeof (facts.decision as Record<string, unknown> | undefined)?.as_of === "string" ? String((facts.decision as Record<string, unknown>).as_of) : undefined;
    if (!ruleAssertionsReady(rule, asOfValue)) { unknown.push(rule.rule_id); continue; }
    const factSources = facts.fact_sources && typeof facts.fact_sources === "object" && !Array.isArray(facts.fact_sources) ? facts.fact_sources as Record<string, unknown> : {};
    const factNames = predicateFacts(rule.predicate);
    if (factNames.some(fact => criticalFact(fact) && (factSources[fact] === "system_inferred" || factSources[fact.replace(/^user\./, "")] === "system_inferred"))) { unknown.push(rule.rule_id); continue; }
    const asOf = asOfValue ? Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(asOfValue) ? `${asOfValue}T23:59:59Z` : asOfValue) : null;
    const from = rule.valid_from ? Date.parse(rule.valid_from) : Number.NEGATIVE_INFINITY;
    const to = rule.valid_to ? Date.parse(rule.valid_to) : Number.POSITIVE_INFINITY;
    if ((rule.valid_from || rule.valid_to) && (asOf === null || !Number.isFinite(asOf) || asOf < from || asOf > to)) { unknown.push(rule.rule_id); continue; }
    const status = evaluatePredicate(rule.predicate, facts);
    if (status === "matched") { matched.push(rule.rule_id); if (rule.effect) effects.push(rule.effect); }
    else if (status === "failed") failed.push(rule.rule_id);
    else if (rule.unknown_policy === "exclude") failed.push(rule.rule_id);
    else unknown.push(rule.rule_id);
  }
  return { matched, failed, unknown, effects };
}

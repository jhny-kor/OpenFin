import { sha256 } from './common.mjs';

const sourceValue = (source = {}) => ({
  source_id: source.source_id,
  original_url: source.url,
  locator: { kind: 'document-section', value: String(source.locator || 'source') },
});

const assertion = (field, source, observedAt, value) => ({
  assertion_id: `assertion.rule.${sha256({ field, source, observedAt, value }).slice(7, 23)}`,
  field,
  ...sourceValue(source),
  observed_at: observedAt,
  valid_from: observedAt,
  valid_to: source.valid_to ?? null,
  value_hash: sha256(value),
  verification_status: 'unverified',
  freshness_status: 'unknown',
  conflict: false,
  verification_method: 'official_source_collection',
  reviewer: null,
  reviewed_at: null,
  receipt_checksum: sha256({ field, source, observedAt, value }),
});

const withAssertions = (prefix, rule, source, observedAt) => ({
  ...rule,
  field_assertions: [
    assertion(`${prefix}.predicate`, source, observedAt, rule.predicate),
    ...(rule.effect === undefined ? [] : [assertion(`${prefix}.effect`, source, observedAt, rule.effect)]),
    assertion(`${prefix}.valid_from`, source, observedAt, rule.valid_from),
    assertion(`${prefix}.valid_to`, source, observedAt, rule.valid_to),
  ],
});

const push = (output, predicate) => { if (predicate) output.push(predicate); };

export function atomicEligibilityPredicates(text = '') {
  const value = String(text || '').trim();
  if (!value || /제한\s*없|무관|모든 고객/i.test(value)) return [];
  const predicates = [];
  const age = value.match(/(\d{1,3})\s*세\s*(이상|초과|미만|이하)/);
  if (age) push(predicates, { fact: 'user.age_years', operator: ({ '이상': 'gte', '초과': 'gt', '미만': 'lt', '이하': 'lte' })[age[2]], expected: Number(age[1]) });
  if (/신규\s*(고객|가입|회원)|첫\s*(거래|가입)/.test(value)) push(predicates, { fact: 'user.is_new_customer', operator: 'eq', expected: true });
  if (/사업자|법인/.test(value)) push(predicates, { fact: 'user.customer_type', operator: 'eq', expected: 'business' });
  else if (/개인/.test(value)) push(predicates, { fact: 'user.customer_type', operator: 'eq', expected: 'individual' });
  if (/여성|여자/.test(value)) push(predicates, { fact: 'user.gender', operator: 'eq', expected: 'female' });
  if (/직장인|근로자|급여소득/.test(value)) push(predicates, { fact: 'user.employment_type', operator: 'eq', expected: 'employee' });
  const residency = value.match(/(?:서울|부산|대구|인천|광주|대전|울산|세종|제주|경기|강원|충북|충남|전북|전남|경북|경남)/);
  if (residency && /거주|주소|지역/.test(value)) push(predicates, { fact: 'user.residency_code', operator: 'eq', expected: residency[0] });
  if (!predicates.length) push(predicates, { fact: 'user.eligibility_review_status', operator: 'eq', expected: 'verified' });
  return predicates;
}

export function compileEligibilityRules({ text, source, observedAt, validTo, rulePrefix }) {
  return atomicEligibilityPredicates(text).map((predicate, index) => withAssertions(`${rulePrefix}.${index}`, {
    rule_id: `${rulePrefix}.${index}`,
    rule_type: 'eligibility',
    predicate,
    unknown_policy: 'review',
    valid_from: observedAt,
    valid_to: validTo,
    source_text: String(text || ''),
    atomic_predicate: true,
  }, source, observedAt));
}

export function compileBonusRules({ conditions = [], optionId, source, observedAt, validTo, maximumRatePercent }) {
  const cap = Number.isFinite(Number(maximumRatePercent)) ? Number(maximumRatePercent) : null;
  return conditions.filter(condition => condition && typeof condition.fact === 'string' && Number.isFinite(Number(condition.additional_rate_percent))).map((condition, index) => {
    const effect = {
      additional_rate_percent: Number(condition.additional_rate_percent),
      cumulative_group: condition.cumulative_group || `preferential-rate:${optionId}`,
      ...(cap === null ? {} : { max_cumulative_rate_percent: cap }),
    };
    return withAssertions(`bonus_rate_rules.${index}`, {
      rule_id: condition.rule_id || `rule.bonus.${sha256({ optionId, condition, index }).slice(7, 23)}`,
      rule_type: 'bonus-rate',
      predicate: { fact: condition.fact, operator: condition.operator || 'eq', expected: condition.expected ?? true },
      effect,
      option_scope: { option_ids: [optionId] },
      unknown_policy: 'not_applied',
      valid_from: observedAt,
      valid_to: validTo,
    }, source, observedAt);
  });
}

export function compileEarlyTerminationRule({ source, observedAt, validTo, schedule, ruleId }) {
  const normalized = Array.isArray(schedule) ? schedule.map((entry) => {
    const condition = String(entry?.condition ?? entry?.elapsed_period ?? '').trim();
    const months = condition.match(/(\d+)\s*개월\s*(?:미만|이내)/);
    const from = condition.match(/(\d+)\s*개월\s*(?:이상|초과)/);
    return {
      ...(months ? { until_elapsed_months: Number(months[1]) } : {}),
      ...(from ? { from_elapsed_months: Number(from[1]) + (condition.includes('초과') ? 1 : 0) } : {}),
      condition,
      ...(typeof entry?.rate_percent === 'number' ? { rate_percent: entry.rate_percent } : {}),
      ...(typeof entry?.contract_rate_multiplier_percent === 'number' ? { contract_rate_multiplier_percent: entry.contract_rate_multiplier_percent } : {}),
      ...(typeof entry?.formula === 'string' ? { formula: entry.formula } : {}),
    };
  }).filter(entry => entry.condition && (entry.rate_percent !== undefined || entry.contract_rate_multiplier_percent !== undefined || entry.formula)) : [];
  const effect = normalized.length ? { rate_schedule: normalized } : { unresolved_source_text: 'early termination schedule requires manual source review' };
  return withAssertions('early_termination_rules.0', {
    rule_id: ruleId,
    rule_type: 'early-termination',
    predicate: { fact: 'withdrawal.before_maturity', operator: 'eq', expected: true },
    effect,
    unknown_policy: 'review',
    valid_from: observedAt,
    valid_to: validTo,
  }, source, observedAt);
}

if (process.argv[1] && process.argv[1].endsWith('compile-financial-rules.mjs')) {
  console.log(JSON.stringify({ ok: true, atomic_predicate_examples: atomicEligibilityPredicates('만 19세 이상 신규 개인 고객') }, null, 2));
}

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

const REGIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '제주', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남'];
const ageOperator = { 이상: 'gte', 초과: 'gt', 미만: 'lt', 이하: 'lte' };
const unrestricted = /제한\s*없|무관|모든 고객/i;

const combinedPredicate = (predicates) => predicates.length === 1 ? predicates[0] : { operator: 'and', conditions: predicates };

function parseEligibility(text = '') {
  const value = String(text || '').trim();
  if (!value || unrestricted.test(value)) return { predicates: [], unresolved: false };
  let residue = value;
  const predicates = [];
  const orConnectorCount = (value.match(/또는|혹은|\bor\b/gi) || []).length;
  const consume = (pattern, handler) => {
    const matches = [...residue.matchAll(pattern)];
    if (!matches.length) return;
    for (const match of matches) handler(match);
    residue = residue.replace(pattern, ' ');
  };

  consume(/만?\s*(\d{1,3})\s*세\s*(이상|초과|미만|이하)/g, match => predicates.push({ fact: 'user.age_years', operator: ageOperator[match[2]], expected: Number(match[1]) }));
  consume(/신규\s*(?:고객|가입|회원)|첫\s*(?:거래|가입)/g, () => predicates.push({ fact: 'user.is_new_customer', operator: 'eq', expected: true }));

  const customerTypes = [];
  consume(/개인사업자|법인|개인|사업자/g, match => {
    const type = match[0] === '개인사업자' ? 'sole_proprietor' : match[0] === '법인' ? 'corporation' : match[0] === '개인' ? 'individual' : 'business';
    if (!customerTypes.includes(type)) customerTypes.push(type);
  });
  if (customerTypes.length === 1) predicates.push({ fact: 'user.customer_type', operator: 'eq', expected: customerTypes[0] });
  if (customerTypes.length > 1) predicates.push({ fact: 'user.customer_type', operator: 'in', expected: customerTypes });

  consume(/여성|여자|남성|남자/g, match => predicates.push({ fact: 'user.gender', operator: 'eq', expected: /여성|여자/.test(match[0]) ? 'female' : 'male' }));
  consume(/직장인|근로자|급여소득/g, () => predicates.push({ fact: 'user.employment_type', operator: 'eq', expected: 'employee' }));

  let regionCount = 0;
  if (/거주|주소|지역/.test(value)) {
    const regions = [...new Set([...residue.matchAll(new RegExp(REGIONS.join('|'), 'g'))].map(match => match[0]))];
    regionCount = regions.length;
    if (regions.length) {
      predicates.push({ fact: 'user.residency_code', operator: regions.length === 1 ? 'eq' : 'in', expected: regions.length === 1 ? regions[0] : regions });
      residue = residue.replace(new RegExp(REGIONS.join('|'), 'g'), ' ');
    }
  }

  const recognizedOrGroups = (customerTypes.length > 1 ? customerTypes.length - 1 : 0)
    + (regionCount > 1 ? regionCount - 1 : 0);

  // These words connect recognized clauses. Any remaining meaningful text is
  // deliberately unresolved; executing a guessed eligibility rule is unsafe.
  residue = residue.replace(/실명(?:의)?|고객|회원|가입|대상|으로|이며|이고|및|또는|혹은|그리고|포함|거주자?|주소|지역|의|인|한|해당|에서|부터|까지|만|세|제한|없음|조건|상품|예금|적금/g, ' ');
  const unsupportedOr = orConnectorCount > recognizedOrGroups;
  const unresolved = !predicates.length || unsupportedOr || residue.replace(/[\s,./()·\-]/g, '') !== '';
  return { predicates, unresolved };
}

export function atomicEligibilityPredicates(text = '') {
  return parseEligibility(text).predicates;
}

export function compileEligibilityRules({ text, source, observedAt, validTo, rulePrefix }) {
  const parsed = parseEligibility(text);
  if (!parsed.predicates.length && !parsed.unresolved) return [];
  const resolved = !parsed.unresolved;
  return [withAssertions(`${rulePrefix}.0`, {
    rule_id: `${rulePrefix}.0`,
    rule_type: 'eligibility',
    predicate: resolved ? combinedPredicate(parsed.predicates) : { fact: 'user.eligibility_review_status', operator: 'eq', expected: 'verified' },
    unknown_policy: 'review',
    valid_from: observedAt,
    valid_to: validTo,
    source_text: String(text || ''),
    atomic_predicate: resolved && parsed.predicates.length === 1,
    executable: resolved,
    rule_status: resolved ? 'resolved' : 'unresolved',
    ...(resolved ? {} : { blocker: 'ELIGIBILITY_RULE_UNRESOLVED' }),
  }, source, observedAt)];
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
      executable: true,
      rule_status: 'resolved',
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
  const resolved = normalized.length > 0;
  const effect = resolved ? { rate_schedule: normalized } : { unresolved_source_text: 'early termination schedule requires manual source review' };
  return withAssertions('early_termination_rules.0', {
    rule_id: ruleId,
    rule_type: 'early-termination',
    predicate: { fact: 'withdrawal.before_maturity', operator: 'eq', expected: true },
    effect,
    unknown_policy: 'review',
    executable: resolved,
    rule_status: resolved ? 'resolved' : 'unresolved',
    ...(resolved ? {} : { blocker: 'EARLY_TERMINATION_RULE_UNRESOLVED' }),
    valid_from: observedAt,
    valid_to: validTo,
  }, source, observedAt);
}

if (process.argv[1] && process.argv[1].endsWith('compile-financial-rules.mjs')) {
  console.log(JSON.stringify({ ok: true, atomic_predicate_examples: atomicEligibilityPredicates('만 19세 이상 신규 개인 고객') }, null, 2));
}

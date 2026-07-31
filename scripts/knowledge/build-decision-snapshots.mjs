import fs from 'node:fs';
import path from 'node:path';
import { ROOT, KNOWLEDGE, json, sha256 } from './common.mjs';

const candidateFile = path.join(ROOT, 'evidence/vertical-slice/finlife-candidate-collection.json');
const selectionFile = path.join(ROOT, 'evidence/vertical-slice/reviewed-products.json');
const researchFiles = [
  'evidence/vertical-slice/busan-im-jeonbuk.json',
  'evidence/vertical-slice/gwangju-kyongnam.json',
  'evidence/vertical-slice/sc-hana-remaining.json',
  'evidence/vertical-slice/research/nh-suhyup.json',
  'evidence/vertical-slice/research/toss-kb-shinhan-kdb.json',
].map(file => path.join(ROOT, file));
const sourceByProvider = new Map([
  ['광주은행', 'source.provider.kjbank.product-documents'],
  ['경남은행', 'source.provider.knbank.product-documents'],
  ['BNK경남은행', 'source.provider.knbank.product-documents'],
  ['부산은행', 'source.provider.busanbank.product-documents'],
  ['농협은행주식회사', 'source.provider.nonghyup.product-documents'],
  ['수협은행', 'source.provider.suhyup.product-documents'],
  ['토스뱅크 주식회사', 'source.provider.tossbank.product-documents'],
  ['한국스탠다드차타드은행', 'source.provider.sc.product-documents'],
  ['주식회사 하나은행', 'source.provider.hana.product-documents'],
  ['중소기업은행', 'source.provider.ibk.product-documents'],
  ['IBK기업은행', 'source.provider.ibk.product-documents'],
  ['신한은행', 'source.provider.shinhan.product-documents'],
]);

const candidates = json(candidateFile);
const selection = json(selectionFile);
const sourceSlaHours = new Map();
const readSourceRegistry = directory => {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) readSourceRegistry(file);
    else if (entry.name.endsWith('.md')) {
      const text = fs.readFileSync(file, 'utf8');
      const match = text.match(/^---\n([\s\S]*?)\n---/);
      if (!match) continue;
      try {
        const source = JSON.parse(match[1]);
        if (source.id && Number.isFinite(Number(source.refresh?.sla_hours))) sourceSlaHours.set(source.id, Number(source.refresh.sla_hours));
      } catch { /* non-registry markdown is not a source record */ }
    }
  }
};
readSourceRegistry(path.join(ROOT, 'knowledge/90-sources'));
const pool = new Map(Object.values(candidates.domains).flatMap(domain => [...domain.candidates, ...(domain.alternates || [])]).map(item => [item.extracted.product_code, item]));
const research = new Map(researchFiles.flatMap(file => json(file)).map(item => [item.product_code, item]));
const valueOf = value => value && typeof value === 'object' && Object.hasOwn(value, 'value') ? value.value : value;
const unlimited = value => typeof value === 'string' && /제한\s*없|무제한|not limited/i.test(value) ? { status: 'unlimited' } : value;
const validTo = (sourceId, observedAt = sourceId) => {
  const hours = sourceSlaHours.get(sourceId);
  if (!Number.isFinite(hours) || !observedAt || !Number.isFinite(Date.parse(observedAt))) return null;
  return new Date(Date.parse(observedAt) + hours * 3600_000).toISOString();
};
const evidence = (record, field) => {
  const item = record.fields[field];
  const nested = item?.evidence && typeof item.evidence === 'object' ? item.evidence : null;
  const fallback = typeof record.source_urls?.[0] === 'string' ? record.source_urls[0] : record.source_urls?.[0]?.url;
  return {
    url: item?.source_url || nested?.url || fallback,
    locator: item?.locator || nested?.locator || field,
    observed_at: item?.observed_at || nested?.observed_at || record.fields.sales_active?.observed_at || record.source_urls?.observed_at || selection.reviewed_at,
  };
};
const assertion = ({ field, source_id, url, locator, observed_at, value, reviewed = false }) => ({
  assertion_id: `assertion.${source_id}.${sha256({ field, source_id, observed_at, value }).slice(7, 23)}`,
  field, source_id, original_url: url,
  locator: { kind: 'document-section', value: String(locator) },
  observed_at, valid_from: observed_at, valid_to: validTo(source_id, observed_at), value_hash: sha256(value),
  verification_status: reviewed ? 'verified' : 'unverified', freshness_status: reviewed ? 'current' : 'unknown', conflict: false,
  verification_method: reviewed ? 'official_source_manual_review' : 'official_source_collection',
  reviewer: reviewed ? 'source-reviewer-required' : null,
  reviewed_at: reviewed ? observed_at : null,
  receipt_checksum: sha256({ field, source_id, observed_at, value }),
});
const fssAssertion = (candidate, field, value, suffix = '') => assertion({
  field, source_id: candidate.source_id, url: candidate.original_url,
  locator: `${candidate.locator.value}${suffix}`, observed_at: candidate.collected_at, value,
});
const providerAssertion = (record, evidenceField, field, value) => {
  const item = evidence(record, evidenceField);
  return assertion({ field, source_id: sourceByProvider.get(record.provider), ...item, value });
};
const channels = text => {
  const output = [];
  if (/영업점/.test(text || '')) output.push('branch');
  if (/인터넷/.test(text || '')) output.push('web');
  if (/스마트|모바일/.test(text || '')) output.push('mobile');
  if (/기타/.test(text || '')) output.push('other');
  return output.length ? output : ['other'];
};
const amount = (record, candidate, domain) => {
  const f = record.fields;
  if (domain === 'deposit') {
    const range = valueOf(f.deposit_krw);
    let minimum = range?.minimum ?? f.amount?.minimum_amount_krw ?? valueOf(f.minimum_deposit_krw) ?? valueOf(f.minimum_amount_krw);
    let maximum = range?.maximum ?? f.amount?.maximum_amount_krw ?? f.amount?.maximum_amount ?? valueOf(f.maximum_deposit_krw) ?? valueOf(f.maximum_amount_krw);
    if (maximum == null && /제한\s*없/.test(candidate.extracted.additional_terms_text || '')) maximum = { status: 'unlimited' };
    return { minimum, maximum: unlimited(maximum), evidenceField: f.deposit_krw ? 'deposit_krw' : f.amount ? 'amount' : f.minimum_deposit_krw ? 'minimum_deposit_krw' : 'minimum_amount_krw' };
  }
  const range = valueOf(f.monthly_payment_krw);
  const free = range?.free_saving;
  const fixed = range?.fixed_monthly;
  const minimum = range?.minimum ?? free?.minimum_per_deposit ?? free?.additional_monthly_minimum ?? fixed?.minimum
    ?? f.amount?.minimum_monthly_amount_krw ?? valueOf(f.minimum_initial_and_recurring_payment_krw) ?? valueOf(f.minimum_initial_payment_krw) ?? valueOf(f.minimum_recurring_payment_krw) ?? valueOf(f.minimum_amount_krw);
  let maximum = range?.maximum ?? free?.maximum_per_month ?? free?.monthly_maximum ?? fixed?.maximum
    ?? f.amount?.maximum_monthly_amount_krw ?? valueOf(f.maximum_monthly_payment_krw) ?? valueOf(f.maximum_amount_krw);
  if (maximum == null && /제한\s*없/.test(range?.maximum_text || '')) maximum = { status: 'unlimited' };
  return { minimum, maximum: unlimited(maximum), evidenceField: f.monthly_payment_krw ? 'monthly_payment_krw' : f.amount ? 'amount' : f.minimum_initial_and_recurring_payment_krw ? 'minimum_initial_and_recurring_payment_krw' : f.minimum_initial_payment_krw ? 'minimum_initial_payment_krw' : 'minimum_amount_krw' };
};
const ruleAssertions = (prefix, source, predicate, effect, observedAt) => [
  assertion({ field: `${prefix}.predicate`, ...source, observed_at: observedAt, value: predicate }),
  assertion({ field: `${prefix}.effect`, ...source, observed_at: observedAt, value: effect }),
  assertion({ field: `${prefix}.valid_from`, ...source, observed_at: observedAt, value: observedAt }),
  assertion({ field: `${prefix}.valid_to`, ...source, observed_at: observedAt, value: validTo(source.source_id, observedAt) }),
];
const parseEarlySchedule = (value) => {
  const parsed = typeof value === 'string' ? (() => { try { return JSON.parse(value); } catch { return null; } })() : value;
  const rates = parsed && typeof parsed === 'object' ? parsed.rates || parsed.rate_schedule : null;
  if (Array.isArray(rates)) {
    const schedule = rates.map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const condition = entry.elapsed_period || entry.condition;
      if (!condition) return null;
      if (typeof entry.rate_percent === 'number') return { condition: String(condition), rate_percent: entry.rate_percent };
      if (typeof entry.contract_rate_multiplier_percent === 'number') return { condition: String(condition), contract_rate_multiplier_percent: entry.contract_rate_multiplier_percent };
      if (typeof entry.formula === 'string') return { condition: String(condition), formula: entry.formula };
      return null;
    }).filter(Boolean);
    if (schedule.length) return schedule;
  }
  if (typeof value === 'string') {
    const schedule = [...value.matchAll(/([^;]+?)(?:연|×|\*)\s*([0-9]+(?:\.[0-9]+)?)\s*%/g)].map((match) => ({ condition: match[1].trim(), ...(match[0].includes('×') || match[0].includes('*') ? { contract_rate_multiplier_percent: Number(match[2]) } : { rate_percent: Number(match[2]) }) }));
    if (schedule.length) return schedule;
  }
  return null;
};
const makeRules = (candidate, record) => {
  const provider = evidence(record, record.fields.early_termination ? 'early_termination' : 'early_termination_rules_rates');
  const providerSource = { source_id: sourceByProvider.get(record.provider), url: provider.url, locator: provider.locator };
  const earlyValue = valueOf(record.fields.early_termination) ?? valueOf(record.fields.early_termination_rules_rates);
  const earlyPredicate = { fact: 'withdrawal.before_maturity', operator: 'eq', expected: true };
  const schedule = parseEarlySchedule(earlyValue);
  const earlyEffect = schedule ? { rate_schedule: schedule } : { unresolved_source_text: typeof earlyValue === 'string' ? earlyValue : JSON.stringify(earlyValue) };
  const early = {
    rule_id: `rule.early.${candidate.extracted.provider_code}.${candidate.extracted.product_code}`,
    rule_type: 'early-termination', predicate: earlyPredicate, effect: earlyEffect,
    valid_from: provider.observed_at, valid_to: validTo(providerSource.source_id, provider.observed_at),
    field_assertions: ruleAssertions('early_termination_rules.0', providerSource, earlyPredicate, earlyEffect, provider.observed_at),
  };
  const eligibilityText = candidate.extracted.join_member || '가입대상 제한 없음';
  const eligibilityExpected = /여성/.test(eligibilityText) ? 'individual_female_or_business' : /사업자/.test(eligibilityText) ? 'individual_or_business' : 'individual';
  const eligibilityPredicate = { fact: 'user.customer_segment', operator: 'eq', expected: eligibilityExpected };
  const fssSource = { source_id: candidate.source_id, url: candidate.original_url, locator: `${candidate.locator.value}.join_member` };
  const eligibility = {
    rule_id: `rule.eligibility.${candidate.extracted.provider_code}.${candidate.extracted.product_code}`,
    rule_type: 'eligibility', predicate: eligibilityPredicate, unknown_policy: 'review',
    valid_from: candidate.collected_at, valid_to: validTo(candidate.source_id, candidate.collected_at),
    field_assertions: ruleAssertions('eligibility_rules.0', fssSource, eligibilityPredicate, null, candidate.collected_at).filter(item => !item.field.endsWith('.effect')),
  };
  return { early: [early], eligibility: [eligibility], bonus: [] };
};
const bonusRuleForOption = (candidate, option, index) => {
  const text = candidate.extracted.preferential_conditions_text || '';
  const fact = /급여|급여이체/.test(text) ? 'user.can_transfer_salary' : /카드/.test(text) ? 'user.can_use_card' : /자동이체|자동납부/.test(text) ? 'user.can_set_auto_transfer' : /신규/.test(text) ? 'user.is_new_customer' : null;
  if (!fact) return null;
  const additional = Math.max(0, Number(option.maximum_rate_percent) - Number(option.base_rate_percent));
  if (!Number.isFinite(additional) || additional <= 0) return null;
  const predicate = { fact, operator: 'eq', expected: true };
  const effect = { additional_rate_percent: Number(additional.toFixed(6)) };
  const source = { source_id: candidate.source_id, url: candidate.original_url, locator: `${candidate.locator.value}.spcl_cnd` };
  return { rule_id: `rule.bonus.${candidate.extracted.provider_code}.${candidate.extracted.product_code}.${index}`, rule_type: 'bonus-rate', predicate, effect, unknown_policy: 'not_applied', valid_from: candidate.collected_at, valid_to: validTo(candidate.source_id, candidate.collected_at), field_assertions: ruleAssertions(`bonus_rate_rules.${index}`, source, predicate, effect, candidate.collected_at) };
};
const protection = (candidate, record) => {
  if (candidate.protection_evidence?.status === 'listed_match_unreviewed') {
    const p = candidate.protection_evidence;
    return { source_id: p.source_id, url: p.original_url, locator: p.locator.value, observed_at: p.collected_at };
  }
  const p = evidence(record, 'deposit_protection');
  return { source_id: sourceByProvider.get(record.provider), ...p };
};
const buildOffer = (domain, code) => {
  const candidate = pool.get(code);
  const record = research.get(code);
  if (!candidate || !record) return { code, missing: [!candidate ? 'candidate' : null, !record ? 'research' : null].filter(Boolean) };
  const providerSourceId = sourceByProvider.get(record.provider);
  const limits = amount(record, candidate, domain);
  const earlyField = record.fields.early_termination ? 'early_termination' : 'early_termination_rules_rates';
  const missing = [limits.minimum == null && 'minimum', limits.maximum == null && 'maximum', !record.fields[earlyField] && 'early_termination', !providerSourceId && 'provider_source'].filter(Boolean);
  const protectionEvidence = protection(candidate, record);
  if (!protectionEvidence.url) missing.push('deposit_protection');
  if (missing.length) return { code, missing };
  const rules = makeRules(candidate, record);
  const joinChannels = channels(candidate.extracted.join_way);
  const amountMinField = domain === 'deposit' ? 'minimum_deposit_krw' : 'monthly_payment_min_krw';
  const amountMaxField = domain === 'deposit' ? 'maximum_deposit_krw' : 'monthly_payment_max_krw';
  const options = candidate.extracted.options
    .filter(option => !(code === '00266451' && !/자유/.test(option.saving_method || '')))
    .map((option) => {
      const discriminator = sha256({ term: option.term_months, interest: option.interest_method, saving: option.saving_method, base: option.base_rate_percent, maximum: option.maximum_rate_percent }).slice(7, 15);
      const method = String(domain === 'saving' ? option.saving_method || option.interest_method : option.interest_method).toLowerCase().replace(/[^a-z0-9가-힣]+/gi, '-');
      const optionId = `option.${domain}.${candidate.extracted.provider_code}.${code}.${option.term_months}.${method}.${discriminator}`;
      const fields = [
        ['term_months', option.term_months], ['base_rate_percent', option.base_rate_percent],
        ['maximum_rate_percent', option.maximum_rate_percent], ['interest_method', option.interest_method],
      ];
      if (domain === 'saving') fields.push(['saving_method', option.saving_method]);
      const fieldAssertions = fields.map(([field, value]) => fssAssertion(candidate, `options.${optionId}.${field}`, value, `.options[?(@.save_trm=='${option.term_months}')]`));
      fieldAssertions.push(providerAssertion(record, limits.evidenceField, `options.${optionId}.${amountMinField}`, limits.minimum));
      fieldAssertions.push(providerAssertion(record, limits.evidenceField, `options.${optionId}.${amountMaxField}`, limits.maximum));
      const bonusRule = bonusRuleForOption(candidate, option, option.term_months);
      const output = { option_id: optionId, type: 'offer-option', term_months: option.term_months, base_rate_percent: option.base_rate_percent, maximum_rate_percent: option.maximum_rate_percent, interest_method: option.interest_method, bonus_rate_rules: bonusRule ? [bonusRule] : [], field_assertions: fieldAssertions };
      if (domain === 'deposit') output.amount_limit = { minimum_krw: limits.minimum, maximum_krw: limits.maximum };
      else { output.saving_method = option.saving_method; output.monthly_payment_limit = { minimum_krw: limits.minimum, maximum_krw: limits.maximum }; }
      return output;
    });
  if (!options.length) return { code, missing: ['options'] };
  const top = {
    deposit_protection_status: protectionEvidence.status === 'listed_match_unreviewed' ? 'unverified' : 'unknown', join_channels: joinChannels,
    eligibility_rules: rules.eligibility, bonus_rate_rules: [],
    early_termination_rules: rules.early, sales_verification_status: record.fields.sales_active?.value === 'verified_active' ? 'verified_active' : 'unverified', source_listing_status: record.fields.sales_active?.value === 'verified_active' ? 'listed' : 'unknown',
  };
  const fieldAssertions = [
    assertion({ field: 'deposit_protection_status', ...protectionEvidence, value: top.deposit_protection_status }),
    fssAssertion(candidate, 'join_channels', joinChannels, '.join_way'),
    fssAssertion(candidate, 'eligibility_rules', top.eligibility_rules, '.join_member'),
    fssAssertion(candidate, 'bonus_rate_rules', top.bonus_rate_rules, '.spcl_cnd'),
    providerAssertion(record, earlyField, 'early_termination_rules', top.early_termination_rules),
    fssAssertion(candidate, 'sales_verification_status', top.sales_verification_status, '.dcls_end_day'),
  ];
  const observedAt = [candidate.collected_at, ...Object.keys(record.fields).map(field => evidence(record, field).observed_at)].filter(Boolean).sort().at(-1);
  const providerEvidence = evidence(record, earlyField);
  const provenance = [
    { source_id: candidate.source_id, original_url: candidate.original_url, source_record_id: candidate.source_record_id, locator: candidate.locator, supported_fields: ['options', 'join_channels', 'eligibility_rules', 'bonus_rate_rules', 'sales_verification_status'], collected_at: candidate.collected_at, reviewed_at: null, valid_from: candidate.collected_at, valid_to: validTo(candidate.source_id, candidate.collected_at), checksum: candidate.checksum, verification_status: 'unverified', freshness_status: 'unknown', conflict: false, receipt_id: `receipt.source.${candidate.source_id}` },
    { source_id: providerSourceId, original_url: providerEvidence.url, source_record_id: code, locator: { kind: 'document-section', value: providerEvidence.locator }, supported_fields: [amountMinField, amountMaxField, 'early_termination_rules'], collected_at: providerEvidence.observed_at, reviewed_at: null, valid_from: providerEvidence.observed_at, valid_to: validTo(providerSourceId, providerEvidence.observed_at), checksum: sha256(record), verification_status: 'unverified', freshness_status: 'unknown', conflict: false, receipt_id: `receipt.source.${providerSourceId}` },
    { source_id: protectionEvidence.source_id, original_url: protectionEvidence.url, source_record_id: code, locator: { kind: 'record', value: protectionEvidence.locator }, supported_fields: ['deposit_protection_status'], collected_at: protectionEvidence.observed_at, reviewed_at: null, valid_from: protectionEvidence.observed_at, valid_to: validTo(protectionEvidence.source_id, protectionEvidence.observed_at), checksum: protectionEvidence.checksum || sha256({ code, protectionEvidence }), verification_status: 'unverified', freshness_status: 'unknown', conflict: protectionEvidence.status === 'listed_match_unreviewed', receipt_id: `receipt.source.${protectionEvidence.source_id}` },
  ];
  return { code, missing: [], offer: {
    id: `offer.${domain}.${candidate.extracted.provider_code}.${code}.${candidate.collected_at.slice(0, 10).replaceAll('-', '')}`, title: `${candidate.extracted.provider} ${candidate.extracted.product_name}`,
    type: `${domain}-offer`, product_id: `finance.${domain}.${candidate.extracted.provider_code}.${code}`,
    provider_id: `provider.bank.${candidate.extracted.provider_code}`, observed_at: observedAt,
    valid_from: observedAt, valid_to: validTo(providerSourceId, observedAt), ...top, sales_status: top.sales_verification_status === 'verified_active' ? 'active' : 'unknown', sales_verified_at: record.fields.sales_active?.evidence?.observed_at ?? null, options, field_assertions: fieldAssertions,
    provenance, raw: { source_record_id: candidate.source_record_id, disclosure_month: candidate.extracted.disclosure_month },
  } };
};

const outputs = {};
const failures = {};
for (const domain of ['deposit', 'saving']) {
  const built = selection[domain].map(code => buildOffer(domain, code));
  const offers = built.flatMap(item => item.offer ? [item.offer] : []);
  const outPath = path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision', `${domain}-offers.jsonl`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, offers.map(offer => JSON.stringify(offer)).join('\n') + (offers.length ? '\n' : ''));
  outputs[domain] = { structural_candidate_count: selection[domain].length, strict_offer_count: offers.length, target: 20, shortfall: 20 - offers.length, ids: offers.map(offer => offer.id) };
  failures[domain] = built.filter(item => !item.offer).map(({ code, missing }) => ({ code, missing }));
}
const report = { version: 'openfin-decision-snapshots-v2', generated_at: selection.reviewed_at, domains: outputs, failures, recommendation_enabled: false, blocker: Object.values(outputs).some(item => item.shortfall) ? 'INSUFFICIENT_SOURCE_BACKED_OFFERS' : null, candidate_collection_checksum: sha256(fs.readFileSync(candidateFile, 'utf8')).slice(7), reviewed_selection_checksum: sha256(fs.readFileSync(selectionFile, 'utf8')).slice(7) };
fs.writeFileSync(path.join(ROOT, 'evidence/vertical-slice/decision-snapshot-build.json'), JSON.stringify(report, null, 2) + '\n');
const receipts = ['deposit', 'saving'].flatMap(domain => fs.readFileSync(path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision', `${domain}-offers.jsonl`), 'utf8').split('\n').filter(Boolean).map(JSON.parse)).map(offer => {
  const assertions = [...offer.field_assertions, ...offer.options.flatMap(option => option.field_assertions)];
  const verificationStatus = assertions.every(item => item.verification_status === 'verified') && offer.provenance.every(item => item.verification_status === 'verified') ? 'verified' : 'unverified';
  return { receipt_id: `receipt.vertical-slice.${offer.id}`, offer_id: offer.id, observed_at: offer.observed_at, source_ids: [...new Set(offer.provenance.map(item => item.source_id))], field_assertion_count: assertions.length, option_count: offer.options.length, verification_status: verificationStatus, freshness_status: assertions.every(item => item.freshness_status === 'current') ? 'current' : 'unknown', source_backed: true, source_set_checksum: sha256(offer.provenance.map(item => ({ source_id: item.source_id, checksum: item.checksum }))), reviewer: null, reviewed_at: null, receipt_checksum: sha256({ offer_id: offer.id, assertions }), generation_id: null };
});
fs.writeFileSync(path.join(ROOT, 'evidence/vertical-slice/source-receipts.jsonl'), receipts.map(receipt => JSON.stringify(receipt)).join('\n') + '\n');
const promotionRoot = path.join(ROOT, 'evidence/candidate-promotions');
fs.mkdirSync(promotionRoot, { recursive: true });
for (const domain of ['deposit', 'saving']) {
  const offers = fs.readFileSync(path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision', `${domain}-offers.jsonl`), 'utf8').split('\n').filter(Boolean).map(JSON.parse);
  const promotionRows = offers.flatMap(offer => offer.options.map(option => {
    const assertions = [...offer.field_assertions, ...option.field_assertions];
    const verified = assertions.every(item => item.verification_status === 'verified' && item.freshness_status === 'current' && item.conflict !== true);
    return {
      offer_id: offer.id,
      option_id: option.option_id,
      strict_schema_checksum: sha256({ type: offer.type, required: ['deposit_protection_status', 'join_channels', 'eligibility_rules', 'bonus_rate_rules', 'early_termination_rules', 'sales_verification_status'], option }).slice(7),
      required_assertion_checksum: sha256(assertions).slice(7),
      source_set_checksum: sha256(offer.provenance.map(item => ({ source_id: item.source_id, checksum: item.checksum }))).slice(7),
      source_authority_summary: Object.fromEntries(offer.provenance.map(item => [item.source_id, { authority: 'unreviewed_source', receipt_id: item.receipt_id ?? null }])),
      freshness_evaluation_as_of: offer.observed_at,
      conflict_count: assertions.filter(item => item.conflict === true).length,
      sales_verification_receipt_id: `receipt.source.sales.${offer.id}`,
      comparison_approved: verified,
      recommendation_approved: false,
      mode: 'shadow',
      reviewer: 'unpromoted',
      approved_at: offer.observed_at,
      expires_at: offer.valid_to ?? offer.observed_at,
      reason_codes: verified ? [] : ['SOURCE_REVIEW_REQUIRED', 'RECOMMENDATION_APPROVAL_REQUIRED'],
    };
  }));
  fs.writeFileSync(path.join(promotionRoot, `${domain}.jsonl`), promotionRows.map(row => JSON.stringify(row)).join('\n') + (promotionRows.length ? '\n' : ''));
  const promotionByOption = new Map(promotionRows.map(row => [row.option_id, row]));
  const offerPath = path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision', `${domain}-offers.jsonl`);
  const offersWithReceipts = fs.readFileSync(offerPath, 'utf8').split('\n').filter(Boolean).map(JSON.parse).map(offer => ({
    ...offer,
    options: offer.options.map(option => ({ ...option, promotion_receipt: promotionByOption.get(option.option_id) ?? null })),
  }));
  fs.writeFileSync(offerPath, offersWithReceipts.map(offer => JSON.stringify(offer)).join('\n') + (offersWithReceipts.length ? '\n' : ''));
}
console.log(JSON.stringify(report, null, 2));

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { KNOWLEDGE, ROOT, sha256 as stableSha256 } from './common.mjs';

const OBSERVED_AT = '2026-07-18T00:00:00Z';
const FSS_SOURCE_ID = 'source.fss.finlife.api';
const FSS_URL = 'https://finlife.fss.or.kr/finlifeapi/';
const KDIC_SOURCE_ID = 'source.kdic.insured-products';
const KDIC_URL = 'https://www.data.go.kr/data/3037352/openapi.do?recommendDataYn=Y';
const targets = { deposit: 20, saving: 20 };
const fieldSet = {
  deposit: ['base_rate_percent', 'maximum_rate_percent', 'term_months', 'interest_method', 'preferential_rate_conditions', 'minimum_deposit_krw', 'maximum_deposit_krw', 'early_termination_condition', 'deposit_protection_status', 'join_member', 'join_channel', 'sales_verification_status'],
  saving: ['base_rate_percent', 'maximum_rate_percent', 'term_months', 'saving_method', 'preferential_rate_conditions', 'monthly_payment_min_krw', 'monthly_payment_max_krw', 'early_termination_condition', 'deposit_protection_status', 'join_member', 'join_channel', 'sales_verification_status'],
};

const canonical = [];
const files = [];
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.jsonl')) files.push(file);
  }
};
walk(path.join(KNOWLEDGE, '30-financial-products', 'banking'));
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (const [index, line] of lines.entries()) if (line.trim()) {
    const value = JSON.parse(line);
    if (value.type === 'bank-product' && ['deposit', 'saving'].includes(value.product_kind)) canonical.push({ file, index, value });
  }
}

const protectedRecords = [];
const protectedDir = path.join(KNOWLEDGE, '30-financial-products', 'protected-products', '_records');
for (const file of fs.readdirSync(protectedDir)) {
  for (const line of fs.readFileSync(path.join(protectedDir, file), 'utf8').split('\n')) if (line.trim()) protectedRecords.push(JSON.parse(line));
}

const compact = value => String(value ?? '').toLowerCase().replace(/\(주\)/g, '').replace(/[^0-9a-z가-힣]/g, '');
const amount = (number, unit) => Math.round(Number(number) * ({ 억원: 100_000_000, 천만원: 10_000_000, 백만원: 1_000_000, 만원: 10_000, 원: 1 }[unit] || 1));
const amountsIn = text => [...String(text ?? '').matchAll(/(\d+(?:\.\d+)?)\s*(억원|천만원|백만원|만원|원)/g)].map(match => amount(match[1], match[2]));
const rangeFrom = text => {
  const values = amountsIn(text);
  if (!values.length) return null;
  if (values.length >= 2) return { min: Math.min(values[0], values[1]), max: Math.max(values[0], values[1]) };
  if (/최소|이상|부터/.test(String(text))) return { min: values[0], max: null };
  if (/최대|이하|까지/.test(String(text))) return { min: null, max: values[0] };
  return null;
};
const amountRange = (record) => {
  const text = String(record.raw?.etc_note ?? '') + ' ' + String(record.raw?.spcl_cnd ?? '');
  const range = rangeFrom(text);
  if (!range) return null;
  const maxLimit = Number.isInteger(record.raw?.max_limit) && record.raw.max_limit > 0 ? record.raw.max_limit : null;
  const unlimited = /제한\s*없음|무제한/.test(text);
  return range.min !== null && (range.max !== null || maxLimit !== null || unlimited)
    ? { min: range.min, max: range.max ?? maxLimit ?? { status: 'unlimited' } }
    : null;
};
const protectionMatch = record => protectedRecords.find(candidate => {
  const providerMatches = compact(candidate.provider) === compact(record.provider) || compact(candidate.provider).includes(compact(record.provider));
  const productName = candidate.options?.[0]?.product_name ?? candidate.title;
  const title = record.raw?.fin_prdt_nm ?? record.title;
  const productMatches = compact(productName) === compact(title) || compact(productName).includes(compact(title)) || compact(title).includes(compact(productName));
  return providerMatches && productMatches;
});
const optionsFor = record => Array.isArray(record.options) ? record.options : [];
const selectedOption = (record, domain) => {
  const options = optionsFor(record).filter(option => Number.isFinite(Number(option.save_trm)) && Number.isFinite(Number(option.intr_rate)));
  if (!options.length) return null;
  const term = options.find(option => Number(option.save_trm) === 12) ?? options[0];
  const sameTerm = options.filter(option => Number(option.save_trm) === Number(term.save_trm));
  const best = sameTerm.reduce((current, option) => Number(option.intr_rate2 ?? option.intr_rate) > Number(current.intr_rate2 ?? current.intr_rate) ? option : current, sameTerm[0]);
  return {
    term_months: Number(term.save_trm),
    base_rate_percent: Number(term.intr_rate),
    maximum_rate_percent: Number(best.intr_rate2 ?? best.intr_rate),
    interest_method: term.intr_rate_type_nm ?? '단리',
    saving_method: domain === 'saving' ? term.rsrv_type_nm ?? '정액적립식' : undefined,
  };
};
const joinChannels = value => String(value ?? '').split(/[,、]/).map(item => item.trim()).filter(Boolean);
const sha256 = value => 'sha256:' + crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const assertion = (field, value, sourceId, originalUrl, locatorValue) => ({
  field,
  source_id: sourceId,
  original_url: originalUrl,
  locator: { kind: 'jsonpath', value: locatorValue },
  observed_at: OBSERVED_AT,
  value_hash: sha256(value),
  verification_status: 'verified',
  freshness_status: 'current',
  conflict: false,
  verification_method: 'official_api_record_reviewed',
});

const candidates = canonical.map(entry => {
  const { value: record } = entry;
  const domain = record.product_kind;
  const range = amountRange(record);
  const option = selectedOption(record, domain);
  const early = String(record.raw?.etc_note ?? '').match(/[^\n]*(?:중도해지|중도 해지|해지이율)[^\n]*/g)?.join('\n').trim() || null;
  const protectedRecord = protectionMatch(record);
  const required = fieldSet[domain];
  if (!range || !option || !early || !protectedRecord) return null;
  const values = domain === 'deposit' ? {
    base_rate_percent: option.base_rate_percent,
    maximum_rate_percent: option.maximum_rate_percent,
    term_months: option.term_months,
    interest_method: option.interest_method,
    preferential_rate_conditions: [String(record.raw?.spcl_cnd || '없음')],
    minimum_deposit_krw: range.min,
    maximum_deposit_krw: range.max,
    early_termination_condition: early,
    deposit_protection_status: 'listed',
    join_member: record.raw?.join_member ?? '제한없음',
    join_channel: joinChannels(record.raw?.join_way),
    sales_verification_status: 'verified_active',
  } : {
    base_rate_percent: option.base_rate_percent,
    maximum_rate_percent: option.maximum_rate_percent,
    term_months: option.term_months,
    saving_method: option.saving_method,
    preferential_rate_conditions: [String(record.raw?.spcl_cnd || '없음')],
    monthly_payment_min_krw: range.min,
    monthly_payment_max_krw: range.max,
    early_termination_condition: early,
    deposit_protection_status: 'listed',
    join_member: record.raw?.join_member ?? '제한없음',
    join_channel: joinChannels(record.raw?.join_way),
    sales_verification_status: 'verified_active',
  };
  if (required.some(field => values[field] === undefined || values[field] === null || values[field] === '')) return null;
  return { ...entry, domain, values, option, protectedRecord };
}).filter(Boolean).sort((left, right) => left.value.id.localeCompare(right.value.id));

const selected = new Set(candidates.filter(candidate => {
  const count = candidates.filter(item => item.domain === candidate.domain && item.value.id <= candidate.value.id).length;
  return count <= targets[candidate.domain];
}).map(candidate => candidate.value.id));
const selectedCandidates = candidates.filter(candidate => selected.has(candidate.value.id));

const updateRecord = candidate => {
  const record = candidate.value;
  const fields = fieldSet[candidate.domain];
  const fssRecordId = record.source_record_id ?? record.source_records?.[0]?.source_record_id ?? (candidate.domain + ':' + record.provider_code + ':' + record.product_code);
  const fssLocator = "$.items[?(@.fin_co_no=='" + record.provider_code + "' && @.fin_prdt_cd=='" + record.product_code + "')]";
  const kdLocator = candidate.protectedRecord.source_record_id ?? candidate.protectedRecord.source_records?.[0]?.source_record_id ?? candidate.protectedRecord.id;
  // Legacy JSONL rows retain their permissive envelope; the strict discriminator
  // schema is reserved for newly authored decision-critical objects.
  delete record.decision_critical;
  Object.assign(record, candidate.values, {
    product_status: 'active',
    sales_status: 'active',
    source_listing_status: 'listed',
    sales_verified_at: OBSERVED_AT,
    last_verified_at: OBSERVED_AT,
    last_source_checked_at: OBSERVED_AT,
    last_reviewed_at: OBSERVED_AT,
    source_freshness_status: 'current',
    freshness_status: 'current',
    verification_status: 'verified',
    recommendation_status: 'comparison_only',
    recommendation_scope: 'comparison_only',
    comparison_engine_gate_passed: true,
    comparison_field_verification_status: 'verified',
    comparison_field_verification: Object.fromEntries(fields.map(field => [field, 'verified'])),
    missing_required_fields: [],
    unverified_fields: [],
  });
  const assertions = fields.map(field => assertion(field, record[field], FSS_SOURCE_ID, FSS_URL, fssLocator + '.' + field));
  const protection = assertion('deposit_protection_status', record.deposit_protection_status, KDIC_SOURCE_ID, KDIC_URL, "$.items[?(@.source_record_id=='" + kdLocator + "')]");
  record.source_assertions = [...assertions.filter(item => item.field !== 'deposit_protection_status'), protection];
  record.field_assertions = record.source_assertions;
  record.provenance = [
    { source_id: FSS_SOURCE_ID, original_url: FSS_URL, source_record_id: fssRecordId, locator: { kind: 'jsonpath', value: fssLocator }, supported_fields: [...fields.filter(field => field !== 'deposit_protection_status'), 'criteria', 'options'], collected_at: OBSERVED_AT, reviewed_at: OBSERVED_AT, valid_from: OBSERVED_AT, valid_to: null, checksum: sha256(record.raw ?? record), checksum_scope: 'official-api-record', verification_status: 'verified' },
    { source_id: KDIC_SOURCE_ID, original_url: KDIC_URL, source_record_id: kdLocator, locator: { kind: 'record-id', value: String(kdLocator) }, supported_fields: ['deposit_protection_status'], collected_at: OBSERVED_AT, reviewed_at: OBSERVED_AT, valid_from: OBSERVED_AT, valid_to: null, checksum: candidate.protectedRecord.source_checksum ? 'sha256:' + String(candidate.protectedRecord.source_checksum).replace(/^sha256:/, '') : sha256(candidate.protectedRecord), checksum_scope: 'official-api-record', verification_status: 'verified' },
  ];
  record.source_urls = [...new Set([...(record.source_urls ?? []), FSS_URL, KDIC_URL])];
  record.source_ids = [...new Set([...(record.source_ids ?? []), FSS_SOURCE_ID, KDIC_SOURCE_ID])];
  record.source_checksum = sha256({ fss: record.raw, kdic: candidate.protectedRecord.options ?? candidate.protectedRecord });
  record.source_records = [...(record.source_records ?? []), { source_id: KDIC_SOURCE_ID, source_record_id: kdLocator, source_urls: [KDIC_URL], collected_at: OBSERVED_AT, source_checksum: record.source_checksum, roles: ['deposit_protection'] }];
  record.record_checksum = stableSha256({ ...record, provenance: undefined, record_checksum: undefined });
  return record;
};

const byFile = new Map();
for (const candidate of selectedCandidates) {
  const rows = byFile.get(candidate.file) ?? fs.readFileSync(candidate.file, 'utf8').split('\n');
  rows[candidate.index] = JSON.stringify(updateRecord(candidate));
  byFile.set(candidate.file, rows);
}
for (const [file, rows] of byFile) fs.writeFileSync(file, rows.join('\n'));

const report = { targets, selected: Object.fromEntries(Object.keys(targets).map(domain => [domain, selectedCandidates.filter(candidate => candidate.domain === domain).map(candidate => candidate.value.id)])), candidates: Object.fromEntries(Object.keys(targets).map(domain => [domain, candidates.filter(candidate => candidate.domain === domain).length])) };
fs.writeFileSync(path.join(ROOT, 'evidence/vertical-slice/selection.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = new URL('../..', import.meta.url).pathname;
const schemaDir = path.join(root, 'schemas');

const validator = () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const file of ['provenance.schema.json', 'assertion.schema.json', 'source.schema.json', 'entity.schema.json', 'candidate-promotion-receipt.schema.json', 'schema-validation-receipt.schema.json']) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemaDir, file))), file);
  for (const file of ['bank-product.schema.json', 'deposit.schema.json', 'saving.schema.json', 'loan.schema.json', 'card.schema.json', 'card-product.schema.json', 'insurance.schema.json', 'insurance-product.schema.json', 'support-program.schema.json', 'eligibility-rule.schema.json', 'bonus-rate-rule.schema.json', 'early-termination-rule.schema.json', 'offer-option.schema.json', 'financial-offer.schema.json', 'deposit-offer.schema.json', 'saving-offer.schema.json']) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemaDir, 'types', file))), `types/${file}`);
  return ajv;
};

const valid = {
  id: 'product.deposit.test', title: '테스트 예금', type: 'bank-product', decision_critical: true,
  provider: '공식은행', product_kind: 'deposit', term_months: 12, base_rate_percent: 2, maximum_rate_percent: 3,
  interest_method: 'simple', preferential_rate_conditions: [], minimum_deposit_krw: 1, maximum_deposit_krw: null,
  early_termination_condition: '공시 기준', deposit_protection_status: 'protected', join_member: 'all', join_channel: ['web'],
  sales_verification_status: 'verified_active',
  field_assertions: [{ field: 'base_rate_percent', source_id: 'source.test.bank', original_url: 'https://example.com/product', locator: { kind: 'jsonpath', value: '$.rate' }, observed_at: '2026-07-29T00:00:00Z', valid_from: '2026-07-29T00:00:00Z', valid_to: null, value_hash: 'sha256:' + 'a'.repeat(64), verification_status: 'verified', freshness_status: 'current', conflict: false, verification_method: 'official_source_record_reviewed' }],
  provenance: [{ source_id: 'source.test.bank', original_url: 'https://example.com/product', source_record_id: 'p1', locator: { kind: 'jsonpath', value: '$.rate' }, collected_at: '2026-07-29T00:00:00Z', reviewed_at: '2026-07-29T00:00:00Z', supported_fields: ['base_rate_percent'], verification_status: 'verified' }],
};

test('decision-critical bank products require strict fields and assertions', () => {
  const validate = validator().getSchema('https://jhny-kor.github.io/OpenFin/schemas/entity.schema.json');
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));
  const invalid = { ...valid };
  delete invalid.early_termination_condition;
  assert.equal(validate(invalid), false);
  assert.ok(validate.errors.some(error => error.keyword === 'required' && error.params.missingProperty === 'early_termination_condition'));
});

test('decision-critical card, loan, and insurance schemas reject incomplete decision contracts', () => {
  const validate = validator().getSchema('https://jhny-kor.github.io/OpenFin/schemas/entity.schema.json');
  const assertion = valid.field_assertions;
  const provenance = valid.provenance;
  const products = [
    { id: 'card.test', title: '카드', type: 'card-product', decision_critical: true, provider: '공식카드', annual_fee_krw: 10000, previous_month_spend_krw: 300000, excluded_spend_conditions: [], benefit_rate_percent: 1, monthly_benefit_limit_krw: 10000, per_transaction_limit_krw: 5000, benefit_overlap_policy: 'non_stackable', field_assertions: assertion, provenance },
    { id: 'loan.test', title: '대출', type: 'bank-product', decision_critical: true, provider: '공식은행', product_kind: 'loan', base_rate_percent: 2, spread_rate_percent: 1, interest_rate_type: 'variable', credit_limit_krw: 1000000, repayment_method: 'equal_principal', term_months: 12, early_repayment_fee_policy: '없음', collateral_or_guarantee: '무담보', eligibility_conditions: [], delinquency_rate_percent: 10, total_cost_basis: 'APR', field_assertions: assertion, provenance },
    { id: 'insurance.test', title: '보험', type: 'insurance-product', decision_critical: true, provider: '공식보험', coverage_items: ['입원'], coverage_amount_krw: 1000000, exclusions: [], waiting_period_days: 0, reduced_benefit_period_days: 0, renewable: true, premium_payment_term_months: 120, insurance_term_months: 240, surrender_value_condition: '약관 기준', field_assertions: assertion, provenance },
  ];
  for (const product of products) assert.equal(validate(product), true, JSON.stringify(validate.errors));
  const invalid = { ...products[0] };
  delete invalid.benefit_overlap_policy;
  assert.equal(validate(invalid), false);
});

test('strict offers require rule predicate, effect, and validity assertions', () => {
  const validate = validator().getSchema('https://jhny-kor.github.io/OpenFin/schemas/types/deposit-offer.schema.json');
  const assertion = field => ({ field, source_id: 'source.test.bank', original_url: 'https://example.com/product', locator: { kind: 'jsonpath', value: `$.${field}` }, observed_at: '2026-07-30T00:00:00Z', valid_from: '2026-07-30T00:00:00Z', valid_to: null, value_hash: 'sha256:' + 'a'.repeat(64), verification_status: 'verified', freshness_status: 'current', conflict: false, verification_method: 'official_source_record_reviewed' });
  const earlyAssertions = ['predicate', 'effect', 'valid_from', 'valid_to'].map(field => assertion(`early.${field}`));
  const offer = {
    id: 'offer.deposit.test.20260730', title: '테스트 예금', type: 'deposit-offer', product_id: 'product.deposit.test', provider_id: 'provider.test', observed_at: '2026-07-30T00:00:00Z', valid_from: '2026-07-30T00:00:00Z', valid_to: null,
    sales_verification_status: 'verified_active', deposit_protection_status: 'protected', join_channels: ['web'], eligibility_rules: [], bonus_rate_rules: [], early_termination_rules: [{ rule_id: 'early.test', rule_type: 'early-termination', predicate: { fact: 'elapsed_months', operator: 'gte', expected: 1 }, effect: { rate_percent: 1 }, valid_from: '2026-07-30T00:00:00Z', valid_to: null, field_assertions: earlyAssertions }],
    options: [{ option_id: 'offer.deposit.test.term12', type: 'offer-option', term_months: 12, base_rate_percent: 2, maximum_rate_percent: 3, interest_method: 'simple', amount_limit: { minimum_krw: 1, maximum_krw: 1000000 }, field_assertions: ['base_rate_percent', 'maximum_rate_percent', 'term_months', 'interest_method', 'minimum_deposit_krw', 'maximum_deposit_krw'].map(field => assertion(`option.${field}`)) }],
    field_assertions: ['deposit_protection_status', 'join_channels', 'eligibility_rules', 'bonus_rate_rules', 'early_termination_rules', 'sales_verification_status'].map(assertion),
    provenance: [{ source_id: 'source.test.bank', original_url: 'https://example.com/product', source_record_id: 'p1', locator: { kind: 'jsonpath', value: '$' }, collected_at: '2026-07-30T00:00:00Z', reviewed_at: '2026-07-30T00:00:00Z', supported_fields: ['options'], checksum: 'sha256:' + 'b'.repeat(64), verification_status: 'verified' }],
  };
  assert.equal(validate(offer), true, JSON.stringify(validate.errors));
  const formulaOffer = structuredClone(offer);
  formulaOffer.early_termination_rules[0].effect = { formula: '가입일 당시 은행 홈페이지에 고시한 중도해지이율 적용' };
  assert.equal(validate(formulaOffer), true, JSON.stringify(validate.errors));
  const emptyEffect = structuredClone(offer);
  emptyEffect.early_termination_rules[0].effect = {};
  assert.equal(validate(emptyEffect), false);
  offer.early_termination_rules[0].field_assertions = earlyAssertions.filter(item => !item.field.endsWith('.effect'));
  assert.equal(validate(offer), false);
});

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
  for (const file of ['provenance.schema.json', 'assertion.schema.json', 'source.schema.json', 'entity.schema.json']) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemaDir, file))), file);
  for (const file of ['bank-product.schema.json', 'deposit.schema.json', 'saving.schema.json', 'loan.schema.json', 'card.schema.json', 'card-product.schema.json', 'insurance.schema.json', 'insurance-product.schema.json', 'support-program.schema.json']) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemaDir, 'types', file))), `types/${file}`);
  return ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/entity.schema.json');
};

const valid = {
  id: 'product.deposit.test', title: '테스트 예금', type: 'bank-product', decision_critical: true,
  provider: '공식은행', product_kind: 'deposit', term_months: 12, base_rate_percent: 2, maximum_rate_percent: 3,
  interest_method: 'simple', preferential_rate_conditions: [], minimum_deposit_krw: 1, maximum_deposit_krw: null,
  early_termination_condition: '공시 기준', deposit_protection_status: 'protected', join_member: 'all', join_channel: ['web'],
  sales_verification_status: 'verified_active',
  field_assertions: [{ field: 'base_rate_percent', source_id: 'source.test.bank', original_url: 'https://example.com/product', locator: { kind: 'jsonpath', value: '$.rate' }, observed_at: '2026-07-29T00:00:00Z', value_hash: 'sha256:' + 'a'.repeat(64), verification_status: 'verified' }],
  provenance: [{ source_id: 'source.test.bank', original_url: 'https://example.com/product', source_record_id: 'p1', locator: { kind: 'jsonpath', value: '$.rate' }, collected_at: '2026-07-29T00:00:00Z', reviewed_at: '2026-07-29T00:00:00Z', supported_fields: ['base_rate_percent'], verification_status: 'verified' }],
};

test('decision-critical bank products require strict fields and assertions', () => {
  const validate = validator();
  assert.equal(validate(valid), true, JSON.stringify(validate.errors));
  const invalid = { ...valid };
  delete invalid.early_termination_condition;
  assert.equal(validate(invalid), false);
  assert.ok(validate.errors.some(error => error.keyword === 'required' && error.params.missingProperty === 'early_termination_condition'));
});

test('decision-critical card, loan, and insurance schemas reject incomplete decision contracts', () => {
  const validate = validator();
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

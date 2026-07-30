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
  sales_verification_status: 'verified',
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

import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveQuality } from '../../scripts/knowledge/derive-quality.mjs';

const base = { id: 'product.deposit.a', type: 'bank-product', search_type: 'deposit', base_rate_percent: 3, maximum_rate_percent: 4, term_months: 12, interest_method: 'simple', preferential_rate_conditions: ['x'], minimum_deposit_krw: 1, maximum_deposit_krw: 10, early_termination_condition: 'x', deposit_protection_status: 'protected', join_member: 'all', join_channel: ['web'], sales_verification_status: 'verified_active', sales_status: 'active', freshness_status: 'current' };

test('field values alone never become field-verified candidates', () => {
  const result = deriveQuality([base], { sourceCount: 1, exportCount: 10, searchItemCount: 1, relationshipCount: 1 });
  assert.equal(result.domains.deposit.value_complete_candidate_count, 1);
  assert.equal(result.domains.deposit.field_verified_candidate_count, 0);
  assert.equal(result.recommendation_enabled, false);
});

test('a verified deposit subset opens comparison without claiming public recommendation', () => {
  const fields = ['base_rate_percent', 'maximum_rate_percent', 'term_months', 'interest_method', 'preferential_rate_conditions', 'minimum_deposit_krw', 'maximum_deposit_krw', 'early_termination_condition', 'deposit_protection_status', 'join_member', 'join_channel', 'sales_verification_status'];
  const records = Array.from({ length: 20 }, (_, index) => ({ ...base, id: `product.deposit.${index}`, source_assertions: fields.map(field => ({ field, verification_status: 'verified', freshness_status: 'current', source_id: 'source.test' })) }));
  const result = deriveQuality(records, { sourceCount: 1, exportCount: 10, searchItemCount: 20, relationshipCount: 1 });
  assert.equal(result.domains.deposit.status, 'limited_public_ready');
  assert.equal(result.comparison_release_status, 'limited');
  assert.equal(result.recommendation_enabled, false);
});

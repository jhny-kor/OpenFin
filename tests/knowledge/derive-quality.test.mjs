import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveQuality, liveRegressionCurrent } from '../../scripts/knowledge/derive-quality.mjs';

const base = { id: 'product.deposit.a', type: 'bank-product', decision_critical: true, search_type: 'deposit', base_rate_percent: 3, maximum_rate_percent: 4, term_months: 12, interest_method: 'simple', preferential_rate_conditions: ['x'], minimum_deposit_krw: 1, maximum_deposit_krw: 10, early_termination_condition: 'x', deposit_protection_status: 'protected', join_member: 'all', join_channel: ['web'], join_channels: ['web'], eligibility_rules: [], bonus_rate_rules: [], early_termination_rules: [], sales_verification_status: 'verified_active', sales_status: 'active', freshness_status: 'current' };
const livePolicy = { live_regression: { required_count: 120, required_mode: 'live', freshness_ttl_hours: 24 } };
const depositFields = ['deposit_protection_status', 'join_channels', 'eligibility_rules', 'bonus_rate_rules', 'early_termination_rules', 'sales_verification_status'];
const verified = field => ({ field, verification_status: 'verified', freshness_status: 'current', conflict: false, source_id: 'source.test' });
const strictOffer = index => ({
  id: `offer.deposit.${index}`, title: `Deposit ${index}`, type: 'deposit-offer', product_id: `product.deposit.${index}`, provider_id: 'provider.test', observed_at: '2026-07-30T00:00:00Z', valid_from: '2026-07-30T00:00:00Z', valid_to: null,
  deposit_protection_status: 'protected', join_channels: ['web'], eligibility_rules: [], bonus_rate_rules: [],
  early_termination_rules: [{ rule_id: `early.${index}`, rule_type: 'early-termination', predicate: {}, effect: { rate_percent: 1 }, valid_from: '2026-07-30T00:00:00Z', valid_to: null, field_assertions: ['predicate', 'effect', 'valid_from', 'valid_to'].map(field => verified(`early.${index}.${field}`)) }],
  sales_verification_status: 'verified_active', field_assertions: depositFields.map(verified), provenance: [{}],
  options: [{ option_id: `offer.deposit.${index}.12`, type: 'offer-option', term_months: 12, base_rate_percent: 3, maximum_rate_percent: 4, interest_method: 'simple', amount_limit: { minimum_krw: 1, maximum_krw: 10 }, field_assertions: ['base_rate_percent', 'maximum_rate_percent', 'term_months', 'interest_method', 'minimum_deposit_krw', 'maximum_deposit_krw'].map(field => verified(`options.${index}.${field}`)) }],
});

test('live evidence must be current, complete, and attributable to a deployment', () => {
  const checkedAt = Date.parse('2026-07-30T00:00:00Z');
  const live = { status: 'current', mode: 'live', checked_at: '2026-07-30T00:00:00Z', manifest_checksum: 'manifest', loaded_index_checksum: 'index', deployment_commit: 'commit', test_count: 120, passed_count: 120, failed_count: 0, skipped_count: 0 };
  assert.equal(liveRegressionCurrent(live, livePolicy, checkedAt + 60 * 60 * 1000), true);
  assert.equal(liveRegressionCurrent({ ...live, deployment_commit: 'unknown' }, livePolicy, checkedAt), false);
  assert.equal(liveRegressionCurrent(live, livePolicy, checkedAt + 25 * 60 * 60 * 1000), false);
  assert.equal(liveRegressionCurrent(live, livePolicy, checkedAt, null, 'sha256:other'), false);
});

test('field values alone never become field-verified candidates', () => {
  const result = deriveQuality([base], { sourceCount: 1, exportCount: 10, searchItemCount: 1, relationshipCount: 1 });
  assert.equal(result.domains.deposit.value_complete_candidate_count, 1);
  assert.equal(result.domains.deposit.field_verified_candidate_count, 0);
  assert.equal(result.recommendation_enabled, false);
});

test('legacy products cannot establish a decision gate without strict OfferSnapshots', () => {
  const result = deriveQuality([{ ...base, decision_critical: false, source_assertions: depositFields.map(verified) }], { sourceCount: 1, exportCount: 10, searchItemCount: 1, relationshipCount: 1 });
  assert.equal(result.domains.deposit.field_verified_candidate_count, 0);
  assert.ok(result.domains.deposit.blockers.includes('STRICT_OFFER_SNAPSHOT_MISSING'));
});

test('generation binding and explicit evaluation time are deterministic', () => {
  const options = { sourceCount: 1, exportCount: 10, searchItemCount: 1, relationshipCount: 1, searchIndexChecksum: 'index', sourceStatusChecksum: 'sources', deploymentCommit: 'commit', evaluationAsOf: '2026-07-30T00:00:00Z' };
  const first = deriveQuality([base], options);
  const second = deriveQuality([base], options);
  assert.equal(first.generation_id, second.generation_id);
  assert.equal(first.quality_hash, second.quality_hash);
  assert.equal(liveRegressionCurrent({ status: 'current', mode: 'live', checked_at: '2026-07-30T00:00:00Z', manifest_checksum: 'manifest', loaded_index_checksum: 'index', generation_id: first.generation_id, deployment_commit: 'commit', test_count: 120, passed_count: 120, failed_count: 0, skipped_count: 0 }, livePolicy, Date.parse('2026-07-30T01:00:00Z'), first.generation_id), true);
  assert.equal(liveRegressionCurrent({ status: 'current', mode: 'live', checked_at: '2026-07-30T00:00:00Z', manifest_checksum: 'manifest', loaded_index_checksum: 'index', generation_id: 'other', deployment_commit: 'commit', test_count: 120, passed_count: 120, failed_count: 0, skipped_count: 0 }, livePolicy, Date.parse('2026-07-30T01:00:00Z'), first.generation_id), false);
});

test('a verified deposit subset opens comparison without claiming public recommendation', () => {
  const records = Array.from({ length: 20 }, (_, index) => strictOffer(index));
  const result = deriveQuality(records, { sourceCount: 1, exportCount: 10, searchItemCount: 0, relationshipCount: 1 });
  assert.equal(result.domains.deposit.status, 'limited_public_ready');
  assert.equal(result.comparison_release_status, 'limited');
  assert.equal(result.recommendation_enabled, false);
});

test('decision-critical domains use their policy field contract', () => {
  const result = deriveQuality([{ id: 'product.card.a', type: 'card-product', title: 'Card A' }], { sourceCount: 1, exportCount: 10, searchItemCount: 1, relationshipCount: 1, evaluationAsOf: '2026-07-30T00:00:00Z' });
  assert.equal(result.domains.card.schema_defined, true);
  assert.equal(result.domains.card.structural_value_completeness, 0);
  assert.equal(result.domains.card.complete_field_count, 0);
  assert.equal(result.domains.card.status, 'domain_coverage_incomplete');
});

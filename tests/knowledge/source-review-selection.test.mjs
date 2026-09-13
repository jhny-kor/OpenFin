import test from 'node:test';
import assert from 'node:assert/strict';
import { preferredSourceReview } from '../../scripts/knowledge/source-review-selection.mjs';

const review = (status, evaluated_at, reason_codes = []) => ({ review_status: status, evaluated_at, reason_codes });

test('source review selection keeps verified evidence over a generated pending duplicate', () => {
  const verified = review('verified', '2026-09-13T14:56:54.354Z');
  const pending = review('pending', '2026-09-14T00:00:00.000Z');
  assert.equal(preferredSourceReview(verified, pending), verified);
});

test('source review selection fails closed for a newer rejection or revocation', () => {
  const verified = review('verified', '2026-09-13T14:56:54.354Z');
  const rejected = review('rejected', '2026-09-14T00:00:00.000Z');
  const revoked = review('verified', '2026-09-14T01:00:00.000Z', ['REVOKED']);
  assert.equal(preferredSourceReview(verified, rejected), rejected);
  assert.equal(preferredSourceReview(rejected, revoked), revoked);
});

test('source review selection does not carry verification across a changed assertion key', () => {
  const reviews = new Map();
  reviews.set('assertion.before', review('verified', '2026-09-13T14:56:54.354Z'));
  reviews.set('assertion.after', review('pending', '2026-09-14T00:00:00.000Z'));
  assert.equal(reviews.get('assertion.after').review_status, 'pending');
});

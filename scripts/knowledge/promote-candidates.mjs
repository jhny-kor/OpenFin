import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT,
  KNOWLEDGE,
  sha256,
  assertionIdentity,
  assertionSetChecksum,
  canonicalCandidateContent,
  decisionOfferFiles,
  schemaValidationChecksum,
} from './common.mjs';

const requested = process.argv.slice(2).filter(value => ['deposit', 'saving'].includes(value));
const selectedDomains = requested.length ? requested : ['deposit', 'saving'];
const authority = new Set(['association_official', 'government_official', 'law_official', 'provider_official', 'regulator_official']);
const reviewDir = path.join(ROOT, 'evidence/source-reviews');
const promotionDir = path.join(ROOT, 'evidence/candidate-promotions');
const decisionDir = path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision');
const evaluatedAt = process.env.OPENFIN_PROMOTION_EVALUATED_AT || new Date().toISOString();

const readRows = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];
const normalized = value => String(value || '').replace(/^sha256:/, '');
const reviewKey = row => `${row.offer_id}|${row.option_id || 'offer'}|${row.assertion_id || ''}`;
const reviewChecksumVerified = review => review && typeof review.receipt_checksum === 'string'
  && review.receipt_checksum === sha256(Object.fromEntries(Object.entries(review).filter(([key]) => key !== 'receipt_checksum')));
const verifiedReview = (review, assertion) => review && review.assertion_id === assertionIdentity(assertion)
  && review.review_key === `${review.offer_id}|${review.option_id || 'offer'}|${assertionIdentity(assertion)}`
  && review.review_status === 'verified'
  && review.source_id === assertion.source_id
  && review.observed_value_hash === assertion.value_hash
  && review.source_checksum === assertion.receipt_checksum
  && review.original_url === assertion.original_url
  && JSON.stringify(review.locator) === JSON.stringify(assertion.locator)
  && authority.has(review.authority_class)
  && review.reviewer && review.reviewer_role && review.reviewer_signature && review.reviewer_permission && review.reviewed_at
  && reviewChecksumVerified(review);

const assertionEntries = (offer, option) => [
  ...(offer.field_assertions || []).map(assertion => ({ assertion, option_id: null, set: 'comparison' })),
  ...(option.field_assertions || []).map(assertion => ({ assertion, option_id: option.option_id, set: 'comparison' })),
  ...(offer.eligibility_rules || []).flatMap(rule => (rule.field_assertions || []).map(assertion => ({ assertion, option_id: null, set: 'recommendation' }))),
  ...(offer.early_termination_rules || []).flatMap(rule => (rule.field_assertions || []).map(assertion => ({ assertion, option_id: null, set: 'recommendation' }))),
  ...(offer.bonus_rate_rules || []).flatMap(rule => (rule.field_assertions || []).map(assertion => ({ assertion, option_id: null, set: 'recommendation' }))),
  ...(option.bonus_rate_rules || []).flatMap(rule => (rule.field_assertions || []).map(assertion => ({ assertion, option_id: option.option_id, set: 'recommendation' }))),
];

const setReceipt = (entries, reviews) => {
  const assertions = entries.map(entry => entry.assertion);
  const verifiedCount = entries.filter(entry => verifiedReview(reviews.get(`${entry.offer_id}|${entry.option_id || 'offer'}|${assertionIdentity(entry.assertion)}`), entry.assertion)).length;
  return {
    assertion_ids: assertions.map(assertionIdentity).sort(),
    checksum: assertionSetChecksum(assertions),
    review_coverage: assertions.length ? verifiedCount / assertions.length : 0,
  };
};

function promotion(offer, option, reviews) {
  const entries = assertionEntries(offer, option).map(entry => ({ ...entry, offer_id: offer.id }));
  const comparisonEntries = entries.filter(entry => entry.set === 'comparison');
  const recommendationEntries = entries;
  const required = recommendationEntries.map(entry => ({
    ...entry,
    review: reviews.get(`${offer.id}|${entry.option_id || 'offer'}|${assertionIdentity(entry.assertion)}`),
  }));
  const missing = required.filter(({ assertion, review }) => !verifiedReview(review, assertion));
  const optionSchema = option.schema_validation_receipt;
  const expectedSchemaChecksum = schemaValidationChecksum(option);
  const schemaValid = optionSchema?.validation_status === 'valid'
    && normalized(optionSchema.content_checksum) === normalized(expectedSchemaChecksum);
  if (!schemaValid) missing.push({ reason: 'SCHEMA_RECEIPT_INVALID' });
  const sales = required.find(({ assertion, review }) => assertion.field === 'sales_verification_status' && review?.review_category === 'sales' && verifiedReview(review, assertion));
  if (!sales) missing.push({ reason: 'SALES_VERIFICATION_RECEIPT_MISSING' });
  const reviewerKeys = required.filter(({ review, assertion }) => verifiedReview(review, assertion)).map(({ review }) => `${review.reviewer}|${review.reviewer_role}|${review.reviewer_permission}|${review.reviewer_signature}`);
  const reviewerConsistent = reviewerKeys.length > 0 && new Set(reviewerKeys).size === 1;
  if (!reviewerConsistent) missing.push({ reason: 'REVIEWER_CONSISTENCY_REQUIRED' });
  const sourceSet = (offer.provenance || []).map(entry => ({ source_id: entry.source_id, checksum: entry.checksum }));
  const sourceAuthoritySummary = Object.fromEntries((offer.provenance || []).map(entry => {
    const sourceReview = [...reviews.values()].find(review => review.offer_id === offer.id && review.source_id === entry.source_id && review.review_status === 'verified' && authority.has(review.authority_class));
    return [entry.source_id, { authority: sourceReview?.authority_class || 'unreviewed_source', receipt_id: sourceReview?.receipt_id || null }];
  }));
  const comparisonApproved = missing.length === 0;
  const primaryReview = required.find(({ assertion, review }) => verifiedReview(review, assertion))?.review;
  const body = {
    offer_id: offer.id,
    option_id: option.option_id,
    checksum_verified: comparisonApproved,
    strict_schema_checksum: sha256({ type: offer.type, required: ['deposit_protection_status', 'join_channels', 'eligibility_rules', 'bonus_rate_rules', 'early_termination_rules', 'sales_verification_status'], option: schemaValidationChecksum(option) }).slice(7),
    schema_content_checksum: expectedSchemaChecksum.slice(7),
    assertion_sets: {
      comparison: setReceipt(comparisonEntries, reviews),
      recommendation: setReceipt(recommendationEntries, reviews),
    },
    required_assertion_checksum: assertionSetChecksum(recommendationEntries.map(entry => entry.assertion)).slice(7),
    source_set_checksum: sha256(sourceSet).slice(7),
    source_authority_summary: sourceAuthoritySummary,
    freshness_evaluation_as_of: offer.observed_at,
    conflict_count: recommendationEntries.filter(({ assertion }) => assertion.conflict === true).length,
    sales_verification_receipt_id: sales?.review?.receipt_id || null,
    comparison_approved: comparisonApproved,
    recommendation_approved: false,
    mode: 'shadow',
    reviewer: comparisonApproved ? primaryReview.reviewer : 'unpromoted',
    reviewer_role: comparisonApproved ? primaryReview.reviewer_role : null,
    reviewer_signature: comparisonApproved ? primaryReview.reviewer_signature : null,
    reviewer_permission: comparisonApproved ? primaryReview.reviewer_permission : null,
    evaluated_at: evaluatedAt,
    ...(comparisonApproved ? { approved_at: evaluatedAt } : {}),
    expires_at: offer.valid_to || new Date(Date.parse(offer.observed_at) + 720 * 3600_000).toISOString(),
    reason_codes: comparisonApproved ? ['RECOMMENDATION_APPROVAL_REQUIRED'] : [...new Set(['SOURCE_REVIEW_REQUIRED', ...missing.map(item => item.reason).filter(Boolean), 'RECOMMENDATION_APPROVAL_REQUIRED'])],
  };
  return { ...body, candidate_content_checksum: sha256(canonicalCandidateContent(offer, { ...option, promotion_receipt: body })) };
}

for (const domain of selectedDomains) {
  const offers = readRows(path.join(decisionDir, `${domain}-offers.jsonl`));
  const reviewRows = readRows(path.join(reviewDir, `${domain}.jsonl`));
  const reviews = new Map(reviewRows.map(row => [reviewKey(row), row]));
  const rows = offers.flatMap(offer => (offer.options || []).map(option => promotion(offer, option, reviews)));
  fs.mkdirSync(promotionDir, { recursive: true });
  fs.writeFileSync(path.join(promotionDir, `${domain}.jsonl`), rows.map(row => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''));
  const promotions = new Map(rows.map(row => [row.option_id, row]));
  const outputOffers = offers.map(offer => ({
    ...offer,
    options: (offer.options || []).map(option => ({ ...option, promotion_receipt: promotions.get(option.option_id) || null })),
  }));
  fs.writeFileSync(path.join(decisionDir, `${domain}-offers.jsonl`), outputOffers.map(offer => JSON.stringify(offer)).join('\n') + (outputOffers.length ? '\n' : ''));
  console.log(JSON.stringify({ domain, candidate_count: rows.length, comparison_approved_count: rows.filter(row => row.comparison_approved).length, status: rows.some(row => row.comparison_approved) ? 'reviewed' : 'blocked' }));
}

if (!decisionOfferFiles().length) process.exitCode = 1;

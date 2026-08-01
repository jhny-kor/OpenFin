import fs from 'node:fs';
import path from 'node:path';
import { ROOT, KNOWLEDGE, json, sha256, decisionOfferFiles, canonicalCandidateContent } from './common.mjs';

const requested = process.argv.slice(2).filter(value => ['deposit', 'saving'].includes(value));
const selectedDomains = requested.length ? requested : ['deposit', 'saving'];
const authority = new Set(['association_official', 'government_official', 'law_official', 'provider_official', 'regulator_official']);
const reviewDir = path.join(ROOT, 'evidence/source-reviews');
const promotionDir = path.join(ROOT, 'evidence/candidate-promotions');
const decisionDir = path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision');
const evaluatedAt = process.env.OPENFIN_PROMOTION_EVALUATED_AT;

const receiptKey = row => `${row.offer_id}|${row.option_id || 'offer'}|${row.field}`;
const readRows = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];
const reviewChecksumVerified = review => review && typeof review.receipt_checksum === 'string'
  && review.receipt_checksum === sha256(Object.fromEntries(Object.entries(review).filter(([key]) => key !== 'receipt_checksum')));
const verifiedReview = (review, assertion) => review && review.review_status === 'verified' && review.source_id === assertion.source_id
  && review.observed_value_hash === assertion.value_hash && review.source_checksum === assertion.receipt_checksum
  && review.original_url === assertion.original_url && JSON.stringify(review.locator) === JSON.stringify(assertion.locator)
  && authority.has(review.authority_class)
  && review.reviewer && review.reviewer_role && review.reviewer_signature && review.reviewer_permission && review.reviewed_at
  && reviewChecksumVerified(review);

function promotion(offer, option, reviews) {
  const assertions = [...(offer.field_assertions || []), ...(option.field_assertions || [])];
  const required = assertions.map(assertion => ({ assertion, review: reviews.get(`${offer.id}|${option.option_id}|${assertion.field}`) || reviews.get(`${offer.id}|offer|${assertion.field}`) }));
  const missing = required.filter(({ assertion, review }) => !verifiedReview(review, assertion));
  if (option.schema_validation_receipt?.validation_status !== 'valid') missing.push({ assertion: { field: 'schema_validation_receipt' }, review: null });
  const optionForChecksum = Object.fromEntries(Object.entries(option).filter(([key]) => key !== 'promotion_receipt'));
  const sourceSet = offer.provenance?.map(entry => ({ source_id: entry.source_id, checksum: entry.checksum })) || [];
  const sourceAuthoritySummary = Object.fromEntries((offer.provenance || []).map(entry => {
    const sourceReview = [...reviews.values()].find(review => review.offer_id === offer.id && review.source_id === entry.source_id && review.review_status === 'verified');
    return [entry.source_id, { authority: sourceReview?.authority_class || 'unreviewed_source', receipt_id: sourceReview?.receipt_id || entry.receipt_id || null }];
  }));
  const body = {
    offer_id: offer.id,
    option_id: option.option_id,
    checksum_verified: missing.length === 0,
    strict_schema_checksum: sha256({ type: offer.type, required: ['deposit_protection_status', 'join_channels', 'eligibility_rules', 'bonus_rate_rules', 'early_termination_rules', 'sales_verification_status'], option: optionForChecksum }).slice(7),
    required_assertion_checksum: sha256(assertions).slice(7),
    source_set_checksum: sha256(sourceSet).slice(7),
    source_authority_summary: sourceAuthoritySummary,
    freshness_evaluation_as_of: offer.observed_at,
    conflict_count: assertions.filter(item => item.conflict === true).length,
    sales_verification_receipt_id: `receipt.source.sales.${offer.id}`,
    comparison_approved: missing.length === 0 && assertions.every(item => item.verification_status === 'verified' && item.freshness_status === 'current' && item.conflict !== true),
    recommendation_approved: false,
    mode: 'shadow',
    reviewer: missing.length ? 'unpromoted' : required[0]?.review?.reviewer,
    reviewer_role: missing.length ? null : required[0]?.review?.reviewer_role,
    reviewer_signature: missing.length ? null : required[0]?.review?.reviewer_signature,
    reviewer_permission: missing.length ? null : required[0]?.review?.reviewer_permission,
    evaluated_at: evaluatedAt || offer.observed_at,
    expires_at: offer.valid_to,
    reason_codes: missing.length ? ['SOURCE_REVIEW_REQUIRED', 'RECOMMENDATION_APPROVAL_REQUIRED'] : ['RECOMMENDATION_APPROVAL_REQUIRED'],
  };
  if (!missing.length) body.approved_at = evaluatedAt || offer.observed_at;
  return { ...body, candidate_content_checksum: sha256(canonicalCandidateContent(offer, { ...option, promotion_receipt: body })) };
}

for (const domain of selectedDomains) {
  const offers = readRows(path.join(decisionDir, `${domain}-offers.jsonl`));
  const reviewRows = readRows(path.join(reviewDir, `${domain}.jsonl`));
  const reviews = new Map(reviewRows.map(row => [receiptKey(row), row]));
  const rows = offers.flatMap(offer => (offer.options || []).map(option => promotion(offer, option, reviews)));
  fs.mkdirSync(promotionDir, { recursive: true });
  fs.writeFileSync(path.join(promotionDir, `${domain}.jsonl`), rows.map(row => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''));
  console.log(JSON.stringify({ domain, candidate_count: rows.length, comparison_approved_count: rows.filter(row => row.comparison_approved).length, status: rows.some(row => row.comparison_approved) ? 'reviewed' : 'blocked' }));
}

if (!decisionOfferFiles().length) process.exitCode = 1;

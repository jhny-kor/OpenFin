import fs from 'node:fs';
import path from 'node:path';
import { ROOT, KNOWLEDGE, DOCS, json, sha256 } from './common.mjs';

export const RELEASE_POLICY_PATH = path.join(ROOT, 'contracts/release-policy.json');
export const PRODUCT_STATUS_PATH = path.join(ROOT, 'contracts/product-status.json');
export const RECOMMENDATION_STATE_PATH = path.join(ROOT, 'contracts/recommendation-state.json');
const LIVE_FIXTURE_PATH = path.join(ROOT, 'tests/golden/openfin-runtime-contract-120.jsonl');
export const readReleasePolicy = () => json(RELEASE_POLICY_PATH);
export const readProductStatus = () => json(PRODUCT_STATUS_PATH);
export const readRecommendationState = () => json(RECOMMENDATION_STATE_PATH);

export const readCanonicalRecords = (root = KNOWLEDGE) => {
  const records = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.jsonl')) {
        for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
          if (line.trim()) records.push(JSON.parse(line));
        }
      }
      else if (entry.name.endsWith('.md')) {
        const text = fs.readFileSync(file, 'utf8');
        const end = text.startsWith('---\n') ? text.indexOf('\n---\n', 4) : -1;
        if (end >= 0) { const value = JSON.parse(text.slice(4, end)); if (value?.id && !value.id.startsWith('folder.')) records.push(value); }
      }
    }
  };
  walk(root);
  return [...new Map(records.map(item => [item.id, item])).values()].sort((a, b) => a.id.localeCompare(b.id));
};

const PRODUCT_TYPES = new Set(['account-product', 'bank-product', 'card-product', 'financial-product', 'insurance-product']);
const DECISION_OFFER_TYPES = new Set(['deposit-offer', 'saving-offer']);
const CAPABILITY_POLICY_PATH = path.join(ROOT, 'contracts/capability-policy.json');
const CAPABILITY_STATUS_PATH = path.join(ROOT, 'contracts/capability-status.json');
const readCapabilityPolicy = () => json(CAPABILITY_POLICY_PATH);
const readCapabilityStatus = () => json(CAPABILITY_STATUS_PATH);
const normalizeSalesStatus = value => {
  const contract = readProductStatus();
  if (contract.sales_verification_status.includes(value)) return value;
  return contract.legacy_aliases?.[value] || 'unknown';
};
const domainFor = item => item.search_type === 'deposit' || item.product_kind === 'deposit' ? 'deposit'
  : item.search_type === 'saving' || item.product_kind === 'saving' ? 'saving'
  : item.type === 'card-product' ? 'card'
  : item.type === 'insurance-product' ? 'insurance'
  : item.search_type === 'loan' || item.product_kind === 'loan' ? 'loan'
  : item.type === 'account-product' ? 'account' : null;
const present = value => value !== undefined && value !== null && value !== '';
const assertionFor = (item, field) => [
  ...(item.field_assertions || []).filter(value => value?.field === field),
  ...(item.source_assertions || []).filter(value => value?.field === field),
  ...(item.provenance || []).filter(value => (value?.supported_fields || []).includes(field)).map(value => ({ ...value, field })),
];
const verifiedField = (item, field, evaluationAsOf = null) => assertionFor(item, field).some(assertion => {
  const validTo = assertion.valid_to ? Date.parse(assertion.valid_to) : NaN;
  const evaluationTime = evaluationAsOf ? Date.parse(evaluationAsOf) : NaN;
  return assertion.verification_status === 'verified'
    && assertion.freshness_status === 'current'
    && !assertion.conflict
    && (!Number.isFinite(validTo) || !Number.isFinite(evaluationTime) || validTo >= evaluationTime);
});
const fieldVerified = (item, fields) => fields.every(field => present(item[field]) && verifiedField(item, field));
const strictDecisionCandidate = item => DECISION_OFFER_TYPES.has(item.type)
  && Array.isArray(item.options) && item.options.length > 0;
const optionFields = domain => domain === 'deposit'
  ? ['base_rate_percent', 'maximum_rate_percent', 'term_months', 'interest_method', 'minimum_deposit_krw', 'maximum_deposit_krw']
  : ['base_rate_percent', 'maximum_rate_percent', 'term_months', 'saving_method', 'monthly_payment_min_krw', 'monthly_payment_max_krw'];
const rulesVerified = (item, evaluationAsOf) => ['eligibility_rules', 'bonus_rate_rules', 'early_termination_rules'].every(field =>
  Array.isArray(item[field]) && item[field].every(rule => {
    const assertions = rule?.field_assertions || [];
    const required = ['predicate', 'valid_from', 'valid_to', ...(['bonus-rate', 'early-termination'].includes(rule?.rule_type) ? ['effect'] : [])];
    return required.every(name => assertions.some(assertion => String(assertion?.field || '').endsWith(`.${name}`) || assertion?.field === name)) && assertions.every(assertion => {
    const validTo = assertion?.valid_to ? Date.parse(assertion.valid_to) : NaN;
    const evaluationTime = evaluationAsOf ? Date.parse(evaluationAsOf) : NaN;
    return assertion.verification_status === 'verified' && assertion.freshness_status === 'current' && !assertion.conflict
      && (!Number.isFinite(validTo) || !Number.isFinite(evaluationTime) || validTo >= evaluationTime);
    });
      }));
const optionVerified = (offer, option, domain, evaluationAsOf) => optionFields(domain).every(field => {
  const value = field === 'minimum_deposit_krw' ? option.amount_limit?.minimum_krw
    : field === 'maximum_deposit_krw' ? option.amount_limit?.maximum_krw
    : field === 'monthly_payment_min_krw' ? option.monthly_payment_limit?.minimum_krw
    : field === 'monthly_payment_max_krw' ? option.monthly_payment_limit?.maximum_krw
    : option[field];
  return present(value) && (option.field_assertions || []).some(assertion => {
    const validTo = assertion.valid_to ? Date.parse(assertion.valid_to) : NaN;
    const evaluationTime = evaluationAsOf ? Date.parse(evaluationAsOf) : NaN;
    return String(assertion.field || '').endsWith(`.${field}`) && assertion.verification_status === 'verified' && assertion.freshness_status === 'current' && !assertion.conflict && (!Number.isFinite(validTo) || !Number.isFinite(evaluationTime) || validTo >= evaluationTime);
  });
}) && strictOfferVerified(offer, domain, ['deposit_protection_status', 'join_channels', 'eligibility_rules', 'bonus_rate_rules', 'early_termination_rules', 'sales_verification_status'], evaluationAsOf);
const optionComplete = (option, domain) => optionFields(domain).every(field => {
  const value = field === 'minimum_deposit_krw' ? option.amount_limit?.minimum_krw
    : field === 'maximum_deposit_krw' ? option.amount_limit?.maximum_krw
    : field === 'monthly_payment_min_krw' ? option.monthly_payment_limit?.minimum_krw
    : field === 'monthly_payment_max_krw' ? option.monthly_payment_limit?.maximum_krw
    : option[field];
  return present(value) && (option.field_assertions || []).some(assertion => String(assertion.field || '').endsWith(`.${field}`));
});
const strictOfferComplete = (item, domain, fields) => strictDecisionCandidate(item)
  && fields.every(field => present(item[field]) && assertionFor(item, field).length > 0)
  && item.options.every(option => optionFields(domain).every(field =>
    Array.isArray(option?.field_assertions) && option.field_assertions.some(assertion => String(assertion?.field || '').endsWith(`.${field}`))));
const strictOfferVerified = (item, domain, fields, evaluationAsOf) => strictOfferComplete(item, domain, fields)
  && fields.every(field => verifiedField(item, field, evaluationAsOf))
  && rulesVerified(item, evaluationAsOf)
  && item.options.every(option => optionFields(domain).every(field =>
    Array.isArray(option?.field_assertions) && option.field_assertions.some(assertion => {
      const validTo = assertion?.valid_to ? Date.parse(assertion.valid_to) : NaN;
      const evaluationTime = evaluationAsOf ? Date.parse(evaluationAsOf) : NaN;
      return String(assertion?.field || '').endsWith(`.${field}`)
        && assertion.verification_status === 'verified'
        && assertion.freshness_status === 'current'
        && !assertion.conflict
        && (!Number.isFinite(validTo) || !Number.isFinite(evaluationTime) || validTo >= evaluationTime);
    })));
const shaFile = file => fs.existsSync(file) ? sha256(fs.readFileSync(file, 'utf8')).slice(7) : null;
const promotionReceipts = () => {
  const receipts = new Map();
  const directory = path.join(ROOT, 'evidence/candidate-promotions');
  if (!fs.existsSync(directory)) return receipts;
  for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.jsonl'))) {
    for (const line of fs.readFileSync(path.join(directory, file), 'utf8').split('\n').filter(Boolean)) {
      const value = JSON.parse(line);
      if (value.option_id) receipts.set(value.option_id, value);
    }
  }
  return receipts;
};
export const generationId = ({ canonicalContentChecksum, searchIndexChecksum, sourceStatusChecksum, releasePolicyChecksum, deploymentCommit }) => sha256({
  canonical_content_checksum: canonicalContentChecksum,
  search_index_checksum: searchIndexChecksum,
  source_status_checksum: sourceStatusChecksum,
  release_policy_checksum: releasePolicyChecksum,
  deployment_commit: deploymentCommit || 'unknown',
}).slice(7);

// Evidence is produced by CI or checked in under evidence/, never copied from docs output.
const liveRegressionEvidence = () => {
  const file = path.join(ROOT, 'evidence/live-regression/current.json');
  if (!fs.existsSync(file)) {
    const missing = { status: 'missing', test_count: 0, passed_count: 0, failed_count: 0, skipped_count: 0, evidence_path: null, evidence_checksum: null };
    return { ...missing, last_attempt: missing, last_successful: null, gate_basis: 'last_attempt' };
  }
  const live = json(file);
  // New artifacts separate the most recent attempt from the last passing run.
  // Keep accepting the historical flat artifact as both values during rollout.
  const lastAttempt = live.last_attempt || live.last_attempt_evidence || live;
  const lastSuccessful = live.last_successful || live.last_successful_evidence || (live.last_attempt ? null : live);
  return {
    ...live,
    ...lastAttempt,
    last_attempt: lastAttempt,
    last_successful: lastSuccessful,
    gate_basis: 'last_attempt',
    evidence_path: 'evidence/live-regression/current.json',
    evidence_checksum: shaFile(file),
  };
};
export const liveRegressionCurrent = (live, policy, now = Date.now(), expectedGenerationId = null, expectedFixtureChecksum = null) => {
  const attempt = live.last_attempt || live.last_attempt_evidence || live;
  const checkedAt = Date.parse(attempt.checked_at || '');
  const ttlMs = Number(policy.live_regression.freshness_ttl_hours || 24) * 60 * 60 * 1000;
  const ageMs = now - checkedAt;
  return attempt.status === 'current'
    && attempt.mode === policy.live_regression.required_mode
    && attempt.test_count === policy.live_regression.required_count
    && attempt.passed_count === policy.live_regression.required_count
    && attempt.failed_count === 0
    && (attempt.skipped_count || 0) === 0
    && Number.isFinite(checkedAt)
    && ageMs >= 0
    && ageMs <= ttlMs
    && typeof attempt.manifest_checksum === 'string'
    && typeof attempt.loaded_index_checksum === 'string'
    && typeof attempt.deployment_commit === 'string'
    && attempt.deployment_commit !== 'unknown'
    && (!expectedGenerationId || attempt.generation_id === expectedGenerationId)
    && (!expectedFixtureChecksum || attempt.fixture_checksum === expectedFixtureChecksum);
};

export const deriveQuality = (records, { sourceCount, exportCount, searchItemCount, relationshipCount, invalidUrlCount = 0, sourceStatusLoaded = true, sourceStatusChecksum = null, searchIndexChecksum = null, deploymentCommit = 'unknown', evaluationAsOf = null } = {}) => {
  const policy = readReleasePolicy();
  const capabilityPolicy = readCapabilityPolicy();
  const promotions = promotionReceipts();
  const recommendationState = readRecommendationState();
  const catalogRecords = records.filter(item => !DECISION_OFFER_TYPES.has(item.type) && item.type !== 'offer-option');
  const products = catalogRecords.filter(item => PRODUCT_TYPES.has(item.type));
  const decisionOffers = records.filter(item => DECISION_OFFER_TYPES.has(item.type));
  const canonicalProducts = new Set(products.map(item => item.canonical_product_id || item.id));
  const domains = {};
  for (const [name, config] of Object.entries(policy.domains)) {
    const catalogItems = products.filter(item => domainFor(item) === name);
    const offers = decisionOffers.filter(item => item.type === `${name}-offer`);
    // Once OfferSnapshots exist, only they can establish decision readiness.
    // Legacy catalog rows remain searchable, but never become decision units.
    const usingOffers = ['deposit', 'saving'].includes(name) && offers.length > 0;
    const items = usingOffers ? offers : catalogItems;
    const required = config.required_fields || [];
    const valueComplete = items.filter(item => usingOffers ? strictOfferComplete(item, name, required) : required.every(field => present(item[field])));
    const schemaDefined = required.length > 0;
    const requiredFieldTotal = schemaDefined ? items.length * required.length : null;
    const valueCompleteFieldCount = schemaDefined ? items.reduce((total, item) => total + required.filter(field => present(item[field])).length, 0) : null;
    const fieldVerifiedItems = required.length ? valueComplete.filter(item => usingOffers
      ? strictOfferVerified(item, name, required, evaluationAsOf)
      : strictDecisionCandidate(item) && required.every(field => present(item[field]) && assertionFor(item, field).some(assertion => {
      const validTo = assertion.valid_to ? Date.parse(assertion.valid_to) : NaN;
      const evaluationTime = evaluationAsOf ? Date.parse(evaluationAsOf) : NaN;
      return assertion.verification_status === 'verified' && assertion.freshness_status === 'current' && !assertion.conflict && (!Number.isFinite(validTo) || !Number.isFinite(evaluationTime) || validTo >= evaluationTime);
    }))) : [];
    const fieldVerifiedCount = schemaDefined ? items.reduce((total, item) => total + required.filter(field => usingOffers
      ? verifiedField(item, field, evaluationAsOf)
      : present(item[field]) && assertionFor(item, field).some(assertion => {
      const validTo = assertion.valid_to ? Date.parse(assertion.valid_to) : NaN;
      const evaluationTime = evaluationAsOf ? Date.parse(evaluationAsOf) : NaN;
      return assertion.verification_status === 'verified' && assertion.freshness_status === 'current' && !assertion.conflict && (!Number.isFinite(validTo) || !Number.isFinite(evaluationTime) || validTo >= evaluationTime);
    })).length, 0) : null;
    const runtimeEligible = fieldVerifiedItems.filter(item => normalizeSalesStatus(item.sales_verification_status) === 'verified_active' && (usingOffers || (item.sales_status === 'active' && item.freshness_status === 'current')));
    const optionRows = usingOffers ? items.flatMap(offer => (offer.options || []).map(option => ({ offer, option }))) : [];
    const structuralOptionCount = optionRows.length;
    const strictOptionCount = optionRows.filter(({ option }) => optionComplete(option, name)).length;
    const comparisonEligibleCandidateCount = optionRows.filter(({ offer, option }) => optionVerified(offer, option, name, evaluationAsOf) && promotions.get(option.option_id)?.comparison_approved === true).length;
    const shadowRecommendationCandidateCount = optionRows.filter(({ option }) => {
      const promotion = promotions.get(option.option_id);
      return promotion?.mode === 'shadow'
        && promotion.checksum_verified === true
        && promotion.comparison_approved === true
        && promotion.sales_verification_receipt_id
        && promotion.assertion_sets?.recommendation?.review_coverage === 1;
    }).length;
    const ownerPilotCandidateCount = optionRows.filter(({ offer, option }) => promotions.get(option.option_id)?.recommendation_approved === true && promotions.get(option.option_id)?.mode === 'owner_pilot').length;
    const publicRecommendationCandidateCount = optionRows.filter(({ offer, option }) => promotions.get(option.option_id)?.recommendation_approved === true && optionVerified(offer, option, name, evaluationAsOf)).length;
    const threshold = config.required_verified_candidates || Infinity;
    const status = !items.length ? 'blocked'
      : !schemaDefined ? 'schema_not_defined'
      : runtimeEligible.length >= threshold ? 'limited_public_ready'
      : fieldVerifiedItems.length ? 'pilot_verified'
      : valueComplete.length ? 'structural_only'
      : 'domain_coverage_incomplete';
    const publicCount = config.comparison === 'limited_public_ready' && status === 'limited_public_ready' ? comparisonEligibleCandidateCount : 0;
    domains[name] = {
      item_count: items.length,
      catalog_item_count: catalogItems.length,
      strict_offer_count: usingOffers ? items.length : 0,
      strict_option_count: strictOptionCount,
      structural_option_count: structuralOptionCount,
      required_fields: required,
      sales_verification_ttl_hours: Number.isFinite(config.sales_verification_ttl_hours) ? config.sales_verification_ttl_hours : null,
      structural_candidate_count: items.length,
      value_complete_candidate_count: valueComplete.length,
      strict_type_schema_candidate_count: valueComplete.filter(strictDecisionCandidate).length,
      field_verified_candidate_count: fieldVerifiedItems.length,
      runtime_eligible_candidate_count: runtimeEligible.length,
      public_candidate_count: publicCount,
      comparison_eligible_candidate_count: comparisonEligibleCandidateCount,
      public_comparison_candidate_count: publicCount,
      shadow_recommendation_candidate_count: shadowRecommendationCandidateCount,
      owner_pilot_candidate_count: ownerPilotCandidateCount,
      public_recommendation_candidate_count: publicRecommendationCandidateCount,
      // Compatibility projections. "verified" means field-level verified only.
      schema_defined: schemaDefined,
      structural_value_completeness: schemaDefined ? valueComplete.length / items.length : null,
      required_field_total: requiredFieldTotal,
      value_complete_field_count: valueCompleteFieldCount,
      field_verified_count: fieldVerifiedCount,
      value_field_coverage: schemaDefined && requiredFieldTotal ? valueCompleteFieldCount / requiredFieldTotal : null,
      reviewed_assertion_coverage: schemaDefined && requiredFieldTotal ? fieldVerifiedCount / requiredFieldTotal : null,
      complete_field_count: schemaDefined ? valueComplete.length : null,
      verified_candidate_count: fieldVerifiedItems.length,
      comparison_data: status === 'limited_public_ready' ? 'limited_public_ready' : status,
      recommendation: config.recommendation,
      recommendation_mode: config.recommendation === 'blocked' ? 'blocked' : 'owner_pilot',
      status,
      blockers: !schemaDefined ? ['SCHEMA_NOT_DEFINED'] : !usingOffers ? ['STRICT_OFFER_SNAPSHOT_MISSING'] : !valueComplete.length ? ['STRICT_OFFER_FIELDS_INCOMPLETE'] : !fieldVerifiedItems.length ? ['FIELD_ASSERTIONS_INCOMPLETE'] : [],
      missing_required_fields: schemaDefined ? Object.fromEntries(required.map(field => [field, items.filter(item => !present(item[field])).length])) : null,
      data_layers: {
        raw: { item_count: items.filter(item => Array.isArray(item.provenance) && item.provenance.length).length, status: items.some(item => Array.isArray(item.provenance) && item.provenance.length) ? 'available' : 'missing', lineage: 'source_receipt' },
        normalized: { item_count: usingOffers ? strictOptionCount : items.filter(item => item.normalized_at || item.normalized_completeness_ratio !== undefined).length, status: usingOffers && strictOptionCount ? 'available' : items.some(item => item.normalized_at || item.normalized_completeness_ratio !== undefined) ? 'available' : 'missing', lineage: 'decision_snapshot' },
        verified: { item_count: fieldVerifiedItems.length, status: fieldVerifiedItems.length ? 'available' : 'blocked' },
      },
    };
  }
  const live = liveRegressionEvidence();
  const platformReasons = [];
  if (!catalogRecords.length) platformReasons.push('canonical_records_missing');
  if (!sourceCount || !sourceStatusLoaded) platformReasons.push('source_registry_or_status_missing');
  if (invalidUrlCount > 0) platformReasons.push('invalid_source_urls');
  if (searchItemCount !== catalogRecords.length) platformReasons.push('search_index_count_mismatch');
  if (!relationshipCount) platformReasons.push('relationship_index_missing');
  const platformReleaseStatus = platformReasons.length ? 'degraded' : 'ready';
  const comparisonReleaseStatus = Object.entries(domains).some(([name, state]) => ['deposit', 'saving'].includes(name) && state.status === 'limited_public_ready') ? 'limited' : 'blocked';
  const canonicalContentChecksum = sha256(records).slice(7);
  const releasePolicyChecksum = shaFile(RELEASE_POLICY_PATH);
  const generation_id = generationId({ canonicalContentChecksum, searchIndexChecksum, sourceStatusChecksum, releasePolicyChecksum, deploymentCommit });
  const fixtureChecksum = shaFile(LIVE_FIXTURE_PATH) ? `sha256:${shaFile(LIVE_FIXTURE_PATH)}` : null;
  const evaluationTime = evaluationAsOf ? Date.parse(evaluationAsOf) : Date.now();
  const liveReady = liveRegressionCurrent(live, policy, evaluationTime, generation_id, fixtureChecksum);
  const liveForManifest = { ...live, expected_generation_id: generation_id, expected_fixture_checksum: fixtureChecksum, validation_status: liveReady ? 'current' : live.status === 'current' && live.fixture_checksum !== fixtureChecksum ? 'stale_fixture' : live.status === 'current' ? 'stale_generation' : live.status };
const configuredReceipt = policy.recommendation?.public_approval_receipt;
const receiptPath = configuredReceipt ? path.join(ROOT, configuredReceipt) : null;
const receipt = receiptPath && fs.existsSync(receiptPath) ? json(receiptPath) : null;
const configuredOwnerReceipt = policy.recommendation?.owner_pilot_approval_receipt;
const ownerReceiptPath = configuredOwnerReceipt ? path.join(ROOT, configuredOwnerReceipt) : null;
const ownerReceipt = ownerReceiptPath && fs.existsSync(ownerReceiptPath) ? json(ownerReceiptPath) : null;
const receiptProjection = value => value ? Object.fromEntries(['approval_id', 'domain', 'mode', 'generation_id', 'candidate_set_checksum', 'policy_version', 'ranking_version', 'calculator_version', 'quality_suite_checksum', 'approved_at', 'expires_at', 'reviewer', 'reviewer_role', 'reviewer_permission', 'reviewer_signature', 'reviewer_signature_algorithm', 'rollback_generation_id'].filter(key => value[key] !== undefined).map(key => [key, value[key]])) : null;
  const publicDomain = Object.entries(domains).some(([name, state]) => ['deposit', 'saving'].includes(name) && state.status === 'limited_public_ready' && state.public_recommendation_candidate_count >= (policy.domains[name].required_verified_candidates || Infinity));
  const receiptValid = Boolean(receipt && receipt.mode === 'public' && receipt.generation_id === generation_id && receipt.policy_version === policy.version && Date.parse(receipt.expires_at || '') > evaluationTime);
  const recommendationEnabled = platformReleaseStatus === 'ready' && policy.recommendation?.public_enabled === true && policy.recommendation?.state === 'public' && receiptValid && liveReady && publicDomain;
  const recommendationReasons = [...platformReasons];
  if (!liveReady) recommendationReasons.push(`live_regression_${live.status || 'missing'}`);
  if (!publicDomain) recommendationReasons.push('no_public_recommendation_domain');
  if (!policy.recommendation?.public_enabled) recommendationReasons.push('public_recommendation_policy_blocked');
  if (!policy.recommendation?.public_approval_receipt) recommendationReasons.push('public_approval_receipt_missing');
  if (policy.recommendation?.state !== 'public') recommendationReasons.push(`recommendation_state_${policy.recommendation?.state || 'missing'}`);
  if (!receiptValid && policy.recommendation?.public_approval_receipt) recommendationReasons.push('public_approval_receipt_invalid');
  const recommendationReleaseStatus = recommendationEnabled ? 'ready' : 'blocked';
  const candidate_counts = Object.fromEntries(Object.entries(domains).map(([name, state]) => [name, {
    strict_offer_count: Number(state.strict_offer_count || 0),
    strict_option_count: Number(state.strict_option_count || 0),
    structural_option_count: Number(state.structural_option_count || 0),
    comparison_eligible_candidate_count: Number(state.comparison_eligible_candidate_count || 0),
    public_comparison_candidate_count: Number(state.public_comparison_candidate_count || 0),
    shadow_recommendation_candidate_count: Number(state.shadow_recommendation_candidate_count || 0),
    owner_pilot_candidate_count: Number(state.owner_pilot_candidate_count || 0),
    public_recommendation_candidate_count: Number(state.public_recommendation_candidate_count || 0),
  }]));
  const capabilities = {
    search: platformReleaseStatus === 'ready' ? 'ready' : 'blocked',
    discovery: platformReleaseStatus === 'ready' ? 'ready' : 'blocked',
    comparison: comparisonReleaseStatus === 'limited' ? 'limited' : 'blocked',
    shadow: Object.values(domains).some(state => state.shadow_recommendation_candidate_count > 0) ? 'ready' : 'blocked',
    owner_pilot: Object.values(domains).some(state => state.owner_pilot_candidate_count > 0) ? 'ready' : 'blocked',
    recommendation: recommendationEnabled ? 'ready' : 'blocked',
  };
  const statusRegistry = readCapabilityStatus();
  if (!Object.values(capabilities).every(status => statusRegistry.capability_status.includes(status))) throw new Error('capability status registry drift');
  const serviceAvailability = platformReleaseStatus === 'ready' ? 'available' : 'degraded';
  if (!statusRegistry.service_availability.includes(serviceAvailability)) throw new Error('service availability registry drift');
  return {
    policy_version: policy.version,
    canonical: { item_count: catalogRecords.length, decision_snapshot_count: decisionOffers.length, source_count: sourceCount, product_count: products.length, canonical_product_count: canonicalProducts.size, export_count: exportCount, search_item_count: searchItemCount, relationship_count: relationshipCount, content_checksum: canonicalContentChecksum },
    domains,
    candidate_counts,
    service_availability: serviceAvailability,
    capability_status_version: statusRegistry.version,
    capability_policy_version: capabilityPolicy.version,
    capabilities,
    live_regression: liveForManifest,
    live_regression_ready: liveReady,
    platform_release_status: platformReleaseStatus,
    core_search_status: platformReleaseStatus,
    comparison_release_status: comparisonReleaseStatus,
    comparison_status: comparisonReleaseStatus,
    recommendation_release_status: recommendationReleaseStatus,
    recommendation_status: recommendationReleaseStatus,
    release_status: platformReleaseStatus,
    recommendation_enabled: recommendationEnabled,
    recommendation_state: policy.recommendation?.state || recommendationState.initial_state,
    recommendation_state_contract_version: recommendationState.version,
    recommendation_approval_receipt: receiptProjection(receipt),
    owner_pilot_approval_receipt: receiptProjection(ownerReceipt),
    blocking_reasons: platformReasons,
    recommendation_blocking_reasons: [...new Set(recommendationReasons)],
    degraded_domains: Object.entries(domains).filter(([, state]) => state.status !== 'limited_public_ready').map(([name]) => name).sort(),
    generation_id,
    fixture_checksum: fixtureChecksum,
    quality_hash: sha256({ canonicalContentChecksum, policy_checksum: releasePolicyChecksum, sourceStatusChecksum, searchIndexChecksum, deploymentCommit, fixtureChecksum, live_evidence_checksum: live.evidence_checksum, domains, platformReasons, recommendationReasons }).slice(7),
  };
};

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const manifestPath = path.join(DOCS, 'finance-ontology-manifest.json');
  const manifest = fs.existsSync(manifestPath) ? json(manifestPath) : {};
  const domains = manifest.domain_readiness || {};
  const mismatches = [];
  for (const [name, state] of Object.entries(domains)) {
    const value = state || {};
    if (!(Number(value.field_verified_candidate_count ?? 0) <= Number(value.value_complete_candidate_count ?? 0) && Number(value.value_complete_candidate_count ?? 0) <= Number(value.structural_candidate_count ?? 0) && Number(value.strict_option_count ?? 0) <= Number(value.structural_option_count ?? 0) && Number(value.comparison_eligible_candidate_count ?? 0) <= Number(value.strict_option_count ?? 0) && Number(value.runtime_eligible_candidate_count ?? 0) <= Number(value.field_verified_candidate_count ?? 0) && Number(value.public_candidate_count ?? 0) <= Number(value.runtime_eligible_candidate_count ?? 0) && Number(value.public_comparison_candidate_count ?? 0) <= Number(value.comparison_eligible_candidate_count ?? 0) && Number(value.public_recommendation_candidate_count ?? 0) <= Number(value.structural_option_count ?? 0))) mismatches.push(`domain_count_invariant:${name}`);
    if (Number(value.field_verified_candidate_count ?? 0) > 0 && value.data_layers?.verified?.status === 'blocked') mismatches.push(`verified_layer_invariant:${name}`);
  }
  if (manifest.service_availability !== (manifest.blocking_reasons?.length ? 'degraded' : 'available')) mismatches.push('service_availability');
  console.log(JSON.stringify({ ok: !mismatches.length, service_availability: manifest.service_availability, comparison_status: manifest.comparison_status, recommendation_status: manifest.recommendation_status, recommendation_enabled: manifest.recommendation_enabled, quality_hash: manifest.quality_hash, mismatches }, null, 2));
  if (mismatches.length) process.exitCode = 1;
}

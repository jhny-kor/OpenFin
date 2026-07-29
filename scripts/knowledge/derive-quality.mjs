import fs from 'node:fs';
import path from 'node:path';
import { ROOT, KNOWLEDGE, DOCS, json, sha256 } from './common.mjs';

export const RELEASE_POLICY_PATH = path.join(ROOT, 'contracts/release-policy.json');
export const readReleasePolicy = () => json(RELEASE_POLICY_PATH);

export const readCanonicalRecords = (root = KNOWLEDGE) => {
  const records = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.jsonl')) for (const line of fs.readFileSync(file, 'utf8').split('\n')) if (line.trim()) records.push(JSON.parse(line));
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
const domainFor = item => item.search_type === 'deposit' || item.product_kind === 'deposit' ? 'deposit'
  : item.search_type === 'saving' || item.product_kind === 'saving' ? 'saving'
  : item.type === 'card-product' ? 'card'
  : item.type === 'insurance-product' ? 'insurance'
  : item.search_type === 'loan' || item.product_kind === 'loan' ? 'loan'
  : item.type === 'account-product' ? 'account' : null;
const present = value => value !== undefined && value !== null && value !== '';
const assertionFor = (item, field) => [
  ...(item.source_assertions || []).filter(value => value?.field === field),
  ...(item.provenance || []).filter(value => (value?.supported_fields || []).includes(field)).map(value => ({ ...value, field })),
];
const verifiedField = (item, field) => assertionFor(item, field).some(assertion =>
  assertion.verification_status === 'verified' && assertion.freshness_status === 'current' && !assertion.conflict && (!assertion.valid_to || Date.parse(assertion.valid_to) >= Date.now()));
const fieldVerified = (item, fields) => fields.every(field => present(item[field]) && verifiedField(item, field));
const shaFile = file => fs.existsSync(file) ? sha256(fs.readFileSync(file, 'utf8')).slice(7) : null;

// Evidence is produced by CI or checked in under evidence/, never copied from docs output.
const liveRegressionEvidence = () => {
  const file = path.join(ROOT, 'evidence/live-regression/current.json');
  if (!fs.existsSync(file)) return { status: 'missing', test_count: 0, passed_count: 0, failed_count: 0, skipped_count: 0, evidence_path: null, evidence_checksum: null };
  const live = json(file);
  return { ...live, evidence_path: 'evidence/live-regression/current.json', evidence_checksum: shaFile(file) };
};
const liveCurrent = (live, policy) => live.status === 'current'
  && live.mode === policy.live_regression.required_mode
  && live.test_count === policy.live_regression.required_count
  && live.passed_count === policy.live_regression.required_count
  && live.failed_count === 0
  && (live.skipped_count || 0) === 0;

export const deriveQuality = (records, { sourceCount, exportCount, searchItemCount, relationshipCount, invalidUrlCount = 0, sourceStatusLoaded = true, sourceStatusChecksum = null } = {}) => {
  const policy = readReleasePolicy();
  const products = records.filter(item => PRODUCT_TYPES.has(item.type));
  const canonicalProducts = new Set(products.map(item => item.canonical_product_id || item.id));
  const domains = {};
  for (const [name, config] of Object.entries(policy.domains)) {
    const items = products.filter(item => domainFor(item) === name);
    const required = config.required_fields || [];
    const valueComplete = items.filter(item => required.every(field => present(item[field])));
    const fieldVerifiedItems = required.length ? valueComplete.filter(item => fieldVerified(item, required)) : [];
    const runtimeEligible = fieldVerifiedItems.filter(item => item.sales_verification_status === 'verified_active' && (item.sales_status === undefined || item.sales_status === 'active') && item.freshness_status === 'current');
    const threshold = config.required_verified_candidates || Infinity;
    const status = !items.length ? 'blocked'
      : !required.length ? 'engine_ready'
      : runtimeEligible.length >= threshold ? 'limited_public_ready'
      : fieldVerifiedItems.length ? 'pilot_verified'
      : valueComplete.length ? 'structural_only'
      : 'domain_coverage_incomplete';
    const publicCount = config.comparison === 'limited_public_ready' && status === 'limited_public_ready' ? runtimeEligible.length : 0;
    domains[name] = {
      item_count: items.length,
      required_fields: required,
      structural_candidate_count: items.length,
      value_complete_candidate_count: valueComplete.length,
      field_verified_candidate_count: fieldVerifiedItems.length,
      runtime_eligible_candidate_count: runtimeEligible.length,
      public_candidate_count: publicCount,
      // Compatibility projections. "verified" means field-level verified only.
      complete_field_count: valueComplete.length,
      verified_candidate_count: fieldVerifiedItems.length,
      comparison_data: status === 'limited_public_ready' ? 'limited_public_ready' : status,
      recommendation: config.recommendation,
      recommendation_mode: config.recommendation === 'blocked' ? 'blocked' : 'owner_pilot',
      status,
      blockers: required.length && !fieldVerifiedItems.length ? ['FIELD_ASSERTIONS_INCOMPLETE'] : [],
      missing_required_fields: Object.fromEntries(required.map(field => [field, items.filter(item => !present(item[field])).length])),
      data_layers: {
        raw: { item_count: items.filter(item => Array.isArray(item.source_records) && item.source_records.length).length, status: items.some(item => Array.isArray(item.source_records) && item.source_records.length) ? 'available' : 'missing' },
        normalized: { item_count: items.filter(item => item.normalized_at || item.normalized_completeness_ratio !== undefined).length, status: items.some(item => item.normalized_at || item.normalized_completeness_ratio !== undefined) ? 'available' : 'missing' },
        verified: { item_count: fieldVerifiedItems.length, status: fieldVerifiedItems.length ? 'available' : 'blocked' },
      },
    };
  }
  const live = liveRegressionEvidence();
  const platformReasons = [];
  if (!records.length) platformReasons.push('canonical_records_missing');
  if (!sourceCount || !sourceStatusLoaded) platformReasons.push('source_registry_or_status_missing');
  if (invalidUrlCount > 0) platformReasons.push('invalid_source_urls');
  if (searchItemCount !== records.length) platformReasons.push('search_index_count_mismatch');
  if (!relationshipCount) platformReasons.push('relationship_index_missing');
  const platformReleaseStatus = platformReasons.length ? 'degraded' : 'ready';
  const comparisonReleaseStatus = Object.entries(domains).some(([name, state]) => ['deposit', 'saving'].includes(name) && state.status === 'limited_public_ready') ? 'limited' : 'blocked';
  const liveReady = liveCurrent(live, policy);
  const publicDomain = Object.entries(domains).some(([name, state]) => ['deposit', 'saving'].includes(name) && state.status === 'limited_public_ready' && state.recommendation_mode === 'public');
  const recommendationEnabled = platformReleaseStatus === 'ready' && policy.recommendation?.public_enabled === true && Boolean(policy.recommendation?.public_approval_receipt) && liveReady && publicDomain;
  const recommendationReasons = [...platformReasons];
  if (!liveReady) recommendationReasons.push(`live_regression_${live.status || 'missing'}`);
  if (!publicDomain) recommendationReasons.push('no_public_recommendation_domain');
  if (!policy.recommendation?.public_enabled) recommendationReasons.push('public_recommendation_policy_blocked');
  if (!policy.recommendation?.public_approval_receipt) recommendationReasons.push('public_approval_receipt_missing');
  const recommendationReleaseStatus = recommendationEnabled ? 'ready' : 'blocked';
  const canonicalContentChecksum = sha256(records).slice(7);
  return {
    policy_version: policy.version,
    canonical: { item_count: records.length, source_count: sourceCount, product_count: products.length, canonical_product_count: canonicalProducts.size, export_count: exportCount, search_item_count: searchItemCount, relationship_count: relationshipCount, content_checksum: canonicalContentChecksum },
    domains,
    live_regression: live,
    live_regression_ready: liveReady,
    platform_release_status: platformReleaseStatus,
    comparison_release_status: comparisonReleaseStatus,
    recommendation_release_status: recommendationReleaseStatus,
    release_status: platformReleaseStatus,
    recommendation_enabled: recommendationEnabled,
    blocking_reasons: platformReasons,
    recommendation_blocking_reasons: [...new Set(recommendationReasons)],
    degraded_domains: Object.entries(domains).filter(([, state]) => state.status !== 'limited_public_ready').map(([name]) => name).sort(),
    quality_hash: sha256({ canonicalContentChecksum, policy_checksum: shaFile(RELEASE_POLICY_PATH), sourceStatusChecksum, live_evidence_checksum: live.evidence_checksum, domains, platformReasons, recommendationReasons }).slice(7),
  };
};

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const manifestPath = path.join(DOCS, 'finance-ontology-manifest.json');
  const manifest = fs.existsSync(manifestPath) ? json(manifestPath) : {};
  const domains = manifest.domain_readiness || {};
  const mismatches = [];
  for (const [name, state] of Object.entries(domains)) {
    const value = state || {};
    if (!(Number(value.field_verified_candidate_count ?? 0) <= Number(value.value_complete_candidate_count ?? 0) && Number(value.value_complete_candidate_count ?? 0) <= Number(value.structural_candidate_count ?? 0) && Number(value.runtime_eligible_candidate_count ?? 0) <= Number(value.field_verified_candidate_count ?? 0) && Number(value.public_candidate_count ?? 0) <= Number(value.runtime_eligible_candidate_count ?? 0))) mismatches.push(`domain_count_invariant:${name}`);
    if (Number(value.field_verified_candidate_count ?? 0) > 0 && value.data_layers?.verified?.status === 'blocked') mismatches.push(`verified_layer_invariant:${name}`);
  }
  if (manifest.release_status !== manifest.platform_release_status) mismatches.push('release_status_alias');
  console.log(JSON.stringify({ ok: !mismatches.length, release_status: manifest.release_status, platform_release_status: manifest.platform_release_status, comparison_release_status: manifest.comparison_release_status, recommendation_release_status: manifest.recommendation_release_status, recommendation_enabled: manifest.recommendation_enabled, quality_hash: manifest.quality_hash, mismatches }, null, 2));
  if (mismatches.length) process.exitCode = 1;
}

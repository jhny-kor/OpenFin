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
      else if (entry.name.endsWith('.jsonl')) {
        for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
          if (line.trim()) records.push(JSON.parse(line));
        }
      } else if (entry.name.endsWith('.md')) {
        const text = fs.readFileSync(file, 'utf8');
        if (!text.startsWith('---\n')) continue;
        const end = text.indexOf('\n---\n', 4);
        if (end < 0) continue;
        const value = JSON.parse(text.slice(4, end));
        if (value?.id && !value.id.startsWith('folder.')) records.push(value);
      }
    }
  };
  walk(root);
  return [...new Map(records.map(item => [item.id, item])).values()].sort((a, b) => a.id.localeCompare(b.id));
};

const PRODUCT_TYPES = new Set(['account-product', 'bank-product', 'card-product', 'financial-product', 'insurance-product']);
const domainFor = item => {
  if (item.search_type === 'deposit' || item.product_kind === 'deposit') return 'deposit';
  if (item.search_type === 'saving' || item.product_kind === 'saving') return 'saving';
  if (item.type === 'card-product') return 'card';
  if (item.type === 'insurance-product') return 'insurance';
  if (item.search_type === 'loan' || item.product_kind === 'loan') return 'loan';
  if (item.type === 'account-product') return 'account';
  return null;
};

const assertionFields = item => new Set([
  ...(item.provenance || []).flatMap(assertion => assertion.supported_fields || []),
  ...(item.source_assertions || []).map(assertion => assertion.field).filter(Boolean),
]);

const sourceStatus = item => {
  const statuses = (item.provenance || []).map(assertion => assertion.verification_status);
  return statuses.includes('conflict') ? 'conflict' : statuses.includes('verified') ? 'verified' : statuses.includes('reference_only') ? 'reference_only' : 'unverified';
};

const liveRegressionFromDocs = () => {
  const file = path.join(DOCS, 'openfin-quality-manifest-2026.json');
  if (!fs.existsSync(file)) return { status: 'missing', test_count: 0, passed_count: 0, failed_count: 0, skipped_count: 0 };
  const value = json(file);
  const live = value.openfin_120_live_regression;
  if (!live || typeof live !== 'object') return { status: 'missing', test_count: 0, passed_count: 0, failed_count: 0, skipped_count: 0 };
  const checkedAt = live.completed_at || live.generated_at || value.built_at || null;
  const status = ['current', 'stale', 'missing'].includes(live.status) ? live.status : (typeof checkedAt === 'string' && live.mode === 'live' ? 'current' : 'stale');
  return { ...live, status };
};

export const deriveQuality = (records, { sourceCount, exportCount, searchItemCount, relationshipCount, invalidUrlCount = 0, sourceStatusLoaded = true } = {}) => {
  const policy = readReleasePolicy();
  const products = records.filter(item => PRODUCT_TYPES.has(item.type));
  const canonicalProducts = new Set(products.map(item => item.canonical_product_id || item.id));
  const domains = {};
  for (const [domain, config] of Object.entries(policy.domains)) {
    const items = products.filter(item => domainFor(item) === domain);
    const required = config.required_fields || [];
    const complete = items.filter(item => required.every(field => item[field] !== undefined && item[field] !== null && item[field] !== ''));
    const verified = complete.filter(item => sourceStatus(item) === 'verified' && item.sales_verification_status === 'verified_active');
    const threshold = config.required_verified_candidates || Infinity;
    const status = !items.length
      ? 'blocked'
      : verified.length >= threshold && (!required.length || complete.length === items.length)
        ? 'limited_public_ready'
        : !required.length
          ? 'engine_ready'
          : complete.length > 0
            ? 'pilot_data_ready'
            : 'domain_coverage_incomplete';
    domains[domain] = {
      item_count: items.length,
      required_fields: required,
      complete_field_count: complete.length,
      verified_candidate_count: verified.length,
      comparison_data: config.comparison,
      recommendation: config.recommendation,
      status,
      missing_required_fields: Object.fromEntries(required.map(field => [field, items.filter(item => item[field] === undefined || item[field] === null || item[field] === '').length])),
      data_layers: {
        raw: { item_count: items.filter(item => Array.isArray(item.source_records) && item.source_records.length > 0).length, status: items.some(item => Array.isArray(item.source_records) && item.source_records.length > 0) ? 'available' : 'missing' },
        normalized: { item_count: items.filter(item => item.normalized_at || item.normalized_completeness_ratio !== undefined).length, status: items.some(item => item.normalized_at || item.normalized_completeness_ratio !== undefined) ? 'available' : 'missing' },
        verified: { item_count: verified.length, status: verified.length ? 'available' : 'blocked' },
      },
    };
  }
  const live = liveRegressionFromDocs();
  const liveReady = live.status === 'current' && live.mode === policy.live_regression.required_mode && live.test_count === policy.live_regression.required_count && live.passed_count === policy.live_regression.required_count && live.failed_count === 0 && (live.skipped_count || 0) === 0;
  const blockingReasons = [];
  if (!records.length) blockingReasons.push('canonical_records_missing');
  if (!sourceCount || !sourceStatusLoaded) blockingReasons.push('source_registry_or_status_missing');
  if (invalidUrlCount > 0) blockingReasons.push('invalid_source_urls');
  if (searchItemCount !== records.length) blockingReasons.push('search_index_count_mismatch');
  if (!relationshipCount) blockingReasons.push('relationship_index_missing');
  if (!liveReady) blockingReasons.push(`live_regression_${live.status}`);
  const recommendationEnabled = blockingReasons.length === 0 && Object.values(domains).some(domain => ['deposit', 'saving'].includes(domain) && domain.status === 'limited_public_ready');
  return {
    policy_version: policy.version,
    canonical: {
      item_count: records.length,
      source_count: sourceCount,
      product_count: products.length,
      canonical_product_count: canonicalProducts.size,
      export_count: exportCount,
      search_item_count: searchItemCount,
      relationship_count: relationshipCount,
    },
    domains,
    live_regression: live,
    live_regression_ready: liveReady,
    release_status: blockingReasons.length ? 'degraded' : 'ready',
    recommendation_enabled: recommendationEnabled,
    blocking_reasons: blockingReasons,
    degraded_domains: Object.entries(domains).filter(([, value]) => value.status !== 'limited_public_ready').map(([key]) => key).sort(),
    quality_hash: sha256({ records: records.map(item => item.id), domains, live, blockingReasons }).slice(7),
  };
};

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const manifestPath = path.join(DOCS, 'finance-ontology-manifest.json');
  const manifest = fs.existsSync(manifestPath) ? json(manifestPath) : {};
  const records = readCanonicalRecords();
  const derived = deriveQuality(records, {
    sourceCount: records.filter(item => item.type === 'source').length,
    exportCount: (manifest.exports || []).length,
    searchItemCount: manifest.search_index?.item_count ?? 0,
    relationshipCount: manifest.relationship_index?.item_count ?? 0,
    invalidUrlCount: 0,
  });
  const result = { ok: true, ...derived };
  if (process.argv.includes('--check')) {
    const mismatches = [];
    if (manifest.release_status !== derived.release_status) mismatches.push('release_status');
    if (manifest.recommendation_enabled !== derived.recommendation_enabled) mismatches.push('recommendation_enabled');
    if (JSON.stringify(manifest.blocking_reasons || []) !== JSON.stringify(derived.blocking_reasons)) mismatches.push('blocking_reasons');
    if (manifest.search_index?.item_count !== derived.canonical.item_count) mismatches.push('search_index.item_count');
    result.ok = mismatches.length === 0;
    result.mismatches = mismatches;
  }
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

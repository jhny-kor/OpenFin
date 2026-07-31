import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DOCS, KNOWLEDGE, ROOT, json, sha256 } from './common.mjs';
import { readCanonicalRecords, readReleasePolicy } from './derive-quality.mjs';

const policy = readReleasePolicy();
const decisionBuildRun = spawnSync(process.execPath, [path.join(ROOT, 'scripts/knowledge/build-decision-snapshots.mjs')], { cwd: ROOT, encoding: 'utf8' });
if (decisionBuildRun.status !== 0) throw new Error(decisionBuildRun.stderr || 'decision snapshot build failed');
const decisionBuildPath = path.join(ROOT, 'evidence/vertical-slice/decision-snapshot-build.json');
const decisionBuild = fs.existsSync(decisionBuildPath) ? json(decisionBuildPath) : { domains: {} };
const registryPath = path.join(DOCS, 'openfin-source-registry-2026.json');
const registry = fs.existsSync(registryPath) ? json(registryPath) : { sources: [] };
const sources = new Map((registry.sources || []).map(source => [source.id, source]));
const officialAuthority = new Set(['government_official', 'regulator_official', 'association_official', 'provider_official', 'law_official']);
const present = value => value !== undefined && value !== null && value !== '';
const domainFor = item => item.search_type === 'deposit' || item.product_kind === 'deposit' ? 'deposit'
  : item.search_type === 'saving' || item.product_kind === 'saving' ? 'saving' : null;
const assertionsFor = (item, field) => [
  ...(item.source_assertions || []).filter(assertion => assertion?.field === field),
  ...(item.provenance || []).filter(assertion => assertion?.supported_fields?.includes(field)).map(assertion => ({ ...assertion, field })),
];
const hasAssertion = (item, field) => assertionsFor(item, field).length > 0;
const hasOfficialAssertion = (item, field) => assertionsFor(item, field).some(assertion => officialAuthority.has(sources.get(assertion.source_id)?.authority_class));
const isVerified = (item, field) => assertionsFor(item, field).some(assertion => assertion.verification_status === 'verified'
  && (assertion.freshness_status === 'current' || item.freshness_status === 'current')
  && !assertion.conflict
  && (!assertion.valid_to || Date.parse(assertion.valid_to) >= Date.now()));

const records = readCanonicalRecords();
const generatedAt = process.env.OPENFIN_VERTICAL_SLICE_AT || records.flatMap(item => [item.last_verified_at, item.reviewed_at, item.source_collected_at]).filter(Boolean).sort().at(-1) || 'unknown';
const domains = {};
for (const [domain, config] of Object.entries(policy.domains)) {
  if (!['deposit', 'saving'].includes(domain)) continue;
  const items = records.filter(item => domainFor(item) === domain);
  const fields = config.required_fields || [];
  const complete = items.filter(item => fields.every(field => present(item[field])));
  const asserted = complete.filter(item => fields.every(field => hasAssertion(item, field)));
  const official = asserted.filter(item => fields.every(field => hasOfficialAssertion(item, field)));
  const verified = official.filter(item => fields.every(field => isVerified(item, field)));
  const runtime = verified.filter(item => item.sales_verification_status === 'verified_active' && item.freshness_status === 'current');
  const missingFieldCounts = Object.fromEntries(fields.map(field => [field, items.filter(item => !present(item[field])).length]));
  const assertionGapCounts = Object.fromEntries(fields.map(field => [field, complete.filter(item => !hasAssertion(item, field)).length]));
  domains[domain] = {
    target_verified_candidates: config.required_verified_candidates || 0,
    required_fields: fields,
    structural_candidate_count: items.length,
    value_complete_candidate_count: complete.length,
    field_assertion_candidate_count: asserted.length,
    official_field_assertion_candidate_count: official.length,
    field_verified_candidate_count: verified.length,
    runtime_eligible_candidate_count: runtime.length,
    target_shortfall: Math.max(0, (config.required_verified_candidates || 0) - runtime.length),
    status: runtime.length >= (config.required_verified_candidates || 0) ? 'pilot_ready_review_required' : 'blocked',
    missing_value_counts: missingFieldCounts,
    missing_assertion_counts: assertionGapCounts,
    sample_blockers: items.filter(item => !fields.every(field => isVerified(item, field))).slice(0, 10).map(item => ({
      id: item.id,
      title: item.title,
      missing_values: fields.filter(field => !present(item[field])),
      missing_assertions: fields.filter(field => !hasAssertion(item, field)),
      unverified_assertions: fields.filter(field => present(item[field]) && hasAssertion(item, field) && !isVerified(item, field)),
    })),
  };
  const strict = decisionBuild.domains?.[domain];
  if (strict) {
    domains[domain].strict_offer_count = strict.strict_offer_count;
    domains[domain].strict_offer_target = strict.target;
    domains[domain].strict_offer_shortfall = strict.shortfall;
    domains[domain].strict_offer_status = strict.strict_offer_count >= strict.target ? 'ready_review_required' : 'blocked';
  }
}

const report = {
  version: 'openfin-vertical-slice-v1',
  generated_at: generatedAt,
  source_registry_checksum: fs.existsSync(registryPath) ? sha256(fs.readFileSync(registryPath, 'utf8')).slice(7) : null,
  canonical_content_checksum: sha256(records).slice(7),
  policy_version: policy.version,
  domains,
  recommendation_enabled: false,
  recommendation_note: 'This audit never promotes products. Field-level official assertions, strict OfferSnapshot objects, and current runtime evidence are required before a pilot receipt can be issued.',
  strict_offer_targets: { deposit: 20, saving: 20 },
  strict_offer_counts: Object.fromEntries(Object.entries(domains).map(([domain, state]) => [domain, state.strict_offer_count ?? 0])),
  strict_offer_blocker: Object.values(domains).some(state => (state.strict_offer_count ?? 0) < (state.strict_offer_target ?? 20)) ? 'INSUFFICIENT_SOURCE_BACKED_OFFERS' : null,
};
const output = process.env.OPENFIN_VERTICAL_SLICE_OUTPUT || path.join(ROOT, 'evidence/vertical-slice/vertical-slice-report.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));

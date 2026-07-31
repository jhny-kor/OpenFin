import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { KNOWLEDGE, DOCS, ROOT, RELATION_KEYS, json, validUrl, sha256 } from './common.mjs';
import { deriveQuality } from './derive-quality.mjs';

const BASELINE_CONTRACT = json(path.join(ROOT, 'contracts/data-baseline.json'));

const failures = [];
const records = [];
const sources = [];
const fail = message => { if (failures.length < 500) failures.push(message); };
const isIso = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const DATE_KEY_RE = /(?:^|_)(?:date|dates|at|from|to)$/i;
const FREE_FORM_DATE_RE = /(?:\d{4}[./-]\d{1,2}[./-]\d{1,2}).*(?:\ud655\uc778|\uc218\uc9d1|\uac80\ud1a0|\uae30\uc900|\uc2dc\ud589)/;
const validateCanonicalDates = (node, itemId, pathParts = [], parentKey = '') => {
  if (Array.isArray(node)) {
    for (const [index, value] of node.entries()) {
      if (typeof value === 'string' && DATE_KEY_RE.test(parentKey) && FREE_FORM_DATE_RE.test(value)) fail(`free-form canonical date: ${itemId}.${[...pathParts,index].join('.')}`);
      else if (value && typeof value === 'object') validateCanonicalDates(value, itemId, [...pathParts,index], parentKey);
    }
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    if (key === 'legacy_compatibility_dates') continue;
    if (typeof value === 'string' && DATE_KEY_RE.test(key) && FREE_FORM_DATE_RE.test(value)) fail(`free-form canonical date: ${itemId}.${[...pathParts,key].join('.')}`);
    else if (value && typeof value === 'object') validateCanonicalDates(value, itemId, [...pathParts,key], key);
  }
};

function readKnowledge(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) readKnowledge(file);
    else if (entry.name.endsWith('.jsonl')) {
      for (const [index, line] of fs.readFileSync(file, 'utf8').split('\n').entries()) {
        if (!line.trim()) continue;
        try { records.push({ value: JSON.parse(line), file, line: index + 1 }); }
        catch { fail(`invalid JSONL: ${file}:${index + 1}`); }
      }
    } else if (entry.name.endsWith('.md')) {
      const text = fs.readFileSync(file, 'utf8');
      if (!text.startsWith('---\n')) continue;
      const end = text.indexOf('\n---\n', 4);
      if (end < 0) { fail(`invalid frontmatter: ${file}`); continue; }
      try {
        const value = JSON.parse(text.slice(4, end));
        if (value.id && !value.id.startsWith('folder.')) records.push({ value, file });
      } catch { fail(`invalid JSON frontmatter: ${file}`); }
    }
  }
}
readKnowledge(KNOWLEDGE);

const byId = new Map();
for (const record of records) {
  const item = record.value;
  if (!item.id || !item.title || !item.type) fail(`entity required fields: ${record.file}`);
  if (byId.has(item.id)) fail(`duplicate canonical id: ${item.id}`);
  byId.set(item.id, item);
  if (item.type === 'source') sources.push(item);
}
const sourceIds = new Set(sources.map(source => source.id));
const legacyValues = [...byId.values()].filter(item => !['deposit-offer', 'saving-offer', 'offer-option'].includes(item.type));
const instanceCount = new Map();
for (const { value: item } of records) for (const parent of item.parents || []) instanceCount.set(parent, (instanceCount.get(parent) || 0) + 1);
const decisionFields = ['criteria','eligibility','options','benefits','rates','interest_rates','limit','limits','amount','support_details','coverage','premium','application_deadline','application_open_from','application_open_to','term','period'];

for (const { value: item } of records) {
  validateCanonicalDates(item, item.id);
  for (const url of item.source_urls || []) if (!validUrl(url)) fail(`invalid source URL: ${item.id} ${url}`);
  for (const sourceId of item.sources || []) if (!sourceIds.has(sourceId)) fail(`unresolved source id: ${item.id} -> ${sourceId}`);
  const external = item.type !== 'source' && ((item.sources || []).length || (item.source_urls || []).length);
  if (external && !(item.provenance || []).length) fail(`missing provenance: ${item.id}`);
  if (external && !(item.source_basis_dates || []).length && !(item.source_modified_at || item.source_collected_at || item.last_verified_at)) fail(`missing basis date: ${item.id}`);
  const supported = new Set((item.provenance || []).flatMap(assertion => assertion.supported_fields || []));
  for (const assertion of item.provenance || []) {
    if (!sourceIds.has(assertion.source_id)) fail(`unresolved provenance source: ${item.id} -> ${assertion.source_id}`);
    if (!validUrl(assertion.original_url)) fail(`invalid provenance URL: ${item.id}`);
    if (!isIso(assertion.collected_at)) fail(`invalid provenance collected_at: ${item.id}`);
    if (!['verified','reference_only','listing_only','conflict','unverified'].includes(assertion.verification_status)) fail(`invalid provenance status: ${item.id}`);
    if (assertion.checksum && !/^sha256:[a-f0-9]{64}$/.test(assertion.checksum)) fail(`invalid provenance checksum: ${item.id}`);
  }
  for (const assertion of item.source_assertions || []) {
    if (!sourceIds.has(assertion.source_id)) fail(`unresolved legacy source assertion: ${item.id} -> ${assertion.source_id}`);
    if (assertion.original_url != null && !validUrl(assertion.original_url)) fail(`invalid legacy assertion URL: ${item.id}`);
  }
  // A stored checksum that no longer describes its record is a silent lie about
  // provenance. Recompute it the way the builder does and require agreement.
  if (item.record_checksum && sha256({...item, provenance: undefined, record_checksum: undefined}) !== item.record_checksum) fail(`stale record checksum: ${item.id}`);
  if (item.source_record_id != null) {
    if (!item.record_checksum) fail(`missing record checksum: ${item.id}`);
    if (!(item.provenance || []).some(assertion => assertion.source_record_id != null && assertion.checksum && isIso(assertion.collected_at))) fail(`incomplete collected provenance: ${item.id}`);
  }
  for (const field of decisionFields) if (item[field] != null && !supported.has(field)) fail(`missing field provenance: ${item.id}.${field}`);
  for (const criterion of item.criteria || []) {
    const references = [criterion.source, criterion.basis_source, criterion.source_id].filter(Boolean);
    if (!references.length) fail(`criteria without source: ${item.id}`);
    for (const reference of references) if (!sourceIds.has(reference) && !(item.provenance || []).some(assertion => assertion.source_id === reference)) fail(`criteria unresolved source: ${item.id} -> ${reference}`);
  }
}

// Every relation target must resolve to a canonical node. Without this the graph
// can accumulate edges into ids that no longer exist and still pass the gate.
for (const { value: item, file } of records) {
  for (const relation of RELATION_KEYS) {
    const values = Array.isArray(item[relation]) ? item[relation] : item[relation] == null ? [] : [item[relation]];
    for (const to of values) if (!byId.has(String(to))) fail(`unresolved relation target: ${item.id} -${relation}-> ${to}${file ? ` (${path.relative(ROOT, file)})` : ''}`);
  }
  // Only ontology roots and provenance nodes stand outside the hierarchy.
  // Everything else must be reachable from a classification node.
  if (!['domain','source','deposit-offer','saving-offer','offer-option'].includes(item.type) && !(item.parents || []).length) fail(`entity outside the hierarchy: ${item.id} (${item.type})`);
  // `parents` is authoritative; `children` is a curated convenience list that
  // high-volume categories deliberately leave empty. Only the curated direction
  // is checked, so a hand-written child list cannot drift from the real edge.
  for (const child of item.children || []) {
    const node = byId.get(String(child));
    if (node && !(node.parents || []).includes(item.id)) fail(`asymmetric hierarchy: ${item.id} lists child ${child} that does not claim it as a parent`);
  }
}

// Baselines are floors, not equalities: the gate must catch data loss without
// blocking curation. Cross-artifact agreement is asserted relationally below.
const BASELINE = BASELINE_CONTRACT.floors;
if (records.length < BASELINE.records) fail(`canonical records ${records.length} < ${BASELINE.records}`);
if (sources.length < BASELINE.sources) fail(`sources ${sources.length} < ${BASELINE.sources}`);
for (const source of sources) {
  if (!Array.isArray(source.terms)) fail(`source legacy terms must remain array: ${source.id}`);
  if (!source.publisher || !source.authority_class || !source.access?.method || !source.access?.parser_id || !source.refresh?.sla_hours || !source.refresh?.change_detection || !source.status) fail(`incomplete source contract: ${source.id}`);
  if (!validUrl(source.urls?.canonical)) fail(`source canonical URL missing: ${source.id}`);
  if (source.urls?.all != null && (!Array.isArray(source.urls.all) || source.urls.all.some(url => !validUrl(url)))) fail(`source URL registry invalid: ${source.id}`);
  if (!source.usage_terms?.license_or_terms || typeof source.usage_terms.raw_snapshot_allowed !== 'boolean') fail(`source terms missing: ${source.id}`);
}

const requiredLeaves = [
  '10-tax/taxes/national','10-tax/taxes/local','10-tax/taxes/corporate','10-tax/benefits/deductions','10-tax/benefits/tax-credits','10-tax/benefits/tax-reductions','10-tax/filing','10-tax/deadlines','10-tax/business-support',
  '20-public-support/central','20-public-support/local/_records/by-region','20-public-support/programs',
  '30-financial-products/cards/credit','30-financial-products/cards/check','30-financial-products/banking/deposits','30-financial-products/banking/savings','30-financial-products/banking/loans','30-financial-products/insurance','30-financial-products/retirement/pensions','30-financial-products/tax-advantaged-accounts','30-financial-products/protected-products',
  '40-financial-reference/terms','40-financial-reference/concepts','40-financial-reference/providers','40-financial-reference/benchmark-rates','40-financial-reference/risk-signals','40-financial-reference/rules/eligibility','40-financial-reference/rules/conflicts','40-financial-reference/required-documents','40-financial-reference/application-channels',
  '50-life-context/income','50-life-context/expenses','50-life-context/life-events','50-life-context/scenarios',
  '90-sources/laws','90-sources/government','90-sources/regulators','90-sources/associations','90-sources/financial-institutions','90-sources/secondary-sources',
];
for (const leaf of requiredLeaves) if (!fs.existsSync(path.join(KNOWLEDGE, leaf, '_index.md'))) fail(`missing semantic index: ${leaf}`);
for (const name of ['taxonomy','ontology','topology']) if (fs.existsSync(path.join(KNOWLEDGE, name))) fail(`forbidden concept folder: ${name}`);

// One taxonomy: every classification node declares the folder it classifies and
// physically lives there. A folder.* node would be a second, unlinked hierarchy.
for (const { value: item, file } of records) {
  if (!['category','domain'].includes(item.type)) continue;
  if (item.id.startsWith('folder.')) { fail(`parallel folder taxonomy reintroduced: ${item.id}`); continue; }
  if (!item.canonical_folder) { fail(`classification node without canonical_folder: ${item.id}`); continue; }
  const actual = path.relative(KNOWLEDGE, path.dirname(file));
  if (actual !== item.canonical_folder) fail(`classification node misplaced: ${item.id} declares ${item.canonical_folder} but lives in ${actual}`);
  // A class with no instances must say so. Silently empty categories make the
  // ontology look broader than the data it can actually answer from.
  const instances = instanceCount.get(item.id) || 0;
  const declared = item.population_status;
  if (!['populated','planned'].includes(declared)) fail(`classification node without population_status: ${item.id}`);
  else if (declared === 'populated' && instances === 0) fail(`category declared populated but has no instances: ${item.id}`);
  else if (declared === 'planned' && instances > 0) fail(`category declared planned but has ${instances} instances: ${item.id}`);
  else if (declared === 'planned' && !item.population_reason) fail(`planned category without population_reason: ${item.id}`);
}

const manifest = json(path.join(DOCS, 'finance-ontology-manifest.json'));
for (const key of ['source_registry','source_status','provenance_index','provenance_coverage','relationship_index']) {
  const entry = manifest[key];
  if (!entry?.path || !entry?.url || !entry?.generated_at || !entry?.export_checksum) { fail(`missing manifest entry: ${key}`); continue; }
  const payload = json(path.join(DOCS, path.basename(entry.path)));
  if (sha256(payload).slice(7) !== entry.export_checksum) fail(`artifact checksum mismatch: ${key}`);
}
if (!(manifest.quality_exports || []).some(entry => entry.id === 'openfin-provenance-coverage')) fail('provenance coverage missing from quality_exports');
if (JSON.stringify(manifest).includes('github.io/TaxMeter/opentax')) fail('legacy TaxMeter operational URL remains in manifest');

const registry = json(path.join(DOCS, 'openfin-source-registry-2026.json'));
if (registry.sources?.length !== sources.length || new Set(registry.sources?.map(source => source.id)).size !== sources.length) fail(`source registry is not ${sources.length} unique sources`);
const registryById = new Map((registry.sources || []).map(source => [source.id, source]));
for (const requirement of manifest.api_required_sources || []) {
  const source = registryById.get(requirement.source_id);
  if (!source || source.access?.method !== 'api' || source.access?.requires_secret !== true || !source.access?.parser_id) fail(`API source contract missing: ${requirement.source_id}`);
}
const sourceStatuses = json(path.join(DOCS, 'openfin-source-status-2026.json'));
const statusEnums = new Set(['unchanged','changed','stale','unreachable','retired','conflict']);
if (sourceStatuses.statuses?.length !== sources.length) fail('source status count mismatch');
for (const status of sourceStatuses.statuses || []) {
  if (!sourceIds.has(status.id) || !statusEnums.has(status.status)) fail(`invalid source status: ${status.id}`);
  if (status.freshness_status === 'active') fail(`lifecycle leaked into freshness: ${status.id}`);
  if (status.status === 'changed' && (status.freshness_status === 'current' || status.verification_status === 'verified' || status.stale !== true || status.needs_review !== true)) fail(`changed source auto-promoted: ${status.id}`);
  if (registryById.get(status.id)?.access?.requires_secret === true && status.verification_status !== 'secret-required' && status.authenticated !== true) fail(`secret source not fail-closed: ${status.id}`);
}
const coverage = json(path.join(DOCS, 'openfin-provenance-coverage-report-2026.json'));
if (coverage.external_provenance_coverage_ratio !== 1 || coverage.invalid_legacy_url_count !== 0) fail('provenance coverage gate failed');
const canonicalQuality = manifest.domain_readiness || {};
const qualityReportChecks = [
  ['openfin-verification-coverage-report-2026.json', 'strict_field_verified_candidate_count'],
  ['openfin-comparison-regression-report-2026.json', 'strict_field_verified_candidate_count'],
  ['openfin-recommendation-safety-report-2026.json', 'strict_field_verified_candidate_count'],
];
for (const [name, key] of qualityReportChecks) {
  const report = json(path.join(DOCS, name));
  const expected = Object.values(canonicalQuality).reduce((sum, state) => sum + Number(state.field_verified_candidate_count || 0), 0);
  if (report.canonical_quality_source !== 'finance-ontology-manifest.domain_readiness' || Number(report[key] || 0) !== expected) fail(`quality report projection mismatch: ${name}`);
}
const comparisonReport = json(path.join(DOCS, 'openfin-comparison-regression-report-2026.json'));
const recommendationReport = json(path.join(DOCS, 'openfin-recommendation-safety-report-2026.json'));
const publicComparisonCount = Object.values(canonicalQuality).reduce((sum, state) => sum + Number(state.public_comparison_candidate_count || 0), 0);
const publicRecommendationCount = Object.values(canonicalQuality).reduce((sum, state) => sum + Number(state.public_recommendation_candidate_count || 0), 0);
if (Number(comparisonReport.public_comparison_candidate_count || 0) !== publicComparisonCount || Number(recommendationReport.public_recommendation_candidate_count || 0) !== publicRecommendationCount) fail('public quality report projection mismatch');
if (manifest.openfin_120_live_regression?.passed_count === manifest.openfin_120_live_regression?.test_count && manifest.openfin_120_live_regression?.failed_count === 0 && (manifest.openfin_120_live_regression?.validation_status === 'current' || manifest.openfin_120_live_regression?.status === 'current') && (manifest.recommendation_blocking_reasons || []).some(reason => String(reason) === 'LIVE_REGRESSION_NOT_READY')) fail('current live evidence cannot retain LIVE_REGRESSION_NOT_READY blocker');

const minimumCounts = BASELINE_CONTRACT.exports;
let publicRows = 0; let referenceRows = 0; const publicOwnerIds = new Set(); const publicReferenceIds = [];
for (const [file, minimum] of Object.entries(minimumCounts)) {
  const payload = json(path.join(DOCS, file));
  const count = (payload.items || []).length + (payload.reference_items || []).length;
  if (count < minimum) fail(`export lost rows: ${file} ${count} < ${minimum}`);
  if (payload.export_checksum !== sha256({items:payload.items || [], reference_items:payload.reference_items || []}).slice(7)) fail(`export checksum mismatch: ${file}`);
  publicRows += count; referenceRows += (payload.reference_items || []).length;
  for (const item of payload.items || []) { if (publicOwnerIds.has(item.id)) fail(`multiple public owners: ${item.id}`); publicOwnerIds.add(item.id); }
  for (const item of payload.reference_items || []) publicReferenceIds.push(item.id);
}
if (publicRows < BASELINE.public_rows || publicOwnerIds.size < BASELINE.records || referenceRows < BASELINE.reference_items) fail(`public compatibility rows lost: rows=${publicRows} owners=${publicOwnerIds.size} refs=${referenceRows}`);
if (publicOwnerIds.size !== legacyValues.length) fail(`public owners ${publicOwnerIds.size} != legacy canonical records ${legacyValues.length}`);
if (publicRows !== publicOwnerIds.size + referenceRows) fail(`public row accounting invalid: ${publicRows} != ${publicOwnerIds.size} + ${referenceRows}`);
for (const id of publicReferenceIds) if (!publicOwnerIds.has(id)) fail(`reference item without owner: ${id}`);

const search = json(path.join(DOCS, 'finance-search-index-2026.json'));
const derivedQuality = deriveQuality(legacyValues, { sourceCount: sources.length, exportCount: (manifest.exports || []).length, searchItemCount: search.item_count, relationshipCount: manifest.relationship_index?.item_count || 0, invalidUrlCount: coverage.invalid_legacy_url_count, sourceStatusLoaded: sourceStatuses.statuses?.length === sources.length });
if (search.item_count !== legacyValues.length || search.canonical_product_count !== derivedQuality.canonical.canonical_product_count) fail(`search index counts changed: ${search.item_count}/${search.canonical_product_count} vs ${legacyValues.length}/${derivedQuality.canonical.canonical_product_count}`);
if (manifest.release_status !== derivedQuality.release_status || manifest.recommendation_enabled !== derivedQuality.recommendation_enabled) fail('manifest release gate does not match derived quality policy');
if (JSON.stringify(manifest.blocking_reasons || []) !== JSON.stringify(derivedQuality.blocking_reasons)) fail('manifest blocking reasons do not match derived quality policy');
const liveEvidence = manifest.openfin_120_live_regression || {};
const liveProjections = (payload, source) => {
  const projections = [];
  if (payload && typeof payload === 'object') {
    if ('live_status' in payload || 'live_case_count' in payload || 'live_evidence_generation_id' in payload) projections.push([payload, source]);
    if (payload.live_summary && typeof payload.live_summary === 'object') projections.push([payload.live_summary, `${source}.live_summary`]);
    if (payload.openfin_120_live_regression && typeof payload.openfin_120_live_regression === 'object') projections.push([payload.openfin_120_live_regression, `${source}.openfin_120_live_regression`]);
    if (payload.live_regression && typeof payload.live_regression === 'object') projections.push([payload.live_regression, `${source}.live_regression`]);
  }
  return projections;
};
for (const entry of manifest.quality_exports || []) {
  const file = path.join(DOCS, path.basename(entry.path || ''));
  if (!fs.existsSync(file)) continue;
  for (const [projection, source] of liveProjections(json(file), file)) {
    const status = projection.live_status ?? projection.validation_status ?? projection.status ?? null;
    const count = projection.live_case_count ?? projection.test_count ?? null;
    const passed = projection.live_passed_count ?? projection.passed_count ?? null;
    const failed = projection.live_failed_count ?? projection.failed_count ?? null;
    const generation = projection.live_evidence_generation_id ?? projection.generation_id ?? null;
    if (status !== (liveEvidence.validation_status ?? liveEvidence.status ?? null) || count !== (liveEvidence.test_count ?? null) || passed !== (liveEvidence.passed_count ?? null) || failed !== (liveEvidence.failed_count ?? null) || generation !== (liveEvidence.generation_id ?? null)) fail(`live evidence projection mismatch: ${source}`);
  }
}
if (!Array.isArray(search.items) || search.items.length !== search.item_count || search.compact_item_count !== search.item_count) fail('compact search root missing or incomplete');
if (search.export_checksum !== sha256(JSON.stringify(search.items)).slice(7)) fail('compact search root checksum mismatch');
if (search.content_checksum && search.content_checksum !== sha256(fs.readFileSync(path.join(DOCS, 'finance-search-index-2026.json'), 'utf8')).slice(7)) fail('compact search root content checksum mismatch');
if ((search.shards || []).reduce((sum, shard) => sum + (shard.item_count || 0), 0) !== search.item_count) fail('search shard counts do not sum to the search root');
for (const item of search.items || []) {
  if (!Array.isArray(item.source_ids)) fail(`compact search source ids missing: ${item.id}`);
  for (const sourceId of item.source_ids || []) if (!sourceIds.has(sourceId)) fail(`compact search source id unresolved: ${item.id} -> ${sourceId}`);
  if (typeof item.provenance_shard !== 'string') fail(`compact search detail shard missing: ${item.id}`);
}
for (const shard of search.shards || []) {
  const shardPath = path.join(DOCS, path.basename(shard.path));
  const shardText = fs.readFileSync(shardPath, 'utf8');
  if (shard.content_checksum && shard.content_checksum !== sha256(shardText).slice(7)) fail(`search shard content checksum mismatch: ${shard.shard_id}`);
  const payload = JSON.parse(shardText);
  for (const item of payload.items || []) {
    if (!Array.isArray(item.source_ids)) fail(`search source ids missing: ${item.id}`);
    for (const sourceId of item.source_ids || []) if (!sourceIds.has(sourceId)) fail(`search source id unresolved: ${item.id} -> ${sourceId}`);
  }
}
const provenanceIndex = json(path.join(DOCS, 'openfin-provenance-index-2026.json'));
if (provenanceIndex.covered_item_count < BASELINE.provenance_covered || !(provenanceIndex.shards || []).length) fail('provenance index coverage/shards invalid');
for (const shard of provenanceIndex.shards || []) {
  const payload = json(path.join(DOCS, path.basename(shard.path)));
  if (payload.item_count !== payload.items.length || sha256(payload).slice(7) !== shard.export_checksum) fail(`provenance shard invalid: ${shard.shard_id}`);
}

const schemaCheck = spawnSync(process.execPath, [path.join(ROOT, 'scripts/knowledge/schema-validate.mjs')], { cwd: ROOT, encoding: 'utf8', maxBuffer: 10_000_000 });
if (schemaCheck.status !== 0) fail(`JSON Schema contract failed: ${schemaCheck.stdout || schemaCheck.stderr}`);

for (const root of [KNOWLEDGE, DOCS, path.join(ROOT, 'evidence')]) {
  const walkSizes = dir => { if(!fs.existsSync(dir)) return; for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walkSizes(file);else if(fs.statSync(file).size>=100_000_000)fail(`file exceeds 100MB: ${file}`);} };
  walkSizes(root);
}

const result = { ok: failures.length === 0, records: records.length, sources: sources.length, public_rows: publicRows, reference_items: referenceRows, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;

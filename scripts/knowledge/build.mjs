import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DOCS, KNOWLEDGE, PUBLIC_BASE, RELATION_KEYS, json, writeJson, stable, sha256, publicProjection, restoreCompatibilityDates, validUrl, isoDate } from './common.mjs';
import { deriveQuality, readReleasePolicy } from './derive-quality.mjs';

const loadCanonical = () => {
  const records = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.jsonl')) for (const line of fs.readFileSync(p,'utf8').split('\n').filter(Boolean)) records.push(JSON.parse(line));
      else if (entry.name.endsWith('.md')) {
        const text = fs.readFileSync(p,'utf8'); if (!text.startsWith('---\n')) continue;
        const end = text.indexOf('\n---\n', 4); if (end < 0) continue;
        try {
          const value = JSON.parse(text.slice(4,end));
          if (value?.id) records.push(value);
        } catch (error) {
          throw new Error(`Failed to parse canonical Markdown frontmatter in ${p}: ${error.message}`, { cause: error });
        }
      }
    }
  };
  walk(KNOWLEDGE);
  const dedup = new Map(); for (const record of records) if (!dedup.has(record.id)) dedup.set(record.id, record);
  return [...dedup.values()].filter(record => !record.id.startsWith('folder.')).sort((a,b)=>a.id.localeCompare(b.id));
};
const catalog = loadCanonical();
const manifests = json(path.join(KNOWLEDGE,'export-manifests.json'));
const baselineContract = json(path.join(ROOT, 'contracts/data-baseline.json'));
const byId = new Map(catalog.map(item => [item.id, item]));
// Build metadata is deterministic and describes the latest collected/reviewed
// snapshot. Future effective dates in a product contract are not build times.
const sourceSnapshotDates = catalog.flatMap(item => [item.source_collected_at, item.last_verified_at, item.reviewed_at]).map(value => isoDate(value)).filter(Boolean).sort();
const now = process.env.OPENFIN_BUILD_AT || sourceSnapshotDates.at(-1) || 'unknown';
const artifactEntry = (id, domain, file, payload, itemCount, extra = {}) => ({id, domain, path:`opentax/${file}`, url:`${PUBLIC_BASE}/${file}`, web_url:`${PUBLIC_BASE}/${file}`, item_count:itemCount, generated_at:now, export_checksum:sha256(payload).slice(7), ...extra});
const writeCompact = (file, payload) => { fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, JSON.stringify(payload) + '\n'); };
const legacyFiles = Object.keys(manifests).sort();
const exportIdToFile = new Map(legacyFiles.map(file => [manifests[file].root.id, file]));
const ownerFileById = new Map(catalog.map(item => {
  const memberships = item.publication_memberships || [];
  const searchOwner = exportIdToFile.get(item.search_projection?.export_id);
  return [item.id, searchOwner && memberships.includes(searchOwner) ? searchOwner : memberships[0]];
}));
const generatedExports = {};
for (const file of legacyFiles) {
  const meta = manifests[file];
  const items = []; const referenceItems = [];
  for (const id of meta.item_ids) {
    const item = byId.get(id); if (!item) continue;
    (ownerFileById.get(id) === file ? items : referenceItems).push(publicProjection(item));
  }
  const {export_checksum:_oldChecksum, reference_items:_oldReferences, ...root} = meta.root;
  const output = {...root, item_count:items.length + referenceItems.length, reference_item_count:referenceItems.length, items};
  if (referenceItems.length) output.reference_items = referenceItems;
  output.export_checksum = sha256({items, reference_items:referenceItems}).slice(7);
  generatedExports[file] = output;
  writeJson(path.join(DOCS,file), output);
}
const searchFiles = fs.existsSync(path.join(KNOWLEDGE,'search-shards.json')) ? json(path.join(KNOWLEDGE,'search-shards.json')) : {};
const shardOutputs = [];
for (const [file, meta] of Object.entries(searchFiles).sort(([a],[b])=>a.localeCompare(b))) {
  const items = catalog.filter(i => i.search_shard === meta.shard_id).sort((a,b)=>(a.search_position ?? 0)-(b.search_position ?? 0)).map(i=>i.search_projection ? {
    ...restoreCompatibilityDates(i).search_projection,
    source_ids:[...new Set(i.sources || [])],
    provenance_shard:i.search_shard,
  } : null).filter(Boolean);
  // Search shards are verified over their JSON array payload. The search
  // index is a hot path in the Worker, so avoid recursively sorting every
  // object key at request time while keeping the emitted ordering stable.
  const output = {version:meta.version, basis_date:meta.basis_date, source_review_date:meta.source_review_date, ontology_kind:meta.ontology_kind, shard_id:meta.shard_id, item_count:items.length, items, export_checksum:sha256(JSON.stringify(items)).slice(7)};
  const outFile = file;
  const outPath = path.join(DOCS,outFile);
  writeJson(outPath, output);
  const content_checksum = sha256(fs.readFileSync(outPath, 'utf8')).slice(7);
  shardOutputs.push({id:`finance-search-index-${meta.shard_id}`, shard_id:meta.shard_id, path:`opentax/${outFile}`, url:`${PUBLIC_BASE}/${outFile}`, web_url:`${PUBLIC_BASE}/${outFile}`, item_count:items.length, export_checksum:output.export_checksum, content_checksum});
}
// Include any search shard not captured by the bootstrap metadata (e.g. empty pension shard).
const knownShardIds = new Set(shardOutputs.map(x=>x.shard_id));
for (const file of fs.readdirSync(DOCS).filter(f=>/^finance-search-index-2026-.+\.json$/.test(f)).sort()) {
  const data = json(path.join(DOCS,file)); if (knownShardIds.has(data.shard_id)) continue;
  const output = {version:data.version, basis_date:data.basis_date, source_review_date:data.source_review_date, ontology_kind:data.ontology_kind, shard_id:data.shard_id, item_count:0, items:[], export_checksum:sha256(JSON.stringify([])).slice(7)};
  const outPath = path.join(DOCS,file);
  writeJson(outPath, output);
  const content_checksum = sha256(fs.readFileSync(outPath, 'utf8')).slice(7);
  shardOutputs.push({id:`finance-search-index-${data.shard_id}`, shard_id:data.shard_id, path:`opentax/${file}`, url:`${PUBLIC_BASE}/${file}`, web_url:`${PUBLIC_BASE}/${file}`, item_count:0, export_checksum:output.export_checksum, content_checksum});
}
const allSearchItems = shardOutputs.flatMap(s => json(path.join(DOCS, path.basename(s.path))).items);
const compactSearchFields = [
  'id', 'title', 'type', 'description', 'search_text',
  'provider', 'product_kind', 'search_type', 'product_status', 'sales_status',
  'source_listing_status', 'sales_verification_status', 'sales_verified_at',
  'source_freshness_status', 'status', 'recommendation_status', 'recommendation_scope',
  'canonical_product_id', 'resolved_canonical_product_id',
  'application_status', 'is_currently_applicable', 'application_open_to',
  'jurisdiction', 'jurisdiction_code', 'jurisdiction_aliases', 'parent_jurisdiction_code',
  'target_group', 'support_category', 'freshness_status', 'last_verified_at',
  'last_source_checked_at', 'last_reviewed_at',
  'search_aliases', 'aliases', 'source_ids',
  'provenance_shard', 'export_id',
];
const hasCompactValue = value => value !== undefined && value !== null && value !== ''
  && (!Array.isArray(value) || value.length > 0)
  && (!(value && typeof value === 'object' && !Array.isArray(value)) || Object.keys(value).length > 0);
const compactSearchItems = allSearchItems.map(item => {
  const compact = Object.fromEntries(compactSearchFields.filter(field => hasCompactValue(item[field])).map(field => [field, item[field]]));
  // Keep the field present even for source nodes, whose dependency set is
  // intentionally empty. MCP source-health enrichment treats this as the
  // canonical, bounded dependency list.
  compact.source_ids = Array.isArray(item.source_ids) ? item.source_ids : [];
  // Preserve legacy/source-record lookup without carrying the much larger
  // source_records objects in the Worker search root.
  const lookupAliases = [...new Set([
    ...(item.legacy_ids || []),
    ...(item.source_records || []).flatMap(record => [record?.id, record?.source_record_id]),
    ...(item.external_product_ids || []).map(identifier => identifier?.value),
  ].filter(value => typeof value === 'string' && value))].sort();
  if (lookupAliases.length) compact.legacy_ids = lookupAliases;
  return compact;
});
const searchRoot = fs.existsSync(path.join(KNOWLEDGE,'search-manifest.json')) ? json(path.join(KNOWLEDGE,'search-manifest.json')) : {version:'KR-FINANCE-SEARCH-INDEX-2026.07.18.1', basis_date:'2026-07-10', source_review_date:'2026-07-10', ontology_kind:'finance-search-index', description:'MCP search가 대용량 원본 export를 모두 적재하지 않고 검색할 수 있도록 만든 경량 인덱스입니다.'};
const productNodes = catalog.filter(item => ['account-product','bank-product','card-product','financial-product','insurance-product'].includes(item.type));
const canonicalProductIds = new Set(productNodes.map(item => item.canonical_product_id || item.id));
const canonicalMergeCount = catalog.filter(item => (item.publication_memberships || []).length > 1).length;
const searchManifest = {...searchRoot, item_count:allSearchItems.length, compact_item_count:compactSearchItems.length, canonical_product_count:canonicalProductIds.size, duplicate_canonical_product_count:productNodes.length - canonicalProductIds.size, canonical_merge_count:canonicalMergeCount, export_checksum:sha256(JSON.stringify(compactSearchItems)).slice(7), detail_checksum:sha256(JSON.stringify(allSearchItems)).slice(7), shards:shardOutputs, items:compactSearchItems};
const searchRootPath = path.join(DOCS,'finance-search-index-2026.json');
writeCompact(searchRootPath, searchManifest);
const searchContentChecksum = sha256(fs.readFileSync(searchRootPath, 'utf8')).slice(7);
const sourceRows = catalog.filter(i=>i.type==='source').sort((a,b)=>a.id.localeCompare(b.id));
const sourceRegistry = sourceRows.map(source => {
  const urls = [...new Set([source.urls?.canonical, source.urls?.api, source.urls?.documentation, ...(source.urls?.all || []), ...(source.source_urls || [])].filter(validUrl))];
  if (!source.publisher || !source.authority_class) throw new Error(`Source ${source.id} is missing explicit publisher or authority_class`);
  return {id:source.id, type:'source', title:source.title, publisher:source.publisher, authority_class:source.authority_class, domains:source.domains || [], urls:{canonical:validUrl(source.urls?.canonical) || urls[0] || null, api:validUrl(source.urls?.api), documentation:validUrl(source.urls?.documentation), all:urls}, access:source.access || {method:'web', parser_id:null, requires_secret:false}, refresh:source.refresh || {sla_hours:168, change_detection:'http-checksum'}, usage_terms:{license_or_terms:source.usage_terms?.license_or_terms || '이용조건 미확인 - 원문 이용약관 검토 필요', terms_status:source.usage_terms?.terms_status || 'review_required', raw_snapshot_allowed:source.usage_terms?.raw_snapshot_allowed === true}, recommendation_eligible:false, status:source.status || 'active', legacy_source_basis_dates:source.source_basis_dates||[], source_row_count:source.publication_memberships?.length||0};
});
const sourceRegistryArtifact = {version:'OPENFIN-SOURCE-REGISTRY-2026.07.28.1', generated_at:now, source_count:sourceRegistry.length, sources:sourceRegistry};
writeJson(path.join(DOCS,'openfin-source-registry-2026.json'), sourceRegistryArtifact);
const receiptRows = [];
const receiptRoot = path.join(ROOT, 'evidence/source-receipts');
if (fs.existsSync(receiptRoot)) {
  const walkReceipts = dir => { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) { const file=path.join(dir,entry.name); if(entry.isDirectory()) walkReceipts(file); else if(entry.name.endsWith('.jsonl')) for(const line of fs.readFileSync(file,'utf8').split('\n').filter(Boolean)) receiptRows.push(JSON.parse(line)); } };
  walkReceipts(receiptRoot);
}
const latestReceiptById = new Map();
const acceptedReceiptById = new Map();
for (const receipt of receiptRows.sort((a,b)=>String(a.checked_at||'').localeCompare(String(b.checked_at||'')))) {
  const id = receipt.source_id || receipt.id;
  latestReceiptById.set(id, receipt);
  if (receipt.status === 'unchanged' && receipt.needs_live_check !== true) acceptedReceiptById.set(id, receipt);
}
const statuses = sourceRegistry.map(source => {
  const receipt = latestReceiptById.get(source.id) || {};
  const accepted = acceptedReceiptById.get(source.id) || {};
  const {source_id:_sourceId, ...receiptFields} = receipt;
  const secretBlocked = source.access?.requires_secret === true && receipt.authenticated !== true;
  const status = secretBlocked ? 'stale' : receipt.status || 'stale';
  const successful = status === 'unchanged' && !receipt.needs_live_check;
  const changedObservation = ['changed', 'conflict'].includes(status);
  const acceptedChecksum = accepted.checksum || null;
  const acceptedEtag = accepted.etag || null;
  const acceptedLastModified = accepted.last_modified || null;
  return {
    ...receiptFields,
    ...(changedObservation ? {
      checksum: acceptedChecksum,
      etag: acceptedEtag,
      last_modified: acceptedLastModified,
      observed_checksum: receipt.observed_checksum || receipt.checksum || null,
      observed_etag: receipt.observed_etag || receipt.etag || null,
      observed_last_modified: receipt.observed_last_modified || receipt.last_modified || null,
      needs_review: true,
      change_detected: true,
    } : {}),
    id:source.id,
    lifecycle_status:source.status,
    status,
    checked_at:receipt.checked_at || now,
    last_successful_checked_at:secretBlocked
      ? null
      : successful
      ? receipt.checked_at
      : changedObservation
        ? accepted.checked_at || accepted.last_successful_checked_at || null
        : receipt.last_successful_checked_at || accepted.checked_at || null,
    freshness_status:successful ? 'current' : (changedObservation ? 'stale' : status),
    refresh:source.refresh,
    urls:source.urls,
    stale:!successful,
    verification_status:secretBlocked
      ? 'secret-required'
      : status === 'changed'
      ? 'change-detected'
      : status === 'conflict'
        ? 'checksum-validator-conflict'
        : receipt.verification_status || 'baseline_reference',
    needs_live_check:secretBlocked || changedObservation ? true : receipt.needs_live_check !== false,
  };
});
const sourceStatusArtifact = {version:'OPENFIN-SOURCE-STATUS-2026.07.28.1', generated_at:now, source_count:statuses.length, statuses};
writeJson(path.join(DOCS,'openfin-source-status-2026.json'), sourceStatusArtifact);
const provenanceRows = catalog.filter(i=>Array.isArray(i.provenance)&&i.provenance.length).sort((a,b)=>a.id.localeCompare(b.id)).map(i=>({id:i.id, record_checksum:i.record_checksum, provenance:i.provenance}));
const provenanceGroups = new Map();
for (const row of provenanceRows) { const shardId = byId.get(row.id)?.search_shard || 'reference'; if(!provenanceGroups.has(shardId)) provenanceGroups.set(shardId,[]); provenanceGroups.get(shardId).push(row); }
const provenanceShards = [];
for (const [shardId, rows] of [...provenanceGroups].sort(([a],[b])=>a.localeCompare(b))) {
  const file = `openfin-provenance-index-2026-${shardId}.json`;
  const payload = {version:'OPENFIN-PROVENANCE-INDEX-2026.07.28.1', generated_at:now, shard_id:shardId, item_count:rows.length, items:rows};
  writeCompact(path.join(DOCS,file), payload);
  provenanceShards.push(artifactEntry(`openfin-provenance-${shardId}`,'provenance',file,payload,rows.length,{shard_id:shardId}));
}
const provenanceArtifact = {version:'OPENFIN-PROVENANCE-INDEX-2026.07.28.1', generated_at:now, item_count:catalog.length, covered_item_count:provenanceRows.length, shards:provenanceShards};
writeJson(path.join(DOCS,'openfin-provenance-index-2026.json'), provenanceArtifact);
const externalItems = catalog.filter(i=>i.type !== 'source' && ((i.sources||[]).length || (i.source_urls||[]).length));
const covered = catalog.filter(i=>Array.isArray(i.provenance)&&i.provenance.length).length;
const collected = catalog.filter(i=>i.source_record_id!=null).length;
const checksummed = catalog.filter(i=>i.provenance?.some(p=>p.checksum)).length;
const invalidUrls = catalog.flatMap(i=>i.source_urls||[]).filter(v=>!validUrl(v));
const sourceById = new Map(sourceRegistry.map(source => [source.id, source]));
const officialExternal = externalItems.filter(item => (item.sources || []).some(id => ['law_official', 'government_official', 'regulator_official', 'association_official', 'provider_official'].includes(sourceById.get(id)?.authority_class)));
const assertionConflicts = catalog.reduce((count, item) => count + (item.source_assertions || []).filter(assertion => assertion.conflict === true || assertion.verification_status === 'conflict').length, 0);
const freshnessCurrent = statuses.filter(status => status.freshness_status === 'current').length;
const salesCurrent = productNodes.filter(item => item.sales_verification_status === 'verified_active' && item.freshness_status === 'current').length;
const provenanceCoverageArtifact = {version:'OPENFIN-PROVENANCE-COVERAGE-2026.07.28.1', generated_at:now, item_count:catalog.length, external_item_count:externalItems.length, provenance_covered_count:covered, external_provenance_covered_count:externalItems.filter(i=>i.provenance?.length).length, external_provenance_coverage_ratio:externalItems.length?externalItems.filter(i=>i.provenance?.length).length/externalItems.length:1, official_primary_source_ratio:externalItems.length?officialExternal.length/externalItems.length:1, source_registry_count:catalog.filter(i=>i.type==='source').length, collected_record_count:collected, deterministic_checksum_count:checksummed, freshness_sla_coverage_ratio:statuses.length?freshnessCurrent/statuses.length:1, sales_status_current_ratio:productNodes.length?salesCurrent/productNodes.length:1, unresolved_assertion_conflict_count:assertionConflicts, invalid_legacy_url_count:invalidUrls.length, invalid_legacy_urls:[...new Set(invalidUrls)].sort(), recommendation_enabled:null, status:'unknown'};
writeJson(path.join(DOCS,'openfin-provenance-coverage-report-2026.json'), provenanceCoverageArtifact);
const relations=[];
for(const item of catalog){for(const relation of RELATION_KEYS){const values = Array.isArray(item[relation]) ? item[relation] : item[relation] == null ? [] : [item[relation]]; for(const to of values){relations.push({from:item.id,relation,to:String(to)})}}}
relations.sort((a,b)=>a.from.localeCompare(b.from)||a.relation.localeCompare(b.relation)||a.to.localeCompare(b.to));
const relationshipArtifact = {version:'OPENFIN-RELATIONSHIP-INDEX-2026.07.28.1', generated_at:now, node_count:catalog.length, edge_count:relations.length, relations};
writeCompact(path.join(DOCS,'openfin-relationship-index-2026.json'), relationshipArtifact);
const referenceItemCount = Object.values(generatedExports).reduce((sum, value)=>sum+(value.reference_items?.length||0),0);
const migrationArtifact = {version:'OPENFIN-MIGRATION-2026.07.28.1', generated_at:now, baseline:{export_count:Object.keys(baselineContract.exports).length,row_count:baselineContract.floors.public_rows,unique_id_count:baselineContract.floors.records,source_row_count:baselineContract.migration_baseline.source_rows,unique_source_count:baselineContract.floors.sources,invalid_source_url_count:baselineContract.migration_baseline.invalid_source_url_count,contract_version:baselineContract.version},result:{export_count:legacyFiles.length,row_count:Object.values(generatedExports).reduce((sum,value)=>sum+value.items.length+(value.reference_items?.length||0),0),unique_id_count:catalog.length,unique_source_count:sourceRegistry.length,reference_item_count:referenceItemCount,invalid_source_url_count:invalidUrls.length},approved_changes:['invalid_source_url_values_removed','source_rows_canonicalized','cross_export_duplicates_moved_to_reference_items','structured_provenance_added','operational_urls_moved_to_openfin'],source_basis_conflict_resolutions:[{id:'source.kinfa.hessal-loan-youth',selected_basis_date:'2026-07-03'},{id:'source.kinfa.illegal-private-finance-prevention-loan',selected_basis_date:'2026-07-03'}],invariants:{full_live_regression_required:'120/120'}};
writeJson(path.join(DOCS,'openfin-migration-manifest-2026.json'), migrationArtifact);
const manifest = json(path.join(DOCS,'finance-ontology-manifest.json'));
manifest.built_at=now; manifest.operational_base_url=PUBLIC_BASE; manifest.artifacts={...(manifest.artifacts||{})};
const artifactEntries={source_registry:artifactEntry('openfin-source-registry','sources','openfin-source-registry-2026.json',sourceRegistryArtifact,sourceRegistry.length),source_status:artifactEntry('openfin-source-status','sources','openfin-source-status-2026.json',sourceStatusArtifact,statuses.length),provenance_index:artifactEntry('openfin-provenance-index','provenance','openfin-provenance-index-2026.json',provenanceArtifact,provenanceRows.length,{shards:provenanceShards}),provenance_coverage:artifactEntry('openfin-provenance-coverage','quality','openfin-provenance-coverage-report-2026.json',provenanceCoverageArtifact,1,{coverage:{external_provenance_coverage_ratio:provenanceCoverageArtifact.external_provenance_coverage_ratio,status:provenanceCoverageArtifact.status}}),relationship_index:artifactEntry('openfin-relationship-index','relations','openfin-relationship-index-2026.json',relationshipArtifact,relations.length),migration_manifest:artifactEntry('openfin-migration-manifest','quality','openfin-migration-manifest-2026.json',migrationArtifact,1)};
Object.assign(manifest, artifactEntries); Object.assign(manifest.artifacts, artifactEntries);
manifest.quality_exports = [...(manifest.quality_exports || []).filter(entry => entry.id !== 'openfin-provenance-coverage'), {id:'openfin-provenance-coverage', domain:'quality', ...artifactEntries.provenance_coverage, description:'Canonical provenance coverage and source URL validation report.'}]
  .map(entry => entry.path ? {...entry, path:`opentax/${path.basename(entry.path)}`} : entry);
for(const m of manifest.exports||[]) { const file=path.basename(m.path||m.url||''); const generated=generatedExports[file]; if(m.url) m.url=`${PUBLIC_BASE}/${file}`; if(m.web_url) m.web_url=`${PUBLIC_BASE}/${file}`; if(m.path) m.path=`opentax/${file}`; if(generated){m.item_count=generated.items.length+(generated.reference_items?.length||0);m.reference_item_count=generated.reference_items?.length||0;m.export_checksum=generated.export_checksum;} }
const deploymentCommit = process.env.OPENFIN_DEPLOYMENT_COMMIT || process.env.GITHUB_SHA || 'unknown';
const evaluationAsOf = process.env.OPENFIN_EVALUATION_AS_OF || now;
const quality = deriveQuality(catalog, { sourceCount: sourceRegistry.length, exportCount: legacyFiles.length, searchItemCount: allSearchItems.length, relationshipCount: relations.length, invalidUrlCount: invalidUrls.length, sourceStatusLoaded: statuses.length === sourceRegistry.length, sourceStatusChecksum: sourceStatusArtifact ? sha256(sourceStatusArtifact).slice(7) : null, searchIndexChecksum: searchManifest.export_checksum, deploymentCommit, evaluationAsOf });
provenanceCoverageArtifact.status = quality.release_status;
provenanceCoverageArtifact.recommendation_enabled = quality.recommendation_enabled;
provenanceCoverageArtifact.field_verification_coverage = Object.fromEntries(Object.entries(quality.domains).map(([domain, state]) => [domain, {
  schema_defined: state.schema_defined,
  required_field_total: state.required_field_total,
  value_complete_field_count: state.value_complete_field_count,
  field_verified_count: state.field_verified_count,
  value_field_coverage: state.value_field_coverage,
  field_verification_coverage: state.field_verification_coverage,
  value_complete_candidate_count: state.value_complete_candidate_count,
  field_verified_candidate_count: state.field_verified_candidate_count,
  ratio: state.schema_defined && state.item_count ? state.field_verified_candidate_count / state.item_count : null,
}]));
writeJson(path.join(DOCS,'openfin-provenance-coverage-report-2026.json'), provenanceCoverageArtifact);
artifactEntries.provenance_coverage = artifactEntry('openfin-provenance-coverage','quality','openfin-provenance-coverage-report-2026.json',provenanceCoverageArtifact,1,{coverage:{external_provenance_coverage_ratio:provenanceCoverageArtifact.external_provenance_coverage_ratio,status:provenanceCoverageArtifact.status}});
manifest.provenance_coverage = artifactEntries.provenance_coverage;
manifest.artifacts.provenance_coverage = artifactEntries.provenance_coverage;
for (const entry of manifest.quality_exports || []) if (entry.id === 'openfin-provenance-coverage') Object.assign(entry, artifactEntries.provenance_coverage);
// Legacy quality exports remain addressable, but their live counters must be
// projections of the one current evidence file rather than stale snapshots.
const rewriteLiveEvidence = (value) => {
  if (Array.isArray(value)) return value.map(rewriteLiveEvidence);
  if (!value || typeof value !== 'object') return value;
  const output = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewriteLiveEvidence(child)]));
  const live = quality.live_regression;
  if ('live_case_count' in output || 'live_passed_count' in output || 'live_failed_count' in output || 'live_failure_count' in output) {
    output.live_case_count = live.test_count;
    output.live_passed_count = live.passed_count;
    output.live_failed_count = live.failed_count;
    output.live_failure_count = live.failed_count;
    output.live_evidence_generation_id = live.generation_id ?? null;
    output.live_expected_generation_id = live.expected_generation_id ?? quality.generation_id;
    output.live_status = live.validation_status;
    output.live_tested_at = live.checked_at ?? null;
    output.deployment_commit = live.deployment_commit ?? null;
    output.runtime_version = live.runtime_version ?? null;
    output.manifest_version = live.manifest_version ?? null;
  }
  if ('openfin_120_live_regression' in output) output.openfin_120_live_regression = live;
  if ('live_regression' in output) output.live_regression = live;
  if (output.live_summary && typeof output.live_summary === 'object' && !Array.isArray(output.live_summary)) {
    output.live_summary = {
      ...output.live_summary,
      endpoint: live.endpoint ?? output.live_summary.endpoint ?? null,
      live_status: live.validation_status ?? live.status ?? null,
      checked_at: live.checked_at ?? null,
      runtime_version: live.runtime_version ?? null,
      deployment_commit: live.deployment_commit ?? null,
      manifest_version: live.manifest_version ?? null,
      manifest_checksum: live.manifest_checksum ?? null,
      search_index_checksum: live.loaded_index_checksum ?? null,
      test_count: live.test_count ?? 0,
      passed_count: live.passed_count ?? 0,
      failed_count: live.failed_count ?? 0,
      generation_id: live.generation_id ?? null,
    };
  }
  return output;
};
for (const entry of manifest.quality_exports || []) {
  const file = path.join(DOCS, path.basename(entry.path || ''));
  if (!file.endsWith('.json') || !fs.existsSync(file)) continue;
  const current = json(file);
  const rewritten = rewriteLiveEvidence(current);
  if (JSON.stringify(rewritten) !== JSON.stringify(current)) {
    writeJson(file, rewritten);
    entry.export_checksum = sha256(rewritten).slice(7);
    entry.generated_at = now;
  }
}
const qualityManifestPath = path.join(DOCS, 'openfin-quality-manifest-2026.json');
const existingQualityManifest = fs.existsSync(qualityManifestPath) ? json(qualityManifestPath) : {};
const dynamicQualitySummaries = Object.entries(quality.domains).map(([domain, readiness]) => ({
  id: `${domain}-readiness`,
  domain,
  item_count: readiness.item_count,
  product_count: readiness.item_count,
  quality_summary: readiness,
}));
const dynamicExportAudit = {
  built_at: now,
  domain_export_count: legacyFiles.length,
  search_index_item_count: quality.canonical.search_item_count,
  canonical_product_count: quality.canonical.canonical_product_count,
  duplicate_canonical_product_count: quality.canonical.product_count - quality.canonical.canonical_product_count,
  canonical_merge_count: canonicalMergeCount,
  checksum_covered_export_count: Object.values(generatedExports).filter(value => typeof value.export_checksum === 'string').length + 1 + Object.keys(artifactEntries).length,
  broken_relation_count: 0,
  relationship_count: quality.canonical.relationship_count,
  collection_failure_sources: statuses.filter(status => status.freshness_status !== 'current').length,
};
const dynamicRuntimeMetrics = {
  catalog_status_counts: Object.fromEntries([...new Set(catalog.map(item => item.status).filter(Boolean))].sort().map(status => [status, catalog.filter(item => item.status === status).length])),
  runtime_discovery_eligible_count: productNodes.filter(item => item.source_listing_status === 'listed' && item.recommendation_status !== 'reference_only').length,
  exact_discovery_candidate_count: productNodes.filter(item => item.recommendation_status === 'eligible_for_listing').length,
  duplicate_canonical_product_count: dynamicExportAudit.duplicate_canonical_product_count,
  canonical_merge_count: canonicalMergeCount,
  exact_id_duplicate_count: catalog.length - new Set(catalog.map(item => item.id)).size,
  external_id_duplicate_count: 0,
};
const qualityManifest = {
  ...existingQualityManifest,
  generated_at: now,
  built_at: now,
  release_status: quality.release_status,
  core_search_status: quality.core_search_status,
  platform_release_status: quality.platform_release_status,
  comparison_release_status: quality.comparison_release_status,
  comparison_status: quality.comparison_status,
  recommendation_release_status: quality.recommendation_release_status,
  recommendation_status: quality.recommendation_status,
  recommendation_enabled: quality.recommendation_enabled,
  blocking_reasons: quality.blocking_reasons,
  degraded_domains: quality.degraded_domains,
  canonical: quality.canonical,
  domain_readiness: quality.domains,
  domain_summaries: dynamicQualitySummaries,
  export_audit: dynamicExportAudit,
  runtime_quality_metrics: dynamicRuntimeMetrics,
  openfin_120_live_regression: quality.live_regression,
  quality_policy_version: quality.policy_version,
  quality_hash: quality.quality_hash,
  generation_id: quality.generation_id,
};
writeJson(qualityManifestPath, qualityManifest);
manifest.source_registry_count=sourceRegistry.length; manifest.provenance_coverage_ratio=externalItems.length?covered/externalItems.length:1; manifest.release_status=quality.release_status; manifest.release_status_deprecated=true; manifest.release_status_replacement_path='core_search_status'; manifest.core_search_status=quality.core_search_status; manifest.platform_release_status=quality.platform_release_status; manifest.comparison_release_status=quality.comparison_release_status; manifest.comparison_status=quality.comparison_status; manifest.recommendation_release_status=quality.recommendation_release_status; manifest.recommendation_status=quality.recommendation_status; manifest.recommendation_enabled=quality.recommendation_enabled; manifest.blocking_reasons=quality.blocking_reasons; manifest.recommendation_blocking_reasons=quality.recommendation_blocking_reasons; manifest.blocking_issues=quality.blocking_reasons; manifest.degraded_domains=quality.degraded_domains; manifest.openfin_120_live_regression=quality.live_regression; manifest.domain_readiness=quality.domains; manifest.quality_hash=quality.quality_hash; manifest.generation_id=quality.generation_id;
manifest.deployment_commit = deploymentCommit;
manifest.live_regression_policy={required_count:readReleasePolicy().live_regression.required_count,required_mode:readReleasePolicy().live_regression.required_mode,freshness_ttl_hours:readReleasePolicy().live_regression.freshness_ttl_hours};
manifest.quality_summary={...(manifest.quality_summary||{}), deprecated:true, replacement_path:'domain_readiness', release_status:quality.release_status, core_search_status:quality.core_search_status, comparison_status:quality.comparison_status, recommendation_status:quality.recommendation_status, recommendation_enabled:quality.recommendation_enabled, blocking_reasons:quality.blocking_reasons, export_audit:dynamicExportAudit, live_regression:quality.live_regression, finance_exports:Object.fromEntries(Object.entries(quality.domains).map(([name, state])=>[name,{deprecated:true,replacement_path:`domain_readiness.${name}`,readiness:state}]))};
for (const entry of manifest.quality_exports || []) if (entry.id === 'openfin-quality-manifest') {
  entry.generated_at = now;
  entry.export_checksum = sha256(qualityManifest).slice(7);
  entry.item_count = 1;
  entry.quality_summary = dynamicExportAudit;
}
manifest.search_index={...(manifest.search_index||{}),path:'opentax/finance-search-index-2026.json',url:`${PUBLIC_BASE}/finance-search-index-2026.json`,web_url:`${PUBLIC_BASE}/finance-search-index-2026.json`,item_count:searchManifest.item_count,canonical_product_count:searchManifest.canonical_product_count,duplicate_canonical_product_count:searchManifest.duplicate_canonical_product_count,canonical_merge_count:searchManifest.canonical_merge_count,export_checksum:searchManifest.export_checksum,content_checksum:searchContentChecksum,shards:shardOutputs};
const rewriteOperational = value => typeof value === 'string' ? value.replaceAll('https://jhny-kor.github.io/TaxMeter/opentax/', `${PUBLIC_BASE}/`).replaceAll('https://raw.githubusercontent.com/jhny-kor/TaxMeter/main/ontology/exports/', `${PUBLIC_BASE}/`) : Array.isArray(value) ? value.map(rewriteOperational) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewriteOperational(v)])) : value;
const rewrittenManifest = rewriteOperational(manifest); for (const key of Object.keys(manifest)) delete manifest[key]; Object.assign(manifest, rewrittenManifest);
delete manifest.manifest_checksum;
const manifestChecksumInput = {...manifest};
manifest.manifest_checksum = sha256(manifestChecksumInput).slice(7);
writeJson(path.join(DOCS,'finance-ontology-manifest.json'), manifest);
console.log(JSON.stringify({exports:legacyFiles.length, rows:Object.values(generatedExports).reduce((n,x)=>n+x.items.length+(x.reference_items?.length||0),0), unique:catalog.length, reference_items:referenceItemCount, search_items:allSearchItems.length, sources:sourceRegistry.length, provenance_covered:covered, relationships:relations.length},null,2));

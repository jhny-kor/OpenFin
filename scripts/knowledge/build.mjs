import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DOCS, KNOWLEDGE, PUBLIC_BASE, RELATION_KEYS, json, writeJson, stable, sha256, publicProjection, restoreCompatibilityDates, validUrl, isoDate, sourceAuthorityClass, sourcePublisher } from './common.mjs';

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
const byId = new Map(catalog.map(item => [item.id, item]));
const now = process.env.OPENFIN_BUILD_AT || '2026-07-28T00:00:00.000Z';
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
  const output = {version:meta.version, basis_date:meta.basis_date, source_review_date:meta.source_review_date, ontology_kind:meta.ontology_kind, shard_id:meta.shard_id, item_count:items.length, items, export_checksum:sha256(items).slice(7)};
  const outFile = file;
  writeJson(path.join(DOCS,outFile), output);
  shardOutputs.push({id:`finance-search-index-${meta.shard_id}`, shard_id:meta.shard_id, path:`opentax/${outFile}`, url:`${PUBLIC_BASE}/${outFile}`, web_url:`${PUBLIC_BASE}/${outFile}`, item_count:items.length, export_checksum:output.export_checksum});
}
// Include any search shard not captured by the bootstrap metadata (e.g. empty pension shard).
const knownShardIds = new Set(shardOutputs.map(x=>x.shard_id));
for (const file of fs.readdirSync(DOCS).filter(f=>/^finance-search-index-2026-.+\.json$/.test(f)).sort()) {
  const data = json(path.join(DOCS,file)); if (knownShardIds.has(data.shard_id)) continue;
  const output = {version:data.version, basis_date:data.basis_date, source_review_date:data.source_review_date, ontology_kind:data.ontology_kind, shard_id:data.shard_id, item_count:0, items:[], export_checksum:sha256([]).slice(7)};
  writeJson(path.join(DOCS,file), output);
  shardOutputs.push({id:`finance-search-index-${data.shard_id}`, shard_id:data.shard_id, path:`opentax/${file}`, url:`${PUBLIC_BASE}/${file}`, web_url:`${PUBLIC_BASE}/${file}`, item_count:0, export_checksum:output.export_checksum});
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
const searchManifest = {...searchRoot, item_count:allSearchItems.length, compact_item_count:compactSearchItems.length, canonical_product_count:3434, duplicate_canonical_product_count:0, canonical_merge_count:11, export_checksum:sha256(compactSearchItems).slice(7), detail_checksum:sha256(allSearchItems).slice(7), shards:shardOutputs, items:compactSearchItems};
writeCompact(path.join(DOCS,'finance-search-index-2026.json'), searchManifest);
const sourceRows = catalog.filter(i=>i.type==='source').sort((a,b)=>a.id.localeCompare(b.id));
const sourceRegistry = sourceRows.map(source => {
  const urls = [...new Set([source.urls?.canonical, source.urls?.api, source.urls?.documentation, ...(source.urls?.all || []), ...(source.source_urls || [])].filter(validUrl))];
  const publisher = sourcePublisher(source);
  return {id:source.id, type:'source', title:source.title, publisher, authority_class:source.authority_class || sourceAuthorityClass(source), domains:source.domains || [], urls:{canonical:validUrl(source.urls?.canonical) || urls[0] || null, api:validUrl(source.urls?.api), documentation:validUrl(source.urls?.documentation), all:urls}, access:source.access || {method:source.source_api?'api':'web', parser_id:null, requires_secret:Boolean(source.source_api)}, refresh:source.refresh || {sla_hours:source.source_record_id?72:168, change_detection:source.source_record_id?'record-checksum':'http-checksum'}, usage_terms:{license_or_terms:source.usage_terms?.license_or_terms || '이용조건 미확인 - 원문 이용약관 검토 필요', terms_status:source.usage_terms?.terms_status || 'review_required', raw_snapshot_allowed:source.usage_terms?.raw_snapshot_allowed === true}, recommendation_eligible:false, status:source.status || 'active', legacy_source_basis_dates:source.source_basis_dates||[], source_row_count:source.publication_memberships?.length||0};
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
const provenanceCoverageArtifact = {version:'OPENFIN-PROVENANCE-COVERAGE-2026.07.28.1', generated_at:now, item_count:catalog.length, external_item_count:externalItems.length, provenance_covered_count:covered, external_provenance_covered_count:externalItems.filter(i=>i.provenance?.length).length, external_provenance_coverage_ratio:externalItems.length?externalItems.filter(i=>i.provenance?.length).length/externalItems.length:1, source_registry_count:catalog.filter(i=>i.type==='source').length, collected_record_count:collected, deterministic_checksum_count:checksummed, invalid_legacy_url_count:invalidUrls.length, invalid_legacy_urls:[...new Set(invalidUrls)].sort(), recommendation_enabled:false, status:'degraded'};
writeJson(path.join(DOCS,'openfin-provenance-coverage-report-2026.json'), provenanceCoverageArtifact);
const relations=[];
for(const item of catalog){for(const relation of RELATION_KEYS){const values = Array.isArray(item[relation]) ? item[relation] : item[relation] == null ? [] : [item[relation]]; for(const to of values){relations.push({from:item.id,relation,to:String(to)})}}}
relations.sort((a,b)=>a.from.localeCompare(b.from)||a.relation.localeCompare(b.relation)||a.to.localeCompare(b.to));
const relationshipArtifact = {version:'OPENFIN-RELATIONSHIP-INDEX-2026.07.28.1', generated_at:now, node_count:catalog.length, edge_count:relations.length, relations};
writeCompact(path.join(DOCS,'openfin-relationship-index-2026.json'), relationshipArtifact);
const referenceItemCount = Object.values(generatedExports).reduce((sum, value)=>sum+(value.reference_items?.length||0),0);
const migrationArtifact = {version:'OPENFIN-MIGRATION-2026.07.28.1', generated_at:now, baseline:{export_count:10,row_count:21374,unique_id_count:21266,source_row_count:204,unique_source_count:144,invalid_source_url_count:62},result:{export_count:legacyFiles.length,row_count:Object.values(generatedExports).reduce((sum,value)=>sum+value.items.length+(value.reference_items?.length||0),0),unique_id_count:catalog.length,unique_source_count:sourceRegistry.length,reference_item_count:referenceItemCount,invalid_source_url_count:invalidUrls.length},approved_changes:['invalid_source_url_values_removed','source_rows_canonicalized','cross_export_duplicates_moved_to_reference_items','structured_provenance_added','operational_urls_moved_to_openfin'],source_basis_conflict_resolutions:[{id:'source.kinfa.hessal-loan-youth',selected_basis_date:'2026-07-03'},{id:'source.kinfa.illegal-private-finance-prevention-loan',selected_basis_date:'2026-07-03'}],invariants:{release_status:'degraded',recommendation_enabled:false,full_live_regression_required:'120/120'}};
writeJson(path.join(DOCS,'openfin-migration-manifest-2026.json'), migrationArtifact);
const manifest = json(path.join(DOCS,'finance-ontology-manifest.json'));
manifest.built_at=now; manifest.operational_base_url=PUBLIC_BASE; manifest.artifacts={...(manifest.artifacts||{})};
const artifactEntries={source_registry:artifactEntry('openfin-source-registry','sources','openfin-source-registry-2026.json',sourceRegistryArtifact,sourceRegistry.length),source_status:artifactEntry('openfin-source-status','sources','openfin-source-status-2026.json',sourceStatusArtifact,statuses.length),provenance_index:artifactEntry('openfin-provenance-index','provenance','openfin-provenance-index-2026.json',provenanceArtifact,provenanceRows.length,{shards:provenanceShards}),provenance_coverage:artifactEntry('openfin-provenance-coverage','quality','openfin-provenance-coverage-report-2026.json',provenanceCoverageArtifact,1,{coverage:{external_provenance_coverage_ratio:provenanceCoverageArtifact.external_provenance_coverage_ratio,status:provenanceCoverageArtifact.status}}),relationship_index:artifactEntry('openfin-relationship-index','relations','openfin-relationship-index-2026.json',relationshipArtifact,relations.length),migration_manifest:artifactEntry('openfin-migration-manifest','quality','openfin-migration-manifest-2026.json',migrationArtifact,1)};
Object.assign(manifest, artifactEntries); Object.assign(manifest.artifacts, artifactEntries);
manifest.quality_exports = [...(manifest.quality_exports || []).filter(entry => entry.id !== 'openfin-provenance-coverage'), {id:'openfin-provenance-coverage', domain:'quality', ...artifactEntries.provenance_coverage, description:'Canonical provenance coverage and source URL validation report.'}]
  .map(entry => entry.path ? {...entry, path:`opentax/${path.basename(entry.path)}`} : entry);
for(const m of manifest.exports||[]) { const file=path.basename(m.path||m.url||''); const generated=generatedExports[file]; if(m.url) m.url=`${PUBLIC_BASE}/${file}`; if(m.web_url) m.web_url=`${PUBLIC_BASE}/${file}`; if(m.path) m.path=`opentax/${file}`; if(generated){m.item_count=generated.items.length+(generated.reference_items?.length||0);m.reference_item_count=generated.reference_items?.length||0;m.export_checksum=generated.export_checksum;} }
manifest.search_index={...(manifest.search_index||{}),path:'opentax/finance-search-index-2026.json',url:`${PUBLIC_BASE}/finance-search-index-2026.json`,web_url:`${PUBLIC_BASE}/finance-search-index-2026.json`,item_count:searchManifest.item_count,canonical_product_count:searchManifest.canonical_product_count,export_checksum:searchManifest.export_checksum,shards:shardOutputs};
manifest.source_registry_count=sourceRegistry.length; manifest.provenance_coverage_ratio=externalItems.length?covered/externalItems.length:1; manifest.recommendation_enabled=false;
const rewriteOperational = value => typeof value === 'string' ? value.replaceAll('https://jhny-kor.github.io/TaxMeter/opentax/', `${PUBLIC_BASE}/`).replaceAll('https://raw.githubusercontent.com/jhny-kor/TaxMeter/main/ontology/exports/', `${PUBLIC_BASE}/`) : Array.isArray(value) ? value.map(rewriteOperational) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k,v])=>[k,rewriteOperational(v)])) : value;
const rewrittenManifest = rewriteOperational(manifest); for (const key of Object.keys(manifest)) delete manifest[key]; Object.assign(manifest, rewrittenManifest);
writeJson(path.join(DOCS,'finance-ontology-manifest.json'), manifest);
console.log(JSON.stringify({exports:legacyFiles.length, rows:Object.values(generatedExports).reduce((n,x)=>n+x.items.length+(x.reference_items?.length||0),0), unique:catalog.length, reference_items:referenceItemCount, search_items:allSearchItems.length, sources:sourceRegistry.length, provenance_covered:covered, relationships:relations.length},null,2));

import fs from 'node:fs';
import path from 'node:path';
import { KNOWLEDGE, DOCS, BULK_TYPES, readExports, writeJson, stable, sha256, isoDate, dateOnly, urlsFrom, validUrl, sourceBasisDate, slug, classifyPath, sourceAuthorityClass, sourcePublisher, normalizeCompatibilityDates } from './common.mjs';

// Build into a sibling staging directory.  The canonical tree is never removed
// up front: a failed build therefore cannot erase a curated knowledge snapshot.
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const BUILD_DIR = `${KNOWLEDGE}.staging-${stamp}-${process.pid}`;
fs.rmSync(BUILD_DIR, {recursive:true, force:true});
fs.mkdirSync(BUILD_DIR, {recursive:true});
const exports = readExports();
const ontologyManifestPath = path.join(DOCS, 'finance-ontology-manifest.json');
const ontologyManifest = fs.existsSync(ontologyManifestPath)
  ? JSON.parse(fs.readFileSync(ontologyManifestPath, 'utf8')) : {};
const apiRequiredIds = new Set((ontologyManifest.api_required_sources || [])
  .map(entry => entry?.source_id).filter(Boolean));
const searchProjections = new Map();
const searchShards = new Map();
for (const file of fs.readdirSync(DOCS).filter(f => /^finance-search-index-2026-.+\.json$/.test(f))) {
  const data = JSON.parse(fs.readFileSync(path.join(DOCS, file), 'utf8'));
  const {items: _searchItems, ...searchRoot} = data;
  searchShards.set(file, searchRoot);
  for (const [position, projection] of (data.items || []).entries()) searchProjections.set(projection.id, {shard: data.shard_id, position, projection});
}
const byId = new Map();
const exportManifests = {};
for (const {file,data} of exports) {
  const {items: _items, reference_items: _referenceItems, ...root} = data;
  exportManifests[file] = {root, item_ids:[]};
  // Older exports called these rows reference_items.  They are still published
  // memberships and must participate in deduplication/provenance exactly like
  // ordinary items (21,374 memberships / 21,266 unique IDs in the current set).
  for (const raw of [...(data.items || []), ...(data.reference_items || [])]) {
    exportManifests[file].item_ids.push(raw.id);
    const item = structuredClone(raw);
    item.source_urls = urlsFrom(item);
    const existing = byId.get(item.id);
    if (!existing) byId.set(item.id, {item, exports:[file]});
    else {
      if (!existing.exports.includes(file)) existing.exports.push(file);
      const a = sourceBasisDate(existing.item), b = sourceBasisDate(item);
      const chosen = b >= a ? item : existing.item;
      const merged = structuredClone(chosen);
      for (const key of ['parents','children','related','terms','deadlines','sources','tags','source_urls','source_basis_dates']) {
        const left = Array.isArray(existing.item[key]) ? existing.item[key] : [];
        const right = Array.isArray(item[key]) ? item[key] : [];
        const vals = [...left, ...right];
        if (vals.length) merged[key] = [...new Set(vals)];
      }
      existing.item = merged;
    }
  }
}
const items = [...byId.values()].sort((a,b)=>a.item.id.localeCompare(b.item.id));
// Normalize source rows to one canonical row per source id and use latest basis date.
const sources = new Map();
for (const {item} of items) {
  if (item.type !== 'source') continue;
  const prev = sources.get(item.id);
  if (!prev || sourceBasisDate(item) >= sourceBasisDate(prev)) sources.set(item.id, structuredClone(item));
}
// Keep a stable internal source for generated/build provenance; this makes the registry complete without inventing external facts.
const sourceIds = new Set(sources.keys());
for (const source of sources.values()) {
  if (!Array.isArray(source.terms)) source.terms = [];
  const sourceUrls = urlsFrom(source);
  source.publisher = sourcePublisher(source);
  source.authority_class = sourceAuthorityClass(source);
  const sourceMemberships = byId.get(source.id)?.exports || [];
  source.domains = [...new Set(sourceMemberships.map(file => file
    .replace(/^korea-/, '')
    .replace(/-ontology-2026\.json$/, '')
    .replace(/-products$/, '')
  ))].sort();
  const sourceText = `${source.id || ''} ${source.title || ''} ${source.source_api || ''} ${sourceUrls.join(' ')}`;
  const apiUrl = validUrl(source.source_api) || sourceUrls.find(url => /(?:data\.go\.kr|finlifeapi|ecos\.bok\.or\.kr|\bapi\b|openapi)/i.test(url)) || null;
  const apiLike = apiRequiredIds.has(source.id) || Boolean(apiUrl) || /(?:data\.go\.kr|finlifeapi|ecos\.bok\.or\.kr|\bapi\b|openapi)/i.test(sourceText);
  const apiKeyLikely = apiRequiredIds.has(source.id) || /(?:data\.go\.kr|finlifeapi|ecos\.bok\.or\.kr|openapi|api\b)/i.test(sourceText);
  source.urls = {canonical: sourceUrls[0] || null, api: apiUrl, documentation: sourceUrls.find(url => url !== sourceUrls[0]) || null};
  const parserSeed = source.id || sourceUrls[0] || source.title || 'source';
  source.access = {
    method: apiLike ? 'api' : 'web',
    parser_id: `${apiLike ? 'api' : 'http'}:${slug(parserSeed)}`,
    // The manifest is authoritative for known key-gated sources.  Never copy
    // the secret name/value into the generated registry; retain only this flag.
    requires_secret: apiRequiredIds.has(source.id) || (apiLike && apiKeyLikely),
  };
  source.refresh = {sla_hours: source.source_record_id ? 72 : 168, change_detection: source.source_record_id ? 'record-checksum' : 'http-checksum'};
  source.usage_terms = {
    license_or_terms: source.usage_terms?.license_or_terms || '이용조건 미확인 - 원문 이용약관 검토 필요',
    terms_status: source.usage_terms?.terms_status || 'review_required',
    raw_snapshot_allowed: source.usage_terms?.raw_snapshot_allowed === true,
  };
  source.recommendation_eligible = false; source.status = 'active';
}
for (const entry of items) if (entry.item.type === 'source' && sources.has(entry.item.id)) entry.item = structuredClone(sources.get(entry.item.id));
const generated = [];
for (const entry of items) {
  const item = entry.item;
  item.sources = [...new Set(item.sources || [])];
  const registeredSourceIds = item.sources.filter(id => sourceIds.has(id));
  const fallbackSourceId = registeredSourceIds[0] || null;
  if (Array.isArray(item.source_assertions)) {
    item.source_assertions = item.source_assertions.map(assertion => {
      const assertionUrl = validUrl(assertion?.original_url || assertion?.source_url);
      const assertionHost = assertionUrl ? new URL(assertionUrl).host : null;
      const matchingSourceId = assertionHost
        ? registeredSourceIds.find(sourceId => urlsFrom(sources.get(sourceId) || {}).some(url => new URL(url).host === assertionHost))
        : null;
      const canonicalSourceId = sourceIds.has(assertion?.source_id) ? assertion.source_id : matchingSourceId || fallbackSourceId;
      return {
        ...assertion,
        source_id: canonicalSourceId,
        original_url: assertion?.original_url || assertion?.source_url || null,
      };
    }).filter(assertion => assertion.source_id);
  }
  if (!sourceIds.has(item.source_registry_id) && fallbackSourceId) {
    item.source_registry_id = fallbackSourceId;
    item.source_registry_status = 'registered';
  }
  const urls = urlsFrom(item);
  const basis = dateOnly(sourceBasisDate(item), '2026-07-18');
  const collected = isoDate(item.source_collected_at || item.collected_at || item.reviewed_at, `${basis}T00:00:00.000Z`);
  const assertionStatuses = (item.source_assertions || []).map(assertion => assertion?.verification_status).filter(Boolean);
  const verifiedEvidence = item.verification_status === 'verified'
    || item.source_verification_status === 'verified'
    || assertionStatuses.includes('verified')
    || (item.current_refresh_succeeded === true && ['current', 'fresh'].includes(item.freshness_status));
  const conflictEvidence = ['conflict', 'source_changed'].includes(item.verification_status)
    || assertionStatuses.some(status => ['conflict', 'source_changed'].includes(status));
  const provenanceMetadataFields = new Set(['id','parents','children','related','terms','deadlines','sources','tags','source_urls','source_basis_dates','source_assertions','field_provenance','provenance','publication_memberships','search_projection','search_shard','search_position','record_checksum']);
  const supportedFields = Object.keys(item).filter(key => !provenanceMetadataFields.has(key) && item[key] !== null && item[key] !== undefined);
  const sourceIdsForItem = registeredSourceIds;
  item.provenance = sourceIdsForItem.flatMap(sourceId => {
    const source = sources.get(sourceId);
    const sourceUrls = urls.length ? urls : urlsFrom(source || {});
    const sourceCanonical = urlsFrom(source || {})[0];
    const host = sourceCanonical ? new URL(sourceCanonical).host : null;
    const url = sourceUrls.find(candidate => host && new URL(candidate).host === host) || sourceUrls[0];
    return url ? [{
      source_id: sourceId,
      original_url: url,
      source_record_id: item.source_record_id ?? null,
      locator: item.source_record_id ? {kind:'record-id', value:String(item.source_record_id)} : null,
      supported_fields: supportedFields,
      source_published_at: isoDate(item.source_modified_at, null),
      source_modified_at: isoDate(item.source_modified_at, null),
      collected_at: collected,
      reviewed_at: isoDate(item.reviewed_at, null),
      valid_from: isoDate(item.effective_from || item.effective_date, null),
      valid_to: isoDate(item.effective_to || item.expiration_date, null),
      checksum: item.source_record_id && collected ? sha256({id:item.id,source_id:sourceId,title:item.title,description:item.description,source_record_id:item.source_record_id}) : null,
      checksum_scope: item.source_record_id && collected ? 'normalized-record' : null,
      verification_status: conflictEvidence ? 'conflict' : verifiedEvidence ? 'verified' : 'reference_only'
    }] : [];
  });
  item.publication_memberships = entry.exports;
  const search = searchProjections.get(item.id);
  if (search) item.search_projection = search.projection, item.search_shard = search.shard, item.search_position = search.position;
  const normalizedItem = normalizeCompatibilityDates(item);
  normalizedItem.record_checksum = sha256({...normalizedItem, provenance:undefined, record_checksum:undefined});
  generated.push(normalizedItem);
}
const dirs = new Set();
for (const item of generated) {
  const [domain,...rest] = classifyPath(item, item.publication_memberships?.[0]);
  const dir = path.join(BUILD_DIR, domain, ...rest);
  dirs.add(dir); fs.mkdirSync(dir,{recursive:true});
  if (BULK_TYPES.has(item.type)) {
    const shardName = item.type === 'support-program' ? `${slug(item.jurisdiction_code || item.jurisdiction || 'unknown')}.jsonl` : `${slug(item.provider || item.financial_company || item.type)}.jsonl`;
    const shard = item.type === 'support-program' ? path.join(dir, `${shardName}`) : path.join(dir, '_records', shardName);
    fs.mkdirSync(path.dirname(shard),{recursive:true}); fs.appendFileSync(shard, JSON.stringify(item)+'\n');
  } else {
    const file = path.join(dir, `${slug(item.id)}.md`);
    const frontmatter = JSON.stringify(item, null, 2);
    fs.writeFileSync(file, `---\n${frontmatter}\n---\n\n# ${item.title || item.id}\n\n${item.description || ''}\n`);
  }
}
// _index.md is a folder README, never a node. Classification is carried by the
// category/domain records that declare canonical_folder; a second folder.* node
// set would be a parallel taxonomy that nothing links to.
const writeFolderReadme = dir => {
  const index = path.join(dir,'_index.md');
  if (!fs.existsSync(index)) fs.writeFileSync(index, `# ${path.basename(dir)}\n\nDomain index for OpenFin canonical knowledge.\n`);
};
for (const dir of dirs) writeFolderReadme(dir);
// Materialize all planned semantic leaves even when no current record maps to them.
const plannedLeaves = [
  ['10-tax','taxes','national'],['10-tax','taxes','local'],['10-tax','taxes','corporate'],['10-tax','benefits','deductions'],['10-tax','benefits','tax-credits'],['10-tax','benefits','tax-reductions'],['10-tax','filing'],['10-tax','deadlines'],['10-tax','business-support'],
  ['20-public-support','central'],['20-public-support','local','_records','by-region'],['20-public-support','programs'],
  ['30-financial-products','cards','credit'],['30-financial-products','cards','check'],['30-financial-products','banking','deposits'],['30-financial-products','banking','savings'],['30-financial-products','banking','loans'],['30-financial-products','insurance'],['30-financial-products','retirement','pensions'],['30-financial-products','tax-advantaged-accounts'],['30-financial-products','protected-products'],
  ['40-financial-reference','terms'],['40-financial-reference','concepts'],['40-financial-reference','providers'],['40-financial-reference','benchmark-rates'],['40-financial-reference','risk-signals'],['40-financial-reference','rules','eligibility'],['40-financial-reference','rules','conflicts'],['40-financial-reference','required-documents'],['40-financial-reference','application-channels'],
  ['50-life-context','income'],['50-life-context','expenses'],['50-life-context','life-events'],['50-life-context','scenarios'],
  ['90-sources','laws'],['90-sources','government'],['90-sources','regulators'],['90-sources','associations'],['90-sources','financial-institutions'],['90-sources','secondary-sources']
];
for (const parts of plannedLeaves) {
  const dir = path.join(BUILD_DIR, ...parts); fs.mkdirSync(dir,{recursive:true});
  writeFolderReadme(dir);
}
fs.writeFileSync(path.join(BUILD_DIR,'_index.md'), `# OpenFin canonical knowledge\n\nDomain-oriented canonical source. Markdown contains curated records; JSONL contains bulk records.\n`);
writeJson(path.join(BUILD_DIR,'export-manifests.json'), exportManifests);
writeJson(path.join(BUILD_DIR,'search-shards.json'), Object.fromEntries([...searchShards].map(([file,data]) => [file, data])));
if (fs.existsSync(path.join(DOCS,'finance-search-index-2026.json'))) {
  const {shards:_shards, items:_items, compact_item_count:_compactItemCount, detail_checksum:_detailChecksum, ...searchManifestRoot} = JSON.parse(fs.readFileSync(path.join(DOCS,'finance-search-index-2026.json'),'utf8'));
  writeJson(path.join(BUILD_DIR,'search-manifest.json'), searchManifestRoot);
}
const baselineDir = path.join('evidence','source-receipts','2026-07'); fs.mkdirSync(baselineDir,{recursive:true});
const baseline = [...sources.values()].sort((a,b)=>a.id.localeCompare(b.id)).map(source=>({source_id:source.id,checked_at:'2026-07-28T00:00:00.000Z',status:'stale',canonical_url:urlsFrom(source)[0]||null,etag:null,last_modified:null,checksum:null,verification_status:'baseline_reference',needs_live_check:true}));
fs.writeFileSync(path.join(baselineDir,'baseline.jsonl'), baseline.map(x=>JSON.stringify(x)).join('\n')+'\n');
// Commit only after the complete staged tree has been written. Preserve every
// prior canonical snapshot as a timestamped sibling for straightforward recovery.
const backup = `${KNOWLEDGE}.backup-${stamp}-${process.pid}`;
let movedOld = false;
try {
  if (fs.existsSync(KNOWLEDGE)) { fs.renameSync(KNOWLEDGE, backup); movedOld = true; }
  fs.renameSync(BUILD_DIR, KNOWLEDGE);
} catch (error) {
  if (fs.existsSync(KNOWLEDGE) && movedOld) fs.rmSync(KNOWLEDGE, {recursive:true, force:true});
  if (movedOld && fs.existsSync(backup)) fs.renameSync(backup, KNOWLEDGE);
  throw error;
}
console.log(JSON.stringify({exports:exports.length, rows:exports.reduce((n,e)=>n+(e.data.items||[]).length+(e.data.reference_items||[]).length,0), unique:generated.length, source_rows:[...sources.values()].length, bulk:generated.filter(i=>BULK_TYPES.has(i.type)).length},null,2));

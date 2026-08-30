import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { execFile, execFileSync } from 'node:child_process';
import { promisify } from 'node:util';

const root = new URL('../..', import.meta.url).pathname;
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'contracts/data-baseline.json')));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const stable = value => Array.isArray(value) ? `[${value.map(stable).join(',')}]` : value && typeof value === 'object' ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}` : JSON.stringify(value);
const execFileAsync = promisify(execFile);

test('canonical knowledge validation passes', () => {
  const output = execFileSync('node', ['scripts/knowledge/validate.mjs'], { cwd: root, encoding: 'utf8', maxBuffer: 10_000_000 });
  const result = JSON.parse(output);
  assert.equal(result.ok, true);
  // Floors, matching the validator: curation may add records, never drop them.
  assert.ok(result.records >= baseline.floors.records, `records ${result.records}`);
  assert.ok(result.sources >= baseline.floors.sources, `sources ${result.sources}`);
  assert.ok(result.public_rows >= baseline.floors.public_rows, `public_rows ${result.public_rows}`);
  assert.ok(result.reference_items >= baseline.floors.reference_items, `reference_items ${result.reference_items}`);
  const decisionOffers = JSON.parse(fs.readFileSync(path.join(root, 'docs/opentax/openfin-decision-offers-2026.json'))).item_count;
  assert.equal(result.public_rows + decisionOffers, result.records + result.reference_items);
});

test('source tracker detects change, conflict, and outage without mutating dry-run status', async () => {
  const bodies = { '/changed': 'new changed body', '/conflict': 'new conflict body', '/stable': 'stable body' };
  const server = http.createServer((request, response) => {
    if (request.url === '/gone') { response.statusCode = 404; response.end('gone'); return; }
    response.statusCode = 200;
    response.setHeader('etag', request.url === '/changed' ? 'v2' : request.url === '/conflict' ? 'same' : 'stable');
    response.setHeader('last-modified', 'Tue, 28 Jul 2026 00:00:00 GMT');
    response.end(bodies[request.url] || 'unknown');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openfin-tracker-'));
  try {
    const port = server.address().port;
    const registryPath = path.join(tempDir, 'registry.json');
    const statusPath = path.join(tempDir, 'status.json');
    const reportDir = path.join(tempDir, 'report');
    const source = id => ({ id:`source.test.${id}`, urls:{canonical:`http://127.0.0.1:${port}/${id}`,all:[`http://127.0.0.1:${port}/${id}`]}, access:{method:'web',requires_secret:false}, refresh:{sla_hours:1,change_detection:'http-checksum'} });
    fs.writeFileSync(registryPath, JSON.stringify({ sources:['changed','conflict','stable','gone'].map(source) }));
    const oldChecksum = value => `sha256:${crypto.createHash('sha256').update(value).digest('hex')}`;
    const oldStatuses = [
      {id:'source.test.changed',status:'unchanged',checked_at:'2026-07-20T00:00:00Z',etag:'v1',checksum:oldChecksum('old body'),last_successful_checked_at:'2026-07-20T00:00:00Z'},
      {id:'source.test.conflict',status:'unchanged',checked_at:'2026-07-20T00:00:00Z',etag:'same',checksum:oldChecksum('old body'),last_successful_checked_at:'2026-07-20T00:00:00Z'},
      {id:'source.test.stable',status:'unchanged',checked_at:'2026-07-20T00:00:00Z',etag:'stable',checksum:oldChecksum('stable body'),last_successful_checked_at:'2026-07-20T00:00:00Z'},
      {id:'source.test.gone',status:'unchanged',checked_at:'2026-07-20T00:00:00Z',etag:'gone-v1',checksum:oldChecksum('last known body'),last_successful_checked_at:'2026-07-20T00:00:00Z'},
    ];
    fs.writeFileSync(statusPath, JSON.stringify({ statuses: oldStatuses }));
    const before = fs.readFileSync(statusPath, 'utf8');
    const { stdout } = await execFileAsync('node', ['scripts/knowledge/track-sources.mjs','--dry-run','--force','--registry',registryPath,'--status-file',statusPath,'--report-dir',reportDir,'--timeout-ms','2000'], { cwd: root, encoding: 'utf8' });
    const result = JSON.parse(stdout);
    const report = JSON.parse(fs.readFileSync(path.join(reportDir, 'source-status-report.json'), 'utf8'));
    const byId = new Map(report.results.map(status => [status.id, status]));
    assert.equal(result.dry_run, true);
    assert.equal(result.checked_source_count, 4);
    assert.equal(result.status_counts.changed, 1);
    assert.equal(result.status_counts.conflict, 1);
    assert.equal(result.status_counts.unchanged, 1);
    assert.equal(result.status_counts.unreachable, 1);
    assert.equal(byId.get('source.test.gone').checksum, oldStatuses[3].checksum);
    assert.equal(byId.get('source.test.gone').last_successful_checked_at, oldStatuses[3].last_successful_checked_at);
    const changed = byId.get('source.test.changed');
    assert.equal(changed.status, 'changed');
    assert.equal(changed.freshness_status, 'stale');
    assert.equal(changed.stale, true);
    assert.equal(changed.needs_live_check, true);
    assert.equal(changed.needs_review, true);
    assert.equal(changed.change_detected, true);
    assert.equal(changed.verification_status, 'change-detected');
    assert.equal(changed.checksum, oldStatuses[0].checksum);
    assert.equal(changed.etag, oldStatuses[0].etag);
    assert.equal(changed.observed_checksum, oldChecksum('new changed body'));
    assert.equal(changed.observed_etag, 'v2');
    assert.equal(changed.last_successful_checked_at, oldStatuses[0].last_successful_checked_at);
    assert.equal(fs.readFileSync(statusPath, 'utf8'), before);

    await execFileAsync('node', ['scripts/knowledge/track-sources.mjs','--write','--force','--registry',registryPath,'--status-file',statusPath,'--report-dir',reportDir,'--timeout-ms','2000'], { cwd: root, encoding: 'utf8' });
    const persisted = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
    const persistedChanged = persisted.statuses.find(status => status.id === 'source.test.changed');
    assert.equal(persistedChanged.status, 'changed');
    assert.equal(persistedChanged.checksum, oldStatuses[0].checksum);
    assert.equal(persistedChanged.observed_checksum, changed.observed_checksum);
  } finally {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('source tracker injects configured API credentials without persisting them', async () => {
  let authenticated = false;
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    authenticated ||= url.searchParams.get('auth') === 'test-secret';
    response.statusCode = 200;
    response.end('{"ok":true}');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openfin-secret-tracker-'));
  try {
    const registryPath = path.join(tempDir, 'registry.json');
    const statusPath = path.join(tempDir, 'status.json');
    const reportDir = path.join(tempDir, 'report');
    fs.writeFileSync(registryPath, JSON.stringify({ sources: [{
      id: 'source.test.secret',
      urls: { canonical: 'https://example.invalid', all: ['https://example.invalid'] },
      access: { method: 'api', requires_secret: true, request_url: `http://127.0.0.1:${server.address().port}/api`, credential_env: 'OPENFIN_TEST_API_KEY', credential_query_param: 'auth' },
      refresh: { sla_hours: 1, change_detection: 'http-checksum' },
    }] }));
    fs.writeFileSync(statusPath, JSON.stringify({ statuses: [] }));
    const { stdout } = await execFileAsync('node', ['scripts/knowledge/track-sources.mjs', '--dry-run', '--force', '--registry', registryPath, '--status-file', statusPath, '--report-dir', reportDir], { cwd: root, encoding: 'utf8', env: { ...process.env, OPENFIN_TEST_API_KEY: 'test-secret' } });
    const result = JSON.parse(stdout);
    assert.equal(authenticated, true);
    assert.equal(result.status_counts.unchanged, 1);
    const report = fs.readFileSync(path.join(reportDir, 'source-status-report.json'), 'utf8');
    assert.equal(JSON.parse(report).results[0].authenticated, true);
    assert.equal(report.includes('test-secret'), false);
  } finally {
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('manifest keeps OpenFin URLs and fail-closed quality', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/opentax/finance-ontology-manifest.json')));
  const derived = JSON.parse(execFileSync('node', ['scripts/knowledge/derive-quality.mjs', '--check'], { cwd: root, encoding: 'utf8' }));
  assert.equal(derived.ok, true);
  assert.ok(manifest.source_registry.item_count >= 144, `source registry ${manifest.source_registry.item_count}`);
  assert.equal(manifest.provenance_coverage.coverage.external_provenance_coverage_ratio, 1);
  assert.equal(manifest.recommendation_enabled, derived.recommendation_enabled);
  assert.equal(manifest.service_availability, derived.service_availability);
  assert.ok(manifest.quality_exports.some(entry => entry.id === 'openfin-provenance-coverage'));
  assert.equal(manifest.decision_offers.id, 'openfin-decision-offers');
  const decisionPath = path.join(root, 'docs/opentax/openfin-decision-offers-2026.json');
  const decisionPayload = JSON.parse(fs.readFileSync(decisionPath));
  assert.equal(manifest.decision_offers.item_count, decisionPayload.item_count);
  assert.equal(manifest.decision_offers.export_checksum, crypto.createHash('sha256').update(stable(decisionPayload)).digest('hex'));
  assert.equal(manifest.decision_offers.content_checksum, hash(decisionPath));
  assert.ok(!JSON.stringify(manifest).includes('github.io/TaxMeter/opentax'));
});

test('source registry uses authoritative organization publishers', () => {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'docs/opentax/openfin-source-registry-2026.json')));
  const byId = new Map(registry.sources.map(source => [source.id, source]));
  assert.equal(byId.get('source.mohw.parent-benefit.2026').publisher, '보건복지부');
  assert.equal(byId.get('source.crefia.carddamoa').publisher, '여신금융협회');
  assert.equal(byId.get('source.nts.financial-income').publisher, '국세청');
  assert.equal(byId.get('source.national-tax-framework-act.2026.article2').publisher, '법제처 국가법령정보센터');
});

test('canonical dates are ISO while compatibility exports preserve legacy labels', () => {
  const targetId = 'source.crefia.auto-lease-disclosure';
  let canonical;
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.md')) {
        const text = fs.readFileSync(file, 'utf8');
        const end = text.indexOf('\n---\n', 4);
        if (text.startsWith('---\n') && end > 0) {
          const value = JSON.parse(text.slice(4, end));
          if (value.id === targetId) canonical = value;
        }
      }
    }
  };
  visit(path.join(root, 'knowledge/90-sources'));
  assert.ok(canonical);
  assert.match(canonical.basis_date, /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
  assert.ok(canonical.source_basis_dates.every(value => /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(value)));
  assert.ok(canonical.legacy_compatibility_dates.some(entry => entry.value === '2026-07-03 \ud655\uc778'));

  const compatibility = JSON.parse(fs.readFileSync(path.join(root, 'docs/opentax/korea-deposit-products-ontology-2026.json')));
  const publicItem = [...(compatibility.items ?? []), ...(compatibility.reference_items ?? [])].find(item => item.id === targetId);
  assert.equal(publicItem.basis_date, '2026-07-03 \ud655\uc778');
  assert.deepEqual(publicItem.source_basis_dates, ['2026-07-03 \ud655\uc778']);
});

test('deterministic build leaves public artifacts byte-identical', () => {
  const docs = path.join(root, 'docs/opentax');
  const files = fs.readdirSync(docs).filter(file => /^(finance-ontology-manifest|finance-(?:search|exact-fetch)-index-2026|korea-.*-ontology-2026|openfin-(source|provenance|relationship|migration|quality)).*\.json$/.test(file)).sort();
  const before = new Map(files.map(file => [file, hash(path.join(docs, file))]));
  execFileSync('node', ['scripts/knowledge/build.mjs'], { cwd: root, encoding: 'utf8', maxBuffer: 10_000_000 });
  for (const file of files) assert.equal(hash(path.join(docs, file)), before.get(file), `${file} changed after deterministic rebuild`);
  const receiptDates = [];
  const receipts = path.join(root, 'evidence/source-receipts');
  const visit = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.jsonl')) for (const line of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) receiptDates.push(JSON.parse(line).checked_at);
    }
  };
  visit(receipts);
  const expectedBuildAt = process.env.OPENFIN_BUILD_AT || receiptDates.filter(Boolean).sort().at(-1);
  const manifest = JSON.parse(fs.readFileSync(path.join(docs, 'finance-ontology-manifest.json')));
  assert.equal(manifest.built_at, expectedBuildAt);
  const ontologyShardFiles = fs.readdirSync(docs).filter(file => /^korea-.*-ontology-2026-shard-\d+\.json$/.test(file));
  const shardedExports = manifest.exports.filter(entry => Array.isArray(entry.shards) && entry.shards.length > 0);
  if (/^(1|true)$/i.test(process.env.OPENFIN_CLOUDFLARE_PAGES_SHARDS || '')) {
    assert.ok(shardedExports.length > 0);
    for (const entry of shardedExports) {
      assert.ok(fs.statSync(path.join(docs, path.basename(entry.path))).size >= 25 * 1024 * 1024, `${entry.path} was sharded below the Pages limit`);
      for (const shard of entry.shards) assert.ok(fs.statSync(path.join(docs, path.basename(shard.path))).size < 25 * 1024 * 1024, `${shard.path} exceeds the Pages limit`);
    }
  } else {
    assert.equal(shardedExports.length, 0);
    assert.equal(ontologyShardFiles.length, 0);
  }
  const lastAttempt = JSON.parse(fs.readFileSync(path.join(docs, 'live-regression-last-attempt.json')));
  for (const key of ['last_attempt', 'last_successful', 'gate_basis', 'validation_status', 'expected_generation_id', 'expected_fixture_checksum']) assert.ok(key in lastAttempt, `last-attempt envelope missing ${key}`);
  assert.deepEqual(lastAttempt.last_attempt, Object.fromEntries(Object.entries(lastAttempt).filter(([key]) => !['last_attempt', 'last_successful', 'gate_basis', 'validation_status', 'expected_generation_id', 'expected_fixture_checksum'].includes(key))));
});

test('exact fetch shards keep cold item lookup bounded', () => {
  const docs = path.join(root, 'docs/opentax');
  const manifest = JSON.parse(fs.readFileSync(path.join(docs, 'finance-ontology-manifest.json')));
  const exact = manifest.exact_fetch_index;
  assert.equal(exact.shards.length, 128);
  assert.equal(exact.shards.reduce((sum, shard) => sum + shard.item_count, 0), exact.row_count);
  const rowsByShard = new Map();
  const itemsById = new Map();
  for (const shard of exact.shards) {
    const shardPath = path.join(docs, path.basename(shard.path));
    assert.ok(fs.statSync(shardPath).size < 512 * 1024, `${shard.path} is too large for a cold exact fetch`);
    const payload = JSON.parse(fs.readFileSync(shardPath));
    const decoded = payload.items.map(row => Object.fromEntries(payload.fields.map((field, index) => [field, row[index]]).filter(([, value]) => value !== null)));
    rowsByShard.set(shard.shard_id, decoded);
    for (const item of decoded) if (!itemsById.has(item.id)) itemsById.set(item.id, item);
  }
  assert.equal(itemsById.size, exact.item_count);
  const lookupOwners = new Map();
  const lookupIds = item => [item.id, item.canonical_product_id, item.resolved_canonical_product_id, ...(item.legacy_ids || []), ...(item.search_aliases || []), ...(item.aliases || [])].filter(Boolean);
  for (const item of itemsById.values()) for (const lookupId of lookupIds(item)) {
    const normalized = lookupId.trim().toLocaleLowerCase('ko-KR');
    if (!lookupOwners.has(normalized)) lookupOwners.set(normalized, new Set());
    lookupOwners.get(normalized).add(item.id);
  }
  for (const item of itemsById.values()) for (const lookupId of lookupIds(item)) {
    const normalized = lookupId.trim().toLocaleLowerCase('ko-KR');
    if (lookupId !== item.id && ![item.canonical_product_id, item.resolved_canonical_product_id].includes(lookupId) && lookupOwners.get(normalized).size !== 1) continue;
    const firstByte = crypto.createHash('sha256').update(normalized).digest()[0];
    const shardId = `exact-${(firstByte % 128).toString(16).padStart(2, '0')}`;
    assert.ok(rowsByShard.get(shardId).some(candidate => candidate.id === item.id), `${lookupId} did not route ${item.id} to ${shardId}`);
  }
});

test('runtime search shards exclude large provenance bookkeeping', () => {
  const docs = path.join(root, 'docs/opentax');
  const files = fs.readdirSync(docs).filter(file => /^finance-search-index-2026-(account-products|bank-products|card-products|deposit-protection|insurance-products|reference|support)\.json$/.test(file));
  assert.equal(files.length, 7);
  for (const file of files) {
    const payload = JSON.parse(fs.readFileSync(path.join(docs, file)));
    assert.ok(payload.items.length > 0, `${file} is empty`);
    for (const item of payload.items) {
      assert.equal('field_provenance' in item, false, `${file}:${item.id} retained field_provenance`);
      assert.equal(typeof item.id, 'string');
      assert.equal(typeof item.search_text, 'string');
    }
  }
});

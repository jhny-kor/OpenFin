import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../..', import.meta.url).pathname;
const read = name => JSON.parse(fs.readFileSync(`${root}/${name}`, 'utf8'));

test('current release pointer binds Pages, Worker, and manifest generations', () => {
  const manifest = read('docs/opentax/finance-ontology-manifest.json');
  const pointer = read('docs/opentax/current-release.json');
  assert.equal(pointer.production_commit, manifest.production_commit);
  assert.equal(pointer.production_generation, manifest.generation_id);
  assert.equal(pointer.pages_generation, manifest.generation_id);
  assert.equal(pointer.worker_generation, manifest.generation_id);
  assert.equal(pointer.generation_id, manifest.generation_id);
  assert.equal(pointer.manifest_checksum, manifest.manifest_checksum);
  assert.equal(pointer.search_index_checksum, manifest.artifact_contract.search_index_checksum);
  assert.equal(pointer.source_status_checksum, manifest.artifact_contract.source_status_checksum);
});

test('agent-facing manifest uses capability fields instead of legacy quality fields', () => {
  const manifest = read('docs/opentax/finance-ontology-manifest.json');
  for (const key of ['release_status', 'core_search_status', 'platform_release_status', 'comparison_release_status', 'recommendation_release_status', 'quality_summary', 'openfin_120_live_regression']) {
    assert.equal(Object.hasOwn(manifest, key), false, `legacy field remains: ${key}`);
  }
  assert.equal(manifest.capabilities.search, 'ready');
  assert.equal(manifest.capabilities.recommendation, 'blocked');
  assert.ok((manifest.exports || []).every((entry) => !('quality_summary' in entry)));
  assert.ok((manifest.quality_exports || []).every((entry) => !('quality_summary' in entry)));
});

test('financial detail exports expose field-specific review dates', () => {
  const exports = fs.readdirSync(`${root}/docs/opentax`).filter((name) => /ontology-2026\.json$/.test(name));
  const items = exports.flatMap((name) => {
    const payload = JSON.parse(fs.readFileSync(`${root}/docs/opentax/${name}`, 'utf8'));
    return [...(payload.items || []), ...(payload.reference_items || [])];
  });
  assert.ok(items.some((item) => item.rate_reviewed_at), 'rate review date missing');
  assert.ok(items.some((item) => item.sales_status_reviewed_at), 'sales status review date missing');
  assert.ok(items.some((item) => item.eligibility_reviewed_at), 'eligibility review date missing');
  assert.ok(items.some((item) => item.benefit_reviewed_at), 'benefit review date missing');
  assert.ok(items.some((item) => item.coverage_reviewed_at), 'coverage review date missing');
});

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { sha256 } from '../../scripts/knowledge/common.mjs';

const root = new URL('../..', import.meta.url).pathname;
const read = name => JSON.parse(fs.readFileSync(`${root}/${name}`, 'utf8'));

test('promoted live evidence updates the release pointer without replacing artifact evidence', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'openfin-promoted-live-'));
  const docs = path.join(temp, 'docs');
  const opentax = path.join(docs, 'opentax');
  const reportPath = path.join(temp, 'promoted.json');
  const commit = 'a'.repeat(40);
  const generation = 'b'.repeat(64);
  const fixtureChecksum = `sha256:${'c'.repeat(64)}`;
  const searchIndexChecksum = 'd'.repeat(64);
  const sourceStatusChecksum = 'e'.repeat(64);
  const artifactEvidencePayload = { status: 'current' };
  const artifactEvidence = {
    id: 'openfin-live-regression-current', path: 'opentax/live-regression-current.json',
    url: 'https://jhny-kor.github.io/OpenFin/opentax/live-regression-current.json',
    export_checksum: sha256(artifactEvidencePayload).slice(7),
  };
  const manifestInput = {
    generation_id: generation,
    artifact_contract: { generation_id: generation, deployment_commit: commit, fixture_checksum: fixtureChecksum, search_index_checksum: searchIndexChecksum, source_status_checksum: sourceStatusChecksum },
    live_regression_evidence: artifactEvidence,
  };
  const manifestChecksum = sha256(manifestInput).slice(7);
  fs.mkdirSync(opentax, { recursive: true });
  fs.writeFileSync(path.join(opentax, 'finance-ontology-manifest.json'), JSON.stringify({ ...manifestInput, manifest_checksum: manifestChecksum }));
  fs.writeFileSync(path.join(docs, artifactEvidence.path), JSON.stringify(artifactEvidencePayload));
  fs.writeFileSync(path.join(opentax, 'current-release.json'), JSON.stringify({
    release_state: 'promoted', validation_state: 'current', validation_status: 'current', generation_id: generation,
    manifest_checksum: manifestChecksum, live_evidence: artifactEvidence,
  }));
  fs.writeFileSync(reportPath, JSON.stringify({
    status: 'current', mode: 'live', test_count: 120, passed_count: 120,
    failed_count: 0, skipped_count: 0, endpoint: 'https://openfin-mcp.y2kthr.workers.dev/mcp',
    deployment_commit: commit, generation_id: generation, manifest_checksum: manifestChecksum,
    fixture_checksum: fixtureChecksum, loaded_index_checksum: searchIndexChecksum, source_status_checksum: sourceStatusChecksum,
    checked_at: '2026-08-31T00:00:00.000Z',
  }));
  const result = spawnSync(process.execPath, [
    `${root}/scripts/knowledge/publish-promoted-live-evidence.mjs`, '--docs', docs,
    '--report', reportPath, '--expected-deployment-commit', commit,
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const pointer = JSON.parse(fs.readFileSync(path.join(opentax, 'current-release.json'), 'utf8'));
  const published = JSON.parse(fs.readFileSync(path.join(opentax, 'live-regression-production-current.json'), 'utf8'));
  assert.deepEqual(pointer.manifest_live_evidence, artifactEvidence);
  assert.equal(pointer.live_evidence.id, 'openfin-live-regression-production-current');
  assert.equal(pointer.live_evidence_url, 'https://jhny-kor.github.io/OpenFin/opentax/live-regression-production-current.json');
  assert.equal(published.endpoint, 'https://openfin-mcp.y2kthr.workers.dev/mcp');
  assert.equal(published.validation_status, 'current');
  assert.equal(pointer.production_live_evidence.export_checksum, sha256(published).slice(7));

  fs.writeFileSync(reportPath, JSON.stringify({ ...published, validation_status: 'failed' }));
  const failedStatus = spawnSync(process.execPath, [
    `${root}/scripts/knowledge/publish-promoted-live-evidence.mjs`, '--docs', docs,
    '--report', reportPath, '--expected-deployment-commit', commit,
  ], { encoding: 'utf8' });
  assert.notEqual(failedStatus.status, 0);
  assert.match(failedStatus.stderr, /validation status must be current/);

  fs.writeFileSync(reportPath, JSON.stringify({ ...published, validation_status: 'current' }));
  fs.writeFileSync(path.join(opentax, 'finance-ontology-manifest.json'), JSON.stringify({ ...manifestInput, generation_id: 'tampered', manifest_checksum: manifestChecksum }));
  const tampered = spawnSync(process.execPath, [
    `${root}/scripts/knowledge/publish-promoted-live-evidence.mjs`, '--docs', docs,
    '--report', reportPath, '--expected-deployment-commit', commit,
  ], { encoding: 'utf8' });
  assert.notEqual(tampered.status, 0);
  assert.match(tampered.stderr, /manifest checksum mismatch/);
});

test('current release pointer separates candidate from production generations', () => {
  const manifest = read('docs/opentax/finance-ontology-manifest.json');
  const pointer = read('docs/opentax/current-release.json');
  assert.equal(pointer.production_commit, manifest.production_commit);
  assert.ok(['candidate', 'promoted'].includes(pointer.release_state));
  assert.equal(pointer.candidate_commit, pointer.release_candidate_commit);
  assert.ok(pointer.candidate_generation, 'candidate_generation is required');
  assert.ok(pointer.deployed_at, 'deployed_at is required');
  assert.equal(pointer.deployed_at, pointer.production_deployed_at);
  if (pointer.release_state === 'promoted') {
    assert.equal(pointer.deployed_at, manifest.production_deployed_at);
    assert.ok(pointer.promoted_at);
    assert.ok(pointer.validation_at_promotion);
  } else {
    assert.equal(pointer.candidate_generation, manifest.generation_id);
    assert.equal(pointer.promoted_at, null);
  }
  assert.ok(pointer.validation_state);
  assert.ok(pointer.last_smoke_status);
  assert.ok(pointer.last_live_status);
  if (pointer.release_state === 'promoted') assert.ok(pointer.rollback_target);
  else assert.equal(pointer.rollback_target, null);
  if (pointer.release_state === 'promoted') {
    assert.equal(pointer.generation_id, pointer.production_generation);
    assert.equal(pointer.pages_generation, pointer.production_generation);
    assert.equal(pointer.worker_generation, pointer.production_generation);
  }
  assert.match(pointer.manifest_checksum, /^[0-9a-f]{64}$/);
  assert.match(pointer.search_index_checksum, /^[0-9a-f]{64}$/);
  assert.match(pointer.source_status_checksum, /^[0-9a-f]{64}$/);
  for (const field of ['validation_at_promotion', 'latest_runtime_attempt', 'last_successful_runtime_attempt', 'operational_status', 'rollback_history_url']) {
    assert.ok(Object.hasOwn(pointer, field), `release pointer field missing: ${field}`);
  }
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
  assert.equal(Object.hasOwn(manifest.search_index || {}, 'quality_summary'), false);
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

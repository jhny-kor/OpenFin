import fs from 'node:fs';
import path from 'node:path';
import { ROOT, PUBLIC_BASE, json } from './common.mjs';

const local = json(process.env.OPENFIN_LOCAL_MANIFEST_PATH || path.join(ROOT, 'docs/opentax/finance-ontology-manifest.json'));
const pagesUrl = process.env.OPENFIN_PAGES_MANIFEST_URL || `${PUBLIC_BASE}/finance-ontology-manifest.json`;
const pointerUrl = process.env.OPENFIN_PAGES_POINTER_URL || `${PUBLIC_BASE}/current-release.json`;
const workerUrl = process.env.OPENFIN_WORKER_HEALTH_URL || 'https://openfin-mcp.y2kthr.workers.dev/health';
const liveEvidenceUrl = process.env.OPENFIN_LIVE_EVIDENCE_URL;
const expectedWorkerManifestUrl = process.env.OPENFIN_EXPECTED_WORKER_MANIFEST_URL;
const canonicalManifestUrl = process.env.OPENFIN_CANONICAL_MANIFEST_URL;
const expectedCommit = process.argv.includes('--expected-deployment-commit') ? process.argv[process.argv.indexOf('--expected-deployment-commit') + 1] : process.env.OPENFIN_DEPLOYMENT_COMMIT;
const attempts = Number(process.env.OPENFIN_PARITY_ATTEMPTS || 60);
const delayMs = Number(process.env.OPENFIN_PARITY_DELAY_MS || 5000);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const contractKeys = ['generation_id', 'deployment_commit', 'canonical_content_checksum', 'search_index_checksum', 'source_status_checksum', 'release_policy_checksum', 'capability_status_checksum', 'fixture_checksum', 'readiness_schema_version'];
const withCacheBust = (url, attempt) => `${url}${url.includes('?') ? '&' : '?'}openfin_parity=${Date.now()}-${attempt}`;
const getJson = async (url, attempt) => {
  const response = await fetch(withCacheBust(url, attempt), { headers: { accept: 'application/json', 'cache-control': 'no-cache' } });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
};
const values = ({ artifact_contract: contract = {}, generation_id, deployment_commit }) => ({ ...contract, generation_id: contract.generation_id ?? generation_id ?? null, deployment_commit: contract.deployment_commit ?? deployment_commit ?? null });
const expected = values(local);
const mismatch = (label, actual) => contractKeys.filter(key => (actual[key] ?? null) !== (expected[key] ?? null)).map(key => `${label}.${key}: expected ${expected[key] ?? null}, got ${actual[key] ?? null}`);
const liveKeys = ['status', 'mode', 'generation_id', 'deployment_commit', 'fixture_checksum', 'test_count', 'passed_count', 'failed_count', 'skipped_count'];
const liveMismatch = (actual, expected) => liveKeys.filter(key => (actual?.[key] ?? null) !== (expected?.[key] ?? null)).map(key => `live.${key}: expected ${expected?.[key] ?? null}, got ${actual?.[key] ?? null}`);
let lastErrors = [];
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const [pages, health, pointer] = await Promise.all([getJson(pagesUrl, attempt), getJson(workerUrl, attempt), getJson(pointerUrl, attempt)]);
    const evidencePath = process.env.OPENFIN_LIVE_EVIDENCE_PATH || path.join(ROOT, 'evidence/live-regression/current.json');
    const live = fs.existsSync(evidencePath) ? json(evidencePath) : {};
    const liveUrl = liveEvidenceUrl || pages.live_regression_evidence?.url || `${PUBLIC_BASE}/live-regression-current.json`;
    const publicLive = await getJson(liveUrl, attempt);
    const errors = [...mismatch('pages', values(pages)), ...mismatch('worker', values(health)), ...liveMismatch(publicLive, live)];
    if (health.deployment_commit !== expected.deployment_commit) errors.push(`worker.deployment_commit: expected ${expected.deployment_commit}, got ${health.deployment_commit ?? null}`);
    if (health.manifest_deployment_commit !== expected.deployment_commit) errors.push(`worker.manifest_deployment_commit: expected ${expected.deployment_commit}, got ${health.manifest_deployment_commit ?? null}`);
    if (expectedWorkerManifestUrl && health.finance_manifest_url !== expectedWorkerManifestUrl) errors.push(`worker.finance_manifest_url: expected ${expectedWorkerManifestUrl}, got ${health.finance_manifest_url ?? null}`);
    if (canonicalManifestUrl && pointer.manifest_url !== canonicalManifestUrl) errors.push(`pointer.manifest_url: expected ${canonicalManifestUrl}, got ${pointer.manifest_url ?? null}`);
    if (pointer.generation_id !== expected.generation_id) errors.push(`pointer.generation_id: expected ${expected.generation_id}, got ${pointer.generation_id ?? null}`);
    if (pointer.production_commit !== expected.deployment_commit) errors.push(`pointer.production_commit: expected ${expected.deployment_commit}, got ${pointer.production_commit ?? null}`);
    if (pointer.production_generation !== expected.generation_id) errors.push(`pointer.production_generation: expected ${expected.generation_id}, got ${pointer.production_generation ?? null}`);
    if (pointer.pages_generation !== expected.generation_id) errors.push(`pointer.pages_generation: expected ${expected.generation_id}, got ${pointer.pages_generation ?? null}`);
    if (pointer.worker_generation !== expected.generation_id) errors.push(`pointer.worker_generation: expected ${expected.generation_id}, got ${pointer.worker_generation ?? null}`);
    if (pointer.manifest_checksum !== local.manifest_checksum) errors.push(`pointer.manifest_checksum: expected ${local.manifest_checksum ?? null}, got ${pointer.manifest_checksum ?? null}`);
    if (pointer.search_index_checksum !== expected.search_index_checksum) errors.push(`pointer.search_index_checksum: expected ${expected.search_index_checksum ?? null}, got ${pointer.search_index_checksum ?? null}`);
    if (pointer.source_status_checksum !== expected.source_status_checksum) errors.push(`pointer.source_status_checksum: expected ${expected.source_status_checksum ?? null}, got ${pointer.source_status_checksum ?? null}`);
    if (pointer.validation_status !== 'current') errors.push(`pointer.validation_status: expected current, got ${pointer.validation_status ?? null}`);
    if (publicLive.validation_status !== 'current') errors.push(`live.validation_status: expected current, got ${publicLive.validation_status ?? null}`);
    if (expectedCommit && expected.deployment_commit !== expectedCommit) errors.push(`repository.deployment_commit: expected ${expectedCommit}, got ${expected.deployment_commit}`);
    if ((live.generation_id ?? null) !== expected.generation_id) errors.push(`live.generation_id: expected ${expected.generation_id}, got ${live.generation_id ?? null}`);
    if ((live.fixture_checksum ?? null) !== expected.fixture_checksum) errors.push(`live.fixture_checksum: expected ${expected.fixture_checksum ?? null}, got ${live.fixture_checksum ?? null}`);
    if (!errors.length) {
      console.log(JSON.stringify({ ok: true, attempt, pages_url: pagesUrl, pointer_url: pointerUrl, worker_url: workerUrl, artifact_contract: expected }, null, 2));
      process.exit(0);
    }
    lastErrors = errors;
  } catch (error) {
    lastErrors = [error instanceof Error ? error.message : String(error)];
  }
  if (attempt < attempts) await sleep(delayMs);
}
console.error(JSON.stringify({ ok: false, pages_url: pagesUrl, pointer_url: pointerUrl, worker_url: workerUrl, errors: lastErrors }, null, 2));
process.exitCode = 1;

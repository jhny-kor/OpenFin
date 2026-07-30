import fs from 'node:fs';
import path from 'node:path';
import { ROOT, PUBLIC_BASE, json } from './common.mjs';

const local = json(path.join(ROOT, 'docs/opentax/finance-ontology-manifest.json'));
const pagesUrl = process.env.OPENFIN_PAGES_MANIFEST_URL || `${PUBLIC_BASE}/finance-ontology-manifest.json`;
const workerUrl = process.env.OPENFIN_WORKER_HEALTH_URL || 'https://openfin-mcp.y2kthr.workers.dev/health';
const expectedCommit = process.argv.includes('--expected-deployment-commit') ? process.argv[process.argv.indexOf('--expected-deployment-commit') + 1] : process.env.OPENFIN_DEPLOYMENT_COMMIT;
const attempts = Number(process.env.OPENFIN_PARITY_ATTEMPTS || 60);
const delayMs = Number(process.env.OPENFIN_PARITY_DELAY_MS || 5000);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const contractKeys = ['generation_id', 'deployment_commit', 'canonical_content_checksum', 'search_index_checksum', 'source_status_checksum', 'release_policy_checksum', 'fixture_checksum', 'readiness_schema_version'];
const withCacheBust = (url, attempt) => `${url}${url.includes('?') ? '&' : '?'}openfin_parity=${Date.now()}-${attempt}`;
const getJson = async (url, attempt) => {
  const response = await fetch(withCacheBust(url, attempt), { headers: { accept: 'application/json', 'cache-control': 'no-cache' } });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
};
const values = ({ artifact_contract: contract = {}, generation_id, deployment_commit }) => ({ ...contract, generation_id: contract.generation_id ?? generation_id ?? null, deployment_commit: contract.deployment_commit ?? deployment_commit ?? null });
const expected = values(local);
const mismatch = (label, actual) => contractKeys.filter(key => (actual[key] ?? null) !== (expected[key] ?? null)).map(key => `${label}.${key}: expected ${expected[key] ?? null}, got ${actual[key] ?? null}`);
let lastErrors = [];
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    const [pages, health] = await Promise.all([getJson(pagesUrl, attempt), getJson(workerUrl, attempt)]);
    const evidencePath = path.join(ROOT, 'evidence/live-regression/current.json');
    const live = fs.existsSync(evidencePath) ? json(evidencePath) : {};
    const errors = [...mismatch('pages', values(pages)), ...mismatch('worker', values(health))];
    if (expectedCommit && expected.deployment_commit !== expectedCommit) errors.push(`repository.deployment_commit: expected ${expectedCommit}, got ${expected.deployment_commit}`);
    if ((live.generation_id ?? null) !== expected.generation_id) errors.push(`live.generation_id: expected ${expected.generation_id}, got ${live.generation_id ?? null}`);
    if ((live.fixture_checksum ?? null) !== expected.fixture_checksum) errors.push(`live.fixture_checksum: expected ${expected.fixture_checksum ?? null}, got ${live.fixture_checksum ?? null}`);
    if (!errors.length) {
      console.log(JSON.stringify({ ok: true, attempt, pages_url: pagesUrl, worker_url: workerUrl, artifact_contract: expected }, null, 2));
      process.exit(0);
    }
    lastErrors = errors;
  } catch (error) {
    lastErrors = [error instanceof Error ? error.message : String(error)];
  }
  if (attempt < attempts) await sleep(delayMs);
}
console.error(JSON.stringify({ ok: false, pages_url: pagesUrl, worker_url: workerUrl, errors: lastErrors }, null, 2));
process.exitCode = 1;

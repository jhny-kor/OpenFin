import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('legacy financial export counts are projections of canonical domain readiness', () => {
  const manifest = read('docs/opentax/finance-ontology-manifest.json');
  for (const [domain, file] of Object.entries({ deposit: 'korea-deposit-products-ontology-2026.json', saving: 'korea-saving-products-ontology-2026.json' })) {
    const summary = read(`docs/opentax/${file}`).quality_summary;
    const canonical = manifest.domain_readiness[domain];
    for (const key of ['structural_candidate_count', 'value_complete_candidate_count', 'field_verified_candidate_count', 'runtime_eligible_candidate_count', 'public_candidate_count']) assert.equal(summary[key], canonical[key], `${domain}.${key}`);
    assert.equal(summary.comparison_data, canonical.status);
    assert.equal(summary.readiness.comparison_data, canonical.status);
    assert.equal(summary.deprecated, true);
  }
});

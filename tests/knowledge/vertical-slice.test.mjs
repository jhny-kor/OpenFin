import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = new URL('../..', import.meta.url).pathname;

test('vertical slice audit keeps deposit and saving verification fail-closed', () => {
  const output = path.join(root, 'evidence/vertical-slice/vertical-slice-report.json');
  execFileSync('node', ['scripts/knowledge/vertical-slice-report.mjs'], { cwd: root, encoding: 'utf8', maxBuffer: 10_000_000 });
  const report = JSON.parse(fs.readFileSync(output, 'utf8'));
  for (const domain of ['deposit', 'saving']) {
    const state = report.domains[domain];
    assert.ok(state.structural_candidate_count >= state.value_complete_candidate_count);
    assert.ok(state.value_complete_candidate_count >= state.field_assertion_candidate_count);
    assert.ok(state.field_assertion_candidate_count >= state.official_field_assertion_candidate_count);
    assert.ok(state.official_field_assertion_candidate_count >= state.field_verified_candidate_count);
    assert.ok(state.field_verified_candidate_count >= state.runtime_eligible_candidate_count);
    assert.equal(state.status, 'blocked');
  }
  assert.equal(report.recommendation_enabled, false);
});

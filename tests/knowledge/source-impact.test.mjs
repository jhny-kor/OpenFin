import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { execFileSync } from 'node:child_process';

const root = new URL('../..', import.meta.url).pathname;

test('source impact is fail-closed for stale, unreachable, and collection failure sources', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openfin-source-impact-'));
  try {
    const statusPath = path.join(tempDir, 'status.json');
    const outputPath = path.join(tempDir, 'impact.json');
    fs.writeFileSync(statusPath, JSON.stringify({ results: [
      { id: 'source.bccard.check-card-list', status: 'stale', freshness_status: 'stale' },
      { id: 'source.bccard.credit-card-list', status: 'unreachable', freshness_status: 'stale' },
      { id: 'source.nhuf.housing-subscription', status: 'collection_failure', freshness_status: 'stale' },
    ] }));
    execFileSync('node', ['scripts/knowledge/source-impact-report.mjs', '--status-report', statusPath, '--output', outputPath], { cwd: root, encoding: 'utf8' });
    const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    assert.equal(report.review_source_count, 3);
    assert.equal(report.sources.length, 3);
    for (const source of report.sources) {
      assert.ok(Array.isArray(source.affected_item_ids));
      assert.equal(source.affected_item_count, source.affected_item_ids.length);
    }
    assert.ok(report.sources.every((source) => source.affected_item_count > 0));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

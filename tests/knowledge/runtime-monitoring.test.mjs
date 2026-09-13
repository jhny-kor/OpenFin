import assert from 'node:assert/strict';
import test from 'node:test';
import { runtimeMonitoring } from '../../scripts/knowledge/runtime-monitoring.mjs';

test('monitor failures remain separate from immutable release evidence', () => {
  const report = { checked_at: '2026-09-11T00:00:00Z', status: 'current', runtime_version: 'openfin-mcp-release', test_count: 120, passed_count: 120, failed_count: 0, skipped_count: 0 };
  assert.equal(runtimeMonitoring(report).operational_status, 'operational');
  assert.equal(runtimeMonitoring({ ...report, status: 'failed', passed_count: 112, failed_count: 8 }).operational_status, 'degraded');
  assert.equal(runtimeMonitoring({ ...report, retry_errors: ['503'] }).operational_status, 'degraded');
  assert.equal(runtimeMonitoring(report).release_pointer_mutated, false);
  assert.equal(runtimeMonitoring({ ...report, runtime_version: 'openfin-mcp-dev' }).operational_status, 'degraded');
  assert.throws(() => runtimeMonitoring({ ...report, failed_count: 8 }), /counters/);
});

test("a recovered transport failure remains degraded", () => {
  const report = {checked_at:"2026-09-14T00:00:00Z", test_count:120,passed_count:120,failed_count:0,skipped_count:0,status:"current",runtime_version:"release",transport_error_count:1};
  assert.equal(runtimeMonitoring(report).operational_status,"degraded");
});

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeJson } from './common.mjs';

export function runtimeMonitoring(report, evidence = {}) {
  if (!report || !Number.isFinite(Date.parse(report.checked_at))) throw new Error('monitor report requires checked_at');
  const counters = ['test_count', 'passed_count', 'failed_count', 'skipped_count'];
  if (counters.some(key => !Number.isInteger(report[key]) || report[key] < 0) || report.test_count === 0 || report.passed_count + report.failed_count + report.skipped_count !== report.test_count) throw new Error('invalid monitor counters');
  const releaseRuntime = typeof report.runtime_version === 'string' && report.runtime_version.trim() && !/(?:^|[-_])dev(?:$|[-_])/i.test(report.runtime_version);
  const passed = releaseRuntime && report.status === 'current' && report.passed_count === report.test_count && report.failed_count === 0 && report.skipped_count === 0 && !(report.retry_errors?.length) && (report.transport_error_count ?? 0) === 0;
  return {
    version: 'openfin-runtime-monitoring-v1',
    checked_at: report.checked_at,
    operational_status: passed ? 'operational' : 'degraded',
    deployment_commit: report.deployment_commit ?? null,
    generation_id: report.generation_id ?? null,
    endpoint: report.endpoint ?? null,
    runtime_version: report.runtime_version ?? null,
    ...Object.fromEntries(counters.map(key => [key, report[key]])),
    transport_error_count: report.transport_error_count ?? null,
    failed_case_ids: (report.results || report.cases || []).filter(row => row.passed === false || row.status === 'failed').map(row => row.case_id),
    evidence,
    release_pointer_mutated: false,
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const arg = name => { const i = process.argv.indexOf(name); if (i < 0 || !process.argv[i + 1]) throw new Error(`${name} is required`); return process.argv[i + 1]; };
  const reportPath = arg('--report');
  writeJson(arg('--output'), runtimeMonitoring(JSON.parse(fs.readFileSync(reportPath, 'utf8')), { report_path: path.basename(reportPath), workflow_run_id: process.env.GITHUB_RUN_ID ?? null }));
}

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, DOCS, json } from './common.mjs';

const failures = [];
const manifestPath = path.join(DOCS, 'finance-ontology-manifest.json');
if (!fs.existsSync(manifestPath)) failures.push('manifest_missing');
const manifest = fs.existsSync(manifestPath) ? json(manifestPath) : {};
const live = manifest.openfin_120_live_regression || {};

function walk(value, visit, source) {
  if (!value || typeof value !== 'object') return;
  visit(value, source);
  for (const [key, child] of Object.entries(value)) walk(child, visit, `${source}.${key}`);
}

if (Object.hasOwn(manifest, 'domain_summaries')) failures.push('domain_summaries_is_not_removed');
for (const [domain, state] of Object.entries(manifest.domain_readiness || {})) {
  if (Number(state.comparison_eligible_candidate_count || 0) > Number(state.strict_option_count || 0)) failures.push(`comparison_exceeds_strict_options:${domain}`);
  if (Number(state.strict_option_count || 0) > Number(state.structural_option_count || 0)) failures.push(`strict_options_exceed_structural_options:${domain}`);
  if (Number(state.public_recommendation_candidate_count || 0) > Number(state.structural_option_count || 0)) failures.push(`public_recommendation_exceeds_structural_options:${domain}`);
}

for (const entry of manifest.quality_exports || []) {
  const file = path.join(DOCS, path.basename(entry.path || ''));
  if (!fs.existsSync(file)) continue;
  const report = json(file);
  if (!report.quality_export_live_summary) failures.push(`quality_export_live_summary_missing:${path.basename(file)}`);
  walk(report, (value, source) => {
    const hasLiveProjection = value.live_case_count !== undefined || value.live_passed_count !== undefined || value.live_failed_count !== undefined || value.live_failure_count !== undefined || value.live_status !== undefined || value.live_test_count !== undefined;
    const count = value.live_case_count ?? value.live_test_count ?? (value.live_status !== undefined ? value.test_count : undefined);
    const passed = value.live_passed_count ?? (value.live_status !== undefined ? value.passed_count : undefined);
    const failed = value.live_failed_count ?? (value.live_status !== undefined ? value.failed_count : undefined);
    if (hasLiveProjection) {
      if (Number(count) !== Number(live.test_count)) failures.push(`live_count_mismatch:${source}`);
      if (Number(passed) !== Number(live.passed_count)) failures.push(`live_passed_mismatch:${source}`);
      if (Number(failed) !== Number(live.failed_count)) failures.push(`live_failed_mismatch:${source}`);
    }
    if (value.measurement_status === 'not_measured' && /zero\s*(change|delta)|verified|parity/i.test(String(value.note || value.reason || ''))) failures.push(`unmeasured_claim:${source}`);
    if (value.parity_evidence === null && /verified|passed/i.test(String(value.note || value.reason || ''))) failures.push(`null_parity_claim:${source}`);
    if (value.comparison_data === 'limited_public_ready' && manifest.comparison_release_status === 'blocked') failures.push(`legacy_comparison_ready_while_blocked:${source}`);
  }, path.basename(file));
}

const recommendationPaths = [
  path.join(ROOT, 'mcp/src/recommendation'),
  path.join(ROOT, 'mcp/src/tools/recommend-handler.ts'),
];
for (const root of recommendationPaths) {
  const files = fs.existsSync(root) && fs.statSync(root).isDirectory() ? fs.readdirSync(root).filter(file => file.endsWith('.ts')).map(file => path.join(root, file)) : [root];
  for (const file of files) if (fs.existsSync(file)) {
    const text = fs.readFileSync(file, 'utf8');
    if (/new Date\s*\(|Date\.now\s*\(/.test(text)) failures.push(`recommendation_clock_fallback:${path.relative(ROOT, file)}`);
  }
}

const result = { ok: failures.length === 0, live_regression: { test_count: live.test_count ?? 0, passed_count: live.passed_count ?? 0, failed_count: live.failed_count ?? 0 }, failures };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;

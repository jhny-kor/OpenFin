import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const arg = name => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : '';
};
const reportFile = arg('--report');
const outputFile = arg('--output');
if (!outputFile) throw new Error('--output is required');
const report = reportFile && fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : null;
const reviewCount = Number(arg('--review-count') || (report ? (report.results || []).filter(item => item.status !== 'unchanged').length : 0));
const sourceCheckOutcome = arg('--source-check-outcome');
const delivery = arg('--delivery');
const reasonCode = sourceCheckOutcome !== 'success'
  ? 'SOURCE_CHECK_FAILED'
  : delivery === 'DELIVERY_FAILED'
    ? 'DELIVERY_FAILED'
    : reviewCount > 0
      ? 'REVIEW_REQUIRED'
      : 'NO_CHANGES';
const summary = {
  generated_at: new Date().toISOString(),
  reason_code: reasonCode,
  source_check: sourceCheckOutcome || 'unknown',
  review_count: reviewCount,
  delivery: delivery || (reviewCount > 0 ? 'not_attempted' : 'not_required'),
  report_file: reportFile || null,
  impact_file: arg('--impact-file') || null,
  source_count: report?.source_count ?? null,
  status_counts: report?.status_counts ?? {},
};
fs.mkdirSync(path.dirname(path.resolve(outputFile)), { recursive: true });
fs.writeFileSync(path.resolve(outputFile), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));

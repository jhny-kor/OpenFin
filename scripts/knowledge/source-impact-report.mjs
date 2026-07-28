import fs from 'node:fs';
import path from 'node:path';
import { DOCS, json } from './common.mjs';

const args = process.argv.slice(2);
const arg = name => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const statusReportPath = arg('--status-report');
const outputPath = arg('--output');
if (!statusReportPath || !outputPath) {
  console.error('Usage: node scripts/knowledge/source-impact-report.mjs --status-report <file> --output <file>');
  process.exit(2);
}

const statusReport = json(path.resolve(statusReportPath));
const reviewStatuses = new Set(['changed', 'conflict', 'retired']);
const sourceResults = (statusReport.results || [])
  .filter(result => reviewStatuses.has(result.status))
  .sort((left, right) => String(left.id).localeCompare(String(right.id)));
const affectedSourceIds = new Set(sourceResults.map(result => result.id));
const provenanceIndex = json(path.join(DOCS, 'openfin-provenance-index-2026.json'));
const affectedItems = new Map();

for (const shard of provenanceIndex.shards || []) {
  const payload = json(path.join(DOCS, path.basename(shard.path || shard.url || '')));
  for (const item of payload.items || []) {
    const assertions = (item.provenance || []).filter(assertion => affectedSourceIds.has(assertion.source_id));
    if (!assertions.length) continue;
    const fields = [...new Set(assertions.flatMap(assertion => assertion.supported_fields || []))].sort();
    affectedItems.set(item.id, {
      id: item.id,
      source_ids: [...new Set(assertions.map(assertion => assertion.source_id))].sort(),
      supported_fields: fields,
      record_checksum: item.record_checksum || null,
    });
  }
}

const output = {
  version: 'OPENFIN-SOURCE-IMPACT-2026.07.28.1',
  generated_at: statusReport.generated_at || null,
  review_source_count: sourceResults.length,
  affected_item_count: affectedItems.size,
  sources: sourceResults.map(result => ({
    source_id: result.id,
    status: result.status,
    verification_status: result.verification_status || null,
    canonical_url: result.urls?.canonical || result.canonical_url || null,
    accepted_checksum: result.checksum || null,
    observed_checksum: result.observed_checksum || null,
    checked_at: result.checked_at || null,
  })),
  affected_items: [...affectedItems.values()].sort((left, right) => left.id.localeCompare(right.id)),
};

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ review_source_count: output.review_source_count, affected_item_count: output.affected_item_count, output: path.resolve(outputPath) }, null, 2));

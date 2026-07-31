import fs from 'node:fs';
import path from 'node:path';
import { KNOWLEDGE, sha256 } from './common.mjs';

let changedFiles = 0;
let changedAssertions = 0;
const walk = directory => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.jsonl')) migrate(file);
  }
};
const migrate = file => {
  const records = fs.readFileSync(file, 'utf8').split('\n');
  let changed = false;
  const output = records.map(line => {
    if (!line.trim()) return line;
    const record = JSON.parse(line);
    if (!Array.isArray(record.field_assertions)) return line;
    let recordChanged = false;
    const fallback = record.observed_at ?? record.source_modified_at ?? record.collected_at ?? record.reviewed_at ?? null;
    for (const assertion of record.field_assertions) {
      if (!assertion || typeof assertion !== 'object') continue;
      if (!Object.hasOwn(assertion, 'valid_from')) { assertion.valid_from = assertion.observed_at ?? assertion.collected_at ?? fallback; recordChanged = true; changedAssertions += 1; }
      if (!Object.hasOwn(assertion, 'valid_to')) { assertion.valid_to = null; recordChanged = true; changedAssertions += 1; }
    }
    const expectedChecksum = record.record_checksum ? sha256({ ...record, provenance: undefined, record_checksum: undefined }) : null;
    if (expectedChecksum && record.record_checksum !== expectedChecksum) { record.record_checksum = expectedChecksum; recordChanged = true; }
    if (recordChanged) changed = true;
    return recordChanged ? JSON.stringify(record) : line;
  });
  if (changed) {
    fs.writeFileSync(file, output.join('\n'));
    changedFiles += 1;
  }
};

walk(KNOWLEDGE);
console.log(JSON.stringify({ changed_files: changedFiles, changed_assertions: changedAssertions }, null, 2));

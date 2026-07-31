import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, json, writeJson } from './common.mjs';

// The legacy catalog is immutable here. Strict decision objects are generated
// separately so a missing assertion can never be hidden by a permissive row.
const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts/knowledge/build-decision-snapshots.mjs')], {
  cwd: ROOT, encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'],
});
if (result.status !== 0) process.exit(result.status ?? 1);
const report = JSON.parse(result.stdout.slice(result.stdout.indexOf('{')));
writeJson(path.join(ROOT, 'evidence/vertical-slice/selection.json'), {
  version: 'openfin-vertical-slice-selection-v2',
  targets: { deposit: 20, saving: 20 },
  selected: Object.fromEntries(Object.entries(report.domains).map(([domain, state]) => [domain, state.ids])),
  candidates: Object.fromEntries(Object.entries(report.domains).map(([domain, state]) => [domain, state.strict_offer_count])),
  blocker: report.blocker,
});
console.log(JSON.stringify(report, null, 2));

import path from 'node:path';
import { json, sha256, writeJson } from './common.mjs';

const args = process.argv.slice(2);
const value = name => {
  const index = args.indexOf(name);
  if (index < 0 || !args[index + 1]) throw new Error(`${name} is required`);
  return args[index + 1];
};

const docs = path.resolve(value('--docs'));
const reportPath = path.resolve(value('--report'));
const expectedCommit = value('--expected-deployment-commit');
const pointerPath = path.join(docs, 'opentax/current-release.json');
const manifestPath = path.join(docs, 'opentax/finance-ontology-manifest.json');
const outputName = 'live-regression-production-current.json';
const outputPath = path.join(docs, `opentax/${outputName}`);
const publicUrl = `https://jhny-kor.github.io/OpenFin/opentax/${outputName}`;
const report = json(reportPath);
const pointer = json(pointerPath);
const manifest = json(manifestPath);
const sameJson = (left, right) => left != null && right != null && sha256(left) === sha256(right);
const { manifest_checksum: manifestChecksum, ...manifestChecksumInput } = manifest;
const manifestEvidence = manifest.live_regression_evidence;
const pointerManifestEvidence = pointer.manifest_live_evidence || pointer.live_evidence;

const checks = [
  [report.status === 'current', 'promoted live status must be current'],
  [report.validation_status == null || report.validation_status === 'current', 'promoted live validation status must be current when present'],
  [report.mode === 'live', 'promoted live mode must be live'],
  [report.test_count === 120 && report.passed_count === 120, 'promoted live result must pass 120/120'],
  [report.failed_count === 0 && report.skipped_count === 0, 'promoted live result must have zero failures and skips'],
  [report.endpoint === 'https://openfin-mcp.y2kthr.workers.dev/mcp', 'promoted live endpoint must be production'],
  [report.deployment_commit === expectedCommit, 'promoted deployment commit mismatch'],
  [manifestChecksum === sha256(manifestChecksumInput).slice(7), 'manifest checksum mismatch'],
  [pointer.manifest_checksum === manifestChecksum, 'release pointer manifest checksum mismatch'],
  [sameJson(pointerManifestEvidence, manifestEvidence), 'release pointer manifest evidence mismatch'],
  [report.generation_id === manifest.generation_id && pointer.generation_id === manifest.generation_id, 'promoted generation mismatch'],
  [report.deployment_commit === manifest.artifact_contract?.deployment_commit, 'promoted artifact commit mismatch'],
  [report.manifest_checksum === manifestChecksum, 'promoted manifest checksum mismatch'],
  [report.fixture_checksum === manifest.artifact_contract?.fixture_checksum, 'promoted fixture checksum mismatch'],
  [report.loaded_index_checksum === manifest.artifact_contract?.search_index_checksum, 'promoted search index checksum mismatch'],
  [report.source_status_checksum === manifest.artifact_contract?.source_status_checksum, 'promoted source status checksum mismatch'],
  [pointer.release_state === 'promoted' && pointer.validation_state === 'current' && pointer.validation_status === 'current', 'release pointer is not promoted/current'],
];
for (const [ok, message] of checks) if (!ok) throw new Error(message);

const published = {
  ...report,
  validation_status: 'current',
  evidence_path: `opentax/${outputName}`,
  source_evidence_path: `actions:openfin-live-promoted-${expectedCommit}`,
};
writeJson(outputPath, published);

const productionEvidence = {
  id: 'openfin-live-regression-production-current',
  domain: 'quality',
  path: `opentax/${outputName}`,
  url: publicUrl,
  web_url: publicUrl,
  item_count: 1,
  generated_at: report.checked_at,
  export_checksum: sha256(published).slice(7),
  source_path: published.source_evidence_path,
};
writeJson(pointerPath, {
  ...pointer,
  manifest_live_evidence: manifestEvidence,
  production_live_evidence: productionEvidence,
  live_evidence: productionEvidence,
  live_evidence_path: productionEvidence.path,
  live_evidence_url: productionEvidence.url,
});

console.log(JSON.stringify({ output: outputPath, endpoint: report.endpoint, deployment_commit: expectedCommit, generation_id: report.generation_id }, null, 2));

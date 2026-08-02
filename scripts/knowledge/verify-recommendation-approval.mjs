import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { ROOT, json, stable, candidateSetChecksum, qualitySuiteChecksum } from './common.mjs';

const schema = json(path.join(ROOT, 'schemas/recommendation-approval-receipt.schema.json'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const file = process.argv[2] || process.env.RECOMMENDATION_APPROVAL_RECEIPT;
if (!file) { console.log(JSON.stringify({ ok: false, status: 'missing', reason: 'APPROVAL_RECEIPT_PATH_REQUIRED' }, null, 2)); process.exit(1); }
const resolved = path.isAbsolute(file) ? file : path.join(ROOT, file);
if (!fs.existsSync(resolved)) { console.log(JSON.stringify({ ok: false, status: 'missing', path: resolved, reason: 'APPROVAL_RECEIPT_MISSING' }, null, 2)); process.exit(1); }
const receipt = json(resolved);
const manifestPath = path.join(ROOT, 'docs/opentax/finance-ontology-manifest.json');
const manifest = fs.existsSync(manifestPath) ? json(manifestPath) : {};
const artifactContract = manifest.artifact_contract && typeof manifest.artifact_contract === 'object' ? manifest.artifact_contract : {};
const expected = {
  generation_id: manifest.generation_id,
  candidate_set_checksum: candidateSetChecksum(),
  policy_version: 'openfin-recommendation-policy-v1',
  ranking_version: 'openfin-ranking-v2',
  calculator_version: 'openfin-calculator-v1',
  quality_suite_checksum: qualitySuiteChecksum(),
};
const mismatches = Object.entries(expected).filter(([key, value]) => value && receipt[key] !== value).map(([key]) => `${key}_mismatch`);
if (artifactContract.candidate_set_checksum && artifactContract.candidate_set_checksum !== expected.candidate_set_checksum) mismatches.push('artifact_candidate_set_checksum_mismatch');
if (artifactContract.quality_suite_transitive_checksum && artifactContract.quality_suite_transitive_checksum !== expected.quality_suite_checksum) mismatches.push('artifact_quality_suite_checksum_mismatch');
const reviewerReady = ['reviewer', 'reviewer_role', 'reviewer_permission', 'reviewer_signature'].every(key => typeof receipt[key] === 'string' && receipt[key].length > 0);
const signatureSecret = process.env.OWNER_PILOT_REVIEWER_SIGNATURE_SECRET;
const signedKeys = ['approval_id', 'domain', 'mode', 'generation_id', 'candidate_set_checksum', 'policy_version', 'ranking_version', 'calculator_version', 'quality_suite_checksum', 'approved_at', 'expires_at', 'reviewer', 'reviewer_role', 'reviewer_permission', 'rollback_generation_id'];
const signedPayload = Object.fromEntries(signedKeys.map(key => [key, receipt[key]]));
const expectedSignature = signatureSecret && receipt.reviewer_signature_algorithm === 'HMAC-SHA256'
  ? `hmac-sha256:${crypto.createHmac('sha256', signatureSecret).update(stable(signedPayload)).digest('base64url')}`
  : null;
if (receipt.reviewer_signature_algorithm === 'HMAC-SHA256' && (!signatureSecret || receipt.reviewer_signature !== expectedSignature)) mismatches.push('reviewer_signature_invalid');
const ok = validate(receipt) && reviewerReady && Date.parse(receipt.expires_at) > Date.parse(receipt.approved_at) && Date.parse(receipt.expires_at) > Date.now() && !mismatches.length;
console.log(JSON.stringify({ ok, status: ok ? 'valid' : 'invalid', path: path.relative(ROOT, resolved), expected, mismatches, errors: validate.errors || [] }, null, 2));
if (!ok) process.exit(1);

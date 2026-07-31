import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { ROOT, json, sha256 } from './common.mjs';

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
const offersPath = path.join(ROOT, 'knowledge/30-financial-products/banking/_decision');
const optionIds = fs.existsSync(offersPath) ? fs.readdirSync(offersPath).filter(name => name.endsWith('.jsonl')).flatMap(name => fs.readFileSync(path.join(offersPath, name), 'utf8').split('\n').filter(Boolean).map(JSON.parse)).flatMap(offer => (offer.options || []).map(option => option.option_id)).sort() : [];
const candidateSetChecksum = sha256(optionIds);
const qualityFixturePaths = ['tests/golden/openfin-runtime-contract-120.jsonl', 'tests/golden/openfin-comparison-live.jsonl', 'tests/golden/openfin-recommendation-shadow-live.jsonl'].map(value => path.join(ROOT, value));
const qualitySuiteChecksum = qualityFixturePaths.every(value => fs.existsSync(value)) ? sha256(qualityFixturePaths.map(value => fs.readFileSync(value, 'utf8')).join('\n')) : null;
const expected = {
  generation_id: manifest.generation_id,
  candidate_set_checksum: candidateSetChecksum,
  policy_version: 'openfin-recommendation-policy-v1',
  ranking_version: 'openfin-ranking-v2',
  calculator_version: 'openfin-calculator-v1',
  quality_suite_checksum: qualitySuiteChecksum,
};
const mismatches = Object.entries(expected).filter(([key, value]) => value && receipt[key] !== value).map(([key]) => `${key}_mismatch`);
const ok = validate(receipt) && Date.parse(receipt.expires_at) > Date.parse(receipt.approved_at) && Date.parse(receipt.expires_at) > Date.now() && !mismatches.length;
console.log(JSON.stringify({ ok, status: ok ? 'valid' : 'invalid', path: path.relative(ROOT, resolved), expected, mismatches, errors: validate.errors || [] }, null, 2));
if (!ok) process.exit(1);

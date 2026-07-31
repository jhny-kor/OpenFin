import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { ROOT, json } from './common.mjs';

const schema = json(path.join(ROOT, 'schemas/recommendation-approval-receipt.schema.json'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);
const file = process.argv[2] || process.env.RECOMMENDATION_APPROVAL_RECEIPT;
if (!file) { console.log(JSON.stringify({ ok: false, status: 'missing', reason: 'APPROVAL_RECEIPT_PATH_REQUIRED' }, null, 2)); process.exit(1); }
const resolved = path.isAbsolute(file) ? file : path.join(ROOT, file);
if (!fs.existsSync(resolved)) { console.log(JSON.stringify({ ok: false, status: 'missing', path: resolved, reason: 'APPROVAL_RECEIPT_MISSING' }, null, 2)); process.exit(1); }
const receipt = json(resolved);
const ok = validate(receipt) && Date.parse(receipt.expires_at) > Date.parse(receipt.approved_at) && Date.parse(receipt.expires_at) > Date.now();
console.log(JSON.stringify({ ok, status: ok ? 'valid' : 'invalid', path: path.relative(ROOT, resolved), errors: validate.errors || [] }, null, 2));
if (!ok) process.exit(1);

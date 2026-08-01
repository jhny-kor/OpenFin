import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { KNOWLEDGE, ROOT, json, schemaValidationChecksum } from './common.mjs';

const schemaDir = path.join(ROOT, 'schemas');
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const file of ['provenance.schema.json', 'assertion.schema.json', 'schema-validation-receipt.schema.json', 'candidate-promotion-receipt.schema.json']) ajv.addSchema(json(path.join(schemaDir, file)), file);
for (const file of ['eligibility-rule.schema.json', 'bonus-rate-rule.schema.json', 'early-termination-rule.schema.json', 'offer-option.schema.json', 'financial-offer.schema.json', 'deposit-offer.schema.json', 'saving-offer.schema.json']) ajv.addSchema(json(path.join(schemaDir, 'types', file)), `types/${file}`);
const validateOption = ajv.getSchema('types/offer-option.schema.json');
const validateOffer = ajv.getSchema('types/financial-offer.schema.json');
const decisionDir = path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision');
const now = process.env.OPENFIN_SCHEMA_VALIDATED_AT || new Date().toISOString();
const failures = [];

for (const domain of ['deposit', 'saving']) {
  const file = path.join(decisionDir, `${domain}-offers.jsonl`);
  if (!fs.existsSync(file)) continue;
  const offers = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(JSON.parse).map(offer => ({
    ...offer,
    options: (offer.options || []).map(option => {
      const valid = Boolean(validateOption?.(option));
      const errors = valid ? undefined : (validateOption?.errors || []).map(error => `${error.instancePath || '/'} ${error.message}`);
      return {
        ...option,
        schema_validation_receipt: {
          schema_id: 'types/offer-option.schema.json',
          validator: 'ajv',
          validation_status: valid ? 'valid' : 'invalid',
          validated_at: now,
          content_checksum: schemaValidationChecksum(option),
          ...(errors?.length ? { errors } : {}),
        },
      };
    }),
  }));
  for (const offer of offers) {
    if (!validateOffer?.(offer)) failures.push(`${domain}:${offer.id}: ${(validateOffer?.errors || []).map(error => `${error.instancePath || '/'} ${error.message}`).join('; ')}`);
    for (const option of offer.options) if (option.schema_validation_receipt.validation_status !== 'valid') failures.push(`${domain}:${offer.id}:${option.option_id}: invalid option schema`);
  }
  fs.writeFileSync(file, offers.map(offer => JSON.stringify(offer)).join('\n') + (offers.length ? '\n' : ''));
}

console.log(JSON.stringify({ ok: failures.length === 0, failures, validated_at: now }, null, 2));
if (failures.length) process.exitCode = 1;

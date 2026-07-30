import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { KNOWLEDGE, ROOT, json, RELATION_KEYS } from './common.mjs';

const schemaDir = path.join(ROOT, 'schemas');
const typeRegistry = json(path.join(schemaDir, 'types/type-registry.json'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const file of ['provenance.schema.json', 'assertion.schema.json', 'source.schema.json', 'relation.schema.json', 'entity.schema.json', 'finance-ontology-manifest.schema.json', 'live-regression.schema.json']) {
  const schema = json(path.join(schemaDir, file));
  ajv.addSchema(schema, file);
}
const liveFixtureSchema = json(path.join(ROOT, 'tests/golden/openfin-120.schema.json'));
ajv.addSchema(liveFixtureSchema);
for (const file of ['bank-product.schema.json', 'deposit.schema.json', 'saving.schema.json', 'loan.schema.json', 'card-product.schema.json', 'card.schema.json', 'insurance-product.schema.json', 'insurance.schema.json', 'support-program.schema.json']) {
  ajv.addSchema(json(path.join(schemaDir, 'types', file)), `types/${file}`);
}
const validateEntity = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/entity.schema.json');
const validateSource = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/source.schema.json');
const relationValidator = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/relation.schema.json');
const validateManifest = ajv.getSchema('finance-ontology-manifest.schema.json');
const validateLiveCase = ajv.getSchema(liveFixtureSchema.$id);
const failures = [];
const liveFixturePath = path.join(ROOT, 'tests/golden/openfin-120.jsonl');
if (fs.existsSync(liveFixturePath)) {
  const liveCases = fs.readFileSync(liveFixturePath, 'utf8').split('\n').filter(Boolean).map((line, index) => {
    try { return { value: JSON.parse(line), line: index + 1 }; } catch (error) { failures.push(`${liveFixturePath}:${index + 1}: ${error.message}`); return null; }
  }).filter(Boolean);
  const liveIds = new Set();
  for (const { value, line } of liveCases) {
    if (!validateLiveCase(value)) failures.push(`${liveFixturePath}:${line}: ${ajv.errorsText(validateLiveCase.errors)}`);
    if (liveIds.has(value.case_id)) failures.push(`${liveFixturePath}:${line}: duplicate case_id ${value.case_id}`);
    liveIds.add(value.case_id);
  }
  if (liveCases.length !== 120) failures.push(`${liveFixturePath}: expected 120 cases, got ${liveCases.length}`);
}
const entities = [];
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.jsonl')) {
      for (const [index, line] of fs.readFileSync(file, 'utf8').split('\n').entries()) {
        if (!line.trim()) continue;
        try { entities.push({ value: JSON.parse(line), file: `${file}:${index + 1}` }); } catch (error) { failures.push(`${file}:${index + 1}: ${error.message}`); }
      }
    } else if (entry.name.endsWith('.md')) {
      const text = fs.readFileSync(file, 'utf8');
      if (!text.startsWith('---\n')) continue;
      const end = text.indexOf('\n---\n', 4);
      if (end < 0) { failures.push(`${file}: missing frontmatter terminator`); continue; }
      try { entities.push({ value: JSON.parse(text.slice(4, end)), file }); } catch (error) { failures.push(`${file}: ${error.message}`); }
    }
  }
};
walk(KNOWLEDGE);
for (const { value, file } of entities) {
  if (value.id?.startsWith('folder.')) continue;
  const ok = value.type === 'source' ? validateSource(value) : validateEntity(value);
  if (!ok) failures.push(`${file}: ${ajv.errorsText((value.type === 'source' ? validateSource : validateEntity).errors)}`);
  for (const relation of RELATION_KEYS) {
    const values = Array.isArray(value[relation]) ? value[relation] : value[relation] == null ? [] : [value[relation]];
    for (const to of values) {
      if (!relationValidator({ from: value.id, relation, to: String(to) })) failures.push(`${file}: invalid relation ${relation}`);
    }
  }
}
const relationEnum = JSON.stringify(typeRegistry.relation_types) !== JSON.stringify(RELATION_KEYS);
if (relationEnum) failures.push('relation registry drift: schemas/types/type-registry.json differs from common.mjs');
const entitySchema = json(path.join(schemaDir, 'entity.schema.json'));
const sourceSchema = json(path.join(schemaDir, 'source.schema.json'));
const entityEnum = entitySchema.properties?.type?.enum ?? [];
const authorityEnum = sourceSchema.properties?.authority_class?.enum ?? [];
if (JSON.stringify(entityEnum) !== JSON.stringify(typeRegistry.entity_types)) failures.push('entity registry drift: schemas/types/type-registry.json differs from entity.schema.json');
if (JSON.stringify(authorityEnum) !== JSON.stringify(typeRegistry.authority_classes)) failures.push('authority registry drift: schemas/types/type-registry.json differs from source.schema.json');
const manifestPath = path.join(ROOT, 'docs/opentax/finance-ontology-manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = json(manifestPath);
  if (!validateManifest(manifest)) failures.push(`manifest: ${ajv.errorsText(validateManifest.errors)}`);
  for (const [domain, state] of Object.entries(manifest.domain_readiness || {})) {
    const counts = ['structural_candidate_count', 'value_complete_candidate_count', 'field_verified_candidate_count', 'runtime_eligible_candidate_count', 'public_candidate_count'].map(key => Number(state[key] || 0));
    if (!(counts[2] <= counts[1] && counts[1] <= counts[0] && counts[4] <= counts[3] && counts[3] <= counts[2])) failures.push(`manifest: domain count invariant ${domain}`);
  }
}
const result = { ok: failures.length === 0, entity_count: entities.length, failures: failures.slice(0, 100) };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;

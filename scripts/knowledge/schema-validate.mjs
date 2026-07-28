import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { KNOWLEDGE, ROOT, json, RELATION_KEYS } from './common.mjs';

const schemaDir = path.join(ROOT, 'schemas');
const typeRegistry = json(path.join(schemaDir, 'types/type-registry.json'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const file of ['provenance.schema.json', 'source.schema.json', 'relation.schema.json', 'entity.schema.json']) {
  const schema = json(path.join(schemaDir, file));
  ajv.addSchema(schema, file);
}
const validateEntity = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/entity.schema.json');
const validateSource = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/source.schema.json');
const relationValidator = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/relation.schema.json');
const failures = [];
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
const result = { ok: failures.length === 0, entity_count: entities.length, failures: failures.slice(0, 100) };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;

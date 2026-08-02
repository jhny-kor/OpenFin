import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { KNOWLEDGE, ROOT, json, RELATION_KEYS, assertionIdentity, assertionSetChecksum, canonicalCandidateContent, schemaValidationChecksum, sha256 } from './common.mjs';
import { collectComparisonAssertions, collectRecommendationAssertions, resolveAssertionProfile } from './assertion-profiles.mjs';

const schemaDir = path.join(ROOT, 'schemas');
const typeRegistry = json(path.join(schemaDir, 'types/type-registry.json'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
for (const file of ['provenance.schema.json', 'assertion.schema.json', 'source.schema.json', 'relation.schema.json', 'entity.schema.json', 'finance-ontology-manifest.schema.json', 'manifest.schema.json', 'candidate-promotion-receipt.schema.json', 'source-review-receipt.schema.json', 'schema-validation-receipt.schema.json', 'decision-trace.schema.json', 'live-regression.schema.json', 'recommendation-approval-receipt.schema.json', 'financial-quality-approval-receipt.schema.json']) {
  const schema = json(path.join(schemaDir, file));
  ajv.addSchema(schema, file);
}
const liveFixtureSchema = json(path.join(ROOT, 'tests/golden/openfin-120.schema.json'));
ajv.addSchema(liveFixtureSchema);
for (const file of ['bank-product.schema.json', 'deposit.schema.json', 'saving.schema.json', 'loan.schema.json', 'card-product.schema.json', 'card.schema.json', 'insurance-product.schema.json', 'insurance.schema.json', 'support-program.schema.json', 'eligibility-rule.schema.json', 'bonus-rate-rule.schema.json', 'early-termination-rule.schema.json', 'offer-option.schema.json', 'financial-offer.schema.json', 'deposit-offer.schema.json', 'saving-offer.schema.json']) {
  ajv.addSchema(json(path.join(schemaDir, 'types', file)), `types/${file}`);
}
const validateEntity = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/entity.schema.json');
const validateSource = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/source.schema.json');
const relationValidator = ajv.getSchema('https://jhny-kor.github.io/OpenFin/schemas/relation.schema.json');
const validateManifest = ajv.getSchema('finance-ontology-manifest.schema.json');
const validateCapabilityManifest = ajv.getSchema('manifest.schema.json');
const validateApproval = ajv.getSchema('recommendation-approval-receipt.schema.json');
const validateFinancialQualityApproval = ajv.getSchema('financial-quality-approval-receipt.schema.json');
const validatePromotion = ajv.getSchema('candidate-promotion-receipt.schema.json');
const validateSourceReview = ajv.getSchema('source-review-receipt.schema.json');
const validateLiveCase = ajv.getSchema(liveFixtureSchema.$id);
const failures = [];
const decisionOffers = [];
for (const domain of ['deposit', 'saving']) {
  const file = path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision', `${domain}-offers.jsonl`);
  if (fs.existsSync(file)) decisionOffers.push(...fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(JSON.parse));
}
const optionById = new Map(decisionOffers.flatMap(offer => (offer.options || []).map(option => [option.option_id, { offer, option }])));
const validateQualityDescriptors = (descriptorName, expectedStatus) => {
  const descriptorPath = path.join(ROOT, 'tests/golden', descriptorName);
  if (!fs.existsSync(descriptorPath)) { failures.push(`${descriptorPath}: missing quality descriptor`); return; }
  const descriptors = fs.readFileSync(descriptorPath, 'utf8').split('\n').filter(Boolean).map((line, index) => {
    try { return { value: JSON.parse(line), line: index + 1 }; }
    catch (error) { failures.push(`${descriptorPath}:${index + 1}: ${error.message}`); return null; }
  }).filter(Boolean);
  const suiteIds = new Set();
  for (const { value, line } of descriptors) {
    if (!value.suite_id || suiteIds.has(value.suite_id)) failures.push(`${descriptorPath}:${line}: duplicate or missing suite_id`);
    suiteIds.add(value.suite_id);
    if (value.expected_status !== expectedStatus || !Number.isInteger(value.expected_case_count) || value.expected_case_count < 1 || typeof value.source_fixture !== 'string') {
      failures.push(`${descriptorPath}:${line}: invalid quality descriptor contract`);
      continue;
    }
    const sourcePath = path.join(ROOT, 'tests/golden', value.source_fixture);
    if (!fs.existsSync(sourcePath)) { failures.push(`${descriptorPath}:${line}: missing source fixture ${value.source_fixture}`); continue; }
    const rows = fs.readFileSync(sourcePath, 'utf8').split('\n').filter(Boolean).map((row, rowIndex) => {
      try { return { value: JSON.parse(row), line: rowIndex + 1 }; }
      catch (error) { failures.push(`${sourcePath}:${rowIndex + 1}: ${error.message}`); return null; }
    }).filter(Boolean);
    if (rows.length !== value.expected_case_count) failures.push(`${descriptorPath}:${line}: expected ${value.expected_case_count} rows in ${value.source_fixture}, got ${rows.length}`);
    const ids = rows.map(({ value: row }) => row.case_id).filter(Boolean);
    if (ids.length !== rows.length || new Set(ids).size !== ids.length) failures.push(`${sourcePath}: case identifiers must be present and unique`);
    const candidateIds = rows.map(({ value: row }) => row.item?.id ?? row.candidate_id).filter(Boolean).map(String);
    const expectedOrder = value.expected_candidate_order;
    const validOrder = !Array.isArray(expectedOrder) || (expectedOrder.length === value.expected_case_count && new Set(expectedOrder).size === expectedOrder.length && expectedOrder.every((id) => candidateIds.includes(String(id))));
    if (!validOrder) {
      failures.push(`${descriptorPath}:${line}: expected candidate order does not match source fixture`);
    }
  }
};
validateQualityDescriptors('openfin-comparison-live.jsonl', 'positive_compare');
validateQualityDescriptors('openfin-recommendation-shadow-live.jsonl', 'shadow_rank');
const liveFixturePath = path.join(ROOT, 'tests/golden/openfin-runtime-contract-120.jsonl');
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
  if (!validateCapabilityManifest(manifest)) failures.push(`capability manifest: ${ajv.errorsText(validateCapabilityManifest.errors)}`);
  for (const [domain, state] of Object.entries(manifest.domain_readiness || {})) {
    const counts = ['structural_candidate_count', 'value_complete_candidate_count', 'field_verified_candidate_count', 'runtime_eligible_candidate_count', 'public_candidate_count'].map(key => Number(state[key] || 0));
    if (!(counts[2] <= counts[1] && counts[1] <= counts[0] && counts[4] <= counts[3] && counts[3] <= counts[2])) failures.push(`manifest: domain count invariant ${domain}`);
  }
}
const approvalDir = path.join(ROOT, 'evidence/recommendation-approvals');
if (fs.existsSync(approvalDir)) for (const file of fs.readdirSync(approvalDir).filter(name => name.endsWith('.json'))) {
  const value = json(path.join(approvalDir, file));
  if (!validateApproval(value)) failures.push(`${path.join(approvalDir, file)}: ${ajv.errorsText(validateApproval.errors)}`);
}
const financialQualityApprovalDir = path.join(ROOT, 'evidence/financial-quality-approvals');
if (fs.existsSync(financialQualityApprovalDir)) for (const file of fs.readdirSync(financialQualityApprovalDir).filter(name => name.endsWith('.json'))) {
  const value = json(path.join(financialQualityApprovalDir, file));
  if (!validateFinancialQualityApproval(value)) failures.push(`${path.join(financialQualityApprovalDir, file)}: ${ajv.errorsText(validateFinancialQualityApproval.errors)}`);
}
const promotionDir = path.join(ROOT, 'evidence/candidate-promotions');
if (fs.existsSync(promotionDir)) for (const file of fs.readdirSync(promotionDir).filter(name => name.endsWith('.jsonl'))) {
  for (const [index, line] of fs.readFileSync(path.join(promotionDir, file), 'utf8').split('\n').entries()) {
    if (!line.trim()) continue;
    try {
      const value = JSON.parse(line);
      const location = `${path.join(promotionDir, file)}:${index + 1}`;
      if (!validatePromotion(value)) failures.push(`${location}: ${ajv.errorsText(validatePromotion.errors)}`);
      const pair = optionById.get(value.option_id);
      if (pair) {
        const profile = resolveAssertionProfile(value);
        if (value.comparison_mode !== profile.comparison_mode) failures.push(`${location}: comparison mode does not match profile`);
        const comparisonEntries = collectComparisonAssertions(pair.offer, pair.option, profile.name);
        const recommendationEntries = collectRecommendationAssertions(pair.offer, pair.option, profile.name);
        const actualComparison = comparisonEntries.map(entry => assertionIdentity(entry.assertion)).sort();
        const actualRecommendation = recommendationEntries.map(entry => assertionIdentity(entry.assertion)).sort();
        const recordedComparison = [...(value.assertion_sets?.comparison?.assertion_ids || [])].sort();
        const recordedRecommendation = [...(value.assertion_sets?.recommendation?.assertion_ids || [])].sort();
        if (JSON.stringify(actualComparison) !== JSON.stringify(recordedComparison) || JSON.stringify(actualRecommendation) !== JSON.stringify(recordedRecommendation)) failures.push(`${location}: assertion set identity mismatch`);
        if (value.required_assertion_checksum !== assertionSetChecksum(recommendationEntries.map(entry => entry.assertion)).slice(7)) failures.push(`${location}: required assertion checksum mismatch`);
        if (value.schema_content_checksum !== schemaValidationChecksum(pair.option).slice(7)) failures.push(`${location}: schema content checksum mismatch`);
        if (value.candidate_content_checksum !== sha256(canonicalCandidateContent(pair.offer, { ...pair.option, promotion_receipt: value }))) failures.push(`${location}: candidate content checksum mismatch`);
      }
    }
    catch (error) { failures.push(`${path.join(promotionDir, file)}:${index + 1}: ${error.message}`); }
  }
}
const sourceReviewDir = path.join(ROOT, 'evidence/source-reviews');
if (fs.existsSync(sourceReviewDir)) for (const file of fs.readdirSync(sourceReviewDir).filter(name => name.endsWith('.jsonl'))) {
  for (const [index, line] of fs.readFileSync(path.join(sourceReviewDir, file), 'utf8').split('\n').entries()) {
    if (!line.trim()) continue;
    try {
      const value = JSON.parse(line);
      const location = `${path.join(sourceReviewDir, file)}:${index + 1}`;
      if (!validateSourceReview(value)) failures.push(`${location}: ${ajv.errorsText(validateSourceReview.errors)}`);
      if (value.review_key !== `${value.offer_id}|${value.option_id || 'offer'}|${value.assertion_id}`) failures.push(`${location}: review key does not bind assertion identity`);
      if (value.receipt_checksum !== sha256(Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'receipt_checksum')))) failures.push(`${location}: review receipt checksum mismatch`);
    }
    catch (error) { failures.push(`${path.join(sourceReviewDir, file)}:${index + 1}: ${error.message}`); }
  }
}
for (const { offer, option } of optionById.values()) {
  const receipt = option.schema_validation_receipt;
  if (!receipt || receipt.validation_status !== 'valid' || receipt.content_checksum !== schemaValidationChecksum(option)) failures.push(`${option.option_id}: schema validation receipt content checksum mismatch`);
}
const result = { ok: failures.length === 0, entity_count: entities.length, failures: failures.slice(0, 100) };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;

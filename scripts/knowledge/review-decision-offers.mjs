import fs from 'node:fs';
import path from 'node:path';
import { ROOT, KNOWLEDGE, json, sha256, assertionIdentity } from './common.mjs';
import { collectRecommendationAssertions } from './assertion-profiles.mjs';

const domains = process.argv.slice(2).filter(value => ['deposit', 'saving'].includes(value));
const selectedDomains = domains.length ? domains : ['deposit', 'saving'];
const decisionDir = path.join(KNOWLEDGE, '30-financial-products', 'banking', '_decision');
const outputDir = path.join(ROOT, 'evidence/source-reviews');

function sourceRegistry() {
  const sources = [];
  const walk = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.md')) {
        const text = fs.readFileSync(file, 'utf8');
        const end = text.startsWith('---\n') ? text.indexOf('\n---\n', 4) : -1;
        if (end >= 0) { try { sources.push(JSON.parse(text.slice(4, end))); } catch { /* non-registry markdown */ } }
      }
    }
  };
  walk(path.join(ROOT, 'knowledge/90-sources'));
  return new Map(sources.filter(source => source.id).map(source => [source.id, source]));
}

const category = field => field.includes('sales') || field.includes('listing') ? 'sales'
  : field.includes('protection') ? 'protection'
  : field.includes('eligibility') || field.includes('predicate') ? 'eligibility'
  : field.includes('early_termination') ? 'early_termination'
  : field.includes('bonus') || field.includes('effect') ? 'bonus_conditions'
  : field.includes('join_channel') ? 'sales'
  : field.startsWith('options.') || field.includes('rate') || field.includes('term_months') || field.includes('interest_method') || field.includes('saving_method') ? 'option_rates'
  : 'other';

const registry = sourceRegistry();
const readRows = file => fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];
const sameSourceObservation = (left, right) => left.source_id === right.source_id
  && left.assertion_id === right.assertion_id
  && left.observed_value_hash === right.observed_value_hash
  && left.source_checksum === right.source_checksum
  && left.original_url === right.original_url
  && JSON.stringify(left.locator) === JSON.stringify(right.locator);
for (const domain of selectedDomains) {
  const file = path.join(decisionDir, `${domain}-offers.jsonl`);
  const offers = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(JSON.parse) : [];
  const existing = new Map(readRows(path.join(outputDir, `${domain}.jsonl`)).map(row => [row.receipt_id, row]));
  const rows = [];
  for (const offer of offers) {
    const seen = new Set();
    for (const option of offer.options || []) {
      const entries = collectRecommendationAssertions(offer, option, 'public_recommendation');
      for (const { assertion, option_id } of entries) {
        const entryKey = `${option_id || 'offer'}|${assertionIdentity(assertion)}`;
        if (seen.has(entryKey)) continue;
        seen.add(entryKey);
        const source = registry.get(assertion.source_id) || {};
        const assertion_id = assertionIdentity(assertion);
        const review_key = `${offer.id}|${option_id || 'offer'}|${assertion_id}`;
        const body = {
          receipt_id: `source-review.${offer.id}.${option_id || 'offer'}.${sha256(review_key).slice(7, 23)}`,
          review_key,
          assertion_id,
          offer_id: offer.id,
          option_id,
          field: assertion.field,
          review_category: category(assertion.field),
          source_id: assertion.source_id,
          authority_class: source.authority_class || 'unknown',
          original_url: assertion.original_url,
          locator: assertion.locator,
          observed_value_hash: assertion.value_hash,
          source_checksum: assertion.receipt_checksum,
          review_status: 'pending',
          reviewer: null,
          reviewer_role: null,
          reviewer_signature: null,
          reviewer_permission: null,
          reviewed_at: null,
          evaluated_at: process.env.OPENFIN_REVIEW_EVALUATED_AT || offer.observed_at,
          reason_codes: ['SOURCE_REVIEW_REQUIRED'],
        };
        const prior = existing.get(body.receipt_id);
        const review = prior && sameSourceObservation(prior, body) ? {
          review_status: prior.review_status,
          reviewer: prior.reviewer,
          reviewer_role: prior.reviewer_role,
          reviewer_signature: prior.reviewer_signature,
          reviewer_permission: prior.reviewer_permission,
          reviewed_at: prior.reviewed_at,
          evaluated_at: prior.evaluated_at,
          reason_codes: prior.reason_codes,
        } : {};
        const next = { ...body, ...review };
        rows.push({ ...next, receipt_checksum: sha256(next) });
      }
    }
  }
  const output = path.join(outputDir, `${domain}.jsonl`);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(output, rows.map(row => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''));
  console.log(JSON.stringify({ domain, receipt_count: rows.length, output: path.relative(ROOT, output), status: rows.some(row => row.review_status === 'verified') ? 'partially_reviewed' : 'pending' }));
}

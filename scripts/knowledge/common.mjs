import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
export const DOCS = path.join(ROOT, 'docs/opentax');
export const KNOWLEDGE = path.join(ROOT, 'knowledge');
export const EXPORT_RE = /^korea-.*-ontology-2026\.json$/;
export const BULK_TYPES = new Set(['support-program','card-product','bank-product','financial-product','insurance-product','financial-provider','account-product']);
// Single definition of the relation vocabulary: the builder emits these as graph
// edges and the validator resolves every target against them. Adding a key in
// only one of the two is what let untyped edges accumulate unchecked before.
export const RELATION_KEYS = ['parents','children','related','terms','deadlines','sources','requires','conflicts_with','available_in','provided_by','reference_items'];
export const PUBLIC_BASE = 'https://jhny-kor.github.io/OpenFin/opentax';
export const json = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
export const writeJson = (p, value) => { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n'); };
export const stable = (value) => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  return JSON.stringify(value);
};
export const sha256 = (value) => `sha256:${crypto.createHash('sha256').update(typeof value === 'string' ? value : stable(value)).digest('hex')}`;
export const isoDate = (value, fallback = null) => {
  if (!value) return fallback;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? fallback : value.toISOString();
  const s = String(value).trim();
  const m = s.match(/(20\d{2})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!m) return fallback;
  const d = new Date(Date.UTC(+m[1], +m[2]-1, +m[3]));
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
};
const STRUCTURED_DATE_KEY_RE = /(?:^|_)(?:date|dates|at|from|to)$/i;
const ISO_DATE_VALUE_RE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/;
export const normalizeCompatibilityDates = (input) => {
  const value = structuredClone(input);
  const legacy = [];
  const walk = (node, pathParts = [], parentKey = '') => {
    if (Array.isArray(node)) {
      node.forEach((child, index) => {
        if (typeof child === 'string' && STRUCTURED_DATE_KEY_RE.test(parentKey) && !ISO_DATE_VALUE_RE.test(child.trim())) {
          const normalized = isoDate(child, null);
          if (normalized) { legacy.push({path:[...pathParts, index], value:child}); node[index] = normalized; return; }
        }
        if (child && typeof child === 'object') walk(child, [...pathParts, index], parentKey);
      });
      return;
    }
    if (!node || typeof node !== 'object') return;
    for (const [key, child] of Object.entries(node)) {
      if (key === 'legacy_compatibility_dates') continue;
      if (typeof child === 'string' && STRUCTURED_DATE_KEY_RE.test(key) && !ISO_DATE_VALUE_RE.test(child.trim())) {
        const normalized = isoDate(child, null);
        if (normalized) { legacy.push({path:[...pathParts, key], value:child}); node[key] = normalized; continue; }
      }
      if (child && typeof child === 'object') walk(child, [...pathParts, key], key);
    }
  };
  walk(value);
  if (legacy.length) value.legacy_compatibility_dates = legacy;
  return value;
};
export const restoreCompatibilityDates = (input) => {
  const value = structuredClone(input);
  for (const entry of value.legacy_compatibility_dates || []) {
    if (!Array.isArray(entry?.path) || typeof entry?.value !== 'string') continue;
    let target = value;
    for (const segment of entry.path.slice(0, -1)) {
      if (!target || typeof target !== 'object' || !(segment in target)) { target = null; break; }
      target = target[segment];
    }
    if (target && typeof target === 'object') target[entry.path.at(-1)] = entry.value;
  }
  delete value.legacy_compatibility_dates;
  return value;
};
export const dateOnly = (value, fallback = null) => isoDate(value, fallback)?.slice(0,10) ?? fallback;
export const validUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value.trim()) ? value.trim() : null;
export const urlsFrom = (item) => {
  const vals = [];
  for (const v of [...(item.source_urls || []), item.source_url, item.url]) {
    const u = validUrl(v); if (u && !vals.includes(u)) vals.push(u);
  }
  return vals;
};
export const sourceBasisDate = (item) => {
  const vals = [item.source_modified_at, item.source_collected_at, item.last_verified_at, item.reviewed_at, ...(item.source_basis_dates || [])].map(x => isoDate(x)).filter(Boolean);
  return vals.sort().at(-1) || null;
};
export const slug = (s) => String(s || 'item').toLowerCase().normalize('NFKD').replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-|-$/g,'').slice(0,100) || 'item';
export const readExports = () => fs.readdirSync(DOCS).filter(f => EXPORT_RE.test(f)).sort().map(file => ({file, data: json(path.join(DOCS,file))}));
export const publicProjection = (item) => {
  const out = restoreCompatibilityDates(item);
  if (item.search_shard) out.provenance_shard = item.search_shard;
  if (out.type === 'source' && !Array.isArray(out.terms)) out.terms = [];
  if (out.type === 'source') for (const key of ['authority_class','domains','urls','access','refresh','usage_terms','recommendation_eligible','status','publisher']) delete out[key];
  delete out.publication_memberships; delete out.record_checksum; delete out.provenance;
  delete out.search_projection; delete out.search_shard; delete out.search_position;
  delete out.legacy_export_variants;
  return out;
};
export const sourceClass = (item) => {
  const value = `${item.id || ''} ${item.title || ''}`.toLowerCase();
  if (/^source\.(law|easylaw)\b/.test(value) || /(?:^|[.\s-])(customs|local-tax|national-tax)[-_. ]?framework[-_. ]?act\b/.test(value)) return 'laws';
  if (/^source\.(fsc|fss)\b/.test(value)) return 'regulators';
  if (/^source\.(crefia|kfb|kofia|knia|klia|fsb)\b/.test(value)) return 'associations';
  if (/^source\.(bccard|samsungcard|einsmarket)\b/.test(value)) return 'financial-institutions';
  if (/^source\.(nts|mohw|bok|data-go-kr|gov24|bizinfo|molit|moef|myhome|korea|govkr|hometax|call-nts|nhuf|hf|kinfa|ccrs|kdic|wetax|mois)\b/.test(value)) return 'government';
  return 'secondary-sources';
};
export const classifyPath = (item, exportFile) => {
  const t = item.type;
  // Classification nodes declare their own home. The folder tree and the
  // category graph are one taxonomy, so a category lives with the records it
  // classifies rather than in a separate concepts bucket.
  if (item.canonical_folder) return String(item.canonical_folder).split('/');
  if (t === 'source') return ['90-sources', sourceClass(item)];
  if (t === 'tax') return ['10-tax', 'taxes', item.id.includes('local') ? 'local' : item.id.includes('corporate') ? 'corporate' : 'national'];
  if (t === 'tax-credit') return ['10-tax', 'benefits', 'tax-credits'];
  if (t === 'tax-reduction' || t === 'corporate-tax-support') return ['10-tax', t === 'corporate-tax-support' ? 'business-support' : 'benefits', ...(t === 'tax-reduction' ? ['tax-reductions'] : [])];
  if (t === 'deduction') return ['10-tax', 'benefits', 'deductions'];
  if (t === 'filing') return ['10-tax', 'filing'];
  if (t === 'deadline') return ['10-tax', 'deadlines'];
  if (t === 'support-program') return item.jurisdiction ? ['20-public-support', 'local', '_records', 'by-region'] : ['20-public-support', 'central'];
  if (t === 'card-product') return ['30-financial-products', 'cards', /check/i.test(`${item.product_kind||''} ${item.id}`) ? 'check' : 'credit'];
  if (t === 'bank-product') {
    const s = `${item.product_kind||''} ${item.id} ${item.title||''}`.toLowerCase();
    return ['30-financial-products', 'banking', s.includes('loan') || s.includes('대출') ? 'loans' : s.includes('saving') || s.includes('적금') ? 'savings' : 'deposits'];
  }
  if (t === 'insurance-product') return ['30-financial-products', 'insurance'];
  if (t === 'account-product') return ['30-financial-products', 'tax-advantaged-accounts'];
  if (t === 'financial-product') return ['30-financial-products', 'protected-products'];
  if (t === 'financial-provider') return ['40-financial-reference', 'providers'];
  if (t === 'term' || t === 'concept' || t === 'benchmark-rate' || t === 'risk-signal') return ['40-financial-reference', t === 'term' ? 'terms' : t === 'concept' ? 'concepts' : t === 'benchmark-rate' ? 'benchmark-rates' : 'risk-signals'];
  if (t === 'eligibility-rule' || t === 'conflict-rule') return ['40-financial-reference', 'rules', t === 'eligibility-rule' ? 'eligibility' : 'conflicts'];
  if (t === 'required-document') return ['40-financial-reference', 'required-documents'];
  if (t === 'application-channel') return ['40-financial-reference', 'application-channels'];
  if (t === 'life-event') return ['50-life-context', 'life-events'];
  if (t === 'life-expense') return ['50-life-context', 'expenses'];
  if (t === 'life-income') return ['50-life-context', 'income'];
  if (t === 'scenario') return ['50-life-context', 'scenarios'];
  if (t === 'domain' || t === 'category') return ['40-financial-reference', 'concepts'];
  throw new Error(`Unclassified canonical entity type: ${String(t)} (${item.id || 'missing-id'}) from ${exportFile || 'unknown export'}`);
};

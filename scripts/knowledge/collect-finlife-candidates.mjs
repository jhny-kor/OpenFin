import assert from 'node:assert/strict';
import path from 'node:path';
import { ROOT, sha256, writeJson } from './common.mjs';

const key = process.env.FINLIFE_API_KEY?.trim();
const kdicKey = process.env.DATA_GO_KR_SERVICE_KEY?.trim();

const collectedAt = new Date().toISOString();
const output = path.join(ROOT, 'evidence/vertical-slice/finlife-candidate-collection.json');
const configs = {
  deposit: { endpoint: 'depositProductsSearch.json', minimum: 'minimum_deposit_krw', maximum: 'maximum_deposit_krw' },
  saving: { endpoint: 'savingProductsSearch.json', minimum: 'monthly_payment_min_krw', maximum: 'monthly_payment_max_krw' },
};

const decodeXml = value => String(value || '')
  .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"')
  .replaceAll('&apos;', "'").replaceAll('&amp;', '&')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
const tags = item => Object.fromEntries([...item.matchAll(/<([A-Za-z][A-Za-z0-9]*)>([\s\S]*?)<\/\1>/g)].map(match => [match[1], decodeXml(match[2]).trim()]));
const matchKey = value => String(value || '').normalize('NFKC').toLowerCase().replace(/(?:주식회사|㈜)/g, '').replace(/[^\p{Letter}\p{Number}]/gu, '');
if (process.argv.includes('--self-check')) {
  assert.deepEqual(tags('<fncIstNm>우리&amp;은행</fncIstNm>'), { fncIstNm: '우리&은행' });
  assert.equal(matchKey('주식회사 국민 은행'), matchKey('국민은행'));
  console.log(JSON.stringify({ ok: true }));
  process.exit(0);
}
if (!key) throw new Error('FINLIFE_API_KEY is required');
if (!kdicKey) throw new Error('DATA_GO_KR_SERVICE_KEY is required');

const request = async endpoint => {
  const url = new URL(`https://finlife.fss.or.kr/finlifeapi/${endpoint}`);
  url.searchParams.set('auth', key);
  url.searchParams.set('topFinGrpNo', '020000');
  url.searchParams.set('pageNo', '1');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${endpoint}: HTTP ${response.status}`);
  const result = (await response.json()).result;
  if (result?.err_cd !== '000') throw new Error(`${endpoint}: ${result?.err_cd ?? 'invalid response'}`);
  return result;
};

const requestKdicProduct = async candidate => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const url = new URL('https://apis.data.go.kr/B190017/service/GetInsuredProductService202008/getProductList202008');
      for (const [name, value] of Object.entries({ serviceKey: kdicKey, pageNo: 1, numOfRows: 100, prdNm: candidate.extracted.product_name })) url.searchParams.set(name, String(value));
      const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const body = await response.text();
      const resultCode = body.match(/<resultCode>([^<]+)<\/resultCode>/)?.[1];
      if (response.ok && resultCode === '00') return {
        totalCount: Number(body.match(/<totalCount>(\d+)<\/totalCount>/)?.[1] || 0),
        items: [...body.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(match => tags(match[1])),
      };
      if (attempt === 3 || response.status < 500) throw new Error(`HTTP ${response.status}, result ${resultCode || 'unknown'}`);
    } catch (error) {
      if (attempt === 3) throw new Error(`KDIC ${candidate.extracted.product_name}: ${error.message || error}`);
    }
    await new Promise(resolve => setTimeout(resolve, attempt * 1000));
  }
};

const collectKdic = async candidates => {
  const matches = new Map();
  const failures = [];
  let queriedItemCount = 0;
  for (let start = 0; start < candidates.length; start += 4) {
    const batch = candidates.slice(start, start + 4);
    const results = await Promise.all(batch.map(async candidate => {
      try { return { candidate, result: await requestKdicProduct(candidate) }; }
      catch (error) { return { candidate, error }; }
    }));
    for (const { candidate, result, error } of results) {
      if (error) {
        failures.push({ source_record_id: candidate.source_record_id, reason: String(error.message || error) });
        matches.set(candidate.source_record_id, []);
      } else {
        queriedItemCount += result.items.length;
        matches.set(candidate.source_record_id, result.items.filter(item => matchKey(item.fncIstNm) === matchKey(candidate.extracted.provider) && matchKey(item.prdNm) === matchKey(candidate.extracted.product_name)));
      }
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  return { queriedItemCount, matches, failures };
};

const normalize = (domain, config, base, options) => {
  const recordId = `${config.endpoint.replace('.json', '')}:020000:${base.fin_co_no}:${base.fin_prdt_cd}`;
  const extracted = {
    provider_code: base.fin_co_no,
    provider: base.kor_co_nm,
    product_code: base.fin_prdt_cd,
    product_name: base.fin_prdt_nm,
    disclosure_month: base.dcls_month,
    disclosure_start_date: base.dcls_strt_day || null,
    disclosure_end_date: base.dcls_end_day || null,
    join_member: base.join_member || null,
    join_way: base.join_way || null,
    maximum_limit_text: base.max_limit || null,
    maturity_interest_text: base.mtrt_int || null,
    preferential_conditions_text: base.spcl_cnd || null,
    additional_terms_text: base.etc_note || null,
    options: options.map(option => ({
      term_months: Number(option.save_trm),
      base_rate_percent: option.intr_rate,
      maximum_rate_percent: option.intr_rate2,
      interest_method: option.intr_rate_type_nm,
      saving_method: option.rsrv_type_nm || null,
    })).sort((a, b) => a.term_months - b.term_months),
  };
  return {
    source_id: 'source.fss.finlife.api',
    source_record_id: recordId,
    original_url: `https://finlife.fss.or.kr/finlifeapi/${config.endpoint}`,
    locator: { kind: 'jsonpath', value: `$.result.baseList[?(@.fin_co_no=='${base.fin_co_no}' && @.fin_prdt_cd=='${base.fin_prdt_cd}')]` },
    collected_at: collectedAt,
    verification_status: 'collected_unreviewed',
    extracted,
    checksum: sha256(extracted),
    followup_required: [
      config.minimum,
      ...(base.max_limit ? [] : [config.maximum]),
      'early_termination_rules',
      'deposit_protection_status',
      'official_product_page_or_terms_url',
    ],
  };
};

const domains = {};
for (const [domain, config] of Object.entries(configs)) {
  const result = await request(config.endpoint);
  const options = new Map();
  for (const option of result.optionList || []) {
    const id = `${option.fin_co_no}:${option.fin_prdt_cd}`;
    if (!options.has(id)) options.set(id, []);
    options.get(id).push(option);
  }
  const candidates = (result.baseList || [])
    .filter(base => options.has(`${base.fin_co_no}:${base.fin_prdt_cd}`))
    .sort((a, b) => Number(Boolean(b.max_limit)) - Number(Boolean(a.max_limit)) || `${a.fin_co_no}:${a.fin_prdt_cd}`.localeCompare(`${b.fin_co_no}:${b.fin_prdt_cd}`))
    .map(base => normalize(domain, config, base, options.get(`${base.fin_co_no}:${base.fin_prdt_cd}`)));
  if (candidates.length < 20) throw new Error(`${domain}: expected at least 20 candidates, received ${candidates.length}`);
  domains[domain] = { available_count: result.total_count, candidate_pool_count: candidates.length, selected_count: 0, candidates };
}

const candidates = Object.values(domains).flatMap(state => state.candidates);
const kdic = await collectKdic(candidates);
for (const state of Object.values(domains)) for (const candidate of state.candidates) {
  const matches = kdic.matches.get(candidate.source_record_id) || [];
  if (!matches.length) {
    candidate.protection_evidence = { status: 'not_matched_requires_manual_review' };
    continue;
  }
  candidate.protection_evidence = {
    status: 'listed_match_unreviewed',
    source_id: 'source.kdic.insured-products',
    original_url: 'https://apis.data.go.kr/B190017/service/GetInsuredProductService202008/getProductList202008',
    source_record_ids: matches.map(match => match.num),
    registered_at: matches.map(match => match.regDate).filter(Boolean).sort().at(-1) || null,
    locator: { kind: 'record', value: `fncIstNm=${matches[0].fncIstNm};prdNm=${matches[0].prdNm}` },
    collected_at: collectedAt,
    checksum: sha256(matches),
  };
}
for (const state of Object.values(domains)) {
  state.candidates.sort((a, b) => Number(b.protection_evidence.status === 'listed_match_unreviewed') - Number(a.protection_evidence.status === 'listed_match_unreviewed'));
  state.alternates = state.candidates.slice(20);
  state.candidates = state.candidates.slice(0, 20);
  state.selected_count = state.candidates.length;
}
const protectionMatchCount = Object.values(domains).flatMap(state => state.candidates).filter(candidate => candidate.protection_evidence.status === 'listed_match_unreviewed').length;

const artifact = {
  version: 'openfin-finlife-candidate-collection-v1',
  collected_at: collectedAt,
  source_id: 'source.fss.finlife.api',
  raw_snapshot_stored: false,
  credential_persisted: false,
  kdic_query_count: candidates.length,
  kdic_queried_item_count: kdic.queriedItemCount,
  kdic_failures: kdic.failures,
  protection_match_count: protectionMatchCount,
  domains,
};
writeJson(output, artifact);
console.log(JSON.stringify({ output, collected_at: collectedAt, deposit: domains.deposit.selected_count, saving: domains.saving.selected_count, kdic_query_count: candidates.length, kdic_queried_item_count: kdic.queriedItemCount, kdic_failure_count: kdic.failures.length, protection_match_count: protectionMatchCount, credential_persisted: false }, null, 2));

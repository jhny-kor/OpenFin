import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../..', import.meta.url).pathname;
const file = path.join(root, 'evidence/vertical-slice/busanbank-listing-candidate-collection-2026-08-30.json');

test('Busan Bank official-document candidates remain unapproved', () => {
  const evidence = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(evidence.verification_status, 'official_documents_collected_unreviewed');
  assert.equal(evidence.comparison_approved, false);
  assert.equal(evidence.recommendation_approved, false);
  assert.equal(evidence.products.length, 10);
  for (const domain of ['deposit', 'saving']) {
    const products = evidence.products.filter((product) => product.domain === domain);
    assert.equal(products.length, 5);
    for (const product of products) {
      assert.equal(product.verification_status, 'official_documented_unreviewed');
      assert.match(product.original_url, /^https:\/\/www\.busanbank\.co\.kr\//);
      assert.match(product.product_code, /^\d{10}$/);
      assert.match(product.detail_url, new RegExp(`FPCD=${product.product_code}$`));
      assert.match(product.official_product_document.url, /^https:\/\/www\.busanbank\.co\.kr\/vupload\/.+\.pdf$/);
      assert.match(product.official_product_document.revision_date, /^2026-\d{2}-\d{2}$/);
      assert.equal(product.official_product_document.http_status, 200);
      assert.match(product.official_product_document.sha256, /^sha256:[a-f0-9]{64}$/);
      assert.ok(Object.keys(product.automatically_collected_conditions).length >= 3);
      assert.ok(product.gaps.length >= 4);
      assert.equal(typeof product.observed.maximum_rate_percent, 'number');
    }
  }
  assert.ok(evidence.verification_gaps.includes('권한 있는 검토자 서명'));
  const basketball = evidence.products.find((product) => product.candidate_id === 'busanbank-listing:saving:basketball-championship');
  assert.equal(basketball.official_product_document.effective_period.to, '2026-06-30');
  assert.match(basketball.gaps.join(' '), /갱신 공식 문서 필요/);
});

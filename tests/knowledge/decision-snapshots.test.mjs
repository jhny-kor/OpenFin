import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = new URL('../..', import.meta.url).pathname;
const read = name => fs.readFileSync(path.join(root, 'knowledge/30-financial-products/banking/_decision', name), 'utf8').split('\n').filter(Boolean).map(JSON.parse);

test('strict decision snapshots preserve source options and meet the reviewed five plus five target', () => {
  execFileSync(process.execPath, ['scripts/knowledge/build-decision-snapshots.mjs'], { cwd: root, encoding: 'utf8' });
  const report = JSON.parse(fs.readFileSync(path.join(root, 'evidence/vertical-slice/decision-snapshot-build.json')));
  for (const [domain, file] of [['deposit', 'deposit-offers.jsonl'], ['saving', 'saving-offers.jsonl']]) {
    const offers = read(file);
    assert.equal(offers.length, report.domains[domain].strict_offer_count);
    assert.equal(offers.length, 5);
    for (const offer of offers) {
      assert.ok(offer.options.length >= 1);
      assert.equal(new Set(offer.options.map(option => option.option_id)).size, offer.options.length);
      assert.ok(offer.options.every(option => option.field_assertions.length >= 1));
      assert.equal(offer.deposit_protection_status, 'protected');
      const ruleAssertions = [
        ...offer.eligibility_rules,
        ...offer.early_termination_rules,
        ...offer.bonus_rate_rules,
        ...offer.options.flatMap(option => option.bonus_rate_rules || []),
      ].flatMap(rule => rule.field_assertions || []);
      assert.ok(ruleAssertions.length >= 1);
      assert.ok(ruleAssertions.every(assertion => assertion.verification_status === 'verified'));
      assert.ok(ruleAssertions.every(assertion => assertion.freshness_status === 'current'));
    }
  }
  assert.equal(report.recommendation_enabled, false);
  assert.equal(report.domains.deposit.strict_offer_count, 5);
  assert.equal(report.domains.saving.strict_offer_count, 5);
  assert.equal(report.blocker, 'INSUFFICIENT_SOURCE_BACKED_OFFERS');
  // The snapshot is an input to the downstream review, schema, and promotion
  // receipts; leave the checked-in artifact chain internally consistent.
  execFileSync('npm', ['run', 'knowledge:build'], { cwd: root, encoding: 'utf8', maxBuffer: 10_000_000 });
  const receiptCount = ['deposit-offers.jsonl', 'saving-offers.jsonl']
    .flatMap(read)
    .flatMap(offer => offer.options)
    .filter(option => option.promotion_receipt).length;
  execFileSync(process.execPath, ['scripts/knowledge/build-decision-snapshots.mjs'], { cwd: root, encoding: 'utf8' });
  const preservedReceiptCount = ['deposit-offers.jsonl', 'saving-offers.jsonl']
    .flatMap(read)
    .flatMap(offer => offer.options)
    .filter(option => option.promotion_receipt).length;
  assert.equal(preservedReceiptCount, receiptCount);
});

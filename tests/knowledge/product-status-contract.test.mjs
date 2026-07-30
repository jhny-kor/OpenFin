import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'contracts/product-status.json'), 'utf8'));
const bank = JSON.parse(fs.readFileSync(path.join(root, 'schemas/types/bank-product.schema.json'), 'utf8'));

test('product status contract and strict bank schema agree on verified active', () => {
  assert.deepEqual(contract.sales_verification_status, ['verified_active', 'verified_suspended', 'verified_ended', 'unverified', 'unknown']);
  assert.equal(bank.properties.sales_verification_status.const, 'verified_active');
});

import assert from "node:assert/strict";
import test from "node:test";
import { exportIdForItemId } from "../src/tools/fetch.ts";

test("current product ids route to one ontology export", () => {
  assert.equal(exportIdForItemId("finance.deposit.deposit.0010017.product"), "deposit-products-ontology");
  assert.equal(exportIdForItemId("finance.saving.saving.0010017.product"), "saving-products-ontology");
  assert.equal(exportIdForItemId("finance.loan.rent-loan.0010017.product"), "loan-products-ontology");
  assert.equal(exportIdForItemId("finance.bank.policy-loan.kinfa-api.106"), "loan-products-ontology");
});

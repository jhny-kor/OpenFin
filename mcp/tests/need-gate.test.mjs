import assert from "node:assert/strict";
import test from "node:test";
import { evaluateRecommendationNeedGate } from "../src/recommendation/need-gate.ts";

test("cashflow deficit abstains deposit recommendation", () => {
  const result = evaluateRecommendationNeedGate("deposit", { as_of: "2026-07-30", goal_purpose: "save", goal_liquidity_horizon_months: 12 }, [{ need_type: "cashflow_stabilization", status: "active" }]);
  assert.equal(result.status, "abstained");
  assert.deepEqual(result.reason_codes, ["CASHFLOW_STABILIZATION_REQUIRED"]);
});

test("missing as-of is insufficient information", () => {
  assert.equal(evaluateRecommendationNeedGate("saving", {}, []).status, "insufficient_information");
});

test("deposit recommendation requires a stated goal and period", () => {
  const result = evaluateRecommendationNeedGate("deposit", { as_of: "2026-07-30" });
  assert.equal(result.status, "insufficient_information");
  assert.deepEqual(result.missing_information, ["goal.purpose", "goal.period"]);
});

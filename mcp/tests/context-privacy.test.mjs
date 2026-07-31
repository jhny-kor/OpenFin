import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRecommendationContext } from "../src/recommendation/context.ts";
import { assertRecommendationContextSafe, recommendationAuditMetadata } from "../src/recommendation/privacy.ts";

test("context rejects unknown fields and audit metadata omits raw values", () => {
  assert.throws(() => normalizeRecommendationContext({ preferences: { account_number: "123" } }, "deposit"), /unsupported fields/);
  const context = normalizeRecommendationContext({ as_of: "2026-07-30", preferences: { provider: "Bank A" } }, "deposit");
  assert.doesNotThrow(() => assertRecommendationContextSafe(context));
  const audit = recommendationAuditMetadata(context, "deposit", "generation-1");
  assert.equal("Bank A" in audit, false);
  assert.deepEqual(audit.candidate_ids, []);
});

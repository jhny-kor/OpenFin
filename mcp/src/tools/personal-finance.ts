// @ts-nocheck
import { z } from "zod";

type ToolContext = Record<string, any>;

export function registerPersonalFinanceTools(ctx: ToolContext): void {
  const { server, env, mcpResult, financeResult, financeSafety, normalizeFinanceSnapshot, financeMetrics, financeNeeds, assertFinanceSafe, financeNumber, isRecord, evaluateEligibility, productDomain, financeAuditId, loadSearchItems, hydrateSearchItem, PERSONAL_FINANCE_POLICY_VERSION, ADVICE_POLICY_VERSION, STANDARD_OUTPUT_SCHEMA, READ_ONLY_TOOL_ANNOTATIONS } = ctx;
  server.registerTool("get_finance_summary", {
    title: "Get Personal Finance Summary",
    description: "Summarize a transient user-supplied finance snapshot and prioritize needs. This is decision support, not a recommendation.",
    inputSchema: { snapshot: z.record(z.string(), z.unknown()).optional() },
    annotations: { title: "Get Personal Finance Summary", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ snapshot }) => {
    const normalized = normalizeFinanceSnapshot(snapshot);
    const metrics = financeMetrics(normalized);
    const needs = financeNeeds(normalized, metrics);
    return financeResult(financeSafety({ status: needs.some((need) => need.status === "blocked") ? "insufficient_information" : "ready", profile_as_of: normalized.as_of ?? null, data_as_of: normalized.as_of ?? null, assumptions: ["only explicitly supplied snapshot fields are used"], missing_information: ["as_of", "monthly_net_income_krw", "essential_monthly_expenses_krw", "liquid_assets_krw", "investment_assets_krw"].filter((key) => normalized[key] === null || normalized[key] === undefined), financial_needs: needs, metrics, currency: normalized.currency ?? "KRW", limitations: ["summary does not constitute financial advice or product approval"] }));
  });

  server.registerTool("calculate_finance_metrics", {
    title: "Calculate Finance Metrics",
    description: "Calculate deterministic personal-finance metrics from a transient snapshot.",
    inputSchema: { snapshot: z.record(z.string(), z.unknown()).optional() },
    annotations: { title: "Calculate Finance Metrics", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ snapshot }) => {
    const normalized = normalizeFinanceSnapshot(snapshot);
    const metrics = financeMetrics(normalized);
    return financeResult(financeSafety({ profile_as_of: normalized.as_of ?? null, data_as_of: normalized.as_of ?? null, assumptions: ["deterministic formulas; missing inputs produce null metrics"], missing_information: ["as_of", "monthly_net_income_krw", "essential_monthly_expenses_krw", "liquid_assets_krw", "investment_assets_krw"].filter((key) => normalized[key] === null || normalized[key] === undefined), financial_needs: financeNeeds(normalized, metrics), metrics, policy_version: PERSONAL_FINANCE_POLICY_VERSION, limitations: ["metrics are educational and not financial advice"] }));
  });

  server.registerTool("evaluate_product_fit", {
    title: "Evaluate Finance Product Fit",
    description: "Evaluate explicit fit conditions for one supplied product without making a recommendation.",
    inputSchema: { snapshot: z.record(z.string(), z.unknown()).optional(), item: z.record(z.string(), z.unknown()), domain: z.string().optional() },
    outputSchema: STANDARD_OUTPUT_SCHEMA,
    annotations: { title: "Evaluate Finance Product Fit", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ snapshot, item, domain }) => {
    assertFinanceSafe(item);
    const normalized = normalizeFinanceSnapshot(snapshot);
    const requestedId = typeof item.id === "string" ? item.id : typeof item.item_id === "string" ? item.item_id : undefined;
    const catalogRootItem = (await loadSearchItems(env)).find((candidate) => candidate.id === requestedId || candidate.canonical_product_id === requestedId || candidate.resolved_canonical_product_id === requestedId);
    const catalogItem = catalogRootItem ? await hydrateSearchItem(env, catalogRootItem) : undefined;
    const candidateItem: FinanceItem | Record<string, unknown> = catalogItem ?? {
      id: requestedId ?? "unresolved-product",
      title: "Unresolved catalog product",
      type: "unknown",
      status: item.status,
      product_status: item.product_status,
      source_listing_status: item.source_listing_status,
      source_assertions: [],
    };
    const value = candidateItem as Record<string, unknown>;
    const failed: string[] = []; const unknown: string[] = catalogItem ? [] : ["catalog_product_unresolved"];
    if (value.status !== undefined && value.status !== "active") failed.push("product_not_active");
    if (value.product_status !== undefined && value.product_status !== "active") failed.push("product_not_active");
    if (value.source_listing_status !== undefined && value.source_listing_status !== "listed") failed.push("source_not_listed");
    if (value.freshness_status === "stale" || value.source_freshness_status === "stale") failed.push("stale_source");
    if (value.verification_status !== "verified") unknown.push("verification_status");
    const assertions = Array.isArray(value.source_assertions) ? value.source_assertions.filter(isRecord) : [];
    if (!assertions.some((assertion) => assertion.verification_status === "verified" && typeof assertion.source_id === "string" && typeof assertion.checksum === "string")) unknown.push("verified_primary_source_assertion");
    if (value.recommendation_status === "manual_review_candidate" || value.recommendation_status === "retired") failed.push("recommendation_state_not_eligible");
    const constraints = isRecord(normalized.constraints) ? normalized.constraints : {};
    if (constraints.provider && value.provider && String(constraints.provider) !== String(value.provider)) failed.push("provider_constraint_failed");
    const requirement = isRecord(normalized.liquidity_requirement) ? normalized.liquidity_requirement : {};
    if (typeof requirement.months === "number" && value.term_months === undefined) unknown.push("term_months");
    if (typeof requirement.months === "number" && typeof value.term_months === "number" && value.term_months > requirement.months) failed.push("term_exceeds_liquidity_horizon");
    const riskCapacity = String(normalized.risk_capacity ?? "unknown"); const productRisk = typeof value.risk_level === "string" ? value.risk_level : undefined;
    const riskOrder: Record<string, number> = { low: 1, conservative: 1, medium: 2, moderate: 2, high: 3, aggressive: 3 };
    if (riskCapacity !== "unknown" && !productRisk) unknown.push("product_risk_level");
    if (riskCapacity !== "unknown" && productRisk && (riskOrder[productRisk] ?? 0) > (riskOrder[riskCapacity] ?? 0)) failed.push("risk_capacity_exceeded");
    const sharedEligibility = evaluateEligibility(value, {
      profile: normalized,
      constraints: constraints,
      decision_context: normalized,
    });
    failed.push(...sharedEligibility.failed_conditions);
    unknown.push(...sharedEligibility.unknown_conditions);
    const eligible = !failed.length && !unknown.length;
    const dataAsOf = value.last_verified_at ?? value.verified_at ?? (Array.isArray(value.source_basis_dates) ? value.source_basis_dates[0] ?? null : value.source_basis_dates) ?? normalized.as_of ?? null;
    const candidate = { item_id: value.id ?? requestedId ?? null, domain: domain ?? productDomain(value), eligible, decision: eligible ? "fit" : failed.length ? "not_fit" : "insufficient_information", matched_conditions: sharedEligibility.matched_conditions, failed_conditions: [...new Set(failed)].sort(), unknown_conditions: [...new Set(unknown)].sort(), reason_codes: [...new Set(failed.concat(unknown))].sort(), score: eligible ? 100 : null, score_components: { source_verification: value.verification_status === "verified" ? 30 : 0, current_listing: value.source_listing_status === "listed" ? 20 : 0, liquidity_fit: unknown.includes("term_months") || failed.includes("term_exceeds_liquidity_horizon") ? 0 : 25, risk_fit: unknown.includes("product_risk_level") || failed.includes("risk_capacity_exceeded") ? 0 : 25 }, recommendation_state: value.recommendation_status ?? value.status ?? "unknown", sources: value.source_urls ?? value.sources ?? [], source_assertions: assertions, verification_status: value.verification_status ?? "unknown", promotion_receipt: value.promotion_receipt ?? null, data_as_of: dataAsOf, source_basis: value.provenance ?? value.source_assertions ?? [], limitations: ["fit evaluation is not a recommendation", "user remains the decision owner"], policy_version: ADVICE_POLICY_VERSION };
    return financeResult({ status: eligible ? "ready" : "insufficient_information", profile_as_of: normalized.as_of ?? null, data_as_of: candidate.data_as_of, assumptions: ["only catalog-resolved product fields and user constraints are evaluated"], missing_information: [...new Set(unknown)].sort(), financial_needs: [], candidates: eligible ? [candidate] : [], limitations: candidate.limitations, fit: candidate });
  });

  server.registerTool("simulate_finance_scenario", {
    title: "Simulate Finance Scenario",
    description: "Run a deterministic educational scenario using simple monthly balance arithmetic.",
    inputSchema: { snapshot: z.record(z.string(), z.unknown()).optional(), scenario: z.record(z.string(), z.unknown()).optional() },
    annotations: { title: "Simulate Finance Scenario", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ snapshot, scenario }) => {
    const normalized = normalizeFinanceSnapshot(snapshot); assertFinanceSafe(scenario);
    const input = scenario ?? {}; const months = financeNumber(input.months ?? 12, "scenario.months");
    if (!Number.isInteger(months) || months < 1 || months > 120) throw new Error("scenario.months must be between 1 and 120");
    const additional = financeNumber(input.additional_monthly_payment_krw ?? 0, "scenario.additional_monthly_payment_krw"); const contribution = financeNumber(input.monthly_contribution_krw ?? 0, "scenario.monthly_contribution_krw");
    const liabilities = Array.isArray(normalized.liabilities) ? normalized.liabilities.filter(isRecord) : []; const debt = liabilities.reduce((sum, item) => sum + Number(item.balance_krw ?? 0), 0); const rateKnown = liabilities.filter((item) => typeof item.annual_rate_percent === "number"); const rateBalance = rateKnown.reduce((sum, item) => sum + Number(item.balance_krw ?? 0), 0); const weightedRate = rateBalance ? rateKnown.reduce((sum, item) => sum + Number(item.balance_krw ?? 0) * Number(item.annual_rate_percent), 0) / rateBalance : 0; const interest = liabilities.reduce((sum, item) => sum + Number(item.balance_krw ?? 0) * Number(item.annual_rate_percent ?? 0) / 100 / 12, 0); const liquid = Number(normalized.liquid_assets_krw ?? 0); const afterDebt = Math.max(0, debt - additional * months);
    const result = { scenario: { months, additional_monthly_payment_krw: additional, monthly_contribution_krw: contribution }, before: { debt_balance_krw: debt, monthly_debt_interest_estimate_krw: interest, liquid_assets_krw: liquid }, after: { debt_balance_krw: afterDebt, monthly_debt_interest_estimate_krw: afterDebt ? afterDebt * weightedRate / 100 / 12 : 0, liquid_assets_krw: liquid + contribution * months }, assumptions: ["simple monthly balance estimate", "weighted debt rate uses only liabilities with a known annual rate", "no taxes, fees, compounding, new borrowing, or product-specific terms are inferred"], limitations: ["scenario is educational and not a promise of future return or approval"] };
    return financeResult(financeSafety({ profile_as_of: normalized.as_of ?? null, data_as_of: normalized.as_of ?? null, assumptions: result.assumptions, financial_needs: [], scenario: result, limitations: result.limitations, policy_version: PERSONAL_FINANCE_POLICY_VERSION }));
  });

  server.registerTool("explain_recommendation", {
    title: "Explain Finance Decision Support",
    description: "Explain inclusion, exclusion, tradeoffs, and limitations for an already-produced candidate; it never creates a recommendation.",
    inputSchema: { candidate: z.record(z.string(), z.unknown()), snapshot: z.record(z.string(), z.unknown()).optional() },
    annotations: { title: "Explain Finance Decision Support", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ candidate, snapshot }) => {
    assertFinanceSafe(candidate); const normalized = normalizeFinanceSnapshot(snapshot); const eligible = candidate.eligible === true; const explanation = { candidate_id: candidate.item_id ?? candidate.id ?? null, why_included: candidate.matched_conditions ?? candidate.score_components ?? [], why_excluded: candidate.failed_conditions ?? candidate.unknown_conditions ?? [], tradeoffs: candidate.tradeoffs ?? ["source status, eligibility conditions, liquidity, and risk must be checked before the user decides"], sources: candidate.sources ?? [], data_as_of: candidate.data_as_of ?? candidate.as_of ?? normalized.as_of ?? null };
    return financeResult(financeSafety({ status: eligible ? "ready" : "blocked", profile_as_of: normalized.as_of ?? null, data_as_of: explanation.data_as_of, assumptions: candidate.assumptions ?? [], missing_information: candidate.unknown_conditions ?? [], financial_needs: [], candidates: eligible ? [candidate] : [], explanation, limitations: ["explanation does not constitute financial advice or product approval"], audit_id: financeAuditId(candidate, normalized) }));
  });

  server.registerTool("validate_finance_advice", {
    title: "Validate Finance Advice Contract",
    description: "Validate the required fail-closed OpenFin advice response fields and recommendation gate.",
    inputSchema: { advice: z.record(z.string(), z.unknown()) },
    outputSchema: STANDARD_OUTPUT_SCHEMA,
    annotations: { title: "Validate Finance Advice Contract", ...READ_ONLY_TOOL_ANNOTATIONS },
  }, async ({ advice }) => {
    assertFinanceSafe(advice); const required = ["mode", "status", "reason_codes", "profile_as_of", "data_as_of", "assumptions", "missing_information", "financial_needs", "candidates", "decision_owner", "limitations", "audit_id"]; const errors = required.filter((field) => !(field in advice)); if (advice.decision_owner !== "user") errors.push("decision_owner_must_be_user"); const candidates = Array.isArray(advice.candidates) ? advice.candidates : []; if (advice.status === "ready" && !candidates.length) errors.push("ready_requires_candidates"); if (advice.status !== "ready" && candidates.length) errors.push("blocked_or_insufficient_must_not_include_candidates"); candidates.forEach((candidate) => { if (!isRecord(candidate)) { errors.push("candidate_must_be_object"); return; } if (!candidate.item_id) errors.push("candidate_item_id_required"); if (candidate.verification_status !== "verified") errors.push("candidate_verification_required"); const assertions = Array.isArray(candidate.source_assertions) ? candidate.source_assertions.filter(isRecord) : []; if (!assertions.some((assertion) => assertion.verification_status === "verified" && typeof assertion.source_id === "string" && typeof assertion.checksum === "string")) errors.push("candidate_verified_source_assertion_required"); if (!candidate.data_as_of) errors.push("candidate_data_as_of_required"); if (advice.mode === "recommendation" && advice.status === "ready" && candidate.recommendation_status !== "verified_recommendation_candidate") errors.push("recommendation_candidate_not_verified"); if (advice.mode === "recommendation" && advice.status === "ready" && !isRecord(candidate.promotion_receipt)) errors.push("candidate_promotion_receipt_required"); });
    return financeResult(financeSafety({ status: errors.length ? "blocked" : "ready", validation: { valid: !errors.length, errors: [...new Set(errors)], policy_version: ADVICE_POLICY_VERSION }, reason_codes: errors.length ? ["ADVICE_CONTRACT_INVALID"] : [] }));
  });

}

import { calculateDepositReturn } from "../calculators/deposit.ts";
import { calculateSavingReturn } from "../calculators/saving.ts";
import { resolveAttainableRate } from "./attainable-rate.ts";

type RecordLike = Record<string, unknown>;
const finite = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : null;

export function calculateFinancialOutcome(item: RecordLike, preferences: RecordLike = {}) {
  const rate = resolveAttainableRate(item, preferences);
  const tax = finite(preferences.tax_rate_percent ?? preferences.tax_rate) ?? 15.4;
  const isSaving = item.product_kind === "saving" || item.search_type === "saving";
  const calculate = (annualRatePercent: number | null) => isSaving
    ? calculateSavingReturn({ monthly_payment_krw: preferences.monthly_payment_krw ?? preferences.monthly_contribution_krw, annual_rate_percent: annualRatePercent, term_months: item.term_months, tax_rate_percent: tax })
    : calculateDepositReturn({ principal_krw: preferences.principal_krw ?? preferences.deposit_amount_krw, annual_rate_percent: annualRatePercent, term_months: item.term_months, tax_rate_percent: tax, interest_method: item.interest_method });
  const earlyTerminationRate = finite(item.early_termination_rate_percent);
  const base = calculate(rate.base_rate_percent ?? null);
  const attainable = calculate(rate.attainable_rate_percent ?? rate.rate_percent ?? null);
  const optimistic = calculate(rate.optimistic_rate_percent ?? rate.maximum_rate_percent ?? null);
  const earlyTermination = calculate(earlyTerminationRate);
  const raw = attainable;
  return {
    ...rate,
    attainable_rate_percent: rate.rate_percent,
    product_kind: isSaving ? "saving" : "deposit",
    outcome_status: raw ? "calculated" : "amount_unknown",
    outcome: raw,
    financial_outcomes: {
      base: { annual_rate_percent: rate.base_rate_percent, outcome: base },
      attainable: { annual_rate_percent: rate.attainable_rate_percent, outcome: attainable },
      optimistic: { annual_rate_percent: rate.optimistic_rate_percent, outcome: optimistic, limitations: ["optimistic scenario assumes every asserted bonus rule is met"] },
      early_termination: { annual_rate_percent: earlyTerminationRate, outcome: earlyTermination, limitations: earlyTerminationRate === null ? ["verified early-termination rate is unavailable"] : [] },
    },
    non_monetary_conditions: { term_months: item.term_months ?? null, join_channels: item.join_channels ?? item.join_channel ?? [], sales_status: item.sales_status ?? null },
    uncertainty: { unknown_conditions: rate.unknown_conditions, rate_scenario: rate.scenario, early_termination_rate_known: earlyTerminationRate !== null },
  };
}

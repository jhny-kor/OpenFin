import policy from "../../../contracts/decision-evidence-policy.json" with { type: "json" };

type RecordLike = Record<string, unknown>;
type AssertionKind = "market" | "eligibility" | "bonus" | "early_termination" | "other";

export type AssertionProfileName = "market_comparison" | "user_fit_comparison" | "shadow_recommendation" | "owner_pilot" | "public_recommendation";
export type AssertionProfile = {
  name: AssertionProfileName;
  comparison_mode: "market" | "user_fit";
  comparison_kinds: string[];
  recommendation_kinds: string[];
  requires_user_facts: boolean;
  requires_final_approval: boolean;
};
export type AssertionEntry = { assertion: RecordLike; option_id: string | null; kind: AssertionKind };

const profilePolicy = (policy as unknown as { assertion_profiles: Record<string, Omit<AssertionProfile, "name">> }).assertion_profiles;
const categoryPolicy = (policy as unknown as { assertion_categories: { market: { offer_fields: string[]; option_fields: string[] } } }).assertion_categories;
const offerMarketFields = new Set(categoryPolicy.market.offer_fields);
const optionMarketFields = new Set(categoryPolicy.market.option_fields);
const list = (value: unknown): RecordLike[] => Array.isArray(value) ? value.filter((entry): entry is RecordLike => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) : [];
const leaf = (field: unknown): string => String(field ?? "").split(".").at(-1) ?? "";

export function getAssertionProfile(name: AssertionProfileName = "market_comparison"): AssertionProfile {
  const profile = profilePolicy[name];
  if (!profile) throw new Error(`Unknown assertion profile: ${String(name)}`);
  return { name, ...profile };
}

export function profileForComparisonMode(mode: unknown): AssertionProfile {
  if (mode === "market") return getAssertionProfile("market_comparison");
  if (mode === "user_fit") return getAssertionProfile("user_fit_comparison");
  throw new Error(`Unknown comparison mode: ${String(mode)}`);
}

function isMarketField(assertion: RecordLike, owner: "offer" | "option"): boolean {
  const field = String(assertion.field ?? "");
  return owner === "offer" ? offerMarketFields.has(field) || offerMarketFields.has(leaf(field)) : optionMarketFields.has(field) || optionMarketFields.has(leaf(field));
}

function addEntries(entries: AssertionEntry[], assertions: unknown, optionId: string | null, owner: "offer" | "option", kind: "field" | AssertionKind): void {
  for (const assertion of list(assertions)) {
    if (typeof assertion.field !== "string" && typeof assertion.assertion_id !== "string") continue;
    const structuralKind = owner === "offer" ? ({ eligibility_rules: "eligibility", bonus_rate_rules: "bonus", early_termination_rules: "early_termination" } as Record<string, AssertionKind>)[leaf(assertion.field)] : undefined;
    entries.push({ assertion, option_id: optionId, kind: kind === "field" ? (structuralKind ?? (isMarketField(assertion, owner) ? "market" : "other")) : kind });
  }
}

export function collectAssertionEntries(offer: RecordLike = {}, option: RecordLike = {}): AssertionEntry[] {
  const entries: AssertionEntry[] = [];
  addEntries(entries, offer.field_assertions, null, "offer", "field");
  addEntries(entries, option.field_assertions, typeof option.option_id === "string" ? option.option_id : null, "option", "field");
  for (const rule of list(offer.eligibility_rules)) addEntries(entries, rule.field_assertions, null, "offer", "eligibility");
  for (const rule of list(offer.bonus_rate_rules)) addEntries(entries, rule.field_assertions, null, "offer", "bonus");
  for (const rule of list(offer.early_termination_rules)) addEntries(entries, rule.field_assertions, null, "offer", "early_termination");
  for (const rule of list(option.bonus_rate_rules)) addEntries(entries, rule.field_assertions, typeof option.option_id === "string" ? option.option_id : null, "option", "bonus");
  for (const rule of list(option.early_termination_rules)) addEntries(entries, rule.field_assertions, typeof option.option_id === "string" ? option.option_id : null, "option", "early_termination");
  return entries;
}

function collectByKinds(offer: RecordLike, option: RecordLike, profileName: AssertionProfileName, key: "comparison" | "recommendation"): AssertionEntry[] {
  const profile = getAssertionProfile(profileName);
  const kinds = new Set(profile[`${key}_kinds`]);
  return collectAssertionEntries(offer, option).filter(entry => kinds.has("all") || kinds.has(entry.kind));
}

export function collectComparisonAssertions(offer: RecordLike, option: RecordLike, profileName: AssertionProfileName = "market_comparison"): AssertionEntry[] {
  return collectByKinds(offer, option, profileName, "comparison");
}

export function collectRecommendationAssertions(offer: RecordLike, option: RecordLike, profileName: AssertionProfileName = "market_comparison"): AssertionEntry[] {
  return collectByKinds(offer, option, profileName, "recommendation");
}

export function resolveAssertionProfile(input: { profile?: unknown; comparison_mode?: unknown; mode?: unknown } = {}): AssertionProfile {
  if (typeof input.profile === "string" && input.profile) return getAssertionProfile(input.profile as AssertionProfileName);
  if (input.comparison_mode !== undefined) return profileForComparisonMode(input.comparison_mode);
  if (input.mode === "owner_pilot") return getAssertionProfile("owner_pilot");
  if (input.mode === "public" || input.mode === "limited_public") return getAssertionProfile("public_recommendation");
  if (input.mode === "shadow") return getAssertionProfile("shadow_recommendation");
  return getAssertionProfile("market_comparison");
}

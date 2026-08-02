import policy from '../../contracts/decision-evidence-policy.json' with { type: 'json' };

const profiles = policy.assertion_profiles || {};
const categories = policy.assertion_categories || {};
const market = categories.market || {};
const offerMarketFields = new Set(market.offer_fields || []);
const optionMarketFields = new Set(market.option_fields || []);

export const ASSERTION_PROFILE_NAMES = Object.freeze(Object.keys(profiles));
export const DEFAULT_COMPARISON_PROFILE = 'market_comparison';

const list = value => Array.isArray(value) ? value : [];
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const leaf = field => String(field || '').split('.').at(-1);

export function getAssertionProfile(name = DEFAULT_COMPARISON_PROFILE) {
  const profile = profiles[name];
  if (!profile || typeof profile !== 'object') throw new Error(`Unknown assertion profile: ${String(name)}`);
  return { name, ...profile };
}

export function profileForComparisonMode(mode) {
  if (mode === 'market') return getAssertionProfile('market_comparison');
  if (mode === 'user_fit') return getAssertionProfile('user_fit_comparison');
  throw new Error(`Unknown comparison mode: ${String(mode)}`);
}

function isMarketField(assertion, owner) {
  const field = String(assertion?.field || '');
  const fieldLeaf = leaf(field);
  if (owner === 'offer') return offerMarketFields.has(field) || offerMarketFields.has(fieldLeaf);
  return optionMarketFields.has(field) || optionMarketFields.has(fieldLeaf);
}

function addEntries(entries, assertions, optionId, owner, kind) {
  for (const assertion of list(assertions)) {
    if (!record(assertion).field && !record(assertion).assertion_id) continue;
    const structuralKind = owner === 'offer' ? ({ eligibility_rules: 'eligibility', bonus_rate_rules: 'bonus', early_termination_rules: 'early_termination' }[leaf(assertion.field)] || null) : null;
    entries.push({ assertion, option_id: optionId, kind: kind === 'field' ? (structuralKind || (isMarketField(assertion, owner) ? 'market' : 'other')) : kind });
  }
}

export function collectAssertionEntries(offer = {}, option = {}) {
  const entries = [];
  addEntries(entries, offer.field_assertions, null, 'offer', 'field');
  addEntries(entries, option.field_assertions, option.option_id ?? null, 'option', 'field');
  for (const rule of list(offer.eligibility_rules)) addEntries(entries, rule?.field_assertions, null, 'offer', 'eligibility');
  for (const rule of list(offer.bonus_rate_rules)) addEntries(entries, rule?.field_assertions, null, 'offer', 'bonus');
  for (const rule of list(offer.early_termination_rules)) addEntries(entries, rule?.field_assertions, null, 'offer', 'early_termination');
  for (const rule of list(option.bonus_rate_rules)) addEntries(entries, rule?.field_assertions, option.option_id ?? null, 'option', 'bonus');
  for (const rule of list(option.early_termination_rules)) addEntries(entries, rule?.field_assertions, option.option_id ?? null, 'option', 'early_termination');
  return entries;
}

function collectByKinds(offer, option, profileName, key) {
  const profile = getAssertionProfile(profileName);
  const kinds = new Set(list(profile[`${key}_kinds`]));
  return collectAssertionEntries(offer, option).filter(entry => kinds.has('all') || kinds.has(entry.kind));
}

export function collectComparisonAssertions(offer, option, profileName = DEFAULT_COMPARISON_PROFILE) {
  return collectByKinds(offer, option, profileName, 'comparison');
}

export function collectRecommendationAssertions(offer, option, profileName = DEFAULT_COMPARISON_PROFILE) {
  return collectByKinds(offer, option, profileName, 'recommendation');
}

export function resolveAssertionProfile({ profile, comparison_mode: comparisonMode, mode } = {}) {
  if (typeof profile === 'string' && profile) return getAssertionProfile(profile);
  if (comparisonMode) return profileForComparisonMode(comparisonMode);
  if (mode === 'owner_pilot') return getAssertionProfile('owner_pilot');
  if (mode === 'public' || mode === 'limited_public') return getAssertionProfile('public_recommendation');
  if (mode === 'shadow') return getAssertionProfile('shadow_recommendation');
  return getAssertionProfile(DEFAULT_COMPARISON_PROFILE);
}

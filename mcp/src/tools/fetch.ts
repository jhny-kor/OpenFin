import { z } from "zod";
import type { ToolContext } from "../types/tool-context.ts";

export const FETCH_INCLUDE_VALUES = ["summary", "sources", "provenance", "relations", "raw"] as const;
export type FetchInclude = typeof FETCH_INCLUDE_VALUES[number];
const DEFAULT_FETCH_INCLUDE: readonly FetchInclude[] = ["summary", "sources"];
export const EXACT_FETCH_SHARD_COUNT = 128;

export async function exactFetchShardId(value: string): Promise<string> {
  const normalized = value.trim().toLocaleLowerCase("ko-KR");
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized)));
  return `exact-${(digest[0] % EXACT_FETCH_SHARD_COUNT).toString(16).padStart(2, "0")}`;
}

export function selectFetchSections(
  identity: Record<string, unknown>,
  sections: Record<FetchInclude, Record<string, unknown>>,
  include: readonly FetchInclude[] = DEFAULT_FETCH_INCLUDE,
): Record<string, unknown> {
  const payload = { ...identity };
  for (const section of new Set(include)) Object.assign(payload, sections[section]);
  return payload;
}

export function exportIdForItemId(itemId: string): string | undefined {
  if (/^(credit|deduction|tax)\./.test(itemId)) return "tax-ontology";
  if (itemId.startsWith("support.local-gov.")) return "local-government-supports-ontology";
  if (itemId.startsWith("finance.card.")) return "card-products-ontology";
  if (/^finance\.(?:bank\.)?deposit\./.test(itemId)) return "deposit-products-ontology";
  if (/^finance\.(?:bank\.)?saving\./.test(itemId)) return "saving-products-ontology";
  if (/^finance\.(?:loan\.|bank\.(?:loan|policy-loan)\.)/.test(itemId)) return "loan-products-ontology";
  if (itemId.startsWith("finance.insurance.")) return "insurance-products-ontology";
  if (itemId.startsWith("finance.pension.")) return "pension-products-ontology";
  if (itemId.startsWith("finance.account.")) return "tax-advantaged-accounts-ontology";
  if (itemId.startsWith("finance.reference.") || itemId.startsWith("finance.term.")) return "finance-reference-ontology";
  return undefined;
}

export function needsSummaryDetailHydration(directExportId?: string, provenanceShard?: string): boolean {
  return directExportId === "finance-reference-ontology" || provenanceShard === "reference";
}

// Support search entries intentionally stay compact. This is only a fallback
// for snapshots without a usable per-item provenance shard; explicit callers
// are hydrated above so provenance is never silently empty.
export function compactSupportProvenance(item: Record<string, unknown>, sourceRegistry?: unknown): Record<string, unknown>[] {
  if (item.type !== "support-program" || Array.isArray(item.provenance) || Array.isArray(item.source_assertions)) return [];
  const sourceIds = Array.isArray(item.source_ids) ? item.source_ids.filter((value): value is string => typeof value === "string") : [];
  const sourceUrls = Array.isArray(item.source_urls) ? item.source_urls.filter((value): value is string => typeof value === "string") : [];
  const registryObject = sourceRegistry && typeof sourceRegistry === "object" && !Array.isArray(sourceRegistry) ? sourceRegistry as Record<string, unknown> : undefined;
  const registryRecords = (Array.isArray(sourceRegistry) ? sourceRegistry
    : registryObject && (Array.isArray(registryObject.records) ? registryObject.records : Array.isArray(registryObject.sources) ? registryObject.sources : Array.isArray(registryObject.items) ? registryObject.items : Array.isArray(registryObject.entries) ? registryObject.entries : [])) ?? [];
  const registryById = new Map(registryRecords.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)).map((entry) => [entry.id ?? entry.source_id ?? entry.sourceId, entry]));
  return sourceIds.map((source_id, index) => {
    const registryRecord = registryById.get(source_id);
    const registryUrls = registryRecord?.urls && typeof registryRecord.urls === "object" && !Array.isArray(registryRecord.urls)
      ? registryRecord.urls as Record<string, unknown>
      : undefined;
    const registryUrlList = Array.isArray(registryUrls?.all) ? registryUrls.all : [];
    const candidateUrl = sourceUrls[index] ?? (registryRecord?.url ?? registryRecord?.source_url ?? registryRecord?.canonical_url ?? registryUrls?.canonical ?? registryUrls?.web ?? registryUrlList[0]);
    const original_url = typeof candidateUrl === "string" ? candidateUrl : undefined;
    return {
      source_id,
      ...(original_url ? { original_url } : {}),
      supported_fields: [],
      verification_status: "reference_only",
    };
  });
}

export function registerFetchTool(ctx: ToolContext): void {
  const { server, env, loadFinanceArtifacts, loadFinanceManifest, loadProvenanceShard, fetchItemGraph, resolveItemId, sourceItems, publicProvenance, itemUrl, sourceHealth, artifactErrors, jsonText, READ_ONLY_TOOL_ANNOTATIONS } = ctx;
  server.registerTool(
    "fetch",
    {
      title: "Fetch Finance Ontology Item",
      description:
        "Use this when the user needs one exact finance ontology node with criteria, product metadata, official sources, and graph neighbors after an id or URL is known. Do not use for personalized tax, legal, accounting, or financial advice.",
      inputSchema: {
        id: z.string().min(1).describe("Ontology item id, finance:// id, opentax:// id, or web URL with hash id."),
        include: z.array(z.enum(FETCH_INCLUDE_VALUES)).min(1).max(FETCH_INCLUDE_VALUES.length).optional()
          .describe("Response sections. Defaults to summary and sources; provenance, relations, and raw require explicit opt-in."),
      },
      annotations: {
        title: "Fetch Finance Ontology Item",
        ...READ_ONLY_TOOL_ANNOTATIONS,
      },
    },
    async ({ id, include }) => {
      const selected = new Set<FetchInclude>(include ?? DEFAULT_FETCH_INCLUDE);
      const { item, itemsById } = await fetchItemGraph(env, id, [...selected]);
      // Provenance is carried by the item itself when available. An explicit
      // provenance request may hydrate the item's declared shard; this keeps
      // the default response small without silently returning an empty
      // provenance section for support items.
      const artifacts = await loadFinanceArtifacts(env, ["source_registry", "source_status"]);
      if (selected.has("provenance") && !(item.provenance?.length) && item.provenance_shard) {
        const manifest = await loadFinanceManifest(env);
        const shard = await loadProvenanceShard(env, manifest, item.provenance_shard);
        if (shard !== undefined) artifacts.provenance_index = shard;
      }
      const requestedId = resolveItemId(id);
      const resolvedCanonicalId = item.resolved_canonical_product_id ?? item.canonical_product_id ?? item.id;
      const redirected = requestedId !== item.id;
      const sources = sourceItems(item, itemsById).map((source) => ({
        id: source.id,
        title: source.title,
        publisher: source.publisher,
        basis_date: source.basis_date,
        url: source.url,
        description: source.description,
      }));

      const compactProvenance = compactSupportProvenance(item, artifacts.source_registry);
      const provenanceItem = compactProvenance.length ? { ...item, provenance: compactProvenance } : item;
      const provenance = selected.has("provenance") ? publicProvenance(provenanceItem, artifacts) : { entries: [], unresolvedCount: 0 };
      const compactSources = compactProvenance.flatMap((entry) => {
        const sourceId = typeof entry.source_id === "string" ? entry.source_id : undefined;
        if (!sourceId) return [];
        const url = typeof entry.original_url === "string" ? entry.original_url : undefined;
        return [{ id: sourceId, ...(url ? { url } : {}) }];
      });
      const sourceUrls = [...new Set([
        ...(item.source_urls ?? []),
        ...compactSources.flatMap((source) => typeof source.url === "string" ? [source.url] : []),
      ])];
      const limitations = [...new Set([
        ...(Array.isArray(item.discovery_limitations) ? item.discovery_limitations : []),
        ...(Array.isArray(item.public_recommendation_exclusion_reasons) ? item.public_recommendation_exclusion_reasons : []),
        ...(Array.isArray(item.comparison_exclusion_reasons) ? item.comparison_exclusion_reasons : []),
      ].filter((value): value is string => typeof value === "string"))];
      const identity = {
        requested_id: id,
        id: item.id,
        resolved_canonical_product_id: resolvedCanonicalId,
        redirected,
        legacy_redirect: redirected ? { from: requestedId, to: item.id, resolved_canonical_product_id: resolvedCanonicalId, reason: "merged_by_external_product_id" } : null,
      };
      const payload = selectFetchSections(identity, {
        summary: {
          title: item.title,
          type: item.type,
          url: itemUrl(env, item.id),
          description: item.description,
          basis_year: item.basis_year,
          law_reference: item.law_reference,
          provider: item.provider,
          provider_code: item.provider_code,
          financial_sector: item.financial_sector,
          product_code: item.product_code,
          product_kind: item.product_kind,
          search_type: item.search_type,
          product_status: item.product_status,
          sales_status: item.sales_status,
          source_listing_status: item.source_listing_status,
          sales_verification_status: item.sales_verification_status,
          sales_verified_at: item.sales_verified_at,
          condition_verification_status: item.condition_verification_status,
          source_freshness_status: item.source_freshness_status,
          status: item.status,
          status_reason: item.status_reason,
          recommendation_status: item.recommendation_status,
          recommendation_scope: item.recommendation_scope,
          canonical_product_id: item.canonical_product_id,
          catalog_recommendation_status: item.catalog_recommendation_status,
          catalog_recommendation_scope: item.catalog_recommendation_scope,
          recommendation_model_version: item.recommendation_model_version,
          recommendation_exclusion_reasons: item.recommendation_exclusion_reasons ?? [],
          recommendation_basis_fields: item.recommendation_basis_fields ?? [],
          comparison_basis_fields: item.comparison_basis_fields ?? [],
          verification_status: item.verification_status,
          quality_flags: item.quality_flags ?? [],
          freshness_status: item.freshness_status,
          last_verified_at: item.last_verified_at,
          last_source_checked_at: item.last_source_checked_at,
          last_reviewed_at: item.last_reviewed_at,
          public_recommendation_exclusion_reasons: item.public_recommendation_exclusion_reasons ?? [],
          comparison_exclusion_reasons: item.comparison_exclusion_reasons ?? [],
          verification_evidence: item.verification_evidence,
          missing_required_fields: item.missing_required_fields ?? [],
          missing_in_source_fields: item.missing_in_source_fields ?? [],
          unmapped_existing_fields: item.unmapped_existing_fields ?? [],
          unverified_fields: item.unverified_fields ?? [],
          discovery_evidence_fields: item.discovery_evidence_fields ?? [],
          completeness_ratio: item.completeness_ratio,
          source_completeness_ratio: item.source_completeness_ratio,
          normalized_completeness_ratio: item.normalized_completeness_ratio,
          verified_completeness_ratio: item.verified_completeness_ratio,
          required_field_count: item.required_field_count,
          completed_field_count: item.completed_field_count,
          domain_gate_passed: item.domain_gate_passed,
          comparison_engine_gate_passed: item.comparison_engine_gate_passed,
          comparison_field_verification_status: item.comparison_field_verification_status,
          comparison_field_verification: item.comparison_field_verification ?? {},
          comparison_options: item.comparison_options ?? [],
          application_status: item.application_status,
          is_currently_applicable: item.is_currently_applicable,
          application_open_from: item.application_open_from,
          application_open_to: item.application_open_to,
          criteria: item.criteria ?? [],
          structured_summary: item.structured_summary ?? {},
          limitations,
          ...sourceHealth(item, artifacts),
          artifact_errors: artifactErrors(),
        },
        sources: {
          source_records: item.source_records ?? [],
          preferred_source: item.preferred_source,
          source_urls: sourceUrls,
          source_basis_dates: item.source_basis_dates ?? [],
          sources: sources.length ? sources : compactSources,
        },
        provenance: {
          merged_fields: item.merged_fields ?? {},
          field_provenance: item.field_provenance ?? {},
          field_conflicts: item.field_conflicts ?? {},
          verification_evidence: item.verification_evidence,
          provenance: provenance.entries,
          unresolved_source_assertion_count: provenance.unresolvedCount,
        },
        relations: {
          neighbors: {
            parents: item.parents ?? [],
            children: item.children ?? [],
            related: item.related ?? [],
            terms: item.terms ?? [],
            deadlines: item.deadlines ?? [],
            sources: item.sources ?? [],
          },
        },
        raw: { raw: item },
      }, selected.size ? [...selected] : undefined);

      return {
        structuredContent: payload,
        content: [
          {
            type: "text",
            text: jsonText(payload),
          },
        ],
      };
    },
  );
}

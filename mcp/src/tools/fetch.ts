import { z } from "zod";
import type { ToolContext } from "../types/tool-context.ts";

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
      },
      annotations: {
        title: "Fetch Finance Ontology Item",
        ...READ_ONLY_TOOL_ANNOTATIONS,
      },
    },
    async ({ id }) => {
      const { item, itemsById } = await fetchItemGraph(env, id);
      // Provenance is carried by the item itself; only the small status report
      // is fetched on demand. Never hydrate the large provenance/relationship
      // indexes in the Worker request path.
      const artifacts = await loadFinanceArtifacts(env, ["source_registry", "source_status"]);
      if (!(item.provenance?.length) && item.provenance_shard) {
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

      const provenance = publicProvenance(item, artifacts);
      const payload = {
        requested_id: id,
        id: item.id,
        resolved_canonical_product_id: resolvedCanonicalId,
        redirected,
        legacy_redirect: redirected ? { from: requestedId, to: item.id, resolved_canonical_product_id: resolvedCanonicalId, reason: "merged_by_external_product_id" } : null,
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
        catalog_recommendation_status: item.catalog_recommendation_status,
        catalog_recommendation_scope: item.catalog_recommendation_scope,
        canonical_product_id: item.canonical_product_id,
        source_records: item.source_records ?? [],
        preferred_source: item.preferred_source,
        merged_fields: item.merged_fields ?? {},
        field_provenance: item.field_provenance ?? {},
        field_conflicts: item.field_conflicts ?? {},
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
        discovery_limitations: item.discovery_limitations ?? [],
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
        search_facets: item.search_facets ?? {},
        neighbors: {
          parents: item.parents ?? [],
          children: item.children ?? [],
          related: item.related ?? [],
          terms: item.terms ?? [],
          deadlines: item.deadlines ?? [],
          sources: item.sources ?? [],
        },
        source_urls: item.source_urls ?? [],
        source_basis_dates: item.source_basis_dates ?? [],
        sources,
        provenance: provenance.entries,
        unresolved_source_assertion_count: provenance.unresolvedCount,
        ...sourceHealth(item, artifacts),
        artifact_errors: artifactErrors(),
      };

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

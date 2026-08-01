import { z } from "zod";
import type { FinanceItem, FinanceRecord, ToolContext } from "../types/tool-context.ts";
import { compareRankingKeys } from "../recommendation/ranking-v2.ts";

export function registerCompareTool(ctx: ToolContext): void {
  const { server, env, mcpResult, COMPARISON_ENGINE_VERSION, dedupeProductItems, loadDetailedItemsForDomain, loadSearchIndexMetadata, loadFinanceManifest, manifestChecksumContract, comparisonReleaseGate, loadFinanceArtifacts, normalizeQuery, comparisonBlocker, comparisonOptionCandidates, comparisonOptionBlocker, comparisonCandidate, reasonCounts, EXCLUDED_SAMPLE_LIMIT, comparisonBlockers, domainMatches, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = ctx;
  server.registerTool(
    "compare",
    {
      title: "Compare Deposit and Saving Products",
      description:
        "Use this for deterministic deposit or saving comparison. It includes only official current listings with verified active sales status and never assumes unmet preferential conditions.",
      inputSchema: {
        domain: z.enum(["deposit", "saving"]),
        deposit_amount_krw: z.number().int().positive().optional(),
        monthly_payment_krw: z.number().int().positive().optional(),
        term_months: z.number().int().positive(),
        join_channels: z.array(z.string()).optional(),
        context: z.object({
          as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          facts: z.object({ can_transfer_salary: z.boolean().optional(), can_use_card: z.boolean().optional(), can_set_auto_transfer: z.boolean().optional(), is_new_customer: z.boolean().optional() }).strict().optional(),
        }).strict().optional(),
        saving_method: z.enum(["free", "fixed"]).optional(),
        tax_rate_percent: z.number().min(0).max(100).optional(),
        limit: z.number().int().min(1).max(20).optional(),
      },
      outputSchema: STANDARD_OUTPUT_SCHEMA,
      annotations: {
        title: "Compare Deposit and Saving Products",
        ...READ_ONLY_TOOL_ANNOTATIONS,
      },
    },
    async ({ domain, deposit_amount_krw, monthly_payment_krw, term_months, join_channels, context, saving_method, tax_rate_percent, limit }) => {
      const manifest = await loadFinanceManifest(env);
      if (!context?.as_of) return mcpResult({ domain, status: "insufficient_information", reason_codes: ["CONTEXT_AS_OF_REQUIRED"], data_as_of: null, missing_information: ["as_of"], result_count: 0, candidates: [], warnings: ["Comparison requires a caller supplied context.as_of for deterministic freshness and rule evaluation."], comparison_engine_version: COMPARISON_ENGINE_VERSION });
      const gate = comparisonReleaseGate(manifest, domain);
      if (!manifestChecksumContract(manifest) || gate.status !== "ready") {
        const payload = { domain, status: "blocked", reason_codes: [...(!manifestChecksumContract(manifest) ? ["MANIFEST_CHECKSUM_MISMATCH"] : []), ...gate.reasons], data_as_of: null, result_count: 0, candidates: [], excluded_count: 0, excluded_sample: [], warnings: ["Deposit and saving comparison requires the current manifest domain gate."], comparison_engine_version: COMPARISON_ENGINE_VERSION };
        return mcpResult(payload);
      }
      const items = dedupeProductItems(await loadDetailedItemsForDomain(env, domain, context.as_of));
      const metadata = await loadSearchIndexMetadata(env);
      const artifacts = await loadFinanceArtifacts(env, ["source_registry", "source_status"]);
      const channels = (join_channels ?? []).map((channel) => normalizeQuery(channel));
      const salesVerificationTtlHours = Number(manifest.domain_readiness?.[domain]?.sales_verification_ttl_hours ?? 0);
      const facts = { ...(context?.facts ?? {}), ...(context?.as_of ? { as_of: context.as_of } : {}) };
      const excluded: Array<{ item_id: string; reason: string }> = [];
      const candidates: FinanceRecord[] = [];
      const candidateTargetIds = new Set<string>();
      for (const item of items.filter((candidate) => domainMatches(candidate, domain))) {
        const blocker = comparisonBlocker(item, artifacts, salesVerificationTtlHours, context.as_of);
        if (blocker) {
          excluded.push({ item_id: item.id, reason: blocker });
          continue;
        }
        const options = comparisonOptionCandidates(item, term_months);
        if (!options.length) {
          excluded.push({ item_id: item.id, reason: "term_mismatch" });
          continue;
        }
        const usableOptions = options.filter((option) => !comparisonOptionBlocker(option, domain, deposit_amount_krw, monthly_payment_krw, channels, saving_method));
        if (!usableOptions.length) {
          const reason = comparisonOptionBlocker(options[0], domain, deposit_amount_krw, monthly_payment_krw, channels, saving_method) ?? "missing_comparison_option";
          excluded.push({ item_id: item.id, reason });
          continue;
        }
        candidateTargetIds.add(item.id);
        candidates.push(...usableOptions.map((option) => comparisonCandidate(item, option, facts, deposit_amount_krw, monthly_payment_krw, tax_rate_percent ?? 15.4)));
      }
      candidates.sort((left, right) => {
        if (Array.isArray(left.ranking_key) && Array.isArray(right.ranking_key)) {
          const ranked = compareRankingKeys(left.ranking_key, right.ranking_key);
          if (ranked) return ranked;
        }
        const leftNet = typeof left.net_interest_krw === "number" ? left.net_interest_krw : null;
        const rightNet = typeof right.net_interest_krw === "number" ? right.net_interest_krw : null;
        if (leftNet !== null && rightNet !== null && leftNet !== rightNet) return rightNet - leftNet;
        const leftRate = typeof left.achievable_rate_percent === "number" ? left.achievable_rate_percent : 0;
        const rightRate = typeof right.achievable_rate_percent === "number" ? right.achievable_rate_percent : 0;
        return rightRate - leftRate || String(left.item_id).localeCompare(String(right.item_id));
      });
      const sortedExcluded = excluded.sort((left, right) => left.item_id.localeCompare(right.item_id) || left.reason.localeCompare(right.reason));
      const excludedSummary = reasonCounts(sortedExcluded);
      const results = candidates.slice(0, limit ?? 10);
      const targetItems = items.filter((candidate) => domainMatches(candidate, domain));
      const verifiedDates = targetItems.map((candidate) => candidate.sales_verified_at?.slice(0, 10)).filter((value): value is string => Boolean(value)).sort();
      const comparisonBasisDate = verifiedDates[verifiedDates.length - 1] ?? metadata.basis_date;
      const payload = {
        domain,
        candidates: results,
        candidate_count: candidateTargetIds.size,
        result_count: results.length,
        excluded_count: sortedExcluded.length,
        excluded_summary: excludedSummary,
        filter_exclusions: { ...excludedSummary },
        comparison_target_count: targetItems.length,
        excluded_sample: sortedExcluded.slice(0, EXCLUDED_SAMPLE_LIMIT),
        blockers: comparisonBlockers(domain, excludedSummary),
        assumptions: [
          "Achievable rate includes only user-declared preferential conditions.",
          "Missing preferential conditions are not assumed to be satisfied.",
        ],
        comparison_model_version: "openfin-comparison-v0.1.0",
        comparison_engine_version: COMPARISON_ENGINE_VERSION,
        ontology_basis_date: comparisonBasisDate,
        data_as_of: comparisonBasisDate,
        latest_product_collection_date: comparisonBasisDate,
        verification_basis_date: comparisonBasisDate,
        calculation_policy_basis_date: "2026-07-14",
        comparison_basis: { candidate_values_are_from_final_object: true, object_version: COMPARISON_ENGINE_VERSION },
        executed_at: new Date().toISOString(),
        requested_intent: { domain, deposit_amount_krw, monthly_payment_krw, term_months, join_channels, context: context ?? {}, saving_method, tax_rate_percent: tax_rate_percent ?? 15.4 },
        executed_mode: "deterministic_comparison",
      };
      return mcpResult(payload);
    },
  );
}

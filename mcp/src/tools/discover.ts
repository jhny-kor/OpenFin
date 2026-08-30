import { z } from "zod";
import type { ToolContext } from "../types/tool-context.ts";
import { enrichSearchPayload } from "./search.ts";

export function registerDiscoverTool(ctx: ToolContext): void {
  const { server, env, mcpResult, discoveryDomainForQuery, SUPPORT_INTENT_RE, dedupeProductItems, loadSearchItemsForQuery, loadFinanceArtifacts, isNamedProductQuery, strictNamedProductPayload, discoveryPayload, sourceHealth, READ_ONLY_TOOL_ANNOTATIONS, STANDARD_OUTPUT_SCHEMA } = ctx;
  server.registerTool(
    "discover",
    {
      title: "Discover Finance Products",
      description: "Return source-backed exploration candidates. It does not claim a best product, approval, premium, coverage fit, or personalized recommendation.",
      inputSchema: {
        query: z.string().min(1).describe("A finance-product need, for example '실손보험 추천' or '마일리지 카드 추천'."),
        limit: z.number().int().min(1).max(50).optional().describe("Maximum number of discovery candidates. Defaults to 10."),
      },
      outputSchema: STANDARD_OUTPUT_SCHEMA,
      annotations: { title: "Discover Finance Products", ...READ_ONLY_TOOL_ANNOTATIONS },
    },
    async ({ query, limit }) => {
      const detailDomain = discoveryDomainForQuery(query);
      const artifacts = await loadFinanceArtifacts(env, ["source_registry", "source_status"]);
      // ponytail: support discovery has no product candidates; avoid parsing the large support detail shard for a warning-only response.
      if (!detailDomain && SUPPORT_INTENT_RE.test(query)) return mcpResult(enrichSearchPayload(discoveryPayload(query, [], limit ?? 10, artifacts), [], artifacts, sourceHealth));
      const items = dedupeProductItems(await loadSearchItemsForQuery(env, query));
      if (isNamedProductQuery(query)) {
        const payload = strictNamedProductPayload(query, items, limit ?? 10, env);
        if (payload) return mcpResult(enrichSearchPayload(payload, items, artifacts, sourceHealth));
      }
      const payload = discoveryPayload(query, items, limit ?? 10, artifacts);
      return mcpResult(enrichSearchPayload(payload, items, artifacts, sourceHealth));
    },
  );
}

// @ts-nocheck
type ToolContext = Record<string, any>;

export function registerExportsTool(ctx: ToolContext): void {
  const { server, env, loadFinanceManifest, loadSearchIndexMetadata, loadFinanceArtifact, coverageReport, artifactErrors, runtimeMetadata, READ_ONLY_TOOL_ANNOTATIONS } = ctx;
  server.registerTool(
    "exports",
    {
      title: "List Finance Ontology Exports",
      description:
        "Use this to see which ontology exports the finance MCP loads, including tax, local-government support, card, bank, and insurance product ontologies.",
      inputSchema: {},
      annotations: {
        title: "List Finance Ontology Exports",
        ...READ_ONLY_TOOL_ANNOTATIONS,
      },
    },
    async () => {
      const manifest = await loadFinanceManifest(env);
      const metadata = await loadSearchIndexMetadata(env);
      const [coverageArtifact, sourceRegistry, sourceStatus] = await Promise.all([
        loadFinanceArtifact(env, "provenance_coverage", manifest),
        loadFinanceArtifact(env, "source_registry", manifest),
        loadFinanceArtifact(env, "source_status", manifest),
      ]);
      const artifacts: FinanceArtifacts = { source_registry: sourceRegistry, source_status: sourceStatus, provenance_coverage: coverageArtifact };
      const payload = {
        version: manifest.version,
        basis_date: manifest.basis_date,
        item_count: manifest.search_index?.item_count ?? manifest.exports.reduce((total, entry) => total + (entry.item_count ?? 0), 0),
        search_index: manifest.search_index,
        quality_exports: manifest.quality_exports ?? [],
        source_registry: manifest.source_registry,
        source_status: manifest.source_status,
        provenance_index: manifest.provenance_index,
        provenance_coverage: manifest.provenance_coverage,
        relationship_index: manifest.relationship_index,
        provenance_coverage_report: coverageReport(coverageArtifact),
        artifact_errors: artifactErrors(),
        source_health: {
          registry: artifacts.source_registry !== undefined,
          status: artifacts.source_status !== undefined,
          provenance: Boolean(artifacts.provenance_index),
          coverage: Boolean(artifacts.provenance_coverage),
          relationships: Boolean(artifacts.relationship_index),
        },
        exports: manifest.exports,
        runtime: await runtimeMetadata(env, manifest, metadata),
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

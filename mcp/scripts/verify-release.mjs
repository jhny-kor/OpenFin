import { evaluateReleaseGate } from "../src/release-gate.ts";
import crypto from "node:crypto";

const stable = (value) => Array.isArray(value)
  ? `[${value.map(stable).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`
    : JSON.stringify(value);

const manifestUrl = process.env.FINANCE_MANIFEST_URL || "https://jhny-kor.github.io/OpenFin/opentax/finance-ontology-manifest.json";
const response = await fetch(manifestUrl, { headers: { accept: "application/json" } });
if (!response.ok) throw new Error(`manifest fetch failed: ${response.status}`);
const manifest = await response.json();
const manifestForChecksum = { ...manifest };
delete manifestForChecksum.manifest_checksum;
const calculatedManifestChecksum = crypto.createHash("sha256").update(stable(manifestForChecksum)).digest("hex");
const manifestChecksumVerified = typeof manifest.manifest_checksum === "string" && manifest.manifest_checksum === calculatedManifestChecksum;
const entries = [manifest.search_index, manifest.source_registry, manifest.source_status, manifest.provenance_index, manifest.provenance_coverage, manifest.relationship_index, manifest.decision_offers, manifest.live_regression_evidence, ...(manifest.exports || [])];
const checksumsPresent = entries.length > 0 && entries.every((entry) => typeof entry?.export_checksum === "string" && entry.export_checksum.length > 0);
let decisionChecksumVerified = false;
if (manifest.decision_offers?.url) {
  const decisionFile = String(manifest.decision_offers.path || manifest.decision_offers.url).split("/").at(-1);
  const decisionResponse = await fetch(new URL(decisionFile, manifestUrl), { headers: { accept: "application/json" } });
  if (decisionResponse.ok) {
    const content = await decisionResponse.text();
    const payload = JSON.parse(content);
    decisionChecksumVerified = crypto.createHash("sha256").update(content).digest("hex") === manifest.decision_offers.content_checksum
      && crypto.createHash("sha256").update(stable(payload)).digest("hex") === manifest.decision_offers.export_checksum
      && payload.item_count === manifest.decision_offers.item_count;
  }
}
let liveEvidenceChecksumVerified = false;
if (manifest.live_regression_evidence?.url) {
  const liveResponse = await fetch(manifest.live_regression_evidence.url, { headers: { accept: "application/json" } });
  if (liveResponse.ok) {
    const livePayload = await liveResponse.json();
    liveEvidenceChecksumVerified = crypto.createHash("sha256").update(stable(livePayload)).digest("hex") === String(manifest.live_regression_evidence.export_checksum).replace(/^sha256:/, "");
    if (liveEvidenceChecksumVerified) manifest._live_regression = livePayload;
  }
}
const checksumVerified = manifestChecksumVerified && checksumsPresent && decisionChecksumVerified && liveEvidenceChecksumVerified;
const gate = evaluateReleaseGate({ manifest, checksumVerified, deploymentCommit: process.env.DEPLOYMENT_COMMIT });
const recommendationOnly = process.argv.includes('--recommendation');
const result = { manifest_url: manifestUrl, generation_id: manifest.generation_id ?? null, live_generation_id: manifest._live_regression?.generation_id ?? null, service_availability: manifest.service_availability, core_search_status: manifest.capabilities?.search ?? manifest.core_search_status ?? manifest.platform_release_status ?? manifest.release_status, comparison_status: manifest.capabilities?.comparison ?? manifest.comparison_status ?? manifest.comparison_release_status, recommendation_status: manifest.capabilities?.recommendation ?? manifest.recommendation_status ?? manifest.recommendation_release_status, release_status: manifest.capabilities?.search ?? manifest.release_status, recommendation_enabled: manifest.recommendation_enabled === true, manifest_checksum_verified: manifestChecksumVerified, checksums_present: checksumsPresent, decision_checksum_verified: decisionChecksumVerified, live_evidence_checksum_verified: liveEvidenceChecksumVerified, gate, check: recommendationOnly ? 'recommendation' : 'integrity' };
console.log(JSON.stringify(result, null, 2));
if (!checksumVerified || (recommendationOnly && manifest.recommendation_enabled === true && gate.status !== "ready")) process.exit(1);

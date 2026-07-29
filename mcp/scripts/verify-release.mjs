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
const entries = [manifest.search_index, manifest.source_registry, manifest.source_status, manifest.provenance_index, manifest.provenance_coverage, manifest.relationship_index, ...(manifest.exports || [])];
const checksumsPresent = entries.length > 0 && entries.every((entry) => typeof entry?.export_checksum === "string" && entry.export_checksum.length > 0);
const checksumVerified = manifestChecksumVerified && checksumsPresent;
const gate = evaluateReleaseGate({ manifest, checksumVerified });
const recommendationOnly = process.argv.includes('--recommendation');
const result = { manifest_url: manifestUrl, release_status: manifest.release_status, recommendation_enabled: manifest.recommendation_enabled === true, manifest_checksum_verified: manifestChecksumVerified, checksums_present: checksumsPresent, gate, check: recommendationOnly ? 'recommendation' : 'integrity' };
console.log(JSON.stringify(result, null, 2));
if (!checksumVerified || (recommendationOnly && manifest.recommendation_enabled === true && gate.status !== "ready")) process.exit(1);

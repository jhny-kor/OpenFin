import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../..', import.meta.url).pathname;
const read = (name) => fs.readFileSync(`${root}/.github/workflows/${name}`, 'utf8');

const shouldRollbackWorker = ({ deployWorkerFinal, promote, validatePromoted, deployPages, parity }) =>
  deployWorkerFinal === 'success' && promote !== 'skipped' &&
  (promote !== 'success' || validatePromoted !== 'success' || deployPages !== 'success' || parity !== 'success');

const shouldRollbackPages = ({ canonical, deployPages, parity }) =>
  canonical === 'success' &&
  (deployPages === 'failure' || deployPages === 'cancelled' ||
    (deployPages === 'success' && parity !== 'success'));

test('production release validates the promoted Worker before Pages and retains a rollback path', () => {
  const workflow = read('release-openfin.yml');
  assert.match(workflow, /validate-promoted-worker:[\s\S]*MCP_URL: https:\/\/openfin-mcp\.y2kthr\.workers\.dev\/mcp/);
  assert.match(workflow, /deploy-pages-final:\n\s+needs: \[finalize-artifact, validate-promoted-worker\]/);
  assert.match(workflow, /rollback-worker-on-post-promotion-failure:[\s\S]*needs\.validate-promoted-worker\.result != 'success'[\s\S]*needs\.deploy-pages-final\.result != 'success'/);
  assert.match(workflow, /rollback-worker-on-post-promotion-failure:[\s\S]*needs\.public-parity\.result != 'success'/);
  assert.match(workflow, /rollback-worker-on-post-promotion-failure:[\s\S]*Verify the previous Worker generation is active again[\s\S]*\.deployment_commit == \$commit[\s\S]*\.artifact_generation == \$generation/);
  assert.doesNotMatch(workflow, /rollback-(?:worker|pages)-on-post-promotion-failure:[\s\S]*?\n\s+if: [^\n]*!cancelled\(\)/);
  assert.match(workflow, /rollback-pages-on-post-promotion-failure:[\s\S]*?\n\s+if: [^\n]*needs\.deploy-pages-final\.result == 'cancelled'/);
  assert.match(workflow, /rollback-pages-on-post-promotion-failure:[\s\S]*github-pages-rollback[\s\S]*Verify the previous production pointer is public again/);
  assert.match(workflow, /Verify the previous production pointer is public again[\s\S]*cmp --silent rollback-site\/opentax\/current-release\.json[\s\S]*cmp --silent "rollback-site\/\$evidence_path"/);
  assert.match(workflow, /Capture the current production binding and rollback artifact[\s\S]*\.production_deployed_at \/\/ \.deployed_at \/\/ \.generated_at/);
  assert.match(workflow, /openfin-release-" \+ \$commit/);
  assert.match(workflow, /pages_artifact_layout[\s\S]*previous-pages-check\/docs[\s\S]*previous-pages-site\/opentax\/current-release\.json[\s\S]*\.pages_generation == \$generation[\s\S]*\.worker_generation == \$generation/);
  assert.match(workflow, /layout="\$\{\{ needs\.canonical-artifact\.outputs\.previous_pages_artifact_layout \}\}"[\s\S]*cp -a previous-pages\/docs\/\. rollback-site\//);
  assert.match(workflow, /Verify immutable Pages mirror and Worker preview parity[\s\S]*OPENFIN_PAGES_MANIFEST_URL:[\s\S]*OPENFIN_EXPECTED_WORKER_MANIFEST_URL:/);
  assert.match(workflow, /validate-worker-final:\n\s+needs: \[finalize-artifact, deploy-pages-final-candidate, deploy-worker-final\]/);
  assert.match(workflow, /deploy-pages-final:[\s\S]*?permissions:\n\s+contents: read\n\s+pages: write\n\s+id-token: write/);
  assert.doesNotMatch(workflow, /OPENFIN_(?:BUILD_AT|SCHEMA_VALIDATED_AT|PROMOTION_EVALUATED_AT|PRODUCTION_DEPLOYED_AT): \$\{\{ env\./);
  assert.match(workflow, /Build canonical artifact once[\s\S]*test -n "\$\{OPENFIN_BUILD_AT:-\}"/);
  assert.match(workflow, /Embed current live evidence in the final artifact[\s\S]*test -n "\$\{OPENFIN_PRODUCTION_DEPLOYED_AT:-\}"/);
  assert.doesNotMatch(workflow, /^\s+push:/m);
  assert.doesNotMatch(workflow, /OPENFIN_WORKER_PREVIEW_BASE_URL/);
  assert.match(workflow, /Version Preview Alias URL:/);
  assert.match(workflow, /sed -nE 's#\^Version Preview Alias URL:/);
  assert.match(workflow, /validate-worker-final:[\s\S]*Validate comparison endpoint and fail-closed state[\s\S]*MCP_URL: \$\{\{ needs\.deploy-worker-final\.outputs\.worker_url \}\}\/mcp/);
  assert.match(workflow, /validate-promoted-worker:[\s\S]*Re-run comparison endpoint and fail-closed state[\s\S]*MCP_URL: https:\/\/openfin-mcp\.y2kthr\.workers\.dev\/mcp/);
  assert.equal((workflow.match(/OPENFIN_REQUIRE_POSITIVE_RUNTIME="\$\(jq -r '\(\.capabilities\.comparison \/\/ "blocked"\) != "blocked"' \.\.\/release\/docs\/opentax\/finance-ontology-manifest\.json\)"/g) ?? []).length, 2);
  assert.match(read('staging-openfin.yml'), /OPENFIN_REQUIRE_POSITIVE_RUNTIME: "true"/);
  assert.equal((workflow.match(/pages deploy "\$upload_dir"/g) ?? []).length, 2);
  assert.equal((workflow.match(/upload_dir="pages-upload"/g) ?? []).length, 2);
  assert.equal((workflow.match(/\.exports\[\] \| select\(\(\.shards\? \/\/ \[\]\) \| length > 0\) \| \.path/g) ?? []).length, 2);
  assert.equal((workflow.match(/Unsafe manifest path:/g) ?? []).length, 2);
  assert.equal((workflow.match(/exceeds 25 MiB/g) ?? []).length, 2);
  assert.equal((workflow.match(/OPENFIN_CLOUDFLARE_PAGES_SHARDS: "true"/g) ?? []).length, 3);
  assert.equal((workflow.match(/LIVE_CASE_ATTEMPTS: 1/g) ?? []).length, 3);
  assert.match(workflow, /validate-promoted-worker:[\s\S]*for run in 1 2 3; do[\s\S]*promoted-live-regression-report-\$run\.json[\s\S]*LIVE_METADATA_ATTEMPTS: 1[\s\S]*LIVE_CASE_ATTEMPTS: 1/);
  assert.match(workflow, /\.status == "current" and \.test_count == 120 and \.passed_count == 120 and \.failed_count == 0 and \.skipped_count == 0 and \(\(\.retry_errors \/\/ \[\]\) \| length == 0\)/);
  assert.equal((workflow.match(/LIVE_CASE_RETRY_DELAY_MS: 1000/g) ?? []).length, 3);
  assert.equal((workflow.match(/if: \$\{\{ always\(\) \}\}\n\s+with:\n\s+name: openfin-live(?:-final|-promoted)?-\$\{\{ github\.sha \}\}/g) ?? []).length, 3);
  assert.equal((workflow.match(/if-no-files-found: ignore/g) ?? []).length, 3);
  assert.match(workflow, /jq -r '\.artifact_contract\.fixture_checksum' docs\/opentax\/finance-ontology-manifest\.json/);
  assert.doesNotMatch(workflow, /jq -r '\.fixture_checksum' docs\/opentax\/finance-ontology-manifest\.json/);
  assert.match(workflow, /deploy-pages-final:[\s\S]*path: release\/docs/);
  assert.match(workflow, /deploy-pages-final:[\s\S]*name: openfin-live-promoted-\$\{\{ github\.sha \}\}[\s\S]*Publish promoted production live evidence[\s\S]*publish-promoted-live-evidence\.mjs[\s\S]*actions\/upload-pages-artifact/);
  assert.match(workflow, /public-parity:[\s\S]*name: openfin-live-promoted-\$\{\{ github\.sha \}\}[\s\S]*OPENFIN_LIVE_EVIDENCE_PATH: live\/promoted-live-regression-report\.json[\s\S]*OPENFIN_LIVE_EVIDENCE_URL: https:\/\/jhny-kor\.github\.io\/OpenFin\/opentax\/live-regression-production-current\.json[\s\S]*OPENFIN_REQUIRE_PRODUCTION_LIVE_EVIDENCE: "true"/);
  assert.doesNotMatch(workflow.match(/validate-worker-final:[\s\S]*?\n  promote-worker:/)?.[0] || '', /OPENFIN_REQUIRE_PRODUCTION_LIVE_EVIDENCE/);
});

test('rollback contracts cover partial promotion, cancellation, and public Pages failure', () => {
  assert.equal(shouldRollbackWorker({ deployWorkerFinal: 'success', promote: 'success', validatePromoted: 'failure', deployPages: 'skipped', parity: 'skipped' }), true);
  assert.equal(shouldRollbackWorker({ deployWorkerFinal: 'success', promote: 'cancelled', validatePromoted: 'skipped', deployPages: 'skipped', parity: 'skipped' }), true);
  assert.equal(shouldRollbackWorker({ deployWorkerFinal: 'success', promote: 'success', validatePromoted: 'success', deployPages: 'success', parity: 'success' }), false);
  assert.equal(shouldRollbackWorker({ deployWorkerFinal: 'failure', promote: 'skipped', validatePromoted: 'skipped', deployPages: 'skipped', parity: 'skipped' }), false);

  assert.equal(shouldRollbackPages({ canonical: 'success', deployPages: 'failure', parity: 'skipped' }), true);
  assert.equal(shouldRollbackPages({ canonical: 'success', deployPages: 'cancelled', parity: 'cancelled' }), true);
  assert.equal(shouldRollbackPages({ canonical: 'success', deployPages: 'success', parity: 'failure' }), true);
  assert.equal(shouldRollbackPages({ canonical: 'success', deployPages: 'skipped', parity: 'skipped' }), false);
  assert.equal(shouldRollbackPages({ canonical: 'failure', deployPages: 'failure', parity: 'skipped' }), false);
});

test('source tracking keeps optional credentials out of shell interpolation', () => {
  const workflow = read('track-sources.yml');
  assert.match(workflow, /OPENFIN_SOURCE_TRACKING_TOKEN: \$\{\{ secrets\.OPENFIN_SOURCE_TRACKING_TOKEN \}\}/);
  assert.match(workflow, /\[ -n "\$\{OPENFIN_SOURCE_TRACKING_TOKEN:-\}" \]/);
  assert.doesNotMatch(workflow, /\[ -n "\$\{\{ secrets\./);
});

test('legacy production deployment workflows are fail-closed', () => {
  for (const name of ['deploy-pages.yml', 'deploy-mcp.yml']) {
    const workflow = read(name);
    assert.match(workflow, /Legacy direct .* deployment is disabled/);
    assert.doesNotMatch(workflow, /wrangler (?:deploy|versions deploy)/);
    assert.doesNotMatch(workflow, /actions\/deploy-pages@/);
  }
});

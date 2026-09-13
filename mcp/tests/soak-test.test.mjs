import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
const run = promisify(execFile);
for (const mode of ['ok', 'http500', 'generation', 'isError']) test(`soak classifies ${mode}`, async () => {
  const server = createServer((request, response) => {
    response.setHeader('content-type', 'application/json');
    if (request.url.startsWith('/health')) return response.end(JSON.stringify({status:'ok', runtime_version:'release', build_timestamp:new Date().toISOString(), deployment_commit:'a', generation_id:'b', artifact_generation:'b'}));
    response.setHeader('x-openfin-diagnostics', JSON.stringify({generation_id:mode === 'generation' ? 'c' : 'b'}));
    if (mode === 'http500') response.statusCode = 500;
    // Pace requests so this bounded probe stays on the fixture's success cases.
    setTimeout(() => response.end(JSON.stringify({result:{isError:mode === 'isError', content:[]}})), 30);
  });
  await new Promise(resolve => server.listen(0, resolve));
  try {
    let result;
    try { result = await run('node', ['scripts/soak-test.mjs', '--duration-seconds', '0.12', '--concurrency', '1'], {cwd:new URL('..', import.meta.url).pathname, env:{...process.env, MCP_URL:`http://127.0.0.1:${server.address().port}/mcp`, EXPECTED_DEPLOYMENT_COMMIT:'a', EXPECTED_GENERATION:'b', LIVE_DIAGNOSTICS:'1'}}); } catch(error) { result=error; }
    const report=JSON.parse(result.stdout);
    assert.equal(report.status, mode === 'ok' ? 'current' : 'failed');
    if(mode === 'http500') { assert.ok(report.http_5xx > 0); assert.equal(report.abort,0); }
    if(['generation','isError'].includes(mode)) { assert.ok(report.contract_failure > 0); assert.equal(report.abort,0); }
  } finally { server.closeAllConnections(); server.close(); }
});

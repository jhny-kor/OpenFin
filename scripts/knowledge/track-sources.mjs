import fs from 'node:fs';
import path from 'node:path';
import { DOCS, ROOT, sha256, json } from './common.mjs';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: node scripts/knowledge/track-sources.mjs [options]

Options:
  --dry-run                 Check sources without mutating status or receipts
  --write                   Persist status and receipts (default is read-only)
  --force                   Ignore each source SLA and check every source
  --registry <path>         Override the source registry artifact
  --status-file <path>      Override the source status artifact
  --report-dir <path>       Write the JSON report to this directory
  --timeout-ms <number>     Per-request timeout (default: 8000)
  --max-body-bytes <number> Maximum response bytes used for checksums
  --concurrency <number>    Concurrent source checks (default: 6)
  --help, -h                Show this help`);
  process.exit(0);
}
const write = args.includes('--write');
const dryRun = !write || args.includes('--dry-run');
const force = args.includes('--force');
const arg = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const registryPath = arg('--registry', path.join(DOCS, 'openfin-source-registry-2026.json'));
const statusPath = arg('--status-file', path.join(DOCS, 'openfin-source-status-2026.json'));
const explicitReportDir = arg('--report-dir');
const now = process.env.OPENFIN_BUILD_AT || new Date().toISOString();
const nowMs = Date.parse(now);
const timeoutMs = Math.max(250, Number(arg('--timeout-ms', '8000')));
const maxBodyBytes = Math.max(1024, Number(arg('--max-body-bytes', '5000000')));
const concurrency = Math.max(1, Number(arg('--concurrency', '6')));
const registry = json(registryPath);
const previous = fs.existsSync(statusPath) ? json(statusPath) : { statuses: [] };
const previousById = new Map((previous.statuses || []).map(status => [status.id, status]));

let networkRequests = 0;
let checkedSources = 0;

const normalizeBody = body => String(body).replace(/\s+/g, ' ').trim();
const validDateMs = value => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : null;
};
const freshnessFor = status => {
  if (status.freshness_status) return status.freshness_status;
  if (status.stale === true) return 'stale';
  if (status.status === 'unchanged') return 'current';
  if (status.status === 'changed') return 'stale';
  return ['stale', 'unreachable', 'retired', 'conflict'].includes(status.status) ? status.status : null;
};
const isDue = (source, old) => {
  if (force || old.needs_live_check === true || !old.checked_at) return true;
  const checkedAt = validDateMs(old.checked_at);
  if (checkedAt === null) return true;
  const slaHours = Math.max(1, Number(source.refresh?.sla_hours || 168));
  return nowMs - checkedAt >= slaHours * 60 * 60 * 1000;
};

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  networkRequests += 1;
  try {
    return await fetch(url, {
      ...options,
      headers: {
        'user-agent': 'OpenFinSourceTracker/2026.07 (+https://jhny-kor.github.io/OpenFin/)',
        accept: 'text/html,application/json,application/pdf;q=0.9,*/*;q=0.8',
        ...(options.headers || {}),
      },
      signal: controller.signal,
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readBody(response) {
  if (!response.body) return { body: '', truncated: false, bytes: 0 };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = '';
  let bytes = 0;
  let truncated = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (bytes + value.byteLength > maxBodyBytes) {
      const remaining = Math.max(0, maxBodyBytes - bytes);
      if (remaining) body += decoder.decode(value.subarray(0, remaining), { stream: true });
      bytes += remaining;
      truncated = true;
      await reader.cancel();
      break;
    }
    bytes += value.byteLength;
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();
  return { body, truncated, bytes };
}

function failedStatus(source, old, status, verificationStatus, details = {}) {
  return {
    ...old,
    id: source.id,
    status,
    checked_at: now,
    freshness_status: status === 'retired' ? 'retired' : status === 'conflict' ? 'conflict' : 'stale',
    verification_status: verificationStatus,
    urls: source.urls,
    refresh: source.refresh,
    stale: true,
    needs_live_check: true,
    ...details,
  };
}

async function checkSource(source) {
  const old = previousById.get(source.id) || {};
  if (!isDue(source, old)) {
    return { ...old, id: source.id, urls: source.urls, refresh: source.refresh, freshness_status: freshnessFor(old), skipped_not_due: true };
  }
  if (source.access?.requires_secret) {
    return failedStatus(source, old, 'stale', 'secret-required', { error: 'source requires a configured secret', skipped_secret: true });
  }
  const url = source.urls?.canonical;
  if (!url) return failedStatus(source, old, 'unreachable', 'no-canonical-url');

  checkedSources += 1;
  const conditionalHeaders = {};
  if (old.etag) conditionalHeaders['if-none-match'] = old.etag;
  if (old.last_modified) conditionalHeaders['if-modified-since'] = old.last_modified;

  try {
    const head = await fetchWithTimeout(url, { method: 'HEAD', headers: conditionalHeaders });
    if (head.status === 304) {
      return { ...old, id: source.id, status: 'unchanged', checked_at: now, last_successful_checked_at: now, freshness_status: 'current', verification_status: 'not-modified', method: 'HEAD', http_status: 304, urls: source.urls, refresh: source.refresh, stale: false, needs_live_check: false };
    }
    if (head.status === 410) return failedStatus(source, old, 'retired', 'http-410', { method: 'HEAD', http_status: 410 });

    const get = await fetchWithTimeout(url, { method: 'GET', headers: conditionalHeaders });
    if (get.status === 304) {
      return { ...old, id: source.id, status: 'unchanged', checked_at: now, last_successful_checked_at: now, freshness_status: 'current', verification_status: 'not-modified', method: 'GET', http_status: 304, urls: source.urls, refresh: source.refresh, stale: false, needs_live_check: false };
    }
    if (get.status === 410) return failedStatus(source, old, 'retired', 'http-410', { method: 'GET', http_status: 410 });
    if (!get.ok) return failedStatus(source, old, 'unreachable', `http-${get.status}`, { method: 'GET', http_status: get.status });

    const { body, truncated, bytes } = await readBody(get);
    const etag = get.headers.get('etag') || head.headers.get('etag') || null;
    const lastModified = get.headers.get('last-modified') || head.headers.get('last-modified') || null;
    const checksum = sha256(normalizeBody(body));
    const checksumChanged = Boolean(old.checksum && old.checksum !== checksum);
    const etagChanged = Boolean(old.etag && etag && old.etag !== etag);
    const lastModifiedChanged = Boolean(old.last_modified && lastModified && old.last_modified !== lastModified);
    const validatorClaimsUnchanged = checksumChanged && ((old.etag && etag && old.etag === etag) || (old.last_modified && lastModified && old.last_modified === lastModified));
    // A prefix checksum cannot prove that the complete source is unchanged.
    // Keep it fail-closed until a full observation can be reviewed.
    const status = validatorClaimsUnchanged ? 'conflict' : (truncated || checksumChanged || etagChanged || lastModifiedChanged) ? 'changed' : 'unchanged';
    if (status === 'conflict') {
      return failedStatus(source, old, 'conflict', 'checksum-validator-conflict', { method: 'GET', http_status: get.status, observed_etag: etag, observed_last_modified: lastModified, observed_checksum: checksum, needs_review: true, change_detected: true, checksum_scope: truncated ? 'normalized-body-prefix' : 'normalized-body', checksum_bytes: bytes, checksum_truncated: truncated });
    }
    if (status === 'changed') {
      // A live change is an observation, not an acceptance. Keep the last
      // accepted checksum/validators and require review before promotion.
      return {
        ...old,
        id: source.id,
        status: 'changed',
        checked_at: now,
        freshness_status: 'stale',
        verification_status: 'change-detected',
        method: 'GET',
        http_status: get.status,
        observed_etag: etag,
        observed_last_modified: lastModified,
        observed_checksum: checksum,
        observed_checksum_scope: truncated ? 'normalized-body-prefix' : 'normalized-body',
        observed_checksum_bytes: bytes,
        observed_checksum_truncated: truncated,
        urls: source.urls,
        refresh: source.refresh,
        stale: true,
        needs_live_check: true,
        needs_review: true,
        change_detected: true,
      };
    }
    return {
      ...old,
      id: source.id,
      status,
      checked_at: now,
      last_successful_checked_at: now,
      freshness_status: 'current',
      verification_status: 'verified',
      method: 'GET',
      http_status: get.status,
      etag,
      last_modified: lastModified,
      checksum,
      checksum_scope: truncated ? 'normalized-body-prefix' : 'normalized-body',
      checksum_bytes: bytes,
      checksum_truncated: truncated,
      urls: source.urls,
      refresh: source.refresh,
      stale: false,
      needs_live_check: false,
      error: undefined,
    };
  } catch (error) {
    return failedStatus(source, old, 'unreachable', error.name === 'AbortError' ? 'timeout' : 'fetch-error', { error: String(error.message || error) });
  }
}

const results = [];
let cursor = 0;
const worker = async () => {
  while (true) {
    const index = cursor++;
    if (index >= registry.sources.length) return;
    results[index] = await checkSource(registry.sources[index]);
  }
};
await Promise.all(Array.from({ length: Math.min(concurrency, registry.sources.length) }, worker));

const statusCounts = {};
for (const result of results) statusCounts[result.status] = (statusCounts[result.status] || 0) + 1;
const report = { generated_at: now, dry_run: dryRun, source_count: results.length, checked_source_count: checkedSources, network_requests: networkRequests, status_counts: statusCounts, results };
const defaultReceiptDir = path.join(ROOT, 'evidence/source-receipts', now.slice(0, 7));
const reportDir = explicitReportDir || (!dryRun ? defaultReceiptDir : null);
if (reportDir) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, 'source-status-report.json'), JSON.stringify(report, null, 2) + '\n');
}
if (!dryRun) {
  const receiptFile = path.join(reportDir, `receipt-${now.replace(/[:.]/g, '-')}.jsonl`);
  fs.writeFileSync(receiptFile, results.map(result => JSON.stringify({ ...result, source_id: result.id, id: undefined })).join('\n') + '\n');
  fs.writeFileSync(statusPath, JSON.stringify({ version: 'OPENFIN-SOURCE-STATUS-2026.07.28.1', generated_at: now, source_count: results.length, statuses: results }, null, 2) + '\n');
}

console.log(JSON.stringify({ dry_run: dryRun, generated_at: now, source_count: results.length, checked_source_count: checkedSources, network_requests: networkRequests, status_counts: statusCounts, report_dir: reportDir }, null, 2));

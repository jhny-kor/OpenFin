import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { sha256 } from './common.mjs';

const base = 'https://jhny-kor.github.io/OpenFin/';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const safePath = value => typeof value === 'string' && /^[\w./-]+$/.test(value) && !value.startsWith('/') && !value.split('/').includes('..');
const descriptors = value => {
  if (!value || typeof value !== 'object') return [];
  return [ ...(safePath(value.path) && value.path.startsWith('opentax/') ? [value] : []), ...Object.values(value).flatMap(descriptors) ];
};
if (process.argv.includes('--self-check')) {
  assert.equal(safePath('../secret'), false);
  assert.equal(safePath('/etc/passwd'), false);
  assert.equal(safePath('https://evil.test/a'), false);
  assert.equal(safePath('opentax/a.json'), true);
  assert.equal(descriptors({ shards: [{ path: 'opentax/a.json' }] }).length, 1);
  console.log('snapshot self-check passed');
  process.exit(0);
}
const arg = name => process.argv[process.argv.indexOf(name) + 1];
const output = arg('--output');
if (!process.argv.includes('--output') || !output) throw new Error('--output is required');
const resume = process.argv.includes('--resume');
if (fs.existsSync(output) && !resume) throw new Error('snapshot output must not exist without --resume');
const read = async url => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (attempt === 3) throw new Error(`snapshot fetch failed: ${url}`, { cause: error });
    }
  }
};
const pointerPath = 'opentax/current-release.json';
const manifestPath = 'opentax/finance-ontology-manifest.json';
const pointerRaw = await read(base + pointerPath);
const manifestRaw = await read(base + manifestPath);
const pointer = JSON.parse(pointerRaw);
const manifest = JSON.parse(manifestRaw);
if (resume && fs.existsSync(path.join(output, pointerPath))) assert.equal(hash(fs.readFileSync(path.join(output, pointerPath))), hash(pointerRaw), 'resume pointer changed');
const { manifest_checksum, ...manifestBody } = manifest;
assert.equal(sha256(manifestBody).slice(7), manifest_checksum, 'manifest digest');
assert.equal(pointer.manifest_checksum, manifest_checksum, 'pointer digest');
for (const field of ['production_generation', 'pages_generation', 'worker_generation']) assert.equal(pointer[field], manifest.generation_id, field);
assert.match(pointer.production_commit, /^[a-f0-9]{40}$/);
const tree = JSON.parse(await read(`https://api.github.com/repos/jhny-kor/OpenFin/git/trees/${pointer.production_commit}?recursive=1`));
assert.equal(tree.truncated, false);
// Use the deployed source tree for static assets; manifest descriptors enumerate
// generated shards which may not have been committed to that source tree.
const entries = new Map(tree.tree.filter(e => e.type === 'blob' && e.path.startsWith('docs/')).map(e => [e.path.slice(5), {}]));
for (const descriptor of [...descriptors(manifest), ...descriptors(pointer)]) entries.set(descriptor.path, { ...entries.get(descriptor.path), ...descriptor });
entries.set(pointerPath, {});
entries.set(manifestPath, {});
const pending = [...entries.keys()];
const seen = new Set(pending);
const receipts = [];
let bytes = 0;
fs.mkdirSync(output, { recursive: true });
for (let start = 0; start < pending.length; start += 4) {
  if (pending.length > 4000) throw new Error('snapshot file limit exceeded');
  await Promise.all(pending.slice(start, start + 4).map(async name => {
    if (!safePath(name)) throw new Error(`unsafe snapshot path: ${name}`);
    const cached = path.join(output, name);
    const raw = name === pointerPath ? pointerRaw : name === manifestPath ? manifestRaw : resume && fs.existsSync(cached) ? fs.readFileSync(cached) : await read(base + name);
    bytes += raw.length;
    if (bytes > 1_500_000_000) throw new Error('snapshot byte limit exceeded');
    const descriptor = entries.get(name) || {};
    if (descriptor.content_checksum) assert.equal(hash(raw), descriptor.content_checksum.replace(/^sha256:/, ''), `raw checksum: ${name}`);
    if (name.endsWith('.json')) {
      const payload = JSON.parse(raw);
      if (descriptor.export_checksum && !descriptor.content_checksum) {
        const digests = [sha256(payload).slice(7), hash(JSON.stringify(payload)), ...(Array.isArray(payload.items) ? [sha256(payload.items).slice(7), hash(JSON.stringify(payload.items)), sha256({ items: payload.items, reference_items: payload.reference_items || [] }).slice(7)] : [])];
        assert.ok(digests.includes(descriptor.export_checksum.replace(/^sha256:/, '')), `export checksum: ${name}`);
      }
      for (const child of descriptors(payload)) {
        if (!seen.has(child.path)) { seen.add(child.path); pending.push(child.path); entries.set(child.path, child); }
      }
    }
    const target = path.join(output, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, raw);
    receipts.push({ path: name, bytes: raw.length, sha256: hash(raw) });
  }));
}
assert.equal(hash(await read(base + pointerPath)), hash(pointerRaw), 'production changed during capture');
assert.equal(hash(await read(base + manifestPath)), hash(manifestRaw), 'manifest changed during capture');
fs.writeFileSync(`${output}.receipt.json`, JSON.stringify({ source: base, captured_at: new Date().toISOString(), production_commit: pointer.production_commit, generation_id: manifest.generation_id, files: receipts.length, bytes, receipts }, null, 2));
console.log(JSON.stringify({ output, production_commit: pointer.production_commit, generation_id: manifest.generation_id, files: receipts.length, bytes }));

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../..', import.meta.url).pathname;

function appContext() {
  const context = vm.createContext({
    console,
    Intl,
    URL,
    Map,
    Set,
    structuredClone,
    setTimeout,
    clearTimeout,
    document: {
      addEventListener() {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
    },
    window: {
      location: { search: '', hash: '' },
      setTimeout,
      clearTimeout,
    },
  });
  vm.runInContext(fs.readFileSync(`${root}/docs/app.js`, 'utf8'), context, { filename: 'docs/app.js' });
  return context;
}

test('explorer renders canonical publisher and authoritative freshness', () => {
  const context = appContext();
  vm.runInContext(`
    state.sourceRegistry.set('source.test', { publisher: '공식 기관' });
    state.sourceStatus.set('source.test', {
      freshness_status: 'stale',
      last_successful_checked_at: '2026-07-28T00:00:00.000Z'
    });
    globalThis.renderedEvidence = renderSources({
      provenance: [{
        source_id: 'source.test',
        publisher: '잘못된 과거 값',
        original_url: 'https://example.com/source'
      }]
    });
  `, context);

  assert.match(context.renderedEvidence, /publisher: 공식 기관/);
  assert.doesNotMatch(context.renderedEvidence, /잘못된 과거 값/);
  assert.match(context.renderedEvidence, /freshness: stale/);
  assert.match(context.renderedEvidence, /last verified: 2026-07-28T00:00:00\.000Z/);
});

test('explorer renders unknown when a referenced source has no status record', () => {
  const context = appContext();
  vm.runInContext(`
    state.sourceRegistry.set('source.test', { publisher: '공식 기관' });
    globalThis.renderedEvidence = renderSources({
      provenance: [{ source_id: 'source.test', original_url: 'https://example.com/source' }]
    });
  `, context);

  assert.match(context.renderedEvidence, /freshness: unknown/);
});

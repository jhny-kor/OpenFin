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
    window: { location: { search: '', hash: '' }, setTimeout, clearTimeout },
  });
  vm.runInContext(fs.readFileSync(`${root}/docs/app.js`, 'utf8'), context, { filename: 'docs/app.js' });
  return context;
}

test('global explorer loads compact search first and hydrates only the selected domain', async () => {
  const context = appContext();
  const calls = [];
  vm.runInContext(`
    state.manifest = {
      search_index: { path: 'opentax/finance-search-index-2026.json' },
      exports: [{ id: 'deposit-products-ontology', domain: 'deposit-products', path: 'opentax/deposit.json' }]
    };
    state.items = [];
    state.loadedDomains = new Map();
    state.itemIndex = new Map();
    state.searchIndexLoaded = false;
    fetchJson = async (url) => {
      globalThis.fetchCalls.push(url);
      if (url.endsWith('finance-search-index-2026.json')) return { items: [{ id: 'item.deposit', title: '예금', export_id: 'deposit-products-ontology' }] };
      return { items: [{ id: 'item.deposit', title: '예금', description: '상세 export' }] };
    };
    globalThis.fetchCalls = [];
    globalThis.__state = state;
  `, context);

  await vm.runInContext('loadAllDomains()', context);
  assert.equal(context.fetchCalls.join('|'), './opentax/finance-search-index-2026.json');
  assert.equal(context.__state.items[0].__compact, true);
  assert.equal(context.__state.items[0].__domain, 'deposit-products');

  vm.runInContext('selectItem("item.deposit", { updateHash: false })', context);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(context.fetchCalls.join('|'), './opentax/finance-search-index-2026.json|./opentax/deposit.json');
  assert.equal(context.__state.itemIndex.get('item.deposit').description, '상세 export');
});

test('query-only explorer startup does not retain the tax fallback', () => {
  const source = fs.readFileSync(`${root}/docs/app.js`, 'utf8');
  assert.match(source, /paramQuery && !paramDomain/);
  assert.match(source, /도메인을 선택하거나 검색어를 입력하세요/);
  assert.doesNotMatch(source, /else if \(hasExplorer\) \{\s*await loadDomain\("tax"\)/);
});

import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('src/mods.js', root), 'utf8');

const listNode = {
  innerHTML: '',
  querySelectorAll() { return []; }
};
const revoked = [];
let urlCounter = 0;
const storedMods = new Map();

function asyncRequest(run) {
  const request = {};
  setTimeout(() => {
    try { request.result = run(); request.onsuccess?.(); }
    catch (error) { request.error = error; request.onerror?.(); }
  }, 0);
  return request;
}

globalThis.indexedDB = {
  open() {
    const request = {};
    setTimeout(() => {
      request.result = {
        objectStoreNames: { contains() { return true; } },
        createObjectStore() {},
        transaction() {
          return { objectStore() {
            return {
              getAll() { return asyncRequest(() => [...storedMods.values()]); },
              put(record) { return asyncRequest(() => { storedMods.set(record.id, record); return record; }); },
              delete(id) { return asyncRequest(() => storedMods.delete(id)); }
            };
          } };
        }
      };
      request.onsuccess?.();
    }, 0);
    return request;
  }
};

globalThis.window = globalThis;
globalThis.document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById(id) { return id === 'mod-list' ? listNode : null; }
};
globalThis.location = { reload() {} };
globalThis.window.addEventListener = function () {};
globalThis.URL.createObjectURL = function () { return 'blob:dk-test-' + (++urlCounter); };
globalThis.URL.revokeObjectURL = function (url) { revoked.push(url); };

new Function(source)();
if (!globalThis.DKMods?.apiFor || !globalThis.DKMods?.render) throw new Error('DKMods public mod API is unavailable.');

const toggleFiles = [
  { path: 'manifest.json', mime: 'application/json', text: JSON.stringify({ id:'toggle-smoke', name:'Toggle Smoke', version:'1.0.0', gameVersion:'>=1.9.2', main:'main.js', icon:'icon.png' }) },
  { path: 'main.js', mime: 'text/javascript', text: 'module.exports = {};' },
  { path: 'icon.png', mime: 'image/png', data: new Uint8Array([137,80,78,71,13,10,26,10]).buffer }
];
await globalThis.DKMods.installFiles(toggleFiles, { type:'test' });
if (!await globalThis.DKMods.setEnabled('toggle-smoke', false)) throw new Error('Disabling an installed mod did not complete.');
if (globalThis.DKMods.installed()[0]?.enabled !== false || storedMods.get('toggle-smoke')?.enabled !== false) throw new Error('Disabled state was not persisted to IndexedDB.');
if (!await globalThis.DKMods.setEnabled('toggle-smoke', true)) throw new Error('Re-enabling an installed mod did not complete.');
if (globalThis.DKMods.installed()[0]?.enabled !== true || storedMods.get('toggle-smoke')?.enabled !== true || !globalThis.DKMods.needsRestart()) throw new Error('Enabled state or restart requirement was not persisted.');

const record = {
  id: 'mod-api-smoke',
  updatedAt: 1,
  manifest: { id: 'mod-api-smoke', name: 'API Smoke', version: '1.0.0' },
  files: [
    { path: 'asset.png', mime: 'image/png', data: new Uint8Array([1, 2, 3, 4]).buffer }
  ]
};
const api = globalThis.DKMods.apiFor(record);

const assetUrlA = api.files.url('asset.png');
const assetUrlB = api.files.url('asset.png');
if (!assetUrlA || assetUrlA !== assetUrlB) throw new Error('DK.files.url() should cache a stable mod asset URL.');
globalThis.DKMods.render();
if (revoked.includes(assetUrlA)) throw new Error('Rendering Content Manager revoked a live DK.files.url() asset.');

const target = { value(x) { return x + 1; } };
const undoA = api.patch(target, 'value', function (original, args) { return original(...args) * 2; });
const undoB = api.patch(target, 'value', function (original, args) { return original(...args) + 3; });
if (target.value(1) !== 7) throw new Error('Stacked DK.patch() wrappers did not compose.');
undoA();
if (target.value(1) !== 5) throw new Error('Undoing an inner DK.patch() clobbered a later patch.');
undoB();
if (target.value(1) !== 2) throw new Error('DK.patch() did not restore original behavior after stacked undos.');

console.log(JSON.stringify({ stableAssetUrls: true, modsScreenDoesNotRevokeAssets: true, stackedPatchUndo: true, enableDisablePersisted: true }));

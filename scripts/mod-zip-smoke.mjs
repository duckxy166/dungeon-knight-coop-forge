import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = new URL('../', import.meta.url);
const source = await readFile(new URL('src/mods.js', root), 'utf8');

globalThis.window = globalThis;
globalThis.document = {
  readyState: 'loading',
  addEventListener() {},
  getElementById() { return null; }
};
globalThis.location = { reload() {} };

// Evaluate the browser runtime without initializing IndexedDB/UI.
new Function(source)();
if (!globalThis.DKMods?.zipPack || !globalThis.DKMods?.zipExtract) throw new Error('ZIP helpers were not exposed by DKMods.');

const manifestText = JSON.stringify({
  id: 'zip-smoke',
  name: 'ZIP Smoke',
  version: '1.0.0',
  gameVersion: '>=1.9.2',
  main: 'main.js',
  icon: 'icon.png'
});
const files = [
  { path: 'manifest.json', mime: 'application/json', text: manifestText },
  { path: 'main.js', mime: 'text/javascript', text: 'module.exports = {};' },
  { path: 'icon.png', mime: 'image/png', data: new Uint8Array([137,80,78,71,13,10,26,10,0,1,2,3]).buffer }
];

const packed = globalThis.DKMods.zipPack(files);
const packedBytes = new Uint8Array(await packed.arrayBuffer());
if (packedBytes[0] !== 0x50 || packedBytes[1] !== 0x4b) throw new Error('Exported mod is not a ZIP file.');
const roundTrip = await globalThis.DKMods.zipExtract(packedBytes);
const manifest = roundTrip.find((file) => file.path === 'manifest.json');
if (!manifest || JSON.parse(manifest.text).id !== 'zip-smoke') throw new Error('Stored ZIP round-trip failed.');
if (!roundTrip.some((file) => file.path === 'icon.png')) throw new Error('ZIP round-trip lost icon.png.');

// Verify standard DEFLATE ZIPs, one-folder wrappers, and macOS metadata cleanup.
const qaRoot = fileURLToPath(new URL('.qa-tmp/', root));
await mkdir(qaRoot, { recursive: true });
const temp = await mkdtemp(join(qaRoot, 'dk-mod-zip-'));
try {
  const wrapper = join(temp, 'WrappedMod');
  await mkdir(wrapper, { recursive: true });
  await mkdir(join(temp, '__MACOSX'), { recursive: true });
  await writeFile(join(wrapper, 'manifest.json'), manifestText);
  await writeFile(join(wrapper, 'main.js'), 'module.exports = {};');
  await writeFile(join(wrapper, 'icon.png'), Buffer.from([137,80,78,71,13,10,26,10,9,8,7,6]));
  await writeFile(join(temp, '__MACOSX', '.DS_Store'), 'junk');
  const archive = join(temp, 'compressed.zip');
  await execFileAsync('zip', ['-q', '-r', archive, 'WrappedMod', '__MACOSX'], { cwd: temp });
  const compressed = await readFile(archive);
  const extracted = await globalThis.DKMods.zipExtract(compressed);
  if (!extracted.some((file) => file.path === 'manifest.json')) throw new Error('Wrapped DEFLATE ZIP did not normalize to mod root.');
  if (extracted.some((file) => file.path.startsWith('__MACOSX'))) throw new Error('macOS ZIP metadata was not ignored.');
} finally {
  await rm(temp, { recursive: true, force: true });
  await rm(qaRoot, { recursive: true, force: true });
}

// Corruption must be caught by CRC validation rather than installing silently.
const corrupted = packedBytes.slice();
const marker = new TextEncoder().encode('module.exports = {};');
let markerIndex = -1;
outer: for (let i = 0; i <= corrupted.length - marker.length; i++) {
  for (let j = 0; j < marker.length; j++) if (corrupted[i + j] !== marker[j]) continue outer;
  markerIndex = i; break;
}
if (markerIndex < 0) throw new Error('Could not locate stored JS payload for corruption test.');
corrupted[markerIndex] ^= 1;
let rejected = false;
try { await globalThis.DKMods.zipExtract(corrupted); } catch (error) { rejected = /integrity check failed/i.test(String(error.message || error)); }
if (!rejected) throw new Error('Corrupted ZIP did not fail CRC validation.');

console.log(JSON.stringify({ zipRoundTrip: true, deflateImport: true, wrapperNormalization: true, crcValidation: true }));

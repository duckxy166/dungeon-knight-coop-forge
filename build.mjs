import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = new URL('./', import.meta.url);
const rootDir = fileURLToPath(here);
const source = await readFile(new URL('index.html', here), 'utf8');
let css = await readFile(new URL('styles/game.css', here), 'utf8');
let modernCss = await readFile(new URL('styles/modern-ui.css', here), 'utf8');
let editorCss = await readFile(new URL('styles/editor.css', here), 'utf8');
const registry = await readFile(new URL('src/content/registry.js', here), 'utf8');
const loading = await readFile(new URL('src/loading.js', here), 'utf8');
const bundleEn = await readFile(new URL('src/bundles/en.js', here), 'utf8');
const bundleThWeapons = await readFile(new URL('src/bundles/th-weapons.js', here), 'utf8');
const bundleTh = await readFile(new URL('src/bundles/th.js', here), 'utf8');
const bundleJa = await readFile(new URL('examples/mods/japanese-localization/main.js', here), 'utf8');
const mods = await readFile(new URL('src/mods.js', here), 'utf8');
const i18n = await readFile(new URL('src/i18n.js', here), 'utf8');
const time = await readFile(new URL('src/time.js', here), 'utf8');
const game = await readFile(new URL('src/game.js', here), 'utf8');
const net = await readFile(new URL('src/net.js', here), 'utf8');
const lobby = await readFile(new URL('src/lobby.js', here), 'utf8');
const ui = await readFile(new URL('src/ui.js', here), 'utf8');
const editor = await readFile(new URL('src/editor.js', here), 'utf8');
const audio = await readFile(new URL('src/audio.js', here), 'utf8');
const ubuntuFont = await readFile(new URL('assets/ubuntu-regular.ttf', here));

async function walk(url) {
    const out=[];
    for (const entry of await readdir(url,{withFileTypes:true})) {
        const child=new URL(entry.name+(entry.isDirectory()?'/':''),url);
        if(entry.isDirectory()) out.push(...await walk(child));
        else if(entry.name.endsWith('.js') && !['registry.js','manifest.js'].includes(entry.name)) out.push(child);
    }
    return out;
}
async function walkAudio(url, base) {
    const out = {};
    for (const entry of await readdir(url, { withFileTypes: true })) {
        const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url);
        if (entry.isDirectory()) {
            Object.assign(out, await walkAudio(child, base));
        } else if (entry.name.endsWith('.mp3') || entry.name.endsWith('.ogg')) {
            const relPath = relative(fileURLToPath(base), fileURLToPath(child)).replace(/\\/g, '/');
            const data = await readFile(child);
            const mime = entry.name.endsWith('.ogg') ? 'audio/ogg' : 'audio/mpeg';
            out['assets/' + relPath] = `data:${mime};base64,${data.toString('base64')}`;
        }
    }
    return out;
}
const moduleUrls=(await walk(new URL('src/content/',here))).sort((a,b)=>a.href.localeCompare(b.href));
const modulePaths=moduleUrls.map(url=>relative(rootDir,fileURLToPath(url)).replace(/\\/g, '/'));
await writeFile(new URL('src/content/manifest.js',here),'window.DK_CONTENT_MANIFEST = '+JSON.stringify(modulePaths,null,2)+';\n');
const modules=[];for(const url of moduleUrls)modules.push(await readFile(url,'utf8'));
const embeddedAudio = await walkAudio(new URL('assets/audio/', here), new URL('assets/', here));
if (!source.includes('<canvas id="gameCanvas"') || !game.includes('window.DKGame') || !net.includes('window.DKNet')) throw new Error('The v1.9.2 source tree is incomplete.');
css = css.replace("url('../assets/ubuntu-regular.ttf')", `url('data:font/ttf;base64,${ubuntuFont.toString('base64')}')`);
editorCss = editorCss.replace("url('../assets/ubuntu-regular.ttf')", `url('data:font/ttf;base64,${ubuntuFont.toString('base64')}')`);
const loadingTotal = 9 + moduleUrls.length + 13;
const gameInline = [
    "window.DK_STANDALONE_OFFLINE=true;",
    "window.DK_AUDIO_EMBEDDED = " + JSON.stringify(embeddedAudio) + ";",
    audio,
    registry,
    ...modules,
    bundleEn,
    bundleThWeapons,
    bundleTh,
    bundleJa,
    mods,
    "window.DK_BOOT_PROMISE=(async function(){await window.DKMods.bootstrap();",
    i18n,
    time,
    game,
    "})();"
].join('\n');
const html = source
    .replace('<link rel="stylesheet" href="styles/game.css">', () => `<style>\n${css}\n</style>`)
    .replace('<link rel="stylesheet" href="styles/modern-ui.css">', () => `<style>\n${modernCss}\n</style>`)
    .replace('<link rel="stylesheet" href="styles/editor.css">', () => `<style>\n${editorCss}\n</style>`)
    .replace('    <script src="src/loading.js"></script>\n    <script src="src/content/registry.js"></script>\n    <script src="src/content/manifest.js"></script>\n    <script src="src/bootstrap.js"></script>', () => `    <script>\n${loading}\nwindow.DKLoader.configure(${loadingTotal}, 9);\n</script>\n    <script>\n${gameInline}\n</script>\n    <script>\n${net}\n</script>\n    <script>
Promise.resolve(window.DK_BOOT_PROMISE).then(function(){
${lobby}
${ui}
}).catch(function(error){console.error('[Dungeon Knight]', error);});
</script>
    <script>
Promise.resolve(window.DK_BOOT_PROMISE).then(function(){
${editor}
if (window.DKMods) window.DKMods.ready();
if (window.DKLoader) window.DKLoader.finish();
}).catch(function(error){console.error('[Dungeon Knight]', error); if(window.DKLoader) window.DKLoader.fail('Could not finish loading mods and UI');});
</script>`);
if (/src=(['"])src\//.test(html) || /href=(['"])styles\//.test(html)) throw new Error('Standalone build still contains source references.');
const linkedResources = [...html.matchAll(/<link\b[^>]*\bhref=(['"])([^'"]+)\1[^>]*>/gi)].map((match) => match[2]);
const allowedRemoteFonts = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
if (!html.includes('window.DK_STANDALONE_OFFLINE=true') || /<script[^>]+src=/.test(html) || linkedResources.some((href) => !allowedRemoteFonts.some((origin) => href.startsWith(origin)))) throw new Error('Standalone build contains an unexpected external resource.');
const outputDirectory = new URL('dist/', here);await mkdir(outputDirectory,{recursive:true});
await writeFile(new URL('dist/index.html',here),html);await writeFile(new URL('dist/Dungeon_Knight_v1.9.2_Offline.html',here),html);
console.log(`Built v1.9.2 standalone local HTML (${Buffer.byteLength(html)} bytes, ${moduleUrls.length} content modules; Thai and Japanese fonts load from Google Fonts)`);

import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [html, modernCss, gameCss, editorCss, ui, mods, thai, japanese, i18n, game, lobby, net, server, loader, bootstrap, built] = await Promise.all([
    readFile(new URL('index.html', root), 'utf8'),
    readFile(new URL('styles/modern-ui.css', root), 'utf8'),
    readFile(new URL('styles/game.css', root), 'utf8'),
    readFile(new URL('styles/editor.css', root), 'utf8'),
    readFile(new URL('src/ui.js', root), 'utf8'),
    readFile(new URL('src/mods.js', root), 'utf8'),
    readFile(new URL('src/bundles/th.js', root), 'utf8'),
    readFile(new URL('examples/mods/japanese-localization/main.js', root), 'utf8'),
    readFile(new URL('src/i18n.js', root), 'utf8'),
    readFile(new URL('src/game.js', root), 'utf8'),
    readFile(new URL('src/lobby.js', root), 'utf8'),
    readFile(new URL('src/net.js', root), 'utf8'),
    readFile(new URL('server.mjs', root), 'utf8'),
    readFile(new URL('src/loading.js', root), 'utf8'),
    readFile(new URL('src/bootstrap.js', root), 'utf8'),
    readFile(new URL('dist/index.html', root), 'utf8')
]);

function requireAll(source, values, label) {
    const missing = values.filter((value) => !source.includes(value));
    if (missing.length) throw new Error(`${label} missing: ${missing.join(', ')}`);
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicates.length) throw new Error(`Duplicate UI ids: ${duplicates.join(', ')}`);

requireAll(html, [
    'id="main-menu"', 'id="play-menu-btn"', 'id="multiplayer-menu-btn"',
    'id="settings-menu-btn"', 'id="stats-menu-btn"', 'id="editor-mode-btn"', 'id="mods-menu-btn"', 'id="quit-menu-btn"',
    'class="settings-layout"', 'class="settings-categories"', 'id="settings-content"',
    'data-settings-category="general"', 'data-settings-panel="video"', 'data-settings-panel="interface"',
    'id="menu-ui-scale-select"', 'id="menu-hud-opacity-select"', 'id="menu-camera-zoom-select"',
    'id="menu-window-mode-select"', 'id="language-select"',
    'data-pause-panel="main"', 'data-pause-panel="settings"', 'data-pause-panel="statistics"',
    'id="pause-settings-open-btn"', 'id="pause-statistics-open-btn"',
    'class="waiting-shell"', 'id="waiting-party"', 'id="waiting-ui-toggle"',
    'class="hud-meter-stack"', 'id="inventory-screen"', 'id="crafting-screen"',
    'id="class-focus"', 'id="weapon-editor-screen" class="weapon-editor" lang="en" data-i18n-lock',
    'id="editor-test-ui" class="editor-test-ui" lang="en" data-i18n-lock',
    'id="loading-screen"', 'id="loading-count">0 / 56', 'src="src/loading.js"', 'src="src/bootstrap.js"',
    'id="hud-settings-btn"', 'id="menu-mobile-attack-select"', 'id="pause-mobile-attack-select"',
    'id="menu-frame-limit-select"', 'id="menu-effect-quality-select"', 'id="menu-debug-mode-select"',
    'id="keybind-list"', 'id="mobile-layout-editor"', 'id="aim-stick-knob"', 'id="debug-overlay"',
    'id="active-cd-number"', 'id="desktop-dash-cd-number"', 'id="mobile-active-cd-number"', 'id="mobile-dash-cd-number"',
    'id="class-name">Independent'
], 'quiet PC interface structure');
requireAll(html, [
    'Noto+Sans+Thai', 'Noto+Sans+JP',
    'https://fonts.gstatic.com'
], 'Noto Sans Thai webfont loading');

const mainMenuEntries = [...html.matchAll(/<button class="cinematic-menu-btn" id="(?:play-menu-btn|multiplayer-menu-btn|settings-menu-btn|stats-menu-btn|editor-mode-btn|mods-menu-btn|quit-menu-btn)"/g)];
if (mainMenuEntries.length !== 7) throw new Error(`Main menu should expose seven direct entries; found ${mainMenuEntries.length}.`);
if (html.includes('class="menu-feature"') || html.includes('class="feature-orbit"') || html.includes('class="class-figure"') || html.includes('class="class-scanline"')) {
    throw new Error('Decorative telemetry/orbit/class-figure UI remains in the player-facing DOM.');
}
if (html.includes('class="class-index"') || html.includes('class="class-arrow"') || /id="class-focus-(?:hp|armor|mana)"[^<]*<\/strong>\s*<i\b/.test(html)) {
    throw new Error('Class selection still contains decorative indexes, arrows, or stat bars.');
}
if (html.includes('id="zoom-out-btn"') || html.includes('id="zoom-in-btn"') || html.includes('RUNNER // 01') || html.includes('PRIORITY TARGET') || html.includes('LIVE RUN')) {
    throw new Error('Removed gameplay zoom or telemetry copy returned to the player-facing DOM.');
}

requireAll(modernCss, [
    "--font-en: 'Ubuntu'", "--font-th: 'Noto Sans Thai'", '--ui-bg: rgba(0, 0, 0, .72)',
    '--ease-menu: cubic-bezier(.22, 1, .36, 1)', '--duration-fast: 170ms', '--duration-normal: 300ms', '--duration-slow: 460ms',
    '@keyframes menuItemEnter', '@keyframes submenuEnterForward', '@keyframes submenuEnterBack',
    'transform: translate3d(0, 0, 0);',
    '@keyframes settingsContentOut', '@keyframes settingsContentIn', '@keyframes pauseMenuEnter',
    "html[lang='th']", '@media (prefers-reduced-motion: reduce)', '@media (max-width: 760px)',
    '.settings-layout', '.pause-menu-btn', '.waiting-shell', '.waiting-ui-toggle',
    '.hud-meter-stack { width: 100%; gap: 0; }', 'touch-action: none', '.inventory-entry.equipped', '.boss-bar-track',
    ".waiting-screen[data-ui-hidden='true'] .waiting-shell { visibility: hidden", '#network-pill { top: auto !important; right: auto !important; bottom: 18px; left: 18px',
    '.cooldown-number { position: absolute', "body[data-mobile-attack='auto'] .fire-btn", "body[data-mobile-attack='aim'] .fire-btn", 'body[data-mobile-layout-edit] #mobile-controls', "body[data-ui-screen='armory'] #continue-btn { grid-column: 1 / -1",
    'max(8px, env(safe-area-inset-top))', '@media (max-width: 420px)', 'max-height:min(92dvh,760px)',
    '.hud-right.run-status:hover { padding: 5px 0; border: 0; background: transparent; backdrop-filter: none'
], 'quiet UI design system');

for (const [name, source] of [['game.css', gameCss], ['modern-ui.css', modernCss], ['editor.css', editorCss]]) {
    if (/gradient\s*\(/i.test(source)) throw new Error(`${name} still contains a UI gradient.`);
}
if (!modernCss.includes('box-shadow: none !important') || !editorCss.includes('box-shadow: none !important')) {
    throw new Error('Global no-shadow protection is missing from the player or editor interface.');
}

requireAll(ui, [
    'function show(name, direction)', 'is-entering-forward', 'is-entering-back',
    'function setSettingsCategory', 'function showPauseView', 'function moveFocus',
    "key === 'arrowdown'", "key === 'arrowup'", "key === 'escape'",
    'requestFullscreen', 'function setWaitingUiHidden', "dungeonKnightUiScale", "dungeonKnightHudOpacity", "dungeonKnightUiMotion",
    "dungeonKnightMobileAttack", "dungeonKnightKeybinds", "dungeonKnightMobileLayout", "dungeonKnightDebugMode", "document.body.setAttribute('data-mobile-attack'", 'event.isComposing', 'DKMods.restartIfRequired'
], 'menu interaction controller');

requireAll(thai, [
    "'Play': 'เล่น'", "'Settings': 'การตั้งค่า'", "'Waiting Room': 'ห้องรอ'",
    "'Select Class': 'เลือกคลาส'", "'Inventory': 'คลัง'", "'Crafting': 'การคราฟต์'",
    "'Item Editor · v1.9': 'ตัวแก้ไขไอเท็ม · v1.9'", "'Accessibility': 'การช่วยการเข้าถึง'",
    "'Hide UI': 'ซ่อน UI'", "'Show UI': 'แสดง UI'", "'Mobile attack control': 'การโจมตีบนมือถือ'",
    "'THE PALACE': 'พระราชวัง'", "'SPORE GROTTO': 'ถ้ำสปอร์'",
    "'DARK SPIRIT': 'วิญญาณทมิฬ'", "'GLACIAL ARCHIVIST': 'ผู้จดบันทึกแห่งน้ำแข็ง'",
    "'Powder Surveyor': 'นักวางดินระเบิด'", "'TOTAL ECLIPSE': 'สุริยุปราคาเต็มดวง'",
    "'Shape your dungeon': 'ปรับดันเจี้ยนให้เป็นแบบของคุณ'", "'ASHBOUND': 'ผู้ถูกผูกด้วยเถ้าถ่าน'"
], 'Thai interface translation');
requireAll(japanese, [
    "DK.i18n.register('ja'", "label: '日本語'", "'Aim joystick': '照準ジョイスティック'",
    "'Copy diagnostic report': '診断レポートをコピー'", "'Player name': 'プレイヤー名'", "'Shape your dungeon': 'ダンジョンを自分好みに'", "'ASHBOUND': '灰縛り'", 'DungeonKnightJapaneseLocalization'
], 'built-in Japanese interface translation');

requireAll(loader, ['function configure', 'function step', 'function fail', 'function finish', 'document.fonts.ready'], 'counted loading screen');

requireAll(mods, [
    "var GAME_VERSION = '1.9.2'", "manifest.json is required", "icon.png is required",
    "new Function('DK','mod','module','exports'", 'function setRecordEnabled', 'function setEnabled', 'pendingWrites',
    'function moveRecord', 'function makeZip', 'function extractZip', 'function restartIfRequired', 'i18n: {', 'events: {', 'rules: {', 'Export ZIP'
], 'Mods runtime');
requireAll(html, [
    'id="mods-menu"', 'id="mod-import-btn"', 'id="mod-create-btn"', 'id="mod-list"',
    'id="mod-create-dialog"', 'id="mod-zip-input"', 'Shape your dungeon', 'manifest.json', 'icon.png'
], 'Mods interface');
if (/mod-github|githubState|GITHUB_TOPIC|Search duherse-mod|GitHub Browser/i.test(html + mods)) throw new Error('Removed GitHub discovery UI or runtime returned.');
requireAll(bootstrap, ['script.async = false', 'Promise.all(entries.map(load))', 'loadBatch(content)', 'DKMods.bootstrap', 'loader.configure(baseFiles + totalScripts'], 'parallel deterministic loader');
requireAll(i18n, ["element.closest('[data-i18n-lock],script,style,textarea", '/^REROLL (\\d+)$/', '/^WAVE (\\d+) · (.+)$/'], 'runtime localization and English editor lock');
requireAll(game, [
    'function syncGuestSceneFromSnapshot', 'sceneRevision:netSceneRevision', 'function predictiveEnemyAim',
    'debugGodMode || this.isDashing || this.invuln > 0', 'function drawBiomeScreenGrade',
    "document.addEventListener('compositionstart',clearKeyboardState)", 'new Set()', 'setPointerCapture(e.pointerId)',
    "document.body.getAttribute('data-mobile-attack')==='auto'", "document.body.getAttribute('data-mobile-attack')==='aim'", 'function setKeybinding', 'function diagnosticReport', "el('active-cd-number')",
    'classicPresentation:true', 'EFFECT_QUALITY_PROFILES', 'updateBiomeVariant', 'drawBiomeVariantSkin', 'updateSignatureEnemy', 'manaTickAmount'
], 'gameplay, touch, boss, cooldown, and synchronization updates');
if (game.includes('BiomeBoss.prototype.fireCurtain') || game.includes('bossCurtain')) throw new Error('Generic boss bullet curtain returned.');
if (game.includes("showToast('COIN RUSH!")) throw new Error('Coin Rush announcement remains in gameplay.');
for (const [name, source] of [['lobby', lobby], ['network', net], ['server', server], ['game', game]]) {
    if (!source.includes('Intl.Segmenter') || (!source.includes('\\p{L}') && !source.includes('\\u0E00'))) {
        throw new Error(`${name} no longer preserves Thai/Japanese player names.`);
    }
}

const openBraces = (modernCss.match(/{/g) || []).length;
const closeBraces = (modernCss.match(/}/g) || []).length;
if (openBraces !== closeBraces) throw new Error(`Modern CSS brace mismatch: ${openBraces}/${closeBraces}`);

if (!built.includes("--font-en: 'Ubuntu'") || !built.includes("--font-th: 'Noto Sans Thai'") || !built.includes('Noto+Sans+Thai') || !built.includes('Noto+Sans+JP') || built.includes("font-family: 'Cinzel'")) {
    throw new Error('Offline build does not contain the language-aware Ubuntu/Thai/Japanese font system.');
}
if ((built.match(/data:font\/ttf;base64,/g) || []).length !== 2) throw new Error('Local build should embed Ubuntu for the game and editor, but not the Thai/Japanese webfonts.');
if (/font-family:\s*'Google Sans'|google-sans-(?:regular|medium|semibold|bold)\.ttf/i.test(built)) throw new Error('Legacy Thai font embedding remains in the local build.');

console.log(JSON.stringify({
    directMainMenuEntries: mainMenuEntries.length,
    settingsCategories: (html.match(/data-settings-category=/g) || []).length,
    sharedMotionTokens: 4,
    responsiveBreakpoints: (modernCss.match(/@media/g) || []).length,
    thaiMajorScreens: 8,
    cssGradients: 0,
    loadingItems: 56,
    multiplayerSceneRecovery: true,
    touchMultiPointer: true
}));

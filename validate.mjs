import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const mobileMode = process.env.DK_VALIDATE_MOBILE === '1';

const target = new URL('./dist/index.html', import.meta.url);
const html = await readFile(target, 'utf8');
if (!html.includes('<title>Dungeon Knight: Infinite Arsenal v1.9.2</title>') || !html.includes('<div class="menu-version" aria-label="Game version">v1.9.2</div>')) throw new Error('v1.9.2 release identity is missing.');
const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((entry) => entry[1]);
const gameScript = inlineScripts.find((script) => script.includes('DUNGEON KNIGHT v1.9 — UNIQUE WEAPON CATALOG'));
const editorScript = [...inlineScripts].reverse().find((script) => script.includes('function defaultDocument') && script.includes('window.DKEditorCore'));
const loaderScript = inlineScripts.find((script) => script.includes('window.DKLoader'));
const match = gameScript ? [null, gameScript] : null;
if (!match) throw new Error('Game script not found.');
if (inlineScripts.length !== 5 || !editorScript || !loaderScript || !inlineScripts.at(-1).includes('DKLoader.finish') || !html.includes('id="weapon-editor-screen"') || !html.includes('data-editor-tab="bulletAdvanced"') || !html.includes('data:font/ttf;base64,')) throw new Error('Offline loading or Weapon/Bullet Maker bundle is incomplete.');
if (!html.includes("--font-en: 'Ubuntu'") || !html.includes("--font-th: 'Noto Sans Thai'") || !html.includes('Noto+Sans+Thai') || !html.includes('Noto+Sans+JP') || !html.includes('@keyframes menuItemEnter') || !html.includes('@keyframes submenuEnterForward') || !html.includes('@keyframes settingsContentIn') || !html.includes('@keyframes pauseMenuEnter') || !html.includes('class="settings-layout"') || !html.includes('class="waiting-shell"') || !html.includes('id="waiting-ui-toggle"') || !html.includes('class="hud-meter-stack"') || !html.includes('data-pause-panel="settings"') || !html.includes('id="class-focus"') || !html.includes('id="language-select"') || !html.includes('id="menu-ui-scale-select"') || !html.includes('id="pause-ui-scale-select"') || !html.includes('id="menu-hud-opacity-select"') || !html.includes('id="menu-motion-select"') || !html.includes('window.DK_THAI_WEAPON_DESCRIPTIONS') || !html.includes('window.DK_BUNDLES.th') || !html.includes("DK.i18n.register('ja'") || !html.includes('window.DKI18n')) throw new Error('Quiet PC UI animation, settings, or language bundle is incomplete.');
if (!html.includes("ctx.font='7px \"Noto Sans JP\", \"Noto Sans Thai\", \"Ubuntu\", sans-serif'") || html.includes("ctx.font='700 '+(13*readableScale)")) throw new Error('Original compact player-name label was not restored.');
inlineScripts.forEach((script, index) => { try { new Function(script); } catch (error) { throw new Error(`Offline script ${index + 1} is invalid: ${error.message}`); } });
if (!match[1].includes('DUNGEON KNIGHT v1.9 — UNIQUE WEAPON CATALOG') || (match[1].match(/Former module: weapons\/unique\//gu) || []).length !== 89 || !match[1].includes('var PALACE_STATUE_CENTER_Y=0')) throw new Error('v1.9 unique-weapon catalog or centered Palace statue contract failed.');
const realIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((entry) => entry[1]));
const realCanvasIds = new Set([...html.matchAll(/<canvas[^>]*\bid="([^"]+)"/g)].map((entry) => entry[1]));

new Function(match[1]);

const nodes = new Map();
const makeClassList = () => {
  const values = new Set();
  return {
    add(...names) { names.forEach((name) => values.add(name)); },
    remove(...names) { names.forEach((name) => values.delete(name)); },
    toggle(name, force) { const enabled = force === undefined ? !values.has(name) : !!force; if (enabled) values.add(name); else values.delete(name); return enabled; },
    contains(name) { return values.has(name); }
  };
};
function makeNode(id = '') {
  if (!nodes.has(id)) {
    const attributes = new Map();
    nodes.set(id, {
      id,
      style: { setProperty(name, value) { this[name] = value; } },
      classList: makeClassList(),
      textContent: '',
      nodeValue: '',
      innerHTML: '',
      disabled: false,
      children: [],
      clientWidth: 900,
      clientHeight: 600,
      appendChild(child) { this.children.push(child); return child; },
      addEventListener() {},
      setAttribute(name, value) { attributes.set(name, String(value)); },
      getAttribute(name) { return attributes.get(name) ?? null; },
      hasAttribute(name) { return attributes.has(name); },
      removeAttribute(name) { attributes.delete(name); },
      closest() { return null; },
      focus() {},
      getBoundingClientRect() { return { left: 0, top: 0, width: 118, height: 118 }; },
      querySelector() { return null; },
      querySelectorAll() { return []; }
    });
  }
  return nodes.get(id);
}

const drawing = new Proxy({}, {
  get(target, property) {
    if (!(property in target)) target[property] = () => {};
    return target[property];
  },
  set(target, property, value) { target[property] = value; return true; }
});
drawing.createLinearGradient = drawing.createRadialGradient = () => ({ addColorStop() {} });

const canvas = makeNode('gameCanvas');
canvas.getContext = () => drawing;

const context = {
  console,
  Math,
  JSON,
  Object,
  Array,
  Number,
  String,
  Boolean,
  Date,
  setTimeout() { return 1; },
  clearTimeout() {},
  requestAnimationFrame(callback) { context.nextFrame = callback; return 1; },
  performance: { now: () => 1000 },
  innerWidth: mobileMode ? 780 : 1280,
  innerHeight: mobileMode ? 1560 : 720,
  matchMedia: (query) => ({ matches: mobileMode && /pointer:\s*coarse/.test(query) }),
  navigator: { userAgent: mobileMode ? 'mobile-validation' : 'desktop-validation' },
  localStorage: { getItem() { return null; }, setItem() {} },
  document: {
    body: makeNode('body'),
    addEventListener() {},
    getElementById(id) {
      if (!realIds.has(id)) return null;
      if (id === 'gameCanvas') return canvas;
      const node = makeNode(id);
      if (realCanvasIds.has(id)) { node.width ||= 230; node.height ||= 78; node.getContext = () => drawing; }
      return node;
    },
    createElement(tag = '') {
      const node = makeNode('created-' + Math.random());
      if (String(tag).toLowerCase() === 'canvas') { node.width = 230; node.height = 78; node.getContext = () => drawing; }
      return node;
    },
    createTextNode(text) { const node = makeNode('text-' + Math.random()); node.textContent = String(text); node.nodeValue = String(text); return node; },
    querySelector() { return makeNode('query'); },
    querySelectorAll() { return []; }
  },
  addEventListener() {},
  devicePixelRatio: mobileMode ? 2 : 1
};
context.window = context;

vm.createContext(context);
vm.runInContext(match[1], context, { filename: 'index.html' });
await context.DK_BOOT_PROMISE;

if (!context.DKGame.enterWeaponTest('rustPistol') || !context.DKGame.isWeaponTest() || context.DKGame.networkSnapshot().scene !== 'editorTest') throw new Error('Controlled Weapon Maker test area did not open.');
if (!context.DKGame.exitWeaponTest() || context.DKGame.isWeaponTest()) throw new Error('Controlled Weapon Maker test area did not exit cleanly.');
const editorBoot = vm.runInContext(editorScript, context, { filename: 'weapon-maker.js' });
if (editorBoot && typeof editorBoot.then === 'function') await editorBoot;
if (!context.DKEditor || !context.DKEditorCore) throw new Error('Weapon Maker runtime did not initialize.');
const blueprintCoverage = context.DKEditorCore.blueprintCoverage();
if (blueprintCoverage.missing.length) {
  for (const item of blueprintCoverage.missing.filter((value) => value.endsWith(':document'))) {
    const id = item.slice(0, -':document'.length);
    console.error(id, context.DKEditorCore.validateDocument(context.DKEditorCore.documentFromWeapon(id)).errors.slice(0, 12));
  }
}
if (blueprintCoverage.sourceWeapons !== 130 || blueprintCoverage.behaviorHooks < 130 || blueprintCoverage.nativeNodes < 2500 || blueprintCoverage.helperFunctions < 5 || blueprintCoverage.complexGraphs < 50 || blueprintCoverage.missing.length) throw new Error('Built-in native graph migration is incomplete: ' + JSON.stringify(blueprintCoverage));
const forbiddenMechanicNodes = ['originalWeaponHook','originalBulletHook','originalProjectileArt','originalProjectilePrimitive','originalProjectileOverlay','originalImpactEffect'];
if (forbiddenMechanicNodes.some((type) => context.DKEditorCore.nodeDefinitions[type])) throw new Error('A forbidden source-mechanic shortcut node is still registered.');
const requiredUniversalNodes = ['spawnProjectile','nativeSpawnProjectile','playEffect','nativePlayEffect','delay','timer','nativeWait','branch','nativeBranch','nativeForLoop'];
if (requiredUniversalNodes.some((type) => !context.DKEditorCore.nodeDefinitions[type])) throw new Error('Spawn Bullet, Spawn Effect, Wait, branch, or loop support is missing from Weapon Maker.');
function blueprintHas(id, graphName, type) { return context.DKEditorCore.documentFromWeapon(id)[graphName].nodes.some((node) => node.type === type); }
if (!blueprintHas('hiveLauncher','bulletGraph','onBulletExpire') || !blueprintHas('hiveLauncher','bulletGraph','nativeSpawnProjectile') || !blueprintHas('paradoxShotgun','bulletGraph','onBulletUpdate') || !blueprintHas('beetleCarbine','bulletGraph','onBulletBounce') || !blueprintHas('heavenfallBallista','bulletGraph','nativeSpawnArea')) throw new Error('A built-in bullet lifecycle still lacks its universal-node implementation.');
context.DKEditor.open();
if (!makeNode('weapon-editor-screen').classList.contains('open') || !context.DKEditor.current()) throw new Error('Weapon Maker could not open and load an existing weapon.');
context.DKEditor.close();

function clonePacket(value) { return JSON.parse(JSON.stringify(value)); }
async function createIsolatedRuntime(seed, label) {
  const isolatedNodes = new Map();
  const isolatedClassList = () => ({ add() {}, remove() {}, toggle() {}, contains() { return false; } });
  function isolatedNode(id = '') {
    if (!isolatedNodes.has(id)) {
      const attributes = new Map();
      isolatedNodes.set(id, {
      id,
      style: {},
      classList: isolatedClassList(),
      textContent: '',
      nodeValue: '',
      innerHTML: '',
      disabled: false,
      children: [],
      appendChild(child) { this.children.push(child); return child; },
      addEventListener() {},
      setAttribute(name, value) { attributes.set(name, String(value)); },
      getAttribute(name) { return attributes.get(name) ?? null; },
      hasAttribute(name) { return attributes.has(name); },
      removeAttribute(name) { attributes.delete(name); },
      closest() { return null; },
      getBoundingClientRect() { return { left: 0, top: 0, width: 118, height: 118 }; },
      querySelector() { return null; },
      querySelectorAll() { return []; }
      });
    }
    return isolatedNodes.get(id);
  }
  const isolatedDrawing = new Proxy({}, {
    get(target, property) { if (!(property in target)) target[property] = () => {}; return target[property]; },
    set(target, property, value) { target[property] = value; return true; }
  });
  isolatedDrawing.createLinearGradient = isolatedDrawing.createRadialGradient = () => ({ addColorStop() {} });
  const isolatedCanvas = isolatedNode('gameCanvas');
  isolatedCanvas.getContext = () => isolatedDrawing;
  let randomState = seed >>> 0;
  const seededMath = Object.create(Math);
  seededMath.random = () => ((randomState = (randomState * 1664525 + 1013904223) >>> 0) / 4294967296);
  const netLog = [];
  const runtime = {
    console,
    Math: seededMath,
    JSON,
    Object,
    Array,
    Number,
    String,
    Boolean,
    Date,
    setTimeout() { return 1; },
    clearTimeout() {},
    requestAnimationFrame(callback) { runtime.nextFrame = callback; return 1; },
    performance: { now: () => 1000 },
    innerWidth: 1280,
    innerHeight: 720,
    matchMedia: () => ({ matches: false }),
    navigator: { userAgent: 'isolated-' + label },
    localStorage: { getItem() { return null; }, setItem() {} },
    document: {
      body: isolatedNode('body'),
      addEventListener() {},
      getElementById(id) {
        if (!realIds.has(id)) return null;
        if (id === 'gameCanvas') return isolatedCanvas;
        const node = isolatedNode(id);
        if (realCanvasIds.has(id)) { node.width ||= 230; node.height ||= 78; node.getContext = () => isolatedDrawing; }
        return node;
      },
      createElement(tag = '') {
        const node = isolatedNode('created-' + seededMath.random());
        if (String(tag).toLowerCase() === 'canvas') { node.width = 230; node.height = 78; node.getContext = () => isolatedDrawing; }
        return node;
      },
      createTextNode(text) { const node = isolatedNode('text-' + seededMath.random()); node.textContent = String(text); node.nodeValue = String(text); return node; },
      querySelector() { return isolatedNode('query'); },
      querySelectorAll() { return []; }
    },
    addEventListener() {},
    devicePixelRatio: 1
  };
  runtime.DKNet = {
    sendToHost(message, options) { netLog.push({ method: 'sendToHost', message: clonePacket(message), options: clonePacket(options || {}) }); },
    broadcast(message, options) { netLog.push({ method: 'broadcast', message: clonePacket(message), options: clonePacket(options || {}) }); },
    updateRoom(state, meta) { netLog.push({ method: 'updateRoom', state, meta: clonePacket(meta || {}) }); },
    leaveRoom() { netLog.push({ method: 'leaveRoom' }); }
  };
  runtime.__netLog = netLog;
  runtime.window = runtime;
  vm.createContext(runtime);
  vm.runInContext(match[1], runtime, { filename: 'isolated-' + label + '.html' });
  await runtime.DK_BOOT_PROMISE;
  return runtime;
}

const expectedClasses = {
  melee: { maxHp: 11, maxArmor: 8, maxMana: 200, category: ['MELEE'], armorDelay: 540, armorTick: 180 },
  gunner: { maxHp: 7, maxArmor: 5, maxMana: 200, category: ['GUN', 'ARCHER'], armorDelay: 720, armorTick: 240 },
  magic: { maxHp: 8, maxArmor: 6, maxMana: 300, category: ['MAGIC'], armorDelay: 690, armorTick: 225 },
  independent: { maxHp: 9, maxArmor: 7, maxMana: 250, category: ['MELEE', 'GUN', 'ARCHER', 'MAGIC'], armorDelay: 660, armorTick: 220 }
};
const classData = context.DK_DEBUG.classData();
const mageClass = classData.find((entry) => entry.id === 'magic');
if (classData.length !== 4 || !mageClass || mageClass.maxMana !== 300 || mageClass.manaTickAmount !== 2 || mageClass.manaTickFrames !== 120 || mageClass.manaDropBonus !== 0.07 || mageClass.manaRegen <= classData.find((entry) => entry.id === 'independent').manaRegen) throw new Error('Class lobby data is incomplete: ' + JSON.stringify(classData));
if (classData.some((entry) => !entry.trait || !entry.traitDesc) || new Set(classData.map((entry) => entry.trait)).size !== 4) throw new Error('Class status traits are incomplete: ' + JSON.stringify(classData));
const meleeBias = classData.find((entry) => entry.id === 'melee').shop;
const gunnerBias = classData.find((entry) => entry.id === 'gunner').shop;
const magicBias = classData.find((entry) => entry.id === 'magic').shop;
if (!(meleeBias.MELEE > meleeBias.GUN && gunnerBias.GUN > gunnerBias.MELEE && gunnerBias.ARCHER > gunnerBias.MAGIC && magicBias.MAGIC > magicBias.GUN)) throw new Error('Class-weighted Armory odds failed: ' + JSON.stringify(classData));
const starterPools = context.DK_DEBUG.starterPoolData();
if (starterPools.allCommon.length < 28 || starterPools.independent.length !== starterPools.allCommon.length || starterPools.melee.length < 5 || starterPools.magic.length < 8 || starterPools.gunner.length < 15) throw new Error('Full Common class starter pools are incomplete: ' + JSON.stringify(starterPools));
for (const [id, expected] of Object.entries(expectedClasses)) {
  if (!context.DK_DEBUG.selectClass(id)) throw new Error('Could not select class ' + id);
  context.DK_DEBUG.start();
  const classState = context.DK_DEBUG.state();
  if (classState.classId !== id || classState.maxHp !== expected.maxHp || classState.maxArmor !== expected.maxArmor || classState.maxMana !== expected.maxMana || classState.equippedRarity !== 'common' || !expected.category.includes(classState.equippedCategory) || classState.armorRegenInterval !== expected.armorTick) {
    throw new Error('Class starter contract failed for ' + id + ': ' + JSON.stringify(classState));
  }
}
context.DK_DEBUG.selectClass('independent');
context.DK_DEBUG.start();

for (let frame = 0; frame < 240 && context.DK_DEBUG.state().active; frame += 1) {
  const callback = context.nextFrame;
  if (typeof callback !== 'function') throw new Error('Animation loop stopped.');
  callback(1016 + frame * 16.67);
}

let state = context.DK_DEBUG.state();
if (state.wave !== 1 || state.weapons.length !== 1 || state.equippedRarity !== 'common' || state.enemies < 1 || state.classId !== 'independent') throw new Error('Run startup check failed: ' + JSON.stringify(state));

const requiredDebugCommands = ['giveWeapon','listWeapons','giveLegendaryWeapons','legendaryBoss','giveCoins','godMode','help','weaponArchitecture','projectileIdentityTrial','weaponBeautyTrial','biomeVariantTrial','listBiomes','setBiome','nextBiome','previousBiome','autoCycleBiomes','stopBiomeCycle'];
if (requiredDebugCommands.some((name) => typeof context.DK_DEBUG[name] !== 'function')) throw new Error('v1.9 BUILD 02 debug API is incomplete.');
if (context.DK_DEBUG.listWeapons().length !== 130) throw new Error('Debug weapon catalog does not match the loaded arsenal.');
const weaponArchitecture = context.DK_DEBUG.weaponArchitecture();
if (weaponArchitecture.weapons !== 130 || weaponArchitecture.renderers !== 130 || weaponArchitecture.missingBehavior.length || weaponArchitecture.missingRenderer.length) throw new Error('Weapon module architecture is incomplete: ' + JSON.stringify(weaponArchitecture));

const catalog = context.DK_DEBUG.catalog();
const thaiWeaponIds = Object.keys(context.DK_THAI_WEAPON_DESCRIPTIONS || {});
if (thaiWeaponIds.length !== 130 || thaiWeaponIds.some((id) => !context.DKContent.weapons[id] || !/[ก-๙]/.test(context.DK_BUNDLES.th.describeWeapon(context.DKContent.weapons[id], id))) || context.DKContent.weapons.afterimageSaber.name !== 'AFTERIMAGE SABER' || context.DKContent.activeSkills.riftStep.name !== 'RIFT STEP') throw new Error('Thai weapon-description coverage or protected item-name contract failed.');
if (!context.DK_BUNDLES.ja || context.DK_BUNDLES.ja.text['Aim joystick'] !== '照準ジョイスティック' || context.DK_BUNDLES.ja.text['Copy diagnostic report'] !== '診断レポートをコピー' || !/[ぁ-んァ-ヶ一-龠]/.test(context.DK_BUNDLES.ja.descriptions.activeSkills.riftStep)) throw new Error('Built-in Japanese localization coverage failed.');
if (catalog.weapons !== 130 || catalog.signatureEnemies !== 16 || catalog.enemies !== 55 || catalog.enemyVariants !== 16 || catalog.biomes !== 16 || catalog.bosses !== 16 || catalog.resources !== 5 || catalog.cores !== 0 || catalog.activeSkills !== 10 || catalog.passiveSkills !== 24) {
  throw new Error('Expansion catalog is incomplete: ' + JSON.stringify(catalog));
}

const traitTrial = context.DK_DEBUG.classTraitTrial();
if (Object.values(traitTrial).some((value) => value !== true)) throw new Error('Class combat traits failed: ' + JSON.stringify(traitTrial));

if (state.maxMana !== 250 || state.mana > 250) throw new Error('Independent mana contract failed: ' + JSON.stringify(state));
const manaRegen = context.DK_DEBUG.manaRegenTrial();
if (manaRegen.mageMaxMana !== 300 || manaRegen.beforeTick !== 0 || manaRegen.firstTick !== 2 || manaRegen.secondTick !== 4 || manaRegen.tickAmount !== 2 || manaRegen.tickFrames !== 120 || manaRegen.regularPassive !== 0 || Math.abs(manaRegen.regularDropChance - 0.55) > 1e-9 || Math.abs(manaRegen.mageDropChance - 0.62) > 1e-9 || manaRegen.mageDropChance <= manaRegen.regularDropChance || manaRegen.regularPickup < 20 || manaRegen.bossDropsPerPlayer !== 2) throw new Error('Mage pulse and drop-driven mana economy contract failed: ' + JSON.stringify(manaRegen));
if (state.maxHp !== 9 || state.maxArmor !== 7 || state.armor < 0 || state.armor > 7) throw new Error('Player HP/armor startup contract failed: ' + JSON.stringify(state));
if (state.biomeProps !== 4 || state.roomDecor < 6 || state.rectObstacles < 8 || !state.layout) throw new Error('Authored one-room biome did not spawn: ' + JSON.stringify(state));

const armor = context.DK_DEBUG.armorTrial();
if (armor.afterHit.hp !== 10 || armor.afterHit.armor !== 5 || armor.afterHit.delay !== 660 || armor.beforeTick !== 5 || armor.afterTick !== 6 || armor.interval !== 220) {
  throw new Error('Slow armor regeneration contract failed: ' + JSON.stringify(armor));
}

const expectedPixelRatio = Math.min(2, context.devicePixelRatio * state.renderScale);
if (state.pixelRatio !== expectedPixelRatio || state.canvasWidth !== Math.round(context.innerWidth * expectedPixelRatio) || state.canvasHeight !== Math.round(context.innerHeight * expectedPixelRatio)) throw new Error('Smooth resolution sizing failed: ' + JSON.stringify(state));

const balance = context.DK_DEBUG.balanceData();
if (balance.wave10 !== 27 || balance.wave11 !== 25 || balance.wave15 !== 31 || balance.wave20 !== 35 || balance.wave30 !== 45 || balance.wave40 !== 52 || balance.hp10 !== 1.15 || balance.hp11 !== 1.3 || balance.hp21 !== 1.8 || balance.hp31 !== 2.5 || balance.hp41 !== 3.5 || balance.regularCoinChance !== 0.74 || balance.bonusCoinChance !== 0.18 || balance.shopPriceMultiplier !== 0.8 || balance.shopSize !== 8 || balance.weaponShopSize !== 4 || balance.supportShopSize !== 4 || balance.arenaLimit !== 1220 || balance.worldLimit !== 1360 || balance.starforgeShopPrice !== 90) throw new Error('Wave/shop/map balance contract failed: ' + JSON.stringify(balance));

const expectedPhaseTotals = { 1: 7, 10: 27, 11: 25, 20: 35, 30: 45, 40: 52 };
for (const waveNumber of [1, 10, 11, 20, 30, 40]) {
  const phase = context.DK_DEBUG.phaseData(waveNumber);
  const isBossWave = waveNumber % 5 === 0;
  const correctBossSplit = isBossWave
    ? phase.bossPhase && phase.regularTotal === Math.ceil(phase.total * 0.7) && phase.counts[1] === 0
    : !phase.bossPhase && phase.regularTotal === phase.total && Math.abs(phase.counts[0] - phase.counts[1]) <= 1;
  if (phase.counts.length !== 2 || phase.total !== expectedPhaseTotals[waveNumber] || phase.counts[0] + phase.counts[1] !== phase.regularTotal || !correctBossSplit) throw new Error('Two-phase wave/boss split failed at wave ' + waveNumber + ': ' + JSON.stringify(phase));
}
const phaseTrial = context.DK_DEBUG.twoPhaseTrial();
if (!phaseTrial.waited || !phaseTrial.advanced || !phaseTrial.finished || phaseTrial.first !== phaseTrial.counts[0] || phaseTrial.second !== phaseTrial.counts[1]) throw new Error('Two-phase reinforcement flow failed: ' + JSON.stringify(phaseTrial));

const bosses = context.DK_DEBUG.bossData();
if (bosses.length !== 16 || new Set(bosses.map((boss) => boss.key)).size !== 16 || new Set(bosses.map((boss) => boss.name)).size !== 16 || new Set(bosses.map((boss) => boss.title)).size !== 16 || new Set(bosses.map((boss) => boss.color)).size !== 16 || bosses.some((boss) => boss.combos.length !== 6 || new Set(boss.combos).size !== boss.combos.length || !boss.loot.sovereignEssence || Object.keys(boss.loot).length < 3 || boss.hp < 350 || boss.speed <= 0)) throw new Error('Sixteen biome Sovereigns are incomplete: ' + JSON.stringify(bosses));
const darkSpirit = bosses.find((boss) => boss.key === 'ember');
if (!darkSpirit || darkSpirit.hp !== 430 || darkSpirit.hp >= 500) throw new Error('Dark Spirit health rebalance failed: ' + JSON.stringify(darkSpirit));
const bossTrial = context.DK_DEBUG.bossTrial();
if (Object.values(bossTrial).some((value) => value !== true)) throw new Error('Boss phase/combo/snapshot contract failed: ' + JSON.stringify(bossTrial));
const bossPatternTrial = context.DK_DEBUG.bossPatternTrial();
if (bossPatternTrial.runs !== 96 || bossPatternTrial.completed !== 96 || !bossPatternTrial.finite || bossPatternTrial.errors.length || bossPatternTrial.maxBullets >= 980 || bossPatternTrial.maxArenaZones > 28) throw new Error('Boss choreography simulation failed: ' + JSON.stringify(bossPatternTrial));
const mineFairness = context.DK_DEBUG.mineFairnessTrial();
if (Object.values(mineFairness).some((value) => value !== true)) throw new Error('Powder Surveyor mine fairness failed: ' + JSON.stringify(mineFairness));
const damageNumbers = context.DK_DEBUG.damageNumberTrial();
if (damageNumbers.count !== 7 || damageNumbers.unique !== 7 || !damageNumbers.drifting) throw new Error('Burst damage-number separation failed: ' + JSON.stringify(damageNumbers));
const projectileIdentity = context.DK_DEBUG.projectileIdentityTrial();
if (projectileIdentity.weapons !== 130 || projectileIdentity.fallback < 70 || projectileIdentity.bespoke < 45 || projectileIdentity.modelDiversity < 16 || projectileIdentity.missing.length || projectileIdentity.dotFallbacks.length || projectileIdentity.samples.rifle !== 'tracer' || projectileIdentity.samples.launcher !== 'rocket' || projectileIdentity.samples.shotgun !== 'pellet' || projectileIdentity.samples.bow !== 'arrow' || projectileIdentity.samples.magic !== 'eye' || projectileIdentity.samples.tidal !== 'droplet') throw new Error('Weapon projectile-identity pass failed: ' + JSON.stringify(projectileIdentity));
const weaponBeauty = context.DK_DEBUG.weaponBeautyTrial();
if (weaponBeauty.weapons !== 130 || !weaponBeauty.classicPresentation || !weaponBeauty.weaponColorFlash || !weaponBeauty.legendarySigil || weaponBeauty.sunlionColor !== '#f1c40f') throw new Error('v1.9.1 classic weapon presentation restoration failed: ' + JSON.stringify(weaponBeauty));

const networkRate = context.DK_DEBUG.networkRateTrial();
if (Object.values(networkRate).some((value) => value !== true)) throw new Error('Fixed 30 Hz snapshot contract failed: ' + JSON.stringify(networkRate));
const inputSettings = context.DK_DEBUG.inputSettingsTrial();
if (Object.values(inputSettings).some((value) => value !== true)) throw new Error('Remapping, aim-stick, Unicode input, or fixed-rate settings failed: ' + JSON.stringify(inputSettings));
const heldWeaponRender = context.DK_DEBUG.heldWeaponRenderTrial();
if (!heldWeaponRender.exclusive || heldWeaponRender.rendererCalls !== 1 || heldWeaponRender.fallbackBranches !== 0) throw new Error('Held weapon renderer composited multiple model paths: ' + JSON.stringify(heldWeaponRender));

const pickupTrial = context.DK_DEBUG.pickupTrial();
if (!pickupTrial.immediate || !pickupTrial.collected || !pickupTrial.coinStatic || pickupTrial.frames > 24) throw new Error('Optimized pickup behavior failed: ' + JSON.stringify(pickupTrial));

const wave15Odds = context.DK_DEBUG.rarityOdds(15, 0);
if (!wave15Odds.legendaryCraftOnly || !wave15Odds.mythicalCraftOnly || wave15Odds.legendaryWeaponPerShop !== 0 || wave15Odds.mythicalWeaponPerShop !== 0) throw new Error('Craft-only high rarity contract failed: ' + JSON.stringify(wave15Odds));

const weaponData = context.DK_DEBUG.weaponData();
if (weaponData.filter((weapon) => weapon.rarity === 'common').length < 32 || weaponData.filter((weapon) => weapon.rarity === 'uncommon').length < 26 || weaponData.filter((weapon) => weapon.rarity === 'rare').length < 28 || weaponData.filter((weapon) => weapon.rarity === 'epic').length < 28) throw new Error('Common-through-Epic arsenal was not expanded enough.');
const v171WeaponIds = ['bottlecapSlinger','kitchenTongs','pebbleChoir','kitebow','corkscrewMusket','candleSnuffer','beetleCarbine','tuningFork','bubblewrightStaff','tripwireBow','relayPistol','hedgehogBuckler','thunderheadBlunderbuss','undertakerShovel','prismMothCodex','railhookBow','alchemistRotary','hourhandRapier'];
if (v171WeaponIds.some((id) => !weaponData.some((weapon) => weapon.id === id))) throw new Error('v1.7.1 lower-tier arsenal is incomplete.');
for (const family of ['sunlion', 'dawnstar', 'seraph', 'rrhar', 'heavenfall', 'bazooka', 'smg', 'ar', 'shotgun']) {
  const tiers = new Set(weaponData.filter((weapon) => weapon.family === family).map((weapon) => weapon.rarity));
  if (['common', 'uncommon', 'rare', 'epic'].some((tier) => !tiers.has(tier))) throw new Error('Missing lower-rarity family tiers for ' + family + ': ' + JSON.stringify([...tiers]));
}
const v180WeaponIds = ['pipeRocket','clusterTube','seismicBazooka','dragonwakeBazooka','cobbleSmg','waspNine','phaseNeedleSmg','stormChoirSmg','wardenAr','rampartAr','auroraBattleRifle','eclipseServiceRifle','coachScatter','leverburstShotgun','riftbreakerShotgun','cathedralBreacher','sunshardMusket','tidalDrumgun','starfallVolleygun','graveglassAutocannon'];
if (v180WeaponIds.some((id) => !weaponData.some((weapon) => weapon.id === id))) throw new Error('v1.8 gun-family arsenal is incomplete.');
const familyData = context.DK_DEBUG.familyData();
if (['bazooka','smg','ar','shotgun'].some((family) => !familyData.some((entry) => entry.name === family && entry.weapons.length === 4 && ['common','uncommon','rare','epic'].every((tier) => entry.tiers.includes(tier))))) throw new Error('Weapon Family Bond data is incomplete: ' + JSON.stringify(familyData));
if (!weaponData.some((weapon) => weapon.id === 'rrharall' && weapon.rarity === 'legendary') || !weaponData.some((weapon) => weapon.id === 'heavenfallBallista' && weapon.rarity === 'legendary')) throw new Error('New Legendary weapons are missing.');
const spellBands = {
  common: weaponData.filter((w) => w.category === 'MAGIC' && w.rarity === 'common' && w.mana).map((w) => w.mana),
  uncommon: weaponData.filter((w) => w.category === 'MAGIC' && w.rarity === 'uncommon' && w.mana).map((w) => w.mana),
  rare: weaponData.filter((w) => w.category === 'MAGIC' && w.rarity === 'rare' && w.mana).map((w) => w.mana),
  epic: weaponData.filter((w) => w.category === 'MAGIC' && w.rarity === 'epic' && w.mana).map((w) => w.mana),
  legendary: weaponData.filter((w) => w.category === 'MAGIC' && w.rarity === 'legendary' && w.mana).map((w) => w.mana),
  mythical: weaponData.filter((w) => w.category === 'MAGIC' && w.rarity === 'mythical' && w.mana).map((w) => w.mana)
};
if (!spellBands.common.length || Math.max(...spellBands.common) > 3) throw new Error('Common magic is not low-cost.');
if (!spellBands.uncommon.length || Math.min(...spellBands.uncommon) < 4 || Math.max(...spellBands.uncommon) > 8) throw new Error('Uncommon magic cost band failed.');
if (!spellBands.rare.length || Math.min(...spellBands.rare) < 10 || Math.max(...spellBands.rare) > 16) throw new Error('Rare magic cost band failed.');
if (!spellBands.epic.length || Math.min(...spellBands.epic) < 18) throw new Error('Epic magic cost band failed.');
if (!spellBands.legendary.length || Math.min(...spellBands.legendary) < 18 || Math.max(...spellBands.legendary) >= 24) throw new Error('Legendary magic cost band failed.');
if (!spellBands.mythical.length || Math.min(...spellBands.mythical) < 24) throw new Error('Mythical magic cost band failed.');

for (const weaponId of context.DK_DEBUG.weaponIds()) {
  if (!match[1].includes("DKRegister.weaponRenderer('" + weaponId + "'")) throw new Error('Missing modular held-weapon art: ' + weaponId);
}

if (match[1].includes('A squat relic hand-cannon') || !/ctx\.fillStyle='#555';\s*ctx\.fillRect\(5,\s*-5,\s*24,\s*10\)/u.test(match[1])) {
  throw new Error('Rust Pistol was not restored to its original simple model.');
}

for (const weaponId of context.DK_DEBUG.weaponIds()) {
  if (!context.DK_DEBUG.equip(weaponId)) throw new Error('Could not equip weapon art: ' + weaponId);
  const callback = context.nextFrame;
  if (typeof callback !== 'function') throw new Error('Animation loop stopped during weapon art check.');
  callback(5200 + context.DK_DEBUG.weaponIds().indexOf(weaponId) * 16.67);
}

const rrharil = context.DK_DEBUG.rrharilTrial();
if (rrharil.targetCount !== 5 || rrharil.damages.some((damage) => damage < 100) || Math.abs(rrharil.manaUsed - 12) > 0.01 || rrharil.curseApplied.some((curse) => curse !== 300) || rrharil.curseDamage.some((damage) => Math.abs(damage - 5) > 0.01) || rrharil.finalCurse.some((curse) => curse !== 0)) {
  throw new Error("Rrhar'il ritual contract failed: " + JSON.stringify(rrharil));
}

const guns = context.DK_DEBUG.gunExpansionTrial();
if (Object.values(guns).some((value) => !value)) throw new Error('Eight-gun expansion contract failed: ' + JSON.stringify(guns));

const mythicals = context.DK_DEBUG.mythicalTrial();
if (mythicals.worldseam.queued !== 2 || mythicals.worldseam.initialDamage < 40 || mythicals.worldseam.echoLeft < 20 || mythicals.worldseam.echoRight < 20 || !mythicals.worldseam.cleared || mythicals.sovereign.queued !== 2 || mythicals.sovereign.echoRings !== 2 || mythicals.sovereign.reach < 230 || mythicals.sovereign.arc < 6.2 || mythicals.choir.notes < 12 || !mythicals.choir.converted || !mythicals.choir.piercing || mythicals.eclipse.suns !== 3 || !mythicals.eclipse.huge) {
  throw new Error('Mythical identity contract failed: ' + JSON.stringify(mythicals));
}

const legendaries = context.DK_DEBUG.legendaryTrial();
if (legendaries.sunlion.visited !== 7 || !legendaries.sunlion.returned || !legendaries.sunlion.allDamaged || !legendaries.sunlion.armorRestored || !legendaries.sunlion.manaRestored || legendaries.dawn.rays !== 8 || !legendaries.dawn.lightField || !legendaries.dawn.cleanses || legendaries.seraph.halos !== 6 || !legendaries.seraph.returning || !legendaries.seraph.cleansing || legendaries.rrharall.targets !== 3 || !legendaries.rrharall.allDamaged || Math.abs(legendaries.rrharall.manaUsed - 7.5) > 0.01 || !legendaries.rrharall.ritualReset || legendaries.heavenfall.lances !== 8 || !legendaries.heavenfall.lightField || !legendaries.heavenfall.cleansing || !legendaries.heavenfall.damaged || !legendaries.tierOrder) {
  throw new Error('Legendary light arsenal contract failed: ' + JSON.stringify(legendaries));
}

const arsenal = context.DK_DEBUG.arsenalTrial();
const fates = arsenal.oracleFates || [];
if (!arsenal.returningCog || !arsenal.needleShatter || !arsenal.constellation || arsenal.hiveWasps !== 5 || !arsenal.auroraTether || arsenal.organWaves !== 3 || fates.length !== 4 || fates[0].status !== 'burn' || fates[1].status !== 'freeze' || !fates[2].storm || !fates[3].vortex) {
  throw new Error('New weapon mechanics failed: ' + JSON.stringify(arsenal));
}

const freshArsenal = context.DK_DEBUG.newArsenalTrial();
if (freshArsenal.chalkBounce !== 1 || freshArsenal.candleShots !== 3 || freshArsenal.candleMana !== 2 || !freshArsenal.candleBurn || freshArsenal.mothSplit !== 4 || freshArsenal.mothHoming <= 0 || freshArsenal.rainDrops !== 6 || !freshArsenal.rainBlast || freshArsenal.phoenixFeathers !== 7 || freshArsenal.phoenixComets !== 7 || !freshArsenal.gravityReturn || !freshArsenal.gearTooth || !freshArsenal.echoQueued || !freshArsenal.echoLanded) {
  throw new Error('Common-Epic arsenal mechanics failed: ' + JSON.stringify(freshArsenal));
}

const epicExpansion = context.DK_DEBUG.epicExpansionTrial();
if (epicExpansion.paradox.pellets !== 7 || epicExpansion.paradox.phase !== 2 || !epicExpansion.paradox.reversed || !epicExpansion.paradox.seeking || epicExpansion.lotus.bud !== 'lotusBud' || epicExpansion.lotus.petals !== 12 || epicExpansion.marionette.linked !== 3 || !epicExpansion.marionette.echoed || !epicExpansion.anchor.field || !epicExpansion.anchor.burst || !epicExpansion.afterimage.moved || epicExpansion.afterimage.echoes !== 2 || !epicExpansion.crosswind.perfect || epicExpansion.crosswind.flanks !== 4) {
  throw new Error('Six-weapon Epic expansion failed: ' + JSON.stringify(epicExpansion));
}

const v171Arsenal = context.DK_DEBUG.v171ArsenalTrial();
if (Object.values(v171Arsenal).some((value) => value !== true)) throw new Error('Eighteen-weapon v1.7.1 mechanics failed: ' + JSON.stringify(v171Arsenal));

const v180Arsenal = context.DK_DEBUG.v180ArsenalTrial();
if (Object.values(v180Arsenal).some((value) => value !== true)) throw new Error('v1.8 weapon-family mechanics failed: ' + JSON.stringify(v180Arsenal));

context.DK_DEBUG.selectClass('independent');
context.DK_DEBUG.start();
context.DK_DEBUG.coinRush();
state = context.DK_DEBUG.state();
if (!state.waveVacuum || state.vacuumCoins !== 3) throw new Error('End-of-wave coin rush did not activate.');

for (let frame = 0; frame < 80 && context.DK_DEBUG.state().waveVacuum; frame += 1) {
  const callback = context.nextFrame;
  if (typeof callback !== 'function') throw new Error('Animation loop stopped during coin rush.');
  callback(6000 + frame * 16.67);
}
state = context.DK_DEBUG.state();
if (state.vacuumCoins !== 0 || state.pickups !== 0) throw new Error('Coin rush did not collect every coin.');

const armoryContext = context.DK_DEBUG.armory();
state = context.DK_DEBUG.state();
if (!state.shopMode || state.paused || state.offerCount !== 8) throw new Error('Playable Armory room did not open with eight offers.');
if (armoryContext.before.biome !== armoryContext.after.biome || armoryContext.before.equipped !== armoryContext.after.equipped || armoryContext.after.layout !== null || armoryContext.after.scene !== 'armory') throw new Error('Dedicated Armory map contract failed: ' + JSON.stringify(armoryContext));
if (state.rerollCost !== 6) throw new Error('Fixed reroll price failed: ' + JSON.stringify(state));
if (new Set(state.offers).size !== 8) throw new Error('Armory generated duplicate offers.');
if (state.offerDetails.slice(0, 4).some((offer) => offer.group !== 'weapon' || offer.rarity === 'legendary' || offer.rarity === 'mythical') || state.offerDetails.slice(4).some((offer) => offer.group === 'weapon')) throw new Error('Split Armory lanes failed: ' + JSON.stringify(state.offerDetails));
if (state.offerDetails.some((offer) => state.weapons.includes(offer.id))) throw new Error('Owned weapons appeared on sale platforms: ' + JSON.stringify(state.offerDetails));
if (!context.DK_DEBUG.approachOffer(2) || context.DK_DEBUG.state().nearbyShopIndex !== 2) throw new Error('Armory proximity inspection failed.');
const offerAction = context.DK_DEBUG.contextAction();
if (!offerAction.acted || offerAction.shots !== 0 || offerAction.bought !== 1 || context.DK_DEBUG.state().boughtOffers !== 1) throw new Error('Fire-to-buy context action failed: ' + JSON.stringify(offerAction));

if (!context.DK_DEBUG.approachForge()) throw new Error('Independent weapon forge proximity failed.');
const forgeBefore = context.DK_DEBUG.state();
const forgeAction = context.DK_DEBUG.contextAction();
if (!forgeAction.acted || forgeAction.shots !== 0 || forgeAction.forged !== 1) throw new Error('Fire-to-forge context action failed: ' + JSON.stringify(forgeAction));
const forgeAfter = context.DK_DEBUG.state();
if (forgeAfter.weaponLevel !== forgeBefore.weaponLevel + 1 || forgeAfter.coins !== forgeBefore.coins - forgeBefore.forgeCost || forgeAfter.shopForgePurchases !== 1 || forgeAfter.boughtOffers !== 1) throw new Error('Independent forge contract failed: ' + JSON.stringify({ forgeBefore, forgeAfter }));

for (let reroll = 0; reroll < 40; reroll += 1) {
  context.DK_DEBUG.setCoins(99999);
  context.DK_DEBUG.reroll();
  state = context.DK_DEBUG.state();
  if (state.rerollCost !== 6 || state.offerCount !== 8 || new Set(state.offers).size !== 8 || state.offerDetails.some((offer) => offer.group === 'weapon' && (offer.rarity === 'legendary' || offer.rarity === 'mythical'))) throw new Error('Reroll invariant failed: ' + JSON.stringify(state));
}

const recipes = context.DK_DEBUG.recipeData();
if (recipes.length !== 10 || recipes.filter((recipe) => recipe.tier === 'legendary').length !== 5 || recipes.filter((recipe) => recipe.tier === 'mythical').length !== 5 || recipes.some((recipe) => {
  const resourceIds = Object.keys(recipe.resources);
  if (!resourceIds.includes('sovereignEssence') || resourceIds.length < 2 || recipe.resourceTotal <= 0) return true;
  return recipe.tier === 'legendary'
    ? recipe.partRarities.length !== 1 || recipe.partRarities[0] !== 'rare'
    : recipe.partRarities.length !== 2 || !recipe.partRarities.includes('legendary') || !recipe.partRarities.some((rarity) => ['common', 'uncommon', 'rare', 'epic'].includes(rarity));
})) {
  throw new Error('Craft recipe progression failed: ' + JSON.stringify(recipes));
}
const earlyBossMaterials = bosses.slice(0, 2).reduce((bag, boss) => { for (const [id, amount] of Object.entries(boss.loot)) bag[id] = (bag[id] || 0) + amount; return bag; }, {});
if (!recipes.some((recipe) => recipe.tier === 'legendary' && Object.entries(recipe.resources).every(([id, amount]) => (earlyBossMaterials[id] || 0) >= amount))) throw new Error('Legendary material progression is still too grindy after two bosses: ' + JSON.stringify({ earlyBossMaterials, recipes }));
context.DK_DEBUG.focusRecipe(3);
state = context.DK_DEBUG.state();
if (state.craftResult !== 'rrharall' || !context.DK_DEBUG.grantRecipeParts() || !context.DK_DEBUG.approachCraft()) throw new Error("Rrhar'all crafting approach failed: " + JSON.stringify(context.DK_DEBUG.state()));
const craftAction = context.DK_DEBUG.contextAction();
if (!craftAction.acted || craftAction.shots !== 0 || !craftAction.craftingOpen || context.DK_DEBUG.state().craftingOpen !== true || !context.DK_DEBUG.craftNearby()) throw new Error("Rrhar'all crafting UI flow failed: " + JSON.stringify({ craftAction, state: context.DK_DEBUG.state() }));
state = context.DK_DEBUG.state();
if (!state.weapons.includes('rrharall') || state.weapons.some((id) => state.craftParts.includes(id)) || Object.keys(state.craftResources).some((id) => state.resources[id] !== 0) || state.shopCrafts !== 1) throw new Error('Crafting did not consume components/materials and grant result: ' + JSON.stringify(state));

context.DK_DEBUG.leaveArmory();
state = context.DK_DEBUG.state();
if (state.shopMode || state.wave !== 6 || state.biome !== 'WINTER VAULT') throw new Error('Armory continue button flow failed: ' + JSON.stringify(state));

const biomes = context.DK_DEBUG.biomeData();
if (biomes.length !== 16 || new Set(biomes.map((b) => b.hazard)).size !== 16 || new Set(biomes.map((b) => b.prop)).size !== 16 || new Set(biomes.map((b) => b.resonance)).size !== 16 || new Set(biomes.map((b) => b.name)).size !== 16 || new Set(biomes.map((b) => b.structure)).size !== 16 || new Set(biomes.map((b) => b.motif)).size !== 16 || new Set(biomes.map((b) => b.landscape)).size !== 16 || biomes.some((b) => !b.mechanic || !b.enemy || !b.enemy2 || !b.tileA || !b.tileB || !b.wall || !b.wallTop || !b.land || !b.terrain || !b.landscape || !/^rgba\(/.test(b.grade || ''))) {
  throw new Error('Biome roster is incomplete: ' + JSON.stringify(biomes));
}
if (biomes[0].name !== 'THE PALACE' || biomes[0].hazard !== 'ember' || biomes[0].prop !== 'royalBrazier' || biomes[0].landscape !== 'royalPalace') throw new Error('The Palace biome contract failed: ' + JSON.stringify(biomes[0]));
if (biomes[1].name !== 'WINTER VAULT' || biomes[1].hazard !== 'frost' || biomes[1].landscape !== 'frozenSanctum' || biomes[1].structure !== 'snowbound sanctum') throw new Error('Rebuilt Snow biome contract failed: ' + JSON.stringify(biomes[1]));
if (match[1].includes('function RoomFeature') || match[1].includes('roomFeatures') || match[1].includes('SHOOT 3 TIMES')) throw new Error('Legacy shoot-three-times room feature still exists in the runtime.');
const layouts = context.DK_DEBUG.layoutData();
if (layouts.length !== 16 || new Set(layouts.map((layout) => layout.id)).size !== 16 || new Set(layouts.map((layout) => layout.biome)).size !== 16 || new Set(layouts.map((layout) => layout.wallSignature)).size !== 16 || new Set(layouts.map((layout) => layout.inlay)).size !== 4 || layouts.some((layout) => layout.walls < 8 || layout.pillars < 4 || layout.props !== 4 || layout.hazards !== 4 || layout.decor < 8 || !layout.centerClear || layout.clearRadius < 200)) throw new Error('Biome-authored room blueprints are incomplete: ' + JSON.stringify(layouts));
const biomeVariants = context.DK_DEBUG.biomeVariantTrial();
if (biomeVariants.variants !== 16 || biomeVariants.uniqueNames !== 16 || biomeVariants.uniqueSkills !== 16 || biomeVariants.uniqueSigils !== 16 || !biomeVariants.allSkinned || !biomeVariants.allTelegraphed || !biomeVariants.allTriggered || !biomeVariants.noHpInflation || biomeVariants.regularSamples !== 30 || biomeVariants.regularActives !== 10 || !biomeVariants.dummyExcluded) throw new Error('Biome enemy skin/mechanic matrix failed: ' + JSON.stringify(biomeVariants));
const staticFloorStart = match[1].indexOf('function drawStaticBiomeFloor');
const staticFloorEnd = match[1].indexOf('function drawFloor()', staticFloorStart);
const staticFloorSource = match[1].slice(staticFloorStart, staticFloorEnd);
if (staticFloorStart < 0 || staticFloorEnd < 0 || staticFloorSource.includes('visualTick') || staticFloorSource.includes('visualTimeMs') || !staticFloorSource.includes('drawBiomeLandscape') || !staticFloorSource.includes('drawDungeonWalls') || !match[1].includes('drawStaticBiomeFloor();return;') || !match[1].includes('var ARENA_LIMIT = 1220') || !match[1].includes('var LAYOUT_SCALE = 1.08')) throw new Error('Static authored biome floor/wall contract failed.');
const landscapeStart = match[1].indexOf('function drawBiomeLandscape');
const landscapeEnd = match[1].indexOf('function drawRoomInlay', landscapeStart);
const landscapeSource = match[1].slice(landscapeStart, landscapeEnd);
if (landscapeStart < 0 || landscapeEnd < 0 || landscapeSource.includes('visualTick') || landscapeSource.includes('visualTimeMs') || biomes.some((biome) => !landscapeSource.includes("kind==='" + biome.landscape + "'"))) throw new Error('Distinct static landscape rendering is incomplete.');
for (let i = 0; i < biomes.length; i += 1) {
  const atWave = context.DK_DEBUG.biomeAtWave(i * 5 + 1);
  if (atWave.name !== biomes[i].name || atWave.hazard !== biomes[i].hazard || atWave.prop !== biomes[i].prop || atWave.resonance !== biomes[i].resonance || atWave.hazardCount < 2 || atWave.propCount !== 4 || atWave.decorCount < 8 || atWave.rectObstacles < 12 || atWave.layout !== layouts[i].id || layouts[i].biome !== biomes[i].hazard) throw new Error('Five-wave biome/layout pairing failed: ' + JSON.stringify(atWave));
}

const hpTrial = context.DK_DEBUG.enemyHpTrial();
const expectedHpRatios = [1.15,1.15,1.3,1.3,1.8,1.8,2.5,2.5,3.5,3.5];
if (hpTrial.samples.length !== expectedHpRatios.length || hpTrial.samples.some((sample,index) => Math.abs(sample.ratio - expectedHpRatios[index]) > 1e-8) || hpTrial.maxRatioError > 1e-8 || hpTrial.shield !== 12) {
  throw new Error('Stepped enemy HP contract failed: ' + JSON.stringify(hpTrial));
}

const navigation = context.DK_DEBUG.navigationTrial();
if (!navigation.crossed || navigation.detour < 60 || navigation.contacts !== 0 || navigation.endDistance >= navigation.startDistance * 0.45) throw new Error('Obstacle-aware enemy navigation failed: ' + JSON.stringify(navigation));
const enemyNavigator = context.DK_DEBUG.enemyNavigatorTrial();
if (!enemyNavigator.shownForThree || !enemyNavigator.hiddenForFour || !enemyNavigator.hiddenWhenNear) throw new Error('Last-enemy navigator failed: ' + JSON.stringify(enemyNavigator));

const enemyTrial = context.DK_DEBUG.enemyTrial();
if (!enemyTrial.briarBurrow || !enemyTrial.tideChannel || enemyTrial.scribePages !== 5 || !enemyTrial.prismReflect || enemyTrial.shardlings !== 2 || !enemyTrial.cinderCask || enemyTrial.masonIce !== 1 || enemyTrial.masonShots !== 3 || !enemyTrial.rootTrap || !enemyTrial.duelistTelegraph || !enemyTrial.duelistDash) {
  throw new Error('New enemy mechanics failed: ' + JSON.stringify(enemyTrial));
}

const enemyExpansion = context.DK_DEBUG.enemyExpansionTrial();
if (!enemyExpansion.slagCharge || !enemyExpansion.slagTrail || enemyExpansion.chronoShots !== 6 || !enemyExpansion.chronoMoved || !enemyExpansion.boneArrow || !enemyExpansion.sporeMine) throw new Error('Four-enemy expansion contract failed: ' + JSON.stringify(enemyExpansion));

const v171Enemies = context.DK_DEBUG.v171EnemyTrial();
if (Object.values(v171Enemies).some((value) => value !== true)) throw new Error('Six-enemy v1.7.1 behavior failed: ' + JSON.stringify(v171Enemies));

const v180EnemyIds = ['ashMauler','frostLantern','duneScarab','arcTetherer','roseChorister','tideSkater','mirrorMimic','sporeMortar'];
if (v180EnemyIds.some((id) => !context.DK_DEBUG.enemyData().includes(id))) throw new Error('v1.8 biome enemy roster is incomplete.');
const v180Enemies = context.DK_DEBUG.v180EnemyTrial();
if (Object.values(v180Enemies).some((value) => value !== true)) throw new Error('Eight-enemy v1.8 behavior failed: ' + JSON.stringify(v180Enemies));

const biomeProps = context.DK_DEBUG.biomePropTrial();
if (biomeProps.emberDamage <= 0 || !biomeProps.fireField || !biomeProps.frostField || biomeProps.arcDamage <= 0 || !biomeProps.arcClears || !biomeProps.gravityField || !biomeProps.heartHeal || !biomeProps.rootField || !biomeProps.tideReflect || !biomeProps.runeReward || biomeProps.mirrorRays !== 10 || biomeProps.resonanceKind !== 'WHITEOUT' || biomeProps.resonantShot.status !== 'freeze' || biomeProps.resonantShot.blast < 18 || biomeProps.resonantShot.resonance !== 'WHITEOUT') {
  throw new Error('Interactive biome object/resonance contract failed: ' + JSON.stringify(biomeProps));
}

const biomeExpansion = context.DK_DEBUG.biomeExpansionTrial();
if (biomeExpansion.anvilBlades !== 14 || !biomeExpansion.anvilFire || !biomeExpansion.rewound || biomeExpansion.moonBlades !== 12 || !biomeExpansion.poisonField || !biomeExpansion.poisoned) throw new Error('Four-biome mechanic contract failed: ' + JSON.stringify(biomeExpansion));

const attackAnimation = context.DK_DEBUG.attackAnimationTrial();
const modularWeaponSource = match[1];
const requiredAuraIds = ['sunlionCenser','dawnstarCannon','seraphOrrery','rrharall','heavenfallBallista','riftRail','crowncrusher','astralChoir','rrharil','eclipseBow'];
const missingAuraRegistrations = requiredAuraIds.filter((id) => !modularWeaponSource.includes(`DKRegister.weaponAura('${id}'`));
if (attackAnimation.missing.length || attackAnimation.orphaned.length || attackAnimation.profileCount !== 130 || attackAnimation.uniqueProfiles !== 130 || !attackAnimation.categorySafe || attackAnimation.flowerGuns !== 0 || !attackAnimation.rust || !attackAnimation.cleaver || !attackAnimation.ember || !attackAnimation.oak || !match[1].includes('applyWeaponAnimationPose') || !match[1].includes('drawWeaponProfileAccent') || !match[1].includes("if(w.category==='GUN')") || !/profileStarAccent:\s*true/u.test(modularWeaponSource) || missingAuraRegistrations.length) {
  throw new Error('Weapon attack animation contract failed: ' + JSON.stringify({...attackAnimation, missingAuraRegistrations}));
}

const zoom = context.DK_DEBUG.zoomTrial();
if (!(zoom.afterIn > zoom.before) || !(zoom.afterOut < zoom.before) || zoom.minimum !== 0.7 || zoom.maximum !== 1.3) throw new Error('Camera zoom control failed: ' + JSON.stringify(zoom));

const rebalance = context.DK_DEBUG.rebalanceTrial();
if (rebalance.starforge.shots !== 100 || Math.abs(rebalance.starforge.damage - 5.4) > 0.001 || Math.abs(rebalance.starforge.manaUsed - 50) > 0.001 || rebalance.starforge.overheated || rebalance.starforge.heat !== 0 || rebalance.frostbrand.arc < 4 || rebalance.frostbrand.radius < 120 || !rebalance.frostbrand.deflect || rebalance.frostbrand.guard < 18 || rebalance.spiralBefore !== 0 || rebalance.spiralAfter !== 1 || rebalance.shooterBefore !== 0 || rebalance.shooterAfter !== 1 || rebalance.summonsMade !== 3 || rebalance.summonedEnemies !== 3) {
  throw new Error('Combat rebalance contract failed: ' + JSON.stringify(rebalance));
}

const shieldTrial = context.DK_DEBUG.shieldTrial();
if (shieldTrial.shieldBefore > 16 || shieldTrial.shieldAfter !== 0 || shieldTrial.stunAfter < 45 || shieldTrial.hpAfterShield !== shieldTrial.hpBefore || shieldTrial.hpAfterBreak >= shieldTrial.hpAfterShield) {
  throw new Error('Breakable Bulwark shield contract failed: ' + JSON.stringify(shieldTrial));
}

const hazardTrial = context.DK_DEBUG.hazardTrial();
if (hazardTrial.emberDamage <= 0 || hazardTrial.thornDamage < 3 || hazardTrial.thornStun < 22 || hazardTrial.tideShift <= 0 || hazardTrial.glyphMana <= 0 || hazardTrial.mirrorShots !== 4) {
  throw new Error('Biome hazard mechanics failed: ' + JSON.stringify(hazardTrial));
}

const timing = context.DK_DEBUG.timeTrial();
if (Math.abs(timing.x60 - timing.x30) > 1e-8 || Math.abs(timing.x60 - timing.x120) > 1e-8 || Math.abs(timing.life60 - timing.life30) > 1e-8 || Math.abs(timing.life60 - timing.life120) > 1e-8 || Math.abs(timing.particleV60 - timing.particleV30) > 1e-8 || Math.abs(timing.particleV60 - timing.particleV120) > 1e-8 || Math.abs(timing.camera60 - timing.camera30) > 1e-8 || Math.abs(timing.camera60 - timing.camera120) > 1e-8 || !timing.trailStorage || !timing.elapsedScale || !timing.timeWrapper || timing.fixed30 !== 60 || timing.fixed60 !== 60 || timing.fixed120 !== 60 || Math.abs(timing.fixedStepMs - 1000 / 60) > 1e-8 || !match[1].includes('simulationClock.advance(now,simulationIsRunning(),simulateTimeSlice)')) throw new Error('30/60/120 Hz elapsed-time wrapper contract failed: ' + JSON.stringify(timing));

const performance = context.DK_DEBUG.performanceTrial();
if (!performance.fixedTrails || !performance.poolStable || !performance.identityReuse || performance.reusedDelta < 900 || performance.candidateRatio >= 0.25 || performance.candidateChecks >= performance.naiveChecks || performance.gridCellArrays > 256 || !match[1].includes('var bulletPool = []') || !match[1].includes('var particlePool = []') || !match[1].includes('var slashPool = []') || match[1].includes('enemyGrid=Object.create(null);for')) throw new Error('Late-wave pooling/spatial performance contract failed: ' + JSON.stringify(performance));

const dungeonMemory = context.DK_DEBUG.dungeonMemoryTrial();
if (!dungeonMemory.learned || !dungeonMemory.autoEquipped || dungeonMemory.progress !== 2 || !dungeonMemory.fifthShot || dungeonMemory.memoryCount !== 16 || dungeonMemory.clockRate <= dungeonMemory.whiteoutRate) throw new Error('Dungeon Memory contract failed: ' + JSON.stringify(dungeonMemory));

const automaticMemory = context.DK_DEBUG.automaticMemoryTrial();
if (!automaticMemory.learned || automaticMemory.progress !== 2 || automaticMemory.prime !== 'WHITEOUT' || automaticMemory.award !== 'ICE MEMORY' || !match[1].includes("networkRole==='guest'?'':completeBiomeMemory()")) throw new Error('Guaranteed biome-completion Memory failed: ' + JSON.stringify(automaticMemory));

const skillInventory = context.DK_DEBUG.skillInventoryTrial();
if (!skillInventory.opened || !skillInventory.closed || skillInventory.owned !== 3 || skillInventory.equipped !== 'riftStep') throw new Error('Skill inventory contract failed: ' + JSON.stringify(skillInventory));

if (context.DK_DEBUG.state().shopMode) context.DK_DEBUG.leaveArmory();
context.DK_DEBUG.armory();
const shopCombat = context.DK_DEBUG.shopCombatTrial();
if (!shopCombat.shopMode || shopCombat.offers !== 8 || shopCombat.shots < 1) throw new Error('Armory firing contract failed: ' + JSON.stringify(shopCombat));

const supportVisuals = context.DK_DEBUG.supportVisualData();
if (supportVisuals.total !== 50 || supportVisuals.missing.length || new Set(supportVisuals.models).size < 32) throw new Error('Authored support relic visuals are incomplete: ' + JSON.stringify(supportVisuals));
const supportPassives = context.DK_DEBUG.supportPassiveTrial();
if (Object.values(supportPassives).some((value) => value !== true)) throw new Error('v1.8 build-defining passive mechanics failed: ' + JSON.stringify(supportPassives));

const multiplayer = context.DK_DEBUG.multiplayerTrial();
if (Object.values(multiplayer).some((value) => value !== true)) throw new Error('Multiplayer prediction/ownership/reward contract failed: ' + JSON.stringify(multiplayer));

const peerClasses = ['independent', 'gunner', 'magic', 'melee'];
const peerStarters = ['rustPistol', 'oakBow', 'emberWand', 'ironCleaver'];
const peerRoster = peerClasses.map((classId, slot) => ({ id: 'p' + slot, slot, name: 'P' + slot, meta: { classId, starterId: peerStarters[slot] } }));
const isolatedPeers = await Promise.all([101, 202, 303, 404].map((seed, slot) => createIsolatedRuntime(seed, 'p' + slot)));
isolatedPeers.forEach((peer, slot) => {
  const role = slot === 0 ? 'host' : 'guest';
  peer.DKGame.configureNetwork({ role, peerId: 'p' + slot, name: 'P' + slot, roster: peerRoster, snapshotHz: 30 });
  peer.DKGame.enterLobby({ role, peerId: 'p' + slot, name: 'P' + slot, classId: peerClasses[slot], starterId: peerStarters[slot], slot, roster: peerRoster, snapshotHz: 30 });
  if (slot === 0) peer.DKGame.startRun();
  else peer.DKGame.handleNetworkMessage('p0', { type: 'control', action: 'start' });
  peer.DK_DEBUG.armory();
});

const initialPrivateArmories = isolatedPeers.map((peer) => clonePacket(peer.DK_DEBUG.state()));
if (initialPrivateArmories.some((armory) => !armory.shopMode || armory.offerCount !== 8 || armory.coins !== 999 || armory.rerollCost !== 6) || new Set(initialPrivateArmories.map((armory) => armory.offers.join('|'))).size !== 4) {
  throw new Error('Four private Armory stocks were not independently generated: ' + JSON.stringify(initialPrivateArmories.map((armory) => ({ offers: armory.offers, coins: armory.coins }))));
}
const networkCadence = isolatedPeers[0].DK_DEBUG.networkCadenceTrial();
if (Object.values(networkCadence).some((value) => value !== true)) throw new Error('Fixed 30 Hz payload cadence/world revision contract failed: ' + JSON.stringify(networkCadence));
const predictionRollback = isolatedPeers[1].DK_DEBUG.predictionRollbackTrial();
if (Object.values(predictionRollback).some((value) => value !== true)) throw new Error('Prediction acknowledgement/rollback contract failed: ' + JSON.stringify(predictionRollback));
const publicArmorySnapshot = isolatedPeers[0].DKGame.networkSnapshot();
if ('offers' in publicArmorySnapshot || 'shopOffers' in publicArmorySnapshot || 'shopRerolls' in publicArmorySnapshot) throw new Error('Private Armory stock leaked into a multiplayer snapshot: ' + JSON.stringify(publicArmorySnapshot));

const rerollPeer = isolatedPeers[1];
const rerollLogStart = rerollPeer.__netLog.length;
rerollPeer.DK_DEBUG.reroll();
const rerolledArmory = clonePacket(rerollPeer.DK_DEBUG.state());
if (rerolledArmory.coins !== 993 || rerolledArmory.shopRerolls !== 1 || rerolledArmory.offers.join('|') === initialPrivateArmories[1].offers.join('|')) throw new Error('Guest private reroll failed: ' + JSON.stringify(rerolledArmory));
for (const slot of [0, 2, 3]) {
  const untouched = clonePacket(isolatedPeers[slot].DK_DEBUG.state());
  if (untouched.coins !== initialPrivateArmories[slot].coins || untouched.offers.join('|') !== initialPrivateArmories[slot].offers.join('|') || untouched.boughtOffers !== 0) throw new Error('Guest reroll changed another player Armory at slot ' + slot + ': ' + JSON.stringify(untouched));
}
const rerollUpdate = rerollPeer.__netLog.slice(rerollLogStart).find((entry) => entry.method === 'sendToHost' && entry.message.type === 'build_update');
if (!rerollUpdate || 'offers' in rerollUpdate.message || 'shopOffers' in rerollUpdate.message) throw new Error('Guest reroll did not send a private build-only update.');
isolatedPeers[0].DKGame.handleNetworkMessage('p1', clonePacket(rerollUpdate.message));
if (isolatedPeers[0].DK_DEBUG.partyBuilds().find((member) => member.id === 'p1').coins !== 993) throw new Error('Host did not accept guest wallet after private reroll.');

const buyerPeer = isolatedPeers[2];
const buyerBefore = clonePacket(buyerPeer.DK_DEBUG.state());
const boughtOffer = buyerBefore.offerDetails[0];
const buyLogStart = buyerPeer.__netLog.length;
if (!buyerPeer.DK_DEBUG.approachOffer(0) || !buyerPeer.DK_DEBUG.buyNearby()) throw new Error('Guest could not buy its own Armory offer.');
const buyerAfter = clonePacket(buyerPeer.DK_DEBUG.state());
if (buyerAfter.boughtOffers !== 1 || buyerAfter.coins !== buyerBefore.coins - boughtOffer.price || !buyerAfter.weapons.includes(boughtOffer.id)) throw new Error('Guest private purchase failed: ' + JSON.stringify({ boughtOffer, buyerAfter }));
for (const slot of [0, 1, 3]) {
  const untouched = clonePacket(isolatedPeers[slot].DK_DEBUG.state());
  if (untouched.boughtOffers !== 0) throw new Error('Guest purchase marked another player offer as sold at slot ' + slot + '.');
}
const buyUpdate = buyerPeer.__netLog.slice(buyLogStart).find((entry) => entry.method === 'sendToHost' && entry.message.type === 'build_update');
if (!buyUpdate || 'offers' in buyUpdate.message || 'shopOffers' in buyUpdate.message) throw new Error('Guest purchase did not remain build-only on the network.');
isolatedPeers[0].DKGame.handleNetworkMessage('p2', clonePacket(buyUpdate.message));
const hostedBuyer = isolatedPeers[0].DK_DEBUG.partyBuilds().find((member) => member.id === 'p2');
if (hostedBuyer.coins !== buyerAfter.coins || !hostedBuyer.weapons.includes(boughtOffer.id)) throw new Error('Host did not preserve the purchasing guest build: ' + JSON.stringify(hostedBuyer));

for (let slot = 1; slot < 4; slot += 1) {
  const peer = isolatedPeers[slot];
  const readyLogStart = peer.__netLog.length;
  peer.DK_DEBUG.leaveArmory();
  const readyMessage = peer.__netLog.slice(readyLogStart).find((entry) => entry.method === 'sendToHost' && entry.message.type === 'armory_ready');
  if (!readyMessage || !peer.DK_DEBUG.state().shopMode || !peer.DK_DEBUG.state().armoryReady) throw new Error('Guest Armory ready/wait state failed for p' + slot + '.');
  isolatedPeers[0].DKGame.handleNetworkMessage('p' + slot, clonePacket(readyMessage.message));
}
const hostBeforeReady = clonePacket(isolatedPeers[0].DK_DEBUG.state());
if (!hostBeforeReady.shopMode || hostBeforeReady.armoryReadyCount !== 3) throw new Error('Host did not wait for all three guest Armory states: ' + JSON.stringify(hostBeforeReady));
isolatedPeers[0].DK_DEBUG.leaveArmory();
const hostAfterReady = clonePacket(isolatedPeers[0].DK_DEBUG.state());
const resumePacket = [...isolatedPeers[0].__netLog].reverse().find((entry) => entry.method === 'broadcast' && entry.message.type === 'control' && entry.message.action === 'resume');
if (hostAfterReady.shopMode || !resumePacket) throw new Error('Host did not resume after all four Armory-ready states: ' + JSON.stringify(hostAfterReady));
for (let slot = 1; slot < 4; slot += 1) isolatedPeers[slot].DKGame.handleNetworkMessage('p0', clonePacket(resumePacket.message));
if (isolatedPeers.some((peer) => peer.DK_DEBUG.state().shopMode) || isolatedPeers.some((peer) => peer.DK_DEBUG.state().wave !== hostAfterReady.wave)) throw new Error('Four-player Armory resume did not synchronize.');
const resumedGuest = isolatedPeers[1];
const resumedNetwork = resumedGuest.DKGame.networkSnapshot();
resumedGuest.DKGame.handleNetworkMessage('p0', { type: 'snapshot', seq: 999999, scene: 'armory', sceneRevision: Math.max(0, resumedNetwork.appliedSceneRevision - 1), wave: 5, players: [], enemies: [] });
if (resumedGuest.DKGame.networkSnapshot().scene !== 'run' || resumedGuest.DK_DEBUG.state().shopMode) throw new Error('A delayed Armory snapshot split a resumed guest into a stale scene.');
const fallbackRevision = resumedNetwork.appliedSceneRevision + 1;
resumedGuest.DKGame.handleNetworkMessage('p0', { type: 'snapshot', seq: 1000000, scene: 'armory', sceneRevision: fallbackRevision, wave: 10, biome: 0, players: [], enemies: [] });
if (resumedGuest.DKGame.networkSnapshot().scene !== 'armory' || !resumedGuest.DK_DEBUG.state().shopMode) throw new Error('A guest could not recover an Armory transition from an authoritative snapshot.');
resumedGuest.DKGame.handleNetworkMessage('p0', { type: 'snapshot', seq: 1000001, scene: 'run', sceneRevision: fallbackRevision + 1, wave: 11, biome: 0, players: [], enemies: [] });
if (resumedGuest.DKGame.networkSnapshot().scene !== 'run' || resumedGuest.DK_DEBUG.state().shopMode) throw new Error('A guest could not recover a Run transition from an authoritative snapshot.');

const legendaryFight = context.DK_DEBUG.legendaryBoss('prism', 'dawnstarCannon');
const legendaryFightState = context.DK_DEBUG.state();
const expectedLegendaryIds = context.DK_DEBUG.listWeapons().filter((weapon) => weapon.rarity === 'legendary').map((weapon) => weapon.id).sort();
if (legendaryFight.boss.key !== 'mirror' || legendaryFight.biome.hazard !== 'mirror' || legendaryFight.wave !== 55 || legendaryFight.equipped !== 'dawnstarCannon' || legendaryFightState.boss?.key !== 'mirror' || legendaryFightState.equipped !== 'dawnstarCannon' || JSON.stringify(legendaryFight.legendaryWeapons.slice().sort()) !== JSON.stringify(expectedLegendaryIds) || expectedLegendaryIds.some((id) => !legendaryFightState.weapons.includes(id))) throw new Error('Legendary boss debug command failed: ' + JSON.stringify({ legendaryFight, legendaryFightState, expectedLegendaryIds }));

if (
  html.includes('id="shop-items"') || !html.includes('id="shop-room-ui"') || html.includes('drawShopBook') ||
  !html.includes('drawSupportRelic') || !html.includes('drawWeaponForge') || !html.includes('drawCraftAltar') ||
  !html.includes('id="craft-prev-btn"') || !html.includes('id="craft-next-btn"') || !html.includes('id="crafting-screen"') ||
  !html.includes('id="craft-recipe-list"') || !html.includes('id="craft-resource-list"') || !html.includes('id="craft-resource-wallet"') ||
  !html.includes('id="craft-result-model"') || (html.match(/id="craft-part-model-/g) || []).length !== 3 ||
  !html.includes('id="class-lobby"') || (html.match(/class="class-card/g) || []).length !== 4 || !html.includes('id="class-trait-text"') ||
  !html.includes('id="boss-hud"') || !html.includes('id="boss-bar"') || !html.includes('id="boss-combo"') ||
  html.includes('id="core-screen"') || html.includes('id="core-grid"') ||
  !html.includes('id="inventory-screen"') || !html.includes('id="inventory-weapons"') || !html.includes('id="inventory-memories"') ||
  !html.includes('id="resolution-select"') || !html.includes('id="pause-camera-zoom-select"') || !html.includes('id="stop-btn"') || html.includes('id="zoom-out-btn"') || html.includes('id="zoom-in-btn"') ||
  !html.includes('id="loading-screen"') || !html.includes('id="loading-count">0 / 56') ||
  !html.includes('id="hud-settings-btn"') || !html.includes('id="menu-mobile-attack-select"') || !html.includes('id="pause-mobile-attack-select"') ||
  !html.includes('id="menu-frame-limit-select"') || !html.includes('id="menu-effect-quality-select"') || !html.includes('id="menu-debug-mode-select"') ||
  !html.includes('id="keybind-list"') || !html.includes('id="mobile-layout-editor"') || !html.includes('id="aim-stick-knob"') || !html.includes('id="debug-overlay"') ||
  !html.includes('id="active-cd-number"') || !html.includes('id="desktop-dash-cd-number"') || !html.includes('id="mobile-active-cd-number"') || !html.includes('id="mobile-dash-cd-number"') ||
  !html.includes('id="room-screen"') || !html.includes('id="waiting-screen"') || !html.includes('id="party-hud"') || !html.includes('id="network-pill"') || html.includes('id="snapshot-rate-select"') || !html.includes('30 Hz · Fixed') ||
  !html.includes('data-ui-screen="start"') || !html.includes('class="menu-btn gate launch-btn"') ||
  !html.includes("createDataChannel('dungeon-control', { ordered: true })") || !html.includes("createDataChannel('dungeon-state', { ordered: false, maxRetransmits: 0 })") ||
  !html.includes("version: '1.9.2'") || !html.includes('serializeNetworkPayload') || !html.includes('compactNetworkNumber') || !html.includes("message.type === 'ping_ack'") ||
  !html.includes('directBufferLimit') || !html.includes('transportStats') || !html.includes('iceCandidatePoolSize: 4') ||
  !match[1].includes('inventoryWeaponButton') || !match[1].includes('renderWeaponPreview') || !match[1].includes('drawEnemyNavigator();') ||
  !match[1].includes('spawnBiomeBoss') || !match[1].includes('BiomeBoss') || !match[1].includes('dropBossResources') ||
  !match[1].includes("enemies=[new Enemy(0,0,'trainingDummy')]") || !match[1].includes("'TARGET'") || match[1].includes("'TRAINING BAG'") || match[1].includes("'MUAY'") ||
  !match[1].includes('netPredictionHistory') || !match[1].includes('netLastAckSeq') || !match[1].includes('ackX') || !match[1].includes('applyPredictionCorrection') || !match[1].includes('applyTimedFieldSnapshots') ||
  !match[1].includes('setNetworkSnapshotHz') || !match[1].includes('snapshotHz:networkSnapshotHz') ||
  !match[1].includes('netTransientSnapshotBudget') || !match[1].includes('worldOnRevision') || !match[1].includes('syncGuestSceneFromSnapshot') ||
  !match[1].includes('sceneRevision:netSceneRevision') || !match[1].includes('function predictiveEnemyAim') ||
  !match[1].includes('debugGodMode || this.isDashing || this.invuln > 0') || !match[1].includes('function drawBiomeScreenGrade') || !match[1].includes('function bossHealthScaleAt') || !match[1].includes('function layoutKeepsLandmarkClear') ||
  match[1].includes('BiomeBoss.prototype.fireCurtain') || match[1].includes('bossCurtain') ||
  !match[1].includes("document.addEventListener('compositionstart',clearKeyboardState)") || match[1].includes("showToast('COIN RUSH!") ||
  !match[1].includes('drawHeldWeapon(w,false,this.color)') || !match[1].includes('function foundation()') || !match[1].includes('function addDamageFloat') || !match[1].includes("tr('Weapon family bonds')") || !match[1].includes("sceneMode='armory'") ||
  !html.includes("window.setInterval(function(){if(mode==='online')setNetworkLabel(lastConnection,true);},5000)") || !html.includes("net.on('server-ping'")
) throw new Error('v1.9 multiplayer/boss/crafting/mobile UI contract failed.');

if (
  !html.includes('id="play-menu-btn"') || !html.includes('id="multiplayer-menu-btn"') ||
  !html.includes('id="settings-menu-btn"') || !html.includes('id="stats-menu-btn"') ||
  !html.includes('id="editor-mode-btn"') || !html.includes('id="mods-menu-btn"') || !html.includes('id="quit-menu-btn"') ||
  !html.includes('data-menu-view="main"') || !html.includes('class="settings-layout"') ||
  !html.includes('class="settings-categories"') || !html.includes('id="settings-content"') ||
  !html.includes('data-settings-category="general"') || !html.includes('data-settings-category="video"') ||
  !html.includes('data-settings-category="interface"') || !html.includes('data-settings-category="language"') ||
  !html.includes('data-settings-category="controls"') || !html.includes('data-settings-category="mobile"') || !html.includes('data-settings-category="debug"') ||
  !html.includes('data-settings-category="accessibility"') || !html.includes('class="class-workspace"') ||
  !html.includes('id="class-focus"') || !html.includes('class="flow-dialog pause-dialog ui-scalable"') ||
  !html.includes('class="pause-menu-list"') || !html.includes('class="waiting-shell"') ||
  !html.includes("--font-en: 'Ubuntu'") || !html.includes("--font-th: 'Noto Sans Thai'") ||
  !html.includes('Noto+Sans+Thai') || !html.includes('Noto+Sans+JP') ||
  !html.includes('--ui-bg: rgba(0, 0, 0, .72)') || !html.includes('--ease-menu: cubic-bezier(.22, 1, .36, 1)') ||
  !html.includes('class="hud-meter-stack"') || !html.includes('id="waiting-ui-toggle"') ||
  !html.includes('id="weapon-editor-screen" class="weapon-editor" lang="en" data-i18n-lock') ||
  !html.includes("zone.addEventListener('pointerdown'") || !html.includes('setPointerCapture(e.pointerId)') ||
  !html.includes('@keyframes menuItemEnter') || !html.includes('@keyframes submenuEnterForward') ||
  !html.includes('@keyframes submenuEnterBack') || !html.includes('@keyframes settingsContentIn') ||
  !html.includes('@media (prefers-reduced-motion: reduce)') ||
  html.includes('id="weapon-name"') || html.includes('id="weapon-stats"') || html.includes('id="run-stats"') ||
  html.includes('font-family: \'Cinzel\'') || html.includes('@keyframes titleGlow') ||
  html.includes('@keyframes launchGlow') || /(?:linear|radial|conic)-gradient\s*\(/i.test(html)
) throw new Error('Quiet transparent-black PC UI contract failed.');

const coarseCss = html.slice(html.indexOf('@media (pointer: coarse)'), html.indexOf('</style>'));
if (!coarseCss.includes('#mobile-controls { display: block; position: absolute; left: 0; right: 0; bottom: 0; height: 190px') || !coarseCss.includes('.joystick-area { left: 22px; bottom: 24px') || !coarseCss.includes('.action-group { right: 17px; bottom: 18px') || !coarseCss.includes('.fire-btn { width: 82px; height: 82px') || !coarseCss.includes('body[data-ui-screen="run"] .desktop-ui { display:none !important; }') || !coarseCss.includes('.waiting-bottom { justify-content: center; flex-direction: column; pointer-events: none; }') || !coarseCss.includes('#launch-run-btn { pointer-events: auto; }')) throw new Error('Mobile touch placement and waiting-room touch-through contract failed.');
if (!html.includes("body[data-mobile-attack='auto'] .fire-btn") || !html.includes("body[data-mobile-attack='aim'] .fire-btn") || !html.includes("body[data-mobile-layout-edit] #mobile-controls") || !html.includes("body[data-ui-screen='armory'] #continue-btn { grid-column: 1 / -1") || !html.includes(".waiting-screen[data-ui-hidden='true'] .waiting-shell { visibility: hidden")) throw new Error('Mobile aim/layout, Armory access, or hideable waiting-room contract failed.');

if (/AudioContext|webkitAudioContext|\bsfx\s*\(|screenShake|cameraShake/.test(match[1])) throw new Error('Sound or screen-shake system remained in the game.');

if (/\breact\b|\.tsx|\btypescript\b/i.test(match[1])) throw new Error('Framework or TypeScript marker found.');

console.log((mobileMode ? 'Mobile' : 'Desktop') + ' validation passed:', JSON.stringify(catalog), 'private armories=4', 'armory rerolls=40', 'stress candidate ratio=' + performance.candidateRatio.toFixed(4));

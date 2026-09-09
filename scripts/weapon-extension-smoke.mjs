import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const modRoot = new URL('examples/mods/weapon-extension/', root);
const manifest = JSON.parse(await readFile(new URL('manifest.json', modRoot), 'utf8'));
const code = await readFile(new URL('main.js', modRoot), 'utf8');
const icon = await readFile(new URL('icon.png', modRoot));
const registrySource = await readFile(new URL('src/content/registry.js', root), 'utf8');
const baseWeapons = await readFile(new URL('src/content/weapons/unique-weapons.js', root), 'utf8');

if (manifest.id !== 'dk-weapon-extension' || manifest.gameVersion !== '>=1.9.2' || manifest.main !== 'main.js') throw new Error('Weapon Extension manifest contract failed.');
if (icon.length < 100 || icon.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Weapon Extension icon.png is not a valid PNG.');

globalThis.window = globalThis;
new Function(registrySource)();

const module = { exports: {} };
new Function('DK', 'mod', 'module', 'exports', code)({}, manifest, module, module.exports);
if (typeof module.exports.preload !== 'function') throw new Error('Weapon Extension does not export preload(DK).');
module.exports.preload({ register: globalThis.DKRegister, log() {} });

const ids = [
  'wxFoundrySidearm', 'wxStormcoilCarbine', 'wxIronwoodLongbow', 'wxTempestPinion',
  'wxCrescentGlaive', 'wxClockworkBreaker', 'wxEmberPrism', 'wxVoidCometStaff'
];
if (ids.some((id) => baseWeapons.includes(id))) throw new Error('Weapon Extension ID collides with the base weapon catalog.');
if (ids.some((id) => !globalThis.DKContent.weapons[id])) throw new Error('Weapon Extension failed to register all weapon definitions.');
if (ids.some((id) => !globalThis.DKContent.weaponAnimations[id])) throw new Error('Weapon Extension is missing attack animation profiles.');
if (ids.some((id) => typeof globalThis.DKContent.weaponRenderers[id] !== 'function')) throw new Error('Weapon Extension is missing held-weapon renderers.');
if (ids.some((id) => !globalThis.DKContent.weaponBehaviors.ids[id])) throw new Error('Weapon Extension is missing weapon mechanics.');

const categories = ids.map((id) => globalThis.DKContent.weapons[id].category);
for (const expected of ['GUN', 'ARCHER', 'MELEE', 'MAGIC']) if (!categories.includes(expected)) throw new Error('Weapon Extension is missing category ' + expected + '.');
const blockedRarity = ids.filter((id) => ['legendary', 'mythical'].includes(globalThis.DKContent.weapons[id].rarity));
if (blockedRarity.length) throw new Error('Weapon Extension includes Armory-blocked rarity weapons: ' + blockedRarity.join(', '));

const foundry = globalThis.DKContent.weaponBehaviors.ids.wxFoundrySidearm;
const hot = { weapon: { shots: 6 }, opts: { damage: 10 } };
foundry.configureProjectile(hot);
if (hot.opts.pierce !== 2 || hot.opts.damage <= 10) throw new Error('Foundry sixth-shot penetrator mechanic failed.');

const storm = globalThis.DKContent.weaponBehaviors.ids.wxStormcoilCarbine;
const stormShot = { burstIndex: 2, opts: { damage: 10 } };
storm.configureProjectile(stormShot);
if (!stormShot.opts.tesla || stormShot.opts.status !== 'shock' || stormShot.opts.pierce !== 1) throw new Error('Stormcoil final-burst mechanic failed.');

const bow = globalThis.DKContent.weaponBehaviors.ids.wxIronwoodLongbow;
const fullDraw = { power: 1.6, opts: { speed: 10 } };
bow.configureProjectile(fullDraw);
if (fullDraw.opts.pierce !== 2 || fullDraw.opts.speed <= 10) throw new Error('Ironwood full-draw mechanic failed.');

const glaive = globalThis.DKContent.weaponBehaviors.ids.wxCrescentGlaive;
let meleeCalls = 0;
if (!glaive.attack({ player: { performMelee() { meleeCalls++; } }, weapon: {} }) || meleeCalls !== 1) throw new Error('Crescent Glaive melee dispatch failed.');
let echo;
glaive.afterMelee({ player: { x: 1, y: 2 }, attackAngle: .5, radius: 150, arc: 2.55, damage: 20, weapon: { id: 'wxCrescentGlaive' }, api: { pushPending(v) { echo = v; } } });
if (!echo || echo.kind !== 'phaseEcho' || echo.damage !== 8.4) throw new Error('Crescent Glaive echo mechanic failed.');

const prism = globalThis.DKContent.weaponBehaviors.ids.wxEmberPrism;
const center = { index: 1, opts: { damage: 10 } };
prism.configureProjectile(center);
if (center.opts.status !== 'burn' || center.opts.blast !== 30 || center.opts.damage <= 10) throw new Error('Ember Prism center-ray mechanic failed.');

const comet = globalThis.DKContent.weaponBehaviors.ids.wxVoidCometStaff;
const cometShot = { opts: {} };
comet.configureProjectile(cometShot);
if (cometShot.opts.vortex !== 78 || cometShot.opts.homing <= 0 || cometShot.opts.pierce !== 2) throw new Error('Void Comet mechanic failed.');

console.log(JSON.stringify({ mod: manifest.id, weapons: ids.length, categories: [...new Set(categories)], armoryEligible: true, mechanicsSmoke: true }));

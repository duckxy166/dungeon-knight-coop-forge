import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const modRoot = new URL('examples/mods/japanese-localization/', root);
const manifest = JSON.parse(await readFile(new URL('manifest.json', modRoot), 'utf8'));
const code = await readFile(new URL('main.js', modRoot), 'utf8');
const icon = await readFile(new URL('icon.png', modRoot));

if (manifest.id !== 'dk-japanese-localization' || manifest.gameVersion !== '>=1.9.2' || manifest.main !== 'main.js' || manifest.icon !== 'icon.png') {
  throw new Error('Japanese mod manifest contract failed.');
}
if (icon.length < 100 || icon.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Japanese mod icon.png is not a valid PNG.');
if (!code.includes("DK.i18n.register('ja'") || !code.includes("label: '日本語'") || !code.includes('describeWeapon')) throw new Error('Japanese localization runtime is incomplete.');

const module = { exports: {} };
new Function('DK', 'mod', 'module', 'exports', code)({}, manifest, module, module.exports);
if (typeof module.exports.preload !== 'function') throw new Error('Japanese mod does not export preload(DK).');
let registered;
module.exports.preload({
  i18n: { register(locale, bundle) { registered = { locale, bundle }; return bundle; } },
  log() {}
});
if (!registered || registered.locale !== 'ja' || registered.bundle.text.Play !== 'プレイ' || registered.bundle.text['Content Manager'] !== 'MODマネージャー' || registered.bundle.text.Mods !== 'MOD') throw new Error('Japanese UI translation registration failed.');
if (registered.bundle.format('WAVE 12 · PHASE 2/2') !== 'ウェーブ 12 · フェーズ 2/2') throw new Error('Japanese dynamic formatter failed.');
if (!/[\u3040-\u30ff\u3400-\u9fff]/.test(registered.bundle.descriptions.activeSkills.riftStep)) throw new Error('Japanese skill descriptions are missing.');
const weaponDesc = registered.bundle.describeWeapon({ category:'MAGIC', damage:18, desc:'Homing fire bolt that explodes.' });
if (!/魔法武器/.test(weaponDesc) || !/追尾/.test(weaponDesc) || !/炎上/.test(weaponDesc) || !/爆発/.test(weaponDesc)) throw new Error('Japanese weapon description generator failed: ' + weaponDesc);

console.log(JSON.stringify({ mod: manifest.id, locale: registered.locale, iconBytes: icon.length, dynamicLocalization: true }));

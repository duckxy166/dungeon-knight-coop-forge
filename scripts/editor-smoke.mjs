import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const editorSource = await readFile(new URL('src/editor.js', root), 'utf8');
const indexSource = await readFile(new URL('index.html', root), 'utf8');
const editorCss = await readFile(new URL('styles/editor.css', root), 'utf8');
const bootstrapSource = await readFile(new URL('src/bootstrap.js', root), 'utf8');
const timeSource = await readFile(new URL('src/time.js', root), 'utf8');
const gameSource = await readFile(new URL('src/game.js', root), 'utf8');
const lobbySource = await readFile(new URL('src/lobby.js', root), 'utf8');
const catalogSource = await readFile(new URL('src/content/editor/visual-catalog.js', root), 'utf8');
const nativeBlueprintSource = await readFile(new URL('src/content/editor/native-blueprints.js', root), 'utf8');

let projectileModelDraws = 0;
let impactModelDraws = 0;

const content = {
  weapons: {
    rustPistol: { name: 'RUST PISTOL', icon: '▰', category: 'GUN', rarity: 'common', damage: 3, rate: 320, speed: 13, color: '#777777', handler: 'bullet', desc: 'Base weapon.' },
    frostbrand: { name: 'FROSTBRAND', icon: '†', category: 'MELEE', rarity: 'rare', damage: 12, rate: 520, reach: 145, arc: 2.1, color: '#79cfff', family: 'frost', handler: 'melee', desc: 'Base blade.' }
  },
  weaponAnimations: { rustPistol: { pose: 'snap' }, frostbrand: { pose: 'sweep' } },
  weaponBehaviors: { ids: {}, families: {}, handlers: {} },
  weaponRenderers: { rustPistol() {}, frostbrand() {} },
  projectileRenderers: { rustPistol() { projectileModelDraws++; } },
  projectileOverlays: {},
  projectileImpactRenderers: { rustPistol() { impactModelDraws++; } },
  slashRenderers: {}, weaponAuras: {},
  projectileModels: {}, effectModels: {}, statusEffects: {},
  activeSkills: {
    aegisPulse: { name: 'AEGIS PULSE', icon: '◉', rarity: 'uncommon', price: 54, cooldown: 720, desc: 'Barrier.' },
    riftStep: { name: 'RIFT STEP', icon: '⇥', rarity: 'rare', price: 79, cooldown: 720, desc: 'Blink.' }
  }
};

const registrations = { weapons: [], behaviors: [], renderers: [], projectiles: [], overlays: [], projectileModels: [], effectModels: [], statusEffects: [] };
const register = {
  weapons(definitions, animations) { Object.assign(content.weapons, definitions); Object.assign(content.weaponAnimations, animations); registrations.weapons.push(...Object.keys(definitions)); },
  weaponBehavior(id, hooks) { content.weaponBehaviors.ids[id] = hooks; registrations.behaviors.push(id); },
  weaponRenderer(id, renderer) { content.weaponRenderers[id] = renderer; registrations.renderers.push(id); },
  projectileRenderer(id, renderer) { content.projectileRenderers[id] = renderer; registrations.projectiles.push(id); },
  projectileOverlay(id, renderer) { content.projectileOverlays[id] = renderer; registrations.overlays.push(id); },
  projectileImpactRenderer(id, renderer) { content.projectileImpactRenderers[id] = renderer; },
  slashRenderer(id, renderer) { content.slashRenderers[id] = renderer; },
  weaponAura(id, renderer) { content.weaponAuras[id] = renderer; },
  projectileModel(id, definition) { content.projectileModels[id] = definition; registrations.projectileModels.push(id); },
  effectModel(id, definition) { content.effectModels[id] = definition; registrations.effectModels.push(id); },
  statusEffect(id, definition) { content.statusEffects[id] = definition; registrations.statusEffects.push(id); }
};

const storage = new Map();
const context = {
  console, Math, JSON, Object, Array, Number, String, Boolean, Date,
  DKContent: content,
  DKRegister: register,
  DKGame: {},
  DKAttackProfile: (...values) => ({ values }),
  localStorage: { getItem(key) { return storage.get(key) ?? null; }, setItem(key, value) { storage.set(key, String(value)); } },
  document: { getElementById() { return null; } }
};
context.window = context;
vm.createContext(context);
vm.runInContext(catalogSource, context, { filename: 'src/content/editor/visual-catalog.js' });
vm.runInContext(nativeBlueprintSource, context, { filename: 'src/content/editor/native-blueprints.js' });
vm.runInContext(editorSource, context, { filename: 'src/editor.js' });

const core = context.DKEditorCore;
assert.ok(core, 'Weapon Maker core was not exposed.');
assert.equal(core.defaultDocument().schemaVersion, 5, 'Weapon/Bullet graph data schema was not upgraded.');
assert.equal(core.defaultDocument().graph.version, 4, 'Graph schema was not migrated to v4.');
assert.ok(core.defaultDocument().bulletGraph, 'A new weapon is missing its Bullet Advanced graph.');
assert.equal(core.builtinBlueprintCount, 2, 'Built-in source weapons were not migrated into editable blueprints.');
assert.equal(core.builtinSkillBlueprintCount, 2, 'Built-in skills were not migrated into editable Skill Maker graphs.');
assert.equal(core.blueprintCoverage().missing.length, 0, 'A built-in mechanic or projectile visual is missing from its native graph.');
assert.ok(Object.keys(core.projectileModels).length >= 12, 'Projectile models were not loaded from the visual catalog.');
assert.ok(Object.keys(core.effectModels).length >= 8, 'Effect models were not loaded from the visual catalog.');
assert.ok(content.statusEffects.burn && content.statusEffects.freeze, 'Built-in statuses were not registered as data.');
const requiredNodes = [
  'onAttack', 'onHit', 'onCrit', 'onKill', 'onProjectileSpawn', 'onProjectileHit',
  'timer', 'delay', 'branch', 'randomChance', 'spawnProjectile', 'splitProjectile',
  'homing', 'pierce', 'bounce', 'explode', 'applyStatus', 'changeDamage', 'changeSpeed',
  'rotateProjectile', 'spawnArea', 'playEffect', 'playSound', 'setVariable', 'getVariable', 'math', 'compare',
  'selectTargets', 'filterTargets', 'setDirection', 'moveTargets', 'damageTargets', 'setTargetProperty', 'getTargetProperty', 'setProjectileTarget',
  'onFiringUpdate', 'onVolley', 'onVolleyComplete', 'onMelee', 'onMeleeComplete', 'onWorldEffect',
  'onWeaponCallback', 'onBulletAim', 'onBulletCrit', 'onBulletSpawn', 'onBulletBeforeHit',
  'onBulletHit', 'onBulletUpdate', 'onBulletBounce', 'onBulletExpire', 'onBulletDraw', 'onBulletOverlayDraw', 'onBulletImpactDraw',
  'drawProjectileModel', 'drawProjectileOverlay', 'drawImpactModel',
  'applyBulletSettings', 'setProjectileModel', 'setProjectileColor', 'setTrail', 'setLifetime',
  'setRadius', 'curveProjectile', 'sinePath', 'returnProjectile', 'gravityField', 'projectileBlast',
  'clearEnemyBullets', 'freezeResume', 'reverseAt', 'phaseProjectile',
  'sequence', 'merge', 'continueNormalAttack', 'stopGraph', 'teleportTargets', 'clearProjectiles',
  'modifyPlayer', 'spawnSummon', 'setWorldTime', 'damageLine', 'valueNumber', 'valueBoolean', 'valueText',
  'comment', 'group', 'onAttackPressed', 'onAttackHeld', 'onAttackReleased', 'onSkillUse', 'onSkillTick', 'onSkillEnd',
  'nativeFunctionStart', 'nativeFunctionEnd', 'nativeSetProperty', 'nativeSetVariable', 'nativeCall',
  'nativeSpawnProjectile', 'nativePlayEffect', 'nativeWait', 'nativeDamage', 'nativeFindTargets',
  'nativeSpawnArea', 'nativeMelee', 'nativeBranch', 'nativeForLoop', 'nativeWhileLoop', 'nativeReturn'
];
assert.deepEqual(requiredNodes.filter((type) => !core.nodeDefinitions[type]), [], 'A requested graph node is missing.');
assert.equal(core.nodeDefinitions.nativeFunctionEnd.internal, true, 'Legacy Function Complete leaked into the user node palette.');
const forbiddenNodes = ['originalWeaponHook', 'originalBulletHook', 'originalProjectileArt', 'originalProjectilePrimitive', 'originalProjectileOverlay', 'originalImpactEffect'];
assert.deepEqual(forbiddenNodes.filter((type) => core.nodeDefinitions[type]), [], 'A hidden source-mechanic node still exists.');

const rustSource = core.documentFromWeapon('rustPistol');
assert.equal(rustSource.sourceBlueprint, true, 'Built-in weapon was not identified as a source blueprint.');
assert.ok(rustSource.bulletGraph.nodes.some((node) => node.type === 'nativeFunctionStart' && node.props.functionId === 'rustPistol_configureProjectile'), 'Rust Pistol projectile behavior is not expanded into native data nodes.');
assert.ok(rustSource.bulletGraph.nodes.filter((node) => node.type === 'nativeSetProperty').length >= 2, 'Rust Pistol projectile properties are not visible as universal Set Property nodes.');
assert.ok(rustSource.bulletGraph.nodes.some((node) => node.type === 'drawProjectileModel' && node.props.modelId === 'weaponProjectile_rustPistol'), 'Rust Pistol projectile renderer is not represented by an actual model node.');
assert.ok(rustSource.bulletGraph.nodes.some((node) => node.type === 'drawImpactModel'), 'Rust Pistol impact renderer is not represented by an actual effect-model node.');
assert.ok(core.documentFromWeapon('frostbrand').bulletGraph.nodes.some((node) => node.type === 'drawProjectileModel' && node.props.modelId === 'blade'), 'Weapon-aware fallback projectile art is missing from Bullet Advanced.');
assert.deepEqual(rustSource.graph.nodes.concat(rustSource.bulletGraph.nodes).filter((node) => forbiddenNodes.includes(node.type)), [], 'Rust Pistol contains a forbidden source-mechanic shortcut.');
assert.equal(rustSource.graph.nodes.concat(rustSource.bulletGraph.nodes).some((node) => node.type === 'nativeFunctionEnd'), false, 'Legacy Function Complete was not migrated to Merge/Stop Flow.');
assert.ok(content.weapons.rustPistol.editorBlueprintManaged, 'Normal gameplay was not routed through the built-in blueprint wrapper.');
assert.equal(content.weapons.rustPistol.id, 'rustPistol', 'Managed weapon definition lost its lifecycle dispatch ID.');
const nativeMeleeMutation = { arc: 0, radius: 0, knockback: 0, player: {}, weapon: content.weapons.frostbrand, api: {} };
content.weaponBehaviors.ids.frostbrand.configureMelee(nativeMeleeMutation);
assert.deepEqual(
  { arc: nativeMeleeMutation.arc, radius: nativeMeleeMutation.radius, knockback: nativeMeleeMutation.knockback },
  { arc: 4.15, radius: 122, knockback: 3.5 },
  'Seeded runtime wrapper swallowed native graph mutations to the live attack context.'
);
const nativeOpts = {};
content.weaponBehaviors.ids.rustPistol.configureProjectile({ player: {}, weapon: { ...content.weapons.rustPistol, level: 3, shots: 5 }, opts: nativeOpts, api: {} });
assert.equal(nativeOpts.bounce, 0, 'Universal Set Property graph did not configure Rust Pistol bounce.');
assert.equal(nativeOpts.pierce, 2, 'Universal condition/property graph did not configure Rust Pistol pierce.');
const editableRust = core.documentFromWeapon('rustPistol');
const editableBounce = editableRust.bulletGraph.nodes.find((node) => node.type === 'nativeSetProperty' && /bounce/.test(node.props.label));
assert.ok(editableBounce, 'Editable Set Property node was not found.');
assert.ok(core.nativeParameters(editableBounce).length > 0, 'Set Property did not expose its generated logic value in the inspector model.');
assert.equal(core.setNativeParameter(editableBounce, 0, 4), true, 'Set Property parameter could not be edited.');
assert.equal(core.nativeParameters(editableBounce)[0].value, 4, 'Set Property parameter edit did not persist in graph data.');
assert.equal(core.registerWeapon(editableRust).ok, true, 'Weapon with an edited generated parameter was rejected.');
const editedNativeOpts = {};
content.weaponBehaviors.ids.rustPistol.configureProjectile({ player: {}, weapon: { ...content.weapons.rustPistol, level: 3, shots: 5 }, opts: editedNativeOpts, api: {} });
assert.equal(editedNativeOpts.bounce, 4, 'Edited Set Property value was not used by normal weapon runtime.');
content.projectileRenderers.rustPistol({ projectile: {}, ctx: {} });
content.projectileImpactRenderers.rustPistol({ projectile: {}, api: {} });
assert.equal(projectileModelDraws, 1, 'Projectile model node did not draw the registered in-game model exactly once.');
assert.equal(impactModelDraws, 1, 'Impact model node did not draw the registered in-game effect exactly once.');

const weapon = core.defaultDocument();
weapon.id = 'smoke_blueprint';
weapon.name = 'Smoke Blueprint';
weapon.damage = 20;
weapon.critChance = 25;
weapon.projectileColor = '#55aaff';
weapon.projectileModelId = 'shard';
weapon.impactEffectModelId = 'snowflake';
weapon.statusEnabled = true;
weapon.statusId = 'smoke_burning';
weapon.statusName = 'Smoke Burning';
weapon.statusTickDamage = 2;
weapon.graph = {
  version: 1,
  nodes: [
    { id: 'hit', type: 'onHit', x: 0, y: 0, props: {} },
    { id: 'chance', type: 'randomChance', x: 220, y: 0, props: { chance: 100 } },
    { id: 'spawn', type: 'spawnProjectile', x: 440, y: 0, props: { model: 'sword', count: 1, damageScale: 0.5, speedScale: 1, spread: 0, angleOffset: 0 } },
    { id: 'home', type: 'homing', x: 660, y: 0, props: { power: 0.2 } },
    { id: 'boom', type: 'explode', x: 880, y: 0, props: { radius: 90, damageScale: 0.75, status: 'none' } }
  ],
  connections: [
    { id: 'c1', from: 'hit', fromPort: 'next', to: 'chance', toPort: 'in' },
    { id: 'c2', from: 'chance', fromPort: 'true', to: 'spawn', toPort: 'in' },
    { id: 'c3', from: 'spawn', fromPort: 'next', to: 'home', toPort: 'in' },
    { id: 'c4', from: 'home', fromPort: 'next', to: 'boom', toPort: 'in' }
  ]
};
weapon.bulletGraph = {
  version: 2,
  nodes: [
    { id: 'bullet_spawn', type: 'onBulletSpawn', x: 0, y: 0, props: {} },
    { id: 'bullet_model', type: 'setProjectileModel', x: 220, y: 0, props: { model: 'feather' } },
    { id: 'bullet_sine', type: 'sinePath', x: 440, y: 0, props: { amplitude: 22, frequency: 0.12 } },
    { id: 'bullet_return', type: 'returnProjectile', x: 660, y: 0, props: { afterFrames: 33 } },
    { id: 'bullet_blast', type: 'projectileBlast', x: 880, y: 0, props: { radius: 74 } },
    { id: 'bullet_clear', type: 'clearEnemyBullets', x: 1100, y: 0, props: {} },
    { id: 'bullet_hit_move', type: 'onBulletHit', x: 0, y: 220, props: {} },
    { id: 'select_aoe', type: 'selectTargets', x: 220, y: 220, props: { source: 'enemiesInArea', center: 'impact', radius: 60, maxTargets: 64, order: 'nearest' } },
    { id: 'impact_direction', type: 'setDirection', x: 440, y: 220, props: { mode: 'bulletTravel', from: 'impact', fixedDegrees: 0, offsetDegrees: 0 } },
    { id: 'move_aoe', type: 'moveTargets', x: 660, y: 220, props: { targets: 'selectedTargets', mode: 'alongDirection', distance: 18, fixedDegrees: 0, clampArena: true } }
  ],
  connections: [
    { id: 'bc1', from: 'bullet_spawn', fromPort: 'next', to: 'bullet_model', toPort: 'in' },
    { id: 'bc2', from: 'bullet_model', fromPort: 'next', to: 'bullet_sine', toPort: 'in' },
    { id: 'bc3', from: 'bullet_sine', fromPort: 'next', to: 'bullet_return', toPort: 'in' },
    { id: 'bc4', from: 'bullet_return', fromPort: 'next', to: 'bullet_blast', toPort: 'in' },
    { id: 'bc5', from: 'bullet_blast', fromPort: 'next', to: 'bullet_clear', toPort: 'in' },
    { id: 'bc6', from: 'bullet_hit_move', fromPort: 'next', to: 'select_aoe', toPort: 'in' },
    { id: 'bc7', from: 'select_aoe', fromPort: 'next', to: 'impact_direction', toPort: 'in' },
    { id: 'bc8', from: 'impact_direction', fromPort: 'next', to: 'move_aoe', toPort: 'in' }
  ]
};

const validation = core.validateGraph(weapon.graph);
assert.equal(validation.valid, true, validation.errors.join('; '));
assert.equal(core.validateGraph(weapon.bulletGraph, 'bullet').valid, true, 'Valid Bullet Advanced graph was rejected.');
const result = core.registerWeapon(weapon);
assert.equal(result.ok, true, 'A valid editable weapon did not register.');
assert.ok(content.weapons.smoke_blueprint.editorWeapon, 'Editable data was not loaded by the normal registry.');
assert.equal(content.weapons.smoke_blueprint.damage, 20);
assert.ok(registrations.behaviors.includes('smoke_blueprint') && registrations.renderers.includes('smoke_blueprint'));
const customStatusId = core.statusDefinition(weapon).id;
assert.ok(content.statusEffects[customStatusId]?.editorStatus, 'Custom status data did not register with the normal runtime.');
assert.equal(content.weapons.smoke_blueprint.editorProjectileModelId, 'shard');
assert.equal(content.weapons.smoke_blueprint.editorImpactEffect.modelId, 'snowflake');

const spawned = [];
const explosions = [];
const pending = [];
const dataEffects = [];
const hitTarget = { x: 0, y: -100, hp: 100, maxHp: 100, radius: 12 };
const nearbyTarget = { x: 30, y: -100, hp: 100, maxHp: 100, radius: 12 };
const farTarget = { x: 180, y: -100, hp: 100, maxHp: 100, radius: 12 };
const movementTargets = [hitTarget, nearbyTarget, farTarget];
const fakeApi = {
  pushBullet(options) { const bullet = { ...options, vx: Math.cos(options.angle) * options.speed, vy: Math.sin(options.angle) * options.speed }; spawned.push(bullet); return bullet; },
  explode(...args) { explosions.push(args); },
  pushPending(value) { pending.push(value); return value; },
  field(x, y, radius, kind, life) { return { x, y, radius, kind, life }; },
  pushHazard(value) { return value; },
  enemies() { return movementTargets; },
  arenaLimit() { return 1000; },
  addParticles() {}, addBeam() {}, addRing() {},
  addDataEffect(x, y, definition, angle) { dataEffects.push({ x, y, definition, angle }); }
};
const player = { x: 0, y: 100, angle: -Math.PI / 2 };
content.weaponBehaviors.ids.smoke_blueprint.afterProjectileHit({
  player,
  weapon: content.weapons.smoke_blueprint,
  bullet: { x: 0, y: -90, vx: 0, vy: -13, damage: 20 },
  target: hitTarget,
  damage: 20,
  api: fakeApi
});
assert.equal(spawned.length, 1, 'On Hit graph did not spawn its projectile.');
assert.equal(spawned[0].homing, 0.2, 'Downstream projectile modifier did not receive the spawned projectile.');
assert.equal(spawned[0].visualModelId, 'sword', 'Graph projectile did not carry its selected data model.');
assert.equal(spawned[0].status, customStatusId, 'Graph projectile did not carry its custom runtime status.');
assert.equal(explosions.length, 1, 'Graph flow did not reach Explode.');
assert.equal(hitTarget.y, -118, 'AOE-selected original target did not move along the bullet-hit direction.');
assert.equal(nearbyTarget.y, -118, 'AOE-selected nearby enemy did not move along the bullet-hit direction.');
assert.equal(farTarget.y, -100, 'Enemy outside the configured 60 px AOE was moved.');
const configuredProjectile = { radius: 4, speed: 13 };
content.weaponBehaviors.ids.smoke_blueprint.configureProjectile({ player, weapon: content.weapons.smoke_blueprint, opts: configuredProjectile, api: fakeApi });
assert.equal(configuredProjectile.type, 'feather', 'Bullet Advanced model node did not override the base projectile model.');
assert.ok(configuredProjectile.sineAmp > 0 && configuredProjectile.sineFreq === 0.12, 'Bullet Advanced sine motion was not applied.');
assert.equal(configuredProjectile.returning, true);
assert.equal(configuredProjectile.returnAge, 33);
assert.equal(configuredProjectile.blast, 74);
assert.equal(configuredProjectile.clearsBullets, true);
assert.equal(configuredProjectile.status, customStatusId);
const meleeContext = { radius: 0, knockback: 0 };
content.weaponBehaviors.ids.smoke_blueprint.configureMelee(meleeContext);
assert.equal(meleeContext.status, customStatusId, 'Melee weapon did not apply the custom status.');
content.projectileImpactRenderers.smoke_blueprint({ x: 5, y: 9, projectile: { vx: 1, vy: 0 }, api: fakeApi });
assert.equal(dataEffects.at(-1).definition.modelId, 'snowflake', 'Impact did not use the selected effect model.');

const dangling = structuredClone(weapon.graph);
dangling.connections.push({ id: 'bad', from: 'missing', fromPort: 'next', to: 'home', toPort: 'in' });
assert.equal(core.validateGraph(dangling).valid, false, 'Dangling graph connection was accepted.');
const incomplete = structuredClone(weapon.graph);
incomplete.nodes.find((node) => node.id === 'chance').props = {};
assert.equal(core.validateGraph(incomplete).valid, false, 'Incomplete node settings were accepted.');
const cycle = structuredClone(weapon.graph);
cycle.connections = [
  { id: 'ca', from: 'hit', fromPort: 'next', to: 'home', toPort: 'in' },
  { id: 'cb', from: 'home', fromPort: 'next', to: 'boom', toPort: 'in' },
  { id: 'cc', from: 'boom', fromPort: 'next', to: 'home', toPort: 'in' }
];
const cycleValidation = core.validateGraph(cycle);
assert.equal(cycleValidation.valid, false, 'Cyclic flow was accepted.');
assert.ok(cycleValidation.errors.some((message) => message.includes('cycles')));
assert.equal(core.registerWeapon({ ...weapon, id: 'unsafe_weapon', graph: dangling }).ok, false, 'Unsafe graph entered the weapon registry.');

const remoteWeapon = core.defaultDocument();
remoteWeapon.id = 'remote_blueprint';
remoteWeapon.name = 'Remote Blueprint';
remoteWeapon.projectileModelId = 'feather';
remoteWeapon.graph.nodes[0].id = 'remote_attack';
const remoteApply = context.DKEditor.applyNetworkBundle({ kind: 'dungeon-knight-editor-catalog', schemaVersion: 5, documents: [remoteWeapon] }, { authoritative: true, source: 'host' });
assert.equal(remoteApply.accepted, 0, 'Custom weapon data unexpectedly entered multiplayer.');
assert.equal(remoteApply.rejected, 1, 'Local-only multiplayer policy did not reject a custom weapon.');
assert.equal(context.DKEditor.createNetworkBundle(), null, 'Custom editor data still creates a multiplayer bundle.');
assert.equal(context.DKEditor.networkCatalog().customMultiplayer, false, 'Editor does not advertise its local-only multiplayer policy.');

const migration = core.migrationTests();
assert.equal(migration.passed, true, `Graph migration fixtures failed: ${JSON.stringify(migration.results)}`);

const customSkill = core.defaultSkillDocument();
customSkill.id = 'smoke_skill';
customSkill.name = 'Smoke Skill';
customSkill.graph = {
  version: 4,
  nodes: [
    { id: 'use', type: 'onSkillUse', x: 0, y: 0, props: {} },
    { id: 'sequence', type: 'sequence', x: 220, y: 0, props: {} },
    { id: 'effect', type: 'playEffect', x: 440, y: -90, props: { effect: 'afterimage', size: 80, amount: 6 } },
    { id: 'shield', type: 'modifyPlayer', x: 440, y: 90, props: { property: 'invuln', operation: 'max', valueSource: 'literal', value: '30' } }
  ],
  connections: [
    { id: 's1', from: 'use', fromPort: 'next', to: 'sequence', toPort: 'in', kind: 'flow' },
    { id: 's2', from: 'sequence', fromPort: 'then1', to: 'effect', toPort: 'in', kind: 'flow' },
    { id: 's3', from: 'sequence', fromPort: 'then2', to: 'shield', toPort: 'in', kind: 'flow' }
  ]
};
assert.equal(core.registerSkill(customSkill).ok, true, 'Custom skill graph did not register.');
const skillPlayer = { x: 0, y: 0, angle: 0, invuln: 0, _editorGraphVariables: {} };
const skillResult = core.executeSkill('smoke_skill', { player: skillPlayer, api: fakeApi, randomSeed: 11 });
assert.equal(skillResult.errors.length, 0, 'Custom skill graph failed at runtime.');
assert.equal(skillPlayer.invuln, 30, 'Skill graph did not modify the player through a universal node.');
assert.ok(core.debugTrace('smoke_skill', 'skill').nodes.includes('shield'), 'Executed-node trace did not record the skill path.');

const dataWeapon = core.defaultDocument();
dataWeapon.id = 'data_wire_weapon';
dataWeapon.graph = {
  version: 4,
  nodes: [
    { id: 'attack', type: 'onAttack', x: 0, y: 0, props: {} },
    { id: 'chance', type: 'randomChance', x: 220, y: 0, props: { chance: 0 } },
    { id: 'number', type: 'valueNumber', x: 220, y: 180, props: { value: 100 } },
    { id: 'effect', type: 'playEffect', x: 440, y: 0, props: { effect: 'ring', size: 40, amount: 4 } }
  ],
  connections: [
    { id: 'd1', from: 'attack', fromPort: 'next', to: 'chance', toPort: 'in', kind: 'flow' },
    { id: 'd2', from: 'number', fromPort: 'value', to: 'chance', toPort: 'value:chance', kind: 'data' },
    { id: 'd3', from: 'chance', fromPort: 'true', to: 'effect', toPort: 'in', kind: 'flow' }
  ]
};
const dataValidation = core.validateDocument(dataWeapon);
assert.equal(dataValidation.valid, true, dataValidation.errors.join('; '));
const beforeDataEffects = dataEffects.length;
const dataRunA = core.executeGraph(core.normalizeDocument(dataWeapon), 'onAttack', { player: { x: 0, y: 0, angle: 0, _editorGraphVariables: {} }, weapon: { damage: 1 }, api: fakeApi, randomSeed: 99 }, null, 'weapon');
const dataRunB = core.executeGraph(core.normalizeDocument(dataWeapon), 'onAttack', { player: { x: 0, y: 0, angle: 0, _editorGraphVariables: {} }, weapon: { damage: 1 }, api: fakeApi, randomSeed: 99 }, null, 'weapon');
assert.equal(dataEffects.length, beforeDataEffects + 2, 'Data wire did not override the inline chance value.');
assert.deepEqual(dataRunA.trace.labels, dataRunB.trace.labels, 'Seeded graph execution was not repeatable.');

const requiredUiIds = [
  'editor-mode-btn', 'weapon-editor-screen', 'editor-new-btn', 'editor-duplicate-btn', 'editor-save-btn',
  'editor-load-btn', 'editor-test-btn', 'editor-basic-tab', 'editor-advanced-tab', 'graph-viewport',
  'graph-node-layer', 'graph-wires', 'graph-undo-btn', 'graph-redo-btn', 'graph-copy-btn',
  'graph-paste-btn', 'graph-delete-btn', 'graph-select-all-btn', 'editor-node-search', 'editor-validation-summary', 'editor-test-ui',
  'editor-projectile-tab', 'editor-effects-tab', 'editor-status-tab', 'editor-projectile-model-grid',
  'editor-impact-model-grid', 'editor-muzzle-model-grid', 'editor-selected-model-preview',
  'editor-status-model-grid', 'editor-projectile-preview', 'editor-effect-preview', 'editor-status-preview',
  'editor-mobile-library-btn', 'editor-mobile-workspace-btn', 'editor-mobile-inspector-btn',
  'editor-graph-title', 'graph-empty-example', 'graph-tutorial-btn', 'editor-node-tutorial', 'editor-tutorial-close-btn',
  'editor-delete-document-btn', 'editor-kind-weapon-btn', 'editor-kind-skill-btn', 'editor-inspector-search',
  'graph-connection-mode-btn', 'graph-recipe-select', 'graph-insert-recipe-btn', 'graph-clear-trace-btn',
  'ew-deterministic-random', 'ew-random-seed', 'es-cooldown', 'es-mana-cost', 'es-price'
];
for (const id of requiredUiIds) assert.ok(indexSource.includes(`id="${id}"`), `Missing editor UI control: ${id}`);
assert.ok(indexSource.includes('data-editor-tab="bulletAdvanced"'), 'Bullet Advanced tab is missing from the editor.');
assert.ok(indexSource.includes('<strong>Add Node</strong><span>click or tap +</span>'), 'The node palette does not explain its one-tap add control.');
assert.ok(indexSource.includes('On Bullet Hit → Select Targets → Set Direction → Move Targets'), 'The in-editor tutorial is missing the configurable AOE movement example.');
assert.ok(editorSource.includes("button.addEventListener('click',function(){addNode(type)"), 'Node rows do not add on a single click or tap.');
assert.ok(editorSource.includes('document.elementFromPoint') && editorSource.includes("window.addEventListener('pointercancel'") && editorSource.includes('setPointerCapture(event.pointerId)'), 'Mobile graph connection dragging does not use touch-safe hit testing and pointer capture.');
assert.ok(editorSource.includes('data-native-parameter') && editorSource.includes('collectNativeParameters'), 'Generated node parameters are not rendered as configurable inspector controls.');
assert.ok(editorSource.includes('data-inline-native') && editorSource.includes('data-inline-prop'), 'Node parameters are not editable directly inside nodes.');
assert.ok(editorSource.includes('data-route-node') && editorSource.includes("connectionMode:'guided'"), 'Guided mobile connections are missing.');
assert.ok(
  editorCss.includes("font-family: 'Ubuntu'") &&
  editorCss.includes('--editor-panel: #050505') &&
  editorCss.includes('.editor-topbar') &&
  editorCss.includes('.editor-layout') &&
  editorCss.includes('background-image: none'),
  'Restored editor layout or its neutral treatment is missing.'
);
assert.ok(indexSource.includes('id="weapon-editor-screen" class="weapon-editor" lang="en" data-i18n-lock') && indexSource.includes('id="editor-test-ui" class="editor-test-ui" lang="en" data-i18n-lock'), 'Editor and test mode are not locked to English.');
assert.ok(!/(?:linear|radial|conic)-gradient\s*\(/iu.test(editorCss), 'Editor styling contains a prohibited decorative gradient.');
assert.ok(!/neon|hologram|drop-shadow/iu.test(editorCss), 'Editor styling contains a prohibited sci-fi effect.');
assert.ok(editorCss.includes('background: #000') && editorCss.includes('100dvh'), 'AMOLED mobile editor styling is missing.');
assert.ok(editorCss.includes('touch-action: none') && editorCss.includes('.graph-port.connection-target') && editorCss.includes('@media (pointer: coarse)'), 'Mobile graph ports are missing enlarged touch targets or drag-target feedback.');
assert.ok(editorCss.includes('body[data-ui-screen="editor-test"] #mobile-controls { display:block !important; }'), 'Normal mobile controls are not enabled in Test Weapon mode.');
assert.ok(bootstrapSource.includes("'src/time.js'") && bootstrapSource.includes("'src/editor.js'") && bootstrapSource.includes('script.async = false'), 'Development bootstrap does not load the time wrapper and editor in deterministic order.');
assert.ok(timeSource.includes('createFixedStep') && gameSource.includes('simulationClock.advance(now,simulationIsRunning(),simulateTimeSlice)'), 'Gameplay is not driven by the elapsed-time wrapper.');
assert.ok(gameSource.includes('function enterWeaponTest') && gameSource.includes("sceneMode='editorTest'"), 'Controlled test-area integration is missing.');
assert.ok(gameSource.includes('function enterSkillTest') && gameSource.includes('core.executeSkill'), 'Node-authored skills are not integrated into the normal active-skill runtime.');
assert.ok(lobbySource.includes('function shareEditorCatalog(){return false;}') && editorSource.includes('function createNetworkBundle(){return null;}'), 'Custom editor content is not explicitly disabled for multiplayer.');

if (process.env.DK_WEAPON_JSON) {
  const importedWeapon = JSON.parse(await readFile(process.env.DK_WEAPON_JSON, 'utf8'));
  const importedValidation = core.validateDocument(importedWeapon);
  assert.equal(importedValidation.valid, true, `Imported weapon graph is invalid: ${importedValidation.errors.join('; ')}`);
  const importedRegistration = core.registerWeapon(importedWeapon);
  assert.equal(importedRegistration.ok, true, 'Imported weapon could not register through the normal weapon runtime.');
  console.log(`Imported weapon validated: ${importedWeapon.name} (${importedWeapon.bulletGraph.nodes.length} bullet nodes).`);
}

console.log(`Universal Item Maker smoke passed (${requiredNodes.length} node types, schema-v5 migrations, guided mobile wiring, data wires, seeded traces, Skill Maker, local-only custom content).`);

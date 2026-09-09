# Dungeon Knight: Infinite Arsenal v1.9.2

Dungeon Knight is a geometric canvas roguelite with endless waves, four classes, sixteen biomes, an in-world Armory, crafting, 130 built-in weapons, and one-to-four-player co-op. This v1.9.2 patch restores the exact v1.9.1 weapon definitions, held models, projectile render paths, colors, muzzle effects, impact effects, Legendary sigils, and Mythical sigils. The later global beauty-profile overlay is removed; weapon identity once again comes from each weapon's own authored module.

Every biome now also has a rare native signature enemy in addition to its existing adapted enemy skins. These sixteen enemies have their own silhouettes, movement roles, telegraphs, and mechanics. Cloud Bastion, Gilded Archive, Glass Observatory, and Neon Marsh received new landscape compositions and wall plans that protect their bridges, shelves, facets, pools, and central travel lanes. Mobile layout editing and the live controls share one viewport coordinate system, and the Mods loadout uses verified persistent switches with an explicit Apply flow.

Gameplay remains fixed-step and display-FPS independent. Low, Balanced, and Full effect budgets plus adaptive load shedding still govern particles and biome atmosphere without changing simulation results, multiplayer authority, or weapon damage.

The project uses plain HTML, CSS, and JavaScript. It has no runtime npm dependencies, framework, database, or account system.

## Included versions

- `index.html`, `styles/`, and `src/` contain the readable multiplayer source.
- `server.mjs` serves the game, room list, WebSocket signaling, and relay fallback.
- `dist/Dungeon_Knight_v1.9.2_Offline.html` is the complete single-file offline build.
- `build.mjs` regenerates the offline file.
- `render.yaml` deploys the multiplayer version as one Render Web Service.

## Play offline

Open `dist/Dungeon_Knight_v1.9.2_Offline.html` in a current browser and choose **Play**. CSS, JavaScript, and Ubuntu are embedded in that one file. Noto Sans Thai and Noto Sans JP load through the Google Fonts CSS API and therefore need an Internet connection the first time Thai or Japanese is displayed. The local artifact still disables Multiplayer and makes no signaling or WebRTC connection.

If a mobile browser refuses to open downloaded HTML directly, run `node server.mjs` and visit `http://127.0.0.1:8080`. Singleplayer still remains local to that browser.


## Content Manager and mods

Choose **Mods** on the title screen to open the v1.9.2 Mods screen. Mods are stored locally in IndexedDB and distributed as normal `.zip` packages. They can be imported/exported, created from an in-game starter, enabled/disabled, reordered, diagnosed, or removed. Every package contains root-level `manifest.json` and `icon.png` (a single wrapping folder inside the ZIP is also accepted). Toggle changes are saved immediately; leaving the screen restarts Dungeon Knight when necessary so the selected mod set loads from a clean runtime.

JavaScript mods are intentionally not limited to JSON. `main.js` and additional manifest-declared scripts can execute custom mechanics, subscribe to gameplay events, register/merge content, change exposed game rules, patch exposed functions, add localization, load bundled assets, use namespaced storage, and access the live `DKGame`/`DKUI` runtime. Broken mods are isolated and reported in Content Manager instead of aborting the base game. Custom JavaScript has the same browser privileges as the game, so only trusted code should be installed.

The former GitHub discovery/search panel has been removed. Sharing stays explicit and portable: use **Export ZIP**, publish that file anywhere you choose, and use **Import ZIP** to install it. See [the full modding guide](docs/MODDING_GUIDE.md). Complete examples are included in `examples/mods/japanese-localization/` and `examples/mods/weapon-extension/`.

## Editor Mode and Weapon Maker

Choose **Editor** on the title screen. Editor controls remain hidden everywhere else. The original v1.9.1 Editor layout has been restored, uses Ubuntu, and remains in English regardless of the selected game language. On phones, Library and Inspector open as side drawers so the active workspace keeps the full screen.

- The **Basic** tab creates, duplicates, or edits weapon identity, combat stats, rarity, type, an existing visual/model base, and synthesized attack/hit sounds. Weapon rows and the selected-base preview draw the actual in-game model through the normal weapon renderer.
- The **Projectile** tab selects and previews registered projectile silhouettes, colors, scale, spin, and trail behavior. The **Effects** tab builds muzzle and impact effects from registered visual models. The **Status** tab creates bounded status data such as burning damage, slow, duration, stacking, and its attached effect.
- **Weapon Advanced** owns attack, volley, melee, kill, world-effect, timing, combat, feedback, variable, math, comparison, target-selection, direction, and movement flow. **Bullet Advanced** separately owns aim, crit, spawn, before-hit, hit, expiry, projectile art, overlay, impact art, homing, pierce, bounce, blast, return, curve, sine/swim motion, gravity, freeze/resume, reversal, trail, model, collision, configurable spawn origins, and target behavior.
- Both Advanced tabs use the same practical node workspace. Search under **Add Node**, then click or tap the node row or its `+` once. Drag node headers to move them and drag an output circle onto a compatible input circle. Touch devices use enlarged invisible port targets, pointer capture, nearest-port release detection, and a visible target highlight so a finger can connect nodes reliably. Shift-drag empty space performs box selection on desktop; the toolbar provides copy, paste, delete, undo, and redo everywhere.
- **Node Tutorial** in the Advanced toolbar explains event → target → direction → action construction and includes working AOE movement, aimed child-projectile, property, variable, timing, validation, desktop, and mobile instructions. Generated built-in nodes such as Set Property expose their constant expression values in the Inspector instead of appearing read-only.
- **Save Weapon** stores the editable weapon definition and graph in this browser and registers it with the normal weapon registry. **Export JSON** and **Import JSON** provide portable editable files.
- **Test Weapon** opens a controlled three-target range immediately. On mobile it keeps the normal movement and action controls visible. **Return to Weapon Maker** restores the editor without restarting the game.

All 130 built-in weapons are schema-v4 native blueprints. Their attacks are expanded into data-only graphs made from reusable events, assignments, conditions, loops, target queries, damage, projectile spawning, effects, areas, and queued/wait actions. There is no **Original Mechanics** node, renamed source adapter, or weapon-specific shortcut node. Complex mechanics remain visibly complex: 56 built-ins contain at least 20 authored logic nodes, while the two RRHAR weapons each expose 153.

Bullet lifecycle mechanics are graphs too. Hit, expiry, update, bounce, and before-hit behavior—including secondary bullets, fields, particles, statuses, and delayed actions—runs through Bullet Advanced for managed built-ins. Projectile silhouettes, overlays, and impacts are selected through actual registered model nodes. The 51 bespoke renderers remain intact; the other 79 weapons use family- and behavior-aware models such as tracers, pellets, rockets, grenades, bolts, eyes, discs, stars, thorns, droplets, and sun shards instead of one round-dot fallback. Removing or reconnecting a node intentionally changes the mechanic, and duplicating a weapon keeps the full graph editable under the new ID.

Both graphs are normalized and validated before registration. Unknown or wrong-scope nodes, missing settings, dangling or incompatible connections, duplicate inputs, and cycles are blocked. Runtime flow also has strict node, connection, and execution limits, plus a compiled-graph cache, so malformed imported data cannot create an unbounded combat loop or add per-shot graph parsing cost.

Projectile, effect, and status models live in `src/content/editor/visual-catalog.js` as reusable registered data instead of Weapon Maker-only hardcoded text choices. Saved weapon documents reference those model IDs and the normal combat renderer/runtime consumes them.

In multiplayer, each peer shares its validated local schema-v4 editor catalog when it enters the room. The host resolves collisions, validates both Weapon and Bullet graphs, registers accepted definitions, and distributes one authoritative catalog before the run begins. Synced weapons, node graphs, projectile models, effects, and custom statuses therefore work for the party while Editor Mode itself remains hidden during normal play. Transfers are limited to 32 documents and 240 KB and never overwrite a peer's browser storage.

## Play multiplayer

Install Node.js 18 or newer, open a terminal in the extracted folder, and run:

```sh
node server.mjs
```

Open `http://127.0.0.1:8080`, choose **Multiplayer**, create a room, and share the same hosted address with up to three friends. Multiplayer now uses one fixed 30 Hz snapshot rate, and the room browser measures server latency every five seconds before you join. The host presses **Start** after everyone joins.

The server reads `PORT` when provided:

```sh
PORT=3000 node server.mjs
```

For Internet sharing, see [Termux + Cloudflare Quick Tunnel](docs/TERMUX_QUICK_TUNNEL.md) or [Render hosting](docs/RENDER_FREE_HOSTING.md).

## Co-op behavior

- The host is authoritative for damage, enemies, waves, drops, hazards, props, and room state.
- A guest owns the immediate feel of its own movement. The guest sends its predicted movement coordinate with sequenced input, the host sanity-checks that coordinate, and tiny host/client timing differences are not turned into visible rollback. Movement start/stop and action transitions are sent immediately instead of waiting for the normal input interval.
- Host-only world displacement is kept separate from guest-owned locomotion. Biome currents, pulls, enemy displacement, and other authoritative forces are replicated as a smooth external offset, so guest movement can feel local without cancelling actual dungeon mechanics. Remote players, enemies, projectiles, pickups, and temporary fields use velocity-based smoothing between fixed 30 Hz snapshots.
- Every room uses fixed 30 Hz authoritative core snapshots. Replaceable cosmetic/transient payloads are cadence-limited independently, while static room geometry and decoration are sent reliably only when the world revision changes rather than inside routine snapshots.
- Every run/Armory transition carries a monotonic scene revision. Guests ignore delayed scene packets and can recover a missed reliable transition from the next authoritative snapshot instead of splitting into different game states.
- Time-sensitive state uses an unordered, no-retransmit WebRTC DataChannel so an obsolete lost snapshot cannot hold newer positions behind it. Start, Armory, ready, and other critical controls remain reliable and ordered. The WebSocket relay is the fallback.
- Guest touch controls use the same nearest-enemy auto aim as the host.
- Projectiles, slashes, status damage, summons, hazards, wallet rewards, and held-hand colors retain their actual player owner.
- Every coin or mana drop creates one targeted copy per current party member. Four players therefore see four copies fly to their four owners, and uncollected copies are granted to those owners at wave end.
- Every fifth wave ends with the current biome's unique Sovereign. Wave 5 uses its authored base health; each later five-wave interval adds a bounded health and tempo pressure tier. Each fight uses authored attack families, short readable telegraphs, predictive aim, capped pattern escalation, an arena rule, phase choreography, and at most three phase-gated reinforcements. The temporary universal radial curtain remains removed, so difficulty comes from intentional movement puzzles rather than unrelated projectile clutter.
- A downed player can be revived by a nearby living teammate. The run ends only when the whole party is down.
- After each Sovereign falls, the Armory opens. Stock, purchases, crafting, inventory, coins, and materials remain private per player; everyone must mark ready before descent.
- Legendary blueprints use one Rare foundation plus boss materials. Mythical blueprints use one Legendary foundation, one lower-rarity weapon, and a larger material bundle. The Item Fabricator presents all blueprints in a persistent list.
- Armory rerolls always cost 6 coins.
- The waiting room and Armory include a simple indestructible wooden target.

Enemy population gains 42% and regular-enemy health gains 28% for each additional player. Rooms cap at four players.

## Controls

Desktop:

- `WASD` — move
- Mouse — aim and attack
- `Q` — switch weapon
- `Space` — dash
- `E` — active skill or nearby Armory action
- `I` — inventory
- `P` — pause

Every desktop action can be rebound in Settings, including mouse buttons; duplicate keys swap rather than silently disabling another action. Touch controls appear automatically. Settings can use a dedicated attack button, a draggable aim-and-fire joystick, or automatic fire. Movement, aim, dash, skill, and weapon switching use independent pointers so they can be held together. Mobile control positions, scale, and opacity are customizable, while camera distance is adjusted in Settings.

## Build and verify

```sh
npm run check
npm run build
npm run validate
```

Validation tooling covers the counted loading screen, direct six-entry main menu, Mods persistence, shared motion tokens, reduced motion, transparent-black UI contract, Thai/Japanese labels and Unicode input, remappable PC input, mobile aim/layout controls, measured diagnostics, desktop and tall-mobile layouts, the restored English Weapon/Bullet Maker, all 130 native weapon graphs, classic v1.9.1 weapon presentation, effect-quality budgets, Mage mana cadence and drops, sixteen biome variants, sixteen signature enemies and layouts, every built-in boss, crafting, four-player ownership/scene recovery, fixed 30 Hz networking, entity pooling, and heavy-combat stress scenarios.

## Network limits

The first player is the host. There is no host migration or late join after a run starts. The room server keeps no accounts, saves, passwords, or permanent room data, and the host is trusted. It is designed for a small friend group rather than hostile public matchmaking.

See [Multiplayer architecture](docs/MULTIPLAYER_ARCHITECTURE.md) for the full state and transport model.

Noto Sans Thai and Noto Sans JP are requested at runtime from the Google Fonts CSS API and are not bundled in the local build. Ubuntu is distributed under the Ubuntu Font Licence 1.0; its license is in `assets/UBUNTU_FONT_LICENSE.txt`. All game art is drawn by the included canvas code.

## Localization bundles

The language system lives in `src/bundles/`, with the built-in Japanese registration in `examples/mods/japanese-localization/main.js` so the same reviewed pack also remains a working localization-mod example. UI phrases live in each bundle's `text` map and item descriptions live under `descriptions`. The 130 reviewed Thai weapon descriptions are kept in `th-weapons.js` so translators can edit them without touching mechanics. Weapon names remain unchanged, while menus, settings, controls, class details, biomes, enemies, bosses, boss attacks, combat callouts, loading, and diagnostics have reviewed Thai/Japanese translations. English, Thai, and Japanese are included; the selected locale is stored on the device, and all three input paths respect IME composition.

The title-screen Settings screen uses left-side categories with right-side controls. It includes persistent UI scale, HUD opacity, camera distance, render resolution, display mode, language, and full/reduced UI motion; the in-run Pause screen exposes the safe subset. The compact combat HUD keeps complete weapon information in Inventory and the Loadout Bay.


## v1.9.2 source layout

Gameplay code stays in `src/game.js`, the render-independent elapsed-time wrapper stays in `src/time.js`, networking stays in `src/net.js`, Weapon Maker code stays in `src/editor.js` with its practical Ubuntu-font UI in `styles/editor.css`, and authored content lives under `src/content/`. Reusable editor projectile/effect/status definitions and their canvas models live in `src/content/editor/visual-catalog.js`; the sixteen native biome threats live in `src/content/world/signature-enemies.js`.
Weapon upgrade lines are grouped under `src/content/weapons/families/`; all 89 standalone unique weapons are indexed and grouped by weapon in `src/content/weapons/unique-weapons.js`. Skills, pacts, crafting, enemies, bosses, rooms, and biome data are separate modules as well.

Weapon modules are optional. If a weapon module is removed, the loader skips it, the weapon disappears from pools, and crafting recipes that depend on it are filtered out instead of crashing the run. Run `npm run build` after changing content to regenerate the standalone HTML and manifest.

### Editing a weapon

A weapon's readable authored source belongs to its own module (or its real upgrade-family module), rather than to weapon-name branches in `src/game.js`. `scripts/generate-native-blueprints.mjs` compiles those hooks into `src/content/editor/native-blueprints.js`; managed built-ins execute the generated universal-node data at runtime. A module can contain:

- `DKRegister.weapons(...)` — stats, rarity, family, description, and other data.
- `DKRegister.weaponBehavior(...)` — attack and gameplay hooks.
- `DKRegister.weaponRenderer(...)` — the held weapon model.
- `DKRegister.projectileRenderer(...)` / `projectileOverlay(...)` — custom projectile art.
- `DKRegister.projectileImpactRenderer(...)` — custom impact accents.
- `DKRegister.slashRenderer(...)` — custom melee swing art.
- `DKRegister.weaponAura(...)` — Legendary/Mythical attack aura art.

Supported mechanics hooks include `attack`, `updateFiring`, `prepareVolley`, `configureAngle`, `configureCrit`, `configureProjectile`, `beforeProjectileHit`, `afterProjectileHit`, `onProjectileExpire`, `configureMelee`, `afterMelee`, `onEnemyKilled`, and `drawWorldEffect`. The engine supplies reusable primitives through the hook context (`api`) for bullets, slashes, beams, rings, fields, damage, enemy lookup, delayed weapon hooks, and other shared systems.

For example, to change the Scattergun's point-blank multiplier or redraw its held model, search for `75 — SCATTERGUN` in `src/content/weapons/unique-weapons.js`. `src/game.js` should only need changes when adding a genuinely new *engine primitive* that many weapons could reuse.

Family modules work the same way. `src/content/weapons/families/ar.js`, for example, owns the four AR-family definitions, their burst mechanics, and their held models in one place.

Use this in the console to audit the loaded weapon architecture:

```js
DK_DEBUG.weaponArchitecture()
```

It reports behavior coverage, held-renderer coverage, and counts for projectile/slash/aura renderers.

### Debug console

```js
DK_DEBUG.giveWeapon("rustPistol")
DK_DEBUG.listWeapons()
DK_DEBUG.giveLegendaryWeapons()
DK_DEBUG.legendaryBoss("ember")
DK_DEBUG.legendaryBoss("prism", "dawnstarCannon")
DK_DEBUG.giveCoins(9999)
DK_DEBUG.godMode(true)
DK_DEBUG.godMode(false)
DK_DEBUG.help()
```

The `giveWeapon` command accepts an internal weapon ID or an exact displayed weapon name. Use `listWeapons()` to see the IDs available in the current content set.

`legendaryBoss(biome, weapon)` immediately starts the selected biome's boss fight, grants every Legendary weapon, fully restores the Knight, and equips Dawnstar Cannon by default. The biome accepts its index, full name, or hazard key; the optional weapon accepts a Legendary ID or exact displayed name. In multiplayer, run it from the host console.

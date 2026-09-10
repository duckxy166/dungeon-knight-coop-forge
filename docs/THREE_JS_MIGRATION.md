# Three.js renderer

The game now renders native low-poly geometry through Three.js. Simulation, damage,
collision, weapon graphs and network snapshots still use the original flat world.
`(x, y)` simulation units map to `(x / 50, 0, y / 50)` in Three.js. Height is visual.

## Run and build

```sh
npm ci
npm run build
npm run preview
```

Open the printed local address. Preview serves singleplayer files only; it does not
implement room signaling. The existing multiplayer command still requires
`server.mjs`, which is absent from this checkout.

`dist/Dungeon_Knight_v1.9.2_Offline.html` also opens directly. Three.js, geometry,
scripts and audio are embedded. The pre-existing Thai/Japanese webfont requests
remain optional; gameplay loads with the network disabled.

## Rendering contract

Readability pass: camera framing applies a 1.28 multiplier to the existing zoom
setting. Player height and held weapons are larger, with class headgear, armor,
boots and a local-player aim chevron. Damage briefly compresses the visual body
and settles over ten visual ticks; simulation and input timing are unchanged.
Floors use restrained tile variation, cover has lower neutral masonry, and
crates, anvils, lanterns, flowers and crystals have distinct silhouettes.

- `src/render3d/index.js` owns WebGL, camera projection, labels, previews and pools.
- `models.js` builds shared weapon families, class models, enemies and distinct bosses.
- `world.js` builds the sixteen biome landmarks and room geometry.
- `vector-layer.js` tessellates the built-in boss telegraphs directly into GPU
  triangles. It does not allocate Canvas textures or invoke mod Canvas renderers.
- `DKGame.renderState3d()` exposes the current scene to the renderer; rendering
  reads combat state without advancing it. It is a debug interface, not a save format.
- `DKGame.renderer3d()` exposes `render`, `resize`, `setCamera`, `screenToWorld`,
  `worldToScreen`, `dispose`, and `stats`. Coordinates passed to projection methods
  use simulation units and CSS pixels. Height is measured in Three.js units.

The orthographic camera uses 45° azimuth and 55° elevation. Screen controls are
converted once, before simulation or sending input to the host. Received network
directions are already world-space and are not rotated again. The bundle replaces
Three.js UUID randomness with browser crypto so object creation never consumes the
gameplay `Math.random` stream. The pinned dependency's UUID source is checked at build time.

Low quality disables shadow maps and thins cosmetic particles. Balanced/Full retain
shadows and progressively more particles. Hostile bullets and boss telegraphs are
not quality-thinned. Tiles, bullets and particles use instancing; entity meshes and
materials are reused. Scene replacement releases instanced floor buffers and old
entity references and GPU caches; geometry/materials are shared within each scene.

## Native mod models

Legacy mod mechanics still run. Legacy Canvas artwork is not rendered in the 3D
world. Missing 3D weapon artwork uses the weapon's category/family model; the Mods
diagnostics identify overridden Canvas renderers without native models.

Use `DK.register.model3d(kind, id, definition)` from a mod's `main.js`:

```js
DK.register.model3d('weapons', 'rustPistol', {
  parts: [
    { shape: 'box', size: [.6, .18, .18], position: [.25, 0, 0], color: '#73ced8' },
    { shape: 'cylinder', size: [.08, .5, .08], position: [.65, 0, 0],
      rotation: [0, 0, Math.PI / 2], color: '#c5d2d6' },
    { shape: 'box', size: [.1, .25, .1], position: [.08, -.16, 0], color: '#303743' }
  ]
});
```

Kinds: `weapons`, `players`, `enemies`, `projectiles`, `effects`. IDs match the
corresponding content ID (class ID for players, model ID for projectiles/effects).
Shapes: `box`, `sphere`, `crystal`, `cone`, `cylinder`, `ring`, `disc`.
Parts accept `size`, `position`, `rotation` (finite XYZ triples; radians), `color`,
and `glow`. Maximum 64 parts. Models face +X; +Y is up. A weapon model registered
for its own ID takes priority over its editor base model. Existing editor
`editorModelBase` and `editorVisualScale` values remain supported.

Editor previews use the same model builders through one reusable WebGL context,
then copy the finished preview into each UI thumbnail. They never invoke the old
Canvas weapon renderer to produce artwork.

See `examples/mods/threejs-model/main.js` for a minimal model-only extension.

## Verification

```sh
npx playwright install chromium
npm run test:3d
npm run test:editor
```

The 3D test runs actual WebGL 2 and checks projection/input, model coverage,
all 96 boss patterns, co-op ownership/prediction/cadence, render purity, 980-bullet
stress and repeated-scene GPU memory, Editor save/test/return, native mod models,
context restoration, real touch input/orientation, and offline startup.
Screenshots are saved under `.cache/render3d/`.

Legacy full validation currently has independent failures already present in HEAD:
missing multiplayer server and example mod manifests, plus an outdated mobile CSS
string assertion in `validate.mjs`. These are not replaced by passing 3D checks.

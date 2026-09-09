(function () {
    'use strict';

    var STORAGE_KEY = 'dungeonKnightAudioSettings';
    var MAX_VOICES = 24;

    var DEFAULT_VOLUMES = {
        master: 0.8,
        ui: 0.45,
        combat: 0.70,
        world: 0.40,
        music: 0.30
    };

    function readJson(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeJson(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (e) {}
    }

    var savedSettings = readJson(STORAGE_KEY, {});
    var volumes = {
        master: typeof savedSettings.master === 'number' ? savedSettings.master : DEFAULT_VOLUMES.master,
        ui: typeof savedSettings.ui === 'number' ? savedSettings.ui : DEFAULT_VOLUMES.ui,
        combat: typeof savedSettings.combat === 'number' ? savedSettings.combat : DEFAULT_VOLUMES.combat,
        world: typeof savedSettings.world === 'number' ? savedSettings.world : DEFAULT_VOLUMES.world,
        music: typeof savedSettings.music === 'number' ? savedSettings.music : DEFAULT_VOLUMES.music
    };
    var muted = {
        master: !!savedSettings.mutedMaster,
        ui: !!savedSettings.mutedUi,
        combat: !!savedSettings.mutedCombat,
        world: !!savedSettings.mutedWorld,
        music: !!savedSettings.mutedMusic
    };

    function saveSettings() {
        writeJson(STORAGE_KEY, {
            master: volumes.master,
            ui: volumes.ui,
            combat: volumes.combat,
            world: volumes.world,
            music: volumes.music,
            mutedMaster: muted.master,
            mutedUi: muted.ui,
            mutedCombat: muted.combat,
            mutedWorld: muted.world,
            mutedMusic: muted.music
        });
    }

    // Sound Manifest: eventId -> configuration
    var MANIFEST = {
        // UI Events
        'ui.focus': {
            urls: ['assets/audio/ui/cursor_1.mp3'],
            bus: 'ui', gain: 0.45, cooldownMs: 70, priority: 10, synthFallback: 'click'
        },
        'ui.confirm': {
            urls: ['assets/audio/ui/select_1.mp3'],
            bus: 'ui', gain: 0.7, cooldownMs: 50, priority: 40, synthFallback: 'chime'
        },
        'ui.back': {
            urls: ['assets/audio/ui/cancel_1.mp3'],
            bus: 'ui', gain: 0.6, cooldownMs: 60, priority: 35, synthFallback: 'click'
        },
        'ui.open': {
            urls: ['assets/audio/ui/popup_open_1.mp3'],
            bus: 'ui', gain: 0.6, priority: 40, synthFallback: 'chime'
        },
        'ui.close': {
            urls: ['assets/audio/ui/popup_close_1.mp3'],
            bus: 'ui', gain: 0.6, priority: 40, synthFallback: 'click'
        },
        'ui.tab': {
            urls: ['assets/audio/ui/swipe_1.mp3'],
            bus: 'ui', gain: 0.5, cooldownMs: 80, priority: 25, synthFallback: 'click'
        },
        'ui.change': {
            urls: ['assets/audio/ui/cursor_2.mp3'],
            bus: 'ui', gain: 0.5, cooldownMs: 90, priority: 20, synthFallback: 'click'
        },
        'ui.error': {
            urls: ['assets/audio/ui/error_1.mp3'],
            bus: 'ui', gain: 0.6, cooldownMs: 400, priority: 55, synthFallback: 'hiss'
        },
        'ui.class': {
            urls: ['assets/audio/ui/select_2.mp3'],
            bus: 'ui', gain: 0.75, cooldownMs: 100, priority: 45, synthFallback: 'chime'
        },
        'net.join': {
            urls: ['assets/audio/ui/popup_open_1.mp3'],
            bus: 'ui', gain: 0.7, priority: 50, synthFallback: 'chime'
        },
        'net.leave': {
            urls: ['assets/audio/ui/cancel_2.mp3'],
            bus: 'ui', gain: 0.7, priority: 50, synthFallback: 'click'
        },
        'net.error': {
            urls: ['assets/audio/ui/error_1.mp3'],
            bus: 'ui', gain: 0.8, cooldownMs: 600, priority: 70, synthFallback: 'hiss'
        },
        'editor.success': {
            urls: ['assets/audio/ui/select_2.mp3'],
            bus: 'ui', gain: 0.75, priority: 50, synthFallback: 'chime'
        },

        // Player & Movement Events
        'player.step.concrete': {
            urls: [
                'assets/audio/impacts/footstep_concrete_000.ogg',
                'assets/audio/impacts/footstep_concrete_001.ogg',
                'assets/audio/impacts/footstep_concrete_002.ogg',
                'assets/audio/impacts/footstep_concrete_003.ogg',
                'assets/audio/impacts/footstep_concrete_004.ogg'
            ],
            bus: 'combat', gain: 0.35, pitchRange: 0.03, priority: 20, synthFallback: 'thump'
        },
        'player.step.wood': {
            urls: [
                'assets/audio/impacts/footstep_wood_000.ogg',
                'assets/audio/impacts/footstep_wood_001.ogg',
                'assets/audio/impacts/footstep_wood_002.ogg',
                'assets/audio/impacts/footstep_wood_003.ogg',
                'assets/audio/impacts/footstep_wood_004.ogg'
            ],
            bus: 'combat', gain: 0.35, pitchRange: 0.03, priority: 20, synthFallback: 'thump'
        },
        'player.step.grass': {
            urls: [
                'assets/audio/impacts/footstep_grass_000.ogg',
                'assets/audio/impacts/footstep_grass_001.ogg',
                'assets/audio/impacts/footstep_grass_002.ogg',
                'assets/audio/impacts/footstep_grass_003.ogg',
                'assets/audio/impacts/footstep_grass_004.ogg'
            ],
            bus: 'combat', gain: 0.35, pitchRange: 0.03, priority: 20, synthFallback: 'thump'
        },
        'player.step.snow': {
            urls: [
                'assets/audio/impacts/footstep_snow_000.ogg',
                'assets/audio/impacts/footstep_snow_001.ogg',
                'assets/audio/impacts/footstep_snow_002.ogg',
                'assets/audio/impacts/footstep_snow_003.ogg',
                'assets/audio/impacts/footstep_snow_004.ogg'
            ],
            bus: 'combat', gain: 0.35, pitchRange: 0.03, priority: 20, synthFallback: 'thump'
        },
        'player.dash': {
            urls: ['assets/audio/game/dash_1.mp3'],
            bus: 'combat', gain: 0.8, pitchRange: 0.04, priority: 75, synthFallback: 'hiss'
        },
        'player.blink': {
            urls: ['assets/audio/game/dash_2.mp3'],
            bus: 'combat', gain: 0.75, pitchRange: 0.04, priority: 75, synthFallback: 'hiss'
        },
        'weapon.equip': {
            urls: ['assets/audio/game/switch.mp3'],
            bus: 'combat', gain: 0.65, priority: 40, synthFallback: 'crack'
        },

        // Weapons
        'weapon.gun': {
            urls: ['assets/audio/game/shot.mp3'],
            bus: 'combat', gain: 0.7, pitchRange: 0.05, maxVoices: 5, priority: 65, synthFallback: 'crack'
        },
        'weapon.shotgun': {
            urls: ['assets/audio/game/shot.mp3'],
            layer: 'hit.heavy', layerGain: 0.3,
            bus: 'combat', gain: 0.85, pitchRange: 0.04, maxVoices: 4, priority: 70, synthFallback: 'crack'
        },
        'weapon.launcher': {
            urls: ['assets/audio/game/shot.mp3'],
            bus: 'combat', gain: 0.85, pitch: 0.7, pitchRange: 0.03, maxVoices: 4, priority: 70, synthFallback: 'thump'
        },
        'weapon.melee': {
            urls: ['assets/audio/game/dash_2.mp3'],
            bus: 'combat', gain: 0.65, pitchRange: 0.06, priority: 60, synthFallback: 'hiss'
        },
        'weapon.bow.charge': {
            urls: ['assets/audio/game/charge_shot.mp3'],
            bus: 'combat', gain: 0.6, cooldownMs: 300, priority: 55, synthFallback: 'chime'
        },
        'weapon.bow.release': {
            urls: ['assets/audio/game/lazer_short.mp3'],
            bus: 'combat', gain: 0.7, pitchRange: 0.05, priority: 65, synthFallback: 'crack'
        },
        'weapon.magic': {
            urls: ['assets/audio/game/lazer_short.mp3'],
            bus: 'combat', gain: 0.7, pitchRange: 0.05, priority: 65, synthFallback: 'crack'
        },
        'weapon.beam': {
            urls: ['assets/audio/game/lazer_long.mp3'],
            bus: 'combat', gain: 0.65, priority: 65, synthFallback: 'hiss'
        },

        // Combat Impacts
        'hit.flesh': {
            urls: [
                'assets/audio/impacts/impactPunch_medium_000.ogg',
                'assets/audio/impacts/impactPunch_medium_001.ogg',
                'assets/audio/impacts/impactPunch_medium_002.ogg',
                'assets/audio/impacts/impactPunch_medium_003.ogg',
                'assets/audio/impacts/impactPunch_medium_004.ogg'
            ],
            bus: 'combat', gain: 0.6, pitchRange: 0.06, maxVoices: 5, cooldownMs: 40, priority: 50, synthFallback: 'thump'
        },
        'hit.heavy': {
            urls: [
                'assets/audio/impacts/impactPunch_heavy_000.ogg',
                'assets/audio/impacts/impactPunch_heavy_001.ogg',
                'assets/audio/impacts/impactPunch_heavy_002.ogg',
                'assets/audio/impacts/impactPunch_heavy_003.ogg',
                'assets/audio/impacts/impactPunch_heavy_004.ogg'
            ],
            bus: 'combat', gain: 0.75, pitchRange: 0.05, maxVoices: 4, cooldownMs: 40, priority: 65, synthFallback: 'thump'
        },
        'hit.crit': {
            urls: [
                'assets/audio/impacts/impactPunch_heavy_000.ogg',
                'assets/audio/impacts/impactPunch_heavy_001.ogg',
                'assets/audio/impacts/impactPunch_heavy_002.ogg',
                'assets/audio/impacts/impactPunch_heavy_003.ogg',
                'assets/audio/impacts/impactPunch_heavy_004.ogg'
            ],
            bus: 'combat', gain: 0.8, pitchRange: 0.05, maxVoices: 4, cooldownMs: 40, priority: 70, synthFallback: 'crack'
        },
        'hit.block': {
            urls: [
                'assets/audio/impacts/impactMetal_light_000.ogg',
                'assets/audio/impacts/impactMetal_light_001.ogg',
                'assets/audio/impacts/impactMetal_light_002.ogg',
                'assets/audio/impacts/impactMetal_light_003.ogg',
                'assets/audio/impacts/impactMetal_light_004.ogg'
            ],
            bus: 'combat', gain: 0.65, pitchRange: 0.05, cooldownMs: 50, priority: 55, synthFallback: 'crack'
        },
        'hit.wall': {
            urls: [
                'assets/audio/impacts/impactWood_light_000.ogg',
                'assets/audio/impacts/impactWood_light_001.ogg',
                'assets/audio/impacts/impactWood_light_002.ogg',
                'assets/audio/impacts/impactWood_light_003.ogg',
                'assets/audio/impacts/impactWood_light_004.ogg'
            ],
            bus: 'combat', gain: 0.45, pitchRange: 0.06, cooldownMs: 50, priority: 30, synthFallback: 'thump'
        },
        'explosion.small': {
            urls: ['assets/audio/game/explosion_1_small.mp3'],
            bus: 'combat', gain: 0.7, pitchRange: 0.05, priority: 70, synthFallback: 'thump'
        },
        'explosion.medium': {
            urls: ['assets/audio/game/explosion_1_medium.mp3'],
            bus: 'combat', gain: 0.8, pitchRange: 0.04, priority: 75, synthFallback: 'thump'
        },
        'explosion.large': {
            urls: ['assets/audio/game/explosion_1_large_1.mp3', 'assets/audio/game/explosion_1_large_2.mp3'],
            bus: 'combat', gain: 0.9, pitchRange: 0.03, priority: 85, synthFallback: 'thump'
        },
        'lightning': {
            urls: [
                'assets/audio/game/thunder_1.mp3',
                'assets/audio/game/thunder_2.mp3',
                'assets/audio/game/thunder_3.mp3',
                'assets/audio/game/thunder_4.mp3'
            ],
            bus: 'combat', gain: 0.75, cooldownMs: 100, priority: 70, synthFallback: 'crack'
        },
        'player.hurt': {
            urls: [
                'assets/audio/impacts/impactSoft_heavy_000.ogg',
                'assets/audio/impacts/impactSoft_heavy_001.ogg',
                'assets/audio/impacts/impactSoft_heavy_002.ogg',
                'assets/audio/impacts/impactSoft_heavy_003.ogg',
                'assets/audio/impacts/impactSoft_heavy_004.ogg'
            ],
            bus: 'combat', gain: 0.85, pitchRange: 0.04, priority: 90, synthFallback: 'thump'
        },
        'armor.hit': {
            urls: [
                'assets/audio/impacts/impactPlate_light_000.ogg',
                'assets/audio/impacts/impactPlate_light_001.ogg',
                'assets/audio/impacts/impactPlate_light_002.ogg',
                'assets/audio/impacts/impactPlate_light_003.ogg',
                'assets/audio/impacts/impactPlate_light_004.ogg'
            ],
            bus: 'combat', gain: 0.7, pitchRange: 0.05, priority: 80, synthFallback: 'crack'
        },
        'armor.break': {
            urls: [
                'assets/audio/impacts/impactMetal_heavy_000.ogg',
                'assets/audio/impacts/impactMetal_heavy_001.ogg',
                'assets/audio/impacts/impactMetal_heavy_002.ogg',
                'assets/audio/impacts/impactMetal_heavy_003.ogg',
                'assets/audio/impacts/impactMetal_heavy_004.ogg'
            ],
            bus: 'combat', gain: 0.85, priority: 85, synthFallback: 'crack'
        },
        'player.dodge': {
            urls: ['assets/audio/game/dash_2.mp3'],
            bus: 'combat', gain: 0.7, priority: 80, synthFallback: 'hiss'
        },
        'player.shield': {
            urls: [
                'assets/audio/impacts/impactGlass_light_000.ogg',
                'assets/audio/impacts/impactGlass_light_001.ogg',
                'assets/audio/impacts/impactGlass_light_002.ogg',
                'assets/audio/impacts/impactGlass_light_003.ogg',
                'assets/audio/impacts/impactGlass_light_004.ogg'
            ],
            bus: 'combat', gain: 0.75, priority: 80, synthFallback: 'chime'
        },
        'player.lowHp': {
            urls: ['assets/audio/ui/error_1.mp3'],
            bus: 'combat', gain: 0.55, cooldownMs: 2500, priority: 85, synthFallback: 'hiss'
        },
        'armor.restore': {
            urls: [
                'assets/audio/impacts/impactGlass_light_000.ogg',
                'assets/audio/impacts/impactGlass_light_001.ogg',
                'assets/audio/impacts/impactGlass_light_002.ogg',
                'assets/audio/impacts/impactGlass_light_003.ogg',
                'assets/audio/impacts/impactGlass_light_004.ogg'
            ],
            bus: 'combat', gain: 0.6, priority: 60, synthFallback: 'chime'
        },
        'enemy.death': {
            urls: ['assets/audio/game/enemy_damage_1.mp3', 'assets/audio/game/enemy_damage_2.mp3'],
            bus: 'combat', gain: 0.65, pitchRange: 0.05, priority: 60, synthFallback: 'thump'
        },
        'player.downed': {
            urls: ['assets/audio/game/fall_1.mp3'],
            bus: 'combat', gain: 0.9, priority: 95, synthFallback: 'thump'
        },
        'player.revive': {
            urls: ['assets/audio/game/heart_get.mp3'],
            bus: 'combat', gain: 0.85, priority: 90, synthFallback: 'chime'
        },
        'player.noMana': {
            urls: ['assets/audio/ui/error_1.mp3'],
            bus: 'combat', gain: 0.55, cooldownMs: 700, priority: 65, synthFallback: 'hiss'
        },

        // Skills
        'skill.aegisPulse': {
            urls: [
                'assets/audio/impacts/impactGlass_medium_000.ogg',
                'assets/audio/impacts/impactGlass_medium_001.ogg',
                'assets/audio/impacts/impactGlass_medium_002.ogg',
                'assets/audio/impacts/impactGlass_medium_003.ogg',
                'assets/audio/impacts/impactGlass_medium_004.ogg'
            ],
            bus: 'combat', gain: 0.8, priority: 75, synthFallback: 'chime'
        },
        'skill.frostNova': {
            urls: [
                'assets/audio/impacts/impactGlass_heavy_000.ogg',
                'assets/audio/impacts/impactGlass_heavy_001.ogg',
                'assets/audio/impacts/impactGlass_heavy_002.ogg',
                'assets/audio/impacts/impactGlass_heavy_003.ogg',
                'assets/audio/impacts/impactGlass_heavy_004.ogg'
            ],
            bus: 'combat', gain: 0.85, priority: 75, synthFallback: 'crack'
        },
        'skill.thunderTotem': {
            urls: [
                'assets/audio/impacts/impactWood_heavy_000.ogg',
                'assets/audio/impacts/impactWood_heavy_001.ogg',
                'assets/audio/impacts/impactWood_heavy_002.ogg',
                'assets/audio/impacts/impactWood_heavy_003.ogg',
                'assets/audio/impacts/impactWood_heavy_004.ogg'
            ],
            bus: 'combat', gain: 0.8, priority: 75, synthFallback: 'thump'
        },
        'skill.riftStep': {
            urls: ['assets/audio/game/dash_2.mp3'],
            bus: 'combat', gain: 0.8, priority: 75, synthFallback: 'hiss'
        },
        'skill.bladeHalo': {
            urls: [
                'assets/audio/impacts/impactMetal_medium_000.ogg',
                'assets/audio/impacts/impactMetal_medium_001.ogg',
                'assets/audio/impacts/impactMetal_medium_002.ogg',
                'assets/audio/impacts/impactMetal_medium_003.ogg',
                'assets/audio/impacts/impactMetal_medium_004.ogg'
            ],
            bus: 'combat', gain: 0.75, priority: 75, synthFallback: 'crack'
        },
        'skill.phaseClock': {
            urls: ['assets/audio/game/wobble.mp3'],
            bus: 'combat', gain: 0.8, priority: 75, synthFallback: 'chime'
        },
        'skill.crimsonSurge': {
            urls: ['assets/audio/game/squelch.mp3'],
            bus: 'combat', gain: 0.8, priority: 75, synthFallback: 'thump'
        },
        'skill.overclock': {
            urls: ['assets/audio/game/charge_shot.mp3'],
            bus: 'combat', gain: 0.75, priority: 75, synthFallback: 'chime'
        },
        'skill.echoSeal': {
            urls: ['assets/audio/game/lazer_short.mp3'],
            bus: 'combat', gain: 0.75, priority: 75, synthFallback: 'crack'
        },
        'skill.singularity': {
            urls: ['assets/audio/game/wobble.mp3'],
            bus: 'combat', gain: 0.8, priority: 75, synthFallback: 'thump'
        },
        'skill.ready': {
            urls: ['assets/audio/ui/cursor_3.mp3'],
            bus: 'combat', gain: 0.45, cooldownMs: 500, priority: 50, synthFallback: 'chime'
        },

        // Status Applications
        'status.burn': {
            urls: ['assets/audio/game/explosion_1_small.mp3'],
            bus: 'combat', gain: 0.55, cooldownMs: 150, priority: 45, synthFallback: 'thump'
        },
        'status.freeze': {
            urls: [
                'assets/audio/impacts/impactGlass_light_000.ogg',
                'assets/audio/impacts/impactGlass_light_001.ogg',
                'assets/audio/impacts/impactGlass_light_002.ogg',
                'assets/audio/impacts/impactGlass_light_003.ogg',
                'assets/audio/impacts/impactGlass_light_004.ogg'
            ],
            bus: 'combat', gain: 0.6, cooldownMs: 150, priority: 45, synthFallback: 'chime'
        },
        'status.shock': {
            urls: ['assets/audio/game/thunder_1.mp3'],
            bus: 'combat', gain: 0.6, cooldownMs: 150, priority: 45, synthFallback: 'crack'
        },
        'status.rift': {
            urls: ['assets/audio/game/lazer_short.mp3'],
            bus: 'combat', gain: 0.6, cooldownMs: 150, priority: 45, synthFallback: 'crack'
        },
        'status.curse': {
            urls: ['assets/audio/game/wobble.mp3'],
            bus: 'combat', gain: 0.6, cooldownMs: 150, priority: 45, synthFallback: 'chime'
        },
        'status.poison': {
            urls: ['assets/audio/game/squelch.mp3'],
            bus: 'combat', gain: 0.6, cooldownMs: 150, priority: 45, synthFallback: 'thump'
        },
        'progression.memory': {
            urls: ['assets/audio/game/jingle_success_2.mp3'],
            bus: 'world', gain: 0.8, priority: 80, synthFallback: 'chime'
        },

        // Pickups / World
        'loot.coin': {
            urls: ['assets/audio/ui/cursor_4.mp3'],
            bus: 'world', gain: 0.45, cooldownMs: 65, priority: 25, synthFallback: 'chime'
        },
        'loot.resource': {
            urls: [
                'assets/audio/impacts/impactMining_000.ogg',
                'assets/audio/impacts/impactMining_001.ogg',
                'assets/audio/impacts/impactMining_002.ogg',
                'assets/audio/impacts/impactMining_003.ogg',
                'assets/audio/impacts/impactMining_004.ogg'
            ],
            bus: 'world', gain: 0.6, cooldownMs: 65, priority: 45, synthFallback: 'crack'
        },
        'loot.mana': {
            urls: ['assets/audio/ui/cursor_3.mp3'],
            bus: 'world', gain: 0.5, cooldownMs: 70, priority: 35, synthFallback: 'chime'
        },
        'loot.heal': {
            urls: ['assets/audio/game/heart_get.mp3'],
            bus: 'world', gain: 0.75, priority: 50, synthFallback: 'chime'
        },
        'prop.interact': {
            urls: [
                'assets/audio/impacts/impactWood_light_000.ogg',
                'assets/audio/impacts/impactWood_light_001.ogg',
                'assets/audio/impacts/impactWood_light_002.ogg',
                'assets/audio/impacts/impactWood_light_003.ogg',
                'assets/audio/impacts/impactWood_light_004.ogg'
            ],
            bus: 'world', gain: 0.6, priority: 35, synthFallback: 'thump'
        },
        'prop.break': {
            urls: [
                'assets/audio/impacts/impactWood_heavy_000.ogg',
                'assets/audio/impacts/impactWood_heavy_001.ogg',
                'assets/audio/impacts/impactWood_heavy_002.ogg',
                'assets/audio/impacts/impactWood_heavy_003.ogg',
                'assets/audio/impacts/impactWood_heavy_004.ogg'
            ],
            bus: 'world', gain: 0.75, priority: 55, synthFallback: 'crack'
        },
        'hazard.activate': {
            urls: ['assets/audio/game/percolate.mp3'],
            bus: 'world', gain: 0.6, cooldownMs: 300, priority: 40, synthFallback: 'hiss'
        },
        'enemy.windup': {
            urls: ['assets/audio/ui/swipe_2.mp3'],
            bus: 'combat', gain: 0.4, cooldownMs: 200, priority: 40, synthFallback: 'hiss'
        },
        'enemy.attack': {
            urls: ['assets/audio/game/shot.mp3'],
            bus: 'combat', gain: 0.5, pitchRange: 0.05, pitch: 0.85, cooldownMs: 65, maxVoices: 4, priority: 45, synthFallback: 'crack'
        },
        'boss.spawn': {
            urls: [
                'assets/audio/impacts/impactBell_heavy_000.ogg',
                'assets/audio/impacts/impactBell_heavy_001.ogg',
                'assets/audio/impacts/impactBell_heavy_002.ogg',
                'assets/audio/impacts/impactBell_heavy_003.ogg',
                'assets/audio/impacts/impactBell_heavy_004.ogg'
            ],
            bus: 'world', gain: 0.95, priority: 95, synthFallback: 'thump'
        },
        'boss.phase': {
            urls: ['assets/audio/game/explosion_1_large_2.mp3'],
            layer: 'boss.spawn', layerGain: 0.4,
            bus: 'world', gain: 0.95, priority: 95, synthFallback: 'thump'
        },
        'boss.defeat': {
            urls: ['assets/audio/game/jingle_success_3.mp3'],
            bus: 'world', gain: 0.9, priority: 95, synthFallback: 'chime'
        },
        'wave.start': {
            urls: ['assets/audio/ui/select_2.mp3'],
            bus: 'world', gain: 0.7, priority: 70, synthFallback: 'chime'
        },
        'wave.clear': {
            urls: ['assets/audio/game/jingle_success_1.mp3'],
            bus: 'world', gain: 0.8, priority: 80, synthFallback: 'chime'
        },
        'room.transition': {
            urls: ['assets/audio/game/door_close.mp3', 'assets/audio/game/door_open.mp3'],
            bus: 'world', gain: 0.7, priority: 70, synthFallback: 'thump'
        },
        'shop.enter': {
            urls: ['assets/audio/ui/popup_open_1.mp3'],
            bus: 'world', gain: 0.7, priority: 60, synthFallback: 'chime'
        },
        'shop.leave': {
            urls: ['assets/audio/game/door_open.mp3'],
            bus: 'world', gain: 0.7, priority: 60, synthFallback: 'thump'
        },
        'shop.buy': {
            urls: ['assets/audio/ui/select_2.mp3'],
            bus: 'world', gain: 0.75, priority: 65, synthFallback: 'chime'
        },
        'shop.reroll': {
            urls: ['assets/audio/ui/swipe_2.mp3'],
            bus: 'world', gain: 0.65, priority: 50, synthFallback: 'click'
        },
        'forge.success': {
            urls: [
                'assets/audio/impacts/impactMetal_heavy_000.ogg',
                'assets/audio/impacts/impactMetal_heavy_001.ogg',
                'assets/audio/impacts/impactMetal_heavy_002.ogg',
                'assets/audio/impacts/impactMetal_heavy_003.ogg',
                'assets/audio/impacts/impactMetal_heavy_004.ogg'
            ],
            layer: 'ui.class', layerGain: 0.5,
            bus: 'world', gain: 0.85, priority: 80, synthFallback: 'crack'
        },
        'craft.success': {
            urls: ['assets/audio/game/jingle_success_2.mp3'],
            layer: 'loot.resource', layerGain: 0.5,
            bus: 'world', gain: 0.85, priority: 80, synthFallback: 'chime'
        },
        'run.start': {
            urls: ['assets/audio/game/door_open.mp3'],
            bus: 'world', gain: 0.8, priority: 85, synthFallback: 'thump'
        },
        'run.end': {
            urls: ['assets/audio/game/jingle_failure_1.mp3'],
            bus: 'world', gain: 0.85, priority: 90, synthFallback: 'thump'
        }
    };

    var audioCtx = null;
    var busNodes = {};
    var buffers = Object.create(null);
    var loadingPromises = Object.create(null);
    var loggedErrors = Object.create(null);
    var activeVoices = [];
    var lastPlayed = Object.create(null);
    var activeLoops = Object.create(null);

    function getAudioContext() {
        if (!audioCtx) {
            var AudioCtor = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtor) return null;
            try {
                audioCtx = new AudioCtor();
                setupBuses();
            } catch (e) {
                audioCtx = null;
            }
        }
        return audioCtx;
    }

    function setupBuses() {
        if (!audioCtx) return;
        try {
            var master = audioCtx.createGain();
            master.gain.setValueAtTime(muted.master ? 0.0001 : volumes.master, audioCtx.currentTime);
            master.connect(audioCtx.destination);
            busNodes.master = master;

            var busNames = ['ui', 'combat', 'world', 'music'];
            for (var i = 0; i < busNames.length; i++) {
                var name = busNames[i];
                var gain = audioCtx.createGain();
                gain.gain.setValueAtTime(muted[name] ? 0.0001 : volumes[name], audioCtx.currentTime);
                gain.connect(master);
                busNodes[name] = gain;
            }
        } catch (e) {}
    }

    function getBusNode(name) {
        if (!busNodes[name]) {
            getAudioContext();
        }
        return busNodes[name] || (busNodes.master || (audioCtx ? audioCtx.destination : null));
    }

    function base64ToArrayBuffer(base64) {
        var commaIdx = base64.indexOf(',');
        if (commaIdx >= 0) base64 = base64.slice(commaIdx + 1);
        var binary = atob(base64);
        var len = binary.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    function decodeAudio(ctx, arrayBuffer) {
        return new Promise(function (resolve, reject) {
            var res = ctx.decodeAudioData(arrayBuffer, function (buf) {
                resolve(buf);
            }, function (err) {
                reject(err);
            });
            if (res && typeof res.then === 'function') {
                res.then(resolve, reject);
            }
        });
    }

    function loadBuffer(path) {
        var normPath = String(path || '').replace(/\\/g, '/');
        if (buffers[normPath]) return Promise.resolve(buffers[normPath]);
        if (loadingPromises[normPath]) return loadingPromises[normPath];

        var ctx = getAudioContext();
        if (!ctx) return Promise.resolve(null);

        var promise;
        var altNormPath = normPath.replace(/^assets\//, '');
        var embedded = window.DK_AUDIO_EMBEDDED && (
            window.DK_AUDIO_EMBEDDED[normPath] ||
            window.DK_AUDIO_EMBEDDED[altNormPath] ||
            window.DK_AUDIO_EMBEDDED['assets/' + altNormPath] ||
            window.DK_AUDIO_EMBEDDED[normPath.replace(/\//g, '\\')] ||
            window.DK_AUDIO_EMBEDDED[altNormPath.replace(/\//g, '\\')]
        );
        if (embedded) {
            try {
                var ab = base64ToArrayBuffer(embedded);
                promise = decodeAudio(ctx, ab);
            } catch (err) {
                promise = Promise.reject(err);
            }
        } else if (typeof fetch === 'function') {
            promise = fetch(normPath)
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status + ' loading ' + normPath);
                    return res.arrayBuffer();
                })
                .then(function (ab) {
                    return decodeAudio(ctx, ab);
                });
        } else {
            return Promise.resolve(null);
        }

        loadingPromises[normPath] = promise.then(function (buf) {
            buffers[normPath] = buf;
            buffers[path] = buf;
            delete loadingPromises[normPath];
            return buf;
        }).catch(function (err) {
            delete loadingPromises[normPath];
            if (!loggedErrors[normPath]) {
                loggedErrors[normPath] = true;
                // Graceful silent fallback without noisy terminal output
            }
            return null;
        });

        return loadingPromises[normPath];
    }

    function synth(kind, volume, busName) {
        if (!kind || kind === 'none' || volume <= 0) return;
        var audio = getAudioContext();
        if (!audio) return;
        try {
            var now = audio.currentTime;
            var osc = audio.createOscillator();
            var gain = audio.createGain();
            var filter = audio.createBiquadFilter();
            var settings = {
                click: [190, 0.035, 'square'],
                thump: [74, 0.12, 'sine'],
                crack: [420, 0.055, 'sawtooth'],
                chime: [720, 0.22, 'sine'],
                hiss: [1500, 0.1, 'triangle']
            }[kind] || [220, 0.05, 'sine'];

            osc.type = settings[2];
            osc.frequency.setValueAtTime(settings[0], now);
            if (kind === 'thump') osc.frequency.exponentialRampToValueAtTime(42, now + settings[1]);
            if (kind === 'chime') osc.frequency.exponentialRampToValueAtTime(1080, now + settings[1]);

            filter.type = 'lowpass';
            filter.frequency.value = (kind === 'hiss' ? 2300 : 1600);

            var busNode = getBusNode(busName || (kind === 'click' || kind === 'chime' ? 'ui' : 'combat'));
            var targetGain = Math.max(0.0001, (volume || 1) * 0.09);
            gain.gain.setValueAtTime(targetGain, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + settings[1]);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(busNode || audio.destination);

            osc.start(now);
            osc.stop(now + settings[1] + 0.02);
        } catch (e) {}
    }

    function getListenerPosition() {
        if (window.DKGame && typeof window.DKGame.getListenerPosition === 'function') {
            return window.DKGame.getListenerPosition();
        }
        return null;
    }

    function play(eventId, options) {
        if (!eventId || eventId === 'none') return null;
        options = options || {};
        var now = performance.now();

        var def = MANIFEST[eventId];
        if (!def) {
            // Direct synth fallback kind
            if (['click', 'thump', 'crack', 'chime', 'hiss'].indexOf(eventId) >= 0) {
                synth(eventId, options.volume || 1, 'combat');
            }
            return null;
        }

        // Throttle check
        if (def.cooldownMs && lastPlayed[eventId] && (now - lastPlayed[eventId] < def.cooldownMs)) {
            return null;
        }

        var busName = def.bus || 'combat';
        if (muted.master || muted[busName]) {
            lastPlayed[eventId] = now;
            return null;
        }

        var audio = getAudioContext();
        if (!audio) return null;

        // Auto-resume audio context if suspended
        if (audio.state === 'suspended') {
            try { audio.resume(); } catch (e) {}
        }

        // Voice limiter per event
        var maxVoices = def.maxVoices || 4;
        var count = 0;
        var oldestVoice = null;
        for (var i = 0; i < activeVoices.length; i++) {
            var v = activeVoices[i];
            if (v.eventId === eventId) {
                count++;
                if (!oldestVoice || v.startedAt < oldestVoice.startedAt) oldestVoice = v;
            }
        }
        if (count >= maxVoices && oldestVoice) {
            try {
                oldestVoice.gainNode.gain.setValueAtTime(oldestVoice.gainNode.gain.value || 0.0001, audio.currentTime);
                oldestVoice.gainNode.gain.linearRampToValueAtTime(0.0001, audio.currentTime + 0.01);
                oldestVoice.source.stop(audio.currentTime + 0.015);
            } catch (e) {}
            var oIdx = activeVoices.indexOf(oldestVoice);
            if (oIdx >= 0) activeVoices.splice(oIdx, 1);
        }

        // Global voice limiter
        if (activeVoices.length >= MAX_VOICES) {
            var lowest = null;
            for (var j = 0; j < activeVoices.length; j++) {
                if (!lowest || activeVoices[j].priority < lowest.priority) lowest = activeVoices[j];
            }
            if (lowest && (def.priority || 50) >= lowest.priority) {
                try {
                    lowest.gainNode.gain.setValueAtTime(lowest.gainNode.gain.value || 0.0001, audio.currentTime);
                    lowest.gainNode.gain.linearRampToValueAtTime(0.0001, audio.currentTime + 0.01);
                    lowest.source.stop(audio.currentTime + 0.015);
                } catch (e) {}
                var lIdx = activeVoices.indexOf(lowest);
                if (lIdx >= 0) activeVoices.splice(lIdx, 1);
            } else if (lowest) {
                return null;
            }
        }

        // Select variant
        var urls = def.urls || [];
        if (!urls.length) return null;
        var urlIndex = options.variant != null ? (Math.abs(options.variant) % urls.length) : Math.floor(Math.random() * urls.length);
        var url = urls[urlIndex];

        var buffer = buffers[url];
        if (!buffer) {
            loadBuffer(url);
            if (def.synthFallback) {
                synth(def.synthFallback, (options.volume || 1) * (def.gain || 1), busName);
            }
            lastPlayed[eventId] = now;
            return null;
        }

        try {
            var ctxNow = audio.currentTime;
            var source = audio.createBufferSource();
            source.buffer = buffer;

            // Pitch variation
            var basePitch = options.pitch != null ? options.pitch : (def.pitch != null ? def.pitch : 1.0);
            var pitchRange = def.pitchRange || 0;
            var pitch = basePitch + (pitchRange ? (Math.random() * 2 - 1) * pitchRange : 0);
            source.playbackRate.setValueAtTime(Math.max(0.1, pitch), ctxNow);

            // Volume & Distance attenuation
            var gainNode = audio.createGain();
            var vol = (options.volume != null ? options.volume : 1.0) * (def.gain != null ? def.gain : 1.0);

            var pannerNode = null;
            if (options.x != null && options.y != null) {
                var listener = getListenerPosition();
                if (listener) {
                    var dx = options.x - listener.x;
                    var dy = options.y - listener.y;
                    var d = Math.hypot(dx, dy);
                    if (d > 1200) return null;
                    vol *= Math.max(0.08, 1 - Math.max(0, d - 140) / 840);
                    var pan = Math.max(-0.85, Math.min(0.85, dx / 550));
                    if (typeof audio.createStereoPanner === 'function') {
                        pannerNode = audio.createStereoPanner();
                        pannerNode.pan.setValueAtTime(pan, ctxNow);
                    }
                }
            }

            gainNode.gain.setValueAtTime(Math.max(0.0001, vol), ctxNow);

            var busNode = getBusNode(busName);
            source.connect(gainNode);
            if (pannerNode) {
                gainNode.connect(pannerNode);
                pannerNode.connect(busNode || audio.destination);
            } else {
                gainNode.connect(busNode || audio.destination);
            }

            source.start(0);
            lastPlayed[eventId] = now;

            var voice = {
                source: source,
                gainNode: gainNode,
                pannerNode: pannerNode,
                eventId: eventId,
                priority: def.priority || 50,
                startedAt: now
            };
            activeVoices.push(voice);

            source.onended = function () {
                var idx = activeVoices.indexOf(voice);
                if (idx >= 0) activeVoices.splice(idx, 1);
            };

            if (def.layer && !options._isLayer) {
                play(def.layer, {
                    x: options.x,
                    y: options.y,
                    volume: (options.volume != null ? options.volume : 1.0) * (def.layerGain || 0.3),
                    _isLayer: true
                });
            }

            return voice;
        } catch (e) {
            return null;
        }
    }

    function startLoop(eventId, ownerId, options) {
        if (!eventId || !ownerId) return null;
        stopLoop(ownerId);
        options = options || {};
        var def = MANIFEST[eventId];
        if (!def) return null;

        var audio = getAudioContext();
        if (!audio) return null;

        var urls = def.urls || [];
        if (!urls.length) return null;
        var url = urls[0];
        var buffer = buffers[url];
        if (!buffer) {
            loadBuffer(url);
            return null;
        }

        try {
            var ctxNow = audio.currentTime;
            var source = audio.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            var gainNode = audio.createGain();
            var vol = (options.volume != null ? options.volume : 1.0) * (def.gain != null ? def.gain : 1.0);
            gainNode.gain.setValueAtTime(0.0001, ctxNow);
            gainNode.gain.linearRampToValueAtTime(Math.max(0.0001, vol), ctxNow + 0.05);

            var busNode = getBusNode(def.bus || 'combat');
            source.connect(gainNode);
            gainNode.connect(busNode || audio.destination);
            source.start(0);

            var loopEntry = {
                source: source,
                gainNode: gainNode,
                eventId: eventId,
                ownerId: ownerId
            };
            activeLoops[ownerId] = loopEntry;
            return loopEntry;
        } catch (e) {
            return null;
        }
    }

    function stopLoop(ownerId) {
        var entry = activeLoops[ownerId];
        if (!entry) return;
        delete activeLoops[ownerId];
        var audio = getAudioContext();
        try {
            if (audio && entry.gainNode) {
                var now = audio.currentTime;
                entry.gainNode.gain.setValueAtTime(entry.gainNode.gain.value, now);
                entry.gainNode.gain.linearRampToValueAtTime(0.0001, now + 0.04);
                window.setTimeout(function () {
                    try { entry.source.stop(0); } catch (e) {}
                }, 50);
            } else {
                entry.source.stop(0);
            }
        } catch (e) {}
    }

    function stopAllLoops() {
        var keys = Object.keys(activeLoops);
        for (var i = 0; i < keys.length; i++) {
            stopLoop(keys[i]);
        }
    }

    function stopAll() {
        stopAllLoops();
        for (var i = 0; i < activeVoices.length; i++) {
            try {
                activeVoices[i].source.stop(0);
            } catch (e) {}
        }
        activeVoices.length = 0;
    }

    function setBusVolume(bus, val) {
        if (typeof val !== 'number') val = parseFloat(val) || 0;
        val = Math.max(0, Math.min(1, val));
        if (volumes[bus] !== undefined) {
            volumes[bus] = val;
            saveSettings();
            if (busNodes[bus] && !muted[bus] && !muted.master) {
                var audio = getAudioContext();
                if (audio) {
                    busNodes[bus].gain.setValueAtTime(val, audio.currentTime);
                }
            }
        }
    }

    function getBusVolume(bus) {
        return volumes[bus] !== undefined ? volumes[bus] : 1;
    }

    function setBusMuted(bus, isMuted) {
        isMuted = !!isMuted;
        if (muted[bus] !== undefined) {
            muted[bus] = isMuted;
            saveSettings();
            if (busNodes[bus]) {
                var audio = getAudioContext();
                if (audio) {
                    var targetGain = (isMuted || muted.master) ? 0.0001 : volumes[bus];
                    busNodes[bus].gain.setValueAtTime(targetGain, audio.currentTime);
                }
            }
        }
    }

    function isBusMuted(bus) {
        return muted[bus] !== undefined ? (muted[bus] || muted.master) : muted.master;
    }

    // Temporary, non-persisting duck (does not touch saved volume/mute settings).
    var duckedBuses = Object.create(null);
    function setBusDucked(bus, isDucked) {
        isDucked = !!isDucked;
        if (volumes[bus] === undefined) return;
        duckedBuses[bus] = isDucked;
        if (busNodes[bus]) {
            var audio = getAudioContext();
            if (audio) {
                var targetGain = (isDucked || muted[bus] || muted.master) ? 0.0001 : volumes[bus];
                busNodes[bus].gain.setValueAtTime(targetGain, audio.currentTime);
            }
        }
    }

    // Preload UI and starter sound assets
    function preloadStarterSounds() {
        var starters = [
            'assets/audio/ui/cursor_1.mp3',
            'assets/audio/ui/cursor_2.mp3',
            'assets/audio/ui/select_1.mp3',
            'assets/audio/ui/select_2.mp3',
            'assets/audio/ui/cancel_1.mp3',
            'assets/audio/ui/popup_open_1.mp3',
            'assets/audio/ui/popup_close_1.mp3',
            'assets/audio/ui/swipe_1.mp3',
            'assets/audio/ui/error_1.mp3',
            'assets/audio/game/dash_1.mp3',
            'assets/audio/game/dash_2.mp3',
            'assets/audio/game/shot.mp3',
            'assets/audio/game/switch.mp3',
            'assets/audio/impacts/impactPunch_medium_000.ogg',
            'assets/audio/impacts/footstep_concrete_000.ogg'
        ];
        for (var i = 0; i < starters.length; i++) {
            loadBuffer(starters[i]);
        }
    }

    // Browser audio unlock on first user gesture
    var unlocked = false;
    function unlockAudio() {
        if (unlocked) return;
        var audio = getAudioContext();
        if (!audio) return;
        if (audio.state === 'suspended') {
            audio.resume().then(function () {
                unlocked = true;
                preloadStarterSounds();
            }).catch(function () {});
        } else {
            unlocked = true;
            preloadStarterSounds();
        }
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
        window.addEventListener('keydown', unlockAudio, { passive: true, once: true });
        window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stopAllLoops();
            }
        });
    }

    // Weapon & Skill Resolvers
    function resolveWeaponAttack(weapon) {
        if (!weapon) return 'weapon.gun';
        if (weapon.sound && MANIFEST[weapon.sound]) return weapon.sound;
        if (weapon.attackSound && MANIFEST[weapon.attackSound]) return weapon.attackSound;
        var family = String(weapon.family || '').toLowerCase();
        if (family === 'shotgun') return 'weapon.shotgun';
        if (family === 'bazooka' || family === 'launcher' || family === 'mortar') return 'weapon.launcher';
        if (family === 'beam') return 'weapon.beam';
        if (family === 'bow' || family === 'repeater_bow') return 'weapon.bow.release';

        var cat = String(weapon.category || '').toUpperCase();
        if (cat === 'MELEE') return 'weapon.melee';
        if (cat === 'ARCHER') return 'weapon.bow.release';
        if (cat === 'MAGIC') return 'weapon.magic';
        return 'weapon.gun';
    }

    function resolveSkillSound(skillId) {
        var key = 'skill.' + skillId;
        return MANIFEST[key] ? key : 'weapon.magic';
    }

    function init() {
        var audio = getAudioContext();
        if (audio) preloadStarterSounds();
    }

    window.DKAudio = {
        init: init,
        play: play,
        synth: synth,
        startLoop: startLoop,
        stopLoop: stopLoop,
        stopAllLoops: stopAllLoops,
        stopAll: stopAll,
        setBusVolume: setBusVolume,
        getBusVolume: getBusVolume,
        setBusMuted: setBusMuted,
        isBusMuted: isBusMuted,
        setBusDucked: setBusDucked,
        loadBuffer: loadBuffer,
        resolveWeaponAttack: resolveWeaponAttack,
        resolveSkillSound: resolveSkillSound,
        manifest: MANIFEST,
        buffers: buffers
    };

    if (typeof window !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    }

}());

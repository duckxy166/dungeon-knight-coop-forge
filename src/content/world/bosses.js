(function () {
  'use strict';

  DKRegister.value("bosses", {
    ember: {
      name: 'DARK SPIRIT',
      title: "THE KNIGHT'S LAST SHADOW",
      color: '#c93645',
      radius: 43,
      hp: 430,
      speed: 1.72,
      combos: ['MIRROR MEMORY', "KING'S EXECUTION", 'FALSE REFLECTION', 'BLACK WALTZ', 'SHADOW SCAR', 'THRONE OF SHADOWS'],
      loot: {
        gunpowder: 4,
        metal: 4,
        sovereignEssence: 2
      }
    },
    frost: {
      name: 'GLACIAL ARCHIVIST',
      title: 'KEEPER OF WINTER',
      color: '#9ceaff',
      radius: 52,
      hp: 405,
      speed: 1.18,
      combos: ['FROZEN CONSTELLATION', 'ICE COMB', 'SKATING BLADES', 'WHITEOUT', 'CRYSTAL INDEX', 'ABSOLUTE ZERO'],
      loot: {
        arcaneCrystal: 5,
        metal: 2,
        sovereignEssence: 1
      }
    },
    sand: {
      name: 'HOURGLASS COLOSSUS',
      title: 'THE BURIED SECOND',
      color: '#e4bd66',
      radius: 58,
      hp: 430,
      speed: 1.02,
      combos: ['REVERSE HISTORY', 'MISSING SECOND', 'HOURGLASS FLIP', 'CLOCK HANDS', 'STOLEN MOMENT', '11:59'],
      loot: {
        metal: 4,
        beastFiber: 3,
        sovereignEssence: 1
      }
    },
    storm: {
      name: 'COIL SOVEREIGN',
      title: 'THE LIVING CIRCUIT',
      color: '#b879ff',
      radius: 50,
      hp: 400,
      speed: 1.4,
      combos: ['TESLA TRIANGLE', 'HUMAN CIRCUIT', 'BROKEN CIRCUIT', 'CHAIN REACTION', 'ARC LOOM', 'OVERLOAD'],
      loot: {
        gunpowder: 2,
        arcaneCrystal: 5,
        sovereignEssence: 1
      }
    },
    void: {
      name: 'EVENT HORIZON',
      title: 'MOUTH OF THE FOUNDRY',
      color: '#e548a7',
      radius: 60,
      hp: 450,
      speed: 1.0,
      combos: ['SLINGSHOT', 'BINARY STAR', 'ACCRETION DISK', 'EVENT HORIZON', 'GRAVITY LENS', 'SPAGHETTIFICATION'],
      loot: {
        metal: 2,
        arcaneCrystal: 5,
        sovereignEssence: 2
      }
    },
    blood: {
      name: 'ROSE ABBESS',
      title: 'THE SCARLET VOW',
      color: '#ff6f91',
      radius: 51,
      hp: 410,
      speed: 1.25,
      combos: ['ROSE GARDEN', 'THORN CATHEDRAL', 'STAINED GLASS', 'FUNERAL PROCESSION', 'VESPER THORNS', 'BLOOM'],
      loot: {
        beastFiber: 4,
        arcaneCrystal: 3,
        sovereignEssence: 1
      }
    },
    thorn: {
      name: 'BRIAR STAG',
      title: 'HEART OF THE ROOTS',
      color: '#70d98a',
      radius: 57,
      hp: 435,
      speed: 1.48,
      combos: ['SEEDING', 'ANTLER MAZE', 'STAMPEDE', 'ROOT CROWN', 'WILD GRAFT', 'OLD GROWTH'],
      loot: {
        beastFiber: 6,
        metal: 1,
        sovereignEssence: 1
      }
    },
    tide: {
      name: 'DROWNED BELLKEEPER',
      title: 'TOLL OF THE DEEP',
      color: '#4dd9e7',
      radius: 56,
      hp: 425,
      speed: 1.14,
      combos: ['TIDAL CURTAIN', 'BUBBLE PRISON', 'BELL TOLL', 'CROSSCURRENT', 'DROWNED CHIME', 'MAELSTROM'],
      loot: {
        metal: 4,
        arcaneCrystal: 3,
        sovereignEssence: 1
      }
    },
    cloud: {
      name: 'TEMPEST ROC',
      title: 'WING ABOVE THE KEEP',
      color: '#c7efff',
      radius: 52,
      hp: 395,
      speed: 1.58,
      combos: ['FEATHER MINEFIELD', 'SHADOW DIVE', 'CROSSWIND', 'THUNDERHEAD', 'SKYBREAK', 'EYE OF THE STORM'],
      loot: {
        beastFiber: 5,
        gunpowder: 2,
        sovereignEssence: 1
      }
    },
    glyph: {
      name: 'THE GRAND INDEX',
      title: 'LAST WORD OF GOLD',
      color: '#ffd761',
      radius: 55,
      hp: 420,
      speed: 1.08,
      combos: ['SENTENCE', 'TYPO', 'REDACTION', 'MARGIN NOTE', 'ERRATA', 'FINAL CHAPTER'],
      loot: {
        arcaneCrystal: 5,
        metal: 3,
        sovereignEssence: 1
      }
    },
    mirror: {
      name: 'PRISM WYRM',
      title: 'REFLECTION WITHOUT END',
      color: '#baf4ff',
      radius: 55,
      hp: 415,
      speed: 1.36,
      combos: ['THREE-WAY REFRACTION', 'SHARD BANK SHOT', 'KALEIDOSCOPE', 'FACET LATTICE', 'MIRROR PROOF', 'SHATTERED SKY'],
      loot: {
        arcaneCrystal: 4,
        metal: 4,
        sovereignEssence: 1
      }
    },
    neon: {
      name: 'CIRCUIT TOAD',
      title: 'HEARTBEAT OF THE MARSH',
      color: '#55ffd5',
      radius: 58,
      hp: 440,
      speed: 1.3,
      combos: ['FOUR-BEAT HOP', 'TADPOLE SWARM', 'LILY SEQUENCER', 'SYNCOPATION', 'CHORUS PULSE', 'DOUBLE TIME'],
      loot: {
        gunpowder: 3,
        arcaneCrystal: 4,
        sovereignEssence: 1
      }
    },
    magma: {
      name: 'FURNACE TYRANT',
      title: 'KING OF THE RELIQUARY',
      color: '#ff7040',
      radius: 61,
      hp: 470,
      speed: 1.12,
      combos: ['HAMMER AND ANVIL', 'FORGED BLADES', 'SLAG THROW', 'QUENCH LINE', 'CRUCIBLE PRESS', 'MELTDOWN'],
      loot: {
        gunpowder: 5,
        metal: 5,
        sovereignEssence: 1
      }
    },
    gear: {
      name: 'PENDULUM ENGINE',
      title: 'MASTER OF THE SECOND',
      color: '#e4c05b',
      radius: 59,
      hp: 455,
      speed: 1.05,
      combos: ['THREE SPEEDS', 'PENDULUM', 'TIME ZONES', 'ESCAPEMENT', 'PHASE DRIFT', 'BROKEN CLOCK'],
      loot: {
        metal: 6,
        arcaneCrystal: 2,
        sovereignEssence: 1
      }
    },
    moon: {
      name: 'ECLIPSE HOUND',
      title: 'HUNTER OF THE OSSUARY',
      color: '#d5d9ff',
      radius: 53,
      hp: 420,
      speed: 1.65,
      combos: ['CRESCENT HUNT', 'PAW TRAIL', 'MOONLIGHT', 'UMBRA PACK', 'DARK RETURN', 'TOTAL ECLIPSE'],
      loot: {
        beastFiber: 4,
        arcaneCrystal: 4,
        sovereignEssence: 1
      }
    },
    spore: {
      name: 'MYCELIAL MONARCH',
      title: 'THE COURT BENEATH',
      color: '#c5ef77',
      radius: 60,
      hp: 460,
      speed: .98,
      combos: ['SPORE GERMINATION', 'WALKING CAPS', 'HYPHAE NETWORK', 'FRUITING RING', 'ROYAL ROT', 'KINGDOM COME'],
      loot: {
        beastFiber: 6,
        arcaneCrystal: 2,
        sovereignEssence: 1
      }
    }
  }, "world/bosses");
})();

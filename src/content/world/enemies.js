(function () {
  'use strict';

  DKRegister.value("enemies", {
    chaser: {
      name: 'Gnawer',
      color: '#e67e22',
      radius: 14,
      hp: 11,
      speed: 2.25
    },
    shooter: {
      name: 'Hex Slinger',
      color: '#9b59b6',
      radius: 13,
      hp: 8,
      speed: 1.35
    },
    tank: {
      name: 'Iron Belly',
      color: '#d35400',
      radius: 22,
      hp: 32,
      speed: .9
    },
    spiral: {
      name: 'Spiral Mage',
      color: '#8e44ad',
      radius: 16,
      hp: 18,
      speed: .8
    },
    nova: {
      name: 'Nova Husk',
      color: '#27ae60',
      radius: 18,
      hp: 20,
      speed: 1.65
    },
    summoner: {
      name: 'Grave Caller',
      color: '#34495e',
      radius: 18,
      hp: 24,
      speed: 1.0
    },
    orbiter: {
      name: 'Orbit Wisp',
      color: '#00d2d3',
      radius: 14,
      hp: 14,
      speed: 2.0
    },
    charger: {
      name: 'Red Ram',
      color: '#c0392b',
      radius: 17,
      hp: 22,
      speed: 1.2
    },
    shield: {
      name: 'Bulwark',
      color: '#7f8c8d',
      radius: 19,
      hp: 28,
      speed: .85
    },
    bomber: {
      name: 'Cinder Lobber',
      color: '#f39c12',
      radius: 15,
      hp: 16,
      speed: 1.1
    },
    leech: {
      name: 'Blood Leech',
      color: '#ff4757',
      radius: 12,
      hp: 12,
      speed: 2.65
    },
    briar: {
      name: 'Briar Burrower',
      color: '#62c370',
      radius: 17,
      hp: 24,
      speed: 1.45
    },
    tidecaller: {
      name: 'Undertow Cantor',
      color: '#35b9c7',
      radius: 18,
      hp: 26,
      speed: 1.0
    },
    scribe: {
      name: 'Living Scribe',
      color: '#e0b84f',
      radius: 15,
      hp: 21,
      speed: 1.15
    },
    prism: {
      name: 'Mirror Prism',
      color: '#9ce7ff',
      radius: 17,
      hp: 27,
      speed: 1.25
    },
    splitter: {
      name: 'Glass Colony',
      color: '#7ccce6',
      radius: 21,
      hp: 34,
      speed: 1.05
    },
    shardling: {
      name: 'Glass Shardling',
      color: '#bcefff',
      radius: 9,
      hp: 7,
      speed: 3.1
    },
    cinderling: {
      name: 'Cask Imp',
      color: '#ff7a2f',
      radius: 13,
      hp: 14,
      speed: 2.15
    },
    frostshaper: {
      name: 'Ice Mason',
      color: '#8edbff',
      radius: 17,
      hp: 22,
      speed: 1.05
    },
    rootweaver: {
      name: 'Root Weaver',
      color: '#6fe38b',
      radius: 18,
      hp: 25,
      speed: .92
    },
    glassDuelist: {
      name: 'Mirror Duelist',
      color: '#a8efff',
      radius: 15,
      hp: 20,
      speed: 1.75
    },
    slagKnight: {
      name: 'Slag Knight',
      color: '#ff6a32',
      radius: 19,
      hp: 30,
      speed: 1.25
    },
    chronomancer: {
      name: 'Second Thief',
      color: '#ffd36a',
      radius: 16,
      hp: 22,
      speed: 1.05
    },
    boneArcher: {
      name: 'Moonbone Archer',
      color: '#c9d1ff',
      radius: 15,
      hp: 19,
      speed: 1.3
    },
    sporeHost: {
      name: 'Spore Host',
      color: '#b6e86b',
      radius: 18,
      hp: 26,
      speed: 1.1
    },
    vaultSkitter: {
      name: 'Vault Skitter',
      color: '#d0a45b',
      radius: 12,
      hp: 13,
      speed: 2.55
    },
    mineLayer: {
      name: 'Powder Surveyor',
      color: '#e9a75d',
      radius: 16,
      hp: 19,
      speed: 1.05
    },
    blinkStalker: {
      name: 'Veil Stalker',
      color: '#bd77e8',
      radius: 15,
      hp: 18,
      speed: 1.55
    },
    bannerBearer: {
      name: 'War-Script Bearer',
      color: '#e85b62',
      radius: 17,
      hp: 22,
      speed: 1.0
    },
    lanternMite: {
      name: 'Mana Lantern Mite',
      color: '#5fbce8',
      radius: 12,
      hp: 12,
      speed: 2.15
    },
    chainWarden: {
      name: 'Chain Warden',
      color: '#9da8b5',
      radius: 20,
      hp: 27,
      speed: .92
    },
    ashMauler: {
      name: 'Ash Mauler',
      color: '#f47b3c',
      radius: 20,
      hp: 29,
      speed: 1.18
    },
    frostLantern: {
      name: 'Frost Lantern',
      color: '#a8ebff',
      radius: 15,
      hp: 20,
      speed: 1.25
    },
    duneScarab: {
      name: 'Dune Scarab',
      color: '#d6b35f',
      radius: 14,
      hp: 18,
      speed: 2.05
    },
    arcTetherer: {
      name: 'Arc Tetherer',
      color: '#b786ff',
      radius: 17,
      hp: 23,
      speed: 1.08
    },
    roseChorister: {
      name: 'Rose Chorister',
      color: '#ff7896',
      radius: 16,
      hp: 22,
      speed: 1.12
    },
    tideSkater: {
      name: 'Tide Skater',
      color: '#58dbe5',
      radius: 14,
      hp: 19,
      speed: 2.35
    },
    mirrorMimic: {
      name: 'Mirror Mimic',
      color: '#b9f4ff',
      radius: 18,
      hp: 25,
      speed: 1.32
    },
    sporeMortar: {
      name: 'Spore Mortar',
      color: '#c4ed73',
      radius: 19,
      hp: 27,
      speed: .88
    },
    trainingDummy: {
      name: 'Armory Target',
      color: '#8e613e',
      radius: 25,
      hp: 999999,
      speed: 0
    }
  }, "world/enemies");
})();

(function () {
  'use strict';

  /*
   * Native biome enemies are rare, authored threats rather than recolored
   * stat blocks. Each one owns a silhouette, movement role, telegraph and
   * signature move. The wave pool admits only the enemy belonging to the
   * current biome, keeping mixed waves readable.
   */
  DKRegister.value('signatureEnemies', {
    palaceSentinel: { biome:'ember', name:'Palace Sentinel', color:'#c95b48', accent:'#f4d6aa', radius:20, hp:30, speed:1.16, role:'bruiser', style:'crown', skill:'royalSweep', cooldown:154, telegraph:34 },
    rimeBell:       { biome:'frost', name:'Rime Bell', color:'#6cb6ce', accent:'#effdff', radius:18, hp:24, speed:1.02, role:'artillery', style:'bell', skill:'freezeChime', cooldown:172, telegraph:42 },
    mirageOracle:   { biome:'sand', name:'Mirage Oracle', color:'#b89055', accent:'#fff0b3', radius:16, hp:21, speed:1.34, role:'skirmisher', style:'veil', skill:'mirageTriad', cooldown:148, telegraph:32 },
    tempestRook:    { biome:'storm', name:'Tempest Rook', color:'#7c58b2', accent:'#eadbff', radius:19, hp:27, speed:1.12, role:'artillery', style:'rook', skill:'arcCross', cooldown:158, telegraph:36 },
    riftMaw:        { biome:'void', name:'Rift Maw', color:'#7e397f', accent:'#ffc4e8', radius:21, hp:31, speed:1.22, role:'bruiser', style:'maw', skill:'gravityBite', cooldown:178, telegraph:46 },
    crimsonCantor:  { biome:'blood', name:'Crimson Cantor', color:'#a33d59', accent:'#ffd0dc', radius:17, hp:25, speed:1.02, role:'support', style:'choir', skill:'bloodLink', cooldown:188, telegraph:44 },
    thornLancer:    { biome:'thorn', name:'Thorn Lancer', color:'#568548', accent:'#e3ffd4', radius:18, hp:27, speed:1.36, role:'skirmisher', style:'lance', skill:'seedLine', cooldown:166, telegraph:38 },
    reefStrider:    { biome:'tide', name:'Reef Strider', color:'#348c98', accent:'#dcffff', radius:19, hp:26, speed:1.68, role:'skirmisher', style:'reef', skill:'riptideWake', cooldown:142, telegraph:30 },
    galeFalcon:     { biome:'cloud', name:'Gale Falcon', color:'#8eb8c9', accent:'#ffffff', radius:15, hp:20, speed:2.08, role:'skirmisher', style:'falcon', skill:'skyDive', cooldown:138, telegraph:28 },
    runeBailiff:    { biome:'glyph', name:'Rune Bailiff', color:'#a98946', accent:'#fff0b7', radius:20, hp:30, speed:.94, role:'artillery', style:'tablet', skill:'sealedQuadrant', cooldown:190, telegraph:50 },
    facetTwin:      { biome:'mirror', name:'Facet Twin', color:'#64aebd', accent:'#ffffff', radius:17, hp:23, speed:1.42, role:'skirmisher', style:'twin', skill:'mirrorEcho', cooldown:154, telegraph:38 },
    pulseDrummer:   { biome:'neon', name:'Pulse Drummer', color:'#32977f', accent:'#c8fff1', radius:18, hp:25, speed:1.2, role:'artillery', style:'drum', skill:'offBeat', cooldown:146, telegraph:32 },
    furnaceHound:   { biome:'magma', name:'Furnace Hound', color:'#ad4d2c', accent:'#ffd39d', radius:19, hp:28, speed:1.72, role:'bruiser', style:'hound', skill:'moltenPounce', cooldown:150, telegraph:32 },
    pendulumKnight: { biome:'gear', name:'Pendulum Knight', color:'#8d793e', accent:'#fff0b0', radius:21, hp:32, speed:.98, role:'bruiser', style:'pendulum', skill:'clockSweep', cooldown:182, telegraph:48 },
    eclipsePriest:  { biome:'moon', name:'Eclipse Priest', color:'#747da6', accent:'#f7f5ff', radius:18, hp:25, speed:1.08, role:'artillery', style:'eclipse', skill:'crescentConverge', cooldown:168, telegraph:42 },
    sporeShepherd:  { biome:'spore', name:'Spore Shepherd', color:'#718a45', accent:'#efffc2', radius:20, hp:29, speed:.94, role:'support', style:'shepherd', skill:'podGarden', cooldown:196, telegraph:52 }
  }, 'world/signature-enemies');
}());

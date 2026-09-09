(function () {
  'use strict';

  /*
   * Phase 2 biome adaptations. Every regular enemy receives the biome skin;
   * one in three (plus elites) receives the active move. That threat budget is
   * deliberate: a crowded wave should create decisions, not ability soup.
   */
  DKRegister.value('enemyVariants', {
    ember:  {name:'ASHBOUND',    tint:'#9f4d2d',accent:'#ffc27a',dark:'#35170f',sigil:'cinder', skill:'emberFan',   cooldown:330,telegraph:34},
    frost:  {name:'RIMEBOUND',   tint:'#4e91b3',accent:'#e9fbff',dark:'#173342',sigil:'flake',  skill:'iceFork',    cooldown:350,telegraph:42},
    sand:   {name:'MIRAGE-BORN', tint:'#b08a4c',accent:'#fff0b3',dark:'#4b371c',sigil:'scarab', skill:'mirageStep', cooldown:320,telegraph:30},
    storm:  {name:'ARCBOUND',    tint:'#7650a9',accent:'#ecdfff',dark:'#29183e',sigil:'arc',    skill:'arcFork',    cooldown:305,telegraph:38},
    void:   {name:'HOLLOWED',    tint:'#713377',accent:'#ffb8e4',dark:'#18091d',sigil:'eye',    skill:'voidStep',   cooldown:390,telegraph:52},
    blood:  {name:'SANGUINE',    tint:'#9b3b54',accent:'#ffd0dc',dark:'#35101a',sigil:'rose',   skill:'siphon',     cooldown:370,telegraph:46},
    thorn:  {name:'BRIARBOUND',  tint:'#4f7d43',accent:'#dcffc9',dark:'#193016',sigil:'thorn',  skill:'rootMark',   cooldown:385,telegraph:52},
    tide:   {name:'DROWNED',     tint:'#347f8a',accent:'#dcffff',dark:'#12343a',sigil:'wave',   skill:'undertow',   cooldown:320,telegraph:36},
    cloud:  {name:'GALE-KISSED', tint:'#8eb4c4',accent:'#ffffff',dark:'#35515e',sigil:'wing',   skill:'galeCut',    cooldown:300,telegraph:32},
    glyph:  {name:'RUNEBOUND',   tint:'#a4813e',accent:'#fff0b7',dark:'#382c18',sigil:'rune',   skill:'runeMark',   cooldown:405,telegraph:58},
    mirror: {name:'FACETED',     tint:'#62a7b8',accent:'#ffffff',dark:'#183640',sigil:'facet',  skill:'prismEcho', cooldown:350,telegraph:44},
    neon:   {name:'PULSE-GROWN', tint:'#328f79',accent:'#baffef',dark:'#123a31',sigil:'pulse',  skill:'pulseBeat',  cooldown:300,telegraph:36},
    magma:  {name:'FORGE-BORN',  tint:'#a64b2b',accent:'#ffd19a',dark:'#3f170e',sigil:'slag',   skill:'forgeWake',  cooldown:345,telegraph:40},
    gear:   {name:'CLOCKBOUND',  tint:'#8d793e',accent:'#fff0b0',dark:'#332c17',sigil:'gear',   skill:'secondHand', cooldown:380,telegraph:50},
    moon:   {name:'LUNAR',       tint:'#747da6',accent:'#f5f4ff',dark:'#262a46',sigil:'moon',   skill:'moonFork',   cooldown:340,telegraph:45},
    spore:  {name:'MYCELIAL',    tint:'#708744',accent:'#efffc2',dark:'#243015',sigil:'cap',    skill:'sporeCast',  cooldown:410,telegraph:56}
  }, 'world/enemy-variants');
}());

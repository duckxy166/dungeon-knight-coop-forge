(function () {
    'use strict';

    var CONTENT = window.DKContent;
    if (!CONTENT) throw new Error('Dungeon Knight content registry was not loaded.');

    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    var TAU = Math.PI * 2;
    var WORLD_LIMIT = 1360;
    var ARENA_LIMIT = 1220;
    var LAYOUT_SCALE = 1.08;
    var nextEntityId = 1;

    function el(id) { return document.getElementById(id); }
    function tr(value) { return window.DKI18n ? window.DKI18n.t(value) : value; }
    function modEvent(name,payload){return window.DKMods&&typeof window.DKMods.emit==='function'?window.DKMods.emit(name,payload||{}):(payload||{});}
    function modRule(name,fallback){return window.DKMods&&window.DKMods.rules&&Object.prototype.hasOwnProperty.call(window.DKMods.rules,name)?window.DKMods.rules[name]:fallback;}
    function playSound(eventId, opts) {
        if (window.DKAudio && typeof window.DKAudio.play === 'function') {
            return window.DKAudio.play(eventId, opts);
        }
        return null;
    }
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    function safeStorageGet(key) {
        try { return localStorage.getItem(key); } catch (err) { return null; }
    }
    function safeStorageSet(key,value) {
        try { localStorage.setItem(key,value); return true; } catch (err) { return false; }
    }
    function safeStorageJson(key,fallback) {
        try { var value=JSON.parse(localStorage.getItem(key));return value&&typeof value==='object'?value:fallback; } catch (err) { return fallback; }
    }
    function rand(min, max) { return min + Math.random() * (max - min); }
    function chance(p) { return Math.random() < p; }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    function angleDiff(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
    function fmt(v) { return Math.round(v * 10) / 10; }
    function mixHexColor(a,b,amount){
        var matchA=/^#([0-9a-f]{6})$/i.exec(String(a||'')),matchB=/^#([0-9a-f]{6})$/i.exec(String(b||''));if(!matchA||!matchB)return b||a;
        var av=parseInt(matchA[1],16),bv=parseInt(matchB[1],16),t=clamp(Number(amount)||0,0,1),r=Math.round(((av>>16)&255)*(1-t)+((bv>>16)&255)*t),g=Math.round(((av>>8)&255)*(1-t)+((bv>>8)&255)*t),bl=Math.round((av&255)*(1-t)+(bv&255)*t);return'#'+((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1);
    }
    function capArray(arr, size) { if(arr.length<=size)return;var excess=arr.length-size;for(var ci=0;ci<excess;ci++)recycleTransient(arr,arr[ci]);arr.copyWithin(0,excess);arr.length=size; }
    function compactInPlace(arr, keep) { var write=0;for(var read=0;read<arr.length;read++){var item=arr[read];if(keep(item))arr[write++]=item;}arr.length=write;return arr; }
    function compactPooled(arr,keep,recycle){var write=0;for(var read=0;read<arr.length;read++){var item=arr[read];if(keep(item))arr[write++]=item;else recycle(item);}arr.length=write;return arr;}
    function intervalElapsed(obj,key,step,period) { obj[key]=(obj[key]||0)+step;if(obj[key]+1e-7<period)return false;obj[key]%=period;return true; }
    // Combat runs in fixed elapsed-time quanta. These helpers retain the exact
    // legacy 60 Hz tuning while keeping every duration explicit and testable.
    function frameDecay(base,step){return Math.pow(base,Math.max(0,step));}
    function frameBlend(rate,step){return 1-Math.pow(1-clamp(rate,0,1),Math.max(0,step));}

    var RARITIES = {
        common:   { name: 'COMMON', color: '#ecf0f1', price: 1 },
        uncommon: { name: 'UNCOMMON', color: '#2ecc71', price: 1.22 },
        rare:     { name: 'RARE', color: '#3498db', price: 1.55 },
        epic:     { name: 'EPIC', color: '#9b59b6', price: 2.05 },
        legendary:{ name: 'LEGENDARY', color: '#f1c40f', price: 2.65 },
        mythical: { name: 'MYTHICAL', color: '#ff354d', price: 3.15 }
    };
var CLASS_DEFS = CONTENT.classes;
    var selectedClassId='independent';
var BIOMES = CONTENT.biomes;

    // Bosses returned in v1.8.6. Each sovereign keeps its original identity,
    // now with a guaranteed material bundle for every member of the party.
var BOSS_DEFS = CONTENT.bosses;
var BOSS_BEHAVIORS = CONTENT.bossBehaviors || Object.create(null);
var ENEMY_VARIANTS = CONTENT.enemyVariants || Object.create(null);
var BIOME_ART = CONTENT.biomeArt;
var DUNGEON_MEMORY_DEFS = CONTENT.memories;
var ROOM_LAYOUTS = CONTENT.roomLayouts;
var WEAPON_DEFS = CONTENT.weapons;
var RESOURCE_DEFS = CONTENT.resources;

    // A readable, material-assisted ladder: Legendary recipes consume one Rare
    // family weapon; Mythicals consume their Legendary foundation plus one
    // lower-rarity weapon. This keeps rare drops useful without demanding three
    // exact high-tier rolls from each player.
var CRAFT_RECIPES = CONTENT.recipes.filter(function(recipe){return !!WEAPON_DEFS[recipe.result] && (recipe.parts||[]).every(function(id){return !!WEAPON_DEFS[id];});});
var WEAPON_ANIMATIONS = CONTENT.weaponAnimations;
var WEAPON_BEHAVIORS = CONTENT.weaponBehaviors;
var WEAPON_RENDERERS = CONTENT.weaponRenderers;
var PROJECTILE_RENDERERS = CONTENT.projectileRenderers;
var PROJECTILE_OVERLAYS = CONTENT.projectileOverlays;
var PROJECTILE_IMPACT_RENDERERS = CONTENT.projectileImpactRenderers;
var PROJECTILE_MODELS = CONTENT.projectileModels || Object.create(null);
var EFFECT_MODELS = CONTENT.effectModels || Object.create(null);
var STATUS_EFFECTS = CONTENT.statusEffects || Object.create(null);
var VISUALS = window.DKVisuals || null;
var SLASH_RENDERERS = CONTENT.slashRenderers;
var WEAPON_AURAS = CONTENT.weaponAuras;
var SIGNATURE_ENEMIES = CONTENT.signatureEnemies || Object.create(null);
var STAT_DEFS = CONTENT.stats;
var ACTIVE_DEFS = CONTENT.activeSkills;
var PASSIVE_DEFS = CONTENT.passiveSkills;
var PACT_DEFS = CONTENT.pacts;
var SUPPORT_ART = CONTENT.supportArt;
var PALACE_ART = CONTENT.palaceArt || Object.create(null);


    // Weapon modules own mechanics. The engine only dispatches hooks and exposes
    // reusable primitives; it does not know individual weapon IDs or handlers.
    function weaponBehaviorLayers(w) {
        if (!w) return [];
        // Built-in weapons migrated to Weapon Maker execute their validated,
        // data-only node graphs. Only that graph behavior is dispatched here,
        // so no hidden source mechanic can run alongside the visible graph.
        if (w.editorBlueprintManaged && WEAPON_BEHAVIORS.ids[w.id]) return [WEAPON_BEHAVIORS.ids[w.id]];
        var layers=[];
        if (w.handler && WEAPON_BEHAVIORS.handlers[w.handler]) layers.push(WEAPON_BEHAVIORS.handlers[w.handler]);
        if (w.family && WEAPON_BEHAVIORS.families[w.family]) layers.push(WEAPON_BEHAVIORS.families[w.family]);
        if (WEAPON_BEHAVIORS.ids[w.id]) layers.push(WEAPON_BEHAVIORS.ids[w.id]);
        return layers;
    }
    function runWeaponHooks(w,name,context) {
        var layers=weaponBehaviorLayers(w);
        for(var i=0;i<layers.length;i++)if(typeof layers[i][name]==='function')layers[i][name](context);
        return context;
    }
    function runWeaponAction(w,name,context) {
        var layers=weaponBehaviorLayers(w);
        for(var i=layers.length-1;i>=0;i--){var fn=layers[i][name];if(typeof fn==='function'&&fn(context)!==false)return true;}
        return false;
    }
    function weaponHasHook(w,name){var layers=weaponBehaviorLayers(w);for(var i=layers.length-1;i>=0;i--)if(typeof layers[i][name]==='function')return true;return false;}

    var WEAPON_API = {
        TAU: TAU, clamp: clamp, rand: rand, chance: chance, dist: dist,
        addRing: addRing, addParticles: addParticles, addFloat: addFloat, addWeaponFlash: addWeaponFlash,
        addLightning: addLightning, addBeam: addBeam, addDarkBloom: addDarkBloom, addDataEffect: addDataEffect,
        explode: explode, closestEnemy: closestEnemy, damageEnemy: damageEnemy, chainLightning: chainLightning,
        weaponLevelScale: weaponLevelScale, showToast: showToast,
        bullets: function(){return bullets;}, enemies: function(){return enemies;}, biomeProps: function(){return biomeProps;}, hazards: function(){return hazards;}, effects: function(){return effects;}, shopMode: function(){return shopMode;}, arenaLimit: function(){return ARENA_LIMIT;},
        pushBullet: function(opts){var bullet=spawnBullet(opts);bullets.push(bullet);return bullet;},
        pushSlash: function(opts){var slash=spawnSlash(opts);slashes.push(slash);return slash;},
        pushPending: function(shot){pendingShots.push(shot);return shot;},
        pushHazard: function(field){hazards.push(field);return field;},
        pushEffect: function(effect,priority){return pushEffect(effect,priority);},
        field: function(x,y,radius,kind,life){return new TimedField(x,y,radius,kind,life);},
        sunlion: function(player,w,angle){radiantWeapons.push(new SunlionHunt(w,angle));capArray(radiantWeapons,8);return radiantWeapons[radiantWeapons.length-1];},
        capBullets: function(){capArray(bullets,720);},
        clearHits: function(bullet){if(bullet&&bullet.hitIds)clearHitLedger(bullet.hitIds);return bullet;},
        linkTargets: bindMarionette,
        plantLinkField: plantTripwire,
        updateWeaponHUD: updateWeaponHUD,
        hitBiomeProp: hitBiomeProp,
        intervalElapsed: intervalElapsed,
        setWorldTime: function(scale,duration){worldSlowScale=clamp(Number(scale)||.45,.05,2);worldSlowTimer=Math.max(worldSlowTimer,Number(duration)||1);return worldSlowTimer;},
        spawnSummon: function(kind,origin,angle,distance,duration,count){origin=origin||player||{x:0,y:0};angle=Number(angle)||0;distance=Number(distance)||0;count=Math.max(1,Math.min(16,Math.round(Number(count)||1)));if(kind==='orbitingBlade'){if(player)player.bladeHaloTimer=Math.max(player.bladeHaloTimer||0,Number(duration)||360);return player;}var made=[];for(var si=0;si<count;si++){var spread=count>1?(si-(count-1)/2)*.3:0,summon=new Totem(origin.x+Math.cos(angle+spread)*distance,origin.y+Math.sin(angle+spread)*distance);summon.life=Number(duration)||370;totems.push(summon);made.push(summon);}return made;},
        gameTime: function(){return gameTimeMs;}
    };

    var gameActive = false;
    var debugGodMode = false;
    var gamePaused = false;
    var pauseReason = '';
    var SIMULATION_STEP_MS = 1000 / 60;
    var simulationClock = window.DKTime.createFixedStep({stepMs:SIMULATION_STEP_MS,baseStepMs:SIMULATION_STEP_MS,maxCatchUpMs:250});
    var visualTick = 0;
    var visualTimeMs = 0;
    var gameTimeMs = 0;
    var hudRefreshMs = 0;
    var inventoryOpen = false;
    var inventoryReturnPause = false;
    var craftingOpen = false;
    var stopConfirmUntil = 0;
    var score = 0;
    var wave = 0;
    var coins = 0;
    var kills = 0;
    var shopVisits = 0;
    var shopRerolls = 0;
    var shopMode = false;
    var shopInteractLock = false;
    var nearbyShopIndex = -1;
    var nearbyForge = false;
    var nearbyCraft = false;
    var shopForge = {x:0,y:0};
    var shopCraft = {x:0,y:0};
    var shopForgePurchases = 0;
    var shopCrafts = 0;
    var craftRecipeIndex = 0;
    var focusedRecipeId = CRAFT_RECIPES[0].id;
    var shopCenter = {x:0,y:0};
    var shopPlatforms = [
        {x:-500,y:-125},{x:-255,y:-125},{x:-500,y:80},{x:-255,y:80},
        {x:255,y:-125},{x:500,y:-125},{x:255,y:80},{x:500,y:80}
    ];
    var waveTransition = false;
    var transitionTimer = 0;
    var wavePhase = 0;
    var wavePhaseTotal = 2;
    var phaseBreak = false;
    var phaseBreakTimer = 0;
    var phaseSpawnCounts = [0,0];
    var palaceStatueFallen=false;
    var palaceCutscene={active:false,timer:0,stage:'',statueFall:0,spiritAlpha:0,swordLift:0,titleAlpha:0};
    var currentBiome = BIOMES[0];
    var waveVacuum = false;
    var currentZoom = .75;
    var targetZoom = .75;
    var cameraZoomSetting = clamp(Number(safeStorageGet('dungeonKnightCameraZoom'))||1,.7,1.35);
    var worldSlowTimer = 0,worldSlowScale=.45;
    var nextPuppetGroup = 1;
    var toastTimer = 0;
    var pixelRatio = 1;
    var viewportWidth = innerWidth;
    var viewportHeight = innerHeight;
    var touchMode = false;
    var renderScale = clamp(Number(safeStorageGet('dungeonKnightRenderScale'))||1,.7,1);
    var runtimeSettings = {
        frameLimit: safeStorageGet('dungeonKnightFrameLimit') || '60',
        effectQuality: safeStorageGet('dungeonKnightEffectQuality') || 'balanced',
        damageNumbers: safeStorageGet('dungeonKnightDamageNumbers') || 'all',
        playerNames: safeStorageGet('dungeonKnightPlayerNames') || 'on',
        debugMode: safeStorageGet('dungeonKnightDebugMode') || 'off',
        autoPause: safeStorageGet('dungeonKnightAutoPause') || 'on'
    };
    var perfTelemetry = { fps:0, frameMs:0, simulationMs:0, renderMs:0, renderShare:0, simulationShare:0, renderedFrames:0, lastRenderAt:0, debugPaintAt:0 };
    var ENEMY_CELL = 180;
    var enemyGrid = Object.create(null);
    var enemyGridKeys = [];
    var enemyGridReady = false;
    var collisionCandidates = [];
    var perfStats = { collisionCandidates:0, collisionChecks:0, closestCandidates:0, culledDraws:0, drawnEntities:0 };

    var player = null;
    var mainPlayer = null;
    var enemies = [];
    var bullets = [];
    var slashes = [];
    var particles = [];
    var effects = [];
    var pickups = [];
    var obstacles = [];
    var hazards = [];
    var biomeProps = [];
    var roomDecor = [];
    var radiantWeapons = [];
    var currentLayout = null;
    var totems = [];
    var pendingShots = [];
    var shopOffers = [];
    var camera = { x: 0, y: 0 };
    var bulletPool = [];
    var particlePool = [];
    var slashPool = [];
    var poolStats = {bulletCreated:0,bulletReused:0,particleCreated:0,particleReused:0,slashCreated:0,slashReused:0};
    var heldRenderAudit = { custom:0, fallback:0 };

    var DEFAULT_KEYBINDINGS = {moveUp:'KeyW',moveDown:'KeyS',moveLeft:'KeyA',moveRight:'KeyD',attack:'Mouse0',dash:'Space',ability:'KeyE',switchWeapon:'KeyQ',inventory:'KeyI',pause:'KeyP'};
    var keybindings = Object.assign({},DEFAULT_KEYBINDINGS,safeStorageJson('dungeonKnightKeybinds',{}));
    var pressedInputs = Object.create(null);
    var keys = { w: false, a: false, s: false, d: false, q: false, e: false, space: false, attack:false };
    var mouse = { x: 0, y: 0, down: false };
    var joystick = { active: false, x: 0, y: 0, originX: 0, originY: 0, id: null };
    var aimJoystick = { active:false, angle:0, strength:0, originX:0, originY:0, id:null };
    var buttons = { fire: false, dash: false, switch: false, ability: false };

    // v1.8.6 co-op state. The host is authoritative for the dungeon while every
    // client owns its private Armory roll. Local mode never touches networking.
    var PARTY_COLORS=['#e74c3c','#3498db','#2ecc71','#f1c40f'];
    var sceneMode='menu';
    var lobbyActive=false;
    var editorTestActive=false;
    var editorTestPreviousGodMode=false;
    var editorTestPreviousSetup=null;
    var networkRole='local';
    var localPeerId='local';
    var localPlayerName='KNIGHT';
    var partyRoster=[];
    var remotePlayers=Object.create(null);
    var remoteInputs=Object.create(null);
    var armoryReady=Object.create(null);
    var queuedStarterId='';
    var queuedProfile=null;
    var netInputClock=0;
    var netSnapshotClock=0;
    var netWorldRevision=0;
    var netSentWorldRevision=-1;
    var netBulletId=1;
    var netSlashId=1;
    var netPickupId=1;
    var netFieldId=1;
    var netTotemId=1;
    var netRadiantId=1;
    var netSnapshotSeq=0;
    var netBuildSeq=0;
    var netLastSnapshotSeq=0;
    var netSceneRevision=0;
    var netAppliedSceneRevision=-1;
    var netAppliedWorldRevision=-1;
    var netInputSeq=0;
    var netLastAckSeq=0;
    var netPredictionHistory=[];
    var netPredictionError={x:0,y:0};
    var netTransientSnapshotBudget=0;
    var netLastInputSignature='';
    var netOwnerResyncCount=0;
    var netExternalApplied={x:0,y:0};
    var netExternalTarget={x:0,y:0};
    var lastGuestSnapshotAt=0;
    var guestScene='lobby';
    var networkSnapshotHz=30;
    var NET_SNAPSHOT_FRAMES=2;
    var NET_INPUT_FRAMES=2;
    var NET_STALE_MOVE_MS=420;
    var NET_STALE_ACTION_MS=180;
    // v1.8.6.5: owned movement is deliberately tolerant. Tiny host/client
    // differences are normal network latency, not a reason to rubber-band.
    var NET_PREDICTION_DEADZONE=18;
    var NET_PREDICTION_HARD_SNAP=260;
    var NET_OWNER_REJECT_THRESHOLD=42;
    var NET_OWNER_PACKET_LIMIT=240;

    function partyCount(){return networkRole==='local'?1:Math.max(1,partyRoster.length);}
    function coopHpMultiplier(){return networkRole==='host'?1+(partyCount()-1)*.28:1;}
    function coopSpawnMultiplier(){return networkRole==='host'?1+(partyCount()-1)*.42:1;}
    function partyPlayers(){var list=[],primary=mainPlayer||player;if(primary)list.push(primary);Object.keys(remotePlayers).forEach(function(id){var member=remotePlayers[id];if(member&&list.indexOf(member)<0)list.push(member);});return list;}
    function playerByNetId(id){var primary=mainPlayer||player;if(primary&&primary.netId===id)return primary;return remotePlayers[id]||null;}
    function walletFor(member){return member===mainPlayer?coins:Math.max(0,Number(member&&member.coins)||0);}
    function setWallet(member,value){value=Math.max(0,Math.floor(Number(value)||0));if(member===mainPlayer)coins=value;else if(member)member.coins=value;return value;}
    function addWallet(member,value){return setWallet(member,walletFor(member)+(Number(value)||0));}
    function emptyResourceBag(){var bag={};Object.keys(RESOURCE_DEFS).forEach(function(id){bag[id]=0;});return bag;}
    function normalizeResources(source,max){var bag=emptyResourceBag(),limit=max||9999;if(source&&typeof source==='object')Object.keys(RESOURCE_DEFS).forEach(function(id){bag[id]=Math.floor(clamp(Number(source[id])||0,0,limit));});return bag;}
    function resourcesFor(member){if(!member)return emptyResourceBag();if(!member.resources)member.resources=emptyResourceBag();return member.resources;}
    function addResource(member,id,value){if(!member||!RESOURCE_DEFS[id])return 0;var bag=resourcesFor(member);bag[id]=Math.max(0,Math.floor((Number(bag[id])||0)+(Number(value)||0)));return bag[id];}
    function resourceSummary(member,compact){var bag=resourcesFor(member);return Object.keys(RESOURCE_DEFS).map(function(id){var def=RESOURCE_DEFS[id];return compact?def.short+' '+bag[id]:def.icon+' '+def.name+' '+bag[id];}).join(compact?' · ':'\n');}
    function setNetworkSnapshotHz(){networkSnapshotHz=30;NET_SNAPSHOT_FRAMES=2;netSnapshotClock=0;return networkSnapshotHz;}
    function setUiScene(name){if(typeof document!=='undefined'&&document.body)document.body.setAttribute('data-ui-screen',name||'run');}
    function mobileAutoFireEnabled(){return isTouchDevice()&&document.body&&document.body.getAttribute('data-mobile-attack')==='auto';}
    function mobileAimFireEnabled(){return isTouchDevice()&&document.body&&document.body.getAttribute('data-mobile-attack')==='aim';}
    function isTextInputTarget(target){return!!(target&&(/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)||target.isContentEditable));}
    function cleanRuntimeName(value){value=String(value||'KNIGHT');if(value.normalize)value=value.normalize('NFC');try{value=value.replace(/[^\p{L}\p{M}\p{N} _-]/gu,'');}catch(error){value=value.replace(/[^a-z0-9 _\-\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/gi,'');}if(typeof Intl!=='undefined'&&Intl.Segmenter)value=Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(value),function(part){return part.segment;}).slice(0,16).join('');else value=Array.from(value).slice(0,16).join('');return value.trim()||'KNIGHT';}
    function syncBoundInputs(){keys.w=!!pressedInputs[keybindings.moveUp];keys.s=!!pressedInputs[keybindings.moveDown];keys.a=!!pressedInputs[keybindings.moveLeft];keys.d=!!pressedInputs[keybindings.moveRight];keys.q=!!pressedInputs[keybindings.switchWeapon];keys.e=!!pressedInputs[keybindings.ability];keys.space=!!pressedInputs[keybindings.dash];keys.attack=!!pressedInputs[keybindings.attack];mouse.down=keys.attack;}
    function clearBoundInputs(){pressedInputs=Object.create(null);syncBoundInputs();}
    function getKeybindings(){return Object.assign({},keybindings);}
    function setKeybinding(action,code){if(!Object.prototype.hasOwnProperty.call(DEFAULT_KEYBINDINGS,action)||!code)return getKeybindings();code=String(code);var old=keybindings[action],displaced=Object.keys(keybindings).find(function(name){return name!==action&&keybindings[name]===code;});if(displaced)keybindings[displaced]=old;keybindings[action]=code;safeStorageSet('dungeonKnightKeybinds',JSON.stringify(keybindings));clearBoundInputs();return getKeybindings();}
    function resetKeybindings(){keybindings=Object.assign({},DEFAULT_KEYBINDINGS);safeStorageSet('dungeonKnightKeybinds',JSON.stringify(keybindings));clearBoundInputs();return getKeybindings();}
    var EFFECT_QUALITY_PROFILES = {
        low: {particleScale:.34,layers:1,trailMax:4,trailPeriod:4.2,maxParticles:260,maxEffects:220,shadow:0,ambient:0},
        balanced: {particleScale:.68,layers:2,trailMax:7,trailPeriod:2.7,maxParticles:430,maxEffects:330,shadow:2,ambient:.62},
        full: {particleScale:1,layers:3,trailMax:11,trailPeriod:1.8,maxParticles:620,maxEffects:470,shadow:6,ambient:1}
    };
    function effectQualityProfile(){return EFFECT_QUALITY_PROFILES[runtimeSettings.effectQuality]||EFFECT_QUALITY_PROFILES.balanced;}
    function adaptiveCosmeticScale(){var load=cosmeticLoad();return load>780?.4:load>620?.58:load>470?.78:1;}
    function effectQualityScale(){return effectQualityProfile().particleScale*adaptiveCosmeticScale();}
    function configureRuntimeSettings(settings){settings=settings||{};runtimeSettings.frameLimit=['0','30','60','120'].indexOf(String(settings.frameLimit))>=0?String(settings.frameLimit):runtimeSettings.frameLimit;runtimeSettings.effectQuality=['full','balanced','low'].indexOf(settings.effectQuality)>=0?settings.effectQuality:runtimeSettings.effectQuality;runtimeSettings.damageNumbers=['all','critical','off'].indexOf(settings.damageNumbers)>=0?settings.damageNumbers:runtimeSettings.damageNumbers;runtimeSettings.playerNames=settings.playerNames==='off'?'off':'on';runtimeSettings.debugMode=['off','performance','network','full'].indexOf(settings.debugMode)>=0?settings.debugMode:runtimeSettings.debugMode;runtimeSettings.autoPause=settings.autoPause==='off'?'off':'on';return Object.assign({},runtimeSettings);}
    function nearestLivingPlayer(x,y){if(networkRole==='local')return player;var best=null,bestD2=Infinity,primary=mainPlayer||player;if(primary&&!primary.downed&&primary.hp>0){var pdx=primary.x-x,pdy=primary.y-y;best=primary;bestD2=pdx*pdx+pdy*pdy;}Object.keys(remotePlayers).forEach(function(id){var member=remotePlayers[id];if(!member||member.downed||member.hp<=0)return;var dx=member.x-x,dy=member.y-y,d2=dx*dx+dy*dy;if(d2<bestD2){best=member;bestD2=d2;}});return best||player;}
    function withActivePlayer(member,fn){var primary=player;player=member;try{return fn();}finally{player=primary;}}

    function gridKey(cx,cy){return(cx+64)*128+(cy+64);}
    function rebuildEnemyGrid(){
        for(var clear=0;clear<enemyGridKeys.length;clear++)enemyGrid[enemyGridKeys[clear]].length=0;
        for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead)continue;var cx=Math.floor(e.x/ENEMY_CELL),cy=Math.floor(e.y/ENEMY_CELL),key=gridKey(cx,cy),cell=enemyGrid[key];if(!cell){cell=[];enemyGrid[key]=cell;enemyGridKeys.push(key);}cell.push(e);}enemyGridReady=true;
    }
    function fillEnemyCandidates(x,y,r,out){
        out.length=0;if(!enemyGridReady){for(var ei=0;ei<enemies.length;ei++)if(!enemies[ei].dead)out.push(enemies[ei]);return out;}
        var minX=Math.floor((x-r)/ENEMY_CELL),maxX=Math.floor((x+r)/ENEMY_CELL),minY=Math.floor((y-r)/ENEMY_CELL),maxY=Math.floor((y+r)/ENEMY_CELL);for(var gx=minX;gx<=maxX;gx++)for(var gy=minY;gy<=maxY;gy++){var cell=enemyGrid[gridKey(gx,gy)];if(cell)for(var ci=0;ci<cell.length;ci++)out.push(cell[ci]);}return out;
    }
    function isWorldVisible(x,y,r){
        r=r||0;var margin=90;return x+r>=camera.x-margin&&x-r<=camera.x+viewportWidth/currentZoom+margin&&y+r>=camera.y-margin&&y-r<=camera.y+viewportHeight/currentZoom+margin;
    }
    function lineIntersectsView(x1,y1,x2,y2){var left=camera.x-90,right=camera.x+viewportWidth/currentZoom+90,top=camera.y-90,bottom=camera.y+viewportHeight/currentZoom+90;if(Math.max(x1,x2)<left||Math.min(x1,x2)>right||Math.max(y1,y2)<top||Math.min(y1,y2)>bottom)return false;return true;}
    function drawWorldList(list,margin){
        for(var i=0;i<list.length;i++){var item=list[i],radius=(item.radius||margin||16)+(margin||0);if(isWorldVisible(item.x,item.y,radius)){item.draw();perfStats.drawnEntities++;}else perfStats.culledDraws++;}
    }
    function drawMarionetteStrings(){
        var groups=Object.create(null);for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead||!e.puppetGroup||e.puppetTimer<=0)continue;(groups[e.puppetGroup]||(groups[e.puppetGroup]=[])).push(e);}ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';Object.keys(groups).forEach(function(key){var linked=groups[key];if(linked.length<2)return;var root=linked[0];for(var j=1;j<linked.length;j++){var mate=linked[j];if(!lineIntersectsView(root.x,root.y,mate.x,mate.y))continue;var mx=(root.x+mate.x)*.5,my=(root.y+mate.y)*.5+Math.sin(visualTick*.1+j)*13;ctx.strokeStyle='rgba(202,167,255,.28)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(root.x,root.y);ctx.quadraticCurveTo(mx,my,mate.x,mate.y);ctx.stroke();ctx.strokeStyle='#eadfff';ctx.lineWidth=1.5;ctx.stroke();}});ctx.restore();
    }
    function safeRecord() {
        try {
            return JSON.parse(localStorage.getItem('dungeonKnightInfiniteRecord')) || { wave: 0, score: 0 };
        } catch (err) { return { wave: 0, score: 0 }; }
    }
    function saveRecord() {
        var record = safeRecord();
        record.wave = Math.max(record.wave || 0, wave);
        record.score = Math.max(record.score || 0, score);
        try { localStorage.setItem('dungeonKnightInfiniteRecord', JSON.stringify(record)); } catch (err) {}
        updateRecordLine();
    }
    function updateRecordLine() {
        var r = safeRecord();
        el('record-line').textContent = 'BEST WAVE ' + (r.wave || 0) + ' · HIGH SCORE ' + (r.score || 0);
    }

    function defaultWeaponId() {
        if (WEAPON_DEFS.rustPistol) return 'rustPistol';
        var ids = Object.keys(WEAPON_DEFS), common = ids.find(function(id){return WEAPON_DEFS[id].rarity==='common';});
        return common || ids[0] || '';
    }
    function weaponCopy(id) {
        var resolved = WEAPON_DEFS[id] ? id : defaultWeaponId();
        if (!resolved) return null;
        return Object.assign({ id: resolved, level: 1, shots: 0 }, WEAPON_DEFS[resolved]);
    }
    function selectClass(id){if(!CLASS_DEFS[id])return false;selectedClassId=id;var cards=document.querySelectorAll?document.querySelectorAll('.class-card'):[];for(var i=0;i<cards.length;i++)cards[i].classList[cards[i].getAttribute('data-class')===id?'add':'remove']('selected');return true;}
    function classStarterPool(classId){var def=CLASS_DEFS[classId]||CLASS_DEFS.independent;return Object.keys(WEAPON_DEFS).filter(function(id){var w=WEAPON_DEFS[id];return w&&w.rarity==='common'&&def.starter.indexOf(w.category)>=0;});}
    function rollClassStarter(classId){var candidates=classStarterPool(classId);var fallback=defaultWeaponId();return pick(candidates.length?candidates:(fallback?[fallback]:[]));}
    function weightedPick(ids,weightFn){if(!ids.length)return null;var total=0,weights=[];for(var i=0;i<ids.length;i++){var weight=Math.max(.01,Number(weightFn(ids[i]))||.01);weights.push(weight);total+=weight;}var roll=Math.random()*total;for(var j=0;j<ids.length;j++){roll-=weights[j];if(roll<=0)return ids[j];}return ids[ids.length-1];}
    function rarityColor(r) { return (RARITIES[r] || RARITIES.common).color; }
    function weaponLevelScale(w) { return 1 + (w.level - 1) * .18; }
    function cameraBaseZoom(){return isTouchDevice()?.62:.75;}
    function refreshZoomReadout(){if(el('zoom-readout'))el('zoom-readout').textContent=Math.round(cameraZoomSetting*100)+'%';}
    function setCameraZoom(value,notify){cameraZoomSetting=clamp(Math.round((Number(value)||1)*100)/100,.7,1.3);try{localStorage.setItem('dungeonKnightCameraZoom',String(cameraZoomSetting));}catch(err){}refreshZoomReadout();if(notify&&gameActive)showToast('CAMERA ZOOM '+Math.round(cameraZoomSetting*100)+'%','#fff');return cameraZoomSetting;}
    function changeCameraZoom(delta){return setCameraZoom(cameraZoomSetting+delta,true);}

    function clearHitLedger(ledger){if(!ledger)return Object.create(null);for(var key in ledger)if(Object.prototype.hasOwnProperty.call(ledger,key))delete ledger[key];return ledger;}
    function recycleBullet(b){if(!b||b._pooled)return;b._pooled=true;clearHitLedger(b.hitIds);if(bulletPool.length<1400)bulletPool.push(b);}
    function recycleParticle(p){if(!p||p._pooled)return;p._pooled=true;if(particlePool.length<720)particlePool.push(p);}
    function recycleSlash(s){if(!s||s._pooled)return;s._pooled=true;clearHitLedger(s.hitIds);if(slashPool.length<220)slashPool.push(s);}
    function recycleTransient(arr,item){if(arr===bullets)recycleBullet(item);else if(arr===particles)recycleParticle(item);else if(arr===slashes)recycleSlash(item);}
    function releaseAllTransient(){for(var b=0;b<bullets.length;b++)recycleBullet(bullets[b]);for(var p=0;p<particles.length;p++)recycleParticle(particles[p]);for(var s=0;s<slashes.length;s++)recycleSlash(slashes[s]);bullets.length=0;particles.length=0;slashes.length=0;}

    function Particle(x, y, color, speed, size) {
        var a = rand(0, TAU);
        this.x = x; this.y = y; this.color = color;
        this.vx = Math.cos(a) * rand(.4, speed || 3.2);
        this.vy = Math.sin(a) * rand(.4, speed || 3.2);
        this.life = 1; this.size = size || rand(2, 4);this._pooled=false;
    }
    function spawnParticle(x,y,color,speed,size){var p=particlePool.pop();if(p)poolStats.particleReused++;else{p=Object.create(Particle.prototype);poolStats.particleCreated++;}Particle.call(p,x,y,color,speed,size);return p;}
    Particle.prototype.update = function (step) { this.x += this.vx * step; this.y += this.vy * step; var drag=frameDecay(.96,step);this.vx *= drag; this.vy *= drag; this.life -= .045 * step; };
    Particle.prototype.draw = function () { ctx.globalAlpha = Math.max(0, this.life); ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; };

    function addParticles(x, y, color, count, speed) {
        if(gameActive&&!isWorldVisible(x,y,260))return;
        var quality=effectQualityProfile();count=Math.max(0,Math.ceil((Number(count)||0)*effectQualityScale()));
        for (var i = 0; i < count; i++) particles.push(spawnParticle(x, y, color, speed));
        capArray(particles,quality.maxParticles);
    }
    function pushEffect(effect,priority){
        var cap=effectQualityProfile().maxEffects;if(!effect)return null;
        if(effects.length>=cap&&priority!=='combat')return null;
        effects.push(effect);capArray(effects,cap);return effect;
    }
    function addFloat(text, x, y, color) { if(!gameActive||isWorldVisible(x,y,180))pushEffect({ type: 'text', text: sceneMode==='editorTest'?String(text):tr(text), x: x, y: y, color: color || '#fff', life: 1, vx:0 }); }
    function addDamageFloat(text,target,color){
        if(!target||gameActive&&!isWorldVisible(target.x,target.y,180))return;
        if(runtimeSettings.damageNumbers==='off'||runtimeSettings.damageNumbers==='critical'&&color!=='#f1c40f')return;
        if(visualTick-(Number(target.damageTextAt)||-999)>11)target.damageTextLane=0;
        var order=[0,-1,1,-2,2,-3,3],lane=order[(target.damageTextLane||0)%order.length];
        target.damageTextLane=(target.damageTextLane||0)+1;target.damageTextAt=visualTick;
        pushEffect({type:'text',text:String(text),x:target.x+lane*15,y:target.y-target.radius-8-Math.abs(lane%2)*6,color:color||'#fff',life:1,vx:lane*.065,damageNumber:true});
    }
    function addRing(x, y, color, maxRadius, width) { if(!gameActive||isWorldVisible(x,y,maxRadius||90))pushEffect({ type: 'ring', x: x, y: y, color: color, radius: 4, maxRadius: maxRadius, width: width || 4, life: 1 }); }
    function addBeam(x1, y1, x2, y2, color, width) { if(!gameActive||isWorldVisible(x1,y1,120)||isWorldVisible(x2,y2,120)||lineIntersectsView(x1,y1,x2,y2))pushEffect({ type: 'beam', x: x1, y: y1, x2: x2, y2: y2, color: color, width: width || 5, life: 1 }); }
    function addLightning(points, color) { pushEffect({ type: 'lightning', points: points, color: color || '#74b9ff', life: 1 }); }
    function addDarkBloom(x, y, radius) { if(!gameActive||isWorldVisible(x,y,radius||90))pushEffect({ type: 'darkBloom', x: x, y: y, color: '#9b4dff', radius: radius, spin: rand(0, TAU), life: 1 }); }
    function addDataEffect(x,y,definition,angle){
        var data=definition&&typeof definition==='object'?definition:{modelId:String(definition||'ring')},modelId=EFFECT_MODELS[data.modelId]?data.modelId:'ring',durationFrames=clamp(Number(data.durationFrames)||Number(data.duration)*60||18,3,300),size=clamp(Number(data.size)||80,4,900),count=Math.round(clamp(Number(data.count)||8,2,24));
        if(gameActive&&!isWorldVisible(x,y,size))return null;var effect={type:'dataEffect',modelId:modelId,x:x,y:y,angle:Number(angle)||0,color:data.color||'#fff',accent:data.accent||'#fff',size:size,count:count,width:clamp(Number(data.width)||3,1,30),spin:rand(0,TAU),durationFrames:durationFrames,life:1};pushEffect(effect);return effect;
    }
    function addWeaponFlash(w, x, y, angle) {
        var type = w.category === 'MAGIC' ? 'rune' : w.category === 'ARCHER' ? 'bowFlash' : w.category === 'MELEE' ? 'slashFlash' : 'muzzle';
        pushEffect({ type: type, x: x, y: y, angle: angle, color: w.color, life: 1, spin: rand(0, TAU), rarity: w.rarity });
        if (w.rarity === 'legendary') pushEffect({ type: 'legendarySigil', x: x, y: y, angle: angle, color: w.color, life: 1, spin: rand(0, TAU), sourceId: w.id });
        if (w.rarity === 'mythical') pushEffect({ type: 'mythicSigil', x: x, y: y, angle: angle, color: w.color, life: 1, spin: rand(0, TAU), sourceId: w.id });
        var amount = w.rarity === 'mythical' ? 8 : w.rarity === 'legendary' ? 7 : w.rarity === 'epic' ? 6 : 3;
        addParticles(x, y, w.color, amount, w.category === 'MAGIC' ? 3.5 : 2.6);
    }
    function addImpactFlash(b, x, y) {
        var impactRenderer=PROJECTILE_IMPACT_RENDERERS[b.sourceId],projectileRenderer=PROJECTILE_RENDERERS[b.sourceId],weaponDef=WEAPON_DEFS[b.sourceId],profile=null;
        if(typeof impactRenderer==='function'){
            effects.push({ type: 'impact', x: x, y: y, angle: Math.atan2(b.vy, b.vx), color: b.color, life: 1, sourceId: b.sourceId });
            impactRenderer({projectile:b,x:x,y:y,api:WEAPON_API,TAU:TAU});
            return;
        }
        if(b.friendly&&(typeof projectileRenderer!=='function'||weaponDef&&weaponDef.editorAutoProjectileIdentity)&&VISUALS&&typeof VISUALS.weaponProjectileProfile==='function')profile=VISUALS.weaponProjectileProfile(b.sourceId,b);
        if(profile&&profile.impactModelId){
            addDataEffect(x,y,{modelId:profile.impactModelId,color:b.color,accent:profile.accent||'#fff',size:Math.max(24,(b.radius||4)*(profile.impactScale||9)),count:profile.impactCount||6,durationFrames:profile.impactDuration||11,width:profile.impactWidth||2},Math.atan2(b.vy,b.vx));
        }else effects.push({ type: 'impact', x: x, y: y, angle: Math.atan2(b.vy, b.vx), color: b.color, life: 1, sourceId: b.sourceId });
    }
    function showToast(text, color) {
        var node = el('toast'); node.textContent = sceneMode==='editorTest'?String(text):tr(text); node.style.color = color || '#f1c40f'; node.classList.add('show'); toastTimer = 115;
    }

    function updateEffects(step) {
        for (var i = effects.length - 1; i >= 0; i--) {
            var e = effects[i];
            e.life -= (e.type === 'dataEffect' ? 1/Math.max(3,e.durationFrames||18) : e.type === 'text' ? .018 : .07) * step;
            if (e.type === 'text') { e.y -= .45 * step;e.x+=(Number(e.vx)||0)*step; }
            if (e.type === 'ring') e.radius += (e.maxRadius - e.radius) * frameBlend(.18,step);
            if (e.life <= 0) e.life=0;
        }
    }
    function effectVisible(e){if(e.type==='beam')return isWorldVisible(e.x,e.y,100)||isWorldVisible(e.x2,e.y2,100)||lineIntersectsView(e.x,e.y,e.x2,e.y2);if(e.type==='lightning'){for(var lp=0;lp<e.points.length;lp++)if(isWorldVisible(e.points[lp].x,e.points[lp].y,90))return true;return false;}return isWorldVisible(e.x,e.y,e.maxRadius||e.radius||90);}
    function drawEffects() {
        ctx.save();
        ctx.font = '10px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif'; ctx.textAlign = 'center';
        effects.forEach(function (e) {
            if(!effectVisible(e)){perfStats.culledDraws++;return;}
            ctx.globalAlpha = Math.max(0, e.life);
            if (e.type === 'text') { ctx.font=e.damageNumber?'700 13px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif':'10px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.fillStyle = e.color; ctx.fillText(e.text, e.x, e.y); }
            else if(e.type==='dataEffect'&&VISUALS){VISUALS.effect(ctx,e.modelId,e);}
            else if (e.type === 'ring') { ctx.strokeStyle = e.color; ctx.lineWidth = e.width; ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, TAU); ctx.stroke(); }
            else if (e.type === 'beam') { ctx.strokeStyle = e.color; ctx.lineWidth = e.width * Math.max(.2, e.life); ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x2, e.y2); ctx.stroke(); }
            else if (e.type === 'muzzle') {
                ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.angle); ctx.fillStyle = e.color;
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22 * e.life, -8 * e.life); ctx.lineTo(15 * e.life, 0); ctx.lineTo(22 * e.life, 8 * e.life); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(12*e.life,-3); ctx.lineTo(12*e.life,3); ctx.closePath(); ctx.fill(); ctx.restore();
            }
            else if (e.type === 'rune') {
                ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.spin + (1-e.life)*1.8); ctx.strokeStyle=e.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,18*e.life,0,TAU);ctx.stroke();
                for(var r=0;r<4;r++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(7*e.life,0);ctx.lineTo(16*e.life,0);ctx.stroke();}ctx.restore();
            }
            else if (e.type === 'bowFlash') {
                ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.strokeStyle=e.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12*e.life,-12*e.life);ctx.quadraticCurveTo(12*e.life,0,-12*e.life,12*e.life);ctx.stroke();ctx.restore();
            }
            else if (e.type === 'slashFlash') {
                ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.strokeStyle=e.color;ctx.lineCap='round';ctx.lineWidth=7*e.life;ctx.beginPath();ctx.arc(0,0,34+(1-e.life)*20,-.95,.95);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,39+(1-e.life)*20,-.88,.88);ctx.stroke();ctx.restore();
            }
            else if (e.type === 'impact') {
                ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.strokeStyle=e.color;ctx.lineWidth=2.5;for(var k=0;k<6;k++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo((8+k%2*5)*e.life,0);ctx.stroke();}ctx.restore();
            }
            else if (e.type === 'darkBloom') {
                ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.spin+(1-e.life)*.7);ctx.fillStyle='rgba(5,2,10,.82)';ctx.strokeStyle=e.color;ctx.lineWidth=5*e.life;
                for(var db=0;db<8;db++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(e.radius*.35*e.life,-e.radius*.22*e.life,e.radius*e.life,0);ctx.quadraticCurveTo(e.radius*.34*e.life,e.radius*.22*e.life,0,0);ctx.fill();ctx.stroke();}
                ctx.strokeStyle='#e7c6ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.radius*.58*e.life,0,TAU);ctx.stroke();ctx.restore();
            }
            else if (e.type === 'mythicSigil') {
                ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.spin+(1-e.life)*2.2);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=e.color;ctx.lineWidth=2.5*e.life;
                for(var ms=0;ms<3;ms++){ctx.rotate(TAU/3);ctx.beginPath();ctx.arc(0,0,(18+ms*9)*(1.15-e.life*.15),-.7,.7);ctx.stroke();ctx.beginPath();ctx.moveTo(9+ms*6,0);ctx.lineTo(17+ms*9,0);ctx.stroke();}
                ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.beginPath();for(var mp=0;mp<8;mp++){var ma=mp*TAU/8,mr=25+(mp%2)*9;if(mp===0)ctx.moveTo(Math.cos(ma)*mr,Math.sin(ma)*mr);else ctx.lineTo(Math.cos(ma)*mr,Math.sin(ma)*mr);}ctx.closePath();ctx.stroke();ctx.restore();
            }
            else if (e.type === 'legendarySigil') {
                ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.spin-(1-e.life)*1.7);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=e.color;ctx.fillStyle='#fff8c7';ctx.lineWidth=2.5*e.life;ctx.beginPath();ctx.arc(0,0,28+(1-e.life)*18,0,TAU);ctx.stroke();for(var ls=0;ls<12;ls++){ctx.rotate(TAU/12);ctx.beginPath();ctx.moveTo(19,0);ctx.lineTo((35+(ls%2)*9)*e.life+12,-3);ctx.lineTo((31+(ls%2)*9)*e.life+12,3);ctx.closePath();ctx.fill();}ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,12+e.life*8,0,TAU);ctx.stroke();ctx.restore();
            }
            else if (e.type === 'organWave') {
                ctx.save();ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.globalCompositeOperation='lighter';
                for(var ow=0;ow<3;ow++){var or=(75+ow*55)*(1-e.life*.28);ctx.strokeStyle=ow===1?'#ffe6ff':e.color;ctx.lineWidth=(9-ow*2)*e.life;ctx.beginPath();ctx.arc(0,0,or,-.86,.86);ctx.stroke();for(var og=0;og<5;og++){var oa=-.7+og*.35;ctx.beginPath();ctx.moveTo(Math.cos(oa)*(or-10),Math.sin(oa)*(or-10));ctx.lineTo(Math.cos(oa)*(or+10),Math.sin(oa)*(or+10));ctx.stroke();}}
                ctx.restore();
            }
            else if (e.type === 'lightning') {
                ctx.strokeStyle = e.color; ctx.lineWidth = 3; ctx.beginPath();
                for (var j = 0; j < e.points.length; j++) {
                    var p = e.points[j];
                    if (j === 0) ctx.moveTo(p.x, p.y); else {
                        var prev = e.points[j - 1];
                        ctx.lineTo((prev.x + p.x) / 2 + rand(-7, 7), (prev.y + p.y) / 2 + rand(-7, 7));
                        ctx.lineTo(p.x, p.y);
                    }
                }
                ctx.stroke();
            }
        });
        ctx.restore();
    }

    function obstacleContact(x,y,r,o){
        if(o.shape==='rect'){
            var left=o.x-o.w*.5,right=o.x+o.w*.5,top=o.y-o.h*.5,bottom=o.y+o.h*.5,qx=clamp(x,left,right),qy=clamp(y,top,bottom),dx=x-qx,dy=y-qy,d=Math.hypot(dx,dy);
            if(d>0&&d<r)return{nx:dx/d,ny:dy/d,overlap:r-d};
            if(x>=left&&x<=right&&y>=top&&y<=bottom){var edges=[{d:x-left,nx:-1,ny:0},{d:right-x,nx:1,ny:0},{d:y-top,nx:0,ny:-1},{d:bottom-y,nx:0,ny:1}];edges.sort(function(a,b){return a.d-b.d;});return{nx:edges[0].nx,ny:edges[0].ny,overlap:r+edges[0].d};}
            return null;
        }
        var ox=x-o.x,oy=y-o.y,od=Math.hypot(ox,oy)||.001,minD=r+o.radius;if(od<minD)return{nx:ox/od,ny:oy/od,overlap:minD-od};return null;
    }
    function enemyPathClear(x,y,angle,distance,radius){
        var samples=distance>44?3:2;
        for(var sample=1;sample<=samples;sample++){
            var travel=distance*sample/samples,px=x+Math.cos(angle)*travel,py=y+Math.sin(angle)*travel;
            if(Math.abs(px)>ARENA_LIMIT-radius||Math.abs(py)>ARENA_LIMIT-radius)return false;
            for(var oi=0;oi<obstacles.length;oi++)if(obstacleContact(px,py,radius+3,obstacles[oi]))return false;
        }
        return true;
    }
    function Entity(x, y, radius, color) {
        this.id = nextEntityId++;
        this.x = x; this.y = y; this.radius = radius; this.color = color;
        this.dead = false; this.flash = 0; this.maxHp = 10; this.hp = 10;
    }
    Entity.prototype.resolveObstacles = function () {
        for (var i = 0; i < obstacles.length; i++) {
            var hit=obstacleContact(this.x,this.y,this.radius,obstacles[i]);if(hit){this.x+=hit.nx*(hit.overlap+.01);this.y+=hit.ny*(hit.overlap+.01);}
        }
    };
    Entity.prototype.drawBody = function () {
        ctx.save(); ctx.translate(this.x, this.y);
        ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.beginPath(); ctx.ellipse(0, this.radius, this.radius, this.radius * .4, 0, 0, TAU); ctx.fill();
        if (this.elite) { ctx.shadowBlur = 15; ctx.shadowColor = '#f1c40f'; }
        ctx.fillStyle = this.flash > 0 ? '#fff' : this.color; ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, TAU); ctx.fill();
        ctx.strokeStyle = this.elite ? '#f1c40f' : '#000'; ctx.lineWidth = this.elite ? 3 : 2; ctx.stroke();
        ctx.restore();
    };

    function Pickup(x, y, kind, value, targetId, resourceId) {
        this.x = x; this.y = y; this.kind = kind; this.value = value || 1;
        this.netId=netPickupId++;this.targetId=targetId||((mainPlayer||player)&&((mainPlayer||player).netId))||'local';this.resourceId=RESOURCE_DEFS[resourceId]?resourceId:'';
        this.prevX = x; this.prevY = y; this.radius = kind === 'coin' ? 6 : kind==='resource'?8:7; this.dead = false; this.magnet = kind === 'mana'||kind==='resource'||kind==='coin'; this.vacuum = kind === 'mana'||kind==='resource'; this.spark = kind === 'coin' ? 0 : rand(0, TAU);
        this.vx = kind === 'mana' ? 0 : kind==='resource' ? rand(-1.4,1.4) : rand(-3.5, 3.5); this.vy = kind === 'mana' ? 0 : kind==='resource' ? rand(-1.4,1.4) : rand(-3.5, 3.5);
        this.age = 0;
    }
    function pickupRecipient(item){if(item&&item.targetId)return playerByNetId(item.targetId);return mainPlayer||player;}
    function grantPickup(item,target){if(!item||!target)return false;if(item.kind==='coin'){addWallet(target,item.value);playSound('loot.coin',{x:item.x,y:item.y});}else if(item.kind==='mana'){target.mana=Math.min(target.maxMana,target.mana+item.value);if(target.cores.neon){target.overclock=Math.max(target.overclock,72);addRing(target.x,target.y,'#48ffd0',62,3);}playSound('loot.mana',{x:item.x,y:item.y});}else if(item.kind==='resource'&&RESOURCE_DEFS[item.resourceId]){addResource(target,item.resourceId,item.value);if(target===player)addFloat('+'+item.value+' '+RESOURCE_DEFS[item.resourceId].short,target.x,target.y-38,RESOURCE_DEFS[item.resourceId].color);playSound('loot.resource',{x:item.x,y:item.y});}else{target.hp=Math.min(target.maxHp,target.hp+item.value);playSound('loot.heal',{x:item.x,y:item.y});}return true;}
    Pickup.prototype.update = function (step) {
        this.age = (this.age || 0) + step;
        this.prevX = this.x; this.prevY = this.y; if(this.kind!=='coin')this.spark += .16 * step;
        var drag=frameDecay(.89,step);this.vx *= drag; this.vy *= drag; this.x += this.vx * step; this.y += this.vy * step;
        var target=pickupRecipient(this);if(!target)return;var d = dist(this, target);
        if (d < target.stats.pickup) this.magnet = true;
        if (this.magnet) {
            var a = Math.atan2(target.y - this.y, target.x - this.x);
            var flySpeed;
            if (this.kind === 'coin') {
                if (this.vacuum) {
                    flySpeed = clamp(24 + d * .04, 24, 52);
                } else if (this.age < 10) {
                    flySpeed = 0;
                } else {
                    var suckProgress = Math.min(1, (this.age - 10) / 18);
                    flySpeed = clamp((4 + suckProgress * 8) + d * .02, 4.5, 14);
                }
            } else {
                flySpeed = this.kind==='mana'||this.kind==='resource' ? clamp(42+d*.06,42,78) : this.vacuum ? clamp(22 + d * .035, 22, 52) : 12;
            }
            if (flySpeed > 0) {
                this.x += Math.cos(a) * flySpeed * step; this.y += Math.sin(a) * flySpeed * step;
            }
        }
        d = dist(this, target);
        if (d < this.radius + target.radius + 3) {
            grantPickup(this,target);
            addParticles(this.x, this.y, this.kind === 'mana' ? '#3498db' : this.kind === 'coin' ? '#f1c40f' : this.kind==='resource'&&RESOURCE_DEFS[this.resourceId]?RESOURCE_DEFS[this.resourceId].color:'#2ecc71', 4, 2);
            this.dead = true;
        }
    };
    Pickup.prototype.draw = function () {
        var resourceDef=this.kind==='resource'&&RESOURCE_DEFS[this.resourceId],c = this.kind === 'coin' ? '#f1c40f' : this.kind === 'mana' ? '#3498db' : resourceDef?resourceDef.color:'#2ecc71';
        var target=pickupRecipient(this);
        if ((this.vacuum || (this.kind==='coin' && this.magnet && this.age >= 9)) && target) {
            ctx.save(); ctx.globalAlpha = this.kind==='coin' ? .65 : .38; ctx.strokeStyle = c; ctx.lineWidth = this.kind==='coin' ? 2.5 : 3; ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            if (this.kind === 'coin') {
                ctx.lineTo(this.prevX, this.prevY);
                ctx.stroke();
                ctx.beginPath();
                ctx.globalAlpha = .3;
                ctx.lineWidth = 2;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - (target.x - this.x) * .075, this.y - (target.y - this.y) * .075);
            } else {
                ctx.lineTo(this.x - (target.x - this.x) * .055, this.y - (target.y - this.y) * .055);
            }
            ctx.stroke(); ctx.restore();
        }
        ctx.save(); ctx.translate(this.x, this.y); ctx.shadowBlur = this.kind==='coin' ? 0 : this.vacuum ? 16 : 7;
        ctx.shadowColor = c; ctx.fillStyle = c;if(resourceDef){ctx.rotate(this.spark);ctx.beginPath();ctx.moveTo(0,-this.radius-2);ctx.lineTo(this.radius,0);ctx.lineTo(0,this.radius+2);ctx.lineTo(-this.radius,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.globalAlpha=.65;ctx.lineWidth=1.5;ctx.stroke();ctx.globalAlpha=1;}else{ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, TAU); ctx.fill();}
        if(this.kind==='coin'){ctx.shadowBlur=0;ctx.strokeStyle='#7c6200';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#8b6e00';ctx.beginPath();ctx.arc(0,0,2,0,TAU);ctx.fill();}
        else if(!resourceDef){ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-2, -2, this.radius * .35, 0, TAU); ctx.fill();}
        ctx.restore();
    };

    function RoomStructure(x,y,w,h,kind){this.x=x;this.y=y;this.w=w;this.h=h;this.kind=kind||'wall';this.shape='rect';this.radius=Math.hypot(w,h)*.5;this.variant=Math.floor(rand(0,3));}
    RoomStructure.prototype.draw=function(){
        if(this.kind==='palaceStatue')return;
        var art=BIOME_ART[currentBiome.hazard],left=-this.w*.5,top=-this.h*.5;ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle='rgba(0,0,0,.38)';ctx.fillRect(left+8,top+12,this.w,this.h);ctx.fillStyle=art.wall;ctx.strokeStyle=art.seam;ctx.lineWidth=4;ctx.fillRect(left,top,this.w,this.h);ctx.strokeRect(left,top,this.w,this.h);
        var block=42;ctx.globalAlpha=.72;ctx.lineWidth=2;for(var bx=left+block;bx<left+this.w;bx+=block){ctx.beginPath();ctx.moveTo(bx,top);ctx.lineTo(bx,top+this.h);ctx.stroke();}ctx.beginPath();ctx.moveTo(left,0);ctx.lineTo(left+this.w,0);ctx.stroke();ctx.globalAlpha=1;
        ctx.fillStyle=art.wallTop;ctx.fillRect(left-4,top-7,this.w+8,12);ctx.strokeStyle=art.trim;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(left,top+4);ctx.lineTo(left+this.w,top+4);ctx.stroke();
        if(currentBiome.hazard==='frost'){ctx.fillStyle='#e5f8ff';for(var ic=left+12;ic<left+this.w;ic+=38){ctx.beginPath();ctx.moveTo(ic,top+5);ctx.lineTo(ic+8,top+5);ctx.lineTo(ic+4,top+15+(Math.abs(ic)%11));ctx.closePath();ctx.fill();}ctx.strokeStyle='#8edbff';ctx.beginPath();ctx.moveTo(left+12,top+this.h*.68);ctx.lineTo(left+this.w*.35,top+this.h*.42);ctx.lineTo(left+this.w*.58,top+this.h*.72);ctx.lineTo(left+this.w-12,top+this.h*.35);ctx.stroke();}
        else if(currentBiome.hazard==='sand'){ctx.fillStyle='#5b503e';for(var ss=left+9;ss<left+this.w-8;ss+=44){ctx.beginPath();ctx.moveTo(ss,top+this.h-7);ctx.lineTo(ss+10,top+this.h*.42);ctx.lineTo(ss+21,top+this.h-7);ctx.closePath();ctx.fill();}ctx.fillStyle='#b79d68';ctx.globalAlpha=.52;ctx.beginPath();ctx.moveTo(left,top+this.h*.72);ctx.quadraticCurveTo(0,top+this.h*.42,left+this.w,top+this.h*.67);ctx.lineTo(left+this.w,top+this.h);ctx.lineTo(left,top+this.h);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#d8bf82';ctx.beginPath();ctx.arc(0,top+this.h*.54,Math.min(this.w*.18,24),Math.PI,TAU);ctx.stroke();}
        else if(currentBiome.hazard==='blood'){ctx.strokeStyle='#f2a6b7';ctx.lineWidth=4;for(var ga=-1;ga<=1;ga+=2){var gx=ga*this.w*.23;ctx.beginPath();ctx.moveTo(gx-18,top+this.h-7);ctx.lineTo(gx-18,top+this.h*.48);ctx.quadraticCurveTo(gx,top+this.h*.16,gx+18,top+this.h*.48);ctx.lineTo(gx+18,top+this.h-7);ctx.stroke();}ctx.fillStyle='#35131e';for(var ro=-1;ro<=1;ro+=2){ctx.beginPath();ctx.arc(ro*this.w*.23,top+this.h*.49,7,0,TAU);ctx.fill();ctx.stroke();}}
        else if(currentBiome.hazard==='thorn'){ctx.strokeStyle='#6f4a31';ctx.lineWidth=6;for(var rt=0;rt<3;rt++){ctx.beginPath();ctx.moveTo(left,top+10+rt*this.h*.31);ctx.bezierCurveTo(-this.w*.2,top+this.h*.8,this.w*.18,top+this.h*.2,left+this.w,top+this.h*.78-rt*4);ctx.stroke();}ctx.fillStyle='#75a963';for(var lf=0;lf<5;lf++){ctx.beginPath();ctx.ellipse(left+18+lf*(this.w-36)/4,top+this.h*.35+(lf%2)*13,8,4,lf%2?-.5:.5,0,TAU);ctx.fill();}}
        else if(currentBiome.hazard==='glyph'){ctx.fillStyle='#362818';for(var sh=0;sh<2;sh++)ctx.fillRect(left+8,top+14+sh*this.h*.42,this.w-16,5);for(var bk=0;bk<Math.max(2,Math.floor(this.w/28));bk++){ctx.fillStyle=bk%3===0?'#824334':bk%3===1?'#43685f':'#9b7d35';ctx.fillRect(left+12+bk*25,top+18,14,Math.min(24,this.h*.32));}}
        else if(currentBiome.hazard==='tide'){ctx.fillStyle='rgba(70,170,185,.28)';ctx.fillRect(left+3,top+this.h*.54,this.w-6,this.h*.43);ctx.strokeStyle='#8bd7d7';for(var wa=0;wa<3;wa++){ctx.beginPath();ctx.moveTo(left+8,top+this.h*.62+wa*9);ctx.quadraticCurveTo(0,top+this.h*.53+wa*9,left+this.w-8,top+this.h*.62+wa*9);ctx.stroke();}}
        else if(currentBiome.hazard==='gear'){ctx.strokeStyle=art.trim;for(var cg=-1;cg<=1;cg+=2){ctx.beginPath();ctx.arc(cg*this.w*.23,2,Math.min(18,this.h*.24),0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(cg*this.w*.23,2,5,0,TAU);ctx.stroke();}}
        else if(currentBiome.hazard==='moon'){ctx.fillStyle='#d8d7cc';for(var bn=0;bn<Math.max(2,Math.floor(this.w/45));bn++){var boneX=left+20+bn*43;ctx.fillRect(boneX,top+this.h*.58,30,4);ctx.beginPath();ctx.arc(boneX,top+this.h*.6,4,0,TAU);ctx.arc(boneX+30,top+this.h*.6,4,0,TAU);ctx.fill();}}
        else if(currentBiome.hazard==='spore'){ctx.fillStyle='#a8cc72';for(var mu=0;mu<Math.max(2,Math.floor(this.w/52));mu++){var mx=left+24+mu*50;ctx.fillRect(mx-2,top-16,5,16);ctx.beginPath();ctx.ellipse(mx,top-15,12,7,0,Math.PI,TAU);ctx.fill();}}
        else if(currentBiome.hazard==='cloud'){ctx.fillStyle='#eefaff';for(var cb=left+18;cb<left+this.w;cb+=52){ctx.beginPath();ctx.arc(cb,top+4,18,Math.PI,TAU);ctx.fill();}ctx.strokeStyle='#fff';ctx.lineWidth=3;for(var penn=-1;penn<=1;penn+=2){var px=penn*this.w*.24;ctx.beginPath();ctx.moveTo(px,top+10);ctx.lineTo(px,top+this.h*.78);ctx.moveTo(px,top+16);ctx.quadraticCurveTo(px+penn*22,top+25,px,top+37);ctx.stroke();}}
        else if(currentBiome.hazard==='neon'){ctx.fillStyle='#173f3b';for(var nm=left+15;nm<left+this.w;nm+=34){ctx.beginPath();ctx.arc(nm,top+this.h*.56,11,0,TAU);ctx.fill();ctx.strokeStyle='#62f5d4';ctx.beginPath();ctx.moveTo(nm,top+this.h*.56);ctx.lineTo(nm+(nm%2?8:-8),top+12);ctx.stroke();}ctx.strokeStyle='#48ffd0';ctx.globalAlpha=.65;ctx.beginPath();ctx.moveTo(left+8,top+this.h*.78);ctx.bezierCurveTo(-this.w*.2,top+this.h*.55,this.w*.2,top+this.h*.9,left+this.w-8,top+this.h*.66);ctx.stroke();ctx.globalAlpha=1;}
        else if(currentBiome.hazard==='magma'){ctx.fillStyle='#3c1d17';for(var fp=left+8;fp<left+this.w;fp+=46){ctx.fillRect(fp,top+8,36,this.h-16);ctx.strokeRect(fp,top+8,36,this.h-16);ctx.fillStyle='#ffb36f';ctx.beginPath();ctx.arc(fp+8,top+16,3,0,TAU);ctx.arc(fp+28,top+this.h-16,3,0,TAU);ctx.fill();ctx.fillStyle='#3c1d17';}ctx.strokeStyle='#ff7138';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(left+8,top+this.h*.54);ctx.lineTo(left+this.w-8,top+this.h*.54);ctx.stroke();}
        else if(currentBiome.hazard==='ember'){ctx.strokeStyle=art.trim;ctx.lineWidth=3;for(var cr=0;cr<3;cr++){var cx=left+18+cr*(this.w-36)/2;ctx.beginPath();ctx.moveTo(cx,top+12);ctx.lineTo(cx+10,top+this.h*.45);ctx.lineTo(cx-2,top+this.h-10);ctx.stroke();}}
        else if(currentBiome.hazard==='mirror'){ctx.strokeStyle='#d9faff';ctx.beginPath();ctx.moveTo(left+10,top+this.h-8);ctx.lineTo(left+this.w*.32,top+8);ctx.lineTo(left+this.w*.53,top+this.h-8);ctx.lineTo(left+this.w-10,top+8);ctx.stroke();}
        else if(currentBiome.hazard==='storm'){ctx.strokeStyle='#bf92ff';ctx.beginPath();ctx.moveTo(left+10,top+this.h*.25);ctx.lineTo(left+this.w*.35,top+this.h*.58);ctx.lineTo(left+this.w*.53,top+this.h*.32);ctx.lineTo(left+this.w-10,top+this.h*.7);ctx.stroke();}
        else if(currentBiome.hazard==='void'){ctx.strokeStyle='#ff4da6';ctx.beginPath();ctx.ellipse(0,2,this.w*.25,Math.min(13,this.h*.22),-.18,0,TAU);ctx.stroke();}
        ctx.restore();
    };

    function RoomDecoration(x,y,kind,variant){this.x=x;this.y=y;this.kind=kind||'cluster';this.variant=variant||0;this.radius=54;}
    RoomDecoration.prototype.draw=function(){
        var art=BIOME_ART[currentBiome.hazard],k=currentBiome.hazard,v=this.variant;ctx.save();ctx.translate(this.x,this.y);ctx.globalAlpha=.88;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,17,40,12,0,0,TAU);ctx.fill();
        if(this.kind==='supply'){
            ctx.fillStyle=k==='frost'?'#76502e':art.wallTop;ctx.strokeStyle=art.seam;ctx.lineWidth=3;for(var box=0;box<3;box++){var bx=(box-1)*23+(box===1?3:0),by=box===1?-18:4;ctx.fillRect(bx-13,by-11,26,22);ctx.strokeRect(bx-13,by-11,26,22);ctx.strokeStyle=k==='frost'?'#e6f8ff':art.trim;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx-9,by-7);ctx.lineTo(bx+9,by+7);ctx.stroke();ctx.strokeStyle=art.seam;ctx.lineWidth=3;if(k==='frost'){ctx.fillStyle='#dff7ff';ctx.fillRect(bx-13,by-12,26,5);ctx.fillStyle='#76502e';}}
        }else if(k==='frost'){
            ctx.fillStyle='#4f8ba5';ctx.strokeStyle=art.trim;ctx.lineWidth=2;for(var ice=0;ice<5;ice++){var ia=-1.2+ice*.6,ih=20+(ice%3)*13;ctx.beginPath();ctx.moveTo(Math.cos(ia)*18,14);ctx.lineTo(Math.cos(ia)*15-7,-ih);ctx.lineTo(Math.cos(ia)*15+8,-ih+8);ctx.lineTo(Math.cos(ia)*25+10,14);ctx.closePath();ctx.fill();ctx.stroke();}
        }else if(k==='sand'){
            ctx.fillStyle='#7b6340';ctx.strokeStyle='#c5ab73';ctx.lineWidth=3;for(var ur=-1;ur<=1;ur++){var ux=ur*24,uh=ur===0?39:28;ctx.beginPath();ctx.moveTo(ux-8,14);ctx.lineTo(ux-12,4);ctx.lineTo(ux-8,-uh+9);ctx.lineTo(ux+8,-uh+9);ctx.lineTo(ux+12,4);ctx.lineTo(ux+8,14);ctx.closePath();ctx.fill();ctx.stroke();}ctx.strokeStyle='#f0d79c';ctx.beginPath();ctx.arc(0,-18,6,0,TAU);ctx.stroke();
        }else if(k==='storm'){
            ctx.fillStyle='#3c3158';ctx.strokeStyle='#d1adff';ctx.lineWidth=3;for(var coil=-1;coil<=1;coil+=2){ctx.fillRect(coil*22-6,-19,12,37);ctx.strokeRect(coil*22-6,-19,12,37);ctx.beginPath();ctx.arc(coil*22,-25,9,0,TAU);ctx.stroke();}ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(-13,-26);ctx.lineTo(-3,-15);ctx.lineTo(6,-28);ctx.lineTo(15,-18);ctx.stroke();
        }else if(k==='void'){
            ctx.fillStyle='#16091c';ctx.strokeStyle='#ff74bd';ctx.lineWidth=3;for(var vs=0;vs<4;vs++){ctx.save();ctx.translate((vs-1.5)*17,vs%2?2:-8);ctx.rotate((vs-1.5)*.18);ctx.beginPath();ctx.moveTo(0,-30+vs*2);ctx.lineTo(8,10);ctx.lineTo(0,18);ctx.lineTo(-8,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-5,3,0,TAU);ctx.fill();
        }else if(k==='blood'){
            ctx.strokeStyle='#d68296';ctx.lineWidth=4;for(var can=-1;can<=1;can++){ctx.beginPath();ctx.moveTo(can*22,14);ctx.lineTo(can*22,-18-(can===0?12:0));ctx.stroke();ctx.fillStyle='#ffe0d5';ctx.beginPath();ctx.moveTo(can*22-4,-18-(can===0?12:0));ctx.quadraticCurveTo(can*22,-31-(can===0?12:0),can*22+4,-18-(can===0?12:0));ctx.fill();}ctx.fillStyle='#6e1d35';for(var pet=0;pet<6;pet++){ctx.save();ctx.rotate(pet*TAU/6);ctx.beginPath();ctx.ellipse(0,-8,5,10,0,0,TAU);ctx.fill();ctx.restore();}
        }else if(k==='tide'){
            ctx.strokeStyle='#a7f3f7';ctx.fillStyle='#2e727b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,10);ctx.quadraticCurveTo(-12,-22,0,-26);ctx.quadraticCurveTo(12,-22,18,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d9fbff';ctx.beginPath();ctx.arc(0,14,5,0,TAU);ctx.fill();ctx.strokeStyle='#5fa4a3';for(var coral=-1;coral<=1;coral+=2){ctx.beginPath();ctx.moveTo(coral*27,14);ctx.lineTo(coral*30,-10);ctx.lineTo(coral*38,-19);ctx.moveTo(coral*30,-6);ctx.lineTo(coral*21,-17);ctx.stroke();}
        }else if(k==='cloud'){
            ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,18);ctx.lineTo(0,-32);ctx.stroke();ctx.fillStyle='#6d94aa';ctx.beginPath();ctx.moveTo(0,-29);ctx.lineTo(29,-14);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#edfaff';ctx.beginPath();ctx.arc(-20,13,16,Math.PI,TAU);ctx.arc(0,13,22,Math.PI,TAU);ctx.arc(24,13,14,Math.PI,TAU);ctx.fill();
        }else if(k==='glyph'){
            ctx.fillStyle='#5c4728';ctx.strokeStyle='#dec27d';ctx.lineWidth=3;ctx.fillRect(-31,-18,62,35);ctx.strokeRect(-31,-18,62,35);ctx.fillStyle='#f4e2ae';for(var page=-1;page<=1;page+=2){ctx.beginPath();ctx.moveTo(page*2,-14);ctx.lineTo(page*28,-10);ctx.lineTo(page*27,13);ctx.lineTo(page*2,9);ctx.closePath();ctx.fill();}ctx.strokeStyle='#bd3d45';ctx.beginPath();ctx.moveTo(-18,-4);ctx.lineTo(-7,4);ctx.moveTo(10,-6);ctx.arc(15,0,6,0,TAU);ctx.stroke();
        }else if(k==='mirror'){
            ctx.strokeStyle='#f0fdff';ctx.lineWidth=2;for(var pr=0;pr<5;pr++){var pa=pr*TAU/5-.2,ph=25+(pr%2)*13;ctx.fillStyle=pr%2?'#9de7ee':'#7fc2dc';ctx.beginPath();ctx.moveTo(Math.cos(pa)*9,Math.sin(pa)*7);ctx.lineTo(Math.cos(pa)*ph-Math.sin(pa)*7,Math.sin(pa)*ph+Math.cos(pa)*7);ctx.lineTo(Math.cos(pa)*ph+Math.sin(pa)*7,Math.sin(pa)*ph-Math.cos(pa)*7);ctx.closePath();ctx.fill();ctx.stroke();}ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,0,9,0,TAU);ctx.stroke();
        }else if(k==='neon'){
            ctx.strokeStyle='#205f58';ctx.lineWidth=5;for(var reed=-2;reed<=2;reed++){ctx.beginPath();ctx.moveTo(reed*12,16);ctx.quadraticCurveTo(reed*15,-5,reed*9,-25-(reed%2)*8);ctx.stroke();ctx.strokeStyle='#48ffd0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(reed*9,-25-(reed%2)*8,4,0,TAU);ctx.stroke();ctx.strokeStyle='#205f58';ctx.lineWidth=5;}ctx.fillStyle='#79c889';ctx.beginPath();ctx.arc(0,13,23,0,TAU);ctx.fill();
        }else if(k==='magma'){
            ctx.fillStyle='#4b241b';ctx.strokeStyle='#ff9b58';ctx.lineWidth=3;for(var ing=-1;ing<=1;ing++){ctx.save();ctx.translate(ing*22,ing%2?0:-8);ctx.rotate(ing*.16);ctx.fillRect(-12,-9,24,18);ctx.strokeRect(-12,-9,24,18);ctx.restore();}ctx.fillStyle='#ffd08b';for(var spark=0;spark<5;spark++){ctx.beginPath();ctx.arc(-24+spark*12,-24-(spark%2)*6,2,0,TAU);ctx.fill();}
        }else if(k==='thorn'){
            ctx.strokeStyle='#6f4a31';ctx.lineWidth=7;for(var root=0;root<5;root++){ctx.beginPath();ctx.moveTo(0,12);var ra=root*TAU/5;ctx.quadraticCurveTo(Math.cos(ra)*20,Math.sin(ra)*13,Math.cos(ra)*43,Math.sin(ra)*28);ctx.stroke();}ctx.fillStyle='#75a963';for(var leaf=0;leaf<6;leaf++){var la=leaf*TAU/6;ctx.beginPath();ctx.ellipse(Math.cos(la)*31,Math.sin(la)*20,9,4,la,0,TAU);ctx.fill();}
        }else if(k==='gear'){
            ctx.fillStyle='#65572f';ctx.strokeStyle=art.trim;ctx.lineWidth=3;for(var gr=0;gr<3;gr++){var gx=(gr-1)*22,gy=gr%2?0:8;ctx.beginPath();ctx.arc(gx,gy,14+gr%2*4,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(gx,gy,4,0,TAU);ctx.stroke();}
        }else if(k==='moon'){
            ctx.fillStyle='#d8d7cc';for(var sk=0;sk<3;sk++){var sx=(sk-1)*19,sy=sk===1?-9:4;ctx.beginPath();ctx.arc(sx,sy,12,0,TAU);ctx.fill();ctx.fillStyle='#252a45';ctx.beginPath();ctx.arc(sx-4,sy,3,0,TAU);ctx.arc(sx+4,sy,3,0,TAU);ctx.fill();ctx.fillStyle='#d8d7cc';}
        }else if(k==='spore'){
            for(var sp=0;sp<5;sp++){var px=(sp-2)*15,py=sp%2?4:-6;ctx.fillStyle='#c8d9a0';ctx.fillRect(px-3,py,6,19);ctx.fillStyle=sp%2?'#91ad57':'#b6e86b';ctx.beginPath();ctx.ellipse(px,py,13,8,0,Math.PI,TAU);ctx.fill();}
        }else{
            ctx.fillStyle=art.wallTop;ctx.strokeStyle=art.trim;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-35,14);ctx.lineTo(-21,-11);ctx.lineTo(-5,6);ctx.lineTo(10,-20);ctx.lineTo(35,14);ctx.closePath();ctx.fill();ctx.stroke();
        }
        ctx.restore();
    };

    function Obstacle(x, y, radius) { this.x = x; this.y = y; this.radius = radius || rand(36, 52); this.variant=Math.floor(rand(0,3)); this.turn=rand(-.12,.12); }
    Obstacle.prototype.draw = function () {
        var art=BIOME_ART[currentBiome.hazard],r=this.radius,v=this.variant;ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.turn);
        ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,r*.72,r*1.05,r*.38,0,0,TAU);ctx.fill();ctx.lineJoin='round';ctx.strokeStyle=art.seam;ctx.lineWidth=4;
        if(currentBiome.hazard==='frost'){
            ctx.fillStyle='#4f8198';for(var iy=0;iy<2;iy++)for(var ix=-1;ix<=1;ix++){if(iy===0&&Math.abs(ix)===1&&v===2)continue;var ox=ix*r*.48+(iy?0:r*.12),oy=iy*r*.48-r*.3;ctx.fillRect(ox-r*.24,oy-r*.24,r*.48,r*.48);ctx.strokeRect(ox-r*.24,oy-r*.24,r*.48,r*.48);ctx.strokeStyle='#dff8ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ox-r*.18,oy-r*.15);ctx.lineTo(ox+r*.16,oy+r*.12);ctx.stroke();ctx.strokeStyle=art.seam;ctx.lineWidth=4;}ctx.fillStyle='#d7f5ff';ctx.beginPath();ctx.moveTo(-r*.12,-r*.55);ctx.lineTo(0,-r*.95);ctx.lineTo(r*.15,-r*.5);ctx.closePath();ctx.fill();
        }else if(currentBiome.hazard==='sand'){
            ctx.fillStyle='#67583f';ctx.beginPath();ctx.moveTo(-r*.72,r*.6);ctx.lineTo(-r*.55,-r*.52);ctx.lineTo(0,-r*.82);ctx.lineTo(r*.55,-r*.52);ctx.lineTo(r*.72,r*.6);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#b79d68';ctx.beginPath();ctx.moveTo(-r*.8,r*.18);ctx.quadraticCurveTo(0,-r*.08,r*.82,r*.27);ctx.lineTo(r*.72,r*.63);ctx.lineTo(-r*.72,r*.63);ctx.closePath();ctx.fill();ctx.strokeStyle='#e3ca91';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-r*.28,r*.22,Math.PI,TAU);ctx.stroke();
        }else if(currentBiome.hazard==='storm'){
            ctx.fillStyle='#3e3158';ctx.beginPath();ctx.moveTo(-r*.62,r*.65);ctx.lineTo(-r*.42,-r*.55);ctx.lineTo(r*.42,-r*.55);ctx.lineTo(r*.62,r*.65);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#d7bbff';ctx.lineWidth=4;for(var ring=-1;ring<=1;ring++){ctx.beginPath();ctx.arc(0,ring*r*.34,r*.36,0,TAU);ctx.stroke();}ctx.fillStyle='#f3eaff';ctx.beginPath();ctx.arc(0,-r*.72,6,0,TAU);ctx.fill();ctx.strokeStyle='#b879ff';ctx.beginPath();ctx.moveTo(-r*.35,-r*.05);ctx.lineTo(-r*.08,r*.15);ctx.lineTo(r*.12,-r*.15);ctx.lineTo(r*.38,r*.08);ctx.stroke();
        }else if(currentBiome.hazard==='void'){
            ctx.fillStyle='#16091c';ctx.beginPath();ctx.moveTo(-r*.22,-r*.92);ctx.lineTo(r*.48,-r*.48);ctx.lineTo(r*.55,r*.62);ctx.lineTo(-r*.12,r*.83);ctx.lineTo(-r*.58,r*.28);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#ff74bd';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,r*.28,r*.48,-.28,0,TAU);ctx.stroke();ctx.fillStyle='#050207';ctx.beginPath();ctx.ellipse(0,0,r*.15,r*.34,-.28,0,TAU);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-r*.08,-r*.1,3,0,TAU);ctx.fill();
        }else if(currentBiome.hazard==='blood'){
            ctx.fillStyle='#551c30';ctx.beginPath();ctx.moveTo(-r*.66,r*.68);ctx.lineTo(-r*.52,-r*.22);ctx.quadraticCurveTo(-r*.35,-r*.8,0,-r*.9);ctx.quadraticCurveTo(r*.35,-r*.8,r*.52,-r*.22);ctx.lineTo(r*.66,r*.68);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#ffc0cd';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r*.35,r*.53);ctx.lineTo(-r*.35,-r*.12);ctx.quadraticCurveTo(0,-r*.68,r*.35,-r*.12);ctx.lineTo(r*.35,r*.53);ctx.stroke();ctx.fillStyle='#8f3853';for(var rose=0;rose<6;rose++){ctx.save();ctx.rotate(rose*TAU/6);ctx.beginPath();ctx.ellipse(0,-r*.25,r*.1,r*.2,0,0,TAU);ctx.fill();ctx.restore();}
        }else if(currentBiome.hazard==='glyph'){
            ctx.fillStyle='#5b4323';for(var shelf=-1;shelf<=1;shelf++){ctx.fillRect(-r*.68,shelf*r*.38-r*.12,r*1.36,r*.24);ctx.strokeRect(-r*.68,shelf*r*.38-r*.12,r*1.36,r*.24);}for(var book=0;book<7;book++){ctx.fillStyle=book%3===0?'#8c3f33':book%3===1?'#3f6c62':'#766027';ctx.fillRect(-r*.58+book*r*.17,-r*.47,r*.12,r*.33);ctx.fillRect(-r*.58+book*r*.17,r*.02,r*.12,r*.30);}ctx.fillStyle=art.trim;ctx.fillRect(-r*.52,-r*.76,r*1.04,r*.08);
        }else if(currentBiome.hazard==='thorn'){
            ctx.fillStyle='#3b492b';ctx.beginPath();ctx.arc(0,0,r*.72,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#70472d';ctx.lineWidth=8;for(var root=0;root<6;root++){ctx.beginPath();ctx.moveTo(0,-r*.15);var ra=root*TAU/6;ctx.quadraticCurveTo(Math.cos(ra)*r*.5,Math.sin(ra)*r*.5,Math.cos(ra)*r,Math.sin(ra)*r*.72);ctx.stroke();}ctx.fillStyle='#74a657';for(var leaf=0;leaf<5;leaf++){var la=leaf*TAU/5+.3;ctx.beginPath();ctx.ellipse(Math.cos(la)*r*.65,Math.sin(la)*r*.48,8,4,la,0,TAU);ctx.fill();}
        }else if(currentBiome.hazard==='tide'){
            ctx.fillStyle='#456a70';ctx.fillRect(-r*.55,-r*.65,r*1.1,r*1.3);ctx.strokeRect(-r*.55,-r*.65,r*1.1,r*1.3);ctx.fillStyle='#76979a';ctx.fillRect(-r*.7,-r*.72,r*1.4,r*.22);ctx.fillRect(-r*.68,r*.48,r*1.36,r*.2);ctx.fillStyle='#86c8bf';for(var barn=0;barn<6;barn++){var ba=barn*TAU/6;ctx.beginPath();ctx.arc(Math.cos(ba)*r*.5,Math.sin(ba)*r*.4,3+(barn%2),0,TAU);ctx.fill();}
        }else if(currentBiome.hazard==='cloud'){
            ctx.fillStyle='#d7edf5';ctx.beginPath();ctx.moveTo(-r*.68,r*.52);ctx.lineTo(-r*.5,-r*.26);ctx.lineTo(-r*.2,-r*.55);ctx.lineTo(0,-r*.38);ctx.lineTo(r*.27,-r*.72);ctx.lineTo(r*.63,-r*.28);ctx.lineTo(r*.7,r*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-r*.5,r*.05);ctx.quadraticCurveTo(-r*.18,-r*.22,r*.05,r*.02);ctx.quadraticCurveTo(r*.3,r*.25,r*.55,-r*.05);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-r*.22,r*.5,r*.28,Math.PI,TAU);ctx.arc(r*.18,r*.5,r*.36,Math.PI,TAU);ctx.fill();
        }else if(currentBiome.hazard==='mirror'){
            ctx.fillStyle='rgba(118,194,214,.72)';ctx.strokeStyle='#f0fdff';ctx.lineWidth=3;for(var facet=0;facet<4;facet++){ctx.save();ctx.rotate(facet*TAU/4+.38);ctx.beginPath();ctx.moveTo(0,-r*.16);ctx.lineTo(r*.3,-r*.8);ctx.lineTo(r*.58,-r*.08);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}ctx.fillStyle='#dffbff';ctx.beginPath();ctx.arc(0,0,r*.18,0,TAU);ctx.fill();
        }else if(currentBiome.hazard==='neon'){
            ctx.fillStyle='#24564e';ctx.beginPath();ctx.arc(0,r*.18,r*.72,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#48ffd0';ctx.lineWidth=3;for(var reed=-2;reed<=2;reed++){ctx.beginPath();ctx.moveTo(reed*r*.18,r*.48);ctx.quadraticCurveTo(reed*r*.28,0,reed*r*.17,-r*(.48+(reed%2)*.12));ctx.stroke();ctx.fillStyle='#a8ffe9';ctx.beginPath();ctx.ellipse(reed*r*.17,-r*(.5+(reed%2)*.12),5,11,0,0,TAU);ctx.fill();}ctx.strokeStyle='#81ffe7';ctx.beginPath();ctx.arc(0,r*.13,r*.4,0,TAU);ctx.stroke();
        }else if(currentBiome.hazard==='gear'){
            ctx.fillStyle='#65572f';ctx.beginPath();ctx.arc(0,0,r*.68,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle=art.trim;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,r*.42,0,TAU);ctx.stroke();for(var tooth=0;tooth<10;tooth++){ctx.save();ctx.rotate(tooth*TAU/10);ctx.fillStyle='#938044';ctx.fillRect(r*.58,-5,r*.34,10);ctx.restore();}ctx.fillStyle='#221f18';ctx.beginPath();ctx.arc(0,0,r*.14,0,TAU);ctx.fill();
        }else if(currentBiome.hazard==='moon'){
            ctx.fillStyle='#4a527b';ctx.fillRect(-r*.5,-r*.7,r,r*1.38);ctx.strokeRect(-r*.5,-r*.7,r,r*1.38);ctx.fillStyle='#858daf';ctx.fillRect(-r*.65,-r*.77,r*1.3,r*.2);ctx.strokeStyle=art.trim;ctx.lineWidth=3;ctx.beginPath();ctx.arc(-r*.06,-r*.05,r*.27,-1.2,1.2);ctx.arc(r*.09,-r*.05,r*.22,1.2,-1.2,true);ctx.stroke();ctx.fillStyle='#d8d7cc';for(var bone=0;bone<4;bone++){var by=-r*.42+bone*r*.27;ctx.fillRect(-r*.3,by,r*.6,4);ctx.beginPath();ctx.arc(-r*.3,by+2,4,0,TAU);ctx.arc(r*.3,by+2,4,0,TAU);ctx.fill();}
        }else if(currentBiome.hazard==='spore'){
            ctx.fillStyle='#4c5538';ctx.beginPath();ctx.arc(0,r*.12,r*.72,0,TAU);ctx.fill();ctx.stroke();for(var mush=0;mush<5;mush++){var ma=-1.6+mush*.78,mx=Math.cos(ma)*r*.58,my=Math.sin(ma)*r*.32;ctx.fillStyle='#c5d59a';ctx.fillRect(mx-3,my,6,r*.34);ctx.fillStyle=mush%2?'#91ad57':'#b6e86b';ctx.beginPath();ctx.ellipse(mx,my,r*.23,r*.14,ma*.15,Math.PI,TAU);ctx.fill();ctx.stroke();}
        }else if(currentBiome.hazard==='magma'){
            ctx.fillStyle='#3f2019';ctx.beginPath();ctx.moveTo(-r*.72,-r*.5);ctx.lineTo(r*.72,-r*.5);ctx.lineTo(r*.48,r*.68);ctx.lineTo(-r*.48,r*.68);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#8d432e';ctx.fillRect(-r*.82,-r*.62,r*1.64,r*.25);ctx.strokeRect(-r*.82,-r*.62,r*1.64,r*.25);ctx.strokeStyle='#ffbd75';ctx.lineWidth=3;for(var riv=-1;riv<=1;riv+=2){ctx.beginPath();ctx.arc(riv*r*.57,-r*.49,4,0,TAU);ctx.stroke();}ctx.strokeStyle='#ff7138';ctx.beginPath();ctx.moveTo(-r*.34,-r*.16);ctx.lineTo(0,r*.14);ctx.lineTo(r*.36,-r*.2);ctx.stroke();ctx.fillStyle='#ffb45c';ctx.beginPath();ctx.arc(0,r*.14,6,0,TAU);ctx.fill();
        }else if(currentBiome.hazard==='ember'){
            ctx.fillStyle='#563626';ctx.fillRect(-r*.62,-r*.55,r*1.24,r*1.12);ctx.strokeRect(-r*.62,-r*.55,r*1.24,r*1.12);ctx.fillStyle=art.wallTop;ctx.fillRect(-r*.72,-r*.65,r*1.44,r*.23);ctx.strokeStyle=art.trim;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-r*.45,-r*.28);ctx.lineTo(-r*.1,-r*.02);ctx.lineTo(-r*.28,r*.32);ctx.moveTo(r*.42,-r*.18);ctx.lineTo(r*.12,r*.04);ctx.lineTo(r*.34,r*.35);ctx.stroke();ctx.fillStyle='#ffb45c';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();
        }else{
            ctx.fillStyle=art.wall;ctx.beginPath();ctx.moveTo(0,-r*.88);ctx.lineTo(r*.68,-r*.5);ctx.lineTo(r*.66,r*.58);ctx.lineTo(0,r*.82);ctx.lineTo(-r*.66,r*.58);ctx.lineTo(-r*.68,-r*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=art.trim;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-r*.64);ctx.lineTo(r*.42,-r*.36);ctx.lineTo(r*.42,r*.36);ctx.lineTo(0,r*.58);ctx.lineTo(-r*.42,r*.36);ctx.lineTo(-r*.42,-r*.36);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.18,0,TAU);ctx.stroke();
        }
        ctx.restore();
    };

    var PROP_COLORS={royalBrazier:'#b77742',emberCask:'#ff7a2f',iceCrate:'#8edbff',sandUrn:'#f1c76b',arcCapacitor:'#b477ff',gravityCore:'#ff4da6',bloodRose:'#ff6b8a',heartPod:'#6fe38b',tideBell:'#3bd5e6',stormKite:'#bdeaff',runeLectern:'#ffd45a',mirrorObelisk:'#a8efff',pulseReed:'#48ffd0',forgeAnvil:'#ff6a32',hourglassEngine:'#ffd36a',lunarIdol:'#c9d1ff',sporeLantern:'#b6e86b'};
    function BiomeProp(x,y,kind){this.id=nextEntityId++;this.x=x;this.y=y;this.kind=kind;this.radius=kind==='gravityCore'?25:kind==='mirrorObelisk'||kind==='hourglassEngine'?23:kind==='forgeAnvil'?26:21;this.hits=0;this.requiredHits=1;this.dead=false;this.pulse=rand(0,TAU);this.color=PROP_COLORS[kind]||'#fff';}
    BiomeProp.prototype.update=function(step){this.pulse+=.045*step;};
    BiomeProp.prototype.draw=function(){
        var p=(Math.sin(this.pulse)+1)/2,c=this.color;ctx.save();ctx.translate(this.x,this.y);ctx.shadowBlur=10+p*8;ctx.shadowColor=c;ctx.fillStyle='rgba(0,0,0,.48)';ctx.beginPath();ctx.ellipse(0,this.radius*.82,this.radius*1.15,this.radius*.4,0,0,TAU);ctx.fill();ctx.strokeStyle=c;ctx.fillStyle='#202428';ctx.lineWidth=3;
        if(this.kind==='royalBrazier'){ctx.shadowBlur=8+p*5;ctx.shadowColor='#e1aa6d';ctx.fillStyle='#332824';ctx.strokeStyle='#8a6a52';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-17,10);ctx.lineTo(-11,-8);ctx.lineTo(11,-8);ctx.lineTo(17,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#7c5a3a';ctx.fillRect(-4,10,8,18);ctx.fillStyle='#3a2a22';ctx.fillRect(-13,27,26,6);ctx.fillStyle='#d08b47';ctx.beginPath();ctx.moveTo(-8,-9);ctx.quadraticCurveTo(-2,-29,2,-13);ctx.quadraticCurveTo(9,-31,9,-8);ctx.quadraticCurveTo(0,1,-8,-9);ctx.fill();ctx.fillStyle='#f2d3a2';ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(-3,-10);ctx.quadraticCurveTo(1,-22,4,-10);ctx.quadraticCurveTo(2,-3,-3,-10);ctx.fill();ctx.globalAlpha=1;}
        else if(this.kind==='emberCask'){ctx.fillStyle='#63331f';ctx.fillRect(-15,-19,30,38);ctx.strokeRect(-15,-19,30,38);ctx.strokeStyle='#e5a05e';ctx.beginPath();ctx.moveTo(-15,-8);ctx.lineTo(15,-8);ctx.moveTo(-15,9);ctx.lineTo(15,9);ctx.stroke();ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,0,5+p*2,0,TAU);ctx.fill();}
        else if(this.kind==='iceCrate'){ctx.fillStyle='#4e89a8';ctx.beginPath();ctx.moveTo(-20,-16);ctx.lineTo(16,-20);ctx.lineTo(21,15);ctx.lineTo(-15,21);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#e9fbff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-16,-12);ctx.lineTo(16,14);ctx.moveTo(12,-16);ctx.lineTo(-11,17);ctx.moveTo(0,-18);ctx.lineTo(2,18);ctx.stroke();}
        else if(this.kind==='sandUrn'){ctx.fillStyle='#6b5130';ctx.beginPath();ctx.moveTo(-12,-20);ctx.lineTo(12,-20);ctx.lineTo(16,-8);ctx.lineTo(13,19);ctx.lineTo(-13,19);ctx.lineTo(-16,-8);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-9,-7);ctx.quadraticCurveTo(0,-15,9,-7);ctx.quadraticCurveTo(0,5,-9,-7);ctx.fill();ctx.strokeStyle='#fff0b8';ctx.beginPath();ctx.arc(0,2,7+p*2,0,TAU);ctx.stroke();}
        else if(this.kind==='arcCapacitor'){ctx.fillStyle='#29213d';ctx.fillRect(-13,-21,26,42);ctx.strokeRect(-13,-21,26,42);ctx.strokeStyle='#e9d5ff';ctx.beginPath();ctx.moveTo(-7,-12);ctx.lineTo(4,-3);ctx.lineTo(-4,1);ctx.lineTo(8,12);ctx.stroke();for(var ac=0;ac<3;ac++){ctx.fillStyle=ac<this.hits?'#fff':c;ctx.globalAlpha=ac<this.hits?1:.35;ctx.beginPath();ctx.arc(-8+ac*8,17,2.5,0,TAU);ctx.fill();}ctx.globalAlpha=1;}
        else if(this.kind==='gravityCore'){ctx.fillStyle='#07040a';ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.fill();ctx.stroke();ctx.rotate(-this.pulse*.25);for(var gc=0;gc<3;gc++){ctx.rotate(TAU/3);ctx.beginPath();ctx.ellipse(0,0,29,9,0,0,TAU);ctx.stroke();}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,3+p*2,0,TAU);ctx.fill();}
        else if(this.kind==='bloodRose'){ctx.fillStyle='#541625';for(var br=0;br<7;br++){ctx.rotate(TAU/7);ctx.beginPath();ctx.ellipse(0,-11,8,15,.25,0,TAU);ctx.fill();ctx.stroke();}ctx.fillStyle='#ffd9e2';ctx.beginPath();ctx.arc(0,0,5+p*3,0,TAU);ctx.fill();ctx.strokeStyle='#ff9ab0';ctx.beginPath();ctx.moveTo(0,13);ctx.bezierCurveTo(-12,22,10,29,0,37);ctx.stroke();}
        else if(this.kind==='heartPod'){ctx.fillStyle='#21472d';for(var hp=0;hp<5;hp++){ctx.rotate(TAU/5);ctx.beginPath();ctx.ellipse(0,-10,8,15,0,0,TAU);ctx.fill();ctx.stroke();}ctx.fillStyle='#d7ffd9';ctx.beginPath();ctx.arc(0,0,6+p*3,0,TAU);ctx.fill();}
        else if(this.kind==='tideBell'){ctx.fillStyle='#225965';ctx.beginPath();ctx.moveTo(-18,14);ctx.quadraticCurveTo(-12,-19,0,-22);ctx.quadraticCurveTo(12,-19,18,14);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d9fbff';ctx.beginPath();ctx.arc(0,18,5,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,0,8+p*3,0,TAU);ctx.stroke();}
        else if(this.kind==='stormKite'){ctx.fillStyle='#4f7188';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(20,0);ctx.lineTo(0,25);ctx.lineTo(-20,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,22);ctx.moveTo(-17,0);ctx.lineTo(17,0);ctx.stroke();ctx.beginPath();ctx.moveTo(0,24);ctx.bezierCurveTo(16,31,-13,38,5,46);ctx.stroke();}
        else if(this.kind==='runeLectern'){ctx.fillStyle='#55431e';ctx.fillRect(-18,-16,36,31);ctx.strokeRect(-18,-16,36,31);ctx.fillStyle='#f5e4a8';ctx.beginPath();ctx.moveTo(-15,-13);ctx.lineTo(-2,-9);ctx.lineTo(0,12);ctx.lineTo(-15,9);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(15,-13);ctx.lineTo(2,-9);ctx.lineTo(0,12);ctx.lineTo(15,9);ctx.closePath();ctx.fill();ctx.strokeStyle=c;ctx.beginPath();ctx.arc(0,0,5+p*2,0,TAU);ctx.stroke();}
        else if(this.kind==='forgeAnvil'){ctx.fillStyle='#51231a';ctx.beginPath();ctx.moveTo(-23,-12);ctx.lineTo(23,-12);ctx.lineTo(14,1);ctx.lineTo(9,17);ctx.lineTo(-9,17);ctx.lineTo(-14,1);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ffb36f';ctx.fillRect(-19,-13,38,6);ctx.fillStyle='#fff0c2';ctx.beginPath();ctx.arc(0,-9,3+p*2,0,TAU);ctx.fill();}
        else if(this.kind==='hourglassEngine'){ctx.fillStyle='#4c4022';ctx.fillRect(-17,-21,34,5);ctx.fillRect(-17,16,34,5);ctx.strokeRect(-17,-21,34,5);ctx.strokeRect(-17,16,34,5);ctx.strokeStyle='#fff1b2';ctx.beginPath();ctx.moveTo(-12,-16);ctx.lineTo(10,16);ctx.moveTo(12,-16);ctx.lineTo(-10,16);ctx.stroke();ctx.fillStyle='#ffd36a';ctx.beginPath();ctx.moveTo(-10,-14);ctx.lineTo(10,-14);ctx.lineTo(0,1+p*4);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(0,2);ctx.lineTo(-9,14);ctx.lineTo(9,14);ctx.closePath();ctx.fill();}
        else if(this.kind==='lunarIdol'){ctx.fillStyle='#2c315d';ctx.beginPath();ctx.arc(0,0,20,-1.2,1.2);ctx.arc(8,0,15,1.2,-1.2,true);ctx.fill();ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(-2,0,8+p*3,0,TAU);ctx.stroke();for(var li=0;li<4;li++){var lia=li*TAU/4+this.pulse*.1;ctx.fillStyle=c;ctx.beginPath();ctx.arc(Math.cos(lia)*27,Math.sin(lia)*27,2.5,0,TAU);ctx.fill();}}
        else if(this.kind==='sporeLantern'){ctx.fillStyle='#40512a';ctx.fillRect(-5,4,10,18);ctx.strokeRect(-5,4,10,18);ctx.fillStyle='#9fc95b';ctx.beginPath();ctx.ellipse(0,-5,20,15,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#eaffb6';for(var sl=0;sl<6;sl++){var sla=sl*TAU/6;ctx.beginPath();ctx.arc(Math.cos(sla)*11,Math.sin(sla)*7-5,2+p,0,TAU);ctx.fill();}}
        else if(this.kind==='pulseReed'){ctx.strokeStyle='#205f58';ctx.lineWidth=5;for(var pr=-1;pr<=1;pr++){ctx.beginPath();ctx.moveTo(pr*7,22);ctx.quadraticCurveTo(pr*15,-2,pr*6,-24);ctx.stroke();}ctx.strokeStyle=c;ctx.lineWidth=2;for(var pn=0;pn<3;pn++){ctx.beginPath();ctx.arc(0,0,8+pn*8+p*3,0,TAU);ctx.stroke();}ctx.fillStyle='#e1fff8';ctx.beginPath();ctx.arc(0,0,4+p*2,0,TAU);ctx.fill();}
        else{ctx.fillStyle='rgba(88,170,200,.42)';ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(19,-7);ctx.lineTo(11,24);ctx.lineTo(-13,21);ctx.lineTo(-20,-8);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(0,-21);ctx.lineTo(7,17);ctx.moveTo(-14,-5);ctx.lineTo(14,7);ctx.stroke();ctx.rotate(this.pulse*.2);ctx.beginPath();ctx.arc(0,0,30+p*4,0,TAU);ctx.stroke();}
        ctx.restore();
    };
    function advanceDungeonMemory(kind){
        if(!player||!DUNGEON_MEMORY_DEFS[kind])return false;player.memoryProgress[kind]=(player.memoryProgress[kind]||0)+1;if(player.memoryProgress[kind]<2)return false;player.memoryProgress[kind]=2;if(player.memories[kind])return false;player.memories[kind]=true;if(!player.primeMemory)player.primeMemory=kind;playSound('progression.memory');return true;
    }
    function completeBiomeMemory(){
        if(!player||!currentBiome)return'';var kind=currentBiome.resonance,def=DUNGEON_MEMORY_DEFS[kind];if(!def)return'';player.memoryProgress[kind]=2;if(player.memories[kind])return'';player.memories[kind]=true;if(!player.primeMemory)player.primeMemory=kind;playSound('progression.memory');return def.name;
    }
    function gainBiomeResonance(){
        if(!player||!currentBiome)return;if(player.resonanceTimer>0){player.resonanceTimer=Math.min(600,player.resonanceTimer+45);return;}
        player.resonance+=player.passives.biomeScholar?2:1;player.resonance=Math.min(3,player.resonance);addFloat('RESONANCE '+player.resonance+'/3',player.x,player.y-50,currentBiome.accent);
        if(player.resonance>=3){player.resonance=0;player.resonanceKind=currentBiome.resonance;player.resonanceTimer=480;player.mana=Math.min(player.maxMana,player.mana+15);player.armor=Math.min(player.maxArmor,player.armor+1);addRing(player.x,player.y,currentBiome.accent,230,8);var learned=advanceDungeonMemory(currentBiome.resonance);showToast(learned?'DUNGEON MEMORY LEARNED · '+DUNGEON_MEMORY_DEFS[currentBiome.resonance].name:currentBiome.resonance+' RESONANCE!',currentBiome.accent);}
        hudRefreshMs=Math.max(hudRefreshMs,120);
    }
    function triggerBiomeProp(prop,playerTriggered){
        if(!prop||prop.dead)return;prop.dead=true;var x=prop.x,y=prop.y,c=prop.color;if(playerTriggered!==false)gainBiomeResonance();playSound('prop.break',{x:x,y:y});addParticles(x,y,c,18,5);addRing(x,y,c,90,5);
        if(playerTriggered!==false&&player.primeMemory==='WILDBLOOM')player.hp=Math.min(player.maxHp,player.hp+.15);
        if(prop.kind==='royalBrazier'){explode(x,y,112,9,true,'#c7773b','burn',false);hazards.push(new TimedField(x,y,72,'fire',165));addRing(x,y,'#e1b17d',118,4);}
        else if(prop.kind==='emberCask'){explode(x,y,135,12,true,c,'burn',false);hazards.push(new TimedField(x,y,78,'fire',190));biomeProps.forEach(function(other){if(!other.dead&&other.kind==='emberCask'&&Math.hypot(other.x-x,other.y-y)<185)triggerBiomeProp(other,playerTriggered);});}
        else if(prop.kind==='iceCrate'){explode(x,y,82,5,true,c,'freeze',false);hazards.push(new TimedField(x,y,155,'frostZone',330));}
        else if(prop.kind==='sandUrn'){hazards.push(new TimedField(x,y,165,'sandTailwind',300));for(var sb=0;sb<bullets.length;sb++){var sandShot=bullets[sb];if(!sandShot.dead&&!sandShot.friendly&&Math.hypot(sandShot.x-x,sandShot.y-y)<230){sandShot.vx*=.55;sandShot.vy*=.55;}}enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-x,e.y-y)<210)e.rift=Math.max(e.rift,180);});addRing(x,y,'#fff0b8',230,6);}
        else if(prop.kind==='arcCapacitor'){var first=closestEnemy(x,y,720);if(first)chainLightning(prop,first,9*player.damageMultiplier(),6,c,true);bullets.forEach(function(b){if(!b.friendly&&Math.hypot(b.x-x,b.y-y)<190)b.dead=true;});addRing(x,y,'#fff',220,3);}
        else if(prop.kind==='gravityCore'){hazards.push(new TimedField(x,y,145,'singularity',260));bullets.forEach(function(b){if(!b.friendly&&Math.hypot(b.x-x,b.y-y)<260)b.dead=true;});addDarkBloom(x,y,95);}
        else if(prop.kind==='bloodRose'){var drained=0;enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-x,e.y-y)<225){damageEnemy(e,8*player.damageMultiplier(),{status:'curse',direct:false});drained++;}});player.hp=Math.min(player.maxHp,player.hp+Math.min(1,.2*drained));hazards.push(new TimedField(x,y,145,'bloodBloom',240));addFloat('SIPHON '+drained,x,y-38,c);}
        else if(prop.kind==='heartPod'){enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-x,e.y-y)<185){damageEnemy(e,7,{direct:false,stun:95,status:'freeze'});}});player.hp=Math.min(player.maxHp,player.hp+1);player.armor=Math.min(player.maxArmor,player.armor+1);hazards.push(new TimedField(x,y,145,'rootBloom',230));addFloat('+LIFE',player.x,player.y-38,c);}
        else if(prop.kind==='tideBell'){enemies.forEach(function(e){var d=Math.hypot(e.x-x,e.y-y)||1;if(!e.dead&&d<330){e.x+=(e.x-x)/d*95;e.y+=(e.y-y)/d*95;e.stun=Math.max(e.stun,25);}});bullets.forEach(function(b){var d=Math.hypot(b.x-x,b.y-y);if(!b.friendly&&d<330){b.friendly=true;b.damage=Math.max(2,b.damage*1.8);b.vx*=-1.25;b.vy*=-1.25;b.color=c;}});addRing(x,y,'#d9fbff',340,7);}
        else if(prop.kind==='stormKite'){hazards.push(new TimedField(x,y,180,'skyCurrent',230));for(var sk=0;sk<6;sk++){var ska=sk*TAU/6;bullets.push(spawnBullet({x:x+Math.cos(ska)*90,y:y+Math.sin(ska)*90,angle:ska,speed:15,damage:5*player.damageMultiplier(),friendly:true,color:sk%2?'#fff':'#bdeaff',sourceId:'stormKite',type:'windBolt',radius:5,life:90,pierce:2,homing:.055,ghost:true}));}addRing(x,y,'#fff',260,6);}
        else if(prop.kind==='runeLectern'){player.mana=Math.min(player.maxMana,player.mana+35);addWallet(player,2);enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-x,e.y-y)<240)e.rift=Math.max(e.rift,240);});addFloat('+35 MANA · +2 COINS',x,y-35,c);}
        else if(prop.kind==='mirrorObelisk'){for(var ms=0;ms<10;ms++){var ma=ms*TAU/10;bullets.push(spawnBullet({x:x,y:y,angle:ma,speed:11,damage:5*player.damageMultiplier(),friendly:true,color:c,radius:5,life:100,pierce:1,bounce:1,homing:.075,type:'shard',sourceId:'mirrorObelisk'}));}addRing(x,y,'#fff',180,3);}
        else if(prop.kind==='forgeAnvil'){for(var fa=0;fa<14;fa++){var fan=fa*TAU/14;bullets.push(spawnBullet({x:x,y:y,angle:fan,speed:13,damage:8*player.damageMultiplier(),friendly:true,color:c,radius:6,life:120,pierce:2,status:'burn',type:'emberTooth',sourceId:'forgeAnvil'}));}hazards.push(new TimedField(x,y,105,'fire',210));addRing(x,y,'#fff0c2',245,7);}
        else if(prop.kind==='hourglassEngine'){worldSlowTimer=Math.max(worldSlowTimer,210);for(var hb=0;hb<bullets.length;hb++){var rewind=bullets[hb];if(!rewind.friendly&&!rewind.dead){rewind.friendly=true;rewind.damage=Math.max(4,rewind.damage*2);rewind.vx*=-1.2;rewind.vy*=-1.2;rewind.color=c;rewind.chrono=true;}}enemies.forEach(function(e){if(!e.dead)e.stun=Math.max(e.stun,32);});addRing(x,y,'#fff1b2',420,8);showToast('SECOND HAND REWINDS THE ROOM',c);}
        else if(prop.kind==='lunarIdol'){for(var lb=0;lb<12;lb++){var lba=lb*TAU/12;bullets.push(spawnBullet({x:x,y:y,angle:lba,speed:14,damage:6.5*player.damageMultiplier(),friendly:true,color:c,radius:7,life:130,pierce:2,homing:.095,moonSplit:true,type:'moonBlade',sourceId:'lunarIdol'}));}addRing(x,y,'#fff',260,5);}
        else if(prop.kind==='sporeLantern'){hazards.push(new TimedField(x,y,185,'poisonBloom',300));var firstPoison=closestEnemy(x,y,720);if(firstPoison)chainLightning(prop,firstPoison,7*player.damageMultiplier(),7,c,false);enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-x,e.y-y)<250)applyStatus(e,'poison');});addRing(x,y,'#eaffb6',270,7);}
        else if(prop.kind==='pulseReed'){hazards.push(new TimedField(x,y,170,'neonPulse',260));var pulseTarget=closestEnemy(x,y,720);if(pulseTarget)chainLightning(prop,pulseTarget,6*player.damageMultiplier(),6,c,true);player.overclock=Math.max(player.overclock,90);player.mana=Math.min(player.maxMana,player.mana+18);addFloat('+18 MANA · QUICKENED',x,y-38,c);}
    }
    function hitBiomeProp(prop,source){if(!prop||prop.dead)return false;prop.hits++;playSound('prop.interact',{x:prop.x,y:prop.y});addFloat('TRIGGER!',prop.x,prop.y-prop.radius-10,prop.color);addParticles(prop.x,prop.y,prop.color,5,2.5);if(prop.hits>=prop.requiredHits)triggerBiomeProp(prop,true);return true;}

    function Hazard(x, y, kind) {
        this.x = x; this.y = y; this.kind = kind; this.radius = rand(52, 78); this.timer = rand(0, 120); this.pulse = 0;this.angle=rand(0,TAU);
    }
    Hazard.prototype.update = function (step) {
        this.timer += step; this.pulse = (Math.sin(this.timer * .045) + 1) / 2;
        var field=this,members=partyPlayers().filter(function(member){return member&&!member.downed&&member.hp>0;}),near=function(member,radius){return Math.hypot(member.x-field.x,member.y-field.y)<radius;};
        if(this.kind==='ember'&&this.timer%150<step){addRing(this.x,this.y,'#e67e22',this.radius,5);var emberHit=false;members.forEach(function(member){if(near(member,field.radius)){member.hit(1,'ember vent');emberHit=true;}});if(emberHit)playSound('hazard.activate',{x:this.x,y:this.y});}
        if(this.kind==='frost')members.forEach(function(member){if(near(member,field.radius))member.terrainSlow=Math.min(member.terrainSlow,.72);});
        if(this.kind==='sand')members.forEach(function(member){if(near(member,field.radius)){member.terrainSlow=Math.min(member.terrainSlow,.82);if(field.timer%150<step)member.mana=Math.min(member.maxMana,member.mana+2);}});
        if(this.kind==='storm'&&this.timer%180<step){var stormHit=false;members.forEach(function(member){if(near(member,field.radius+12)){member.hit(1,'storm');stormHit=true;}});if(stormHit){playSound('hazard.activate',{x:this.x,y:this.y});addRing(this.x,this.y,'#a55eea',this.radius,5);}}
        if(this.kind==='void')members.forEach(function(member){var d=Math.hypot(member.x-field.x,member.y-field.y);if(d<field.radius*2.2){var a=Math.atan2(field.y-member.y,field.x-member.x),pull=(1-d/(field.radius*2.2))*.42;member.x+=Math.cos(a)*pull*step;member.y+=Math.sin(a)*pull*step;}});
        if(this.kind==='blood'&&this.timer%150<step){var bloodHit=false;members.forEach(function(member){if(near(member,field.radius)){member.hit(1,'blood glyph');bloodHit=true;}});if(bloodHit){playSound('hazard.activate',{x:this.x,y:this.y});}var nearestBlood=bloodHit&&closestEnemy(this.x,this.y,260);if(nearestBlood)damageEnemy(nearestBlood,3,{status:'curse',direct:false});}
        if(this.kind==='thorn'&&this.timer%180<step){addRing(this.x,this.y,'#62c370',this.radius+18,6);var thornHit=false;members.forEach(function(member){if(near(member,field.radius+member.radius)){member.hit(1,'thorn bed');member.terrainSlow=Math.min(member.terrainSlow,.5);thornHit=true;}});enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-field.x,e.y-field.y)<field.radius+e.radius){damageEnemy(e,3,{direct:false,silent:true});e.stun=Math.max(e.stun,22);thornHit=true;}});if(thornHit)playSound('hazard.activate',{x:this.x,y:this.y});}
        if(this.kind==='tide'){var strength=(.18+.22*this.pulse)*step;members.forEach(function(member){if(near(member,field.radius*1.75)){member.x+=Math.cos(field.angle)*strength;member.y+=Math.sin(field.angle)*strength;}});enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-field.x,e.y-field.y)<field.radius*1.75){e.x+=Math.cos(field.angle)*strength*.75;e.y+=Math.sin(field.angle)*strength*.75;}});}
        if(this.kind==='cloud'){var wind=(.16+.18*this.pulse)*step;members.forEach(function(member){if(near(member,field.radius*1.7)){member.x+=Math.cos(field.angle)*wind;member.y+=Math.sin(field.angle)*wind;}});}
        if(this.kind==='glyph')members.forEach(function(member){if(near(member,field.radius))member.mana=Math.min(member.maxMana,member.mana+.12*step);});
        if(this.kind==='mirror'&&this.timer%165<step){for(var m=0;m<4;m++)bullets.push(spawnBullet({x:this.x,y:this.y,angle:this.angle+m*TAU/4,speed:6.2,damage:1,friendly:false,color:'#9ce7ff',radius:5,bounce:2,life:150,sourceId:'mirrorHazard',type:'shard'}));addRing(this.x,this.y,'#9ce7ff',this.radius+26,3);}
        if(this.kind==='magma'&&this.timer%170<step){addRing(this.x,this.y,'#ff6a32',this.radius+35,7);var magmaHit=false;members.forEach(function(member){if(near(member,field.radius+35)){member.hit(1,'magma pulse');magmaHit=true;}});if(magmaHit)playSound('hazard.activate',{x:this.x,y:this.y});for(var mg=0;mg<6;mg++){var mga=mg*TAU/6+this.angle;bullets.push(spawnBullet({x:this.x,y:this.y,angle:mga,speed:4.6,damage:1,friendly:false,color:'#ff8d4d',radius:5,life:85,type:'emberTooth',sourceId:'magmaVent'}));}}
        if(this.kind==='gear'){this.angle+=.018*step;members.forEach(function(member){if(near(member,field.radius+18)){var tangent=field.angle+Math.PI/2,force=(.2+.18*field.pulse)*step;member.x+=Math.cos(tangent)*force;member.y+=Math.sin(tangent)*force;member.terrainSlow=Math.min(member.terrainSlow,.82);}});}
        if(this.kind==='moon'&&this.timer%210<step){var moonTarget=nearestLivingPlayer(this.x,this.y);if(moonTarget){var ma=Math.atan2(moonTarget.y-this.y,moonTarget.x-this.x);for(var moon=-1;moon<=1;moon++)bullets.push(spawnBullet({x:this.x,y:this.y,angle:ma+moon*.38,speed:5.2,damage:1,friendly:false,color:'#c9d1ff',radius:6,life:135,type:'moonBlade',sourceId:'moonWell'}));addRing(this.x,this.y,'#c9d1ff',this.radius+24,3);}}
        if(this.kind==='spore')members.forEach(function(member){if(near(member,field.radius+10)){member.terrainSlow=Math.min(member.terrainSlow,.68);if(field.timer%120<step){member.hit(1,'spore cloud');playSound('hazard.activate',{x:field.x,y:field.y});}}});
        if(this.kind==='neon')members.forEach(function(member){if(near(member,field.radius)){member.overclock=Math.max(member.overclock,8);member.mana=Math.min(member.maxMana,member.mana+.035*step);}});
    };
    Hazard.prototype.draw = function () {
        var c = this.kind === 'frost' ? '#74b9ff' :this.kind==='sand'?'#f1c76b': this.kind === 'storm' ? '#a55eea' : this.kind === 'void' ? '#ff4d8d' :this.kind==='blood'?'#ff6b8a': this.kind==='thorn'?'#62c370':this.kind==='tide'?'#35b9c7':this.kind==='cloud'?'#bdeaff':this.kind==='glyph'?'#e0b84f':this.kind==='mirror'?'#9ce7ff':this.kind==='neon'?'#48ffd0':this.kind==='magma'?'#ff6a32':this.kind==='gear'?'#ffd36a':this.kind==='moon'?'#c9d1ff':this.kind==='spore'?'#b6e86b':'#e67e22';
        ctx.save(); ctx.translate(this.x, this.y); ctx.globalAlpha = .13 + this.pulse * .12;
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, TAU); ctx.fill();
        ctx.globalAlpha = .35; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, this.radius * (.72 + this.pulse * .18), 0, TAU); ctx.stroke();
        if(this.kind==='thorn'){ctx.rotate(this.timer*.003);for(var th=0;th<8;th++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(this.radius*.72,-8);ctx.lineTo(this.radius*.58,8);ctx.stroke();}}
        else if(this.kind==='sand'){ctx.rotate(this.timer*.003);for(var sah=0;sah<6;sah++){ctx.rotate(TAU/6);ctx.beginPath();ctx.arc(this.radius*.45,0,18,-.8,.8);ctx.stroke();}}
        else if(this.kind==='blood'){ctx.rotate(this.timer*.002);for(var bl=0;bl<7;bl++){ctx.rotate(TAU/7);ctx.beginPath();ctx.ellipse(this.radius*.47,0,13,5,0,0,TAU);ctx.stroke();}}
        else if(this.kind==='tide'){ctx.rotate(this.angle);for(var td=-2;td<=2;td++){ctx.beginPath();ctx.moveTo(-this.radius,td*10);ctx.quadraticCurveTo(0,td*10+Math.sin(this.timer*.06+td)*8,this.radius,td*10);ctx.stroke();}}
        else if(this.kind==='cloud'){ctx.rotate(this.angle);for(var cld=-2;cld<=2;cld++){ctx.beginPath();ctx.moveTo(-this.radius,cld*11);ctx.bezierCurveTo(-12,cld*11-16,12,cld*11+16,this.radius,cld*11);ctx.stroke();}}
        else if(this.kind==='glyph'){ctx.rotate(this.timer*.008);ctx.strokeRect(-this.radius*.48,-this.radius*.48,this.radius*.96,this.radius*.96);ctx.rotate(Math.PI/4);ctx.strokeRect(-this.radius*.33,-this.radius*.33,this.radius*.66,this.radius*.66);ctx.fillStyle=c;ctx.font='13px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';ctx.fillText('+M',0,5);}
        else if(this.kind==='mirror'){ctx.rotate(this.timer*.012);ctx.beginPath();ctx.moveTo(0,-this.radius*.65);ctx.lineTo(this.radius*.55,this.radius*.4);ctx.lineTo(-this.radius*.55,this.radius*.4);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-this.radius*.65);ctx.lineTo(0,this.radius*.4);ctx.moveTo(-this.radius*.55,this.radius*.4);ctx.lineTo(this.radius*.28,-this.radius*.12);ctx.moveTo(this.radius*.55,this.radius*.4);ctx.lineTo(-this.radius*.28,-this.radius*.12);ctx.stroke();}
        else if(this.kind==='magma'){ctx.rotate(this.timer*.004);for(var mv=0;mv<7;mv++){ctx.rotate(TAU/7);ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(this.radius*.48,-6);ctx.lineTo(this.radius*.76,2);ctx.stroke();}ctx.fillStyle='#ffb36f';ctx.beginPath();ctx.arc(0,0,7+this.pulse*6,0,TAU);ctx.fill();}
        else if(this.kind==='gear'){ctx.rotate(this.angle);for(var ge=0;ge<12;ge++){ctx.rotate(TAU/12);ctx.strokeRect(this.radius*.58,-5,14,10);}ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,this.radius*.58,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,this.radius*.2,0,TAU);ctx.stroke();}
        else if(this.kind==='moon'){ctx.rotate(this.timer*.003);ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,this.radius*.62,-1.2,1.2);ctx.stroke();ctx.beginPath();ctx.arc(this.radius*.18,0,this.radius*.48,1.2,-1.2,true);ctx.stroke();for(var mw=0;mw<5;mw++){ctx.rotate(TAU/5);ctx.beginPath();ctx.arc(this.radius*.78,0,2+this.pulse*2,0,TAU);ctx.stroke();}}
        else if(this.kind==='spore'){for(var sp=0;sp<9;sp++){var spa=sp*TAU/9+this.timer*.002,spr=this.radius*(.25+(sp%3)*.2);ctx.beginPath();ctx.arc(Math.cos(spa)*spr,Math.sin(spa)*spr,3+(sp%2)*2,0,TAU);ctx.stroke();}}
        else if(this.kind==='neon'){ctx.rotate(this.timer*.006);for(var neh=0;neh<4;neh++){ctx.rotate(TAU/4);ctx.beginPath();ctx.arc(0,0,this.radius*(.28+neh*.14),-.7,.7);ctx.stroke();}}
        else{ctx.rotate(this.timer * .005); for (var i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(this.radius * .62, 0); ctx.stroke(); }}
        ctx.restore();
    };

    var BULLET_DEFAULTS = {
            x: 0, y: 0, angle: 0, speed: 10, damage: 1, friendly: true, color: '#fff', radius: 4,
            life: 120, pierce: 0, bounce: 0, blast: 0, status: '', homing: 0, type: 'orb', knockback: 0,
            sourceId: '', dead: false, age: 0, split: 0, vortex: 0, prism: false, mark: false,
            chrono: false, rift: false, crit: false, returning: false, returnAge: 34, returningHome: false,
            clearsBullets: false, pollen: false, shatterMark: false, starMark: false, hive: 0, harpoon: false, oracleStorm: false,
            nailMark:false, tesla:false, ghost:false, distanceScale:false, resonance:'', moonSplit:false,dawnstar:false,seraph:false,
            paradox:false,paradoxPhase:0,lotus:false,marionette:false,crosswind:false,comet:false,memory:'',
            fragments:0,familyClear:false,incense:false,incenseCloud:0,incenseStatus:'',incensePull:false,eyeBolt:false,trailMax:0,trailModel:'line',trailColor:'',trailDisabled:false,impactParticles:0,
            splitSourceId:'',splitType:'',splitSpeed:0,splitDamageScale:0,splitColor:'',splitColors:null,splitRadius:0,splitHoming:0,splitLife:0,splitPierce:0,
            skyLances:0,skyStatus:'',heavenfall:false,beetleSplit:false,relay:false,relayShifted:false,tripwire:false,
            thunderCloud:false,railhook:false,manaDrain:0,drill:false,prismMoth:false,quake:false,flameTrail:false,
            prismCrit:false,sunshard:false,starVolley:false,graveglass:false,classTracer:false,pointBlankBonus:false,
            harmless:false,freezeAge:0,resumeAge:0,frozen:false,savedVx:0,savedVy:0,reverseAge:0,reversed:false,
            curveRate:0,sineAmp:0,sineFreq:0,motionScale:1,generation:0,bossTag:'',heavy:false,visualModelId:'',visualAccent:'',ownerId:'',netId:0,_editorHomingTarget:null
    };
    function Bullet(opts) {
        var ledger=clearHitLedger(this.hitIds);for(var oldKey in this)if(Object.prototype.hasOwnProperty.call(this,oldKey)&&oldKey!=='trailX'&&oldKey!=='trailY'&&oldKey!=='hitIds'&&oldKey!=='_pooled')this[oldKey]=undefined;
        Object.assign(this,BULLET_DEFAULTS,opts||{});if(!this.ownerId&&this.friendly&&player)this.ownerId=player.netId;if(!this.netId)this.netId=netBulletId++;this.hitIds=ledger;if(opts&&opts.hitIds)for(var hitKey in opts.hitIds)if(Object.prototype.hasOwnProperty.call(opts.hitIds,hitKey))ledger[hitKey]=opts.hitIds[hitKey];
        this.vx = Math.cos(this.angle) * this.speed; this.vy = Math.sin(this.angle) * this.speed;this.motionBaseAngle=this.angle;
        this.startX = this.x; this.startY = this.y;if(!this.trailX){this.trailX=new Float32Array(12);this.trailY=new Float32Array(12);}this.trailHead=0;this.trailCount=0;this.trailClock=0;this._pooled=false;
    }
    function spawnBullet(opts){var b=bulletPool.pop();if(b)poolStats.bulletReused++;else{b=Object.create(Bullet.prototype);poolStats.bulletCreated++;}Bullet.call(b,opts);return b;}
    Bullet.prototype.update = function (step) {
        var bulletPrimary=player,bulletOwner=this.ownerId&&playerByNetId(this.ownerId);if(bulletOwner)player=bulletOwner;try{
        this.age += step; this.life -= step;
        var lifecycleWeapon=WEAPON_DEFS[this.sourceId]||null,lifecycleManaged=!!(lifecycleWeapon&&lifecycleWeapon.editorBlueprintManaged);if(lifecycleManaged&&weaponHasHook(lifecycleWeapon,'onProjectileUpdate'))runWeaponHooks(lifecycleWeapon,'onProjectileUpdate',{player:player,weapon:lifecycleWeapon,bullet:this,step:step,api:WEAPON_API});
        if(!lifecycleManaged){
        if(this.flameTrail&&this.friendly&&intervalElapsed(this,'flameTrailClock',step,9)){var wake=new TimedField(this.x,this.y,34,'fire',72);wake.damage=Math.max(.7,this.damage*.08);wake.color=this.color;hazards.push(wake);}
        if(this.relay&&!this.relayShifted&&this.age>=20){this.relayShifted=true;var relayStartX=this.x,relayStartY=this.y,relayAngle=Math.atan2(this.vy,this.vx);this.x+=Math.cos(relayAngle)*132;this.y+=Math.sin(relayAngle)*132;this.ghost=true;addBeam(relayStartX,relayStartY,this.x,this.y,this.color,3);addRing(relayStartX,relayStartY,this.color,24,2);addRing(this.x,this.y,'#fff',28,3);}
        if(this.paradox){
            if(this.paradoxPhase===0&&this.age>=20){this.paradoxPhase=1;this.paradoxVX=this.vx;this.paradoxVY=this.vy;this.vx=0;this.vy=0;addRing(this.x,this.y,this.color,22,2);}
            if(this.paradoxPhase===1&&this.age>=27){this.paradoxPhase=2;clearHitLedger(this.hitIds);this.pierce=Math.max(this.pierce,3);this.speed*=1.22;var reverse=Math.atan2(this.paradoxVY,this.paradoxVX)+Math.PI;this.vx=Math.cos(reverse)*this.speed;this.vy=Math.sin(reverse)*this.speed;this.homing=.07;this.damage*=.72;this.color='#f5d9ff';addRing(this.x,this.y,'#fff',35,3);}
        }
        }
        if (!this.trailDisabled&&intervalElapsed(this,'trailClock',step,this.friendly?effectQualityProfile().trailPeriod:3.2)) {
            var trailMax=this.trailMax||((this.vortex||this.chrono)?effectQualityProfile().trailMax:this.friendly?effectQualityProfile().trailMax:3);this.trailX[this.trailHead]=this.x;this.trailY[this.trailHead]=this.y;this.trailHead=(this.trailHead+1)%12;this.trailCount=Math.min(Math.min(12,trailMax),this.trailCount+1);
        }
        if (this.returning && (this.age >= this.returnAge || this.returningHome)) {
            if (!this.returningHome) { this.returningHome = true; clearHitLedger(this.hitIds); addRing(this.x, this.y, this.color, 24, 2); }
            var homeAngle = Math.atan2(player.y - this.y, player.x - this.x); var currentAngle = Math.atan2(this.vy, this.vx);
            currentAngle += angleDiff(homeAngle, currentAngle) * frameBlend(.14,step); this.vx = Math.cos(currentAngle) * this.speed * 1.15; this.vy = Math.sin(currentAngle) * this.speed * 1.15;
            if (Math.hypot(this.x-player.x,this.y-player.y) < player.radius+12) { this.dead = true; addParticles(this.x,this.y,this.color,3,1.8); return; }
        }
        if (this.clearsBullets) {
            for (var cb = 0; cb < bullets.length; cb++) { var hostile = bullets[cb]; if (hostile !== this && !hostile.dead && !hostile.friendly && Math.hypot(hostile.x-this.x,hostile.y-this.y) < hostile.radius+this.radius+5) { hostile.dead=true; addParticles(hostile.x,hostile.y,this.color,3,2); } }
        }
        var slow = (!this.friendly && worldSlowTimer > 0) ? worldSlowScale : 1;
        if (this.homing && this.friendly) {
            var target = this._editorHomingTarget&&!this._editorHomingTarget.dead?this._editorHomingTarget:closestEnemy(this.x, this.y, 430, this.hitIds);
            if (target) {
                var desired = Math.atan2(target.y - this.y, target.x - this.x);
                var current = Math.atan2(this.vy, this.vx);
                current += angleDiff(desired, current) * frameBlend(this.homing,step);
                this.vx = Math.cos(current) * this.speed; this.vy = Math.sin(current) * this.speed;
            }
        }
        if (this.vortex) {
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i]; if (e.dead) continue;
                var d = Math.hypot(e.x - this.x, e.y - this.y);
                if (d < this.vortex) { var a = Math.atan2(this.y - e.y, this.x - e.x); e.x += Math.cos(a) * (1 - d / this.vortex) * 1.5 * step; e.y += Math.sin(a) * (1 - d / this.vortex) * 1.5 * step; }
            }
        }
        if(this.freezeAge>0&&!this.frozen&&this.age>=this.freezeAge){this.frozen=true;this.savedVx=this.vx;this.savedVy=this.vy;this.vx=0;this.vy=0;addRing(this.x,this.y,this.color,18+this.radius,2);}
        if(this.frozen&&this.resumeAge>0&&this.age>=this.resumeAge){this.frozen=false;this.vx=this.savedVx;this.vy=this.savedVy;this.freezeAge=0;addRing(this.x,this.y,'#fff',24+this.radius,3);}
        if(this.reverseAge>0&&!this.reversed&&this.age>=this.reverseAge){this.reversed=true;if(this.frozen){this.savedVx*=-1;this.savedVy*=-1;}else{this.vx*=-1;this.vy*=-1;}clearHitLedger(this.hitIds);addRing(this.x,this.y,'#fff',22+this.radius,2);}
        if(!this.frozen&&this.sineAmp){var sineAngle=this.motionBaseAngle+Math.sin(this.age*(this.sineFreq||.1))*this.sineAmp;this.vx=Math.cos(sineAngle)*this.speed;this.vy=Math.sin(sineAngle)*this.speed;}
        if(!this.frozen&&this.curveRate){var curved=Math.atan2(this.vy,this.vx)+this.curveRate*step,curveSpeed=Math.hypot(this.vx,this.vy)||this.speed;this.vx=Math.cos(curved)*curveSpeed;this.vy=Math.sin(curved)*curveSpeed;}
        var motionScale=isFinite(this.motionScale)?Math.max(0,this.motionScale):1;this.x += this.vx * step * slow * motionScale; this.y += this.vy * step * slow * motionScale;
        if (this.life <= 0 || Math.abs(this.x) > WORLD_LIMIT + 500 || Math.abs(this.y) > WORLD_LIMIT + 500) { this.expire(); return; }

        if(!this.ghost)for (var oi = 0; oi < obstacles.length; oi++) {
            var o = obstacles[oi],contact=obstacleContact(this.x,this.y,this.radius,o);
            if (contact) {
                playSound('hit.wall', { x: this.x, y: this.y });
                if (this.bounce > 0) {
                    var nx=contact.nx,ny=contact.ny;
                    var dot = this.vx * nx + this.vy * ny;
                    this.vx -= 2 * dot * nx; this.vy -= 2 * dot * ny; this.bounce--; this.damage *= 1.12;
                    this.x+=nx*(contact.overlap+2);this.y+=ny*(contact.overlap+2);
                    addParticles(this.x, this.y, this.color, 3, 2);
                    if(lifecycleManaged&&weaponHasHook(lifecycleWeapon,'onProjectileBounce'))runWeaponHooks(lifecycleWeapon,'onProjectileBounce',{player:player,weapon:lifecycleWeapon,bullet:this,step:step,api:WEAPON_API});else if(this.beetleSplit){this.beetleSplit=false;var baseAngle=Math.atan2(this.vy,this.vx);for(var beetleWing=-1;beetleWing<=1;beetleWing+=2)bullets.push(spawnBullet({x:this.x,y:this.y,angle:baseAngle+beetleWing*.48,speed:this.speed*1.12,damage:this.damage*.48,friendly:true,color:'#d9ffe8',sourceId:'beetleWing',type:'beetleWing',radius:4,life:72,pierce:1,homing:.025,ghost:true}));addRing(this.x,this.y,this.color,42,3);}
                } else if (this.returning) { this.returningHome = true; clearHitLedger(this.hitIds); this.vx *= -.7; this.vy *= -.7; }
                else { this.expire(); }
                break;
            }
        }
        }finally{player=bulletPrimary;}
    };
    Bullet.prototype.expire = function () {
        if (this.dead) return;
        var expirePrimary=player,expireOwner=this.ownerId&&playerByNetId(this.ownerId);if(expireOwner)player=expireOwner;try{
        this.dead = true;
        if (this.blast) explode(this.x, this.y, this.blast, this.damage, this.friendly, this.color, this.status, this.chrono);
        var expireWeapon=WEAPON_DEFS[this.sourceId]||null,expireManaged=!!(expireWeapon&&expireWeapon.editorBlueprintManaged);if(!expireManaged){
        if(this.quake&&this.friendly){explode(this.x,this.y,(this.blast||80)*1.45,this.damage*.5,true,'#c9eeff','shock',true);addRing(this.x,this.y,'#fff',(this.blast||80)*1.6,8);}
        if(this.incense&&this.friendly){var smoke=new TimedField(this.x,this.y,this.incenseCloud||42,'incense',190);smoke.damage=Math.max(.55,this.damage*.13);smoke.color=this.color;smoke.status=this.incenseStatus||'';smoke.pull=!!this.incensePull;hazards.push(smoke);addRing(this.x,this.y,this.color,this.incenseCloud||42,3);}
        if(this.fragments&&this.friendly){for(var frag=0;frag<this.fragments;frag++){var fra=frag*TAU/this.fragments+rand(-.08,.08);bullets.push(spawnBullet({x:this.x,y:this.y,angle:fra,speed:this.familyClear?15:11,damage:this.damage*(this.familyClear ? .34 : .26),friendly:true,color:frag%2?'#fff4b0':this.color,sourceId:'solarFragment',type:'sunRay',radius:this.familyClear?5:4,life:this.familyClear?82:62,pierce:this.familyClear?2:1,homing:this.familyClear ? .065 : 0,ghost:!!this.familyClear,clearsBullets:!!this.familyClear}));}addRing(this.x,this.y,'#fff4b0',(this.blast||60)+28,4);}
        if(this.dawnstar&&this.friendly){for(var sun=0;sun<8;sun++){var sa=sun*TAU/8;bullets.push(spawnBullet({x:this.x,y:this.y,angle:sa,speed:17,damage:this.damage*.38,friendly:true,color:sun%2?'#ffd75e':'#fff8c7',sourceId:'dawnRay',type:'sunRay',radius:5,life:72,pierce:3,ghost:true,clearsBullets:true}));}hazards.push(new TimedField(this.x,this.y,108,'light',180));addRing(this.x,this.y,'#fff',138,7);addRing(this.x,this.y,'#f1c40f',88,12);addParticles(this.x,this.y,'#fff4b0',22,6);}
        if(this.tripwire&&this.friendly)plantTripwire(this.x,this.y,this.damage*.78,this.color);
        if(this.thunderCloud&&this.friendly){var cloud=new TimedField(this.x,this.y,104,'thunderCloud',210);cloud.damage=Math.max(1.4,this.damage*.32);cloud.color=this.color;hazards.push(cloud);addRing(this.x,this.y,'#dff8ff',104,4);}
        if(this.lotus&&this.friendly){var bud=new TimedField(this.x,this.y,72,'lotusBud',118);bud.damage=this.damage;bud.color=this.color;hazards.push(bud);addRing(this.x,this.y,'#ffd8f1',40,3);}
        if (this.hive && this.friendly) {
            for (var hw=0;hw<this.hive;hw++) { var ha=hw*TAU/this.hive+rand(-.18,.18); bullets.push(spawnBullet({x:this.x,y:this.y,angle:ha,speed:9,damage:this.damage*.34,friendly:true,color:'#ffe66d',sourceId:'hiveWasp',type:'wasp',radius:4,homing:.09,life:95,hitIds:Object.assign({},this.hitIds)})); }
            addRing(this.x,this.y,'#f6b93b',48,3);addParticles(this.x,this.y,'#ffe66d',10,3);
        }
        }if(expireWeapon&&weaponHasHook(expireWeapon,'onProjectileExpire'))runWeaponHooks(expireWeapon,'onProjectileExpire',{player:player,weapon:expireWeapon,bullet:this,api:WEAPON_API});
        }finally{player=expirePrimary;}
    };
    Bullet.prototype.draw = function () {
        var projectileRenderer=PROJECTILE_RENDERERS[this.sourceId],weaponDef=WEAPON_DEFS[this.sourceId],usesIdentityProfile=typeof projectileRenderer!=='function'||weaponDef&&weaponDef.editorAutoProjectileIdentity,visualProfile=this.friendly&&usesIdentityProfile&&VISUALS&&typeof VISUALS.weaponProjectileProfile==='function'?VISUALS.weaponProjectileProfile(this.sourceId,this):null;
        var trailModel=this.trailModel==='line'&&visualProfile&&visualProfile.trailModel?visualProfile.trailModel:this.trailModel,trailColor=this.trailColor||(visualProfile&&visualProfile.trailColor)||this.color;
        if (!this.trailDisabled&&trailModel!=='none'&&this.trailCount > 1) {
            ctx.save(); ctx.strokeStyle = trailColor;ctx.fillStyle=trailColor; ctx.lineCap = 'round';
            for (var ti = 1; ti < this.trailCount; ti++) {
                var oldIndex=(this.trailHead-this.trailCount+ti-1+24)%12,newIndex=(oldIndex+1)%12;ctx.globalAlpha = ti / this.trailCount * (this.vortex || this.chrono ? .38 : trailModel==='ribbon'?.34:.24);ctx.lineWidth = Math.max(1, this.radius * ti / this.trailCount * (trailModel==='ribbon'?2.1:1.25));
                if(trailModel==='embers'){ctx.fillRect(this.trailX[newIndex]-1.5,this.trailY[newIndex]-1.5,3,3);}else if(trailModel==='mist'){ctx.beginPath();ctx.arc(this.trailX[newIndex],this.trailY[newIndex],Math.max(2,this.radius*(1-ti/this.trailCount*.5)),0,TAU);ctx.fill();}else{ctx.beginPath(); ctx.moveTo(this.trailX[oldIndex],this.trailY[oldIndex]);ctx.lineTo(this.trailX[newIndex],this.trailY[newIndex]);ctx.stroke();}
            }
            ctx.restore();
        }
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(Math.atan2(this.vy, this.vx));
        ctx.shadowBlur = this.vortex || this.chrono ? 15 : 6; ctx.shadowColor = this.color; ctx.fillStyle = this.color; ctx.strokeStyle = this.color; ctx.lineWidth = 2;
        if(this.resonance){ctx.save();ctx.rotate(-Math.atan2(this.vy,this.vx)+visualTick*.035);ctx.globalAlpha=.42;ctx.strokeStyle=this.resonance==='GOLD SCRIPT'?'#ffd45a':this.resonance==='WHITEOUT'?'#dff7ff':this.resonance==='WILDBLOOM'?'#6fe38b':this.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,this.radius+6+Math.sin(visualTick*.1)*2,0,TAU);ctx.stroke();for(var rb=0;rb<3;rb++){ctx.rotate(TAU/3);ctx.fillStyle=ctx.strokeStyle;ctx.fillRect(this.radius+7,-1,4,2);}ctx.restore();}
        if(this.visualModelId&&VISUALS&&PROJECTILE_MODELS[this.visualModelId]){VISUALS.projectile(ctx,this.visualModelId,{projectile:this,color:this.color,accent:this.visualAccent||'#fff',radius:this.radius,visualTick:visualTick});}
        else if(typeof projectileRenderer==='function'){projectileRenderer({ctx:ctx,projectile:this,TAU:TAU,visualTick:visualTick,api:WEAPON_API});}
        else if(visualProfile&&VISUALS&&PROJECTILE_MODELS[visualProfile.modelId])VISUALS.projectile(ctx,visualProfile.modelId,{projectile:this,color:this.color,accent:visualProfile.accent||'#fff',radius:this.radius,scale:visualProfile.scale||1,visualTick:visualTick});
        else if(VISUALS&&typeof VISUALS.legacyProjectile==='function')VISUALS.legacyProjectile(ctx,this.type,{projectile:this,visualTick:visualTick});
        else{ctx.beginPath();ctx.arc(0,0,this.radius,0,TAU);ctx.fill();}
        var projectileOverlay=PROJECTILE_OVERLAYS[this.sourceId];if(typeof projectileOverlay==='function')projectileOverlay({ctx:ctx,projectile:this,TAU:TAU,visualTick:visualTick,api:WEAPON_API});
        ctx.restore();
    };

    var SLASH_DEFAULTS={x:0,y:0,angle:0,radius:80,arc:1.5,damage:5,color:'#fff',life:13,maxLife:13,deflect:false,knockback:2,status:'',friendly:true,dead:false,stun:0,sourceId:'',manaOnDeflect:0,chronoMark:false,ownerId:'',netId:0};
    function Slash(opts) {
        var ledger=clearHitLedger(this.hitIds);for(var oldKey in this)if(Object.prototype.hasOwnProperty.call(this,oldKey)&&oldKey!=='hitIds'&&oldKey!=='_pooled')this[oldKey]=undefined;Object.assign(this,SLASH_DEFAULTS,opts||{});if(!this.ownerId&&this.friendly&&player)this.ownerId=player.netId;if(!this.netId)this.netId=netSlashId++;this.hitIds=ledger;if(opts&&opts.hitIds)for(var hitKey in opts.hitIds)if(Object.prototype.hasOwnProperty.call(opts.hitIds,hitKey))ledger[hitKey]=opts.hitIds[hitKey];this._pooled=false;
    }
    function spawnSlash(opts){var s=slashPool.pop();if(s)poolStats.slashReused++;else{s=Object.create(Slash.prototype);poolStats.slashCreated++;}Slash.call(s,opts);return s;}
    Slash.prototype.update = function (step) {
        this.life -= step;
        if (this.life <= 0) { this.dead = true; return; }
        var slashPrimary=player,slashOwner=this.ownerId&&playerByNetId(this.ownerId);if(slashOwner)player=slashOwner;try{
        if (this.friendly) {
            for (var pi = 0; pi < biomeProps.length; pi++) {
                var prop = biomeProps[pi], propKey = 'p' + prop.id;
                if (prop.dead || this.hitIds[propKey]) continue;
                var pd = Math.hypot(prop.x - this.x, prop.y - this.y);
                var pa = Math.atan2(prop.y - this.y, prop.x - this.x);
                if (pd < this.radius + prop.radius && Math.abs(angleDiff(pa, this.angle)) < this.arc / 2) {
                    this.hitIds[propKey] = true;
                    hitBiomeProp(prop, this);
                }
            }
            for (var i = 0; i < enemies.length; i++) {
                var e = enemies[i]; if (e.dead || this.hitIds[e.id]) continue;
                var d = Math.hypot(e.x - this.x, e.y - this.y);
                var a = Math.atan2(e.y - this.y, e.x - this.x);
                if (d < this.radius + e.radius && Math.abs(angleDiff(a, this.angle)) < this.arc / 2) {
                    this.hitIds[e.id] = true; damageEnemy(e, this.damage, { status: this.status, knockback: this.knockback, angle: a, stun: this.stun, direct: true });if(this.chronoMark&&!e.dead){e.chronoMarks=(e.chronoMarks||0)+1;e.chronoMarkTime=300;addFloat(e.chronoMarks+'/4 TICKS',e.x,e.y-e.radius-22,'#e6ca6b');if(e.chronoMarks>=4){e.chronoMarks=0;e.chronoMarkTime=0;e.freeze=Math.max(e.freeze,150);e.stun=Math.max(e.stun,45);explode(e.x,e.y,82,this.damage*.65,true,'#e6ca6b','shock',true);addFloat('TIME ARREST',e.x,e.y-42,'#fff1a8');}}if(player.passives.closeQuarters&&!this.closeQuartersProc){this.closeQuartersProc=true;player.armor=Math.min(player.maxArmor,player.armor+.35);player.armorRegenDelay=Math.max(0,player.armorRegenDelay-180);addFloat('+ARMOR TEMPO',player.x,player.y-38,'#bfe5f2');}
                }
            }
            if (this.deflect) {
                for (var bi = 0; bi < bullets.length; bi++) {
                    var b = bullets[bi]; if (b.dead || b.friendly) continue;
                    var bd = Math.hypot(b.x - this.x, b.y - this.y); var ba = Math.atan2(b.y - this.y, b.x - this.x);
                    if (bd < this.radius && Math.abs(angleDiff(ba, this.angle)) < this.arc / 2) {
                        b.friendly = true; b.damage = Math.max(2, b.damage * 2); b.color = this.color; b.vx *= -1.35; b.vy *= -1.35;if(this.manaOnDeflect){player.mana=Math.min(player.maxMana,player.mana+this.manaOnDeflect);addFloat('+'+fmt(this.manaOnDeflect)+' MANA',player.x,player.y-34,'#8edbff');}
                    }
                }
            }
        }
        }finally{player=slashPrimary;}
    };
    Slash.prototype.draw = function () {
        var t = this.life / this.maxLife;
        ctx.save(); ctx.globalAlpha = Math.sin(t * Math.PI); ctx.strokeStyle = this.color; ctx.lineCap='round';
        var slashRenderer=SLASH_RENDERERS[this.sourceId];
        if(typeof slashRenderer==='function')slashRenderer({ctx:ctx,slash:this,t:t,TAU:TAU,api:WEAPON_API});
        else{
            ctx.lineWidth=7;ctx.beginPath();ctx.arc(this.x,this.y,this.radius*(1-t*.12),this.angle-this.arc/2,this.angle+this.arc/2);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.stroke();
        }
        ctx.restore();
    };

    function SunlionHunt(w,angle){
        this.x=player.x+Math.cos(angle)*24;this.y=player.y+Math.sin(angle)*24;this.radius=78;this.dead=false;this.age=0;this.state='seek';this.angle=angle;this.spin=0;this.dwell=0;this.strikeClock=0;this.visited={};this.visitedCount=0;this.returnHits={};this.damage=w.damage*weaponLevelScale(w)*player.damageMultiplier();this.color=w.color;this.targetId=0;this.ownerId=player.netId;this.netId=netRadiantId++;this.ghostX=player.x+Math.cos(angle)*440;this.ghostY=player.y+Math.sin(angle)*440;this.trailX=new Float32Array(14);this.trailY=new Float32Array(14);this.trailHead=0;this.trailCount=0;this.trailClock=0;this.markX=new Float32Array(7);this.markY=new Float32Array(7);this.markCount=0;this.roared=false;this.maxTargets=7;this.chooseTarget();
    }
    SunlionHunt.prototype.getTarget=function(){for(var i=0;i<enemies.length;i++)if(enemies[i].id===this.targetId&&!enemies[i].dead)return enemies[i];return null;};
    SunlionHunt.prototype.chooseTarget=function(){var target=closestEnemy(this.x,this.y,1120,this.visited);if(target){this.targetId=target.id;this.state='seek';return true;}this.targetId=0;if(this.visitedCount===0)this.state='outbound';else this.state='return';return false;};
    SunlionHunt.prototype.strike=function(target,arrival){
        if(!target||target.dead)return;var a=Math.atan2(target.y-this.y,target.x-this.x)+this.spin;slashes.push(spawnSlash({x:target.x,y:target.y,angle:a,radius:88,arc:2.7,damage:this.damage*(arrival ? .72 : .3),color:arrival?'#fff0b5':this.color,deflect:true,knockback:arrival?5:3,status:'',sourceId:'sunlionCenser',life:15,maxLife:15}));addRing(target.x,target.y,arrival?'#fff0b5':this.color,arrival?82:55,arrival?6:3);if(arrival){addDataEffect(target.x,target.y,{modelId:'slashStorm',color:this.color,accent:'#fff0b5',size:92,count:5,durationFrames:14,width:3},a);addDataEffect(target.x,target.y,{modelId:'constellation',color:'#fff0b5',accent:this.color,size:70,count:7,durationFrames:18,width:2},a);}addParticles(target.x,target.y,this.color,arrival?12:5,arrival?4.8:2.6);
    };
    SunlionHunt.prototype.update=function(step){
        var huntPrimary=player,huntOwner=this.ownerId&&playerByNetId(this.ownerId);if(huntOwner)player=huntOwner;try{
        if(this.dead)return;this.age+=step;this.spin+=.28*step;if(intervalElapsed(this,'trailClock',step,1.5)){this.trailX[this.trailHead]=this.x;this.trailY[this.trailHead]=this.y;this.trailHead=(this.trailHead+1)%14;this.trailCount=Math.min(14,this.trailCount+1);}
        if(this.state==='seek'){
            var target=this.getTarget();if(!target){this.chooseTarget();return;}var a=Math.atan2(target.y-this.y,target.x-this.x),d=Math.hypot(target.x-this.x,target.y-this.y),speed=Math.min(36,18+d*.05);this.angle=a;this.x+=Math.cos(a)*speed*step;this.y+=Math.sin(a)*speed*step;if(d<speed*step+target.radius+10){this.visited[target.id]=true;this.visitedCount++;this.markX[this.markCount]=target.x;this.markY[this.markCount]=target.y;this.markCount=Math.min(7,this.markCount+1);this.state='orbit';this.dwell=0;this.strikeClock=0;this.strike(target,true);if(this.visitedCount===4&&!this.roared){this.roared=true;for(var roar=0;roar<enemies.length;roar++){var prey=enemies[roar],rd=Math.hypot(prey.x-this.x,prey.y-this.y);if(!prey.dead&&rd<300){damageEnemy(prey,this.damage*.34,{status:'shock',direct:true,knockback:7,angle:Math.atan2(prey.y-this.y,prey.x-this.x)});prey.stun=Math.max(prey.stun,28);}}addRing(this.x,this.y,'#fff0b5',320,12);addDataEffect(this.x,this.y,{modelId:'burst',color:this.color,accent:'#fff0b5',size:320,count:14,durationFrames:24,width:6},0);addDataEffect(this.x,this.y,{modelId:'constellation',color:'#fff0b5',accent:this.color,size:230,count:12,durationFrames:28,width:2},0);addFloat('ROYAL ROAR',this.x,this.y-58,this.color);}}
        }else if(this.state==='orbit'){
            var orbitTarget=this.getTarget();if(!orbitTarget){if(this.visitedCount<this.maxTargets)this.chooseTarget();else this.state='return';return;}this.dwell+=step;this.strikeClock+=step;var orbitA=this.spin+this.visitedCount*.9,orbitR=orbitTarget.radius+38;this.x=orbitTarget.x+Math.cos(orbitA)*orbitR;this.y=orbitTarget.y+Math.sin(orbitA)*orbitR;this.angle=orbitA+Math.PI/2;while(this.strikeClock>=7){this.strikeClock-=7;this.strike(orbitTarget,false);}if(this.dwell>=20){if(this.visitedCount<this.maxTargets)this.chooseTarget();else this.state='return';}
        }else if(this.state==='outbound'){
            var ga=Math.atan2(this.ghostY-this.y,this.ghostX-this.x),gd=Math.hypot(this.ghostX-this.x,this.ghostY-this.y);this.angle=ga;this.x+=Math.cos(ga)*25*step;this.y+=Math.sin(ga)*25*step;if(gd<28||this.age>32){addRing(this.x,this.y,this.color,78,5);this.state='return';}
        }else{
            var ha=Math.atan2(player.y-this.y,player.x-this.x),hd=Math.hypot(player.x-this.x,player.y-this.y);this.angle=ha;this.x+=Math.cos(ha)*34*step;this.y+=Math.sin(ha)*34*step;for(var b=0;b<bullets.length;b++){var hostile=bullets[b];if(!hostile.dead&&!hostile.friendly&&Math.hypot(hostile.x-this.x,hostile.y-this.y)<hostile.radius+60){hostile.dead=true;addParticles(hostile.x,hostile.y,this.color,3,2);}}for(var e=0;e<enemies.length;e++){var foe=enemies[e];if(foe.dead||this.returnHits[foe.id])continue;if(Math.hypot(foe.x-this.x,foe.y-this.y)<foe.radius+50){this.returnHits[foe.id]=true;damageEnemy(foe,this.damage*.48,{direct:true,knockback:5,angle:ha});addRing(foe.x,foe.y,this.color,44,3);}}if(hd<player.radius+34){this.dead=true;player.armor=Math.min(player.maxArmor,player.armor+1.5);player.mana=Math.min(player.maxMana,player.mana+12);addFloat('+1.5 ARMOR · +12 MANA',player.x,player.y-38,'#fff0b5');addRing(player.x,player.y,'#fff0b5',98,8);addDataEffect(player.x,player.y,{modelId:'constellation',color:this.color,accent:'#fff0b5',size:150,count:Math.max(7,this.markCount),durationFrames:28,width:3},0);addDataEffect(player.x,player.y,{modelId:'rune',color:'#fff0b5',accent:this.color,size:112,count:8,durationFrames:22,width:3},0);addParticles(player.x,player.y,this.color,18,5);updateHUD();}
        }
        if(this.age>260)this.dead=true;
        }finally{player=huntPrimary;}
    };
    SunlionHunt.prototype.draw=function(){
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';if(runtimeSettings.effectQuality!=='low'&&this.markCount>1){ctx.globalAlpha=.22;ctx.strokeStyle='#fff0b5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(this.markX[0],this.markY[0]);for(var mark=1;mark<this.markCount;mark++)ctx.lineTo(this.markX[mark],this.markY[mark]);ctx.lineTo(this.x,this.y);ctx.stroke();for(var star=0;star<this.markCount;star++){ctx.globalAlpha=.5;ctx.fillStyle=star%2?this.color:'#fff0b5';ctx.beginPath();ctx.arc(this.markX[star],this.markY[star],3+star%2,0,TAU);ctx.fill();}}for(var t=1;t<this.trailCount;t++){var old=(this.trailHead-this.trailCount+t-1+28)%14,next=(old+1)%14;ctx.globalAlpha=t/this.trailCount*.38;ctx.strokeStyle=t%2?'#fff0b5':this.color;ctx.lineWidth=2+t*.55;ctx.beginPath();ctx.moveTo(this.trailX[old],this.trailY[old]);ctx.lineTo(this.trailX[next],this.trailY[next]);ctx.stroke();}ctx.globalAlpha=.9;ctx.translate(this.x,this.y);ctx.rotate(this.angle);ctx.save();ctx.rotate(this.spin*.22);ctx.strokeStyle=this.color;ctx.lineWidth=4;for(var mane=0;mane<14;mane++){ctx.rotate(TAU/14);ctx.beginPath();ctx.moveTo(22,-5);ctx.lineTo(38,0);ctx.lineTo(22,5);ctx.stroke();}ctx.restore();ctx.fillStyle='#9a4f22';ctx.strokeStyle='#fff0b5';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(25,0);ctx.lineTo(11,-16);ctx.lineTo(-5,-19);ctx.lineTo(-20,-11);ctx.lineTo(-24,0);ctx.lineTo(-20,11);ctx.lineTo(-5,19);ctx.lineTo(11,16);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff9d8';ctx.beginPath();ctx.moveTo(21,0);ctx.lineTo(8,-9);ctx.lineTo(-10,-10);ctx.lineTo(-18,0);ctx.lineTo(-10,10);ctx.lineTo(8,9);ctx.closePath();ctx.fill();ctx.fillStyle='#5b3a08';ctx.beginPath();ctx.arc(6,-4,2.8,0,TAU);ctx.arc(6,4,2.8,0,TAU);ctx.fill();ctx.strokeStyle='#5b3a08';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-1,0);ctx.lineTo(9,0);ctx.lineTo(15,-6);ctx.moveTo(9,0);ctx.lineTo(15,6);ctx.stroke();ctx.restore();
    };

    function explode(x, y, radius, damage, friendly, color, status, chrono) {
        var expSound = radius > 180 ? 'explosion.large' : radius > 90 ? 'explosion.medium' : 'explosion.small';
        playSound(expSound, { x: x, y: y });
        addRing(x, y, color, radius, 6); addParticles(x, y, color, 13, 5);
        if (friendly) {
            enemies.forEach(function (e) {
                var d = Math.hypot(e.x - x, e.y - y);
                if (!e.dead && d < radius + e.radius) damageEnemy(e, damage * (1 - d / (radius * 2.1)), { status: status, knockback: 3, angle: Math.atan2(e.y - y, e.x - x), direct: true, chrono: chrono });
            });
            if (chrono) hazards.push(new TimedField(x, y, radius, 'chrono', 250));
        } else partyPlayers().forEach(function(member){if(!member.downed&&member.hp>0&&Math.hypot(member.x-x,member.y-y)<radius+member.radius)withActivePlayer(member,function(){member.hit(damage,'blast');});});
    }

    function pointSegmentDistance(px,py,x1,y1,x2,y2){var vx=x2-x1,vy=y2-y1,lenSq=vx*vx+vy*vy;if(lenSq<.001)return Math.hypot(px-x1,py-y1);var t=clamp(((px-x1)*vx+(py-y1)*vy)/lenSq,0,1),qx=x1+vx*t,qy=y1+vy*t;return Math.hypot(px-qx,py-qy);}
    function plantTripwire(x,y,damage,color){var anchor=player.tripwireAnchor;if(!anchor||gameTimeMs-anchor.time>8000){player.tripwireAnchor={x:x,y:y,time:gameTimeMs};addRing(x,y,color,34,3);addFloat('FIRST PIN',x,y-26,color);return;}var d=Math.hypot(x-anchor.x,y-anchor.y);if(d<60){player.tripwireAnchor={x:x,y:y,time:gameTimeMs};return;}var wire=new TimedField((anchor.x+x)*.5,(anchor.y+y)*.5,d*.5+18,'tripwire',360);wire.x1=anchor.x;wire.y1=anchor.y;wire.x2=x;wire.y2=y;wire.damage=damage;wire.color=color;hazards.push(wire);player.tripwireAnchor=null;addBeam(anchor.x,anchor.y,x,y,color,4);addFloat('WIRE SET',wire.x,wire.y-24,color);}
    function TimedField(x, y, radius, kind, life) { this.x = x; this.y = y; this.radius = radius; this.kind = kind; this.life = life; this.timer = 0; this.dead = false; this.ownerId=player&&player.netId||'';this.netId=netFieldId++; }
    TimedField.prototype.update = function (step) {
        var fieldPrimary=player,fieldOwner=this.ownerId&&playerByNetId(this.ownerId);if(fieldOwner)player=fieldOwner;try{
        this.life -= step; this.timer += step; if (this.life <= 0) this.dead = true;
        if (this.kind === 'chrono') {
            enemies.forEach(function (e) { if (!e.dead && Math.hypot(e.x - this.x, e.y - this.y) < this.radius) e.fieldSlow = .42; }, this);
            var chronoDrag=frameDecay(.985,step);bullets.forEach(function (b) { if (!b.friendly && Math.hypot(b.x - this.x, b.y - this.y) < this.radius) { b.vx *= chronoDrag; b.vy *= chronoDrag; } }, this);
        } else if (this.kind === 'fire' && this.timer % 28 < step) {
            enemies.forEach(function (e) { if (!e.dead && Math.hypot(e.x - this.x, e.y - this.y) < this.radius) damageEnemy(e, 1.2, { status: 'burn', direct: false }); }, this);
        } else if (this.kind === 'singularity') {
            enemies.forEach(function (e) {
                var d = Math.hypot(e.x - this.x, e.y - this.y); if (e.dead || d >= this.radius * 1.8) return;
                var a = Math.atan2(this.y - e.y, this.x - e.x); e.x += Math.cos(a) * 1.35 * step; e.y += Math.sin(a) * 1.35 * step;
                if (this.timer % 22 < step && d < this.radius) damageEnemy(e, 3.2, { status: 'rift', direct: false });
            }, this);
            bullets.forEach(function(b){if(!b.friendly&&!b.dead&&Math.hypot(b.x-this.x,b.y-this.y)<this.radius*1.3){var ba=Math.atan2(this.y-b.y,this.x-b.x);b.vx+=Math.cos(ba)*.32*step;b.vy+=Math.sin(ba)*.32*step;if(Math.hypot(b.x-this.x,b.y-this.y)<24)b.dead=true;}},this);
        } else if (this.kind === 'frostZone') {
            partyPlayers().forEach(function(member){if(!member.downed&&Math.hypot(member.x-this.x,member.y-this.y)<this.radius)member.terrainSlow=Math.min(member.terrainSlow,.62);},this);
            var frostDrag=frameDecay(.986,step);bullets.forEach(function(b){if(!b.dead&&Math.hypot(b.x-this.x,b.y-this.y)<this.radius){b.vx*=frostDrag;b.vy*=frostDrag;}},this);
        } else if (this.kind === 'rootBloom') {
            if(this.timer%40<step)enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<this.radius)damageEnemy(e,1.5,{direct:false,silent:true});},this);
        } else if (this.kind === 'rootTrap') {
            if(this.timer>=48)partyPlayers().forEach(function(member){if(!member.downed&&Math.hypot(member.x-this.x,member.y-this.y)<this.radius){member.terrainSlow=Math.min(member.terrainSlow,.42);if(this.timer%60<step)withActivePlayer(member,function(){member.hit(1,'root snare');});}},this);
            if(this.timer>=48&&this.timer-step<48)enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<this.radius)e.stun=Math.max(e.stun,38);},this);
        } else if(this.kind==='poisonBloom') {
            if(this.timer%36<step)enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<this.radius)damageEnemy(e,1.8*player.damageMultiplier(),{status:'poison',direct:false,silent:true});},this);
        } else if(this.kind==='incense') {
            if(this.timer%24<step)enemies.forEach(function(e){var d=Math.hypot(e.x-this.x,e.y-this.y);if(e.dead||d>=this.radius)return;if(this.pull){var a=Math.atan2(this.y-e.y,this.x-e.x);e.x+=Math.cos(a)*1.4*step;e.y+=Math.sin(a)*1.4*step;}damageEnemy(e,this.damage||.7,{status:this.status||'',direct:false,silent:true});},this);
        } else if(this.kind==='sandTailwind') {
            partyPlayers().forEach(function(member){if(!member.downed&&Math.hypot(member.x-this.x,member.y-this.y)<this.radius){member.terrainSlow=Math.max(member.terrainSlow,1.12);member.mana=Math.min(member.maxMana,member.mana+.025*step);}},this);var tailwind=frameDecay(1.002,step);bullets.forEach(function(b){if(!b.dead&&b.friendly&&Math.hypot(b.x-this.x,b.y-this.y)<this.radius){b.vx*=tailwind;b.vy*=tailwind;}},this);
        } else if(this.kind==='bloodBloom') {
            if(this.timer%30<step)enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<this.radius)damageEnemy(e,1.25*player.damageMultiplier(),{status:'curse',direct:false,silent:true});},this);
        } else if(this.kind==='skyCurrent') {
            var skyBoost=frameDecay(1.0015,step);bullets.forEach(function(b){if(!b.dead&&b.friendly&&Math.hypot(b.x-this.x,b.y-this.y)<this.radius){b.homing=Math.max(b.homing||0,.025);b.vx*=skyBoost;b.vy*=skyBoost;}},this);
        } else if(this.kind==='neonPulse') {
            partyPlayers().forEach(function(member){if(!member.downed&&Math.hypot(member.x-this.x,member.y-this.y)<this.radius)member.overclock=Math.max(member.overclock,10);},this);if(this.timer%34<step){var first=closestEnemy(this.x,this.y,this.radius);if(first)chainLightning(this,first,1.2*player.damageMultiplier(),3,this.color||'#48ffd0',false);}
        } else if(this.kind==='light'||this.kind==='starfall') {
            if(this.timer%24<step)enemies.forEach(function(e){if(!e.dead&&Math.hypot(e.x-this.x,e.y-this.y)<this.radius)damageEnemy(e,1.65*player.damageMultiplier(),{direct:false,silent:true});},this);bullets.forEach(function(b){if(!b.dead&&!b.friendly&&Math.hypot(b.x-this.x,b.y-this.y)<this.radius)b.dead=true;},this);
        } else if(this.kind==='enemyFire') {
            if(this.timer%60<step)partyPlayers().forEach(function(member){if(!member.downed&&Math.hypot(member.x-this.x,member.y-this.y)<this.radius)withActivePlayer(member,function(){member.hit(1,'slag trail');});},this);
        } else if(this.kind==='enemySpore') {
            partyPlayers().forEach(function(member){if(!member.downed&&Math.hypot(member.x-this.x,member.y-this.y)<this.radius){member.terrainSlow=Math.min(member.terrainSlow,.6);if(this.timer%75<step)withActivePlayer(member,function(){member.hit(1,'spore mine');});}},this);
        } else if (this.kind === 'aurora') {
            var tethered = null; for (var at=0;at<enemies.length;at++) if (enemies[at].id===this.targetId&&!enemies[at].dead) { tethered=enemies[at];break; }
            if (!tethered) { this.dead=true;return; } this.x=tethered.x;this.y=tethered.y;
            if (this.timer % 30 < step) damageEnemy(tethered,this.damage,{status:'shock',direct:false,silent:true});
        } else if(this.kind==='lotusBud') {
            if(!this.triggered&&this.timer>=38){this.triggered=true;for(var lp=0;lp<12;lp++){var la=lp*TAU/12;bullets.push(spawnBullet({x:this.x+Math.cos(la)*12,y:this.y+Math.sin(la)*12,angle:la,speed:11.5,damage:this.damage*.4,friendly:true,color:lp%2?'#ffd8f1':'#ff79c9',sourceId:'lotusPetal',type:'lotusPetal',radius:5,life:92,pierce:1,homing:.035,ghost:true}));}addRing(this.x,this.y,'#fff',118,7);addParticles(this.x,this.y,this.color||'#ff79c9',18,5);capArray(bullets,720);}
        } else if(this.kind==='undertowAnchor') {
            if(this.timer<48){enemies.forEach(function(e){var d=Math.hypot(e.x-this.x,e.y-this.y);if(e.dead||d>=this.radius*1.45)return;var a=Math.atan2(this.y-e.y,this.x-e.x),pull=(1-d/(this.radius*1.45))*2.4;e.x+=Math.cos(a)*pull*step;e.y+=Math.sin(a)*pull*step;},this);}
            if(!this.triggered&&this.timer>=48){this.triggered=true;explode(this.x,this.y,this.radius,this.damage,true,this.color||'#50d9e8','freeze',false);for(var ub=0;ub<bullets.length;ub++){var hostile=bullets[ub];if(!hostile.dead&&!hostile.friendly&&Math.hypot(hostile.x-this.x,hostile.y-this.y)<this.radius)hostile.dead=true;}addRing(this.x,this.y,'#e6fdff',this.radius+38,9);}
        } else if(this.kind==='tripwire') {
            if(this.timer%18<step)for(var twi=0;twi<enemies.length;twi++){var wireEnemy=enemies[twi];if(!wireEnemy.dead&&pointSegmentDistance(wireEnemy.x,wireEnemy.y,this.x1,this.y1,this.x2,this.y2)<wireEnemy.radius+8)damageEnemy(wireEnemy,this.damage,{status:'shock',direct:false,silent:true,stun:3});}
        } else if(this.kind==='thunderCloud') {
            if(this.timer%32<step){var cloudTarget=closestEnemy(this.x,this.y,this.radius);if(cloudTarget)chainLightning(this,cloudTarget,this.damage,3,this.color||'#69c9ed',true);}
        } else if(this.kind==='graveMound') {
            if(!this.triggered&&this.timer>=42){this.triggered=true;explode(this.x,this.y,this.radius,this.damage,true,this.color||'#8e89a8','curse',false);for(var graveBlade=0;graveBlade<6;graveBlade++){var graveAngle=graveBlade*TAU/6;bullets.push(spawnBullet({x:this.x,y:this.y,angle:graveAngle,speed:11,damage:this.damage*.28,friendly:true,color:graveBlade%2?'#e9e5ff':this.color,sourceId:'graveSpade',type:'graveSpade',radius:5,pierce:1,life:75,ghost:true}));}addRing(this.x,this.y,'#eeeaff',this.radius+36,6);}
        } else if(this.kind==='enemyMine') {
            var armTime=Math.max(72,Number(this.armTime)||78);if(!this.triggered&&this.timer>=armTime){
                this.triggered=true;
                var mine=this,mineRadius=Math.max(48,Number(this.radius)||68),mineDamage=Math.max(1,Number(this.damage)||1.35),mineColor=this.color||'#e9a75d';
                addRing(this.x,this.y,mineColor,mineRadius,7);addParticles(this.x,this.y,mineColor,15,5.5);
                partyPlayers().forEach(function(member){
                    if(member.downed||member.hp<=0)return;
                    var liveDistance=Math.hypot(member.x-mine.x,member.y-mine.y);
                    if(liveDistance<=mineRadius+member.radius)withActivePlayer(member,function(){member.hit(mineDamage,'powder surveyor mine');});
                });
                var escapeTarget=nearestLivingPlayer(this.x,this.y),escapeAngle=escapeTarget?Math.atan2(escapeTarget.y-this.y,escapeTarget.x-this.x):0;
                for(var shard=1;!this.noShards&&shard<6;shard++){
                    var shardAngle=escapeAngle+shard*TAU/6;
                    bullets.push(spawnBullet({x:this.x,y:this.y,angle:shardAngle,speed:5.4,damage:.85,friendly:false,color:mineColor,radius:4,life:92,sourceId:'powderSurveyorMine',type:'slag',ghost:false}));
                }
                capArray(bullets,980);this.dead=true;
            }
        }
        }finally{player=fieldPrimary;}
    };
    TimedField.prototype.draw = function () {
        if (this.kind === 'aurora') {
            var auroraOwner=playerByNetId(this.ownerId)||player;if(!auroraOwner)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#7efff5';ctx.lineCap='round';
            for(var au=0;au<4;au++){ctx.globalAlpha=.18+au*.08;ctx.lineWidth=8-au*1.7;ctx.beginPath();ctx.moveTo(auroraOwner.x,auroraOwner.y);var amx=(auroraOwner.x+this.x)/2,amy=(auroraOwner.y+this.y)/2+Math.sin(visualTick*.09+au)*18;ctx.quadraticCurveTo(amx,amy,this.x,this.y);ctx.stroke();}
            ctx.fillStyle='#eaffff';ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(this.x,this.y,5+Math.sin(visualTick*.14)*2,0,TAU);ctx.fill();ctx.restore();return;
        }
        if(this.kind==='tripwire'){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=this.color||'#83c786';ctx.lineCap='round';ctx.globalAlpha=.35+.35*Math.sin(visualTick*.12);ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(this.x1,this.y1);ctx.lineTo(this.x2,this.y2);ctx.stroke();ctx.globalAlpha=.9;ctx.strokeStyle='#f1fff4';ctx.lineWidth=1.5;ctx.stroke();for(var twd=0;twd<=6;twd++){var twt=twd/6,twx=this.x1+(this.x2-this.x1)*twt,twy=this.y1+(this.y2-this.y1)*twt;ctx.fillStyle=twd%2?'#fff':this.color;ctx.beginPath();ctx.arc(twx,twy,2.5,0,TAU);ctx.fill();}ctx.restore();return;}
        var c = this.kind === 'chrono' ? '#5f27cd' : this.kind === 'fire'||this.kind==='enemyFire' ? '#ff6b35' : this.kind==='frostZone'?'#8edbff':this.kind==='sandTailwind'?'#f1c76b':this.kind==='bloodBloom'?'#ff6b8a':this.kind==='skyCurrent'?'#bdeaff':this.kind==='neonPulse'?'#48ffd0':this.kind==='rootBloom'||this.kind==='rootTrap'?'#6fe38b':this.kind==='poisonBloom'||this.kind==='enemySpore'?'#b6e86b':this.kind==='incense'?(this.color||'#d6b35b'):this.kind==='starfall'?(this.color||'#ac5cdb'):this.kind==='light'?'#f1c40f':this.kind==='lotusBud'?'#ff79c9':this.kind==='undertowAnchor'?'#50d9e8':this.kind==='thunderCloud'?'#69c9ed':this.kind==='graveMound'?'#8e89a8':this.kind==='enemyMine'?'#e9a75d':'#ff4d8d';
        ctx.save(); ctx.globalAlpha = .15 + Math.sin(this.timer * .08) * .06; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, TAU); ctx.fill();
        ctx.globalAlpha = .5; ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius * (.75 + Math.sin(this.timer * .05) * .1), 0, TAU); ctx.stroke();
        ctx.translate(this.x,this.y);if(this.kind==='starfall'){ctx.rotate(-Math.PI/2+visualTick*.008);ctx.strokeStyle='#ead7ff';ctx.lineWidth=4;ctx.beginPath();for(var sf=0;sf<10;sf++){var sfa=sf*TAU/10,sfr=sf%2?this.radius*.32:this.radius*.72;if(!sf)ctx.moveTo(Math.cos(sfa)*sfr,Math.sin(sfa)*sfr);else ctx.lineTo(Math.cos(sfa)*sfr,Math.sin(sfa)*sfr);}ctx.closePath();ctx.stroke();ctx.fillStyle=this.color||'#ac5cdb';ctx.globalAlpha=.45+.25*Math.sin(this.timer*.12);ctx.beginPath();ctx.arc(0,0,10,0,TAU);ctx.fill();}
        else if(this.kind==='frostZone'){ctx.rotate(visualTick*.006);for(var fi=0;fi<8;fi++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(this.radius*.72,0);ctx.moveTo(this.radius*.46,0);ctx.lineTo(this.radius*.58,-10);ctx.moveTo(this.radius*.46,0);ctx.lineTo(this.radius*.58,10);ctx.stroke();}}
        else if(this.kind==='rootBloom'||this.kind==='rootTrap'){ctx.rotate(visualTick*.003);for(var ri=0;ri<9;ri++){ctx.rotate(TAU/9);ctx.beginPath();ctx.moveTo(8,0);ctx.bezierCurveTo(this.radius*.3,-16,this.radius*.48,17,this.radius*.82,0);ctx.stroke();}if(this.kind==='rootTrap'&&this.timer<48){ctx.globalAlpha=.8;ctx.setLineDash([8,7]);ctx.beginPath();ctx.arc(0,0,this.radius,0,TAU);ctx.stroke();ctx.setLineDash([]);}}
        else if(this.kind==='poisonBloom'){ctx.rotate(visualTick*.006);for(var pb=0;pb<12;pb++){ctx.rotate(TAU/12);ctx.beginPath();ctx.arc(this.radius*(.25+(pb%3)*.2),0,3+(pb%2)*2,0,TAU);ctx.stroke();}}
        else if(this.kind==='incense'){ctx.rotate(visualTick*.004);for(var sm=0;sm<9;sm++){ctx.rotate(TAU/9);ctx.beginPath();ctx.arc(this.radius*(.25+(sm%3)*.18),Math.sin(visualTick*.05+sm)*8,5+(sm%2)*3,0,TAU);ctx.stroke();}ctx.globalAlpha=.65;ctx.strokeStyle='#fff6d5';ctx.beginPath();ctx.arc(0,0,8+Math.sin(visualTick*.08)*3,0,TAU);ctx.stroke();}
        else if(this.kind==='sandTailwind'){ctx.rotate(visualTick*.003);for(var du=0;du<7;du++){ctx.rotate(TAU/7);ctx.beginPath();ctx.arc(this.radius*(.38+du%2*.18),0,18+du%3*5,-.7,.7);ctx.stroke();}}
        else if(this.kind==='bloodBloom'){ctx.rotate(visualTick*.004);for(var ro=0;ro<9;ro++){ctx.rotate(TAU/9);ctx.beginPath();ctx.ellipse(this.radius*.48,0,16,6,.2,0,TAU);ctx.stroke();}}
        else if(this.kind==='skyCurrent'){for(var sc=-2;sc<=2;sc++){ctx.beginPath();ctx.moveTo(-this.radius,sc*14);ctx.bezierCurveTo(-this.radius*.3,sc*14-24,this.radius*.3,sc*14+24,this.radius,sc*14);ctx.stroke();}}
        else if(this.kind==='neonPulse'){ctx.rotate(visualTick*.008);for(var ne=0;ne<4;ne++){ctx.rotate(TAU/4);ctx.beginPath();ctx.arc(0,0,this.radius*(.25+ne*.16),-.8,.8);ctx.stroke();}}
        else if(this.kind==='singularity'){ctx.rotate(visualTick*.02);for(var si=0;si<3;si++){ctx.rotate(TAU/3);ctx.beginPath();ctx.ellipse(0,0,this.radius*.67,this.radius*.2,0,0,TAU);ctx.stroke();}ctx.fillStyle='#050207';ctx.beginPath();ctx.arc(0,0,15,0,TAU);ctx.fill();}
        else if(this.kind==='light'){ctx.rotate(visualTick*.009);ctx.fillStyle='#fff8c7';ctx.globalAlpha=.48;for(var lr=0;lr<12;lr++){ctx.rotate(TAU/12);ctx.beginPath();ctx.moveTo(this.radius*.25,-4);ctx.lineTo(this.radius*.82,0);ctx.lineTo(this.radius*.25,4);ctx.closePath();ctx.fill();}ctx.globalAlpha=.8;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,0,this.radius*.42,0,TAU);ctx.stroke();}
        else if(this.kind==='lotusBud'){ctx.rotate(visualTick*.012);var open=clamp(this.timer/38,0,1);ctx.fillStyle='#ffd8f1';ctx.globalAlpha=.7;for(var lp=0;lp<12;lp++){ctx.rotate(TAU/12);ctx.beginPath();ctx.ellipse(this.radius*(.12+.28*open),0,10+open*13,4+open*6,0,0,TAU);ctx.fill();ctx.stroke();}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,5+open*5,0,TAU);ctx.fill();}
        else if(this.kind==='undertowAnchor'){ctx.rotate(visualTick*.006);ctx.strokeStyle='#dffcff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,22,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(0,28);ctx.moveTo(-25,8);ctx.quadraticCurveTo(-18,31,0,31);ctx.quadraticCurveTo(18,31,25,8);ctx.stroke();for(var ur=0;ur<6;ur++){ctx.rotate(TAU/6);ctx.globalAlpha=.22+.25*Math.sin(visualTick*.08+ur);ctx.beginPath();ctx.arc(this.radius*.52,0,12,0,TAU);ctx.stroke();}}
        else if(this.kind==='thunderCloud'){for(var thc=0;thc<7;thc++){var tha=thc*TAU/7+visualTick*.006;ctx.fillStyle=thc%2?'rgba(225,249,255,.22)':'rgba(105,201,237,.28)';ctx.beginPath();ctx.arc(Math.cos(tha)*this.radius*.36,Math.sin(tha)*this.radius*.22,18+thc%3*5,0,TAU);ctx.fill();}ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(-12,-3);ctx.lineTo(3,4);ctx.lineTo(-2,19);ctx.lineTo(14,4);ctx.stroke();}
        else if(this.kind==='graveMound'){ctx.fillStyle='#272431';ctx.beginPath();ctx.ellipse(0,12,this.radius*.55,this.radius*.25,0,0,TAU);ctx.fill();ctx.strokeStyle='#e9e5ff';ctx.stroke();ctx.fillStyle='#555064';ctx.fillRect(-10,-30,20,42);ctx.strokeRect(-10,-30,20,42);ctx.beginPath();ctx.moveTo(-6,-20);ctx.lineTo(6,-20);ctx.moveTo(0,-26);ctx.lineTo(0,-14);ctx.stroke();}
        else if(this.kind==='enemyMine'){ctx.rotate(visualTick*.025);for(var emn=0;emn<8;emn++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(18,0);ctx.stroke();}ctx.fillStyle='#38291c';ctx.beginPath();ctx.arc(0,0,9,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=this.timer>(Number(this.armTime)||82)*.72?'#fff':'#e9a75d';ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();}
        ctx.restore();
    };

    function Player(x, y, profile) {
        profile=profile||{};var classId=CLASS_DEFS[profile.classId]?profile.classId:selectedClassId;
        Entity.call(this, x, y, 12, profile.color||'#e74c3c');
        var classDef=CLASS_DEFS[classId]||CLASS_DEFS.independent,starterId=WEAPON_DEFS[profile.starterId]&&WEAPON_DEFS[profile.starterId].rarity==='common'?profile.starterId:rollClassStarter(classId);this.classId=classId;this.className=classDef.name;
        this.netId=profile.netId||'local';this.playerName=cleanRuntimeName(profile.name||'KNIGHT');this.slot=profile.slot||0;this.coins=Math.max(0,Number(profile.coins)||0);this.resources=normalizeResources(profile.resources);this.downed=false;this.reviveProgress=0;this.armoryReady=false;
        this.lastProcessedInputSeq=0;this.lastProcessedInputX=x;this.lastProcessedInputY=y;this.lastBuildRevision=0;this._netVx=0;this._netVy=0;this._netCorrectionX=0;this._netCorrectionY=0;this._netLastSentX=x;this._netLastSentY=y;this._netLastSentAt=0;
        this.traitName=classDef.trait;this.traitDesc=classDef.traitDesc;
        this.maxHp = classDef.maxHp; this.hp = this.maxHp; this.maxArmor = classDef.maxArmor; this.armor = this.maxArmor; this.maxMana = classDef.maxMana; this.mana = this.maxMana;this.manaRegenMultiplier=classDef.manaRegen;this.manaTickAmount=Math.max(0,Number(classDef.manaTickAmount)||0);this.manaTickFrames=Math.max(1,Number(classDef.manaTickFrames)||120);this.manaDropBonus=Math.max(0,Number(classDef.manaDropBonus)||0);this.manaRegenClock=0;this.armorRegenDelayBase=classDef.armorDelay;this.armorRegenInterval=classDef.armorTick;
        this.baseSpeed = 4.5; this.inventory = [weaponCopy(starterId)]; this.weaponIndex = 0; this.weapon = this.inventory[0];
        this.stats = { damage: 0, attackSpeed: 0, speed: 0, armor: 0, crit: .05, dodge: 0, pickup: 92, luck: 0, manaRegen: 0, lifesteal: 0, coin: 0 };
        this.passives = {}; this.pacts = {}; this.activeSkills = {}; this.activeCooldowns = {}; this.active = null; this.activeLevel = 0; this.activeCooldown = 0;
        this.lastShot = 0; this.angle = 0; this.invuln = 0; this.switchLock = false; this.abilityLock = false;
        this.dashCooldownMax = 150; this.dashCooldown = 0; this.isDashing = false; this.dashTime = 0; this.dashVector = { x: 0, y: 0 };this.motionX=0;this.motionY=0;
        this.charge = 0; this.wasFiring = false; this.heat = 0; this.overheated = false; this.meleeGuard = 0; this.attackAnim = 0; this.attackAnimMax = 1; this.attackAnimKind = 'gun'; this.attackSide = 1; this.resonance = 0; this.resonanceTimer = 0; this.resonanceKind = ''; this.terrainSlow = 1; this.regenDelay = 0; this.regenTimer = 0; this.armorRegenDelay = 0; this.armorRegenTimer = 0; this.wardAngle = 0; this.berserk = 0; this.revived = false;
        this.rrTargetIds = []; this.rrTime = 0; this.rrDamageTick = 0; this.rrRetargetClock = 0; this.rrParticleClock = 0; this.rrActive = false;
        this.dashTrailClock=0;this.wardDamageClock=0;this.lastManaWarn=-9999;this.bladeHaloTimer=0;this.bladeHaloAngle=0;this.bladeHaloClock=0;this.overclock=0;this.echoSealTimer=0;this.roomBoonTimer=0;this.gunTriggers=0;this.magicCasts=0;this.tripwireAnchor=null;
        this.memoryProgress={};this.memories={};this.primeMemory='';this.memoryAttackCount=0;this.memoryPrimed=false;
        this.cores={};this.arsenalTempo=0;this.lastWeaponCategory=this.weapon.category;this.classShotCounter=0;this.arcaneManaSpent=0;this.arcaneEchoReady=false;this.coreShotCounter=0;this.coreAttackCounter=0;this.coreKillCounter=0;this.manaSpendCharge=0;this.momentum=0;this.phaseGuardAvailable=true;this.familyStreak=0;this.coinFoundryCharge=0;
    }
    Player.prototype = Object.create(Entity.prototype);
    Player.prototype.constructor = Player;
    Player.prototype.hasWeapon = function (id) { return this.inventory.some(function (w) { return w.id === id; }); };
    Player.prototype.getWeapon = function (id) { return this.inventory.find(function (w) { return w.id === id; }); };
    Player.prototype.resetRrharil = function () { this.rrTargetIds.length=0;this.rrTime=0;this.rrDamageTick=0;this.rrRetargetClock=0;this.rrParticleClock=0;this.rrActive=false; };
    Player.prototype.equipActiveSkill = function (id) { if(!this.activeSkills[id]||!ACTIVE_DEFS[id])return false;this.active=id;this.activeLevel=this.activeSkills[id];this.activeCooldown=this.activeCooldowns[id]||0;showToast(ACTIVE_DEFS[id].name+' EQUIPPED',rarityColor(ACTIVE_DEFS[id].rarity));updateCooldownHUD();return true; };
    Player.prototype.switchWeapon = function () {
        if (this.inventory.length < 2) return;
        playSound('weapon.equip', { x: this.x, y: this.y });
        var previousCategory=this.weapon.category;this.resetRrharil(); this.weaponIndex = (this.weaponIndex + 1) % this.inventory.length; this.weapon = this.inventory[this.weaponIndex]; this.charge = 0;
        if(this.classId==='independent'&&this.weapon.category!==previousCategory){this.arsenalTempo=360;addRing(this.x,this.y,'#f8d98a',76,4);addFloat('ADAPT',this.x,this.y-34,'#f8d98a');}
        this.lastWeaponCategory=this.weapon.category;
        showToast(this.weapon.name, this.weapon.color); updateWeaponHUD();if(this===player&&networkRole==='guest'&&shopMode&&window.DKNet)window.DKNet.sendToHost({type:'build_update',build:serializeBuild(this)});
    };
    Player.prototype.update = function (step, now) {
        var motionStartX=this.x,motionStartY=this.y;
        if(this.passives.coinFoundry)this.coinFoundryCharge=Math.max(this.coinFoundryCharge,walletFor(this));
        var dx = 0, dy = 0;
        if (keys.w) dy -= 1; if (keys.s) dy += 1; if (keys.a) dx -= 1; if (keys.d) dx += 1;
        if (joystick.active) { dx = joystick.x; dy = joystick.y; }

        if (keys.q || buttons.switch) { if (!this.switchLock) { this.switchWeapon(); this.switchLock = true; } } else this.switchLock = false;
        if (keys.e || buttons.ability) { if (!this.abilityLock) { this.useActive(); this.abilityLock = true; } } else this.abilityLock = false;

        var prevDashCooldown = this.dashCooldown;
        if (this.dashCooldown > 0) this.dashCooldown -= step;
        if (prevDashCooldown > 0 && this.dashCooldown <= 0 && this === (mainPlayer || player)) triggerDashReady();
        var prevCooldown = this.activeCooldown;
        var memoryClock=(this.primeMemory==='SECOND HAND'?1.08:1)*(this.cores.gear?1.2:1);var ownedActives=Object.keys(this.activeCooldowns);for(var aci=0;aci<ownedActives.length;aci++){var activeId=ownedActives[aci];this.activeCooldowns[activeId]=Math.max(0,(this.activeCooldowns[activeId]||0)-step*memoryClock);}this.activeCooldown=this.active?(this.activeCooldowns[this.active]||0):0;
        if(prevCooldown > 0 && this.activeCooldown <= 0 && this === (mainPlayer || player)) playSound('skill.ready');
        if (this.invuln > 0) this.invuln -= step;
        if (this.berserk > 0) this.berserk -= step;
        if(this.arsenalTempo>0)this.arsenalTempo-=step;
        if (this.overclock > 0) this.overclock -= step;
        if (this.echoSealTimer > 0) this.echoSealTimer -= step;
        if (this.roomBoonTimer > 0) this.roomBoonTimer -= step;
        if(this.manaTickAmount>0&&this.mana<this.maxMana){this.manaRegenClock+=step;while(this.manaRegenClock>=this.manaTickFrames&&this.mana<this.maxMana){this.manaRegenClock-=this.manaTickFrames;this.mana=Math.min(this.maxMana,this.mana+this.manaTickAmount);addFloat('+'+fmt(this.manaTickAmount)+' MANA',this.x,this.y-40,'#8edbff');}}else if(this.mana>=this.maxMana)this.manaRegenClock=0;
        if (this.bladeHaloTimer > 0) { this.bladeHaloTimer-=step;this.updateBladeHalo(step); }
        if (this.meleeGuard > 0) this.meleeGuard -= step;
        if (this.attackAnim > 0) this.attackAnim = Math.max(0,this.attackAnim-step);
        if (this.resonanceTimer > 0) { this.resonanceTimer=Math.max(0,this.resonanceTimer-step);if(this.resonanceTimer===0){this.resonanceKind='';showToast('RESONANCE FADED','#aaa');} }
        if (worldSlowTimer > 0) { worldSlowTimer -= step; if(worldSlowTimer<=0)worldSlowScale=.45; }
        this.wardAngle += .035 * step;

        if (keys.space || buttons.dash) { if (this.dashCooldown <= 0 && !this.isDashing) this.startDash(dx, dy); }
        if (this.isDashing) {
            this.x += this.dashVector.x * step; this.y += this.dashVector.y * step; this.dashTime -= step;
            addParticles(this.x, this.y, '#e74c3c', 1, 1.5);
            if(this.cores.tide){for(var tideShot=0;tideShot<bullets.length;tideShot++){var incoming=bullets[tideShot];if(!incoming.dead&&!incoming.friendly&&Math.hypot(incoming.x-this.x,incoming.y-this.y)<42){incoming.friendly=true;incoming.vx*=-1.35;incoming.vy*=-1.35;incoming.damage=Math.max(3,incoming.damage*1.8);incoming.color='#bffcff';incoming.sourceId='tideCore';addParticles(incoming.x,incoming.y,'#bffcff',3,2);}}}
            if (this.passives.dashCapacitor && intervalElapsed(this,'dashTrailClock',step,3)) explode(this.x, this.y, 36, 2.3, true, '#74b9ff', 'shock', false);
            if (this.dashTime <= 0) this.isDashing = false;
        } else if (dx || dy) {
            this.momentum=Math.min(1,this.momentum+.006*step);var len = Math.hypot(dx, dy) || 1; var move = this.baseSpeed * (1 + this.stats.speed) * this.terrainSlow*(this.arsenalTempo>0?1.15:1);
            var stepDist = move * step;
            this.x += dx / len * stepDist; this.y += dy / len * stepDist;
        } else this.momentum=Math.max(0,this.momentum-.012*step);

        this.resolveObstacles(); this.x = clamp(this.x, -ARENA_LIMIT, ARENA_LIMIT); this.y = clamp(this.y, -ARENA_LIMIT, ARENA_LIMIT);
        var movedDist = Math.hypot(this.x - motionStartX, this.y - motionStartY);
        if (!this.isDashing && movedDist > 0.05) {
            this.stepAccumulator = (this.stepAccumulator || 0) + movedDist;
            if (this.stepAccumulator >= 32) {
                this.stepAccumulator = 0;
                var bName = (currentBiome && currentBiome.name) || '';
                var floorKind = /frost|glacial|ice/i.test(bName) ? 'snow' : (/wood|mansion|library/i.test(bName) ? 'wood' : (/grass|spore|grotto|garden/i.test(bName) ? 'grass' : 'concrete'));
                playSound('player.step.' + floorKind, { x: this.x, y: this.y, volume: 0.35 });
            }
        }
        var motionDelta=Math.max(.25,Number(step)||1);this.motionX=this.motionX*.55+(this.x-motionStartX)/motionDelta*.45;this.motionY=this.motionY*.55+(this.y-motionStartY)/motionDelta*.45;
        if (aimJoystick.active && aimJoystick.strength>.12) {
            this.angle=aimJoystick.angle;
        } else if (joystick.active || isTouchDevice()) {
            var nearest = closestEnemy(this.x, this.y, 520);
            if (nearest) this.angle = Math.atan2(nearest.y - this.y, nearest.x - this.x); else if (dx || dy) this.angle = Math.atan2(dy, dx);
        } else {
            var worldMouseX = mouse.x / currentZoom + camera.x; var worldMouseY = mouse.y / currentZoom + camera.y;
            this.angle = Math.atan2(worldMouseY - this.y, worldMouseX - this.x);
        }

        var firing = keys.attack || mouse.down || buttons.fire || (mobileAimFireEnabled()&&aimJoystick.active&&aimJoystick.strength>.12) || (mobileAutoFireEnabled() && !!closestEnemy(this.x,this.y,520));
        processWeaponFiring(this,firing,step,now);

        this.heat = 0; this.overheated = false;

        if (this.hp < this.maxHp) {
            if (this.regenDelay > 0) this.regenDelay -= step;
            else { this.regenTimer += step; if (this.regenTimer >= 480) { this.hp = Math.min(this.maxHp, this.hp + 1); this.regenTimer = 0; addFloat('+1', this.x, this.y - 28, '#2ecc71'); } }
        }
        if (this.hp / this.maxHp > 0.35) this.lowHpWarned = false;
        this.updateArmorRegen(step);
        this.updateWard(step); updateCooldownHUD();
    };
    function processWeaponFiring(member,firing,step,now){
        if(!member||!member.weapon)return;
        var w=member.weapon,handled=runWeaponAction(w,'updateFiring',{player:member,weapon:w,firing:!!firing&&!member.isDashing,rawFiring:!!firing,step:step,now:now,api:WEAPON_API});
        if(!handled){
            if(w.charge){
                if(firing){
                    if(member.charge===0)playSound('weapon.bow.charge',{x:member.x,y:member.y});
                    member.charge=Math.min(w.charge,member.charge+16.67*step);if(member.charge>=w.charge&&now-member.lastShot>w.rate/member.attackRateMultiplier()){member.releaseBow(now,1);member.charge=0;}
                }
                else if(member.wasFiring&&member.charge>80){member.releaseBow(now,member.charge/w.charge);member.charge=0;}
            }else if(firing&&!member.isDashing)member.tryAttack(now);
            if(member.rrActive)member.resetRrharil();
        }
        member.wasFiring=!!firing;
    }
    Player.prototype.updateArmorRegen = function (step) {
        if(this.armor>=this.maxArmor)return;
        if(this.armorRegenDelay>0){this.armorRegenDelay=Math.max(0,this.armorRegenDelay-step);return;}
        this.armorRegenTimer+=step;
        if(this.armorRegenTimer>=this.armorRegenInterval){
            var prevArmor=this.armor;
            this.armor=Math.min(this.maxArmor,this.armor+1);
            if(prevArmor<this.maxArmor&&this.armor>=this.maxArmor)playSound('armor.restore',{x:this.x,y:this.y});
            this.armorRegenTimer=0;addFloat('+1 ARMOR',this.x,this.y-42,'#bfe5f2');if(this.cores.frost){for(var fi=0;fi<enemies.length;fi++){var chilled=enemies[fi];if(!chilled.dead&&Math.hypot(chilled.x-this.x,chilled.y-this.y)<170)damageEnemy(chilled,3*this.damageMultiplier(),{status:'freeze',direct:true,silent:true});}addRing(this.x,this.y,'#bdefff',170,4);}}
    };
    Player.prototype.familyCount=function(family){if(!family)return 0;var seen={};for(var i=0;i<this.inventory.length;i++){var w=this.inventory[i];if(w.family===family)seen[w.id]=true;}return Object.keys(seen).length;};
    Player.prototype.familyTier=function(family){var count=this.familyCount(family);return count>=3?2:count>=2?1:0;};
    Player.prototype.damageMultiplier = function () {var classMult=1,category=this.weapon?this.weapon.category:'';if(this.classId==='melee'&&category==='MELEE')classMult*=1.18;else if(this.classId==='gunner'&&(category==='GUN'||category==='ARCHER'))classMult*=1.12;else if(this.classId==='magic'&&category==='MAGIC')classMult*=1.18;else if(this.classId==='independent')classMult*=this.arsenalTempo>0?1.23:1.08;if(this.cores.blood&&this.hp<this.maxHp*.5)classMult*=1.2;if(this.passives.coinFoundry)classMult*=1+Math.min(.25,Math.max(walletFor(this),this.coinFoundryCharge||0)/800*.25);return (1 + this.stats.damage) *classMult* (this.berserk > 0 ? 1.55 : 1) * (this.resonanceTimer > 0 ? 1.12 : 1) * (this.roomBoonTimer>0?1.15:1); };
    Player.prototype.attackRateMultiplier = function () {var classRate=this.classId==='gunner'?1.1:1;if(this.passives.momentumSpurs)classRate*=1+this.momentum*.24;return (1 + this.stats.attackSpeed) *classRate* (this.berserk > 0 ? 1.65 : 1) * (this.overclock > 0 ? 1.85 : 1) * (this.primeMemory==='SECOND HAND'?1.08:1); };
    Player.prototype.beginAttackAnimation = function (w, power) {
        var profile=WEAPON_ANIMATIONS[w.id];if(!profile)throw new Error('Missing attack animation for '+w.id);
        this.attackAnim=profile.duration;this.attackAnimMax=profile.duration;this.attackAnimKind=profile.pose;this.attackAnimWeapon=w.id;this.attackPower=power||1;this.attackSide*=-1;
    };
    Player.prototype.beginMemoryAttack = function(){this.memoryAttackCount++;this.memoryPrimed=!!this.primeMemory&&this.memoryAttackCount%5===0;};
    Player.prototype.applyMemoryProjectile = function(opts){
        if(!this.memoryPrimed||!this.primeMemory)return opts;var kind=this.primeMemory;this.memoryPrimed=false;opts.memory=kind;
        if(kind==='ASHFIRE'){opts.status='burn';opts.blast=Math.max(opts.blast||0,16);}
        else if(kind==='WHITEOUT')opts.status='freeze';
        else if(kind==='OVERCHARGE'){opts.status='shock';opts.homing=Math.max(opts.homing||0,.035);opts.damage*=1.07;}
        else if(kind==='NULL TIDE'){opts.vortex=Math.max(opts.vortex||0,55);opts.pierce=(opts.pierce||0)+1;}
        else if(kind==='WILDBLOOM')opts.homing=Math.max(opts.homing||0,.04);
        else if(kind==='UNDERTOW'){opts.knockback=(opts.knockback||0)+4;opts.bounce=(opts.bounce||0)+1;}
        else if(kind==='GOLD SCRIPT'){opts.damage*=1.12;opts.crit=true;}
        else if(kind==='PRISMATIC'){opts.prism=true;opts.bounce=(opts.bounce||0)+1;}
        else if(kind==='OVERFORGE'){opts.damage*=1.1;opts.status='burn';opts.blast=Math.max(opts.blast||0,22);}
        else if(kind==='SECOND HAND'){opts.chrono=true;opts.speed*=1.15;}
        else if(kind==='MOONFALL'){opts.homing=Math.max(opts.homing||0,.045);opts.moonSplit=true;}
        else if(kind==='MYCELIUM'){opts.status='poison';opts.homing=Math.max(opts.homing||0,.035);}
        else if(kind==='DUNEWAKE'){opts.speed*=1.18;opts.pierce=(opts.pierce||0)+1;}
        else if(kind==='SCARLET VOW'){opts.damage*=1.08;opts.scarlet=true;}
        else if(kind==='SKY CHOIR'){opts.skyLances=Math.max(opts.skyLances||0,1);}
        else if(kind==='PULSEWAKE'){opts.homing=Math.max(opts.homing||0,.06);opts.pulsewake=true;}
        return opts;
    };
    Player.prototype.releasePrimedMemory = function(){
        if(!this.memoryPrimed||!this.primeMemory)return;var kind=this.primeMemory,def=DUNGEON_MEMORY_DEFS[kind],target=closestEnemy(this.x,this.y,620);this.memoryPrimed=false;if(!target){var tx=this.x+Math.cos(this.angle)*110,ty=this.y+Math.sin(this.angle)*110;addRing(tx,ty,def.color,34,2);return;}
        if(kind==='ASHFIRE'||kind==='OVERFORGE')explode(target.x,target.y,kind==='OVERFORGE'?56:42,4*this.damageMultiplier(),true,def.color,'burn',false);
        else if(kind==='MOONFALL'){for(var m=-1;m<=1;m+=2)bullets.push(spawnBullet({x:this.x,y:this.y,angle:this.angle+m*.28,speed:12,damage:4*this.damageMultiplier(),friendly:true,color:def.color,radius:6,pierce:1,homing:.07,moonSplit:true,sourceId:'moonMemory'}));}
        else{var status=kind==='WHITEOUT'?'freeze':kind==='OVERCHARGE'||kind==='SKY CHOIR'?'shock':kind==='MYCELIUM'?'poison':kind==='NULL TIDE'?'rift':'';damageEnemy(target,4*this.damageMultiplier(),{status:status,direct:true,knockback:kind==='UNDERTOW'?6:0,angle:this.angle});if(kind==='SCARLET VOW')this.hp=Math.min(this.maxHp,this.hp+.25);if(kind==='PULSEWAKE')this.overclock=Math.max(this.overclock,42);if(kind==='SKY CHOIR'){var skyA=Math.atan2(target.y-this.y,target.x-this.x);bullets.push(spawnBullet({x:target.x-Math.sin(skyA)*160,y:target.y+Math.cos(skyA)*160,angle:skyA-Math.PI/2,speed:16,damage:4*this.damageMultiplier(),friendly:true,color:def.color,sourceId:'skyMemory',type:'windBolt',pierce:2,ghost:true,life:70}));}}
        addRing(target.x,target.y,def.color,52,3);
    };
    Player.prototype.applyResonanceProjectile = function (opts) {
        var kind=this.resonanceKind;if(this.resonanceTimer>0){opts.resonance=kind;
        if(kind==='ASHFIRE'){opts.status='burn';opts.blast=Math.max(opts.blast||0,26);}
        else if(kind==='WHITEOUT'){opts.status='freeze';opts.blast=Math.max(opts.blast||0,18);}
        else if(kind==='OVERCHARGE'){opts.status='shock';opts.homing=Math.max(opts.homing||0,.045);opts.damage*=1.12;}
        else if(kind==='NULL TIDE'){opts.vortex=Math.max(opts.vortex||0,90);opts.pierce=(opts.pierce||0)+1;}
        else if(kind==='WILDBLOOM'){opts.homing=Math.max(opts.homing||0,.055);}
        else if(kind==='UNDERTOW'){opts.knockback=(opts.knockback||0)+7;opts.bounce=(opts.bounce||0)+1;}
        else if(kind==='GOLD SCRIPT'){opts.damage*=1.2;opts.crit=true;}
        else if(kind==='PRISMATIC'){opts.prism=true;opts.bounce=(opts.bounce||0)+1;}
        else if(kind==='OVERFORGE'){opts.damage*=1.2;opts.status='burn';opts.blast=Math.max(opts.blast||0,32);}
        else if(kind==='SECOND HAND'){opts.chrono=true;opts.speed*=1.25;opts.damage*=1.1;}
        else if(kind==='MOONFALL'){opts.homing=Math.max(opts.homing||0,.07);opts.pierce=(opts.pierce||0)+1;opts.moonSplit=true;}
        else if(kind==='MYCELIUM'){opts.status='poison';opts.homing=Math.max(opts.homing||0,.055);}
        else if(kind==='DUNEWAKE'){opts.speed*=1.28;opts.pierce=(opts.pierce||0)+2;}
        else if(kind==='SCARLET VOW'){opts.damage*=1.16;opts.scarlet=true;}
        else if(kind==='SKY CHOIR'){opts.skyLances=Math.max(opts.skyLances||0,2);opts.homing=Math.max(opts.homing||0,.025);}
        else if(kind==='PULSEWAKE'){opts.homing=Math.max(opts.homing||0,.085);opts.pulsewake=true;opts.damage*=1.08;}}
        return this.applyMemoryProjectile(opts);
    };
    Player.prototype.spendMana = function (amount) {
        if (!amount) return true;
        if (this.mana + .01 < amount) { if (gameTimeMs-this.lastManaWarn>700){this.lastManaWarn=gameTimeMs;showToast('NOT ENOUGH MANA', '#3498db');playSound('player.noMana');} return false; }
        this.mana -= amount;this.manaSpendCharge+=amount;if(this.classId==='magic'){this.arcaneManaSpent+=amount;if(this.arcaneManaSpent>=40){this.arcaneManaSpent%=40;this.arcaneEchoReady=true;addFloat('OVERFLOW READY',this.x,this.y-42,'#d9b3ff');}}if(this.passives.manaCapacitor&&this.manaSpendCharge>=60){this.manaSpendCharge%=60;this.armor=Math.min(this.maxArmor,this.armor+1);for(var arc=0;arc<enemies.length;arc++){var foe=enemies[arc];if(!foe.dead&&Math.hypot(foe.x-this.x,foe.y-this.y)<210)damageEnemy(foe,5*this.damageMultiplier(),{status:'shock',direct:true,silent:true});}addRing(this.x,this.y,'#7fe7ff',210,6);} return true;
    };
    Player.prototype.tryAttack = function (now) {
        var w = this.weapon; var rate = w.rate / this.attackRateMultiplier();
        if (now - this.lastShot < rate) return;
        if (!this.spendMana(w.mana || 0)) return;
        this.lastShot = now; w.shots++;this.beginMemoryAttack();this.beginAttackAnimation(w,1);if(w.category==='MELEE')this.meleeGuard=Math.max(this.meleeGuard,18);
        var attackContext={player:this,weapon:w,angle:this.angle,power:1,burstIndex:0,api:WEAPON_API};
        if(!runWeaponAction(w,'attack',attackContext))this.fireWeapon(w,this.angle,1,0);
        if (w.burst) for (var i = 1; i < w.burst; i++) pendingShots.push({ frames: i * w.burstGap / 16.67, weaponId: w.id, level: w.level, angle: this.angle, index: i });
        this.releasePrimedMemory();this.queueAttackEchoes(w,this.angle,1);if(w.category==='GUN'&&this.passives.gunslinger){this.gunTriggers++;if(this.gunTriggers%5===0)pendingShots.push({frames:4,kind:'gunSide',weaponId:w.id,level:w.level,angle:this.angle,damage:w.damage*weaponLevelScale(w)*this.damageMultiplier()*.65,color:w.color,speed:w.speed||15});}
        this.x -= Math.cos(this.angle) * 1.4; this.y -= Math.sin(this.angle) * 1.4;
        updateWeaponHUD();
    };
    Player.prototype.releaseBow = function (now, chargeRatio) {
        var w = this.weapon; var rate = w.rate / this.attackRateMultiplier(); if (now - this.lastShot < rate || !this.spendMana(w.mana || 0)) return;
        this.lastShot = now; w.shots++;this.beginMemoryAttack(); var power = .48 + clamp(chargeRatio, .1, 1) * 1.18;this.beginAttackAnimation(w,power);
        this.fireWeapon(w, this.angle, power, chargeRatio >= .92 ? 1 : 0);this.releasePrimedMemory();this.queueAttackEchoes(w,this.angle,power);updateWeaponHUD();
    };
    Player.prototype.queueAttackEchoes = function(w,angle,power){if(this.echoSealTimer>0)pendingShots.push({frames:11,kind:'attackEcho',weaponId:w.id,level:w.level,angle:angle,power:power||1,scale:.7,color:w.color});if(this.passives.spellEcho&&w.category==='MAGIC'){this.magicCasts++;if(this.magicCasts%6===0)pendingShots.push({frames:16,kind:'attackEcho',weaponId:w.id,level:w.level,angle:angle,power:power||1,scale:.55,color:'#f4dfff'});}if(this.arcaneEchoReady&&w.category==='MAGIC'){this.arcaneEchoReady=false;pendingShots.push({frames:12,kind:'attackEcho',weaponId:w.id,level:w.level,angle:angle+.12*this.attackSide,power:power||1,scale:.55,color:'#f8e8ff'});addRing(this.x,this.y,'#d9b3ff',64,3);}this.coreAttackCounter++;if(this.cores.sand&&this.coreAttackCounter%9===0)pendingShots.push({frames:10,kind:'attackEcho',weaponId:w.id,level:w.level,angle:angle-.35*this.attackSide,power:power||1,scale:.62,color:'#ffe5a2'});};
    Player.prototype.fireWeapon = function (w, angle, power, burstIndex) {
        power=power||1;
        var soundKey = window.DKAudio ? window.DKAudio.resolveWeaponAttack(w) : 'weapon.gun';
        playSound(soundKey, { x: this.x, y: this.y });
        var volley={player:this,weapon:w,angle:angle,power:power,burstIndex:burstIndex||0,scale:weaponLevelScale(w),count:w.count||1,spread:w.spread||0,familyTier:this.familyTier(w.family),api:WEAPON_API};
        runWeaponHooks(w,'prepareVolley',volley);
        for(var i=0;i<volley.count;i++){
            var shot={player:this,weapon:w,index:i,count:volley.count,spread:volley.spread,baseAngle:angle,angle:angle+(volley.count>1?(i-(volley.count-1)/2)*volley.spread/Math.max(1,volley.count-1):rand(-volley.spread/2,volley.spread/2)),power:volley.power,burstIndex:volley.burstIndex,scale:volley.scale,familyTier:volley.familyTier,api:WEAPON_API};
            runWeaponHooks(w,'configureAngle',shot);
            this.classShotCounter++;
            var classTracer=this.classId==='gunner'&&this.classShotCounter%7===0;
            shot.critChance=this.stats.crit+(volley.burstIndex===2?.22:0);
            runWeaponHooks(w,'configureCrit',shot);
            shot.crit=chance(shot.critChance)||!!shot.forceCrit;
            var damage=w.damage*volley.scale*volley.power*this.damageMultiplier()*(shot.crit?1.75:1);
            var opts={x:this.x+Math.cos(shot.angle)*18,y:this.y+Math.sin(shot.angle)*18,angle:shot.angle,speed:(w.speed||12)*(.9+volley.power*.1)*(this.cores.cloud?1.18:1),damage:damage,friendly:true,color:w.color,sourceId:w.id,crit:shot.crit};
            shot.opts=opts;
            runWeaponHooks(w,'configureProjectile',shot);
            if(classTracer){opts.classTracer=true;opts.pierce=(opts.pierce||0)+2;opts.damage*=1.18;opts.color='#fff2a8';opts.radius=(opts.radius||4)+1;}
            if(shot.tacticalTracer){opts.classTracer=true;opts.pierce=(opts.pierce||0)+2;opts.damage*=1.15;opts.color='#eaffcf';opts.radius=(opts.radius||4)+1;}
            if(this.cores.void){opts.pierce=(opts.pierce||0)+1;if(!opts.status)opts.status='curse';}
            if(this.passives.glassRelay){opts.pierce=(opts.pierce||0)+1;opts.damage*=.94;}
            if(this.cores.storm&&this.classShotCounter%8===0){opts.tesla=true;opts.status='shock';}
            if(this.cores.mirror&&shot.crit)opts.prismCrit=true;
            if((this.passives.blastHarness&&opts.blast)||(this.cores.magma&&opts.blast)){var blastBoost=(this.passives.blastHarness?1.25:1)*(this.cores.magma?1.22:1);opts.blast*=blastBoost;opts.damage*=blastBoost;}
            this.applyResonanceProjectile(opts);bullets.push(spawnBullet(opts));
        }
        runWeaponHooks(w,'afterVolley',volley);
        addWeaponFlash(w,this.x+Math.cos(angle)*31,this.y+Math.sin(angle)*31,angle);
        capArray(bullets,720);
    };
    Player.prototype.phaseStep=function(distance,angle){var startX=this.x,startY=this.y,steps=Math.max(2,Math.ceil(distance/12));for(var ps=1;ps<=steps;ps++){var travel=distance*ps/steps,nx=startX+Math.cos(angle)*travel,ny=startY+Math.sin(angle)*travel,blocked=Math.abs(nx)>ARENA_LIMIT-this.radius||Math.abs(ny)>ARENA_LIMIT-this.radius;for(var oi=0;!blocked&&oi<obstacles.length;oi++)if(obstacleContact(nx,ny,this.radius+2,obstacles[oi]))blocked=true;if(blocked)break;this.x=nx;this.y=ny;}var moved=Math.hypot(this.x-startX,this.y-startY);if(moved>0)playSound('player.blink',{x:this.x,y:this.y});return moved;};
    Player.prototype.performMelee = function (w) {
        playSound('weapon.melee', { x: this.x, y: this.y });
        var melee={player:this,weapon:w,scale:weaponLevelScale(w),damage:w.damage*weaponLevelScale(w)*this.damageMultiplier(),arc:w.arc,radius:w.reach,attackAngle:this.angle,knockback:2.8,status:w.status||'',originX:this.x,originY:this.y,manaOnDeflect:0,chronoMark:false,stun:0,api:WEAPON_API};
        this.meleeGuard=Math.max(this.meleeGuard,18);
        runWeaponHooks(w,'configureMelee',melee);
        if(this.resonanceTimer>0){if(this.resonanceKind==='ASHFIRE')melee.status='burn';else if(this.resonanceKind==='WHITEOUT')melee.status='freeze';else if(this.resonanceKind==='OVERCHARGE')melee.status='shock';else if(this.resonanceKind==='NULL TIDE')melee.knockback=-5;else if(this.resonanceKind==='UNDERTOW')melee.knockback+=7;else if(this.resonanceKind==='PRISMATIC')melee.arc=Math.min(TAU,melee.arc+.5);}
        slashes.push(spawnSlash({x:this.x,y:this.y,angle:melee.attackAngle,radius:melee.radius,arc:melee.arc,damage:melee.damage,color:w.color,deflect:w.deflect,knockback:melee.knockback,status:melee.status,stun:melee.stun,sourceId:w.id,manaOnDeflect:melee.manaOnDeflect,chronoMark:melee.chronoMark}));
        runWeaponHooks(w,'afterMelee',melee);
        addWeaponFlash(w,this.x+Math.cos(melee.attackAngle)*melee.radius*.62,this.y+Math.sin(melee.attackAngle)*melee.radius*.62,melee.attackAngle);addParticles(this.x+Math.cos(melee.attackAngle)*melee.radius*.7,this.y+Math.sin(melee.attackAngle)*melee.radius*.7,w.color,w.rarity==='mythical'?12:7,3.8);
    };
    Player.prototype.startDash = function (dx, dy) {
        this.isDashing = true; this.dashCooldown = this.dashCooldownMax; this.dashTime = 12; this.invuln = Math.max(this.invuln, 16);
        playSound('player.dash', { x: this.x, y: this.y });
        var a = (dx || dy) ? Math.atan2(dy, dx) : this.angle;
        this.dashVector = { x: Math.cos(a) * 16, y: Math.sin(a) * 16 };
        addParticles(this.x, this.y, '#fff', 10, 4);
    };
    Player.prototype.useActive = function () {
        if (!this.active) { showToast('FIND A SKILL IN THE LOADOUT BAY', '#9b59b6'); return; }
        if (this.activeCooldown > 0) return;
        var def=ACTIVE_DEFS[this.active],core=window.DKEditorCore;if(!def||!core||typeof core.executeSkill!=='function'){showToast('SKILL GRAPH UNAVAILABLE','#ff8d8d');return;}var manaCost=Math.max(0,Number(def.manaCost)||0);if(this.mana<manaCost){showToast('NOT ENOUGH MANA','#74b9ff');playSound('player.noMana');return;}var result=core.executeSkill(this.active,{player:this,skill:def,weapon:this.weapon,damage:this.weapon&&this.weapon.damage||8,api:WEAPON_API});if(!result||result.errors&&result.errors.length){showToast('SKILL GRAPH BLOCKED','#ff8d8d');return;}this.mana=Math.max(0,this.mana-manaCost);var cdScale=Math.max(.65,1-(this.activeLevel-1)*.1);this.activeCooldown=(Number(def.cooldown)||720)*cdScale;this.activeCooldowns[this.active]=this.activeCooldown;
        var skillSound = window.DKAudio ? window.DKAudio.resolveSkillSound(this.active) : 'weapon.magic';
        playSound(skillSound, { x: this.x, y: this.y });
        updateHUD();
        updateCooldownHUD();
    };
    Player.prototype.updateBladeHalo = function (step) {
        this.bladeHaloAngle+=.055*step;if(!intervalElapsed(this,'bladeHaloClock',step,3))return;
        for(var bi=0;bi<bullets.length;bi++){var hostile=bullets[bi];if(!hostile.dead&&!hostile.friendly){var bd=Math.hypot(hostile.x-this.x,hostile.y-this.y);if(bd>48&&bd<104){hostile.dead=true;addParticles(hostile.x,hostile.y,'#ff6b6b',2,2);}}}
        for(var ei=0;ei<enemies.length;ei++){var foe=enemies[ei];if(foe.dead)continue;var ed=Math.hypot(foe.x-this.x,foe.y-this.y);if(ed>45&&ed<112)damageEnemy(foe,1.35*this.damageMultiplier(),{status:'rift',direct:false,silent:true,knockback:1,angle:Math.atan2(foe.y-this.y,foe.x-this.x)});}
    };
    Player.prototype.updateWard = function () {
        if (!this.passives.orbitingWard) return;
        var wx = this.x + Math.cos(this.wardAngle) * 46, wy = this.y + Math.sin(this.wardAngle) * 46;
        bullets.forEach(function (b) { if (!b.friendly && !b.dead && Math.hypot(b.x - wx, b.y - wy) < b.radius + 9) { b.dead = true; addParticles(wx, wy, '#00d2d3', 4, 2); } });
        if(intervalElapsed(this,'wardDamageClock',arguments[0]||1,15))enemies.forEach(function (e) { if (!e.dead && Math.hypot(e.x - wx, e.y - wy) < e.radius + 9) damageEnemy(e, 1.5 * player.damageMultiplier(), { direct: false }); });
    };
    Player.prototype.hit = function (damage, source) {
        if (debugGodMode || this.isDashing || this.invuln > 0 || !gameActive) return;
        var modHit=modEvent('beforePlayerDamage',{player:this,damage:damage,source:source,cancel:false});if(modHit.cancel)return;damage=Math.max(0,Number(modHit.damage)||0)*Math.max(0,Number(modRule('enemyDamageMultiplier',1))||1);source=modHit.source||source;
        if(this.passives.emergencyPlating&&this.phaseGuardAvailable){this.phaseGuardAvailable=false;this.invuln=35;addFloat('PLATING',this.x,this.y-38,'#d8e4ea');addRing(this.x,this.y,'#d8e4ea',58,5);playSound('player.shield',{x:this.x,y:this.y});return;}
        if (chance(Math.min(.5, this.stats.dodge))) { addFloat('DODGE', this.x, this.y - 30, '#74b9ff'); this.invuln = 12; playSound('player.dodge',{x:this.x,y:this.y}); return; }
        if (this.passives.manaShield && this.mana >= 16) { this.mana -= 16; this.invuln = 24; addFloat('MANA SHIELD', this.x, this.y - 30, '#3498db'); addRing(this.x, this.y, '#3498db', 52, 4); updateHUD(); playSound('player.shield',{x:this.x,y:this.y}); return; }
        if(this.meleeGuard>0)damage*=this.classId==='melee'?.6:.65;var reduction = Math.min(.55, this.stats.armor * .075); var dealt = Math.max(.35, damage * (1 - reduction));var prevArmor=this.armor;var armorLoss=Math.min(this.armor,dealt);this.armor-=armorLoss;var hpLoss=Math.max(0,dealt-armorLoss);
        this.hp -= hpLoss; this.invuln = 34; this.regenDelay = 300; this.regenTimer = 0;this.armorRegenDelay=Math.max(360,this.armorRegenDelayBase-(this.primeMemory==='WHITEOUT'?60:0));this.armorRegenTimer=0;
        if(armorLoss>0){addFloat('-'+fmt(armorLoss)+' ARMOR',this.x,this.y-38,'#bfe5f2');playSound('armor.hit',{x:this.x,y:this.y});if(prevArmor>0&&this.armor<=0)playSound('armor.break',{x:this.x,y:this.y});}if(hpLoss>0){addFloat('-' + fmt(hpLoss), this.x, this.y - 30, '#e74c3c');playSound('player.hurt',{x:this.x,y:this.y});if(this.hp/this.maxHp<=0.25&&!this.lowHpWarned){this.lowHpWarned=true;playSound('player.lowHp');}} addParticles(this.x, this.y, armorLoss>0?'#9fb7c6':'#e74c3c', 7, 4);updateHUD();
        modEvent('playerDamaged',{player:this,damage:dealt,hpLoss:hpLoss,armorLoss:armorLoss,source:source});
        if (this.hp <= 0) {
            if (this.passives.phoenixSigil && !this.revived) {
                this.revived = true; this.hp = Math.max(1, this.maxHp * .4); this.invuln = 150; explode(this.x, this.y, 230, 24 * this.damageMultiplier(), true, '#ff7a18', 'burn', false); showToast('PHOENIX SIGIL', '#ff7a18'); updateHUD(); playSound('player.revive',{x:this.x,y:this.y});
            } else if(networkRole!=='local'&&partyCount()>1){this.hp=0;this.downed=true;this.reviveProgress=0;this.invuln=99999;addRing(this.x,this.y,this.color,72,6);addFloat('DOWNED',this.x,this.y-42,'#ff8d8d');playSound('player.downed',{x:this.x,y:this.y});if(partyPlayers().every(function(member){return member.downed||member.hp<=0;}))endGame();}
            else endGame();
        }
    };
    Player.prototype.drawMythicAttackAura=function(w,progress,impact){
        if((w.rarity!=='mythical'&&w.rarity!=='legendary')||(!this.attackAnim&&!this.rrActive))return;
        var aura=WEAPON_AURAS[w.id];if(!aura)return;
        ctx.save();ctx.translate(this.x,this.y);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35+.45*impact;ctx.strokeStyle=w.color;ctx.fillStyle=w.color;ctx.lineCap='round';
        aura({ctx:ctx,player:this,weapon:w,progress:progress,impact:impact,visualTick:visualTick,TAU:TAU});
        ctx.restore();
    };
    function applyWeaponAnimationPose(profile,progress,impact,chargePull,side){
        var pose=profile.pose,turn=profile.turn||0,lunge=profile.lunge||0,back=profile.back||0,lift=profile.lift||0;
        if(pose==='sweep'||pose==='hook'||pose==='drag'||pose==='phaseSlash'){ctx.rotate(side*(-turn*.5+progress*turn));ctx.translate(impact*lunge,0);}
        else if(pose==='slam'){ctx.rotate(side*(-turn*.62+progress*turn));ctx.translate(impact*lunge,-impact*lift);ctx.scale(1+impact*.09,1-impact*.05);}
        else if(pose==='thrust'){ctx.translate(impact*lunge,0);ctx.rotate(side*impact*turn);ctx.scale(1+impact*.12,1-impact*.06);}
        else if(pose==='snap'||pose==='recoil'||pose==='rattle'){var chatter=pose==='rattle'?Math.sin(progress*Math.PI*5)*2:0;ctx.translate(-impact*back,chatter);ctx.rotate(side*(impact*turn+chatter*.006));}
        else if(pose==='pump'){ctx.translate(-impact*back+Math.sin(progress*TAU)*lunge,-impact*lift);ctx.rotate(side*impact*turn);}
        else if(pose==='roll'||pose==='rewind'){ctx.translate(-impact*back,Math.sin(progress*TAU)*lift);ctx.rotate(side*((progress-.5)*turn+impact*.08));}
        else if(pose==='cast'||pose==='channel'||pose==='toll'||pose==='bloom'||pose==='puppet'||pose==='summon'){ctx.translate(impact*lunge,-impact*lift);ctx.rotate(side*impact*turn);ctx.scale(1+impact*(pose==='summon'?.18:.11),1+impact*(pose==='toll'?.04:.11));}
        else if(pose==='fan'||pose==='bite'){ctx.translate(-impact*back,-impact*lift);ctx.rotate(side*Math.sin(progress*Math.PI)*turn);ctx.scale(1+impact*.09,1-impact*.04);}
        else if(pose==='throw'||pose==='orbit'){ctx.rotate(side*(-turn*.34+progress*turn));ctx.translate(impact*lunge,-impact*lift);}
        else if(pose==='phase'){ctx.translate(impact*lunge,-Math.sin(progress*TAU)*lift);ctx.rotate(side*impact*turn);ctx.scale(1+impact*.14,1-impact*.07);}
        else if(pose==='draw'){var pull=Math.max(chargePull,impact);ctx.translate(-pull*back,-impact*lift);ctx.rotate(side*impact*turn);ctx.scale(1+impact*.05,1-impact*.035);}
    }
    function attackAccentHash(text){var h=17;for(var i=0;i<text.length;i++)h=(h*31+text.charCodeAt(i))>>>0;return h;}
    function drawWeaponProfileAccent(owner,w,profile,progress,impact){
        if(!profile||impact<=.01)return;var hash=attackAccentHash(profile.accent),variant=hash%5,count=clamp(profile.count||5,3,12),radius=profile.radius||52,phase=(profile.phase||0)*TAU;
        ctx.save();ctx.translate(owner.x,owner.y);ctx.rotate(owner.angle);ctx.translate(24+impact*(profile.lunge||0)*.5,0);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.2+.58*impact;ctx.strokeStyle=w.color;ctx.fillStyle=w.color;ctx.lineWidth=1.5+impact*2;ctx.lineCap='round';
        // Effect geometry is discipline-safe. Guns always make muzzle/tracer
        // effects, bows make strings/arrows, melee makes weapon arcs, and only
        // magic can use blossoms or orbiting sigils.
        if(w.category==='GUN'){
            var muzzle=30+impact*12,spread=w.count&&w.count>1?Math.min(.62,w.spread||.34):.08+variant*.025,rays=Math.min(count,w.count||3);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(muzzle+12+impact*9,0);ctx.lineTo(muzzle,-5-impact*4);ctx.lineTo(muzzle+3,0);ctx.lineTo(muzzle,5+impact*4);ctx.closePath();ctx.fill();ctx.strokeStyle=w.color;for(var gunRay=0;gunRay<rays;gunRay++){var gunA=(gunRay-(rays-1)/2)*spread/Math.max(1,rays-1);ctx.beginPath();ctx.moveTo(muzzle,0);ctx.lineTo(muzzle+Math.cos(gunA)*radius*(.48+.42*impact),Math.sin(gunA)*radius*(.48+.42*impact));ctx.stroke();}for(var casing=0;casing<Math.min(4,1+variant);casing++){ctx.save();ctx.translate(7-casing*5,-10-casing*3-impact*6);ctx.rotate(progress*TAU+casing);ctx.strokeRect(-2,-1,5,2);ctx.restore();}if(w.profileStarAccent){ctx.save();ctx.translate(muzzle+radius*.62,0);ctx.rotate(progress*TAU);ctx.strokeStyle='#ead7ff';ctx.beginPath();for(var star=0;star<5;star++){var sa=star*TAU/5-Math.PI/2,sb=(star*2%5)*TAU/5-Math.PI/2;if(!star)ctx.moveTo(Math.cos(sa)*10,Math.sin(sa)*10);ctx.lineTo(Math.cos(sb)*10,Math.sin(sb)*10);}ctx.stroke();ctx.restore();}
        }else if(w.category==='ARCHER'){
            ctx.strokeStyle=w.color;for(var bowWave=0;bowWave<Math.min(3,1+variant%3);bowWave++){ctx.beginPath();ctx.arc(4,0,radius*(.38+bowWave*.12+impact*.16),-.72,.72);ctx.stroke();}ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(15,-radius*.28);ctx.lineTo(25+impact*12,0);ctx.lineTo(15,radius*.28);ctx.stroke();for(var arrow=0;arrow<Math.min(count,5);arrow++){var arrowA=(arrow-(Math.min(count,5)-1)/2)*.08;ctx.save();ctx.rotate(arrowA);ctx.fillStyle=arrow%2?w.color:'#fff';ctx.beginPath();ctx.moveTo(radius*(.62+.25*impact),0);ctx.lineTo(radius*.45,-3);ctx.lineTo(radius*.49,0);ctx.lineTo(radius*.45,3);ctx.closePath();ctx.fill();ctx.restore();}
        }else if(w.category==='MELEE'){
            ctx.translate(-24,0);ctx.strokeStyle=w.color;ctx.lineWidth=3+impact*4;var sweep=profile.pose==='thrust'?.42:profile.pose==='slam'?1.05:1.7;for(var slash=0;slash<Math.min(4,1+(profile.ghosts||0));slash++){var slashRadius=radius*(.58+slash*.11);ctx.globalAlpha=.18+impact*.52-slash*.035;ctx.beginPath();ctx.arc(0,0,slashRadius,-sweep*.5+progress*.25,sweep*.5+progress*.25);ctx.stroke();}ctx.rotate(phase+progress*.3);for(var chip=0;chip<Math.min(count,6);chip++){ctx.rotate(TAU/Math.min(count,6));ctx.fillStyle=chip%2?'#fff':w.color;ctx.fillRect(radius*(.45+.22*impact),-1.5,5+variant,3);}
        }else{
            var petals=/petal|lotus|bloom/i.test(profile.accent)||w.petalAccent;ctx.rotate(phase+progress*(.35+variant*.08));if(petals){for(var petal=0;petal<count;petal++){ctx.rotate(TAU/count);ctx.beginPath();ctx.ellipse(radius*(.32+.22*impact),0,8+impact*7,3+impact*4,0,0,TAU);ctx.stroke();}}else{for(var sigil=0;sigil<count;sigil++){var sigilA=sigil*TAU/count,sigilR=radius*(.34+.22*impact)+(sigil%2)*5;ctx.beginPath();ctx.arc(Math.cos(sigilA)*sigilR,Math.sin(sigilA)*sigilR,2+sigil%3,0,TAU);ctx.fill();if(sigil%2===0){ctx.beginPath();ctx.moveTo(Math.cos(sigilA)*radius*.2,Math.sin(sigilA)*radius*.2);ctx.lineTo(Math.cos(sigilA)*sigilR,Math.sin(sigilA)*sigilR);ctx.stroke();}}ctx.strokeStyle='#fff';ctx.globalAlpha=.38+.4*impact;ctx.beginPath();ctx.arc(0,0,radius*(.22+.18*impact),0,TAU);ctx.stroke();}
        }
        ctx.restore();
    }
    Player.prototype.draw = function () {
        var w=this.weapon;runWeaponHooks(w,'drawWorldEffect',{player:this,weapon:w,ctx:ctx,visualTick:visualTick,TAU:TAU,api:WEAPON_API});this.drawBody();var profile=WEAPON_ANIMATIONS[w.id]||{pose:w.category==='MELEE'?'slash':w.category==='ARCHER'?'draw':'recoil',ghosts:0,phase:0,lunge:0,back:4,lift:2,turn:.08,accent:'fallback',count:3,radius:42},active=this.attackAnim>0,progress=active?1-this.attackAnim/this.attackAnimMax:0,impact=Math.sin(progress*Math.PI),chargePull=w.charge?clamp(this.charge/w.charge,0,1):0;
        ctx.save();ctx.translate(this.x,this.y);if(this.invuln>0){ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.stroke();}ctx.restore();
        if(active&&profile.ghosts){
            for(var ai=0;ai<profile.ghosts;ai++){var ghostProgress=clamp(progress-ai*(.055+profile.phase*.025),0,1),ghostImpact=Math.sin(ghostProgress*Math.PI);ctx.save();ctx.globalAlpha=.045+ai/profile.ghosts*.11;ctx.translate(this.x,this.y);ctx.rotate(this.angle);applyWeaponAnimationPose(profile,ghostProgress,ghostImpact,chargePull,this.attackSide);drawHeldWeapon(w,true,this.color);ctx.restore();}
        }
        ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);
        if(active||chargePull>0)applyWeaponAnimationPose(profile,progress,impact,chargePull,this.attackSide);
        drawHeldWeapon(w,false,this.color);ctx.restore();
        if(active)drawWeaponProfileAccent(this,w,profile,progress,impact);
        if(profile.pose==='draw'&&chargePull>.08&&!active){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);ctx.globalAlpha=.4+.5*chargePull;ctx.strokeStyle=w.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(37+chargePull*13,0);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(43+chargePull*13,0);ctx.lineTo(35+chargePull*13,-4);ctx.lineTo(35+chargePull*13,4);ctx.closePath();ctx.fill();ctx.restore();}
        this.drawMythicAttackAura(w,progress,impact);
        if(this.bladeHaloTimer>0){ctx.save();ctx.translate(this.x,this.y);ctx.globalCompositeOperation='lighter';for(var bh=0;bh<7;bh++){var bha=this.bladeHaloAngle+bh*TAU/7,bhr=76+Math.sin(visualTick*.08+bh)*7;ctx.save();ctx.rotate(bha);ctx.translate(bhr,0);ctx.rotate(Math.PI/2+.35*Math.sin(visualTick*.1+bh));ctx.fillStyle=bh%2?'#ff354d':'#fff';ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(5,3);ctx.lineTo(0,11);ctx.lineTo(-5,3);ctx.closePath();ctx.fill();ctx.strokeStyle='#5b0712';ctx.stroke();ctx.restore();}ctx.restore();}
        if(this.overclock>0){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(visualTick*.08);ctx.strokeStyle='#70e6ff';ctx.lineWidth=2;ctx.globalAlpha=.65;for(var oc=0;oc<4;oc++){ctx.rotate(TAU/4);ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(27,-5);ctx.lineTo(34,4);ctx.stroke();}ctx.restore();}
        if (this.passives.orbitingWard) {
            var wx = this.x + Math.cos(this.wardAngle) * 46, wy = this.y + Math.sin(this.wardAngle) * 46;
            ctx.save(); ctx.fillStyle = '#00d2d3'; ctx.shadowBlur = 9; ctx.shadowColor = '#00d2d3'; ctx.beginPath(); ctx.arc(wx, wy, 7, 0, TAU); ctx.fill(); ctx.restore();
        }
    };
    function drawHeldWeapon(w, displayOnly, handColor) {
        var pulse=(Math.sin(visualTick*.12)+1)/2;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.shadowColor='transparent';ctx.shadowBlur=0;
        function foundation(){
            var base='#24272b',metal='#aeb5bc';ctx.save();ctx.fillStyle=base;ctx.strokeStyle='#0c0d0f';ctx.lineWidth=2;
            if(w.category==='GUN'){
                ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(13,-7);ctx.lineTo(22,-4);ctx.lineTo(22,4);ctx.lineTo(13,7);ctx.lineTo(-8,6);ctx.lineTo(-2,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillRect(12,-7,27,14);ctx.strokeRect(12,-7,27,14);ctx.fillStyle=metal;ctx.fillRect(37,-3,18,6);ctx.fillStyle='#17191b';ctx.beginPath();ctx.moveTo(13,7);ctx.lineTo(24,7);ctx.lineTo(20,20);ctx.lineTo(12,18);ctx.closePath();ctx.fill();ctx.stroke();
            }else if(w.category==='MELEE'){
                ctx.fillRect(-7,-4,30,8);ctx.strokeRect(-7,-4,30,8);ctx.fillStyle=metal;ctx.fillRect(18,-11,5,22);ctx.strokeRect(18,-11,5,22);ctx.beginPath();ctx.moveTo(23,-3);ctx.lineTo(54,-5);ctx.lineTo(65,0);ctx.lineTo(54,5);ctx.lineTo(23,3);ctx.closePath();ctx.fill();ctx.stroke();
            }else if(w.category==='ARCHER'){
                ctx.fillRect(12,-12,8,24);ctx.strokeRect(12,-12,8,24);ctx.strokeStyle=metal;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(17,-10);ctx.quadraticCurveTo(35,-21,45,-17);ctx.moveTo(17,10);ctx.quadraticCurveTo(35,21,45,17);ctx.stroke();
            }else{
                ctx.fillRect(-5,-4,34,8);ctx.strokeRect(-5,-4,34,8);ctx.fillStyle=metal;ctx.beginPath();ctx.moveTo(26,-9);ctx.lineTo(38,-14);ctx.lineTo(49,0);ctx.lineTo(38,14);ctx.lineTo(26,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=w.color;ctx.beginPath();ctx.arc(38,0,4,0,TAU);ctx.fill();
            }
            ctx.restore();
        }
        function finish(){ctx.save();ctx.shadowBlur=0;ctx.strokeStyle='rgba(255,255,255,.58)';ctx.fillStyle='rgba(255,255,255,.78)';ctx.lineWidth=1;if(w.category==='GUN'){ctx.beginPath();ctx.moveTo(17,-5);ctx.lineTo(34,-5);ctx.stroke();ctx.beginPath();ctx.arc(26,0,2,0,TAU);ctx.fill();}else if(w.category==='MELEE'){ctx.beginPath();ctx.moveTo(28,-1);ctx.lineTo(56,-2);ctx.stroke();}else if(w.category==='ARCHER'){ctx.fillRect(14,-5,4,10);}else{ctx.beginPath();ctx.arc(38,0,7,0,TAU);ctx.stroke();}ctx.restore();}
        function hands(){ctx.fillStyle=handColor||'#e74c3c';ctx.strokeStyle='#111';ctx.lineWidth=2;[-1,1].forEach(function(side){ctx.save();ctx.translate(8,side*8);ctx.rotate(side*.18);ctx.beginPath();ctx.roundRect?ctx.roundRect(-5,-3.5,10,7,2):ctx.rect(-5,-3.5,10,7);ctx.fill();ctx.stroke();ctx.restore();});}
        function bow(limb,stringColor){ctx.strokeStyle=limb;ctx.lineWidth=4;ctx.beginPath();ctx.arc(20,0,18,-1.12,1.12);ctx.stroke();ctx.strokeStyle=stringColor||'#ddd';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(27,-16);ctx.lineTo(23,0);ctx.lineTo(27,16);ctx.stroke();}
        var renderer=WEAPON_RENDERERS[w.id];
        if(renderer){
            heldRenderAudit.custom++;
            // Custom weapon renderers own the complete held-weapon artwork.
            // Do not draw the generic foundation/highlight underneath them,
            // otherwise two weapon silhouettes are composited on top of each other.
            ctx.save();renderer({ctx:ctx,weapon:w,pulse:pulse,visualTick:visualTick,TAU:TAU,bow:bow,displayOnly:!!displayOnly,handColor:handColor});ctx.restore();
        }else{
            heldRenderAudit.fallback++;
            // Generic art is only a fallback for weapons without a renderer.
            foundation();
            ctx.fillStyle='#444';ctx.fillRect(4,-4,23,8);ctx.fillStyle=w.color;ctx.fillRect(15,-3,15,6);
            finish();
        }
        if(!displayOnly)hands();ctx.shadowBlur=0;
    }
var ENEMY_BASE = CONTENT.enemies;
    Object.keys(SIGNATURE_ENEMIES).forEach(function(kind){ENEMY_BASE[kind]=SIGNATURE_ENEMIES[kind];});

    function enemyHpScaleAt(n){
        n=Math.max(1,Math.floor(n||1));
        if(n>40)return 3.5;
        if(n>30)return 2.5;
        if(n>20)return 1.8;
        if(n>10)return 1.3;
        return 1.15;
    }
    function bossPressureTierAt(n){return Math.max(0,Math.floor(Math.max(5,Number(n)||5)/5)-1);}
    function bossHealthScaleAt(n){return 1+Math.min(1.25,bossPressureTierAt(n)*.09);}

    function Enemy(x, y, kind) {
        var base = ENEMY_BASE[kind] || { color: '#e74c3c', radius: 14, hp: 12, speed: 1.5 };
        Entity.call(this, x, y, base.radius, base.color);
        this.kind = kind; this.name = base.name || 'Enemy'; this.speed = base.speed || 1;this.baseColor=base.color;
        this.signature=SIGNATURE_ENEMIES[kind]||null;this.signatureClock=this.signature?rand(0,this.signature.cooldown*.55):0;this.signatureState='idle';this.signatureTimer=0;this.signatureAim=0;this.signatureTargetX=x;this.signatureTargetY=y;this.signatureUses=0;
        this.biomeVariantKey=!this.signature&&currentBiome&&ENEMY_VARIANTS[currentBiome.hazard]?currentBiome.hazard:'';this.biomeVariant=this.biomeVariantKey?ENEMY_VARIANTS[this.biomeVariantKey]:null;if(this.biomeVariant)this.color=mixHexColor(base.color,this.biomeVariant.tint,.42);this.variantClock=this.biomeVariant?rand(0,this.biomeVariant.cooldown*.65):0;this.variantState='idle';this.variantTimer=0;this.variantAim=0;this.variantTargetX=x;this.variantTargetY=y;this.variantUses=0;
        var hpScale = enemyHpScaleAt(wave)*coopHpMultiplier()*Math.max(0,Number(modRule('enemyHealthMultiplier',1))||1);
        if (player && player.pacts.bloodLedger) hpScale *= 1.18;
        this.maxHp = base.hp * hpScale; this.hp = this.maxHp;
        this.timer = kind==='spiral'?rand(0,22):rand(0,90); this.state = 'idle'; this.stateTimer = 0; this.aim = 0; this.orbit = rand(0, TAU);
        this.burn = 0; this.burnTick = 0; this.burnOwnerId='';this.poison=0;this.poisonTick=0;this.poisonOwnerId='';this.freeze = 0; this.stun = 0; this.fieldSlow = 1; this.mark = 0; this.rift = 0; this.touchCooldown = 0;
        this.curse = 0; this.curseTick = 0;this.curseOwnerId=''; this.shards = 0; this.shardTime = 0; this.stars = 0; this.starTime = 0;this.chronoMarks=0;this.chronoMarkTime=0;this.customStatuses=Object.create(null);this.customStatusSlow=1;
        this.puppetGroup=0;this.puppetTimer=0;
        this.hidden=false;this.reflectCooldown=0;this.splitDone=false;this.summonsMade=0;
        this.navSide=this.id%2?1:-1;this.navAngle=0;this.navLock=0;this.navSampleX=x;this.navSampleY=y;this.navSampleClock=0;this.navStuckFlips=0;this.navNeighbors=[];
        this.shieldMax=kind==='shield'?12:0;this.shieldHp=this.shieldMax;
        var eliteChance = .065 + (player && player.pacts.eliteHunt ? .075 : 0);
        this.elite = chance(eliteChance);
        if (this.elite) { this.maxHp *= 1.75; this.hp = this.maxHp; this.speed *= 1.1; this.radius *= 1.12; }
        this.variantActive=!!this.biomeVariant&&(this.elite||this.id%3===0);
        if(kind==='trainingDummy'){this.elite=false;this.maxHp=999999;this.hp=this.maxHp;this.speed=0;this.trainingDummy=true;this.biomeVariant=null;this.biomeVariantKey='';this.variantActive=false;this.color=base.color;}
    }
    Enemy.prototype = Object.create(Entity.prototype);
    Enemy.prototype.constructor = Enemy;
    Enemy.prototype.moveWithNavigation=function(dx,dy,step){
        var distance=Math.hypot(dx,dy);if(distance<.0001)return;
        var desired=Math.atan2(dy,dx),probe=clamp(this.radius*2.35+distance*3,34,68),chosen=desired;
        if(this.navLock>0&&enemyPathClear(this.x,this.y,this.navAngle,probe,this.radius)){
            chosen=this.navAngle;this.navLock=Math.max(0,this.navLock-step);
        }else if(enemyPathClear(this.x,this.y,desired,probe,this.radius)){
            this.navAngle=desired;this.navLock=0;
        }else{
            var side=this.navSide,offsets=[.34,.62,.92,1.22,1.52,-.38,-.72,-1.08,-1.46],bestScore=-Infinity,best=desired+side*1.52;
            for(var ni=0;ni<offsets.length;ni++){
                var offset=offsets[ni]*side,test=desired+offset;
                if(!enemyPathClear(this.x,this.y,test,probe,this.radius))continue;
                var progress=Math.cos(offset),continuity=this.navLock>0?Math.cos(angleDiff(test,this.navAngle))*.24:0,sideLoyalty=offset*side>0?.12:0,score=progress+continuity+sideLoyalty;
                if(score>bestScore){bestScore=score;best=test;}
            }
            chosen=best;this.navAngle=chosen;this.navLock=20;
        }
        var turn=this.navLock>0?.34:.65,motionAngle=desired+angleDiff(chosen,desired)*turn;
        if(!enemyPathClear(this.x,this.y,motionAngle,Math.max(distance,this.radius*.45),this.radius))motionAngle=chosen;
        this.x+=Math.cos(motionAngle)*distance;this.y+=Math.sin(motionAngle)*distance;
        this.navSampleClock+=step;
        if(this.navSampleClock>=24){
            var moved=Math.hypot(this.x-this.navSampleX,this.y-this.navSampleY);
            if(moved<5&&distance>.2){this.navSide*=-1;this.navLock=0;this.navStuckFlips++;}
            this.navSampleX=this.x;this.navSampleY=this.y;this.navSampleClock=0;
        }
    };
    Enemy.prototype.separateFromCrowd=function(){
        if(!enemyGridReady)return;fillEnemyCandidates(this.x,this.y,this.radius+38,this.navNeighbors);var pushX=0,pushY=0,close=0;
        for(var si=0;si<this.navNeighbors.length&&si<18;si++){var other=this.navNeighbors[si];if(other===this||other.dead)continue;var dx=this.x-other.x,dy=this.y-other.y,d=Math.hypot(dx,dy)||.01,min=this.radius+other.radius+5;if(d<min){var strength=(min-d)/min;pushX+=dx/d*strength;pushY+=dy/d*strength;close++;}}
        if(close){var len=Math.hypot(pushX,pushY)||1,amount=Math.min(1.15,.28+close*.12);this.x+=pushX/len*amount;this.y+=pushY/len*amount;}
    };
    function predictedPlayerPoint(target,frames,maxLead){
        target=target||player;var vx=Number(target.motionX)||Number(target._ownerVx)||Number(target._netVx)||0,vy=Number(target.motionY)||Number(target._ownerVy)||Number(target._netVy)||0,limit=Math.max(40,Number(maxLead)||120),leadX=clamp(vx*(Number(frames)||12),-limit,limit),leadY=clamp(vy*(Number(frames)||12),-limit,limit);
        return{x:clamp(target.x+leadX,-ARENA_LIMIT+45,ARENA_LIMIT-45),y:clamp(target.y+leadY,-ARENA_LIMIT+45,ARENA_LIMIT-45)};
    }
    function predictiveEnemyAim(enemy,target,frames,maxLead){var point=predictedPlayerPoint(target,frames,maxLead);return Math.atan2(point.y-enemy.y,point.x-enemy.x);}
    function signatureProjectile(enemy,angle,speed,damage,options){
        options=options||{};var def=enemy.signature||{},shot=spawnBullet(Object.assign({x:enemy.x,y:enemy.y,angle:angle,speed:speed,damage:damage,friendly:false,color:def.accent||enemy.color,radius:5,life:150,sourceId:'signature_'+enemy.kind,type:'signatureBolt'},options));bullets.push(shot);return shot;
    }
    Enemy.prototype.beginSignatureAttack=function(target){
        var def=this.signature;if(!def||!target)return;var point=predictedPlayerPoint(target,12,105);this.signatureState='telegraph';this.signatureTimer=def.telegraph;this.signatureAim=Math.atan2(point.y-this.y,point.x-this.x);this.signatureTargetX=point.x;this.signatureTargetY=point.y;this.signatureClock=0;playSound('enemy.windup',{x:this.x,y:this.y});addRing(this.x,this.y,def.accent,this.radius+28,3);
        if(def.skill==='freezeChime'||def.skill==='podGarden'||def.skill==='gravityBite'||def.skill==='sealedQuadrant')addRing(point.x,point.y,def.accent,def.skill==='sealedQuadrant'?145:78,3);
        else addBeam(this.x,this.y,point.x,point.y,def.accent,2);
    };
    Enemy.prototype.executeSignatureAttack=function(target){
        var def=this.signature,skill=def&&def.skill,a=this.signatureAim,px=this.signatureTargetX,py=this.signatureTargetY;if(!def||!target)return;this.signatureUses++;
        if(skill==='royalSweep'){
            this.x+=Math.cos(a)*82;this.y+=Math.sin(a)*82;for(var rs=-2;rs<=2;rs++)signatureProjectile(this,a+rs*.17,6.4,1.05,{type:'emberTooth',status:'burn'});addRing(this.x,this.y,def.accent,92,5);
        }else if(skill==='freezeChime'){
            for(var fc=-2;fc<=2;fc++)signatureProjectile(this,a+fc*.22,5.8,1,{type:'shard',status:'freeze'});var chill=new TimedField(px,py,62,'frostZone',108);hazards.push(chill);
        }else if(skill==='mirageTriad'){
            var side=this.navSide;this.x=clamp(this.x+Math.cos(a+side*Math.PI/2)*105,-ARENA_LIMIT+35,ARENA_LIMIT-35);this.y=clamp(this.y+Math.sin(a+side*Math.PI/2)*105,-ARENA_LIMIT+35,ARENA_LIMIT-35);this.navSide*=-1;a=Math.atan2(py-this.y,px-this.x);for(var mt=-1;mt<=1;mt++)signatureProjectile(this,a+mt*.2,7.8,1.05,{type:'glassShard',bounce:1});addRing(this.x,this.y,def.accent,58,3);
        }else if(skill==='arcCross'){
            for(var ac=0;ac<4;ac++)signatureProjectile(this,a+ac*Math.PI/2,6.2,1.05,{type:'plasmaNode',homing:.006});for(var af=-1;af<=1;af+=2)signatureProjectile(this,a+af*.16,7.4,1.1,{type:'plasmaNode'});addDataEffect(this.x,this.y,{modelId:'lightningWeb',color:def.color,accent:def.accent,size:92,count:8,durationFrames:18},a);
        }else if(skill==='gravityBite'){
            for(var vb=-2;vb<=2;vb++)signatureProjectile(this,a+vb*.2,5.5,1.05,{type:'eye',homing:.015});var voidMine=new TimedField(px,py,72,'enemyMine',112);voidMine.armTime=62;voidMine.damage=1.2;voidMine.noShards=true;voidMine.color=def.color;hazards.push(voidMine);
        }else if(skill==='bloodLink'){
            var ally=null,missing=0;fillEnemyCandidates(this.x,this.y,340,this.navNeighbors);for(var bl=0;bl<this.navNeighbors.length;bl++){var candidate=this.navNeighbors[bl],loss=candidate===this||candidate.dead?0:candidate.maxHp-candidate.hp;if(loss>missing){missing=loss;ally=candidate;}}if(ally){ally.hp=Math.min(ally.maxHp,ally.hp+Math.min(8,ally.maxHp*.16));addBeam(this.x,this.y,ally.x,ally.y,def.accent,4);addFloat('+',ally.x,ally.y-ally.radius-6,def.accent);}for(var bc=-2;bc<=2;bc++)signatureProjectile(this,a+bc*.2,5.6,1,{type:'petal'});
        }else if(skill==='seedLine'){
            for(var sl=1;sl<=3;sl++){var root=new TimedField(clamp(this.x+Math.cos(a)*sl*92,-ARENA_LIMIT+50,ARENA_LIMIT-50),clamp(this.y+Math.sin(a)*sl*92,-ARENA_LIMIT+50,ARENA_LIMIT-50),52,'rootTrap',138);root.signatureSource=true;hazards.push(root);}signatureProjectile(this,a,7.2,1.1,{type:'thorn',status:'poison'});
        }else if(skill==='riptideWake'){
            var tideSide=this.navSide;this.x+=Math.cos(a+tideSide*Math.PI/2)*118;this.y+=Math.sin(a+tideSide*Math.PI/2)*118;this.navSide*=-1;for(var tw=-2;tw<=2;tw++)signatureProjectile(this,a+Math.PI+tw*.17,6.2,1,{type:'waterDrop'});addBeam(this.x-Math.cos(a+tideSide*Math.PI/2)*118,this.y-Math.sin(a+tideSide*Math.PI/2)*118,this.x,this.y,def.accent,7);
        }else if(skill==='skyDive'){
            this.x=clamp(px-Math.cos(a)*95,-ARENA_LIMIT+35,ARENA_LIMIT-35);this.y=clamp(py-Math.sin(a)*95,-ARENA_LIMIT+35,ARENA_LIMIT-35);for(var gd=-1;gd<=1;gd++)signatureProjectile(this,a+gd*.24,8.2,1.05,{type:'windBolt',pierce:1});addRing(this.x,this.y,def.accent,74,4);
        }else if(skill==='sealedQuadrant'){
            for(var rq=-3;rq<=3;rq++){if(rq===0)continue;signatureProjectile(this,a+rq*.2,5.9,1.05,{type:'page',bounce:1});}var runeMine=new TimedField(px,py,58,'enemyMine',118);runeMine.armTime=74;runeMine.damage=1.1;runeMine.noShards=true;runeMine.color=def.color;hazards.push(runeMine);
        }else if(skill==='mirrorEcho'){
            for(var me=-2;me<=2;me++)signatureProjectile(this,a+me*.16,6.7,1,{type:'shard',bounce:2});signatureProjectile(this,a+Math.PI,5.2,1,{type:'shard',bounce:2});addDataEffect(this.x,this.y,{modelId:'echoCopies',color:def.color,accent:def.accent,size:70,count:5,durationFrames:20},a);
        }else if(skill==='offBeat'){
            for(var ob=0;ob<3;ob++)for(var os=-1;os<=1;os+=2)signatureProjectile(this,a+os*(.09+ob*.1),5.2+ob*1.05,.9+ob*.08,{type:'plasmaNode'});addRing(this.x,this.y,def.accent,108,5);
        }else if(skill==='moltenPounce'){
            var oldX=this.x,oldY=this.y;this.x+=Math.cos(a)*126;this.y+=Math.sin(a)*126;var wake=new TimedField((oldX+this.x)*.5,(oldY+this.y)*.5,52,'enemyFire',104);hazards.push(wake);for(var fh=-2;fh<=2;fh++)signatureProjectile(this,a+Math.PI+fh*.2,5.8,1,{type:'flame',status:'burn'});addBeam(oldX,oldY,this.x,this.y,def.accent,8);
        }else if(skill==='clockSweep'){
            for(var ck=-3;ck<=3;ck++)signatureProjectile(this,a+ck*.19,6.4,1.05,{type:'clockHand',bounce:1,freezeAge:1,resumeAge:22});worldSlowTimer=Math.max(worldSlowTimer,14);addDataEffect(this.x,this.y,{modelId:'clockCrack',color:def.color,accent:def.accent,size:90,count:12,durationFrames:23},a);
        }else if(skill==='crescentConverge'){
            for(var ec=-2;ec<=2;ec++)signatureProjectile(this,a+ec*.31,6.5,1.05,{type:'moonBlade',homing:.012,pierce:1});addDataEffect(px,py,{modelId:'eclipse',color:def.color,accent:def.accent,size:82,count:6,durationFrames:20},a);
        }else if(skill==='podGarden'){
            for(var pg=0;pg<3;pg++){var pa=pg*TAU/3+this.orbit,pod=new TimedField(clamp(px+Math.cos(pa)*92,-ARENA_LIMIT+55,ARENA_LIMIT-55),clamp(py+Math.sin(pa)*92,-ARENA_LIMIT+55,ARENA_LIMIT-55),58,'enemySpore',145);pod.signatureSource=true;hazards.push(pod);addRing(pod.x,pod.y,def.accent,58,3);}signatureProjectile(this,a,4.8,1.1,{type:'spore',blast:48});
        }
        capArray(bullets,980);capArray(hazards,220);this.signatureState='idle';
    };
    Enemy.prototype.updateSignatureEnemy=function(step,target,move,d,a){
        var def=this.signature;if(!def)return false;
        var motion=move*(this.signatureState==='telegraph'?.28:1),role=def.role;
        if(role==='artillery'||role==='support'){
            if(d<285){this.x-=Math.cos(a)*motion;this.y-=Math.sin(a)*motion;}else if(d>455){this.x+=Math.cos(a)*motion;this.y+=Math.sin(a)*motion;}else{this.x+=Math.cos(a+Math.PI/2*this.navSide)*motion*.48;this.y+=Math.sin(a+Math.PI/2*this.navSide)*motion*.48;}
        }else if(role==='skirmisher'){
            this.x+=Math.cos(a+Math.PI/2*this.navSide)*motion*.72;this.y+=Math.sin(a+Math.PI/2*this.navSide)*motion*.72;if(d>330){this.x+=Math.cos(a)*motion*.55;this.y+=Math.sin(a)*motion*.55;}else if(d<155){this.x-=Math.cos(a)*motion*.5;this.y-=Math.sin(a)*motion*.5;}
        }else{
            if(d>185){this.x+=Math.cos(a)*motion;this.y+=Math.sin(a)*motion;}else{this.x+=Math.cos(a+Math.PI/2*this.navSide)*motion*.42;this.y+=Math.sin(a+Math.PI/2*this.navSide)*motion*.42;}
        }
        if(this.signatureState==='telegraph'){this.signatureTimer-=step;if(this.signatureTimer<=0)this.executeSignatureAttack(target);}
        else{this.signatureClock+=step;if(this.signatureClock>=def.cooldown)this.beginSignatureAttack(target);}
        return true;
    };
    function variantProjectile(enemy,angle,speed,damage,options){
        options=options||{};var def=enemy.biomeVariant||{},shot=spawnBullet(Object.assign({x:enemy.x,y:enemy.y,angle:angle,speed:speed,damage:damage,friendly:false,color:def.accent||enemy.color,radius:5,life:145,sourceId:'variant_'+enemy.biomeVariantKey,type:options.type||'orb'},options));bullets.push(shot);return shot;
    }
    Enemy.prototype.beginBiomeVariant=function(target){
        var def=this.biomeVariant;if(!def||!target)return;this.variantState='telegraph';this.variantTimer=def.telegraph;this.variantAim=predictiveEnemyAim(this,target,12,105);var point=predictedPlayerPoint(target,10,85);this.variantTargetX=point.x;this.variantTargetY=point.y;this.variantClock=0;playSound('enemy.windup',{x:this.x,y:this.y});addRing(this.x,this.y,def.accent,this.radius+24,3);
    };
    Enemy.prototype.executeBiomeVariant=function(target){
        var def=this.biomeVariant,key=this.biomeVariantKey,a=this.variantAim,point={x:this.variantTargetX,y:this.variantTargetY};if(!def||!target)return;this.variantUses++;
        if(key==='ember'){for(var ef=-1;ef<=1;ef++)variantProjectile(this,a+ef*.19,6.6,1,{status:'burn',type:'emberTooth'});addDataEffect(this.x,this.y,{modelId:'burst',color:def.tint,accent:def.accent,size:72,count:7,durationFrames:14},a);}
        else if(key==='frost'){for(var ff=-1;ff<=1;ff++)variantProjectile(this,a+ff*.22,5.9,1,{status:'freeze',type:'shard'});hazards.push(new TimedField(point.x,point.y,48,'frostZone',78));}
        else if(key==='sand'){var oldX=this.x,oldY=this.y,side=a+Math.PI/2*this.navSide;this.x=clamp(this.x+Math.cos(side)*92,-ARENA_LIMIT+40,ARENA_LIMIT-40);this.y=clamp(this.y+Math.sin(side)*92,-ARENA_LIMIT+40,ARENA_LIMIT-40);this.resolveObstacles();addBeam(oldX,oldY,this.x,this.y,def.accent,3);variantProjectile(this,a,7.4,1.05,{bounce:1,type:'shard'});this.navSide*=-1;}
        else if(key==='storm'){variantProjectile(this,a-.18,6.8,1,{homing:.012,status:'shock',type:'plasma'});variantProjectile(this,a+.18,6.8,1,{homing:.012,status:'shock',type:'plasma'});addLightning([{x:this.x,y:this.y},{x:point.x,y:point.y}],def.accent);}
        else if(key==='void'){var oldVoidX=this.x,oldVoidY=this.y,behind=Math.atan2(target.y-this.y,target.x-this.x)+Math.PI;this.x=clamp(target.x+Math.cos(behind)*220,-ARENA_LIMIT+55,ARENA_LIMIT-55);this.y=clamp(target.y+Math.sin(behind)*220,-ARENA_LIMIT+55,ARENA_LIMIT-55);this.resolveObstacles();addBeam(oldVoidX,oldVoidY,this.x,this.y,def.tint,4);variantProjectile(this,Math.atan2(target.y-this.y,target.x-this.x),7.8,1.15,{homing:.018,ghost:true,type:'eye'});}
        else if(key==='blood'){var distance=Math.hypot(target.x-this.x,target.y-this.y);if(distance<170){var before=target.hp,bloodEnemy=this;withActivePlayer(target,function(){target.hit(.85,'sanguine grasp');});if(target.hp<before){bloodEnemy.hp=Math.min(bloodEnemy.maxHp,bloodEnemy.hp+2);addBeam(bloodEnemy.x,bloodEnemy.y,target.x,target.y,def.accent,5);}}else for(var bf=-1;bf<=1;bf++)variantProjectile(this,a+bf*.2,5.8,1,{homing:.006,type:'petal'});}
        else if(key==='thorn'){var root=new TimedField(point.x,point.y,62,'rootTrap',145);root.variantSource=true;hazards.push(root);addDataEffect(point.x,point.y,{modelId:'rune',color:def.tint,accent:def.accent,size:82,count:8,durationFrames:24},0);}
        else if(key==='tide'){for(var tf=-1;tf<=1;tf++){variantProjectile(this,a+tf*.34,6.1,1,{bounce:1,type:'droplet'});variantProjectile(this,a+Math.PI+tf*.2,4.4,.8,{type:'droplet'});}addDataEffect(this.x,this.y,{modelId:'wave',color:def.tint,accent:def.accent,size:92,count:6,durationFrames:18},a);}
        else if(key==='cloud'){var gust=a+Math.PI/2*this.navSide,oldCloudX=this.x,oldCloudY=this.y;this.x+=Math.cos(gust)*118;this.y+=Math.sin(gust)*118;this.resolveObstacles();addBeam(oldCloudX,oldCloudY,this.x,this.y,def.accent,4);for(var cf=-1;cf<=1;cf++)variantProjectile(this,a+cf*.14,7.3,.95,{ghost:true,type:'feather'});this.navSide*=-1;}
        else if(key==='glyph'){var runeMine=new TimedField(point.x,point.y,54,'enemyMine',100);runeMine.armTime=72;runeMine.damage=1;runeMine.noShards=true;runeMine.variantSource=true;runeMine.color=def.accent;hazards.push(runeMine);addDataEffect(point.x,point.y,{modelId:'rune',color:def.tint,accent:def.accent,size:76,count:8,durationFrames:30},0);}
        else if(key==='mirror'){for(var mirror=-1;mirror<=1;mirror++)variantProjectile(this,a+mirror*.28,6.3,1,{bounce:2,type:'shard'});addDataEffect(this.x,this.y,{modelId:'echoCopies',color:def.tint,accent:def.accent,size:68,count:5,durationFrames:20},a);}
        else if(key==='neon'){for(var beat=0;beat<3;beat++)variantProjectile(this,a+(beat-1)*.13,5.7+beat*1.05,.9+beat*.08,{homing:.006,type:'plasmaNode'});addDataEffect(this.x,this.y,{modelId:'ring',color:def.tint,accent:def.accent,size:82,count:6,durationFrames:18},0);}
        else if(key==='magma'){hazards.push(new TimedField(this.x,this.y,48,'enemyFire',92));for(var magma=-2;magma<=2;magma++)variantProjectile(this,a+magma*.17,5.8,1,{status:'burn',type:'flame'});}
        else if(key==='gear'){variantProjectile(this,a,6.8,1.05,{bounce:1,type:'clockHand'});variantProjectile(this,a,7.2,1.05,{bounce:1,type:'clockHand',freezeAge:1,resumeAge:24});addDataEffect(this.x,this.y,{modelId:'clockCrack',color:def.tint,accent:def.accent,size:76,count:12,durationFrames:24},0);}
        else if(key==='moon'){for(var moon=-2;moon<=2;moon++)variantProjectile(this,a+moon*.18,6.7,1,{homing:.008,pierce:1,type:'moonBlade'});addDataEffect(this.x,this.y,{modelId:'eclipse',color:def.tint,accent:def.accent,size:70,count:6,durationFrames:18},a);}
        else if(key==='spore'){variantProjectile(this,a,4.7,1.1,{type:'shell',blast:58,life:Math.min(115,Math.hypot(point.x-this.x,point.y-this.y)/4.7)});addDataEffect(this.x,this.y,{modelId:'smoke',color:def.tint,accent:def.accent,size:76,count:7,durationFrames:22},a);}
        capArray(bullets,980);this.variantState='idle';
    };
    Enemy.prototype.updateBiomeVariant=function(step,target){
        if(!this.variantActive||!this.biomeVariant||this.dead||this.hidden)return;if(this.variantState==='telegraph'){this.variantTimer-=step;if(this.variantTimer<=0)this.executeBiomeVariant(target);return;}this.variantClock+=step;if(this.variantClock>=this.biomeVariant.cooldown)this.beginBiomeVariant(target);
    };
    Enemy.prototype.updateStatus = function (step) {
        this.fieldSlow = 1;this.customStatusSlow=1;
        if (this.flash > 0) this.flash -= step; if (this.stun > 0) this.stun -= step; if (this.freeze > 0) this.freeze -= step; if (this.rift > 0) this.rift -= step;
        if (this.burn > 0) { this.burn -= step; this.burnTick += step; if (this.burnTick > 30) { this.burnTick = 0;var burnTarget=this,burnOwner=playerByNetId(this.burnOwnerId)||player;withActivePlayer(burnOwner,function(){damageEnemy(burnTarget,1.1*(burnOwner.passives.alchemist?1.35:1),{direct:false,silent:true});}); } }
        if(this.poison>0){this.poison-=step;this.poisonTick+=step;if(this.poisonTick>=45){this.poisonTick-=45;var poisonTarget=this,poisonOwner=playerByNetId(this.poisonOwnerId)||player;withActivePlayer(poisonOwner,function(){damageEnemy(poisonTarget,1.35*(poisonOwner.passives.alchemist?1.35:1),{direct:false,silent:true});});}}
        if (this.curse > 0) { this.curse -= step; this.curseTick += step; if (this.curseTick >= 60) { this.curseTick -= 60;var curseTarget=this,curseOwner=playerByNetId(this.curseOwnerId)||player;withActivePlayer(curseOwner,function(){damageEnemy(curseTarget,1,{direct:false,silent:true});}); addFloat('1 CURSE', this.x, this.y - this.radius - 10, '#b784ff'); } }
        if (this.shardTime > 0) { this.shardTime -= step; if (this.shardTime <= 0) this.shards = 0; }
        if (this.starTime > 0) { this.starTime -= step; if (this.starTime <= 0) this.stars = 0; }
        if(this.chronoMarkTime>0){this.chronoMarkTime-=step;if(this.chronoMarkTime<=0)this.chronoMarks=0;}
        if(this.puppetTimer>0){this.puppetTimer-=step;if(this.puppetTimer<=0)this.puppetGroup=0;}
        if(this.nailTime>0){this.nailTime-=step;if(this.nailTime<=0)this.nails=0;}
        if(this.reactionCooldown>0)this.reactionCooldown-=step;
        if (this.reflectCooldown > 0) this.reflectCooldown -= step;
        if (this.touchCooldown > 0) this.touchCooldown -= step;
        var custom=this.customStatuses||(this.customStatuses=Object.create(null)),statusIds=Object.keys(custom);for(var ci=0;ci<statusIds.length;ci++){var statusId=statusIds[ci],state=custom[statusId],definition=STATUS_EFFECTS[statusId];if(!state||!definition){delete custom[statusId];continue;}state.remaining-=step;this.customStatusSlow=Math.min(this.customStatusSlow,Math.max(.1,Number(definition.moveMultiplier)||1));var interval=Math.max(0,Number(definition.tickIntervalFrames)||0),tickDamage=Math.max(0,Number(definition.tickDamage)||0);if(interval>0&&tickDamage>0){state.tick=(Number(state.tick)||0)+step;while(state.tick>=interval&&state.remaining>0){state.tick-=interval;var statusTarget=this,statusOwner=playerByNetId(state.ownerId)||player,statusDamage=tickDamage*Math.max(1,Number(state.stacks)||1);withActivePlayer(statusOwner,function(){damageEnemy(statusTarget,statusDamage*(statusOwner.passives.alchemist?1.35:1),{direct:false,silent:true,customStatusTick:true});});}}if(state.remaining<=0)delete custom[statusId];}
    };
    Enemy.prototype.update = function (step) {
        if(this.trainingDummy){this.updateStatus(step);return;}
        this.updateStatus(step); if (this.dead || this.stun > 0) return;
        var moveStartX=this.x,moveStartY=this.y;
        var dx = player.x - this.x, dy = player.y - this.y, d = Math.hypot(dx, dy) || 1, a = Math.atan2(dy, dx);
        for(var fh=0;fh<hazards.length;fh++){var field=hazards[fh];if(!field.dead&&Math.hypot(this.x-field.x,this.y-field.y)<(field.radius||0)){if(field.kind==='chrono')this.fieldSlow=.42;if(field.kind==='frostZone')this.fieldSlow=Math.min(this.fieldSlow,.44);if(field.kind==='rootBloom'||field.kind==='rootTrap'&&field.timer>=48)this.fieldSlow=Math.min(this.fieldSlow,.5);if(field.kind==='glyph')this.fieldSlow=1.32;}}
        var slow = (this.freeze > 0 ? .48 : 1) * this.fieldSlow * this.customStatusSlow * (worldSlowTimer > 0 ? worldSlowScale : 1),bannerBoost=1;
        if(this.kind!=='bannerBearer'&&enemyGridReady){fillEnemyCandidates(this.x,this.y,205,this.navNeighbors);for(var bannerScan=0;bannerScan<this.navNeighbors.length;bannerScan++){var bannerAlly=this.navNeighbors[bannerScan];if(!bannerAlly.dead&&bannerAlly.kind==='bannerBearer'){bannerBoost=1.18;break;}}}
        var move = this.speed * slow * bannerBoost * step; this.timer += step; this.orbit += .018 * step;

        if (this.signature) { this.updateSignatureEnemy(step,player,move,d,a); }
        else if (this.kind === 'chaser') { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; }
        else if (this.kind === 'shooter') {
            var shooterAim=predictiveEnemyAim(this,player,18,125);if (d > 310) { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; } else if (d < 220) { this.x -= Math.cos(a) * move; this.y -= Math.sin(a) * move; }else{this.x+=Math.cos(a+Math.PI/2*this.navSide)*move*.42;this.y+=Math.sin(a+Math.PI/2*this.navSide)*move*.42;}
            if (this.timer > 132) { this.timer = 0;this.navSide*=-1;enemyShot(this, shooterAim, 7.2, 1.1, '#9b59b6'); }
        } else if (this.kind === 'tank') { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; }
        else if (this.kind === 'spiral') {
            this.x += Math.cos(a + Math.PI / 2) * move * .55; this.y += Math.sin(a + Math.PI / 2) * move * .55;
            if (this.timer > 44) { this.timer = 0; enemyShot(this, this.orbit * 2.4, 4.2, 1, '#a55eea'); }
        } else if (this.kind === 'nova') {
            if (this.state === 'charge') { this.stateTimer -= step; if (this.stateTimer <= 0) { enemyNova(this, 12, 6, '#2ecc71'); this.state = 'idle'; this.timer = 0; } }
            else if (d > 180) { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; } else if (this.timer > 75) { this.state = 'charge'; this.stateTimer = 48; }
        } else if (this.kind === 'summoner') {
            if (d < 360) { this.x -= Math.cos(a) * move; this.y -= Math.sin(a) * move; } else if (d > 480) { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; }
            if (this.timer > 330 && this.summonsMade < 3 && enemies.length < 55) { this.timer = 0;this.summonsMade++; spawnEnemy(this.x + rand(-55,55), this.y + rand(-55,55), 'chaser',true); addRing(this.x, this.y, '#34495e', 65, 4); }
        } else if (this.kind === 'orbiter') {
            var tx = player.x + Math.cos(this.orbit) * 245, ty = player.y + Math.sin(this.orbit) * 245; var ta = Math.atan2(ty - this.y, tx - this.x);
            this.x += Math.cos(ta) * move; this.y += Math.sin(ta) * move;
            if (this.timer > 92) { this.timer = 0; enemyShot(this, predictiveEnemyAim(this,player,12,95), 7.8, 1, '#00d2d3'); }
        } else if (this.kind === 'charger') {
            if (this.state === 'telegraph') { this.stateTimer -= step;if(this.stateTimer>18)this.aim=predictiveEnemyAim(this,player,8,85);if (this.stateTimer <= 0) { this.state = 'charge'; this.stateTimer = 28; } }
            else if (this.state === 'charge') { this.x += Math.cos(this.aim) * 9.2 * step; this.y += Math.sin(this.aim) * 9.2 * step; this.stateTimer -= step; if (this.stateTimer <= 0) { this.state = 'idle'; this.timer = 0; } }
            else { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; if (this.timer > 118) { this.state = 'telegraph'; this.stateTimer = 38;this.aim=predictiveEnemyAim(this,player,8,85);addBeam(this.x,this.y,this.x+Math.cos(this.aim)*300,this.y+Math.sin(this.aim)*300,this.color,2); } }
        } else if (this.kind === 'shield') {
            this.aim = a; if (d > 170) { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; } if (this.timer > 105) { this.timer = 0; enemyShot(this, a, 4.5, 1.2, '#95a5a6'); }
        } else if (this.kind === 'bomber') {
            if (d < 300) { this.x -= Math.cos(a) * move; this.y -= Math.sin(a) * move; } else if (d > 470) { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; }
            if (this.timer > 148) { this.timer = 0;var lobPoint=predictedPlayerPoint(player,16,115),lobAim=Math.atan2(lobPoint.y-this.y,lobPoint.x-this.x),lobDistance=Math.hypot(lobPoint.x-this.x,lobPoint.y-this.y);bullets.push(spawnBullet({ x: this.x, y: this.y, angle: lobAim, speed: 5.2, damage: 1.25, friendly: false, color: '#f39c12', radius: 7, type: 'shell', blast: 54, life: Math.min(96, lobDistance / 5.2) }));addRing(this.x,this.y,'#f6c36d',40,3); }
        } else if (this.kind === 'leech') { this.x += Math.cos(a) * move; this.y += Math.sin(a) * move; }
        else if (this.kind === 'briar') {
            if(this.state==='burrow'){this.hidden=true;this.x+=Math.cos(a)*move*2.25;this.y+=Math.sin(a)*move*2.25;this.stateTimer-=step;if(this.stateTimer<=0){this.hidden=false;this.state='idle';this.timer=0;enemyNova(this,8,4.6,'#62c370');addRing(this.x,this.y,'#b7efc5',92,5);}}
            else{this.hidden=false;this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;if(this.timer>145){this.state='burrow';this.stateTimer=52;addRing(this.x,this.y,'#315f39',45,3);}}
        } else if (this.kind === 'tidecaller') {
            if(this.state==='channel'){this.stateTimer-=step;var pullA=Math.atan2(this.y-player.y,this.x-player.x);if(d<430){player.x+=Math.cos(pullA)*.65*step;player.y+=Math.sin(pullA)*.65*step;}if(this.stateTimer<=0){enemyNova(this,10,5.2,'#35b9c7');this.state='idle';this.timer=0;}}
            else{if(d<270){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>390){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}if(this.timer>135){this.state='channel';this.stateTimer=48;addRing(this.x,this.y,'#35b9c7',420,4);}}
        } else if (this.kind === 'scribe') {
            if(d<270){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>430){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}
            if(this.timer>112){this.timer=0;for(var pg=-2;pg<=2;pg++)bullets.push(spawnBullet({x:this.x,y:this.y,angle:a+pg*.19,speed:5.4,damage:1,friendly:false,color:'#e0b84f',radius:6,bounce:1,life:175,type:'page',sourceId:'scribePage'}));}
        } else if (this.kind === 'prism') {
            this.x+=Math.cos(a+Math.PI/2)*move*.65;this.y+=Math.sin(a+Math.PI/2)*move*.65;if(d>330){this.x+=Math.cos(a)*move*.45;this.y+=Math.sin(a)*move*.45;}
            if(this.timer>96){this.timer=0;for(var pr=-1;pr<=1;pr++)enemyShot(this,a+pr*.24,6.4,1,'#9ce7ff');}
        } else if (this.kind === 'splitter') { this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move; }
        else if (this.kind === 'shardling') { this.x+=Math.cos(a+Math.sin(this.orbit*5)*.35)*move;this.y+=Math.sin(a+Math.sin(this.orbit*5)*.35)*move; }
        else if (this.kind === 'cinderling') {
            var cask=null,caskD=Infinity;for(var ci=0;ci<biomeProps.length;ci++){var cp=biomeProps[ci],cd=Math.hypot(cp.x-this.x,cp.y-this.y);if(!cp.dead&&(cp.kind==='emberCask'||cp.kind==='royalBrazier')&&cd<caskD){cask=cp;caskD=cd;}}
            if(cask){var ca=Math.atan2(cask.y-this.y,cask.x-this.x);this.x+=Math.cos(ca)*move*1.2;this.y+=Math.sin(ca)*move*1.2;if(caskD<cask.radius+this.radius+4){triggerBiomeProp(cask,false);this.stun=24;}}
            else{this.x+=Math.cos(a+Math.sin(this.orbit*4)*.2)*move;this.y+=Math.sin(a+Math.sin(this.orbit*4)*.2)*move;}
        } else if (this.kind === 'frostshaper') {
            if(d<300){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>470){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}
            if(this.timer>245){this.timer=0;var ia=rand(0,TAU),idist=rand(125,220),ix=clamp(player.x+Math.cos(ia)*idist,-1120,1120),iy=clamp(player.y+Math.sin(ia)*idist,-1120,1120);if(biomeProps.filter(function(p){return!p.dead;}).length<8){biomeProps.push(new BiomeProp(ix,iy,'iceCrate'));addRing(ix,iy,'#8edbff',62,4);addFloat('ICE RAISED',ix,iy-34,'#dff7ff');}for(var fs=-1;fs<=1;fs++)enemyShot(this,a+fs*.24,4.7,1,'#8edbff');}
        } else if (this.kind === 'rootweaver') {
            if(d<290){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>440){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}
            if(this.timer>178){this.timer=0;var rx=clamp(player.x+Math.cos(a)*55,-1150,1150),ry=clamp(player.y+Math.sin(a)*55,-1150,1150);hazards.push(new TimedField(rx,ry,88,'rootTrap',170));addRing(rx,ry,'#6fe38b',88,3);}
        } else if (this.kind === 'glassDuelist') {
            if(this.state==='telegraph'){this.stateTimer-=step;this.aim=a;if(this.stateTimer<=0){this.state='dash';this.stateTimer=22;addRing(this.x,this.y,'#fff',48,3);}}
            else if(this.state==='dash'){this.x+=Math.cos(this.aim)*12.5*step;this.y+=Math.sin(this.aim)*12.5*step;this.stateTimer-=step;if(this.stateTimer<=0){this.state='recover';this.stateTimer=35;for(var gd=-1;gd<=1;gd++)enemyShot(this,this.aim+Math.PI+gd*.34,6,1,'#a8efff');}}
            else if(this.state==='recover'){this.stateTimer-=step;if(this.stateTimer<=0){this.state='idle';this.timer=0;}}
            else{this.x+=Math.cos(a+Math.PI/2)*move*.65;this.y+=Math.sin(a+Math.PI/2)*move*.65;if(d>310){this.x+=Math.cos(a)*move*.55;this.y+=Math.sin(a)*move*.55;}if(this.timer>128){this.state='telegraph';this.stateTimer=34;this.aim=a;}}
        } else if(this.kind==='slagKnight') {
            if(this.state==='charge'){this.x+=Math.cos(this.aim)*8.6*step;this.y+=Math.sin(this.aim)*8.6*step;this.stateTimer-=step;if(intervalElapsed(this,'slagTrail',step,9))hazards.push(new TimedField(this.x,this.y,38,'enemyFire',75));if(this.stateTimer<=0){this.state='idle';this.timer=0;}}
            else{this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;if(this.timer>145){this.state='charge';this.stateTimer=35;this.aim=a;addBeam(this.x,this.y,this.x+Math.cos(a)*300,this.y+Math.sin(a)*300,'#ff6a32',4);}}
        } else if(this.kind==='chronomancer') {
            if(d<260){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>430){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}if(this.timer>155){this.timer=0;var oldX=this.x,oldY=this.y,ta=a+Math.PI+rand(-.7,.7);this.x=clamp(player.x+Math.cos(ta)*rand(260,360),-WORLD_LIMIT,WORLD_LIMIT);this.y=clamp(player.y+Math.sin(ta)*rand(260,360),-WORLD_LIMIT,WORLD_LIMIT);addBeam(oldX,oldY,this.x,this.y,'#ffd36a',5);for(var ct=0;ct<6;ct++)enemyShot(this,ct*TAU/6+this.orbit,4.8,1,'#ffd36a');worldSlowTimer=Math.max(worldSlowTimer,22);}
        } else if(this.kind==='boneArcher') {
            if(this.state==='aim'){this.stateTimer-=step;this.aim=a;if(this.stateTimer<=0){bullets.push(spawnBullet({x:this.x,y:this.y,angle:this.aim,speed:10.5,damage:1.4,friendly:false,color:'#c9d1ff',radius:5,life:125,type:'moonBlade',sourceId:'boneArrow'}));this.state='idle';this.timer=0;}}
            else{if(d<300){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>500){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}else{this.x+=Math.cos(a+Math.PI/2)*move*.7;this.y+=Math.sin(a+Math.PI/2)*move*.7;}if(this.timer>125){this.state='aim';this.stateTimer=42;this.aim=a;addBeam(this.x,this.y,this.x+Math.cos(a)*620,this.y+Math.sin(a)*620,'#c9d1ff',2);}}
        } else if(this.kind==='sporeHost') {
            if(d<250){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>400){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}if(this.timer>138){this.timer=0;var sx=clamp(player.x+rand(-55,55),-WORLD_LIMIT,WORLD_LIMIT),sy=clamp(player.y+rand(-55,55),-WORLD_LIMIT,WORLD_LIMIT);hazards.push(new TimedField(sx,sy,72,'enemySpore',190));addRing(sx,sy,'#b6e86b',72,3);}
        } else if(this.kind==='vaultSkitter') {
            if(this.state==='pounce'){this.x+=Math.cos(this.aim)*10.8*step;this.y+=Math.sin(this.aim)*10.8*step;this.stateTimer-=step;if(this.stateTimer<=0){this.state='idle';this.timer=0;}}
            else{var skitterAngle=a+Math.sin(this.orbit*6)*.82;this.x+=Math.cos(skitterAngle)*move;this.y+=Math.sin(skitterAngle)*move;if(this.timer>96&&d<520){this.state='pounce';this.stateTimer=17;this.aim=a;addBeam(this.x,this.y,this.x+Math.cos(a)*220,this.y+Math.sin(a)*220,'#d0a45b',2);}}
        } else if(this.kind==='mineLayer') {
            if(d<310){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>470){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}else{this.x+=Math.cos(a+Math.PI/2*this.navSide)*move*.62;this.y+=Math.sin(a+Math.PI/2*this.navSide)*move*.62;}if(this.timer>164){this.timer=0;this.navSide*=-1;var mineIntent=predictedPlayerPoint(player,16,110),mineX=clamp(mineIntent.x+rand(-22,22),-ARENA_LIMIT+78,ARENA_LIMIT-78),mineY=clamp(mineIntent.y+rand(-22,22),-ARENA_LIMIT+78,ARENA_LIMIT-78),mine=new TimedField(mineX,mineY,68,'enemyMine',122);mine.color=this.color;mine.armTime=78;mine.damage=1.35;hazards.push(mine);addRing(mineX,mineY,this.color,68,3);}
        } else if(this.kind==='blinkStalker') {
            if(this.state==='vanish'){this.hidden=true;this.stateTimer-=step;if(this.stateTimer<=0){var blinkOldX=this.x,blinkOldY=this.y,blinkAngle=a+Math.PI+rand(-.5,.5);this.x=clamp(player.x+Math.cos(blinkAngle)*155,-ARENA_LIMIT+30,ARENA_LIMIT-30);this.y=clamp(player.y+Math.sin(blinkAngle)*155,-ARENA_LIMIT+30,ARENA_LIMIT-30);this.aim=Math.atan2(player.y-this.y,player.x-this.x);this.hidden=false;this.state='lunge';this.stateTimer=18;addBeam(blinkOldX,blinkOldY,this.x,this.y,'#bd77e8',5);addRing(this.x,this.y,'#ead8ff',48,4);}}
            else if(this.state==='lunge'){this.hidden=false;this.x+=Math.cos(this.aim)*9.4*step;this.y+=Math.sin(this.aim)*9.4*step;this.stateTimer-=step;if(this.stateTimer<=0){this.state='idle';this.timer=0;}}
            else{this.hidden=false;this.x+=Math.cos(a+Math.sin(this.orbit*3)*.35)*move;this.y+=Math.sin(a+Math.sin(this.orbit*3)*.35)*move;if(this.timer>168){this.state='vanish';this.stateTimer=28;addRing(this.x,this.y,'#bd77e8',64,4);}}
        } else if(this.kind==='bannerBearer') {
            if(d<330){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>470){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}if(this.timer>142){this.timer=0;for(var bannerShot=-2;bannerShot<=2;bannerShot++)enemyShot(this,a+bannerShot*.18,5.2,1,'#e85b62');addRing(this.x,this.y,'#ffb0b5',205,4);}
        } else if(this.kind==='lanternMite') {
            var lanternTargetX=player.x+Math.cos(this.orbit*1.35)*195,lanternTargetY=player.y+Math.sin(this.orbit*1.35)*195,lanternAngle=Math.atan2(lanternTargetY-this.y,lanternTargetX-this.x);this.x+=Math.cos(lanternAngle)*move;this.y+=Math.sin(lanternAngle)*move;if(this.timer>108){this.timer=0;bullets.push(spawnBullet({x:this.x,y:this.y,angle:a,speed:4.6,damage:1,friendly:false,color:'#5fbce8',radius:6,life:165,homing:.018,manaDrain:6,type:'manaNeedle',sourceId:'lanternMite'}));}
        } else if(this.kind==='ashMauler') {
            if(this.state==='slam'){this.stateTimer-=step;if(this.stateTimer<=0){enemyNova(this,10,5.3,'#f47b3c');hazards.push(new TimedField(this.x,this.y,105,'enemyFire',115));this.state='idle';this.timer=0;}}
            else{this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;if(this.timer>132&&d<360){this.state='slam';this.stateTimer=38;addRing(this.x,this.y,'#ffb06a',150,6);}}
        } else if(this.kind==='frostLantern') {
            var flx=player.x+Math.cos(this.orbit)*320,fly=player.y+Math.sin(this.orbit)*320,fla=Math.atan2(fly-this.y,flx-this.x);this.x+=Math.cos(fla)*move;this.y+=Math.sin(fla)*move;if(this.timer>138){this.timer=0;var frostAim=predictiveEnemyAim(this,player,14,100),frostMark=predictedPlayerPoint(player,8,62);for(var fls=-1;fls<=1;fls++)enemyShot(this,frostAim+fls*.18,5.6,1,'#a8ebff',.008);hazards.push(new TimedField(clamp(frostMark.x+rand(-34,34),-ARENA_LIMIT,ARENA_LIMIT),clamp(frostMark.y+rand(-34,34),-ARENA_LIMIT,ARENA_LIMIT),58,'frostZone',92));}
        } else if(this.kind==='duneScarab') {
            if(this.state==='dash'){this.x+=Math.cos(this.aim)*10.2*step;this.y+=Math.sin(this.aim)*10.2*step;this.stateTimer-=step;if(this.stateTimer<=0){this.state='idle';this.timer=0;for(var ds=-1;ds<=1;ds+=2)enemyShot(this,this.aim+Math.PI+ds*.3,5.4,1,'#d6b35f');}}
            else{this.x+=Math.cos(a+Math.sin(this.orbit*4)*.6)*move;this.y+=Math.sin(a+Math.sin(this.orbit*4)*.6)*move;if(this.timer>105){this.state='dash';this.stateTimer=20;this.aim=a;addBeam(this.x,this.y,this.x+Math.cos(a)*245,this.y+Math.sin(a)*245,'#f4d58a',2);}}
        } else if(this.kind==='arcTetherer') {
            if(d<280){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>440){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}if(this.timer>142){this.timer=0;enemyShot(this,a-.16,6,1,'#b786ff',.01);enemyShot(this,a+.16,6,1,'#b786ff',.01);if(d<520){player.x-=Math.cos(a)*10;player.y-=Math.sin(a)*10;addBeam(this.x,this.y,player.x,player.y,'#d5b7ff',4);}}
        } else if(this.kind==='roseChorister') {
            if(d<300){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>460){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}if(this.timer>155){this.timer=0;for(var rc=-2;rc<=2;rc++)enemyShot(this,a+rc*.23,5.2,1,'#ff7896');fillEnemyCandidates(this.x,this.y,250,this.navNeighbors);for(var rh=0;rh<this.navNeighbors.length;rh++){var ally=this.navNeighbors[rh];if(ally!==this&&!ally.dead){ally.hp=Math.min(ally.maxHp,ally.hp+2.5);addFloat('+',ally.x,ally.y-ally.radius,'#ffb3c4');}}}
        } else if(this.kind==='tideSkater') {
            var skate=a+Math.PI/2*(this.navSide)+Math.sin(this.orbit*5)*.35;this.x+=Math.cos(skate)*move;this.y+=Math.sin(skate)*move;if(d>360){this.x+=Math.cos(a)*move*.5;this.y+=Math.sin(a)*move*.5;}if(this.timer>92){this.timer=0;enemyShot(this,a,7.2,1,'#58dbe5');enemyShot(this,a+Math.PI,4.8,1,'#baf8ff');this.navSide*=-1;}
        } else if(this.kind==='mirrorMimic') {
            this.x+=Math.cos(a+Math.PI/2)*move*.65;this.y+=Math.sin(a+Math.PI/2)*move*.65;if(d>350){this.x+=Math.cos(a)*move*.45;this.y+=Math.sin(a)*move*.45;}if(this.timer>118){this.timer=0;var mimicCount=player&&player.weapon&&player.weapon.count?Math.min(5,player.weapon.count):1;for(var mm=0;mm<mimicCount;mm++)enemyShot(this,a+(mm-(mimicCount-1)/2)*.16,6.4,1,'#b9f4ff');addRing(this.x,this.y,'#effdff',58,3);}
        } else if(this.kind==='sporeMortar') {
            if(d<330){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>540){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}if(this.timer>148){this.timer=0;bullets.push(spawnBullet({x:this.x,y:this.y,angle:a,speed:4.2,damage:1.2,friendly:false,color:'#c4ed73',radius:8,type:'shell',blast:82,life:Math.min(120,d/4.2),sourceId:'sporeMortar'}));}
        } else if(this.kind==='chainWarden') {
            if(this.state==='aim'){this.stateTimer-=step;this.aim=a;if(this.stateTimer<=0){for(var chainGap=-1;chainGap<=1;chainGap+=2){enemyShot(this,this.aim+chainGap*.17,6.1,1.15,'#cbd2da');enemyShot(this,this.aim+chainGap*.38,5.4,1,'#8796a6');}this.state='idle';this.timer=0;addRing(this.x,this.y,'#cbd2da',92,4);}}
            else{if(d<285){this.x-=Math.cos(a)*move;this.y-=Math.sin(a)*move;}else if(d>430){this.x+=Math.cos(a)*move;this.y+=Math.sin(a)*move;}if(this.timer>152){this.state='aim';this.stateTimer=40;this.aim=a;addBeam(this.x,this.y,this.x+Math.cos(a)*620,this.y+Math.sin(a)*620,'#9da8b5',3);}}
        }

        this.updateBiomeVariant(step,player);
        if(this.dead)return;
        var intentX=this.x-moveStartX,intentY=this.y-moveStartY,intentLength=Math.hypot(intentX,intentY),specialMotion=intentLength>Math.max(18,this.speed*slow*step*4)||this.state==='charge'||this.state==='dash'||this.state==='burrow'||this.state==='pounce'||this.state==='lunge'||this.state==='vanish';
        this.x=moveStartX;this.y=moveStartY;if(specialMotion){this.x+=intentX;this.y+=intentY;}else this.moveWithNavigation(intentX,intentY,step);
        this.separateFromCrowd();this.resolveObstacles(); this.x = clamp(this.x, -ARENA_LIMIT, ARENA_LIMIT); this.y = clamp(this.y, -ARENA_LIMIT, ARENA_LIMIT);
        if (d < this.radius + player.radius && this.touchCooldown <= 0) {
            player.hit(1, this.kind); this.touchCooldown = 48;
            if (this.kind === 'leech' && !player.isDashing) this.hp = Math.min(this.maxHp, this.hp + 6);if(this.kind==='lanternMite'&&!player.isDashing){player.mana=Math.max(0,player.mana-8);addFloat('-8 MANA',player.x,player.y-42,'#8edbff');}
        }
    };
    Enemy.prototype.blocks = function (b) {
        if(this.kind==='prism'&&b.friendly&&this.reflectCooldown<=0){this.reflectCooldown=105;addRing(this.x,this.y,'#e9fbff',55,4);return true;}
        if (this.kind !== 'shield' || this.shieldHp<=0) return false;
        var incoming = Math.atan2(b.y - this.y, b.x - this.x); return Math.abs(angleDiff(incoming, this.aim)) < 1.15;
    };
    Enemy.prototype.drawBiomeVariantSkin=function(){
        var def=this.biomeVariant;if(!def)return;ctx.save();ctx.strokeStyle=def.accent;ctx.fillStyle=def.tint;ctx.lineWidth=2;ctx.globalAlpha=.72;var r=this.radius+5,sigil=def.sigil;
        if(sigil==='cinder'||sigil==='slag'){for(var c=0;c<3;c++){ctx.beginPath();ctx.moveTo(-8+c*8,r*.55);ctx.quadraticCurveTo(-12+c*9,-2,-5+c*7,-r*.72);ctx.stroke();}}
        else if(sigil==='flake'){for(var f=0;f<6;f++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(r*.45,0);ctx.lineTo(r,0);ctx.moveTo(r*.72,0);ctx.lineTo(r*.88,-4);ctx.stroke();}}
        else if(sigil==='scarab'){ctx.beginPath();ctx.ellipse(0,0,r*.55,r*.32,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-r*.32);ctx.lineTo(0,r*.32);ctx.stroke();}
        else if(sigil==='arc'||sigil==='pulse'){ctx.beginPath();ctx.moveTo(-r,5);ctx.lineTo(-r*.35,-5);ctx.lineTo(0,5);ctx.lineTo(r*.35,-5);ctx.lineTo(r,5);ctx.stroke();}
        else if(sigil==='eye'){ctx.beginPath();ctx.moveTo(-r,0);ctx.quadraticCurveTo(0,-r*.6,r,0);ctx.quadraticCurveTo(0,r*.6,-r,0);ctx.stroke();ctx.beginPath();ctx.arc(2,0,3,0,TAU);ctx.fill();}
        else if(sigil==='rose'||sigil==='cap'){for(var p=0;p<5;p++){ctx.rotate(TAU/5);ctx.beginPath();ctx.ellipse(0,-r*.65,5,9,0,0,TAU);ctx.fill();}}
        else if(sigil==='thorn'){for(var th=0;th<6;th++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(r*.55,0);ctx.lineTo(r+6,-4);ctx.lineTo(r+2,4);ctx.closePath();ctx.stroke();}}
        else if(sigil==='wave'||sigil==='wing'){for(var w=-1;w<=1;w++){ctx.beginPath();ctx.moveTo(-r,w*6);ctx.quadraticCurveTo(0,w*6-8,r,w*6);ctx.stroke();}}
        else if(sigil==='rune'){ctx.strokeRect(-r*.58,-r*.58,r*1.16,r*1.16);ctx.rotate(Math.PI/4);ctx.strokeRect(-r*.4,-r*.4,r*.8,r*.8);}
        else if(sigil==='facet'){ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.8,r*.5);ctx.lineTo(-r*.8,r*.5);ctx.closePath();ctx.stroke();}
        else if(sigil==='gear'){ctx.beginPath();ctx.arc(0,0,r*.66,0,TAU);ctx.stroke();for(var g=0;g<8;g++){ctx.rotate(TAU/8);ctx.fillRect(r*.58,-2,8,4);}}
        else if(sigil==='moon'){ctx.beginPath();ctx.arc(-2,0,r*.65,-1.25,1.25);ctx.arc(4,0,r*.52,1.25,-1.25,true);ctx.stroke();}
        if(this.variantActive){ctx.globalAlpha=.36;ctx.beginPath();ctx.arc(0,0,r+4+Math.sin(visualTick*.055+this.id)*2,0,TAU);ctx.stroke();}
        if(this.variantState==='telegraph'){ctx.globalAlpha=.84;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(this.variantTargetX-this.x,this.variantTargetY-this.y);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.58;ctx.beginPath();ctx.arc(this.variantTargetX-this.x,this.variantTargetY-this.y,24+Math.sin(visualTick*.16)*5,0,TAU);ctx.stroke();}
        ctx.restore();
    };
    Enemy.prototype.drawSignatureSkin=function(){
        var def=this.signature;if(!def)return;var r=this.radius,style=def.style;ctx.save();ctx.strokeStyle=def.accent;ctx.fillStyle=def.color;ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';
        if(style==='crown'){
            ctx.fillRect(-12,-9,24,20);ctx.strokeRect(-12,-9,24,20);ctx.beginPath();ctx.moveTo(-14,-10);ctx.lineTo(-11,-24);ctx.lineTo(-3,-16);ctx.lineTo(2,-26);ctx.lineTo(8,-16);ctx.lineTo(15,-23);ctx.lineTo(13,-9);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=def.accent;ctx.fillRect(-3,-3,6,6);
        }else if(style==='bell'){
            ctx.beginPath();ctx.moveTo(-15,10);ctx.quadraticCurveTo(-10,-18,0,-21);ctx.quadraticCurveTo(10,-18,15,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-18,11);ctx.lineTo(18,11);ctx.stroke();ctx.fillStyle=def.accent;ctx.beginPath();ctx.arc(0,16,4,0,TAU);ctx.fill();
        }else if(style==='veil'){
            ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(17,13);ctx.lineTo(-17,13);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#261c12';ctx.beginPath();ctx.ellipse(0,-2,10,5,0,0,TAU);ctx.fill();ctx.strokeStyle=def.accent;ctx.stroke();ctx.fillStyle=def.accent;ctx.beginPath();ctx.arc(2,-2,2.5,0,TAU);ctx.fill();
        }else if(style==='rook'){
            ctx.fillRect(-14,-13,28,29);ctx.strokeRect(-14,-13,28,29);for(var rr=-1;rr<=1;rr++)ctx.fillRect(rr*10-4,-23,8,12);ctx.beginPath();ctx.moveTo(-18,-13);ctx.lineTo(18,-13);ctx.stroke();ctx.fillStyle=def.accent;ctx.beginPath();ctx.moveTo(-8,5);ctx.lineTo(0,-4);ctx.lineTo(8,5);ctx.stroke();
        }else if(style==='maw'){
            ctx.fillStyle='#210a24';ctx.beginPath();ctx.ellipse(0,0,r+3,r*.7,0,0,TAU);ctx.fill();ctx.stroke();for(var tooth=0;tooth<8;tooth++){var ta=-1.15+tooth*.33;ctx.save();ctx.rotate(ta);ctx.fillStyle=def.accent;ctx.beginPath();ctx.moveTo(r*.45,-3);ctx.lineTo(r*.95,0);ctx.lineTo(r*.45,3);ctx.closePath();ctx.fill();ctx.restore();}ctx.fillStyle=def.color;ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();
        }else if(style==='choir'){
            for(var petal=0;petal<6;petal++){ctx.rotate(TAU/6);ctx.beginPath();ctx.ellipse(10,0,11,5,0,0,TAU);ctx.fill();ctx.stroke();}ctx.fillStyle=def.accent;ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,25);ctx.moveTo(-7,20);ctx.lineTo(7,20);ctx.stroke();
        }else if(style==='lance'){
            ctx.rotate(this.signatureAim);ctx.fillStyle='#25451d';ctx.fillRect(-11,-13,22,26);ctx.strokeRect(-11,-13,22,26);ctx.strokeStyle=def.accent;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(30,0);ctx.stroke();ctx.fillStyle=def.accent;ctx.beginPath();ctx.moveTo(34,0);ctx.lineTo(23,-6);ctx.lineTo(23,6);ctx.closePath();ctx.fill();
        }else if(style==='reef'){
            ctx.beginPath();ctx.ellipse(0,0,17,11,0,0,TAU);ctx.fill();ctx.stroke();for(var leg=-1;leg<=1;leg+=2)for(var li=0;li<3;li++){ctx.beginPath();ctx.moveTo(leg*10,-7+li*7);ctx.lineTo(leg*(22+li*2),-13+li*12);ctx.stroke();}ctx.fillStyle=def.accent;ctx.beginPath();ctx.arc(-5,-3,2,0,TAU);ctx.arc(5,-3,2,0,TAU);ctx.fill();
        }else if(style==='falcon'){
            ctx.rotate(this.signatureAim);ctx.beginPath();ctx.moveTo(19,0);ctx.lineTo(-2,-8);ctx.lineTo(-22,-20);ctx.lineTo(-13,0);ctx.lineTo(-22,20);ctx.lineTo(-2,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=def.accent;ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(10,-5);ctx.lineTo(10,5);ctx.closePath();ctx.fill();
        }else if(style==='tablet'){
            ctx.fillStyle='#4a3617';ctx.fillRect(-15,-20,30,40);ctx.strokeRect(-15,-20,30,40);ctx.strokeStyle=def.accent;ctx.strokeRect(-10,-15,20,30);ctx.beginPath();ctx.moveTo(-6,-7);ctx.lineTo(6,-7);ctx.moveTo(-6,0);ctx.lineTo(3,0);ctx.moveTo(-6,7);ctx.lineTo(7,7);ctx.stroke();
        }else if(style==='twin'){
            for(var twin=-1;twin<=1;twin+=2){ctx.save();ctx.translate(twin*9,0);ctx.rotate(twin*this.orbit*.35);ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(10,0);ctx.lineTo(0,16);ctx.lineTo(-10,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,0);ctx.stroke();
        }else if(style==='drum'){
            ctx.beginPath();ctx.ellipse(0,0,18,14,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,11,9,0,0,TAU);ctx.stroke();ctx.rotate(this.orbit*.7);for(var beat=0;beat<4;beat++){ctx.rotate(TAU/4);ctx.fillRect(18,-2,8,4);}
        }else if(style==='hound'){
            ctx.rotate(this.signatureAim);ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(7,-13);ctx.lineTo(-15,-11);ctx.lineTo(-21,0);ctx.lineTo(-14,12);ctx.lineTo(8,11);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(9,-10);ctx.lineTo(14,-20);ctx.lineTo(18,-8);ctx.stroke();ctx.fillStyle=def.accent;ctx.beginPath();ctx.arc(12,-3,2.5,0,TAU);ctx.fill();
        }else if(style==='pendulum'){
            ctx.fillStyle='#4b4025';ctx.fillRect(-15,-18,30,32);ctx.strokeRect(-15,-18,30,32);ctx.beginPath();ctx.arc(0,-3,10,0,TAU);ctx.stroke();ctx.save();ctx.rotate(Math.sin(visualTick*.035)*.65);ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(0,24);ctx.stroke();ctx.fillStyle=def.accent;ctx.beginPath();ctx.arc(0,26,5,0,TAU);ctx.fill();ctx.restore();
        }else if(style==='eclipse'){
            ctx.fillStyle='#20243d';ctx.beginPath();ctx.arc(-3,0,17,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=def.color;ctx.beginPath();ctx.arc(5,-3,15,0,TAU);ctx.fill();ctx.strokeStyle=def.accent;ctx.beginPath();ctx.arc(-3,0,17,-1.2,1.2);ctx.stroke();for(var star=0;star<3;star++){ctx.fillStyle=def.accent;ctx.fillRect(17+star*4,-9+star*8,2,2);}
        }else if(style==='shepherd'){
            ctx.fillStyle='#30401d';ctx.fillRect(-7,-2,14,23);ctx.strokeRect(-7,-2,14,23);ctx.fillStyle=def.color;ctx.beginPath();ctx.ellipse(0,-6,20,12,0,Math.PI,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=def.accent;for(var sp=0;sp<5;sp++){var spa=sp*TAU/5;ctx.beginPath();ctx.arc(Math.cos(spa)*12,-7+Math.sin(spa)*6,2,0,TAU);ctx.fill();}ctx.beginPath();ctx.moveTo(10,0);ctx.quadraticCurveTo(25,-14,24,13);ctx.stroke();
        }
        if(this.signatureState==='telegraph'){ctx.globalAlpha=.82;ctx.strokeStyle=def.accent;ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(this.signatureTargetX-this.x,this.signatureTargetY-this.y);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.48;ctx.beginPath();ctx.arc(this.signatureTargetX-this.x,this.signatureTargetY-this.y,24+Math.sin(visualTick*.16)*4,0,TAU);ctx.stroke();}
        ctx.restore();
    };
    Enemy.prototype.draw = function () {
        if(this.trainingDummy){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(0,36,38,12,0,0,TAU);ctx.fill();ctx.fillStyle='#59402d';ctx.strokeStyle='#17100b';ctx.lineWidth=5;ctx.fillRect(-7,15,14,48);ctx.strokeRect(-7,15,14,48);ctx.fillStyle=this.flash>0?'#fff':'#a7774f';ctx.beginPath();ctx.arc(0,-5,25,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle=this.flash>0?'#e74c3c':'#f0c46f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-5,15,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,-5,5,0,TAU);ctx.stroke();ctx.fillStyle='#d5aa68';ctx.fillRect(-34,12,68,10);ctx.strokeRect(-34,12,68,10);ctx.fillStyle='#e7d8bd';ctx.font='6px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';ctx.fillText(tr('TARGET'),0,52);ctx.restore();return;}
        if(this.hidden){ctx.save();ctx.translate(this.x,this.y);ctx.strokeStyle=this.kind==='blinkStalker'?'#bd77e8':'#62c370';ctx.lineWidth=3;ctx.globalAlpha=.65;ctx.beginPath();ctx.ellipse(0,7,this.radius+7,7,0,0,TAU);ctx.stroke();for(var br=0;br<4;br++){ctx.rotate(TAU/4);ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(this.radius+12,0);ctx.stroke();}if(this.kind==='blinkStalker'){ctx.rotate(-visualTick*.04);ctx.beginPath();ctx.arc(0,0,this.radius+12,-.8,.8);ctx.stroke();}ctx.restore();return;}
        this.drawBody(); ctx.save(); ctx.translate(this.x, this.y);this.drawSignatureSkin();this.drawBiomeVariantSkin();
        ctx.strokeStyle = '#111'; ctx.fillStyle = '#111'; ctx.lineWidth = 3;
        if (this.kind === 'shooter') { ctx.beginPath(); ctx.moveTo(-7,-7); ctx.lineTo(0,-15); ctx.lineTo(7,-7); ctx.stroke(); }
        if (this.kind === 'tank') { ctx.strokeRect(-14,-14,28,28); }
        if (this.kind === 'spiral') { ctx.beginPath(); ctx.arc(0,0,9,0,Math.PI*1.6); ctx.stroke(); }
        if (this.kind === 'nova') { for (var i=0;i<6;i++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(this.radius,0);ctx.lineTo(this.radius+8,0);ctx.stroke();} }
        if (this.kind === 'summoner') { ctx.beginPath(); ctx.moveTo(-9,8); ctx.lineTo(0,-12); ctx.lineTo(9,8); ctx.closePath(); ctx.stroke(); }
        if (this.kind === 'orbiter') { ctx.beginPath(); ctx.arc(0,0,this.radius+6,0,Math.PI*1.4); ctx.stroke(); }
        if (this.kind === 'charger' && this.state === 'telegraph') { ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(this.aim)*220,Math.sin(this.aim)*220);ctx.stroke(); }
        if (this.kind === 'shield'&&this.shieldHp>0) { ctx.rotate(this.aim); ctx.strokeStyle='#ecf0f1';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,this.radius+7,-1.05,1.05);ctx.stroke();ctx.strokeStyle='#222';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-12,-this.radius-13);ctx.lineTo(12,-this.radius-13);ctx.stroke();ctx.strokeStyle='#9ce7ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-this.radius-13);ctx.lineTo(-12+24*(this.shieldHp/this.shieldMax),-this.radius-13);ctx.stroke(); }
        if (this.kind === 'bomber') { ctx.fillStyle='#111';ctx.beginPath();ctx.arc(0,-4,6,0,TAU);ctx.fill(); }
        if (this.kind === 'leech') { ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(5,0);ctx.stroke(); }
        if(this.kind==='briar'){ctx.strokeStyle='#183d20';for(var bv=0;bv<7;bv++){ctx.rotate(TAU/7);ctx.beginPath();ctx.moveTo(this.radius-3,0);ctx.lineTo(this.radius+9,-4);ctx.lineTo(this.radius+5,4);ctx.stroke();}}
        if(this.kind==='tidecaller'){ctx.strokeStyle='#d9fbff';ctx.lineWidth=2;for(var tc=0;tc<3;tc++){ctx.beginPath();ctx.arc(0,0,7+tc*5,this.orbit+tc,this.orbit+tc+Math.PI);ctx.stroke();}}
        if(this.kind==='scribe'){ctx.fillStyle='#f5e4a8';ctx.fillRect(-11,-9,9,18);ctx.fillRect(2,-9,9,18);ctx.strokeStyle='#6f5720';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.stroke();}
        if(this.kind==='prism'){ctx.rotate(this.orbit);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(12,9);ctx.lineTo(-12,9);ctx.closePath();ctx.stroke();if(this.reflectCooldown<=0){ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(0,0,this.radius+8,0,TAU);ctx.stroke();}}
        if(this.kind==='splitter'){ctx.strokeStyle='#e8fbff';ctx.beginPath();ctx.moveTo(-13,-9);ctx.lineTo(0,-15);ctx.lineTo(14,-5);ctx.lineTo(10,13);ctx.lineTo(-10,12);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(-7,-8);ctx.lineTo(8,10);ctx.moveTo(8,-5);ctx.lineTo(-5,11);ctx.stroke();}
        if(this.kind==='shardling'){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(7,7);ctx.lineTo(-7,5);ctx.closePath();ctx.fill();}
        if(this.kind==='cinderling'){ctx.fillStyle='#31130c';ctx.beginPath();ctx.moveTo(-10,-8);ctx.lineTo(-4,-20);ctx.lineTo(0,-10);ctx.lineTo(5,-20);ctx.lineTo(11,-7);ctx.closePath();ctx.fill();ctx.fillStyle='#ffd08a';ctx.beginPath();ctx.arc(-4,-2,2,0,TAU);ctx.arc(4,-2,2,0,TAU);ctx.fill();ctx.strokeStyle='#ffb05c';ctx.beginPath();ctx.moveTo(-7,8);ctx.quadraticCurveTo(0,16,7,8);ctx.stroke();}
        if(this.kind==='frostshaper'){ctx.strokeStyle='#e9fbff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-13,-9);ctx.lineTo(-8,-20);ctx.lineTo(0,-13);ctx.lineTo(8,-20);ctx.lineTo(13,-9);ctx.stroke();for(var fm=0;fm<6;fm++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(4,0);ctx.lineTo(13,0);ctx.moveTo(9,0);ctx.lineTo(12,-4);ctx.stroke();}}
        if(this.kind==='rootweaver'){ctx.strokeStyle='#d7ffd9';ctx.lineWidth=2;for(var rw=0;rw<6;rw++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(5,0);ctx.bezierCurveTo(15,-9,18,8,27,Math.sin(visualTick*.05+rw)*4);ctx.stroke();}ctx.fillStyle='#173b22';ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.fill();ctx.stroke();}
        if(this.kind==='glassDuelist'){ctx.rotate(this.aim);ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-15,-13);ctx.lineTo(18,13);ctx.moveTo(-15,13);ctx.lineTo(18,-13);ctx.stroke();ctx.fillStyle='rgba(220,250,255,.45)';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(13,0);ctx.lineTo(0,18);ctx.lineTo(-13,0);ctx.closePath();ctx.fill();ctx.stroke();if(this.state==='telegraph'){ctx.strokeStyle='#a8efff';ctx.setLineDash([9,6]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(310,0);ctx.stroke();ctx.setLineDash([]);}}
        if(this.kind==='slagKnight'){ctx.rotate(this.aim);ctx.fillStyle='#37120c';ctx.fillRect(-13,-15,26,30);ctx.strokeStyle='#ffb36f';ctx.lineWidth=3;ctx.strokeRect(-13,-15,26,30);ctx.beginPath();ctx.moveTo(7,-15);ctx.lineTo(20,-5);ctx.lineTo(11,0);ctx.lineTo(22,8);ctx.lineTo(8,15);ctx.stroke();ctx.fillStyle='#fff0c2';ctx.beginPath();ctx.arc(4,-5,3,0,TAU);ctx.fill();}
        if(this.kind==='chronomancer'){ctx.strokeStyle='#fff1b2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,12,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(this.orbit)*10,Math.sin(this.orbit)*10);ctx.moveTo(0,0);ctx.lineTo(Math.cos(-this.orbit*.6)*6,Math.sin(-this.orbit*.6)*6);ctx.stroke();for(var ctm=0;ctm<6;ctm++){ctx.rotate(TAU/6);ctx.strokeRect(15,-2,5,4);}}
        if(this.kind==='boneArcher'){ctx.rotate(this.aim);ctx.strokeStyle='#f2f3ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(1,0,17,-1.15,1.15);ctx.stroke();ctx.strokeStyle='#7f86b3';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,-15);ctx.lineTo(3,0);ctx.lineTo(8,15);ctx.stroke();ctx.fillStyle='#c9d1ff';ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(10,-4);ctx.lineTo(10,4);ctx.closePath();ctx.fill();if(this.state==='aim'){ctx.strokeStyle='#fff';ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(420,0);ctx.stroke();ctx.setLineDash([]);}}
        if(this.kind==='sporeHost'){ctx.fillStyle='#243516';for(var sph=0;sph<6;sph++){ctx.rotate(TAU/6);ctx.beginPath();ctx.ellipse(0,-14,8,14,0,0,TAU);ctx.fill();ctx.strokeStyle='#dfff9e';ctx.stroke();}ctx.fillStyle='#eaffb6';for(var spd=0;spd<5;spd++){var spda=spd*TAU/5+this.orbit;ctx.beginPath();ctx.arc(Math.cos(spda)*10,Math.sin(spda)*10,2.5,0,TAU);ctx.fill();}}
        if(this.kind==='vaultSkitter'){ctx.strokeStyle='#2f2416';ctx.lineWidth=3;for(var vsl=-1;vsl<=1;vsl+=2){for(var vsk=0;vsk<3;vsk++){ctx.beginPath();ctx.moveTo(vsl*5,-8+vsk*8);ctx.lineTo(vsl*(17+vsk*2),-13+vsk*11);ctx.stroke();}}ctx.fillStyle='#f4d08b';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(9,0);ctx.lineTo(0,11);ctx.lineTo(-9,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(3,-3,2,0,TAU);ctx.fill();}
        if(this.kind==='mineLayer'){ctx.fillStyle='#3d2b1c';ctx.fillRect(-12,-11,24,22);ctx.strokeStyle='#f7d39a';ctx.strokeRect(-12,-11,24,22);ctx.fillStyle='#17120e';ctx.beginPath();ctx.arc(-6,-3,3,0,TAU);ctx.arc(6,-3,3,0,TAU);ctx.fill();ctx.strokeStyle=this.color;for(var mls=0;mls<6;mls++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(21,0);ctx.stroke();}ctx.fillStyle='#e9a75d';ctx.beginPath();ctx.arc(0,7,4,0,TAU);ctx.fill();}
        if(this.kind==='blinkStalker'){ctx.rotate(this.aim);ctx.fillStyle='#21132b';ctx.beginPath();ctx.moveTo(-13,-8);ctx.lineTo(0,-16);ctx.lineTo(13,-8);ctx.lineTo(9,11);ctx.lineTo(-9,11);ctx.closePath();ctx.fill();ctx.strokeStyle='#ead8ff';ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(3,-4);ctx.lineTo(10,0);ctx.lineTo(3,4);ctx.closePath();ctx.fill();for(var bss=-1;bss<=1;bss+=2){ctx.strokeStyle=this.color;ctx.beginPath();ctx.moveTo(-4,bss*8);ctx.lineTo(-20,bss*15);ctx.stroke();}}
        if(this.kind==='bannerBearer'){ctx.strokeStyle='#3c211f';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-5,17);ctx.lineTo(-5,-26);ctx.stroke();ctx.fillStyle='#7c2028';ctx.beginPath();ctx.moveTo(-3,-25);ctx.lineTo(24,-19);ctx.lineTo(15,-5);ctx.lineTo(-3,-9);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffb0b5';ctx.stroke();ctx.beginPath();ctx.moveTo(3,-19);ctx.lineTo(14,-12);ctx.lineTo(4,-10);ctx.stroke();ctx.fillStyle='#fff0ef';ctx.beginPath();ctx.arc(5,2,4,0,TAU);ctx.fill();ctx.strokeStyle=this.color;ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(0,0,205,0,TAU);ctx.stroke();ctx.globalAlpha=1;}
        if(this.kind==='lanternMite'){ctx.rotate(this.orbit*1.4);ctx.strokeStyle='#dff6ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,9,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-7,-9);ctx.quadraticCurveTo(0,-18,7,-9);ctx.stroke();ctx.fillStyle='#173d51';ctx.fillRect(-7,-6,14,15);ctx.strokeRect(-7,-6,14,15);ctx.fillStyle='#b9ecff';ctx.beginPath();ctx.arc(0,1,4+Math.sin(visualTick*.1)*1.5,0,TAU);ctx.fill();for(var lmw=-1;lmw<=1;lmw+=2){ctx.fillStyle='rgba(220,248,255,.5)';ctx.beginPath();ctx.ellipse(lmw*10,2,6,3,lmw*.4,0,TAU);ctx.fill();}}
        if(this.kind==='chainWarden'){ctx.rotate(this.aim);ctx.fillStyle='#343b43';ctx.fillRect(-13,-16,26,32);ctx.strokeStyle='#dbe1e8';ctx.lineWidth=3;ctx.strokeRect(-13,-16,26,32);for(var cwl=-1;cwl<=1;cwl+=2){ctx.strokeStyle=this.color;for(var cwc=0;cwc<4;cwc++){ctx.beginPath();ctx.ellipse(14+cwc*6,cwl*(5+cwc*2),5,3,cwl*.3,0,TAU);ctx.stroke();}}ctx.fillStyle='#15191d';ctx.beginPath();ctx.arc(3,-4,4,0,TAU);ctx.fill();if(this.state==='aim'){ctx.strokeStyle='#fff';ctx.setLineDash([8,6]);for(var cwa=-1;cwa<=1;cwa+=2){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(cwa*.17)*520,Math.sin(cwa*.17)*520);ctx.stroke();}ctx.setLineDash([]);}}
        if(this.kind==='ashMauler'){ctx.fillStyle='#4a2116';ctx.fillRect(-15,-14,30,28);ctx.strokeStyle='#ffd0a0';ctx.lineWidth=3;ctx.strokeRect(-15,-14,30,28);ctx.rotate(-.5);ctx.fillStyle='#2c1711';ctx.fillRect(-5,-30,10,38);ctx.beginPath();ctx.arc(0,-30,13,0,TAU);ctx.fill();ctx.stroke();if(this.state==='slam'){ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,0,45+Math.sin(visualTick*.2)*8,0,TAU);ctx.stroke();}}
        if(this.kind==='frostLantern'){ctx.strokeStyle='#effdff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-14);ctx.quadraticCurveTo(0,-24,8,-14);ctx.stroke();ctx.fillStyle='#3b7588';ctx.fillRect(-10,-13,20,25);ctx.strokeRect(-10,-13,20,25);ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.arc(0,0,6+Math.sin(visualTick*.08)*2,0,TAU);ctx.fill();for(var fi=0;fi<6;fi++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(22,0);ctx.stroke();}}
        if(this.kind==='duneScarab'){ctx.rotate(this.aim);ctx.fillStyle='#6b5428';ctx.beginPath();ctx.ellipse(0,0,13,9,0,0,TAU);ctx.fill();ctx.strokeStyle='#fff0b1';ctx.stroke();ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(0,8);ctx.stroke();for(var dl=-1;dl<=1;dl+=2)for(var di=0;di<3;di++){ctx.beginPath();ctx.moveTo(dl*5,-6+di*6);ctx.lineTo(dl*18,-12+di*12);ctx.stroke();}}
        if(this.kind==='arcTetherer'){ctx.strokeStyle='#eadbff';ctx.lineWidth=2;ctx.rotate(this.orbit);for(var at=0;at<4;at++){ctx.rotate(TAU/4);ctx.beginPath();ctx.arc(15,0,5,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(11,0);ctx.stroke();}ctx.fillStyle='#351b50';ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.fill();ctx.stroke();}
        if(this.kind==='roseChorister'){ctx.fillStyle='#6e2037';for(var rp=0;rp<6;rp++){ctx.rotate(TAU/6);ctx.beginPath();ctx.ellipse(10,0,11,5,0,0,TAU);ctx.fill();ctx.strokeStyle='#ffd1dc';ctx.stroke();}ctx.fillStyle='#fff2d8';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();}
        if(this.kind==='tideSkater'){ctx.rotate(this.orbit*2);ctx.strokeStyle='#d7fdff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,0);ctx.quadraticCurveTo(0,-13,18,0);ctx.quadraticCurveTo(0,13,-18,0);ctx.stroke();ctx.fillStyle='#194b55';ctx.beginPath();ctx.arc(0,0,7,0,TAU);ctx.fill();ctx.stroke();}
        if(this.kind==='mirrorMimic'){ctx.rotate(-this.orbit*.55);ctx.strokeStyle='#fff';ctx.fillStyle='rgba(210,250,255,.25)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(16,-5);ctx.lineTo(10,16);ctx.lineTo(-12,15);ctx.lineTo(-17,-4);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(0,14);ctx.moveTo(-17,-4);ctx.lineTo(16,-5);ctx.stroke();}
        if(this.kind==='sporeMortar'){ctx.fillStyle='#31421e';ctx.beginPath();ctx.ellipse(0,5,16,12,0,0,TAU);ctx.fill();ctx.strokeStyle='#efffc5';ctx.stroke();ctx.fillStyle='#7d9d42';ctx.fillRect(-5,-20,10,20);ctx.beginPath();ctx.arc(0,-20,13,Math.PI,TAU);ctx.fill();ctx.stroke();for(var sm=0;sm<5;sm++){var sma=sm*TAU/5;ctx.fillStyle='#f4ffd5';ctx.beginPath();ctx.arc(Math.cos(sma)*7,-20+Math.sin(sma)*5,2,0,TAU);ctx.fill();}}
        if (this.curse > 0) { ctx.strokeStyle='#9b4dff';ctx.lineWidth=2;ctx.rotate(visualTick*.025);for(var cr=0;cr<5;cr++){ctx.rotate(TAU/5);ctx.beginPath();ctx.moveTo(this.radius+3,0);ctx.quadraticCurveTo(this.radius+9,-5,this.radius+13,0);ctx.stroke();} }
        if(this.poison>0){ctx.strokeStyle='#b6e86b';ctx.lineWidth=2;for(var poi=0;poi<4;poi++){var poia=visualTick*.02+poi*TAU/4;ctx.beginPath();ctx.arc(Math.cos(poia)*(this.radius+8),Math.sin(poia)*(this.radius+8),2.5,0,TAU);ctx.stroke();}}
        if (this.shards > 0) { ctx.fillStyle='#7ed6df';for(var sh=0;sh<this.shards;sh++){var sha=-.7+sh*.7;ctx.save();ctx.rotate(sha);ctx.beginPath();ctx.moveTo(this.radius-2,-2);ctx.lineTo(this.radius+10,0);ctx.lineTo(this.radius-2,2);ctx.fill();ctx.restore();} }
        if (this.stars > 0) { ctx.fillStyle='#dbe4ff';for(var es=0;es<this.stars;es++){var esa=visualTick*.02+es*TAU/3;ctx.beginPath();ctx.arc(Math.cos(esa)*(this.radius+8),Math.sin(esa)*(this.radius+8),2.5,0,TAU);ctx.fill();} }
        if(this.chronoMarks>0){ctx.strokeStyle='#e6ca6b';ctx.lineWidth=2;for(var cht=0;cht<this.chronoMarks;cht++){var chta=-Math.PI/2+cht*TAU/4;ctx.beginPath();ctx.arc(Math.cos(chta)*(this.radius+11),Math.sin(chta)*(this.radius+11),3,0,TAU);ctx.stroke();}}
        if(VISUALS&&this.customStatuses){var drawnStatus=0;Object.keys(this.customStatuses).forEach(function(statusId){if(drawnStatus>=3)return;var definition=STATUS_EFFECTS[statusId],state=this.customStatuses[statusId];if(definition&&state){ctx.save();ctx.rotate(-drawnStatus*.35);VISUALS.status(ctx,definition,{radius:this.radius+drawnStatus*5,visualTick:visualTick,stacks:state.stacks});ctx.restore();drawnStatus++;}},this);}
        ctx.restore();
    };


    var BOSS_BEHAVIOR_API={
        ctx:ctx,TAU:TAU,ARENA:ARENA_LIMIT,clamp:clamp,angleDiff:angleDiff,visualTick:function(){return visualTick;},players:partyPlayers,playerById:playerByNetId,interval:intervalElapsed,palaceArt:PALACE_ART,
        float:addFloat,ring:addRing,beam:addBeam,particles:addParticles,effect:pushEffect,
        bullets:function(){return bullets;},fields:function(){return hazards;},minion:function(x,y,kind,ownerKey){var minion=spawnEnemy(x,y,kind,true);minion.bossSummon=true;minion.bossSummonOwner=ownerKey||'';minion.maxHp*=.72;minion.hp=minion.maxHp;minion.speed*=1.08;return minion;},
        field:function(x,y,radius,kind,life,extra){var field=new TimedField(x,y,radius,kind,life);Object.assign(field,extra||{});hazards.push(field);return field;},
        resolve:function(boss){boss.resolveObstacles();boss.x=clamp(boss.x,-ARENA_LIMIT+boss.radius,ARENA_LIMIT-boss.radius);boss.y=clamp(boss.y,-ARENA_LIMIT+boss.radius,ARENA_LIMIT-boss.radius);},
        hit:function(member,damage,source,angle,knock){if(!member||member.downed)return false;var before=member.hp;withActivePlayer(member,function(){member.hit(damage,source);});if(member.hp<before&&knock){member.x+=Math.cos(angle||0)*knock;member.y+=Math.sin(angle||0)*knock;member.resolveObstacles();member.x=clamp(member.x,-ARENA_LIMIT+80,ARENA_LIMIT-80);member.y=clamp(member.y,-ARENA_LIMIT+80,ARENA_LIMIT-80);}return member.hp<before;},
        bullet:function(x,y,angle,speed,damage,color,radius,life,extra){var opts={x:x,y:y,angle:angle,speed:speed,damage:damage,friendly:false,color:color,radius:radius||5,life:life||190,sourceId:'boss',type:'bossBolt'};Object.assign(opts,extra||{});var shot=spawnBullet(opts);bullets.push(shot);capArray(bullets,980);return shot;},
        slash:function(x,y,angle,radius,arc,color){slashes.push(spawnSlash({x:x,y:y,angle:angle,radius:radius,arc:arc,damage:0,color:color,life:15,maxLife:15,friendly:false,sourceId:'boss_ember'}));capArray(slashes,260);},
        verticalBlade:function(x,y,color){addBeam(x,y-250,x,y+250,color,12);addRing(x,y,color,82,7);}
    };

    function BiomeBoss(x,y,key){
        Enemy.call(this,x,y,'tank');var def=BOSS_DEFS[key]||BOSS_DEFS.ember,cycle=Math.floor(Math.max(0,wave-1)/80);
        this.kind='boss_'+key;this.bossKey=key;this.bossDef=def;this.name=def.name;this.color=def.color;this.radius=def.radius;this.speed=def.speed;this.isBoss=true;this.elite=false;
        this.pressureTier=bossPressureTierAt(wave);this.healthScale=bossHealthScaleAt(wave);this.maxHp=def.hp*1.7*enemyHpScaleAt(wave)*this.healthScale*(1+(partyCount()-1)*.62)*(1+cycle*.25);this.hp=this.maxHp;this.timer=0;this.bossBehavior=BOSS_BEHAVIORS[key]||null;this.comboIndex=0;this.comboName=def.combos[0];this.comboState='roam';this.stateTimer=0;this.enraged=false;this.apex=false;this.targetId='';this.targetCursor=-1;this.dashHitIds=Object.create(null);this.attackZones=[];this.arenaZones=[];this.patternIndex=0;this.patternPhase=1;this.arenaMode='';this.arenaAngle=0;this.arenaPower=0;this.shieldMax=0;this.shieldHp=0;this.summonCount=0;if(this.bossBehavior&&this.bossBehavior.init)this.bossBehavior.init(this,BOSS_BEHAVIOR_API);
    }
    BiomeBoss.prototype=Object.create(Enemy.prototype);BiomeBoss.prototype.constructor=BiomeBoss;
    BiomeBoss.prototype.chooseTarget=function(){if(networkRole==='local'){this.targetId=player.netId;return player;}var living=partyPlayers().filter(function(member){return member&&!member.downed&&member.hp>0;}).sort(function(a,b){return(a.slot||0)-(b.slot||0);});if(!living.length)return player;this.targetCursor=(this.targetCursor+1)%living.length;var target=living[this.targetCursor];if(this.apex&&living.length>1){var weakest=living.slice().sort(function(a,b){return a.hp/a.maxHp-b.hp/b.maxHp;})[0];if(weakest&&weakest!==playerByNetId(this.targetId))target=weakest;}this.targetId=target.netId;return target;};
    BiomeBoss.prototype.fireFan=function(angle,count,spread,speed,damage,color,extras){count+=this.apex?2:this.enraged?1:0;for(var i=0;i<count;i++){var a=angle+(i-(count-1)/2)*spread/Math.max(1,count-1),opts={x:this.x,y:this.y,angle:a,speed:speed,damage:damage,friendly:false,color:color||this.color,radius:5,life:190,sourceId:'boss_'+this.bossKey,type:'bossBolt'};Object.assign(opts,extras||{});bullets.push(spawnBullet(opts));}capArray(bullets,1200);};
    BiomeBoss.prototype.fireNova=function(count,speed,damage,extras){count+=this.apex?4:this.enraged?2:0;for(var i=0;i<count;i++){var opts={x:this.x,y:this.y,angle:i*TAU/count+this.orbit,speed:speed,damage:damage,friendly:false,color:this.color,radius:5,life:205,sourceId:'boss_'+this.bossKey,type:'bossBolt'};Object.assign(opts,extras||{});bullets.push(spawnBullet(opts));}addRing(this.x,this.y,this.color,115,7);capArray(bullets,1200);};
    BiomeBoss.prototype.beginDash=function(angle,speed,frames){this.aim=angle;this.dashSpeed=speed*(this.apex?1.12:this.enraged?1.06:1);this.comboState='dash';this.stateTimer=frames;this.dashHitIds=Object.create(null);addBeam(this.x,this.y,this.x+Math.cos(angle)*this.dashSpeed*frames,this.y+Math.sin(angle)*this.dashSpeed*frames,this.color,5);};
    BiomeBoss.prototype.executeCombo=function(index,target){
        target=target||this.chooseTarget();if(!target)return;if(this.bossBehavior&&this.bossBehavior.execute)return this.bossBehavior.execute(this,index,target,BOSS_BEHAVIOR_API);var key=this.bossKey,a=Math.atan2(target.y-this.y,target.x-this.x),px=target.x,py=target.y;this.comboName=this.bossDef.combos[index];addFloat(this.comboName,this.x,this.y-this.radius-24,this.color);
        if(key==='frost'){if(index===0)this.fireFan(a,7,1.15,6.2,1.1,this.color,{status:'freeze'});else if(index===1){for(var fg=-2;fg<=2;fg++)hazards.push(new TimedField(clamp(px+fg*82,-ARENA_LIMIT,ARENA_LIMIT),py,54,'frostZone',155));this.fireFan(a,3,.25,8,1.15,this.color,{status:'freeze'});}else this.beginDash(a,11.2,24);}
        else if(key==='sand'){if(index===0)this.fireNova(10,6.1,1.15,{bounce:1});else if(index===1){this.fireNova(6,3.8,1.2,{homing:.012});worldSlowTimer=Math.max(worldSlowTimer,38);}else{this.fireFan(a+Math.PI,6,1.4,7.2,1.2,this.color,{bounce:1});this.beginDash(a,8.8,20);}}
        else if(key==='storm'){if(index===0){this.fireFan(a,5,.9,7.4,1.15,this.color,{homing:.012,status:'shock'});this.fireFan(a+Math.PI,5,.9,7.4,1.15,this.color,{homing:.012,status:'shock'});}else if(index===1)this.fireNova(12,5.9,1.1,{homing:.016,status:'shock'});else this.beginDash(a,12.3,22);}
        else if(key==='void'){if(index===0){this.fireNova(9,3.7,1.25,{homing:.02});for(var vw=0;vw<3;vw++)hazards.push(new TimedField(px+rand(-80,80),py+rand(-80,80),62,'enemySpore',115));}else if(index===1)this.fireFan(a,3,.18,10.5,1.6,'#fff',{ghost:true,pierce:4});else for(var vm=0;vm<4;vm++)hazards.push(new TimedField(px+rand(-190,190),py+rand(-190,190),66,'enemyMine',105));}
        else if(key==='blood'){if(index===0)this.fireFan(a,9,1.55,5.8,1.05,this.color,{homing:.008});else if(index===1&&Math.hypot(px-this.x,py-this.y)<560){withActivePlayer(target,function(){target.hit(1.25,'scarlet siphon');});this.hp=Math.min(this.maxHp,this.hp+this.maxHp*.045);addBeam(this.x,this.y,px,py,'#ffd4de',7);}else this.beginDash(a,10.8,25);}
        else if(key==='thorn'){if(index===0)this.beginDash(a,12,25);else if(index===1){for(var rt=0;rt<4;rt++){var rta=rt*TAU/4;hazards.push(new TimedField(px+Math.cos(rta)*95,py+Math.sin(rta)*95,68,'rootTrap',170));}}else this.fireFan(a,11,1.75,6,1.05,this.color,{homing:.014,status:'poison'});}
        else if(key==='tide'){if(index===0){this.fireFan(0,7,Math.PI,6.4,1.1,this.color,{bounce:1});this.fireFan(Math.PI/2,7,Math.PI,6.4,1.1,this.color,{bounce:1});}else if(index===1)this.fireNova(14,5.2,1.05,{bounce:1});else{this.fireFan(a,5,.7,5.8,1.15,this.color,{homing:.018});this.beginDash(a,8.7,22);}}
        else if(key==='cloud'){if(index===0)this.beginDash(a,13.5,20);else if(index===1){for(var wl=-2;wl<=2;wl++)bullets.push(spawnBullet({x:px+wl*95,y:py-430,angle:Math.PI/2,speed:11,damage:1.25,friendly:false,color:this.color,radius:7,life:105,ghost:true,sourceId:'boss_cloud'}));}else this.fireNova(16,7,1.05,{status:'shock'});}
        else if(key==='glyph'){if(index===0)this.fireFan(a,9,1.7,5.8,1.05,this.color,{bounce:1});else if(index===1){for(var gw=-3;gw<=3;gw++)bullets.push(spawnBullet({x:px+gw*72,y:py-390,angle:Math.PI/2,speed:5.8,damage:1.15,friendly:false,color:this.color,radius:7,life:155,bounce:1,sourceId:'boss_glyph'}));}else this.fireFan(a,5,.75,5.2,1.1,'#ff6680',{homing:.025,manaDrain:5});}
        else if(key==='mirror'){if(index===0)this.fireFan(a,11,1.9,6.5,1.05,this.color,{bounce:2});else if(index===1)this.fireFan(a,3,.16,12,1.45,'#fff',{ghost:true,pierce:4});else{var brood=enemies.filter(function(enemy){return!enemy.dead&&!enemy.isBoss;}).length;for(var mc=0;mc<2&&brood<14;mc++,brood++)spawnEnemy(this.x+(mc?1:-1)*105,this.y+rand(-65,65),'mirrorMimic',true);}}
        else if(key==='neon'){if(index===0)this.fireNova(12,7.1,1.05,{bounce:2,status:'shock'});else if(index===1){for(var np=0;np<4;np++)hazards.push(new TimedField(px+rand(-170,170),py+rand(-170,170),72,'enemyMine',120));}else this.beginDash(a,12.5,19);}
        else if(key==='magma'){if(index===0){this.fireNova(12,5.3,1.2,{status:'burn'});hazards.push(new TimedField(this.x,this.y,120,'enemyFire',150));}else if(index===1)this.fireFan(a,11,1.25,6.2,1.15,this.color,{status:'burn'});else this.beginDash(a,9.8,30);}
        else if(key==='gear'){if(index===0)this.fireNova(10,6.3,1.1,{bounce:2});else if(index===1){worldSlowTimer=Math.max(worldSlowTimer,52);this.fireFan(a,5,.7,4.2,1.2,this.color,{homing:.018});}else this.beginDash(a,10.8,24);}
        else if(key==='moon'){if(index===0)this.fireFan(a,7,1.35,7.5,1.15,this.color,{homing:.018,pierce:1});else if(index===1)this.beginDash(a,14.2,18);else this.fireNova(18,5.8,1.05,{homing:.008});}
        else if(key==='spore'){if(index===0){for(var sm=0;sm<5;sm++)bullets.push(spawnBullet({x:this.x,y:this.y,angle:a+rand(-.55,.55),speed:4.1,damage:1.2,friendly:false,color:this.color,radius:8,life:85,blast:72,sourceId:'boss_spore'}));}else if(index===1){var subjects=enemies.filter(function(enemy){return!enemy.dead&&!enemy.isBoss;}).length;for(var sc=0;sc<2&&subjects<14;sc++,subjects++)spawnEnemy(this.x+rand(-110,110),this.y+rand(-110,110),'sporeHost',true);}else{this.fireNova(14,4.8,1.05,{homing:.012});hazards.push(new TimedField(px,py,118,'enemySpore',170));}}
        addRing(this.x,this.y,this.color,80,5);
    };
    BiomeBoss.prototype.update=function(step){
        this.updateStatus(step);if(this.dead||this.stun>0)return;var prevBossPhase=this.apex?3:this.enraged?2:1;this.enraged=this.hp<this.maxHp*.55;this.apex=this.hp<this.maxHp*.25;var curBossPhase=this.apex?3:this.enraged?2:1;if(curBossPhase>prevBossPhase)playSound('boss.phase',{x:this.x,y:this.y});this.orbit+=.022*step;var pressureTarget=playerByNetId(this.targetId);if(!pressureTarget||pressureTarget.downed||pressureTarget.hp<=0)pressureTarget=nearestLivingPlayer(this.x,this.y);if(this.bossBehavior&&this.bossBehavior.update){this.bossBehavior.update(this,step,BOSS_BEHAVIOR_API);return;}var target=pressureTarget||this.chooseTarget();if(!target)return;var dx=target.x-this.x,dy=target.y-this.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);
        if(this.comboState==='dash'){this.x+=Math.cos(this.aim)*this.dashSpeed*step;this.y+=Math.sin(this.aim)*this.dashSpeed*step;this.stateTimer-=step;if(this.bossKey==='magma'&&intervalElapsed(this,'bossTrail',step,8))hazards.push(new TimedField(this.x,this.y,44,'enemyFire',82));var boss=this;partyPlayers().forEach(function(member){if(member.downed||boss.dashHitIds[member.netId]||Math.hypot(boss.x-member.x,boss.y-member.y)>=boss.radius+member.radius+8)return;boss.dashHitIds[member.netId]=true;withActivePlayer(member,function(){member.hit(boss.apex?1.75:1.5,'boss charge');});});if(this.stateTimer<=0){this.comboState='recover';this.stateTimer=this.apex?16:this.enraged?21:28;}this.resolveObstacles();this.x=clamp(this.x,-ARENA_LIMIT,ARENA_LIMIT);this.y=clamp(this.y,-ARENA_LIMIT,ARENA_LIMIT);return;}
        if(this.comboState==='windup'){this.stateTimer-=step;if(this.stateTimer<=0){this.executeCombo(this.comboIndex,target);this.comboIndex=(this.comboIndex+1)%this.bossDef.combos.length;if(this.comboState==='windup'){this.comboState='recover';this.stateTimer=this.apex?14:this.enraged?19:24;}}}
        else if(this.comboState==='recover'){this.stateTimer-=step;if(this.stateTimer<=0){this.comboState='roam';this.timer=0;}}
        else{var closeBoss=this.bossKey==='magma'||this.bossKey==='thorn'||this.bossKey==='moon',desiredD=closeBoss?175:290,intent=0;if(d>desiredD+55)intent=this.speed*(this.apex?1.42:this.enraged?1.28:1.12)*step;else if(d<desiredD-65)intent=-this.speed*.82*step;var moveA=a+(Math.abs(d-desiredD)<70?Math.PI/2*Math.sin(this.orbit):0);this.moveWithNavigation(Math.cos(moveA)*intent,Math.sin(moveA)*intent,step);this.resolveObstacles();this.x=clamp(this.x,-ARENA_LIMIT,ARENA_LIMIT);this.y=clamp(this.y,-ARENA_LIMIT,ARENA_LIMIT);this.timer+=step;if(this.timer>(this.apex?42:this.enraged?58:78)){target=this.chooseTarget();this.comboState='windup';this.stateTimer=this.apex?12:this.enraged?17:24;this.comboName=this.bossDef.combos[this.comboIndex];addRing(this.x,this.y,this.color,this.radius+35,6);if(target)addBeam(this.x,this.y,target.x,target.y,this.color,2);}}
        var contactBoss=this;partyPlayers().forEach(function(member){if(member.downed||contactBoss.touchCooldown>0||Math.hypot(contactBoss.x-member.x,contactBoss.y-member.y)>=contactBoss.radius+member.radius)return;withActivePlayer(member,function(){member.hit(1.25,'biome boss');});contactBoss.touchCooldown=42;});
    };
    BiomeBoss.prototype.draw=function(){
        if(this.bossBehavior&&this.bossBehavior.draw){this.bossBehavior.draw(this,BOSS_BEHAVIOR_API);return;}this.drawBody();var keys=Object.keys(BOSS_DEFS),index=Math.max(0,keys.indexOf(this.bossKey)),sides=3+index%6;ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.orbit*(this.enraged?1.6:1));ctx.strokeStyle='#fff';ctx.fillStyle=this.color;ctx.lineWidth=3;for(var i=0;i<sides;i++){ctx.rotate(TAU/sides);ctx.beginPath();ctx.moveTo(this.radius-5,-6-index%3);ctx.lineTo(this.radius+16+(i%2)*5,0);ctx.lineTo(this.radius-5,6+index%3);ctx.closePath();ctx.fill();ctx.stroke();}ctx.rotate(-this.orbit*(this.enraged?1.6:1));ctx.fillStyle='rgba(5,5,8,.72)';ctx.strokeStyle=this.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,this.radius*.58,0,TAU);ctx.fill();ctx.stroke();ctx.rotate(index*.41+visualTick*.012);ctx.strokeStyle='#fff';ctx.lineWidth=3;for(var crest=0;crest<3+index%5;crest++){ctx.rotate(TAU/(3+index%5));ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(this.radius*.48,0);ctx.stroke();ctx.beginPath();ctx.arc(this.radius*.37,0,3+index%4,0,TAU);ctx.fill();}if(this.comboState==='windup'){ctx.globalAlpha=.85;ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,this.radius+24+Math.sin(visualTick*.18)*8,0,TAU);ctx.stroke();}if(this.enraged){ctx.globalAlpha=.62;ctx.strokeStyle=this.apex?'#fff':this.color;ctx.lineWidth=this.apex?9:6;ctx.beginPath();ctx.arc(0,0,this.radius+10,0,TAU);ctx.stroke();}ctx.restore();
    };
    function spawnBiomeBoss(options){options=options||{};var spots=[[0,-910],[910,0],[0,910],[-910,0]],spot=options.fromCutscene?[0,-8]:spots[Math.floor((wave-1)/5)%spots.length],boss=new BiomeBoss(spot[0],spot[1],currentBiome.hazard);boss.resolveObstacles();enemies.push(boss);enemyGridReady=false;playSound('boss.spawn',{x:boss.x,y:boss.y});el('wave-banner').textContent=boss.name;el('wave-banner').classList.add('show');setTimeout(function(){el('wave-banner').classList.remove('show');},1050);updateBossHud();return boss;}

    function enemyShot(enemy, angle, speed, damage, color, homing) {
        var speedBoost = player && player.pacts.hasteCovenant ? 1.15 : 1;
        playSound('enemy.attack', { x: enemy.x, y: enemy.y });
        bullets.push(spawnBullet({ x: enemy.x, y: enemy.y, angle: angle, speed: speed * speedBoost, damage: damage, friendly: false, color: color, radius: 4, life: 175, homing: homing || 0 }));
    }
    function enemyNova(enemy, count, speed, color) { for (var i = 0; i < count; i++) enemyShot(enemy, i * TAU / count + enemy.orbit, speed, 1, color); addRing(enemy.x, enemy.y, color, 90, 4); }

    function closestEnemy(x, y, max, excluded) {
        var best=null,bestSq=(max||Infinity)*(max||Infinity),limit=max||Infinity;
        if(enemyGridReady&&isFinite(limit)){var minX=Math.floor((x-limit)/ENEMY_CELL),maxX=Math.floor((x+limit)/ENEMY_CELL),minY=Math.floor((y-limit)/ENEMY_CELL),maxY=Math.floor((y+limit)/ENEMY_CELL);for(var gx=minX;gx<=maxX;gx++)for(var gy=minY;gy<=maxY;gy++){var cell=enemyGrid[gridKey(gx,gy)];if(!cell)continue;for(var ci=0;ci<cell.length;ci++){var e=cell[ci];perfStats.closestCandidates++;if(e.dead||(excluded&&excluded[e.id]))continue;var fdx=e.x-x,fdy=e.y-y,fsq=fdx*fdx+fdy*fdy;if(fsq<bestSq){best=e;bestSq=fsq;}}}}
        else for (var i = 0; i < enemies.length; i++) { var fallback=enemies[i];perfStats.closestCandidates++;if(fallback.dead||(excluded&&excluded[fallback.id]))continue;var fdx=fallback.x-x,fdy=fallback.y-y,fsq=fdx*fdx+fdy*fdy;if(fsq<bestSq){best=fallback;bestSq=fsq;} }
        return best;
    }
    function chainLightning(origin, first, damage, jumps, color, stun) {
        playSound('lightning',{x:origin.x,y:origin.y});
        var points = [{ x: origin.x, y: origin.y }]; var hit = {}; var target = first;
        for (var i = 0; i < jumps && target; i++) {
            hit[target.id] = true; points.push({ x: target.x, y: target.y }); damageEnemy(target, damage * Math.pow(.82, i), { status: 'shock', stun: stun && chance(.25) ? 24 : 0, direct: true });
            target = closestEnemy(target.x, target.y, 240 + i * 20, hit);
        }
        addLightning(points, color);
    }
    function applyStatus(e, status, chrono) {
        if (status === 'burn') {if(!e.burn)playSound('status.burn',{x:e.x,y:e.y});e.burn = Math.max(e.burn, 180);e.burnOwnerId=player&&player.netId||e.burnOwnerId;}
        if (status === 'freeze') {if(!e.freeze)playSound('status.freeze',{x:e.x,y:e.y});e.freeze = Math.max(e.freeze, 115);}
        if (status === 'shock') {if(!e.stun)playSound('status.shock',{x:e.x,y:e.y});e.stun = Math.max(e.stun, 7);}
        if (status === 'rift') {if(!e.rift)playSound('status.rift',{x:e.x,y:e.y});e.rift = Math.max(e.rift, 240);}
        if (status === 'curse') {if(!e.curse)playSound('status.curse',{x:e.x,y:e.y});e.curse = Math.max(e.curse, 300); e.curseTick = 0;e.curseOwnerId=player&&player.netId||e.curseOwnerId; }
        if (status === 'poison') {if(!e.poison)playSound('status.poison',{x:e.x,y:e.y});e.poison = Math.max(e.poison, 300); e.poisonTick = 0;e.poisonOwnerId=player&&player.netId||e.poisonOwnerId; }
        var definition=STATUS_EFFECTS[status];if(definition&&!definition.builtin){var custom=e.customStatuses||(e.customStatuses=Object.create(null)),state=custom[status]||{remaining:0,tick:0,stacks:0,ownerId:''},stackMode=definition.stackMode||'refresh',maxStacks=Math.round(clamp(definition.maxStacks||1,1,20));if(stackMode==='stack')state.stacks=Math.min(maxStacks,Math.max(1,state.stacks+1));else if(stackMode==='intensity')state.stacks=Math.min(maxStacks,Math.max(1,state.stacks+1));else state.stacks=Math.max(1,state.stacks||1);state.remaining=Math.max(stackMode==='extend'?state.remaining:0,0)+Math.max(1,Number(definition.durationFrames)||180);if(stackMode!=='extend')state.remaining=Math.max(state.remaining,Math.max(1,Number(definition.durationFrames)||180));state.ownerId=player&&player.netId||state.ownerId;custom[status]=state;if(definition.effectModelId)addDataEffect(e.x,e.y,{modelId:definition.effectModelId,color:definition.color,accent:definition.accent||'#fff',size:definition.effectSize||e.radius*3,durationFrames:18,count:Math.min(14,4+state.stacks*2)});}
        if (chrono) e.fieldSlow = Math.min(e.fieldSlow, .4);
    }
    function bindMarionette(target){
        var candidates=[];for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead||e===target)continue;var d=Math.hypot(e.x-target.x,e.y-target.y);if(d<=390)candidates.push({e:e,d:d});}candidates.sort(function(a,b){return a.d-b.d;});var group=nextPuppetGroup++,linked=[target];for(var j=0;j<Math.min(2,candidates.length);j++)linked.push(candidates[j].e);for(var k=0;k<linked.length;k++){linked[k].puppetGroup=group;linked[k].puppetTimer=240;addRing(linked[k].x,linked[k].y,k===0?'#fff':'#caa7ff',42+k*5,3);}for(var l=1;l<linked.length;l++)addBeam(target.x,target.y,linked[l].x,linked[l].y,'#caa7ff',3);return linked.length;
    }
    function damageEnemy(e, amount, opts) {
        opts = opts || {}; if (!e || e.dead) return;
        var modDamage=modEvent('beforeEnemyDamage',{enemy:e,amount:amount,options:opts,player:player,cancel:false});if(modDamage.cancel)return;amount=Math.max(0,Number(modDamage.amount)||0)*Math.max(0,Number(modRule('playerDamageMultiplier',1))||1);opts=modDamage.options||opts;
        if(e.hidden){if(!opts.silent)addFloat('BURROW',e.x,e.y-18,'#62c370');return;}
        if(e.elite&&player.passives.eliteBreaker)amount*=1.25;if(player.cores.moon&&e.hp/e.maxHp<=.08)amount=Math.max(amount,e.hp+1);
        if (player.passives.executioner && e.hp / e.maxHp <= .25) amount *= 1.4;
        if (e.rift > 0 && opts.status) amount *= 1.28;
        if (player.pacts.glassOath) amount *= 1.32;
        if(e.trainingDummy){e.flash=5;applyStatus(e,opts.status||'',opts.chrono);addDamageFloat(fmt(amount),e,opts.crit?'#f1c40f':'#fff');addParticles(e.x,e.y,e.color,3,2);return;}
        var hadElement=(e.burn>0?'burn':e.freeze>0?'freeze':e.poison>0?'poison':e.stun>0?'shock':'');e.hp -= amount; e.flash = 5; applyStatus(e, opts.status || '', opts.chrono); if (opts.stun) e.stun = Math.max(e.stun, opts.stun);if(player.passives.elementalCrucible&&opts.status&&hadElement&&hadElement!==opts.status&&!e.reactionCooldown){e.reactionCooldown=90;explode(e.x,e.y,72,Math.max(5,amount*.42),true,'#fff0a8',opts.status,false);for(var reactionIndex=0;reactionIndex<enemies.length;reactionIndex++){var reactionTarget=enemies[reactionIndex];if(reactionTarget.dead||Math.hypot(reactionTarget.x-e.x,reactionTarget.y-e.y)>132)continue;applyStatus(reactionTarget,hadElement,false);applyStatus(reactionTarget,opts.status,false);}addFloat('REACTION',e.x,e.y-e.radius-18,'#fff0a8');}
        if(opts.direct&&!opts.puppetEcho&&e.puppetGroup&&e.puppetTimer>0){for(var pe=0;pe<enemies.length;pe++){var partner=enemies[pe];if(partner===e||partner.dead||partner.puppetGroup!==e.puppetGroup||partner.puppetTimer<=0)continue;addBeam(e.x,e.y,partner.x,partner.y,'#caa7ff',2);damageEnemy(partner,amount*.28,{direct:false,silent:true,puppetEcho:true,status:opts.status||''});}}
        if (opts.knockback) { var a = opts.angle || 0,force=e.isBoss?opts.knockback*.12:opts.knockback; e.x += Math.cos(a) * force; e.y += Math.sin(a) * force; }
        if (!opts.silent) { addDamageFloat(fmt(amount),e,opts.crit ? '#f1c40f' : '#fff'); playSound(opts.crit ? 'hit.crit' : 'hit.flesh', { x: e.x, y: e.y }); }
        if (opts.direct && player.stats.lifesteal > 0 && amount > 0) player.hp = Math.min(player.maxHp, player.hp + amount * player.stats.lifesteal);
        if (e.hp <= 0) {if(player.passives.bloodCompass&&opts.crit){player.hp=Math.min(player.maxHp,player.hp+.5);addFloat('+0.5 HUNT',player.x,player.y-36,'#ff718f');}e.dead = true; onEnemyKilled(e); }
        modEvent('afterEnemyDamage',{enemy:e,amount:amount,options:opts,player:player});
    }
    function dropBossResources(e,recipients){
        if(!e||!e.isBoss||!e.bossDef)return;var loot=e.bossDef.loot||{},cycleBonus=1+Math.floor(Math.max(0,wave-1)/80)*.25;
        Object.keys(loot).forEach(function(resourceId){
            if(!RESOURCE_DEFS[resourceId])return;var amount=Math.max(1,Math.ceil(loot[resourceId]*cycleBonus));
            recipients.forEach(function(recipient,index){var angle=index*TAU/Math.max(1,recipients.length)+Object.keys(loot).indexOf(resourceId)*.7;pickups.push(new Pickup(e.x+Math.cos(angle)*32,e.y+Math.sin(angle)*32,'resource',amount,recipient.netId,resourceId));});
        });
        showToast('SOVEREIGN SPOILS · EACH KNIGHT RECEIVES A FULL SHARE',e.color);
    }
    function manaPickupValue(recipient,base){var pickupMultiplier=Math.max(.75,Number(recipient&&recipient.manaRegenMultiplier)||1)*(1+Math.max(0,Number(recipient&&recipient.stats&&recipient.stats.manaRegen)||0))*(recipient&&recipient.passives&&recipient.passives.calmMind?1.45:1)*(recipient&&recipient.overclock>0?1.75:1);return Math.max(1,Math.min(80,Math.ceil(base*pickupMultiplier)));}
    function manaDropChanceFor(recipient){return clamp(.55+Math.max(0,Number(recipient&&recipient.manaDropBonus)||0),0,.78);}
    function onEnemyKilled(e) {
        kills++; score += e.isBoss?250:e.bossSummon?5:e.elite ? 35 : 10; addParticles(e.x, e.y, e.color, e.isBoss?34:e.elite?16:9, e.isBoss?9:e.elite?6:4);
        playSound(e.isBoss ? 'boss.defeat' : 'enemy.death', { x: e.x, y: e.y });
        if(e.elite&&player.passives.eliteBreaker){player.armor=Math.min(player.maxArmor,player.armor+2);player.mana=Math.min(player.maxMana,player.mana+40);}
        if(e.kind==='splitter'&&!e.splitDone){e.splitDone=true;for(var gs=-1;gs<=1;gs+=2){var child=new Enemy(e.x+gs*16,e.y+rand(-8,8),'shardling');child.elite=false;child.maxHp*=.72;child.hp=child.maxHp;enemies.push(child);}addRing(e.x,e.y,'#bcefff',72,5);showToast('GLASS COLONY SPLITS','#9ce7ff');}
        if(e.kind==='sporeHost')hazards.push(new TimedField(e.x,e.y,78,'poisonBloom',145));
        if(e.biomeVariantKey==='spore'&&!e.isBoss&&!e.bossSummon&&hazards.filter(function(field){return field.variantDeathSpore&&!field.dead;}).length<8){var deathSpore=new TimedField(e.x,e.y,54,'enemySpore',105);deathSpore.variantDeathSpore=true;hazards.push(deathSpore);}
        if(player.classId==='melee'&&Math.hypot(e.x-player.x,e.y-player.y)<165){player.armorRegenDelay=Math.max(0,player.armorRegenDelay-120);player.armorRegenTimer+=18;}
        player.coreKillCounter++;if(player.cores.thorn&&player.coreKillCounter%20===0){player.hp=Math.min(player.maxHp,player.hp+1);addFloat('+1 ROOT',player.x,player.y-34,'#70e394');}
        if(player.cores.ember&&chance(.14))explode(e.x,e.y,64,6*player.damageMultiplier(),true,'#ff7a36','burn',false);
        if(player.cores.spore&&e.poison>0){hazards.push(new TimedField(e.x,e.y,82,'poisonBloom',135));for(var ps=0;ps<enemies.length;ps++){var spreadFoe=enemies[ps];if(!spreadFoe.dead&&spreadFoe!==e&&Math.hypot(spreadFoe.x-e.x,spreadFoe.y-e.y)<150)applyStatus(spreadFoe,'poison');}}
        var coinCount = e.isBoss?12:e.bossSummon?0:e.elite ? 6 : (chance(.74) ? 1 : 0) + (chance(.18) ? 1 : 0);
        if (player.passives.scavenger && e.elite) coinCount += 2;
        var mult = 1 + player.stats.coin + (player.pacts.bloodLedger ? .35 : 0) + (player.primeMemory==='GOLD SCRIPT'?.08:0);
        var exactCoins = coinCount * mult;
        coinCount = Math.floor(exactCoins) + (chance(exactCoins - Math.floor(exactCoins)) ? 1 : 0);
        var recipients=partyPlayers();if(e.isBoss)dropBossResources(e,recipients);
        for (var i = 0; i < coinCount; i++)for(var recipientIndex=0;recipientIndex<recipients.length;recipientIndex++){var recipient=recipients[recipientIndex];pickups.push(new Pickup(e.x+rand(-12,12),e.y+rand(-12,12),'coin',1,recipient.netId));}
        var manaBase=e.isBoss?36:e.elite?22:14;for(var manaRecipientIndex=0;manaRecipientIndex<recipients.length;manaRecipientIndex++){var manaRecipient=recipients[manaRecipientIndex],manaDropCount=e.isBoss?2:e.bossSummon?0:e.elite?1:(chance(manaDropChanceFor(manaRecipient))?1:0);for(var manaDropIndex=0;manaDropIndex<manaDropCount;manaDropIndex++)pickups.push(new Pickup(e.x+rand(-12,12),e.y+rand(-12,12),'mana',manaPickupValue(manaRecipient,manaBase),manaRecipient.netId));}
        if (e.burn > 0) explode(e.x, e.y, 34, 2.2 * player.damageMultiplier(), true, '#ff6b35', 'burn', false);
        if(player.primeMemory==='MYCELIUM'&&e.poison>0)hazards.push(new TimedField(e.x,e.y,54,'poisonBloom',95));
        if(player.weapon)runWeaponHooks(player.weapon,'onEnemyKilled',{player:player,weapon:player.weapon,enemy:e,api:WEAPON_API});
        modEvent('enemyKilled',{enemy:e,player:player,wave:wave,isBoss:!!e.isBoss,isElite:!!e.elite});
        hudRefreshMs=Math.max(hudRefreshMs,120);
    }

    function Totem(x, y) { this.x=x;this.y=y;this.life=370;this.timer=0;this.dead=false;this.ownerId=player&&player.netId||'';this.netId=netTotemId++; }
    Totem.prototype.update = function (step) {var totemPrimary=player,totemOwner=this.ownerId&&playerByNetId(this.ownerId);if(totemOwner)player=totemOwner;try{this.life-=step;this.timer+=step;if(this.life<=0)this.dead=true;if(this.timer>42){this.timer=0;var e=closestEnemy(this.x,this.y,420);if(e)chainLightning(this,e,5*player.damageMultiplier(),3,'#74b9ff',false);}}finally{player=totemPrimary;} };
    Totem.prototype.draw = function () { ctx.save();ctx.translate(this.x,this.y);ctx.strokeStyle='#74b9ff';ctx.lineWidth=3;ctx.strokeRect(-9,-14,18,28);ctx.rotate(visualTick*.03);ctx.beginPath();ctx.arc(0,0,18,0,TAU);ctx.stroke();ctx.restore(); };

    function processPendingShots(step) {
        for (var i = pendingShots.length - 1; i >= 0; i--) {
            var s = pendingShots[i]; s.frames -= step;
            if(s.frames<=0){
                var pendingPrimary=player,pendingOwner=s.ownerId&&playerByNetId(s.ownerId);if(pendingOwner)player=pendingOwner;
                if(s.kind==='echoSlash'){slashes.push(spawnSlash({x:s.x,y:s.y,angle:s.angle,radius:s.radius+18,arc:s.arc,damage:s.damage,color:'#bcd2ff',deflect:false,knockback:4,sourceId:s.sourceId,life:18,maxLife:18}));addRing(s.x+Math.cos(s.angle)*s.radius*.7,s.y+Math.sin(s.angle)*s.radius*.7,s.color,52,4);}
                else if(s.kind==='phaseEcho'){slashes.push(spawnSlash({x:s.x,y:s.y,angle:s.angle,radius:s.radius,arc:s.arc,damage:s.damage,color:s.color,deflect:true,knockback:2,sourceId:s.sourceId,life:17,maxLife:17}));addRing(s.x+Math.cos(s.angle)*s.radius*.62,s.y+Math.sin(s.angle)*s.radius*.62,s.color,48,3);}
                else if(s.kind==='weaponHook'){var delayed=weaponCopy(s.weaponId);delayed.level=s.level;var payload=Object.assign({player:player,weapon:delayed,api:WEAPON_API},s.payload||{});runWeaponAction(delayed,s.hook,payload);}
                else if(s.kind==='skillHook'&&window.DKEditorCore&&window.DKEditorCore.executeSkill){var skillPayload=Object.assign({player:player,skill:ACTIVE_DEFS[s.skillId],weapon:player.weapon,api:WEAPON_API},s.payload||{});window.DKEditorCore.executeSkill(s.skillId,skillPayload,skillPayload.editorStartIds||[]);}
                else if(s.kind==='royalRing'){slashes.push(spawnSlash({x:s.x,y:s.y,angle:0,radius:s.radius,arc:TAU,damage:s.damage,color:s.color,deflect:true,knockback:9,stun:24,sourceId:s.sourceId,life:20,maxLife:20}));addRing(s.x,s.y,s.color,s.radius,10);}
                else if(s.kind==='gunSide'){for(var gs=-1;gs<=1;gs+=2)bullets.push(spawnBullet({x:player.x,y:player.y,angle:s.angle+gs*.24,speed:s.speed,damage:s.damage,friendly:true,color:s.color,sourceId:s.weaponId,type:'tracer',pierce:1,life:100}));addRing(player.x,player.y,'#f1c40f',45,3);}
                else if(s.kind==='attackEcho'){var echo=weaponCopy(s.weaponId);echo.level=s.level;echo.damage*=s.scale;echo.color=s.color||echo.color;var ea=s.angle,echoContext={player:player,weapon:echo,angle:ea,power:s.power||1,burstIndex:0,isEcho:true,api:WEAPON_API};
                    if(!runWeaponAction(echo,'attack',echoContext))player.fireWeapon(echo,ea,s.power||1,0);addRing(player.x,player.y,s.color||'#ff9ff3',65,3);
                }else{var base=weaponCopy(s.weaponId);base.level=s.level;player.fireWeapon(base,s.angle+rand(-.025,.025),1,s.index);}
                player=pendingPrimary;pendingShots.splice(i,1);
            }
        }
    }

    function callSkyLances(target,b){var count=b.skyLances||0;if(!count||!target)return;b.skyLances=0;for(var sky=0;sky<count;sky++){var ringA=sky*TAU/count+(sky%2 ? .18 : -.18),distance=b.heavenfall?390:260+(sky%2)*45,sx=target.x+Math.cos(ringA)*distance,sy=target.y+Math.sin(ringA)*distance*.72,sa=Math.atan2(target.y-sy,target.x-sx);bullets.push(spawnBullet({x:sx,y:sy,angle:sa,speed:b.heavenfall?20:16,damage:b.damage*(b.heavenfall ? .44 : .34),friendly:true,color:b.heavenfall?(sky%2?'#fff':'#f1c40f'):b.color,sourceId:b.heavenfall?'heavenfallLance':'skyLance',type:'windBolt',radius:b.heavenfall?7:5,life:96,pierce:b.heavenfall?4:2,ghost:true,homing:.02,status:b.skyStatus||'',clearsBullets:!!b.heavenfall}));}addRing(target.x,target.y,b.heavenfall?'#f1c40f':b.color,b.heavenfall?190:112,b.heavenfall?10:5);if(b.heavenfall){explode(target.x,target.y,126,b.damage*.62,true,'#fff4b0','shock',false);hazards.push(new TimedField(target.x,target.y,116,'light',150));addFloat('HEAVEN OPENS',target.x,target.y-48,'#f1c40f');}else addFloat('SKY CROSS',target.x,target.y-42,b.color);capArray(bullets,720);}

    function handleCollisions() {
        if(!enemyGridReady)rebuildEnemyGrid();
        for (var bi = 0; bi < bullets.length; bi++) {
            var b = bullets[bi]; if (b.dead) continue;
            if (b.friendly) {
                var struckProp = false;
                for (var pi = 0; pi < biomeProps.length; pi++) {
                    var prop = biomeProps[pi], propKey = 'p' + prop.id;
                    if (prop.dead || b.hitIds[propKey]) continue;
                    if (Math.hypot(b.x - prop.x, b.y - prop.y) < b.radius + prop.radius) {
                        b.hitIds[propKey] = true; hitBiomeProp(prop, b); addImpactFlash(b, b.x, b.y);
                        if (b.returning) b.returningHome = true; else if (b.pierce > 0) b.pierce--; else b.expire();
                        struckProp = true; break;
                    }
                }
                if (struckProp) continue;
                fillEnemyCandidates(b.x,b.y,b.radius+42,collisionCandidates);perfStats.collisionCandidates+=collisionCandidates.length;
                for (var ei = 0; ei < collisionCandidates.length; ei++) {
                    var e = collisionCandidates[ei];perfStats.collisionChecks++;if (e.dead || b.hitIds[e.id]) continue;
                    if (Math.hypot(b.x - e.x, b.y - e.y) < b.radius + e.radius) {
                        if (e.blocks(b)) {playSound('hit.block',{x:e.x,y:e.y});if(e.kind==='prism'){b.friendly=false;b.vx*=-1;b.vy*=-1;b.color='#fff';addFloat('REFLECT',e.x,e.y-28,'#e9fbff');}else{e.shieldHp=Math.max(0,e.shieldHp-b.damage);b.dead=true;addFloat(e.shieldHp>0?'SHIELD '+Math.ceil(e.shieldHp):'SHIELD BREAK',e.x,e.y-32,e.shieldHp>0?'#bdc3c7':'#f1c40f');addParticles(e.x,e.y,'#9ce7ff',e.shieldHp>0?4:12,3);if(e.shieldHp<=0){e.stun=Math.max(e.stun,45);addRing(e.x,e.y,'#9ce7ff',70,5);}}break; }
                        var hitPrimary=player,hitOwner=b.ownerId&&playerByNetId(b.ownerId);if(hitOwner)player=hitOwner;try{
                        b.hitIds[e.id] = true;
                        var dealt = b.damage,sourceWeapon=WEAPON_DEFS[b.sourceId]||null;
                        if (b.pointBlankBonus && Math.hypot(b.x-b.startX,b.y-b.startY)<145) dealt*=1.2;
                        if(b.distanceScale)dealt*=1+Math.min(.8,Math.hypot(b.x-b.startX,b.y-b.startY)/720);
                        var hitContext={player:player,weapon:sourceWeapon,bullet:b,target:e,damage:dealt,api:WEAPON_API};if(sourceWeapon&&weaponHasHook(sourceWeapon,'beforeProjectileHit')){runWeaponHooks(sourceWeapon,'beforeProjectileHit',hitContext);dealt=hitContext.damage;}
                        if(!(sourceWeapon&&sourceWeapon.editorBlueprintManaged)&&b.marionette&&!e.dead){var linked=bindMarionette(e);b.marionette=false;addFloat(linked+' BOUND',e.x,e.y-39,'#e8d8ff');}
                        damageEnemy(e, dealt, { status: b.status, knockback: b.knockback, angle: Math.atan2(b.vy,b.vx), direct: true, crit: b.crit, chrono: b.chrono });
                        if(sourceWeapon&&weaponHasHook(sourceWeapon,'afterProjectileHit'))runWeaponHooks(sourceWeapon,'afterProjectileHit',hitContext);
                        var graphHitManaged=!!(sourceWeapon&&sourceWeapon.editorBlueprintManaged);if(!graphHitManaged){
                        if(b.prismCrit){b.prismCrit=false;var prismBase=Math.atan2(b.vy,b.vx);for(var pc=-1;pc<=1;pc+=2)bullets.push(spawnBullet({x:e.x,y:e.y,angle:prismBase+pc*.72,speed:14,damage:b.damage*.38,friendly:true,color:'#e6fbff',sourceId:'prismCore',type:'shard',radius:4,life:72,pierce:1,homing:.035}));}
                        if(b.sunshard){var shardBase=Math.atan2(b.vy,b.vx);for(var ss=-1;ss<=1;ss+=2)bullets.push(spawnBullet({x:e.x,y:e.y,angle:shardBase+ss*Math.PI/2,speed:15,damage:b.damage*.32,friendly:true,color:'#fff3b0',sourceId:'sunshardSplit',type:'sunRay',radius:4,life:54,pierce:1,ghost:true}));}
                        if(b.starVolley){b.starVolley=false;var fall=new TimedField(e.x,e.y,76,'starfall',72);fall.damage=b.damage*.7;fall.color=b.color;hazards.push(fall);addRing(e.x,e.y,b.color,82,4);}
                        if(b.graveglass&&e.dead){var ghostTarget=closestEnemy(e.x,e.y,420,b.hitIds);if(ghostTarget){var ghostAngle=Math.atan2(ghostTarget.y-e.y,ghostTarget.x-e.x);bullets.push(spawnBullet({x:e.x,y:e.y,angle:ghostAngle,speed:19,damage:b.damage*.72,friendly:true,color:'#eadfff',sourceId:'graveglassGhost',type:'graveglass',radius:6,life:90,pierce:2,ghost:true,homing:.04}));}}
                        if(player.passives.coolingJacket&&b.sourceId&&WEAPON_DEFS[b.sourceId]&&WEAPON_DEFS[b.sourceId].family==='smg'){player.familyStreak++;if(player.familyStreak%20===0)player.mana=Math.min(player.maxMana,player.mana+6);}
                        if(b.crosswind){b.crosswind=false;var windAngle=Math.atan2(b.vy,b.vx),perp=windAngle+Math.PI/2;for(var cw=0;cw<4;cw++){var lane=cw<2?-1:1,depth=cw%2?42:-46,cwx=e.x+Math.cos(perp)*lane*(96+(cw%2)*34)+Math.cos(windAngle)*depth,cwy=e.y+Math.sin(perp)*lane*(96+(cw%2)*34)+Math.sin(windAngle)*depth,cwa=Math.atan2(e.y-cwy,e.x-cwx);bullets.push(spawnBullet({x:cwx,y:cwy,angle:cwa,speed:16.5,damage:b.damage*.38,friendly:true,color:cw%2?'#e9fbff':'#83e6ff',sourceId:'crosswindFlank',type:'windBolt',radius:5,life:88,pierce:2,ghost:true,homing:.025}));}addRing(e.x,e.y,'#e9fbff',104,5);addFloat('CROSSWIND!',e.x,e.y-42,'#83e6ff');}
                        if(b.skyLances)callSkyLances(e,b);}
                        if(b.scarlet)player.hp=Math.min(player.maxHp,player.hp+.08);if(b.pulsewake)player.overclock=Math.max(player.overclock,32);
                        if(b.resonance==='WILDBLOOM')player.hp=Math.min(player.maxHp,player.hp+.04);
                        if(!graphHitManaged){
                        if (b.mark && !e.dead) { e.mark++; if (e.mark >= 5) { e.mark = 0; explode(e.x,e.y,58,12*player.damageMultiplier(),true,'#c8d6e5','',false); addFloat('HUNT!',e.x,e.y-35,'#f1c40f'); } }
                        if (b.shatterMark && !e.dead) { e.shards++;e.shardTime=240;if(e.shards>=3){e.shards=0;e.shardTime=0;addDarkBloom(e.x,e.y,48);explode(e.x,e.y,52,8*player.damageMultiplier(),true,'#7ed6df','',false);addFloat('SHATTER!',e.x,e.y-38,'#dffcff');} }
                        if (b.starMark && !e.dead) { e.stars++;e.starTime=300;if(e.stars>=3){e.stars=0;e.starTime=0;explode(e.x,e.y,78,18*player.damageMultiplier(),true,'#6c8cff','shock',false);addFloat('CONSTELLATION!',e.x,e.y-38,'#dbe4ff');} }
                        if(b.nailMark&&!e.dead){e.nails=(e.nails||0)+1;e.nailTime=300;if(e.nails>=4){e.nails=0;e.nailTime=0;explode(e.x,e.y,54,9*player.damageMultiplier(),true,'#b8b0a2','',false);addFloat('RIVET RIP!',e.x,e.y-38,'#f1eee7');}}
                        if(b.tesla&&!e.dead){var teslaExclude={};teslaExclude[e.id]=true;var fork=closestEnemy(e.x,e.y,310,teslaExclude);if(fork)chainLightning(e,fork,b.damage*.62,3,'#70e6ff',true);b.tesla=false;}
                        if (b.harpoon && !e.dead) { var aurora=new TimedField(e.x,e.y,0,'aurora',180);aurora.targetId=e.id;aurora.damage=Math.max(1.8,b.damage*.16);hazards.push(aurora);b.harpoon=false;addRing(e.x,e.y,'#7efff5',44,3); }
                        if(b.railhook&&!e.dead){b.railhook=false;var hookStartX=e.x,hookStartY=e.y,hookAngle=Math.atan2(player.y-e.y,player.x-e.x),hookPull=Math.min(120,Math.max(48,Math.hypot(player.x-e.x,player.y-e.y)*.28));e.x+=Math.cos(hookAngle)*hookPull;e.y+=Math.sin(hookAngle)*hookPull;e.resolveObstacles();e.stun=Math.max(e.stun,22);addBeam(hookStartX,hookStartY,e.x,e.y,'#dffcff',5);addFloat('RAILHOOK',e.x,e.y-36,'#64c5d6');}
                        if (b.oracleStorm && !e.dead) { var chained=closestEnemy(e.x,e.y,290,(function(){var ex={};ex[e.id]=true;return ex;}()));if(chained)chainLightning(e,chained,b.damage*.55,2,'#ffe66d',true);b.oracleStorm=false; }
                        if (b.prism) { b.damage *= 1.22; b.radius += .7; }
                        if (b.split && !e.dead) {
                            for (var sp=0;sp<b.split;sp++) {
                                var ta=closestEnemy(e.x,e.y,360,b.hitIds);
                                var aa=ta?Math.atan2(ta.y-e.y,ta.x-e.x):Math.atan2(b.vy,b.vx)+(sp-(b.split-1)/2)*.7;
                                var childColor=b.splitColors&&b.splitColors.length?b.splitColors[sp%b.splitColors.length]:(b.splitColor||b.color);
                                bullets.push(spawnBullet({x:e.x,y:e.y,angle:aa,speed:b.splitSpeed||12,damage:b.damage*(b.splitDamageScale||.45),friendly:true,color:childColor,sourceId:b.splitSourceId||b.sourceId,type:b.splitType||'arrow',radius:b.splitRadius||4,homing:b.splitHoming||.035,life:b.splitLife||70,pierce:b.splitPierce||0,hitIds:Object.assign({},b.hitIds)}));
                            }
                            b.split=0;
                        }
                        if (b.pollen && !e.dead) {
                            for(var pl=0;pl<2;pl++){var pollenTarget=closestEnemy(e.x,e.y,330,b.hitIds);var pollenAngle=pollenTarget?Math.atan2(pollenTarget.y-e.y,pollenTarget.x-e.x):Math.atan2(b.vy,b.vx)+(pl?-.65:.65);bullets.push(spawnBullet({x:e.x,y:e.y,angle:pollenAngle,speed:9,damage:b.damage*.48,friendly:true,color:'#d7e35b',sourceId:'pollenCodex',type:'seed',radius:4,homing:.07,life:72,hitIds:Object.assign({},b.hitIds)}));}b.pollen=false;
                        }
                        if(b.moonSplit&&!e.dead){for(var moon=0;moon<2;moon++){var moonAngle=Math.atan2(b.vy,b.vx)+(moon?-.65:.65);bullets.push(spawnBullet({x:e.x,y:e.y,angle:moonAngle,speed:13,damage:b.damage*.42,friendly:true,color:'#c9d1ff',sourceId:'lunarIdol',type:'moonBlade',radius:6,homing:.085,pierce:1,life:100,hitIds:Object.assign({},b.hitIds)}));}b.moonSplit=false;}
                        if (b.comet) hazards.push(new TimedField(b.x,b.y,68,'fire',170));}
                        if (b.returning) { }
                        else if (b.pierce > 0) b.pierce--; else b.expire();
                        addImpactFlash(b,b.x,b.y);addParticles(b.x,b.y,b.color,b.impactParticles||4,2.8);
                        }finally{player=hitPrimary;}break;
                    }
                }
            } else {
                if(b.harmless)continue;
                var targets=partyPlayers();for(var targetIndex=0;targetIndex<targets.length;targetIndex++){var targetPlayer=targets[targetIndex];if(targetPlayer.downed||Math.hypot(b.x-targetPlayer.x,b.y-targetPlayer.y)>=b.radius+targetPlayer.radius)continue;if(!targetPlayer.isDashing){withActivePlayer(targetPlayer,function(){targetPlayer.hit(b.damage,'projectile');});if(b.manaDrain){targetPlayer.mana=Math.max(0,targetPlayer.mana-b.manaDrain);addFloat('-'+b.manaDrain+' MANA',targetPlayer.x,targetPlayer.y-42,'#8edbff');}b.dead=true;}break;}
            }
        }
    }

    function spawnEnemy(x, y, kind, plain) {var e=new Enemy(x,y,kind);if(plain&&e.elite){e.elite=false;e.maxHp/=1.75;e.hp=e.maxHp;e.speed/=1.1;e.radius/=1.12;}if(plain)e.variantActive=!!e.biomeVariant&&e.id%3===0;enemies.push(e);return e;}
    function edgeSpawn() {
        var gates=[[-1140,-790],[-1140,0],[-1140,790],[1140,-790],[1140,0],[1140,790],[-460,-1140],[460,-1140],[-460,1140],[460,1140]],gate=pick(gates),x=gate[0]+rand(-35,35),y=gate[1]+rand(-35,35),tries=0;while(tries++<10&&obstacles.some(function(o){return!!obstacleContact(x,y,28,o);})){gate=pick(gates);x=gate[0]+rand(-35,35);y=gate[1]+rand(-35,35);}return{x:x,y:y};
    }
    var BIOME_REINFORCEMENTS={ember:'ashMauler',frost:'frostLantern',sand:'duneScarab',storm:'arcTetherer',void:'mirrorMimic',blood:'roseChorister',thorn:'duneScarab',tide:'tideSkater',cloud:'frostLantern',glyph:'roseChorister',mirror:'mirrorMimic',neon:'arcTetherer',magma:'ashMauler',gear:'tideSkater',moon:'mirrorMimic',spore:'sporeMortar'};
    var BIOME_SIGNATURE_POOL=Object.create(null);Object.keys(SIGNATURE_ENEMIES).forEach(function(kind){var nativeBiome=SIGNATURE_ENEMIES[kind].biome;if(nativeBiome)BIOME_SIGNATURE_POOL[nativeBiome]=kind;});
    function enemyPoolForWave() {
        var pool = ['chaser','chaser','shooter'];
        if (wave >= 3) pool.push('tank','charger');
        if (wave >= 6) pool.push('spiral','nova','orbiter');
        if (wave >= 10) pool.push('summoner','shield','bomber');
        if (wave >= 14) pool.push('leech','charger','shield');
        if(wave>=3&&currentBiome&&currentBiome.enemy)pool.push(currentBiome.enemy,currentBiome.enemy);
        if(wave>=6&&currentBiome&&currentBiome.enemy2)pool.push(currentBiome.enemy2);
        if(wave>=4)pool.push('vaultSkitter','lanternMite');if(wave>=8)pool.push('mineLayer');if(wave>=11)pool.push('blinkStalker');if(wave>=14)pool.push('bannerBearer');if(wave>=17)pool.push('chainWarden');
        if(wave>=26)pool.push('splitter');if(wave>=12)pool.push('slagKnight','chronomancer','boneArcher','sporeHost');
        if(wave>=4&&currentBiome&&BIOME_REINFORCEMENTS[currentBiome.hazard])pool.push(BIOME_REINFORCEMENTS[currentBiome.hazard],BIOME_REINFORCEMENTS[currentBiome.hazard]);
        if(wave>=7&&currentBiome&&BIOME_SIGNATURE_POOL[currentBiome.hazard])pool.push(BIOME_SIGNATURE_POOL[currentBiome.hazard]);
        if(wave>=19&&currentBiome&&BIOME_SIGNATURE_POOL[currentBiome.hazard])pool.push(BIOME_SIGNATURE_POOL[currentBiome.hazard]);
        return pool;
    }
    function layoutKeepsLandmarkClear(layout){
        var clear=Math.max(0,Number(layout&&layout.clearRadius)||0);
        if(!clear)return true;
        var wallClear=(layout.walls||[]).every(function(w){var dx=Math.max(Math.abs(w[0])-w[2]*.5,0),dy=Math.max(Math.abs(w[1])-w[3]*.5,0);return Math.hypot(dx,dy)>clear;});
        var pillarClear=(layout.pillars||[]).every(function(p){return Math.hypot(p[0],p[1])>clear+58;});
        return wallClear&&pillarClear;
    }
    function buildRoomLayout(){
        currentLayout=ROOM_LAYOUTS.find(function(layout){return currentBiome&&layout.biome===currentBiome.hazard;})||ROOM_LAYOUTS[Math.floor((wave-1)/5)%ROOM_LAYOUTS.length];obstacles=[];roomDecor=[];
        currentLayout.walls.forEach(function(w){obstacles.push(new RoomStructure(w[0]*LAYOUT_SCALE,w[1]*LAYOUT_SCALE,w[2]*LAYOUT_SCALE,w[3]*LAYOUT_SCALE,'wall'));});currentLayout.pillars.forEach(function(p){obstacles.push(new RoomStructure(p[0]*LAYOUT_SCALE,p[1]*LAYOUT_SCALE,82,82,'pillar'));});
        currentLayout.decor.forEach(function(d,i){roomDecor.push(new RoomDecoration(d[0]*LAYOUT_SCALE,d[1]*LAYOUT_SCALE,'cluster',i%3));});
        var edgeDecor=[[-1070,-980],[-830,-1070],[1070,-980],[830,-1070],[-1070,980],[-830,1070],[1070,980],[830,1070]];edgeDecor.forEach(function(d,i){if(i%2===Math.floor((wave-1)/5)%2)roomDecor.push(new RoomDecoration(d[0],d[1],'cluster',i));});
        if(currentBiome&&BIOME_ART[currentBiome.hazard]&&BIOME_ART[currentBiome.hazard].landscape==='royalPalace')obstacles.push(new RoomStructure(0,0,118,118,'palaceStatue'));player.resolveObstacles();
    }
    function resetPalaceCutscene(){palaceCutscene.active=false;palaceCutscene.timer=0;palaceCutscene.stage='';palaceCutscene.statueFall=0;palaceCutscene.spiritAlpha=0;palaceCutscene.swordLift=0;palaceCutscene.titleAlpha=0;}
    function startPalaceBossCutscene(){resetPalaceCutscene();palaceCutscene.active=true;palaceCutscene.stage='focus';collectAllPickups();for(var i=0;i<bullets.length;i++)if(!bullets[i].friendly)bullets[i].dead=true;obstacles=obstacles.filter(function(o){return o.kind!=='palaceStatue';});enemyGridReady=false;}
    function updatePalaceBossCutscene(step){if(!palaceCutscene.active)return;var prevT=palaceCutscene.timer;palaceCutscene.timer+=step;var t=palaceCutscene.timer;if(prevT<48&&t>=48)playSound('boss.spawn',{x:0,y:0});if(prevT<118&&t>=118)playSound('room.transition',{x:0,y:0});if(t<48){palaceCutscene.stage='focus';}else if(t<118){palaceCutscene.stage='fall';palaceCutscene.statueFall=clamp((t-48)/70,0,1);if(intervalElapsed(palaceCutscene,'dustClock',step,t>88?4.5:7.5)){var collapse=palaceCutscene.statueFall,side=Math.random()<.5?-1:1;addParticles(side*rand(18,105)*collapse,rand(-62,38),'#847674',t>90?5:3,t>90?4.6:3);if(t>92)addParticles(rand(-55,55),rand(-4,44),'#4d4144',2,2.2);}}else if(t<170){palaceCutscene.stage='rise';palaceCutscene.statueFall=1;palaceCutscene.spiritAlpha=clamp((t-118)/52,0,1);if(intervalElapsed(palaceCutscene,'spiritDustClock',step,6))addParticles(rand(-45,45),rand(-77,8),'#38131b',2,2.1);}else if(t<220){palaceCutscene.stage='sword';palaceCutscene.statueFall=1;palaceCutscene.spiritAlpha=1;palaceCutscene.swordLift=clamp((t-170)/50,0,1);palaceCutscene.titleAlpha=clamp((t-188)/32,0,1);if(intervalElapsed(palaceCutscene,'swordSparkClock',step,5))addParticles(70+(37-70)*palaceCutscene.swordLift,84+(4-84)*palaceCutscene.swordLift,'#9c3341',2,2.4);}else{palaceCutscene.stage='title';palaceCutscene.statueFall=1;palaceCutscene.spiritAlpha=1;palaceCutscene.swordLift=1;palaceCutscene.titleAlpha=1;}if(t>=252){palaceStatueFallen=true;palaceCutscene.active=false;spawnBiomeBoss({fromCutscene:true});}}

    function prepareEnvironment() {
        resetPalaceCutscene();palaceStatueFallen=false;sceneMode='run';currentBiome=BIOMES[Math.floor((wave-1)/5)%BIOMES.length];hazards=[];biomeProps=[];buildRoomLayout();netWorldRevision++;
        var hazardCount=wave<=5?2:Math.min(4,3+Math.floor(wave/30));for(var h=0;h<hazardCount;h++){var ha=currentLayout.hazards[h%currentLayout.hazards.length],hx=ha[0]*LAYOUT_SCALE+rand(-32,32),hy=ha[1]*LAYOUT_SCALE+rand(-32,32);hazards.push(new Hazard(hx,hy,currentBiome.hazard));}
        for(var bp=0;bp<4;bp++){var pa=currentLayout.props[bp%currentLayout.props.length],px=pa[0]*LAYOUT_SCALE+rand(-22,22),py=pa[1]*LAYOUT_SCALE+rand(-22,22);biomeProps.push(new BiomeProp(px,py,currentBiome.prop));}
        if(wave===1&&currentBiome.name==='THE PALACE'){var entrants=partyPlayers();for(var ep=0;ep<entrants.length;ep++){entrants[ep].x=(ep-(entrants.length-1)/2)*72;entrants[ep].y=760;entrants[ep].resolveObstacles();}}
    }
    function waveSpawnCount(n) { var early=Math.min(n,10),late=Math.max(0,n-10),smallBuff=n>5?1:0,oldTotal=Math.min(49,5+Math.floor(early*1.7)+Math.floor(late*.85)+(n%5===0?2:0)+smallBuff),scaled=Math.ceil(oldTotal*1.06*coopSpawnMultiplier()*Math.max(0,Number(modRule('enemySpawnMultiplier',1))||1));return Math.min(networkRole==='host'?78:52,scaled); }
    function wavePhaseCounts(n){var total=waveSpawnCount(n);return n%5===0?[Math.ceil(total*.7),0]:[Math.ceil(total/2),Math.floor(total/2)];}
    function spawnWavePhase(phase){if(player)player.phaseGuardAvailable=true;if(phase===2&&wave%5===0){if(currentBiome&&currentBiome.hazard==='ember')startPalaceBossCutscene();else spawnBiomeBoss();updateHUD();return;}var count=phaseSpawnCounts[phase-1]||0,pool=enemyPoolForWave();for(var i=0;i<count;i++){var ep=edgeSpawn();spawnEnemy(ep.x,ep.y,pick(pool));}enemyGridReady=false;updateHUD();}
    function startWave() {
        if (!gameActive) return;
        playSound('wave.start');
        // Armory training targets are social-room entities only. Never carry them into combat.
        enemies=enemies.filter(function(e){return !e.trainingDummy&&e.kind!=='trainingDummy';});enemyGridReady=false;
        wave++; waveTransition=false; transitionTimer=0; waveVacuum=false;phaseBreak=false;phaseBreakTimer=0;wavePhase=1;phaseSpawnCounts=wavePhaseCounts(wave);prepareEnvironment();
        modEvent('waveStart',{wave:wave,phase:1,biome:currentBiome,spawnCounts:phaseSpawnCounts,player:player});
        partyPlayers().forEach(function(member){if(member.passives.coinFoundry)member.coinFoundryCharge=Math.max(walletFor(member),(member.coinFoundryCharge||0)*.5);});
        el('wave-display').textContent='WAVE '+wave+' · PHASE 1/2'; el('wave-banner').textContent='WAVE '+wave+' · PHASE 1'; el('wave-banner').classList.add('show'); setTimeout(function(){el('wave-banner').classList.remove('show');},850);
        spawnWavePhase(1);
    }
    function checkWaveClear(step) {
        if (waveTransition || phaseBreak || !gameActive) return;
        var alive=enemies.some(function(e){return !e.dead&&!e.trainingDummy&&e.kind!=='trainingDummy';});if(alive)return;
        if(wavePhase<wavePhaseTotal){phaseBreak=true;phaseBreakTimer=38;el('wave-banner').textContent=wave%5===0?'THE SOVEREIGN APPROACHES':'PHASE 1 CLEARED · REINFORCEMENTS';el('wave-banner').classList.add('show');setTimeout(function(){el('wave-banner').classList.remove('show');},700);return;}
        waveTransition=true;waveVacuum=true;transitionTimer=72;
        playSound('wave.clear');
        pickups.forEach(function(p){if(p.kind==='coin'){p.magnet=true;p.vacuum=true;}});
        el('wave-banner').textContent='WAVE '+wave+' CLEARED';el('wave-banner').classList.add('show');setTimeout(function(){el('wave-banner').classList.remove('show');},1050);
        addRing(player.x,player.y,'#f1c40f',150,4);
        modEvent('waveCleared',{wave:wave,biome:currentBiome,player:player});
    }
    function updatePhaseBreak(step){if(!phaseBreak)return;phaseBreakTimer-=step;if(phaseBreakTimer>0)return;phaseBreak=false;wavePhase++;el('wave-display').textContent='WAVE '+wave+' · PHASE '+wavePhase+'/'+wavePhaseTotal;el('wave-banner').textContent=wave%5===0?'BOSS PHASE':'WAVE '+wave+' · PHASE '+wavePhase;el('wave-banner').classList.add('show');setTimeout(function(){el('wave-banner').classList.remove('show');},850);spawnWavePhase(wavePhase);}
    function updateTransition(step) {
        if(!waveTransition||transitionTimer<=0)return;transitionTimer-=step;if(transitionTimer<=0){playSound('room.transition');collectAllPickups();waveVacuum=false;if(wave%5===0){if(networkRole==='host'){netSceneRevision++;if(window.DKNet)window.DKNet.broadcast({type:'control',action:'armory',wave:wave,sceneRevision:netSceneRevision,players:partyPlayers().map(playerSnapshot)});}openShop();}else startWave();}
    }
    function collectAllPickups() { pickups.forEach(function(p){grantPickup(p,pickupRecipient(p));});pickups=[];updateHUD(); }


    function rarityWeightsAt(n,luck) {
        var depth=Math.floor(n/5);luck=luck||0;
        var weights={common:52,uncommon:29,rare:14,epic:4,legendary:0,mythical:0};
        weights.common=Math.max(12,weights.common-depth*3-luck*.28);weights.uncommon+=depth*1.1;weights.rare+=depth*.9+luck*.13;weights.epic=4+(n>=10?depth*.65+luck*.08:0);return weights;
    }
    function rollRarity() {
        var weights=rarityWeightsAt(wave,player?player.stats.luck:0);
        var total=0;Object.keys(weights).forEach(function(k){total+=weights[k];});var r=Math.random()*total;var order=['common','uncommon','rare','epic','legendary','mythical'];for(var i=0;i<order.length;i++){r-=weights[order[i]];if(r<=0)return order[i];}return'common';
    }
    function rarityOddsAt(n,luck) {return{wave:n,luck:luck||0,legendaryRarityRoll:0,legendaryWeaponPerSlot:0,legendaryWeaponPerShop:0,mythicalRarityRoll:0,mythicalWeaponPerSlot:0,mythicalWeaponPerShop:0,legendaryCraftOnly:true,mythicalCraftOnly:true};}
    function candidatesByRarity(obj, rarity, ownedFlags) {
        var arr=Object.keys(obj).filter(function(id){var d=obj[id];return d.rarity===rarity&&!(ownedFlags&&ownedFlags[id]);});
        if(!arr.length)arr=Object.keys(obj).filter(function(id){return !(ownedFlags&&ownedFlags[id]);});return arr;
    }
    function offerPrice(def, rarity, repeat) {
        var depthScale=1+Math.floor(wave/10)*.08;var base=def.price||30,coreDiscount=player&&player.cores.glyph ? .88 : 1;return Math.max(1,Math.round((base+(repeat||0)*7)*depthScale*.8*coreDiscount/2)*2);
    }
    function makeOffer(group, id, rarity) {
        var def=group==='weapon'?WEAPON_DEFS[id]:group==='stat'?STAT_DEFS[id]:group==='active'?ACTIVE_DEFS[id]:group==='passive'?PASSIVE_DEFS[id]:PACT_DEFS[id];
        var ownedLevel=0,owned=false,kind='';
        if(group==='weapon'){var w=player.getWeapon(id);owned=!!w;ownedLevel=w?w.level:0;kind=def.category+' WEAPON';}
        else if(group==='active'){owned=!!player.activeSkills[id];ownedLevel=owned?player.activeSkills[id]:0;kind='ACTIVE SKILL';}
        else if(group==='passive'){owned=!!player.passives[id];kind='PASSIVE SKILL';}
        else if(group==='pact'){owned=!!player.pacts[id];kind='RISK / REWARD PACT';}
        else {ownedLevel=player.statBuys[id]||0;kind='STAT UPGRADE';}
        var price=offerPrice(def,rarity,ownedLevel);if(group==='weapon'&&owned)price=Math.round(price*.72+ownedLevel*9);if((group==='passive'||group==='pact')&&owned)price=0;
        return{group:group,id:id,rarity:rarity,name:def.name,icon:def.icon,desc:def.desc,kind:kind,price:price,owned:owned,level:ownedLevel,bought:false};
    }
    function recipeForFocus(){for(var i=0;i<CRAFT_RECIPES.length;i++)if(CRAFT_RECIPES[i].id===focusedRecipeId)return CRAFT_RECIPES[i];return CRAFT_RECIPES[0];}
    function weaponOfferWeight(id){var w=WEAPON_DEFS[id],classDef=CLASS_DEFS[player.classId]||CLASS_DEFS.independent,weight=classDef.shop[w.category]||1,recipe=recipeForFocus();if(recipe&&recipe.parts.indexOf(id)>=0)weight*=1.75;if(w.family&&recipe&&WEAPON_DEFS[recipe.result]&&w.family===WEAPON_DEFS[recipe.result].family)weight*=1.25;return weight;}
    function pickWeaponOffer(used,ownedWeapons){var rarity=rollRarity(),ids=candidatesByRarity(WEAPON_DEFS,rarity,ownedWeapons).filter(function(id){var w=WEAPON_DEFS[id];return w.rarity!=='legendary'&&w.rarity!=='mythical'&&!used['weapon:'+id];});if(!ids.length)ids=Object.keys(WEAPON_DEFS).filter(function(id){var w=WEAPON_DEFS[id];return w.rarity!=='legendary'&&w.rarity!=='mythical'&&!ownedWeapons[id]&&!used['weapon:'+id];});var id=weightedPick(ids,weaponOfferWeight);return id?makeOffer('weapon',id,WEAPON_DEFS[id].rarity):null;}
    function pickSupportOffer(used){var attempts=0;while(attempts++<80){var r=rollRarity(),roll=Math.random(),group=roll<.24?'stat':roll<.69?'passive':roll<.93?'active':'pact',source=group==='stat'?STAT_DEFS:group==='passive'?PASSIVE_DEFS:group==='active'?ACTIVE_DEFS:PACT_DEFS,flags=group==='passive'?player.passives:group==='pact'?player.pacts:null,ids=candidatesByRarity(source,r,flags),id=pick(ids),key=group+':'+id;if(!id||used[key])continue;return makeOffer(group,id,source[id].rarity);}return makeOffer('stat',pick(Object.keys(STAT_DEFS)),'common');}
    function generateShop() {
        shopOffers=[];var used={},ownedWeapons={};player.inventory.forEach(function(w){ownedWeapons[w.id]=true;});
        for(var wi=0;wi<4;wi++){var weaponOffer=pickWeaponOffer(used,ownedWeapons);if(weaponOffer){used['weapon:'+weaponOffer.id]=true;shopOffers.push(weaponOffer);}}
        while(shopOffers.length<4){var fallbackWeapon=pickWeaponOffer(used,ownedWeapons);if(!fallbackWeapon)break;used['weapon:'+fallbackWeapon.id]=true;shopOffers.push(fallbackWeapon);}
        for(var si=0;si<4;si++){var support=pickSupportOffer(used),supportKey=support.group+':'+support.id;used[supportKey]=true;shopOffers.push(support);}
        renderShop();
    }
    function shopOfferBlocked(o) { return !o||o.bought||coins<o.price||o.owned&&(o.group==='passive'||o.group==='pact'); }
    function shopActionLabel(o) {
        if(!o)return tr('APPROACH AN ITEM');if(o.bought)return tr('SOLD');if(o.owned&&(o.group==='passive'||o.group==='pact'))return tr('OWNED');
        if(coins<o.price)return tr('NEED '+o.price+' COINS');if(o.owned&&(o.group==='weapon'||o.group==='active'))return tr('UPGRADE '+o.price);return tr('BUY '+o.price);
    }
    function wrapCanvasText(text,maxWidth) {
        var words=String(text).split(' '),lines=[],line='';for(var i=0;i<words.length;i++){var test=line?line+' '+words[i]:words[i],metric=ctx.measureText(test),width=metric&&metric.width||test.length*6;if(width>maxWidth&&line){lines.push(line);line=words[i];}else line=test;}if(line)lines.push(line);return lines;
    }
    function drawSupportRelic(o) {
        var c=rarityColor(o.rarity),pulse=(Math.sin(visualTick*.08)+1)/2,art=SUPPORT_ART[o.id]||{model:'relic'},m=art.model;ctx.save();ctx.shadowBlur=14+pulse*9;ctx.shadowColor=c;ctx.strokeStyle=c;ctx.fillStyle='#23212a';ctx.lineWidth=3;ctx.lineJoin='round';ctx.lineCap='round';
        if(m==='heart'){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,24);ctx.bezierCurveTo(-38,2,-25,-25,0,-10);ctx.bezierCurveTo(25,-25,38,2,0,24);ctx.fill();ctx.stroke();}
        else if(m==='fist'||m==='glove'){ctx.fillStyle=m==='fist'?'#76503c':'#485d6a';ctx.fillRect(-17,-8,34,30);ctx.strokeRect(-17,-8,34,30);for(var gf=0;gf<4;gf++){ctx.fillRect(-20+gf*11,-22,9,19);ctx.strokeRect(-20+gf*11,-22,9,19);}if(m==='glove'){ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(-14,5);ctx.lineTo(14,5);ctx.stroke();}}
        else if(m==='boot'||m==='spurs'){ctx.fillStyle='#61472f';ctx.beginPath();ctx.moveTo(-12,-24);ctx.lineTo(10,-24);ctx.lineTo(12,7);ctx.lineTo(31,15);ctx.lineTo(27,27);ctx.lineTo(-8,23);ctx.closePath();ctx.fill();ctx.stroke();if(m==='spurs'){ctx.beginPath();for(var sp=0;sp<7;sp++){ctx.rotate(TAU/7);ctx.moveTo(34,0);ctx.lineTo(45,0);}ctx.stroke();}}
        else if(m==='lens'||m==='compass'){ctx.fillStyle='#182a34';ctx.beginPath();ctx.arc(0,0,23,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#dff8ff';ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(-5,-5,8,0,TAU);ctx.fill();ctx.globalAlpha=1;if(m==='compass'){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(7,8);ctx.lineTo(0,16);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();}else{ctx.fillStyle='#463322';ctx.fillRect(18,15,25,7);ctx.strokeRect(18,15,25,7);}}
        else if(m==='plate'||m==='shield'){ctx.fillStyle='#4a5660';ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(25,-17);ctx.lineTo(21,11);ctx.quadraticCurveTo(0,31,-21,11);ctx.lineTo(-25,-17);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#e8f3f7';ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(0,19);ctx.moveTo(-15,-8);ctx.lineTo(15,-8);ctx.stroke();}
        else if(m==='dice'){ctx.rotate(.35);ctx.fillStyle='#eee9d7';ctx.fillRect(-22,-22,44,44);ctx.strokeRect(-22,-22,44,44);ctx.fillStyle=c;for(var di=-1;di<=1;di+=2){ctx.beginPath();ctx.arc(di*10,di*10,4,0,TAU);ctx.arc(di*10,-di*10,4,0,TAU);ctx.fill();}}
        else if(m==='magnet'){ctx.lineWidth=11;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-22,0);ctx.lineTo(-22,18);ctx.moveTo(22,0);ctx.lineTo(22,18);ctx.stroke();}
        else if(m==='well'||m==='chalice'||m==='vial'||m==='flask'||m==='crucible'){ctx.fillStyle='#3d2f43';ctx.beginPath();ctx.moveTo(-17,-22);ctx.lineTo(17,-22);ctx.lineTo(12,18);ctx.quadraticCurveTo(0,29,-12,18);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=c;ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(-12,3);ctx.quadraticCurveTo(0,-5,12,3);ctx.lineTo(10,16);ctx.quadraticCurveTo(0,24,-10,16);ctx.closePath();ctx.fill();ctx.globalAlpha=1;if(m==='chalice'){ctx.fillStyle='#5b4427';ctx.fillRect(-3,23,6,13);ctx.fillRect(-14,34,28,5);}if(m==='crucible'){for(var fl=0;fl<3;fl++){ctx.fillStyle=fl===0?'#ff6b35':fl===1?'#74b9ff':'#b6e86b';ctx.beginPath();ctx.arc(-10+fl*10,-28,4,0,TAU);ctx.fill();}}}
        else if(m==='coil'||m==='capacitor'||m==='relay'){ctx.fillStyle='#26313a';ctx.fillRect(-19,-24,38,48);ctx.strokeRect(-19,-24,38,48);ctx.strokeStyle='#e8fbff';for(var co=-14;co<=14;co+=7){ctx.beginPath();ctx.moveTo(-14,co);ctx.lineTo(14,-co);ctx.stroke();}if(m==='capacitor'){ctx.fillStyle=c;ctx.fillRect(-28,-11,7,22);ctx.fillRect(21,-11,7,22);}if(m==='relay'){ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.stroke();}}
        else if(m==='mask'){ctx.fillStyle='#38313e';ctx.beginPath();ctx.moveTo(-24,-20);ctx.lineTo(24,-20);ctx.lineTo(17,20);ctx.lineTo(0,28);ctx.lineTo(-17,20);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-17,-5);ctx.lineTo(-4,-1);ctx.lineTo(-16,5);ctx.closePath();ctx.moveTo(17,-5);ctx.lineTo(4,-1);ctx.lineTo(16,5);ctx.closePath();ctx.fill();}
        else if(m==='globe'||m==='orb'||m==='ward'){ctx.fillStyle='rgba(225,247,255,.24)';ctx.beginPath();ctx.arc(0,-3,25,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,-3,m==='orb'?12:7,0,TAU);ctx.fill();ctx.fillStyle='#60472f';ctx.fillRect(-18,24,36,6);if(m==='ward'){ctx.rotate(visualTick*.03);for(var wd=0;wd<4;wd++){ctx.rotate(TAU/4);ctx.strokeRect(29,-3,7,6);}}}
        else if(m==='totem'){ctx.fillStyle='#493b31';ctx.fillRect(-12,-28,24,55);ctx.strokeRect(-12,-28,24,55);ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-24,-20);ctx.lineTo(0,-35);ctx.lineTo(24,-20);ctx.lineTo(0,-8);ctx.closePath();ctx.fill();ctx.stroke();}
        else if(m==='portal'||m==='halo'){ctx.rotate(visualTick*.025);ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(0,0,m==='portal'?29:33,m==='portal'?18:10,0,0,TAU);ctx.stroke();ctx.lineWidth=2;for(var pr=0;pr<6;pr++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(38,0);ctx.stroke();}}
        else if(m==='clock'){ctx.fillStyle='#4f4938';ctx.beginPath();ctx.arc(0,0,25,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#fff4be';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(visualTick*.03)*17,Math.sin(visualTick*.03)*17);ctx.moveTo(0,0);ctx.lineTo(Math.cos(-visualTick*.018)*11,Math.sin(-visualTick*.018)*11);ctx.stroke();}
        else if(m==='prism'||m==='oath'){ctx.fillStyle=m==='oath'?'#dbe9ef':c;ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(25,18);ctx.lineTo(0,30);ctx.lineTo(-25,18);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(0,30);ctx.moveTo(-25,18);ctx.lineTo(13,-5);ctx.stroke();}
        else if(m==='sigil'){ctx.rotate(visualTick*.018);for(var sg=0;sg<7;sg++){ctx.rotate(TAU/7);ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(31,-6);ctx.lineTo(23,7);ctx.closePath();ctx.fill();ctx.stroke();}ctx.fillStyle='#fff4c4';ctx.beginPath();ctx.arc(0,0,8,0,TAU);ctx.fill();}
        else if(m==='medal'||m==='crown'){ctx.fillStyle='#6d5130';ctx.beginPath();ctx.moveTo(-20,-28);ctx.lineTo(-5,3);ctx.lineTo(0,-8);ctx.lineTo(5,3);ctx.lineTo(20,-28);ctx.lineTo(12,10);ctx.lineTo(-12,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=c;ctx.beginPath();ctx.arc(0,20,14,0,TAU);ctx.fill();ctx.stroke();}
        else if(m==='satchel'||m==='jacket'||m==='harness'||m==='bandolier'){ctx.fillStyle='#5b4532';ctx.fillRect(-24,-20,48,43);ctx.strokeRect(-24,-20,48,43);ctx.strokeStyle=c;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-20,-25);ctx.lineTo(20,25);if(m==='harness'||m==='jacket'){ctx.moveTo(20,-25);ctx.lineTo(-20,25);}ctx.stroke();if(m==='bandolier')for(var ba=-14;ba<=14;ba+=9){ctx.fillStyle='#d7b56e';ctx.fillRect(ba,-5,5,17);}}
        else if(m==='scroll'||m==='tablet'||m==='ledger'){ctx.fillStyle=m==='ledger'?'#6b2637':'#d7c69b';ctx.fillRect(-24,-28,48,56);ctx.strokeRect(-24,-28,48,56);ctx.strokeStyle=m==='ledger'?'#ff9aad':'#725e38';for(var ln=-16;ln<=16;ln+=8){ctx.beginPath();ctx.moveTo(-15,ln);ctx.lineTo(15,ln);ctx.stroke();}}
        else if(m==='blades'||m==='sling'){ctx.rotate(-.55);ctx.fillStyle='#dce7ea';ctx.beginPath();ctx.moveTo(-3,-35);ctx.lineTo(8,17);ctx.lineTo(0,34);ctx.lineTo(-8,17);ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(1.1);ctx.beginPath();ctx.moveTo(-3,-35);ctx.lineTo(8,17);ctx.lineTo(0,34);ctx.lineTo(-8,17);ctx.closePath();ctx.fill();ctx.stroke();}
        else if(m==='foundry'){ctx.fillStyle='#555b5c';ctx.beginPath();ctx.moveTo(-30,-18);ctx.lineTo(24,-18);ctx.lineTo(35,-5);ctx.lineTo(10,5);ctx.lineTo(16,27);ctx.lineTo(-18,27);ctx.lineTo(-10,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#f1c40f';ctx.beginPath();ctx.arc(0,-7,8,0,TAU);ctx.fill();}
        else if(m==='wing'){for(var wi=-1;wi<=1;wi+=2){ctx.save();ctx.scale(wi,1);ctx.fillStyle=c;for(var wf=0;wf<4;wf++){ctx.beginPath();ctx.ellipse(12+wf*7,-10+wf*8,18,5,.5,0,TAU);ctx.fill();ctx.stroke();}ctx.restore();}}
        else{ctx.fillStyle='#323039';ctx.beginPath();ctx.arc(0,0,24,0,TAU);ctx.fill();ctx.stroke();}
        ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='11px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(o.icon||'✦',0,2);ctx.restore();
    }
    function drawSalesPlatform(o,index) {
        var p=shopPlatforms[index],c=rarityColor(o.rarity),near=index===nearbyShopIndex,bob=Math.sin(visualTick*.055+index)*4;ctx.save();ctx.translate(p.x,p.y);ctx.scale(1.14,1.14);
        ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(0,34,72,20,0,0,TAU);ctx.fill();
        ctx.fillStyle=near?'#5f5130':'#3d3b39';ctx.strokeStyle=near?'#ffe38a':'#8d7b4d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-66,-4);ctx.lineTo(66,-4);ctx.lineTo(54,34);ctx.lineTo(-54,34);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#24292a';ctx.fillRect(-53,2,106,25);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.strokeRect(-51,4,102,20);
        if(o.bought){ctx.fillStyle='#141414';ctx.globalAlpha=.7;ctx.fillRect(-51,4,102,20);ctx.globalAlpha=1;ctx.fillStyle='#888';ctx.font='9px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';ctx.fillText(tr('SOLD'),0,18);}
        else{ctx.save();ctx.translate(0,-36+bob);if(o.group==='weapon'){ctx.scale(1.25,1.25);ctx.translate(-25,0);drawHeldWeapon(weaponCopy(o.id),true);}else drawSupportRelic(o);ctx.restore();}
        if(near){
            var readableScale=1/currentZoom;ctx.save();ctx.translate(0,-116);ctx.textAlign='center';ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.98)';ctx.lineWidth=4*readableScale;ctx.fillStyle=c;ctx.font=(15*readableScale)+'px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.strokeText(o.name,0,-34);ctx.fillText(o.name,0,-34);ctx.fillStyle='#f1c40f';ctx.font=(11*readableScale)+'px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.strokeText(shopActionLabel(o),0,-12);ctx.fillText(shopActionLabel(o),0,-12);ctx.fillStyle='#fff';ctx.font=(9*readableScale)+'px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';var lines=wrapCanvasText(o.desc,340*readableScale);for(var li=0;li<Math.min(3,lines.length);li++){ctx.strokeText(lines[li],0,10+li*16*readableScale);ctx.fillText(lines[li],0,10+li*16*readableScale);}ctx.restore();
        }
        ctx.restore();
    }
    function getForgeCost(w){
        if(!w)return 0;var base={common:10,uncommon:15,rare:22,epic:31,legendary:42,mythical:54}[w.rarity]||10;return Math.max(6,Math.round((base+(w.level-1)*(6+base*.12))*(1+Math.floor(wave/15)*.05)));
    }
    function forgeActionLabel(){var w=player&&player.weapon;if(!w)return'NO WEAPON';if(w.level>=8)return'MAX LEVEL';var cost=getForgeCost(w);return coins<cost?'NEED '+cost+' COINS':'CALIBRATE '+cost;}
    function forgeEquippedWeapon(){
        if(!shopMode||!nearbyForge||!player||!player.weapon)return false;var w=player.weapon,cost=getForgeCost(w);if(w.level>=8){showToast('MAX LEVEL · LV 8',w.color);playSound('ui.error');return false;}if(coins<cost){showToast('NEED '+cost+' COINS','#e5ff3d');playSound('ui.error');return false;}if(player.passives.coinFoundry)player.coinFoundryCharge=Math.max(player.coinFoundryCharge,coins);coins-=cost;w.level++;shopForgePurchases++;playSound('forge.success',{x:shopForge.x,y:shopForge.y});addRing(shopForge.x,shopForge.y,'#e5ff3d',105,7);addRing(player.x,player.y,w.color,58,4);addParticles(shopForge.x,shopForge.y,w.color,18,5);showToast(w.name+' · CALIBRATED TO LV '+w.level,w.color);updateHUD();updateWeaponHUD();renderShop();if(networkRole==='guest'&&window.DKNet)window.DKNet.sendToHost({type:'build_update',build:serializeBuild(player)});return true;
    }
    function drawWeaponForge(){
        if(!player||!player.weapon)return;
        var w=player.weapon,cost=getForgeCost(w),near=nearbyForge,p=(Math.sin(visualTick*.075)+1)*.5,accent=near?'#e5ff3d':'#60676d';
        ctx.save();ctx.translate(shopForge.x,shopForge.y);
        ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(0,38,88,20,0,0,TAU);ctx.fill();
        ctx.fillStyle='#080a0d';ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.fillRect(-78,-2,156,46);ctx.strokeRect(-78,-2,156,46);
        ctx.fillStyle='#15191d';ctx.fillRect(-66,8,132,25);ctx.strokeStyle='#31373d';ctx.strokeRect(-66,8,132,25);
        ctx.fillStyle=accent;ctx.fillRect(-66,36,26,3);ctx.fillRect(40,36,26,3);
        ctx.fillStyle='#050607';ctx.fillRect(-65,44,14,25);ctx.fillRect(51,44,14,25);
        ctx.strokeStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(-46,20);ctx.lineTo(46,20);ctx.stroke();
        ctx.fillStyle=w.color;ctx.globalAlpha=.42+.22*p;ctx.fillRect(-33,12,66,3);ctx.globalAlpha=1;
        ctx.save();ctx.translate(-26,-31-p*4);ctx.scale(1.18,1.18);drawHeldWeapon(w,true);ctx.restore();
        if(near){var s=1/currentZoom;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=4*s;ctx.strokeStyle='#000';ctx.font=(14*s)+'px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.fillStyle=w.color;ctx.strokeText('WEAPON CALIBRATOR',0,-92);ctx.fillText('WEAPON CALIBRATOR',0,-92);ctx.font=(9*s)+'px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.fillStyle='#fff';var line=w.level>=8?'MAXIMUM LEVEL':'UPGRADE '+w.name+' TO LV '+(w.level+1);ctx.strokeText(line,0,-70);ctx.fillText(line,0,-70);ctx.fillStyle='#e5ff3d';ctx.strokeText(w.level>=8?'NO COST':cost+' COINS · FIRE / E',0,-53);ctx.fillText(w.level>=8?'NO COST':cost+' COINS · FIRE / E',0,-53);}
        ctx.restore();
    }
    function currentCraftRecipe(){return CRAFT_RECIPES[clamp(craftRecipeIndex,0,CRAFT_RECIPES.length-1)];}
    function recipeMissing(recipe){var missing=[];for(var i=0;i<recipe.parts.length;i++)if(!player.hasWeapon(recipe.parts[i]))missing.push(recipe.parts[i]);return missing;}
    function recipeMissingResources(recipe){var bag=resourcesFor(player),missing=[];Object.keys(recipe.resources||{}).forEach(function(id){var need=recipe.resources[id]||0,have=bag[id]||0;if(have<need)missing.push({id:id,need:need,have:have});});return missing;}
    function canCraftRecipe(recipe){return recipe&&!player.hasWeapon(recipe.result)&&coins>=recipe.coins&&recipeMissing(recipe).length===0&&recipeMissingResources(recipe).length===0;}
    function craftActionLabel(){var recipe=currentCraftRecipe(),result=WEAPON_DEFS[recipe.result],missing=recipeMissing(recipe),missingResources=recipeMissingResources(recipe);if(player.hasWeapon(recipe.result))return'CRAFTED';if(missing.length)return'MISSING '+WEAPON_DEFS[missing[0]].name;if(missingResources.length)return'NEED '+(missingResources[0].need-missingResources[0].have)+' '+RESOURCE_DEFS[missingResources[0].id].short;if(coins<recipe.coins)return'NEED '+recipe.coins+' COINS';return'CRAFT '+result.name;}
    function renderWeaponPreview(canvasNode,w,large){if(!canvasNode||!w||!canvasNode.getContext)return false;var preview=canvasNode.getContext('2d');if(!preview)return false;var oldCtx=ctx,width=canvasNode.width||240,height=canvasNode.height||90,scale=large?2.15:1.32;try{ctx=preview;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(width*.5-31*scale,height*.5);ctx.scale(scale,scale);drawHeldWeapon(w,true);ctx.restore();ctx.strokeStyle='rgba(255,255,255,.18)';ctx.globalAlpha=1;ctx.lineWidth=1;ctx.strokeRect(.5,.5,width-1,height-1);}finally{ctx=oldCtx;}return true;}
    function renderCraftingUI(){
        if(!player)return;var recipe=currentCraftRecipe(),result=WEAPON_DEFS[recipe.result],tierColor=rarityColor(recipe.tier),bag=resourcesFor(player);
        el('craft-wallet').textContent='COINS '+coins;el('craft-resource-wallet').textContent='YOUR MATERIALS\n'+resourceSummary(player,false);el('craft-result-tier').textContent=recipe.tier.toUpperCase()+' RECIPE · '+(craftRecipeIndex+1)+'/'+CRAFT_RECIPES.length;el('craft-result-tier').style.color=tierColor;el('craft-result-name').textContent=result.name;el('craft-result-name').style.color=result.color;el('craft-result-desc').textContent=result.desc;renderWeaponPreview(el('craft-result-model'),weaponCopy(recipe.result),true);
        var recipeList=el('craft-recipe-list');recipeList.textContent='';CRAFT_RECIPES.forEach(function(entry,index){var weapon=WEAPON_DEFS[entry.result],button=document.createElement('button');button.className='craft-recipe-entry'+(index===craftRecipeIndex?' selected':'')+(canCraftRecipe(entry)?' ready':'');button.style.color=rarityColor(entry.tier);var icon=document.createElement('i'),copy=document.createElement('span'),name=document.createElement('strong');icon.textContent=weapon.icon;name.textContent=weapon.name;copy.appendChild(name);copy.appendChild(document.createTextNode(entry.tier.toUpperCase()+' · '+entry.coins+' COINS'));button.appendChild(icon);button.appendChild(copy);button.addEventListener('click',function(){craftRecipeIndex=index;focusedRecipeId=entry.id;renderShop();renderCraftingUI();});recipeList.appendChild(button);});
        for(var i=0;i<3;i++){var row=el('craft-part-'+i),copy=el('craft-part-copy-'+i),model=el('craft-part-model-'+i);if(i>=recipe.parts.length){row.style.display='none';continue;}row.style.display='grid';var id=recipe.parts[i],part=WEAPON_DEFS[id],owned=player.hasWeapon(id);copy.textContent=(owned?'OWNED · ':'MISSING · ')+part.name+'\n'+part.rarity.toUpperCase()+' · '+part.category;copy.style.color=owned?'#bdf7ce':'#ff9b9b';row.style.borderColor=owned?part.color:'#713333';renderWeaponPreview(model,weaponCopy(id),false);}
        var resourceList=el('craft-resource-list');resourceList.textContent='';Object.keys(recipe.resources||{}).forEach(function(id){var def=RESOURCE_DEFS[id],need=recipe.resources[id],have=bag[id]||0,row=document.createElement('div');row.className='craft-resource-row'+(have>=need?' ready':'');row.style.borderColor=have>=need?def.color:'#713333';var strong=document.createElement('strong');strong.textContent=def.icon+' '+def.short;strong.style.color=def.color;row.appendChild(strong);row.appendChild(document.createTextNode(have+' / '+need));resourceList.appendChild(row);});
        el('craft-note').textContent=recipe.note+' · COST '+recipe.coins+' COINS';var confirm=el('craft-confirm-btn');confirm.textContent=craftActionLabel();confirm.disabled=!canCraftRecipe(recipe);el('craft-ui-prev').textContent='◀ '+(craftRecipeIndex===0?CRAFT_RECIPES.length:craftRecipeIndex);el('craft-ui-next').textContent=(craftRecipeIndex+2>CRAFT_RECIPES.length?1:craftRecipeIndex+2)+' ▶';
    }
    function openCraftingUI(){if(!shopMode||!nearbyCraft)return false;playSound('ui.open');craftingOpen=true;mouse.down=false;buttons.fire=false;keys.e=false;buttons.ability=false;renderCraftingUI();el('crafting-screen').style.display='flex';return true;}
    function resetSimulationClock(){simulationClock.reset(performance.now());}
    function closeCraftingUI(){if(!craftingOpen)return;playSound('ui.close');craftingOpen=false;el('crafting-screen').style.display='none';shopInteractLock=true;mouse.down=false;buttons.fire=false;resetSimulationClock();}
    function cycleCraftRecipe(delta){if(!shopMode)return;craftRecipeIndex=(craftRecipeIndex+delta+CRAFT_RECIPES.length)%CRAFT_RECIPES.length;focusedRecipeId=currentCraftRecipe().id;renderShop();if(craftingOpen)renderCraftingUI();showToast('FOCUS · '+WEAPON_DEFS[currentCraftRecipe().result].name,rarityColor(currentCraftRecipe().tier));}
    function craftCurrentRecipe(){if(!shopMode||(!nearbyCraft&&!craftingOpen))return false;var recipe=currentCraftRecipe(),result=WEAPON_DEFS[recipe.result],missing=recipeMissing(recipe),missingResources=recipeMissingResources(recipe);if(player.hasWeapon(recipe.result)){showToast('ALREADY CRAFTED',result.color);playSound('ui.error');return false;}if(missing.length){showToast('MISSING · '+WEAPON_DEFS[missing[0]].name,rarityColor(WEAPON_DEFS[missing[0]].rarity));playSound('ui.error');return false;}if(missingResources.length){var needed=missingResources[0],def=RESOURCE_DEFS[needed.id];showToast('NEED '+(needed.need-needed.have)+' '+def.short,def.color);playSound('ui.error');return false;}if(coins<recipe.coins){showToast('NEED '+recipe.coins+' COINS','#f1c40f');playSound('ui.error');return false;}if(player.passives.coinFoundry)player.coinFoundryCharge=Math.max(player.coinFoundryCharge,coins);coins-=recipe.coins;for(var i=0;i<recipe.parts.length;i++){var partId=recipe.parts[i],index=player.inventory.findIndex(function(w){return w.id===partId;});if(index>=0)player.inventory.splice(index,1);}Object.keys(recipe.resources||{}).forEach(function(id){addResource(player,id,-recipe.resources[id]);});var crafted=weaponCopy(recipe.result);player.inventory.push(crafted);player.weaponIndex=player.inventory.length-1;player.weapon=crafted;shopCrafts++;playSound('craft.success',{x:shopCraft.x,y:shopCraft.y});addRing(shopCraft.x,shopCraft.y,result.color,190,12);addRing(player.x,player.y,result.color,100,7);addParticles(shopCraft.x,shopCraft.y,result.color,30,7);showToast(result.name+' · CRAFTED',result.color);updateHUD();updateWeaponHUD();renderShop();if(craftingOpen)renderCraftingUI();if(networkRole==='guest'&&window.DKNet)window.DKNet.sendToHost({type:'build_update',build:serializeBuild(player)});return true;}
    function drawCraftAltar(){
        var recipe=currentCraftRecipe(),w=WEAPON_DEFS[recipe.result],near=nearbyCraft,p=(Math.sin(visualTick*.06)+1)*.5,missing=recipeMissing(recipe),accent=missing.length?'#ff675c':rarityColor(recipe.tier);
        ctx.save();ctx.translate(shopCraft.x,shopCraft.y);
        ctx.fillStyle='rgba(0,0,0,.44)';ctx.beginPath();ctx.ellipse(0,40,104,24,0,0,TAU);ctx.fill();
        ctx.fillStyle='#07090b';ctx.strokeStyle=near?'#e5ff3d':'#3b4147';ctx.lineWidth=2;ctx.fillRect(-94,-2,188,48);ctx.strokeRect(-94,-2,188,48);
        ctx.fillStyle='#11151a';ctx.fillRect(-82,7,164,29);ctx.strokeStyle='rgba(255,255,255,.14)';ctx.strokeRect(-82,7,164,29);
        for(var module=0;module<3;module++){var mx=-68+module*68;ctx.fillStyle=module<recipe.parts.length&&!missing.includes(recipe.parts[module])?'#79d5ff':'#343a40';ctx.fillRect(mx,15,28,3);ctx.strokeStyle='#2a3036';ctx.strokeRect(mx-5,11,38,15);}
        ctx.fillStyle=accent;ctx.globalAlpha=.35+.3*p;ctx.fillRect(-28,32,56,2);ctx.globalAlpha=1;
        ctx.fillStyle='#050607';ctx.fillRect(-78,46,15,27);ctx.fillRect(63,46,15,27);
        ctx.save();ctx.translate(-24,-30-p*4);ctx.scale(1.12,1.12);drawHeldWeapon(w,true);ctx.restore();
        ctx.fillStyle=accent;ctx.font='8px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';ctx.fillText(recipe.tier.toUpperCase()+' BLUEPRINT',0,31);
        if(near){var s=1/currentZoom;ctx.lineJoin='round';ctx.strokeStyle='#000';ctx.lineWidth=4*s;ctx.font=(13*s)+'px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.fillStyle=w.color;ctx.strokeText('ITEM FABRICATOR',0,-112);ctx.fillText('ITEM FABRICATOR',0,-112);ctx.font=(8*s)+'px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.fillStyle='#fff';ctx.strokeText('INSPECT MODEL, PARTS & BLUEPRINT',0,-86);ctx.fillText('INSPECT MODEL, PARTS & BLUEPRINT',0,-86);ctx.fillStyle='#e5ff3d';ctx.strokeText('FIRE / E · OPEN',0,-62);ctx.fillText('FIRE / E · OPEN',0,-62);}
        ctx.restore();
    }
    function drawShopRoom() {
        ctx.save();ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);ctx.fillStyle=currentBiome.floor;ctx.fillRect(0,0,viewportWidth,viewportHeight);ctx.scale(currentZoom,currentZoom);ctx.translate(-camera.x,-camera.y);drawFloor();drawWorldList(roomDecor,70);drawWorldList(hazards,90);drawWorldList(biomeProps,55);drawWorldList(obstacles,55);for(var i=0;i<shopOffers.length;i++)drawSalesPlatform(shopOffers[i],i);drawWeaponForge();drawCraftAltar();drawWorldList(bullets,28);drawWorldList(radiantWeapons,120);drawWorldList(enemies,35);drawPartyPlayers();drawWorldList(slashes,260);drawParticleList();drawEffects();ctx.restore();
    }
    function updateShopRoom(step,now,deltaMs) {
        if(player&&player.armoryReady&&networkRole==='guest'){applyPredictionCorrection(step);Object.keys(remotePlayers).forEach(function(id){advanceNetworkEntity(remotePlayers[id],step,.17);});enemies.forEach(function(e){advanceNetworkEntity(e,step,.2);});bullets.forEach(function(b){advanceNetworkEntity(b,step,.24);});hazards.forEach(function(field){advanceNetworkEntity(field,step,.2);});radiantWeapons.forEach(function(r){advanceNetworkEntity(r,step,.24);});advanceGuestTransientVisuals(step);return;}
        if(player&&player.armoryReady&&networkRole==='host'){prepareRemoteOwnedMovement(step);updateRemoteParty(step,now,true);processPendingShots(step);updateBullets(step);hazards.forEach(function(h){if(!h.dead&&h.update)h.update(step);});radiantWeapons.forEach(function(r){r.update(step);});totems.forEach(function(t){t.update(step);});particles.forEach(function(p){p.update(step);});updateEffects(step);rebuildEnemyGrid();handleCollisions();captureRemoteOwnerOffsets();cleanArrays();netSnapshotClock+=step;if(netSnapshotClock>=NET_SNAPSHOT_FRAMES){netSnapshotClock%=NET_SNAPSHOT_FRAMES;sendNetworkSnapshot(false);}return;}
        var dx=0,dy=0;if(keys.w)dy-=1;if(keys.s)dy+=1;if(keys.a)dx-=1;if(keys.d)dx+=1;if(joystick.active){dx=joystick.x;dy=joystick.y;}if(dx||dy){var len=Math.hypot(dx,dy)||1,m=player.baseSpeed*(1+player.stats.speed);player.x+=dx/len*m*step;player.y+=dy/len*m*step;player.angle=Math.atan2(dy,dx);}player.x=clamp(player.x,shopCenter.x-820,shopCenter.x+820);player.y=clamp(player.y,shopCenter.y-440,shopCenter.y+660);
        if(!joystick.active&&!isTouchDevice()){var worldMouseX=mouse.x/currentZoom+camera.x,worldMouseY=mouse.y/currentZoom+camera.y;player.angle=Math.atan2(worldMouseY-player.y,worldMouseX-player.x);}
        if(keys.q||buttons.switch){if(!player.switchLock){player.switchWeapon();player.switchLock=true;}}else player.switchLock=false;
        nearbyForge=Math.hypot(player.x-shopForge.x,player.y-shopForge.y)<146;nearbyCraft=Math.hypot(player.x-shopCraft.x,player.y-shopCraft.y)<154;nearbyShopIndex=-1;var nearestD=148;if(!nearbyForge&&!nearbyCraft)for(var i=0;i<shopPlatforms.length;i++){var d=Math.hypot(player.x-shopPlatforms[i].x,player.y-shopPlatforms[i].y);if(d<nearestD){nearestD=d;nearbyShopIndex=i;}}
        var nearby=shopOffers[nearbyShopIndex],buyBtn=el('shop-buy-btn');if(nearbyCraft){buyBtn.style.display='block';buyBtn.textContent='OPEN FABRICATOR';buyBtn.disabled=false;}else if(nearbyForge){buyBtn.style.display='block';buyBtn.textContent=forgeActionLabel();buyBtn.disabled=player.weapon.level>=8||coins<getForgeCost(player.weapon);}else if(nearby){buyBtn.style.display='block';buyBtn.textContent=shopActionLabel(nearby);buyBtn.disabled=shopOfferBlocked(nearby);}else buyBtn.style.display='none';
        var contextNearby=nearbyCraft||nearbyForge||nearbyShopIndex>=0,interacting=keys.e||buttons.ability||mouse.down||buttons.fire;if(contextNearby&&interacting&&!shopInteractLock){if(nearbyCraft)openCraftingUI();else if(nearbyForge)forgeEquippedWeapon();else if(nearbyShopIndex>=0)buyOffer(nearbyShopIndex);}shopInteractLock=contextNearby&&interacting;
        var activeIds=Object.keys(player.activeCooldowns);for(var ai=0;ai<activeIds.length;ai++)player.activeCooldowns[activeIds[ai]]=Math.max(0,(player.activeCooldowns[activeIds[ai]]||0)-step);player.activeCooldown=player.active?(player.activeCooldowns[player.active]||0):0;if(player.attackAnim>0)player.attackAnim=Math.max(0,player.attackAnim-step);if(player.overclock>0)player.overclock-=step;if(player.echoSealTimer>0)player.echoSealTimer-=step;if(player.bladeHaloTimer>0){player.bladeHaloTimer-=step;player.bladeHaloAngle+=.055*step;}
        var firing=(mouse.down||buttons.fire||(mobileAutoFireEnabled()&&!!closestEnemy(player.x,player.y,520)))&&!contextNearby;processWeaponFiring(player,firing,step,now);if(networkRole==='host'){prepareRemoteOwnedMovement(step);updateRemoteParty(step,now,true);captureRemoteOwnerOffsets();}else if(networkRole==='guest'){applyOwnedExternalCorrection(step);applyPredictionCorrection(step);Object.keys(remotePlayers).forEach(function(id){advanceNetworkEntity(remotePlayers[id],step,.17);});enemies.forEach(function(e){advanceNetworkEntity(e,step,.2);});pumpLocalInput(localInputState(),step);}
        processPendingShots(step);updateBullets(step);if(networkRole==='guest')hazards.forEach(function(field){advanceNetworkEntity(field,step,.2);});else hazards.forEach(function(h){if(!h.dead&&h.update)h.update(step);});radiantWeapons.forEach(function(r){r.update(step);});if(networkRole!=='guest')totems.forEach(function(t){t.update(step);});particles.forEach(function(p){p.update(step);});updateEffects(step);rebuildEnemyGrid();handleCollisions();updatePartyRevives(step);cleanArrays();rebuildEnemyGrid();targetZoom=cameraBaseZoom()*cameraZoomSetting;currentZoom+=(targetZoom-currentZoom)*frameBlend(.06,step);var targetX=player.x-viewportWidth/currentZoom/2,targetY=player.y-viewportHeight/currentZoom/2,cameraBlend=frameBlend(.09,step);camera.x+=(targetX-camera.x)*cameraBlend;camera.y+=(targetY-camera.y)*cameraBlend;
        if(networkRole==='host'){netSnapshotClock+=step;if(netSnapshotClock>=NET_SNAPSHOT_FRAMES){netSnapshotClock%=NET_SNAPSHOT_FRAMES;sendNetworkSnapshot(false);}}hudRefreshMs+=deltaMs||step*SIMULATION_STEP_MS;if(toastTimer>0){toastTimer-=step;if(toastTimer<=0)el('toast').classList.remove('show');}if(hudRefreshMs>=120){hudRefreshMs%=120;updateHUD();updateWeaponHUD();updatePartyHud();}
    }
    function openShop() {resetOwnerOffsets();
        playSound('shop.enter');
        if(networkRole!=='guest')collectAllPickups();else pickups=[];var memoryAward=networkRole==='guest'?'':completeBiomeMemory();gamePaused=false;shopMode=true;sceneMode='armory';setUiScene('armory');craftingOpen=false;el('crafting-screen').style.display='none';pauseReason='shop';shopVisits++;shopRerolls=0;shopForgePurchases=0;shopCrafts=0;nearbyShopIndex=-1;nearbyForge=false;nearbyCraft=false;shopInteractLock=false;armoryReady=Object.create(null);enemies=[];releaseAllTransient();radiantWeapons=[];player.resetRrharil();shopCenter.x=0;shopCenter.y=0;var offsets=[[-650,-260],[-340,-260],[-650,40],[-340,40],[340,-260],[650,-260],[340,40],[650,40]];for(var sp=0;sp<8;sp++){shopPlatforms[sp].x=offsets[sp][0];shopPlatforms[sp].y=offsets[sp][1];}shopForge.x=-430;shopForge.y=390;shopCraft.x=430;shopCraft.y=390;obstacles=[];roomDecor=[];hazards=[];biomeProps=[];currentLayout=null;var members=partyPlayers();for(var pm=0;pm<members.length;pm++){members[pm].x=(members[pm].slot-1.5)*78;members[pm].y=610;members[pm].armoryReady=false;members[pm].isDashing=false;members[pm].dashTime=0;members[pm].terrainSlow=1;}enemies=[new Enemy(0,70,'trainingDummy')];currentZoom=cameraBaseZoom()*cameraZoomSetting;camera={x:player.x-viewportWidth/currentZoom/2,y:player.y-viewportHeight/currentZoom/2};generateShop();netWorldRevision++;if(networkRole==='host'&&window.DKNet)window.DKNet.updateRoom('armory',{wave:wave});
        modEvent('armoryOpen',{wave:wave,player:player,biome:currentBiome,offers:shopOffers});
        el('shop-subtitle').textContent='PRIVATE STOCK · TEST BUILDS ON THE CENTER TARGET';el('continue-btn').textContent=networkRole==='guest'?'READY FOR HOST':'DESCEND TO WAVE '+(wave+1);el('continue-btn').disabled=false;el('craft-prev-btn').style.display='none';el('craft-next-btn').style.display='none';el('shop-room-ui').style.display='block';showToast(memoryAward?memoryAward+' REMEMBERED · ARMORY OPEN':'ARMORY OPEN · CENTER TARGET READY','#d65a4a');resetSimulationClock();updateCooldownHUD();if(networkRole==='host')sendNetworkSnapshot(true);
    }
    function renderShop() {
        el('shop-coin-display').textContent=coins;var rerollCost=getRerollCost();el('reroll-btn').textContent='REROLL '+rerollCost;el('reroll-btn').disabled=coins<rerollCost;var recipe=currentCraftRecipe();el('craft-prev-btn').textContent='◀ '+(craftRecipeIndex+1)+'/'+CRAFT_RECIPES.length;el('craft-next-btn').textContent=WEAPON_DEFS[recipe.result].name+' ▶';var o=shopOffers[nearbyShopIndex],buy=el('shop-buy-btn');if(nearbyCraft){buy.textContent='OPEN FABRICATOR';buy.disabled=false;}else if(nearbyForge&&player){buy.textContent=forgeActionLabel();buy.disabled=player.weapon.level>=8||coins<getForgeCost(player.weapon);}else if(o){buy.textContent=shopActionLabel(o);buy.disabled=shopOfferBlocked(o);}if(craftingOpen)renderCraftingUI();updateHUD();
    }
    function getRerollCost(){return 6;}
    function buyOffer(index) {
        var o=shopOffers[index];if(!o||o.bought||coins<o.price)return;if(o.owned&&(o.group==='passive'||o.group==='pact'))return;if(player.passives.coinFoundry)player.coinFoundryCharge=Math.max(player.coinFoundryCharge,coins);coins-=o.price;o.bought=true;
        playSound('shop.buy',{x:o.x,y:o.y});
        if(o.group==='weapon'){var w=player.getWeapon(o.id);if(w){w.level++;showToast(w.name+' FORGED TO LV '+w.level,w.color);}else{w=weaponCopy(o.id);player.inventory.push(w);player.weaponIndex=player.inventory.length-1;player.weapon=w;showToast(w.name+' ACQUIRED',w.color);}}
        else if(o.group==='stat'){STAT_DEFS[o.id].apply(player);player.statBuys[o.id]=(player.statBuys[o.id]||0)+1;showToast(o.name+' +1',rarityColor(o.rarity));}
        else if(o.group==='active'){player.activeSkills[o.id]=(player.activeSkills[o.id]||0)+1;if(player.active===o.id){player.activeLevel=player.activeSkills[o.id];}else if(!player.active)player.equipActiveSkill(o.id);showToast(o.name+(player.active===o.id?' EQUIPPED':' STORED IN INVENTORY'),rarityColor(o.rarity));}
        else if(o.group==='passive'){player.passives[o.id]=true;if(o.id==='calmMind'){player.maxMana+=20;player.mana=Math.min(player.maxMana,player.mana+20);}if(o.id==='coinFoundry')player.coinFoundryCharge=Math.max(player.coinFoundryCharge,coins);showToast(o.name+' LEARNED',rarityColor(o.rarity));}
        else if(o.group==='pact'){player.pacts[o.id]=true;if(o.id==='glassOath'){player.maxHp=Math.max(4,player.maxHp-3);player.hp=Math.min(player.hp,player.maxHp);}if(o.id==='hasteCovenant'){player.stats.speed+=.14;player.stats.attackSpeed+=.14;}if(o.id==='eliteHunt')player.stats.luck+=20;showToast(o.name+' SWORN',rarityColor(o.rarity));}
        if(player.passives.scavenger)player.hp=Math.min(player.maxHp,player.hp+1);updateHUD();updateWeaponHUD();renderShop();if(networkRole==='guest'&&window.DKNet)window.DKNet.sendToHost({type:'build_update',build:serializeBuild(player)});
    }
    function rerollShop(){if(!shopMode)return;var cost=getRerollCost();if(coins<cost)return;playSound('shop.reroll');if(player.passives.coinFoundry)player.coinFoundryCharge=Math.max(player.coinFoundryCharge,coins);coins-=cost;shopRerolls++;nearbyShopIndex=-1;generateShop();showToast('FOUR WEAPONS · FOUR BUILD RELICS','#d65a4a');if(networkRole==='guest'&&window.DKNet)window.DKNet.sendToHost({type:'build_update',build:serializeBuild(player)});}
    function safeBuildNumber(value,min,max,fallback){value=Number(value);return isFinite(value)?clamp(value,min,max):fallback;}
    function knownBuildFlags(source,defs){var result=Object.create(null);if(!source||typeof source!=='object')return result;Object.keys(source).forEach(function(id){if(defs[id]&&source[id])result[id]=true;});return result;}
    function serializeBuild(member){return{revision:++netBuildSeq,inventory:member.inventory.map(function(w){return{id:w.id,level:w.level,shots:w.shots||0};}),weapon:member.weapon&&member.weapon.id,stats:Object.assign({},member.stats),passives:Object.assign({},member.passives),pacts:Object.assign({},member.pacts),activeSkills:Object.assign({},member.activeSkills),activeCooldowns:Object.assign({},member.activeCooldowns),active:member.active,memories:Object.assign({},member.memories),memoryProgress:Object.assign({},member.memoryProgress),primeMemory:member.primeMemory,maxHp:member.maxHp,hp:member.hp,maxArmor:member.maxArmor,armor:member.armor,maxMana:member.maxMana,mana:member.mana,coins:walletFor(member),resources:normalizeResources(member.resources)};}
    function applyBuild(member,build){
        if(!member||!build||typeof build!=='object')return false;var revision=Math.max(0,Math.floor(Number(build.revision)||0));if(revision&&revision<=(member.lastBuildRevision||0))return false;if(revision)member.lastBuildRevision=revision;
        var seen=Object.create(null),sourceInventory=Array.isArray(build.inventory)?build.inventory:[],nextInventory=[];sourceInventory.slice(0,Object.keys(WEAPON_DEFS).length).forEach(function(item){if(!item||!WEAPON_DEFS[item.id]||seen[item.id])return;seen[item.id]=true;var w=weaponCopy(item.id);w.level=Math.round(safeBuildNumber(item.level,1,8,1));w.shots=Math.floor(safeBuildNumber(item.shots,0,1000000000,0));nextInventory.push(w);});member.inventory=nextInventory.length?nextInventory:(defaultWeaponId()?[weaponCopy(defaultWeaponId())]:[]);member.weapon=member.inventory.find(function(w){return w.id===build.weapon;})||member.inventory[0];member.weaponIndex=member.inventory.indexOf(member.weapon);
        var limits={damage:[0,10],attackSpeed:[0,10],speed:[0,3],armor:[0,200],crit:[0,1],dodge:[0,.75],pickup:[0,5000],luck:[0,10000],manaRegen:[0,10],lifesteal:[0,1],coin:[0,5]};if(build.stats&&typeof build.stats==='object')Object.keys(limits).forEach(function(key){var range=limits[key];member.stats[key]=safeBuildNumber(build.stats[key],range[0],range[1],member.stats[key]);});
        member.passives=knownBuildFlags(build.passives,PASSIVE_DEFS);member.pacts=knownBuildFlags(build.pacts,PACT_DEFS);member.activeSkills=Object.create(null);if(build.activeSkills&&typeof build.activeSkills==='object')Object.keys(build.activeSkills).forEach(function(id){if(ACTIVE_DEFS[id])member.activeSkills[id]=Math.round(safeBuildNumber(build.activeSkills[id],1,20,1));});member.activeCooldowns=Object.create(null);if(build.activeCooldowns&&typeof build.activeCooldowns==='object')Object.keys(build.activeCooldowns).forEach(function(id){if(ACTIVE_DEFS[id])member.activeCooldowns[id]=safeBuildNumber(build.activeCooldowns[id],0,1000000,0);});member.active=ACTIVE_DEFS[build.active]&&member.activeSkills[build.active]?build.active:null;member.activeLevel=member.active?member.activeSkills[member.active]:0;member.activeCooldown=member.active?(member.activeCooldowns[member.active]||0):0;
        member.cores={};member.memories=knownBuildFlags(build.memories,DUNGEON_MEMORY_DEFS);member.memoryProgress=Object.create(null);if(build.memoryProgress&&typeof build.memoryProgress==='object')Object.keys(build.memoryProgress).forEach(function(id){if(DUNGEON_MEMORY_DEFS[id])member.memoryProgress[id]=Math.floor(safeBuildNumber(build.memoryProgress[id],0,2,0));});member.primeMemory=member.memories[build.primeMemory]?build.primeMemory:'';
        member.maxHp=safeBuildNumber(build.maxHp,1,10000,member.maxHp);member.hp=safeBuildNumber(build.hp,0,member.maxHp,member.hp);member.maxArmor=safeBuildNumber(build.maxArmor,0,10000,member.maxArmor);member.armor=safeBuildNumber(build.armor,0,member.maxArmor,member.armor);member.maxMana=safeBuildNumber(build.maxMana,1,100000,member.maxMana);member.mana=safeBuildNumber(build.mana,0,member.maxMana,member.mana);setWallet(member,safeBuildNumber(build.coins,0,1000000000,walletFor(member)));member.resources=normalizeResources(build.resources);return true;
    }
    function finishArmory(){resetOwnerOffsets();if(craftingOpen)closeCraftingUI();el('shop-room-ui').style.display='none';el('craft-prev-btn').style.display='none';el('craft-next-btn').style.display='none';shopMode=false;gamePaused=false;pauseReason='';waveTransition=false;nearbyShopIndex=-1;nearbyForge=false;nearbyCraft=false;sceneMode='run';if(networkRole==='guest')guestScene='run';setUiScene('run');partyPlayers().forEach(function(member){member.armoryReady=false;member.resetRrharil();});Object.keys(remoteInputs).forEach(function(id){remoteInputs[id]=Object.assign({},remoteInputs[id],{dx:0,dy:0,fire:false,dash:false,switch:false,ability:false,receivedAt:performance.now()});});armoryReady=Object.create(null);enemies=[];releaseAllTransient();effects=[];pickups=[];hazards=[];radiantWeapons=[];totems=[];pendingShots=[];enemyGridReady=false;mouse.down=false;buttons.fire=false;netWorldRevision++;updateCooldownHUD();resetSimulationClock();}
    function maybeFinishArmory(){if(networkRole!=='host'||!shopMode)return false;var required=partyRoster.map(function(entry){return entry.id;});if(required.indexOf(localPeerId)<0)required.push(localPeerId);if(!required.every(function(id){return!!armoryReady[id];})){el('continue-btn').textContent='WAITING '+Object.keys(armoryReady).length+'/'+required.length;return false;}netSceneRevision++;finishArmory();startWave();if(window.DKNet){window.DKNet.updateRoom('run',{wave:wave,sceneRevision:netSceneRevision});window.DKNet.broadcast({type:'control',action:'resume',wave:wave,sceneRevision:netSceneRevision});sendNetworkSnapshot(true);}return true;}
    function leaveShop(){if(!shopMode)return;playSound('shop.leave');if(networkRole==='local'){finishArmory();startWave();return;}if(player.armoryReady)return;player.armoryReady=true;armoryReady[localPeerId]=true;el('continue-btn').disabled=true;el('continue-btn').textContent=networkRole==='host'?'WAITING FOR PARTY':'READY · WAITING FOR HOST';showToast('ARMORY READY','#bdf7ce');if(networkRole==='guest'&&window.DKNet)window.DKNet.sendToHost({type:'armory_ready',build:serializeBuild(player)});else maybeFinishArmory();}

    function inventoryButton(title,subtitle,color,equipped,onClick){var button=document.createElement('button');button.className='inventory-entry'+(equipped?' equipped':'');button.style.borderColor=equipped?'#f1c40f':color;var strong=document.createElement('strong');strong.textContent=(equipped?'EQUIPPED · ':'')+title;strong.style.color=color;button.appendChild(strong);button.appendChild(document.createTextNode(subtitle));button.addEventListener('click',onClick);return button;}
    function inventoryWeaponButton(w,equipped,onClick){var button=document.createElement('button');button.className='inventory-entry inventory-weapon'+(equipped?' equipped':'');button.style.borderColor=equipped?'#f1c40f':w.color;var model=document.createElement('canvas');model.width=230;model.height=78;model.setAttribute('aria-label',w.name+' model');button.appendChild(model);var copy=document.createElement('div');copy.className='weapon-copy';var strong=document.createElement('strong');strong.textContent=w.name;strong.style.color=w.color;copy.appendChild(strong);copy.appendChild(document.createTextNode('LV '+w.level+' · '+RARITIES[w.rarity].name+' · '+w.category+'\nDMG '+fmt(w.damage*weaponLevelScale(w))+(w.mana?' · '+w.mana+' MANA':w.manaPerSecond?' · '+w.manaPerSecond+' MANA/S':' · 0 MANA')));button.appendChild(copy);button.addEventListener('click',onClick);renderWeaponPreview(model,w,false);return button;}
    function renderInventory(){
        if(!player)return;el('inventory-depth').textContent=tr('WAVE '+wave+' · '+currentBiome.name);
        var weaponsNode=el('inventory-weapons');weaponsNode.textContent='';player.inventory.forEach(function(w){weaponsNode.appendChild(inventoryWeaponButton(w,player.weapon===w,function(){player.resetRrharil();player.weaponIndex=player.inventory.indexOf(w);player.weapon=w;player.charge=0;updateWeaponHUD();renderInventory();showToast(w.name+' EQUIPPED',w.color);}));});
        var activeNode=el('inventory-actives');activeNode.textContent='';var activeIds=Object.keys(player.activeSkills);if(!activeIds.length)activeNode.textContent='No active skills yet. Find spellbooks in an Armory.';activeIds.forEach(function(id){var def=ACTIVE_DEFS[id],level=player.activeSkills[id],cooldown=Math.max(0,player.activeCooldowns[id]||0);activeNode.appendChild(inventoryButton(def.name,'LV '+level+' · '+(cooldown>0?Math.ceil(cooldown/60)+'S COOLDOWN':'READY')+' · '+def.desc,rarityColor(def.rarity),player.active===id,function(){player.equipActiveSkill(id);renderInventory();}));});
        var learned=Object.keys(player.passives).map(function(id){return '• '+PASSIVE_DEFS[id].name+' · '+PASSIVE_DEFS[id].desc;});var sworn=Object.keys(player.pacts).map(function(id){return '• '+PACT_DEFS[id].name+' [PACT] · '+PACT_DEFS[id].desc;});el('inventory-passives').textContent=(learned.length||sworn.length)?learned.concat(sworn).join('\n'):'No passive skills or pacts yet.';
        var memoryNode=el('inventory-memories');memoryNode.textContent='';var memoryIds=Object.keys(player.memories);if(!memoryIds.length)memoryNode.textContent='Finish this five-wave biome to guarantee its Memory. Resonance can unlock it early. Current '+currentBiome.resonance+': '+(player.memoryProgress[currentBiome.resonance]||0)+'/2.';memoryIds.forEach(function(kind){var def=DUNGEON_MEMORY_DEFS[kind];memoryNode.appendChild(inventoryButton(def.name,def.desc,def.color,player.primeMemory===kind,function(){player.primeMemory=kind;renderInventory();showToast(def.name+' EQUIPPED',def.color);}));});
        var timed=[];if(player.berserk>0)timed.push('CRIMSON SURGE '+Math.ceil(player.berserk/60)+'S');if(player.overclock>0)timed.push('ARC OVERCLOCK '+Math.ceil(player.overclock/60)+'S');if(player.echoSealTimer>0)timed.push('ECHO SEAL '+Math.ceil(player.echoSealTimer/60)+'S');if(player.bladeHaloTimer>0)timed.push('BLADE HALO '+Math.ceil(player.bladeHaloTimer/60)+'S');if(player.resonanceTimer>0)timed.push(player.resonanceKind+' '+Math.ceil(player.resonanceTimer/60)+'S');
        var focused=currentCraftRecipe(),focusedResult=WEAPON_DEFS[focused.result],ownedParts=focused.parts.filter(function(id){return player.hasWeapon(id);}).length;
        var familyLines=[],familySeen={};player.inventory.forEach(function(w){if(!w.family||familySeen[w.family])return;familySeen[w.family]=true;var count=player.familyCount(w.family),tier=player.familyTier(w.family);if(count>=2)familyLines.push(w.family.toUpperCase()+' '+count+' PIECES · BOND '+tier+'/2');});
        var statusLines=[tr('Class')+' '+tr(player.className),tr(player.traitName)+' · '+tr(player.traitDesc),'',tr('Health')+' '+fmt(player.hp)+' / '+player.maxHp,tr('Armor')+' '+fmt(player.armor)+' / '+player.maxArmor,tr('Mana')+' '+Math.floor(player.mana)+' / '+player.maxMana,'',tr('Damage')+' +'+Math.round((player.damageMultiplier()-1)*100)+'%',tr('Attack speed')+' +'+Math.round((player.attackRateMultiplier()-1)*100)+'%',tr('Move speed')+' +'+Math.round(player.stats.speed*100)+'%',tr('Critical chance')+' '+Math.round(player.stats.crit*100)+'%',tr('Dodge')+' '+Math.round(player.stats.dodge*100)+'%',tr('Lifesteal')+' '+fmt(player.stats.lifesteal*100)+'%',tr('Pickup range')+' '+Math.round(player.stats.pickup),tr('Coin bonus')+' +'+Math.round((player.stats.coin+(player.primeMemory==='GOLD SCRIPT'?.08:0))*100)+'%'];
        if(familyLines.length)statusLines.push('',tr('Weapon family bonds'),'• '+familyLines.join('\n• '));
        statusLines.push('',tr('Craft focus')+': '+focusedResult.name,tr('Parts')+' '+ownedParts+'/'+focused.parts.length+' · '+focused.coins+' '+tr('Coins'),'',tr('Prime Memory')+': '+(player.primeMemory?DUNGEON_MEMORY_DEFS[player.primeMemory].name:tr('None')),'',tr('Biome')+': '+tr(currentBiome.name),tr(currentBiome.mechanic));
        if(timed.length)statusLines.push('',tr('Active buffs'),'• '+timed.join('\n• '));
        el('inventory-status').textContent=statusLines.join('\n');
    }
    function openInventory(){if(!gameActive||inventoryOpen)return;playSound('ui.open');inventoryReturnPause=gamePaused&&pauseReason==='pause';inventoryOpen=true;gamePaused=true;pauseReason='inventory';el('pause-screen').style.display='none';renderInventory();el('inventory-screen').style.display='flex';mouse.down=false;buttons.fire=false;}
    function closeInventory(){if(!inventoryOpen)return;playSound('ui.close');inventoryOpen=false;el('inventory-screen').style.display='none';if(shopMode){gamePaused=false;pauseReason='shop';}else if(inventoryReturnPause){gamePaused=true;pauseReason='pause';el('pause-screen').style.display='flex';}else{gamePaused=false;pauseReason='';}resetSimulationClock();}
    function requestStopRun(button){var now=performance.now();if(now<stopConfirmUntil){stopConfirmUntil=0;el('inventory-screen').style.display='none';el('pause-screen').style.display='none';inventoryOpen=false;endGame('RUN ENDED');return;}stopConfirmUntil=now+2500;button.textContent='Press again to return';showToast('Press again to return to the main menu','#ff8f8f');setTimeout(function(){if(performance.now()>=stopConfirmUntil){stopConfirmUntil=0;el('stop-btn').textContent=el('stop-btn').getAttribute('data-default-label')||'Main Menu';el('inventory-stop-btn').textContent=el('inventory-stop-btn').getAttribute('data-default-label')||'Main Menu';}},2600);}

    function updateBullets(step) {var bulletLimit=bullets.length;for(var b=0;b<bulletLimit;b++)if(!bullets[b].dead)bullets[b].update(step);var slashLimit=slashes.length;for(var s=0;s<slashLimit;s++)if(!slashes[s].dead)slashes[s].update(step);}
    function cleanArrays() {
        compactPooled(bullets,function(b){return!b.dead;},recycleBullet);compactPooled(slashes,function(s){return!s.dead;},recycleSlash);compactInPlace(radiantWeapons,function(r){return!r.dead;});compactPooled(particles,function(p){return p.life>0;},recycleParticle);compactInPlace(effects,function(e){return e.life>0;});compactInPlace(pickups,function(p){return!p.dead;});compactInPlace(enemies,function(e){return!e.dead;});compactInPlace(hazards,function(h){return!h.dead;});compactInPlace(biomeProps,function(p){return!p.dead;});compactInPlace(totems,function(t){return!t.dead;});enemyGridReady=false;
    }

    function updateHUD() {
        if(!player)return;
        el('class-name').textContent=player.className;
        el('hp-bar').style.transform='scaleX('+clamp(player.hp/player.maxHp,0,1)+')';el('hp-text').textContent='HP '+fmt(Math.max(0,player.hp))+'/'+fmt(player.maxHp);el('armor-bar').style.transform='scaleX('+clamp(player.armor/player.maxArmor,0,1)+')';el('armor-text').textContent='ARMOR '+fmt(player.armor)+'/'+player.maxArmor+(player.armor<player.maxArmor&&player.armorRegenDelay>0?' · '+Math.ceil(player.armorRegenDelay/60)+'S':'');el('mana-bar').style.transform='scaleX('+clamp(player.mana/player.maxMana,0,1)+')';el('mana-text').textContent='MANA '+Math.floor(player.mana)+'/'+player.maxMana;el('coin-count').textContent=coins;var memoryProgress=player.memoryProgress[currentBiome.resonance]||0,memoryOwned=!!player.memories[currentBiome.resonance];el('resonance-text').textContent=player.resonanceTimer>0?player.resonanceKind+' · '+Math.ceil(player.resonanceTimer/60)+'S':'RESONANCE '+player.resonance+'/3 · '+(memoryOwned?'MEMORY LEARNED':'MEMORY '+memoryProgress+'/2');el('resonance-text').style.color=player.resonanceTimer>0?currentBiome.accent:memoryOwned?DUNGEON_MEMORY_DEFS[currentBiome.resonance].color:'#aaa';el('class-trait-text').textContent=player.traitName+(player.arsenalTempo>0?' · ADAPTED '+Math.ceil(player.arsenalTempo/60)+'S':'');el('score-display').textContent='SCORE '+score;el('enemy-display').textContent='ENEMIES '+enemies.filter(function(enemy){return!enemy.trainingDummy;}).length+' · PHASE '+Math.max(1,wavePhase)+'/'+wavePhaseTotal;el('wave-display').textContent='WAVE '+Math.max(1,wave)+' · PHASE '+Math.max(1,wavePhase)+'/'+wavePhaseTotal;var next=Math.ceil((wave+1)/5)*5;if(wave%5===0)next=wave+5;el('shop-timer').textContent='ARMORY AT WAVE '+next;updateBossHud();
    }
    function updateBossHud(){var node=el('boss-hud');if(!node)return;var boss=enemies.find(function(enemy){return enemy.isBoss&&!enemy.dead;});if(!boss){node.style.display='none';return;}node.style.display='block';el('boss-name').textContent=boss.name||boss.bossDef&&boss.bossDef.name||'BIOME SOVEREIGN';el('boss-name').style.color=boss.color;var ratio=clamp(boss.hp/Math.max(1,boss.maxHp),0,1);el('boss-bar').style.transform='scaleX('+ratio+')';el('boss-bar').style.background=boss.color;el('boss-phase').textContent=boss.apex?'PHASE III · APEX':boss.enraged?'PHASE II · ENRAGED':'PHASE I';el('boss-combo').textContent=(boss.comboState==='windup'?'CASTING · ':boss.comboState==='dash'?'CHARGING · ':'NEXT · ')+(boss.comboName||'SOVEREIGN ATTACK');}
    function updateWeaponHUD() {
        /* The v1.9 HUD is intentionally quiet: weapon identity and damage stay in Inventory/Armory. */
    }
    function triggerDashReady() {
        var dashBtn = el('dash-btn');
        if (dashBtn) {
            dashBtn.classList.remove('is-ready');
            void dashBtn.offsetWidth;
            dashBtn.classList.add('is-ready');
        }
        var desktopDashCd = el('desktop-dash-cd');
        if (desktopDashCd && desktopDashCd.parentElement) {
            var slot = desktopDashCd.parentElement;
            slot.classList.remove('is-ready');
            void slot.offsetWidth;
            slot.classList.add('is-ready');
        }
    }
    function updateCooldownHUD() {
        if(!player)return;
        var dashPct=clamp(player.dashCooldown/player.dashCooldownMax*100,0,100),
            dashText=player.dashCooldown>0?Math.max(0.1,player.dashCooldown/60).toFixed(1)+'s':'',
            isDashCd=player.dashCooldown>0;
        var dCd=el('desktop-dash-cd'),mCd=el('mobile-dash-cd'),
            dNum=el('desktop-dash-cd-number'),mNum=el('mobile-dash-cd-number'),
            dBtn=el('dash-btn');
        if(dCd){dCd.style.height=dashPct+'%';if(dCd.parentElement)dCd.parentElement.classList.toggle('is-cooldown',isDashCd);}
        if(mCd)mCd.style.height=dashPct+'%';
        if(dNum)dNum.textContent=dashText;
        if(mNum)mNum.textContent=dashText;
        if(dBtn)dBtn.classList.toggle('is-cooldown',isDashCd);
        var activePct=0,activeSeconds=0;
        if(player.active){
            var def=ACTIVE_DEFS[player.active];
            activePct=clamp(player.activeCooldown/(def.cooldown*Math.max(.65,1-(player.activeLevel-1)*.1))*100,0,100);
            activeSeconds=player.activeCooldown>0?Math.ceil(player.activeCooldown/60):0;
            el('active-label').textContent='E\n'+def.name.replace('HANDHELD ','').split(' ')[0];
        }else el('active-label').textContent='E\nNO SKILL';
        el('active-cd').style.height=activePct+'%';
        el('mobile-active-cd').style.height=activePct+'%';
        el('active-cd-number').textContent=activeSeconds||'';
        el('mobile-active-cd-number').textContent=activeSeconds||'';
    }

    function floorHash(x,y){var n=(x*374761393+y*668265263+(BIOMES.indexOf(currentBiome)+1)*982451653)|0;n=(n^(n>>>13))*1274126177;return((n^(n>>>16))>>>0)/4294967295;}
    function drawFloorMotif(cx,cy,art,seed){
        if(seed>.17)return;ctx.save();ctx.translate(cx,cy);ctx.globalAlpha=.15;ctx.strokeStyle=art.trim;ctx.fillStyle=art.trim;ctx.lineWidth=2;var m=art.motif;
        if(m==='ice'){ctx.beginPath();ctx.moveTo(-22,12);ctx.lineTo(-7,-8);ctx.lineTo(5,4);ctx.lineTo(19,-17);ctx.moveTo(-7,-8);ctx.lineTo(-13,-20);ctx.moveTo(5,4);ctx.lineTo(16,10);ctx.stroke();}
        else if(m==='crack'||m==='lava'){ctx.beginPath();ctx.moveTo(-25,-12);ctx.lineTo(-7,-3);ctx.lineTo(2,17);ctx.lineTo(19,23);ctx.moveTo(-7,-3);ctx.lineTo(8,-18);ctx.stroke();}
        else if(m==='circuit'){ctx.beginPath();ctx.moveTo(-24,-14);ctx.lineTo(-6,-14);ctx.lineTo(-6,6);ctx.lineTo(18,6);ctx.lineTo(18,20);ctx.stroke();ctx.fillRect(-27,-17,6,6);ctx.fillRect(15,17,6,6);}
        else if(m==='rift'){ctx.beginPath();ctx.ellipse(0,0,27,8,-.2,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(0,0,13,3,-.2,0,TAU);ctx.fill();}
        else if(m==='leaf'){ctx.beginPath();ctx.moveTo(-24,18);ctx.quadraticCurveTo(-5,-10,22,-18);ctx.stroke();ctx.beginPath();ctx.ellipse(-8,3,10,5,-.7,0,TAU);ctx.ellipse(8,-9,9,4,.55,0,TAU);ctx.stroke();}
        else if(m==='wave'){ctx.beginPath();ctx.moveTo(-30,5);ctx.bezierCurveTo(-14,-10,-2,20,12,5);ctx.bezierCurveTo(19,-3,24,-2,30,5);ctx.stroke();}
        else if(m==='rune'){ctx.strokeRect(-16,-16,32,32);ctx.beginPath();ctx.moveTo(-16,-16);ctx.lineTo(16,16);ctx.moveTo(16,-16);ctx.lineTo(-16,16);ctx.stroke();}
        else if(m==='facet'){ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(22,12);ctx.lineTo(0,25);ctx.lineTo(-22,12);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(0,25);ctx.moveTo(-22,12);ctx.lineTo(22,12);ctx.stroke();}
        else if(m==='gear'){ctx.beginPath();ctx.arc(0,0,20,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,6,0,TAU);ctx.stroke();for(var g=0;g<6;g++){ctx.rotate(TAU/6);ctx.fillRect(19,-3,10,6);}}
        else if(m==='bone'){ctx.fillRect(-21,-2,42,4);ctx.beginPath();ctx.arc(-21,0,5,0,TAU);ctx.arc(21,0,5,0,TAU);ctx.fill();}
        else if(m==='spore'){for(var s=0;s<5;s++){var a=s*TAU/5;ctx.beginPath();ctx.arc(Math.cos(a)*18,Math.sin(a)*14,3+s%2,0,TAU);ctx.stroke();}}
        else if(m==='dune'){ctx.beginPath();ctx.moveTo(-30,12);ctx.quadraticCurveTo(-8,-13,10,5);ctx.quadraticCurveTo(20,14,30,-4);ctx.stroke();ctx.beginPath();ctx.arc(8,-10,5,0,TAU);ctx.stroke();}
        else if(m==='rose'){for(var ro=0;ro<6;ro++){ctx.rotate(TAU/6);ctx.beginPath();ctx.ellipse(11,0,10,4,.2,0,TAU);ctx.stroke();}}
        else if(m==='wind'){for(var wi=-1;wi<=1;wi++){ctx.beginPath();ctx.moveTo(-28,wi*10);ctx.bezierCurveTo(-8,wi*10-10,8,wi*10+10,28,wi*10);ctx.stroke();}}
        else if(m==='pulse'){for(var pu=0;pu<3;pu++){ctx.beginPath();ctx.arc(0,0,7+pu*9,pu*.5,Math.PI+pu*.5);ctx.stroke();}}
        else if(m==='royal'){ctx.globalAlpha=.09;ctx.strokeStyle='#8d6a6e';ctx.beginPath();ctx.moveTo(-20,12);ctx.lineTo(-12,-12);ctx.lineTo(0,2);ctx.lineTo(12,-12);ctx.lineTo(20,12);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(-20,12);ctx.lineTo(20,12);ctx.stroke();}
        ctx.restore();
    }
    function drawPalaceKnightStatue(fall,swordLift){
        if(!PALACE_ART||typeof PALACE_ART.drawKnightStatue!=='function')return;
        PALACE_ART.drawKnightStatue(ctx,{fall:fall,swordLift:swordLift||0,broken:palaceStatueFallen&&!palaceCutscene.active});
    }

    function drawBiomeLandscape(art){
        var kind=art.landscape;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
        function oval(x,y,rx,ry,fill,stroke,width){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width||6;ctx.stroke();}}
        function channel(points,width,edge,fill){ctx.strokeStyle=edge;ctx.lineWidth=width+18;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.stroke();ctx.strokeStyle=fill;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(var j=1;j<points.length;j++)ctx.lineTo(points[j][0],points[j][1]);ctx.stroke();}
        function slab(x,y,w,h,fill,stroke){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);ctx.strokeStyle=stroke;ctx.lineWidth=6;ctx.strokeRect(x,y,w,h);}
        if(kind==='royalPalace'){
            ctx.fillStyle='#151215';ctx.fillRect(-1080,-1080,2160,2160);
            ctx.globalAlpha=.34;ctx.strokeStyle='#4a3a3f';ctx.lineWidth=3;for(var ps=-900;ps<=900;ps+=180){ctx.beginPath();ctx.moveTo(-1030,ps);ctx.lineTo(1030,ps);ctx.stroke();ctx.beginPath();ctx.moveTo(ps,-1030);ctx.lineTo(ps,1030);ctx.stroke();}ctx.globalAlpha=1;
            var ambient=ctx.createRadialGradient(0,0,60,0,0,790);ambient.addColorStop(0,'rgba(164,145,132,.15)');ambient.addColorStop(.45,'rgba(112,92,86,.075)');ambient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=ambient;ctx.fillRect(-900,-900,1800,1800);
            function carpetRect(x,y,w,h){ctx.fillStyle='#55111a';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#8f303b';ctx.lineWidth=10;ctx.strokeRect(x+5,y+5,w-10,h-10);ctx.strokeStyle='#a88465';ctx.globalAlpha=.58;ctx.lineWidth=3;ctx.strokeRect(x+15,y+15,w-30,h-30);ctx.globalAlpha=1;}
            carpetRect(-94,-1120,188,870);carpetRect(-94,250,188,870);carpetRect(-1120,-94,870,188);carpetRect(250,-94,870,188);ctx.fillStyle='#55111a';ctx.strokeStyle='#91323d';ctx.lineWidth=12;ctx.beginPath();ctx.arc(0,0,310,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#ae8968';ctx.globalAlpha=.6;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,282,0,TAU);ctx.stroke();ctx.globalAlpha=1;
            drawPalaceKnightStatue(palaceCutscene.active?palaceCutscene.statueFall:(palaceStatueFallen?1:0),palaceCutscene.active?palaceCutscene.swordLift:(palaceStatueFallen?1:0));
            if(palaceCutscene.active&&palaceCutscene.spiritAlpha>0&&BOSS_BEHAVIORS.ember&&BOSS_BEHAVIORS.ember.drawCinematic)BOSS_BEHAVIORS.ember.drawCinematic(palaceCutscene,BOSS_BEHAVIOR_API);
            var vignette=ctx.createRadialGradient(0,0,330,0,0,1320);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(.62,'rgba(0,0,0,.045)');vignette.addColorStop(1,'rgba(0,0,0,.30)');ctx.fillStyle=vignette;ctx.fillRect(-1120,-1120,2240,2240);
            ctx.save();
            function topBeam(x){var grad=ctx.createLinearGradient(x,-1214,x,-600);grad.addColorStop(0,'rgba(239,224,198,.24)');grad.addColorStop(.72,'rgba(225,210,187,.075)');grad.addColorStop(1,'rgba(225,210,187,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(x-38,-1214);ctx.lineTo(x+38,-1214);ctx.lineTo(x+82,-600);ctx.lineTo(x-82,-600);ctx.closePath();ctx.fill();}
            function bottomBeam(x){var grad=ctx.createLinearGradient(x,1214,x,600);grad.addColorStop(0,'rgba(239,224,198,.23)');grad.addColorStop(.72,'rgba(225,210,187,.07)');grad.addColorStop(1,'rgba(225,210,187,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(x-38,1214);ctx.lineTo(x+38,1214);ctx.lineTo(x+82,600);ctx.lineTo(x-82,600);ctx.closePath();ctx.fill();}
            function leftBeam(y){var grad=ctx.createLinearGradient(-1214,y,-600,y);grad.addColorStop(0,'rgba(239,224,198,.21)');grad.addColorStop(.72,'rgba(225,210,187,.065)');grad.addColorStop(1,'rgba(225,210,187,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(-1214,y-38);ctx.lineTo(-1214,y+38);ctx.lineTo(-600,y+82);ctx.lineTo(-600,y-82);ctx.closePath();ctx.fill();}
            function rightBeam(y){var grad=ctx.createLinearGradient(1214,y,600,y);grad.addColorStop(0,'rgba(239,224,198,.21)');grad.addColorStop(.72,'rgba(225,210,187,.065)');grad.addColorStop(1,'rgba(225,210,187,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(1214,y-38);ctx.lineTo(1214,y+38);ctx.lineTo(600,y+82);ctx.lineTo(600,y-82);ctx.closePath();ctx.fill();}
            [-610,0,610].forEach(topBeam);[-610,0,610].forEach(bottomBeam);[-610,0,610].forEach(leftBeam);[-610,0,610].forEach(rightBeam);ctx.restore();
        }
        else if(kind==='frozenKeep'){ctx.fillStyle='#20272b';ctx.fillRect(-900,-620,1800,145);ctx.fillStyle='#30393e';for(var fk=-3;fk<=3;fk++){ctx.fillRect(fk*250-76,-570,152,250);ctx.fillRect(fk*250-98,-594,196,28);}ctx.strokeStyle='#687982';ctx.lineWidth=7;ctx.strokeRect(-755,-465,1510,885);ctx.globalAlpha=.25;ctx.fillStyle='#a7bdc7';for(var fi=0;fi<8;fi++)ctx.fillRect(-700+fi*190,-380+(fi%2)*620,110,24);ctx.globalAlpha=1;}
        else if(kind==='buriedCourt'){ctx.fillStyle='#24211c';ctx.fillRect(-900,-610,1800,138);ctx.fillStyle='#39342c';for(var sk=-3;sk<=3;sk++)ctx.fillRect(sk*260-65,-555,130,235);ctx.strokeStyle='#756a57';ctx.lineWidth=7;ctx.strokeRect(-750,-455,1500,870);ctx.fillStyle='#4a4235';for(var sp=-2;sp<=2;sp++){ctx.beginPath();ctx.arc(sp*285,305,68,Math.PI,TAU);ctx.fill();}}
        else if(kind==='mossRuins'){ctx.fillStyle='#1b211b';ctx.fillRect(-900,-615,1800,142);ctx.fillStyle='#2b332a';for(var mr=-3;mr<=3;mr++){ctx.fillRect(mr*255-72,-560,144,215);if(mr%2===0)ctx.fillRect(mr*255-95,-585,190,28);}ctx.strokeStyle='#596656';ctx.lineWidth=7;ctx.strokeRect(-755,-460,1510,880);ctx.globalAlpha=.28;ctx.fillStyle='#65785e';for(var mv=-3;mv<=3;mv++)ctx.fillRect(mv*210-18,-430,36,760);ctx.globalAlpha=1;}
        else if(kind==='lavaCanals'){
            ctx.globalAlpha=.92;channel([[-980,-650],[-520,-520],[-210,-600],[90,-410],[470,-520],[980,-390]],86,art.land,art.terrain);channel([[-820,980],[-650,490],[-730,170],[-480,-120],[-560,-430]],66,art.land,'#ff9a3d');channel([[660,980],[570,620],[720,310],[610,20],[790,-310],[720,-980]],62,art.land,'#ff7733');
            ctx.globalAlpha=.45;for(var lc=0;lc<7;lc++)oval(-700+lc*230,(lc%2?510:-530),52,24,'#ffd27a',null,0);
        }else if(kind==='frozenSanctum'){
            ctx.globalAlpha=.86;oval(0,0,820,690,'#0b2531','#8fc8d8',16);ctx.globalAlpha=.72;oval(0,0,700,570,'#16404f','#c4edf4',6);
            ctx.globalAlpha=.84;slab(-910,-92,1820,184,'#2d4652','#d9f4f7');slab(-92,-910,184,1820,'#2a424d','#d9f4f7');
            ctx.globalAlpha=.52;ctx.fillStyle='#d9edf0';var snowBanks=[[-720,-690,270,120],[700,-650,300,145],[-735,655,310,135],[710,690,255,118]];for(var bank=0;bank<snowBanks.length;bank++){var sb=snowBanks[bank];oval(sb[0],sb[1],sb[2],sb[3],'#c8e0e5','#f4fdff',6);}
            ctx.globalAlpha=.65;ctx.strokeStyle='#c8f0f5';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-650,-360);ctx.lineTo(-390,-210);ctx.lineTo(-510,-40);ctx.lineTo(-245,105);ctx.moveTo(620,-420);ctx.lineTo(350,-230);ctx.lineTo(470,-70);ctx.lineTo(210,125);ctx.moveTo(-520,400);ctx.lineTo(-290,245);ctx.lineTo(-90,410);ctx.moveTo(540,430);ctx.lineTo(310,260);ctx.lineTo(120,420);ctx.stroke();
            ctx.globalAlpha=.82;for(var pillar=0;pillar<8;pillar++){var pa=pillar*TAU/8,pr=pillar%2?720:610,px=Math.cos(pa)*pr,py=Math.sin(pa)*pr*.86;ctx.save();ctx.translate(px,py);ctx.rotate(pa);ctx.fillStyle='#28424e';ctx.strokeStyle='#d8f5f8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-62);ctx.lineTo(25,-15);ctx.lineTo(15,58);ctx.lineTo(-15,58);ctx.lineTo(-25,-15);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d9f4f7';ctx.fillRect(-20,-70,40,9);ctx.restore();}
            ctx.globalAlpha=.5;ctx.strokeStyle='#eafcff';ctx.lineWidth=3;for(var seal=0;seal<4;seal++){ctx.save();ctx.rotate(seal*TAU/4);ctx.strokeRect(150,-38,180,76);ctx.beginPath();ctx.moveTo(165,0);ctx.lineTo(315,0);ctx.stroke();ctx.restore();}
        }else if(kind==='duneCourt'){
            ctx.globalAlpha=.65;slab(-520,-670,1040,1340,'#cdb06e','#f3d995');ctx.globalAlpha=.3;ctx.strokeStyle=art.terrain;ctx.lineWidth=18;for(var dr=-3;dr<=3;dr++){ctx.beginPath();ctx.moveTo(-490,dr*180);ctx.quadraticCurveTo(-230,dr*180-75,0,dr*180);ctx.quadraticCurveTo(250,dr*180+75,490,dr*180);ctx.stroke();}ctx.globalAlpha=.5;for(var du=-1;du<=1;du+=2){for(var dv=-1;dv<=1;dv+=2)oval(du*720,dv*620,240,100,'#d8bd79','#ffe4a1',7);}ctx.globalAlpha=.75;oval(0,0,145,145,'#a78343','#ffe3a0',10);ctx.strokeStyle='#ffe3a0';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-100,-100);ctx.lineTo(100,100);ctx.moveTo(100,-100);ctx.lineTo(-100,100);ctx.stroke();
        }else if(kind==='arcPlate'){
            ctx.globalAlpha=.62;slab(-720,-720,1440,1440,'#44365f','#ad82e7');ctx.globalAlpha=.45;ctx.strokeStyle='#d6b7ff';ctx.lineWidth=12;channel([[-940,-520],[-500,-520],[-260,-240],[230,-240],[500,-520],[940,-520]],22,'#332746','#b879ff');channel([[-940,520],[-500,520],[-260,240],[230,240],[500,520],[940,520]],22,'#332746','#b879ff');for(var ap=-2;ap<=2;ap++){ctx.strokeRect(ap*270-80,-80,160,160);oval(ap*270,0,20,20,'#e7d3ff','#fff',5);}
        }else if(kind==='riftBasin'){
            ctx.globalAlpha=.88;oval(0,0,780,560,art.land,'#6e2d78',18);ctx.globalAlpha=.58;oval(0,0,570,350,'#210a26','#ff74bd',11);ctx.globalAlpha=.35;for(var vr=0;vr<5;vr++)oval(0,0,150+vr*95,65+vr*55,null,vr%2?'#ff74bd':'#a054ff',5);ctx.strokeStyle='#c067cb';ctx.lineWidth=9;ctx.beginPath();for(var vc=0;vc<12;vc++){var va=vc*TAU/12;ctx.moveTo(Math.cos(va)*540,Math.sin(va)*330);ctx.lineTo(Math.cos(va+.08)*900,Math.sin(va+.08)*820);}ctx.stroke();
        }else if(kind==='chapelAisle'){
            ctx.globalAlpha=.78;slab(-245,-930,490,1860,'#6c1f39','#ffc0cd');ctx.globalAlpha=.45;ctx.fillStyle='#f0a5b7';for(var ca=-4;ca<=4;ca++)ctx.fillRect(-205,ca*190-55,410,110);ctx.globalAlpha=.86;oval(0,0,245,245,'#8f3853','#ffd1dc',12);ctx.save();ctx.translate(0,0);ctx.strokeStyle='#ffd1dc';ctx.lineWidth=9;for(var cr=0;cr<10;cr++){ctx.rotate(TAU/10);ctx.beginPath();ctx.ellipse(105,0,100,35,0,0,TAU);ctx.stroke();}ctx.restore();ctx.globalAlpha=.35;for(var cp=-1;cp<=1;cp+=2){slab(cp*680-110,-740,220,1480,'#b85e72','#ffd1dc');}
        }else if(kind==='rootGarden'){
            ctx.globalAlpha=.55;for(var gp=0;gp<9;gp++){var gx=(gp%3-1)*590+(gp%2)*80,gy=(Math.floor(gp/3)-1)*560;oval(gx,gy,260,190,'#6c965d','#bde59b',9);}ctx.globalAlpha=.52;ctx.strokeStyle='#4c6538';ctx.lineWidth=46;ctx.beginPath();ctx.moveTo(-980,650);ctx.bezierCurveTo(-480,350,-360,-110,0,-40);ctx.bezierCurveTo(410,30,500,-470,980,-690);ctx.moveTo(-850,-780);ctx.bezierCurveTo(-570,-320,-150,-400,80,-40);ctx.bezierCurveTo(310,340,690,300,890,720);ctx.stroke();ctx.strokeStyle='#9bb76b';ctx.lineWidth=10;ctx.stroke();
        }else if(kind==='waterIsles'){
            ctx.globalAlpha=.7;ctx.fillStyle='#236e80';ctx.fillRect(-1000,-1000,2000,2000);ctx.globalAlpha=.8;var islands=[[-540,-510,310,220],[360,-570,350,200],[-500,400,370,240],[390,390,300,250],[0,-40,320,280]];for(var wi=0;wi<islands.length;wi++){var is=islands[wi];oval(is[0],is[1],is[2],is[3],art.tileA,'#cfffff',12);oval(is[0],is[1],is[2]-40,is[3]-40,art.tileB,null,0);}ctx.globalAlpha=.6;ctx.strokeStyle='#a9f5ff';ctx.lineWidth=9;for(var wa=-3;wa<=3;wa++){ctx.beginPath();ctx.moveTo(-980,wa*240);ctx.bezierCurveTo(-500,wa*240+70,420,wa*240-70,980,wa*240);ctx.stroke();}
        }else if(kind==='cloudCourt'){
            ctx.globalAlpha=.42;ctx.fillStyle='#0b1722';ctx.fillRect(-1040,-1040,2080,2080);ctx.globalAlpha=.86;slab(-300,-930,600,1860,'#7899ad','#eefbff');slab(-930,-300,1860,600,'#7899ad','#eefbff');ctx.globalAlpha=.64;var bastions=[[-675,-675,260,210],[675,-675,260,210],[-675,675,260,210],[675,675,260,210]];for(var cb=0;cb<bastions.length;cb++){var bs=bastions[cb];oval(bs[0],bs[1],bs[2]+80,bs[3]+70,'#d7edf5','#ffffff',8);slab(bs[0]-155,bs[1]-120,310,240,'#58778a','#cfefff');ctx.fillStyle='#d6f2ff';for(var merlon=-1;merlon<=1;merlon++)ctx.fillRect(bs[0]+merlon*95-18,bs[1]-145,36,28);}ctx.globalAlpha=.68;ctx.strokeStyle='#e9fbff';ctx.lineWidth=7;for(var rail=-1;rail<=1;rail+=2){ctx.beginPath();ctx.moveTo(-900,rail*245);ctx.lineTo(900,rail*245);ctx.moveTo(rail*245,-900);ctx.lineTo(rail*245,900);ctx.stroke();}ctx.globalAlpha=.36;for(var cloud=0;cloud<10;cloud++){var cla=cloud*2.399,clr=760+(cloud%3)*95;oval(Math.cos(cla)*clr,Math.sin(cla)*clr*.85,150+cloud%3*32,70+cloud%2*24,'#eaf8fd',null,0);}
        }else if(kind==='archiveCarpet'){
            ctx.globalAlpha=.74;slab(-205,-1000,410,2000,'#71323a','#f1cb72');ctx.globalAlpha=.62;oval(0,0,270,220,'#4a351a','#ffe19a',10);ctx.strokeStyle='#ffd77b';ctx.lineWidth=4;for(var script=0;script<8;script++){ctx.rotate(TAU/8);ctx.beginPath();ctx.moveTo(92,-9);ctx.lineTo(190,-9);ctx.moveTo(108,9);ctx.lineTo(174,9);ctx.stroke();}ctx.rotate(-TAU);ctx.globalAlpha=.84;for(var side=-1;side<=1;side+=2){for(var stack=-3;stack<=3;stack++){var shelfX=side*(575+(Math.abs(stack)%2)*95),shelfY=stack*270;slab(shelfX-115,shelfY-82,230,164,'#3b2a18','#b99a54');ctx.fillStyle='#9f3942';for(var book=0;book<6;book++){var bh=86-(book%3)*12;ctx.fillRect(shelfX-88+book*30,shelfY+55-bh,20,bh);ctx.fillStyle=book%2?'#c39a4b':'#7d2e38';}ctx.strokeStyle='#e0c170';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(shelfX-100,shelfY);ctx.lineTo(shelfX+100,shelfY);ctx.stroke();}}ctx.globalAlpha=.28;ctx.strokeStyle='#f5d989';ctx.lineWidth=3;for(var aisle=-2;aisle<=2;aisle++){ctx.beginPath();ctx.moveTo(-360,aisle*205);ctx.lineTo(360,aisle*205);ctx.stroke();}
        }else if(kind==='prismCourt'){
            ctx.globalAlpha=.68;var facets=[[[0,-910],[330,-470],[180,-160],[-250,-310]],[[910,-90],[560,330],[230,170],[350,-250]],[[690,760],[190,560],[90,220],[480,300]],[[-760,690],[-430,170],[-120,120],[-240,550]],[[-900,-320],[-500,-580],[-190,-210],[-510,60]]];var facetColors=['#6da8b7','#86c2ce','#5f96a8','#9bd8e3','#75b5c3'];for(var pf=0;pf<facets.length;pf++){ctx.fillStyle=facetColors[pf];ctx.strokeStyle=pf%2?'#d8fbff':'#b9edf4';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(facets[pf][0][0],facets[pf][0][1]);for(var pv=1;pv<facets[pf].length;pv++)ctx.lineTo(facets[pf][pv][0],facets[pf][pv][1]);ctx.closePath();ctx.fill();ctx.stroke();}ctx.globalAlpha=.9;oval(0,0,235,205,'#c8edf2','#ffffff',10);ctx.strokeStyle='#ffffff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-170,-80);ctx.lineTo(-30,20);ctx.lineTo(-105,160);ctx.moveTo(178,-115);ctx.lineTo(48,10);ctx.lineTo(150,145);ctx.stroke();ctx.globalAlpha=.4;for(var shard=0;shard<12;shard++){var sha=shard*2.19,shr=350+(shard%4)*140;ctx.save();ctx.translate(Math.cos(sha)*shr,Math.sin(sha)*shr);ctx.rotate(sha);ctx.strokeStyle=facetColors[shard%facetColors.length];ctx.strokeRect(-24,-8,48,16);ctx.restore();}
        }else if(kind==='marshPools'){
            ctx.globalAlpha=.7;ctx.fillStyle='#061c1a';ctx.fillRect(-1010,-1010,2020,2020);var pools=[[-690,-560,245,175],[445,-620,360,170],[-560,430,300,245],[560,425,270,280],[40,-25,270,155]];for(var mp=0;mp<pools.length;mp++){var po=pools[mp];oval(po[0],po[1],po[2],po[3],'#10504d','#48cdb5',8);ctx.globalAlpha=.74;ctx.strokeStyle='#83ffe9';ctx.lineWidth=2;for(var ripple=0;ripple<3;ripple++)oval(po[0],po[1],po[2]*(.35+ripple*.2),po[3]*(.35+ripple*.2),null,'#83ffe9',2);ctx.globalAlpha=.7;ctx.fillStyle='#71ae77';for(var lily=0;lily<3;lily++){var la=lily*2.1+mp;ctx.beginPath();ctx.arc(po[0]+Math.cos(la)*po[2]*.55,po[1]+Math.sin(la)*po[3]*.55,13+lily*2,0,TAU);ctx.fill();}}ctx.globalAlpha=.88;slab(-980,-72,1960,144,'#28514a','#72d7c3');slab(-72,-980,144,1960,'#28514a','#72d7c3');ctx.globalAlpha=.66;for(var post=-4;post<=4;post++){ctx.fillStyle='#173e38';ctx.fillRect(post*210-8,-96,16,192);ctx.fillRect(-96,post*210-8,192,16);ctx.strokeStyle='#a6ffed';ctx.lineWidth=2;ctx.strokeRect(post*210-8,-96,16,192);ctx.strokeRect(-96,post*210-8,192,16);}ctx.globalAlpha=.62;ctx.strokeStyle='#71e9d2';ctx.lineWidth=3;for(var reed=0;reed<24;reed++){var ra=reed*2.37,rr=420+(reed%5)*105,rx=Math.cos(ra)*rr,ry=Math.sin(ra)*rr;ctx.beginPath();ctx.moveTo(rx,ry+18);ctx.quadraticCurveTo(rx+Math.sin(ra)*9,ry-5,rx+Math.cos(ra)*7,ry-28);ctx.stroke();}
        }else if(kind==='magmaMoat'){
            ctx.globalAlpha=.9;oval(0,0,800,710,art.land,'#ff7a3c',24);ctx.globalAlpha=.92;slab(-510,-510,1020,1020,'#6f3025','#ffbd75');ctx.globalAlpha=.42;ctx.strokeStyle='#ffbd75';ctx.lineWidth=22;for(var mm=-2;mm<=2;mm++){ctx.beginPath();ctx.moveTo(-490,mm*190);ctx.lineTo(490,mm*190);ctx.moveTo(mm*190,-490);ctx.lineTo(mm*190,490);ctx.stroke();}ctx.globalAlpha=.75;for(var ma=0;ma<4;ma++){var maa=ma*TAU/4;oval(Math.cos(maa)*700,Math.sin(maa)*620,95,95,'#ffb24a','#ffe09b',9);}
        }else if(kind==='gearWorks'){
            ctx.globalAlpha=.72;slab(-780,-780,1560,1560,'#786a43','#ddc06a');ctx.globalAlpha=.55;ctx.strokeStyle='#493f27';ctx.lineWidth=28;ctx.beginPath();ctx.moveTo(-950,-450);ctx.lineTo(950,-450);ctx.moveTo(-950,450);ctx.lineTo(950,450);ctx.moveTo(-450,-950);ctx.lineTo(-450,950);ctx.moveTo(450,-950);ctx.lineTo(450,950);ctx.stroke();for(var ge=0;ge<9;ge++){var gex=(ge%3-1)*470,gey=(Math.floor(ge/3)-1)*470;oval(gex,gey,95,95,'#ad9554','#ffe39a',10);oval(gex,gey,26,26,'#4a4027','#ffe39a',6);ctx.save();ctx.translate(gex,gey);for(var gt=0;gt<8;gt++){ctx.rotate(TAU/8);ctx.fillStyle='#d4b65d';ctx.fillRect(80,-12,35,24);}ctx.restore();}
        }else if(kind==='boneMoon'){
            ctx.globalAlpha=.72;oval(0,0,780,780,'#545c89','#e6e8ff',15);ctx.globalAlpha=.52;oval(90,-40,560,560,'#9da6cc','#f8f8ff',9);ctx.fillStyle='#545c89';oval(280,-190,430,430,'#545c89',null,0);ctx.globalAlpha=.62;for(var bn=0;bn<18;bn++){var bna=bn*2.17,bnr=260+(bn%4)*160, bx=Math.cos(bna)*bnr,by=Math.sin(bna)*bnr;ctx.save();ctx.translate(bx,by);ctx.rotate(bna);ctx.fillStyle='#e5dfca';ctx.fillRect(-34,-7,68,14);oval(-34,0,11,11,'#e5dfca',null,0);oval(34,0,11,11,'#e5dfca',null,0);ctx.restore();}
        }else if(kind==='fungalMoss'){
            ctx.globalAlpha=.65;var moss=[[-560,-530,390,260],[460,-550,360,270],[-520,420,420,290],[480,410,360,300],[0,-20,380,330]];for(var fm=0;fm<moss.length;fm++){var mo=moss[fm];oval(mo[0],mo[1],mo[2],mo[3],fm%2?'#536d3b':'#607b43','#b5de76',10);}ctx.globalAlpha=.72;for(var mu=0;mu<20;mu++){var mua=mu*2.41,mur=180+(mu%5)*155,mux=Math.cos(mua)*mur,muy=Math.sin(mua)*mur;ctx.fillStyle=mu%3?'#d9f59a':'#cf85e8';ctx.fillRect(mux-5,muy,10,28);ctx.beginPath();ctx.ellipse(mux,muy,24+mu%3*5,12,0,Math.PI,TAU);ctx.fill();ctx.strokeStyle='#f5ffd6';ctx.lineWidth=3;ctx.stroke();}
        }
        ctx.restore();
    }
    function drawRoomInlay(art){drawRoomInlayBody(art);}
    function drawBiomeAtmosphere(art){
        var k=currentBiome.hazard,t=visualTick,load=cosmeticLoad(),quality=effectQualityProfile(),density=quality.ambient*adaptiveCosmeticScale();if(density<=0||load>760)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
        function wrap(value,size){return((value%size)+size)%size-size*.5;}
        function ambientCount(base){return Math.max(1,Math.round(base*density));}
        if(k==='ember'){
            ctx.fillStyle='#d7b98c';for(var dust=0;dust<ambientCount(load>520?6:12);dust++){var dustX=wrap(dust*401+t*(.08+dust%3*.035),2100),dustY=wrap(dust*617-t*(.045+dust%2*.03),2100);ctx.globalAlpha=.055+(dust%3)*.025;ctx.fillRect(dustX,dustY,2+dust%2,2+dust%2);}
        }else if(k==='frost'){
            var frostCount=ambientCount(load>520?10:18);ctx.strokeStyle='#effdff';ctx.lineWidth=2;ctx.globalAlpha=.34;for(var fl=0;fl<frostCount;fl++){var fx=wrap(fl*347+t*.32,2100),fy=wrap(fl*613+t*.61,2100),fr=3+fl%4;ctx.beginPath();ctx.moveTo(fx-fr,fy);ctx.lineTo(fx+fr,fy);ctx.moveTo(fx,fy-fr);ctx.lineTo(fx,fy+fr);ctx.stroke();}
        }else if(k==='sand'){
            ctx.strokeStyle='#f2d59a';ctx.lineWidth=5;ctx.globalAlpha=.18;for(var sw=0;sw<ambientCount(9);sw++){var sy=-900+sw*225,sx=wrap(t*1.25+sw*317,2400);ctx.beginPath();ctx.moveTo(sx-240,sy);ctx.bezierCurveTo(sx-120,sy-35,sx+110,sy+35,sx+270,sy-8);ctx.stroke();}
        }else if(k==='storm'){
            ctx.strokeStyle='#ead7ff';ctx.lineWidth=3;for(var ar=0;ar<ambientCount(10);ar++){var ax=wrap(ar*401+t*.55,2100),ay=wrap(ar*683+t*.17,2100),pulse=(Math.sin(t*.09+ar*1.7)+1)*.5;ctx.globalAlpha=.08+pulse*.28;ctx.beginPath();ctx.moveTo(ax-28,ay-14);ctx.lineTo(ax-6,ay+4);ctx.lineTo(ax+7,ay-9);ctx.lineTo(ax+31,ay+12);ctx.stroke();}
        }else if(k==='void'){
            ctx.fillStyle='#ff91ce';ctx.strokeStyle='#9f56d8';ctx.lineWidth=2;for(var st=0;st<ambientCount(14);st++){var sa=st*2.399+t*.0015*(st%3+1),sr=170+(st%5)*175;ctx.globalAlpha=.13+(st%3)*.05;ctx.beginPath();ctx.arc(Math.cos(sa)*sr,Math.sin(sa)*sr*.72,2+st%2,0,TAU);ctx.fill();if(st<ambientCount(5)){ctx.beginPath();ctx.ellipse(0,0,sr,sr*.72,sa*.08,sa,sa+.55);ctx.stroke();}}
        }else if(k==='blood'){
            ctx.fillStyle='#ffb2c4';ctx.globalAlpha=.22;for(var pt=0;pt<ambientCount(13);pt++){var px=wrap(pt*421+t*.23,2100),py=wrap(pt*271+t*.48,2100),pa=t*.012+pt;ctx.save();ctx.translate(px,py);ctx.rotate(pa);ctx.beginPath();ctx.ellipse(0,0,8,3,.35,0,TAU);ctx.fill();ctx.restore();}
        }else if(k==='thorn'){
            ctx.fillStyle='#9ecf7c';ctx.globalAlpha=.2;for(var lv=0;lv<ambientCount(14);lv++){var lx=wrap(lv*389+t*.19,2100),ly=wrap(lv*557+t*.29,2100),la=Math.sin(t*.018+lv)*.8;ctx.beginPath();ctx.ellipse(lx,ly,9,4,la,0,TAU);ctx.fill();}ctx.strokeStyle='#597044';ctx.lineWidth=4;ctx.globalAlpha=.12;for(var rv=-2;rv<=2;rv++){ctx.beginPath();ctx.moveTo(-1050,rv*330);ctx.bezierCurveTo(-480,rv*250+Math.sin(t*.012+rv)*35,420,rv*360,1050,rv*270);ctx.stroke();}
        }else if(k==='tide'){
            ctx.strokeStyle='#d6ffff';ctx.lineWidth=5;ctx.globalAlpha=.16;for(var ca=-5;ca<=5;ca++){var cy=ca*190+Math.sin(t*.018+ca)*22;ctx.beginPath();ctx.moveTo(-1050,cy);ctx.bezierCurveTo(-520,cy+42,420,cy-42,1050,cy);ctx.stroke();}
        }else if(k==='cloud'){
            ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.globalAlpha=.23;for(var wi=0;wi<ambientCount(11);wi++){var wx=wrap(wi*433+t*.9,2400),wy=-900+wi*175;ctx.beginPath();ctx.moveTo(wx-105,wy);ctx.bezierCurveTo(wx-55,wy-18,wx+35,wy+18,wx+115,wy);ctx.stroke();}
        }else if(k==='glyph'){
            var glyphs=['!','?','X','|','—','O','>'];ctx.fillStyle='#ffe6a0';ctx.font='18px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';for(var gl=0;gl<ambientCount(12);gl++){var gx=wrap(gl*383+t*.12,2100),gy=wrap(gl*619-t*.16,2100);ctx.globalAlpha=.09+(Math.sin(t*.025+gl)+1)*.055;ctx.fillText(glyphs[gl%glyphs.length],gx,gy);}
        }else if(k==='mirror'){
            ctx.lineWidth=3;for(var pr=0;pr<ambientCount(12);pr++){var pra=pr*2.17+t*.002,prr=210+(pr%4)*190,prx=Math.cos(pra)*prr,pry=Math.sin(pra)*prr*.78;ctx.strokeStyle=pr%3===0?'#ffd1f5':pr%3===1?'#bdf6ff':'#fff0a8';ctx.globalAlpha=.13+(Math.sin(t*.028+pr)+1)*.07;ctx.beginPath();ctx.moveTo(prx,pry-11);ctx.lineTo(prx+10,pry+8);ctx.lineTo(prx-10,pry+8);ctx.closePath();ctx.stroke();}
        }else if(k==='neon'){
            for(var ff=0;ff<ambientCount(18);ff++){var ffx=wrap(ff*337+Math.sin(t*.018+ff)*45,2100),ffy=wrap(ff*571+Math.cos(t*.014+ff)*38,2100),fp=(Math.sin(t*.08+ff*2)+1)*.5;ctx.fillStyle=ff%3?'#48ffd0':'#d5ff77';ctx.globalAlpha=.15+fp*.38;ctx.beginPath();ctx.arc(ffx,ffy,2+fp*2,0,TAU);ctx.fill();}
        }else if(k==='magma'){
            ctx.fillStyle='#ffc06d';for(var em=0;em<ambientCount(17);em++){var ex=wrap(em*367+Math.sin(t*.021+em)*25,2100),ey=wrap(em*593-t*(.36+em%3*.12),2100),ep=(Math.sin(t*.07+em)+1)*.5;ctx.globalAlpha=.12+ep*.32;ctx.beginPath();ctx.moveTo(ex,ey-7-ep*4);ctx.lineTo(ex+4,ey+4);ctx.lineTo(ex-4,ey+4);ctx.closePath();ctx.fill();}
        }else if(k==='gear'){
            ctx.strokeStyle='#ffe5a0';ctx.lineWidth=2;ctx.globalAlpha=.16;for(var ge=0;ge<ambientCount(10);ge++){var gex=wrap(ge*463,2100),gey=wrap(ge*719,2100),ger=10+ge%3*5;ctx.save();ctx.translate(gex,gey);ctx.rotate((ge%2?1:-1)*t*.006);ctx.beginPath();ctx.arc(0,0,ger,0,TAU);ctx.stroke();for(var tooth=0;tooth<6;tooth++){ctx.rotate(TAU/6);ctx.strokeRect(ger-2,-2,7,4);}ctx.restore();}
        }else if(k==='moon'){
            var beamX=Math.sin(t*.004)*640,beam=ctx.createLinearGradient(beamX-180,-1050,beamX+180,1050);beam.addColorStop(0,'rgba(244,245,255,0)');beam.addColorStop(.48,'rgba(244,245,255,.09)');beam.addColorStop(.52,'rgba(244,245,255,.09)');beam.addColorStop(1,'rgba(244,245,255,0)');ctx.fillStyle=beam;ctx.fillRect(beamX-240,-1050,480,2100);ctx.fillStyle='#f4f5ff';for(var md=0;md<ambientCount(12);md++){ctx.globalAlpha=.1+(md%3)*.05;ctx.beginPath();ctx.arc(wrap(md*439+t*.08,2100),wrap(md*607+t*.11,2100),2,0,TAU);ctx.fill();}
        }else if(k==='spore'){
            for(var sp=0;sp<ambientCount(22);sp++){var spa=sp*2.37+t*.002*(sp%4+1),spr=150+(sp%6)*155,spx=Math.cos(spa)*spr,spy=Math.sin(spa)*spr*.8;ctx.fillStyle=sp%4===0?'#cf85e8':'#e3ffad';ctx.globalAlpha=.12+(Math.sin(t*.035+sp)+1)*.13;ctx.beginPath();ctx.arc(spx,spy,2+sp%3,0,TAU);ctx.fill();}
        }
        if(load<520){ctx.fillStyle=art.trim;for(var mote=0;mote<ambientCount(5);mote++){ctx.globalAlpha=.035+mote*.008;ctx.beginPath();ctx.arc(wrap(mote*733+t*.04,2200),wrap(mote*479-t*.025,2200),1.5+mote%2,0,TAU);ctx.fill();}}
        ctx.restore();
    }
    function drawBiomeScreenGrade(){
        if(shopMode||sceneMode!=='run'||!currentBiome)return;var art=BIOME_ART[currentBiome.hazard];if(!art||!art.grade)return;
        ctx.save();ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);ctx.fillStyle=art.grade;ctx.fillRect(0,0,viewportWidth,viewportHeight);ctx.fillStyle='rgba(0,0,0,.035)';var edge=Math.max(16,Math.min(42,Math.min(viewportWidth,viewportHeight)*.035));ctx.fillRect(0,0,viewportWidth,edge);ctx.fillRect(0,viewportHeight-edge,viewportWidth,edge);ctx.fillRect(0,edge,edge,viewportHeight-edge*2);ctx.fillRect(viewportWidth-edge,edge,edge,viewportHeight-edge*2);ctx.restore();
    }
    function drawRoomInlayBody(art){
        if(!currentLayout||art.landscape==='royalPalace')return;ctx.save();ctx.globalAlpha=.1;ctx.fillStyle=art.trim;ctx.strokeStyle=art.trim;ctx.lineWidth=18;
        if(currentLayout.inlay==='diamond'){ctx.beginPath();ctx.moveTo(0,-330);ctx.lineTo(500,0);ctx.lineTo(0,330);ctx.lineTo(-500,0);ctx.closePath();ctx.stroke();ctx.globalAlpha=.045;ctx.fill();}
        else if(currentLayout.inlay==='cross'){ctx.fillRect(-85,-780,170,1560);ctx.fillRect(-780,-85,1560,170);ctx.globalAlpha=.72;ctx.fillStyle=art.tileA;ctx.fillRect(-120,-120,240,240);ctx.globalAlpha=.45;ctx.strokeStyle=art.trim;ctx.lineWidth=8;ctx.strokeRect(-120,-120,240,240);}
        else if(currentLayout.inlay==='lane'){ctx.fillRect(-900,-150,1800,300);ctx.globalAlpha=.16;for(var lane=-1;lane<=1;lane+=2)ctx.fillRect(-900,lane*380-26,1800,52);}
        else if(currentLayout.inlay==='ring'){ctx.beginPath();ctx.arc(0,0,470,0,TAU);ctx.stroke();ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,310,0,TAU);ctx.stroke();}
        ctx.globalAlpha=.18;ctx.lineWidth=5;ctx.strokeRect(-1010,-1010,2020,2020);ctx.restore();
    }
    function drawDungeonWalls(art){
        var width=WORLD_LIMIT-ARENA_LIMIT;ctx.fillStyle=art.wall;ctx.fillRect(-WORLD_LIMIT,-WORLD_LIMIT,WORLD_LIMIT*2,width);ctx.fillRect(-WORLD_LIMIT,ARENA_LIMIT,WORLD_LIMIT*2,width);ctx.fillRect(-WORLD_LIMIT,-ARENA_LIMIT,width,ARENA_LIMIT*2);ctx.fillRect(ARENA_LIMIT,-ARENA_LIMIT,width,ARENA_LIMIT*2);
        ctx.fillStyle=art.wallTop;ctx.fillRect(-WORLD_LIMIT,-ARENA_LIMIT-22,WORLD_LIMIT*2,22);ctx.fillRect(-WORLD_LIMIT,ARENA_LIMIT,WORLD_LIMIT*2,22);ctx.fillRect(-ARENA_LIMIT-22,-ARENA_LIMIT,22,ARENA_LIMIT*2);ctx.fillRect(ARENA_LIMIT,-ARENA_LIMIT,22,ARENA_LIMIT*2);
        ctx.strokeStyle=art.seam;ctx.lineWidth=3;ctx.beginPath();for(var b=-WORLD_LIMIT;b<WORLD_LIMIT;b+=110){ctx.rect(b,-WORLD_LIMIT,110,width);ctx.rect(b,ARENA_LIMIT,110,width);ctx.rect(-WORLD_LIMIT,b,width,110);ctx.rect(ARENA_LIMIT,b,width,110);}ctx.stroke();ctx.strokeStyle=art.trim;ctx.lineWidth=5;ctx.strokeRect(-ARENA_LIMIT,-ARENA_LIMIT,ARENA_LIMIT*2,ARENA_LIMIT*2);
        ctx.fillStyle=art.trim;var corners=[[-ARENA_LIMIT,-ARENA_LIMIT],[ARENA_LIMIT,-ARENA_LIMIT],[-ARENA_LIMIT,ARENA_LIMIT],[ARENA_LIMIT,ARENA_LIMIT]];for(var c=0;c<corners.length;c++){ctx.fillRect(corners[c][0]-18,corners[c][1]-18,36,36);ctx.fillStyle=art.wallTop;ctx.fillRect(corners[c][0]-12,corners[c][1]-12,24,24);ctx.fillStyle=art.trim;}
        var gates=[[-ARENA_LIMIT,-720,'v'],[-ARENA_LIMIT,0,'v'],[-ARENA_LIMIT,720,'v'],[ARENA_LIMIT,-720,'v'],[ARENA_LIMIT,0,'v'],[ARENA_LIMIT,720,'v'],[-420,-ARENA_LIMIT,'h'],[420,-ARENA_LIMIT,'h'],[-420,ARENA_LIMIT,'h'],[420,ARENA_LIMIT,'h']];for(var g=0;g<gates.length;g++){var gate=gates[g];ctx.fillStyle=art.wallTop;if(gate[2]==='v'){ctx.fillRect(gate[0]-16,gate[1]-54,32,108);ctx.fillStyle=art.trim;ctx.fillRect(gate[0]-21,gate[1]-59,42,14);ctx.fillRect(gate[0]-21,gate[1]+45,42,14);}else{ctx.fillRect(gate[0]-54,gate[1]-16,108,32);ctx.fillStyle=art.trim;ctx.fillRect(gate[0]-59,gate[1]-21,14,42);ctx.fillRect(gate[0]+45,gate[1]-21,14,42);}}
        if(art.landscape==='royalPalace'){
            ctx.save();
            function verticalWindow(x,y,side){ctx.globalAlpha=.16;ctx.fillStyle='#e2d0b5';ctx.fillRect(x-side*25,y-69,side*50,138);ctx.globalAlpha=1;ctx.fillStyle='#0a0909';ctx.strokeStyle='#66575c';ctx.lineWidth=5;ctx.fillRect(x-side*11,y-58,side*22,116);ctx.strokeRect(x-side*15,y-62,side*30,124);ctx.fillStyle='#d4c3a8';ctx.globalAlpha=.76;ctx.fillRect(x-side*8,y-43,side*16,86);ctx.globalAlpha=1;ctx.strokeStyle='#312a2d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-43);ctx.lineTo(x,y+43);ctx.moveTo(x-side*8,y);ctx.lineTo(x+side*8,y);ctx.stroke();}
            function horizontalWindow(x,y,side){ctx.globalAlpha=.16;ctx.fillStyle='#e2d0b5';ctx.fillRect(x-69,y-side*25,138,side*50);ctx.globalAlpha=1;ctx.fillStyle='#0a0909';ctx.strokeStyle='#66575c';ctx.lineWidth=5;ctx.fillRect(x-58,y-side*11,116,side*22);ctx.strokeRect(x-62,y-side*15,124,side*30);ctx.fillStyle='#d4c3a8';ctx.globalAlpha=.76;ctx.fillRect(x-43,y-side*8,86,side*16);ctx.globalAlpha=1;ctx.strokeStyle='#312a2d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-43,y);ctx.lineTo(x+43,y);ctx.moveTo(x,y-side*8);ctx.lineTo(x,y+side*8);ctx.stroke();}
            [-610,0,610].forEach(function(y){verticalWindow(-ARENA_LIMIT+6,y,1);verticalWindow(ARENA_LIMIT-6,y,-1);});[-610,0,610].forEach(function(x){horizontalWindow(x,-ARENA_LIMIT+6,1);horizontalWindow(x,ARENA_LIMIT-6,-1);});ctx.restore();
        }
    }
    function drawEnemyNavigator(){if(shopMode||enemies.length<1||enemies.length>=4||!player)return false;var nearest=closestEnemy(player.x,player.y,Infinity),screenRadius=Math.min(viewportWidth,viewportHeight)/currentZoom*.41;if(!nearest)return false;var dx=nearest.x-player.x,dy=nearest.y-player.y,d=Math.hypot(dx,dy);if(d<screenRadius*.72)return false;var angle=Math.atan2(dy,dx),cx=player.x+Math.cos(angle)*screenRadius,cy=player.y+Math.sin(angle)*screenRadius;ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.globalAlpha=.7+.2*Math.sin(visualTick*.1);ctx.fillStyle=currentBiome.accent;ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-9,-8);ctx.lineTo(-4,0);ctx.lineTo(-9,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-angle);ctx.font='7px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.fillStyle='#fff';var label=Math.round(d/10)+'m';ctx.strokeText(label,0,-16);ctx.fillText(label,0,-16);ctx.restore();return true;}
    function drawBloodCompass(){if(shopMode||!player||!player.passives.bloodCompass)return false;var wounded=null,woundedRatio=.66;for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead)continue;var ratio=e.hp/e.maxHp;if(ratio<woundedRatio){wounded=e;woundedRatio=ratio;}}if(!wounded)return false;var angle=Math.atan2(wounded.y-player.y,wounded.x-player.x),radius=45;ctx.save();ctx.translate(player.x+Math.cos(angle)*radius,player.y+Math.sin(angle)*radius);ctx.rotate(angle);ctx.globalAlpha=.86;ctx.fillStyle='#ff718f';ctx.strokeStyle='#2b0710';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-8,-6);ctx.lineTo(-3,0);ctx.lineTo(-8,6);ctx.closePath();ctx.fill();ctx.stroke();ctx.rotate(-angle);ctx.fillStyle='#fff';ctx.font='6px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';ctx.fillText(Math.ceil(woundedRatio*100)+'%',0,-11);ctx.restore();return true;}
    function drawSocialFloor(kind){
        var armory=kind==='armory',base=armory?'#131a1d':'#09262b',tileA=armory?'#202a2d':'#103c43',tileB=armory?'#1b2427':'#0d343a',line=armory?'#526266':'#2b6972',trim=armory?'#a8823e':'#64abb3',tile=128;
        ctx.fillStyle=base;ctx.fillRect(camera.x-160,camera.y-160,viewportWidth/currentZoom+320,viewportHeight/currentZoom+320);var sx=Math.floor((camera.x-128)/tile)*tile,sy=Math.floor((camera.y-128)/tile)*tile,vw=viewportWidth/currentZoom+256,vh=viewportHeight/currentZoom+256;
        for(var fx=sx;fx<sx+vw;fx+=tile)for(var fy=sy;fy<sy+vh;fy+=tile){ctx.fillStyle=((Math.floor(fx/tile)+Math.floor(fy/tile))&1)?tileA:tileB;ctx.fillRect(fx,fy,tile,tile);ctx.strokeStyle=line;ctx.globalAlpha=.28;ctx.lineWidth=2;ctx.strokeRect(fx,fy,tile,tile);ctx.globalAlpha=1;}
        ctx.fillStyle=armory?'#0d1417':'#071b1f';ctx.fillRect(-ARENA_LIMIT,-ARENA_LIMIT,ARENA_LIMIT*2,92);ctx.fillRect(-ARENA_LIMIT,ARENA_LIMIT-92,ARENA_LIMIT*2,92);ctx.fillRect(-ARENA_LIMIT,-ARENA_LIMIT,92,ARENA_LIMIT*2);ctx.fillRect(ARENA_LIMIT-92,-ARENA_LIMIT,92,ARENA_LIMIT*2);ctx.strokeStyle=trim;ctx.lineWidth=8;ctx.strokeRect(-ARENA_LIMIT+92,-ARENA_LIMIT+92,(ARENA_LIMIT-92)*2,(ARENA_LIMIT-92)*2);
        ctx.save();ctx.globalAlpha=.72;ctx.strokeStyle=trim;ctx.fillStyle=armory?'#202a2d':'#113f48';ctx.lineWidth=7;
        if(armory){
            ctx.fillRect(-760,-510,1520,1020);ctx.strokeRect(-760,-510,1520,1020);ctx.globalAlpha=.28;ctx.fillStyle='#674f28';ctx.fillRect(-700,-450,1400,900);ctx.globalAlpha=.7;for(var rail=-2;rail<=2;rail++){ctx.fillStyle=rail%2?'#293639':'#303f42';ctx.fillRect(-690,rail*155-32,1380,64);}ctx.fillStyle='#a8823e';ctx.beginPath();ctx.arc(0,0,132,0,TAU);ctx.fill();ctx.fillStyle='#171f22';ctx.beginPath();ctx.arc(0,0,102,0,TAU);ctx.fill();ctx.strokeStyle='#d6bb75';ctx.beginPath();ctx.moveTo(-56,26);ctx.lineTo(42,26);ctx.lineTo(74,-5);ctx.lineTo(40,-20);ctx.lineTo(-45,-20);ctx.closePath();ctx.stroke();
        }else{
            ctx.fillRect(-680,-610,1360,1220);ctx.strokeRect(-680,-610,1360,1220);ctx.globalAlpha=.25;ctx.fillStyle='#347079';ctx.fillRect(-610,-540,1220,1080);ctx.globalAlpha=.7;ctx.strokeStyle='#8acbd0';ctx.lineWidth=5;ctx.strokeRect(-300,-235,600,470);ctx.fillStyle='#b78c25';ctx.beginPath();ctx.arc(0,0,104,0,TAU);ctx.fill();ctx.fillStyle='#e8d77f';ctx.beginPath();ctx.moveTo(-23,-42);ctx.lineTo(50,0);ctx.lineTo(-23,42);ctx.closePath();ctx.fill();ctx.strokeStyle='#604600';ctx.lineWidth=6;ctx.stroke();for(var bench=-1;bench<=1;bench+=2){ctx.fillStyle='#1b353b';ctx.fillRect(bench*430-90,-260,180,520);ctx.strokeStyle='#64abb3';ctx.strokeRect(bench*430-90,-260,180,520);}}
        ctx.restore();
    }
    function drawWeaponTestFloor(){
        var tile=120,viewWidth=viewportWidth/currentZoom+tile*2,viewHeight=viewportHeight/currentZoom+tile*2,startX=Math.floor((camera.x-tile)/tile)*tile,startY=Math.floor((camera.y-tile)/tile)*tile;
        ctx.fillStyle='#151719';ctx.fillRect(camera.x-tile,camera.y-tile,viewWidth,viewHeight);
        ctx.lineWidth=2;ctx.strokeStyle='#292c30';ctx.beginPath();for(var x=startX;x<startX+viewWidth;x+=tile){ctx.moveTo(x,startY);ctx.lineTo(x,startY+viewHeight);}for(var y=startY;y<startY+viewHeight;y+=tile){ctx.moveTo(startX,y);ctx.lineTo(startX+viewWidth,y);}ctx.stroke();
        ctx.fillStyle='#202327';ctx.fillRect(-760,-690,1520,1380);ctx.strokeStyle='#656a70';ctx.lineWidth=7;ctx.strokeRect(-760,-690,1520,1380);
        ctx.globalAlpha=.44;ctx.strokeStyle='#858a90';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-720,0);ctx.lineTo(720,0);ctx.moveTo(0,-650);ctx.lineTo(0,650);ctx.stroke();
        ctx.strokeStyle='#575c62';ctx.lineWidth=2;[180,360,540].forEach(function(radius){ctx.beginPath();ctx.arc(0,310,radius,Math.PI,TAU);ctx.stroke();});ctx.globalAlpha=1;
        ctx.fillStyle='#9da2a8';ctx.font='8px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.textAlign='center';ctx.fillText('CONTROLLED WEAPON TEST',0,615);ctx.fillStyle='#666b71';ctx.font='6px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.fillText('RANGE MARKERS 180 / 360 / 540',0,642);
    }
    function drawPartyPlayers(){var list=partyPlayers();for(var i=0;i<list.length;i++){var member=list[i];if(!member)continue;member.draw();if(runtimeSettings.playerNames!=='off'){ctx.save();ctx.textAlign='center';ctx.font='7px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#111';ctx.fillStyle=member.downed?'#ff8d8d':member.color;var label=(member.playerName||('P'+(member.slot+1)))+(member.downed?' · DOWN':'');ctx.strokeText(label,member.x,member.y-34);ctx.fillText(label,member.x,member.y-34);ctx.restore();}if(member.downed){ctx.save();ctx.globalAlpha=.72;ctx.strokeStyle=member.color;ctx.lineWidth=5;ctx.beginPath();ctx.arc(member.x,member.y,27,-Math.PI/2,-Math.PI/2+TAU*clamp(member.reviveProgress/120,0,1));ctx.stroke();ctx.restore();}}}

    function cosmeticLoad(){return bullets.length+particles.length+enemies.length*3+effects.length*2;}
    function drawParticleList(){var load=cosmeticLoad(),qualityStride=runtimeSettings.effectQuality==='low'?3:runtimeSettings.effectQuality==='balanced'?2:1,stride=Math.max(qualityStride,load>620?3:load>390?2:1);for(var i=0;i<particles.length;i+=stride){var p=particles[i];if(!p||p.dead)continue;if(isWorldVisible(p.x,p.y,18)){p.draw();perfStats.drawnEntities++;}else perfStats.culledDraws++;}}

    function drawStaticBiomeFloor(){
        if(sceneMode==='lobby'||sceneMode==='armory'){drawSocialFloor(sceneMode);return;}
        if(sceneMode==='editorTest'){drawWeaponTestFloor();return;}
        var art=BIOME_ART[currentBiome.hazard],tile=128,vw=viewportWidth/currentZoom+tile*2,vh=viewportHeight/currentZoom+tile*2,sx=Math.floor((camera.x-tile)/tile)*tile,sy=Math.floor((camera.y-tile)/tile)*tile,cosmetic=cosmeticLoad();ctx.fillStyle=currentBiome.floor;ctx.fillRect(camera.x-tile,camera.y-tile,vw,vh);ctx.lineWidth=2;
        for(var x=sx;x<sx+vw;x+=tile)for(var y=sy;y<sy+vh;y+=tile){if(x>ARENA_LIMIT||y>ARENA_LIMIT||x+tile<-ARENA_LIMIT||y+tile<-ARENA_LIMIT)continue;var tx=Math.floor(x/tile),ty=Math.floor(y/tile),seed=floorHash(tx,ty);ctx.fillStyle=((tx+ty)&1)?art.tileA:art.tileB;ctx.fillRect(x,y,tile,tile);ctx.strokeStyle=art.seam;ctx.globalAlpha=.18;ctx.strokeRect(x,y,tile,tile);ctx.globalAlpha=1;if(cosmetic<420||((tx+ty)&1)===0)drawFloorMotif(x+tile*.5,y+tile*.5,art,seed);}drawBiomeLandscape(art);drawBiomeAtmosphere(art);drawRoomInlay(art);drawDungeonWalls(art);
    }

    function drawFloor() {
        drawStaticBiomeFloor();return;
        ctx.fillStyle=currentBiome.floor;ctx.fillRect(camera.x-100,camera.y-100,viewportWidth/currentZoom+200,viewportHeight/currentZoom+200);var grid=100,sx=Math.floor(camera.x/grid)*grid,sy=Math.floor(camera.y/grid)*grid,vw=viewportWidth/currentZoom+grid*2,vh=viewportHeight/currentZoom+grid*2;ctx.strokeStyle=currentBiome.grid;ctx.lineWidth=1;ctx.beginPath();for(var x=sx;x<sx+vw;x+=grid)for(var y=sy;y<sy+vh;y+=grid)if(Math.abs(x)<=WORLD_LIMIT&&Math.abs(y)<=WORLD_LIMIT)ctx.rect(x,y,grid,grid);ctx.stroke();
        ctx.save();ctx.globalAlpha=.13;ctx.strokeStyle=currentBiome.accent;ctx.fillStyle=currentBiome.accent;ctx.lineWidth=2;
        if(currentBiome.hazard==='ember'){for(var ex=sx;ex<sx+vw;ex+=200)for(var ey=sy;ey<sy+vh;ey+=200){ctx.beginPath();ctx.arc(ex+100,ey+100,28,0,TAU);ctx.stroke();for(var er=0;er<6;er++){var era=er*TAU/6;ctx.beginPath();ctx.moveTo(ex+100+Math.cos(era)*34,ey+100+Math.sin(era)*34);ctx.lineTo(ex+100+Math.cos(era)*52,ey+100+Math.sin(era)*52);ctx.stroke();}}}
        else if(currentBiome.hazard==='frost'){for(var fx=sx;fx<sx+vw;fx+=160)for(var fy=sy;fy<sy+vh;fy+=160){ctx.beginPath();for(var fl=0;fl<6;fl++){var fa=fl*TAU/6;ctx.moveTo(fx+80,fy+80);ctx.lineTo(fx+80+Math.cos(fa)*38,fy+80+Math.sin(fa)*38);}ctx.stroke();}}
        else if(currentBiome.hazard==='storm'){for(var ax=sx;ax<sx+vw;ax+=180)for(var ay=sy;ay<sy+vh;ay+=180){ctx.beginPath();ctx.moveTo(ax+42,ay+32);ctx.lineTo(ax+96,ay+66);ctx.lineTo(ax+70,ay+92);ctx.lineTo(ax+132,ay+132);ctx.stroke();}}
        else if(currentBiome.hazard==='void'){for(var vx=sx;vx<sx+vw;vx+=210)for(var vy=sy;vy<sy+vh;vy+=210){ctx.beginPath();ctx.ellipse(vx+105,vy+105,48,18,(vx+vy)*.001,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(vx+105,vy+105,9,0,TAU);ctx.fill();}}
        else if(currentBiome.hazard==='thorn'){for(var vr=sx;vr<sx+vw;vr+=200){ctx.beginPath();ctx.moveTo(vr,sy);ctx.bezierCurveTo(vr+70,sy+vh*.3,vr-60,sy+vh*.7,vr+30,sy+vh);ctx.stroke();}}
        else if(currentBiome.hazard==='tide'){for(var wt=sy;wt<sy+vh;wt+=48){ctx.beginPath();ctx.moveTo(sx,wt);ctx.bezierCurveTo(sx+vw*.3,wt+18,sx+vw*.7,wt-18,sx+vw,wt);ctx.stroke();}}
        else if(currentBiome.hazard==='glyph'){for(var gx=sx;gx<sx+vw;gx+=200)for(var gy=sy;gy<sy+vh;gy+=200){ctx.strokeRect(gx+55,gy+55,38,38);ctx.beginPath();ctx.moveTo(gx+55,gy+55);ctx.lineTo(gx+93,gy+93);ctx.moveTo(gx+93,gy+55);ctx.lineTo(gx+55,gy+93);ctx.stroke();}}
        else if(currentBiome.hazard==='mirror'){for(var mx=sx;mx<sx+vw;mx+=200)for(var my=sy;my<sy+vh;my+=200){ctx.beginPath();ctx.moveTo(mx+80,my+38);ctx.lineTo(mx+112,my+92);ctx.lineTo(mx+49,my+92);ctx.closePath();ctx.stroke();}}
        else if(currentBiome.hazard==='magma'){for(var magx=sx;magx<sx+vw;magx+=190)for(var magy=sy;magy<sy+vh;magy+=190){ctx.beginPath();ctx.moveTo(magx+20,magy+65);ctx.lineTo(magx+72,magy+42);ctx.lineTo(magx+118,magy+86);ctx.lineTo(magx+168,magy+58);ctx.stroke();ctx.beginPath();ctx.arc(magx+95,magy+95,18,0,TAU);ctx.stroke();}}
        else if(currentBiome.hazard==='gear'){for(var grx=sx;grx<sx+vw;grx+=180)for(var gry=sy;gry<sy+vh;gry+=180){ctx.beginPath();ctx.arc(grx+90,gry+90,34,0,TAU);ctx.stroke();for(var grt=0;grt<8;grt++){var gra=grt*TAU/8;ctx.strokeRect(grx+90+Math.cos(gra)*39-4,gry+90+Math.sin(gra)*39-4,8,8);}}}
        else if(currentBiome.hazard==='moon'){for(var mnx=sx;mnx<sx+vw;mnx+=200)for(var mny=sy;mny<sy+vh;mny+=200){ctx.beginPath();ctx.arc(mnx+92,mny+92,37,-1.2,1.2);ctx.arc(mnx+108,mny+92,30,1.2,-1.2,true);ctx.stroke();ctx.beginPath();ctx.arc(mnx+55,mny+48,3,0,TAU);ctx.arc(mnx+148,mny+135,2,0,TAU);ctx.fill();}}
        else if(currentBiome.hazard==='spore'){for(var sptx=sx;sptx<sx+vw;sptx+=170)for(var spty=sy;spty<sy+vh;spty+=170){for(var spfl=0;spfl<6;spfl++){var spfa=spfl*TAU/6;ctx.beginPath();ctx.arc(sptx+85+Math.cos(spfa)*30,spty+85+Math.sin(spfa)*25,4+spfl%2*2,0,TAU);ctx.stroke();}}}
        ctx.restore();ctx.strokeStyle=currentBiome.edge;ctx.lineWidth=4;ctx.strokeRect(-WORLD_LIMIT,-WORLD_LIMIT,WORLD_LIMIT*2,WORLD_LIMIT*2);
    }
    function drawGame() {
        perfStats.culledDraws=0;perfStats.drawnEntities=0;ctx.save();ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);ctx.fillStyle=currentBiome.floor;ctx.fillRect(0,0,viewportWidth,viewportHeight);ctx.scale(currentZoom,currentZoom);ctx.translate(-camera.x,-camera.y);drawFloor();drawWorldList(roomDecor,70);drawWorldList(hazards,90);drawWorldList(biomeProps,55);drawWorldList(obstacles,55);drawWorldList(pickups,18);drawWorldList(totems,30);drawWorldList(bullets,28);drawWorldList(radiantWeapons,120);drawMarionetteStrings();drawWorldList(enemies,35);drawPartyPlayers();drawWorldList(slashes,260);drawParticleList();drawEffects();drawEnemyNavigator();drawBloodCompass();ctx.restore();drawBiomeScreenGrade();if(palaceCutscene.active){ctx.save();ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);var bar=Math.max(42,viewportHeight*.075);ctx.fillStyle='rgba(0,0,0,.88)';ctx.fillRect(0,0,viewportWidth,bar);ctx.fillRect(0,viewportHeight-bar,viewportWidth,bar);if(palaceCutscene.titleAlpha>0){ctx.globalAlpha=palaceCutscene.titleAlpha;ctx.textAlign='center';ctx.fillStyle='#f0e8e7';ctx.font='16px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.fillText('DARK SPIRIT',viewportWidth/2,bar+48);ctx.fillStyle='#c93645';ctx.font='7px "Noto Sans JP", "Noto Sans Thai", "Ubuntu", sans-serif';ctx.fillText("THE KNIGHT'S LAST SHADOW",viewportWidth/2,bar+70);}ctx.restore();}
    }

    function localInputState(){var dx=0,dy=0;if(keys.w)dy-=1;if(keys.s)dy+=1;if(keys.a)dx-=1;if(keys.d)dx+=1;if(joystick.active){dx=joystick.x;dy=joystick.y;}var aim=player?player.angle:0,aimTarget=null;if(aimJoystick.active&&aimJoystick.strength>.12)aim=aimJoystick.angle;else if(player&&!joystick.active&&!isTouchDevice()){var worldMouseX=mouse.x/currentZoom+camera.x,worldMouseY=mouse.y/currentZoom+camera.y;aim=Math.atan2(worldMouseY-player.y,worldMouseX-player.x);}else if(player){aimTarget=closestEnemy(player.x,player.y,520);if(aimTarget)aim=Math.atan2(aimTarget.y-player.y,aimTarget.x-player.x);else if(dx||dy)aim=Math.atan2(dy,dx);}return{dx:dx,dy:dy,angle:aim,fire:!!(keys.attack||mouse.down||buttons.fire||(mobileAimFireEnabled()&&aimJoystick.active&&aimJoystick.strength>.12)||(mobileAutoFireEnabled()&&aimTarget)),dash:!!(keys.space||buttons.dash),switch:!!(keys.q||buttons.switch),ability:!!(keys.e||buttons.ability),at:Date.now()};}
    function sanitizeNetworkInput(input){input=input||{};var dx=clamp(Number(input.dx)||0,-1,1),dy=clamp(Number(input.dy)||0,-1,1),length=Math.hypot(dx,dy);if(length>1){dx/=length;dy/=length;}return{dx:dx,dy:dy,angle:isFinite(input.angle)?Number(input.angle):0,fire:!!input.fire,dash:!!input.dash,switch:!!input.switch,ability:!!input.ability,x:typeof input.x==='number'&&isFinite(input.x)?Number(input.x):null,y:typeof input.y==='number'&&isFinite(input.y)?Number(input.y):null,seq:Math.max(0,Math.floor(Number(input.seq)||0)),receivedAt:performance.now()};}
    function networkInputSignature(input){return[Math.round((Number(input.dx)||0)*10),Math.round((Number(input.dy)||0)*10),input.fire?1:0,input.dash?1:0,input.switch?1:0,input.ability?1:0].join(':');}
    function sendLocalInput(input){if(networkRole!=='guest'||!window.DKNet||!player)return;var baseX=player.x-netExternalApplied.x,baseY=player.y-netExternalApplied.y;input=Object.assign({},input,{seq:++netInputSeq,sentAt:performance.now(),x:baseX,y:baseY});netPredictionHistory.push({seq:input.seq,x:baseX,y:baseY,sentAt:input.sentAt});if(netPredictionHistory.length>120)netPredictionHistory.splice(0,netPredictionHistory.length-120);window.DKNet.sendToHost({type:'input',input:input},{droppable:true});}
    function pumpLocalInput(input,step){netInputClock+=step;var signature=networkInputSignature(input),changed=signature!==netLastInputSignature;if(changed||netInputClock>=NET_INPUT_FRAMES){netInputClock=0;netLastInputSignature=signature;sendLocalInput(input);}}
    function applyPredictionCorrection(step){
        if(!player)return;var distance=Math.hypot(netPredictionError.x,netPredictionError.y);if(distance<=NET_PREDICTION_DEADZONE){netPredictionError.x=0;netPredictionError.y=0;return;}if(distance>NET_PREDICTION_HARD_SNAP){player.x+=netPredictionError.x;player.y+=netPredictionError.y;netPredictionError.x=0;netPredictionError.y=0;}else{var blend=frameBlend(distance>48?.32:distance>16?.24:.18,step),moveX=netPredictionError.x*blend,moveY=netPredictionError.y*blend,moveDistance=Math.hypot(moveX,moveY),maxMove=Math.min(14,6+distance*.06)*clamp(step,.5,2);if(moveDistance>maxMove){moveX=moveX/moveDistance*maxMove;moveY=moveY/moveDistance*maxMove;}player.x+=moveX;player.y+=moveY;netPredictionError.x-=moveX;netPredictionError.y-=moveY;}player.resolveObstacles();player.x=clamp(player.x,-ARENA_LIMIT+105,ARENA_LIMIT-105);player.y=clamp(player.y,-ARENA_LIMIT+105,ARENA_LIMIT-105);
    }
    function applyOwnedExternalCorrection(step){
        if(!player||networkRole!=='guest')return;var dx=netExternalTarget.x-netExternalApplied.x,dy=netExternalTarget.y-netExternalApplied.y,distance=Math.hypot(dx,dy);if(distance<.05){netExternalApplied.x=netExternalTarget.x;netExternalApplied.y=netExternalTarget.y;return;}var blend=frameBlend(distance>48?.3:distance>16?.24:.18,step),moveX=dx*blend,moveY=dy*blend,moveDistance=Math.hypot(moveX,moveY),maxMove=Math.min(16,5+distance*.08)*clamp(step,.5,2);if(moveDistance>maxMove){moveX=moveX/moveDistance*maxMove;moveY=moveY/moveDistance*maxMove;}player.x+=moveX;player.y+=moveY;netExternalApplied.x+=moveX;netExternalApplied.y+=moveY;player.resolveObstacles();player.x=clamp(player.x,-ARENA_LIMIT+105,ARENA_LIMIT-105);player.y=clamp(player.y,-ARENA_LIMIT+105,ARENA_LIMIT-105);
    }
    function advanceNetworkEntity(entity,step,blendBase){if(!entity)return;var age=entity._netLastSnapshotAt?performance.now()-entity._netLastSnapshotAt:0,velocityScale=age>280?0:age>140?1-(age-140)/140:1,vx=(isFinite(entity._netVx)?Number(entity._netVx):(Number(entity.vx)||0))*velocityScale,vy=(isFinite(entity._netVy)?Number(entity._netVy):(Number(entity.vy)||0))*velocityScale;entity.x+=vx*step;entity.y+=vy*step;var blend=frameBlend(blendBase||.18,step);entity.x+=(Number(entity._netCorrectionX)||0)*blend;entity.y+=(Number(entity._netCorrectionY)||0)*blend;entity._netCorrectionX=(Number(entity._netCorrectionX)||0)*(1-blend);entity._netCorrectionY=(Number(entity._netCorrectionY)||0)*(1-blend);}
    function updateSimplePlayer(member,input,step,now,allowCombat,skipOwnedMovement){
        if(!member||member.downed)return;input=input||{};var dx=Number(input.dx)||0,dy=Number(input.dy)||0;member.angle=isFinite(input.angle)?input.angle:member.angle;
        if(member.dashCooldown>0)member.dashCooldown-=step;if(member.invuln>0)member.invuln-=step;if(member.attackAnim>0)member.attackAnim=Math.max(0,member.attackAnim-step);if(member.meleeGuard>0)member.meleeGuard-=step;if(member.overclock>0)member.overclock-=step;if(member.echoSealTimer>0)member.echoSealTimer-=step;if(member.arsenalTempo>0)member.arsenalTempo-=step;if(member.berserk>0)member.berserk-=step;if(member.roomBoonTimer>0)member.roomBoonTimer-=step;if(member.resonanceTimer>0)member.resonanceTimer=Math.max(0,member.resonanceTimer-step);if(member.bladeHaloTimer>0){member.bladeHaloTimer-=step;if(networkRole==='guest')member.bladeHaloAngle+=.055*step;else withActivePlayer(member,function(){member.updateBladeHalo(step);});}member.wardAngle+=.035*step;var cooldownIds=Object.keys(member.activeCooldowns);for(var cooldownIndex=0;cooldownIndex<cooldownIds.length;cooldownIndex++){var cooldownId=cooldownIds[cooldownIndex];member.activeCooldowns[cooldownId]=Math.max(0,(member.activeCooldowns[cooldownId]||0)-step);}member.activeCooldown=member.active?(member.activeCooldowns[member.active]||0):0;
        if(input.switch&&!member._netSwitch){withActivePlayer(member,function(){member.switchWeapon();});}member._netSwitch=!!input.switch;
        if(!shopMode&&input.ability&&!member._netAbility){withActivePlayer(member,function(){member.useActive();});}member._netAbility=!!input.ability;
        if(!shopMode&&input.dash&&!member._netDash&&member.dashCooldown<=0){withActivePlayer(member,function(){member.startDash(dx,dy);});}member._netDash=!!input.dash;
        if(member.isDashing){if(!skipOwnedMovement){member.x+=member.dashVector.x*step;member.y+=member.dashVector.y*step;}member.dashTime-=step;if(member.cores.tide)for(var tideIndex=0;tideIndex<bullets.length;tideIndex++){var incoming=bullets[tideIndex];if(!incoming.dead&&!incoming.friendly&&Math.hypot(incoming.x-member.x,incoming.y-member.y)<42){incoming.friendly=true;incoming.ownerId=member.netId;incoming.vx*=-1.35;incoming.vy*=-1.35;incoming.damage=Math.max(3,incoming.damage*1.8);incoming.color='#bffcff';incoming.sourceId='tideCore';}}if(member.passives.dashCapacitor&&intervalElapsed(member,'dashTrailClock',step,3))withActivePlayer(member,function(){explode(member.x,member.y,36,2.3,true,'#74b9ff','shock',false);});if(member.dashTime<=0)member.isDashing=false;}
        else if((dx||dy)&&!skipOwnedMovement){var len=Math.hypot(dx,dy)||1,move=member.baseSpeed*(1+member.stats.speed)*(shopMode?1:(member.terrainSlow||1)*(member.arsenalTempo>0?1.15:1));member.x+=dx/len*move*step;member.y+=dy/len*move*step;}
        member.resolveObstacles();if(shopMode){member.x=clamp(member.x,shopCenter.x-820,shopCenter.x+820);member.y=clamp(member.y,shopCenter.y-440,shopCenter.y+660);}else{member.x=clamp(member.x,-ARENA_LIMIT+105,ARENA_LIMIT-105);member.y=clamp(member.y,-ARENA_LIMIT+105,ARENA_LIMIT-105);}
        var armoryContext=shopMode&&(Math.hypot(member.x-shopForge.x,member.y-shopForge.y)<146||Math.hypot(member.x-shopCraft.x,member.y-shopCraft.y)<154||shopPlatforms.some(function(platform){return Math.hypot(member.x-platform.x,member.y-platform.y)<148;}));if(allowCombat&&!armoryContext&&member.weapon){var beforePending=pendingShots.length;withActivePlayer(member,function(){processWeaponFiring(member,!!input.fire,step,now);});for(var p=beforePending;p<pendingShots.length;p++)pendingShots[p].ownerId=member.netId;}else if(member.weapon)member.wasFiring=false;
        if(member.hp<member.maxHp){if(member.regenDelay>0)member.regenDelay-=step;else{member.regenTimer+=step;if(member.regenTimer>=480){member.hp=Math.min(member.maxHp,member.hp+1);member.regenTimer=0;}}}member.updateArmorRegen(step);if(member.passives.orbitingWard)withActivePlayer(member,function(){member.updateWard(step);});
    }
    function acceptOwnedPosition(member,input,clock){
        if(!member||typeof input.x!=='number'||typeof input.y!=='number'||!isFinite(input.x)||!isFinite(input.y))return false;
        var requestedX=Number(input.x),requestedY=Number(input.y),baseX=isFinite(member._ownerAcceptedX)?member._ownerAcceptedX:(isFinite(member._ownerBaseX)?member._ownerBaseX:member.x),baseY=isFinite(member._ownerAcceptedY)?member._ownerAcceptedY:(isFinite(member._ownerBaseY)?member._ownerBaseY:member.y),elapsedMs=Math.max(16.67,clock-(member._ownerPacketAt||clock-33.34)),frames=clamp(elapsedMs/16.6667,1,18),distance=Math.hypot(requestedX-baseX,requestedY-baseY),limit=NET_OWNER_PACKET_LIMIT+frames*18;
        if(distance>limit){var ratio=limit/(distance||1);requestedX=baseX+(requestedX-baseX)*ratio;requestedY=baseY+(requestedY-baseY)*ratio;member._ownerRejected=(member._ownerRejected||0)+1;}
        requestedX=clamp(requestedX,shopMode?shopCenter.x-820:-ARENA_LIMIT+105,shopMode?shopCenter.x+820:ARENA_LIMIT-105);requestedY=clamp(requestedY,shopMode?shopCenter.y-440:-ARENA_LIMIT+105,shopMode?shopCenter.y+660:ARENA_LIMIT-105);
        member._ownerVx=(requestedX-baseX)/frames;member._ownerVy=(requestedY-baseY)/frames;member._ownerAcceptedX=requestedX;member._ownerAcceptedY=requestedY;member._ownerTargetX=requestedX;member._ownerTargetY=requestedY;member._ownerPacketAt=clock;if(!isFinite(member._ownerBaseX))member._ownerBaseX=member.x-(Number(member._ownerOffsetX)||0);if(!isFinite(member._ownerBaseY))member._ownerBaseY=member.y-(Number(member._ownerOffsetY)||0);return true;
    }
    function prepareRemoteOwnedMovement(step){
        if(networkRole!=='host')return;var clock=performance.now();Object.keys(remotePlayers).forEach(function(id){var member=remotePlayers[id],input=remoteInputs[id]||{},sequence=Math.max(0,Number(input.seq)||0),isNewInput=sequence>(member.lastProcessedInputSeq||0);if(isNewInput&&acceptOwnedPosition(member,input,clock)){member.lastProcessedInputSeq=sequence;member.lastProcessedInputX=member._ownerAcceptedX;member.lastProcessedInputY=member._ownerAcceptedY;}if(!isFinite(member._ownerTargetX)||!isFinite(member._ownerTargetY))return;var age=clock-(member._ownerPacketAt||clock),lead=clamp(age/16.6667,0,age>NET_STALE_MOVE_MS?0:2.25),targetX=member._ownerTargetX+(Number(member._ownerVx)||0)*lead,targetY=member._ownerTargetY+(Number(member._ownerVy)||0)*lead,dx=targetX-member._ownerBaseX,dy=targetY-member._ownerBaseY,distance=Math.hypot(dx,dy),blend=frameBlend(distance>90?.72:distance>30?.58:.46,step);member._ownerBaseX+=dx*blend;member._ownerBaseY+=dy*blend;member.x=member._ownerBaseX+(Number(member._ownerOffsetX)||0);member.y=member._ownerBaseY+(Number(member._ownerOffsetY)||0);member._ownerPrepared=true;});
    }
    function captureRemoteOwnerOffsets(){
        if(networkRole!=='host')return;Object.keys(remotePlayers).forEach(function(id){var member=remotePlayers[id];if(!member||!isFinite(member._ownerBaseX)||!isFinite(member._ownerBaseY))return;member._ownerOffsetX=clamp(member.x-member._ownerBaseX,-900,900);member._ownerOffsetY=clamp(member.y-member._ownerBaseY,-900,900);});
    }
    function resetOwnerOffsets(){
        netExternalApplied={x:0,y:0};netExternalTarget={x:0,y:0};Object.keys(remotePlayers).forEach(function(id){var member=remotePlayers[id];if(!member)return;member._ownerOffsetX=0;member._ownerOffsetY=0;member._ownerBaseX=member.x;member._ownerBaseY=member.y;member._ownerAcceptedX=member.x;member._ownerAcceptedY=member.y;member._ownerTargetX=member.x;member._ownerTargetY=member.y;member._ownerVx=0;member._ownerVy=0;});
    }
    function updateRemoteParty(step,now,allowCombat){if(networkRole!=='host')return;var clock=performance.now();Object.keys(remotePlayers).forEach(function(id){var input=remoteInputs[id]||{},age=clock-(input.receivedAt||0),safeInput=input;if(age>NET_STALE_ACTION_MS)safeInput=Object.assign({},safeInput,{fire:false,dash:false,switch:false,ability:false});if(age>NET_STALE_MOVE_MS)safeInput=Object.assign({},safeInput,{dx:0,dy:0});var member=remotePlayers[id],sequence=Math.max(0,Number(input.seq)||0),owned=!!member._ownerPrepared||isFinite(member._ownerBaseX),beforeX=member.x,beforeY=member.y;updateSimplePlayer(member,safeInput,step,now,allowCombat,owned);if(owned){member.x=beforeX;member.y=beforeY;}else if(sequence>(member.lastProcessedInputSeq||0)){member.lastProcessedInputSeq=sequence;member.lastProcessedInputX=member.x;member.lastProcessedInputY=member.y;}});}
    function updatePartyRevives(step){if(networkRole==='local')return;var list=partyPlayers();for(var i=0;i<list.length;i++){var fallen=list[i];if(!fallen.downed)continue;var rescuer=null;for(var j=0;j<list.length;j++){var ally=list[j];if(ally!==fallen&&!ally.downed&&ally.hp>0&&Math.hypot(ally.x-fallen.x,ally.y-fallen.y)<86){rescuer=ally;break;}}fallen.reviveProgress=rescuer?fallen.reviveProgress+step:Math.max(0,fallen.reviveProgress-step*.45);if(fallen.reviveProgress>=120){fallen.downed=false;fallen.reviveProgress=0;fallen.hp=Math.max(1,fallen.maxHp*.5);fallen.armor=Math.min(fallen.maxArmor,2);fallen.invuln=150;addRing(fallen.x,fallen.y,fallen.color,115,8);addFloat('REVIVED',fallen.x,fallen.y-44,'#bdf7ce');playSound('player.revive',{x:fallen.x,y:fallen.y});}}}
    function updatePartyHud(){var node=el('party-hud');if(!node)return;var list=partyPlayers();node.innerHTML='';if(networkRole==='local'){node.style.display='none';return;}node.style.display='grid';list.sort(function(a,b){return(a.slot||0)-(b.slot||0);}).forEach(function(member){var row=document.createElement('div');row.className='party-row'+(member.downed?' down':'');row.innerHTML='<i style="background:'+member.color+'"></i><span>'+(member.playerName||'KNIGHT')+'</span><b>'+fmt(Math.max(0,member.hp))+' HP</b>';node.appendChild(row);});}
    function plainState(object){var result={};Object.keys(object||{}).forEach(function(key){var value=object[key];if(typeof value==='number'||typeof value==='string'||typeof value==='boolean'||value===null)result[key]=value;else if(Array.isArray(value)&&value.length<30){if(value.every(function(item){return typeof item==='number'||typeof item==='string'||typeof item==='boolean';}))result[key]=value.slice();else if(value.every(function(item){return item&&typeof item.x==='number'&&typeof item.y==='number';}))result[key]=value.map(function(item){return{x:item.x,y:item.y};});}});return result;}
    function sampleNetMotion(entity){var now=gameTimeMs,elapsed=Math.max(1,(now-(entity._netLastSentAt||now-16.6667))/16.6667),vx=(entity.x-(isFinite(entity._netLastSentX)?entity._netLastSentX:entity.x))/elapsed,vy=(entity.y-(isFinite(entity._netLastSentY)?entity._netLastSentY:entity.y))/elapsed;entity._netLastSentX=entity.x;entity._netLastSentY=entity.y;entity._netLastSentAt=now;return{x:vx,y:vy};}
    function playerSnapshot(member){var motion=sampleNetMotion(member);return{id:member.netId,name:member.playerName,slot:member.slot,color:member.color,classId:member.classId,starterId:member.inventory[0]&&member.inventory[0].id,x:member.x,y:member.y,vx:motion.x,vy:motion.y,ack:member.lastProcessedInputSeq||0,ackX:isFinite(member.lastProcessedInputX)?member.lastProcessedInputX:member.x,ackY:isFinite(member.lastProcessedInputY)?member.lastProcessedInputY:member.y,externalX:Number(member._ownerOffsetX)||0,externalY:Number(member._ownerOffsetY)||0,coins:walletFor(member),resources:normalizeResources(member.resources),angle:member.angle,hp:member.hp,maxHp:member.maxHp,armor:member.armor,maxArmor:member.maxArmor,mana:member.mana,maxMana:member.maxMana,terrainSlow:member.terrainSlow,downed:member.downed,revive:member.reviveProgress,weapon:member.weapon&&member.weapon.id,weaponLevel:member.weapon&&member.weapon.level,attackAnim:member.attackAnim,attackAnimMax:member.attackAnimMax,attackAnimKind:member.attackAnimKind,attackAnimWeapon:member.attackAnimWeapon,attackSide:member.attackSide,isDashing:member.isDashing};}
    function enemySnapshot(enemy){var motion=sampleNetMotion(enemy),customStatuses='';try{customStatuses=JSON.stringify(enemy.customStatuses||{}).slice(0,4096);}catch(error){}return[enemy.id,enemy.kind,enemy.x,enemy.y,enemy.hp,enemy.maxHp,enemy.radius,enemy.color,enemy.aim,enemy.flash,enemy.elite?1:0,0,'','',0,enemy.hidden?1:0,enemy.burn,enemy.freeze,enemy.poison,enemy.curse,enemy.stars,enemy.shards,enemy.state,enemy.orbit,enemy.shieldHp,enemy.shieldMax,motion.x,motion.y,enemy.bossKey||'',enemy.comboName||'',enemy.comboState||'',enemy.enraged?1:0,enemy.apex?1:0,enemy.shadowState||'',enemy.stateTimer||0,enemy.attackAngle||0,enemy.attackX||0,enemy.attackY||0,enemy.attackStep||0,enemy.attackAux||0,enemy.attackMask||0,enemy.attackZones||[],enemy.arenaZones||[],enemy.patternIndex||0,enemy.patternPhase||1,enemy.arenaMode||'',enemy.arenaAngle||0,enemy.arenaPower||0,customStatuses];}
    function bulletSnapshot(b){return[b.netId,b.x,b.y,b.vx,b.vy,b.radius,b.color,b.type,b.sourceId,b.friendly?1:0,b.life,b.age,b.vortex||0,b.chrono?1:0,b.returning?1:0,b.returningHome?1:0,b.resonance||'',b.dawnstar?1:0,b.seraph?1:0,b.heavenfall?1:0,b.ownerId||'',b.visualModelId||'',b.visualAccent||'',b.trailModel||'line',b.trailColor||'',b.trailDisabled?1:0,b.trailMax||0];}
    function slashSnapshot(s){return[s.netId,s.x,s.y,s.angle,s.radius,s.arc,s.color,s.life,s.maxLife,s.sourceId,s.friendly?1:0,s.ownerId||''];}
    function timedFieldSnapshot(field){var state=plainState(field),motion=sampleNetMotion(field);Object.keys(state).forEach(function(key){if(key.indexOf('_net')===0)delete state[key];});state.vx=motion.x;state.vy=motion.y;return state;}
    function radiantSnapshot(radiant){var motion=sampleNetMotion(radiant);return{id:radiant.netId,x:radiant.x,y:radiant.y,vx:motion.x,vy:motion.y,radius:radiant.radius,color:radiant.color,angle:radiant.angle,spin:radiant.spin,ownerId:radiant.ownerId||'',age:radiant.age,dead:!!radiant.dead};}
    function serializeWorld(){return{revision:netWorldRevision,sceneRevision:netSceneRevision,scene:sceneMode,biome:BIOMES.indexOf(currentBiome),layout:currentLayout&&currentLayout.id||'',obstacles:obstacles.map(plainState),hazards:hazards.filter(function(h){return h instanceof Hazard;}).map(plainState),props:biomeProps.map(plainState),decor:roomDecor.map(plainState),shopPlatforms:shopPlatforms.map(function(p){return{x:p.x,y:p.y};}),forge:{x:shopForge.x,y:shopForge.y},craft:{x:shopCraft.x,y:shopCraft.y}};}
    function sendNetworkSnapshot(forceWorld){
        if(networkRole!=='host'||!window.DKNet)return null;var includeWorld=forceWorld||netSentWorldRevision!==netWorldRevision,sequence=++netSnapshotSeq,includeTransients=!!forceWorld;if(forceWorld)netTransientSnapshotBudget=0;else{netTransientSnapshotBudget+=10;if(netTransientSnapshotBudget>=networkSnapshotHz){netTransientSnapshotBudget-=networkSnapshotHz;includeTransients=true;}}var slowInterval=Math.max(1,Math.round(networkSnapshotHz/5)),includeSlow=includeWorld||sequence%slowInterval===0,packet={type:'snapshot',seq:sequence,snapshotHz:networkSnapshotHz,scene:sceneMode,sceneRevision:netSceneRevision,wave:wave,phase:wavePhase,phaseTotal:wavePhaseTotal,biome:BIOMES.indexOf(currentBiome),players:partyPlayers().map(playerSnapshot),cinematic:palaceCutscene.active?{timer:palaceCutscene.timer,stage:palaceCutscene.stage,statueFall:palaceCutscene.statueFall,spiritAlpha:palaceCutscene.spiritAlpha,swordLift:palaceCutscene.swordLift,titleAlpha:palaceCutscene.titleAlpha}:null,enemies:enemies.filter(function(e){return sceneMode==='armory'||(!e.trainingDummy&&e.kind!=='trainingDummy');}).map(enemySnapshot),serverTime:gameTimeMs};if(includeTransients){packet.bullets=bullets.map(bulletSnapshot);packet.slashes=slashes.slice(-220).map(slashSnapshot);packet.effects=effects.slice(-110).map(plainState);packet.pickups=pickups.map(plainState);packet.fields=hazards.filter(function(h){return h instanceof TimedField;}).map(timedFieldSnapshot);packet.totems=totems.map(plainState);packet.radiants=radiantWeapons.map(radiantSnapshot);}if(includeSlow){packet.props=biomeProps.map(plainState);}if(includeWorld){packet.world=serializeWorld();netSentWorldRevision=netWorldRevision;}window.DKNet.broadcast(packet,{droppable:!includeWorld,bulk:true});return packet;
    }
    function reconstructList(data,Proto){return(data||[]).map(function(item){return Object.assign(Object.create(Proto.prototype),item);});}
    function applyWorldState(world){if(!world)return;netAppliedWorldRevision=Math.max(netAppliedWorldRevision,Number(world.revision)||0);if((Number(world.sceneRevision)||0)>=netAppliedSceneRevision)sceneMode=world.scene||sceneMode;currentBiome=BIOMES[clamp(Number(world.biome)||0,0,BIOMES.length-1)];currentLayout=ROOM_LAYOUTS.find(function(layout){return layout.id===world.layout;})||null;obstacles=reconstructList(world.obstacles,RoomStructure);hazards=reconstructList(world.hazards,Hazard);biomeProps=reconstructList(world.props,BiomeProp);roomDecor=reconstructList(world.decor,RoomDecoration);if(world.shopPlatforms)for(var i=0;i<Math.min(shopPlatforms.length,world.shopPlatforms.length);i++){shopPlatforms[i].x=world.shopPlatforms[i].x;shopPlatforms[i].y=world.shopPlatforms[i].y;}if(world.forge)Object.assign(shopForge,world.forge);if(world.craft)Object.assign(shopCraft,world.craft);}
    function ensureSnapshotPlayer(state){var member=playerByNetId(state.id);if(!member){member=new Player(state.x,state.y,{classId:state.classId,starterId:state.starterId,color:state.color,netId:state.id,name:state.name,slot:state.slot});remotePlayers[state.id]=member;}return member;}
    function applyPlayerSnapshot(state){
        var member=ensureSnapshotPlayer(state),isSelf=state.id===localPeerId;member.targetX=state.x;member.targetY=state.y;member._netVx=Number(state.vx)||0;member._netVy=Number(state.vy)||0;
        if(isSelf){netExternalTarget.x=Number(state.externalX)||0;netExternalTarget.y=Number(state.externalY)||0;var ack=Number(state.ack)||0;if(ack>netLastAckSeq){var record=null;for(var ph=netPredictionHistory.length-1;ph>=0;ph--)if(netPredictionHistory[ph].seq===ack){record=netPredictionHistory[ph];break;}if(record){var acceptedX=isFinite(state.ackX)?Number(state.ackX):record.x,acceptedY=isFinite(state.ackY)?Number(state.ackY):record.y,errorX=acceptedX-record.x,errorY=acceptedY-record.y,errorDistance=Math.hypot(errorX,errorY);if(errorDistance>NET_OWNER_REJECT_THRESHOLD){netPredictionError.x=errorX;netPredictionError.y=errorY;netOwnerResyncCount++;}else{netPredictionError.x=0;netPredictionError.y=0;}}netLastAckSeq=ack;netPredictionHistory=netPredictionHistory.filter(function(item){return item.seq>ack;});}}
        else{member._netCorrectionX=state.x-member.x;member._netCorrectionY=state.y-member.y;member._netLastSnapshotAt=performance.now();}
        if(isSelf&&shopMode)return;if(!isSelf)member.angle=state.angle;member.hp=state.hp;member.maxHp=state.maxHp;member.armor=state.armor;member.maxArmor=state.maxArmor;member.mana=state.mana;member.maxMana=state.maxMana;member.terrainSlow=isFinite(state.terrainSlow)?state.terrainSlow:1;setWallet(member,state.coins);member.resources=normalizeResources(state.resources);member.downed=!!state.downed;member.reviveProgress=state.revive||0;member.attackAnim=state.attackAnim||0;member.attackAnimMax=state.attackAnimMax||1;member.attackAnimKind=state.attackAnimKind||'gun';member.attackAnimWeapon=state.attackAnimWeapon||state.weapon;member.attackSide=state.attackSide||1;member.isDashing=!!state.isDashing;
        if(state.weapon&&(!member.weapon||member.weapon.id!==state.weapon)){var owned=member.getWeapon(state.weapon);if(!owned){owned=weaponCopy(state.weapon);member.inventory.push(owned);}member.weapon=owned;member.weaponIndex=member.inventory.indexOf(owned);}if(member.weapon&&state.weaponLevel)member.weapon.level=state.weaponLevel;
    }
    function applyEnemySnapshots(list){var old={};enemies.forEach(function(enemy){old[enemy.id]=enemy;});var next=[];(list||[]).forEach(function(s){var enemy=old[s[0]],bossKey=s[28]||'';if(!enemy||(bossKey&&!enemy.isBoss)){enemy=bossKey?new BiomeBoss(s[2],s[3],bossKey):new Enemy(s[2],s[3],s[1]);enemy.id=s[0];}enemy.kind=s[1];enemy.targetX=s[2];enemy.targetY=s[3];enemy._netCorrectionX=s[2]-enemy.x;enemy._netCorrectionY=s[3]-enemy.y;enemy._netVx=Number(s[26])||0;enemy._netVy=Number(s[27])||0;enemy._netLastSnapshotAt=performance.now();enemy.hp=s[4];enemy.maxHp=s[5];enemy.radius=s[6];enemy.color=s[7];enemy.aim=s[8];enemy.flash=s[9];enemy.elite=!!s[10];enemy.hidden=!!s[15];enemy.burn=s[16];enemy.freeze=s[17];enemy.poison=s[18];enemy.curse=s[19];enemy.stars=s[20];enemy.shards=s[21];enemy.state=s[22];enemy.orbit=s[23];enemy.shieldHp=s[24];enemy.shieldMax=s[25];if(bossKey){enemy.isBoss=true;enemy.bossKey=bossKey;enemy.bossDef=BOSS_DEFS[bossKey];enemy.name=enemy.bossDef.name;enemy.comboName=s[29]||enemy.bossDef.combos[0];enemy.comboState=s[30]||'roam';enemy.enraged=!!s[31];enemy.apex=!!s[32];enemy.shadowState=s[33]||enemy.shadowState||'roam';enemy.stateTimer=Number(s[34])||0;enemy.attackAngle=Number(s[35])||0;enemy.attackX=Number(s[36])||0;enemy.attackY=Number(s[37])||0;enemy.attackStep=Number(s[38])||0;enemy.attackAux=Number(s[39])||0;enemy.attackMask=Number(s[40])||0;enemy.attackZones=Array.isArray(s[41])?s[41]:[];enemy.arenaZones=Array.isArray(s[42])?s[42]:[];enemy.patternIndex=Number(s[43])||0;enemy.patternPhase=Number(s[44])||1;enemy.arenaMode=s[45]||'';enemy.arenaAngle=Number(s[46])||0;enemy.arenaPower=Number(s[47])||0;if(bossKey==='ember')palaceStatueFallen=true;}try{enemy.customStatuses=typeof s[48]==='string'&&s[48].length<=4096?JSON.parse(s[48]):Object.create(null);}catch(error){enemy.customStatuses=Object.create(null);}enemy.dead=false;next.push(enemy);});enemies=next;enemyGridReady=false;}
    function applyBulletSnapshots(list){var old={},kept=Object.create(null),previous=bullets;previous.forEach(function(b){old[b.netId]=b;});var next=[];(list||[]).forEach(function(s){var b=old[s[0]];if(!b)b=spawnBullet({netId:s[0],x:s[1],y:s[2],angle:Math.atan2(s[4],s[3]),speed:0});kept[s[0]]=true;b.targetX=s[1];b.targetY=s[2];b._netCorrectionX=s[1]-b.x;b._netCorrectionY=s[2]-b.y;b._netVx=s[3];b._netVy=s[4];b._netLastSnapshotAt=performance.now();b.vx=s[3];b.vy=s[4];b.radius=s[5];b.color=s[6];b.type=s[7];b.sourceId=s[8];b.friendly=!!s[9];b.life=s[10];b.age=s[11];b.vortex=s[12];b.chrono=!!s[13];b.returning=!!s[14];b.returningHome=!!s[15];b.resonance=s[16];b.dawnstar=!!s[17];b.seraph=!!s[18];b.heavenfall=!!s[19];b.ownerId=s[20]||'';b.visualModelId=s[21]||'';b.visualAccent=s[22]||'';b.trailModel=s[23]||'line';b.trailColor=s[24]||'';b.trailDisabled=!!s[25];b.trailMax=Number(s[26])||0;b.dead=false;next.push(b);});previous.forEach(function(b){if(!kept[b.netId])recycleBullet(b);});bullets=next;}
    function applySlashSnapshots(list){var old={},kept=Object.create(null),previous=slashes;previous.forEach(function(s){old[s.netId]=s;});var next=[];(list||[]).forEach(function(d){var s=old[d[0]]||spawnSlash({netId:d[0]});kept[d[0]]=true;s.x=d[1];s.y=d[2];s.angle=d[3];s.radius=d[4];s.arc=d[5];s.color=d[6];s.life=d[7];s.maxLife=d[8];s.sourceId=d[9];s.friendly=!!d[10];s.ownerId=d[11]||'';s.dead=false;next.push(s);});previous.forEach(function(s){if(!kept[s.netId])recycleSlash(s);});slashes=next;}
    function applyPickupSnapshots(list){var old={};pickups.forEach(function(item){old[item.netId]=item;});var next=[];(list||[]).forEach(function(data){var item=old[data.netId];if(!item)item=new Pickup(data.x,data.y,data.kind,data.value,data.targetId,data.resourceId);var currentX=item.x,currentY=item.y;Object.assign(item,data);item._netCorrectionX=item.x-currentX;item._netCorrectionY=item.y-currentY;item.x=currentX;item.y=currentY;item._netVx=Number(data.vx)||0;item._netVy=Number(data.vy)||0;item._netLastSnapshotAt=performance.now();item.dead=false;next.push(item);});pickups=next;}
    function applyTimedFieldSnapshots(list){var staticHazards=hazards.filter(function(h){return h instanceof Hazard;}),old={};hazards.forEach(function(h){if(h instanceof TimedField)old[h.netId]=h;});var next=[];(list||[]).forEach(function(data){var field=old[data.netId]||Object.create(TimedField.prototype),currentX=isFinite(field.x)?field.x:data.x,currentY=isFinite(field.y)?field.y:data.y;Object.assign(field,data);field._netCorrectionX=data.x-currentX;field._netCorrectionY=data.y-currentY;field.x=currentX;field.y=currentY;field._netVx=Number(data.vx)||0;field._netVy=Number(data.vy)||0;field._netLastSnapshotAt=performance.now();field.dead=false;next.push(field);});hazards=staticHazards.concat(next);}
    function applyTotemSnapshots(list){totems=(list||[]).map(function(data){return Object.assign(Object.create(Totem.prototype),data,{dead:false});});}
    function applyRadiantSnapshots(list){var old={};radiantWeapons.forEach(function(r){old[r.netId]=r;});radiantWeapons=(list||[]).map(function(data){var radiant=old[data.id]||Object.create(SunlionHunt.prototype),currentX=isFinite(radiant.x)?radiant.x:data.x,currentY=isFinite(radiant.y)?radiant.y:data.y;Object.assign(radiant,data,{netId:data.id,dead:false});radiant.x=currentX;radiant.y=currentY;radiant._netCorrectionX=data.x-currentX;radiant._netCorrectionY=data.y-currentY;radiant._netVx=Number(data.vx)||0;radiant._netVy=Number(data.vy)||0;radiant._netLastSnapshotAt=performance.now();radiant.trailX=radiant.trailX||new Float32Array(14);radiant.trailY=radiant.trailY||new Float32Array(14);radiant.trailCount=0;return radiant;});}
    function syncGuestSceneFromSnapshot(packet,sceneRevision){
        if(sceneRevision<=netAppliedSceneRevision||!packet.scene)return;
        var nextScene=packet.scene;
        if(nextScene==='run'&&!gameActive)startGame(true);
        else if(nextScene==='armory'&&!shopMode){
            var selfState=(packet.players||[]).find(function(state){return state.id===localPeerId;});
            if(selfState&&player){setWallet(player,selfState.coins);player.resources=normalizeResources(selfState.resources);player.hp=selfState.hp;player.armor=selfState.armor;player.mana=selfState.mana;}
            wave=Number(packet.wave)||wave;openShop();
        }else if(nextScene==='run'&&shopMode)finishArmory();
        guestScene=nextScene;sceneMode=nextScene;
    }
    function applyNetworkSnapshot(packet){
        if(networkRole!=='guest')return;
        var sequence=Number(packet.seq)||0,sceneRevision=Math.max(0,Number(packet.sceneRevision)||0);
        if(sequence&&sequence<=netLastSnapshotSeq)return;
        if(sceneRevision<netAppliedSceneRevision)return;
        syncGuestSceneFromSnapshot(packet,sceneRevision);
        if(packet.snapshotHz)setNetworkSnapshotHz(packet.snapshotHz);
        netAppliedSceneRevision=Math.max(netAppliedSceneRevision,sceneRevision);
        if(packet.world&&(Number(packet.world.revision)||0)>netAppliedWorldRevision)applyWorldState(packet.world);
        netLastSnapshotSeq=Math.max(netLastSnapshotSeq,sequence);lastGuestSnapshotAt=performance.now();guestScene=packet.scene||guestScene;sceneMode=guestScene;wave=packet.wave||wave;wavePhase=packet.phase||wavePhase;wavePhaseTotal=packet.phaseTotal||wavePhaseTotal;currentBiome=BIOMES[clamp(Number(packet.biome)||0,0,BIOMES.length-1)];
        if(packet.cinematic){palaceCutscene.active=true;palaceCutscene.timer=Number(packet.cinematic.timer)||0;palaceCutscene.stage=packet.cinematic.stage||'';palaceCutscene.statueFall=Number(packet.cinematic.statueFall)||0;palaceCutscene.spiritAlpha=Number(packet.cinematic.spiritAlpha)||0;palaceCutscene.swordLift=Number(packet.cinematic.swordLift)||0;palaceCutscene.titleAlpha=Number(packet.cinematic.titleAlpha)||0;}else if(palaceCutscene.active){palaceStatueFallen=true;resetPalaceCutscene();}
        (packet.players||[]).forEach(applyPlayerSnapshot);Object.keys(remotePlayers).forEach(function(id){if(id===localPeerId)return;if(!(packet.players||[]).some(function(state){return state.id===id;}))delete remotePlayers[id];});applyEnemySnapshots(packet.enemies);if(sceneMode!=='armory'){enemies=enemies.filter(function(e){return !e.trainingDummy&&e.kind!=='trainingDummy';});enemyGridReady=false;}
        if(Object.prototype.hasOwnProperty.call(packet,'bullets'))applyBulletSnapshots(packet.bullets);if(Object.prototype.hasOwnProperty.call(packet,'slashes'))applySlashSnapshots(packet.slashes);if(Object.prototype.hasOwnProperty.call(packet,'effects'))effects=(packet.effects||[]).map(function(e){return Object.assign({},e);});if(Object.prototype.hasOwnProperty.call(packet,'pickups'))applyPickupSnapshots(packet.pickups);if(Object.prototype.hasOwnProperty.call(packet,'fields'))applyTimedFieldSnapshots(packet.fields);if(Object.prototype.hasOwnProperty.call(packet,'props'))biomeProps=reconstructList(packet.props,BiomeProp);if(Object.prototype.hasOwnProperty.call(packet,'totems'))applyTotemSnapshots(packet.totems);if(Object.prototype.hasOwnProperty.call(packet,'radiants'))applyRadiantSnapshots(packet.radiants);updateHUD();updatePartyHud();
    }
    function advanceGuestTransientVisuals(step){slashes.forEach(function(s){s.life=Math.max(0,s.life-step);});particles.forEach(function(p){p.update(step);});updateEffects(step);compactPooled(particles,function(p){return p.life>0;},recycleParticle);compactInPlace(effects,function(e){return e.life>0;});}
    function guestVisualStep(step,now){if(palaceCutscene.active){advanceGuestTransientVisuals(step);targetZoom=cameraBaseZoom()*cameraZoomSetting*.96;currentZoom+=(targetZoom-currentZoom)*frameBlend(.06,step);var cx=-(viewportWidth/currentZoom)/2,cy=-(viewportHeight/currentZoom)/2,cb=frameBlend(.09,step);camera.x+=(cx-camera.x)*cb;camera.y+=(cy-camera.y)*cb;return;}var input=localInputState();if(!player.downed)updateSimplePlayer(player,input,step,now,true);applyOwnedExternalCorrection(step);applyPredictionCorrection(step);pumpLocalInput(input,step);Object.keys(remotePlayers).forEach(function(id){advanceNetworkEntity(remotePlayers[id],step,.17);});bullets.forEach(function(b){advanceNetworkEntity(b,step,.25);if(!b.trailDisabled&&intervalElapsed(b,'trailClock',step,2.4)){b.trailX[b.trailHead]=b.x;b.trailY[b.trailHead]=b.y;b.trailHead=(b.trailHead+1)%12;b.trailCount=Math.min(b.trailMax||7,b.trailCount+1);}});enemies.forEach(function(e){advanceNetworkEntity(e,step,.2);});pickups.forEach(function(item){advanceNetworkEntity(item,step,.24);});hazards.forEach(function(field){if(field instanceof TimedField)advanceNetworkEntity(field,step,.2);else if(field instanceof Hazard){field.timer+=step;field.pulse=(Math.sin(field.timer*.045)+1)/2;if(field.kind==='gear')field.angle+=.018*step;}});radiantWeapons.forEach(function(radiant){advanceNetworkEntity(radiant,step,.25);radiant.spin+=.28*step;});advanceGuestTransientVisuals(step);var targetX=player.x-viewportWidth/currentZoom/2,targetY=player.y-viewportHeight/currentZoom/2,cameraBlend=frameBlend(.12,step);camera.x+=(targetX-camera.x)*cameraBlend;camera.y+=(targetY-camera.y)*cameraBlend;}
    function lobbyStep(step,now){var input=localInputState();if(networkRole==='guest'){guestVisualStep(step,now);return;}updateSimplePlayer(player,input,step,now,true);if(networkRole==='host'){prepareRemoteOwnedMovement(step);updateRemoteParty(step,now,true);}processPendingShots(step);updateBullets(step);particles.forEach(function(p){p.update(step);});updateEffects(step);rebuildEnemyGrid();handleCollisions();if(networkRole==='host')captureRemoteOwnerOffsets();cleanArrays();var targetX=player.x-viewportWidth/currentZoom/2,targetY=player.y-viewportHeight/currentZoom/2,cameraBlend=frameBlend(.1,step);camera.x+=(targetX-camera.x)*cameraBlend;camera.y+=(targetY-camera.y)*cameraBlend;if(networkRole==='host'){netSnapshotClock+=step;if(netSnapshotClock>=NET_SNAPSHOT_FRAMES){netSnapshotClock%=NET_SNAPSHOT_FRAMES;sendNetworkSnapshot(false);}}}

    function simulationIsRunning(){return lobbyActive||(gameActive&&!craftingOpen&&!inventoryOpen&&!gamePaused);}
    function simulateTimeSlice(timeSlice){
        var step=timeSlice.scale,deltaMs=timeSlice.deltaMs;
        if(lobbyActive){gameTimeMs+=deltaMs;lobbyStep(step,gameTimeMs);modEvent('tick',{step:step,deltaMs:deltaMs,time:gameTimeMs,scene:'lobby',player:player});return;}if(!gameActive||craftingOpen||inventoryOpen||gamePaused)return;if(shopMode){gameTimeMs+=deltaMs;updateShopRoom(step,gameTimeMs,deltaMs);modEvent('tick',{step:step,deltaMs:deltaMs,time:gameTimeMs,scene:'armory',player:player});return;}gameTimeMs+=deltaMs;hudRefreshMs+=deltaMs;targetZoom=cameraBaseZoom()*cameraZoomSetting*(player.weapon&&player.weapon.cameraZoom||1);currentZoom+=(targetZoom-currentZoom)*frameBlend(.05,step);
        if(palaceCutscene.active&&networkRole!=='guest'){updatePalaceBossCutscene(step);particles.forEach(function(p){p.update(step);});updateEffects(step);cleanArrays();targetZoom=cameraBaseZoom()*cameraZoomSetting*.96;currentZoom+=(targetZoom-currentZoom)*frameBlend(.06,step);var ccx=-(viewportWidth/currentZoom)/2,ccy=-(viewportHeight/currentZoom)/2,cblend=frameBlend(.09,step);camera.x+=(ccx-camera.x)*cblend;camera.y+=(ccy-camera.y)*cblend;if(networkRole==='host'){netSnapshotClock+=step;if(netSnapshotClock>=NET_SNAPSHOT_FRAMES){netSnapshotClock%=NET_SNAPSHOT_FRAMES;sendNetworkSnapshot(false);}}return;}
        if(networkRole==='guest'){guestVisualStep(step,gameTimeMs);modEvent('tick',{step:step,deltaMs:deltaMs,time:gameTimeMs,scene:'run',player:player,networkRole:networkRole});if(hudRefreshMs>=120){hudRefreshMs%=120;updateHUD();updateWeaponHUD();updatePartyHud();}return;}
        var targetX=player.x-(viewportWidth/currentZoom)/2,targetY=player.y-(viewportHeight/currentZoom)/2,cameraBlend=frameBlend(.1,step);camera.x+=(targetX-camera.x)*cameraBlend;camera.y+=(targetY-camera.y)*cameraBlend;
        if(networkRole==='host')prepareRemoteOwnedMovement(step);partyPlayers().forEach(function(member){member.terrainSlow=1;});hazards.forEach(function(h){if(!h.dead&&h.update)h.update(step);});rebuildEnemyGrid();if(!player.downed)player.update(step,gameTimeMs);updateRemoteParty(step,gameTimeMs,true);processPendingShots(step);if(networkRole==='local'){for(var ei=0;ei<enemies.length;ei++)enemies[ei].update(step);}else enemies.forEach(function(e){var target=nearestLivingPlayer(e.x,e.y);if(target)withActivePlayer(target,function(){e.update(step);});});rebuildEnemyGrid();biomeProps.forEach(function(p){p.update(step);});radiantWeapons.forEach(function(r){r.update(step);});totems.forEach(function(t){t.update(step);});updateBullets(step);pickups.forEach(function(p){p.update(step);});particles.forEach(function(p){p.update(step);});updateEffects(step);handleCollisions();if(networkRole==='host')captureRemoteOwnerOffsets();updatePartyRevives(step);cleanArrays();checkWaveClear(step);updatePhaseBreak(step);updateTransition(step);
        modEvent('tick',{step:step,deltaMs:deltaMs,time:gameTimeMs,scene:'run',player:player,networkRole:networkRole});
        if(networkRole==='host'){netSnapshotClock+=step;if(netSnapshotClock>=NET_SNAPSHOT_FRAMES){netSnapshotClock%=NET_SNAPSHOT_FRAMES;sendNetworkSnapshot(false);}}if(toastTimer>0){toastTimer-=step;if(toastTimer<=0)el('toast').classList.remove('show');}if(hudRefreshMs>=120){hudRefreshMs%=120;updateHUD();updateWeaponHUD();updatePartyHud();}
    }
    function renderCurrentScene(){if(craftingOpen||shopMode)drawShopRoom();else drawGame();}
    function ema(previous,next,weight){return previous?previous*(1-weight)+next*weight:next;}
    function debugLines(mode){
        var active=Math.max(.001,perfTelemetry.simulationMs+perfTelemetry.renderMs),net=window.DKNet&&typeof window.DKNet.state==='function'?window.DKNet.state():{},transport=net.transport||{},lines=[];
        if(mode==='performance'||mode==='full'){
            lines.push('FPS '+Math.round(perfTelemetry.fps)+' · FRAME '+perfTelemetry.frameMs.toFixed(1)+' ms');
            lines.push('Render     '+(perfTelemetry.renderMs/active*100).toFixed(0)+'%  '+perfTelemetry.renderMs.toFixed(2)+' ms');
            lines.push('Simulation '+(perfTelemetry.simulationMs/active*100).toFixed(0)+'%  '+perfTelemetry.simulationMs.toFixed(2)+' ms');
            lines.push('Drawn '+perfStats.drawnEntities+' · Culled '+perfStats.culledDraws+' · Checks '+perfStats.collisionChecks);
            lines.push('Enemies '+enemies.length+' · Bullets '+bullets.length+' · FX '+(particles.length+effects.length));
            lines.push('Canvas '+canvas.width+'×'+canvas.height+' · Scale '+Math.round(renderScale*100)+'% · FX '+runtimeSettings.effectQuality);
        }
        if(mode==='network'||mode==='full'){
            if(lines.length)lines.push('');
            lines.push('Network '+String(networkRole).toUpperCase()+' · 30 Hz');
            lines.push('Server '+(net.serverRttMs>0?net.serverRttMs+' ms':'—')+' · P2P '+(net.rttMs>0?net.rttMs+' ms':'—'));
            lines.push('Control '+(transport.sentControl||0)+' · State '+(transport.sentState||0)+' · Dropped '+(transport.droppedState||0));
            lines.push('Relay fallbacks '+(transport.relayFallbacks||0)+' · Last packet '+(transport.lastPacketBytes||0)+' B');
            lines.push('Scene '+sceneMode+' · Revision '+netSceneRevision+' · Owner resync '+netOwnerResyncCount);
        }
        return lines;
    }
    function updateDebugOverlay(now){
        if(runtimeSettings.debugMode==='off'||now-perfTelemetry.debugPaintAt<400)return;perfTelemetry.debugPaintAt=now;
        var overlay=el('debug-overlay'),content=el('debug-overlay-content');if(!overlay||!content)return;overlay.hidden=false;var title=overlay.querySelector('.debug-overlay-title');if(title)title.textContent=runtimeSettings.debugMode==='network'?tr('Network'):tr('Performance');content.textContent=debugLines(runtimeSettings.debugMode).join('\n');
    }
    function diagnosticReport(){
        var net=window.DKNet&&typeof window.DKNet.state==='function'?window.DKNet.state():{};
        return ['Dungeon Knight v1.9.2 diagnostic report','Time: '+new Date().toISOString(),'Locale: '+(window.DKI18n?window.DKI18n.locale():'en'),'Scene: '+sceneMode,'Network role: '+networkRole,'Snapshot rate: 30 Hz','FPS: '+Math.round(perfTelemetry.fps),'Frame: '+perfTelemetry.frameMs.toFixed(2)+' ms','Simulation: '+perfTelemetry.simulationMs.toFixed(2)+' ms','Render: '+perfTelemetry.renderMs.toFixed(2)+' ms','Entities: enemies '+enemies.length+', bullets '+bullets.length+', particles '+particles.length+', effects '+effects.length,'Collision checks: '+perfStats.collisionChecks,'Canvas: '+canvas.width+'x'+canvas.height+' @ '+Math.round(renderScale*100)+'%','Effect quality: '+runtimeSettings.effectQuality,'Server ping: '+(net.serverRttMs||0)+' ms','P2P ping: '+(net.rttMs||0)+' ms','Transport: '+JSON.stringify(net.transport||{}),'User agent: '+navigator.userAgent].join('\n');
    }
    function loop(now) {
        requestAnimationFrame(loop);
        var freezeState=window.DKFreeze?window.DKFreeze.tick(now):null;
        var simulationStarted=performance.now(),timeFrame;
        if(freezeState&&freezeState.frozen){
            for(var freezeStepIndex=0;freezeStepIndex<freezeState.steps;freezeStepIndex++)simulateTimeSlice({scale:1,deltaMs:SIMULATION_STEP_MS});
            timeFrame={elapsedMs:freezeState.steps*SIMULATION_STEP_MS};
        }else{
            timeFrame=simulationClock.advance(now,simulationIsRunning(),simulateTimeSlice);
        }
        var simulationCost=performance.now()-simulationStarted;
        perfTelemetry.simulationMs=ema(perfTelemetry.simulationMs,simulationCost,.12);
        visualTimeMs+=timeFrame.elapsedMs;visualTick=visualTimeMs/SIMULATION_STEP_MS;
        var limit=Number(runtimeSettings.frameLimit)||0,minRenderGap=limit?1000/limit:0;
        if(!perfTelemetry.lastRenderAt||!minRenderGap||now-perfTelemetry.lastRenderAt>=minRenderGap-.5){
            var previousRender=perfTelemetry.lastRenderAt,renderStarted=performance.now();renderCurrentScene();var renderCost=performance.now()-renderStarted;
            perfTelemetry.renderMs=ema(perfTelemetry.renderMs,renderCost,.12);perfTelemetry.renderedFrames++;
            if(previousRender){var frameGap=now-previousRender;perfTelemetry.frameMs=ema(perfTelemetry.frameMs,frameGap,.12);perfTelemetry.fps=ema(perfTelemetry.fps,1000/Math.max(1,frameGap),.12);}perfTelemetry.lastRenderAt=now;
        }
        updateDebugOverlay(now);
    }

    function editorNetworkBundle(){return null;}
    function applyEditorNetworkBundle(){return{accepted:0,rejected:0,errors:['Custom editor content is local-only.']};}
    function startGame(fromNetwork) {
        playSound('run.start');
        el('start-screen').style.display='none';el('class-screen').style.display='none';el('room-screen').style.display='none';el('waiting-screen').style.display='none';el('game-over-screen').style.display='none';el('pause-screen').style.display='none';el('shop-room-ui').style.display='none';el('inventory-screen').style.display='none';el('crafting-screen').style.display='none';
        lobbyActive=false;sceneMode='run';if(fromNetwork)guestScene='run';setUiScene('run');gameActive=true;resetPalaceCutscene();palaceStatueFallen=false;gamePaused=false;shopMode=false;pauseReason='';visualTick=0;visualTimeMs=0;gameTimeMs=0;hudRefreshMs=0;inventoryOpen=false;craftingOpen=false;score=0;wave=0;coins=0;kills=0;shopVisits=0;shopRerolls=0;waveTransition=false;waveVacuum=false;transitionTimer=0;wavePhase=0;phaseBreak=false;phaseBreakTimer=0;phaseSpawnCounts=[0,0];currentZoom=cameraBaseZoom()*cameraZoomSetting;targetZoom=currentZoom;worldSlowTimer=0;netInputClock=0;netSnapshotClock=0;netInputSeq=0;netLastAckSeq=0;netBuildSeq=0;netSnapshotSeq=0;netLastSnapshotSeq=0;netAppliedWorldRevision=-1;netPredictionHistory=[];netPredictionError={x:0,y:0};netTransientSnapshotBudget=0;netLastInputSignature='';netOwnerResyncCount=0;netExternalApplied={x:0,y:0};netExternalTarget={x:0,y:0};
        releaseAllTransient();enemies=[];radiantWeapons=[];effects=[];pickups=[];obstacles=[];hazards=[];biomeProps=[];roomDecor=[];totems=[];pendingShots=[];shopOffers=[];nearbyForge=false;nearbyCraft=false;currentLayout=null;var profile=queuedProfile||{classId:selectedClassId,starterId:queuedStarterId||rollClassStarter(selectedClassId),color:PARTY_COLORS[0],netId:localPeerId,name:localPlayerName,slot:0};player=new Player(0,0,profile);mainPlayer=player;player.statBuys={};remotePlayers=Object.create(null);remoteInputs=Object.create(null);modEvent('runStart',{player:player,profile:profile,networkRole:networkRole});if(networkRole==='host')partyRoster.forEach(function(entry){if(entry.id===localPeerId)return;var meta=entry.meta||{},remote=new Player((entry.slot-1.5)*70,60,{classId:meta.classId||'independent',starterId:meta.starterId,color:PARTY_COLORS[entry.slot]||PARTY_COLORS[3],netId:entry.id,name:entry.name,slot:entry.slot});remote.statBuys={};remotePlayers[entry.id]=remote;});camera={x:-viewportWidth/currentZoom/2,y:-viewportHeight/currentZoom/2};resetSimulationClock();netWorldRevision++;netSentWorldRevision=-1;updateHUD();updateWeaponHUD();updatePartyHud();showToast(player.className+' · '+player.weapon.name,player.weapon.color);if(networkRole!=='guest'){if(networkRole==='host')netSceneRevision++;startWave();if(networkRole==='host'&&window.DKNet){window.DKNet.updateRoom('run',{wave:wave,players:partyCount(),sceneRevision:netSceneRevision});window.DKNet.broadcast({type:'control',action:'start',sceneRevision:netSceneRevision,editorBundle:editorNetworkBundle()});sendNetworkSnapshot(true);}}
    }
    function endGame(reason) {
        if(!gameActive)return;var stopped=reason==='RUN ENDED';modEvent('runEnd',{reason:reason||'PARTY DEFEATED',wave:wave,score:score,kills:kills,player:player,biome:currentBiome});if(networkRole==='host'&&window.DKNet){netSceneRevision++;window.DKNet.updateRoom('ended',{wave:wave,sceneRevision:netSceneRevision});window.DKNet.broadcast({type:'control',action:'end',sceneRevision:netSceneRevision,reason:reason||'PARTY DEFEATED'});}gameActive=false;gamePaused=false;shopMode=false;inventoryOpen=false;craftingOpen=false;sceneMode='menu';setUiScene('game-over');el('shop-room-ui').style.display='none';el('inventory-screen').style.display='none';el('crafting-screen').style.display='none';el('pause-screen').style.display='none';saveRecord();el('game-over-title').textContent=stopped?'Run Ended':networkRole==='local'?'You Died':'Party Defeated';el('final-wave').textContent=wave;el('final-score').textContent=score;var build=player.inventory.length-1+Object.keys(player.passives).length+Object.keys(player.pacts).length+Object.values(player.statBuys||{}).reduce(function(a,b){return a+b;},0)+Object.keys(player.activeSkills).length;el('final-build').textContent=build;el('death-line').textContent=player.className+' · '+(stopped?'Left':'Defeated')+' in '+currentBiome.name+' · '+kills+' enemies felled';el('game-over-screen').style.display='flex';playSound(stopped?'ui.back':'run.end');if(window.DKAudio)window.DKAudio.stopAllLoops();
    }
    function togglePause(forceResume) {
        if(!gameActive||pauseReason==='shop')return;if(forceResume||gamePaused){gamePaused=false;pauseReason='';el('pause-screen').style.display='none';resetSimulationClock();playSound('ui.close');}else{gamePaused=true;pauseReason='pause';el('pause-screen').style.display='flex';simulationClock.clear();playSound('ui.open');if(window.DKAudio)window.DKAudio.stopAllLoops();}
    }
    function resize() { viewportWidth=innerWidth;viewportHeight=innerHeight;touchMode=matchMedia('(pointer: coarse)').matches;pixelRatio=Math.max(.7,Math.min(2,(Number(devicePixelRatio)||1)*renderScale));canvas.width=Math.max(320,Math.round(viewportWidth*pixelRatio));canvas.height=Math.max(240,Math.round(viewportHeight*pixelRatio));canvas.style.width=viewportWidth+'px';canvas.style.height=viewportHeight+'px';ctx.imageSmoothingEnabled=true; }
    function isTouchDevice(){return touchMode;}

    function bindInputs() {
        function clearKeyboardState(){clearBoundInputs();}
        window.addEventListener('keydown',function(e){if(e.isComposing||e.keyCode===229||isTextInputTarget(e.target)||document.body.hasAttribute('data-keybind-capture'))return;pressedInputs[e.code]=true;syncBoundInputs();if(e.code===keybindings.dash)e.preventDefault();if(e.code===keybindings.pause&&!e.repeat&&!inventoryOpen&&!craftingOpen)togglePause();if(e.code===keybindings.inventory&&!e.repeat&&!craftingOpen){if(inventoryOpen)closeInventory();else openInventory();}if(e.code==='Escape'){if(craftingOpen)closeCraftingUI();else if(inventoryOpen)closeInventory();}});
        window.addEventListener('keyup',function(e){if(e.isComposing||e.keyCode===229||isTextInputTarget(e.target))return;pressedInputs[e.code]=false;syncBoundInputs();});
        window.addEventListener('blur',function(){clearKeyboardState();if(runtimeSettings.autoPause==='on'&&gameActive&&!gamePaused&&!shopMode&&!inventoryOpen&&!craftingOpen)togglePause();});document.addEventListener('compositionstart',clearKeyboardState);
        document.addEventListener('visibilitychange',function(){if(document.hidden){clearKeyboardState();if(runtimeSettings.autoPause==='on'&&gameActive&&!gamePaused&&!shopMode&&!inventoryOpen&&!craftingOpen)togglePause();}});
        canvas.addEventListener('pointermove',function(e){var r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});canvas.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||document.body.hasAttribute('data-keybind-capture'))return;pressedInputs['Mouse'+e.button]=true;syncBoundInputs();});window.addEventListener('pointerup',function(e){if(e.pointerType==='mouse'){pressedInputs['Mouse'+e.button]=false;syncBoundInputs();}});canvas.addEventListener('contextmenu',function(e){e.preventDefault();});
        el('start-btn').addEventListener('click',startGame);el('retry-btn').addEventListener('click',leaveToMenu);var classCards=document.querySelectorAll?document.querySelectorAll('.class-card'):[];for(var cc=0;cc<classCards.length;cc++)classCards[cc].addEventListener('click',function(){selectClass(this.getAttribute('data-class'));});el('resume-btn').addEventListener('click',function(){togglePause(true);});el('inventory-btn').addEventListener('click',openInventory);el('hud-settings-btn').addEventListener('click',function(){togglePause();window.setTimeout(function(){if(window.DKUI)window.DKUI.showPauseView('settings',true);},0);});el('pause-inventory-btn').addEventListener('click',openInventory);el('inventory-close-btn').addEventListener('click',closeInventory);el('stop-btn').addEventListener('click',function(){requestStopRun(this);});el('inventory-stop-btn').addEventListener('click',function(){requestStopRun(this);});el('shop-buy-btn').addEventListener('click',function(){if(nearbyCraft)openCraftingUI();else if(nearbyForge)forgeEquippedWeapon();else if(nearbyShopIndex>=0)buyOffer(nearbyShopIndex);});el('craft-prev-btn').addEventListener('click',function(){cycleCraftRecipe(-1);});el('craft-next-btn').addEventListener('click',function(){cycleCraftRecipe(1);});el('craft-ui-prev').addEventListener('click',function(){cycleCraftRecipe(-1);});el('craft-ui-next').addEventListener('click',function(){cycleCraftRecipe(1);});el('craft-confirm-btn').addEventListener('click',craftCurrentRecipe);el('craft-close-btn').addEventListener('click',closeCraftingUI);el('reroll-btn').addEventListener('click',rerollShop);el('continue-btn').addEventListener('click',leaveShop);
        el('resolution-select').value=String(renderScale);el('resolution-select').addEventListener('change',function(){renderScale=clamp(Number(this.value)||1,.7,1);try{localStorage.setItem('dungeonKnightRenderScale',String(renderScale));}catch(err){}resize();showToast('RESOLUTION '+Math.round(renderScale*100)+'%','#fff');});
    }
    function setupTouch() {
        var zone=el('joystick-zone'),knob=el('joystick-knob'),aimKnob=el('aim-stick-knob'),buttonPointers=Object.create(null);
        function capture(node,e){try{node.setPointerCapture(e.pointerId);}catch(error){}}
        zone.addEventListener('pointerdown',function(e){if(joystick.active||document.body.hasAttribute('data-mobile-layout-edit'))return;e.preventDefault();e.stopPropagation();joystick.id=e.pointerId;joystick.active=true;capture(zone,e);var r=zone.getBoundingClientRect();joystick.originX=r.left+r.width/2;joystick.originY=r.top+r.height/2;moveJoy(e.clientX,e.clientY);});
        zone.addEventListener('pointermove',function(e){if(!joystick.active||e.pointerId!==joystick.id)return;e.preventDefault();moveJoy(e.clientX,e.clientY);});
        function resetJoy(){joystick.active=false;joystick.id=null;joystick.x=0;joystick.y=0;knob.style.transform='translate(0,0)';}
        function endJoy(e){if(e.pointerId===joystick.id)resetJoy();}
        function moveJoy(x,y){var dx=x-joystick.originX,dy=y-joystick.originY,d=Math.hypot(dx,dy)||1;if(d>35){dx*=35/d;dy*=35/d;}knob.style.transform='translate('+dx+'px,'+dy+'px)';joystick.x=dx/35;joystick.y=dy/35;}
        zone.addEventListener('pointerup',endJoy);zone.addEventListener('pointercancel',endJoy);zone.addEventListener('lostpointercapture',endJoy);
        function bindButton(id,key){var node=el(id),active=new Set();buttonPointers[key]=active;node.style.touchAction='none';node.addEventListener('pointerdown',function(e){if(document.body.hasAttribute('data-mobile-layout-edit'))return;e.preventDefault();e.stopPropagation();active.add(e.pointerId);capture(node,e);buttons[key]=true;node.classList.add('is-active');});function release(e){active.delete(e.pointerId);buttons[key]=active.size>0;node.classList.toggle('is-active',buttons[key]);}node.addEventListener('pointerup',release);node.addEventListener('pointercancel',release);node.addEventListener('lostpointercapture',release);}
        var fireNode=el('fire-btn'),firePointers=new Set();buttonPointers.fire=firePointers;
        function updateAim(x,y){var dx=x-aimJoystick.originX,dy=y-aimJoystick.originY,d=Math.hypot(dx,dy)||0,max=38;if(d>max){dx*=max/d;dy*=max/d;d=max;}aimJoystick.strength=d/max;if(d>2)aimJoystick.angle=Math.atan2(dy,dx);buttons.fire=aimJoystick.strength>.12;if(aimKnob)aimKnob.style.transform='translate('+dx+'px,'+dy+'px)';fireNode.classList.toggle('is-active',buttons.fire);}
        function resetAim(){aimJoystick.active=false;aimJoystick.id=null;aimJoystick.strength=0;buttons.fire=false;if(aimKnob)aimKnob.style.transform='translate(0,0)';if(fireNode)fireNode.classList.remove('is-active');}
        fireNode.style.touchAction='none';fireNode.addEventListener('pointerdown',function(e){if(document.body.hasAttribute('data-mobile-layout-edit'))return;e.preventDefault();e.stopPropagation();firePointers.add(e.pointerId);capture(fireNode,e);if(mobileAimFireEnabled()){var r=fireNode.getBoundingClientRect();aimJoystick.active=true;aimJoystick.id=e.pointerId;aimJoystick.originX=r.left+r.width/2;aimJoystick.originY=r.top+r.height/2;aimJoystick.angle=player?player.angle:0;updateAim(e.clientX,e.clientY);}else{buttons.fire=true;fireNode.classList.add('is-active');}});
        fireNode.addEventListener('pointermove',function(e){if(!aimJoystick.active||e.pointerId!==aimJoystick.id)return;e.preventDefault();updateAim(e.clientX,e.clientY);});
        function releaseFire(e){firePointers.delete(e.pointerId);if(e.pointerId===aimJoystick.id)resetAim();else{buttons.fire=firePointers.size>0&&!mobileAimFireEnabled();fireNode.classList.toggle('is-active',buttons.fire);}}
        fireNode.addEventListener('pointerup',releaseFire);fireNode.addEventListener('pointercancel',releaseFire);fireNode.addEventListener('lostpointercapture',releaseFire);
        bindButton('dash-btn','dash');bindButton('switch-btn','switch');bindButton('ability-btn','ability');
        function cancelTouchState(){resetJoy();resetAim();Object.keys(buttonPointers).forEach(function(key){buttonPointers[key].clear();buttons[key]=false;});Array.prototype.forEach.call(document.querySelectorAll('.btn-circle.is-active'),function(node){node.classList.remove('is-active');});}
        window.addEventListener('blur',cancelTouchState);if(document.addEventListener)document.addEventListener('visibilitychange',function(){if(document.hidden)cancelTouchState();});
    }

    function init() { resize();window.addEventListener('resize',resize);bindInputs();setupTouch();updateRecordLine();currentBiome=BIOMES[0];requestAnimationFrame(loop); }

    function setPartyRoster(roster){partyRoster=(roster||[]).slice(0,4);var live=Object.create(null);partyRoster.forEach(function(entry){live[entry.id]=true;var meta=entry.meta||{},color=PARTY_COLORS[entry.slot]||PARTY_COLORS[3];if(entry.id===localPeerId){if(player){player.slot=entry.slot;player.color=color;player.playerName=entry.name||localPlayerName;player.netId=entry.id;}if(queuedProfile){queuedProfile.slot=entry.slot;queuedProfile.color=color;queuedProfile.netId=entry.id;queuedProfile.name=entry.name||localPlayerName;}return;}var remote=remotePlayers[entry.id];if(!remote&&player){remote=new Player((entry.slot-1.5)*72,80,{classId:meta.classId||'independent',starterId:meta.starterId,color:color,netId:entry.id,name:entry.name,slot:entry.slot});remote.statBuys={};remotePlayers[entry.id]=remote;}else if(remote){remote.slot=entry.slot;remote.color=color;remote.playerName=entry.name||remote.playerName;}});Object.keys(remotePlayers).forEach(function(id){if(!live[id]){delete remotePlayers[id];delete remoteInputs[id];delete armoryReady[id];}});if(networkRole==='host')compactInPlace(pickups,function(item){return!item.targetId||!!live[item.targetId];});updatePartyHud();if(networkRole==='host'&&shopMode)maybeFinishArmory();}
    function enterWaitingLobby(options){options=options||{};networkRole=options.role||'local';if(networkRole!=='local'&&window.DKFreeze)window.DKFreeze.forceThaw();localPeerId=options.peerId||(networkRole==='local'?'local':localPeerId);localPlayerName=cleanRuntimeName(options.name||'KNIGHT');selectedClassId=CLASS_DEFS[options.classId]?options.classId:'independent';queuedStarterId=WEAPON_DEFS[options.starterId]?options.starterId:rollClassStarter(selectedClassId);queuedProfile={classId:selectedClassId,starterId:queuedStarterId,color:PARTY_COLORS[options.slot||0]||PARTY_COLORS[0],netId:localPeerId,name:localPlayerName,slot:options.slot||0};gameActive=false;gamePaused=false;lobbyActive=true;sceneMode='lobby';setUiScene('waiting');shopMode=false;wave=0;wavePhase=0;coins=0;score=0;kills=0;gameTimeMs=0;netInputClock=0;netSnapshotClock=0;netInputSeq=0;netLastAckSeq=0;netBuildSeq=0;netLastSnapshotSeq=0;netSceneRevision=0;netAppliedSceneRevision=-1;netAppliedWorldRevision=-1;netPredictionHistory=[];netPredictionError={x:0,y:0};netTransientSnapshotBudget=0;netLastInputSignature='';netOwnerResyncCount=0;netExternalApplied={x:0,y:0};netExternalTarget={x:0,y:0};releaseAllTransient();enemies=[];effects=[];pickups=[];obstacles=[];hazards=[];biomeProps=[];roomDecor=[];radiantWeapons=[];totems=[];pendingShots=[];remotePlayers=Object.create(null);remoteInputs=Object.create(null);player=new Player(0,180,queuedProfile);mainPlayer=player;player.statBuys={};enemies=[new Enemy(0,0,'trainingDummy')];currentBiome=BIOMES.find(function(b){return b.hazard==='tide';})||BIOMES[0];currentLayout=null;currentZoom=cameraBaseZoom()*cameraZoomSetting;targetZoom=currentZoom;camera={x:player.x-viewportWidth/currentZoom/2,y:player.y-viewportHeight/currentZoom/2};netWorldRevision++;netSentWorldRevision=-1;setPartyRoster(options.roster||partyRoster);updateHUD();updateWeaponHUD();updatePartyHud();resetSimulationClock();return{starterId:queuedStarterId,starterName:WEAPON_DEFS[queuedStarterId].name};}
    function enterWeaponTest(weaponId){
        if(!WEAPON_DEFS[weaponId])return false;
        editorTestPreviousGodMode=debugGodMode;
        editorTestPreviousSetup={classId:selectedClassId,starterId:queuedStarterId,profile:queuedProfile};
        enterWaitingLobby({role:'local',peerId:'editor-test',name:'EDITOR',classId:'independent',starterId:weaponId,slot:0,roster:[]});
        var testWeapon=weaponCopy(weaponId);if(!testWeapon){selectedClassId=editorTestPreviousSetup.classId;queuedStarterId=editorTestPreviousSetup.starterId;queuedProfile=editorTestPreviousSetup.profile;editorTestPreviousSetup=null;leaveToMenu();return false;}
        player.inventory=[testWeapon];player.weaponIndex=0;player.weapon=testWeapon;player.x=0;player.y=310;player.angle=-Math.PI/2;player.lastShot=-Infinity;player.hp=player.maxHp;player.armor=player.maxArmor;player.mana=player.maxMana;
        enemies=[new Enemy(-360,-210,'trainingDummy'),new Enemy(0,-300,'trainingDummy'),new Enemy(360,-210,'trainingDummy')];enemyGridReady=false;
        currentLayout=null;currentZoom=cameraBaseZoom()*cameraZoomSetting;targetZoom=currentZoom;camera={x:player.x-viewportWidth/currentZoom/2,y:player.y-viewportHeight/currentZoom/2};
        editorTestActive=true;debugGodMode=true;lobbyActive=true;gameActive=false;gamePaused=false;sceneMode='editorTest';setUiScene('editor-test');
        ['start-screen','class-screen','room-screen','waiting-screen','game-over-screen','pause-screen','inventory-screen','crafting-screen'].forEach(function(id){var node=el(id);if(node)node.style.display='none';});el('shop-room-ui').style.display='none';
        updateHUD();updateWeaponHUD();updatePartyHud();resetSimulationClock();return true;
    }
    function enterSkillTest(skillId){if(!ACTIVE_DEFS[skillId])return false;var starter=WEAPON_DEFS.rustPistol?'rustPistol':Object.keys(WEAPON_DEFS)[0];if(!enterWeaponTest(starter))return false;player.active=skillId;player.activeSkills[skillId]=Math.max(1,player.activeSkills[skillId]||1);player.activeLevel=player.activeSkills[skillId];player.activeCooldown=0;player.activeCooldowns[skillId]=0;player.mana=player.maxMana;updateHUD();updateCooldownHUD();return true;}
    function exitWeaponTest(){if(!editorTestActive)return false;leaveToMenu();return true;}
    function leaveToMenu(){if(networkRole!=='local'&&window.DKNet)window.DKNet.leaveRoom();if(editorTestActive){debugGodMode=editorTestPreviousGodMode;editorTestActive=false;if(editorTestPreviousSetup){selectedClassId=editorTestPreviousSetup.classId;queuedStarterId=editorTestPreviousSetup.starterId;queuedProfile=editorTestPreviousSetup.profile;}editorTestPreviousSetup=null;}networkRole='local';localPeerId='local';gameActive=false;gamePaused=false;lobbyActive=false;shopMode=false;sceneMode='menu';setUiScene('start');inventoryOpen=false;craftingOpen=false;releaseAllTransient();enemies=[];remotePlayers=Object.create(null);remoteInputs=Object.create(null);partyRoster=[];player=null;mainPlayer=null;el('waiting-screen').style.display='none';el('room-screen').style.display='none';el('class-screen').style.display='none';el('game-over-screen').style.display='none';el('shop-room-ui').style.display='none';el('start-screen').style.display='flex';if(window.DKUI)window.DKUI.showMainMenu();updatePartyHud();if(window.DKAudio)window.DKAudio.stopAllLoops();}
    function handleNetworkMessage(from,data){
        if(!data||!data.type)return;
        if(data.type==='input'&&networkRole==='host'){var clean=sanitizeNetworkInput(data.input),previous=remoteInputs[from];if(!previous||!clean.seq||clean.seq>=(previous.seq||0))remoteInputs[from]=clean;return;}
        if(data.type==='editor_bundle'&&networkRole==='host'){applyEditorNetworkBundle(data.bundle,{source:'guest:'+from,authoritative:false});if(window.DKNet)window.DKNet.broadcast({type:'control',action:'editor_bundle',editorBundle:editorNetworkBundle()});return;}
        if(data.type==='build_update'&&networkRole==='host'){if(shopMode)applyBuild(remotePlayers[from],data.build||{});return;}
        if(data.type==='armory_ready'&&networkRole==='host'){if(!shopMode)return;var member=remotePlayers[from];if(member){applyBuild(member,data.build||{});member.armoryReady=true;armoryReady[from]=true;}maybeFinishArmory();return;}
        if(data.type==='snapshot'&&networkRole==='guest'){applyNetworkSnapshot(data);return;}
        if(data.type!=='control'||networkRole!=='guest')return;
        if(data.action==='editor_bundle'){applyEditorNetworkBundle(data.editorBundle,{source:'host',authoritative:true});return;}
        var controlRevision=Math.max(0,Number(data.sceneRevision)||0);if(controlRevision<netAppliedSceneRevision)return;
        if(data.action==='start'){applyEditorNetworkBundle(data.editorBundle,{source:'host',authoritative:true});startGame(true);netAppliedSceneRevision=controlRevision;guestScene='run';sceneMode='run';}
        else if(data.action==='armory'){if(shopMode&&controlRevision===netAppliedSceneRevision)return;netAppliedSceneRevision=controlRevision;var partyState=data.players||[],selfState=partyState.find(function(state){return state.id===localPeerId;});if(selfState){setWallet(player,selfState.coins);player.resources=normalizeResources(selfState.resources);player.hp=selfState.hp;player.armor=selfState.armor;player.mana=selfState.mana;}wave=Number(data.wave)||wave;openShop();guestScene='armory';}
        else if(data.action==='resume'){if(!shopMode&&sceneMode==='run'&&controlRevision===netAppliedSceneRevision)return;netAppliedSceneRevision=controlRevision;finishArmory();wave=Number(data.wave)||wave;guestScene='run';showToast('PARTY DESCENDS','#bdf7ce');}
        else if(data.action==='end'){netAppliedSceneRevision=controlRevision;endGame(data.reason||'RUN ENDED');}
    }

    window.DKGame={
        classData:function(){return Object.keys(CLASS_DEFS).map(function(id){var def=CLASS_DEFS[id];return{id:id,name:def.name,pool:classStarterPool(id).slice(),trait:def.trait,traitDesc:def.traitDesc};});},
        rollStarter:function(classId){selectClass(classId);queuedStarterId=rollClassStarter(classId);return{id:queuedStarterId,name:WEAPON_DEFS[queuedStarterId].name,color:WEAPON_DEFS[queuedStarterId].color,category:WEAPON_DEFS[queuedStarterId].category};},
        configureNetwork:function(options){options=options||{};networkRole=options.role||networkRole;if(networkRole!=='local'&&window.DKFreeze)window.DKFreeze.forceThaw();localPeerId=options.peerId||localPeerId;localPlayerName=options.name||localPlayerName;if(options.snapshotHz)setNetworkSnapshotHz(options.snapshotHz);if(options.roster)setPartyRoster(options.roster);return{role:networkRole,peerId:localPeerId,snapshotHz:networkSnapshotHz};},
        enterLobby:enterWaitingLobby,
        enterWeaponTest:enterWeaponTest,
        enterSkillTest:enterSkillTest,
        exitWeaponTest:exitWeaponTest,
        isWeaponTest:function(){return editorTestActive;},
        setRoster:setPartyRoster,
        setCameraZoom:function(value){return setCameraZoom(value,false);},
        configureRuntimeSettings:configureRuntimeSettings,
        getRuntimeSettings:function(){return Object.assign({},runtimeSettings);},
        getKeybindings:getKeybindings,
        setKeybinding:setKeybinding,
        resetKeybindings:resetKeybindings,
        diagnosticReport:diagnosticReport,
        startRun:function(){if(networkRole==='guest')return false;startGame(false);return true;},
        leaveToMenu:leaveToMenu,
        handleNetworkMessage:handleNetworkMessage,
        networkSnapshot:function(){return{role:networkRole,scene:sceneMode,sceneRevision:netSceneRevision,appliedSceneRevision:netAppliedSceneRevision,players:partyPlayers().map(playerSnapshot),partyCount:partyCount(),wave:wave,shop:shopMode,snapshotHz:networkSnapshotHz};},
        exportBuild:function(){return player?serializeBuild(player):null;},
        applySnapshot:applyNetworkSnapshot,
        toast:showToast,
        modApi:{
            player:function(){return player;},
            party:function(){return partyPlayers().slice();},
            enemies:function(){return enemies;},
            bullets:function(){return bullets;},
            pickups:function(){return pickups;},
            hazards:function(){return hazards;},
            effects:function(){return effects;},
            spawnEnemy:function(x,y,kind,elite){return spawnEnemy(Number(x)||0,Number(y)||0,kind,!!elite);},
            spawnBullet:function(options){var bullet=spawnBullet(options||{});bullets.push(bullet);return bullet;},
            addCoins:function(amount){coins=Math.max(0,coins+(Number(amount)||0));updateHUD();return coins;},
            addEffect:function(effect){effects.push(effect);return effect;},
            damageEnemy:damageEnemy,
            state:function(){return{active:gameActive,paused:gamePaused,scene:sceneMode,wave:wave,phase:wavePhase,coins:coins,score:score,kills:kills,biome:currentBiome};}
        },
        getListenerPosition: function () {
            var p = (typeof mainPlayer !== 'undefined' && mainPlayer) || (typeof player !== 'undefined' && player);
            return p ? { x: p.x, y: p.y } : null;
        }
    };

    if(window.DKFreeze){
        window.DKFreeze.configure({
            isAllowed:function(){return networkRole==='local';},
            roleLabel:function(){return networkRole;},
            getZoom:function(){return currentZoom;},
            setCameraOffset:function(dx,dy){camera.x+=dx;camera.y+=dy;},
            onFreeze:function(){if(window.DKAudio&&window.DKAudio.setBusDucked){window.DKAudio.setBusDucked('ui',true);window.DKAudio.setBusDucked('combat',true);window.DKAudio.setBusDucked('world',true);}},
            onThaw:function(){if(window.DKAudio&&window.DKAudio.setBusDucked){window.DKAudio.setBusDucked('ui',false);window.DKAudio.setBusDucked('combat',false);window.DKAudio.setBusDucked('world',false);}resetSimulationClock();}
        });
        window.DKFreeze.register('run',function(){return{role:networkRole,scene:sceneMode,wave:wave,wavePhase:wavePhase,coins:coins,score:score,kills:kills,biome:currentBiome?currentBiome.name:'',gameActive:gameActive,gamePaused:gamePaused,shopMode:shopMode};});
        window.DKFreeze.register('player',function(){return player?{x:Math.round(player.x),y:Math.round(player.y),hp:player.hp,maxHp:player.maxHp,armor:player.armor,mana:player.mana,downed:!!player.downed,dashing:!!player.isDashing,weapon:player.weapon?player.weapon.id:''}:null;});
        window.DKFreeze.register('enemies',function(){return{count:enemies.length,sample:enemies.slice(0,10).map(function(e){return{kind:e.kind,x:Math.round(e.x),y:Math.round(e.y),hp:e.hp,elite:!!e.elite};})};});
        window.DKFreeze.register('perf',function(){return{fps:Math.round(perfTelemetry.fps),frameMs:+perfTelemetry.frameMs.toFixed(2),simMs:+perfTelemetry.simulationMs.toFixed(2),renderMs:+perfTelemetry.renderMs.toFixed(2)};});
    }

    window.DK_DEBUG = {
        giveWeapon: function(query){
            if(!player)return false;var raw=String(query||'').trim(),needle=raw.toLowerCase(),id=WEAPON_DEFS[raw]?raw:Object.keys(WEAPON_DEFS).find(function(key){return String(WEAPON_DEFS[key].name||'').toLowerCase()===needle;});
            if(!id)return false;var existing=player.getWeapon(id);if(!existing){existing=weaponCopy(id);if(!existing)return false;player.inventory.push(existing);}player.weaponIndex=player.inventory.indexOf(existing);player.weapon=existing;player.charge=0;updateWeaponHUD();if(inventoryOpen)renderInventory();return id;
        },
        listWeapons: function(){var rows=Object.keys(WEAPON_DEFS).map(function(id){var w=WEAPON_DEFS[id];return{id:id,name:w.name,rarity:w.rarity,category:w.category,family:w.family||''};});if(typeof console!=='undefined'&&console.table)console.table(rows);return rows;},
        heldWeaponRenderTrial:function(){var id='__render_exclusivity_trial__',calls=0,before=Object.assign({},heldRenderAudit);WEAPON_RENDERERS[id]=function(){calls++;};try{drawHeldWeapon({id:id,category:'GUN',color:'#fff'},true,'#fff');}finally{delete WEAPON_RENDERERS[id];}return{rendererCalls:calls,customBranches:heldRenderAudit.custom-before.custom,fallbackBranches:heldRenderAudit.fallback-before.fallback,exclusive:calls===1&&heldRenderAudit.custom-before.custom===1&&heldRenderAudit.fallback-before.fallback===0};},
        inputSettingsTrial:function(){var savedBindings=getKeybindings(),savedTouch=touchMode,savedAim=Object.assign({},aimJoystick),savedBody=document.body.getAttribute('data-mobile-attack'),result={};setKeybinding('moveUp','KeyZ');setKeybinding('moveDown','KeyZ');var swapped=getKeybindings();result.duplicateSwap=swapped.moveDown==='KeyZ'&&swapped.moveUp==='KeyS';keybindings=Object.assign({},savedBindings);safeStorageSet('dungeonKnightKeybinds',JSON.stringify(keybindings));touchMode=true;document.body.setAttribute('data-mobile-attack','aim');aimJoystick.active=true;aimJoystick.angle=1.234;aimJoystick.strength=1;var input=localInputState();result.aimStick=input.fire&&Math.abs(input.angle-1.234)<1e-9;result.fixedNetworkRate=setNetworkSnapshotHz(20)===30&&NET_SNAPSHOT_FRAMES===2;result.unicodeNames=cleanRuntimeName('勇者かな')==='勇者かな'&&cleanRuntimeName('อัศวิน')==='อัศวิน';touchMode=savedTouch;Object.assign(aimJoystick,savedAim);if(savedBody==null)document.body.removeAttribute('data-mobile-attack');else document.body.setAttribute('data-mobile-attack',savedBody);clearBoundInputs();return result;},
        giveCoins: function(amount){var value=Math.max(0,Math.floor(Number(amount)||0));coins+=value;updateHUD();return coins;},
        godMode: function(enabled){debugGodMode=!!enabled;if(debugGodMode&&player){player.hp=player.maxHp;player.armor=player.maxArmor;player.mana=player.maxMana;player.invuln=0;updateHUD();}return debugGodMode;},
        help: function(){var commands=['DK_DEBUG.giveWeapon("weaponId")','DK_DEBUG.listWeapons()','DK_DEBUG.giveLegendaryWeapons()','DK_DEBUG.legendaryBoss("ember")','DK_DEBUG.legendaryBoss("prism", "dawnstarCannon")','DK_DEBUG.giveCoins(9999)','DK_DEBUG.godMode(true)','DK_DEBUG.godMode(false)','DK_DEBUG.listBiomes()','DK_DEBUG.setBiome("ember")','DK_DEBUG.nextBiome()','DK_DEBUG.previousBiome()','DK_DEBUG.autoCycleBiomes(6000)','DK_DEBUG.stopBiomeCycle()','DK_DEBUG.help()'];if(typeof console!=='undefined')console.log(commands.join('\n'));return commands;},
        start: startGame,
        selectClass: selectClass,
        classData: function(){return Object.keys(CLASS_DEFS).map(function(id){var c=CLASS_DEFS[id];return{id:id,name:c.name,maxHp:c.maxHp,maxArmor:c.maxArmor,maxMana:c.maxMana,manaRegen:c.manaRegen,manaTickAmount:c.manaTickAmount||0,manaTickFrames:c.manaTickFrames||0,manaDropBonus:c.manaDropBonus||0,armorDelay:c.armorDelay,armorTick:c.armorTick,trait:c.trait,traitDesc:c.traitDesc,starter:c.starter.slice(),shop:Object.assign({},c.shop)};});},
        starterPoolData: function(){var allCommon=Object.keys(WEAPON_DEFS).filter(function(id){return WEAPON_DEFS[id].rarity==='common';});var result={allCommon:allCommon.slice()};Object.keys(CLASS_DEFS).forEach(function(id){var categories=CLASS_DEFS[id].starter;result[id]=allCommon.filter(function(weaponId){return categories.indexOf(WEAPON_DEFS[weaponId].category)>=0;});});return result;},
        state: function(){var boss=enemies.find(function(enemy){return enemy.isBoss&&!enemy.dead;}),recipe=currentCraftRecipe();return{active:gameActive,paused:gamePaused,scene:sceneMode,networkRole:networkRole,snapshotHz:networkSnapshotHz,partyCount:partyCount(),shopMode:shopMode,inventoryOpen:inventoryOpen,craftingOpen:craftingOpen,nearbyShopIndex:nearbyShopIndex,nearbyForge:nearbyForge,nearbyCraft:nearbyCraft,rerollCost:getRerollCost(),shopRerolls:shopRerolls,armoryReady:!!(player&&player.armoryReady),armoryReadyCount:Object.keys(armoryReady).length,wave:wave,wavePhase:wavePhase,wavePhaseTotal:wavePhaseTotal,phaseBreak:phaseBreak,phaseSpawnCounts:phaseSpawnCounts.slice(),biome:currentBiome.name,layout:currentLayout?currentLayout.id:'',classId:player?player.classId:selectedClassId,className:player?player.className:CLASS_DEFS[selectedClassId].name,classTrait:player?player.traitName:CLASS_DEFS[selectedClassId].trait,coins:coins,enemies:enemies.length,trainingDummies:enemies.filter(function(enemy){return!!enemy.trainingDummy;}).length,predictionAck:netLastAckSeq,predictionError:Math.hypot(netPredictionError.x,netPredictionError.y),ownerResyncs:netOwnerResyncCount,boss:boss?{key:boss.bossKey,name:boss.name,hp:boss.hp,maxHp:boss.maxHp,combo:boss.comboName,enraged:boss.enraged,apex:boss.apex}:null,pickups:pickups.length,manaPickups:pickups.filter(function(p){return p.kind==='mana';}).length,resourcePickups:pickups.filter(function(p){return p.kind==='resource';}).length,resources:player?normalizeResources(player.resources):emptyResourceBag(),hazards:hazards.length,biomeProps:biomeProps.length,roomDecor:roomDecor.length,obstacles:obstacles.length,rectObstacles:obstacles.filter(function(o){return o.shape==='rect';}).length,radiantWeapons:radiantWeapons.length,waveVacuum:waveVacuum,vacuumCoins:pickups.filter(function(p){return p.kind==='coin'&&p.vacuum;}).length,weapons:player?player.inventory.map(function(w){return w.id;}):[],equipped:player&&player.weapon?player.weapon.id:'',equippedCategory:player&&player.weapon?player.weapon.category:'',equippedRarity:player&&player.weapon?player.weapon.rarity:'',weaponLevel:player&&player.weapon?player.weapon.level:0,forgeCost:player&&player.weapon?getForgeCost(player.weapon):0,activeSkill:player?player.active:null,activeOwned:player?Object.keys(player.activeSkills).length:0,passiveOwned:player?Object.keys(player.passives).length:0,hp:player?player.hp:0,maxHp:player?player.maxHp:0,armor:player?player.armor:0,maxArmor:player?player.maxArmor:0,armorRegenDelay:player?player.armorRegenDelay:0,armorRegenInterval:player?player.armorRegenInterval:0,mana:player?player.mana:0,maxMana:player?player.maxMana:0,manaRegenMultiplier:player?player.manaRegenMultiplier:0,rrTime:player?player.rrTime:0,resonance:player?player.resonance:0,resonanceKind:player?player.resonanceKind:'',resonanceTimer:player?player.resonanceTimer:0,primeMemory:player?player.primeMemory:'',memoryCount:player?Object.keys(player.memories).length:0,memoryProgress:player?Object.assign({},player.memoryProgress):{},attackAnim:player?player.attackAnim:0,attackAnimKind:player?player.attackAnimKind:'',attackAnimWeapon:player?player.attackAnimWeapon:'',cameraZoom:cameraZoomSetting,currentZoom:currentZoom,gameTimeMs:gameTimeMs,renderScale:renderScale,pixelRatio:pixelRatio,canvasWidth:canvas.width,canvasHeight:canvas.height,arenaLimit:ARENA_LIMIT,worldLimit:WORLD_LIMIT,perf:{collisionCandidates:perfStats.collisionCandidates,collisionChecks:perfStats.collisionChecks,closestCandidates:perfStats.closestCandidates,culledDraws:perfStats.culledDraws,drawnEntities:perfStats.drawnEntities},pool:{bulletActive:bullets.length,bulletFree:bulletPool.length,particleActive:particles.length,particleFree:particlePool.length,slashActive:slashes.length,slashFree:slashPool.length,stats:Object.assign({},poolStats)},offers:shopOffers.map(function(o){return o.group+':'+o.id;}),offerDetails:shopOffers.map(function(o){return{group:o.group,id:o.id,rarity:o.rarity,price:o.price,bought:!!o.bought};}),offerCount:shopOffers.length,boughtOffers:shopOffers.filter(function(o){return o.bought;}).length,shopForgePurchases:shopForgePurchases,shopCrafts:shopCrafts,craftRecipe:recipe.id,craftResult:recipe.result,craftParts:recipe.parts.slice(),craftResources:Object.assign({},recipe.resources),craftCoins:recipe.coins};},
        position: function(){return player?{id:player.netId,x:player.x,y:player.y,predictionError:Math.hypot(netPredictionError.x,netPredictionError.y),ack:netLastAckSeq,ownerResyncs:netOwnerResyncCount}:null;},
        armory: function(){if(!gameActive)startGame();var before={biome:currentBiome.name,equipped:player.weapon.id,layout:currentLayout&&currentLayout.id,scene:sceneMode};coins=999;enemies=[];wave=5;waveTransition=true;openShop();return{before:before,after:{biome:currentBiome.name,equipped:player.weapon.id,layout:currentLayout&&currentLayout.id,scene:sceneMode}};},
        approachOffer: function(index){if(!shopMode||!shopPlatforms[index])return false;player.x=shopPlatforms[index].x;player.y=shopPlatforms[index].y+75;updateShopRoom(1);return nearbyShopIndex===index;},
        buyNearby: function(){if(nearbyShopIndex<0)return false;var before=shopOffers[nearbyShopIndex].bought;buyOffer(nearbyShopIndex);return!before&&shopOffers[nearbyShopIndex].bought;},
        contextAction: function(){if(!shopMode)return{acted:false,shots:0,craftingOpen:false};var beforeShots=bullets.length,beforeCoins=coins,beforeBought=shopOffers.filter(function(o){return o.bought;}).length,beforeLevel=player.weapon.level;shopInteractLock=false;mouse.down=true;updateShopRoom(1,gameTimeMs+16.67,16.67);mouse.down=false;shopInteractLock=false;return{acted:craftingOpen||coins<beforeCoins||shopOffers.filter(function(o){return o.bought;}).length>beforeBought||player.weapon.level>beforeLevel,shots:bullets.length-beforeShots,craftingOpen:craftingOpen,coinsSpent:beforeCoins-coins,bought:shopOffers.filter(function(o){return o.bought;}).length-beforeBought,forged:player.weapon.level-beforeLevel};},
        approachForge: function(){if(!shopMode)return false;player.x=shopForge.x;player.y=shopForge.y+72;updateShopRoom(1);return nearbyForge;},
        forgeNearby: function(){if(!nearbyForge)return false;return forgeEquippedWeapon();},
        approachCraft: function(){if(!shopMode)return false;player.x=shopCraft.x;player.y=shopCraft.y+72;updateShopRoom(1);return nearbyCraft;},
        focusRecipe: function(index){if(!shopMode)return false;craftRecipeIndex=clamp(Math.floor(index),0,CRAFT_RECIPES.length-1);focusedRecipeId=currentCraftRecipe().id;renderShop();return true;},
        grantRecipeParts: function(){if(!shopMode)return false;var recipe=currentCraftRecipe();for(var i=0;i<recipe.parts.length;i++)if(!player.hasWeapon(recipe.parts[i]))player.inventory.push(weaponCopy(recipe.parts[i]));Object.keys(recipe.resources||{}).forEach(function(id){addResource(player,id,Math.max(0,recipe.resources[id]-(resourcesFor(player)[id]||0)));});coins=Math.max(coins,recipe.coins+20);return true;},
        openCraftNearby: function(){return openCraftingUI();},
        craftNearby: function(){if(!craftingOpen)openCraftingUI();return craftCurrentRecipe();},
        recipeData: function(){return CRAFT_RECIPES.map(function(r){return{id:r.id,result:r.result,tier:r.tier,coins:r.coins,parts:r.parts.slice(),partRarities:r.parts.map(function(id){return WEAPON_DEFS[id].rarity;}),resources:Object.assign({},r.resources),resourceTotal:Object.keys(r.resources||{}).reduce(function(total,id){return total+r.resources[id];},0)};});},
        leaveArmory: leaveShop,
        partyBuilds: function(){return partyPlayers().map(function(member){return{id:member.netId,coins:walletFor(member),weapons:member.inventory.map(function(w){return w.id;}),ready:!!member.armoryReady,resources:normalizeResources(member.resources)};});},
        biomeAtWave: function(n){wave=Math.max(1,Math.floor(n));player.x=0;player.y=0;prepareEnvironment();return{name:currentBiome.name,hazard:currentBiome.hazard,prop:currentBiome.prop,resonance:currentBiome.resonance,enemy:currentBiome.enemy,enemy2:currentBiome.enemy2,mechanic:currentBiome.mechanic,hazardCount:hazards.length,propCount:biomeProps.length,layout:currentLayout.id,decorCount:roomDecor.length,rectObstacles:obstacles.filter(function(o){return o.shape==='rect';}).length};},
        biomeData: function(){return BIOMES.map(function(b){var art=BIOME_ART[b.hazard];return{name:b.name,hazard:b.hazard,prop:b.prop,resonance:b.resonance,enemy:b.enemy,enemy2:b.enemy2,mechanic:b.mechanic,tileA:art.tileA,tileB:art.tileB,wall:art.wall,wallTop:art.wallTop,structure:art.structure,motif:art.motif,landscape:art.landscape,land:art.land,terrain:art.terrain,grade:art.grade};});},
        bossData: function(){return Object.keys(BOSS_DEFS).map(function(key){var b=BOSS_DEFS[key];return{key:key,name:b.name,title:b.title,color:b.color,radius:b.radius,hp:b.hp,speed:b.speed,combos:b.combos.slice(),loot:Object.assign({},b.loot)};});},
        bossTrial: function(){
            if(!gameActive)startGame();var saved={wave:wave,phase:wavePhase,phaseCounts:phaseSpawnCounts,biome:currentBiome,enemies:enemies,bullets:bullets,hazards:hazards,obstacles:obstacles,props:biomeProps,decor:roomDecor,transition:waveTransition,breakState:phaseBreak,breakTimer:phaseBreakTimer,worldSlow:worldSlowTimer,x:player.x,y:player.y,hp:player.hp,armor:player.armor,mana:player.mana,invuln:player.invuln,dashing:player.isDashing,cut:Object.assign({},palaceCutscene),fallen:palaceStatueFallen},result={};
            try{var keys=Object.keys(BOSS_DEFS),comboRuns=0,expected=0;player.x=0;player.y=0;player.invuln=99999;obstacles=[];biomeProps=[];roomDecor=[];keys.forEach(function(key){currentBiome=BIOMES.find(function(b){return b.hazard===key;});enemies=[];bullets=[];hazards=[];var sovereign=new BiomeBoss(320,0,key);enemies=[sovereign];expected+=sovereign.bossDef.combos.length;for(var combo=0;combo<sovereign.bossDef.combos.length;combo++){sovereign.executeCombo(combo,player);comboRuns++;}});result.comboMatrix=comboRuns===expected;wave=5;currentBiome=BIOMES[0];enemies=[];bullets=[];hazards=[];wavePhase=2;phaseSpawnCounts=wavePhaseCounts(wave);spawnWavePhase(2);result.darkSpiritCutscene=palaceCutscene.active&&enemies.length===0;for(var frame=0;frame<260;frame++)updatePalaceBossCutscene(1);var boss=enemies[0];result.phaseSpawn=enemies.length===1&&boss&&boss.isBoss&&boss.bossKey==='ember'&&boss.name==='DARK SPIRIT';boss.hp=boss.maxHp*.5;boss.update(0);var enraged=boss.enraged;boss.hp=boss.maxHp*.2;boss.update(0);result.threeStages=enraged&&boss.apex;boss.comboName=boss.bossDef.combos[4];boss.comboState='scarTell';boss.shadowState='scarTell';boss.attackZones=[{x:10,y:20,hit:false}];var snapshot=enemySnapshot(boss);enemies=[];applyEnemySnapshots([snapshot]);result.snapshotRoundTrip=enemies.length===1&&enemies[0].isBoss&&enemies[0].bossKey==='ember'&&enemies[0].comboName===boss.bossDef.combos[4]&&enemies[0].shadowState==='scarTell'&&enemies[0].attackZones.length===1&&enemies[0].apex;result.darkSpiritHealth=BOSS_DEFS.ember.hp===430;result.noGlobalCurtain=typeof BiomeBoss.prototype['fire'+'Curtain']==='undefined';result.fiveWaveBossScaling=bossHealthScaleAt(5)===1&&Math.abs(bossHealthScaleAt(10)-1.09)<1e-9&&bossHealthScaleAt(15)>bossHealthScaleAt(10)&&bossHealthScaleAt(100)<=2.25;var intent=predictedPlayerPoint({x:0,y:0,motionX:4,motionY:-2},15,120);result.predictiveTargeting=intent.x===60&&intent.y===-30;var dashHp=player.hp;player.isDashing=true;player.invuln=0;player.hit(3,'dash trial');result.dashDodge=player.hp===dashHp;player.isDashing=false;var mine=new TimedField(0,0,68,'enemyMine',122);mine.armTime=78;mine.damage=1.35;result.fairMine=mine.radius===68&&mine.armTime===78&&mine.damage===1.35;wave=10;currentBiome=BIOMES[1];var summonBoss=new BiomeBoss(320,0,'frost');enemies=[summonBoss];window.DKBossQuality.summonWave(summonBoss,BOSS_BEHAVIOR_API,2);window.DKBossQuality.summonWave(summonBoss,BOSS_BEHAVIOR_API,3);window.DKBossQuality.summonWave(summonBoss,BOSS_BEHAVIOR_API,3);result.limitedSummons=summonBoss.summonCount===3&&enemies.filter(function(enemy){return enemy.bossSummon;}).length===3;result.winterRebuild=BIOME_ART.frost.landscape==='frozenSanctum'&&/^rgba\(/.test(BIOME_ART.frost.grade||'');
            }finally{wave=saved.wave;wavePhase=saved.phase;phaseSpawnCounts=saved.phaseCounts;currentBiome=saved.biome;enemies=saved.enemies;bullets=saved.bullets;hazards=saved.hazards;obstacles=saved.obstacles;biomeProps=saved.props;roomDecor=saved.decor;waveTransition=saved.transition;phaseBreak=saved.breakState;phaseBreakTimer=saved.breakTimer;worldSlowTimer=saved.worldSlow;player.x=saved.x;player.y=saved.y;player.hp=saved.hp;player.armor=saved.armor;player.mana=saved.mana;player.invuln=saved.invuln;player.isDashing=saved.dashing;palaceStatueFallen=saved.fallen;Object.assign(palaceCutscene,saved.cut);enemyGridReady=false;updateBossHud();}return result;
        },
        bossPatternTrial:function(){
            if(!gameActive)startGame();var saved={wave:wave,biome:currentBiome,enemies:enemies,bullets:bullets,hazards:hazards,obstacles:obstacles,props:biomeProps,decor:roomDecor,effects:effects,particles:particles,slashes:slashes,x:player.x,y:player.y,hp:player.hp,armor:player.armor,invuln:player.invuln,terrain:player.terrainSlow},result={runs:0,completed:0,finite:true,maxBullets:0,maxArenaZones:0,errors:[]};
            try{wave=80;player.x=0;player.y=0;player.invuln=999999;player.hp=player.maxHp;player.armor=player.maxArmor;obstacles=[];biomeProps=[];roomDecor=[];Object.keys(BOSS_DEFS).forEach(function(key){for(var combo=0;combo<BOSS_DEFS[key].combos.length;combo++){result.runs++;bullets=[];hazards=[];effects=[];particles=[];slashes=[];var boss=new BiomeBoss(320,0,key),isFinal=combo===BOSS_DEFS[key].combos.length-1,isSecond=!isFinal&&combo>=3;boss.hp=boss.maxHp*(isFinal?.2:isSecond?.5:.9);boss.enraged=isSecond||isFinal;boss.apex=isFinal;boss.patternPhase=isFinal?3:isSecond?2:1;enemies=[boss];try{boss.executeCombo(combo,player);var finished=false;for(var frame=0;frame<780;frame++){player.terrainSlow=1;boss.update(1);updateBullets(1);hazards.forEach(function(h){if(!h.dead&&h.update)h.update(1);});particles.forEach(function(p){p.update(1);});updateEffects(1);if(frame%24===0)boss.draw();result.maxBullets=Math.max(result.maxBullets,bullets.length);result.maxArenaZones=Math.max(result.maxArenaZones,(boss.arenaZones||[]).length);if(!isFinite(boss.x)||!isFinite(boss.y)||bullets.some(function(b){return!isFinite(b.x)||!isFinite(b.y)||!isFinite(b.vx)||!isFinite(b.vy);})){result.finite=false;throw new Error('non-finite combat state');}cleanArrays();if(frame>4&&boss.comboState==='roam'&&(key!=='ember'||boss.shadowState==='roam')){finished=true;break;}}if(finished)result.completed++;else result.errors.push(key+':'+combo+':timeout:'+boss.comboState);}catch(error){result.errors.push(key+':'+combo+':'+String(error&&error.message||error));}}});}
            finally{wave=saved.wave;currentBiome=saved.biome;enemies=saved.enemies;bullets=saved.bullets;hazards=saved.hazards;obstacles=saved.obstacles;biomeProps=saved.props;roomDecor=saved.decor;effects=saved.effects;particles=saved.particles;slashes=saved.slashes;player.x=saved.x;player.y=saved.y;player.hp=saved.hp;player.armor=saved.armor;player.invuln=saved.invuln;player.terrainSlow=saved.terrain;enemyGridReady=false;}return result;
        },
        layoutData: function(){return ROOM_LAYOUTS.map(function(l){return{id:l.id,biome:l.biome,name:l.name,inlay:l.inlay,clearRadius:l.clearRadius,walls:l.walls.length,pillars:l.pillars.length,props:l.props.length,hazards:l.hazards.length,decor:l.decor.length,centerClear:layoutKeepsLandmarkClear(l),wallSignature:l.walls.map(function(w){return w.join(',');}).join('|')};});},
        enemyData: function(){return Object.keys(ENEMY_BASE).filter(function(kind){return kind!=='trainingDummy';});},
        enemyHpTrial: function(){
            if(!gameActive)startGame();var oldWave=wave,oldPacts=player.pacts,oldEnemies=enemies;player.pacts={};var checks=[1,10,11,20,21,30,31,40,41,70],samples=[],maxRatioError=0;for(var ci=0;ci<checks.length;ci++){wave=checks[ci];enemies=[];var test=spawnEnemy(500,500,'chaser',true),ratio=test.maxHp/ENEMY_BASE.chaser.hp;samples.push({wave:wave,ratio:ratio,hp:test.maxHp});maxRatioError=Math.max(maxRatioError,Math.abs(ratio-enemyHpScaleAt(wave)));}wave=41;enemies=[];Object.keys(ENEMY_BASE).filter(function(kind){return kind!=='trainingDummy';}).forEach(function(kind){var foe=spawnEnemy(500,500,kind,true);maxRatioError=Math.max(maxRatioError,Math.abs(foe.maxHp/ENEMY_BASE[kind].hp-3.5));});var shield=spawnEnemy(520,520,'shield',true).shieldMax;enemies=oldEnemies;wave=oldWave;player.pacts=oldPacts;enemyGridReady=false;return{samples:samples,maxRatioError:maxRatioError,shield:shield};
        },
        mineFairnessTrial:function(){
            if(!gameActive)startGame();var saved={x:player.x,y:player.y,hp:player.hp,armor:player.armor,mana:player.mana,invuln:player.invuln,dashing:player.isDashing,dodge:player.stats.dodge,passives:player.passives,guard:player.phaseGuardAvailable,meleeGuard:player.meleeGuard,debug:debugGodMode,bullets:bullets,hazards:hazards,effects:effects,particles:particles},result={};
            try{debugGodMode=false;player.stats.dodge=0;player.passives={};player.phaseGuardAvailable=false;player.meleeGuard=0;player.mana=0;player.armor=0;player.hp=player.maxHp;player.invuln=0;player.isDashing=false;bullets=[];hazards=[];effects=[];particles=[];player.x=176;player.y=0;var escapedHp=player.hp,escaped=new TimedField(0,0,68,'enemyMine',122);escaped.armTime=78;escaped.damage=1.35;escaped.update(78);result.livePositionEscape=player.hp===escapedHp;result.visibleShardGap=bullets.length===5&&bullets.every(function(b){return b.sourceId==='powderSurveyorMine';});bullets=[];player.x=0;player.hp=player.maxHp;player.invuln=0;var caught=new TimedField(0,0,68,'enemyMine',122);caught.armTime=78;caught.damage=1.35;caught.update(78);result.insideTakesDamage=player.hp<player.maxHp;bullets=[];player.x=0;player.hp=player.maxHp;player.invuln=0;var lateExit=new TimedField(0,0,68,'enemyMine',122);lateExit.armTime=78;lateExit.damage=1.35;lateExit.update(70);player.x=176;lateExit.update(8);result.lateExitWorks=player.hp===player.maxHp;
            }finally{player.x=saved.x;player.y=saved.y;player.hp=saved.hp;player.armor=saved.armor;player.mana=saved.mana;player.invuln=saved.invuln;player.isDashing=saved.dashing;player.stats.dodge=saved.dodge;player.passives=saved.passives;player.phaseGuardAvailable=saved.guard;player.meleeGuard=saved.meleeGuard;debugGodMode=saved.debug;bullets=saved.bullets;hazards=saved.hazards;effects=saved.effects;particles=saved.particles;}return result;
        },
        damageNumberTrial:function(){var savedEffects=effects,savedTick=visualTick,target={x:player?player.x:0,y:player?player.y:0,radius:20,damageTextAt:0,damageTextLane:0};effects=[];visualTick=120;for(var i=0;i<7;i++)addDamageFloat(i+1,target,'#fff');var numbers=effects.filter(function(effect){return effect.damageNumber;}),uniqueX=Object.create(null);numbers.forEach(function(effect){uniqueX[effect.x]=true;});updateEffects(1);var result={count:numbers.length,unique:Object.keys(uniqueX).length,drifting:numbers.some(function(effect){return effect.vx!==0;})};effects=savedEffects;visualTick=savedTick;return result;},
        projectileIdentityTrial:function(){var ids=Object.keys(WEAPON_DEFS),fallback=[],models=Object.create(null),missing=[];ids.forEach(function(id){if(typeof PROJECTILE_RENDERERS[id]==='function'&&!WEAPON_DEFS[id].editorAutoProjectileIdentity)return;var profile=VISUALS&&typeof VISUALS.weaponProjectileProfile==='function'?VISUALS.weaponProjectileProfile(id,{type:'orb'}):null;fallback.push(id);if(!profile||!profile.modelId||!profile.impactModelId)missing.push(id);else models[profile.modelId]=true;});return{weapons:ids.length,bespoke:ids.length-fallback.length,fallback:fallback.length,modelDiversity:Object.keys(models).length,missing:missing,dotFallbacks:fallback.filter(function(id){var profile=VISUALS.weaponProjectileProfile(id,{type:'orb'});return!profile||profile.modelId==='round';}),samples:{rifle:VISUALS.weaponProjectileProfile('wardenAr',{type:'orb'}).modelId,launcher:VISUALS.weaponProjectileProfile('pipeRocket',{type:'orb'}).modelId,shotgun:VISUALS.weaponProjectileProfile('coachScatter',{type:'orb'}).modelId,bow:VISUALS.weaponProjectileProfile('oakBow',{type:'arrow'}).modelId,magic:VISUALS.weaponProjectileProfile('inkboundPrimer',{type:'orb'}).modelId,tidal:VISUALS.weaponProjectileProfile('tidalDrumgun',{type:'orb'}).modelId}};},
        weaponBeautyTrial:function(){
            var ids=Object.keys(WEAPON_DEFS),savedEffects=effects,savedParticles=particles;effects=[];particles=[];addWeaponFlash(WEAPON_DEFS.sunlionCenser,0,0,0);var result={weapons:ids.length,classicPresentation:true,weaponColorFlash:effects[0]&&effects[0].color===WEAPON_DEFS.sunlionCenser.color,legendarySigil:effects.some(function(effect){return effect.type==='legendarySigil';}),sunlionColor:WEAPON_DEFS.sunlionCenser.color};effects=savedEffects;particles=savedParticles;return result;
        },
        biomeVariantTrial:function(){
            if(!gameActive)startGame();var saved={biome:currentBiome,wave:wave,enemies:enemies,bullets:bullets,hazards:hazards,effects:effects,particles:particles,obstacles:obstacles,props:biomeProps,nextId:nextEntityId,x:player.x,y:player.y,hp:player.hp,armor:player.armor,mana:player.mana,invuln:player.invuln},rows=[],hpValues=[],budgetActive=0;
            try{wave=1;player.x=0;player.y=0;player.invuln=99999;obstacles=[];biomeProps=[];BIOMES.forEach(function(biome){currentBiome=biome;enemies=[];bullets=[];hazards=[];effects=[];particles=[];var foe=spawnEnemy(-260,0,'chaser',true);foe.variantActive=true;foe.variantClock=foe.biomeVariant.cooldown;foe.beginBiomeVariant(player);var telegraphed=foe.variantState==='telegraph'&&isFinite(foe.variantTargetX)&&isFinite(foe.variantTargetY),beforeX=foe.x,beforeY=foe.y;foe.variantTimer=0;foe.updateBiomeVariant(1,player);var output=bullets.length+hazards.length+effects.length+(Math.hypot(foe.x-beforeX,foe.y-beforeY)>1?1:0);hpValues.push(foe.maxHp);rows.push({biome:biome.hazard,name:foe.biomeVariant.name,skill:foe.biomeVariant.skill,sigil:foe.biomeVariant.sigil,skin:foe.color!==ENEMY_BASE.chaser.color,telegraphed:telegraphed,output:output});});currentBiome=BIOMES[0];enemies=[];for(var i=0;i<30;i++){var budgetFoe=spawnEnemy(500+i,500,'chaser',true);if(budgetFoe.variantActive)budgetActive++;}var dummy=new Enemy(0,0,'trainingDummy'),hpMin=Math.min.apply(Math,hpValues),hpMax=Math.max.apply(Math,hpValues);return{variants:rows.length,uniqueNames:new Set(rows.map(function(row){return row.name;})).size,uniqueSkills:new Set(rows.map(function(row){return row.skill;})).size,uniqueSigils:new Set(rows.map(function(row){return row.sigil;})).size,allSkinned:rows.every(function(row){return row.skin;}),allTelegraphed:rows.every(function(row){return row.telegraphed;}),allTriggered:rows.every(function(row){return row.output>0;}),noHpInflation:hpMax-hpMin<1e-8,hpRange:hpMax-hpMin,regularActives:budgetActive,regularSamples:30,dummyExcluded:!dummy.biomeVariant&&!dummy.variantActive,rows:rows};}
            finally{currentBiome=saved.biome;wave=saved.wave;enemies=saved.enemies;bullets=saved.bullets;hazards=saved.hazards;effects=saved.effects;particles=saved.particles;obstacles=saved.obstacles;biomeProps=saved.props;nextEntityId=saved.nextId;player.x=saved.x;player.y=saved.y;player.hp=saved.hp;player.armor=saved.armor;player.mana=saved.mana;player.invuln=saved.invuln;enemyGridReady=false;}
        },
        navigationTrial:function(){
            if(!gameActive)startGame();var saved={wave:wave,enemies:enemies,obstacles:obstacles,hazards:hazards,props:biomeProps,x:player.x,y:player.y,invuln:player.invuln};wave=15;player.x=360;player.y=0;player.invuln=9999;hazards=[];biomeProps=[];obstacles=[new RoomStructure(0,0,270,96,'wall')];var hunter=new Enemy(-300,0,'chaser');hunter.elite=false;enemies=[hunter];var maxDetour=0,contacts=0,startDistance=Math.hypot(player.x-hunter.x,player.y-hunter.y);for(var nf=0;nf<390;nf++){rebuildEnemyGrid();hunter.update(1);maxDetour=Math.max(maxDetour,Math.abs(hunter.y));if(obstacleContact(hunter.x,hunter.y,hunter.radius,obstacles[0]))contacts++;}var endDistance=Math.hypot(player.x-hunter.x,player.y-hunter.y),result={crossed:hunter.x>140,detour:maxDetour,contacts:contacts,startDistance:startDistance,endDistance:endDistance,stuckFlips:hunter.navStuckFlips};wave=saved.wave;enemies=saved.enemies;obstacles=saved.obstacles;hazards=saved.hazards;biomeProps=saved.props;player.x=saved.x;player.y=saved.y;player.invuln=saved.invuln;enemyGridReady=false;return result;
        },
        enemyNavigatorTrial:function(){if(!gameActive)startGame();var savedEnemies=enemies,savedX=player.x,savedY=player.y,savedShop=shopMode;shopMode=false;player.x=0;player.y=0;enemies=[];for(var i=0;i<3;i++){var far=new Enemy(1050,i*42-42,'chaser');far.elite=false;enemies.push(far);}rebuildEnemyGrid();var shownForThree=drawEnemyNavigator();enemies.push(new Enemy(-1050,0,'chaser'));rebuildEnemyGrid();var hiddenForFour=!drawEnemyNavigator();enemies=[new Enemy(70,0,'chaser')];rebuildEnemyGrid();var hiddenWhenNear=!drawEnemyNavigator();enemies=savedEnemies;player.x=savedX;player.y=savedY;shopMode=savedShop;enemyGridReady=false;return{shownForThree:shownForThree,hiddenForFour:hiddenForFour,hiddenWhenNear:hiddenWhenNear};},
        enemyTrial: function(){
            if(!gameActive)startGame();wave=30;obstacles=[];hazards=[];biomeProps=[];bullets=[];enemies=[];player.x=0;player.y=0;var result={};
            var briar=new Enemy(180,0,'briar');briar.elite=false;briar.timer=146;enemies=[briar];briar.update(1);result.briarBurrow=briar.state==='burrow';
            var tide=new Enemy(320,0,'tidecaller');tide.elite=false;tide.timer=136;enemies=[tide];tide.update(1);result.tideChannel=tide.state==='channel';
            var scribe=new Enemy(350,0,'scribe');scribe.elite=false;scribe.timer=113;enemies=[scribe];bullets=[];scribe.update(1);result.scribePages=bullets.filter(function(b){return b.sourceId==='scribePage';}).length;
            var prism=new Enemy(200,0,'prism');prism.elite=false;result.prismReflect=prism.blocks(spawnBullet({friendly:true,sourceId:'rustPistol'}))&&prism.reflectCooldown>0;
            var colony=new Enemy(200,0,'splitter');colony.elite=false;colony.hp=1;colony.maxHp=30;enemies=[colony];damageEnemy(colony,2,{direct:true,silent:true});result.shardlings=enemies.filter(function(e){return e.kind==='shardling';}).length;
            biomeProps=[new BiomeProp(30,0,'emberCask')];var imp=new Enemy(0,0,'cinderling');imp.elite=false;enemies=[imp];imp.update(1);result.cinderCask=biomeProps[0].dead;
            biomeProps=[];bullets=[];var mason=new Enemy(360,0,'frostshaper');mason.elite=false;mason.timer=246;enemies=[mason];mason.update(1);result.masonIce=biomeProps.filter(function(p){return p.kind==='iceCrate';}).length;result.masonShots=bullets.length;
            hazards=[];var roots=new Enemy(360,0,'rootweaver');roots.elite=false;roots.timer=179;enemies=[roots];roots.update(1);result.rootTrap=hazards.some(function(h){return h.kind==='rootTrap';});
            var duelist=new Enemy(300,0,'glassDuelist');duelist.elite=false;duelist.timer=129;enemies=[duelist];duelist.update(1);result.duelistTelegraph=duelist.state==='telegraph';duelist.stateTimer=1;duelist.update(2);result.duelistDash=duelist.state==='dash';
            return result;
        },
        biomePropTrial: function(){
            if(!gameActive)startGame();var result={},dummy,oldBiome=currentBiome;player.x=0;player.y=0;player.resonance=0;player.resonanceTimer=0;player.resonanceKind='';player.pacts={};obstacles=[];hazards=[];bullets=[];biomeProps=[];enemies=[];
            dummy=spawnEnemy(60,0,'tank',true);dummy.maxHp=200;dummy.hp=200;biomeProps=[new BiomeProp(0,0,'emberCask')];triggerBiomeProp(biomeProps[0],false);result.emberDamage=200-dummy.hp;result.fireField=hazards.some(function(h){return h.kind==='fire';});
            hazards=[];biomeProps=[new BiomeProp(0,0,'iceCrate')];triggerBiomeProp(biomeProps[0],false);result.frostField=hazards.some(function(h){return h.kind==='frostZone'&&h.radius>=150;});
            enemies=[];dummy=spawnEnemy(100,0,'tank',true);dummy.maxHp=200;dummy.hp=200;enemyGridReady=false;rebuildEnemyGrid();bullets=[spawnBullet({x:30,y:0,angle:0,speed:0,damage:1,friendly:false})];biomeProps=[new BiomeProp(0,0,'arcCapacitor')];triggerBiomeProp(biomeProps[0],false);result.arcDamage=200-dummy.hp;result.arcClears=bullets[0].dead;
            hazards=[];biomeProps=[new BiomeProp(0,0,'gravityCore')];triggerBiomeProp(biomeProps[0],false);result.gravityField=hazards.some(function(h){return h.kind==='singularity';});
            hazards=[];enemies=[];dummy=spawnEnemy(80,0,'tank',true);dummy.maxHp=200;dummy.hp=200;player.hp=8;player.armor=4;biomeProps=[new BiomeProp(0,0,'heartPod')];triggerBiomeProp(biomeProps[0],false);result.heartHeal=player.hp===9&&player.armor===5;result.rootField=hazards.some(function(h){return h.kind==='rootBloom';});
            enemies=[];dummy=spawnEnemy(90,0,'tank',true);bullets=[spawnBullet({x:40,y:0,angle:0,speed:4,damage:1,friendly:false})];biomeProps=[new BiomeProp(0,0,'tideBell')];triggerBiomeProp(biomeProps[0],false);result.tideReflect=bullets[0].friendly&&bullets[0].vx<0;
            var beforeCoins=coins;player.mana=100;biomeProps=[new BiomeProp(0,0,'runeLectern')];triggerBiomeProp(biomeProps[0],false);result.runeReward=player.mana===135&&coins===beforeCoins+2;
            bullets=[];biomeProps=[new BiomeProp(0,0,'mirrorObelisk')];triggerBiomeProp(biomeProps[0],false);result.mirrorRays=bullets.length;
            currentBiome=BIOMES[1];player.resonance=0;player.resonanceTimer=0;player.resonanceKind='';for(var rp=0;rp<3;rp++){var resonator=new BiomeProp(300+rp*50,300,'iceCrate');biomeProps=[resonator];triggerBiomeProp(resonator,true);}result.resonanceKind=player.resonanceKind;bullets=[];this.equip('rustPistol');player.fireWeapon(player.weapon,0,1,0);result.resonantShot={status:bullets[0].status,blast:bullets[0].blast,resonance:bullets[0].resonance};player.resonance=0;player.resonanceTimer=0;player.resonanceKind='';currentBiome=oldBiome;return result;
        },
        attackAnimationTrial: function(){
            if(!gameActive)startGame();var ids=Object.keys(WEAPON_DEFS),profiles=Object.keys(WEAPON_ANIMATIONS),missing=ids.filter(function(id){return!WEAPON_ANIMATIONS[id];}),orphaned=profiles.filter(function(id){return!WEAPON_DEFS[id];}),signatures={};profiles.forEach(function(id){signatures[JSON.stringify(WEAPON_ANIMATIONS[id])]=true;});var knownCategories=['GUN','ARCHER','MELEE','MAGIC'],flowerNames=/lotus|petal|bloom/i;var result={missing:missing,orphaned:orphaned,profileCount:profiles.length,uniqueProfiles:Object.keys(signatures).length,categorySafe:ids.every(function(id){return knownCategories.indexOf(WEAPON_DEFS[id].category)>=0;}),flowerGuns:ids.filter(function(id){var w=WEAPON_DEFS[id];return w.category==='GUN'&&flowerNames.test(id+' '+w.name);}).length};enemies=[];bullets=[];slashes=[];player.x=0;player.y=0;player.mana=200;this.equip('rustPistol');player.lastShot=0;player.tryAttack(1000);result.rust=player.attackAnimKind==='snap'&&player.attackAnimWeapon==='rustPistol';this.equip('ironCleaver');player.lastShot=0;player.tryAttack(2000);result.cleaver=player.attackAnimKind==='sweep'&&slashes.length>0;this.equip('emberWand');player.lastShot=0;player.tryAttack(3000);result.ember=player.attackAnimKind==='cast';this.equip('oakBow');player.lastShot=0;player.releaseBow(4000,1);result.oak=player.attackAnimKind==='draw';return result;
        },
        zoomTrial:function(){var before=cameraZoomSetting;changeCameraZoom(.1);var afterIn=cameraZoomSetting;changeCameraZoom(-.2);var afterOut=cameraZoomSetting;cameraZoomSetting=before;refreshZoomReadout();return{before:before,afterIn:afterIn,afterOut:afterOut,minimum:.7,maximum:1.3};},
        hazardTrial: function(){
            if(!gameActive)startGame();enemies=[];bullets=[];hazards=[];obstacles=[];player.x=0;player.y=0;player.hp=10;player.armor=0;player.invuln=0;var result={};
            var ember=new Hazard(0,0,'ember');ember.timer=149.5;ember.update(1);result.emberDamage=10-player.hp;
            player.invuln=0;var thornTarget=new Enemy(0,0,'tank');thornTarget.elite=false;thornTarget.maxHp=100;thornTarget.hp=100;enemies=[thornTarget];var thorn=new Hazard(0,0,'thorn');thorn.timer=179.5;thorn.update(1);result.thornDamage=100-thornTarget.hp;result.thornStun=thornTarget.stun;
            player.x=0;player.y=0;var tide=new Hazard(0,0,'tide');tide.angle=0;tide.timer=20;tide.update(1);result.tideShift=player.x;
            player.mana=100;var glyph=new Hazard(0,0,'glyph');glyph.update(1);result.glyphMana=player.mana-100;
            bullets=[];var mirror=new Hazard(100,100,'mirror');mirror.timer=164.5;mirror.update(1);result.mirrorShots=bullets.filter(function(b){return b.sourceId==='mirrorHazard';}).length;
            return result;
        },
        armorTrial: function(){
            if(!gameActive)startGame();var saved={passives:player.passives,dodge:player.stats.dodge,maxHp:player.maxHp,hp:player.hp,maxArmor:player.maxArmor,armor:player.armor,invuln:player.invuln,delay:player.armorRegenDelay,timer:player.armorRegenTimer};player.passives={};player.stats.dodge=0;player.maxHp=10;player.hp=10;player.maxArmor=7;player.armor=7;player.invuln=0;player.hit(2,'test');var afterHit={hp:player.hp,armor:player.armor,delay:player.armorRegenDelay};player.updateArmorRegen(player.armorRegenDelayBase);player.updateArmorRegen(player.armorRegenInterval-1);var beforeTick=player.armor;player.updateArmorRegen(1);var afterTick=player.armor;player.passives=saved.passives;player.stats.dodge=saved.dodge;player.maxHp=saved.maxHp;player.hp=saved.hp;player.maxArmor=saved.maxArmor;player.armor=saved.armor;player.invuln=saved.invuln;player.armorRegenDelay=saved.delay;player.armorRegenTimer=saved.timer;return{afterHit:afterHit,beforeTick:beforeTick,afterTick:afterTick,delayBase:player.armorRegenDelayBase,interval:player.armorRegenInterval};
        },
        shieldTrial: function(){
            if(!gameActive)startGame();wave=10;enemies=[];bullets=[];obstacles=[];var guard=new Enemy(160,0,'shield');guard.elite=false;guard.aim=Math.PI;enemies=[guard];enemyGridReady=false;rebuildEnemyGrid();var hpBefore=guard.hp,shieldBefore=guard.shieldHp;bullets=[spawnBullet({x:guard.x-2,y:guard.y,angle:0,speed:0,damage:shieldBefore,friendly:true,color:'#fff',sourceId:'rustPistol'})];handleCollisions();var shieldAfter=guard.shieldHp,stunAfter=guard.stun,hpAfterShield=guard.hp;bullets=[spawnBullet({x:guard.x-2,y:guard.y,angle:0,speed:0,damage:2,friendly:true,color:'#fff',sourceId:'rustPistol'})];handleCollisions();return{shieldBefore:shieldBefore,shieldAfter:shieldAfter,stunAfter:stunAfter,hpBefore:hpBefore,hpAfterShield:hpAfterShield,hpAfterBreak:guard.hp};
        },
        clearWave: function(){enemies.slice().forEach(function(e){e.dead=true;});enemies=[];waveTransition=false;},
        phaseData: function(n){var target=Math.max(1,Math.floor(n)),counts=wavePhaseCounts(target);return{wave:target,total:waveSpawnCount(target),regularTotal:counts[0]+counts[1],counts:counts,bossPhase:target%5===0};},
        networkRateTrial: function(){var savedClock=netSnapshotClock,result={};setNetworkSnapshotHz(20);result.twentyRequestLocked=networkSnapshotHz===30&&NET_SNAPSHOT_FRAMES===2;setNetworkSnapshotHz(30);result.thirty=networkSnapshotHz===30&&NET_SNAPSHOT_FRAMES===2;result.advertised=window.DKGame.networkSnapshot().snapshotHz===30;setNetworkSnapshotHz(99);result.invalidLocked=networkSnapshotHz===30&&NET_SNAPSHOT_FRAMES===2;setNetworkSnapshotHz(30);netSnapshotClock=savedClock;return result;},
        networkCadenceTrial:function(){
            var saved={role:networkRole,hz:networkSnapshotHz,clock:netSnapshotClock,budget:netTransientSnapshotBudget,seq:netSnapshotSeq,sentWorld:netSentWorldRevision},result={};
            try{
                networkRole='host';netSnapshotSeq=0;netSentWorldRevision=netWorldRevision;setNetworkSnapshotHz(30);netTransientSnapshotBudget=0;
                var thirty=[sendNetworkSnapshot(false),sendNetworkSnapshot(false),sendNetworkSnapshot(false)],thirtyDetails=thirty.map(function(packet){return Object.prototype.hasOwnProperty.call(packet,'bullets');});
                result.thirtyCore=thirty.every(function(packet){return Array.isArray(packet.players)&&Array.isArray(packet.enemies)&&!packet.world;});
                result.thirtyTransientCap=thirtyDetails.join(',')==='false,false,true';
                result.staticDataOffCore=thirty.every(function(packet){return!Object.prototype.hasOwnProperty.call(packet,'decor')&&!Object.prototype.hasOwnProperty.call(packet,'obstacles')&&!Object.prototype.hasOwnProperty.call(packet,'world');});
                setNetworkSnapshotHz(20);result.legacyRequestLocked=networkSnapshotHz===30&&NET_SNAPSHOT_FRAMES===2;
                netSentWorldRevision=netWorldRevision-1;var revisionPacket=sendNetworkSnapshot(false),nextPacket=sendNetworkSnapshot(false);
                result.worldOnRevision=!!revisionPacket.world&&revisionPacket.world.revision===netWorldRevision&&Array.isArray(revisionPacket.world.decor)&&Array.isArray(revisionPacket.world.obstacles)&&!nextPacket.world;
            }finally{networkRole=saved.role;setNetworkSnapshotHz(saved.hz);netSnapshotClock=saved.clock;netTransientSnapshotBudget=saved.budget;netSnapshotSeq=saved.seq;netSentWorldRevision=saved.sentWorld;}
            return result;
        },
        predictionRollbackTrial:function(){
            var saved={player:player,mainPlayer:mainPlayer,remotePlayers:remotePlayers,remoteInputs:remoteInputs,partyRoster:partyRoster,role:networkRole,peer:localPeerId,shop:shopMode,history:netPredictionHistory,error:netPredictionError,lastAck:netLastAckSeq,obstacles:obstacles,pending:pendingShots,resyncs:netOwnerResyncCount},result={};
            try{
                networkRole='guest';localPeerId='guest';shopMode=false;obstacles=[];pendingShots=[];remotePlayers=Object.create(null);remoteInputs=Object.create(null);partyRoster=[{id:'guest',slot:0,name:'GUEST',meta:{}}];player=new Player(0,0,{netId:'guest',name:'GUEST',slot:0,color:PARTY_COLORS[0],classId:'independent',starterId:'rustPistol'});mainPlayer=player;player.x=45;netLastAckSeq=0;netOwnerResyncCount=0;netPredictionError={x:0,y:0};netPredictionHistory=[{seq:1,x:10,y:0},{seq:2,x:20,y:0},{seq:3,x:30,y:0}];
                var accepted=playerSnapshot(player);accepted.x=4;accepted.y=0;accepted.ack=2;accepted.ackX=20;accepted.ackY=0;applyPlayerSnapshot(accepted);result.ownedAckNoRollback=player.x===45&&netPredictionError.x===0&&netLastAckSeq===2&&netPredictionHistory.length===1;
                var micro=Object.assign({},accepted,{ack:3,ackX:38,ackY:0,x:-50});applyPlayerSnapshot(micro);result.microDriftIgnored=player.x===45&&netPredictionError.x===0&&netLastAckSeq===3;
                netPredictionHistory=[{seq:4,x:45,y:0}];var rejected=Object.assign({},accepted,{ack:4,ackX:100,ackY:0});applyPlayerSnapshot(rejected);result.rejectedMoveCorrects=Math.abs(netPredictionError.x-55)<.001&&netOwnerResyncCount===1;
                var before=player.x;applyPredictionCorrection(1);result.rejectionCorrectionBounded=player.x>before&&player.x-before<=14.001;
                var stale=Object.assign({},accepted,{ack:2,ackX:-200,ackY:0,x:-200});var staleX=player.x;applyPlayerSnapshot(stale);result.staleAckIgnored=Math.abs(player.x-staleX)<.001&&netLastAckSeq===4;
                networkRole='host';localPeerId='host';remotePlayers=Object.create(null);remoteInputs=Object.create(null);var remote=new Player(0,0,{netId:'remote',name:'REMOTE',slot:1,color:PARTY_COLORS[1],classId:'independent',starterId:'rustPistol'});remotePlayers.remote=remote;remoteInputs.remote={dx:1,dy:0,angle:0,seq:9,x:36,y:0,receivedAt:performance.now()};prepareRemoteOwnedMovement(1);updateRemoteParty(1,1000,false);captureRemoteOwnerOffsets();var ownerSnapshot=playerSnapshot(remote);result.hostAcceptsOwnerTarget=ownerSnapshot.ack===9&&Math.abs(ownerSnapshot.ackX-36)<.001&&remote.x>0&&remote.x<40;remote.x+=12;captureRemoteOwnerOffsets();ownerSnapshot=playerSnapshot(remote);result.externalForceSeparated=Math.abs(ownerSnapshot.externalX-12)<.01;
                var stopInput={dx:0,dy:0,angle:0,fire:false,dash:false,switch:false,ability:false},moveInput={dx:1,dy:0,angle:0,fire:false,dash:false,switch:false,ability:false};result.stopTransitionDetected=networkInputSignature(stopInput)!==networkInputSignature(moveInput);
            }finally{player=saved.player;mainPlayer=saved.mainPlayer;remotePlayers=saved.remotePlayers;remoteInputs=saved.remoteInputs;partyRoster=saved.partyRoster;networkRole=saved.role;localPeerId=saved.peer;shopMode=saved.shop;netPredictionHistory=saved.history;netPredictionError=saved.error;netLastAckSeq=saved.lastAck;obstacles=saved.obstacles;pendingShots=saved.pending;netOwnerResyncCount=saved.resyncs;}
            return result;
        },
        twoPhaseTrial: function(){if(!gameActive)startGame();var saved={wave:wave,enemies:enemies,transition:waveTransition,vacuum:waveVacuum,phase:wavePhase,breakState:phaseBreak,breakTimer:phaseBreakTimer,counts:phaseSpawnCounts,pickups:pickups};wave=12;enemies=[];pickups=[];waveTransition=false;waveVacuum=false;wavePhase=1;phaseBreak=false;phaseBreakTimer=0;phaseSpawnCounts=wavePhaseCounts(wave);spawnWavePhase(1);var first=enemies.length;enemies=[];checkWaveClear(1);var waited=phaseBreak&&!waveTransition;updatePhaseBreak(100);var second=enemies.length,advanced=wavePhase===2&&!phaseBreak;enemies=[];checkWaveClear(1);var finished=waveTransition&&waveVacuum;wave=saved.wave;enemies=saved.enemies;waveTransition=saved.transition;waveVacuum=saved.vacuum;wavePhase=saved.phase;phaseBreak=saved.breakState;phaseBreakTimer=saved.breakTimer;phaseSpawnCounts=saved.counts;pickups=saved.pickups;enemyGridReady=false;return{counts:wavePhaseCounts(12),first:first,second:second,waited:waited,advanced:advanced,finished:finished};},
        pickupTrial: function(){if(!gameActive)startGame();var savedPickups=pickups,savedMana=player.mana;player.mana=0;var manaDrop=new Pickup(player.x+520,player.y,'mana',9),coinDrop=new Pickup(player.x+180,player.y,'coin',1),coinSpark=coinDrop.spark;pickups=[manaDrop,coinDrop];var immediate=manaDrop.magnet&&manaDrop.vacuum&&manaDrop.vx===0&&manaDrop.vy===0;for(var mp=0;mp<24&&!manaDrop.dead;mp++)manaDrop.update(1);var result={immediate:immediate,collected:manaDrop.dead&&player.mana===9,frames:mp,coinStatic:coinDrop.spark===coinSpark};pickups=savedPickups;player.mana=savedMana;return result;},
        coinRush: function(){if(!gameActive)startGame();enemies=[];pickups=[new Pickup(player.x+500,player.y,'coin',1),new Pickup(player.x-700,player.y+200,'coin',1),new Pickup(player.x+300,player.y-600,'coin',1)];wavePhase=wavePhaseTotal;phaseBreak=false;waveTransition=false;checkWaveClear(1);},
        setCoins: function(v){coins=Math.max(0,Math.floor(v));updateHUD();},
        balanceData: function(){var oldWave=wave;wave=5;var epicPrice=offerPrice(WEAPON_DEFS.starforgeMinigun,'epic',0);wave=oldWave;return{wave10:waveSpawnCount(10),wave11:waveSpawnCount(11),wave15:waveSpawnCount(15),wave20:waveSpawnCount(20),wave30:waveSpawnCount(30),wave40:waveSpawnCount(40),hp10:enemyHpScaleAt(10),hp11:enemyHpScaleAt(11),hp21:enemyHpScaleAt(21),hp31:enemyHpScaleAt(31),hp41:enemyHpScaleAt(41),regularCoinChance:.74,bonusCoinChance:.18,shopPriceMultiplier:.8,shopSize:8,weaponShopSize:4,supportShopSize:4,arenaLimit:ARENA_LIMIT,worldLimit:WORLD_LIMIT,starforgeShopPrice:epicPrice};},
        rarityOdds: function(n,luck){return rarityOddsAt(n,luck||0);},
        weaponIds: function(){return Object.keys(WEAPON_DEFS);},
        weaponData: function(){return Object.keys(WEAPON_DEFS).map(function(id){var w=WEAPON_DEFS[id];return{id:id,name:w.name,rarity:w.rarity,category:w.category,handler:w.handler,family:w.family||'',damage:w.damage,mana:w.mana||0,manaPerSecond:w.manaPerSecond||0};});},
        listBiomes: function(){return BIOMES.map(function(b,index){return{index:index,name:b.name,hazard:b.hazard};});},
        setBiome: function(value){if(!gameActive)startGame();var index=-1;if(typeof value==='number')index=Math.floor(value);else{var key=String(value||'').trim().toLowerCase();for(var i=0;i<BIOMES.length;i++)if(BIOMES[i].name.toLowerCase()===key||BIOMES[i].hazard.toLowerCase()===key){index=i;break;}}if(index<0||index>=BIOMES.length)throw new Error('Unknown biome: '+value);wave=index*5+1;player.x=0;player.y=0;prepareEnvironment();updateHUD();return{index:index,name:currentBiome.name,hazard:currentBiome.hazard};},
        giveLegendaryWeapons: function(equipQuery){
            if(!gameActive)startGame();var legendaryIds=Object.keys(WEAPON_DEFS).filter(function(id){return WEAPON_DEFS[id].rarity==='legendary';});
            legendaryIds.forEach(function(id){if(!player.hasWeapon(id))player.inventory.push(weaponCopy(id));});
            var equipId='';if(equipQuery!==undefined&&equipQuery!==null&&String(equipQuery).trim()){var raw=String(equipQuery).trim(),needle=raw.toLowerCase();equipId=WEAPON_DEFS[raw]?raw:legendaryIds.find(function(id){return String(WEAPON_DEFS[id].name||'').toLowerCase()===needle;});if(!equipId||WEAPON_DEFS[equipId].rarity!=='legendary')throw new Error('Unknown Legendary weapon: '+equipQuery);}else equipId=legendaryIds.indexOf('dawnstarCannon')>=0?'dawnstarCannon':legendaryIds[0];
            if(equipId)this.giveWeapon(equipId);return{weapons:legendaryIds.slice(),equipped:equipId};
        },
        legendaryBoss: function(biome,weaponQuery){
            if(networkRole==='guest')throw new Error('legendaryBoss must be run by the host.');if(!gameActive)startGame();var index=BIOMES.indexOf(currentBiome);
            if(biome!==undefined&&biome!==null&&String(biome).trim()!==''){index=-1;if(typeof biome==='number')index=Math.floor(biome);else{var key=String(biome).trim().toLowerCase();for(var i=0;i<BIOMES.length;i++){var candidate=BIOMES[i],bossDef=BOSS_DEFS[candidate.hazard],aliases=[candidate.name,candidate.hazard,candidate.resonance,candidate.enemy,bossDef&&bossDef.name].filter(Boolean).map(function(value){return String(value).toLowerCase();});if(aliases.indexOf(key)>=0||(key.length>=4&&aliases.some(function(alias){return alias.indexOf(key)>=0;}))){index=i;break;}}}}
            if(index<0||index>=BIOMES.length)throw new Error('Unknown biome: '+biome);inventoryOpen=false;craftingOpen=false;shopMode=false;gamePaused=false;pauseReason='';sceneMode='run';setUiScene('run');el('inventory-screen').style.display='none';el('crafting-screen').style.display='none';el('shop-room-ui').style.display='none';el('pause-screen').style.display='none';
            wave=(index+1)*5;waveTransition=false;waveVacuum=false;transitionTimer=0;phaseBreak=false;phaseBreakTimer=0;wavePhase=2;wavePhaseTotal=2;phaseSpawnCounts=wavePhaseCounts(wave);releaseAllTransient();enemies=[];effects=[];pickups=[];radiantWeapons=[];totems=[];pendingShots=[];prepareEnvironment();resetPalaceCutscene();
            if(currentBiome.hazard==='ember'){palaceStatueFallen=true;obstacles=obstacles.filter(function(obstacle){return obstacle.kind!=='palaceStatue';});}player.x=0;player.y=380;player.hp=player.maxHp;player.armor=player.maxArmor;player.mana=player.maxMana;player.invuln=0;player.resolveObstacles();var arsenal=this.giveLegendaryWeapons(weaponQuery),boss=spawnBiomeBoss();enemyGridReady=false;resetSimulationClock();updateHUD();updateWeaponHUD();
            return{biome:{index:index,name:currentBiome.name,hazard:currentBiome.hazard},wave:wave,boss:{key:boss.bossKey,name:boss.name,title:boss.bossDef.title},legendaryWeapons:arsenal.weapons,equipped:arsenal.equipped};
        },
        nextBiome: function(){var index=(BIOMES.indexOf(currentBiome)+1+BIOMES.length)%BIOMES.length;return this.setBiome(index);},
        previousBiome: function(){var index=(BIOMES.indexOf(currentBiome)-1+BIOMES.length)%BIOMES.length;return this.setBiome(index);},
        autoCycleBiomes: function(ms){this.stopBiomeCycle();var debug=this,delay=Math.max(500,Number(ms)||6000);window.DK_BIOME_CYCLE=setInterval(function(){debug.nextBiome();},delay);return{running:true,intervalMs:delay};},
        stopBiomeCycle: function(){if(window.DK_BIOME_CYCLE){clearInterval(window.DK_BIOME_CYCLE);window.DK_BIOME_CYCLE=0;}return{running:false};},
        weaponArchitecture: function(){var ids=Object.keys(WEAPON_DEFS),missingBehavior=[],missingRenderer=[];ids.forEach(function(id){if(!WEAPON_BEHAVIORS.ids[id]&&!WEAPON_BEHAVIORS.families[WEAPON_DEFS[id].family]&&!WEAPON_BEHAVIORS.handlers[WEAPON_DEFS[id].handler])missingBehavior.push(id);if(typeof WEAPON_RENDERERS[id]!=='function')missingRenderer.push(id);});return{weapons:ids.length,behaviorModules:Object.keys(WEAPON_BEHAVIORS.ids).length,familyBehaviors:Object.keys(WEAPON_BEHAVIORS.families).length,handlerBehaviors:Object.keys(WEAPON_BEHAVIORS.handlers).length,renderers:Object.keys(WEAPON_RENDERERS).length,projectileRenderers:Object.keys(PROJECTILE_RENDERERS).length,projectileOverlays:Object.keys(PROJECTILE_OVERLAYS).length,projectileImpactRenderers:Object.keys(PROJECTILE_IMPACT_RENDERERS).length,slashRenderers:Object.keys(SLASH_RENDERERS).length,auras:Object.keys(WEAPON_AURAS).length,missingBehavior:missingBehavior,missingRenderer:missingRenderer};},
        equip: function(id){if(!WEAPON_DEFS[id])return false;var owned=player.getWeapon(id);if(!owned){owned=weaponCopy(id);player.inventory.push(owned);}player.weaponIndex=player.inventory.indexOf(owned);player.weapon=owned;updateWeaponHUD();return true;},
        rrharilTrial: function(){
            if(!gameActive)startGame();enemies=[];obstacles=[];hazards=[];this.equip('rrharil');player.resetRrharil();player.x=0;player.y=0;player.angle=0;player.mana=200;
            for(var rd=-2;rd<=2;rd++){var ra=rd*.36,dummy=new Enemy(Math.cos(ra)*430,Math.sin(ra)*430,'tank');dummy.elite=false;dummy.maxHp=5000;dummy.hp=5000;enemies.push(dummy);}rebuildEnemyGrid();
            for(var rt=0;rt<180;rt++)processWeaponFiring(player,true,1,gameTimeMs+rt*16.6667);
            var damages=enemies.map(function(e){return 5000-e.hp;}),manaUsed=200-player.mana,curseApplied=enemies.map(function(e){return e.curse;});for(var ct=0;ct<5;ct++)enemies.forEach(function(e){e.updateStatus(60);});var curseDamage=enemies.map(function(e,i){return 5000-e.hp-damages[i];}),finalCurse=enemies.map(function(e){return e.curse;});player.resetRrharil();
            return{targetCount:damages.length,damages:damages,manaUsed:manaUsed,curseApplied:curseApplied,curseDamage:curseDamage,finalCurse:finalCurse};
        },
        arsenalTrial: function(){
            if(!gameActive)startGame();enemies=[];bullets=[];slashes=[];hazards=[];obstacles=[];var result={};
            this.equip('boomerangCog');player.weapon.shots=1;player.fireWeapon(player.weapon,0,1,0);var cog=bullets[0];for(var cg=0;cg<40;cg++)cog.update(1);result.returningCog=!!cog.returningHome;
            var dummy=new Enemy(180,0,'chaser');dummy.elite=false;dummy.maxHp=1000;dummy.hp=1000;enemies=[dummy];bullets=[];
            for(var nd=0;nd<3;nd++){bullets.push(spawnBullet({x:dummy.x,y:dummy.y,angle:0,speed:0,damage:1,friendly:true,color:'#7ed6df',sourceId:'glassNeedler',shatterMark:true}));enemyGridReady=false;handleCollisions();}result.needleShatter=dummy.shards===0&&dummy.hp<=989;
            dummy.hp=1000;dummy.dead=false;dummy.stars=0;bullets=[];for(var st=0;st<3;st++){bullets.push(spawnBullet({x:dummy.x,y:dummy.y,angle:0,speed:0,damage:1,friendly:true,color:'#6c8cff',sourceId:'constellationBow',starMark:true}));enemyGridReady=false;handleCollisions();}result.constellation=dummy.stars===0&&dummy.hp<=979;
            bullets=[];var shell=spawnBullet({x:0,y:0,angle:0,speed:0,damage:10,friendly:true,color:'#f6b93b',sourceId:'hiveLauncher',hive:5,hitIds:(function(){var h={};h[dummy.id]=true;return h;}())});bullets.push(shell);shell.expire();result.hiveWasps=bullets.filter(function(b){return b.sourceId==='hiveWasp';}).length;
            bullets=[spawnBullet({x:dummy.x,y:dummy.y,angle:0,speed:0,damage:2,friendly:true,color:'#7efff5',sourceId:'auroraHarpoon',harpoon:true})];hazards=[];enemyGridReady=false;handleCollisions();result.auroraTether=hazards.some(function(h){return h.kind==='aurora'&&h.targetId===dummy.id;});
            this.equip('cathedralOrgan');slashes=[];runWeaponAction(player.weapon,'attack',{player:player,weapon:player.weapon,angle:player.angle,power:1,burstIndex:0,api:WEAPON_API});result.organWaves=slashes.length;
            this.equip('oracleDeck');var fates=[];for(var ft=1;ft<=4;ft++){bullets=[];player.weapon.shots=ft;player.fireWeapon(player.weapon,0,1,0);var card=bullets[0];fates.push({status:card.status,blast:card.blast,pierce:card.pierce,storm:card.oracleStorm,vortex:card.vortex});}result.oracleFates=fates;
            return result;
        },
        newArsenalTrial: function(){
            if(!gameActive)startGame();enemies=[];bullets=[];slashes=[];pendingShots=[];hazards=[];obstacles=[];player.x=0;player.y=0;player.angle=0;var result={};
            this.equip('chalkBlaster');player.fireWeapon(player.weapon,0,1,0);result.chalkBounce=bullets[0].bounce;
            bullets=[];this.equip('candlefork');player.mana=200;player.lastShot=0;player.tryAttack(1000);result.candleShots=bullets.length;result.candleMana=200-player.mana;result.candleBurn=bullets.every(function(b){return b.status==='burn';});
            bullets=[];this.equip('mothwingBow');player.fireWeapon(player.weapon,0,1,0);result.mothSplit=bullets[0].split;result.mothHoming=bullets[0].homing;
            bullets=[];this.equip('rainmaker');player.fireWeapon(player.weapon,0,1,0);result.rainDrops=bullets.length;result.rainBlast=bullets.every(function(b){return b.blast===30&&b.status==='freeze';});
            bullets=[];this.equip('phoenixFan');player.fireWeapon(player.weapon,0,1.66,1);result.phoenixFeathers=bullets.length;result.phoenixComets=bullets.filter(function(b){return b.comet&&b.status==='burn';}).length;
            bullets=[];this.equip('gravitySaw');player.fireWeapon(player.weapon,0,1,0);result.gravityReturn=bullets[0].returning&&bullets[0].vortex===125&&bullets[0].clearsBullets;
            bullets=[];this.equip('gearspikePike');player.weapon.shots=4;player.performMelee(player.weapon);result.gearTooth=bullets.some(function(b){return b.sourceId==='gearspikePike'&&b.pierce===3;});
            pendingShots=[];slashes=[];this.equip('echoMaul');player.performMelee(player.weapon);result.echoQueued=pendingShots.length===1;processPendingShots(15);result.echoLanded=slashes.length>=2;
            return result;
        },
        rebalanceTrial: function(){
            if(!gameActive)startGame();enemies=[];bullets=[];slashes=[];hazards=[];obstacles=[];player.x=0;player.y=0;var result={},savedCombat={crit:player.stats.crit,damage:player.stats.damage,berserk:player.berserk,resonanceTimer:player.resonanceTimer,roomBoonTimer:player.roomBoonTimer,primeMemory:player.primeMemory};player.stats.crit=0;player.stats.damage=0;player.berserk=0;player.resonanceTimer=0;player.roomBoonTimer=0;player.primeMemory='';
            this.equip('starforgeMinigun');player.weapon.level=1;player.mana=200;player.lastShot=0;player.heat=0;player.overheated=false;for(var sf=1;sf<=100;sf++)player.tryAttack(1000+sf*70);result.starforge={shots:bullets.length,damage:bullets[0]&&bullets[0].damage,manaUsed:200-player.mana,heat:player.heat,overheated:player.overheated};
            bullets=[];slashes=[];this.equip('frostbrand');player.weapon.shots=1;player.performMelee(player.weapon);result.frostbrand={arc:slashes[0]&&slashes[0].arc,radius:slashes[0]&&slashes[0].radius,deflect:slashes[0]&&slashes[0].deflect,guard:player.meleeGuard};
            enemies=[];bullets=[];var spiral=new Enemy(500,0,'spiral');spiral.elite=false;spiral.timer=0;enemies=[spiral];for(var si=0;si<43;si++)spiral.update(1);result.spiralBefore=bullets.length;spiral.update(2);result.spiralAfter=bullets.length;
            enemies=[];bullets=[];var shooter=new Enemy(500,0,'shooter');shooter.elite=false;shooter.timer=0;enemies=[shooter];for(var sh=0;sh<131;sh++)shooter.update(1);result.shooterBefore=bullets.length;shooter.update(2);result.shooterAfter=bullets.length;
            enemies=[];var caller=new Enemy(500,0,'summoner');caller.elite=false;enemies=[caller];for(var su=0;su<5;su++){caller.timer=331;caller.update(1);}result.summonsMade=caller.summonsMade;result.summonedEnemies=enemies.length-1;player.stats.crit=savedCombat.crit;player.stats.damage=savedCombat.damage;player.berserk=savedCombat.berserk;player.resonanceTimer=savedCombat.resonanceTimer;player.roomBoonTimer=savedCombat.roomBoonTimer;player.primeMemory=savedCombat.primeMemory;
            return result;
        },
        gunExpansionTrial: function(){
            if(!gameActive)startGame();enemies=[];bullets=[];obstacles=[];player.x=0;player.y=0;var result={};
            this.equip('scrapNailer');player.fireWeapon(player.weapon,0,1,0);result.nailer=bullets.length===1&&bullets[0].nailMark;
            bullets=[];this.equip('flarePistol');player.fireWeapon(player.weapon,0,1,0);result.flare=bullets[0].blast===38&&bullets[0].status==='burn'&&bullets[0].comet;
            bullets=[];this.equip('coilCarbine');player.fireWeapon(player.weapon,0,1,0);result.coil=bullets[0].pierce===2&&bullets[0].distanceScale;
            bullets=[];this.equip('diceCannon');player.weapon.shots=6;player.fireWeapon(player.weapon,0,1,0);result.dice=bullets.length===6&&bullets.every(function(b){return b.crit;});
            bullets=[];this.equip('teslaRifle');player.fireWeapon(player.weapon,0,1,0);result.tesla=bullets[0].tesla&&bullets[0].status==='shock';
            bullets=[];this.equip('phaseSmg');player.weapon.shots=10;player.fireWeapon(player.weapon,0,1,0);result.phase=bullets[0].ghost&&bullets[0].pierce===5;
            bullets=[];this.equip('dragonMaw');player.fireWeapon(player.weapon,0,1,0);result.dragon=bullets.length===9&&bullets.every(function(b){return b.status==='burn'&&b.blast===18;});
            bullets=[];this.equip('portalRepeater');player.fireWeapon(player.weapon,0,1,0);result.portal=bullets.length===2&&bullets.every(function(b){return b.ghost&&b.pierce===1&&b.homing>0;});return result;
        },
        mythicalTrial: function(){
            if(!gameActive)startGame();var result={};player.x=0;player.y=0;player.angle=0;player.mana=200;obstacles=[];hazards=[];pendingShots=[];bullets=[];slashes=[];enemies=[];
            var center=new Enemy(420,0,'tank'),left=new Enemy(520,-72,'tank'),right=new Enemy(520,72,'tank');[center,left,right].forEach(function(e){e.elite=false;e.maxHp=1000;e.hp=1000;});enemies=[center,left,right];bullets=[spawnBullet({x:180,y:0,angle:Math.PI,speed:0,damage:1,friendly:false})];this.equip('riftRail');runWeaponAction(player.weapon,'attack',{player:player,weapon:player.weapon,angle:0,power:1,api:WEAPON_API,isEcho:false});var initial=1000-center.hp,cleared=bullets[0].dead,queued=pendingShots.length;processPendingShots(8);processPendingShots(8);result.worldseam={initialDamage:initial,echoLeft:1000-left.hp,echoRight:1000-right.hp,cleared:cleared,queued:queued};
            bullets=[];slashes=[];pendingShots=[];enemies=[center];center.dead=false;center.hp=1000;this.equip('crowncrusher');player.performMelee(player.weapon);var crownQueued=pendingShots.filter(function(s){return s.kind==='royalRing';}).length;processPendingShots(18);result.sovereign={baseSlash:slashes.length,echoRings:slashes.length-1,queued:crownQueued,reach:slashes[0].radius,arc:slashes[0].arc};
            bullets=[spawnBullet({x:80,y:0,angle:0,speed:1,damage:1,friendly:false,color:'#fff'})];enemies=[center];center.dead=false;center.hp=1000;this.equip('astralChoir');player.weapon.shots=3;player.fireWeapon(player.weapon,0,1,0);result.choir={notes:bullets.filter(function(b){return b.sourceId==='astralChoir';}).length,converted:bullets[0].friendly,piercing:bullets.slice(1).every(function(b){return b.pierce>=3&&b.homing>.09;})};
            bullets=[];enemies=[];this.equip('eclipseBow');player.fireWeapon(player.weapon,0,1.66,1);result.eclipse={suns:bullets.length,huge:bullets.every(function(b){return b.vortex===260&&b.blast===210&&b.clearsBullets&&b.homing>0;})};return result;
        },
        biomeExpansionTrial: function(){
            if(!gameActive)startGame();var result={};player.x=0;player.y=0;player.mana=100;enemies=[];bullets=[];hazards=[];biomeProps=[];
            var anvil=new BiomeProp(0,0,'forgeAnvil');triggerBiomeProp(anvil,false);result.anvilBlades=bullets.filter(function(b){return b.sourceId==='forgeAnvil';}).length;result.anvilFire=hazards.some(function(h){return h.kind==='fire';});
            bullets=[spawnBullet({x:20,y:0,angle:0,speed:3,damage:1,friendly:false})];var hourglass=new BiomeProp(0,0,'hourglassEngine');triggerBiomeProp(hourglass,false);result.rewound=bullets[0].friendly&&bullets[0].vx<0&&bullets[0].chrono;
            bullets=[];var idol=new BiomeProp(0,0,'lunarIdol');triggerBiomeProp(idol,false);result.moonBlades=bullets.filter(function(b){return b.sourceId==='lunarIdol'&&b.moonSplit;}).length;
            hazards=[];var foe=new Enemy(80,0,'tank');foe.elite=false;enemies=[foe];var lantern=new BiomeProp(0,0,'sporeLantern');triggerBiomeProp(lantern,false);result.poisonField=hazards.some(function(h){return h.kind==='poisonBloom';});result.poisoned=foe.poison>0;return result;
        },
        automaticMemoryTrial: function(){
            if(!gameActive)startGame();var saved={biome:currentBiome,progress:player.memoryProgress,memories:player.memories,prime:player.primeMemory};currentBiome=BIOMES[1];player.memoryProgress={};player.memories={};player.primeMemory='';var award=completeBiomeMemory(),result={award:award,learned:!!player.memories.WHITEOUT,progress:player.memoryProgress.WHITEOUT,prime:player.primeMemory};currentBiome=saved.biome;player.memoryProgress=saved.progress;player.memories=saved.memories;player.primeMemory=saved.prime;return result;
        },
        legendaryTrial: function(){
            if(!gameActive)startGame();var saved={inventory:player.inventory,weapon:player.weapon,index:player.weaponIndex,enemies:enemies,bullets:bullets,slashes:slashes,hazards:hazards,obstacles:obstacles,radiant:radiantWeapons,effects:effects,mana:player.mana,armor:player.armor,x:player.x,y:player.y,angle:player.angle};var result={};player.inventory=[];player.weapon=null;player.weaponIndex=0;player.x=0;player.y=0;player.angle=0;player.mana=200;player.armor=0;obstacles=[];hazards=[];bullets=[];slashes=[];radiantWeapons=[];effects=[];enemies=[];for(var li=0;li<7;li++){var la=-.72+li*.24,ld=220+li*48,foe=new Enemy(Math.cos(la)*ld,Math.sin(la)*ld,'tank');foe.elite=false;foe.maxHp=5000;foe.hp=5000;enemies.push(foe);}rebuildEnemyGrid();this.equip('sunlionCenser');runWeaponAction(player.weapon,'attack',{player:player,weapon:player.weapon,angle:player.angle,power:1,burstIndex:0,api:WEAPON_API});var lion=radiantWeapons[0];for(var sf=0;sf<420&&!lion.dead;sf++){lion.update(1);slashes.forEach(function(s){if(!s.dead)s.update(1);});compactPooled(slashes,function(s){return!s.dead;},recycleSlash);}result.sunlion={visited:lion.visitedCount,returned:lion.dead,allDamaged:enemies.every(function(e){return e.hp<5000;}),armorRestored:player.armor>0,manaRestored:player.mana>182};
            bullets=[];hazards=[];this.equip('dawnstarCannon');player.fireWeapon(player.weapon,0,1,0);var dawn=bullets[0];dawn.expire();result.dawn={rays:bullets.filter(function(b){return b.sourceId==='dawnRay';}).length,lightField:hazards.some(function(h){return h.kind==='light';}),cleanses:dawn.clearsBullets};
            bullets=[];this.equip('seraphOrrery');player.fireWeapon(player.weapon,0,1,0);result.seraph={halos:bullets.length,returning:bullets.every(function(b){return b.returning&&b.returnAge===82;}),cleansing:bullets.every(function(b){return b.clearsBullets&&b.pierce===2;})};
            bullets=[];hazards=[];enemies=[];this.equip('rrharall');player.resetRrharil();player.mana=200;for(var ve=-1;ve<=1;ve++){var va=ve*.25,veiled=new Enemy(Math.cos(va)*330,Math.sin(va)*330,'tank');veiled.elite=false;veiled.maxHp=5000;veiled.hp=5000;enemies.push(veiled);}rebuildEnemyGrid();for(var vr=0;vr<150;vr++)processWeaponFiring(player,true,1,gameTimeMs+vr*16.6667);result.rrharall={targets:enemies.length,allDamaged:enemies.every(function(e){return e.hp<4925;}),manaUsed:200-player.mana,ritualReset:player.rrTime===0};player.resetRrharil();
            bullets=[];hazards=[];var skyTarget=new Enemy(240,0,'tank');skyTarget.elite=false;skyTarget.maxHp=5000;skyTarget.hp=5000;enemies=[skyTarget];rebuildEnemyGrid();this.equip('heavenfallBallista');player.fireWeapon(player.weapon,0,1.66,1);var heavenBolt=bullets[0];heavenBolt.x=skyTarget.x;heavenBolt.y=skyTarget.y;handleCollisions();result.heavenfall={lances:bullets.filter(function(b){return b.sourceId==='heavenfallLance';}).length,lightField:hazards.some(function(h){return h.kind==='light';}),cleansing:heavenBolt.clearsBullets,damaged:skyTarget.hp<5000};result.tierOrder=RARITIES.legendary.price<RARITIES.mythical.price;
            player.inventory=saved.inventory;player.weapon=saved.weapon;player.weaponIndex=saved.index;enemies=saved.enemies;bullets=saved.bullets;slashes=saved.slashes;hazards=saved.hazards;obstacles=saved.obstacles;radiantWeapons=saved.radiant;effects=saved.effects;player.mana=saved.mana;player.armor=saved.armor;player.x=saved.x;player.y=saved.y;player.angle=saved.angle;enemyGridReady=false;return result;
        },
        enemyExpansionTrial: function(){
            if(!gameActive)startGame();var result={};player.x=0;player.y=0;obstacles=[];hazards=[];bullets=[];enemies=[];
            var slag=new Enemy(300,0,'slagKnight');slag.elite=false;slag.timer=146;enemies=[slag];slag.update(1);result.slagCharge=slag.state==='charge';slag.update(10);result.slagTrail=hazards.some(function(h){return h.kind==='enemyFire';});
            hazards=[];bullets=[];var chrono=new Enemy(340,0,'chronomancer');chrono.elite=false;chrono.timer=156;enemies=[chrono];chrono.update(1);result.chronoShots=bullets.length;result.chronoMoved=chrono.timer===0&&bullets.length===6;
            bullets=[];var bone=new Enemy(360,0,'boneArcher');bone.elite=false;bone.timer=126;enemies=[bone];bone.update(1);var aimed=bone.state==='aim';bone.stateTimer=1;bone.update(2);result.boneArrow=aimed&&bullets.some(function(b){return b.sourceId==='boneArrow';});
            hazards=[];var host=new Enemy(360,0,'sporeHost');host.elite=false;host.timer=139;enemies=[host];host.update(1);result.sporeMine=hazards.some(function(h){return h.kind==='enemySpore';});return result;
        },
        epicExpansionTrial:function(){
            if(!gameActive)startGame();var saved={enemies:enemies,bullets:bullets,slashes:slashes,hazards:hazards,obstacles:obstacles,pending:pendingShots,x:player.x,y:player.y,angle:player.angle,mana:player.mana,weapon:player.weapon,index:player.weaponIndex};var result={};player.x=0;player.y=0;player.angle=0;player.mana=200;obstacles=[];enemies=[];bullets=[];slashes=[];hazards=[];pendingShots=[];
            this.equip('paradoxShotgun');player.fireWeapon(player.weapon,0,1,0);var paradox=bullets[0];for(var pt=0;pt<28;pt++)paradox.update(1);result.paradox={pellets:bullets.length,phase:paradox.paradoxPhase,reversed:paradox.vx<0,seeking:paradox.homing>0};
            bullets=[];hazards=[];this.equip('lotusMinecaster');player.fireWeapon(player.weapon,0,1,0);bullets[0].expire();var bud=hazards[0];for(var lt=0;lt<38;lt++)bud.update(1);result.lotus={bud:bud.kind,petals:bullets.filter(function(b){return b.sourceId==='lotusPetal';}).length};
            bullets=[];enemies=[];var marionettes=[];for(var mi=0;mi<3;mi++){var puppet=new Enemy(180,mi*70-70,'tank');puppet.elite=false;puppet.maxHp=1000;puppet.hp=1000;marionettes.push(puppet);}enemies=marionettes;rebuildEnemyGrid();this.equip('marionetteCodex');player.fireWeapon(player.weapon,0,1,0);var needle=bullets[0];needle.x=marionettes[0].x;needle.y=marionettes[0].y;handleCollisions();var linked=marionettes.filter(function(e){return e.puppetGroup&&e.puppetTimer>0;}).length,beforeEcho=marionettes[1].hp;damageEnemy(marionettes[0],20,{direct:true,silent:true});result.marionette={linked:linked,echoed:marionettes[1].hp<beforeEcho};
            enemies=[new Enemy(155,0,'tank')];enemies[0].elite=false;enemies[0].maxHp=1000;enemies[0].hp=1000;bullets=[];slashes=[];hazards=[];this.equip('riptideAnchor');player.weapon.shots=3;player.performMelee(player.weapon);var undertow=hazards.find(function(h){return h.kind==='undertowAnchor';});for(var ut=0;ut<48;ut++)undertow.update(1);result.anchor={field:!!undertow,burst:!!undertow.triggered};
            bullets=[];slashes=[];hazards=[];pendingShots=[];player.x=0;player.y=0;this.equip('afterimageSaber');player.weapon.shots=1;player.performMelee(player.weapon);result.afterimage={moved:player.x>30,echoes:pendingShots.filter(function(s){return s.kind==='phaseEcho';}).length};
            player.x=0;player.y=0;bullets=[];enemies=[new Enemy(220,0,'tank')];enemies[0].elite=false;enemies[0].maxHp=1000;enemies[0].hp=1000;rebuildEnemyGrid();this.equip('crosswindBallista');player.fireWeapon(player.weapon,0,1.66,1);var beacon=bullets[0];beacon.x=enemies[0].x;beacon.y=enemies[0].y;handleCollisions();result.crosswind={perfect:beacon.crosswind===false,flanks:bullets.filter(function(b){return b.sourceId==='crosswindFlank';}).length};
            enemies=saved.enemies;bullets=saved.bullets;slashes=saved.slashes;hazards=saved.hazards;obstacles=saved.obstacles;pendingShots=saved.pending;player.x=saved.x;player.y=saved.y;player.angle=saved.angle;player.mana=saved.mana;player.weapon=saved.weapon;player.weaponIndex=saved.index;enemyGridReady=false;return result;
        },
        v180ArsenalTrial:function(){
            if(!gameActive)startGame();var saved={inventory:player.inventory,weapon:player.weapon,index:player.weaponIndex,enemies:enemies,bullets:bullets,slashes:slashes,hazards:hazards,obstacles:obstacles,pending:pendingShots,mana:player.mana,passives:player.passives,cores:player.cores,classCounter:player.classShotCounter};var result={};player.inventory=[];player.weapon=null;player.weaponIndex=0;player.mana=500;player.passives={};player.cores={};player.classShotCounter=0;enemies=[];bullets=[];slashes=[];hazards=[];obstacles=[];pendingShots=[];player.x=0;player.y=0;player.angle=0;
            this.equip('dragonwakeBazooka');player.fireWeapon(player.weapon,0,1,0);result.bazooka=bullets.length===1&&bullets[0].type==='rocket'&&bullets[0].flameTrail&&bullets[0].fragments===6&&bullets[0].blast===142;
            bullets=[];this.equip('stormChoirSmg');player.weapon.shots=12;player.fireWeapon(player.weapon,0,1,0);result.smg=bullets.length===1&&bullets[0].type==='smgRound'&&bullets[0].tesla&&bullets[0].status==='shock'&&player.weapon.mana===.5;
            bullets=[];this.equip('auroraBattleRifle');player.fireWeapon(player.weapon,0,1,2);result.auroraAr=bullets.length===1&&bullets[0].type==='rifleRound'&&bullets[0].skyLances===1&&bullets[0].pierce>=3;
            bullets=[];this.equip('eclipseServiceRifle');player.fireWeapon(player.weapon,0,1,3);result.eclipseAr=bullets.length===1&&bullets[0].returning&&bullets[0].ghost&&bullets[0].returnAge===23;
            bullets=[];slashes=[];this.equip('cathedralBreacher');player.fireWeapon(player.weapon,0,1,0);result.shotgun=bullets.length===9&&slashes.length===1&&slashes[0].deflect&&slashes[0].arc>=1.65;
            bullets=[];this.equip('sunshardMusket');player.fireWeapon(player.weapon,0,1,0);result.sunshard=bullets[0].sunshard&&bullets[0].ghost&&bullets[0].pierce===4;
            bullets=[];this.equip('tidalDrumgun');player.weapon.shots=4;player.fireWeapon(player.weapon,0,1,0);result.tidal=bullets[0].type==='tideRound'&&bullets[0].status==='freeze'&&bullets[0].bounce===1;
            bullets=[];hazards=[];enemies=[new Enemy(220,0,'tank')];enemies[0].elite=false;enemies[0].maxHp=5000;enemies[0].hp=5000;rebuildEnemyGrid();this.equip('starfallVolleygun');player.fireWeapon(player.weapon,0,1,0);var starBolt=bullets.find(function(b){return b.starVolley;});var starVolleyReady=bullets.length===5&&!!starBolt&&bullets.every(function(b){return b.starMark;});starBolt.x=enemies[0].x;starBolt.y=enemies[0].y;handleCollisions();var starField=hazards.find(function(h){return h.kind==='starfall';});result.starfall=starVolleyReady&&!!starField&&starField.color==='#ac5cdb'&&!hazards.some(function(h){return h.kind==='light';});
            bullets=[];this.equip('graveglassAutocannon');player.fireWeapon(player.weapon,0,1,0);result.graveglass=bullets[0].graveglass&&bullets[0].status==='curse'&&bullets[0].pierce===2;
            player.inventory=[weaponCopy('pipeRocket'),weaponCopy('clusterTube'),weaponCopy('seismicBazooka')];player.weapon=player.inventory[0];player.weaponIndex=0;bullets=[];player.fireWeapon(player.weapon,0,1,0);result.familyBond=player.familyTier('bazooka')===2&&Math.abs(bullets[0].blast-69.6)<.001&&bullets[0].damage>WEAPON_DEFS.pipeRocket.damage;
            player.inventory=saved.inventory;player.weapon=saved.weapon;player.weaponIndex=saved.index;enemies=saved.enemies;bullets=saved.bullets;slashes=saved.slashes;hazards=saved.hazards;obstacles=saved.obstacles;pendingShots=saved.pending;player.mana=saved.mana;player.passives=saved.passives;player.cores=saved.cores;player.classShotCounter=saved.classCounter;enemyGridReady=false;return result;
        },
        v171ArsenalTrial:function(){
            if(!gameActive)startGame();var saved={inventory:player.inventory,weapon:player.weapon,index:player.weaponIndex,enemies:enemies,bullets:bullets,slashes:slashes,hazards:hazards,obstacles:obstacles,pending:pendingShots,x:player.x,y:player.y,angle:player.angle,mana:player.mana,anchor:player.tripwireAnchor};var result={};player.inventory=[];player.weapon=null;player.weaponIndex=0;player.x=0;player.y=0;player.angle=0;player.mana=500;enemies=[];bullets=[];slashes=[];hazards=[];pendingShots=[];obstacles=[];
            this.equip('bottlecapSlinger');player.fireWeapon(player.weapon,0,1,0);var cap=bullets[0],capDamage=cap.damage;obstacles=[new RoomStructure(75,0,20,110,'wall')];for(var capTick=0;capTick<8;capTick++)cap.update(1);result.cap=cap.bounce===1&&cap.damage>capDamage&&cap.vx<0;
            obstacles=[];bullets=[];this.equip('pebbleChoir');player.fireWeapon(player.weapon,0,1,0);result.pebbles=bullets.length===3&&bullets.every(function(b){return b.returning&&b.homing>0&&b.pierce===1;});
            bullets=[];this.equip('kitebow');player.fireWeapon(player.weapon,0,1.66,1);result.kite=bullets.length===1&&bullets[0].distanceScale&&bullets[0].homing>0&&bullets[0].type==='kiteArrow';
            bullets=[];this.equip('corkscrewMusket');player.fireWeapon(player.weapon,0,1,0);result.drill=bullets[0].drill&&bullets[0].distanceScale&&bullets[0].pierce===2;
            slashes=[];pendingShots=[];this.equip('kitchenTongs');player.weapon.shots=1;player.performMelee(player.weapon);result.tongs=slashes.length===1&&pendingShots.some(function(s){return s.kind==='phaseEcho';});
            slashes=[];this.equip('candleSnuffer');player.weapon.shots=1;player.performMelee(player.weapon);result.snuffer=slashes.length===1&&slashes[0].manaOnDeflect===.7&&slashes[0].arc>=2.4;
            bullets=[];obstacles=[new RoomStructure(75,0,20,110,'wall')];this.equip('beetleCarbine');player.fireWeapon(player.weapon,0,1,0);var beetle=bullets[0];for(var beetleTick=0;beetleTick<8;beetleTick++)beetle.update(1);result.beetle=bullets.filter(function(b){return b.sourceId==='beetleWing';}).length===2&&!beetle.beetleSplit;
            obstacles=[];slashes=[];pendingShots=[];this.equip('tuningFork');player.weapon.shots=1;player.performMelee(player.weapon);result.fork=slashes.length===1&&pendingShots.some(function(s){return s.kind==='phaseEcho'&&s.damage>0;});
            bullets=[];this.equip('bubblewrightStaff');player.fireWeapon(player.weapon,0,1,0);result.bubble=bullets[0].clearsBullets&&bullets[0].vortex===82&&bullets[0].bounce===1&&bullets[0].status==='freeze';
            bullets=[];hazards=[];player.tripwireAnchor=null;this.equip('tripwireBow');player.fireWeapon(player.weapon,0,1.66,1);bullets[0].x=90;bullets[0].expire();player.fireWeapon(player.weapon,0,1.66,1);bullets[1].x=290;bullets[1].expire();result.tripwire=hazards.some(function(h){return h.kind==='tripwire'&&h.x1===90&&h.x2===290;});
            bullets=[];this.equip('relayPistol');player.fireWeapon(player.weapon,0,1,0);var relay=bullets[0],relayStart=relay.x;for(var relayTick=0;relayTick<20;relayTick++)relay.update(1);result.relay=relay.relayShifted&&relay.ghost&&relay.x>relayStart+200;
            bullets=[];slashes=[];this.equip('hedgehogBuckler');player.weapon.shots=3;player.performMelee(player.weapon);result.hedgehog=slashes.length===1&&slashes[0].arc>=6.2&&bullets.filter(function(b){return b.sourceId==='hedgehogQuill';}).length===8;
            bullets=[];hazards=[];this.equip('thunderheadBlunderbuss');player.fireWeapon(player.weapon,0,1,0);var cloudSeed=bullets.find(function(b){return b.thunderCloud;});cloudSeed.expire();result.thunder=bullets.filter(function(b){return b.sourceId==='thunderheadBlunderbuss';}).length===5&&hazards.some(function(h){return h.kind==='thunderCloud';});
            bullets=[];slashes=[];hazards=[];this.equip('undertakerShovel');player.weapon.shots=3;player.performMelee(player.weapon);var grave=hazards.find(function(h){return h.kind==='graveMound';});for(var graveTick=0;graveTick<42;graveTick++)grave.update(1);result.shovel=!!grave&&grave.triggered&&bullets.filter(function(b){return b.sourceId==='graveSpade';}).length===6;
            bullets=[];this.equip('prismMothCodex');player.fireWeapon(player.weapon,0,1,0);result.moths=bullets.length===4&&bullets.every(function(b){return b.prismMoth&&b.split===2&&b.homing>.07;});
            bullets=[];this.equip('railhookBow');player.fireWeapon(player.weapon,0,1.66,1);result.railhook=bullets.length===1&&bullets[0].railhook&&bullets[0].pierce>=1;
            bullets=[];this.equip('alchemistRotary');var reagents=[];for(var reagent=1;reagent<=4;reagent++){player.weapon.shots=reagent;player.fireWeapon(player.weapon,0,1,0);reagents.push(bullets[bullets.length-1].status);}result.alchemy=reagents.join(',')==='burn,freeze,shock,poison';
            slashes=[];this.equip('hourhandRapier');player.weapon.shots=1;player.performMelee(player.weapon);result.hourhand=slashes.length===1&&slashes[0].chronoMark&&slashes[0].radius===175;
            player.inventory=saved.inventory;player.weapon=saved.weapon;player.weaponIndex=saved.index;enemies=saved.enemies;bullets=saved.bullets;slashes=saved.slashes;hazards=saved.hazards;obstacles=saved.obstacles;pendingShots=saved.pending;player.x=saved.x;player.y=saved.y;player.angle=saved.angle;player.mana=saved.mana;player.tripwireAnchor=saved.anchor;enemyGridReady=false;return result;
        },
        v171EnemyTrial:function(){
            if(!gameActive)startGame();var saved={enemies:enemies,bullets:bullets,hazards:hazards,obstacles:obstacles,x:player.x,y:player.y,mana:player.mana};var result={};player.x=0;player.y=0;player.mana=200;obstacles=[];enemies=[];bullets=[];hazards=[];
            var skitter=new Enemy(300,0,'vaultSkitter');skitter.elite=false;skitter.timer=97;enemies=[skitter];skitter.update(1);result.skitter=skitter.state==='pounce'&&skitter.stateTimer===17;
            var surveyor=new Enemy(360,0,'mineLayer');surveyor.elite=false;surveyor.timer=165;enemies=[surveyor];hazards=[];surveyor.update(1);result.surveyor=hazards.some(function(h){return h.kind==='enemyMine'&&h.radius===68&&h.armTime===78&&h.damage===1.35;});
            var stalker=new Enemy(320,0,'blinkStalker');stalker.elite=false;stalker.timer=169;enemies=[stalker];stalker.update(1);var enteredVanish=stalker.state==='vanish';stalker.update(1);var vanished=stalker.state==='vanish'&&stalker.hidden;stalker.update(28);result.stalker=enteredVanish&&vanished&&stalker.state==='lunge'&&!stalker.hidden;
            var bearer=new Enemy(390,0,'bannerBearer');bearer.elite=false;bearer.timer=143;enemies=[bearer];bullets=[];bearer.update(1);result.bearer=bullets.length===5;
            var mite=new Enemy(250,0,'lanternMite');mite.elite=false;mite.timer=109;enemies=[mite];bullets=[];mite.update(1);result.mite=bullets.length===1&&bullets[0].sourceId==='lanternMite'&&bullets[0].manaDrain===6&&bullets[0].homing>0;
            var warden=new Enemy(380,0,'chainWarden');warden.elite=false;warden.timer=153;enemies=[warden];bullets=[];warden.update(1);var aimed=warden.state==='aim';warden.update(41);result.warden=aimed&&bullets.length===4&&warden.state==='idle';
            enemies=saved.enemies;bullets=saved.bullets;hazards=saved.hazards;obstacles=saved.obstacles;player.x=saved.x;player.y=saved.y;player.mana=saved.mana;enemyGridReady=false;return result;
        },
        v180EnemyTrial:function(){
            if(!gameActive)startGame();var saved={enemies:enemies,bullets:bullets,hazards:hazards,obstacles:obstacles,x:player.x,y:player.y,weapon:player.weapon,index:player.weaponIndex,inventory:player.inventory,invuln:player.invuln};var result={};player.x=0;player.y=0;player.invuln=99999;obstacles=[];enemies=[];bullets=[];hazards=[];enemyGridReady=false;
            var ash=new Enemy(220,0,'ashMauler');ash.elite=false;ash.timer=133;enemies=[ash];ash.update(1);var ashWarn=ash.state==='slam';ash.stateTimer=1;ash.update(2);result.ash=ashWarn&&bullets.length===10&&hazards.some(function(h){return h.kind==='enemyFire';});
            bullets=[];hazards=[];var frost=new Enemy(340,0,'frostLantern');frost.elite=false;frost.timer=139;enemies=[frost];frost.update(1);result.frost=bullets.length===3&&hazards.some(function(h){return h.kind==='frostZone'&&h.radius===58&&h.life===92;});
            bullets=[];var scarab=new Enemy(310,0,'duneScarab');scarab.elite=false;scarab.timer=106;enemies=[scarab];scarab.update(1);var duneDash=scarab.state==='dash';scarab.stateTimer=1;scarab.update(2);result.scarab=duneDash&&bullets.length===2;
            bullets=[];var tether=new Enemy(360,0,'arcTetherer');tether.elite=false;tether.timer=143;enemies=[tether];tether.update(1);result.tether=bullets.length===2;
            bullets=[];var rose=new Enemy(370,0,'roseChorister'),ally=new Enemy(390,30,'chaser');rose.elite=false;ally.elite=false;ally.hp=1;enemies=[rose,ally];rose.timer=156;rose.update(1);result.rose=bullets.length===5&&ally.hp>1;
            bullets=[];var skater=new Enemy(330,0,'tideSkater');skater.elite=false;skater.timer=93;enemies=[skater];skater.update(1);result.skater=bullets.length===2;
            bullets=[];player.inventory=[weaponCopy('coachScatter')];player.weapon=player.inventory[0];player.weaponIndex=0;var mimic=new Enemy(360,0,'mirrorMimic');mimic.elite=false;mimic.timer=119;enemies=[mimic];mimic.update(1);result.mimic=bullets.length===5;
            bullets=[];var mortar=new Enemy(520,0,'sporeMortar');mortar.elite=false;mortar.timer=149;enemies=[mortar];mortar.update(1);result.mortar=bullets.length===1&&bullets[0].blast===82&&bullets[0].sourceId==='sporeMortar';
            enemies=saved.enemies;bullets=saved.bullets;hazards=saved.hazards;obstacles=saved.obstacles;player.x=saved.x;player.y=saved.y;player.weapon=saved.weapon;player.weaponIndex=saved.index;player.inventory=saved.inventory;player.invuln=saved.invuln;enemyGridReady=false;return result;
        },
        timeTrial: function(){
            var b60=spawnBullet({x:0,y:0,angle:0,speed:10,life:1000,ghost:true}),b30=spawnBullet({x:0,y:0,angle:0,speed:10,life:1000,ghost:true}),b120=spawnBullet({x:0,y:0,angle:0,speed:10,life:1000,ghost:true});
            for(var t60=0;t60<60;t60++)b60.update(1);for(var t30=0;t30<30;t30++)b30.update(2);for(var t120=0;t120<120;t120++)b120.update(.5);
            var p60=spawnParticle(0,0,'#fff',1,2),p30=spawnParticle(0,0,'#fff',1,2),p120=spawnParticle(0,0,'#fff',1,2);p60.vx=p30.vx=p120.vx=4;p60.vy=p30.vy=p120.vy=-2;
            for(var pf60=0;pf60<60;pf60++)p60.update(1);for(var pf30=0;pf30<30;pf30++)p30.update(2);for(var pf120=0;pf120<120;pf120++)p120.update(.5);
            var camera60=0,camera30=0,camera120=0;for(var cf60=0;cf60<60;cf60++)camera60+=(100-camera60)*frameBlend(.1,1);for(var cf30=0;cf30<30;cf30++)camera30+=(100-camera30)*frameBlend(.1,2);for(var cf120=0;cf120<120;cf120++)camera120+=(100-camera120)*frameBlend(.1,.5);
            function wrappedTicksAt(renderHz){var clock=window.DKTime.createFixedStep({stepMs:SIMULATION_STEP_MS,baseStepMs:SIMULATION_STEP_MS,maxCatchUpMs:250}),ticks=0;clock.reset(0);for(var frame=1;frame<=renderHz;frame++)clock.advance(frame*1000/renderHz,true,function(slice){if(Math.abs(slice.deltaMs-SIMULATION_STEP_MS)<1e-8&&Math.abs(slice.scale-1)<1e-8)ticks++;});return ticks;}
            return{x60:b60.x,x30:b30.x,x120:b120.x,life60:b60.life,life30:b30.life,life120:b120.life,particleV60:p60.vx,particleV30:p30.vx,particleV120:p120.vx,camera60:camera60,camera30:camera30,camera120:camera120,trailStorage:b60.trailX instanceof Float32Array&&b60.trailX.length===12,elapsedScale:true,timeWrapper:!!window.DKTime&&typeof window.DKTime.createFixedStep==='function',fixed30:wrappedTicksAt(30),fixed60:wrappedTicksAt(60),fixed120:wrappedTicksAt(120),fixedStepMs:SIMULATION_STEP_MS};
        },
        performanceTrial: function(){
            if(!gameActive)startGame();var oldEnemies=enemies,oldBullets=bullets,oldParticles=particles,oldSlashes=slashes,oldProps=biomeProps;enemies=[];bullets=[];particles=[];slashes=[];biomeProps=[];
            for(var warm=0;warm<900;warm++)bullets.push(spawnBullet({x:warm%30,y:Math.floor(warm/30),angle:0,speed:0,damage:0,friendly:true,sourceId:'poolWarm',life:1}));for(var wd=0;wd<bullets.length;wd++)bullets[wd].dead=true;compactPooled(bullets,function(b){return!b.dead;},recycleBullet);var createdAfterWarm=poolStats.bulletCreated,reusedBefore=poolStats.bulletReused;
            for(var reuse=0;reuse<900;reuse++)bullets.push(spawnBullet({x:reuse%30,y:Math.floor(reuse/30),angle:0,speed:0,damage:0,friendly:true,sourceId:'poolReuse',life:1}));var createdAfterReuse=poolStats.bulletCreated,reusedDelta=poolStats.bulletReused-reusedBefore;for(var rd=0;rd<bullets.length;rd++)bullets[rd].dead=true;compactPooled(bullets,function(b){return!b.dead;},recycleBullet);
            var probeA=spawnBullet({x:0,y:0,angle:0}),probeRef=probeA;recycleBullet(probeA);var probeB=spawnBullet({x:1,y:1,angle:1}),identityReuse=probeB===probeRef;recycleBullet(probeB);
            for(var pe=0;pe<80;pe++){var gx=pe%10,gy=Math.floor(pe/10),enemy=new Enemy(-810+gx*180,-630+gy*180,'tank');enemy.elite=false;enemy.maxHp=99999;enemy.hp=99999;enemies.push(enemy);}for(var pb=0;pb<600;pb++)bullets.push(spawnBullet({x:-90+(pb%30)*6,y:-60+(pb%20)*6,angle:0,speed:0,damage:0,friendly:true,sourceId:'stress',life:120}));perfStats.collisionCandidates=0;perfStats.collisionChecks=0;perfStats.closestCandidates=0;rebuildEnemyGrid();handleCollisions();var result={enemyCount:enemies.length,bulletCount:bullets.length,naiveChecks:80*600,candidateChecks:perfStats.collisionChecks,candidateRatio:perfStats.collisionChecks/(80*600),fixedTrails:bullets.every(function(b){return b.trailX.length===12&&!Object.prototype.hasOwnProperty.call(b,'trail');}),poolStable:createdAfterReuse===createdAfterWarm,identityReuse:identityReuse,reusedDelta:reusedDelta,bulletPoolCap:1400,particlePoolCap:720,slashPoolCap:220,gridCellArrays:enemyGridKeys.length};for(var cleanup=0;cleanup<bullets.length;cleanup++)recycleBullet(bullets[cleanup]);enemies=oldEnemies;bullets=oldBullets;particles=oldParticles;slashes=oldSlashes;biomeProps=oldProps;enemyGridReady=false;return result;
        },
        manaRegenTrial: function(){if(!gameActive)startGame();var oldMana=player.mana,oldHazards=hazards,mage=new Player(0,0,{classId:'magic',starterId:classStarterPool('magic')[0]}),regular=new Player(0,0,{classId:'independent',starterId:classStarterPool('independent')[0]});mage.mana=0;regular.mana=0;hazards=[];mage.update(119,gameTimeMs+1983);var beforeTick=mage.mana;mage.update(1,gameTimeMs+2000);var firstTick=mage.mana;mage.update(120,gameTimeMs+4000);var secondTick=mage.mana;regular.update(240,gameTimeMs+4000);var basePickup=manaPickupValue(mage,14);player.mana=oldMana;hazards=oldHazards;return{mageMaxMana:mage.maxMana,beforeTick:beforeTick,firstTick:firstTick,secondTick:secondTick,tickAmount:mage.manaTickAmount,tickFrames:mage.manaTickFrames,regularPassive:regular.mana,regularDropChance:manaDropChanceFor(regular),mageDropChance:manaDropChanceFor(mage),regularPickup:basePickup,bossDropsPerPlayer:2};},
        dungeonMemoryTrial: function(){
            if(!gameActive)startGame();var saved={biome:currentBiome,progress:player.memoryProgress,memories:player.memories,prime:player.primeMemory,count:player.memoryAttackCount,primed:player.memoryPrimed,resonance:player.resonance,resonanceTimer:player.resonanceTimer,resonanceKind:player.resonanceKind,enemies:enemies,bullets:bullets,mana:player.mana,weapon:player.weapon,index:player.weaponIndex,lastShot:player.lastShot};currentBiome=BIOMES[1];player.memoryProgress={};player.memories={};player.primeMemory='';player.resonanceTimer=0;player.resonanceKind='';
            for(var learn=0;learn<2;learn++){player.resonance=2;gainBiomeResonance();player.resonanceTimer=0;player.resonanceKind='';}var learned=!!player.memories.WHITEOUT,autoEquipped=player.primeMemory==='WHITEOUT',progress=player.memoryProgress.WHITEOUT;enemies=[];bullets=[];player.x=0;player.y=0;player.mana=200;player.memoryAttackCount=4;this.equip('rustPistol');player.lastShot=0;player.tryAttack(1000);var fifthShot=bullets[0]&&bullets[0].status==='freeze'&&bullets[0].memory==='WHITEOUT';var attackBonus=player.attackRateMultiplier();player.primeMemory='SECOND HAND';var clockBonus=player.attackRateMultiplier();
            currentBiome=saved.biome;player.memoryProgress=saved.progress;player.memories=saved.memories;player.primeMemory=saved.prime;player.memoryAttackCount=saved.count;player.memoryPrimed=saved.primed;player.resonance=saved.resonance;player.resonanceTimer=saved.resonanceTimer;player.resonanceKind=saved.resonanceKind;enemies=saved.enemies;bullets=saved.bullets;player.mana=saved.mana;player.weapon=saved.weapon;player.weaponIndex=saved.index;player.lastShot=saved.lastShot;return{learned:learned,autoEquipped:autoEquipped,progress:progress,fifthShot:fifthShot,whiteoutRate:attackBonus,clockRate:clockBonus,memoryCount:Object.keys(DUNGEON_MEMORY_DEFS).length};
        },
        skillInventoryTrial: function(){if(!gameActive)startGame();player.activeSkills={frostNova:1,riftStep:2,bladeHalo:1};player.activeCooldowns={frostNova:60,riftStep:0,bladeHalo:0};player.equipActiveSkill('riftStep');openInventory();var opened=inventoryOpen&&gamePaused,owned=Object.keys(player.activeSkills).length,equipped=player.active;closeInventory();return{opened:opened,closed:!inventoryOpen,owned:owned,equipped:equipped};},
        shopCombatTrial: function(){if(!shopMode)this.armory();bullets=[];this.equip('rustPistol');player.lastShot=0;mouse.down=true;updateShopRoom(1,10000,16.67);mouse.down=false;return{shots:bullets.length,shopMode:shopMode,offers:shopOffers.length};},
        familyData:function(){var families={};Object.keys(WEAPON_DEFS).forEach(function(id){var w=WEAPON_DEFS[id];if(!w.family)return;(families[w.family]||(families[w.family]=[])).push({id:id,rarity:w.rarity});});return Object.keys(families).map(function(name){return{name:name,weapons:families[name],tiers:Array.from(new Set(families[name].map(function(w){return w.rarity;})))};});},
        supportVisualData:function(){var ids=Object.keys(STAT_DEFS).concat(Object.keys(ACTIVE_DEFS),Object.keys(PASSIVE_DEFS),Object.keys(PACT_DEFS)),missing=ids.filter(function(id){return!SUPPORT_ART[id]||!SUPPORT_ART[id].model;});return{total:ids.length,missing:missing,models:ids.map(function(id){return SUPPORT_ART[id]&&SUPPORT_ART[id].model;})};},
        supportPassiveTrial:function(){if(!gameActive)startGame();var saved={inventory:player.inventory,weapon:player.weapon,index:player.weaponIndex,passives:player.passives,pacts:player.pacts,cores:player.cores,classId:player.classId,classCounter:player.classShotCounter,familyStreak:player.familyStreak,manaCharge:player.manaSpendCharge,phaseGuard:player.phaseGuardAvailable,momentum:player.momentum,foundry:player.coinFoundryCharge,tempo:player.arsenalTempo,hp:player.hp,armor:player.armor,mana:player.mana,invuln:player.invuln,crit:player.stats.crit,enemies:enemies,bullets:bullets,hazards:hazards,effects:effects,particles:particles,pickups:pickups,pending:pendingShots,coins:coins,kills:kills,score:score},result={};player.inventory=[];player.weapon=null;player.weaponIndex=0;player.passives={};player.pacts={};player.cores={};player.classId='independent';player.classShotCounter=0;player.arsenalTempo=0;player.stats.crit=0;enemies=[];bullets=[];hazards=[];effects=[];particles=[];pickups=[];pendingShots=[];coins=0;
            this.equip('pipeRocket');player.fireWeapon(player.weapon,0,1,0);var baseBlast=bullets[0];bullets=[];player.passives={blastHarness:true};player.fireWeapon(player.weapon,0,1,0);result.blastHarness=Math.abs(bullets[0].blast-baseBlast.blast*1.25)<.001&&Math.abs(bullets[0].damage-baseBlast.damage*1.25)<.001;
            player.inventory=[];bullets=[];player.passives={tacticalSling:true};player.classShotCounter=7;this.equip('wardenAr');player.fireWeapon(player.weapon,0,1,0);result.tacticalSling=bullets.length===1&&bullets[0].crit&&bullets[0].classTracer&&bullets[0].pierce>=2;
            player.inventory=[];bullets=[];player.passives={};this.equip('cobbleSmg');player.weapon.shots=19;player.fireWeapon(player.weapon,0,1,0);var baseSmg=bullets[0].damage;bullets=[];player.passives={coolingJacket:true};player.fireWeapon(player.weapon,0,1,0);result.coolingJacket=bullets[0].damage>=baseSmg*1.299;
            player.inventory=[];bullets=[];player.passives={shellBandolier:true};this.equip('coachScatter');player.fireWeapon(player.weapon,0,1,0);result.shellBandolier=bullets.length===7&&bullets.every(function(b){return b.pointBlankBonus;});
            player.inventory=[];bullets=[];player.passives={};this.equip('rustPistol');player.fireWeapon(player.weapon,0,1,0);var baseRound=bullets[0];bullets=[];player.passives={glassRelay:true};player.fireWeapon(player.weapon,0,1,0);result.glassRelay=bullets[0].pierce===baseRound.pierce+1&&Math.abs(bullets[0].damage-baseRound.damage*.94)<.001;
            player.passives={eliteBreaker:true};var eliteTarget=new Enemy(300,0,'tank');eliteTarget.elite=true;eliteTarget.maxHp=1000;eliteTarget.hp=1000;enemies=[eliteTarget];damageEnemy(eliteTarget,10,{silent:true});result.eliteBreaker=Math.abs(eliteTarget.hp-987.5)<.001;
            player.passives={emergencyPlating:true};player.phaseGuardAvailable=true;player.invuln=0;player.armor=5;player.hp=player.maxHp-1;var guardHp=player.hp,guardArmor=player.armor;player.hit(3,'trial');result.emergencyPlating=player.hp===guardHp&&player.armor===guardArmor&&!player.phaseGuardAvailable;
            player.passives={manaCapacitor:true};player.invuln=0;player.mana=100;player.armor=0;player.manaSpendCharge=59;enemies=[];player.spendMana(1);result.manaCapacitor=player.armor===1&&player.manaSpendCharge===0;
            player.passives={bloodCompass:true};player.hp=player.maxHp-1;var quarry=new Enemy(180,0,'tank');quarry.elite=false;quarry.maxHp=10;quarry.hp=1;enemies=[quarry];damageEnemy(quarry,2,{crit:true,direct:true,silent:true});result.bloodCompass=quarry.dead&&Math.abs(player.hp-(player.maxHp-.5))<.001;
            player.passives={momentumSpurs:true};player.momentum=0;var stillRate=player.attackRateMultiplier();player.momentum=1;result.momentumSpurs=Math.abs(player.attackRateMultiplier()/stillRate-1.24)<.001;
            player.passives={};player.arsenalTempo=0;var basePower=player.damageMultiplier();player.passives={coinFoundry:true};player.coinFoundryCharge=0;coins=800;result.coinFoundry=Math.abs(player.damageMultiplier()/basePower-1.25)<.001;
            player.passives={elementalCrucible:true};var reagentA=new Enemy(160,0,'tank'),reagentB=new Enemy(220,0,'tank');reagentA.elite=false;reagentB.elite=false;reagentA.maxHp=reagentB.maxHp=500;reagentA.hp=reagentB.hp=500;reagentA.burn=100;enemies=[reagentA,reagentB];damageEnemy(reagentA,10,{status:'freeze',silent:true});result.elementalCrucible=reagentA.reactionCooldown===90&&reagentB.burn>0&&reagentB.freeze>0;
            player.inventory=saved.inventory;player.weapon=saved.weapon;player.weaponIndex=saved.index;player.passives=saved.passives;player.pacts=saved.pacts;player.cores=saved.cores;player.classId=saved.classId;player.classShotCounter=saved.classCounter;player.familyStreak=saved.familyStreak;player.manaSpendCharge=saved.manaCharge;player.phaseGuardAvailable=saved.phaseGuard;player.momentum=saved.momentum;player.coinFoundryCharge=saved.foundry;player.arsenalTempo=saved.tempo;player.hp=saved.hp;player.armor=saved.armor;player.mana=saved.mana;player.invuln=saved.invuln;player.stats.crit=saved.crit;enemies=saved.enemies;bullets=saved.bullets;hazards=saved.hazards;effects=saved.effects;particles=saved.particles;pickups=saved.pickups;pendingShots=saved.pending;coins=saved.coins;kills=saved.kills;score=saved.score;enemyGridReady=false;return result;},
        classTraitTrial:function(){if(!gameActive)startGame();var savedPlayer=player,savedClass=selectedClassId,savedBullets=bullets,savedPending=pendingShots,savedEffects=effects,result={};bullets=[];pendingShots=[];effects=[];
            selectedClassId='melee';player=new Player(0,0);player.inventory=[weaponCopy('ironCleaver'),weaponCopy('rustPistol')];player.weapon=player.inventory[0];var meleePower=player.damageMultiplier();player.weapon=player.inventory[1];result.melee=meleePower>player.damageMultiplier();
            selectedClassId='gunner';player=new Player(0,0);player.inventory=[weaponCopy('rustPistol')];player.weapon=player.inventory[0];player.classShotCounter=6;bullets=[];player.fireWeapon(player.weapon,0,1,0);result.gunner=bullets.length===1&&bullets[0].classTracer&&bullets[0].pierce>=2;
            selectedClassId='magic';player=new Player(0,0);player.inventory=[weaponCopy('emberWand')];player.weapon=player.inventory[0];player.spendMana(40);pendingShots=[];player.queueAttackEchoes(player.weapon,0,1);result.magic=!player.arcaneEchoReady&&pendingShots.some(function(s){return s.kind==='attackEcho'&&s.scale===.55;});
            selectedClassId='independent';player=new Player(0,0);player.inventory=[weaponCopy('rustPistol'),weaponCopy('ironCleaver')];player.weaponIndex=0;player.weapon=player.inventory[0];player.switchWeapon();result.independent=player.arsenalTempo===360&&player.damageMultiplier()>1.2;
            player=savedPlayer;selectedClassId=savedClass;bullets=savedBullets;pendingShots=savedPending;effects=savedEffects;return result;},
        multiplayerTrial:function(){
            var saved={player:player,mainPlayer:mainPlayer,enemies:enemies,remotePlayers:remotePlayers,remoteInputs:remoteInputs,partyRoster:partyRoster,pickups:pickups,bullets:bullets,slashes:slashes,hazards:hazards,totems:totems,radiants:radiantWeapons,particles:particles,effects:effects,coins:coins,wave:wave,biome:currentBiome,role:networkRole,peer:localPeerId,touch:touchMode,active:gameActive};var result={};networkRole='host';localPeerId='p0';gameActive=true;touchMode=true;coins=0;wave=5;currentBiome=BIOMES[0];bullets=[];slashes=[];hazards=[];totems=[];radiantWeapons=[];particles=[];effects=[];pickups=[];remotePlayers=Object.create(null);remoteInputs=Object.create(null);partyRoster=[];player=new Player(0,0,{netId:'p0',name:'RED',slot:0,color:PARTY_COLORS[0],classId:'independent',starterId:'rustPistol'});mainPlayer=player;for(var slot=1;slot<4;slot++){var id='p'+slot;remotePlayers[id]=new Player(slot*40,0,{netId:id,name:'P'+slot,slot:slot,color:PARTY_COLORS[slot],classId:'independent',starterId:'rustPistol'});}var members=partyPlayers();partyRoster=members.map(function(member,index){return{id:member.netId,slot:index,name:member.playerName,meta:{}};});members.forEach(function(member){member.mana=0;member.maxMana=100;member.hp=10;member.maxHp=10;member.armor=0;member.maxArmor=0;member.invuln=0;member.resources=emptyResourceBag();setWallet(member,0);pickups.push(new Pickup(0,0,'coin',1,member.netId));pickups.push(new Pickup(0,0,'mana',10,member.netId));});collectAllPickups();result.partyRewards=members.every(function(member){return walletFor(member)===1&&member.mana===10;})&&pickups.length===0;result.partyHands=members.every(function(member,index){return member.color===PARTY_COLORS[index];});enemies=[new Enemy(0,140,'trainingDummy')];enemyGridReady=false;rebuildEnemyGrid();player.angle=0;var touchInput=localInputState();result.guestAutoAim=Math.abs(touchInput.angle-Math.PI/2)<.001;members.forEach(function(member){member.invuln=0;member.hp=10;});explode(60,0,160,1,false,'#fff','',false);result.partyBlast=members.every(function(member){return member.hp<10;});var owner=members[2],ownedBullet,ownedField,ownedTotem;withActivePlayer(owner,function(){ownedBullet=spawnBullet({x:0,y:0,angle:0,friendly:true});ownedField=new TimedField(0,0,60,'light',30);ownedTotem=new Totem(0,0);applyStatus(enemies[0],'poison');});result.ownership=ownedBullet.ownerId===owner.netId&&ownedField.ownerId===owner.netId&&ownedTotem.ownerId===owner.netId&&enemies[0].poisonOwnerId===owner.netId;owner.lastProcessedInputSeq=17;var snap=playerSnapshot(owner);result.snapshotAck=snap.ack===17&&isFinite(snap.vx)&&isFinite(snap.vy)&&snap.coins===1&&snap.resources.metal===0;var ghost={x:0,y:0,_netVx:4,_netVy:0,_netCorrectionX:8,_netCorrectionY:0};advanceNetworkEntity(ghost,1,.2);result.deadReckoning=ghost.x>4&&ghost.x<12;result.trainingDummy=!!enemies[0].trainingDummy;
            pickups=[];var fallenBoss=new BiomeBoss(0,0,'ember');fallenBoss.dead=true;onEnemyKilled(fallenBoss);result.bossRewardMultiplicity=pickups.filter(function(item){return item.kind==='coin';}).length===48&&pickups.filter(function(item){return item.kind==='mana';}).length===8&&pickups.filter(function(item){return item.kind==='resource';}).length===12;collectAllPickups();result.bossShares=members.every(function(member){var bag=resourcesFor(member);return walletFor(member)===13&&member.mana===94&&bag.gunpowder===4&&bag.metal===4&&bag.sovereignEssence===2&&bag.arcaneCrystal===0&&bag.beastFiber===0;});
            pickups=[new Pickup(0,0,'coin',7,'departed-peer')];var walletBeforeOrphan=walletFor(player);collectAllPickups();result.orphanReward=walletFor(player)===walletBeforeOrphan;
            var acceptedBuild=applyBuild(owner,{revision:2,inventory:[{id:'rustPistol',level:99},{id:'notAWeapon',level:9}],weapon:'notAWeapon',stats:{crit:9,speed:99},passives:{calmMind:true,notAPassive:true},pacts:{notAPact:true},activeSkills:{riftStep:99,notASkill:2},activeCooldowns:{riftStep:-20},active:'notASkill',cores:{ember:true},memories:{WHITEOUT:true,notAMemory:true},primeMemory:'notAMemory',maxHp:Infinity,hp:-50,maxArmor:Infinity,armor:999,maxMana:Infinity,mana:999,coins:Infinity,resources:{metal:Infinity,gunpowder:-8,arcaneCrystal:7.9,beastFiber:2,sovereignEssence:50000}});var staleBuild=applyBuild(owner,{revision:1,inventory:[{id:'oakBow',level:1}],weapon:'oakBow'});var guardedResources=resourcesFor(owner);result.buildGuard=acceptedBuild&&!staleBuild&&owner.weapon.id==='rustPistol'&&owner.weapon.level===8&&owner.stats.crit===1&&owner.stats.speed===3&&Object.keys(owner.passives).length===1&&owner.passives.calmMind&&Object.keys(owner.pacts).length===0&&owner.activeSkills.riftStep===20&&owner.activeCooldowns.riftStep===0&&!owner.active&&Object.keys(owner.cores).length===0&&owner.memories.WHITEOUT&&!owner.primeMemory&&owner.hp===0&&walletFor(owner)===13&&guardedResources.metal===9999&&guardedResources.gunpowder===0&&guardedResources.arcaneCrystal===7&&guardedResources.beastFiber===2&&guardedResources.sovereignEssence===9999;
            player=saved.player;mainPlayer=saved.mainPlayer;enemies=saved.enemies;remotePlayers=saved.remotePlayers;remoteInputs=saved.remoteInputs;partyRoster=saved.partyRoster;pickups=saved.pickups;bullets=saved.bullets;slashes=saved.slashes;hazards=saved.hazards;totems=saved.totems;radiantWeapons=saved.radiants;particles=saved.particles;effects=saved.effects;coins=saved.coins;wave=saved.wave;currentBiome=saved.biome;networkRole=saved.role;localPeerId=saved.peer;touchMode=saved.touch;gameActive=saved.active;enemyGridReady=false;updateHUD();updatePartyHud();return result;
        },
        reroll: rerollShop,
        buy: buyOffer,
        catalog: function(){return{weapons:Object.keys(WEAPON_DEFS).length,signatureEnemies:Object.keys(SIGNATURE_ENEMIES).length,stats:Object.keys(STAT_DEFS).length,activeSkills:Object.keys(ACTIVE_DEFS).length,passiveSkills:Object.keys(PASSIVE_DEFS).length,pacts:Object.keys(PACT_DEFS).length,enemies:Object.keys(ENEMY_BASE).filter(function(kind){return kind!=='trainingDummy';}).length,enemyVariants:Object.keys(ENEMY_VARIANTS).length,bosses:Object.keys(BOSS_DEFS).length,resources:Object.keys(RESOURCE_DEFS).length,cores:0,biomes:BIOMES.length};}
    };

    init();
}());

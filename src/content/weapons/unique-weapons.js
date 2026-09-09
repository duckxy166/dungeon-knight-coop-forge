/*
 * DUNGEON KNIGHT v1.9 — UNIQUE WEAPON CATALOG
 *
 * This single readable catalog contains all 89 standalone weapons.
 * Every weapon keeps its definition, mechanics hook, held art, projectile art,
 * impact accents, and aura registrations together in one numbered section.
 * Search for a weapon name or its former filename to jump directly to it.
 */

// TABLE OF CONTENTS
// 01 — AFTERIMAGE SABER (afterimage-saber.js)
// 02 — ALCHEMIST ROTARY (alchemist-rotary.js)
// 03 — ASTRAL CHOIR: TWELFTH HYMN (astral-choir.js)
// 04 — AURORA HARPOON (aurora-harpoon.js)
// 05 — BEETLE CARBINE (beetle-carbine.js)
// 06 — BLOOD MOON KATANA (blood-moon-katana.js)
// 07 — RETURNING COG (boomerang-cog.js)
// 08 — BOTTLECAP SLINGER (bottlecap-slinger.js)
// 09 — WARDEN BROOMSPEAR (broom-spear.js)
// 10 — BUBBLEWRIGHT STAFF (bubblewright-staff.js)
// 11 — BURST CARBINE (burst-carbine.js)
// 12 — CANDLE SNUFFER (candle-snuffer.js)
// 13 — CANDLEFORK (candlefork.js)
// 14 — CATHEDRAL ORGAN (cathedral-organ.js)
// 15 — CHAIN FLAIL (chain-flail.js)
// 16 — CHALK BLASTER (chalk-blaster.js)
// 17 — CHRONO CANNON (chrono-cannon.js)
// 18 — COIL CARBINE (coil-carbine.js)
// 19 — COMET LONGBOW (comet-longbow.js)
// 20 — CONSTELLATION BOW (constellation-bow.js)
// 21 — COPPER BELLOWS (copper-bellows.js)
// 22 — CORKSCREW MUSKET (corkscrew-musket.js)
// 23 — CROSSWIND BALLISTA (crosswind-ballista.js)
// 24 — CROWNCRUSHER: SOVEREIGN (crowncrusher.js)
// 25 — DEW SCEPTER (dew-scepter.js)
// 26 — DICE CANNON (dice-cannon.js)
// 27 — DRAGON MAW (dragon-maw.js)
// 28 — ECHO MAUL (echo-maul.js)
// 29 — ECLIPSE BOW: BLACK ZENITH (eclipse-bow.js)
// 30 — EMBER WAND (ember-wand.js)
// 31 — FALCON REPEATER (falcon-repeater.js)
// 32 — FLARE PISTOL (flare-pistol.js)
// 33 — FROSTBRAND (frostbrand.js)
// 34 — GEARSPIKE PIKE (gearspike-pike.js)
// 35 — GLASS NEEDLER (glass-needler.js)
// 36 — GRAVE BELL (grave-bell.js)
// 37 — GRAVEGLASS AUTOCANNON (graveglass-autocannon.js)
// 38 — GRAVITY SAW (gravity-saw.js)
// 39 — GUILLOTINE YO-YO (guillotine-yoyo.js)
// 40 — HEDGEHOG BUCKLER (hedgehog-buckler.js)
// 41 — HIVE LAUNCHER (hive-launcher.js)
// 42 — HOURHAND RAPIER (hourhand-rapier.js)
// 43 — IRON CLEAVER (iron-cleaver.js)
// 44 — DUELING TONGS (kitchen-tongs.js)
// 45 — GALE KITEBOW (kitebow.js)
// 46 — LOTUS MINECASTER (lotus-minecaster.js)
// 47 — MARIONETTE CODEX (marionette-codex.js)
// 48 — MINERS PICK (miners-pick.js)
// 49 — MIRROR LANCE (mirror-lance.js)
// 50 — MOONHOOK (moonhook.js)
// 51 — MOSS CHARM (moss-charm.js)
// 52 — MOTHWING BOW (mothwing-bow.js)
// 53 — OAK SHORTBOW (oak-bow.js)
// 54 — ORACLE DECK (oracle-deck.js)
// 55 — PAPER DART FAN (paper-dart-fan.js)
// 56 — PARADOX SHOTGUN (paradox-shotgun.js)
// 57 — PEBBLE CHOIR (pebble-choir.js)
// 58 — TIN PEPPERBOX (pepperbox.js)
// 59 — PHASE SMG (phase-smg.js)
// 60 — PHOENIX FAN (phoenix-fan.js)
// 61 — POCKET MORTAR (pocket-mortar.js)
// 62 — POLLEN CODEX (pollen-codex.js)
// 63 — PORTAL REPEATER (portal-repeater.js)
// 64 — PRISM MOTH CODEX (prism-moth-codex.js)
// 65 — PRISM RIFLE (prism-rifle.js)
// 66 — RAILHOOK BOW (railhook-bow.js)
// 67 — RAINMAKER (rainmaker.js)
// 68 — REED CROSSBOW (reed-crossbow.js)
// 69 — RELAY PISTOL (relay-pistol.js)
// 70 — RICOCHET SIX (ricochet-revolver.js)
// 71 — RIFT RAIL: WORLDSEAM (rift-rail.js)
// 72 — RIPTIDE ANCHOR (riptide-anchor.js)
// 73 — RRHARIL (rrharil.js)
// 74 — RUST PISTOL (rust-pistol.js)
// 75 — SCATTERGUN (scattergun.js)
// 76 — SCRAP NAILER (scrap-nailer.js)
// 77 — SPARK STAFF (spark-staff.js)
// 78 — SPLITVINE BOW (splitvine-bow.js)
// 79 — STARFALL VOLLEYGUN (starfall-volleygun.js)
// 80 — STARFORGE MINIGUN (starforge-minigun.js)
// 81 — STORM GRIMOIRE (storm-grimoire.js)
// 82 — SUNSHARD MUSKET (sunshard-musket.js)
// 83 — TESLA RIFLE (tesla-rifle.js)
// 84 — THUNDERHEAD BLUNDERBUSS (thunderhead-blunderbuss.js)
// 85 — TIDAL DRUMGUN (tidal-drumgun.js)
// 86 — TRIPWIRE BOW (tripwire-bow.js)
// 87 — RESONANT FORK (tuning-fork.js)
// 88 — UNDERTAKER SHOVEL (undertaker-shovel.js)
// 89 — VOID LANTERN (void-lantern.js)
// ============================================================================
// 01 — AFTERIMAGE SABER
// A short phase-step cuts through the front arc, then two translucent copies repeat the cut from the path you crossed.
// Former module: weapons/unique/afterimage-saber.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        afterimageSaber: {
            name: 'AFTERIMAGE SABER', icon: '⟫', category: 'MELEE', rarity: 'epic', damage: 18, rate: 430,
            reach: 138, arc: 2.05, color: '#ff78e6', price: 123, handler: 'afterimage', deflect: true, desc: 'A short phase-step cuts through the front arc, then two translucent copies repeat the cut from the path you crossed.'
        }
    }, {
        afterimageSaber: DKAttackProfile('phaseSlash', 16, 0, 2.05, 32, 0, 5, 'afterimages', 6, 108, .5)
    }, "weapons/unique/afterimageSaber");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('afterimageSaber', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=2.18; c.radius=138; c.attackAngle+=c.weapon.shots%2?-.28: .28; c.knockback=3.8; var stepped=c.player.phaseStep(56,
            c.player.angle), midX=(c.originX+c.player.x)*.5, midY=(c.originY+c.player.y)*.5; c.api.pushPending({
                frames: 7, kind: 'phaseEcho', x: midX, y: midY, angle: c.attackAngle, radius: c.radius, arc: c.arc,
                damage: c.damage*.48, color: '#ffd4f5', sourceId: c.weapon.id
            }); c.api.pushPending({
                frames: 14, kind: 'phaseEcho', x: c.originX, y: c.originY, angle: c.attackAngle, radius: c.radius+12,
                arc: c.arc+.28, damage: c.damage*.36, color: c.weapon.color, sourceId: c.weapon.id
            }); c.api.addBeam(c.originX, c.originY, c.player.x, c.player.y, '#ff78e6', 5); if(stepped>18)c.player.invuln=Math.max(c.player.invuln,
            8);
        }
    }, 'weapons/unique/afterimage-saber');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_afterimageSaber(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#43223f'; ctx.fillRect(3,
        -4, 22, 8); ctx.fillStyle='#ffe1f8'; ctx.fillRect(17, -7, 4, 14); ctx.beginPath(); ctx.moveTo(21,
        -8); ctx.lineTo(29, -3); ctx.lineTo(29, 3); ctx.lineTo(21, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); for(var ag=0; ag<3; ag++){
            ctx.globalAlpha=.3+ag*.22; ctx.fillStyle=ag===2?'#fff': w.color; ctx.beginPath(); ctx.moveTo(28+ag*3,
            -3-ag); ctx.lineTo(66+ag*5, 0); ctx.lineTo(28+ag*3, 3+ag); ctx.lineTo(39+ag*2, 0); ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha=1; ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(64,
        0); ctx.stroke();
    }
    DKRegister.weaponRenderer('afterimageSaber', render_afterimageSaber, 'weapons/unique/afterimage-saber');
}
());

// ============================================================================
// 02 — ALCHEMIST ROTARY
// Four reagent chambers cycle predictably through fire, frost, shock, and venom rounds.
// Former module: weapons/unique/alchemist-rotary.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        alchemistRotary: {
            name: 'ALCHEMIST ROTARY', icon: '♧', category: 'GUN', rarity: 'rare', damage: 5.8, rate: 280,
            speed: 15, color: '#d7b45a', price: 81, handler: 'alchemistRotary', desc: 'Four reagent chambers cycle predictably through fire, frost, shock, and venom rounds.'
        }
    }, {
        alchemistRotary: DKAttackProfile('vialRoll', 13, 11, .23, 1, 4, 2, 'reagents', 4, 53, .8)
    }, "weapons/unique/alchemistRotary");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('alchemistRotary', {
        configureProjectile: function(c){
            var reagent=(c.weapon.shots-1)%4, reagentColors=['#ff6b35', '#74b9ff', '#ffe66d', '#8dcc58'],
            reagentStatus=['burn', 'freeze', 'shock', 'poison']; c.opts.type='reagent'; c.opts.radius=6; c.opts.life=110; c.opts.color=reagentColors[reagent]; c.opts.status=reagentStatus[reagent]; c.opts.blast=reagent===0?24: 0; c.opts.homing=reagent===2?.025: 0;
        }
    }, 'weapons/unique/alchemist-rotary');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_alchemistRotary(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#353329'; ctx.beginPath(); ctx.moveTo(4,
        -8); ctx.lineTo(31, -9); ctx.lineTo(45, -4); ctx.lineTo(45, 4); ctx.lineTo(31, 9); ctx.lineTo(4,
        8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#5b5040'; ctx.fillRect(9, 8, 9, 11); ctx.save(); ctx.translate(30,
        0); ctx.rotate(-visualTick*.035); var arcColors=['#ff6b35', '#74b9ff', '#ffe66d', '#8dcc58']; for(var acr=0; acr<4; acr++){
            ctx.rotate(TAU/4); ctx.fillStyle=arcColors[acr]; ctx.fillRect(3, -3, 12, 6); ctx.strokeStyle='#fff'; ctx.strokeRect(3,
            -3, 12, 6);
        }
        ctx.restore(); ctx.fillStyle='#fff3d6'; ctx.beginPath(); ctx.arc(47, 0, 3+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('alchemistRotary', render_alchemistRotary, 'weapons/unique/alchemist-rotary');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_alchemistRotary_17(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(2,
        0, 6, 0, TAU); ctx.fill(); ctx.strokeStyle='#fff'; ctx.stroke(); ctx.fillStyle='#e8dfcb'; ctx.fillRect(-8,
        -3, 5, 6); ctx.fillStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(0, -2, 2, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('alchemistRotary', projectileArt_alchemistRotary_17);
}
());

// ============================================================================
// 03 — ASTRAL CHOIR: TWELFTH HYMN
// Twenty-four mana releases twelve piercing hunter-notes. Every third cast performs a bullet-converting room-wide superchord.
// Former module: weapons/unique/astral-choir.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        astralChoir: {
            name: 'ASTRAL CHOIR: TWELFTH HYMN', icon: '✦', category: 'MAGIC', rarity: 'mythical', damage: 14,
            rate: 480, speed: 12, count: 12, mana: 24, color: '#ff416c', price: 172, handler: 'choir', desc: 'Twenty-four mana releases twelve piercing hunter-notes. Every third cast performs a bullet-converting room-wide superchord.'
        }
    }, {
        astralChoir: DKAttackProfile('toll', 27, 2, .48, 0, 23, 5, 'notes', 12, 105, .5)
    }, "weapons/unique/astralChoir");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('astralChoir', {
        prepareVolley: function(c){
            c.count=c.weapon.count; if(c.weapon.shots%3===0){
                var converted=0, bullets=c.api.bullets(), enemies=c.api.enemies(); for(var i=0; i<bullets.length; i++){
                    var hostile=bullets[i]; if(!hostile.dead&&!hostile.friendly&&Math.hypot(hostile.x-c.player.x,
                    hostile.y-c.player.y)<950){
                        hostile.friendly=true; hostile.damage=Math.max(9, hostile.damage*2.2); hostile.color='#ff416c'; hostile.sourceId='astralChoir'; hostile.type='note'; hostile.homing=.11; hostile.pierce=2; converted++;
                    }
                }
                for(var e=0; e<enemies.length; e++){
                    var foe=enemies[e]; if(!foe.dead&&Math.hypot(foe.x-c.player.x, foe.y-c.player.y)<850)c.api.damageEnemy(foe,
                    c.weapon.damage*.9*c.scale*c.player.damageMultiplier(), {
                        status: 'shock', direct: true, silent: true
                    });
                }
                c.api.addRing(c.player.x, c.player.y, '#fff', 850, 4); c.api.addRing(c.player.x, c.player.y,
                c.weapon.color, 620, 12); c.api.pushEffect({
                    type: 'organWave', x: c.player.x, y: c.player.y, angle: c.player.angle, color: c.weapon.color,
                    life: 1
                }); c.api.showToast('THE TWELFTH HYMN · '+converted+' SHOTS CONVERTED', c.weapon.color);
            }
        }, configureAngle: function(c){
            c.angle=c.baseAngle+c.index*c.api.TAU/c.count;
        }, configureProjectile: function(c){
            c.opts.type='note'; c.opts.homing=.11; c.opts.life=190; c.opts.radius=5; c.opts.pierce=3;
        }
    }, 'weapons/unique/astral-choir');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_astralChoir(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#24172e'; ctx.fillRect(4,
        -3, 22, 6); ctx.fillStyle='#f4dfff'; for(var ah=0; ah<4; ah++)ctx.fillRect(8+ah*5, -5, 2, 10); ctx.save(); ctx.translate(37,
        0); ctx.rotate(visualTick*.025); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(0,
        0, 20, 12, 0, 0, TAU); ctx.stroke(); ctx.rotate(-visualTick*.055); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(0,
        0, 13, 22, 0, 0, TAU); ctx.stroke(); for(var ac=0; ac<7; ac++){
            var aca=visualTick*.045+ac*TAU/7, ar=ac%2?18: 24, ax=Math.cos(aca)*ar, ay=Math.sin(aca)*ar*.66; ctx.fillStyle=ac%2?'#fff': w.color; ctx.beginPath(); ctx.arc(ax,
            ay, 2.6, 0, TAU); ctx.fill(); ctx.fillRect(ax+1.5, ay-7, 2, 8); if(ac>0){
                var apa=visualTick*.045+(ac-1)*TAU/7, apr=(ac-1)%2?18: 24; ctx.strokeStyle='rgba(255,220,255,.45)'; ctx.beginPath(); ctx.moveTo(Math.cos(apa)*apr,
                Math.sin(apa)*apr*.66); ctx.lineTo(ax, ay); ctx.stroke();
            }
        }
        ctx.fillStyle='#09050d'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,
        0, 2+pulse*2, 0, TAU); ctx.fill(); ctx.restore();
    }
    DKRegister.weaponRenderer('astralChoir', render_astralChoir, 'weapons/unique/astral-choir');
    // Mythical/legendary attack aura belongs to this weapon module.
    function aura_astralChoir(r){
        var ctx=r.ctx, p=r.player, w=r.weapon, q=r.progress, i=r.impact, v=r.visualTick, TAU=r.TAU; ctx.rotate(q*1.8); for(var n=0; n<12; n++){
            ctx.rotate(TAU/12); var nr=42+i*50; ctx.fillStyle=n%3===0?'#fff': w.color; ctx.beginPath(); ctx.arc(nr,
            0, 3+i*2, 0, TAU); ctx.fill(); ctx.fillRect(nr+2, -10-i*5, 3, 12+i*4); if(n%2===0){
                ctx.strokeStyle=w.color; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(nr-5,
                0); ctx.stroke();
            }
        }
    }
    DKRegister.weaponAura('astralChoir', aura_astralChoir, 'weapons/unique/astral-choir');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_astralChoir_44(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.11); ctx.fillStyle='#fff'; ctx.beginPath(); for(var an=0; an<10; an++){
            var anr=an%2?3: 8, ana=an*TAU/10; if(an===0)ctx.moveTo(Math.cos(ana)*anr, Math.sin(ana)*anr); else ctx.lineTo(Math.cos(ana)*anr,
            Math.sin(ana)*anr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,
        0, 11+Math.sin(b.age*.18)*2, 0, TAU); ctx.stroke(); ctx.rotate(-b.age*.18); for(var ano=0; ano<3; ano++){
            ctx.rotate(TAU/3); ctx.fillStyle=ano===1?'#fff': b.color; ctx.beginPath(); ctx.arc(15, 0, 2.2,
            0, TAU); ctx.fill(); ctx.fillRect(16, -6, 2, 7);
        }
    }
    DKRegister.projectileRenderer('astralChoir', projectileArt_astralChoir_44);
}
());

// ============================================================================
// 04 — AURORA HARPOON
// Its crystal barb latches to a survivor and leaves a damaging aurora tether for three seconds.
// Former module: weapons/unique/aurora-harpoon.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        auroraHarpoon: {
            name: 'AURORA HARPOON', icon: '↠', category: 'GUN', rarity: 'epic', damage: 15, rate: 900, speed: 16,
            color: '#7efff5', price: 120, handler: 'harpoon', desc: 'Its crystal barb latches to a survivor and leaves a damaging aurora tether for three seconds.'
        }
    }, {
        auroraHarpoon: DKAttackProfile('thrust', 21, 7, .04, 35, 0, 2, 'aurora', 6, 78, .7)
    }, "weapons/unique/auroraHarpoon");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('auroraHarpoon', {
        configureProjectile: function(c){
            c.opts.type='harpoon'; c.opts.radius=5; c.opts.pierce=0; c.opts.harpoon=true; c.opts.life=100;
        }
    }, 'weapons/unique/aurora-harpoon');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_auroraHarpoon(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#183c43'; ctx.beginPath(); ctx.moveTo(4,
        -7); ctx.lineTo(31, -8); ctx.lineTo(39, -4); ctx.lineTo(39, 4); ctx.lineTo(31, 8); ctx.lineTo(4,
        7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#7efff5'; ctx.beginPath(); ctx.moveTo(27,
        -5); ctx.lineTo(48, 0); ctx.lineTo(27, 5); ctx.lineTo(33, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#eaffff'; ctx.beginPath(); ctx.moveTo(37,
        0); ctx.lineTo(55, 0); ctx.moveTo(47, 0); ctx.lineTo(42, -7); ctx.moveTo(47, 0); ctx.lineTo(42, 7); ctx.stroke(); ctx.globalAlpha=.45; ctx.fillStyle=w.color; ctx.beginPath(); ctx.ellipse(24,
        0, 14+pulse*3, 5, 0, 0, TAU); ctx.fill(); ctx.globalAlpha=1;
    }
    DKRegister.weaponRenderer('auroraHarpoon', render_auroraHarpoon, 'weapons/unique/aurora-harpoon');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_auroraHarpoon_30(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#bffcff'; ctx.beginPath(); ctx.moveTo(14,
        0); ctx.lineTo(2, -7); ctx.lineTo(5, -2); ctx.lineTo(-8, -2); ctx.lineTo(-8, 2); ctx.lineTo(5, 2); ctx.lineTo(2,
        7); ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke();
    }
    DKRegister.projectileRenderer('auroraHarpoon', projectileArt_auroraHarpoon_30);
    // Impact accent for this projectile.
    function impactArt_auroraHarpoon(r){
        var b=r.projectile; r.api.addRing(r.x, r.y, '#7efff5', 38, 2);
    }
    DKRegister.projectileImpactRenderer('auroraHarpoon', impactArt_auroraHarpoon);
}
());

// ============================================================================
// 05 — BEETLE CARBINE
// Its lacquered shell-round hatches two wing shots on the first wall strike, then keeps ricocheting.
// Former module: weapons/unique/beetle-carbine.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        beetleCarbine: {
            name: 'BEETLE CARBINE', icon: '⬡', category: 'GUN', rarity: 'uncommon', damage: 5.2, rate: 420,
            speed: 13, bounce: 2, color: '#4fbf78', price: 47, handler: 'beetle', desc: 'Its lacquered shell-round hatches two wing shots on the first wall strike, then keeps ricocheting.'
        }
    }, {
        beetleCarbine: DKAttackProfile('wingKick', 14, 11, .17, 2, 3, 2, 'elytra', 6, 48, .16)
    }, "weapons/unique/beetleCarbine");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('beetleCarbine', {
        configureProjectile: function(c){
            c.opts.type='beetleShell'; c.opts.radius=7; c.opts.life=125; c.opts.bounce=c.weapon.bounce||2; c.opts.beetleSplit=true; c.opts.pierce=1;
        }
    }, 'weapons/unique/beetle-carbine');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_beetleCarbine(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#1f3a2b'; ctx.beginPath(); ctx.moveTo(4,
        -7); ctx.lineTo(31, -11); ctx.lineTo(48, -6); ctx.lineTo(53, 0); ctx.lineTo(48, 6); ctx.lineTo(31,
        11); ctx.lineTo(4, 7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle=w.color; ctx.beginPath(); ctx.ellipse(32,
        0, 15, 10, 0, 0, TAU); ctx.fill(); ctx.strokeStyle='#d8ffe4'; ctx.beginPath(); ctx.moveTo(32, -9); ctx.lineTo(32,
        9); ctx.moveTo(19, -4); ctx.lineTo(8, -12); ctx.moveTo(19, 4); ctx.lineTo(8, 12); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(44,
        -3, 2, 0, TAU); ctx.arc(44, 3, 2, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('beetleCarbine', render_beetleCarbine, 'weapons/unique/beetle-carbine');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_beetleCarbine_12(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle=b.sourceId==='beetleWing'?'#d9ffe8': '#265238'; ctx.beginPath(); ctx.ellipse(0,
        0, b.sourceId==='beetleWing'?6: 8, b.sourceId==='beetleWing'?3: 6, 0, 0, TAU); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,
        -5); ctx.lineTo(0, 5); ctx.stroke(); if(b.sourceId==='beetleWing'){
            ctx.fillStyle='rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-3, -5, 5, 2, -.35, 0, TAU); ctx.ellipse(-3,
            5, 5, 2, .35, 0, TAU); ctx.fill();
        }
    }
    DKRegister.projectileRenderer('beetleCarbine', projectileArt_beetleCarbine_12); DKRegister.projectileRenderer('beetleWing',
    projectileArt_beetleCarbine_12);
}
());

// ============================================================================
// 06 — BLOOD MOON KATANA
// Alternating left-right blood arcs; every third slash launches a crescent and dash kills heal.
// Former module: weapons/unique/blood-moon-katana.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        bloodMoonKatana: {
            name: 'BLOOD MOON KATANA', icon: '☾', category: 'MELEE', rarity: 'epic', damage: 20, rate: 390,
            reach: 125, arc: 1.9, color: '#ff4757', price: 108, handler: 'katana', deflect: true, desc: 'Alternating left-right blood arcs; every third slash launches a crescent and dash kills heal.'
        }
    }, {
        bloodMoonKatana: DKAttackProfile('sweep', 17, 0, 2.2, 14, 0, 4, 'crescent', 6, 102, .2)
    }, "weapons/unique/bloodMoonKatana");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('bloodMoonKatana', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=2.05; c.radius=125; c.attackAngle+=c.weapon.shots%2?-.42: .42; c.knockback=3.5;
        }, afterMelee: function(c){
            if(c.weapon.shots%3===0)c.api.pushBullet({
                x: c.player.x, y: c.player.y, angle: c.player.angle, speed: 12, damage: c.damage*.7, friendly: true,
                color: c.weapon.color, radius: 8, pierce: 2, status: c.weapon.status||'', sourceId: c.weapon.id
            });
        }, onEnemyKilled: function(c){
            if(c.player.isDashing)c.player.hp=Math.min(c.player.maxHp, c.player.hp+.5);
        }
    }, 'weapons/unique/blood-moon-katana');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_bloodMoonKatana(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#2c1c20'; ctx.fillRect(4,
        -3, 20, 6); ctx.fillStyle=w.color; ctx.beginPath(); ctx.moveTo(22, -3); ctx.quadraticCurveTo(40,
        -13, 55, -5); ctx.quadraticCurveTo(42, 1, 24, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle='#ffd7de'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(27,
        -1); ctx.quadraticCurveTo(42, -8, 51, -4); ctx.stroke(); ctx.fillStyle='#f1c40f'; ctx.fillRect(20,
        -7, 3, 14);
    }
    DKRegister.weaponRenderer('bloodMoonKatana', render_bloodMoonKatana, 'weapons/unique/blood-moon-katana');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_bloodMoonKatana_37(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.strokeStyle=b.color; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(-2,
        0, 11, -.8, .8); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(-2,
        0, 11, -.7, .7); ctx.stroke();
    }
    DKRegister.projectileRenderer('bloodMoonKatana', projectileArt_bloodMoonKatana_37);
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_bloodMoonKatana_2(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(sl.x, sl.y,
        sl.radius*(1-t*.08), sl.angle-sl.arc/2, sl.angle+sl.arc/2); ctx.stroke(); ctx.globalAlpha*=.45; ctx.lineWidth=11; ctx.beginPath(); ctx.arc(sl.x,
        sl.y, sl.radius*.83, sl.angle-sl.arc/2-.1, sl.angle+sl.arc/2-.1); ctx.stroke();
    }
    DKRegister.slashRenderer('bloodMoonKatana', slashArt_bloodMoonKatana_2);
}
());

// ============================================================================
// 07 — RETURNING COG
// A toothed clockwork disc flies out, turns, and cuts a second time on its journey home.
// Former module: weapons/unique/boomerang-cog.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        boomerangCog: {
            name: 'RETURNING COG', icon: '✣', category: 'GUN', rarity: 'uncommon', damage: 7, rate: 720,
            speed: 10, color: '#e0a93b', price: 45, handler: 'boomerang', desc: 'A toothed clockwork disc flies out, turns, and cuts a second time on its journey home.'
        }
    }, {
        boomerangCog: DKAttackProfile('throw', 18, 2, .8, 16, 0, 2, 'gears', 8, 45, .5)
    }, "weapons/unique/boomerangCog");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('boomerangCog', {
        configureProjectile: function(c){
            c.opts.type='cog'; c.opts.radius=9; c.opts.pierce=4; c.opts.returning=true; c.opts.returnAge=32; c.opts.life=125; c.opts.bounce=1;
        }
    }, 'weapons/unique/boomerang-cog');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_boomerangCog(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#38403d'; ctx.fillRect(4,
        -3, 21, 6); ctx.save(); ctx.translate(34, 0); ctx.rotate(visualTick*.05); ctx.fillStyle=w.color; ctx.beginPath(); for(var bg=0; bg<16; bg++){
            var bgr=bg%2?8: 12, bga=bg*TAU/16; if(bg===0)ctx.moveTo(Math.cos(bga)*bgr, Math.sin(bga)*bgr); else ctx.lineTo(Math.cos(bga)*bgr,
            Math.sin(bga)*bgr);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#25302d'; ctx.beginPath(); ctx.arc(0, 0,
        5, 0, TAU); ctx.fill(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.stroke(); ctx.restore();
    }
    DKRegister.weaponRenderer('boomerangCog', render_boomerangCog, 'weapons/unique/boomerang-cog');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_boomerangCog_25(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.34); ctx.fillStyle=b.sourceId==='guillotineYoyo'?'#3b1720': b.sourceId==='gravitySaw'?'#21133a': b.color; ctx.beginPath(); for(var cg=0; cg<16; cg++){
            var cgr=cg%2?(b.sourceId==='guillotineYoyo'?6: b.sourceId==='gravitySaw'?8: 5): (b.sourceId==='guillotineYoyo'?12: b.sourceId==='gravitySaw'?15: 9); var cga=cg*TAU/16; if(cg===0)ctx.moveTo(Math.cos(cga)*cgr,
            Math.sin(cga)*cgr); else ctx.lineTo(Math.cos(cga)*cgr, Math.sin(cga)*cgr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,
        0, b.sourceId==='gravitySaw'?4: 2, 0, TAU); ctx.fill(); if(b.sourceId==='gravitySaw'){
            ctx.strokeStyle='#9c6cff'; ctx.beginPath(); ctx.arc(0, 0, 20+Math.sin(b.age*.18)*3, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.projectileRenderer('boomerangCog', projectileArt_boomerangCog_25);
}
());

// ============================================================================
// 08 — BOTTLECAP SLINGER
// A spring-loaded junk pistol. Flat caps ricochet twice and bite harder after each wall.
// Former module: weapons/unique/bottlecap-slinger.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        bottlecapSlinger: {
            name: 'BOTTLECAP SLINGER', icon: '⊙', category: 'GUN', rarity: 'common', damage: 3.2, rate: 330,
            speed: 12, bounce: 2, color: '#d6b765', price: 25, handler: 'capSlinger', desc: 'A spring-loaded junk pistol. Flat caps ricochet twice and bite harder after each wall.'
        }
    }, {
        bottlecapSlinger: DKAttackProfile('spring', 11, 8, .11, 1, 1, 1, 'caps', 5, 38, .12)
    }, "weapons/unique/bottlecapSlinger");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('bottlecapSlinger', {
        configureProjectile: function(c){
            c.opts.life=115; c.opts.radius=6; c.opts.type='cap'; c.opts.bounce=c.weapon.bounce||2;
        }
    }, 'weapons/unique/bottlecap-slinger');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_bottlecapSlinger(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#5a4936'; ctx.beginPath(); ctx.moveTo(4,
        -6); ctx.lineTo(31, -8); ctx.lineTo(41, -4); ctx.lineTo(41, 4); ctx.lineTo(29, 8); ctx.lineTo(4,
        6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#80684d'; ctx.fillRect(9, 6, 8, 11); ctx.save(); ctx.translate(31,
        0); ctx.rotate(visualTick*.08); ctx.fillStyle=w.color; ctx.beginPath(); for(var bcs=0; bcs<16; bcs++){
            var bcsa=bcs*TAU/16, bcsr=bcs%2?7: 9; if(!bcs)ctx.moveTo(Math.cos(bcsa)*bcsr, Math.sin(bcsa)*bcsr); else ctx.lineTo(Math.cos(bcsa)*bcsr,
            Math.sin(bcsa)*bcsr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle='#fff5c7'; ctx.stroke(); ctx.restore(); ctx.strokeStyle='#d8c28a'; ctx.beginPath(); ctx.moveTo(38,
        -4); ctx.lineTo(49, 0); ctx.lineTo(38, 4); ctx.stroke();
    }
    DKRegister.weaponRenderer('bottlecapSlinger', render_bottlecapSlinger, 'weapons/unique/bottlecap-slinger');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_bottlecapSlinger_9(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.35); ctx.fillStyle='#8b7435'; ctx.beginPath(); for(var cap=0; cap<16; cap++){
            var capa=cap*TAU/16, capr=cap%2?6: 8; if(!cap)ctx.moveTo(Math.cos(capa)*capr, Math.sin(capa)*capr); else ctx.lineTo(Math.cos(capa)*capr,
            Math.sin(capa)*capr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle='#fff5c7'; ctx.stroke(); ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(0,
        0, 2, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('bottlecapSlinger', projectileArt_bottlecapSlinger_9);
}
());

// ============================================================================
// 09 — WARDEN BROOMSPEAR
// A humble sweeping spear. The bristled guard catches shots while the iron tip reaches past a crowd.
// Former module: weapons/unique/broom-spear.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        broomSpear: {
            name: 'WARDEN BROOMSPEAR', icon: '⌿', category: 'MELEE', rarity: 'common', damage: 9, rate: 430,
            reach: 116, arc: .82, color: '#c7b38a', price: 25, handler: 'lance', deflect: true, desc: 'A humble sweeping spear. The bristled guard catches shots while the iron tip reaches past a crowd.'
        }
    }, {
        broomSpear: DKAttackProfile('thrust', 15, 0, .085, 24, 1, 2, 'bristles', 5, 61, .13)
    }, "weapons/unique/broomSpear");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('broomSpear', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=.4; c.radius=190; c.knockback=7; c.player.x+=Math.cos(c.player.angle)*8; c.player.y+=Math.sin(c.player.angle)*8;
        }
    }, 'weapons/unique/broom-spear');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_broomSpear(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#765838'; ctx.fillRect(4,
        -3, 43, 6); ctx.strokeStyle='#d7c49e'; ctx.lineWidth=2; for(var bs=-2; bs<=2; bs++){
            ctx.beginPath(); ctx.moveTo(11, bs*2); ctx.lineTo(2, bs*4); ctx.stroke();
        }
        ctx.fillStyle='#9ba4a9'; ctx.beginPath(); ctx.moveTo(46, -6); ctx.lineTo(61, 0); ctx.lineTo(46, 6); ctx.lineTo(50,
        0); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    DKRegister.weaponRenderer('broomSpear', render_broomSpear, 'weapons/unique/broom-spear');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_broomSpear_4(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(sl.angle)*18,
        sl.y+Math.sin(sl.angle)*18); ctx.lineTo(sl.x+Math.cos(sl.angle)*sl.radius, sl.y+Math.sin(sl.angle)*sl.radius); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.stroke(); for(var br=-2; br<=2; br++){
            var bra=sl.angle+br*.09; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(bra)*sl.radius*.68, sl.y+Math.sin(bra)*sl.radius*.68); ctx.lineTo(sl.x+Math.cos(bra)*sl.radius,
            sl.y+Math.sin(bra)*sl.radius); ctx.stroke();
        }
    }
    DKRegister.slashRenderer('broomSpear', slashArt_broomSpear_4);
}
());

// ============================================================================
// 10 — BUBBLEWRIGHT STAFF
// Blows a slow ward-bubble that eats hostile shots, tugs foes inward, bounces once, then chills on bursting.
// Former module: weapons/unique/bubblewright-staff.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        bubblewrightStaff: {
            name: 'BUBBLEWRIGHT STAFF', icon: '○', category: 'MAGIC', rarity: 'uncommon', damage: 5.5, rate: 610,
            speed: 6, mana: 6, blast: 54, color: '#67d9ed', price: 51, handler: 'bubbleStaff', desc: 'Blows a slow ward-bubble that eats hostile shots, tugs foes inward, bounces once, then chills on bursting.'
        }
    }, {
        bubblewrightStaff: DKAttackProfile('blow', 22, 2, .2, 1, 15, 3, 'bubbles', 8, 67, .46)
    }, "weapons/unique/bubblewrightStaff");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('bubblewrightStaff', {
        configureProjectile: function(c){
            c.opts.type='bubble'; c.opts.radius=11; c.opts.life=120; c.opts.bounce=1; c.opts.vortex=82; c.opts.blast=c.weapon.blast||54; c.opts.status='freeze'; c.opts.clearsBullets=true; c.opts.knockback=-2;
        }
    }, 'weapons/unique/bubblewright-staff');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_bubblewrightStaff(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#3d5357'; ctx.fillRect(4,
        -3, 31, 6); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(40, 0, 10, 0, TAU); ctx.stroke(); ctx.fillStyle='rgba(180,247,255,.25)'; ctx.fill(); for(var bws=0; bws<4; bws++){
            var bwsa=visualTick*.035+bws*TAU/4, bwsr=14+bws%2*6; ctx.beginPath(); ctx.arc(40+Math.cos(bwsa)*bwsr,
            Math.sin(bwsa)*bwsr, 4+bws%2*2, 0, TAU); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(37, -3, 2, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('bubblewrightStaff', render_bubblewrightStaff, 'weapons/unique/bubblewright-staff');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_bubblewrightStaff_13(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='rgba(103,217,237,.2)'; ctx.beginPath(); ctx.arc(0,
        0, b.radius+3, 0, TAU); ctx.fill(); ctx.strokeStyle='#dffaff'; ctx.lineWidth=2; ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-4,
        -4, 2.5, 0, TAU); ctx.fill(); for(var bub=0; bub<3; bub++){
            ctx.strokeStyle=b.color; ctx.beginPath(); ctx.arc(-10-bub*5, (bub%2?4: -4), 2+bub, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.projectileRenderer('bubblewrightStaff', projectileArt_bubblewrightStaff_13);
}
());

// ============================================================================
// 11 — BURST CARBINE
// A disciplined three-round burst. The final round has bonus critical chance.
// Former module: weapons/unique/burst-carbine.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        burstCarbine: {
            name: 'BURST CARBINE', icon: '⁝', category: 'GUN', rarity: 'uncommon', damage: 3, rate: 480,
            speed: 15, burst: 3, burstGap: 66, spread: .08, color: '#2ecc71', price: 42, handler: 'bullet',
            desc: 'A disciplined three-round burst. The final round has bonus critical chance.'
        }
    }, {
        burstCarbine: DKAttackProfile('rattle', 10, 8, .055, 1, 0, 0, 'casings', 3, 35, .4)
    }, "weapons/unique/burstCarbine");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('burstCarbine', {
        configureProjectile: function(c){
            c.opts.bounce=c.weapon.bounce||0; c.opts.pierce=0;
        }
    }, 'weapons/unique/burst-carbine');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_burstCarbine(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#33413b'; ctx.beginPath(); ctx.moveTo(4,
        -6); ctx.lineTo(29, -6); ctx.lineTo(35, -2); ctx.lineTo(30, 5); ctx.lineTo(13, 5); ctx.lineTo(9,
        11); ctx.lineTo(4, 9); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle=w.color; ctx.fillRect(17,
        -4, 24, 4); for(var bc=0; bc<3; bc++)ctx.fillRect(23+bc*5, 2, 3, 3);
    }
    DKRegister.weaponRenderer('burstCarbine', render_burstCarbine, 'weapons/unique/burst-carbine');
}
());

// ============================================================================
// 12 — CANDLE SNUFFER
// A sideways hooded sweep. Each enemy flame or projectile snuffed restores a sliver of mana.
// Former module: weapons/unique/candle-snuffer.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        candleSnuffer: {
            name: 'CANDLE SNUFFER', icon: '⌒', category: 'MELEE', rarity: 'common', damage: 7, rate: 470,
            reach: 110, arc: 2.4, color: '#a9a3a0', price: 25, handler: 'snuffer', deflect: true, desc: 'A sideways hooded sweep. Each enemy flame or projectile snuffed restores a sliver of mana.'
        }
    }, {
        candleSnuffer: DKAttackProfile('sideSweep', 17, 0, 2.35, 6, 0, 3, 'snuffedFlames', 5, 83, .87)
    }, "weapons/unique/candleSnuffer");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('candleSnuffer', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=2.4; c.radius=110; c.knockback=4.5; c.attackAngle+=c.weapon.shots%2?-.34: .34; c.manaOnDeflect=.7;
        }
    }, 'weapons/unique/candle-snuffer');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_candleSnuffer(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#5c4430'; ctx.fillRect(4,
        -3, 35, 6); ctx.strokeStyle='#ddd7d1'; ctx.lineWidth=2; ctx.strokeRect(4, -3, 35, 6); ctx.fillStyle='#53504e'; ctx.beginPath(); ctx.moveTo(37,
        -5); ctx.quadraticCurveTo(48, -17, 60, -10); ctx.lineTo(64, -5); ctx.lineTo(64, 5); ctx.lineTo(60,
        10); ctx.quadraticCurveTo(48, 17, 37, 5); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=2; ctx.stroke(); ctx.fillStyle='#181716'; ctx.beginPath(); ctx.ellipse(61,
        0, 5, 8, 0, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('candleSnuffer', render_candleSnuffer, 'weapons/unique/candle-snuffer');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_candleSnuffer_11(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=10; ctx.beginPath(); ctx.arc(sl.x, sl.y,
        sl.radius, sl.angle-sl.arc/2, sl.angle+sl.arc/2); ctx.stroke(); ctx.strokeStyle='#1b1918'; ctx.lineWidth=4; ctx.stroke(); ctx.fillStyle='#a9a3a0'; for(var csf=0; csf<5; csf++){
            var csfa=sl.angle-sl.arc/2+sl.arc*csf/4; ctx.beginPath(); ctx.arc(sl.x+Math.cos(csfa)*sl.radius,
            sl.y+Math.sin(csfa)*sl.radius, 3, 0, TAU); ctx.fill();
        }
    }
    DKRegister.slashRenderer('candleSnuffer', slashArt_candleSnuffer_11);
}
());

// ============================================================================
// 13 — CANDLEFORK
// Two mana lights three crooked candle flames in a short burning fork.
// Former module: weapons/unique/candlefork.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        candlefork: {
            name: 'CANDLEFORK', icon: '♨', category: 'MAGIC', rarity: 'common', damage: 2.2, rate: 520, speed: 9,
            count: 3, spread: .55, mana: 2, color: '#ffb45c', price: 28, handler: 'candlefork', desc: 'Two mana lights three crooked candle flames in a short burning fork.'
        }
    }, {
        candlefork: DKAttackProfile('fan', 18, 2, .3, 4, 5, 1, 'flames', 3, 45, .5)
    }, "weapons/unique/candlefork");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('candlefork', {
        configureProjectile: function(c){
            c.opts.status='burn'; c.opts.blast=22; c.opts.life=70;
        }
    }, 'weapons/unique/candlefork');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_candlefork(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#57402d'; ctx.fillRect(5,
        -3, 27, 6); ctx.strokeStyle='#b08353'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(27, 0); ctx.lineTo(35,
        -10); ctx.moveTo(28, 0); ctx.lineTo(39, 0); ctx.moveTo(27, 0); ctx.lineTo(35, 10); ctx.stroke(); for(var cfk=-1; cfk<=1; cfk++){
            ctx.fillStyle='#ffb45c'; ctx.beginPath(); ctx.moveTo(38, cfk*10); ctx.quadraticCurveTo(34, cfk*10-9,
            41, cfk*10-7); ctx.quadraticCurveTo(46, cfk*10, 38, cfk*10); ctx.fill(); ctx.fillStyle='#fff4c2'; ctx.beginPath(); ctx.arc(39,
            cfk*10-2, 2+pulse, 0, TAU); ctx.fill();
        }
    }
    DKRegister.weaponRenderer('candlefork', render_candlefork, 'weapons/unique/candlefork');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_candlefork_40(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(-Math.atan2(b.vy, b.vx)); ctx.fillStyle='#ff8f3d'; ctx.beginPath(); ctx.moveTo(0,
        -9); ctx.quadraticCurveTo(8, -1, 1, 8); ctx.quadraticCurveTo(-8, 2, 0, -9); ctx.fill(); ctx.fillStyle='#fff4b2'; ctx.beginPath(); ctx.ellipse(0,
        2, 3, 5, 0, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('candlefork', projectileArt_candlefork_40);
}
());

// ============================================================================
// 14 — CATHEDRAL ORGAN
// Twenty mana plays three powerful widening stained-glass waves through the aim cone.
// Former module: weapons/unique/cathedral-organ.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        cathedralOrgan: {
            name: 'CATHEDRAL ORGAN', icon: '♬', category: 'MAGIC', rarity: 'epic', damage: 25, rate: 820,
            mana: 20, color: '#c56cf0', price: 118, handler: 'organ', desc: 'Twenty mana plays three powerful widening stained-glass waves through the aim cone.'
        }
    }, {
        cathedralOrgan: DKAttackProfile('toll', 24, 5, .31, 0, 14, 3, 'windows', 6, 82, .1)
    }, "weapons/unique/cathedralOrgan");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('cathedralOrgan', {
        attack: function(c){
            var damage=c.weapon.damage*c.api.weaponLevelScale(c.weapon)*c.player.damageMultiplier(), radii=[110,
            170, 235], parts=[.42, .34, .24]; for(var i=0; i<3; i++)c.api.pushSlash({
                x: c.player.x, y: c.player.y, angle: c.angle, radius: radii[i], arc: 1.72, damage: damage*parts[i],
                color: i===1?'#ffe6ff': c.weapon.color, deflect: false, knockback: 2+i, sourceId: c.weapon.id,
                life: 16+i*4, maxLife: 16+i*4
            }); c.api.pushEffect({
                type: 'organWave', x: c.player.x, y: c.player.y, angle: c.angle, color: c.weapon.color, life: 1
            }); c.api.addWeaponFlash(c.weapon, c.player.x+Math.cos(c.angle)*30, c.player.y+Math.sin(c.angle)*30,
            c.angle); return true;
        }
    }, 'weapons/unique/cathedral-organ');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_cathedralOrgan(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#382443'; ctx.fillRect(4,
        -8, 18, 16); ctx.strokeStyle='#c56cf0'; ctx.lineWidth=3; for(var op=0; op<4; op++){
            ctx.beginPath(); ctx.moveTo(18+op*6, 7); ctx.lineTo(18+op*6, -8-op*3); ctx.stroke(); ctx.fillStyle=op%2?'#ffe6ff': '#c56cf0'; ctx.beginPath(); ctx.arc(18+op*6,
            -8-op*3, 2.5, 0, TAU); ctx.fill();
        }
        ctx.fillStyle='#f3d7ff'; for(var ok=0; ok<4; ok++){
            ctx.fillRect(8+ok*3, -4, 2, 8);
        }
    }
    DKRegister.weaponRenderer('cathedralOrgan', render_cathedralOrgan, 'weapons/unique/cathedral-organ');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_cathedralOrgan_9(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(sl.x, sl.y,
        sl.radius, sl.angle-sl.arc/2, sl.angle+sl.arc/2); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; for(var co=0; co<5; co++){
            var coa=sl.angle-sl.arc/2+sl.arc*co/4; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(coa)*(sl.radius-11),
            sl.y+Math.sin(coa)*(sl.radius-11)); ctx.lineTo(sl.x+Math.cos(coa)*(sl.radius+5), sl.y+Math.sin(coa)*(sl.radius+5)); ctx.stroke();
        }
    }
    DKRegister.slashRenderer('cathedralOrgan', slashArt_cathedralOrgan_9);
}
());

// ============================================================================
// 15 — CHAIN FLAIL
// A huge 270-degree sweep with heavy knockback and projectile reflection.
// Former module: weapons/unique/chain-flail.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        chainFlail: {
            name: 'CHAIN FLAIL', icon: '●', category: 'MELEE', rarity: 'uncommon', damage: 12, rate: 610,
            reach: 128, arc: 4.7, color: '#95a5a6', price: 44, handler: 'flail', deflect: true, desc: 'A huge 270-degree sweep with heavy knockback and projectile reflection.'
        }
    }, {
        chainFlail: DKAttackProfile('orbit', 23, 0, 2.8, 3, 0, 4, 'chain', 8, 86, .3)
    }, "weapons/unique/chainFlail");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('chainFlail', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=4.7; c.radius=128; c.knockback=6;
        }
    }, 'weapons/unique/chain-flail');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_chainFlail(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#6b4930'; ctx.fillRect(5,
        -3, 20, 6); ctx.strokeStyle='#bdc3c7'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(24, 0); for(var cf=0; cf<4; cf++)ctx.lineTo(29+cf*6,
        Math.sin(visualTick*.08+cf)*3); ctx.stroke(); ctx.fillStyle=w.color; ctx.beginPath(); ctx.arc(53,
        Math.sin(visualTick*.08+3)*3, 8, 0, TAU); ctx.fill(); ctx.stroke(); for(var cs=0; cs<8; cs++){
            var csa=cs*TAU/8; ctx.beginPath(); ctx.moveTo(53+Math.cos(csa)*7, Math.sin(visualTick*.08+3)*3+Math.sin(csa)*7); ctx.lineTo(53+Math.cos(csa)*11,
            Math.sin(visualTick*.08+3)*3+Math.sin(csa)*11); ctx.stroke();
        }
    }
    DKRegister.weaponRenderer('chainFlail', render_chainFlail, 'weapons/unique/chain-flail');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_chainFlail_0(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=3; for(var f=0; f<11; f++){
            var fa=sl.angle-sl.arc/2+sl.arc*f/10; var fr=sl.radius*(.72+.22*f/10); ctx.beginPath(); ctx.arc(sl.x+Math.cos(fa)*fr,
            sl.y+Math.sin(fa)*fr, f===10?8: 3, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.slashRenderer('chainFlail', slashArt_chainFlail_0);
}
());

// ============================================================================
// 16 — CHALK BLASTER
// Compressed chalk slugs ricochet once and burst into a blinding white dust mark.
// Former module: weapons/unique/chalk-blaster.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        chalkBlaster: {
            name: 'CHALK BLASTER', icon: '▰', category: 'GUN', rarity: 'common', damage: 4, rate: 390, speed: 12,
            bounce: 1, color: '#e8e2d5', price: 25, handler: 'chalk', desc: 'Compressed chalk slugs ricochet once and burst into a blinding white dust mark.'
        }
    }, {
        chalkBlaster: DKAttackProfile('snap', 11, 9, .07, 1, 0, 0, 'dust', 7, 36, .2)
    }, "weapons/unique/chalkBlaster");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('chalkBlaster', {
        configureProjectile: function(c){
            c.opts.bounce=1; c.opts.radius=5; c.opts.life=105; c.opts.type='chalk';
        }
    }, 'weapons/unique/chalk-blaster');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_chalkBlaster(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#595753'; ctx.beginPath(); ctx.moveTo(4,
        -6); ctx.lineTo(31, -7); ctx.lineTo(40, -3); ctx.lineTo(40, 3); ctx.lineTo(31, 7); ctx.lineTo(4,
        6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#e8e2d5'; ctx.fillRect(14, -4, 20,
        8); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(35, 0, 3, 0, TAU); ctx.fill(); ctx.strokeStyle='#bbb5a9'; for(var ch=0; ch<3; ch++){
            ctx.beginPath(); ctx.moveTo(17+ch*6, -4); ctx.lineTo(21+ch*6, 4); ctx.stroke();
        }
    }
    DKRegister.weaponRenderer('chalkBlaster', render_chalkBlaster, 'weapons/unique/chalk-blaster');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_chalkBlaster_39(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.18); ctx.fillStyle='#efeade'; ctx.fillRect(-6,
        -5, 12, 10); ctx.strokeStyle='#9e9a91'; ctx.strokeRect(-6, -5, 12, 10); ctx.fillStyle='rgba(255,255,255,.45)'; for(var ch=0; ch<3; ch++){
            ctx.beginPath(); ctx.arc(-9-ch*4, (ch%2?3: -3), 2-ch*.35, 0, TAU); ctx.fill();
        }
    }
    DKRegister.projectileRenderer('chalkBlaster', projectileArt_chalkBlaster_39);
}
());

// ============================================================================
// 17 — CHRONO CANNON
// Twenty mana bursts into a large time field that slows enemies and hostile shots.
// Former module: weapons/unique/chrono-cannon.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        chronoCannon: {
            name: 'CHRONO CANNON', icon: '◷', category: 'MAGIC', rarity: 'epic', damage: 22, rate: 760, speed: 8,
            mana: 20, blast: 150, color: '#5f27cd', price: 116, handler: 'chrono', desc: 'Twenty mana bursts into a large time field that slows enemies and hostile shots.'
        }
    }, {
        chronoCannon: DKAttackProfile('roll', 25, 21, .18, 2, 8, 2, 'clock', 8, 71, .8)
    }, "weapons/unique/chronoCannon");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('chronoCannon', {
        configureProjectile: function(c){
            c.opts.chrono=true; c.opts.blast=c.weapon.blast; c.opts.radius=8; c.opts.life=82;
        }
    }, 'weapons/unique/chrono-cannon');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_chronoCannon(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#261a36'; ctx.beginPath(); ctx.moveTo(4,
        -9); ctx.lineTo(29, -11); ctx.lineTo(42, -7); ctx.lineTo(42, 7); ctx.lineTo(29, 11); ctx.lineTo(4,
        8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle=w.color; ctx.beginPath(); ctx.arc(27,
        0, 9, 0, TAU); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(27,
        0); ctx.lineTo(27, -6); ctx.moveTo(27, 0); ctx.lineTo(32, 2); ctx.stroke(); for(var cc=0; cc<6; cc++){
            var cca=cc*TAU/6; ctx.beginPath(); ctx.moveTo(27+Math.cos(cca)*9, Math.sin(cca)*9); ctx.lineTo(27+Math.cos(cca)*12,
            Math.sin(cca)*12); ctx.stroke();
        }
    }
    DKRegister.weaponRenderer('chronoCannon', render_chronoCannon, 'weapons/unique/chrono-cannon');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_chronoCannon_36(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#261044'; ctx.beginPath(); ctx.arc(0,
        0, b.radius+1, 0, TAU); ctx.fill(); ctx.strokeStyle=b.color; ctx.beginPath(); ctx.arc(0, 0, b.radius+4,
        0, TAU); ctx.stroke(); ctx.rotate(b.age*.09); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(b.radius+4,
        0); ctx.moveTo(0, 0); ctx.lineTo(0, -b.radius+1); ctx.stroke();
    }
    DKRegister.projectileRenderer('chronoCannon', projectileArt_chronoCannon_36);
}
());

// ============================================================================
// 18 — COIL CARBINE
// A magnetic slug accelerates across the room, gaining damage with travel distance and piercing two bodies.
// Former module: weapons/unique/coil-carbine.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        coilCarbine: {
            name: 'COIL CARBINE', icon: '⌁', category: 'GUN', rarity: 'uncommon', damage: 6.2, rate: 410,
            speed: 20, pierce: 2, color: '#62d8ff', price: 51, handler: 'coil', desc: 'A magnetic slug accelerates across the room, gaining damage with travel distance and piercing two bodies.'
        }
    }, {
        coilCarbine: DKAttackProfile('snap', 12, 13, .035, 3, 0, 0, 'coils', 6, 50, .6)
    }, "weapons/unique/coilCarbine");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('coilCarbine', {
        configureProjectile: function(c){
            c.opts.pierce=c.weapon.pierce||2; c.opts.distanceScale=true; c.opts.radius=5; c.opts.life=125; c.opts.type='coilSlug';
        }
    }, 'weapons/unique/coil-carbine');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_coilCarbine(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#172f3a'; ctx.beginPath(); ctx.moveTo(4,
        -7); ctx.lineTo(41, -9); ctx.lineTo(55, -4); ctx.lineTo(55, 4); ctx.lineTo(41, 9); ctx.lineTo(4,
        7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle=w.color; ctx.lineWidth=2; for(var cl=0; cl<5; cl++){
            ctx.beginPath(); ctx.ellipse(18+cl*7, 0, 4, 9, 0, 0, TAU); ctx.stroke();
        }
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(48, 0, 3+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('coilCarbine', render_coilCarbine, 'weapons/unique/coil-carbine');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_coilCarbine_5(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#172f3a'; ctx.fillRect(-9,
        -4, 16, 8); ctx.strokeStyle='#b9f5ff'; ctx.strokeRect(-9, -4, 16, 8); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(12,
        0); ctx.lineTo(5, -4); ctx.lineTo(5, 4); ctx.closePath(); ctx.fill(); for(var co=-1; co<=1; co+=2){
            ctx.strokeStyle=b.color; ctx.beginPath(); ctx.arc(-2, 0, 9+co*2, co<0?1.7: -1.4, co<0?4.5: 1.4); ctx.stroke();
        }
    }
    DKRegister.projectileRenderer('coilCarbine', projectileArt_coilCarbine_5);
}
());

// ============================================================================
// 19 — COMET LONGBOW
// Full draws become explosive comets and leave a burning impact field.
// Former module: weapons/unique/comet-longbow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        cometLongbow: {
            name: 'COMET LONGBOW', icon: '☄', category: 'ARCHER', rarity: 'epic', damage: 18, rate: 720,
            speed: 19, charge: 900, blast: 75, color: '#ff9f43', price: 110, handler: 'cometBow', desc: 'Full draws become explosive comets and leave a burning impact field.'
        }
    }, {
        cometLongbow: DKAttackProfile('draw', 24, 16, .09, 0, 3, 2, 'comet', 8, 67, .5)
    }, "weapons/unique/cometLongbow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('cometLongbow', {
        configureProjectile: function(c){
            c.opts.trailMax=11; c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; if(c.power>1.35){
                c.opts.blast=c.weapon.blast; c.opts.status='burn'; c.opts.comet=true;
            }
        }
    }, 'weapons/unique/comet-longbow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_cometLongbow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; bow('#ff9f43',
        '#fff0c2'); ctx.strokeStyle='#feca57'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(20, 0, 23, -1.08,
        1.08); ctx.stroke(); ctx.fillStyle='#fff'; ctx.save(); ctx.translate(39, 0); ctx.rotate(visualTick*.05); for(var cb=0; cb<8; cb++){
            ctx.rotate(TAU/8); ctx.fillRect(3, -1, 5, 2);
        }
        ctx.restore();
    }
    DKRegister.weaponRenderer('cometLongbow', render_cometLongbow, 'weapons/unique/comet-longbow');
}
());

// ============================================================================
// 20 — CONSTELLATION BOW
// Arrows plant stars in prey. Three stars join into a tiny constellation and collapse.
// Former module: weapons/unique/constellation-bow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        constellationBow: {
            name: 'CONSTELLATION BOW', icon: '⁂', category: 'ARCHER', rarity: 'rare', damage: 9, rate: 520,
            speed: 15, charge: 640, color: '#6c8cff', price: 78, handler: 'starBow', desc: 'Arrows plant stars in prey. Three stars join into a tiny constellation and collapse.'
        }
    }, {
        constellationBow: DKAttackProfile('draw', 19, 11, .07, 0, 1, 1, 'stars', 7, 52, .2)
    }, "weapons/unique/constellationBow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('constellationBow', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; c.opts.starMark=true;
        }
    }, 'weapons/unique/constellation-bow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_constellationBow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; bow('#304a86',
        '#dbe4ff'); ctx.strokeStyle=w.color; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(20, 0, 23, -1.08,
        1.08); ctx.stroke(); ctx.fillStyle='#fff'; for(var cbw=0; cbw<4; cbw++){
            var cbwa=-1+cbw*.66; ctx.beginPath(); ctx.arc(20+Math.cos(cbwa)*21, Math.sin(cbwa)*21, 2, 0,
            TAU); ctx.fill(); if(cbw){
                var pba=-1+(cbw-1)*.66; ctx.strokeStyle='#91a7ff'; ctx.beginPath(); ctx.moveTo(20+Math.cos(pba)*21,
                Math.sin(pba)*21); ctx.lineTo(20+Math.cos(cbwa)*21, Math.sin(cbwa)*21); ctx.stroke();
            }
        }
    }
    DKRegister.weaponRenderer('constellationBow', render_constellationBow, 'weapons/unique/constellation-bow');
    // Extra projectile overlay for this weapon.
    function projectileOverlay_constellationBow(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(1,
        0, 3, 0, TAU); ctx.fill(); ctx.strokeStyle='#6c8cff'; ctx.beginPath(); ctx.arc(1, 0, 6+Math.sin(b.age*.2),
        0, TAU); ctx.stroke();
    }
    DKRegister.projectileOverlay('constellationBow', projectileOverlay_constellationBow);
    // Impact accent for this projectile.
    function impactArt_constellationBow(r){
        var b=r.projectile; r.api.addRing(r.x, r.y, '#6c8cff', 30, 2);
    }
    DKRegister.projectileImpactRenderer('constellationBow', impactArt_constellationBow);
}
());

// ============================================================================
// 21 — COPPER BELLOWS
// A stubby forge-tool that exhales a broad short cone with enormous close-range shove.
// Former module: weapons/unique/copper-bellows.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        copperBellows: {
            name: 'COPPER BELLOWS', icon: '≈', category: 'GUN', rarity: 'common', damage: 2.1, rate: 470,
            speed: 8, count: 7, spread: .95, color: '#c98b50', price: 22, handler: 'bellows', desc: 'A stubby forge-tool that exhales a broad short cone with enormous close-range shove.'
        }
    }, {
        copperBellows: DKAttackProfile('pump', 17, 12, .13, 2, 1, 0, 'waves', 5, 46, .8)
    }, "weapons/unique/copperBellows");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('copperBellows', {
        beforeProjectileHit: function(c){
            if(Math.hypot(c.bullet.x-c.bullet.startX, c.bullet.y-c.bullet.startY)<95)c.damage*=1.4;
        }, configureProjectile: function(c){
            c.opts.life=34; c.opts.knockback=7; c.opts.radius=6; c.opts.type='dust';
        }
    }, 'weapons/unique/copper-bellows');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_copperBellows(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#6b3f27'; ctx.beginPath(); ctx.moveTo(3,
        -8); ctx.lineTo(18, -11); ctx.lineTo(26, -7); ctx.lineTo(26, 7); ctx.lineTo(18, 11); ctx.lineTo(3,
        8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle='#c98b50'; ctx.lineWidth=3; for(var bl=0; bl<3; bl++){
            ctx.beginPath(); ctx.moveTo(8+bl*5, -8); ctx.lineTo(8+bl*5, 8); ctx.stroke();
        }
        ctx.fillStyle='#8d6e63'; ctx.fillRect(25, -5, 11, 10); ctx.fillStyle='#d8a36c'; ctx.beginPath(); ctx.moveTo(35,
        -6); ctx.lineTo(46, -10); ctx.lineTo(46, 10); ctx.lineTo(35, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#ffcc80'; ctx.beginPath(); ctx.arc(45,
        0, 2+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('copperBellows', render_copperBellows, 'weapons/unique/copper-bellows');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_copperBellows_23(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.globalAlpha=.7; ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(0,
        0, b.radius+2, 0, TAU); ctx.fill(); ctx.fillStyle='#ffe0b2'; ctx.beginPath(); ctx.arc(3, -2, 2, 0,
        TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('copperBellows', projectileArt_copperBellows_23);
}
());

// ============================================================================
// 22 — CORKSCREW MUSKET
// Fires a turning scrap-bit that drills through two bodies and gains force across the room.
// Former module: weapons/unique/corkscrew-musket.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        corkscrewMusket: {
            name: 'CORKSCREW MUSKET', icon: '⌇', category: 'GUN', rarity: 'common', damage: 5.6, rate: 520,
            speed: 12, pierce: 2, color: '#ad8d68', price: 28, handler: 'drillShot', desc: 'Fires a turning scrap-bit that drills through two bodies and gains force across the room.'
        }
    }, {
        corkscrewMusket: DKAttackProfile('twist', 16, 15, .22, 4, 0, 2, 'spirals', 6, 49, .72)
    }, "weapons/unique/corkscrewMusket");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('corkscrewMusket', {
        configureProjectile: function(c){
            c.opts.life=130; c.opts.radius=6; c.opts.type='drill'; c.opts.pierce=c.weapon.pierce||2; c.opts.distanceScale=true; c.opts.drill=true;
        }
    }, 'weapons/unique/corkscrew-musket');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_corkscrewMusket(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#5e4937'; ctx.beginPath(); ctx.moveTo(4,
        -6); ctx.lineTo(30, -7); ctx.lineTo(39, -4); ctx.lineTo(39, 4); ctx.lineTo(28, 7); ctx.lineTo(4,
        6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#7a5c42'; ctx.fillRect(9, 6, 9, 12); ctx.strokeStyle=w.color; ctx.lineWidth=2.5; for(var csm=0; csm<5; csm++){
            ctx.beginPath(); ctx.ellipse(32+csm*6, 0, 4, 8, 0, 0, TAU); ctx.stroke();
        }
        ctx.fillStyle='#ded7ce'; ctx.beginPath(); ctx.moveTo(66, 0); ctx.lineTo(53, -5); ctx.lineTo(57, 0); ctx.lineTo(53,
        5); ctx.closePath(); ctx.fill();
    }
    DKRegister.weaponRenderer('corkscrewMusket', render_corkscrewMusket, 'weapons/unique/corkscrew-musket');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_corkscrewMusket_11(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#e3ddd2'; ctx.beginPath(); ctx.moveTo(13,
        0); ctx.lineTo(-8, -4); ctx.lineTo(-3, 0); ctx.lineTo(-8, 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.lineWidth=2; for(var drill=0; drill<3; drill++){
            ctx.beginPath(); ctx.ellipse(-3+drill*5, 0, 3, 7, 0, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.projectileRenderer('corkscrewMusket', projectileArt_corkscrewMusket_11);
}
());

// ============================================================================
// 23 — CROSSWIND BALLISTA
// A perfect draw pins a wind beacon into its first target. Four bolts arrive from the sides and cross through that same point.
// Former module: weapons/unique/crosswind-ballista.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        crosswindBallista: {
            name: 'CROSSWIND BALLISTA', icon: '⋈', category: 'ARCHER', rarity: 'epic', damage: 19, rate: 760,
            speed: 18, charge: 820, color: '#83e6ff', price: 127, handler: 'crosswind', desc: 'A perfect draw pins a wind beacon into its first target. Four bolts arrive from the sides and cross through that same point.'
        }
    }, {
        crosswindBallista: DKAttackProfile('draw', 25, 17, .055, 0, 2, 2, 'crosswind', 8, 82, .8)
    }, "weapons/unique/crosswindBallista");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('crosswindBallista', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; c.opts.crosswind=c.burstIndex===1; c.opts.type='windBolt'; c.opts.pierce=Math.max(c.opts.pierce||0,
            1); c.opts.life=120;
        }
    }, 'weapons/unique/crosswind-ballista');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_crosswindBallista(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#27444d'; ctx.fillRect(4,
        -4, 43, 8); ctx.strokeStyle='#83e6ff'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(29, -22); ctx.quadraticCurveTo(55,
        0, 29, 22); ctx.stroke(); ctx.strokeStyle='#e9fbff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(31,
        -20); ctx.lineTo(45, 0); ctx.lineTo(31, 20); ctx.stroke(); ctx.fillStyle='#5d8d99'; ctx.beginPath(); ctx.moveTo(13,
        -8); ctx.lineTo(36, -5); ctx.lineTo(46, 0); ctx.lineTo(36, 5); ctx.lineTo(13, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#dffcff'; ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(58,
        0); ctx.lineTo(43, -4); ctx.lineTo(47, 0); ctx.lineTo(43, 4); ctx.closePath(); ctx.fill(); for(var cw=-1; cw<=1; cw+=2){
            ctx.strokeStyle=w.color; ctx.beginPath(); ctx.arc(39, cw*13, 6+pulse*2, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.weaponRenderer('crosswindBallista', render_crosswindBallista, 'weapons/unique/crosswind-ballista');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_crosswindBallista_49(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle=b.sourceId==='crosswindFlank'?'#e9fbff': b.color; ctx.beginPath(); ctx.moveTo(15,
        0); ctx.lineTo(-7, -4); ctx.lineTo(-2, 0); ctx.lineTo(-7, 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(-13,
        -7); ctx.quadraticCurveTo(-5, 0, -13, 7); ctx.stroke();
    }
    DKRegister.projectileRenderer('crosswindBallista', projectileArt_crosswindBallista_49); DKRegister.projectileRenderer('crosswindFlank',
    projectileArt_crosswindBallista_49);
}
());

// ============================================================================
// 24 — CROWNCRUSHER: SOVEREIGN
// A room-sized royal spin reflects every nearby shot and follows with two expanding execution rings.
// Former module: weapons/unique/crowncrusher.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        crowncrusher: {
            name: 'CROWNCRUSHER: SOVEREIGN', icon: '✹', category: 'MELEE', rarity: 'mythical', damage: 42,
            rate: 650, reach: 230, arc: 6.28, color: '#ff3b30', price: 164, handler: 'crown', deflect: true,
            desc: 'A room-sized royal spin reflects every nearby shot and follows with two expanding execution rings.'
        }
    }, {
        crowncrusher: DKAttackProfile('orbit', 29, 0, 6.1, 4, 1, 6, 'crown', 12, 142, .2)
    }, "weapons/unique/crowncrusher");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('crowncrusher', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=c.api.TAU; c.radius=230; c.knockback=10; c.stun=55; var bullets=c.api.bullets(), enemies=c.api.enemies(); for(var i=0; i<bullets.length; i++){
                var b=bullets[i]; if(!b.dead&&!b.friendly&&Math.hypot(b.x-c.player.x, b.y-c.player.y)<c.radius+55){
                    b.friendly=true; b.damage=Math.max(4, b.damage*2.5); b.vx*=-1.45; b.vy*=-1.45; b.color=c.weapon.color;
                }
            }
            for(var e=0; e<enemies.length; e++)if(Math.hypot(enemies[e].x-c.player.x, enemies[e].y-c.player.y)<c.radius)enemies[e].stun=Math.max(enemies[e].stun,
            55); c.api.pushPending({
                frames: 9, kind: 'royalRing', x: c.player.x, y: c.player.y, radius: 330, damage: c.damage*.58,
                color: c.weapon.color, sourceId: c.weapon.id
            }); c.api.pushPending({
                frames: 18, kind: 'royalRing', x: c.player.x, y: c.player.y, radius: 440, damage: c.damage*.4,
                color: '#fff1b8', sourceId: c.weapon.id
            });
        }
    }, 'weapons/unique/crowncrusher');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_crowncrusher(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4c351d'; ctx.fillRect(3,
        -4, 36, 8); ctx.fillStyle='#fff3b0'; for(var ch=0; ch<4; ch++)ctx.fillRect(10+ch*8, -6, 3, 12); ctx.save(); ctx.translate(45,
        0); ctx.rotate(Math.sin(visualTick*.045)*.06); ctx.fillStyle='#6b4710'; ctx.beginPath(); ctx.arc(0,
        0, 17, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=5; ctx.stroke(); ctx.fillStyle='#171006'; ctx.beginPath(); ctx.arc(0,
        0, 9, 0, TAU); ctx.fill(); ctx.strokeStyle='#fff3b0'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,
        0, 12, 0, TAU); ctx.stroke(); for(var ccg=0; ccg<7; ccg++){
            ctx.rotate(TAU/7); ctx.fillStyle=ccg%2?'#ff7a18': '#fff3b0'; ctx.beginPath(); ctx.moveTo(10,
            -5); ctx.lineTo(19, -13); ctx.lineTo(18, 0); ctx.lineTo(10, 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(23+pulse*2,
            0, 2.5, 0, TAU); ctx.fill();
        }
        ctx.restore();
    }
    DKRegister.weaponRenderer('crowncrusher', render_crowncrusher, 'weapons/unique/crowncrusher');
    // Mythical/legendary attack aura belongs to this weapon module.
    function aura_crowncrusher(r){
        var ctx=r.ctx, p=r.player, w=r.weapon, q=r.progress, i=r.impact, v=r.visualTick, TAU=r.TAU; ctx.rotate(q*TAU*p.attackSide); ctx.lineWidth=5; ctx.beginPath(); ctx.arc(0,
        0, 56+i*48, 0, TAU); ctx.stroke(); for(var z=0; z<12; z++){
            ctx.rotate(TAU/12); ctx.beginPath(); ctx.moveTo(58+i*45, 0); ctx.lineTo(78+i*62, -7); ctx.lineTo(75+i*62,
            7); ctx.closePath(); ctx.stroke();
        }
    }
    DKRegister.weaponAura('crowncrusher', aura_crowncrusher, 'weapons/unique/crowncrusher');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_crowncrusher_5(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=8; ctx.beginPath(); ctx.arc(sl.x, sl.y,
        sl.radius*(1-t*.15), 0, TAU); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; for(var c=0; c<12; c++){
            var ca=c*TAU/12; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(ca)*sl.radius*.72, sl.y+Math.sin(ca)*sl.radius*.72); ctx.lineTo(sl.x+Math.cos(ca)*sl.radius,
            sl.y+Math.sin(ca)*sl.radius); ctx.stroke();
        }
    }
    DKRegister.slashRenderer('crowncrusher', slashArt_crowncrusher_5);
}
());

// ============================================================================
// 25 — DEW SCEPTER
// A two-mana bubble bursts into a cooling splash, chilling a small cluster.
// Former module: weapons/unique/dew-scepter.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        dewScepter: {
            name: 'DEW SCEPTER', icon: '♢', category: 'MAGIC', rarity: 'common', damage: 4.3, rate: 470,
            speed: 8, mana: 2, blast: 44, color: '#6dd5ed', price: 27, handler: 'dew', desc: 'A two-mana bubble bursts into a cooling splash, chilling a small cluster.'
        }
    }, {
        dewScepter: DKAttackProfile('cast', 19, 2, .2, 0, 11, 1, 'bubbles', 6, 42, .4)
    }, "weapons/unique/dewScepter");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('dewScepter', {
        configureProjectile: function(c){
            c.opts.status='freeze'; c.opts.blast=c.weapon.blast; c.opts.radius=7; c.opts.life=75;
        }
    }, 'weapons/unique/dew-scepter');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_dewScepter(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#46636b'; ctx.fillRect(5,
        -2, 29, 4); ctx.fillStyle='#b9f5ff'; ctx.beginPath(); ctx.arc(37, 0, 9, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.stroke(); ctx.fillStyle='rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(34,
        -3, 3, 0, TAU); ctx.fill(); ctx.strokeStyle='#dffaff'; ctx.lineWidth=2; for(var dw=0; dw<4; dw++){
            var dwa=visualTick*.04+dw*TAU/4; ctx.beginPath(); ctx.arc(37+Math.cos(dwa)*13, Math.sin(dwa)*13,
            2, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.weaponRenderer('dewScepter', render_dewScepter, 'weapons/unique/dew-scepter');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_dewScepter_24(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='rgba(109,213,237,.28)'; ctx.beginPath(); ctx.arc(0,
        0, b.radius+4, 0, TAU); ctx.fill(); ctx.strokeStyle='#dffaff'; ctx.beginPath(); ctx.arc(0, 0, b.radius+3,
        0, TAU); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-2, -3, 2, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('dewScepter', projectileArt_dewScepter_24);
}
());

// ============================================================================
// 26 — DICE CANNON
// Cycles predictably from one to six pellets. The six-face volley is guaranteed to critically strike.
// Former module: weapons/unique/dice-cannon.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        diceCannon: {
            name: 'DICE CANNON', icon: '⚄', category: 'GUN', rarity: 'uncommon', damage: 2.3, rate: 520,
            speed: 13, spread: .62, color: '#f4f1df', price: 53, handler: 'dice', desc: 'Cycles predictably from one to six pellets. The six-face volley is guaranteed to critically strike.'
        }
    }, {
        diceCannon: DKAttackProfile('roll', 17, 13, .21, 2, 2, 1, 'dice', 6, 46, .9)
    }, "weapons/unique/diceCannon");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('diceCannon', {
        prepareVolley: function(c){
            c.count=(c.weapon.shots-1)%6+1;
        }, configureCrit: function(c){
            if(c.count===6)c.forceCrit=true;
        }, configureProjectile: function(c){
            c.opts.type='die'; c.opts.radius=5; c.opts.crit=c.crit; c.opts.life=105;
        }
    }, 'weapons/unique/dice-cannon');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_diceCannon(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#35332e'; ctx.fillRect(4,
        -8, 34, 16); ctx.strokeStyle='#f4f1df'; ctx.strokeRect(4, -8, 34, 16); ctx.fillStyle='#827b68'; ctx.fillRect(9,
        8, 10, 10); ctx.save(); ctx.translate(42, 0); ctx.rotate(visualTick*.045); ctx.fillStyle='#f4f1df'; ctx.fillRect(-9,
        -9, 18, 18); ctx.strokeStyle='#222'; ctx.strokeRect(-9, -9, 18, 18); ctx.fillStyle='#222'; for(var dc=0; dc<4; dc++){
            var da=dc*TAU/4+Math.PI/4; ctx.beginPath(); ctx.arc(Math.cos(da)*5, Math.sin(da)*5, 1.5, 0, TAU); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(0, 0, 1.5, 0, TAU); ctx.fill(); ctx.restore();
    }
    DKRegister.weaponRenderer('diceCannon', render_diceCannon, 'weapons/unique/dice-cannon');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_diceCannon_6(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.16); ctx.fillStyle='#f4f1df'; ctx.fillRect(-6,
        -6, 12, 12); ctx.strokeStyle='#39372f'; ctx.strokeRect(-6, -6, 12, 12); ctx.fillStyle='#222'; for(var di=-1; di<=1; di+=2){
            ctx.beginPath(); ctx.arc(di*2.5, di*2.5, 1.2, 0, TAU); ctx.arc(-di*2.5, di*2.5, 1.2, 0, TAU); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(0, 0, 1.2, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('diceCannon', projectileArt_diceCannon_6);
}
());

// ============================================================================
// 27 — DRAGON MAW
// The sculpted muzzle bites open and exhales nine explosive ember teeth across a huge close cone.
// Former module: weapons/unique/dragon-maw.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        dragonMaw: {
            name: 'DRAGON MAW', icon: '≋', category: 'GUN', rarity: 'epic', damage: 5.5, rate: 520, speed: 12,
            count: 9, spread: 1.08, color: '#ff5d38', price: 123, handler: 'dragonMaw', desc: 'The sculpted muzzle bites open and exhales nine explosive ember teeth across a huge close cone.'
        }
    }, {
        dragonMaw: DKAttackProfile('bite', 23, 17, .24, 8, 1, 2, 'flames', 9, 73, .8)
    }, "weapons/unique/dragonMaw");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('dragonMaw', {
        configureProjectile: function(c){
            c.opts.status='burn'; c.opts.blast=18; c.opts.life=42; c.opts.knockback=5; c.opts.radius=6; c.opts.type='emberTooth';
        }
    }, 'weapons/unique/dragon-maw');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_dragonMaw(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#35130d'; ctx.beginPath(); ctx.moveTo(3,
        -11); ctx.lineTo(34, -15); ctx.lineTo(58, -9); ctx.lineTo(50, -3); ctx.lineTo(62, 0); ctx.lineTo(50,
        3); ctx.lineTo(58, 9); ctx.lineTo(34, 15); ctx.lineTo(3, 11); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.stroke(); ctx.fillStyle='#fff0c2'; for(var dm=-2; dm<=2; dm++){
            ctx.beginPath(); ctx.moveTo(43+Math.abs(dm)*3, dm*4); ctx.lineTo(54, dm*3); ctx.lineTo(47, dm*2); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle='#ffdf7a'; ctx.beginPath(); ctx.arc(32, -7, 3+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('dragonMaw', render_dragonMaw, 'weapons/unique/dragon-maw');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_dragonMaw_21(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#fff0c2'; ctx.beginPath(); ctx.moveTo(12,
        0); ctx.lineTo(-7, -6); ctx.lineTo(-3, 0); ctx.lineTo(-7, 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#ff5d38'; ctx.stroke(); ctx.fillStyle='#ff5d38'; ctx.beginPath(); ctx.moveTo(-5,
        -4); ctx.lineTo(-14, 0); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
    }
    DKRegister.projectileRenderer('dragonMaw', projectileArt_dragonMaw_21);
}
());

// ============================================================================
// 28 — ECHO MAUL
// An overhead impact leaves a delayed near-circular after-swing at half damage.
// Former module: weapons/unique/echo-maul.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        echoMaul: {
            name: 'ECHO MAUL', icon: '◫', category: 'MELEE', rarity: 'rare', damage: 20, rate: 680, reach: 130,
            arc: 1.6, color: '#78a7ff', price: 79, handler: 'echoMaul', deflect: true, desc: 'An overhead impact leaves a delayed near-circular after-swing at half damage.'
        }
    }, {
        echoMaul: DKAttackProfile('slam', 25, 0, 1.7, 27, 4, 4, 'echo', 4, 104, .8)
    }, "weapons/unique/echoMaul");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('echoMaul', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=1.65; c.radius=130; c.knockback=7;
        }, afterMelee: function(c){
            c.api.pushPending({
                frames: 15, kind: 'echoSlash', x: c.player.x, y: c.player.y, angle: c.player.angle, radius: c.radius+18,
                arc: 4.35, damage: c.damage*.55, color: c.weapon.color, sourceId: c.weapon.id
            });
        }
    }, 'weapons/unique/echo-maul');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_echoMaul(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4b3728'; ctx.fillRect(4,
        -4, 31, 8); ctx.fillStyle='#334c78'; ctx.beginPath(); ctx.moveTo(31, -14); ctx.lineTo(49, -14); ctx.lineTo(55,
        -8); ctx.lineTo(52, 12); ctx.lineTo(34, 14); ctx.lineTo(29, 7); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#78a7ff'; ctx.lineWidth=3; ctx.stroke(); ctx.globalAlpha=.35; ctx.strokeRect(37+pulse*5,
        -18, 19, 30); ctx.globalAlpha=1;
    }
    DKRegister.weaponRenderer('echoMaul', render_echoMaul, 'weapons/unique/echo-maul');
}
());

// ============================================================================
// 29 — ECLIPSE BOW: BLACK ZENITH
// Quick shots pierce. A perfect draw fires three seeking crescents that become enormous bullet-eating black suns.
// Former module: weapons/unique/eclipse-bow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        eclipseBow: {
            name: 'ECLIPSE BOW: BLACK ZENITH', icon: '◐', category: 'ARCHER', rarity: 'mythical', damage: 34,
            rate: 560, speed: 20, charge: 650, blast: 210, color: '#ff244f', price: 170, handler: 'eclipse',
            desc: 'Quick shots pierce. A perfect draw fires three seeking crescents that become enormous bullet-eating black suns.'
        }
    }, {
        eclipseBow: DKAttackProfile('draw', 27, 20, .12, 0, 5, 4, 'eclipse', 9, 118, .1)
    }, "weapons/unique/eclipseBow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('eclipseBow', {
        prepareVolley: function(c){
            if(c.burstIndex===1){
                c.count=3; c.spread=.38;
            }
        }, configureProjectile: function(c){
            c.opts.trailMax=11; c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; c.opts.pierce=Math.max(c.opts.pierce||0,
            2); c.opts.life=110; if(c.burstIndex===1){
                c.opts.blast=c.weapon.blast; c.opts.vortex=260; c.opts.life=125; c.opts.homing=.1; c.opts.clearsBullets=true; c.opts.ghost=true; c.opts.radius=11; c.opts.moonSplit=true;
            }
        }
    }, 'weapons/unique/eclipse-bow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_eclipseBow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.strokeStyle='#160912'; ctx.lineWidth=9; ctx.beginPath(); ctx.arc(21,
        0, 24, -1.2, 1.2); ctx.stroke(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(21,
        0, 24, -1.2, 1.2); ctx.stroke(); ctx.strokeStyle='#ffd2e6'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(30,
        -22); ctx.lineTo(20, 0); ctx.lineTo(30, 22); ctx.stroke(); ctx.fillStyle='#050207'; ctx.beginPath(); ctx.arc(38,
        0, 10, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(38,
        0, 13+pulse*2, 0, TAU); ctx.stroke(); ctx.save(); ctx.translate(38, 0); ctx.rotate(visualTick*.04); for(var eb=0; eb<6; eb++){
            ctx.rotate(TAU/6); ctx.fillStyle=eb%2?'#fff': '#ff4d8d'; ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(22,
            -3); ctx.lineTo(20, 3); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(27+pulse*2, 0,
            2, 0, TAU); ctx.fill();
        }
        ctx.restore(); ctx.fillStyle='#fff'; for(var esb=0; esb<4; esb++){
            var esa=visualTick*.025+esb*TAU/4; ctx.beginPath(); ctx.arc(38+Math.cos(esa)*(18+esb), Math.sin(esa)*(18+esb),
            1.5, 0, TAU); ctx.fill();
        }
    }
    DKRegister.weaponRenderer('eclipseBow', render_eclipseBow, 'weapons/unique/eclipse-bow');
    // Mythical/legendary attack aura belongs to this weapon module.
    function aura_eclipseBow(r){
        var ctx=r.ctx, p=r.player, w=r.weapon, q=r.progress, i=r.impact, v=r.visualTick, TAU=r.TAU; ctx.rotate(p.angle); for(var eb=-1; eb<=1; eb++){
            ctx.save(); ctx.translate(55+i*35, eb*24); ctx.rotate(eb*.18); ctx.fillStyle='#080207'; ctx.beginPath(); ctx.arc(0,
            0, 13+i*13, 0, TAU); ctx.fill(); ctx.strokeStyle=eb===0?'#fff': w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,
            0, 18+i*18, -2.4, 2.4); ctx.stroke(); ctx.restore();
        }
    }
    DKRegister.weaponAura('eclipseBow', aura_eclipseBow, 'weapons/unique/eclipse-bow');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_voidLantern_35(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#09050d'; ctx.beginPath(); ctx.arc(0,
        0, b.radius+2, 0, TAU); ctx.fill(); ctx.strokeStyle=b.color; ctx.rotate(b.age*.05); ctx.beginPath(); ctx.ellipse(0,
        0, b.radius+7, b.radius+2, 0, 0, TAU); ctx.stroke(); ctx.rotate(Math.PI/2); ctx.beginPath(); ctx.ellipse(0,
        0, b.radius+5, b.radius+1, 0, 0, TAU); ctx.stroke();
    }
    DKRegister.projectileRenderer('eclipseBow', projectileArt_voidLantern_35);
}
());

// ============================================================================
// 30 — EMBER WAND
// A cheap two-mana spark that ignites targets. Burning enemies take damage over time and pop on death.
// Former module: weapons/unique/ember-wand.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        emberWand: {
            name: 'EMBER WAND', icon: '✧', category: 'MAGIC', rarity: 'common', damage: 4, rate: 440, speed: 9,
            mana: 2, color: '#ff6b35', price: 26, handler: 'ember', desc: 'A cheap two-mana spark that ignites targets. Burning enemies take damage over time and pop on death.'
        }
    }, {
        emberWand: DKAttackProfile('cast', 18, 1, .18, 2, 9, 1, 'orbs', 5, 38, .7)
    }, "weapons/unique/emberWand");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('emberWand', {
        configureProjectile: function(c){
            c.opts.status='burn'; c.opts.blast=25;
        }
    }, 'weapons/unique/ember-wand');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_emberWand(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4b2a1d'; ctx.fillRect(5,
        -2, 26, 4); ctx.fillStyle='#ff6b35'; ctx.beginPath(); ctx.moveTo(29, 0); ctx.quadraticCurveTo(33,
        -13, 39, -3); ctx.quadraticCurveTo(45, 5, 34, 11); ctx.quadraticCurveTo(28, 6, 29, 0); ctx.fill(); ctx.fillStyle='#fff3b0'; ctx.beginPath(); ctx.arc(35,
        1, 3+pulse*2, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('emberWand', render_emberWand, 'weapons/unique/ember-wand');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_emberWand_32(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#ffb142'; ctx.beginPath(); ctx.moveTo(7,
        0); ctx.quadraticCurveTo(-1, -9, -7, 0); ctx.quadraticCurveTo(-1, 8, 7, 0); ctx.fill(); ctx.fillStyle='#fff3b0'; ctx.beginPath(); ctx.arc(2,
        0, 2.5, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('emberWand', projectileArt_emberWand_32);
    // Impact accent for this projectile.
    function impactArt_emberWand(r){
        var b=r.projectile; r.api.addRing(r.x, r.y, '#ffb142', 26, 3);
    }
    DKRegister.projectileImpactRenderer('emberWand', impactArt_emberWand);
}
());

// ============================================================================
// 31 — FALCON REPEATER
// Rapid arrows mark prey. Every fifth mark detonates for a hunting burst.
// Former module: weapons/unique/falcon-repeater.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        falconRepeater: {
            name: 'FALCON REPEATER', icon: '»', category: 'ARCHER', rarity: 'rare', damage: 4, rate: 165,
            speed: 17, color: '#c8d6e5', price: 70, handler: 'markArrow', desc: 'Rapid arrows mark prey. Every fifth mark detonates for a hunting burst.'
        }
    }, {
        falconRepeater: DKAttackProfile('rattle', 8, 6, .035, 1, 0, 0, 'feathers', 4, 30, .8)
    }, "weapons/unique/falconRepeater");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('falconRepeater', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; c.opts.mark=true;
        }
    }, 'weapons/unique/falcon-repeater');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_falconRepeater(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4a3b2b'; ctx.fillRect(5,
        -3, 31, 6); ctx.fillStyle=w.color; ctx.fillRect(17, -5, 22, 10); ctx.strokeStyle='#ecf0f1'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(22,
        -16); ctx.quadraticCurveTo(33, -7, 22, 0); ctx.quadraticCurveTo(33, 7, 22, 16); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(23,
        -14); ctx.lineTo(34, 0); ctx.lineTo(23, 14); ctx.stroke();
    }
    DKRegister.weaponRenderer('falconRepeater', render_falconRepeater, 'weapons/unique/falcon-repeater');
}
());

// ============================================================================
// 32 — FLARE PISTOL
// A bright signal round bursts on impact and leaves a short burning pool.
// Former module: weapons/unique/flare-pistol.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        flarePistol: {
            name: 'FLARE PISTOL', icon: '¤', category: 'GUN', rarity: 'common', damage: 5.2, rate: 480, speed: 11,
            blast: 38, color: '#ff794d', price: 29, handler: 'flare', desc: 'A bright signal round bursts on impact and leaves a short burning pool.'
        }
    }, {
        flarePistol: DKAttackProfile('snap', 13, 11, .11, 1, 2, 0, 'flare', 8, 43, .1)
    }, "weapons/unique/flarePistol");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('flarePistol', {
        configureProjectile: function(c){
            c.opts.status='burn'; c.opts.blast=c.weapon.blast; c.opts.comet=true; c.opts.radius=7; c.opts.life=78; c.opts.type='flare';
        }
    }, 'weapons/unique/flare-pistol');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_flarePistol(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#51413a'; ctx.beginPath(); ctx.moveTo(5,
        -7); ctx.lineTo(34, -8); ctx.lineTo(42, -4); ctx.lineTo(42, 4); ctx.lineTo(33, 8); ctx.lineTo(5,
        7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#805747'; ctx.fillRect(10, 7, 9, 12); ctx.fillStyle=w.color; ctx.beginPath(); ctx.arc(35,
        0, 7+pulse, 0, TAU); ctx.fill(); ctx.fillStyle='#fff4df'; ctx.beginPath(); ctx.arc(36, 0, 3, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('flarePistol', render_flarePistol, 'weapons/unique/flare-pistol');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_flarePistol_4(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#ffefe2'; ctx.beginPath(); ctx.arc(2,
        0, 5, 0, TAU); ctx.fill(); ctx.strokeStyle='#ff794d'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,
        0, 9+Math.sin(b.age*.3)*2, 0, TAU); ctx.stroke(); ctx.fillStyle='#ff5d38'; ctx.beginPath(); ctx.moveTo(-4,
        -5); ctx.lineTo(-13, 0); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill();
    }
    DKRegister.projectileRenderer('flarePistol', projectileArt_flarePistol_4);
}
());

// ============================================================================
// 33 — FROSTBRAND
// A huge side-to-side freeze sweep reflects projectiles; every third swing releases a cold crescent.
// Former module: weapons/unique/frostbrand.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        frostbrand: {
            name: 'FROSTBRAND', icon: '❄', category: 'MELEE', rarity: 'rare', damage: 16, rate: 500, reach: 122,
            arc: 4.15, color: '#74b9ff', price: 68, handler: 'melee', deflect: true, status: 'freeze', desc: 'A huge side-to-side freeze sweep reflects projectiles; every third swing releases a cold crescent.'
        }
    }, {
        frostbrand: DKAttackProfile('sweep', 23, 0, 2.55, 4, 0, 4, 'ice', 7, 112, .2)
    }, "weapons/unique/frostbrand");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('frostbrand', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=4.15; c.radius=122; c.knockback=3.5;
        }, afterMelee: function(c){
            if(c.weapon.shots%3===0)c.api.pushBullet({
                x: c.player.x, y: c.player.y, angle: c.player.angle, speed: 12, damage: c.damage*.7, friendly: true,
                color: c.weapon.color, radius: 8, pierce: 2, status: c.weapon.status||'', sourceId: c.weapon.id
            });
        }
    }, 'weapons/unique/frostbrand');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_frostbrand(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#5b4631'; ctx.fillRect(4,
        -3, 19, 6); ctx.fillStyle=w.color; ctx.beginPath(); ctx.moveTo(21, -6); ctx.lineTo(34, -11); ctx.lineTo(43,
        -5); ctx.lineTo(52, 0); ctx.lineTo(42, 6); ctx.lineTo(34, 12); ctx.lineTo(21, 5); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#eaf9ff'; ctx.beginPath(); ctx.moveTo(25,
        0); ctx.lineTo(47, 0); ctx.stroke();
    }
    DKRegister.weaponRenderer('frostbrand', render_frostbrand, 'weapons/unique/frostbrand');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_bloodMoonKatana_37(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.strokeStyle=b.color; ctx.lineWidth=6; ctx.beginPath(); ctx.arc(-2,
        0, 11, -.8, .8); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(-2,
        0, 11, -.7, .7); ctx.stroke();
    }
    DKRegister.projectileRenderer('frostbrand', projectileArt_bloodMoonKatana_37);
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_frostbrand_1(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=9; ctx.beginPath(); ctx.arc(sl.x, sl.y,
        sl.radius*(1-t*.1), sl.angle-sl.arc/2, sl.angle+sl.arc/2); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); for(var ice=0; ice<5; ice++){
            var ia=sl.angle-sl.arc/2+sl.arc*ice/4; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(ia)*sl.radius*.72,
            sl.y+Math.sin(ia)*sl.radius*.72); ctx.lineTo(sl.x+Math.cos(ia)*sl.radius, sl.y+Math.sin(ia)*sl.radius); ctx.stroke();
        }
    }
    DKRegister.slashRenderer('frostbrand', slashArt_frostbrand_1);
}
());

// ============================================================================
// 34 — GEARSPIKE PIKE
// A long lunging thrust. Every fourth strike ejects a piercing gear-tooth.
// Former module: weapons/unique/gearspike-pike.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        gearspikePike: {
            name: 'GEARSPIKE PIKE', icon: '‡', category: 'MELEE', rarity: 'uncommon', damage: 14, rate: 480,
            reach: 170, arc: .38, color: '#d6a84b', price: 49, handler: 'pike', deflect: true, desc: 'A long lunging thrust. Every fourth strike ejects a piercing gear-tooth.'
        }
    }, {
        gearspikePike: DKAttackProfile('thrust', 16, 0, .05, 31, 0, 2, 'gears', 6, 58, .7)
    }, "weapons/unique/gearspikePike");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('gearspikePike', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=.38; c.radius=170; c.knockback=6; c.player.x+=Math.cos(c.player.angle)*7; c.player.y+=Math.sin(c.player.angle)*7; if(c.weapon.shots%4===0)c.api.pushBullet({
                x: c.player.x, y: c.player.y, angle: c.player.angle, speed: 14, damage: c.damage*.8, friendly: true,
                color: c.weapon.color, sourceId: c.weapon.id, type: 'gearTooth', radius: 5, pierce: 3, life: 100
            });
        }
    }, 'weapons/unique/gearspike-pike');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_gearspikePike(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#5c4226'; ctx.fillRect(4,
        -3, 38, 6); ctx.fillStyle='#d6a84b'; ctx.beginPath(); ctx.moveTo(39, -8); ctx.lineTo(58, 0); ctx.lineTo(39,
        8); ctx.lineTo(45, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.save(); ctx.translate(31, 0); ctx.rotate(visualTick*.08); ctx.strokeStyle='#f5d98c'; for(var gp=0; gp<8; gp++){
            ctx.rotate(TAU/8); ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(10, 0); ctx.stroke();
        }
        ctx.restore();
    }
    DKRegister.weaponRenderer('gearspikePike', render_gearspikePike, 'weapons/unique/gearspike-pike');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_gearspikePike_43(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.25); ctx.fillStyle='#d6a84d'; ctx.beginPath(); for(var gt=0; gt<12; gt++){
            var gtr=gt%2?4: 8, gta=gt*TAU/12; if(gt===0)ctx.moveTo(Math.cos(gta)*gtr, Math.sin(gta)*gtr); else ctx.lineTo(Math.cos(gta)*gtr,
            Math.sin(gta)*gtr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle='#fff0a8'; ctx.stroke();
    }
    DKRegister.projectileRenderer('gearspikePike', projectileArt_gearspikePike_43);
}
());

// ============================================================================
// 35 — GLASS NEEDLER
// Plants crystal splinters at high speed. A third splinter shatters the stack in a sharp burst.
// Former module: weapons/unique/glass-needler.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        glassNeedler: {
            name: 'GLASS NEEDLER', icon: '⋮', category: 'GUN', rarity: 'uncommon', damage: 2.4, rate: 130,
            speed: 17, color: '#7ed6df', price: 48, handler: 'needler', desc: 'Plants crystal splinters at high speed. A third splinter shatters the stack in a sharp burst.'
        }
    }, {
        glassNeedler: DKAttackProfile('rattle', 7, 4, .028, 0, 0, 0, 'shards', 3, 27, .4)
    }, "weapons/unique/glassNeedler");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('glassNeedler', {
        configureProjectile: function(c){
            c.opts.radius=3; c.opts.life=100; c.opts.shatterMark=true;
        }
    }, 'weapons/unique/glass-needler');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_glassNeedler(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#26383c'; ctx.beginPath(); ctx.moveTo(4,
        -7); ctx.lineTo(27, -8); ctx.lineTo(35, -4); ctx.lineTo(35, 4); ctx.lineTo(27, 8); ctx.lineTo(4,
        7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#7ed6df'; ctx.beginPath(); ctx.moveTo(21,
        -6); ctx.lineTo(40, 0); ctx.lineTo(21, 6); ctx.lineTo(27, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#dffcff'; ctx.beginPath(); ctx.moveTo(34,
        0); ctx.lineTo(48, 0); ctx.stroke(); for(var gn=0; gn<3; gn++){
            ctx.beginPath(); ctx.moveTo(13+gn*5, -4); ctx.lineTo(16+gn*5, 0); ctx.lineTo(13+gn*5, 4); ctx.stroke();
        }
    }
    DKRegister.weaponRenderer('glassNeedler', render_glassNeedler, 'weapons/unique/glass-needler');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_glassNeedler_27(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#dffcff'; ctx.beginPath(); ctx.moveTo(12,
        0); ctx.lineTo(-7, -2.5); ctx.lineTo(-3, 0); ctx.lineTo(-7, 2.5); ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke();
    }
    DKRegister.projectileRenderer('glassNeedler', projectileArt_glassNeedler_27);
    // Impact accent for this projectile.
    function impactArt_glassNeedler(r){
        var b=r.projectile; r.api.addRing(r.x, r.y, '#dffcff', 18, 1);
    }
    DKRegister.projectileImpactRenderer('glassNeedler', impactArt_glassNeedler);
}
());

// ============================================================================
// 36 — GRAVE BELL
// A twelve-mana toll sends a powerful circular funeral wave through walls.
// Former module: weapons/unique/grave-bell.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        graveBell: {
            name: 'GRAVE BELL', icon: '♩', category: 'MAGIC', rarity: 'rare', damage: 15, rate: 690, mana: 12,
            color: '#a29bfe', price: 74, handler: 'bell', desc: 'A twelve-mana toll sends a powerful circular funeral wave through walls.'
        }
    }, {
        graveBell: DKAttackProfile('toll', 22, 3, .36, 0, 12, 2, 'rings', 5, 96, .7)
    }, "weapons/unique/graveBell");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('graveBell', {
        attack: function(c){
            var damage=c.weapon.damage*c.api.weaponLevelScale(c.weapon)*c.player.damageMultiplier(); c.api.explode(c.player.x,
            c.player.y, 185, damage, true, c.weapon.color, 'shock', false); c.api.addRing(c.player.x, c.player.y,
            '#e7dcff', 235, 3); c.api.addRing(c.player.x, c.player.y, c.weapon.color, 145, 7); return true;
        }
    }, 'weapons/unique/grave-bell');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_graveBell(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4d3a54'; ctx.fillRect(4,
        -2, 25, 4); ctx.fillStyle='#6d5a7a'; ctx.beginPath(); ctx.moveTo(28, -12); ctx.quadraticCurveTo(42,
        -10, 45, 6); ctx.lineTo(48, 10); ctx.lineTo(24, 10); ctx.lineTo(27, 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.stroke(); ctx.fillStyle='#e7dcff'; ctx.beginPath(); ctx.arc(36,
        12, 4, 0, TAU); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(36,
        0, 6+pulse*2, 0, TAU); ctx.stroke();
    }
    DKRegister.weaponRenderer('graveBell', render_graveBell, 'weapons/unique/grave-bell');
}
());

// ============================================================================
// 37 — GRAVEGLASS AUTOCANNON
// Heavy violet shards harvest the last breath of low-health enemies and refill one round as a ghost shot.
// Former module: weapons/unique/graveglass-autocannon.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        graveglassAutocannon: {
            name: 'GRAVEGLASS AUTOCANNON', icon: '†', category: 'GUN', rarity: 'epic', damage: 8.2, rate: 190,
            speed: 18, pierce: 2, graveglass: true, color: '#9955cc', price: 116, handler: 'autocannon',
            desc: 'Heavy violet shards harvest the last breath of low-health enemies and refill one round as a ghost shot.'
        }
    }, {
        graveglassAutocannon: DKAttackProfile('rattle', 10, 12, .08, 2, 3, 3, 'graveShards', 7, 62, .57)
    }, "weapons/unique/graveglassAutocannon");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('graveglassAutocannon', {
        configureProjectile: function(c){
            c.opts.life=125; c.opts.radius=7; c.opts.type='graveglass'; c.opts.pierce=c.weapon.pierce||2; c.opts.graveglass=true; c.opts.status='curse';
        }
    }, 'weapons/unique/graveglass-autocannon');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_graveglassAutocannon(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#181021'; ctx.beginPath(); ctx.moveTo(2,
        -11); ctx.lineTo(39, -14); ctx.lineTo(61, -9); ctx.lineTo(72, -4); ctx.lineTo(72, 4); ctx.lineTo(61,
        9); ctx.lineTo(39, 14); ctx.lineTo(2, 11); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.stroke(); ctx.fillStyle='#372646'; ctx.fillRect(9,
        10, 12, 16); ctx.save(); ctx.translate(39, 0); ctx.rotate(-visualTick*.055); for(var gg=0; gg<6; gg++){
            ctx.rotate(TAU/6); ctx.fillStyle=gg%2?'#e7d4ff': w.color; ctx.beginPath(); ctx.moveTo(5, -3); ctx.lineTo(17,
            0); ctx.lineTo(5, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        ctx.restore(); ctx.fillStyle='#f3e8ff'; ctx.beginPath(); ctx.moveTo(73, 0); ctx.lineTo(58, -7); ctx.lineTo(61,
        0); ctx.lineTo(58, 7); ctx.closePath(); ctx.fill(); for(var gs=0; gs<3; gs++){
            ctx.globalAlpha=.22+gs*.18; ctx.strokeStyle=w.color; ctx.strokeRect(74+gs*5, -4-gs, 7, 8+gs*2);
        }
        ctx.globalAlpha=1;
    }
    DKRegister.weaponRenderer('graveglassAutocannon', render_graveglassAutocannon, 'weapons/unique/graveglass-autocannon');
}
());

// ============================================================================
// 38 — GRAVITY SAW
// Throws a returning saw-disc whose miniature gravity field drags enemies across both passes.
// Former module: weapons/unique/gravity-saw.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        gravitySaw: {
            name: 'GRAVITY SAW', icon: '✺', category: 'MELEE', rarity: 'epic', damage: 14, rate: 640, speed: 10,
            color: '#9c6cff', price: 121, handler: 'gravitySaw', desc: 'Throws a returning saw-disc whose miniature gravity field drags enemies across both passes.'
        }
    }, {
        gravitySaw: DKAttackProfile('throw', 22, 2, .9, 24, 1, 3, 'void', 9, 72, .5)
    }, "weapons/unique/gravitySaw");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('gravitySaw', {
        configureProjectile: function(c){
            c.opts.type='disc'; c.opts.radius=12; c.opts.pierce=7; c.opts.returning=true; c.opts.returnAge=42; c.opts.life=150; c.opts.bounce=1; c.opts.clearsBullets=true; c.opts.vortex=125;
        }
    }, 'weapons/unique/gravity-saw');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_gravitySaw(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#332747'; ctx.fillRect(4,
        -4, 23, 8); ctx.strokeStyle='#9c6cff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(25, 0); ctx.quadraticCurveTo(34,
        -13, 43, 0); ctx.stroke(); ctx.save(); ctx.translate(47, 0); ctx.rotate(visualTick*.15); ctx.fillStyle='#1c122b'; ctx.beginPath(); for(var gs=0; gs<20; gs++){
            var gsr=gs%2?9: 14, gsa=gs*TAU/20; if(gs===0)ctx.moveTo(Math.cos(gsa)*gsr, Math.sin(gsa)*gsr); else ctx.lineTo(Math.cos(gsa)*gsr,
            Math.sin(gsa)*gsr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle='#c7a9ff'; ctx.stroke(); ctx.fillStyle='#9c6cff'; ctx.beginPath(); ctx.arc(0,
        0, 4+pulse, 0, TAU); ctx.fill(); ctx.restore();
    }
    DKRegister.weaponRenderer('gravitySaw', render_gravitySaw, 'weapons/unique/gravity-saw');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_boomerangCog_25(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.34); ctx.fillStyle=b.sourceId==='guillotineYoyo'?'#3b1720': b.sourceId==='gravitySaw'?'#21133a': b.color; ctx.beginPath(); for(var cg=0; cg<16; cg++){
            var cgr=cg%2?(b.sourceId==='guillotineYoyo'?6: b.sourceId==='gravitySaw'?8: 5): (b.sourceId==='guillotineYoyo'?12: b.sourceId==='gravitySaw'?15: 9); var cga=cg*TAU/16; if(cg===0)ctx.moveTo(Math.cos(cga)*cgr,
            Math.sin(cga)*cgr); else ctx.lineTo(Math.cos(cga)*cgr, Math.sin(cga)*cgr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,
        0, b.sourceId==='gravitySaw'?4: 2, 0, TAU); ctx.fill(); if(b.sourceId==='gravitySaw'){
            ctx.strokeStyle='#9c6cff'; ctx.beginPath(); ctx.arc(0, 0, 20+Math.sin(b.age*.18)*3, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.projectileRenderer('gravitySaw', projectileArt_boomerangCog_25);
}
());

// ============================================================================
// 39 — GUILLOTINE YO-YO
// A chained execution disc carves outward, clears bullets, and returns for another cut.
// Former module: weapons/unique/guillotine-yoyo.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        guillotineYoyo: {
            name: 'GUILLOTINE YO-YO', icon: '◍', category: 'MELEE', rarity: 'epic', damage: 13, rate: 520,
            speed: 11, color: '#ff6b81', price: 112, handler: 'yoyo', desc: 'A chained execution disc carves outward, clears bullets, and returns for another cut.'
        }
    }, {
        guillotineYoyo: DKAttackProfile('throw', 19, 1, .72, 20, 0, 3, 'blades', 7, 61, .4)
    }, "weapons/unique/guillotineYoyo");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('guillotineYoyo', {
        configureProjectile: function(c){
            c.opts.type='disc'; c.opts.radius=11; c.opts.pierce=6; c.opts.returning=true; c.opts.returnAge=38; c.opts.life=145; c.opts.bounce=1; c.opts.clearsBullets=true;
        }
    }, 'weapons/unique/guillotine-yoyo');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_guillotineYoyo(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#49242d'; ctx.fillRect(4,
        -3, 19, 6); ctx.strokeStyle='#d9a0ad'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(22, 0); ctx.quadraticCurveTo(31,
        -12, 39, 0); ctx.stroke(); ctx.save(); ctx.translate(44, 0); ctx.rotate(visualTick*.12); ctx.fillStyle='#351018'; ctx.beginPath(); for(var gy=0; gy<16; gy++){
            var gyr=gy%2?8: 13, gya=gy*TAU/16; if(gy===0)ctx.moveTo(Math.cos(gya)*gyr, Math.sin(gya)*gyr); else ctx.lineTo(Math.cos(gya)*gyr,
            Math.sin(gya)*gyr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=2; ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,
        0, 3, 0, TAU); ctx.fill(); ctx.restore();
    }
    DKRegister.weaponRenderer('guillotineYoyo', render_guillotineYoyo, 'weapons/unique/guillotine-yoyo');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_boomerangCog_25(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.34); ctx.fillStyle=b.sourceId==='guillotineYoyo'?'#3b1720': b.sourceId==='gravitySaw'?'#21133a': b.color; ctx.beginPath(); for(var cg=0; cg<16; cg++){
            var cgr=cg%2?(b.sourceId==='guillotineYoyo'?6: b.sourceId==='gravitySaw'?8: 5): (b.sourceId==='guillotineYoyo'?12: b.sourceId==='gravitySaw'?15: 9); var cga=cg*TAU/16; if(cg===0)ctx.moveTo(Math.cos(cga)*cgr,
            Math.sin(cga)*cgr); else ctx.lineTo(Math.cos(cga)*cgr, Math.sin(cga)*cgr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,
        0, b.sourceId==='gravitySaw'?4: 2, 0, TAU); ctx.fill(); if(b.sourceId==='gravitySaw'){
            ctx.strokeStyle='#9c6cff'; ctx.beginPath(); ctx.arc(0, 0, 20+Math.sin(b.age*.18)*3, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.projectileRenderer('guillotineYoyo', projectileArt_boomerangCog_25);
}
());

// ============================================================================
// 40 — HEDGEHOG BUCKLER
// A compact full-circle guard. Every third spin throws eight thorn-quills after reflecting nearby shots.
// Former module: weapons/unique/hedgehog-buckler.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        hedgehogBuckler: {
            name: 'HEDGEHOG BUCKLER', icon: '✹', category: 'MELEE', rarity: 'uncommon', damage: 10, rate: 520,
            reach: 104, arc: 6.28, color: '#9eb46f', price: 49, handler: 'hedgehog', deflect: true, desc: 'A compact full-circle guard. Every third spin throws eight thorn-quills after reflecting nearby shots.'
        }
    }, {
        hedgehogBuckler: DKAttackProfile('guardSpin', 21, 0, 5.7, 2, 0, 5, 'quills', 8, 94, .91)
    }, "weapons/unique/hedgehogBuckler");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('hedgehogBuckler', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=c.api.TAU; c.radius=104; c.knockback=5.5; if(c.weapon.shots%3===0){
                for(var i=0; i<8; i++){
                    var angle=i*c.api.TAU/8; c.api.pushBullet({
                        x: c.player.x, y: c.player.y, angle: angle, speed: 12, damage: c.damage*.38, friendly: true,
                        color: i%2?'#eef7d9': c.weapon.color, sourceId: 'hedgehogQuill', type: 'quill', radius: 4,
                        pierce: 1, life: 75
                    });
                }
                c.api.addRing(c.player.x, c.player.y, c.weapon.color, 126, 5);
            }
        }
    }, 'weapons/unique/hedgehog-buckler');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_hedgehogBuckler(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#554631'; ctx.fillRect(4,
        -4, 20, 8); ctx.save(); ctx.translate(34, 0); ctx.rotate(visualTick*.035); ctx.fillStyle='#33412c'; ctx.beginPath(); ctx.arc(0,
        0, 14, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=4; ctx.stroke(); for(var hgb=0; hgb<12; hgb++){
            ctx.rotate(TAU/12); ctx.fillStyle=hgb%2?'#eaf3d1': w.color; ctx.beginPath(); ctx.moveTo(10, -3); ctx.lineTo(24,
            0); ctx.lineTo(10, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle='#eee7d6'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.restore();
    }
    DKRegister.weaponRenderer('hedgehogBuckler', render_hedgehogBuckler, 'weapons/unique/hedgehog-buckler');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_hedgehogBuckler_13(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(sl.x, sl.y,
        sl.radius*(1-t*.08), 0, TAU); ctx.stroke(); ctx.fillStyle='#eef7d9'; for(var hgs=0; hgs<12; hgs++){
            var hgsa=hgs*TAU/12; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(hgsa)*sl.radius*.82, sl.y+Math.sin(hgsa)*sl.radius*.82); ctx.lineTo(sl.x+Math.cos(hgsa)*(sl.radius+15),
            sl.y+Math.sin(hgsa)*(sl.radius+15)); ctx.lineTo(sl.x+Math.cos(hgsa+.06)*sl.radius*.86, sl.y+Math.sin(hgsa+.06)*sl.radius*.86); ctx.fill();
        }
    }
    DKRegister.slashRenderer('hedgehogBuckler', slashArt_hedgehogBuckler_13);
}
());

// ============================================================================
// 41 — HIVE LAUNCHER
// The wax shell cracks into five luminous hunter-wasps after its first impact.
// Former module: weapons/unique/hive-launcher.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        hiveLauncher: {
            name: 'HIVE LAUNCHER', icon: '⬡', category: 'GUN', rarity: 'rare', damage: 11, rate: 900, speed: 7,
            blast: 55, color: '#f6b93b', price: 80, handler: 'hive', desc: 'The wax shell cracks into five luminous hunter-wasps after its first impact.'
        }
    }, {
        hiveLauncher: DKAttackProfile('pump', 22, 18, .12, 3, 4, 0, 'wasps', 5, 57, .5)
    }, "weapons/unique/hiveLauncher");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('hiveLauncher', {
        configureProjectile: function(c){
            c.opts.type='shell'; c.opts.radius=8; c.opts.life=72; c.opts.blast=c.weapon.blast; c.opts.hive=5;
        }
    }, 'weapons/unique/hive-launcher');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_hiveLauncher(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4d3b20'; ctx.beginPath(); ctx.moveTo(4,
        -8); ctx.lineTo(31, -11); ctx.lineTo(43, -6); ctx.lineTo(43, 6); ctx.lineTo(31, 11); ctx.lineTo(4,
        8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle='#f6b93b'; ctx.lineWidth=2; for(var hv=0; hv<3; hv++){
            ctx.beginPath(); ctx.arc(18+hv*8, 0, 6, 0, TAU); ctx.stroke();
        }
        ctx.fillStyle='#ffe66d'; for(var hh=0; hh<3; hh++){
            ctx.beginPath(); ctx.arc(18+hh*8, 0, 2+pulse, 0, TAU); ctx.fill();
        }
        ctx.fillStyle='#2d2413'; ctx.beginPath(); ctx.ellipse(42, 0, 4, 7, 0, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('hiveLauncher', render_hiveLauncher, 'weapons/unique/hive-launcher');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_hiveLauncher_28(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#6b4c1d'; ctx.beginPath(); ctx.moveTo(8,
        0); ctx.lineTo(4, -7); ctx.lineTo(-5, -7); ctx.lineTo(-9, 0); ctx.lineTo(-5, 7); ctx.lineTo(4, 7); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#ffe66d'; ctx.stroke(); ctx.fillStyle='#ffe66d'; ctx.beginPath(); ctx.arc(0,
        0, 2, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('hiveLauncher', projectileArt_hiveLauncher_28);
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_hiveWasp_29(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#ffe66d'; ctx.beginPath(); ctx.ellipse(0,
        0, 5, 3, 0, 0, TAU); ctx.fill(); ctx.fillStyle='#2d2413'; ctx.fillRect(-1, -3, 2, 6); ctx.fillStyle='rgba(255,255,255,.75)'; ctx.beginPath(); ctx.ellipse(-1,
        -4, 3, 2, -.5, 0, TAU); ctx.ellipse(-1, 4, 3, 2, .5, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('hiveWasp', projectileArt_hiveWasp_29);
    // Impact accent for this projectile.
    function impactArt_hiveLauncher(r){
        var b=r.projectile; r.api.addRing(r.x, r.y, '#ffe66d', 34, 3);
    }
    DKRegister.projectileImpactRenderer('hiveLauncher', impactArt_hiveLauncher);
}
());

// ============================================================================
// 42 — HOURHAND RAPIER
// Fast clock-needle thrusts place time marks. The fourth mark arrests its victim and breaks the stored seconds outward.
// Former module: weapons/unique/hourhand-rapier.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        hourhandRapier: {
            name: 'HOURHAND RAPIER', icon: '◷', category: 'MELEE', rarity: 'rare', damage: 14, rate: 360,
            reach: 175, arc: .32, color: '#e6ca6b', price: 80, handler: 'hourhand', deflect: true, desc: 'Fast clock-needle thrusts place time marks. The fourth mark arrests its victim and breaks the stored seconds outward.'
        }
    }, {
        hourhandRapier: DKAttackProfile('clockThrust', 15, 0, .035, 42, 0, 3, 'ticks', 6, 72, .95)
    }, "weapons/unique/hourhandRapier");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('hourhandRapier', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=.32; c.radius=175; c.knockback=4; c.chronoMark=true; c.player.x+=Math.cos(c.player.angle)*6; c.player.y+=Math.sin(c.player.angle)*6;
        }
    }, 'weapons/unique/hourhand-rapier');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_hourhandRapier(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4f3e2b'; ctx.fillRect(4,
        -3, 23, 6); ctx.save(); ctx.translate(28, 0); ctx.fillStyle='#3a3425'; ctx.beginPath(); ctx.arc(0,
        0, 11, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.stroke(); for(var hhr=0; hhr<8; hhr++){
            ctx.rotate(TAU/8); ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(11, 0); ctx.stroke();
        }
        ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(visualTick*.04)*8,
        Math.sin(visualTick*.04)*8); ctx.stroke(); ctx.restore(); ctx.fillStyle='#e8dca8'; ctx.beginPath(); ctx.moveTo(72,
        0); ctx.lineTo(29, -3); ctx.lineTo(35, 0); ctx.lineTo(29, 3); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.stroke();
    }
    DKRegister.weaponRenderer('hourhandRapier', render_hourhandRapier, 'weapons/unique/hourhand-rapier');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_hourhandRapier_15(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=8; ctx.globalAlpha*=.32; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(sl.angle)*20,
        sl.y+Math.sin(sl.angle)*20); ctx.lineTo(sl.x+Math.cos(sl.angle)*sl.radius, sl.y+Math.sin(sl.angle)*sl.radius); ctx.stroke(); ctx.globalAlpha=Math.sin(t*Math.PI); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); for(var hht=1; hht<=4; hht++){
            var hhx=sl.x+Math.cos(sl.angle)*sl.radius*hht/4, hhy=sl.y+Math.sin(sl.angle)*sl.radius*hht/4; ctx.beginPath(); ctx.arc(hhx,
            hhy, 3+hht, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.slashRenderer('hourhandRapier', slashArt_hourhandRapier_15);
}
());

// ============================================================================
// 43 — IRON CLEAVER
// A broad close swing that destroys hostile projectiles caught in its arc.
// Former module: weapons/unique/iron-cleaver.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        ironCleaver: {
            name: 'IRON CLEAVER', icon: '◢', category: 'MELEE', rarity: 'common', damage: 8, rate: 560, reach: 82,
            arc: 1.55, color: '#bdc3c7', price: 24, handler: 'melee', deflect: true, desc: 'A broad close swing that destroys hostile projectiles caught in its arc.'
        }
    }, {
        ironCleaver: DKAttackProfile('sweep', 19, 0, 1.9, 5, 0, 3, 'trail', 4, 92, .2)
    }, "weapons/unique/ironCleaver");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('ironCleaver', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=2.8; c.radius=108; c.knockback=4;
        }
    }, 'weapons/unique/iron-cleaver');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_ironCleaver(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#704522'; ctx.fillRect(5,
        -3, 23, 6); ctx.fillStyle='#bdc3c7'; ctx.beginPath(); ctx.moveTo(25, -5); ctx.lineTo(38, -14); ctx.lineTo(48,
        -9); ctx.lineTo(45, 11); ctx.lineTo(31, 13); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#555'; ctx.beginPath(); ctx.arc(39,
        4, 3, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('ironCleaver', render_ironCleaver, 'weapons/unique/iron-cleaver');
}
());

// ============================================================================
// 44 — DUELING TONGS
// Two quick steel jaws snap across offset lines. The crossing bite catches projectiles.
// Former module: weapons/unique/kitchen-tongs.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        kitchenTongs: {
            name: 'DUELING TONGS', icon: '⋔', category: 'MELEE', rarity: 'common', damage: 7.5, rate: 430,
            reach: 112, arc: .52, color: '#c7cbd1', price: 24, handler: 'tongs', deflect: true, desc: 'Two quick steel jaws snap across offset lines. The crossing bite catches projectiles.'
        }
    }, {
        kitchenTongs: DKAttackProfile('clamp', 14, 0, .31, 29, 0, 2, 'jaws', 4, 62, .27)
    }, "weapons/unique/kitchenTongs");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('kitchenTongs', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=.52; c.radius=112; c.knockback=4; c.attackAngle+=c.weapon.shots%2?-.18: .18; c.api.pushPending({
                frames: 5, kind: 'phaseEcho', x: c.player.x, y: c.player.y, angle: c.player.angle+(c.weapon.shots%2?.18: -.18),
                radius: c.radius, arc: c.arc, damage: c.damage*.62, color: '#eef2f4', sourceId: c.weapon.id
            });
        }
    }, 'weapons/unique/kitchen-tongs');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_kitchenTongs(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#704522'; ctx.fillRect(4,
        -4, 22, 8); ctx.strokeStyle=w.color; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(23, -3); ctx.quadraticCurveTo(39,
        -14, 57, -7); ctx.lineTo(64, -10); ctx.moveTo(23, 3); ctx.quadraticCurveTo(39, 14, 57, 7); ctx.lineTo(64,
        10); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(29, -4); ctx.lineTo(56,
        -7); ctx.moveTo(29, 4); ctx.lineTo(56, 7); ctx.stroke(); ctx.fillStyle='#85898d'; ctx.fillRect(58,
        -13, 8, 6); ctx.fillRect(58, 7, 8, 6);
    }
    DKRegister.weaponRenderer('kitchenTongs', render_kitchenTongs, 'weapons/unique/kitchen-tongs');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_kitchenTongs_10(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=4; for(var kt=-1; kt<=1; kt+=2){
            var kta=sl.angle+kt*.13; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(kta)*24, sl.y+Math.sin(kta)*24); ctx.quadraticCurveTo(sl.x+Math.cos(kta)*sl.radius*.58-kt*Math.sin(kta)*14,
            sl.y+Math.sin(kta)*sl.radius*.58+kt*Math.cos(kta)*14, sl.x+Math.cos(kta)*sl.radius, sl.y+Math.sin(kta)*sl.radius); ctx.stroke();
        }
        ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(sl.x+Math.cos(sl.angle)*sl.radius,
        sl.y+Math.sin(sl.angle)*sl.radius, 10, -1, 1); ctx.stroke();
    }
    DKRegister.slashRenderer('kitchenTongs', slashArt_kitchenTongs_10);
}
());

// ============================================================================
// 45 — GALE KITEBOW
// A cloth-limbed bow. A full draw catches wind, accelerates with distance, and bends toward prey.
// Former module: weapons/unique/kitebow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        kitebow: {
            name: 'GALE KITEBOW', icon: '⌁', category: 'ARCHER', rarity: 'common', damage: 6.2, rate: 520,
            speed: 13, charge: 600, color: '#8fc7b7', price: 27, handler: 'kitebow', desc: 'A cloth-limbed bow. A full draw catches wind, accelerates with distance, and bends toward prey.'
        }
    }, {
        kitebow: DKAttackProfile('draw', 18, 10, .075, 0, 2, 2, 'kiteTails', 5, 46, .57)
    }, "weapons/unique/kitebow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('kitebow', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; if(c.burstIndex===1){
                c.opts.distanceScale=true; c.opts.homing=.05; c.opts.speed*=1.18; c.opts.life=130; c.opts.type='kiteArrow';
            }
        }
    }, 'weapons/unique/kitebow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_kitebow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; bow('#6ba595',
        '#e8fff8'); ctx.strokeStyle=w.color; ctx.lineWidth=2; for(var kb=-1; kb<=1; kb+=2){
            ctx.beginPath(); ctx.moveTo(26, kb*15); ctx.lineTo(36, kb*21); ctx.lineTo(42, kb*14); ctx.closePath(); ctx.stroke(); ctx.fillStyle='rgba(143,199,183,.6)'; ctx.fill();
        }
        ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(45, 0); ctx.stroke(); ctx.fillStyle=w.color; ctx.beginPath(); ctx.moveTo(50,
        0); ctx.lineTo(40, -4); ctx.lineTo(42, 0); ctx.lineTo(40, 4); ctx.closePath(); ctx.fill();
    }
    DKRegister.weaponRenderer('kitebow', render_kitebow, 'weapons/unique/kitebow');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_kitebow_18(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#e9fff8'; ctx.beginPath(); ctx.moveTo(13,
        0); ctx.lineTo(-8, -3); ctx.lineTo(-4, 0); ctx.lineTo(-8, 3); ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-7,
        0); ctx.quadraticCurveTo(-14, -7, -20, 0); ctx.quadraticCurveTo(-14, 7, -8, 2); ctx.stroke();
    }
    DKRegister.projectileRenderer('kitebow', projectileArt_kitebow_18);
}
());

// ============================================================================
// 46 — LOTUS MINECASTER
// Plant an eighteen-mana bud in the floor or a foe. It opens into twelve piercing petals after a short, readable fuse.
// Former module: weapons/unique/lotus-minecaster.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        lotusMinecaster: {
            name: 'LOTUS MINECASTER', icon: '❀', category: 'MAGIC', rarity: 'epic', damage: 14, rate: 820,
            speed: 7, mana: 18, color: '#ff79c9', price: 126, handler: 'lotus', petalAccent: true, desc: 'Plant an eighteen-mana bud in the floor or a foe. It opens into twelve piercing petals after a short, readable fuse.'
        }
    }, {
        lotusMinecaster: DKAttackProfile('bloom', 24, 2, .3, 2, 18, 3, 'petals', 12, 69, .7)
    }, "weapons/unique/lotusMinecaster");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('lotusMinecaster', {
        configureProjectile: function(c){
            c.opts.lotus=true; c.opts.life=54; c.opts.radius=8; c.opts.type='lotusSeed'; c.opts.speed*=.86;
        }
    }, 'weapons/unique/lotus-minecaster');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_lotusMinecaster(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#3d2234'; ctx.fillRect(4,
        -4, 28, 8); ctx.strokeStyle='#8f5277'; ctx.strokeRect(4, -4, 28, 8); ctx.save(); ctx.translate(42,
        0); ctx.rotate(visualTick*.025); for(var lm=0; lm<8; lm++){
            ctx.rotate(TAU/8); ctx.fillStyle=lm%2?'#ffd8f1': w.color; ctx.beginPath(); ctx.ellipse(10+pulse*2,
            0, 12, 5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle='#fff0fa'; ctx.stroke();
        }
        ctx.fillStyle='#5b2446'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,
        0, 3+pulse, 0, TAU); ctx.fill(); ctx.restore(); ctx.strokeStyle='#7ed9a5'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(16,
        -4); ctx.quadraticCurveTo(23, -13, 31, -6); ctx.moveTo(16, 4); ctx.quadraticCurveTo(23, 13, 31, 6); ctx.stroke();
    }
    DKRegister.weaponRenderer('lotusMinecaster', render_lotusMinecaster, 'weapons/unique/lotus-minecaster');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_lotusMinecaster_46(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.1); ctx.fillStyle='#53143d'; ctx.beginPath(); ctx.arc(0,
        0, 8, 0, TAU); ctx.fill(); ctx.strokeStyle='#ffd8f1'; for(var lb=0; lb<6; lb++){
            ctx.rotate(TAU/6); ctx.beginPath(); ctx.ellipse(8, 0, 7, 3, 0, 0, TAU); ctx.stroke();
        }
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('lotusMinecaster', projectileArt_lotusMinecaster_46);
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_lotusPetal_47(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle=b.color; ctx.beginPath(); ctx.moveTo(13,
        0); ctx.quadraticCurveTo(0, -7, -9, 0); ctx.quadraticCurveTo(0, 7, 13, 0); ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(-5,
        0); ctx.lineTo(10, 0); ctx.stroke();
    }
    DKRegister.projectileRenderer('lotusPetal', projectileArt_lotusPetal_47);
}
());

// ============================================================================
// 47 — MARIONETTE CODEX
// A twenty-mana needle binds its victim to two nearby enemies. Direct damage echoes through the three violet strings for four seconds.
// Former module: weapons/unique/marionette-codex.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        marionetteCodex: {
            name: 'MARIONETTE CODEX', icon: '⌘', category: 'MAGIC', rarity: 'epic', damage: 16, rate: 760,
            speed: 9, mana: 20, color: '#caa7ff', price: 128, handler: 'marionette', desc: 'A twenty-mana needle binds its victim to two nearby enemies. Direct damage echoes through the three violet strings for four seconds.'
        }
    }, {
        marionetteCodex: DKAttackProfile('puppet', 23, 1, .34, 0, 17, 3, 'strings', 6, 73, .9)
    }, "weapons/unique/marionetteCodex");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('marionetteCodex', {
        configureProjectile: function(c){
            c.opts.marionette=true; c.opts.life=105; c.opts.radius=5; c.opts.type='threadNeedle'; c.opts.pierce=0;
        }
    }, 'weapons/unique/marionette-codex');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_marionetteCodex(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.save(); ctx.translate(31,
        0); ctx.rotate(Math.sin(visualTick*.04)*.07); ctx.fillStyle='#24172f'; ctx.strokeStyle='#caa7ff'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-25,
        -16); ctx.lineTo(-3, -11); ctx.lineTo(0, 14); ctx.lineTo(-24, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(25,
        -16); ctx.lineTo(3, -11); ctx.lineTo(0, 14); ctx.lineTo(24, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle='#eadfff'; ctx.lineWidth=1; for(var mt=-1; mt<=1; mt++){
            ctx.beginPath(); ctx.moveTo(-19, mt*5); ctx.lineTo(-5, mt*3); ctx.moveTo(5, mt*3); ctx.lineTo(19,
            mt*5); ctx.stroke();
        }
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0, 0, 4+pulse*2, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; for(var string=-1; string<=1; string++){
            ctx.beginPath(); ctx.moveTo(string*8, 12); ctx.bezierCurveTo(string*13, 23, string*21, 20, string*22,
            31); ctx.stroke(); ctx.fillStyle='#caa7ff'; ctx.beginPath(); ctx.arc(string*22, 31, 3, 0, TAU); ctx.fill();
        }
        ctx.restore();
    }
    DKRegister.weaponRenderer('marionetteCodex', render_marionetteCodex, 'weapons/unique/marionette-codex');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_marionetteCodex_48(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#f1e5ff'; ctx.beginPath(); ctx.moveTo(13,
        0); ctx.lineTo(-5, -4); ctx.lineTo(-1, 0); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#caa7ff'; ctx.lineWidth=2; ctx.stroke(); ctx.beginPath(); ctx.moveTo(-6,
        -8); ctx.quadraticCurveTo(1, 0, -6, 8); ctx.stroke();
    }
    DKRegister.projectileRenderer('marionetteCodex', projectileArt_marionetteCodex_48);
}
());

// ============================================================================
// 48 — MINERS PICK
// A lunging overhead strike. Every third hit cracks a damaging fault around its impact.
// Former module: weapons/unique/miners-pick.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        minersPick: {
            name: "MINER'S PICK", icon: '⌁', category: 'MELEE', rarity: 'common', damage: 14, rate: 610,
            reach: 105, arc: .62, color: '#aeb6bf', price: 24, handler: 'pick', desc: 'A lunging overhead strike. Every third hit cracks a damaging fault around its impact.'
        }
    }, {
        minersPick: DKAttackProfile('slam', 22, 0, 1.45, 24, 2, 3, 'shards', 5, 76, .6)
    }, "weapons/unique/minersPick");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('minersPick', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=.62; c.radius=105; c.knockback=7; c.player.x+=Math.cos(c.player.angle)*10; c.player.y+=Math.sin(c.player.angle)*10; if(c.weapon.shots%3===0){
                var x=c.player.x+Math.cos(c.player.angle)*c.radius*.8, y=c.player.y+Math.sin(c.player.angle)*c.radius*.8; c.damage*=1.65; c.api.explode(x,
                y, 62, c.damage*.65, true, '#f1c40f', '', false); c.api.addFloat('FAULT!', x, y-18, '#f1c40f');
            }
        }
    }, 'weapons/unique/miners-pick');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_minersPick(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.save(); ctx.rotate(-.22); ctx.fillStyle='#704522'; ctx.fillRect(5,
        -3, 39, 6); ctx.fillStyle='#aeb6bf'; ctx.beginPath(); ctx.moveTo(34, -5); ctx.quadraticCurveTo(42,
        -17, 57, -17); ctx.lineTo(50, -10); ctx.lineTo(42, -2); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(40,
        1); ctx.lineTo(53, 11); ctx.lineTo(44, 8); ctx.lineTo(35, 4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    DKRegister.weaponRenderer('minersPick', render_minersPick, 'weapons/unique/miners-pick');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_minersPick_6(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(sl.x, sl.y,
        sl.radius, sl.angle-.38, sl.angle+.38); ctx.stroke(); ctx.strokeStyle='#f1c40f'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(sl.angle)*sl.radius*.45,
        sl.y+Math.sin(sl.angle)*sl.radius*.45); ctx.lineTo(sl.x+Math.cos(sl.angle)*sl.radius*1.08, sl.y+Math.sin(sl.angle)*sl.radius*1.08); ctx.stroke();
    }
    DKRegister.slashRenderer('minersPick', slashArt_minersPick_6);
}
());

// ============================================================================
// 49 — MIRROR LANCE
// A long piercing thrust whose mirrored edge sends incoming shots back.
// Former module: weapons/unique/mirror-lance.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        mirrorLance: {
            name: 'MIRROR LANCE', icon: '◇', category: 'MELEE', rarity: 'rare', damage: 19, rate: 540, reach: 190,
            arc: .4, color: '#81ecec', price: 76, handler: 'lance', deflect: true, desc: 'A long piercing thrust whose mirrored edge sends incoming shots back.'
        }
    }, {
        mirrorLance: DKAttackProfile('thrust', 18, 0, .035, 38, 0, 3, 'prism', 4, 74, .9)
    }, "weapons/unique/mirrorLance");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('mirrorLance', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=.4; c.radius=190; c.knockback=7; c.player.x+=Math.cos(c.player.angle)*8; c.player.y+=Math.sin(c.player.angle)*8;
        }
    }, 'weapons/unique/mirror-lance');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_mirrorLance(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#3c5660'; ctx.fillRect(4,
        -3, 25, 6); ctx.fillStyle='#81ecec'; ctx.beginPath(); ctx.moveTo(24, -7); ctx.lineTo(49, -3); ctx.lineTo(58,
        0); ctx.lineTo(49, 3); ctx.lineTo(24, 7); ctx.lineTo(30, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.moveTo(33,
        -2); ctx.lineTo(54, 0); ctx.lineTo(33, 2); ctx.closePath(); ctx.fill(); ctx.fillStyle='#596f78'; ctx.fillRect(21,
        -8, 4, 16);
    }
    DKRegister.weaponRenderer('mirrorLance', render_mirrorLance, 'weapons/unique/mirror-lance');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_mirrorLance_8(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=10; ctx.globalAlpha*=.35; ctx.beginPath(); ctx.moveTo(sl.x+Math.cos(sl.angle)*18,
        sl.y+Math.sin(sl.angle)*18); ctx.lineTo(sl.x+Math.cos(sl.angle)*sl.radius, sl.y+Math.sin(sl.angle)*sl.radius); ctx.stroke(); ctx.globalAlpha=Math.sin(t*Math.PI); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
    }
    DKRegister.slashRenderer('mirrorLance', slashArt_mirrorLance_8);
}
());

// ============================================================================
// 50 — MOONHOOK
// Alternating side-hooks catch bullets and drag struck enemies toward the red knight.
// Former module: weapons/unique/moonhook.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        moonhook: {
            name: 'MOONHOOK', icon: '☽', category: 'MELEE', rarity: 'uncommon', damage: 12, rate: 520, reach: 138,
            arc: 1.5, color: '#57d3c3', price: 47, handler: 'hook', deflect: true, desc: 'Alternating side-hooks catch bullets and drag struck enemies toward the red knight.'
        }
    }, {
        moonhook: DKAttackProfile('hook', 20, 0, 1.5, 8, 0, 3, 'crescent', 5, 72, .8)
    }, "weapons/unique/moonhook");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('moonhook', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=2.05; c.radius=142; c.attackAngle+=c.weapon.shots%2?-.68: .68; c.knockback=-8;
        }
    }, 'weapons/unique/moonhook');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_moonhook(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#35534d'; ctx.fillRect(4,
        -3, 25, 6); ctx.strokeStyle='#8adfd2'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(27, 0); for(var mh=0; mh<4; mh++)ctx.lineTo(31+mh*5,
        Math.sin(visualTick*.09+mh)*3); ctx.stroke(); ctx.strokeStyle=w.color; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(50,
        0, 11, -1.15, 1.55); ctx.stroke(); ctx.strokeStyle='#eafffb'; ctx.lineWidth=2; ctx.stroke();
    }
    DKRegister.weaponRenderer('moonhook', render_moonhook, 'weapons/unique/moonhook');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_moonhook_7(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=3; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.arc(sl.x,
        sl.y, sl.radius, sl.angle-sl.arc/2, sl.angle+sl.arc/2); ctx.stroke(); ctx.setLineDash([]); var mhx=sl.x+Math.cos(sl.angle)*sl.radius,
        mhy=sl.y+Math.sin(sl.angle)*sl.radius; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(mhx, mhy, 14, sl.angle+.4,
        sl.angle+Math.PI*1.6); ctx.stroke();
    }
    DKRegister.slashRenderer('moonhook', slashArt_moonhook_7);
}
());

// ============================================================================
// 51 — MOSS CHARM
// Two mana releases a slow green wisp that seeks prey and plants a short poison.
// Former module: weapons/unique/moss-charm.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        mossCharm: {
            name: 'MOSS CHARM', icon: '❧', category: 'MAGIC', rarity: 'common', damage: 3.4, rate: 460, speed: 8,
            mana: 2, color: '#74b56b', price: 26, handler: 'moss', desc: 'Two mana releases a slow green wisp that seeks prey and plants a short poison.'
        }
    }, {
        mossCharm: DKAttackProfile('cast', 20, 1, .23, 1, 12, 2, 'moss', 5, 46, .56)
    }, "weapons/unique/mossCharm");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('mossCharm', {
        configureProjectile: function(c){
            c.opts.life=100; c.opts.radius=6; c.opts.type='seed'; c.opts.homing=.06; c.opts.status='poison';
        }
    }, 'weapons/unique/moss-charm');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_mossCharm(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4d5a35'; ctx.fillRect(4,
        -3, 25, 6); ctx.fillStyle='#31552e'; for(var mc=0; mc<5; mc++){
            var mca=mc*TAU/5; ctx.beginPath(); ctx.ellipse(34+Math.cos(mca)*9, Math.sin(mca)*9, 7, 3, mca,
            0, TAU); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle='#d4f5b4'; ctx.beginPath(); ctx.arc(34, 0, 4+pulse*2, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('mossCharm', render_mossCharm, 'weapons/unique/moss-charm');
}
());

// ============================================================================
// 52 — MOTHWING BOW
// Its arrow cocoon opens on impact into four pale moths seeking nearby prey.
// Former module: weapons/unique/mothwing-bow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        mothwingBow: {
            name: 'MOTHWING BOW', icon: '⋈', category: 'ARCHER', rarity: 'uncommon', damage: 6, rate: 590,
            speed: 13, charge: 620, color: '#b8e986', price: 52, handler: 'mothBow', desc: 'Its arrow cocoon opens on impact into four pale moths seeking nearby prey.'
        }
    }, {
        mothwingBow: DKAttackProfile('draw', 20, 8, .1, 0, 2, 1, 'moths', 5, 44, .3)
    }, "weapons/unique/mothwingBow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('mothwingBow', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=4; c.opts.color='#dfffb8'; c.opts.homing=.025; c.opts.splitSourceId='mothwingBow'; c.opts.splitType='moth'; c.opts.splitSpeed=9.5; c.opts.splitDamageScale=.45; c.opts.splitColor='#dff7b0'; c.opts.splitRadius=5; c.opts.splitHoming=.085; c.opts.splitLife=92;
        }
    }, 'weapons/unique/mothwing-bow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_mothwingBow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.strokeStyle='#6d9b50'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(25,
        -17); ctx.quadraticCurveTo(42, 0, 25, 17); ctx.stroke(); ctx.strokeStyle='#e9ffd4'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(27,
        -15); ctx.lineTo(40, 0); ctx.lineTo(27, 15); ctx.stroke(); ctx.fillStyle='#b8e986'; ctx.beginPath(); ctx.ellipse(18,
        -8, 10, 5, -.45, 0, TAU); ctx.ellipse(18, 8, 10, 5, .45, 0, TAU); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(19,
        0, 2+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('mothwingBow', render_mothwingBow, 'weapons/unique/mothwing-bow');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_mothwingBow_42(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(-Math.atan2(b.vy, b.vx)); ctx.fillStyle='#dff7b0'; ctx.globalAlpha=.88; var flap=2+Math.sin(b.age*.42)*3; ctx.beginPath(); ctx.ellipse(-4,
        -flap, 6, 3, -.5, 0, TAU); ctx.ellipse(4, -flap, 6, 3, .5, 0, TAU); ctx.ellipse(-3, flap, 4, 2, .5,
        0, TAU); ctx.ellipse(3, flap, 4, 2, -.5, 0, TAU); ctx.fill(); ctx.fillStyle='#5f7441'; ctx.fillRect(-1,
        -4, 2, 8);
    }
    DKRegister.projectileRenderer('mothwingBow', projectileArt_mothwingBow_42);
}
());

// ============================================================================
// 53 — OAK SHORTBOW
// Hold to draw. Full draws pierce and hit much harder.
// Former module: weapons/unique/oak-bow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        oakBow: {
            name: 'OAK SHORTBOW', icon: '➶', category: 'ARCHER', rarity: 'common', damage: 7, rate: 500,
            speed: 15, charge: 660, color: '#d4a15a', price: 26, handler: 'bow', desc: 'Hold to draw. Full draws pierce and hit much harder.'
        }
    }, {
        oakBow: DKAttackProfile('draw', 17, 10, .06, 0, 0, 0, 'leaves', 4, 34, .3)
    }, "weapons/unique/oakBow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('oakBow', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0;
        }
    }, 'weapons/unique/oak-bow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_oakBow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; bow('#9b6b37',
        '#e8d6b4'); ctx.fillStyle='#5b8c46'; ctx.beginPath(); ctx.ellipse(18, -15, 5, 2, -.6, 0, TAU); ctx.ellipse(18,
        15, 5, 2, .6, 0, TAU); ctx.fill(); ctx.strokeStyle='#d4a15a'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(38,
        0); ctx.stroke();
    }
    DKRegister.weaponRenderer('oakBow', render_oakBow, 'weapons/unique/oak-bow');
}
());

// ============================================================================
// 54 — ORACLE DECK
// Eighteen mana draws Ember, Frost, Storm, then Void—each card behaves differently.
// Former module: weapons/unique/oracle-deck.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        oracleDeck: {
            name: 'ORACLE DECK', icon: '▱', category: 'MAGIC', rarity: 'epic', damage: 16, rate: 430, speed: 10,
            mana: 18, color: '#ff9ff3', price: 118, handler: 'oracle', desc: 'Eighteen mana draws Ember, Frost, Storm, then Void—each card behaves differently.'
        }
    }, {
        oracleDeck: DKAttackProfile('fan', 20, 2, .42, 2, 16, 3, 'cards', 4, 58, .9)
    }, "weapons/unique/oracleDeck");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('oracleDeck', {
        configureProjectile: function(c){
            var fate=(c.weapon.shots-1)%4; c.opts.type='card'; c.opts.radius=7; c.opts.life=100; if(fate===0){
                c.opts.color='#ff6b35'; c.opts.status='burn'; c.opts.blast=35;
            } else if(fate===1){
                c.opts.color='#74b9ff'; c.opts.status='freeze'; c.opts.pierce=2;
            } else if(fate===2){
                c.opts.color='#ffe66d'; c.opts.homing=.08; c.opts.oracleStorm=true;
            } else{
                c.opts.color='#9b59b6'; c.opts.vortex=120; c.opts.blast=82; c.opts.speed*=.72; c.opts.life=115;
            }
        }
    }, 'weapons/unique/oracle-deck');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_oracleDeck(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#38273d'; ctx.fillRect(5,
        -4, 20, 8); for(var od=0; od<4; od++){
            ctx.save(); ctx.translate(29+od*4, 0); ctx.rotate(-.42+od*.28); ctx.fillStyle=['#ff6b35', '#74b9ff',
            '#ffe66d', '#9b59b6'][od]; ctx.fillRect(-5, -9, 10, 18); ctx.strokeStyle='#fff'; ctx.strokeRect(-5,
            -9, 10, 18); ctx.beginPath(); ctx.arc(0, 0, 2+pulse*.5, 0, TAU); ctx.stroke(); ctx.restore();
        }
    }
    DKRegister.weaponRenderer('oracleDeck', render_oracleDeck, 'weapons/unique/oracle-deck');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_oracleDeck_31(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle=b.color; ctx.fillRect(-7,
        -9, 14, 18); ctx.strokeStyle='#fff'; ctx.strokeRect(-7, -9, 14, 18); ctx.beginPath(); ctx.arc(0,
        0, 3, 0, TAU); ctx.stroke();
    }
    DKRegister.projectileRenderer('oracleDeck', projectileArt_oracleDeck_31);
}
());

// ============================================================================
// 55 — PAPER DART FAN
// Throws three folded darts; each curves gently toward a different nearby target.
// Former module: weapons/unique/paper-dart-fan.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        paperDartFan: {
            name: 'PAPER DART FAN', icon: '⌁', category: 'ARCHER', rarity: 'common', damage: 3.2, rate: 420,
            speed: 14, count: 3, spread: .42, color: '#f0e6d2', price: 25, handler: 'paperDart', desc: 'Throws three folded darts; each curves gently toward a different nearby target.'
        }
    }, {
        paperDartFan: DKAttackProfile('fan', 17, 2, .38, 3, 7, 2, 'paper', 3, 43, .41)
    }, "weapons/unique/paperDartFan");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('paperDartFan', {
        configureProjectile: function(c){
            c.opts.life=88; c.opts.radius=4; c.opts.type='paper'; c.opts.homing=.035+c.index*.008; c.opts.pierce=c.index===1?1: 0;
        }
    }, 'weapons/unique/paper-dart-fan');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_paperDartFan(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#5a4632'; ctx.fillRect(4,
        -3, 22, 6); for(var pd=-1; pd<=1; pd++){
            ctx.save(); ctx.translate(24, 0); ctx.rotate(pd*.32); ctx.fillStyle=pd?'#f0e6d2': '#fff'; ctx.beginPath(); ctx.moveTo(0,
            0); ctx.lineTo(32, -6); ctx.lineTo(25, 0); ctx.lineTo(32, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
        }
    }
    DKRegister.weaponRenderer('paperDartFan', render_paperDartFan, 'weapons/unique/paper-dart-fan');
}
());

// ============================================================================
// 56 — PARADOX SHOTGUN
// Seven clockshot pellets fly out, hang for a heartbeat, then reverse as faster seeking aftershots that may cut the wave twice.
// Former module: weapons/unique/paradox-shotgun.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        paradoxShotgun: {
            name: 'PARADOX SHOTGUN', icon: '↶', category: 'GUN', rarity: 'epic', damage: 4.2, rate: 690,
            speed: 12, count: 7, spread: .78, color: '#d98cff', price: 124, handler: 'paradox', desc: 'Seven clockshot pellets fly out, hang for a heartbeat, then reverse as faster seeking aftershots that may cut the wave twice.'
        }
    }, {
        paradoxShotgun: DKAttackProfile('rewind', 25, 18, .2, 3, 3, 3, 'clock', 7, 74, .4)
    }, "weapons/unique/paradoxShotgun");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('paradoxShotgun', {
        configureProjectile: function(c){
            c.opts.paradox=true; c.opts.paradoxPhase=0; c.opts.life=112; c.opts.radius=5; c.opts.type='paradoxPellet'; c.opts.knockback=1.5; c.opts.pierce=5;
        }
    }, 'weapons/unique/paradox-shotgun');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_paradoxShotgun(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#23182c'; ctx.beginPath(); ctx.moveTo(3,
        -9); ctx.lineTo(31, -12); ctx.lineTo(52, -7); ctx.lineTo(58, -3); ctx.lineTo(58, 3); ctx.lineTo(52,
        7); ctx.lineTo(31, 12); ctx.lineTo(3, 9); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#6d477e'; ctx.fillRect(8,
        8, 11, 12); ctx.save(); ctx.translate(33, 0); ctx.rotate(-visualTick*.045); ctx.fillStyle='#4d315c'; ctx.beginPath(); ctx.arc(0,
        0, 10, 0, TAU); ctx.fill(); ctx.strokeStyle='#f5d9ff'; ctx.lineWidth=2; ctx.stroke(); for(var ps=0; ps<7; ps++){
            var psa=ps*TAU/7; ctx.fillStyle=ps===Math.floor(visualTick/8)%7?'#fff': w.color; ctx.beginPath(); ctx.arc(Math.cos(psa)*6,
            Math.sin(psa)*6, 1.7, 0, TAU); ctx.fill();
        }
        ctx.restore(); ctx.strokeStyle='#d98cff'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(42, -5); ctx.lineTo(63,
        -3); ctx.moveTo(42, 5); ctx.lineTo(63, 3); ctx.stroke();
    }
    DKRegister.weaponRenderer('paradoxShotgun', render_paradoxShotgun, 'weapons/unique/paradox-shotgun');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_paradoxShotgun_45(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*(b.paradoxPhase===2?-.22: .12)); ctx.fillStyle=b.paradoxPhase===1?'#fff': b.color; ctx.beginPath(); for(var px=0; px<8; px++){
            var pa=px*TAU/8, pr=px%2?4: 8; if(px===0)ctx.moveTo(Math.cos(pa)*pr, Math.sin(pa)*pr); else ctx.lineTo(Math.cos(pa)*pr,
            Math.sin(pa)*pr);
        }
        ctx.closePath(); ctx.fill(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.arc(0, 0, 10+Math.sin(b.age*.3)*2,
        0, TAU); ctx.stroke();
    }
    DKRegister.projectileRenderer('paradoxShotgun', projectileArt_paradoxShotgun_45);
}
());

// ============================================================================
// 57 — PEBBLE CHOIR
// Three rune-pebbles sing outward, orbit through prey, then curve home to the caster.
// Former module: weapons/unique/pebble-choir.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        pebbleChoir: {
            name: 'PEBBLE CHOIR', icon: '∴', category: 'MAGIC', rarity: 'common', damage: 2.2, rate: 510,
            speed: 8, count: 3, mana: 2, color: '#9fb7c2', price: 27, handler: 'pebbleChoir', desc: 'Three rune-pebbles sing outward, orbit through prey, then curve home to the caster.'
        }
    }, {
        pebbleChoir: DKAttackProfile('orbit', 19, 1, 1.1, 3, 12, 3, 'pebbles', 3, 51, .42)
    }, "weapons/unique/pebbleChoir");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('pebbleChoir', {
        configureAngle: function(c){
            c.angle=c.baseAngle+(c.index-(c.count-1)/2)*.24;
        }, configureProjectile: function(c){
            c.opts.life=125; c.opts.radius=6+c.index; c.opts.type='runePebble'; c.opts.pierce=1; c.opts.returning=true; c.opts.returnAge=42+c.index*5; c.opts.homing=.025;
        }
    }, 'weapons/unique/pebble-choir');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_pebbleChoir(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4b3d33'; ctx.fillRect(4,
        -3, 30, 6); ctx.save(); ctx.translate(39, 0); ctx.rotate(visualTick*.045); for(var pcg=0; pcg<3; pcg++){
            ctx.rotate(TAU/3); ctx.fillStyle=pcg%2?'#e9f5f7': w.color; ctx.beginPath(); ctx.moveTo(11, -5); ctx.lineTo(18,
            -3); ctx.lineTo(21, 3); ctx.lineTo(13, 7); ctx.lineTo(8, 2); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(13,
            0); ctx.lineTo(18, 0); ctx.stroke();
        }
        ctx.fillStyle='#26343a'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.stroke(); ctx.restore();
    }
    DKRegister.weaponRenderer('pebbleChoir', render_pebbleChoir, 'weapons/unique/pebble-choir');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_pebbleChoir_10(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.12); ctx.fillStyle='#34464d'; ctx.beginPath(); ctx.moveTo(7,
        -5); ctx.lineTo(9, 2); ctx.lineTo(2, 8); ctx.lineTo(-7, 5); ctx.lineTo(-9, -3); ctx.lineTo(-2, -8); ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.arc(0,
        0, 3, 0, TAU); ctx.stroke();
    }
    DKRegister.projectileRenderer('pebbleChoir', projectileArt_pebbleChoir_10);
}
());

// ============================================================================
// 58 — TIN PEPPERBOX
// Four tiny barrels snap in sequence across a tight cone.
// Former module: weapons/unique/pepperbox.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        pepperbox: {
            name: 'TIN PEPPERBOX', icon: '⁙', category: 'GUN', rarity: 'common', damage: 1.9, rate: 470,
            speed: 13, count: 4, spread: .34, color: '#d6c4a1', price: 27, handler: 'pepperbox', desc: 'Four tiny barrels snap in sequence across a tight cone.'
        }
    }, {
        pepperbox: DKAttackProfile('rattle', 12, 10, .12, 1, 1, 1, 'pepper', 4, 37, .27)
    }, "weapons/unique/pepperbox");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('pepperbox', {
        configureProjectile: function(c){
            c.opts.life=72; c.opts.radius=3; c.opts.type='pepper'; c.opts.knockback=.7;
        }
    }, 'weapons/unique/pepperbox');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_pepperbox(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#54483a'; ctx.fillRect(4,
        -7, 30, 14); ctx.fillStyle='#8b765d'; ctx.fillRect(9, 7, 9, 11); ctx.strokeStyle=w.color; for(var pp=-1; pp<=1; pp+=2){
            ctx.fillRect(29, pp*5-2, 18, 4); ctx.fillRect(23, pp*2-2, 20, 4);
        }
        ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(24, 0, 6, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('pepperbox', render_pepperbox, 'weapons/unique/pepperbox');
}
());

// ============================================================================
// 59 — PHASE SMG
// Ghost rounds ignore stone. Every tenth shot becomes a wide five-body phase lance.
// Former module: weapons/unique/phase-smg.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        phaseSmg: {
            name: 'PHASE SMG', icon: '⋙', category: 'GUN', rarity: 'rare', damage: 3.8, rate: 92, speed: 19,
            spread: .15, color: '#8f8cff', price: 84, handler: 'phase', desc: 'Ghost rounds ignore stone. Every tenth shot becomes a wide five-body phase lance.'
        }
    }, {
        phaseSmg: DKAttackProfile('phase', 7, 5, .025, 5, 1, 1, 'afterimages', 5, 38, .7)
    }, "weapons/unique/phaseSmg");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('phaseSmg', {
        configureProjectile: function(c){
            c.opts.ghost=true; c.opts.type='phase'; c.opts.life=115; if(c.weapon.shots%10===0){
                c.opts.pierce=5; c.opts.radius=8; c.opts.damage*=1.5; c.opts.color='#ddd7ff';
            }
        }
    }, 'weapons/unique/phase-smg');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_phaseSmg(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.globalAlpha=.88; ctx.fillStyle='#272640'; ctx.beginPath(); ctx.moveTo(4,
        -7); ctx.lineTo(36, -10); ctx.lineTo(51, -4); ctx.lineTo(51, 4); ctx.lineTo(36, 10); ctx.lineTo(4,
        7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle=w.color; ctx.lineWidth=2; for(var ps=0; ps<3; ps++){
            ctx.globalAlpha=.28+ps*.22; ctx.strokeRect(11+ps*11, -5-ps, 18, 10+ps*2);
        }
        ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(43, 0, 3, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('phaseSmg', render_phaseSmg, 'weapons/unique/phase-smg');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_phaseSmg_8(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.globalAlpha=.72; ctx.fillStyle=b.color; for(var ph=0; ph<3; ph++){
            ctx.beginPath(); ctx.moveTo(10-ph*5, 0); ctx.lineTo(-2-ph*5, -5); ctx.lineTo(1-ph*5, 0); ctx.lineTo(-2-ph*5,
            5); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(12, 0); ctx.stroke();
    }
    DKRegister.projectileRenderer('phaseSmg', projectileArt_phaseSmg_8);
}
());

// ============================================================================
// 60 — PHOENIX FAN
// A full draw opens seven burning feather-arrows; perfect releases leave fire beneath every impact.
// Former module: weapons/unique/phoenix-fan.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        phoenixFan: {
            name: 'PHOENIX FAN', icon: '♧', category: 'ARCHER', rarity: 'epic', damage: 7.5, rate: 720, speed: 16,
            count: 7, spread: 1.05, charge: 820, color: '#ff7043', price: 119, handler: 'phoenixFan', desc: 'A full draw opens seven burning feather-arrows; perfect releases leave fire beneath every impact.'
        }
    }, {
        phoenixFan: DKAttackProfile('fan', 23, 3, .48, 4, 11, 3, 'feathers', 7, 76, .2)
    }, "weapons/unique/phoenixFan");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('phoenixFan', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; c.opts.status='burn'; c.opts.comet=c.power>1.45; c.opts.blast=c.power>1.45?44: 0;
        }
    }, 'weapons/unique/phoenix-fan');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_phoenixFan(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#5a251d'; ctx.fillRect(5,
        -3, 19, 6); ctx.save(); ctx.translate(23, 0); for(var pf=-3; pf<=3; pf++){
            ctx.rotate(pf===-3?-.75: .25); ctx.fillStyle=pf%2?'#ff7043': '#ffc05c'; ctx.beginPath(); ctx.moveTo(0,
            0); ctx.quadraticCurveTo(19, -7, 38, 0); ctx.quadraticCurveTo(18, 7, 0, 0); ctx.fill(); ctx.stroke();
        }
        ctx.restore(); ctx.fillStyle='#fff4c2'; ctx.beginPath(); ctx.arc(23, 0, 3+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('phoenixFan', render_phoenixFan, 'weapons/unique/phoenix-fan');
    // Extra projectile overlay for this weapon.
    function projectileOverlay_phoenixFan(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#ffdf7a'; ctx.beginPath(); ctx.moveTo(-3,
        0); ctx.quadraticCurveTo(-9, -9, -13, -5); ctx.quadraticCurveTo(-7, 0, -13, 5); ctx.quadraticCurveTo(-8,
        9, -3, 0); ctx.fill(); ctx.strokeStyle='#ff7043'; ctx.beginPath(); ctx.moveTo(-9, -5); ctx.lineTo(-5,
        0); ctx.lineTo(-9, 5); ctx.stroke();
    }
    DKRegister.projectileOverlay('phoenixFan', projectileOverlay_phoenixFan);
}
());

// ============================================================================
// 61 — POCKET MORTAR
// Lobs slow shells that burst through packed enemies. Keep your distance.
// Former module: weapons/unique/pocket-mortar.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        pocketMortar: {
            name: 'POCKET MORTAR', icon: '◉', category: 'GUN', rarity: 'uncommon', damage: 9, rate: 900,
            speed: 7, blast: 72, color: '#f39c12', price: 50, handler: 'mortar', desc: 'Lobs slow shells that burst through packed enemies. Keep your distance.'
        }
    }, {
        pocketMortar: DKAttackProfile('pump', 21, 19, .1, 4, 3, 0, 'smoke', 7, 48, .2)
    }, "weapons/unique/pocketMortar");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('pocketMortar', {
        configureProjectile: function(c){
            c.opts.type='shell'; c.opts.radius=6; c.opts.blast=c.weapon.blast; c.opts.life=68;
        }
    }, 'weapons/unique/pocket-mortar');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_pocketMortar(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#424242'; ctx.beginPath(); ctx.moveTo(5,
        -8); ctx.lineTo(35, -10); ctx.lineTo(43, -6); ctx.lineTo(43, 6); ctx.lineTo(35, 10); ctx.lineTo(5,
        7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle=w.color; ctx.fillRect(13, -6, 22, 12); ctx.fillStyle='#151515'; ctx.beginPath(); ctx.ellipse(40,
        0, 5, 7, 0, 0, TAU); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(16, -3, 2, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('pocketMortar', render_pocketMortar, 'weapons/unique/pocket-mortar');
}
());

// ============================================================================
// 62 — POLLEN CODEX
// Six mana releases three seeking seed-lights that bud once after tasting an enemy.
// Former module: weapons/unique/pollen-codex.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        pollenCodex: {
            name: 'POLLEN CODEX', icon: '❋', category: 'MAGIC', rarity: 'uncommon', damage: 4.5, rate: 520,
            speed: 8, count: 3, spread: .5, mana: 6, color: '#d7e35b', price: 50, handler: 'pollen', desc: 'Six mana releases three seeking seed-lights that bud once after tasting an enemy.'
        }
    }, {
        pollenCodex: DKAttackProfile('fan', 19, 1, .27, 2, 8, 2, 'seeds', 7, 47, .1)
    }, "weapons/unique/pollenCodex");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('pollenCodex', {
        configureProjectile: function(c){
            c.opts.type='seed'; c.opts.radius=5; c.opts.homing=.055; c.opts.life=105; c.opts.pollen=true;
        }
    }, 'weapons/unique/pollen-codex');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_pollenCodex(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.save(); ctx.translate(24,
        0); ctx.rotate(Math.sin(visualTick*.045)*.07); ctx.fillStyle='#354424'; ctx.fillRect(-14, -12, 28,
        24); ctx.fillStyle='#d7e35b'; ctx.fillRect(-12, -10, 11, 20); ctx.fillRect(1, -10, 11, 20); ctx.strokeStyle='#fff8b8'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,
        -10); ctx.lineTo(0, 10); for(var pc=0; pc<3; pc++){
            ctx.moveTo(-9, -5+pc*5); ctx.quadraticCurveTo(-5, -8+pc*5, -2, -5+pc*5); ctx.moveTo(2, -5+pc*5); ctx.quadraticCurveTo(6,
            -2+pc*5, 10, -5+pc*5);
        }
        ctx.stroke(); ctx.restore(); ctx.fillStyle='#fff8b8'; for(var ps=0; ps<3; ps++){
            var psa=visualTick*.05+ps*TAU/3; ctx.beginPath(); ctx.arc(41+Math.cos(psa)*7, Math.sin(psa)*7,
            2, 0, TAU); ctx.fill();
        }
    }
    DKRegister.weaponRenderer('pollenCodex', render_pollenCodex, 'weapons/unique/pollen-codex');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_pollenCodex_26(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.08); ctx.fillStyle='#d7e35b'; for(var po=0; po<4; po++){
            ctx.rotate(TAU/4); ctx.beginPath(); ctx.ellipse(4, 0, 5, 2, 0, 0, TAU); ctx.fill();
        }
        ctx.fillStyle='#fff8b8'; ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('pollenCodex', projectileArt_pollenCodex_26);
}
());

// ============================================================================
// 63 — PORTAL REPEATER
// Paired rounds emerge from moving side-portals, cross the aim line, then seek separate targets.
// Former module: weapons/unique/portal-repeater.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        portalRepeater: {
            name: 'PORTAL REPEATER', icon: '∞', category: 'GUN', rarity: 'epic', damage: 11, rate: 390, speed: 18,
            count: 2, color: '#b875ff', price: 126, handler: 'portalGun', desc: 'Paired rounds emerge from moving side-portals, cross the aim line, then seek separate targets.'
        }
    }, {
        portalRepeater: DKAttackProfile('phase', 15, 13, .1, 7, 4, 2, 'portals', 6, 64, .1)
    }, "weapons/unique/portalRepeater");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('portalRepeater', {
        configureProjectile: function(c){
            var side=c.index?1: -1, sideA=c.baseAngle+Math.PI/2; c.opts.x=c.player.x+Math.cos(c.baseAngle)*8+Math.cos(sideA)*side*46; c.opts.y=c.player.y+Math.sin(c.baseAngle)*8+Math.sin(sideA)*side*46; c.opts.angle=c.baseAngle-side*.13; c.opts.homing=.06; c.opts.pierce=1; c.opts.ghost=true; c.opts.life=118; c.opts.radius=6; c.opts.type='portalRound';
        }
    }, 'weapons/unique/portal-repeater');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_portalRepeater(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#261638'; ctx.beginPath(); ctx.moveTo(4,
        -8); ctx.lineTo(39, -11); ctx.lineTo(55, -5); ctx.lineTo(55, 5); ctx.lineTo(39, 11); ctx.lineTo(4,
        8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle=w.color; ctx.lineWidth=3; for(var prt=-1; prt<=1; prt+=2){
            ctx.beginPath(); ctx.ellipse(42, prt*10, 13+pulse*2, 5, 0, 0, TAU); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(42,
            prt*10, 2.5, 0, TAU); ctx.fill();
        }
        ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(13, -4); ctx.bezierCurveTo(25,
        -15, 31, 15, 48, 4); ctx.stroke();
    }
    DKRegister.weaponRenderer('portalRepeater', render_portalRepeater, 'weapons/unique/portal-repeater');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_portalRepeater_22(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(5,
        0, 4, 0, TAU); ctx.fill(); ctx.strokeStyle='#b875ff'; ctx.lineWidth=3; ctx.rotate(b.age*.08); ctx.beginPath(); ctx.ellipse(0,
        0, 12, 6, 0, 0, TAU); ctx.stroke(); ctx.rotate(Math.PI/2); ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(0,
        0, 9, 4, 0, 0, TAU); ctx.stroke();
    }
    DKRegister.projectileRenderer('portalRepeater', projectileArt_portalRepeater_22);
}
());

// ============================================================================
// 64 — PRISM MOTH CODEX
// Four glass moths hunt separate prey; their first taste refracts each moth into two smaller hunters.
// Former module: weapons/unique/prism-moth-codex.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        prismMothCodex: {
            name: 'PRISM MOTH CODEX', icon: '✧', category: 'MAGIC', rarity: 'rare', damage: 5, rate: 620,
            speed: 9, count: 4, spread: .55, mana: 12, color: '#b487e8', price: 82, handler: 'prismMoth',
            desc: 'Four glass moths hunt separate prey; their first taste refracts each moth into two smaller hunters.'
        }
    }, {
        prismMothCodex: DKAttackProfile('mothPage', 23, 1, .38, 2, 18, 4, 'mothGlass', 8, 76, .5)
    }, "weapons/unique/prismMothCodex");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('prismMothCodex', {
        configureProjectile: function(c){
            c.opts.type='prismMoth'; c.opts.radius=5; c.opts.life=110; c.opts.homing=.075+c.index*.007; c.opts.split=2; c.opts.prismMoth=true; c.opts.pierce=0; c.opts.splitSourceId='prismMothChild'; c.opts.splitType='prismMoth'; c.opts.splitSpeed=10.5; c.opts.splitDamageScale=.52; c.opts.splitColors=['#f2dcff',
            '#9de9ff']; c.opts.splitRadius=5; c.opts.splitHoming=.11; c.opts.splitLife=100; c.opts.splitPierce=1;
        }
    }, 'weapons/unique/prism-moth-codex');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_prismMothCodex(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.save(); ctx.translate(27,
        0); ctx.rotate(Math.sin(visualTick*.04)*.06); ctx.fillStyle='#241b31'; ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-20,
        -14); ctx.lineTo(-2, -10); ctx.lineTo(0, 13); ctx.lineTo(-20, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(20,
        -14); ctx.lineTo(2, -10); ctx.lineTo(0, 13); ctx.lineTo(20, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#e8d8ff'; for(var pmc=-1; pmc<=1; pmc+=2){
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(pmc*10, -10, pmc*17, -2); ctx.quadraticCurveTo(pmc*10,
            2, 0, 0); ctx.fill();
        }
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0, 0, 3+pulse, 0, TAU); ctx.fill(); ctx.restore(); for(var pmg=0; pmg<4; pmg++){
            var pmga=visualTick*.035+pmg*TAU/4; ctx.fillStyle=pmg%2?'#fff': w.color; ctx.beginPath(); ctx.arc(48+Math.cos(pmga)*8,
            Math.sin(pmga)*10, 2, 0, TAU); ctx.fill();
        }
    }
    DKRegister.weaponRenderer('prismMothCodex', render_prismMothCodex, 'weapons/unique/prism-moth-codex');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_prismMothCodex_16(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(Math.sin(b.age*.18)*.18); ctx.fillStyle=b.color; for(var pm=-1; pm<=1; pm+=2){
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-7, pm*9, -12, pm*4); ctx.quadraticCurveTo(-5,
            pm*2, 0, 0); ctx.fill();
        }
        ctx.fillStyle='#fff'; ctx.fillRect(-1, -5, 2, 10); ctx.beginPath(); ctx.arc(3, 0, 2, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('prismMothCodex', projectileArt_prismMothCodex_16); DKRegister.projectileRenderer('prismMothChild',
    projectileArt_prismMothCodex_16);
}
());

// ============================================================================
// 65 — PRISM RIFLE
// A piercing shard gains damage after every enemy it passes through.
// Former module: weapons/unique/prism-rifle.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        prismRifle: {
            name: 'PRISM RIFLE', icon: '◇', category: 'GUN', rarity: 'rare', damage: 7, rate: 460, speed: 19,
            pierce: 3, color: '#00d2d3', price: 76, handler: 'prism', desc: 'A piercing shard gains damage after every enemy it passes through.'
        }
    }, {
        prismRifle: DKAttackProfile('snap', 13, 14, .025, 4, 0, 0, 'prism', 6, 54, .1)
    }, "weapons/unique/prismRifle");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('prismRifle', {
        configureProjectile: function(c){
            c.opts.pierce=c.weapon.pierce; c.opts.prism=true; c.opts.radius=5;
        }
    }, 'weapons/unique/prism-rifle');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_prismRifle(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#263b40'; ctx.beginPath(); ctx.moveTo(4,
        -6); ctx.lineTo(28, -7); ctx.lineTo(35, -3); ctx.lineTo(28, 6); ctx.lineTo(4, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle=w.color; ctx.beginPath(); ctx.moveTo(22,
        -5); ctx.lineTo(46, 0); ctx.lineTo(22, 5); ctx.lineTo(28, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(26,
        0); ctx.lineTo(43, 0); ctx.stroke();
    }
    DKRegister.weaponRenderer('prismRifle', render_prismRifle, 'weapons/unique/prism-rifle');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_prismRifle_34(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.beginPath(); ctx.moveTo(11,
        0); ctx.lineTo(0, -6); ctx.lineTo(-8, 0); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(-5,
        0); ctx.lineTo(8, 0); ctx.stroke();
    }
    DKRegister.projectileRenderer('prismRifle', projectileArt_prismRifle_34);
    // Impact accent for this projectile.
    function impactArt_prismRifle(r){
        var b=r.projectile; r.api.addRing(r.x, r.y, '#fff', 28, 2);
    }
    DKRegister.projectileImpactRenderer('prismRifle', impactArt_prismRifle);
}
());

// ============================================================================
// 66 — RAILHOOK BOW
// A full-draw hook pins through one target and yanks it hard toward the red knight along a bright chain.
// Former module: weapons/unique/railhook-bow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        railhookBow: {
            name: 'RAILHOOK BOW', icon: '↣', category: 'ARCHER', rarity: 'rare', damage: 12, rate: 690, speed: 18,
            charge: 760, color: '#64c5d6', price: 80, handler: 'railhookBow', desc: 'A full-draw hook pins through one target and yanks it hard toward the red knight along a bright chain.'
        }
    }, {
        railhookBow: DKAttackProfile('chainDraw', 24, 16, .07, 0, 4, 3, 'links', 7, 82, .65)
    }, "weapons/unique/railhookBow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('railhookBow', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; c.opts.railhook=c.burstIndex===1; c.opts.pierce=Math.max(c.opts.pierce||0,
            c.burstIndex===1?1: 0); c.opts.life=125; c.opts.type='hookArrow';
        }
    }, 'weapons/unique/railhook-bow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_railhookBow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.strokeStyle='#315b65'; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(23,
        0, 24, -1.15, 1.15); ctx.stroke(); ctx.strokeStyle=w.color; ctx.lineWidth=2.5; ctx.stroke(); ctx.strokeStyle='#e7feff'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(31,
        -22); ctx.lineTo(21, 0); ctx.lineTo(31, 22); ctx.stroke(); for(var rhc=0; rhc<5; rhc++){
            ctx.beginPath(); ctx.arc(31+rhc*6, 0, 3, -1.15, 1.15); ctx.stroke();
        }
        ctx.fillStyle='#dffcff'; ctx.beginPath(); ctx.moveTo(61, 0); ctx.lineTo(48, -6); ctx.lineTo(51, -1); ctx.lineTo(41,
        -1); ctx.lineTo(41, 1); ctx.lineTo(51, 1); ctx.lineTo(48, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    DKRegister.weaponRenderer('railhookBow', render_railhookBow, 'weapons/unique/railhook-bow');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_railhookBow_20(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#dffcff'; ctx.beginPath(); ctx.moveTo(14,
        0); ctx.lineTo(2, -6); ctx.lineTo(5, -1); ctx.lineTo(-7, -1); ctx.lineTo(-7, 1); ctx.lineTo(5, 1); ctx.lineTo(2,
        6); ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke(); for(var hookLink=0; hookLink<3; hookLink++){
            ctx.beginPath(); ctx.arc(-10-hookLink*5, 0, 3, -1.1, 1.1); ctx.stroke();
        }
    }
    DKRegister.projectileRenderer('railhookBow', projectileArt_railhookBow_20);
}
());

// ============================================================================
// 67 — RAINMAKER
// Thirteen mana releases a sweeping rain of six homing droplets, each bursting into a chill splash.
// Former module: weapons/unique/rainmaker.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        rainmaker: {
            name: 'RAINMAKER', icon: '☂', category: 'MAGIC', rarity: 'rare', damage: 4.2, rate: 710, speed: 10,
            count: 6, spread: .9, mana: 13, color: '#55c7e8', price: 82, handler: 'rain', desc: 'Thirteen mana releases a sweeping rain of six homing droplets, each bursting into a chill splash.'
        }
    }, {
        rainmaker: DKAttackProfile('fan', 21, 2, .35, 3, 13, 2, 'rain', 6, 62, .1)
    }, "weapons/unique/rainmaker");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('rainmaker', {
        configureProjectile: function(c){
            c.opts.type='drop'; c.opts.radius=5; c.opts.homing=.045; c.opts.blast=30; c.opts.status='freeze'; c.opts.life=90;
        }
    }, 'weapons/unique/rainmaker');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_rainmaker(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#395762'; ctx.fillRect(5,
        -2, 25, 4); ctx.strokeStyle='#55c7e8'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(38, 0, 13, Math.PI,
        TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(51, 0); ctx.stroke(); ctx.fillStyle='#bcefff'; for(var rm=-1; rm<=1; rm++){
            ctx.beginPath(); ctx.moveTo(32+rm*8, 5); ctx.quadraticCurveTo(27+rm*8, 12, 32+rm*8, 15); ctx.quadraticCurveTo(37+rm*8,
            12, 32+rm*8, 5); ctx.fill();
        }
    }
    DKRegister.weaponRenderer('rainmaker', render_rainmaker, 'weapons/unique/rainmaker');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_rainmaker_41(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(-Math.atan2(b.vy, b.vx)); ctx.fillStyle='#65d6ff'; ctx.beginPath(); ctx.moveTo(0,
        -10); ctx.quadraticCurveTo(8, 1, 0, 9); ctx.quadraticCurveTo(-8, 1, 0, -10); ctx.fill(); ctx.strokeStyle='#e9fbff'; ctx.stroke();
    }
    DKRegister.projectileRenderer('rainmaker', projectileArt_rainmaker_41);
}
());

// ============================================================================
// 68 — REED CROSSBOW
// A patient single-bolt crossbow. Its woven reed quarrel punches through one extra foe.
// Former module: weapons/unique/reed-crossbow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        reedCrossbow: {
            name: 'REED CROSSBOW', icon: '〉', category: 'ARCHER', rarity: 'common', damage: 8, rate: 660,
            speed: 18, pierce: 1, color: '#b98b54', price: 29, handler: 'bolt', desc: 'A patient single-bolt crossbow. Its woven reed quarrel punches through one extra foe.'
        }
    }, {
        reedCrossbow: DKAttackProfile('snap', 13, 12, .04, 2, 0, 0, 'bolts', 3, 31, .9)
    }, "weapons/unique/reedCrossbow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('reedCrossbow', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.weapon.pierce||1;
        }
    }, 'weapons/unique/reed-crossbow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_reedCrossbow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#7d5a33'; ctx.fillRect(5,
        -3, 36, 6); ctx.strokeStyle='#b6d77b'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(25, -16); ctx.quadraticCurveTo(43,
        0, 25, 16); ctx.stroke(); ctx.strokeStyle='#ecf0c1'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(27,
        -14); ctx.lineTo(40, 0); ctx.lineTo(27, 14); ctx.stroke(); ctx.fillStyle='#b98b54'; ctx.beginPath(); ctx.moveTo(44,
        0); ctx.lineTo(34, -3); ctx.lineTo(34, 3); ctx.closePath(); ctx.fill();
    }
    DKRegister.weaponRenderer('reedCrossbow', render_reedCrossbow, 'weapons/unique/reed-crossbow');
    // Extra projectile overlay for this weapon.
    function projectileOverlay_reedCrossbow(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#7d5a33'; ctx.fillRect(-8,
        -1, 13, 2); ctx.fillStyle='#b6d77b'; ctx.beginPath(); ctx.moveTo(-7, -1); ctx.lineTo(-11, -5); ctx.lineTo(-9,
        0); ctx.lineTo(-11, 5); ctx.closePath(); ctx.fill();
    }
    DKRegister.projectileOverlay('reedCrossbow', projectileOverlay_reedCrossbow);
}
());

// ============================================================================
// 69 — RELAY PISTOL
// A blue relay gate folds every round forward once, skipping stone and attacking from a second muzzle flash.
// Former module: weapons/unique/relay-pistol.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        relayPistol: {
            name: 'RELAY PISTOL', icon: '⇥', category: 'GUN', rarity: 'uncommon', damage: 4.8, rate: 320,
            speed: 15, color: '#6ab7e8', price: 49, handler: 'relay', desc: 'A blue relay gate folds every round forward once, skipping stone and attacking from a second muzzle flash.'
        }
    }, {
        relayPistol: DKAttackProfile('blinkKick', 10, 9, .09, 6, 0, 2, 'gates', 4, 44, .76)
    }, "weapons/unique/relayPistol");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('relayPistol', {
        configureProjectile: function(c){
            c.opts.type='relayRound'; c.opts.radius=5; c.opts.life=110; c.opts.relay=true; c.opts.pierce=1;
        }
    }, 'weapons/unique/relay-pistol');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_relayPistol(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#243542'; ctx.beginPath(); ctx.moveTo(4,
        -7); ctx.lineTo(31, -8); ctx.lineTo(42, -3); ctx.lineTo(42, 3); ctx.lineTo(30, 8); ctx.lineTo(4,
        7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#4a5360'; ctx.fillRect(9, 7, 8, 10); for(var rpg=0; rpg<2; rpg++){
            ctx.strokeStyle=rpg?'#fff': w.color; ctx.lineWidth=3-rpg; ctx.beginPath(); ctx.ellipse(31+rpg*15,
            0, 8, 13, 0, 0, TAU); ctx.stroke();
        }
        ctx.fillStyle='#dff5ff'; ctx.beginPath(); ctx.arc(47, 0, 3+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('relayPistol', render_relayPistol, 'weapons/unique/relay-pistol');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_relayPistol_14(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#e9f8ff'; ctx.beginPath(); ctx.moveTo(11,
        0); ctx.lineTo(-4, -5); ctx.lineTo(0, 0); ctx.lineTo(-4, 5); ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.lineWidth=2; for(var relayRing=0; relayRing<2; relayRing++){
            ctx.beginPath(); ctx.ellipse(-3-relayRing*5, 0, 4, 8-relayRing*2, 0, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.projectileRenderer('relayPistol', projectileArt_relayPistol_14);
}
());

// ============================================================================
// 70 — RICOCHET SIX
// Rounds bounce off stone and seek a new angle. Each bounce adds damage.
// Former module: weapons/unique/ricochet-revolver.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        ricochetRevolver: {
            name: 'RICOCHET SIX', icon: '↗', category: 'GUN', rarity: 'uncommon', damage: 5, rate: 420, speed: 14,
            bounce: 3, color: '#16a085', price: 46, handler: 'bullet', desc: 'Rounds bounce off stone and seek a new angle. Each bounce adds damage.'
        }
    }, {
        ricochetRevolver: DKAttackProfile('roll', 14, 10, .16, 2, 0, 1, 'ricochet', 6, 39, .7)
    }, "weapons/unique/ricochetRevolver");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('ricochetRevolver', {
        configureProjectile: function(c){
            c.opts.bounce=c.weapon.bounce||0; c.opts.pierce=0;
        }
    }, 'weapons/unique/ricochet-revolver');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_ricochetRevolver(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#3c4b4b'; ctx.fillRect(4,
        -4, 23, 8); ctx.fillStyle=w.color; ctx.beginPath(); ctx.arc(19, 0, 8, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle='#163b37'; for(var rc=0; rc<6; rc++){
            var ra=rc*TAU/6; ctx.beginPath(); ctx.arc(19+Math.cos(ra)*4, Math.sin(ra)*4, 1.3, 0, TAU); ctx.fill();
        }
        ctx.fillRect(26, -2, 14, 4); ctx.fillStyle='#55402e'; ctx.fillRect(10, 5, 7, 10);
    }
    DKRegister.weaponRenderer('ricochetRevolver', render_ricochetRevolver, 'weapons/unique/ricochet-revolver');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_ricochetRevolver_33(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.16); ctx.beginPath(); for(var hx=0; hx<6; hx++){
            var ha=hx*TAU/6; var px=Math.cos(ha)*6, py=Math.sin(ha)*6; if(hx===0)ctx.moveTo(px, py); else ctx.lineTo(px,
            py);
        }
        ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('ricochetRevolver', projectileArt_ricochetRevolver_33);
    // Impact accent for this projectile.
    function impactArt_ricochetRevolver(r){
        var b=r.projectile; r.api.addRing(r.x, r.y, b.color, 22, 2);
    }
    DKRegister.projectileImpactRenderer('ricochetRevolver', impactArt_ricochetRevolver);
}
());

// ============================================================================
// 71 — RIFT RAIL: WORLDSEAM
// Rapidly tears the entire room, deletes bullets along its path, then repeats as two delayed parallel world-seams.
// Former module: weapons/unique/rift-rail.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        riftRail: {
            name: 'RIFT RAIL: WORLDSEAM', icon: '━', category: 'GUN', rarity: 'mythical', damage: 44, rate: 650,
            color: '#ff2f45', price: 168, handler: 'rail', cameraZoom: .88, desc: 'Rapidly tears the entire room, deletes bullets along its path, then repeats as two delayed parallel world-seams.'
        }
    }, {
        riftRail: DKAttackProfile('recoil', 29, 31, .08, 7, 3, 4, 'rift', 9, 126, .9)
    }, "weapons/unique/riftRail");
    // Mechanics hook: edit this block to change how this weapon behaves.
    function fireWorldseam(c, offset, damageScale, muzzle){
        var p=c.player, w=c.weapon, api=c.api, angle=c.angle, range=1900, sideX=Math.cos(angle+Math.PI/2)*(offset||0),
        sideY=Math.sin(angle+Math.PI/2)*(offset||0), sx=p.x+sideX, sy=p.y+sideY, ex=sx+Math.cos(angle)*range,
        ey=sy+Math.sin(angle)*range, color=offset?'#ff7388': w.color; api.addBeam(sx, sy, ex, ey, '#090207',
        offset?22: 32); api.addBeam(sx, sy, ex, ey, color, offset?10: 17); api.addBeam(sx, sy, ex, ey, '#fff',
        offset?2: 4); for(var rs=1; rs<=7; rs++){
            var rpx=sx+Math.cos(angle)*range*rs/8, rpy=sy+Math.sin(angle)*range*rs/8; api.addRing(rpx, rpy,
            rs%2?'#fff': color, 28+rs*4, 2);
        }
        var damage=w.damage*api.weaponLevelScale(w)*p.damageMultiplier()*(damageScale||1), enemies=api.enemies(); for(var ei=0; ei<enemies.length; ei++){
            var e=enemies[ei], vx=e.x-sx, vy=e.y-sy, along=vx*Math.cos(angle)+vy*Math.sin(angle), side=Math.abs(vx*Math.sin(angle)-vy*Math.cos(angle)); if(!e.dead&&along>0&&along<range&&side<e.radius+(offset?12: 20))api.damageEnemy(e,
            damage, {
                status: 'rift', direct: true, knockback: offset?3: 7, angle: angle
            });
        }
        var bullets=api.bullets(); for(var bi=0; bi<bullets.length; bi++){
            var b=bullets[bi]; if(b.dead||b.friendly)continue; var bvx=b.x-sx, bvy=b.y-sy, ba=bvx*Math.cos(angle)+bvy*Math.sin(angle),
            bs=Math.abs(bvx*Math.sin(angle)-bvy*Math.cos(angle)); if(ba>0&&ba<range&&bs<b.radius+(offset?14: 27)){
                b.dead=true; api.addParticles(b.x, b.y, color, 2, 2);
            }
        }
        api.biomeProps().forEach(function(prop){
            if(prop.dead)return; var pvx=prop.x-sx, pvy=prop.y-sy, pa=pvx*Math.cos(angle)+pvy*Math.sin(angle),
            ps=Math.abs(pvx*Math.sin(angle)-pvy*Math.cos(angle)); if(pa>0&&pa<range&&ps<prop.radius+18)api.hitBiomeProp(prop,
            w);
        }); if(muzzle){
            api.addRing(p.x+Math.cos(angle)*34, p.y+Math.sin(angle)*34, w.color, 92, 8); api.addWeaponFlash(w,
            p.x+Math.cos(angle)*42, p.y+Math.sin(angle)*42, angle);
        }
    }
    DKRegister.weaponBehavior('riftRail', {
        attack: function(c){
            fireWorldseam(c, 0, 1, !c.isEcho); if(!c.isEcho){
                c.api.pushPending({
                    frames: 8, kind: 'weaponHook', hook: 'riftEcho', weaponId: c.weapon.id, level: c.weapon.level,
                    ownerId: c.player.netId, payload: {
                        angle: c.angle, offset: -72, damageScale: .62, muzzle: false
                    }
                }); c.api.pushPending({
                    frames: 16, kind: 'weaponHook', hook: 'riftEcho', weaponId: c.weapon.id, level: c.weapon.level,
                    ownerId: c.player.netId, payload: {
                        angle: c.angle, offset: 72, damageScale: .62, muzzle: false
                    }
                });
            }
            return true;
        }, riftEcho: function(c){
            fireWorldseam(c, c.offset, c.damageScale, false); return true;
        }
    }, 'weapons/unique/rift-rail');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_riftRail(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#09070d'; ctx.beginPath(); ctx.moveTo(3,
        -8); ctx.lineTo(31, -12); ctx.lineTo(49, -8); ctx.lineTo(64, -3); ctx.lineTo(64, 3); ctx.lineTo(49,
        8); ctx.lineTo(31, 12); ctx.lineTo(3, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#5b2030'; ctx.stroke(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(12,
        -5); ctx.lineTo(58, -2); ctx.moveTo(12, 5); ctx.lineTo(58, 2); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(34,
        0, 4+pulse*2, 0, TAU); ctx.fill(); ctx.save(); ctx.translate(37, 0); ctx.rotate(visualTick*.06); for(var rrn=0; rrn<3; rrn++){
            ctx.rotate(TAU/3); ctx.strokeStyle=rrn===1?'#fff': w.color; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(0,
            0, 13+rrn*5, 4+rrn*2, 0, 0, TAU); ctx.stroke();
        }
        ctx.restore(); ctx.fillStyle='#f8e9ff'; ctx.beginPath(); ctx.moveTo(58, -3); ctx.lineTo(72, -8); ctx.lineTo(67,
        0); ctx.lineTo(72, 8); ctx.lineTo(58, 3); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.stroke();
    }
    DKRegister.weaponRenderer('riftRail', render_riftRail, 'weapons/unique/rift-rail');
    // Mythical/legendary attack aura belongs to this weapon module.
    function aura_riftRail(r){
        var ctx=r.ctx, p=r.player, w=r.weapon, q=r.progress, i=r.impact, v=r.visualTick, TAU=r.TAU; ctx.rotate(p.angle); for(var rs=-1; rs<=1; rs++){
            ctx.strokeStyle=rs===0?'#fff': w.color; ctx.lineWidth=rs===0?3: 7; ctx.beginPath(); ctx.moveTo(28,
            rs*12); ctx.lineTo(90+q*130, rs*12*(1+q)); ctx.stroke();
        }
        for(var rn=0; rn<5; rn++){
            ctx.strokeStyle=rn%2?'#fff': w.color; ctx.strokeRect(45+rn*24+q*30, -18-rn%2*5, 7, 36+rn%2*10);
        }
    }
    DKRegister.weaponAura('riftRail', aura_riftRail, 'weapons/unique/rift-rail');
}
());

// ============================================================================
// 72 — RIPTIDE ANCHOR
// Alternates crushing side-drags. Every third cast slams an undertow anchor ahead, pulling a crowd into a delayed tidal burst.
// Former module: weapons/unique/riptide-anchor.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        riptideAnchor: {
            name: 'RIPTIDE ANCHOR', icon: '⚓', category: 'MELEE', rarity: 'epic', damage: 26, rate: 700,
            reach: 164, arc: 2.8, color: '#50d9e8', price: 125, handler: 'anchor', deflect: true, desc: 'Alternates crushing side-drags. Every third cast slams an undertow anchor ahead, pulling a crowd into a delayed tidal burst.'
        }
    }, {
        riptideAnchor: DKAttackProfile('drag', 26, 0, 2.7, 9, 2, 5, 'waves', 8, 118, .2)
    }, "weapons/unique/riptideAnchor");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('riptideAnchor', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=3.35; c.radius=164; c.attackAngle+=c.weapon.shots%2?-.44: .44; c.knockback=-9; if(c.weapon.shots%3===0){
                var limit=c.api.arenaLimit(), x=c.api.clamp(c.player.x+Math.cos(c.player.angle)*155, -limit+50,
                limit-50), y=c.api.clamp(c.player.y+Math.sin(c.player.angle)*155, -limit+50, limit-50), field=c.api.field(x,
                y, 175, 'undertowAnchor', 112); field.damage=c.damage*.82; field.color=c.weapon.color; c.api.pushHazard(field); c.api.addRing(x,
                y, '#dffcff', 72, 5); c.api.addFloat('ANCHOR DOWN', x, y-32, c.weapon.color);
            }
        }
    }, 'weapons/unique/riptide-anchor');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_riptideAnchor(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#31525a'; ctx.fillRect(4,
        -4, 32, 8); ctx.strokeStyle='#bff8ff'; ctx.lineWidth=2; for(var ra=0; ra<5; ra++){
            ctx.beginPath(); ctx.arc(11+ra*6, 0, 4, -1.25, 1.25); ctx.stroke();
        }
        ctx.save(); ctx.translate(48, 0); ctx.rotate(Math.sin(visualTick*.055)*.12); ctx.strokeStyle=w.color; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(0,
        -17); ctx.lineTo(0, 17); ctx.moveTo(-18, 4); ctx.quadraticCurveTo(-15, 23, 0, 23); ctx.quadraticCurveTo(15,
        23, 18, 4); ctx.stroke(); ctx.fillStyle='#e6fdff'; ctx.beginPath(); ctx.arc(0, -17, 5, 0, TAU); ctx.fill(); ctx.strokeStyle='#195d69'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,
        0, 12, 0, TAU); ctx.stroke(); ctx.restore();
    }
    DKRegister.weaponRenderer('riptideAnchor', render_riptideAnchor, 'weapons/unique/riptide-anchor');
}
());

// ============================================================================
// 73 — RRHARIL
// Hold to bind up to five enemies at 900 range. The rite bites twice each second and opens a 55-damage abyss after only three seconds.
// Former module: weapons/unique/rrharil.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        rrharil: {
            name: "RRHAR'IL: THE OPEN EYE", icon: '▣', category: 'MAGIC', rarity: 'mythical', damage: 8,
            rate: 1000, manaPerSecond: 4, blast: 220, color: '#e61b5f', price: 180, handler: 'rrharil', ritualKnockback: 14,
            ritualBurstDamage: 20, ritualToast: "RRHAR'IL OPENS ITS EYE", desc: 'Hold to bind up to five enemies at 900 range. The rite bites twice each second and opens a 55-damage abyss after only three seconds.'
        }
    }, {
        rrharil: DKAttackProfile('channel', 30, 0, .2, 0, 24, 4, 'eye', 9, 112, .8)
    }, "weapons/unique/rrharil");
    // Mechanics hook: edit this block to change how this weapon behaves.
    // Full channel mechanic is module-owned. The engine only supplies generic combat primitives.
    function rrFindTargets(p, w, api){
        var ranked=[], enemies=api.enemies(); for(var i=0; i<enemies.length; i++){
            var e=enemies[i]; if(e.dead)continue; var dx=e.x-p.x, dy=e.y-p.y, d=Math.hypot(dx, dy); if(d>900)continue; var diff=Math.atan2(Math.sin(Math.atan2(dy,
            dx)-p.angle), Math.cos(Math.atan2(dy, dx)-p.angle)); if(Math.abs(diff)>1.35)continue; ranked.push({
                e: e, score: d+Math.abs(diff)*175
            });
        }
        ranked.sort(function(a, b){
            return a.score-b.score;
        }); var ids=[], limit=w.targetCount||5; for(var r=0; r<Math.min(limit, ranked.length); r++)ids.push(ranked[r].e.id); return ids;
    }
    function rrGetTargets(p, api){
        var result=[], enemies=api.enemies(); for(var i=0; i<p.rrTargetIds.length; i++){
            var id=p.rrTargetIds[i]; for(var j=0; j<enemies.length; j++){
                var e=enemies[j]; if(e.id===id&&!e.dead&&Math.hypot(e.x-p.x, e.y-p.y)<=930){
                    result.push(e); break;
                }
            }
        }
        return result;
    }
    function rrUpdate(c){
        var p=c.player, w=c.weapon, api=c.api, step=c.step; if(!c.firing){
            p.resetRrharil(); return true;
        }
        if(api.intervalElapsed(p, 'rrRetargetClock', step, 8)||!p.rrTargetIds.length)p.rrTargetIds=rrFindTargets(p,
        w, api); var targets=rrGetTargets(p, api); if(!targets.length){
            p.resetRrharil(); return true;
        }
        var drain=(w.manaPerSecond||3)*step/60; if(p.mana+1e-4<drain){
            p.resetRrharil(); if(api.gameTime()-p.lastManaWarn>700){
                p.lastManaWarn=api.gameTime(); api.showToast('NOT ENOUGH MANA', '#3498db');
            }
            return true;
        }
        p.mana-=drain; if(!p.rrActive)p.beginAttackAnimation(w, 1); p.rrActive=true; p.rrTime+=step; p.rrDamageTick+=step; p.attackAnim=Math.max(p.attackAnim,
        7); if(api.intervalElapsed(p, 'rrParticleClock', step, 5)){
            var chosen=targets[Math.floor(Math.random()*targets.length)], travel=api.rand(.15, .9), tx=p.x+(chosen.x-p.x)*travel,
            ty=p.y+(chosen.y-p.y)*travel; api.addParticles(tx, ty, api.chance(.3)?'#fff': '#e61b5f', 1, 1.4);
        }
        while(p.rrDamageTick>=30){
            p.rrDamageTick-=30; for(var pulse=0; pulse<targets.length; pulse++){
                var victim=targets[pulse]; if(victim.dead)continue; api.damageEnemy(victim, w.damage*api.weaponLevelScale(w)*p.damageMultiplier(),
                {
                    status: 'curse', direct: true, silent: targets.length>2
                }); var pullA=Math.atan2(p.y-victim.y, p.x-victim.x); victim.x+=Math.cos(pullA)*4; victim.y+=Math.sin(pullA)*4; api.addRing(victim.x,
                victim.y, pulse===0?'#fff': '#e61b5f', 34+p.rrTime*.12, 2);
            }
        }
        var ritualFrames=w.ritualFrames||180, ritualDamage=w.ritualDamage||55; if(p.rrTime>=ritualFrames){
            for(var bloom=0; bloom<targets.length; bloom++){
                var target=targets[bloom], away=Math.atan2(target.y-p.y, target.x-p.x); api.addDarkBloom(target.x,
                target.y, w.blast); api.addRing(target.x, target.y, bloom===0?'#fff': w.color, w.blast, 7); api.damageEnemy(target,
                ritualDamage*api.weaponLevelScale(w)*p.damageMultiplier(), {
                    status: 'curse', direct: true, knockback: w.ritualKnockback||9, angle: away
                });
            }
            if(targets[0])api.explode(targets[0].x, targets[0].y, w.blast, (w.ritualBurstDamage||12)*api.weaponLevelScale(w)*p.damageMultiplier(),
            true, w.color, 'curse', false); api.showToast(w.ritualToast||'THE VEIL OPENS', w.color); p.rrTime=0; p.rrDamageTick=0; p.rrTargetIds=rrFindTargets(p,
            w, api);
        }
        return true;
    }
    // World/channel visual is module-owned too.
    function drawRrharChannel(c){
        var p=c.player, ctx=c.ctx, TAU=c.TAU, visualTick=c.visualTick; if(!p.rrActive)return; var targets=rrGetTargets(p,
        c.api); if(!targets.length)return; var sx=p.x+Math.cos(p.angle)*27, sy=p.y+Math.sin(p.angle)*27,
        grow=Math.max(0, Math.min(1, p.rrTime/(c.weapon.ritualFrames||180))); ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.lineCap='round'; for(var ti=0; ti<targets.length; ti++){
            var target=targets[ti], dx=target.x-sx, dy=target.y-sy, len=Math.hypot(dx, dy)||1, nx=-dy/len,
            ny=dx/len; for(var t=0; t<3; t++){
                var wobble=Math.sin(visualTick*.11+t*1.7+ti)*((6+t*2)*(1+grow)); ctx.strokeStyle=t===0?'rgba(18,2,16,.96)': t===1?'#e61b5f': '#ffe1ea'; ctx.lineWidth=9-t*3; ctx.globalAlpha=.26+t*.18; ctx.beginPath(); ctx.moveTo(sx,
                sy); ctx.bezierCurveTo(sx+dx*.28+nx*wobble, sy+dy*.28+ny*wobble, sx+dx*.7-nx*wobble, sy+dy*.7-ny*wobble,
                target.x, target.y); ctx.stroke();
            }
            ctx.save(); ctx.translate(target.x, target.y); ctx.rotate(visualTick*.028*(ti%2?-1: 1)); ctx.globalAlpha=.78; ctx.strokeStyle=ti===0?'#fff': '#ff354d'; ctx.lineWidth=2; var roots=3+Math.floor(grow*5); for(var r=0; r<roots; r++){
                ctx.rotate(TAU/roots); ctx.beginPath(); ctx.moveTo(target.radius+2, 0); ctx.quadraticCurveTo(24+grow*18,
                -7-grow*6, 35+grow*27, Math.sin(visualTick*.09+r)*6); ctx.stroke();
            }
            for(var pip=0; pip<3; pip++){
                var pa=pip*TAU/3-Math.PI/2; ctx.fillStyle=pip<Math.floor(p.rrTime/60)?'#fff': '#4a1022'; ctx.beginPath(); ctx.arc(Math.cos(pa)*(target.radius+20),
                Math.sin(pa)*(target.radius+20), 3, 0, TAU); ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
    }
    DKRegister.weaponBehavior('rrharil', {
        updateFiring: rrUpdate, drawWorldEffect: drawRrharChannel
    }, 'weapons/unique/rrharil');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_rrharil(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.save(); ctx.translate(27,
        0); ctx.rotate(Math.sin(visualTick*.035)*.075); ctx.fillStyle='#0a0310'; ctx.strokeStyle='#6b1fc2'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-20,
        -16); ctx.lineTo(-2, -11); ctx.lineTo(0, 14); ctx.lineTo(-20, 11); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(20,
        -16); ctx.lineTo(2, -11); ctx.lineTo(0, 14); ctx.lineTo(20, 11); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#32104e'; ctx.beginPath(); ctx.moveTo(-17,
        -13); ctx.lineTo(-3, -9); ctx.lineTo(-2, 10); ctx.lineTo(-17, 8); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(17,
        -13); ctx.lineTo(3, -9); ctx.lineTo(2, 10); ctx.lineTo(17, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#cfa6ff'; ctx.lineWidth=1; for(var rrl=-1; rrl<=1; rrl++){
            ctx.beginPath(); ctx.moveTo(-14, -5+rrl*5); ctx.bezierCurveTo(-10, -9+rrl*5, -7, -1+rrl*5, -3,
            -5+rrl*5); ctx.moveTo(3, -5+rrl*5); ctx.bezierCurveTo(7, -1+rrl*5, 11, -9+rrl*5, 15, -5+rrl*5); ctx.stroke();
        }
        ctx.fillStyle='#e7c6ff'; ctx.beginPath(); ctx.ellipse(0, 0, 7+pulse*2, 4+pulse, 0, 0, TAU); ctx.fill(); ctx.fillStyle='#07030b'; ctx.beginPath(); ctx.arc(Math.sin(visualTick*.04)*2,
        0, 2.5, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=2; for(var rt=0; rt<5; rt++){
            var rty=-10+rt*5; ctx.beginPath(); ctx.moveTo(rt<2?-17: 17, rty*.45); ctx.bezierCurveTo((rt<2?-30: 30),
            rty-10, rt%2?-38: 38, rty+Math.sin(visualTick*.1+rt)*8, (rt<2?-43: 43), rty); ctx.stroke();
        }
        ctx.restore(); ctx.save(); ctx.translate(27, 0); ctx.rotate(-visualTick*.03); ctx.strokeStyle='#e7c6ff'; ctx.globalAlpha=.65; for(var rg=0; rg<5; rg++){
            ctx.rotate(TAU/5); ctx.strokeRect(24, -2, 5, 5);
        }
        ctx.restore();
    }
    DKRegister.weaponRenderer('rrharil', render_rrharil, 'weapons/unique/rrharil');
    // Mythical/legendary attack aura belongs to this weapon module.
    function aura_rrharil(r){
        var ctx=r.ctx, p=r.player, w=r.weapon, q=r.progress, i=r.impact, v=r.visualTick, TAU=r.TAU; ctx.rotate(p.angle); ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(54,
        0, 34+i*12, 13+i*6, 0, 0, TAU); ctx.stroke(); ctx.fillStyle='#090207'; ctx.beginPath(); ctx.arc(54,
        0, 10+i*5, 0, TAU); ctx.fill(); ctx.fillStyle=w.color; ctx.beginPath(); ctx.arc(54+Math.sin(v*.05)*4,
        0, 4+i*2, 0, TAU); ctx.fill();
    }
    DKRegister.weaponAura('rrharil', aura_rrharil, 'weapons/unique/rrharil');
}
());

// ============================================================================
// 74 — RUST PISTOL
// Reliable and free. At mastery, every fifth shot becomes a piercing double round.
// Former module: weapons/unique/rust-pistol.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        rustPistol: {
            name: 'RUST PISTOL', icon: '•', category: 'GUN', rarity: 'common', damage: 3, rate: 255, speed: 13,
            color: '#f1c40f', price: 0, handler: 'bullet', desc: 'Reliable and free. At mastery, every fifth shot becomes a piercing double round.'
        }
    }, {
        rustPistol: DKAttackProfile('snap', 9, 7, .045, 0, 0, 0, 'sparks', 3, 25, .1)
    }, "weapons/unique/rustPistol");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('rustPistol', {
        configureProjectile: function(c){
            c.opts.bounce=c.weapon.bounce||0; c.opts.pierce=(c.weapon.level>=3&&c.weapon.shots%5===0)?2: 0;
        }, afterVolley: function(c){
            if(c.weapon.level>=3&&c.weapon.shots%5===0){
                var o={
                    x: c.player.x, y: c.player.y, angle: c.angle+.08, speed: c.weapon.speed, damage: c.weapon.damage*c.scale*c.player.damageMultiplier(),
                    friendly: true, color: '#fff', pierce: 1, sourceId: c.weapon.id
                }; c.player.applyResonanceProjectile(o); c.api.pushBullet(o);
            }
        }
    }, 'weapons/unique/rust-pistol');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_rustPistol(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#555'; ctx.fillRect(5,
        -5, 24, 10); ctx.fillStyle='#8b5a2b'; ctx.fillRect(9, 5, 8, 10); ctx.fillStyle=w.color; ctx.fillRect(24,
        -3, 9, 6); ctx.fillStyle='#2b2b2b'; ctx.beginPath(); ctx.arc(14, 0, 3, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('rustPistol', render_rustPistol, 'weapons/unique/rust-pistol');
}
());

// ============================================================================
// 75 — SCATTERGUN
// Six pellets. Point-blank hits deal bonus damage and kick enemies away.
// Former module: weapons/unique/scattergun.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        scattergun: {
            name: 'SCATTERGUN', icon: '≋', category: 'GUN', rarity: 'common', damage: 2, rate: 610, speed: 10,
            count: 6, spread: .52, color: '#e67e22', price: 28, handler: 'scatter', desc: 'Six pellets. Point-blank hits deal bonus damage and kick enemies away.'
        }
    }, {
        scattergun: DKAttackProfile('pump', 15, 15, .08, 3, 0, 0, 'rays', 6, 34, .5)
    }, "weapons/unique/scattergun");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('scattergun', {
        beforeProjectileHit: function(c){
            if(Math.hypot(c.bullet.x-c.bullet.startX, c.bullet.y-c.bullet.startY)<125)c.damage*=1.75;
        }, configureProjectile: function(c){
            c.opts.life=58; c.opts.knockback=2.6; c.opts.type='orb';
        }
    }, 'weapons/unique/scattergun');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_scattergun(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#6f4326'; ctx.beginPath(); ctx.moveTo(3,
        -5); ctx.lineTo(18, -7); ctx.lineTo(24, -4); ctx.lineTo(16, 7); ctx.lineTo(4, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle=w.color; ctx.fillRect(17,
        -7, 24, 5); ctx.fillRect(17, 2, 24, 5); ctx.fillStyle='#222'; ctx.fillRect(35, -6, 7, 12);
    }
    DKRegister.weaponRenderer('scattergun', render_scattergun, 'weapons/unique/scattergun');
}
());

// ============================================================================
// 76 — SCRAP NAILER
// Rapid iron nails lodge in prey. Four nails rip outward together for a compact shatter.
// Former module: weapons/unique/scrap-nailer.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        scrapNailer: {
            name: 'SCRAP NAILER', icon: '▹', category: 'GUN', rarity: 'common', damage: 2.8, rate: 190, speed: 16,
            color: '#b8b0a2', price: 27, handler: 'nailer', desc: 'Rapid iron nails lodge in prey. Four nails rip outward together for a compact shatter.'
        }
    }, {
        scrapNailer: DKAttackProfile('rattle', 8, 5, .035, 0, 1, 0, 'nails', 4, 29, .8)
    }, "weapons/unique/scrapNailer");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('scrapNailer', {
        configureProjectile: function(c){
            c.opts.nailMark=true; c.opts.type='nail'; c.opts.radius=3; c.opts.life=105;
        }
    }, 'weapons/unique/scrap-nailer');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_scrapNailer(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#544f47'; ctx.fillRect(4,
        -7, 32, 14); ctx.fillStyle='#8e8373'; ctx.fillRect(8, 7, 9, 11); ctx.strokeStyle='#d9d5cc'; ctx.lineWidth=2; ctx.strokeRect(4,
        -7, 32, 14); for(var sn=0; sn<4; sn++){
            ctx.fillStyle=sn%2?'#ddd8ce': '#777168'; ctx.fillRect(16+sn*6, -2, 8, 4);
        }
        ctx.fillStyle=w.color; ctx.beginPath(); ctx.moveTo(35, -5); ctx.lineTo(48, 0); ctx.lineTo(35, 5); ctx.closePath(); ctx.fill();
    }
    DKRegister.weaponRenderer('scrapNailer', render_scrapNailer, 'weapons/unique/scrap-nailer');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_scrapNailer_3(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#d9d5cc'; ctx.fillRect(-8,
        -1.5, 17, 3); ctx.fillStyle='#555'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(3, -4); ctx.lineTo(3,
        4); ctx.closePath(); ctx.fill(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-8,
        4); ctx.stroke();
    }
    DKRegister.projectileRenderer('scrapNailer', projectileArt_scrapNailer_3);
}
());

// ============================================================================
// 77 — SPARK STAFF
// Six mana calls instant lightning through three nearby foes. Loves crowded waves.
// Former module: weapons/unique/spark-staff.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        sparkStaff: {
            name: 'SPARK STAFF', icon: 'ϟ', category: 'MAGIC', rarity: 'uncommon', damage: 6.5, rate: 540,
            mana: 6, color: '#45aaf2', price: 48, handler: 'chain', desc: 'Six mana calls instant lightning through three nearby foes. Loves crowded waves.'
        }
    }, {
        sparkStaff: DKAttackProfile('cast', 17, 1, .24, 0, 10, 1, 'lightning', 5, 49, .6)
    }, "weapons/unique/sparkStaff");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('sparkStaff', {
        attack: function(c){
            var first=c.api.closestEnemy(c.player.x, c.player.y, 470); if(!first){
                if(c.api.shopMode()){
                    var lx=c.player.x+Math.cos(c.angle)*420, ly=c.player.y+Math.sin(c.angle)*420; c.api.addLightning([{
                        x: c.player.x, y: c.player.y
                    }, {
                        x: lx, y: ly
                    }], c.weapon.color); c.api.addRing(lx, ly, c.weapon.color, 55, 3); c.api.addWeaponFlash(c.weapon,
                    c.player.x+Math.cos(c.angle)*28, c.player.y+Math.sin(c.angle)*28, c.angle);
                }
                return true;
            }
            var damage=c.weapon.damage*c.api.weaponLevelScale(c.weapon)*c.player.damageMultiplier(); c.api.chainLightning({
                x: c.player.x, y: c.player.y
            }, first, damage, 3, c.weapon.color, false); c.api.addWeaponFlash(c.weapon, c.player.x+Math.cos(c.angle)*28,
            c.player.y+Math.sin(c.angle)*28, c.angle); return true;
        }
    }, 'weapons/unique/spark-staff');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_sparkStaff(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4c3f58'; ctx.fillRect(5,
        -2, 27, 4); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(35,
        -8); ctx.lineTo(39, 1); ctx.lineTo(45, -7); ctx.stroke(); ctx.fillStyle='#dff9fb'; ctx.beginPath(); ctx.arc(38,
        1, 4+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('sparkStaff', render_sparkStaff, 'weapons/unique/spark-staff');
}
());

// ============================================================================
// 78 — SPLITVINE BOW
// The first hit buds into two seeking thorns. Full draws grow a third thorn.
// Former module: weapons/unique/splitvine-bow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        splitvineBow: {
            name: 'SPLITVINE BOW', icon: 'Y', category: 'ARCHER', rarity: 'uncommon', damage: 6, rate: 560,
            speed: 14, charge: 580, color: '#26de81', price: 45, handler: 'splitBow', desc: 'The first hit buds into two seeking thorns. Full draws grow a third thorn.'
        }
    }, {
        splitvineBow: DKAttackProfile('draw', 18, 9, .08, 0, 0, 0, 'leaves', 6, 42, .9)
    }, "weapons/unique/splitvineBow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('splitvineBow', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=c.power>1.45?3: 2; c.opts.splitSourceId='splitvineBow'; c.opts.splitType='arrow'; c.opts.splitSpeed=12; c.opts.splitDamageScale=.45; c.opts.splitColor='#26de81'; c.opts.splitRadius=4; c.opts.splitHoming=.035; c.opts.splitLife=70;
        }
    }, 'weapons/unique/splitvine-bow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_splitvineBow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; bow('#26de81',
        '#c8ffd7'); ctx.strokeStyle='#166b42'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(16, -12); ctx.quadraticCurveTo(8,
        -4, 16, 0); ctx.quadraticCurveTo(8, 5, 17, 12); ctx.stroke(); ctx.fillStyle='#26de81'; for(var sv=0; sv<4; sv++){
            ctx.beginPath(); ctx.ellipse(14, sv<2?-11+sv*7: 4+(sv-2)*7, 4, 2, sv%2?.6: -.6, 0, TAU); ctx.fill();
        }
    }
    DKRegister.weaponRenderer('splitvineBow', render_splitvineBow, 'weapons/unique/splitvine-bow');
    // Extra projectile overlay for this weapon.
    function projectileOverlay_splitvineBow(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#26de81'; ctx.beginPath(); ctx.ellipse(-2,
        -4, 4, 2, -.6, 0, TAU); ctx.ellipse(-2, 4, 4, 2, .6, 0, TAU); ctx.fill();
    }
    DKRegister.projectileOverlay('splitvineBow', projectileOverlay_splitvineBow);
}
());

// ============================================================================
// 79 — STARFALL VOLLEYGUN
// Five constellation bolts mark the floor; their crossing point receives a delayed falling star.
// Former module: weapons/unique/starfall-volleygun.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        starfallVolleygun: {
            name: 'STARFALL VOLLEYGUN', icon: '✦', category: 'GUN', rarity: 'epic', damage: 7.5, rate: 420,
            speed: 17, count: 5, spread: .3, starVolley: true, color: '#ac5cdb', price: 114, handler: 'volleygun',
            profileStarAccent: true, desc: 'Five constellation bolts mark the floor; their crossing point receives a delayed falling star.'
        }
    }, {
        starfallVolleygun: DKAttackProfile('fan', 22, 18, .31, 7, 8, 4, 'fallingStars', 10, 92, .46)
    }, "weapons/unique/starfallVolleygun");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('starfallVolleygun', {
        configureProjectile: function(c){
            c.opts.life=120; c.opts.radius=5; c.opts.type='starBolt'; c.opts.starMark=true; c.opts.starVolley=c.index===Math.floor(c.count/2); c.opts.homing=.025;
        }
    }, 'weapons/unique/starfall-volleygun');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_starfallVolleygun(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#281a3a'; ctx.beginPath(); ctx.moveTo(3,
        -9); ctx.lineTo(35, -12); ctx.lineTo(57, -8); ctx.lineTo(69, -3); ctx.lineTo(69, 3); ctx.lineTo(57,
        8); ctx.lineTo(35, 12); ctx.lineTo(3, 9); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.stroke(); ctx.fillStyle='#4e3864'; ctx.fillRect(10,
        8, 10, 14); for(var sv=-2; sv<=2; sv++){
            ctx.strokeStyle=sv?'#e9d2ff': '#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(42, sv*4); ctx.lineTo(70,
            sv*3); ctx.stroke(); ctx.fillStyle=sv%2?'#fff': w.color; ctx.beginPath(); ctx.arc(46+sv*3, sv*4,
            2+pulse, 0, TAU); ctx.fill();
        }
        ctx.save(); ctx.translate(33, 0); ctx.rotate(visualTick*.03); ctx.strokeStyle='#fff'; ctx.beginPath(); for(var st=0; st<5; st++){
            var sta=st*TAU/5, stb=(st*2%5)*TAU/5; if(!st)ctx.moveTo(Math.cos(sta)*10, Math.sin(sta)*10); ctx.lineTo(Math.cos(stb)*10,
            Math.sin(stb)*10);
        }
        ctx.stroke(); ctx.restore();
    }
    DKRegister.weaponRenderer('starfallVolleygun', render_starfallVolleygun, 'weapons/unique/starfall-volleygun');
}
());

// ============================================================================
// 80 — STARFORGE MINIGUN
// An uninterrupted star-bolt stream. Never overheats, but spends 0.5 mana per shot.
// Former module: weapons/unique/starforge-minigun.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        starforgeMinigun: {
            name: 'STARFORGE MINIGUN', icon: '✺', category: 'GUN', rarity: 'epic', damage: 5, rate: 68, speed: 17,
            spread: .2, mana: .5, color: '#a55eea', price: 112, handler: 'minigun', desc: 'An uninterrupted star-bolt stream. Never overheats, but spends 0.5 mana per shot.'
        }
    }, {
        starforgeMinigun: DKAttackProfile('rattle', 6, 4, .018, 0, 0, 0, 'stars', 5, 34, .9)
    }, "weapons/unique/starforgeMinigun");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('starforgeMinigun', {
        configureProjectile: function(c){
            c.opts.life=90; c.opts.radius=5;
        }
    }, 'weapons/unique/starforge-minigun');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_starforgeMinigun(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#30283a'; ctx.fillRect(4,
        -8, 27, 16); ctx.fillStyle=w.color; ctx.beginPath(); ctx.arc(20, 0, 8, 0, TAU); ctx.fill(); ctx.stroke(); ctx.save(); ctx.translate(27,
        0); ctx.rotate(visualTick*.22); ctx.fillStyle='#bbb'; for(var mg=0; mg<3; mg++){
            ctx.rotate(TAU/3); ctx.fillRect(0, -2, 22, 4);
        }
        ctx.restore(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(20, 0, 2+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('starforgeMinigun', render_starforgeMinigun, 'weapons/unique/starforge-minigun');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_starforgeMinigun_38(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.rotate(b.age*.28); ctx.beginPath(); for(var st=0; st<8; st++){
            var sr=st%2?3: 7; var sa=st*TAU/8; var sx=Math.cos(sa)*sr, sy=Math.sin(sa)*sr; if(st===0)ctx.moveTo(sx,
            sy); else ctx.lineTo(sx, sy);
        }
        ctx.closePath(); ctx.fill();
    }
    DKRegister.projectileRenderer('starforgeMinigun', projectileArt_starforgeMinigun_38);
}
());

// ============================================================================
// 81 — STORM GRIMOIRE
// Twelve mana drives a five-target forked lightning rite. Critical arcs stun briefly.
// Former module: weapons/unique/storm-grimoire.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        stormGrimoire: {
            name: 'STORM GRIMOIRE', icon: '☇', category: 'MAGIC', rarity: 'rare', damage: 7.5, rate: 650,
            mana: 12, color: '#54a0ff', price: 74, handler: 'storm', desc: 'Twelve mana drives a five-target forked lightning rite. Critical arcs stun briefly.'
        }
    }, {
        stormGrimoire: DKAttackProfile('cast', 22, 2, .32, 0, 15, 3, 'lightning', 7, 61, .5)
    }, "weapons/unique/stormGrimoire");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('stormGrimoire', {
        attack: function(c){
            var first=c.api.closestEnemy(c.player.x, c.player.y, 650); if(!first){
                if(c.api.shopMode()){
                    var lx=c.player.x+Math.cos(c.angle)*420, ly=c.player.y+Math.sin(c.angle)*420; c.api.addLightning([{
                        x: c.player.x, y: c.player.y
                    }, {
                        x: lx, y: ly
                    }], c.weapon.color); c.api.addRing(lx, ly, c.weapon.color, 55, 3); c.api.addWeaponFlash(c.weapon,
                    c.player.x+Math.cos(c.angle)*28, c.player.y+Math.sin(c.angle)*28, c.angle);
                }
                return true;
            }
            var damage=c.weapon.damage*c.api.weaponLevelScale(c.weapon)*c.player.damageMultiplier(); c.api.chainLightning({
                x: c.player.x, y: c.player.y
            }, first, damage, 5, c.weapon.color, true); c.api.addWeaponFlash(c.weapon, c.player.x+Math.cos(c.angle)*28,
            c.player.y+Math.sin(c.angle)*28, c.angle); return true;
        }
    }, 'weapons/unique/storm-grimoire');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_stormGrimoire(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.save(); ctx.translate(22,
        0); ctx.rotate(Math.sin(visualTick*.05)*.08); ctx.fillStyle='#402c57'; ctx.fillRect(-12, -11, 24,
        22); ctx.fillStyle=w.color; ctx.fillRect(-10, -9, 9, 18); ctx.fillRect(1, -9, 9, 18); ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,
        -9); ctx.lineTo(0, 9); ctx.moveTo(-7, -4); ctx.lineTo(-3, -4); ctx.moveTo(3, 4); ctx.lineTo(7, 4); ctx.stroke(); ctx.restore(); ctx.strokeStyle=w.color; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(35,
        -7); ctx.lineTo(40, 0); ctx.lineTo(35, 7); ctx.stroke();
    }
    DKRegister.weaponRenderer('stormGrimoire', render_stormGrimoire, 'weapons/unique/storm-grimoire');
}
());

// ============================================================================
// 82 — SUNSHARD MUSKET
// A single white-hot lance splinters sideways from every pierced target.
// Former module: weapons/unique/sunshard-musket.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        sunshardMusket: {
            name: 'SUNSHARD MUSKET', icon: '☀', category: 'GUN', rarity: 'rare', damage: 14, rate: 720, speed: 21,
            pierce: 4, color: '#44b5ed', price: 80, handler: 'sunshard', desc: 'A single white-hot lance splinters sideways from every pierced target.'
        }
    }, {
        sunshardMusket: DKAttackProfile('recoil', 20, 22, .055, 6, 2, 3, 'sunSplinters', 7, 86, .24)
    }, "weapons/unique/sunshardMusket");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('sunshardMusket', {
        configureProjectile: function(c){
            c.opts.life=135; c.opts.radius=6; c.opts.type='sunLance'; c.opts.pierce=c.weapon.pierce||4; c.opts.sunshard=true; c.opts.ghost=true;
        }
    }, 'weapons/unique/sunshard-musket');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_sunshardMusket(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#604821'; ctx.fillRect(3,
        -5, 47, 10); ctx.strokeStyle='#ffeab1'; ctx.strokeRect(3, -5, 47, 10); ctx.fillStyle='#d3b25b'; ctx.beginPath(); ctx.moveTo(14,
        4); ctx.lineTo(26, 5); ctx.lineTo(21, 19); ctx.lineTo(10, 16); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#fff8c7'; ctx.beginPath(); ctx.moveTo(73,
        0); ctx.lineTo(45, -7); ctx.lineTo(52, 0); ctx.lineTo(45, 7); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.stroke(); ctx.save(); ctx.translate(50,
        0); ctx.rotate(visualTick*.04); for(var ss=0; ss<8; ss++){
            ctx.rotate(TAU/8); ctx.strokeStyle=ss%2?'#fff': w.color; ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(15+pulse*3,
            0); ctx.stroke();
        }
        ctx.restore();
    }
    DKRegister.weaponRenderer('sunshardMusket', render_sunshardMusket, 'weapons/unique/sunshard-musket');
}
());

// ============================================================================
// 83 — TESLA RIFLE
// Every impact forks electricity into up to three nearby targets and briefly shocks the first.
// Former module: weapons/unique/tesla-rifle.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        teslaRifle: {
            name: 'TESLA RIFLE', icon: 'ϟ', category: 'GUN', rarity: 'rare', damage: 7.5, rate: 360, speed: 18,
            color: '#70e6ff', price: 81, handler: 'tesla', desc: 'Every impact forks electricity into up to three nearby targets and briefly shocks the first.'
        }
    }, {
        teslaRifle: DKAttackProfile('snap', 12, 12, .065, 2, 0, 0, 'lightning', 4, 47, .4)
    }, "weapons/unique/teslaRifle");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('teslaRifle', {
        configureProjectile: function(c){
            c.opts.tesla=true; c.opts.status='shock'; c.opts.type='tesla'; c.opts.radius=6; c.opts.life=110;
        }
    }, 'weapons/unique/tesla-rifle');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_teslaRifle(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#09212b'; ctx.beginPath(); ctx.moveTo(4,
        -8); ctx.lineTo(42, -10); ctx.lineTo(58, -4); ctx.lineTo(58, 4); ctx.lineTo(42, 10); ctx.lineTo(4,
        8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(12,
        3); ctx.lineTo(22, -5); ctx.lineTo(31, 5); ctx.lineTo(42, -6); ctx.lineTo(52, 0); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(29,
        0, 3+pulse*2, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('teslaRifle', render_teslaRifle, 'weapons/unique/tesla-rifle');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_teslaRifle_7(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#071b25'; ctx.beginPath(); ctx.arc(0,
        0, 7, 0, TAU); ctx.fill(); ctx.strokeStyle='#70e6ff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-12,
        3); ctx.lineTo(-5, -4); ctx.lineTo(1, 4); ctx.lineTo(7, -5); ctx.lineTo(13, 0); ctx.stroke(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,
        0, 2.5, 0, TAU); ctx.fill();
    }
    DKRegister.projectileRenderer('teslaRifle', projectileArt_teslaRifle_7);
}
());

// ============================================================================
// 84 — THUNDERHEAD BLUNDERBUSS
// Five storm pellets arrive with a single cloud-seed that lingers and chains lightning through its neighborhood.
// Former module: weapons/unique/thunderhead-blunderbuss.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        thunderheadBlunderbuss: {
            name: 'THUNDERHEAD BLUNDERBUSS', icon: '☁', category: 'GUN', rarity: 'rare', damage: 5.4, rate: 680,
            speed: 11, count: 5, spread: .72, color: '#69c9ed', price: 78, handler: 'thunderhead', desc: 'Five storm pellets arrive with a single cloud-seed that lingers and chains lightning through its neighborhood.'
        }
    }, {
        thunderheadBlunderbuss: DKAttackProfile('stormPump', 22, 19, .18, 3, 6, 3, 'clouds', 9, 72, .2)
    }, "weapons/unique/thunderheadBlunderbuss");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('thunderheadBlunderbuss', {
        configureProjectile: function(c){
            c.opts.type='stormPellet'; c.opts.radius=5; c.opts.life=72; c.opts.status='shock'; c.opts.knockback=2; c.opts.thunderCloud=c.index===Math.floor(c.count/2);
        }
    }, 'weapons/unique/thunderhead-blunderbuss');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_thunderheadBlunderbuss(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#233844'; ctx.beginPath(); ctx.moveTo(3,
        -10); ctx.lineTo(35, -13); ctx.lineTo(55, -8); ctx.lineTo(62, -3); ctx.lineTo(62, 3); ctx.lineTo(55,
        8); ctx.lineTo(35, 13); ctx.lineTo(3, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#4b5960'; ctx.fillRect(8,
        9, 11, 12); ctx.fillStyle=w.color; for(var thb=0; thb<4; thb++){
            ctx.beginPath(); ctx.arc(29+thb*7, -2+(thb%2)*5, 7, 0, TAU); ctx.fill(); ctx.stroke();
        }
        ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(32, -8); ctx.lineTo(39, 0); ctx.lineTo(46,
        -5); ctx.lineTo(52, 3); ctx.stroke();
    }
    DKRegister.weaponRenderer('thunderheadBlunderbuss', render_thunderheadBlunderbuss, 'weapons/unique/thunderhead-blunderbuss');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_thunderheadBlunderbuss_15(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#dff8ff'; ctx.beginPath(); ctx.arc(3,
        0, 5, 0, TAU); ctx.fill(); ctx.fillStyle='rgba(105,201,237,.55)'; ctx.beginPath(); ctx.arc(-2, -3,
        5, 0, TAU); ctx.arc(-4, 3, 4, 0, TAU); ctx.fill(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(-7,
        -2); ctx.lineTo(0, 1); ctx.lineTo(-4, 8); ctx.lineTo(5, 2); ctx.stroke();
    }
    DKRegister.projectileRenderer('thunderheadBlunderbuss', projectileArt_thunderheadBlunderbuss_15);
}
());

// ============================================================================
// 85 — TIDAL DRUMGUN
// A rotating water drum alternates pushing and pulling rounds, gathering a wave before it breaks.
// Former module: weapons/unique/tidal-drumgun.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        tidalDrumgun: {
            name: 'TIDAL DRUMGUN', icon: '≈', category: 'GUN', rarity: 'rare', damage: 5.2, rate: 170, speed: 15,
            bounce: 1, tideDrum: true, color: '#3aaed8', price: 78, handler: 'drumgun', desc: 'A rotating water drum alternates pushing and pulling rounds, gathering a wave before it breaks.'
        }
    }, {
        tidalDrumgun: DKAttackProfile('roll', 12, 10, .32, 3, 4, 2, 'tideDrum', 6, 55, .35)
    }, "weapons/unique/tidalDrumgun");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('tidalDrumgun', {
        configureProjectile: function(c){
            c.opts.life=110; c.opts.radius=6; c.opts.type='tideRound'; c.opts.bounce=c.weapon.bounce||1; c.opts.knockback=c.weapon.shots%2?5: -4; c.opts.status=c.weapon.shots%4===0?'freeze': '';
        }
    }, 'weapons/unique/tidal-drumgun');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_tidalDrumgun(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#243d48'; ctx.beginPath(); ctx.moveTo(3,
        -8); ctx.lineTo(32, -11); ctx.lineTo(52, -7); ctx.lineTo(63, -3); ctx.lineTo(63, 3); ctx.lineTo(52,
        7); ctx.lineTo(32, 11); ctx.lineTo(3, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.stroke(); ctx.fillStyle='#3b5963'; ctx.fillRect(8,
        8, 10, 13); ctx.save(); ctx.translate(34, 0); ctx.rotate(visualTick*.07); for(var td=0; td<6; td++){
            ctx.rotate(TAU/6); ctx.fillStyle=td%2?'#d9fbff': w.color; ctx.beginPath(); ctx.ellipse(9, 0,
            8, 3, 0, 0, TAU); ctx.fill();
        }
        ctx.restore(); ctx.strokeStyle='#d9fbff'; ctx.lineWidth=2; for(var tw=-1; tw<=1; tw++){
            ctx.beginPath(); ctx.moveTo(46, tw*5); ctx.bezierCurveTo(54, tw*10, 64, tw*0, 73, tw*5); ctx.stroke();
        }
    }
    DKRegister.weaponRenderer('tidalDrumgun', render_tidalDrumgun, 'weapons/unique/tidal-drumgun');
}
());

// ============================================================================
// 86 — TRIPWIRE BOW
// Perfect arrows plant pins. Every pair stretches a visible cutting wire that punishes enemies crossing it.
// Former module: weapons/unique/tripwire-bow.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        tripwireBow: {
            name: 'TRIPWIRE BOW', icon: '⋈', category: 'ARCHER', rarity: 'uncommon', damage: 7.5, rate: 640,
            speed: 16, charge: 650, color: '#83c786', price: 50, handler: 'tripwireBow', desc: 'Perfect arrows plant pins. Every pair stretches a visible cutting wire that punishes enemies crossing it.'
        }
    }, {
        tripwireBow: DKAttackProfile('pinDraw', 21, 13, .055, 0, 1, 2, 'wire', 4, 58, .61)
    }, "weapons/unique/tripwireBow");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('tripwireBow', {
        configureProjectile: function(c){
            c.opts.type='arrow'; c.opts.radius=4; c.opts.pierce=c.power>1.45?2: 0; c.opts.split=0; c.opts.tripwire=c.burstIndex===1; c.opts.pierce=Math.max(c.opts.pierce||0,
            1); c.opts.life=125; c.opts.type='wireArrow';
        }
    }, 'weapons/unique/tripwire-bow');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_tripwireBow(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; bow('#4d7250',
        '#d7ffe0'); ctx.fillStyle='#28442e'; ctx.beginPath(); ctx.arc(18, 0, 7, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.stroke(); for(var twp=-1; twp<=1; twp+=2){
            ctx.fillStyle='#d9e5da'; ctx.fillRect(26, twp*14-3, 9, 6); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(31,
            twp*14); ctx.lineTo(45, 0); ctx.stroke();
        }
        ctx.fillStyle=w.color; ctx.beginPath(); ctx.moveTo(51, 0); ctx.lineTo(40, -4); ctx.lineTo(43, 0); ctx.lineTo(40,
        4); ctx.closePath(); ctx.fill();
    }
    DKRegister.weaponRenderer('tripwireBow', render_tripwireBow, 'weapons/unique/tripwire-bow');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_tripwireBow_19(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#effff1'; ctx.beginPath(); ctx.moveTo(13,
        0); ctx.lineTo(-7, -4); ctx.lineTo(-3, 0); ctx.lineTo(-7, 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle=b.color; ctx.stroke(); ctx.fillStyle='#4b5d4c'; ctx.fillRect(-9,
        -6, 4, 12); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(-7, -6); ctx.lineTo(-7, 6); ctx.stroke();
    }
    DKRegister.projectileRenderer('tripwireBow', projectileArt_tripwireBow_19);
}
());

// ============================================================================
// 87 — RESONANT FORK
// A twin-prong cut rings twice: the second side echoes a heartbeat later and shocks what the first exposed.
// Former module: weapons/unique/tuning-fork.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        tuningFork: {
            name: 'RESONANT FORK', icon: 'Y', category: 'MELEE', rarity: 'uncommon', damage: 11, rate: 480,
            reach: 125, arc: .82, color: '#6ed6c8', price: 48, handler: 'tuningFork', deflect: true, status: 'shock',
            desc: 'A twin-prong cut rings twice: the second side echoes a heartbeat later and shocks what the first exposed.'
        }
    }, {
        tuningFork: DKAttackProfile('resonate', 20, 0, .58, 18, 0, 4, 'soundLines', 7, 78, .31)
    }, "weapons/unique/tuningFork");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('tuningFork', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=1.05; c.radius=125; c.knockback=3.5; c.attackAngle+=c.weapon.shots%2?-.28: .28; c.api.pushPending({
                frames: 10, kind: 'phaseEcho', x: c.player.x, y: c.player.y, angle: c.player.angle+(c.weapon.shots%2?.48: -.48),
                radius: c.radius+18, arc: c.arc+.32, damage: c.damage*.68, color: '#d8fffa', sourceId: c.weapon.id
            });
        }
    }, 'weapons/unique/tuning-fork');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_tuningFork(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#49645f'; ctx.fillRect(4,
        -4, 28, 8); ctx.strokeStyle=w.color; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(30, 0); ctx.quadraticCurveTo(40,
        0, 43, -8); ctx.lineTo(43, -24); ctx.moveTo(30, 0); ctx.quadraticCurveTo(40, 0, 43, 8); ctx.lineTo(43,
        24); ctx.stroke(); ctx.strokeStyle='#eafffb'; ctx.lineWidth=1.5; for(var tfw=0; tfw<3; tfw++){
            ctx.beginPath(); ctx.arc(45, 0, 11+tfw*6, -.72, .72); ctx.stroke();
        }
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(31, 0, 3+pulse, 0, TAU); ctx.fill();
    }
    DKRegister.weaponRenderer('tuningFork', render_tuningFork, 'weapons/unique/tuning-fork');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_tuningFork_12(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=5; for(var tfs=-1; tfs<=1; tfs+=2){
            ctx.beginPath(); ctx.arc(sl.x, sl.y, sl.radius+tfs*10, sl.angle-sl.arc/2+tfs*.08, sl.angle+sl.arc/2+tfs*.08); ctx.stroke();
        }
        ctx.strokeStyle='#fff'; ctx.lineWidth=1.5; for(var tfw=0; tfw<3; tfw++){
            ctx.beginPath(); ctx.arc(sl.x+Math.cos(sl.angle)*sl.radius*.68, sl.y+Math.sin(sl.angle)*sl.radius*.68,
            12+tfw*10, 0, TAU); ctx.stroke();
        }
    }
    DKRegister.slashRenderer('tuningFork', slashArt_tuningFork_12);
}
());

// ============================================================================
// 88 — UNDERTAKER SHOVEL
// Heavy grave-digging slams. Every third burial raises a marked mound that erupts into spectral spades.
// Former module: weapons/unique/undertaker-shovel.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        undertakerShovel: {
            name: 'UNDERTAKER SHOVEL', icon: '♠', category: 'MELEE', rarity: 'rare', damage: 18, rate: 610,
            reach: 145, arc: 1.7, color: '#8e89a8', price: 77, handler: 'shovel', deflect: true, desc: 'Heavy grave-digging slams. Every third burial raises a marked mound that erupts into spectral spades.'
        }
    }, {
        undertakerShovel: DKAttackProfile('burialSlam', 25, 0, 1.52, 31, 3, 4, 'graveDust', 7, 104, .35)
    }, "weapons/unique/undertakerShovel");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('undertakerShovel', {
        attack: function(c){
            c.player.performMelee(c.weapon); return true;
        }, configureMelee: function(c){
            c.arc=1.7; c.radius=145; c.knockback=8; c.attackAngle+=c.weapon.shots%2?-.32: .32; if(c.weapon.shots%3===0){
                var limit=c.api.arenaLimit(), x=c.api.clamp(c.player.x+Math.cos(c.player.angle)*132, -limit+50,
                limit-50), y=c.api.clamp(c.player.y+Math.sin(c.player.angle)*132, -limit+50, limit-50), field=c.api.field(x,
                y, 104, 'graveMound', 105); field.damage=c.damage*.82; field.color=c.weapon.color; c.api.pushHazard(field); c.api.addFloat('BURIAL MARK',
                x, y-35, c.weapon.color);
            }
        }
    }, 'weapons/unique/undertaker-shovel');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_undertakerShovel(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#5f4938'; ctx.fillRect(4,
        -3, 42, 6); ctx.fillStyle='#aaa5b9'; ctx.beginPath(); ctx.moveTo(43, -5); ctx.lineTo(55, -13); ctx.lineTo(67,
        -8); ctx.lineTo(69, 0); ctx.lineTo(67, 8); ctx.lineTo(55, 13); ctx.lineTo(43, 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle='#393547'; ctx.beginPath(); ctx.arc(56,
        0, 6, 0, TAU); ctx.fill(); ctx.strokeStyle=w.color; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(51,
        -4); ctx.lineTo(62, 4); ctx.moveTo(62, -4); ctx.lineTo(51, 4); ctx.stroke();
    }
    DKRegister.weaponRenderer('undertakerShovel', render_undertakerShovel, 'weapons/unique/undertaker-shovel');
    // Melee slash art lives beside the weapon mechanics.
    function slashArt_undertakerShovel_14(r){
        var ctx=r.ctx, sl=r.slash, t=r.t, TAU=r.TAU; ctx.lineWidth=8; ctx.beginPath(); ctx.arc(sl.x, sl.y,
        sl.radius, sl.angle-sl.arc/2, sl.angle+sl.arc/2); ctx.stroke(); ctx.strokeStyle='#e9e5ff'; ctx.lineWidth=2; ctx.stroke(); var usx=sl.x+Math.cos(sl.angle)*sl.radius,
        usy=sl.y+Math.sin(sl.angle)*sl.radius; ctx.fillStyle=sl.color; ctx.beginPath(); ctx.ellipse(usx,
        usy, 18, 8, sl.angle, 0, TAU); ctx.fill(); ctx.strokeStyle='#fff'; ctx.stroke();
    }
    DKRegister.slashRenderer('undertakerShovel', slashArt_undertakerShovel_14);
}
());

// ============================================================================
// 89 — VOID LANTERN
// Fourteen mana creates a crawling gravity orb that drags enemies inward before collapsing.
// Former module: weapons/unique/void-lantern.js
// ============================================================================
(function(){
    'use strict'; DKRegister.weapons({
        voidLantern: {
            name: 'VOID LANTERN', icon: '◌', category: 'MAGIC', rarity: 'rare', damage: 14, rate: 850, speed: 5,
            mana: 14, blast: 125, color: '#8e44ad', price: 78, handler: 'vortex', desc: 'Fourteen mana creates a crawling gravity orb that drags enemies inward before collapsing.'
        }
    }, {
        voidLantern: DKAttackProfile('channel', 24, 1, .2, 0, 17, 2, 'void', 7, 68, .4)
    }, "weapons/unique/voidLantern");
    // Mechanics hook: edit this block to change how this weapon behaves.
    DKRegister.weaponBehavior('voidLantern', {
        configureProjectile: function(c){
            c.opts.vortex=135; c.opts.blast=c.weapon.blast; c.opts.radius=9; c.opts.life=100;
        }
    }, 'weapons/unique/void-lantern');
    // Held-weapon art lives with the weapon content, not in game.js.
    function render_voidLantern(r){
        var ctx=r.ctx, w=r.weapon, pulse=r.pulse, visualTick=r.visualTick, TAU=r.TAU, bow=r.bow; ctx.fillStyle='#4a3b32'; ctx.fillRect(5,
        -2, 20, 4); ctx.strokeStyle=w.color; ctx.lineWidth=3; ctx.strokeRect(24, -10, 17, 20); ctx.beginPath(); ctx.arc(32.5,
        -10, 6, Math.PI, TAU); ctx.stroke(); ctx.fillStyle='#08040c'; ctx.beginPath(); ctx.arc(32, 0, 7,
        0, TAU); ctx.fill(); ctx.strokeStyle='#d7a9ff'; ctx.beginPath(); ctx.arc(32, 0, 4+pulse*2, 0, TAU); ctx.stroke();
    }
    DKRegister.weaponRenderer('voidLantern', render_voidLantern, 'weapons/unique/void-lantern');
    // Projectile art lives beside the weapon mechanics.
    function projectileArt_voidLantern_35(r){
        var ctx=r.ctx, b=r.projectile, TAU=r.TAU, visualTick=r.visualTick; ctx.fillStyle='#09050d'; ctx.beginPath(); ctx.arc(0,
        0, b.radius+2, 0, TAU); ctx.fill(); ctx.strokeStyle=b.color; ctx.rotate(b.age*.05); ctx.beginPath(); ctx.ellipse(0,
        0, b.radius+7, b.radius+2, 0, 0, TAU); ctx.stroke(); ctx.rotate(Math.PI/2); ctx.beginPath(); ctx.ellipse(0,
        0, b.radius+5, b.radius+1, 0, 0, TAU); ctx.stroke();
    }
    DKRegister.projectileRenderer('voidLantern', projectileArt_voidLantern_35);
}
());

(function(){'use strict';DKRegister.weapons({
        powderKegCannon: { name: 'POWDER-KEG CANNON', icon: '●', category: 'GUN', rarity: 'common', family: 'dawnstar', damage: 8, rate: 820, speed: 7, blast: 46, color: '#b4834d', price: 30, handler: 'familyCannon', fragments: 0, desc: 'The first Dawnstar-family cannon. Slow iron shells reward packed targets.' },
        twinFuseCannon: { name: 'TWIN-FUSE CANNON', icon: '◉', category: 'GUN', rarity: 'uncommon', family: 'dawnstar', damage: 6.8, rate: 760, speed: 8, count: 2, spread: .2, blast: 52, color: '#d39c51', price: 54, handler: 'familyCannon', fragments: 0, desc: 'A split breech sends two offset shells into the same crowd.' },
        solarHowitzer: { name: 'SOLAR HOWITZER', icon: '☀', category: 'GUN', rarity: 'rare', family: 'dawnstar', damage: 15, rate: 850, speed: 8, blast: 86, color: '#ffc857', price: 84, handler: 'familyCannon', fragments: 4, desc: 'Its shell blooms into four smaller sun-shards after the main explosion.' },
        heliosBombard: { name: 'HELIOS BOMBARD', icon: '☀', category: 'GUN', rarity: 'epic', family: 'dawnstar', damage: 20, rate: 900, speed: 9, blast: 112, color: '#ffd65a', price: 128, handler: 'familyCannon', fragments: 7, familyClear: true, desc: 'A miniature sun-shell clears hostile bullets and scatters seven seeking rays.' },
        dawnstarCannon: { name: 'DAWNSTAR CANNON: FIRST LIGHT', icon: '☀', category: 'GUN', rarity: 'legendary', family: 'dawnstar', damage: 18, rate: 760, speed: 10, blast: 72, color: '#ffd75e', price: 150, handler: 'dawnstar', desc: 'Launch a miniature dawn. Its first impact blooms into eight piercing sun-rays and leaves a brief field of cleansing light.' }
    },{
        powderKegCannon:DKAttackProfile('recoil',21,20,.095,3,2,1,'smoke',6,58,.32),
        twinFuseCannon:DKAttackProfile('doubleKick',22,22,.14,4,3,1,'fuses',7,62,.36),
        solarHowitzer:DKAttackProfile('recoil',25,24,.18,5,5,2,'sunshards',8,74,.4),
        heliosBombard:DKAttackProfile('recoil',27,27,.21,6,7,3,'helios',10,88,.44),
        dawnstarCannon:DKAttackProfile('recoil',26,25,.15,4,4,2,'sun',12,88,.4)
    },"weapons/families/dawnstar");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('powderKegCannon',{
    configureProjectile:function(c){c.opts.type='shell';c.opts.radius=8;c.opts.blast=c.weapon.blast;c.opts.life=82;c.opts.fragments=c.weapon.fragments||0;c.opts.familyClear=!!c.weapon.familyClear;c.opts.clearsBullets=!!c.weapon.familyClear;c.opts.knockback=4;}
},'weapons/families/dawnstar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('twinFuseCannon',{
    configureProjectile:function(c){c.opts.type='shell';c.opts.radius=8;c.opts.blast=c.weapon.blast;c.opts.life=82;c.opts.fragments=c.weapon.fragments||0;c.opts.familyClear=!!c.weapon.familyClear;c.opts.clearsBullets=!!c.weapon.familyClear;c.opts.knockback=4;}
},'weapons/families/dawnstar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('solarHowitzer',{
    configureProjectile:function(c){c.opts.type='shell';c.opts.radius=8;c.opts.blast=c.weapon.blast;c.opts.life=82;c.opts.fragments=c.weapon.fragments||0;c.opts.familyClear=!!c.weapon.familyClear;c.opts.clearsBullets=!!c.weapon.familyClear;c.opts.knockback=4;}
},'weapons/families/dawnstar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('heliosBombard',{
    configureProjectile:function(c){c.opts.type='shell';c.opts.radius=8;c.opts.blast=c.weapon.blast;c.opts.life=82;c.opts.fragments=c.weapon.fragments||0;c.opts.familyClear=!!c.weapon.familyClear;c.opts.clearsBullets=!!c.weapon.familyClear;c.opts.knockback=4;}
},'weapons/families/dawnstar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('dawnstarCannon',{
    configureProjectile:function(c){c.opts.dawnstar=true;c.opts.type='sun';c.opts.radius=11;c.opts.blast=c.weapon.blast;c.opts.life=105;c.opts.homing=.025;c.opts.clearsBullets=true;c.opts.knockback=5;}
},'weapons/families/dawnstar');

// Held-weapon art lives with the weapon content, not in game.js.
function render_dawnstarCannon(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle='#3f3522';ctx.beginPath();ctx.moveTo(3,-9);ctx.lineTo(34,-12);ctx.lineTo(54,-7);ctx.lineTo(61,-3);ctx.lineTo(61,3);ctx.lineTo(54,7);ctx.lineTo(34,12);ctx.lineTo(3,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d59b12';ctx.fillRect(9,8,12,12);ctx.save();ctx.translate(34,0);ctx.rotate(visualTick*.045);ctx.fillStyle='#f1c40f';for(var dsc=0;dsc<12;dsc++){ctx.rotate(TAU/12);ctx.fillRect(10,-2,9+pulse*3,4);}ctx.fillStyle='#fff8c7';ctx.beginPath();ctx.arc(0,0,10,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.restore();ctx.strokeStyle='#fff1a8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(43,-5);ctx.lineTo(60,-2);ctx.moveTo(43,5);ctx.lineTo(60,2);ctx.stroke();
}
DKRegister.weaponRenderer('dawnstarCannon',render_dawnstarCannon,'weapons/families/dawnstar');

// Held-weapon art lives with the weapon content, not in game.js.
function render_powderKegCannon_twinFuseCannon_solarHowitzer_heliosBombard(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle=w.rarity==='epic'?'#4d3d20':'#493d31';ctx.beginPath();ctx.moveTo(3,-9);ctx.lineTo(38,-12);ctx.lineTo(57,-7);ctx.lineTo(62,-3);ctx.lineTo(62,3);ctx.lineTo(57,7);ctx.lineTo(38,12);ctx.lineTo(3,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=w.color;ctx.lineWidth=3;for(var fc=-1;fc<=1;fc+=2){ctx.beginPath();ctx.moveTo(12,fc*5);ctx.lineTo(56,fc*3);ctx.stroke();}ctx.save();ctx.translate(38,0);ctx.rotate(visualTick*.04);var fragCount=Math.max(4,w.fragments||4);ctx.fillStyle='#fff4b0';for(var fr=0;fr<fragCount;fr++){ctx.rotate(TAU/fragCount);ctx.fillRect(8,-2,8+pulse*3,4);}ctx.restore();
}
DKRegister.weaponRenderer('powderKegCannon',render_powderKegCannon_twinFuseCannon_solarHowitzer_heliosBombard,'weapons/families/dawnstar');
DKRegister.weaponRenderer('twinFuseCannon',render_powderKegCannon_twinFuseCannon_solarHowitzer_heliosBombard,'weapons/families/dawnstar');
DKRegister.weaponRenderer('solarHowitzer',render_powderKegCannon_twinFuseCannon_solarHowitzer_heliosBombard,'weapons/families/dawnstar');
DKRegister.weaponRenderer('heliosBombard',render_powderKegCannon_twinFuseCannon_solarHowitzer_heliosBombard,'weapons/families/dawnstar');

// Mythical/legendary attack aura belongs to this weapon module.
function aura_dawnstarCannon(r){var ctx=r.ctx,p=r.player,w=r.weapon,q=r.progress,i=r.impact,v=r.visualTick,TAU=r.TAU;ctx.rotate(p.angle);ctx.translate(50+i*34,0);ctx.fillStyle='#fff8c7';for(var dr=0;dr<12;dr++){ctx.rotate(TAU/12);ctx.beginPath();ctx.moveTo(13,-3);ctx.lineTo(31+i*22,0);ctx.lineTo(13,3);ctx.closePath();ctx.fill();}ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,11+i*12,0,TAU);ctx.stroke();}
DKRegister.weaponAura('dawnstarCannon',aura_dawnstarCannon,'weapons/families/dawnstar');

// Projectile art lives beside the weapon mechanics.
function projectileArt_dawnstarCannon_0(r){var ctx=r.ctx,b=r.projectile,TAU=r.TAU,visualTick=r.visualTick;ctx.fillStyle='#fff8c7';ctx.beginPath();for(var ds=0;ds<16;ds++){var dsa=ds*TAU/16,dsr=ds%2?7:13;if(ds===0)ctx.moveTo(Math.cos(dsa)*dsr,Math.sin(dsa)*dsr);else ctx.lineTo(Math.cos(dsa)*dsr,Math.sin(dsa)*dsr);}ctx.closePath();ctx.fill();ctx.strokeStyle='#f1c40f';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,4+Math.sin(b.age*.22)*2,0,TAU);ctx.fill();}
DKRegister.projectileRenderer('dawnstarCannon',projectileArt_dawnstarCannon_0);

// Projectile art lives beside the weapon mechanics.
function projectileArt_dawnRay_1(r){var ctx=r.ctx,b=r.projectile,TAU=r.TAU,visualTick=r.visualTick;ctx.fillStyle='#fffce3';ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-7,-4);ctx.lineTo(-2,0);ctx.lineTo(-7,4);ctx.closePath();ctx.fill();ctx.strokeStyle='#f1c40f';ctx.stroke();}
DKRegister.projectileRenderer('dawnRay',projectileArt_dawnRay_1);
}());

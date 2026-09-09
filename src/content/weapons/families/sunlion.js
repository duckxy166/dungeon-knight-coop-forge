(function(){'use strict';DKRegister.weapons({
        brassThurible: { name: 'BRASS THURIBLE', icon: '♨', category: 'MAGIC', rarity: 'common', family: 'sunlion', damage: 3.6, rate: 540, speed: 8, mana: 2, color: '#c49a51', price: 28, handler: 'incenseTier', cloud: 42, desc: 'The first Sunlion-family censer. A homing incense coal leaves a small damaging cloud.' },
        emberThurible: { name: 'EMBER THURIBLE', icon: '♨', category: 'MAGIC', rarity: 'uncommon', family: 'sunlion', damage: 5.2, rate: 520, speed: 9, count: 2, spread: .24, mana: 6, color: '#e88942', price: 50, handler: 'incenseTier', cloud: 55, incenseStatus: 'burn', desc: 'Twin incense coals seek separate foes and leave burning smoke.' },
        prideThurible: { name: 'PRIDE THURIBLE', icon: '♌', category: 'MAGIC', rarity: 'rare', family: 'sunlion', damage: 8.8, rate: 540, speed: 10, count: 2, spread: .18, mana: 12, color: '#e5b84e', price: 81, handler: 'incenseTier', cloud: 72, incenseStatus: 'burn', incensePull: true, desc: 'Lion-faced smoke clouds pull nearby enemies toward their burning center.' },
        sunmaneThurible: { name: 'SUNMANE THURIBLE', icon: '♌', category: 'MAGIC', rarity: 'epic', family: 'sunlion', damage: 13.5, rate: 570, speed: 11, count: 3, spread: .3, mana: 19, color: '#f0c94e', price: 126, handler: 'incenseTier', cloud: 94, incenseStatus: 'burn', incensePull: true, desc: 'Three lion coals weave overlapping gravity-smoke; the family component required for Royal Hunt.' },
        sunlionCenser: { name: 'SUNLION CENSER: ROYAL HUNT', icon: '♌', category: 'MAGIC', rarity: 'legendary', family: 'sunlion', damage: 28, rate: 760, mana: 18, color: '#f1c40f', price: 148, handler: 'sunlion', desc: 'Eighteen mana releases a royal lion-spirit. It hunts seven targets faster, roars mid-hunt, devours hostile shots, then restores 1.5 armor and 12 mana.' }
    },{
        brassThurible:DKAttackProfile('pendulum',19,2,.82,8,9,2,'smoke',4,51,.17),
        emberThurible:DKAttackProfile('pendulum',21,2,1.02,9,11,3,'embersmoke',5,59,.21),
        prideThurible:DKAttackProfile('pendulum',23,2,1.25,10,14,4,'maneSmoke',7,70,.25),
        sunmaneThurible:DKAttackProfile('pendulum',26,3,1.55,12,18,5,'sunSmoke',9,84,.29),
        sunlionCenser:DKAttackProfile('summon',28,3,.65,10,20,4,'sunlion',10,91,.1)
    },"weapons/families/sunlion");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('brassThurible',{
    configureProjectile:function(c){c.opts.incense=true;c.opts.incenseCloud=c.weapon.cloud||42;c.opts.incenseStatus=c.weapon.incenseStatus||'';c.opts.incensePull=!!c.weapon.incensePull;c.opts.life=88;c.opts.radius=7;c.opts.type='incense';c.opts.homing=.055;c.opts.pierce=0;}
},'weapons/families/sunlion');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('emberThurible',{
    configureProjectile:function(c){c.opts.incense=true;c.opts.incenseCloud=c.weapon.cloud||42;c.opts.incenseStatus=c.weapon.incenseStatus||'';c.opts.incensePull=!!c.weapon.incensePull;c.opts.life=88;c.opts.radius=7;c.opts.type='incense';c.opts.homing=.055;c.opts.pierce=0;}
},'weapons/families/sunlion');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('prideThurible',{
    configureProjectile:function(c){c.opts.incense=true;c.opts.incenseCloud=c.weapon.cloud||42;c.opts.incenseStatus=c.weapon.incenseStatus||'';c.opts.incensePull=!!c.weapon.incensePull;c.opts.life=88;c.opts.radius=7;c.opts.type='incense';c.opts.homing=.055;c.opts.pierce=0;}
},'weapons/families/sunlion');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('sunmaneThurible',{
    configureProjectile:function(c){c.opts.incense=true;c.opts.incenseCloud=c.weapon.cloud||42;c.opts.incenseStatus=c.weapon.incenseStatus||'';c.opts.incensePull=!!c.weapon.incensePull;c.opts.life=88;c.opts.radius=7;c.opts.type='incense';c.opts.homing=.055;c.opts.pierce=0;}
},'weapons/families/sunlion');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('sunlionCenser',{
    attack:function(c){c.api.sunlion(c.player,c.weapon,c.angle);c.api.addWeaponFlash(c.weapon,c.player.x+Math.cos(c.angle)*34,c.player.y+Math.sin(c.angle)*34,c.angle);c.api.addRing(c.player.x,c.player.y,'#fff6c7',96,6);return true;}
},'weapons/families/sunlion');

// Held-weapon art lives with the weapon content, not in game.js.
function render_sunlionCenser(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle='#5f3b14';ctx.beginPath();ctx.arc(10,0,8,0,TAU);ctx.fill();ctx.strokeStyle='#fff1a8';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#d59b12';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(16,-5);ctx.bezierCurveTo(27,-21,40,-17,47,-8);ctx.moveTo(16,5);ctx.bezierCurveTo(27,21,40,17,47,8);ctx.stroke();for(var link=0;link<4;link++){ctx.fillStyle=link%2?'#fff1a8':'#f1c40f';ctx.beginPath();ctx.arc(22+link*7,Math.sin(visualTick*.1+link)*2,2.5,0,TAU);ctx.fill();}ctx.save();ctx.translate(54,0);ctx.rotate(Math.sin(visualTick*.07)*.08);ctx.fillStyle='#d59b12';ctx.strokeStyle='#fff6c7';ctx.lineWidth=3;for(var mane=0;mane<10;mane++){ctx.rotate(TAU/10);ctx.beginPath();ctx.moveTo(13,-3);ctx.lineTo(22+pulse*3,0);ctx.lineTo(13,3);ctx.closePath();ctx.fill();ctx.stroke();}ctx.fillStyle='#fff4bd';ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(7,-10);ctx.lineTo(-7,-9);ctx.lineTo(-13,0);ctx.lineTo(-7,9);ctx.lineTo(7,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#5b3a08';ctx.beginPath();ctx.arc(4,-3,2,0,TAU);ctx.arc(4,3,2,0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(-2,0);ctx.lineTo(7,0);ctx.stroke();ctx.restore();
}
DKRegister.weaponRenderer('sunlionCenser',render_sunlionCenser,'weapons/families/sunlion');

// Held-weapon art lives with the weapon content, not in game.js.
function render_brassThurible_emberThurible_prideThurible_sunmaneThurible(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle=w.rarity==='epic'?'#6b4213':'#57412a';ctx.beginPath();ctx.arc(10,0,7,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle=w.color;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(15,-5);ctx.bezierCurveTo(26,-17,34,-12,40,-6);ctx.moveTo(15,5);ctx.bezierCurveTo(26,17,34,12,40,6);ctx.stroke();ctx.save();ctx.translate(47,0);ctx.rotate(Math.sin(visualTick*.07)*.12);ctx.fillStyle=w.color;var thCount=w.rarity==='epic'?10:7;for(var th=0;th<thCount;th++){ctx.rotate(TAU/thCount);ctx.beginPath();ctx.moveTo(6,-3);ctx.lineTo(16+pulse*4,0);ctx.lineTo(6,3);ctx.closePath();ctx.fill();}ctx.fillStyle='#fff6cf';ctx.beginPath();ctx.arc(0,0,7+pulse*2,0,TAU);ctx.fill();ctx.restore();
}
DKRegister.weaponRenderer('brassThurible',render_brassThurible_emberThurible_prideThurible_sunmaneThurible,'weapons/families/sunlion');
DKRegister.weaponRenderer('emberThurible',render_brassThurible_emberThurible_prideThurible_sunmaneThurible,'weapons/families/sunlion');
DKRegister.weaponRenderer('prideThurible',render_brassThurible_emberThurible_prideThurible_sunmaneThurible,'weapons/families/sunlion');
DKRegister.weaponRenderer('sunmaneThurible',render_brassThurible_emberThurible_prideThurible_sunmaneThurible,'weapons/families/sunlion');

// Mythical/legendary attack aura belongs to this weapon module.
function aura_sunlionCenser(r){var ctx=r.ctx,p=r.player,w=r.weapon,q=r.progress,i=r.impact,v=r.visualTick,TAU=r.TAU;ctx.rotate(p.angle);ctx.strokeStyle='#fff8c7';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,-8);ctx.quadraticCurveTo(40,-35,62+i*42,0);ctx.quadraticCurveTo(40,35,14,8);ctx.stroke();ctx.save();ctx.translate(58+q*88,0);ctx.rotate(q*1.4);for(var sr=0;sr<12;sr++){ctx.rotate(TAU/12);ctx.beginPath();ctx.moveTo(18,-4);ctx.lineTo(30+i*16,0);ctx.lineTo(18,4);ctx.stroke();}ctx.fillStyle=w.color;ctx.beginPath();ctx.arc(0,0,17+i*6,0,TAU);ctx.fill();ctx.fillStyle='#fff8c7';ctx.beginPath();ctx.arc(4,-5,2.5,0,TAU);ctx.arc(4,5,2.5,0,TAU);ctx.fill();ctx.restore();}
DKRegister.weaponAura('sunlionCenser',aura_sunlionCenser,'weapons/families/sunlion');

// Melee slash art lives beside the weapon mechanics.
function slashArt_sunlionCenser_3(r){var ctx=r.ctx,sl=r.slash,t=r.t,TAU=r.TAU;
            ctx.lineWidth=5;for(var claw=-1;claw<=1;claw++){ctx.beginPath();ctx.arc(sl.x,sl.y,sl.radius+claw*8,sl.angle-sl.arc/2+claw*.08,sl.angle+sl.arc/2+claw*.08);ctx.stroke();}ctx.strokeStyle='#fff8c7';ctx.lineWidth=2;for(var sun=0;sun<6;sun++){var sua=sl.angle-sl.arc/2+sl.arc*sun/5;ctx.beginPath();ctx.moveTo(sl.x+Math.cos(sua)*sl.radius*.66,sl.y+Math.sin(sua)*sl.radius*.66);ctx.lineTo(sl.x+Math.cos(sua)*(sl.radius+14),sl.y+Math.sin(sua)*(sl.radius+14));ctx.stroke();}
        }
DKRegister.slashRenderer('sunlionCenser',slashArt_sunlionCenser_3);
}());

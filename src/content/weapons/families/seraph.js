(function(){'use strict';DKRegister.weapons({
        tinOrrery: { name: 'TIN ORRERY', icon: '◎', category: 'MAGIC', rarity: 'common', family: 'seraph', damage: 3.2, rate: 540, speed: 11, count: 2, mana: 2, color: '#b7b4a7', price: 28, handler: 'orbitDisk', returnAge: 48, desc: 'The first Seraph-family mechanism. Two little discs arc out and return.' },
        choirOrrery: { name: 'CHOIR ORRERY', icon: '◎', category: 'MAGIC', rarity: 'uncommon', family: 'seraph', damage: 4.6, rate: 560, speed: 12, count: 3, mana: 6, color: '#9be0cf', price: 52, handler: 'orbitDisk', returnAge: 52, orbitBounce: 1, desc: 'Three singing discs bounce once before returning through their targets.' },
        aegisOrrery: { name: 'AEGIS ORRERY', icon: '◎', category: 'MAGIC', rarity: 'rare', family: 'seraph', damage: 7.2, rate: 620, speed: 12, count: 4, mana: 12, color: '#88d9ff', price: 83, handler: 'orbitDisk', returnAge: 58, orbitBounce: 1, orbitClear: true, desc: 'Four guarded discs erase one hostile shot each while curving home.' },
        seraphicEngine: { name: 'SERAPHIC ENGINE', icon: '◎', category: 'MAGIC', rarity: 'epic', family: 'seraph', damage: 9.4, rate: 690, speed: 13, count: 5, mana: 19, color: '#ffe29a', price: 127, handler: 'orbitDisk', returnAge: 64, orbitBounce: 2, orbitClear: true, desc: 'Five halo mechanisms cleanse their routes and reconverge through the caster.' },
        seraphOrrery: { name: 'SERAPH ORRERY: SIXTH HALO', icon: '◎', category: 'MAGIC', rarity: 'legendary', family: 'seraph', damage: 9.5, rate: 780, speed: 12, count: 6, mana: 18, color: '#fff0a8', price: 154, handler: 'seraph', desc: 'Eighteen mana opens six seeking halo-discs that erase hostile shots, pierce twice, and reconverge in a radiant crown.' }
    },{
        tinOrrery:DKAttackProfile('orbit',18,1,.88,2,11,2,'discs',2,49,.47),
        choirOrrery:DKAttackProfile('orbit',20,1,1.18,3,13,3,'notes',3,57,.51),
        aegisOrrery:DKAttackProfile('orbit',23,2,1.42,3,16,4,'aegis',4,67,.55),
        seraphicEngine:DKAttackProfile('orbit',25,2,1.72,4,20,5,'engineHalos',5,79,.59),
        seraphOrrery:DKAttackProfile('orbit',26,2,1.2,2,20,4,'halos',6,86,.7)
    },"weapons/families/seraph");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('tinOrrery',{
    configureProjectile:function(c){c.opts.type='halo';c.opts.radius=7;c.opts.life=130;c.opts.homing=.055;c.opts.pierce=c.weapon.rarity==='epic'?2:1;c.opts.bounce=c.weapon.orbitBounce||0;c.opts.clearsBullets=!!c.weapon.orbitClear;c.opts.returning=true;c.opts.returnAge=c.weapon.returnAge||52;}
},'weapons/families/seraph');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('choirOrrery',{
    configureProjectile:function(c){c.opts.type='halo';c.opts.radius=7;c.opts.life=130;c.opts.homing=.055;c.opts.pierce=c.weapon.rarity==='epic'?2:1;c.opts.bounce=c.weapon.orbitBounce||0;c.opts.clearsBullets=!!c.weapon.orbitClear;c.opts.returning=true;c.opts.returnAge=c.weapon.returnAge||52;}
},'weapons/families/seraph');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('aegisOrrery',{
    configureProjectile:function(c){c.opts.type='halo';c.opts.radius=7;c.opts.life=130;c.opts.homing=.055;c.opts.pierce=c.weapon.rarity==='epic'?2:1;c.opts.bounce=c.weapon.orbitBounce||0;c.opts.clearsBullets=!!c.weapon.orbitClear;c.opts.returning=true;c.opts.returnAge=c.weapon.returnAge||52;}
},'weapons/families/seraph');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('seraphicEngine',{
    configureProjectile:function(c){c.opts.type='halo';c.opts.radius=7;c.opts.life=130;c.opts.homing=.055;c.opts.pierce=c.weapon.rarity==='epic'?2:1;c.opts.bounce=c.weapon.orbitBounce||0;c.opts.clearsBullets=!!c.weapon.orbitClear;c.opts.returning=true;c.opts.returnAge=c.weapon.returnAge||52;}
},'weapons/families/seraph');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('seraphOrrery',{
    configureAngle:function(c){c.angle=c.baseAngle+(c.index-(c.count-1)/2)*.17;},
    configureProjectile:function(c){c.opts.seraph=true;c.opts.type='halo';c.opts.radius=9;c.opts.life=145;c.opts.homing=.11;c.opts.pierce=2;c.opts.bounce=1;c.opts.clearsBullets=true;c.opts.ghost=true;c.opts.returning=true;c.opts.returnAge=82;}
},'weapons/families/seraph');

// Held-weapon art lives with the weapon content, not in game.js.
function render_seraphOrrery(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle='#795e25';ctx.fillRect(4,-3,32,6);ctx.fillStyle='#f1c40f';ctx.beginPath();ctx.moveTo(31,-8);ctx.lineTo(44,-3);ctx.lineTo(44,3);ctx.lineTo(31,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.save();ctx.translate(46,0);ctx.rotate(visualTick*.035);for(var seo=0;seo<6;seo++){ctx.rotate(TAU/6);ctx.save();ctx.translate(18+pulse*3,0);ctx.rotate(-visualTick*.08);ctx.strokeStyle=seo%2?'#fff':'#fff0a8';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,8,3.5,0,0,TAU);ctx.stroke();ctx.restore();}ctx.strokeStyle='#f1c40f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,12,0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,4+pulse*2,0,TAU);ctx.fill();ctx.restore();
}
DKRegister.weaponRenderer('seraphOrrery',render_seraphOrrery,'weapons/families/seraph');

// Held-weapon art lives with the weapon content, not in game.js.
function render_tinOrrery_choirOrrery_aegisOrrery_seraphicEngine(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle='#514936';ctx.fillRect(4,-3,29,6);ctx.save();ctx.translate(42,0);ctx.rotate(visualTick*.04);for(var od=0;od<(w.count||2);od++){ctx.rotate(TAU/(w.count||2));ctx.save();ctx.translate(14+pulse*3,0);ctx.strokeStyle=od%2?'#fff':w.color;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,8,3,0,0,TAU);ctx.stroke();ctx.restore();}ctx.fillStyle=w.color;ctx.beginPath();ctx.arc(0,0,5+pulse*2,0,TAU);ctx.fill();ctx.restore();
}
DKRegister.weaponRenderer('tinOrrery',render_tinOrrery_choirOrrery_aegisOrrery_seraphicEngine,'weapons/families/seraph');
DKRegister.weaponRenderer('choirOrrery',render_tinOrrery_choirOrrery_aegisOrrery_seraphicEngine,'weapons/families/seraph');
DKRegister.weaponRenderer('aegisOrrery',render_tinOrrery_choirOrrery_aegisOrrery_seraphicEngine,'weapons/families/seraph');
DKRegister.weaponRenderer('seraphicEngine',render_tinOrrery_choirOrrery_aegisOrrery_seraphicEngine,'weapons/families/seraph');

// Mythical/legendary attack aura belongs to this weapon module.
function aura_seraphOrrery(r){var ctx=r.ctx,p=r.player,w=r.weapon,q=r.progress,i=r.impact,v=r.visualTick,TAU=r.TAU;ctx.rotate(q*1.8*p.attackSide);for(var sh=0;sh<6;sh++){ctx.rotate(TAU/6);ctx.save();ctx.translate(43+i*35,0);ctx.rotate(-q*3);ctx.strokeStyle=sh%2?'#fff':w.color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,15+i*5,6+i*2,0,0,TAU);ctx.stroke();ctx.restore();}}
DKRegister.weaponAura('seraphOrrery',aura_seraphOrrery,'weapons/families/seraph');

// Projectile art lives beside the weapon mechanics.
function projectileArt_seraphOrrery_2(r){var ctx=r.ctx,b=r.projectile,TAU=r.TAU,visualTick=r.visualTick;ctx.rotate(b.age*.13);ctx.strokeStyle='#fff0a8';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,12,6,0,0,TAU);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,7,13,0,0,TAU);ctx.stroke();ctx.fillStyle='#f1c40f';ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();}
DKRegister.projectileRenderer('seraphOrrery',projectileArt_seraphOrrery_2);
}());

(function(){'use strict';DKRegister.weapons({
        twineBallista: { name: 'TWINE BALLISTA', icon: '⋈', category: 'ARCHER', rarity: 'common', family: 'heavenfall', damage: 8, rate: 650, speed: 17, charge: 650, color: '#b69a69', price: 29, handler: 'skyBow', skyLances: 0, desc: 'The first Heavenfall-family bow. A sturdy full draw pierces two bodies.' },
        forkBallista: { name: 'FORKED BALLISTA', icon: '⋈', category: 'ARCHER', rarity: 'uncommon', family: 'heavenfall', damage: 9.5, rate: 630, speed: 18, charge: 640, color: '#65c8ab', price: 53, handler: 'skyBow', skyLances: 2, desc: 'A perfect hit calls two narrow wind-lances through the impact point.' },
        glassBallista: { name: 'GLASS BALLISTA', icon: '⋈', category: 'ARCHER', rarity: 'rare', family: 'heavenfall', damage: 13, rate: 700, speed: 19, charge: 720, color: '#8eeeff', price: 84, handler: 'skyBow', skyLances: 3, desc: 'A crystal beacon calls three piercing crosswinds on a perfect hit.' },
        stormBallista: { name: 'STORM BALLISTA', icon: '⋈', category: 'ARCHER', rarity: 'epic', family: 'heavenfall', damage: 18, rate: 740, speed: 20, charge: 760, color: '#b8f1ff', price: 128, handler: 'skyBow', skyLances: 5, skyStatus: 'shock', desc: 'A perfect beacon calls five thunderous side-lances and stuns the crossing point.' },
        heavenfallBallista: { name: 'HEAVENFALL BALLISTA: OPEN SKY', icon: '✧', category: 'ARCHER', rarity: 'legendary', family: 'heavenfall', damage: 27, rate: 700, speed: 21, charge: 700, color: '#f1c40f', price: 160, handler: 'skyBow', skyLances: 8, skyStatus: 'shock', heavenfall: true, desc: 'A perfect beacon opens the ceiling: eight cleansing light-lances cross its target before a final skyburst.' }
    },{
        twineBallista:DKAttackProfile('draw',18,12,.05,0,0,1,'twine',3,45,.77),
        forkBallista:DKAttackProfile('draw',20,13,.065,0,1,2,'crosswind',4,53,.81),
        glassBallista:DKAttackProfile('draw',22,15,.075,0,2,3,'glasswind',5,65,.85),
        stormBallista:DKAttackProfile('draw',25,17,.09,0,3,4,'stormwind',7,80,.89),
        heavenfallBallista:DKAttackProfile('draw',28,21,.105,0,5,5,'heavenfall',10,104,.64)
    },"weapons/families/heavenfall");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('twineBallista',{
    configureProjectile:function(c){c.opts.type='arrow';c.opts.radius=4;c.opts.pierce=c.power>1.45?2:0;c.opts.split=0;c.opts.skyLances=c.burstIndex===1?(c.weapon.skyLances||0):0;c.opts.skyStatus=c.weapon.skyStatus||'';c.opts.heavenfall=!!c.weapon.heavenfall&&c.burstIndex===1;c.opts.pierce=Math.max(c.opts.pierce||0,c.burstIndex===1?2:1);c.opts.life=125;c.opts.type=c.weapon.heavenfall?'heavenBolt':'windBolt';if(c.weapon.heavenfall){c.opts.clearsBullets=true;c.opts.radius=7;c.opts.homing=.035;}}
},'weapons/families/heavenfall');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('forkBallista',{
    configureProjectile:function(c){c.opts.type='arrow';c.opts.radius=4;c.opts.pierce=c.power>1.45?2:0;c.opts.split=0;c.opts.skyLances=c.burstIndex===1?(c.weapon.skyLances||0):0;c.opts.skyStatus=c.weapon.skyStatus||'';c.opts.heavenfall=!!c.weapon.heavenfall&&c.burstIndex===1;c.opts.pierce=Math.max(c.opts.pierce||0,c.burstIndex===1?2:1);c.opts.life=125;c.opts.type=c.weapon.heavenfall?'heavenBolt':'windBolt';if(c.weapon.heavenfall){c.opts.clearsBullets=true;c.opts.radius=7;c.opts.homing=.035;}}
},'weapons/families/heavenfall');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('glassBallista',{
    configureProjectile:function(c){c.opts.type='arrow';c.opts.radius=4;c.opts.pierce=c.power>1.45?2:0;c.opts.split=0;c.opts.skyLances=c.burstIndex===1?(c.weapon.skyLances||0):0;c.opts.skyStatus=c.weapon.skyStatus||'';c.opts.heavenfall=!!c.weapon.heavenfall&&c.burstIndex===1;c.opts.pierce=Math.max(c.opts.pierce||0,c.burstIndex===1?2:1);c.opts.life=125;c.opts.type=c.weapon.heavenfall?'heavenBolt':'windBolt';if(c.weapon.heavenfall){c.opts.clearsBullets=true;c.opts.radius=7;c.opts.homing=.035;}}
},'weapons/families/heavenfall');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('stormBallista',{
    configureProjectile:function(c){c.opts.type='arrow';c.opts.radius=4;c.opts.pierce=c.power>1.45?2:0;c.opts.split=0;c.opts.skyLances=c.burstIndex===1?(c.weapon.skyLances||0):0;c.opts.skyStatus=c.weapon.skyStatus||'';c.opts.heavenfall=!!c.weapon.heavenfall&&c.burstIndex===1;c.opts.pierce=Math.max(c.opts.pierce||0,c.burstIndex===1?2:1);c.opts.life=125;c.opts.type=c.weapon.heavenfall?'heavenBolt':'windBolt';if(c.weapon.heavenfall){c.opts.clearsBullets=true;c.opts.radius=7;c.opts.homing=.035;}}
},'weapons/families/heavenfall');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('heavenfallBallista',{
    configureProjectile:function(c){c.opts.type='arrow';c.opts.radius=4;c.opts.pierce=c.power>1.45?2:0;c.opts.split=0;c.opts.skyLances=c.burstIndex===1?(c.weapon.skyLances||0):0;c.opts.skyStatus=c.weapon.skyStatus||'';c.opts.heavenfall=!!c.weapon.heavenfall&&c.burstIndex===1;c.opts.pierce=Math.max(c.opts.pierce||0,c.burstIndex===1?2:1);c.opts.life=125;c.opts.type=c.weapon.heavenfall?'heavenBolt':'windBolt';if(c.weapon.heavenfall){c.opts.clearsBullets=true;c.opts.radius=7;c.opts.homing=.035;}}
},'weapons/families/heavenfall');

// Held-weapon art lives with the weapon content, not in game.js.
function render_twineBallista_forkBallista_glassBallista_stormBallista_heavenfallBallista(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle='#4d493b';ctx.fillRect(4,-4,43,8);ctx.strokeStyle=w.color;ctx.lineWidth=w.rarity==='legendary'?7:5;ctx.beginPath();ctx.moveTo(29,-22);ctx.quadraticCurveTo(57,0,29,22);ctx.stroke();ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(31,-20);ctx.lineTo(46,0);ctx.lineTo(31,20);ctx.stroke();ctx.fillStyle=w.rarity==='legendary'?'#f1c40f':'#d8eef3';ctx.beginPath();ctx.moveTo(64,0);ctx.lineTo(44,-5);ctx.lineTo(48,0);ctx.lineTo(44,5);ctx.closePath();ctx.fill();if(w.rarity==='legendary'){ctx.save();ctx.translate(46,0);ctx.rotate(visualTick*.05);for(var hb=0;hb<8;hb++){ctx.rotate(TAU/8);ctx.strokeStyle=hb%2?'#fff':w.color;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(22+pulse*5,0);ctx.stroke();}ctx.restore();}
}
DKRegister.weaponRenderer('twineBallista',render_twineBallista_forkBallista_glassBallista_stormBallista_heavenfallBallista,'weapons/families/heavenfall');
DKRegister.weaponRenderer('forkBallista',render_twineBallista_forkBallista_glassBallista_stormBallista_heavenfallBallista,'weapons/families/heavenfall');
DKRegister.weaponRenderer('glassBallista',render_twineBallista_forkBallista_glassBallista_stormBallista_heavenfallBallista,'weapons/families/heavenfall');
DKRegister.weaponRenderer('stormBallista',render_twineBallista_forkBallista_glassBallista_stormBallista_heavenfallBallista,'weapons/families/heavenfall');
DKRegister.weaponRenderer('heavenfallBallista',render_twineBallista_forkBallista_glassBallista_stormBallista_heavenfallBallista,'weapons/families/heavenfall');

// Mythical/legendary attack aura belongs to this weapon module.
function aura_heavenfallBallista(r){var ctx=r.ctx,p=r.player,w=r.weapon,q=r.progress,i=r.impact,v=r.visualTick,TAU=r.TAU;ctx.rotate(p.angle);ctx.strokeStyle='#fff';ctx.lineWidth=2;for(var hb=-1;hb<=1;hb++){ctx.beginPath();ctx.moveTo(24,hb*14);ctx.quadraticCurveTo(62+i*30,hb*26,102+i*58,hb*8);ctx.stroke();}for(var hl=0;hl<8;hl++){var hla=-.72+hl*.205;ctx.save();ctx.rotate(hla);ctx.fillStyle=hl%2?'#fff':'#f1c40f';ctx.globalAlpha=.35+.5*i;ctx.beginPath();ctx.moveTo(54+q*40,-3);ctx.lineTo(88+i*46,0);ctx.lineTo(54+q*40,3);ctx.closePath();ctx.fill();ctx.restore();}}
DKRegister.weaponAura('heavenfallBallista',aura_heavenfallBallista,'weapons/families/heavenfall');
}());

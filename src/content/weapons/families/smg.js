(function(){'use strict';DKRegister.weapons({
        cobbleSmg: { name:'COBBLE SMG',icon:'⁙',category:'GUN',rarity:'common',family:'smg',damage:2.4,rate:118,speed:15,color:'#c5b59b',price:29,handler:'smg',desc:'A light scrap receiver. Continuous fire tightens its loose first shots.' },
        waspNine: { name:'WASP-9',icon:'≋',category:'GUN',rarity:'uncommon',family:'smg',damage:2.9,rate:105,speed:16,smgHoming:.025,color:'#58ca75',price:52,handler:'smg',desc:'Yellow-jacket rounds twitch toward nearby targets; every tenth round splits into stingers.' },
        phaseNeedleSmg: { name:'PHASE NEEDLE SMG',icon:'»',category:'GUN',rarity:'rare',family:'smg',damage:4.1,rate:92,speed:18,pierce:2,phaseAmmo:true,color:'#4da9ed',price:79,handler:'smg',desc:'Needles skip through the first wall and emerge with an extra pierce.' },
        stormChoirSmg: { name:'STORM CHOIR SMG',icon:'ϟ',category:'GUN',rarity:'epic',family:'smg',damage:5.4,rate:82,speed:19,mana:.5,chainBurst:true,color:'#ad5bdb',price:112,handler:'smg',desc:'Never overheats. Each shot costs 0.5 mana; every twelfth round conducts a three-target chorus.' }
    },{
        cobbleSmg:DKAttackProfile('rattle',7,4,.025,0,1,0,'scrapCasings',4,27,.12),
        waspNine:DKAttackProfile('rattle',7,5,.04,1,2,1,'waspWings',5,34,.23),
        phaseNeedleSmg:DKAttackProfile('phase',8,5,.035,5,1,1,'phaseNeedles',6,42,.34),
        stormChoirSmg:DKAttackProfile('rattle',7,6,.055,2,2,2,'stormNotes',8,49,.45)
    },"weapons/families/smg");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('cobbleSmg',{
    prepareVolley:function(c){if(c.player.passives.coolingJacket)c.power*=1+Math.min(.3,(c.weapon.shots%20)*.016);c.power*=c.familyTier===2?1.12:c.familyTier===1?1.05:1;},
    configureProjectile:function(c){c.opts.life=98;c.opts.radius=4;c.opts.type='smgRound';c.opts.homing=c.weapon.smgHoming||0;c.opts.pierce=c.weapon.pierce||0;if(c.weapon.phaseAmmo){c.opts.ghost=true;c.opts.type='phaseNeedle';}if(c.weapon.chainBurst&&c.weapon.shots%12===0){c.opts.tesla=true;c.opts.status='shock';c.opts.color='#e1c9ff';}}
},'weapons/families/smg');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('waspNine',{
    prepareVolley:function(c){if(c.player.passives.coolingJacket)c.power*=1+Math.min(.3,(c.weapon.shots%20)*.016);c.power*=c.familyTier===2?1.12:c.familyTier===1?1.05:1;},
    configureProjectile:function(c){c.opts.life=98;c.opts.radius=4;c.opts.type='smgRound';c.opts.homing=c.weapon.smgHoming||0;c.opts.pierce=c.weapon.pierce||0;if(c.weapon.phaseAmmo){c.opts.ghost=true;c.opts.type='phaseNeedle';}if(c.weapon.shots%10===0)c.opts.hive=3;if(c.weapon.chainBurst&&c.weapon.shots%12===0){c.opts.tesla=true;c.opts.status='shock';c.opts.color='#e1c9ff';}}
},'weapons/families/smg');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('phaseNeedleSmg',{
    prepareVolley:function(c){if(c.player.passives.coolingJacket)c.power*=1+Math.min(.3,(c.weapon.shots%20)*.016);c.power*=c.familyTier===2?1.12:c.familyTier===1?1.05:1;},
    configureProjectile:function(c){c.opts.life=98;c.opts.radius=4;c.opts.type='smgRound';c.opts.homing=c.weapon.smgHoming||0;c.opts.pierce=c.weapon.pierce||0;if(c.weapon.phaseAmmo){c.opts.ghost=true;c.opts.type='phaseNeedle';}if(c.weapon.chainBurst&&c.weapon.shots%12===0){c.opts.tesla=true;c.opts.status='shock';c.opts.color='#e1c9ff';}}
},'weapons/families/smg');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('stormChoirSmg',{
    prepareVolley:function(c){if(c.player.passives.coolingJacket)c.power*=1+Math.min(.3,(c.weapon.shots%20)*.016);c.power*=c.familyTier===2?1.12:c.familyTier===1?1.05:1;},
    configureProjectile:function(c){c.opts.life=98;c.opts.radius=4;c.opts.type='smgRound';c.opts.homing=c.weapon.smgHoming||0;c.opts.pierce=c.weapon.pierce||0;if(c.weapon.phaseAmmo){c.opts.ghost=true;c.opts.type='phaseNeedle';}if(c.weapon.chainBurst&&c.weapon.shots%12===0){c.opts.tesla=true;c.opts.status='shock';c.opts.color='#e1c9ff';}}
},'weapons/families/smg');

// Held-weapon art lives with the weapon content, not in game.js.
function render_cobbleSmg_waspNine_phaseNeedleSmg_stormChoirSmg(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle=w.id==='stormChoirSmg'?'#2b193c':w.id==='phaseNeedleSmg'?'#182d45':'#3f403c';ctx.beginPath();ctx.moveTo(3,-7);ctx.lineTo(34,-10);ctx.lineTo(49,-6);ctx.lineTo(55,-3);ctx.lineTo(55,3);ctx.lineTo(48,7);ctx.lineTo(27,8);ctx.lineTo(3,6);ctx.closePath();ctx.fill();ctx.strokeStyle=w.color;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#232426';ctx.beginPath();ctx.moveTo(20,7);ctx.lineTo(32,8);ctx.lineTo(29,24);ctx.lineTo(17,20);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#17191a';ctx.fillRect(48,-3,17,6);
                    if(w.id==='cobbleSmg'){ctx.fillStyle='#988b72';ctx.fillRect(7,-4,9,8);ctx.fillRect(33,-5,6,10);ctx.strokeStyle='#ddd2ba';for(var cs=0;cs<3;cs++){ctx.beginPath();ctx.moveTo(5+cs*11,-7);ctx.lineTo(9+cs*11,7);ctx.stroke();}}
                    else if(w.id==='waspNine'){ctx.fillStyle='#f0c84b';for(var wn=0;wn<4;wn++)ctx.fillRect(10+wn*9,-7,5,14);ctx.save();ctx.translate(49,0);for(var ww=-1;ww<=1;ww+=2){ctx.fillStyle='rgba(255,245,170,.7)';ctx.beginPath();ctx.ellipse(-3,ww*9,9+pulse*2,3,.25*ww,0,TAU);ctx.fill();}ctx.restore();}
                    else if(w.id==='phaseNeedleSmg'){ctx.strokeStyle='#d9f6ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,-4);ctx.lineTo(45,-2);ctx.moveTo(10,4);ctx.lineTo(45,2);ctx.stroke();for(var pn=0;pn<3;pn++){ctx.globalAlpha=.35+pn*.2;ctx.strokeRect(55+pn*5,-4-pn,8,8+pn*2);}ctx.globalAlpha=1;}
                    else{ctx.save();ctx.translate(34,0);ctx.rotate(visualTick*.06);for(var sc=0;sc<8;sc++){ctx.rotate(TAU/8);ctx.fillStyle=sc%2?'#fff':w.color;ctx.beginPath();ctx.arc(12+pulse*2,0,2.5,0,TAU);ctx.fill();}ctx.restore();ctx.strokeStyle='#e7c9ff';for(var sn=-1;sn<=1;sn++){ctx.beginPath();ctx.moveTo(44,sn*5);ctx.quadraticCurveTo(55,sn*9,66,sn*4);ctx.stroke();}}
}
DKRegister.weaponRenderer('cobbleSmg',render_cobbleSmg_waspNine_phaseNeedleSmg_stormChoirSmg,'weapons/families/smg');
DKRegister.weaponRenderer('waspNine',render_cobbleSmg_waspNine_phaseNeedleSmg_stormChoirSmg,'weapons/families/smg');
DKRegister.weaponRenderer('phaseNeedleSmg',render_cobbleSmg_waspNine_phaseNeedleSmg_stormChoirSmg,'weapons/families/smg');
DKRegister.weaponRenderer('stormChoirSmg',render_cobbleSmg_waspNine_phaseNeedleSmg_stormChoirSmg,'weapons/families/smg');
}());

(function(){'use strict';DKRegister.weapons({
        wardenAr: { name:'WARDEN AR',icon:'▱',category:'GUN',rarity:'common',family:'ar',damage:4.1,rate:310,speed:16,burst:3,burstGap:70,spread:.08,color:'#b8b49f',price:31,handler:'ar',desc:'A practical three-round rifle; the final round flies straight and hits harder.' },
        rampartAr: { name:'RAMPART AR',icon:'▰',category:'GUN',rarity:'uncommon',family:'ar',damage:5.3,rate:285,speed:17,burst:3,burstGap:62,spread:.06,pierce:1,color:'#4fc276',price:55,handler:'ar',desc:'A reinforced battle rifle whose controlled burst punches through one body.' },
        auroraBattleRifle: { name:'AURORA BATTLE RIFLE',icon:'✦',category:'GUN',rarity:'rare',family:'ar',damage:7.4,rate:300,speed:19,burst:3,burstGap:58,spread:.045,pierce:2,status:'freeze',color:'#55baf2',price:84,handler:'ar',desc:'Three polar tracers leave a luminous frost line; the third round calls a cold flank shot.' },
        eclipseServiceRifle: { name:'ECLIPSE SERVICE RIFLE',icon:'◐',category:'GUN',rarity:'epic',family:'ar',damage:10.5,rate:315,speed:20,burst:4,burstGap:55,spread:.04,pierce:3,status:'rift',eclipseBurst:true,color:'#a751d1',price:119,handler:'ar',desc:'A four-beat rifle. The last shot returns backward through its own rifted firing lane.' }
    },{
        wardenAr:DKAttackProfile('rattle',11,9,.04,1,0,1,'threeBeat',3,38,.16),
        rampartAr:DKAttackProfile('recoil',12,11,.05,2,1,1,'rampartBurst',4,45,.27),
        auroraBattleRifle:DKAttackProfile('phase',13,13,.065,4,3,2,'auroraTracers',6,56,.38),
        eclipseServiceRifle:DKAttackProfile('rewind',15,15,.1,6,4,3,'eclipseLane',8,67,.49)
    },"weapons/families/ar");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('wardenAr',{
    prepareVolley:function(c){if(c.player.passives.tacticalSling)c.spread*=.7;},
    configureCrit:function(c){var tactical=c.player.passives.tacticalSling&&c.player.classShotCounter%8===0;c.tacticalTracer=!!tactical;if(tactical)c.forceCrit=true;c.critChance+=(c.familyTier===2?.1:c.familyTier===1?.05:0);},
    configureProjectile:function(c){c.opts.life=120;c.opts.radius=5;c.opts.type='rifleRound';c.opts.pierce=c.weapon.pierce||0;c.opts.status=c.weapon.status||'';if(c.burstIndex===c.weapon.burst-1){c.opts.damage*=1.25;c.opts.pierce+=1;if(c.weapon.eclipseBurst){c.opts.returning=true;c.opts.returnAge=23;c.opts.ghost=true;}}}
},'weapons/families/ar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('rampartAr',{
    prepareVolley:function(c){if(c.player.passives.tacticalSling)c.spread*=.7;},
    configureCrit:function(c){var tactical=c.player.passives.tacticalSling&&c.player.classShotCounter%8===0;c.tacticalTracer=!!tactical;if(tactical)c.forceCrit=true;c.critChance+=(c.familyTier===2?.1:c.familyTier===1?.05:0);},
    configureProjectile:function(c){c.opts.life=120;c.opts.radius=5;c.opts.type='rifleRound';c.opts.pierce=c.weapon.pierce||0;c.opts.status=c.weapon.status||'';if(c.burstIndex===c.weapon.burst-1){c.opts.damage*=1.25;c.opts.pierce+=1;if(c.weapon.eclipseBurst){c.opts.returning=true;c.opts.returnAge=23;c.opts.ghost=true;}}}
},'weapons/families/ar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('auroraBattleRifle',{
    prepareVolley:function(c){if(c.player.passives.tacticalSling)c.spread*=.7;},
    configureCrit:function(c){var tactical=c.player.passives.tacticalSling&&c.player.classShotCounter%8===0;c.tacticalTracer=!!tactical;if(tactical)c.forceCrit=true;c.critChance+=(c.familyTier===2?.1:c.familyTier===1?.05:0);},
    configureProjectile:function(c){c.opts.life=120;c.opts.radius=5;c.opts.type='rifleRound';c.opts.pierce=c.weapon.pierce||0;c.opts.status=c.weapon.status||'';if(c.burstIndex===c.weapon.burst-1){c.opts.damage*=1.25;c.opts.pierce+=1;c.opts.skyLances=1;if(c.weapon.eclipseBurst){c.opts.returning=true;c.opts.returnAge=23;c.opts.ghost=true;}}}
},'weapons/families/ar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('eclipseServiceRifle',{
    prepareVolley:function(c){if(c.player.passives.tacticalSling)c.spread*=.7;},
    configureCrit:function(c){var tactical=c.player.passives.tacticalSling&&c.player.classShotCounter%8===0;c.tacticalTracer=!!tactical;if(tactical)c.forceCrit=true;c.critChance+=(c.familyTier===2?.1:c.familyTier===1?.05:0);},
    configureProjectile:function(c){c.opts.life=120;c.opts.radius=5;c.opts.type='rifleRound';c.opts.pierce=c.weapon.pierce||0;c.opts.status=c.weapon.status||'';if(c.burstIndex===c.weapon.burst-1){c.opts.damage*=1.25;c.opts.pierce+=1;if(c.weapon.eclipseBurst){c.opts.returning=true;c.opts.returnAge=23;c.opts.ghost=true;}}}
},'weapons/families/ar');

// Held-weapon art lives with the weapon content, not in game.js.
function render_wardenAr_rampartAr_auroraBattleRifle_eclipseServiceRifle(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle=w.id==='eclipseServiceRifle'?'#20142e':w.id==='auroraBattleRifle'?'#1d3e50':'#3f433d';ctx.beginPath();ctx.moveTo(2,-7);ctx.lineTo(18,-10);ctx.lineTo(43,-9);ctx.lineTo(54,-5);ctx.lineTo(72,-4);ctx.lineTo(72,4);ctx.lineTo(52,5);ctx.lineTo(43,9);ctx.lineTo(17,9);ctx.lineTo(2,6);ctx.closePath();ctx.fill();ctx.strokeStyle=w.color;ctx.lineWidth=2.5;ctx.stroke();ctx.fillStyle='#292b29';ctx.beginPath();ctx.moveTo(24,8);ctx.lineTo(37,8);ctx.lineTo(34,24);ctx.lineTo(21,20);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(5,-4);ctx.lineTo(-11,-15);ctx.lineTo(-15,-10);ctx.lineTo(-3,5);ctx.closePath();ctx.fill();ctx.stroke();
                    if(w.id==='wardenAr'){ctx.fillStyle='#d4cdb7';ctx.fillRect(43,-12,5,9);ctx.strokeStyle='#eee';ctx.beginPath();ctx.moveTo(50,0);ctx.lineTo(69,0);ctx.stroke();}
                    else if(w.id==='rampartAr'){ctx.fillStyle='#3b8359';ctx.fillRect(10,-12,38,5);ctx.fillRect(47,-8,7,16);ctx.strokeStyle='#c4ffda';ctx.beginPath();ctx.moveTo(13,-14);ctx.lineTo(47,-14);ctx.stroke();}
                    else if(w.id==='auroraBattleRifle'){ctx.fillStyle='rgba(160,240,255,.65)';ctx.beginPath();ctx.moveTo(8,-8);ctx.lineTo(28,-16);ctx.lineTo(49,-8);ctx.lineTo(37,-4);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(15,5);ctx.lineTo(69,1);ctx.stroke();for(var au=0;au<3;au++){ctx.fillStyle=au%2?'#fff':w.color;ctx.beginPath();ctx.arc(32+au*12,-8+Math.sin(visualTick*.06+au)*2,2+pulse,0,TAU);ctx.fill();}}
                    else{ctx.fillStyle='#07050a';ctx.beginPath();ctx.arc(37,0,10,0,TAU);ctx.fill();ctx.strokeStyle=w.color;ctx.stroke();ctx.save();ctx.translate(37,0);ctx.rotate(visualTick*.05);ctx.fillStyle='#fff';for(var er=0;er<4;er++){ctx.rotate(TAU/4);ctx.fillRect(9,-1,10+pulse*3,2);}ctx.restore();ctx.strokeStyle='#e8c9ff';ctx.beginPath();ctx.moveTo(55,-5);ctx.lineTo(73,0);ctx.lineTo(55,5);ctx.stroke();}
}
DKRegister.weaponRenderer('wardenAr',render_wardenAr_rampartAr_auroraBattleRifle_eclipseServiceRifle,'weapons/families/ar');
DKRegister.weaponRenderer('rampartAr',render_wardenAr_rampartAr_auroraBattleRifle_eclipseServiceRifle,'weapons/families/ar');
DKRegister.weaponRenderer('auroraBattleRifle',render_wardenAr_rampartAr_auroraBattleRifle_eclipseServiceRifle,'weapons/families/ar');
DKRegister.weaponRenderer('eclipseServiceRifle',render_wardenAr_rampartAr_auroraBattleRifle_eclipseServiceRifle,'weapons/families/ar');
}());

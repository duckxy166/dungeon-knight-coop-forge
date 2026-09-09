(function(){'use strict';DKRegister.weapons({
        pipeRocket: { name:'PIPE ROCKET',icon:'▰',category:'GUN',rarity:'common',family:'bazooka',damage:9,rate:880,speed:7,blast:58,color:'#b7a88b',price:30,handler:'bazooka',desc:'A hand-cut launch tube. Its slow rocket bursts wide enough to open a packed lane.' },
        clusterTube: { name:'CLUSTER TUBE',icon:'◉',category:'GUN',rarity:'uncommon',family:'bazooka',damage:11,rate:850,speed:7.5,blast:72,fragments:3,color:'#59c877',price:54,handler:'bazooka',desc:'The main blast scatters three hot bomblets into untouched angles.' },
        seismicBazooka: { name:'SEISMIC BAZOOKA',icon:'◈',category:'GUN',rarity:'rare',family:'bazooka',damage:19,rate:920,speed:8,blast:108,fragments:4,quake:true,status:'shock',color:'#49a8e8',price:82,handler:'bazooka',desc:'A blue bore-drill rocket. Impact sends a second fault-ring through stone and briefly stuns.' },
        dragonwakeBazooka: { name:'DRAGONWAKE BAZOOKA',icon:'♨',category:'GUN',rarity:'epic',family:'bazooka',damage:28,rate:960,speed:8.5,blast:142,fragments:6,flameTrail:true,status:'burn',color:'#b85cff',price:118,handler:'bazooka',desc:'A carved wyrm tube whose rocket paints a burning wake before flowering into six seeking embers.' }
    },{
        pipeRocket:DKAttackProfile('recoil',24,24,.13,4,4,2,'pipeSmoke',7,62,.08),
        clusterTube:DKAttackProfile('pump',25,25,.16,6,5,2,'clusterFuses',8,71,.19),
        seismicBazooka:DKAttackProfile('recoil',28,29,.2,8,7,4,'faultRings',9,91,.3),
        dragonwakeBazooka:DKAttackProfile('bite',29,31,.3,10,8,5,'dragonWake',12,112,.41)
    },"weapons/families/bazooka");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('pipeRocket',{
    prepareVolley:function(c){c.power*=c.familyTier===2?1.18:c.familyTier===1?1.08:1;},
    configureProjectile:function(c){c.opts.type='rocket';c.opts.radius=9;c.opts.blast=c.weapon.blast*(c.familyTier===2?1.2:c.familyTier===1?1.1:1);c.opts.life=98;c.opts.fragments=(c.weapon.fragments||0)+(c.familyTier===2?1:0);c.opts.quake=!!c.weapon.quake;c.opts.flameTrail=!!c.weapon.flameTrail;c.opts.status=c.weapon.status||'';c.opts.knockback=6;}
},'weapons/families/bazooka');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('clusterTube',{
    prepareVolley:function(c){c.power*=c.familyTier===2?1.18:c.familyTier===1?1.08:1;},
    configureProjectile:function(c){c.opts.type='rocket';c.opts.radius=9;c.opts.blast=c.weapon.blast*(c.familyTier===2?1.2:c.familyTier===1?1.1:1);c.opts.life=98;c.opts.fragments=(c.weapon.fragments||0)+(c.familyTier===2?1:0);c.opts.quake=!!c.weapon.quake;c.opts.flameTrail=!!c.weapon.flameTrail;c.opts.status=c.weapon.status||'';c.opts.knockback=6;}
},'weapons/families/bazooka');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('seismicBazooka',{
    prepareVolley:function(c){c.power*=c.familyTier===2?1.18:c.familyTier===1?1.08:1;},
    configureProjectile:function(c){c.opts.type='rocket';c.opts.radius=9;c.opts.blast=c.weapon.blast*(c.familyTier===2?1.2:c.familyTier===1?1.1:1);c.opts.life=98;c.opts.fragments=(c.weapon.fragments||0)+(c.familyTier===2?1:0);c.opts.quake=!!c.weapon.quake;c.opts.flameTrail=!!c.weapon.flameTrail;c.opts.status=c.weapon.status||'';c.opts.knockback=6;}
},'weapons/families/bazooka');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('dragonwakeBazooka',{
    prepareVolley:function(c){c.power*=c.familyTier===2?1.18:c.familyTier===1?1.08:1;},
    configureProjectile:function(c){c.opts.type='rocket';c.opts.radius=9;c.opts.blast=c.weapon.blast*(c.familyTier===2?1.2:c.familyTier===1?1.1:1);c.opts.life=98;c.opts.fragments=(c.weapon.fragments||0)+(c.familyTier===2?1:0);c.opts.quake=!!c.weapon.quake;c.opts.flameTrail=!!c.weapon.flameTrail;c.opts.status=c.weapon.status||'';c.opts.knockback=6;}
},'weapons/families/bazooka');

// Held-weapon art lives with the weapon content, not in game.js.
function render_pipeRocket_clusterTube_seismicBazooka_dragonwakeBazooka(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle=w.id==='dragonwakeBazooka'?'#321b20':w.id==='seismicBazooka'?'#243f50':'#47453e';ctx.beginPath();ctx.moveTo(2,-10);ctx.lineTo(46,-13);ctx.lineTo(66,-9);ctx.lineTo(70,9);ctx.lineTo(46,13);ctx.lineTo(2,10);ctx.closePath();ctx.fill();ctx.strokeStyle=w.color;ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#252321';ctx.fillRect(13,9,11,15);ctx.fillStyle=w.color;for(var br=0;br<3;br++)ctx.fillRect(13+br*14,-12,4,24);ctx.fillStyle='#0d1012';ctx.beginPath();ctx.ellipse(67,0,8,10,0,0,TAU);ctx.fill();ctx.strokeStyle='#f8f0d8';ctx.lineWidth=2;ctx.stroke();
                    if(w.id==='pipeRocket'){ctx.fillStyle='#d7c8a8';ctx.fillRect(-5,-7,8,14);ctx.fillStyle='#6d5f4c';ctx.fillRect(38,-4,19,8);}
                    else if(w.id==='clusterTube'){for(var ct=-1;ct<=1;ct++){ctx.fillStyle=ct?'#f7b955':'#fff3c4';ctx.beginPath();ctx.arc(48,ct*7,4+pulse,0,TAU);ctx.fill();}ctx.strokeStyle='#f7b955';ctx.beginPath();ctx.moveTo(48,-9);ctx.lineTo(57,-17);ctx.moveTo(48,9);ctx.lineTo(57,17);ctx.stroke();}
                    else if(w.id==='seismicBazooka'){ctx.save();ctx.translate(50,0);ctx.rotate(visualTick*.045);ctx.strokeStyle='#dff8ff';for(var sb=0;sb<6;sb++){ctx.rotate(TAU/6);ctx.fillStyle=sb%2?'#fff':w.color;ctx.fillRect(8,-3,12,6);}ctx.restore();ctx.strokeStyle=w.color;ctx.beginPath();ctx.moveTo(4,-16);ctx.lineTo(20,-11);ctx.moveTo(4,16);ctx.lineTo(20,11);ctx.stroke();}
                    else{ctx.fillStyle='#b85cff';ctx.beginPath();ctx.moveTo(53,-12);ctx.lineTo(65,-24);ctx.lineTo(63,-10);ctx.moveTo(53,12);ctx.lineTo(65,24);ctx.lineTo(63,10);ctx.fill();ctx.strokeStyle='#ffd4ff';ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(58,-5,2+pulse,0,TAU);ctx.fill();ctx.strokeStyle='#ff8a55';ctx.beginPath();ctx.moveTo(8,-13);ctx.lineTo(-5,-21);ctx.moveTo(8,13);ctx.lineTo(-5,21);ctx.stroke();}
}
DKRegister.weaponRenderer('pipeRocket',render_pipeRocket_clusterTube_seismicBazooka_dragonwakeBazooka,'weapons/families/bazooka');
DKRegister.weaponRenderer('clusterTube',render_pipeRocket_clusterTube_seismicBazooka_dragonwakeBazooka,'weapons/families/bazooka');
DKRegister.weaponRenderer('seismicBazooka',render_pipeRocket_clusterTube_seismicBazooka_dragonwakeBazooka,'weapons/families/bazooka');
DKRegister.weaponRenderer('dragonwakeBazooka',render_pipeRocket_clusterTube_seismicBazooka_dragonwakeBazooka,'weapons/families/bazooka');
}());

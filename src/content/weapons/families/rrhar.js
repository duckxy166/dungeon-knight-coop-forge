(function(){'use strict';DKRegister.weapons({
        inkboundPrimer: { name: 'INKBOUND PRIMER', icon: '▣', category: 'MAGIC', rarity: 'common', family: 'rrhar', damage: 3.1, rate: 480, speed: 10, mana: 2, color: '#8f6aa9', price: 27, handler: 'eyeBolt', desc: 'The first Open-Eye grimoire. A cheap ink-eye follows one target and curses it.' },
        whisperTome: { name: 'WHISPER TOME', icon: '▣', category: 'MAGIC', rarity: 'uncommon', family: 'rrhar', damage: 5.5, rate: 500, speed: 10, mana: 6, color: '#a875c9', price: 51, handler: 'eyeBolt', eyeHoming: .065, desc: 'A murmuring eye curves harder and leaves a longer curse.' },
        voidScripture: { name: 'VOID SCRIPTURE', icon: '▣', category: 'MAGIC', rarity: 'rare', family: 'rrhar', damage: 8.8, rate: 560, speed: 10, count: 2, spread: .18, mana: 12, color: '#9f62d0', price: 82, handler: 'eyeBolt', eyeHoming: .08, eyePierce: 1, desc: 'Twin eyes pierce one victim and deepen the curse behind it.' },
        openEyeCodex: { name: 'OPEN-EYE CODEX', icon: '▣', category: 'MAGIC', rarity: 'epic', family: 'rrhar', damage: 12.5, rate: 610, speed: 11, count: 3, spread: .28, mana: 20, color: '#d27cff', price: 129, handler: 'eyeBolt', eyeHoming: .095, eyePierce: 2, desc: 'Three unblinking sigils hunt, pierce, and lace a cluster in violet curses.' },
        rrharall: { name: "RRHAR'ALL: THE VEILED EYE", icon: '◉', category: 'MAGIC', rarity: 'legendary', family: 'rrhar', damage: 7, rate: 900, manaPerSecond: 3, ritualFrames: 150, ritualDamage: 38, targetCount: 3, blast: 170, color: '#f1c40f', price: 158, handler: 'rrharall', ritualKnockback: 9, ritualBurstDamage: 12, ritualToast: "RRHAR'ALL LIFTS THE VEIL", desc: 'Hold to bind three enemies. The veiled rite bites twice per second, then opens a golden-violet eye after 2.5 seconds.' }
    },{
        inkboundPrimer:DKAttackProfile('page',19,1,.28,0,13,2,'ink',4,50,.62),
        whisperTome:DKAttackProfile('page',21,1,.35,0,15,3,'whispers',5,58,.66),
        voidScripture:DKAttackProfile('page',23,1,.43,0,17,4,'eyes',6,68,.7),
        openEyeCodex:DKAttackProfile('page',26,1,.52,0,21,5,'openEyes',8,82,.74),
        rrharall:DKAttackProfile('channel',28,0,.26,0,22,5,'veiledEye',7,98,.34)
    },"weapons/families/rrhar");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('inkboundPrimer',{
    configureProjectile:function(c){c.opts.type='eye';c.opts.radius=6;c.opts.life=112;c.opts.homing=c.weapon.eyeHoming||.045;c.opts.pierce=c.weapon.eyePierce||0;c.opts.status='curse';}
},'weapons/families/rrhar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('whisperTome',{
    configureProjectile:function(c){c.opts.type='eye';c.opts.radius=6;c.opts.life=112;c.opts.homing=c.weapon.eyeHoming||.045;c.opts.pierce=c.weapon.eyePierce||0;c.opts.status='curse';}
},'weapons/families/rrhar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('voidScripture',{
    configureProjectile:function(c){c.opts.type='eye';c.opts.radius=6;c.opts.life=112;c.opts.homing=c.weapon.eyeHoming||.045;c.opts.pierce=c.weapon.eyePierce||0;c.opts.status='curse';}
},'weapons/families/rrhar');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('openEyeCodex',{
    configureProjectile:function(c){c.opts.type='eye';c.opts.radius=6;c.opts.life=112;c.opts.homing=c.weapon.eyeHoming||.045;c.opts.pierce=c.weapon.eyePierce||0;c.opts.status='curse';}
},'weapons/families/rrhar');


// Mechanics hook: edit this block to change how this weapon behaves.

// Full channel mechanic is module-owned. The engine only supplies generic combat primitives.
function rrFindTargets(p,w,api){var ranked=[],enemies=api.enemies();for(var i=0;i<enemies.length;i++){var e=enemies[i];if(e.dead)continue;var dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);if(d>900)continue;var diff=Math.atan2(Math.sin(Math.atan2(dy,dx)-p.angle),Math.cos(Math.atan2(dy,dx)-p.angle));if(Math.abs(diff)>1.35)continue;ranked.push({e:e,score:d+Math.abs(diff)*175});}ranked.sort(function(a,b){return a.score-b.score;});var ids=[],limit=w.targetCount||5;for(var r=0;r<Math.min(limit,ranked.length);r++)ids.push(ranked[r].e.id);return ids;}
function rrGetTargets(p,api){var result=[],enemies=api.enemies();for(var i=0;i<p.rrTargetIds.length;i++){var id=p.rrTargetIds[i];for(var j=0;j<enemies.length;j++){var e=enemies[j];if(e.id===id&&!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<=930){result.push(e);break;}}}return result;}
function rrUpdate(c){var p=c.player,w=c.weapon,api=c.api,step=c.step;if(!c.firing){p.resetRrharil();return true;}if(api.intervalElapsed(p,'rrRetargetClock',step,8)||!p.rrTargetIds.length)p.rrTargetIds=rrFindTargets(p,w,api);var targets=rrGetTargets(p,api);if(!targets.length){p.resetRrharil();return true;}var drain=(w.manaPerSecond||3)*step/60;if(p.mana+1e-4<drain){p.resetRrharil();if(api.gameTime()-p.lastManaWarn>700){p.lastManaWarn=api.gameTime();api.showToast('NOT ENOUGH MANA','#3498db');}return true;}p.mana-=drain;if(!p.rrActive)p.beginAttackAnimation(w,1);p.rrActive=true;p.rrTime+=step;p.rrDamageTick+=step;p.attackAnim=Math.max(p.attackAnim,7);if(api.intervalElapsed(p,'rrParticleClock',step,5)){var chosen=targets[Math.floor(Math.random()*targets.length)],travel=api.rand(.15,.9),tx=p.x+(chosen.x-p.x)*travel,ty=p.y+(chosen.y-p.y)*travel;api.addParticles(tx,ty,api.chance(.3)?'#fff':'#e61b5f',1,1.4);}while(p.rrDamageTick>=30){p.rrDamageTick-=30;for(var pulse=0;pulse<targets.length;pulse++){var victim=targets[pulse];if(victim.dead)continue;api.damageEnemy(victim,w.damage*api.weaponLevelScale(w)*p.damageMultiplier(),{status:'curse',direct:true,silent:targets.length>2});var pullA=Math.atan2(p.y-victim.y,p.x-victim.x);victim.x+=Math.cos(pullA)*4;victim.y+=Math.sin(pullA)*4;api.addRing(victim.x,victim.y,pulse===0?'#fff':'#e61b5f',34+p.rrTime*.12,2);}}var ritualFrames=w.ritualFrames||180,ritualDamage=w.ritualDamage||55;if(p.rrTime>=ritualFrames){for(var bloom=0;bloom<targets.length;bloom++){var target=targets[bloom],away=Math.atan2(target.y-p.y,target.x-p.x);api.addDarkBloom(target.x,target.y,w.blast);api.addRing(target.x,target.y,bloom===0?'#fff':w.color,w.blast,7);api.damageEnemy(target,ritualDamage*api.weaponLevelScale(w)*p.damageMultiplier(),{status:'curse',direct:true,knockback:w.ritualKnockback||9,angle:away});}if(targets[0])api.explode(targets[0].x,targets[0].y,w.blast,(w.ritualBurstDamage||12)*api.weaponLevelScale(w)*p.damageMultiplier(),true,w.color,'curse',false);api.showToast(w.ritualToast||'THE VEIL OPENS',w.color);p.rrTime=0;p.rrDamageTick=0;p.rrTargetIds=rrFindTargets(p,w,api);}return true;}

// World/channel visual is module-owned too.
function drawRrharChannel(c){
    var p=c.player,ctx=c.ctx,TAU=c.TAU,visualTick=c.visualTick;if(!p.rrActive)return;var targets=rrGetTargets(p,c.api);if(!targets.length)return;var sx=p.x+Math.cos(p.angle)*27,sy=p.y+Math.sin(p.angle)*27,grow=Math.max(0,Math.min(1,p.rrTime/(c.weapon.ritualFrames||180)));
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';for(var ti=0;ti<targets.length;ti++){var target=targets[ti],dx=target.x-sx,dy=target.y-sy,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
        for(var t=0;t<3;t++){var wobble=Math.sin(visualTick*.11+t*1.7+ti)*((6+t*2)*(1+grow));ctx.strokeStyle=t===0?'rgba(18,2,16,.96)':t===1?'#e61b5f':'#ffe1ea';ctx.lineWidth=9-t*3;ctx.globalAlpha=.26+t*.18;ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(sx+dx*.28+nx*wobble,sy+dy*.28+ny*wobble,sx+dx*.7-nx*wobble,sy+dy*.7-ny*wobble,target.x,target.y);ctx.stroke();}
        ctx.save();ctx.translate(target.x,target.y);ctx.rotate(visualTick*.028*(ti%2?-1:1));ctx.globalAlpha=.78;ctx.strokeStyle=ti===0?'#fff':'#ff354d';ctx.lineWidth=2;var roots=3+Math.floor(grow*5);for(var r=0;r<roots;r++){ctx.rotate(TAU/roots);ctx.beginPath();ctx.moveTo(target.radius+2,0);ctx.quadraticCurveTo(24+grow*18,-7-grow*6,35+grow*27,Math.sin(visualTick*.09+r)*6);ctx.stroke();}for(var pip=0;pip<3;pip++){var pa=pip*TAU/3-Math.PI/2;ctx.fillStyle=pip<Math.floor(p.rrTime/60)?'#fff':'#4a1022';ctx.beginPath();ctx.arc(Math.cos(pa)*(target.radius+20),Math.sin(pa)*(target.radius+20),3,0,TAU);ctx.fill();}ctx.restore();}
    ctx.restore();
}
DKRegister.weaponBehavior('rrharall',{
    updateFiring:rrUpdate,
    drawWorldEffect:drawRrharChannel
},'weapons/families/rrhar');

// Held-weapon art lives with the weapon content, not in game.js.
function render_inkboundPrimer_whisperTome_voidScripture_openEyeCodex_rrharall(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.save();ctx.translate(28,0);ctx.rotate(Math.sin(visualTick*.035)*.07);ctx.fillStyle=w.id==='rrharall'?'#17100a':'#160c20';ctx.strokeStyle=w.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-21,-15);ctx.lineTo(-3,-10);ctx.lineTo(0,14);ctx.lineTo(-21,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(21,-15);ctx.lineTo(3,-10);ctx.lineTo(0,14);ctx.lineTo(21,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#f8eaff';ctx.beginPath();ctx.ellipse(0,0,7+pulse*3,4+pulse,0,0,TAU);ctx.fill();ctx.fillStyle=w.id==='rrharall'?'#f1c40f':'#09040c';ctx.beginPath();ctx.arc(Math.sin(visualTick*.05)*2,0,2.5,0,TAU);ctx.fill();var eyeCount=w.rarity==='epic'||w.rarity==='legendary'?6:3;for(var ey=0;ey<eyeCount;ey++){var eya=ey*TAU/eyeCount+visualTick*.02;ctx.fillStyle=ey%2?'#fff':w.color;ctx.beginPath();ctx.arc(Math.cos(eya)*(22+ey%2*6),Math.sin(eya)*(15+ey%2*4),2,0,TAU);ctx.fill();}ctx.restore();
}
DKRegister.weaponRenderer('inkboundPrimer',render_inkboundPrimer_whisperTome_voidScripture_openEyeCodex_rrharall,'weapons/families/rrhar');
DKRegister.weaponRenderer('whisperTome',render_inkboundPrimer_whisperTome_voidScripture_openEyeCodex_rrharall,'weapons/families/rrhar');
DKRegister.weaponRenderer('voidScripture',render_inkboundPrimer_whisperTome_voidScripture_openEyeCodex_rrharall,'weapons/families/rrhar');
DKRegister.weaponRenderer('openEyeCodex',render_inkboundPrimer_whisperTome_voidScripture_openEyeCodex_rrharall,'weapons/families/rrhar');
DKRegister.weaponRenderer('rrharall',render_inkboundPrimer_whisperTome_voidScripture_openEyeCodex_rrharall,'weapons/families/rrhar');

// Mythical/legendary attack aura belongs to this weapon module.
function aura_rrharall(r){var ctx=r.ctx,p=r.player,w=r.weapon,q=r.progress,i=r.impact,v=r.visualTick,TAU=r.TAU;ctx.rotate(p.angle);ctx.strokeStyle='#fff7bd';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(55,0,34+i*18,13+i*8,0,0,TAU);ctx.stroke();ctx.strokeStyle=w.color;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(55,0,49+i*28,20+i*11,0,0,TAU);ctx.stroke();ctx.fillStyle='#140b1c';ctx.beginPath();ctx.arc(55,0,11+i*7,0,TAU);ctx.fill();ctx.fillStyle='#f1c40f';ctx.beginPath();ctx.arc(55+Math.sin(v*.05)*5,0,4+i*2,0,TAU);ctx.fill();for(var ve=0;ve<7;ve++){var vea=ve*TAU/7+q*1.8,ver=58+i*28;ctx.fillStyle=ve%2?'#fff7bd':'#a45cff';ctx.beginPath();ctx.arc(55+Math.cos(vea)*ver,Math.sin(vea)*ver*.42,2.5+ve%2,0,TAU);ctx.fill();}}
DKRegister.weaponAura('rrharall',aura_rrharall,'weapons/families/rrhar');
}());

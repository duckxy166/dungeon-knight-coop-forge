(function(){'use strict';DKRegister.weapons({
        coachScatter: { name:'COACH SCATTER',icon:'≋',category:'GUN',rarity:'common',family:'shotgun',damage:2.5,rate:590,speed:11,count:5,spread:.58,knockback:4,color:'#c59d6a',price:29,handler:'shotgun',desc:'Five honest pellets and a hard wooden stock. Best inside one dodge length.' },
        leverburstShotgun: { name:'LEVERBURST SHOTGUN',icon:'⌁',category:'GUN',rarity:'uncommon',family:'shotgun',damage:3.4,rate:520,speed:12,count:7,spread:.68,knockback:7,color:'#4fc47b',price:54,handler:'shotgun',desc:'A fast lever snap spreads seven pellets; point-blank hits cycle the action sooner.' },
        riftbreakerShotgun: { name:'RIFTBREAKER SHOTGUN',icon:'◇',category:'GUN',rarity:'rare',family:'shotgun',damage:4.8,rate:610,speed:14,count:8,spread:.74,knockback:9,status:'rift',color:'#4aa9e8',price:83,handler:'shotgun',desc:'Eight blue wedges tear short rifts. Struck enemies take amplified status damage.' },
        cathedralBreacher: { name:'CATHEDRAL BREACHER',icon:'✣',category:'GUN',rarity:'epic',family:'shotgun',damage:6.3,rate:670,speed:15,count:9,spread:.82,knockback:12,breachWave:true,color:'#b55bd8',price:120,handler:'shotgun',desc:'Nine stained-glass pellets arrive with a second semicircular light wave that destroys hostile shots.' }
    },{
        coachScatter:DKAttackProfile('pump',17,16,.11,4,2,1,'coachSmoke',5,52,.2),
        leverburstShotgun:DKAttackProfile('roll',18,18,.26,6,3,2,'leverArc',7,63,.31),
        riftbreakerShotgun:DKAttackProfile('phase',20,21,.14,7,5,3,'riftWedges',8,78,.42),
        cathedralBreacher:DKAttackProfile('toll',23,24,.24,9,7,5,'roseWindow',9,98,.53)
    },"weapons/families/shotgun");


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('coachScatter',{
    prepareVolley:function(c){c.count+=c.familyTier+(c.player.passives.shellBandolier?2:0);},
    configureProjectile:function(c){c.opts.life=58;c.opts.knockback=(c.weapon.knockback||3)+(c.familyTier?2:0);c.opts.type='pellet';c.opts.status=c.weapon.status||'';c.opts.pointBlankBonus=!!c.player.passives.shellBandolier;}
},'weapons/families/shotgun');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('leverburstShotgun',{
    prepareVolley:function(c){c.count+=c.familyTier+(c.player.passives.shellBandolier?2:0);},
    configureProjectile:function(c){c.opts.life=58;c.opts.knockback=(c.weapon.knockback||3)+(c.familyTier?2:0);c.opts.type='pellet';c.opts.status=c.weapon.status||'';c.opts.pointBlankBonus=!!c.player.passives.shellBandolier;}
},'weapons/families/shotgun');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('riftbreakerShotgun',{
    prepareVolley:function(c){c.count+=c.familyTier+(c.player.passives.shellBandolier?2:0);},
    configureProjectile:function(c){c.opts.life=58;c.opts.knockback=(c.weapon.knockback||3)+(c.familyTier?2:0);c.opts.type='pellet';c.opts.status=c.weapon.status||'';c.opts.pointBlankBonus=!!c.player.passives.shellBandolier;}
},'weapons/families/shotgun');


// Mechanics hook: edit this block to change how this weapon behaves.
DKRegister.weaponBehavior('cathedralBreacher',{
    prepareVolley:function(c){c.count+=c.familyTier+(c.player.passives.shellBandolier?2:0);},
    configureProjectile:function(c){c.opts.life=58;c.opts.knockback=(c.weapon.knockback||3)+(c.familyTier?2:0);c.opts.type='pellet';c.opts.status=c.weapon.status||'';c.opts.pointBlankBonus=!!c.player.passives.shellBandolier;},
    afterVolley:function(c){c.api.pushSlash({x:c.player.x,y:c.player.y,angle:c.angle,radius:185,arc:1.65,damage:c.weapon.damage*c.scale*c.player.damageMultiplier()*.55,color:'#f2dcff',deflect:true,knockback:5,status:'shock',sourceId:c.weapon.id});c.api.addRing(c.player.x+Math.cos(c.angle)*72,c.player.y+Math.sin(c.angle)*72,'#fff',145,6);}
},'weapons/families/shotgun');

// Held-weapon art lives with the weapon content, not in game.js.
function render_coachScatter_leverburstShotgun_riftbreakerShotgun_cathedralBreacher(r){
    var ctx=r.ctx,w=r.weapon,pulse=r.pulse,visualTick=r.visualTick,TAU=r.TAU,bow=r.bow;
    ctx.fillStyle=w.id==='cathedralBreacher'?'#321d3e':w.id==='riftbreakerShotgun'?'#203848':'#58432d';ctx.beginPath();ctx.moveTo(2,-8);ctx.lineTo(33,-10);ctx.lineTo(53,-7);ctx.lineTo(68,-5);ctx.lineTo(68,5);ctx.lineTo(52,7);ctx.lineTo(33,10);ctx.lineTo(2,8);ctx.closePath();ctx.fill();ctx.strokeStyle=w.color;ctx.lineWidth=2.5;ctx.stroke();ctx.fillStyle='#2e271f';ctx.beginPath();ctx.moveTo(14,7);ctx.lineTo(27,8);ctx.lineTo(21,23);ctx.lineTo(10,19);ctx.closePath();ctx.fill();ctx.stroke();
                    if(w.id==='coachScatter'){ctx.fillStyle='#c8a06f';ctx.fillRect(37,-7,31,5);ctx.fillRect(37,2,31,5);ctx.strokeStyle='#ffe6be';ctx.beginPath();ctx.moveTo(5,-5);ctx.lineTo(-12,-12);ctx.lineTo(-18,0);ctx.lineTo(5,5);ctx.stroke();}
                    else if(w.id==='leverburstShotgun'){ctx.fillStyle='#d8b178';ctx.fillRect(36,-6,32,4);ctx.fillRect(36,2,32,4);ctx.strokeStyle=w.color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(25,14,15,7,-.35,0,TAU);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(39,0,3+pulse,0,TAU);ctx.fill();}
                    else if(w.id==='riftbreakerShotgun'){ctx.fillStyle='#0c1620';for(var rw=-1;rw<=1;rw++){ctx.fillRect(38,rw*6-2,33,4);ctx.strokeStyle=rw?'#b9ecff':w.color;ctx.strokeRect(38,rw*6-2,33,4);}ctx.globalAlpha=.45;for(var rg=0;rg<3;rg++){ctx.strokeStyle=w.color;ctx.beginPath();ctx.ellipse(69+rg*5,0,5+rg*2,10+rg*3,0,0,TAU);ctx.stroke();}ctx.globalAlpha=1;}
                    else{ctx.save();ctx.translate(43,0);ctx.rotate(visualTick*.018);for(var cb=0;cb<8;cb++){ctx.rotate(TAU/8);ctx.fillStyle=cb%2?'#ffb6e8':'#87e8ff';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(13,-4);ctx.lineTo(13,4);ctx.closePath();ctx.fill();}ctx.fillStyle='#fff9dc';ctx.beginPath();ctx.arc(0,0,4+pulse*2,0,TAU);ctx.fill();ctx.restore();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(54,-7);ctx.lineTo(72,-3);ctx.moveTo(54,7);ctx.lineTo(72,3);ctx.stroke();}
}
DKRegister.weaponRenderer('coachScatter',render_coachScatter_leverburstShotgun_riftbreakerShotgun_cathedralBreacher,'weapons/families/shotgun');
DKRegister.weaponRenderer('leverburstShotgun',render_coachScatter_leverburstShotgun_riftbreakerShotgun_cathedralBreacher,'weapons/families/shotgun');
DKRegister.weaponRenderer('riftbreakerShotgun',render_coachScatter_leverburstShotgun_riftbreakerShotgun_cathedralBreacher,'weapons/families/shotgun');
DKRegister.weaponRenderer('cathedralBreacher',render_coachScatter_leverburstShotgun_riftbreakerShotgun_cathedralBreacher,'weapons/families/shotgun');
}());

(function(){
    'use strict';
    var content=window.DKContent,register=window.DKRegister;if(!content||!register)return;
    var TAU=Math.PI*2;
    var projectileModels={
        round:{id:'round',label:'Round',primitive:'round',accent:'#ffffff'},
        bolt:{id:'bolt',label:'Arc Bolt',primitive:'bolt',accent:'#ffffff'},
        arrow:{id:'arrow',label:'Arrow',primitive:'arrow',accent:'#f4ead0'},
        shard:{id:'shard',label:'Crystal Shard',primitive:'shard',accent:'#ffffff'},
        blade:{id:'blade',label:'Flying Blade',primitive:'blade',accent:'#ffffff'},
        shell:{id:'shell',label:'Shell',primitive:'shell',accent:'#3a3128'},
        rocket:{id:'rocket',label:'Rocket',primitive:'rocket',accent:'#fff2b5'},
        needle:{id:'needle',label:'Needle',primitive:'needle',accent:'#ffffff'},
        rune:{id:'rune',label:'Rune',primitive:'rune',accent:'#ffffff'},
        petal:{id:'petal',label:'Petal',primitive:'petal',accent:'#ffe4ec'},
        snowflake:{id:'snowflake',label:'Snowflake',primitive:'snowflake',accent:'#ffffff'},
        feather:{id:'feather',label:'Feather',primitive:'feather',accent:'#ffffff'},
        tadpole:{id:'tadpole',label:'Tadpole',primitive:'tadpole',accent:'#d8ffbd'},
        sword:{id:'sword',label:'Spectral Sword',primitive:'sword',accent:'#ffffff'},
        clockHand:{id:'clockHand',label:'Clock Hand',primitive:'clockHand',accent:'#fff3b0'},
        page:{id:'page',label:'Spell Page',primitive:'page',accent:'#7f692b'},
        note:{id:'note',label:'Music Note',primitive:'note',accent:'#ffffff'},
        crescent:{id:'crescent',label:'Moon Crescent',primitive:'crescent',accent:'#fff4bd'},
        anchor:{id:'anchor',label:'Tidal Anchor',primitive:'anchor',accent:'#c8f4ff'},
        thorn:{id:'thorn',label:'Briar Thorn',primitive:'thorn',accent:'#d6ffb8'},
        hourglass:{id:'hourglass',label:'Hourglass',primitive:'hourglass',accent:'#ffe8a3'},
        moth:{id:'moth',label:'Void Moth',primitive:'moth',accent:'#e8d7ff'},
        flame:{id:'flame',label:'Living Flame',primitive:'flame',accent:'#fff0a0'},
        bubble:{id:'bubble',label:'Water Bubble',primitive:'bubble',accent:'#e0fbff'},
        cog:{id:'cog',label:'Clockwork Cog',primitive:'cog',accent:'#ffe0a1'},
        bone:{id:'bone',label:'Moon Bone',primitive:'bone',accent:'#fff7dc'},
        plasmaNode:{id:'plasmaNode',label:'Circuit Node',primitive:'plasmaNode',accent:'#ffffff'},
        tracer:{id:'tracer',label:'Rifle Tracer',primitive:'tracer',accent:'#ffffff'},
        pellet:{id:'pellet',label:'Scatter Pellet',primitive:'pellet',accent:'#f4ead0'},
        grenade:{id:'grenade',label:'Impact Grenade',primitive:'grenade',accent:'#e9d6a5'},
        disc:{id:'disc',label:'Orbit Disc',primitive:'disc',accent:'#ffffff'},
        eye:{id:'eye',label:'Watcher Eye',primitive:'eye',accent:'#ffffff'},
        incense:{id:'incense',label:'Incense Ember',primitive:'incense',accent:'#fff1bd'},
        dart:{id:'dart',label:'Paper Dart',primitive:'dart',accent:'#fff9df'},
        star:{id:'star',label:'Falling Star',primitive:'star',accent:'#ffffff'},
        rail:{id:'rail',label:'Rail Lance',primitive:'rail',accent:'#ffffff'},
        droplet:{id:'droplet',label:'Tidal Droplet',primitive:'droplet',accent:'#e1fbff'},
        sunShard:{id:'sunShard',label:'Sun Shard',primitive:'sunShard',accent:'#fff9c9'}
    };
    var effectModels={
        ring:{id:'ring',label:'Ring',primitive:'ring'},
        burst:{id:'burst',label:'Radial Burst',primitive:'burst'},
        sparks:{id:'sparks',label:'Sparks',primitive:'sparks'},
        beam:{id:'beam',label:'Beam',primitive:'beam'},
        smoke:{id:'smoke',label:'Smoke',primitive:'smoke'},
        petals:{id:'petals',label:'Petal Bloom',primitive:'petals'},
        snowflake:{id:'snowflake',label:'Ice Fracture',primitive:'snowflake'},
        rune:{id:'rune',label:'Rune Seal',primitive:'rune'},
        slash:{id:'slash',label:'Slash Arc',primitive:'slash'},
        wave:{id:'wave',label:'Ground Wave',primitive:'wave'},
        afterimage:{id:'afterimage',label:'Afterimage Trail',primitive:'afterimage'},
        lightningWeb:{id:'lightningWeb',label:'Lightning Web',primitive:'lightningWeb'},
        constellation:{id:'constellation',label:'Frozen Constellation',primitive:'constellation'},
        clockCrack:{id:'clockCrack',label:'Clock Fracture',primitive:'clockCrack'},
        gravityLens:{id:'gravityLens',label:'Gravity Lens',primitive:'gravityLens'},
        slashStorm:{id:'slashStorm',label:'Orbiting Slash Storm',primitive:'slashStorm'},
        bloodSigil:{id:'bloodSigil',label:'Blood Sigil',primitive:'bloodSigil'},
        echoCopies:{id:'echoCopies',label:'Echo Copies',primitive:'echoCopies'},
        eclipse:{id:'eclipse',label:'Eclipse Shadow',primitive:'eclipse'},
        inkSplash:{id:'inkSplash',label:'Living Ink',primitive:'inkSplash'}
    };
    var statusEffects={
        burn:{id:'burn',name:'Burning',color:'#ff7a36',durationFrames:180,tickIntervalFrames:30,tickDamage:1.1,moveMultiplier:1,effectModelId:'sparks',runtimeKey:'burn',builtin:true},
        freeze:{id:'freeze',name:'Frozen',color:'#8edbff',durationFrames:115,tickIntervalFrames:0,tickDamage:0,moveMultiplier:.48,effectModelId:'snowflake',runtimeKey:'freeze',builtin:true},
        shock:{id:'shock',name:'Shocked',color:'#74b9ff',durationFrames:7,tickIntervalFrames:0,tickDamage:0,moveMultiplier:1,effectModelId:'burst',runtimeKey:'stun',builtin:true},
        poison:{id:'poison',name:'Poisoned',color:'#b6e86b',durationFrames:300,tickIntervalFrames:45,tickDamage:1.35,moveMultiplier:.92,effectModelId:'smoke',runtimeKey:'poison',builtin:true},
        curse:{id:'curse',name:'Cursed',color:'#b784ff',durationFrames:300,tickIntervalFrames:60,tickDamage:1,moveMultiplier:1,effectModelId:'rune',runtimeKey:'curse',builtin:true},
        rift:{id:'rift',name:'Rift Marked',color:'#ff5e8a',durationFrames:240,tickIntervalFrames:0,tickDamage:0,moveMultiplier:1,effectModelId:'ring',runtimeKey:'rift',builtin:true},
        bleed:{id:'bleed',name:'Bleeding',color:'#d94a55',durationFrames:240,tickIntervalFrames:35,tickDamage:1.45,moveMultiplier:.96,effectModelId:'bloodSigil',stackMode:'stack',maxStacks:5,builtin:false},
        brittle:{id:'brittle',name:'Brittle',color:'#bdefff',durationFrames:210,tickIntervalFrames:70,tickDamage:.8,moveMultiplier:.72,effectModelId:'constellation',stackMode:'intensity',maxStacks:4,builtin:false},
        marked:{id:'marked',name:'Echo Marked',color:'#d9b6ff',durationFrames:300,tickIntervalFrames:60,tickDamage:1.15,moveMultiplier:1,effectModelId:'echoCopies',stackMode:'refresh',maxStacks:1,builtin:false},
        silence:{id:'silence',name:'Silenced',color:'#8a8a9b',durationFrames:150,tickIntervalFrames:0,tickDamage:0,moveMultiplier:.86,effectModelId:'eclipse',stackMode:'refresh',maxStacks:1,builtin:false}
    };

    // Weapons without bespoke projectile renderers still need a strong visual
    // identity. These profiles are resolved lazily because the catalog loads
    // before the weapon modules. Bespoke renderers always take priority.
    var projectileProfiles={
        tracer:{modelId:'tracer',impactModelId:'sparks',impactScale:7,impactCount:4,impactDuration:8,trailModel:'line',scale:.9},
        pellet:{modelId:'pellet',impactModelId:'sparks',impactScale:6,impactCount:3,impactDuration:7,trailModel:'none',scale:.78},
        rocket:{modelId:'rocket',impactModelId:'burst',impactScale:14,impactCount:9,impactDuration:14,trailModel:'mist',scale:1.05},
        grenade:{modelId:'grenade',impactModelId:'burst',impactScale:13,impactCount:8,impactDuration:14,trailModel:'embers',scale:.95},
        bolt:{modelId:'bolt',impactModelId:'sparks',impactScale:8,impactCount:5,impactDuration:9,trailModel:'line',scale:.95},
        arrow:{modelId:'arrow',impactModelId:'sparks',impactScale:7,impactCount:4,impactDuration:8,trailModel:'none',scale:.9},
        eye:{modelId:'eye',impactModelId:'inkSplash',impactScale:12,impactCount:7,impactDuration:15,trailModel:'ribbon',scale:.88},
        disc:{modelId:'disc',impactModelId:'ring',impactScale:11,impactCount:6,impactDuration:12,trailModel:'ribbon',scale:.92},
        incense:{modelId:'incense',impactModelId:'smoke',impactScale:13,impactCount:7,impactDuration:17,trailModel:'mist',scale:.9},
        rune:{modelId:'rune',impactModelId:'rune',impactScale:11,impactCount:6,impactDuration:14,trailModel:'ribbon',scale:.86},
        blade:{modelId:'blade',impactModelId:'slash',impactScale:10,impactCount:5,impactDuration:10,trailModel:'line',scale:.9},
        shell:{modelId:'shell',impactModelId:'sparks',impactScale:9,impactCount:5,impactDuration:9,trailModel:'line',scale:.88},
        note:{modelId:'note',impactModelId:'wave',impactScale:13,impactCount:5,impactDuration:15,trailModel:'ribbon',scale:.9},
        star:{modelId:'star',impactModelId:'constellation',impactScale:13,impactCount:7,impactDuration:16,trailModel:'ribbon',scale:.9},
        needle:{modelId:'needle',impactModelId:'sparks',impactScale:7,impactCount:4,impactDuration:8,trailModel:'line',scale:.82},
        thorn:{modelId:'thorn',impactModelId:'petals',impactScale:11,impactCount:6,impactDuration:14,trailModel:'line',scale:.88},
        dart:{modelId:'dart',impactModelId:'slash',impactScale:9,impactCount:4,impactDuration:10,trailModel:'none',scale:.9},
        rail:{modelId:'rail',impactModelId:'beam',impactScale:12,impactCount:4,impactDuration:9,trailModel:'ribbon',scale:1},
        droplet:{modelId:'droplet',impactModelId:'wave',impactScale:12,impactCount:6,impactDuration:15,trailModel:'mist',scale:.9},
        sunShard:{modelId:'sunShard',impactModelId:'burst',impactScale:12,impactCount:8,impactDuration:13,trailModel:'embers',scale:.92},
        anchor:{modelId:'anchor',impactModelId:'wave',impactScale:14,impactCount:7,impactDuration:16,trailModel:'ribbon',scale:.88},
        bone:{modelId:'bone',impactModelId:'burst',impactScale:9,impactCount:5,impactDuration:11,trailModel:'none',scale:.86},
        plasmaNode:{modelId:'plasmaNode',impactModelId:'lightningWeb',impactScale:12,impactCount:6,impactDuration:13,trailModel:'ribbon',scale:.86},
        feather:{modelId:'feather',impactModelId:'burst',impactScale:10,impactCount:6,impactDuration:12,trailModel:'embers',scale:.88},
        clockHand:{modelId:'clockHand',impactModelId:'clockCrack',impactScale:12,impactCount:6,impactDuration:14,trailModel:'line',scale:.9},
        crescent:{modelId:'crescent',impactModelId:'eclipse',impactScale:12,impactCount:6,impactDuration:14,trailModel:'ribbon',scale:.88},
        shard:{modelId:'shard',impactModelId:'gravityLens',impactScale:11,impactCount:6,impactDuration:13,trailModel:'line',scale:.9}
    };
    var familyProfile={ar:'tracer',bazooka:'rocket',dawnstar:'grenade',heavenfall:'bolt',rrhar:'eye',seraph:'disc',shotgun:'pellet',smg:'tracer',sunlion:'incense'};
    var handlerProfile={
        ar:'tracer',bazooka:'rocket',familyCannon:'grenade',skyBow:'bolt',eyeBolt:'eye',rrharall:'eye',orbitDisk:'disc',shotgun:'pellet',smg:'tracer',incenseTier:'incense',sunlion:'incense',
        bullet:'tracer',scatter:'pellet',lance:'blade',snuffer:'incense',organ:'note',flail:'blade',cometBow:'star',starBow:'star',markArrow:'arrow',autocannon:'shell',hedgehog:'needle',hourhand:'clockHand',
        moss:'thorn',bow:'arrow',paperDart:'dart',pepperbox:'shell',phoenixFan:'feather',mortar:'grenade',bolt:'bolt',rail:'rail',anchor:'anchor',rrharil:'eye',chain:'plasmaNode',splitBow:'thorn',
        volleygun:'star',storm:'plasmaNode',sunshard:'sunShard',drumgun:'droplet',tuningFork:'note',crown:'blade',echoMaul:'blade',pick:'shard',hook:'crescent',shovel:'bone'
    };
    var weaponProfile={
        cathedralOrgan:'note',cometLongbow:'star',constellationBow:'star',falconRepeater:'arrow',graveBell:'bone',graveglassAutocannon:'shard',hedgehogBuckler:'needle',hourhandRapier:'clockHand',
        moonhook:'crescent',mossCharm:'thorn',oakBow:'arrow',paperDartFan:'dart',phoenixFan:'feather',pocketMortar:'grenade',reedCrossbow:'bolt',riftRail:'rail',riptideAnchor:'anchor',rrharil:'eye',
        sparkStaff:'plasmaNode',splitvineBow:'thorn',starfallVolleygun:'star',stormGrimoire:'plasmaNode',sunshardMusket:'sunShard',tidalDrumgun:'droplet',tuningFork:'note',undertakerShovel:'bone'
    };
    var typeProfile={arrow:'arrow',shell:'shell',page:'rune',note:'note',shard:'shard',sunRay:'sunShard',wasp:'needle',beetleWing:'feather'};
    var projectileProfileCache=Object.create(null);
    function weaponProjectileProfile(sourceId,projectile){
        var weapon=content.weapons[sourceId],profileId;
        if(weapon&&projectileProfileCache[sourceId])return projectileProfileCache[sourceId];
        if(weapon)profileId=weaponProfile[sourceId]||familyProfile[weapon.family]||handlerProfile[weapon.handler]||(weapon.category==='ARCHER'?'arrow':weapon.category==='MAGIC'?'rune':weapon.category==='MELEE'?'blade':'tracer');
        else profileId=typeProfile[projectile&&projectile.type]||'';
        var profile=projectileProfiles[profileId]||null;
        if(weapon&&profile)projectileProfileCache[sourceId]=profile;
        return profile;
    }
    Object.keys(projectileModels).forEach(function(id){register.projectileModel(id,projectileModels[id],'editor/visual-catalog');});
    Object.keys(effectModels).forEach(function(id){register.effectModel(id,effectModels[id],'editor/visual-catalog');});
    Object.keys(statusEffects).forEach(function(id){register.statusEffect(id,statusEffects[id],'editor/visual-catalog');});

    function model(table,value,fallback){if(value&&typeof value==='object')return value;return table[value]||table[fallback];}
    function number(value,fallback){value=Number(value);return isFinite(value)?value:fallback;}
    function projectile(ctx,value,options){
        if(window.DK3D){var p=options||{};window.DK3D.drawPreview(ctx,'projectile',Object.assign({},p,{modelId:value}),p.x||0,p.y||0,(p.radius||7)*5,(p.radius||7)*5);return;}
        options=options||{};var def=model(content.projectileModels,value,'round'),primitive=def.primitive||'round',color=options.color||def.color||'#fff',accent=options.accent||def.accent||'#fff',radius=Math.max(2,number(options.radius,5)),scale=Math.max(.35,number(options.scale,1)),tick=number(options.visualTick,0);ctx.save();ctx.scale(scale,scale);ctx.fillStyle=color;ctx.strokeStyle=accent;ctx.lineWidth=Math.max(1,1.25/scale);ctx.lineJoin='round';ctx.lineCap='round';
        if(typeof def.renderer==='function'){var customProjectile=options.projectile||{x:0,y:0,vx:1,vy:0,age:tick,color:color,radius:radius,type:'orb',sourceId:def.sourceId||''};def.renderer({ctx:ctx,projectile:customProjectile,TAU:TAU,visualTick:tick,api:options.api||{addRing:function(){},addParticles:function(){},addBeam:function(){}}});ctx.restore();return;}
        if(primitive==='legacyDynamic'){legacyProjectile(ctx,(options.projectile&&options.projectile.type)||'orb',{projectile:options.projectile||{radius:radius,color:color},visualTick:tick});ctx.restore();return;}
        if(primitive==='bolt'){ctx.fillRect(-10,-2.5,20,5);ctx.fillStyle=accent;ctx.fillRect(2,-1,10,2);}
        else if(primitive==='arrow'){ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-9,-4);ctx.lineTo(-4,0);ctx.lineTo(-9,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(10,0);ctx.stroke();}
        else if(primitive==='shard'){ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(-2,-7);ctx.lineTo(-10,2);ctx.lineTo(-2,6);ctx.closePath();ctx.fill();ctx.stroke();}
        else if(primitive==='blade'){ctx.beginPath();ctx.ellipse(0,0,13,3.8,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.fillRect(-1,-2,8,4);}
        else if(primitive==='shell'){ctx.fillRect(-8,-5,16,10);ctx.strokeRect(-8,-5,16,10);ctx.fillStyle=accent;ctx.fillRect(-9,-3,4,6);}
        else if(primitive==='rocket'){ctx.fillRect(-9,-4,17,8);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(7,-5);ctx.lineTo(7,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(-9,-3);ctx.lineTo(-15,-7);ctx.lineTo(-13,0);ctx.lineTo(-15,7);ctx.lineTo(-9,3);ctx.closePath();ctx.fill();}
        else if(primitive==='needle'){ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(-11,-2);ctx.lineTo(-11,2);ctx.closePath();ctx.fill();ctx.stroke();}
        else if(primitive==='rune'){ctx.rotate(tick*.04);ctx.beginPath();ctx.arc(0,0,radius+2,0,TAU);ctx.stroke();ctx.rotate(Math.PI/4);ctx.strokeRect(-radius*.6,-radius*.6,radius*1.2,radius*1.2);}
        else if(primitive==='petal'){ctx.beginPath();ctx.moveTo(12,0);ctx.quadraticCurveTo(0,-9,-10,0);ctx.quadraticCurveTo(0,9,12,0);ctx.fill();ctx.stroke();}
        else if(primitive==='snowflake'){for(var s=0;s<6;s++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(11,0);ctx.moveTo(7,0);ctx.lineTo(10,-3);ctx.moveTo(7,0);ctx.lineTo(10,3);ctx.stroke();}}
        else if(primitive==='feather'){ctx.beginPath();ctx.moveTo(13,0);ctx.quadraticCurveTo(1,-8,-11,-3);ctx.quadraticCurveTo(-2,5,13,0);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(11,0);ctx.stroke();}
        else if(primitive==='tadpole'){ctx.beginPath();ctx.arc(5,0,5,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-5,-5,-8,5,-14,0);ctx.stroke();}
        else if(primitive==='sword'){ctx.fillStyle=accent;ctx.fillRect(-9,-1.5,19,3);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(9,-4);ctx.lineTo(9,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillRect(-11,-5,2,10);}
        else if(primitive==='clockHand'){ctx.fillRect(-8,-2,20,4);ctx.beginPath();ctx.moveTo(15,0);ctx.lineTo(8,-5);ctx.lineTo(8,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(-7,0,4,0,TAU);ctx.stroke();}
        else if(primitive==='page'){ctx.fillStyle=color||'#f5e4a8';ctx.fillRect(-7,-9,14,18);ctx.strokeStyle=accent||'#7f692b';ctx.strokeRect(-7,-9,14,18);ctx.lineWidth=1;for(var line=-4;line<=4;line+=4){ctx.beginPath();ctx.moveTo(-4,line);ctx.lineTo(4,line);ctx.stroke();}}
        else if(primitive==='note'){ctx.beginPath();ctx.arc(0,3,5,0,TAU);ctx.fill();ctx.fillRect(3,-8,3,12);ctx.strokeStyle=accent;ctx.beginPath();ctx.arc(0,3,7,0,TAU);ctx.stroke();}
        else if(primitive==='crescent'){ctx.beginPath();ctx.arc(0,0,radius+4,-1.2,1.2);ctx.arc(4,0,radius+1,1.2,-1.2,true);ctx.closePath();ctx.fill();ctx.stroke();}
        else if(primitive==='anchor'){ctx.beginPath();ctx.moveTo(-9,-7);ctx.lineTo(9,-7);ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.moveTo(-8,4);ctx.quadraticCurveTo(0,14,8,4);ctx.stroke();ctx.beginPath();ctx.arc(0,-8,3,0,TAU);ctx.stroke();}
        else if(primitive==='thorn'){ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-10,-5);ctx.lineTo(-5,0);ctx.lineTo(-10,5);ctx.closePath();ctx.fill();ctx.stroke();}
        else if(primitive==='hourglass'){ctx.strokeRect(-7,-9,14,18);ctx.beginPath();ctx.moveTo(-6,-8);ctx.lineTo(6,8);ctx.moveTo(6,-8);ctx.lineTo(-6,8);ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(-5,7);ctx.lineTo(5,7);ctx.lineTo(0,1);ctx.closePath();ctx.fill();}
        else if(primitive==='moth'){ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-4,-10,-13,-5);ctx.quadraticCurveTo(-10,4,0,2);ctx.quadraticCurveTo(10,4,13,-5);ctx.quadraticCurveTo(4,-10,0,0);ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.fillRect(-1,-5,2,12);}
        else if(primitive==='flame'){ctx.beginPath();ctx.moveTo(10,6);ctx.quadraticCurveTo(13,-4,3,-12);ctx.quadraticCurveTo(4,-3,-4,-7);ctx.quadraticCurveTo(-12,2,-5,8);ctx.quadraticCurveTo(3,13,10,6);ctx.fill();ctx.stroke();}
        else if(primitive==='bubble'){ctx.globalAlpha=.42;ctx.beginPath();ctx.arc(0,0,radius+5,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.stroke();ctx.beginPath();ctx.arc(-3,-3,2,0,TAU);ctx.stroke();}
        else if(primitive==='cog'){for(var cg=0;cg<8;cg++){ctx.rotate(TAU/8);ctx.fillRect(radius+1,-2,5,4);}ctx.beginPath();ctx.arc(0,0,radius+2,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();}
        else if(primitive==='bone'){ctx.fillRect(-9,-2,18,4);for(var bo=-1;bo<=1;bo+=2){ctx.beginPath();ctx.arc(bo*9,-3,3,0,TAU);ctx.arc(bo*9,3,3,0,TAU);ctx.fill();}}
        else if(primitive==='plasmaNode'){ctx.rotate(tick*.06);ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(0,10);ctx.lineTo(-10,0);ctx.lineTo(0,-10);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();}
        else if(primitive==='tracer'){ctx.fillRect(-10,-2.5,17,5);ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(6,-4);ctx.lineTo(6,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=.58;ctx.fillRect(-17,-1,8,2);}
        else if(primitive==='pellet'){ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.strokeRect(-4,-4,8,8);ctx.fillStyle=accent;ctx.fillRect(-2,-2,4,4);}
        else if(primitive==='grenade'){ctx.beginPath();ctx.roundRect?ctx.roundRect(-8,-6,16,12,4):ctx.rect(-8,-6,16,12);ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.fillRect(-12,-4,4,8);ctx.beginPath();ctx.moveTo(8,-5);ctx.lineTo(14,-8);ctx.lineTo(12,0);ctx.lineTo(14,8);ctx.lineTo(8,5);ctx.closePath();ctx.fill();ctx.stroke();}
        else if(primitive==='disc'){ctx.rotate(tick*.08);ctx.beginPath();ctx.ellipse(0,0,11,6,0,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle=accent;ctx.beginPath();ctx.ellipse(0,0,6,3,0,0,TAU);ctx.stroke();for(var di=0;di<4;di++){ctx.rotate(TAU/4);ctx.fillRect(5,-1,7,2);}}
        else if(primitive==='eye'){ctx.beginPath();ctx.moveTo(-12,0);ctx.quadraticCurveTo(0,-9,12,0);ctx.quadraticCurveTo(0,9,-12,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.arc(2,0,4,0,TAU);ctx.fill();ctx.fillStyle='#16111d';ctx.beginPath();ctx.arc(3,0,1.8,0,TAU);ctx.fill();}
        else if(primitive==='incense'){ctx.beginPath();ctx.arc(2,1,6,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=accent;for(var inx=0;inx<3;inx++){ctx.globalAlpha=.35-inx*.08;ctx.beginPath();ctx.arc(-4-inx*4,-2-inx*2,3+inx,0,TAU);ctx.fill();}}
        else if(primitive==='dart'){ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-10,-7);ctx.lineTo(-4,0);ctx.lineTo(-10,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=accent;ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(-1,0);ctx.lineTo(-8,6);ctx.stroke();}
        else if(primitive==='star'){ctx.rotate(tick*.045);ctx.beginPath();for(var st=0;st<10;st++){var sr=st%2?4:11,sa=-Math.PI/2+st*Math.PI/5;if(st===0)ctx.moveTo(Math.cos(sa)*sr,Math.sin(sa)*sr);else ctx.lineTo(Math.cos(sa)*sr,Math.sin(sa)*sr);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.beginPath();ctx.arc(0,0,2.5,0,TAU);ctx.fill();}
        else if(primitive==='rail'){ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(5,-4);ctx.lineTo(-12,-3);ctx.lineTo(-7,0);ctx.lineTo(-12,3);ctx.lineTo(5,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.fillRect(-5,-1,17,2);}
        else if(primitive==='droplet'){ctx.beginPath();ctx.moveTo(12,0);ctx.quadraticCurveTo(0,-9,-10,0);ctx.quadraticCurveTo(0,9,12,0);ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(3,-2,2,0,TAU);ctx.fill();}
        else if(primitive==='sunShard'){ctx.rotate(tick*.025);ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(0,-7);ctx.lineTo(-9,0);ctx.lineTo(0,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=accent;for(var ss=0;ss<4;ss++){ctx.rotate(TAU/4);ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(14,0);ctx.stroke();}}
        else{ctx.beginPath();ctx.arc(0,0,radius,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(radius*.25,-radius*.25,Math.max(1,radius*.3),0,TAU);ctx.fill();}
        ctx.restore();
    }
    // Exact former engine fallback art, now a reusable selectable model shared
    // by Bullet Advanced and non-weapon projectiles.
    function legacyProjectile(ctx,type,options){
        options=options||{};var projectile=options.projectile||{},sourceId=projectile.sourceId||'',radius=Math.max(2,number(projectile.radius,4));
        if(type==='page'){ctx.fillStyle='#f5e4a8';ctx.fillRect(-7,-9,14,18);ctx.strokeStyle='#7f692b';ctx.strokeRect(-7,-9,14,18);ctx.lineWidth=1;for(var pageLine=-4;pageLine<=4;pageLine+=4){ctx.beginPath();ctx.moveTo(-4,pageLine);ctx.lineTo(4,pageLine);ctx.stroke();}}
        else if(type==='shard'||sourceId==='mirrorHazard'){ctx.fillStyle='#c9f5ff';ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-5,-6);ctx.lineTo(-2,0);ctx.lineTo(-5,6);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.stroke();}
        else if(type==='arrow'){ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-7,-3);ctx.lineTo(-3,0);ctx.lineTo(-7,3);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-5,0);ctx.lineTo(8,0);ctx.stroke();}
        else if(type==='shell'){ctx.fillRect(-6,-5,13,10);ctx.fillStyle='#333';ctx.fillRect(-7,-3,3,6);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(5,0,2,0,TAU);ctx.fill();}
        else if(type==='note'){ctx.beginPath();ctx.arc(0,3,5,0,TAU);ctx.fill();ctx.fillRect(3,-8,3,12);ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(0,3,7,0,TAU);ctx.stroke();}
        else{ctx.beginPath();ctx.arc(0,0,radius,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(radius*.25,-radius*.25,Math.max(1,radius*.3),0,TAU);ctx.fill();}
    }
    function effect(ctx,value,options){
        if(window.DK3D){var p=options||{};window.DK3D.drawPreview(ctx,'effect',Object.assign({},p,{modelId:value}),p.x||0,p.y||0,p.size||50,p.size||50);return;}
        options=options||{};var def=model(content.effectModels,value,'ring'),primitive=def.primitive||'ring',life=Math.max(0,Math.min(1,number(options.life,1))),progress=1-life,color=options.color||'#fff',accent=options.accent||'#fff',size=Math.max(4,number(options.size,80)),count=Math.max(2,Math.min(24,Math.round(number(options.count,8)))),angle=number(options.angle,0),spin=number(options.spin,0)+progress*1.8;ctx.save();if(isFinite(options.x)&&isFinite(options.y))ctx.translate(options.x,options.y);ctx.rotate(angle);ctx.globalAlpha=Math.max(.05,life);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(1,number(options.width,3)*Math.max(.25,life));ctx.lineCap='round';ctx.lineJoin='round';
        if(primitive==='ring'){ctx.beginPath();ctx.arc(0,0,size*(.18+.82*progress),0,TAU);ctx.stroke();}
        else if(primitive==='burst'||primitive==='sparks'){ctx.rotate(spin);for(var i=0;i<count;i++){ctx.rotate(TAU/count);var start=size*(primitive==='sparks'?.18:.08),end=size*(.32+.68*progress)*(i%2?1:.72);ctx.beginPath();ctx.moveTo(start,0);ctx.lineTo(end,0);ctx.stroke();}}
        else if(primitive==='beam'){ctx.strokeStyle=accent;ctx.lineWidth=Math.max(2,size*.09*life);ctx.beginPath();ctx.moveTo(-size*.7,0);ctx.lineTo(size*.7,0);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,size*.035*life);ctx.stroke();}
        else if(primitive==='smoke'){for(var sm=0;sm<count;sm++){var sa=sm*2.399+spin,sr=size*(.12+.55*progress)*(sm+1)/count;ctx.globalAlpha=life*.18;ctx.beginPath();ctx.arc(Math.cos(sa)*sr,Math.sin(sa)*sr-size*.25*progress,size*(.06+(sm%3)*.02),0,TAU);ctx.fill();}}
        else if(primitive==='petals'){ctx.rotate(spin*.45);for(var p=0;p<count;p++){ctx.rotate(TAU/count);ctx.beginPath();ctx.ellipse(size*(.12+.48*progress),0,size*.13*life,size*.045,0,0,TAU);ctx.fill();ctx.strokeStyle=accent;ctx.stroke();}}
        else if(primitive==='snowflake'){ctx.rotate(spin*.35);for(var f=0;f<6;f++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(size*(.2+.48*progress),0);ctx.moveTo(size*.4,0);ctx.lineTo(size*.52,-size*.1);ctx.moveTo(size*.4,0);ctx.lineTo(size*.52,size*.1);ctx.stroke();}}
        else if(primitive==='rune'){ctx.rotate(spin);ctx.beginPath();ctx.arc(0,0,size*(.2+.45*progress),0,TAU);ctx.stroke();for(var r=0;r<4;r++){ctx.rotate(Math.PI/2);ctx.strokeRect(size*.22,-size*.035,size*.18,size*.07);}}
        else if(primitive==='slash'){ctx.strokeStyle=accent;ctx.lineWidth=Math.max(1,size*.08*life);ctx.beginPath();ctx.arc(0,0,size*(.35+.25*progress),-.95,.95);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=Math.max(1,size*.035*life);ctx.beginPath();ctx.arc(0,0,size*(.41+.25*progress),-.9,.9);ctx.stroke();}
        else if(primitive==='wave'){for(var w=0;w<3;w++){ctx.globalAlpha=life*(1-w*.22);ctx.beginPath();ctx.ellipse(0,0,size*(.25+.65*progress+w*.13),size*(.08+.18*progress+w*.04),0,0,TAU);ctx.stroke();}}
        else if(primitive==='afterimage'){for(var ai=0;ai<count;ai++){ctx.globalAlpha=life*(1-ai/count)*.8;ctx.fillRect(-size*.55-ai*size*.08,-size*.035,size*.22,size*.07);}}
        else if(primitive==='lightningWeb'){var points=[];for(var lw=0;lw<count;lw++)points.push({x:Math.cos(lw*TAU/count+spin)*size*.5,y:Math.sin(lw*TAU/count+spin)*size*.5});for(var le=0;le<points.length;le++){ctx.beginPath();ctx.moveTo(points[le].x,points[le].y);ctx.lineTo(points[(le+2)%points.length].x,points[(le+2)%points.length].y);ctx.stroke();}}
        else if(primitive==='constellation'){for(var co=0;co<count;co++){var ca=co*2.399+spin,cr=size*(.15+.35*(co%4)/3);ctx.beginPath();ctx.arc(Math.cos(ca)*cr,Math.sin(ca)*cr,2+co%2,0,TAU);ctx.fill();if(co){ctx.beginPath();ctx.moveTo(Math.cos((co-1)*2.399+spin)*size*(.15+.35*((co-1)%4)/3),Math.sin((co-1)*2.399+spin)*size*(.15+.35*((co-1)%4)/3));ctx.lineTo(Math.cos(ca)*cr,Math.sin(ca)*cr);ctx.stroke();}}}
        else if(primitive==='clockCrack'){ctx.beginPath();ctx.arc(0,0,size*.5,0,TAU);ctx.stroke();for(var cc=0;cc<12;cc++){ctx.rotate(TAU/12);ctx.beginPath();ctx.moveTo(size*.36,0);ctx.lineTo(size*.5,0);ctx.stroke();}ctx.rotate(progress*TAU);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(size*.38,0);ctx.stroke();}
        else if(primitive==='gravityLens'){for(var gl=0;gl<4;gl++){ctx.rotate(.34);ctx.beginPath();ctx.ellipse(0,0,size*(.18+gl*.1),size*(.08+gl*.035),spin,0,TAU);ctx.stroke();}ctx.fillStyle='#000';ctx.beginPath();ctx.arc(0,0,size*.12,0,TAU);ctx.fill();}
        else if(primitive==='slashStorm'){for(var ss=0;ss<count;ss++){ctx.rotate(TAU/count);ctx.beginPath();ctx.arc(size*.35,0,size*.2,-.7,.7);ctx.stroke();}}
        else if(primitive==='bloodSigil'){ctx.rotate(spin*.25);ctx.beginPath();for(var bs=0;bs<10;bs++){var br=bs%2?size*.23:size*.5,ba=-Math.PI/2+bs*Math.PI/5;ctx.lineTo(Math.cos(ba)*br,Math.sin(ba)*br);}ctx.closePath();ctx.stroke();}
        else if(primitive==='echoCopies'){for(var ec=0;ec<4;ec++){ctx.globalAlpha=life*(.75-ec*.14);ctx.strokeRect(-size*.18-ec*size*.08,-size*.3,size*.36,size*.6);}}
        else if(primitive==='eclipse'){ctx.fillStyle='#000';ctx.beginPath();ctx.arc(0,0,size*.42,0,TAU);ctx.fill();ctx.strokeStyle=color;ctx.beginPath();ctx.arc(size*.12,0,size*.42,0,TAU);ctx.stroke();}
        else if(primitive==='inkSplash'){for(var ink=0;ink<count;ink++){ctx.rotate(TAU/count);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.24,size*.08,size*(.3+.3*progress),0);ctx.stroke();ctx.beginPath();ctx.arc(size*(.3+.3*progress),0,size*.035,0,TAU);ctx.fill();}}
        ctx.restore();
    }
    function status(ctx,definition,options){if(window.DK3D){var p=options||{},d=definition||{};window.DK3D.drawPreview(ctx,'effect',{modelId:d.effectModelId||'rune',color:d.color},0,0,(p.radius||18)*3,(p.radius||18)*3);return;}definition=definition||{};options=options||{};var radius=number(options.radius,18),tick=number(options.visualTick,0),count=Math.max(3,Math.min(10,Math.round(number(options.stacks,1))+3));ctx.save();ctx.strokeStyle=definition.color||'#fff';ctx.fillStyle=definition.color||'#fff';ctx.lineWidth=2;ctx.globalAlpha=.82;for(var i=0;i<count;i++){var a=tick*.025+i*TAU/count,r=radius+7+(i%2)*4;ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,2+(i%2),0,TAU);ctx.fill();}ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(0,0,radius+5+Math.sin(tick*.08)*2,0,TAU);ctx.stroke();ctx.restore();}
    window.DKVisuals={projectile:projectile,legacyProjectile:legacyProjectile,effect:effect,status:status,weaponProjectileProfile:weaponProjectileProfile,projectileProfiles:projectileProfiles,projectileModels:content.projectileModels,effectModels:content.effectModels,statusEffects:content.statusEffects};
}());

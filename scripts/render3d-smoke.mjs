import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.ttf':'font/ttf','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(path!==resolve(root)&&!path.startsWith(root.endsWith(sep)?root:root+sep))throw Error('Path');const target=extname(path)?path:resolve(path,'index.html');res.setHeader('Content-Type',mime[extname(target)]||'application/octet-stream');res.end(await readFile(target));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],report={};
await mkdir(resolve(root,'.cache/render3d'),{recursive:true});
try{
  const context=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(()=>window.DKGame&&window.DKEditorCore,null,{timeout:60000});
  await page.evaluate(()=>{DKGame.enterLobby({role:'local',name:'3D Knight',classId:'melee'});DKGame.startRun();DK_DEBUG.godMode(true);});
  await page.waitForFunction(()=>DKGame.renderer3d()?.stats?.entities>1);
  console.log('Checking boot');
  report.boot=await page.evaluate(()=>({stats:DKGame.renderer3d().stats,webgl:DKGame.renderer3d().renderer.getContext().getParameter(7938)}));
  assert.match(report.boot.webgl,/WebGL 2/);
  // Camera projection round trips and visual input directions at every zoom/aspect.
  report.projection=await page.evaluate(()=>{
    const r=DKGame.renderer3d(),results=[];
    for(const [width,height]of [[1280,800],[390,844],[844,390]])for(const zoom of [.7,1,1.35]){
      r.resize(width,height,1);r.setCamera(100,-150,zoom);
      for(const [x,y]of [[100,-150],[320,50],[-100,-380]]){const screen=r.worldToScreen(x,y),world=r.screenToWorld(screen.x,screen.y);if(Math.hypot(world.x-x,world.y-y)>.001)throw Error('Projection mismatch');}
      for(const [dx,dy]of [[1,0],[0,1],[-1,0],[0,-1],[1,-1]]){const d=DK3D.screenDirection(dx,dy),a=r.worldToScreen(100,-150),b=r.worldToScreen(100+d.x*10,-150+d.y*10),cross=(b.x-a.x)*dy-(b.y-a.y)*dx;if(Math.abs(cross)>.001)throw Error('Input direction mismatch');}
      results.push([width,height,zoom]);
    }r.resize(innerWidth,innerHeight,devicePixelRatio);return results.length;
  });
  assert.equal(report.projection,9);
  const start=await page.evaluate(()=>{const s=DKGame.renderState3d();s.player.x=250;s.player.y=380;return{x:s.player.x,y:s.player.y};});
  await page.keyboard.down('w');await page.waitForTimeout(200);await page.keyboard.up('w');
  const moved=await page.evaluate(()=>({x:DKGame.renderState3d().player.x,y:DKGame.renderState3d().player.y}));
  assert.ok(moved.x<start.x&&moved.y<start.y,'W moves screen-up in the actual game');
  await page.screenshot({path:resolve(root,'.cache/render3d/palace.png')});
  console.log('Checking coverage');
  report.coverage=await page.evaluate(()=>{
    const r=DKGame.renderer3d(),s=DKGame.renderState3d(),lib=r.lib;
    let weaponCount=0,enemyCount=0;
    for(const [id,w]of Object.entries(DKContent.weapons)){const model=lib.weapon({...w,id});if(!model.children.length)throw Error('Missing weapon '+id);weaponCount++;}
    for(const [kind,e]of Object.entries(DKContent.enemies)){if(!lib.actor({...e,kind}).children.length)throw Error('Missing enemy '+kind);enemyCount++;}
    for(const biome of DKContent.biomes)r.render({...s,biome,worldRevision:999,drawBossWarnings:null});
    return{weaponCount,enemyCount,biomes:DKContent.biomes.length};
  });
  assert.equal(report.coverage.weaponCount,130);assert.equal(report.coverage.biomes,16);
  // Every authored boss attack runs through the GPU vector warning path.
  console.log('Checking bosses');
  report.bosses=await page.evaluate(()=>{
    const keys=DKContent.biomes.map(b=>b.hazard),out=[];
    for(const key of keys){DK_DEBUG.legendaryBoss(key);const s=DKGame.renderState3d(),boss=s.enemies.find(e=>e.isBoss);const api={ctx:DKGame.renderer3d().vectors,visualTick:()=>s.tick,players:()=>s.players,playerById:id=>s.players.find(p=>p.netId===id),ARENA:1220};
      // Normal frame exercises arena/body adapters; several simulation steps enter tells.
      DKGame.renderer3d().render(s);out.push({key,vertices:api.ctx.count});
    }return out;
  });
  for(const key of ['frost','glyph','mirror','neon']){
    await page.evaluate(key=>{DK_DEBUG.legendaryBoss(key);DK_DEBUG.godMode(true);},key);
    await page.waitForTimeout(800);await page.screenshot({path:resolve(root,`.cache/render3d/${key}.png`)});
  }
  // Rendering cannot alter combat state, including pooled projectile ownership.
  console.log('Checking purity');
  report.purity=await page.evaluate(()=>{
    const s=DKGame.renderState3d(),r=DKGame.renderer3d(),p=s.player;
    const before=JSON.stringify([p.x,p.y,p.hp,p.angle,s.enemies.map(e=>[e.x,e.y,e.hp,e.stateTimer]),s.bullets.map(b=>[b.x,b.y,b.life,b.ownerId])]);
    const originalRandom=Math.random;let randomCalls=0;
    Math.random=()=>{randomCalls++;return originalRandom();};
    try{for(let i=0;i<5;i++)r.render({...s,worldRevision:700+i});}finally{Math.random=originalRandom;}
    if(randomCalls)throw Error('Renderer consumed gameplay randomness: '+randomCalls);
    return before===JSON.stringify([p.x,p.y,p.hp,p.angle,s.enemies.map(e=>[e.x,e.y,e.hp,e.stateTimer]),s.bullets.map(b=>[b.x,b.y,b.life,b.ownerId])]);
  });assert.equal(report.purity,true);
  console.log('Checking bossPatterns');
  report.bossPatterns=await page.evaluate(()=>DK_DEBUG.bossPatternTrial());
  assert.deepEqual(report.bossPatterns.errors,[]);
  assert.equal(report.bossPatterns.runs,report.bossPatterns.completed);
  console.log('Checking network');
  report.network=await page.evaluate(()=>{DK_DEBUG.godMode(false);const result={party:DK_DEBUG.multiplayerTrial(),prediction:DK_DEBUG.predictionRollbackTrial(),cadence:DK_DEBUG.networkCadenceTrial()};DK_DEBUG.godMode(true);return result;});
  assert.ok(Object.values(report.network.party).every(value=>value===true),JSON.stringify(report.network.party));
  assert.ok(Object.values(report.network.prediction).every(value=>value===true));
  assert.ok(Object.values(report.network.cadence).every(value=>value===true));
  console.log('Checking stress');
  report.stress=await page.evaluate(()=>{
    const s=DKGame.renderState3d(),r=DKGame.renderer3d(),bullets=Array.from({length:980},(_,i)=>({x:s.cameraX+(i%35-17)*18,y:s.cameraY+(Math.floor(i/35)-14)*18,radius:5,type:i%2?'arrow':'rocket',color:i%2?'#ffc98a':'#91dedc',vx:1,vy:0}));
    const samples=[];let firstMemory;
    for(let cycle=0;cycle<8;cycle++){const biome=DKContent.biomes[cycle%2],t=performance.now();r.render({...s,biome,worldRevision:800+cycle,bullets});samples.push(performance.now()-t);if(cycle===2)firstMemory={...r.stats};}
    if(r.stats.geometries>firstMemory.geometries+1||r.stats.textures>firstMemory.textures+1)throw Error('Scene GPU resources grew');
    const gl=r.renderer.getContext(),pixel=new Uint8Array(4),colors=new Set();
    for(let y=80;y<innerHeight;y+=100)for(let x=80;x<innerWidth;x+=100){gl.readPixels(x,y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);colors.add([...pixel].join(','));}
    if(colors.size<4)throw Error('Blank WebGL frame');
    return{bullets:bullets.length,frameMs:samples.map(n=>Math.round(n*100)/100),stats:r.stats,pixelColors:colors.size};
  });
  await page.evaluate(()=>DK_DEBUG.armory());await page.waitForTimeout(100);
  await page.screenshot({path:resolve(root,'.cache/render3d/armory.png')});
  await page.evaluate(()=>{DKGame.leaveToMenu();DKEditor.open();DKEditor.load('rustPistol');});
  await page.locator('#ew-name').fill('Three.js Preview Test');
  await page.locator('#ew-name').dispatchEvent('change');
  console.log('Checking editor');
  report.editor=await page.evaluate(()=>{
    const saved=DKEditor.save(),doc=DKEditor.current(),copy=JSON.parse(JSON.stringify(doc));
    const imported=DKEditorCore.normalizeDocument(copy),validation=DKEditorCore.validateDocument(imported);
    const ctx=document.getElementById('editor-weapon-preview').getContext('2d'),pixels=ctx.getImageData(130,80,100,100).data;let colored=0;
    for(let i=0;i<pixels.length;i+=4)if(pixels[i]+pixels[i+1]+pixels[i+2]>160)colored++;
    return{saved,id:doc.id,name:doc.name,valid:validation.valid??validation.ok,colored};
  });
  assert.equal(report.editor.saved,true);assert.equal(report.editor.name,'Three.js Preview Test');assert.ok(report.editor.colored>10);
  await page.screenshot({path:resolve(root,'.cache/render3d/editor.png')});
  await page.evaluate(()=>DKEditor.test());await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>DKGame.isWeaponTest()),true);
  await page.evaluate(()=>DKEditor.returnFromTest());
  assert.equal(await page.evaluate(()=>DKGame.isWeaponTest()),false);
  report.nativeMod=await page.evaluate(()=>{
    const definition={parts:[{shape:'box',size:[.8,.2,.2],color:'#98dced'}]};
    DKRegister.model3d('weapons','rustPistol',definition);const model=DKGame.renderer3d().lib.weapon({id:'rustPistol'});
    let rejected=false;try{DKRegister.model3d('weapons','bad',{parts:[{size:[NaN,1,1]}]});}catch{rejected=true;}
    return{parts:model.children.length,rejected};
  });assert.equal(report.nativeMod.parts,1);assert.equal(report.nativeMod.rejected,true);
  await page.evaluate(()=>{DKEditor.close();DKGame.startRun();});
  await page.evaluate(()=>DKGame.renderer3d().renderer.forceContextLoss());
  await page.waitForFunction(()=>DKGame.renderer3d().lost===true);
  await page.evaluate(()=>DKGame.renderer3d().renderer.forceContextRestore());
  await page.waitForFunction(()=>DKGame.renderer3d().lost===false,null,{timeout:15000});
  const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:1});
  const mobile=await touch.newPage();mobile.on('pageerror',e=>errors.push('mobile: '+e.message));
  await mobile.goto(`http://127.0.0.1:${server.address().port}/`);
  await mobile.waitForFunction(()=>window.DKGame&&window.DKEditorCore,null,{timeout:60000});
  await mobile.evaluate(()=>{DKGame.enterLobby({role:'local',classId:'magic',name:'Touch Knight'});DKGame.startRun();DK_DEBUG.godMode(true);const p=DKGame.renderState3d().player;p.x=280;p.y=380;});
  await mobile.locator('#joystick-zone').waitFor({state:'visible'});
  const zone=await mobile.locator('#joystick-zone').boundingBox(),cdp=await touch.newCDPSession(mobile);
  const beforeTouch=await mobile.evaluate(()=>({x:DKGame.renderState3d().player.x,y:DKGame.renderState3d().player.y}));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:zone.x+zone.width/2,y:zone.y+zone.height/2}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:zone.x+zone.width/2+35,y:zone.y+zone.height/2}]});
  await mobile.waitForTimeout(250);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const afterTouch=await mobile.evaluate(()=>({x:DKGame.renderState3d().player.x,y:DKGame.renderState3d().player.y}));
  assert.ok(afterTouch.x>beforeTouch.x&&afterTouch.y<beforeTouch.y,'Touch stick points screen-right');
  await mobile.screenshot({path:resolve(root,'.cache/render3d/mobile.png')});
  await mobile.setViewportSize({width:844,height:390});
  await mobile.waitForFunction(()=>DKGame.renderer3d().width===844&&DKGame.renderer3d().height===390);
  report.touch=await mobile.evaluate(()=>({width:DKGame.renderer3d().width,height:DKGame.renderer3d().height,joystick:!!document.getElementById('joystick-zone')}));
  assert.equal(report.touch.width,844);await touch.close();
  // A downloaded single HTML must boot without any network, including Three.js.
  const offline=await context.newPage();offline.on('pageerror',e=>errors.push('offline: '+e.message));await context.setOffline(true);
  await offline.goto(pathToFileURL(resolve(root,'dist/index.html')).href);
  await offline.waitForFunction(()=>window.DKGame?.renderer3d()?.stats?.triangles>100,null,{timeout:60000});
  report.offline=true;assert.deepEqual(errors,[]);
  console.log(JSON.stringify(report,null,2));
}catch(error){console.error(errors);throw error;}finally{await browser.close();await new Promise(r=>server.close(r));}

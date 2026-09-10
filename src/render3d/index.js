import * as THREE from 'three';
import { ModelLibrary, SCALE, color } from './models.js';
import { buildWorld, propModel } from './world.js';
import { VectorLayer } from './vector-layer.js';

const ELEVATION = 55 * Math.PI / 180;
const SQRT = Math.SQRT1_2;
// Input is expressed in screen axes; network messages continue to use world axes.
export function screenDirection(x, y) {
  const strength = Math.hypot(x,y); if (!strength) return {x:0,y:0};
  const vertical = y / Math.sin(ELEVATION), wx=(x+vertical)*SQRT, wy=(-x+vertical)*SQRT;
  const length=Math.hypot(wx,wy);return{x:wx/length*strength,y:wy/length*strength};
}
export function screenAngle(angle) {const d=screenDirection(Math.cos(angle),Math.sin(angle));return Math.atan2(d.y,d.x);}

class Renderer3D {
  constructor(canvas, content) {
    this.canvas=canvas;this.content=content;this.lib=new ModelLibrary(content);
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-10,10,10,-10,.1,220);
    this.raycaster=new THREE.Raycaster();this.ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);this.point=new THREE.Vector3();
    this.entities=new Map();this.free=new Map();this.labels=[];this.labelIndex=0;this.frame=0;this.ghosts=[];this.errors=new Set();
    this.layer=document.createElement('div');this.layer.className='world3d-labels';this.layer.setAttribute('aria-hidden','true');canvas.after(this.layer);
    this.message=document.createElement('div');this.message.className='world3d-message';this.message.hidden=true;this.message.setAttribute('role','status');canvas.after(this.message);
    this.onLost=event=>{event.preventDefault();this.lost=true;this.showMessage('Graphics paused. Restoring 3D…');};
    this.onRestore=()=>{this.lost=false;this.message.hidden=true;};
    canvas.addEventListener('webglcontextlost',this.onLost);canvas.addEventListener('webglcontextrestored',this.onRestore);
    try {
      this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.3;
      this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    }catch(error){this.failed=true;this.showMessage('This game needs WebGL 2. Enable hardware acceleration or open it in a WebGL 2 browser.');return;}
    this.scene.add(new THREE.HemisphereLight('#d4e3ff','#657080',2.8));
    this.sun=new THREE.DirectionalLight('#ffe4bf',2.4);this.sun.position.set(-12,24,10);this.sun.castShadow=true;
    Object.assign(this.sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:1,far:70});this.sun.shadow.mapSize.set(1024,1024);this.sun.shadow.bias=-.0005;this.sun.shadow.normalBias=.04;
    this.scene.add(this.sun,this.sun.target);
    this.vectors=new VectorLayer(this.scene,(...args)=>this.label(...args));
    this.particleMesh=new THREE.InstancedMesh(this.lib.geometry('crystal'),this.lib.material('#ffffff',true),4096);this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.particleMesh.frustumCulled=false;this.particleMesh.count=0;this.scene.add(this.particleMesh);
    this.instanceTransform=new THREE.Object3D();this.bulletTemplates=new Map();this.bulletBatches=new Map();this.bulletMatrix=new THREE.Matrix4();this.resize(innerWidth,innerHeight,devicePixelRatio||1);
  }
  showMessage(text){this.message.textContent=text;this.message.hidden=false;}
  resize(width,height,ratio=1){this.width=Math.max(1,width);this.height=Math.max(1,height);this.ratio=Math.max(.7,Math.min(2,ratio));if(this.renderer){this.renderer.setPixelRatio(this.ratio);this.renderer.setSize(this.width,this.height,false);} }
  setCamera(x,y,zoom=1){
    // Closer framing makes silhouettes readable; Settings still controls zoom.
    const framing=1.28,halfH=this.height*SCALE/Math.max(.1,zoom*framing)/2,halfW=this.width*SCALE/Math.max(.1,zoom*framing)/2;
    Object.assign(this.camera,{left:-halfW,right:halfW,top:halfH,bottom:-halfH});
    const target=new THREE.Vector3(x*SCALE,0,y*SCALE),distance=80;
    this.camera.position.copy(target).add(new THREE.Vector3(Math.cos(ELEVATION)*distance*SQRT,Math.sin(ELEVATION)*distance,Math.cos(ELEVATION)*distance*SQRT));
    this.camera.lookAt(target);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();
    if(this.sun){this.sun.target.position.copy(target);this.sun.position.copy(target).add(new THREE.Vector3(-12,24,10));}
  }
  screenToWorld(x,y){this.raycaster.setFromCamera(new THREE.Vector2(x/this.width*2-1,1-y/this.height*2),this.camera);const p=this.raycaster.ray.intersectPlane(this.ground,this.point);return p?{x:p.x/SCALE,y:p.z/SCALE}:null;}
  worldToScreen(x,y,height=0){const p=this.point.set(x*SCALE,height,y*SCALE).project(this.camera);return{x:(p.x+1)*this.width/2,y:(1-p.y)*this.height/2,visible:p.z>=-1&&p.z<=1&&Math.abs(p.x)<1.15&&Math.abs(p.y)<1.15};}
  visible(x,y,radius=0){const p=this.worldToScreen(x,y);const pad=radius*Math.max(.1,this.zoom||1);return p.x>=-pad&&p.x<=this.width+pad&&p.y>=-pad&&p.y<=this.height+pad;}
  label(text,x,y,height=0,tint='#ffffff',opacity=1){
    const pos=this.worldToScreen(x,y,height);if(!pos.visible||this.labelIndex>=160)return;
    let node=this.labels[this.labelIndex];if(!node){node=document.createElement('span');this.layer.append(node);this.labels.push(node);}
    this.labelIndex++;node.hidden=false;node.textContent=String(text);node.style.transform=`translate(${pos.x}px,${pos.y}px) translate(-50%,-100%)`;node.style.color=typeof tint==='string'?tint:'#fff';node.style.opacity=String(Math.max(0,Math.min(1,opacity)));
  }
  acquire(entity,key,create){
    let record=this.entities.get(entity);
    if(record&&record.key!==key){this.release(entity,record);record=null;}
    if(!record){const pool=this.free.get(key),mesh=pool?.pop()||create();mesh.scale.setScalar(1);mesh.rotation.set(0,0,0);record={key,mesh,seen:this.frame,x:entity.x,y:entity.y};this.entities.set(entity,record);this.scene.add(mesh);}
    record.seen=this.frame;record.mesh.visible=true;return record;
  }
  release(entity,record){record.mesh.removeFromParent();this.entities.delete(entity);const pool=this.free.get(record.key)||[];if(pool.length<12){pool.push(record.mesh);this.free.set(record.key,pool);} }
  clearScene(){
    if(this.world){this.world.traverse(o=>{if(o.isInstancedMesh)o.dispose();});this.world.removeFromParent();}
    for(const [entity,record]of this.entities)this.release(entity,record);
    this.free.clear();for(const ghost of this.ghosts)ghost.mesh.removeFromParent();this.ghosts=[];
    this.bulletTemplates?.clear();
    this.bulletBatches?.forEach(batch=>{batch.removeFromParent();batch.dispose();});this.bulletBatches?.clear();
    this.lib.dispose();
    if(this.particleMesh&&!this.disposed){this.particleMesh.geometry=this.lib.geometry('crystal');this.particleMesh.material=this.lib.material('#fff',true);this.particleMesh.count=0;}
  }
  actor(entity,isPlayer,state){
    if(entity.dead||entity.hidden)return;
    const id=isPlayer?entity.classId:entity.kind,key=`actor:${id}:${entity.color}:${entity.radius}:${!!entity.elite}`;
    const record=this.acquire(entity,key,()=>this.lib.actor(entity,isPlayer)),g=record.mesh,t=state.tick;
    const mx=entity.x-record.x,my=entity.y-record.y,moved=Math.hypot(mx,my);record.x=entity.x;record.y=entity.y;
    const facing=isPlayer?entity.angle:moved>.02?Math.atan2(my,mx):record.facing??entity.aim??0;record.facing=facing;
    g.position.set(entity.x*SCALE,0,entity.y*SCALE);g.rotation.set(0,-(facing||0),0);
    const body=g.userData.body||g;body.position.y=entity.isDashing?.07:Math.abs(Math.sin(t*.23))*Math.min(.045,moved*.03);
    // Render-only impact compression. Never touch entity coordinates or timing.
    if(record.hp!==undefined&&entity.hp<record.hp)record.hitUntil=t+10;
    record.hp=entity.hp;
    const impact=Math.max(0,((record.hitUntil||0)-t)/10);
    body.scale.set(1+impact*.12,1-impact*.16,1+impact*.12);
    if(g.userData.legs)g.userData.legs.forEach((leg,i)=>leg.rotation.z=Math.sin(t*.23+i*Math.PI)*Math.min(.5,moved*.2));
    if(g.userData.cape)g.userData.cape.rotation.z=-.18-Math.sin(t*.16)*Math.min(.16,moved*.06)-(entity.isDashing?.3:0);
    body.rotation.z=entity.downed?-Math.PI/2:entity.isDashing?-.25:0;
    if(isPlayer&&entity.weapon){
      const w=entity.weapon,weaponKey=[w.editorModelBase||w.modelBaseId||w.id,w.color,w.rarity,w.editorVisualScale||w.visualScale].join(':');
      if(g.userData.weaponKey!==weaponKey){g.userData.weapon?.removeFromParent();const weapon=this.lib.weapon(w);g.add(weapon);g.userData.weapon=weapon;g.userData.weaponKey=weaponKey;}
      const held=g.userData.weapon;held.position.set(.22-(entity.attackAnim>0?.09:0),.65,.27);held.scale.setScalar(.9*(w.editorVisualScale||w.visualScale||1));held.rotation.y=entity.attackAnim>0&&w.category==='MELEE'?Math.sin(entity.attackAnim*.2)*.8:0;
      held.visible=!entity.downed;
      if(entity===state.player){
        this.circle(entity.x,entity.y,(entity.radius||12)+5,'#d9fff5',2,.9);
        const a=entity.angle||0,r=(entity.radius||12)+12;
        const x=entity.x+Math.cos(a)*r,y=entity.y+Math.sin(a)*r;
        for(const side of [-1,1])this.line(x,y,x-Math.cos(a+side*.6)*9,y-Math.sin(a+side*.6)*9,'#d9fff5',2,.9);
      }
      if(state.settings.playerNames!=='off')this.label(entity.playerName||entity.className,entity.x,entity.y,1.25,entity.color);
      if(entity.downed)this.label('REVIVE',entity.x,entity.y,.7,'#ff9b97');
      if(entity.wardAngle&&entity.passives?.orbitWard){const vx=entity.x+Math.cos(entity.wardAngle)*50,vy=entity.y+Math.sin(entity.wardAngle)*50;this.circle(vx,vy,12,entity.color,2,.85);}
    }
    if(!isPlayer&&entity.hp<entity.maxHp)this.label(`${Math.ceil(entity.hp)} / ${Math.ceil(entity.maxHp)}`,entity.x,entity.y,(entity.radius||16)*SCALE*3.5,'#f6cebf');
    if(entity.burn>0||entity.poison>0||entity.freeze>0||Object.keys(entity.customStatuses||{}).length)this.circle(entity.x,entity.y,(entity.radius||16)+6,entity.freeze>0?'#8dd9ff':entity.poison>0?'#9be38a':'#ff875f',3,.9);
    if(!isPlayer){
      for(const prefix of ['signature','variant'])if(entity[`${prefix}State`]==='telegraph'){
        this.line(entity.x,entity.y,entity[`${prefix}TargetX`],entity[`${prefix}TargetY`],entity.color,2,.8);
        this.circle(entity[`${prefix}TargetX`],entity[`${prefix}TargetY`],28,entity.color,3,.8);
      }
      if(entity.state==='telegraph'){const a=entity.aim||0;this.line(entity.x,entity.y,entity.x+Math.cos(a)*220,entity.y+Math.sin(a)*220,'#ffdcad',5,.8);}
    }
  }
  circle(x,y,r,c,width=3,alpha=1){if(!Number.isFinite(x+y+r)||r<=0)return;const v=this.vectors;v.save();v.globalAlpha=alpha;v.strokeStyle=c||'#eebd79';v.lineWidth=width;v.beginPath();v.arc(x,y,r,0,Math.PI*2);v.stroke();v.restore();}
  fadeLandmarks(player){
    if(!player)return;const screen=this.worldToScreen(player.x,player.y,.55),position=new THREE.Vector3();
    this.world.traverse(mesh=>{
      if(!mesh.isMesh||mesh.isInstancedMesh)return;mesh.getWorldPosition(position);
      if(position.y<.45)return;
      const projected=this.worldToScreen(position.x/SCALE,position.z/SCALE,position.y);
      const fade=Math.abs(projected.x-screen.x)<48&&Math.abs(projected.y-screen.y)<80;
      if(!mesh.userData.baseMaterial)mesh.userData.baseMaterial=mesh.material;
      const base=mesh.userData.baseMaterial;mesh.material=fade?this.lib.material(`#${base.color.getHexString()}`,base.emissiveIntensity>0,.2):base;
    });
  }
  line(x,y,x2,y2,c,width=3,alpha=1){if(!Number.isFinite(x+y+x2+y2))return;const v=this.vectors;v.save();v.globalAlpha=alpha;v.strokeStyle=c||'#fff';v.lineWidth=width;v.beginPath();v.moveTo(x,y);v.lineTo(x2,y2);v.stroke();v.restore();}
  drawEffects(state){
    const v=this.vectors;
    for(const e of state.effects){
      if(e.type==='text'){this.label(e.text,e.x,e.y,.4,e.color,e.life);continue;}
      if(e.type==='beam'){this.line(e.x,e.y,e.x2,e.y2,e.color,e.width,e.life);continue;}
      if(e.points){for(let i=1;i<e.points.length;i++)this.line(e.points[i-1].x,e.points[i-1].y,e.points[i].x,e.points[i].y,e.color,3,e.life);continue;}
      if(e.type==='ring'){this.circle(e.x,e.y,e.radius,e.color,e.width,e.life);continue;}
      const record=this.acquire(e,`effect:${e.modelId||e.type}:${e.color}`,()=>this.lib.effect(e));
      record.mesh.position.set((e.x||0)*SCALE,.03,(e.y||0)*SCALE);record.mesh.scale.setScalar(Math.max(.02,(e.size||e.radius||25)*SCALE*(.3+.7*(e.life??1))));record.mesh.rotation.y=(e.angle||0)+(1-(e.life||1))*2;
    }
    for(const s of state.slashes){v.save();v.strokeStyle=s.color||'#ffc880';v.globalAlpha=Math.min(1,(s.life||1)/(s.maxLife||15));v.lineWidth=5;v.beginPath();v.arc(s.x,s.y,s.radius||50,(s.angle||0)-(s.arc||1.6)/2,(s.angle||0)+(s.arc||1.6)/2);v.stroke();v.restore();}
    for(const h of state.hazards){
      if(h.dead)continue;
      const r=h.radius||0,c=h.color||state.biome.accent,kind=h.kind||'';
      v.save();v.globalAlpha=.1+(h.pulse||0)*.08;v.fillStyle=c;v.beginPath();v.arc(h.x,h.y,r,0,Math.PI*2);v.fill();v.restore();
      this.circle(h.x,h.y,r,c,2,.65);
      if(h.x2!==undefined)this.line(h.x,h.y,h.x2,h.y2,c,h.width||4,.85);
      if(/mine|trap|starfall/i.test(kind))this.circle(h.x,h.y,r*.65,'#ffcb83',4,.5+.4*Math.sin(state.tick*.15));
    }
  }
  particles(state){
    const stride=state.settings.effectQuality==='low'?4:state.settings.effectQuality==='balanced'?2:1,t=this.instanceTransform;
    let count=0;for(let i=0;i<state.particles.length&&count<4096;i+=stride){const p=state.particles[i];if(!this.visible(p.x,p.y,40))continue;t.position.set(p.x*SCALE,.12+(1-p.life)*.3,p.y*SCALE);t.scale.setScalar(Math.max(.015,(p.size||3)*SCALE*p.life));t.rotation.set(state.tick*.02,0,state.tick*.03);t.updateMatrix();this.particleMesh.setMatrixAt(count,t.matrix);this.particleMesh.setColorAt(count,color(p.color));count++;}
    this.particleMesh.count=count;this.particleMesh.instanceMatrix.needsUpdate=true;if(this.particleMesh.instanceColor)this.particleMesh.instanceColor.needsUpdate=true;
  }
  projectiles(state){
    for(const batch of this.bulletBatches.values())batch.count=0;
    const transform=this.instanceTransform;
    for(const b of state.bullets){
      if(b.dead||!this.visible(b.x,b.y,80))continue;
      const id=b.editorProjectileModelId||b.modelId||b.type||'round',key=`${id}:${b.color}:${b.editorProjectileAccent||''}`;
      let parts=this.bulletTemplates.get(key);
      if(!parts){const model=this.lib.projectile({...b,modelId:id,accent:b.editorProjectileAccent});model.updateMatrixWorld(true);parts=[];model.traverse(part=>{if(part.isMesh)parts.push({geometry:part.geometry,matrix:part.matrixWorld.clone(),color:part.material.color});});this.bulletTemplates.set(key,parts);}
      transform.position.set(b.x*SCALE,.42,b.y*SCALE);transform.rotation.set(0,-Math.atan2(b.vy||0,b.vx||1),0);transform.scale.setScalar((b.radius||4)*SCALE*(b.editorProjectileScale||b.visualScale||1));transform.updateMatrix();
      for(const part of parts){let batch=this.bulletBatches.get(part.geometry);
        if(!batch){batch=new THREE.InstancedMesh(part.geometry,this.lib.material('#fff',true),8192);batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);batch.frustumCulled=false;batch.count=0;this.scene.add(batch);this.bulletBatches.set(part.geometry,batch);}
        if(batch.count>=8192)continue;
        this.bulletMatrix.multiplyMatrices(transform.matrix,part.matrix);batch.setMatrixAt(batch.count,this.bulletMatrix);batch.setColorAt(batch.count,part.color);batch.count++;
      }
      if(state.settings.effectQuality!=='low'&&b.trailCount>1){const a=(b.trailHead+11)%12;this.line(b.trailX[a],b.trailY[a],b.x,b.y,b.color,Math.max(1,(b.radius||4)*.4),.3);}
    }
    for(const batch of this.bulletBatches.values()){batch.instanceMatrix.needsUpdate=true;if(batch.instanceColor)batch.instanceColor.needsUpdate=true;}
    if(this.bulletTemplates.size>512)this.bulletTemplates.clear();
  }
  shop(state){
    if(state.scene!=='armory')return;
    for(let i=0;i<state.shopOffers.length;i++){
      const offer=state.shopOffers[i],at=state.shopPlatforms[i];if(!at)continue;
      const key=`shop:${i}:${offer.id||offer.weaponId||offer.name}:${!!offer.bought}`;
      const record=this.acquire(offer,key,()=>{const g=new THREE.Group();this.lib.part(g,'cylinder','#454154',[1.9,.25,1.9],[0,.12,0]);this.lib.ring(g,state.biome.accent,.95,.26);return g;});
      record.mesh.position.set(at.x*SCALE,0,at.y*SCALE);
      const id=offer.id||offer.weaponId,w=this.content.weapons[id];
      if(w&&!record.mesh.userData.display){const model=this.lib.weapon({...w,id});model.position.y=.85;record.mesh.add(model);record.mesh.userData.display=model;}
      if(record.mesh.userData.display){record.mesh.userData.display.rotation.y=state.tick*.008;record.mesh.userData.display.visible=!offer.bought;}
      this.label(offer.bought?'SOLD':`${offer.name||w?.name||offer.kind||'UPGRADE'} · ${offer.price||offer.cost||0}`,at.x,at.y,1.55,offer.color||'#e3d7c0');
    }
    for(const [at,text]of [[state.shopForge,'FORGE'],[state.shopCraft,'FABRICATOR']])if(at){
      const record=this.acquire(at,`station:${text}`,()=>{const g=new THREE.Group();this.lib.part(g,'box','#605463',[2,.7,1.5],[0,.35,0]);this.lib.part(g,'crystal',state.biome.accent,[.6,.8,.6],[0,1.1,0],true);return g;});record.mesh.position.set(at.x*SCALE,0,at.y*SCALE);this.label(text,at.x,at.y,1.8,'#f9d69d');
    }
  }
  render(state){
    if(this.failed||this.lost||this.disposed)return;
    this.lastState=state;this.frame++;this.labelIndex=0;this.zoom=state.zoom;this.setCamera(state.cameraX,state.cameraY,state.zoom);
    this.layer.hidden=state.scene==='menu';
    const revision=`${state.scene}:${state.worldRevision}:${state.biome.hazard}:${state.layoutId||''}:${this.content.model3dRevision||0}`;
    if(this.revision!==revision){this.clearScene();this.world=buildWorld(this.lib,state);this.scene.add(this.world);this.revision=revision;this.scene.background=color(state.biome.floor);}
    const quality=state.settings.effectQuality||'balanced';this.renderer.shadowMap.enabled=quality!=='low';
    this.vectors.begin();
    if(state.drawBossWarnings)state.drawBossWarnings(this.vectors);
    if(this.world.userData.statue){const fall=state.palaceStatueFallen?1:state.palaceCutscene?.statueFall||0;this.world.userData.statue.rotation.z=-fall*Math.PI*.48;}
    this.fadeLandmarks(state.player);
    for(const [list,kind]of [[state.obstacles,'obstacle'],[state.decor,'decor'],[state.props,'prop']])for(const e of list){
      if(e.dead||e.kind==='palaceStatue')continue;const record=this.acquire(e,`${kind}:${state.biome.hazard}:${e.kind}:${e.w}:${e.h}:${e.radius}:${e.variant}`,()=>propModel(this.lib,e,kind,state.biome));record.mesh.position.set(e.x*SCALE,0,e.y*SCALE);
      const screen=this.worldToScreen(e.x,e.y,kind==='obstacle'?1:0),player=state.player&&this.worldToScreen(state.player.x,state.player.y,.5);
      const occludes=player&&Math.abs(screen.x-player.x)<Math.max(40,(e.w||60)*state.zoom)&&Math.abs(screen.y-player.y)<90;
      record.mesh.traverse(o=>{if(!o.isMesh)return;if(!o.userData.baseMaterial)o.userData.baseMaterial=o.material;const base=o.userData.baseMaterial;o.material=occludes?this.lib.material(`#${base.color.getHexString()}`,false,.22):base;});
    }
    for(const p of state.players)this.actor(p,true,state);for(const e of state.enemies)this.actor(e,false,state);
    this.projectiles(state);
    for(const p of state.pickups){if(p.dead)continue;const c=p.kind==='coin'?'#f6c876':p.kind==='mana'?'#82cfff':p.kind==='resource'?(this.content.resources[p.resourceId]?.color||'#b2d4ad'):'#ea727a';
      const record=this.acquire(p,`pickup:${p.kind}:${c}`,()=>{const g=new THREE.Group();this.lib.part(g,p.kind==='coin'?'cylinder':'crystal',c,[.17,.2,.17],[0,0,0],true);return g;});record.mesh.position.set(p.x*SCALE,.22+Math.sin(state.tick*.06+(p.netId||0))*.04,p.y*SCALE);record.mesh.rotation.y=state.tick*.03;
    }
    for(const e of [...state.totems,...state.radiantWeapons]){if(e.dead)continue;const record=this.acquire(e,`summon:${e.kind||e.sourceId}:${e.color}`,()=>this.lib.projectile({type:e.type||'sword',color:e.color}));record.mesh.position.set(e.x*SCALE,.75,e.y*SCALE);record.mesh.scale.setScalar(.3);record.mesh.rotation.y=-(e.angle||state.tick*.03);}
    this.drawEffects(state);this.shop(state);this.particles(state);
    if(state.palaceCutscene?.active&&state.palaceCutscene.titleAlpha>0)this.label('DARK SPIRIT',state.cameraX,state.cameraY,2,'#f0d1ce',state.palaceCutscene.titleAlpha);
    if(state.player&&state.enemies.length>0&&state.enemies.length<4){const e=state.enemies.find(e=>!e.dead&&!this.visible(e.x,e.y,0));if(e){const p=this.worldToScreen(e.x,e.y),x=Math.max(32,Math.min(this.width-32,p.x)),y=Math.max(56,Math.min(this.height-56,p.y)),world=this.screenToWorld(x,y);if(world)this.label('◆ ENEMY',world.x,world.y,0,e.color);}}
    for(const [entity,record]of this.entities)if(record.seen!==this.frame){
      if(entity.dead&&record.key.startsWith('actor:')&&this.ghosts.length<24){this.entities.delete(entity);this.ghosts.push({mesh:record.mesh,until:state.tick+20});}else this.release(entity,record);
    }
    this.ghosts=this.ghosts.filter(ghost=>{const left=ghost.until-state.tick;if(left<=0){ghost.mesh.removeFromParent();return false;}ghost.mesh.scale.setScalar(Math.max(.02,left/20));ghost.mesh.rotation.z=(1-left/20)*1.5;return true;});
    if(this.free.size>128){for(const [key]of this.free){this.free.delete(key);if(this.free.size<=96)break;}}
    this.vectors.end();for(let i=this.labelIndex;i<this.labels.length;i++)this.labels[i].hidden=true;
    this.renderer.render(this.scene,this.camera);
    this.stats={drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,geometries:this.renderer.info.memory.geometries,textures:this.renderer.info.memory.textures,entities:this.entities.size};
  }
  dispose(){
    if(this.disposed)return;this.disposed=true;
    this.clearScene();this.vectors?.dispose();this.particleMesh?.dispose();this.bulletBatches?.forEach(batch=>batch.dispose());this.lib.dispose();this.renderer?.dispose();
    this.canvas.removeEventListener('webglcontextlost',this.onLost);this.canvas.removeEventListener('webglcontextrestored',this.onRestore);this.layer.remove();this.message.remove();
  }
}

let preview;
function drawPreview(context,kind,data,x,y,width=100,height=100){
  if(!context?.drawImage)return false;
  try{
    if(!preview){const canvas=document.createElement('canvas'),renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(256,256,false);renderer.outputColorSpace=THREE.SRGBColorSpace;const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight('#ffffff','#576079',3));const light=new THREE.DirectionalLight('#fff0db',3);light.position.set(3,5,4);scene.add(light);const camera=new THREE.OrthographicCamera(-1.2,1.2,1.2,-1.2,.1,30);camera.position.set(2,2.5,4);camera.lookAt(0,0,0);preview={renderer,scene,camera,lib:new ModelLibrary(window.DKContent)};}
    if(preview.lib.materials.size>256)preview.lib.dispose();
    const model=kind==='weapon'?preview.lib.weapon(data):kind==='projectile'?preview.lib.projectile(data):preview.lib.effect(data);
    const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());model.position.sub(center);const scale=1.8/Math.max(.1,size.x,size.y,size.z);model.scale.multiplyScalar(scale);model.position.multiplyScalar(scale);
    preview.scene.add(model);preview.renderer.render(preview.scene,preview.camera);context.drawImage(preview.renderer.domElement,x-width/2,y-height/2,width,height);model.removeFromParent();return true;
  }catch(error){return false;}
}

window.DK3D={create:(canvas,content)=>new Renderer3D(canvas,content),screenDirection,screenAngle,drawPreview,ModelLibrary,
  captureBuiltins(){window.DK_BUILTIN_BOSS_VISUALS=Object.fromEntries(Object.entries(window.DKContent.bossBehaviors).map(([id,b])=>[id,b.draw]));},
  disposePreviews(){if(preview){preview.lib.dispose();preview.renderer.dispose();preview=null;}}
};

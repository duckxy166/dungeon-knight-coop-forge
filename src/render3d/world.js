import * as THREE from 'three';
import { SCALE, hash } from './models.js';

export function buildWorld(lib, state) {
  const g = new THREE.Group(), b = state.biome, art = lib.content.biomeArt?.[b.hazard] || {};
  const floor = new THREE.Color(b.floor).lerp(new THREE.Color('#73798a'), .24);
  lib.part(g, 'box', `#${floor.getHexString()}`, [54.4,.28,54.4],[0,-.17,0]);
  // Repeated inlaid tiles use one draw call; gaps expose the darker foundation.
  const tileColor=new THREE.Color(b.floor).lerp(new THREE.Color(b.grid),.3).lerp(new THREE.Color('#818995'),.12);
  const tiles = new THREE.InstancedMesh(lib.geometry('box'),lib.material(`#${tileColor.getHexString()}`),27*27), matrix=new THREE.Matrix4();
  for(let z=0,i=0;z<27;z++)for(let x=0;x<27;x++,i++){matrix.compose(new THREE.Vector3((x-13)*2,-.014,(z-13)*2),new THREE.Quaternion(),new THREE.Vector3(1.99,.025,1.99));tiles.setMatrixAt(i,matrix);tiles.setColorAt(i,new THREE.Color().setScalar(.94+((x*7+z*13)%5)*.015));}
  tiles.receiveShadow=true;g.add(tiles);
  const trim=art.trim||b.accent, stone=art.wallTop||b.edge;
  for(const side of [-1,1]){lib.part(g,'box',stone,[54.8,1.5,.36],[0,.6,side*27.35]);lib.part(g,'box',stone,[.36,1.5,54.8],[side*27.35,.6,0]);}
  const isSocial=['armory','lobby','editorTest'].includes(state.scene);
  if(isSocial){lib.ring(g,trim,4);lib.ring(g,trim,4.3);return g;}
  const landmark=new THREE.Group();g.add(landmark);
  const p=(shape,c,size,at,glow=false)=>lib.part(landmark,shape,c,size,at,glow);
  switch(b.hazard){
    case 'ember': {
      p('box','#622f40',[3.3,.035,24],[0,.016,2]);p('box',stone,[2.6,.45,2.6],[0,.2,0]);
      const statue=lib.actor({radius:26,color:'#8e8790',classId:'melee'},true);statue.scale.setScalar(2.5);statue.position.y=.45;statue.rotation.y=Math.PI/4;landmark.add(statue);g.userData.statue=statue;
      for(const side of [-1,1])for(let z=-3;z<=3;z++){
        p('box',stone,[1.05,.2,1.05],[side*8,.1,z*6]);
        p('cylinder',stone,[.65,2.6,.65],[side*8,1.4,z*6]);
        p('box','#b0a19b',[.9,.16,.9],[side*8,2.75,z*6]);
        p('box',trim,[.06,1.05,.4],[side*8+.35,1.85,z*6]);
      }
      break;
    }
    case 'frost': for(let i=0;i<9;i++){const a=i*Math.PI*2/9;p('crystal',i%2?'#73a9bc':'#c8edf0',[.6,1.2+i%3,.6],[Math.cos(a)*5,.5,Math.sin(a)*5]);} break;
    case 'sand': p('cone','#9b7b51',[4,2.5,4],[0,1.2,0]);p('crystal',trim,[1,1.8,1],[0,3,0],true);break;
    case 'storm': for(let i=0;i<3;i++){const r=lib.ring(landmark,trim,2+i*.5,1+i*.8);r.rotation.x=.4+i*.6;}break;
    case 'void': p('sphere','#171323',[3,3,3],[0,2,0]);{const r=lib.ring(landmark,trim,2.1,2);r.rotation.x=.4;}break;
    case 'blood': p('cylinder','#552b42',[4,.3,4],[0,.12,0]);p('crystal','#dc6281',[1.8,2.7,1.8],[0,1.8,0],true);break;
    case 'thorn': for(let i=0;i<9;i++){const a=i*Math.PI*2/9;p('cone','#46745d',[.9,2.2,.9],[Math.cos(a)*3,1,Math.sin(a)*3]);}break;
    case 'tide': p('disc','#407987',[9,.3,9],[0,.015,0]);p('box',stone,[2.4,.025,14],[0,.016,0]);break;
    case 'cloud': for(const side of [-1,1]){p('box','#abc2d1',[9,.025,5],[side*6,.016,0]);p('sphere','#cad8df',[4,.6,3],[side*8,-.4,4]);}p('box',trim,[5,.025,2],[0,.016,0]);break;
    case 'glyph': for(const side of [-1,1])for(let i=-2;i<=2;i++){p('box',stone,[1.1,2.5,3],[side*6,1.25,i*4]);for(let j=0;j<5;j++)p('box',j%2?trim:'#9a7552',[1.2,.22,.36],[side*6,.5+j*.35,i*4]);}break;
    case 'mirror': for(let i=0;i<6;i++){const a=i*Math.PI/3;const c=p('crystal','#a1cbd9',[1.3,3,1.3],[Math.cos(a)*4,1.4,Math.sin(a)*4]);c.rotation.y=a;}lib.ring(landmark,trim,3);break;
    case 'neon': p('disc','#285c57',[10,.1,7],[0,.025,0]);for(let i=0;i<12;i++){const a=i*Math.PI/6;p('cylinder','#3e6c61',[.08,1.5,.08],[Math.cos(a)*5,.7,Math.sin(a)*4]);p('crystal',trim,[.18,.35,.18],[Math.cos(a)*5,1.6,Math.sin(a)*4],true);}break;
    case 'magma': p('box','#b15130',[8,.05,2],[0,.015,0]);p('box','#4e4444',[2,.3,7],[0,.12,0]);p('box',stone,[1.8,1,1.3],[0,.6,0]);break;
    case 'gear': lib.ring(landmark,trim,3);for(let i=0;i<12;i++){const a=i*Math.PI/6;const tooth=p('box',trim,[.7,.35,.7],[Math.cos(a)*3,.2,Math.sin(a)*3]);tooth.rotation.y=-a;}break;
    case 'moon': p('sphere','#afb4d2',[2.5,2.5,2.5],[0,3,0]);lib.ring(landmark,trim,3);break;
    case 'spore': for(let i=0;i<7;i++){const a=i*Math.PI*2/7,x=Math.cos(a)*3,z=Math.sin(a)*3;p('cylinder','#8e9c7b',[.3,1.3,.3],[x,.65,z]);p('sphere',trim,[1.7,.7,1.7],[x,1.45,z]);}break;
    default: lib.ring(landmark,trim,3);
  }
  landmark.userData.landmark=true;
  return g;
}

export function propModel(lib, item, kind, biome) {
  const g=new THREE.Group(), art=lib.content.biomeArt?.[biome.hazard]||{},stone=art.wallTop||biome.edge,tint=item.color||biome.accent;
  if(kind==='obstacle') {
    const w=(item.w||item.radius*2||60)*SCALE,d=(item.h||item.radius*2||60)*SCALE,h=item.w?.85:1.55;
    lib.part(g,item.w?'box':'cylinder',stone,[w,h,d],[0,h/2,0]);
    lib.part(g,'box','#8d8b8c',[w*1.02,.09,d*1.02],[0,h,0]);
    lib.part(g,'box',stone,[w*1.04,.13,d*1.04],[0,.07,0]);
    // Mortar bands communicate solid cover without a bright hazard-like top.
    lib.part(g,'box','#484b54',[w*1.005,.035,d*1.005],[0,h*.48,0]);
  } else if(kind==='decor') {
    const seed=hash(item.kind+item.variant),r=(item.radius||40)*SCALE;
    const nature=/thorn|spore|neon/.test(biome.hazard);
    if(nature){
      lib.part(g,'cylinder','#655242',[r*.2,.55,r*.2],[0,.27,0]);
      for(let i=0;i<3;i++)lib.part(g,biome.hazard==='spore'?'sphere':'cone','#567664',[r*(1-i*.18),.45,r*(1-i*.18)],[0,.5+i*.2,0]);
    }else for(let i=0;i<3;i++)lib.part(g,/frost|mirror|void/.test(biome.hazard)?'crystal':'sphere',stone,[r*.45,.18+(seed+i)%3*.1,r*.45],[(i-1)*r*.4,.14,(i%2)*r*.3]);
  } else {
    const r=(item.radius||26)*SCALE,name=item.kind||'',p=(shape,c,size,at,glow=false)=>lib.part(g,shape,c,size,at,glow);
    if(/crate|chest/i.test(name)){
      p('box','#826348',[r*1.6,.7,r*1.6],[0,.35,0]);
      for(const side of [-1,1])p('box','#c8b487',[r*1.65,.74,.075],[0,.37,side*r*.52]);
      p('box',tint,[.18,.18,.07],[0,.45,r*.82],true);
      for(const y of [.12,.57])p('box','#453e39',[r*1.64,.055,r*1.64],[0,y,0]);
    }else if(/anvil/i.test(name)){
      p('box','#6e5343',[r*1.3,.4,r*1.2],[0,.2,0]);p('box','#a6acb1',[r*1.9,.25,r],[0,.75,0]);p('box','#53616a',[r*.65,.4,r*.7],[0,.5,0]);
      const horn=p('cone','#b9c2c8',[r*.6,r*.8,r*.6],[r*1.15,.76,0]);horn.rotation.z=-Math.PI/2;
    }else if(/lantern|brazier|flame/i.test(name)){
      p('cylinder','#484655',[r*1.5,.15,r*1.5],[0,.075,0]);p('cylinder','#7e6e5a',[r*.35,.6,r*.35],[0,.4,0]);
      p('cylinder','#414550',[r*1.2,.2,r*1.2],[0,.72,0]);p('crystal',tint,[r*.7,.65,r*.7],[0,1.04,0],true);
      for(const side of [-1,1])p('box','#bdac7e',[.055,.6,.055],[side*r*.5,1,0]);
      if(/lantern/i.test(name))p('cone','#65585f',[r*1.3,.25,r*1.3],[0,1.4,0]);
    }else if(/rose|pod|flower|spore/i.test(name)){
      p('cylinder','#4d775b',[.12,.6,.12],[0,.3,0]);
      for(let i=0;i<5;i++){const a=i*Math.PI*2/5;p('sphere',tint,[r*.75,.3,r*.75],[Math.cos(a)*r*.35,.7,Math.sin(a)*r*.35]);}
      p('sphere','#edd8a0',[r*.5,.26,r*.5],[0,.84,0],true);
    }else if(/crystal|ice|prism|mirror/i.test(name)){
      for(let i=-1;i<=1;i++){const shard=p('crystal',tint,[r*.7,1.25-Math.abs(i)*.45,r*.7],[i*r*.4,.6-Math.abs(i)*.15,0]);shard.rotation.z=-i*.22;}
    }else{
      p('cylinder',stone,[r*1.5,.3,r*1.5],[0,.15,0]);p('cylinder','#a6a198',[r,.2,r],[0,.4,0]);
      p('crystal',tint,[r*.7,.65,r*.7],[0,.8,0],true);lib.ring(g,tint,r*.7,.05,.6);
    }
  }
  return g;
}

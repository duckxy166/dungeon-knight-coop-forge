import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const SCALE = 1 / 50;
export const hash = value => Array.from(String(value)).reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0, 7);
export const color = (value, fallback = '#b9bdc8') => new THREE.Color(typeof value === 'string' && !value.startsWith('rgba') ? value : fallback);

// Geometry and materials belong to a renderer, never to an individual entity.
export class ModelLibrary {
  constructor(content) {
    this.content = content;
    this.geometries = new Map();
    this.materials = new Map();
  }
  geometry(kind = 'box') {
    if (!this.geometries.has(kind)) {
      const shapes = {
        box: () => new THREE.BoxGeometry(1, 1, 1),
        softbox: () => new RoundedBoxGeometry(1, 1, 1, 1, .16),
        pebble: () => new THREE.IcosahedronGeometry(.5, 1),
        sphere: () => new THREE.IcosahedronGeometry(.5, 0),
        crystal: () => new THREE.OctahedronGeometry(.5),
        cone: () => new THREE.ConeGeometry(.5, 1, 6),
        cylinder: () => new THREE.CylinderGeometry(.5, .5, 1, 8),
        ring: () => new THREE.TorusGeometry(.5, .035, 4, 32),
        disc: () => new THREE.CylinderGeometry(.5, .5, .025, 32),
      };
      this.geometries.set(kind, (shapes[kind] || shapes.box)());
    }
    return this.geometries.get(kind);
  }
  material(tint, glow = false, opacity = 1) {
    const c = color(tint), key = `${c.getHexString()}:${glow}:${opacity}`;
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshStandardMaterial({
      color: c, roughness: .78, metalness: glow ? .2 : .12, flatShading: true,
      emissive: glow ? c : 0, emissiveIntensity: glow ? .65 : 0,
      transparent: opacity < 1, opacity, depthWrite: opacity >= 1,
    }));
    return this.materials.get(key);
  }
  part(parent, kind, tint, size, position = [0, 0, 0], glow = false, opacity = 1) {
    const mesh = new THREE.Mesh(this.geometry(kind), this.material(tint, glow, opacity));
    mesh.scale.set(...size); mesh.position.set(...position);
    mesh.castShadow = !glow && opacity === 1; mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  }
  ring(parent, tint, radius, y = .03, opacity = 1) {
    const mesh = this.part(parent, 'ring', tint, [radius * 2, radius * 2, radius * 2], [0, y, 0], true, opacity);
    mesh.rotation.x = -Math.PI / 2; return mesh;
  }
  custom(kind, id, data) {
    const spec = this.content.models3d?.[kind]?.[id];
    if (!spec || !Array.isArray(spec.parts)) return null;
    const group = new THREE.Group();
    for (const p of spec.parts.slice(0, 64)) {
      const size = (p.size || [1, 1, 1]).map(n => Math.max(.005, Math.min(30, Number(n) || .1)));
      const at = (p.position || [0, 0, 0]).map(n => Math.max(-30, Math.min(30, Number(n) || 0)));
      const mesh = this.part(group, p.shape, p.color || data.color, size, at, !!p.glow);
      if (Array.isArray(p.rotation)) mesh.rotation.set(...p.rotation.map(n => Number(n) || 0));
    }
    return group;
  }
  weapon(data = {}) {
    const id = data.editorModelBase || data.modelBaseId || data.id || 'unknown';
    const registered = this.custom('weapons', data.id, data)||this.custom('weapons', id, data); if (registered) return registered;
    const w = { ...this.content.weapons?.[id], ...data }, seed = hash(id);
    const name = `${id} ${w.name || ''} ${w.family || ''} ${w.handler || ''}`.toLowerCase();
    const g = new THREE.Group(), tint = w.color || '#b5bdcc', steel = '#c5d2d6', dark = '#303743';
    const length = .65 + (seed % 5) * .065;
    const part = (shape, c, size, at, glow) => this.part(g, shape==='box'?'softbox':shape, c, size, at, glow);
    let family = 'gun';
    if (/bow|crossbow|ballista/.test(name) || w.category === 'ARCHER') family = 'bow';
    else if (/book|tome|grimoire|codex|primer|scripture|rrhar/.test(name)) family = 'book';
    else if (/staff|wand|scepter|rod|incense/.test(name) || w.category === 'MAGIC') family = 'staff';
    else if (/axe|cleaver/.test(name)) family = 'axe';
    else if (/hammer|mace|anvil/.test(name)) family = 'hammer';
    else if (/spear|lance|trident|halberd|harpoon/.test(name)) family = 'spear';
    else if (w.category === 'MELEE' || /sword|blade|saber|katana|scythe|dagger/.test(name)) family = 'sword';
    else if (/book|tome|grimoire|codex/.test(name)) family = 'book';
    else if (/bazooka|rocket|cannon|launcher|heavenfall/.test(name)) family = 'cannon';
    if (['sword', 'spear', 'axe', 'hammer'].includes(family)) {
      part('cylinder', dark, [.08, .36, .08], [0, -.08, 0]);
      part('box', tint, [.35, .075, .11], [0, .1, 0]);
      if (family === 'sword') { part('box', steel, [.13, length, .055], [0, length / 2 + .14, 0]); part('cone', tint, [.14, .24, .06], [0, length + .24, 0]); }
      if (family === 'spear') { part('cylinder', dark, [.075, 1.4, .075], [0, .4, 0]); part('crystal', tint, [.27, .55, .1], [0, 1.2, 0]); }
      if (family === 'axe') { part('box', dark, [.07, .7, .08], [0, .4, 0]); part('crystal', tint, [.68, .52, .12], [.1, .7, 0]); }
      if (family === 'hammer') { part('box', dark, [.1, .7, .1], [0, .4, 0]); part('box', tint, [.65, .37, .36], [0, .7, 0]); }
      g.rotation.z = -Math.PI / 2;
    } else if (family === 'bow') {
      for (let i = -2; i <= 2; i++) {
        const limb = part('box', tint, [.075, .24, .09], [.22 - Math.abs(i) * .06, i * .2, 0]); limb.rotation.z = i * .22;
      }
      part('box', '#e9e2c3', [.015, .88, .015], [.02, 0, 0]);
      part('box', steel, [.78, .025, .025], [.3, 0, 0]);
    } else if (family === 'staff') {
      part('box', dark, [1.1, .06, .06], [.22, 0, 0]);
      part('crystal', tint, [.36, .45, .36], [.86, .03, 0], true);
      const halo = part('ring', tint, [.55, .55, .55], [.86, .03, 0], true); halo.rotation.y = Math.PI / 2;
    } else if (family === 'book') {
      part('box', tint, [.45, .12, .5], [.15, 0, 0]); part('box', '#eee0bf', [.4, .08, .43], [.16, .08, 0]);
      part('crystal', tint, [.2, .28, .2], [.15, .36, 0], true);
    } else {
      part('box', tint, [length * .65, .18, .18], [.25, 0, 0]);
      part('box', dark, [.12, .25, .12], [.05, -.16, 0]);
      const barrel = part('cylinder', steel, [family === 'cannon' ? .26 : .075, length * .6, family === 'cannon' ? .26 : .075], [.65, 0, 0]); barrel.rotation.z = Math.PI / 2;
      if (/shotgun|scatter/.test(name)) part('box', dark, [.4, .07, .23], [.56, -.07, 0]);
      if (/rifle|sniper|ar|rrhar/.test(name)) part('box', dark, [.23, .1, .07], [.23, .15, 0]);
      part('box', tint, [.12, .09, .2], [.85, 0, 0], true);
    }
    // Authored identity survives shared families: color, length, ornament count and rarity.
    const rarity = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'].indexOf(w.rarity);
    for (let i = 0; i < Math.max(0, rarity - 1); i++) part('crystal', tint, [.08, .13 + (seed % 3) * .035, .08], [.15 + i * .15, .19, 0], true);
    // Brass fittings and broad silhouettes read like crafted miniature weapons.
    if(family==='gun'||family==='cannon'){
      part('softbox','#d9aa60',[.1,.25,.25],[.48,0,0]);
      part('softbox','#292d43',[.055,.12,.12],[.92,0,0]);
      part('pebble','#8ee4df',[.075,.075,.075],[.25,.2,0],true);
    }else if(family!=='book')part('pebble','#ebc27b',[.14,.14,.14],[0,-.22,0]);
    g.userData.family = family; return g;
  }
  hero(data){
    const g=new THREE.Group(),body=new THREE.Group();g.add(body);g.userData.body=body;
    const c=data.color||'#dc6b68',ink='#30354c',gold='#e8ba70',ivory='#e6e9df',id=data.classId||'melee';
    const p=(shape,tint,size,at)=>this.part(body,shape,tint,size,at);
    const legs=[];
    for(const side of [-1,1]){
      legs.push(p('softbox',ink,[.3,.24,.22],[.06,.14,side*.17]));
      p('softbox',gold,[.23,.07,.24],[.04,.24,side*.17]);
      p('softbox',c,[.32,.3,.25],[0,.73,side*.32]);
      p('softbox',ivory,[.23,.1,.27],[.015,.88,side*.32]);
      p('pebble',ink,[.22,.24,.22],[.13,.53,side*.32]);
    }
    g.userData.legs=legs;
    p('softbox',c,[.43,.49,.49],[0,.52,0]);
    p('softbox',ivory,[.11,.28,.35],[.24,.62,0]);
    p('softbox',ink,[.46,.09,.51],[0,.34,0]);
    p('softbox',gold,[.1,.12,.13],[.25,.35,0]);
    p('crystal',gold,[.09,.15,.12],[.31,.63,0]);
    const cape=p('softbox',c,[.085,.65,.53],[-.28,.61,0]);cape.rotation.z=-.18;g.userData.cape=cape;
    // Oversized helmet, dark face inset, two readable eyes; forward is +X.
    p('softbox',ivory,[.57,.49,.59],[.025,1.08,0]);
    p('softbox',ink,[.08,.22,.45],[.315,1.07,0]);
    for(const side of [-1,1])p('softbox','#bcfff1',[.09,.075,.075],[.36,1.085,side*.125]);
    p('softbox',gold,[.1,.065,.48],[.33,.94,0]);
    if(/magic/i.test(id)){
      p('cylinder',ink,[.78,.09,.78],[0,1.3,0]);
      const hat=p('cone',c,[.63,.63,.63],[-.08,1.58,0]);hat.rotation.z=.18;
      p('cylinder',gold,[.54,.075,.54],[-.035,1.35,0]);
      p('crystal','#b7fff1',[.14,.2,.14],[-.16,1.89,0]);
    }else if(/archer/i.test(id)){
      p('softbox',c,[.62,.2,.62],[-.045,1.31,0]);
      const feather=p('crystal',gold,[.1,.45,.18],[-.19,1.57,-.18]);feather.rotation.z=-.4;
      p('cylinder','#826047',[.21,.51,.21],[-.38,.68,-.25]);
      for(const z of [-.3,-.21])p('box',ivory,[.035,.31,.035],[-.38,1,z]);
    }else if(/gun/i.test(id)){
      p('softbox',ink,[.65,.17,.67],[-.04,1.31,0]);
      p('softbox',gold,[.065,.12,.52],[.32,1.25,0]);
      for(const side of [-1,1])p('pebble','#93ded8',[.09,.15,.17],[.37,1.25,side*.14]);
      p('softbox','#926c48',[.22,.25,.19],[-.03,.4,-.36]);
    }else{
      p('softbox',gold,[.62,.085,.12],[.015,1.34,0]);
      for(let i=0;i<3;i++)p('pebble',c,[.19,.25-i*.03,.17],[-.14-i*.09,1.46-i*.05,0]);
      p('softbox',ink,[.14,.44,.37],[.03,.57,-.47]);
      p('softbox',c,[.15,.35,.28],[.05,.59,-.49]);
      p('crystal',gold,[.16,.2,.13],[.14,.59,-.49]);
    }
    this.ring(g,c,(data.radius||12)*SCALE*1.15);return g;
  }
  actor(data, isPlayer = false) {
    const custom = this.custom(isPlayer ? 'players' : 'enemies', data.kind || data.classId, data);
    if (custom) return custom;
    if(isPlayer)return this.hero(data);
    if(data.isBoss&&data.bossKey!=='ember')return this.boss(data);
    const g = new THREE.Group(), tint = data.color || '#ad4151', radius = (data.radius || 16) * SCALE;
    const seed = hash(data.kind || data.classId), boss = !!data.isBoss;
    const body = new THREE.Group(); g.add(body); g.userData.body = body;
    const p = (shape, c, size, at, glow) => this.part(body, shape==='box'?'softbox':shape==='sphere'?'pebble':shape, c, size, at, glow);
    const r = radius, h = isPlayer ? 1.04 : r * (boss ? 2.6 : 2.3);
    if (data.kind === 'trainingDummy') {
      p('cylinder', '#755139', [.12, .9, .12], [0, .45, 0]); p('box', '#ae8460', [.65, .08, .1], [0, .6, 0]);
      p('cylinder', '#e9d3a1', [.48, .12, .48], [0, .7, .04]).rotation.x = Math.PI / 2;
    } else {
      p(isPlayer || boss ? 'box' : seed % 2 ? 'sphere' : 'cone', tint, [r * 1.65, h * .58, r * 1.3], [0, h * .58, 0]);
      p(isPlayer ? 'box' : 'sphere', isPlayer ? '#c5cdd0' : tint, [r * 1.35, h * .37, r * 1.25], [0, h * 1.03, 0]);
      p('box', '#171e2a', [r * .3, h * .06, r * 1.26], [r * .65, h * 1.05, 0]);
      p('box', isPlayer ? '#c8fbec' : '#fff4b9', [r * .32, h * .035, r * .82], [r * .67, h * 1.08, 0], true);
      const legs = [];
      for (const side of [-1, 1]) {
        legs.push(p('box', '#333c4b', [r * .52, h * .32, r * .5], [0, h * .17, side * r * .5]));
        p('sphere', tint, [r * .8, h * .3, r * .65], [0, h * .7, side * r * .9]);
      }
      g.userData.legs = legs;
      if (isPlayer) {
        const cape=p('box', tint, [.07, .72, .48], [-r * .85, .56, 0]);cape.rotation.z=-.12;
        p('box','#d9e5e4',[.12,.28,.3],[r*.8,.67,0]);
        p('box','#c39a52',[r*1.8,.07,r*1.4],[0,.43,0]);
        for(const side of [-1,1]){
          p('box','#bccbd0',[.26,.18,.22],[0,.81,side*.26]);
          p('box','#718591',[.27,.13,.17],[.05,.085,side*.13]);
        }
        p('box','#e9c579',[.08,.09,.1],[r*.99,.67,0]);
        if (/magic/i.test(data.classId || '')){p('cone', tint, [.5, .5, .5], [0, 1.39, 0]);p('cylinder','#d6b77a',[.55,.045,.55],[0,1.19,0]);}
        else if (/gunner/i.test(data.classId || '')){p('box', '#344744', [.5, .12, .5], [-.05, 1.25, 0]);p('box','#eac47b',[.09,.07,.3],[.19,1.12,0],true);}
        else if (/archer/i.test(data.classId || '')){p('cone',tint,[.46,.35,.44],[-.04,1.3,0]);p('cylinder','#80603f',[.14,.5,.14],[-.24,.75,-.2]);}
        else {p('box','#d8b16a',[.33,.065,.065],[.025,1.29,0]);p('box',tint,[.085,.22,.08],[-.08,1.38,0]);}
      } else {
        const kind=data.kind||'',caster=/shooter|spiral|summon|mage|hex|caller/i.test(kind),armored=/tank|shield|warden|guard/i.test(kind);
        if(caster){
          p('cylinder','#30354c',[r*2.2,h*.12,r*2.2],[0,h*1.25,0]);
          p('cone',tint,[r*1.8,h*.75,r*1.8],[-r*.2,h*1.6,0]);
          p('cylinder','#c9a36b',[r*.15,h*1.5,r*.15],[r*.25,h*.8,r*1.2]);
          p('crystal','#c4ffee',[r*.6,h*.35,r*.6],[r*.25,h*1.7,r*1.2],true);
        }else if(armored){
          p('softbox','#abb9bd',[r*1.9,h*.45,r*1.7],[0,h*.64,0]);
          p('softbox','#e4be78',[r*.14,h*.55,r*1.8],[r*.95,h*.65,0]);
          for(const side of [-1,1])p('softbox',tint,[r*.9,h*.3,r*.8],[0,h*.95,side*r]);
        }else if(/bomb|nova|mine/i.test(kind)){
          p('pebble','#30354c',[r*1.3,h*.7,r*1.3],[-r*.6,h*.8,0]);
          p('cylinder','#e5be7e',[r*.14,h*.3,r*.14],[-r*.6,h*1.25,0]);
          p('crystal','#ffcf8a',[r*.3,h*.2,r*.3],[-r*.6,h*1.45,0],true);
        }else{
          for(const side of [-1,1]){const ear=p('cone','#e9c69d',[r*.55,h*.5,r*.55],[-r*.2,h*1.3,side*r*.7]);ear.rotation.x=side*.35;}
        }
        // Paired inset eyes give the small creatures an expressive face.
        for(const side of [-1,1]){
          p('softbox','#282c40',[r*.28,h*.2,r*.38],[r*.67,h*1.09,side*r*.39]);
          p('pebble','#fff0c8',[r*.3,h*.105,r*.18],[r*.79,h*1.11,side*r*.39],true);
        }
        p('box','#41313d',[r*.24,h*.1,r*.66],[r*.71,h*.9,0]);
        for(const side of [-1,1])p('cone','#e8d8b3',[r*.15,h*.15,r*.15],[r*.75,h*.86,side*r*.25]);
        for (let i = 0; i < (boss ? 7 : 0); i++) {
          const a = i * Math.PI * 2 / (boss ? 7 : 2 + seed % 3);
          p('cone', boss ? '#d8b96d' : tint, [r * .3, h * .35, r * .3], [Math.cos(a) * r * .6, h * 1.32, Math.sin(a) * r * .6]);
        }
        if (/wing|bat|moth|spirit|kite|wisp/i.test(data.kind || '')) for (const side of [-1, 1]) p('crystal', tint, [r, h * .5, r * 2], [-r * .3, h * .7, side * r * 1.3]);
      }
    }
    if (data.elite || boss) this.ring(g, '#f3cc77', r * 1.3);
    if (isPlayer) this.ring(g, tint, r * 1.15);
    return g;
  }
  boss(data){
    const g=new THREE.Group(),body=new THREE.Group();g.add(body);g.userData.body=body;
    const c=data.color||'#b3a6d5',dark='#354252',metal='#d4c8a5',r=(data.radius||50)*SCALE,k=data.bossKey;
    const p=(shape,tint,size,at,glow=false)=>this.part(body,shape,tint,size,at,glow);
    switch(k){
      case'frost':p('crystal',c,[r*1.2,r*2.5,r*1.2],[0,r*1.4,0]);for(let i=0;i<6;i++){const a=i*Math.PI/3;const arm=p('box','#c9f7ff',[r*2.8,.1,.13],[0,r*1.6,0],true);arm.rotation.y=a;}break;
      case'sand':for(const y of [.2,2.4])p('cylinder',metal,[r*2,.18,r*2],[0,r*y,0]);for(const side of [-1,1]){p('cylinder',metal,[.12,r*2.2,.12],[side*r*.7,r*1.3,0]);const cone=p('cone',c,[r*1.5,r,r*1.5],[0,r*(side>0?1.85:.75),0]);if(side>0)cone.rotation.z=Math.PI;}break;
      case'storm':p('sphere',dark,[r*1.8,r*1.8,r*1.8],[0,r*1.3,0]);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;p('crystal',c,[r*.6,r*.9,r*.6],[Math.cos(a)*r*1.4,r*1.5,Math.sin(a)*r*1.4],true);const ring=this.ring(body,c,r*1.1,r*1.3);ring.rotation.x=i*Math.PI/3;}break;
      case'void':p('sphere',dark,[r*2.2,r*1.6,r*2],[0,r*1.2,0]);p('sphere','#ecdadf',[r*.8,r,r*1.4],[r*.9,r*1.3,0]);p('crystal',c,[r*.4,r*.8,r*.5],[r*1.3,r*1.3,0],true);this.ring(body,c,r*1.5,r);break;
      case'blood':p('cylinder',metal,[r*.4,r*1.6,r*.4],[0,r*.8,0]);p('cone',c,[r*2,r*1.4,r*2],[0,r*1.7,0]).rotation.z=Math.PI;p('crystal','#ff91a3',[r*.8,r,r*.8],[0,r*2.5,0],true);break;
      case'thorn':p('cylinder','#41614b',[r*.4,r*1.5,r*.4],[0,r*.7,0]);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const leaf=p('crystal',c,[r*.8,r*1.8,r*.3],[Math.cos(a)*r*.6,r*1.4,Math.sin(a)*r*.6]);leaf.rotation.z=Math.sin(a)*.9;leaf.rotation.x=Math.cos(a)*.9;}break;
      case'tide':for(let i=0;i<8;i++){const a=i*.65;p('sphere',i%2?c:dark,[r*.85,r*.8,r*.85],[Math.cos(a)*r,r*.7,Math.sin(a)*r]);}p('cone',c,[r*.7,r,r*.7],[r,r*1.45,0]);break;
      case'cloud':p('box',c,[r,r*1.7,r],[0,r,0]);p('sphere','#edf4f5',[r,r,r],[0,r*2,0]);for(const side of [-1,1])for(let i=0;i<3;i++)p('crystal','#e5edf3',[r*.45,r*1.4,r*.5],[0,r*(1.3-i*.15),side*r*(1+i*.4)]);break;
      case'glyph':p('box',metal,[r*1.8,r*.4,r*2.2],[0,r,0]);for(const side of [-1,1]){const page=p('box',c,[r*.95,.12,r*1.9],[side*r*.45,r*1.3,0]);page.rotation.z=side*.3;}for(let i=0;i<3;i++)p('crystal',c,[r*.25,r*.4,r*.25],[Math.cos(i*2.1)*r,r*2,Math.sin(i*2.1)*r],true);break;
      case'mirror':for(let i=0;i<5;i++){const a=i*Math.PI*2/5;p('crystal',i%2?c:'#d0f5ff',[r*.8,r*2.6,r*.8],[Math.cos(a)*r*.7,r*1.35,Math.sin(a)*r*.7]);}break;
      case'neon':p('sphere',c,[r*2.2,r*1.3,r*1.8],[0,r*.8,0]);for(const side of [-1,1]){p('sphere',dark,[r*1.1,r*.6,r*.8],[-r*.4,r*.3,side*r]);p('sphere',c,[r*.65,r*.65,r*.65],[r*.7,r*1.35,side*r*.55]);p('box','#d2ffee',[r*.25,r*.23,r*.28],[r*.99,r*1.4,side*r*.55],true);}break;
      case'magma':p('box',dark,[r*1.2,r,r],[0,r*.5,0]);p('box',c,[r*2.4,r*.6,r*1.6],[0,r*1.25,0]);p('cone','#ffbb74',[r*.9,r*1.4,r*.9],[0,r*2.1,0],true);break;
      case'gear':p('cylinder',dark,[r*2.3,r*.6,r*2.3],[0,r*.8,0]);this.ring(body,metal,r,r*1.13);for(let i=0;i<12;i++){const a=i*Math.PI/6;p('box',c,[r*.4,r*.6,r*.4],[Math.cos(a)*r*1.2,r*.8,Math.sin(a)*r*1.2]);}p('box',metal,[r*1.4,.06,.1],[r*.2,r*1.2,0]);break;
      case'moon':p('sphere',dark,[r*.7,r*1.5,r*.7],[0,r*1.4,0]);for(const side of [-1,1]){const wing=p('crystal',c,[r*2.2,r*.4,r*1.8],[0,r*1.5,side*r]);wing.rotation.x=side*.3;}p('sphere','#f1eccd',[r*.7,r*.7,r*.7],[0,r*2.4,0],true);break;
      case'spore':p('cylinder','#c3ccb1',[r*.65,r*1.5,r*.65],[0,r*.75,0]);p('sphere',c,[r*2.6,r,r*2.6],[0,r*1.7,0]);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;p('sphere','#e7eed1',[r*.3,r*.15,r*.3],[Math.cos(a)*r*.75,r*2,Math.sin(a)*r*.75]);}break;
      default:p('crystal',c,[r*2,r*2,r*2],[0,r,0]);
    }
    this.ring(g,c,r*1.2);return g;
  }
  projectile(data = {}) {
    let id = data.modelId || data.projectileModelId || data.type || 'round';
    const custom = this.custom('projectiles', data.sourceId, data)||this.custom('projectiles', id, data); if (custom) return custom;
    const definition=this.content.projectileModels?.[id];
    if(definition?.sourceId){const profile=globalThis.window?.DKVisuals?.weaponProjectileProfile(definition.sourceId,data);id=profile?.modelId||data.type||'round';}
    if(id==='legacyDynamic')id=data.type||'round';
    const g = new THREE.Group(), c = data.color || '#efac69';
    if (/arrow|needle|lance|bolt|tracer|rifle|sword|blade|clockHand/i.test(id)) {
      this.part(g, 'box', c, [1.8, .3, .3], [0, 0, 0], true);
      const tip = this.part(g, 'cone', data.accent || '#fff1d2', [.55, .65, .55], [1, 0, 0], true); tip.rotation.z = -Math.PI / 2;
    } else if (/disc|rune|star|snow|crescent|note|page|petal/i.test(id)) {
      this.ring(g, c, .7, 0); this.part(g, /page|note/.test(id) ? 'box' : 'crystal', c, [1.1, .2, 1.1], [0, 0, 0], true);
    } else if (/rocket|shell|grenade|bomb/i.test(id)) {
      const core = this.part(g, 'cylinder', c, [.8, 1.8, .8]); core.rotation.z = Math.PI / 2;
      this.part(g, 'crystal', '#ffbf72', [.8, .5, .5], [-1, 0, 0], true);
    } else this.part(g, /shard|feather|thorn|flame/.test(id) ? 'crystal' : 'sphere', c, [1.4, 1.4, 1.4], [0, 0, 0], true);
    return g;
  }
  effect(data = {}) {
    const id = data.modelId || data.type || 'ring';
    const custom = this.custom('effects', data.sourceId, data)||this.custom('effects', id, data); if (custom) return custom;
    const g = new THREE.Group(), tint = data.color || '#f7cf9b';
    const name=String(id).toLowerCase();
    if(/smoke|mist|bloom|cloud|ink|poison/.test(name)){
      for(let i=0;i<5;i++){const a=i*Math.PI*2/5;this.part(g,'sphere',tint,[.45,.45,.45],[Math.cos(a)*.25,.15+i*.04,Math.sin(a)*.25],false,.4);}
    }else if(/wave|ripple|echo/.test(name)){
      for(let i=0;i<3;i++)this.ring(g,tint,.22+i*.17,.03+i*.015);
    }else if(/flash|muzzle|impact|burst|spark|star/.test(name)){
      for(let i=0;i<8;i++){const a=i*Math.PI/4;const ray=this.part(g,'crystal',tint,[.1,.65,.1],[Math.cos(a)*.22,.08,Math.sin(a)*.22],true);ray.rotation.z=Math.PI/2;ray.rotation.y=-a;}
    }else if(/slash|blade|shard|sword/.test(name)){
      for(let i=0;i<4;i++){const shard=this.part(g,'crystal',tint,[.09,.7,.15],[(i-1.5)*.18,.18,0],true);shard.rotation.z=-.6;}
    }else if(/lightning|beam|web/.test(name)){
      for(let i=0;i<5;i++){const bolt=this.part(g,'box',tint,[.3,.025,.04],[(i-2)*.18,.04,(i%2)*.12],true);bolt.rotation.y=i%2?-.65:.65;}
    }else{
      this.ring(g, tint, .5);
      if (!/ring|circle/.test(name)) for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3; this.part(g, 'crystal', tint, [.12, .25, .12], [Math.cos(a) * .4, .05, Math.sin(a) * .4], true);
      }
    }
    return g;
  }
  dispose() {
    this.geometries.forEach(g => g.dispose()); this.materials.forEach(m => m.dispose());
    this.geometries.clear(); this.materials.clear();
  }
}

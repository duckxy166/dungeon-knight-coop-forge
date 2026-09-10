import * as THREE from 'three';
import { SCALE } from './models.js';

// Authored boss warnings are vector paths, tessellated directly into world-space
// triangles. No Canvas context, bitmap, texture, or mod drawing callback is used.
export class VectorLayer {
  constructor(scene, label) {
    this.isWorld3D = true;
    this.label = label;
    this.capacity = 262144;
    this.positions = new Float32Array(this.capacity * 3);
    this.colors = new Float32Array(this.capacity * 4);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    this.geometry.setAttribute('tint', new THREE.BufferAttribute(this.colors, 4).setUsage(THREE.DynamicDrawUsage));
    this.material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      vertexShader: 'attribute vec4 tint; varying vec4 vTint; void main(){vTint=tint;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec4 vTint; void main(){gl_FragColor=vTint;}',
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material); this.mesh.frustumCulled = false; this.mesh.renderOrder = 2;
    scene.add(this.mesh); this.begin();
  }
  begin() {
    this.count = 0; this.stack = []; this.transform = [1, 0, 0, 1, 0, 0];
    this.globalAlpha = 1; this.lineWidth = 2; this.strokeStyle = '#fff'; this.fillStyle = '#fff'; this.dashes = [];
    this.beginPath();
  }
  end() {
    for (const name of ['position', 'tint']) {
      const attr = this.geometry.getAttribute(name); attr.clearUpdateRanges(); attr.addUpdateRange(0, this.count * attr.itemSize); attr.needsUpdate = true;
    }
    this.geometry.setDrawRange(0, this.count);
  }
  save() { this.stack.push({ transform: this.transform.slice(), globalAlpha: this.globalAlpha, lineWidth: this.lineWidth, strokeStyle: this.strokeStyle, fillStyle: this.fillStyle, dashes: this.dashes }); }
  restore() { const state = this.stack.pop(); if (state) Object.assign(this, state); }
  translate(x, y) { const m = this.transform; m[4] += m[0] * x + m[2] * y; m[5] += m[1] * x + m[3] * y; }
  scale(x, y) { const m = this.transform; m[0] *= x; m[1] *= x; m[2] *= y; m[3] *= y; }
  rotate(a) { const m = this.transform, c = Math.cos(a), s = Math.sin(a), [a0, a1, a2, a3] = m; m[0] = a0*c+a2*s; m[1] = a1*c+a3*s; m[2] = a2*c-a0*s; m[3] = a3*c-a1*s; }
  point(x, y) { const m = this.transform; return new THREE.Vector2(m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]); }
  beginPath() { this.paths = []; this.path = null; }
  moveTo(x, y) { this.path = [this.point(x, y)]; this.paths.push(this.path); }
  lineTo(x, y) { if (!this.path) this.moveTo(x, y); else this.path.push(this.point(x, y)); }
  closePath() { if (this.path?.length) this.path.push(this.path[0].clone()); }
  rect(x, y, w, h) { this.moveTo(x,y); this.lineTo(x+w,y); this.lineTo(x+w,y+h); this.lineTo(x,y+h); this.closePath(); }
  arc(x, y, r, start, end, ccw = false) { this.ellipse(x,y,r,r,0,start,end,ccw); }
  ellipse(x, y, rx, ry, rotation, start, end, ccw = false) {
    let delta = end - start;
    if (Math.abs(delta) >= Math.PI*2) delta = (ccw ? -1 : 1) * Math.PI*2;
    else if (ccw && delta > 0) delta -= Math.PI*2;
    else if (!ccw && delta < 0) delta += Math.PI*2;
    const segments = Math.max(4, Math.ceil(Math.abs(delta) * 12)), c = Math.cos(rotation), s = Math.sin(rotation);
    for (let i=0;i<=segments;i++) { const a=start+delta*i/segments, px=Math.cos(a)*rx, py=Math.sin(a)*ry; this.lineTo(x+px*c-py*s,y+px*s+py*c); }
  }
  quadraticCurveTo(cx, cy, x, y) {
    if (!this.path?.length) this.moveTo(x,y);
    const p = this.path.at(-1).clone(), c = this.point(cx,cy), end = this.point(x,y);
    for(let i=1;i<=12;i++){const t=i/12,u=1-t;this.path.push(new THREE.Vector2(u*u*p.x+2*u*t*c.x+t*t*end.x,u*u*p.y+2*u*t*c.y+t*t*end.y));}
  }
  bezierCurveTo(x1,y1,x2,y2,x,y) {
    if(!this.path?.length)this.moveTo(x,y);
    const p=this.path.at(-1).clone(),a=this.point(x1,y1),b=this.point(x2,y2),e=this.point(x,y);
    for(let i=1;i<=16;i++){const t=i/16,u=1-t;this.path.push(new THREE.Vector2(u*u*u*p.x+3*u*u*t*a.x+3*u*t*t*b.x+t*t*t*e.x,u*u*u*p.y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*e.y));}
  }
  setLineDash(dashes) { this.dashes = dashes; }
  paint(style) {
    if(style&&typeof style==='object'&&style.stops)return{gradient:style,alpha:this.globalAlpha};
    let opacity = this.globalAlpha, text = String(style || '#fff');
    const rgba = /^rgba\(([^)]+)\)/.exec(text);
    if(rgba){const p=rgba[1].split(',').map(Number);opacity*=p[3];text=`rgb(${p[0]},${p[1]},${p[2]})`;}
    const c = new THREE.Color(text); return [c.r,c.g,c.b,Math.max(0,Math.min(1,opacity))];
  }
  triangle(a,b,c,tint) {
    if(this.count+3>this.capacity)return;
    for(const p of [a,b,c]) { this.positions.set([p.x*SCALE,.045,p.y*SCALE],this.count*3);this.colors.set(tint.gradient?this.gradientColor(tint.gradient,p,tint.alpha):tint,this.count*4);this.count++; }
  }
  fill() {
    const tint=this.paint(this.fillStyle);
    for(const path of this.paths){const pts=path.length>1&&path[0].equals(path.at(-1))?path.slice(0,-1):path;if(pts.length<3)continue;
      for(const tri of THREE.ShapeUtils.triangulateShape(pts,[]))this.triangle(pts[tri[0]],pts[tri[1]],pts[tri[2]],tint);
    }
  }
  stroke() {
    const tint=this.paint(this.strokeStyle),m=this.transform,width=Math.max(.7,this.lineWidth)*Math.hypot(m[0],m[1])*.5;
    for(const path of this.paths)for(let i=1;i<path.length;i++) {
      const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(!len)continue;
      const pieces=this.dashes.length?Math.max(1,Math.ceil(len/Math.max(1,this.dashes[0]))):1;
      for(let j=0;j<pieces;j++){if(this.dashes.length&&j%2)continue;const p=a.clone().lerp(b,j/pieces),q=a.clone().lerp(b,(j+1)/pieces),ox=-dy/len*width,oy=dx/len*width;
        const v=[new THREE.Vector2(p.x+ox,p.y+oy),new THREE.Vector2(p.x-ox,p.y-oy),new THREE.Vector2(q.x-ox,q.y-oy),new THREE.Vector2(q.x+ox,q.y+oy)];this.triangle(v[0],v[1],v[2],tint);this.triangle(v[0],v[2],v[3],tint);
      }
    }
  }
  fillRect(x,y,w,h){this.beginPath();this.rect(x,y,w,h);this.fill();}
  strokeRect(x,y,w,h){this.beginPath();this.rect(x,y,w,h);this.stroke();}
  fillText(text,x,y){const p=this.point(x,y);this.label(text,p.x,p.y,0,this.fillStyle,this.globalAlpha);}
  strokeText(){/* HTML labels already have a dark outline; fillText emits them once. */}
  createLinearGradient(x0,y0,x1,y1){return this.gradient('linear',x0,y0,0,x1,y1,1);}
  createRadialGradient(x0,y0,r0,x1,y1,r1){return this.gradient('radial',x0,y0,r0,x1,y1,r1);}
  gradient(type,x0,y0,r0,x1,y1,r1){const g={type,a:this.point(x0,y0),b:this.point(x1,y1),r0,r1,stops:[],addColorStop(at,value){this.stops.push({at,value});this.stops.sort((a,b)=>a.at-b.at);}};return g;}
  gradientColor(g,p,alpha){
    const dx=g.b.x-g.a.x,dy=g.b.y-g.a.y,t=g.type==='radial'?(p.distanceTo(g.b)-g.r0)/Math.max(1,g.r1-g.r0):((p.x-g.a.x)*dx+(p.y-g.a.y)*dy)/Math.max(1,dx*dx+dy*dy);
    const stops=g.stops;if(!stops.length)return[1,1,1,alpha];let a=stops[0],b=stops.at(-1);for(let i=1;i<stops.length;i++)if(t<=stops[i].at){a=stops[i-1];b=stops[i];break;}
    const old=this.globalAlpha;this.globalAlpha=alpha;const ca=this.paint(a.value),cb=this.paint(b.value);this.globalAlpha=old;const f=Math.max(0,Math.min(1,(t-a.at)/Math.max(.001,b.at-a.at)));return ca.map((v,i)=>v+(cb[i]-v)*f);
  }
  measureText(text){return{width:String(text).length*7};}
  dispose(){this.mesh.removeFromParent();this.geometry.dispose();this.material.dispose();}
}

(function(){
'use strict';
function clamp01(v){return Math.max(0,Math.min(1,Number(v)||0));}
function easeOut(v){v=clamp01(v);return 1-Math.pow(1-v,3);}
var PALACE_STATUE_CENTER_Y=0;

// Build 02 sword art direction: deliberately simple, heavy palace steel.
// This shared version keeps the same visual language while allowing the
// cinematic/boss code to rotate and animate it freely.
function drawKnightSword(c,opts){
    opts=opts||{};var x=Number(opts.x)||0,y=Number(opts.y)||0,angle=Number(opts.angle)||0,scale=Number(opts.scale)||1,alpha=opts.alpha===undefined?1:clamp01(opts.alpha),glow=clamp01(opts.glow||0);
    c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);c.globalAlpha*=alpha;c.lineCap='round';c.lineJoin='round';
    if(glow>0){c.save();c.globalAlpha*=.13*glow;c.strokeStyle='#c93645';c.lineWidth=21;c.beginPath();c.moveTo(0,8);c.lineTo(0,-140);c.stroke();c.restore();}
    c.strokeStyle='#2a2729';c.lineWidth=14;c.beginPath();c.moveTo(0,16);c.lineTo(0,-136);c.stroke();
    c.strokeStyle='#d3ccce';c.lineWidth=9;c.beginPath();c.moveTo(0,14);c.lineTo(0,-134);c.stroke();
    c.strokeStyle='#f3eeee';c.lineWidth=2;c.beginPath();c.moveTo(-2,9);c.lineTo(-2,-130);c.stroke();
    c.fillStyle='#81797d';c.strokeStyle='#c0b8bb';c.lineWidth=3;c.fillRect(-27,10,54,10);c.strokeRect(-27,10,54,10);
    c.strokeStyle='#4a3035';c.lineWidth=8;c.beginPath();c.moveTo(0,20);c.lineTo(0,47);c.stroke();
    c.fillStyle='#71676b';c.beginPath();c.arc(0,51,7,0,Math.PI*2);c.fill();
    c.restore();
}

function drawBuild02Pedestal(c){
    c.fillStyle='#111012';c.strokeStyle='#65575b';c.lineWidth=7;c.beginPath();c.moveTo(-102,-76);c.lineTo(102,-76);c.lineTo(126,-48);c.lineTo(126,70);c.lineTo(98,96);c.lineTo(-98,96);c.lineTo(-126,70);c.lineTo(-126,-48);c.closePath();c.fill();c.stroke();
    c.fillStyle='#302b2e';c.strokeStyle='#7d7377';c.lineWidth=4;c.fillRect(-88,-58,176,132);c.strokeRect(-88,-58,176,132);
}

// Exact standing model from Build 02. This is used whenever the statue is
// intact, so the silhouette/materials remain visually identical to Build 02.
function drawBuild02KnightIntact(c,showSword){
    c.save();c.translate(0,PALACE_STATUE_CENTER_Y);drawBuild02Pedestal(c);c.translate(0,-5);
    c.fillStyle='#575256';c.strokeStyle='#aaa1a4';c.lineWidth=4;
    c.fillRect(-50,48,38,44);c.fillRect(12,48,38,44);c.strokeRect(-50,48,38,44);c.strokeRect(12,48,38,44);
    c.beginPath();c.moveTo(-55,48);c.lineTo(-44,-7);c.lineTo(-14,-12);c.lineTo(-8,50);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(55,48);c.lineTo(44,-7);c.lineTo(14,-12);c.lineTo(8,50);c.closePath();c.fill();c.stroke();
    c.fillStyle='#625c60';c.beginPath();c.moveTo(-48,-10);c.lineTo(-35,-60);c.lineTo(0,-76);c.lineTo(35,-60);c.lineTo(48,-10);c.lineTo(30,34);c.lineTo(-30,34);c.closePath();c.fill();c.stroke();
    c.fillStyle='#716a6e';c.beginPath();c.ellipse(-47,-42,27,18,-.35,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.ellipse(47,-42,27,18,.35,0,Math.PI*2);c.fill();c.stroke();
    c.fillStyle='#777074';c.beginPath();c.moveTo(-24,-74);c.lineTo(-17,-108);c.lineTo(0,-119);c.lineTo(18,-108);c.lineTo(25,-74);c.lineTo(15,-57);c.lineTo(-15,-57);c.closePath();c.fill();c.stroke();
    c.fillStyle='#161417';c.fillRect(-17,-91,34,7);c.strokeStyle='#bbb2b5';c.lineWidth=2;for(var vs=-12;vs<=12;vs+=8){c.beginPath();c.moveTo(vs,-91);c.lineTo(vs,-84);c.stroke();}
    c.fillStyle='#7d2c38';c.beginPath();c.moveTo(-5,-116);c.quadraticCurveTo(10,-141,30,-126);c.quadraticCurveTo(10,-124,5,-106);c.closePath();c.fill();
    if(showSword!==false){c.strokeStyle='#d3ccce';c.lineWidth=10;c.beginPath();c.moveTo(0,-39);c.lineTo(0,111);c.stroke();c.strokeStyle='#f3eeee';c.lineWidth=2;c.beginPath();c.moveTo(0,-39);c.lineTo(0,111);c.stroke();c.fillStyle='#81797d';c.strokeStyle='#c0b8bb';c.lineWidth=3;c.fillRect(-27,-34,54,10);c.strokeRect(-27,-34,54,10);}
    c.restore();
}

// Falling pieces use the same Build 02 armor palette/forms. The intact state
// above is exact; these pieces only exist once the cinematic breaks the statue.
function oldHelmet(c){c.fillStyle='#777074';c.strokeStyle='#aaa1a4';c.lineWidth=4;c.beginPath();c.moveTo(-24,17);c.lineTo(-17,-17);c.lineTo(0,-28);c.lineTo(18,-17);c.lineTo(25,17);c.lineTo(15,34);c.lineTo(-15,34);c.closePath();c.fill();c.stroke();c.fillStyle='#161417';c.fillRect(-17,0,34,7);c.strokeStyle='#bbb2b5';c.lineWidth=2;for(var x=-12;x<=12;x+=8){c.beginPath();c.moveTo(x,0);c.lineTo(x,7);c.stroke();}c.fillStyle='#7d2c38';c.beginPath();c.moveTo(-5,-25);c.quadraticCurveTo(10,-50,30,-35);c.quadraticCurveTo(10,-33,5,-15);c.closePath();c.fill();}
function oldTorso(c){c.fillStyle='#625c60';c.strokeStyle='#aaa1a4';c.lineWidth=4;c.beginPath();c.moveTo(-48,12);c.lineTo(-35,-38);c.lineTo(0,-54);c.lineTo(35,-38);c.lineTo(48,12);c.lineTo(30,56);c.lineTo(-30,56);c.closePath();c.fill();c.stroke();}
function oldShoulder(c){c.fillStyle='#716a6e';c.strokeStyle='#aaa1a4';c.lineWidth=4;c.beginPath();c.ellipse(0,0,27,18,0,0,Math.PI*2);c.fill();c.stroke();}
function oldArm(c){c.fillStyle='#575256';c.strokeStyle='#aaa1a4';c.lineWidth=4;c.beginPath();c.moveTo(-13,-31);c.lineTo(13,-31);c.lineTo(10,30);c.lineTo(-10,30);c.closePath();c.fill();c.stroke();}
function oldLeg(c){c.fillStyle='#575256';c.strokeStyle='#aaa1a4';c.lineWidth=4;c.fillRect(-19,-25,38,44);c.strokeRect(-19,-25,38,44);c.beginPath();c.moveTo(-23,-25);c.lineTo(-16,-56);c.lineTo(15,-61);c.lineTo(21,-24);c.closePath();c.fill();c.stroke();}
function piece(c,fall,s,fn){var q=easeOut((fall-s.delay)/(1-s.delay));c.save();c.translate(s.x+s.dx*q,s.y+s.dy*q+s.drop*q*q);c.rotate(s.rot*q);fn(c);c.restore();}

function drawKnightStatue(c,opts){
    opts=opts||{};var fall=clamp01(opts.fall),swordLift=clamp01(opts.swordLift),broken=!!opts.broken;
    if(fall<.018&&!broken){drawBuild02KnightIntact(c,swordLift<=.01);return;}
    c.save();c.translate(0,PALACE_STATUE_CENTER_Y);drawBuild02Pedestal(c);c.translate(0,-5);
    piece(c,fall,{x:0,y:-90,delay:.01,dx:70,dy:55,drop:58,rot:1.35},oldHelmet);
    piece(c,fall,{x:0,y:-23,delay:.06,dx:-27,dy:82,drop:64,rot:-.7},oldTorso);
    piece(c,fall,{x:-47,y:-42,delay:.10,dx:-93,dy:70,drop:54,rot:-1.5},oldShoulder);
    piece(c,fall,{x:47,y:-42,delay:.13,dx:102,dy:67,drop:58,rot:1.42},oldShoulder);
    piece(c,fall,{x:-48,y:0,delay:.14,dx:-72,dy:88,drop:58,rot:-1.03},oldArm);
    piece(c,fall,{x:48,y:0,delay:.17,dx:76,dy:92,drop:60,rot:1.13},oldArm);
    piece(c,fall,{x:-29,y:67,delay:.17,dx:-42,dy:66,drop:48,rot:-.47},oldLeg);
    piece(c,fall,{x:29,y:67,delay:.20,dx:46,dy:71,drop:52,rot:.6},oldLeg);
    if(fall>.52){var crack=easeOut((fall-.52)/.48);c.save();c.globalAlpha=.4*crack;c.strokeStyle='#8d7779';c.lineWidth=3;for(var i=0;i<7;i++){var a=i*Math.PI*2/7+.2,len=55+(i%3)*24;c.beginPath();c.moveTo(Math.cos(a)*20,Math.sin(a)*14+72);c.lineTo(Math.cos(a)*len,Math.sin(a)*len*.58+72);c.stroke();}c.restore();}
    if(!broken&&swordLift<=.01){var q=easeOut(fall);drawKnightSword(c,{x:0+70*q,y:-44+188*q,angle:1.2*q,scale:1,alpha:1});}
    c.restore();
}
DKRegister.value('palaceArt',{drawSword:drawKnightSword,drawKnightStatue:drawKnightStatue},'world/palace-art');
}());

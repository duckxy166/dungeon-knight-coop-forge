(function () {
  'use strict';

  var RED = '#c93645',
    RED2 = '#ff5364',
    RED3 = '#ff8994',
    SHADOW = '#070609',
    WALL = '#2b2529',
    WALL_EDGE = '#8a747a';
  var WALL_HALF_H = 88,
    WALL_DAMAGE_HALF_H = 62,
    WALL_DAMAGE_HALF_W = 112;
  function living(api) {
    return api.players().filter(function (p) {
      return p && !p.downed && p.hp > 0;
    });
  }
  function targetOf(boss, api) {
    var p = api.playerById(boss.targetId);
    if (!p || p.downed || p.hp <= 0) p = boss.chooseTarget();
    return p;
  }
  function setState(boss, state, time) {
    boss.shadowState = state;
    boss.comboState = state;
    boss.stateTimer = time;
    boss.attackMask = 0;
  }
  function clampPoint(api, x, y, pad) {
    pad = pad || 100;
    return {
      x: api.clamp(x, -api.ARENA + pad, api.ARENA - pad),
      y: api.clamp(y, -api.ARENA + pad, api.ARENA - pad)
    };
  }
  function beginWallBeat(boss, api) {
    var t = targetOf(boss, api);
    boss.attackX = t ? t.x : boss.x;
    boss.attackY = t ? t.y : boss.y;
    boss.attackMask = 0;
    boss.stateTimer = boss.apex ? 20 : boss.enraged ? 22 : 24;
    boss.wallBeatLength = boss.stateTimer;
  }
  function eclipseRing(boss, api, pulse) {
    var target = targetOf(boss, api),
      base = target ? Math.atan2(target.y - boss.y, target.x - boss.x) : boss.orbit,
      count = boss.apex ? 34 : 30,
      gap = 6,
      gapCenter = (Math.floor(count * (base / Math.PI / 2)) + pulse * 5) % count;
    if (gapCenter < 0) gapCenter += count;
    for (var i = 0; i < count; i++) {
      var d = Math.min((i - gapCenter + count) % count, (gapCenter - i + count) % count);
      if (d <= Math.floor(gap / 2)) continue;
      var a = i * Math.PI * 2 / count + pulse * .17 + boss.orbit * .18;
      api.bullet(boss.x, boss.y, a, 5.1 + pulse * .55, 1.05 + (boss.apex ? .15 : 0), RED2, 5, 205, {
        sourceId: 'boss_ember',
        type: 'bossBolt'
      });
    }
    api.ring(boss.x, boss.y, RED2, 125 + pulse * 24, 5);
    api.particles(boss.x, boss.y, '#6e1f2b', 9, 3.3);
  }
  function strikeBlade(boss, zone, api) {
    api.verticalBlade(zone.x, zone.y, RED2);
    var all = living(api);
    for (var i = 0; i < all.length; i++) {
      var p = all[i],
        dx = p.x - zone.x,
        dy = p.y - zone.y;
      if (dx * dx + dy * dy < 78 * 78) api.hit(p, 1.9, 'fallen blade', Math.atan2(dy, dx), 78);
    }
    api.particles(zone.x, zone.y, RED2, 12, 5);
  }
  function pulseRing(c, x, y, r, alpha, width) {
    c.save();
    c.globalAlpha = alpha;
    c.strokeStyle = RED2;
    c.lineWidth = width || 3;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }
  function drawShadowSilhouette(c, x, y, alpha, scale, lean) {
    c.save();
    c.translate(x, y);
    c.rotate(lean || 0);
    c.scale(scale || 1, scale || 1);
    c.globalAlpha *= alpha;
    var g = c.createRadialGradient(0, -22, 6, 0, 18, 78);
    g.addColorStop(0, 'rgba(35,22,28,.98)');
    g.addColorStop(.55, 'rgba(8,7,10,.98)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-32, -57);
    c.quadraticCurveTo(-52, -42, -55, -12);
    c.quadraticCurveTo(-57, 18, -42, 40);
    c.quadraticCurveTo(-56, 70, -30, 91);
    c.quadraticCurveTo(-13, 69, 0, 100);
    c.quadraticCurveTo(13, 68, 31, 91);
    c.quadraticCurveTo(58, 67, 42, 38);
    c.quadraticCurveTo(57, 13, 54, -13);
    c.quadraticCurveTo(50, -43, 31, -57);
    c.quadraticCurveTo(0, -73, -32, -57);
    c.fill();
    c.restore();
  }
  function drawAura(boss, api, alpha) {
    var c = api.ctx,
      t = api.visualTick(),
      s = boss.shadowState || 'roam';
    c.save();
    c.translate(boss.x, boss.y);
    c.globalAlpha = alpha;
    var ground = c.createRadialGradient(0, 52, 8, 0, 52, 88);
    ground.addColorStop(0, 'rgba(122,25,39,.20)');
    ground.addColorStop(.45, 'rgba(15,8,12,.48)');
    ground.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = ground;
    c.beginPath();
    c.ellipse(0, 52, 92, 34, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(141,39,52,.28)';
    c.lineWidth = 2;
    for (var i = 0; i < 5; i++) {
      var a = t * .012 + i * 1.31,
        r = 56 + i % 2 * 15;
      c.beginPath();
      c.arc(0, 16, r, a, a + 1.05);
      c.stroke();
    }
    if (boss.enraged || boss.apex) {
      c.globalAlpha *= boss.apex ? .85 : .55;
      c.strokeStyle = RED2;
      c.lineWidth = boss.apex ? 4 : 3;
      c.beginPath();
      c.arc(0, 5, 68 + Math.sin(t * .09) * 7, 0, Math.PI * 2);
      c.stroke();
    }
    if (s === 'wallTell' || s === 'wallBeat') {
      c.globalAlpha = .4;
      c.strokeStyle = RED2;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-28, 4);
      c.lineTo(-180, 0);
      c.moveTo(28, 4);
      c.lineTo(180, 0);
      c.stroke();
    }
    c.restore();
  }
  function drawShadowBody(boss, api, alpha, opts) {
    if (api.ctx.isWorld3D) return;
    opts = opts || {};
    var c = api.ctx,
      t = api.visualTick(),
      s = boss.shadowState || 'roam',
      bob = Math.sin(t * .06) * 4,
      lean = 0,
      scale = 1,
      swordAngle = -.32;
    if (s === 'dashTell') {
      lean = -.08;
      swordAngle = -1.05;
    } else if (s === 'dashActive') {
      lean = .16;
      swordAngle = .68;
    } else if (s === 'wallTell' || s === 'wallBeat') swordAngle = .12;else if (s === 'blinkTell') swordAngle = -.55;else if (s === 'swingTell') {
      lean = -.12;
      swordAngle = -1.28 + (1 - Math.max(0, boss.stateTimer || 0) / 16) * .72;
    } else if (s === 'wheelTell' || s === 'wheelActive') swordAngle = -.1;else if (s === 'bladeTell') swordAngle = -1.15;else if (s === 'bladeActive') swordAngle = .2;else if (s === 'recover') {
      lean = .05;
      swordAngle = .25;
    }
    drawAura(boss, api, alpha === undefined ? 1 : alpha);
    if (s === 'dashActive' && !opts.cinematic) {
      for (var trail = 3; trail >= 1; trail--) {
        var tx = boss.x - Math.cos(boss.attackAngle || 0) * trail * 27,
          ty = boss.y - Math.sin(boss.attackAngle || 0) * trail * 27;
        drawShadowSilhouette(c, tx, ty, .10 * trail, 1 - .05 * trail, lean);
      }
    }
    c.save();
    c.translate(boss.x, boss.y + bob);
    c.rotate(lean);
    c.scale(scale, scale);
    c.globalAlpha = alpha === undefined ? 1 : alpha;
    // Outer smoky cloak layers create volume without a generic circular body.
    var outer = c.createLinearGradient(0, -68, 0, 105);
    outer.addColorStop(0, 'rgba(33,22,27,.96)');
    outer.addColorStop(.42, 'rgba(8,7,10,.99)');
    outer.addColorStop(1, 'rgba(0,0,0,.12)');
    c.fillStyle = outer;
    c.beginPath();
    c.moveTo(-34, -58);
    c.quadraticCurveTo(-62, -45, -63, -12);
    c.quadraticCurveTo(-60, 18, -45, 38);
    c.quadraticCurveTo(-61, 69, -31, 93);
    c.quadraticCurveTo(-12, 70, 0, 102);
    c.quadraticCurveTo(13, 70, 33, 93);
    c.quadraticCurveTo(63, 69, 44, 37);
    c.quadraticCurveTo(61, 11, 60, -14);
    c.quadraticCurveTo(56, -46, 33, -58);
    c.quadraticCurveTo(0, -76, -34, -58);
    c.fill();
    // Shoulder mantle and ghost arms give the silhouette a readable fighting pose.
    c.fillStyle = 'rgba(18,13,17,.98)';
    c.beginPath();
    c.moveTo(-46, -39);
    c.quadraticCurveTo(-72, -26, -65, -7);
    c.quadraticCurveTo(-47, -19, -28, -13);
    c.lineTo(-16, -38);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(46, -39);
    c.quadraticCurveTo(72, -26, 65, -7);
    c.quadraticCurveTo(47, -19, 28, -13);
    c.lineTo(16, -38);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(70,44,51,.72)';
    c.lineWidth = 7;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-30, -14);
    c.quadraticCurveTo(-41, 10, -28, 27);
    c.moveTo(28, -15);
    c.quadraticCurveTo(45, 3, 32, 23);
    c.stroke();
    // Animated smoke ribbons beneath the cloak.
    c.fillStyle = 'rgba(5,4,7,.82)';
    for (var w = 0; w < 5; w++) {
      var wa = t * .018 + w * 1.29;
      c.save();
      c.translate(Math.cos(wa) * 23, 59 + Math.sin(wa * 1.3) * 12);
      c.rotate(Math.sin(wa * .8) * .35);
      c.beginPath();
      c.moveTo(-9, -20);
      c.quadraticCurveTo(-17, 9, -5, 35);
      c.quadraticCurveTo(4, 18, 10, 36);
      c.quadraticCurveTo(18, 7, 8, -20);
      c.closePath();
      c.fill();
      c.restore();
    }
    // Hollow face with brighter, narrower eyes.
    c.fillStyle = 'rgba(0,0,0,.72)';
    c.beginPath();
    c.ellipse(0, -34, 27, 22, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = RED2;
    c.shadowColor = '#ff263d';
    c.shadowBlur = 12;
    c.beginPath();
    c.moveTo(-18, -37);
    c.quadraticCurveTo(-9, -43, -3, -36);
    c.quadraticCurveTo(-10, -31, -18, -34);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(18, -37);
    c.quadraticCurveTo(9, -43, 3, -36);
    c.quadraticCurveTo(10, -31, 18, -34);
    c.closePath();
    c.fill();
    c.shadowBlur = 0;
    // Small chest fissure/energy seam makes the body feel supernatural rather than flat black.
    c.globalAlpha *= .65;
    c.strokeStyle = '#7d2632';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, -12);
    c.lineTo(-7, 4);
    c.lineTo(5, 17);
    c.lineTo(-3, 31);
    c.stroke();
    c.globalAlpha = alpha === undefined ? 1 : alpha;
    if (opts.drawSword !== false && api.palaceArt && api.palaceArt.drawSword) {
      api.palaceArt.drawSword(c, {
        x: 37,
        y: 4,
        angle: swordAngle,
        scale: 1.02,
        glow: s === 'dashActive' || s === 'swingTell' || boss.apex ? .75 : .18
      });
    }
    c.restore();
  }
  function drawLane(c, boss) {
    var a = boss.attackAngle || 0,
      len = 520,
      w = 70,
      x = boss.x,
      y = boss.y,
      nx = -Math.sin(a),
      ny = Math.cos(a),
      ex = x + Math.cos(a) * len,
      ey = y + Math.sin(a) * len;
    c.save();
    var pulse = .24 + .1 * Math.sin(performance.now() * .014);
    c.globalAlpha = pulse;
    c.fillStyle = RED2;
    c.strokeStyle = RED3;
    c.lineWidth = 3;
    c.setLineDash([18, 12]);
    c.beginPath();
    c.moveTo(x + nx * w, y + ny * w);
    c.lineTo(ex + nx * w, ey + ny * w);
    c.lineTo(ex - nx * w, ey - ny * w);
    c.lineTo(x - nx * w, y - ny * w);
    c.closePath();
    c.fill();
    c.stroke();
    c.setLineDash([]);
    c.globalAlpha = .62;
    c.strokeStyle = '#ffd1d5';
    c.lineWidth = 2;
    for (var k = 1; k <= 3; k++) {
      var px = x + Math.cos(a) * len * k / 4,
        py = y + Math.sin(a) * len * k / 4;
      c.beginPath();
      c.moveTo(px - nx * 18 - Math.cos(a) * 12, py - ny * 18 - Math.sin(a) * 12);
      c.lineTo(px, py);
      c.lineTo(px + nx * 18 - Math.cos(a) * 12, py + ny * 18 - Math.sin(a) * 12);
      c.stroke();
    }
    c.restore();
  }
  function drawWallStone(c, wx, y, side) {
    c.save();
    c.translate(wx, y);
    var g = c.createLinearGradient(-58, -90, 58, 90);
    g.addColorStop(0, '#40383d');
    g.addColorStop(.55, WALL);
    g.addColorStop(1, '#171417');
    c.fillStyle = g;
    c.strokeStyle = WALL_EDGE;
    c.lineWidth = 6;
    c.fillRect(-58, -WALL_HALF_H, 116, WALL_HALF_H * 2);
    c.strokeRect(-58, -WALL_HALF_H, 116, WALL_HALF_H * 2);
    c.strokeStyle = '#55484e';
    c.lineWidth = 3;
    for (var r = -1; r <= 1; r++) {
      c.beginPath();
      c.moveTo(-48, r * 55 + side * 4);
      c.lineTo(48, r * 55 - side * 4);
      c.stroke();
    }
    c.strokeStyle = '#241f22';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(-20, -WALL_HALF_H);
    c.lineTo(-4, -30);
    c.lineTo(-17, 10);
    c.lineTo(14, 45);
    c.stroke();
    c.restore();
  }
  function drawWalls(c, boss) {
    var full = boss.wallBeatLength || 24,
      p = 1 - Math.max(0, boss.stateTimer) / full,
      eased = 1 - Math.pow(1 - Math.min(1, p), 3),
      offset = 395 - eased * 285,
      y = boss.attackY || 0,
      x = boss.attackX || 0;
    c.save();
    // Only the narrow horizontal crush strip is dangerous. The bright arrows show
    // the intended vertical escape route on every one of the five retargets.
    c.globalAlpha = .16 + .10 * Math.sin(performance.now() * .018);
    c.fillStyle = RED2;
    c.fillRect(x - WALL_DAMAGE_HALF_W, y - WALL_DAMAGE_HALF_H, WALL_DAMAGE_HALF_W * 2, WALL_DAMAGE_HALF_H * 2);
    c.globalAlpha = .9;
    c.strokeStyle = RED3;
    c.lineWidth = 3;
    c.setLineDash([12, 9]);
    c.strokeRect(x - WALL_DAMAGE_HALF_W, y - WALL_DAMAGE_HALF_H, WALL_DAMAGE_HALF_W * 2, WALL_DAMAGE_HALF_H * 2);
    c.setLineDash([]);
    c.fillStyle = '#f5d7da';
    c.font = '8px "Noto Sans Thai", "Ubuntu", sans-serif';
    c.textAlign = 'center';
    c.fillText('MOVE UP / DOWN', x, y - WALL_DAMAGE_HALF_H - 28);
    c.strokeStyle = RED3;
    c.lineWidth = 5;
    [-1, 1].forEach(function (dir) {
      var ay = y + dir * (WALL_DAMAGE_HALF_H + 28);
      c.beginPath();
      c.moveTo(x - 18, ay - dir * 10);
      c.lineTo(x, ay + dir * 10);
      c.lineTo(x + 18, ay - dir * 10);
      c.stroke();
    });
    drawWallStone(c, x - offset, y, -1);
    drawWallStone(c, x + offset, y, 1);
    if (p > .76) {
      c.globalAlpha = (p - .76) / .24 * .5;
      c.strokeStyle = '#e3c7c8';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x - 105, y - WALL_HALF_H);
      c.lineTo(x - 35, y);
      c.lineTo(x - 102, y + WALL_HALF_H);
      c.moveTo(x + 105, y - WALL_HALF_H);
      c.lineTo(x + 35, y);
      c.lineTo(x + 102, y + WALL_HALF_H);
      c.stroke();
    }
    c.restore();
  }
  function drawBlinkMark(c, boss, t) {
    c.save();
    var p = .35 + .18 * Math.sin(t * .2);
    c.globalAlpha = p;
    var g = c.createRadialGradient(boss.attackX, boss.attackY, 8, boss.attackX, boss.attackY, 78);
    g.addColorStop(0, 'rgba(117,24,38,.25)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(boss.attackX, boss.attackY, 78, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = RED2;
    c.lineWidth = 4;
    c.beginPath();
    c.arc(boss.attackX, boss.attackY, 58, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = '#34141a';
    for (var i = 0; i < 5; i++) {
      var a = i * Math.PI * 2 / 5 + t * .02;
      c.beginPath();
      c.moveTo(boss.attackX + Math.cos(a) * 25, boss.attackY + Math.sin(a) * 25);
      c.lineTo(boss.attackX + Math.cos(a) * 68, boss.attackY + Math.sin(a) * 68);
      c.stroke();
    }
    c.restore();
  }
  function drawSwingTell(c, boss) {
    var a = boss.attackAngle || 0;
    c.save();
    c.globalAlpha = .22;
    c.strokeStyle = RED2;
    c.lineWidth = 20;
    c.beginPath();
    c.arc(boss.x, boss.y, 170, a - .92, a + .92);
    c.stroke();
    c.globalAlpha = .75;
    c.strokeStyle = '#efc5c9';
    c.lineWidth = 3;
    for (var i = 0; i < 4; i++) {
      c.beginPath();
      c.arc(boss.x, boss.y, 128 + i * 14, a - .88 + i * .06, a + .72 + i * .04);
      c.stroke();
    }
    c.restore();
  }
  function drawWheelTell(c, boss, t) {
    c.save();
    c.translate(boss.x, boss.y);
    c.globalAlpha = .34;
    c.strokeStyle = RED2;
    c.lineWidth = 4;
    for (var rr = 0; rr < 3; rr++) {
      c.save();
      c.rotate((rr % 2 ? 1 : -1) * t * .018 + rr * .7);
      c.beginPath();
      c.arc(0, 0, 105 + rr * 42, 0, Math.PI * 2);
      c.stroke();
      for (var g = 0; g < 6; g++) {
        var a = g * Math.PI * 2 / 6,
          r = 105 + rr * 42;
        c.strokeRect(Math.cos(a) * r - 5, Math.sin(a) * r - 5, 10, 10);
      }
      c.restore();
    }
    c.restore();
  }
  function drawBladeTelegraphs(c, boss, t) {
    c.save();
    (boss.attackZones || []).forEach(function (z, i) {
      if (z.hit) return;
      var pulse = .18 + .09 * Math.sin(t * .2 + i);
      c.globalAlpha = pulse;
      c.fillStyle = RED2;
      c.beginPath();
      c.arc(z.x, z.y, 72, 0, Math.PI * 2);
      c.fill();
      c.globalAlpha = .7;
      c.strokeStyle = RED3;
      c.lineWidth = 3;
      c.beginPath();
      c.arc(z.x, z.y, 72, 0, Math.PI * 2);
      c.stroke();
      c.save();
      c.translate(z.x, z.y - 112 - Math.sin(t * .08 + i) * 8);
      c.rotate(.08 * Math.sin(t * .11 + i));
      c.fillStyle = 'rgba(28,9,13,.76)';
      c.strokeStyle = RED2;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(0, -56);
      c.lineTo(12, 18);
      c.lineTo(0, 38);
      c.lineTo(-12, 18);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();
    });
    c.restore();
  }
  var Q = window.DKBossQuality,
    TAU = Math.PI * 2;
  function darkStage(boss, name, time) {
    boss.shadowState = name;
    boss.comboState = name;
    boss.stateTimer = time;
    boss.attackMask = 0;
  }
  function darkFinish(boss, time) {
    darkStage(boss, 'recover', Math.max(18, Math.round((time || 32) * .8)));
  }
  function rememberPlayer(boss, target, step) {
    boss.memoryClock = (boss.memoryClock || 0) + step;
    if (boss.memoryClock < 6) return;
    boss.memoryClock %= 6;
    boss.memoryTrail = boss.memoryTrail || [];
    boss.memoryTrail.push({
      x: target.x,
      y: target.y
    });
    if (boss.memoryTrail.length > 40) boss.memoryTrail.splice(0, boss.memoryTrail.length - 40);
  }
  function memoryCopy(boss, target) {
    var source = (boss.memoryTrail || []).slice();
    if (source.length < 18) for (var i = 0; i < 32; i++) source.push({
      x: target.x + Math.cos(i * .43) * i * 5,
      y: target.y + Math.sin(i * .43) * i * 5
    });
    return source.map(function (p, i) {
      return {
        x: p.x,
        y: p.y,
        index: i,
        slash: i % 5 === 0
      };
    });
  }
  function darkSlash(boss, z, api, key) {
    api.slash(z.x, z.y, z.angle, 185, 1.5, RED2);
    living(api).forEach(function (p) {
      var dx = p.x - z.x,
        dy = p.y - z.y,
        d = Math.hypot(dx, dy),
        a = Math.atan2(dy, dx);
      if (d < 190 + p.radius && Math.abs(api.angleDiff(a, z.angle)) < .78) api.hit(p, 1.55, key, z.angle, 62);
    });
  }
  function executionZones(api) {
    var A = api.ARENA - 105,
      raw = [[-A, -520, A, 520], [-350, -A, 350, A], [A, -250, -A, -250], [450, A, -450, -A], [-A, 470, A, -470], [350, -A, -350, A]],
      order = [0, 3, 1, 4, 2, 5];
    return raw.map(function (r, i) {
      return {
        x: r[0],
        y: r[1],
        x2: r[2],
        y2: r[3],
        index: i,
        order: order.indexOf(i),
        active: false,
        scar: false,
        detonated: false,
        scarTimer: 0
      };
    });
  }
  function drawMemory(boss, api) {
    var c = api.ctx,
      t = api.visualTick(),
      zones = boss.attackZones || [];
    c.save();
    c.strokeStyle = '#8b3441';
    c.globalAlpha = .25;
    c.lineWidth = 5;
    c.beginPath();
    zones.forEach(function (z, i) {
      if (i === 0) c.moveTo(z.x, z.y);else c.lineTo(z.x, z.y);
    });
    c.stroke();
    c.restore();
    var z = zones[Math.min(zones.length - 1, boss.attackStep || 0)];
    if (z) drawShadowSilhouette(c, z.x, z.y, .72, 1, 0);
    zones.forEach(function (p, i) {
      if (p.slash && i >= (boss.attackStep || 0)) {
        c.save();
        c.translate(p.x, p.y);
        c.rotate((i % 2 ? 1 : -1) * Math.PI / 2);
        c.globalAlpha = .25 + .12 * Math.sin(t * .2 + i);
        c.strokeStyle = RED2;
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(-80, 0);
        c.lineTo(80, 0);
        c.stroke();
        c.restore();
      }
    });
  }
  function drawExecution(boss, api) {
    var c = api.ctx,
      t = api.visualTick();
    (boss.attackZones || []).forEach(function (z) {
      var a = Math.atan2(z.y2 - z.y, z.x2 - z.x);
      if (!z.active) {
        line(c, z.x, z.y, z.x2, z.y2, '#f4cdd1', 2, .24, [20, 14]);
        if (api.palaceArt && api.palaceArt.drawSword) api.palaceArt.drawSword(c, {
          x: z.x,
          y: z.y,
          angle: a,
          scale: 1.9,
          alpha: .4 + .18 * Math.sin(t * .13 + z.index),
          glow: .5
        });
      }
      if (z.scar) {
        line(c, z.x, z.y, z.x2, z.y2, z.detonated ? '#fff' : '#6f2632', z.detonated ? 15 : 6, z.detonated ? .7 : .42, z.detonated ? null : [18, 11]);
      }
    });
  }
  function drawReflections(boss, api) {
    var c = api.ctx,
      t = api.visualTick();
    (boss.attackZones || []).forEach(function (z, i) {
      drawShadowSilhouette(c, z.x, z.y, i < (boss.attackStep || 0) ? .16 : .48, 1, z.lean || 0);
      c.save();
      c.translate(z.x, z.y);
      c.rotate(z.angle);
      c.globalAlpha = i < (boss.attackStep || 0) ? .1 : .3 + .12 * Math.sin(t * .18 + i);
      c.strokeStyle = i === boss.attackMask ? '#fff' : RED2;
      c.lineWidth = i === boss.attackMask ? 9 : 4;
      c.beginPath();
      c.arc(0, 0, 150, -.8, .8);
      c.stroke();
      c.restore();
    });
  }
  function drawWaltz(boss, api) {
    var c = api.ctx,
      t = api.visualTick();
    c.save();
    c.globalAlpha = .18;
    c.strokeStyle = RED2;
    c.lineWidth = 3;
    for (var i = 0; i < 6; i++) {
      c.beginPath();
      c.arc(boss.attackX, boss.attackY, 150 + i * 42, i * .7 + t * .01, i * .7 + 1.6);
      c.stroke();
    }
    c.restore();
  }
  function drawScarLines(boss, api) {
    var c = api.ctx;
    (boss.attackZones || []).forEach(function (z) {
      line(c, z.x, z.y, z.x2, z.y2, z.burst ? '#fff' : RED2, z.burst ? 16 : 4, z.burst ? .7 : .3, z.burst ? null : [16, 12]);
    });
  }
  function drawThrone(boss, api) {
    var c = api.ctx,
      t = api.visualTick(),
      zones = boss.attackZones || [];
    c.save();
    c.globalAlpha = .78;
    c.fillStyle = '#010103';
    c.fillRect(-api.ARENA, -api.ARENA, api.ARENA * 2, api.ARENA * 2);
    c.restore();
    if (!zones.length) return;
    for (var e = 0; e < 4; e++) {
      var i = ((boss.attackStep || 0) - e * 8 + zones.length * 5) % zones.length,
        z = zones[i];
      drawShadowSilhouette(c, z.x, z.y, .3 + e * .08, 1 - e * .05, 0);
    }
    c.save();
    c.strokeStyle = '#9c3341';
    c.globalAlpha = .18;
    c.lineWidth = 3;
    c.beginPath();
    zones.forEach(function (z, i) {
      if (i === 0) c.moveTo(z.x, z.y);else c.lineTo(z.x, z.y);
    });
    c.stroke();
    c.restore();
    c.save();
    c.translate(boss.x, boss.y);
    c.rotate(t * .008);
    c.strokeStyle = RED2;
    c.globalAlpha = .3;
    c.lineWidth = 5;
    for (var r = 0; r < 4; r++) {
      c.rotate(TAU / 4);
      c.beginPath();
      c.moveTo(80, 0);
      c.lineTo(210, 0);
      c.stroke();
    }
    c.restore();
  }
  function line(c, x1, y1, x2, y2, color, width, alpha, dash) {
    c.save();
    c.globalAlpha = alpha === undefined ? 1 : alpha;
    c.strokeStyle = color;
    c.lineWidth = width || 3;
    c.lineCap = 'round';
    if (dash) c.setLineDash(dash);
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.restore();
  }
  DKRegister.bossBehavior('ember', {
    init: function (boss) {
      boss.shadowState = 'roam';
      boss.comboState = 'roam';
      boss.attackAngle = 0;
      boss.attackX = 0;
      boss.attackY = 0;
      boss.attackStep = 0;
      boss.attackAux = 0;
      boss.attackMask = 0;
      boss.attackZones = [];
      boss.memoryTrail = [];
      boss.memoryClock = 0;
      boss.patternPhase = 1;
      boss.swordAngle = -.32;
      boss.timer = 24;
    },
    execute: function (boss, index, target, api) {
      target = target || targetOf(boss, api);
      if (!target) return;
      target = Q.leadTarget(boss, target, api);
      boss.patternIndex = index;
      boss.comboName = boss.bossDef.combos[index];
      api.float(boss.comboName, boss.x, boss.y - 94, index === 5 ? '#fff' : RED2);
      boss.attackStep = 0;
      boss.attackAux = 0;
      boss.attackMask = 0;
      boss.attackZones = [];
      boss.attackX = target.x;
      boss.attackY = target.y;
      if (index === 0) {
        boss.attackZones = memoryCopy(boss, target);
        darkStage(boss, 'memoryTell', 42);
      } else if (index === 1) {
        boss.attackZones = executionZones(api);
        darkStage(boss, 'executionTell', 62);
      } else if (index === 2) {
        var real = Math.floor((boss.id || 1) % 5);
        boss.attackMask = real;
        for (var i = 0; i < 5; i++) {
          var a = i * TAU / 5 + .2,
            p = clampPoint(api, target.x + Math.cos(a) * 260, target.y + Math.sin(a) * 220, 100);
          boss.attackZones.push({
            x: p.x,
            y: p.y,
            angle: Math.atan2(target.y - p.y, target.x - p.x),
            index: i,
            real: i === real,
            lean: (i % 2 ? 1 : -1) * .08
          });
        }
        darkStage(boss, 'reflectionTell', 60);
      } else if (index === 3) {
        darkStage(boss, 'waltzTell', 36);
      } else if (index === 4) {
        for (var s = 0; s < 5; s++) {
          var a = s * TAU / 5 + .35,
            n = a + Math.PI / 2,
            cx = target.x + Math.cos(a) * 210,
            cy = target.y + Math.sin(a) * 210;
          boss.attackZones.push({
            x: cx - Math.cos(n) * 560,
            y: cy - Math.sin(n) * 560,
            x2: cx + Math.cos(n) * 560,
            y2: cy + Math.sin(n) * 560,
            index: s,
            burst: false
          });
        }
        darkStage(boss, 'scarTell', 52);
      } else {
        boss.attackZones = memoryCopy(boss, target);
        darkStage(boss, 'throneTell', 62);
      }
    },
    update: function (boss, step, api) {
      var target = targetOf(boss, api);
      if (!target) return true;
      Q.trackTarget(boss, target, step);
      var smartTarget = Q.leadTarget(boss, target, api);
      rememberPlayer(boss, target, step);
      var p = boss.apex ? 3 : boss.enraged ? 2 : 1;
      if (p > boss.patternPhase && boss.shadowState !== 'phaseTransition') {
        boss.patternPhase = p;
        darkStage(boss, 'phaseTransition', p === 3 ? 92 : 76);
        boss.attackZones = [];
        api.float(p === 3 ? 'THRONE AWAKENS' : 'THE SHADOW REMEMBERS', boss.x, boss.y - 100, p === 3 ? '#fff' : RED2);
        api.ring(boss.x, boss.y, p === 3 ? '#fff' : RED2, p === 3 ? 320 : 240, p === 3 ? 12 : 8);
        Q.summonWave(boss, api, p);
      }
      var s = boss.shadowState || 'roam';
      boss.comboState = s;
      boss.swordAngle = -.32;
      if (s === 'phaseTransition') {
        boss.stateTimer -= step;
        if (api.interval(boss, 'darkTransitionPulse', step, 14)) api.ring(boss.x, boss.y, p === 3 ? '#fff' : RED2, 130 + boss.stateTimer % 4 * 35, 5);
        if (boss.stateTimer <= 0) {
          boss.shadowState = 'roam';
          boss.comboState = 'roam';
          boss.timer = 0;
        }
        return true;
      }
      if (s === 'roam') {
        var dx = target.x - boss.x,
          dy = target.y - boss.y,
          d = Math.hypot(dx, dy) || 1,
          a = Math.atan2(dy, dx),
          desired = 285,
          intent = d > desired + 55 ? boss.speed * (boss.apex ? 1.28 : boss.enraged ? 1.15 : 1) * step : d < desired - 80 ? -boss.speed * .64 * step : 0,
          moveA = a + (Math.abs(d - desired) < 85 ? Math.PI / 2 * Math.sin(boss.orbit) : 0);
        boss.moveWithNavigation(Math.cos(moveA) * intent, Math.sin(moveA) * intent, step);
        api.resolve(boss);
        if (api.interval(boss, 'ambientWisp', step, 12)) api.particles(boss.x + Math.sin(boss.orbit * 3) * 32, boss.y + 30, '#31141b', 1, 1.2);
        boss.timer += step;
        var pressureTempo = Math.max(.82, 1 - Math.min(6, boss.pressureTier || 0) * .03),
          attackPace = (boss.apex ? 46 : boss.enraged ? 58 : 72) * pressureTempo;
        if (boss.timer > attackPace) {
          boss.timer = 0;
          var pools = boss.apex ? [0, 1, 2, 3, 4, 5] : boss.enraged ? [0, 1, 2, 3, 4] : [0, 1, 2],
            cursor = boss.comboIndex++,
            idx = boss.apex && cursor % 3 === 2 ? 5 : pools[cursor % pools.length];
          this.execute(boss, idx, boss.chooseTarget(), api);
        }
        return true;
      }
      boss.stateTimer -= step;
      if (s === 'memoryTell') {
        if (boss.stateTimer <= 0) {
          boss.attackStep = 0;
          darkStage(boss, 'memoryReplay', Math.max(90, boss.attackZones.length * 3));
        }
      } else if (s === 'memoryReplay') {
        if (api.interval(boss, 'memoryAdvance', step, 3)) {
          var z = boss.attackZones[boss.attackStep];
          if (z) {
            boss.attackX = z.x;
            boss.attackY = z.y;
            if (z.slash) {
              var next = boss.attackZones[Math.min(boss.attackZones.length - 1, boss.attackStep + 1)] || z,
                ang = Math.atan2(next.y - z.y, next.x - z.x) + Math.PI / 2;
              darkSlash(boss, {
                x: z.x,
                y: z.y,
                angle: ang
              }, api, 'mirror memory');
            }
            Q.hitCircle(boss, api, z.x, z.y, 32, 1.15, 'shadow replay', 28);
          }
          boss.attackStep++;
        }
        if (boss.attackStep >= boss.attackZones.length || boss.stateTimer <= 0) darkFinish(boss, 38);
      } else if (s === 'executionTell') {
        if (boss.stateTimer <= 0) {
          boss.attackStep = 0;
          darkStage(boss, 'executionLive', 240);
          boss.stateTimer = 1;
        }
      } else if (s === 'executionLive') {
        var done = true;
        boss.attackZones.forEach(function (z) {
          if (z.scar && !z.detonated) {
            done = false;
            z.scarTimer -= step;
            if (z.scarTimer <= 0) {
              z.detonated = true;
              Q.hitLine(boss, api, z.x, z.y, z.x2, z.y2, 18, 1.55, 'execution scar ' + z.index, 80);
              api.beam(z.x, z.y, z.x2, z.y2, '#fff', 18);
              api.particles((z.x + z.x2) / 2, (z.y + z.y2) / 2, RED2, 18, 7);
            }
          }
        });
        if (boss.stateTimer <= 0 && boss.attackStep < 6) {
          var zone = boss.attackZones.filter(function (z) {
            return z.order === boss.attackStep;
          })[0];
          zone.active = true;
          zone.scar = true;
          zone.scarTimer = 60;
          done = false;
          Q.hitLine(boss, api, zone.x, zone.y, zone.x2, zone.y2, 22, 1.8, 'spectral sword ' + zone.index, 80);
          api.beam(zone.x, zone.y, zone.x2, zone.y2, '#f2d9dc', 20);
          boss.attackStep++;
          boss.stateTimer = 21;
        }
        if (boss.attackStep >= 6 && done) darkFinish(boss, 44);
      } else if (s === 'reflectionTell') {
        if (boss.stateTimer <= 0) {
          boss.attackStep = 0;
          darkStage(boss, 'reflectionLive', 1);
        }
      } else if (s === 'reflectionLive' && boss.stateTimer <= 0) {
        var order = boss.attackStep === 0 ? boss.attackMask : (boss.attackMask - boss.attackStep + 5) % 5,
          z = boss.attackZones[order];
        darkSlash(boss, z, api, 'false reflection');
        boss.attackStep++;
        if (boss.attackStep >= 5) darkFinish(boss, 38);else boss.stateTimer = 22;
      } else if (s === 'waltzTell') {
        if (boss.stateTimer <= 0) {
          boss.attackStep = 0;
          darkStage(boss, 'waltzLive', 1);
        }
      } else if (s === 'waltzLive' && boss.stateTimer <= 0) {
        if (boss.attackStep < 6) {
          var side = boss.attackStep % 2 ? 1 : -1,
            a = Math.atan2(smartTarget.y - boss.y, smartTarget.x - boss.x) + side * Math.PI / 2,
            p = clampPoint(api, smartTarget.x + Math.cos(a) * (165 + boss.attackStep * 12), smartTarget.y + Math.sin(a) * (165 + boss.attackStep * 12), 100);
          api.particles(boss.x, boss.y, '#38121a', 8, 3);
          boss.x = p.x;
          boss.y = p.y;
          api.resolve(boss);
          var cut = Math.atan2(smartTarget.y - boss.y, smartTarget.x - boss.x);
          api.slash(boss.x, boss.y, cut, 170, 1.5, RED2);
          Q.shot(boss, api, boss.x, boss.y, cut + side * .55, 6.2, 1.1, 'crescent', {
            radius: 9,
            life: 310,
            freezeAge: 16,
            ghost: true,
            trailMax: 10
          });
          boss.attackStep++;
          boss.stateTimer = 15;
        } else {
          api.float('RESUME', boss.x, boss.y - 90, '#fff');
          api.bullets().forEach(function (x) {
            if (!x.dead && x.sourceId === 'boss_ember' && x.type === 'crescent' && x.frozen) {
              x.frozen = false;
              x.vx = x.savedVx * 1.25;
              x.vy = x.savedVy * 1.25;
              x.freezeAge = 0;
            }
          });
          api.ring(boss.x, boss.y, '#fff', 360, 10);
          darkFinish(boss, 46);
        }
      } else if (s === 'scarTell') {
        if (boss.stateTimer <= 0) {
          boss.attackStep = 0;
          darkStage(boss, 'scarLive', 1);
        }
      } else if (s === 'scarLive' && boss.stateTimer <= 0) {
        var scar = boss.attackZones[boss.attackStep];
        scar.burst = true;
        Q.hitLine(boss, api, scar.x, scar.y, scar.x2, scar.y2, 17, 1.45, 'shadow scar ' + boss.attackStep, 75);
        api.beam(scar.x, scar.y, scar.x2, scar.y2, RED2, 15);
        boss.attackStep++;
        if (boss.attackStep >= boss.attackZones.length) darkFinish(boss, 42);else boss.stateTimer = 16;
      } else if (s === 'throneTell') {
        if (boss.stateTimer <= 0) {
          boss.attackStep = 0;
          darkStage(boss, 'throneLive', 360);
        }
      } else if (s === 'throneLive') {
        if (api.interval(boss, 'throneEchoStep', step, 4)) {
          boss.attackStep = (boss.attackStep + 1) % Math.max(1, boss.attackZones.length);
          for (var e = 0; e < 4; e++) {
            var zi = (boss.attackStep - e * 8 + boss.attackZones.length * 5) % boss.attackZones.length,
              z = boss.attackZones[zi];
            Q.hitCircle(boss, api, z.x, z.y, 29, 1.05, 'throne echo ' + e, 32);
          }
        }
        if (api.interval(boss, 'throneSwordWall', step, 42)) {
          var base = Math.atan2(smartTarget.y - boss.y, smartTarget.x - boss.x);
          for (var i = 0; i < 9; i++) {
            if (i === 4) continue;
            Q.shot(boss, api, boss.x, boss.y, base + (i - 4) * .13, 6.4, 1.15, 'spectralSword', {
              radius: 8,
              life: 210,
              ghost: true,
              trailMax: 7
            });
          }
          api.float('THE GAP IS DELIBERATE', boss.x, boss.y - 96, '#f4d4d8');
        }
        if (boss.stateTimer <= 0) darkFinish(boss, 58);
      } else if (s === 'recover') {
        boss.swordAngle = .45 - Math.max(0, boss.stateTimer) / 34 * .4;
        if (boss.stateTimer <= 0) {
          boss.shadowState = 'roam';
          boss.comboState = 'roam';
          boss.timer = 0;
          boss.attackZones = [];
        }
      }
      return true;
    },
    draw: function (boss, api) {
      var s = boss.shadowState || 'roam';
      if (s === 'memoryTell' || s === 'memoryReplay') drawMemory(boss, api);else if (s === 'executionTell' || s === 'executionLive') drawExecution(boss, api);else if (s === 'reflectionTell' || s === 'reflectionLive') drawReflections(boss, api);else if (s === 'waltzTell' || s === 'waltzLive') drawWaltz(boss, api);else if (s === 'scarTell' || s === 'scarLive') drawScarLines(boss, api);else if (s === 'throneTell' || s === 'throneLive') drawThrone(boss, api);
      drawShadowBody(boss, api, 1, {});
    },
    drawCinematic: function (state, api) {
      var fake = {
        x: 0,
        y: -8,
        swordAngle: -.32,
        shadowState: 'roam',
        enraged: false,
        apex: false
      };
      drawShadowBody(fake, api, state.spiritAlpha, {
        cinematic: true,
        drawSword: false
      });
      if (state.swordLift > 0 && api.palaceArt && api.palaceArt.drawSword) {
        var p = Math.max(0, Math.min(1, state.swordLift)),
          e = 1 - Math.pow(1 - p, 3),
          x = 70 + (37 - 70) * e,
          y = 62 + (-4 - 62) * e,
          angle = 1.2 + (-.32 - 1.2) * e;
        api.palaceArt.drawSword(api.ctx, {
          x: x,
          y: y,
          angle: angle,
          scale: 1.02,
          alpha: state.spiritAlpha,
          glow: e
        });
        if (p < .82) {
          api.ctx.save();
          api.ctx.globalAlpha = (1 - p) * .55;
          api.ctx.strokeStyle = RED2;
          api.ctx.lineWidth = 2;
          api.ctx.beginPath();
          api.ctx.moveTo(70, 62);
          api.ctx.lineTo(x, y);
          api.ctx.stroke();
          api.ctx.restore();
        }
      }
    }
  }, 'world/bosses/dark-spirit');
})();

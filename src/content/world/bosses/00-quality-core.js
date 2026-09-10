(function () {
  'use strict';

  var TAU = Math.PI * 2;
  function living(api) {
    return api.players().filter(function (p) {
      return p && !p.downed && p.hp > 0;
    });
  }
  function target(boss, api) {
    var p = api.playerById(boss.targetId);
    if (!p || p.downed || p.hp <= 0) p = boss.chooseTarget();
    return p;
  }
  function phase(boss) {
    return boss.apex ? 3 : boss.enraged ? 2 : 1;
  }
  function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function clampPoint(api, x, y, pad) {
    pad = pad || 100;
    return {
      x: api.clamp(x, -api.ARENA + pad, api.ARENA - pad),
      y: api.clamp(y, -api.ARENA + pad, api.ARENA - pad)
    };
  }
  function seeded(seed) {
    var x = Math.sin(seed * 91.731 + 17.13) * 43758.5453;
    return x - Math.floor(x);
  }
  function stage(boss, name, time) {
    var duration = Number(time) || 0;
    if (/tell|telegraph/i.test(name)) duration = Math.max(24, Math.round(duration * .86));
    boss.comboState = name;
    boss.stateTimer = duration;
    boss.attackMask = 0;
  }
  function finish(boss, time) {
    boss.comboState = 'release';
    boss.stateTimer = Math.max(18, Math.round((time === undefined ? 28 : time) * .82));
    boss.attackMask = 0;
  }
  function shot(boss, api, x, y, a, speed, damage, type, extra) {
    extra = extra || {};
    extra.sourceId = 'boss_' + boss.bossKey;
    extra.type = type || 'bossBolt';
    extra.bossTag = boss.bossKey;
    return api.bullet(x, y, a, speed, damage || 1.1, extra.color || boss.color, extra.radius || 5, extra.life || 210, extra);
  }
  function fan(boss, api, x, y, a, count, spread, speed, damage, type, extra) {
    var p = phase(boss), pressure = Math.min(1, Math.floor((boss.pressureTier || 0) / 4));
    count = Math.min(21, count + (p === 3 ? 4 : p === 2 ? 2 : 0) + pressure * 2);
    for (var i = 0; i < count; i++) shot(boss, api, x, y, a + (i - (count - 1) / 2) * (spread / Math.max(1, count - 1)), speed, damage, type, Object.assign({}, extra || {}));
  }
  function nova(boss, api, x, y, count, speed, damage, type, extra, offset) {
    var p = phase(boss), pressure = Math.min(1, Math.floor((boss.pressureTier || 0) / 4));
    count = Math.min(28, count + (p === 3 ? 4 : p === 2 ? 2 : 0) + pressure * 2);
    for (var i = 0; i < count; i++) shot(boss, api, x, y, (offset || 0) + i * TAU / count, speed, damage, type, Object.assign({}, extra || {}));
  }
  function hitReady(boss, p, key, cooldown, api) {
    boss.qualityHits = boss.qualityHits || Object.create(null);
    var id = (p.netId || 'p') + ':' + key,
      now = api.visualTick(),
      last = boss.qualityHits[id] || -99999;
    if (now - last < cooldown) return false;
    boss.qualityHits[id] = now;
    return true;
  }
  function hitCircle(boss, api, x, y, r, damage, key, knock) {
    living(api).forEach(function (p) {
      var dx = p.x - x,
        dy = p.y - y,
        d = Math.hypot(dx, dy);
      if (d < r + p.radius && hitReady(boss, p, key, 36, api)) api.hit(p, damage, key, Math.atan2(dy, dx), knock || 0);
    });
  }
  function pointLine(px, py, x1, y1, x2, y2) {
    var vx = x2 - x1,
      vy = y2 - y1,
      ll = vx * vx + vy * vy;
    if (ll < .01) return Math.hypot(px - x1, py - y1);
    var t = Math.max(0, Math.min(1, ((px - x1) * vx + (py - y1) * vy) / ll)),
      qx = x1 + vx * t,
      qy = y1 + vy * t;
    return Math.hypot(px - qx, py - qy);
  }
  function hitLine(boss, api, x1, y1, x2, y2, width, damage, key, cooldown) {
    width *= boss.apex ? 1.12 : boss.enraged ? 1.06 : 1;
    living(api).forEach(function (p) {
      if (pointLine(p.x, p.y, x1, y1, x2, y2) < width + p.radius && hitReady(boss, p, key, cooldown || 28, api)) api.hit(p, damage, key, Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2, width * .45);
    });
  }
  function friendlyBreaks(api, zone, radius) {
    var list = api.bullets();
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (b.dead || !b.friendly) continue;
      if (Math.hypot(b.x - zone.x, b.y - zone.y) < b.radius + (radius || zone.radius || 24)) {
        b.dead = true;
        zone.dead = true;
        api.ring(zone.x, zone.y, '#fff', 42, 3);
        return true;
      }
    }
    return false;
  }
  function moveOrbit(boss, t, api, step, desired, speedScale) {
    var dx = t.x - boss.x,
      dy = t.y - boss.y,
      d = Math.hypot(dx, dy) || 1,
      a = Math.atan2(dy, dx),
      intent = 0;
    desired = desired || 300;
    if (d > desired + 70) intent = boss.speed * (speedScale || 1) * step;else if (d < desired - 80) intent = -boss.speed * .62 * step;
    var ma = a + (Math.abs(d - desired) < 95 ? Math.PI / 2 * Math.sin(boss.orbit * .8) : 0);
    boss.moveWithNavigation(Math.cos(ma) * intent, Math.sin(ma) * intent, step);
    api.resolve(boss);
  }
  function trackTarget(boss, t, step) {
    if (!t) return;
    var id = t.netId || 'solo',
      sample = boss.aimSample,
      delta = Math.max(.25, Number(step) || 1);
    if (!sample || sample.id !== id) {
      boss.aimSample = {
        id: id,
        x: t.x,
        y: t.y,
        vx: 0,
        vy: 0
      };
      return;
    }
    var rawX = (t.x - sample.x) / delta,
      rawY = (t.y - sample.y) / delta,
      speed = Math.hypot(rawX, rawY);
    if (speed > 12) {
      rawX = rawX / speed * 12;
      rawY = rawY / speed * 12;
    }
    sample.vx = sample.vx * .55 + rawX * .45;
    sample.vy = sample.vy * .55 + rawY * .45;
    sample.x = t.x;
    sample.y = t.y;
  }
  function leadTarget(boss, t, api, frames) {
    if (!t) return t;
    var sample = boss.aimSample,
      p = phase(boss),
      lookahead = (frames === undefined ? [11, 14, 17][p - 1] : frames) + Math.min(6, (boss.pressureTier || 0) * .5),
      maxLead = [100, 125, 150][p - 1] + Math.min(45, (boss.pressureTier || 0) * 4),
      dx = 0,
      dy = 0;
    if (sample && sample.id === (t.netId || 'solo')) {
      dx = api.clamp(sample.vx * lookahead, -maxLead, maxLead);
      dy = api.clamp(sample.vy * lookahead, -maxLead, maxLead);
    }
    var point = clampPoint(api, t.x + dx, t.y + dy, 90),
      intent = Object.create(t);
    intent.x = point.x;
    intent.y = point.y;
    return intent;
  }
  function updateArenaZones(boss, step) {
    var zones = boss.arenaZones || [];
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      z.age = (z.age || 0) + step;
      if (z.life !== undefined) {
        z.life -= step;
        if (z.life <= 0) z.dead = true;
      }
    }
    boss.arenaZones = zones.filter(function (z) {
      return z && !z.dead;
    }).slice(-28);
  }
  var SUMMON_KIND = {
    ember: 'bomber', frost: 'frostshaper', sand: 'boneArcher', storm: 'orbiter', void: 'splitter', blood: 'leech', thorn: 'briar', tide: 'tidecaller',
    cloud: 'boneArcher', glyph: 'scribe', mirror: 'mirrorMimic', neon: 'sporeHost', magma: 'slagKnight', gear: 'chronomancer', moon: 'glassDuelist', spore: 'sporeHost'
  };
  function summonWave(boss, api, nextPhase) {
    boss.summonedPhases = boss.summonedPhases || Object.create(null);
    if (boss.summonedPhases[nextPhase] || (boss.summonCount || 0) >= 3) return [];
    boss.summonedPhases[nextPhase] = true;
    var t = target(boss, api), aim = t ? angle(boss.x, boss.y, t.x, t.y) : boss.orbit, count = nextPhase >= 3 ? 2 : 1, made = [];
    for (var i = 0; i < count && (boss.summonCount || 0) < 3; i++) {
      var side = i ? 1 : -1, point = clampPoint(api, boss.x + Math.cos(aim + side * 1.18) * 155, boss.y + Math.sin(aim + side * 1.18) * 155, 110);
      made.push(api.minion(point.x, point.y, SUMMON_KIND[boss.bossKey] || 'chaser', boss.bossKey));
      boss.summonCount = (boss.summonCount || 0) + 1;
      api.ring(point.x, point.y, boss.color, 62, 5);
    }
    if (made.length) api.float('REINFORCEMENTS', boss.x, boss.y - boss.radius - 54, boss.color);
    return made;
  }
  function phaseTransition(boss, next, api, cfg) {
    boss.patternPhase = next;
    boss.attackZones = [];
    stage(boss, 'phaseTransition', next === 3 ? 92 : 76);
    boss.arenaMode = 'transition';
    api.float(next === 3 ? 'FINAL MOVEMENT' : 'SECOND MOVEMENT', boss.x, boss.y - boss.radius - 58, next === 3 ? '#fff' : boss.color);
    api.ring(boss.x, boss.y, next === 3 ? '#fff' : boss.color, next === 3 ? 280 : 220, next === 3 ? 12 : 8);
    api.particles(boss.x, boss.y, boss.color, next === 3 ? 34 : 24, next === 3 ? 8 : 6);
    summonWave(boss, api, next);
    if (cfg.transition) cfg.transition(boss, next, api, Q);
  }
  function selectAttack(boss, p, cfg) {
    var pool = p === 1 ? cfg.phaseOne || [0, 1, 2] : p === 2 ? cfg.phaseTwo || [0, 1, 2, 3, 4] : cfg.phaseThree || [2, 3, 4, 5];
    var cursor = boss.comboIndex++;
    if (p === 3 && cursor % 3 === 2 && pool.indexOf(5) >= 0) return 5;
    return pool[cursor % pool.length];
  }
  function makeBehavior(key, cfg) {
    return {
      init: function (boss, api) {
        boss.patternPhase = 1;
        boss.patternIndex = 0;
        boss.attackZones = [];
        boss.arenaZones = [];
        boss.arenaMode = '';
        boss.arenaAngle = 0;
        boss.arenaPower = 0;
        boss.comboState = 'roam';
        boss.timer = 34;
        boss.qualityHits = Object.create(null);
        boss.aimSample = null;
        if (cfg.init) cfg.init(boss, api, Q);
      },
      execute: function (boss, index, t, api) {
        t = t || target(boss, api);
        if (!t) return;
        t = leadTarget(boss, t, api);
        index = Math.max(0, Math.min(cfg.attacks.length - 1, index));
        boss.patternIndex = index;
        boss.comboName = boss.bossDef.combos[index] || cfg.attacks[index].name;
        boss.attackStep = 0;
        boss.attackAux = 0;
        boss.attackMask = 0;
        boss.attackZones = [];
        boss.arenaMode = cfg.arenaMode || boss.arenaMode;
        api.float(boss.comboName, boss.x, boss.y - boss.radius - 32, boss.color);
        stage(boss, 'telegraph', 30);
        cfg.attacks[index].begin(boss, t, api, Q);
        if ((boss.arenaZones || []).length > 28) boss.arenaZones = boss.arenaZones.slice(-28);
      },
      update: function (boss, step, api) {
        var t = target(boss, api);
        if (!t) return true;
        trackTarget(boss, t, step);
        var aimedTarget = leadTarget(boss, t, api),
          p = phase(boss);
        updateArenaZones(boss, step);
        if (p > boss.patternPhase && boss.comboState !== 'phaseTransition') phaseTransition(boss, p, api, cfg);
        if (cfg.arena) cfg.arena(boss, step, t, api, Q);
        if ((boss.arenaZones || []).length > 28) boss.arenaZones = boss.arenaZones.slice(-28);
        if (boss.comboState === 'phaseTransition') {
          boss.stateTimer -= step;
          if (api.interval(boss, 'qualityTransitionPulse', step, 13)) api.ring(boss.x, boss.y, p === 3 ? '#fff' : boss.color, 120 + boss.stateTimer % 4 * 32, 4);
          if (boss.stateTimer <= 0) {
            boss.comboState = 'roam';
            boss.timer = 0;
            boss.arenaMode = cfg.arenaMode || '';
          }
          return true;
        }
        if (boss.comboState === 'roam') {
          if (cfg.move) cfg.move(boss, step, t, api, Q);else moveOrbit(boss, t, api, step, cfg.distance || 300, p === 3 ? 1.18 : p === 2 ? 1.1 : 1);
          boss.timer += step;
          var pressureTempo = Math.max(.82, 1 - Math.min(6, boss.pressureTier || 0) * .03),
            pacing = Math.max(40, Math.round((cfg.pacing || [104, 88, 72])[p - 1] * (cfg.pacingScale || .72) * pressureTempo));
          if (boss.timer >= pacing) {
            boss.timer = 0;
            this.execute(boss, selectAttack(boss, p, cfg), boss.chooseTarget(), api);
          }
          return true;
        }
        if (boss.comboState === 'release') {
          boss.stateTimer -= step;
          if (cfg.release) cfg.release(boss, step, t, api, Q);
          if (boss.stateTimer <= 0) {
            boss.comboState = 'roam';
            boss.timer = 0;
            boss.attackZones = [];
          }
          return true;
        }
        cfg.attacks[boss.patternIndex].update(boss, step, aimedTarget, api, Q);
        if ((boss.arenaZones || []).length > 28) boss.arenaZones = boss.arenaZones.slice(-28);
        return true;
      },
      draw: function (boss, api) {
        if (cfg.drawArena) cfg.drawArena(boss, api, Q);
        var attack = cfg.attacks[boss.patternIndex];
        if (attack && attack.draw && boss.comboState !== 'roam' && boss.comboState !== 'release') attack.draw(boss, api, Q);
        if (boss.arenaMode !== 'hidden') drawBossBody(boss, api);
        if (boss.comboState === 'phaseTransition') drawTransition(boss, api);
      },
      quality: true
    };
  }
  function drawTransition(boss, api) {
    var c = api.ctx,
      t = api.visualTick();
    c.save();
    c.translate(boss.x, boss.y);
    c.rotate(t * .018);
    c.globalAlpha = .4 + .18 * Math.sin(t * .15);
    c.strokeStyle = boss.patternPhase === 3 ? '#fff' : boss.color;
    c.lineWidth = 5;
    for (var i = 0; i < 3; i++) {
      c.rotate(TAU / 3);
      c.beginPath();
      c.arc(0, 0, 95 + i * 30, -.55, .55);
      c.stroke();
    }
    c.restore();
  }
  function bodyBase(c, boss, t) {
    var bob = Math.sin(t * .055 + boss.orbit) * 4,
      active = boss.comboState !== 'roam' && boss.comboState !== 'release',
      phaseScale = boss.apex ? 1.08 : boss.enraged ? 1.04 : 1;
    c.translate(boss.x, boss.y + bob);
    c.scale(phaseScale, phaseScale);
    c.shadowColor = boss.color;
    c.shadowBlur = active ? 24 : 12;
    c.strokeStyle = '#f7fbff';
    c.fillStyle = boss.color;
    c.lineWidth = 3;
    c.lineJoin = 'round';
    c.lineCap = 'round';
  }
  function drawBossBody(boss, api) {
    if (api.ctx.isWorld3D) return; // The body is a lit 3D model; warnings remain authored vectors.
    var c = api.ctx,
      t = api.visualTick(),
      k = boss.bossKey;
    c.save();
    bodyBase(c, boss, t);
    if (k === 'frost') {
      c.fillStyle = '#18303b';
      c.beginPath();
      c.moveTo(0, -55);
      c.lineTo(39, 36);
      c.lineTo(18, 60);
      c.lineTo(-18, 60);
      c.lineTo(-39, 36);
      c.closePath();
      c.fill();
      c.stroke();
      c.rotate(t * .01);
      for (var i = 0; i < 6; i++) {
        c.rotate(TAU / 6);
        c.beginPath();
        c.moveTo(8, 0);
        c.lineTo(47, 0);
        c.moveTo(27, 0);
        c.lineTo(36, -10);
        c.moveTo(27, 0);
        c.lineTo(36, 10);
        c.stroke();
      }
    } else if (k === 'sand') {
      c.fillStyle = '#4a3b22';
      c.beginPath();
      c.moveTo(-35, -55);
      c.lineTo(35, -55);
      c.lineTo(13, -9);
      c.lineTo(35, 55);
      c.lineTo(-35, 55);
      c.lineTo(-13, -9);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = '#f7d77a';
      c.beginPath();
      c.moveTo(-24, -43);
      c.lineTo(24, -43);
      c.lineTo(0, -4);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(24, 43);
      c.lineTo(-24, 43);
      c.closePath();
      c.fill();
    } else if (k === 'storm') {
      c.fillStyle = '#28143c';
      c.beginPath();
      c.arc(0, 0, 34, 0, TAU);
      c.fill();
      c.stroke();
      for (var co = 0; co < 5; co++) {
        c.rotate(TAU / 5);
        c.beginPath();
        for (var q = 0; q < 5; q++) c.lineTo(38 + q * 8, q % 2 ? 8 : -8);
        c.stroke();
        c.beginPath();
        c.arc(82, 0, 7, 0, TAU);
        c.fill();
        c.stroke();
      }
    } else if (k === 'void') {
      c.fillStyle = '#020104';
      c.beginPath();
      c.arc(0, 0, 42, 0, TAU);
      c.fill();
      c.strokeStyle = boss.color;
      c.lineWidth = 6;
      for (var vo = 0; vo < 3; vo++) {
        c.rotate(.8 + vo * .7 + t * .006);
        c.beginPath();
        c.ellipse(0, 0, 72 - vo * 10, 20 + vo * 4, 0, 0, TAU);
        c.stroke();
      }
    } else if (k === 'blood') {
      c.fillStyle = '#421423';
      c.beginPath();
      c.moveTo(0, -55);
      c.lineTo(34, -20);
      c.lineTo(43, 55);
      c.lineTo(-43, 55);
      c.lineTo(-34, -20);
      c.closePath();
      c.fill();
      c.stroke();
      for (var ro = 0; ro < 7; ro++) {
        c.rotate(TAU / 7);
        c.fillStyle = ro % 2 ? '#ff9caf' : boss.color;
        c.beginPath();
        c.ellipse(0, -43, 13, 28, 0, 0, TAU);
        c.fill();
        c.stroke();
      }
    } else if (k === 'thorn') {
      c.fillStyle = '#18351d';
      c.beginPath();
      c.ellipse(0, 12, 43, 30, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(-22, -9);
      c.lineTo(-50, -38);
      c.lineTo(-40, -73);
      c.moveTo(-45, -45);
      c.lineTo(-70, -57);
      c.moveTo(22, -9);
      c.lineTo(50, -38);
      c.lineTo(40, -73);
      c.moveTo(45, -45);
      c.lineTo(70, -57);
      c.stroke();
      c.fillStyle = '#e9ffdd';
      c.beginPath();
      c.arc(17, 4, 4, 0, TAU);
      c.fill();
    } else if (k === 'tide') {
      c.fillStyle = '#123b46';
      c.beginPath();
      c.moveTo(-43, -42);
      c.quadraticCurveTo(0, -65, 43, -42);
      c.lineTo(30, 44);
      c.quadraticCurveTo(0, 64, -30, 44);
      c.closePath();
      c.fill();
      c.stroke();
      c.lineWidth = 7;
      c.beginPath();
      c.arc(0, -30, 21, Math.PI, TAU);
      c.stroke();
      c.beginPath();
      c.moveTo(0, 43);
      c.lineTo(0, 62);
      c.stroke();
    } else if (k === 'cloud') {
      c.fillStyle = '#35516a';
      c.beginPath();
      c.moveTo(-66, 13);
      c.lineTo(-20, -22);
      c.lineTo(0, -49);
      c.lineTo(20, -22);
      c.lineTo(68, 11);
      c.lineTo(24, 23);
      c.lineTo(0, 53);
      c.lineTo(-24, 23);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = '#fff';
      c.beginPath();
      c.moveTo(5, -30);
      c.lineTo(16, -20);
      c.lineTo(5, -14);
      c.closePath();
      c.fill();
    } else if (k === 'glyph') {
      c.fillStyle = '#4d3516';
      c.fillRect(-48, -43, 43, 86);
      c.fillRect(5, -43, 43, 86);
      c.strokeRect(-48, -43, 43, 86);
      c.strokeRect(5, -43, 43, 86);
      c.fillStyle = '#f9e6a3';
      c.font = '24px serif';
      c.textAlign = 'center';
      c.fillText('!', -26, -4);
      c.fillText('?', 26, 24);
      c.strokeStyle = boss.color;
      c.beginPath();
      c.moveTo(0, -45);
      c.lineTo(0, 45);
      c.stroke();
    } else if (k === 'mirror') {
      c.rotate(Math.sin(t * .025) * .2);
      c.fillStyle = 'rgba(190,244,255,.38)';
      c.beginPath();
      c.moveTo(0, -65);
      c.lineTo(43, -18);
      c.lineTo(28, 51);
      c.lineTo(-28, 51);
      c.lineTo(-43, -18);
      c.closePath();
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(0, -65);
      c.lineTo(0, 51);
      c.moveTo(-43, -18);
      c.lineTo(28, 51);
      c.moveTo(43, -18);
      c.lineTo(-28, 51);
      c.stroke();
    } else if (k === 'neon') {
      c.fillStyle = '#143b36';
      c.beginPath();
      c.ellipse(0, 12, 54, 38, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.beginPath();
      c.arc(-30, -25, 18, 0, TAU);
      c.arc(30, -25, 18, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(-30, -28, 6, 0, TAU);
      c.arc(30, -28, 6, 0, TAU);
      c.fill();
      c.strokeStyle = boss.color;
      c.beginPath();
      c.arc(0, 12, 28, 0, Math.PI);
      c.stroke();
    } else if (k === 'magma') {
      c.fillStyle = '#4a1b11';
      c.beginPath();
      c.moveTo(-47, -44);
      c.lineTo(-20, -56);
      c.lineTo(0, -43);
      c.lineTo(22, -58);
      c.lineTo(49, -40);
      c.lineTo(41, 52);
      c.lineTo(-41, 52);
      c.closePath();
      c.fill();
      c.stroke();
      c.fillStyle = '#ffcf87';
      c.beginPath();
      c.moveTo(-8, -28);
      c.lineTo(9, -28);
      c.lineTo(2, 30);
      c.lineTo(-13, 12);
      c.closePath();
      c.fill();
      c.rotate(-.65);
      c.fillStyle = '#2c1d19';
      c.fillRect(42, -8, 68, 16);
      c.fillRect(90, -25, 42, 50);
      c.strokeRect(90, -25, 42, 50);
    } else if (k === 'gear') {
      c.fillStyle = '#443b24';
      c.beginPath();
      c.arc(0, 0, 43, 0, TAU);
      c.fill();
      c.stroke();
      for (var ge = 0; ge < 10; ge++) {
        c.rotate(TAU / 10);
        c.fillRect(39, -6, 19, 12);
        c.strokeRect(39, -6, 19, 12);
      }
      c.rotate(t * .015);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, 35);
      c.stroke();
      c.fillStyle = '#f3d26e';
      c.beginPath();
      c.arc(0, 37, 10, 0, TAU);
      c.fill();
    } else if (k === 'moon') {
      c.fillStyle = '#232845';
      c.beginPath();
      c.ellipse(0, 10, 52, 29, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(-35, -5);
      c.lineTo(-50, -45);
      c.lineTo(-17, -19);
      c.moveTo(35, -5);
      c.lineTo(50, -45);
      c.lineTo(17, -19);
      c.stroke();
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(22, 2, 4, 0, TAU);
      c.fill();
      c.strokeStyle = boss.color;
      c.beginPath();
      c.arc(-8, 9, 24, -1.1, 1.1);
      c.stroke();
    } else if (k === 'spore') {
      c.fillStyle = '#34461e';
      c.fillRect(-17, -5, 34, 58);
      c.strokeRect(-17, -5, 34, 58);
      c.fillStyle = '#779944';
      c.beginPath();
      c.ellipse(0, -21, 61, 35, 0, Math.PI, TAU);
      c.quadraticCurveTo(0, 12, -61, -21);
      c.fill();
      c.stroke();
      for (var sp = 0; sp < 9; sp++) {
        var a = sp * TAU / 9;
        c.fillStyle = sp % 2 ? '#efffc5' : boss.color;
        c.beginPath();
        c.arc(Math.cos(a) * 39, Math.sin(a) * 18 - 22, 4, 0, TAU);
        c.fill();
      }
    }
    c.restore();
  }
  function projectileArt(r) {
    var c = r.ctx,
      b = r.projectile,
      t = r.visualTick,
      type = b.type || '';
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.strokeStyle = '#fff';
    c.lineWidth = 1.6;
    if (type === 'flake') {
      c.rotate(t * .018);
      for (var i = 0; i < 6; i++) {
        c.rotate(TAU / 6);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(12, 0);
        c.moveTo(7, 0);
        c.lineTo(10, -4);
        c.moveTo(7, 0);
        c.lineTo(10, 4);
        c.stroke();
      }
    } else if (type === 'icicle' || type === 'frostNeedle' || type === 'needle') {
      c.fillStyle = b.color;
      c.beginPath();
      c.moveTo(16, 0);
      c.lineTo(-8, -4);
      c.lineTo(-4, 0);
      c.lineTo(-8, 4);
      c.closePath();
      c.fill();
      c.stroke();
    } else if (type === 'iceBlade' || type === 'forgeBlade' || type === 'spectralSword') {
      c.fillStyle = type === 'spectralSword' ? 'rgba(20,7,12,.92)' : b.color;
      c.beginPath();
      c.moveTo(type === 'spectralSword' ? 32 : 28, 0);
      c.lineTo(-14, -9);
      c.lineTo(-6, 0);
      c.lineTo(-14, 9);
      c.closePath();
      c.fill();
      c.strokeStyle = type === 'spectralSword' ? '#ff8994' : '#fff';
      c.stroke();
      c.beginPath();
      c.moveTo(-8, 0);
      c.lineTo(type === 'spectralSword' ? 27 : 23, 0);
      c.stroke();
      if (type === 'spectralSword') {
        c.lineWidth = 4;
        c.beginPath();
        c.moveTo(-12, -10);
        c.lineTo(-12, 10);
        c.stroke();
      }
    } else if (type === 'clockHand') {
      c.fillStyle = b.color;
      c.fillRect(-9, -4, 22, 8);
      c.strokeRect(-9, -4, 22, 8);
      c.beginPath();
      c.arc(-7, 0, 5, 0, TAU);
      c.stroke();
    } else if (type === 'sandShard') {
      c.fillStyle = b.color;
      c.beginPath();
      c.moveTo(12, 0);
      c.lineTo(-5, -7);
      c.lineTo(-1, 0);
      c.lineTo(-5, 7);
      c.closePath();
      c.fill();
      c.stroke();
    } else if (type === 'numeral' || type.indexOf('glyph_') === 0) {
      var glyph = type === 'numeral' ? String(1 + Math.floor((b.netId || 0) % 12)) : type.slice(6);
      c.fillStyle = b.color;
      c.font = (type === 'numeral' ? '11px' : '15px') + ' \"Noto Sans Thai\", \"Ubuntu\", sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(glyph, 0, 1);
    } else if (type === 'node') {
      c.fillStyle = '#15101d';
      c.beginPath();
      c.arc(0, 0, 9, 0, TAU);
      c.fill();
      c.stroke();
      for (var n = 0; n < 4; n++) {
        c.rotate(TAU / 4);
        c.beginPath();
        c.moveTo(9, 0);
        c.lineTo(15, 0);
        c.stroke();
      }
    } else if (type === 'plasma' || type === 'pulse') {
      c.fillStyle = b.color;
      c.beginPath();
      c.arc(0, 0, b.radius, 0, TAU);
      c.fill();
      c.stroke();
      c.globalAlpha = .55;
      c.beginPath();
      c.arc(0, 0, b.radius + 5 + Math.sin(t * .12) * 2, 0, TAU);
      c.stroke();
    } else if (type === 'gravitySeed') {
      c.fillStyle = '#020104';
      c.beginPath();
      c.arc(0, 0, b.radius, 0, TAU);
      c.fill();
      c.strokeStyle = b.color;
      c.beginPath();
      c.ellipse(0, 0, b.radius + 7, 4, t * .02, 0, TAU);
      c.stroke();
    } else if (type === 'gravityWave') {
      c.strokeStyle = b.color;
      c.lineWidth = 5;
      c.beginPath();
      c.arc(0, 0, b.radius + 7, -1.1, 1.1);
      c.stroke();
      c.strokeStyle = '#fff';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(0, 0, b.radius + 11, -.8, .8);
      c.stroke();
    } else if (type === 'petalSoft' || type === 'petalBlade') {
      c.fillStyle = b.color;
      c.globalAlpha = type === 'petalSoft' ? .42 : 1;
      c.beginPath();
      c.moveTo(12, 0);
      c.quadraticCurveTo(0, -9, -9, 0);
      c.quadraticCurveTo(0, 9, 12, 0);
      c.fill();
      c.strokeStyle = type === 'petalBlade' ? '#ffedf1' : 'rgba(255,255,255,.35)';
      c.stroke();
    } else if (type === 'thorn' || type === 'hypha') {
      c.strokeStyle = b.color;
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(-12, 0);
      c.lineTo(12, 0);
      c.stroke();
      c.fillStyle = '#fff';
      c.beginPath();
      c.moveTo(3, 0);
      c.lineTo(-2, -6);
      c.lineTo(-1, 0);
      c.lineTo(-2, 6);
      c.closePath();
      c.fill();
    } else if (type === 'seed' || type === 'spore') {
      c.fillStyle = b.color;
      c.beginPath();
      c.ellipse(0, 0, 8, 5, 0, 0, TAU);
      c.fill();
      c.stroke();
      if (type === 'spore') {
        c.beginPath();
        c.arc(-5, -6, 2, 0, TAU);
        c.arc(3, -8, 2, 0, TAU);
        c.stroke();
      }
    } else if (type === 'waterBlade' || type === 'feather') {
      c.fillStyle = b.color;
      c.beginPath();
      c.moveTo(15, 0);
      c.quadraticCurveTo(-2, -9, -13, -3);
      c.quadraticCurveTo(-3, 1, -13, 7);
      c.quadraticCurveTo(1, 8, 15, 0);
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(-10, 3);
      c.lineTo(12, 0);
      c.stroke();
    } else if (type === 'bubble') {
      c.fillStyle = 'rgba(190,249,255,.18)';
      c.beginPath();
      c.arc(0, 0, b.radius, 0, TAU);
      c.fill();
      c.lineWidth = 3;
      c.stroke();
      c.fillStyle = '#fff';
      c.beginPath();
      c.arc(-b.radius * .28, -b.radius * .28, 3, 0, TAU);
      c.fill();
    } else if (type === 'anchor') {
      c.lineWidth = 4;
      c.beginPath();
      c.arc(0, -7, 5, 0, TAU);
      c.moveTo(0, -2);
      c.lineTo(0, 13);
      c.moveTo(-11, 4);
      c.quadraticCurveTo(-8, 15, 0, 15);
      c.quadraticCurveTo(8, 15, 11, 4);
      c.stroke();
    } else if (type === 'lightning') {
      c.strokeStyle = b.color;
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(-15, 0);
      c.lineTo(-5, -6);
      c.lineTo(1, 5);
      c.lineTo(8, -5);
      c.lineTo(15, 0);
      c.stroke();
    } else if (type === 'glassShard') {
      c.fillStyle = 'rgba(210,250,255,.48)';
      c.beginPath();
      c.moveTo(15, 0);
      c.lineTo(-7, -8);
      c.lineTo(-2, 0);
      c.lineTo(-7, 8);
      c.closePath();
      c.fill();
      c.stroke();
    } else if (type === 'tadpole') {
      c.fillStyle = b.color;
      c.beginPath();
      c.arc(7, 0, 6, 0, TAU);
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(1, 0);
      c.quadraticCurveTo(-8, -8 - Math.sin(t * .2) * 4, -14, 0);
      c.stroke();
    } else if (type === 'slag') {
      c.fillStyle = b.color;
      c.beginPath();
      c.arc(0, 0, b.radius, 0, TAU);
      c.fill();
      c.stroke();
      c.fillStyle = '#fff1b0';
      c.beginPath();
      c.arc(3, -3, 2, 0, TAU);
      c.fill();
    } else if (type === 'gear') {
      c.fillStyle = '#4a412b';
      c.beginPath();
      c.arc(0, 0, 9, 0, TAU);
      c.fill();
      c.stroke();
      for (var g = 0; g < 8; g++) {
        c.rotate(TAU / 8);
        c.fillRect(8, -2, 6, 4);
      }
    } else if (type === 'crescent') {
      c.strokeStyle = b.color;
      c.lineWidth = 6;
      c.beginPath();
      c.arc(0, 0, 11, -1.2, 1.2);
      c.stroke();
      c.strokeStyle = '#fff';
      c.lineWidth = 1;
      c.stroke();
    } else if (type === 'bone') {
      c.strokeStyle = b.color;
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(-10, 0);
      c.lineTo(10, 0);
      c.stroke();
      c.beginPath();
      c.arc(-11, -3, 4, 0, TAU);
      c.arc(-11, 3, 4, 0, TAU);
      c.arc(11, -3, 4, 0, TAU);
      c.arc(11, 3, 4, 0, TAU);
      c.stroke();
    } else {
      c.fillStyle = b.color;
      c.beginPath();
      c.moveTo(12, 0);
      c.lineTo(-5, -6);
      c.lineTo(-1, 0);
      c.lineTo(-5, 6);
      c.closePath();
      c.fill();
      c.stroke();
    }
  }
  var Q = window.DKBossQuality = {
    TAU: TAU,
    living: living,
    target: target,
    phase: phase,
    angle: angle,
    dist: dist,
    clampPoint: clampPoint,
    seeded: seeded,
    stage: stage,
    finish: finish,
    shot: shot,
    fan: fan,
    nova: nova,
    hitCircle: hitCircle,
    hitLine: hitLine,
    friendlyBreaks: friendlyBreaks,
    moveOrbit: moveOrbit,
    pointLine: pointLine,
    trackTarget: trackTarget,
    leadTarget: leadTarget,
    summonWave: summonWave,
    register: function (key, cfg, moduleName) {
      DKRegister.bossBehavior(key, makeBehavior(key, cfg), moduleName);
    },
    drawBossBody: drawBossBody
  };
  ['ember', 'frost', 'sand', 'storm', 'void', 'blood', 'thorn', 'tide', 'cloud', 'glyph', 'mirror', 'neon', 'magma', 'gear', 'moon', 'spore'].forEach(function (key) {
    DKRegister.projectileRenderer('boss_' + key, projectileArt, 'world/bosses/quality-projectiles');
  });
})();

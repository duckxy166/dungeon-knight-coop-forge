(function () {
  'use strict';

  var Q = window.DKBossQuality,
    TAU = Q.TAU;
  function aim(b, t) {
    return Math.atan2(t.y - b.y, t.x - b.x);
  }
  function tick(b, s) {
    b.stateTimer -= s;
    return b.stateTimer <= 0;
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
  function circle(c, x, y, r, color, alpha, width) {
    c.save();
    c.globalAlpha = alpha === undefined ? 1 : alpha;
    c.strokeStyle = color;
    c.lineWidth = width || 3;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
    c.restore();
  }
  function hostile(api, key) {
    return api.bullets().filter(function (x) {
      return !x.dead && !x.friendly && (!key || x.sourceId === 'boss_' + key);
    });
  }

  /* PENDULUM ENGINE — several deterministic time scales coexist. */
  function gearTime(b, s, t, api) {
    var zones = b.arenaZones || [];
    hostile(api, 'gear').forEach(function (x) {
      var scale = 1;
      if (b.arenaMode === 'broken') {
        var q = (x.x >= 0 ? 1 : 0) + (x.y >= 0 ? 2 : 0);
        scale = [.42, 1.55, 0, .82][q];
      } else zones.forEach(function (z) {
        if (z.kind === 'timeZone' && Math.hypot(x.x - z.x, x.y - z.y) < z.radius) scale = z.scale;
      });
      x.motionScale = scale;
    });
  }
  function drawTimeArena(b, api) {
    var c = api.ctx,
      t = api.visualTick();
    (b.arenaZones || []).forEach(function (z) {
      if (z.kind !== 'timeZone') return;
      c.save();
      c.globalAlpha = .13;
      c.fillStyle = z.scale === 0 ? '#fff' : z.scale < 1 ? '#68a7ff' : '#ffd36a';
      c.beginPath();
      c.arc(z.x, z.y, z.radius, 0, TAU);
      c.fill();
      c.globalAlpha = .48;
      c.strokeStyle = z.scale === 0 ? '#fff' : z.scale < 1 ? '#68a7ff' : '#ffd36a';
      c.lineWidth = 4;
      c.stroke();
      c.restore();
    });
    if (b.arenaMode === 'broken') {
      var colors = ['#68a7ff', '#ffd36a', '#fff', '#a98cff'];
      for (var q = 0; q < 4; q++) {
        c.save();
        c.globalAlpha = .08 + .03 * Math.sin(t * .05 + q);
        c.fillStyle = colors[q];
        c.fillRect(q % 2 ? 0 : -api.ARENA, q > 1 ? 0 : -api.ARENA, api.ARENA, api.ARENA);
        c.restore();
      }
    }
  }
  var gearAttacks = [{
    name: 'THREE SPEEDS',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 3; i++) {
        var a = i * TAU / 3,
          p = Q.clampPoint(api, t.x + Math.cos(a) * 760, t.y + Math.sin(a) * 660, 110);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          index: i
        });
      }
      Q.stage(b, 'threeTell', 64);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'threeTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'threeLive', 210);
      } else if (b.comboState === 'threeLive') {
        if (api.interval(b, 'threeVolley', s, 28)) {
          b.attackZones.forEach(function (z, i) {
            var type = i === 0 ? 'clockHand' : i === 1 ? 'gear' : 'needle',
              speed = i === 0 ? 5.6 : i === 1 ? 2.8 : 10.5;
            Q.shot(b, api, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), speed, 1.1, type, {
              radius: i === 1 ? 9 : 5,
              life: 390,
              ghost: true,
              heavy: i === 1
            });
          });
          b.attackStep++;
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      (b.attackZones || []).forEach(function (z) {
        line(c, z.x, z.y, b.attackX || 0, b.attackY || 0, b.color, 2, .22, [15, 11]);
      });
    }
  }, {
    name: 'PENDULUM',
    begin: function (b) {
      b.attackAngle = -1.05;
      b.attackMask = 0;
      Q.stage(b, 'pendulumTell', 58);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'pendulumTell' && tick(b, s)) Q.stage(b, 'pendulumLive', 280);else if (b.comboState === 'pendulumLive') {
        var p = 1 - b.stateTimer / 280,
          old = b.attackAngle;
        b.attackAngle = Math.sin(p * TAU * 2.25) * 1.15;
        if (old < -.98 && b.attackAngle >= -.98 || old > .98 && b.attackAngle <= .98) {
          var perp = b.attackAngle + (old < 0 ? Math.PI / 2 : -Math.PI / 2);
          Q.fan(b, api, b.x + Math.sin(b.attackAngle) * 410, b.y + Math.cos(b.attackAngle) * 410, perp, 7, 1.35, 5.4, 1.08, 'clockHand', {
            radius: 6,
            life: 300,
            ghost: true
          });
          api.ring(b.x, b.y, b.color, 430, 6);
        }
        var bob = {
          x: b.x + Math.sin(b.attackAngle) * 410,
          y: b.y + Math.cos(b.attackAngle) * 410
        };
        Q.hitLine(b, api, b.x, b.y, bob.x, bob.y, 24, 1.35, 'physical pendulum', 38);
        if (tick(b, s)) Q.finish(b, 46);
      }
    },
    draw: function (b, api) {
      var x = b.x + Math.sin(b.attackAngle) * 410,
        y = b.y + Math.cos(b.attackAngle) * 410;
      line(api.ctx, b.x, b.y, x, y, '#e4c05b', 16, .65);
      circle(api.ctx, x, y, 38, '#fff', .75, 7);
    }
  }, {
    name: 'TIME ZONES',
    begin: function (b, t) {
      b.arenaZones = b.arenaZones.filter(function (z) {
        return z.kind !== 'timeZone';
      });
      b.arenaZones.push({
        x: t.x - 310,
        y: t.y - 160,
        radius: 230,
        kind: 'timeZone',
        scale: .42,
        life: 320
      }, {
        x: t.x + 310,
        y: t.y - 160,
        radius: 230,
        kind: 'timeZone',
        scale: 1.65,
        life: 320
      }, {
        x: t.x,
        y: t.y + 310,
        radius: 190,
        kind: 'timeZone',
        scale: 0,
        life: 320
      });
      Q.stage(b, 'zonesTell', 64);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'zonesTell' && tick(b, s)) Q.stage(b, 'zonesLive', 240);else if (b.comboState === 'zonesLive') {
        if (api.interval(b, 'zoneVolley', s, 14)) {
          var type = ['clockHand', 'gear', 'needle'][b.attackStep % 3];
          Q.fan(b, api, b.x, b.y, aim(b, t), 3, .48, 6.1, 1.08, type, {
            radius: type === 'gear' ? 8 : 5,
            life: 380,
            ghost: true
          });
          b.attackStep++;
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, 120, b.color, .2, 4);
    }
  }, {
    name: 'ESCAPEMENT',
    begin: function (b) {
      b.attackAux = 0;
      b.attackMask = -1;
      Q.stage(b, 'escapeLive', 270);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'escapeLive') {
        b.attackAux += s;
        var beat = Math.floor(b.attackAux / 34) % 4;
        if (beat !== b.attackMask) {
          b.attackMask = beat;
          if (beat < 3) {
            var a = beat * TAU / 3 + b.orbit;
            Q.fan(b, api, b.x, b.y, a, 5, .72, 4.8 + beat, 1.08, beat === 0 ? 'gear' : beat === 1 ? 'clockHand' : 'needle', {
              radius: beat === 0 ? 8 : 5,
              life: 310,
              ghost: true
            });
          } else api.ring(b.x, b.y, '#fff', 180, 5);
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      c.save();
      c.translate(b.x, b.y - 100);
      c.fillStyle = '#fff';
      c.font = '13px \"Noto Sans Thai\", \"Ubuntu\", sans-serif';
      c.textAlign = 'center';
      c.fillText(String(b.attackMask + 1 || 1), 0, 0);
      c.restore();
    }
  }, {
    name: 'PHASE DRIFT',
    begin: function (b, t) {
      b.arenaZones = b.arenaZones.filter(function (z) {
        return z.kind !== 'timeZone';
      });
      for (var i = 0; i < 4; i++) {
        var a = i * TAU / 4;
        b.arenaZones.push({
          x: Math.cos(a) * 420,
          y: Math.sin(a) * 360,
          radius: 180,
          kind: 'timeZone',
          scale: i === 0 ? 0 : i % 2 ? .48 : 1.55,
          life: 300
        });
      }
      Q.stage(b, 'driftLive', 250);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'driftLive') {
        if (api.interval(b, 'driftShots', s, 10)) {
          var a = b.attackStep++ * .77;
          Q.shot(b, api, b.x, b.y, a, 6, 1.05, b.attackStep % 3 === 0 ? 'gear' : b.attackStep % 3 === 1 ? 'clockHand' : 'needle', {
            radius: b.attackStep % 3 === 0 ? 8 : 5,
            life: 390,
            ghost: true
          });
        }
        if (tick(b, s)) Q.finish(b, 46);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, 155, b.color, .18, 4);
    }
  }, {
    name: 'BROKEN CLOCK',
    begin: function (b) {
      b.arenaMode = 'broken';
      b.attackStep = 0;
      Q.stage(b, 'brokenClock', 380);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'brokenClock') {
        var q = Math.floor((1 - b.stateTimer / 380) * 8) % 4,
          targetX = q % 2 ? 430 : -430,
          targetY = q > 1 ? 360 : -360,
          scale = [.42, 1.55, 0, .82][q];
        b.x += (targetX - b.x) * .018 * s * scale;
        b.y += (targetY - b.y) * .018 * s * scale;
        if (api.interval(b, 'brokenVolley', s, 13)) {
          var type = ['gear', 'needle', 'clockHand'][b.attackStep++ % 3];
          Q.nova(b, api, b.x, b.y, 5 + b.attackStep % 3, 4.8, 1.08, type, {
            radius: type === 'gear' ? 8 : 5,
            life: 390,
            ghost: true
          }, b.orbit);
        }
        if (tick(b, s)) {
          b.arenaMode = '';
          Q.finish(b, 58);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      c.save();
      c.translate(0, 0);
      c.strokeStyle = '#fff1b2';
      c.globalAlpha = .35;
      c.lineWidth = 8;
      c.beginPath();
      c.moveTo(-api.ARENA, 0);
      c.lineTo(api.ARENA, 0);
      c.moveTo(0, -api.ARENA);
      c.lineTo(0, api.ARENA);
      c.stroke();
      c.restore();
    }
  }];
  Q.register('gear', {
    attacks: gearAttacks,
    distance: 360,
    pacing: [110, 90, 72],
    arena: gearTime,
    drawArena: drawTimeArena,
    arenaMode: 'timelines'
  }, 'world/bosses/pendulum-engine');

  /* ECLIPSE HOUND — the first dodge writes the return attack. */
  function moonArena(b, s, t, api) {
    var beams = (b.arenaZones || []).filter(function (z) {
      return z.kind === 'moonbeam';
    });
    hostile(api, 'moon').forEach(function (x) {
      var lit = beams.some(function (z) {
        return Math.hypot(x.x - z.x, x.y - z.y) < z.radius;
      });
      x.motionScale = lit ? .55 : 1.22;
    });
  }
  function drawMoonArena(b, api) {
    var c = api.ctx,
      t = api.visualTick(),
      beams = (b.arenaZones || []).filter(function (z) {
        return z.kind === 'moonbeam';
      });
    if (b.arenaMode === 'eclipse') {
      c.save();
      c.globalAlpha = .72;
      c.fillStyle = '#020309';
      c.fillRect(-api.ARENA, -api.ARENA, api.ARENA * 2, api.ARENA * 2);
      c.restore();
    }
    beams.forEach(function (z) {
      c.save();
      c.globalAlpha = b.arenaMode === 'eclipse' ? .26 : .14;
      c.fillStyle = '#f4f5ff';
      c.beginPath();
      c.arc(z.x, z.y, z.radius, 0, TAU);
      c.fill();
      c.globalAlpha = .55;
      c.strokeStyle = '#fff';
      c.lineWidth = 4;
      c.stroke();
      c.restore();
    });
  }
  function paw(c, z, active) {
    c.save();
    c.translate(z.x, z.y);
    c.rotate(z.angle || 0);
    c.globalAlpha = active ? .8 : .35;
    c.fillStyle = '#eef0ff';
    c.beginPath();
    c.ellipse(0, 6, 10, 14, 0, 0, TAU);
    c.fill();
    for (var i = -1; i <= 1; i++) {
      c.beginPath();
      c.arc(i * 9, -9 - Math.abs(i) * 2, 5, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  var moonAttacks = [{
    name: 'CRESCENT HUNT',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 9; i++) {
        var a = i * TAU / 9,
          p = Q.clampPoint(api, t.x + Math.cos(a) * 760, t.y + Math.sin(a) * 650, 110);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          index: i
        });
      }
      Q.stage(b, 'crescentTell', 54);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'crescentTell' && tick(b, s)) {
        b.attackZones.forEach(function (z) {
          Q.shot(b, api, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), 6.1, 1.1, 'crescent', {
            radius: 9,
            life: 480,
            reverseAge: 155,
            ghost: true,
            trailMax: 11
          });
        });
        Q.finish(b, 190);
      }
    },
    draw: function (b, api) {
      (b.attackZones || []).forEach(function (z) {
        circle(api.ctx, z.x, z.y, 18, b.color, .32, 3);
      });
    }
  }, {
    name: 'PAW TRAIL',
    begin: function (b, t, api) {
      b.attackZones = [];
      var x = t.x,
        y = t.y,
        a = aim(b, t) + Math.PI;
      for (var i = 0; i < 5; i++) {
        a += (Q.seeded((b.id || 1) + i * 2.3) - .5) * 1.0;
        x = api.clamp(x + Math.cos(a) * 210, -api.ARENA + 100, api.ARENA - 100);
        y = api.clamp(y + Math.sin(a) * 210, -api.ARENA + 100, api.ARENA - 100);
        b.attackZones.push({
          x: x,
          y: y,
          index: i,
          angle: a
        });
      }
      b.arenaMode = 'hidden';
      Q.stage(b, 'pawTell', 82);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'pawTell' && tick(b, s)) {
        b.attackStep = 0;
        b.arenaMode = 'pawRush';
        b.x = b.attackZones[0].x;
        b.y = b.attackZones[0].y;
        Q.stage(b, 'pawRush', 1);
      } else if (b.comboState === 'pawRush' && tick(b, s)) {
        var z = b.attackZones[b.attackStep++];
        b.x = z.x;
        b.y = z.y;
        Q.hitCircle(b, api, b.x, b.y, b.radius + 32, 1.7, 'paw trail', 110);
        api.ring(b.x, b.y, '#fff', 82, 7);
        if (b.attackStep >= b.attackZones.length) {
          b.arenaMode = '';
          Q.finish(b, 48);
        } else b.stateTimer = 12;
      }
    },
    draw: function (b, api) {
      (b.attackZones || []).forEach(function (z, i) {
        if (b.enraged && i === 2) return;
        paw(api.ctx, z, i === b.attackStep);
      });
    }
  }, {
    name: 'MOONLIGHT',
    begin: function (b, t) {
      b.arenaZones = b.arenaZones.filter(function (z) {
        return z.kind !== 'moonbeam';
      });
      b.arenaZones.push({
        x: t.x - 340,
        y: t.y,
        radius: 210,
        kind: 'moonbeam',
        life: 310
      }, {
        x: t.x + 340,
        y: t.y,
        radius: 210,
        kind: 'moonbeam',
        life: 310
      });
      Q.stage(b, 'moonlightLive', 240);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'moonlightLive') {
        if (api.interval(b, 'darkBones', s, 11)) {
          var side = b.attackStep++ % 4,
            a = side * TAU / 4,
            x = Math.cos(a) * 850,
            y = Math.sin(a) * 850;
          Q.shot(b, api, x, y, a + Math.PI, 6.4, 1.08, 'bone', {
            radius: 6,
            life: 380,
            ghost: true,
            trailMax: 8
          });
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, 140, b.color, .18, 4);
    }
  }, {
    name: 'UMBRA PACK',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var lane = 0; lane < 3; lane++) for (var i = 0; i < 3; i++) {
        var a = lane * TAU / 3 + .5,
          x = t.x + Math.cos(a) * (180 + i * 210),
          y = t.y + Math.sin(a) * (180 + i * 210);
        b.attackZones.push({
          x: api.clamp(x, -api.ARENA + 100, api.ARENA - 100),
          y: api.clamp(y, -api.ARENA + 100, api.ARENA - 100),
          index: lane * 3 + i,
          angle: a
        });
      }
      Q.stage(b, 'packTell', 68);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'packTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'packRush', 1);
      } else if (b.comboState === 'packRush' && tick(b, s)) {
        var lane = Math.floor(b.attackStep / 3),
          start = lane * 3;
        for (var i = 0; i < 2; i++) {
          var a = b.attackZones[start + i],
            z = b.attackZones[start + i + 1];
          Q.hitLine(b, api, a.x, a.y, z.x, z.y, 30, 1.4, 'umbra pack ' + lane, 55);
          api.beam(a.x, a.y, z.x, z.y, '#c9d1ff', 16);
        }
        b.attackStep += 3;
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 48);else b.stateTimer = 18;
      }
    },
    draw: function (b, api) {
      (b.attackZones || []).forEach(function (z, i) {
        paw(api.ctx, z, Math.floor(i / 3) === Math.floor(b.attackStep / 3));
      });
    }
  }, {
    name: 'DARK RETURN',
    begin: function (b, t, api) {
      b.attackAngle = aim(b, t);
      Q.stage(b, 'darkReturn', 230);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'darkReturn') {
        if (api.interval(b, 'darkCrescent', s, 18)) {
          var a = aim(b, t) + (b.attackStep % 5 - 2) * .22;
          Q.shot(b, api, b.x, b.y, a, 6.8, 1.12, 'crescent', {
            radius: 9,
            life: 430,
            reverseAge: 110,
            ghost: true,
            trailMax: 11
          });
          b.attackStep++;
        }
        if (api.interval(b, 'darkBone', s, 31)) Q.fan(b, api, b.x, b.y, aim(b, t), 3, .58, 7.5, 1.08, 'bone', {
          radius: 6,
          life: 230,
          ghost: true
        });
        if (tick(b, s)) Q.finish(b, 46);
      }
    },
    draw: function (b, api) {
      line(api.ctx, b.x, b.y, b.x + Math.cos(b.attackAngle) * 780, b.y + Math.sin(b.attackAngle) * 780, b.color, 3, .22, [16, 12]);
    }
  }, {
    name: 'TOTAL ECLIPSE',
    begin: function (b, t) {
      b.arenaZones = b.arenaZones.filter(function (z) {
        return z.kind !== 'moonbeam';
      });
      b.arenaZones.push({
        x: t.x,
        y: t.y,
        radius: 175,
        kind: 'moonbeam',
        life: 9999
      });
      b.arenaMode = 'eclipse';
      b.attackStep = 0;
      Q.stage(b, 'totalEclipse', 380);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'totalEclipse') {
        var beam = b.arenaZones.filter(function (z) {
            return z.kind === 'moonbeam';
          })[0],
          p = 1 - b.stateTimer / 380;
        beam.x = Math.cos(p * TAU * 1.7) * 520;
        beam.y = Math.sin(p * TAU * 2.1) * 430;
        b.x = Math.cos(p * TAU * 2.4) * 820;
        b.y = Math.sin(p * TAU * 2.4) * 720;
        if (api.interval(b, 'eclipsePaws', s, 58)) {
          b.attackX = t.x;
          b.attackY = t.y;
          b.attackAngle = aim(b, t);
          b.attackMask = 24;
        }
        if (b.attackMask > 0) {
          b.attackMask -= s;
          if (b.attackMask <= 0) {
            Q.hitLine(b, api, b.attackX - Math.cos(b.attackAngle) * 330, b.attackY - Math.sin(b.attackAngle) * 330, b.attackX + Math.cos(b.attackAngle) * 330, b.attackY + Math.sin(b.attackAngle) * 330, 28, 1.55, 'eclipse hunt', 75);
            api.beam(b.attackX - Math.cos(b.attackAngle) * 330, b.attackY - Math.sin(b.attackAngle) * 330, b.attackX + Math.cos(b.attackAngle) * 330, b.attackY + Math.sin(b.attackAngle) * 330, '#fff', 14);
          }
        }
        if (api.interval(b, 'eclipseCrescent', s, 17)) Q.shot(b, api, b.x, b.y, aim(b, t), 6.2, 1.12, 'crescent', {
          radius: 9,
          life: 430,
          reverseAge: 135,
          ghost: true,
          trailMax: 11
        });
        if (tick(b, s)) {
          b.arenaMode = '';
          Q.finish(b, 60);
        }
      }
    },
    draw: function (b, api) {
      if (b.attackMask > 0) line(api.ctx, b.attackX - Math.cos(b.attackAngle) * 360, b.attackY - Math.sin(b.attackAngle) * 360, b.attackX + Math.cos(b.attackAngle) * 360, b.attackY + Math.sin(b.attackAngle) * 360, '#fff', 4, .42, [15, 10]);
      cEyes(api.ctx, b);
      function cEyes(c, boss) {
        c.save();
        c.fillStyle = '#fff';
        c.shadowColor = boss.color;
        c.shadowBlur = 12;
        c.beginPath();
        c.arc(boss.x - 7, boss.y - 4, 3, 0, TAU);
        c.arc(boss.x + 7, boss.y - 4, 3, 0, TAU);
        c.fill();
        c.restore();
      }
    }
  }];
  Q.register('moon', {
    attacks: moonAttacks,
    distance: 250,
    pacing: [104, 86, 68],
    arena: moonArena,
    drawArena: drawMoonArena,
    arenaMode: 'hunt'
  }, 'world/bosses/eclipse-hound');

  /* MYCELIAL MONARCH — landed bullets hatch into autonomous organisms. */
  function sporeArena(b, s, t, api) {
    hostile(api, 'spore').forEach(function (x) {
      if (x.type === 'spore' && x.age > 72 && !x.organized) {
        x.organized = true;
        x.dead = true;
        b.arenaZones.push({
          x: x.x,
          y: x.y,
          kind: 'organism',
          organismType: (x.netId || 0) % 4,
          life: 390,
          radius: 23,
          awake: false
        });
        api.ring(x.x, x.y, b.color, 42, 4);
      }
    });
    (b.arenaZones || []).forEach(function (z) {
      if (z.kind !== 'organism' || z.dead) return;
      if (!z.awake && z.age > 42) z.awake = true;
      if (!z.awake) {
        Q.friendlyBreaks(api, z, 24);
        return;
      }
      if (Q.friendlyBreaks(api, z, 28)) return;
      if (z.organismType === 0 && api.interval(z, 'organismSpit', s, 46)) Q.shot(b, api, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), 5.5, 1.02, 'hypha', {
        radius: 5,
        life: 190,
        ghost: true,
        sineAmp: .28,
        sineFreq: .1
      });else if (z.organismType === 1) {
        var a = Math.atan2(t.y - z.y, t.x - z.x);
        z.x += Math.cos(a) * .7 * s;
        z.y += Math.sin(a) * .7 * s;
        Q.hitCircle(b, api, z.x, z.y, z.radius, 1.05, 'walking cap', 60);
      } else if (z.organismType === 2 && z.age % 68 < s) {
        Q.nova(b, api, z.x, z.y, 6, 3.8, 1, 'spore', {
          radius: 6,
          life: 260,
          ghost: true
        }, z.age * .01);
      }
    });
  }
  function drawSporeArena(b, api) {
    var c = api.ctx,
      t = api.visualTick();
    (b.arenaZones || []).forEach(function (z) {
      if (z.kind !== 'organism' || z.dead) return;
      c.save();
      c.translate(z.x, z.y);
      c.globalAlpha = z.awake ? .8 : .45;
      c.fillStyle = z.organismType === 3 ? '#f5dc80' : b.color;
      c.strokeStyle = '#efffc5';
      c.lineWidth = 3;
      if (z.organismType === 1) {
        c.fillRect(-7, 0, 14, 24);
        c.strokeRect(-7, 0, 14, 24);
        c.beginPath();
        c.ellipse(0, -2, 24, 13, 0, Math.PI, TAU);
        c.fill();
        c.stroke();
      } else {
        for (var i = 0; i < 6; i++) {
          c.rotate(TAU / 6);
          c.beginPath();
          c.ellipse(16, 0, 14, 6, 0, 0, TAU);
          c.fill();
          c.stroke();
        }
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(0, 0, 5 + Math.sin(t * .1 + z.age) * 2, 0, TAU);
        c.fill();
      }
      c.restore();
    });
  }
  function seedSpores(b, t, api, count, radius) {
    for (var i = 0; i < count; i++) {
      var a = i * TAU / count + (b.attackStep || 0) * .17;
      Q.shot(b, api, b.x, b.y, a, 3.2 + i % 3 * .35, 1.02, 'spore', {
        radius: 7,
        life: 360,
        ghost: true,
        curveRate: (i % 2 ? 1 : -1) * .002
      });
    }
  }
  var sporeAttacks = [{
    name: 'SPORE GERMINATION',
    begin: function (b) {
      Q.stage(b, 'germinate', 190);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'germinate') {
        if (api.interval(b, 'germinationVolley', s, 24)) seedSpores(b, t, api, 5, 0);
        if (tick(b, s)) Q.finish(b, 54);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, 190, b.color, .18, 4);
    }
  }, {
    name: 'WALKING CAPS',
    begin: function (b, t, api) {
      for (var i = 0; i < 6; i++) {
        var a = i * TAU / 6;
        b.arenaZones.push({
          x: t.x + Math.cos(a) * 360,
          y: t.y + Math.sin(a) * 300,
          kind: 'organism',
          organismType: 1,
          life: 320,
          radius: 24,
          awake: false
        });
      }
      Q.stage(b, 'capsWake', 62);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'capsWake' && tick(b, s)) {
        b.arenaZones.forEach(function (z) {
          if (z.kind === 'organism') z.awake = true;
        });
        Q.stage(b, 'capsMarch', 170);
      } else if (b.comboState === 'capsMarch') {
        if (api.interval(b, 'capSpores', s, 32)) seedSpores(b, t, api, 3, 0);
        if (tick(b, s)) Q.finish(b, 46);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, 140, b.color, .18, 4);
    }
  }, {
    name: 'HYPHAE NETWORK',
    begin: function (b, t, api) {
      b.attackZones = [];
      var organisms = (b.arenaZones || []).filter(function (z) {
        return z.kind === 'organism' && !z.dead;
      });
      if (organisms.length < 5) for (var i = 0; i < 5; i++) {
        var a = i * TAU / 5;
        organisms.push({
          x: t.x + Math.cos(a) * 360,
          y: t.y + Math.sin(a) * 300,
          kind: 'organism',
          organismType: i % 3,
          life: 330,
          radius: 23,
          awake: true
        });
        b.arenaZones.push(organisms[organisms.length - 1]);
      }
      b.attackZones = organisms.slice(0, 8);
      Q.stage(b, 'networkTell', 62);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'networkTell' && tick(b, s)) Q.stage(b, 'networkLive', 210);else if (b.comboState === 'networkLive') {
        for (var i = 0; i < b.attackZones.length; i++) {
          var a = b.attackZones[i],
            z = b.attackZones[(i + 2) % b.attackZones.length];
          Q.hitLine(b, api, a.x, a.y, z.x, z.y, 8, 1.08, 'hypha network ' + i, 32);
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      (b.attackZones || []).forEach(function (z, i, all) {
        var q = all[(i + 2) % all.length];
        if (q) line(c, z.x, z.y, q.x, q.y, b.color, b.comboState === 'networkLive' ? 7 : 2, b.comboState === 'networkLive' ? .58 : .24, [12, 9]);
      });
    }
  }, {
    name: 'FRUITING RING',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 10; i++) {
        var a = i * TAU / 10;
        b.attackZones.push({
          x: t.x + Math.cos(a) * 430,
          y: t.y + Math.sin(a) * 350,
          index: i
        });
      }
      Q.stage(b, 'fruitTell', 56);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'fruitTell' && tick(b, s)) {
        b.attackZones.forEach(function (z, i) {
          b.arenaZones.push({
            x: z.x,
            y: z.y,
            kind: 'organism',
            organismType: i % 4,
            life: 310,
            radius: 23,
            awake: false
          });
        });
        Q.stage(b, 'fruitLive', 160);
      } else if (b.comboState === 'fruitLive') {
        if (api.interval(b, 'fruitSpore', s, 28)) seedSpores(b, t, api, 4, 0);
        if (tick(b, s)) Q.finish(b, 46);
      }
    },
    draw: function (b, api) {
      (b.attackZones || []).forEach(function (z) {
        circle(api.ctx, z.x, z.y, 24, b.color, .3, 3);
      });
    }
  }, {
    name: 'ROYAL ROT',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 7; i++) {
        var a = i * 2.13,
          r = 140 + i % 3 * 170,
          p = Q.clampPoint(api, t.x + Math.cos(a) * r, t.y + Math.sin(a) * r, 90);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          index: i
        });
      }
      Q.stage(b, 'rotTell', 58);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'rotTell' && tick(b, s)) {
        b.attackZones.forEach(function (z, i) {
          b.arenaZones.push({
            x: z.x,
            y: z.y,
            kind: 'organism',
            organismType: i % 3,
            life: 330,
            radius: 25,
            awake: true
          });
          Q.hitCircle(b, api, z.x, z.y, 66, 1.1, 'royal rot', 58);
          api.ring(z.x, z.y, b.color, 76, 5);
        });
        Q.stage(b, 'rotLive', 150);
      } else if (b.comboState === 'rotLive') {
        if (api.interval(b, 'rotHypha', s, 22)) Q.fan(b, api, b.x, b.y, aim(b, t), 5, 1.1, 5.2, 1.05, 'hypha', {
          radius: 5,
          life: 240,
          ghost: true,
          sineAmp: .35,
          sineFreq: .09
        });
        if (tick(b, s)) Q.finish(b, 46);
      }
    },
    draw: function (b, api) {
      (b.attackZones || []).forEach(function (z) {
        circle(api.ctx, z.x, z.y, 66, b.color, .24, 4);
      });
    }
  }, {
    name: 'KINGDOM COME',
    begin: function (b, t, api) {
      for (var i = 0; i < 12; i++) {
        var a = i * TAU / 12,
          r = 250 + i % 3 * 170;
        b.arenaZones.push({
          x: Math.cos(a) * r,
          y: Math.sin(a) * r * .82,
          kind: 'organism',
          organismType: i % 4,
          life: 9999,
          radius: 24,
          awake: true
        });
      }
      b.attackStep = 0;
      Q.stage(b, 'kingdom', 390);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'kingdom') {
        var org = b.arenaZones.filter(function (z) {
          return z.kind === 'organism' && !z.dead;
        });
        if (api.interval(b, 'kingdomLink', s, 48) && org.length > 2) {
          b.attackStep++;
          api.ring(b.x, b.y, b.color, 230 + b.attackStep % 3 * 110, 6);
        }
        for (var i = 0; i < org.length; i++) {
          var z = org[(i + b.attackStep) % org.length],
            q = org[(i + b.attackStep + 3) % org.length];
          if (q && i % 3 === 0) Q.hitLine(b, api, z.x, z.y, q.x, q.y, 7, 1.05, 'kingdom hypha ' + i, 34);
        }
        if (api.interval(b, 'kingdomSpores', s, 19)) seedSpores(b, t, api, 5, 0);
        if (tick(b, s)) Q.finish(b, 60);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        org = (b.arenaZones || []).filter(function (z) {
          return z.kind === 'organism' && !z.dead;
        });
      for (var i = 0; i < org.length; i += 3) {
        var z = org[(i + b.attackStep) % org.length],
          q = org[(i + b.attackStep + 3) % org.length];
        if (z && q) line(c, z.x, z.y, q.x, q.y, b.color, 6, .45);
      }
    }
  }];
  Q.register('spore', {
    attacks: sporeAttacks,
    distance: 360,
    pacing: [110, 90, 72],
    arena: sporeArena,
    drawArena: drawSporeArena,
    arenaMode: 'organisms'
  }, 'world/bosses/mycelial-monarch');
})();

(function () {
  'use strict';

  var Q = window.DKBossQuality,
    TAU = Q.TAU;
  function aim(b, t) {
    return Math.atan2(t.y - b.y, t.x - b.x);
  }
  function tick(b, step) {
    b.stateTimer -= step;
    return b.stateTimer <= 0;
  }
  function line(c, x1, y1, x2, y2, color, width, alpha, dash) {
    c.save();
    c.globalAlpha = alpha === undefined ? 1 : alpha;
    c.strokeStyle = color;
    c.lineWidth = width || 3;
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
    return api.bullets().filter(function (b) {
      return !b.dead && !b.friendly && (!key || b.sourceId === 'boss_' + key);
    });
  }

  /* GLACIAL ARCHIVIST — bullets become future terrain. */
  function frostShotRow(b, api, y, dir) {
    var x = dir > 0 ? -api.ARENA + 120 : api.ARENA - 120;
    for (var j = -2; j <= 2; j++) Q.shot(b, api, x, y + j * 16, dir > 0 ? 0 : Math.PI, 8.2, 1.15, 'icicle', {
      radius: 7,
      life: 310,
      ghost: true,
      trailMax: 5
    });
  }
  var frostAttacks = [{
    name: 'FROZEN CONSTELLATION',
    begin: function (b) {
      Q.stage(b, 'telegraph', 42);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'telegraph' && tick(b, s)) {
        Q.stage(b, 'constellation', 190);
        b.attackStep = 0;
      } else if (b.comboState === 'constellation') {
        if (api.interval(b, 'constellationQuill', s, 11)) {
          var a = aim(b, t) + (b.attackStep % 2 ? -.42 : .42) + Math.sin(b.attackStep * .73) * .24;
          Q.shot(b, api, b.x, b.y, a, 2.25, 1.05, 'flake', {
            radius: 6,
            life: 470,
            freezeAge: 90,
            trailMax: 7
          });
          b.attackStep++;
        }
        if (tick(b, s)) {
          var flakes = hostile(api, 'frost').filter(function (x) {
            return x.type === 'flake';
          });
          flakes.forEach(function (x) {
            if (!x.frozen) {
              x.frozen = true;
              x.savedVx = x.vx;
              x.savedVy = x.vy;
              x.vx = 0;
              x.vy = 0;
            }
          });
          Q.stage(b, 'shatterTell', 38);
          api.float('SHATTER', b.x, b.y - 90, '#fff');
        }
      } else if (b.comboState === 'shatterTell' && tick(b, s)) {
        var frozen = hostile(api, 'frost').filter(function (x) {
          return x.type === 'flake';
        });
        frozen.forEach(function (x, n) {
          var a = Math.atan2(x.savedVy || 0, x.savedVx || 1);
          for (var k = -1; k <= 1; k++) Q.shot(b, api, x.x, x.y, a + k * .48, 7.3, 1, 'frostNeedle', {
            radius: 4,
            life: 190,
            ghost: true
          });
          x.dead = true;
        });
        api.ring(b.x, b.y, '#fff', 260, 9);
        Q.finish(b, 34);
      }
    },
    draw: function (b, api) {
      if (b.comboState === 'shatterTell') {
        var c = api.ctx,
          t = api.visualTick();
        c.save();
        c.globalAlpha = .16 + .12 * Math.sin(t * .22);
        c.fillStyle = '#e9fcff';
        c.fillRect(-api.ARENA, -api.ARENA, api.ARENA * 2, api.ARENA * 2);
        c.restore();
      }
    }
  }, {
    name: 'ICE COMB',
    begin: function (b) {
      b.attackZones = [0, 2, 4, 1, 3, 3, 1, 4, 2, 0].map(function (row, i) {
        return {
          x: 0,
          y: -560 + row * 280,
          row: row,
          order: i
        };
      });
      Q.stage(b, 'combTell', 40);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'combTell' && tick(b, s)) {
        Q.stage(b, 'comb', 1);
        b.attackStep = 0;
      } else if (b.comboState === 'comb' && tick(b, s)) {
        var z = b.attackZones[b.attackStep];
        frostShotRow(b, api, z.y, b.attackStep < 5 ? 1 : -1);
        api.beam(b.attackStep < 5 ? -api.ARENA : api.ARENA, z.y, b.attackStep < 5 ? api.ARENA : -api.ARENA, z.y, '#dffaff', 3);
        b.attackStep++;
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 38);else b.stateTimer = 17;
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        line(c, i < 5 ? -api.ARENA : api.ARENA, z.y, i < 5 ? api.ARENA : -api.ARENA, z.y, '#bdefff', 2, .12 + .08 * Math.sin(t * .15 + i), [18, 14]);
      });
    }
  }, {
    name: 'SKATING BLADES',
    begin: function (b, t, api) {
      var a = aim(b, t);
      b.attackAngle = a;
      b.attackZones = [-1, 0, 1].map(function (side) {
        return {
          x: t.x + Math.cos(a + Math.PI / 2) * side * 210,
          y: t.y + Math.sin(a + Math.PI / 2) * side * 210,
          side: side
        };
      });
      Q.stage(b, 'skateTell', 52);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'skateTell' && tick(b, s)) {
        var a = b.attackAngle;
        b.attackZones.forEach(function (z, i) {
          var start = Q.clampPoint(api, z.x - Math.cos(a) * 980, z.y - Math.sin(a) * 980, 110);
          Q.shot(b, api, start.x, start.y, a, 10.5 + i * .35, 1.55, 'iceBlade', {
            radius: 19,
            life: 330,
            bounce: 1,
            heavy: true,
            trailMax: 10
          });
        });
        Q.finish(b, 54);
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      (b.attackZones || []).forEach(function (z) {
        line(c, z.x - Math.cos(b.attackAngle) * 1000, z.y - Math.sin(b.attackAngle) * 1000, z.x + Math.cos(b.attackAngle) * 1000, z.y + Math.sin(b.attackAngle) * 1000, '#effdff', 5, .28, [22, 15]);
      });
    }
  }, {
    name: 'WHITEOUT',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 4 + (b.apex ? 2 : 0); i++) {
        var p = Q.clampPoint(api, t.x + Math.cos(i * 2.17) * 160 * (1 + i * .28), t.y + Math.sin(i * 2.17) * 145 * (1 + i * .25), 95);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          radius: 68,
          order: i
        });
      }
      b.arenaMode = 'whiteout';
      Q.stage(b, 'whiteoutTell', 52);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'whiteoutTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'whiteoutFall', 1);
      } else if (b.comboState === 'whiteoutFall' && tick(b, s)) {
        var z = b.attackZones[b.attackStep];
        Q.hitCircle(b, api, z.x, z.y, 72, 1.7, 'giant icicle', 52);
        api.ring(z.x, z.y, '#fff', 90, 8);
        api.particles(z.x, z.y, '#dffaff', 16, 6);
        b.arenaZones.push({
          x: z.x,
          y: z.y,
          radius: 48,
          kind: 'icePillar',
          life: 9999
        });
        b.attackStep++;
        if (b.attackStep >= b.attackZones.length) {
          b.arenaMode = '';
          Q.finish(b, 42);
        } else b.stateTimer = 13;
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      c.save();
      c.globalAlpha = .2;
      c.fillStyle = '#eafcff';
      c.fillRect(-api.ARENA, -api.ARENA, api.ARENA * 2, api.ARENA * 2);
      c.restore();
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        c.save();
        c.globalAlpha = .18 + .1 * Math.sin(t * .16 + i);
        c.fillStyle = '#07131b';
        c.beginPath();
        c.ellipse(z.x, z.y, 72, 36, 0, 0, TAU);
        c.fill();
        circle(c, z.x, z.y, 72, '#fff', .65, 3);
        c.restore();
      });
    }
  }, {
    name: 'CRYSTAL INDEX',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 12; i++) {
        var a = i * TAU / 12 + .21,
          r = 220 + i % 3 * 125;
        b.attackZones.push({
          x: b.x + Math.cos(a) * r,
          y: b.y + Math.sin(a) * r,
          order: i
        });
      }
      Q.stage(b, 'indexTell', 56);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'indexTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'indexFire', 1);
      } else if (b.comboState === 'indexFire' && tick(b, s)) {
        for (var n = 0; n < 2; n++) {
          var z = b.attackZones[b.attackStep + n];
          if (z) Q.shot(b, api, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), 6.6, 1.1, 'frostNeedle', {
            radius: 5,
            life: 240,
            ghost: true
          });
        }
        b.attackStep += 2;
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 34);else b.stateTimer = 12;
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        circle(c, z.x, z.y, 16, '#dffaff', .35 + .2 * Math.sin(t * .16 + i), 2);
        line(c, z.x, z.y, b.x, b.y, '#8fdcf4', 1, .12);
      });
    }
  }, {
    name: 'ABSOLUTE ZERO',
    begin: function (b, t, api) {
      hostile(api).forEach(function (x, i) {
        if (x.frozen) return;
        x.frozen = true;
        x.savedVx = x.vx;
        x.savedVy = x.vy;
        x.vx = 0;
        x.vy = 0;
        x.qualityFreezeGroup = i % 2;
      });
      b.attackMask = 0;
      Q.stage(b, 'zeroAim', 150);
      api.float('ABSOLUTE ZERO', b.x, b.y - 100, '#fff');
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'zeroAim') {
        if (api.interval(b, 'zeroAimFan', s, 24)) Q.fan(b, api, b.x, b.y, aim(b, t), 5, 1.05, 4.8, 1.15, 'icicle', {
          radius: 6,
          life: 270,
          ghost: true
        });
        b.stateTimer -= s;
        if (b.stateTimer < 58 && !b.attackMask) {
          b.attackMask = 1;
          api.float('CRACK · 50%', b.x, b.y - 84, '#dffaff');
          hostile(api).forEach(function (x) {
            if (x.frozen && x.qualityFreezeGroup === 0) {
              x.frozen = false;
              x.vx = x.savedVx * .5;
              x.vy = x.savedVy * .5;
            }
          });
        }
        if (b.stateTimer <= 0) {
          api.float('CRACK · 100%', b.x, b.y - 84, '#fff');
          hostile(api).forEach(function (x) {
            if (x.frozen) {
              x.frozen = false;
              x.vx = x.savedVx;
              x.vy = x.savedVy;
            } else if (x.qualityFreezeGroup === 0) {
              x.vx *= 2;
              x.vy *= 2;
            }
          });
          api.ring(b.x, b.y, '#fff', 420, 12);
          Q.finish(b, 48);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      c.save();
      c.globalAlpha = .1 + .08 * Math.sin(t * .12);
      c.fillStyle = '#e9fcff';
      c.fillRect(-api.ARENA, -api.ARENA, api.ARENA * 2, api.ARENA * 2);
      c.restore();
      circle(c, b.x, b.y, 170 + b.stateTimer % 30 * 2, '#fff', .42, 5);
    }
  }];
  Q.register('frost', {
    attacks: frostAttacks,
    distance: 330,
    pacing: [108, 90, 72],
    arenaMode: 'archive',
    transition: function (b) {
      b.arenaZones = (b.arenaZones || []).filter(function (z) {
        return z.kind !== 'icePillar';
      });
    },
    arena: function (b, s, t, api) {
      (b.arenaZones || []).forEach(function (z) {
        if (z.kind !== 'icePillar') return;
        Q.living(api).forEach(function (p) {
          var dx = p.x - z.x,
            dy = p.y - z.y,
            d = Math.hypot(dx, dy) || 1,
            min = z.radius + p.radius;
          if (d < min) {
            p.x += dx / d * (min - d) * .42;
            p.y += dy / d * (min - d) * .42;
            if (p.resolveObstacles) p.resolveObstacles();
          }
        });
      });
    },
    drawArena: function (b, api) {
      var c = api.ctx;
      (b.arenaZones || []).forEach(function (z) {
        if (z.kind !== 'icePillar') return;
        c.save();
        c.translate(z.x, z.y);
        c.fillStyle = 'rgba(105,190,220,.42)';
        c.strokeStyle = '#effdff';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(0, -64);
        c.lineTo(29, 34);
        c.lineTo(7, 52);
        c.lineTo(-27, 32);
        c.closePath();
        c.fill();
        c.stroke();
        c.restore();
      });
    }
  }, 'world/bosses/glacial-archivist');

  /* HOURGLASS COLOSSUS — every attack leaves a past to dodge. */
  function clockLaneEnd(b, api, a) {
    return {
      x: b.x + Math.cos(a) * api.ARENA * 2.4,
      y: b.y + Math.sin(a) * api.ARENA * 2.4
    };
  }
  var sandAttacks = [{
    name: 'REVERSE HISTORY',
    begin: function (b) {
      Q.stage(b, 'historyTell', 42);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'historyTell' && tick(b, s)) {
        Q.stage(b, 'historyFire', 138);
        b.attackStep = 0;
      } else if (b.comboState === 'historyFire') {
        if (api.interval(b, 'historyStream', s, 13)) {
          var types = ['clockHand', 'sandShard', 'numeral'],
            type = types[b.attackStep % 3],
            a = aim(b, t) + (b.attackStep % 3 - 1) * .36;
          Q.shot(b, api, b.x, b.y, a, 5.4 + b.attackStep % 3 * .65, 1.05, type, {
            radius: type === 'clockHand' ? 7 : 5,
            life: 680,
            reverseAge: 300,
            trailMax: 11,
            ghost: true
          });
          b.attackStep++;
        }
        if (tick(b, s)) {
          api.float('REWIND', b.x, b.y - 92, '#fff');
          Q.finish(b, 46);
        }
      }
    },
    draw: function (b, api) {
      if (b.comboState === 'historyFire') {
        var c = api.ctx,
          t = api.visualTick();
        c.save();
        c.globalAlpha = .12 + .06 * Math.sin(t * .1);
        c.strokeStyle = '#fff1b3';
        c.setLineDash([12, 14]);
        for (var i = -1; i <= 1; i++) {
          var a = b.attackAngle + i * .36;
          c.beginPath();
          c.moveTo(b.x, b.y);
          c.lineTo(b.x + Math.cos(a) * 980, b.y + Math.sin(a) * 980);
          c.stroke();
        }
        c.restore();
      }
    }
  }, {
    name: 'MISSING SECOND',
    begin: function (b, t, api) {
      b.attackMask = Math.floor(Q.seeded((b.id || 1) + b.comboIndex * 7) * 12);
      b.attackZones = [];
      for (var i = 0; i < 12; i++) {
        var a = -Math.PI / 2 + i * TAU / 12;
        b.attackZones.push({
          x: b.x + Math.cos(a) * 360,
          y: b.y + Math.sin(a) * 360,
          index: i,
          angle: a
        });
      }
      Q.stage(b, 'missingTell', 92);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'missingTell' && tick(b, s)) {
        Q.stage(b, 'missingStrike', 30);
        api.float('THE MISSING SECOND IS SAFE', b.x, b.y - 96, '#fff');
      } else if (b.comboState === 'missingStrike') {
        b.attackZones.forEach(function (z) {
          if (z.index === b.attackMask) return;
          var e = clockLaneEnd(b, api, z.angle);
          Q.hitLine(b, api, b.x, b.y, e.x, e.y, 14, 1.25, 'clock lane ' + z.index, 38);
        });
        if (tick(b, s)) Q.finish(b, 38);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z) {
        c.save();
        c.translate(z.x, z.y);
        c.fillStyle = z.index === b.attackMask ? 'rgba(0,0,0,0)' : '#f7e8ab';
        c.strokeStyle = z.index === b.attackMask ? 'rgba(255,255,255,.15)' : '#e4bd66';
        c.globalAlpha = z.index === b.attackMask ? .18 : .55;
        c.font = '12px \"Noto Sans Thai\", \"Ubuntu\", sans-serif';
        c.textAlign = 'center';
        c.fillText(String(z.index || 12), 0, 4);
        c.restore();
        var e = clockLaneEnd(b, api, z.angle);
        line(c, b.x, b.y, e.x, e.y, z.index === b.attackMask ? '#26303a' : '#f7e8ab', b.comboState === 'missingStrike' ? 12 : 2, b.comboState === 'missingStrike' ? .58 : .18, [18, 12]);
      });
    }
  }, {
    name: 'HOURGLASS FLIP',
    begin: function (b) {
      Q.stage(b, 'flipTell', 48);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'flipTell' && tick(b, s)) {
        hostile(api).forEach(function (x) {
          x.vx *= -1;
          x.vy *= -1;
          if (x.frozen) {
            x.savedVx *= -1;
            x.savedVy *= -1;
          }
          x.reversed = !x.reversed;
        });
        api.ring(b.x, b.y, '#fff', 360, 10);
        Q.stage(b, 'flipNormal', 88);
      } else if (b.comboState === 'flipNormal') {
        if (api.interval(b, 'flipNormalAim', s, 18)) Q.fan(b, api, b.x, b.y, aim(b, t), 3, .34, 7.3, 1.12, 'sandShard', {
          radius: 5,
          life: 220,
          ghost: true
        });
        if (tick(b, s)) Q.finish(b, 38);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      c.save();
      c.translate(b.x, b.y);
      c.rotate(Math.PI * (1 - Math.max(0, b.stateTimer) / 48));
      c.globalAlpha = .5;
      c.strokeStyle = '#fff1b3';
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(-45, -62);
      c.lineTo(45, -62);
      c.lineTo(13, 0);
      c.lineTo(45, 62);
      c.lineTo(-45, 62);
      c.lineTo(-13, 0);
      c.closePath();
      c.stroke();
      c.restore();
    }
  }, {
    name: 'CLOCK HANDS',
    begin: function (b) {
      b.arenaAngle = -Math.PI / 2;
      b.attackAngle = 0;
      Q.stage(b, 'handsTell', 54);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'handsTell' && tick(b, s)) Q.stage(b, 'handsActive', 250);else if (b.comboState === 'handsActive') {
        b.arenaAngle += .012 * s;
        b.attackAngle -= .046 * s;
        var e1 = clockLaneEnd(b, api, b.arenaAngle),
          e2 = clockLaneEnd(b, api, b.attackAngle);
        Q.hitLine(b, api, b.x, b.y, e1.x, e1.y, 18, 1.25, 'minute hand', 30);
        Q.hitLine(b, api, b.x, b.y, e2.x, e2.y, 7, 1.1, 'second hand', 24);
        if (api.interval(b, 'handSand', s, 24)) Q.fan(b, api, b.x, b.y, aim(b, t), 3, .55, 4.4, 1, 'sandShard', {
          radius: 4,
          life: 210,
          ghost: true
        });
        if (tick(b, s)) Q.finish(b, 42);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        e1 = clockLaneEnd(b, api, b.arenaAngle),
        e2 = clockLaneEnd(b, api, b.attackAngle);
      line(c, b.x, b.y, e1.x, e1.y, '#e4bd66', b.comboState === 'handsActive' ? 18 : 4, .65);
      line(c, b.x, b.y, e2.x, e2.y, '#fff', b.comboState === 'handsActive' ? 7 : 2, .72);
      circle(c, b.x, b.y, 58, '#f7e8ab', .6, 4);
    }
  }, {
    name: 'STOLEN MOMENT',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 8; i++) {
        var a = i * TAU / 8;
        b.attackZones.push({
          x: t.x + Math.cos(a) * 260,
          y: t.y + Math.sin(a) * 260,
          index: i
        });
      }
      Q.stage(b, 'momentTell', 64);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'momentTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'momentFire', 1);
      } else if (b.comboState === 'momentFire' && tick(b, s)) {
        var z = b.attackZones[b.attackStep],
          a = Math.atan2(t.y - z.y, t.x - z.x);
        Q.shot(b, api, z.x, z.y, a, 0, 1.2, 'clockHand', {
          radius: 8,
          life: 240,
          freezeAge: 1,
          resumeAge: 38 + b.attackStep * 7,
          ghost: true
        });
        b.attackStep++;
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 55);else b.stateTimer = 8;
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        circle(c, z.x, z.y, 24, '#f7e8ab', .34 + .18 * Math.sin(t * .14 + i), 3);
      });
    }
  }, {
    name: '11:59',
    begin: function (b) {
      b.attackStep = 0;
      b.attackMask = 0;
      Q.stage(b, 'midnightRun', 264);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'midnightRun') {
        if (api.interval(b, 'midnightHour', s, 20) && b.attackStep < 12) {
          var a = -Math.PI / 2 + b.attackStep * TAU / 12;
          Q.fan(b, api, b.x, b.y, a, 3, .22, 4.6 + b.attackStep * .12, 1.05, b.attackStep % 3 === 0 ? 'clockHand' : b.attackStep % 3 === 1 ? 'sandShard' : 'numeral', {
            radius: 5,
            life: 520,
            ghost: true
          });
          b.attackStep++;
        }
        if (tick(b, s)) {
          hostile(api).forEach(function (x, i) {
            x.frozen = true;
            x.savedVx = x.vx;
            x.savedVy = x.vy;
            x.vx = 0;
            x.vy = 0;
            x.qualityFreezeGroup = i % 4;
          });
          Q.stage(b, 'midnightSilence', 42);
          api.float('12', b.x, b.y - 110, '#fff');
        }
      } else if (b.comboState === 'midnightSilence' && tick(b, s)) {
        Q.stage(b, 'midnightBreak', 92);
        b.attackStep = 0;
        api.ring(b.x, b.y, '#fff', 520, 14);
      } else if (b.comboState === 'midnightBreak') {
        if (api.interval(b, 'midnightQuarter', s, 20) && b.attackStep < 4) {
          var group = b.attackStep++;
          hostile(api).forEach(function (x) {
            if (x.frozen && x.qualityFreezeGroup === group) {
              x.frozen = false;
              x.vx = x.savedVx;
              x.vy = x.savedVy;
            }
          });
          api.float(String(group * 25 + 25) + '%', b.x, b.y - 82, '#f7e8ab');
        }
        if (tick(b, s)) Q.finish(b, 52);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      circle(c, b.x, b.y, 310, '#e4bd66', .32, 7);
      for (var i = 0; i < 12; i++) {
        var a = -Math.PI / 2 + i * TAU / 12;
        line(c, b.x + Math.cos(a) * 286, b.y + Math.sin(a) * 286, b.x + Math.cos(a) * 310, b.y + Math.sin(a) * 310, '#fff1b3', 3, .45);
      }
      if (b.comboState === 'midnightSilence') {
        c.save();
        c.globalAlpha = .22 + .12 * Math.sin(t * .2);
        c.fillStyle = '#fff';
        c.fillRect(-api.ARENA, -api.ARENA, api.ARENA * 2, api.ARENA * 2);
        c.restore();
      }
    }
  }];
  Q.register('sand', {
    attacks: sandAttacks,
    distance: 360,
    pacing: [110, 90, 74],
    arenaMode: 'rewind'
  }, 'world/bosses/hourglass-colossus');

  /* COIL SOVEREIGN — the lethal geometry is between bullets. */
  function rotateNodes(zones, cx, cy, amount) {
    zones.forEach(function (z) {
      var dx = z.x - cx,
        dy = z.y - cy,
        a = Math.atan2(dy, dx) + amount,
        r = Math.hypot(dx, dy);
      z.x = cx + Math.cos(a) * r;
      z.y = cy + Math.sin(a) * r;
    });
  }
  function drawEdges(c, zones, pairs, color, active) {
    pairs.forEach(function (pair, i) {
      var a = zones[pair[0]],
        b = zones[pair[1]];
      if (a && b) line(c, a.x, a.y, b.x, b.y, active ? '#f4e8ff' : color, active ? 7 : 2, active ? .7 : .25, active ? null : [14, 10]);
    });
  }
  function damageEdges(b, api, zones, pairs, key) {
    pairs.forEach(function (pair, i) {
      var a = zones[pair[0]],
        z = zones[pair[1]];
      if (a && z) Q.hitLine(b, api, a.x, a.y, z.x, z.y, 8, 1.15, key + ' ' + i, 24);
    });
  }
  var stormAttacks = [{
    name: 'TESLA TRIANGLE',
    begin: function (b, t) {
      b.attackZones = [];
      for (var i = 0; i < 3; i++) {
        var a = i * TAU / 3;
        b.attackZones.push({
          x: t.x + Math.cos(a) * 260,
          y: t.y + Math.sin(a) * 260,
          index: i
        });
      }
      Q.stage(b, 'triangleTell', 58);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'triangleTell' && tick(b, s)) Q.stage(b, 'triangleLive', 220);else if (b.comboState === 'triangleLive') {
        rotateNodes(b.attackZones, t.x, t.y, .006 * s);
        damageEdges(b, api, b.attackZones, [[0, 1], [1, 2], [2, 0]], 'tesla triangle');
        b.stateTimer -= s;
        if (b.stateTimer < 105 && !b.attackMask) {
          b.attackMask = 1;
          var z = b.attackZones[0];
          z.x = api.clamp(t.x + 380, -api.ARENA + 90, api.ARENA - 90);
          z.y = api.clamp(t.y - 260, -api.ARENA + 90, api.ARENA - 90);
          api.ring(z.x, z.y, '#fff', 70, 7);
        }
        if (b.stateTimer <= 0) Q.finish(b, 38);
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      drawEdges(c, b.attackZones || [], [[0, 1], [1, 2], [2, 0]], b.color, b.comboState === 'triangleLive');
      (b.attackZones || []).forEach(function (z) {
        circle(c, z.x, z.y, 15, '#fff', .8, 4);
      });
    }
  }, {
    name: 'HUMAN CIRCUIT',
    begin: function (b, t, api) {
      b.attackZones = [{
        x: -api.ARENA + 120,
        y: -380
      }, {
        x: api.ARENA - 120,
        y: 380
      }, {
        x: t.x,
        y: t.y,
        index: 2
      }];
      Q.stage(b, 'humanTell', 58);
    },
    update: function (b, s, t, api) {
      var follower = b.attackZones[2];
      follower.x += (t.x - follower.x) * .035 * s;
      follower.y += (t.y - follower.y) * .035 * s;
      if (b.comboState === 'humanTell' && tick(b, s)) Q.stage(b, 'humanLive', 210);else if (b.comboState === 'humanLive') {
        damageEdges(b, api, b.attackZones, [[0, 2], [2, 1]], 'human circuit');
        if (tick(b, s)) Q.finish(b, 42);
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      drawEdges(c, b.attackZones || [], [[0, 2], [2, 1]], b.color, b.comboState === 'humanLive');
      (b.attackZones || []).forEach(function (z, i) {
        circle(c, z.x, z.y, i === 2 ? 18 : 14, i === 2 ? '#fff' : b.color, .75, 4);
      });
    }
  }, {
    name: 'BROKEN CIRCUIT',
    begin: function (b) {
      b.attackZones = [];
      for (var i = 0; i < 8; i++) {
        var a = i * TAU / 8;
        b.attackZones.push({
          x: b.x + Math.cos(a) * 390,
          y: b.y + Math.sin(a) * 390,
          index: i
        });
      }
      b.attackMask = 0x55;
      Q.stage(b, 'networkTell', 52);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'networkTell' && tick(b, s)) Q.stage(b, 'networkLive', 260);else if (b.comboState === 'networkLive') {
        if (api.interval(b, 'networkSwap', s, 48)) {
          b.attackMask = b.attackMask === 0x55 ? 0xaa : b.attackMask === 0xaa ? 0x99 : 0x55;
          api.ring(b.x, b.y, b.color, 180, 5);
        }
        var pairs = [];
        for (var i = 0; i < 8; i++) if (b.attackMask & 1 << i) pairs.push([i, (i + 3) % 8]);
        damageEdges(b, api, b.attackZones, pairs, 'broken circuit');
        if (tick(b, s)) Q.finish(b, 40);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        pairs = [];
      for (var i = 0; i < 8; i++) if (b.attackMask & 1 << i) pairs.push([i, (i + 3) % 8]);
      drawEdges(c, b.attackZones || [], pairs, b.color, b.comboState === 'networkLive');
      (b.attackZones || []).forEach(function (z) {
        circle(c, z.x, z.y, 12, '#eadbff', .65, 3);
      });
    }
  }, {
    name: 'CHAIN REACTION',
    begin: function (b, t, api) {
      Q.stage(b, 'chainTell', 46);
      b.attackAngle = aim(b, t) + Math.PI * .5;
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'chainTell' && tick(b, s)) {
        Q.shot(b, api, b.x, b.y, b.attackAngle, 4.2, 1.25, 'plasma', {
          radius: 15,
          life: 440,
          ghost: true,
          generation: 0,
          heavy: true
        });
        Q.stage(b, 'chainLive', 270);
      } else if (b.comboState === 'chainLive') {
        var list = hostile(api, 'storm').filter(function (x) {
          return x.type === 'plasma';
        });
        list.forEach(function (x) {
          if (Math.abs(x.x) > api.ARENA - 125 || Math.abs(x.y) > api.ARENA - 125) {
            if (x.generation < 3) {
              var base = Math.atan2(x.vy, x.vx) + Math.PI;
              for (var side = -1; side <= 1; side += 2) Q.shot(b, api, api.clamp(x.x, -api.ARENA + 135, api.ARENA - 135), api.clamp(x.y, -api.ARENA + 135, api.ARENA - 135), base + side * (.38 + x.generation * .08), x.speed * 1.08, 1.05, 'plasma', {
                radius: Math.max(6, x.radius - 3),
                life: 190 - x.generation * 36,
                ghost: true,
                generation: x.generation + 1
              });
            }
            api.ring(x.x, x.y, '#fff', 50, 5);
            x.dead = true;
          }
        });
        if (tick(b, s)) Q.finish(b, 42);
      }
    },
    draw: function (b, api) {
      if (b.comboState === 'chainTell') {
        var c = api.ctx,
          e = {
            x: b.x + Math.cos(b.attackAngle) * 1000,
            y: b.y + Math.sin(b.attackAngle) * 1000
          };
        line(c, b.x, b.y, e.x, e.y, '#eadbff', 3, .38, [16, 12]);
      }
    }
  }, {
    name: 'ARC LOOM',
    begin: function (b, t) {
      b.attackZones = [{
        x: t.x - 320,
        y: t.y - 250
      }, {
        x: t.x + 320,
        y: t.y - 250
      }, {
        x: t.x + 320,
        y: t.y + 250
      }, {
        x: t.x - 320,
        y: t.y + 250
      }];
      Q.stage(b, 'loomTell', 58);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'loomTell' && tick(b, s)) Q.stage(b, 'loomLive', 230);else if (b.comboState === 'loomLive') {
        var p = 1 - b.stateTimer / 230,
          shift = Math.sin(p * TAU * 2) * 150;
        b.attackZones[0].x = t.x - 320 + shift;
        b.attackZones[1].x = t.x + 320 - shift;
        b.attackZones[2].y = t.y + 250 - shift;
        b.attackZones[3].y = t.y - 250 + shift;
        damageEdges(b, api, b.attackZones, [[0, 2], [1, 3]], 'arc loom');
        if (api.interval(b, 'loomBolt', s, 32)) Q.shot(b, api, b.x, b.y, aim(b, t), 8.6, 1.1, 'lightning', {
          radius: 6,
          life: 170,
          ghost: true
        });
        if (tick(b, s)) Q.finish(b, 40);
      }
    },
    draw: function (b, api) {
      drawEdges(api.ctx, b.attackZones || [], [[0, 2], [1, 3]], b.color, b.comboState === 'loomLive');
    }
  }, {
    name: 'OVERLOAD',
    begin: function (b, t) {
      b.attackStep = 0;
      b.attackZones = [];
      Q.stage(b, 'overloadTell', 64);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'overloadTell' && tick(b, s)) {
        Q.stage(b, 'overloadLive', 1);
      } else if (b.comboState === 'overloadLive' && tick(b, s)) {
        if (b.attackStep >= 5) {
          Q.finish(b, 52);
          return;
        }
        var shapes = [4, 3, 4, 4, 2],
          count = shapes[b.attackStep],
          r = 420 - b.attackStep * 54;
        b.attackZones = [];
        if (b.attackStep === 4) {
          b.attackZones = [{
            x: t.x - 90,
            y: -api.ARENA + 100
          }, {
            x: t.x - 90,
            y: api.ARENA - 100
          }, {
            x: t.x + 90,
            y: api.ARENA - 100
          }, {
            x: t.x + 90,
            y: -api.ARENA + 100
          }];
        } else for (var i = 0; i < count; i++) {
          var a = -Math.PI / 2 + i * TAU / count + (b.attackStep === 2 ? Math.PI / 4 : 0);
          b.attackZones.push({
            x: t.x + Math.cos(a) * r,
            y: t.y + Math.sin(a) * r
          });
        }
        b.attackMask = 1;
        b.stateTimer = 48;
        b.attackAux = b.attackStep;
        b.attackStep++;
      } else if (b.comboState === 'overloadLive') {
        var pairs = [];
        for (var j = 0; j < b.attackZones.length; j++) pairs.push([j, (j + 1) % b.attackZones.length]);
        damageEdges(b, api, b.attackZones, pairs, 'overload ' + b.attackAux);
        if (api.interval(b, 'overloadStrike', s, 28)) {
          var p = Q.clampPoint(api, t.x, t.y, 90);
          Q.shot(b, api, p.x, p.y - 650, Math.PI / 2, 11.5, 1.2, 'lightning', {
            radius: 7,
            life: 150,
            ghost: true
          });
        }
        b.stateTimer -= s;
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        pairs = [];
      for (var i = 0; i < (b.attackZones || []).length; i++) pairs.push([i, (i + 1) % b.attackZones.length]);
      drawEdges(c, b.attackZones || [], pairs, b.color, b.comboState === 'overloadLive');
      (b.attackZones || []).forEach(function (z) {
        circle(c, z.x, z.y, 13, '#fff', .8, 3);
      });
    }
  }];
  Q.register('storm', {
    attacks: stormAttacks,
    distance: 320,
    pacing: [106, 88, 70],
    arenaMode: 'circuit'
  }, 'world/bosses/coil-sovereign');
})();

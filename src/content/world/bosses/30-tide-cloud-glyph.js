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

  /* DROWNED BELLKEEPER — attacks are rewritten by the current and by bell waves. */
  function tideCurrent(b, s, t, api) {
    var force = b.arenaPower || 0;
    if (!force) return;
    hostile(api, 'tide').forEach(function (x) {
      if (x.heavy || x.type === 'anchor') return;
      var targetVx = Math.cos(b.arenaAngle) * force,
        targetVy = Math.sin(b.arenaAngle) * force;
      x.vx += targetVx * .025 * s;
      x.vy += targetVy * .025 * s;
      var max = Math.max(x.speed * 1.65, 6),
        d = Math.hypot(x.vx, x.vy) || 1;
      if (d > max) {
        x.vx = x.vx / d * max;
        x.vy = x.vy / d * max;
      }
    });
  }
  function burstBubbles(b, api) {
    hostile(api, 'tide').filter(function (x) {
      return x.type === 'bubble';
    }).forEach(function (x) {
      for (var i = 0; i < 4; i++) Q.shot(b, api, x.x, x.y, i * TAU / 4 + b.arenaAngle, 6.8, 1.08, 'waterBlade', {
        radius: 6,
        life: 230,
        ghost: true
      });
      api.ring(x.x, x.y, '#dffcff', 70, 6);
      x.dead = true;
    });
  }
  function breakBubbles(api) {
    var list = api.bullets();
    for (var i = 0; i < list.length; i++) {
      var bubble = list[i];
      if (bubble.dead || bubble.type !== 'bubble' || bubble.friendly) continue;
      for (var j = 0; j < list.length; j++) {
        var friendly = list[j];
        if (friendly.dead || !friendly.friendly) continue;
        if (Math.hypot(bubble.x - friendly.x, bubble.y - friendly.y) < bubble.radius + friendly.radius) {
          bubble.dead = true;
          friendly.dead = true;
          api.ring(bubble.x, bubble.y, '#fff', 58, 4);
          break;
        }
      }
    }
  }
  var tideAttacks = [{
    name: 'TIDAL CURTAIN',
    begin: function (b) {
      b.arenaAngle = 0;
      b.arenaPower = 6;
      Q.stage(b, 'curtainTell', 50);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'curtainTell' && tick(b, s)) {
        Q.stage(b, 'curtainLive', 210);
        b.attackStep = 0;
      } else if (b.comboState === 'curtainLive') {
        if (api.interval(b, 'tidalBlade', s, 9)) {
          var x = -760 + b.attackStep++ % 10 * 170;
          Q.shot(b, api, x, -api.ARENA + 120, Math.PI / 2, 5.8, 1.08, 'waterBlade', {
            radius: 6,
            life: 390,
            ghost: true,
            trailMax: 7
          });
        }
        b.stateTimer -= s;
        if (b.stateTimer < 92 && !b.attackMask) {
          b.attackMask = 1;
          b.arenaAngle = Math.PI;
          b.arenaPower = 8;
          api.float('CURRENT REVERSED', b.x, b.y - 92, '#fff');
          api.ring(b.x, b.y, b.color, 580, 10);
        }
        if (b.stateTimer <= 0) {
          b.arenaPower = 0;
          Q.finish(b, 44);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      for (var i = -4; i <= 4; i++) line(c, -api.ARENA, i * 190 + Math.sin(t * .03 + i) * 26, api.ARENA, i * 190 - Math.sin(t * .03 + i) * 26, b.color, 2, .12);
    }
  }, {
    name: 'BUBBLE PRISON',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 7; i++) {
        var a = i * TAU / 7,
          p = Q.clampPoint(api, t.x + Math.cos(a) * 720, t.y + Math.sin(a) * 620, 110);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          index: i
        });
      }
      Q.stage(b, 'bubbleTell', 48);
    },
    update: function (b, s, t, api) {
      breakBubbles(api);
      if (b.comboState === 'bubbleTell' && tick(b, s)) {
        b.attackZones.forEach(function (z) {
          Q.shot(b, api, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), 1.9, 1.15, 'bubble', {
            radius: 24,
            life: 430,
            ghost: true,
            freezeAge: 100,
            resumeAge: 0,
            heavy: true
          });
        });
        Q.stage(b, 'bubbleWait', 150);
      } else if (b.comboState === 'bubbleWait' && tick(b, s)) {
        api.float('BELL TOLL', b.x, b.y - 88, '#fff');
        burstBubbles(b, api);
        Q.finish(b, 48);
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      (b.attackZones || []).forEach(function (z) {
        circle(c, z.x, z.y, 28, '#dffcff', .34, 3);
      });
    }
  }, {
    name: 'BELL TOLL',
    begin: function (b) {
      b.attackAux = 0;
      b.attackMask = 0;
      Q.stage(b, 'tollTell', 54);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'tollTell' && tick(b, s)) {
        Q.stage(b, 'tollWave', 82);
        b.attackAux = 10;
        api.float('THE TOLL CHANGES TRAJECTORY', b.x, b.y - 100, '#fff');
      } else if (b.comboState === 'tollWave') {
        b.attackAux += 12 * s;
        hostile(api).forEach(function (x) {
          var d = Math.hypot(x.x - b.x, x.y - b.y);
          if (!x.tollTouched && Math.abs(d - b.attackAux) < 22) {
            x.tollTouched = true;
            var a = Math.atan2(x.vy, x.vx) + (x.netId % 2 ? 1 : -1) * Math.PI * .55,
              v = Math.hypot(x.vx, x.vy) || x.speed;
            x.vx = Math.cos(a) * v;
            x.vy = Math.sin(a) * v;
            api.ring(x.x, x.y, '#fff', 24, 2);
          }
        });
        if (tick(b, s)) Q.finish(b, 38);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, b.attackAux, '#dffcff', .48, 8);
    }
  }, {
    name: 'CROSSCURRENT',
    begin: function (b) {
      b.arenaAngle = Math.PI / 4;
      b.arenaPower = 7;
      Q.stage(b, 'crossTell', 46);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'crossTell' && tick(b, s)) Q.stage(b, 'crossLive', 200);else if (b.comboState === 'crossLive') {
        if (api.interval(b, 'crossBlade', s, 12)) {
          var edge = b.attackStep++ % 2,
            x = edge ? -api.ARENA + 130 : api.ARENA - 130,
            a = edge ? 0 : Math.PI;
          Q.shot(b, api, x, -650 + b.attackStep % 8 * 185, a, 6.3, 1.08, 'waterBlade', {
            radius: 6,
            life: 350,
            ghost: true
          });
        }
        if (api.interval(b, 'crossAnchor', s, 38)) Q.shot(b, api, b.x, b.y, aim(b, t), 7.7, 1.3, 'anchor', {
          radius: 11,
          life: 260,
          ghost: true,
          heavy: true
        });
        b.stateTimer -= s;
        if (b.stateTimer < 92 && !b.attackMask) {
          b.attackMask = 1;
          b.arenaAngle += Math.PI / 2;
          api.float('CROSSCURRENT', b.x, b.y - 90, b.color);
        }
        if (b.stateTimer <= 0) {
          b.arenaPower = 0;
          Q.finish(b, 42);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        a = b.arenaAngle;
      for (var i = -3; i <= 3; i++) {
        var n = a + Math.PI / 2,
          ox = Math.cos(n) * i * 210,
          oy = Math.sin(n) * i * 210;
        line(c, ox - Math.cos(a) * 1000, oy - Math.sin(a) * 1000, ox + Math.cos(a) * 1000, oy + Math.sin(a) * 1000, b.color, 3, .14, [20, 15]);
      }
    }
  }, {
    name: 'DROWNED CHIME',
    begin: function (b) {
      b.attackStep = 0;
      b.attackAux = 0;
      Q.stage(b, 'chimeLive', 250);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'chimeLive') {
        if (api.interval(b, 'chimeBlade', s, 16)) {
          var a = aim(b, t) + (b.attackStep % 5 - 2) * .24;
          Q.shot(b, api, b.x, b.y, a, 5.2, 1.08, 'waterBlade', {
            radius: 6,
            life: 310,
            ghost: true,
            curveRate: (b.attackStep % 2 ? 1 : -1) * .003
          });
          b.attackStep++;
        }
        if (api.interval(b, 'chimePulse', s, 64)) {
          var radius = 120 + b.attackStep % 3 * 90;
          hostile(api, 'tide').forEach(function (x) {
            var d = Math.hypot(x.x - b.x, x.y - b.y);
            if (d < radius + 35 && d > radius - 35) {
              var a = Math.atan2(x.vy, x.vx) + Math.PI * .7,
                v = Math.hypot(x.vx, x.vy) || x.speed;
              x.vx = Math.cos(a) * v;
              x.vy = Math.sin(a) * v;
            }
          });
          api.ring(b.x, b.y, '#fff', radius, 8);
        }
        if (tick(b, s)) Q.finish(b, 42);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, 170, b.color, .18, 5);
    }
  }, {
    name: 'MAELSTROM',
    begin: function (b) {
      b.arenaAngle = 0;
      b.arenaPower = 11;
      b.attackStep = 0;
      Q.stage(b, 'maelstrom', 340);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'maelstrom') {
        b.arenaAngle += .018 * s;
        if (api.interval(b, 'maelstromBlade', s, 9)) {
          var a = b.attackStep++ * 1.37,
            r = 800,
            x = Math.cos(a) * r,
            y = Math.sin(a) * r;
          Q.shot(b, api, x, y, a + Math.PI, 4.8, 1.08, 'waterBlade', {
            radius: 6,
            life: 430,
            ghost: true,
            trailMax: 9
          });
        }
        if (api.interval(b, 'maelstromAnchor', s, 48)) Q.shot(b, api, b.x, b.y, aim(b, t), 8.5, 1.3, 'anchor', {
          radius: 12,
          life: 260,
          ghost: true,
          heavy: true
        });
        b.stateTimer -= s;
        if (b.stateTimer < 230 && b.attackMask === 0) {
          b.attackMask = 1;
          b.arenaPower = 0;
          api.float('CURRENT STOPS', b.x, b.y - 92, '#fff');
        }
        if (b.stateTimer < 165 && b.attackMask === 1) {
          b.attackMask = 2;
          b.arenaPower = -12;
          api.float('COUNTERCURRENT', b.x, b.y - 92, '#fff');
        }
        if (b.stateTimer <= 0) {
          b.arenaPower = 0;
          Q.finish(b, 56);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      c.save();
      c.translate(0, 0);
      c.rotate(t * .006 * (b.arenaPower < 0 ? -1 : 1));
      c.strokeStyle = b.color;
      c.globalAlpha = .18;
      c.lineWidth = 8;
      for (var i = 0; i < 5; i++) {
        c.beginPath();
        c.arc(0, 0, 180 + i * 135, i * .5, i * .5 + 4.7);
        c.stroke();
      }
      c.restore();
    }
  }];
  Q.register('tide', {
    attacks: tideAttacks,
    distance: 350,
    pacing: [108, 90, 72],
    arena: tideCurrent,
    arenaMode: 'current',
    drawArena: function (b, api) {
      if (!b.arenaPower) return;
      var c = api.ctx,
        a = b.arenaAngle,
        t = api.visualTick();
      c.save();
      c.strokeStyle = b.color;
      c.globalAlpha = .08 + .03 * Math.sin(t * .05);
      c.lineWidth = 3;
      for (var i = -5; i <= 5; i++) {
        var n = a + Math.PI / 2,
          ox = Math.cos(n) * i * 180,
          oy = Math.sin(n) * i * 180;
        c.beginPath();
        c.moveTo(ox - Math.cos(a) * 1000, oy - Math.sin(a) * 1000);
        c.bezierCurveTo(ox - Math.cos(a) * 260 - Math.sin(a) * 50, oy - Math.sin(a) * 260 + Math.cos(a) * 50, ox + Math.cos(a) * 260 + Math.sin(a) * 50, oy + Math.sin(a) * 260 - Math.cos(a) * 50, ox + Math.cos(a) * 1000, oy + Math.sin(a) * 1000);
        c.stroke();
      }
      c.restore();
    }
  }, 'world/bosses/drowned-bellkeeper');

  /* TEMPEST ROC — the boss leaves; weather remains. */
  function cloudWind(b, s, t, api) {
    if (!b.arenaPower) return;
    hostile(api, 'cloud').forEach(function (x) {
      if (x.heavy || x.type === 'lightning') return;
      x.vx += Math.cos(b.arenaAngle) * b.arenaPower * .028 * s;
      x.vy += Math.sin(b.arenaAngle) * b.arenaPower * .028 * s;
      var speed = Math.hypot(x.vx, x.vy) || 1,
        max = Math.max(9, (x.speed || 5) * 1.75);
      if (speed > max) {
        x.vx = x.vx / speed * max;
        x.vy = x.vy / speed * max;
      }
    });
  }
  function featherEdges(b, api, pairs, key) {
    pairs.forEach(function (pair, i) {
      var a = b.attackZones[pair[0]],
        z = b.attackZones[pair[1]];
      if (a && z) Q.hitLine(b, api, a.x, a.y, z.x, z.y, 7, 1.12, key + ' ' + i, 26);
    });
  }
  var cloudAttacks = [{
    name: 'FEATHER MINEFIELD',
    begin: function (b, t) {
      b.attackZones = [];
      for (var i = 0; i < 8; i++) {
        var a = i * TAU / 8,
          r = 260 + i % 2 * 170;
        b.attackZones.push({
          x: t.x + Math.cos(a) * r,
          y: t.y + Math.sin(a) * r,
          index: i
        });
      }
      b.attackMask = 0;
      Q.stage(b, 'mineTell', 62);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'mineTell' && tick(b, s)) Q.stage(b, 'mineLive', 240);else if (b.comboState === 'mineLive') {
        var pairs = b.attackMask % 2 ? [[0, 3], [2, 5], [4, 7]] : [[1, 4], [3, 6], [5, 0]];
        featherEdges(b, api, pairs, 'feather lightning');
        b.attackZones.forEach(function (z, i) {
          z.x += Math.cos(b.arenaAngle || 0) * .35 * s;
          z.y += Math.sin(b.arenaAngle || 0) * .35 * s;
        });
        if (api.interval(b, 'featherPairSwap', s, 58)) {
          b.attackMask++;
          api.float('LIGHTNING PAIRS SHIFT', b.x, b.y - 90, '#fff');
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        pairs = b.attackMask % 2 ? [[0, 3], [2, 5], [4, 7]] : [[1, 4], [3, 6], [5, 0]];
      pairs.forEach(function (pair) {
        var a = b.attackZones[pair[0]],
          z = b.attackZones[pair[1]];
        line(c, a.x, a.y, z.x, z.y, '#fff', 7, b.comboState === 'mineLive' ? .62 : .25);
      });
      (b.attackZones || []).forEach(function (z) {
        c.save();
        c.translate(z.x, z.y);
        c.rotate(.4);
        c.fillStyle = '#dff5ff';
        c.beginPath();
        c.moveTo(16, 0);
        c.quadraticCurveTo(-2, -10, -15, -2);
        c.quadraticCurveTo(-2, 7, 16, 0);
        c.fill();
        c.restore();
      });
    }
  }, {
    name: 'SHADOW DIVE',
    begin: function (b, t, api) {
      var start = Q.clampPoint(api, t.x - 900, t.y - 520, 100),
        end = Q.clampPoint(api, t.x + 900, t.y + 520, 100);
      b.attackZones = [{
        x: start.x,
        y: start.y,
        x2: end.x,
        y2: end.y,
        kind: 'dive'
      }];
      b.arenaMode = 'hidden';
      Q.stage(b, 'diveTell', 54);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'diveTell' && tick(b, s)) {
        b.arenaMode = 'dive';
        b.x = b.attackZones[0].x;
        b.y = b.attackZones[0].y;
        b.attackAngle = Math.atan2(b.attackZones[0].y2 - b.y, b.attackZones[0].x2 - b.x);
        Q.stage(b, 'diveLive', 64);
      } else if (b.comboState === 'diveLive') {
        var z = b.attackZones[0];
        b.x += (z.x2 - b.x) * .095 * s;
        b.y += (z.y2 - b.y) * .095 * s;
        Q.hitCircle(b, api, b.x, b.y, b.radius + 28, 1.8, 'roc dive', 120);
        if (api.interval(b, 'diveFeathers', s, 5)) {
          var n = b.attackAngle + Math.PI / 2;
          for (var side = -1; side <= 1; side += 2) Q.shot(b, api, b.x, b.y, n + (side < 0 ? Math.PI : 0), 4.6, 1.02, 'feather', {
            radius: 7,
            life: 230,
            ghost: true
          });
        }
        if (tick(b, s)) {
          b.arenaMode = '';
          api.resolve(b);
          Q.finish(b, 46);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        z = b.attackZones[0],
        t = api.visualTick();
      if (!z) return;
      line(c, z.x, z.y, z.x2, z.y2, '#101722', 52, .26);
      line(c, z.x, z.y, z.x2, z.y2, '#dff5ff', 4, .4, [24, 17]);
      c.save();
      var p = b.comboState === 'diveTell' ? 1 - Math.max(0, b.stateTimer) / 54 : .5,
        x = z.x + (z.x2 - z.x) * p,
        y = z.y + (z.y2 - z.y) * p;
      c.translate(x, y);
      c.rotate(Math.atan2(z.y2 - z.y, z.x2 - z.x));
      c.fillStyle = 'rgba(4,8,14,.55)';
      c.beginPath();
      c.moveTo(-72, 0);
      c.lineTo(-18, -42);
      c.lineTo(22, -8);
      c.lineTo(76, 0);
      c.lineTo(20, 10);
      c.lineTo(-18, 43);
      c.closePath();
      c.fill();
      c.restore();
    }
  }, {
    name: 'CROSSWIND',
    begin: function (b) {
      b.arenaAngle = 0;
      b.arenaPower = 9;
      Q.stage(b, 'crosswindTell', 48);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'crosswindTell' && tick(b, s)) Q.stage(b, 'crosswindLive', 225);else if (b.comboState === 'crosswindLive') {
        if (api.interval(b, 'windFeather', s, 8)) {
          var y = -720 + b.attackStep++ % 9 * 180;
          Q.shot(b, api, -api.ARENA + 120, y, 0, 5.2, 1.02, 'feather', {
            radius: 7,
            life: 380,
            ghost: true
          });
        }
        if (api.interval(b, 'heavyLightning', s, 42)) Q.shot(b, api, b.x, b.y, aim(b, t), 9.8, 1.3, 'lightning', {
          radius: 8,
          life: 220,
          ghost: true,
          heavy: true
        });
        b.stateTimer -= s;
        if (b.stateTimer < 112 && !b.attackMask) {
          b.attackMask = 1;
          b.arenaAngle = Math.PI;
          api.float('WIND SHIFTS', b.x, b.y - 90, '#fff');
        }
        if (b.stateTimer <= 0) {
          b.arenaPower = 0;
          Q.finish(b, 42);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        a = b.arenaAngle;
      for (var i = -4; i <= 4; i++) line(c, -api.ARENA, i * 200, api.ARENA, i * 200 + Math.sin(i) * 70, b.color, 2, .1, [20, 16]);
    }
  }, {
    name: 'THUNDERHEAD',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 6; i++) {
        var p = Q.clampPoint(api, t.x + Math.cos(i * 2.1) * 180 * (1 + i * .15), t.y + Math.sin(i * 2.1) * 160 * (1 + i * .12), 90);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          index: i
        });
      }
      Q.stage(b, 'thunderTell', 58);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'thunderTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'thunderStrike', 1);
      } else if (b.comboState === 'thunderStrike' && tick(b, s)) {
        var z = b.attackZones[b.attackStep++];
        Q.hitCircle(b, api, z.x, z.y, 78, 1.55, 'thunderhead', 75);
        api.beam(z.x, z.y - 650, z.x, z.y, '#fff', 12);
        Q.nova(b, api, z.x, z.y, 6, 4.6, 1, 'feather', {
          radius: 6,
          life: 190,
          ghost: true
        });
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 42);else b.stateTimer = 12;
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        c.save();
        c.globalAlpha = .2 + .12 * Math.sin(t * .2 + i);
        c.fillStyle = '#0d1620';
        c.beginPath();
        c.ellipse(z.x, z.y, 82, 42, 0, 0, TAU);
        c.fill();
        circle(c, z.x, z.y, 76, '#fff', .55, 3);
        c.restore();
      });
    }
  }, {
    name: 'SKYBREAK',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 5; i++) {
        var side = i % 2 ? 1 : -1,
          y = -620 + i * 310;
        b.attackZones.push({
          x: side * api.ARENA,
          y: y,
          x2: -side * api.ARENA,
          y2: y + (i - 2) * 110,
          index: i
        });
      }
      Q.stage(b, 'skybreakTell', 70);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'skybreakTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'skybreakLive', 1);
      } else if (b.comboState === 'skybreakLive' && tick(b, s)) {
        var z = b.attackZones[b.attackStep++],
          a = Math.atan2(z.y2 - z.y, z.x2 - z.x);
        for (var j = -1; j <= 1; j++) Q.shot(b, api, z.x, z.y + j * 32, a, 12, 1.35, 'feather', {
          radius: 9,
          life: 260,
          ghost: true,
          heavy: true,
          trailMax: 9
        });
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 48);else b.stateTimer = 16;
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        line(c, z.x, z.y, z.x2, z.y2, '#fff', 5, .42, [18, 12]);
      });
    }
  }, {
    name: 'EYE OF THE STORM',
    begin: function (b, t) {
      b.attackZones = [{
        x: t.x,
        y: t.y,
        radius: 185,
        kind: 'eye'
      }];
      b.arenaPower = 14;
      b.arenaAngle = 0;
      Q.stage(b, 'eyeLive', 360);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'eyeLive') {
        var eye = b.attackZones[0],
          p = 1 - b.stateTimer / 360;
        eye.x = Math.cos(p * TAU * 1.5) * 520;
        eye.y = Math.sin(p * TAU * 2) * 420;
        b.arenaAngle += .012 * s;
        if (api.interval(b, 'eyeFeather', s, 7)) {
          var a = b.attackStep++ * 1.31,
            x = Math.cos(a) * 820,
            y = Math.sin(a) * 820;
          if (Math.hypot(x - eye.x, y - eye.y) > eye.radius + 70) Q.shot(b, api, x, y, a + Math.PI, 5.6, 1.05, 'feather', {
            radius: 7,
            life: 390,
            ghost: true
          });
        }
        if (api.interval(b, 'eyeDiveTell', s, 70)) {
          b.attackX = eye.x;
          b.attackY = eye.y;
          b.attackAngle = aim(b, t);
          b.attackMask = 20;
        }
        if (b.attackMask > 0) {
          b.attackMask -= s;
          if (b.attackMask <= 0) {
            Q.hitLine(b, api, b.attackX - Math.cos(b.attackAngle) * 260, b.attackY - Math.sin(b.attackAngle) * 260, b.attackX + Math.cos(b.attackAngle) * 260, b.attackY + Math.sin(b.attackAngle) * 260, 30, 1.6, 'eye dive', 70);
            api.beam(b.attackX - Math.cos(b.attackAngle) * 260, b.attackY - Math.sin(b.attackAngle) * 260, b.attackX + Math.cos(b.attackAngle) * 260, b.attackY + Math.sin(b.attackAngle) * 260, '#fff', 16);
          }
        }
        if (tick(b, s)) {
          b.arenaPower = 0;
          Q.finish(b, 58);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        eye = b.attackZones[0];
      if (!eye) return;
      c.save();
      c.globalAlpha = .11;
      c.fillStyle = '#dff5ff';
      c.beginPath();
      c.arc(eye.x, eye.y, eye.radius, 0, TAU);
      c.fill();
      c.restore();
      circle(c, eye.x, eye.y, eye.radius, '#fff', .55, 5);
      if (b.attackMask > 0) line(c, b.attackX - Math.cos(b.attackAngle) * 300, b.attackY - Math.sin(b.attackAngle) * 300, b.attackX + Math.cos(b.attackAngle) * 300, b.attackY + Math.sin(b.attackAngle) * 300, '#fff', 4, .45, [16, 11]);
    }
  }];
  Q.register('cloud', {
    attacks: cloudAttacks,
    distance: 330,
    pacing: [104, 86, 68],
    arena: cloudWind,
    arenaMode: 'wind'
  }, 'world/bosses/tempest-roc');

  /* GRAND INDEX — every glyph has one stable meaning. */
  var GLYPH_COLOR = {
    '!': '#ff6a6a',
    '?': '#c8a8ff',
    'X': '#ffb37a',
    '|': '#e8f3ff',
    '—': '#74c9ff',
    'O': '#ffe47a',
    '>': '#fff'
  };
  function glyphSentence(b, glyphs, x, y, vertical) {
    b.attackZones = glyphs.map(function (g, i) {
      return {
        x: x + (vertical ? 0 : i * 92),
        y: y + (vertical ? i * 82 : 0),
        glyph: g,
        index: i,
        glitch: false
      };
    });
  }
  function executeGlyph(b, z, t, api, glitch) {
    var g = z.glyph,
      a = Math.atan2(t.y - z.y, t.x - z.x);
    if (glitch && g === 'O') {
      for (var i = 0; i < 12; i++) {
        var q = i * TAU / 12,
          x = z.x + Math.cos(q) * 260,
          y = z.y + Math.sin(q) * 260;
        Q.shot(b, api, x, y, q + Math.PI, 5.4, 1.12, 'glyph_O', {
          radius: 6,
          life: 220,
          ghost: true,
          color: GLYPH_COLOR.O
        });
      }
      return;
    }
    if (g === '!') {
      Q.hitCircle(b, api, z.x, z.y, 105, 1.45, 'glyph explosion', 70);
      api.ring(z.x, z.y, GLYPH_COLOR[g], 120, 9);
    } else if (g === '?') Q.shot(b, api, z.x, z.y, a, 4.4, 1.08, 'glyph_?', {
      radius: 7,
      life: 300,
      ghost: true,
      homing: .028,
      color: GLYPH_COLOR[g]
    });else if (g === 'X') {
      Q.hitLine(b, api, z.x - 260, z.y - 260, z.x + 260, z.y + 260, 13, 1.25, 'glyph X one', 42);
      Q.hitLine(b, api, z.x + 260, z.y - 260, z.x - 260, z.y + 260, 13, 1.25, 'glyph X two', 42);
      api.beam(z.x - 260, z.y - 260, z.x + 260, z.y + 260, GLYPH_COLOR[g], 10);
      api.beam(z.x + 260, z.y - 260, z.x - 260, z.y + 260, GLYPH_COLOR[g], 10);
    } else if (g === '|') {
      Q.hitLine(b, api, z.x, -api.ARENA, z.x, api.ARENA, 12, 1.2, 'glyph vertical', 38);
      api.beam(z.x, -api.ARENA, z.x, api.ARENA, GLYPH_COLOR[g], 10);
    } else if (g === '—') {
      Q.hitLine(b, api, -api.ARENA, z.y, api.ARENA, z.y, 12, 1.2, 'glyph horizontal', 38);
      api.beam(-api.ARENA, z.y, api.ARENA, z.y, GLYPH_COLOR[g], 10);
    } else if (g === 'O') Q.nova(b, api, z.x, z.y, 14, 5, 1.05, 'glyph_O', {
      radius: 5,
      life: 260,
      ghost: true,
      color: GLYPH_COLOR[g]
    });else if (g === '>') Q.shot(b, api, z.x, z.y, a, 10.8, 1.2, 'glyph_>', {
      radius: 6,
      life: 220,
      ghost: true,
      color: GLYPH_COLOR[g]
    });
  }
  function sentenceUpdate(b, s, t, api, rest) {
    var recovery = typeof rest === 'number' ? rest : 44;
    if (b.comboState === 'sentenceTell' && tick(b, s)) {
      b.attackStep = 0;
      Q.stage(b, 'sentenceFire', 1);
    } else if (b.comboState === 'sentenceFire' && tick(b, s)) {
      var z = b.attackZones[b.attackStep++];
      executeGlyph(b, z, t, api, !!z.glitch);
      if (b.attackStep >= b.attackZones.length) Q.finish(b, recovery);else b.stateTimer = 22;
    }
  }
  function drawSentence(b, api, redacted) {
    var c = api.ctx,
      t = api.visualTick();
    (b.attackZones || []).forEach(function (z, i) {
      c.save();
      c.translate(z.x, z.y);
      c.globalAlpha = i < b.attackStep ? .2 : .9;
      c.fillStyle = GLYPH_COLOR[z.glyph] || '#fff';
      c.strokeStyle = '#261c0b';
      c.lineWidth = 5;
      c.font = (z.glitch ? 30 + Math.sin(t * .4) * 5 : 28) + 'px \"Noto Sans Thai\", \"Ubuntu\", sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.strokeText(z.glyph, 0, 1);
      c.fillText(z.glyph, 0, 1);
      if (z.glitch) {
        c.strokeStyle = '#ff4d8d';
        c.lineWidth = 2;
        c.strokeRect(-25 + Math.sin(t * .3) * 6, -28, 50, 56);
      }
      c.restore();
      if (redacted && i >= b.attackStep) {
        c.save();
        c.fillStyle = 'rgba(0,0,0,.92)';
        c.fillRect(z.x - 42, z.y - 28, 84, 56);
        c.restore();
      }
    });
  }
  var glyphAttacks = [{
    name: 'SENTENCE',
    begin: function (b) {
      var set = b.enraged ? ['?', '—', 'X'] : ['>', '>', '>', '!'];
      glyphSentence(b, set, -140, -420, false);
      Q.stage(b, 'sentenceTell', 90);
    },
    update: sentenceUpdate,
    draw: function (b, api) {
      drawSentence(b, api, false);
    }
  }, {
    name: 'TYPO',
    begin: function (b) {
      glyphSentence(b, ['>', 'O', '—', '!'], -140, -390, false);
      b.attackZones[1].glitch = true;
      Q.stage(b, 'sentenceTell', 96);
    },
    update: sentenceUpdate,
    draw: function (b, api) {
      drawSentence(b, api, false);
    }
  }, {
    name: 'REDACTION',
    begin: function (b) {
      glyphSentence(b, ['?', '|', 'O', 'X', '>'], -185, -360, false);
      Q.stage(b, 'sentenceTell', 100);
    },
    update: sentenceUpdate,
    draw: function (b, api) {
      drawSentence(b, api, b.comboState === 'sentenceTell' && b.stateTimer > 36);
    }
  }, {
    name: 'MARGIN NOTE',
    begin: function (b) {
      glyphSentence(b, ['|', '>', 'O', '—'], -apiSafe(), -180, true);
      function apiSafe() {
        return 720;
      }
      Q.stage(b, 'sentenceTell', 84);
    },
    update: sentenceUpdate,
    draw: function (b, api) {
      drawSentence(b, api, false);
    }
  }, {
    name: 'ERRATA',
    begin: function (b) {
      glyphSentence(b, ['X', '?', '—', '!', 'O'], 420, -330, true);
      Q.stage(b, 'sentenceTell', 90);
    },
    update: function (b, s, t, api) {
      sentenceUpdate(b, s, t, api, 42);
      if (b.comboState === 'sentenceFire' && b.enraged && b.attackStep % 2 === 0 && b.stateTimer > 18 && api.interval(b, 'errataEcho', s, 10)) {
        var z = b.attackZones[Math.max(0, b.attackStep - 1)];
        Q.shot(b, api, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), 6, 1, 'glyph_>', {
          radius: 5,
          life: 180,
          ghost: true,
          color: '#fff'
        });
      }
    },
    draw: function (b, api) {
      drawSentence(b, api, false);
    }
  }, {
    name: 'FINAL CHAPTER',
    begin: function (b) {
      var sentences = [['>', '>', '!'], ['?', '—', 'X'], ['O', '|', '>'], ['X', 'O', '!']];
      b.attackZones = [];
      sentences.forEach(function (sentence, side) {
        sentence.forEach(function (g, i) {
          var a = side * TAU / 4,
            r = 720,
            x = Math.cos(a) * r + Math.cos(a + Math.PI / 2) * (i - 1) * 90,
            y = Math.sin(a) * r + Math.sin(a + Math.PI / 2) * (i - 1) * 90;
          b.attackZones.push({
            x: x,
            y: y,
            glyph: g,
            index: side * 3 + i,
            sentence: side
          });
        });
      });
      b.attackStep = 0;
      Q.stage(b, 'chapterTell', 118);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'chapterTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'chapterFire', 1);
      } else if (b.comboState === 'chapterFire' && tick(b, s)) {
        var currentSentence = Math.floor(b.attackStep / 3),
          start = currentSentence * 3;
        for (var i = 0; i < 3; i++) executeGlyph(b, b.attackZones[start + i], t, api, false);
        b.attackStep += 3;
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 58);else b.stateTimer = 54;
      }
    },
    draw: function (b, api) {
      drawSentence(b, api, false);
      var c = api.ctx,
        current = Math.floor((b.attackStep || 0) / 3);
      (b.attackZones || []).forEach(function (z) {
        if (z.sentence === current) circle(c, z.x, z.y, 42, '#fff', .3, 3);
      });
    }
  }];
  Q.register('glyph', {
    attacks: glyphAttacks,
    distance: 380,
    pacing: [112, 92, 74],
    arenaMode: 'language'
  }, 'world/bosses/grand-index');
})();

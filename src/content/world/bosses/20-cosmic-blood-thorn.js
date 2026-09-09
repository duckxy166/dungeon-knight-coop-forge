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
  function drawWell(c, z, t) {
    c.save();
    c.translate(z.x, z.y);
    c.rotate(t * .02 * (z.spin || 1));
    c.fillStyle = '#010103';
    c.beginPath();
    c.arc(0, 0, z.radius || 28, 0, TAU);
    c.fill();
    c.strokeStyle = z.color || '#e548a7';
    c.lineWidth = 4;
    for (var i = 0; i < 3; i++) {
      c.rotate(TAU / 3);
      c.beginPath();
      c.ellipse(0, 0, (z.radius || 28) + 18 + i * 13, 8 + i * 3, 0, 0, TAU);
      c.stroke();
    }
    c.restore();
  }

  /* EVENT HORIZON — straight-line intuition is deliberately unreliable. */
  function gravityStep(b, s, t, api) {
    var wells = [];
    (b.attackZones || []).forEach(function (z) {
      if (z.kind === 'well') wells.push(z);
    });
    (b.arenaZones || []).forEach(function (z) {
      if (z.kind === 'well') wells.push(z);
    });
    if (!wells.length) return;
    hostile(api).forEach(function (x) {
      if (x.sourceId !== 'boss_void' && b.comboState !== 'consume') return;
      for (var i = 0; i < wells.length; i++) {
        var w = wells[i],
          dx = w.x - x.x,
          dy = w.y - x.y,
          d = Math.hypot(dx, dy) || 1,
          reach = w.reach || 760;
        if (d > reach) continue;
        var pull = (w.power || .24) * (1 - d / reach) * s;
        x.vx += dx / d * pull;
        x.vy += dy / d * pull;
        if (w.consume && d < (w.radius || 30) + 10) {
          x.dead = true;
          b.attackAux = (b.attackAux || 0) + 1;
          api.particles(w.x, w.y, b.color, 2, 2);
        }
      }
      var speed = Math.hypot(x.vx, x.vy) || 1,
        max = Math.max(11, (x.speed || 5) * 2.1);
      if (speed > max) {
        x.vx = x.vx / speed * max;
        x.vy = x.vy / speed * max;
      }
    });
  }
  var voidAttacks = [{
    name: 'SLINGSHOT',
    begin: function (b, t, api) {
      var p = Q.clampPoint(api, (b.x + t.x) * .5, (b.y + t.y) * .5, 220);
      b.attackZones = [{
        x: p.x,
        y: p.y,
        kind: 'well',
        radius: 28,
        power: .34,
        reach: 880
      }];
      b.attackAngle = aim(b, t);
      Q.stage(b, 'slingshotTell', 62);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'slingshotTell' && tick(b, s)) {
        Q.stage(b, 'slingshotFire', 160);
        b.attackStep = 0;
      } else if (b.comboState === 'slingshotFire') {
        if (api.interval(b, 'slingshotVolley', s, 17)) {
          var w = b.attackZones[0],
            side = b.attackStep % 2 ? 1 : -1,
            a = Math.atan2(w.y - b.y, w.x - b.x) + side * .42;
          Q.shot(b, api, b.x, b.y, a, 5.8, 1.15, 'gravitySeed', {
            radius: 7,
            life: 360,
            ghost: true,
            trailMax: 11
          });
          b.attackStep++;
        }
        if (tick(b, s)) Q.finish(b, 42);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick(),
        w = b.attackZones[0];
      if (!w) return;
      drawWell(c, w, t);
      for (var i = -1; i <= 1; i += 2) {
        var a = Math.atan2(w.y - b.y, w.x - b.x) + i * .42;
        line(c, b.x, b.y, b.x + Math.cos(a) * 720, b.y + Math.sin(a) * 720, b.color, 2, .22, [16, 12]);
      }
    }
  }, {
    name: 'BINARY STAR',
    begin: function (b, t) {
      b.attackZones = [{
        x: t.x - 230,
        y: t.y,
        kind: 'well',
        radius: 25,
        power: .28,
        reach: 720,
        spin: 1
      }, {
        x: t.x + 230,
        y: t.y,
        kind: 'well',
        radius: 25,
        power: .28,
        reach: 720,
        spin: -1
      }];
      b.arenaAngle = 0;
      Q.stage(b, 'binaryTell', 62);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'binaryTell' && tick(b, s)) Q.stage(b, 'binaryLive', 250);else if (b.comboState === 'binaryLive') {
        b.arenaAngle += .009 * s;
        for (var i = 0; i < 2; i++) {
          var a = b.arenaAngle + i * Math.PI;
          b.attackZones[i].x = t.x + Math.cos(a) * 230;
          b.attackZones[i].y = t.y + Math.sin(a) * 150;
        }
        if (api.interval(b, 'binaryFeed', s, 12)) {
          var side = b.attackStep++ % 2,
            w = b.attackZones[side],
            other = b.attackZones[1 - side],
            a = Math.atan2(other.y - w.y, other.x - w.x) + Math.PI / 2 * (side ? 1 : -1);
          Q.shot(b, api, w.x, w.y, a, 3.9, 1.05, 'gravitySeed', {
            radius: 6,
            life: 410,
            ghost: true,
            trailMax: 11
          });
        }
        if (tick(b, s)) {
          api.float('COLLAPSE', b.x, b.y - 92, '#fff');
          hostile(api, 'void').forEach(function (x) {
            x.vx *= 1.45;
            x.vy *= 1.45;
          });
          Q.finish(b, 48);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (w) {
        drawWell(c, w, t);
      });
      if (b.attackZones.length === 2) line(c, b.attackZones[0].x, b.attackZones[0].y, b.attackZones[1].x, b.attackZones[1].y, b.color, 2, .2, [10, 12]);
    }
  }, {
    name: 'ACCRETION DISK',
    begin: function (b) {
      b.attackZones = [{
        x: b.x,
        y: b.y,
        kind: 'well',
        radius: 35,
        power: .22,
        reach: 1150
      }];
      b.arenaAngle = 0;
      Q.stage(b, 'diskTell', 58);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'diskTell' && tick(b, s)) {
        Q.stage(b, 'diskLive', 245);
        b.attackStep = 0;
      } else if (b.comboState === 'diskLive') {
        if (api.interval(b, 'diskFeed', s, 8)) {
          var a = b.attackStep++ * .83,
            r = 880 - b.attackStep % 4 * 55,
            x = b.x + Math.cos(a) * r,
            y = b.y + Math.sin(a) * r,
            Qa = a + Math.PI / 2;
          Q.shot(b, api, x, y, Qa, 3.8, 1.02, 'gravitySeed', {
            radius: 6,
            life: 470,
            ghost: true,
            trailMax: 11
          });
        }
        b.stateTimer -= s;
        if (b.stateTimer < 62 && !b.attackMask) {
          b.attackMask = 1;
          b.attackZones[0].power = -.32;
          api.float('GRAVITY REVERSED', b.x, b.y - 96, '#fff');
          api.ring(b.x, b.y, b.color, 700, 12);
        }
        if (b.stateTimer <= 0) Q.finish(b, 48);
      }
    },
    draw: function (b, api) {
      drawWell(api.ctx, b.attackZones[0], api.visualTick());
      circle(api.ctx, b.x, b.y, 340, b.color, .18, 4);
      circle(api.ctx, b.x, b.y, 650, b.color, .12, 3);
    }
  }, {
    name: 'EVENT HORIZON',
    begin: function (b, t, api) {
      var p = Q.clampPoint(api, t.x, t.y, 260);
      b.attackZones = [{
        x: p.x,
        y: p.y,
        kind: 'well',
        radius: 45,
        power: .5,
        reach: 1250,
        consume: true
      }];
      b.attackAux = 0;
      Q.stage(b, 'consume', 190);
      api.float('THE ARENA EMPTIES', p.x, p.y - 90, '#fff');
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'consume') {
        b.stateTimer -= s;
        if (b.stateTimer < 52 && !b.attackMask) {
          b.attackMask = 1;
          var w = b.attackZones[0];
          w.consume = false;
          w.power = -.7;
          var waves = Math.max(4, Math.min(8, 4 + Math.floor(b.attackAux / 6)));
          for (var i = 0; i < waves; i++) Q.shot(b, api, w.x, w.y, i * TAU / waves, 4.4, 1.45, 'gravityWave', {
            radius: 18,
            life: 360,
            ghost: true,
            curveRate: (i % 2 ? 1 : -1) * .003,
            heavy: true,
            trailMax: 11
          });
          api.ring(w.x, w.y, '#fff', 620, 18);
          api.float('MASS RELEASE', w.x, w.y - 86, b.color);
        }
        if (b.stateTimer <= 0) Q.finish(b, 54);
      }
    },
    draw: function (b, api) {
      drawWell(api.ctx, b.attackZones[0], api.visualTick());
    }
  }, {
    name: 'GRAVITY LENS',
    begin: function (b, t, api) {
      b.attackZones = [];
      var a = aim(b, t),
        n = a + Math.PI / 2;
      for (var i = -1; i <= 1; i++) b.attackZones.push({
        x: b.x + Math.cos(a) * 180 + Math.cos(n) * i * 220,
        y: b.y + Math.sin(a) * 180 + Math.sin(n) * i * 220,
        kind: 'well',
        radius: 22,
        power: .36,
        reach: 560
      });
      Q.stage(b, 'lensTell', 64);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'lensTell' && tick(b, s)) Q.stage(b, 'lensFire', 170);else if (b.comboState === 'lensFire') {
        if (api.interval(b, 'lensShots', s, 14)) {
          var a = aim(b, t) + (b.attackStep % 3 - 1) * .55;
          Q.shot(b, api, b.x, b.y, a, 7, 1.12, 'gravitySeed', {
            radius: 6,
            life: 320,
            ghost: true,
            trailMax: 11
          });
          b.attackStep++;
        }
        if (tick(b, s)) Q.finish(b, 40);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (w) {
        drawWell(c, w, t);
      });
    }
  }, {
    name: 'SPAGHETTIFICATION',
    begin: function (b, t, api) {
      b.attackZones = [{
        x: -api.ARENA + 150,
        y: 0,
        kind: 'well',
        radius: 55,
        power: .62,
        reach: 1800,
        spin: 1
      }, {
        x: api.ARENA - 150,
        y: 0,
        kind: 'well',
        radius: 55,
        power: .18,
        reach: 1800,
        spin: -1
      }];
      b.attackMask = 0;
      Q.stage(b, 'spaghettify', 330);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'spaghettify') {
        if (api.interval(b, 'singularitySwap', s, 78)) {
          b.attackMask = 1 - b.attackMask;
          b.attackZones[0].power = b.attackMask ? .18 : .62;
          b.attackZones[1].power = b.attackMask ? .62 : .18;
          api.float(b.attackMask ? 'RIGHT SINGULARITY' : 'LEFT SINGULARITY', b.x, b.y - 96, '#fff');
        }
        if (api.interval(b, 'spaghettiFeed', s, 12)) {
          var y = -720 + b.attackStep++ % 9 * 180,
            side = b.attackStep % 2,
            x = side ? -api.ARENA + 180 : api.ARENA - 180,
            a = side ? 0 : Math.PI;
          Q.shot(b, api, x, y, a, 4.8, 1.15, 'gravitySeed', {
            radius: 7,
            life: 440,
            ghost: true,
            trailMax: 11
          });
        }
        if (tick(b, s)) Q.finish(b, 56);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (w) {
        drawWell(c, w, t);
      });
      c.save();
      c.globalAlpha = .07;
      c.fillStyle = b.color;
      c.fillRect(-api.ARENA, -api.ARENA, api.ARENA * 2, api.ARENA * 2);
      c.restore();
    }
  }];
  Q.register('void', {
    attacks: voidAttacks,
    distance: 370,
    pacing: [110, 90, 72],
    arena: gravityStep,
    arenaMode: 'warped'
  }, 'world/bosses/event-horizon');

  /* ROSE ABBESS — beauty is information, then it becomes danger. */
  function sharpenPetals(b, api, selector) {
    hostile(api, 'blood').forEach(function (x, i) {
      if (x.type !== 'petalSoft' || !selector(x, i)) return;
      x.type = 'petalBlade';
      x.harmless = false;
      x.color = '#ff3e68';
      x.radius = Math.max(6, x.radius);
      x.speed = Math.max(2.5, x.speed * 1.28);
      var a = Math.atan2(x.vy, x.vx);
      x.vx = Math.cos(a) * x.speed;
      x.vy = Math.sin(a) * x.speed;
    });
  }
  function roseWindowAttack(b, api, t, color, index) {
    var a = aim(b, t);
    if (color === 'red') for (var x = -560; x <= 560; x += 140) Q.shot(b, api, t.x + x, -api.ARENA + 120, Math.PI / 2, 7.2, 1.1, 'petalBlade', {
      radius: 6,
      life: 310,
      ghost: true,
      color: '#ff536f'
    });else if (color === 'blue') for (var y = -560; y <= 560; y += 140) Q.shot(b, api, -api.ARENA + 120, t.y + y, 0, 6.8, 1.1, 'petalBlade', {
      radius: 6,
      life: 310,
      ghost: true,
      color: '#74c9ff'
    });else if (color === 'gold') Q.fan(b, api, b.x, b.y, a, 5, .48, 9.2, 1.2, 'thorn', {
      radius: 5,
      life: 220,
      ghost: true,
      color: '#ffd76a'
    });else Q.fan(b, api, b.x, b.y, a, 7, 1.2, 4.6, 1.05, 'petalBlade', {
      radius: 5,
      life: 300,
      ghost: true,
      homing: .015,
      color: '#b879ff'
    });
  }
  var bloodAttacks = [{
    name: 'ROSE GARDEN',
    begin: function (b) {
      Q.stage(b, 'gardenDrift', 150);
      b.attackStep = 0;
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'gardenDrift') {
        if (api.interval(b, 'gardenPetal', s, 7)) {
          var edge = b.attackStep++ % 4,
            a = edge === 0 ? 0 : edge === 1 ? Math.PI / 2 : edge === 2 ? Math.PI : -Math.PI / 2,
            x = edge === 0 ? -api.ARENA + 110 : edge === 2 ? api.ARENA - 110 : (Q.seeded(b.attackStep * 3.1) * 2 - 1) * 850,
            y = edge === 1 ? -api.ARENA + 110 : edge === 3 ? api.ARENA - 110 : (Q.seeded(b.attackStep * 4.3) * 2 - 1) * 850;
          Q.shot(b, api, x, y, a + (Q.seeded(b.attackStep * 8.2) - .5) * .35, 1.8, 1, 'petalSoft', {
            radius: 6,
            life: 480,
            ghost: true,
            harmless: true,
            curveRate: (b.attackStep % 2 ? 1 : -1) * .0015,
            color: '#ff91a8'
          });
        }
        b.stateTimer -= s;
        if (b.stateTimer < 48 && !b.attackMask) {
          b.attackMask = 1;
          sharpenPetals(b, api, function (x) {
            return (x.netId || 0) % 3 === 0;
          });
          api.float('RED OUTLINES CUT', b.x, b.y - 90, '#ff536f');
        }
        if (b.apex && b.stateTimer < 18 && b.attackMask === 1) {
          b.attackMask = 2;
          sharpenPetals(b, api, function (x) {
            return (x.netId || 0) % 2 === 0;
          });
        }
        if (b.stateTimer <= 0) Q.finish(b, 48);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, 180, b.color, .18, 4);
    }
  }, {
    name: 'THORN CATHEDRAL',
    begin: function (b, t) {
      b.attackZones = [];
      for (var i = 0; i < 7; i++) {
        var x = -720 + i * 240,
          open = 210 + Math.sin(i * 1.7) * 150;
        b.attackZones.push({
          x: x,
          y1: -890,
          y2: -open,
          xb: x,
          yb: open,
          ye: 890,
          index: i
        });
      }
      Q.stage(b, 'cathedralTell', 66);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'cathedralTell' && tick(b, s)) Q.stage(b, 'cathedralLive', 210);else if (b.comboState === 'cathedralLive') {
        var p = 1 - b.stateTimer / 210;
        b.attackZones.forEach(function (z, i) {
          var sway = Math.sin(p * TAU + i) * 75,
            x = z.x + sway;
          Q.hitLine(b, api, x, z.y1, x, z.y2, 12, 1.2, 'upper cathedral ' + i, 30);
          Q.hitLine(b, api, x, z.yb, x, z.ye, 12, 1.2, 'lower cathedral ' + i, 30);
        });
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick(),
        p = 1 - Math.max(0, b.stateTimer) / 210;
      (b.attackZones || []).forEach(function (z, i) {
        var x = z.x + Math.sin(p * TAU + i) * 75;
        c.save();
        c.strokeStyle = '#7f1f3e';
        c.lineWidth = b.comboState === 'cathedralLive' ? 16 : 5;
        c.globalAlpha = b.comboState === 'cathedralLive' ? .72 : .3;
        c.beginPath();
        c.moveTo(x, z.y1);
        c.bezierCurveTo(x + 80, -630, x - 90, z.y2 - 80, x, z.y2);
        c.moveTo(x, z.ye);
        c.bezierCurveTo(x - 80, 630, x + 90, z.yb + 80, x, z.yb);
        c.stroke();
        c.restore();
      });
    }
  }, {
    name: 'STAINED GLASS',
    begin: function (b) {
      var colors = ['red', 'blue', 'gold', 'purple'];
      b.attackZones = colors.map(function (color, i) {
        return {
          x: -660 + i * 440,
          y: -apiSafe(i),
          color: color,
          index: i
        };
      });
      function apiSafe(i) {
        return 760 - i % 2 * 80;
      }
      b.attackStep = 0;
      Q.stage(b, 'glassTell', 82);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'glassTell' && tick(b, s)) {
        var count = b.enraged ? 2 : 1;
        for (var i = 0; i < count; i++) {
          var z = b.attackZones[(b.attackStep + i) % 4];
          roseWindowAttack(b, api, t, z.color, z.index);
        }
        b.attackStep += count;
        Q.stage(b, 'glassRest', 72);
      } else if (b.comboState === 'glassRest' && tick(b, s)) {
        if (b.attackStep >= 4) Q.finish(b, 42);else Q.stage(b, 'glassTell', 50);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        colors = {
          red: '#ff536f',
          blue: '#74c9ff',
          gold: '#ffd76a',
          purple: '#b879ff'
        };
      (b.attackZones || []).forEach(function (z) {
        c.save();
        c.globalAlpha = .28;
        c.fillStyle = colors[z.color];
        c.strokeStyle = '#fff';
        c.lineWidth = 3;
        c.fillRect(z.x - 80, -api.ARENA + 120, 160, 100);
        c.strokeRect(z.x - 80, -api.ARENA + 120, 160, 100);
        c.restore();
      });
    }
  }, {
    name: 'FUNERAL PROCESSION',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 9; i++) {
        var x = -api.ARENA + 130 - i % 3 * 95,
          y = -560 + i * 140;
        b.attackZones.push({
          x: x,
          y: y,
          index: i,
          dead: false,
          radius: 25,
          speed: 2.2 + i % 3 * .25
        });
      }
      Q.stage(b, 'processionTell', 48);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'processionTell' && tick(b, s)) Q.stage(b, 'processionLive', 340);else if (b.comboState === 'processionLive') {
        b.attackZones.forEach(function (z) {
          if (z.dead) return;
          Q.friendlyBreaks(api, z, 28);
          z.x += z.speed * s;
          if (z.x > api.ARENA - 130) {
            z.dead = true;
            Q.shot(b, api, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), 8.2, 1.25, 'thorn', {
              radius: 5,
              life: 210,
              ghost: true
            });
          }
        });
        if (tick(b, s) || b.attackZones.every(function (z) {
          return z.dead;
        })) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z) {
        if (z.dead) return;
        c.save();
        c.translate(z.x, z.y);
        c.globalAlpha = .62;
        c.fillStyle = '#eadde2';
        c.beginPath();
        c.moveTo(0, -28);
        c.lineTo(19, 25);
        c.lineTo(-19, 25);
        c.closePath();
        c.fill();
        c.fillStyle = '#ff536f';
        c.beginPath();
        c.arc(0, -3, 6 + Math.sin(t * .1 + z.index), 0, TAU);
        c.fill();
        c.restore();
      });
    }
  }, {
    name: 'VESPER THORNS',
    begin: function (b, t, api) {
      b.attackAngle = aim(b, t);
      Q.stage(b, 'vesperTell', 48);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'vesperTell' && tick(b, s)) Q.stage(b, 'vesperLive', 180);else if (b.comboState === 'vesperLive') {
        if (api.interval(b, 'vesperSpear', s, 18)) {
          Q.fan(b, api, b.x, b.y, aim(b, t), 3, .42, 8.6, 1.15, 'thorn', {
            radius: 5,
            life: 220,
            ghost: true
          });
          for (var i = -1; i <= 1; i += 2) Q.shot(b, api, b.x, b.y, aim(b, t) + i * 1.15, 3.2, 1.0, 'petalSoft', {
            radius: 6,
            life: 300,
            ghost: true,
            harmless: true,
            curveRate: -i * .005,
            color: '#ff91a8'
          });
        }
        if (tick(b, s)) {
          sharpenPetals(b, api, function () {
            return true;
          });
          Q.finish(b, 42);
        }
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        a = b.attackAngle;
      line(c, b.x, b.y, b.x + Math.cos(a) * 900, b.y + Math.sin(a) * 900, '#ffd4dd', 3, .28, [16, 12]);
    }
  }, {
    name: 'BLOOM',
    begin: function (b) {
      b.attackStep = 0;
      Q.stage(b, 'bloomTell', 76);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'bloomTell' && tick(b, s)) {
        Q.stage(b, 'bloomLayer', 1);
      } else if (b.comboState === 'bloomLayer' && tick(b, s)) {
        var layer = b.attackStep++;
        if (layer === 0) for (var i = 0; i < 18; i++) Q.shot(b, api, b.x, b.y, i * TAU / 18, 4.1, 1.05, 'petalBlade', {
          radius: 6,
          life: 330,
          ghost: true,
          curveRate: (i % 2 ? 1 : -1) * .007,
          color: '#ff91a8'
        });else if (layer === 1) for (var j = 0; j < 12; j++) Q.shot(b, api, b.x, b.y, j * TAU / 12 + .2, 6.1, 1.15, 'petalBlade', {
          radius: 7,
          life: 280,
          ghost: true,
          curveRate: -.004,
          color: '#ff536f'
        });else Q.fan(b, api, b.x, b.y, aim(b, t), 7, .85, 9.1, 1.25, 'thorn', {
          radius: 5,
          life: 240,
          ghost: true,
          color: '#fff0d5'
        });
        api.ring(b.x, b.y, layer === 2 ? '#fff' : b.color, 220 - layer * 55, 7);
        if (layer >= 2) Q.finish(b, 56);else b.stateTimer = 46;
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick(),
        open = Math.min(1, (76 - Math.max(0, b.stateTimer)) / 76);
      c.save();
      c.translate(b.x, b.y);
      c.rotate(t * .006);
      for (var layer = 0; layer < 3; layer++) {
        c.globalAlpha = .16 + layer * .1;
        c.strokeStyle = layer === 2 ? '#fff' : b.color;
        c.lineWidth = 5;
        for (var p = 0; p < 8 - layer * 2; p++) {
          c.rotate(TAU / (8 - layer * 2));
          c.beginPath();
          c.ellipse((75 + layer * 50) * open, 0, 55, 17, 0, 0, TAU);
          c.stroke();
        }
      }
      c.restore();
    }
  }];
  Q.register('blood', {
    attacks: bloodAttacks,
    distance: 330,
    pacing: [108, 90, 72],
    arenaMode: 'rose'
  }, 'world/bosses/rose-abbess');

  /* BRIAR STAG — roots remain, branch, and can be cut by the fight itself. */
  function rootDistance(p, z) {
    return Q.pointLine(p.x, p.y, z.x1, z.y1, z.x2, z.y2);
  }
  function growBranches(b, api, cx, cy, seed, count, life) {
    var branches = [],
      front = [{
        x: cx,
        y: cy,
        a: seed
      }];
    for (var depth = 0; depth < 3; depth++) {
      var next = [];
      front.forEach(function (node, n) {
        for (var side = -1; side <= 1; side += 2) {
          if (branches.length >= count) return;
          var a = node.a + side * (.34 + Q.seeded(seed + depth * 7 + n * 3) * .38),
            len = 150 - depth * 22 + Q.seeded(seed + n + side) * 70,
            x2 = api.clamp(node.x + Math.cos(a) * len, -api.ARENA + 100, api.ARENA - 100),
            y2 = api.clamp(node.y + Math.sin(a) * len, -api.ARENA + 100, api.ARENA - 100);
          var z = {
            x: (node.x + x2) / 2,
            y: (node.y + y2) / 2,
            x1: node.x,
            y1: node.y,
            x2: x2,
            y2: y2,
            kind: 'root',
            life: life || 430,
            radius: 12
          };
          branches.push(z);
          next.push({
            x: x2,
            y: y2,
            a: a
          });
        }
      });
      front = next;
    }
    Array.prototype.push.apply(b.arenaZones, branches);
  }
  function thornArena(b, s, t, api) {
    (b.arenaZones || []).forEach(function (z) {
      if (z.kind === 'seed') {
        if (!z.grown) Q.friendlyBreaks(api, z, 20);
        if (z.dead) return;
        if (!z.grown && z.age >= z.growAt) {
          z.grown = true;
          api.ring(z.x, z.y, b.color, 48, 5);
        }
        if (z.grown) {
          if (z.seedType === 0 && api.interval(z, 'seedTurret', s, 48)) Q.shot(b, api, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), 6.5, 1, 'thorn', {
            radius: 4,
            life: 190,
            ghost: true
          });else if (z.seedType === 1) Q.hitLine(b, api, z.x - 75, z.y, z.x + 75, z.y, 10, 1, 'vine wall ' + z.index, 38);else if (z.seedType === 2 && !z.burst && z.age > z.growAt + 38) {
            z.burst = true;
            Q.hitCircle(b, api, z.x, z.y, 95, 1.35, 'explosive flower', 65);
            api.ring(z.x, z.y, '#fff', 110, 8);
          }
        }
      } else if (z.kind === 'root') {
        Q.living(api).forEach(function (p) {
          if (rootDistance(p, z) < p.radius + 10) {
            p.terrainSlow = Math.min(p.terrainSlow, .5);
            if ((z.age || 0) % 70 < s) Q.hitLine(b, api, z.x1, z.y1, z.x2, z.y2, 10, 1, 'living root', 58);
          }
        });
      }
    });
  }
  function drawThornArena(b, api) {
    var c = api.ctx,
      t = api.visualTick();
    (b.arenaZones || []).forEach(function (z) {
      if (z.kind === 'root') {
        line(c, z.x1, z.y1, z.x2, z.y2, '#346b3d', 13, .78);
        line(c, z.x1, z.y1, z.x2, z.y2, '#a7d98b', 2, .55);
      } else if (z.kind === 'seed') {
        c.save();
        c.translate(z.x, z.y);
        c.strokeStyle = z.seedType === 3 ? '#dfffcf' : b.color;
        c.fillStyle = z.grown ? z.seedType === 3 ? '#ffd87a' : '#234627' : '#73512b';
        c.lineWidth = 3;
        if (z.grown) {
          for (var i = 0; i < 7; i++) {
            c.rotate(TAU / 7);
            c.beginPath();
            c.ellipse(15, 0, 14, 6, 0, 0, TAU);
            c.fill();
            c.stroke();
          }
        } else {
          c.beginPath();
          c.ellipse(0, 0, 9, 6, 0, 0, TAU);
          c.fill();
          c.stroke();
          circle(c, 0, 0, 16 + Math.sin(t * .12 + z.index) * 3, b.color, .5, 2);
        }
        c.restore();
      }
    });
  }
  var thornAttacks = [{
    name: 'SEEDING',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 8 + (b.enraged ? 2 : 0); i++) {
        var a = i * 2.31,
          r = 150 + i % 4 * 105,
          p = Q.clampPoint(api, t.x + Math.cos(a) * r, t.y + Math.sin(a) * r, 90);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          index: i,
          seedType: i % 4
        });
      }
      Q.stage(b, 'seedTell', 52);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'seedTell' && tick(b, s)) {
        b.attackZones.forEach(function (z) {
          b.arenaZones.push({
            x: z.x,
            y: z.y,
            index: z.index,
            kind: 'seed',
            seedType: z.seedType,
            growAt: 52,
            life: 360,
            grown: false,
            radius: 18
          });
          api.ring(z.x, z.y, b.color, 30, 3);
        });
        Q.finish(b, 48);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z) {
        circle(c, z.x, z.y, 22, b.color, .3 + .18 * Math.sin(t * .13 + z.index), 3);
      });
    }
  }, {
    name: 'ANTLER MAZE',
    begin: function (b, t, api) {
      var seed = (b.id || 1) * .37 + b.comboIndex;
      growBranches(b, api, b.x, b.y, seed, 14, 480);
      Q.stage(b, 'mazeGrow', 74);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'mazeGrow' && tick(b, s)) {
        api.ring(b.x, b.y, '#dfffcf', 420, 10);
        Q.finish(b, 56);
      }
    },
    draw: function (b, api) {
      circle(api.ctx, b.x, b.y, 180, b.color, .24, 5);
    }
  }, {
    name: 'STAMPEDE',
    begin: function (b, t, api) {
      b.attackZones = [];
      var base = aim(b, t);
      for (var i = -1; i <= 1; i++) {
        var off = i * 260,
          n = base + Math.PI / 2;
        b.attackZones.push({
          x: t.x + Math.cos(n) * off,
          y: t.y + Math.sin(n) * off,
          angle: base,
          index: i + 1
        });
      }
      b.attackAngle = base + .63;
      Q.stage(b, 'stampedeTell', 68);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'stampedeTell' && tick(b, s)) Q.stage(b, 'stampedeLive', 44);else if (b.comboState === 'stampedeLive') {
        b.attackZones.forEach(function (z, i) {
          Q.hitLine(b, api, z.x - Math.cos(z.angle) * 1000, z.y - Math.sin(z.angle) * 1000, z.x + Math.cos(z.angle) * 1000, z.y + Math.sin(z.angle) * 1000, 34, 1.35, 'spectral stampede ' + i, 45);
        });
        b.x += Math.cos(b.attackAngle) * 16 * s;
        b.y += Math.sin(b.attackAngle) * 16 * s;
        api.resolve(b);
        Q.hitCircle(b, api, b.x, b.y, b.radius + 20, 1.7, 'stag charge', 90);
        if (tick(b, s)) Q.finish(b, 48);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z, i) {
        line(c, z.x - Math.cos(z.angle) * 1100, z.y - Math.sin(z.angle) * 1100, z.x + Math.cos(z.angle) * 1100, z.y + Math.sin(z.angle) * 1100, '#dfffcf', b.comboState === 'stampedeLive' ? 28 : 4, b.comboState === 'stampedeLive' ? .34 : .25, [24, 18]);
        for (var h = -3; h <= 3; h++) {
          var x = z.x + Math.cos(z.angle) * h * 180,
            y = z.y + Math.sin(z.angle) * h * 180;
          c.save();
          c.translate(x, y);
          c.rotate(z.angle);
          c.globalAlpha = .25 + .1 * Math.sin(t * .2 + h);
          c.strokeStyle = '#fff';
          c.beginPath();
          c.ellipse(-8, -6, 7, 12, .5, 0, TAU);
          c.ellipse(8, 6, 7, 12, .5, 0, TAU);
          c.stroke();
          c.restore();
        }
      });
      line(c, b.x, b.y, b.x + Math.cos(b.attackAngle) * 900, b.y + Math.sin(b.attackAngle) * 900, b.color, 5, .45, [20, 13]);
    }
  }, {
    name: 'ROOT CROWN',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 10; i++) {
        var a = i * TAU / 10;
        b.attackZones.push({
          x: t.x,
          y: t.y,
          angle: a,
          index: i
        });
      }
      Q.stage(b, 'crownTell', 54);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'crownTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'crownGrow', 1);
      } else if (b.comboState === 'crownGrow' && tick(b, s)) {
        var z = b.attackZones[b.attackStep++],
          x2 = z.x + Math.cos(z.angle) * 720,
          y2 = z.y + Math.sin(z.angle) * 720;
        b.arenaZones.push({
          x: (z.x + x2) / 2,
          y: (z.y + y2) / 2,
          x1: z.x,
          y1: z.y,
          x2: x2,
          y2: y2,
          kind: 'root',
          life: 300,
          radius: 12
        });
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 48);else b.stateTimer = 9;
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        line(c, z.x, z.y, z.x + Math.cos(z.angle) * 720, z.y + Math.sin(z.angle) * 720, b.color, 3, .26, [16, 12]);
      });
    }
  }, {
    name: 'WILD GRAFT',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 6; i++) {
        var a = i * TAU / 6 + .3,
          p = Q.clampPoint(api, t.x + Math.cos(a) * 320, t.y + Math.sin(a) * 260, 90);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          index: i,
          seedType: i % 3
        });
      }
      Q.stage(b, 'graftTell', 50);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'graftTell' && tick(b, s)) {
        b.attackZones.forEach(function (z) {
          b.arenaZones.push({
            x: z.x,
            y: z.y,
            index: z.index,
            kind: 'seed',
            seedType: z.seedType,
            growAt: 34,
            life: 280,
            grown: false,
            radius: 18
          });
        });
        growBranches(b, api, t.x, t.y, b.comboIndex * .91, 8, 290);
        Q.stage(b, 'graftFire', 120);
      } else if (b.comboState === 'graftFire') {
        if (api.interval(b, 'graftThorn', s, 21)) Q.fan(b, api, b.x, b.y, aim(b, t), 3, .44, 7.1, 1.08, 'thorn', {
          radius: 5,
          life: 220,
          ghost: true
        });
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      (b.attackZones || []).forEach(function (z) {
        circle(api.ctx, z.x, z.y, 20, b.color, .3, 3);
      });
    }
  }, {
    name: 'OLD GROWTH',
    begin: function (b, t, api) {
      b.arenaZones = b.arenaZones.filter(function (z) {
        return z.kind === 'root';
      });
      for (var n = 0; n < 3; n++) growBranches(b, api, (n - 1) * 390, n % 2 ? 330 : -330, (b.id || 1) * .17 + n * 2.4, 10, 9999);
      b.attackAngle = aim(b, t);
      Q.stage(b, 'oldTell', 76);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'oldTell' && tick(b, s)) {
        Q.stage(b, 'oldCharge', 210);
        b.attackStep = 0;
      } else if (b.comboState === 'oldCharge') {
        if (api.interval(b, 'oldRetarget', s, 58)) {
          b.attackAngle = aim(b, t) + (b.attackStep % 2 ? -.28 : .28);
          b.attackStep++;
        }
        var oldX = b.x,
          oldY = b.y;
        b.x += Math.cos(b.attackAngle) * 13 * s;
        b.y += Math.sin(b.attackAngle) * 13 * s;
        api.resolve(b);
        Q.hitCircle(b, api, b.x, b.y, b.radius + 22, 1.8, 'old growth charge', 105);
        b.arenaZones.forEach(function (z) {
          if (z.kind === 'root' && Q.pointLine(b.x, b.y, z.x1, z.y1, z.x2, z.y2) < b.radius + 16) {
            z.dead = true;
            api.particles((z.x1 + z.x2) / 2, (z.y1 + z.y2) / 2, b.color, 8, 4);
          }
        });
        if (Math.hypot(b.x - oldX, b.y - oldY) < 2) b.attackAngle += Math.PI * .67;
        if (tick(b, s)) Q.finish(b, 58);
      }
    },
    draw: function (b, api) {
      line(api.ctx, b.x, b.y, b.x + Math.cos(b.attackAngle) * 850, b.y + Math.sin(b.attackAngle) * 850, '#fff', 5, .45, [20, 13]);
    }
  }];
  Q.register('thorn', {
    attacks: thornAttacks,
    distance: 230,
    pacing: [106, 88, 70],
    arena: thornArena,
    drawArena: drawThornArena,
    arenaMode: 'living'
  }, 'world/bosses/briar-stag');
})();

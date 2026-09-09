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

  /* PRISM WYRM — a few deterministic rays gain complexity from real geometry. */
  function rayBound(x, y, a, A) {
    var dx = Math.cos(a),
      dy = Math.sin(a),
      tx = dx > 0 ? (A - x) / dx : dx < 0 ? (-A - x) / dx : 1e9,
      ty = dy > 0 ? (A - y) / dy : dy < 0 ? (-A - y) / dy : 1e9,
      t = Math.max(0, Math.min(tx, ty)),
      hitX = tx < ty;
    return {
      x: x + dx * t,
      y: y + dy * t,
      hitX: hitX
    };
  }
  function reflect(a, normal) {
    return 2 * normal - a + Math.PI;
  }
  function bouncePath(x, y, a, A, count) {
    var out = [],
      sx = x,
      sy = y,
      ang = a;
    for (var i = 0; i < count; i++) {
      var e = rayBound(sx, sy, ang, A);
      out.push({
        x1: sx,
        y1: sy,
        x2: e.x,
        y2: e.y
      });
      ang = e.hitX ? Math.PI - ang : -ang;
      sx = e.x + Math.cos(ang) * 2;
      sy = e.y + Math.sin(ang) * 2;
    }
    return out;
  }
  function hitSegments(b, api, segments, key, width) {
    segments.forEach(function (s, i) {
      Q.hitLine(b, api, s.x1, s.y1, s.x2, s.y2, width || 11, 1.25, key + ' ' + i, 34);
    });
  }
  function drawSegments(c, segments, color, active) {
    segments.forEach(function (s) {
      line(c, s.x1, s.y1, s.x2, s.y2, active ? '#fff' : color, active ? 12 : 3, active ? .62 : .28, active ? null : [16, 11]);
    });
  }
  function prism(c, z, t) {
    c.save();
    c.translate(z.x, z.y);
    c.rotate(z.normal || t * .01);
    c.fillStyle = 'rgba(205,249,255,.32)';
    c.strokeStyle = '#fff';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, -28);
    c.lineTo(25, 18);
    c.lineTo(-25, 18);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }
  function prismChain(b, api) {
    var zones = b.attackZones || [],
      segments = [],
      x = b.x,
      y = b.y,
      a = b.attackAngle;
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      segments.push({
        x1: x,
        y1: y,
        x2: z.x,
        y2: z.y
      });
      a = reflect(Math.atan2(z.y - y, z.x - x), z.normal || 0);
      x = z.x;
      y = z.y;
    }
    var end = rayBound(x, y, a, api.ARENA - 105);
    segments.push({
      x1: x,
      y1: y,
      x2: end.x,
      y2: end.y
    });
    return segments;
  }
  var mirrorAttacks = [{
    name: 'THREE-WAY REFRACTION',
    begin: function (b, t, api) {
      var p = Q.clampPoint(api, (b.x + t.x) * .5, (b.y + t.y) * .5, 210);
      b.attackZones = [{
        x: p.x,
        y: p.y,
        normal: .2,
        kind: 'prism'
      }];
      b.attackAngle = Math.atan2(p.y - b.y, p.x - b.x);
      Q.stage(b, 'refractionTell', 76);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'refractionTell' && tick(b, s)) Q.stage(b, 'refractionLive', 42);else if (b.comboState === 'refractionLive') {
        var p = b.attackZones[0],
          base = Math.atan2(p.y - b.y, p.x - b.x),
          segments = [{
            x1: b.x,
            y1: b.y,
            x2: p.x,
            y2: p.y
          }];
        [-.48, 0, .48].forEach(function (offset) {
          var e = rayBound(p.x, p.y, base + offset, api.ARENA - 105);
          segments.push({
            x1: p.x,
            y1: p.y,
            x2: e.x,
            y2: e.y
          });
        });
        hitSegments(b, api, segments, 'three-way refraction', 10);
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        p = b.attackZones[0];
      if (!p) return;
      var base = Math.atan2(p.y - b.y, p.x - b.x),
        segments = [{
          x1: b.x,
          y1: b.y,
          x2: p.x,
          y2: p.y
        }];
      [-.48, 0, .48].forEach(function (o) {
        var e = rayBound(p.x, p.y, base + o, api.ARENA - 105);
        segments.push({
          x1: p.x,
          y1: p.y,
          x2: e.x,
          y2: e.y
        });
      });
      drawSegments(c, segments, b.color, b.comboState === 'refractionLive');
      prism(c, p, api.visualTick());
    }
  }, {
    name: 'SHARD BANK SHOT',
    begin: function (b, t) {
      b.attackAngle = aim(b, t) + Math.PI;
      Q.stage(b, 'bankTell', 52);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'bankTell' && tick(b, s)) Q.stage(b, 'bankFire', 180);else if (b.comboState === 'bankFire') {
        if (api.interval(b, 'bankShard', s, 14)) {
          var a = b.attackAngle + (b.attackStep % 5 - 2) * .13;
          Q.shot(b, api, b.x, b.y, a, 8.5, 1.18, 'glassShard', {
            radius: 7,
            life: 430,
            bounce: 2,
            trailMax: 10
          });
          b.attackStep++;
        }
        if (tick(b, s)) Q.finish(b, 42);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        paths = bouncePath(b.x, b.y, b.attackAngle, api.ARENA - 105, 3);
      drawSegments(c, paths, b.color, false);
    }
  }, {
    name: 'KALEIDOSCOPE',
    begin: function (b) {
      b.attackZones = [];
      for (var i = 0; i < 3; i++) {
        var a = i * TAU / 3;
        b.attackZones.push({
          x: Math.cos(a) * 360,
          y: Math.sin(a) * 300,
          normal: a + .4,
          index: i
        });
      }
      b.attackAngle = 0;
      Q.stage(b, 'kaleidoTell', 78);
    },
    update: function (b, s, t, api) {
      b.attackZones.forEach(function (z, i) {
        z.normal += .009 * s * (i % 2 ? 1 : -1);
      });
      if (b.comboState === 'kaleidoTell' && tick(b, s)) Q.stage(b, 'kaleidoLive', 230);else if (b.comboState === 'kaleidoLive') {
        b.attackAngle += .013 * s;
        var segments = prismChain(b, api);
        hitSegments(b, api, segments, 'kaleidoscope', 9);
        if (tick(b, s)) Q.finish(b, 48);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick(),
        segments = prismChain(b, api);
      drawSegments(c, segments, b.color, b.comboState === 'kaleidoLive');
      (b.attackZones || []).forEach(function (z) {
        prism(c, z, t);
      });
    }
  }, {
    name: 'FACET LATTICE',
    begin: function (b, t) {
      b.attackZones = [];
      for (var i = 0; i < 6; i++) {
        var a = i * TAU / 6;
        b.attackZones.push({
          x: t.x + Math.cos(a) * 390,
          y: t.y + Math.sin(a) * 310,
          normal: a,
          index: i
        });
      }
      b.attackMask = 0;
      Q.stage(b, 'latticeTell', 66);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'latticeTell' && tick(b, s)) Q.stage(b, 'latticeLive', 230);else if (b.comboState === 'latticeLive') {
        if (api.interval(b, 'latticeSwap', s, 54)) b.attackMask++;
        var pairs = b.attackMask % 2 ? [[0, 2], [2, 4], [4, 0], [1, 3], [3, 5], [5, 1]] : [[0, 3], [1, 4], [2, 5]];
        var seg = pairs.map(function (p) {
          return {
            x1: b.attackZones[p[0]].x,
            y1: b.attackZones[p[0]].y,
            x2: b.attackZones[p[1]].x,
            y2: b.attackZones[p[1]].y
          };
        });
        hitSegments(b, api, seg, 'facet lattice', 8);
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick(),
        pairs = b.attackMask % 2 ? [[0, 2], [2, 4], [4, 0], [1, 3], [3, 5], [5, 1]] : [[0, 3], [1, 4], [2, 5]],
        seg = pairs.map(function (p) {
          return {
            x1: b.attackZones[p[0]].x,
            y1: b.attackZones[p[0]].y,
            x2: b.attackZones[p[1]].x,
            y2: b.attackZones[p[1]].y
          };
        });
      drawSegments(c, seg, b.color, b.comboState === 'latticeLive');
      (b.attackZones || []).forEach(function (z) {
        prism(c, z, t);
      });
    }
  }, {
    name: 'MIRROR PROOF',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 4; i++) {
        var a = i * TAU / 4 + .4,
          p = Q.clampPoint(api, t.x + Math.cos(a) * 480, t.y + Math.sin(a) * 420, 100);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          normal: a + Math.PI / 2,
          index: i
        });
      }
      Q.stage(b, 'proofTell', 64);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'proofTell' && tick(b, s)) Q.stage(b, 'proofFire', 190);else if (b.comboState === 'proofFire') {
        if (api.interval(b, 'proofShard', s, 18)) {
          var z = b.attackZones[b.attackStep++ % b.attackZones.length],
            a = Math.atan2(z.y - b.y, z.x - b.x);
          Q.shot(b, api, b.x, b.y, a, 8, 1.15, 'glassShard', {
            radius: 7,
            life: 390,
            bounce: 2,
            trailMax: 10
          });
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.attackZones || []).forEach(function (z) {
        prism(c, z, t);
        line(c, b.x, b.y, z.x, z.y, b.color, 2, .24, [14, 10]);
      });
    }
  }, {
    name: 'SHATTERED SKY',
    begin: function (b, t, api) {
      for (var i = 0; i < 9; i++) {
        var a = i * 2.27,
          r = 180 + i % 4 * 150,
          p = Q.clampPoint(api, t.x + Math.cos(a) * r, t.y + Math.sin(a) * r, 90);
        b.arenaZones.push({
          x: p.x,
          y: p.y,
          normal: a * .7,
          kind: 'reflector',
          life: 9999,
          index: i
        });
      }
      b.attackStep = 0;
      Q.stage(b, 'skyShatter', 100);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'skyShatter' && tick(b, s)) {
        Q.stage(b, 'shatteredLasers', 260);
        b.stateTimer = 1;
      } else if (b.comboState === 'shatteredLasers' && tick(b, s)) {
        b.attackStep++;
        if (b.attackStep > 4) {
          Q.finish(b, 58);
          return;
        }
        b.attackAngle = aim(b, t) + (b.attackStep - 2) * .33;
        b.stateTimer = 52;
      } else if (b.comboState === 'shatteredLasers') {
        var reflectors = (b.arenaZones || []).filter(function (z) {
            return z.kind === 'reflector';
          }).slice().sort(function (a, z) {
            return Math.hypot(a.x - b.x, a.y - b.y) - Math.hypot(z.x - b.x, z.y - b.y);
          }),
          segments = [],
          x = b.x,
          y = b.y,
          a = b.attackAngle;
        for (var i = 0; i < Math.min(5, reflectors.length); i++) {
          var z = reflectors[(i + b.attackStep) % reflectors.length];
          segments.push({
            x1: x,
            y1: y,
            x2: z.x,
            y2: z.y
          });
          a = reflect(Math.atan2(z.y - y, z.x - x), z.normal);
          x = z.x;
          y = z.y;
        }
        var e = rayBound(x, y, a, api.ARENA - 105);
        segments.push({
          x1: x,
          y1: y,
          x2: e.x,
          y2: e.y
        });
        hitSegments(b, api, segments, 'shattered sky', 10);
        b.stateTimer -= s;
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        t = api.visualTick();
      (b.arenaZones || []).filter(function (z) {
        return z.kind === 'reflector';
      }).forEach(function (z) {
        prism(c, z, t);
      });
      if (b.comboState === 'shatteredLasers') {
        var reflectors = (b.arenaZones || []).filter(function (z) {
            return z.kind === 'reflector';
          }),
          segments = [],
          x = b.x,
          y = b.y,
          a = b.attackAngle;
        for (var i = 0; i < Math.min(5, reflectors.length); i++) {
          var z = reflectors[(i + b.attackStep) % reflectors.length];
          segments.push({
            x1: x,
            y1: y,
            x2: z.x,
            y2: z.y
          });
          a = reflect(Math.atan2(z.y - y, z.x - x), z.normal);
          x = z.x;
          y = z.y;
        }
        var e = rayBound(x, y, a, api.ARENA - 105);
        segments.push({
          x1: x,
          y1: y,
          x2: e.x,
          y2: e.y
        });
        drawSegments(c, segments, b.color, true);
      }
    }
  }];
  Q.register('mirror', {
    attacks: mirrorAttacks,
    distance: 350,
    pacing: [108, 90, 72],
    arenaMode: 'refraction'
  }, 'world/bosses/prism-wyrm');

  /* CIRCUIT TOAD — timing changes; learned beat semantics remain stable. */
  function beatPhase(b, duration) {
    return Math.floor((b.attackAux || 0) / duration) % 4;
  }
  function drawBeat(b, api, duration) {
    var c = api.ctx,
      beat = beatPhase(b, duration);
    c.save();
    c.translate(b.x, b.y - 105);
    c.textAlign = 'center';
    c.font = '16px \"Noto Sans Thai\", \"Ubuntu\", sans-serif';
    for (var i = 0; i < 4; i++) {
      c.fillStyle = i === beat ? '#fff' : 'rgba(85,255,213,.28)';
      c.fillText(String(i + 1), (i - 1.5) * 48, 0);
    }
    c.restore();
  }
  function pads(c, zones, active, t) {
    (zones || []).forEach(function (z, i) {
      c.save();
      c.globalAlpha = z.dead ? .18 : active && z.lit ? .7 : .3;
      c.fillStyle = z.lit ? '#55ffd5' : '#143b36';
      c.strokeStyle = '#dffff7';
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(z.x, z.y, z.radius || 65, (z.radius || 65) * .48, 0, 0, TAU);
      c.fill();
      c.stroke();
      c.restore();
    });
  }
  var neonAttacks = [{
    name: 'FOUR-BEAT HOP',
    begin: function (b, t) {
      b.attackAux = 0;
      b.attackMask = -1;
      b.attackZones = [{
        x: t.x - 250,
        y: t.y - 170,
        radius: 90,
        lit: false
      }, {
        x: t.x + 250,
        y: t.y + 170,
        radius: 90,
        lit: false
      }];
      Q.stage(b, 'fourBeat', 320);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'fourBeat') {
        b.attackAux += s;
        var beat = beatPhase(b, 40);
        if (beat !== b.attackMask) {
          b.attackMask = beat;
          if (beat === 0) {
            b.x += (t.x - b.x) * .45;
            b.y += (t.y - b.y) * .45;
            api.ring(b.x, b.y, b.color, 85, 6);
          } else if (beat === 1) {
            Q.living(api).forEach(function (p) {
              var safe = b.attackZones.some(function (z) {
                return Math.hypot(p.x - z.x, p.y - z.y) < z.radius;
              });
              if (!safe) Q.hitCircle(b, api, p.x, p.y, 2, 1.15, 'electric floor', 0);
            });
            api.ring(0, 0, b.color, 900, 7);
          } else if (beat === 2) Q.fan(b, api, b.x, b.y, aim(b, t), 5, 1.2, 4.4, 1.05, 'tadpole', {
            radius: 6,
            life: 320,
            ghost: true,
            sineAmp: .55,
            sineFreq: .09
          });
        }
        if (tick(b, s)) Q.finish(b, 48);
      }
    },
    draw: function (b, api) {
      drawBeat(b, api, 40);
      pads(api.ctx, b.attackZones, false, api.visualTick());
    }
  }, {
    name: 'TADPOLE SWARM',
    begin: function (b) {
      b.attackAux = 0;
      Q.stage(b, 'tadpoles', 220);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'tadpoles') {
        b.attackAux += s;
        if (api.interval(b, 'tadpoleMeasure', s, 13)) {
          var a = aim(b, t) + (b.attackStep % 7 - 3) * .18;
          Q.shot(b, api, b.x, b.y, a, 5.3, 1.05, 'tadpole', {
            radius: 6,
            life: 330,
            ghost: true,
            sineAmp: .7,
            sineFreq: .11
          });
          b.attackStep++;
        }
        if (tick(b, s)) Q.finish(b, 42);
      }
    },
    draw: function (b, api) {
      drawBeat(b, api, 36);
    }
  }, {
    name: 'LILY SEQUENCER',
    begin: function (b, t) {
      b.attackZones = [];
      for (var i = 0; i < 8; i++) {
        var a = i * TAU / 8,
          r = 330 + i % 2 * 120;
        b.attackZones.push({
          x: t.x + Math.cos(a) * r,
          y: t.y + Math.sin(a) * r,
          radius: 72,
          index: i,
          lit: false
        });
      }
      b.attackStep = 0;
      b.attackAux = 0;
      Q.stage(b, 'lilyLearn', 148);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'lilyLearn') {
        b.attackAux += s;
        var index = Math.min(3, Math.floor(b.attackAux / 34));
        b.attackZones.forEach(function (z) {
          z.lit = false;
        });
        b.attackZones[(index * 3 + 1) % 8].lit = true;
        if (tick(b, s)) {
          b.attackStep = 0;
          Q.stage(b, 'lilyDischarge', 1);
        }
      } else if (b.comboState === 'lilyDischarge' && tick(b, s)) {
        var z = b.attackZones[(b.attackStep * 3 + 1) % 8];
        z.lit = true;
        Q.hitCircle(b, api, z.x, z.y, z.radius, 1.4, 'lily sequencer', 72);
        api.ring(z.x, z.y, '#fff', z.radius + 18, 8);
        b.attackStep++;
        if (b.attackStep >= 4) Q.finish(b, 46);else b.stateTimer = 30;
      }
    },
    draw: function (b, api) {
      pads(api.ctx, b.attackZones, true, api.visualTick());
      drawBeat(b, api, 34);
    }
  }, {
    name: 'SYNCOPATION',
    begin: function (b, t) {
      b.attackAux = 0;
      b.attackMask = -1;
      b.attackZones = [{
        x: t.x - 220,
        y: t.y,
        radius: 78,
        lit: false
      }, {
        x: t.x + 220,
        y: t.y,
        radius: 78,
        lit: false
      }];
      Q.stage(b, 'syncopation', 280);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'syncopation') {
        b.attackAux += s;
        var beat = Math.floor(b.attackAux / 30) % 4;
        if (beat !== b.attackMask) {
          b.attackMask = beat;
          b.attackZones.forEach(function (z, i) {
            z.lit = i === beat % 2;
          });
          if (beat === 0 || beat === 2) Q.nova(b, api, b.x, b.y, 8, 4.7, 1.03, 'pulse', {
            radius: 6,
            life: 250,
            ghost: true
          }, beat * .18);
          if (beat === 1) Q.fan(b, api, b.x, b.y, aim(b, t), 4, .9, 5.2, 1.05, 'tadpole', {
            radius: 6,
            life: 270,
            ghost: true,
            sineAmp: .5,
            sineFreq: .12
          });
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      pads(api.ctx, b.attackZones, true, api.visualTick());
      drawBeat(b, api, 30);
    }
  }, {
    name: 'CHORUS PULSE',
    begin: function (b) {
      b.attackAux = 0;
      b.attackMask = -1;
      Q.stage(b, 'chorus', 280);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'chorus') {
        b.attackAux += s;
        var beat = Math.floor(b.attackAux / 36) % 4;
        if (beat !== b.attackMask) {
          b.attackMask = beat;
          var count = [6, 8, 10, 0][beat];
          if (count) Q.nova(b, api, b.x, b.y, count, 4.2 + beat * .45, 1.05, beat === 2 ? 'tadpole' : 'pulse', {
            radius: 6,
            life: 280,
            ghost: true,
            sineAmp: beat === 2 ? .42 : 0,
            sineFreq: .1
          }, beat * .24);else api.ring(b.x, b.y, '#fff', 170, 6);
        }
        if (tick(b, s)) Q.finish(b, 44);
      }
    },
    draw: function (b, api) {
      drawBeat(b, api, 36);
    }
  }, {
    name: 'DOUBLE TIME',
    begin: function (b, t) {
      b.attackAux = 0;
      b.attackMask = -1;
      b.attackZones = [];
      for (var i = 0; i < 6; i++) {
        var a = i * TAU / 6;
        b.attackZones.push({
          x: Math.cos(a) * 390,
          y: Math.sin(a) * 310,
          radius: 66,
          index: i,
          lit: false
        });
      }
      Q.stage(b, 'doubleTime', 360);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'doubleTime') {
        b.attackAux += s;
        var beat = Math.floor(b.attackAux / 20) % 4;
        if (beat !== b.attackMask) {
          b.attackMask = beat;
          b.attackZones.forEach(function (z, i) {
            z.lit = i % 4 === beat;
          });
          if (beat === 0) {
            b.x += (t.x - b.x) * .32;
            b.y += (t.y - b.y) * .32;
          } else if (beat === 1) b.attackZones.forEach(function (z) {
            if (z.lit) {
              Q.hitCircle(b, api, z.x, z.y, z.radius, 1.2, 'double-time lily', 55);
              api.ring(z.x, z.y, '#fff', z.radius + 15, 6);
            }
          });else if (beat === 2) Q.fan(b, api, b.x, b.y, aim(b, t), 5, 1.0, 5.1, 1.05, 'tadpole', {
            radius: 6,
            life: 260,
            ghost: true,
            sineAmp: .55,
            sineFreq: .13
          });
        }
        if (tick(b, s)) Q.finish(b, 56);
      }
    },
    draw: function (b, api) {
      pads(api.ctx, b.attackZones, true, api.visualTick());
      drawBeat(b, api, 20);
    }
  }];
  Q.register('neon', {
    attacks: neonAttacks,
    distance: 260,
    pacing: [104, 86, 68],
    arenaMode: 'rhythm'
  }, 'world/bosses/circuit-toad');

  /* FURNACE TYRANT — heat defines territory; attacks can forge safety. */
  function magmaArena(b, s, t, api) {
    var zones = b.arenaZones || [];
    zones.forEach(function (z) {
      if (z.kind === 'slagPool' && !z.cooled) Q.living(api).forEach(function (p) {
        if (Math.hypot(p.x - z.x, p.y - z.y) < z.radius && (z.age || 0) % 65 < s) Q.hitCircle(b, api, p.x, p.y, 2, 1.05, 'slag pool', 0);
      });
    });
    if (b.arenaMode === 'meltdown') {
      var base = b.arenaPower || 260;
      Q.living(api).forEach(function (p) {
        var safe = Math.hypot(p.x, p.y) < base || zones.some(function (z) {
          return z.kind === 'safeSlag' && Math.hypot(p.x - z.x, p.y - z.y) < z.radius;
        });
        if (!safe && Q.seeded(Math.floor(api.visualTick() / 40) + (p.slot || 0)) > .72) Q.hitCircle(b, api, p.x, p.y, 2, 1.05, 'meltdown floor', 0);
      });
    }
  }
  function drawMagmaArena(b, api) {
    var c = api.ctx,
      t = api.visualTick();
    (b.arenaZones || []).forEach(function (z) {
      if (z.kind === 'slagPool') {
        c.save();
        c.globalAlpha = .22;
        c.fillStyle = z.cooled ? '#514a42' : '#ff5a28';
        c.beginPath();
        c.arc(z.x, z.y, z.radius, 0, TAU);
        c.fill();
        c.strokeStyle = z.cooled ? '#aaa096' : '#ffd08a';
        c.lineWidth = 4;
        c.stroke();
        c.restore();
      } else if (z.kind === 'safeSlag') {
        c.save();
        c.globalAlpha = .28;
        c.fillStyle = '#dad1bd';
        c.beginPath();
        c.arc(z.x, z.y, z.radius, 0, TAU);
        c.fill();
        c.strokeStyle = '#fff2d0';
        c.lineWidth = 4;
        c.stroke();
        c.restore();
      }
    });
    if (b.arenaMode === 'meltdown') {
      circle(c, 0, 0, b.arenaPower || 260, '#fff2d0', .45, 6);
      c.save();
      c.globalAlpha = .08 + .03 * Math.sin(t * .08);
      c.fillStyle = '#ff431f';
      c.fillRect(-api.ARENA, -api.ARENA, api.ARENA * 2, api.ARENA * 2);
      c.restore();
    }
  }
  function crackBranches(b, api, cx, cy, seed, count) {
    var out = [],
      x = cx,
      y = cy,
      a = seed;
    for (var i = 0; i < count; i++) {
      a += (Q.seeded(seed + i * 1.7) - .5) * .9;
      var len = 130 + Q.seeded(seed + i * 2.1) * 120,
        x2 = api.clamp(x + Math.cos(a) * len, -api.ARENA + 100, api.ARENA - 100),
        y2 = api.clamp(y + Math.sin(a) * len, -api.ARENA + 100, api.ARENA - 100);
      out.push({
        x: (x + x2) / 2,
        y: (y + y2) / 2,
        x1: x,
        y1: y,
        x2: x2,
        y2: y2,
        index: i
      });
      if (i % 3 === 2) {
        x = cx;
        y = cy;
        a += 1.7;
      } else {
        x = x2;
        y = y2;
      }
    }
    return out;
  }
  var magmaAttacks = [{
    name: 'HAMMER AND ANVIL',
    begin: function (b, t, api) {
      b.attackZones = crackBranches(b, api, t.x, t.y, aim(b, t), 13);
      Q.stage(b, 'hammerTell', 66);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'hammerTell' && tick(b, s)) {
        api.ring(t.x, t.y, '#fff', 110, 10);
        Q.stage(b, 'moltenCracks', 140);
      } else if (b.comboState === 'moltenCracks') {
        var p = 1 - b.stateTimer / 140;
        b.attackZones.forEach(function (z, i) {
          if (p > i / b.attackZones.length) Q.hitLine(b, api, z.x1, z.y1, z.x2, z.y2, 11, 1.15, 'molten crack ' + i, 48);
        });
        if (tick(b, s)) Q.finish(b, 46);
      }
    },
    draw: function (b, api) {
      var c = api.ctx,
        p = b.comboState === 'moltenCracks' ? 1 - b.stateTimer / 140 : 0;
      (b.attackZones || []).forEach(function (z, i) {
        line(c, z.x1, z.y1, z.x2, z.y2, p > i / b.attackZones.length ? '#ff8a45' : '#6a3124', p > i / b.attackZones.length ? 10 : 3, p > i / b.attackZones.length ? .68 : .3, [14, 9]);
      });
    }
  }, {
    name: 'FORGED BLADES',
    begin: function (b, t) {
      b.attackZones = [];
      for (var i = -2; i <= 2; i++) {
        var a = aim(b, t) + Math.PI / 2,
          x = t.x + Math.cos(a) * i * 170,
          y = t.y + Math.sin(a) * i * 170;
        b.attackZones.push({
          x1: x - Math.cos(a + Math.PI / 2) * 430,
          y1: y - Math.sin(a + Math.PI / 2) * 430,
          x2: x + Math.cos(a + Math.PI / 2) * 430,
          y2: y + Math.sin(a + Math.PI / 2) * 430,
          index: i + 2
        });
      }
      Q.stage(b, 'channelTell', 78);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'channelTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'bladeRise', 1);
      } else if (b.comboState === 'bladeRise' && tick(b, s)) {
        var z = b.attackZones[b.attackStep++],
          mx = (z.x1 + z.x2) / 2,
          my = (z.y1 + z.y2) / 2,
          a = Math.atan2(z.y2 - z.y1, z.x2 - z.x1);
        for (var k = -3; k <= 3; k++) Q.shot(b, api, mx + Math.cos(a) * k * 110, my + Math.sin(a) * k * 110, a + Math.PI / 2, 0, 1.45, 'forgeBlade', {
          radius: 18,
          life: 54,
          freezeAge: 1,
          ghost: true,
          heavy: true
        });
        Q.hitLine(b, api, z.x1, z.y1, z.x2, z.y2, 22, 1.5, 'forged blade ' + b.attackStep, 75);
        api.beam(z.x1, z.y1, z.x2, z.y2, '#fff2c0', 18);
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 48);else b.stateTimer = 13;
      }
    },
    draw: function (b, api) {
      var c = api.ctx;
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        line(c, z.x1, z.y1, z.x2, z.y2, '#ff9a55', 7, .34, [18, 11]);
      });
    }
  }, {
    name: 'SLAG THROW',
    begin: function (b, t, api) {
      b.attackZones = [];
      for (var i = 0; i < 5; i++) {
        var a = i * 2.2,
          r = 120 + i % 3 * 155,
          p = Q.clampPoint(api, t.x + Math.cos(a) * r, t.y + Math.sin(a) * r, 90);
        b.attackZones.push({
          x: p.x,
          y: p.y,
          index: i,
          radius: 72
        });
      }
      Q.stage(b, 'slagTell', 58);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'slagTell' && tick(b, s)) {
        b.attackZones.forEach(function (z) {
          b.arenaZones.push({
            x: z.x,
            y: z.y,
            radius: z.radius,
            kind: 'slagPool',
            life: 390,
            cool: false
          });
          api.ring(z.x, z.y, b.color, z.radius, 6);
          Q.hitCircle(b, api, z.x, z.y, z.radius, 1.2, 'slag impact', 60);
        });
        Q.stage(b, 'slagHammer', 120);
      } else if (b.comboState === 'slagHammer') {
        if (api.interval(b, 'slagSplash', s, 34)) {
          var pools = b.arenaZones.filter(function (z) {
            return z.kind === 'slagPool' && !z.cooled;
          });
          if (pools.length) {
            var z = pools[b.attackStep++ % pools.length],
              a = aim(z, t);
            Q.fan(b, api, z.x, z.y, a, 5, 1.0, 6.1, 1.05, 'slag', {
              radius: 7,
              life: 230,
              ghost: true
            });
            api.ring(z.x, z.y, '#fff', z.radius + 24, 7);
          }
        }
        if (tick(b, s)) Q.finish(b, 46);
      }
    },
    draw: function (b, api) {
      (b.attackZones || []).forEach(function (z) {
        circle(api.ctx, z.x, z.y, z.radius, b.color, .3, 4);
      });
    }
  }, {
    name: 'QUENCH LINE',
    begin: function (b, t, api) {
      b.attackAngle = aim(b, t) + Math.PI / 2;
      b.attackZones = [];
      for (var i = -2; i <= 2; i++) b.attackZones.push({
        x: t.x + Math.cos(b.attackAngle) * i * 220,
        y: t.y + Math.sin(b.attackAngle) * i * 220,
        index: i + 2
      });
      Q.stage(b, 'quenchTell', 58);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'quenchTell' && tick(b, s)) {
        b.attackStep = 0;
        Q.stage(b, 'quenchLive', 1);
      } else if (b.comboState === 'quenchLive' && tick(b, s)) {
        var z = b.attackZones[b.attackStep++];
        Q.nova(b, api, z.x, z.y, 8, 5.2, 1.05, 'slag', {
          radius: 6,
          life: 230,
          ghost: true
        }, b.attackStep * .2);
        b.arenaZones.push({
          x: z.x,
          y: z.y,
          radius: 85,
          kind: 'safeSlag',
          life: 190
        });
        if (b.attackStep >= b.attackZones.length) Q.finish(b, 48);else b.stateTimer = 18;
      }
    },
    draw: function (b, api) {
      (b.attackZones || []).forEach(function (z, i) {
        if (i < b.attackStep) return;
        circle(api.ctx, z.x, z.y, 85, '#fff2d0', .35, 4);
      });
    }
  }, {
    name: 'CRUCIBLE PRESS',
    begin: function (b, t, api) {
      b.attackX = t.x;
      b.attackZones = [{
        x: -api.ARENA + 150,
        y: t.y
      }, {
        x: api.ARENA - 150,
        y: t.y
      }, {
        x: t.x,
        y: -api.ARENA + 150
      }, {
        x: t.x,
        y: api.ARENA - 150
      }];
      Q.stage(b, 'pressTell', 68);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'pressTell' && tick(b, s)) Q.stage(b, 'pressLive', 170);else if (b.comboState === 'pressLive') {
        var p = 1 - b.stateTimer / 170,
          off = 620 - p * 460;
        Q.hitLine(b, api, b.attackX - off, -api.ARENA, b.attackX - off, api.ARENA, 18, 1.3, 'left crucible', 42);
        Q.hitLine(b, api, b.attackX + off, -api.ARENA, b.attackX + off, api.ARENA, 18, 1.3, 'right crucible', 42);
        if (api.interval(b, 'pressSlag', s, 28)) Q.fan(b, api, b.x, b.y, aim(b, t), 3, .5, 6.6, 1.08, 'slag', {
          radius: 7,
          life: 220,
          ghost: true
        });
        if (tick(b, s)) Q.finish(b, 48);
      }
    },
    draw: function (b, api) {
      var p = 1 - Math.max(0, b.stateTimer) / 170,
        off = 620 - p * 460;
      line(api.ctx, b.attackX - off, -api.ARENA, b.attackX - off, api.ARENA, '#ff9a55', 16, .55);
      line(api.ctx, b.attackX + off, -api.ARENA, b.attackX + off, api.ARENA, '#ff9a55', 16, .55);
    }
  }, {
    name: 'MELTDOWN',
    begin: function (b, t, api) {
      b.arenaMode = 'meltdown';
      b.arenaPower = 720;
      b.attackStep = 0;
      Q.stage(b, 'meltdown', 390);
    },
    update: function (b, s, t, api) {
      if (b.comboState === 'meltdown') {
        var p = 1 - b.stateTimer / 390;
        b.arenaPower = 720 - p * 470;
        if (api.interval(b, 'meltdownHammer', s, 58)) {
          var a = b.attackStep++ * 2.1,
            r = 220 + b.attackStep % 3 * 150,
            x = Math.cos(a) * r,
            y = Math.sin(a) * r;
          Q.hitCircle(b, api, x, y, 78, 1.35, 'meltdown hammer', 70);
          api.ring(x, y, '#fff', 92, 9);
          b.arenaZones.push({
            x: x,
            y: y,
            radius: 105,
            kind: 'safeSlag',
            life: 145
          });
          Q.nova(b, api, x, y, 7, 5.8, 1.05, 'slag', {
            radius: 6,
            life: 220,
            ghost: true
          }, a);
        }
        if (tick(b, s)) {
          b.arenaMode = '';
          b.arenaPower = 0;
          Q.finish(b, 60);
        }
      }
    },
    draw: function (b, api) {
      circle(api.ctx, 0, 0, b.arenaPower || 260, '#fff2d0', .55, 7);
    }
  }];
  Q.register('magma', {
    attacks: magmaAttacks,
    distance: 240,
    pacing: [108, 88, 70],
    arena: magmaArena,
    drawArena: drawMagmaArena,
    arenaMode: 'forge'
  }, 'world/bosses/furnace-tyrant');
})();

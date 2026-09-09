/**
 * Hard Freeze - menu-less debug pause. Dev/local-play only: this file is never read by
 * build.mjs, so `npm run build` (the distributable single-file build) never contains it.
 *
 * Self-contained: knows nothing about Dungeon Knight internals. game.js wires it in with
 * one window.DKFreeze.configure({...}) call and a few window.DKFreeze.register(...) calls.
 * Deleting this file leaves game.js's `window.DKFreeze ? ... : ...` guards as harmless
 * no-ops, so the game still runs unmodified.
 *
 * Solo-only by design: this game's host is authoritative for the whole party's simulation,
 * so freezing the host's loop would stall every connected player, not just the local
 * screen. hooks.isAllowed() gates the hotkey; game.js wires it to networkRole==='local'.
 */
(function () {
    'use strict';

    var CONFIG = {
        keyToggle: 'Backquote',
        keyStep: 'Digit1',
        keyFreeCam: 'Digit2',
        keyOverlay: 'Digit3',
        keySnapshot: 'Digit4',
        maxDumps: 20
    };

    var frozen = false;
    var freeCamActive = false;
    var overlayVisible = true;
    var frame = 0;
    var tick = 0;
    var pendingSteps = 0;
    var providers = {};
    var hooks = {};
    var lastReal = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    var lastSnapshot = null;
    var dumpHistory = [];
    var overlayEl = null;
    var pausedAnimations = [];
    var pausedMedia = [];
    var camKeys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
    var camSpeedPerSecond = 420;

    function isAllowed() { return !hooks.isAllowed || hooks.isAllowed(); }

    function register(key, fn) { providers[key] = fn; }
    function unregister(key) { delete providers[key]; }
    function configure(opts) { hooks = opts || {}; }

    function collect(reason) {
        var out = {};
        Object.keys(providers).forEach(function (key) {
            try { out[key] = providers[key](); }
            catch (e) { out[key] = 'ERROR: ' + e.message; }
        });
        return {
            meta: { frame: frame, tick: tick, time: new Date().toISOString(), reason: reason, frozen: frozen },
            providers: out
        };
    }

    function snapshot(reason) {
        var obj = collect(reason || 'manual');
        var json = JSON.stringify(obj, null, 2);
        lastSnapshot = obj;
        console.log('[FREEZE]', json);
        try {
            dumpHistory.push(json);
            if (dumpHistory.length > CONFIG.maxDumps) dumpHistory.shift();
            localStorage.setItem('__freeze_last__', json);
        } catch (e) { /* private mode / storage full */ }
        return obj;
    }

    function freeze(reason) {
        if (frozen || !isAllowed()) return;
        frozen = true;
        if (document.getAnimations) {
            pausedAnimations = document.getAnimations().filter(function (a) { return a.playState === 'running'; });
            pausedAnimations.forEach(function (a) { try { a.pause(); } catch (e) {} });
        }
        pausedMedia = Array.prototype.slice.call(document.querySelectorAll('video, audio')).filter(function (m) { return !m.paused; });
        pausedMedia.forEach(function (m) { try { m.pause(); } catch (e) {} });
        if (hooks.onFreeze) hooks.onFreeze();
        snapshot(reason || 'hotkey');
        console.log('[freeze] FROZEN at frame ' + frame + ' / tick ' + tick);
    }

    function thaw() {
        if (!frozen) return;
        frozen = false;
        freeCamActive = false;
        pendingSteps = 0;
        pausedAnimations.forEach(function (a) { try { a.play(); } catch (e) {} });
        pausedAnimations = [];
        pausedMedia.forEach(function (m) { try { m.play().catch(function () {}); } catch (e) {} });
        pausedMedia = [];
        if (hooks.onThaw) hooks.onThaw();
        console.log('[freeze] resumed at frame ' + frame);
    }

    function toggle() {
        if (frozen) { thaw(); return; }
        if (!isAllowed()) {
            console.log('[freeze] unavailable: Hard Freeze only runs in Single Player (freezing the host would stall the whole party). Current role: ' + (hooks.roleLabel ? hooks.roleLabel() : 'networked'));
            return;
        }
        freeze('hotkey');
    }

    function step(n) {
        if (!frozen) return;
        pendingSteps += Math.max(1, Number(n) || 1);
        console.log('[freeze] step -> frame ' + (frame + pendingSteps));
    }

    function forceThaw() { if (frozen) thaw(); }

    /** Call once per rAF frame. Returns {frozen, steps} for this frame; steps resets after read. */
    function tick_(now) {
        var real = now - lastReal;
        lastReal = now;
        if (!isFinite(real) || real < 0) real = 0;
        real = Math.min(real, 100);

        if (frozen && freeCamActive && hooks.setCameraOffset) {
            var zoom = (hooks.getZoom ? hooks.getZoom() : 1) || 1;
            var speed = (camSpeedPerSecond / zoom) * (real / 1000);
            var dx = 0, dy = 0;
            if (camKeys.ArrowLeft) dx -= speed;
            if (camKeys.ArrowRight) dx += speed;
            if (camKeys.ArrowUp) dy -= speed;
            if (camKeys.ArrowDown) dy += speed;
            if (dx || dy) hooks.setCameraOffset(dx, dy);
        }

        frame++;
        var steps = frozen ? pendingSteps : 0;
        pendingSteps = 0;
        if (steps > 0) tick += steps;

        drawOverlay(real);
        return { frozen: frozen, steps: steps };
    }

    function drawOverlay(realDeltaMs) {
        if (!overlayEl) return;
        if (!overlayVisible) { overlayEl.style.display = 'none'; return; }
        overlayEl.style.display = 'block';
        overlayEl.style.opacity = frozen ? '0.9' : '0.35';
        var fps = 1000 / Math.max(1, realDeltaMs);
        var lines = [];
        if (frozen) lines.push('● HARD FREEZE  (` to resume)');
        lines.push('frame ' + frame + '   tick ' + tick + '   ' + fps.toFixed(0) + ' rt-fps');
        if (frozen) lines.push(freeCamActive ? 'free-cam ON · arrows pan' : '1 step · 2 free-cam · 3 overlay · 4 dump');
        overlayEl.textContent = lines.join('\n');
    }

    function installOverlay() {
        var el = document.createElement('div');
        el.id = '__dk_freeze_overlay__';
        var style = el.style;
        style.position = 'fixed'; style.top = '8px'; style.left = '8px'; style.zIndex = '2147483647';
        style.pointerEvents = 'none';
        style.font = '11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace';
        style.color = '#9fe'; style.textShadow = '0 0 3px #000, 0 0 3px #000';
        style.whiteSpace = 'pre'; style.opacity = '0.35';
        document.body.appendChild(el);
        overlayEl = el;
    }

    function installKeys() {
        window.addEventListener('keydown', function (e) {
            if (e.repeat) return;
            var handled = true;
            switch (e.code) {
                case CONFIG.keyToggle: toggle(); break;
                case CONFIG.keyStep: step(1); break;
                case CONFIG.keyFreeCam: freeCamActive = !freeCamActive; break;
                case CONFIG.keyOverlay: overlayVisible = !overlayVisible; break;
                case CONFIG.keySnapshot: snapshot('hotkey'); break;
                case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight':
                    if (frozen && freeCamActive) camKeys[e.code] = true; else handled = false;
                    break;
                default:
                    // Menu-less rule: while frozen, swallow every other key so a stray
                    // input cannot mutate the state being inspected.
                    handled = frozen;
            }
            if (handled) { e.preventDefault(); e.stopPropagation(); }
        }, { capture: true });

        window.addEventListener('keyup', function (e) {
            if (Object.prototype.hasOwnProperty.call(camKeys, e.code)) {
                var wasActive = frozen && freeCamActive;
                camKeys[e.code] = false;
                if (wasActive) { e.preventDefault(); e.stopPropagation(); }
            }
        }, { capture: true });
    }

    installOverlay();
    installKeys();
    console.log('[freeze] Hard Freeze ready (Single Player only) — ` freeze/unfreeze · 1 step · 2 free-cam · 3 overlay · 4 dump snapshot');

    window.DKFreeze = {
        register: register,
        unregister: unregister,
        configure: configure,
        freeze: freeze,
        thaw: thaw,
        toggle: toggle,
        step: step,
        snapshot: snapshot,
        tick: tick_,
        forceThaw: forceThaw,
        isAllowed: isAllowed,
        get frozen() { return frozen; },
        get last() { return lastSnapshot; }
    };
}());

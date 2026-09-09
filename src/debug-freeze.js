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

    // Each action carries an F-key alternate: Backquote and the digit row move under
    // non-US layouts and some remote/virtual keyboards report code:"" entirely, while
    // F-keys report their code everywhere. F5/F10/F11/F12 are left alone (browser-reserved).
    // An F-key reports the same string as both code and key, so it appears in both lists.
    var ACTIONS = [
        { name: 'toggle',   codes: ['Backquote', 'F9'], keys: ['`', '~', 'F9'] },
        { name: 'step',     codes: ['Digit1', 'F8'],    keys: ['1', 'F8'] },
        { name: 'freecam',  codes: ['Digit2', 'F7'],    keys: ['2', 'F7'] },
        { name: 'overlay',  codes: ['Digit3', 'F6'],    keys: ['3', 'F6'] },
        { name: 'snapshot', codes: ['Digit4', 'F4'],    keys: ['4', 'F4'] }
    ];
    var ARROW_CODES = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    var CONFIG = { maxDumps: 20 };

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
        if (frozen) lines.push('● HARD FREEZE  (` or F9 to resume)');
        lines.push('frame ' + frame + '   tick ' + tick + '   ' + fps.toFixed(0) + ' rt-fps');
        if (frozen) lines.push(freeCamActive ? 'free-cam ON · arrows pan' : '1/F8 step · 2/F7 cam · 3/F6 overlay · 4/F4 dump');
        else lines.push('` or F9 = hard freeze');
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

    /** Never touch keystrokes meant for a text field or for the game's key-rebinding capture. */
    function isTextEntry(e) {
        if (document.body && document.body.hasAttribute('data-keybind-capture')) return true;
        var t = e.target;
        if (!t) return false;
        if (t.isContentEditable) return true;
        var tag = t.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    }

    function resolveAction(e) {
        for (var i = 0; i < ACTIONS.length; i++) {
            if (ACTIONS[i].codes.indexOf(e.code) >= 0) return ACTIONS[i].name;
            // key is only consulted when the browser gave no usable code, so a layout
            // that puts a different character on the physical key still resolves by code.
            if (!e.code && ACTIONS[i].keys.indexOf(e.key) >= 0) return ACTIONS[i].name;
        }
        return '';
    }

    function arrowOf(e) {
        if (ARROW_CODES.indexOf(e.code) >= 0) return e.code;
        if (!e.code && ARROW_CODES.indexOf(e.key) >= 0) return e.key;
        return '';
    }

    function installKeys() {
        window.addEventListener('keydown', function (e) {
            if (e.repeat || e.isComposing || e.keyCode === 229 || isTextEntry(e)) return;
            var handled = true;
            var arrow = arrowOf(e);
            switch (arrow ? 'arrow' : resolveAction(e)) {
                case 'toggle': toggle(); break;
                case 'step': step(1); break;
                case 'freecam': freeCamActive = !freeCamActive; break;
                case 'overlay': overlayVisible = !overlayVisible; break;
                case 'snapshot': snapshot('hotkey'); break;
                case 'arrow':
                    if (frozen && freeCamActive) camKeys[arrow] = true; else handled = false;
                    break;
                default:
                    // Menu-less rule: while frozen, swallow every other key so a stray
                    // input cannot mutate the state being inspected.
                    handled = frozen;
            }
            if (handled) { e.preventDefault(); e.stopPropagation(); }
        }, { capture: true });

        window.addEventListener('keyup', function (e) {
            var arrow = arrowOf(e);
            if (arrow && Object.prototype.hasOwnProperty.call(camKeys, arrow)) {
                var wasActive = frozen && freeCamActive;
                camKeys[arrow] = false;
                if (wasActive) { e.preventDefault(); e.stopPropagation(); }
            }
        }, { capture: true });
    }

    installOverlay();
    installKeys();
    console.log('[freeze] Hard Freeze ready (Single Player only) — ` or F9 freeze/unfreeze · 1/F8 step · 2/F7 free-cam · 3/F6 overlay · 4/F4 dump snapshot');

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

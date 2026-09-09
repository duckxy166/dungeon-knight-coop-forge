(function () {
    'use strict';

    var MENU_TRANSITION_MS = 300;
    var SETTINGS_TRANSITION_MS = 240;
    var inputMode = 'mouse';

    function byId(id) { return document.getElementById(id); }
    function read(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (error) { return fallback; } }
    function write(key, value) { try { localStorage.setItem(key, value); } catch (error) {} }
    function readJson(key, fallback) { try { var value = JSON.parse(localStorage.getItem(key)); return value && typeof value === 'object' ? value : fallback; } catch (error) { return fallback; } }
    function setText(id, value) { var node = byId(id); if (node) node.textContent = String(value == null ? '' : value); }
    function padded(value) { value = String(value == null ? '' : value); return /^\d$/.test(value) ? '0' + value : value; }
    function isTypingTarget(target) { return !!(target && (/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName) || target.isContentEditable)); }

    var settingState = {
        uiScale: read('dungeonKnightUiScale', '1'),
        hudOpacity: read('dungeonKnightHudOpacity', '.78'),
        motion: read('dungeonKnightUiMotion', 'full'),
        cameraZoom: read('dungeonKnightCameraZoom', '1'),
        resolution: read('dungeonKnightRenderScale', '1'),
        mobileAttack: read('dungeonKnightMobileAttack', 'button'),
        mobileScale: read('dungeonKnightMobileScale', '1'),
        mobileOpacity: read('dungeonKnightMobileOpacity', '.82'),
        frameLimit: read('dungeonKnightFrameLimit', '60'),
        effectQuality: read('dungeonKnightEffectQuality', 'balanced'),
        damageNumbers: read('dungeonKnightDamageNumbers', 'all'),
        playerNames: read('dungeonKnightPlayerNames', 'on'),
        debugMode: read('dungeonKnightDebugMode', 'off'),
        autoPause: read('dungeonKnightAutoPause', 'on')
    };

    function applyVisualSettings() {
        document.documentElement.style.setProperty('--ui-scale', settingState.uiScale);
        document.documentElement.style.setProperty('--hud-opacity', settingState.hudOpacity);
        document.documentElement.style.setProperty('--mobile-control-scale', settingState.mobileScale);
        document.documentElement.style.setProperty('--mobile-control-opacity', settingState.mobileOpacity);
        if (document.body) {
            document.body.setAttribute('data-ui-motion', settingState.motion);
            document.body.setAttribute('data-mobile-attack', settingState.mobileAttack);
            document.body.setAttribute('data-effect-quality', settingState.effectQuality);
            document.body.setAttribute('data-damage-numbers', settingState.damageNumbers);
            document.body.setAttribute('data-player-names', settingState.playerNames);
            document.body.setAttribute('data-debug-mode', settingState.debugMode);
        }
        var debugOverlay = byId('debug-overlay');
        if (debugOverlay) debugOverlay.hidden = settingState.debugMode === 'off';
        if (window.DKGame && typeof window.DKGame.configureRuntimeSettings === 'function') window.DKGame.configureRuntimeSettings(settingState);
    }
    applyVisualSettings();

    var root = byId('start-screen');
    if (!root) return;

    var panels = {
        main: 'main-menu',
        modes: 'mode-menu',
        settings: 'settings-menu',
        stats: 'stats-menu',
        mods: 'mods-menu',
        quit: 'quit-menu'
    };
    var currentMenuView = root.getAttribute('data-menu-view') || 'main';
    var menuTransitionTimer = 0;

    function panel(name) { return byId(panels[name]); }
    function cleanupMenuMotion(node) {
        if (!node) return;
        node.classList.remove('is-entering-forward', 'is-entering-back', 'is-leaving-forward', 'is-leaving-back');
    }
    function focusFirstIn(node) {
        if (!node || inputMode !== 'keyboard') return;
        var first = node.querySelector('button:not([disabled]), select:not([disabled]), input:not([disabled])');
        if (first) window.setTimeout(function () { first.focus(); }, 20);
    }
    function show(name, direction) {
        name = panels[name] ? name : 'main';
        direction = direction || (name === 'main' ? 'back' : 'forward');
        window.clearTimeout(menuTransitionTimer);

        var oldName = currentMenuView;
        var oldPanel = panel(oldName);
        var nextPanel = panel(name);
        Object.keys(panels).forEach(function (key) {
            var node = panel(key);
            if (node && node !== oldPanel && node !== nextPanel) {
                cleanupMenuMotion(node);
                node.setAttribute('aria-hidden', 'true');
            }
        });

        if (oldPanel && oldPanel !== nextPanel) {
            cleanupMenuMotion(oldPanel);
            oldPanel.classList.add(direction === 'back' ? 'is-leaving-back' : 'is-leaving-forward');
            oldPanel.setAttribute('aria-hidden', 'true');
        }
        if (nextPanel) {
            cleanupMenuMotion(nextPanel);
            nextPanel.setAttribute('aria-hidden', 'false');
            void nextPanel.offsetWidth;
            nextPanel.classList.add(direction === 'back' ? 'is-entering-back' : 'is-entering-forward');
        }

        currentMenuView = name;
        root.setAttribute('data-menu-view', name);
        root.setAttribute('data-menu-direction', direction);
        focusFirstIn(nextPanel);
        menuTransitionTimer = window.setTimeout(function () {
            cleanupMenuMotion(oldPanel);
            cleanupMenuMotion(nextPanel);
        }, MENU_TRANSITION_MS + 40);
    }

    var lastActionSoundTime = 0;
    function playActionSound(soundId) {
        var now = performance.now();
        if (now - lastActionSoundTime < 60) return;
        lastActionSoundTime = now;
        if (window.DKAudio) window.DKAudio.play(soundId);
    }

    var lastChangeSoundTime = 0;
    function playChangeSound() {
        var now = performance.now();
        if (now - lastChangeSoundTime < 80) return;
        lastChangeSoundTime = now;
        if (window.DKAudio) window.DKAudio.play('ui.change');
    }

    function press(button, callback) {
        if (!button) return;
        button.addEventListener('click', function () {
            if (button.disabled) return;
            button.classList.add('is-pressed');
            var isBack = button.hasAttribute('data-menu-back') || button.classList.contains('menu-back-btn') || button.classList.contains('pause-back-btn');
            playActionSound(isBack ? 'ui.back' : 'ui.confirm');
            window.setTimeout(function () {
                button.classList.remove('is-pressed');
                if (callback) callback();
            }, 105);
        });
    }

    var lastFocusTime = 0;
    document.addEventListener('focusin', function (event) {
        var target = event.target;
        if (target && (target.tagName === 'BUTTON' || (target.classList && (target.classList.contains('settings-category') || target.classList.contains('cinematic-menu-btn'))))) {
            var now = performance.now();
            if (now - lastFocusTime > 70) {
                lastFocusTime = now;
                if (window.DKAudio) window.DKAudio.play('ui.focus');
            }
        }
    });

    var multiplayerMenuButton = byId('multiplayer-menu-btn');
    var onlineModeButton = byId('online-mode-btn');
    if (multiplayerMenuButton && onlineModeButton && onlineModeButton.disabled) {
        multiplayerMenuButton.disabled = true;
        multiplayerMenuButton.title = onlineModeButton.title || 'Multiplayer requires the included server.';
    }
    press(byId('play-menu-btn'), function () {
        var target = byId('local-mode-btn');
        if (target) target.click();
    });
    press(byId('multiplayer-menu-btn'), function () {
        var target = onlineModeButton;
        if (target && !target.disabled) target.click();
    });
    press(byId('settings-menu-btn'), function () { show('settings', 'forward'); });
    press(byId('stats-menu-btn'), function () { refreshStats(); show('stats', 'forward'); });
    press(byId('mods-menu-btn'), function () { if (window.DKMods && window.DKMods.render) window.DKMods.render(); show('mods', 'forward'); });
    press(byId('quit-menu-btn'), function () { show('quit', 'forward'); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-menu-back]'), function (button) {
        press(button, function () {
            if (currentMenuView === 'mods' && window.DKMods && typeof window.DKMods.restartIfRequired === 'function' && window.DKMods.restartIfRequired()) return;
            show('main', 'back');
        });
    });
    press(byId('quit-confirm-btn'), function () {
        setText('quit-note', 'If this window stays open, close the tab to quit.');
        try { window.close(); } catch (error) {}
    });

    var settingsCategories = Array.prototype.slice.call(document.querySelectorAll('[data-settings-category]'));
    var settingsPanels = Array.prototype.slice.call(document.querySelectorAll('[data-settings-panel]'));
    var activeSettingsCategory = 'general';
    var settingsTransitionTimer = 0;

    function setSettingsCategory(name, animate) {
        var oldPanel = settingsPanels.find(function (item) { return item.getAttribute('data-settings-panel') === activeSettingsCategory; });
        var nextPanel = settingsPanels.find(function (item) { return item.getAttribute('data-settings-panel') === name; });
        if (!nextPanel || name === activeSettingsCategory) return;
        window.clearTimeout(settingsTransitionTimer);
        if (animate !== false) playActionSound('ui.tab');

        settingsCategories.forEach(function (button) {
            var selected = button.getAttribute('data-settings-category') === name;
            button.classList.toggle('active', selected);
            button.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        if (oldPanel) {
            oldPanel.classList.remove('is-entering');
            oldPanel.classList.add('is-leaving');
            oldPanel.setAttribute('aria-hidden', 'true');
        }
        nextPanel.classList.remove('is-leaving');
        nextPanel.setAttribute('aria-hidden', 'false');
        nextPanel.classList.add('active');
        if (animate !== false) {
            void nextPanel.offsetWidth;
            nextPanel.classList.add('is-entering');
        }
        activeSettingsCategory = name;
        settingsTransitionTimer = window.setTimeout(function () {
            settingsPanels.forEach(function (item) {
                item.classList.remove('is-entering', 'is-leaving');
                item.classList.toggle('active', item.getAttribute('data-settings-panel') === activeSettingsCategory);
            });
        }, SETTINGS_TRANSITION_MS + 30);
    }

    settingsCategories.forEach(function (button) {
        button.addEventListener('click', function () { setSettingsCategory(button.getAttribute('data-settings-category'), true); });
    });

    var classScreen = byId('class-screen');
    var classFocus = byId('class-focus');
    function syncClassFocus(card, animate) {
        if (!card || !classScreen || !classFocus) return;
        var id = card.getAttribute('data-class') || 'independent';
        var number = card.getAttribute('data-number') || '04';
        var name = card.querySelector('.class-choice-copy strong');
        var role = card.querySelector('.class-choice-copy small');
        var hp = card.querySelector('[data-source-hp]');
        var armor = card.querySelector('[data-source-armor]');
        var mana = card.querySelector('[data-source-mana]');
        var trait = card.querySelector('[data-source-trait]');
        var desc = card.querySelector('[data-source-desc]');
        classScreen.setAttribute('data-class-focus', id);
        setText('class-focus-index', number);
        setText('class-focus-name', name && name.textContent);
        setText('class-focus-role', role && role.textContent);
        setText('class-focus-hp', padded(hp && hp.textContent));
        setText('class-focus-armor', padded(armor && armor.textContent));
        setText('class-focus-mana', mana && mana.textContent);
        setText('class-focus-trait', trait && trait.textContent);
        setText('class-focus-desc', desc && desc.textContent);
        setText('class-visual-code', 'Class ' + number);
        if (animate) {
            classFocus.classList.remove('is-changing');
            void classFocus.offsetWidth;
            classFocus.classList.add('is-changing');
            window.setTimeout(function () { classFocus.classList.remove('is-changing'); }, 260);
        }
    }
    var classCards = document.querySelectorAll('.class-card');
    Array.prototype.forEach.call(classCards, function (card) {
        card.addEventListener('click', function () { syncClassFocus(card, true); });
    });
    syncClassFocus(document.querySelector('.class-card.selected') || classCards[0], false);
    document.addEventListener('DOMContentLoaded', function () {
        syncClassFocus(document.querySelector('.class-card.selected') || classCards[0], false);
    }, { once: true });

    var language = byId('language-select');
    if (language && window.DKI18n) {
        language.value = window.DKI18n.locale();
        language.addEventListener('change', function () { window.DKI18n.setLocale(language.value); });
    }

    function updateSettingOutput(control) {
        if (!control) return;
        var output = byId(control.getAttribute('data-output'));
        if (output) output.textContent = Math.round(Number(control.value) * 100) + '%';
    }
    function listen(control, callback) {
        if (!control) return;
        control.addEventListener(control.type === 'range' ? 'input' : 'change', callback);
    }
    function bindPair(mainId, pauseId, key, storageKey, apply) {
        var main = byId(mainId);
        var pause = pauseId && byId(pauseId);
        [main, pause].forEach(function (control) {
            if (!control) return;
            control.value = settingState[key];
            updateSettingOutput(control);
        });
        function changed(event) {
            settingState[key] = event.target.value;
            write(storageKey, settingState[key]);
            [main, pause].forEach(function (control) {
                if (!control) return;
                if (control !== event.target) control.value = settingState[key];
                updateSettingOutput(control);
            });
            playChangeSound();
            if (apply) apply(event.target);
        }
        listen(main, changed);
        listen(pause, changed);
    }

    bindPair('menu-ui-scale-select', 'pause-ui-scale-select', 'uiScale', 'dungeonKnightUiScale', applyVisualSettings);
    bindPair('menu-hud-opacity-select', 'pause-hud-opacity-select', 'hudOpacity', 'dungeonKnightHudOpacity', applyVisualSettings);
    bindPair('menu-motion-select', 'pause-motion-select', 'motion', 'dungeonKnightUiMotion', applyVisualSettings);
    bindPair('menu-resolution-select', 'resolution-select', 'resolution', 'dungeonKnightRenderScale', function (source) {
        var pause = byId('resolution-select');
        if (pause && source !== pause) pause.dispatchEvent(new Event('change', { bubbles: true }));
    });
    bindPair('menu-mobile-attack-select', 'pause-mobile-attack-select', 'mobileAttack', 'dungeonKnightMobileAttack', applyVisualSettings);
    bindPair('menu-mobile-scale-select', null, 'mobileScale', 'dungeonKnightMobileScale', applyVisualSettings);
    bindPair('menu-mobile-opacity-select', null, 'mobileOpacity', 'dungeonKnightMobileOpacity', applyVisualSettings);
    bindPair('menu-frame-limit-select', 'pause-frame-limit-select', 'frameLimit', 'dungeonKnightFrameLimit', applyVisualSettings);
    bindPair('menu-effect-quality-select', 'pause-effect-quality-select', 'effectQuality', 'dungeonKnightEffectQuality', applyVisualSettings);
    bindPair('menu-damage-numbers-select', 'pause-damage-numbers-select', 'damageNumbers', 'dungeonKnightDamageNumbers', applyVisualSettings);
    bindPair('menu-player-names-select', 'pause-player-names-select', 'playerNames', 'dungeonKnightPlayerNames', applyVisualSettings);
    bindPair('menu-debug-mode-select', 'pause-debug-mode-select', 'debugMode', 'dungeonKnightDebugMode', applyVisualSettings);
    bindPair('menu-auto-pause-select', null, 'autoPause', 'dungeonKnightAutoPause', applyVisualSettings);

    bindPair('menu-camera-zoom-select', 'pause-camera-zoom-select', 'cameraZoom', 'dungeonKnightCameraZoom', function (source) {
        if (window.DKGame && typeof window.DKGame.setCameraZoom === 'function') window.DKGame.setCameraZoom(source.value);
    });

    var windowMode = byId('menu-window-mode-select');
    if (windowMode) {
        windowMode.value = document.fullscreenElement ? 'fullscreen' : 'windowed';
        windowMode.addEventListener('change', function () {
            if (windowMode.value === 'fullscreen' && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(function () { windowMode.value = 'windowed'; });
            } else if (windowMode.value === 'windowed' && document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen();
            }
        });
        document.addEventListener('fullscreenchange', function () {
            windowMode.value = document.fullscreenElement ? 'fullscreen' : 'windowed';
        });
    }

    function bindAudioVolume(mainId, pauseId, bus) {
        var main = byId(mainId);
        var pause = pauseId && byId(pauseId);
        var initial = window.DKAudio ? window.DKAudio.getBusVolume(bus) : 0.8;
        [main, pause].forEach(function (control) {
            if (!control) return;
            control.value = initial;
            updateSettingOutput(control);
        });
        function changed(event) {
            var val = parseFloat(event.target.value) || 0;
            if (window.DKAudio) window.DKAudio.setBusVolume(bus, val);
            [main, pause].forEach(function (control) {
                if (!control) return;
                if (control !== event.target) control.value = val;
                updateSettingOutput(control);
            });
            playChangeSound();
        }
        listen(main, changed);
        listen(pause, changed);
    }
    bindAudioVolume('menu-master-volume-select', 'pause-master-volume-select', 'master');
    bindAudioVolume('menu-combat-volume-select', 'pause-sfx-volume-select', 'combat');
    bindAudioVolume('menu-ui-volume-select', null, 'ui');
    bindAudioVolume('menu-world-volume-select', null, 'world');
    bindAudioVolume('menu-music-volume-select', null, 'music');

    var muteSelect = byId('menu-mute-audio-select');
    if (muteSelect) {
        muteSelect.value = (window.DKAudio && window.DKAudio.isBusMuted('master')) ? 'on' : 'off';
        muteSelect.addEventListener('change', function () {
            var isMuted = muteSelect.value === 'on';
            if (window.DKAudio) window.DKAudio.setBusMuted('master', isMuted);
            playChangeSound();
        });
    }

    var reset = byId('reset-ui-settings-btn');
    if (reset) press(reset, function () {
        settingState = { uiScale: '1', hudOpacity: '.78', motion: 'full', cameraZoom: '1', resolution: '1', mobileAttack: 'button', mobileScale: '1', mobileOpacity: '.82', frameLimit: '60', effectQuality: 'balanced', damageNumbers: 'all', playerNames: 'on', debugMode: 'off', autoPause: 'on' };
        write('dungeonKnightUiScale', '1');
        write('dungeonKnightHudOpacity', '.78');
        write('dungeonKnightUiMotion', 'full');
        write('dungeonKnightCameraZoom', '1');
        write('dungeonKnightRenderScale', '1');
        write('dungeonKnightMobileAttack', 'button');
        write('dungeonKnightMobileScale', '1');
        write('dungeonKnightMobileOpacity', '.82');
        write('dungeonKnightFrameLimit', '60');
        write('dungeonKnightEffectQuality', 'balanced');
        write('dungeonKnightDamageNumbers', 'all');
        write('dungeonKnightPlayerNames', 'on');
        write('dungeonKnightDebugMode', 'off');
        write('dungeonKnightAutoPause', 'on');
        applyVisualSettings();
        if (window.DKAudio) {
            window.DKAudio.setBusVolume('master', 0.8);
            window.DKAudio.setBusVolume('combat', 0.7);
            window.DKAudio.setBusVolume('ui', 0.45);
            window.DKAudio.setBusVolume('world', 0.4);
            window.DKAudio.setBusVolume('music', 0.3);
            window.DKAudio.setBusMuted('master', false);
            ['menu-master-volume-select', 'pause-master-volume-select'].forEach(function (id) { var n = byId(id); if (n) { n.value = 0.8; updateSettingOutput(n); } });
            ['menu-combat-volume-select', 'pause-sfx-volume-select'].forEach(function (id) { var n = byId(id); if (n) { n.value = 0.7; updateSettingOutput(n); } });
            var mui = byId('menu-ui-volume-select'); if (mui) { mui.value = 0.45; updateSettingOutput(mui); }
            var mworld = byId('menu-world-volume-select'); if (mworld) { mworld.value = 0.4; updateSettingOutput(mworld); }
            var mmusic = byId('menu-music-volume-select'); if (mmusic) { mmusic.value = 0.3; updateSettingOutput(mmusic); }
            if (muteSelect) muteSelect.value = 'off';
        }
        ['menu-ui-scale-select', 'pause-ui-scale-select'].forEach(function (id) { var node = byId(id); if (node) { node.value = '1'; updateSettingOutput(node); } });
        ['menu-hud-opacity-select', 'pause-hud-opacity-select'].forEach(function (id) { var node = byId(id); if (node) { node.value = '.78'; updateSettingOutput(node); } });
        ['menu-motion-select', 'pause-motion-select'].forEach(function (id) { var node = byId(id); if (node) node.value = 'full'; });
        ['menu-resolution-select', 'resolution-select', 'menu-camera-zoom-select', 'pause-camera-zoom-select'].forEach(function (id) { var node = byId(id); if (node) { node.value = '1'; updateSettingOutput(node); } });
        if (window.DKGame && typeof window.DKGame.setCameraZoom === 'function') window.DKGame.setCameraZoom(1);
        ['menu-mobile-attack-select', 'pause-mobile-attack-select'].forEach(function (id) { var node = byId(id); if (node) node.value = 'button'; });
        ['menu-mobile-scale-select'].forEach(function (id) { var node = byId(id); if (node) { node.value = '1'; updateSettingOutput(node); } });
        ['menu-mobile-opacity-select'].forEach(function (id) { var node = byId(id); if (node) { node.value = '.82'; updateSettingOutput(node); } });
        ['menu-frame-limit-select', 'pause-frame-limit-select'].forEach(function (id) { var node = byId(id); if (node) node.value = '60'; });
        ['menu-effect-quality-select', 'pause-effect-quality-select'].forEach(function (id) { var node = byId(id); if (node) node.value = 'balanced'; });
        ['menu-damage-numbers-select', 'pause-damage-numbers-select'].forEach(function (id) { var node = byId(id); if (node) node.value = 'all'; });
        ['menu-player-names-select', 'pause-player-names-select', 'menu-auto-pause-select'].forEach(function (id) { var node = byId(id); if (node) node.value = 'on'; });
        ['menu-debug-mode-select', 'pause-debug-mode-select'].forEach(function (id) { var node = byId(id); if (node) node.value = 'off'; });
    });

    var DEFAULT_KEYBINDS = {
        moveUp:'KeyW', moveDown:'KeyS', moveLeft:'KeyA', moveRight:'KeyD', attack:'Mouse0',
        dash:'Space', ability:'KeyE', switchWeapon:'KeyQ', inventory:'KeyI', pause:'KeyP'
    };
    var keybindCaptureAction = '';
    var localKeybinds = Object.assign({}, DEFAULT_KEYBINDS, readJson('dungeonKnightKeybinds', {}));

    function currentKeybinds() {
        if (window.DKGame && typeof window.DKGame.getKeybindings === 'function') return window.DKGame.getKeybindings();
        return Object.assign({}, localKeybinds);
    }
    function keyLabel(code) {
        code = String(code || '');
        if (/^Mouse\d+$/.test(code)) return 'Mouse ' + (Number(code.slice(5)) + 1);
        if (code === 'Space') return 'Space';
        if (code === 'Escape') return 'Esc';
        if (code.indexOf('Key') === 0) return code.slice(3);
        if (code.indexOf('Digit') === 0) return code.slice(5);
        if (code.indexOf('Arrow') === 0) return code.slice(5) + ' Arrow';
        return code.replace(/Left$|Right$/g, '') || '—';
    }
    function renderKeybinds() {
        var bindings = currentKeybinds();
        Array.prototype.forEach.call(document.querySelectorAll('[data-keybind-action]'), function (button) {
            var action = button.getAttribute('data-keybind-action');
            button.textContent = action === keybindCaptureAction ? localized('Press a key…') : keyLabel(bindings[action]);
            button.classList.toggle('is-capturing', action === keybindCaptureAction);
        });
        var swapLabel = byId('swap-key-label');
        if (swapLabel) swapLabel.textContent = keyLabel(bindings.switchWeapon);
    }
    function beginKeybindCapture(action) {
        keybindCaptureAction = action;
        document.body.setAttribute('data-keybind-capture', action);
        renderKeybinds();
    }
    function finishKeybindCapture(code) {
        if (!keybindCaptureAction) return;
        var action = keybindCaptureAction;
        keybindCaptureAction = '';
        document.body.removeAttribute('data-keybind-capture');
        if (code) {
            if (window.DKGame && typeof window.DKGame.setKeybinding === 'function') window.DKGame.setKeybinding(action, code);
            else {
                var displaced = Object.keys(localKeybinds).find(function (name) { return name !== action && localKeybinds[name] === code; });
                if (displaced) localKeybinds[displaced] = localKeybinds[action];
                localKeybinds[action] = code;
                write('dungeonKnightKeybinds', JSON.stringify(localKeybinds));
            }
        }
        renderKeybinds();
    }
    Array.prototype.forEach.call(document.querySelectorAll('[data-keybind-action]'), function (button) {
        button.addEventListener('click', function () { beginKeybindCapture(button.getAttribute('data-keybind-action')); });
    });
    window.addEventListener('keydown', function (event) {
        if (!keybindCaptureAction || event.isComposing || event.keyCode === 229) return;
        event.preventDefault(); event.stopImmediatePropagation();
        if (event.code === 'Escape') finishKeybindCapture('');
        else if (!/^Control|^Shift|^Alt|^Meta/.test(event.code)) finishKeybindCapture(event.code);
    }, true);
    window.addEventListener('pointerdown', function (event) {
        if (!keybindCaptureAction || event.pointerType !== 'mouse') return;
        event.preventDefault(); event.stopImmediatePropagation();
        finishKeybindCapture('Mouse' + event.button);
    }, true);
    var resetKeybinds = byId('reset-keybinds-btn');
    if (resetKeybinds) resetKeybinds.addEventListener('click', function () {
        if (window.DKGame && typeof window.DKGame.resetKeybindings === 'function') window.DKGame.resetKeybindings();
        else { localKeybinds = Object.assign({}, DEFAULT_KEYBINDS); write('dungeonKnightKeybinds', JSON.stringify(localKeybinds)); }
        renderKeybinds();
    });
    renderKeybinds();

    var DEFAULT_MOBILE_LAYOUT = { moveX:.15, moveY:.78, actionX:.84, actionY:.76 };
    var mobileLayout = Object.assign({}, DEFAULT_MOBILE_LAYOUT, readJson('dungeonKnightMobileLayout', {}));
    var layoutDrag = null;
    function clampLayout(value, min, max) { value = Number(value); return Math.max(min, Math.min(max, isFinite(value) ? value : min)); }
    function normalizeMobileLayout() {
        mobileLayout.moveX = clampLayout(mobileLayout.moveX, .09, .45);
        mobileLayout.moveY = clampLayout(mobileLayout.moveY, .34, .88);
        mobileLayout.actionX = clampLayout(mobileLayout.actionX, .55, .91);
        mobileLayout.actionY = clampLayout(mobileLayout.actionY, .30, .86);
    }
    function applyMobileLayout(save) {
        normalizeMobileLayout();
        var style = document.documentElement.style;
        style.setProperty('--move-control-left', Math.round(mobileLayout.moveX * 10000) / 100 + '%');
        style.setProperty('--move-control-top', Math.round(mobileLayout.moveY * 10000) / 100 + '%');
        style.setProperty('--action-control-left', Math.round(mobileLayout.actionX * 10000) / 100 + '%');
        style.setProperty('--action-control-top', Math.round(mobileLayout.actionY * 10000) / 100 + '%');
        if (save) write('dungeonKnightMobileLayout', JSON.stringify(mobileLayout));
    }
    function openMobileLayoutEditor() {
        var editor = byId('mobile-layout-editor');
        if (!editor) return;
        editor.hidden = false;
        document.body.setAttribute('data-mobile-layout-edit', 'true');
        applyMobileLayout(false);
    }
    function closeMobileLayoutEditor() {
        var editor = byId('mobile-layout-editor');
        if (editor) editor.hidden = true;
        document.body.removeAttribute('data-mobile-layout-edit');
        layoutDrag = null;
        applyMobileLayout(true);
    }
    function resetMobileLayout() { mobileLayout = Object.assign({}, DEFAULT_MOBILE_LAYOUT); applyMobileLayout(true); }
    ['customize-mobile-layout-btn', 'pause-customize-mobile-layout-btn'].forEach(function (id) { var node = byId(id); if (node) node.addEventListener('click', openMobileLayoutEditor); });
    ['reset-mobile-layout-btn', 'mobile-layout-reset-btn'].forEach(function (id) { var node = byId(id); if (node) node.addEventListener('click', resetMobileLayout); });
    var layoutDone = byId('mobile-layout-done-btn');
    if (layoutDone) layoutDone.addEventListener('click', closeMobileLayoutEditor);
    document.addEventListener('pointerdown', function (event) {
        if (!document.body.hasAttribute('data-mobile-layout-edit')) return;
        var moveTarget = event.target.closest && event.target.closest('#joystick-zone');
        var actionTarget = event.target.closest && event.target.closest('.action-group');
        if (!moveTarget && !actionTarget) return;
        event.preventDefault(); event.stopImmediatePropagation();
        var target = moveTarget || actionTarget;
        if (target.setPointerCapture) try { target.setPointerCapture(event.pointerId); } catch (error) {}
        layoutDrag = { id:event.pointerId, kind:moveTarget ? 'move' : 'action', target:target };
    }, true);
    window.addEventListener('pointermove', function (event) {
        if (!layoutDrag || event.pointerId !== layoutDrag.id) return;
        event.preventDefault(); event.stopImmediatePropagation();
        var controls = byId('mobile-controls');
        var bounds = controls ? controls.getBoundingClientRect() : { left:0, top:0, width:window.innerWidth, height:window.innerHeight };
        var x = (event.clientX - bounds.left) / Math.max(1, bounds.width);
        var y = (event.clientY - bounds.top) / Math.max(1, bounds.height);
        if (layoutDrag.kind === 'move') { mobileLayout.moveX = x; mobileLayout.moveY = y; }
        else { mobileLayout.actionX = x; mobileLayout.actionY = y; }
        applyMobileLayout(false);
    }, true);
    function endLayoutDrag(event) {
        if (!layoutDrag || event.pointerId !== layoutDrag.id) return;
        event.preventDefault(); event.stopImmediatePropagation();
        if (layoutDrag.target && layoutDrag.target.releasePointerCapture) try { layoutDrag.target.releasePointerCapture(event.pointerId); } catch (error) {}
        layoutDrag = null; applyMobileLayout(true);
    }
    window.addEventListener('pointerup', endLayoutDrag, true);
    window.addEventListener('pointercancel', endLayoutDrag, true);
    applyMobileLayout(false);

    function copyDiagnostics() {
        var report = window.DKGame && typeof window.DKGame.diagnosticReport === 'function' ? window.DKGame.diagnosticReport() : 'Dungeon Knight diagnostics are not ready.';
        var done = function (ok) {
            if (window.DKGame && typeof window.DKGame.toast === 'function') window.DKGame.toast(localized(ok ? 'Diagnostic report copied.' : 'Could not copy automatically.'), ok ? '#bdf7ce' : '#ffb1b1');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(report).then(function () { done(true); }, function () { done(false); });
        else done(false);
    }
    var copyDiagnosticsButton = byId('copy-diagnostics-btn');
    if (copyDiagnosticsButton) copyDiagnosticsButton.addEventListener('click', copyDiagnostics);
    applyVisualSettings();

    var pauseScreen = byId('pause-screen');
    var pauseView = 'main';
    function refreshPauseStats() {
        var state = window.DK_DEBUG && typeof window.DK_DEBUG.state === 'function' ? window.DK_DEBUG.state() : null;
        setText('pause-stat-wave', state ? 'Wave ' + state.wave : (byId('wave-display') && byId('wave-display').textContent));
        setText('pause-stat-enemies', state ? 'Enemies ' + state.enemies : (byId('enemy-display') && byId('enemy-display').textContent));
        setText('pause-stat-class', state ? state.className : 'Current class');
    }
    function showPauseView(name, animate) {
        if (!pauseScreen) return;
        var next = pauseScreen.querySelector('[data-pause-panel="' + name + '"]');
        if (!next) name = 'main';
        if (pauseView !== name && animate !== false) playActionSound('ui.tab');
        pauseView = name;
        pauseScreen.setAttribute('data-pause-view', name);
        Array.prototype.forEach.call(pauseScreen.querySelectorAll('[data-pause-panel]'), function (node) {
            var active = node.getAttribute('data-pause-panel') === name;
            node.setAttribute('aria-hidden', active ? 'false' : 'true');
            node.classList.toggle('is-entering', active && animate !== false);
            if (active && animate !== false) window.setTimeout(function () { node.classList.remove('is-entering'); }, MENU_TRANSITION_MS);
        });
        if (name === 'statistics') refreshPauseStats();
        focusFirstIn(pauseScreen.querySelector('[data-pause-panel="' + name + '"]'));
    }
    press(byId('pause-settings-open-btn'), function () { showPauseView('settings', true); });
    press(byId('pause-statistics-open-btn'), function () { showPauseView('statistics', true); });
    press(byId('pause-settings-back-btn'), function () { showPauseView('main', true); });
    press(byId('pause-statistics-back-btn'), function () { showPauseView('main', true); });
    if (pauseScreen && typeof MutationObserver !== 'undefined') {
        new MutationObserver(function () {
            if (pauseScreen.style.display === 'flex') showPauseView('main', false);
        }).observe(pauseScreen, { attributes: true, attributeFilter: ['style'] });
    }

    var waitingScreen = byId('waiting-screen');
    var waitingUiToggle = byId('waiting-ui-toggle');
    function localized(value) { return window.DKI18n && typeof window.DKI18n.t === 'function' ? window.DKI18n.t(value) : value; }
    function setWaitingUiHidden(hidden) {
        if (!waitingScreen || !waitingUiToggle) return;
        hidden = !!hidden;
        waitingScreen.setAttribute('data-ui-hidden', hidden ? 'true' : 'false');
        waitingUiToggle.setAttribute('aria-pressed', hidden ? 'true' : 'false');
        waitingUiToggle.textContent = localized(hidden ? 'Show UI' : 'Hide UI');
    }
    if (waitingUiToggle) waitingUiToggle.addEventListener('click', function () {
        setWaitingUiHidden(waitingScreen && waitingScreen.getAttribute('data-ui-hidden') !== 'true');
    });
    setWaitingUiHidden(false);

    function activeMenuControls() {
        var activePanel = panel(currentMenuView);
        if (!activePanel) return [];
        return Array.prototype.slice.call(activePanel.querySelectorAll('button:not([disabled]), select:not([disabled]), input:not([disabled])')).filter(function (node) {
            return node.offsetParent !== null;
        });
    }
    function activePauseControls() {
        if (!pauseScreen) return [];
        var activePanel = pauseScreen.querySelector('[data-pause-panel="' + pauseView + '"]');
        return activePanel ? Array.prototype.slice.call(activePanel.querySelectorAll('button:not([disabled]), select:not([disabled]), input:not([disabled])')).filter(function (node) { return node.offsetParent !== null; }) : [];
    }
    function moveFocus(controls, delta) {
        if (!controls.length) return;
        var index = controls.indexOf(document.activeElement);
        index = index < 0 ? (delta > 0 ? -1 : 0) : index;
        controls[(index + delta + controls.length) % controls.length].focus();
    }
    function screenVisible(node) { return !!(node && window.getComputedStyle(node).display !== 'none'); }

    document.addEventListener('pointerdown', function (event) {
        inputMode = 'mouse';
        var button = event.target && event.target.closest ? event.target.closest('button,.class-card,.inventory-entry,.craft-recipe-entry') : null;
        if (button) button.classList.add('ui-pressed');
    });
    function releasePressed() {
        Array.prototype.forEach.call(document.querySelectorAll('.ui-pressed'), function (node) {
            window.setTimeout(function () { node.classList.remove('ui-pressed'); }, 90);
        });
    }
    document.addEventListener('pointerup', releasePressed);
    document.addEventListener('pointercancel', releasePressed);
    document.addEventListener('keydown', function (event) {
        if (event.isComposing || event.keyCode === 229) return;
        inputMode = 'keyboard';
        var key = event.key.toLowerCase();
        if (screenVisible(root)) {
            if (key === 'escape' && currentMenuView !== 'main') {
                event.preventDefault();
                if (currentMenuView === 'mods' && window.DKMods && typeof window.DKMods.restartIfRequired === 'function' && window.DKMods.restartIfRequired()) return;
                show('main', 'back');
                return;
            }
            if (!isTypingTarget(event.target) && (key === 'arrowdown' || key === 's')) {
                event.preventDefault(); moveFocus(activeMenuControls(), 1); return;
            }
            if (!isTypingTarget(event.target) && (key === 'arrowup' || key === 'w')) {
                event.preventDefault(); moveFocus(activeMenuControls(), -1); return;
            }
        }
        if (screenVisible(pauseScreen)) {
            if (key === 'escape') {
                event.preventDefault();
                if (pauseView !== 'main') showPauseView('main', true);
                else if (byId('resume-btn')) byId('resume-btn').click();
                return;
            }
            if (!isTypingTarget(event.target) && (key === 'arrowdown' || key === 's')) {
                event.preventDefault(); moveFocus(activePauseControls(), 1); return;
            }
            if (!isTypingTarget(event.target) && (key === 'arrowup' || key === 'w')) {
                event.preventDefault(); moveFocus(activePauseControls(), -1);
            }
        }
    });

    function refreshStats() {
        var content = window.DKContent || {};
        setText('menu-weapon-count', Object.keys(content.weapons || {}).length);
        setText('menu-boss-count', Object.keys(content.bosses || {}).length);
    }
    refreshStats();

    window.DKUI = {
        showMainMenu: function () { show('main', 'back'); },
        showMenuView: show,
        showPauseView: showPauseView,
        setSettingsCategory: setSettingsCategory,
        setWaitingUiHidden: setWaitingUiHidden,
        refreshStats: refreshStats
    };
}());

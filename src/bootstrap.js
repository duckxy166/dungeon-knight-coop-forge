(function () {
    'use strict';

    var content = (window.DK_CONTENT_MANIFEST || []).map(function (path) {
        return { path:path, optional:path.indexOf('/weapons/') >= 0 };
    });
    var preRuntime = [
        'src/bundles/en.js',
        'src/bundles/th-weapons.js',
        'src/bundles/th.js',
        'examples/mods/japanese-localization/main.js',
        'src/mods.js'
    ].map(function (path) { return { path:path, optional:false }; });
    var runtime = [
        'src/audio.js',
        'src/i18n.js',
        'src/net.js',
        'src/time.js',
        'src/debug-freeze.js',
        'src/game.js',
        'src/lobby.js',
        'src/ui.js',
        'src/editor.js'
    ].map(function (path) { return { path:path, optional:false }; });
    var loader = window.DKLoader;
    var baseFiles = 9;
    var totalScripts = content.length + preRuntime.length + runtime.length + 1;

    if (loader) loader.configure(baseFiles + totalScripts, baseFiles);

    function labelFor(path) {
        var name = String(path || '').split('/').pop().replace(/\.js$/i, '').replace(/[-_]+/g, ' ');
        return 'Loading ' + name;
    }

    function load(entry) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = entry.path;
            script.async = false;
            script.onload = function () {
                if (loader) loader.step(labelFor(entry.path));
                resolve(entry.path);
            };
            script.onerror = function () {
                if (entry.optional) {
                    console.warn('[DKContent] Optional module skipped:', entry.path);
                    if (loader) loader.step('Skipping optional content');
                    resolve(entry.path);
                } else reject(new Error('Required module failed: ' + entry.path));
            };
            document.head.appendChild(script);
        });
    }

    function loadBatch(entries) {
        // async=false preserves execution order while network requests overlap.
        return Promise.all(entries.map(load));
    }

    window.DK_BOOT_PROMISE = loadBatch(content)
        .then(function () { return load({path:'src/render3d.bundle.js',optional:false}); })
        .then(function () { window.DK3D.captureBuiltins(); })
        .then(function () { return loadBatch(preRuntime); })
        .then(function () {
            if (window.DKMods && typeof window.DKMods.bootstrap === 'function') return window.DKMods.bootstrap();
        })
        .then(function () { return loadBatch(runtime); })
        .then(function () {
            if (window.DKMods && typeof window.DKMods.ready === 'function') window.DKMods.ready();
            if (loader) loader.finish();
        })
        .catch(function (error) {
            console.error('[Dungeon Knight]', error);
            if (loader) loader.fail('Could not load ' + String(error.message || 'a required game file'));
            throw error;
        });
}());

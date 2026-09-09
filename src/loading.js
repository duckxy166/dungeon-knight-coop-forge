(function () {
    'use strict';

    var screen = document.getElementById('loading-screen');
    var countNode = document.getElementById('loading-count');
    var progressNode = document.getElementById('loading-progress');
    var statusNode = document.getElementById('loading-status');
    var loaded = 0;
    var total = 52;
    var finished = false;
    var locale = 'en';
    try { locale = localStorage.getItem('dungeonKnightLocale') || 'en'; } catch (error) {}
    var loadingCopy = locale === 'th' ? {
        lang:'th', loading:'กำลังโหลดไฟล์เกม', content:'กำลังโหลดเนื้อหาเกม', failed:'โหลดไฟล์เกมที่จำเป็นไม่สำเร็จ', ready:'พร้อม'
    } : locale === 'ja' ? {
        lang:'ja', loading:'ゲームファイルを読み込んでいます', content:'ゲームコンテンツを読み込んでいます', failed:'必要なゲームファイルを読み込めませんでした', ready:'準備完了'
    } : null;
    if (loadingCopy) {
        document.documentElement.lang = loadingCopy.lang;
        if (statusNode) statusNode.textContent = loadingCopy.loading;
    }

    function paint() {
        var safeTotal = Math.max(1, total);
        var safeLoaded = Math.min(safeTotal, Math.max(0, loaded));
        if (countNode) countNode.textContent = safeLoaded + ' / ' + safeTotal;
        if (progressNode) progressNode.style.transform = 'scaleX(' + (safeLoaded / safeTotal) + ')';
    }

    function configure(nextTotal, alreadyLoaded) {
        total = Math.max(1, Number(nextTotal) || total);
        loaded = Math.min(total, Math.max(0, Number(alreadyLoaded) || 0));
        paint();
    }

    function step(label) {
        loaded = Math.min(total, loaded + 1);
        if (statusNode && label) statusNode.textContent = loadingCopy ? loadingCopy.content : label;
        paint();
    }

    function fail(message) {
        if (!screen) return;
        screen.classList.add('has-error');
        if (statusNode) statusNode.textContent = loadingCopy ? loadingCopy.failed : (message || 'A required game file could not be loaded');
        screen.setAttribute('aria-label', 'Dungeon Knight failed to load');
    }

    function finish() {
        if (finished) return;
        finished = true;
        loaded = total;
        if (statusNode) statusNode.textContent = loadingCopy ? loadingCopy.ready : 'Ready';
        paint();
        var reveal = function () {
            if (!screen) return;
            screen.classList.add('is-complete');
            document.documentElement.classList.add('game-loaded');
            window.setTimeout(function () {
                if (screen && screen.parentNode) screen.parentNode.removeChild(screen);
            }, 420);
        };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { requestAnimationFrame(function () { requestAnimationFrame(reveal); }); });
        else requestAnimationFrame(function () { requestAnimationFrame(reveal); });
    }

    paint();
    window.DKLoader = { configure: configure, step: step, finish: finish, fail: fail };
}());

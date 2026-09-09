(function () {
    'use strict';
    var STORAGE_KEY = 'dungeonKnightLocale';
    var bundles = window.DK_BUNDLES || {};
    var saved = 'en';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (error) {}
    var current = bundles[saved] ? saved : 'en';
    function bundle() { return bundles[current] || bundles.en || { text: {}, descriptions: {} }; }
    function translateCore(value) {
        if (current === 'en') return value;
        var direct = bundle().text && bundle().text[value];
        if (direct) return direct;
        var formatter = bundle().format;
        if (typeof formatter === 'function') {
            var formatted = formatter(value);
            if (formatted != null && formatted !== value) return formatted;
        }
        if (current !== 'th') return value;
        var match;
        if ((match = /^BEST WAVE (\d+) · HIGH SCORE (\d+)$/.exec(value))) return 'เวฟสูงสุด ' + match[1] + ' · คะแนนสูงสุด ' + match[2];
        if ((match = /^WAVE (\d+)$/.exec(value))) return 'เวฟ ' + match[1];
        if ((match = /^WAVE (\d+) · PHASE (\d+)$/.exec(value))) return 'เวฟ ' + match[1] + ' · เฟส ' + match[2];
        if ((match = /^WAVE (\d+) · PHASE (\d+)\/(\d+)$/.exec(value))) return 'เวฟ ' + match[1] + ' · เฟส ' + match[2] + '/' + match[3];
        if ((match = /^ENEMIES (\d+)$/.exec(value))) return 'ศัตรู ' + match[1];
        if ((match = /^ENEMIES (\d+) · PHASE (\d+)\/(\d+)$/.exec(value))) return 'ศัตรู ' + match[1] + ' · เฟส ' + match[2] + '/' + match[3];
        if ((match = /^SCORE (\d+)$/.exec(value))) return 'คะแนน ' + match[1];
        if ((match = /^COINS (\d+)$/.exec(value))) return 'เหรียญ ' + match[1];
        if ((match = /^ARMOR (.+)$/.exec(value))) return 'เกราะ ' + match[1];
        if ((match = /^MANA (.+)$/.exec(value))) return 'มานา ' + match[1];
        if ((match = /^\+(.+) MANA$/.exec(value))) return '+มานา ' + match[1];
        if ((match = /^HP (.+)$/.exec(value))) return 'พลังชีวิต ' + match[1];
        if ((match = /^PHASE (.+)$/.exec(value))) return 'เฟส ' + match[1];
        if ((match = /^UPGRADE (.+) TO LV (\d+)$/.exec(value))) return 'อัปเกรด ' + match[1] + ' เป็น LV ' + match[2];
        if ((match = /^(\d+) COINS · FIRE \/ E$/.exec(value))) return match[1] + ' เหรียญ · ยิง / E';
        if ((match = /^NEED (\d+) COINS$/.exec(value))) return 'ต้องใช้ ' + match[1] + ' เหรียญ';
        if ((match = /^BUY (\d+)$/.exec(value))) return 'ซื้อ ' + match[1];
        if ((match = /^UPGRADE (\d+)$/.exec(value))) return 'อัปเกรด ' + match[1];
        if ((match = /^ARMORY AT WAVE (\d+)$/.exec(value))) return 'คลังสรรพาวุธเปิดเมื่อถึงเวฟ ' + match[1];
        if ((match = /^DESCEND TO WAVE (\d+)$/.exec(value))) return 'ลงสู่เวฟ ' + match[1];
        if ((match = /^ROOM (.+) · (20|30) HZ · HOST$/.exec(value))) return 'ห้อง ' + match[1] + ' · ' + match[2] + ' HZ · โฮสต์';
        if ((match = /^ROOM (.+) · (20|30) HZ · WAITING FOR HOST$/.exec(value))) return 'ห้อง ' + match[1] + ' · ' + match[2] + ' HZ · รอโฮสต์';
        if ((match = /^Best wave (\d+) · High score (\d+)$/.exec(value))) return 'เวฟสูงสุด ' + match[1] + ' · คะแนนสูงสุด ' + match[2];
        if ((match = /^Wave (\d+)$/.exec(value))) return 'เวฟ ' + match[1];
        if ((match = /^Enemies (\d+)$/.exec(value))) return 'ศัตรู ' + match[1];
        if ((match = /^Coins (\d+)$/.exec(value))) return 'เหรียญ ' + match[1];
        if ((match = /^Room (.+) · (20|30) Hz · Host$/.exec(value))) return 'ห้อง ' + match[1] + ' · ' + match[2] + ' Hz · โฮสต์';
        if ((match = /^Room (.+) · (20|30) Hz · Waiting for host$/.exec(value))) return 'ห้อง ' + match[1] + ' · ' + match[2] + ' Hz · รอโฮสต์';
        if ((match = /^CASTING · (.+)$/.exec(value))) return 'กำลังร่าย · ' + match[1];
        if ((match = /^CHARGING · (.+)$/.exec(value))) return 'กำลังพุ่ง · ' + match[1];
        if ((match = /^NEXT · (.+)$/.exec(value))) return 'ท่าถัดไป · ' + match[1];
        if ((match = /^RESOLUTION (\d+)%$/.exec(value))) return 'ความละเอียด ' + match[1] + '%';
        if ((match = /^CAMERA ZOOM (\d+)%$/.exec(value))) return 'ระยะกล้อง ' + match[1] + '%';
        if ((match = /^REROLL (\d+)$/.exec(value))) return 'สุ่มใหม่ ' + match[1];
        if ((match = /^WAITING (\d+)\/(\d+)$/.exec(value))) return 'รอผู้เล่น ' + match[1] + '/' + match[2];
        if ((match = /^(\d+)P · OPEN SLOT$/.exec(value))) return match[1] + 'P · ว่าง';
        if ((match = /^(.+) FORGED TO LV (\d+)$/.exec(value))) return match[1] + ' · อัปเกรดเป็น LV ' + match[2];
        if ((match = /^(.+) · CALIBRATED TO LV (\d+)$/.exec(value))) return match[1] + ' · ปรับแต่งเป็น LV ' + match[2];
        if ((match = /^FOCUS · (.+)$/.exec(value))) return 'สูตรที่เลือก · ' + match[1];
        if ((match = /^MISSING · (.+)$/.exec(value))) return 'ขาด · ' + match[1];
        if ((match = /^(.+) · CRAFTED$/.exec(value))) return match[1] + ' · สร้างสำเร็จ';
        if ((match = /^(.+) ACQUIRED$/.exec(value))) return match[1] + ' · ได้รับแล้ว';
        if ((match = /^(.+) STORED IN INVENTORY$/.exec(value))) return match[1] + ' · เก็บไว้ในกระเป๋า';
        if ((match = /^(.+) (EQUIPPED|LEARNED|SWORN)$/.exec(value))) return match[1] + (match[2] === 'EQUIPPED' ? ' · สวมใส่แล้ว' : match[2] === 'LEARNED' ? ' · เรียนรู้แล้ว' : ' · ทำพันธสัญญาแล้ว');
        if ((match = /^(.+) REMEMBERED · ARMORY OPEN$/.exec(value))) return 'จดจำ ' + match[1] + ' แล้ว · คลังสรรพาวุธเปิด';
        if ((match = /^LV (\d+) · (\d+)S COOLDOWN · (.+)$/.exec(value))) return 'LV ' + match[1] + ' · คูลดาวน์ ' + match[2] + ' วิ · ' + match[3];
        if ((match = /^LV (\d+) · READY · (.+)$/.exec(value))) return 'LV ' + match[1] + ' · พร้อมใช้ · ' + match[2];
        if ((match = /^WAVE (\d+) · (.+)$/.exec(value))) return 'เวฟ ' + match[1] + ' · ' + translateCore(match[2]);
        if ((match = /^(.+) · (Left|Defeated) in (.+) · (\d+) enemies felled$/.exec(value))) return translateCore(match[1]) + ' · ' + (match[2] === 'Left' ? 'ออกจาก' : 'พ่ายแพ้ใน') + ' ' + translateCore(match[3]) + ' · กำจัดศัตรู ' + match[4] + ' ตัว';
        return value;
    }
    function t(value) { return translateCore(String(value == null ? '' : value)); }
    function shouldSkip(node) {
        var element = node && (node.nodeType === 1 ? node : node.parentElement);
        if (!element || !element.closest) return false;
        return !!element.closest('[data-i18n-lock],script,style,textarea,#weapon-name,#editor-test-name,.editor-weapon-name');
    }
    function translateTextNode(node) {
        if (!node || shouldSkip(node)) return;
        var source = node.nodeValue;
        if (!source || !source.trim()) return;
        var trimmed = source.trim();
        var translated = translateCore(trimmed);
        if (translated !== trimmed) node.nodeValue = source.replace(trimmed, translated);
    }
    function translateTree(root) {
        if (!root || current === 'en') return;
        if (root.nodeType === 3) { translateTextNode(root); return; }
        if (root.nodeType !== 1 && root.nodeType !== 9) return;
        if (shouldSkip(root)) return;
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        var node;
        while ((node = walker.nextNode())) translateTextNode(node);
        if (root.querySelectorAll) Array.prototype.forEach.call(root.querySelectorAll('[placeholder]'), function (input) {
            var translated = translateCore(input.getAttribute('placeholder') || '');
            if (translated) input.setAttribute('placeholder', translated);
        });
    }
    function applyDescriptions() {
        var content = window.DKContent;
        if (!content) return;
        var data = bundle().descriptions || {};
        ['activeSkills','passiveSkills','pacts','stats'].forEach(function (group) {
            Object.keys(content[group] || {}).forEach(function (id) {
                var item = content[group][id];
                if (!item) return;
                if (!item._bundleOriginalDesc) item._bundleOriginalDesc = item.desc || '';
                item.desc = current === 'en' ? item._bundleOriginalDesc : ((data[group] && data[group][id]) || item._bundleOriginalDesc);
            });
        });
        Object.keys(content.weapons || {}).forEach(function (id) {
            var weapon = content.weapons[id];
            if (!weapon) return;
            if (!weapon._bundleOriginalDesc) weapon._bundleOriginalDesc = weapon.desc || '';
            weapon.desc = current === 'en' ? weapon._bundleOriginalDesc : (bundle().describeWeapon ? bundle().describeWeapon(weapon,id) : weapon._bundleOriginalDesc);
        });
    }
    function refreshLocales() {
        var language = document.getElementById('language-select');
        if (!language) return;
        var selected = current;
        language.innerHTML = '';
        Object.keys(bundles).sort(function (a,b) {
            if (a === 'en') return -1; if (b === 'en') return 1;
            if (a === 'th') return -1; if (b === 'th') return 1;
            return String((bundles[a]&&bundles[a].label)||a).localeCompare(String((bundles[b]&&bundles[b].label)||b));
        }).forEach(function (locale) {
            var option = document.createElement('option');
            option.value = locale;
            option.textContent = (bundles[locale] && bundles[locale].label) || locale;
            language.appendChild(option);
        });
        language.value = bundles[selected] ? selected : 'en';
    }
    function applyLocaleStyle() {
        var root = document.documentElement, data = bundle();
        root.lang = current;
        if (data && data.fontFamily) root.style.setProperty('--font-ui', data.fontFamily);
        else root.style.removeProperty('--font-ui');
    }
    function init() {
        applyLocaleStyle();
        refreshLocales();
        applyDescriptions();
        translateTree(document.body);
        var language = document.getElementById('language-select');
        if (language) language.value = current;
        if (typeof MutationObserver !== 'undefined') {
            new MutationObserver(function (records) {
                records.forEach(function (record) {
                    if (record.type === 'characterData') translateTextNode(record.target);
                    Array.prototype.forEach.call(record.addedNodes || [], translateTree);
                });
            }).observe(document.body, { childList: true, subtree: true, characterData: true });
        }
    }
    function setLocale(locale) {
        if (!bundles[locale]) return false;
        try { localStorage.setItem(STORAGE_KEY, locale); } catch (error) {}
        if (locale === current) return true;
        location.reload();
        return true;
    }
    window.DKI18n = { locale: function () { return current; }, bundle: bundle, t: t, setLocale: setLocale, apply: init, applyDescriptions: applyDescriptions, refreshLocales: refreshLocales, applyLocaleStyle: applyLocaleStyle };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else window.setTimeout(init, 0);
}());

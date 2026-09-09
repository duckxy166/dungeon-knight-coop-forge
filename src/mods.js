(function () {
    'use strict';

    var GAME_VERSION = '1.9.2';
    var DB_NAME = 'DungeonKnightMods';
    var DB_VERSION = 1;
    var STORE = 'mods';
    var MAX_FILES = 256;
    var MAX_TOTAL_BYTES = 8 * 1024 * 1024;
    var MAX_FILE_BYTES = 2 * 1024 * 1024;
    var SCRIPT_TYPES = /(?:javascript|ecmascript|text\/plain)/i;
    var TEXT_EXT = /\.(?:js|mjs|cjs|json|txt|md|css|html|xml|csv|yml|yaml)$/i;
    var listeners = Object.create(null);
    var ruleValues = Object.create(null);
    var installed = [];
    var loaded = Object.create(null);
    var loadErrors = Object.create(null);
    var reloadRequired = false;
    var dbPromise = null;
    var pendingWrites = Object.create(null);
    // Content Manager icons are transient; mod asset URLs returned by DK.files.url()
    // must remain valid for the lifetime of the page. Keeping those lifecycles
    // separate prevents opening/rendering the Content Manager from revoking a
    // gameplay asset that a mod is still using.
    var uiObjectUrls = [];
    var modAssetUrls = Object.create(null);

    function log() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[DKMods]');
        console.log.apply(console, args);
    }
    function warn() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[DKMods]');
        console.warn.apply(console, args);
    }
    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
            return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char];
        });
    }
    function normalizePath(path) {
        var value = String(path || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
        var parts = [];
        value.split('/').forEach(function (part) {
            if (!part || part === '.') return;
            if (part === '..') { parts.pop(); return; }
            parts.push(part);
        });
        return parts.join('/');
    }
    function fileName(path) { var parts = normalizePath(path).split('/'); return parts[parts.length - 1] || ''; }
    function mimeFor(path, fallback) {
        if (fallback) return fallback;
        var ext = (fileName(path).split('.').pop() || '').toLowerCase();
        return ({ png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', gif:'image/gif', svg:'image/svg+xml', js:'text/javascript', mjs:'text/javascript', json:'application/json', css:'text/css', txt:'text/plain', md:'text/markdown', wav:'audio/wav', ogg:'audio/ogg', mp3:'audio/mpeg' })[ext] || 'application/octet-stream';
    }
    function byteLengthText(text) {
        try { return new TextEncoder().encode(String(text)).byteLength; }
        catch (error) { return unescape(encodeURIComponent(String(text))).length; }
    }
    function fileBytes(file) {
        if (!file) return 0;
        if (file.text != null) return byteLengthText(file.text);
        if (file.data && typeof file.data.byteLength === 'number') return file.data.byteLength;
        return Number(file.size) || 0;
    }
    function bytesOf(file) {
        if (file && file.text != null) return new TextEncoder().encode(String(file.text));
        if (file && file.data instanceof ArrayBuffer) return new Uint8Array(file.data);
        if (file && file.data && file.data.buffer instanceof ArrayBuffer) return new Uint8Array(file.data.buffer, file.data.byteOffset || 0, file.data.byteLength || file.data.buffer.byteLength);
        return new Uint8Array(0);
    }
    function storedFileFromBytes(path, bytes, mime) {
        var type = mimeFor(path, mime), copy = bytes instanceof Uint8Array ? bytes.slice() : new Uint8Array(bytes || 0);
        if (SCRIPT_TYPES.test(type) || TEXT_EXT.test(path) || /json|text|xml|yaml|markdown|css|html/i.test(type)) {
            try { return toStoredFile(path, new TextDecoder().decode(copy), type); } catch (error) {}
        }
        return toStoredFile(path, copy.buffer, type);
    }
    function safeArchivePath(path) {
        var raw = String(path || '').replace(/\\/g, '/').replace(/^\.\//, '');
        if (!raw || raw.charAt(0) === '/' || /^[A-Za-z]:\//.test(raw) || raw.split('/').some(function (part) { return part === '..'; })) throw new Error('ZIP contains an unsafe file path: ' + raw);
        return normalizePath(raw);
    }
    function concatBytes(parts, total) {
        if (total == null) total = parts.reduce(function (sum, part) { return sum + part.byteLength; }, 0);
        var out = new Uint8Array(total), offset = 0;
        parts.forEach(function (part) { out.set(part, offset); offset += part.byteLength; });
        return out;
    }
    var CRC_TABLE = null;
    function crc32(bytes) {
        if (!CRC_TABLE) {
            CRC_TABLE = new Uint32Array(256);
            for (var n=0;n<256;n++) { var c=n; for(var k=0;k<8;k++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1); CRC_TABLE[n]=c>>>0; }
        }
        var crc=0xffffffff; for(var i=0;i<bytes.length;i++) crc=CRC_TABLE[(crc^bytes[i])&255]^(crc>>>8); return (crc^0xffffffff)>>>0;
    }
    function dosTimeDate(date) {
        date = date || new Date();
        var year=Math.max(1980,date.getFullYear());
        return { time:((date.getHours()&31)<<11)|((date.getMinutes()&63)<<5)|((Math.floor(date.getSeconds()/2))&31), date:(((year-1980)&127)<<9)|(((date.getMonth()+1)&15)<<5)|(date.getDate()&31) };
    }
    function makeZip(files) {
        var encoder=new TextEncoder(), localParts=[], centralParts=[], offset=0, stamp=dosTimeDate(new Date()), records=[];
        (files||[]).forEach(function(file){
            var path=safeArchivePath(file.path), name=encoder.encode(path), data=bytesOf(file), crc=crc32(data), local=new Uint8Array(30), lv=new DataView(local.buffer);
            lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x0800,true);lv.setUint16(8,0,true);lv.setUint16(10,stamp.time,true);lv.setUint16(12,stamp.date,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.byteLength,true);lv.setUint32(22,data.byteLength,true);lv.setUint16(26,name.byteLength,true);lv.setUint16(28,0,true);
            localParts.push(local,name,data);records.push({path:path,name:name,data:data,crc:crc,offset:offset});offset += local.byteLength+name.byteLength+data.byteLength;
        });
        var centralStart=offset, centralSize=0;
        records.forEach(function(entry){
            var central=new Uint8Array(46),cv=new DataView(central.buffer);
            cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(10,0,true);cv.setUint16(12,stamp.time,true);cv.setUint16(14,stamp.date,true);cv.setUint32(16,entry.crc,true);cv.setUint32(20,entry.data.byteLength,true);cv.setUint32(24,entry.data.byteLength,true);cv.setUint16(28,entry.name.byteLength,true);cv.setUint16(30,0,true);cv.setUint16(32,0,true);cv.setUint16(34,0,true);cv.setUint16(36,0,true);cv.setUint32(38,0,true);cv.setUint32(42,entry.offset,true);
            centralParts.push(central,entry.name);centralSize += central.byteLength+entry.name.byteLength;
        });
        var end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(4,0,true);ev.setUint16(6,0,true);ev.setUint16(8,records.length,true);ev.setUint16(10,records.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,centralStart,true);ev.setUint16(20,0,true);
        return new Blob(localParts.concat(centralParts,[end]),{type:'application/zip'});
    }
    function inflateRaw(bytes) {
        if (typeof DecompressionStream === 'undefined') return Promise.reject(new Error('This ZIP uses compression that this browser cannot unpack. Re-save it without compression or update the browser.'));
        var stream;
        try { stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); }
        catch (error) { return Promise.reject(new Error('Could not start ZIP decompression: '+error.message)); }
        return new Response(stream).arrayBuffer().then(function(buffer){return new Uint8Array(buffer);});
    }
    function extractZip(buffer) {
        return (async function(){
            var bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer), view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength), eocd=-1, min=Math.max(0,bytes.length-0x10000-22);
            for(var i=bytes.length-22;i>=min;i--){if(view.getUint32(i,true)===0x06054b50){eocd=i;break;}}
            if(eocd<0)throw new Error('Invalid ZIP: end-of-central-directory record not found.');
            var entries=view.getUint16(eocd+10,true),centralSize=view.getUint32(eocd+12,true),centralOffset=view.getUint32(eocd+16,true);
            if(entries===0xffff||centralSize===0xffffffff||centralOffset===0xffffffff)throw new Error('ZIP64 packages are not supported. Keep mods under 8 MB.');
            if(entries>MAX_FILES+64)throw new Error('ZIP contains too many entries.');
            if(centralOffset+centralSize>bytes.length)throw new Error('Invalid ZIP central directory.');
            var cursor=centralOffset, pending=[], total=0;
            for(var e=0;e<entries;e++){
                if(cursor+46>bytes.length||view.getUint32(cursor,true)!==0x02014b50)throw new Error('Invalid ZIP central directory entry.');
                var flags=view.getUint16(cursor+8,true),method=view.getUint16(cursor+10,true),expectedCrc=view.getUint32(cursor+16,true),compressed=view.getUint32(cursor+20,true),uncompressed=view.getUint32(cursor+24,true),nameLen=view.getUint16(cursor+28,true),extraLen=view.getUint16(cursor+30,true),commentLen=view.getUint16(cursor+32,true),localOffset=view.getUint32(cursor+42,true);
                if(flags&1)throw new Error('Password-protected ZIP mods are not supported.');
                var nameBytes=bytes.subarray(cursor+46,cursor+46+nameLen),name=new TextDecoder().decode(nameBytes);cursor+=46+nameLen+extraLen+commentLen;
                if(/\/$/.test(name))continue;
                var path=safeArchivePath(name);if(!path||/^(?:__MACOSX)(?:\/|$)/i.test(path)||/(?:^|\/)\.DS_Store$/i.test(path)||/(?:^|\/)Thumbs\.db$/i.test(path))continue;
                if(uncompressed>MAX_FILE_BYTES)throw new Error(path+' exceeds the '+Math.round(MAX_FILE_BYTES/1024/1024)+' MB per-file limit.');
                total+=uncompressed;if(total>MAX_TOTAL_BYTES)throw new Error('ZIP exceeds the '+Math.round(MAX_TOTAL_BYTES/1024/1024)+' MB install limit.');
                if(method!==0&&method!==8)throw new Error('ZIP compression method '+method+' is not supported for '+path+'.');
                if(localOffset+30>bytes.length||view.getUint32(localOffset,true)!==0x04034b50)throw new Error('Invalid ZIP local header for '+path+'.');
                var localName=view.getUint16(localOffset+26,true),localExtra=view.getUint16(localOffset+28,true),start=localOffset+30+localName+localExtra,end=start+compressed;
                if(end>bytes.length)throw new Error('Truncated ZIP data for '+path+'.');
                var compressedBytes=bytes.subarray(start,end);
                pending.push((method===0?Promise.resolve(compressedBytes.slice()):inflateRaw(compressedBytes)).then(functionFactory(path,uncompressed,expectedCrc)));
            }
            function functionFactory(path,expected,expectedCrc){return function(data){if(expected!==0&&data.byteLength!==expected)throw new Error('ZIP size mismatch for '+path+'.');if(crc32(data)!==expectedCrc)throw new Error('ZIP integrity check failed for '+path+'.');return storedFileFromBytes(path,data,mimeFor(path));};}
            var files=await Promise.all(pending);validateFileLimits(files);return stripCommonRoot(files);
        }());
    }
    function compareVersion(a, b) {
        var aa = String(a || '0').replace(/^v/i,'').split(/[.+-]/).slice(0,3).map(function (n) { return Number(n) || 0; });
        var bb = String(b || '0').replace(/^v/i,'').split(/[.+-]/).slice(0,3).map(function (n) { return Number(n) || 0; });
        while (aa.length < 3) aa.push(0); while (bb.length < 3) bb.push(0);
        for (var i=0;i<3;i++) { if (aa[i] !== bb[i]) return aa[i] > bb[i] ? 1 : -1; }
        return 0;
    }
    function satisfiesVersion(version, range) {
        range = String(range == null ? '*' : range).trim();
        if (!range || range === '*' || range.toLowerCase() === 'any') return true;
        var clauses = range.split(/\s+/).filter(Boolean);
        for (var i=0;i<clauses.length;i++) {
            var clause = clauses[i], match = /^(>=|<=|>|<|\^|~|=)?v?([0-9]+(?:\.[0-9]+){0,2})$/.exec(clause);
            if (!match) continue;
            var op = match[1] || '=', target = match[2], cmp = compareVersion(version,target);
            if (op === '>=' && cmp < 0) return false;
            if (op === '<=' && cmp > 0) return false;
            if (op === '>' && cmp <= 0) return false;
            if (op === '<' && cmp >= 0) return false;
            if (op === '=' && cmp !== 0) return false;
            if (op === '^') {
                var major = Number(target.split('.')[0] || 0), vMajor = Number(String(version).replace(/^v/i,'').split('.')[0] || 0);
                if (cmp < 0 || vMajor !== major) return false;
            }
            if (op === '~') {
                var targetParts = target.split('.'), versionParts = String(version).replace(/^v/i,'').split('.');
                if (cmp < 0 || Number(versionParts[0]||0)!==Number(targetParts[0]||0) || Number(versionParts[1]||0)!==Number(targetParts[1]||0)) return false;
            }
        }
        return true;
    }
    function dependencyEntries(manifest) {
        var deps = manifest && manifest.dependencies;
        if (!deps) return [];
        if (Array.isArray(deps)) return deps.map(function (entry) {
            if (typeof entry === 'string') {
                var parts = entry.trim().split(/\s+/); return { id:parts[0], version:parts.slice(1).join(' ') || '*' };
            }
            return { id:String(entry.id || ''), version:String(entry.version || '*'), optional:!!entry.optional };
        }).filter(function (entry) { return entry.id; });
        if (typeof deps === 'object') return Object.keys(deps).map(function (id) { return { id:id, version:String(deps[id] || '*') }; });
        return [];
    }
    function conflictEntries(manifest) {
        var value = manifest && manifest.conflicts;
        if (!value) return [];
        return (Array.isArray(value) ? value : [value]).map(function (entry) { return typeof entry === 'string' ? entry : entry && entry.id; }).filter(Boolean);
    }
    function manifestFrom(files) {
        var file = files.find(function (entry) { return normalizePath(entry.path).toLowerCase() === 'manifest.json'; });
        if (!file || file.text == null) throw new Error('manifest.json is required at the root of the mod.');
        var manifest;
        try { manifest = JSON.parse(file.text); } catch (error) { throw new Error('manifest.json is invalid JSON: ' + error.message); }
        return manifest;
    }
    function validateRecord(record, allRecords) {
        var errors = [], warnings = [], manifest = record && record.manifest || {};
        if (!manifest.id || !/^[a-z0-9][a-z0-9._-]{1,63}$/i.test(manifest.id)) errors.push('manifest.id must be 2–64 letters, numbers, dots, underscores, or dashes.');
        if (!manifest.name) errors.push('manifest.name is required.');
        if (!manifest.version) errors.push('manifest.version is required.');
        if (!record.files.some(function (file) { return normalizePath(file.path).toLowerCase() === 'icon.png'; })) errors.push('icon.png is required at the mod root.');
        var gameRange = manifest.gameVersion || manifest.game || '*';
        if (!satisfiesVersion(GAME_VERSION, gameRange)) errors.push('Requires Dungeon Knight ' + gameRange + ' (running ' + GAME_VERSION + ').');
        var byId = Object.create(null); (allRecords || installed).forEach(function (item) { if (item && item.manifest && item.manifest.id) byId[item.manifest.id] = item; });
        dependencyEntries(manifest).forEach(function (dep) {
            var found = byId[dep.id];
            if (!found && !dep.optional) errors.push('Missing dependency: ' + dep.id + ' ' + dep.version);
            else if (found && !satisfiesVersion(found.manifest.version, dep.version) && !dep.optional) errors.push('Dependency ' + dep.id + ' needs ' + dep.version + ', found ' + found.manifest.version + '.');
            else if (found && !found.enabled && !dep.optional) warnings.push('Dependency ' + dep.id + ' is installed but disabled.');
        });
        conflictEntries(manifest).forEach(function (id) { if (byId[id] && byId[id].enabled) warnings.push('Conflicts with enabled mod: ' + id); });
        if (manifest.permissions && (manifest.permissions.javascript || (Array.isArray(manifest.permissions) && manifest.permissions.indexOf('javascript') >= 0))) warnings.push('Runs custom JavaScript with the same privileges as the game.');
        return { errors:errors, warnings:warnings };
    }
    function openDb() {
        if (dbPromise) return dbPromise;
        if (typeof indexedDB === 'undefined') return Promise.resolve(null);
        dbPromise = new Promise(function (resolve, reject) {
            var request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = function () {
                var db = request.result;
                if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath:'id' });
            };
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error || new Error('Could not open mod storage.')); };
        });
        return dbPromise;
    }
    function getAll() {
        return openDb().then(function (db) {
            if (!db) return [];
            return new Promise(function (resolve, reject) {
                var request = db.transaction(STORE,'readonly').objectStore(STORE).getAll();
                request.onsuccess = function () { resolve(request.result || []); };
                request.onerror = function () { reject(request.error); };
            });
        });
    }
    function put(record) {
        return openDb().then(function (db) {
            if (!db) throw new Error('This browser does not provide IndexedDB mod storage.');
            return new Promise(function (resolve, reject) {
                var request = db.transaction(STORE,'readwrite').objectStore(STORE).put(record);
                request.onsuccess = function () { resolve(record); };
                request.onerror = function () { reject(request.error); };
            });
        });
    }
    function remove(id) {
        return openDb().then(function (db) {
            if (!db) return;
            return new Promise(function (resolve, reject) {
                var request = db.transaction(STORE,'readwrite').objectStore(STORE).delete(id);
                request.onsuccess = function () { resolve(); };
                request.onerror = function () { reject(request.error); };
            });
        });
    }
    function toStoredFile(path, value, mime) {
        var clean = normalizePath(path);
        if (!clean) throw new Error('A mod file has an empty path.');
        if (typeof value === 'string') return { path:clean, mime:mimeFor(clean,mime), text:value };
        var data = value instanceof ArrayBuffer ? value : value && value.buffer instanceof ArrayBuffer ? value.buffer.slice(value.byteOffset||0,(value.byteOffset||0)+(value.byteLength||value.buffer.byteLength)) : value;
        return { path:clean, mime:mimeFor(clean,mime), data:data };
    }
    function validateFileLimits(files) {
        if (!files.length) throw new Error('The selected mod is empty.');
        if (files.length > MAX_FILES) throw new Error('Mod has ' + files.length + ' files; maximum is ' + MAX_FILES + '.');
        var total = 0;
        files.forEach(function (file) {
            var size = fileBytes(file); total += size;
            if (size > MAX_FILE_BYTES) throw new Error(file.path + ' exceeds the ' + Math.round(MAX_FILE_BYTES/1024/1024) + ' MB per-file limit.');
        });
        if (total > MAX_TOTAL_BYTES) throw new Error('Mod exceeds the ' + Math.round(MAX_TOTAL_BYTES/1024/1024) + ' MB install limit.');
    }
    function makeRecord(files, source, previous) {
        files = files.map(function (file) { return { path:normalizePath(file.path), mime:file.mime || mimeFor(file.path), text:file.text, data:file.data }; });
        validateFileLimits(files);
        var manifest = manifestFrom(files), id = String(manifest.id || '').trim();
        var record = {
            id:id,
            manifest:manifest,
            files:files,
            enabled: previous ? previous.enabled !== false : manifest.enabled !== false,
            order: previous ? Number(previous.order)||0 : Date.now(),
            installedAt: previous && previous.installedAt || Date.now(),
            updatedAt: Date.now(),
            source: source || { type:'local' }
        };
        var result = validateRecord(record, installed.filter(function (item) { return item.id !== id; }).concat([record]));
        if (result.errors.length && result.errors.some(function (message) { return /manifest\.|icon\.png|Requires Dungeon Knight/.test(message); })) throw new Error(result.errors.join('\n'));
        return record;
    }
    function fileMap(record) {
        var map = Object.create(null); (record.files || []).forEach(function (file) { map[normalizePath(file.path)] = file; }); return map;
    }
    function textOf(record, path) {
        var file = fileMap(record)[normalizePath(path)];
        if (!file) throw new Error('Missing mod file: ' + path);
        if (file.text != null) return String(file.text);
        if (file.data) {
            try { return new TextDecoder().decode(file.data); } catch (error) {}
        }
        throw new Error('File is not readable as text: ' + path);
    }
    function makeBlobUrl(record, path) {
        var file = fileMap(record)[normalizePath(path)];
        if (!file) return '';
        var blob = file.text != null ? new Blob([file.text],{type:file.mime || mimeFor(path)}) : new Blob([file.data],{type:file.mime || mimeFor(path)});
        return URL.createObjectURL(blob);
    }
    function uiBlobUrl(record, path) {
        var url=makeBlobUrl(record,path);if(url)uiObjectUrls.push(url);return url;
    }
    function modAssetUrl(record, path) {
        var normalized=normalizePath(path), key=record.id+'|'+String(record.updatedAt||record.installedAt||0)+'|'+normalized;
        if(modAssetUrls[key])return modAssetUrls[key];
        var url=makeBlobUrl(record,normalized);if(url)modAssetUrls[key]=url;return url;
    }
    function parseJson(record, path) { return JSON.parse(textOf(record,path)); }
    function mergeContentGroup(group, value, moduleName) {
        var content = window.DKContent;
        if (!content || !Object.prototype.hasOwnProperty.call(content,group)) throw new Error('Unknown content group: ' + group);
        if (Array.isArray(content[group])) {
            if (!Array.isArray(value)) throw new Error('Content group ' + group + ' expects an array.');
            Array.prototype.push.apply(content[group], value);
        } else if (content[group] && typeof content[group] === 'object' && value && typeof value === 'object') {
            Object.keys(value).forEach(function (id) { content[group][id] = value[id]; });
        } else content[group] = value;
        if (content.loadedModules && moduleName && content.loadedModules.indexOf(moduleName) < 0) content.loadedModules.push(moduleName);
        return value;
    }
    function applyManifestContent(record, api) {
        var entries = record.manifest.content;
        if (!entries) return;
        if (!Array.isArray(entries)) entries = [entries];
        entries.forEach(function (entry) {
            if (typeof entry === 'string') {
                var payload = api.files.json(entry);
                Object.keys(payload || {}).forEach(function (group) { mergeContentGroup(group,payload[group],'mod:'+record.id); });
                return;
            }
            if (!entry || !entry.path) return;
            var data = api.files.json(entry.path);
            if (entry.group) mergeContentGroup(entry.group,data,'mod:'+record.id);
            else Object.keys(data || {}).forEach(function (group) { mergeContentGroup(group,data[group],'mod:'+record.id); });
        });
    }
    function emit(name, payload) {
        var list = (listeners[name] || []).slice();
        for (var i=0;i<list.length;i++) {
            try { list[i].handler(payload); }
            catch (error) { console.error('[DKMods:' + (list[i].modId || 'unknown') + '] event ' + name + ' failed', error); }
        }
        return payload;
    }
    function on(name, handler, modId) {
        if (typeof handler !== 'function') return function () {};
        (listeners[name] || (listeners[name]=[])).push({handler:handler,modId:modId||''});
        return function () { off(name,handler); };
    }
    function off(name, handler) {
        if (!listeners[name]) return;
        listeners[name] = listeners[name].filter(function (entry) { return entry.handler !== handler; });
    }
    function apiFor(record) {
        var modId = record.id;
        return {
            version: GAME_VERSION,
            mod: record.manifest,
            content: window.DKContent,
            register: window.DKRegister,
            events: { on:function(name,handler){return on(name,handler,modId);}, off:off, emit:emit },
            rules: {
                get:function(name,fallback){return Object.prototype.hasOwnProperty.call(ruleValues,name)?ruleValues[name]:fallback;},
                set:function(name,value){ruleValues[name]=value;emit('ruleChanged',{name:name,value:value,modId:modId});return value;},
                all:function(){return Object.assign({},ruleValues);}
            },
            files: {
                text:function(path){return textOf(record,path);},
                json:function(path){return parseJson(record,path);},
                url:function(path){return modAssetUrl(record,path);},
                exists:function(path){return !!fileMap(record)[normalizePath(path)];},
                list:function(){return (record.files||[]).map(function(file){return file.path;});}
            },
            storage: {
                get:function(key,fallback){try{var value=localStorage.getItem('dkmod:'+modId+':'+key);return value==null?fallback:JSON.parse(value);}catch(error){return fallback;}},
                set:function(key,value){try{localStorage.setItem('dkmod:'+modId+':'+key,JSON.stringify(value));return true;}catch(error){return false;}},
                remove:function(key){try{localStorage.removeItem('dkmod:'+modId+':'+key);}catch(error){}}
            },
            i18n: {
                register:function(locale,bundle){window.DK_BUNDLES=window.DK_BUNDLES||Object.create(null);bundle=bundle||{};bundle.locale=bundle.locale||locale;window.DK_BUNDLES[locale]=bundle;if(window.DKI18n&&window.DKI18n.refreshLocales)window.DKI18n.refreshLocales();return bundle;},
                translate:function(value){return window.DKI18n&&window.DKI18n.t?window.DKI18n.t(value):value;}
            },
            addContent:function(group,id,value){var obj={};obj[id]=value;mergeContentGroup(group,obj,'mod:'+modId);return value;},
            mergeContent:function(group,value){return mergeContentGroup(group,value,'mod:'+modId);},
            patch:function(target,key,wrapper){if(!target||typeof target[key]!=='function'||typeof wrapper!=='function')throw new Error('patch() requires a function property and wrapper.');var original=target[key],active=true;var patched=function(){if(!active)return original.apply(this,arguments);return wrapper.call(this,original.bind(this),Array.prototype.slice.call(arguments));};target[key]=patched;return function(){active=false;if(target[key]===patched)target[key]=original;};},
            require:function(id){return loaded[id]&&loaded[id].exports;},
            get game(){return window.DKGame||null;},
            get ui(){return window.DKUI||null;},
            toast:function(message,color){if(window.DKGame&&window.DKGame.toast)window.DKGame.toast(message,color);else log(modId+':',message);},
            log:function(){var args=Array.prototype.slice.call(arguments);args.unshift('[DKMod:'+modId+']');console.log.apply(console,args);},
            warn:function(){var args=Array.prototype.slice.call(arguments);args.unshift('[DKMod:'+modId+']');console.warn.apply(console,args);}
        };
    }
    function executeScript(record, path, api, module) {
        var code = textOf(record,path);
        var fn;
        try {
            fn = new Function('DK','mod','module','exports', code + '\n//# sourceURL=dkmod://' + encodeURIComponent(record.id) + '/' + normalizePath(path));
        } catch (error) { throw new Error(path + ' could not compile: ' + error.message); }
        return fn(api, record.manifest, module, module.exports);
    }
    function loadRecord(record) {
        var check = validateRecord(record, installed);
        if (check.errors.length) throw new Error(check.errors.join('\n'));
        var api = apiFor(record), module = { exports:{} };
        applyManifestContent(record,api);
        var scripts = [];
        if (record.manifest.main !== false) scripts.push(record.manifest.main || 'main.js');
        if (Array.isArray(record.manifest.scripts)) Array.prototype.push.apply(scripts,record.manifest.scripts);
        var seen = Object.create(null);
        scripts.map(normalizePath).filter(function(path){if(!path||seen[path])return false;seen[path]=true;return true;}).forEach(function (path) {
            if (!api.files.exists(path)) {
                if (path === 'main.js' && !record.manifest.main) return;
                throw new Error('Script declared by manifest is missing: ' + path);
            }
            executeScript(record,path,api,module);
        });
        var exported = module.exports || {};
        loaded[record.id] = { record:record, api:api, exports:exported, warnings:check.warnings };
        if (typeof exported.preload === 'function') exported.preload(api);
        emit('modLoaded',{id:record.id,manifest:record.manifest,api:api});
        return loaded[record.id];
    }
    function sortedEnabled(records) {
        var enabled = records.filter(function (record) { return record.enabled !== false; }), byId = Object.create(null), result = [], visiting=Object.create(null), visited=Object.create(null);
        enabled.forEach(function(record){byId[record.id]=record;});
        function visit(record) {
            if (visited[record.id]) return;
            if (visiting[record.id]) { warn('Dependency cycle includes',record.id); return; }
            visiting[record.id]=true;
            dependencyEntries(record.manifest).forEach(function(dep){if(byId[dep.id])visit(byId[dep.id]);});
            (record.manifest.loadAfter||[]).forEach(function(id){if(byId[id])visit(byId[id]);});
            visiting[record.id]=false;visited[record.id]=true;result.push(record);
        }
        enabled.sort(function(a,b){return (a.order||0)-(b.order||0);}).forEach(visit);
        return result;
    }
    function bootstrap() {
        return getAll().then(function (records) {
            installed = (records || []).sort(function(a,b){return (a.order||0)-(b.order||0);});
            sortedEnabled(installed).forEach(function (record) {
                try { loadRecord(record); delete loadErrors[record.id]; }
                catch (error) { loadErrors[record.id]=String(error && error.message || error); console.error('[DKMods:'+record.id+'] failed to load',error); }
            });
            render();
            return installed.slice();
        }).catch(function (error) { console.error('[DKMods] bootstrap failed',error); renderError(String(error.message||error)); return []; });
    }
    function ready() {
        Object.keys(loaded).forEach(function (id) {
            var item=loaded[id]; if(item.ready)return; item.ready=true;
            try { if(item.exports&&typeof item.exports.init==='function')item.exports.init(item.api); }
            catch(error){loadErrors[id]='init: '+String(error.message||error);console.error('[DKMods:'+id+'] init failed',error);}
        });
        emit('ready',{game:window.DKGame||null,ui:window.DKUI||null}); render();
    }
    function installFiles(files, source) {
        var previous = null, manifest = manifestFrom(files), id = String(manifest.id || '');
        previous = installed.find(function(item){return item.id===id;}) || null;
        var record = makeRecord(files,source,previous);
        return put(record).then(function () {
            var index=installed.findIndex(function(item){return item.id===record.id;});
            if(index>=0)installed[index]=record;else installed.push(record);
            installed.sort(function(a,b){return(a.order||0)-(b.order||0);});
            reloadRequired=true;render();return record;
        });
    }
    function readBrowserFile(file, path) {
        var normalized=normalizePath(path||file.webkitRelativePath||file.name), type=file.type||mimeFor(normalized);
        var isText=SCRIPT_TYPES.test(type)||TEXT_EXT.test(normalized)||/json|xml|yaml|markdown|css|html/i.test(type);
        return (isText ? file.text().then(function(text){return toStoredFile(normalized,text,type);}) : file.arrayBuffer().then(function(data){return toStoredFile(normalized,data,type);}));
    }
    function stripCommonRoot(files) {
        if(!files.length)return files;
        var first=normalizePath(files[0].path).split('/')[0];
        if(!first||!files.every(function(file){return normalizePath(file.path).split('/')[0]===first;}))return files;
        if(files.some(function(file){return normalizePath(file.path).toLowerCase()==='manifest.json';}))return files;
        return files.map(function(file){var copy=Object.assign({},file);copy.path=normalizePath(file.path).split('/').slice(1).join('/');return copy;});
    }
    function importFileList(fileList) {
        var list=Array.prototype.slice.call(fileList||[]);if(!list.length)return Promise.reject(new Error('No files selected.'));
        return Promise.all(list.map(function(file){return readBrowserFile(file,file.webkitRelativePath||file.name);})).then(function(files){return installFiles(stripCommonRoot(files),{type:'local-folder'});});
    }
    function importZipFile(file, source) {
        if(!file)return Promise.reject(new Error('No ZIP selected.'));
        return file.arrayBuffer().then(extractZip).then(function(files){return installFiles(files,source||{type:'local-zip',name:file.name});});
    }
    function exportZip(record) {
        var blob=makeZip(record.files||[]),url=URL.createObjectURL(blob),a=document.createElement('a');
        a.href=url;a.download=(record.id||'mod')+'-v'+String(record.manifest&&record.manifest.version||'1.0.0')+'.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},800);
    }
    function walkDirectory(handle, prefix, out) {
        prefix=prefix||'';out=out||[];
        return (async function(){
            for await (var pair of handle.entries()) {
                var name=pair[0],child=pair[1],path=prefix?prefix+'/'+name:name;
                if(child.kind==='directory')await walkDirectory(child,path,out);else{var file=await child.getFile();out.push(await readBrowserFile(file,path));}
            }
            return out;
        }());
    }
    function importDirectoryPicker() {
        if(typeof window.showDirectoryPicker!=='function')return Promise.reject(new Error('Directory picker unavailable.'));
        return window.showDirectoryPicker({mode:'read'}).then(function(handle){return walkDirectory(handle,'',[]);}).then(function(files){return installFiles(files,{type:'local-folder'});});
    }
    function defaultIconPng() {
        var canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;var ctx=canvas.getContext('2d');ctx.fillStyle='#0b0b0c';ctx.fillRect(0,0,128,128);ctx.strokeStyle='#d4b15f';ctx.lineWidth=6;ctx.strokeRect(5,5,118,118);ctx.fillStyle='#d4b15f';ctx.beginPath();ctx.moveTo(64,22);ctx.lineTo(91,64);ctx.lineTo(64,106);ctx.lineTo(37,64);ctx.closePath();ctx.fill();ctx.fillStyle='#0b0b0c';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('DK',64,65);var data=atob(canvas.toDataURL('image/png').split(',')[1]),bytes=new Uint8Array(data.length);for(var i=0;i<data.length;i++)bytes[i]=data.charCodeAt(i);return bytes.buffer;
    }
    function createModFromForm() {
        var name=(document.getElementById('mod-create-name').value||'').trim(),id=(document.getElementById('mod-create-id').value||'').trim().toLowerCase(),author=(document.getElementById('mod-create-author').value||'').trim(),description=(document.getElementById('mod-create-description').value||'').trim(),code=document.getElementById('mod-create-code').value||'';
        if(!name||!id)throw new Error('Name and ID are required.');
        var manifest={id:id,name:name,version:'1.0.0',gameVersion:'>=1.9.2',author:author||'Unknown',description:description||'Dungeon Knight mod',main:'main.js',icon:'icon.png',permissions:['javascript'],multiplayer:'unspecified'};
        var files=[toStoredFile('manifest.json',JSON.stringify(manifest,null,2),'application/json'),toStoredFile('main.js',code,'text/javascript'),toStoredFile('icon.png',defaultIconPng(),'image/png')];
        return installFiles(files,{type:'creator'});
    }
    function setStatus(text,kind) { var node=document.getElementById('mod-manager-status');if(!node)return;node.textContent=text||'';node.setAttribute('data-kind',kind||''); }
    function renderError(text){setStatus(text,'error');}
    function iconFor(record) { try{return uiBlobUrl(record,(record.manifest&&record.manifest.icon)||'icon.png');}catch(error){return '';} }
    function rowDetails(record,validation) {
        var source=record.source&&record.source.type==='creator'?'Created in-game':record.source&&record.source.type==='local-folder'?'Local folder':'Imported package';
        var deps=dependencyEntries(record.manifest);var diagnostics=[];
        var multiplayer=record.manifest.multiplayer||'unspecified';
        validation.errors.forEach(function(x){diagnostics.push('<div class="mod-diagnostic error">'+escapeHtml(x)+'</div>');});
        validation.warnings.forEach(function(x){diagnostics.push('<div class="mod-diagnostic warning">'+escapeHtml(x)+'</div>');});
        if(loadErrors[record.id])diagnostics.push('<div class="mod-diagnostic error">Load error: '+escapeHtml(loadErrors[record.id])+'</div>');
        return '<div class="mod-row-details">'+
            '<p>'+escapeHtml(record.manifest.description||'No description provided.')+'</p>'+
            '<div class="mod-meta-grid"><span>Author</span><strong>'+escapeHtml(record.manifest.author||'Unknown')+'</strong><span>Source</span><strong>'+source+'</strong><span>Game</span><strong>'+escapeHtml(record.manifest.gameVersion||'*')+'</strong><span>Multiplayer</span><strong>'+escapeHtml(multiplayer)+'</strong><span>Dependencies</span><strong>'+escapeHtml(deps.length?deps.map(function(d){return d.id+' '+d.version;}).join(', '):'None')+'</strong></div>'+
            diagnostics.join('')+
            '<div class="mod-row-actions"><button data-mod-action="move-up" data-mod-id="'+escapeHtml(record.id)+'" title="Load earlier">↑ Earlier</button><button data-mod-action="move-down" data-mod-id="'+escapeHtml(record.id)+'" title="Load later">↓ Later</button><button data-mod-action="export" data-mod-id="'+escapeHtml(record.id)+'">Export ZIP</button></div>'+
            '</div>';
    }
    function render() {
        var list=document.getElementById('mod-list');if(!list)return;
        uiObjectUrls.splice(0).forEach(function(url){try{URL.revokeObjectURL(url);}catch(error){}});
        var records=installed.slice().sort(function(a,b){return(a.order||0)-(b.order||0);});
        if(!records.length){list.innerHTML='<div class="mods-empty">No mods installed.<br><small>Import a trusted ZIP or create a starter package.</small></div>';}
        else list.innerHTML=records.map(function(record,index){var m=record.manifest||{},validation=validateRecord(record,installed),saving=!!pendingWrites[record.id],enabled=record.enabled!==false,runtimeActive=!!loaded[record.id],pending=enabled!==runtimeActive,state=saving?'saving':loadErrors[record.id]?'error':validation.errors.length?'blocked':enabled?'enabled':'disabled',stateCopy=saving?'Saving…':pending?(enabled?'Enable pending':'Disable pending'):(enabled?'Enabled':'Disabled');return '<article class="mod-row" data-mod-id="'+escapeHtml(record.id)+'" data-state="'+state+'" style="--mod-order:'+index+'">'+
            '<img class="mod-icon" src="'+escapeHtml(iconFor(record))+'" alt="">'+
            '<div class="mod-row-main"><span class="mod-title"><strong>'+escapeHtml(m.name||record.id)+'</strong><small>v'+escapeHtml(m.version||'?')+' · '+escapeHtml(m.author||'Unknown')+'</small></span><span class="mod-row-summary">'+escapeHtml(m.description||'No description provided.')+'</span><span class="mod-load-state">'+stateCopy+'</span></div>'+
            '<label class="mod-toggle" title="'+(enabled?'Disable':'Enable')+' '+escapeHtml(m.name||record.id)+'"><input type="checkbox" data-mod-action="toggle" data-mod-id="'+escapeHtml(record.id)+'" '+(enabled?'checked':'')+' '+(saving?'disabled':'')+'><span aria-hidden="true"></span><b>'+(enabled?'On':'Off')+'</b></label>'+
            '<button class="mod-expand" data-mod-action="expand" data-mod-id="'+escapeHtml(record.id)+'" aria-label="Details">⌄</button>'+
            '<button class="mod-delete" data-mod-action="delete" data-mod-id="'+escapeHtml(record.id)+'" aria-label="Delete mod">×</button>'+
            rowDetails(record,validation)+'</article>';}).join('');
        var count=document.getElementById('mod-count');if(count)count.textContent=installed.filter(function(r){return r.enabled!==false;}).length+' enabled · '+installed.length+' installed';
        var reload=document.getElementById('mod-reload-btn');if(reload){reload.disabled=!reloadRequired;reload.textContent=reloadRequired?'Apply changes':'All changes applied';}
    }
    function setRecordEnabled(record,enabled){
        if(!record)return Promise.reject(new Error('Mod not found.'));if(pendingWrites[record.id])return Promise.resolve(false);var previous=record.enabled!==false,desired=enabled!==false;if(previous===desired)return Promise.resolve(true);
        var next=Object.assign({},record,{enabled:desired});record.enabled=desired;pendingWrites[record.id]=true;setStatus('Saving '+(record.manifest.name||record.id)+'…','busy');render();
        return put(next).then(getAll).then(function(records){
            installed=(records||[]).sort(function(a,b){return(a.order||0)-(b.order||0);});var saved=installed.find(function(item){return item.id===record.id;});if(!saved||saved.enabled!==desired)throw new Error('The saved mod state could not be verified.');
            delete pendingWrites[record.id];reloadRequired=true;setStatus((saved.manifest.name||saved.id)+(desired?' will be enabled.':' will be disabled.')+' Apply changes or leave this screen.','ok');render();return true;
        }).catch(function(error){record.enabled=previous;delete pendingWrites[record.id];render();renderError('Could not save '+(record.manifest.name||record.id)+': '+String(error.message||error));throw error;});
    }
    function setEnabled(id,enabled){var record=installed.find(function(item){return item.id===id;});return setRecordEnabled(record,enabled);}
    function moveRecord(record, delta) {
        var ordered=installed.slice().sort(function(a,b){return(a.order||0)-(b.order||0);});
        var index=ordered.findIndex(function(item){return item.id===record.id;}), target=index+delta;
        if(index<0||target<0||target>=ordered.length)return Promise.resolve(false);
        // Normalize first so swaps are deterministic even after old installs with identical timestamps.
        ordered.forEach(function(item,i){item.order=(i+1)*1000;});
        var other=ordered[target], temp=record.order;record.order=other.order;other.order=temp;
        return Promise.all([put(record),put(other)]).then(function(){installed.sort(function(a,b){return(a.order||0)-(b.order||0);});reloadRequired=true;render();return true;});
    }
    function bindListActions() {
        var list=document.getElementById('mod-list');if(!list||list.dataset.bound)return;list.dataset.bound='1';
        list.addEventListener('change',function(event){var input=event.target.closest&&event.target.closest('input[data-mod-action="toggle"]');if(!input)return;event.stopPropagation();var id=input.getAttribute('data-mod-id'),record=installed.find(function(item){return item.id===id;});if(!record)return;setRecordEnabled(record,input.checked).catch(function(){input.checked=record.enabled!==false;});});
        list.addEventListener('click',function(event){var button=event.target.closest&&event.target.closest('button[data-mod-action]');if(!button)return;event.stopPropagation();var action=button.getAttribute('data-mod-action'),id=button.getAttribute('data-mod-id'),record=installed.find(function(item){return item.id===id;});if(!record)return;
            if(action==='expand'){var row=button.closest('.mod-row');if(row)row.classList.toggle('expanded');}
            else if(action==='delete'){if(window.confirm&&!window.confirm('Remove '+(record.manifest.name||record.id)+'?'))return;remove(id).then(function(){installed=installed.filter(function(item){return item.id!==id;});reloadRequired=true;render();});}
            else if(action==='move-up')moveRecord(record,-1);
            else if(action==='move-down')moveRecord(record,1);
            else if(action==='export')exportZip(record);
        });
    }
    function showModsView(view) {
        view=view==='guide'?'guide':'installed';var menu=document.getElementById('mods-menu');if(!menu)return;menu.setAttribute('data-mods-view',view);
        Array.prototype.forEach.call(menu.querySelectorAll('[data-mods-pane]'),function(pane){pane.hidden=pane.getAttribute('data-mods-pane')!==view;});
    }
    function openCreator() {
        var dialog=document.getElementById('mod-create-dialog');if(!dialog)return;dialog.hidden=false;dialog.classList.remove('closing');void dialog.offsetWidth;dialog.classList.add('open');
        var code=document.getElementById('mod-create-code');if(code&&!code.value)code.value="module.exports = {\n  preload(DK) {\n    DK.log('Mod preload');\n  },\n\n  init(DK) {\n    DK.events.on('waveStart', event => {\n      DK.log('Wave', event.wave, 'started');\n    });\n  }\n};\n";
    }
    function closeCreator() {var dialog=document.getElementById('mod-create-dialog');if(!dialog)return;dialog.classList.remove('open');dialog.classList.add('closing');setTimeout(function(){dialog.hidden=true;dialog.classList.remove('closing');},180);}
    function restartIfRequired() {
        if(!reloadRequired)return false;
        setStatus('Restarting Dungeon Knight to apply mod changes…','busy');
        window.setTimeout(function(){location.reload();},40);
        return true;
    }
    function bindUi() {
        var zipInput=document.getElementById('mod-zip-input');
        var importButton=document.getElementById('mod-import-btn');if(importButton)importButton.addEventListener('click',function(){setStatus('Choose a Dungeon Knight mod .zip containing manifest.json and icon.png.','');if(zipInput)zipInput.click();});
        if(zipInput)zipInput.addEventListener('change',function(){var file=zipInput.files&&zipInput.files[0];if(!file)return;if(!/\.zip$/i.test(file.name)){renderError('Dungeon Knight mods must be .zip files.');zipInput.value='';return;}setStatus('Installing '+file.name+'…','busy');importZipFile(file,{type:'local-zip',name:file.name}).then(function(record){setStatus(record.manifest.name+' installed. Back will restart the game to apply it.','ok');zipInput.value='';}).catch(function(error){renderError(String(error.message||error));zipInput.value='';});});
        bindListActions();
        var installedButton=document.getElementById('mod-installed-btn');if(installedButton)installedButton.addEventListener('click',function(){showModsView('installed');});
        var guide=document.getElementById('mod-guide-btn');if(guide)guide.addEventListener('click',function(){showModsView('guide');});
        var create=document.getElementById('mod-create-btn');if(create)create.addEventListener('click',openCreator);
        var reload=document.getElementById('mod-reload-btn');if(reload)reload.addEventListener('click',function(){location.reload();});
        var close=document.getElementById('mod-create-cancel');if(close)close.addEventListener('click',closeCreator);
        var save=document.getElementById('mod-create-save');if(save)save.addEventListener('click',function(){try{save.disabled=true;createModFromForm().then(function(record){closeCreator();setStatus(record.manifest.name+' created and installed. Export its ZIP from Details. Back will restart to apply it.','ok');render();}).catch(function(error){renderError(String(error.message||error));}).finally(function(){save.disabled=false;});}catch(error){save.disabled=false;renderError(String(error.message||error));}});
        var name=document.getElementById('mod-create-name'),id=document.getElementById('mod-create-id');if(name&&id)name.addEventListener('input',function(){if(id.dataset.edited)return;id.value=name.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);});if(id)id.addEventListener('input',function(){id.dataset.edited='1';});
        var drop=document.getElementById('mods-menu');if(drop){drop.addEventListener('dragover',function(event){if(event.dataTransfer&&event.dataTransfer.types&&Array.prototype.indexOf.call(event.dataTransfer.types,'Files')<0)return;event.preventDefault();drop.classList.add('dragging');});drop.addEventListener('dragleave',function(){drop.classList.remove('dragging');});drop.addEventListener('drop',function(event){event.preventDefault();drop.classList.remove('dragging');var files=event.dataTransfer&&event.dataTransfer.files;if(!files||files.length!==1||!/\.zip$/i.test(files[0].name)){renderError('Drop one Dungeon Knight mod .zip file.');return;}setStatus('Installing '+files[0].name+'…','busy');importZipFile(files[0],{type:'local-zip',name:files[0].name}).then(function(record){setStatus(record.manifest.name+' installed. Back will restart the game to apply it.','ok');}).catch(function(error){renderError(String(error.message||error));});});}
        render();
    }

    if(window.addEventListener)window.addEventListener('beforeunload',function(){
        uiObjectUrls.splice(0).forEach(function(url){try{URL.revokeObjectURL(url);}catch(error){}});
        Object.keys(modAssetUrls).forEach(function(key){try{URL.revokeObjectURL(modAssetUrls[key]);}catch(error){}});
        modAssetUrls=Object.create(null);
    });

    window.DKMods = {
        version:GAME_VERSION,
        bootstrap:bootstrap,
        ready:ready,
        emit:emit,
        on:function(name,handler){return on(name,handler,'external');},
        off:off,
        rules:ruleValues,
        installed:function(){return installed.slice();},
        loaded:function(){return Object.assign({},loaded);},
        errors:function(){return Object.assign({},loadErrors);},
        installFiles:installFiles,
        setEnabled:setEnabled,
        validate:validateRecord,
        apiFor:apiFor,
        render:render,
        importZip:importZipFile,
        exportZip:exportZip,
        restartIfRequired:restartIfRequired,
        needsRestart:function(){return reloadRequired;},
        zipPack:makeZip,
        zipExtract:extractZip
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindUi,{once:true});else setTimeout(bindUi,0);
}());

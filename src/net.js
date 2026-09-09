(function () {
    'use strict';

    var listeners = Object.create(null);
    var socket = null;
    var peerId = '';
    var hostId = '';
    var roomId = '';
    var role = 'local';
    var displayName = 'KNIGHT';
    var peers = new Map();
    var roomRoster = [];
    var roomState = 'menu';
    var reconnectTimer = 0;
    var heartbeatTimer = 0;
    var serverPingTimer = 0;
    var serverRttMs = 0;
    var serverPingSequence = 0;
    var manualClose = false;
    var signalUrl = '';
    var MAX_RELAY_BUFFER = 128 * 1024;
    var MAX_DIRECT_BUFFER = 64 * 1024;
    var transportStats = { sentState: 0, sentControl: 0, droppedState: 0, relayFallbacks: 0, lastPacketBytes: 0 };
    var rtcSupported = typeof RTCPeerConnection !== 'undefined';
    var iceServers = window.DK_ICE_SERVERS || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ];

    function on(type, handler) {
        (listeners[type] || (listeners[type] = [])).push(handler);
        return function () { listeners[type] = (listeners[type] || []).filter(function (fn) { return fn !== handler; }); };
    }

    function emit(type, detail) {
        (listeners[type] || []).slice().forEach(function (handler) {
            try { handler(detail); } catch (error) { console.error('[DKNet]', type, error); }
        });
    }

    function safeParse(value) {
        if (typeof value !== 'string') return value;
        try { return JSON.parse(value); } catch (error) { return null; }
    }

    function compactNetworkNumber(key, value) {
        if (typeof value === 'number' && isFinite(value) && !Number.isInteger(value)) return Math.round(value * 100) / 100;
        return value;
    }

    function serializeNetworkPayload(value) {
        return JSON.stringify(value, compactNetworkNumber);
    }

    function limitGraphemes(value, max) {
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
            return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value), function (part) { return part.segment; }).slice(0, max).join('');
        }
        return Array.from(value).slice(0, max).join('');
    }

    function cleanPlayerName(value) {
        value = String(value || 'KNIGHT');
        if (value.normalize) value = value.normalize('NFC');
        try { value = value.replace(/[^\p{L}\p{M}\p{N} _-]/gu, ''); }
        catch (error) { value = value.replace(/[^a-z0-9 _\-\u0E00-\u0E7F\u3040-\u30FF\u3400-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/gi, ''); }
        return limitGraphemes(value.trim(), 16) || 'KNIGHT';
    }

    function wsAddress() {
        if (window.DK_STANDALONE_OFFLINE) return '';
        if (signalUrl) return signalUrl;
        if (location.protocol === 'file:') return '';
        return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/signal';
    }

    function stopHeartbeat() {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (serverPingTimer) clearInterval(serverPingTimer);
        heartbeatTimer = 0;
        serverPingTimer = 0;
    }

    function sampleServerPing() {
        sendSignal({ type:'ping', at:Date.now(), sequence:++serverPingSequence }, { droppable:true });
    }

    function startHeartbeat() {
        stopHeartbeat();
        heartbeatTimer = setInterval(function () {
            sendSignal({ type: 'heartbeat', at: Date.now() }, { droppable: true });
        }, 25000);
        sampleServerPing();
        serverPingTimer = setInterval(sampleServerPing, 5000);
    }

    function sendSignal(message, options) {
        if (!socket || socket.readyState !== WebSocket.OPEN) return false;
        if (options && options.droppable && socket.bufferedAmount > MAX_RELAY_BUFFER) return false;
        try { socket.send(serializeNetworkPayload(message)); return true; } catch (error) { return false; }
    }

    function connect(name, customUrl) {
        displayName = cleanPlayerName(name || displayName);
        signalUrl = customUrl || signalUrl;
        var address = wsAddress();
        if (!address) {
            emit('error', { code: 'SERVER_REQUIRED', message: 'Online rooms require the included server.' });
            return Promise.reject(new Error('Online rooms require a server.'));
        }
        if (socket && socket.readyState === WebSocket.OPEN) {
            sendSignal({ type: 'presence', name: displayName });
            return Promise.resolve();
        }
        manualClose = false;
        return new Promise(function (resolve, reject) {
            var settled = false;
            try { socket = new WebSocket(address); } catch (error) { reject(error); return; }
            socket.addEventListener('open', function () {
                sendSignal({ type: 'hello', name: displayName, version: '1.9.2' });
                startHeartbeat();
                if (!settled) { settled = true; resolve(); }
                emit('signal', { state: 'connected' });
            });
            socket.addEventListener('message', function (event) {
                var message = safeParse(event.data);
                if (message) handleSignal(message);
            });
            socket.addEventListener('close', function () {
                stopHeartbeat();
                serverRttMs = 0;
                emit('signal', { state: 'disconnected' });
                if (!settled) { settled = true; reject(new Error('Could not reach the room server.')); }
                if (!manualClose && roomState !== 'run') {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = setTimeout(function () { connect(displayName, signalUrl).catch(function () {}); }, 1800);
                }
            });
            socket.addEventListener('error', function () {
                emit('signal', { state: 'error' });
            });
        });
    }

    function handleSignal(message) {
        if (message.type === 'welcome') {
            peerId = message.peerId;
            emit('rooms', message.rooms || []);
            emit('ready', { peerId: peerId });
        } else if (message.type === 'heartbeat_ack') {
            return;
        } else if (message.type === 'ping_ack') {
            var sample=Math.max(0,Date.now()-(Number(message.at)||Date.now()));
            serverRttMs=serverRttMs?Math.round(serverRttMs*.65+sample*.35):Math.round(sample);
            emit('server-ping',{rttMs:serverRttMs,sequence:message.sequence||0});
            return;
        } else if (message.type === 'rooms') {
            emit('rooms', message.rooms || []);
        } else if (message.type === 'room_created' || message.type === 'room_joined') {
            roomId = message.room.id;
            hostId = message.room.hostId;
            role = peerId === hostId ? 'host' : 'guest';
            roomRoster = message.roster || [];
            roomState = message.room.state || 'waiting';
            emit('room', { room: message.room, roster: roomRoster.slice(), role: role });
        } else if (message.type === 'peer_joined') {
            mergeRoster(message.roster || []);
            emit('roster', roomRoster.slice());
            if (role === 'host' && message.peer && message.peer.id !== peerId) createPeer(message.peer.id, true);
        } else if (message.type === 'peer_left') {
            closePeer(message.peerId);
            mergeRoster(message.roster || []);
            emit('roster', roomRoster.slice());
            if (message.peerId === hostId) emit('host-left', {});
        } else if (message.type === 'roster') {
            mergeRoster(message.roster || []);
            emit('roster', roomRoster.slice());
        } else if (message.type === 'room_update') {
            roomState = message.room.state;
            emit('room-update', message.room);
        } else if (message.type === 'signal') {
            acceptSignal(message.from, message.data);
        } else if (message.type === 'relay') {
            var relayed = safeParse(message.data);
            if (relayed) emit('data', { from: message.from, data: relayed, transport: 'relay' });
        } else if (message.type === 'error') {
            emit('error', message);
        }
    }

    function mergeRoster(next) {
        roomRoster = next.slice(0, 4);
        var known = new Set(roomRoster.map(function (entry) { return entry.id; }));
        Array.from(peers.keys()).forEach(function (id) { if (!known.has(id)) closePeer(id); });
    }

    function createPeer(id, initiator) {
        if (!rtcSupported || !id || id === peerId) return null;
        if (peers.has(id)) return peers.get(id);
        var pc;try{pc=new RTCPeerConnection({ iceServers: iceServers, iceCandidatePoolSize: 4 });}catch(error){pc=new RTCPeerConnection({ iceServers: iceServers });}
        var entry = { id: id, pc: pc, channel: null, controlChannel: null, stateChannel: null, direct: false, createdAt: Date.now(), pendingCandidates: [], statsTimer: 0, rttMs: 0, availableOutgoingBitrate: 0 };
        peers.set(id, entry);
        pc.addEventListener('icecandidate', function (event) {
            if (event.candidate) sendSignal({ type: 'signal', to: id, data: { candidate: event.candidate } });
        });
        pc.addEventListener('connectionstatechange', function () {
            entry.direct = pc.connectionState === 'connected' && hasOpenChannel(entry);
            if (pc.connectionState === 'failed' || pc.connectionState === 'closed' || pc.connectionState === 'disconnected') entry.direct = false;
            emitConnection();
        });
        pc.addEventListener('datachannel', function (event) { attachChannel(entry, event.channel); });
        if (initiator) {
            // Critical room/control messages stay reliable. High-frequency input and
            // snapshots use an unordered, no-retransmit lane so an old lost packet
            // can never hold a newer game state behind it.
            attachChannel(entry, pc.createDataChannel('dungeon-control', { ordered: true }));
            attachChannel(entry, pc.createDataChannel('dungeon-state', { ordered: false, maxRetransmits: 0 }));
            pc.createOffer().then(function (offer) { return pc.setLocalDescription(offer); }).then(function () {
                sendSignal({ type: 'signal', to: id, data: { description: pc.localDescription } });
            }).catch(function (error) { emit('error', { code: 'RTC_OFFER', message: error.message }); });
        }
        emitConnection();
        return entry;
    }

    function hasOpenChannel(entry) {
        return !!((entry.controlChannel && entry.controlChannel.readyState === 'open') || (entry.stateChannel && entry.stateChannel.readyState === 'open'));
    }

    function samplePeerStats(entry) {
        if (!entry || !entry.pc || typeof entry.pc.getStats !== 'function') return;
        entry.pc.getStats().then(function (report) {
            report.forEach(function (stat) {
                if (stat.type !== 'candidate-pair' || (stat.state && stat.state !== 'succeeded') || (!stat.nominated && stat.selected === false)) return;
                if (isFinite(stat.currentRoundTripTime)) entry.rttMs = Math.max(0, Math.round(stat.currentRoundTripTime * 1000));
                if (isFinite(stat.availableOutgoingBitrate)) entry.availableOutgoingBitrate = Math.max(0, Math.round(stat.availableOutgoingBitrate));
            });
            emitConnection();
        }).catch(function () {});
    }

    function startPeerStats(entry) {
        if (entry.statsTimer) return;
        samplePeerStats(entry);
        entry.statsTimer = setInterval(function () { samplePeerStats(entry); }, 3000);
    }

    function directBufferLimit(entry) {
        if ((entry.rttMs && entry.rttMs > 240) || (entry.availableOutgoingBitrate && entry.availableOutgoingBitrate < 900000)) return 32 * 1024;
        return MAX_DIRECT_BUFFER;
    }

    function attachChannel(entry, channel) {
        var kind = channel.label === 'dungeon-state' ? 'state' : 'control';
        if (kind === 'state') entry.stateChannel = channel;
        else entry.controlChannel = channel;
        entry.channel = entry.controlChannel || entry.stateChannel;
        channel.binaryType = 'arraybuffer';
        channel.bufferedAmountLowThreshold = kind === 'state' ? 32 * 1024 : 128 * 1024;
        channel.addEventListener('open', function () { entry.direct = true; startPeerStats(entry); emitConnection(); emit('peer-open', { peerId: entry.id, channel: kind }); });
        channel.addEventListener('close', function () { entry.direct = hasOpenChannel(entry); emitConnection(); });
        channel.addEventListener('message', function (event) {
            var payload = safeParse(event.data);
            if (payload) emit('data', { from: entry.id, data: payload, transport: 'direct-' + kind });
        });
    }

    function acceptSignal(from, data) {
        if (!rtcSupported) return;
        var entry = peers.get(from) || createPeer(from, false);
        if (!entry) return;
        if (data.description) {
            entry.pc.setRemoteDescription(data.description).then(function () {
                var queued=entry.pendingCandidates.splice(0);queued.forEach(function(candidate){entry.pc.addIceCandidate(candidate).catch(function(){});});
                if (data.description.type !== 'offer') return null;
                return entry.pc.createAnswer().then(function (answer) { return entry.pc.setLocalDescription(answer); }).then(function () {
                    sendSignal({ type: 'signal', to: from, data: { description: entry.pc.localDescription } });
                });
            }).catch(function (error) { emit('error', { code: 'RTC_DESCRIPTION', message: error.message }); });
        } else if (data.candidate) {
            if(entry.pc.remoteDescription)entry.pc.addIceCandidate(data.candidate).catch(function () {});else entry.pendingCandidates.push(data.candidate);
        }
    }

    function emitConnection() {
        var entries=Array.from(peers.values()),direct = entries.filter(function (entry) { return entry.direct; }).length,rttSamples=entries.map(function(entry){return entry.rttMs;}).filter(function(value){return value>0;}),bitrateSamples=entries.map(function(entry){return entry.availableOutgoingBitrate;}).filter(function(value){return value>0;});
        emit('connection', { direct: direct, total: Math.max(peers.size, role === 'guest' ? 1 : 0), fallback: direct < peers.size, rttMs: rttSamples.length?Math.round(rttSamples.reduce(function(sum,value){return sum+value;},0)/rttSamples.length):0, availableOutgoingBitrate: bitrateSamples.length?Math.min.apply(Math,bitrateSamples):0 });
    }

    function sendToPeer(id, payload, options) {
        if (!id || id === peerId) return false;
        var serialized = typeof payload === 'string' ? payload : serializeNetworkPayload(payload);
        var entry = peers.get(id);
        var droppable = options && options.droppable;
        var bulk = options && options.bulk;
        transportStats.lastPacketBytes = serialized.length;
        if (entry) {
            var preferred = droppable ? entry.stateChannel : entry.controlChannel;
            // A critical control packet must never fall through to the
            // no-retransmit state lane. Use the reliable WebSocket relay until
            // the ordered control channel is available.
            var fallback = droppable && !bulk ? entry.controlChannel : null;
            var channel = preferred && preferred.readyState === 'open' ? preferred : fallback && fallback.readyState === 'open' ? fallback : null;
            if (channel) {
                if (droppable && channel.bufferedAmount > directBufferLimit(entry)) { transportStats.droppedState++; return false; }
                try { channel.send(serialized); if(droppable)transportStats.sentState++;else transportStats.sentControl++;return true; } catch (error) {}
            }
        }
        transportStats.relayFallbacks++;
        return sendSignal({ type: 'relay', to: id, data: serialized, droppable: !!droppable }, options);
    }

    function sendToHost(payload, options) {
        if (role === 'host') { emit('data', { from: peerId, data: payload, transport: 'local' }); return true; }
        return sendToPeer(hostId, payload, options);
    }

    function broadcast(payload, options) {
        if (role !== 'host') return false;
        // A snapshot can be large; serialize it once even in a four-player room.
        var serialized = typeof payload === 'string' ? payload : serializeNetworkPayload(payload);
        roomRoster.forEach(function (member) { if (member.id !== peerId) sendToPeer(member.id, serialized, options); });
        return true;
    }

    function closePeer(id) {
        var entry = peers.get(id);
        if (!entry) return;
        try { if (entry.controlChannel) entry.controlChannel.close(); } catch (error) {}
        try { if (entry.stateChannel && entry.stateChannel !== entry.controlChannel) entry.stateChannel.close(); } catch (error) {}
        try { entry.pc.close(); } catch (error) {}
        if (entry.statsTimer) clearInterval(entry.statsTimer);
        peers.delete(id);
        emitConnection();
    }

    function listRooms() { return sendSignal({ type: 'list_rooms' }); }
    function createRoom(meta, roomMeta) { return sendSignal({ type: 'create_room', meta: meta || {}, roomMeta: roomMeta || {} }); }
    function joinRoom(id, meta) { return sendSignal({ type: 'join_room', roomId: id, meta: meta || {} }); }
    function updatePresence(meta) { return sendSignal({ type: 'presence', name: displayName, meta: meta || {} }); }
    function updateRoom(state, meta) {
        if (role !== 'host') return false;
        roomState = state || roomState;
        return sendSignal({ type: 'update_room', state: roomState, meta: meta || {} });
    }
    function leaveRoom() {
        sendSignal({ type: 'leave_room' });
        Array.from(peers.keys()).forEach(closePeer);
        roomId = ''; hostId = ''; role = 'local'; roomRoster = []; roomState = 'menu';
        emit('left', {});
    }

    function disconnect() {
        manualClose = true;
        stopHeartbeat();
        serverRttMs = 0;
        leaveRoom();
        if (socket) socket.close();
        socket = null; peerId = '';
    }

    window.DKNet = {
        on: on,
        connect: connect,
        disconnect: disconnect,
        listRooms: listRooms,
        createRoom: createRoom,
        joinRoom: joinRoom,
        leaveRoom: leaveRoom,
        updatePresence: updatePresence,
        updateRoom: updateRoom,
        send: sendToPeer,
        sendToHost: sendToHost,
        broadcast: broadcast,
        setSignalUrl: function (url) { signalUrl = String(url || ''); },
        setIceServers: function (servers) { if (Array.isArray(servers) && servers.length) iceServers = servers; },
        state: function () { var entries=Array.from(peers.values()),rtt=entries.map(function(entry){return entry.rttMs;}).filter(function(value){return value>0;});return { peerId: peerId, hostId: hostId, roomId: roomId, role: role, name: displayName, roster: roomRoster.slice(), roomState: roomState, rtcSupported: rtcSupported, offlineBuild: !!window.DK_STANDALONE_OFFLINE, online: !!(socket && socket.readyState === WebSocket.OPEN), serverRttMs:serverRttMs, rttMs:rtt.length?Math.round(rtt.reduce(function(sum,value){return sum+value;},0)/rtt.length):0, transport:Object.assign({},transportStats) }; }
    };
}());

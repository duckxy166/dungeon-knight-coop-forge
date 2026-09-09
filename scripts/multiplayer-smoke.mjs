import http from 'node:http';
import net from 'node:net';
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function reservePort() {
    return new Promise((resolve, reject) => {
        const probe = net.createServer();
        probe.once('error', reject);
        probe.listen(0, '127.0.0.1', () => {
            const address = probe.address();
            probe.close((error) => error ? reject(error) : resolve(address.port));
        });
    });
}

function health(port) {
    return new Promise((resolve, reject) => {
        const request = http.get({ hostname: '127.0.0.1', port, path: '/health', timeout: 500 }, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
                catch (error) { reject(error); }
            });
        });
        request.once('timeout', () => request.destroy(new Error('health timeout')));
        request.once('error', reject);
    });
}

async function waitForHealth(port) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        try {
            const state = await health(port);
            if (state.ok) return state;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 40));
    }
    throw new Error('Room server did not become healthy.');
}

function encodeClientFrame(value, opcode = 1) {
    const body = Buffer.from(String(value));
    const mask = randomBytes(4);
    let header;
    if (body.length < 126) {
        header = Buffer.from([0x80 | opcode, 0x80 | body.length]);
    } else if (body.length < 65536) {
        header = Buffer.allocUnsafe(4);
        header[0] = 0x80 | opcode;
        header[1] = 0x80 | 126;
        header.writeUInt16BE(body.length, 2);
    } else {
        header = Buffer.allocUnsafe(10);
        header[0] = 0x80 | opcode;
        header[1] = 0x80 | 127;
        header.writeBigUInt64BE(BigInt(body.length), 2);
    }
    const masked = Buffer.allocUnsafe(body.length);
    for (let index = 0; index < body.length; index += 1) masked[index] = body[index] ^ mask[index % 4];
    return Buffer.concat([header, mask, masked]);
}

class TestPeer {
    constructor(name, port) {
        this.name = name;
        this.port = port;
        this.socket = null;
        this.buffer = Buffer.alloc(0);
        this.handshake = false;
        this.messages = [];
        this.waiters = [];
        this.peerId = '';
    }

    connect() {
        return new Promise((resolve, reject) => {
            const key = randomBytes(16).toString('base64');
            const socket = this.socket = net.createConnection({ host: '127.0.0.1', port: this.port });
            const timer = setTimeout(() => reject(new Error(this.name + ' WebSocket handshake timed out.')), 2500);
            socket.once('connect', () => {
                socket.write(
                    'GET /signal HTTP/1.1\r\n' +
                    'Host: 127.0.0.1:' + this.port + '\r\n' +
                    'Upgrade: websocket\r\n' +
                    'Connection: Upgrade\r\n' +
                    'Sec-WebSocket-Key: ' + key + '\r\n' +
                    'Sec-WebSocket-Version: 13\r\n\r\n'
                );
            });
            socket.on('data', (chunk) => {
                this.buffer = Buffer.concat([this.buffer, chunk]);
                if (!this.handshake) {
                    const marker = this.buffer.indexOf('\r\n\r\n');
                    if (marker < 0) return;
                    const headers = this.buffer.subarray(0, marker).toString('utf8');
                    if (!headers.startsWith('HTTP/1.1 101')) {
                        clearTimeout(timer);
                        reject(new Error(this.name + ' handshake failed: ' + headers));
                        return;
                    }
                    this.buffer = this.buffer.subarray(marker + 4);
                    this.handshake = true;
                    clearTimeout(timer);
                    resolve();
                }
                this.consumeFrames();
            });
            socket.once('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    consumeFrames() {
        while (this.handshake && this.buffer.length >= 2) {
            const opcode = this.buffer[0] & 0x0f;
            const masked = (this.buffer[1] & 0x80) !== 0;
            let length = this.buffer[1] & 0x7f;
            let offset = 2;
            if (length === 126) {
                if (this.buffer.length < 4) return;
                length = this.buffer.readUInt16BE(2);
                offset = 4;
            } else if (length === 127) {
                if (this.buffer.length < 10) return;
                length = Number(this.buffer.readBigUInt64BE(2));
                offset = 10;
            }
            const maskLength = masked ? 4 : 0;
            if (this.buffer.length < offset + maskLength + length) return;
            const mask = masked ? this.buffer.subarray(offset, offset + 4) : null;
            offset += maskLength;
            const body = Buffer.from(this.buffer.subarray(offset, offset + length));
            this.buffer = this.buffer.subarray(offset + length);
            if (mask) for (let index = 0; index < body.length; index += 1) body[index] ^= mask[index % 4];
            if (opcode === 8) return;
            if (opcode === 9) { this.socket.write(encodeClientFrame(body, 10)); continue; }
            if (opcode !== 1) continue;
            try { this.dispatch(JSON.parse(body.toString('utf8'))); } catch {}
        }
    }

    dispatch(message) {
        const waiterIndex = this.waiters.findIndex((waiter) => waiter.predicate(message));
        if (waiterIndex >= 0) {
            const [waiter] = this.waiters.splice(waiterIndex, 1);
            clearTimeout(waiter.timer);
            waiter.resolve(message);
        } else this.messages.push(message);
    }

    send(message) {
        this.socket.write(encodeClientFrame(JSON.stringify(message)));
    }

    waitFor(predicate, label, timeout = 3000) {
        const queuedIndex = this.messages.findIndex(predicate);
        if (queuedIndex >= 0) return Promise.resolve(this.messages.splice(queuedIndex, 1)[0]);
        return new Promise((resolve, reject) => {
            const waiter = { predicate, resolve, timer: null };
            waiter.timer = setTimeout(() => {
                this.waiters = this.waiters.filter((entry) => entry !== waiter);
                reject(new Error(this.name + ' timed out waiting for ' + label + '.'));
            }, timeout);
            this.waiters.push(waiter);
        });
    }

    close() {
        if (this.socket && !this.socket.destroyed) this.socket.end(encodeClientFrame('', 8));
    }
}

const port = await reservePort();
const server = spawn(process.execPath, ['server.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
});
let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += chunk; });
server.stderr.on('data', (chunk) => { serverOutput += chunk; });
const peers = ['HOST', 'อัศวินไทย', '勇者かな', 'GUEST3'].map((name) => new TestPeer(name, port));

try {
    const initialHealth = await waitForHealth(port);
    assert(initialHealth.version === '1.9.2', 'Health endpoint returned the wrong release: ' + JSON.stringify(initialHealth));
    await Promise.all(peers.map((peer) => peer.connect()));
    await Promise.all(peers.map(async (peer) => {
        peer.send({ type: 'hello', name: peer.name, version: '1.9.2' });
        const welcome = await peer.waitFor((message) => message.type === 'welcome', 'welcome');
        peer.peerId = welcome.peerId;
    }));

    const host = peers[0];
    const pingStarted = Date.now();
    host.send({ type: 'ping', at: pingStarted, sequence: 7 });
    const pingAck = await host.waitFor((message) => message.type === 'ping_ack' && message.sequence === 7, 'server ping');
    assert(pingAck.at === pingStarted && Date.now() - pingAck.at >= 0, 'Server ping response was invalid.');

    host.send({ type: 'create_room', meta: { classId: 'gunner' }, roomMeta: { snapshotHz: 20 } });
    const created = await host.waitFor((message) => message.type === 'room_created', 'fixed-rate room creation');
    const roomId = created.room.id;
    assert(created.room.meta.snapshotHz === 30, 'Legacy rate request was not locked to 30 Hz.');

    for (let slot = 1; slot < peers.length; slot += 1) {
        const peer = peers[slot];
        peer.send({ type: 'join_room', roomId, meta: { classId: ['gunner', 'magic', 'melee'][slot - 1] } });
        const joined = await peer.waitFor((message) => message.type === 'room_joined' && message.room.id === roomId, 'room join');
        const hostJoin = await host.waitFor((message) => message.type === 'peer_joined' && message.peer.id === peer.peerId, 'host roster update');
        assert(joined.room.meta.snapshotHz === 30 && hostJoin.roster.length === slot + 1, 'Room roster/rate desynchronized while joining.');
        assert(hostJoin.roster.find((entry) => entry.id === peer.peerId)?.name === peer.name, 'Unicode Thai/Japanese player name was altered in the room roster.');
    }

    host.send({ type: 'update_room', state: 'armory', meta: { wave: 5, snapshotHz: 20 } });
    const armoryUpdates = await Promise.all(peers.slice(1).map((peer) => peer.waitFor((message) => message.type === 'room_update' && message.room.state === 'armory', 'Armory room update')));
    assert(armoryUpdates.every((message) => message.room.meta.snapshotHz === 30 && message.room.meta.wave === 5), 'Armory update changed the host-selected rate or wave.');

    const build = { type: 'build_update', build: { revision: 7, coins: 993, inventory: [{ id: 'rustPistol', level: 2 }] } };
    peers[1].send({ type: 'relay', to: host.peerId, data: JSON.stringify(build), droppable: false });
    const relayedBuild = await host.waitFor((message) => message.type === 'relay' && message.from === peers[1].peerId, 'guest build relay');
    assert(JSON.stringify(JSON.parse(relayedBuild.data)) === JSON.stringify(build), 'Guest build relay was altered.');

    const snapshot = { type: 'snapshot', seq: 42, snapshotHz: 30, scene: 'armory', sceneRevision: 5, players: [], enemies: [] };
    for (const guest of peers.slice(1)) host.send({ type: 'relay', to: guest.peerId, data: JSON.stringify(snapshot), droppable: true });
    const relayedSnapshots = await Promise.all(peers.slice(1).map((peer) => peer.waitFor((message) => message.type === 'relay' && message.from === host.peerId, 'host snapshot relay')));
    assert(relayedSnapshots.every((message) => {
        const packet = JSON.parse(message.data);
        return packet.seq === 42 && packet.sceneRevision === 5;
    }), 'Host authoritative snapshot did not reach every guest intact.');

    host.send({ type: 'update_room', state: 'run', meta: { wave: 6 } });
    const runUpdates = await Promise.all(peers.slice(1).map((peer) => peer.waitFor((message) => message.type === 'room_update' && message.room.state === 'run', 'run resume update')));
    assert(runUpdates.every((message) => message.room.meta.snapshotHz === 30 && message.room.meta.wave === 6), 'Run resume desynchronized room metadata.');

    peers[3].close();
    const left = await host.waitFor((message) => message.type === 'peer_left' && message.peerId === peers[3].peerId, 'guest disconnect');
    assert(left.roster.length === 3, 'Disconnected guest remained in the host roster.');

    const finalHealth = await health(port);
    assert(finalHealth.rooms === 1 && finalHealth.players >= 3, 'Live server health counters were inconsistent: ' + JSON.stringify(finalHealth));
    console.log('Multiplayer smoke passed:', JSON.stringify({ peers: 4, relayGuests: 3, rate: 30, serverPing: true, armoryWave: 5, resumeWave: 6, thaiName: true, japaneseName: true, sceneRevision: 5 }));
} catch (error) {
    if (serverOutput.trim()) console.error(serverOutput.trim());
    throw error;
} finally {
    peers.forEach((peer) => peer.close());
    server.kill('SIGTERM');
}

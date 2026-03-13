const path = require('path');
const os = require('os');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const { GameRoom } = require('./GameRoom');
const { PORT, TICK_MS } = require('./constants');
const AUDIO_FILE_RE = /\.(m4a|mp3|wav|ogg)$/i;
const STATE_EMIT_MS = 50;
const CONTROLLER_STATE_EMIT_MS = 66;

function createRoomId() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function getLanUrls(port) {
  const out = [];
  const nets = os.networkInterfaces();
  for (const [name, entries] of Object.entries(nets)) {
    if (!entries) continue;
    for (const e of entries) {
      if (e.family !== 'IPv4' || e.internal) continue;
      out.push({ name, url: `http://${e.address}:${port}` });
    }
  }
  return out;
}

class GameServer {
  constructor() {
    this.rooms = new Map();

    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new Server(this.httpServer);

    this.setupApiRoutes();
    this.app.use(express.static(path.join(process.cwd(), 'public')));

    this.setupSocketHandlers();
    this.setupTicker();
  }

  setupApiRoutes() {
    this.app.get('/api/audio/hero-voices', (_req, res) => {
      const folder = path.join(process.cwd(), 'public', 'Sounds', 'HeroVoice');
      try {
        const clips = fs.readdirSync(folder, { withFileTypes: true })
          .filter((entry) => entry.isFile() && AUDIO_FILE_RE.test(entry.name))
          .map((entry) => entry.name)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
          .map((name) => `/Sounds/HeroVoice/${encodeURIComponent(name)}`);
        res.set('Cache-Control', 'no-store');
        res.json({ clips });
      } catch {
        res.status(500).json({ clips: [] });
      }
    });

    this.app.get('/api/audio/president-voices', (_req, res) => {
      const folder = path.join(process.cwd(), 'public', 'Sounds', 'PresidentVoice');
      try {
        const clips = fs.readdirSync(folder, { withFileTypes: true })
          .filter((entry) => entry.isFile() && AUDIO_FILE_RE.test(entry.name))
          .map((entry) => entry.name)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
          .map((name) => `/Sounds/PresidentVoice/${encodeURIComponent(name)}`);
        res.set('Cache-Control', 'no-store');
        res.json({ clips });
      } catch {
        res.status(500).json({ clips: [] });
      }
    });
  }

  setupTicker() {
    setInterval(() => {
      const nowMs = Date.now();
      for (const room of this.rooms.values()) {
        if (room.hostAuthoritative) continue;
        room.tick(TICK_MS / 1000);
        if (room.started) {
          const sfxEvents = room.consumeSfxEvents();
          if (sfxEvents.length) this.emitEventToDisplays(room, 'hit_sfx', sfxEvents);
          const damageEvents = room.consumeDamageEvents();
          if (damageEvents.length) this.emitEventToDisplays(room, 'damage_text', damageEvents);
          const lineEvents = room.consumeLineEvents();
          if (lineEvents.length) this.emitEventToDisplays(room, 'hero_line', lineEvents);
          if (!Number.isFinite(room.nextStateEmitAtMs) || nowMs >= room.nextStateEmitAtMs) {
            this.broadcastRoom(room, { forceController: false, nowMs });
            room.nextStateEmitAtMs = nowMs + STATE_EMIT_MS;
          }
        }
      }
    }, TICK_MS);
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('create_room', async ({ name, origin, mode }) => {
        let id = createRoomId();
        while (this.rooms.has(id)) id = createRoomId();

        const roomMode = mode === '2v2' ? '2v2' : '1v1';
        const room = new GameRoom(id, origin || '', { mode: roomMode });
        room.hostAuthoritative = true;
        room.lastHostState = null;
        room.lastControllerFrame = null;
        room.attachDisplay(socket.id, name || 'War Screen');

        this.rooms.set(id, room);
        socket.join(id);

        const joinUrl = `${origin || ''}?controller=1&room=${id}`;
        let qrDataUrl = null;
        try {
          qrDataUrl = await QRCode.toDataURL(joinUrl, { width: 300, margin: 1 });
        } catch {
          qrDataUrl = null;
        }

        socket.emit('room_created', {
          roomId: id,
          joinUrl,
          qrDataUrl,
          mode: room.mode,
          requiredPlayers: room.requiredPlayers(),
          hostAuthoritative: Boolean(room.hostAuthoritative),
        });
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('join_room', ({ roomId, name }) => {
        const room = this.rooms.get((roomId || '').toUpperCase());
        if (!room) {
          socket.emit('join_error', { message: 'Room not found.' });
          return;
        }

        const join = room.addPlayer(socket.id, name);
        if (!join) {
          socket.emit('join_error', { message: 'Room is full.' });
          return;
        }

        socket.join(room.id);
        socket.emit('joined_room', {
          roomId: room.id,
          side: join.side,
          slot: join.slot,
          mode: room.mode,
          requiredPlayers: room.requiredPlayers(),
        });
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('set_room_mode', ({ roomId, mode }) => {
        const room = this.rooms.get((roomId || '').toUpperCase());
        if (!room) {
          socket.emit('room_mode_error', { message: 'Room not found.' });
          return;
        }
        if (!room.display || room.display.id !== socket.id) {
          socket.emit('room_mode_error', { message: 'Only the host display can change room size.' });
          return;
        }
        const result = room.setMode(mode);
        if (!result?.ok) {
          socket.emit('room_mode_error', { message: result?.message || 'Unable to change room size.' });
          return;
        }
        socket.emit('room_mode_updated', {
          mode: room.mode,
          requiredPlayers: room.requiredPlayers(),
        });
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('restart_room', ({ roomId }) => {
        const room = this.rooms.get((roomId || '').toUpperCase());
        if (!room) {
          socket.emit('room_restart_error', { message: 'Room not found.' });
          return;
        }
        if (!room.display || room.display.id !== socket.id) {
          socket.emit('room_restart_error', { message: 'Only the host display can restart the match.' });
          return;
        }
        if (room.hostAuthoritative) {
          const gameOver = Boolean(room.lastHostState?.gameOver);
          if (!gameOver) {
            socket.emit('room_restart_error', { message: 'Match has not ended yet.' });
            return;
          }
          room.gameOver = false;
          room.winner = null;
          room.lastHostState = null;
          room.lastControllerFrame = null;
          this.io.to(room.id).emit('room_restarted', {
            mode: room.mode,
            requiredPlayers: room.requiredPlayers(),
          });
          this.broadcastRoom(room, { forceController: true });
          return;
        }
        const result = room.restartMatch();
        if (!result?.ok) {
          socket.emit('room_restart_error', { message: result?.message || 'Unable to restart match.' });
          return;
        }
        this.io.to(room.id).emit('room_restarted', {
          mode: room.mode,
          requiredPlayers: room.requiredPlayers(),
        });
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('control_pull', ({ roomId, x, y }) => {
        const room = this.rooms.get((roomId || '').toUpperCase());
        if (!room) return;
        if (room.hostAuthoritative) {
          const player = room.playerBySocket(socket.id);
          if (!player || !room.display?.id) return;
          this.io.to(room.display.id).emit('host_control_pull', {
            side: player.side,
            slot: player.slot,
            x,
            y,
          });
          return;
        }
        room.setControlPull(socket.id, x, y);
      });

      socket.on('host_state', ({ roomId, snapshot, controllerFrame, sfxEvents, damageEvents, lineEvents }) => {
        const room = this.rooms.get((roomId || '').toUpperCase());
        if (!room || !room.hostAuthoritative) return;
        if (!room.display || room.display.id !== socket.id) return;
        const nowMs = Date.now();
        if (controllerFrame) {
          room.lastControllerFrame = controllerFrame;
          room.gameOver = Boolean(controllerFrame.gameOver);
          room.winner = controllerFrame.winner || null;
        }
        if (snapshot) {
          room.lastHostState = snapshot;
          room.gameOver = Boolean(snapshot.gameOver);
          room.winner = snapshot.winner || null;
          this.emitStateToDisplays(room, snapshot, { excludeDisplay: true });
        } else {
          room.lastHostState = null;
        }
        this.emitControllerStates(room, room.lastControllerFrame || snapshot, false, nowMs);
        if (Array.isArray(sfxEvents) && sfxEvents.length) this.emitEventToDisplays(room, 'hit_sfx', sfxEvents, { excludeDisplay: true });
        if (Array.isArray(damageEvents) && damageEvents.length) this.emitEventToDisplays(room, 'damage_text', damageEvents, { excludeDisplay: true });
        if (Array.isArray(lineEvents) && lineEvents.length) this.emitEventToDisplays(room, 'hero_line', lineEvents, { excludeDisplay: true });
      });

      socket.on('disconnect', () => {
        for (const [roomId, room] of this.rooms.entries()) {
          const { changed, empty } = room.removeSocket(socket.id);
          if (!changed) continue;

          if (empty) {
            this.rooms.delete(roomId);
          } else {
            this.io.to(room.id).emit('player_left');
            this.broadcastRoom(room, { forceController: true });
          }
        }
      });
    });
  }

  roomPlayerSocketIds(room) {
    const ids = [];
    for (const p of room.players.left) if (p?.id) ids.push(p.id);
    for (const p of room.players.right) if (p?.id) ids.push(p.id);
    return ids;
  }

  emitStateToDisplays(room, snapshot, options = {}) {
    const { excludeDisplay = false } = options;
    if (!snapshot) return;
    let out = this.io.to(room.id);
    const playerIds = this.roomPlayerSocketIds(room);
    for (const id of playerIds) out = out.except(id);
    if (excludeDisplay && room.display?.id) out = out.except(room.display.id);
    out.emit('state', snapshot);
  }

  emitEventToDisplays(room, eventName, payload, options = {}) {
    const { excludeDisplay = false } = options;
    let out = this.io.to(room.id);
    const playerIds = this.roomPlayerSocketIds(room);
    for (const id of playerIds) out = out.except(id);
    if (excludeDisplay && room.display?.id) out = out.except(room.display.id);
    out.emit(eventName, payload);
  }

  compactControllerSide(sideState) {
    return {
      towerHp: Number(sideState?.towerHp) || 0,
      shotCd: Number(sideState?.shotCd) || 0,
      pendingShotPower: sideState?.pendingShotPower || null,
      pendingShotPowerShots: Math.max(0, Number(sideState?.pendingShotPowerShots) || 0),
      arrowsFired: Math.max(0, Number(sideState?.arrowsFired) || 0),
      arrowHits: Math.max(0, Number(sideState?.arrowHits) || 0),
      comboHitStreak: Math.max(0, Number(sideState?.comboHitStreak) || 0),
    };
  }

  buildControllerState(room, snapshot, side, slot) {
    const source = snapshot || {
      mode: room.mode,
      started: room.started,
      gameOver: room.gameOver,
      winner: room.winner,
      left: room.left,
      right: room.right,
      requiredPlayers: room.requiredPlayers(),
      playerCount: room.totalPlayers(),
    };
    const sideName = side === 'right' ? 'right' : 'left';
    const enemySide = sideName === 'left' ? 'right' : 'left';
    return {
      roomId: room.id,
      side: sideName,
      slot: Number.isFinite(slot) ? slot : 0,
      mode: source.mode === '2v2' ? '2v2' : '1v1',
      started: Boolean(source.started),
      gameOver: Boolean(source.gameOver),
      winner: source.winner || null,
      requiredPlayers: Number(source.requiredPlayers) || room.requiredPlayers(),
      playerCount: Number(source.playerCount) || room.totalPlayers(),
      me: this.compactControllerSide(source[sideName]),
      enemy: this.compactControllerSide(source[enemySide]),
    };
  }

  emitControllerStates(room, snapshot = null, force = false, nowMs = Date.now()) {
    if (
      !force
      && Number.isFinite(room.nextControllerStateEmitAtMs)
      && nowMs < room.nextControllerStateEmitAtMs
    ) return;

    room.nextControllerStateEmitAtMs = nowMs + CONTROLLER_STATE_EMIT_MS;
    for (const p of room.players.left) {
      if (!p?.id) continue;
      this.io.to(p.id).emit('controller_state', this.buildControllerState(room, snapshot, 'left', p.slot));
    }
    for (const p of room.players.right) {
      if (!p?.id) continue;
      this.io.to(p.id).emit('controller_state', this.buildControllerState(room, snapshot, 'right', p.slot));
    }
  }

  roomSpectatorDisplayCount(room) {
    const roomSet = this.io?.sockets?.adapter?.rooms?.get(room.id);
    if (!roomSet) return 0;
    const known = new Set(this.roomPlayerSocketIds(room));
    if (room.display?.id) known.add(room.display.id);
    let count = 0;
    for (const id of roomSet.values()) {
      if (known.has(id)) continue;
      count += 1;
    }
    return count;
  }

  roomRoster(room) {
    return {
      roomId: room.id,
      mode: room.mode,
      archersPerSide: room.archersPerSide,
      requiredPlayers: room.requiredPlayers(),
      playerCount: room.totalPlayers(),
      started: room.started,
      spectatorDisplays: this.roomSpectatorDisplayCount(room),
      players: {
        left: room.players.left.map((p) => ({ id: p.id, name: p.name, slot: p.slot })),
        right: room.players.right.map((p) => ({ id: p.id, name: p.name, slot: p.slot })),
      },
    };
  }

  broadcastRoom(room, options = {}) {
    const {
      forceController = false,
      nowMs = Date.now(),
    } = options;
    if (room.hostAuthoritative) {
      this.io.to(room.id).emit('room_roster', this.roomRoster(room));
      let fallbackSnapshot = null;
      if (!room.lastHostState || !room.started) fallbackSnapshot = room.serialize();
      const controllerSource = room.lastControllerFrame || room.lastHostState || fallbackSnapshot;
      this.emitControllerStates(room, controllerSource, forceController, nowMs);
      if (!room.started) {
        this.emitStateToDisplays(room, fallbackSnapshot, { excludeDisplay: true });
      }
      return;
    }
    const snapshot = room.serialize();
    this.emitStateToDisplays(room, snapshot);
    this.emitControllerStates(room, snapshot, forceController, nowMs);
  }

  listen(port = PORT) {
    this.httpServer.listen(port, '0.0.0.0', () => {
      console.log('Tale of Two Kingdoms server running');
      console.log(`Local:   http://localhost:${port}`);

      const lanUrls = getLanUrls(port);
      if (lanUrls.length) {
        const preferred = lanUrls.find((x) => x.name === 'en0') || lanUrls[0];
        console.log(`LAN:     ${preferred.url}  (open this on the host screen)`);
        console.log('Phones:  join via QR from that host page while on same Wi-Fi');
      } else {
        console.log('LAN:     No LAN IPv4 address found.');
      }
    });
  }
}

module.exports = { GameServer };

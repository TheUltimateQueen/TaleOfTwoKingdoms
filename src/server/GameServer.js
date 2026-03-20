const path = require('path');
const os = require('os');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const { PORT } = require('./constants');
const AUDIO_FILE_RE = /\.(m4a|mp3|wav|ogg)$/i;
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

class ServerRoom {
  constructor(id, options = {}) {
    this.id = id;
    this.mode = options?.mode === '2v2' ? '2v2' : '1v1';
    this.archersPerSide = this.mode === '2v2' ? 2 : 1;
    this.display = null;
    this.players = { left: [], right: [] };
    this.started = false;
    this.gameOver = false;
    this.winner = null;
    this.lastHostState = null;
    this.lastControllerFrame = null;
    this.nextControllerStateEmitAtMs = null;
    this.hostAuthoritative = true;
    this.rematchVotes = new Set();
  }

  requiredPlayers() {
    return this.archersPerSide * 2;
  }

  totalPlayers() {
    return this.players.left.length + this.players.right.length;
  }

  isReadyToStart() {
    return this.players.left.length >= this.archersPerSide && this.players.right.length >= this.archersPerSide;
  }

  clearRematchVotes() {
    this.rematchVotes.clear();
  }

  activePlayerSocketIds() {
    const ids = [];
    for (const p of this.players.left) if (p?.id) ids.push(p.id);
    for (const p of this.players.right) if (p?.id) ids.push(p.id);
    return ids;
  }

  sanitizeRematchVotes() {
    if (!this.rematchVotes.size) return;
    const activeIds = new Set(this.activePlayerSocketIds());
    for (const id of Array.from(this.rematchVotes)) {
      if (!activeIds.has(id)) this.rematchVotes.delete(id);
    }
  }

  setRematchVote(socketId, wantsRematch) {
    const found = this.playerBySocket(socketId);
    if (!found) return { ok: false, message: 'Only connected controllers can vote for rematch.' };
    if (wantsRematch) this.rematchVotes.add(socketId);
    else this.rematchVotes.delete(socketId);
    this.sanitizeRematchVotes();
    return { ok: true };
  }

  rematchStatus(socketId = null) {
    this.sanitizeRematchVotes();
    const totalConnected = this.totalPlayers();
    const votes = this.rematchVotes.size;
    const requiredPlayers = this.requiredPlayers();
    const missingPlayers = Math.max(0, requiredPlayers - totalConnected);
    return {
      votes,
      totalConnected,
      requiredPlayers,
      missingPlayers,
      requested: socketId ? this.rematchVotes.has(socketId) : false,
      allConnectedReady: totalConnected > 0 && votes >= totalConnected,
      immediateRematchReady: this.isReadyToStart(),
    };
  }

  attachDisplay(socketId, name) {
    this.display = { id: socketId, name: name || 'War Screen' };
  }

  playerBySocket(socketId) {
    const leftPlayer = this.players.left.find((p) => p.id === socketId);
    if (leftPlayer) return { side: 'left', slot: leftPlayer.slot, player: leftPlayer };
    const rightPlayer = this.players.right.find((p) => p.id === socketId);
    if (rightPlayer) return { side: 'right', slot: rightPlayer.slot, player: rightPlayer };
    return null;
  }

  addPlayer(socketId, name) {
    const existing = this.playerBySocket(socketId);
    if (existing) return { side: existing.side, slot: existing.slot, existing: true };
    if (this.totalPlayers() >= this.requiredPlayers()) return null;

    const leftCount = this.players.left.length;
    const rightCount = this.players.right.length;
    const side = leftCount <= rightCount ? 'left' : 'right';
    const slot = this.players[side].length;
    if (slot >= this.archersPerSide) {
      const otherSide = side === 'left' ? 'right' : 'left';
      const otherSlot = this.players[otherSide].length;
      if (otherSlot >= this.archersPerSide) return null;
      const player = {
        id: socketId,
        name: name || (otherSide === 'left' ? `West Archer ${otherSlot + 1}` : `East Archer ${otherSlot + 1}`),
        slot: otherSlot,
      };
      this.players[otherSide].push(player);
      this.started = this.isReadyToStart();
      return { side: otherSide, slot: otherSlot, existing: false };
    }

    const player = {
      id: socketId,
      name: name || (side === 'left' ? `West Archer ${slot + 1}` : `East Archer ${slot + 1}`),
      slot,
    };
    this.players[side].push(player);
    this.started = this.isReadyToStart();
    return { side, slot, existing: false };
  }

  setMode(mode) {
    const nextMode = mode === '2v2' ? '2v2' : '1v1';
    if (this.started) {
      return { ok: false, message: 'Cannot change room size after the match has started.' };
    }
    if (nextMode === this.mode) return { ok: true, changed: false };

    const nextArchersPerSide = nextMode === '2v2' ? 2 : 1;
    if (this.players.left.length > nextArchersPerSide || this.players.right.length > nextArchersPerSide) {
      return { ok: false, message: 'Too many controllers are connected to switch to 2 players.' };
    }

    this.mode = nextMode;
    this.archersPerSide = nextArchersPerSide;
    this.started = this.isReadyToStart();
    this.clearRematchVotes();
    return { ok: true, changed: true };
  }

  removeSocket(socketId) {
    let changed = false;
    if (this.display && this.display.id === socketId) {
      this.display = null;
      changed = true;
    }
    this.rematchVotes.delete(socketId);
    const leftBefore = this.players.left.length;
    this.players.left = this.players.left.filter((p) => p.id !== socketId);
    if (this.players.left.length !== leftBefore) {
      this.players.left.forEach((p, idx) => { p.slot = idx; });
      changed = true;
    }
    const rightBefore = this.players.right.length;
    this.players.right = this.players.right.filter((p) => p.id !== socketId);
    if (this.players.right.length !== rightBefore) {
      this.players.right.forEach((p, idx) => { p.slot = idx; });
      changed = true;
    }

    if (changed) this.started = this.isReadyToStart();

    return {
      changed,
      empty: this.players.left.length === 0 && this.players.right.length === 0 && !this.display,
    };
  }
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

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('create_room', async ({ name, origin, mode }) => {
        let id = createRoomId();
        while (this.rooms.has(id)) id = createRoomId();

        const roomMode = mode === '2v2' ? '2v2' : '1v1';
        const room = new ServerRoom(id, { mode: roomMode });
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
        const result = this.restartAfterGameOver(room, { trigger: 'host' });
        if (!result?.ok) {
          socket.emit('room_restart_error', { message: 'Match has not ended yet.' });
          return;
        }
      });

      socket.on('controller_rematch', ({ roomId, wantsRematch }) => {
        const room = this.rooms.get((roomId || '').toUpperCase());
        if (!room) {
          socket.emit('controller_rematch_error', { message: 'Room not found.' });
          return;
        }
        const player = room.playerBySocket(socket.id);
        if (!player) {
          socket.emit('controller_rematch_error', { message: 'Only connected controllers can request rematch.' });
          return;
        }
        if (!Boolean(room.lastHostState?.gameOver || room.lastControllerFrame?.gameOver || room.gameOver)) {
          socket.emit('controller_rematch_error', { message: 'Rematch is only available after match end.' });
          return;
        }
        const voteResult = room.setRematchVote(socket.id, wantsRematch !== false);
        if (!voteResult?.ok) {
          socket.emit('controller_rematch_error', { message: voteResult?.message || 'Unable to record rematch vote.' });
          return;
        }
        const autoResult = this.autoResolveControllerRematch(room);
        if (autoResult?.ok) return;
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
      });

      socket.on('host_state', ({ roomId, snapshot, controllerFrame, sfxEvents, damageEvents, lineEvents }) => {
        const room = this.rooms.get((roomId || '').toUpperCase());
        if (!room || !room.hostAuthoritative) return;
        if (!room.display || room.display.id !== socket.id) return;
        const nowMs = Date.now();
        const wasGameOver = Boolean(room.gameOver);
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
        if (wasGameOver && !room.gameOver) room.clearRematchVotes();
        if (!room.gameOver && room.rematchVotes.size) room.clearRematchVotes();
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
            const autoResult = this.autoResolveControllerRematch(room);
            if (!autoResult?.ok) this.broadcastRoom(room, { forceController: true });
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

  restartAfterGameOver(room, options = {}) {
    const trigger = options?.trigger === 'controllers' ? 'controllers' : 'host';
    const gameOver = Boolean(room.lastHostState?.gameOver || room.lastControllerFrame?.gameOver || room.gameOver);
    if (!gameOver) return { ok: false, message: 'Match has not ended yet.' };
    const immediateRematch = room.isReadyToStart();
    const waitingForPlayers = !immediateRematch;
    room.gameOver = false;
    room.winner = null;
    room.lastHostState = null;
    room.lastControllerFrame = null;
    room.started = room.isReadyToStart();
    room.clearRematchVotes();
    this.io.to(room.id).emit('room_restarted', {
      mode: room.mode,
      requiredPlayers: room.requiredPlayers(),
      trigger,
      immediateRematch,
      waitingForPlayers,
    });
    this.broadcastRoom(room, { forceController: true });
    return { ok: true, immediateRematch, waitingForPlayers };
  }

  autoResolveControllerRematch(room) {
    if (!Boolean(room.gameOver || room.lastHostState?.gameOver || room.lastControllerFrame?.gameOver)) {
      return { ok: false, message: 'Match is not over.' };
    }
    const status = room.rematchStatus();
    if (!status.allConnectedReady) return { ok: false, status };
    return this.restartAfterGameOver(room, { trigger: 'controllers' });
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

  buildControllerState(room, snapshot, side, slot, socketId = null) {
    const defaultSide = {
      towerHp: 0,
      shotCd: 0,
      pendingShotPower: null,
      pendingShotPowerShots: 0,
      arrowsFired: 0,
      arrowHits: 0,
      comboHitStreak: 0,
    };
    const source = snapshot || {
      mode: room.mode,
      started: room.started,
      gameOver: room.gameOver,
      winner: room.winner,
      left: defaultSide,
      right: defaultSide,
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
      me: this.compactControllerSide(source[sideName] || defaultSide),
      enemy: this.compactControllerSide(source[enemySide] || defaultSide),
      rematch: room.rematchStatus(socketId),
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
      this.io.to(p.id).emit('controller_state', this.buildControllerState(room, snapshot, 'left', p.slot, p.id));
    }
    for (const p of room.players.right) {
      if (!p?.id) continue;
      this.io.to(p.id).emit('controller_state', this.buildControllerState(room, snapshot, 'right', p.slot, p.id));
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
      rematch: room.rematchStatus(),
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
    this.io.to(room.id).emit('room_roster', this.roomRoster(room));
    const controllerSource = room.lastControllerFrame || room.lastHostState || null;
    this.emitControllerStates(room, controllerSource, forceController, nowMs);
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

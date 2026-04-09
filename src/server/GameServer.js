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
const ROOM_CREATE_COOLDOWN_MS = 800;
const MAX_ACTIVE_ROOMS = 120;
const THEME_MODE_THEMED = 'themed';
const THEME_MODE_UNTHEMED = 'unthemed';

function normalizeThemeMode(value) {
  return value === THEME_MODE_UNTHEMED ? THEME_MODE_UNTHEMED : THEME_MODE_THEMED;
}

function defaultArcherName(side, slot = 0, themeMode = THEME_MODE_THEMED) {
  const sideName = side === 'right' ? 'right' : 'left';
  const index = Math.max(1, Math.floor(Number(slot) || 0) + 1);
  if (normalizeThemeMode(themeMode) === THEME_MODE_UNTHEMED) {
    return `${sideName === 'left' ? 'West Archer' : 'East Archer'} ${index}`;
  }
  return `${sideName === 'left' ? 'Bread Slinger' : 'Rice Flinger'} ${index}`;
}

function isDefaultPlayerName(name) {
  const value = String(name || '').trim();
  if (!value) return false;
  return (
    /^West Archer \d+$/i.test(value)
    || /^East Archer \d+$/i.test(value)
    || /^Bread Slinger \d+$/i.test(value)
    || /^Rice Flinger \d+$/i.test(value)
    || /^West Keyboard$/i.test(value)
    || /^East Keyboard$/i.test(value)
    || /^Bread Keyboard$/i.test(value)
    || /^Rice Keyboard$/i.test(value)
  );
}

function createRoomId() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function safePayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
}

function normalizeRoomId(value) {
  return String(value || '').trim().toUpperCase();
}

function normalizeJoinOrigin(value) {
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    url.hash = '';
    url.search = '';
    return url.toString();
  } catch {
    return '';
  }
}

function buildJoinUrl(origin, roomId) {
  const safeOrigin = normalizeJoinOrigin(origin);
  if (!safeOrigin) return `?controller=1&room=${roomId}`;
  const base = safeOrigin.endsWith('/') ? safeOrigin.slice(0, -1) : safeOrigin;
  return `${base}?controller=1&room=${roomId}`;
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
    this.themeMode = normalizeThemeMode(options?.themeMode || options?.theme || THEME_MODE_THEMED);
    this.archersPerSide = this.mode === '2v2' ? 2 : 1;
    this.display = null;
    this.players = { left: [], right: [] };
    this.cpuSlots = this.createCpuSlots();
    this.nextBalancedJoinSide = 'left';
    this.started = false;
    this.gameOver = false;
    this.winner = null;
    this.lastHostState = null;
    this.lastControllerFrame = null;
    this.nextControllerStateEmitAtMs = null;
    this.hostAuthoritative = true;
    this.rematchVotes = new Set();
  }

  createCpuSlots() {
    return {
      left: Array.from({ length: this.archersPerSide }, () => false),
      right: Array.from({ length: this.archersPerSide }, () => false),
    };
  }

  normalizeCpuSlotsShape() {
    if (!this.cpuSlots || typeof this.cpuSlots !== 'object') this.cpuSlots = {};
    for (const side of ['left', 'right']) {
      const current = Array.isArray(this.cpuSlots[side]) ? this.cpuSlots[side] : [];
      this.cpuSlots[side] = Array.from(
        { length: this.archersPerSide },
        (_unused, idx) => Boolean(current[idx])
      );
    }
  }

  playerInSlot(side, slot) {
    const sideName = side === 'right' ? 'right' : 'left';
    const lane = Math.max(0, Math.floor(Number(slot) || 0));
    return this.players[sideName].find((p) => Number(p?.slot) === lane) || null;
  }

  isCpuSlot(side, slot) {
    const sideName = side === 'right' ? 'right' : 'left';
    const lane = Math.max(0, Math.floor(Number(slot) || 0));
    if (lane >= this.archersPerSide) return false;
    return Boolean(this.cpuSlots?.[sideName]?.[lane]);
  }

  slotFilled(side, slot) {
    return Boolean(this.playerInSlot(side, slot) || this.isCpuSlot(side, slot));
  }

  filledSlotsForSide(side) {
    const sideName = side === 'right' ? 'right' : 'left';
    let count = 0;
    for (let slot = 0; slot < this.archersPerSide; slot += 1) {
      if (this.slotFilled(sideName, slot)) count += 1;
    }
    return count;
  }

  totalFilledSlots() {
    return this.filledSlotsForSide('left') + this.filledSlotsForSide('right');
  }

  availableHumanJoinSlots(side) {
    const sideName = side === 'right' ? 'right' : 'left';
    const open = [];
    for (let slot = 0; slot < this.archersPerSide; slot += 1) {
      if (this.isCpuSlot(sideName, slot)) continue;
      if (this.playerInSlot(sideName, slot)) continue;
      open.push(slot);
    }
    return open;
  }

  defaultPlayerNameForSide(side, slot = 0) {
    return defaultArcherName(side, slot, this.themeMode);
  }

  renameDefaultPlayersForTheme() {
    for (const sideName of ['left', 'right']) {
      const sidePlayers = Array.isArray(this.players?.[sideName]) ? this.players[sideName] : [];
      for (let i = 0; i < sidePlayers.length; i += 1) {
        const player = sidePlayers[i];
        if (!player || !isDefaultPlayerName(player.name)) continue;
        player.name = this.defaultPlayerNameForSide(sideName, Number.isFinite(player.slot) ? player.slot : i);
      }
    }
  }

  requiredPlayers() {
    return this.archersPerSide * 2;
  }

  totalPlayers() {
    return this.players.left.length + this.players.right.length;
  }

  isReadyToStart() {
    return this.filledSlotsForSide('left') >= this.archersPerSide
      && this.filledSlotsForSide('right') >= this.archersPerSide;
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
    this.display = { id: socketId, name: name || 'Fuel Screen' };
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
    const leftOpen = this.availableHumanJoinSlots('left');
    const rightOpen = this.availableHumanJoinSlots('right');
    if (!leftOpen.length && !rightOpen.length) return null;

    let side = 'left';
    if (leftOpen.length && rightOpen.length) {
      const leftCount = this.players.left.length;
      const rightCount = this.players.right.length;
      if (leftCount === rightCount) {
        side = this.nextBalancedJoinSide === 'right' ? 'right' : 'left';
        const preferredOpen = side === 'left' ? leftOpen : rightOpen;
        if (!preferredOpen.length) side = side === 'left' ? 'right' : 'left';
        this.nextBalancedJoinSide = side === 'left' ? 'right' : 'left';
      } else if (leftCount < rightCount) {
        side = leftOpen.length ? 'left' : 'right';
      } else {
        side = rightOpen.length ? 'right' : 'left';
      }
    } else {
      side = leftOpen.length ? 'left' : 'right';
    }

    const sideOpen = side === 'left' ? leftOpen : rightOpen;
    const slot = sideOpen[0];
    if (!Number.isFinite(slot)) return null;

    const player = {
      id: socketId,
      name: name || this.defaultPlayerNameForSide(side, slot),
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
    for (const side of ['left', 'right']) {
      const outOfRangeHuman = this.players[side].some((p) => (Number(p?.slot) || 0) >= nextArchersPerSide);
      if (outOfRangeHuman) return { ok: false, message: 'Too many controllers are connected to switch to 2 players.' };
      const outOfRangeCpu = Array.isArray(this.cpuSlots?.[side])
        && this.cpuSlots[side].some((flag, idx) => idx >= nextArchersPerSide && Boolean(flag));
      if (outOfRangeCpu) {
        return { ok: false, message: 'Disable extra CPU slots before switching to 2 players.' };
      }
    }

    this.mode = nextMode;
    this.archersPerSide = nextArchersPerSide;
    this.normalizeCpuSlotsShape();
    this.started = this.isReadyToStart();
    this.clearRematchVotes();
    return { ok: true, changed: true };
  }

  setCpuSlot(side, slot, enabled) {
    const sideName = side === 'right' ? 'right' : 'left';
    const lane = Math.floor(Number(slot));
    if (!Number.isFinite(lane) || lane < 0 || lane >= this.archersPerSide) {
      return { ok: false, message: 'Invalid CPU slot.' };
    }
    if (this.started) {
      return { ok: false, message: 'Cannot change CPU slots after the match has started.' };
    }
    if (Boolean(enabled) && this.playerInSlot(sideName, lane)) {
      return { ok: false, message: 'A controller is already connected in that slot.' };
    }
    this.normalizeCpuSlotsShape();
    const next = Boolean(enabled);
    const previous = Boolean(this.cpuSlots[sideName][lane]);
    this.cpuSlots[sideName][lane] = next;
    this.started = this.isReadyToStart();
    return { ok: true, changed: previous !== next };
  }

  setThemeMode(themeMode) {
    const nextTheme = normalizeThemeMode(themeMode);
    if (this.started) {
      return { ok: false, message: 'Cannot change theme after the match has started.' };
    }
    if (nextTheme === this.themeMode) return { ok: true, changed: false };
    this.themeMode = nextTheme;
    this.renameDefaultPlayersForTheme();
    return { ok: true, changed: true };
  }

  removeSocket(socketId) {
    let changed = false;
    let removedDisplay = false;
    if (this.display && this.display.id === socketId) {
      this.display = null;
      removedDisplay = true;
      changed = true;
    }
    this.rematchVotes.delete(socketId);
    const leftBefore = this.players.left.length;
    this.players.left = this.players.left.filter((p) => p.id !== socketId);
    if (this.players.left.length !== leftBefore) changed = true;
    const rightBefore = this.players.right.length;
    this.players.right = this.players.right.filter((p) => p.id !== socketId);
    if (this.players.right.length !== rightBefore) changed = true;

    if (changed) this.started = this.isReadyToStart();

    return {
      changed,
      removedDisplay,
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

  roomByDisplaySocketId(socketId) {
    for (const room of this.rooms.values()) {
      if (room.display?.id === socketId) return room;
    }
    return null;
  }

  closeRoom(room, reason = 'Room closed.') {
    if (!room) return;
    this.io.to(room.id).emit('room_closed', { message: reason });
    const roomSet = this.io?.sockets?.adapter?.rooms?.get(room.id);
    if (roomSet) {
      for (const id of Array.from(roomSet.values())) {
        this.io.sockets.sockets.get(id)?.leave(room.id);
      }
    }
    this.rooms.delete(room.id);
  }

  async emitRoomCreated(socket, room, origin) {
    const joinUrl = buildJoinUrl(origin, room.id);
    let qrDataUrl = null;
    try {
      qrDataUrl = await QRCode.toDataURL(joinUrl, { width: 300, margin: 1 });
    } catch {
      qrDataUrl = null;
    }

    socket.emit('room_created', {
      roomId: room.id,
      joinUrl,
      qrDataUrl,
      mode: room.mode,
      themeMode: room.themeMode,
      requiredPlayers: room.requiredPlayers(),
      hostAuthoritative: Boolean(room.hostAuthoritative),
    });
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
      let lastRoomCreateAtMs = 0;

      socket.on('create_room', async (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const nowMs = Date.now();
        if (nowMs - lastRoomCreateAtMs < ROOM_CREATE_COOLDOWN_MS) {
          socket.emit('room_create_error', { message: 'Please wait a moment before creating another room.' });
          return;
        }
        lastRoomCreateAtMs = nowMs;

        const existingRoom = this.roomByDisplaySocketId(socket.id);
        if (existingRoom) {
          socket.join(existingRoom.id);
          await this.emitRoomCreated(socket, existingRoom, payload.origin);
          this.broadcastRoom(existingRoom, { forceController: true });
          return;
        }

        if (this.rooms.size >= MAX_ACTIVE_ROOMS) {
          socket.emit('room_create_error', { message: 'Server is at room capacity. Please try again shortly.' });
          return;
        }

        let id = createRoomId();
        while (this.rooms.has(id)) id = createRoomId();

        const roomMode = payload.mode === '2v2' ? '2v2' : '1v1';
        const roomThemeMode = normalizeThemeMode(payload.themeMode || THEME_MODE_THEMED);
        const room = new ServerRoom(id, { mode: roomMode, themeMode: roomThemeMode });
        room.attachDisplay(socket.id, payload.name || 'Fuel Screen');

        this.rooms.set(id, room);
        socket.join(id);
        await this.emitRoomCreated(socket, room, payload.origin);
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('join_room', (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const room = this.rooms.get(normalizeRoomId(payload.roomId));
        if (!room) {
          socket.emit('join_error', { message: 'Room not found.' });
          return;
        }

        const join = room.addPlayer(socket.id, payload.name);
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
          themeMode: room.themeMode,
          requiredPlayers: room.requiredPlayers(),
        });
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('set_room_mode', (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const room = this.rooms.get(normalizeRoomId(payload.roomId));
        if (!room) {
          socket.emit('room_mode_error', { message: 'Room not found.' });
          return;
        }
        if (!room.display || room.display.id !== socket.id) {
          socket.emit('room_mode_error', { message: 'Only the host display can change room size.' });
          return;
        }
        const result = room.setMode(payload.mode);
        if (!result?.ok) {
          socket.emit('room_mode_error', { message: result?.message || 'Unable to change room size.' });
          return;
        }
        socket.emit('room_mode_updated', {
          mode: room.mode,
          themeMode: room.themeMode,
          requiredPlayers: room.requiredPlayers(),
        });
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('set_room_theme', (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const room = this.rooms.get(normalizeRoomId(payload.roomId));
        if (!room) {
          socket.emit('room_theme_error', { message: 'Room not found.' });
          return;
        }
        if (!room.display || room.display.id !== socket.id) {
          socket.emit('room_theme_error', { message: 'Only the host display can change theme.' });
          return;
        }
        const result = room.setThemeMode(payload.themeMode);
        if (!result?.ok) {
          socket.emit('room_theme_error', { message: result?.message || 'Unable to change theme.' });
          return;
        }
        this.io.to(room.id).emit('room_theme_updated', { themeMode: room.themeMode });
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('set_cpu_slot', (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const room = this.rooms.get(normalizeRoomId(payload.roomId));
        if (!room) {
          socket.emit('room_cpu_error', { message: 'Room not found.' });
          return;
        }
        if (!room.display || room.display.id !== socket.id) {
          socket.emit('room_cpu_error', { message: 'Only the host display can change CPU slots.' });
          return;
        }
        const result = room.setCpuSlot(payload.side, payload.slot, payload.enabled !== false);
        if (!result?.ok) {
          socket.emit('room_cpu_error', { message: result?.message || 'Unable to change CPU slot.' });
          return;
        }
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('restart_room', (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const room = this.rooms.get(normalizeRoomId(payload.roomId));
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

      socket.on('controller_rematch', (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const room = this.rooms.get(normalizeRoomId(payload.roomId));
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
        const voteResult = room.setRematchVote(socket.id, payload.wantsRematch !== false);
        if (!voteResult?.ok) {
          socket.emit('controller_rematch_error', { message: voteResult?.message || 'Unable to record rematch vote.' });
          return;
        }
        const autoResult = this.autoResolveControllerRematch(room);
        if (autoResult?.ok) return;
        this.broadcastRoom(room, { forceController: true });
      });

      socket.on('control_pull', (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const room = this.rooms.get(normalizeRoomId(payload.roomId));
        if (!room) return;
        if (room.hostAuthoritative) {
          const player = room.playerBySocket(socket.id);
          if (!player || !room.display?.id) return;
          this.io.to(room.display.id).emit('host_control_pull', {
            side: player.side,
            slot: player.slot,
            x: payload.x,
            y: payload.y,
          });
          return;
        }
      });

      socket.on('host_state', (rawPayload = {}) => {
        const payload = safePayload(rawPayload);
        const room = this.rooms.get(normalizeRoomId(payload.roomId));
        if (!room || !room.hostAuthoritative) return;
        if (!room.display || room.display.id !== socket.id) return;
        const nowMs = Date.now();
        const wasGameOver = Boolean(room.gameOver);
        const frameThemeMode = normalizeThemeMode(payload.controllerFrame?.themeMode || payload.snapshot?.themeMode || room.themeMode);
        if (room.themeMode !== frameThemeMode) room.themeMode = frameThemeMode;
        if (payload.controllerFrame && typeof payload.controllerFrame === 'object') {
          payload.controllerFrame.themeMode = frameThemeMode;
          room.lastControllerFrame = payload.controllerFrame;
          room.gameOver = Boolean(payload.controllerFrame.gameOver);
          room.winner = payload.controllerFrame.winner || null;
        }
        if (payload.snapshot && typeof payload.snapshot === 'object') {
          payload.snapshot.themeMode = frameThemeMode;
          room.lastHostState = payload.snapshot;
          room.gameOver = Boolean(payload.snapshot.gameOver);
          room.winner = payload.snapshot.winner || null;
          this.emitStateToDisplays(room, payload.snapshot, { excludeDisplay: true });
        } else {
          room.lastHostState = null;
        }
        if (wasGameOver && !room.gameOver) room.clearRematchVotes();
        if (!room.gameOver && room.rematchVotes.size) room.clearRematchVotes();
        this.emitControllerStates(room, room.lastControllerFrame || payload.snapshot, false, nowMs);
        if (Array.isArray(payload.sfxEvents) && payload.sfxEvents.length) this.emitEventToDisplays(room, 'hit_sfx', payload.sfxEvents, { excludeDisplay: true });
        if (Array.isArray(payload.damageEvents) && payload.damageEvents.length) this.emitEventToDisplays(room, 'damage_text', payload.damageEvents, { excludeDisplay: true });
        if (Array.isArray(payload.lineEvents) && payload.lineEvents.length) this.emitEventToDisplays(room, 'hero_line', payload.lineEvents, { excludeDisplay: true });
      });

      socket.on('disconnect', () => {
        for (const [roomId, room] of this.rooms.entries()) {
          const { changed, removedDisplay, empty } = room.removeSocket(socket.id);
          if (!changed) continue;

          if (empty) this.rooms.delete(roomId);
          else if (removedDisplay) this.closeRoom(room, 'Host disconnected. This room has closed. Please join a new room.');
          else {
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
      themeMode: room.themeMode,
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
      themeMode: room.themeMode,
      started: room.started,
      gameOver: room.gameOver,
      winner: room.winner,
      left: defaultSide,
      right: defaultSide,
      requiredPlayers: room.requiredPlayers(),
      playerCount: room.totalFilledSlots(),
    };
    const sideName = side === 'right' ? 'right' : 'left';
    const enemySide = sideName === 'left' ? 'right' : 'left';
    return {
      roomId: room.id,
      side: sideName,
      slot: Number.isFinite(slot) ? slot : 0,
      mode: source.mode === '2v2' ? '2v2' : '1v1',
      themeMode: normalizeThemeMode(source.themeMode || room.themeMode),
      started: Boolean(source.started),
      gameOver: Boolean(source.gameOver),
      winner: source.winner || null,
      requiredPlayers: Number(source.requiredPlayers) || room.requiredPlayers(),
      playerCount: Number(source.playerCount) || room.totalFilledSlots(),
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
      themeMode: room.themeMode,
      archersPerSide: room.archersPerSide,
      requiredPlayers: room.requiredPlayers(),
      playerCount: room.totalFilledSlots(),
      started: room.started,
      rematch: room.rematchStatus(),
      spectatorDisplays: this.roomSpectatorDisplayCount(room),
      cpuSlots: {
        left: Array.isArray(room.cpuSlots?.left) ? room.cpuSlots.left.slice(0, room.archersPerSide).map(Boolean) : [],
        right: Array.isArray(room.cpuSlots?.right) ? room.cpuSlots.right.slice(0, room.archersPerSide).map(Boolean) : [],
      },
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
      console.log('Empires Must Eat server running');
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

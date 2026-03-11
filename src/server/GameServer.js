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
      for (const room of this.rooms.values()) {
        room.tick(TICK_MS / 1000);
        if (room.started) {
          const sfxEvents = room.consumeSfxEvents();
          if (sfxEvents.length) this.io.to(room.id).emit('hit_sfx', sfxEvents);
          const damageEvents = room.consumeDamageEvents();
          if (damageEvents.length) this.io.to(room.id).emit('damage_text', damageEvents);
          const lineEvents = room.consumeLineEvents();
          if (lineEvents.length) this.io.to(room.id).emit('hero_line', lineEvents);
          this.broadcastRoom(room);
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

        socket.emit('room_created', { roomId: id, joinUrl, qrDataUrl, mode: room.mode, requiredPlayers: room.requiredPlayers() });
        this.broadcastRoom(room);
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
        this.broadcastRoom(room);
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
        this.broadcastRoom(room);
      });

      socket.on('control_pull', ({ roomId, x, y }) => {
        const room = this.rooms.get((roomId || '').toUpperCase());
        if (!room) return;
        room.setControlPull(socket.id, x, y);
      });

      socket.on('disconnect', () => {
        for (const [roomId, room] of this.rooms.entries()) {
          const { changed, empty } = room.removeSocket(socket.id);
          if (!changed) continue;

          if (empty) {
            this.rooms.delete(roomId);
          } else {
            this.io.to(room.id).emit('player_left');
            this.broadcastRoom(room);
          }
        }
      });
    });
  }

  broadcastRoom(room) {
    this.io.to(room.id).emit('state', room.serialize());
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

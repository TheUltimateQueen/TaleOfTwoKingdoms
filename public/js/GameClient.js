import { GameRenderer } from './GameRenderer.js';
import { ControllerPad } from './ControllerPad.js';
import { SoundEngine } from './SoundEngine.js';

function sideName(side) {
  return side === 'left' ? 'West' : 'East';
}

function sideLabel(side) {
  return side === 'left' ? 'Blue (West)' : 'Red (East)';
}

function powerStatus(power, shots) {
  if (!power || !shots) return 'none';
  return `${power} x${shots}`;
}

function arrowHitRate(sideState) {
  const fired = Math.max(0, sideState?.arrowsFired || 0);
  const hits = Math.max(0, sideState?.arrowHits || 0);
  if (!fired) return 0;
  return Math.round((hits / fired) * 100);
}

function comboTier(sideState) {
  const combo = Math.max(0, Math.min(10, sideState?.comboHitStreak || 0));
  if (combo >= 10) return 4;
  if (combo >= 7) return 3;
  if (combo >= 4) return 2;
  return 1;
}

function comboStatus(sideState) {
  const streak = Math.max(0, Math.min(10, sideState?.comboHitStreak || 0));
  const tier = comboTier(sideState);
  if (streak >= 10) return `x${tier} MAX (AOE)`;
  return `x${tier} (${streak}/10)`;
}

function killGoldMultiplier(sideState) {
  const level = Math.max(1, sideState?.bountyLevel || 1);
  return (1 + (level - 1) * 0.2).toFixed(2);
}

export class GameClient {
  constructor(socket, isController) {
    this.socket = socket;
    this.isController = isController;
    this.keepAwake = false;
    this.wakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
    this.wakeLockSentinel = null;

    this.state = {
      roomId: null,
      side: null,
      world: null,
      snapshot: null,
    };

    this.bindDom();
    this.bindEvents();
    this.setupAudio();
    this.setupWakeLock();
    this.startRenderLoop();
  }

  bindDom() {
    this.menu = document.getElementById('menu');
    this.lobby = document.getElementById('lobby');
    this.hud = document.getElementById('hud');
    this.controllerPanel = document.getElementById('controllerPanel');
    this.controllerJoin = document.getElementById('controllerJoin');
    this.controllerMsg = document.getElementById('controllerMsg');

    this.canvas = document.getElementById('game');
    this.renderer = new GameRenderer(this.canvas);

    this.roomInput = document.getElementById('roomInput');
    this.joinBtn = document.getElementById('joinBtn');
    this.menuMsg = document.getElementById('menuMsg');

    this.roomCodeEl = document.getElementById('roomCode');
    this.qrImage = document.getElementById('qrImage');
    this.joinLink = document.getElementById('joinLink');

    this.leftHud = document.getElementById('leftHud');
    this.rightHud = document.getElementById('rightHud');
    this.centerHud = document.getElementById('centerHud');

    this.controls = document.getElementById('controls');
    this.pullPad = new ControllerPad(document.getElementById('pullPad'), (pull) => {
      if (!this.state.roomId || !this.state.side) return;
      this.socket.emit('control_pull', { roomId: this.state.roomId, x: pull.x, y: pull.y });
    });
  }

  bindEvents() {
    this.joinBtn.addEventListener('click', () => {
      const roomId = this.roomInput.value.trim().toUpperCase();
      if (!roomId) {
        this.controllerMsg.textContent = 'Enter a 4-letter room code.';
        return;
      }
      this.socket.emit('join_room', {
        roomId,
      });
    });

    this.socket.on('room_created', ({ roomId, joinUrl, qrDataUrl }) => {
      this.state.roomId = roomId;
      this.roomCodeEl.textContent = roomId;
      if (this.joinLink) {
        this.joinLink.href = joinUrl;
        this.joinLink.textContent = joinUrl;
      }
      if (this.qrImage && qrDataUrl) this.qrImage.src = qrDataUrl;
      if (!this.isController) this.setDisplayMode('lobby');
    });

    this.socket.on('joined_room', ({ roomId, side }) => {
      this.state.roomId = roomId;
      this.state.side = side;
      this.controllerMsg.textContent = `Connected as ${sideLabel(side)} kingdom.`;
      this.pullPad.setSide(side);
      this.setControllerMode(true);
      this.socket.emit('control_pull', { roomId, x: this.pullPad.pull.x, y: this.pullPad.pull.y });
    });

    this.socket.on('join_error', ({ message }) => {
      if (this.isController) this.controllerMsg.textContent = message;
      else if (this.menuMsg) this.menuMsg.textContent = message;
    });

    this.socket.on('player_left', () => {
      if (this.isController) this.controllerMsg.textContent = 'Other player disconnected. Waiting for reconnection...';
      else this.centerHud.textContent = 'Controller disconnected. Waiting for players...';
    });

    this.socket.on('state', (snapshot) => {
      this.state.snapshot = snapshot;
      this.state.world = snapshot.world;

      if (this.isController) {
        this.handleControllerState(snapshot);
      } else {
        this.handleDisplayState(snapshot);
      }
    });

    this.socket.on('hit_sfx', (events) => {
      if (this.isController || !Array.isArray(events)) return;
      for (const e of events) {
        this.sound.play(e.type);
        this.renderer.emitHitParticles(e.type, e.x, e.y, e.side);
      }
    });

    this.socket.on('damage_text', (events) => {
      if (this.isController || !Array.isArray(events)) return;
      for (const e of events) {
        this.renderer.emitDamageNumber(e.amount, e.x, e.y);
      }
    });

    this.socket.on('hero_line', (events) => {
      if (this.isController || !Array.isArray(events)) return;
      for (const e of events) {
        this.renderer.emitHeroLine(e.text, e.x, e.y, e.side);
      }
    });
  }

  setupAudio() {
    this.sound = new SoundEngine();
    if (this.isController) return;

    const unlock = () => {
      this.sound.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  setupWakeLock() {
    if (!this.wakeLockSupported) return;

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (this.keepAwake) this.requestWakeLock();
      } else {
        this.releaseWakeLock();
      }
    });

    const tryAcquire = () => {
      if (this.keepAwake) this.requestWakeLock();
    };
    window.addEventListener('focus', tryAcquire);
    window.addEventListener('pointerdown', tryAcquire, { passive: true });
    window.addEventListener('keydown', tryAcquire);
    window.addEventListener('pagehide', () => {
      this.releaseWakeLock();
    });
  }

  setKeepAwake(shouldKeepAwake) {
    const next = Boolean(shouldKeepAwake);
    if (this.keepAwake === next) return;
    this.keepAwake = next;
    if (this.keepAwake) this.requestWakeLock();
    else this.releaseWakeLock();
  }

  async requestWakeLock() {
    if (!this.wakeLockSupported) return;
    if (!this.keepAwake) return;
    if (document.visibilityState !== 'visible') return;
    if (this.wakeLockSentinel) return;

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      this.wakeLockSentinel = sentinel;
      sentinel.addEventListener('release', () => {
        if (this.wakeLockSentinel === sentinel) this.wakeLockSentinel = null;
        if (this.keepAwake && document.visibilityState === 'visible') this.requestWakeLock();
      });
    } catch {
      // Ignore unsupported/context errors and keep game playable.
    }
  }

  async releaseWakeLock() {
    const sentinel = this.wakeLockSentinel;
    if (!sentinel) return;
    this.wakeLockSentinel = null;
    try {
      await sentinel.release();
    } catch {
      // Sentinel may already be released.
    }
  }

  handleControllerState(snapshot) {
    if (!this.state.side) return;

    const me = snapshot[this.state.side];
    this.controllerMsg.textContent = `${sideLabel(this.state.side)} | HP ${Math.floor(me.towerHp)} | Next ${me.shotCd.toFixed(2)}s | Power ${powerStatus(me.pendingShotPower, me.pendingShotPowerShots)} | Hit ${arrowHitRate(me)}% (${me.arrowHits || 0}) | Combo ${comboStatus(me)}`;

    if (snapshot.gameOver) {
      this.controllerMsg.textContent = snapshot.winner === this.state.side
        ? 'Victory. Start another match on the main screen.'
        : 'Defeat. Start another match on the main screen.';
    }
    this.setControllerMode(true);
    this.pullPad.draw();
  }

  handleDisplayState(snapshot) {
    this.updateHud(snapshot);
    if (snapshot.started) this.setDisplayMode('game');
    else if (this.state.roomId) this.setDisplayMode('lobby');
  }

  startRenderLoop() {
    const frame = () => {
      if (!this.isController && this.state.snapshot && this.state.world) {
        this.renderer.draw(this.state.snapshot, this.state.world);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  setDisplayMode(mode) {
    this.menu.classList.toggle('hidden', mode !== 'menu');
    this.lobby.classList.toggle('hidden', mode !== 'lobby');
    this.canvas.classList.toggle('hidden', mode !== 'game');
    this.hud.classList.toggle('hidden', mode !== 'game');
    if (!this.isController) {
      const inGame = mode === 'game';
      document.documentElement.classList.toggle('display-game-mode', inGame);
      document.body.classList.toggle('display-game-mode', inGame);
      this.setKeepAwake(inGame);
    }
  }

  setControllerMode(joined) {
    this.menu.classList.add('hidden');
    this.lobby.classList.add('hidden');
    this.canvas.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.controllerPanel.classList.remove('hidden');
    this.controllerPanel.classList.toggle('active-room', joined);
    this.controllerJoin.classList.toggle('hidden', joined);
    this.controls.classList.toggle('hidden', !joined);
    if (this.isController) this.setKeepAwake(joined);
  }

  updateHud(s) {
    const lp = Math.round(Math.max(0, Math.min(1, s.left.upgradeCharge / Math.max(1, s.left.upgradeChargeMax))) * 100);
    const rp = Math.round(Math.max(0, Math.min(1, s.right.upgradeCharge / Math.max(1, s.right.upgradeChargeMax))) * 100);
    const leftDebt = Math.max(0, Math.ceil(s.left.upgradeChargeMax - s.left.upgradeCharge));
    const rightDebt = Math.max(0, Math.ceil(s.right.upgradeChargeMax - s.right.upgradeCharge));
    const leftUpg = leftDebt > 0 ? `Debt ${leftDebt} (${lp}%)` : 'READY';
    const rightUpg = rightDebt > 0 ? `Debt ${rightDebt} (${rp}%)` : 'READY';
    this.leftHud.textContent = `${s.players.left?.name || 'West'} | HP ${Math.max(0, Math.floor(s.left.towerHp))} | Gold ${Math.floor(s.left.gold)} | Upg ${leftUpg} | Eco ${s.left.economyLevel} | KillGold x${killGoldMultiplier(s.left)} | Power ${powerStatus(s.left.pendingShotPower, s.left.pendingShotPowerShots)} | Hit ${arrowHitRate(s.left)}% (${s.left.arrowHits || 0}) | Combo ${comboStatus(s.left)}`;
    this.rightHud.textContent = `${s.players.right?.name || 'East'} | HP ${Math.max(0, Math.floor(s.right.towerHp))} | Gold ${Math.floor(s.right.gold)} | Upg ${rightUpg} | Eco ${s.right.economyLevel} | KillGold x${killGoldMultiplier(s.right)} | Power ${powerStatus(s.right.pendingShotPower, s.right.pendingShotPowerShots)} | Hit ${arrowHitRate(s.right)}% (${s.right.arrowHits || 0}) | Combo ${comboStatus(s.right)}`;
    this.centerHud.textContent = `Next Shot: West ${s.left.shotCd.toFixed(2)}s | East ${s.right.shotCd.toFixed(2)}s`;
  }

  initFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (this.isController) {
      document.documentElement.classList.add('controller-mode');
      document.body.classList.add('controller-mode');
      this.setControllerMode(false);
      const roomParam = params.get('room');
      if (roomParam) {
        this.roomInput.value = roomParam.toUpperCase();
        this.socket.emit('join_room', {
          roomId: roomParam.toUpperCase(),
        });
      }
    } else {
      document.documentElement.classList.remove('controller-mode');
      document.body.classList.remove('controller-mode');
      document.documentElement.classList.add('display-mode');
      document.body.classList.add('display-mode');
      this.controllerPanel.classList.add('hidden');
      this.setDisplayMode('menu');
      this.socket.emit('create_room', {
        name: 'War Screen',
        origin: window.location.origin + window.location.pathname,
      });
    }
  }
}

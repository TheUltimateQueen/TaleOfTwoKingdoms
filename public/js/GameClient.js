import { GameRenderer } from './GameRenderer.js';
import { ControllerPad } from './ControllerPad.js';
import { SoundEngine } from './SoundEngine.js';
import { SHOT_POWER_LABELS } from './constants.js';
import { GameRoom as SimGameRoom } from './SimGameRoom.js';

const VOICE_GAP_MIN_MS = 2000;
const VOICE_GAP_MAX_MS = 10000;
const HERO_VOICE_CLIPS = [
  '/Sounds/HeroVoice/Chacha.m4a',
  '/Sounds/HeroVoice/Haya.m4a',
  '/Sounds/HeroVoice/HeroIAm.m4a',
];
const PRESIDENT_VOICE_CLIPS = [
  '/Sounds/PresidentVoice/4score.m4a',
  '/Sounds/PresidentVoice/BrightFuture.m4a',
  '/Sounds/PresidentVoice/TickTock.m4a',
];
const HERO_VOICE_MANIFEST_URL = '/api/audio/hero-voices';
const PRESIDENT_VOICE_MANIFEST_URL = '/api/audio/president-voices';
const GAME_OVER_CINEMATIC_MS = 4000;
const HOST_TICK_MS = 1000 / 30;
const HOST_STATE_EMIT_MS = 50;
const LOCAL_KEYBOARD_AIM_SPEED = 0.51;
const DISPLAY_CURSOR_IDLE_MS = 1200;
const LOCAL_KEYBOARD_CODES = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);
const TEST_SETTINGS_STORAGE_KEY = 'totk_test_settings_v4';
const TEST_SPECIAL_UPGRADE_KEYS = [
  'dragonSuperBreathLevel',
  'shieldDarkMetalLevel',
  'monkHealCircleLevel',
  'necroExpertSummonerLevel',
  'riderSuperHorseLevel',
  'diggerGoldFinderLevel',
  'gunnerSkyCannonLevel',
  'presidentExecutiveOrderLevel',
];
const TEST_UPGRADE_MAX = {
  volleyLevel: 4,
  dragonSuperBreathLevel: 1,
  shieldDarkMetalLevel: 1,
  monkHealCircleLevel: 1,
  necroExpertSummonerLevel: 1,
  riderSuperHorseLevel: 1,
  diggerGoldFinderLevel: 1,
  gunnerSkyCannonLevel: 1,
  presidentExecutiveOrderLevel: 1,
};
const TEST_FORCED_SPECIAL_TYPES = new Set(['dragon', 'shield', 'digger', 'necrominion', 'gunner', 'rider', 'monk', 'hero', 'president', 'super']);
const TEST_SPECIAL_LABELS = {
  dragon: 'Dragon',
  shield: 'Shield',
  digger: 'Digger',
  necrominion: 'Necro',
  gunner: 'Gunner',
  rider: 'Rider',
  monk: 'Monk',
  hero: 'Hero',
  president: 'President',
  super: 'Super',
};

function clampNumber(value, min, max, fallback = min) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function sideName(side) {
  return side === 'left' ? 'West' : 'East';
}

function sideLabel(side) {
  return side === 'left' ? 'Blue (West)' : 'Red (East)';
}

function powerStatus(power, shots) {
  if (!power || !shots) return 'none';
  return `${SHOT_POWER_LABELS[power] || power} x${shots}`;
}

function arrowHitRate(sideState) {
  const stats = arrowAccuracy(sideState);
  return stats.rate;
}

function arrowAccuracy(sideState) {
  const fired = Math.max(0, sideState?.arrowsFired || 0);
  const hits = Math.max(0, sideState?.arrowHits || 0);
  const rate = fired ? Math.round((hits / fired) * 100) : 0;
  return { fired, hits, rate };
}

function arrowAccuracySummary(label, sideState) {
  const acc = arrowAccuracy(sideState);
  return `${label} Arrow Accuracy: ${acc.rate}% (${acc.hits} hits / ${acc.fired} arrows fired)`;
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
      slot: 0,
      mode: '1v1',
      createMode: '1v1',
      world: null,
      snapshot: null,
    };
    this.voiceEnabled = false;
    this.voiceUnlocked = false;
    this.voicePools = null;
    this.voiceState = null;
    this.voicePresence = { hero: false, president: false };
    this.gameOverLatched = false;
    this.gameOverRevealAtMs = 0;
    this.nextGameOverBoomAtMs = 0;
    this.hostAuthoritative = false;
    this.localRoom = null;
    this.hostTickTimer = null;
    this.nextHostStateEmitAt = 0;
    this.remoteDisplayCount = 0;
    this.localKeyboardTestActive = false;
    this.localPressedKeys = new Set();
    this.displayMode = 'menu';
    this.cursorHiddenForIdle = false;
    this.cursorLastActivityAt = performance.now();
    this.testSettings = this.defaultTestSettings();

    this.bindDom();
    this.bindEvents();
    this.setupAudio();
    this.setupWakeLock();
    this.startRenderLoop();
    this.renderLobbyPhonePreviews();
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
    this.mode2PlayersBtn = document.getElementById('mode2PlayersBtn');
    this.mode4PlayersBtn = document.getElementById('mode4PlayersBtn');
    this.createRoomBtn = document.getElementById('createRoomBtn');
    this.menuMsg = document.getElementById('menuMsg');

    this.roomCodeEl = document.getElementById('roomCode');
    this.qrImage = document.getElementById('qrImage');
    this.joinLink = document.getElementById('joinLink');
    this.lobbyMode2PlayersBtn = document.getElementById('lobbyMode2PlayersBtn');
    this.lobbyMode4PlayersBtn = document.getElementById('lobbyMode4PlayersBtn');
    this.localKeyboardTestBtn = document.getElementById('localKeyboardTestBtn');
    this.localKeyboardHint = document.getElementById('localKeyboardHint');
    this.lobbyModeMsg = document.getElementById('lobbyModeMsg');
    this.lobbyMsg = document.getElementById('lobbyMsg');
    this.lobbyPhonePreview = document.getElementById('lobbyPhonePreview');
    this.lobbyLeftPhonesTitle = document.getElementById('lobbyLeftPhonesTitle');
    this.lobbyRightPhonesTitle = document.getElementById('lobbyRightPhonesTitle');
    this.lobbyPhoneSlots = Array.from(document.querySelectorAll('.lobby-phone-slot')).map((slotEl) => ({
      el: slotEl,
      side: slotEl.dataset.side === 'right' ? 'right' : 'left',
      slot: Math.max(0, Number(slotEl.dataset.slot) || 0),
      chip: slotEl.querySelector('.phone-chip'),
      player: slotEl.querySelector('.phone-player'),
      aimZone: slotEl.querySelector('.phone-aim-zone'),
      aimAnchor: slotEl.querySelector('.phone-aim-anchor'),
      aimLine: slotEl.querySelector('.phone-aim-line'),
      aimDot: slotEl.querySelector('.phone-aim-dot'),
      powerFill: slotEl.querySelector('.phone-power-fill'),
      meta: slotEl.querySelector('.phone-meta'),
    }));
    this.testSettingsPanel = document.getElementById('testSettingsPanel');
    this.testSettingsSummary = document.getElementById('testSettingsSummary');
    this.testApplyToInput = document.getElementById('testApplyToInput');
    this.testForceSpecialTypeInput = document.getElementById('testForceSpecialTypeInput');
    this.testForceSpecialMinAliveInput = document.getElementById('testForceSpecialMinAliveInput');
    this.testOffBtn = document.getElementById('testOffBtn');
    this.testSpecialsBtn = document.getElementById('testSpecialsBtn');
    this.testResetBtn = document.getElementById('testResetBtn');
    this.testSettingsMsg = document.getElementById('testSettingsMsg');
    this.testQuickSummary = document.getElementById('testQuickSummary');
    this.testSpecialUpgradeInputs = Array.from(document.querySelectorAll('[data-test-special-upgrade]'));

    this.leftHud = document.getElementById('leftHud');
    this.rightHud = document.getElementById('rightHud');
    this.centerHud = document.getElementById('centerHud');
    this.postGamePanel = document.getElementById('postGamePanel');
    this.postGameTitle = document.getElementById('postGameTitle');
    this.postGameStats = document.getElementById('postGameStats');
    this.postGameExplain = document.getElementById('postGameExplain');
    this.restartMatchBtn = document.getElementById('restartMatchBtn');
    this.restartMsg = document.getElementById('restartMsg');

    this.controls = document.getElementById('controls');
    this.pullPad = new ControllerPad(document.getElementById('pullPad'), (pull) => {
      if (!this.state.roomId || !this.state.side) return;
      this.socket.emit('control_pull', { roomId: this.state.roomId, x: pull.x, y: pull.y });
    });
  }

  bindEvents() {
    if (!this.isController) {
      this.mode2PlayersBtn?.addEventListener('click', () => this.setCreateMode('1v1'));
      this.mode4PlayersBtn?.addEventListener('click', () => this.setCreateMode('2v2'));
      this.lobbyMode2PlayersBtn?.addEventListener('click', () => {
        this.setCreateMode('1v1');
        if (this.state.roomId) this.requestRoomModeChange('1v1');
      });
      this.lobbyMode4PlayersBtn?.addEventListener('click', () => {
        this.setCreateMode('2v2');
        if (this.state.roomId) this.requestRoomModeChange('2v2');
      });
      this.createRoomBtn?.addEventListener('click', () => this.requestRoomCreate(this.state.createMode));
      this.restartMatchBtn?.addEventListener('click', () => this.requestRoomRestart());
      this.localKeyboardTestBtn?.addEventListener('click', () => this.startLocalKeyboardTest());
      this.initTestSettingsUi();
      this.setCreateMode(this.state.createMode);
      window.addEventListener('keydown', (event) => this.handleLocalKeyboardKey(event, true));
      window.addEventListener('keyup', (event) => this.handleLocalKeyboardKey(event, false));
      window.addEventListener('blur', () => {
        this.localPressedKeys.clear();
      });
      window.addEventListener('pointermove', () => this.handleDisplayPointerActivity());
      window.addEventListener('mousemove', () => this.handleDisplayPointerActivity());
      window.addEventListener('mousedown', () => this.handleDisplayPointerActivity());
      window.addEventListener('resize', () => this.renderLobbyPhonePreviews());
    }

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

    this.socket.on('room_created', ({ roomId, joinUrl, qrDataUrl, mode, requiredPlayers, hostAuthoritative }) => {
      this.localKeyboardTestActive = false;
      this.localPressedKeys.clear();
      this.state.roomId = roomId;
      this.state.mode = mode === '2v2' ? '2v2' : '1v1';
      this.hostAuthoritative = Boolean(hostAuthoritative) && !this.isController;
      this.setCreateMode(this.state.mode);
      if (this.hostAuthoritative) this.initLocalHostRoom();
      this.roomCodeEl.textContent = roomId;
      if (this.joinLink) {
        this.joinLink.href = joinUrl;
        this.joinLink.textContent = joinUrl;
      }
      if (this.qrImage && qrDataUrl) this.qrImage.src = qrDataUrl;
      if (this.lobbyModeMsg) this.lobbyModeMsg.textContent = '';
      if (this.localKeyboardHint) this.localKeyboardHint.textContent = 'Keyboard mode: West aims with W/A/S/D and East aims with Arrow keys. Pick keyboard or phones per match.';
      if (this.localKeyboardTestBtn) this.localKeyboardTestBtn.textContent = 'Play On This Computer (Keyboard)';
      if (this.restartMsg) this.restartMsg.textContent = '';
      this.resetGameOverPresentation();
      this.setPostGamePanel(false);
      if (this.lobbyMsg) this.lobbyMsg.textContent = `Mode ${this.state.mode.toUpperCase()} | Waiting for ${requiredPlayers || (this.state.mode === '2v2' ? 4 : 2)} controllers...`;
      this.renderLobbyPhonePreviews();
      if (!this.isController) this.setDisplayMode('lobby');
    });

    this.socket.on('room_mode_updated', ({ mode, requiredPlayers }) => {
      if (this.isController) return;
      this.state.mode = mode === '2v2' ? '2v2' : '1v1';
      this.setCreateMode(this.state.mode);
      if (this.hostAuthoritative && this.localRoom) this.localRoom.setMode(this.state.mode);
      if (this.lobbyModeMsg) {
        const label = this.state.mode === '2v2' ? '4 players (2v2)' : '2 players (1v1)';
        this.lobbyModeMsg.textContent = `Room size updated: ${label}.`;
      }
      if (this.lobbyMsg) this.lobbyMsg.textContent = `Mode ${this.state.mode.toUpperCase()} | Waiting for ${requiredPlayers || (this.state.mode === '2v2' ? 4 : 2)} controllers...`;
      this.renderLobbyPhonePreviews();
    });

    this.socket.on('room_mode_error', ({ message }) => {
      if (this.isController) return;
      if (this.lobbyModeMsg && this.state.roomId) this.lobbyModeMsg.textContent = message || 'Unable to change room size.';
      else if (this.menuMsg) this.menuMsg.textContent = message || 'Unable to change room size.';
    });

    this.socket.on('room_restarted', () => {
      if (this.isController) return;
      if (this.hostAuthoritative && this.localRoom) {
        this.localRoom.restartMatch();
        if (typeof this.localRoom.setDebugConfig === 'function') {
          this.localRoom.setDebugConfig(this.readSettingsFromTestDom());
        }
        this.pushHostState(true);
      }
      if (this.restartMsg) this.restartMsg.textContent = '';
      this.resetGameOverPresentation();
      this.setPostGamePanel(false);
      this.renderLobbyPhonePreviews();
    });

    this.socket.on('room_restart_error', ({ message }) => {
      if (this.isController) return;
      if (this.restartMsg) this.restartMsg.textContent = message || 'Unable to restart match.';
    });

    this.socket.on('joined_room', ({ roomId, side, slot, mode, requiredPlayers }) => {
      this.state.roomId = roomId;
      this.state.side = side;
      this.state.slot = Number.isFinite(slot) ? slot : 0;
      this.state.mode = mode === '2v2' ? '2v2' : '1v1';
      const laneText = this.state.mode === '2v2' ? ` | Archer ${this.state.slot + 1}` : '';
      this.controllerMsg.textContent = `Connected as ${sideLabel(side)}${laneText}. Room needs ${requiredPlayers || 2} controllers.`;
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
      this.renderLobbyPhonePreviews();
    });

    this.socket.on('controller_state', (payload) => {
      if (!this.isController) return;
      this.handleControllerCompactState(payload || {});
    });

    this.socket.on('room_roster', (payload) => {
      if (!this.hostAuthoritative || this.isController) return;
      this.applyHostRoster(payload);
    });

    this.socket.on('host_control_pull', ({ side, slot, x, y }) => {
      if (!this.hostAuthoritative || this.isController || !this.localRoom) return;
      if (this.localKeyboardTestActive) return;
      const sideName = side === 'right' ? 'right' : 'left';
      const lane = Number.isFinite(slot) ? slot : 0;
      const pull = this.localRoom.normalizePull(sideName, x, y);
      const control = this.localRoom.ensureArcherControl(sideName, lane);
      if (!control) return;
      control.pullX = pull.x;
      control.pullY = pull.y;
      control.archerAimY = (this.localRoom.left.archerAimY || (900 / 2 - 56)) - lane * 78;
      this.localRoom.syncSidePrimaryPull(sideName);
      this.renderLobbyPhonePreviews();
    });

    this.socket.on('state', (snapshot) => {
      if (this.isController) return;
      if (this.hostAuthoritative && !this.isController) return;
      this.state.snapshot = snapshot;
      this.state.world = snapshot.world;
      this.handleDisplayState(snapshot);
      this.refreshVoicePlayback();
    });

    this.socket.on('hit_sfx', (events) => {
      if (this.isController || !Array.isArray(events)) return;
      for (const e of events) {
        this.sound.play(e.type);
        this.renderer.emitHitParticles(e);
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

  initLocalHostRoom() {
    if (this.isController || !this.state.roomId) return;
    this.localRoom = new SimGameRoom(this.state.roomId, window.location.origin + window.location.pathname, {
      mode: this.state.mode,
      debugConfig: this.readSettingsFromTestDom(),
    });
    this.nextHostStateEmitAt = 0;
    this.startHostAuthorityLoop();
    this.pushHostState(true);
    this.updateTestQuickSummary();
    this.renderLobbyPhonePreviews();
  }

  applyHostRoster(payload = {}) {
    if (!this.localRoom) return;
    if (this.localKeyboardTestActive) return;
    if (payload.roomId && payload.roomId !== this.state.roomId) return;
    const mode = payload.mode === '2v2' ? '2v2' : '1v1';
    if (this.localRoom.mode !== mode) this.localRoom.setMode(mode);
    this.state.mode = mode;
    this.setCreateMode(mode);

    const archersPerSide = mode === '2v2' ? 2 : 1;
    this.localRoom.archersPerSide = archersPerSide;
    this.localRoom.resizeSideArcherControls('left');
    this.localRoom.resizeSideArcherControls('right');
    this.localRoom.players = {
      left: Array.isArray(payload.players?.left) ? payload.players.left.map((p) => ({ ...p })) : [],
      right: Array.isArray(payload.players?.right) ? payload.players.right.map((p) => ({ ...p })) : [],
    };
    this.remoteDisplayCount = Math.max(0, Number(payload.spectatorDisplays) || 0);
    this.localRoom.started = Boolean(payload.started);
    this.localRoom.gameOver = this.localRoom.gameOver && this.localRoom.started;
    this.pushHostState(true);
    this.renderLobbyPhonePreviews();
  }

  startHostAuthorityLoop() {
    if (this.isController || !this.hostAuthoritative || !this.localRoom || this.hostTickTimer) return;
    this.hostTickTimer = window.setInterval(() => {
      if (!this.localRoom) return;
      this.updateLocalKeyboardAiming(HOST_TICK_MS / 1000);
      this.localRoom.tick(HOST_TICK_MS / 1000);
      this.pushHostState(false);
    }, HOST_TICK_MS);
  }

  stopHostAuthorityLoop() {
    if (!this.hostTickTimer) return;
    window.clearInterval(this.hostTickTimer);
    this.hostTickTimer = null;
  }

  startLocalKeyboardTest() {
    if (this.isController) return;
    if (!this.hostAuthoritative) return;
    if (!this.state.roomId) {
      if (this.menuMsg) this.menuMsg.textContent = 'Waiting for host room setup...';
      return;
    }

    this.state.mode = '1v1';
    this.setCreateMode('1v1');
    this.requestRoomModeChange('1v1');

    this.localRoom = new SimGameRoom(this.state.roomId, window.location.origin + window.location.pathname, {
      mode: '1v1',
      debugConfig: this.readSettingsFromTestDom(),
    });
    this.localRoom.players = {
      left: [{ id: '__LOCAL_WEST__', name: 'West Keyboard', slot: 0 }],
      right: [{ id: '__LOCAL_EAST__', name: 'East Keyboard', slot: 0 }],
    };
    this.localRoom.started = true;
    this.localRoom.gameOver = false;
    this.localRoom.winner = null;

    const leftControl = this.localRoom.ensureArcherControl('left', 0);
    const rightControl = this.localRoom.ensureArcherControl('right', 0);
    if (leftControl) {
      leftControl.pullX = -0.82;
      leftControl.pullY = -0.08;
    }
    if (rightControl) {
      rightControl.pullX = 0.82;
      rightControl.pullY = -0.08;
    }
    this.localRoom.syncSidePrimaryPull('left');
    this.localRoom.syncSidePrimaryPull('right');

    this.localPressedKeys.clear();
    this.localKeyboardTestActive = true;
    if (this.localKeyboardHint) this.localKeyboardHint.textContent = 'Keyboard mode active. Hold keys to smoothly move each side aim cursor. Phone controllers are disabled in this match.';
    if (this.localKeyboardTestBtn) this.localKeyboardTestBtn.textContent = 'Restart Keyboard Match';

    if (this.lobbyModeMsg) this.lobbyModeMsg.textContent = 'Keyboard match started. West: W/A/S/D | East: Arrow keys. Use phones in a separate match.';
    if (this.lobbyMsg) this.lobbyMsg.textContent = 'Keyboard mode active on this computer (1v1).';

    this.resetGameOverPresentation();
    this.setPostGamePanel(false);
    this.setDisplayMode('game');
    this.startHostAuthorityLoop();
    this.pushHostState(true);
    this.updateTestQuickSummary();
  }

  handleLocalKeyboardKey(event, pressed) {
    if (this.isController || !this.localKeyboardTestActive) return;
    if (!LOCAL_KEYBOARD_CODES.has(event.code)) return;
    event.preventDefault();
    if (pressed) this.localPressedKeys.add(event.code);
    else this.localPressedKeys.delete(event.code);
  }

  updateLocalKeyboardAiming(dt) {
    if (!this.localKeyboardTestActive || !this.localRoom || this.localRoom.gameOver) return;
    if (!this.localPressedKeys.size) return;

    const delta = Math.max(0.01, dt) * LOCAL_KEYBOARD_AIM_SPEED;
    const left = this.localRoom.ensureArcherControl('left', 0);
    const right = this.localRoom.ensureArcherControl('right', 0);
    if (!left || !right) return;

    const leftDx = (this.localPressedKeys.has('KeyA') ? 1 : 0) - (this.localPressedKeys.has('KeyD') ? 1 : 0);
    const leftDy = (this.localPressedKeys.has('KeyS') ? 1 : 0) - (this.localPressedKeys.has('KeyW') ? 1 : 0);
    const rightDx = (this.localPressedKeys.has('ArrowLeft') ? 1 : 0) - (this.localPressedKeys.has('ArrowRight') ? 1 : 0);
    const rightDy = (this.localPressedKeys.has('ArrowDown') ? 1 : 0) - (this.localPressedKeys.has('ArrowUp') ? 1 : 0);

    if (leftDx || leftDy) {
      const next = this.localRoom.normalizePull('left', left.pullX + leftDx * delta, left.pullY + leftDy * delta);
      left.pullX = next.x;
      left.pullY = next.y;
    }
    if (rightDx || rightDy) {
      const next = this.localRoom.normalizePull('right', right.pullX + rightDx * delta, right.pullY + rightDy * delta);
      right.pullX = next.x;
      right.pullY = next.y;
    }

    this.localRoom.syncSidePrimaryPull('left');
    this.localRoom.syncSidePrimaryPull('right');
  }

  pushHostState(force = false) {
    if (!this.hostAuthoritative || this.isController || !this.localRoom || !this.state.roomId) return;
    const snapshot = this.localRoom.serialize();
    this.state.snapshot = snapshot;
    this.state.world = snapshot.world;
    this.handleDisplayState(snapshot);
    this.refreshVoicePlayback();

    const sfxEvents = this.localRoom.consumeSfxEvents();
    const damageEvents = this.localRoom.consumeDamageEvents();
    const lineEvents = this.localRoom.consumeLineEvents();

    for (const e of sfxEvents) {
      this.sound.play(e.type);
      this.renderer.emitHitParticles(e);
    }
    for (const e of damageEvents) this.renderer.emitDamageNumber(e.amount, e.x, e.y);
    for (const e of lineEvents) this.renderer.emitHeroLine(e.text, e.x, e.y, e.side);

    const now = performance.now();
    if (!force && !snapshot.started && !snapshot.gameOver) return;
    if (!force && now < this.nextHostStateEmitAt) return;
    this.nextHostStateEmitAt = now + HOST_STATE_EMIT_MS;

    const controllerFrame = {
      mode: snapshot.mode === '2v2' ? '2v2' : '1v1',
      started: Boolean(snapshot.started),
      gameOver: Boolean(snapshot.gameOver),
      winner: snapshot.winner || null,
      requiredPlayers: Number(snapshot.requiredPlayers) || (snapshot.mode === '2v2' ? 4 : 2),
      playerCount: Number(snapshot.playerCount) || 0,
      left: {
        towerHp: Number(snapshot.left?.towerHp) || 0,
        shotCd: Number(snapshot.left?.shotCd) || 0,
        pendingShotPower: snapshot.left?.pendingShotPower || null,
        pendingShotPowerShots: Math.max(0, Number(snapshot.left?.pendingShotPowerShots) || 0),
        arrowsFired: Math.max(0, Number(snapshot.left?.arrowsFired) || 0),
        arrowHits: Math.max(0, Number(snapshot.left?.arrowHits) || 0),
        comboHitStreak: Math.max(0, Number(snapshot.left?.comboHitStreak) || 0),
      },
      right: {
        towerHp: Number(snapshot.right?.towerHp) || 0,
        shotCd: Number(snapshot.right?.shotCd) || 0,
        pendingShotPower: snapshot.right?.pendingShotPower || null,
        pendingShotPowerShots: Math.max(0, Number(snapshot.right?.pendingShotPowerShots) || 0),
        arrowsFired: Math.max(0, Number(snapshot.right?.arrowsFired) || 0),
        arrowHits: Math.max(0, Number(snapshot.right?.arrowHits) || 0),
        comboHitStreak: Math.max(0, Number(snapshot.right?.comboHitStreak) || 0),
      },
    };

    const needsDisplaySnapshot = this.remoteDisplayCount > 0;
    this.socket.emit('host_state', {
      roomId: this.state.roomId,
      snapshot: needsDisplaySnapshot ? snapshot : null,
      controllerFrame,
      sfxEvents,
      damageEvents,
      lineEvents,
    });
  }

  requestRoomCreate(mode = '1v1') {
    const normalized = mode === '2v2' ? '2v2' : '1v1';
    const label = normalized === '2v2' ? '4-player (2v2)' : '2-player (1v1)';
    if (this.menuMsg) this.menuMsg.textContent = `Creating ${label} room...`;
    if (this.lobbyMsg) this.lobbyMsg.textContent = `Creating ${label} room...`;
    this.socket.emit('create_room', {
      name: 'War Screen',
      origin: window.location.origin + window.location.pathname,
      mode: normalized,
    });
  }

  requestRoomModeChange(mode = '1v1') {
    if (!this.state.roomId) return;
    const normalized = mode === '2v2' ? '2v2' : '1v1';
    const label = normalized === '2v2' ? '4 players (2v2)' : '2 players (1v1)';
    if (this.lobbyModeMsg) this.lobbyModeMsg.textContent = `Switching room size to ${label}...`;
    this.socket.emit('set_room_mode', { roomId: this.state.roomId, mode: normalized });
  }

  requestRoomRestart() {
    if (!this.state.roomId) return;
    if (this.restartMsg) this.restartMsg.textContent = 'Restarting match...';
    this.socket.emit('restart_room', { roomId: this.state.roomId });
  }

  syncModeToggleButtons(twoBtn, fourBtn, normalizedMode) {
    const twoPlayers = normalizedMode === '1v1';
    if (twoBtn) {
      twoBtn.classList.toggle('active', twoPlayers);
      twoBtn.setAttribute('aria-pressed', String(twoPlayers));
    }
    if (fourBtn) {
      fourBtn.classList.toggle('active', !twoPlayers);
      fourBtn.setAttribute('aria-pressed', String(!twoPlayers));
    }
  }

  setCreateMode(mode = '1v1') {
    const normalized = mode === '2v2' ? '2v2' : '1v1';
    this.state.createMode = normalized;
    this.syncModeToggleButtons(this.mode2PlayersBtn, this.mode4PlayersBtn, normalized);
    this.syncModeToggleButtons(this.lobbyMode2PlayersBtn, this.lobbyMode4PlayersBtn, normalized);
    this.renderLobbyPhonePreviews();
  }

  defaultLobbyPull(side = 'left') {
    return {
      pullX: side === 'right' ? 0.8 : -0.8,
      pullY: 0,
    };
  }

  normalizeLobbyPull(side = 'left', pull = null) {
    const fallback = this.defaultLobbyPull(side);
    let x = Number(pull?.pullX);
    let y = Number(pull?.pullY);
    if (!Number.isFinite(x)) x = fallback.pullX;
    if (!Number.isFinite(y)) y = fallback.pullY;
    if (side === 'left') x = Math.min(0, x);
    else x = Math.max(0, x);
    y = Math.min(0, y);

    const mag = Math.hypot(x, y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }
    return { pullX: x, pullY: y };
  }

  findLobbyPlayer(players, slot = 0) {
    if (!Array.isArray(players) || slot < 0) return null;
    const bySlot = players.find((p) => Number(p?.slot) === slot);
    if (bySlot) return bySlot;
    return players[slot] || null;
  }

  getLobbyPreviewSource() {
    const room = this.localRoom;
    const snapshot = this.state.snapshot;
    const leftSide = room?.left || snapshot?.left || null;
    const rightSide = room?.right || snapshot?.right || null;
    return {
      players: {
        left: Array.isArray(room?.players?.left)
          ? room.players.left
          : (Array.isArray(snapshot?.players?.left) ? snapshot.players.left : []),
        right: Array.isArray(room?.players?.right)
          ? room.players.right
          : (Array.isArray(snapshot?.players?.right) ? snapshot.players.right : []),
      },
      sideState: {
        left: leftSide,
        right: rightSide,
      },
      pulls: {
        left: Array.isArray(leftSide?.archerPulls) ? leftSide.archerPulls : [],
        right: Array.isArray(rightSide?.archerPulls) ? rightSide.archerPulls : [],
      },
    };
  }

  computeLobbyShotPreview(side = 'left', pull = null) {
    const normalized = this.normalizeLobbyPull(side, pull);
    const forward = clamp01(Math.abs(normalized.pullX));
    const lift = clamp01(Math.max(0, -normalized.pullY));
    const power = clamp01(Math.hypot(forward, lift));
    const arcDeg = Math.round((Math.atan2(lift, Math.max(0.001, forward)) * 180) / Math.PI);
    return { forward, lift, power, arcDeg };
  }

  paintLobbyShotPreview(entry, side, shot, connected) {
    if (!entry?.aimZone || !entry.aimAnchor || !entry.aimLine || !entry.aimDot) return;

    const w = Math.max(1, entry.aimZone.clientWidth);
    const h = Math.max(1, entry.aimZone.clientHeight);
    const anchorX = side === 'left' ? w * 0.16 : w * 0.84;
    const anchorY = h * 0.86;
    const dx = (side === 'left' ? 1 : -1) * shot.forward * (w * 0.62);
    const dy = -shot.lift * (h * 0.58);
    const dotX = anchorX + dx;
    const dotY = anchorY + dy;
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const lineLength = Math.max(1, Math.hypot(dx, dy));

    entry.aimAnchor.style.left = `${anchorX}px`;
    entry.aimAnchor.style.top = `${anchorY}px`;
    entry.aimLine.style.left = `${anchorX}px`;
    entry.aimLine.style.top = `${anchorY}px`;
    entry.aimLine.style.width = `${lineLength}px`;
    entry.aimLine.style.transform = `translateY(-50%) rotate(${angleDeg}deg)`;
    entry.aimDot.style.left = `${dotX}px`;
    entry.aimDot.style.top = `${dotY}px`;
    entry.aimLine.style.opacity = connected ? '0.95' : '0.35';
    entry.aimDot.style.opacity = connected ? '1' : '0.45';
  }

  renderLobbyPhoneSlot(entry, source, archersPerSide) {
    if (!entry?.el) return;
    const inMode = entry.slot < archersPerSide;
    entry.el.classList.toggle('hidden', !inMode);
    if (!inMode) return;

    const sidePlayers = source?.players?.[entry.side] || [];
    const sidePulls = source?.pulls?.[entry.side] || [];
    const sideState = source?.sideState?.[entry.side] || null;
    const player = this.findLobbyPlayer(sidePlayers, entry.slot);
    const connected = Boolean(player);
    const baseName = `${sideName(entry.side)} Archer ${entry.slot + 1}`;
    const playerName = connected && player?.name ? String(player.name) : baseName;
    const pull = connected ? sidePulls[entry.slot] : null;
    const shot = this.computeLobbyShotPreview(entry.side, pull || this.defaultLobbyPull(entry.side));
    const pendingPower = sideState?.pendingShotPower
      ? (SHOT_POWER_LABELS[sideState.pendingShotPower] || sideState.pendingShotPower)
      : null;

    entry.el.classList.toggle('waiting', !connected);
    entry.el.classList.toggle('connected', connected);
    if (entry.chip) entry.chip.textContent = connected ? (this.localKeyboardTestActive ? 'Keyboard' : 'Connected') : 'Waiting';
    if (entry.player) entry.player.textContent = playerName;
    if (entry.meta) {
      entry.meta.textContent = connected
        ? `Power ${Math.round(shot.power * 100)}% | Arc ${shot.arcDeg}deg${pendingPower ? ` | ${pendingPower}` : ''}`
        : 'No controller connected';
    }
    if (entry.powerFill) {
      entry.powerFill.style.width = `${Math.round((connected ? shot.power : 0) * 100)}%`;
    }
    this.paintLobbyShotPreview(entry, entry.side, shot, connected);
  }

  renderLobbyPhonePreviews() {
    if (this.isController || !Array.isArray(this.lobbyPhoneSlots) || !this.lobbyPhoneSlots.length) return;
    const mode = this.state.mode === '2v2' ? '2v2' : '1v1';
    const archersPerSide = mode === '2v2' ? 2 : 1;
    const source = this.getLobbyPreviewSource();
    const leftCount = Array.isArray(source?.players?.left) ? source.players.left.length : 0;
    const rightCount = Array.isArray(source?.players?.right) ? source.players.right.length : 0;

    if (this.lobbyLeftPhonesTitle) this.lobbyLeftPhonesTitle.textContent = `West Controllers ${leftCount}/${archersPerSide}`;
    if (this.lobbyRightPhonesTitle) this.lobbyRightPhonesTitle.textContent = `East Controllers ${rightCount}/${archersPerSide}`;

    for (const entry of this.lobbyPhoneSlots) {
      this.renderLobbyPhoneSlot(entry, source, archersPerSide);
    }
  }

  defaultTestSettings() {
    const upgrades = {
      arrowLevel: 1,
      unitLevel: 1,
      volleyLevel: 0,
      spawnLevel: 1,
      unitHpLevel: 1,
      resourceLevel: 1,
      bountyLevel: 1,
      powerLevel: 1,
      specialRateLevel: 1,
      dragonLevel: 0,
      superMinionLevel: 0,
      dragonSuperBreathLevel: 0,
      shieldDarkMetalLevel: 0,
      monkHealCircleLevel: 0,
      necroExpertSummonerLevel: 0,
      riderSuperHorseLevel: 0,
      diggerGoldFinderLevel: 0,
      gunnerSkyCannonLevel: 0,
      presidentExecutiveOrderLevel: 0,
    };
    return {
      enabled: false,
      applyTo: 'both',
      forceSpecialType: null,
      forceSpecialMinAlive: 1,
      upgrades,
    };
  }

  normalizeTestSettings(raw = null) {
    const base = this.defaultTestSettings();
    const cfg = (raw && typeof raw === 'object') ? raw : {};
    const normalized = {
      enabled: Boolean(cfg.enabled),
      applyTo: (cfg.applyTo === 'left' || cfg.applyTo === 'right') ? cfg.applyTo : 'both',
      forceSpecialType: (typeof cfg.forceSpecialType === 'string' && TEST_FORCED_SPECIAL_TYPES.has(cfg.forceSpecialType))
        ? cfg.forceSpecialType
        : null,
      forceSpecialMinAlive: Math.max(1, Math.floor(clampNumber(cfg.forceSpecialMinAlive, 1, 12, 1))),
      upgrades: {},
    };
    const sourceUpgrades = (cfg.upgrades && typeof cfg.upgrades === 'object') ? cfg.upgrades : {};
    for (const key of TEST_SPECIAL_UPGRADE_KEYS) {
      const max = Number.isFinite(TEST_UPGRADE_MAX[key]) ? TEST_UPGRADE_MAX[key] : 30;
      const fallback = base.upgrades[key] || 0;
      normalized.upgrades[key] = Math.max(0, Math.floor(clampNumber(sourceUpgrades[key], 0, max, fallback)));
    }
    if (normalized.upgrades.dragonSuperBreathLevel > 0 && normalized.upgrades.dragonLevel <= 0) {
      normalized.upgrades.dragonLevel = 1;
    }
    return normalized;
  }

  loadTestSettingsFromStorage() {
    try {
      const raw = window.localStorage.getItem(TEST_SETTINGS_STORAGE_KEY);
      if (!raw) return this.defaultTestSettings();
      return this.normalizeTestSettings(JSON.parse(raw));
    } catch {
      return this.defaultTestSettings();
    }
  }

  saveTestSettingsToStorage(settings = null) {
    const normalized = this.normalizeTestSettings(settings || this.testSettings || this.defaultTestSettings());
    this.testSettings = normalized;
    try {
      window.localStorage.setItem(TEST_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore storage failures.
    }
  }

  applySettingsToTestDom(settings = null) {
    const cfg = this.normalizeTestSettings(settings || this.testSettings || this.defaultTestSettings());
    if (this.testApplyToInput) this.testApplyToInput.value = cfg.applyTo;
    if (this.testForceSpecialTypeInput) this.testForceSpecialTypeInput.value = cfg.forceSpecialType || '';
    if (this.testForceSpecialMinAliveInput) this.testForceSpecialMinAliveInput.value = String(cfg.forceSpecialMinAlive || 1);
    const specialByKey = new Map(this.testSpecialUpgradeInputs.map((el) => [el?.dataset?.testSpecialUpgrade, el]));
    for (const key of TEST_SPECIAL_UPGRADE_KEYS) {
      const input = specialByKey.get(key);
      if (!input) continue;
      input.checked = (cfg.upgrades?.[key] || 0) > 0;
    }
    this.updateTestQuickSummary(cfg);
  }

  readSettingsFromTestDom() {
    const base = this.defaultTestSettings();
    const settings = {
      enabled: Boolean(this.testSettingsPanel?.open),
      applyTo: this.testApplyToInput?.value || 'both',
      forceSpecialType: this.testForceSpecialTypeInput?.value || null,
      forceSpecialMinAlive: this.testForceSpecialMinAliveInput?.value,
      upgrades: { ...base.upgrades },
    };
    for (const input of this.testSpecialUpgradeInputs) {
      const key = input?.dataset?.testSpecialUpgrade;
      if (!key) continue;
      settings.upgrades[key] = input.checked ? 1 : 0;
    }
    return this.normalizeTestSettings(settings);
  }

  updateTestQuickSummary(settings = null) {
    if (!this.testQuickSummary) return;
    const cfg = this.normalizeTestSettings(settings || this.readSettingsFromTestDom());
    const forceLabel = cfg.forceSpecialType
      ? `Focus ${TEST_SPECIAL_LABELS[cfg.forceSpecialType] || cfg.forceSpecialType} >= ${cfg.forceSpecialMinAlive}`
      : 'Normal random specials';
    let enabledCount = 0;
    for (const key of TEST_SPECIAL_UPGRADE_KEYS) {
      if ((cfg.upgrades?.[key] || 0) > 0) enabledCount += 1;
    }
    const testState = cfg.enabled ? 'TEST ON' : 'TEST OFF';
    const liveState = (this.hostAuthoritative && this.localRoom) ? 'LIVE' : 'SAVED';
    this.testQuickSummary.textContent = `${testState} | ${liveState} | ${forceLabel} | Upgrades ON: ${enabledCount}/${TEST_SPECIAL_UPGRADE_KEYS.length}`;
    if (this.testSettingsSummary) {
      this.testSettingsSummary.textContent = cfg.enabled
        ? 'Secret Test Settings - Testing ON'
        : 'Secret Test Settings - Testing OFF';
    }
  }

  setTestSettingsMessage(message, isError = false) {
    if (!this.testSettingsMsg) return;
    this.testSettingsMsg.textContent = message || '';
    this.testSettingsMsg.style.color = isError ? '#ffb0a6' : '';
  }

  applyTestSettingsNow(options = {}) {
    const silent = Boolean(options?.silent);
    const cfg = this.readSettingsFromTestDom();
    this.saveTestSettingsToStorage(cfg);
    this.applySettingsToTestDom(cfg);
    this.updateTestQuickSummary(cfg);
    if (!this.hostAuthoritative || this.isController) {
      if (!silent) this.setTestSettingsMessage('Saved test config. It applies on the host display.');
      return cfg;
    }
    if (!this.localRoom || typeof this.localRoom.setDebugConfig !== 'function') {
      if (!silent) this.setTestSettingsMessage('Saved test config. It will apply when the host room starts.');
      return cfg;
    }
    this.localRoom.setDebugConfig(cfg);
    this.pushHostState(true);
    if (!silent) this.setTestSettingsMessage(cfg.enabled ? 'Applied test settings to the active room.' : 'Testing paused.');
    return cfg;
  }

  initTestSettingsUi() {
    if (this.isController) return;
    this.testSettings = this.loadTestSettingsFromStorage();
    this.applySettingsToTestDom(this.testSettings);
    this.updateTestQuickSummary(this.testSettings);

    const persistOnly = () => {
      const cfg = this.readSettingsFromTestDom();
      this.saveTestSettingsToStorage(cfg);
      this.updateTestQuickSummary(cfg);
      this.setTestSettingsMessage('');
      this.applyTestSettingsNow({ silent: true });
    };
    const allInputs = [
      this.testApplyToInput,
      this.testForceSpecialTypeInput,
      this.testForceSpecialMinAliveInput,
      ...this.testSpecialUpgradeInputs,
    ];
    for (const input of allInputs) {
      input?.addEventListener('change', persistOnly);
      input?.addEventListener('input', persistOnly);
    }
    this.testSettingsPanel?.addEventListener('toggle', persistOnly);

    this.testOffBtn?.addEventListener('click', () => {
      if (this.testSettingsPanel) this.testSettingsPanel.open = false;
      this.applyTestSettingsNow();
    });
    this.testResetBtn?.addEventListener('click', () => {
      this.testSettings = this.defaultTestSettings();
      this.saveTestSettingsToStorage(this.testSettings);
      this.applySettingsToTestDom(this.testSettings);
      this.updateTestQuickSummary(this.testSettings);
      this.applyTestSettingsNow();
    });
    this.testSpecialsBtn?.addEventListener('click', () => {
      const next = this.readSettingsFromTestDom();
      next.enabled = true;
      for (const key of TEST_SPECIAL_UPGRADE_KEYS) next.upgrades[key] = 1;
      if (next.upgrades.dragonLevel <= 0) next.upgrades.dragonLevel = 1;
      this.saveTestSettingsToStorage(next);
      this.applySettingsToTestDom(next);
      this.updateTestQuickSummary(next);
      this.applyTestSettingsNow({ silent: true });
      this.setTestSettingsMessage('Special upgrades enabled.');
    });

    this.applyTestSettingsNow({ silent: true });
  }

  setupAudio() {
    this.sound = new SoundEngine();
    if (this.isController) return;
    this.setupVoiceAudio();

    const unlock = () => {
      this.sound.unlock();
      this.unlockVoiceAudio();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  setupVoiceAudio() {
    this.voiceEnabled = true;
    this.voiceUnlocked = false;
    this.voicePools = {
      hero: HERO_VOICE_CLIPS.map((url) => this.createVoiceClip(url)),
      president: PRESIDENT_VOICE_CLIPS.map((url) => this.createVoiceClip(url)),
    };
    this.voiceState = {
      hero: { timerId: null, fallbackId: null, audio: null, playing: false, lastUrl: null },
      president: { timerId: null, fallbackId: null, audio: null, playing: false, lastUrl: null },
    };
    this.refreshVoicePoolFromManifest('hero', HERO_VOICE_MANIFEST_URL);
    this.refreshVoicePoolFromManifest('president', PRESIDENT_VOICE_MANIFEST_URL);
  }

  createVoiceClip(url) {
    const metaAudio = new Audio(url);
    const clip = {
      url,
      durationSec: 0,
      metaAudio,
    };
    metaAudio.preload = 'metadata';
    metaAudio.addEventListener('loadedmetadata', () => {
      const duration = Number(metaAudio.duration);
      if (Number.isFinite(duration) && duration > 0) clip.durationSec = duration;
    });
    metaAudio.load();
    return clip;
  }

  async refreshVoicePoolFromManifest(type, manifestUrl) {
    if (!type || !manifestUrl || typeof fetch !== 'function') return;
    try {
      const res = await fetch(manifestUrl, { cache: 'no-store' });
      if (!res.ok) return;
      const payload = await res.json();
      const clips = Array.isArray(payload?.clips)
        ? payload.clips.filter((url) => typeof url === 'string' && url.trim().length > 0)
        : [];
      if (!clips.length) return;
      const unique = [...new Set(clips)];
      this.voicePools[type] = unique.map((url) => this.createVoiceClip(url));
      if (this.voiceUnlocked) this.refreshVoicePlayback();
    } catch {
      // Keep fallback list when manifest is unavailable.
    }
  }

  unlockVoiceAudio() {
    if (!this.voiceEnabled) return;
    this.voiceUnlocked = true;
    this.refreshVoicePlayback();
  }

  randomVoiceGapMs() {
    return Math.round(VOICE_GAP_MIN_MS + Math.random() * (VOICE_GAP_MAX_MS - VOICE_GAP_MIN_MS));
  }

  voiceClipDurationMs(clip) {
    if (!clip) return 0;
    const fromClip = Number(clip.durationSec);
    if (Number.isFinite(fromClip) && fromClip > 0) return Math.round(fromClip * 1000);
    const fromMeta = Number(clip.metaAudio?.duration);
    if (Number.isFinite(fromMeta) && fromMeta > 0) return Math.round(fromMeta * 1000);
    return 0;
  }

  refreshVoicePlayback() {
    if (this.isController || !this.voiceEnabled || !this.voiceState) return;

    const snapshot = this.state.snapshot;
    const minions = Array.isArray(snapshot?.minions) ? snapshot.minions : [];
    const inPlayableRound = Boolean(snapshot?.started) && !snapshot?.gameOver;
    let hasHero = false;
    let hasPresident = false;
    if (inPlayableRound) {
      for (let i = 0; i < minions.length; i += 1) {
        const m = minions[i];
        if (!m || (Number(m.hp) || 0) <= 0) continue;
        if (m.hero) hasHero = true;
        if (m.president) hasPresident = true;
        if (hasHero && hasPresident) break;
      }
    }
    this.voicePresence.hero = hasHero;
    this.voicePresence.president = hasPresident;
    this.syncVoiceType('hero', hasHero);
    this.syncVoiceType('president', hasPresident);
  }

  syncVoiceType(type, shouldRun) {
    const state = this.voiceState?.[type];
    if (!state) return;

    if (!shouldRun || !this.voiceUnlocked) {
      this.stopVoiceType(type);
      return;
    }

    if (state.playing || state.timerId) return;
    this.scheduleVoiceType(type, this.randomVoiceGapMs());
  }

  scheduleVoiceType(type, delayMs) {
    const state = this.voiceState?.[type];
    if (!state) return;
    if (state.timerId) window.clearTimeout(state.timerId);
    state.timerId = window.setTimeout(() => {
      state.timerId = null;
      this.playVoiceType(type);
    }, Math.max(100, Math.round(delayMs)));
  }

  shouldPlayVoiceType(type) {
    const snapshot = this.state.snapshot;
    if (!snapshot || !snapshot.started || snapshot.gameOver) return false;
    if (type === 'hero') return Boolean(this.voicePresence?.hero);
    if (type === 'president') return Boolean(this.voicePresence?.president);
    return false;
  }

  pickVoiceClip(type, lastUrl) {
    const pool = this.voicePools?.[type] || [];
    if (!pool.length) return null;
    if (pool.length === 1) return pool[0];
    const filtered = pool.filter((clip) => clip.url !== lastUrl);
    const source = filtered.length ? filtered : pool;
    return source[Math.floor(Math.random() * source.length)];
  }

  playVoiceType(type) {
    const state = this.voiceState?.[type];
    if (!state || !this.voiceUnlocked || !this.shouldPlayVoiceType(type)) return;

    const clip = this.pickVoiceClip(type, state.lastUrl);
    if (!clip) return;

    const audio = new Audio(clip.url);
    audio.preload = 'auto';
    audio.volume = type === 'hero' ? 0.66 : 0.62;
    state.audio = audio;
    state.playing = true;
    state.lastUrl = clip.url;

    const gapMs = this.randomVoiceGapMs();
    const clipDurationMs = this.voiceClipDurationMs(clip);
    const fallbackMs = clipDurationMs > 0 ? clipDurationMs : 12000;
    let settled = false;

    const settle = (nextDelayMs) => {
      if (settled) return;
      settled = true;
      state.playing = false;
      state.audio = null;
      if (state.fallbackId) {
        window.clearTimeout(state.fallbackId);
        state.fallbackId = null;
      }
      if (this.shouldPlayVoiceType(type)) this.scheduleVoiceType(type, nextDelayMs);
    };

    audio.addEventListener('ended', () => settle(gapMs), { once: true });
    audio.addEventListener('error', () => settle(gapMs), { once: true });

    if (fallbackMs > 0) {
      state.fallbackId = window.setTimeout(() => {
        settle(gapMs);
      }, fallbackMs + 350);
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        settle(gapMs);
      });
    }
  }

  stopVoiceType(type) {
    const state = this.voiceState?.[type];
    if (!state) return;

    if (state.timerId) {
      window.clearTimeout(state.timerId);
      state.timerId = null;
    }
    if (state.fallbackId) {
      window.clearTimeout(state.fallbackId);
      state.fallbackId = null;
    }
    if (state.audio) {
      try {
        state.audio.pause();
      } catch {
        // Ignore pause errors from interrupted media elements.
      }
      state.audio = null;
    }
    state.playing = false;
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
    const laneText = snapshot.mode === '2v2' ? ` | Archer ${this.state.slot + 1}` : '';
    this.controllerMsg.textContent = `${sideLabel(this.state.side)}${laneText} | HP ${Math.floor(me.towerHp)} | Next ${me.shotCd.toFixed(2)}s | Power ${powerStatus(me.pendingShotPower, me.pendingShotPowerShots)} | Hit ${arrowHitRate(me)}% (${me.arrowHits || 0}) | Combo ${comboStatus(me)}`;

    if (snapshot.gameOver) {
      const myAcc = arrowAccuracy(snapshot[this.state.side]);
      const enemySide = this.state.side === 'left' ? 'right' : 'left';
      const enemyAcc = arrowAccuracy(snapshot[enemySide]);
      const outcome = snapshot.winner === this.state.side ? 'Victory' : 'Defeat';
      this.controllerMsg.textContent = `${outcome} | Your Arrow Accuracy ${myAcc.rate}% (${myAcc.hits} hits / ${myAcc.fired} fired) | Enemy Arrow Accuracy ${enemyAcc.rate}% (${enemyAcc.hits} hits / ${enemyAcc.fired} fired) | Waiting for host restart`;
    }
    this.setControllerMode(true);
    this.pullPad.draw();
  }

  handleControllerCompactState(payload) {
    if (!this.state.side) return;
    if (!payload || typeof payload !== 'object') return;

    if (payload.mode === '2v2' || payload.mode === '1v1') {
      this.state.mode = payload.mode;
    }
    const laneText = this.state.mode === '2v2' ? ` | Archer ${this.state.slot + 1}` : '';
    const me = payload.me || {};
    const enemy = payload.enemy || {};
    const requiredPlayers = Number(payload.requiredPlayers) || (this.state.mode === '2v2' ? 4 : 2);
    const playerCount = Number(payload.playerCount) || 0;

    if (!payload.started && !payload.gameOver) {
      this.controllerMsg.textContent = `${sideLabel(this.state.side)}${laneText} | Waiting for players ${playerCount}/${requiredPlayers}`;
      this.setControllerMode(true);
      this.pullPad.draw();
      return;
    }

    this.controllerMsg.textContent = `${sideLabel(this.state.side)}${laneText} | HP ${Math.floor(Number(me.towerHp) || 0)} | Next ${(Number(me.shotCd) || 0).toFixed(2)}s | Power ${powerStatus(me.pendingShotPower, me.pendingShotPowerShots)} | Hit ${arrowHitRate(me)}% (${me.arrowHits || 0}) | Combo ${comboStatus(me)}`;

    if (payload.gameOver) {
      const myAcc = arrowAccuracy(me);
      const enemyAcc = arrowAccuracy(enemy);
      const outcome = payload.winner === this.state.side ? 'Victory' : 'Defeat';
      this.controllerMsg.textContent = `${outcome} | Your Arrow Accuracy ${myAcc.rate}% (${myAcc.hits} hits / ${myAcc.fired} fired) | Enemy Arrow Accuracy ${enemyAcc.rate}% (${enemyAcc.hits} hits / ${enemyAcc.fired} fired) | Waiting for host restart`;
    }

    this.setControllerMode(true);
    this.pullPad.draw();
  }

  setPostGamePanel(visible, snapshot = null) {
    if (!this.postGamePanel || this.isController) return;
    this.postGamePanel.classList.toggle('hidden', !visible);
    if (!visible || !snapshot) {
      if (this.restartMsg) this.restartMsg.textContent = '';
      return;
    }
    const winnerLabel = sideName(snapshot.winner);
    const leftSummary = arrowAccuracySummary('West', snapshot.left);
    const rightSummary = arrowAccuracySummary('East', snapshot.right);
    if (this.postGameTitle) this.postGameTitle.textContent = `${winnerLabel} Kingdom Wins`;
    if (this.postGameStats) this.postGameStats.textContent = `${leftSummary} | ${rightSummary}`;
    if (this.postGameExplain) this.postGameExplain.textContent = 'Arrow Accuracy = hits / arrows fired';
  }

  resetGameOverPresentation() {
    this.gameOverLatched = false;
    this.gameOverRevealAtMs = 0;
    this.nextGameOverBoomAtMs = 0;
  }

  handleDisplayState(snapshot) {
    const mode = snapshot.mode === '2v2' ? '2v2' : '1v1';
    this.state.mode = mode;
    if (this.state.createMode !== mode) this.setCreateMode(mode);
    this.updateHud(snapshot);
    if (snapshot.started) this.setDisplayMode('game');
    else if (this.state.roomId) {
      this.setDisplayMode('lobby');
      this.setPostGamePanel(false);
      const required = Number(snapshot.requiredPlayers) || (snapshot.mode === '2v2' ? 4 : 2);
      const count = Number(snapshot.playerCount) || 0;
      const leftCount = Array.isArray(snapshot.players?.left) ? snapshot.players.left.length : (snapshot.players?.left ? 1 : 0);
      const rightCount = Array.isArray(snapshot.players?.right) ? snapshot.players.right.length : (snapshot.players?.right ? 1 : 0);
      if (this.lobbyMsg) {
        this.lobbyMsg.textContent = `Mode ${this.state.mode.toUpperCase()} | Waiting for ${required} controllers (${count}/${required}) | West ${leftCount}/${required / 2} | East ${rightCount}/${required / 2}`;
      }
      this.renderLobbyPhonePreviews();
    }

    if (snapshot.gameOver) {
      const now = performance.now();
      if (!this.gameOverLatched) {
        this.gameOverLatched = true;
        this.gameOverRevealAtMs = now + GAME_OVER_CINEMATIC_MS;
        this.nextGameOverBoomAtMs = now;
      }

      if (!this.isController && this.sound && now < this.gameOverRevealAtMs && now >= this.nextGameOverBoomAtMs) {
        this.sound.play('explosion');
        this.sound.play('dragonfire');
        this.nextGameOverBoomAtMs = now + 420 + Math.random() * 170;
      }

      if (!this.isController && this.centerHud && now < this.gameOverRevealAtMs) {
        this.centerHud.textContent = 'Tower collapsing...';
      }

      this.setPostGamePanel(now >= this.gameOverRevealAtMs, snapshot);
      this.updateDisplayCursorIdle(now);
      return;
    }

    this.resetGameOverPresentation();
    this.setPostGamePanel(false);
    this.updateDisplayCursorIdle(performance.now());
  }

  startRenderLoop() {
    const frame = () => {
      if (!this.isController && this.state.snapshot && this.state.world) {
        this.renderer.draw(this.state.snapshot, this.state.world);
      }
      this.updateDisplayCursorIdle(performance.now());
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    this.menu.classList.toggle('hidden', mode !== 'menu');
    this.lobby.classList.toggle('hidden', mode !== 'lobby');
    this.canvas.classList.toggle('hidden', mode !== 'game');
    this.hud.classList.toggle('hidden', mode !== 'game');
    if (this.postGamePanel && mode !== 'game') this.postGamePanel.classList.add('hidden');
    if (!this.isController) {
      const inGame = mode === 'game';
      document.documentElement.classList.toggle('display-game-mode', inGame);
      document.body.classList.toggle('display-game-mode', inGame);
      this.setKeepAwake(inGame);
      if (inGame) this.refreshVoicePlayback();
      else {
        this.stopVoiceType('hero');
        this.stopVoiceType('president');
      }
    }
    if (!this.isController && mode === 'lobby') this.renderLobbyPhonePreviews();
    this.updateDisplayCursorIdle(performance.now());
  }

  handleDisplayPointerActivity() {
    this.cursorLastActivityAt = performance.now();
    if (this.cursorHiddenForIdle) this.setDisplayCursorHidden(false);
  }

  shouldAutoHideDisplayCursor() {
    if (this.isController) return false;
    if (this.displayMode !== 'game') return false;
    const snapshot = this.state.snapshot;
    if (!snapshot || !snapshot.started) return false;
    if (snapshot.gameOver) return false;
    return true;
  }

  updateDisplayCursorIdle(nowMs) {
    if (this.isController) return;
    if (!this.shouldAutoHideDisplayCursor()) {
      this.cursorLastActivityAt = nowMs;
      if (this.cursorHiddenForIdle) this.setDisplayCursorHidden(false);
      return;
    }
    const idleMs = nowMs - this.cursorLastActivityAt;
    if (idleMs >= DISPLAY_CURSOR_IDLE_MS) this.setDisplayCursorHidden(true);
  }

  setDisplayCursorHidden(hidden) {
    if (this.isController) return;
    const value = hidden ? 'none' : '';
    if (document.documentElement) document.documentElement.style.cursor = value;
    if (document.body) document.body.style.cursor = value;
    if (this.canvas) this.canvas.style.cursor = value;
    this.cursorHiddenForIdle = Boolean(hidden);
  }

  setControllerMode(joined) {
    this.menu.classList.add('hidden');
    this.lobby.classList.add('hidden');
    this.canvas.classList.add('hidden');
    this.hud.classList.add('hidden');
    if (this.postGamePanel) this.postGamePanel.classList.add('hidden');
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
    const leftRoster = Array.isArray(s.players?.left)
      ? s.players.left.map((p) => p?.name).filter(Boolean).join(' + ')
      : (s.players?.left?.name || s.primaryPlayers?.left?.name || 'West');
    const rightRoster = Array.isArray(s.players?.right)
      ? s.players.right.map((p) => p?.name).filter(Boolean).join(' + ')
      : (s.players?.right?.name || s.primaryPlayers?.right?.name || 'East');
    this.leftHud.textContent = `${leftRoster || 'West'} | HP ${Math.max(0, Math.floor(s.left.towerHp))} | Gold ${Math.floor(s.left.gold)} | Upg ${leftUpg} | Eco ${s.left.economyLevel} | KillGold x${killGoldMultiplier(s.left)} | Power ${powerStatus(s.left.pendingShotPower, s.left.pendingShotPowerShots)} | Hit ${arrowHitRate(s.left)}% (${s.left.arrowHits || 0}) | Combo ${comboStatus(s.left)}`;
    this.rightHud.textContent = `${rightRoster || 'East'} | HP ${Math.max(0, Math.floor(s.right.towerHp))} | Gold ${Math.floor(s.right.gold)} | Upg ${rightUpg} | Eco ${s.right.economyLevel} | KillGold x${killGoldMultiplier(s.right)} | Power ${powerStatus(s.right.pendingShotPower, s.right.pendingShotPowerShots)} | Hit ${arrowHitRate(s.right)}% (${s.right.arrowHits || 0}) | Combo ${comboStatus(s.right)}`;
    if (s.gameOver) {
      const leftSummary = arrowAccuracySummary('West', s.left);
      const rightSummary = arrowAccuracySummary('East', s.right);
      const localHint = this.localKeyboardTestActive ? ' | Keyboard Mode' : '';
      this.centerHud.textContent = `Final | Winner ${sideName(s.winner)}${localHint} | ${leftSummary} | ${rightSummary}`;
      return;
    }
    const localHint = this.localKeyboardTestActive ? ' | Controls: West W/A/S/D / East Arrows' : '';
    this.centerHud.textContent = `Mode ${String(s.mode || '1v1').toUpperCase()}${localHint} | Next Shot: West ${s.left.shotCd.toFixed(2)}s | East ${s.right.shotCd.toFixed(2)}s`;
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
      this.setCreateMode('1v1');
      this.setDisplayMode('lobby');
      if (this.lobbyModeMsg) this.lobbyModeMsg.textContent = 'Room auto-created. Pick a control mode per match: Phones (QR) or Keyboard on this computer.';
      this.requestRoomCreate('1v1');
    }
  }
}

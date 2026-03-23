import { GameRenderer } from './GameRenderer.js';
import { ControllerPad } from './ControllerPad.js';
import { SoundEngine } from './SoundEngine.js';
import { SHOT_POWER_LABELS, TEAM_COLORS, upgradeLabelForLevel } from './constants.js';
import { GameRoom as SimGameRoom } from './SimGameRoom.js';
import {
  DEFAULT_THEME_MODE,
  THEME_MODE_THEMED,
  THEME_MODE_UNTHEMED,
  defaultArcherName,
  defaultKeyboardName,
  normalizeThemeMode,
  sideControllerLabel,
  sideDisplayName,
  sideShortName,
  sideVictoryLabel,
} from './themeConfig.js';

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
const THEME_STORAGE_KEY = 'enf_theme_mode_v1';
const TEST_SETTINGS_STORAGE_KEY = 'totk_test_settings_v4';
const BASE_TEAM_COLORS = {
  left: { ...TEAM_COLORS.left },
  right: { ...TEAM_COLORS.right },
};
const TEST_SPECIAL_UPGRADE_KEYS = [
  'balloonLevel',
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
  balloonLevel: 4,
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
const TEST_FORCED_SPECIAL_TYPES = new Set(['dragon', 'shield', 'digger', 'necrominion', 'gunner', 'rider', 'monk', 'stonegolem', 'hero', 'president', 'balloon', 'super']);
const TEST_SPECIAL_LABELS = {
  dragon: 'Dragon',
  shield: 'Shield',
  digger: 'Digger',
  necrominion: 'Necro',
  gunner: 'Gunner',
  rider: 'Rider',
  monk: 'Monk',
  stonegolem: 'Golem',
  hero: 'Hero',
  president: 'President',
  balloon: 'Balloon',
  super: 'Super',
};
const POST_UPGRADE_CODES = {
  arrowLevel: 'AR',
  unitLevel: 'UN',
  volleyLevel: 'VO',
  spawnLevel: 'SP',
  unitHpLevel: 'HP',
  resourceLevel: 'RS',
  bountyLevel: 'KG',
  powerLevel: 'PW',
  specialRateLevel: 'SR',
  balloonLevel: 'BA',
  dragonLevel: 'DR',
  dragonSuperBreathLevel: 'SB',
  shieldDarkMetalLevel: 'DM',
  monkHealCircleLevel: 'HC',
  necroExpertSummonerLevel: 'NE',
  riderSuperHorseLevel: 'RH',
  diggerGoldFinderLevel: 'GF',
  gunnerSkyCannonLevel: 'SC',
  presidentExecutiveOrderLevel: 'EO',
  superMinionLevel: 'SU',
};
const POST_UPGRADE_ICONS = {
  arrowLevel: '🏹',
  unitLevel: '⚔️',
  volleyLevel: '🪶',
  spawnLevel: '👥',
  unitHpLevel: '🛡️',
  resourceLevel: '💰',
  bountyLevel: '🎯',
  powerLevel: '⚡',
  specialRateLevel: '✨',
  balloonLevel: '🎈',
  dragonLevel: '🐉',
  dragonSuperBreathLevel: '🔥',
  shieldDarkMetalLevel: '🧱',
  monkHealCircleLevel: '💚',
  necroExpertSummonerLevel: '☠️',
  riderSuperHorseLevel: '🐎',
  diggerGoldFinderLevel: '⛏️',
  gunnerSkyCannonLevel: '💣',
  presidentExecutiveOrderLevel: '📜',
  superMinionLevel: '⭐',
};
const POST_UPGRADE_FEED_MAX_EVENTS = 40;
const POST_GAME_BREAD_PUNS = [
  'Bread won. Rice is now in loaf spirits.',
  'Dough it again: Bread rises to the top.',
  'Bread victory! Rice just could not crust the process.',
  'Bread takes it. That finish was toast-worthy.',
  'Another one for Bread. Rice got out-kneaded.',
  'Bread wins by a crumb-fortable margin.',
  'Bread clutched it. Rice was left in crumbs.',
  'Bread empire rises. Rice got baked under pressure.',
  'Bread secures the bag-uette and the crown.',
  'Bread wins. Rice could not handle the heat in the oven.',
];
const POST_GAME_RICE_PUNS = [
  'Rice wins. Bread is feeling a little crumby.',
  'Rice cooked today. Bread got steamed out.',
  'Rice victory! Bread was toast by the end.',
  'Rice takes the grain finale in style.',
  'Rice served a hot finish. Bread got overcooked.',
  'Rice wins big. Bread could not loaf around forever.',
  'Rice takes the bowl and bread takes the L.',
  'Rice clutched it. Bread was left to cool.',
  'Rice empire reigns. Bread got rolled flat.',
  'Rice wins. Bread could not butter up the scoreboard.',
];

function hashString(value) {
  const text = `${value || ''}`;
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash * 31) + text.charCodeAt(i)) | 0;
  }
  return hash;
}

function postGamePunTitle(winner, themeMode, seed = '') {
  if (normalizeThemeMode(themeMode) !== THEME_MODE_THEMED) return null;
  const puns = winner === 'left'
    ? POST_GAME_BREAD_PUNS
    : winner === 'right'
      ? POST_GAME_RICE_PUNS
      : null;
  if (!puns || !puns.length) return null;
  const index = Math.abs(hashString(`${winner}|${seed}`)) % puns.length;
  return puns[index];
}

function compactUpgradeFeedEvents(events, maxEvents = POST_UPGRADE_FEED_MAX_EVENTS) {
  const source = Array.isArray(events) ? events : [];
  const limit = Math.max(8, Math.floor(Number(maxEvents) || 0));
  if (source.length <= limit) return source.slice();
  const sampled = [];
  const lastIndex = source.length - 1;
  const step = lastIndex / (limit - 1);
  let previousIndex = -1;
  for (let i = 0; i < limit; i += 1) {
    let index = Math.round(i * step);
    if (index <= previousIndex) index = Math.min(lastIndex, previousIndex + 1);
    sampled.push(source[index]);
    previousIndex = index;
  }
  return sampled;
}

function colorWithAlpha(color, alpha = 1) {
  const safe = Math.max(0, Math.min(1, Number(alpha) || 0));
  if (typeof color !== 'string') return `rgba(255,255,255,${safe})`;
  const hex = color.trim();
  const longHex = /^#([0-9a-fA-F]{6})$/;
  const shortHex = /^#([0-9a-fA-F]{3})$/;
  let normalized = null;
  if (longHex.test(hex)) normalized = hex.slice(1);
  else if (shortHex.test(hex)) normalized = hex.slice(1).split('').map((ch) => `${ch}${ch}`).join('');
  if (!normalized) return color;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${safe})`;
}

function clampNumber(value, min, max, fallback = min) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function sideLabel(side, themeMode = DEFAULT_THEME_MODE) {
  return sideControllerLabel(side, themeMode);
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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => {
    if (ch === '&') return '&amp;';
    if (ch === '<') return '&lt;';
    if (ch === '>') return '&gt;';
    if (ch === '"') return '&quot;';
    return '&#39;';
  });
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
      themeMode: this.loadThemeModeFromStorage(),
      world: null,
      snapshot: null,
    };
    this.voiceEnabled = false;
    this.voiceUnlocked = false;
    this.voicePools = null;
    this.voiceState = null;
    this.voicePresence = { hero: false, president: false };
    this.gameOverLatched = false;
    this.gameOverLatchedAtMs = 0;
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
    this.postGameReportData = null;
    this.postGameRenderedKey = null;
    this.postGamePreviewDataUrl = '';
    this.postUpgradeFeedEvents = [];
    this.postUpgradeScrubRatio = 0;
    this.postUpgradeScrubRaf = 0;
    this.controllerRematch = {
      gameOver: false,
      requested: false,
      votes: 0,
      totalConnected: 0,
      requiredPlayers: 0,
      missingPlayers: 0,
      immediateRematchReady: false,
    };

    this.bindDom();
    this.applyThemeMode(this.state.themeMode, { persist: false, requestServer: false, updateRoom: false });
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
    this.controllerSideBadge = document.getElementById('controllerSideBadge');
    this.controllerSidePill = document.getElementById('controllerSidePill');
    this.controllerSideFlavor = document.getElementById('controllerSideFlavor');
    this.controllerRematchPanel = document.getElementById('controllerRematchPanel');
    this.controllerRematchBtn = document.getElementById('controllerRematchBtn');
    this.controllerRematchStatus = document.getElementById('controllerRematchStatus');

    this.canvas = document.getElementById('game');
    this.renderer = new GameRenderer(this.canvas);

    this.roomInput = document.getElementById('roomInput');
    this.joinBtn = document.getElementById('joinBtn');
    this.mode2PlayersBtn = document.getElementById('mode2PlayersBtn');
    this.mode4PlayersBtn = document.getElementById('mode4PlayersBtn');
    this.themeThemedBtn = document.getElementById('themeThemedBtn');
    this.themeUnthemedBtn = document.getElementById('themeUnthemedBtn');
    this.themeModeHint = document.getElementById('themeModeHint');
    this.createRoomBtn = document.getElementById('createRoomBtn');
    this.menuMsg = document.getElementById('menuMsg');

    this.roomCodeEl = document.getElementById('roomCode');
    this.qrImage = document.getElementById('qrImage');
    this.joinLink = document.getElementById('joinLink');
    this.lobbyMode2PlayersBtn = document.getElementById('lobbyMode2PlayersBtn');
    this.lobbyMode4PlayersBtn = document.getElementById('lobbyMode4PlayersBtn');
    this.lobbyThemeThemedBtn = document.getElementById('lobbyThemeThemedBtn');
    this.lobbyThemeUnthemedBtn = document.getElementById('lobbyThemeUnthemedBtn');
    this.lobbyThemeModeHint = document.getElementById('lobbyThemeModeHint');
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
    this.testStartingGoldInput = document.getElementById('testStartingGoldInput');
    this.testColliderDebugInput = document.getElementById('testColliderDebugInput');
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
    this.postChartHelp = document.getElementById('postChartHelp');
    this.postGamePreview = document.getElementById('postGamePreview');
    this.postSummaryGrid = document.getElementById('postSummaryGrid');
    this.postCompareRows = document.getElementById('postCompareRows');
    this.postEconChart = document.getElementById('postEconChart');
    this.postUpgradeTimeline = document.getElementById('postUpgradeTimeline');
    this.restartMatchBtn = document.getElementById('restartMatchBtn');
    this.restartMsg = document.getElementById('restartMsg');

    this.controls = document.getElementById('controls');
    this.pullPad = new ControllerPad(document.getElementById('pullPad'), (pull) => {
      if (!this.state.roomId || !this.state.side) return;
      this.socket.emit('control_pull', { roomId: this.state.roomId, x: pull.x, y: pull.y });
    });
  }

  bindEvents() {
    this.controllerRematchBtn?.addEventListener('click', () => {
      if (!this.isController || !this.state.roomId) return;
      const wantsRematch = !Boolean(this.controllerRematch?.requested);
      this.requestControllerRematch(wantsRematch);
    });

    if (!this.isController) {
      this.mode2PlayersBtn?.addEventListener('click', () => this.setCreateMode('1v1'));
      this.mode4PlayersBtn?.addEventListener('click', () => this.setCreateMode('2v2'));
      this.themeThemedBtn?.addEventListener('click', () => this.handleThemeSelection(THEME_MODE_THEMED));
      this.themeUnthemedBtn?.addEventListener('click', () => this.handleThemeSelection(THEME_MODE_UNTHEMED));
      this.lobbyMode2PlayersBtn?.addEventListener('click', () => {
        this.setCreateMode('1v1');
        if (this.state.roomId) this.requestRoomModeChange('1v1');
      });
      this.lobbyMode4PlayersBtn?.addEventListener('click', () => {
        this.setCreateMode('2v2');
        if (this.state.roomId) this.requestRoomModeChange('2v2');
      });
      this.lobbyThemeThemedBtn?.addEventListener('click', () => this.handleThemeSelection(THEME_MODE_THEMED));
      this.lobbyThemeUnthemedBtn?.addEventListener('click', () => this.handleThemeSelection(THEME_MODE_UNTHEMED));
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
      window.addEventListener('resize', () => {
        this.renderLobbyPhonePreviews();
        if (!this.postGamePanel?.classList.contains('hidden') && this.state.snapshot?.gameOver) {
          this.renderPostGameDashboard(this.state.snapshot, true);
        }
      });
      this.postEconChart?.addEventListener('mousemove', (event) => this.handlePostChartHover(event));
      this.postEconChart?.addEventListener('mouseenter', (event) => this.handlePostChartHover(event));
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

    this.socket.on('room_created', ({ roomId, joinUrl, qrDataUrl, mode, requiredPlayers, hostAuthoritative, themeMode }) => {
      this.localKeyboardTestActive = false;
      this.localPressedKeys.clear();
      this.state.roomId = roomId;
      this.state.mode = mode === '2v2' ? '2v2' : '1v1';
      this.applyThemeMode(themeMode || this.state.themeMode, {
        persist: true,
        requestServer: false,
        updateRoom: false,
        rerenderHud: false,
      });
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
      if (this.localKeyboardHint) this.localKeyboardHint.textContent = this.keyboardMatchHintText();
      if (this.localKeyboardTestBtn) this.localKeyboardTestBtn.textContent = 'Play On This Computer (Keyboard)';
      if (this.restartMsg) this.restartMsg.textContent = '';
      this.resetGameOverPresentation();
      this.setPostGamePanel(false);
      if (this.lobbyMsg) this.lobbyMsg.textContent = `Mode ${this.state.mode.toUpperCase()} | Waiting for ${requiredPlayers || (this.state.mode === '2v2' ? 4 : 2)} controllers...`;
      this.renderLobbyPhonePreviews();
      if (!this.isController) this.setDisplayMode('lobby');
    });

    this.socket.on('room_create_error', ({ message } = {}) => {
      const text = message || 'Unable to create room right now.';
      if (this.isController) {
        this.controllerMsg.textContent = text;
        return;
      }
      if (this.state.roomId && this.lobbyMsg) this.lobbyMsg.textContent = text;
      else if (this.menuMsg) this.menuMsg.textContent = text;
    });

    this.socket.on('room_mode_updated', ({ mode, requiredPlayers, themeMode }) => {
      if (this.isController) return;
      this.state.mode = mode === '2v2' ? '2v2' : '1v1';
      if (themeMode) {
        this.applyThemeMode(themeMode, {
          persist: true,
          requestServer: false,
          updateRoom: true,
          rerenderHud: false,
        });
      }
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

    this.socket.on('room_theme_updated', ({ themeMode }) => {
      this.applyThemeMode(themeMode, {
        persist: true,
        requestServer: false,
        updateRoom: !this.isController,
      });
      if (!this.isController && this.lobbyThemeModeHint) this.lobbyThemeModeHint.textContent = this.themedModeHintText();
    });

    this.socket.on('room_theme_error', ({ message }) => {
      if (this.isController) return;
      if (this.lobbyThemeModeHint && this.state.roomId) this.lobbyThemeModeHint.textContent = message || 'Unable to change theme.';
      else if (this.menuMsg) this.menuMsg.textContent = message || 'Unable to change theme.';
    });

    this.socket.on('room_restarted', (payload = {}) => {
      if (payload?.themeMode) {
        this.applyThemeMode(payload.themeMode, {
          persist: true,
          requestServer: false,
          updateRoom: !this.isController,
          rerenderHud: false,
        });
      }
      if (this.isController) {
        const immediate = Boolean(payload?.immediateRematch);
        const waitingForPlayers = Boolean(payload?.waitingForPlayers);
        if (immediate) this.controllerMsg.textContent = 'Rematch started. Get ready.';
        else if (waitingForPlayers) this.controllerMsg.textContent = 'Rematch accepted. Waiting for missing players to rejoin.';
        else this.controllerMsg.textContent = 'Match restarted.';
        this.resetControllerRematchState();
        this.renderControllerRematchUi();
        return;
      }
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

    this.socket.on('joined_room', ({ roomId, side, slot, mode, requiredPlayers, themeMode }) => {
      this.state.roomId = roomId;
      this.state.side = side;
      this.state.slot = Number.isFinite(slot) ? slot : 0;
      this.state.mode = mode === '2v2' ? '2v2' : '1v1';
      this.applyThemeMode(themeMode || this.state.themeMode, {
        persist: true,
        requestServer: false,
        updateRoom: false,
        rerenderHud: false,
      });
      this.resetControllerRematchState();
      const laneText = this.state.mode === '2v2' ? ` | Archer ${this.state.slot + 1}` : '';
      this.controllerMsg.textContent = `Connected as ${sideLabel(side, this.state.themeMode)}${laneText}. Room needs ${requiredPlayers || 2} controllers.`;
      this.pullPad.setSide(side);
      this.setControllerMode(true);
      this.renderControllerRematchUi();
      this.socket.emit('control_pull', { roomId, x: this.pullPad.pull.x, y: this.pullPad.pull.y });
    });

    this.socket.on('join_error', ({ message }) => {
      if (this.isController) this.controllerMsg.textContent = message;
      else if (this.menuMsg) this.menuMsg.textContent = message;
    });

    this.socket.on('controller_rematch_error', ({ message }) => {
      if (!this.isController) return;
      this.controllerMsg.textContent = message || 'Unable to update rematch request.';
    });

    this.socket.on('player_left', () => {
      if (this.isController) this.controllerMsg.textContent = 'Other player disconnected. Waiting for reconnection...';
      else this.centerHud.textContent = 'Controller disconnected. Waiting for players...';
      this.renderLobbyPhonePreviews();
    });

    this.socket.on('room_closed', ({ message } = {}) => {
      const text = message || 'Room closed.';
      this.stopHostAuthorityLoop();
      this.localKeyboardTestActive = false;
      this.localPressedKeys.clear();
      this.hostAuthoritative = false;
      this.localRoom = null;
      this.remoteDisplayCount = 0;
      this.state.roomId = null;
      this.state.snapshot = null;
      this.state.world = null;
      this.resetGameOverPresentation();
      this.setPostGamePanel(false);

      if (this.isController) {
        this.state.side = null;
        this.state.slot = 0;
        this.controllerMsg.textContent = text;
        this.setControllerMode(false);
        return;
      }

      if (this.roomCodeEl) this.roomCodeEl.textContent = '----';
      if (this.qrImage) this.qrImage.removeAttribute('src');
      if (this.joinLink) {
        this.joinLink.removeAttribute('href');
        this.joinLink.textContent = '';
      }
      this.setDisplayMode('lobby');
      if (this.lobbyMsg) this.lobbyMsg.textContent = text;
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
      themeMode: this.state.themeMode,
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
    if (payload.themeMode) {
      this.applyThemeMode(payload.themeMode, {
        persist: true,
        requestServer: false,
        updateRoom: true,
        rerenderHud: false,
      });
    }
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
      themeMode: this.state.themeMode,
      debugConfig: this.readSettingsFromTestDom(),
    });
    this.localRoom.players = {
      left: [{ id: '__LOCAL_WEST__', name: defaultKeyboardName('left', this.state.themeMode), slot: 0 }],
      right: [{ id: '__LOCAL_EAST__', name: defaultKeyboardName('right', this.state.themeMode), slot: 0 }],
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
    if (this.localKeyboardHint) this.localKeyboardHint.textContent = this.keyboardActiveHintText();
    if (this.localKeyboardTestBtn) this.localKeyboardTestBtn.textContent = 'Restart Keyboard Match';

    if (this.lobbyModeMsg) this.lobbyModeMsg.textContent = this.keyboardStartMessageText();
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
    const roomStarted = Boolean(this.localRoom.started);
    const roomGameOver = Boolean(this.localRoom.gameOver);
    if (!force && !roomStarted && !roomGameOver) return;
    const snapshot = this.localRoom.snapshotForDisplay();
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
    if (!force && now < this.nextHostStateEmitAt) return;
    this.nextHostStateEmitAt = now + HOST_STATE_EMIT_MS;

    const controllerFrame = {
      mode: snapshot.mode === '2v2' ? '2v2' : '1v1',
      themeMode: snapshot.themeMode || this.state.themeMode,
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
    const displaySnapshot = needsDisplaySnapshot ? this.localRoom.serialize() : null;
    this.socket.emit('host_state', {
      roomId: this.state.roomId,
      snapshot: displaySnapshot,
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
      name: 'Fuel Screen',
      origin: window.location.origin + window.location.pathname,
      mode: normalized,
      themeMode: this.state.themeMode,
    });
  }

  requestRoomModeChange(mode = '1v1') {
    if (!this.state.roomId) return;
    const normalized = mode === '2v2' ? '2v2' : '1v1';
    const label = normalized === '2v2' ? '4 players (2v2)' : '2 players (1v1)';
    if (this.lobbyModeMsg) this.lobbyModeMsg.textContent = `Switching room size to ${label}...`;
    this.socket.emit('set_room_mode', { roomId: this.state.roomId, mode: normalized });
  }

  requestRoomThemeChange(themeMode = DEFAULT_THEME_MODE) {
    if (!this.state.roomId) return;
    const normalized = normalizeThemeMode(themeMode);
    if (this.lobbyThemeModeHint) {
      this.lobbyThemeModeHint.textContent = normalized === THEME_MODE_THEMED
        ? 'Switching to Bread vs Rice theme...'
        : 'Switching to classic West vs East theme...';
    }
    this.socket.emit('set_room_theme', { roomId: this.state.roomId, themeMode: normalized });
  }

  requestRoomRestart() {
    if (!this.state.roomId) return;
    if (this.restartMsg) this.restartMsg.textContent = 'Restarting match...';
    this.socket.emit('restart_room', { roomId: this.state.roomId });
  }

  requestControllerRematch(wantsRematch = true) {
    if (!this.isController || !this.state.roomId) return;
    this.socket.emit('controller_rematch', {
      roomId: this.state.roomId,
      wantsRematch: Boolean(wantsRematch),
    });
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

  loadThemeModeFromStorage() {
    try {
      const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
      return normalizeThemeMode(raw || DEFAULT_THEME_MODE);
    } catch {
      return DEFAULT_THEME_MODE;
    }
  }

  saveThemeModeToStorage(themeMode = DEFAULT_THEME_MODE) {
    const normalized = normalizeThemeMode(themeMode);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
    } catch {
      // Ignore storage errors and continue with in-memory preference.
    }
  }

  applyTeamColors(themeMode = DEFAULT_THEME_MODE) {
    // Keep team readability consistent in both modes: West stays blue, East stays red.
    TEAM_COLORS.left = { ...BASE_TEAM_COLORS.left };
    TEAM_COLORS.right = { ...BASE_TEAM_COLORS.right };
  }

  syncThemeToggleButtons(themedBtn, unthemedBtn, themeMode) {
    const themed = normalizeThemeMode(themeMode) === THEME_MODE_THEMED;
    if (themedBtn) {
      themedBtn.classList.toggle('active', themed);
      themedBtn.setAttribute('aria-pressed', String(themed));
    }
    if (unthemedBtn) {
      unthemedBtn.classList.toggle('active', !themed);
      unthemedBtn.setAttribute('aria-pressed', String(!themed));
    }
  }

  keyboardMatchHintText() {
    return `Keyboard mode: ${sideDisplayName('left', this.state.themeMode)} aims with W/A/S/D and ${sideDisplayName('right', this.state.themeMode)} aims with Arrow keys. Pick keyboard or phones per match.`;
  }

  keyboardActiveHintText() {
    return 'Keyboard mode active. Hold keys to smoothly move each side aim cursor. Phone controllers are disabled in this match.';
  }

  keyboardStartMessageText() {
    return `Keyboard match started. ${sideShortName('left', this.state.themeMode)}: W/A/S/D | ${sideShortName('right', this.state.themeMode)}: Arrow keys. Use phones in a separate match.`;
  }

  keyboardControlsLegendText() {
    return `Controls: ${sideShortName('left', this.state.themeMode)} W/A/S/D / ${sideShortName('right', this.state.themeMode)} Arrows`;
  }

  themedModeHintText() {
    if (this.state.themeMode === THEME_MODE_THEMED) return 'Theme ON: Bread Empire vs Rice Empire.';
    return 'Theme OFF: classic West vs East labels.';
  }

  controllerSideIdentity(side = this.state.side, themeMode = this.state.themeMode) {
    const sideName = side === 'right' ? 'right' : 'left';
    const mode = normalizeThemeMode(themeMode);
    if (mode === THEME_MODE_THEMED) {
      if (sideName === 'left') {
        return {
          pill: 'WEST • BREAD',
          flavor: 'European style Bread Empire controller',
        };
      }
      return {
        pill: 'EAST • RICE',
        flavor: 'Asian style Rice Empire controller',
      };
    }
    if (sideName === 'left') {
      return {
        pill: 'WEST',
        flavor: 'Classic West Kingdom controller',
      };
    }
    return {
      pill: 'EAST',
      flavor: 'Classic East Kingdom controller',
    };
  }

  refreshControllerSideBadge() {
    if (!this.isController) return;
    const side = this.state.side === 'right' ? 'right' : (this.state.side === 'left' ? 'left' : null);
    const joined = Boolean(this.state.roomId && side);
    if (this.controllerPanel) {
      this.controllerPanel.classList.toggle('controller-side-left', joined && side === 'left');
      this.controllerPanel.classList.toggle('controller-side-right', joined && side === 'right');
      this.controllerPanel.classList.toggle('controller-side-themed', this.state.themeMode === THEME_MODE_THEMED);
      this.controllerPanel.classList.toggle('controller-side-unthemed', this.state.themeMode === THEME_MODE_UNTHEMED);
    }
    if (!this.controllerSideBadge) return;
    this.controllerSideBadge.classList.toggle('hidden', !joined);
    if (!joined) return;
    const identity = this.controllerSideIdentity(side, this.state.themeMode);
    if (this.controllerSidePill) this.controllerSidePill.textContent = identity.pill;
    if (this.controllerSideFlavor) this.controllerSideFlavor.textContent = identity.flavor;
  }

  postChartHelpText() {
    return `Blue is ${sideDisplayName('left', this.state.themeMode)}, red is ${sideDisplayName('right', this.state.themeMode)}. This tracks cumulative gold earned. Upgrade icons mark power spikes.`;
  }

  refreshThemeCopy() {
    document.title = 'Empires Must Eat';
    if (this.themeModeHint) this.themeModeHint.textContent = this.themedModeHintText();
    if (this.lobbyThemeModeHint) this.lobbyThemeModeHint.textContent = this.themedModeHintText();
    if (this.postChartHelp) this.postChartHelp.textContent = this.postChartHelpText();
    if (this.localKeyboardHint && !this.localKeyboardTestActive) this.localKeyboardHint.textContent = this.keyboardMatchHintText();
  }

  applyThemeMode(themeMode, options = {}) {
    const normalized = normalizeThemeMode(themeMode);
    const {
      persist = true,
      requestServer = false,
      updateRoom = true,
      rerenderHud = true,
    } = options;
    this.state.themeMode = normalized;
    if (persist) this.saveThemeModeToStorage(normalized);
    this.applyTeamColors(normalized);
    this.renderer?.setThemeMode(normalized);
    if (document.documentElement) {
      document.documentElement.classList.toggle('theme-themed', normalized === THEME_MODE_THEMED);
      document.documentElement.classList.toggle('theme-unthemed', normalized === THEME_MODE_UNTHEMED);
    }
    if (document.body) {
      document.body.classList.toggle('theme-themed', normalized === THEME_MODE_THEMED);
      document.body.classList.toggle('theme-unthemed', normalized === THEME_MODE_UNTHEMED);
    }
    this.syncThemeToggleButtons(this.themeThemedBtn, this.themeUnthemedBtn, normalized);
    this.syncThemeToggleButtons(this.lobbyThemeThemedBtn, this.lobbyThemeUnthemedBtn, normalized);
    this.refreshThemeCopy();
    if (updateRoom && this.localRoom && typeof this.localRoom.setThemeMode === 'function') {
      this.localRoom.setThemeMode(normalized);
    }
    if (requestServer && !this.isController && this.state.roomId) {
      this.requestRoomThemeChange(normalized);
    }
    if (rerenderHud && this.state.snapshot && !this.isController) this.updateHud(this.state.snapshot);
    if (rerenderHud && this.state.snapshot?.gameOver && !this.postGamePanel?.classList.contains('hidden')) {
      this.renderPostGameDashboard(this.state.snapshot, true);
    }
    this.renderLobbyPhonePreviews();
    this.refreshControllerSideBadge();
  }

  handleThemeSelection(themeMode) {
    const normalized = normalizeThemeMode(themeMode);
    if (normalized === this.state.themeMode) return;
    this.applyThemeMode(normalized, {
      persist: true,
      requestServer: Boolean(this.state.roomId),
      updateRoom: true,
      rerenderHud: true,
    });
    if (!this.state.roomId && this.menuMsg) {
      this.menuMsg.textContent = `Theme set to ${normalized === THEME_MODE_THEMED ? 'Bread vs Rice' : 'classic West vs East'}.`;
    }
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
    const baseName = defaultArcherName(entry.side, entry.slot, this.state.themeMode);
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

    if (this.lobbyLeftPhonesTitle) this.lobbyLeftPhonesTitle.textContent = `${sideShortName('left', this.state.themeMode)} Controllers ${leftCount}/${archersPerSide}`;
    if (this.lobbyRightPhonesTitle) this.lobbyRightPhonesTitle.textContent = `${sideShortName('right', this.state.themeMode)} Controllers ${rightCount}/${archersPerSide}`;

    for (const entry of this.lobbyPhoneSlots) {
      this.renderLobbyPhoneSlot(entry, source, archersPerSide);
    }
  }

  formatPostTime(sec = 0) {
    const whole = Math.max(0, Math.round(Number(sec) || 0));
    const mins = Math.floor(whole / 60);
    const rem = whole % 60;
    return `${mins}:${String(rem).padStart(2, '0')}`;
  }

  luckPercent(luck = {}) {
    const attempts = Math.max(0, Number(luck?.attempts) || 0);
    const expected = Math.max(0, Number(luck?.expectedSuccess) || 0);
    const actual = Math.max(0, Number(luck?.actualSuccess) || 0);
    if (attempts <= 0) return null;
    if (expected <= 1e-6) return 100;
    return Math.max(0, (actual / expected) * 100);
  }

  numberCompact(value, digits = 0) {
    const n = Number(value) || 0;
    if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toFixed(digits);
  }

  postCanvasContext(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width || canvas.width || 320));
    const height = Math.max(160, Math.round(rect.height || canvas.height || 180));
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const targetW = Math.max(1, Math.round(width * dpr));
    const targetH = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    return { ctx, width, height };
  }

  drawPostChartGrid(ctx, left, top, width, height, ySteps = 4, xSteps = 6) {
    ctx.save();
    const bg = ctx.createLinearGradient(0, top, 0, top + height);
    bg.addColorStop(0, 'rgba(18, 36, 60, 0.66)');
    bg.addColorStop(1, 'rgba(8, 16, 30, 0.86)');
    ctx.fillStyle = bg;
    ctx.fillRect(left, top, width, height);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(150, 180, 220, 0.16)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= ySteps; i += 1) {
      const y = top + (i / ySteps) * height;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + width, y);
      ctx.stroke();
    }
    for (let i = 0; i <= xSteps; i += 1) {
      const x = left + (i / xSteps) * width;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + height);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(190, 214, 245, 0.24)';
    ctx.strokeRect(left + 0.5, top + 0.5, Math.max(0, width - 1), Math.max(0, height - 1));
    ctx.restore();
  }

  drawSeriesLines(ctx, points, chartRect, series, maxY, xMax, options = {}) {
    if (!Array.isArray(points) || !points.length || !Array.isArray(series) || !series.length) return;
    const {
      areaFill = false,
      glow = true,
      lineWidth = 2.4,
      showLastDot = false,
    } = options;
    const maxSafe = Math.max(1e-6, Number(maxY) || 1);
    const maxX = Math.max(1e-6, Number(xMax) || 1);
    for (const line of series) {
      const coords = points.map((point) => {
        const xVal = Math.max(0, Number(point.t) || 0);
        const yVal = Math.max(0, Number(point[line.key]) || 0);
        return {
          px: chartRect.x + (xVal / maxX) * chartRect.w,
          py: chartRect.y + chartRect.h - (yVal / maxSafe) * chartRect.h,
        };
      });
      if (coords.length < 2) continue;

      if (areaFill) {
        ctx.save();
        const grad = ctx.createLinearGradient(0, chartRect.y, 0, chartRect.y + chartRect.h);
        grad.addColorStop(0, colorWithAlpha(line.color, 0.22));
        grad.addColorStop(1, colorWithAlpha(line.color, 0.02));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(coords[0].px, chartRect.y + chartRect.h);
        ctx.lineTo(coords[0].px, coords[0].py);
        for (let i = 1; i < coords.length; i += 1) {
          const prev = coords[i - 1];
          const cur = coords[i];
          const cx = (prev.px + cur.px) * 0.5;
          ctx.quadraticCurveTo(prev.px, prev.py, cx, (prev.py + cur.py) * 0.5);
        }
        const last = coords[coords.length - 1];
        ctx.lineTo(last.px, chartRect.y + chartRect.h);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = lineWidth;
      if (glow) {
        ctx.shadowColor = colorWithAlpha(line.color, 0.28);
        ctx.shadowBlur = 9;
      }
      ctx.beginPath();
      ctx.moveTo(coords[0].px, coords[0].py);
      for (let i = 1; i < coords.length; i += 1) {
        const prev = coords[i - 1];
        const cur = coords[i];
        const cx = (prev.px + cur.px) * 0.5;
        ctx.quadraticCurveTo(prev.px, prev.py, cx, (prev.py + cur.py) * 0.5);
      }
      const last = coords[coords.length - 1];
      ctx.lineTo(last.px, last.py);
      ctx.stroke();
      ctx.restore();

      if (showLastDot) {
        const last = coords[coords.length - 1];
        ctx.save();
        ctx.fillStyle = line.color;
        ctx.beginPath();
        ctx.arc(last.px, last.py, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  getPostGameReport(snapshot) {
    if (snapshot?.postGameReport && typeof snapshot.postGameReport === 'object') return snapshot.postGameReport;
    const durationSec = Math.max(0, Number(snapshot?.t) || 0);
    const leftTower = Math.max(0, Number(snapshot?.left?.towerHp) || 0);
    const rightTower = Math.max(0, Number(snapshot?.right?.towerHp) || 0);
    return {
      durationSec,
      timeline: [
        {
          t: 0,
          leftGold: 0,
          rightGold: 0,
          leftGoldEarned: 0,
          rightGoldEarned: 0,
          leftTowerHp: 6000,
          rightTowerHp: 6000,
          leftUpgradeScore: 0,
          rightUpgradeScore: 0,
          leftArrowHits: 0,
          rightArrowHits: 0,
          leftArrowsFired: 0,
          rightArrowsFired: 0,
        },
        {
          t: durationSec,
          leftGold: Number(snapshot?.left?.gold) || 0,
          rightGold: Number(snapshot?.right?.gold) || 0,
          leftGoldEarned: Number(snapshot?.left?.goldEarnedTotal) || Number(snapshot?.left?.gold) || 0,
          rightGoldEarned: Number(snapshot?.right?.goldEarnedTotal) || Number(snapshot?.right?.gold) || 0,
          leftTowerHp: leftTower,
          rightTowerHp: rightTower,
          leftUpgradeScore: 0,
          rightUpgradeScore: 0,
          leftArrowHits: Number(snapshot?.left?.arrowHits) || 0,
          rightArrowHits: Number(snapshot?.right?.arrowHits) || 0,
          leftArrowsFired: Number(snapshot?.left?.arrowsFired) || 0,
          rightArrowsFired: Number(snapshot?.right?.arrowsFired) || 0,
        },
      ],
      upgrades: [],
      totals: {
        left: {
          arrowDamage: 0,
          unitDamage: 0,
          towerDamageDealt: Math.max(0, 6000 - rightTower),
          towerDamageTaken: Math.max(0, 6000 - leftTower),
          minionKills: 0,
        },
        right: {
          arrowDamage: 0,
          unitDamage: 0,
          towerDamageDealt: Math.max(0, 6000 - leftTower),
          towerDamageTaken: Math.max(0, 6000 - rightTower),
          minionKills: 0,
        },
      },
      luck: {
        left: { attempts: 0, expectedSuccess: 0, actualSuccess: 0, variance: 0, zScore: 0, events: [] },
        right: { attempts: 0, expectedSuccess: 0, actualSuccess: 0, variance: 0, zScore: 0, events: [] },
      },
    };
  }

  renderPostSummary(snapshot, report) {
    if (!this.postSummaryGrid) return;
    const leftAcc = arrowAccuracy(snapshot.left);
    const rightAcc = arrowAccuracy(snapshot.right);
    const leftTotals = report?.totals?.left || {};
    const rightTotals = report?.totals?.right || {};
    const leftLuck = report?.luck?.left || {};
    const rightLuck = report?.luck?.right || {};
    const leftLuckPct = this.luckPercent(leftLuck);
    const rightLuckPct = this.luckPercent(rightLuck);
    const leftLuckText = Number.isFinite(leftLuckPct) ? `${leftLuckPct.toFixed(0)}%` : 'N/A';
    const rightLuckText = Number.isFinite(rightLuckPct) ? `${rightLuckPct.toFixed(0)}%` : 'N/A';
    const leftLuckValue = Number.isFinite(leftLuckPct) ? leftLuckPct : 100;
    const rightLuckValue = Number.isFinite(rightLuckPct) ? rightLuckPct : 100;
    const luckTotal = Math.max(1e-6, leftLuckValue + rightLuckValue);
    const luckLeftFill = Math.max(0, Math.min(100, (leftLuckValue / luckTotal) * 100));
    const luckRightFill = Math.max(0, Math.min(100, (rightLuckValue / luckTotal) * 100));
    const leftLuckOnTop = luckLeftFill >= luckRightFill;
    const leftTotalDamage = (Number(leftTotals.arrowDamage) || 0) + (Number(leftTotals.unitDamage) || 0) + (Number(leftTotals.towerDamageDealt) || 0);
    const rightTotalDamage = (Number(rightTotals.arrowDamage) || 0) + (Number(rightTotals.unitDamage) || 0) + (Number(rightTotals.towerDamageDealt) || 0);
    const winner = sideVictoryLabel(snapshot?.winner, this.state.themeMode);
    const cards = [
      { title: 'Duration', value: this.formatPostTime(report?.durationSec || snapshot?.t || 0) },
      { title: 'Winner', value: winner },
      { title: 'Accuracy', value: `<span class="team-west">${leftAcc.rate}%</span> <span class="team-sep">vs</span> <span class="team-east">${rightAcc.rate}%</span>` },
      { title: 'Tower Damage', value: `<span class="team-west">${this.numberCompact(leftTotals.towerDamageDealt, 0)}</span> <span class="team-sep">vs</span> <span class="team-east">${this.numberCompact(rightTotals.towerDamageDealt, 0)}</span>` },
      { title: 'Total Damage', value: `<span class="team-west">${this.numberCompact(leftTotalDamage, 0)}</span> <span class="team-sep">vs</span> <span class="team-east">${this.numberCompact(rightTotalDamage, 0)}</span>` },
      { title: 'Minion Kills', value: `<span class="team-west">${this.numberCompact(leftTotals.minionKills, 0)}</span> <span class="team-sep">vs</span> <span class="team-east">${this.numberCompact(rightTotals.minionKills, 0)}</span>` },
      {
        title: 'Luck % (Higher Better)',
        value: `<span class="team-west">${leftLuckText}</span> <span class="team-sep">vs</span> <span class="team-east">${rightLuckText}</span>`,
        bar: `
          <div class="post-stat-mini-track" role="img" aria-label="Luck percent comparison">
            <div class="post-stat-mini-mid"></div>
            <span class="post-stat-mini-west" style="width:${luckLeftFill}%; z-index:${leftLuckOnTop ? 2 : 1}"></span>
            <span class="post-stat-mini-east" style="width:${luckRightFill}%; z-index:${leftLuckOnTop ? 1 : 2}"></span>
          </div>
        `,
      },
    ];
    this.postSummaryGrid.innerHTML = cards.map((card) => `
      <article class="post-stat-card">
        <p class="post-stat-title">${card.title}</p>
        <p class="post-stat-value">${card.value}</p>
        ${card.bar ? `<div class="post-stat-bar-wrap">${card.bar}</div>` : ''}
      </article>
    `).join('');
    this.renderPostCompareRows(snapshot, report);
  }

  renderPostCompareRows(snapshot, report) {
    if (!this.postCompareRows) return;
    const leftTotals = report?.totals?.left || {};
    const rightTotals = report?.totals?.right || {};
    const leftAcc = arrowAccuracy(snapshot.left);
    const rightAcc = arrowAccuracy(snapshot.right);
    const rows = [
      {
        title: 'Arrow Damage',
        leftLabel: sideShortName('left', this.state.themeMode),
        rightLabel: sideShortName('right', this.state.themeMode),
        leftValue: Math.max(0, Number(leftTotals.arrowDamage) || 0),
        rightValue: Math.max(0, Number(rightTotals.arrowDamage) || 0),
        format: (v) => this.numberCompact(v, 0),
      },
      {
        title: 'Unit Damage',
        leftLabel: sideShortName('left', this.state.themeMode),
        rightLabel: sideShortName('right', this.state.themeMode),
        leftValue: Math.max(0, Number(leftTotals.unitDamage) || 0),
        rightValue: Math.max(0, Number(rightTotals.unitDamage) || 0),
        format: (v) => this.numberCompact(v, 0),
      },
      {
        title: 'Accuracy',
        leftLabel: sideShortName('left', this.state.themeMode),
        rightLabel: sideShortName('right', this.state.themeMode),
        leftValue: Math.max(0, Number(leftAcc.rate) || 0),
        rightValue: Math.max(0, Number(rightAcc.rate) || 0),
        format: (v) => `${Math.round(v)}%`,
      },
    ];
    this.postCompareRows.innerHTML = rows.map((row) => {
      const total = Math.max(1e-6, row.leftValue + row.rightValue);
      const leftPct = Math.max(0, Math.min(100, (row.leftValue / total) * 100));
      const rightPct = Math.max(0, Math.min(100, (row.rightValue / total) * 100));
      const leftOnTop = leftPct >= rightPct;
      return `
        <article class="post-compare-row">
          <div class="post-compare-top">
            <p class="post-compare-title">${row.title}</p>
            <p class="post-compare-values">
              <span class="post-compare-west">${row.leftLabel} ${row.format(row.leftValue)}</span>
              <span class="post-compare-east">${row.rightLabel} ${row.format(row.rightValue)}</span>
            </p>
          </div>
          <div class="post-tug-track" role="img" aria-label="${row.title} comparison">
            <div class="post-tug-mid"></div>
            <span class="post-tug-west" style="width:${leftPct}%; z-index:${leftOnTop ? 2 : 1}"></span>
            <span class="post-tug-east" style="width:${rightPct}%; z-index:${leftOnTop ? 1 : 2}"></span>
          </div>
        </article>
      `;
    }).join('');
  }

  renderPostUpgradeFeed(report) {
    if (!this.postUpgradeTimeline) return;
    const upgrades = compactUpgradeFeedEvents(report?.upgrades);
    if (!upgrades.length) {
      this.postUpgradeFeedEvents = [];
      this.postUpgradeTimeline.innerHTML = '<p class="sub">No upgrade activations captured.</p>';
      return;
    }
    this.postUpgradeTimeline.innerHTML = upgrades.map((event) => {
      const code = POST_UPGRADE_CODES[event.type] || 'UP';
      const icon = POST_UPGRADE_ICONS[event.type] || '⬆️';
      const level = Math.max(0, Number(event.level) || 0);
      const priorLevel = Math.max(0, level - 1);
      const label = upgradeLabelForLevel(event.type, priorLevel);
      const side = sideShortName(event.side, this.state.themeMode);
      const sideLong = sideDisplayName(event.side, this.state.themeMode);
      const sideColor = event.side === 'right' ? '#ffb4b4' : '#a9d7ff';
      const sideClass = event.side === 'right' ? 'side-east' : 'side-west';
      const eventTimeText = this.formatPostTime(event.t || 0);
      const eventTime = Math.max(0, Number(event.t) || 0).toFixed(2);
      const title = `${sideLong} ${label} (Level ${level}) at ${eventTimeText}`;
      const safeTitle = escapeHtml(title);
      const safeIcon = escapeHtml(icon);
      const safeSide = escapeHtml(side);
      const safeLabel = escapeHtml(label);
      const safeCode = escapeHtml(code);
      const safeEventTimeText = escapeHtml(eventTimeText);
      return `
        <article class="post-upgrade-item ${sideClass}" data-event-time="${eventTime}" title="${safeTitle}">
          <span class="post-upgrade-icon" style="color:${sideColor}">${safeIcon}</span>
          <span class="post-upgrade-label"><span class="post-upgrade-side">${safeSide}</span> ${safeLabel} Lv ${level}</span>
          <span class="post-upgrade-time">${safeCode} ${safeEventTimeText}</span>
        </article>
      `;
    }).join('');
    this.postUpgradeFeedEvents = Array.from(this.postUpgradeTimeline.querySelectorAll('.post-upgrade-item')).map((el) => ({
      t: Math.max(0, Number(el.dataset.eventTime) || 0),
      el,
    }));
  }

  handlePostChartHover(event) {
    if (this.isController || !this.postEconChart) return;
    if (!this.postUpgradeTimeline || !this.postUpgradeFeedEvents.length) return;
    const rect = this.postEconChart.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = clamp01((event.clientX - rect.left) / rect.width);
    this.postUpgradeScrubRatio = ratio;
    if (this.postUpgradeScrubRaf) return;
    this.postUpgradeScrubRaf = requestAnimationFrame(() => {
      this.postUpgradeScrubRaf = 0;
      this.scrubUpgradeFeedToRatio(this.postUpgradeScrubRatio);
    });
  }

  scrubUpgradeFeedToRatio(ratio = 0) {
    if (!this.postUpgradeTimeline || !this.postUpgradeFeedEvents.length) return;
    const timeline = Array.isArray(this.postGameReportData?.timeline) ? this.postGameReportData.timeline : [];
    const maxT = Math.max(
      1,
      Number(this.postGameReportData?.durationSec) || 0,
      Number(timeline.length ? timeline[timeline.length - 1]?.t : 0) || 0
    );
    const targetT = clamp01(ratio) * maxT;
    let nearest = this.postUpgradeFeedEvents[0];
    for (let i = 1; i < this.postUpgradeFeedEvents.length; i += 1) {
      const event = this.postUpgradeFeedEvents[i];
      if (Math.abs(event.t - targetT) < Math.abs(nearest.t - targetT)) nearest = event;
    }
    const container = this.postUpgradeTimeline;
    const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
    const targetTop = Math.max(
      0,
      Math.min(
        maxScroll,
        nearest.el.offsetTop - (container.clientHeight - nearest.el.offsetHeight) * 0.42
      )
    );
    container.scrollTop += (targetTop - container.scrollTop) * 0.4;
  }

  drawPostEconChart(report) {
    const canvasInfo = this.postCanvasContext(this.postEconChart);
    if (!canvasInfo) return;
    const { ctx, width, height } = canvasInfo;
    const points = Array.isArray(report?.timeline) ? report.timeline : [];
    if (!points.length) {
      ctx.fillStyle = '#b7c9e8';
      ctx.font = '14px sans-serif';
      ctx.fillText('No timeline data captured.', 12, 22);
      return;
    }
    const pad = { l: 46, r: 14, t: 12, b: 28 };
    const chart = { x: pad.l, y: pad.t, w: width - pad.l - pad.r, h: height - pad.t - pad.b };
    const maxT = Math.max(1, Number(points[points.length - 1]?.t) || 1);
    const hasCumulative = points.some((point) => Number(point?.leftGoldEarned) > 0 || Number(point?.rightGoldEarned) > 0);
    const leftGoldKey = hasCumulative ? 'leftGoldEarned' : 'leftGold';
    const rightGoldKey = hasCumulative ? 'rightGoldEarned' : 'rightGold';
    const maxGold = Math.max(
      1,
      ...points.map((point) => Math.max(0, Number(point[leftGoldKey]) || 0, Number(point[rightGoldKey]) || 0))
    );
    this.drawPostChartGrid(ctx, chart.x, chart.y, chart.w, chart.h, 4, 6);
    this.drawSeriesLines(
      ctx,
      points,
      chart,
      [
        { key: leftGoldKey, color: '#72c9ff' },
        { key: rightGoldKey, color: '#ff9196' },
      ],
      maxGold,
      maxT,
      { areaFill: true, glow: true, lineWidth: 2.6, showLastDot: true }
    );

    const upgrades = Array.isArray(report?.upgrades) ? report.upgrades : [];
    let pointCursor = 0;
    for (let i = 0; i < upgrades.length; i += 1) {
      const event = upgrades[i];
      const eventT = Math.max(0, Number(event.t) || 0);
      const px = chart.x + (eventT / maxT) * chart.w;
      while (pointCursor + 1 < points.length && (Number(points[pointCursor + 1]?.t) || 0) <= eventT) {
        pointCursor += 1;
      }
      let matchingPoint = points[pointCursor] || null;
      if (pointCursor + 1 < points.length) {
        const nextPoint = points[pointCursor + 1];
        const currentDt = Math.abs((Number(matchingPoint?.t) || 0) - eventT);
        const nextDt = Math.abs((Number(nextPoint?.t) || 0) - eventT);
        if (nextDt < currentDt) matchingPoint = nextPoint;
      }
      if (Math.abs((Number(matchingPoint?.t) || 0) - eventT) > 0.55) matchingPoint = null;
      const yVal = event.side === 'right'
        ? Number(matchingPoint?.[rightGoldKey]) || 0
        : Number(matchingPoint?.[leftGoldKey]) || 0;
      const pyBase = chart.y + chart.h - (Math.max(0, yVal) / maxGold) * chart.h;
      const py = Math.max(chart.y + 14, Math.min(chart.y + chart.h - 10, pyBase - 12 - (i % 2) * 10));
      const color = event.side === 'right' ? '#ff9ba2' : '#8dd0ff';
      const code = POST_UPGRADE_CODES[event.type] || 'UP';
      const icon = POST_UPGRADE_ICONS[event.type] || '⬆️';
      ctx.strokeStyle = colorWithAlpha(color, 0.95);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 8.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#07101d';
      ctx.font = '11px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(icon, px, py + 3.5);
      ctx.fillStyle = colorWithAlpha(color, 0.88);
      ctx.font = '9px monospace';
      ctx.fillText(code, px, py - 10);
    }

    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(191, 210, 240, 0.86)';
    ctx.font = '10px sans-serif';
    for (let i = 0; i <= 4; i += 1) {
      const y = chart.y + (i / 4) * chart.h;
      const value = Math.round(maxGold * (1 - i / 4));
      ctx.fillText(this.numberCompact(value, 0), chart.x - 6, y + 3);
    }
    ctx.restore();

    ctx.save();
    const legend = [
      {
        label: hasCumulative
          ? `${sideShortName('left', this.state.themeMode)} Cumulative Gold`
          : `${sideShortName('left', this.state.themeMode)} Gold`,
        color: '#72c9ff',
      },
      {
        label: hasCumulative
          ? `${sideShortName('right', this.state.themeMode)} Cumulative Gold`
          : `${sideShortName('right', this.state.themeMode)} Gold`,
        color: '#ff9196',
      },
    ];
    let lx = chart.x + 8;
    const ly = chart.y + 8;
    ctx.font = '10px sans-serif';
    for (const item of legend) {
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, ly, 10, 10);
      ctx.fillStyle = 'rgba(225, 237, 255, 0.9)';
      ctx.fillText(item.label, lx + 14, ly + 9);
      lx += ctx.measureText(item.label).width + 30;
    }
    ctx.restore();

    ctx.fillStyle = '#bcd2f2';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(hasCumulative ? 'Cumulative Gold Earned' : 'Gold', chart.x, chart.y - 2);
    ctx.textAlign = 'right';
    ctx.fillText(`Max ${Math.round(maxGold)}`, chart.x + chart.w, chart.y - 2);
    ctx.textAlign = 'left';
    ctx.fillText('0:00', chart.x, chart.y + chart.h + 16);
    ctx.textAlign = 'right';
    ctx.fillText(this.formatPostTime(maxT), chart.x + chart.w, chart.y + chart.h + 16);
  }

  renderPostGameCharts(report) {
    this.drawPostEconChart(report);
  }

  renderPostGameDashboard(snapshot, force = false) {
    if (!snapshot) return;
    const report = this.getPostGameReport(snapshot);
    const reportKey = [
      snapshot?.winner || 'none',
      Math.round((Number(report?.durationSec) || 0) * 10),
      Array.isArray(report?.timeline) ? report.timeline.length : 0,
      Array.isArray(report?.upgrades) ? report.upgrades.length : 0,
    ].join('|');
    if (!force && this.postGameRenderedKey === reportKey) return;
    this.postGameRenderedKey = reportKey;
    this.postGameReportData = report;

    const winnerLabel = sideVictoryLabel(snapshot.winner, this.state.themeMode);
    const punTitle = postGamePunTitle(snapshot.winner, this.state.themeMode, reportKey);
    if (this.postGameTitle) {
      this.postGameTitle.textContent = punTitle || `${winnerLabel} Victory Report`;
      this.postGameTitle.classList.remove('team-west', 'team-east');
      if (snapshot.winner === 'left') this.postGameTitle.classList.add('team-west');
      else if (snapshot.winner === 'right') this.postGameTitle.classList.add('team-east');
    }
    if (this.postGameStats) {
      const leftAcc = arrowAccuracy(snapshot.left);
      const rightAcc = arrowAccuracy(snapshot.right);
      this.postGameStats.innerHTML = `<span class="team-west">${sideDisplayName('left', this.state.themeMode)} Accuracy: ${leftAcc.rate}% (${leftAcc.hits} hits / ${leftAcc.fired} arrows)</span> <span class="team-sep">|</span> <span class="team-east">${sideDisplayName('right', this.state.themeMode)} Accuracy: ${rightAcc.rate}% (${rightAcc.hits} hits / ${rightAcc.fired} arrows)</span>`;
    }
    if (this.postGameExplain) this.postGameExplain.textContent = 'Top stats include color-coded luck % (100% is expected luck). Chart below shows economy with upgrade spikes.';

    this.renderPostSummary(snapshot, report);
    this.renderPostUpgradeFeed(report);
    this.renderPostGameCharts(report);
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
      balloonLevel: 0,
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
      startingGold: null,
      colliderDebug: false,
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
      startingGold: null,
      colliderDebug: Boolean(cfg.colliderDebug),
      upgrades: {},
    };
    const startingGoldRaw = cfg.startingGold;
    if (startingGoldRaw !== '' && startingGoldRaw != null) {
      const startingGoldNum = Number(startingGoldRaw);
      if (Number.isFinite(startingGoldNum)) normalized.startingGold = Math.floor(startingGoldNum);
    }
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
    if (this.testStartingGoldInput) this.testStartingGoldInput.value = Number.isFinite(cfg.startingGold) ? String(cfg.startingGold) : '';
    if (this.testColliderDebugInput) this.testColliderDebugInput.checked = Boolean(cfg.colliderDebug);
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
      startingGold: this.testStartingGoldInput?.value ?? '',
      colliderDebug: Boolean(this.testColliderDebugInput?.checked),
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
    const goldLabel = Number.isFinite(cfg.startingGold) ? `Start UPG ${cfg.startingGold}` : 'Start UPG unchanged';
    const colliderLabel = cfg.colliderDebug ? 'Colliders ON' : 'Colliders OFF';
    this.testQuickSummary.textContent = `${testState} | ${liveState} | ${forceLabel} | ${goldLabel} | ${colliderLabel} | Upgrades ON: ${enabledCount}/${TEST_SPECIAL_UPGRADE_KEYS.length}`;
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
      this.testStartingGoldInput,
      this.testColliderDebugInput,
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

  resetControllerRematchState() {
    this.controllerRematch = {
      gameOver: false,
      requested: false,
      votes: 0,
      totalConnected: 0,
      requiredPlayers: Number(this.state.mode === '2v2' ? 4 : 2),
      missingPlayers: 0,
      immediateRematchReady: false,
    };
  }

  updateControllerRematchFromPayload(payload = {}) {
    const rematch = payload?.rematch || {};
    const requiredPlayers = Math.max(
      2,
      Number(rematch.requiredPlayers)
      || Number(payload.requiredPlayers)
      || Number(this.state.mode === '2v2' ? 4 : 2)
    );
    const connected = Math.max(0, Number(rematch.totalConnected) || Number(payload.playerCount) || 0);
    this.controllerRematch = {
      gameOver: Boolean(payload?.gameOver),
      requested: Boolean(rematch.requested),
      votes: Math.max(0, Number(rematch.votes) || 0),
      totalConnected: connected,
      requiredPlayers,
      missingPlayers: Math.max(0, Number(rematch.missingPlayers) || (requiredPlayers - connected)),
      immediateRematchReady: Boolean(rematch.immediateRematchReady),
    };
  }

  renderControllerRematchUi() {
    if (!this.isController || !this.controllerRematchPanel) return;
    const showPanel = Boolean(this.state.roomId && this.controllerRematch?.gameOver);
    this.controllerRematchPanel.classList.toggle('hidden', !showPanel);
    if (!showPanel) return;
    const requested = Boolean(this.controllerRematch?.requested);
    const votes = Math.max(0, Number(this.controllerRematch?.votes) || 0);
    const connected = Math.max(0, Number(this.controllerRematch?.totalConnected) || 0);
    const missingPlayers = Math.max(0, Number(this.controllerRematch?.missingPlayers) || 0);
    const immediateReady = Boolean(this.controllerRematch?.immediateRematchReady);

    if (this.controllerRematchBtn) {
      this.controllerRematchBtn.disabled = !this.state.roomId;
      this.controllerRematchBtn.classList.toggle('active', requested);
      this.controllerRematchBtn.textContent = requested ? 'Cancel Rematch Request' : 'Request Rematch';
    }
    if (this.controllerRematchStatus) {
      let statusText = `Rematch votes: ${votes}/${connected} connected controllers.`;
      if (missingPlayers > 0) {
        const noun = missingPlayers === 1 ? 'player' : 'players';
        statusText += ` ${missingPlayers} more ${noun} needed before next round starts.`;
      } else if (immediateReady) {
        statusText += ' Full lobby is present, so rematch can start immediately.';
      } else {
        statusText += ' Waiting for all currently connected controllers to vote.';
      }
      if (requested) statusText += ' You voted yes.';
      this.controllerRematchStatus.textContent = statusText;
    }
  }

  handleControllerState(snapshot) {
    if (!this.state.side) return;
    if (snapshot?.themeMode) {
      this.applyThemeMode(snapshot.themeMode, {
        persist: true,
        requestServer: false,
        updateRoom: false,
        rerenderHud: false,
      });
    }
    this.updateControllerRematchFromPayload(snapshot);

    const me = snapshot[this.state.side];
    const laneText = snapshot.mode === '2v2' ? ` | Archer ${this.state.slot + 1}` : '';
    this.controllerMsg.textContent = `${sideLabel(this.state.side, this.state.themeMode)}${laneText} | HP ${Math.floor(me.towerHp)} | Next ${me.shotCd.toFixed(2)}s | Power ${powerStatus(me.pendingShotPower, me.pendingShotPowerShots)} | Hit ${arrowHitRate(me)}% (${me.arrowHits || 0}) | Combo ${comboStatus(me)}`;

    if (snapshot.gameOver) {
      const myAcc = arrowAccuracy(snapshot[this.state.side]);
      const enemySide = this.state.side === 'left' ? 'right' : 'left';
      const enemyAcc = arrowAccuracy(snapshot[enemySide]);
      const outcome = snapshot.winner === this.state.side ? 'Victory' : 'Defeat';
      this.controllerMsg.textContent = `${outcome} | Your Arrow Accuracy ${myAcc.rate}% (${myAcc.hits} hits / ${myAcc.fired} fired) | Enemy Arrow Accuracy ${enemyAcc.rate}% (${enemyAcc.hits} hits / ${enemyAcc.fired} fired) | Vote for rematch below`;
    }
    this.setControllerMode(true);
    this.renderControllerRematchUi();
    this.pullPad.draw();
  }

  handleControllerCompactState(payload) {
    if (!payload || typeof payload !== 'object') return;
    if (!this.state.side && payload.side !== 'left' && payload.side !== 'right') return;

    if (payload.side === 'left' || payload.side === 'right') {
      if (payload.side !== this.state.side) {
        this.state.side = payload.side;
        this.pullPad.setSide(payload.side);
      }
    }
    if (Number.isFinite(payload.slot)) this.state.slot = Math.max(0, Number(payload.slot) || 0);
    this.refreshControllerSideBadge();

    if (payload.themeMode) {
      this.applyThemeMode(payload.themeMode, {
        persist: true,
        requestServer: false,
        updateRoom: false,
        rerenderHud: false,
      });
    }

    if (payload.mode === '2v2' || payload.mode === '1v1') {
      this.state.mode = payload.mode;
    }
    const laneText = this.state.mode === '2v2' ? ` | Archer ${this.state.slot + 1}` : '';
    const me = payload.me || {};
    const enemy = payload.enemy || {};
    const requiredPlayers = Number(payload.requiredPlayers) || (this.state.mode === '2v2' ? 4 : 2);
    const playerCount = Number(payload.playerCount) || 0;
    this.updateControllerRematchFromPayload(payload);

    if (!payload.started && !payload.gameOver) {
      this.controllerMsg.textContent = `${sideLabel(this.state.side, this.state.themeMode)}${laneText} | Waiting for players ${playerCount}/${requiredPlayers}`;
      this.setControllerMode(true);
      this.renderControllerRematchUi();
      this.pullPad.draw();
      return;
    }

    this.controllerMsg.textContent = `${sideLabel(this.state.side, this.state.themeMode)}${laneText} | HP ${Math.floor(Number(me.towerHp) || 0)} | Next ${(Number(me.shotCd) || 0).toFixed(2)}s | Power ${powerStatus(me.pendingShotPower, me.pendingShotPowerShots)} | Hit ${arrowHitRate(me)}% (${me.arrowHits || 0}) | Combo ${comboStatus(me)}`;

    if (payload.gameOver) {
      const myAcc = arrowAccuracy(me);
      const enemyAcc = arrowAccuracy(enemy);
      const outcome = payload.winner === this.state.side ? 'Victory' : 'Defeat';
      this.controllerMsg.textContent = `${outcome} | Your Arrow Accuracy ${myAcc.rate}% (${myAcc.hits} hits / ${myAcc.fired} fired) | Enemy Arrow Accuracy ${enemyAcc.rate}% (${enemyAcc.hits} hits / ${enemyAcc.fired} fired) | Vote for rematch below`;
    }

    this.setControllerMode(true);
    this.renderControllerRematchUi();
    this.pullPad.draw();
  }

  setPostGamePanel(visible, snapshot = null) {
    if (!this.postGamePanel || this.isController) return;
    const canShow = Boolean(
      visible
      && snapshot?.gameOver
      && this.displayMode === 'game'
      && (snapshot?.started || this.gameOverLatched)
    );
    const wasHidden = this.postGamePanel.classList.contains('hidden');
    this.postGamePanel.classList.toggle('hidden', !canShow);
    if (!canShow || !snapshot) {
      this.postGameReportData = null;
      this.postGameRenderedKey = null;
      this.postGamePreviewDataUrl = '';
      if (this.postGamePreview) this.postGamePreview.removeAttribute('src');
      if (this.restartMsg) this.restartMsg.textContent = '';
      return;
    }
    if (wasHidden || !this.postGamePreviewDataUrl) this.capturePostGamePreview();
    this.renderPostGameDashboard(snapshot, wasHidden);
  }

  capturePostGamePreview() {
    if (!this.postGamePreview || !this.canvas) return;
    try {
      const imageData = this.canvas.toDataURL('image/jpeg', 0.74);
      if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
        this.postGamePreviewDataUrl = imageData;
        this.postGamePreview.src = imageData;
        return;
      }
    } catch {
      // Ignore preview capture failures; panel still works without thumbnail.
    }
    this.postGamePreviewDataUrl = '';
    this.postGamePreview.removeAttribute('src');
  }

  resetGameOverPresentation() {
    this.gameOverLatched = false;
    this.gameOverLatchedAtMs = 0;
    this.gameOverRevealAtMs = 0;
    this.nextGameOverBoomAtMs = 0;
    this.postGameReportData = null;
    this.postGameRenderedKey = null;
    this.postGamePreviewDataUrl = '';
    if (this.postGamePreview) this.postGamePreview.removeAttribute('src');
  }

  handleDisplayState(snapshot) {
    if (snapshot?.themeMode) {
      this.applyThemeMode(snapshot.themeMode, {
        persist: true,
        requestServer: false,
        updateRoom: false,
        rerenderHud: false,
      });
    }
    const mode = snapshot.mode === '2v2' ? '2v2' : '1v1';
    this.state.mode = mode;
    const postGameActive = Boolean(snapshot.gameOver && (snapshot.started || this.gameOverLatched));
    if (this.state.createMode !== mode) this.setCreateMode(mode);
    this.updateHud(snapshot);
    if (snapshot.started || postGameActive) this.setDisplayMode('game');
    else if (this.state.roomId) {
      this.setDisplayMode('lobby');
      this.setPostGamePanel(false);
      const required = Number(snapshot.requiredPlayers) || (snapshot.mode === '2v2' ? 4 : 2);
      const count = Number(snapshot.playerCount) || 0;
      const leftCount = Array.isArray(snapshot.players?.left) ? snapshot.players.left.length : (snapshot.players?.left ? 1 : 0);
      const rightCount = Array.isArray(snapshot.players?.right) ? snapshot.players.right.length : (snapshot.players?.right ? 1 : 0);
      if (this.lobbyMsg) {
        this.lobbyMsg.textContent = `Mode ${this.state.mode.toUpperCase()} | Waiting for ${required} controllers (${count}/${required}) | ${sideShortName('left', this.state.themeMode)} ${leftCount}/${required / 2} | ${sideShortName('right', this.state.themeMode)} ${rightCount}/${required / 2}`;
      }
      this.renderLobbyPhonePreviews();
    }

    if (postGameActive) {
      const now = performance.now();
      if (!this.gameOverLatched) {
        this.gameOverLatched = true;
        this.gameOverLatchedAtMs = now;
        this.gameOverRevealAtMs = now + GAME_OVER_CINEMATIC_MS;
        this.nextGameOverBoomAtMs = now;
      }
      const revealReady = this.gameOverLatchedAtMs > 0 && (now - this.gameOverLatchedAtMs) >= GAME_OVER_CINEMATIC_MS;

      if (!this.isController && this.sound && !revealReady && now >= this.nextGameOverBoomAtMs) {
        this.sound.play('explosion');
        this.sound.play('dragonfire');
        this.nextGameOverBoomAtMs = now + 420 + Math.random() * 170;
      }

      if (!this.isController && this.centerHud && !revealReady) {
        this.centerHud.textContent = 'Tower collapsing...';
      }

      this.setPostGamePanel(revealReady, snapshot);
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
    // Keep the top HUD strip hidden during gameplay for a cleaner screen.
    this.hud.classList.add('hidden');
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
    if (!joined) this.resetControllerRematchState();
    this.refreshControllerSideBadge();
    this.renderControllerRematchUi();
    if (this.isController) this.setKeepAwake(joined);
  }

  updateHud(s) {
    if (!this.hud || this.hud.classList.contains('hidden')) return;
    const lp = Math.round(Math.max(0, Math.min(1, s.left.upgradeCharge / Math.max(1, s.left.upgradeChargeMax))) * 100);
    const rp = Math.round(Math.max(0, Math.min(1, s.right.upgradeCharge / Math.max(1, s.right.upgradeChargeMax))) * 100);
    const leftDebt = Math.max(0, Math.ceil(s.left.upgradeChargeMax - s.left.upgradeCharge));
    const rightDebt = Math.max(0, Math.ceil(s.right.upgradeChargeMax - s.right.upgradeCharge));
    const leftUpg = leftDebt > 0 ? `Debt ${leftDebt} (${lp}%)` : 'READY';
    const rightUpg = rightDebt > 0 ? `Debt ${rightDebt} (${rp}%)` : 'READY';
    const leftRoster = Array.isArray(s.players?.left)
      ? s.players.left.map((p) => p?.name).filter(Boolean).join(' + ')
      : (s.players?.left?.name || s.primaryPlayers?.left?.name || sideDisplayName('left', this.state.themeMode));
    const rightRoster = Array.isArray(s.players?.right)
      ? s.players.right.map((p) => p?.name).filter(Boolean).join(' + ')
      : (s.players?.right?.name || s.primaryPlayers?.right?.name || sideDisplayName('right', this.state.themeMode));
    this.leftHud.textContent = `${leftRoster || sideDisplayName('left', this.state.themeMode)} | HP ${Math.max(0, Math.floor(s.left.towerHp))} | Gold ${Math.floor(s.left.gold)} | Upg ${leftUpg} | Eco ${s.left.economyLevel} | KillGold x${killGoldMultiplier(s.left)} | Power ${powerStatus(s.left.pendingShotPower, s.left.pendingShotPowerShots)} | Hit ${arrowHitRate(s.left)}% (${s.left.arrowHits || 0}) | Combo ${comboStatus(s.left)}`;
    this.rightHud.textContent = `${rightRoster || sideDisplayName('right', this.state.themeMode)} | HP ${Math.max(0, Math.floor(s.right.towerHp))} | Gold ${Math.floor(s.right.gold)} | Upg ${rightUpg} | Eco ${s.right.economyLevel} | KillGold x${killGoldMultiplier(s.right)} | Power ${powerStatus(s.right.pendingShotPower, s.right.pendingShotPowerShots)} | Hit ${arrowHitRate(s.right)}% (${s.right.arrowHits || 0}) | Combo ${comboStatus(s.right)}`;
    if (s.gameOver) {
      const leftSummary = arrowAccuracySummary(sideDisplayName('left', this.state.themeMode), s.left);
      const rightSummary = arrowAccuracySummary(sideDisplayName('right', this.state.themeMode), s.right);
      const localHint = this.localKeyboardTestActive ? ' | Keyboard Mode' : '';
      this.centerHud.textContent = `Final | Winner ${sideVictoryLabel(s.winner, this.state.themeMode)}${localHint} | ${leftSummary} | ${rightSummary}`;
      return;
    }
    const localHint = this.localKeyboardTestActive ? ` | ${this.keyboardControlsLegendText()}` : '';
    this.centerHud.textContent = `Mode ${String(s.mode || '1v1').toUpperCase()}${localHint} | Next Shot: ${sideShortName('left', this.state.themeMode)} ${s.left.shotCd.toFixed(2)}s | ${sideShortName('right', this.state.themeMode)} ${s.right.shotCd.toFixed(2)}s`;
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

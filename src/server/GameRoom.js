const {
  WORLD_W,
  WORLD_H,
  TOWER_X_LEFT,
  TOWER_X_RIGHT,
  TOWER_Y,
  GROUND_Y,
  CARD_Y,
  CARD_W,
  CARD_H,
  UPGRADE_TYPES,
  SHOT_POWER_TYPES,
} = require('./constants');
const ARCHER_ORIGIN_Y = TOWER_Y - 56;
const ARCHER_VERTICAL_GAP = 78;
const SHOT_INTERVAL = 1;
const TOWER_MAX_HP = 6000;
const UPGRADE_COST_RULES = {
  arrowLevel: { base: 130, growth: 18, start: 1 },
  unitLevel: { base: 138, growth: 18, start: 1 },
  multiShotLevel: { base: 340, growth: 44, start: 1 },
  volleyLevel: { base: 190, growth: 24, start: 0 },
  spawnLevel: { base: 150, growth: 16, start: 1 },
  unitHpLevel: { base: 138, growth: 16, start: 1 },
  resourceLevel: { base: 122, growth: 14, start: 1 },
  bountyLevel: { base: 118, growth: 14, start: 1 },
  explosiveLevel: { base: 166, growth: 18, start: 1 },
  powerLevel: { base: 164, growth: 20, start: 1 },
  dragonLevel: { base: 236, growth: 26, start: 0 },
  superMinionLevel: { base: 214, growth: 24, start: 0 },
};
const UPGRADE_PATH_BY_TYPE = {
  arrowLevel: 'arrow',
  multiShotLevel: 'arrow',
  volleyLevel: 'arrow',
  unitLevel: 'unit',
  unitHpLevel: 'unit',
  spawnLevel: 'unit',
  resourceLevel: 'economy',
  bountyLevel: 'economy',
  powerLevel: 'power',
  dragonLevel: 'special',
  superMinionLevel: 'special',
};
const HERO_LINES = [
  'Justice is my cardio!',
  'Hope you brought a villain permit!',
  'My cape has plot armor!',
  'Behold my dramatic entrance!',
  'I slash, therefore I am!',
  'Fear my perfectly timed monologue!',
];
const HERO_DEATH_LINES = [
  'Tell my fans... I was fabulous!',
  'No sequel? This is a travesty!',
  'I regret... absolutely nothing!',
  'My agent said this was safe!',
  'Remember me in slow motion!',
  'This cape deserved better!',
];
const HERO_HP_MULT = 3;
const HERO_ARROW_FINISHER_HITS = 9;
const PRESIDENT_LINES = [
  'Team, we are absolutely crushing this!',
  'Believe in yourselves and swing harder!',
  'Great units do great things together!',
  'No panic, just power and discipline!',
  'We came here to win this battlefield!',
  'Stay strong, stay sharp, stay united!',
];
const CANDLE_WAX_MAX = 96;
const CANDLE_MAX_HOLDERS = 8;
const CANDLE_FAST_HOLDERS = 6;
const CANDLE_PICKUP_RANGE = 28;
const CANDLE_RECRUIT_RANGE = 210;
const CANDLE_SPAWN_OFFSET = 56;
const CANDLE_CART_HALF_W = 34;
const CANDLE_RARE_CD_MIN = 52;
const CANDLE_RARE_CD_MAX = 92;
const CANDLE_DELIVER_FUSE = 1.1;
const CANDLE_FIRE_RANGE = 250;
const CANDLE_FIRE_INTERVAL = 1.22;
const CANDLE_FIRE_SPLASH_R = 64;
const CANDLE_SCORCH_DPS_ALLY = 0.1;
const CANDLE_SCORCH_DPS_ENEMY = 1;
const ARROW_TARGET_BUCKET_W = 120;
const ARROW_TARGET_BUCKET_SCAN = 2;
const MINION_TARGET_BUCKET_W = 140;
const MINION_TARGET_RADIUS_PAD = 84;
const MAX_DAMAGE_EVENTS_PER_TICK = 240;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function mirroredX(x) {
  return WORLD_W - x;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function roundTo(value, places = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

function finiteOrNull(value, places = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

function serializeSideState(side) {
  const state = side || {};
  const archerPulls = Array.isArray(state.archerPulls) ? state.archerPulls : [];
  return {
    towerHp: roundTo(state.towerHp, 1),
    gold: roundTo(state.gold, 1),
    economyLevel: Math.max(0, Math.round(Number(state.economyLevel) || 0)),
    nextEcoCost: Math.max(0, Math.round(Number(state.nextEcoCost) || 0)),
    unitLevel: Math.max(0, Math.round(Number(state.unitLevel) || 0)),
    unitHpLevel: Math.max(0, Math.round(Number(state.unitHpLevel) || 0)),
    arrowLevel: Math.max(0, Math.round(Number(state.arrowLevel) || 0)),
    multiShotLevel: Math.max(0, Math.round(Number(state.multiShotLevel) || 0)),
    volleyLevel: Math.max(0, Math.round(Number(state.volleyLevel) || 0)),
    spawnLevel: Math.max(0, Math.round(Number(state.spawnLevel) || 0)),
    resourceLevel: Math.max(0, Math.round(Number(state.resourceLevel) || 0)),
    bountyLevel: Math.max(0, Math.round(Number(state.bountyLevel) || 0)),
    explosiveLevel: Math.max(0, Math.round(Number(state.explosiveLevel) || 0)),
    powerLevel: Math.max(0, Math.round(Number(state.powerLevel) || 0)),
    dragonLevel: Math.max(0, Math.round(Number(state.dragonLevel) || 0)),
    superMinionLevel: Math.max(0, Math.round(Number(state.superMinionLevel) || 0)),
    upgradeCharge: roundTo(state.upgradeCharge, 1),
    upgradeChargeMax: roundTo(state.upgradeChargeMax, 1),
    upgradeAutoPickAt: finiteOrNull(state.upgradeAutoPickAt, 2),
    archerAimY: roundTo(state.archerAimY, 1),
    pullX: roundTo(state.pullX, 2),
    pullY: roundTo(state.pullY, 2),
    archerPulls: archerPulls.map((pull) => ({
      pullX: roundTo(pull?.pullX, 2),
      pullY: roundTo(pull?.pullY, 2),
      archerAimY: roundTo(pull?.archerAimY, 1),
    })),
    archerVolleyIndex: Math.max(0, Math.round(Number(state.archerVolleyIndex) || 0)),
    shotCd: roundTo(state.shotCd, 2),
    pendingShotPower: state.pendingShotPower || null,
    pendingShotPowerShots: Math.max(0, Math.round(Number(state.pendingShotPowerShots) || 0)),
    arrowsFired: Math.max(0, Math.round(Number(state.arrowsFired) || 0)),
    arrowHits: Math.max(0, Math.round(Number(state.arrowHits) || 0)),
    comboHitStreak: Math.max(0, Math.round(Number(state.comboHitStreak) || 0)),
    minionCd: roundTo(state.minionCd, 2),
    spawnCount: Math.max(0, Math.round(Number(state.spawnCount) || 0)),
    candleCd: roundTo(state.candleCd, 2),
    candleActive: Boolean(state.candleActive),
    towerDamagedOnce: Boolean(state.towerDamagedOnce),
    towerHeroRescueUsed: Boolean(state.towerHeroRescueUsed),
  };
}

function launchFromPull(sideName, pullX, pullY) {
  const horizontal = Math.max(0, Math.abs(pullX));
  const vertical = Math.max(0, -pullY);
  const rawAngle = Math.atan2(vertical, horizontal || (vertical > 0 ? 0.0001 : 1));
  const angle = Math.max(0, Math.min(Math.PI / 2, rawAngle));
  const strength = Math.max(0.05, Math.min(1, Math.hypot(horizontal, vertical)));
  return { angle, strength };
}

function makeSideState(sideName = 'left', archerCount = 1) {
  const clampedCount = Math.max(1, Math.min(2, Math.floor(archerCount)));
  const basePullX = sideName === 'right' ? 0.8 : -0.8;
  const archerPulls = Array.from({ length: clampedCount }, (_, idx) => ({
    pullX: basePullX,
    pullY: 0,
    archerAimY: ARCHER_ORIGIN_Y - idx * ARCHER_VERTICAL_GAP,
  }));
  return {
    towerHp: TOWER_MAX_HP,
    gold: 0,
    economyLevel: 0,
    nextEcoCost: 120,
    unitLevel: 1,
    unitHpLevel: 1,
    arrowLevel: 1,
    multiShotLevel: 1,
    volleyLevel: 0,
    spawnLevel: 1,
    resourceLevel: 1,
    bountyLevel: 1,
    explosiveLevel: 1,
    powerLevel: 1,
    dragonLevel: 0,
    superMinionLevel: 0,
    upgradeCharge: 0,
    upgradeChargeMax: 140,
    upgradeAutoPickAt: null,
    archerAimY: archerPulls[0].archerAimY,
    pullX: archerPulls[0].pullX,
    pullY: 0,
    archerPulls,
    archerVolleyIndex: 0,
    shotCd: 1,
    pendingShotPower: null,
    pendingShotPowerShots: 0,
    arrowsFired: 0,
    arrowHits: 0,
    comboHitStreak: 0,
    minionCd: 0,
    spawnCount: 0,
    candleCd: 0,
    candleActive: false,
    towerDamagedOnce: false,
    towerHeroRescueUsed: false,
  };
}

class GameRoom {
  constructor(id, baseUrl, options = {}) {
    this.mode = options?.mode === '2v2' ? '2v2' : '1v1';
    this.archersPerSide = this.mode === '2v2' ? 2 : 1;
    const left = makeSideState('left', this.archersPerSide);
    const right = makeSideState('right', this.archersPerSide);

    this.id = id;
    this.baseUrl = baseUrl;
    this.display = null;
    this.players = { left: [], right: [] };
    this.started = false;
    this.gameOver = false;
    this.winner = null;
    this.t = 0;

    this.left = left;
    this.right = right;

    this.arrows = [];
    this.minions = [];
    this.resources = [];
    this.shotPowers = [];
    this.upgradeCards = [];
    this.sfxEvents = [];
    this.damageEvents = [];
    this.lineEvents = [];
    this.sharedShotCd = SHOT_INTERVAL;
    this.activePresidents = { left: [], right: [] };
    this.candleCarrierCounts = { left: 0, right: 0 };

    this.nextResourceAt = 5;
    this.nextShotPowerAt = 7;
    this.seq = 1;
    this.candles = {
      left: null,
      right: null,
    };
    this.candleScorches = [];
    this.left.candleCd = this.candleRareCooldown('left');
    this.right.candleCd = this.candleRareCooldown('right');
    this.left.candleActive = false;
    this.right.candleActive = false;

    this.seedUpgradeCards();
  }

  serialize() {
    const leftPlayers = this.players.left.map((p) => ({ id: p.id, name: p.name, slot: p.slot }));
    const rightPlayers = this.players.right.map((p) => ({ id: p.id, name: p.name, slot: p.slot }));
    const leftPrimary = leftPlayers[0] || null;
    const rightPrimary = rightPlayers[0] || null;
    const arrows = this.arrows.map((a) => ({
      id: a.id,
      side: a.side,
      x: roundTo(a.x, 1),
      y: roundTo(a.y, 1),
      vx: roundTo(a.vx, 1),
      vy: roundTo(a.vy, 1),
      r: roundTo(a.r, 2),
      powerType: a.powerType || null,
      mainArrow: Boolean(a.mainArrow),
      comboTier: Math.max(1, Math.round(Number(a.comboTier) || 1)),
    }));
    const minions = this.minions.map((m) => ({
      id: m.id,
      side: m.side,
      x: roundTo(m.x, 1),
      y: roundTo(m.y, 1),
      r: roundTo(m.r, 2),
      hp: roundTo(m.hp, 1),
      maxHp: roundTo(m.maxHp, 1),
      super: Boolean(m.super),
      summoned: Boolean(m.summoned),
      dragon: Boolean(m.dragon),
      flying: Boolean(m.flying),
      dragonBreathTtl: roundTo(m.dragonBreathTtl, 2),
      dragonBreathToX: finiteOrNull(m.dragonBreathToX, 1),
      dragonBreathToY: finiteOrNull(m.dragonBreathToY, 1),
      gunFlashTtl: roundTo(m.gunFlashTtl, 2),
      flyPhase: roundTo(m.flyPhase, 3),
      digPhase: roundTo(m.digPhase, 3),
      heroSwing: roundTo(m.heroSwing, 3),
      explosive: Boolean(m.explosive),
      gunner: Boolean(m.gunner),
      rider: Boolean(m.rider),
      riderChargeReady: Boolean(m.riderChargeReady),
      digger: Boolean(m.digger),
      hero: Boolean(m.hero),
      monk: Boolean(m.monk),
      monkHealScale: roundTo(m.monkHealScale, 3),
      necrominion: Boolean(m.necrominion),
      president: Boolean(m.president),
      presidentSetup: Boolean(m.presidentSetup),
      presidentAuraRadius: roundTo(m.presidentAuraRadius, 1),
      level: Math.max(0, Math.round(Number(m.level) || 0)),
      tier: Math.max(0, Math.round(Number(m.tier) || 0)),
    }));
    const candles = [this.candles.left, this.candles.right].map((candle) => (candle ? {
      id: candle.id,
      spawnSide: candle.spawnSide,
      x: roundTo(candle.x, 1),
      y: roundTo(candle.y, 1),
      wax: roundTo(candle.wax, 2),
      waxMax: roundTo(candle.waxMax, 2),
      cartHalfW: roundTo(candle.cartHalfW, 1),
      flamePulse: roundTo(candle.flamePulse, 3),
      flameBoost: roundTo(candle.flameBoost, 3),
      flameBurstTtl: roundTo(candle.flameBurstTtl, 2),
      flameBeamTtl: roundTo(candle.flameBeamTtl, 2),
      flameBeamToX: finiteOrNull(candle.flameBeamToX, 1),
      flameBeamToY: finiteOrNull(candle.flameBeamToY, 1),
      flameHitFlashTtl: roundTo(candle.flameHitFlashTtl, 2),
      respawnCd: roundTo(candle.respawnCd, 2),
      destroyed: Boolean(candle.destroyed),
    } : null));
    const candleScorches = this.candleScorches.map((scorch) => ({
      x: roundTo(scorch.x, 1),
      y: roundTo(scorch.y, 1),
      r: roundTo(scorch.r, 1),
      ttl: roundTo(scorch.ttl, 2),
      towerSide: scorch.towerSide === 'right' ? 'right' : 'left',
    }));
    const resources = this.resources.map((res) => ({
      id: res.id,
      x: roundTo(res.x, 1),
      y: roundTo(res.y, 1),
      r: roundTo(res.r, 1),
      value: Math.max(0, Math.round(Number(res.value) || 0)),
    }));
    const shotPowers = this.shotPowers.map((power) => ({
      id: power.id,
      side: power.side,
      x: roundTo(power.x, 1),
      y: roundTo(power.y, 1),
      r: roundTo(power.r, 1),
      type: power.type,
    }));
    const upgradeCards = this.upgradeCards.map((card) => ({
      id: card.id,
      side: card.side,
      type: card.type,
      x: roundTo(card.x, 1),
      y: roundTo(card.y, 1),
      w: roundTo(card.w, 1),
      h: roundTo(card.h, 1),
      cost: Math.max(1, Math.round(Number(card.cost) || 1)),
    }));

    return {
      id: this.id,
      mode: this.mode,
      archersPerSide: this.archersPerSide,
      requiredPlayers: this.requiredPlayers(),
      playerCount: this.totalPlayers(),
      started: this.started,
      gameOver: this.gameOver,
      winner: this.winner,
      t: roundTo(this.t, 2),
      world: {
        w: WORLD_W,
        h: WORLD_H,
        groundY: GROUND_Y,
        towerY: TOWER_Y,
        towerLeftX: TOWER_X_LEFT,
        towerRightX: TOWER_X_RIGHT,
      },
      left: serializeSideState(this.left),
      right: serializeSideState(this.right),
      arrows,
      minions,
      candles,
      candleScorches,
      resources,
      shotPowers,
      upgradeCards,
      players: {
        left: leftPlayers,
        right: rightPlayers,
      },
      primaryPlayers: {
        left: leftPrimary,
        right: rightPrimary,
      },
      hasDisplay: Boolean(this.display),
    };
  }

  queueHitSfx(type, x, y, side) {
    this.sfxEvents.push({ type, x, y, side });
  }

  queueDamageNumber(amount, x, y) {
    const dmg = Math.round(Number(amount) || 0);
    if (dmg <= 0) return;
    if (this.damageEvents.length >= MAX_DAMAGE_EVENTS_PER_TICK) return;
    this.damageEvents.push({ amount: dmg, x, y });
  }

  queueLine(text, x, y, side) {
    if (!text || !Number.isFinite(x) || !Number.isFinite(y)) return;
    this.lineEvents.push({ text: String(text), x, y, side });
  }

  consumeSfxEvents() {
    if (!this.sfxEvents.length) return [];
    const out = this.sfxEvents;
    this.sfxEvents = [];
    return out;
  }

  consumeDamageEvents() {
    if (!this.damageEvents.length) return [];
    const out = this.damageEvents;
    this.damageEvents = [];
    return out;
  }

  consumeLineEvents() {
    if (!this.lineEvents.length) return [];
    const out = this.lineEvents;
    this.lineEvents = [];
    return out;
  }

  attachDisplay(socketId, name) {
    this.display = { id: socketId, name: name || 'War Screen' };
  }

  resizeSideArcherControls(sideName) {
    const side = this[sideName];
    if (!side) return;
    if (!Array.isArray(side.archerPulls)) side.archerPulls = [];
    if (side.archerPulls.length > this.archersPerSide) {
      side.archerPulls = side.archerPulls.slice(0, this.archersPerSide);
    }
    while (side.archerPulls.length < this.archersPerSide) {
      const idx = side.archerPulls.length;
      side.archerPulls.push({
        pullX: sideName === 'right' ? 0.8 : -0.8,
        pullY: 0,
        archerAimY: ARCHER_ORIGIN_Y - idx * ARCHER_VERTICAL_GAP,
      });
    }
    side.archerVolleyIndex = Math.max(0, Math.floor(side.archerVolleyIndex || 0)) % this.archersPerSide;
    this.syncSidePrimaryPull(sideName);
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
    this.resizeSideArcherControls('left');
    this.resizeSideArcherControls('right');
    this.sharedShotCd = Math.min(Math.max(0, this.sharedShotCd), SHOT_INTERVAL);
    this.left.shotCd = this.sharedShotCd;
    this.right.shotCd = this.sharedShotCd;
    this.started = this.isReadyToStart();
    return { ok: true, changed: true };
  }

  restartMatch() {
    if (!this.gameOver) {
      return { ok: false, message: 'Match has not ended yet.' };
    }

    const previousPulls = {
      left: Array.isArray(this.left?.archerPulls) ? this.left.archerPulls : [],
      right: Array.isArray(this.right?.archerPulls) ? this.right.archerPulls : [],
    };

    this.left = makeSideState('left', this.archersPerSide);
    this.right = makeSideState('right', this.archersPerSide);
    this.gameOver = false;
    this.winner = null;
    this.t = 0;
    this.sharedShotCd = SHOT_INTERVAL;
    this.left.shotCd = this.sharedShotCd;
    this.right.shotCd = this.sharedShotCd;

    for (let slot = 0; slot < this.archersPerSide; slot += 1) {
      const leftPull = previousPulls.left[slot];
      if (leftPull) {
        const control = this.ensureArcherControl('left', slot);
        const pull = this.normalizePull('left', leftPull.pullX, leftPull.pullY);
        control.pullX = pull.x;
        control.pullY = pull.y;
      }
      const rightPull = previousPulls.right[slot];
      if (rightPull) {
        const control = this.ensureArcherControl('right', slot);
        const pull = this.normalizePull('right', rightPull.pullX, rightPull.pullY);
        control.pullX = pull.x;
        control.pullY = pull.y;
      }
    }
    this.syncSidePrimaryPull('left');
    this.syncSidePrimaryPull('right');

    this.arrows = [];
    this.minions = [];
    this.resources = [];
    this.shotPowers = [];
    this.upgradeCards = [];
    this.candles = { left: null, right: null };
    this.candleScorches = [];
    this.sfxEvents = [];
    this.damageEvents = [];
    this.lineEvents = [];
    this.activePresidents = { left: [], right: [] };
    this.candleCarrierCounts = { left: 0, right: 0 };
    this.nextResourceAt = 5;
    this.nextShotPowerAt = 7;
    this.seq = 1;
    this.left.candleCd = this.candleRareCooldown('left');
    this.right.candleCd = this.candleRareCooldown('right');
    this.left.candleActive = false;
    this.right.candleActive = false;
    this.seedUpgradeCards();
    this.started = this.isReadyToStart();

    return { ok: true };
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

  syncSidePrimaryPull(sideName) {
    const side = this[sideName];
    if (!side || !Array.isArray(side.archerPulls) || !side.archerPulls.length) return;
    const primary = side.archerPulls[0];
    side.pullX = primary.pullX;
    side.pullY = primary.pullY;
    side.archerAimY = primary.archerAimY;
  }

  ensureArcherControl(sideName, slot = 0) {
    const side = this[sideName];
    if (!side) return null;
    if (!Array.isArray(side.archerPulls)) side.archerPulls = [];
    const cappedSlot = Math.max(0, Math.min(this.archersPerSide - 1, Math.floor(slot)));
    while (side.archerPulls.length <= cappedSlot) {
      const idx = side.archerPulls.length;
      side.archerPulls.push({
        pullX: sideName === 'right' ? 0.8 : -0.8,
        pullY: 0,
        archerAimY: ARCHER_ORIGIN_Y - idx * ARCHER_VERTICAL_GAP,
      });
    }
    return side.archerPulls[cappedSlot];
  }

  playerBySocket(socketId) {
    const leftPlayer = this.players.left.find((p) => p.id === socketId);
    if (leftPlayer) return { side: 'left', slot: leftPlayer.slot, player: leftPlayer };
    const rightPlayer = this.players.right.find((p) => p.id === socketId);
    if (rightPlayer) return { side: 'right', slot: rightPlayer.slot, player: rightPlayer };
    return null;
  }

  sideBySocket(socketId) {
    const found = this.playerBySocket(socketId);
    return found ? found.side : null;
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

  setControlPull(socketId, x, y) {
    if (this.gameOver) return;
    const player = this.playerBySocket(socketId);
    if (!player) return;
    const sideName = player.side;

    const pull = this.normalizePull(sideName, x, y);
    const control = this.ensureArcherControl(sideName, player.slot);
    if (!control) return;
    control.pullX = pull.x;
    control.pullY = pull.y;
    control.archerAimY = ARCHER_ORIGIN_Y - player.slot * ARCHER_VERTICAL_GAP;
    this.syncSidePrimaryPull(sideName);
  }

  removeSocket(socketId) {
    let changed = false;
    if (this.display && this.display.id === socketId) {
      this.display = null;
      changed = true;
    }
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

  tick(dt) {
    if (!this.started || this.gameOver) return;
    this.t += dt;

    // In 2v2, archers alternate on the same side-wide cadence as 1v1.
    // Result: one team shot every second, each individual archer every two seconds.
    const volleyInterval = SHOT_INTERVAL;
    this.sharedShotCd = Math.max(0, this.sharedShotCd - dt);
    this.left.shotCd = this.sharedShotCd;
    this.right.shotCd = this.sharedShotCd;
    this.left.minionCd = Math.max(0, this.left.minionCd - dt);
    this.right.minionCd = Math.max(0, this.right.minionCd - dt);

    if (this.sharedShotCd === 0) {
      if (this.archersPerSide > 1) {
        const leftSlot = this.left.archerVolleyIndex || 0;
        const rightSlot = this.right.archerVolleyIndex || 0;
        this.addArrowFromPull('left', leftSlot);
        this.addArrowFromPull('right', rightSlot);
        this.left.archerVolleyIndex = (leftSlot + 1) % this.archersPerSide;
        this.right.archerVolleyIndex = (rightSlot + 1) % this.archersPerSide;
      } else {
        this.addArrowFromPull('left', 0);
        this.addArrowFromPull('right', 0);
      }
      this.sharedShotCd = volleyInterval;
      this.left.shotCd = this.sharedShotCd;
      this.right.shotCd = this.sharedShotCd;
    }

    if (this.left.minionCd === 0) {
      this.spawnMinion('left');
      this.left.minionCd = this.statSpawnEvery(this.left);
    }
    if (this.right.minionCd === 0) {
      this.spawnMinion('right');
      this.right.minionCd = this.statSpawnEvery(this.right);
    }

    if (this.t >= this.nextResourceAt) {
      this.spawnMirroredResource();
      this.nextResourceAt = this.t + Math.max(3.2, 6 - this.t / 200);
    }

    if (this.t >= this.nextShotPowerAt) {
      this.spawnMirroredShotPower();
      this.nextShotPowerAt = this.t + Math.max(5.2, 8.8 - this.t / 260);
    }

    this.syncUpgradeCards('left');
    this.syncUpgradeCards('right');
    this.refreshPresidentAuraCache();

    this.tickShotPowers(dt);
    this.tickArrows(dt);
    this.tickMinions(dt);
    this.tickCandle(dt);

    this.processEconomy(this.left);
    this.processEconomy(this.right);

    if (this.left.towerHp <= 0 || this.right.towerHp <= 0) {
      this.gameOver = true;
      this.winner = this.left.towerHp > this.right.towerHp ? 'left' : 'right';
    }
  }

  tickShotPowers(dt) {
    for (let i = this.shotPowers.length - 1; i >= 0; i -= 1) {
      const p = this.shotPowers[i];
      p.y += p.vy * dt;
      if (p.y >= GROUND_Y) this.shotPowers.splice(i, 1);
    }
  }

  candleSpawnX(sideName) {
    return sideName === 'right' ? (TOWER_X_RIGHT - CANDLE_SPAWN_OFFSET) : (TOWER_X_LEFT + CANDLE_SPAWN_OFFSET);
  }

  candleSpawnY() {
    return TOWER_Y + (Math.random() * 80 - 40);
  }

  candleRetrainSeconds(sideName, delivered = false) {
    void delivered;
    return this.candleRareCooldown(sideName);
  }

  candleRareCooldown(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const spawnLevel = Math.max(1, Number(this[side]?.spawnLevel) || 1);
    const range = Math.max(10, CANDLE_RARE_CD_MAX - CANDLE_RARE_CD_MIN);
    const roll = CANDLE_RARE_CD_MIN + Math.random() * range;
    const spawnReduction = Math.min(10, (spawnLevel - 1) * 0.8);
    return Math.max(35, roll - spawnReduction);
  }

  createCandle(sideName = 'left') {
    const spawnSide = sideName === 'right' ? 'right' : 'left';
    const spawnX = this.candleSpawnX(spawnSide);
    const spawnY = this.candleSpawnY();
    return {
      id: this.seq++,
      x: spawnX,
      y: spawnY,
      r: 24,
      wax: CANDLE_WAX_MAX,
      waxMax: CANDLE_WAX_MAX,
      flameSpeed: 0.95,
      flameBoost: 0,
      flameBurstTtl: 0,
      flameBeamTtl: 0,
      flameBeamToX: null,
      flameBeamToY: null,
      flameHitFlashTtl: 0,
      flamePulse: Math.random() * Math.PI * 2,
      cartHalfW: CANDLE_CART_HALF_W,
      claimedBy: null,
      holderIds: [],
      spawnSide,
      spawnX,
      spawnY,
      delivering: false,
      deliverEnemySide: null,
      deliverExplodeTtl: 0,
      fireCd: 0.3,
      destroyed: false,
      respawnCd: 0,
    };
  }

  resetCandle(sideName = 'left') {
    const spawnSide = sideName === 'right' ? 'right' : 'left';
    for (const m of this.minions) {
      if (m.candleCarrier && m.candleCarrierSide === spawnSide) {
        m.candleCarrier = false;
        m.candleCarrierSide = null;
      }
    }
    this.candles[spawnSide] = this.createCandle(spawnSide);
    this[spawnSide].candleActive = true;
    this[spawnSide].candleCd = 0;
  }

  spawnCandleUnit(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    if (this.candles[side]) return this.candles[side];
    this.resetCandle(side);
    const c = this.candles[side];
    if (c) this.queueHitSfx('upgrade', c.x, c.y - 8, side);
    return c;
  }

  isCandleCarrierEligible(minion) {
    if (!minion) return false;
    if (minion.summoned || minion.super) return false;
    if (minion.dragon || minion.flying) return false;
    if (minion.explosive || minion.necrominion) return false;
    if (minion.gunner || minion.rider || minion.digger) return false;
    if (minion.monk || minion.hero || minion.president) return false;
    return true;
  }

  countCandleCarriers(candleSide) {
    let n = 0;
    for (const m of this.minions) {
      if (!m || !m.candleCarrier) continue;
      if ((Number(m.hp) || 0) <= 0) continue;
      if (m.candleCarrierSide !== candleSide) continue;
      n += 1;
    }
    return n;
  }

  igniteMinion(minion, duration = 1.6) {
    if (!minion) return;
    minion.candleBurnTtl = Math.max(Number(minion.candleBurnTtl) || 0, duration);
    const tick = Number(minion.candleBurnTick);
    if (!Number.isFinite(tick) || tick > 0.1) minion.candleBurnTick = 0.1;
  }

  tickCandleBurnOnMinion(minion, dt) {
    if (!minion) return;
    let ttl = Number(minion.candleBurnTtl) || 0;
    if (ttl <= 0) return;

    ttl = Math.max(0, ttl - dt);
    minion.candleBurnTtl = ttl;
    minion.candleBurnTick = (Number(minion.candleBurnTick) || 0) - dt;
    if (minion.candleBurnTick > 0) return;

    minion.candleBurnTick = 0.28;
    const burnDamage = Math.max(4, 6 + (Number(minion.maxHp) || 0) * 0.0085);
    this.dealDamageToMinion(minion, burnDamage);
    this.queueHitSfx('dragonfire', minion.x, minion.y - Math.max(7, (minion.r || 12) * 0.24), minion.side);
  }

  handleCandleMinionIntent(minion, dt, cachedCarrierCounts = null) {
    const setCarrierState = (active, side = null) => {
      const prevActive = Boolean(minion.candleCarrier);
      const prevSide = prevActive && (minion.candleCarrierSide === 'right' || minion.candleCarrierSide === 'left')
        ? minion.candleCarrierSide
        : null;
      const nextSide = active ? (side === 'right' ? 'right' : 'left') : null;
      if (prevActive === active && prevSide === nextSide) return;

      if (cachedCarrierCounts && prevActive && prevSide) {
        cachedCarrierCounts[prevSide] = Math.max(0, (cachedCarrierCounts[prevSide] || 0) - 1);
      }
      minion.candleCarrier = active;
      minion.candleCarrierSide = nextSide;
      if (cachedCarrierCounts && active && nextSide) {
        cachedCarrierCounts[nextSide] = (cachedCarrierCounts[nextSide] || 0) + 1;
      }
    };

    const candleSide = minion.side === 'right' ? 'right' : 'left';
    const candle = this.candles?.[candleSide];
    if (!candle || candle.destroyed || candle.delivering) {
      if (minion.candleCarrier && minion.candleCarrierSide === candleSide) {
        setCarrierState(false);
      }
      return false;
    }
    if (!this.isCandleCarrierEligible(minion)) return false;

    const dx = candle.x - minion.x;
    const dy = candle.y - minion.y;
    const d = Math.hypot(dx, dy);

    if (minion.candleCarrier) {
      if (minion.candleCarrierSide !== candleSide) {
        setCarrierState(false);
        return false;
      }
      if (d > 160) {
        const chaseStep = Math.max(34, minion.speed * 1.08) * dt;
        minion.x += clamp(dx, -chaseStep, chaseStep);
        minion.y += clamp(dy, -chaseStep * 0.78, chaseStep * 0.78);
      }
      return true;
    }

    const carrierCount = cachedCarrierCounts
      ? (cachedCarrierCounts[candleSide] || 0)
      : this.countCandleCarriers(candleSide);
    if (carrierCount >= CANDLE_MAX_HOLDERS) return false;
    if (d > CANDLE_RECRUIT_RANGE) return false;

    const moveStep = Math.max(32, minion.speed * (d < 84 ? 0.84 : 1.14)) * dt;
    minion.x += clamp(dx, -moveStep, moveStep);
    minion.y += clamp(dy, -moveStep * 0.72, moveStep * 0.72);

    if (d <= CANDLE_PICKUP_RANGE + (Number(minion.r) || 16) * 0.24) {
      setCarrierState(true, candleSide);
      candle.claimedBy = candleSide;
      this.queueHitSfx('powerup', minion.x, minion.y - 5, minion.side);
    }
    return true;
  }

  candleMoveSpeed(holderCount) {
    const n = Math.max(0, Math.floor(holderCount));
    if (n >= CANDLE_FAST_HOLDERS) return 46 + (n - CANDLE_FAST_HOLDERS) * 6;
    return 3.5 + n * 1.15;
  }

  positionCandleHolders(holders, dt, candle, dir) {
    const ordered = holders
      .slice()
      .sort((a, b) => a.id - b.id)
      .slice(0, CANDLE_MAX_HOLDERS);

    const cartHalf = Math.max(28, Number(candle?.cartHalfW) || CANDLE_CART_HALF_W);
    const slots = [
      { x: cartHalf + 16, y: -12 }, // front puller 1
      { x: cartHalf + 16, y: 12 }, // front puller 2
      { x: -(cartHalf + 15), y: -12 }, // rear pusher 1
      { x: -(cartHalf + 15), y: 12 }, // rear pusher 2
      { x: cartHalf + 30, y: -25 },
      { x: cartHalf + 30, y: 25 },
      { x: -(cartHalf + 29), y: -25 },
      { x: -(cartHalf + 29), y: 25 },
    ];

    for (let i = 0; i < ordered.length; i += 1) {
      const m = ordered[i];
      const slot = slots[i] || slots[slots.length - 1];
      const tx = candle.x + dir * slot.x;
      const ty = candle.y + slot.y;
      const step = Math.max(28, m.speed * 1.22) * dt;

      m.x += clamp(tx - m.x, -step, step);
      m.y += clamp(ty - m.y, -step * 0.74, step * 0.74);
      m.y = clamp(m.y, TOWER_Y - 170, TOWER_Y + 170);
      m.atkCd = Math.max(m.atkCd, 0.25);
    }
  }

  findCandleFireTarget(sideName, candle, range = CANDLE_FIRE_RANGE, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!candle) return null;
    const maxR = Math.max(100, range);
    let target = null;
    let best = Infinity;
    this.forEachEnemyMinionInRadius(
      sideName,
      candle.x,
      candle.y - 10,
      maxR,
      minionBuckets,
      bucketW,
      (enemy) => {
        if (!enemy || (Number(enemy.hp) || 0) <= 0) return;
        const dx = enemy.x - candle.x;
        const dy = enemy.y - (candle.y - 10);
        const d2 = dx * dx + dy * dy;
        if (d2 >= best) return;
        best = d2;
        target = enemy;
      }
    );
    return target;
  }

  candleFireBurst(sideName, candle, target, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!candle || !target) return;
    const waxPct = Math.max(0, Math.min(1, (Number(candle.wax) || 0) / Math.max(1, Number(candle.waxMax) || 1)));
    const side = this[sideName];
    const base = 18 + waxPct * 10 + Math.max(0, (Number(side?.powerLevel) || 1) - 1) * 1.4;
    const splash = base * 0.42;
    const pseudoAttacker = { side: sideName, super: false, summoned: false };
    const mouthX = candle.x;
    const mouthY = candle.y - 28;

    this.dealMinionDamage(pseudoAttacker, target, base, 'dragonfire');
    this.igniteMinion(target, 1.05);
    this.queueHitSfx('dragonfire', mouthX, mouthY, sideName);
    this.queueHitSfx('dragonfire', target.x, target.y - Math.max(6, (target.r || 12) * 0.22), sideName);

    this.forEachEnemyMinionInRadius(
      sideName,
      target.x,
      target.y,
      CANDLE_FIRE_SPLASH_R,
      minionBuckets,
      bucketW,
      (other) => {
        if (!other || other.id === target.id || (Number(other.hp) || 0) <= 0) return;
        this.dealMinionDamage(pseudoAttacker, other, splash, 'dragonfire');
        this.igniteMinion(other, 0.7);
      }
    );

    candle.flameSpeed = 1.22;
    candle.flameBoost = 0.74 + waxPct * 0.56;
    candle.flameBurstTtl = 0.26;
    candle.flameBeamTtl = 0.24;
    candle.flameBeamToX = Number.isFinite(target.x) ? target.x : mouthX + (sideName === 'left' ? 120 : -120);
    candle.flameBeamToY = Number.isFinite(target.y) ? target.y - Math.max(4, (target.r || 12) * 0.16) : mouthY + 8;
  }

  hitCandleWithArrow(candle, arrow, part = 'flame') {
    if (!candle || candle.destroyed) return;
    const candleSide = candle.spawnSide === 'right' ? 'right' : 'left';
    if (arrow?.side && arrow.side === candleSide) return;
    const hitSide = arrow?.side || candle.claimedBy || 'left';
    const flameShotBonus = arrow?.powerType === 'flameShot' ? 0.4 : 0;
    const enemyHit = arrow?.side ? arrow.side !== candleSide : true;

    if (part === 'stem') {
      const waxLoss = enemyHit ? (0.45 + flameShotBonus * 0.2) : 0.02;
      candle.wax = Math.max(0, candle.wax - waxLoss);
      this.queueHitSfx('minion', candle.x, candle.y + 3, hitSide);
      return;
    }

    const baseLoss = (enemyHit ? 13.6 : 0.55) + flameShotBonus * 2.8 + (arrow?.mainArrow ? 1.9 : 0.8);
    const waxLoss = enemyHit ? baseLoss * 4 : baseLoss;
    candle.wax = Math.max(0, candle.wax - waxLoss);
    candle.flameHitFlashTtl = enemyHit ? 0.28 : Math.max(Number(candle.flameHitFlashTtl) || 0, 0.12);

    this.queueHitSfx('candlehit', candle.x, candle.y - 10, hitSide);
    if (enemyHit) {
      this.queueHitSfx('explosion', candle.x, candle.y - 10, hitSide);
      this.queueHitSfx('dragonfire', candle.x + (Math.random() * 16 - 8), candle.y - 7, hitSide);
      this.queueDamageNumber(waxLoss, candle.x + (Math.random() * 12 - 6), candle.y - 26);
    }
    if (candle.wax <= 0) {
      this.burnDownCandle(candle.spawnSide || 'left', arrow?.side || candle.claimedBy || 'left');
    }
  }

  hitCandleWithMinion(candle, minion) {
    if (!candle || candle.destroyed || candle.delivering || !minion) return;
    const hitSide = minion.side || candle.claimedBy || 'left';
    const baseDamage = Math.max(1, Number(minion.dmg) || 8);
    let waxLoss = baseDamage * 0.44;
    if (minion.hero) waxLoss *= 2.8;
    else if (minion.dragon) waxLoss *= 2.2;
    else if (minion.gunner) waxLoss *= 1.7;
    else if (minion.rider) waxLoss *= 1.42;
    else if (minion.digger) waxLoss *= 0.92;

    candle.wax = Math.max(0, candle.wax - waxLoss);
    candle.flameHitFlashTtl = Math.max(Number(candle.flameHitFlashTtl) || 0, 0.24);
    this.queueHitSfx('candlehit', candle.x, candle.y - 10, hitSide);
    if (minion.dragon || minion.hero || waxLoss >= 16) {
      this.queueHitSfx('explosion', candle.x, candle.y - 10, hitSide);
    }
    if (minion.dragon) {
      this.queueHitSfx('dragonfire', candle.x + (Math.random() * 12 - 6), candle.y - 8, hitSide);
    }
    this.queueDamageNumber(waxLoss, candle.x + (Math.random() * 10 - 5), candle.y - 24);

    if (candle.wax <= 0) {
      this.burnDownCandle(candle.spawnSide || 'left', hitSide);
    }
  }

  burnDownCandle(candleSide, sourceSide = null) {
    const sideName = candleSide === 'right' ? 'right' : 'left';
    const candle = this.candles?.[sideName];
    if (!candle || candle.destroyed) return;

    const hitSide = sourceSide || candle.claimedBy || sideName;
    const holders = this.minions.filter((m) => m?.candleCarrier && m.candleCarrierSide === sideName);
    for (const m of holders) {
      m.candleCarrier = false;
      m.candleCarrierSide = null;
      this.igniteMinion(m, 2.4);
    }

    this.candleScorches.push({
      x: candle.x,
      y: candle.y + 20,
      r: 96,
      ttl: 4.2,
      side: hitSide,
      candleSide: sideName,
      towerSide: null,
      towerBurnDps: 0,
      towerBurnTick: 0,
    });

    this.candles[sideName] = null;
    this[sideName].candleActive = false;
    this[sideName].candleCd = this.candleRetrainSeconds(sideName, false);

    this.queueHitSfx('explosion', candle.x, candle.y, hitSide);
    this.queueHitSfx('dragonfire', candle.x - 10, candle.y - 10, hitSide);
    this.queueHitSfx('dragonfire', candle.x + 10, candle.y - 6, hitSide);
  }

  explodeDeliveredCandle(candleSide) {
    const sideName = candleSide === 'right' ? 'right' : 'left';
    const candle = this.candles?.[sideName];
    if (!candle || candle.destroyed || !candle.delivering) return;

    const enemySide = candle.deliverEnemySide === 'left' || candle.deliverEnemySide === 'right'
      ? candle.deliverEnemySide
      : (sideName === 'left' ? 'right' : 'left');
    const waxPct = Math.max(0, Math.min(1, candle.wax / Math.max(1, candle.waxMax)));
    const damagePct = 0.09 + waxPct * 0.06; // Fuller candle hits harder; full candle is 15% max tower HP.
    const damage = TOWER_MAX_HP * damagePct;
    const hitX = Number.isFinite(candle.x)
      ? candle.x
      : (enemySide === 'left' ? TOWER_X_LEFT + 54 : TOWER_X_RIGHT - 54);

    this.dealDamageToTower(enemySide, damage, hitX, TOWER_Y - 34);

    this.queueHitSfx('explosion', hitX, TOWER_Y - 28, sideName);
    this.queueHitSfx('dragonfire', hitX - 24, TOWER_Y - 32, sideName);
    this.queueHitSfx('dragonfire', hitX + 22, TOWER_Y - 26, sideName);
    this.queueHitSfx('dragonfire', hitX, TOWER_Y - 46, sideName);

    this.candleScorches.push({
      x: hitX,
      y: TOWER_Y + 20,
      r: 128 + waxPct * 24,
      ttl: 5.4 + waxPct * 1.8,
      side: sideName,
      candleSide: sideName,
      towerSide: enemySide,
      towerBurnDps: 52 + waxPct * 36,
      towerBurnTick: 0.2,
    });

    this.candles[sideName] = null;
    this[sideName].candleActive = false;
    this[sideName].candleCd = this.candleRetrainSeconds(sideName, true);
  }

  deliverCandle(candleSide) {
    const sideName = candleSide === 'right' ? 'right' : 'left';
    const candle = this.candles?.[sideName];
    if (!candle || candle.destroyed) return;

    const enemySide = sideName === 'left' ? 'right' : 'left';
    candle.x = sideName === 'left' ? TOWER_X_RIGHT - 52 : TOWER_X_LEFT + 52;
    candle.y = TOWER_Y + 10;
    candle.delivering = true;
    candle.deliverEnemySide = enemySide;
    candle.deliverExplodeTtl = CANDLE_DELIVER_FUSE;
    candle.holderIds = [];
    candle.claimedBy = sideName;
    candle.flameSpeed = 1;
    candle.flameBoost = 0;
    candle.flameBurstTtl = 0;
    candle.flameBeamTtl = 0;
    candle.flameBeamToX = null;
    candle.flameBeamToY = null;
    candle.flameHitFlashTtl = 0;
    this.queueHitSfx('upgrade', candle.x, candle.y - 10, sideName);

    for (const m of this.minions) {
      if (m.candleCarrier && m.candleCarrierSide === sideName) {
        m.candleCarrier = false;
        m.candleCarrierSide = null;
        m.atkCd = Math.max(m.atkCd || 0, 0.22);
      }
    }
  }

  tickCandle(dt) {
    if (!Array.isArray(this.candleScorches)) this.candleScorches = [];
    const minionBuckets = this.buildMinionBuckets(MINION_TARGET_BUCKET_W);
    for (let i = this.candleScorches.length - 1; i >= 0; i -= 1) {
      const scorch = this.candleScorches[i];
      scorch.ttl = Math.max(0, (Number(scorch.ttl) || 0) - dt);
      const candleSide = scorch.candleSide === 'right' ? 'right' : 'left';
      this.forEachMinionInRadius(scorch.x, scorch.y, scorch.r, minionBuckets, MINION_TARGET_BUCKET_W, (minion) => {
        const dps = minion.side === candleSide ? CANDLE_SCORCH_DPS_ALLY : CANDLE_SCORCH_DPS_ENEMY;
        if (dps > 0) this.dealDamageToMinion(minion, dps * dt);
      });
      if (scorch.towerSide === 'left' || scorch.towerSide === 'right') {
        scorch.towerBurnTick = (Number(scorch.towerBurnTick) || 0) - dt;
        if (scorch.towerBurnTick <= 0) {
          const dps = Math.max(0, Number(scorch.towerBurnDps) || 0);
          if (dps > 0) this.dealDamageToTower(scorch.towerSide, dps * 0.25, scorch.x, TOWER_Y - 24);
          scorch.towerBurnTick = 0.25;
        }
      }
      if (scorch.ttl <= 0) this.candleScorches.splice(i, 1);
    }

    for (const sideName of ['left', 'right']) {
      if (!this.candles[sideName]) {
        this[sideName].candleActive = false;
        this[sideName].candleCd = Math.max(0, Number(this[sideName].candleCd) || 0);
        if (this[sideName].candleCd > 0) this[sideName].candleCd = Math.max(0, this[sideName].candleCd - dt);
        if (this[sideName].candleCd === 0) this.spawnCandleUnit(sideName);
      }
      const candle = this.candles[sideName];
      if (!candle) continue;
      this[sideName].candleActive = true;
      this[sideName].candleCd = 0;

      if (candle.delivering) {
        candle.holderIds = [];
        candle.claimedBy = sideName;
        candle.flamePulse += dt * 5.5;
        candle.flameBeamTtl = 0;
        candle.flameBeamToX = null;
        candle.flameBeamToY = null;
        candle.flameHitFlashTtl = Math.max(0, (Number(candle.flameHitFlashTtl) || 0) - dt);
        candle.deliverExplodeTtl = Math.max(0, (Number(candle.deliverExplodeTtl) || 0) - dt);
        if (candle.deliverExplodeTtl === 0) this.explodeDeliveredCandle(sideName);
        continue;
      }

      candle.flamePulse += dt * 4.8;
      candle.flameSpeed = 1;
      candle.flameBoost = 0;
      candle.flameBurstTtl = Math.max(0, (Number(candle.flameBurstTtl) || 0) - dt);
      candle.flameBeamTtl = Math.max(0, (Number(candle.flameBeamTtl) || 0) - dt);
      candle.flameHitFlashTtl = Math.max(0, (Number(candle.flameHitFlashTtl) || 0) - dt);
      candle.fireCd = Math.max(0, (Number(candle.fireCd) || 0) - dt);
      const burnRate = 0.03;
      candle.wax = Math.max(0, candle.wax - burnRate * dt);

      const holders = this.minions.filter((m) => (
        m?.candleCarrier
        && m.candleCarrierSide === sideName
        && m.side === sideName
        && m.hp > 0
        && this.isCandleCarrierEligible(m)
      ));
      const sideHolders = holders
        .sort((a, b) => a.id - b.id)
        .slice(0, CANDLE_MAX_HOLDERS);
      const keepCarrierIds = new Set(sideHolders.map((m) => m.id));
      for (const m of holders) {
        if (!keepCarrierIds.has(m.id)) {
          m.candleCarrier = false;
          m.candleCarrierSide = null;
        }
      }
      candle.holderIds = sideHolders.map((m) => m.id);
      candle.claimedBy = sideName;

      if (candle.fireCd === 0) {
        const fireRange = sideHolders.length ? (CANDLE_FIRE_RANGE + 40) : CANDLE_FIRE_RANGE;
        const target = this.findCandleFireTarget(sideName, candle, fireRange, minionBuckets, MINION_TARGET_BUCKET_W);
        if (target) {
          this.candleFireBurst(sideName, candle, target, minionBuckets, MINION_TARGET_BUCKET_W);
          candle.fireCd = CANDLE_FIRE_INTERVAL * (sideHolders.length ? 0.8 : 1.08);
        }
      }

      if (!sideHolders.length) {
        candle.claimedBy = null;
        const homeX = Number.isFinite(candle.spawnX) ? candle.spawnX : this.candleSpawnX(sideName);
        const homeY = Number.isFinite(candle.spawnY) ? candle.spawnY : this.candleSpawnY();
        candle.x += (homeX - candle.x) * Math.min(1, dt * 0.34);
        candle.y += (homeY - candle.y) * Math.min(1, dt * 0.34);
        if (candle.wax <= 0) this.burnDownCandle(sideName, null);
        continue;
      }

      const dir = sideName === 'left' ? 1 : -1;
      const speed = this.candleMoveSpeed(sideHolders.length);
      candle.x = clamp(candle.x + dir * speed * dt, TOWER_X_LEFT + 92, TOWER_X_RIGHT - 92);
      this.positionCandleHolders(sideHolders, dt, candle, dir);

      const enemyTargetX = sideName === 'left' ? TOWER_X_RIGHT - 84 : TOWER_X_LEFT + 84;
      const reached = sideName === 'left' ? candle.x >= enemyTargetX : candle.x <= enemyTargetX;
      if (reached) {
        this.deliverCandle(sideName);
        continue;
      }

      if (candle.wax <= 0) this.burnDownCandle(sideName, sideName);
    }
  }

  tickArrows(dt) {
    const candleList = this.candles ? Object.values(this.candles) : [];
    const minionBuckets = this.buildArrowMinionBuckets();

    for (let i = this.arrows.length - 1; i >= 0; i -= 1) {
      const a = this.arrows[i];
      a.vy += (a.gravity || 560) * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.ttl -= dt;

      if (a.ttl <= 0 || a.x < -50 || a.x > WORLD_W + 50 || a.y < -50 || a.y > WORLD_H + 50) {
        this.markArrowMiss(a);
        this.arrows.splice(i, 1);
        continue;
      }

      if (a.y >= GROUND_Y + 12 && a.vy > 0) {
        this.markArrowMiss(a);
        this.arrows.splice(i, 1);
        continue;
      }

      let consumed = false;

      for (let p = this.shotPowers.length - 1; p >= 0; p -= 1) {
        const power = this.shotPowers[p];
        if (power.side !== a.side) continue;
        const hitR = power.r + a.r;
        if (dist2(a, power) <= hitR * hitR) {
          this.markArrowHit(a);
          const side = a.side === 'left' ? this.left : this.right;
          side.pendingShotPower = power.type;
          side.pendingShotPowerShots = 3;
          this.queueHitSfx('powerup', power.x, power.y, a.side);
          this.shotPowers.splice(p, 1);
        }
      }

      if (!consumed && candleList.length) {
        for (const candle of candleList) {
          if (!candle || candle.destroyed || candle.delivering || consumed) continue;
          const candleKey = candle.spawnSide === 'right' ? 'right' : 'left';
          if (a.side === candleKey) continue;
          if (a.candleTouched && a.candleTouched[candleKey]) continue;
          const hitR = (candle.r || 24) + a.r;
          const waxPct = Math.max(0, Math.min(1, (candle.wax || 0) / Math.max(1, candle.waxMax || 1)));
          const flameY = candle.y - (20 + waxPct * 18);
          const flameRx = 14;
          const flameRy = 22;
          const fx = (a.x - candle.x) / flameRx;
          const fy = (a.y - flameY) / flameRy;
          const flameHit = (fx * fx + fy * fy <= 1) && a.y <= candle.y - 7;
          const stemHit = dist2(a, candle) <= hitR * hitR;
          if (flameHit) {
            if (!a.candleTouched) a.candleTouched = {};
            a.candleTouched[candleKey] = true;
            this.markArrowHit(a);
            this.hitCandleWithArrow(candle, a, 'flame');
            consumed = a.pierce <= 0;
            if (a.pierce > 0) a.pierce -= 1;
          } else if (stemHit) {
            if (!a.candleTouched) a.candleTouched = {};
            a.candleTouched[candleKey] = true;
            this.hitCandleWithArrow(candle, a, 'stem');
          }
        }
      }

      const enemySide = a.side === 'left' ? 'right' : 'left';
      const enemyBuckets = minionBuckets[enemySide];
      const centerCell = Math.floor((Number.isFinite(a.x) ? a.x : 0) / ARROW_TARGET_BUCKET_W);
      for (
        let cell = centerCell - ARROW_TARGET_BUCKET_SCAN;
        cell <= centerCell + ARROW_TARGET_BUCKET_SCAN && !consumed;
        cell += 1
      ) {
        const bucket = enemyBuckets.get(cell);
        if (!bucket) continue;

        for (let b = bucket.length - 1; b >= 0 && !consumed; b -= 1) {
          const minion = bucket[b];
          if (!minion || minion.removed || minion.side === a.side) continue;
          const hitR = minion.r + a.r;
          if (dist2(a, minion) > hitR * hitR) continue;

          this.markArrowHit(a);
          let damage = a.dmg;
          if (minion.digger) damage *= 0.76;
          const core = this.dragonHeartCore(minion);
          if (core) {
            const coreHitR = core.r + a.r;
            if (dist2(a, core) <= coreHitR * coreHitR) {
              damage *= 2.85;
              this.queueHitSfx('dragon', core.x, core.y, a.side);
            } else {
              this.queueHitSfx('minion', minion.x, minion.y, a.side);
            }
          } else {
            this.queueHitSfx('minion', minion.x, minion.y, a.side);
          }
          consumed = a.pierce <= 0;
          if (a.pierce > 0) a.pierce -= 1;

          if (minion.hero) {
            minion.heroArrowHits = (minion.heroArrowHits || 0) + 1;
            if (minion.heroArrowHits >= HERO_ARROW_FINISHER_HITS) {
              this.queueHitSfx('explosion', minion.x, minion.y - 6, a.side);
              this.killMinionByRef(minion, a.side, { goldScalar: 1.2 });
              continue;
            }
            if (minion.heroArrowHits === 3 || minion.heroArrowHits === 6) {
              this.queueLine(
                `${minion.heroArrowHits}/${HERO_ARROW_FINISHER_HITS} dramatic wounds!`,
                minion.x,
                minion.y - minion.r - 24,
                minion.side
              );
            }
          }

          if (minion.explosive) {
            this.killMinionByRef(minion, a.side, { triggerExplosion: true, impactDamage: a.dmg });
            continue;
          }

          this.dealDamageToMinion(minion, damage);
          this.applyFlameArrowImpact(a, minion, damage, minionBuckets);
          this.applyMaxComboSplash(a, minion, damage, minionBuckets);
          if (minion.hp <= 0) {
            this.killMinionByRef(minion, a.side);
          }
        }
      }

      for (let r = this.resources.length - 1; r >= 0 && !consumed; r -= 1) {
        const res = this.resources[r];
        const hitR = res.r + a.r;
        if (dist2(a, res) <= hitR * hitR) {
          this.markArrowHit(a);
          if (a.side === 'left') {
            const gain = this.goldFromResource(this.left, res.value);
            this.left.gold += gain;
            this.addUpgradeCharge(this.left, gain);
          } else {
            const gain = this.goldFromResource(this.right, res.value);
            this.right.gold += gain;
            this.addUpgradeCharge(this.right, gain);
          }
          this.queueHitSfx('resource', res.x, res.y, a.side);
          this.resources.splice(r, 1);
          consumed = a.pierce <= 0;
          if (a.pierce > 0) a.pierce -= 1;
        }
      }

      for (let u = this.upgradeCards.length - 1; u >= 0 && !consumed; u -= 1) {
        const card = this.upgradeCards[u];
        if (card.side !== a.side) continue;
        const hit =
          a.x >= card.x - card.w / 2 - a.r &&
          a.x <= card.x + card.w / 2 + a.r &&
          a.y >= card.y - card.h / 2 - a.r &&
          a.y <= card.y + card.h / 2 + a.r;
        if (hit) {
          const mySide = a.side === 'left' ? this.left : this.right;
          if (mySide.upgradeCharge < mySide.upgradeChargeMax) continue;
          this.markArrowHit(a);
          consumed = this.selectUpgradeCard(a.side, card);
        }
      }

      if (consumed) this.arrows.splice(i, 1);
    }
  }

  buildMinionBuckets(bucketW = ARROW_TARGET_BUCKET_W) {
    const buckets = {
      left: new Map(),
      right: new Map(),
    };

    for (const minion of this.minions) {
      if (!minion || minion.removed) continue;
      const sideName = minion.side === 'right' ? 'right' : 'left';
      const x = Number.isFinite(minion.x) ? minion.x : 0;
      const key = Math.floor(x / bucketW);
      const cell = buckets[sideName].get(key);
      if (cell) cell.push(minion);
      else buckets[sideName].set(key, [minion]);
    }

    return buckets;
  }

  buildArrowMinionBuckets() {
    return this.buildMinionBuckets(ARROW_TARGET_BUCKET_W);
  }

  forEachMinionInRadius(centerX, centerY, radius, buckets = null, bucketW = ARROW_TARGET_BUCKET_W, fn = null) {
    if (typeof fn !== 'function') return;
    const x = Number.isFinite(centerX) ? centerX : 0;
    const y = Number.isFinite(centerY) ? centerY : 0;
    const r = Math.max(0, Number(radius) || 0);
    const r2 = r * r;

    if (buckets?.left instanceof Map && buckets?.right instanceof Map) {
      const width = Math.max(1, bucketW);
      const scan = Math.max(1, Math.ceil(r / width));
      const centerCell = Math.floor(x / width);
      for (let cell = centerCell - scan; cell <= centerCell + scan; cell += 1) {
        const leftBucket = buckets.left.get(cell);
        if (leftBucket) {
          for (const other of leftBucket) {
            if (!other || other.removed) continue;
            const dx = other.x - x;
            const dy = other.y - y;
            if (dx * dx + dy * dy > r2) continue;
            fn(other);
          }
        }
        const rightBucket = buckets.right.get(cell);
        if (!rightBucket) continue;
        for (const other of rightBucket) {
          if (!other || other.removed) continue;
          const dx = other.x - x;
          const dy = other.y - y;
          if (dx * dx + dy * dy > r2) continue;
          fn(other);
        }
      }
      return;
    }

    for (const other of this.minions) {
      if (!other || other.removed) continue;
      const dx = other.x - x;
      const dy = other.y - y;
      if (dx * dx + dy * dy > r2) continue;
      fn(other);
    }
  }

  forEachEnemyMinionInRadius(attackerSide, centerX, centerY, radius, buckets = null, bucketW = ARROW_TARGET_BUCKET_W, fn = null) {
    if (typeof fn !== 'function') return;
    const sideName = attackerSide === 'right' ? 'right' : 'left';
    const enemySide = sideName === 'left' ? 'right' : 'left';
    const x = Number.isFinite(centerX) ? centerX : 0;
    const y = Number.isFinite(centerY) ? centerY : 0;
    const r = Math.max(0, Number(radius) || 0);
    const r2 = r * r;

    if (buckets && buckets[enemySide] instanceof Map) {
      const scan = Math.max(1, Math.ceil(r / Math.max(1, bucketW)));
      const centerCell = Math.floor(x / Math.max(1, bucketW));
      for (let cell = centerCell - scan; cell <= centerCell + scan; cell += 1) {
        const bucket = buckets[enemySide].get(cell);
        if (!bucket) continue;
        for (const other of bucket) {
          if (!other || other.removed || other.side === sideName) continue;
          const dx = other.x - x;
          const dy = other.y - y;
          if (dx * dx + dy * dy > r2) continue;
          fn(other);
        }
      }
      return;
    }

    for (const other of this.minions) {
      if (!other || other.removed || other.side === sideName) continue;
      const dx = other.x - x;
      const dy = other.y - y;
      if (dx * dx + dy * dy > r2) continue;
      fn(other);
    }
  }

  buildCandleCarrierCounts() {
    const counts = { left: 0, right: 0 };
    for (const m of this.minions) {
      if (!m || !m.candleCarrier) continue;
      if ((Number(m.hp) || 0) <= 0) continue;
      const side = m.candleCarrierSide === 'right' ? 'right' : 'left';
      counts[side] += 1;
    }
    this.candleCarrierCounts = counts;
    return counts;
  }

  refreshPresidentAuraCache() {
    const left = [];
    const right = [];
    for (const m of this.minions) {
      if (!m || m.removed || !m.president || !m.presidentSetup) continue;
      if (m.side === 'right') right.push(m);
      else left.push(m);
    }
    this.activePresidents = { left, right };
  }

  tickMinions(dt) {
    const targetBuckets = this.buildMinionBuckets(MINION_TARGET_BUCKET_W);
    const carrierCounts = this.buildCandleCarrierCounts();

    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const m = this.minions[i];
      if (!m) continue;
      if (!Number.isFinite(m.candleBurnTtl)) m.candleBurnTtl = 0;
      if (!Number.isFinite(m.candleBurnTick)) m.candleBurnTick = 0;
      if (typeof m.candleCarrier !== 'boolean') m.candleCarrier = false;
      if (m.candleCarrierSide !== 'left' && m.candleCarrierSide !== 'right') m.candleCarrierSide = null;
      if (!m.candleCarrier) m.candleCarrierSide = null;
      this.tickCandleBurnOnMinion(m, dt);
      if (m.hp <= 0) continue;
      m.atkCd = Math.max(0, m.atkCd - dt);
      if (m.dragonBreathTtl > 0) m.dragonBreathTtl = Math.max(0, m.dragonBreathTtl - dt);
      if (m.gunFlashTtl > 0) m.gunFlashTtl = Math.max(0, m.gunFlashTtl - dt);
      if (m.heroLineCd > 0) m.heroLineCd = Math.max(0, m.heroLineCd - dt);
      if (m.hero) {
        if (!Number.isFinite(m.heroSwing)) m.heroSwing = Math.random() * Math.PI * 2;
        m.heroSwing += dt * 8.2;
      }
      if (m.president) {
        this.tickPresident(m, dt);
        continue;
      }
      if (m.monk) {
        this.tickMonk(m, dt);
        continue;
      }
      if (this.handleCandleMinionIntent(m, dt, carrierCounts)) continue;
      if (m.digger) {
        if (!Number.isFinite(m.digPhase)) m.digPhase = Math.random() * Math.PI * 2;
        if (!Number.isFinite(m.digBaseY)) m.digBaseY = m.y;
        m.digPhase += dt * (1.35 + Math.min(0.65, m.speed / 150));
        m.y = clamp(m.digBaseY + Math.sin(m.digPhase) * 3.6, TOWER_Y + 52, TOWER_Y + 196);
      }
      if (m.flying) {
        if (!Number.isFinite(m.flyBaseY)) m.flyBaseY = m.y;
        if (!Number.isFinite(m.flyPhase)) m.flyPhase = Math.random() * Math.PI * 2;
        m.flyPhase += dt * (1.45 + Math.min(1.1, m.speed / 130));
        const amp = 12 + m.r * 0.22;
        m.y = clamp(m.flyBaseY + Math.sin(m.flyPhase) * amp, TOWER_Y - 220, TOWER_Y + 150);
      }
      const enemySideName = m.side === 'left' ? 'right' : 'left';
      const enemyX = m.side === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
      const dir = m.side === 'left' ? 1 : -1;
      const enemyCandle = this.candles?.[enemySideName];
      let candleInReach = false;
      let candleDistSq = Infinity;
      if (enemyCandle && !enemyCandle.destroyed && !enemyCandle.delivering) {
        const cdx = enemyCandle.x - m.x;
        const cdy = enemyCandle.y - m.y;
        candleDistSq = cdx * cdx + cdy * cdy;
        const candleReach = m.dragon
          ? 176
          : (m.gunner
              ? Math.max(132, (m.gunRange || 220) * 0.72)
              : m.r + (enemyCandle.r || 24) + 24 + (m.digger ? 10 : 0) + (m.hero ? 24 : 0));
        candleInReach = candleDistSq <= candleReach * candleReach;
      }

      if (m.hero) {
        const retreatHp = Math.max(1, m.maxHp * (Number(m.heroRetreatHpPct) || 0.3));
        if (!m.heroRetreating && m.hp <= retreatHp) {
          m.heroRetreating = true;
          this.queueLine('Strategic retreat... heroically!', m.x, m.y - m.r - 24, m.side);
        }

        if (m.heroRetreating) {
          const homeX = m.side === 'left' ? TOWER_X_LEFT + 58 : TOWER_X_RIGHT - 58;
          const retreatDir = m.side === 'left' ? -1 : 1;
          const retreatSpeed = Math.max(42, m.speed * 1.55);
          const reachedHome = m.side === 'left' ? m.x <= homeX : m.x >= homeX;

          if (!reachedHome) {
            m.x += retreatDir * retreatSpeed * dt;
            if (m.side === 'left') m.x = Math.max(m.x, homeX);
            else m.x = Math.min(m.x, homeX);
          } else {
            m.x = homeX;
            const healPerSec = Number(m.heroHealPerSec) || Math.max(90, m.maxHp * 0.34);
            m.hp = Math.min(m.maxHp, m.hp + healPerSec * dt);
            const returnHp = Math.max(1, m.maxHp * (Number(m.heroReturnHpPct) || 0.92));
            if (m.hp >= returnHp) {
              m.heroRetreating = false;
              m.heroArrowHits = 0;
              this.queueLine('Back and ridiculously refreshed!', m.x, m.y - m.r - 24, m.side);
            }
          }
          continue;
        }
      }

      let target = null;
      let bestSq = Infinity;
      const maxReach = m.dragon
        ? 170
        : (m.gunner
            ? (m.gunRange || 220)
            : m.r + 24 + (m.digger ? 14 : 0) + (m.hero ? 24 : 0) + MINION_TARGET_RADIUS_PAD);
      const scan = Math.max(1, Math.ceil(maxReach / MINION_TARGET_BUCKET_W));
      const centerCell = Math.floor((Number.isFinite(m.x) ? m.x : 0) / MINION_TARGET_BUCKET_W);
      const enemyBuckets = targetBuckets[enemySideName];
      for (let cell = centerCell - scan; cell <= centerCell + scan; cell += 1) {
        const bucket = enemyBuckets.get(cell);
        if (!bucket) continue;
        for (const other of bucket) {
          if (!other || other.removed || other.side === m.side || other.id === m.id) continue;
          const dx = other.x - m.x;
          const dy = other.y - m.y;
          const d2 = dx * dx + dy * dy;
          const reach = m.dragon
            ? 170
            : (m.gunner
                ? (m.gunRange || 220)
                : m.r + other.r + 24 + (m.digger ? 14 : 0) + (m.hero ? 24 : 0));
          if (d2 < bestSq && d2 < reach * reach) {
            target = other;
            bestSq = d2;
          }
        }
      }

      if (candleInReach && enemyCandle && (!target || candleDistSq <= bestSq * 0.8464)) {
        if (m.atkCd === 0) {
          if (m.dragon) {
            const mouthX = m.x + dir * (m.r * 0.95);
            const mouthY = m.y - m.r * 0.24;
            m.dragonBreathTtl = 0.24;
            m.dragonBreathToX = enemyCandle.x;
            m.dragonBreathToY = enemyCandle.y - 10;
            this.queueHitSfx('dragonfire', mouthX, mouthY, m.side);
            this.queueHitSfx('dragonfire', enemyCandle.x, enemyCandle.y - 10, m.side);
            m.atkCd = 0.98;
          } else if (m.gunner) {
            const muzzleX = m.x + dir * (m.r + 7);
            const muzzleY = m.y - 2;
            m.gunFlashTtl = 0.12;
            this.queueHitSfx('gunhit', muzzleX, muzzleY, m.side);
            this.queueHitSfx('gunhit', enemyCandle.x, enemyCandle.y - 9, m.side);
            m.atkCd = 0.66;
          } else if (m.rider) {
            m.atkCd = 0.72;
          } else if (m.hero) {
            m.atkCd = 0.46;
          } else if (m.digger) {
            m.atkCd = 1.2;
          } else {
            m.atkCd = 0.72;
          }
          this.hitCandleWithMinion(enemyCandle, m);
        }
      } else if (target) {
        if (m.atkCd === 0) {
          if (m.dragon) {
            this.dragonBreath(m, target, targetBuckets, MINION_TARGET_BUCKET_W);
            m.atkCd = 1.05;
          } else if (m.gunner) {
            this.gunnerShot(m, target, targetBuckets, MINION_TARGET_BUCKET_W);
            m.atkCd = 0.66;
          } else if (m.rider) {
            this.riderStrikeMinion(m, target);
            m.atkCd = 0.72;
          } else if (m.hero) {
            this.heroSlash(m, enemySideName, enemyX, targetBuckets, MINION_TARGET_BUCKET_W);
            m.atkCd = 0.46;
          } else if (m.digger) {
            this.dealMinionDamage(m, target, m.dmg, 'melee');
            m.atkCd = 1.18;
          } else {
            this.dealMinionDamage(m, target, m.dmg, 'melee');
            m.atkCd = 0.8;
          }
        }
      } else if (Math.abs(m.x - enemyX) < m.r + 20 + (m.flying ? 34 : 0) + (m.dragon ? 50 : 0) + (m.gunner ? Math.max(0, (m.gunRange || 0) - 40) : 0) + (m.rider ? 14 : 0) + (m.digger ? 8 : 0) + (m.hero ? 24 : 0)) {
        if (m.atkCd === 0) {
          if (m.dragon) {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg * 1.24, enemyX, TOWER_Y - 26);
            const mouthX = m.x + dir * (m.r * 0.95);
            const mouthY = m.y - m.r * 0.24;
            const impactX = enemyX;
            const impactY = TOWER_Y - 26;
            m.dragonBreathTtl = 0.24;
            m.dragonBreathToX = impactX;
            m.dragonBreathToY = impactY;
            this.queueHitSfx('dragonfire', mouthX, mouthY, m.side);
            this.queueHitSfx('dragonfire', impactX, impactY, m.side);
            m.atkCd = 0.92;
          } else if (m.gunner) {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg * 0.72, enemyX, TOWER_Y - 24);
            const muzzleX = m.x + dir * (m.r + 7);
            const muzzleY = m.y - 2;
            m.gunFlashTtl = 0.12;
            this.queueHitSfx('gunhit', muzzleX, muzzleY, m.side);
            this.queueHitSfx('gunhit', enemyX, TOWER_Y - 24, m.side);
            m.atkCd = 0.72;
          } else if (m.rider) {
            this.riderStrikeTower(m, enemySideName, enemyX, TOWER_Y - 18);
            m.atkCd = 0.72;
          } else if (m.hero) {
            this.heroSlash(m, enemySideName, enemyX, targetBuckets, MINION_TARGET_BUCKET_W);
            m.atkCd = 0.46;
          } else if (m.digger) {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg, enemyX, TOWER_Y - 10);
            m.atkCd = 1.22;
          } else {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg, enemyX, TOWER_Y - 18);
            m.atkCd = 0.65;
          }
        }
      } else {
        m.x += dir * m.speed * dt;
        if (m.flying) {
          const desiredY = TOWER_Y - 120 + (m.side === 'left' ? -16 : 16);
          m.flyBaseY += (desiredY - m.flyBaseY) * Math.min(1, dt * 2.2);
        }
      }
    }

    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const minion = this.minions[i];
      if (!minion) continue;
      if (minion.hp <= 0) this.killMinion(i, null);
    }
  }

  statArrowDamage(side) {
    return 20 + side.arrowLevel * 8;
  }

  statArrowCount(side) {
    return 1 + Math.floor((side.multiShotLevel - 1) / 2) + Math.max(0, side.volleyLevel || 0);
  }

  comboProgress(side) {
    return Math.max(0, Math.min(1, (side.comboHitStreak || 0) / 10));
  }

  comboTier(side) {
    const streak = Math.max(0, Math.min(10, side?.comboHitStreak || 0));
    if (streak >= 10) return 4;
    if (streak >= 7) return 3;
    if (streak >= 4) return 2;
    return 1;
  }

  comboMultiplier(side) {
    return this.comboTier(side);
  }

  hasMaxCombo(side) {
    return Math.max(0, side?.comboHitStreak || 0) >= 10;
  }

  markArrowHit(arrow) {
    if (!arrow || !arrow.mainArrow || arrow.comboCounted) return;
    arrow.comboCounted = true;
    const side = arrow.side === 'left' ? this.left : this.right;
    side.arrowHits = (side.arrowHits || 0) + 1;
    side.comboHitStreak = Math.min(10, (side.comboHitStreak || 0) + 1);
  }

  markArrowMiss(arrow) {
    if (!arrow || !arrow.mainArrow || arrow.comboCounted) return;
    const side = arrow.side === 'left' ? this.left : this.right;
    side.comboHitStreak = 0;
  }

  applyMaxComboSplash(arrow, target, baseDamage, minionBuckets = null) {
    if (!arrow?.mainArrow || !target) return;
    const side = arrow.side === 'left' ? this.left : this.right;
    if (!this.hasMaxCombo(side)) return;

    const splash = Math.max(1, baseDamage * 0.34);
    const splashR = 76;
    const victims = [];
    this.forEachEnemyMinionInRadius(
      arrow.side,
      target.x,
      target.y,
      splashR,
      minionBuckets,
      ARROW_TARGET_BUCKET_W,
      (other) => {
        if (other.id === target.id) return;
        victims.push(other);
      }
    );

    if (!victims.length) return;
    this.queueHitSfx('explosion', target.x, target.y, arrow.side);

    for (const victim of victims) {
      if (!victim || victim.removed || victim.side === arrow.side || victim.id === target.id) continue;
      this.dealDamageToMinion(victim, splash);
      if (victim.hp <= 0) this.killMinionByRef(victim, arrow.side, { goldScalar: 0.75 });
    }
  }

  applyFlameArrowImpact(arrow, target, baseDamage, minionBuckets = null) {
    if (!arrow || arrow.powerType !== 'flameShot' || !target) return;

    const burnDamage = Math.max(1, baseDamage * (Number(arrow.flameBurn) || 0.18));
    this.dealDamageToMinion(target, burnDamage);

    const splashDamage = Math.max(1, baseDamage * (Number(arrow.flameSplash) || 0.24));
    const splashR = 68;
    const victims = [];
    this.queueHitSfx('dragonfire', target.x, target.y, arrow.side);
    this.forEachEnemyMinionInRadius(
      arrow.side,
      target.x,
      target.y,
      splashR,
      minionBuckets,
      ARROW_TARGET_BUCKET_W,
      (other) => {
        if (other.id === target.id) return;
        victims.push(other);
      }
    );

    if (!victims.length) return;

    for (const victim of victims) {
      if (!victim || victim.removed || victim.side === arrow.side || victim.id === target.id) continue;
      this.dealDamageToMinion(victim, splashDamage);
      if (victim.hp <= 0) this.killMinionByRef(victim, arrow.side, { goldScalar: 0.8 });
    }
  }

  dealDamageToMinion(minion, amount) {
    if (!minion) return 0;
    const dmg = Math.max(0, Number(amount) || 0);
    if (dmg <= 0) return 0;
    minion.hp -= dmg;
    this.queueDamageNumber(dmg, minion.x, minion.y - Math.max(8, minion.r * 0.25));
    return dmg;
  }

  minionDamageMultiplier(attacker, target, source = 'melee') {
    if (!target) return 1;
    let mul = 1;

    if (source === 'melee') {
      if (target.dragon || target.flying) mul *= 0.72; // Harder for ground units to connect.
      if (target.gunner) mul *= 1.2; // Melee pressure counters ranged units.
      if (target.summoned) mul *= 1.1;
      if (target.super) mul *= 0.9;
      if (attacker && attacker.super && target.gunner) mul *= 1.14;
    } else if (source === 'dragonfire') {
      if (target.gunner) mul *= 1.28;
      if (target.necrominion || target.summoned) mul *= 1.22;
      if (target.explosive) mul *= 1.12;
      if (target.dragon) mul *= 0.9;
      if (target.super) mul *= 0.9;
    } else if (source === 'gunshot') {
      if (target.super) mul *= 0.82;
      if (target.explosive) mul *= 1.25;
      if (target.summoned) mul *= 1.15;
      if (target.gunner) mul *= 0.96;
    } else if (source === 'explosion') {
      if (target.dragon || target.flying) mul *= 0.65;
      if (target.summoned) mul *= 1.2;
      if (target.super) mul *= 0.86;
      if (target.explosive) mul *= 0.92;
    }

    return clamp(mul, 0.45, 2.4);
  }

  dealMinionDamage(attacker, target, amount, source = 'melee') {
    if (!target) return 0;
    const base = Math.max(0, Number(amount) || 0);
    if (base <= 0) return 0;
    const buffed = base * this.presidentAuraMultiplier(attacker);
    const scaled = buffed * this.minionDamageMultiplier(attacker, target, source);
    return this.dealDamageToMinion(target, scaled);
  }

  presidentAuraMultiplier(attacker) {
    if (!attacker || !attacker.side) return 1;
    let mul = 1;
    const sideName = attacker.side === 'right' ? 'right' : 'left';
    const presidents = Array.isArray(this.activePresidents?.[sideName])
      ? this.activePresidents[sideName]
      : [];
    for (const m of presidents) {
      if (!m || m.removed || !m.president || m.side !== sideName || !m.presidentSetup) continue;
      const dx = attacker.x - m.x;
      const dy = attacker.y - m.y;
      const auraR = Math.max(110, Number(m.presidentAuraRadius) || 190);
      if (dx * dx + dy * dy > auraR * auraR) continue;
      mul = Math.max(mul, Number(m.presidentAuraMult) || 1.24);
    }
    return mul;
  }

  minionOutgoingDamage(attacker, amount) {
    const base = Math.max(0, Number(amount) || 0);
    if (base <= 0) return 0;
    return base * this.presidentAuraMultiplier(attacker);
  }

  applyMinionTowerDamage(attacker, sideName, amount, x = null, y = null) {
    return this.dealDamageToTower(sideName, this.minionOutgoingDamage(attacker, amount), x, y, 'unit');
  }

  dealDamageToTower(sideName, amount, x = null, y = null, hitFx = null) {
    const side = this[sideName];
    if (!side) return 0;
    const dmg = Math.max(0, Number(amount) || 0);
    if (dmg <= 0) return 0;
    const firstDamage = !side.towerDamagedOnce;
    side.towerHp -= dmg;
    if (firstDamage) side.towerDamagedOnce = true;
    const tx = Number.isFinite(x) ? x : (sideName === 'left' ? TOWER_X_LEFT : TOWER_X_RIGHT);
    const ty = Number.isFinite(y) ? y : (TOWER_Y - 100);
    this.queueDamageNumber(dmg, tx, ty);
    if (hitFx === 'unit') this.queueHitSfx('towerhit', tx, ty, sideName);
    if (firstDamage) this.triggerTowerHeroRescue(sideName, tx, ty);
    return dmg;
  }

  healMinion(minion, amount) {
    if (!minion) return 0;
    const raw = Math.max(0, Number(amount) || 0);
    if (raw <= 0) return 0;
    const missing = Math.max(0, (Number(minion.maxHp) || 0) - (Number(minion.hp) || 0));
    if (missing <= 0) return 0;
    const healed = Math.min(missing, raw);
    minion.hp += healed;
    return healed;
  }

  allyFrontX(sideName, excludeId = null) {
    let front = null;

    for (const m of this.minions) {
      if (!m || m.side !== sideName || m.id === excludeId) continue;
      if (m.monk || m.president) continue;
      if (front == null) front = m.x;
      else front = sideName === 'left' ? Math.max(front, m.x) : Math.min(front, m.x);
    }

    if (front != null) return front;

    for (const m of this.minions) {
      if (!m || m.side !== sideName || m.id === excludeId) continue;
      if (front == null) front = m.x;
      else front = sideName === 'left' ? Math.max(front, m.x) : Math.min(front, m.x);
    }

    return front;
  }

  statMinionDamage(side) {
    return 12 + side.unitLevel * 6 + side.economyLevel * 3;
  }

  statMinionHp(side) {
    return 75 + side.unitHpLevel * 30 + side.economyLevel * 18;
  }

  statSpawnEvery(side) {
    return Math.max(0.65, 2.2 - side.spawnLevel * 0.09);
  }

  statDragonEvery(side) {
    if (side.dragonLevel <= 0) return Infinity;
    return Math.max(12, 28 - side.dragonLevel * 3);
  }

  statGunnerEvery(side) {
    const tech = Math.floor((side.unitLevel + side.arrowLevel + side.economyLevel) / 6);
    return Math.max(9, 13 - tech);
  }

  statRiderEvery(side) {
    const cavalryTech = Math.floor((side.unitLevel + side.spawnLevel + side.economyLevel) / 5);
    return Math.max(7, 12 - cavalryTech);
  }

  statDiggerEvery(side) {
    const burrowTech = Math.floor((side.unitHpLevel + side.spawnLevel + side.economyLevel) / 6);
    return Math.max(9, 16 - burrowTech);
  }

  statMonkEvery(side) {
    const supportTech = Math.floor((side.unitHpLevel + side.powerLevel + side.resourceLevel) / 7);
    return Math.max(11, 19 - supportTech);
  }

  statHeroEvery(side) {
    const mythicTech = Math.floor((side.unitLevel + side.powerLevel + side.economyLevel) / 7);
    return Math.max(15, 24 - mythicTech);
  }

  statPresidentEvery(side) {
    const civicTech = Math.floor((side.economyLevel + side.resourceLevel + side.powerLevel) / 6);
    return Math.max(17, 27 - civicTech);
  }

  statNecroEvery() {
    return 8;
  }

  statSuperEvery(side) {
    if (side.superMinionLevel <= 0) return Infinity;
    return Math.max(3, 11 - side.superMinionLevel * 2);
  }

  dragonHeartCore(minion) {
    if (!minion.dragon) return null;
    const dir = minion.side === 'left' ? 1 : -1;
    return {
      x: minion.x + dir * (minion.r * 0.34),
      y: minion.y - minion.r * 0.14,
      r: Math.max(7, minion.r * 0.3),
    };
  }

  dragonBreath(dragon, target, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    const base = dragon.dmg * 1.22;
    const splash = base * 0.44;
    const splashR = 72;
    const dir = dragon.side === 'left' ? 1 : -1;
    const mouthX = dragon.x + dir * (dragon.r * 0.95);
    const mouthY = dragon.y - dragon.r * 0.24;
    this.dealMinionDamage(dragon, target, base, 'dragonfire');
    dragon.dragonBreathTtl = 0.24;
    dragon.dragonBreathToX = target.x;
    dragon.dragonBreathToY = target.y;
    this.queueHitSfx('dragonfire', mouthX, mouthY, dragon.side);
    this.queueHitSfx('dragonfire', target.x, target.y, dragon.side);

    this.forEachEnemyMinionInRadius(
      dragon.side,
      target.x,
      target.y,
      splashR,
      minionBuckets,
      bucketW,
      (other) => {
        if (other.id === target.id) return;
        this.dealMinionDamage(dragon, other, splash, 'dragonfire');
      }
    );
  }

  gunnerShot(gunner, target, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    const dir = gunner.side === 'left' ? 1 : -1;
    const muzzleX = gunner.x + dir * (gunner.r + 7);
    const muzzleY = gunner.y - 2;
    const dragonMul = Number.isFinite(gunner.gunDragonMul) ? gunner.gunDragonMul : 2;
    const damage = gunner.dmg * (target.dragon ? dragonMul : 1.06);
    const splash = damage * 0.2;
    const splashR = 42;

    this.dealMinionDamage(gunner, target, damage, 'gunshot');
    gunner.gunFlashTtl = 0.14;
    this.queueHitSfx('gunhit', muzzleX, muzzleY, gunner.side);
    this.queueHitSfx('gunhit', target.x, target.y, gunner.side);

    this.forEachEnemyMinionInRadius(
      gunner.side,
      target.x,
      target.y,
      splashR,
      minionBuckets,
      bucketW,
      (other) => {
        if (other.id === target.id) return;
        this.dealMinionDamage(gunner, other, splash, 'gunshot');
      }
    );
  }

  riderHitDamage(rider, hitX = null, hitY = null) {
    const base = Math.max(0, Number(rider?.dmg) || 0);
    if (!rider || !rider.rider || !rider.riderChargeReady) return base;

    rider.riderChargeReady = false;
    const originX = Number.isFinite(rider.riderChargeStartX) ? rider.riderChargeStartX : rider.x;
    const distance = Math.abs(rider.x - originX);
    const threshold = Math.max(90, Number(rider.riderChargeDistance) || 170);
    if (distance < threshold) return base;

    const mul = Math.max(1.4, Number(rider.riderChargeMul) || 2.2);
    if (Number.isFinite(hitX) && Number.isFinite(hitY)) this.queueHitSfx('powerup', hitX, hitY, rider.side);
    return base * mul;
  }

  riderStrikeMinion(rider, target) {
    const damage = this.riderHitDamage(rider, target?.x, target?.y);
    this.dealMinionDamage(rider, target, damage, 'melee');
  }

  riderStrikeTower(rider, enemySideName, x, y) {
    const damage = this.riderHitDamage(rider, x, y);
    this.applyMinionTowerDamage(rider, enemySideName, damage, x, y);
  }

  heroSlash(hero, enemySideName, enemyX, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!hero || !hero.hero) return;
    const slashR = Math.max(70, Number(hero.heroSlashRadius) || 88);
    const damage = this.minionOutgoingDamage(hero, hero.dmg * 0.96);
    let hitAny = false;
    const victims = [];
    this.forEachEnemyMinionInRadius(
      hero.side,
      hero.x,
      hero.y,
      slashR,
      minionBuckets,
      bucketW,
      (other) => {
        if (other.id === hero.id) return;
        victims.push(other);
      }
    );

    for (const other of victims) {
      if (!other || other.removed || other.side === hero.side || other.id === hero.id) continue;
      hitAny = true;
      this.dealMinionDamage(hero, other, damage, 'melee');
      if (other.hp <= 0) this.killMinionByRef(other, hero.side, { goldScalar: 0.9 });
    }

    if (Math.abs(hero.x - enemyX) <= slashR + 10) {
      hitAny = true;
      this.dealDamageToTower(enemySideName, damage * 0.72, enemyX, TOWER_Y - 16, 'unit');
    }

    this.queueHitSfx('powerup', hero.x, hero.y - 8, hero.side);
    if ((hitAny || hero.atkCd === 0) && (hero.heroLineCd || 0) === 0) {
      this.queueLine(randomFrom(HERO_LINES), hero.x, hero.y - hero.r - 26, hero.side);
      hero.heroLineCd = 0.38;
    }
  }

  tickMonk(monk, dt) {
    if (!monk || !monk.monk) return;
    if (!Number.isFinite(monk.monkAge)) monk.monkAge = 0;
    monk.monkAge += dt;

    const minScale = Math.max(0.16, Number(monk.monkHealMinScale) || 0.24);
    const decayPerSec = Math.max(0, Number(monk.monkHealDecayPerSec) || 0.014);
    if (!Number.isFinite(monk.monkHealScale) || monk.monkHealScale <= 0) monk.monkHealScale = 1;
    monk.monkHealScale = Math.max(minScale, monk.monkHealScale - decayPerSec * dt);

    const dir = monk.side === 'left' ? 1 : -1;
    const homeX = monk.side === 'left' ? TOWER_X_LEFT + 78 : TOWER_X_RIGHT - 78;
    const enemyX = monk.side === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
    const allyFrontX = this.allyFrontX(monk.side, monk.id);
    const frontRef = Number.isFinite(allyFrontX) ? allyFrontX : homeX + dir * 120;
    const keepBehind = Math.max(90, Number(monk.monkKeepBehind) || 140);

    let desiredX = frontRef - dir * keepBehind;
    desiredX = clamp(desiredX, TOWER_X_LEFT + 56, TOWER_X_RIGHT - 56);
    const advanceLimit = enemyX - dir * 110;
    if (monk.side === 'left') desiredX = Math.min(desiredX, advanceLimit);
    else desiredX = Math.max(desiredX, advanceLimit);
    if (monk.side === 'left') desiredX = Math.max(desiredX, homeX);
    else desiredX = Math.min(desiredX, homeX);

    const xDelta = desiredX - monk.x;
    const moveStep = Math.max(26, monk.speed * 0.9) * dt;
    if (Math.abs(xDelta) > 1.6) monk.x += clamp(xDelta, -moveStep, moveStep);

    const healRange = Math.max(90, Number(monk.monkHealRange) || 170);
    const healR2 = healRange * healRange;
    let target = null;
    let bestScore = -Infinity;
    let desiredY = monk.y;

    for (const ally of this.minions) {
      if (!ally || ally.side !== monk.side || ally.id === monk.id) continue;
      const missing = Math.max(0, (Number(ally.maxHp) || 0) - (Number(ally.hp) || 0));
      if (missing <= 0.5) continue;
      const dx = ally.x - monk.x;
      const dy = ally.y - monk.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > healR2) continue;

      const dist = Math.sqrt(d2);
      const missingPct = missing / Math.max(1, ally.maxHp || 1);
      const frontBias = ally.side === 'left' ? (ally.x / WORLD_W) : ((WORLD_W - ally.x) / WORLD_W);
      const score = missingPct * 1.5 + (1 - dist / healRange) * 0.7 + frontBias * 0.24;
      if (score > bestScore) {
        bestScore = score;
        target = ally;
        desiredY = ally.y;
      }
    }

    desiredY = clamp(desiredY, TOWER_Y - 130, TOWER_Y + 140);
    monk.y += (desiredY - monk.y) * Math.min(1, dt * 2.8);

    if (!target || monk.atkCd > 0) return;

    const baseHeal = Math.max(12, Number(monk.monkHealBase) || Math.max(32, monk.maxHp * 0.48));
    let heal = baseHeal * Math.max(minScale, monk.monkHealScale || 1);
    if (monk.monkFirstHeal) {
      heal *= Math.max(2, Number(monk.monkFirstHealMul) || 2.8);
      monk.monkFirstHeal = false;
    }

    const healed = this.healMinion(target, heal);
    if (healed <= 0) return;

    const stepDecay = Math.max(0.55, Math.min(0.99, Number(monk.monkHealStepDecay) || 0.86));
    monk.monkHealScale = Math.max(minScale, monk.monkHealScale * stepDecay);
    monk.atkCd = Math.max(0.3, Number(monk.monkHealCd) || 0.92);
    this.queueHitSfx('powerup', monk.x, monk.y - 6, monk.side);
    this.queueHitSfx('powerup', target.x, target.y - Math.max(8, target.r * 0.2), monk.side);
  }

  tickPresident(president, dt) {
    if (!president || !president.president) return;
    if (president.presidentSpeechCd > 0) {
      president.presidentSpeechCd = Math.max(0, president.presidentSpeechCd - dt);
    }

    const tx = Number.isFinite(president.presidentPodiumX) ? president.presidentPodiumX : president.x;
    const ty = Number.isFinite(president.presidentPodiumY) ? president.presidentPodiumY : president.y;
    const dx = tx - president.x;
    const dy = ty - president.y;
    const d = Math.hypot(dx, dy);
    const moveSpeed = Math.max(18, president.speed * 0.72);

    if (!president.presidentSetup) {
      if (d > 2.2) {
        const step = Math.min(d, moveSpeed * dt);
        const nx = d > 0 ? dx / d : 0;
        const ny = d > 0 ? dy / d : 0;
        president.x += nx * step;
        president.y += ny * step;
      } else {
        president.x = tx;
        president.y = ty;
        president.presidentSetup = true;
        const sideName = president.side === 'right' ? 'right' : 'left';
        if (this.activePresidents?.[sideName] && !this.activePresidents[sideName].includes(president)) {
          this.activePresidents[sideName].push(president);
        }
        president.presidentSpeechCd = 0.2;
        this.queueHitSfx('upgrade', president.x, president.y - 4, president.side);
        this.queueLine('Citizens, we stand together!', president.x, president.y - president.r - 28, president.side);
      }
      return;
    }

    if (president.presidentSpeechCd === 0) {
      this.queueLine(
        randomFrom(PRESIDENT_LINES),
        president.x,
        president.y - president.r - 28,
        president.side
      );
      president.presidentSpeechCd = 2.2 + Math.random() * 2.2;
      this.queueHitSfx('powerup', president.x, president.y - 8, president.side);
    }
  }

  triggerTowerHeroRescue(sideName, x, y) {
    const side = this[sideName];
    if (!side || side.towerHeroRescueUsed) return;
    side.towerHeroRescueUsed = true;

    const hero = this.spawnMinion(sideName, { forceType: 'hero', countSpawn: false });
    const hx = hero?.x ?? (sideName === 'left' ? TOWER_X_LEFT + 58 : TOWER_X_RIGHT - 58);
    const hy = hero?.y ?? (TOWER_Y + 6);
    this.queueHitSfx('powerup', x, y, sideName);
    this.queueHitSfx('upgrade', hx, hy, sideName);
    this.queueLine('I will save the day.', hx, hy - (hero?.r || 16) - 24, sideName);
  }

  awardMinionKillGold(killerSide, scalar = 1) {
    if (killerSide === 'left') this.left.gold += this.goldFromMinionKill(this.left, scalar);
    else if (killerSide === 'right') this.right.gold += this.goldFromMinionKill(this.right, scalar);
  }

  killMinion(index, killerSide = null, options = {}) {
    const minion = this.minions[index];
    if (!minion) return;

    const {
      goldScalar = 1,
      triggerExplosion = false,
      impactDamage = null,
    } = options;

    this.awardMinionKillGold(killerSide, goldScalar);
    if (minion.hero) this.triggerHeroDramaticDeath(minion, killerSide);
    minion.removed = true;
    this.minions.splice(index, 1);

    if (triggerExplosion && minion.explosive) {
      this.explodeMinion(
        minion.id,
        minion.x,
        minion.y,
        killerSide,
        minion.explosiveLevel || 1,
        impactDamage,
        minion.side
      );
    }

    if (minion.necrominion) this.raiseNecroServants(minion);
  }

  killMinionByRef(minion, killerSide = null, options = {}) {
    if (!minion || minion.removed) return false;
    const index = this.minions.indexOf(minion);
    if (index < 0) return false;
    this.killMinion(index, killerSide, options);
    return true;
  }

  triggerHeroDramaticDeath(hero, killerSide = null) {
    if (!hero || !hero.hero) return;
    const x = Number(hero.x) || 0;
    const y = Number(hero.y) || 0;
    const fxSide = (killerSide === 'left' || killerSide === 'right') ? killerSide : hero.side;
    const pulse = [
      { dx: 0, dy: -6 },
      { dx: -16, dy: -2 },
      { dx: 16, dy: -2 },
      { dx: 0, dy: 10 },
    ];
    for (const p of pulse) {
      this.queueHitSfx('explosion', x + p.dx, y + p.dy, fxSide);
    }
    this.queueHitSfx('dragonfire', x - 9, y - 12, fxSide);
    this.queueHitSfx('dragonfire', x + 10, y - 8, fxSide);
    this.queueHitSfx('powerup', x, y - 5, hero.side);
    this.queueDamageNumber(Math.max(77, (Number(hero.maxHp) || 0) * 0.24), x, y - (hero.r || 16) - 6);
    this.queueLine(randomFrom(HERO_DEATH_LINES), x, y - (hero.r || 16) - 27, hero.side);
    this.queueLine('Cue the tragic violin solo!', x, y - (hero.r || 16) - 45, hero.side);
  }

  raiseNecroServants(minion) {
    const servantCount = minion.super ? 6 : 4;
    const ring = minion.r + 22;
    const baseHp = Math.max(30, minion.maxHp * 0.38);
    const baseDmg = Math.max(7, minion.dmg * 0.42);
    const speed = Math.max(56, minion.speed * 1.14);
    const radius = Math.max(10, minion.r * 0.52);
    const tier = Math.max(0, Math.min(2, (minion.tier || 0) - 1));
    const level = Math.max(1, Math.floor((minion.level || 1) * 0.55));

    this.queueHitSfx('powerup', minion.x, minion.y, minion.side);

    for (let i = 0; i < servantCount; i += 1) {
      const angle = (Math.PI * 2 * i) / servantCount + Math.random() * 0.45;
      const radial = ring + (Math.random() * 14 - 7);
      const x = clamp(minion.x + Math.cos(angle) * radial, TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);
      const y = clamp(minion.y + Math.sin(angle) * Math.min(28, ring * 0.55), TOWER_Y - 170, TOWER_Y + 170);

      this.minions.push({
        id: this.seq++,
        side: minion.side,
        x,
        y,
        hp: baseHp,
        maxHp: baseHp,
        dmg: baseDmg,
        speed,
        atkCd: Math.random() * 0.18,
        r: radius,
        tier,
        level,
        super: false,
        explosive: false,
        explosiveLevel: 1,
        necrominion: false,
        summoned: true,
        dragon: false,
        flying: false,
        gunner: false,
        rider: false,
        riderChargeReady: false,
        riderChargeStartX: null,
        riderChargeDistance: 0,
        riderChargeMul: 1,
        digger: false,
        digPhase: null,
        digBaseY: null,
        monk: false,
        monkAge: 0,
        monkHealBase: 0,
        monkHealRange: 0,
        monkHealCd: 0,
        monkHealScale: 0,
        monkHealMinScale: 0,
        monkHealDecayPerSec: 0,
        monkHealStepDecay: 1,
        monkFirstHeal: false,
        monkFirstHealMul: 1,
        monkKeepBehind: 0,
        hero: false,
        heroArrowHits: 0,
        heroSlashRadius: 0,
        heroLineCd: 0,
        heroSwing: 0,
        heroRetreating: false,
        heroRetreatHpPct: 0,
        heroReturnHpPct: 0,
        heroHealPerSec: 0,
        president: false,
        presidentSetup: false,
        presidentPodiumX: null,
        presidentPodiumY: null,
        presidentAuraRadius: 0,
        presidentAuraMult: 1,
        presidentSpeechCd: 0,
        gunRange: 0,
        gunDragonMul: 1,
        gunFlashTtl: 0,
        candleCarrier: false,
        candleCarrierSide: null,
        candleBurnTtl: 0,
        candleBurnTick: 0,
      });
    }
  }

  normalizePull(sideName, x, y) {
    let nx = Number.isFinite(x) ? x : 0;
    let ny = Number.isFinite(y) ? y : 0;
    if (sideName === 'left') nx = Math.min(nx, 0);
    else nx = Math.max(nx, 0);
    ny = Math.min(ny, 0);

    const mag = Math.hypot(nx, ny) || 1;
    if (mag > 1) {
      nx /= mag;
      ny /= mag;
    }
    return { x: nx, y: ny };
  }

  addArrowFromPull(sideName, archerSlot = 0) {
    const side = this[sideName];
    const sx = sideName === 'left' ? TOWER_X_LEFT + 35 : TOWER_X_RIGHT - 35;
    const slot = Math.max(0, Math.min(this.archersPerSide - 1, Math.floor(archerSlot)));
    const control = this.ensureArcherControl(sideName, slot);
    if (!control) return;
    const pull = this.normalizePull(sideName, control.pullX, control.pullY);
    control.pullX = pull.x;
    control.pullY = pull.y;
    control.archerAimY = ARCHER_ORIGIN_Y - slot * ARCHER_VERTICAL_GAP;
    this.syncSidePrimaryPull(sideName);

    const sy = ARCHER_ORIGIN_Y - slot * ARCHER_VERTICAL_GAP;
    const launch = launchFromPull(sideName, pull.x, pull.y);
    const forwardSign = sideName === 'left' ? 1 : -1;
    const comboMul = this.comboMultiplier(side);

    let count = this.statArrowCount(side);
    let spread = 0.032 + Math.min(0.02, Math.max(0, count - 1) * 0.0025);
    let speed = 230 + launch.strength * 380;
    speed *= 1.5;
    const chargeMul = 0.55 + launch.strength * 0.95;
    let dmgMul = 1;
    let radius = 4;
    let pierce = 0;
    let flameSplash = 0;
    let flameBurn = 0;
    let gravity = 980 - launch.strength * 220;
    let powerType = null;
    const powerScale = 1 + (side.powerLevel - 1) * 0.18;
    const activePower = side.pendingShotPowerShots > 0 ? side.pendingShotPower : null;

    if (activePower === 'multiShot') {
      count += 2 + Math.floor(powerScale * 2);
      spread = 0.05;
      powerType = 'multiShot';
    } else if (activePower === 'ultraShot') {
      dmgMul = 2.2 + powerScale * 0.8;
      speed += 70 + powerScale * 36;
      radius = 6;
      gravity = Math.max(620, gravity - 150);
      powerType = 'ultraShot';
    } else if (activePower === 'pierceShot') {
      pierce = 2 + Math.floor(powerScale * 2);
      speed += 50 + powerScale * 25;
      powerType = 'pierceShot';
    } else if (activePower === 'flameShot') {
      dmgMul = 1.32 + powerScale * 0.44;
      radius = 5 + Math.floor(powerScale * 0.45);
      flameSplash = 0.2 + powerScale * 0.07;
      flameBurn = 0.16 + powerScale * 0.06;
      powerType = 'flameShot';
    }
    count = Math.min(29, count);
    if (count > 1 && count % 2 === 0) count += 1;
    const mainIndex = Math.floor(count / 2);
    if (activePower) {
      side.pendingShotPowerShots = Math.max(0, side.pendingShotPowerShots - 1);
      if (side.pendingShotPowerShots === 0) side.pendingShotPower = null;
    } else {
      side.pendingShotPower = null;
      side.pendingShotPowerShots = 0;
    }

    for (let i = 0; i < count; i += 1) {
      const isMainArrow = i === mainIndex;
      const localAngle = Math.max(
        0,
        Math.min(Math.PI / 2, launch.angle + (i - (count - 1) / 2) * spread)
      );
      const vx = Math.cos(localAngle) * speed * forwardSign;
      const vy = -Math.sin(localAngle) * speed;
      if (isMainArrow) side.arrowsFired = (side.arrowsFired || 0) + 1;
      const sideArrowMul = count > 1 && !isMainArrow ? 0.25 : 1;
      this.arrows.push({
        id: this.seq++,
        side: sideName,
        x: sx,
        y: sy,
        vx,
        vy,
        dmg: this.statArrowDamage(side) * dmgMul * chargeMul * comboMul * sideArrowMul,
        ttl: 3.5,
        r: isMainArrow ? radius + 1.4 : radius,
        pierce,
        powerType,
        flameSplash,
        flameBurn,
        gravity,
        mainArrow: isMainArrow,
        comboTier: comboMul,
      });
    }
  }

  spawnMinion(sideName, options = {}) {
    const {
      forceType = null,
      countSpawn = true,
    } = options;
    const side = this[sideName];
    if (countSpawn) side.spawnCount += 1;
    const x = sideName === 'left' ? TOWER_X_LEFT + 56 : TOWER_X_RIGHT - 56;
    let hp = this.statMinionHp(side);
    let dmg = this.statMinionDamage(side);
    let speed = 54 + side.unitLevel * 1.5 + side.economyLevel * 0.6;
    const power = side.unitLevel + side.unitHpLevel + side.economyLevel;
    let tier = Math.min(3, Math.floor(power / 8));
    const dragonEvery = this.statDragonEvery(side);
    const isDragon = forceType === 'dragon' || (!forceType && Number.isFinite(dragonEvery) && side.spawnCount % dragonEvery === 0);
    const diggerEvery = this.statDiggerEvery(side);
    // Digger should claim its spawn interval before other specialist rolls.
    const isDigger = forceType === 'digger'
      || (!forceType && !isDragon && side.spawnCount % diggerEvery === 0);
    const necroEvery = this.statNecroEvery(side);
    const isNecrominion = forceType === 'necrominion'
      || (!forceType && !isDragon && !isDigger && side.spawnCount % necroEvery === 0);
    const gunnerEvery = this.statGunnerEvery(side);
    const isGunner = forceType === 'gunner'
      || (!forceType && !isDragon && !isDigger && !isNecrominion && side.spawnCount % gunnerEvery === 0);
    const riderEvery = this.statRiderEvery(side);
    const isRider = forceType === 'rider'
      || (!forceType && !isDragon && !isDigger && !isNecrominion && !isGunner && side.spawnCount % riderEvery === 0);
    const monkEvery = this.statMonkEvery(side);
    const isMonk = forceType === 'monk'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && !isRider && !isDigger && side.spawnCount % monkEvery === 0);
    const heroEvery = this.statHeroEvery(side);
    const isHero = forceType === 'hero'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && !isRider && !isDigger && !isMonk && side.spawnCount % heroEvery === 0);
    const presidentEvery = this.statPresidentEvery(side);
    const isPresident = forceType === 'president'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && !isRider && !isDigger && !isMonk && !isHero && side.spawnCount % presidentEvery === 0);
    const superEvery = this.statSuperEvery(side);
    const isSuper = forceType === 'super'
      || (!forceType && !isDragon && !isGunner && !isRider && !isDigger && !isMonk && !isHero && !isPresident && Number.isFinite(superEvery) && side.spawnCount % superEvery === 0);
    const explosive = false;
    let radius = 16;
    let visualPower = power;
    let spawnY = TOWER_Y + (Math.random() * 110 - 55);

    if (isSuper) {
      const levelBoost = Math.max(1, side.superMinionLevel);
      hp *= 2.2 + levelBoost * 0.28;
      dmg *= 2 + levelBoost * 0.24;
      speed *= 0.84 + Math.min(0.12, levelBoost * 0.02);
      radius = 32;
      tier = Math.min(3, tier + 1);
      visualPower = power + 8 + levelBoost * 3;
    }

    if (isNecrominion) {
      hp *= 1.26;
      dmg *= 0.92;
      speed *= 0.9;
      radius = Math.max(radius, 20);
      tier = Math.min(3, tier + 1);
      visualPower += 6;
    }

    if (isGunner) {
      const gunScale = 1 + (side.arrowLevel - 1) * 0.08;
      hp *= 0.82;
      dmg *= 1.22 * gunScale;
      speed *= 0.94;
      radius = Math.max(14, radius - 1);
      visualPower += 6 + Math.floor(gunScale * 2);
    }

    if (isRider) {
      hp *= 0.9;
      dmg *= 1.08 + Math.min(0.18, side.unitLevel * 0.012);
      speed *= 1.52;
      radius = Math.max(18, radius + 1);
      visualPower += 7;
    }

    if (isDigger) {
      hp *= 0.62;
      dmg *= 0.58;
      speed *= 0.34;
      radius = Math.max(12, radius - 2);
      visualPower += 2;
      spawnY = TOWER_Y + 102 + (Math.random() * 32 - 16);
    }

    if (isMonk) {
      hp *= 0.98;
      dmg *= 0.12;
      speed *= 0.94;
      radius = Math.max(18, radius + 1);
      tier = Math.min(3, tier + 1);
      visualPower += 8;
      spawnY = TOWER_Y + (Math.random() * 40 - 20);
    }

    if (isHero) {
      hp *= 1.12 * HERO_HP_MULT;
      dmg *= 0.9;
      speed *= 1.02;
      radius = Math.max(20, radius + 2);
      tier = Math.min(3, tier + 1);
      visualPower += 11;
    }

    if (isPresident) {
      hp *= 1.46;
      dmg *= 0.45;
      speed *= 0.86;
      radius = Math.max(18, radius + 1);
      tier = Math.min(3, tier + 1);
      visualPower += 9;
      spawnY = TOWER_Y + 34 + (Math.random() * 18 - 9);
    }

    if (isDragon) {
      const dragonBoost = Math.max(1, side.dragonLevel);
      hp *= 1.9 + dragonBoost * 0.32;
      dmg *= 1.45 + dragonBoost * 0.16;
      speed *= 1.18 + Math.min(0.22, dragonBoost * 0.04);
      radius = Math.max(radius, 26);
      tier = Math.min(3, tier + 1);
      visualPower += 11 + dragonBoost * 2;
      spawnY = TOWER_Y - 124 + (Math.random() * 70 - 35);
    }

    const created = {
      id: this.seq++,
      side: sideName,
      x,
      y: spawnY,
      hp,
      maxHp: hp,
      dmg,
      speed,
      atkCd: 0,
      r: radius,
      tier,
      level: visualPower,
      super: isSuper,
      explosive,
      explosiveLevel: side.explosiveLevel,
      necrominion: isNecrominion,
      summoned: false,
      dragon: isDragon,
      flying: isDragon,
      flyBaseY: isDragon ? spawnY : null,
      flyPhase: isDragon ? Math.random() * Math.PI * 2 : null,
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunner: isGunner,
      rider: isRider,
      riderChargeReady: isRider,
      riderChargeStartX: isRider ? x : null,
      riderChargeDistance: isRider ? (165 + side.spawnLevel * 5) : 0,
      riderChargeMul: isRider ? (2.05 + Math.min(0.35, side.unitLevel * 0.02)) : 1,
      digger: isDigger,
      digPhase: isDigger ? Math.random() * Math.PI * 2 : null,
      digBaseY: isDigger ? spawnY : null,
      monk: isMonk,
      monkAge: 0,
      monkHealBase: isMonk ? Math.max(34, hp * 0.46) : 0,
      monkHealRange: isMonk ? (172 + side.powerLevel * 5 + side.unitHpLevel * 4) : 0,
      monkHealCd: isMonk ? 0.94 : 0,
      monkHealScale: isMonk ? 1 : 0,
      monkHealMinScale: isMonk ? 0.24 : 0,
      monkHealDecayPerSec: isMonk ? 0.014 : 0,
      monkHealStepDecay: isMonk ? 0.86 : 1,
      monkFirstHeal: isMonk,
      monkFirstHealMul: isMonk ? 2.8 : 1,
      monkKeepBehind: isMonk ? (138 + side.spawnLevel * 3) : 0,
      hero: isHero,
      heroArrowHits: 0,
      heroSlashRadius: isHero ? (84 + side.unitLevel * 2.4) : 0,
      heroLineCd: 0,
      heroSwing: isHero ? Math.random() * Math.PI * 2 : 0,
      heroRetreating: false,
      heroRetreatHpPct: isHero ? 0.3 : 0,
      heroReturnHpPct: isHero ? 0.92 : 0,
      heroHealPerSec: isHero ? Math.max(96, hp * 0.34) : 0,
      president: isPresident,
      presidentSetup: false,
      presidentPodiumX: isPresident ? (sideName === 'left' ? (700 + Math.random() * 55) : (WORLD_W - (700 + Math.random() * 55))) : null,
      presidentPodiumY: isPresident ? (TOWER_Y + 18 + (Math.random() * 24 - 12)) : null,
      presidentAuraRadius: isPresident ? (178 + side.powerLevel * 8) : 0,
      presidentAuraMult: isPresident ? (1.22 + Math.min(0.14, side.powerLevel * 0.02)) : 1,
      presidentSpeechCd: isPresident ? (1 + Math.random() * 1.4) : 0,
      gunRange: isGunner ? 198 + side.arrowLevel * 10 + side.unitLevel * 6 : 0,
      gunDragonMul: isGunner ? (1.95 + side.arrowLevel * 0.05) : 1,
      gunFlashTtl: 0,
      candleCarrier: false,
      candleCarrierSide: null,
      candleBurnTtl: 0,
      candleBurnTick: 0,
    };
    this.minions.push(created);
    return created;
  }

  explodeMinion(sourceId, x, y, killerSide, explosiveLevel = 1, impactDamage = null, sourceSide = null) {
    const radius = 112 + (explosiveLevel - 1) * 16;
    const source = sourceSide && this[sourceSide] ? this[sourceSide] : null;
    const arrowDamage = source ? this.statArrowDamage(source) : 24;
    const damage = Math.max(1, Number.isFinite(impactDamage) ? impactDamage : arrowDamage);
    this.queueHitSfx('explosion', x, y, killerSide);

    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const m = this.minions[i];
      if (!m) continue;
      if (m.id === sourceId) continue;
      const dx = m.x - x;
      const dy = m.y - y;
      if (dx * dx + dy * dy > radius * radius) continue;
      this.dealMinionDamage(null, m, damage, 'explosion');
      if (m.hp <= 0) this.killMinion(i, killerSide, { goldScalar: 0.75 });
    }
  }

  goldFromMinionKill(side, scalar = 1) {
    const base = 8 * scalar;
    const bonus = 1 + (side.bountyLevel - 1) * 0.2;
    return Math.floor(base * bonus);
  }

  goldFromResource(side, value) {
    const bonus = 1 + (side.resourceLevel - 1) * 0.22;
    return Math.floor(value * bonus);
  }

  addUpgradeCharge(side, amount) {
    side.upgradeCharge = Math.min(99999, side.upgradeCharge + amount);
  }

  upgradeCost(side, type) {
    const rule = UPGRADE_COST_RULES[type] || { base: 140, growth: 18, start: 1 };
    const level = Math.max(0, Number(side?.[type]) || 0);
    const tier = Math.max(0, level - rule.start);
    return Math.max(60, Math.round(rule.base + tier * rule.growth));
  }

  spawnMirroredResource() {
    const x = 680 + Math.random() * 110;
    const y = 270 + Math.random() * 340;
    const value = 26 + Math.floor(this.t / 35) * 2;
    this.resources.push({ id: this.seq++, x, y, r: 14, value });
    this.resources.push({ id: this.seq++, x: mirroredX(x), y, r: 14, value });
  }

  spawnMirroredShotPower() {
    const x = 680 + Math.random() * 110;
    const type = randomFrom(SHOT_POWER_TYPES);
    const vy = 120 + Math.random() * 40;

    this.shotPowers.push({ id: this.seq++, side: 'left', x, y: 40, r: 16, type, vy });
    this.shotPowers.push({ id: this.seq++, side: 'right', x: mirroredX(x), y: 40, r: 16, type, vy });
  }

  sideCardSlotX(sideName, slot) {
    const leftRegular = [220, 320];
    if (sideName === 'left') return leftRegular[slot];
    return WORLD_W - leftRegular[slot];
  }

  hasCardInSlot(sideName, slot) {
    return this.upgradeCards.some((c) => c.side === sideName && c.slot === slot);
  }

  addUpgradeCard(sideName, slot, type, source = 'random') {
    const side = this[sideName];
    const cost = this.upgradeCost(side, type);
    this.upgradeCards.push({
      id: this.seq++,
      side: sideName,
      slot,
      source,
      type,
      value: 1,
      cost,
      x: this.sideCardSlotX(sideName, slot),
      y: CARD_Y,
      w: CARD_W,
      h: CARD_H,
    });
  }

  upgradePathForType(type) {
    return UPGRADE_PATH_BY_TYPE[type] || 'misc';
  }

  pickUpgradeType(excludedTypes = new Set(), excludedPaths = new Set()) {
    const withPathSpread = UPGRADE_TYPES.filter((type) => (
      !excludedTypes.has(type)
      && !excludedPaths.has(this.upgradePathForType(type))
    ));
    if (withPathSpread.length) return randomFrom(withPathSpread);

    const uniqueTypePool = UPGRADE_TYPES.filter((type) => !excludedTypes.has(type));
    if (uniqueTypePool.length) return randomFrom(uniqueTypePool);

    return randomFrom(UPGRADE_TYPES);
  }

  refillRegularCards(sideName) {
    const shown = this.upgradeCards.filter((c) => c.side === sideName && c.slot >= 0 && c.slot < 2);
    const usedTypes = new Set(shown.map((c) => c.type));
    const usedPaths = new Set(shown.map((c) => this.upgradePathForType(c.type)));

    for (let slot = 0; slot < 2; slot += 1) {
      if (!this.hasCardInSlot(sideName, slot)) {
        const type = this.pickUpgradeType(usedTypes, usedPaths);
        this.addUpgradeCard(sideName, slot, type, 'random');
        usedTypes.add(type);
        usedPaths.add(this.upgradePathForType(type));
      }
    }
  }

  clearCardsForSide(sideName) {
    this.upgradeCards = this.upgradeCards.filter((c) => c.side !== sideName);
  }

  selectUpgradeCard(sideName, card) {
    const side = this[sideName];
    if (!side || !card || card.side !== sideName) return false;
    if (side.upgradeCharge < side.upgradeChargeMax) return false;

    const spentDebt = Math.max(1, side.upgradeChargeMax);
    const overflow = Math.max(0, side.upgradeCharge - spentDebt);
    const nextDebt = Math.max(1, Math.round(Number(card.cost) || this.upgradeCost(side, card.type)));

    this.awardUpgrade(side, card.type, card.value);
    this.triggerUpgradeActivation(sideName, card.type, card.value, card.x, card.y);
    this.clearCardsForSide(sideName);

    side.upgradeCharge = overflow;
    side.upgradeChargeMax = nextDebt;
    side.upgradeAutoPickAt = null;
    return true;
  }

  syncUpgradeCards(sideName) {
    const side = this[sideName];
    if (side.upgradeCharge < side.upgradeChargeMax) {
      this.clearCardsForSide(sideName);
      side.upgradeAutoPickAt = null;
      return;
    }

    const hadCards = this.upgradeCards.some((c) => c.side === sideName);
    this.refillRegularCards(sideName);
    if (!hadCards || !Number.isFinite(side.upgradeAutoPickAt)) side.upgradeAutoPickAt = this.t + 20;

    if (Number.isFinite(side.upgradeAutoPickAt) && this.t >= side.upgradeAutoPickAt) {
      const cards = this.upgradeCards.filter((c) => c.side === sideName);
      if (cards.length) this.selectUpgradeCard(sideName, randomFrom(cards));
    }
  }

  seedUpgradeCards() {
    this.clearCardsForSide('left');
    this.clearCardsForSide('right');
  }

  awardUpgrade(side, type, value) {
    side[type] += value;
  }

  triggerUpgradeActivation(sideName, type, value, x, y) {
    const side = this[sideName];
    const towerX = sideName === 'left' ? TOWER_X_LEFT + 38 : TOWER_X_RIGHT - 38;
    const towerY = TOWER_Y - 96;
    const dir = sideName === 'left' ? 1 : -1;

    this.queueHitSfx('upgrade', x, y, sideName);
    this.queueHitSfx('powerup', towerX, towerY, sideName);

    if (type === 'dragonLevel') {
      this.spawnMinion(sideName, { forceType: 'dragon', countSpawn: false });
      this.queueHitSfx('dragonfire', towerX + dir * 40, towerY - 12, sideName);
      return;
    }

    if (type === 'superMinionLevel') {
      this.spawnMinion(sideName, { forceType: 'super', countSpawn: false });
      return;
    }

    // For non-summon upgrades, accelerate the relevant cooldown so impact is immediate.
    if (type === 'arrowLevel' || type === 'multiShotLevel' || type === 'volleyLevel' || type === 'powerLevel') {
      this.sharedShotCd = Math.min(this.sharedShotCd, 0.16);
      this.left.shotCd = this.sharedShotCd;
      this.right.shotCd = this.sharedShotCd;
    } else {
      side.minionCd = Math.min(side.minionCd, 0.16);
    }
  }

  processEconomy(side) {
    while (side.gold >= side.nextEcoCost) {
      side.gold -= side.nextEcoCost;
      side.economyLevel += 1;
      side.nextEcoCost = Math.floor(side.nextEcoCost * 1.24 + 18);
    }
  }
}

module.exports = { GameRoom };

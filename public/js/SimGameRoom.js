import {
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
} from './simConstants.js';
const ARCHER_ORIGIN_Y = TOWER_Y - 56;
const ARCHER_VERTICAL_GAP = 78;
const SHOT_INTERVAL = 1;
const TOWER_MAX_HP = 6000;
const UPGRADE_COST_RULES = {
  arrowLevel: { base: 130, growth: 18, start: 1 },
  unitLevel: { base: 138, growth: 18, start: 1 },
  volleyLevel: { base: 190, growth: 24, start: 0 },
  spawnLevel: { base: 150, growth: 16, start: 1 },
  unitHpLevel: { base: 138, growth: 16, start: 1 },
  resourceLevel: { base: 122, growth: 14, start: 1 },
  bountyLevel: { base: 118, growth: 14, start: 1 },
  powerLevel: { base: 164, growth: 20, start: 1 },
  specialRateLevel: { base: 182, growth: 22, start: 1 },
  dragonLevel: { base: 236, growth: 26, start: 0 },
  dragonSuperBreathLevel: { base: 328, growth: 0, start: 0 },
  shieldDarkMetalLevel: { base: 304, growth: 0, start: 0 },
  monkHealCircleLevel: { base: 286, growth: 0, start: 0 },
  necroExpertSummonerLevel: { base: 274, growth: 0, start: 0 },
  riderSuperHorseLevel: { base: 298, growth: 0, start: 0 },
  diggerGoldFinderLevel: { base: 282, growth: 0, start: 0 },
  gunnerSkyCannonLevel: { base: 294, growth: 0, start: 0 },
  superMinionLevel: { base: 214, growth: 24, start: 0 },
};
const UPGRADE_PATH_BY_TYPE = {
  arrowLevel: 'arrow',
  volleyLevel: 'arrow',
  unitLevel: 'unit',
  unitHpLevel: 'unit',
  spawnLevel: 'unit',
  resourceLevel: 'economy',
  bountyLevel: 'economy',
  powerLevel: 'power',
  specialRateLevel: 'special',
  dragonLevel: 'special',
  dragonSuperBreathLevel: 'special',
  shieldDarkMetalLevel: 'special',
  monkHealCircleLevel: 'special',
  necroExpertSummonerLevel: 'special',
  riderSuperHorseLevel: 'special',
  diggerGoldFinderLevel: 'special',
  gunnerSkyCannonLevel: 'special',
  superMinionLevel: 'special',
};
const UPGRADE_LEVEL_CAPS = {
  volleyLevel: 4,
  dragonSuperBreathLevel: 1,
  shieldDarkMetalLevel: 1,
  monkHealCircleLevel: 1,
  necroExpertSummonerLevel: 1,
  riderSuperHorseLevel: 1,
  diggerGoldFinderLevel: 1,
  gunnerSkyCannonLevel: 1,
};
const DRAGON_SUPER_BREATH_INTERVAL = 5;
const DRAGON_SUPER_BREATH_COOLDOWN_JITTER = 1.25;
const DRAGON_SUPER_BREATH_RANGE = 300;
const DRAGON_SUPER_BREATH_HALF_ANGLE = Math.PI * 0.24;
const DRAGON_SUPER_BREATH_MINION_DAMAGE_MULT = 2.05;
const DRAGON_SUPER_BREATH_TOWER_DAMAGE_MULT = 1.48;
const DRAGON_SUPER_BREATH_LIFT = 34;
const DRAGON_SUPER_BREATH_DURATION = 2;
const DRAGON_SUPER_BREATH_TICK = 0.2;
const DRAGON_SUPER_BREATH_CHANNEL_DAMAGE_MULT = 0.28;
const DRAGON_SUPER_BREATH_CHANNEL_TOWER_MULT = 0.16;
const DRAGON_SUPER_BREATH_GROUND_SCORCH_TTL = 3.4;
const DRAGON_SUPER_BREATH_GROUND_SCORCH_RADIUS = 108;
const DRAGON_SUPER_BREATH_GROUND_SCORCH_ENEMY_DPS = 58;
const MONK_HEAL_CIRCLE_INTERVAL = 10;
const MONK_HEAL_CIRCLE_COOLDOWN_JITTER = 1.6;
const MONK_HEAL_CIRCLE_RANGE_MULT = 1.12;
const MONK_HEAL_CIRCLE_HEAL_MULT = 0.56;
const MONK_HEAL_CIRCLE_SCALE_DECAY = 0.96;
const MONK_HEAL_CIRCLE_MIN_HEAL_FRACTION = 0.28;
const SHIELD_DARK_METAL_INTERVAL = 10;
const SHIELD_DARK_METAL_DURATION = 5;
const SHIELD_DARK_METAL_DAMAGE_TAKEN_MULT = 0.05;
const SHIELD_DARK_METAL_COOLDOWN_JITTER = 1.35;
const DIGGER_GOLD_FINDER_PICKUP_PAD = 5;
const DIGGER_GOLD_FINDER_MINE_TIME = 1;
const NECRO_SELF_SHIELD_FADE_SECONDS = 20;
const GUNNER_SKY_CANNON_INTERVAL = 9;
const GUNNER_SKY_CANNON_COOLDOWN_JITTER = 1.4;
const GUNNER_SKY_CANNON_RADIUS = 86;
const GUNNER_SKY_CANNON_MINION_DAMAGE_MULT = 1.68;
const GUNNER_SKY_CANNON_TOWER_DAMAGE_MULT = 0.58;
const GUNNER_SKY_CANNON_SETUP_TIME = 0.72;
const GUNNER_SKY_CANNON_FALL_SPEED = 312;
const GUNNER_SKY_CANNON_SKY_SPAWN_Y = 36;
const GUNNER_SKY_CANNON_IMPACT_PAD = 10;
const NECRO_EXPERT_REVIVE_RADIUS = 176;
const NECRO_EXPERT_REVIVE_HP_FRACTION = 0.125;
const NECRO_REVIVE_SHIELD_SECONDS = 2;
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
const HERO_HP_BOOST_MULT = 2.5;
const HERO_SIZE_MULT = 1.5;
const HERO_ARROW_FINISHER_HITS = 9;
const SHIELD_PUSH_INTERVAL = 5;
const SHIELD_PUSH_TTL = 0.75;
const SHIELD_PUSH_SCALE = 1.35;
const SHIELD_PUSH_RANGE = 86;
const SHIELD_PUSH_DISTANCE = 18;
const SHIELD_HEADSHOT_DAMAGE_MULT = 3;
const SHIELD_HEADSHOT_RETREAT = 20;
const STONE_GOLEM_HALF_HP_THRESHOLD = 0.5;
const STONE_GOLEM_HP_MULT = 15;
const STONE_GOLEM_DAMAGE_MULT = 0.8;
const STONE_GOLEM_SPEED_MULT = 0.58;
const STONE_GOLEM_SMASH_INTERVAL = 3;
const STONE_GOLEM_SMASH_RADIUS = 108;
const STONE_GOLEM_SMASH_TOWER_RADIUS = 92;
const STONE_GOLEM_SMASH_KNOCKBACK = 24;
const STONE_GOLEM_SMASH_TTL = 0.45;
const STONE_GOLEM_SHIELD_TTL = 5;
const MINION_HIT_FLASH_TTL = 0.18;
const SPECIAL_COOLDOWN_START_MULT = 1.5;
const SPECIAL_COOLDOWN_END_MULT = 1;
const SPECIAL_COOLDOWN_RAMP_SECONDS = 300;
const SPECIAL_COOLDOWN_STEP_SECONDS = 10;
const SPECIAL_FAIL_TTL = 5;
const SPECIAL_ROLL_TTL = 6;
const SPECIAL_SPAWN_QUEUE_ORDER = [
  'dragon',
  'shield',
  'digger',
  'necrominion',
  'gunner',
  'rider',
  'monk',
  'hero',
  'president',
  'super',
];
const SPECIAL_SPAWN_BASE_CHANCE = {
  necrominion: 0.56,
  gunner: 0.52,
  rider: 0.5,
  digger: 0.5,
  monk: 0.46,
  shield: 0.1,
  hero: 0.1,
  president: 0.41,
  dragon: 0.33,
  super: 0.3,
};
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
const CANDLE_SPAWN_COOLDOWN_MULT = 1.5;
const CANDLE_DELIVER_FUSE = 1.1;
const CANDLE_FIRE_RANGE = 250;
const CANDLE_FIRE_INTERVAL = 1.22;
const CANDLE_FIRE_SPLASH_R = 64;
const CANDLE_SCORCH_DPS_ALLY = 0;
const CANDLE_SCORCH_DPS_ENEMY = 0.25;
const CANDLE_SMOKE_SHIELD_SECONDS = 3.5;
const CANDLE_SMOKE_SHIELD_Y_OFFSET = -8;
const CANDLE_SMOKE_SHIELD_SCALE = 3;
const CANDLE_SMOKE_SHIELD_RY = 30 * CANDLE_SMOKE_SHIELD_SCALE;
const CANDLE_DESTROYED_SMOKE_SCALE = 2;
const CANDLE_DESTROYED_SMOKE_RY = CANDLE_SMOKE_SHIELD_RY * CANDLE_DESTROYED_SMOKE_SCALE;
const CANDLE_DESTROYED_SMOKE_Y_OFFSET = -28;
const MULTI_SIDE_ARROW_DELAY_STEP = 0.05;
const MULTI_SIDE_ARROW_DELAY_MAX = 0.9;
const MULTI_SIDE_ARROW_UNDER_DELAY_MUL = 2;
const ARROW_FLIGHT_TTL = 6.5;
const ARROW_SKY_TTL_PAUSE_Y = -60;
const DIGGER_SPAWN_BASE_Y = TOWER_Y + 102;
const ARROW_STICK_GROUND_Y = DIGGER_SPAWN_BASE_Y + 56;
const ARROW_STUCK_DURATION = 4;
const SHOT_POWER_FALL_MIN_SPEED = 78;
const SHOT_POWER_FALL_MAX_SPEED = 112;
const ARROW_TARGET_BUCKET_W = 120;
const ARROW_TARGET_BUCKET_SCAN = 2;
const MINION_TARGET_BUCKET_W = 140;
const MINION_TARGET_RADIUS_PAD = 84;
const MAX_DAMAGE_EVENTS_PER_TICK = 240;
const MAX_BUCKET_CELL_POOL = 2200;
const ROOM_SIDES = ['left', 'right'];

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
  const specialRollByTypeRaw = state.specialRollByType && typeof state.specialRollByType === 'object'
    ? state.specialRollByType
    : {};
  const specialRollByType = {};
  for (const type of SPECIAL_SPAWN_QUEUE_ORDER) {
    const entry = specialRollByTypeRaw[type];
    specialRollByType[type] = {
      success: typeof entry?.success === 'boolean' ? entry.success : null,
      chance: finiteOrNull(entry?.chance, 3),
      roll: finiteOrNull(entry?.roll, 3),
    };
  }
  return {
    towerHp: roundTo(state.towerHp, 1),
    gold: roundTo(state.gold, 1),
    economyLevel: Math.max(0, Math.round(Number(state.economyLevel) || 0)),
    nextEcoCost: Math.max(0, Math.round(Number(state.nextEcoCost) || 0)),
    unitLevel: Math.max(0, Math.round(Number(state.unitLevel) || 0)),
    unitHpLevel: Math.max(0, Math.round(Number(state.unitHpLevel) || 0)),
    arrowLevel: Math.max(0, Math.round(Number(state.arrowLevel) || 0)),
    volleyLevel: Math.max(0, Math.round(Number(state.volleyLevel) || 0)),
    spawnLevel: Math.max(0, Math.round(Number(state.spawnLevel) || 0)),
    resourceLevel: Math.max(0, Math.round(Number(state.resourceLevel) || 0)),
    bountyLevel: Math.max(0, Math.round(Number(state.bountyLevel) || 0)),
    powerLevel: Math.max(0, Math.round(Number(state.powerLevel) || 0)),
    specialRateLevel: Math.max(0, Math.round(Number(state.specialRateLevel) || 0)),
    dragonLevel: Math.max(0, Math.round(Number(state.dragonLevel) || 0)),
    dragonSuperBreathLevel: Math.max(0, Math.round(Number(state.dragonSuperBreathLevel) || 0)),
    shieldDarkMetalLevel: Math.max(0, Math.round(Number(state.shieldDarkMetalLevel) || 0)),
    monkHealCircleLevel: Math.max(0, Math.round(Number(state.monkHealCircleLevel) || 0)),
    necroExpertSummonerLevel: Math.max(0, Math.round(Number(state.necroExpertSummonerLevel) || 0)),
    riderSuperHorseLevel: Math.max(0, Math.round(Number(state.riderSuperHorseLevel) || 0)),
    diggerGoldFinderLevel: Math.max(0, Math.round(Number(state.diggerGoldFinderLevel) || 0)),
    gunnerSkyCannonLevel: Math.max(0, Math.round(Number(state.gunnerSkyCannonLevel) || 0)),
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
    candleSpawnInSpawns: Math.max(0, Math.round(Number(state.candleSpawnInSpawns) || 0)),
    candleActive: Boolean(state.candleActive),
    specialFailType: typeof state.specialFailType === 'string' ? state.specialFailType : null,
    specialFailTtl: roundTo(state.specialFailTtl, 2),
    specialRollType: typeof state.specialRollType === 'string' ? state.specialRollType : null,
    specialRollSuccess: typeof state.specialRollSuccess === 'boolean' ? state.specialRollSuccess : null,
    specialRollChance: finiteOrNull(state.specialRollChance, 3),
    specialRollValue: finiteOrNull(state.specialRollValue, 3),
    specialRollTtl: roundTo(state.specialRollTtl, 2),
    specialRollByType,
    towerDamagedOnce: Boolean(state.towerDamagedOnce),
    towerHeroRescueUsed: Boolean(state.towerHeroRescueUsed),
    towerGolemRescueUsed: Boolean(state.towerGolemRescueUsed),
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
    volleyLevel: 0,
    spawnLevel: 1,
    resourceLevel: 1,
    bountyLevel: 1,
    powerLevel: 1,
    specialRateLevel: 1,
    dragonLevel: 0,
    dragonSuperBreathLevel: 0,
    shieldDarkMetalLevel: 0,
    monkHealCircleLevel: 0,
    necroExpertSummonerLevel: 0,
    riderSuperHorseLevel: 0,
    diggerGoldFinderLevel: 0,
    gunnerSkyCannonLevel: 0,
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
    pendingSpecialSpawns: [],
    arrowsFired: 0,
    arrowHits: 0,
    comboHitStreak: 0,
    minionCd: 0,
    spawnCount: 0,
    candleCd: 0,
    candleSpawnInSpawns: 0,
    candleActive: false,
    specialFailType: null,
    specialFailTtl: 0,
    specialRollType: null,
    specialRollSuccess: null,
    specialRollChance: null,
    specialRollValue: null,
    specialRollTtl: 0,
    specialRollByType: {},
    towerDamagedOnce: false,
    towerHeroRescueUsed: false,
    towerGolemRescueUsed: false,
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
    this.cannonBalls = [];
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
    this.bucketCellPool = [];
    this.singleMinionBucketsCache = this.createBucketSet();
    this.arrowBucketsCache = this.createBucketSet();
    this.dualMinionBucketsCache = this.createBucketSet();
    this.dualBucketsResultCache = {
      arrow: this.arrowBucketsCache,
      minion: this.dualMinionBucketsCache,
      carrierCounts: { left: 0, right: 0 },
    };
    this.left.candleSpawnInSpawns = this.statCandleEvery(this.left);
    this.right.candleSpawnInSpawns = this.statCandleEvery(this.right);
    this.left.candleCd = this.candleSpawnEtaSeconds('left');
    this.right.candleCd = this.candleSpawnEtaSeconds('right');
    this.left.candleActive = false;
    this.right.candleActive = false;

    this.seedUpgradeCards();
  }

  createBucketSet() {
    return {
      left: new Map(),
      right: new Map(),
    };
  }

  resetBucketMap(map) {
    if (!(map instanceof Map) || map.size === 0) return;
    for (const cell of map.values()) {
      if (!Array.isArray(cell)) continue;
      cell.length = 0;
      if (this.bucketCellPool.length < MAX_BUCKET_CELL_POOL) this.bucketCellPool.push(cell);
    }
    map.clear();
  }

  resetBucketSet(buckets) {
    if (!buckets) return;
    this.resetBucketMap(buckets.left);
    this.resetBucketMap(buckets.right);
  }

  bucketCell(sideMap, key) {
    const existing = sideMap.get(key);
    if (existing) return existing;
    const next = this.bucketCellPool.pop() || [];
    sideMap.set(key, next);
    return next;
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
      launchDelay: roundTo(a.launchDelay, 3),
      stuck: Boolean(a.stuck),
      stuckAngle: finiteOrNull(a.stuckAngle, 3),
      stuckTtl: roundTo(a.stuckTtl, 3),
      stuckTtlMax: roundTo(a.stuckTtlMax, 3),
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
      necroRevived: Boolean(m.necroRevived),
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
      riderSuperHorse: Boolean(m.riderSuperHorse),
      digger: Boolean(m.digger),
      diggerGoldFinder: Boolean(m.diggerGoldFinder),
      dragonSuperBreathUpgraded: Boolean(m.dragonSuperBreathUpgraded),
      shieldDarkMetalUpgraded: Boolean(m.shieldDarkMetalUpgraded),
      monkHealCircleUpgraded: Boolean(m.monkHealCircleUpgraded),
      necroExpertUpgraded: Boolean(m.necroExpertUpgraded),
      gunnerSkyCannonUpgraded: Boolean(m.gunnerSkyCannonUpgraded),
      shieldBearer: Boolean(m.shieldBearer),
      shieldPushTtl: roundTo(m.shieldPushTtl, 2),
      shieldPushScale: roundTo(m.shieldPushScale, 3),
      shieldDarkMetalTtl: roundTo(m.shieldDarkMetalTtl, 2),
      stoneGolem: Boolean(m.stoneGolem),
      golemSmashTtl: roundTo(m.golemSmashTtl, 2),
      golemShieldHp: roundTo(m.golemShieldHp, 1),
      golemShieldMax: roundTo(m.golemShieldMax, 1),
      golemShieldTtl: roundTo(m.golemShieldTtl, 2),
      necroShieldHp: roundTo(m.necroShieldHp, 1),
      necroShieldMax: roundTo(m.necroShieldMax, 1),
      necroShieldTtl: roundTo(m.necroShieldTtl, 2),
      necroShieldMaxTtl: roundTo(m.necroShieldMaxTtl, 2),
      reviveShieldHp: roundTo(m.reviveShieldHp, 1),
      reviveShieldMax: roundTo(m.reviveShieldMax, 1),
      reviveShieldTtl: roundTo(m.reviveShieldTtl, 2),
      reviveShieldMaxTtl: roundTo(m.reviveShieldMaxTtl, 2),
      hitFlashTtl: roundTo(m.hitFlashTtl, 3),
      hero: Boolean(m.hero),
      monk: Boolean(m.monk),
      monkHealScale: roundTo(m.monkHealScale, 3),
      necrominion: Boolean(m.necrominion),
      president: Boolean(m.president),
      presidentSetup: Boolean(m.presidentSetup),
      presidentAuraRadius: roundTo(m.presidentAuraRadius, 1),
      failedSpecialType: typeof m.failedSpecialType === 'string' ? m.failedSpecialType : null,
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
      smokeShieldTtl: roundTo(candle.smokeShieldTtl, 2),
      respawnCd: roundTo(candle.respawnCd, 2),
      destroyed: Boolean(candle.destroyed),
    } : null));
    const candleScorches = this.candleScorches.map((scorch) => ({
      x: roundTo(scorch.x, 1),
      y: roundTo(scorch.y, 1),
      r: roundTo(scorch.r, 1),
      ttl: roundTo(scorch.ttl, 2),
      smokeShieldTtl: roundTo(scorch.smokeShieldTtl, 2),
      smokeShieldMaxTtl: roundTo(scorch.smokeShieldMaxTtl, 2),
      smokeShieldRx: roundTo(scorch.smokeShieldRx, 1),
      smokeShieldRy: roundTo(scorch.smokeShieldRy, 1),
      smokeShieldYOffset: roundTo(scorch.smokeShieldYOffset, 1),
      towerSide: scorch.towerSide === 'left' || scorch.towerSide === 'right' ? scorch.towerSide : null,
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
    const cannonBalls = this.cannonBalls.map((ball) => ({
      id: ball.id,
      side: ball.side,
      x: roundTo(ball.x, 1),
      y: roundTo(ball.y, 1),
      r: roundTo(ball.r, 1),
      impactY: roundTo(ball.impactY, 1),
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
      cannonBalls,
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

  queueHitSfx(type, x, y, side, extra = null) {
    const event = { type, x, y, side };
    if (extra && typeof extra === 'object') Object.assign(event, extra);
    this.sfxEvents.push(event);
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
    this.cannonBalls = [];
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
    this.left.candleSpawnInSpawns = this.statCandleEvery(this.left);
    this.right.candleSpawnInSpawns = this.statCandleEvery(this.right);
    this.left.candleCd = this.candleSpawnEtaSeconds('left');
    this.right.candleCd = this.candleSpawnEtaSeconds('right');
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
    this.left.specialFailTtl = Math.max(0, (Number(this.left.specialFailTtl) || 0) - dt);
    this.right.specialFailTtl = Math.max(0, (Number(this.right.specialFailTtl) || 0) - dt);
    this.left.specialRollTtl = Math.max(0, (Number(this.left.specialRollTtl) || 0) - dt);
    this.right.specialRollTtl = Math.max(0, (Number(this.right.specialRollTtl) || 0) - dt);
    if (this.left.specialFailTtl === 0) this.left.specialFailType = null;
    if (this.right.specialFailTtl === 0) this.right.specialFailType = null;
    // Keep last special roll result visible for UI history; TTL controls recency only.

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
    this.tickCannonBalls(dt);
    const preBuckets = this.buildDualMinionBuckets(ARROW_TARGET_BUCKET_W, MINION_TARGET_BUCKET_W);
    this.tickArrows(dt, preBuckets.arrow);
    this.tickMinions(dt, preBuckets.minion, preBuckets.carrierCounts);
    const candleBuckets = this.buildMinionBuckets(MINION_TARGET_BUCKET_W);
    const candleHolders = this.collectAllCandleHolders();
    this.tickCandle(dt, candleBuckets, candleHolders);

    this.processEconomy(this.left);
    this.processEconomy(this.right);

    if (this.left.towerHp <= 0 || this.right.towerHp <= 0) {
      this.gameOver = true;
      this.winner = this.left.towerHp > this.right.towerHp ? 'left' : 'right';
    }
  }

  tickShotPowers(dt) {
    let write = 0;
    for (let i = 0; i < this.shotPowers.length; i += 1) {
      const p = this.shotPowers[i];
      p.y += p.vy * dt;
      if (p.y >= ARROW_STICK_GROUND_Y) {
        this.queueHitSfx('explosion', p.x, ARROW_STICK_GROUND_Y, p.side);
        continue;
      }
      this.shotPowers[write] = p;
      write += 1;
    }
    this.shotPowers.length = write;
  }

  tickCannonBalls(dt) {
    if (!Array.isArray(this.cannonBalls) || this.cannonBalls.length === 0) return;
    let write = 0;
    const preBuckets = this.buildMinionBuckets(MINION_TARGET_BUCKET_W);
    for (let i = 0; i < this.cannonBalls.length; i += 1) {
      const ball = this.cannonBalls[i];
      if (!ball) continue;
      ball.y += (Number(ball.vy) || 0) * dt;
      ball.x += (Number(ball.vx) || 0) * dt;
      const impactY = Number.isFinite(ball.impactY) ? ball.impactY : (TOWER_Y - 18);
      if (ball.y >= impactY) {
        this.resolveGunnerSkyCannonImpact(ball, preBuckets, MINION_TARGET_BUCKET_W);
        continue;
      }
      this.cannonBalls[write] = ball;
      write += 1;
    }
    this.cannonBalls.length = write;
  }

  candleSpawnX(sideName) {
    return sideName === 'right' ? (TOWER_X_RIGHT - CANDLE_SPAWN_OFFSET) : (TOWER_X_LEFT + CANDLE_SPAWN_OFFSET);
  }

  candleSpawnY() {
    return TOWER_Y + (Math.random() * 80 - 40);
  }

  statCandleEvery(side) {
    const spawnTech = Math.max(1, Number(side?.spawnLevel) || 1);
    const resourceTech = Math.max(1, Number(side?.resourceLevel) || 1);
    const eco = Math.max(0, Number(side?.economyLevel) || 0);
    const tech = Math.floor((spawnTech + resourceTech + eco) / 6);
    const baseEvery = Math.max(24, 35 - tech);
    return Math.max(12, Math.round(baseEvery * CANDLE_SPAWN_COOLDOWN_MULT));
  }

  candleSpawnEtaSeconds(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const sideState = this[side];
    if (!sideState) return 0;
    if (this.candles?.[side]) return 0;
    const spawnEvery = this.statSpawnEvery(sideState);
    const minionCd = Math.max(0, Number(sideState.minionCd) || 0);
    const inSpawns = Math.max(1, Math.floor(Number(sideState.candleSpawnInSpawns) || this.statCandleEvery(sideState)));
    return minionCd + Math.max(0, inSpawns - 1) * spawnEvery;
  }

  stepCandleSpawnCycle(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const sideState = this[side];
    if (!sideState) return;
    if (this.candles?.[side]) return;
    if (!Number.isFinite(sideState.candleSpawnInSpawns) || sideState.candleSpawnInSpawns <= 0) {
      sideState.candleSpawnInSpawns = this.statCandleEvery(sideState);
    }
    sideState.candleSpawnInSpawns = Math.max(0, Math.floor(sideState.candleSpawnInSpawns) - 1);
    if (sideState.candleSpawnInSpawns <= 0) {
      this.spawnCandleUnit(side);
      sideState.candleSpawnInSpawns = this.statCandleEvery(sideState);
    }
    sideState.candleCd = this.candleSpawnEtaSeconds(side);
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
      smokeShieldTtl: 0,
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

  candleSmokeShieldShape(candle) {
    if (!candle) return null;
    const cartHalf = Math.max(28, Number(candle.cartHalfW) || CANDLE_CART_HALF_W);
    return {
      x: Number(candle.x) || 0,
      y: (Number(candle.y) || 0) + CANDLE_SMOKE_SHIELD_Y_OFFSET,
      rx: (cartHalf + 18) * CANDLE_SMOKE_SHIELD_SCALE,
      ry: CANDLE_SMOKE_SHIELD_RY,
    };
  }

  arrowInsideCandleSmokeShield(arrow, candle) {
    if (!arrow || !candle) return false;
    const ttl = Number(candle.smokeShieldTtl) || 0;
    if (ttl <= 0) return false;
    const shield = this.candleSmokeShieldShape(candle);
    if (!shield) return false;

    const hitRx = Math.max(1, shield.rx + (Number(arrow.r) || 0) * 0.85);
    const hitRy = Math.max(1, shield.ry + (Number(arrow.r) || 0) * 0.85);
    const nx = (arrow.x - shield.x) / hitRx;
    const ny = (arrow.y - shield.y) / hitRy;
    if (nx * nx + ny * ny > 1) return false;
    return arrow.y <= shield.y + shield.ry * 0.28;
  }

  scorchSmokeShieldShape(scorch) {
    if (!scorch) return null;
    const ttl = Number(scorch.smokeShieldTtl) || 0;
    const maxTtl = Math.max(0.01, Number(scorch.smokeShieldMaxTtl) || CANDLE_SMOKE_SHIELD_SECONDS);
    const life = clamp(ttl / maxTtl, 0, 1);
    if (life <= 0.01) return null;
    const baseRx = Math.max(0, Number(scorch.smokeShieldRx) || 0);
    const baseRy = Math.max(0, Number(scorch.smokeShieldRy) || 0);
    const rx = baseRx * life;
    const ry = baseRy * life;
    if (rx <= 0 || ry <= 0) return null;
    return {
      x: Number(scorch.x) || 0,
      y: (Number(scorch.y) || 0) + (Number(scorch.smokeShieldYOffset) || CANDLE_DESTROYED_SMOKE_Y_OFFSET),
      rx,
      ry,
    };
  }

  arrowInsideScorchSmokeShield(arrow, scorch) {
    if (!arrow || !scorch) return false;
    const ttl = Number(scorch.smokeShieldTtl) || 0;
    if (ttl <= 0) return false;
    const shield = this.scorchSmokeShieldShape(scorch);
    if (!shield) return false;

    const hitRx = Math.max(1, shield.rx + (Number(arrow.r) || 0) * 0.85);
    const hitRy = Math.max(1, shield.ry + (Number(arrow.r) || 0) * 0.85);
    const nx = (arrow.x - shield.x) / hitRx;
    const ny = (arrow.y - shield.y) / hitRy;
    if (nx * nx + ny * ny > 1) return false;
    return arrow.y <= shield.y + shield.ry * 0.28;
  }

  shieldBearerShieldShape(minion) {
    if (!minion || !minion.shieldBearer) return null;
    const dir = minion.side === 'left' ? 1 : -1;
    const baseR = Math.max(18, Number(minion.r) || 20);
    const pushLife = Math.max(0, Math.min(1, (Number(minion.shieldPushTtl) || 0) / SHIELD_PUSH_TTL));
    const pushScale = 1 + pushLife * (Math.max(1, Number(minion.shieldPushScale) || SHIELD_PUSH_SCALE) - 1);
    return {
      dir,
      x: (Number(minion.x) || 0) + dir * (baseR * 0.82),
      y: (Number(minion.y) || 0) + baseR * 0.06,
      rx: (baseR * 0.84 + 10) * pushScale,
      ry: (baseR * 1.18 + 10) * pushScale,
      topOpenY: (Number(minion.y) || 0) - baseR * 0.76,
    };
  }

  shieldBearerHeadCircle(minion, arrow = null) {
    if (!minion || !minion.shieldBearer) return null;
    const dir = minion.side === 'left' ? 1 : -1;
    const baseR = Math.max(18, Number(minion.r) || 20);
    // Exact match for drawShieldBearerSprite head circle in GameRenderer.
    const headR = baseR * 0.36;
    const arrowR = Math.max(0, Number(arrow?.r) || 0);
    return {
      x: (Number(minion.x) || 0) - dir * (baseR * 0.06),
      y: (Number(minion.y) || 0) - baseR * 2,
      r: headR + arrowR,
    };
  }

  segmentIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq <= 0.000001) {
      const px = x1 - cx;
      const py = y1 - cy;
      return px * px + py * py <= r * r;
    }
    let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
    t = clamp(t, 0, 1);
    const nx = x1 + dx * t - cx;
    const ny = y1 + dy * t - cy;
    return nx * nx + ny * ny <= r * r;
  }

  arrowInsideShieldBearerShield(arrow, minion) {
    if (!arrow || !minion || !minion.shieldBearer) return false;
    if (arrow.side === minion.side) return false;
    // Head should always remain hittable; shield never blocks head zone.
    const head = this.shieldBearerHeadCircle(minion, arrow);
    if (head) {
      const ax = Number(arrow.x) || 0;
      const ay = Number(arrow.y) || 0;
      const dxHead = ax - head.x;
      const dyHead = ay - head.y;
      if (dxHead * dxHead + dyHead * dyHead <= head.r * head.r) return false;
    }
    const shield = this.shieldBearerShieldShape(minion);
    if (!shield) return false;

    // Shield only blocks from the forward side and leaves a top opening.
    const relativeFront = ((Number(arrow.x) || 0) - (Number(minion.x) || 0)) * shield.dir;
    if (relativeFront < -Math.max(6, (Number(minion.r) || 0) * 0.42)) return false;
    if ((Number(arrow.y) || 0) < shield.topOpenY) return false;

    const hitRx = Math.max(1, shield.rx + (Number(arrow.r) || 0) * 0.9);
    const hitRy = Math.max(1, shield.ry + (Number(arrow.r) || 0) * 0.9);
    const nx = ((Number(arrow.x) || 0) - shield.x) / hitRx;
    const ny = ((Number(arrow.y) || 0) - shield.y) / hitRy;
    return nx * nx + ny * ny <= 1;
  }

  arrowHitsShieldBearerVulnerableZone(arrow, minion, prevX = null, prevY = null) {
    if (!arrow || !minion || !minion.shieldBearer) return false;
    if (arrow.side === minion.side) return false;
    const dir = minion.side === 'left' ? 1 : -1;
    const r = Math.max(18, Number(minion.r) || 20);
    const arrowX = Number(arrow.x) || 0;
    const arrowY = Number(arrow.y) || 0;
    const fromX = Number.isFinite(prevX) ? prevX : arrowX;
    const fromY = Number.isFinite(prevY) ? prevY : arrowY;

    const head = this.shieldBearerHeadCircle(minion, arrow);
    if (head) {
      const dxHead = arrowX - head.x;
      const dyHead = arrowY - head.y;
      const directHit = dxHead * dxHead + dyHead * dyHead <= head.r * head.r;
      const sweptHit = this.segmentIntersectsCircle(fromX, fromY, arrowX, arrowY, head.x, head.y, head.r);
      if (directHit || sweptHit) {
        return 'head';
      }
    }

    const backX = (Number(minion.x) || 0) - dir * (r * 0.56);
    const backY = Number(minion.y) || 0;
    const backHitR = r * 0.42 + (Number(arrow.r) || 0) * 0.7;
    const dxBack = arrowX - backX;
    const dyBack = arrowY - backY;
    if (dxBack * dxBack + dyBack * dyBack <= backHitR * backHitR) return 'back';
    if (this.segmentIntersectsCircle(fromX, fromY, arrowX, arrowY, backX, backY, backHitR)) return 'back';
    return null;
  }

  triggerShieldPush(minion, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!minion || !minion.shieldBearer) return;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const r = Math.max(18, Number(minion.r) || 20);
    const centerX = (Number(minion.x) || 0) + dir * (r * 0.95);
    const centerY = (Number(minion.y) || 0) + r * 0.06;
    let pushedAny = false;

    this.forEachEnemyMinionInRadius(
      sideName,
      centerX,
      centerY,
      SHIELD_PUSH_RANGE,
      minionBuckets,
      bucketW,
      (enemy) => {
        if (!enemy || enemy.removed || enemy.side === sideName) return;
        const retreatStep = SHIELD_PUSH_DISTANCE * (enemy.dragon ? 0.42 : enemy.super ? 0.62 : 1);
        enemy.x = clamp(enemy.x + dir * retreatStep, TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);
        if (enemy.flying && Number.isFinite(enemy.flyBaseY)) {
          enemy.flyBaseY += (enemy.y - enemy.flyBaseY) * 0.08;
        }
        pushedAny = true;
      }
    );

    if (!pushedAny) return;
    minion.shieldPushTtl = SHIELD_PUSH_TTL;
    minion.shieldPushScale = SHIELD_PUSH_SCALE;
    minion.shieldPushCd = SHIELD_PUSH_INTERVAL;
    minion.atkCd = Math.max(Number(minion.atkCd) || 0, 0.32);
    this.queueHitSfx('blocked', centerX, centerY, sideName);
    this.queueLine('BLOCKED', centerX, centerY - r * 0.55, sideName);
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
    if (minion.gunner || minion.rider || minion.digger || minion.shieldBearer || minion.stoneGolem) return false;
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
    const ordered = Array.isArray(holders) ? holders : [];
    const holderCount = Math.min(CANDLE_MAX_HOLDERS, ordered.length);

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

    for (let i = 0; i < holderCount; i += 1) {
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

  collectCandleHolders(sideName) {
    const ordered = [];
    for (const m of this.minions) {
      if (!m?.candleCarrier || m.candleCarrierSide !== sideName) continue;
      const valid = m.side === sideName && m.hp > 0 && this.isCandleCarrierEligible(m);
      if (!valid) {
        m.candleCarrier = false;
        m.candleCarrierSide = null;
        continue;
      }

      let insertAt = ordered.length;
      while (insertAt > 0 && ordered[insertAt - 1].id > m.id) insertAt -= 1;

      if (ordered.length < CANDLE_MAX_HOLDERS) {
        ordered.splice(insertAt, 0, m);
        continue;
      }

      if (insertAt >= CANDLE_MAX_HOLDERS) {
        m.candleCarrier = false;
        m.candleCarrierSide = null;
        continue;
      }

      const dropped = ordered[ordered.length - 1];
      if (dropped) {
        dropped.candleCarrier = false;
        dropped.candleCarrierSide = null;
      }
      ordered.splice(ordered.length - 1, 1);
      ordered.splice(insertAt, 0, m);
    }
    return ordered;
  }

  collectAllCandleHolders() {
    const grouped = { left: [], right: [] };
    for (const m of this.minions) {
      if (!m?.candleCarrier) continue;
      const sideName = m.candleCarrierSide === 'right' ? 'right' : 'left';
      const valid = m.side === sideName && m.hp > 0 && this.isCandleCarrierEligible(m);
      if (!valid) {
        m.candleCarrier = false;
        m.candleCarrierSide = null;
        continue;
      }

      const ordered = grouped[sideName];
      let insertAt = ordered.length;
      while (insertAt > 0 && ordered[insertAt - 1].id > m.id) insertAt -= 1;

      if (ordered.length < CANDLE_MAX_HOLDERS) {
        ordered.splice(insertAt, 0, m);
        continue;
      }

      if (insertAt >= CANDLE_MAX_HOLDERS) {
        m.candleCarrier = false;
        m.candleCarrierSide = null;
        continue;
      }

      const dropped = ordered[ordered.length - 1];
      if (dropped) {
        dropped.candleCarrier = false;
        dropped.candleCarrierSide = null;
      }
      ordered.splice(ordered.length - 1, 1);
      ordered.splice(insertAt, 0, m);
    }
    return grouped;
  }

  syncCandleHolderIds(candle, holders) {
    if (!candle) return;
    if (!Array.isArray(candle.holderIds)) candle.holderIds = [];
    candle.holderIds.length = holders.length;
    for (let i = 0; i < holders.length; i += 1) {
      candle.holderIds[i] = holders[i].id;
    }
  }

  sanitizeCandleHolders(sideName, candidates) {
    if (!Array.isArray(candidates) || !candidates.length) return [];
    const out = [];
    for (const m of candidates) {
      if (!m?.candleCarrier || m.candleCarrierSide !== sideName) continue;
      const valid = m.side === sideName && m.hp > 0 && this.isCandleCarrierEligible(m);
      if (!valid) {
        m.candleCarrier = false;
        m.candleCarrierSide = null;
        continue;
      }
      out.push(m);
      if (out.length >= CANDLE_MAX_HOLDERS) break;
    }
    return out;
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
    if (enemyHit) {
      candle.smokeShieldTtl = Math.max(Number(candle.smokeShieldTtl) || 0, CANDLE_SMOKE_SHIELD_SECONDS);
    }

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
      smokeShieldTtl: CANDLE_SMOKE_SHIELD_SECONDS,
      smokeShieldMaxTtl: CANDLE_SMOKE_SHIELD_SECONDS,
      smokeShieldRx: (Math.max(28, Number(candle.cartHalfW) || CANDLE_CART_HALF_W) + 18)
        * CANDLE_SMOKE_SHIELD_SCALE
        * CANDLE_DESTROYED_SMOKE_SCALE,
      smokeShieldRy: CANDLE_DESTROYED_SMOKE_RY,
      smokeShieldYOffset: CANDLE_DESTROYED_SMOKE_Y_OFFSET,
      side: hitSide,
      candleSide: sideName,
      towerSide: null,
      towerBurnDps: 0,
      towerBurnTick: 0,
    });

    this.candles[sideName] = null;
    this[sideName].candleActive = false;
    this[sideName].candleSpawnInSpawns = this.statCandleEvery(this[sideName]);
    this[sideName].candleCd = this.candleSpawnEtaSeconds(sideName);

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
      smokeShieldTtl: 0,
      smokeShieldMaxTtl: 0,
      smokeShieldRx: 0,
      smokeShieldRy: 0,
      smokeShieldYOffset: 0,
      side: sideName,
      candleSide: sideName,
      towerSide: enemySide,
      towerBurnDps: 52 + waxPct * 36,
      towerBurnTick: 0.2,
    });

    this.candles[sideName] = null;
    this[sideName].candleActive = false;
    this[sideName].candleSpawnInSpawns = this.statCandleEvery(this[sideName]);
    this[sideName].candleCd = this.candleSpawnEtaSeconds(sideName);
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
    if (!Array.isArray(candle.holderIds)) candle.holderIds = [];
    candle.holderIds.length = 0;
    candle.claimedBy = sideName;
    candle.flameSpeed = 1;
    candle.flameBoost = 0;
    candle.flameBurstTtl = 0;
    candle.flameBeamTtl = 0;
    candle.flameBeamToX = null;
    candle.flameBeamToY = null;
    candle.flameHitFlashTtl = 0;
    candle.smokeShieldTtl = 0;
    this.queueHitSfx('upgrade', candle.x, candle.y - 10, sideName);

    for (const m of this.minions) {
      if (m.candleCarrier && m.candleCarrierSide === sideName) {
        m.candleCarrier = false;
        m.candleCarrierSide = null;
        m.atkCd = Math.max(m.atkCd || 0, 0.22);
      }
    }
  }

  tickCandle(dt, precomputedBuckets = null, precomputedHolders = null) {
    if (!Array.isArray(this.candleScorches)) this.candleScorches = [];
    const minionBuckets = precomputedBuckets || this.buildMinionBuckets(MINION_TARGET_BUCKET_W);
    let scorchWrite = 0;
    for (let i = 0; i < this.candleScorches.length; i += 1) {
      const scorch = this.candleScorches[i];
      scorch.ttl = Math.max(0, (Number(scorch.ttl) || 0) - dt);
      if (!Number.isFinite(scorch.smokeShieldMaxTtl)) {
        scorch.smokeShieldMaxTtl = Math.max(0, Number(scorch.smokeShieldTtl) || 0);
      }
      scorch.smokeShieldTtl = Math.max(0, (Number(scorch.smokeShieldTtl) || 0) - dt);
      const candleSide = scorch.candleSide === 'right' ? 'right' : 'left';
      const allyDps = Number.isFinite(scorch.allyDps) ? Math.max(0, scorch.allyDps) : CANDLE_SCORCH_DPS_ALLY;
      const enemyDps = Number.isFinite(scorch.enemyDps) ? Math.max(0, scorch.enemyDps) : CANDLE_SCORCH_DPS_ENEMY;
      this.forEachMinionInRadius(scorch.x, scorch.y, scorch.r, minionBuckets, MINION_TARGET_BUCKET_W, (minion) => {
        const dps = minion.side === candleSide ? allyDps : enemyDps;
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
      if (scorch.ttl <= 0) continue;
      this.candleScorches[scorchWrite] = scorch;
      scorchWrite += 1;
    }
    this.candleScorches.length = scorchWrite;

    for (const sideName of ROOM_SIDES) {
      if (!this.candles[sideName]) {
        this[sideName].candleActive = false;
        this[sideName].candleCd = this.candleSpawnEtaSeconds(sideName);
      }
      const candle = this.candles[sideName];
      if (!candle) continue;
      this[sideName].candleActive = true;
      this[sideName].candleCd = 0;

      if (candle.delivering) {
        if (!Array.isArray(candle.holderIds)) candle.holderIds = [];
        candle.holderIds.length = 0;
        candle.claimedBy = sideName;
        candle.flamePulse += dt * 5.5;
        candle.flameBeamTtl = 0;
        candle.flameBeamToX = null;
        candle.flameBeamToY = null;
        candle.flameHitFlashTtl = Math.max(0, (Number(candle.flameHitFlashTtl) || 0) - dt);
        candle.smokeShieldTtl = 0;
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
      candle.smokeShieldTtl = Math.max(0, (Number(candle.smokeShieldTtl) || 0) - dt);
      candle.fireCd = Math.max(0, (Number(candle.fireCd) || 0) - dt);
      const burnRate = 0.03;
      candle.wax = Math.max(0, candle.wax - burnRate * dt);

      const sideHolders = Array.isArray(precomputedHolders?.[sideName])
        ? this.sanitizeCandleHolders(sideName, precomputedHolders[sideName])
        : this.collectCandleHolders(sideName);
      this.syncCandleHolderIds(candle, sideHolders);
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

  tickArrows(dt, precomputedBuckets = null) {
    const candleList = this.candles ? Object.values(this.candles) : [];
    const minionBuckets = precomputedBuckets || this.buildArrowMinionBuckets();

    for (let i = this.arrows.length - 1; i >= 0; i -= 1) {
      const a = this.arrows[i];
      if (a.stuck) {
        a.stuckTtl = Math.max(0, (Number(a.stuckTtl) || 0) - dt);
        if (a.stuckTtl <= 0) {
          this.arrows.splice(i, 1);
          continue;
        }
        continue;
      }
      const prevX = Number(a.x) || 0;
      const prevY = Number(a.y) || 0;
      let stepDt = dt;
      if ((Number(a.launchDelay) || 0) > 0) {
        a.launchDelay -= dt;
        if (a.launchDelay > 0) continue;
        stepDt = Math.max(0, -a.launchDelay);
        a.launchDelay = 0;
      }
      if (stepDt <= 0) continue;

      a.vy += (a.gravity || 560) * stepDt;
      a.x += a.vx * stepDt;
      a.y += a.vy * stepDt;
      const pauseTtl = a.y < ARROW_SKY_TTL_PAUSE_Y && a.vy < 0;
      if (!pauseTtl) a.ttl -= stepDt;

      if (a.ttl <= 0 || a.x < -50 || a.x > WORLD_W + 50 || a.y > WORLD_H + 50) {
        this.markArrowMiss(a);
        this.arrows.splice(i, 1);
        continue;
      }

      if (a.y >= ARROW_STICK_GROUND_Y && a.vy > 0) {
        this.markArrowMiss(a);
        this.stickArrowInGround(a);
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
          if (this.arrowInsideCandleSmokeShield(a, candle)) {
            this.markArrowMiss(a);
            this.queueLine('BLOCKED', a.x, a.y - 12, candleKey);
            this.queueHitSfx('blocked', a.x, a.y, candleKey);
            consumed = true;
            break;
          }
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

      if (!consumed && Array.isArray(this.candleScorches) && this.candleScorches.length) {
        for (const scorch of this.candleScorches) {
          if (!scorch || (Number(scorch.ttl) || 0) <= 0) continue;
          if ((Number(scorch.smokeShieldTtl) || 0) <= 0) continue;
          const candleKey = scorch.candleSide === 'right' ? 'right' : 'left';
          if (a.side === candleKey) continue;
          if (this.arrowInsideScorchSmokeShield(a, scorch)) {
            this.markArrowMiss(a);
            this.queueLine('BLOCKED', a.x, a.y - 12, candleKey);
            this.queueHitSfx('blocked', a.x, a.y, candleKey);
            consumed = true;
            break;
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
          let shieldVulnerableHit = null;
          if (minion.shieldBearer) {
            shieldVulnerableHit = this.arrowHitsShieldBearerVulnerableZone(a, minion, prevX, prevY);
            if (!shieldVulnerableHit && this.arrowInsideShieldBearerShield(a, minion)) {
              this.markArrowMiss(a);
              this.queueLine('BLOCKED', a.x, a.y - 12, minion.side);
              this.queueHitSfx('blocked', a.x, a.y, minion.side);
              consumed = true;
              continue;
            }
            if (!shieldVulnerableHit) continue;
          } else {
            const hitR = minion.r + a.r;
            if (dist2(a, minion) > hitR * hitR) continue;
          }

          this.markArrowHit(a);
          let damage = a.dmg;
          if (minion.digger) damage *= 0.76;
          const shieldHeadshot = Boolean(minion.shieldBearer && shieldVulnerableHit === 'head');
          if (shieldHeadshot) damage *= SHIELD_HEADSHOT_DAMAGE_MULT;
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
          minion.hitFlashTtl = Math.max(Number(minion.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
          if (shieldHeadshot && minion.hp > 0) {
            const retreatDir = minion.side === 'left' ? -1 : 1;
            minion.x = clamp(minion.x + retreatDir * SHIELD_HEADSHOT_RETREAT, TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);
            minion.atkCd = Math.max(Number(minion.atkCd) || 0, 0.2);
          }
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

  stickArrowInGround(arrow) {
    if (!arrow || arrow.stuck) return;
    const sideName = arrow.side === 'right' ? 'right' : 'left';
    const sideDir = sideName === 'left' ? 1 : -1;
    const incoming = Math.atan2(
      Math.max(90, Number(arrow.vy) || 0),
      Number(arrow.vx) || sideDir * 120
    );
    const baseAngle = sideName === 'left' ? 0.9 : Math.PI - 0.9;
    const minAngle = sideName === 'left' ? 0.48 : Math.PI - 1.28;
    const maxAngle = sideName === 'left' ? 1.28 : Math.PI - 0.48;
    arrow.stuck = true;
    arrow.stuckTtl = ARROW_STUCK_DURATION;
    arrow.stuckTtlMax = ARROW_STUCK_DURATION;
    arrow.ttl = ARROW_STUCK_DURATION;
    arrow.launchDelay = 0;
    arrow.gravity = 0;
    arrow.vx = 0;
    arrow.vy = 0;
    arrow.x = clamp(Number(arrow.x) || 0, TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);
    arrow.y = ARROW_STICK_GROUND_Y;
    arrow.stuckAngle = clamp(baseAngle * 0.6 + incoming * 0.4, minAngle, maxAngle);
  }

  buildMinionBuckets(bucketW = ARROW_TARGET_BUCKET_W) {
    const buckets = this.singleMinionBucketsCache;
    const width = Math.max(1, Number(bucketW) || ARROW_TARGET_BUCKET_W);
    this.resetBucketSet(buckets);

    for (const minion of this.minions) {
      if (!minion || minion.removed) continue;
      const sideName = minion.side === 'right' ? 'right' : 'left';
      const x = Number.isFinite(minion.x) ? minion.x : 0;
      const key = Math.floor(x / width);
      this.bucketCell(buckets[sideName], key).push(minion);
    }

    return buckets;
  }

  buildArrowMinionBuckets() {
    return this.buildMinionBuckets(ARROW_TARGET_BUCKET_W);
  }

  buildDualMinionBuckets(arrowBucketW = ARROW_TARGET_BUCKET_W, minionBucketW = MINION_TARGET_BUCKET_W) {
    const arrowBuckets = this.arrowBucketsCache;
    const carrierCounts = this.dualBucketsResultCache.carrierCounts;
    carrierCounts.left = 0;
    carrierCounts.right = 0;
    const arrowWidth = Math.max(1, Number(arrowBucketW) || ARROW_TARGET_BUCKET_W);
    const minionWidth = Math.max(1, Number(minionBucketW) || MINION_TARGET_BUCKET_W);
    const minionBuckets = arrowWidth === minionWidth
      ? arrowBuckets
      : this.dualMinionBucketsCache;

    this.resetBucketSet(arrowBuckets);
    if (minionBuckets !== arrowBuckets) this.resetBucketSet(minionBuckets);

    for (const minion of this.minions) {
      if (!minion || minion.removed) continue;
      const sideName = minion.side === 'right' ? 'right' : 'left';
      const x = Number.isFinite(minion.x) ? minion.x : 0;
      if (minion.candleCarrier && (Number(minion.hp) || 0) > 0) {
        const carrierSide = minion.candleCarrierSide === 'right' ? 'right' : 'left';
        carrierCounts[carrierSide] += 1;
      }

      const arrowKey = Math.floor(x / arrowWidth);
      this.bucketCell(arrowBuckets[sideName], arrowKey).push(minion);

      if (minionBuckets === arrowBuckets) continue;
      const minionKey = Math.floor(x / minionWidth);
      this.bucketCell(minionBuckets[sideName], minionKey).push(minion);
    }

    this.dualBucketsResultCache.arrow = arrowBuckets;
    this.dualBucketsResultCache.minion = minionBuckets;
    return this.dualBucketsResultCache;
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

  nearestResourceIndexForDigger(minion) {
    if (!minion || !Array.isArray(this.resources) || this.resources.length === 0) return -1;
    let bestIndex = -1;
    let bestSq = Infinity;
    for (let i = 0; i < this.resources.length; i += 1) {
      const res = this.resources[i];
      if (!res) continue;
      const dx = (Number(res.x) || 0) - (Number(minion.x) || 0);
      const dy = (Number(res.y) || 0) - (Number(minion.y) || 0);
      const d2 = dx * dx + dy * dy;
      if (d2 >= bestSq) continue;
      bestSq = d2;
      bestIndex = i;
    }
    return bestIndex;
  }

  tickDiggerGoldFinder(minion, dt) {
    if (!minion || !minion.digger) return false;
    const sideState = minion.side === 'right' ? this.right : this.left;
    const active = (Number(sideState?.diggerGoldFinderLevel) || 0) > 0;
    minion.diggerGoldFinder = active;
    if (!active) {
      minion.diggerMineTargetId = null;
      minion.diggerMineT = 0;
      return false;
    }

    const resourceIndex = this.nearestResourceIndexForDigger(minion);
    if (resourceIndex < 0) {
      minion.diggerMineTargetId = null;
      minion.diggerMineT = 0;
      return false;
    }
    const res = this.resources[resourceIndex];
    if (!res) {
      minion.diggerMineTargetId = null;
      minion.diggerMineT = 0;
      return false;
    }
    const resourceId = Number.isFinite(Number(res.id)) ? Number(res.id) : null;
    if (minion.diggerMineTargetId !== resourceId) {
      minion.diggerMineTargetId = resourceId;
      minion.diggerMineT = 0;
    }

    const targetY = clamp(Number(res.y) || minion.y, TOWER_Y - 190, TOWER_Y + 210);
    if (!Number.isFinite(minion.digBaseY)) minion.digBaseY = minion.y;
    minion.digBaseY += (targetY - minion.digBaseY) * Math.min(1, dt * 4.2);

    const dx = (Number(res.x) || 0) - (Number(minion.x) || 0);
    const moveStep = Math.max(26, (Number(minion.speed) || 0) * 1.08) * dt;
    minion.x += clamp(dx, -moveStep, moveStep);

    const hitR = Math.max(6, Number(res.r) || 14) + Math.max(8, Number(minion.r) || 12) + DIGGER_GOLD_FINDER_PICKUP_PAD;
    const dy = (Number(res.y) || 0) - (Number(minion.y) || 0);
    if (dx * dx + dy * dy > hitR * hitR) {
      minion.diggerMineT = 0;
      return true;
    }
    minion.diggerMineT = Math.min(
      DIGGER_GOLD_FINDER_MINE_TIME,
      Math.max(0, Number(minion.diggerMineT) || 0) + dt
    );
    if (minion.diggerMineT < DIGGER_GOLD_FINDER_MINE_TIME) {
      minion.atkCd = Math.max(Number(minion.atkCd) || 0, 0.12);
      return true;
    }

    const side = minion.side === 'right' ? this.right : this.left;
    const gain = this.goldFromResource(side, Number(res.value) || 0);
    side.gold += gain;
    this.addUpgradeCharge(side, gain);
    this.queueHitSfx('resource', res.x, res.y, minion.side);
    this.queueHitSfx('powerup', minion.x, minion.y - Math.max(6, minion.r * 0.3), minion.side);
    this.resources.splice(resourceIndex, 1);
    minion.diggerMineTargetId = null;
    minion.diggerMineT = 0;
    minion.atkCd = Math.max(Number(minion.atkCd) || 0, 0.38);
    return true;
  }

  tickMinions(dt, precomputedTargetBuckets = null, precomputedCarrierCounts = null) {
    const targetBuckets = precomputedTargetBuckets || this.buildMinionBuckets(MINION_TARGET_BUCKET_W);
    const carrierCounts = precomputedCarrierCounts || this.buildCandleCarrierCounts();

    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const m = this.minions[i];
      if (!m) continue;
      if (!Number.isFinite(m.candleBurnTtl)) m.candleBurnTtl = 0;
      if (!Number.isFinite(m.candleBurnTick)) m.candleBurnTick = 0;
      if (!Number.isFinite(m.hitFlashTtl)) m.hitFlashTtl = 0;
      m.hitFlashTtl = Math.max(0, m.hitFlashTtl - dt);
      if (!Number.isFinite(m.reviveShieldTtl)) m.reviveShieldTtl = 0;
      if (!Number.isFinite(m.reviveShieldMaxTtl) || m.reviveShieldMaxTtl <= 0) m.reviveShieldMaxTtl = NECRO_REVIVE_SHIELD_SECONDS;
      if (!Number.isFinite(m.reviveShieldHp)) m.reviveShieldHp = 0;
      if (!Number.isFinite(m.reviveShieldMax)) m.reviveShieldMax = Math.max(0, Number(m.reviveShieldHp) || 0);
      m.reviveShieldTtl = Math.max(0, m.reviveShieldTtl - dt);
      if (m.reviveShieldTtl <= 0) {
        m.reviveShieldHp = 0;
      } else {
        const reviveCap = m.reviveShieldMax * (m.reviveShieldTtl / m.reviveShieldMaxTtl);
        m.reviveShieldHp = Math.max(0, Math.min(m.reviveShieldHp, reviveCap));
      }
      if (typeof m.candleCarrier !== 'boolean') m.candleCarrier = false;
      if (m.candleCarrierSide !== 'left' && m.candleCarrierSide !== 'right') m.candleCarrierSide = null;
      if (!m.candleCarrier) m.candleCarrierSide = null;
      this.tickCandleBurnOnMinion(m, dt);
      if (m.hp <= 0) continue;
      m.atkCd = Math.max(0, m.atkCd - dt);
      if (m.dragonBreathTtl > 0) m.dragonBreathTtl = Math.max(0, m.dragonBreathTtl - dt);
      if (m.dragon) {
        if (!Number.isFinite(m.dragonSuperBreathCd)) {
          m.dragonSuperBreathCd = DRAGON_SUPER_BREATH_INTERVAL + Math.random() * DRAGON_SUPER_BREATH_COOLDOWN_JITTER;
        }
        const sideState = m.side === 'right' ? this.right : this.left;
        m.dragonSuperBreathUpgraded = (Number(sideState?.dragonSuperBreathLevel) || 0) > 0;
        if ((Number(sideState?.dragonSuperBreathLevel) || 0) > 0) {
          m.dragonSuperBreathCd = Math.max(0, m.dragonSuperBreathCd - dt);
        } else {
          m.dragonSuperBreathCd = DRAGON_SUPER_BREATH_INTERVAL + Math.random() * DRAGON_SUPER_BREATH_COOLDOWN_JITTER;
        }
      }
      if (m.gunFlashTtl > 0) m.gunFlashTtl = Math.max(0, m.gunFlashTtl - dt);
      if (m.gunner) {
        if (!Number.isFinite(m.gunnerSkyCannonCd)) {
          m.gunnerSkyCannonCd = GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER;
        }
        const sideState = m.side === 'right' ? this.right : this.left;
        m.gunnerSkyCannonUpgraded = (Number(sideState?.gunnerSkyCannonLevel) || 0) > 0;
        if ((Number(sideState?.gunnerSkyCannonLevel) || 0) > 0) {
          m.gunnerSkyCannonCd = Math.max(0, m.gunnerSkyCannonCd - dt);
        } else {
          m.gunnerSkyCannonCd = GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER;
        }
      }
      if (m.heroLineCd > 0) m.heroLineCd = Math.max(0, m.heroLineCd - dt);
      if (m.hero) {
        if (!Number.isFinite(m.heroSwing)) m.heroSwing = Math.random() * Math.PI * 2;
        m.heroSwing += dt * 8.2;
      }
      if (m.shieldBearer) {
        m.dmg = 0;
        if (!Number.isFinite(m.shieldPushCd)) m.shieldPushCd = SHIELD_PUSH_INTERVAL;
        m.shieldPushCd = Math.max(0, m.shieldPushCd - dt);
        if (!Number.isFinite(m.shieldPushTtl)) m.shieldPushTtl = 0;
        m.shieldPushTtl = Math.max(0, m.shieldPushTtl - dt);
        if (!Number.isFinite(m.shieldPushScale) || m.shieldPushScale < 1) m.shieldPushScale = SHIELD_PUSH_SCALE;
        if (!Number.isFinite(m.shieldDarkMetalCd)) {
          m.shieldDarkMetalCd = SHIELD_DARK_METAL_INTERVAL + Math.random() * SHIELD_DARK_METAL_COOLDOWN_JITTER;
        }
        if (!Number.isFinite(m.shieldDarkMetalTtl)) m.shieldDarkMetalTtl = 0;
        const sideState = m.side === 'right' ? this.right : this.left;
        m.shieldDarkMetalUpgraded = (Number(sideState?.shieldDarkMetalLevel) || 0) > 0;
        if ((Number(sideState?.shieldDarkMetalLevel) || 0) > 0) {
          m.shieldDarkMetalCd = Math.max(0, m.shieldDarkMetalCd - dt);
          m.shieldDarkMetalTtl = Math.max(0, m.shieldDarkMetalTtl - dt);
          if (m.shieldDarkMetalCd === 0) {
            m.shieldDarkMetalTtl = SHIELD_DARK_METAL_DURATION;
            m.shieldDarkMetalCd = SHIELD_DARK_METAL_INTERVAL;
            this.queueHitSfx('blocked', m.x + (m.side === 'left' ? 1 : -1) * (m.r * 0.7), m.y, m.side);
            this.queueHitSfx('powerup', m.x, m.y - m.r * 0.38, m.side);
            this.queueLine('DARK METAL', m.x, m.y - m.r - 18, m.side);
          }
        } else {
          m.shieldDarkMetalTtl = 0;
          m.shieldDarkMetalCd = SHIELD_DARK_METAL_INTERVAL + Math.random() * SHIELD_DARK_METAL_COOLDOWN_JITTER;
        }
      }
      if (m.stoneGolem) {
        if (!Number.isFinite(m.golemSmashTtl)) m.golemSmashTtl = 0;
        m.golemSmashTtl = Math.max(0, m.golemSmashTtl - dt);
        if (!Number.isFinite(m.golemShieldHp)) m.golemShieldHp = 0;
        if (!Number.isFinite(m.golemShieldMax)) m.golemShieldMax = Math.max(0, m.golemShieldHp);
        if (!Number.isFinite(m.golemShieldTtl)) m.golemShieldTtl = 0;
        if (m.golemShieldTtl > 0) {
          m.golemShieldTtl = Math.max(0, m.golemShieldTtl - dt);
          if (m.golemShieldTtl <= 0) m.golemShieldHp = 0;
        } else {
          m.golemShieldHp = 0;
        }
      }
      if (m.necrominion) {
        const sideState = m.side === 'right' ? this.right : this.left;
        m.necroExpertUpgraded = (Number(sideState?.necroExpertSummonerLevel) || 0) > 0;
        if (!Number.isFinite(m.necroShieldTtl)) m.necroShieldTtl = 0;
        if (!Number.isFinite(m.necroShieldMaxTtl) || m.necroShieldMaxTtl <= 0) m.necroShieldMaxTtl = NECRO_SELF_SHIELD_FADE_SECONDS;
        if (!Number.isFinite(m.necroShieldMax)) m.necroShieldMax = Math.max(0, Number(m.necroShieldHp) || 0);
        m.necroShieldTtl = Math.max(0, m.necroShieldTtl - dt);
        if (m.necroShieldTtl <= 0) {
          m.necroShieldHp = 0;
        } else {
          const cap = m.necroShieldMax * (m.necroShieldTtl / m.necroShieldMaxTtl);
          if (!Number.isFinite(m.necroShieldHp)) m.necroShieldHp = cap;
          m.necroShieldHp = Math.max(0, Math.min(m.necroShieldHp, cap));
        }
      }
      if (m.president) {
        this.tickPresident(m, dt);
        continue;
      }
      if (m.monk) {
        const sideState = m.side === 'right' ? this.right : this.left;
        m.monkHealCircleUpgraded = (Number(sideState?.monkHealCircleLevel) || 0) > 0;
        this.tickMonk(m, dt);
        continue;
      }
      if (this.handleCandleMinionIntent(m, dt, carrierCounts)) continue;
      if (m.digger) {
        if (!Number.isFinite(m.digPhase)) m.digPhase = Math.random() * Math.PI * 2;
        if (!Number.isFinite(m.digBaseY)) m.digBaseY = m.y;
        m.digPhase += dt * (1.35 + Math.min(0.65, m.speed / 150));
        const sideState = m.side === 'right' ? this.right : this.left;
        const hasGoldFinder = (Number(sideState?.diggerGoldFinderLevel) || 0) > 0;
        m.diggerGoldFinder = hasGoldFinder;
        m.y = clamp(
          m.digBaseY + Math.sin(m.digPhase) * 3.6,
          hasGoldFinder ? (TOWER_Y - 190) : (TOWER_Y + 52),
          hasGoldFinder ? (TOWER_Y + 210) : (TOWER_Y + 196)
        );
        if (this.tickDiggerGoldFinder(m, dt)) continue;
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
      const mySideState = m.side === 'right' ? this.right : this.left;
      const gunnerSkyActive = m.gunner && (Number(mySideState?.gunnerSkyCannonLevel) || 0) > 0;
      if (m.dragon && (Number(mySideState?.dragonSuperBreathLevel) || 0) > 0 && m.dragonSuperBreathCd === 0) {
        this.dragonSuperBreath(m);
        m.dragonSuperBreathCd = DRAGON_SUPER_BREATH_INTERVAL;
        m.atkCd = Math.max(m.atkCd, 0.44);
      }
      if (m.dragon && this.tickDragonSuperBreathChannel(m, dt, targetBuckets, MINION_TARGET_BUCKET_W)) {
        m.atkCd = Math.max(m.atkCd, 0.24);
        continue;
      }
      if (m.gunner && (Number(m.gunnerSkyCannonSetupTtl) || 0) > 0) {
        m.gunnerSkyCannonSetupTtl = Math.max(0, (Number(m.gunnerSkyCannonSetupTtl) || 0) - dt);
        if (m.gunnerSkyCannonSetupTtl === 0) this.launchGunnerSkyCannonBall(m);
        m.atkCd = Math.max(m.atkCd, 0.18);
        continue;
      }
      const enemyCandle = this.candles?.[enemySideName];
      let candleInReach = false;
      let candleDistSq = Infinity;
      if (enemyCandle && !enemyCandle.destroyed && !enemyCandle.delivering) {
        const cdx = enemyCandle.x - m.x;
        const cdy = enemyCandle.y - m.y;
        candleDistSq = cdx * cdx + cdy * cdy;
        const candleReach = (m.shieldBearer || m.stoneGolem)
          ? 0
          : (m.dragon
              ? 176
              : (m.gunner
                  ? Math.max(132, (m.gunRange || 220) * 0.72)
                  : m.r + (enemyCandle.r || 24) + 24 + (m.digger ? 10 : 0) + (m.hero ? 24 : 0)));
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

      // Expert necros are backline supports: hold a safe position to enable revives.
      if (m.necrominion && m.necroExpertUpgraded) {
        // Mirror monk backline pathing, but keep necro about one unit farther back.
        const homeX = m.side === 'left' ? TOWER_X_LEFT + 78 : TOWER_X_RIGHT - 78;
        const allyFrontX = this.allyFrontX(m.side, m.id);
        const frontRef = Number.isFinite(allyFrontX) ? allyFrontX : homeX + dir * 120;
        const monkKeepBehind = Math.max(90, 138 + (Math.max(1, Number(mySideState?.spawnLevel) || 1) * 3));
        const extraBack = Math.max(18, Number(m.r) || 14);
        const keepBehind = monkKeepBehind + extraBack;

        let desiredX = frontRef - dir * keepBehind;
        desiredX = clamp(desiredX, TOWER_X_LEFT + 56, TOWER_X_RIGHT - 56);
        const advanceLimit = enemyX - dir * 110;
        if (m.side === 'left') desiredX = Math.min(desiredX, advanceLimit);
        else desiredX = Math.max(desiredX, advanceLimit);
        if (m.side === 'left') desiredX = Math.max(desiredX, homeX);
        else desiredX = Math.min(desiredX, homeX);

        // Light lane-following like monk so necro doesn't freeze on a single Y.
        const followRange = Math.max(110, Number(m.necroReviveRadius) || NECRO_EXPERT_REVIVE_RADIUS * 1.2);
        const followR2 = followRange * followRange;
        let desiredY = m.y;
        let bestScore = -Infinity;
        let followAlly = null;
        for (const ally of this.minions) {
          if (!ally || ally.side !== m.side || ally.id === m.id) continue;
          if ((Number(ally.hp) || 0) <= 0) continue;
          const missing = Math.max(0, (Number(ally.maxHp) || 0) - (Number(ally.hp) || 0));
          if (missing <= 0.5) continue;
          const dx = ally.x - m.x;
          const dy = ally.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > followR2) continue;
          const dist = Math.sqrt(d2);
          const missingPct = missing / Math.max(1, ally.maxHp || 1);
          const frontBias = ally.side === 'left' ? (ally.x / WORLD_W) : ((WORLD_W - ally.x) / WORLD_W);
          const score = missingPct * 1.5 + (1 - dist / followRange) * 0.7 + frontBias * 0.24;
          if (score > bestScore) {
            bestScore = score;
            followAlly = ally;
            desiredY = ally.y;
          }
        }

        if (followAlly) {
          const maxBackGap = Math.max(
            40,
            NECRO_EXPERT_REVIVE_RADIUS
              - Math.max(0, Number(m.r) || 14)
              - Math.max(0, Number(followAlly.r) || 14)
              - 8
          );
          const followGap = Math.min(keepBehind, maxBackGap);
          desiredX = (Number(followAlly.x) || desiredX) - dir * followGap;
          desiredX = clamp(desiredX, TOWER_X_LEFT + 56, TOWER_X_RIGHT - 56);
          if (m.side === 'left') desiredX = Math.min(desiredX, advanceLimit);
          else desiredX = Math.max(desiredX, advanceLimit);
          if (m.side === 'left') desiredX = Math.max(desiredX, homeX);
          else desiredX = Math.min(desiredX, homeX);
        }

        const xDelta = desiredX - m.x;
        const moveStep = Math.max(26, m.speed * 0.9) * dt;
        if (Math.abs(xDelta) > 1.6) m.x += clamp(xDelta, -moveStep, moveStep);

        desiredY = clamp(desiredY, TOWER_Y - 130, TOWER_Y + 140);
        m.y += (desiredY - m.y) * Math.min(1, dt * 2.8);

        let closeEnemy = null;
        let closeSq = Infinity;
        const defendR = Math.max(58, m.r + 36);
        this.forEachEnemyMinionInRadius(
          m.side,
          m.x,
          m.y,
          defendR,
          targetBuckets,
          MINION_TARGET_BUCKET_W,
          (other) => {
            if (!other || other.removed || other.side === m.side) return;
            const dx = other.x - m.x;
            const dy = other.y - m.y;
            const d2 = dx * dx + dy * dy;
            if (d2 >= closeSq) return;
            closeSq = d2;
            closeEnemy = other;
          }
        );
        if (closeEnemy && m.atkCd === 0) {
          this.dealMinionDamage(m, closeEnemy, m.dmg, 'melee');
          m.atkCd = 0.88;
        } else {
          m.atkCd = Math.max(m.atkCd, 0.18);
        }
        continue;
      }

      let target = null;
      let bestSq = Infinity;
      const maxReach = m.stoneGolem
        ? STONE_GOLEM_SMASH_RADIUS
        : (m.shieldBearer
          ? (SHIELD_PUSH_RANGE + m.r * 0.4)
          : (m.dragon
              ? 170
              : (m.gunner
                  ? (m.gunRange || 220)
                  : m.r + 24 + (m.digger ? 14 : 0) + (m.hero ? 24 : 0) + MINION_TARGET_RADIUS_PAD)));
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
          const reach = m.stoneGolem
            ? STONE_GOLEM_SMASH_RADIUS
            : (m.shieldBearer
            ? Math.max(58, m.r + other.r + 22)
            : (m.dragon
                ? 170
                : (m.gunner
                    ? (m.gunRange || 220)
                    : m.r + other.r + 24 + (m.digger ? 14 : 0) + (m.hero ? 24 : 0))));
          if (d2 < bestSq && d2 < reach * reach) {
            target = other;
            bestSq = d2;
          }
        }
      }

      if (!m.shieldBearer && candleInReach && enemyCandle && (!target || candleDistSq <= bestSq * 0.8464)) {
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
            if (gunnerSkyActive && (Number(m.gunnerSkyCannonCd) || 0) === 0) {
              this.gunnerSkyCannon(m, enemyCandle.x, enemyCandle.y - 9);
              m.atkCd = 0.86;
            } else {
              const muzzleX = m.x + dir * (m.r + 7);
              const muzzleY = m.y - 2;
              m.gunFlashTtl = 0.12;
              this.queueHitSfx('gunhit', muzzleX, muzzleY, m.side);
              this.queueHitSfx('gunhit', enemyCandle.x, enemyCandle.y - 9, m.side);
              m.atkCd = 0.66;
            }
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
        if (m.stoneGolem) {
          const holdDist = Math.max(74, m.r + target.r + 18);
          if (Math.abs(target.x - m.x) > holdDist) {
            m.x += dir * m.speed * dt;
          } else if (m.atkCd === 0) {
            this.stoneGolemSmash(m, enemySideName, enemyX, targetBuckets, MINION_TARGET_BUCKET_W);
            m.atkCd = STONE_GOLEM_SMASH_INTERVAL;
          }
        } else if (m.shieldBearer) {
          if (m.shieldPushCd === 0) this.triggerShieldPush(m, targetBuckets, MINION_TARGET_BUCKET_W);
          const holdDist = Math.max(58, m.r + target.r + 18);
          if (Math.abs(target.x - m.x) > holdDist) {
            m.x += dir * m.speed * dt;
          } else {
            m.atkCd = Math.max(m.atkCd, 0.22);
          }
        } else if (m.atkCd === 0) {
          if (m.dragon) {
            this.dragonBreath(m, target, targetBuckets, MINION_TARGET_BUCKET_W);
            m.atkCd = 1.05;
          } else if (m.gunner) {
            if (gunnerSkyActive && (Number(m.gunnerSkyCannonCd) || 0) === 0) {
              this.gunnerSkyCannon(m, target.x, target.y);
              m.atkCd = 0.86;
            } else {
              this.gunnerShot(m, target, targetBuckets, MINION_TARGET_BUCKET_W);
              m.atkCd = 0.66;
            }
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
      } else if (Math.abs(m.x - enemyX) < m.r + 20 + (m.flying ? 34 : 0) + (m.dragon ? 50 : 0) + (m.gunner ? Math.max(0, (m.gunRange || 0) - 40) : 0) + (m.rider ? 14 : 0) + (m.digger ? 8 : 0) + (m.hero ? 24 : 0) + (m.shieldBearer ? 26 : 0) + (m.stoneGolem ? 58 : 0)) {
        if (m.stoneGolem) {
          if (m.atkCd === 0) {
            this.stoneGolemSmash(m, enemySideName, enemyX, targetBuckets, MINION_TARGET_BUCKET_W);
            m.atkCd = STONE_GOLEM_SMASH_INTERVAL;
          }
        } else if (m.shieldBearer) {
          if (m.shieldPushCd === 0) this.triggerShieldPush(m, targetBuckets, MINION_TARGET_BUCKET_W);
          m.atkCd = Math.max(m.atkCd, 0.35);
        } else if (m.atkCd === 0) {
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
            if (gunnerSkyActive && (Number(m.gunnerSkyCannonCd) || 0) === 0) {
              this.gunnerSkyCannon(m, enemyX, TOWER_Y - 24);
              m.atkCd = 0.9;
            } else {
              this.applyMinionTowerDamage(m, enemySideName, m.dmg * 0.72, enemyX, TOWER_Y - 24);
              const muzzleX = m.x + dir * (m.r + 7);
              const muzzleY = m.y - 2;
              m.gunFlashTtl = 0.12;
              this.queueHitSfx('gunhit', muzzleX, muzzleY, m.side);
              this.queueHitSfx('gunhit', enemyX, TOWER_Y - 24, m.side);
              m.atkCd = 0.72;
            }
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
    return 1 + Math.max(0, side.volleyLevel || 0);
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
      victim.hitFlashTtl = Math.max(Number(victim.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
      if (victim.hp <= 0) this.killMinionByRef(victim, arrow.side, { goldScalar: 0.75 });
    }
  }

  applyFlameArrowImpact(arrow, target, baseDamage, minionBuckets = null) {
    if (!arrow || arrow.powerType !== 'flameShot' || !target) return;

    const burnDamage = Math.max(1, baseDamage * (Number(arrow.flameBurn) || 0.18));
    this.dealDamageToMinion(target, burnDamage);
    target.hitFlashTtl = Math.max(Number(target.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);

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
      victim.hitFlashTtl = Math.max(Number(victim.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
      if (victim.hp <= 0) this.killMinionByRef(victim, arrow.side, { goldScalar: 0.8 });
    }
  }

  dealDamageToMinion(minion, amount) {
    if (!minion) return 0;
    const dmg = Math.max(0, Number(amount) || 0);
    if (dmg <= 0) return 0;
    let remaining = dmg;
    if (remaining > 0) {
      if (!Number.isFinite(minion.reviveShieldHp)) minion.reviveShieldHp = 0;
      if (!Number.isFinite(minion.reviveShieldTtl)) minion.reviveShieldTtl = 0;
      if (minion.reviveShieldTtl > 0 && minion.reviveShieldHp > 0) {
        const absorbed = Math.min(remaining, minion.reviveShieldHp);
        minion.reviveShieldHp -= absorbed;
        remaining -= absorbed;
      }
    }
    if (minion.stoneGolem) {
      if (!Number.isFinite(minion.golemShieldHp)) minion.golemShieldHp = 0;
      if (!Number.isFinite(minion.golemShieldMax)) minion.golemShieldMax = Math.max(0, minion.golemShieldHp);
      if (!Number.isFinite(minion.golemShieldTtl)) minion.golemShieldTtl = 0;
      if (minion.golemShieldTtl > 0 && minion.golemShieldHp > 0) {
        const absorbed = Math.min(remaining, minion.golemShieldHp);
        minion.golemShieldHp -= absorbed;
        remaining -= absorbed;
      }
    }
    if (remaining > 0 && minion.necrominion) {
      if (!Number.isFinite(minion.necroShieldHp)) minion.necroShieldHp = 0;
      if (!Number.isFinite(minion.necroShieldTtl)) minion.necroShieldTtl = 0;
      if (minion.necroShieldTtl > 0 && minion.necroShieldHp > 0) {
        const absorbed = Math.min(remaining, minion.necroShieldHp);
        minion.necroShieldHp -= absorbed;
        remaining -= absorbed;
      }
    }
    if (remaining > 0 && minion.shieldBearer && (Number(minion.shieldDarkMetalTtl) || 0) > 0) {
      remaining *= SHIELD_DARK_METAL_DAMAGE_TAKEN_MULT;
    }
    if (remaining > 0) minion.hp -= remaining;
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
    if (
      !side.towerGolemRescueUsed
      && side.towerHp > 0
      && side.towerHp <= TOWER_MAX_HP * STONE_GOLEM_HALF_HP_THRESHOLD
    ) {
      this.triggerTowerStoneGolem(sideName, tx, ty);
    }
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

  statSpecialCooldownMultiplier(matchTimeSec = null) {
    const t = Number.isFinite(matchTimeSec) ? matchTimeSec : this.t;
    const safeT = Math.max(0, Number(t) || 0);
    const totalSteps = Math.max(1, Math.round(SPECIAL_COOLDOWN_RAMP_SECONDS / SPECIAL_COOLDOWN_STEP_SECONDS));
    const elapsedSteps = Math.min(totalSteps, Math.floor(safeT / SPECIAL_COOLDOWN_STEP_SECONDS));
    const dropPerStep = (SPECIAL_COOLDOWN_START_MULT - SPECIAL_COOLDOWN_END_MULT) / totalSteps;
    const mult = SPECIAL_COOLDOWN_START_MULT - elapsedSteps * dropPerStep;
    return clamp(mult, SPECIAL_COOLDOWN_END_MULT, SPECIAL_COOLDOWN_START_MULT);
  }

  scaleSpecialCooldownEvery(baseEvery) {
    if (!Number.isFinite(baseEvery)) return baseEvery;
    return Math.max(1, Math.round(baseEvery * this.statSpecialCooldownMultiplier()));
  }

  statDragonEvery(side) {
    if (side.dragonLevel <= 0) return Infinity;
    const mythicPressure = Math.floor((side.powerLevel + side.economyLevel) / 6);
    const baseEvery = Math.max(34, 68 - side.dragonLevel * 5 - mythicPressure * 2);
    return this.scaleSpecialCooldownEvery(baseEvery);
  }

  statGunnerEvery(side) {
    const tech = Math.floor((side.unitLevel + side.arrowLevel + side.economyLevel) / 6);
    const baseEvery = Math.max(14, 22 - tech);
    return this.scaleSpecialCooldownEvery(baseEvery);
  }

  statRiderEvery(side) {
    const cavalryTech = Math.floor((side.unitLevel + side.spawnLevel + side.economyLevel) / 5);
    const baseEvery = Math.max(15, 23 - cavalryTech);
    return this.scaleSpecialCooldownEvery(baseEvery);
  }

  statDiggerEvery(side) {
    const burrowTech = Math.floor((side.unitHpLevel + side.spawnLevel + side.economyLevel) / 6);
    const baseEvery = Math.max(14, 24 - burrowTech);
    return this.scaleSpecialCooldownEvery(baseEvery);
  }

  statMonkEvery(side) {
    const supportTech = Math.floor((side.unitHpLevel + side.powerLevel + side.resourceLevel) / 7);
    const baseEvery = Math.max(20, 30 - supportTech);
    return this.scaleSpecialCooldownEvery(baseEvery);
  }

  statShieldEvery(side) {
    const wallTech = Math.floor((side.unitHpLevel + side.powerLevel + side.spawnLevel) / 6);
    const baseEvery = Math.max(17, 26 - wallTech);
    return this.scaleSpecialCooldownEvery(baseEvery * 4);
  }

  statHeroEvery(side) {
    const mythicTech = Math.floor((side.unitLevel + side.powerLevel + side.economyLevel) / 7);
    const baseEvery = Math.max(38, 56 - mythicTech) * 10;
    return this.scaleSpecialCooldownEvery(baseEvery);
  }

  statPresidentEvery(side) {
    const civicTech = Math.floor((side.economyLevel + side.resourceLevel + side.powerLevel) / 6);
    const baseEvery = Math.max(36, 54 - civicTech);
    return this.scaleSpecialCooldownEvery(baseEvery);
  }

  statNecroEvery() {
    return this.scaleSpecialCooldownEvery(12);
  }

  statSuperEvery(side) {
    if (side.superMinionLevel <= 0) return Infinity;
    const baseEvery = Math.max(28, 58 - side.superMinionLevel * 4);
    return this.scaleSpecialCooldownEvery(baseEvery);
  }

  statSpecialRateBonus(side) {
    const level = Math.max(1, Number(side?.specialRateLevel) || 1);
    return Math.min(0.24, (level - 1) * 0.03);
  }

  statSpecialSuccessChance(side, type) {
    const base = Number(SPECIAL_SPAWN_BASE_CHANCE[type]);
    if (!Number.isFinite(base)) return 0;
    let chance = base + this.statSpecialRateBonus(side);
    if (type === 'dragon') chance += Math.max(0, (Number(side?.dragonLevel) || 0) - 1) * 0.014;
    if (type === 'shield' && (Number(side?.shieldDarkMetalLevel) || 0) > 0) chance *= 2;
    if (type === 'super') chance += Math.max(0, (Number(side?.superMinionLevel) || 0) - 1) * 0.018;
    return clamp(chance, 0.08, 0.92);
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

  pointInDragonCone(targetX, targetY, originX, originY, dir, range, halfAngle = DRAGON_SUPER_BREATH_HALF_ANGLE) {
    const dx = (Number(targetX) || 0) - (Number(originX) || 0);
    const dy = (Number(targetY) || 0) - (Number(originY) || 0);
    const forward = dx * (dir >= 0 ? 1 : -1);
    if (forward <= 0 || forward > range) return false;
    const lateral = Math.abs(dy);
    const maxLateral = Math.tan(halfAngle) * forward + 8;
    return lateral <= maxLateral;
  }

  pointInDragonGroundCone(targetX, targetY, mouthX, mouthY, groundX, groundY, endWidth = DRAGON_SUPER_BREATH_GROUND_SCORCH_RADIUS) {
    const ax = (Number(groundX) || 0) - (Number(mouthX) || 0);
    const ay = (Number(groundY) || 0) - (Number(mouthY) || 0);
    const lenSq = ax * ax + ay * ay;
    if (lenSq <= 1) return false;
    const px = (Number(targetX) || 0) - (Number(mouthX) || 0);
    const py = (Number(targetY) || 0) - (Number(mouthY) || 0);
    const t = (px * ax + py * ay) / lenSq;
    if (t < 0 || t > 1) return false;
    const projX = (Number(mouthX) || 0) + ax * t;
    const projY = (Number(mouthY) || 0) + ay * t;
    const dist = Math.hypot((Number(targetX) || 0) - projX, (Number(targetY) || 0) - projY);
    const width = 12 + Math.max(28, endWidth) * t;
    return dist <= width;
  }

  dragonSuperBreath(dragon) {
    if (!dragon || !dragon.dragon) return;
    const dir = dragon.side === 'left' ? 1 : -1;
    const mouthX = dragon.x + dir * (dragon.r * 0.98);
    const mouthY = dragon.y - dragon.r * 0.34;
    const toX = clamp(mouthX + dir * (126 + dragon.r * 1.5), TOWER_X_LEFT + 44, TOWER_X_RIGHT - 44);
    const toY = clamp(mouthY + 184 + dragon.r * 0.8, TOWER_Y - 34, TOWER_Y + 212);

    if (Number.isFinite(dragon.flyBaseY)) {
      dragon.flyBaseY = clamp(dragon.flyBaseY - DRAGON_SUPER_BREATH_LIFT * 1.25, TOWER_Y - 238, TOWER_Y + 130);
    }

    dragon.dragonSuperBreathTtl = DRAGON_SUPER_BREATH_DURATION;
    dragon.dragonSuperBreathPulseCd = 0;
    dragon.dragonSuperBreathToX = toX;
    dragon.dragonSuperBreathToY = toY;
    dragon.dragonSuperBreathScorchDone = false;
    dragon.dragonBreathTtl = Math.max(Number(dragon.dragonBreathTtl) || 0, 0.34);
    dragon.dragonBreathToX = toX;
    dragon.dragonBreathToY = toY;

    this.queueHitSfx('dragonfire', mouthX, mouthY, dragon.side);
    this.queueHitSfx('powerup', toX, toY - 14, dragon.side);
    this.queueLine('SUPER BREATH!', dragon.x, dragon.y - dragon.r - 22, dragon.side);
  }

  applyDragonSuperBreathPulse(dragon, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!dragon || !dragon.dragon) return;
    const sideName = dragon.side === 'right' ? 'right' : 'left';
    const enemySideName = sideName === 'left' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const mouthX = dragon.x + dir * (dragon.r * 0.98);
    const mouthY = dragon.y - dragon.r * 0.34;
    const toX = Number.isFinite(dragon.dragonSuperBreathToX)
      ? dragon.dragonSuperBreathToX
      : clamp(mouthX + dir * (126 + dragon.r * 1.5), TOWER_X_LEFT + 44, TOWER_X_RIGHT - 44);
    const toY = Number.isFinite(dragon.dragonSuperBreathToY)
      ? dragon.dragonSuperBreathToY
      : clamp(mouthY + 184 + dragon.r * 0.8, TOWER_Y - 34, TOWER_Y + 212);
    const lineLen = Math.hypot(toX - mouthX, toY - mouthY);
    const scanR = lineLen + DRAGON_SUPER_BREATH_GROUND_SCORCH_RADIUS;
    const centerX = (mouthX + toX) * 0.5;
    const centerY = (mouthY + toY) * 0.5;

    this.queueHitSfx('dragonfire', mouthX, mouthY, dragon.side);
    this.queueHitSfx('dragonfire', toX + (Math.random() * 18 - 9), toY + (Math.random() * 12 - 6), dragon.side);

    const victims = [];
    this.forEachEnemyMinionInRadius(
      dragon.side,
      centerX,
      centerY,
      scanR,
      minionBuckets,
      bucketW,
      (other) => {
        if (!this.pointInDragonGroundCone(other.x, other.y, mouthX, mouthY, toX, toY)) return;
        victims.push(other);
      }
    );
    for (const victim of victims) {
      if (!victim || victim.removed || victim.side === dragon.side) continue;
      const toVictim = Math.hypot((Number(victim.x) || 0) - toX, (Number(victim.y) || 0) - toY);
      const endpointBias = 1 - Math.min(1, toVictim / Math.max(1, DRAGON_SUPER_BREATH_GROUND_SCORCH_RADIUS * 1.15));
      const damage = dragon.dmg * DRAGON_SUPER_BREATH_CHANNEL_DAMAGE_MULT * (0.72 + endpointBias * 0.56);
      this.dealMinionDamage(dragon, victim, damage, 'dragonfire');
      victim.hitFlashTtl = Math.max(Number(victim.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
      if (victim.hp <= 0) this.killMinionByRef(victim, dragon.side, { goldScalar: 0.85 });
    }

    const enemyCandle = this.candles?.[enemySideName];
    if (enemyCandle && !enemyCandle.destroyed && !enemyCandle.delivering) {
      const dx = enemyCandle.x - toX;
      const dy = (enemyCandle.y - 8) - toY;
      if (dx * dx + dy * dy <= DRAGON_SUPER_BREATH_GROUND_SCORCH_RADIUS * DRAGON_SUPER_BREATH_GROUND_SCORCH_RADIUS) {
        this.hitCandleWithMinion(enemyCandle, dragon);
      }
    }

    const enemyX = sideName === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
    const towerY = TOWER_Y - 26;
    if (this.pointInDragonGroundCone(enemyX, towerY, mouthX, mouthY, toX, toY)) {
      this.applyMinionTowerDamage(
        dragon,
        enemySideName,
        dragon.dmg * DRAGON_SUPER_BREATH_TOWER_DAMAGE_MULT * DRAGON_SUPER_BREATH_CHANNEL_TOWER_MULT,
        enemyX,
        towerY
      );
      this.queueHitSfx('towerhit', enemyX, towerY, enemySideName);
    }
  }

  tickDragonSuperBreathChannel(dragon, dt, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!dragon || !dragon.dragon) return false;
    if (!Number.isFinite(dragon.dragonSuperBreathTtl) || dragon.dragonSuperBreathTtl <= 0) return false;
    if (!Number.isFinite(dragon.dragonSuperBreathPulseCd)) dragon.dragonSuperBreathPulseCd = 0;

    dragon.dragonSuperBreathTtl = Math.max(0, dragon.dragonSuperBreathTtl - dt);
    dragon.dragonSuperBreathPulseCd -= dt;
    dragon.dragonBreathTtl = Math.max(Number(dragon.dragonBreathTtl) || 0, 0.28);
    if (Number.isFinite(dragon.dragonSuperBreathToX)) dragon.dragonBreathToX = dragon.dragonSuperBreathToX;
    if (Number.isFinite(dragon.dragonSuperBreathToY)) dragon.dragonBreathToY = dragon.dragonSuperBreathToY;

    while (dragon.dragonSuperBreathPulseCd <= 0 && dragon.dragonSuperBreathTtl > 0) {
      this.applyDragonSuperBreathPulse(dragon, minionBuckets, bucketW);
      dragon.dragonSuperBreathPulseCd += DRAGON_SUPER_BREATH_TICK;
    }

    if (dragon.dragonSuperBreathTtl === 0 && !dragon.dragonSuperBreathScorchDone) {
      dragon.dragonSuperBreathScorchDone = true;
      const sx = Number.isFinite(dragon.dragonSuperBreathToX) ? dragon.dragonSuperBreathToX : dragon.x;
      const sy = Number.isFinite(dragon.dragonSuperBreathToY) ? dragon.dragonSuperBreathToY : (dragon.y + 90);
      this.candleScorches.push({
        x: sx,
        y: sy + 8,
        r: DRAGON_SUPER_BREATH_GROUND_SCORCH_RADIUS,
        ttl: DRAGON_SUPER_BREATH_GROUND_SCORCH_TTL,
        smokeShieldTtl: 0,
        smokeShieldMaxTtl: 0,
        smokeShieldRx: 0,
        smokeShieldRy: 0,
        smokeShieldYOffset: 0,
        side: dragon.side,
        candleSide: dragon.side,
        allyDps: 0,
        enemyDps: DRAGON_SUPER_BREATH_GROUND_SCORCH_ENEMY_DPS,
        towerSide: null,
        towerBurnDps: 0,
        towerBurnTick: 0,
      });
    }
    return dragon.dragonSuperBreathTtl > 0;
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

  gunnerSkyCannon(gunner, impactX, impactY) {
    if (!gunner || !gunner.gunner) return;
    const sideName = gunner.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const enemyTowerX = sideName === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
    const strikeX = clamp(Number(impactX) || enemyTowerX, TOWER_X_LEFT + 38, TOWER_X_RIGHT - 38);
    const strikeY = clamp(Number(impactY) || (TOWER_Y - 24), TOWER_Y - 180, TOWER_Y + 212);
    gunner.gunnerSkyCannonSetupTtl = GUNNER_SKY_CANNON_SETUP_TIME;
    gunner.gunnerSkyCannonAimX = strikeX;
    gunner.gunnerSkyCannonAimY = strikeY;
    gunner.gunnerSkyCannonCd = GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER;
    this.queueLine('SETTING CANNON!', gunner.x, gunner.y - gunner.r - 18, sideName);
    this.queueHitSfx('powerup', gunner.x + dir * (gunner.r * 0.7), gunner.y - gunner.r * 0.5, sideName);
  }

  launchGunnerSkyCannonBall(gunner) {
    if (!gunner || !gunner.gunner) return;
    const sideName = gunner.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const muzzleX = gunner.x + dir * (gunner.r + 7);
    const muzzleY = gunner.y - 2;
    const impactX = clamp(
      Number(gunner.gunnerSkyCannonAimX) || gunner.x + dir * 80,
      TOWER_X_LEFT + 38,
      TOWER_X_RIGHT - 38
    );
    const impactY = clamp(
      Number(gunner.gunnerSkyCannonAimY) || (TOWER_Y - 24),
      TOWER_Y - 180,
      TOWER_Y + 212
    );

    gunner.gunnerSkyCannonSetupTtl = 0;
    gunner.gunnerSkyCannonAimX = null;
    gunner.gunnerSkyCannonAimY = null;
    gunner.gunFlashTtl = Math.max(Number(gunner.gunFlashTtl) || 0, 0.18);
    this.queueHitSfx('gunhit', muzzleX, muzzleY, sideName);
    this.queueHitSfx('powerup', impactX, GUNNER_SKY_CANNON_SKY_SPAWN_Y + 8, sideName);
    this.queueLine('SKY CANNON!', gunner.x, gunner.y - gunner.r - 18, sideName);

    this.cannonBalls.push({
      id: this.seq++,
      side: sideName,
      x: impactX + (Math.random() * 14 - 7),
      y: GUNNER_SKY_CANNON_SKY_SPAWN_Y,
      r: 13 + (gunner.super ? 1.5 : 0),
      vx: Math.random() * 18 - 9,
      vy: GUNNER_SKY_CANNON_FALL_SPEED + Math.random() * 36,
      impactX,
      impactY,
      baseDamage: this.minionOutgoingDamage(gunner, gunner.dmg),
      sourceSuper: Boolean(gunner.super),
    });
  }

  resolveGunnerSkyCannonImpact(ball, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!ball) return;
    const sideName = ball.side === 'right' ? 'right' : 'left';
    const enemySideName = sideName === 'left' ? 'right' : 'left';
    const enemyTowerX = sideName === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
    const strikeX = clamp(Number(ball.impactX) || Number(ball.x) || enemyTowerX, TOWER_X_LEFT + 38, TOWER_X_RIGHT - 38);
    const strikeY = clamp(Number(ball.impactY) || Number(ball.y) || (TOWER_Y - 24), TOWER_Y - 180, TOWER_Y + 212);
    const radius = GUNNER_SKY_CANNON_RADIUS + Math.max(0, (Number(ball.r) || 12) * 0.42);
    const baseDamage = Math.max(1, Number(ball.baseDamage) || 1);

    this.queueHitSfx('explosion', strikeX, strikeY, sideName);

    const victims = [];
    this.forEachEnemyMinionInRadius(
      sideName,
      strikeX,
      strikeY,
      radius,
      minionBuckets,
      bucketW,
      (other) => victims.push(other)
    );

    for (const victim of victims) {
      if (!victim || victim.removed || victim.side === sideName) continue;
      const dx = victim.x - strikeX;
      const dy = victim.y - strikeY;
      const dist = Math.hypot(dx, dy);
      const t = 1 - Math.min(1, dist / radius);
      const styleMul = this.minionDamageMultiplier(
        { side: sideName, super: Boolean(ball.sourceSuper), gunner: true },
        victim,
        'gunshot'
      );
      const damage = baseDamage * styleMul * GUNNER_SKY_CANNON_MINION_DAMAGE_MULT * (0.66 + t * 0.44);
      this.dealDamageToMinion(victim, damage);
      victim.hitFlashTtl = Math.max(Number(victim.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
      if (victim.hp <= 0) this.killMinionByRef(victim, sideName, { goldScalar: 0.88 });
    }

    const enemyCandle = this.candles?.[enemySideName];
    if (enemyCandle && !enemyCandle.destroyed && !enemyCandle.delivering) {
      const dx = enemyCandle.x - strikeX;
      const dy = (enemyCandle.y - 8) - strikeY;
      if (dx * dx + dy * dy <= radius * radius) this.hitCandleWithMinion(enemyCandle, { side: sideName, gunner: true });
    }

    if (Math.abs(strikeX - enemyTowerX) <= radius * 0.86 + GUNNER_SKY_CANNON_IMPACT_PAD) {
      this.dealDamageToTower(
        enemySideName,
        baseDamage * GUNNER_SKY_CANNON_TOWER_DAMAGE_MULT,
        enemyTowerX,
        TOWER_Y - 24,
        'unit'
      );
    }
  }

  riderHitDamage(rider, hitX = null, hitY = null) {
    const base = Math.max(0, Number(rider?.dmg) || 0);
    if (!rider || !rider.rider || !rider.riderChargeReady) return base;

    rider.riderChargeReady = false;
    const originX = Number.isFinite(rider.riderChargeStartX) ? rider.riderChargeStartX : rider.x;
    const distance = Math.abs(rider.x - originX);
    const threshold = Math.max(90, Number(rider.riderChargeDistance) || 170);
    if (distance < threshold) return base;

    const baseMul = Math.max(1.4, Number(rider.riderChargeMul) || 2.2);
    const mul = rider.riderSuperHorse ? Math.max(baseMul, baseMul * 1.28) : baseMul;
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

  stoneGolemSmash(golem, enemySideName, enemyX, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!golem || !golem.stoneGolem) return;
    const sideName = golem.side === 'right' ? 'right' : 'left';
    const awayFromAllyTowerDir = sideName === 'left' ? 1 : -1;
    const smashR = Math.max(STONE_GOLEM_SMASH_RADIUS, (Number(golem.r) || 28) * 2.35);
    const baseDamage = this.minionOutgoingDamage(golem, (Number(golem.dmg) || 0) * STONE_GOLEM_DAMAGE_MULT * 3);
    const victims = [];
    let hitAny = false;

    this.forEachEnemyMinionInRadius(
      sideName,
      golem.x,
      golem.y,
      smashR,
      minionBuckets,
      bucketW,
      (other) => {
        if (!other || other.id === golem.id) return;
        victims.push(other);
      }
    );

    for (const other of victims) {
      if (!other || other.removed || other.side === sideName || other.id === golem.id) continue;
      hitAny = true;
      this.dealMinionDamage(golem, other, baseDamage, 'melee');
      const knock = STONE_GOLEM_SMASH_KNOCKBACK * (other.dragon ? 0.34 : other.super ? 0.62 : 1);
      other.x = clamp(other.x + awayFromAllyTowerDir * knock, TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);
      if (other.flying && Number.isFinite(other.flyBaseY)) {
        other.flyBaseY += (other.y - other.flyBaseY) * 0.08;
      }
      if (other.hp <= 0) this.killMinionByRef(other, sideName, { goldScalar: 0.9 });
    }

    if (Math.abs(golem.x - enemyX) <= STONE_GOLEM_SMASH_TOWER_RADIUS) {
      hitAny = true;
      this.applyMinionTowerDamage(golem, enemySideName, baseDamage * 0.72, enemyX, TOWER_Y - 18);
    }

    golem.golemSmashTtl = STONE_GOLEM_SMASH_TTL;
    this.queueHitSfx('golemsmash', golem.x, golem.y + 4, sideName);
    this.queueHitSfx(hitAny ? 'explosion' : 'powerup', golem.x, golem.y + 4, sideName);
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
    const sideState = monk.side === 'right' ? this.right : this.left;
    const healCircleActive = (Number(sideState?.monkHealCircleLevel) || 0) > 0;
    if (!Number.isFinite(monk.monkHealCircleCd)) {
      monk.monkHealCircleCd = MONK_HEAL_CIRCLE_INTERVAL + Math.random() * MONK_HEAL_CIRCLE_COOLDOWN_JITTER;
    }
    if (healCircleActive) {
      monk.monkHealCircleCd = Math.max(0, monk.monkHealCircleCd - dt);
    } else {
      monk.monkHealCircleCd = MONK_HEAL_CIRCLE_INTERVAL + Math.random() * MONK_HEAL_CIRCLE_COOLDOWN_JITTER;
    }

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

    if (healCircleActive && monk.monkHealCircleCd === 0) {
      const baseHeal = Math.max(12, Number(monk.monkHealBase) || Math.max(32, monk.maxHp * 0.48));
      const pulseHeal = baseHeal * Math.max(minScale, monk.monkHealScale || 1) * MONK_HEAL_CIRCLE_HEAL_MULT;
      const pulseRange = Math.max(84, (Math.max(90, Number(monk.monkHealRange) || 170) * MONK_HEAL_CIRCLE_RANGE_MULT));
      const pulseR2 = pulseRange * pulseRange;
      let healedAny = false;
      for (const ally of this.minions) {
        if (!ally || ally.side !== monk.side) continue;
        const missing = Math.max(0, (Number(ally.maxHp) || 0) - (Number(ally.hp) || 0));
        if (missing <= 0.5) continue;
        const dx = ally.x - monk.x;
        const dy = ally.y - monk.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > pulseR2) continue;
        const dist = Math.sqrt(d2);
        const close = 1 - Math.min(1, dist / pulseRange);
        const falloffMul = MONK_HEAL_CIRCLE_MIN_HEAL_FRACTION + close * (1 - MONK_HEAL_CIRCLE_MIN_HEAL_FRACTION);
        const healed = this.healMinion(ally, pulseHeal * falloffMul);
        if (healed <= 0) continue;
        healedAny = true;
      }
      if (healedAny) {
        this.queueHitSfx('healcircle', monk.x, monk.y, monk.side, { r: roundTo(pulseRange, 1) });
        this.queueHitSfx('powerup', monk.x, monk.y - 6, monk.side);
        monk.monkHealScale = Math.max(minScale, monk.monkHealScale * MONK_HEAL_CIRCLE_SCALE_DECAY);
      }
      monk.monkHealCircleCd = MONK_HEAL_CIRCLE_INTERVAL + Math.random() * MONK_HEAL_CIRCLE_COOLDOWN_JITTER;
    }

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
    this.queueHitSfx('healbeam', target.x, target.y - Math.max(8, target.r * 0.2), monk.side, {
      fromX: monk.x,
      fromY: monk.y - Math.max(10, monk.r * 0.48),
      toX: target.x,
      toY: target.y - Math.max(8, target.r * 0.2),
    });
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

  triggerTowerStoneGolem(sideName, x, y) {
    const side = this[sideName];
    if (!side || side.towerGolemRescueUsed) return;
    side.towerGolemRescueUsed = true;

    const golem = this.spawnMinion(sideName, { forceType: 'stonegolem', countSpawn: false });
    const gx = golem?.x ?? (sideName === 'left' ? TOWER_X_LEFT + 64 : TOWER_X_RIGHT - 64);
    const gy = golem?.y ?? (TOWER_Y + 12);
    this.queueHitSfx('explosion', gx, gy, sideName);
    this.queueLine('Stone golem awakened!', gx, gy - (golem?.r || 24) - 24, sideName);

    // Spawn with an immediate smash as requested.
    if (golem) {
      const enemySide = sideName === 'left' ? 'right' : 'left';
      const enemyTowerX = sideName === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
      this.stoneGolemSmash(golem, enemySide, enemyTowerX);
      golem.atkCd = STONE_GOLEM_SMASH_INTERVAL;
    }

    this.queueHitSfx('powerup', x, y, sideName);
  }

  awardMinionKillGold(killerSide, scalar = 1) {
    if (killerSide === 'left') this.left.gold += this.goldFromMinionKill(this.left, scalar);
    else if (killerSide === 'right') this.right.gold += this.goldFromMinionKill(this.right, scalar);
  }

  queueMinionDeathGhost(minion, killerSide = null) {
    if (!minion) return;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const ghost = {
      side: sideName,
      x: roundTo(minion.x, 1),
      y: roundTo(minion.y, 1),
      r: roundTo(Math.max(8, Number(minion.r) || 14), 2),
      tier: Math.max(0, Math.round(Number(minion.tier) || 0)),
      level: Math.max(0, Math.round(Number(minion.level) || 0)),
      super: Boolean(minion.super),
      summoned: Boolean(minion.summoned),
      necroRevived: Boolean(minion.necroRevived),
      explosive: Boolean(minion.explosive),
      gunner: Boolean(minion.gunner),
      rider: Boolean(minion.rider),
      riderChargeReady: Boolean(minion.riderChargeReady),
      riderSuperHorse: Boolean(minion.riderSuperHorse),
      digger: Boolean(minion.digger),
      diggerGoldFinder: Boolean(minion.diggerGoldFinder),
      dragonSuperBreathUpgraded: Boolean(minion.dragonSuperBreathUpgraded),
      shieldDarkMetalUpgraded: Boolean(minion.shieldDarkMetalUpgraded),
      monkHealCircleUpgraded: Boolean(minion.monkHealCircleUpgraded),
      necroExpertUpgraded: Boolean(minion.necroExpertUpgraded),
      gunnerSkyCannonUpgraded: Boolean(minion.gunnerSkyCannonUpgraded),
      shieldBearer: Boolean(minion.shieldBearer),
      stoneGolem: Boolean(minion.stoneGolem),
      monk: Boolean(minion.monk),
      hero: Boolean(minion.hero),
      president: Boolean(minion.president),
      dragon: Boolean(minion.dragon),
      flying: Boolean(minion.flying),
      necrominion: Boolean(minion.necrominion),
      failedSpecialType: typeof minion.failedSpecialType === 'string' ? minion.failedSpecialType : null,
      digPhase: Number.isFinite(minion.digPhase) ? minion.digPhase : (Math.random() * Math.PI * 2),
      flyPhase: Number.isFinite(minion.flyPhase) ? minion.flyPhase : (Math.random() * Math.PI * 2),
      heroSwing: Number.isFinite(minion.heroSwing) ? minion.heroSwing : (Math.random() * Math.PI * 2),
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunFlashTtl: 0,
      shieldPushTtl: 0,
      shieldPushScale: 1,
      shieldDarkMetalTtl: roundTo(minion.shieldDarkMetalTtl, 2),
      golemSmashTtl: 0,
      golemShieldHp: 0,
      golemShieldMax: 0,
      golemShieldTtl: 0,
      hitFlashTtl: 0,
      monkHealScale: Number.isFinite(minion.monkHealScale) ? minion.monkHealScale : 1,
    };
    const killer = killerSide === 'left' || killerSide === 'right' ? killerSide : null;
    this.queueHitSfx('ghostfall', ghost.x, ghost.y, sideName, { killerSide: killer, ghost });
  }

  killMinion(index, killerSide = null, options = {}) {
    const minion = this.minions[index];
    if (!minion) return;

    const {
      goldScalar = 1,
      triggerExplosion = false,
      impactDamage = null,
    } = options;

    if (this.tryNecroExpertRevive(minion, killerSide)) {
      minion.removed = true;
      this.minions.splice(index, 1);
      return;
    }

    this.awardMinionKillGold(killerSide, goldScalar);
    if (minion.hero) this.triggerHeroDramaticDeath(minion, killerSide);
    this.queueMinionDeathGhost(minion, killerSide);
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

  canNecroExpertRevive(minion) {
    if (!minion || minion.removed) return false;
    if ((Number(minion.hp) || 0) > 0) return false;
    if (minion.summoned || minion.necroRevived) return false;
    if (minion.candleCarrier) return false;
    return true;
  }

  findClosestNecroReviver(minion, radius = NECRO_EXPERT_REVIVE_RADIUS) {
    if (!minion) return null;
    const allySide = minion.side === 'right' ? 'right' : 'left';
    const radiusSq = radius * radius;
    let best = null;
    let bestSq = Infinity;
    for (const other of this.minions) {
      if (!other || other.removed || !other.necrominion) continue;
      if ((other.side === 'right' ? 'right' : 'left') !== allySide) continue;
      if ((Number(other.hp) || 0) <= 0) continue;
      if (other.id === minion.id) continue;
      const sideState = other.side === 'right' ? this.right : this.left;
      if ((Number(sideState?.necroExpertSummonerLevel) || 0) <= 0) continue;
      const dx = other.x - minion.x;
      const dy = other.y - minion.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > radiusSq || d2 >= bestSq) continue;
      bestSq = d2;
      best = other;
    }
    return best;
  }

  createNecroRevivedMinion(minion, reviver) {
    if (!minion || !reviver) return null;
    const sideName = reviver.side === 'right' ? 'right' : 'left';
    const sideState = sideName === 'right' ? this.right : this.left;
    const dir = sideName === 'left' ? 1 : -1;
    const originalMaxHp = Math.max(1, Number(minion.maxHp) || 1);
    const revivedMaxHp = Math.max(1, Math.round(Math.max(1, Number(minion.maxHp) || 1) * NECRO_EXPERT_REVIVE_HP_FRACTION));
    const x = clamp((Number(minion.x) || 0) + dir * 8 + (Math.random() * 10 - 5), TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);
    const y = clamp((Number(minion.y) || 0) + (Math.random() * 8 - 4), TOWER_Y - 190, TOWER_Y + 190);
    const revived = {
      ...minion,
      id: this.seq++,
      side: sideName,
      x,
      y,
      hp: revivedMaxHp,
      maxHp: revivedMaxHp,
      atkCd: Math.max(0.18, Number(minion.atkCd) || 0),
      removed: false,
      summoned: true,
      necroRevived: true,
      candleCarrier: false,
      candleCarrierSide: null,
      candleBurnTtl: 0,
      candleBurnTick: 0,
      hitFlashTtl: 0,
      gunnerSkyCannonCd: 0,
      gunnerSkyCannonSetupTtl: 0,
      gunnerSkyCannonAimX: null,
      gunnerSkyCannonAimY: null,
      diggerMineTargetId: null,
      diggerMineT: 0,
      necroShieldHp: 0,
      necroShieldMax: 0,
      necroShieldTtl: 0,
      necroShieldMaxTtl: NECRO_SELF_SHIELD_FADE_SECONDS,
      reviveShieldHp: originalMaxHp,
      reviveShieldMax: originalMaxHp,
      reviveShieldTtl: NECRO_REVIVE_SHIELD_SECONDS,
      reviveShieldMaxTtl: NECRO_REVIVE_SHIELD_SECONDS,
      failedSpecialType: null,
    };

    revived.dragonSuperBreathUpgraded = revived.dragon
      ? (Number(sideState?.dragonSuperBreathLevel) || 0) > 0
      : false;
    revived.shieldDarkMetalUpgraded = revived.shieldBearer
      ? (Number(sideState?.shieldDarkMetalLevel) || 0) > 0
      : false;
    revived.monkHealCircleUpgraded = revived.monk
      ? (Number(sideState?.monkHealCircleLevel) || 0) > 0
      : false;
    revived.necroExpertUpgraded = revived.necrominion
      ? (Number(sideState?.necroExpertSummonerLevel) || 0) > 0
      : false;
    revived.gunnerSkyCannonUpgraded = revived.gunner
      ? (Number(sideState?.gunnerSkyCannonLevel) || 0) > 0
      : false;

    if (revived.flying) {
      revived.flyBaseY = y;
      if (!Number.isFinite(revived.flyPhase)) revived.flyPhase = Math.random() * Math.PI * 2;
      revived.dragonBreathTtl = 0;
      revived.dragonBreathToX = null;
      revived.dragonBreathToY = null;
      revived.dragonSuperBreathCd = DRAGON_SUPER_BREATH_INTERVAL * 0.5;
      revived.dragonSuperBreathTtl = 0;
      revived.dragonSuperBreathPulseCd = 0;
      revived.dragonSuperBreathToX = null;
      revived.dragonSuperBreathToY = null;
      revived.dragonSuperBreathScorchDone = false;
    }
    if (revived.digger) {
      revived.digBaseY = y;
      if (!Number.isFinite(revived.digPhase)) revived.digPhase = Math.random() * Math.PI * 2;
    }
    if (revived.gunner) {
      revived.gunnerSkyCannonCd = (Number(sideState?.gunnerSkyCannonLevel) || 0) > 0
        ? (GUNNER_SKY_CANNON_INTERVAL * 0.42 + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER)
        : (GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER);
      revived.gunnerSkyCannonSetupTtl = 0;
      revived.gunnerSkyCannonAimX = null;
      revived.gunnerSkyCannonAimY = null;
    }
    if (revived.necrominion) {
      revived.necroShieldMax = revived.maxHp;
      revived.necroShieldHp = revived.maxHp;
      revived.necroShieldTtl = NECRO_SELF_SHIELD_FADE_SECONDS;
      revived.necroShieldMaxTtl = NECRO_SELF_SHIELD_FADE_SECONDS;
    }
    if (revived.rider) {
      revived.riderChargeReady = true;
      revived.riderChargeStartX = x;
    }
    if (revived.hero) {
      revived.heroRetreating = false;
      revived.heroArrowHits = 0;
    }
    if (revived.monk) {
      revived.monkFirstHeal = true;
      revived.monkHealScale = Math.max(0.4, Number(revived.monkHealScale) || 1);
      revived.monkHealCircleCd = MONK_HEAL_CIRCLE_INTERVAL;
    }
    if (revived.president) {
      revived.presidentSetup = false;
      revived.presidentPodiumX = sideName === 'left'
        ? (700 + Math.random() * 55)
        : (WORLD_W - (700 + Math.random() * 55));
      revived.presidentPodiumY = TOWER_Y + 18 + (Math.random() * 24 - 12);
      revived.presidentSpeechCd = 1 + Math.random() * 1.4;
    }
    return revived;
  }

  tryNecroExpertRevive(minion, killerSide = null) {
    if (!this.canNecroExpertRevive(minion)) return false;
    const reviver = this.findClosestNecroReviver(minion);
    if (!reviver) return false;
    const revived = this.createNecroRevivedMinion(minion, reviver);
    if (!revived) return false;
    this.minions.push(revived);
    this.queueHitSfx('powerup', revived.x, revived.y - Math.max(6, revived.r * 0.2), reviver.side);
    this.queueHitSfx('revive', revived.x, revived.y, reviver.side, {
      killerSide,
      ghost: revived,
      fromX: reviver.x,
      fromY: reviver.y - Math.max(8, reviver.r * 0.3),
      toX: revived.x,
      toY: revived.y - Math.max(8, revived.r * 0.24),
    });
    return true;
  }

  createNecroServant(minion, x, y, options = {}) {
    const hpMul = Number.isFinite(options.hpMul) ? Math.max(0.1, options.hpMul) : 1;
    const dmgMul = Number.isFinite(options.dmgMul) ? Math.max(0.1, options.dmgMul) : 1;
    const speedMul = Number.isFinite(options.speedMul) ? Math.max(0.2, options.speedMul) : 1;
    const radiusMul = Number.isFinite(options.radiusMul) ? Math.max(0.25, options.radiusMul) : 1;
    const levelMul = Number.isFinite(options.levelMul) ? Math.max(0.2, options.levelMul) : 1;
    const tierOffset = Number.isFinite(options.tierOffset) ? Math.round(options.tierOffset) : 0;
    const atkCd = Number.isFinite(options.atkCd) ? Math.max(0, options.atkCd) : (Math.random() * 0.18);

    const baseHp = Math.max(30, (Number(minion?.maxHp) || 0) * 0.38) * hpMul;
    const baseDmg = Math.max(7, (Number(minion?.dmg) || 0) * 0.42) * dmgMul;
    const speed = Math.max(56, (Number(minion?.speed) || 0) * 1.14) * speedMul;
    const radius = Math.max(10, (Number(minion?.r) || 0) * 0.52 * radiusMul);
    const baseTier = Math.max(0, Math.min(2, ((Number(minion?.tier) || 0) - 1)));
    const tier = Math.max(0, Math.min(2, baseTier + tierOffset));
    const level = Math.max(1, Math.floor(Math.max(1, Number(minion?.level) || 1) * 0.55 * levelMul));

    return {
      id: this.seq++,
      side: minion.side,
      x,
      y,
      hp: baseHp,
      maxHp: baseHp,
      dmg: baseDmg,
      speed,
      atkCd,
      r: radius,
      tier,
      level,
      super: false,
      explosive: false,
      explosiveLevel: 1,
      necrominion: false,
      summoned: true,
      necroRevived: false,
      dragon: false,
      flying: false,
      gunner: false,
      rider: false,
      riderChargeReady: false,
      riderSuperHorse: false,
      dragonSuperBreathUpgraded: false,
      shieldDarkMetalUpgraded: false,
      monkHealCircleUpgraded: false,
      necroExpertUpgraded: false,
      gunnerSkyCannonUpgraded: false,
      riderChargeStartX: null,
      riderChargeDistance: 0,
      riderChargeMul: 1,
      digger: false,
      diggerGoldFinder: false,
      diggerMineTargetId: null,
      diggerMineT: 0,
      shieldBearer: false,
      shieldPushCd: 0,
      shieldPushTtl: 0,
      shieldPushScale: 1,
      shieldDarkMetalCd: 0,
      shieldDarkMetalTtl: 0,
      stoneGolem: false,
      golemSmashTtl: 0,
      golemShieldHp: 0,
      golemShieldMax: 0,
      golemShieldTtl: 0,
      necroShieldHp: 0,
      necroShieldMax: 0,
      necroShieldTtl: 0,
      necroShieldMaxTtl: NECRO_SELF_SHIELD_FADE_SECONDS,
      reviveShieldHp: 0,
      reviveShieldMax: 0,
      reviveShieldTtl: 0,
      reviveShieldMaxTtl: NECRO_REVIVE_SHIELD_SECONDS,
      hitFlashTtl: 0,
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
      monkHealCircleCd: 0,
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
      gunnerSkyCannonCd: 0,
      gunnerSkyCannonSetupTtl: 0,
      gunnerSkyCannonAimX: null,
      gunnerSkyCannonAimY: null,
      dragonSuperBreathCd: 0,
      dragonSuperBreathTtl: 0,
      dragonSuperBreathPulseCd: 0,
      dragonSuperBreathToX: null,
      dragonSuperBreathToY: null,
      dragonSuperBreathScorchDone: false,
      candleCarrier: false,
      candleCarrierSide: null,
      candleBurnTtl: 0,
      candleBurnTick: 0,
      failedSpecialType: null,
    };
  }

  raiseNecroServants(minion) {
    const servantCount = minion.super ? 6 : 4;
    const ring = minion.r + 22;
    this.queueHitSfx('powerup', minion.x, minion.y, minion.side);

    for (let i = 0; i < servantCount; i += 1) {
      const angle = (Math.PI * 2 * i) / servantCount + Math.random() * 0.45;
      const radial = ring + (Math.random() * 14 - 7);
      const x = clamp(minion.x + Math.cos(angle) * radial, TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);
      const y = clamp(minion.y + Math.sin(angle) * Math.min(28, ring * 0.55), TOWER_Y - 170, TOWER_Y + 170);
      this.minions.push(this.createNecroServant(minion, x, y));
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
    const angleSteps = [0];
    for (let step = 1; angleSteps.length < count; step += 1) {
      // Add upper arc first, then fill the lower matching arc on the next Arrow Count upgrade.
      angleSteps.push(step);
      if (angleSteps.length < count) angleSteps.push(-step);
    }
    if (activePower) {
      side.pendingShotPowerShots = Math.max(0, side.pendingShotPowerShots - 1);
      if (side.pendingShotPowerShots === 0) side.pendingShotPower = null;
    } else {
      side.pendingShotPower = null;
      side.pendingShotPowerShots = 0;
    }

    for (let i = 0; i < angleSteps.length; i += 1) {
      const angleStep = angleSteps[i];
      const isMainArrow = angleStep === 0;
      const localAngle = Math.max(
        0,
        Math.min(Math.PI / 2, launch.angle + angleStep * spread)
      );
      const offsetFromCenter = Math.abs(angleStep);
      const isUnderArcArrow = angleStep < 0;
      const underDelayMul = isUnderArcArrow ? MULTI_SIDE_ARROW_UNDER_DELAY_MUL : 1;
      const launchDelay = Math.min(
        MULTI_SIDE_ARROW_DELAY_MAX,
        offsetFromCenter * MULTI_SIDE_ARROW_DELAY_STEP * underDelayMul
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
        ttl: ARROW_FLIGHT_TTL,
        r: isMainArrow ? radius + 1.4 : radius,
        pierce,
        powerType,
        flameSplash,
        flameBurn,
        gravity,
        launchDelay,
        mainArrow: isMainArrow,
        comboTier: comboMul,
        stuck: false,
        stuckAngle: null,
        stuckTtl: 0,
        stuckTtlMax: 0,
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
    if (!Array.isArray(side.pendingSpecialSpawns)) side.pendingSpecialSpawns = [];
    if (!side.specialRollByType || typeof side.specialRollByType !== 'object') side.specialRollByType = {};
    const x = sideName === 'left' ? TOWER_X_LEFT + 56 : TOWER_X_RIGHT - 56;
    let hp = this.statMinionHp(side);
    let dmg = this.statMinionDamage(side);
    let speed = 54 + side.unitLevel * 1.5 + side.economyLevel * 0.6;
    const power = side.unitLevel + side.unitHpLevel + side.economyLevel;
    let tier = Math.min(3, Math.floor(power / 8));
    const naturalSpawn = !forceType;
    const dragonEvery = this.statDragonEvery(side);
    const shieldEvery = this.statShieldEvery(side);
    const diggerEvery = this.statDiggerEvery(side);
    const necroEvery = this.statNecroEvery(side);
    const gunnerEvery = this.statGunnerEvery(side);
    const riderEvery = this.statRiderEvery(side);
    const monkEvery = this.statMonkEvery(side);
    const heroEvery = this.statHeroEvery(side);
    const presidentEvery = this.statPresidentEvery(side);
    const superEvery = this.statSuperEvery(side);

    if (naturalSpawn) {
      this.stepCandleSpawnCycle(sideName);
      const dueByType = {
        dragon: Number.isFinite(dragonEvery) && side.spawnCount % dragonEvery === 0,
        shield: side.spawnCount % shieldEvery === 0,
        digger: side.spawnCount % diggerEvery === 0,
        necrominion: side.spawnCount % necroEvery === 0,
        gunner: side.spawnCount % gunnerEvery === 0,
        rider: side.spawnCount % riderEvery === 0,
        monk: side.spawnCount % monkEvery === 0,
        // Hero's signature moment is still tower-first-hit rescue.
        // Natural hero training only unlocks after this side's tower has been damaged once.
        hero: side.towerDamagedOnce && side.spawnCount % heroEvery === 0,
        president: side.spawnCount % presidentEvery === 0,
        super: Number.isFinite(superEvery) && side.spawnCount % superEvery === 0,
      };
      for (const type of SPECIAL_SPAWN_QUEUE_ORDER) {
        if (dueByType[type]) side.pendingSpecialSpawns.push(type);
      }
    }

    const queuedType = naturalSpawn && side.pendingSpecialSpawns.length
      ? side.pendingSpecialSpawns.shift()
      : null;
    let failedSpecialType = null;
    let spawnType = forceType;
    if (!spawnType && queuedType) {
      const chance = this.statSpecialSuccessChance(side, queuedType);
      const roll = Math.random();
      const success = roll <= chance;
      side.specialRollType = queuedType;
      side.specialRollSuccess = success;
      side.specialRollChance = chance;
      side.specialRollValue = roll;
      side.specialRollTtl = SPECIAL_ROLL_TTL;
      side.specialRollByType[queuedType] = { success, chance, roll };
      if (success) {
        spawnType = queuedType;
        side.specialFailType = null;
        side.specialFailTtl = 0;
      } else {
        failedSpecialType = queuedType;
        side.specialFailType = queuedType;
        side.specialFailTtl = SPECIAL_FAIL_TTL;
      }
    }

    const isDragon = spawnType === 'dragon';
    const isShieldBearer = spawnType === 'shield';
    const isDigger = spawnType === 'digger';
    const isNecrominion = spawnType === 'necrominion';
    const isGunner = spawnType === 'gunner';
    const isRider = spawnType === 'rider';
    const isMonk = spawnType === 'monk';
    const isStoneGolem = spawnType === 'stonegolem';
    const isHero = spawnType === 'hero';
    const isPresident = spawnType === 'president';
    const isSuper = spawnType === 'super';
    const explosive = false;
    let radius = 16;
    let visualPower = power;
    let spawnY = TOWER_Y + (Math.random() * 110 - 55);
    if (failedSpecialType) {
      hp *= 1.5;
      visualPower += 2;
    }

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
      const riderSuperHorse = (Number(side.riderSuperHorseLevel) || 0) > 0;
      hp *= 0.9;
      dmg *= 1.08 + Math.min(0.18, side.unitLevel * 0.012);
      speed *= 1.52;
      radius = Math.max(18, radius + 1);
      if (riderSuperHorse) {
        hp *= 4;
        radius = Math.max(24, radius * 1.34);
        speed *= 1.1;
      }
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

    if (isShieldBearer) {
      hp *= 10;
      dmg = 0;
      speed *= 0.72;
      radius = Math.max(26, radius * 1.7) * 0.8;
      tier = Math.min(3, tier + 1);
      visualPower += 10;
      spawnY = TOWER_Y + (Math.random() * 58 - 29);
    }

    if (isStoneGolem) {
      hp *= STONE_GOLEM_HP_MULT;
      dmg *= STONE_GOLEM_DAMAGE_MULT;
      speed *= STONE_GOLEM_SPEED_MULT;
      radius = Math.max(30, radius * 2.05);
      tier = Math.min(3, tier + 1);
      visualPower += 14;
      spawnY = TOWER_Y + 20 + (Math.random() * 30 - 15);
    }

    if (isHero) {
      hp *= 1.12 * HERO_HP_MULT * HERO_HP_BOOST_MULT;
      dmg *= 0.9;
      speed *= 1.02;
      radius = Math.max(20, (radius + 2) * HERO_SIZE_MULT);
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
      explosiveLevel: 1,
      necrominion: isNecrominion,
      summoned: false,
      necroRevived: false,
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
      riderSuperHorse: isRider && (Number(side.riderSuperHorseLevel) || 0) > 0,
      dragonSuperBreathUpgraded: isDragon && (Number(side.dragonSuperBreathLevel) || 0) > 0,
      shieldDarkMetalUpgraded: isShieldBearer && (Number(side.shieldDarkMetalLevel) || 0) > 0,
      monkHealCircleUpgraded: isMonk && (Number(side.monkHealCircleLevel) || 0) > 0,
      necroExpertUpgraded: isNecrominion && (Number(side.necroExpertSummonerLevel) || 0) > 0,
      gunnerSkyCannonUpgraded: isGunner && (Number(side.gunnerSkyCannonLevel) || 0) > 0,
      riderChargeStartX: isRider ? x : null,
      riderChargeDistance: isRider
        ? ((Number(side.riderSuperHorseLevel) || 0) > 0 ? 142 : 165) + side.spawnLevel * 5
        : 0,
      riderChargeMul: isRider
        ? (2.05 + Math.min(0.35, side.unitLevel * 0.02) + ((Number(side.riderSuperHorseLevel) || 0) > 0 ? 0.72 : 0))
        : 1,
      digger: isDigger,
      diggerGoldFinder: isDigger && (Number(side.diggerGoldFinderLevel) || 0) > 0,
      diggerMineTargetId: null,
      diggerMineT: 0,
      shieldBearer: isShieldBearer,
      shieldPushCd: isShieldBearer ? (1.2 + Math.random() * 2.2) : 0,
      shieldPushTtl: 0,
      shieldPushScale: isShieldBearer ? SHIELD_PUSH_SCALE : 1,
      shieldDarkMetalCd: isShieldBearer ? (SHIELD_DARK_METAL_INTERVAL + Math.random() * SHIELD_DARK_METAL_COOLDOWN_JITTER) : 0,
      shieldDarkMetalTtl: 0,
      stoneGolem: isStoneGolem,
      golemSmashTtl: 0,
      golemShieldHp: isStoneGolem ? hp : 0,
      golemShieldMax: isStoneGolem ? hp : 0,
      golemShieldTtl: isStoneGolem ? STONE_GOLEM_SHIELD_TTL : 0,
      necroShieldHp: isNecrominion ? hp : 0,
      necroShieldMax: isNecrominion ? hp : 0,
      necroShieldTtl: isNecrominion ? NECRO_SELF_SHIELD_FADE_SECONDS : 0,
      necroShieldMaxTtl: NECRO_SELF_SHIELD_FADE_SECONDS,
      reviveShieldHp: 0,
      reviveShieldMax: 0,
      reviveShieldTtl: 0,
      reviveShieldMaxTtl: NECRO_REVIVE_SHIELD_SECONDS,
      hitFlashTtl: 0,
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
      monkHealCircleCd: isMonk ? (MONK_HEAL_CIRCLE_INTERVAL + Math.random() * MONK_HEAL_CIRCLE_COOLDOWN_JITTER) : 0,
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
      gunnerSkyCannonCd: isGunner ? (GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER) : 0,
      gunnerSkyCannonSetupTtl: 0,
      gunnerSkyCannonAimX: null,
      gunnerSkyCannonAimY: null,
      dragonSuperBreathCd: isDragon ? (DRAGON_SUPER_BREATH_INTERVAL + Math.random() * DRAGON_SUPER_BREATH_COOLDOWN_JITTER) : 0,
      dragonSuperBreathTtl: 0,
      dragonSuperBreathPulseCd: 0,
      dragonSuperBreathToX: null,
      dragonSuperBreathToY: null,
      dragonSuperBreathScorchDone: false,
      candleCarrier: false,
      candleCarrierSide: null,
      candleBurnTtl: 0,
      candleBurnTick: 0,
      failedSpecialType,
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

  upgradeLevelCap(type) {
    const cap = UPGRADE_LEVEL_CAPS[type];
    if (!Number.isFinite(cap)) return null;
    return Math.max(0, Math.floor(cap));
  }

  isUpgradeCapped(side, type) {
    const cap = this.upgradeLevelCap(type);
    if (!Number.isFinite(cap)) return false;
    return (Number(side?.[type]) || 0) >= cap;
  }

  isUpgradeUnlocked(side, type) {
    if (type === 'dragonSuperBreathLevel') return (Number(side?.dragonLevel) || 0) > 0;
    return true;
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
    const vy = SHOT_POWER_FALL_MIN_SPEED + Math.random() * (SHOT_POWER_FALL_MAX_SPEED - SHOT_POWER_FALL_MIN_SPEED);

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

  pickUpgradeType(side, excludedTypes = new Set(), excludedPaths = new Set()) {
    const unlockedPool = UPGRADE_TYPES.filter((type) => this.isUpgradeUnlocked(side, type));
    const uncappedPool = unlockedPool.filter((type) => !this.isUpgradeCapped(side, type));
    const sourcePool = uncappedPool.length ? uncappedPool : (unlockedPool.length ? unlockedPool : UPGRADE_TYPES);

    const withPathSpread = sourcePool.filter((type) => (
      !excludedTypes.has(type)
      && !excludedPaths.has(this.upgradePathForType(type))
    ));
    if (withPathSpread.length) return randomFrom(withPathSpread);

    const uniqueTypePool = sourcePool.filter((type) => !excludedTypes.has(type));
    if (uniqueTypePool.length) return randomFrom(uniqueTypePool);

    return randomFrom(sourcePool);
  }

  refillRegularCards(sideName) {
    const side = this[sideName];
    if (!side) return;
    const shown = this.upgradeCards.filter((c) => c.side === sideName && c.slot >= 0 && c.slot < 2);
    const usedTypes = new Set(shown.map((c) => c.type));
    const usedPaths = new Set(shown.map((c) => this.upgradePathForType(c.type)));

    for (let slot = 0; slot < 2; slot += 1) {
      if (!this.hasCardInSlot(sideName, slot)) {
        const type = this.pickUpgradeType(side, usedTypes, usedPaths);
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
    const cap = this.upgradeLevelCap(type);
    const gain = Math.max(0, Number(value) || 0);
    const current = Math.max(0, Number(side?.[type]) || 0);
    if (Number.isFinite(cap)) {
      side[type] = Math.min(cap, current + gain);
      return;
    }
    side[type] = current + gain;
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

    if (type === 'dragonSuperBreathLevel') {
      this.spawnMinion(sideName, { forceType: 'dragon', countSpawn: false });
      this.queueHitSfx('dragonfire', towerX + dir * 34, towerY - 14, sideName);
      return;
    }

    if (type === 'shieldDarkMetalLevel') {
      this.spawnMinion(sideName, { forceType: 'shield', countSpawn: false });
      this.queueHitSfx('blocked', towerX + dir * 30, towerY - 4, sideName);
      return;
    }

    if (type === 'monkHealCircleLevel') {
      this.spawnMinion(sideName, { forceType: 'monk', countSpawn: false });
      this.queueHitSfx('healcircle', towerX + dir * 20, towerY - 8, sideName, { r: 90 });
      return;
    }

    if (type === 'necroExpertSummonerLevel') {
      this.spawnMinion(sideName, { forceType: 'necrominion', countSpawn: false });
      this.queueHitSfx('revive', towerX + dir * 18, towerY - 2, sideName, {
        ghost: {
          side: sideName,
          x: towerX + dir * 18,
          y: towerY - 2,
          r: 16,
          tier: 1,
          level: 6,
          super: false,
          summoned: true,
          necroRevived: true,
          explosive: false,
          gunner: false,
          rider: false,
          riderChargeReady: false,
          digger: false,
          shieldBearer: false,
          stoneGolem: false,
          monk: false,
          hero: false,
          president: false,
          dragon: false,
          flying: false,
          necrominion: true,
          failedSpecialType: null,
          digPhase: 0,
          flyPhase: 0,
          heroSwing: 0,
          shieldDarkMetalTtl: 0,
        },
      });
      return;
    }

    if (type === 'riderSuperHorseLevel') {
      this.spawnMinion(sideName, { forceType: 'rider', countSpawn: false });
      this.queueHitSfx('powerup', towerX + dir * 26, towerY - 6, sideName);
      return;
    }

    if (type === 'diggerGoldFinderLevel') {
      this.spawnMinion(sideName, { forceType: 'digger', countSpawn: false });
      this.queueHitSfx('resource', towerX + dir * 24, towerY - 4, sideName);
      return;
    }

    if (type === 'gunnerSkyCannonLevel') {
      this.spawnMinion(sideName, { forceType: 'gunner', countSpawn: false });
      this.queueHitSfx('gunhit', towerX + dir * 24, towerY - 8, sideName);
      this.queueHitSfx('explosion', towerX + dir * 52, towerY - 30, sideName);
      return;
    }

    // For non-summon upgrades, accelerate the relevant cooldown so impact is immediate.
    if (type === 'arrowLevel' || type === 'volleyLevel' || type === 'powerLevel') {
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

export { GameRoom };

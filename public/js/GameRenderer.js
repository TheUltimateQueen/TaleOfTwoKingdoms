import {
  SPECIAL_SPAWN_QUEUE_ORDER,
  SUPPORT_SPECIAL_TYPES,
  SUPPORT_SPAWN_DEBUFF_FIRST_MULT,
  SUPPORT_SPAWN_DEBUFF_ADDITIONAL_MULT,
  SHOT_INTERVAL,
  specialSpawnBaseChanceForType,
  SHOT_POWER_LABELS,
  TEAM_COLORS,
  upgradeHintForLevel,
  upgradeLabelForLevel,
} from './constants.js';
import {
  DEFAULT_THEME_MODE,
  sideBarracksLabel,
  sideDisplayName,
  sideVictoryLabel,
  unitLabel,
} from './themeConfig.js';
import { SPECIAL_UNIT_UPGRADE_RULES_BY_SPECIAL_TYPE } from './specialUnitUpgradeConfig.js';
import { UPGRADE_LEVEL_CAPS } from './simConstants.js';

function sideCardSlotX(sideName, slot) {
  const leftRegular = [220, 320];
  if (sideName === 'left') return leftRegular[slot];
  return 1600 - leftRegular[slot];
}

function sideCommitteeVoteSlotPosition(sideName, slot = 0) {
  const lane = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
  const spread = 96;
  const leftStart = 124;
  const rightStart = 1600 - (leftStart + spread * 3);
  const x = (sideName === 'right' ? rightStart : leftStart) + lane * spread;
  const y = 72;
  return { x, y };
}

function launchAngleFromPull(sideName, pullX, pullY) {
  const horizontal = Math.max(0, Math.abs(pullX));
  const vertical = Math.max(0, -pullY);
  return Math.max(0, Math.min(Math.PI / 2, Math.atan2(vertical, horizontal || (vertical > 0 ? 0.0001 : 1))));
}

function worldAimAngle(sideName, pullX, pullY) {
  const a = launchAngleFromPull(sideName, pullX, pullY);
  if (sideName === 'left') return -a;
  return -Math.PI + a;
}

function launchStrengthFromPull(sideName, pullX, pullY) {
  const horizontal = Math.max(0, Math.abs(pullX));
  const vertical = Math.max(0, -pullY);
  return Math.max(0.05, Math.min(1, Math.hypot(horizontal, vertical)));
}

const COMBO_MAX_STREAK = 10;

function comboTierFromStreak(streak) {
  const value = Math.max(0, Math.min(COMBO_MAX_STREAK, Number(streak) || 0));
  if (value >= COMBO_MAX_STREAK) return 4;
  if (value >= 7) return 3;
  if (value >= 4) return 2;
  return 1;
}

function arrowAccuracy(sideState) {
  const fired = Math.max(0, sideState?.arrowsFired || 0);
  const hits = Math.max(0, sideState?.arrowHits || 0);
  const rate = fired ? Math.round((hits / fired) * 100) : 0;
  return { fired, hits, rate };
}

function upgradeLevelCap(type) {
  const raw = Number(UPGRADE_LEVEL_CAPS?.[type]);
  if (!Number.isFinite(raw)) return null;
  return Math.max(0, Math.floor(raw));
}

const UPGRADE_BADGE_SPECS = [
  { type: 'unitLevel', code: 'AT', base: 1 },
  { type: 'volleyLevel', code: 'VO', base: 0 },
  { type: 'spawnLevel', code: 'SP', base: 1 },
  { type: 'unitHpLevel', code: 'HP', base: 1 },
  { type: 'resourceLevel', code: 'EC', base: 1 },
  { type: 'powerLevel', code: 'PW', base: 1 },
  { type: 'balloonLevel', code: 'BA', base: 0 },
  { type: 'dragonLevel', code: 'DR', base: 0 },
  { type: 'dragonSuperBreathLevel', code: 'SB', base: 0 },
  { type: 'stoneGolemAncientCoreLevel', code: 'GO', base: 0 },
  { type: 'heroDestinedChampionLevel', code: 'HE', base: 0 },
  { type: 'shieldDarkMetalLevel', code: 'DM', base: 0 },
  { type: 'monkHealCircleLevel', code: 'HC', base: 0 },
  { type: 'necroExpertSummonerLevel', code: 'NS', base: 0 },
  { type: 'riderSuperHorseLevel', code: 'RH', base: 0 },
  { type: 'diggerGoldFinderLevel', code: 'GF', base: 0 },
  { type: 'gunnerSkyCannonLevel', code: 'SC', base: 0 },
  { type: 'presidentExecutiveOrderLevel', code: 'EO', base: 0 },
  { type: 'superMinionLevel', code: 'SU', base: 0 },
];

const UPGRADE_CATEGORY_BY_TYPE = {
  volleyLevel: 'arrow',
  unitLevel: 'unit',
  unitHpLevel: 'unit',
  spawnLevel: 'unit',
  resourceLevel: 'economy',
  powerLevel: 'power',
  balloonLevel: 'special',
  dragonLevel: 'special',
  dragonSuperBreathLevel: 'special',
  stoneGolemAncientCoreLevel: 'special',
  heroDestinedChampionLevel: 'special',
  shieldDarkMetalLevel: 'special',
  monkHealCircleLevel: 'special',
  necroExpertSummonerLevel: 'special',
  riderSuperHorseLevel: 'special',
  diggerGoldFinderLevel: 'special',
  gunnerSkyCannonLevel: 'special',
  presidentExecutiveOrderLevel: 'special',
  superMinionLevel: 'special',
};

const UPGRADE_TWEMOJI_GLYPHS = {
  resourceLevel: { src: '/icons/twemoji/1f4b0.svg', scale: 2.08, yOffset: 0.03 },
  balloonLevel: { src: '/icons/twemoji/1f388.svg', scale: 2.08, yOffset: 0.01 },
  dragonLevel: { src: '/icons/twemoji/1f409.svg', scale: 2, yOffset: 0.02 },
  dragonSuperBreathLevel: { src: '/icons/twemoji/1f525.svg', scale: 2.04, yOffset: 0.02 },
  stoneGolemAncientCoreLevel: { src: '/icons/twemoji/1faa8.svg', scale: 2.02, yOffset: 0.02 },
  heroDestinedChampionLevel: { src: '/icons/twemoji/1f9b8.svg', scale: 1.94, yOffset: 0.02 },
  monkHealCircleLevel: { src: '/icons/twemoji/1f49a.svg', scale: 1.98, yOffset: 0.02 },
  necroExpertSummonerLevel: { src: '/icons/twemoji/2620.svg', scale: 1.9, yOffset: 0.02 },
  riderSuperHorseLevel: { src: '/icons/twemoji/1f40e.svg', scale: 2, yOffset: 0.02 },
  diggerGoldFinderLevel: { src: '/icons/twemoji/26cf.svg', scale: 1.88, yOffset: 0.01 },
  gunnerSkyCannonLevel: { src: '/icons/twemoji/1f4a3.svg', scale: 2, yOffset: 0.01 },
  presidentExecutiveOrderLevel: { src: '/icons/twemoji/1f4dc.svg', scale: 1.94, yOffset: 0.02 },
  superMinionLevel: { src: '/icons/twemoji/2b50.svg', scale: 1.98, yOffset: 0.01 },
};

const SHOT_POWER_TWEMOJI_GLYPHS = {
  multiShot: { src: '/icons/twemoji/1f531.svg', scale: 1.56, yOffset: 0.05 },
  ultraShot: { src: '/icons/twemoji/1f4a5.svg', scale: 1.54, yOffset: 0.02 },
  pierceShot: { src: '/icons/twemoji/1f5e1.svg', scale: 1.5, yOffset: 0.03 },
  flameShot: { src: '/icons/twemoji/1f525.svg', scale: 1.5, yOffset: 0.03 },
  flareShot: { src: '/icons/twemoji/2600.svg', scale: 1.48, yOffset: 0.02 },
};

const BARRACKS_LOCK_TWEMOJI = '/icons/twemoji/1f512.svg';
const CPU_ARCHER_TWEMOJI = '/icons/twemoji/1f5a5.svg';
const TREASURE_PILE_ITEM_SCALE_MULT = 2;
const RESOURCE_APPEAR_DURATION = 0.34;
const RESOURCE_APPEAR_START_SCALE = 0.34;
const RESOURCE_APPEAR_START_ALPHA = 0.42;
const RESOURCE_APPEAR_STALE_TTL = 0.22;
const RESOURCE_TELEGRAPH_END_HOLD = 0.08;
const UPGRADE_SELECTION_CARD_W = 90;
const UPGRADE_SELECTION_CARD_H = 44;
const UPGRADE_SELECTION_LOSER_EXIT_PORTION = 0.42;
const UPGRADE_SELECTION_WINNER_FADE_START = 0.56;

const UPGRADE_CATEGORY_STYLE = {
  arrow: {
    tag: 'ARROW',
    panel: '#1f3446',
    glow: '#89d0ff2a',
    border: '#6cb5ee',
    title: '#dbf2ff',
    hint: '#9ecde9',
    cost: '#b9e4ff',
    badge: '#7ec9ff',
  },
  unit: {
    tag: 'UNIT',
    panel: '#243f2c',
    glow: '#93e59d26',
    border: '#7dcf8c',
    title: '#e4ffe7',
    hint: '#a8ddb2',
    cost: '#c8f5ce',
    badge: '#86dd95',
  },
  economy: {
    tag: 'ECO',
    panel: '#4b3a1d',
    glow: '#ffd86d29',
    border: '#e8c46a',
    title: '#fff3ce',
    hint: '#e1cb90',
    cost: '#ffe7aa',
    badge: '#f4cf70',
  },
  power: {
    tag: 'POWER',
    panel: '#3d2746',
    glow: '#d6a1ff2a',
    border: '#bc8de8',
    title: '#f6e5ff',
    hint: '#d6b9ea',
    cost: '#e5cbff',
    badge: '#c999ff',
  },
  special: {
    tag: 'SPECIAL',
    panel: '#4a2e21',
    glow: '#ffb0832b',
    border: '#ea9a6d',
    title: '#ffe6da',
    hint: '#e6b8a3',
    cost: '#ffd1bc',
    badge: '#ffaf86',
  },
  misc: {
    tag: 'UPG',
    panel: '#3a3020',
    glow: '#f4d5852b',
    border: '#cfab52',
    title: '#fff1c8',
    hint: '#d9c08a',
    cost: '#ffe3a5',
    badge: '#d8be86',
  },
};

const UPGRADE_CATEGORY_ORDER = ['arrow', 'unit', 'economy', 'power', 'special', 'misc'];

const UPGRADE_CATEGORY_TOWER_LABEL = {
  arrow: 'Arrow',
  unit: 'Units',
  economy: 'Economy',
  power: 'Power',
  special: 'Specials',
  misc: 'Other',
};

const ROW_TO_SPECIAL_TYPE = {
  necro: 'necrominion',
  gunner: 'gunner',
  rider: 'rider',
  digger: 'digger',
  monk: 'monk',
  stonegolem: 'stonegolem',
  shield: 'shield',
  hero: 'hero',
  president: 'president',
  dragon: 'dragon',
  balloon: 'balloon',
  super: 'super',
};
const SPECIAL_TYPE_TO_ROW_TYPE = Object.freeze(
  Object.fromEntries(Object.entries(ROW_TO_SPECIAL_TYPE).map(([rowType, specialType]) => [specialType, rowType]))
);
const SUPPORT_SPECIAL_TYPE_SET = new Set(SUPPORT_SPECIAL_TYPES);
const TIER2_SPECIAL_TYPE_SET = new Set(['dragon', 'shield', 'super', 'balloon']);
const SPECIAL_REPEAT_CHANCE_BONUS_PER_LEVEL = 0.01;
const SPECIAL_REPEAT_CHANCE_BONUS_MAX = 0.2;
const SPECIAL_REPEAT_CHANCE_BONUS_PER_LEVEL_BY_TYPE = Object.freeze({
  dragon: 0.014,
  super: 0.018,
  shield: 0.004,
});
const SPECIAL_REPEAT_EVERY_BONUS_PER_LEVEL = 0.03;
const SPECIAL_REPEAT_EVERY_BONUS_MAX = 0.24;
const SPECIAL_REPEAT_EVERY_BONUS_PER_LEVEL_BY_TYPE = Object.freeze({
  shield: 0.02,
});
const SPECIAL_REPEAT_EVERY_TYPE_SET = new Set(SPECIAL_SPAWN_QUEUE_ORDER);

const BARRACKS_ROW_GLYPH_BY_TYPE = {
  militia: 'unitLevel',
  necro: 'unitLevel',
  gunner: 'gunnerSkyCannonLevel',
  rider: 'unitLevel',
  digger: 'unitHpLevel',
  monk: 'powerLevel',
  stonegolem: 'unitHpLevel',
  shield: 'unitHpLevel',
  hero: 'powerLevel',
  president: 'powerLevel',
  balloon: 'balloonLevel',
  dragon: 'dragonLevel',
  super: 'superMinionLevel',
  candle: 'powerLevel',
};

const BARRACKS_ROW_TWEMOJI_GLYPHS = {
  militia: { src: '/icons/twemoji/1f5e1.svg', scale: 1.42, yOffset: 0.03 },
  necro: { src: '/icons/twemoji/2620.svg', scale: 1.34, yOffset: 0.03 },
  gunner: { src: '/icons/twemoji/1f4a3.svg', scale: 1.36, yOffset: 0.02 },
  rider: { src: '/icons/twemoji/1f40e.svg', scale: 1.46, yOffset: 0.03 },
  digger: { src: '/icons/twemoji/26cf.svg', scale: 1.36, yOffset: 0.03 },
  monk: { src: '/icons/twemoji/1f49a.svg', scale: 1.34, yOffset: 0.02 },
  stonegolem: { src: '/icons/twemoji/1f4a5.svg', scale: 1.36, yOffset: 0.02 },
  shield: { src: '/icons/twemoji/1f512.svg', scale: 1.28, yOffset: 0.02 },
  hero: { src: '/icons/twemoji/2b50.svg', scale: 1.3, yOffset: 0.02 },
  president: { src: '/icons/twemoji/1f4dc.svg', scale: 1.3, yOffset: 0.02 },
  balloon: { src: '/icons/twemoji/1f388.svg', scale: 1.38, yOffset: 0.02 },
  dragon: { src: '/icons/twemoji/1f409.svg', scale: 1.38, yOffset: 0.02 },
  super: { src: '/icons/twemoji/2728.svg', scale: 1.34, yOffset: 0.02 },
  candle: { src: '/icons/twemoji/1f525.svg', scale: 1.33, yOffset: 0.02 },
};
const BARRACKS_ROW_TWEMOJI_SIZE_MULT = 2;
const BARRACKS_ROW_TWEMOJI_Y_SHIFT = 2;

const SPECIAL_SPAWN_QUEUE_PRIORITY = Object.freeze(
  Object.fromEntries(SPECIAL_SPAWN_QUEUE_ORDER.map((type, index) => [type, index]))
);

const CANDLE_SPAWN_COOLDOWN_MULT = 1.5;
const CANDLE_SPAWN_BASE_CHANCE = 0.18;
const STONE_GOLEM_UNLOCK_TOWER_HP_FRACTION = 0.5;

const FAILED_SPECIAL_HAT_STYLES = {
  dragon: { code: 'DR', cap: '#5f86b3', brim: '#aec8e7' },
  shield: { code: 'SH', cap: '#4f6688', brim: '#d4e5fa' },
  digger: { code: 'DG', cap: '#6f5a43', brim: '#bca07e' },
  necrominion: { code: 'NC', cap: '#2b5f4f', brim: '#8ef0c9' },
  gunner: { code: 'GN', cap: '#655447', brim: '#ffd6a1' },
  rider: { code: 'RD', cap: '#7f5f44', brim: '#e8d0b0' },
  monk: { code: 'MK', cap: '#486345', brim: '#c5f2b5' },
  stonegolem: { code: 'SG', cap: '#4d5965', brim: '#c5d5df' },
  hero: { code: 'HR', cap: '#6a4f2d', brim: '#ffe2a0' },
  president: { code: 'PR', cap: '#6f4632', brim: '#f1c7a2' },
  balloon: { code: 'BA', cap: '#546f78', brim: '#c7e7ee' },
  super: { code: 'SU', cap: '#7f7537', brim: '#fff2aa' },
};

function upgradeCategory(type) {
  return UPGRADE_CATEGORY_BY_TYPE[type] || 'misc';
}

const GAME_OVER_CINEMATIC_MS = 4000;
const SPECIAL_COOLDOWN_START_MULT = 1.5;
const SPECIAL_COOLDOWN_END_MULT = 1;
const SPECIAL_COOLDOWN_RAMP_SECONDS = 300;
const SPECIAL_COOLDOWN_STEP_SECONDS = 10;
const BARRACKS_CADENCE_DELTA_FLASH_TTL_MS = 5000;
const BARRACKS_CADENCE_DELTA_MIN_SECONDS = 0.15;
const MINION_HIT_FLASH_TTL = 0.18;
const SHIELD_DARK_METAL_DURATION = 5;
const STONE_GOLEM_SMASH_TTL = 0.45;
const STONE_GOLEM_SHIELD_TTL = 5;
const STONE_GOLEM_ATTACK_SPIN_TURNS = 2.75;
const STONE_GOLEM_BITE_JUMP_TTL = 0.62;
const STONE_GOLEM_BITE_LAND_TTL = 0.24;
const MAX_PARTICLES = 1800;
const MAX_POOLED_PARTICLES = MAX_PARTICLES * 2;
const MAX_DAMAGE_TEXTS = 180;
const MAX_HERO_LINES = 80;
const MAX_DEATH_GHOSTS = 110;
const PRESIDENT_AURA_RANGE_SCALE = 0.25;
const BASIC_SPECIAL_DEFAULT_BASE_EVERY = 30;
const TIER2_SPECIAL_DEFAULT_BASE_EVERY = 108;
const MAX_REVIVE_SPIRITS = 90;
const MAX_HEAL_CIRCLES = 42;
const MAX_MILITIA_FOOD_FX = 380;
const MAX_UNIT_HIT_IMPACTS = 120;
const MAX_HERO_FOOD_VISUALS = 320;
const MAX_HERO_COOKER_SWALLOWS = 180;
const HERO_LINE_TIME_SCALE = 0.5;
const HERO_LINE_MOTION_SCALE = 0.5;
const MILITIA_FOOD_GAG_TTL = 0.62;
const MILITIA_FOOD_TRIGGER_MIN_CD = 0.2;
const MILITIA_FOOD_TRIGGER_DELTA = 0.14;
const HERO_FOOD_RAIN_BREAD_KINDS = ['bun', 'loaf', 'baguette', 'bagel', 'toast', 'brioche'];
const HERO_FOOD_RAIN_RICE_KINDS = ['mochi', 'onigiri', 'riceCake', 'riceBowl', 'sushiRoll', 'senbei'];
const TOWER_HIT_PARTICLE_COLORS = ['#b8c6d8', '#8ea0b7', '#6e7f96', '#e3c088'];
const BLOCKED_PARTICLE_COLORS = ['#f4f8ff', '#cad3de', '#adb8c5', '#8f9aa8'];
const CANDLE_HIT_FIRE_COLORS = ['#ff5f35', '#ff9f47', '#ffd37a', '#fff0c7'];
const CANDLE_HIT_PLUME_COLORS = ['#ff5f35', '#ffb24c', '#ffe7b1'];
const CANDLE_HIT_WAX_COLORS = ['#fff4d8', '#f7e6bf', '#e6cfa4'];
const TOWER_IMPACT_PARTICLE_COLORS = ['#c5d4e6', '#8fa1b8', '#73839a'];
const TOWER_COLLAPSE_PARTICLE_COLORS = ['#ced9e7', '#9baec3', '#6f8094', '#d9b483', '#7f6852'];
const FX_QUALITY_RANK = {
  low: 0,
  medium: 1,
  high: 2,
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function stableHash(seed) {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return raw - Math.floor(raw);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function lerp(a, b, t) {
  return a + (b - a) * clamp01(t);
}

function easeOutCubic(t) {
  const x = 1 - clamp01(t);
  return 1 - x * x * x;
}

function easeInCubic(t) {
  const x = clamp01(t);
  return x * x * x;
}

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.themeMode = DEFAULT_THEME_MODE;
    this.particles = [];
    this.particlePool = [];
    this.diggerDustMarks = new Map();
    this.damageTexts = [];
    this.heroLines = [];
    this.deathGhosts = [];
    this.reviveSpirits = [];
    this.healCircles = [];
    this.heroFoodVisuals = [];
    this.heroCookerSwallows = [];
    this.heroPunchState = new Map();
    this.heroIdleState = new Map();
    this.prevMinionAtkCd = new Map();
    this.militiaFoodFx = new Map();
    this.towerShake = {
      left: { ttl: 0, amp: 0, seed: Math.random() * 1000 },
      right: { ttl: 0, amp: 0, seed: Math.random() * 1000 },
    };
    this.gameOverCinematic = {
      active: false,
      startMs: 0,
      durationMs: GAME_OVER_CINEMATIC_MS,
      winner: null,
      loser: null,
      lastBurstMs: 0,
    };
    this.cachedBackgroundGradient = null;
    this.cachedBackgroundHeight = 0;
    this.cachedThemedBackground = null;
    this.cachedThemedBackgroundKey = '';
    this.spriteCache = new Map();
    this.spriteCacheMaxEntries = this.computeSpriteCacheBudget();
    this.fxQuality = 'high';
    this.fxFrameDtAvg = 1 / 60;
    this.fxQualityHold = 0;
    this.frameArrowCount = 0;
    this.balloonMinionBuffer = [];
    this.groundMinionBuffer = [];
    this.cardTextFitCache = new Map();
    this.cardTextFitCacheMaxEntries = 1024;
    this.upgradeGlyphImageCache = new Map();
    this.goldResourceTrails = [];
    this.resourceSpawnTelegraphs = [];
    this.resourceAppearState = new Map();
    this.powerupTrails = [];
    this.unitHitImpacts = [];
    this.archerInstruments = { left: [], right: [] };
    this.barracksDoorActors = { left: null, right: null };
    this.prevBarracksRollState = {
      left: { ttl: 0, key: '' },
      right: { ttl: 0, key: '' },
    };
    this.barracksDoorStatePrimed = false;
    this.barracksCadenceDeltaFx = new Map();
    this.barracksPrevCycleSecondsByRow = new Map();
    this.treasurePileState = {
      left: { items: [], lastGold: 0 },
      right: { items: [], lastGold: 0 },
    };
    this.treasureShotGoldState = {
      left: { lastValue: 0, lastChangeMs: 0 },
      right: { lastValue: 0, lastChangeMs: 0 },
    };
    this.lastFrameAt = performance.now();
  }

  computeSpriteCacheBudget() {
    const deviceMemory = Number((typeof navigator !== 'undefined' && navigator.deviceMemory) || 0);
    let budget = 300;
    if (deviceMemory > 0 && deviceMemory < 4) budget = 220;
    else if (deviceMemory >= 8) budget = 420;
    if (
      typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(max-width: 900px)').matches
    ) {
      budget = Math.min(budget, 280);
    }
    return budget;
  }

  setThemeMode(_themeMode) {
    const normalized = DEFAULT_THEME_MODE;
    const changed = normalized !== this.themeMode;
    this.themeMode = normalized;
    if (changed) {
      this.cachedBackgroundGradient = null;
      this.cachedBackgroundHeight = 0;
      this.cachedThemedBackground = null;
      this.cachedThemedBackgroundKey = '';
      this.spriteCache.clear();
      this.prevMinionAtkCd.clear();
      this.militiaFoodFx.clear();
      this.cardTextFitCache.clear();
      this.goldResourceTrails.length = 0;
      this.resourceSpawnTelegraphs.length = 0;
      this.resourceAppearState.clear();
      this.powerupTrails.length = 0;
      this.unitHitImpacts.length = 0;
      this.heroFoodVisuals.length = 0;
      this.heroCookerSwallows.length = 0;
      this.heroPunchState.clear();
      this.heroIdleState.clear();
      this.barracksDoorActors = { left: null, right: null };
      this.prevBarracksRollState = {
        left: { ttl: 0, key: '' },
        right: { ttl: 0, key: '' },
      };
      this.barracksDoorStatePrimed = false;
      this.barracksCadenceDeltaFx.clear();
      this.barracksPrevCycleSecondsByRow.clear();
      this.treasurePileState.left = { items: [], lastGold: 0 };
      this.treasurePileState.right = { items: [], lastGold: 0 };
      this.treasureShotGoldState.left = { lastValue: 0, lastChangeMs: 0 };
      this.treasureShotGoldState.right = { lastValue: 0, lastChangeMs: 0 };
    }
  }

  setArcherInstruments(loadout = null) {
    const normalizeSide = (sideName) => {
      const entries = Array.isArray(loadout?.[sideName]) ? loadout[sideName] : [];
      const out = [];
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (!entry || typeof entry !== 'object') {
          out.push(null);
          continue;
        }
        const iconSrc = typeof entry.iconSrc === 'string' ? entry.iconSrc : '';
        out.push(iconSrc ? { iconSrc } : null);
      }
      return out;
    };
    this.archerInstruments = {
      left: normalizeSide('left'),
      right: normalizeSide('right'),
    };
  }

  fitUpgradeCardText(text, maxWidth, font = '10px sans-serif') {
    const raw = String(text || '');
    if (!raw) return '';
    const width = Math.max(1, Math.floor(Number(maxWidth) || 0));
    const key = `${font}|${width}|${raw}`;
    if (this.cardTextFitCache.has(key)) return this.cardTextFitCache.get(key);

    const { ctx } = this;
    ctx.save();
    ctx.font = font;
    let out = raw;
    if (ctx.measureText(raw).width > width) {
      const ellipsis = '...';
      while (out.length > 0 && ctx.measureText(`${out}${ellipsis}`).width > width) {
        out = out.slice(0, -1);
      }
      out = out ? `${out}${ellipsis}` : ellipsis;
    }
    ctx.restore();

    if (this.cardTextFitCache.size > this.cardTextFitCacheMaxEntries) this.cardTextFitCache.clear();
    this.cardTextFitCache.set(key, out);
    return out;
  }

  sideLabel(side) {
    return sideDisplayName(side, this.themeMode);
  }

  winnerLabel(side) {
    return sideVictoryLabel(side, this.themeMode);
  }

  heroPunchJitter(minionId, attackSwing) {
    const id = Math.round(Number(minionId) || 0);
    if (id <= 0) return { x: 0, y: 0, bucket: 0 };
    const swing = Math.max(-1, Math.min(1, Number(attackSwing) || 0));
    const absSwing = Math.abs(swing);
    const dir = swing >= 0 ? 1 : -1;
    let state = this.heroPunchState.get(id);
    if (!state) {
      state = {
        lastAbs: 0,
        lastDir: dir,
        x: 0,
        y: 0,
        bucket: 0,
        style: Math.random() * 2 - 1,
      };
      this.heroPunchState.set(id, state);
    }

    // Pick a fresh endpoint on each new punch so strikes feel less robotic.
    if (absSwing > 0.46 && (state.lastAbs <= 0.46 || state.lastDir !== dir)) {
      const reach = 0.56 + Math.random() * 0.82;
      const spread = (Math.random() * 2 - 1) * (0.21 + Math.abs(state.style) * 0.18);
      const rise = (Math.random() * 2 - 1) * 0.2;
      state.x = Math.max(-1.2, Math.min(1.35, Math.cos(spread) * reach));
      state.y = Math.max(-1.1, Math.min(1.1, Math.sin(spread) * (0.55 + Math.random() * 0.35) + rise));
      const bx = Math.max(0, Math.min(4, Math.round((state.x + 1.2) * 1.7)));
      const by = Math.max(0, Math.min(4, Math.round((state.y + 1.2) * 1.7)));
      state.bucket = bx * 5 + by;
    }

    state.lastAbs = absSwing;
    state.lastDir = dir;
    return { x: state.x, y: state.y, bucket: state.bucket };
  }

  heroIdleArmDrift(minionId, attackSwing) {
    const id = Math.round(Number(minionId) || 0);
    if (id <= 0) return { x: 0, y: 0, bucket: 0 };
    const now = performance.now();
    let state = this.heroIdleState.get(id);
    if (!state) {
      const seed = Math.random() * 1000;
      state = {
        lastMs: now,
        phaseX: seed * 0.73,
        phaseY: seed * 0.51 + 1.1,
        freqX: 0.82 + Math.random() * 0.74,
        freqY: 0.68 + Math.random() * 0.66,
        freqZ: 0.58 + Math.random() * 0.52,
        driftX: Math.random() * 2 - 1,
        driftY: Math.random() * 2 - 1,
        targetX: Math.random() * 2 - 1,
        targetY: Math.random() * 2 - 1,
        retargetAt: now + 620 + Math.random() * 1560,
      };
      this.heroIdleState.set(id, state);
    }

    const dt = Math.max(0, Math.min(0.08, (now - state.lastMs) / 1000));
    state.lastMs = now;
    if (now >= state.retargetAt) {
      state.targetX = Math.random() * 2 - 1;
      state.targetY = Math.random() * 2 - 1;
      state.retargetAt = now + 540 + Math.random() * 1720;
    }
    const driftFollow = Math.min(1, dt * 1.14);
    state.driftX += (state.targetX - state.driftX) * driftFollow;
    state.driftY += (state.targetY - state.driftY) * driftFollow;

    const time = now * 0.001;
    const oscX = Math.sin(time * state.freqX + state.phaseX);
    const oscY = Math.cos(time * state.freqY + state.phaseY);
    const figureX = Math.sin(time * state.freqZ + state.phaseY * 0.62);
    const figureY = Math.sin(time * (state.freqZ * 1.92) + state.phaseX * 0.58) * 0.72;
    const wobbleX = Math.sin(time * (state.freqX * 0.52 + 0.68) + state.phaseY * 0.8);
    const wobbleY = Math.cos(time * (state.freqY * 0.55 + 0.61) + state.phaseX * 0.7);
    const rawX = oscX * 0.5 + figureX * 0.34 + wobbleX * 0.2 + state.driftX * 0.92;
    const rawY = oscY * 0.42 + figureY * 0.31 + wobbleY * 0.2 + state.driftY * 0.84;

    const idleAmount = Math.max(0, 1 - Math.abs(Number(attackSwing) || 0));
    const x = Math.max(-1.65, Math.min(1.65, rawX)) * idleAmount;
    const y = Math.max(-1.65, Math.min(1.65, rawY)) * idleAmount;
    const bx = Math.max(0, Math.min(10, Math.round((x + 1.65) / 3.3 * 10)));
    const by = Math.max(0, Math.min(10, Math.round((y + 1.65) / 3.3 * 10)));
    return {
      x: (bx / 10) * 3.3 - 1.65,
      y: (by / 10) * 3.3 - 1.65,
      bucket: bx * 11 + by,
    };
  }

  specialLabel(type) {
    return unitLabel(type, this.themeMode);
  }

  isThemedEmpires() {
    return true;
  }

  empireSpriteStyle(sideName) {
    if (!this.isThemedEmpires()) return null;
    if (sideName === 'right') {
      return {
        culture: 'asian',
        accent: '#ffd8dc',
        accentDark: '#8f3f4b',
        trim: '#ffc0c8',
        castleWall: '#7f3646',
        castleEdge: '#ff9dac',
        gateDark: '#4a1a26',
        slitDark: '#2d0e16',
        platform: '#a15363',
        archerCloth: '#a4414f',
        archerTrim: '#ffe2e7',
        weaponWood: '#b77a58',
        weaponTip: '#ffeef1',
        banner: '#712536',
        bannerEdge: '#ffc1cb',
      };
    }
    return {
      culture: 'european',
      accent: '#d8ecff',
      accentDark: '#3f6791',
      trim: '#b8dcff',
      castleWall: '#315280',
      castleEdge: '#9acbff',
      gateDark: '#192f4a',
      slitDark: '#0f1d31',
      platform: '#4e6f9d',
      archerCloth: '#2d5f92',
      archerTrim: '#d8edff',
      weaponWood: '#9d7245',
      weaponTip: '#f4fbff',
      banner: '#1f4175',
      bannerEdge: '#badfff',
    };
  }

  drawEmpireBannerEmblem(side, x, y, scale = 1) {
    if (!this.isThemedEmpires()) return;
    const sideName = side === 'right' ? 'right' : 'left';
    const style = this.empireSpriteStyle(sideName);
    if (!style) return;
    const { ctx } = this;
    const bannerW = 22 * scale;
    const bannerH = 24 * scale;

    ctx.fillStyle = style.banner;
    ctx.fillRect(x - bannerW / 2, y - bannerH / 2, bannerW, bannerH);
    ctx.strokeStyle = style.bannerEdge;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(x - bannerW / 2, y - bannerH / 2, bannerW, bannerH);

    if (sideName === 'left') {
      // Loaf crest for Bread Empire.
      ctx.fillStyle = '#f4c884';
      ctx.beginPath();
      ctx.ellipse(x, y + 1 * scale, 6.8 * scale, 3.9 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ad6f36';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 3.4 * scale, y - 0.6 * scale);
      ctx.lineTo(x - 1.8 * scale, y + 1.7 * scale);
      ctx.moveTo(x, y - 0.7 * scale);
      ctx.lineTo(x + 1.2 * scale, y + 1.9 * scale);
      ctx.moveTo(x + 3 * scale, y - 0.4 * scale);
      ctx.lineTo(x + 4.1 * scale, y + 2 * scale);
      ctx.stroke();
    } else {
      // Rice bowl crest for Rice Empire.
      ctx.fillStyle = '#f8fcff';
      ctx.beginPath();
      ctx.arc(x, y + 2.5 * scale, 5.4 * scale, Math.PI, 0, false);
      ctx.lineTo(x + 5.4 * scale, y + 3.9 * scale);
      ctx.lineTo(x - 5.4 * scale, y + 3.9 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d8e7f0';
      ctx.fillRect(x - 5.1 * scale, y + 3.8 * scale, 10.2 * scale, 1.5 * scale);
      ctx.fillStyle = '#eff8ff';
      ctx.beginPath();
      ctx.ellipse(x - 1.8 * scale, y - 1.4 * scale, 1.8 * scale, 1.1 * scale, 0.2, 0, Math.PI * 2);
      ctx.ellipse(x + 1.2 * scale, y - 0.8 * scale, 1.9 * scale, 1.2 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#edd8ad';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 3.8 * scale, y - 3.4 * scale);
      ctx.lineTo(x + 5.8 * scale, y + 0.8 * scale);
      ctx.moveTo(x + 5.2 * scale, y - 3.8 * scale);
      ctx.lineTo(x + 7 * scale, y + 0.5 * scale);
      ctx.stroke();
    }
  }

  drawEmpireStyleAccent(minion, options = {}) {
    if (!this.isThemedEmpires()) return;
    if (options.cacheRender === true) return;
    if (!minion) return;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const style = this.empireSpriteStyle(sideName);
    if (!style) return;

    const { ctx } = this;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const baseR = Math.max(10, Number(minion.r) || 12);
    const dir = sideName === 'left' ? 1 : -1;
    let anchorX = x;
    let anchorY = y - baseR * 0.98;
    if (minion.dragon) anchorY = y - baseR * 1.02;
    else if (minion.shieldBearer) {
      anchorX = x - dir * baseR * 0.14;
      anchorY = y - baseR * 2.25;
    } else if (minion.stoneGolem) {
      anchorY = y - baseR * 1.2;
    } else if (minion.president) {
      anchorY = y - baseR * 1.08;
    } else if (minion.digger) {
      anchorY = y - baseR * 0.78;
    } else if (minion.rider) {
      anchorY = y - baseR * 1.04;
    }
    const scale = Math.max(0.82, Math.min(1.42, baseR / 14));
    ctx.save();
    ctx.translate(anchorX, anchorY);

    if (style.culture === 'european') {
      // Shoulder sash + crumb stitching.
      ctx.strokeStyle = '#9f6e3b';
      ctx.lineWidth = 2.1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4.8 * dir * scale, 1.5 * scale);
      ctx.lineTo(4.4 * dir * scale, -1.8 * scale);
      ctx.stroke();
      ctx.strokeStyle = '#dbb17a';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-2.6 * dir * scale, 0.8 * scale);
      ctx.lineTo(-1.8 * dir * scale, -0.6 * scale);
      ctx.moveTo(-0.8 * dir * scale, 0.2 * scale);
      ctx.lineTo(0.1 * dir * scale, -1.1 * scale);
      ctx.moveTo(1.2 * dir * scale, -0.4 * scale);
      ctx.lineTo(2.1 * dir * scale, -1.6 * scale);
      ctx.stroke();
      ctx.fillStyle = '#f4c987';
      ctx.beginPath();
      ctx.ellipse(5.2 * dir * scale, 1.6 * scale, 2.4 * scale, 1.4 * scale, -0.16 * dir, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8d5a2f';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(4.5 * dir * scale, 1.2 * scale);
      ctx.lineTo(5.2 * dir * scale, 2 * scale);
      ctx.moveTo(5.8 * dir * scale, 1 * scale);
      ctx.lineTo(6.4 * dir * scale, 1.8 * scale);
      ctx.stroke();
      if (minion.super) {
        ctx.strokeStyle = '#ffe6be';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -2.2 * scale, 5.8 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Crossed rice-weave sash.
      ctx.strokeStyle = '#8fb2c8';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4.6 * dir * scale, 1.4 * scale);
      ctx.lineTo(3.8 * dir * scale, -1.6 * scale);
      ctx.moveTo(-2.8 * dir * scale, -1.8 * scale);
      ctx.lineTo(4.2 * dir * scale, 1.8 * scale);
      ctx.stroke();
      // Rice bowl charm.
      ctx.fillStyle = '#f4fbff';
      ctx.beginPath();
      ctx.arc(5.2 * dir * scale, 1.6 * scale, 2.1 * scale, Math.PI, 0, false);
      ctx.lineTo(7.3 * dir * scale, 2.7 * scale);
      ctx.lineTo(3.1 * dir * scale, 2.7 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e6f3fb';
      ctx.beginPath();
      ctx.ellipse(4.8 * dir * scale, 0.7 * scale, 1 * scale, 0.65 * scale, 0.2, 0, Math.PI * 2);
      ctx.ellipse(5.8 * dir * scale, 1 * scale, 1 * scale, 0.65 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      if (minion.super) {
        ctx.strokeStyle = '#f8d8e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, -2.2 * scale, 5.8 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawThemedSpecialLook(minion, specialType, options = {}) {
    if (!this.isThemedEmpires()) return;
    if (options.cacheRender === true) return;
    if (!minion || !specialType) return;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const style = this.empireSpriteStyle(sideName);
    if (!style) return;

    const { ctx } = this;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const baseR = Math.max(12, Number(minion.r) || 14);
    const dir = sideName === 'left' ? 1 : -1;
    const scale = Math.max(0.85, Math.min(1.75, baseR / 14));
    const upgraded = options.upgraded === true;

    ctx.save();
    ctx.translate(x, y);

    if (specialType === 'gunner') {
      if (sideName === 'left') {
        // Morion helmet + arquebus styling.
        ctx.fillStyle = '#c8d2df';
        ctx.beginPath();
        ctx.moveTo(-5.8 * scale, -16 * scale);
        ctx.lineTo(5.8 * scale, -16 * scale);
        ctx.lineTo(4 * scale, -8.4 * scale);
        ctx.lineTo(-4 * scale, -8.4 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#b63c2e';
        ctx.beginPath();
        ctx.moveTo(0, -16.5 * scale);
        ctx.lineTo(2.1 * scale, -20.3 * scale);
        ctx.lineTo(0.9 * scale, -14.8 * scale);
        ctx.closePath();
        ctx.fill();
      } else {
        // Jingasa hat + teppo profile.
        ctx.fillStyle = '#d4ba7f';
        ctx.beginPath();
        ctx.moveTo(0, -19.6 * scale);
        ctx.lineTo(-8.2 * scale, -11.2 * scale);
        ctx.lineTo(8.2 * scale, -11.2 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8a6b3e';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      if (upgraded) {
        ctx.strokeStyle = sideName === 'left' ? '#f8d098' : '#f8d4dc';
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(-9.8 * dir * scale, -5.4 * scale);
        ctx.lineTo(11.4 * dir * scale, -7.4 * scale);
        ctx.stroke();
      }
    } else if (specialType === 'necro') {
      if (sideName === 'left') {
        // Medieval hooded occultist silhouette.
        ctx.fillStyle = '#2f2233';
        ctx.beginPath();
        ctx.moveTo(0, -18 * scale);
        ctx.lineTo(-7.4 * scale, -8.5 * scale);
        ctx.lineTo(7.4 * scale, -8.5 * scale);
        ctx.closePath();
        ctx.fill();
      } else {
        // Onmyoji-style hat.
        ctx.fillStyle = '#202a39';
        ctx.fillRect(-6 * scale, -17 * scale, 12 * scale, 3.5 * scale);
        ctx.fillRect(-4 * scale, -21 * scale, 8 * scale, 4.5 * scale);
      }
      if (upgraded) {
        ctx.strokeStyle = sideName === 'left' ? '#d7c7ff' : '#f3cfd8';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, -2 * scale, 7.2 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (specialType === 'monk') {
      if (sideName === 'left') {
        // Friar hood.
        ctx.fillStyle = '#7f4d2d';
        ctx.beginPath();
        ctx.arc(0, -15 * scale, 5.2 * scale, Math.PI, 0, false);
        ctx.lineTo(5.2 * scale, -11 * scale);
        ctx.lineTo(-5.2 * scale, -11 * scale);
        ctx.closePath();
        ctx.fill();
      } else {
        // Straw travel hat.
        ctx.fillStyle = '#d6b879';
        ctx.beginPath();
        ctx.moveTo(0, -20 * scale);
        ctx.lineTo(-8 * scale, -11 * scale);
        ctx.lineTo(8 * scale, -11 * scale);
        ctx.closePath();
        ctx.fill();
      }
      if (upgraded) {
        ctx.strokeStyle = sideName === 'left' ? '#ffd8a3' : '#f5d4dd';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -1.5 * scale, 8.6 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (specialType === 'shield') {
      if (sideName === 'left') {
        // Kite shield crest.
        ctx.fillStyle = '#9a3f31';
        ctx.beginPath();
        ctx.moveTo(8 * scale, -5 * scale);
        ctx.lineTo(16 * scale, -2 * scale);
        ctx.lineTo(16 * scale, 7 * scale);
        ctx.lineTo(12 * scale, 14 * scale);
        ctx.lineTo(8 * scale, 7 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f5d7a4';
        ctx.fillRect(10.3 * scale, 0.2 * scale, 3.2 * scale, 6.2 * scale);
      } else {
        // Tate-like rectangular shield panel.
        ctx.fillStyle = '#704552';
        ctx.fillRect(7.2 * scale, -6 * scale, 8.8 * scale, 18 * scale);
        ctx.fillStyle = '#edc4cf';
        ctx.fillRect(10.8 * scale, -3 * scale, 1.8 * scale, 12 * scale);
      }
      if (upgraded) {
        ctx.strokeStyle = sideName === 'left' ? '#fbe9c6' : '#f6d9e2';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(7.2 * scale, -6 * scale, 8.8 * scale, 18 * scale);
      }
    } else if (specialType === 'president') {
      if (sideName === 'left') {
        // Crown and mantle.
        ctx.fillStyle = '#d8b05e';
        ctx.beginPath();
        ctx.moveTo(-5 * scale, -18 * scale);
        ctx.lineTo(-2 * scale, -22 * scale);
        ctx.lineTo(0, -18.5 * scale);
        ctx.lineTo(2 * scale, -22 * scale);
        ctx.lineTo(5 * scale, -18 * scale);
        ctx.closePath();
        ctx.fill();
      } else {
        // Court cap.
        ctx.fillStyle = '#583543';
        ctx.fillRect(-5.6 * scale, -20.5 * scale, 11.2 * scale, 4.2 * scale);
        ctx.fillStyle = '#ddb4bf';
        ctx.fillRect(-1.2 * scale, -16.3 * scale, 2.4 * scale, 5.2 * scale);
      }
      if (upgraded) {
        ctx.fillStyle = sideName === 'left' ? '#f3e0b6' : '#f6d8e2';
        ctx.fillRect(dir * 5.5 * scale, -2 * scale, 5.2 * scale, 6.2 * scale);
      }
    } else if (specialType === 'dragon') {
      if (sideName === 'left') {
        // Western horn profile.
        ctx.strokeStyle = '#f2c98d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8 * scale, -9 * scale);
        ctx.lineTo(12 * scale, -16 * scale);
        ctx.moveTo(5 * scale, -8 * scale);
        ctx.lineTo(8 * scale, -15 * scale);
        ctx.stroke();
      } else {
        // Eastern whiskers + pearl.
        ctx.strokeStyle = '#f3d3dd';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(8 * scale, -8 * scale);
        ctx.quadraticCurveTo(14 * scale, -11 * scale, 17 * scale, -5 * scale);
        ctx.moveTo(8 * scale, -6 * scale);
        ctx.quadraticCurveTo(14 * scale, -3 * scale, 17 * scale, 2 * scale);
        ctx.stroke();
        ctx.fillStyle = '#fde8ed';
        ctx.beginPath();
        ctx.arc(11.5 * scale, -2 * scale, 2.1 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      if (upgraded) {
        ctx.strokeStyle = sideName === 'left' ? '#ffcf8f' : '#f7d8e1';
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.arc(0, -2 * scale, 10.2 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (specialType === 'hero') {
      if (sideName === 'left') {
        ctx.fillStyle = '#cfd9e8';
        ctx.fillRect(-4.2 * scale, -17 * scale, 8.4 * scale, 3.2 * scale);
      } else {
        ctx.fillStyle = '#d0b06f';
        ctx.beginPath();
        ctx.moveTo(0, -19 * scale);
        ctx.lineTo(-6.4 * scale, -12 * scale);
        ctx.lineTo(6.4 * scale, -12 * scale);
        ctx.closePath();
        ctx.fill();
      }
    } else if (specialType === 'digger') {
      if (sideName === 'left') {
        ctx.fillStyle = '#a7b6c8';
        ctx.fillRect(-5.2 * scale, -12.4 * scale, 10.4 * scale, 3.2 * scale);
      } else {
        ctx.fillStyle = '#d8bd86';
        ctx.beginPath();
        ctx.moveTo(0, -15 * scale);
        ctx.lineTo(-6.2 * scale, -9 * scale);
        ctx.lineTo(6.2 * scale, -9 * scale);
        ctx.closePath();
        ctx.fill();
      }
    } else if (specialType === 'rider') {
      if (sideName === 'left') {
        ctx.fillStyle = '#6e2f26';
        ctx.fillRect(-2 * scale, -14 * scale, 4 * scale, 10 * scale);
        ctx.fillStyle = '#f5d8a8';
        ctx.fillRect(-2 * scale, -14 * scale, 2 * scale, 10 * scale);
      } else {
        ctx.fillStyle = '#764757';
        ctx.fillRect(-2.1 * scale, -14 * scale, 4.2 * scale, 10 * scale);
        ctx.fillStyle = '#f3d2db';
        ctx.fillRect(-0.4 * scale, -14 * scale, 0.8 * scale, 10 * scale);
      }
    } else if (specialType === 'bomber') {
      if (sideName === 'left') {
        ctx.fillStyle = '#6f4b2f';
        ctx.fillRect(7 * scale, -2.5 * scale, 5 * scale, 7 * scale);
        ctx.strokeStyle = '#d8bf95';
        ctx.lineWidth = 1;
        ctx.strokeRect(7 * scale, -2.5 * scale, 5 * scale, 7 * scale);
      } else {
        ctx.fillStyle = '#9f5a69';
        ctx.beginPath();
        ctx.arc(9.2 * scale, 0.4 * scale, 3.4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbeef2';
        ctx.fillRect(8.3 * scale, -4.8 * scale, 1.8 * scale, 2.2 * scale);
      }
    }

    ctx.restore();
  }

  drawThemedSpecialSprite(minion, specialType, options = {}) {
    if (!this.isThemedEmpires()) return false;
    if (!minion || !specialType) return false;

    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const { ctx } = this;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const baseR = Math.max(12, Number(minion.r) || 14);
    const scale = Math.max(0.82, Math.min(1.85, baseR / 14));
    const european = sideName === 'left';
    const westSide = sideName === 'left';
    let upgraded = options.upgraded === true;
    if (!upgraded) {
      if (specialType === 'gunner') upgraded = Boolean(minion.gunnerSkyCannonUpgraded);
      else if (specialType === 'necro') upgraded = Boolean(minion.necroExpertUpgraded);
      else if (specialType === 'monk') upgraded = Boolean(minion.monkHealCircleUpgraded);
      else if (specialType === 'shield') upgraded = Boolean(minion.shieldDarkMetalUpgraded) || (Number(minion.shieldDarkMetalTtl) || 0) > 0;
      else if (specialType === 'president') upgraded = Boolean(minion.presidentExecutiveOrderUpgraded);
      else if (specialType === 'dragon') upgraded = Boolean(minion.dragonSuperBreathUpgraded);
      else if (specialType === 'digger') upgraded = Boolean(minion.diggerGoldFinder);
      else if (specialType === 'rider') upgraded = Boolean(minion.riderSuperHorse) || Boolean(minion.super);
      else if (specialType === 'hero' || specialType === 'bomber') upgraded = Boolean(minion.super);
    }
    const shieldDarkMetalLife = specialType === 'shield'
      ? Math.max(0, Math.min(1, (Number(minion.shieldDarkMetalTtl) || 0) / SHIELD_DARK_METAL_DURATION))
      : 0;
    const shieldDarkMetalActive = shieldDarkMetalLife > 0.001;
    const shieldGuardPose = specialType === 'shield'
      ? Math.max(0, Math.min(1, Number(minion.shieldGuardPose) || 0))
      : 0;
    const riderChargeReady = specialType === 'rider'
      ? Boolean(minion.riderChargeReady)
      : false;
    const riderAttackLife = specialType === 'rider'
      ? Math.max(0, Math.min(1, (Number(minion.atkCd) || 0) / 0.72))
      : 0;

    const sideAccentSoft = westSide ? '#cee8ff' : '#ffd0d6';
    const sideAccentMain = westSide ? '#6eb3f1' : '#e66f79';
    const sideAccentDark = westSide ? '#345f9c' : '#8e3f48';
    const hpScale = Math.max(0.95, Math.min(1.85, scale * 1.06));
    const labelY = y - (baseR * (european ? 1.95 : 2.05));
    const labelColor = sideAccentSoft;
    const lowFx = this.fxQuality === 'low';
    const mediumFx = this.fxQuality === 'medium';
    const animNow = performance.now() * 0.001;
    const animSeed = (Number(minion.id) || 0) * 0.37 + (european ? 0 : 1.9);
    const physicsDrivenBob = specialType === 'dragon' || specialType === 'shield';
    const upgradeMotionBoost = upgraded ? 1.42 : 1;
    const moveFreq = specialType === 'rider' ? 7.4 : (specialType === 'dragon' ? 6.5 : 5.4);
    const bobAmp = cacheRender
      ? 0
      : ((physicsDrivenBob ? 0 : (specialType === 'rider' ? 1.55 : (specialType === 'dragon' ? 1.2 : 0.82))) * scale * upgradeMotionBoost);
    const swayAmpX = cacheRender || physicsDrivenBob ? 0 : (specialType === 'rider' ? 0.9 : 0.55) * scale * (upgraded ? 1.3 : 1);
    const animBobY = Math.sin(animNow * moveFreq + animSeed) * bobAmp;
    const animSwayX = Math.sin(animNow * (moveFreq * 0.5) + animSeed * 0.7) * swayAmpX;
    const animTilt = cacheRender
      ? 0
      : Math.sin(animNow * (moveFreq * 0.45) + animSeed * 0.91) * (specialType === 'rider' ? 0.07 : (specialType === 'dragon' ? 0.05 : 0.032)) * (upgraded ? 1.28 : 1);
    const drawX = x + animSwayX;
    const drawY = y + animBobY;
    const presidentSetup = specialType === 'president' && Boolean(minion.presidentSetup);
    const presidentAuraEnabled = presidentSetup && !minion.presidentAuraDisabled;
    const presidentAuraRadius = Math.max(110, Number(minion.presidentAuraRadius) || 190) * PRESIDENT_AURA_RANGE_SCALE;
    const heroSwingInput = specialType === 'hero'
      ? Math.max(-1, Math.min(1, Number.isFinite(minion.heroSwing) ? Number(minion.heroSwing) : 0))
      : 0;
    const heroWave = specialType === 'hero'
      ? Math.max(-1, Math.min(1, heroSwingInput * 1.22))
      : 0;
    const digPhase = specialType === 'digger'
      ? (Number.isFinite(minion.digPhase) ? minion.digPhase : animNow * 6.8)
      : 0;
    const digSwing = specialType === 'digger' ? Math.sin(digPhase * 3.1) : 0;
    const digBob = specialType === 'digger' ? Math.sin(digPhase * 1.9) * (1.7 * scale) : 0;
    const digHandLift = specialType === 'digger' ? Math.cos(digPhase * 2.6) * (1.2 * scale) : 0;
    const heroSwingBucket = specialType === 'hero'
      ? Math.max(0, Math.min(8, Math.round((heroWave + 1) * 4)))
      : -1;
    const digPhaseCycle = Math.PI * 2;
    const digPhaseBuckets = 10;
    const wrappedDigPhase = ((digPhase % digPhaseCycle) + digPhaseCycle) % digPhaseCycle;
    const digPhaseBucket = specialType === 'digger'
      ? Math.max(0, Math.min(digPhaseBuckets - 1, Math.round((wrappedDigPhase / digPhaseCycle) * (digPhaseBuckets - 1))))
      : -1;
    let beamFx = upgraded && specialType === 'president'
      ? {
        life: Math.max(
          0,
          Math.min(
            1,
            (Number(minion.presidentExecutiveOrderBeamTtl) || 0) / Math.max(0.01, Number(minion.presidentExecutiveOrderBeamMaxTtl) || 0.55)
          )
        ),
      }
      : null;
    if (beamFx && beamFx.life <= 0.001) beamFx = null;
    let breathFx = specialType === 'dragon' && (Number(minion.dragonBreathTtl) || 0) > 0
      ? { life: Math.max(0, Math.min(1, (Number(minion.dragonBreathTtl) || 0) / 0.24)) }
      : null;
    let muzzleFx = null;
    if (specialType === 'gunner') {
      const flash = Math.max(0, Math.min(1, (Number(minion.gunFlashTtl) || 0) / 0.18));
      if (flash > 0.001) {
        muzzleFx = {
          life: flash,
          mx: (european ? 21 : 22) * dir * scale,
          my: (european ? -2.8 : -3.4) * scale,
        };
      }
    }
    let usedCachedBody = false;
    if (!cacheRender && presidentAuraEnabled) {
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = this.withAlpha(sideAccentMain, 0.14);
      ctx.beginPath();
      ctx.arc(drawX, drawY, presidentAuraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.64;
      ctx.strokeStyle = this.withAlpha(sideAccentSoft, 0.88);
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(drawX, drawY, presidentAuraRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
    if (!cacheRender) {
      const radiusBucket = Math.max(12, Math.min(38, Math.round(baseR)));
      let widthMult = 6.8;
      let heightMult = 6.2;
      if (specialType === 'dragon') {
        widthMult = 9.2;
        heightMult = 7.4;
      } else if (specialType === 'rider') {
        widthMult = 8.2;
        heightMult = 7;
      } else if (specialType === 'president') {
        widthMult = 8;
        heightMult = 7;
      } else if (specialType === 'shield') {
        widthMult = 7.3;
        heightMult = 7.2;
      }
      const shieldDarkBucket = specialType === 'shield'
        ? Math.max(0, Math.min(5, Math.round(shieldDarkMetalLife * 5)))
        : -1;
      const shieldPoseBucket = specialType === 'shield'
        ? Math.max(0, Math.min(6, Math.round(shieldGuardPose * 6)))
        : -1;
      const riderChargeBucket = specialType === 'rider'
        ? (riderChargeReady ? 1 : 0)
        : -1;
      const cacheKey = [
        'themedSpecial',
        specialType,
        sideName,
        radiusBucket,
        upgraded ? 1 : 0,
        shieldDarkBucket,
        shieldPoseBucket,
        riderChargeBucket,
        heroSwingBucket,
        digPhaseBucket,
      ].join(':');
      const cacheWidth = Math.ceil(radiusBucket * widthMult + 56);
      const cacheHeight = Math.ceil(radiusBucket * heightMult + 56);
      const drawMinion = (animSwayX !== 0 || animBobY !== 0) ? { ...minion, x: drawX, y: drawY } : minion;
      const drewCached = this.drawSpriteFromCache(drawMinion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          r: radiusBucket,
        };
        if (specialType === 'shield') {
          proxy.shieldDarkMetalTtl = (Math.max(0, shieldDarkBucket) / 5) * SHIELD_DARK_METAL_DURATION;
          proxy.shieldGuardPose = Math.max(0, shieldPoseBucket) / 6;
        } else if (specialType === 'rider') {
          proxy.riderChargeReady = riderChargeBucket > 0;
        } else if (specialType === 'hero') {
          proxy.heroSwing = (heroSwingBucket / 4) - 1;
        } else if (specialType === 'digger') {
          proxy.digPhase = (digPhaseBucket / Math.max(1, digPhaseBuckets - 1)) * digPhaseCycle;
        }
        this.drawThemedSpecialSprite(proxy, specialType, {
          showHud: false,
          cacheRender: true,
          upgraded,
        });
      });
      if (drewCached) usedCachedBody = true;
    }

    if (!usedCachedBody) {
      ctx.fillStyle = '#0000002a';
      ctx.beginPath();
      ctx.ellipse(drawX, drawY + baseR * 1.08, baseR * (1.06 + (specialType === 'dragon' ? 0.48 : 0)), baseR * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(drawX, drawY);
      if (!cacheRender && Math.abs(animTilt) > 0.0001) ctx.rotate(animTilt);

      if (european) {
      if (specialType === 'gunner') {
        ctx.fillStyle = '#436f97';
        ctx.fillRect(-8.8 * scale, -4.2 * scale, 17.6 * scale, 16.4 * scale);
        ctx.fillStyle = '#b8d1e6';
        ctx.fillRect(-1.6 * scale, -4.2 * scale, 3.2 * scale, 16.4 * scale);
        ctx.fillStyle = '#f0d8bf';
        ctx.beginPath();
        ctx.arc(0, -10.4 * scale, 3.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#345a7f';
        ctx.beginPath();
        ctx.arc(0, -12.5 * scale, 3.6 * scale, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        const barrelX = 21 * dir * scale;
        const barrelY = -2.8 * scale;
        ctx.strokeStyle = '#d5e6f4';
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(5 * dir * scale, -2 * scale);
        ctx.lineTo(barrelX, barrelY);
        ctx.stroke();
        ctx.strokeStyle = '#5f86ab';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(7 * dir * scale, -3.4 * scale);
        ctx.lineTo(17 * dir * scale, -4.1 * scale);
        ctx.stroke();
        if (upgraded) {
          ctx.fillStyle = '#3f678d';
          ctx.fillRect(-7.2 * scale, -8.4 * scale, 5.6 * scale, 4 * scale);
          ctx.strokeStyle = '#d9e9f6';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(-3.8 * scale, -8.4 * scale);
          ctx.lineTo(-3.8 * scale, -20 * scale);
          ctx.stroke();
          ctx.fillStyle = '#e7f3fe';
          ctx.beginPath();
          ctx.arc(-3.8 * scale, -20.8 * scale, 2.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        const flash = Math.max(0, Math.min(1, (Number(minion.gunFlashTtl) || 0) / 0.18));
        if (flash > 0.001) muzzleFx = { life: flash, mx: barrelX, my: barrelY };
      } else if (specialType === 'necro') {
        // Plague doctor: dark coat, beak mask, satchel vials.
        ctx.fillStyle = '#27425b';
        ctx.beginPath();
        ctx.moveTo(-10.8 * scale, 12 * scale);
        ctx.lineTo(10.8 * scale, 12 * scale);
        ctx.lineTo(8.8 * scale, -6.8 * scale);
        ctx.lineTo(-8.8 * scale, -6.8 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f0dec7';
        ctx.beginPath();
        ctx.arc(-0.6 * scale, -10.2 * scale, 3.6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#cfe2f2';
        ctx.beginPath();
        ctx.moveTo(1.1 * dir * scale, -10.8 * scale);
        ctx.lineTo(8.2 * dir * scale, -9.3 * scale);
        ctx.lineTo(1.4 * dir * scale, -7.6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#171a20';
        ctx.beginPath();
        ctx.arc(-2.1 * scale, -10.5 * scale, 1.1 * scale, 0, Math.PI * 2);
        ctx.arc(0.8 * scale, -10.5 * scale, 1.1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#456b8d';
        ctx.fillRect(-2.4 * scale, -2.8 * scale, 4.8 * scale, 10.8 * scale);
        ctx.fillStyle = '#d7e8f5';
        ctx.fillRect(-0.9 * scale, -2.8 * scale, 1.8 * scale, 10.8 * scale);
        ctx.strokeStyle = '#d2e9f8';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(6 * dir * scale, -1.6 * scale);
        ctx.lineTo(16 * dir * scale, -14.2 * scale);
        ctx.stroke();
        ctx.fillStyle = '#9ecbf0';
        ctx.beginPath();
        ctx.arc(16 * dir * scale, -15.2 * scale, 2.4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#395f7f';
        ctx.fillRect(-11.5 * scale, -2.6 * scale, 2.8 * scale, 6.6 * scale);
        ctx.fillStyle = '#b4d9f3';
        ctx.fillRect(-11 * scale, -1.8 * scale, 1.8 * scale, 2.2 * scale);
        ctx.fillRect(-11 * scale, 1 * scale, 1.8 * scale, 2.2 * scale);
        if (upgraded) {
          ctx.strokeStyle = '#d7ebfa';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-7.8 * scale, -12.5 * scale);
          ctx.lineTo(-1.8 * scale, -18.2 * scale);
          ctx.lineTo(4.4 * scale, -12.5 * scale);
          ctx.stroke();
          ctx.strokeStyle = '#bad8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, -1.4 * scale, 8.4 * scale, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (specialType === 'monk') {
        ctx.fillStyle = '#4b7299';
        ctx.beginPath();
        ctx.moveTo(-10.2 * scale, 12 * scale);
        ctx.lineTo(10.2 * scale, 12 * scale);
        ctx.lineTo(8.2 * scale, -6 * scale);
        ctx.lineTo(-8.2 * scale, -6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#eac8a4';
        ctx.beginPath();
        ctx.arc(0, -10.6 * scale, 3.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3d658d';
        ctx.beginPath();
        ctx.arc(0, -10.9 * scale, 1.15 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d8ebf9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(6 * dir * scale, 4 * scale);
        ctx.lineTo(14.5 * dir * scale, -13 * scale);
        ctx.stroke();
        if (upgraded) {
          ctx.strokeStyle = '#e2f1fc';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(0, -13 * scale, 7.8 * scale, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
        }
      } else if (specialType === 'shield') {
        const shieldHeadY = -2 * baseR;
        const shieldHeadR = Math.max(3, baseR * 0.44);
        const bodyTop = shieldHeadY + shieldHeadR * 0.92;
        const bodyBottom = 13.2 * scale;
        const bodyHalfW = 8 * scale;
        const shieldFrontX = 13 * dir * scale;
        const shieldFrontY = 3 * scale;
        const shieldUpX = 4.2 * dir * scale;
        const shieldUpY = shieldHeadY - 18 * scale;
        const shieldCx = shieldFrontX + (shieldUpX - shieldFrontX) * shieldGuardPose;
        const shieldCy = shieldFrontY + (shieldUpY - shieldFrontY) * shieldGuardPose;
        const shieldW = 12.2 * scale;
        const shieldH = 30.2 * scale;
        const shieldTiltRad = Math.PI / 12;
        const shieldRot = -((Math.PI * 0.5) - shieldTiltRad) * dir * shieldGuardPose;
        ctx.fillStyle = shieldDarkMetalActive ? '#2b3038' : '#3f4f63';
        ctx.beginPath();
        ctx.moveTo(-bodyHalfW, bodyBottom);
        ctx.lineTo(bodyHalfW, bodyBottom);
        ctx.lineTo(bodyHalfW * 0.84, bodyTop);
        ctx.lineTo(-bodyHalfW * 0.84, bodyTop);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = shieldDarkMetalActive ? '#5e6674' : '#9cb5d4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, shieldHeadY + shieldHeadR * 0.84);
        ctx.lineTo(0, bodyTop + 1.4 * scale);
        ctx.stroke();
        ctx.fillStyle = shieldDarkMetalActive ? '#e3ebf4' : '#f0d5b2';
        ctx.beginPath();
        ctx.arc(0, shieldHeadY, shieldHeadR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = shieldDarkMetalActive ? '#141a23' : '#3d688f';
        ctx.beginPath();
        ctx.ellipse(0, shieldHeadY - shieldHeadR * 0.42, shieldHeadR * 0.66, shieldHeadR * 0.44, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = shieldDarkMetalActive ? '#eef4ff' : '#ffe5b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, shieldHeadY, shieldHeadR + 1.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.save();
        ctx.translate(shieldCx, shieldCy);
        ctx.rotate(shieldRot);
        ctx.fillStyle = shieldDarkMetalActive ? '#262c33' : '#315a7f';
        ctx.beginPath();
        ctx.moveTo(-shieldW * 0.48, -shieldH * 0.5);
        ctx.lineTo(shieldW * 0.48, -shieldH * 0.5);
        ctx.lineTo(shieldW * 0.5, shieldH * 0.32);
        ctx.lineTo(0, shieldH * 0.5);
        ctx.lineTo(-shieldW * 0.5, shieldH * 0.32);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = shieldDarkMetalActive ? '#85909f' : '#f3d9ac';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-shieldW * 0.18, -shieldH * 0.32);
        ctx.lineTo(shieldW * 0.1, 0);
        ctx.lineTo(-shieldW * 0.18, shieldH * 0.32);
        ctx.stroke();
        if (upgraded) {
          ctx.fillStyle = shieldDarkMetalActive ? '#d6deea' : '#e7eef6';
          ctx.beginPath();
          ctx.arc(shieldW * 0.38, -shieldH * 0.28, 1.9 * scale, 0, Math.PI * 2);
          ctx.arc(shieldW * 0.38, shieldH * 0.22, 1.9 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        // Deliberate hit-zone contrast: head, body, and shield lanes are readable in combat.
        {
          const bodyCx = dir * (baseR * (0.04 - shieldGuardPose * 0.12));
          const bodyCy = -baseR * (0.68 + shieldGuardPose * 0.04);
          const bodyR = baseR * (0.76 + shieldGuardPose * 0.22);
          ctx.save();
          ctx.globalAlpha = 0.72;
          ctx.setLineDash([2.4 * scale, 1.8 * scale]);
          ctx.strokeStyle = shieldDarkMetalActive ? '#f0bb65' : '#ffd487';
          ctx.lineWidth = 1.05;
          ctx.beginPath();
          ctx.arc(0, shieldHeadY, shieldHeadR + 1.2 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = shieldDarkMetalActive ? '#8cc8e8' : '#99c7e9';
          ctx.beginPath();
          ctx.arc(bodyCx, bodyCy, bodyR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = shieldDarkMetalActive ? '#e8f1ff' : '#d8eafd';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(shieldCx, shieldCy, shieldW * 0.56, shieldH * 0.5, shieldRot, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      } else if (specialType === 'president') {
        ctx.fillStyle = '#4b7298';
        ctx.fillRect(-9 * scale, 2 * scale, 18 * scale, 10 * scale);
        ctx.strokeStyle = '#d7e9f8';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-9 * scale, 2 * scale, 18 * scale, 10 * scale);
        ctx.fillStyle = '#3a648d';
        ctx.fillRect(-7.6 * scale, -5.8 * scale, 15.2 * scale, 12.8 * scale);
        ctx.fillStyle = '#f0d3b6';
        ctx.beginPath();
        ctx.arc(0, -11.2 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#345c82';
        ctx.beginPath();
        ctx.ellipse(0, -13.7 * scale, 3.6 * scale, 1.7 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cedbe9';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(4.8 * dir * scale, -2.2 * scale);
        ctx.lineTo(10.8 * dir * scale, -2.8 * scale);
        ctx.stroke();
        ctx.fillStyle = '#9bb0c8';
        ctx.beginPath();
        ctx.arc(11.5 * dir * scale, -2.8 * scale, 1.7 * scale, 0, Math.PI * 2);
        ctx.fill();
        if (upgraded) {
          ctx.fillStyle = '#e6f2fd';
          ctx.fillRect(dir * 6 * scale, -0.6 * scale, 5.6 * scale, 7.2 * scale);
          ctx.strokeStyle = '#9fbfd8';
          ctx.lineWidth = 1;
          ctx.strokeRect(dir * 6 * scale, -0.6 * scale, 5.6 * scale, 7.2 * scale);
        }
        const beamLife = upgraded
          ? Math.max(0, Math.min(1, (Number(minion.presidentExecutiveOrderBeamTtl) || 0) / Math.max(0.01, Number(minion.presidentExecutiveOrderBeamMaxTtl) || 0.55)))
          : 0;
        if (beamLife > 0.001) beamFx = { life: beamLife };
      } else if (specialType === 'dragon') {
        ctx.fillStyle = '#3d5778';
        ctx.beginPath();
        ctx.ellipse(0, 0, 15 * scale, 9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2a405f';
        ctx.beginPath();
        ctx.moveTo(-5 * scale, -2.6 * scale);
        ctx.lineTo(-23 * scale, -14.5 * scale);
        ctx.lineTo(-19 * scale, 4.5 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#304c6c';
        ctx.beginPath();
        ctx.moveTo(4 * scale, -1.4 * scale);
        ctx.lineTo(19 * scale, -13.4 * scale);
        ctx.lineTo(17 * scale, 6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#a4c4df';
        ctx.beginPath();
        ctx.arc(12 * scale, -3 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4e6f6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(13.5 * scale, -8.4 * scale);
        ctx.lineTo(18.2 * scale, -13.2 * scale);
        ctx.moveTo(10 * scale, -8.2 * scale);
        ctx.lineTo(13.6 * scale, -12.6 * scale);
        ctx.stroke();
        if (upgraded) {
          ctx.strokeStyle = '#f7d49f';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-4.5 * scale, -8 * scale);
          ctx.lineTo(1 * scale, -15 * scale);
          ctx.moveTo(2 * scale, -8.5 * scale);
          ctx.lineTo(8.8 * scale, -14.4 * scale);
          ctx.stroke();
        }
        if ((Number(minion.dragonBreathTtl) || 0) > 0) {
          breathFx = { life: Math.max(0, Math.min(1, (Number(minion.dragonBreathTtl) || 0) / 0.24)) };
        }
      } else if (specialType === 'hero') {
        // West champion: plated tabard, heater shield, longsword.
        ctx.fillStyle = '#406d95';
        ctx.beginPath();
        ctx.arc(0, 0, 11.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4a78a3';
        ctx.fillRect(-3.9 * scale, -5.8 * scale, 7.8 * scale, 11.7 * scale);
        ctx.fillStyle = '#e9d4b1';
        ctx.fillRect(-1.1 * scale, -5.8 * scale, 2.2 * scale, 11.7 * scale);
        ctx.fillStyle = '#99afc6';
        ctx.beginPath();
        ctx.arc(-7.4 * scale, -2.4 * scale, 2.1 * scale, 0, Math.PI * 2);
        ctx.arc(7.4 * scale, -2.4 * scale, 2.1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f0d4b7';
        ctx.beginPath();
        ctx.arc(0, -10.8 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#355d82';
        ctx.beginPath();
        ctx.arc(0, -12.8 * scale, 4 * scale, Math.PI, 0, false);
        ctx.lineTo(4 * scale, -10.8 * scale);
        ctx.lineTo(-4 * scale, -10.8 * scale);
        ctx.closePath();
        ctx.fill();
        const swordA = -0.78 + heroWave * 0.38;
        const swordLen = 14.6 * scale;
        const swordStartX = 5.8 * dir * scale;
        const swordStartY = (-4.1 + heroWave * 0.9) * scale;
        const swordEndX = swordStartX + dir * Math.cos(swordA) * swordLen;
        const swordEndY = swordStartY + Math.sin(swordA) * swordLen;
        const shieldWave = heroWave * 1.8 * scale;
        ctx.strokeStyle = '#f0d4b7';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(2.1 * dir * scale, -2.1 * scale + heroWave * 0.35 * scale);
        ctx.lineTo(swordStartX - dir * 0.5 * scale, swordStartY + 0.2 * scale);
        ctx.stroke();
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(-2.4 * dir * scale, -0.8 * scale - heroWave * 0.2 * scale);
        ctx.lineTo(-8.4 * dir * scale, 0.6 * scale + shieldWave * 0.2);
        ctx.stroke();
        ctx.strokeStyle = '#dbeaf8';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(swordStartX, swordStartY);
        ctx.lineTo(swordEndX, swordEndY);
        ctx.stroke();
        ctx.strokeStyle = '#8db7d9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(swordEndX - dir * (2.1 * scale), swordEndY - 0.8 * scale);
        ctx.lineTo(swordEndX + dir * (2.8 * scale), swordEndY + 0.6 * scale);
        ctx.stroke();
        ctx.fillStyle = '#3b6b94';
        ctx.beginPath();
        ctx.moveTo(-8.6 * dir * scale, -3.2 * scale);
        ctx.lineTo(-14.2 * dir * scale, -0.7 * scale + shieldWave);
        ctx.lineTo(-14.2 * dir * scale, 6.6 * scale + shieldWave * 0.7);
        ctx.lineTo(-9.7 * dir * scale, 9.8 * scale);
        ctx.lineTo(-7.5 * dir * scale, 2.6 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d1e6f6';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-11.2 * dir * scale, 0.4 * scale + shieldWave * 0.8);
        ctx.lineTo(-10 * dir * scale, 6.4 * scale + shieldWave * 0.5);
        ctx.stroke();
        if (upgraded) {
          const bannerWave = heroWave * 2.1 * scale;
          ctx.fillStyle = '#5587b3';
          ctx.beginPath();
          ctx.moveTo(-9 * scale, -6 * scale);
          ctx.lineTo(-16 * scale, -18 * scale + bannerWave);
          ctx.lineTo(-13 * scale, 4 * scale + bannerWave * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#e7f4ff';
          ctx.beginPath();
          ctx.moveTo(-1.4 * scale, -15.4 * scale);
          ctx.lineTo(0, -18.8 * scale);
          ctx.lineTo(1.4 * scale, -15.4 * scale);
          ctx.closePath();
          ctx.fill();
        }
      } else if (specialType === 'digger') {
        ctx.fillStyle = '#4f7499';
        ctx.beginPath();
        ctx.ellipse(0, 7 * scale, 12.6 * scale, 7.4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        const upperBob = digBob;
        ctx.fillStyle = '#456b8f';
        ctx.beginPath();
        ctx.arc(0, -1.4 * scale + upperBob * 0.3, 7.1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d5e8f8';
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.moveTo(-4.1 * scale, -2.8 * scale + upperBob * 0.25);
        ctx.lineTo(4.1 * scale, -2.8 * scale + upperBob * 0.25);
        ctx.stroke();
        const handX = 4 * dir * scale;
        const handY = 2 * scale + upperBob + digHandLift;
        const shovelA = 0.25 + digSwing * 0.45;
        const shovelLen = 17 * scale;
        const shovelTipX = handX + dir * Math.cos(shovelA) * shovelLen;
        const shovelTipY = handY + Math.sin(shovelA) * shovelLen;
        ctx.fillStyle = '#f0d7ba';
        ctx.beginPath();
        ctx.arc(0, -8.6 * scale + upperBob, 3.3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a617f';
        ctx.beginPath();
        ctx.arc(0, -10.8 * scale + upperBob, 2.8 * scale, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#d5e8f8';
        ctx.lineWidth = 2.3;
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(shovelTipX, shovelTipY);
        ctx.stroke();
        ctx.fillStyle = '#9bb0c7';
        ctx.beginPath();
        ctx.moveTo(shovelTipX, shovelTipY);
        ctx.lineTo(shovelTipX + dir * (5 * scale), shovelTipY + 2 * scale);
        ctx.lineTo(shovelTipX + dir * (0.2 * scale), shovelTipY + 4.8 * scale);
        ctx.closePath();
        ctx.fill();
        if (upgraded) {
          ctx.fillStyle = '#ffd666';
          ctx.beginPath();
          ctx.arc(-6.4 * scale, -9.5 * scale + upperBob, 1.7 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff3c4';
          ctx.beginPath();
          ctx.arc(-5.8 * scale, -9.5 * scale + upperBob, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (specialType === 'rider') {
        // West knight cavalry: armored horse + lance + shield.
        const hx = 11 * dir * scale;
        ctx.fillStyle = '#5a3a25';
        ctx.beginPath();
        ctx.ellipse(-2 * scale, 8.8 * scale, 13.8 * scale, 7.8 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3f2b1e';
        ctx.beginPath();
        ctx.ellipse(hx, 6 * scale, 4.2 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8698ab';
        ctx.beginPath();
        ctx.moveTo((hx + 1.4 * dir * scale), 4.7 * scale);
        ctx.lineTo((hx + 4.6 * dir * scale), 5.8 * scale);
        ctx.lineTo((hx + 1.8 * dir * scale), 7.4 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#6f869f';
        ctx.fillRect(-10.5 * scale, 5.3 * scale, 15.2 * scale, 4.4 * scale);
        ctx.strokeStyle = '#bcd0e6';
        ctx.lineWidth = 1;
        ctx.strokeRect(-10.5 * scale, 5.3 * scale, 15.2 * scale, 4.4 * scale);
        ctx.fillStyle = '#374a63';
        ctx.fillRect(-4.8 * scale, -6.1 * scale, 9.6 * scale, 12 * scale);
        ctx.fillStyle = '#cad7e7';
        ctx.fillRect(-1.1 * scale, -6.1 * scale, 2.2 * scale, 12 * scale);
        ctx.fillStyle = '#f4d9ab';
        ctx.beginPath();
        ctx.arc(0, -10.4 * scale, 3.4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a8be';
        ctx.fillRect(-3.4 * scale, -14.4 * scale, 6.8 * scale, 3.2 * scale);
        ctx.fillStyle = '#1f2a38';
        ctx.fillRect(-1.8 * scale, -13.1 * scale, 3.6 * scale, 0.9 * scale);
        if (riderChargeReady) {
          const chargePulse = 0.5 + 0.5 * Math.sin(animNow * 12.6 + animSeed * 1.7);
          ctx.save();
          ctx.globalAlpha = 0.7 + chargePulse * 0.24;
          ctx.strokeStyle = '#fff1cc';
          ctx.lineWidth = 1.5 * scale;
          const shellCx = dir * 1.7 * scale;
          const shellCy = 4.6 * scale;
          const shellPhase = animNow * 11.8 + animSeed * 1.2;
          for (let band = 0; band < 3; band += 1) {
            const rx = (12.6 + band * 2.4 + chargePulse * 2.1) * scale;
            const ry = (7.4 + band * 1.3 + chargePulse * 1.1) * scale;
            for (let seg = 0; seg < 4; seg += 1) {
              const start = shellPhase + seg * (Math.PI * 0.5) + band * 0.28;
              const end = start + 0.56 + chargePulse * 0.14;
              ctx.beginPath();
              ctx.ellipse(shellCx, shellCy, rx, ry, 0, start, end);
              ctx.stroke();
            }
          }
          for (let i = 0; i < 2; i += 1) {
            const markX = 15.6 * dir * scale + i * dir * 3.4 * scale;
            const markY = -8.8 * scale - i * 0.45 * scale;
            const markW = 3 * scale;
            const markH = 2 * scale;
            ctx.beginPath();
            ctx.moveTo(markX - dir * markW, markY - markH);
            ctx.lineTo(markX, markY);
            ctx.lineTo(markX - dir * markW, markY + markH);
            ctx.stroke();
          }
          ctx.strokeStyle = '#f7cf8f';
          ctx.lineWidth = 1.1 * scale;
          for (let i = 0; i < 2; i += 1) {
            const startX = shellCx + dir * (9.8 + i * 2.3) * scale;
            const startY = shellCy + (i === 0 ? -5.2 : 4.5) * scale;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(startX + dir * (3.8 + chargePulse * 1.8) * scale, startY + (i === 0 ? -0.4 : 0.4) * scale);
            ctx.stroke();
          }
          ctx.restore();
          // First boosted hit: lance-forward charge profile.
          ctx.strokeStyle = '#f3e8d4';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(6.4 * dir * scale, -1.8 * scale);
          ctx.lineTo(20.6 * dir * scale, -6.5 * scale);
          ctx.stroke();
          ctx.fillStyle = '#4f7ea8';
          ctx.beginPath();
          ctx.moveTo(12.8 * dir * scale, -5.2 * scale);
          ctx.lineTo(16.6 * dir * scale, -4.2 * scale);
          ctx.lineTo(12.8 * dir * scale, -3.1 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#335f86';
          ctx.beginPath();
          ctx.moveTo(7.6 * dir * scale, -2.2 * scale);
          ctx.lineTo(11.8 * dir * scale, -1.2 * scale);
          ctx.lineTo(7.7 * dir * scale, 2.1 * scale);
          ctx.lineTo(5.8 * dir * scale, 0.2 * scale);
          ctx.closePath();
          ctx.fill();
        } else {
          // Follow-up profile: shorter sidearm to support wagging melee animation.
          ctx.strokeStyle = '#dbe3ef';
          ctx.lineWidth = 2.15;
          ctx.beginPath();
          ctx.moveTo(6.2 * dir * scale, -1.5 * scale);
          ctx.lineTo(12.9 * dir * scale, -5.2 * scale);
          ctx.stroke();
          ctx.fillStyle = '#7f92a8';
          ctx.beginPath();
          ctx.arc(13.5 * dir * scale, -5.6 * scale, 1.45 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f2debb';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(12.1 * dir * scale, -6.3 * scale);
          ctx.lineTo(15 * dir * scale, -4.6 * scale);
          ctx.stroke();
        }
        if (upgraded) {
          ctx.strokeStyle = '#f5e1c2';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(-8.4 * scale, 6.3 * scale);
          ctx.lineTo(3.8 * scale, 6.3 * scale);
          ctx.moveTo(-8.4 * scale, 8.6 * scale);
          ctx.lineTo(3.8 * scale, 8.6 * scale);
          ctx.stroke();
          ctx.fillStyle = '#d3b98b';
          ctx.beginPath();
          ctx.moveTo(18.8 * dir * scale, -5 * scale);
          ctx.lineTo(22.5 * dir * scale, -6.6 * scale);
          ctx.lineTo(22.5 * dir * scale, -2.8 * scale);
          ctx.closePath();
          ctx.fill();
        }
      } else if (specialType === 'bomber') {
        ctx.fillStyle = '#486f95';
        ctx.beginPath();
        ctx.arc(0, 0, 11.1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f0d5b8';
        ctx.beginPath();
        ctx.arc(0, -10.3 * scale, 3.6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#4d6f8f';
        ctx.fillRect(8 * scale, -3 * scale, 6.2 * scale, 9.4 * scale);
        ctx.strokeStyle = '#dac29d';
        ctx.lineWidth = 1;
        ctx.strokeRect(8 * scale, -3 * scale, 6.2 * scale, 9.4 * scale);
        ctx.strokeStyle = '#f4d074';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(14.2 * scale, -3.4 * scale);
        ctx.lineTo(17.2 * scale, -7.8 * scale);
        ctx.stroke();
        if (upgraded) {
          ctx.fillStyle = '#567a9d';
          ctx.fillRect(-14 * scale, -2 * scale, 5.8 * scale, 8.4 * scale);
          ctx.strokeStyle = '#d5bf97';
          ctx.lineWidth = 1;
          ctx.strokeRect(-14 * scale, -2 * scale, 5.8 * scale, 8.4 * scale);
        }
      } else {
        ctx.restore();
        return false;
      }
      } else if (specialType === 'gunner') {
      ctx.fillStyle = '#a04f5d';
      ctx.beginPath();
      ctx.moveTo(-9 * scale, 12 * scale);
      ctx.lineTo(9 * scale, 12 * scale);
      ctx.lineTo(8 * scale, -6 * scale);
      ctx.lineTo(-8 * scale, -6 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e2bfca';
      ctx.fillRect(-1.6 * scale, -6 * scale, 3.2 * scale, 18 * scale);
      ctx.fillStyle = '#f3dfc7';
      ctx.beginPath();
      ctx.arc(0, -10.4 * scale, 3.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8f4453';
      ctx.fillRect(-4.4 * scale, -13.5 * scale, 8.8 * scale, 2.3 * scale);
      ctx.fillStyle = '#f7e6eb';
      ctx.beginPath();
      ctx.arc(0, -14 * scale, 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      const barrelX = 22 * dir * scale;
      const barrelY = -3.4 * scale;
      ctx.strokeStyle = '#f6d9e2';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(5 * dir * scale, -2.6 * scale);
      ctx.lineTo(barrelX, barrelY);
      ctx.stroke();
      ctx.strokeStyle = '#cd95a3';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(8 * dir * scale, -4.2 * scale);
      ctx.lineTo(17 * dir * scale, -4.9 * scale);
      ctx.stroke();
      if (upgraded) {
        ctx.fillStyle = '#b1606f';
        ctx.fillRect(-8 * scale, -8.4 * scale, 5.8 * scale, 4.2 * scale);
        ctx.strokeStyle = '#f6d8e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4.8 * scale, -8 * scale);
        ctx.lineTo(-7.4 * scale, -18.5 * scale);
        ctx.moveTo(-2.6 * scale, -8 * scale);
        ctx.lineTo(-5 * scale, -18.5 * scale);
        ctx.stroke();
      }
        const flash = Math.max(0, Math.min(1, (Number(minion.gunFlashTtl) || 0) / 0.18));
        if (flash > 0.001) muzzleFx = { life: flash, mx: barrelX, my: barrelY };
    } else if (specialType === 'necro') {
      // East funeral-officiant: white mourning robe + spirit tablet.
      ctx.fillStyle = '#f2f4ec';
      ctx.beginPath();
      ctx.moveTo(-10.6 * scale, 12 * scale);
      ctx.lineTo(10.6 * scale, 12 * scale);
      ctx.lineTo(8.8 * scale, -6.2 * scale);
      ctx.lineTo(-8.8 * scale, -6.2 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f0dde2';
      ctx.fillRect(-2.6 * scale, -6.2 * scale, 5.2 * scale, 18.2 * scale);
      ctx.fillStyle = '#a05463';
      ctx.fillRect(-1.3 * scale, -6.2 * scale, 2.6 * scale, 18.2 * scale);
      ctx.fillStyle = '#f1e0c7';
      ctx.beginPath();
      ctx.arc(0, -10.4 * scale, 3.7 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7e8ec';
      ctx.fillRect(-5.4 * scale, -13.9 * scale, 10.8 * scale, 1.8 * scale);
      ctx.strokeStyle = '#d7aebb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5.4 * scale, -12.1 * scale);
      ctx.lineTo(-7.8 * scale, -8.8 * scale);
      ctx.moveTo(5.4 * scale, -12.1 * scale);
      ctx.lineTo(7.8 * scale, -8.8 * scale);
      ctx.stroke();
      ctx.fillStyle = '#c79e66';
      const tabletX = 9.8 * dir * scale;
      ctx.fillRect(Math.min(tabletX, tabletX + 4.2 * dir * scale), -6.8 * scale, 4.2 * scale, 11.6 * scale);
      ctx.strokeStyle = '#8a6a45';
      ctx.lineWidth = 0.9;
      ctx.strokeRect(Math.min(tabletX, tabletX + 4.2 * dir * scale), -6.8 * scale, 4.2 * scale, 11.6 * scale);
      ctx.strokeStyle = '#8a6a45';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(tabletX + 0.8 * dir * scale, -3.2 * scale);
      ctx.lineTo(tabletX + 3.2 * dir * scale, -3.2 * scale);
      ctx.moveTo(tabletX + 0.8 * dir * scale, -0.6 * scale);
      ctx.lineTo(tabletX + 3.2 * dir * scale, -0.6 * scale);
      ctx.stroke();
      ctx.fillStyle = '#ffeef2';
      ctx.fillRect(-11.2 * scale, -1.8 * scale, 2.4 * scale, 7.4 * scale);
      ctx.fillStyle = '#cf9fad';
      ctx.fillRect(-10.5 * scale, -0.8 * scale, 1 * scale, 5.4 * scale);
      if (upgraded) {
        ctx.strokeStyle = '#f4d6df';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -0.5 * scale, 8.4 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffe8ee';
        ctx.beginPath();
        ctx.arc(-6.4 * scale, -2 * scale, 1.6 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (specialType === 'monk') {
      ctx.fillStyle = '#be8b4d';
      ctx.beginPath();
      ctx.moveTo(-10 * scale, 12 * scale);
      ctx.lineTo(10 * scale, 12 * scale);
      ctx.lineTo(8 * scale, -5.5 * scale);
      ctx.lineTo(-8 * scale, -5.5 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#efdbc0';
      ctx.beginPath();
      ctx.arc(0, -10.4 * scale, 3.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9f5261';
      ctx.fillRect(-4.2 * scale, -13.1 * scale, 8.4 * scale, 2.1 * scale);
      ctx.fillStyle = '#7c5834';
      ctx.beginPath();
      ctx.arc(0, -10.8 * scale, 1.15 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f7dbe3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(6 * dir * scale, 4 * scale);
      ctx.lineTo(14.8 * dir * scale, -13 * scale);
      ctx.stroke();
      if (upgraded) {
        ctx.strokeStyle = '#f6d8e1';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 2 * scale, 8 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (specialType === 'shield') {
      const shieldHeadY = -2 * baseR;
      const shieldHeadR = Math.max(3, baseR * 0.44);
      const bodyTop = shieldHeadY + shieldHeadR * 0.92;
      const bodyBottom = 13.4 * scale;
      const bodyHalfW = 8.2 * scale;
      const shieldFrontX = 13 * dir * scale;
      const shieldFrontY = 3 * scale;
      const shieldUpX = 4.2 * dir * scale;
      const shieldUpY = shieldHeadY - 18 * scale;
      const shieldCx = shieldFrontX + (shieldUpX - shieldFrontX) * shieldGuardPose;
      const shieldCy = shieldFrontY + (shieldUpY - shieldFrontY) * shieldGuardPose;
      const shieldW = 12.2 * scale;
      const shieldH = 30.2 * scale;
      const shieldTiltRad = Math.PI / 12;
      const shieldRot = -((Math.PI * 0.5) - shieldTiltRad) * dir * shieldGuardPose;
      ctx.fillStyle = shieldDarkMetalActive ? '#1f2a34' : '#964f5f';
      ctx.beginPath();
      ctx.moveTo(-bodyHalfW, bodyBottom);
      ctx.lineTo(bodyHalfW, bodyBottom);
      ctx.lineTo(bodyHalfW * 0.84, bodyTop);
      ctx.lineTo(-bodyHalfW * 0.84, bodyTop);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = shieldDarkMetalActive ? '#637181' : '#d0a0ad';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(0, shieldHeadY + shieldHeadR * 0.84);
      ctx.lineTo(0, bodyTop + 1.2 * scale);
      ctx.stroke();
      ctx.fillStyle = shieldDarkMetalActive ? '#e6eef6' : '#f0ddc1';
      ctx.beginPath();
      ctx.arc(0, shieldHeadY, shieldHeadR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = shieldDarkMetalActive ? '#111823' : '#7b4d58';
      ctx.beginPath();
      ctx.ellipse(0, shieldHeadY - shieldHeadR * 0.38, shieldHeadR * 0.7, shieldHeadR * 0.42, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shieldDarkMetalActive ? '#edf5ff' : '#f6dce4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, shieldHeadY, shieldHeadR + 1.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.translate(shieldCx, shieldCy);
      ctx.rotate(shieldRot);
      ctx.fillStyle = shieldDarkMetalActive ? '#21303d' : '#ad6070';
      ctx.beginPath();
      ctx.moveTo(-shieldW * 0.5, -shieldH * 0.46);
      ctx.lineTo(shieldW * 0.5, -shieldH * 0.46);
      ctx.lineTo(shieldW * 0.46, shieldH * 0.34);
      ctx.lineTo(0, shieldH * 0.5);
      ctx.lineTo(-shieldW * 0.46, shieldH * 0.34);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = shieldDarkMetalActive ? '#7a8c9e' : '#f0cdd7';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-shieldW * 0.2, -shieldH * 0.3);
      ctx.lineTo(shieldW * 0.22, -shieldH * 0.3);
      ctx.moveTo(-shieldW * 0.2, 0);
      ctx.lineTo(shieldW * 0.22, 0);
      ctx.moveTo(-shieldW * 0.2, shieldH * 0.3);
      ctx.lineTo(shieldW * 0.22, shieldH * 0.3);
      ctx.stroke();
      if (upgraded) {
        ctx.strokeStyle = '#f8dde5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(shieldW * 0.48, -shieldH * 0.42);
        ctx.lineTo(shieldW * 0.8, -shieldH * 0.42);
        ctx.moveTo(shieldW * 0.48, shieldH * 0.42);
        ctx.lineTo(shieldW * 0.8, shieldH * 0.42);
        ctx.stroke();
      }
      ctx.restore();
      // Deliberate hit-zone contrast: head, body, and shield lanes are readable in combat.
      {
        const bodyCx = dir * (baseR * (0.04 - shieldGuardPose * 0.12));
        const bodyCy = -baseR * (0.68 + shieldGuardPose * 0.04);
        const bodyR = baseR * (0.76 + shieldGuardPose * 0.22);
        ctx.save();
        ctx.globalAlpha = 0.72;
        ctx.setLineDash([2.4 * scale, 1.8 * scale]);
        ctx.strokeStyle = shieldDarkMetalActive ? '#e9b05f' : '#f5ccd6';
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.arc(0, shieldHeadY, shieldHeadR + 1.2 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = shieldDarkMetalActive ? '#84b9dd' : '#d7aab5';
        ctx.beginPath();
        ctx.arc(bodyCx, bodyCy, bodyR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = shieldDarkMetalActive ? '#edf4ff' : '#f8dde5';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(shieldCx, shieldCy, shieldW * 0.56, shieldH * 0.5, shieldRot, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (specialType === 'president') {
      // Court-official silhouette with robe, table, fan and command baton.
      ctx.fillStyle = '#944e5e';
      ctx.fillRect(-9.4 * scale, 2 * scale, 18.8 * scale, 10.4 * scale);
      ctx.strokeStyle = '#f0d0d9';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-9.4 * scale, 2 * scale, 18.8 * scale, 10.4 * scale);
      ctx.fillStyle = '#894555';
      ctx.beginPath();
      ctx.moveTo(-8 * scale, 7.8 * scale);
      ctx.lineTo(8 * scale, 7.8 * scale);
      ctx.lineTo(6.3 * scale, -6.2 * scale);
      ctx.lineTo(-6.3 * scale, -6.2 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f1cfd8';
      ctx.fillRect(-1.3 * scale, -6.2 * scale, 2.6 * scale, 14);
      ctx.fillStyle = '#f0ddc3';
      ctx.beginPath();
      ctx.arc(0, -11.1 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a3a49';
      ctx.fillRect(-6.7 * scale, -19.3 * scale, 13.4 * scale, 2.8 * scale);
      ctx.fillStyle = '#a75d6d';
      ctx.fillRect(-3.4 * scale, -16.5 * scale, 6.8 * scale, 2 * scale);
      ctx.fillStyle = '#935263';
      ctx.beginPath();
      ctx.moveTo(-9.2 * scale, -2 * scale);
      ctx.lineTo(-5.2 * scale, 2.8 * scale);
      ctx.lineTo(-7.8 * scale, 4.4 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(9.2 * scale, -2 * scale);
      ctx.lineTo(5.2 * scale, 2.8 * scale);
      ctx.lineTo(7.8 * scale, 4.4 * scale);
      ctx.closePath();
      ctx.fill();
      // Fan in off-hand.
      ctx.fillStyle = '#f8e1e8';
      ctx.beginPath();
      ctx.moveTo(-10.8 * dir * scale, -1.2 * scale);
      ctx.lineTo(-15.2 * dir * scale, -5.4 * scale);
      ctx.lineTo(-15.2 * dir * scale, 3.2 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d4a2b1';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-11.8 * dir * scale, -0.8 * scale);
      ctx.lineTo(-14 * dir * scale, -3.8 * scale);
      ctx.moveTo(-11.8 * dir * scale, -0.8 * scale);
      ctx.lineTo(-14.1 * dir * scale, 1.8 * scale);
      ctx.stroke();
      // Baton in command hand.
      ctx.strokeStyle = '#f3d4dd';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(4.8 * dir * scale, -2.2 * scale);
      ctx.lineTo(11.8 * dir * scale, -2.8 * scale);
      ctx.stroke();
      ctx.fillStyle = '#f8e1e8';
      ctx.beginPath();
      ctx.arc(12.4 * dir * scale, -2.8 * scale, 1.7 * scale, 0, Math.PI * 2);
      ctx.fill();
      if (upgraded) {
        ctx.fillStyle = '#ffe6ec';
        ctx.fillRect(dir * 6 * scale, -0.8 * scale, 5.6 * scale, 7.4 * scale);
        ctx.strokeStyle = '#ca93a2';
        ctx.lineWidth = 1;
        ctx.strokeRect(dir * 6 * scale, -0.8 * scale, 5.6 * scale, 7.4 * scale);
        // Added jade seal marker.
        ctx.fillStyle = '#f5d5dd';
        ctx.beginPath();
        ctx.arc(-6.6 * dir * scale, -2.6 * scale, 1.6 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      const beamLife = upgraded
        ? Math.max(0, Math.min(1, (Number(minion.presidentExecutiveOrderBeamTtl) || 0) / Math.max(0.01, Number(minion.presidentExecutiveOrderBeamMaxTtl) || 0.55)))
        : 0;
      if (beamLife > 0.001) beamFx = { life: beamLife };
    } else if (specialType === 'dragon') {
      ctx.strokeStyle = '#a85d6d';
      ctx.lineWidth = 7.2 * scale;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-16 * dir * scale, 6 * scale);
      ctx.quadraticCurveTo(-4 * dir * scale, -13 * scale, 12 * dir * scale, -2 * scale);
      ctx.stroke();
      ctx.strokeStyle = '#844959';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(-12 * dir * scale, 7 * scale);
      ctx.quadraticCurveTo(-1 * dir * scale, -8 * scale, 10 * dir * scale, -1 * scale);
      ctx.stroke();
      ctx.fillStyle = '#f8e1e8';
      ctx.beginPath();
      ctx.arc(12 * dir * scale, -3 * scale, 3.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f8d8e1';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(12.8 * dir * scale, -8 * scale);
      ctx.quadraticCurveTo(17 * dir * scale, -11 * scale, 21 * dir * scale, -5.4 * scale);
      ctx.moveTo(11.8 * dir * scale, -6.8 * scale);
      ctx.lineTo(17.2 * dir * scale, -9.2 * scale);
      ctx.stroke();
      if (upgraded) {
        ctx.fillStyle = '#ffd9e2';
        ctx.beginPath();
        ctx.arc(4 * dir * scale, -10 * scale, 1.8 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      if ((Number(minion.dragonBreathTtl) || 0) > 0) {
        breathFx = { life: Math.max(0, Math.min(1, (Number(minion.dragonBreathTtl) || 0) / 0.24)) };
      }
    } else if (specialType === 'hero') {
      // East champion: lamellar cuirass, sashimono, dao.
      ctx.fillStyle = '#955062';
      ctx.beginPath();
      ctx.arc(0, 0, 11 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ac6172';
      ctx.fillRect(-4.6 * scale, -5.8 * scale, 9.2 * scale, 11.6 * scale);
      ctx.strokeStyle = '#f6d8e1';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-4.2 * scale, -3.8 * scale);
      ctx.lineTo(4.2 * scale, -3.8 * scale);
      ctx.moveTo(-4.2 * scale, -1 * scale);
      ctx.lineTo(4.2 * scale, -1 * scale);
      ctx.moveTo(-4.2 * scale, 1.8 * scale);
      ctx.lineTo(4.2 * scale, 1.8 * scale);
      ctx.stroke();
      ctx.fillStyle = '#efd2da';
      ctx.fillRect(-1.2 * scale, -5.8 * scale, 2.4 * scale, 11.6 * scale);
      ctx.fillStyle = '#f0ddc2';
      ctx.beginPath();
      ctx.arc(0, -10.7 * scale, 3.8 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9a5566';
      ctx.fillRect(-4 * scale, -13.4 * scale, 8 * scale, 2.2 * scale);
      ctx.fillStyle = '#f4dbe2';
      ctx.beginPath();
      ctx.moveTo(-3 * scale, -13.4 * scale);
      ctx.lineTo(-5.4 * scale, -16.6 * scale);
      ctx.lineTo(-2.4 * scale, -15.4 * scale);
      ctx.closePath();
      ctx.fill();
      const swordA = -0.76 + heroWave * 0.4;
      const swordLen = 14.2 * scale;
      const swordStartX = 5.7 * dir * scale;
      const swordStartY = (-4 + heroWave * 0.88) * scale;
      const swordEndX = swordStartX + dir * Math.cos(swordA) * swordLen;
      const swordEndY = swordStartY + Math.sin(swordA) * swordLen;
      const sashWave = heroWave * 1.95 * scale;
      ctx.strokeStyle = '#f0ddc2';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(2 * dir * scale, -2 * scale + heroWave * 0.3 * scale);
      ctx.lineTo(swordStartX - dir * 0.4 * scale, swordStartY + 0.2 * scale);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-2.2 * dir * scale, -0.7 * scale - heroWave * 0.2 * scale);
      ctx.lineTo(-8 * dir * scale, 0.4 * scale + sashWave * 0.2);
      ctx.stroke();
      ctx.strokeStyle = '#f8dbe3';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(swordStartX, swordStartY);
      ctx.lineTo(swordEndX, swordEndY);
      ctx.lineTo(swordEndX - dir * (1.6 * scale), swordEndY + 1.6 * scale);
      ctx.stroke();
      ctx.fillStyle = '#ba6c7f';
      ctx.beginPath();
      ctx.moveTo(-8.2 * dir * scale, -2.4 * scale);
      ctx.lineTo(-13.4 * dir * scale, -6.4 * scale + sashWave);
      ctx.lineTo(-13.4 * dir * scale, 4 * scale + sashWave * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f3d6df';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-11.4 * dir * scale, -5.2 * scale + sashWave);
      ctx.lineTo(-11.4 * dir * scale, 2.8 * scale + sashWave * 0.6);
      ctx.stroke();
      if (upgraded) {
        const flagWave = heroWave * 2.2 * scale;
        ctx.fillStyle = '#f6d9e2';
        ctx.fillRect(-12.6 * scale, -10.2 * scale, 2.2 * scale, 12.6 * scale);
        ctx.fillStyle = '#a85d6d';
        ctx.beginPath();
        ctx.moveTo(-10.4 * scale, -10 * scale);
        ctx.lineTo(-4 * scale, -7.6 * scale + flagWave);
        ctx.lineTo(-10.4 * scale, -5.2 * scale + flagWave * 0.6);
        ctx.closePath();
        ctx.fill();
      }
    } else if (specialType === 'digger') {
      ctx.fillStyle = '#7c5f41';
      ctx.beginPath();
      ctx.ellipse(0, 7.2 * scale, 12.6 * scale, 7.6 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      const upperBob = digBob;
      ctx.fillStyle = '#8a6a49';
      ctx.beginPath();
      ctx.arc(0, -1.4 * scale + upperBob * 0.3, 7 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e6c6ce';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.moveTo(-4 * scale, -2.8 * scale + upperBob * 0.25);
      ctx.lineTo(4 * scale, -2.8 * scale + upperBob * 0.25);
      ctx.stroke();
      const handX = 4 * dir * scale;
      const handY = 2 * scale + upperBob + digHandLift;
      const shovelA = 0.25 + digSwing * 0.45;
      const shovelLen = 17 * scale;
      const shovelTipX = handX + dir * Math.cos(shovelA) * shovelLen;
      const shovelTipY = handY + Math.sin(shovelA) * shovelLen;
      ctx.fillStyle = '#f0dcc0';
      ctx.beginPath();
      ctx.arc(0, -8.6 * scale + upperBob, 3.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#9f5868';
      ctx.fillRect(-3.8 * scale, -12.6 * scale + upperBob, 7.6 * scale, 2.1 * scale);
      ctx.strokeStyle = '#dfb2bd';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.lineTo(shovelTipX, shovelTipY);
      ctx.stroke();
      ctx.fillStyle = '#e5bcc8';
      ctx.beginPath();
      ctx.moveTo(shovelTipX, shovelTipY);
      ctx.lineTo(shovelTipX + dir * (5 * scale), shovelTipY + 2 * scale);
      ctx.lineTo(shovelTipX + dir * (0.2 * scale), shovelTipY + 4.8 * scale);
      ctx.closePath();
      ctx.fill();
      if (upgraded) {
        ctx.strokeStyle = '#f7dbe3';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-4.8 * scale, -8.2 * scale + upperBob);
        ctx.lineTo(-9.8 * scale, -12.8 * scale + upperBob);
        ctx.moveTo(-2.4 * scale, -7.8 * scale + upperBob);
        ctx.lineTo(-7.4 * scale, -12.4 * scale + upperBob);
        ctx.stroke();
      }
    } else if (specialType === 'rider') {
      // East steppe rider: mongolian horse archer silhouette.
      const hx = 11.4 * dir * scale;
      ctx.fillStyle = '#57402c';
      ctx.beginPath();
      ctx.ellipse(-1.8 * scale, 8.7 * scale, 13.4 * scale, 7.4 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#463220';
      ctx.beginPath();
      ctx.ellipse(hx, 5.9 * scale, 4 * scale, 2.8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2a1f14';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo((hx - 1.8 * dir * scale), 4.4 * scale);
      ctx.lineTo((hx - 5.8 * dir * scale), 1.2 * scale);
      ctx.stroke();
      ctx.fillStyle = '#a45a6a';
      ctx.beginPath();
      ctx.moveTo(-5 * scale, 6 * scale);
      ctx.lineTo(5 * scale, 6 * scale);
      ctx.lineTo(4.1 * scale, -5.8 * scale);
      ctx.lineTo(-4.1 * scale, -5.8 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e4c3cd';
      ctx.fillRect(-1 * scale, -5.8 * scale, 2 * scale, 11.8 * scale);
      ctx.fillStyle = '#f0ddc2';
      ctx.beginPath();
      ctx.arc(0, -10.3 * scale, 3.3 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3f2b1f';
      ctx.beginPath();
      ctx.moveTo(-2.8 * scale, -12.8 * scale);
      ctx.lineTo(0, -14.6 * scale);
      ctx.lineTo(2.8 * scale, -12.8 * scale);
      ctx.lineTo(1.6 * scale, -10.9 * scale);
      ctx.lineTo(-1.6 * scale, -10.9 * scale);
      ctx.closePath();
      ctx.fill();
      if (riderChargeReady) {
        const chargePulse = 0.5 + 0.5 * Math.sin(animNow * 12.6 + animSeed * 1.7);
        ctx.save();
        ctx.globalAlpha = 0.72 + chargePulse * 0.22;
        ctx.strokeStyle = '#ffe8ef';
        ctx.lineWidth = 1.5 * scale;
        const shellCx = dir * 1.6 * scale;
        const shellCy = 4.5 * scale;
        const shellPhase = animNow * 11.8 + animSeed * 1.2;
        for (let band = 0; band < 3; band += 1) {
          const rx = (12.4 + band * 2.4 + chargePulse * 2.1) * scale;
          const ry = (7.2 + band * 1.3 + chargePulse * 1.1) * scale;
          for (let seg = 0; seg < 4; seg += 1) {
            const start = shellPhase + seg * (Math.PI * 0.5) + band * 0.28;
            const end = start + 0.56 + chargePulse * 0.14;
            ctx.beginPath();
            ctx.ellipse(shellCx, shellCy, rx, ry, 0, start, end);
            ctx.stroke();
          }
        }
        for (let i = 0; i < 2; i += 1) {
          const markX = 15.8 * dir * scale + i * dir * 3.4 * scale;
          const markY = -8.7 * scale - i * 0.45 * scale;
          const markW = 3 * scale;
          const markH = 2 * scale;
          ctx.beginPath();
          ctx.moveTo(markX - dir * markW, markY - markH);
          ctx.lineTo(markX, markY);
          ctx.lineTo(markX - dir * markW, markY + markH);
          ctx.stroke();
        }
        ctx.strokeStyle = '#f3aebe';
        ctx.lineWidth = 1.1 * scale;
        for (let i = 0; i < 2; i += 1) {
          const startX = shellCx + dir * (9.9 + i * 2.2) * scale;
          const startY = shellCy + (i === 0 ? -5.1 : 4.2) * scale;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + dir * (3.7 + chargePulse * 1.7) * scale, startY + (i === 0 ? -0.5 : 0.5) * scale);
          ctx.stroke();
        }
        ctx.restore();
        // First boosted hit: switch to a charge lance before the opening strike lands.
        ctx.strokeStyle = '#f2dcc3';
        ctx.lineWidth = 2.35;
        ctx.beginPath();
        ctx.moveTo(6.6 * dir * scale, -2.1 * scale);
        ctx.lineTo(20.8 * dir * scale, -6.1 * scale);
        ctx.stroke();
        ctx.fillStyle = '#e5bcc8';
        ctx.beginPath();
        ctx.moveTo(15.9 * dir * scale, -6.8 * scale);
        ctx.lineTo(20.4 * dir * scale, -5.8 * scale);
        ctx.lineTo(15.9 * dir * scale, -4.8 * scale);
        ctx.closePath();
        ctx.fill();
      } else {
        // Follow-up profile: short-range horse-archer kit.
        const bowGripX = 7.8 * dir * scale;
        const bowGripY = -2.2 * scale;
        const bowTipTopX = bowGripX + dir * 2.1 * scale;
        const bowTipTopY = bowGripY - 3.6 * scale;
        const bowTipBotX = bowGripX + dir * 2 * scale;
        const bowTipBotY = bowGripY + 1.4 * scale;
        const bowCurveX = bowGripX + dir * 4.2 * scale;
        const bowCurveY = bowGripY - 1.3 * scale;
        const stringOffsetX = -dir * 0.55 * scale;
        const arrowStartX = bowGripX + dir * 0.3 * scale;
        const arrowStartY = bowGripY - 0.9 * scale;
        const arrowEndX = arrowStartX + dir * 6.6 * scale;
        const arrowEndY = arrowStartY - 2 * scale;

        ctx.strokeStyle = '#f5d8e1';
        ctx.lineWidth = 1.9;
        ctx.beginPath();
        ctx.moveTo(bowTipTopX, bowTipTopY);
        ctx.quadraticCurveTo(bowCurveX, bowCurveY, bowTipBotX, bowTipBotY);
        ctx.stroke();

        // String sits on the body-side of the bow.
        ctx.strokeStyle = '#d1a0ad';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bowTipTopX + stringOffsetX, bowTipTopY + 0.2 * scale);
        ctx.lineTo(bowTipBotX + stringOffsetX, bowTipBotY - 0.2 * scale);
        ctx.stroke();

        // Arrow points up and away from the rider.
        ctx.strokeStyle = '#f8e5eb';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowStartY);
        ctx.lineTo(arrowEndX, arrowEndY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(arrowEndX - dir * 1.5 * scale, arrowEndY - 1.1 * scale);
        ctx.lineTo(arrowEndX + dir * 0.9 * scale, arrowEndY);
        ctx.lineTo(arrowEndX - dir * 1.5 * scale, arrowEndY + 1.1 * scale);
        ctx.stroke();
      }
      // Quiver.
      ctx.fillStyle = '#6c4d33';
      ctx.fillRect(-7.2 * scale, -3.8 * scale, 3 * scale, 7.8 * scale);
      ctx.strokeStyle = '#e0b4bf';
      ctx.lineWidth = 0.9;
      ctx.strokeRect(-7.2 * scale, -3.8 * scale, 3 * scale, 7.8 * scale);
      if (upgraded) {
        ctx.strokeStyle = '#f8dde5';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-7.4 * scale, -4.2 * scale);
        ctx.lineTo(-4.4 * scale, -8.6 * scale);
        ctx.moveTo(-6.2 * scale, -4 * scale);
        ctx.lineTo(-3.4 * scale, -8.2 * scale);
        ctx.stroke();
        ctx.fillStyle = '#f4dbe2';
        ctx.beginPath();
        ctx.moveTo(18.8 * dir * scale, -4.4 * scale);
        ctx.lineTo(22.8 * dir * scale, -5.8 * scale);
        ctx.lineTo(22.8 * dir * scale, -2.4 * scale);
        ctx.closePath();
        ctx.fill();
      }
      } else if (specialType === 'bomber') {
        ctx.fillStyle = '#a45969';
        ctx.beginPath();
        ctx.arc(0, 0, 11 * scale, 0, Math.PI * 2);
        ctx.fill();
      ctx.fillStyle = '#f0ddc1';
      ctx.beginPath();
      ctx.arc(0, -10.2 * scale, 3.6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#bc6f80';
      ctx.beginPath();
      ctx.arc(10.4 * dir * scale, 0.8 * scale, 4.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8f1db';
      ctx.fillRect(Math.min(9.4 * dir * scale, 11.6 * dir * scale), -5.2 * scale, 2.2 * scale, 2.6 * scale);
      if (upgraded) {
        ctx.fillStyle = '#b26475';
        ctx.beginPath();
        ctx.arc(-10.6 * dir * scale, 1 * scale, 3.6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8f1db';
        ctx.fillRect(Math.min(-11.2 * dir * scale, -9.4 * dir * scale), -3.6 * scale, 1.8 * scale, 2.1 * scale);
      }
      } else {
        ctx.restore();
        return false;
      }

      // Extra role-gear details so each special reads fuller even at a glance.
      const kitStroke = sideAccentSoft;
      const kitFill = sideAccentDark;
      ctx.save();
      ctx.globalAlpha = 0.86;
      ctx.strokeStyle = kitStroke;
      ctx.fillStyle = kitFill;
      ctx.lineWidth = 1;
      if (specialType === 'gunner') {
        ctx.strokeStyle = european ? '#cbe7fa' : '#f4d1da';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6.5 * scale, -3.2 * scale);
        ctx.lineTo(5.8 * scale, 5.2 * scale);
        ctx.stroke();
        ctx.fillStyle = european ? '#2d546d' : '#844757';
        ctx.fillRect(-8.8 * scale, 2.8 * scale, 2 * scale, 4.2 * scale);
        ctx.fillRect(-5.8 * scale, 4.2 * scale, 2 * scale, 4.2 * scale);
      } else if (specialType === 'necro') {
        ctx.fillStyle = european ? '#426886' : '#915264';
        ctx.fillRect(-5.8 * scale, -1.4 * scale, 1.6 * scale, 5 * scale);
        ctx.fillRect(-2.8 * scale, -0.6 * scale, 1.6 * scale, 4.2 * scale);
        ctx.fillRect(0.2 * scale, -1.2 * scale, 1.6 * scale, 4.8 * scale);
        ctx.strokeStyle = european ? '#9ac3d4' : '#f3d0d9';
        ctx.beginPath();
        ctx.moveTo(-6.4 * scale, 1.2 * scale);
        ctx.lineTo(2.2 * scale, 1.2 * scale);
        ctx.stroke();
      } else if (specialType === 'monk') {
        const beadY = 1.5 * scale;
        const beadColor = european ? '#d8f2ff' : '#f3d2db';
        ctx.fillStyle = beadColor;
        ctx.beginPath();
        ctx.arc(-4 * scale, beadY, 1.05 * scale, 0, Math.PI * 2);
        ctx.arc(-1.4 * scale, beadY + 1.1 * scale, 1.05 * scale, 0, Math.PI * 2);
        ctx.arc(1.2 * scale, beadY + 1.1 * scale, 1.05 * scale, 0, Math.PI * 2);
        ctx.arc(3.8 * scale, beadY, 1.05 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (specialType === 'shield') {
        ctx.fillStyle = european ? '#d7ecf8' : '#f3d2db';
        ctx.beginPath();
        ctx.arc(12.2 * dir * scale, -2.8 * scale, 0.9 * scale, 0, Math.PI * 2);
        ctx.arc(14.8 * dir * scale, 0.6 * scale, 0.9 * scale, 0, Math.PI * 2);
        ctx.arc(14.8 * dir * scale, 4 * scale, 0.9 * scale, 0, Math.PI * 2);
        ctx.arc(12.2 * dir * scale, 7.2 * scale, 0.9 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (specialType === 'president') {
        ctx.strokeStyle = european ? '#d9f2ff' : '#f3d2db';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-4.6 * scale, -1 * scale);
        ctx.lineTo(4.6 * scale, -1 * scale);
        ctx.moveTo(-4.6 * scale, 1.4 * scale);
        ctx.lineTo(4.6 * scale, 1.4 * scale);
        ctx.stroke();
        ctx.fillStyle = european ? '#6da9c5' : '#bf6f82';
        ctx.beginPath();
        ctx.arc(0, 4.6 * scale, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (specialType === 'dragon') {
        ctx.fillStyle = european ? '#d7f2ff' : '#f4d0d9';
        ctx.beginPath();
        ctx.moveTo(-4.2 * scale, -4.2 * scale);
        ctx.lineTo(-2.6 * scale, -6.6 * scale);
        ctx.lineTo(-1 * scale, -4.2 * scale);
        ctx.closePath();
        ctx.moveTo(-1 * scale, -5 * scale);
        ctx.lineTo(0.8 * scale, -7.6 * scale);
        ctx.lineTo(2.6 * scale, -5 * scale);
        ctx.closePath();
        ctx.moveTo(2.2 * scale, -4 * scale);
        ctx.lineTo(4 * scale, -6.4 * scale);
        ctx.lineTo(5.8 * scale, -4 * scale);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'hero') {
        ctx.fillStyle = european ? '#2a5d78' : '#a65b6d';
        ctx.beginPath();
        ctx.moveTo(-8.6 * scale, -3.6 * scale);
        ctx.lineTo(-4.6 * scale, -6.8 * scale);
        ctx.lineTo(-2.8 * scale, -2 * scale);
        ctx.lineTo(-7.2 * scale, 0.8 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8.6 * scale, -3.6 * scale);
        ctx.lineTo(4.6 * scale, -6.8 * scale);
        ctx.lineTo(2.8 * scale, -2 * scale);
        ctx.lineTo(7.2 * scale, 0.8 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = european ? '#dcf3ff' : '#f5d5dd';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -2.6 * scale);
        ctx.lineTo(0, 4.4 * scale);
        ctx.moveTo(-2.4 * scale, 0.8 * scale);
        ctx.lineTo(2.4 * scale, 0.8 * scale);
        ctx.stroke();
      } else if (specialType === 'digger') {
        ctx.strokeStyle = european ? '#d6ebf8' : '#f3d2db';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-5.4 * scale, -1.2 * scale);
        ctx.lineTo(3.6 * scale, 5 * scale);
        ctx.moveTo(-4.6 * scale, 1 * scale);
        ctx.lineTo(4.2 * scale, 7.2 * scale);
        ctx.stroke();
      } else if (specialType === 'rider') {
        ctx.fillStyle = european ? '#315e78' : '#a75d6e';
        ctx.fillRect(-9 * scale, 5.2 * scale, 13.2 * scale, 3.4 * scale);
        ctx.strokeStyle = european ? '#daf0ff' : '#f3d3dc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-7.6 * scale, 6.9 * scale);
        ctx.lineTo(2.8 * scale, 6.9 * scale);
        ctx.stroke();
      } else if (specialType === 'bomber') {
        ctx.strokeStyle = european ? '#d9efff' : '#efcad4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(9.1 * dir * scale, -0.9 * scale);
        ctx.lineTo(14 * dir * scale, -0.9 * scale);
        ctx.moveTo(9.1 * dir * scale, 1.8 * scale);
        ctx.lineTo(14 * dir * scale, 1.8 * scale);
        ctx.stroke();
      }
      if (upgraded) {
        ctx.fillStyle = european ? '#e8f8ff' : '#f6dbe3';
        ctx.beginPath();
        ctx.arc(-6.2 * scale, -6.2 * scale, 1.1 * scale, 0, Math.PI * 2);
        ctx.arc(6.2 * scale, -6.2 * scale, 1.1 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Role insignia overlay: richer visual read per special type.
      const sigY = specialType === 'dragon' ? (-1.8 * scale) : (0.8 * scale);
      const sigStroke = sideAccentSoft;
      const sigFill = sideAccentDark;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = sigStroke;
      ctx.fillStyle = sigFill;
      if (specialType === 'gunner') {
        ctx.beginPath();
        ctx.arc(0, sigY, 2.5 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-3.8 * scale, sigY);
        ctx.lineTo(3.8 * scale, sigY);
        ctx.moveTo(0, sigY - 3.8 * scale);
        ctx.lineTo(0, sigY + 3.8 * scale);
        ctx.stroke();
      } else if (specialType === 'necro') {
        ctx.beginPath();
        ctx.moveTo(0, sigY - 3.2 * scale);
        ctx.lineTo(2.8 * scale, sigY);
        ctx.lineTo(0, sigY + 3.2 * scale);
        ctx.lineTo(-2.8 * scale, sigY);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, sigY, 1.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (specialType === 'monk') {
        ctx.beginPath();
        ctx.arc(0, sigY, 3 * scale, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, sigY - 0.2 * scale, 1.1 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (specialType === 'shield') {
        ctx.beginPath();
        ctx.moveTo(0, sigY - 3.2 * scale);
        ctx.lineTo(2.8 * scale, sigY - 0.6 * scale);
        ctx.lineTo(1.8 * scale, sigY + 2.6 * scale);
        ctx.lineTo(-1.8 * scale, sigY + 2.6 * scale);
        ctx.lineTo(-2.8 * scale, sigY - 0.6 * scale);
        ctx.closePath();
        ctx.stroke();
      } else if (specialType === 'president') {
        ctx.beginPath();
        ctx.arc(0, sigY - 0.2 * scale, 2.3 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-1.8 * scale, sigY + 2.8 * scale);
        ctx.lineTo(-0.6 * scale, sigY + 1.2 * scale);
        ctx.lineTo(0.6 * scale, sigY + 2.8 * scale);
        ctx.stroke();
      } else if (specialType === 'dragon') {
        ctx.beginPath();
        ctx.moveTo(-3.2 * scale, sigY + 1.6 * scale);
        ctx.lineTo(0, sigY - 3 * scale);
        ctx.lineTo(3.2 * scale, sigY + 1.6 * scale);
        ctx.closePath();
        ctx.stroke();
      } else if (specialType === 'hero') {
        ctx.beginPath();
        ctx.moveTo(0, sigY - 3.3 * scale);
        ctx.lineTo(1.1 * scale, sigY - 1 * scale);
        ctx.lineTo(3.5 * scale, sigY - 0.7 * scale);
        ctx.lineTo(1.7 * scale, sigY + 0.9 * scale);
        ctx.lineTo(2.2 * scale, sigY + 3.2 * scale);
        ctx.lineTo(0, sigY + 1.9 * scale);
        ctx.lineTo(-2.2 * scale, sigY + 3.2 * scale);
        ctx.lineTo(-1.7 * scale, sigY + 0.9 * scale);
        ctx.lineTo(-3.5 * scale, sigY - 0.7 * scale);
        ctx.lineTo(-1.1 * scale, sigY - 1 * scale);
        ctx.closePath();
        ctx.stroke();
      } else if (specialType === 'digger') {
        ctx.beginPath();
        ctx.moveTo(-3.1 * scale, sigY + 2.4 * scale);
        ctx.lineTo(2.1 * scale, sigY - 2.2 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2.1 * scale, sigY - 2.2 * scale);
        ctx.lineTo(4.2 * scale, sigY - 0.9 * scale);
        ctx.lineTo(2.2 * scale, sigY + 0.2 * scale);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'rider') {
        ctx.beginPath();
        ctx.moveTo(-3.4 * scale, sigY + 1.2 * scale);
        ctx.lineTo(3.4 * scale, sigY - 1.2 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2.4 * scale, sigY - 2.2 * scale);
        ctx.lineTo(4.2 * scale, sigY - 1.2 * scale);
        ctx.lineTo(2.5 * scale, sigY - 0.2 * scale);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'bomber') {
        ctx.beginPath();
        ctx.arc(0, sigY, 2.6 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(1.4 * scale, sigY - 2.3 * scale);
        ctx.lineTo(3.4 * scale, sigY - 4 * scale);
        ctx.stroke();
      }
      if (upgraded) {
        ctx.strokeStyle = european ? '#e8f8ff' : '#f6dce4';
        ctx.lineWidth = 1;
        ctx.fillStyle = european ? '#e8f8ff' : '#f6dce4';
        if (specialType === 'gunner') {
          ctx.fillRect(-8.8 * scale, -7.8 * scale, 3.8 * scale, 2.2 * scale);
          ctx.strokeStyle = european ? '#ddf1ff' : '#f3d0d9';
          ctx.beginPath();
          ctx.moveTo(10.2 * dir * scale, -4.2 * scale);
          ctx.lineTo(18.2 * dir * scale, -4.2 * scale);
          ctx.moveTo(10.2 * dir * scale, -2.1 * scale);
          ctx.lineTo(18.2 * dir * scale, -2.1 * scale);
          ctx.stroke();
        } else if (specialType === 'necro') {
          ctx.strokeStyle = european ? '#c8f2ff' : '#f2cfd8';
          ctx.beginPath();
          ctx.arc(0, 1.2 * scale, 3.8 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -1.9 * scale);
          ctx.lineTo(1.7 * scale, 1.2 * scale);
          ctx.lineTo(0, 4.3 * scale);
          ctx.lineTo(-1.7 * scale, 1.2 * scale);
          ctx.closePath();
          ctx.fill();
        } else if (specialType === 'monk') {
          ctx.beginPath();
          ctx.arc(0, -2.2 * scale, 5.2 * scale, Math.PI * 0.16, Math.PI * 0.84);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(-3.6 * scale, -1.4 * scale, 0.9 * scale, 0, Math.PI * 2);
          ctx.arc(3.6 * scale, -1.4 * scale, 0.9 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else if (specialType === 'shield') {
          ctx.strokeStyle = european ? '#e3f4ff' : '#f4d3db';
          ctx.beginPath();
          ctx.moveTo(11 * dir * scale, -0.5 * scale);
          ctx.lineTo(14.6 * dir * scale, 3 * scale);
          ctx.lineTo(11 * dir * scale, 6.5 * scale);
          ctx.lineTo(7.4 * dir * scale, 3 * scale);
          ctx.closePath();
          ctx.stroke();
        } else if (specialType === 'president') {
          ctx.fillRect(-1.1 * scale, -3.5 * scale, 2.2 * scale, 7.2 * scale);
          ctx.beginPath();
          ctx.arc(0, 4.9 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else if (specialType === 'dragon') {
          ctx.beginPath();
          ctx.moveTo(-5.6 * scale, -1.4 * scale);
          ctx.lineTo(-4.1 * scale, -4 * scale);
          ctx.lineTo(-2.6 * scale, -1.4 * scale);
          ctx.closePath();
          ctx.moveTo(-2.1 * scale, -1.8 * scale);
          ctx.lineTo(-0.6 * scale, -4.4 * scale);
          ctx.lineTo(0.9 * scale, -1.8 * scale);
          ctx.closePath();
          ctx.moveTo(1.4 * scale, -1.4 * scale);
          ctx.lineTo(2.9 * scale, -4 * scale);
          ctx.lineTo(4.4 * scale, -1.4 * scale);
          ctx.closePath();
          ctx.fill();
        } else if (specialType === 'hero') {
          ctx.strokeStyle = european ? '#e7f7ff' : '#f5d5dd';
          ctx.beginPath();
          ctx.moveTo(-3.6 * scale, -4 * scale);
          ctx.lineTo(0, -7.2 * scale);
          ctx.lineTo(3.6 * scale, -4 * scale);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 2.2 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else if (specialType === 'digger') {
          ctx.beginPath();
          ctx.arc(-6.4 * scale, -9.1 * scale, 1.5 * scale, 0, Math.PI * 2);
          ctx.arc(-4.7 * scale, -8.2 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else if (specialType === 'rider') {
          ctx.strokeStyle = sideAccentSoft;
          ctx.beginPath();
          ctx.moveTo(-8.2 * scale, 5.9 * scale);
          ctx.lineTo(3.4 * scale, 5.9 * scale);
          ctx.moveTo(-8.2 * scale, 8.4 * scale);
          ctx.lineTo(3.4 * scale, 8.4 * scale);
          ctx.stroke();
        } else if (specialType === 'bomber') {
          ctx.beginPath();
          ctx.arc(-9.8 * dir * scale, -0.2 * scale, 1.4 * scale, 0, Math.PI * 2);
          ctx.arc(-12 * dir * scale, 1.9 * scale, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      ctx.restore();
    }

    if (specialType === 'shield' && !cacheRender && usedCachedBody) {
      // Keep shield-bearer collision zones legible even when body sprite is cache-rendered.
      const zoneHeadR = Math.max(3, baseR * 0.44);
      const zoneHeadX = drawX - dir * (baseR * 0.06);
      const zoneHeadY = drawY - baseR * 2;
      const zoneBodyX = drawX + dir * (baseR * (0.04 - shieldGuardPose * 0.12));
      const zoneBodyY = drawY - baseR * (0.68 + shieldGuardPose * 0.04);
      const zoneBodyR = baseR * (0.76 + shieldGuardPose * 0.22);
      const zoneFrontX = drawX + dir * (baseR * 0.92);
      const zoneFrontY = drawY + baseR * 0.21;
      const zoneUpX = drawX + dir * (baseR * 0.3);
      const zoneUpY = drawY - baseR * 3.29;
      const zoneShieldX = zoneFrontX + (zoneUpX - zoneFrontX) * shieldGuardPose;
      const zoneShieldY = zoneFrontY + (zoneUpY - zoneFrontY) * shieldGuardPose;
      const zoneShieldW = baseR * 0.87;
      const zoneShieldH = baseR * 2.16;
      const zoneShieldTiltRad = Math.PI / 12;
      const zoneShieldRot = -((Math.PI * 0.5) - zoneShieldTiltRad) * dir * shieldGuardPose;
      ctx.save();
      ctx.globalAlpha = shieldDarkMetalActive ? 0.8 : 0.72;
      ctx.setLineDash([3.2 * scale, 2.1 * scale]);
      ctx.strokeStyle = shieldDarkMetalActive ? '#f0bb65' : '#f4d3db';
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.arc(zoneHeadX, zoneHeadY, zoneHeadR + 1.1 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = shieldDarkMetalActive ? '#8cc8e8' : '#e3f4ff';
      ctx.beginPath();
      ctx.arc(zoneBodyX, zoneBodyY, zoneBodyR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = shieldDarkMetalActive ? '#edf4ff' : '#f8dde5';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(zoneShieldX, zoneShieldY, zoneShieldW * 0.56, zoneShieldH * 0.5, zoneShieldRot, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (specialType === 'dragon' && !cacheRender) {
      const dragonPhase = Number.isFinite(minion.flyPhase) ? minion.flyPhase : (animNow * 1.45);
      const wingFlap = Math.sin(dragonPhase * 2.3);
      const wingSweep = Math.cos(dragonPhase * 1.2);
      const breathLife = Math.max(0, Math.min(1, (Number(minion.dragonBreathTtl) || 0) / 0.24));
      const superBreathLife = Math.max(0, Math.min(1, (Number(minion.dragonSuperBreathTtl) || 0) / 1.8));
      const attackLife = Math.max(breathLife, superBreathLife * 0.95);
      const wingReach = baseR * (1.22 + attackLife * 0.18);
      const wingPeak = baseR * (0.66 + wingFlap * 0.5);
      const wingDrop = baseR * (0.42 + (1 - wingFlap) * 0.42);
      const mouthX = drawX + dir * (baseR * 0.94);
      const mouthY = drawY - baseR * 0.24;

      ctx.save();
      ctx.globalAlpha = 0.28 + attackLife * 0.2;
      ctx.fillStyle = westSide ? '#77c2ff4d' : '#ffb5bf4d';
      ctx.beginPath();
      ctx.moveTo(drawX + dir * (baseR * 0.22), drawY - baseR * 0.18);
      ctx.lineTo(drawX + dir * (wingReach * 1.16), drawY - wingPeak);
      ctx.lineTo(drawX + dir * (wingReach * 1.55), drawY + wingDrop);
      ctx.lineTo(drawX + dir * (baseR * 0.34), drawY + baseR * 0.36);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(drawX - dir * (baseR * 0.12), drawY - baseR * 0.16);
      ctx.lineTo(drawX - dir * (wingReach * 1.04), drawY - wingPeak * 0.92);
      ctx.lineTo(drawX - dir * (wingReach * 1.45), drawY + wingDrop * 0.88);
      ctx.lineTo(drawX - dir * (baseR * 0.3), drawY + baseR * 0.34);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.46 + attackLife * 0.2;
      ctx.strokeStyle = westSide ? '#cee8ff' : '#ffd0d6';
      ctx.lineWidth = 1.15 * scale;
      ctx.beginPath();
      ctx.moveTo(drawX + dir * (baseR * 0.18), drawY - baseR * 0.1);
      ctx.lineTo(drawX + dir * (wingReach * 1.06), drawY - wingPeak * 0.9);
      ctx.lineTo(drawX + dir * (wingReach * 1.32), drawY + wingDrop * 0.48 + wingSweep * baseR * 0.06);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(drawX - dir * (baseR * 0.2), drawY - baseR * 0.12);
      ctx.lineTo(drawX - dir * (wingReach), drawY - wingPeak * 0.82);
      ctx.lineTo(drawX - dir * (wingReach * 1.22), drawY + wingDrop * 0.46 - wingSweep * baseR * 0.06);
      ctx.stroke();

      if (attackLife > 0.001) {
        const jawDrop = baseR * (0.18 + attackLife * 0.46);
        ctx.globalAlpha = 0.64 + attackLife * 0.26;
        const mouthGlow = ctx.createRadialGradient(
          mouthX,
          mouthY + jawDrop * 0.3,
          1,
          mouthX,
          mouthY + jawDrop * 0.3,
          baseR * 0.84
        );
        mouthGlow.addColorStop(0, '#fff2c9');
        mouthGlow.addColorStop(0.45, '#ffab5b');
        mouthGlow.addColorStop(1, '#ff5338');
        ctx.fillStyle = mouthGlow;
        ctx.beginPath();
        ctx.ellipse(
          mouthX + dir * (baseR * 0.09),
          mouthY + jawDrop * 0.34,
          baseR * (0.36 + attackLife * 0.2),
          baseR * (0.22 + attackLife * 0.1),
          -dir * 0.12,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();

      const heart = this.dragonHeartCore({ side: sideName, x: drawX, y: drawY, r: baseR });
      this.drawDragonHeartMarker(heart.x, heart.y, heart.r, {
        attackLife,
        side: sideName,
        seed: Number(minion.id) || 0,
      });
    }

    if (upgraded && !cacheRender) {
      // Per-special elite animation overlays; simple trig + small primitive counts.
      const pulse = 0.5 + Math.sin(animNow * 8.1 + animSeed) * 0.5;
      const phase = animNow * 5.4 + animSeed * 1.2;
      const fastPhase = animNow * 10.6 + animSeed * 0.9;
      const fxA = sideAccentSoft;
      const fxB = sideAccentMain;
      const alphaMul = lowFx ? 0.72 : 1;

      ctx.save();
      if (specialType === 'gunner') {
        const muzzleX = drawX + dir * 18.8 * scale;
        const muzzleY = drawY - 3.2 * scale;
        if (european) {
          ctx.globalAlpha = (0.28 + pulse * 0.3) * alphaMul;
          ctx.strokeStyle = fxA;
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.arc(muzzleX, muzzleY, 4.4 * scale, phase, phase + Math.PI * 1.2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(muzzleX, muzzleY, 2.5 * scale, phase + Math.PI, phase + Math.PI * 2.2);
          ctx.stroke();
          ctx.globalAlpha = (0.42 + pulse * 0.24) * alphaMul;
          ctx.strokeStyle = fxB;
          ctx.beginPath();
          ctx.moveTo(drawX + dir * (6.4 * scale), drawY - 2 * scale);
          ctx.lineTo(drawX + dir * (10.4 * scale + Math.sin(fastPhase) * 1.6 * scale), drawY + 1.4 * scale);
          ctx.stroke();
        } else {
          const reticleR = 3.8 * scale;
          const rot = phase * 0.65;
          ctx.globalAlpha = (0.3 + pulse * 0.28) * alphaMul;
          ctx.strokeStyle = fxA;
          ctx.lineWidth = 1.15 * scale;
          ctx.save();
          ctx.translate(muzzleX, muzzleY);
          ctx.rotate(rot);
          ctx.strokeRect(-reticleR, -reticleR, reticleR * 2, reticleR * 2);
          ctx.strokeRect(-reticleR * 0.58, -reticleR * 0.58, reticleR * 1.16, reticleR * 1.16);
          ctx.restore();
          ctx.globalAlpha = (0.46 + pulse * 0.24) * alphaMul;
          ctx.fillStyle = fxB;
          ctx.beginPath();
          ctx.arc(muzzleX + dir * (2.2 * scale), muzzleY - 1.8 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.arc(muzzleX + dir * (3.8 * scale), muzzleY - 3.2 * scale, 0.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (specialType === 'necro') {
        // Upgraded necro: orbiting ghosts in an ellipse with front/back layering.
        const ghostCount = lowFx ? 3 : 5;
        const orbitRx = 10.8 * scale;
        const orbitRy = 3.9 * scale;
        const centerY = drawY - 3 * scale;
        const ghostFill = european ? '#dff4ff' : '#f7dde5';
        const eyeCol = european ? '#214257' : '#4a2b35';
        const ghostsBack = [];
        const ghostsFront = [];
        const drawGhost = (gx, gy, gSize, alpha = 1) => {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = ghostFill;
          ctx.beginPath();
          ctx.arc(gx, gy - gSize * 0.38, gSize * 0.72, Math.PI, 0, false);
          ctx.lineTo(gx + gSize * 0.72, gy + gSize * 0.82);
          ctx.quadraticCurveTo(gx + gSize * 0.34, gy + gSize * 0.5, gx, gy + gSize * 0.82);
          ctx.quadraticCurveTo(gx - gSize * 0.34, gy + gSize * 0.5, gx - gSize * 0.72, gy + gSize * 0.82);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = eyeCol;
          ctx.beginPath();
          ctx.arc(gx - gSize * 0.21, gy - gSize * 0.2, Math.max(0.5, gSize * 0.1), 0, Math.PI * 2);
          ctx.arc(gx + gSize * 0.21, gy - gSize * 0.2, Math.max(0.5, gSize * 0.1), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        for (let i = 0; i < ghostCount; i += 1) {
          const a = phase * 0.82 + i * (Math.PI * 2 / ghostCount);
          const depth = Math.sin(a);
          const gx = drawX + Math.cos(a) * orbitRx;
          const gy = centerY + depth * orbitRy + depth * 0.85 * scale;
          const gSize = (1.46 + (depth + 1) * 0.34) * scale;
          const entry = { gx, gy, gSize };
          if (depth < 0) ghostsBack.push(entry);
          else ghostsFront.push(entry);
        }

        // Rear arc and rear ghosts render behind the body.
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.globalAlpha = (0.14 + pulse * 0.14) * alphaMul;
        ctx.strokeStyle = fxA;
        ctx.lineWidth = 0.95 * scale;
        ctx.beginPath();
        ctx.ellipse(drawX, centerY, orbitRx, orbitRy, 0, Math.PI * 1.05, Math.PI * 1.95, false);
        ctx.stroke();
        for (let i = 0; i < ghostsBack.length; i += 1) {
          const g = ghostsBack[i];
          drawGhost(g.gx, g.gy, g.gSize, (0.22 + pulse * 0.2) * alphaMul);
        }
        ctx.restore();

        // Front arc and front ghosts render over the body.
        ctx.globalAlpha = (0.5 + pulse * 0.26) * alphaMul;
        ctx.strokeStyle = fxA;
        ctx.lineWidth = 1.18 * scale;
        ctx.beginPath();
        ctx.ellipse(drawX, centerY, orbitRx, orbitRy, 0, Math.PI * 0.05, Math.PI * 0.95, false);
        ctx.stroke();
        for (let i = 0; i < ghostsFront.length; i += 1) {
          const g = ghostsFront[i];
          drawGhost(g.gx, g.gy, g.gSize, (0.56 + pulse * 0.28) * alphaMul);
        }
      } else if (specialType === 'monk') {
        if (european) {
          const beads = lowFx ? 4 : 6;
          const ringR = 7.2 * scale;
          ctx.globalAlpha = (0.28 + pulse * 0.26) * alphaMul;
          ctx.strokeStyle = fxA;
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.arc(drawX, drawY - 0.8 * scale, ringR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = (0.5 + pulse * 0.28) * alphaMul;
          ctx.fillStyle = '#d8e9ff';
          for (let i = 0; i < beads; i += 1) {
            const a = phase * 0.7 + i * (Math.PI * 2 / beads);
            ctx.beginPath();
            ctx.arc(drawX + Math.cos(a) * ringR, drawY - 0.8 * scale + Math.sin(a) * ringR, 0.92 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          const swirlR = 7 * scale;
          ctx.globalAlpha = (0.3 + pulse * 0.24) * alphaMul;
          ctx.strokeStyle = fxA;
          ctx.lineWidth = 1.25 * scale;
          ctx.beginPath();
          ctx.arc(drawX, drawY - 0.8 * scale, swirlR, phase * 0.25, phase * 0.25 + Math.PI * 1.05);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(drawX, drawY - 0.8 * scale, swirlR, phase * 0.25 + Math.PI, phase * 0.25 + Math.PI * 2.05);
          ctx.stroke();
          ctx.globalAlpha = (0.52 + pulse * 0.24) * alphaMul;
          ctx.fillStyle = '#f5d9e2';
          ctx.beginPath();
          ctx.arc(drawX + Math.cos(phase) * 3.2 * scale, drawY - 0.8 * scale + Math.sin(phase) * 3.2 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.arc(drawX - Math.cos(phase) * 3.2 * scale, drawY - 0.8 * scale - Math.sin(phase) * 3.2 * scale, 1 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (specialType === 'shield') {
        const shift = ((fastPhase % (Math.PI * 2)) / (Math.PI * 2)) * (3.8 * scale);
        const sx = drawX + dir * 12.4 * scale;
        const headX = drawX - dir * (baseR * 0.06);
        const headY = drawY - baseR * 2;
        ctx.globalAlpha = (0.34 + pulse * 0.24) * alphaMul;
        ctx.strokeStyle = fxA;
        ctx.lineWidth = 1.25 * scale;
        if (european) {
          for (let i = 0; i < 3; i += 1) {
            const yOff = (-2 + i * 3.6) * scale + shift;
            ctx.beginPath();
            ctx.moveTo(sx - dir * 3.6 * scale, drawY + yOff - 1.4 * scale);
            ctx.lineTo(sx, drawY + yOff);
            ctx.lineTo(sx - dir * 3.6 * scale, drawY + yOff + 1.4 * scale);
            ctx.stroke();
          }
        } else {
          for (let i = 0; i < 4; i += 1) {
            const yOff = (-5.8 + i * 3.4) * scale + shift;
            ctx.beginPath();
            ctx.moveTo(sx - dir * 4.8 * scale, drawY + yOff);
            ctx.lineTo(sx - dir * 0.6 * scale, drawY + yOff);
            ctx.stroke();
          }
        }
        // Keep the vulnerable head zone obvious, especially during fast combat.
        ctx.globalAlpha = (0.46 + pulse * 0.24) * alphaMul;
        ctx.strokeStyle = shieldDarkMetalActive ? '#edf5ff' : (westSide ? '#cee8ff' : '#ffd0d6');
        ctx.lineWidth = 1.05 * scale;
        ctx.beginPath();
        ctx.arc(headX, headY, baseR * 0.42 + Math.sin(fastPhase * 0.9) * 0.32 * scale, 0, Math.PI * 2);
        ctx.stroke();
        if (shieldDarkMetalActive) {
          const moteCount = lowFx ? 3 : 6;
          const orbitRx = 8.6 * scale;
          const orbitRy = 12.4 * scale;
          for (let i = 0; i < moteCount; i += 1) {
            const a = phase * 1.2 + i * (Math.PI * 2 / moteCount);
            const depth = Math.sin(a);
            const mx = sx - dir * 1.1 * scale + Math.cos(a) * orbitRx;
            const my = drawY + depth * orbitRy;
            const mSize = (0.86 + (depth + 1) * 0.26) * scale;
            ctx.globalAlpha = (depth > 0 ? 0.52 : 0.24) * alphaMul;
            ctx.fillStyle = '#121821';
            ctx.beginPath();
            ctx.arc(mx, my, mSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = (depth > 0 ? 0.3 : 0.16) * alphaMul;
            ctx.fillStyle = '#8d98aa';
            ctx.beginPath();
            ctx.arc(mx - dir * mSize * 0.34, my - mSize * 0.2, mSize * 0.38, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (specialType === 'president') {
        const scrollFlutter = Math.sin(fastPhase) * 1.8 * scale;
        const scrollX = drawX + dir * 10.4 * scale;
        const scrollY = drawY - 1.6 * scale;
        if (european) {
          ctx.globalAlpha = (0.28 + pulse * 0.24) * alphaMul;
          ctx.strokeStyle = fxA;
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.arc(drawX, drawY - 7.8 * scale, 6 * scale, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = (0.52 + pulse * 0.26) * alphaMul;
          ctx.fillStyle = '#dcefff';
          ctx.fillRect(scrollX - dir * (2.2 * scale), scrollY - 2.1 * scale, 4.4 * scale, 4.2 * scale);
          ctx.beginPath();
          ctx.arc(scrollX + dir * (2.7 * scale), scrollY + scrollFlutter * 0.24, 1.1 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = (0.3 + pulse * 0.24) * alphaMul;
          ctx.strokeStyle = fxA;
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(drawX - 4.2 * scale, drawY - 8.8 * scale);
          ctx.lineTo(drawX + 4.2 * scale, drawY - 8.8 * scale);
          ctx.moveTo(drawX, drawY - 10.8 * scale);
          ctx.lineTo(drawX, drawY - 6.8 * scale);
          ctx.stroke();
          ctx.globalAlpha = (0.54 + pulse * 0.24) * alphaMul;
          ctx.fillStyle = '#f5d9e2';
          ctx.fillRect(scrollX - dir * (2 * scale), scrollY - 2 * scale, 4 * scale, 4 * scale);
          ctx.beginPath();
          ctx.arc(scrollX + dir * (2.8 * scale), scrollY + scrollFlutter * 0.3, 1.05 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (specialType === 'dragon') {
        const pearlA = phase * 0.9;
        const px = drawX + Math.cos(pearlA) * 10.8 * scale;
        const py = drawY - 3.4 * scale + Math.sin(pearlA) * 3.8 * scale;
        if (european) {
          ctx.globalAlpha = (0.34 + pulse * 0.25) * alphaMul;
          ctx.strokeStyle = fxA;
          ctx.lineWidth = 1.35 * scale;
          ctx.beginPath();
          ctx.moveTo(drawX - 8 * scale, drawY - 1.2 * scale);
          ctx.quadraticCurveTo(drawX - 1.2 * scale, drawY - 8.2 * scale + Math.sin(fastPhase) * 1.8 * scale, drawX + 7.4 * scale, drawY - 2 * scale);
          ctx.stroke();
          ctx.globalAlpha = (0.58 + pulse * 0.24) * alphaMul;
          ctx.fillStyle = '#dff2ff';
          ctx.beginPath();
          ctx.arc(px, py, 1.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = (0.32 + pulse * 0.24) * alphaMul;
          ctx.strokeStyle = '#f1cdd7';
          ctx.lineWidth = 1.2 * scale;
          ctx.beginPath();
          ctx.moveTo(drawX + dir * 8 * scale, drawY - 3.2 * scale);
          ctx.quadraticCurveTo(drawX + dir * 14.2 * scale, drawY - 8.1 * scale, drawX + dir * 18.8 * scale, drawY - 2.6 * scale);
          ctx.moveTo(drawX + dir * 8.2 * scale, drawY - 1.2 * scale);
          ctx.quadraticCurveTo(drawX + dir * 14.4 * scale, drawY + 1.6 * scale, drawX + dir * 18.4 * scale, drawY + 4 * scale);
          ctx.stroke();
          ctx.globalAlpha = (0.58 + pulse * 0.24) * alphaMul;
          ctx.fillStyle = '#f7dbe3';
          ctx.beginPath();
          ctx.arc(px, py, 1.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (specialType === 'hero') {
        const flutter = Math.sin(animNow * 12 + animSeed) * (3.4 * scale);
        if (european) {
          const slashA = fastPhase * 0.92;
          const slashSweep = Math.PI * (0.95 + Math.abs(heroWave) * 0.2);
          ctx.globalAlpha = (0.44 + pulse * 0.3) * alphaMul;
          ctx.fillStyle = '#b63b2d';
          ctx.beginPath();
          ctx.moveTo(drawX - dir * (6.8 * scale), drawY - 1.4 * scale);
          ctx.lineTo(drawX - dir * (14.2 * scale), drawY - 6.4 * scale + flutter * 0.45);
          ctx.lineTo(drawX - dir * (12.8 * scale), drawY + 2.8 * scale + flutter);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = fxA;
          ctx.lineWidth = 2.3 * scale;
          ctx.beginPath();
          ctx.arc(drawX + dir * 9.6 * scale, drawY - 3.8 * scale, 8.8 * scale, slashA, slashA + slashSweep);
          ctx.stroke();
        } else {
          ctx.globalAlpha = (0.42 + pulse * 0.3) * alphaMul;
          ctx.fillStyle = '#a65b6d';
          ctx.beginPath();
          ctx.moveTo(drawX - dir * (7 * scale), drawY - 1.6 * scale);
          ctx.lineTo(drawX - dir * (14.8 * scale), drawY - 5.8 * scale + flutter * 0.4);
          ctx.lineTo(drawX - dir * (14.1 * scale), drawY + 3.6 * scale + flutter);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#f4d1da';
          ctx.lineWidth = 2.05 * scale;
          ctx.beginPath();
          ctx.moveTo(drawX + dir * 6.4 * scale, drawY - 6.4 * scale);
          ctx.quadraticCurveTo(drawX + dir * 15.8 * scale, drawY - 10.4 * scale + Math.sin(phase) * 2.2 * scale, drawX + dir * 21.6 * scale, drawY - 2.4 * scale);
          ctx.moveTo(drawX + dir * 7.2 * scale, drawY - 4.2 * scale);
          ctx.quadraticCurveTo(drawX + dir * 14.8 * scale, drawY - 8.3 * scale + Math.sin(phase + 0.8) * 1.8 * scale, drawX + dir * 19.8 * scale, drawY - 1.8 * scale);
          ctx.stroke();
        }
      } else if (specialType === 'digger') {
        ctx.globalAlpha = (0.46 + pulse * 0.22) * alphaMul;
        const n1x = drawX - 6.4 * scale + Math.sin(phase) * 1.4 * scale;
        const n1y = drawY - 9.5 * scale + Math.cos(phase) * 0.8 * scale;
        const n2x = drawX - 4.3 * scale + Math.sin(phase + 1.7) * 1.1 * scale;
        const n2y = drawY - 7.8 * scale + Math.cos(phase + 1.7) * 0.8 * scale;
        if (european) {
          ctx.fillStyle = '#ffd06e';
          ctx.beginPath();
          ctx.arc(n1x, n1y, 1.3 * scale, 0, Math.PI * 2);
          ctx.arc(n2x, n2y, 1.05 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#f0c8d3';
          ctx.beginPath();
          ctx.moveTo(n1x, n1y - 1.4 * scale);
          ctx.lineTo(n1x + 1.2 * scale, n1y + 0.8 * scale);
          ctx.lineTo(n1x - 1.2 * scale, n1y + 0.8 * scale);
          ctx.closePath();
          ctx.moveTo(n2x, n2y - 1.2 * scale);
          ctx.lineTo(n2x + 1 * scale, n2y + 0.7 * scale);
          ctx.lineTo(n2x - 1 * scale, n2y + 0.7 * scale);
          ctx.closePath();
          ctx.fill();
        }
        ctx.strokeStyle = fxA;
        ctx.lineWidth = 1.1 * scale;
        ctx.beginPath();
        ctx.moveTo(drawX + dir * 7.2 * scale, drawY - 0.6 * scale);
        ctx.lineTo(drawX + dir * (13.2 * scale + Math.sin(fastPhase) * 1.3 * scale), drawY - 5.2 * scale);
        ctx.stroke();
      } else if (specialType === 'rider') {
        const dustCount = lowFx ? 2 : 3;
        ctx.globalAlpha = (0.5 + pulse * 0.24) * alphaMul;
        ctx.fillStyle = european ? '#d9ecff' : '#f3d2db';
        for (let i = 0; i < dustCount; i += 1) {
          const dx = drawX - dir * (7.4 - i * 4.4) * scale;
          const dy = drawY + (8.2 + Math.sin(fastPhase + i) * 0.8) * scale;
          ctx.beginPath();
          ctx.arc(dx, dy, (1.4 - i * 0.18) * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = (0.35 + pulse * 0.2) * alphaMul;
        ctx.strokeStyle = fxA;
        ctx.lineWidth = 1.2 * scale;
        if (riderChargeReady) {
          // Opening spike accent.
          const lanceTipX = drawX + dir * (16.8 * scale);
          const lanceTipY = drawY - 6.1 * scale;
          ctx.strokeStyle = european ? '#f6e4bf' : '#f8dce4';
          ctx.lineWidth = 1.75 * scale;
          ctx.beginPath();
          ctx.moveTo(drawX + dir * 5.8 * scale, drawY - 1.6 * scale);
          ctx.lineTo(lanceTipX, lanceTipY);
          ctx.stroke();
          ctx.globalAlpha = (0.46 + pulse * 0.26) * alphaMul;
          ctx.fillStyle = european ? '#ffebb8' : '#ffe3ea';
          ctx.beginPath();
          ctx.arc(lanceTipX + dir * 0.45 * scale, lanceTipY, 0.82 * scale + riderAttackLife * 0.58 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else if (european) {
          // West follow-up: wagging melee swing.
          const wag = Math.sin(fastPhase * 0.72 + animSeed * 0.8);
          const swingMul = 1 + riderAttackLife * 1.45;
          const fromX = drawX + dir * 7.4 * scale;
          const fromY = drawY - 1.5 * scale;
          const tipX = drawX + dir * (10.7 + wag * 2.1 * swingMul) * scale;
          const tipY = drawY + (-3.7 + Math.cos(fastPhase * 0.58 + animSeed) * 1.15 * swingMul) * scale;
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.quadraticCurveTo(
            drawX + dir * (8.8 + wag * 1.3) * scale,
            drawY - (3.8 + Math.sin(fastPhase) * 0.95) * scale,
            tipX,
            tipY
          );
          ctx.stroke();
          ctx.globalAlpha = (0.4 + riderAttackLife * 0.42) * alphaMul;
          ctx.fillStyle = '#f6e8ca';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 0.9 * scale + riderAttackLife * 0.6 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // East follow-up: short-range arrow shots (visual only).
          const bowX = drawX + dir * 7.6 * scale;
          const bowY = drawY - 2.8 * scale;
          const bowTopX = bowX + dir * 1.9 * scale;
          const bowTopY = bowY - 3.4 * scale;
          const bowBotX = bowX + dir * 1.8 * scale;
          const bowBotY = bowY + 1.3 * scale;
          const bowCurveX = bowX + dir * 3.8 * scale;
          const bowCurveY = bowY - 1.2 * scale;
          const stringOffsetX = -dir * 0.44 * scale;
          const shotLen = (6.6 + riderAttackLife * 7.4) * scale;
          const arrowStartX = bowX + dir * 0.2 * scale;
          const arrowStartY = bowY - 0.8 * scale;
          const arrowX = arrowStartX + dir * shotLen;
          const arrowY = arrowStartY - (1.4 + riderAttackLife * 0.6) * scale;
          ctx.strokeStyle = '#f8dee7';
          ctx.lineWidth = 1.3 * scale;
          ctx.beginPath();
          ctx.moveTo(bowTopX, bowTopY);
          ctx.quadraticCurveTo(bowCurveX, bowCurveY, bowBotX, bowBotY);
          ctx.stroke();
          ctx.strokeStyle = '#e8b7c4';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bowTopX + stringOffsetX, bowTopY + 0.2 * scale);
          ctx.lineTo(bowBotX + stringOffsetX, bowBotY - 0.2 * scale);
          ctx.stroke();
          ctx.strokeStyle = '#f8dee7';
          ctx.lineWidth = 1.3 * scale;
          ctx.beginPath();
          ctx.moveTo(arrowStartX, arrowStartY);
          ctx.lineTo(arrowX, arrowY);
          ctx.stroke();
          ctx.strokeStyle = '#e8b7c4';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(arrowX - dir * (2.2 * scale), arrowY - 1.1 * scale);
          ctx.lineTo(arrowX + dir * (0.8 * scale), arrowY);
          ctx.lineTo(arrowX - dir * (2.2 * scale), arrowY + 1.1 * scale);
          ctx.stroke();
          const tailX = drawX - dir * 6.8 * scale;
          ctx.beginPath();
          ctx.moveTo(tailX, drawY - 1.4 * scale);
          ctx.lineTo(tailX - dir * 5.6 * scale, drawY - 3 * scale);
          ctx.moveTo(tailX - dir * 4.1 * scale, drawY - 4.3 * scale);
          ctx.lineTo(tailX - dir * 6.1 * scale, drawY - 3 * scale);
          ctx.lineTo(tailX - dir * 4.1 * scale, drawY - 1.8 * scale);
          ctx.stroke();
        }
      } else if (specialType === 'bomber') {
        const bombX = drawX + dir * 10.6 * scale;
        const bombY = drawY + 0.8 * scale;
        ctx.globalAlpha = (0.32 + pulse * 0.25) * alphaMul;
        ctx.strokeStyle = fxA;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.arc(bombX, bombY, 4.9 * scale, phase, phase + Math.PI * 1.25);
        ctx.stroke();
        ctx.globalAlpha = (0.62 + pulse * 0.24) * alphaMul;
        if (european) {
          ctx.fillStyle = '#ffd08d';
          ctx.beginPath();
          ctx.arc(bombX + dir * 3 * scale, bombY - 4.8 * scale, 1.1 * scale, 0, Math.PI * 2);
          ctx.arc(bombX + dir * (4.3 * scale + Math.sin(fastPhase) * 0.9 * scale), bombY - 6.2 * scale, 0.95 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#e8f8ff';
          const chain = lowFx ? 2 : 3;
          for (let i = 0; i < chain; i += 1) {
            const cx = bombX - dir * (2.2 + i * 1.7) * scale;
            const cy = bombY - (4.4 + i * 1.15) * scale + Math.sin(fastPhase + i) * 0.35 * scale;
            ctx.beginPath();
            ctx.arc(cx, cy, (1 - i * 0.14) * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        const ringR = baseR * (1.02 + pulse * 0.14);
        ctx.globalAlpha = (0.28 + pulse * 0.24) * alphaMul;
        ctx.strokeStyle = fxA;
        ctx.lineWidth = 1.6 * scale;
        ctx.beginPath();
        ctx.arc(drawX, drawY - baseR * 0.28, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Secondary motion layer for upgraded units: independent cloth/gear flutter.
      const clothWaveA = Math.sin(animNow * 11.4 + animSeed * 1.7) * 2.2 * scale;
      const clothWaveB = Math.sin(animNow * 9.2 + animSeed * 2.3 + 1.1) * 1.8 * scale;
      const clothWaveC = Math.sin(animNow * 13.3 + animSeed * 1.35 + 2.2) * 1.3 * scale;
      ctx.globalAlpha = (0.36 + pulse * 0.28) * alphaMul;
        ctx.fillStyle = sideAccentDark;
        ctx.strokeStyle = sideAccentSoft;
      ctx.lineWidth = 0.95 * scale;
      if (specialType === 'gunner') {
        ctx.beginPath();
        ctx.moveTo(drawX - dir * 2.2 * scale, drawY + 3 * scale);
        ctx.lineTo(drawX - dir * (7.8 * scale), drawY + 1.2 * scale + clothWaveA * 0.35);
        ctx.lineTo(drawX - dir * (7 * scale), drawY + 6 * scale + clothWaveB * 0.45);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'necro') {
        ctx.beginPath();
        ctx.moveTo(drawX - 4.6 * scale, drawY + 8.8 * scale);
        ctx.lineTo(drawX - 7.2 * scale, drawY + 12.2 * scale + clothWaveA * 0.5);
        ctx.lineTo(drawX - 2.2 * scale, drawY + 11.6 * scale + clothWaveB * 0.35);
        ctx.closePath();
        ctx.moveTo(drawX + 4.6 * scale, drawY + 8.8 * scale);
        ctx.lineTo(drawX + 7.2 * scale, drawY + 12.2 * scale + clothWaveB * 0.5);
        ctx.lineTo(drawX + 2.2 * scale, drawY + 11.6 * scale + clothWaveA * 0.35);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'monk') {
          ctx.fillStyle = westSide ? '#bfe2ff' : '#ffb7c2';
        ctx.beginPath();
        ctx.moveTo(drawX - 3.6 * scale, drawY + 1.2 * scale);
        ctx.lineTo(drawX - 8 * scale, drawY + 5.2 * scale + clothWaveA * 0.34);
        ctx.lineTo(drawX - 5.4 * scale, drawY + 7.6 * scale + clothWaveC * 0.28);
        ctx.closePath();
        ctx.moveTo(drawX + 3.6 * scale, drawY + 1.2 * scale);
        ctx.lineTo(drawX + 8 * scale, drawY + 5.2 * scale + clothWaveB * 0.34);
        ctx.lineTo(drawX + 5.4 * scale, drawY + 7.6 * scale + clothWaveC * 0.28);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'shield') {
        ctx.beginPath();
        ctx.moveTo(drawX + dir * 4.2 * scale, drawY + 5.4 * scale);
        ctx.lineTo(drawX + dir * 1.2 * scale, drawY + 10 * scale + clothWaveA * 0.4);
        ctx.lineTo(drawX + dir * 5.4 * scale, drawY + 9.2 * scale + clothWaveB * 0.3);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'president') {
        ctx.beginPath();
        ctx.moveTo(drawX - dir * 6.8 * scale, drawY - 1.8 * scale);
        ctx.lineTo(drawX - dir * 12.6 * scale, drawY - 4.2 * scale + clothWaveA * 0.32);
        ctx.lineTo(drawX - dir * 11.4 * scale, drawY + 1.8 * scale + clothWaveB * 0.34);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'dragon') {
          ctx.fillStyle = sideAccentDark;
        ctx.beginPath();
        ctx.moveTo(drawX - dir * 1.2 * scale, drawY + 0.2 * scale);
        ctx.lineTo(drawX - dir * 7.4 * scale, drawY + 2 * scale + clothWaveA * 0.36);
        ctx.lineTo(drawX - dir * 6.6 * scale, drawY + 6 * scale + clothWaveB * 0.4);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'hero') {
        ctx.beginPath();
        ctx.moveTo(drawX - dir * 5.8 * scale, drawY - 1.8 * scale);
        ctx.lineTo(drawX - dir * 13.8 * scale, drawY - 6.8 * scale + clothWaveA * 0.5);
        ctx.lineTo(drawX - dir * 12.2 * scale, drawY + 2.4 * scale + clothWaveB * 0.55);
        ctx.closePath();
        ctx.moveTo(drawX - dir * 4.2 * scale, drawY - 0.8 * scale);
        ctx.lineTo(drawX - dir * 11.2 * scale, drawY - 4.2 * scale + clothWaveB * 0.5);
        ctx.lineTo(drawX - dir * 10 * scale, drawY + 3.8 * scale + clothWaveA * 0.45);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'digger') {
        ctx.beginPath();
        ctx.moveTo(drawX - dir * 2.8 * scale, drawY + 4.2 * scale);
        ctx.lineTo(drawX - dir * 7.6 * scale, drawY + 6.6 * scale + clothWaveA * 0.34);
        ctx.lineTo(drawX - dir * 5.6 * scale, drawY + 9.2 * scale + clothWaveB * 0.28);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'rider') {
        ctx.beginPath();
        ctx.moveTo(drawX - dir * 2.4 * scale, drawY + 1.2 * scale);
        ctx.lineTo(drawX - dir * 10.4 * scale, drawY - 1.6 * scale + clothWaveA * 0.42);
        ctx.lineTo(drawX - dir * 9.2 * scale, drawY + 4.8 * scale + clothWaveB * 0.38);
        ctx.closePath();
        ctx.fill();
      } else if (specialType === 'bomber') {
        ctx.beginPath();
        ctx.moveTo(drawX - dir * 3.4 * scale, drawY + 1.8 * scale);
        ctx.lineTo(drawX - dir * 8.2 * scale, drawY + 0.8 * scale + clothWaveA * 0.3);
        ctx.lineTo(drawX - dir * 7.1 * scale, drawY + 4.8 * scale + clothWaveB * 0.3);
        ctx.closePath();
        ctx.fill();
      }
      if (specialType !== 'dragon' && specialType !== 'bomber') {
        ctx.beginPath();
        ctx.moveTo(drawX - dir * 2.6 * scale, drawY + 2 * scale);
        ctx.lineTo(drawX - dir * 5 * scale, drawY + 4 * scale + clothWaveC * 0.35);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (!cacheRender && !lowFx) {
      // Always-on micro animation accents so non-upgraded specials still feel alive.
      const microPulse = 0.5 + Math.sin(animNow * 7.4 + animSeed * 1.1) * 0.5;
      const microPhase = animNow * 4.6 + animSeed * 0.85;
      const microA = sideAccentSoft;
      const microB = sideAccentDark;

      ctx.save();
      ctx.globalAlpha = 0.18 + microPulse * 0.2;
      ctx.strokeStyle = microA;
      ctx.fillStyle = microA;
      ctx.lineWidth = 0.95 * scale;

      if (specialType === 'gunner') {
        const gx = drawX + dir * 16.8 * scale;
        const gy = drawY - 3.2 * scale;
        ctx.beginPath();
        ctx.moveTo(gx - dir * 1.7 * scale, gy - 1.7 * scale);
        ctx.lineTo(gx + dir * 1.8 * scale, gy + 1.5 * scale);
        ctx.stroke();
      } else if (specialType === 'necro') {
        const tx = drawX + Math.cos(microPhase) * 6.8 * scale;
        const ty = drawY - 4.4 * scale + Math.sin(microPhase * 1.2) * 2.2 * scale;
        ctx.beginPath();
        ctx.arc(tx, ty, 0.9 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (specialType === 'monk') {
        const by = drawY + 0.8 * scale + Math.sin(microPhase) * 1.2 * scale;
        ctx.beginPath();
        ctx.arc(drawX - 3.4 * scale, by, 0.72 * scale, 0, Math.PI * 2);
        ctx.arc(drawX, by + 0.9 * scale, 0.72 * scale, 0, Math.PI * 2);
        ctx.arc(drawX + 3.4 * scale, by, 0.72 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (specialType === 'shield') {
        const sweep = ((microPhase % (Math.PI * 2)) / (Math.PI * 2)) * (7 * scale) - 3.5 * scale;
        const sx = drawX + dir * 12.5 * scale;
        ctx.beginPath();
        ctx.moveTo(sx + dir * sweep, drawY - 2.4 * scale);
        ctx.lineTo(sx + dir * (sweep + 2.4 * scale), drawY + 2.8 * scale);
        ctx.stroke();
      } else if (specialType === 'president') {
        const flutter = Math.sin(microPhase * 1.8) * 1.4 * scale;
        ctx.fillStyle = microB;
        ctx.fillRect(drawX + dir * 9.7 * scale, drawY - 1.1 * scale + flutter * 0.12, 2.4 * scale, 2.6 * scale);
      } else if (specialType === 'dragon') {
        ctx.beginPath();
        if (european) {
          ctx.moveTo(drawX + dir * 2.4 * scale, drawY - 7.8 * scale);
          ctx.lineTo(drawX + dir * 4.2 * scale, drawY - 11 * scale + Math.sin(microPhase) * 1.2 * scale);
        } else {
          ctx.moveTo(drawX + dir * 8.6 * scale, drawY - 3 * scale);
          ctx.quadraticCurveTo(drawX + dir * 14.2 * scale, drawY - 7.2 * scale + Math.sin(microPhase) * 1.6 * scale, drawX + dir * 17.4 * scale, drawY - 2.8 * scale);
        }
        ctx.stroke();
      } else if (specialType === 'hero') {
        const slash = microPhase * 0.95;
        ctx.beginPath();
        if (european) {
          ctx.arc(drawX + dir * 9.2 * scale, drawY - 3.2 * scale, 7.2 * scale, slash, slash + Math.PI * 0.55);
        } else {
          ctx.moveTo(drawX + dir * 6.5 * scale, drawY - 4.8 * scale);
          ctx.quadraticCurveTo(drawX + dir * 14.6 * scale, drawY - 9 * scale + Math.sin(microPhase) * 1.6 * scale, drawX + dir * 19 * scale, drawY - 2.9 * scale);
        }
        ctx.stroke();
      } else if (specialType === 'digger') {
        const sx = drawX - dir * 4.8 * scale + Math.sin(microPhase) * 1.2 * scale;
        const sy = drawY - 8.2 * scale + Math.cos(microPhase) * 0.8 * scale;
        ctx.beginPath();
        if (european) {
          ctx.arc(sx, sy, 0.9 * scale, 0, Math.PI * 2);
        } else {
          ctx.moveTo(sx, sy - 0.9 * scale);
          ctx.lineTo(sx + 0.8 * scale, sy + 0.6 * scale);
          ctx.lineTo(sx - 0.8 * scale, sy + 0.6 * scale);
          ctx.closePath();
        }
        ctx.fill();
      } else if (specialType === 'rider') {
        const tailX = drawX - dir * 6.2 * scale;
        const tailY = drawY - 0.8 * scale;
        ctx.beginPath();
        if (european) {
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(tailX - dir * (4.4 * scale), tailY + Math.sin(microPhase) * 1.2 * scale);
        } else {
          ctx.moveTo(tailX, tailY - 1.4 * scale);
          ctx.lineTo(tailX - dir * 5.2 * scale, tailY - 2.4 * scale);
          ctx.moveTo(tailX - dir * 4.2 * scale, tailY - 3.2 * scale);
          ctx.lineTo(tailX - dir * 5.6 * scale, tailY - 2.4 * scale);
          ctx.lineTo(tailX - dir * 4.2 * scale, tailY - 1.6 * scale);
        }
        ctx.stroke();
      } else if (specialType === 'bomber') {
        const bx = drawX + dir * 11.2 * scale;
        const by = drawY - 4.8 * scale;
        ctx.beginPath();
        ctx.arc(bx + dir * Math.sin(microPhase) * 1.1 * scale, by + Math.cos(microPhase * 1.2) * 0.9 * scale, 0.82 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    if (!cacheRender && muzzleFx) {
      const life = muzzleFx.life;
      ctx.save();
      ctx.globalAlpha = 0.45 + life * 0.5;
      ctx.fillStyle = westSide ? '#dff1ff' : '#ffe0e3';
      ctx.beginPath();
      ctx.arc(drawX + muzzleFx.mx, drawY + muzzleFx.my, 2 + life * 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = westSide ? '#6eb3f1' : '#e66f79';
      ctx.beginPath();
      ctx.arc(drawX + muzzleFx.mx + dir * (2 + life * 1.8), drawY + muzzleFx.my, 1.2 + life * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (!cacheRender && beamFx) {
      const toX = Number.isFinite(minion.presidentExecutiveOrderBeamToX) ? minion.presidentExecutiveOrderBeamToX : (drawX + dir * 76);
      const toY = Number.isFinite(minion.presidentExecutiveOrderBeamToY) ? minion.presidentExecutiveOrderBeamToY : (drawY - 10);
      const fromX = drawX + dir * 9;
      const fromY = drawY - baseR * 0.2;
      const life = beamFx.life;
      ctx.save();
      ctx.globalAlpha = 0.35 + life * 0.62;
      ctx.strokeStyle = sideAccentSoft;
      ctx.lineWidth = (lowFx ? 1.8 : 2) + life * (lowFx ? 1.8 : 2.6);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      if (lowFx) {
        ctx.lineTo(toX, toY);
      } else {
        ctx.quadraticCurveTo((fromX + toX) * 0.5 + dir * (7 + life * 8), (fromY + toY) * 0.5 - 8, toX, toY);
      }
      ctx.stroke();
      ctx.restore();
    }
    if (!cacheRender && breathFx) {
      const toX = Number.isFinite(minion.dragonBreathToX) ? minion.dragonBreathToX : (drawX + dir * 120);
      const toY = Number.isFinite(minion.dragonBreathToY) ? minion.dragonBreathToY : (drawY + 12);
      const fromX = drawX + dir * (baseR * 0.95);
      const fromY = drawY - baseR * 0.24;
      const life = breathFx.life;
      ctx.save();
      ctx.globalAlpha = (lowFx ? 0.28 : 0.34) + life * (lowFx ? 0.36 : 0.6);
      if (lowFx) {
        ctx.strokeStyle = westSide ? '#7dc8ff' : '#f08b97';
      } else {
        const grad = ctx.createLinearGradient(fromX, fromY, toX, toY);
        grad.addColorStop(0, westSide ? '#dff1ff' : '#ffe0e3');
        grad.addColorStop(1, westSide ? '#6eb3f1' : '#e66f79');
        ctx.strokeStyle = grad;
      }
      ctx.lineWidth = (lowFx ? 3 : 4) + life * (lowFx ? 3.2 : 6);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      if (lowFx) {
        ctx.lineTo(toX, toY);
      } else {
        const wobble = mediumFx ? 4 : 8;
        ctx.quadraticCurveTo((fromX + toX) * 0.5 + Math.sin(performance.now() * 0.006) * wobble, (fromY + toY) * 0.5 - 6, toX, toY);
      }
      ctx.stroke();
      ctx.restore();
    }
    if (specialType === 'shield' && !cacheRender) {
      const hitLife = Math.max(0, Math.min(1, (Number(minion.hitFlashTtl) || 0) / MINION_HIT_FLASH_TTL));
      if (hitLife > 0.001) {
        const hx = drawX - dir * (baseR * 0.06);
        const hy = drawY - baseR * 2;
        const pulseR = baseR * (0.44 + hitLife * 0.28);
        ctx.save();
        ctx.globalAlpha = 0.2 + hitLife * 0.5;
        ctx.strokeStyle = '#fff2cf';
        ctx.lineWidth = 1.5 + hitLife * 2;
        ctx.beginPath();
        ctx.arc(hx, hy, pulseR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
    let label = specialType.toUpperCase();
    if (specialType === 'necro') label = 'NECRO';
    else if (specialType === 'shield') label = shieldDarkMetalActive ? 'DARK METAL' : (upgraded ? 'FORTIFIED SHIELD' : 'SHIELD');
    else if (specialType === 'president') label = 'PRESIDENT';
    else if (specialType === 'dragon') label = 'DRAGON';
    else if (specialType === 'rider') label = 'RIDER';
    else if (specialType === 'digger') label = upgraded ? 'GOLD FINDER' : 'DIGGER';
    else if (specialType === 'hero') label = 'HERO';
    else if (specialType === 'bomber') label = 'BOMBER';
    else if (specialType === 'gunner') label = 'GUNNER';
    else if (specialType === 'monk') label = 'MONK';

    if (showHud && !cacheRender) {
      ctx.fillStyle = labelColor;
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(label, x, labelY);
      this.drawMinionHpBar(minion, x, y, hpScale);
    }
    return true;
  }

  backgroundGradient(height) {
    if (!this.cachedBackgroundGradient || this.cachedBackgroundHeight !== height) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#17263d');
      gradient.addColorStop(1, '#102033');
      this.cachedBackgroundGradient = gradient;
      this.cachedBackgroundHeight = height;
    }
    return this.cachedBackgroundGradient;
  }

  themedBackgroundPalette(width, height) {
    const key = `${Math.round(width)}x${Math.round(height)}`;
    if (!this.cachedThemedBackground || this.cachedThemedBackgroundKey !== key) {
      // Neutral battlefield tone selected by color-distance checks vs both empire palettes.
      const sky = this.ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#313a36');
      sky.addColorStop(0.55, '#2a322f');
      sky.addColorStop(1, '#202825');

      const centerHaze = this.ctx.createLinearGradient(width * 0.5 - 86, 0, width * 0.5 + 86, 0);
      centerHaze.addColorStop(0, '#0f172100');
      centerHaze.addColorStop(0.5, '#0f17218a');
      centerHaze.addColorStop(1, '#0f172100');

      const topGlow = this.ctx.createLinearGradient(0, 0, 0, height * 0.62);
      topGlow.addColorStop(0, '#d8e5c922');
      topGlow.addColorStop(1, '#d8e5c900');

      this.cachedThemedBackground = {
        sky,
        centerHaze,
        topGlow,
        divider: '#667069',
        ground: '#2f3835',
      };
      this.cachedThemedBackgroundKey = key;
    }
    return this.cachedThemedBackground;
  }

  harvestBackdropWorkerCount(sideState) {
    const economy = Math.max(1, Number(sideState?.resourceLevel) || 1);
    const workers = Math.max(0, economy - 1);
    return Math.min(12, 1 + workers);
  }

  drawBackdropHarvester(sideName, x, y, scale = 1, animT = 0) {
    const { ctx } = this;
    const side = sideName === 'right' ? 'right' : 'left';
    const dir = side === 'right' ? -1 : 1;
    const swing = Math.sin(animT) * 0.38;
    const step = Math.sin(animT * 0.74 + 1.2) * 0.95;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Lifted contrast so silhouettes stay readable at gameplay distance.
    ctx.fillStyle = '#4a5d53';
    ctx.strokeStyle = '#5a6f63';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.55;

    ctx.beginPath();
    ctx.arc(0, -7.2 + step * 0.1, 2.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-3.1, -3.6);
    ctx.lineTo(2.8, -3.6);
    ctx.lineTo(3.6, 6.5);
    ctx.lineTo(-3.7, 6.5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-1.5, 6.2);
    ctx.lineTo(-2.8, 11 + step * 0.34);
    ctx.moveTo(1.5, 6.2);
    ctx.lineTo(2.7, 10.9 - step * 0.34);
    ctx.stroke();

    ctx.save();
    ctx.translate(dir * 2.3, -2.1);
    ctx.rotate(dir * (0.34 + swing));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(9.6 * dir, -5.2);
    ctx.stroke();
    ctx.beginPath();
    if (side === 'right') {
      ctx.arc(11 * dir, -5.8, 2.35, dir > 0 ? 0.82 : 2.28, dir > 0 ? 2.68 : 4.4);
    } else {
      ctx.arc(11.2 * dir, -5.7, 2.55, dir > 0 ? 0.52 : 2.62, dir > 0 ? 2.56 : 4.62);
    }
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  drawBottomCropSilhouettes(sideName, width, bottomY, animSec) {
    const { ctx } = this;
    const side = sideName === 'right' ? 'right' : 'left';
    const start = side === 'left' ? 18 : Math.max(18, width * 0.56);
    const end = side === 'left' ? Math.max(start + 40, width * 0.45) : width - 18;
    const span = Math.max(20, end - start);
    const spacing = 9.6;
    const count = Math.max(8, Math.floor(span / spacing));
    const baseY = bottomY - 1;

    if (side === 'left') {
      // Bread-side crop silhouette (wheat-like stalks).
      ctx.fillStyle = '#54675d';
      ctx.strokeStyle = '#63776c';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < count; i += 1) {
        const t = count <= 1 ? 0 : (i / (count - 1));
        const x = start + t * span + Math.sin(animSec * 0.62 + i * 0.71) * 0.9;
        const h = 9 + (i % 4) * 2.5 + Math.sin(animSec * 1.4 + i * 0.5) * 1.6;
        ctx.fillRect(x - 1.4, baseY - h, 2.8, h);
        ctx.beginPath();
        ctx.moveTo(x, baseY - h + 2.4);
        ctx.lineTo(x - 4.2, baseY - h - 1.2);
        ctx.moveTo(x, baseY - h + 1.2);
        ctx.lineTo(x + 4, baseY - h - 0.8);
        ctx.stroke();
      }
      return;
    }

    // Rice-side crop silhouette (bent rice stems).
    ctx.strokeStyle = '#61766a';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < count; i += 1) {
      const t = count <= 1 ? 0 : (i / (count - 1));
      const x = start + t * span + Math.sin(animSec * 0.58 + i * 0.67) * 0.85;
      const h = 10 + (i % 5) * 2.1 + Math.sin(animSec * 1.22 + i * 0.6) * 1.5;
      const lean = 2.8 + Math.sin(animSec * 1.1 + i * 0.33) * 1.6;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.quadraticCurveTo(x + lean * 0.35, baseY - h * 0.55, x + lean, baseY - h);
      ctx.stroke();
      ctx.fillStyle = '#54695d';
      ctx.beginPath();
      ctx.ellipse(x + lean + 0.9, baseY - h + 0.2, 2.3, 1.28, 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  backdropWorkerFieldPoint(sideName, workerIndex, lane, width, bottomY, animSec) {
    const side = sideName === 'right' ? 'right' : 'left';
    const leftStart = 26;
    const leftEnd = Math.max(leftStart + 30, width * 0.42 - 20);
    const rightStart = Math.min(width - 50, width * 0.56 + 20);
    const rightEnd = width - 26;
    const start = side === 'left' ? leftStart : rightStart;
    const end = side === 'left' ? leftEnd : rightEnd;
    const span = Math.max(24, end - start);

    const speed = (side === 'left' ? 12 : 10.6) + lane * 1.7 + (workerIndex % 3) * 0.6;
    const seed = workerIndex * 13.73 + lane * 4.91 + (side === 'left' ? 0 : 17.3);
    const cycle = (animSec * speed + seed) % (span * 2);
    const ping = cycle <= span ? cycle : (span * 2 - cycle);
    const t = ping / span;
    const x = start + ping;

    const slopeDrop = side === 'left'
      ? (1 - t) * (3.6 + lane * 0.8)
      : t * (4.2 + lane * 0.85);
    const laneOffset = side === 'left' ? lane * 6.8 : lane * 7.2;
    const bob = Math.sin(animSec * (1.2 + lane * 0.15) + seed) * (1.4 + lane * 0.25);
    const drift = Math.cos(animSec * 0.72 + seed * 0.6) * 1.6;
    const yBase = side === 'left'
      ? bottomY - 22 - laneOffset - slopeDrop
      : bottomY - 23 - laneOffset - slopeDrop;
    const y = yBase + bob + drift;
    const scale = (side === 'left'
      ? (0.88 + lane * 0.11 + t * 0.07)
      : (0.86 + lane * 0.1 + (1 - t) * 0.07)) * 2;
    const animPhase = animSec * (2.4 + lane * 0.2) + seed * 0.8;
    return { x, y, scale, animPhase };
  }

  drawThemedHarvestBackdrop(snapshot, world, nowMs, width, height) {
    const { ctx } = this;
    const bottomY = height - 2;
    const horizonY = Number(world?.groundY) || Math.round(height * 0.74);
    const leftState = snapshot?.left || {};
    const rightState = snapshot?.right || {};
    const anim = nowMs * 0.001;

    ctx.save();
    // Distant high silhouettes so the mountains/terraces stay up in the background.
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#2a312e';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(0, horizonY - 116);
    ctx.quadraticCurveTo(width * 0.12, horizonY - 212, width * 0.2, horizonY - 142);
    ctx.quadraticCurveTo(width * 0.29, horizonY - 92, width * 0.43, horizonY - 156);
    ctx.lineTo(width * 0.48, horizonY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2b332f';
    ctx.beginPath();
    ctx.moveTo(width, horizonY);
    ctx.lineTo(width, horizonY - 146);
    ctx.quadraticCurveTo(width * 0.9, horizonY - 252, width * 0.82, horizonY - 164);
    ctx.quadraticCurveTo(width * 0.72, horizonY - 92, width * 0.57, horizonY - 152);
    ctx.lineTo(width * 0.52, horizonY);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#202825';
    for (let row = 0; row < 6; row += 1) {
      const y = horizonY - 12 - row * 11;
      const xStart = 20 + row * 9;
      const xEnd = width * 0.42 - row * 13;
      if (xEnd > xStart + 14) ctx.fillRect(xStart, y, xEnd - xStart, 2);
    }
    for (let terrace = 0; terrace < 7; terrace += 1) {
      const t = terrace / 6;
      const y = horizonY - 9 - t * 112;
      const xStart = width * 0.57 + t * 58;
      const xEnd = width - 18 - t * 8;
      if (xEnd > xStart + 16) ctx.fillRect(xStart, y, xEnd - xStart, 2);
    }

    ctx.globalAlpha = 0.46;
    this.drawBottomCropSilhouettes('left', width, bottomY, anim);
    this.drawBottomCropSilhouettes('right', width, bottomY, anim);

    const leftWorkers = this.harvestBackdropWorkerCount(leftState);
    const rightWorkers = this.harvestBackdropWorkerCount(rightState);

    ctx.globalAlpha = 0.56;
    for (let i = 0; i < leftWorkers; i += 1) {
      const lane = i % 3;
      const p = this.backdropWorkerFieldPoint('left', i, lane, width, bottomY, anim);
      this.drawBackdropHarvester('left', p.x, p.y, p.scale, p.animPhase);
    }

    for (let i = 0; i < rightWorkers; i += 1) {
      const lane = i % 4;
      const p = this.backdropWorkerFieldPoint('right', i, lane, width, bottomY, anim);
      this.drawBackdropHarvester('right', p.x, p.y, p.scale, p.animPhase);
    }
    ctx.restore();
  }

  spawnParticle(x, y, vx, vy, life, maxLife, size, color, gravity) {
    if (this.particles.length >= this.maxLiveParticles()) return;
    const particle = this.particlePool.pop() || {};
    particle.x = x;
    particle.y = y;
    particle.vx = vx;
    particle.vy = vy;
    particle.life = life;
    particle.maxLife = maxLife;
    particle.size = size;
    particle.color = color;
    particle.gravity = gravity;
    this.particles.push(particle);
  }

  recycleParticle(particle) {
    if (!particle) return;
    if (this.particlePool.length >= MAX_POOLED_PARTICLES) return;
    particle.color = null;
    this.particlePool.push(particle);
  }

  maxLiveParticles() {
    if (this.fxQuality === 'low') return 700;
    if (this.fxQuality === 'medium') return 1200;
    return MAX_PARTICLES;
  }

  particleBurstScale() {
    if (this.fxQuality === 'low') return 0.45;
    if (this.fxQuality === 'medium') return 0.72;
    return 1;
  }

  scaledParticleCount(baseCount, minCount = 1) {
    const scaled = Math.round(baseCount * this.particleBurstScale());
    return Math.max(minCount, scaled);
  }

  updateFxQuality(dt) {
    const alpha = 0.08;
    this.fxFrameDtAvg += (dt - this.fxFrameDtAvg) * alpha;
    if (this.fxQualityHold > 0) this.fxQualityHold = Math.max(0, this.fxQualityHold - dt);

    let target = this.fxQuality;
    if (this.fxQuality === 'high') {
      target = this.fxFrameDtAvg > 0.0215 ? 'medium' : 'high';
    } else if (this.fxQuality === 'medium') {
      if (this.fxFrameDtAvg > 0.0255) target = 'low';
      else if (this.fxFrameDtAvg < 0.0178) target = 'high';
      else target = 'medium';
    } else {
      target = this.fxFrameDtAvg < 0.021 ? 'medium' : 'low';
    }

    if (target === this.fxQuality) return;
    const currentRank = FX_QUALITY_RANK[this.fxQuality] ?? 2;
    const targetRank = FX_QUALITY_RANK[target] ?? currentRank;
    const qualityDrop = targetRank < currentRank;
    if (!qualityDrop && this.fxQualityHold > 0) return;
    this.fxQuality = target;
    this.fxQualityHold = qualityDrop ? 1.2 : 0.6;
  }

  createSpriteCanvas(width, height) {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(w, h);
    }
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      return canvas;
    }
    return null;
  }

  cachedSpriteEntry(key, width, height, renderFn) {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    const cached = this.spriteCache.get(key);
    if (cached && cached.w === w && cached.h === h) {
      // Refresh insertion order for simple LRU behavior.
      this.spriteCache.delete(key);
      this.spriteCache.set(key, cached);
      return cached;
    }

    const canvas = this.createSpriteCanvas(w, h);
    if (!canvas) return null;
    const cacheCtx = canvas.getContext('2d');
    if (!cacheCtx) return null;
    cacheCtx.clearRect(0, 0, w, h);

    const prevCtx = this.ctx;
    this.ctx = cacheCtx;
    try {
      renderFn(cacheCtx, w, h);
    } finally {
      this.ctx = prevCtx;
    }

    const entry = { canvas, w, h };
    this.spriteCache.delete(key);
    this.spriteCache.set(key, entry);
    while (this.spriteCache.size > this.spriteCacheMaxEntries) {
      const oldestKey = this.spriteCache.keys().next().value;
      this.spriteCache.delete(oldestKey);
    }
    return entry;
  }

  drawSpriteFromCache(minion, key, width, height, renderFn) {
    const entry = this.cachedSpriteEntry(key, width, height, renderFn);
    if (!entry) return false;
    this.ctx.drawImage(entry.canvas, minion.x - entry.w / 2, minion.y - entry.h / 2);
    return true;
  }

  pushDamageText(text) {
    if (this.damageTexts.length >= MAX_DAMAGE_TEXTS) this.damageTexts.shift();
    this.damageTexts.push(text);
  }

  pushHeroLine(line) {
    if (this.heroLines.length >= MAX_HERO_LINES) this.heroLines.shift();
    this.heroLines.push(line);
  }

  isMilitiaFoodMinion(minion) {
    if (!minion || !this.isThemedEmpires()) return false;
    if (minion.side !== 'left' && minion.side !== 'right') return false;
    if (minion.balloon) return false;
    if (minion.dragon || minion.digger || minion.gunner || minion.necrominion) return false;
    if (minion.explosive || minion.hero || minion.heroCooker || minion.monk || minion.shieldBearer) return false;
    if (minion.stoneGolem || minion.president || minion.rider) return false;
    return true;
  }

  updateMilitiaFoodFx(minions, dt) {
    if (!this.isThemedEmpires()) {
      this.prevMinionAtkCd.clear();
      this.militiaFoodFx.clear();
      return;
    }
    if (!Array.isArray(minions) || !minions.length) {
      this.prevMinionAtkCd.clear();
      this.militiaFoodFx.clear();
      return;
    }
    const seen = new Set();
    for (const minion of minions) {
      if (!minion) continue;
      const id = Number(minion.id);
      if (!Number.isFinite(id)) continue;
      seen.add(id);

      if (!this.isMilitiaFoodMinion(minion)) {
        this.prevMinionAtkCd.delete(id);
        this.militiaFoodFx.delete(id);
        continue;
      }

      const atkCd = Math.max(0, Number(minion.atkCd) || 0);
      const prevAtkCd = Math.max(0, Number(this.prevMinionAtkCd.get(id)) || 0);
      const triggered = atkCd >= MILITIA_FOOD_TRIGGER_MIN_CD && (atkCd - prevAtkCd) >= MILITIA_FOOD_TRIGGER_DELTA;

      if (triggered) {
        const existing = this.militiaFoodFx.get(id);
        this.militiaFoodFx.delete(id);
        this.militiaFoodFx.set(id, {
          t: 0,
          side: minion.side === 'right' ? 'right' : 'left',
          seed: existing?.seed ?? (((id * 0.173) % (Math.PI * 2)) + 0.1),
        });
      }

      const fx = this.militiaFoodFx.get(id);
      if (fx) {
        fx.t += dt;
        if (fx.t > MILITIA_FOOD_GAG_TTL) this.militiaFoodFx.delete(id);
      }
      this.prevMinionAtkCd.set(id, atkCd);
    }

    for (const id of this.prevMinionAtkCd.keys()) {
      if (!seen.has(id)) this.prevMinionAtkCd.delete(id);
    }
    for (const id of this.militiaFoodFx.keys()) {
      if (!seen.has(id)) this.militiaFoodFx.delete(id);
    }
    while (this.militiaFoodFx.size > MAX_MILITIA_FOOD_FX) {
      const oldest = this.militiaFoodFx.keys().next().value;
      this.militiaFoodFx.delete(oldest);
    }
  }

  drawMilitiaFoodAttackOverlays(minions) {
    if (!this.isThemedEmpires() || !Array.isArray(minions) || !minions.length) return;
    if (!this.militiaFoodFx.size) return;
    const { ctx } = this;
    const lowFx = this.fxQuality === 'low';
    for (const minion of minions) {
      if (!this.isMilitiaFoodMinion(minion)) continue;
      const id = Number(minion.id);
      if (!Number.isFinite(id)) continue;
      const fx = this.militiaFoodFx.get(id);
      if (!fx) continue;
      const p = Math.max(0, Math.min(1, (Number(fx.t) || 0) / MILITIA_FOOD_GAG_TTL));
      if (p <= 0) continue;

      const sideName = minion.side === 'right' ? 'right' : 'left';
      const dir = sideName === 'left' ? 1 : -1;
      const tier = Math.max(0, Math.min(3, Number(minion.tier) || 0));
      const stage = Math.max(0, Math.min(5, Math.floor((Number(minion.level) || 0) / 4)));
      const scale = minion.super ? 2 : 1;
      const bodyR = 12 + tier + Math.min(2, stage * 0.35);
      const x = Number(minion.x) || 0;
      const y = Number(minion.y) || 0;
      const handX = x + dir * (bodyR - 1) * scale;
      const handY = y + 2 * scale;
      const stashX = x - dir * (bodyR + 2.8) * scale;
      const stashY = y + 2.4 * scale;
      const frontX = x + dir * (bodyR + 18.2) * scale;
      const frontY = y - 1.2 * scale;
      const foodScale = scale * 1.32;
      const pulse = 0.65 + Math.sin((fx.seed || 0) + p * Math.PI * 2) * 0.35;

      ctx.save();
      if (sideName === 'left') {
        if (p < 0.45) {
          const g = p / 0.45;
          const knifeX = handX + (stashX - handX) * (0.66 * g);
          const knifeY = handY + (stashY - handY) * (0.66 * g) - Math.sin(g * Math.PI) * 2.3 * scale;
          const knifeLen = 7.6 * scale;
          const knifeA = dir * (-0.24 + Math.sin(g * Math.PI) * 0.2);
          ctx.save();
          ctx.translate(knifeX, knifeY);
          ctx.rotate(knifeA);
          ctx.strokeStyle = '#7b4f2a';
          ctx.lineWidth = 1.3 * scale;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-dir * (3.9 * scale), 0.2 * scale);
          ctx.lineTo(0, 0);
          ctx.stroke();
          ctx.fillStyle = '#c7ccd3';
          ctx.beginPath();
          ctx.moveTo(0, -0.9 * scale);
          ctx.lineTo(dir * (knifeLen - 1.4 * scale), -1.3 * scale);
          ctx.quadraticCurveTo(dir * knifeLen, -1.1 * scale, dir * knifeLen, -0.4 * scale);
          ctx.lineTo(dir * knifeLen, 0.7 * scale);
          ctx.quadraticCurveTo(dir * knifeLen, 1.2 * scale, dir * (knifeLen - 1.3 * scale), 1.3 * scale);
          ctx.lineTo(0, 0.9 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#8b9199';
          ctx.lineWidth = 0.7 * scale;
          ctx.stroke();
          ctx.fillStyle = '#f7df7f';
          ctx.beginPath();
          ctx.ellipse(dir * (knifeLen * 0.68), -0.18 * scale, 1.15 * scale, 0.58 * scale, 0.2 * dir, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          ctx.fillStyle = this.withAlpha('#ffefad', 0.3 + pulse * 0.3);
          ctx.beginPath();
          ctx.ellipse(stashX, stashY - 0.9 * scale, 2.2 * scale, 1 * scale, 0.1 * dir, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const g = (p - 0.45) / 0.55;
          const flingG = Math.min(1.12, g * 1.1);
          const sliceX = stashX + (frontX - stashX) * flingG;
          const sliceY = stashY + (frontY - stashY) * flingG - Math.sin(g * Math.PI) * 6.1 * scale;
          const spin = ((fx.seed || 0.3) * 0.35 + g * Math.PI * 2.7) * dir;
          const knifeLen = 7.4 * scale;
          const flickX = handX + (frontX - handX) * (0.58 * g);
          const flickY = handY + (frontY - handY) * (0.56 * g) - Math.sin(g * Math.PI) * 2.1 * scale;
          const flickA = dir * (0.06 + g * 0.78);
          ctx.save();
          ctx.translate(flickX, flickY);
          ctx.rotate(flickA);
          ctx.strokeStyle = this.withAlpha('#7b4f2a', 0.65);
          ctx.lineWidth = 1.25 * scale;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-dir * (3.6 * scale), 0.2 * scale);
          ctx.lineTo(0, 0);
          ctx.stroke();
          ctx.fillStyle = this.withAlpha('#c7ccd3', 0.86);
          ctx.beginPath();
          ctx.moveTo(0, -0.8 * scale);
          ctx.lineTo(dir * (knifeLen - 1.2 * scale), -1.2 * scale);
          ctx.lineTo(dir * knifeLen, 0.5 * scale);
          ctx.lineTo(0, 0.8 * scale);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          if (!lowFx) {
            ctx.strokeStyle = this.withAlpha('#f8dea5', 0.3 + (1 - g) * 0.3);
            ctx.lineWidth = 1.25;
            ctx.beginPath();
            ctx.moveTo(sliceX - dir * 6.2 * scale, sliceY + 0.8 * scale);
            ctx.quadraticCurveTo(sliceX - dir * 1.9 * scale, sliceY - 3.1 * scale, sliceX + dir * 2.5 * scale, sliceY - 1.4 * scale);
            ctx.stroke();
          }
          ctx.save();
          ctx.translate(sliceX, sliceY);
          ctx.rotate(spin);
          ctx.fillStyle = '#ce8f4f';
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.1 * foodScale, 2 * foodScale, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#9b6735';
          ctx.lineWidth = 1.05;
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.1 * foodScale, 2 * foodScale, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#f7de7d';
          ctx.beginPath();
          ctx.ellipse(dir * 1.1 * foodScale, -0.33 * foodScale, 1.3 * foodScale, 0.7 * foodScale, 0.18 * dir, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          if (g > 0.82) {
            const splatX = frontX + dir * 2.2 * scale;
            const splatY = frontY + 0.8 * scale;
            ctx.fillStyle = this.withAlpha('#f6df84', 0.45 + pulse * 0.3);
            ctx.beginPath();
            ctx.ellipse(splatX, splatY, 2.7 * scale, 1.2 * scale, 0.15 * dir, 0, Math.PI * 2);
            ctx.ellipse(splatX - dir * 1.9 * scale, splatY + 0.2 * scale, 1.1 * scale, 0.56 * scale, -0.2, 0, Math.PI * 2);
            ctx.ellipse(splatX + dir * 1.7 * scale, splatY - 0.15 * scale, 1.02 * scale, 0.52 * scale, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        if (p < 0.45) {
          const g = p / 0.45;
          const riceX = stashX + (handX - stashX) * g;
          const riceY = stashY + (handY - stashY) * g - Math.sin(g * Math.PI) * 2.2 * scale;
          const stickLen = 8.7 * scale;
          const stickX = stashX + (handX - stashX) * (0.62 * g);
          const stickY = stashY + (handY - stashY) * (0.62 * g) - Math.sin(g * Math.PI) * 2 * scale;
          const stickA = dir * (0.08 + Math.sin(g * Math.PI) * 0.2);
          ctx.save();
          ctx.translate(stickX, stickY);
          ctx.rotate(stickA);
          ctx.strokeStyle = '#f1e2c4';
          ctx.lineWidth = 1.05 * scale;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-dir * (2.8 * scale), -0.42 * scale);
          ctx.lineTo(dir * stickLen, -1.35 * scale);
          ctx.moveTo(-dir * (2.8 * scale), 0.42 * scale);
          ctx.lineTo(dir * stickLen, -0.05 * scale);
          ctx.stroke();
          ctx.restore();
          if (!lowFx) {
            ctx.strokeStyle = this.withAlpha('#e9f7ff', 0.3 + (1 - g) * 0.34);
            ctx.lineWidth = 1.02;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(stashX + dir * 0.9 * scale, stashY - 0.5 * scale);
            ctx.lineTo(riceX - dir * 0.8 * scale, riceY - 0.3 * scale);
            ctx.stroke();
          }
          ctx.fillStyle = '#f8fdff';
          ctx.beginPath();
          ctx.ellipse(riceX, riceY, 1.28 * foodScale, 1.22 * foodScale, 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#dce8ee';
          ctx.lineWidth = 0.75;
          ctx.stroke();
          if (!lowFx) {
            ctx.fillStyle = this.withAlpha('#ffffff', 0.46);
            ctx.beginPath();
            ctx.ellipse(
              riceX - dir * 0.35 * foodScale,
              riceY - 0.32 * foodScale,
              0.44 * foodScale,
              0.32 * foodScale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.fillStyle = this.withAlpha('#d7e5ec', 0.35);
            ctx.beginPath();
            ctx.ellipse(
              riceX + dir * 0.25 * foodScale,
              riceY + 0.36 * foodScale,
              0.58 * foodScale,
              0.4 * foodScale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
          if (!lowFx) {
            ctx.beginPath();
            ctx.ellipse(riceX - dir * 1.4 * scale, riceY + 0.68 * scale, 0.56 * scale, 0.42 * scale, 0.18, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          const g = (p - 0.45) / 0.55;
          const flingG = Math.min(1.1, g * 1.08);
          const coreX = handX + (frontX - handX) * flingG;
          const coreY = handY + (frontY - handY) * flingG - Math.sin(g * Math.PI) * 5.8 * scale;
          const stickLen = 8.6 * scale;
          const flickX = handX + (frontX - handX) * (0.58 * g);
          const flickY = handY + (frontY - handY) * (0.56 * g) - Math.sin(g * Math.PI) * 2.2 * scale;
          const flickA = dir * (0.24 + g * 0.74);
          ctx.save();
          ctx.translate(flickX, flickY);
          ctx.rotate(flickA);
          ctx.strokeStyle = this.withAlpha('#f1e2c4', 0.82);
          ctx.lineWidth = 1.08 * scale;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(-dir * (2.7 * scale), -0.4 * scale);
          ctx.lineTo(dir * stickLen, -1.2 * scale);
          ctx.moveTo(-dir * (2.7 * scale), 0.4 * scale);
          ctx.lineTo(dir * stickLen, 0.1 * scale);
          ctx.stroke();
          ctx.restore();
          if (!lowFx) {
            ctx.strokeStyle = this.withAlpha('#dff3ff', 0.3 + (1 - g) * 0.28);
            ctx.lineWidth = 1.12;
            ctx.beginPath();
            ctx.moveTo(handX - dir * 0.6 * scale, handY - 0.4 * scale);
            ctx.quadraticCurveTo(coreX - dir * 3.1 * scale, coreY - 3.3 * scale, coreX, coreY);
            ctx.stroke();
          }
          ctx.fillStyle = '#f7fcff';
          ctx.beginPath();
          ctx.ellipse(coreX, coreY, 1.22 * foodScale, 1.16 * foodScale, 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d9e6ee';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          if (!lowFx) {
            ctx.fillStyle = this.withAlpha('#ffffff', 0.5);
            ctx.beginPath();
            ctx.ellipse(
              coreX - dir * 0.36 * foodScale,
              coreY - 0.32 * foodScale,
              0.46 * foodScale,
              0.34 * foodScale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            // Tiny crumb pieces so it still reads as tossed rice, not a snowball.
            ctx.fillStyle = this.withAlpha('#edf6fb', 0.95);
            ctx.beginPath();
            ctx.ellipse(coreX - dir * 1.25 * scale, coreY + 0.55 * scale, 0.52 * scale, 0.34 * scale, 0.2, 0, Math.PI * 2);
            ctx.ellipse(coreX + dir * 1.05 * scale, coreY + 0.4 * scale, 0.44 * scale, 0.3 * scale, -0.18, 0, Math.PI * 2);
            ctx.fill();
          }
          if (g > 0.82) {
            const splatX = frontX + dir * 1.8 * scale;
            const splatY = frontY + 0.75 * scale;
            const count = lowFx ? 3 : 6;
            for (let i = 0; i < count; i += 1) {
              const spread = i - (count - 1) * 0.5;
              ctx.beginPath();
              ctx.ellipse(
                splatX - dir * spread * 1.05 * scale,
                splatY + Math.abs(spread) * 0.2 * scale,
                0.94 * scale,
                0.64 * scale,
                0.2,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }
        }
      }
      ctx.restore();
    }
  }

  strokeDebugCircle(x, y, r, color) {
    const radius = Number(r);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) return;
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  strokeDebugRect(x, y, w, h, color) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) return;
    if (w <= 0 || h <= 0) return;
    this.ctx.strokeStyle = color;
    this.ctx.strokeRect(x, y, w, h);
  }

  drawColliderDebugOverlay(snapshot, world) {
    if (!snapshot?.debug?.colliderOverlay || !world) return;
    const { ctx } = this;
    const towers = [
      { x: Number(world.towerLeftX), side: 'left' },
      { x: Number(world.towerRightX), side: 'right' },
    ];
    const towerY = Number(world.towerY) - 28;

    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 4]);

    for (const tower of towers) {
      this.strokeDebugCircle(
        tower.x,
        towerY,
        62,
        tower.side === 'left' ? '#65c9ff' : '#ffb48e'
      );
    }

    const minions = Array.isArray(snapshot.minions) ? snapshot.minions : [];
    for (const minion of minions) {
      const side = minion?.side === 'right' ? 'right' : 'left';
      if (minion?.balloon) {
        const circles = this.balloonCollisionCircles(minion);
        if (Array.isArray(circles) && circles.length) {
          for (const circle of circles) {
            this.strokeDebugCircle(
              Number(circle?.x),
              Number(circle?.y),
              Number(circle?.r),
              side === 'left' ? '#56d0ff' : '#ffa477'
            );
          }
          continue;
        }
      }
      this.strokeDebugCircle(
        Number(minion?.x),
        Number(minion?.y),
        Number(minion?.r),
        side === 'left' ? '#56d0ff' : '#ffa477'
      );
    }

    const arrows = Array.isArray(snapshot.arrows) ? snapshot.arrows : [];
    for (const arrow of arrows) this.strokeDebugCircle(Number(arrow?.x), Number(arrow?.y), Number(arrow?.r), '#ffe083');

    const resources = Array.isArray(snapshot.resources) ? snapshot.resources : [];
    for (const res of resources) this.strokeDebugCircle(Number(res?.x), Number(res?.y), Number(res?.r), '#8fff9f');

    const shotPowers = Array.isArray(snapshot.shotPowers) ? snapshot.shotPowers : [];
    for (const power of shotPowers) this.strokeDebugCircle(Number(power?.x), Number(power?.y), Number(power?.r), '#d7adff');

    const cannonBalls = Array.isArray(snapshot.cannonBalls) ? snapshot.cannonBalls : [];
    for (const ball of cannonBalls) this.strokeDebugCircle(Number(ball?.x), Number(ball?.y), Number(ball?.r), '#ffd08a');

    const candles = Array.isArray(snapshot.candles) ? snapshot.candles : [];
    for (const candle of candles) {
      const cartHalfW = Math.max(8, Number(candle?.cartHalfW) || 0);
      const x = Number(candle?.x) - cartHalfW;
      const y = Number(candle?.y) - 18;
      this.strokeDebugRect(x, y, cartHalfW * 2, 36, '#f8f5aa');
    }

    const cards = Array.isArray(snapshot.upgradeCards) ? snapshot.upgradeCards : [];
    for (const card of cards) {
      const x = Number(card?.x) - Number(card?.w) * 0.5;
      const y = Number(card?.y) - Number(card?.h) * 0.5;
      this.strokeDebugRect(x, y, Number(card?.w), Number(card?.h), '#9de9ff');
    }

    const candleScorches = Array.isArray(snapshot.candleScorches) ? snapshot.candleScorches : [];
    for (const scorch of candleScorches) {
      this.strokeDebugCircle(Number(scorch?.x), Number(scorch?.y), Number(scorch?.r), '#ffd05f');
    }

    ctx.setLineDash([]);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Collider Debug', 12, 20);
    ctx.restore();
  }

  treasureChestAnchorX(side, towerX) {
    return towerX + (side === 'left' ? -92 : 92);
  }

  treasureChestY(towerY) {
    return towerY + 117;
  }

  spawnUnitHitImpact(x, y, side) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const direction = side === 'right' ? -1 : 1;
    const qualityCap = this.fxQuality === 'low'
      ? 34
      : (this.fxQuality === 'medium' ? 76 : MAX_UNIT_HIT_IMPACTS);
    this.unitHitImpacts.push({
      x,
      y,
      side: side === 'right' ? 'right' : 'left',
      age: 0,
      duration: 0.22 + Math.random() * 0.09,
      size: 8.5 + Math.random() * 4.2,
      angle: (direction > 0 ? 0 : Math.PI) + (Math.random() * 0.34 - 0.17),
      seed: Math.random() * Math.PI * 2,
    });
    if (this.unitHitImpacts.length > qualityCap) {
      this.unitHitImpacts.splice(0, this.unitHitImpacts.length - qualityCap);
    }
  }

  updateUnitHitImpacts(dt) {
    let write = 0;
    for (let i = 0; i < this.unitHitImpacts.length; i += 1) {
      const impact = this.unitHitImpacts[i];
      impact.age += dt;
      if (impact.age >= impact.duration) continue;
      this.unitHitImpacts[write] = impact;
      write += 1;
    }
    this.unitHitImpacts.length = write;
  }

  drawUnitHitImpacts() {
    const { ctx } = this;
    for (const impact of this.unitHitImpacts) {
      const t = Math.max(0, Math.min(1, impact.age / Math.max(0.0001, impact.duration)));
      const ease = easeOutCubic(t);
      const fade = 1 - Math.pow(t, 1.28);
      if (fade <= 0) continue;

      const pulse = 0.92 + Math.sin((t * Math.PI * 2.2) + impact.seed) * 0.1;
      const outerR = impact.size * (0.9 + ease * 1.7) * pulse;
      const coreR = impact.size * (0.28 + ease * 0.75);
      const ringR = impact.size * (0.72 + ease * 1.08);
      const x = impact.x;
      const y = impact.y;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const halo = ctx.createRadialGradient(x, y, 0, x, y, outerR);
      halo.addColorStop(0, this.withAlpha('#ffd5cf', fade * 0.92));
      halo.addColorStop(0.42, this.withAlpha('#ff6f5f', fade * 0.86));
      halo.addColorStop(1, this.withAlpha('#c52e2e', 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, outerR, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = fade * 0.78;
      ctx.strokeStyle = '#ff5a4f';
      ctx.lineWidth = 1.4 + ease * 1.6;
      ctx.beginPath();
      ctx.arc(x, y, ringR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = fade * 0.9;
      ctx.fillStyle = '#ffb7aa';
      ctx.beginPath();
      ctx.arc(x, y, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(impact.angle);
      const arrowScale = 0.76 + ease * 0.54;
      ctx.scale(arrowScale, arrowScale);
      ctx.globalAlpha = fade * 0.94;
      ctx.fillStyle = '#ff5346';
      ctx.beginPath();
      ctx.moveTo(-impact.size * 0.66, -impact.size * 0.18);
      ctx.lineTo(impact.size * 0.6, 0);
      ctx.lineTo(-impact.size * 0.66, impact.size * 0.18);
      ctx.lineTo(-impact.size * 0.24, 0);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = fade * 0.82;
      ctx.fillStyle = '#ffdcd2';
      ctx.beginPath();
      ctx.moveTo(-impact.size * 0.22, -impact.size * 0.09);
      ctx.lineTo(impact.size * 0.34, 0);
      ctx.lineTo(-impact.size * 0.22, impact.size * 0.09);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  drawArcherHeldInstrument(side, slot, archerX, archerY) {
    const sideKey = side === 'right' ? 'right' : 'left';
    const entries = Array.isArray(this.archerInstruments?.[sideKey]) ? this.archerInstruments[sideKey] : [];
    const info = entries[Math.max(0, Number(slot) || 0)];
    const iconSrc = typeof info?.iconSrc === 'string' ? info.iconSrc : '';
    if (!iconSrc) return;

    const image = this.getUpgradeGlyphImage(iconSrc);
    if (!(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0)) return;

    const { ctx } = this;
    const dir = sideKey === 'left' ? 1 : -1;
    const oppositeDir = -dir;
    const now = performance.now();
    const beat = now * 0.004 + (Number(slot) || 0) * 0.85 + (sideKey === 'right' ? 0.35 : 0);
    const sway = Math.sin(beat) * 0.24;
    const bob = Math.cos(beat * 1.1) * 0.14;
    const holdX = archerX + oppositeDir * 6.8 + sway;
    const holdY = archerY - 3.6 + bob;
    const iconSize = 13;

    ctx.save();
    ctx.drawImage(image, holdX - iconSize / 2, holdY - iconSize / 2, iconSize, iconSize);

    // Subtle "playing" motion arcs by the held instrument.
    const waveX = holdX + dir * (iconSize * 0.72 + 2);
    const waveA = 0.42 + Math.sin(beat * 1.5) * 0.06;
    ctx.strokeStyle = this.withAlpha('#ffe9b8', Math.max(0.2, waveA));
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i += 1) {
      const r = iconSize * (0.22 + i * 0.17);
      ctx.beginPath();
      if (dir > 0) ctx.arc(waveX, holdY - 0.6, r, -0.56, 0.56);
      else ctx.arc(waveX, holdY - 0.6, r, Math.PI - 0.56, Math.PI + 0.56);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawArcherInstrumentOverlay(world, leftPulls = [], rightPulls = []) {
    if (!world) return;
    const leftX = Number(world.towerLeftX) + 35;
    const rightX = Number(world.towerRightX) - 35;
    if (!Number.isFinite(leftX) || !Number.isFinite(rightX)) return;

    for (let i = 0; i < leftPulls.length; i += 1) {
      const pull = leftPulls[i] || {};
      const y = Number.isFinite(pull.archerAimY) ? Number(pull.archerAimY) : (Number(world.towerY) - 56 - i * 78);
      this.drawArcherHeldInstrument('left', i, leftX, y);
    }
    for (let i = 0; i < rightPulls.length; i += 1) {
      const pull = rightPulls[i] || {};
      const y = Number.isFinite(pull.archerAimY) ? Number(pull.archerAimY) : (Number(world.towerY) - 56 - i * 78);
      this.drawArcherHeldInstrument('right', i, rightX, y);
    }
  }

  spawnResourceTelegraph(x, y, side, ttl = 1) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.resourceSpawnTelegraphs.push({
      x,
      y,
      side: side === 'right' ? 'right' : (side === 'left' ? 'left' : null),
      age: 0,
      ttl: Math.max(0.1, Math.min(1.5, Number(ttl) || 1)),
      seed: Math.random() * Math.PI * 2,
    });
  }

  updateResourceTelegraphs(dt) {
    let write = 0;
    for (let i = 0; i < this.resourceSpawnTelegraphs.length; i += 1) {
      const telegraph = this.resourceSpawnTelegraphs[i];
      telegraph.age += dt;
      if (telegraph.age >= telegraph.ttl + RESOURCE_TELEGRAPH_END_HOLD) continue;
      this.resourceSpawnTelegraphs[write] = telegraph;
      write += 1;
    }
    this.resourceSpawnTelegraphs.length = write;
  }

  resourceAppearKey(res) {
    if (!res || typeof res !== 'object') return null;
    if (typeof res.id === 'string' || typeof res.id === 'number') return `id:${res.id}`;
    const x = Number(res.x);
    const y = Number(res.y);
    const r = Number(res.r);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return `xy:${Math.round(x * 10)}:${Math.round(y * 10)}:${Math.round((Number.isFinite(r) ? r : 0) * 10)}`;
  }

  updateResourceAppearState(resources, dt) {
    const active = new Set();
    const list = Array.isArray(resources) ? resources : [];
    for (let i = 0; i < list.length; i += 1) {
      const res = list[i];
      const key = this.resourceAppearKey(res);
      if (!key) continue;
      active.add(key);
      const state = this.resourceAppearState.get(key);
      if (!state) {
        this.resourceAppearState.set(key, { age: 0, stale: 0 });
        continue;
      }
      state.age = Math.min(RESOURCE_APPEAR_DURATION, state.age + dt);
      state.stale = 0;
    }

    for (const [key, state] of this.resourceAppearState) {
      if (active.has(key)) continue;
      state.stale += dt;
      if (state.stale >= RESOURCE_APPEAR_STALE_TTL) this.resourceAppearState.delete(key);
    }
  }

  resourceAppearProgress(res) {
    const key = this.resourceAppearKey(res);
    if (!key) return 1;
    const state = this.resourceAppearState.get(key);
    if (!state) return 1;
    const raw = state.age / Math.max(0.0001, RESOURCE_APPEAR_DURATION);
    return clamp01(raw);
  }

  drawResourceTelegraphs() {
    const { ctx } = this;
    for (const telegraph of this.resourceSpawnTelegraphs) {
      const t = Math.max(0, Math.min(1, telegraph.age / Math.max(0.0001, telegraph.ttl)));
      const ease = 1 - Math.pow(1 - t, 3);
      const pulse = 0.8 + Math.sin((ease * Math.PI * 2) + telegraph.seed) * 0.12;
      const radius = (4 + ease * 16) * pulse;
      const alpha = lerp(0.72, 1, ease);
      const x = telegraph.x;
      const y = telegraph.y;

      const halo = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.4);
      halo.addColorStop(0, this.withAlpha('#fff3b8', alpha * 0.9));
      halo.addColorStop(0.52, this.withAlpha('#f5c357', alpha * 0.72));
      halo.addColorStop(1, this.withAlpha('#d28c1a', 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, radius * 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.withAlpha('#ffd873', alpha * 0.95);
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.62, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.withAlpha('#fff9dd', alpha * 0.9);
      ctx.beginPath();
      ctx.arc(x - radius * 0.15, y - radius * 0.16, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  spawnGoldResourceTrail(fromX, fromY, side, world, count = 2) {
    const towerX = side === 'right' ? Number(world?.towerRightX) || 0 : Number(world?.towerLeftX) || 0;
    const towerY = Number(world?.towerY) || 0;
    const targetX = this.treasureChestAnchorX(side, towerX);
    const targetY = this.treasureChestY(towerY) + 8;
    for (let i = 0; i < count; i += 1) {
      this.goldResourceTrails.push({
        side,
        fromX,
        fromY,
        toX: targetX + (Math.random() * 10 - 5),
        toY: targetY + (Math.random() * 8 - 4),
        age: -i * 0.04,
        duration: 0.48 + Math.random() * 0.1,
        arc: 30 + Math.random() * 18,
        size: 3.2 + Math.random() * 1.3,
      });
    }
  }

  updateGoldResourceTrails(snapshot, world, dt) {
    if (!snapshot || !world) return;
    let write = 0;
    for (let i = 0; i < this.goldResourceTrails.length; i += 1) {
      const trail = this.goldResourceTrails[i];
      trail.age += dt;
      if (trail.age >= trail.duration) continue;
      this.goldResourceTrails[write] = trail;
      write += 1;
    }
    this.goldResourceTrails.length = write;
  }

  drawGoldResourceTrails() {
    const { ctx } = this;
    for (const trail of this.goldResourceTrails) {
      if (trail.age < 0) continue;
      const t = Math.max(0, Math.min(1, trail.age / Math.max(0.0001, trail.duration)));
      const ease = 1 - Math.pow(1 - t, 3);
      const x = trail.fromX + (trail.toX - trail.fromX) * ease;
      const y = trail.fromY + (trail.toY - trail.fromY) * ease - Math.sin(ease * Math.PI) * trail.arc;
      const alpha = 1 - Math.max(0, ease - 0.6) / 0.4;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, trail.size * 2.8);
      grad.addColorStop(0, this.withAlpha('#fff3b0', alpha));
      grad.addColorStop(0.55, this.withAlpha('#f3bf43', alpha * 0.95));
      grad.addColorStop(1, this.withAlpha('#d1891d', 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, trail.size * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.withAlpha('#ffd86d', alpha);
      ctx.beginPath();
      ctx.arc(x, y, trail.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.withAlpha('#fff8db', alpha * 0.9);
      ctx.beginPath();
      ctx.arc(x - trail.size * 0.22, y - trail.size * 0.24, trail.size * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  spawnPowerupTrail(fromX, fromY, toX, toY, side, count = 2) {
    for (let i = 0; i < count; i += 1) {
      this.powerupTrails.push({
        side,
        fromX,
        fromY,
        toX: toX + (Math.random() * 16 - 8),
        toY: toY + (Math.random() * 12 - 6),
        age: -i * 0.04,
        duration: 0.42 + Math.random() * 0.1,
        arc: 20 + Math.random() * 16,
        size: 2.6 + Math.random() * 1.3,
      });
    }
  }

  updatePowerupTrails(snapshot, world, dt) {
    let write = 0;
    for (let i = 0; i < this.powerupTrails.length; i += 1) {
      const trail = this.powerupTrails[i];
      trail.age += dt;
      if (trail.age >= trail.duration) continue;
      this.powerupTrails[write] = trail;
      write += 1;
    }
    this.powerupTrails.length = write;
  }

  drawPowerupTrails() {
    const { ctx } = this;
    for (const trail of this.powerupTrails) {
      if (trail.age < 0) continue;
      const t = Math.max(0, Math.min(1, trail.age / Math.max(0.0001, trail.duration)));
      const ease = 1 - Math.pow(1 - t, 3);
      const x = trail.fromX + (trail.toX - trail.fromX) * ease;
      const y = trail.fromY + (trail.toY - trail.fromY) * ease - Math.sin(ease * Math.PI) * trail.arc;
      const alpha = 1 - Math.max(0, ease - 0.6) / 0.4;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, trail.size * 2.8);
      grad.addColorStop(0, this.withAlpha('#c7dbff', alpha));
      grad.addColorStop(0.55, this.withAlpha('#86d7ff', alpha * 0.95));
      grad.addColorStop(1, this.withAlpha('#6cb5ff', 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, trail.size * 2.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.withAlpha('#8dd8ff', alpha);
      ctx.beginPath();
      ctx.arc(x, y, trail.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.withAlpha('#c2f5ff', alpha * 0.9);
      ctx.beginPath();
      ctx.arc(x - trail.size * 0.22, y - trail.size * 0.24, trail.size * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  draw(snapshot, world) {
    if (!snapshot || !world) return;

    const { ctx, canvas } = this;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameAt) / 1000);
    this.lastFrameAt = now;
    this.updateFxQuality(dt);
    this.updateTowerShake(dt);
    this.updateGameOverCinematic(snapshot, world, now, dt);
    this.updateMilitiaFoodFx(snapshot.minions, dt);
    this.updateResourceTelegraphs(dt);
    this.updateGoldResourceTrails(snapshot, world, dt);
    this.updatePowerupTrails(snapshot, world, dt);
    this.updateUnitHitImpacts(dt);

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = this.backgroundGradient(h);
    ctx.fillRect(0, 0, w, h);
    if (this.isThemedEmpires()) this.drawThemedHarvestBackdrop(snapshot, world, now, w, h);
    ctx.fillStyle = '#20354f';
    ctx.fillRect(w / 2 - 3, 0, 6, h);
    if (!this.isThemedEmpires()) {
      ctx.fillStyle = '#2d3b53';
      ctx.fillRect(0, world.groundY, w, 4);
    }

    const barracksCounts = this.buildBarracksActiveCounts(snapshot);
    const barracksUi = {
      left: this.drawBarracks('left', snapshot.left, world, snapshot, barracksCounts.left),
      right: this.drawBarracks('right', snapshot.right, world, snapshot, barracksCounts.right),
    };
    this.updateBarracksDoorActors(snapshot, barracksUi, dt);

    const leftPulls = this.sideArcherPulls('left', snapshot.left);
    const rightPulls = this.sideArcherPulls('right', snapshot.right);
    const leftPlayers = Array.isArray(snapshot?.players?.left) ? snapshot.players.left : [];
    const rightPlayers = Array.isArray(snapshot?.players?.right) ? snapshot.players.right : [];
    const leftCpuSlots = Array.isArray(snapshot?.cpuSlots?.left) ? snapshot.cpuSlots.left : [];
    const rightCpuSlots = Array.isArray(snapshot?.cpuSlots?.right) ? snapshot.cpuSlots.right : [];
    const leftShake = this.towerShakeOffset('left');
    const rightShake = this.towerShakeOffset('right');
    this.drawCastle(
      'left',
      world.towerLeftX + leftShake.x,
      world.towerY + leftShake.y,
      snapshot.left.towerHp,
      snapshot.left,
      leftPulls,
      leftPlayers,
      leftCpuSlots
    );
    this.drawCastle(
      'right',
      world.towerRightX + rightShake.x,
      world.towerY + rightShake.y,
      snapshot.right.towerHp,
      snapshot.right,
      rightPulls,
      rightPlayers,
      rightCpuSlots
    );
    this.drawBarracksBuilding('left', world, barracksUi.left);
    this.drawBarracksBuilding('right', world, barracksUi.right);
    for (let i = 0; i < leftPulls.length; i += 1) {
      const timing = this.archerShotTiming(snapshot.left, i, leftPulls.length, snapshot.mode);
      this.drawShotRing(world.towerLeftX, world.towerY - 185 - i * 60, timing.cd, TEAM_COLORS.left.ring, timing.interval);
    }
    for (let i = 0; i < rightPulls.length; i += 1) {
      const timing = this.archerShotTiming(snapshot.right, i, rightPulls.length, snapshot.mode);
      this.drawShotRing(world.towerRightX, world.towerY - 185 - i * 60, timing.cd, TEAM_COLORS.right.ring, timing.interval);
    }
    const allMinions = Array.isArray(snapshot.minions) ? snapshot.minions : [];
    const balloonMinions = this.balloonMinionBuffer;
    const nonBalloonMinions = this.groundMinionBuffer;
    balloonMinions.length = 0;
    nonBalloonMinions.length = 0;
    for (let i = 0; i < allMinions.length; i += 1) {
      const minion = allMinions[i];
      if (!minion) continue;
      if (minion.balloon) balloonMinions.push(minion);
      else nonBalloonMinions.push(minion);
    }
    // Balloons are intentionally painted first so the upgrade panel/cards remain readable above them.
    for (const minion of balloonMinions) this.drawMinionSprite(minion);
    this.drawUpgradeChargeBar('left', 20, 30, 200, 16, snapshot.left.upgradeCharge, snapshot.left.upgradeChargeMax);
    this.drawUpgradeChargeBar('right', w - 220, 30, 200, 16, snapshot.right.upgradeCharge, snapshot.right.upgradeChargeMax);

    this.drawUpgradePlaceholders(snapshot);

    const resources = Array.isArray(snapshot.resources) ? snapshot.resources : [];
    this.updateResourceAppearState(resources, dt);
    this.drawResourceTelegraphs();
    for (const res of resources) this.drawResourceNode(res);
    this.drawGoldResourceTrails();
    this.drawPowerupTrails();
    for (const power of snapshot.shotPowers) this.drawShotPower(power);
    if (Array.isArray(snapshot.cannonBalls)) {
      for (const ball of snapshot.cannonBalls) this.drawCannonBall(ball);
    }
    const committeeVoteLeftActive = Boolean(snapshot?.committeeVotes?.left?.active && Array.isArray(snapshot?.committeeVotes?.left?.options) && snapshot.committeeVotes.left.options.length);
    const committeeVoteRightActive = Boolean(snapshot?.committeeVotes?.right?.active && Array.isArray(snapshot?.committeeVotes?.right?.options) && snapshot.committeeVotes.right.options.length);
    for (const card of snapshot.upgradeCards) {
      const sideName = card?.side === 'right' ? 'right' : 'left';
      if ((sideName === 'left' && committeeVoteLeftActive) || (sideName === 'right' && committeeVoteRightActive)) continue;
      const sideState = sideName === 'right' ? snapshot?.right : snapshot?.left;
      this.drawUpgradeCard(card, sideState);
    }
    this.drawCommitteeVoteCards(snapshot);
    this.drawUpgradeSelectionFx(snapshot);
    if (Array.isArray(snapshot.candleScorches)) {
      for (let i = 0; i < snapshot.candleScorches.length; i += 1) {
        if (this.fxQuality === 'low' && i % 2 === 1) continue;
        this.drawCandleScorch(snapshot.candleScorches[i]);
      }
    } else if (snapshot.candleScorch) {
      this.drawCandleScorch(snapshot.candleScorch);
    }
    for (const minion of nonBalloonMinions) this.drawMinionSprite(minion);
    this.updateHeroFoodVisuals(dt);
    this.drawHeroFoodVisuals();
    this.updateHeroCookerSwallows(dt);
    this.drawHeroCookerSwallows();
    this.drawMilitiaFoodAttackOverlays(snapshot.minions);
    this.drawExecutiveOrderEffects(snapshot.minions);
    if (this.fxQuality !== 'low') this.drawMinionHitFlashes(snapshot.minions);
    this.updateHealCircles(dt);
    this.drawHealCircles();
    this.updateReviveSpirits(dt);
    this.drawReviveSpirits();
    this.updateDeathGhosts(dt);
    this.drawDeathGhosts();
    if (Array.isArray(snapshot.candles)) {
      for (const candle of snapshot.candles) this.drawCandle(candle);
    } else if (snapshot.candle) {
      this.drawCandle(snapshot.candle);
    }
    this.updateParticles(dt);
    this.drawParticles();
    this.frameArrowCount = Array.isArray(snapshot.arrows) ? snapshot.arrows.length : 0;
    const topSlotAsCannon = snapshot?.mode === '2v2' || Math.max(1, Number(snapshot?.archersPerSide) || 1) > 1;
    for (const arrow of snapshot.arrows) this.drawArrow(arrow, topSlotAsCannon);
    this.drawUnitHitImpacts();
    this.updateDamageTexts(dt);
    this.drawDamageTexts();
    this.updateHeroLines(dt);
    this.drawHeroLines();

    for (let i = 0; i < leftPulls.length; i += 1) {
      const pull = leftPulls[i];
      const leftAim = worldAimAngle('left', pull.pullX, pull.pullY);
      const leftStrength = launchStrengthFromPull('left', pull.pullX, pull.pullY);
      const slotPower = Array.isArray(snapshot.left?.pendingShotPowerBySlot)
        ? snapshot.left.pendingShotPowerBySlot[i]
        : null;
      const activePower = (slotPower && Number(slotPower?.shots) > 0)
        ? slotPower.power
        : (Array.isArray(snapshot.left?.pendingShotPowerBySlot) ? null : snapshot.left?.pendingShotPower);
      const activeShots = (slotPower && Number(slotPower?.shots) > 0)
        ? slotPower.shots
        : (Array.isArray(snapshot.left?.pendingShotPowerBySlot) ? 0 : snapshot.left?.pendingShotPowerShots);
      this.drawAimGuide('left', world.towerLeftX + 35, pull.archerAimY, leftAim, leftStrength, {
        shotPowerType: activePower,
        shotPowerShots: activeShots,
        comboHitStreak: snapshot.left?.comboHitStreak,
      });
    }
    for (let i = 0; i < rightPulls.length; i += 1) {
      const pull = rightPulls[i];
      const rightAim = worldAimAngle('right', pull.pullX, pull.pullY);
      const rightStrength = launchStrengthFromPull('right', pull.pullX, pull.pullY);
      const slotPower = Array.isArray(snapshot.right?.pendingShotPowerBySlot)
        ? snapshot.right.pendingShotPowerBySlot[i]
        : null;
      const activePower = (slotPower && Number(slotPower?.shots) > 0)
        ? slotPower.power
        : (Array.isArray(snapshot.right?.pendingShotPowerBySlot) ? null : snapshot.right?.pendingShotPower);
      const activeShots = (slotPower && Number(slotPower?.shots) > 0)
        ? slotPower.shots
        : (Array.isArray(snapshot.right?.pendingShotPowerBySlot) ? 0 : snapshot.right?.pendingShotPowerShots);
      this.drawAimGuide('right', world.towerRightX - 35, pull.archerAimY, rightAim, rightStrength, {
        shotPowerType: activePower,
        shotPowerShots: activeShots,
        comboHitStreak: snapshot.right?.comboHitStreak,
      });
    }
    this.drawArcherInstrumentOverlay(world, leftPulls, rightPulls);
    this.drawColliderDebugOverlay(snapshot, world);

    const gameOverCinematicActive = this.isGameOverCinematicActive(now);
    if (gameOverCinematicActive) this.drawTowerCollapseCinematic(world, now);

  }

  emitHitParticles(typeOrEvent, x, y, side) {
    const event = (typeOrEvent && typeof typeOrEvent === 'object') ? typeOrEvent : null;
    const type = event ? event.type : typeOrEvent;
    const px = event ? event.x : x;
    const py = event ? event.y : y;
    const pside = event ? event.side : side;
    const eventWorld = event?.world || null;
    if (type === 'ghostfall') {
      this.emitDeathGhost(event);
      return;
    }
    if (type === 'revive') {
      this.emitReviveSpirit(event);
      const burstCount = this.scaledParticleCount(26, 4);
      for (let i = 0; i < burstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 110 + Math.random() * 160;
        this.spawnParticle(
          px + (Math.random() * 6 - 3),
          py + (Math.random() * 4 - 2),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 36,
          0.36 + Math.random() * 0.18,
          0.56,
          1.8 + Math.random() * 2.2,
          pickRandom(['#b6ffea', '#7ef2d8', '#f0fff8']),
          300
        );
      }
      return;
    }
    if (type === 'resource_telegraph') {
      this.spawnResourceTelegraph(px, py, pside, Number(event?.ttl) || 1);
      return;
    }
    if (type === 'herocookerswallow') {
      this.spawnHeroCookerSwallow(event, px, py, pside);
      const puffCount = this.scaledParticleCount(7, 1);
      const toX = Number.isFinite(event?.toX) ? Number(event.toX) : px;
      const toY = Number.isFinite(event?.toY) ? Number(event.toY) : py;
      for (let i = 0; i < puffCount; i += 1) {
        const ang = -Math.PI / 2 + (Math.random() * 1.4 - 0.7);
        const mag = 42 + Math.random() * 64;
        this.spawnParticle(
          toX + (Math.random() * 6 - 3),
          toY + (Math.random() * 4 - 2),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 16,
          0.2 + Math.random() * 0.16,
          0.34,
          1.4 + Math.random() * 1.8,
          pickRandom(['#fff5e2', '#f5e6d1', '#d5ebff', '#e9f3ff']),
          150
        );
      }
      return;
    }
    if (type === 'minion') this.spawnUnitHitImpact(px, py, pside);
    const palette = TEAM_COLORS[pside] || TEAM_COLORS.left;
    if (type === 'resource') {
      const worldW = Number(eventWorld?.w) || Number(this.canvas?.width) || 1600;
      const centralBandMin = worldW * 0.33;
      const centralBandMax = worldW * 0.67;
      if (Number.isFinite(px) && px >= centralBandMin && px <= centralBandMax && (pside === 'left' || pside === 'right')) {
        const trailCount = Math.max(1, Math.min(10, Math.round(Number(event?.trailCount) || 2)));
        this.spawnGoldResourceTrail(px, py, pside, eventWorld || {
          towerLeftX: 190,
          towerRightX: 1410,
          towerY: 350,
        }, trailCount);
      }
    }
    if (type === 'towerhit') {
      const half = (this.canvas?.width || 1600) * 0.5;
      const towerSide = pside === 'left' || pside === 'right' ? pside : (px < half ? 'left' : 'right');
      this.registerTowerImpact(towerSide, px, py, 1);
      const burstCount = this.scaledParticleCount(20, 3);
      for (let i = 0; i < burstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 90 + Math.random() * 220;
        this.spawnParticle(
          px + (Math.random() * 8 - 4),
          py + (Math.random() * 6 - 3),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 24,
          0.42 + Math.random() * 0.22,
          0.62,
          1.8 + Math.random() * 2.6,
          pickRandom(TOWER_HIT_PARTICLE_COLORS),
          640
        );
      }
      return;
    }
    if (type === 'blocked') {
      const burstCount = this.scaledParticleCount(18, 3);
      for (let i = 0; i < burstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 80 + Math.random() * 140;
        this.spawnParticle(
          px + (Math.random() * 6 - 3),
          py + (Math.random() * 4 - 2),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 16,
          0.34 + Math.random() * 0.2,
          0.58,
          2 + Math.random() * 2.6,
          pickRandom(BLOCKED_PARTICLE_COLORS),
          320
        );
      }
      return;
    }
    if (type === 'candlehit') {
      // Fire burst centered on the flame hit.
      const fireBurstCount = this.scaledParticleCount(30, 5);
      for (let i = 0; i < fireBurstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 120 + Math.random() * 250;
        this.spawnParticle(
          px + (Math.random() * 4 - 2),
          py + (Math.random() * 3 - 1.5),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 45,
          0.34 + Math.random() * 0.16,
          0.48,
          2.2 + Math.random() * 2.8,
          pickRandom(CANDLE_HIT_FIRE_COLORS),
          540
        );
      }
      // Stem plume so wax/embers clearly eject from the candle body.
      const plumeBurstCount = this.scaledParticleCount(14, 2);
      for (let i = 0; i < plumeBurstCount; i += 1) {
        const ang = -Math.PI / 2 + (Math.random() * 0.85 - 0.425);
        const mag = 200 + Math.random() * 170;
        this.spawnParticle(
          px + (Math.random() * 8 - 4),
          py + 8 + (Math.random() * 3 - 1.5),
          Math.cos(ang) * mag * 0.46,
          Math.sin(ang) * mag - 35,
          0.42 + Math.random() * 0.16,
          0.58,
          2 + Math.random() * 2.2,
          pickRandom(CANDLE_HIT_PLUME_COLORS),
          560
        );
      }
      // Wax chunks spraying outward from the stem.
      const waxBurstCount = this.scaledParticleCount(22, 4);
      for (let i = 0; i < waxBurstCount; i += 1) {
        const ang = -Math.PI / 2 + (Math.random() * 1.8 - 0.9);
        const mag = 110 + Math.random() * 180;
        this.spawnParticle(
          px + (Math.random() * 8 - 4),
          py + 10 + (Math.random() * 5 - 2.5),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 10,
          0.64 + Math.random() * 0.3,
          0.92,
          1.9 + Math.random() * 2.4,
          pickRandom(CANDLE_HIT_WAX_COLORS),
          660
        );
      }
      return;
    }
    if (type === 'healbeam') {
      const fromX = Number.isFinite(event?.fromX) ? event.fromX : px;
      const fromY = Number.isFinite(event?.fromY) ? event.fromY : py;
      const toX = Number.isFinite(event?.toX) ? event.toX : px;
      const toY = Number.isFinite(event?.toY) ? event.toY : py;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const len = Math.hypot(dx, dy);
      const steps = Math.max(3, Math.min(14, Math.round(len / 18)));
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const bx = fromX + dx * t + (Math.random() * 4 - 2);
        const by = fromY + dy * t + (Math.random() * 4 - 2);
        const ang = Math.random() * Math.PI * 2;
        const mag = 34 + Math.random() * 62;
        this.spawnParticle(
          bx,
          by,
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 10,
          0.22 + Math.random() * 0.14,
          0.34,
          1.5 + Math.random() * 1.8,
          pickRandom(['#c6ffb8', '#89f0a4', '#e4ffd8']),
          180
        );
      }
      return;
    }
    if (type === 'healcircle') {
      const r = Math.max(34, Number(event?.r) || 96);
      const ringCount = this.scaledParticleCount(44, 8);
      for (let i = 0; i < ringCount; i += 1) {
        const ang = (Math.PI * 2 * i) / ringCount + (Math.random() * 0.12 - 0.06);
        const ringR = r * (0.72 + Math.random() * 0.36);
        const sx = px + Math.cos(ang) * ringR;
        const sy = py + Math.sin(ang) * ringR;
        const mag = 48 + Math.random() * 74;
        this.spawnParticle(
          sx,
          sy,
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 8,
          0.38 + Math.random() * 0.16,
          0.52,
          1.8 + Math.random() * 2.2,
          pickRandom(['#9ff2ad', '#d7ffcf', '#66d98b']),
          220
        );
      }
      this.healCircles.push({
        x: px,
        y: py,
        r,
        life: 0.95,
        maxLife: 0.95,
      });
      if (this.healCircles.length > MAX_HEAL_CIRCLES) {
        this.healCircles.splice(0, this.healCircles.length - MAX_HEAL_CIRCLES);
      }
      return;
    }
    if (type === 'herofoodrain') {
      const riceSide = event?.foodType === 'rice' || pside === 'right';
      this.spawnHeroFoodRainVisual(event, px, py, pside);
      const fromY = Number.isFinite(event?.fromY) ? Number(event.fromY) : (py - 120);
      const toY = Number.isFinite(event?.toY) ? Number(event.toY) : py;
      const duration = Math.max(0.18, Number(event?.duration) || 0.46);
      const sizeMul = Math.max(0.5, Math.min(1.8, Number(event?.size) || 1));
      const bigProjectile = Boolean(event?.bigProjectile);
      const travel = Math.max(18, toY - fromY);
      const speed = travel / duration;
      const colors = riceSide
        ? ['#f7fcff', '#dcebf9', '#c7d9ea', '#2a3c4f']
        : ['#f2d0a4', '#d89f63', '#b4713d', '#7d4b2c'];
      const dropCount = this.scaledParticleCount(bigProjectile ? 6 : 3, bigProjectile ? 1 : 0);
      for (let i = 0; i < dropCount; i += 1) {
        this.spawnParticle(
          px + (Math.random() * 10 - 5),
          fromY + (Math.random() * 8 - 4),
          Math.random() * 40 - 20,
          speed * (0.88 + Math.random() * 0.24),
          duration * (0.9 + Math.random() * 0.28),
          duration * 1.12,
          (riceSide ? 2 : 2.6) * sizeMul + Math.random() * (riceSide ? 1.1 : 1.4),
          colors[Math.floor(Math.random() * colors.length)],
          120
        );
      }
      const splashCount = this.scaledParticleCount(bigProjectile ? 14 : 8, bigProjectile ? 4 : 2);
      for (let i = 0; i < splashCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = (bigProjectile ? 102 : 78) + Math.random() * (bigProjectile ? 142 : 105);
        this.spawnParticle(
          px + (Math.random() * 6 - 3),
          py + (Math.random() * 5 - 2.5),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 40,
          0.28 + Math.random() * 0.16,
          0.4,
          1.5 + Math.random() * 1.6,
          colors[Math.floor(Math.random() * colors.length)],
          420
        );
      }
      return;
    }
    if (type === 'herorumble') {
      const riceSide = event?.foodType === 'rice' || pside === 'right';
      this.spawnHeroFoodRumbleVisual(event, px, py, pside);
      const colors = riceSide
        ? ['#f8fdff', '#dceefe', '#c1d6e7', '#2f4155']
        : ['#f4c792', '#dd9d5e', '#bf7b45', '#844f2f'];
      const burstCount = this.scaledParticleCount(34, 6);
      for (let i = 0; i < burstCount; i += 1) {
        const ang = -Math.PI / 2 + (Math.random() * 1.9 - 0.95);
        const mag = 150 + Math.random() * 260;
        this.spawnParticle(
          px + (Math.random() * 20 - 10),
          py + (Math.random() * 8 - 4),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 38,
          0.46 + Math.random() * 0.28,
          0.64,
          2 + Math.random() * 2.8,
          colors[Math.floor(Math.random() * colors.length)],
          680
        );
      }
      return;
    }
    if (type === 'herocooker') {
      const riceSide = event?.foodType === 'rice' || pside === 'right';
      const colors = riceSide
        ? ['#f4fbff', '#d9ebfb', '#c2d7ea']
        : ['#ffe0ba', '#f2be88', '#d99a5f'];
      const steamCount = this.scaledParticleCount(event?.pulse ? 26 : 12, 3);
      for (let i = 0; i < steamCount; i += 1) {
        const ang = -Math.PI / 2 + (Math.random() * 1.2 - 0.6);
        const mag = 52 + Math.random() * 118;
        this.spawnParticle(
          px + (Math.random() * 10 - 5),
          py + (Math.random() * 6 - 3),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 26,
          0.34 + Math.random() * 0.22,
          0.52,
          1.8 + Math.random() * 2.4,
          colors[Math.floor(Math.random() * colors.length)],
          160
        );
      }
      return;
    }
    if (type === 'foodburst') {
      const riceSide = event?.foodType === 'rice' || pside === 'right';
      const heavy = Boolean(event?.heavy);
      const burstCount = this.scaledParticleCount(heavy ? 44 : 38, 6);
      const colors = this.isThemedEmpires()
        ? (
          riceSide
            ? ['#f8fdff', '#dceefe', '#c1d6e7', '#2b3e52']
            : ['#f1c58b', '#d59755', '#ba7742', '#7f4c2b']
        )
        : ['#2f353c', '#4f5864', '#7b858f', '#d0b48a', '#ffbf63'];
      const speed = heavy ? 340 : 320;
      const life = heavy ? 0.72 : 0.68;
      const lift = 26;
      const sizeBase = heavy ? 2.6 : 2.5;
      const sizeJitter = heavy ? 3.7 : 3.4;
      for (let i = 0; i < burstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = speed * (0.5 + Math.random() * 0.72);
        this.spawnParticle(
          px + (Math.random() * 12 - 6),
          py + (Math.random() * 8 - 4),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - lift,
          life * (0.72 + Math.random() * 0.34),
          life,
          sizeBase + Math.random() * sizeJitter,
          colors[Math.floor(Math.random() * colors.length)],
          heavy ? 520 : 500
        );
      }
      return;
    }

    let count = 8;
    let colors = [palette.soft, '#ffffff'];
    let speed = 180;
    let life = 0.3;
    let gravity = 420;
    let sizeBase = 1.8;
    let sizeRand = 2.7;

    if (type === 'resource') {
      count = 12;
      colors = ['#f4c95d', '#fff4bf', '#9a7a20'];
      speed = 220;
      life = 0.42;
      gravity = 480;
    } else if (type === 'minion') {
      count = 16;
      colors = ['#ffd0cb', '#ff8a7e', '#ff6055', '#ffc7b6'];
      speed = 245;
      life = 0.36;
      gravity = 430;
      sizeBase = 2.1;
      sizeRand = 2.8;
    } else if (type === 'powerup') {
      count = 14;
      colors = ['#b88dff', '#79f3ff', '#fff3a3'];
      speed = 210;
      life = 0.48;
      gravity = 360;
    } else if (type === 'upgrade') {
      count = 16;
      colors = ['#7df0a7', '#d7ffd7', '#6fb0ff'];
      speed = 190;
      life = 0.5;
      gravity = 300;
    } else if (type === 'explosion') {
      count = 38;
      colors = ['#ffcf7a', '#ff8f5f', '#ffe8b7', '#ff6b4d'];
      speed = 340;
      life = 0.68;
      gravity = 500;
      sizeBase = 2.8;
      sizeRand = 3.8;
    } else if (type === 'dragon') {
      count = 24;
      colors = ['#ffd76e', '#ff9955', '#fff1b8', '#99f7ff'];
      speed = 320;
      life = 0.48;
      gravity = 540;
    } else if (type === 'dragonfire') {
      count = 30;
      colors = ['#ffc44c', '#ff8d47', '#ff5f35', '#ffe3a1'];
      speed = 330;
      life = 0.5;
      gravity = 520;
    } else if (type === 'gunhit') {
      count = 22;
      colors = ['#ffd58a', '#ff955f', '#ff6b4c', '#f2f6ff'];
      speed = 290;
      life = 0.42;
      gravity = 560;
    }

    if (type === 'powerup' && Number.isFinite(event?.targetArcherSlot)) {
      const slot = Math.max(0, Number(event.targetArcherSlot) || 0);
      const towerY = Number(eventWorld?.towerY) || 350;
      const targetX = pside === 'left'
        ? (Number(eventWorld?.towerLeftX) || 190) + 35
        : (Number(eventWorld?.towerRightX) || 1410) - 35;
      const targetY = towerY - 56 - (slot * 78);
      this.spawnPowerupTrail(px, py, targetX, targetY, pside, 3);
    }

    const burstCount = this.scaledParticleCount(count, 2);
    for (let i = 0; i < burstCount; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const mag = speed * (0.45 + Math.random() * 0.65);
      this.spawnParticle(
        px,
        py,
        Math.cos(ang) * mag,
        Math.sin(ang) * mag - 40,
        life,
        life,
        sizeBase + Math.random() * sizeRand,
        colors[Math.floor(Math.random() * colors.length)],
        gravity
      );
    }
  }

  createGhostMinion(ghost, side, x, y) {
    if (!ghost || typeof ghost !== 'object') return null;
    const sideName = ghost.side === 'right' || ghost.side === 'left'
      ? ghost.side
      : (side === 'right' ? 'right' : 'left');
    return {
      side: sideName,
      x: Number.isFinite(ghost.x) ? ghost.x : (Number.isFinite(x) ? x : 0),
      y: Number.isFinite(ghost.y) ? ghost.y : (Number.isFinite(y) ? y : 0),
      r: Math.max(8, Number(ghost.r) || 14),
      hp: 100,
      maxHp: 100,
      tier: Math.max(0, Number(ghost.tier) || 0),
      level: Math.max(0, Number(ghost.level) || 1),
      super: Boolean(ghost.super),
      summoned: Boolean(ghost.summoned),
      necroRevived: Boolean(ghost.necroRevived),
      explosive: Boolean(ghost.explosive),
      heroCooker: Boolean(ghost.heroCooker),
      heroCookerFoodType: typeof ghost.heroCookerFoodType === 'string' ? ghost.heroCookerFoodType : null,
      heroCookerCookTtl: Number.isFinite(ghost.heroCookerCookTtl) ? ghost.heroCookerCookTtl : 0,
      heroCookerCookMaxTtl: Number.isFinite(ghost.heroCookerCookMaxTtl) ? ghost.heroCookerCookMaxTtl : 10,
      heroCookerAnimT: Number.isFinite(ghost.heroCookerAnimT) ? ghost.heroCookerAnimT : 0,
      heroCookerSpin: Number.isFinite(ghost.heroCookerSpin) ? ghost.heroCookerSpin : 0,
      gunner: Boolean(ghost.gunner),
      rider: Boolean(ghost.rider),
      riderChargeReady: Boolean(ghost.riderChargeReady),
      riderSuperHorse: Boolean(ghost.riderSuperHorse),
      digger: Boolean(ghost.digger),
      diggerGoldFinder: Boolean(ghost.diggerGoldFinder),
      dragonSuperBreathUpgraded: Boolean(ghost.dragonSuperBreathUpgraded),
      shieldDarkMetalUpgraded: Boolean(ghost.shieldDarkMetalUpgraded),
      monkHealCircleUpgraded: Boolean(ghost.monkHealCircleUpgraded),
      necroExpertUpgraded: Boolean(ghost.necroExpertUpgraded),
      gunnerSkyCannonUpgraded: Boolean(ghost.gunnerSkyCannonUpgraded),
      digPhase: Number.isFinite(ghost.digPhase) ? ghost.digPhase : 0.8,
      monk: Boolean(ghost.monk),
      monkHealScale: Number.isFinite(ghost.monkHealScale) ? ghost.monkHealScale : 1,
      hero: Boolean(ghost.hero),
      heroSwing: Number.isFinite(ghost.heroSwing) ? ghost.heroSwing : 1.1,
      shieldBearer: Boolean(ghost.shieldBearer),
      shieldPushTtl: 0,
      shieldPushScale: 1,
      shieldDarkMetalTtl: Math.max(0, Number(ghost.shieldDarkMetalTtl) || 0),
      stoneGolem: Boolean(ghost.stoneGolem),
      golemSmashTtl: 0,
      golemShieldHp: 0,
      golemShieldMax: 0,
      golemShieldTtl: 0,
      golemBiteJumpTtl: 0,
      golemBiteJumpMaxTtl: STONE_GOLEM_BITE_JUMP_TTL,
      golemBiteLandTtl: 0,
      golemBiteLandMaxTtl: STONE_GOLEM_BITE_LAND_TTL,
      golemBiteHeld: false,
      president: Boolean(ghost.president),
      presidentSetup: Boolean(ghost.president),
      presidentAuraDisabled: Boolean(ghost.president),
      presidentAuraRadius: 180,
      dragon: Boolean(ghost.dragon),
      balloon: Boolean(ghost.balloon),
      balloonLevel: Math.max(0, Number(ghost.balloonLevel) || 0),
      flying: Boolean(ghost.flying),
      flyPhase: Number.isFinite(ghost.flyPhase) ? ghost.flyPhase : 0.8,
      balloonThrowTtl: 0,
      balloonThrowMaxTtl: 0.6,
      balloonThrowToX: null,
      balloonThrowToY: null,
      balloonBombTtl: 0,
      balloonBombMaxTtl: 0.52,
      balloonBombFromX: null,
      balloonBombFromY: null,
      balloonBombToX: null,
      balloonBombToY: null,
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunFlashTtl: 0,
      necrominion: Boolean(ghost.necrominion),
      failedSpecialType: typeof ghost.failedSpecialType === 'string' ? ghost.failedSpecialType : null,
      hitFlashTtl: 0,
    };
  }

  emitDeathGhost(event) {
    if (!event || typeof event !== 'object') return;
    const ghostMinion = this.createGhostMinion(event.ghost, event.side, event.x, event.y);
    if (!ghostMinion) return;
    const life = 0.72 + Math.random() * 0.24;
    const killerSide = event.killerSide === 'left' || event.killerSide === 'right' ? event.killerSide : null;
    const fallbackTilt = Math.random() < 0.5 ? -1 : 1;
    const tiltSign = killerSide
      ? (killerSide === 'left' ? 1 : -1)
      : fallbackTilt;
    this.deathGhosts.push({
      minion: ghostMinion,
      x: ghostMinion.x,
      y: ghostMinion.y,
      vx: Math.random() * 12 - 6,
      vy: -24 - Math.random() * 20,
      gravity: 168 + Math.random() * 90,
      rot: 0,
      rotV: tiltSign * (1.55 + Math.random() * 1.25),
      life,
      maxLife: life,
    });
    if (this.deathGhosts.length > MAX_DEATH_GHOSTS) {
      this.deathGhosts.splice(0, this.deathGhosts.length - MAX_DEATH_GHOSTS);
    }
  }

  emitReviveSpirit(event) {
    if (!event || typeof event !== 'object') return;
    const ghostMinion = this.createGhostMinion(event.ghost, event.side, event.x, event.y);
    if (!ghostMinion) return;
    const life = 0.62 + Math.random() * 0.22;
    const fromX = Number.isFinite(event.fromX) ? event.fromX : ghostMinion.x;
    const fromY = Number.isFinite(event.fromY) ? event.fromY : (ghostMinion.y - Math.max(12, ghostMinion.r * 0.6));
    const toX = Number.isFinite(event.toX) ? event.toX : ghostMinion.x;
    const toY = Number.isFinite(event.toY) ? event.toY : (ghostMinion.y - Math.max(8, ghostMinion.r * 0.22));
    this.reviveSpirits.push({
      minion: ghostMinion,
      x: ghostMinion.x,
      y: ghostMinion.y + Math.max(8, ghostMinion.r * 0.25),
      fromX,
      fromY,
      toX,
      toY,
      drift: Math.random() * 12 - 6,
      phase: Math.random() * Math.PI * 2,
      life,
      maxLife: life,
    });
    if (this.reviveSpirits.length > MAX_REVIVE_SPIRITS) {
      this.reviveSpirits.splice(0, this.reviveSpirits.length - MAX_REVIVE_SPIRITS);
    }
  }

  emitDiggerDirt(minion, x, y, dir, phase, shovelSwing) {
    if (!minion || !Number.isFinite(minion.id)) return;
    const mark = Math.floor(phase * 2.4);
    if (this.diggerDustMarks.get(minion.id) === mark) return;
    this.diggerDustMarks.set(minion.id, mark);
    if (this.diggerDustMarks.size > 2400) this.diggerDustMarks.clear();
    if (shovelSwing < 0.5) return;

    const r = Math.max(11, Number(minion.r) || 12);
    const burstX = x + dir * (r * 1.3);
    const burstY = y + r * 0.2;
    const colors = ['#8f7558', '#b89a75', '#6d5a44', '#9e825f'];
    const count = this.scaledParticleCount(3 + Math.floor(Math.random() * 3), 1);
    for (let i = 0; i < count; i += 1) {
      this.spawnParticle(
        burstX + (Math.random() * 3 - 1.5),
        burstY + (Math.random() * 2 - 1),
        dir * (70 + Math.random() * 90) + (Math.random() * 26 - 13),
        -40 - Math.random() * 55,
        0.34 + Math.random() * 0.26,
        0.6,
        1.6 + Math.random() * 1.9,
        colors[Math.floor(Math.random() * colors.length)],
        480 + Math.random() * 140
      );
    }
  }

  emitDamageNumber(amount, x, y) {
    const dmg = Math.max(1, Math.round(Number(amount) || 0));
    this.pushDamageText({
      amount: dmg,
      x: x + (Math.random() * 14 - 7),
      y: y + (Math.random() * 6 - 3),
      vx: Math.random() * 16 - 8,
      vy: -70 - Math.random() * 18,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  emitHeroLine(text, x, y, side, options = null) {
    if (!text) return;
    const opts = (options && typeof options === 'object') ? options : {};
    const scale = Math.max(0.8, Math.min(2.4, Number(opts.scale) || 1));
    const style = typeof opts.style === 'string' ? opts.style : null;
    const life = style === 'ability' ? 2.45 : 1.8;
    this.pushHeroLine({
      text: String(text).slice(0, 56),
      side,
      x,
      y,
      life,
      maxLife: life,
      vy: -24,
      scale,
      style,
    });
  }

  updateParticles(dt) {
    let write = 0;
    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      p.vy += p.gravity * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.recycleParticle(p);
        continue;
      }
      this.particles[write] = p;
      write += 1;
    }
    this.particles.length = write;
  }

  updateDeathGhosts(dt) {
    let write = 0;
    for (let i = 0; i < this.deathGhosts.length; i += 1) {
      const g = this.deathGhosts[i];
      g.vy += g.gravity * dt;
      g.vx *= 0.985;
      g.vy *= 0.985;
      g.rotV *= 0.986;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.rot += g.rotV * dt;
      g.life -= dt;
      if (g.minion) {
        g.minion.x = g.x;
        g.minion.y = g.y;
      }
      if (g.life <= 0) continue;
      this.deathGhosts[write] = g;
      write += 1;
    }
    this.deathGhosts.length = write;
  }

  updateReviveSpirits(dt) {
    let write = 0;
    for (let i = 0; i < this.reviveSpirits.length; i += 1) {
      const g = this.reviveSpirits[i];
      g.phase += dt * 6.5;
      g.y -= dt * (70 + Math.sin(g.phase) * 10);
      g.x += Math.sin(g.phase) * dt * (12 + g.drift * 0.5);
      g.life -= dt;
      if (g.minion) {
        g.minion.x = g.x;
        g.minion.y = g.y;
      }
      if (g.life <= 0) continue;
      this.reviveSpirits[write] = g;
      write += 1;
    }
    this.reviveSpirits.length = write;
  }

  updateHealCircles(dt) {
    if (!Array.isArray(this.healCircles) || this.healCircles.length === 0) return;
    let write = 0;
    for (let i = 0; i < this.healCircles.length; i += 1) {
      const ring = this.healCircles[i];
      ring.life -= dt;
      if (ring.life <= 0) continue;
      this.healCircles[write] = ring;
      write += 1;
    }
    this.healCircles.length = write;
  }

  pickHeroFoodRainKind(foodType) {
    const riceSide = foodType === 'rice';
    const kinds = riceSide ? HERO_FOOD_RAIN_RICE_KINDS : HERO_FOOD_RAIN_BREAD_KINDS;
    return kinds[Math.floor(Math.random() * kinds.length)];
  }

  pushHeroFoodVisual(entry) {
    if (!entry) return;
    this.heroFoodVisuals.push(entry);
    if (this.heroFoodVisuals.length > MAX_HERO_FOOD_VISUALS) {
      this.heroFoodVisuals.splice(0, this.heroFoodVisuals.length - MAX_HERO_FOOD_VISUALS);
    }
  }

  spawnHeroFoodRainVisual(event, x, y, sideName) {
    const foodType = event?.foodType === 'rice' || sideName === 'right' ? 'rice' : 'bread';
    const bigProjectile = Boolean(event?.bigProjectile);
    const kind = bigProjectile
      ? (foodType === 'rice' ? 'balloonRiceBomb' : 'balloonBreadBomb')
      : (
        (typeof event?.kind === 'string' && event.kind)
          ? event.kind
          : this.pickHeroFoodRainKind(foodType)
      );
    const fromY = Number.isFinite(event?.fromY) ? Number(event.fromY) : (y - 120);
    const toY = Number.isFinite(event?.toY) ? Number(event.toY) : y;
    const duration = bigProjectile
      ? Math.max(1.05, Number(event?.duration) || 1.35)
      : Math.max(0.2, Number(event?.duration) || 0.46);
    const sizeMul = bigProjectile
      ? Math.max(1.45, Math.min(2.8, Number(event?.size) || 2.05))
      : Math.max(0.72, Math.min(1.9, Number(event?.size) || 1));
    this.pushHeroFoodVisual({
      mode: bigProjectile ? 'rainbig' : 'rain',
      kind,
      seed: Number.isFinite(event?.seed) ? Number(event.seed) : (Math.random() * 100000),
      x: x + (Math.random() * 6 - 3),
      y: fromY,
      fromY,
      toY,
      driftX: Math.random() * 8 - 4,
      life: duration,
      maxLife: duration,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() * 2 - 1) * 6.4,
      scale: bigProjectile
        ? (sizeMul * (foodType === 'rice' ? 1.22 : 1.08))
        : (sizeMul * (foodType === 'rice' ? 0.68 : 0.78)),
    });
  }

  spawnHeroFoodRumbleVisual(event, x, y, sideName) {
    const foodType = event?.foodType === 'rice' || sideName === 'right' ? 'rice' : 'bread';
    const fallbackKind = foodType === 'rice' ? 'sushiRoll' : 'croissant';
    const kind = typeof event?.kind === 'string' && event.kind ? event.kind : fallbackKind;
    const fromY = Number.isFinite(event?.fromY) ? Number(event.fromY) : (y + 14);
    const toY = Number.isFinite(event?.toY) ? Number(event.toY) : (-40 - Math.random() * 80);
    const duration = Math.max(0.84, Number(event?.duration) || 1.44);
    const sizeMul = Math.max(1.2, Math.min(3.1, Number(event?.size) || 1.95));
    this.pushHeroFoodVisual({
      mode: 'rumble',
      kind,
      seed: Number.isFinite(event?.seed) ? Number(event.seed) : (Math.random() * 100000),
      x,
      y: fromY,
      fromX: x + (Math.random() * 16 - 8),
      toX: x + (Math.random() * 34 - 17),
      fromY,
      toY,
      arc: 28 + Math.random() * 26,
      groundY: fromY,
      life: duration,
      maxLife: duration,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() * 2 - 1) * 8.2,
      scale: sizeMul * (foodType === 'rice' ? 1.06 : 0.98),
    });
  }

  updateHeroFoodVisuals(dt) {
    if (!Array.isArray(this.heroFoodVisuals) || this.heroFoodVisuals.length === 0) return;
    let write = 0;
    for (let i = 0; i < this.heroFoodVisuals.length; i += 1) {
      const fx = this.heroFoodVisuals[i];
      if (!fx) continue;
      fx.life -= dt;
      if (fx.life <= 0) continue;
      const t = Math.max(0, Math.min(1, 1 - (fx.life / Math.max(0.001, fx.maxLife))));
      fx.rot += (Number(fx.spin) || 0) * dt;
      if (fx.mode === 'rain' || fx.mode === 'rainbig') {
        const big = fx.mode === 'rainbig';
        const driftMul = big ? 0.42 : 1;
        const fallT = big
          ? easeInCubic(Math.min(1, t))
          : easeInCubic(Math.min(1, t * 1.08));
        fx.x += (Number(fx.driftX) || 0) * dt * driftMul;
        fx.y = lerp(Number(fx.fromY) || 0, Number(fx.toY) || 0, fallT);
      } else if (fx.mode === 'rumble') {
        const riseT = easeInCubic(t);
        fx.x = lerp(Number(fx.fromX) || 0, Number(fx.toX) || Number(fx.fromX) || 0, riseT);
        fx.y = lerp(Number(fx.fromY) || 0, Number(fx.toY) || 0, riseT) - Math.sin(Math.PI * t) * (Number(fx.arc) || 0);
      }
      this.heroFoodVisuals[write] = fx;
      write += 1;
    }
    this.heroFoodVisuals.length = write;
  }

  spawnHeroCookerSwallow(event, x, y, sideName) {
    if (!event || typeof event !== 'object') return;
    const victimData = (event.victim && typeof event.victim === 'object')
      ? event.victim
      : event.ghost;
    const swallowedMinion = this.createGhostMinion(victimData, sideName, x, y);
    if (!swallowedMinion) return;
    const fromX = Number.isFinite(event.fromX) ? Number(event.fromX) : (Number(x) || 0);
    const fromY = Number.isFinite(event.fromY) ? Number(event.fromY) : (Number(y) || 0);
    const toX = Number.isFinite(event.toX) ? Number(event.toX) : fromX;
    const toY = Number.isFinite(event.toY) ? Number(event.toY) : fromY;
    const life = Math.max(0.2, Number(event.duration) || 0.42);
    const baseR = Math.max(8, Number(swallowedMinion.r) || 12);
    const arc = Math.max(10, Number(event.arc) || (18 + baseR * 0.7));
    this.heroCookerSwallows.push({
      minion: swallowedMinion,
      x: fromX,
      y: fromY,
      fromX,
      fromY,
      toX,
      toY,
      arc,
      spin: 0,
      rot: 0,
      life,
      maxLife: life,
      scaleStart: 1,
      scaleEnd: 0.06,
    });
    if (this.heroCookerSwallows.length > MAX_HERO_COOKER_SWALLOWS) {
      this.heroCookerSwallows.splice(0, this.heroCookerSwallows.length - MAX_HERO_COOKER_SWALLOWS);
    }
  }

  updateHeroCookerSwallows(dt) {
    if (!Array.isArray(this.heroCookerSwallows) || this.heroCookerSwallows.length === 0) return;
    let write = 0;
    for (let i = 0; i < this.heroCookerSwallows.length; i += 1) {
      const fx = this.heroCookerSwallows[i];
      if (!fx || !fx.minion) continue;
      fx.life -= dt;
      if (fx.life <= 0) continue;
      const t = Math.max(0, Math.min(1, 1 - (fx.life / Math.max(0.001, fx.maxLife))));
      const eased = easeInCubic(t);
      fx.x = lerp(Number(fx.fromX) || 0, Number(fx.toX) || 0, eased);
      fx.y = lerp(Number(fx.fromY) || 0, Number(fx.toY) || 0, eased) - Math.sin(Math.PI * t) * (Number(fx.arc) || 0);
      if ((Number(fx.spin) || 0) !== 0) fx.rot += (Number(fx.spin) || 0) * dt;
      this.heroCookerSwallows[write] = fx;
      write += 1;
    }
    this.heroCookerSwallows.length = write;
  }

  drawHeroRumbleProjectile(kind, x, y, scale, seed = 0) {
    const { ctx } = this;
    const itemKind = typeof kind === 'string' ? kind : '';
    const sushi = itemKind === 'sushiRoll' || itemKind === 'sushi' || itemKind === 'riceSushi';

    if (sushi) {
      const rx = 12.6 * scale;
      const ry = 9.4 * scale;
      const bodyGrad = ctx.createLinearGradient(x - rx, y, x + rx, y);
      bodyGrad.addColorStop(0, '#14222e');
      bodyGrad.addColorStop(0.48, '#203243');
      bodyGrad.addColorStop(1, '#0f1a24');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#3f5669';
      ctx.lineWidth = Math.max(1, 1.6 * scale);
      ctx.stroke();

      const riceGrad = ctx.createRadialGradient(x - rx * 0.2, y - ry * 0.2, ry * 0.25, x, y, ry * 1.3);
      riceGrad.addColorStop(0, '#ffffff');
      riceGrad.addColorStop(0.7, '#edf4fb');
      riceGrad.addColorStop(1, '#d8e4f0');
      ctx.fillStyle = riceGrad;
      ctx.beginPath();
      ctx.ellipse(x, y, rx * 0.8, ry * 0.68, 0, 0, Math.PI * 2);
      ctx.fill();

      const fillColors = ['#ff8f84', '#8cd680', '#ffcf78'];
      for (let i = 0; i < 3; i += 1) {
        const offs = (i - 1) * rx * 0.28 + (stableHash(seed + i * 3.7) - 0.5) * rx * 0.08;
        const fillR = ry * (0.24 + stableHash(seed + i * 5.1) * 0.08);
        ctx.fillStyle = fillColors[i];
        ctx.beginPath();
        ctx.ellipse(x + offs, y + (stableHash(seed + i * 2.1) - 0.5) * ry * 0.08, fillR, fillR * 0.88, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = this.withAlpha('#ffffff', 0.62);
      for (let i = 0; i < 11; i += 1) {
        const gx = x + (stableHash(seed + i * 1.31) - 0.5) * rx * 1.36;
        const gy = y + (stableHash(seed + i * 2.37) - 0.5) * ry * 1.1;
        const rr = 0.32 + stableHash(seed + i * 2.91) * 0.48;
        ctx.beginPath();
        ctx.ellipse(gx, gy, rr * scale, rr * 0.65 * scale, stableHash(seed + i * 4.1) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = this.withAlpha('#f8fdff', 0.75);
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      ctx.beginPath();
      ctx.moveTo(x - rx * 0.52, y - ry * 0.34);
      ctx.lineTo(x + rx * 0.3, y - ry * 0.45);
      ctx.stroke();
      return;
    }

    const r = 13 * scale;
    const outerW = Math.max(3, 7.8 * scale);
    ctx.strokeStyle = '#b56d37';
    ctx.lineWidth = outerW;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y + r * 0.08, r, Math.PI * 1.06, Math.PI * 1.95);
    ctx.stroke();

    ctx.strokeStyle = '#e7b782';
    ctx.lineWidth = Math.max(2, outerW * 0.48);
    ctx.beginPath();
    ctx.arc(x, y + r * 0.08, r * 0.72, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    ctx.strokeStyle = '#8c522a';
    ctx.lineWidth = Math.max(1.2, 1.6 * scale);
    for (let i = 0; i < 5; i += 1) {
      const t = i / 4;
      const ang = Math.PI * (1.12 + t * 0.72);
      const sx = x + Math.cos(ang) * r * 0.9;
      const sy = y + r * 0.08 + Math.sin(ang) * r * 0.9;
      const ex = sx + Math.cos(ang + Math.PI / 2) * r * 0.18;
      const ey = sy + Math.sin(ang + Math.PI / 2) * r * 0.18;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    ctx.fillStyle = this.withAlpha('#fff2dc', 0.56);
    for (let i = 0; i < 9; i += 1) {
      const ang = Math.PI * (1.14 + stableHash(seed + i * 1.6) * 0.7);
      const rr = r * (0.56 + stableHash(seed + i * 2.7) * 0.26);
      const px = x + Math.cos(ang) * rr;
      const py = y + r * 0.08 + Math.sin(ang) * rr;
      const dot = 0.42 + stableHash(seed + i * 3.8) * 0.5;
      ctx.beginPath();
      ctx.arc(px, py, dot * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawHeroBalloonPayloadProjectile(kind, x, y, scale, seed = 0) {
    const { ctx } = this;
    const isRice = kind === 'balloonRiceBomb' || kind === 'sushiRoll';
    if (!isRice) {
      // Bread loaf payload, matching the balloon bread-bomb vibe.
      const loafRx = 11.8 * scale;
      const loafRy = 7.8 * scale;
      ctx.fillStyle = '#bd7744';
      ctx.beginPath();
      ctx.ellipse(x, y, loafRx, loafRy, 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d99b62';
      ctx.beginPath();
      ctx.ellipse(x - loafRx * 0.08, y - loafRy * 0.18, loafRx * 0.7, loafRy * 0.5, 0.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#7a4321';
      ctx.lineWidth = Math.max(1.2, 1.9 * scale);
      ctx.beginPath();
      ctx.ellipse(x, y, loafRx, loafRy, 0.22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = this.withAlpha('#6b3d1f', 0.72);
      ctx.lineWidth = Math.max(1, 1.4 * scale);
      for (let i = -1; i <= 1; i += 1) {
        const sx = x + i * loafRx * 0.28;
        ctx.beginPath();
        ctx.moveTo(sx - loafRx * 0.1, y - loafRy * 0.2);
        ctx.lineTo(sx + loafRx * 0.14, y + loafRy * 0.18);
        ctx.stroke();
      }

      ctx.fillStyle = this.withAlpha('#f6d7a3', 0.72);
      for (let i = 0; i < 7; i += 1) {
        const sx = x + (stableHash(seed + i * 1.61) - 0.5) * loafRx * 0.74;
        const sy = y + (stableHash(seed + i * 2.33) - 0.5) * loafRy * 0.56;
        const rx = loafRx * (0.03 + stableHash(seed + i * 3.19) * 0.02);
        const ry = loafRy * (0.02 + stableHash(seed + i * 4.07) * 0.018);
        ctx.beginPath();
        ctx.ellipse(sx, sy, rx, ry, stableHash(seed + i * 2.77) * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    // Big rice payload in the same family as balloon rice drops, but exaggerated for readability.
    const riceR = 9.6 * scale;
    ctx.fillStyle = '#f8fdff';
    ctx.beginPath();
    ctx.arc(x - riceR * 0.8, y + riceR * 0.2, riceR * 0.92, 0, Math.PI * 2);
    ctx.arc(x + riceR * 0.82, y + riceR * 0.16, riceR * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, riceR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.withAlpha('#d7eaf7', 0.8);
    ctx.lineWidth = Math.max(1.1, 1.7 * scale);
    ctx.beginPath();
    ctx.arc(x, y, riceR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#1f3646';
    const noriW = riceR * 1.34;
    const noriH = riceR * 0.44;
    ctx.fillRect(x - noriW * 0.5, y + riceR * 0.26, noriW, noriH);

    // Strong top highlight to keep it readable against bright skies.
    ctx.fillStyle = this.withAlpha('#ffffff', 0.58);
    ctx.beginPath();
    ctx.ellipse(x - riceR * 0.22, y - riceR * 0.32, riceR * 0.5, riceR * 0.22, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.withAlpha('#e8f7ff', 0.84);
    for (let i = 0; i < 10; i += 1) {
      const gx = x + (stableHash(seed + i * 1.41) - 0.5) * riceR * 0.9;
      const gy = y + (stableHash(seed + i * 2.21) - 0.5) * riceR * 0.74;
      const grx = riceR * (0.085 + stableHash(seed + i * 3.07) * 0.035);
      const gry = riceR * (0.038 + stableHash(seed + i * 4.33) * 0.02);
      ctx.beginPath();
      ctx.ellipse(gx, gy, grx, gry, stableHash(seed + i * 2.9) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  updateDamageTexts(dt) {
    let write = 0;
    for (let i = 0; i < this.damageTexts.length; i += 1) {
      const t = this.damageTexts[i];
      t.vy -= 50 * dt;
      t.vx *= 0.96;
      t.vy *= 0.98;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) continue;
      this.damageTexts[write] = t;
      write += 1;
    }
    this.damageTexts.length = write;
  }

  updateHeroLines(dt) {
    let write = 0;
    for (let i = 0; i < this.heroLines.length; i += 1) {
      const b = this.heroLines[i];
      b.y += b.vy * dt * HERO_LINE_MOTION_SCALE;
      b.vy -= 18 * dt * HERO_LINE_MOTION_SCALE;
      b.life -= dt * HERO_LINE_TIME_SCALE;
      if (b.life <= 0) continue;
      this.heroLines[write] = b;
      write += 1;
    }
    this.heroLines.length = write;
  }

  registerTowerImpact(side, x, y, intensity = 1) {
    const key = side === 'right' ? 'right' : 'left';
    const state = this.towerShake[key];
    const mag = Math.max(0.7, Number(intensity) || 1);
    state.ttl = Math.max(state.ttl, 0.16 + mag * 0.05);
    state.amp = Math.min(8, state.amp + 1.1 + mag * 0.8);

    const burstCount = this.scaledParticleCount(12, 2);
    for (let i = 0; i < burstCount; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const magV = 60 + Math.random() * 150;
      this.spawnParticle(
        x + (Math.random() * 7 - 3.5),
        y + (Math.random() * 5 - 2.5),
        Math.cos(ang) * magV,
        Math.sin(ang) * magV - 18,
        0.35 + Math.random() * 0.2,
        0.56,
        1.6 + Math.random() * 2.2,
        pickRandom(TOWER_IMPACT_PARTICLE_COLORS),
        620
      );
    }
  }

  updateGameOverCinematic(snapshot, world, nowMs, dt) {
    void dt;
    if (!snapshot?.gameOver || !world) {
      this.gameOverCinematic.active = false;
      return;
    }

    const winner = snapshot.winner === 'right' ? 'right' : 'left';
    const loser = winner === 'left' ? 'right' : 'left';
    const state = this.gameOverCinematic;
    if (!state.active || state.winner !== winner) {
      state.active = true;
      state.startMs = nowMs;
      state.winner = winner;
      state.loser = loser;
      state.lastBurstMs = 0;
    }

    if (!this.isGameOverCinematicActive(nowMs)) return;

    const progress = this.gameOverCinematicProgress(nowMs);
    const towerX = loser === 'left' ? world.towerLeftX : world.towerRightX;
    const baseY = world.towerY;
    const burstGap = 70 - Math.min(30, progress * 30);
    if (nowMs - state.lastBurstMs >= burstGap) {
      const impactY = baseY - 110 + Math.random() * 150;
      this.registerTowerImpact(loser, towerX + (Math.random() * 20 - 10), impactY, 1.2 + progress * 1.7);

      const chunkCount = this.scaledParticleCount(18 + Math.floor(progress * 16), 4);
      for (let i = 0; i < chunkCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 100 + Math.random() * (180 + progress * 120);
        this.spawnParticle(
          towerX + (Math.random() * 36 - 18),
          impactY + (Math.random() * 30 - 15),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - (40 + progress * 45),
          0.55 + Math.random() * 0.46,
          0.96,
          2 + Math.random() * 3.8,
          pickRandom(TOWER_COLLAPSE_PARTICLE_COLORS),
          660
        );
      }
      state.lastBurstMs = nowMs;
    }
  }

  gameOverCinematicProgress(nowMs = performance.now()) {
    const state = this.gameOverCinematic;
    if (!state.active) return 1;
    const elapsed = Math.max(0, nowMs - state.startMs);
    return Math.max(0, Math.min(1, elapsed / state.durationMs));
  }

  isGameOverCinematicActive(nowMs = performance.now()) {
    const state = this.gameOverCinematic;
    if (!state.active) return false;
    return nowMs - state.startMs < state.durationMs;
  }

  drawTowerCollapseCinematic(world, nowMs = performance.now()) {
    const state = this.gameOverCinematic;
    if (!state.active || !world) return;
    const loser = state.loser === 'right' ? 'right' : 'left';
    const x = loser === 'left' ? world.towerLeftX : world.towerRightX;
    const y = world.towerY;
    const dir = loser === 'left' ? -1 : 1;
    const p = this.gameOverCinematicProgress(nowMs);
    const ease = 1 - (1 - p) ** 3;
    const drop = ease * 160;
    const angle = dir * (0.02 + ease * 1.15);

    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = 0.26 + Math.min(0.56, p * 0.7);
    const dust = ctx.createRadialGradient(x, y + 26, 8, x, y + 26, 180 + p * 80);
    dust.addColorStop(0, 'rgba(211, 189, 165, 0.48)');
    dust.addColorStop(0.4, 'rgba(127, 110, 94, 0.32)');
    dust.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = dust;
    ctx.beginPath();
    ctx.ellipse(x, y + 26, 180 + p * 80, 66 + p * 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x, y - 112 + drop);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.42 + (1 - p) * 0.3;
    ctx.fillStyle = '#526479';
    ctx.fillRect(-58, -132, 116, 236);
    ctx.fillStyle = '#364659';
    ctx.fillRect(-42, -114, 84, 18);
    ctx.fillRect(-42, -70, 84, 14);
    ctx.fillRect(-42, -30, 84, 14);
    ctx.fillRect(-42, 10, 84, 14);
    ctx.strokeStyle = '#98adbf';
    ctx.globalAlpha = 0.38 + (1 - p) * 0.24;
    ctx.lineWidth = 4;
    ctx.strokeRect(-58, -132, 116, 236);
    ctx.restore();
  }

  updateTowerShake(dt) {
    for (const key of ['left', 'right']) {
      const s = this.towerShake[key];
      s.ttl = Math.max(0, s.ttl - dt);
      s.amp = Math.max(0, s.amp - dt * 15);
      if (s.ttl === 0 && s.amp < 0.08) s.amp = 0;
    }
  }

  towerShakeOffset(side) {
    const key = side === 'right' ? 'right' : 'left';
    const s = this.towerShake[key];
    if (!s || s.ttl <= 0 || s.amp <= 0) return { x: 0, y: 0 };
    const t = performance.now() * 0.001 + s.seed;
    const fade = Math.max(0, Math.min(1, s.ttl / 0.28));
    const amp = s.amp * fade;
    return {
      x: Math.sin(t * 52) * amp,
      y: Math.cos(t * 37) * amp * 0.48,
    };
  }

  drawDamageTexts() {
    const { ctx } = this;
    for (const t of this.damageTexts) {
      const a = Math.max(0, t.life / t.maxLife);
      const size = Math.min(32, 14 + Math.log10(t.amount + 1) * 7);
      ctx.globalAlpha = 0.2 + a * 0.8;
      ctx.font = `bold ${size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#3b0707';
      ctx.lineWidth = 3;
      ctx.strokeText(`${t.amount}`, t.x, t.y);
      ctx.fillStyle = '#ff5656';
      ctx.fillText(`${t.amount}`, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  drawHeroLines() {
    const { ctx } = this;
    for (const b of this.heroLines) {
      const alpha = Math.max(0, b.life / b.maxLife);
      const lineScale = Math.max(0.8, Math.min(2.4, Number(b.scale) || 1));
      const isAbility = b.style === 'ability';
      const w = Math.max(96 * lineScale, Math.min(540 * lineScale, b.text.length * 6.4 * lineScale + 22 * lineScale));
      const h = (isAbility ? 30 : 24) * lineScale;
      const x = b.x;
      const y = b.y;
      const bg = isAbility
        ? (b.side === 'right' ? '#672c248f' : '#22486a8f')
        : (b.side === 'right' ? '#54231fcc' : '#203d59cc');
      const stroke = isAbility
        ? (b.side === 'right' ? '#ffc4a7' : '#b6e4ff')
        : (b.side === 'right' ? '#ffb19b' : '#a8d9ff');

      ctx.globalAlpha = 0.22 + alpha * 0.78;
      ctx.fillStyle = bg;
      ctx.fillRect(x - w / 2, y - h, w, h);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = (isAbility ? 1.9 : 1.4) * lineScale;
      ctx.strokeRect(x - w / 2, y - h, w, h);
      ctx.beginPath();
      ctx.moveTo(x - 7 * lineScale, y);
      ctx.lineTo(x + 7 * lineScale, y);
      ctx.lineTo(x, y + 8 * lineScale);
      ctx.closePath();
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff7e0';
      ctx.font = `bold ${Math.round((isAbility ? 13 : 11) * lineScale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(b.text, x, y - (isAbility ? 9.5 : 8) * lineScale);
    }
    ctx.globalAlpha = 1;
  }

  drawParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.75 + 0.5 * a), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawDeathGhosts() {
    const { ctx } = this;
    for (const g of this.deathGhosts) {
      if (!g?.minion) continue;
      const life = Math.max(0, g.life / g.maxLife);
      const fade = life ** 0.8;
      const sway = Math.sin((1 - life) * Math.PI * 1.2) * 0.07;
      const sideName = g.minion.side === 'right' ? 'right' : 'left';
      const tintFill = sideName === 'right' ? '#ff7474' : '#5db5ff';
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot + sway);
      ctx.translate(-g.x, -g.y);
      if (this.fxQuality === 'low') {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.12 + fade * 0.25;
        this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });
      } else if (this.fxQuality === 'medium') {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.16 + fade * 0.35;
        ctx.filter = 'grayscale(1) saturate(0) brightness(2.3)';
        this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });
      } else {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.16 + fade * 0.4;
        ctx.filter = 'grayscale(1) saturate(0) brightness(2.3)';
        this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });

        // Team tint as a sprite-shaped glow, avoiding rectangular overlays.
        ctx.filter = 'grayscale(1) saturate(0) brightness(2.5)';
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.12 + fade * 0.2;
        ctx.shadowColor = tintFill;
        ctx.shadowBlur = 12 + fade * 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  }

  drawReviveSpirits() {
    const { ctx } = this;
    for (const g of this.reviveSpirits) {
      if (!g?.minion) continue;
      const life = Math.max(0, g.life / g.maxLife);
      const rise = 1 - life;
      const scale = 0.42 + rise * 0.92;
      const glow = 0.2 + life * 0.42;

      const beamFromX = Number.isFinite(g.fromX) ? g.fromX : g.x;
      const beamFromY = Number.isFinite(g.fromY) ? g.fromY : g.y;
      const beamToX = Number.isFinite(g.toX) ? g.toX : g.x;
      const beamToY = Number.isFinite(g.toY) ? g.toY : g.y;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.24 + life * 0.58;
      const beamGrad = ctx.createLinearGradient(beamFromX, beamFromY, beamToX, beamToY);
      beamGrad.addColorStop(0, '#ffffff');
      beamGrad.addColorStop(0.5, '#f8fdff');
      beamGrad.addColorStop(1, '#eff8ff');
      ctx.strokeStyle = beamGrad;
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.8 + life * 2.8;
      ctx.beginPath();
      ctx.moveTo(beamFromX, beamFromY);
      ctx.lineTo(beamToX, beamToY);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.scale(scale, scale);
      ctx.translate(-g.x, -g.y);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.18 + life * 0.55;
      ctx.filter = 'grayscale(1) saturate(0) brightness(2.5)';
      this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });
      ctx.filter = 'none';

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = glow;
      const ringR = Math.max(16, (Number(g.minion.r) || 12) * (1 + rise * 1.35));
      ctx.strokeStyle = '#9fffe4';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(g.x, g.y + Math.max(2, (Number(g.minion.r) || 12) * 0.28), ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  }

  drawHealCircles() {
    if (!Array.isArray(this.healCircles) || this.healCircles.length === 0) return;
    const { ctx } = this;
    for (const ring of this.healCircles) {
      const life = Math.max(0, Math.min(1, ring.life / ring.maxLife));
      const x = Number(ring.x) || 0;
      const y = Number(ring.y) || 0;
      const baseR = Math.max(28, Number(ring.r) || 96);
      const expand = 1 + (1 - life) * 0.2;
      const drawR = baseR * expand;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.2 + life * 0.35;
      const glow = ctx.createRadialGradient(x, y, drawR * 0.3, x, y, drawR * 1.15);
      glow.addColorStop(0, '#ceffcf66');
      glow.addColorStop(0.62, '#7ff0a355');
      glow.addColorStop(1, '#7ff0a300');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, drawR * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.35 + life * 0.5;
      ctx.strokeStyle = '#b9ffd4';
      ctx.lineWidth = 2.4 + life * 1.6;
      ctx.beginPath();
      ctx.arc(x, y, drawR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  drawHeroFoodVisuals() {
    if (!Array.isArray(this.heroFoodVisuals) || this.heroFoodVisuals.length === 0) return;
    const { ctx } = this;
    for (const fx of this.heroFoodVisuals) {
      if (!fx) continue;
      const lifeRatio = Math.max(0, Math.min(1, fx.life / Math.max(0.001, fx.maxLife)));
      const age = 1 - lifeRatio;
      const fadeIn = Math.min(1, age / 0.14);
      const fadeOut = Math.min(1, lifeRatio / 0.2);
      const alpha = Math.max(0, Math.min(1, fadeIn * fadeOut));
      if (alpha <= 0.01) continue;

      const scale = Math.max(0.32, Number(fx.scale) || 0.8);
      const x = Number(fx.x) || 0;
      const y = Number(fx.y) || 0;
      const seed = Number.isFinite(fx.seed) ? Number(fx.seed) : 0;
      const rot = Number(fx.rot) || 0;

      if (fx.mode === 'rumble') {
        const reveal = Math.max(0.04, Math.min(1, age / 0.22));
        const halfW = 13.5 * scale;
        const fullH = 24 * scale;
        const topY = y - fullH * 0.62;
        const revealH = Math.max(1, fullH * reveal);

        // Ground slit to sell the "bursting up from below" emergence.
        const crackY = Number.isFinite(fx.groundY) ? Number(fx.groundY) : y;
        ctx.save();
        ctx.globalAlpha = alpha * (0.45 + (1 - reveal) * 0.55);
        ctx.fillStyle = '#2f2218';
        ctx.beginPath();
        ctx.ellipse(x, crackY + 1.2, halfW * (1.05 + (1 - reveal) * 0.24), Math.max(1.4, 2.8 * scale), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.translate(-x, -y);
        ctx.beginPath();
        ctx.rect(x - halfW, topY, halfW * 2, revealH);
        ctx.clip();
        this.drawHeroRumbleProjectile(fx.kind, x, y, scale, seed);
        ctx.restore();
        continue;
      }
      if (fx.mode === 'rainbig') {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.translate(-x, -y);
        this.drawHeroBalloonPayloadProjectile(fx.kind, x, y, scale, seed);
        ctx.restore();
        continue;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.translate(-x, -y);
      this.drawTreasurePileItem(fx.kind, x, y, scale, seed);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  drawHeroCookerSwallows() {
    if (!Array.isArray(this.heroCookerSwallows) || this.heroCookerSwallows.length === 0) return;
    const { ctx } = this;
    for (const fx of this.heroCookerSwallows) {
      if (!fx?.minion) continue;
      const lifeRatio = Math.max(0, Math.min(1, fx.life / Math.max(0.001, fx.maxLife)));
      const t = 1 - lifeRatio;
      const alpha = t < 0.92 ? 1 : Math.max(0, 1 - ((t - 0.92) / 0.08));
      if (alpha <= 0.01) continue;
      const scale = lerp(
        Number(fx.scaleStart) || 1,
        Number(fx.scaleEnd) || 0.1,
        easeInCubic(t)
      );
      if (scale <= 0.02) continue;
      fx.minion.x = Number(fx.x) || 0;
      fx.minion.y = Number(fx.y) || 0;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(fx.minion.x, fx.minion.y);
      ctx.rotate(Number(fx.rot) || 0);
      ctx.scale(scale, scale);
      ctx.translate(-fx.minion.x, -fx.minion.y);
      this.drawMinionSprite(fx.minion, { showHud: false, allowEffects: false });
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  sideArcherPulls(sideName, sideState) {
    const fallbackPullX = sideName === 'right' ? 0.8 : -0.8;
    const pulls = Array.isArray(sideState?.archerPulls) && sideState.archerPulls.length
      ? sideState.archerPulls
      : [{ pullX: sideState?.pullX, pullY: sideState?.pullY, archerAimY: sideState?.archerAimY }];
    return pulls.map((pull, idx) => ({
      pullX: Number.isFinite(pull?.pullX) ? pull.pullX : fallbackPullX,
      pullY: Number.isFinite(pull?.pullY) ? pull.pullY : 0,
      archerAimY: Number.isFinite(pull?.archerAimY)
        ? pull.archerAimY
        : ((Number(sideState?.archerAimY) || (900 / 2 - 56)) - idx * 78),
    }));
  }

  archerShotTiming(sideState, slot = 0, archerCount = 1, mode = '1v1') {
    const count = Math.max(1, Math.floor(Number(archerCount) || 1));
    const baseCd = Math.max(0, Number(sideState?.shotCd) || 0);
    if (mode === '2v2' && count > 1) {
      return {
        cd: baseCd,
        interval: SHOT_INTERVAL,
        active: true,
      };
    }
    const rawNextSlot = Number(sideState?.archerVolleyIndex);
    const nextSlot = Number.isFinite(rawNextSlot)
      ? ((Math.round(rawNextSlot) % count) + count) % count
      : 0;
    const normalizedSlot = ((Math.floor(Number(slot) || 0) % count) + count) % count;
    const volleyDistance = (normalizedSlot - nextSlot + count) % count;
    return {
      cd: baseCd + volleyDistance * SHOT_INTERVAL,
      interval: SHOT_INTERVAL * count,
      active: volleyDistance === 0,
    };
  }

  drawAimGuide(side, ox, oy, angle, strength, options = {}) {
    const { ctx } = this;
    const palette = TEAM_COLORS[side];
    const guideOpacity = Number.isFinite(options.opacity)
      ? Math.max(0, Math.min(1, options.opacity))
      : 0.45;
    const comboStreak = Math.max(0, Math.floor(Number(options.comboHitStreak) || 0));
    const comboTier = comboTierFromStreak(comboStreak);
    const comboMaxed = comboStreak >= COMBO_MAX_STREAK;
    const comboOverdrive = Math.max(0, comboStreak - COMBO_MAX_STREAK);
    const shotPowerType = options.shotPowerType || null;
    const shotPowerShots = Math.max(0, Number(options.shotPowerShots) || 0);
    const len = 90 + strength * 180;
    const lineW = 1.5 + strength * 3.5;
    const ex = ox + Math.cos(angle) * len;
    const ey = oy + Math.sin(angle) * len;
    const reticleR = 2.5 + strength * 3.5;

    let guideCoreColor = palette.primary;
    let reticleFillColor = palette.soft;
    let textColor = '#d7e3f1';
    let font = 'bold 10px sans-serif';
    if (comboTier >= 2) {
      guideCoreColor = '#74dfff';
      reticleFillColor = '#e9fbff';
      textColor = '#ecfaff';
    }
    if (comboTier >= 3) {
      guideCoreColor = '#c6a9ff';
      reticleFillColor = '#f6ebff';
      textColor = '#f8eeff';
      font = 'bold 11px sans-serif';
    }
    if (comboMaxed) {
      guideCoreColor = '#f9c75f';
      reticleFillColor = '#fff4ca';
      textColor = '#fff3cf';
      font = 'bold 12px sans-serif';
    }

    ctx.save();
    ctx.globalAlpha = guideOpacity;
    ctx.strokeStyle = `rgba(255,255,255,${0.4 + strength * 0.45})`;
    ctx.lineWidth = lineW + 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = this.withAlpha(guideCoreColor, 1);
    ctx.lineWidth = lineW;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    if (comboMaxed) {
      ctx.globalAlpha = Math.min(0.85, 0.5 + comboOverdrive * 0.015);
      ctx.strokeStyle = '#ffd36f';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#ffd56e';
      ctx.shadowBlur = 14 + Math.min(16, comboOverdrive * 0.7);
      ctx.beginPath();
      ctx.arc(ex, ey, reticleR + 4.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (comboTier >= 2) {
      ctx.globalAlpha = 0.45 + (comboTier - 2) * 0.16;
      ctx.strokeStyle = this.withAlpha(guideCoreColor, 1);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(ex, ey, reticleR + 2.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = this.withAlpha(reticleFillColor, 1);
    ctx.beginPath();
    ctx.arc(ex, ey, reticleR, 0, Math.PI * 2);
    ctx.fill();

    if (shotPowerType) {
      this.drawShotPowerIcon(shotPowerType, ex, ey, 12, side);
      if (shotPowerShots > 0) {
        ctx.fillStyle = this.withAlpha('#ffffff', 0.92);
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${shotPowerShots}x`, ex, ey - 14);
      }
    }

    const text = `x${comboStreak}`;
    ctx.font = font;
    ctx.globalAlpha = Math.max(0.35, Math.min(1, guideOpacity + 0.25));
    const textY = ey - (shotPowerType ? 30 : 18);
    if (comboMaxed) {
      ctx.shadowColor = '#ffcc72';
      ctx.shadowBlur = 10;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, ex, textY);
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';

    const px = ox + Math.cos(angle) * 40;
    const py = oy + Math.sin(angle) * 40;
    ctx.globalAlpha = guideOpacity;
    ctx.fillStyle = this.withAlpha('#ffffff', 1);
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(strength * 100)}%`, px, py - 6);
    ctx.restore();
  }

  withAlpha(hex, alpha) {
    const clean = hex.replace('#', '');
    const n = Number.parseInt(clean, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  mixColor(hexA, hexB = '#ffffff', weightB = 0.5) {
    const parseHex = (hex) => {
      const clean = String(hex || '').replace('#', '');
      const normalized = clean.length === 3
        ? clean.split('').map(ch => ch + ch).join('')
        : clean.padEnd(6, '0').slice(0, 6);
      const n = Number.parseInt(normalized, 16);
      return {
        r: (n >> 16) & 255,
        g: (n >> 8) & 255,
        b: n & 255,
      };
    };
    const a = parseHex(hexA);
    const b = parseHex(hexB);
    const wb = Math.max(0, Math.min(1, Number(weightB) || 0));
    const wa = 1 - wb;
    const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return `#${toHex(a.r * wa + b.r * wb)}${toHex(a.g * wa + b.g * wb)}${toHex(a.b * wa + b.b * wb)}`;
  }

  drawHealthBarNotches(x, y, w, h, maxHp) {
    const max = Math.max(0, Number(maxHp) || 0);
    if (max < 25 || w <= 1 || h <= 1) return;

    const { ctx } = this;
    const minorStep = 25;
    const majorStep = 100;
    const minorSpacingPx = (w * minorStep) / Math.max(1, max);
    const densityFactor = Math.max(0.12, Math.min(1, minorSpacingPx / 3));
    const sizeFactor = Math.max(0, Math.min(1, (w - 20) / 90));
    const minorAlpha = (0.22 + sizeFactor * 0.18) * densityFactor;
    const majorAlpha = (0.38 + sizeFactor * 0.22) * Math.max(0.22, densityFactor);
    const minorTopH = Math.max(1, Math.round(h * 0.45));
    const majorW = h >= 5 ? 2 : 1;
    const notchByPixel = new Map();
    const leftBound = Math.floor(x);
    const rightBound = Math.ceil(x + w);

    for (let value = minorStep; value < max; value += minorStep) {
      const px = Math.round(x + (value / max) * w);
      if (px <= leftBound || px >= rightBound) continue;
      const major = value % majorStep === 0;
      if (major) notchByPixel.set(px, 'major');
      else if (!notchByPixel.has(px)) notchByPixel.set(px, 'minor');
    }

    if (!notchByPixel.size) return;

    ctx.save();
    for (const [px, type] of notchByPixel.entries()) {
      if (type === 'major') {
        ctx.fillStyle = this.withAlpha('#59616d', majorAlpha);
        ctx.fillRect(px - Math.floor(majorW / 2), y, majorW, h);
      } else {
        ctx.fillStyle = this.withAlpha('#c2c9d3', minorAlpha);
        ctx.fillRect(px, y, 1, minorTopH);
      }
    }
    ctx.restore();
  }

  drawUpgradeGlyph(type, x, y, size = 7, color = '#1f2230') {
    const { ctx } = this;
    const s = Math.max(4, Number(size) || 7);
    const lineW = Math.max(1, s * 0.18);

    const drawArrow = (sx, sy, ex, ey, headScale = 0.3) => {
      const dx = ex - sx;
      const dy = ey - sy;
      const ang = Math.atan2(dy, dx);
      const headLen = s * headScale;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.cos(ang - Math.PI / 6) * headLen, ey - Math.sin(ang - Math.PI / 6) * headLen);
      ctx.lineTo(ex - Math.cos(ang + Math.PI / 6) * headLen, ey - Math.sin(ang + Math.PI / 6) * headLen);
      ctx.closePath();
      ctx.fill();
    };

    const drawBurst = (cx, cy, innerR, outerR, rays) => {
      for (let i = 0; i < rays; i += 1) {
        const ang = (Math.PI * 2 * i) / rays;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * innerR, cy + Math.sin(ang) * innerR);
        ctx.lineTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
        ctx.stroke();
      }
    };

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const emojiSpec = UPGRADE_TWEMOJI_GLYPHS[type] || null;
    if (emojiSpec) {
      const image = this.getUpgradeGlyphImage(emojiSpec.src);
      if (image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
        const drawSize = Math.max(10, s * emojiSpec.scale);
        const offsetY = s * emojiSpec.yOffset;
        ctx.drawImage(image, -drawSize / 2, offsetY - drawSize / 2, drawSize, drawSize);
        ctx.restore();
        return;
      }
    }

    switch (type) {
      case 'unitLevel': {
        ctx.lineWidth = Math.max(1.2, s * 0.2);
        ctx.beginPath();
        ctx.moveTo(-0.44 * s, 0.5 * s);
        ctx.lineTo(0.5 * s, -0.44 * s);
        ctx.moveTo(-0.5 * s, -0.44 * s);
        ctx.lineTo(0.44 * s, 0.5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.58 * s, -0.52 * s);
        ctx.lineTo(0.36 * s, -0.3 * s);
        ctx.lineTo(0.7 * s, -0.26 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0.52 * s, 0.58 * s);
        ctx.lineTo(0.3 * s, 0.36 * s);
        ctx.lineTo(0.26 * s, 0.7 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-0.58 * s, 0.42 * s, 0.2 * s, 0.14 * s);
        ctx.fillRect(-0.56 * s, -0.56 * s, 0.2 * s, 0.14 * s);
        break;
      }
      case 'volleyLevel': {
        drawArrow(-0.6 * s, 0.55 * s, -0.16 * s, -0.5 * s, 0.26);
        drawArrow(-0.12 * s, 0.55 * s, 0.22 * s, -0.5 * s, 0.26);
        drawArrow(0.34 * s, 0.55 * s, 0.56 * s, -0.5 * s, 0.26);
        break;
      }
      case 'spawnLevel': {
        ctx.beginPath();
        ctx.arc(0, 0, 0.54 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -0.28 * s);
        ctx.moveTo(0, 0);
        ctx.lineTo(0.24 * s, 0.08 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-0.9 * s, -0.26 * s);
        ctx.lineTo(-0.56 * s, -0.26 * s);
        ctx.moveTo(-0.86 * s, 0.04 * s);
        ctx.lineTo(-0.48 * s, 0.04 * s);
        ctx.stroke();
        break;
      }
      case 'unitHpLevel': {
        ctx.beginPath();
        ctx.moveTo(0, 0.58 * s);
        ctx.bezierCurveTo(-0.64 * s, 0.14 * s, -0.62 * s, -0.44 * s, 0, -0.12 * s);
        ctx.bezierCurveTo(0.62 * s, -0.44 * s, 0.64 * s, 0.14 * s, 0, 0.58 * s);
        ctx.fill();
        break;
      }
      case 'resourceLevel': {
        ctx.beginPath();
        ctx.moveTo(0, -0.62 * s);
        ctx.lineTo(0.56 * s, -0.08 * s);
        ctx.lineTo(0, 0.62 * s);
        ctx.lineTo(-0.56 * s, -0.08 * s);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-0.5 * s, -0.08 * s);
        ctx.lineTo(0.5 * s, -0.08 * s);
        ctx.stroke();
        break;
      }
      case 'powerLevel': {
        ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
          const ang = (-Math.PI / 2) + (Math.PI * 2 * i) / 10;
          const r = i % 2 === 0 ? 0.62 * s : 0.28 * s;
          const px = Math.cos(ang) * r;
          const py = Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'balloonLevel': {
        ctx.beginPath();
        ctx.arc(0, -0.16 * s, 0.46 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-0.16 * s, 0.18 * s);
        ctx.lineTo(0.16 * s, 0.18 * s);
        ctx.lineTo(0.1 * s, 0.58 * s);
        ctx.lineTo(-0.1 * s, 0.58 * s);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-0.22 * s, 0.08 * s);
        ctx.lineTo(-0.1 * s, 0.22 * s);
        ctx.moveTo(0.22 * s, 0.08 * s);
        ctx.lineTo(0.1 * s, 0.22 * s);
        ctx.stroke();
        break;
      }
      case 'dragonLevel': {
        ctx.beginPath();
        ctx.moveTo(-0.64 * s, 0.32 * s);
        ctx.lineTo(-0.2 * s, -0.54 * s);
        ctx.lineTo(0.2 * s, -0.18 * s);
        ctx.lineTo(0.56 * s, -0.28 * s);
        ctx.lineTo(0.38 * s, 0.06 * s);
        ctx.lineTo(0.62 * s, 0.42 * s);
        ctx.lineTo(0.12 * s, 0.26 * s);
        ctx.lineTo(-0.18 * s, 0.54 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'dragonSuperBreathLevel': {
        ctx.beginPath();
        ctx.moveTo(0, -0.62 * s);
        ctx.lineTo(0.58 * s, 0.36 * s);
        ctx.lineTo(0.12 * s, 0.18 * s);
        ctx.lineTo(0, 0.62 * s);
        ctx.lineTo(-0.12 * s, 0.18 * s);
        ctx.lineTo(-0.58 * s, 0.36 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'shieldDarkMetalLevel': {
        ctx.beginPath();
        ctx.moveTo(0, -0.64 * s);
        ctx.lineTo(0.54 * s, -0.34 * s);
        ctx.lineTo(0.4 * s, 0.38 * s);
        ctx.lineTo(0, 0.64 * s);
        ctx.lineTo(-0.4 * s, 0.38 * s);
        ctx.lineTo(-0.54 * s, -0.34 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'monkHealCircleLevel': {
        ctx.beginPath();
        ctx.arc(0, 0, 0.58 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillRect(-0.13 * s, -0.44 * s, 0.26 * s, 0.88 * s);
        ctx.fillRect(-0.44 * s, -0.13 * s, 0.88 * s, 0.26 * s);
        break;
      }
      case 'necroExpertSummonerLevel': {
        ctx.beginPath();
        ctx.arc(0, -0.08 * s, 0.46 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-0.18 * s, -0.14 * s, 0.08 * s, 0, Math.PI * 2);
        ctx.arc(0.18 * s, -0.14 * s, 0.08 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-0.22 * s, 0.22 * s, 0.44 * s, 0.16 * s);
        drawArrow(0, 0.66 * s, 0, 0.3 * s, 0.24);
        break;
      }
      case 'riderSuperHorseLevel': {
        ctx.lineWidth = Math.max(1.2, s * 0.22);
        ctx.beginPath();
        ctx.moveTo(-0.46 * s, -0.42 * s);
        ctx.quadraticCurveTo(0, 0.68 * s, 0.46 * s, -0.42 * s);
        ctx.stroke();
        ctx.fillRect(-0.48 * s, -0.5 * s, 0.16 * s, 0.2 * s);
        ctx.fillRect(0.32 * s, -0.5 * s, 0.16 * s, 0.2 * s);
        break;
      }
      case 'diggerGoldFinderLevel': {
        ctx.beginPath();
        ctx.moveTo(-0.34 * s, 0.48 * s);
        ctx.lineTo(0.32 * s, -0.3 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-0.5 * s, -0.06 * s);
        ctx.lineTo(0.02 * s, -0.24 * s);
        ctx.lineTo(-0.08 * s, -0.44 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0.5 * s, 0.34 * s, 0.16 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'gunnerSkyCannonLevel': {
        ctx.beginPath();
        ctx.arc(-0.14 * s, 0.26 * s, 0.72 * s, Math.PI * 1.06, Math.PI * 1.52);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0.38 * s, -0.26 * s, 0.16 * s, 0, Math.PI * 2);
        ctx.fill();
        drawBurst(0.56 * s, -0.44 * s, 0.06 * s, 0.24 * s, 6);
        break;
      }
      case 'presidentExecutiveOrderLevel': {
        const docW = 0.9 * s;
        const docH = 0.66 * s;
        const x0 = -docW * 0.5;
        const y0 = -docH * 0.5;
        const fold = 0.18 * s;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + docW - fold, y0);
        ctx.lineTo(x0 + docW, y0 + fold);
        ctx.lineTo(x0 + docW, y0 + docH);
        ctx.lineTo(x0, y0 + docH);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x0 + docW - fold, y0);
        ctx.lineTo(x0 + docW - fold, y0 + fold);
        ctx.lineTo(x0 + docW, y0 + fold);
        ctx.stroke();
        ctx.lineWidth = Math.max(1, s * 0.14);
        ctx.beginPath();
        ctx.moveTo(x0 + 0.14 * s, y0 + 0.02 * s);
        ctx.lineTo(x0 + 0.34 * s, y0 + 0.22 * s);
        ctx.stroke();
        ctx.lineWidth = Math.max(1, s * 0.1);
        ctx.beginPath();
        ctx.moveTo(x0 + 0.12 * s, y0 + 0.28 * s);
        ctx.lineTo(x0 + 0.62 * s, y0 + 0.28 * s);
        ctx.moveTo(x0 + 0.12 * s, y0 + 0.46 * s);
        ctx.lineTo(x0 + 0.56 * s, y0 + 0.46 * s);
        ctx.stroke();
        break;
      }
      case 'superMinionLevel': {
        ctx.beginPath();
        ctx.moveTo(-0.62 * s, 0.42 * s);
        ctx.lineTo(-0.52 * s, -0.02 * s);
        ctx.lineTo(-0.22 * s, 0.16 * s);
        ctx.lineTo(0, -0.36 * s);
        ctx.lineTo(0.22 * s, 0.16 * s);
        ctx.lineTo(0.52 * s, -0.02 * s);
        ctx.lineTo(0.62 * s, 0.42 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0.26 * s, 0.1 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      default: {
        ctx.beginPath();
        ctx.arc(0, 0, 0.2 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  getUpgradeGlyphImage(src) {
    if (!src) return null;
    let image = this.upgradeGlyphImageCache.get(src) || null;
    if (image) return image;
    image = new Image();
    image.decoding = 'async';
    image.loading = 'eager';
    image.src = src;
    this.upgradeGlyphImageCache.set(src, image);
    return image;
  }

  drawBarracksRowGlyph(rowType, fallbackType, x, y, size = 6, color = '#1f2230') {
    const spec = BARRACKS_ROW_TWEMOJI_GLYPHS[rowType] || null;
    if (spec?.src) {
      const image = this.getUpgradeGlyphImage(spec.src);
      if (image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
        const { ctx } = this;
        const s = Math.max(3, Number(size) || 6);
        const drawSize = Math.max(5, s * (Number(spec.scale) || 1.35) * BARRACKS_ROW_TWEMOJI_SIZE_MULT);
        const offsetY = s * (Number(spec.yOffset) || 0) + BARRACKS_ROW_TWEMOJI_Y_SHIFT;
        ctx.drawImage(image, x - drawSize / 2, y + offsetY - drawSize / 2, drawSize, drawSize);
        return;
      }
    }
    this.drawUpgradeGlyph(fallbackType, x, y, size, color);
  }

  spawnEveryForSide(sideState) {
    return this.baseSpawnEveryForLevel(sideState?.spawnLevel);
  }

  barracksTypeKeys(rowType, specialType = null) {
    const keys = [];
    const pushKey = (key) => {
      if (!key || keys.includes(key)) return;
      keys.push(key);
    };
    pushKey(rowType);
    pushKey(specialType);
    if (specialType && SPECIAL_TYPE_TO_ROW_TYPE[specialType]) {
      pushKey(SPECIAL_TYPE_TO_ROW_TYPE[specialType]);
    }
    if (rowType === 'stonegolem') pushKey('stoneGolem');
    if (specialType === 'necrominion') pushKey('necro');
    return keys;
  }

  barracksTypedValueForTypes(source, typeKeys = [], fieldNames = []) {
    if (!source || typeof source !== 'object') return null;
    const keys = Array.isArray(typeKeys) ? typeKeys.filter(Boolean) : [typeKeys].filter(Boolean);
    const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
    const containers = ['byType', 'types', 'values', 'map'];

    for (const fieldName of fields) {
      if (!fieldName) continue;
      if (!Object.prototype.hasOwnProperty.call(source, fieldName)) continue;
      const fieldValue = source[fieldName];
      const directValue = Number(fieldValue);
      if (Number.isFinite(directValue)) return directValue;
      if (!fieldValue || typeof fieldValue !== 'object') continue;

      const nestedSources = [fieldValue];
      for (const containerKey of containers) {
        if (fieldValue[containerKey] && typeof fieldValue[containerKey] === 'object') {
          nestedSources.push(fieldValue[containerKey]);
        }
      }

      for (const nestedSource of nestedSources) {
        for (const key of keys) {
          const nestedValue = Number(nestedSource[key]);
          if (Number.isFinite(nestedValue)) return nestedValue;
        }
      }

      const fallbackValue = Number(
        fieldValue.value
        ?? fieldValue.every
        ?? fieldValue.chance
        ?? fieldValue.seconds
        ?? fieldValue.sec
        ?? fieldValue.time
      );
      if (Number.isFinite(fallbackValue)) return fallbackValue;
    }

    return null;
  }

  barracksCadenceEntryForTypes(sideState, typeKeys = []) {
    const cadenceByType = sideState?.specialSpawnCadenceByType;
    if (!cadenceByType || typeof cadenceByType !== 'object') return null;
    const keys = Array.isArray(typeKeys) ? typeKeys.filter(Boolean) : [typeKeys].filter(Boolean);
    for (const key of keys) {
      const entry = cadenceByType[key];
      if (entry && typeof entry === 'object') return entry;
    }
    return null;
  }

  barracksCadenceForRow(sideState, row, matchTimeSec = 0) {
    const specialType = ROW_TO_SPECIAL_TYPE[row?.type] || null;
    const typeKeys = this.barracksTypeKeys(row?.type, specialType);
    const cadenceEntry = this.barracksCadenceEntryForTypes(sideState, typeKeys);
    const spawnEvery = Math.max(0.0001, this.spawnEveryForSide(sideState));
    const baseFallbackCycles = Math.max(0.0001, Number(row?.every) || 0);
    const baseFallbackSeconds = Math.max(0.0001, baseFallbackCycles * spawnEvery);
    const candleFallbackSeconds = Number.isFinite(Number(row?.etaSec))
      ? Math.max(0.0001, Number(row.etaSec))
      : baseFallbackSeconds;
    const currentFallbackSeconds = row?.type === 'candle'
      ? candleFallbackSeconds
      : baseFallbackSeconds;
    const isMilitia = row?.type === 'militia';
    const displayChance = isMilitia
      ? 1
      : (Number.isFinite(Number(row?.rollChance))
        ? Math.max(0, Math.min(0.99, Number(row.rollChance)))
        : null);
    const actualChance = isMilitia
      ? 1
      : (Number.isFinite(Number(row?.rollActualChance))
        ? Math.max(0, Math.min(0.99, Number(row.rollActualChance)))
        : displayChance);
    const sortChance = actualChance;
    const safeSortChance = Number.isFinite(sortChance) && sortChance > 0 ? sortChance : 0;

    const baseExpectedSeconds = this.barracksTypedValueForTypes(sideState, typeKeys, [
      'specialSpawnBaseExpectedSecByType',
      'specialSpawnBaseExpectedSecondsByType',
      'specialSpawnBaseTimeSecByType',
      'specialSpawnBaseCadenceSecByType',
      'specialSpawnBaseExpectedByType',
      'candleSpawnBaseExpectedSecByType',
      'candleSpawnBaseExpectedSecondsByType',
    ]);
    const nextExpectedSeconds = this.barracksTypedValueForTypes(sideState, typeKeys, [
      'specialSpawnNextExpectedSecByType',
      'specialSpawnNextExpectedSecondsByType',
      'specialSpawnCurrentExpectedSecByType',
      'specialSpawnCurrentExpectedSecondsByType',
      'specialSpawnCurrentTimeSecByType',
      'specialSpawnCurrentCadenceSecByType',
      'specialSpawnNextTimeSecByType',
      'candleSpawnNextExpectedSecByType',
      'candleSpawnCurrentExpectedSecByType',
    ]);
    const cadenceBaseEvery = Number(cadenceEntry?.baseEvery);
    const cadenceCurrentEvery = Number(cadenceEntry?.currentEvery);
    const cadenceMatchMultiplier = Number(cadenceEntry?.matchMultiplier);
    const cadenceDeltaRatio = Number(cadenceEntry?.deltaRatio);
    const cadenceRemainingSpawns = Number(cadenceEntry?.remainingSpawns);
    const baseCycleValue = Number.isFinite(cadenceBaseEvery)
      ? cadenceBaseEvery
      : this.barracksTypedValueForTypes(sideState, typeKeys, [
      'specialSpawnBaseEveryByType',
      'specialSpawnBaseCycleByType',
      'specialSpawnCycleBaseByType',
      'specialSpawnInitialEveryByType',
      'specialSpawnBaselineEveryByType',
      'specialSpawnBaseCadenceByType',
      'specialSpawnCadenceBaseByType',
      'candleSpawnBaseEveryByType',
      'candleSpawnBaseCycleByType',
    ]);
    const currentCycleValue = Number.isFinite(cadenceCurrentEvery)
      ? cadenceCurrentEvery
      : this.barracksTypedValueForTypes(sideState, typeKeys, [
      'specialSpawnCurrentEveryByType',
      'specialSpawnNextEveryByType',
      'specialSpawnCycleEveryByType',
      'specialSpawnEveryByType',
      'specialSpawnCadenceByType',
      'specialSpawnRandomizedEveryByType',
      'specialSpawnJitterEveryByType',
      'specialSpawnCurrentCadenceByType',
      'candleSpawnCurrentEveryByType',
      'candleSpawnCycleEveryByType',
      'candleSpawnEveryByType',
    ]);

    const baseNoJitterCycleValue = Number.isFinite(cadenceBaseEvery) && cadenceBaseEvery > 0
      ? Math.max(
        0.0001,
        cadenceBaseEvery
          * (Number.isFinite(cadenceMatchMultiplier) && cadenceMatchMultiplier > 0
            ? cadenceMatchMultiplier
            : 1)
      )
      : (
        Number.isFinite(baseFallbackCycles) && baseFallbackCycles > 0
          ? Math.max(0.0001, Number(baseFallbackCycles))
          : (
            Number.isFinite(baseCycleValue) && baseCycleValue > 0
              ? Math.max(0.0001, Number(baseCycleValue))
              : Math.max(0.0001, Number(currentCycleValue) || 0.0001)
          )
      );
    const baseCycleSeconds = Math.max(0.0001, baseNoJitterCycleValue * spawnEvery);
    const currentCycleSeconds = Number.isFinite(currentCycleValue)
      ? Math.max(0.0001, Number(currentCycleValue) * spawnEvery)
      : currentFallbackSeconds;
    const fallbackBaseExpectedSeconds = safeSortChance > 0
      ? baseCycleSeconds / safeSortChance
      : Infinity;
    const fallbackNextExpectedSeconds = safeSortChance > 0
      ? currentCycleSeconds / safeSortChance
      : Infinity;
    const resolvedBaseExpectedSeconds = Number.isFinite(baseExpectedSeconds)
      ? Math.max(0.0001, Number(baseExpectedSeconds))
      : fallbackBaseExpectedSeconds;
    const resolvedNextExpectedSeconds = Number.isFinite(nextExpectedSeconds)
      ? Math.max(0.0001, Number(nextExpectedSeconds))
      : fallbackNextExpectedSeconds;
    const resolvedSortMetric = Number.isFinite(resolvedNextExpectedSeconds)
      ? (safeSortChance > 0 ? (baseCycleSeconds / safeSortChance) : Infinity)
      : Infinity;
    const speedDeltaRatio = Number.isFinite(cadenceDeltaRatio)
      ? -cadenceDeltaRatio
      : (
        baseCycleSeconds > 0
          ? (baseCycleSeconds - currentCycleSeconds) / baseCycleSeconds
          : 0
      );

    return {
      displayChance,
      actualChance,
      sortChance: safeSortChance,
      baseCycleSeconds,
      currentCycleSeconds,
      cycleSpawns: Number.isFinite(cadenceCurrentEvery) && cadenceCurrentEvery > 0 ? cadenceCurrentEvery : null,
      remainingSpawns: Number.isFinite(cadenceRemainingSpawns) ? Math.max(0, cadenceRemainingSpawns) : null,
      baseExpectedSeconds: resolvedBaseExpectedSeconds,
      nextExpectedSeconds: resolvedNextExpectedSeconds,
      speedDeltaRatio,
      sortMetric: resolvedSortMetric,
      sortChanceUsesDisplayChance: false,
    };
  }

  barracksCompactSeconds(value) {
    const seconds = Number(value);
    if (!Number.isFinite(seconds) || seconds < 0) return '--';
    const abs = Math.abs(seconds);
    if (abs < 10) return `${seconds.toFixed(1)}s`;
    if (abs < 100) return `${Math.round(seconds)}s`;
    if (abs < 1000) return `${Math.round(seconds)}s`;
    const kilo = seconds / 1000;
    return `${kilo.toFixed(abs < 10000 ? 1 : 0)}k`;
  }

  barracksCountdownText(seconds) {
    const n = Number(seconds);
    if (!Number.isFinite(n) || n < 0) return '--';
    if (n < 1) return '0s';
    if (n < 1000) return `${Math.ceil(n)}s`;
    const kilo = n / 1000;
    return `${kilo.toFixed(n < 10000 ? 1 : 0)}k`;
  }

  barracksHeatColor(score01, alpha = 1) {
    const t = clamp01(score01);
    const a = clamp01(alpha);
    const r = Math.round(lerp(235, 103, t));
    const g = Math.round(lerp(102, 214, t));
    const b = Math.round(lerp(98, 128, t));
    return `rgba(${r},${g},${b},${a.toFixed(3)})`;
  }

  barracksSignedPercent(ratio) {
    const value = Number(ratio);
    if (!Number.isFinite(value)) return '+0%';
    const pct = Math.round(value * 100);
    return `${pct >= 0 ? '+' : ''}${pct}%`;
  }

  updateBarracksCadenceDeltaFxForRows(side, rows = [], nowMs = performance.now()) {
    const sideKey = side === 'right' ? 'right' : 'left';
    const rowKeys = new Set();
    for (const row of rows) {
      const type = typeof row?.type === 'string' ? row.type : null;
      if (!type) continue;
      const key = `${sideKey}:${type}`;
      rowKeys.add(key);
      const currentCycleSeconds = Number(row?.currentCycleSeconds);
      const eligible = Boolean(
        row?.unlocked
        && type !== 'militia'
        && Number.isFinite(currentCycleSeconds)
        && currentCycleSeconds > 0
      );
      if (!eligible) {
        this.barracksPrevCycleSecondsByRow.delete(key);
        continue;
      }
      const prevCycleSeconds = Number(this.barracksPrevCycleSecondsByRow.get(key));
      this.barracksPrevCycleSecondsByRow.set(key, currentCycleSeconds);
      if (!Number.isFinite(prevCycleSeconds) || prevCycleSeconds <= 0) continue;
      const deltaSeconds = currentCycleSeconds - prevCycleSeconds;
      if (Math.abs(deltaSeconds) < BARRACKS_CADENCE_DELTA_MIN_SECONDS) continue;
      this.barracksCadenceDeltaFx.set(key, {
        deltaSeconds,
        startMs: nowMs,
        ttlMs: BARRACKS_CADENCE_DELTA_FLASH_TTL_MS,
      });
    }

    for (const key of this.barracksPrevCycleSecondsByRow.keys()) {
      if (!key.startsWith(`${sideKey}:`)) continue;
      if (!rowKeys.has(key)) this.barracksPrevCycleSecondsByRow.delete(key);
    }
    for (const key of this.barracksCadenceDeltaFx.keys()) {
      if (!key.startsWith(`${sideKey}:`)) continue;
      if (!rowKeys.has(key)) this.barracksCadenceDeltaFx.delete(key);
    }
  }

  clearBarracksCadenceDeltaStateForSide(side) {
    const sideKey = side === 'right' ? 'right' : 'left';
    for (const key of this.barracksPrevCycleSecondsByRow.keys()) {
      if (key.startsWith(`${sideKey}:`)) this.barracksPrevCycleSecondsByRow.delete(key);
    }
    for (const key of this.barracksCadenceDeltaFx.keys()) {
      if (key.startsWith(`${sideKey}:`)) this.barracksCadenceDeltaFx.delete(key);
    }
  }

  barracksCadenceDeltaFxForRow(side, rowType, nowMs = performance.now()) {
    const sideKey = side === 'right' ? 'right' : 'left';
    const type = typeof rowType === 'string' ? rowType : '';
    const key = `${sideKey}:${type}`;
    const fx = this.barracksCadenceDeltaFx.get(key);
    if (!fx || typeof fx !== 'object') return null;
    const deltaSeconds = Number(fx.deltaSeconds);
    if (!Number.isFinite(deltaSeconds)) {
      this.barracksCadenceDeltaFx.delete(key);
      return null;
    }
    return {
      deltaSeconds,
      alpha: 1,
      yShift: 0,
    };
  }

  baseSpawnEveryForLevel(spawnLevel) {
    const level = Math.max(1, Number(spawnLevel) || 1);
    return Math.max(0.65, 2.2 - level * 0.09);
  }

  specialRepeatLevelForType(sideState, specialType) {
    const rule = SPECIAL_UNIT_UPGRADE_RULES_BY_SPECIAL_TYPE[specialType] || null;
    if (!rule?.upgradeType) return 0;
    return Math.max(0, (Number(sideState?.[rule.upgradeType]) || 0) - 1);
  }

  specialRepeatChanceBonusPerLevelForType(specialType, rule = null) {
    const configured = Math.max(0, Number(rule?.repeatChancePerLevel) || 0);
    if (configured > 0) return configured;
    const override = Number(SPECIAL_REPEAT_CHANCE_BONUS_PER_LEVEL_BY_TYPE[specialType]);
    return Number.isFinite(override) ? Math.max(0, override) : SPECIAL_REPEAT_CHANCE_BONUS_PER_LEVEL;
  }

  specialRepeatSpawnChanceBonus(sideState, specialType) {
    const rule = SPECIAL_UNIT_UPGRADE_RULES_BY_SPECIAL_TYPE[specialType] || null;
    const repeatLevel = this.specialRepeatLevelForType(sideState, specialType);
    if (repeatLevel <= 0) return 0;
    const perLevel = this.specialRepeatChanceBonusPerLevelForType(specialType, rule);
    return Math.min(SPECIAL_REPEAT_CHANCE_BONUS_MAX, repeatLevel * perLevel);
  }

  specialRepeatSpawnEveryMultiplier(sideState, specialType) {
    if (!SPECIAL_REPEAT_EVERY_TYPE_SET.has(specialType)) return 1;
    const repeatLevel = this.specialRepeatLevelForType(sideState, specialType);
    if (repeatLevel <= 0) return 1;
    const override = Number(SPECIAL_REPEAT_EVERY_BONUS_PER_LEVEL_BY_TYPE[specialType]);
    const perLevel = Number.isFinite(override)
      ? Math.max(0, override)
      : SPECIAL_REPEAT_EVERY_BONUS_PER_LEVEL;
    const bonus = Math.min(SPECIAL_REPEAT_EVERY_BONUS_MAX, repeatLevel * perLevel);
    return Math.max(0.4, 1 - bonus);
  }

  candleEveryForSide(sideState) {
    const spawn = Math.max(1, Number(sideState?.spawnLevel) || 1);
    const resource = Math.max(1, Number(sideState?.resourceLevel) || 1);
    const eco = Math.max(0, Number(sideState?.economyLevel) || 0);
    const tech = Math.floor((spawn + resource + eco) / 6);
    const baseEvery = Math.max(24, 35 - tech);
    return Math.max(12, Math.round(baseEvery * CANDLE_SPAWN_COOLDOWN_MULT));
  }

  stoneGolemEveryForSide(sideState, matchTimeSec = 0) {
    const spawn = Math.max(1, Number(sideState?.spawnLevel) || 1);
    const hp = Math.max(1, Number(sideState?.unitHpLevel) || 1);
    const power = Math.max(1, Number(sideState?.powerLevel) || 1);
    const resource = Math.max(1, Number(sideState?.resourceLevel) || 1);
    const golemTech = Math.floor((spawn + hp + power + resource) / 7);
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(sideState, 'stonegolem');
    const baseEvery = Math.max(30, 46 - golemTech * 2) * repeatMul;
    return this.scaledSpecialEveryForUi(baseEvery, matchTimeSec);
  }

  stoneGolemSpawnUnlocked(sideState) {
    const hp = Number(sideState?.towerHp) || 0;
    return Boolean(sideState?.towerGolemRescueUsed) || (hp > 0 && hp <= 6000 * STONE_GOLEM_UNLOCK_TOWER_HP_FRACTION);
  }

  basicSpecialBaseEveryForType(sideState, specialType) {
    const byTypeValue = Number(sideState?.specialBasicBaseEveryByType?.[specialType]);
    if (Number.isFinite(byTypeValue) && byTypeValue > 0) return byTypeValue;
    const legacyShared = Number(sideState?.specialBasicSharedBaseEvery);
    if (Number.isFinite(legacyShared) && legacyShared > 0) return legacyShared;
    return BASIC_SPECIAL_DEFAULT_BASE_EVERY;
  }

  tier2SpecialBaseEveryForType(sideState, specialType) {
    if (!TIER2_SPECIAL_TYPE_SET.has(specialType)) return Infinity;
    const byTypeValue = Number(sideState?.specialTier2BaseEveryByType?.[specialType]);
    if (Number.isFinite(byTypeValue) && byTypeValue > 0) return byTypeValue;
    return TIER2_SPECIAL_DEFAULT_BASE_EVERY;
  }

  basicSpecialTrainingEvery(sideState, specialType, matchTimeSec = 0) {
    const baseEvery = this.basicSpecialBaseEveryForType(sideState, specialType);
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(sideState, specialType);
    return this.scaledSpecialEveryForUi(baseEvery * repeatMul, matchTimeSec);
  }

  specialSpawnChanceForType(sideState, specialType) {
    const rawOverride = sideState?.debugSpecialChanceOverrides?.[specialType];
    const overrideBase = rawOverride == null ? NaN : Number(rawOverride);
    const randomizedBase = Number(sideState?.specialBaseChanceByType?.[specialType]);
    const base = Number.isFinite(overrideBase)
      ? overrideBase
      : (Number.isFinite(randomizedBase) ? randomizedBase : specialSpawnBaseChanceForType(specialType));
    if (!Number.isFinite(base)) return null;
    if (specialType === 'stonegolem' && !this.stoneGolemSpawnUnlocked(sideState)) return 0;
    let chance = base;
    chance += this.specialRepeatSpawnChanceBonus(sideState, specialType);
    return Math.max(0, Math.min(0.99, chance));
  }

  candleSpawnChance(sideState) {
    const chance = CANDLE_SPAWN_BASE_CHANCE;
    return Math.max(CANDLE_SPAWN_BASE_CHANCE, Math.min(0.92, chance));
  }

  specialSpawnChanceForRow(sideState, rowType) {
    if (rowType === 'candle') return this.candleSpawnChance(sideState);
    const specialType = ROW_TO_SPECIAL_TYPE[rowType];
    if (!specialType) return null;
    if (specialType === 'hero' && !sideState?.towerDamagedOnce) return 0;
    return this.specialSpawnChanceForType(sideState, specialType);
  }

  supportSpawnDebuffMultiplierForAliveCount(aliveCount = 0) {
    const count = Math.max(0, Math.floor(Number(aliveCount) || 0));
    if (count <= 0) return 1;
    const firstMul = Math.max(0.01, Math.min(1, Number(SUPPORT_SPAWN_DEBUFF_FIRST_MULT) || 1));
    if (count === 1) return firstMul;
    const additionalMul = Math.max(0.01, Math.min(1, Number(SUPPORT_SPAWN_DEBUFF_ADDITIONAL_MULT) || 1));
    return firstMul * Math.pow(additionalMul, count - 1);
  }

  supportAliveCountForSpecialType(activeCountByType = {}, specialType = null) {
    if (!specialType || !SUPPORT_SPECIAL_TYPE_SET.has(specialType)) return 0;
    const rowType = SPECIAL_TYPE_TO_ROW_TYPE[specialType];
    return Math.max(0, Number(activeCountByType?.[rowType]) || 0);
  }

  specialSpawnActualChanceForType(sideState, specialType, supportAliveCount = 0) {
    const displayChance = this.specialSpawnChanceForType(sideState, specialType);
    if (!Number.isFinite(displayChance)) return null;
    if (!SUPPORT_SPECIAL_TYPE_SET.has(specialType)) return displayChance;
    const mul = this.supportSpawnDebuffMultiplierForAliveCount(supportAliveCount);
    return Math.max(0, Math.min(0.99, displayChance * mul));
  }

  specialCooldownMultiplierAt(matchTimeSec = 0) {
    const safeT = Math.max(0, Number(matchTimeSec) || 0);
    const totalSteps = Math.max(1, Math.round(SPECIAL_COOLDOWN_RAMP_SECONDS / SPECIAL_COOLDOWN_STEP_SECONDS));
    const elapsedSteps = Math.min(totalSteps, Math.floor(safeT / SPECIAL_COOLDOWN_STEP_SECONDS));
    const dropPerStep = (SPECIAL_COOLDOWN_START_MULT - SPECIAL_COOLDOWN_END_MULT) / totalSteps;
    const mult = SPECIAL_COOLDOWN_START_MULT - elapsedSteps * dropPerStep;
    return Math.max(SPECIAL_COOLDOWN_END_MULT, Math.min(SPECIAL_COOLDOWN_START_MULT, mult));
  }

  scaledSpecialEveryForUi(baseEvery, matchTimeSec = 0) {
    if (!Number.isFinite(baseEvery)) return baseEvery;
    return Math.max(1, Math.round(baseEvery * this.specialCooldownMultiplierAt(matchTimeSec)));
  }

  failedSpecialLabel(type) {
    return this.specialLabel(type);
  }

  trainingEveryForType(sideState, type, matchTimeSec = 0) {
    const s = sideState || {};
    const unit = Math.max(1, Number(s.unitLevel) || 1);
    const power = Math.max(1, Number(s.powerLevel) || 1);
    const eco = Math.max(0, Number(s.economyLevel) || 0);
    const balloon = Math.max(0, Number(s.balloonLevel) || 0);
    const dragon = Math.max(0, Number(s.dragonLevel) || 0);
    const sup = Math.max(0, Number(s.superMinionLevel) || 0);
    if (type === 'militia') return 1;
    if (type === 'candle') {
      return this.candleEveryForSide(s);
    }
    if (type === 'necro') return this.basicSpecialTrainingEvery(s, 'necrominion', matchTimeSec);
    if (type === 'gunner') {
      return this.basicSpecialTrainingEvery(s, 'gunner', matchTimeSec);
    }
    if (type === 'rider') {
      return this.basicSpecialTrainingEvery(s, 'rider', matchTimeSec);
    }
    if (type === 'digger') {
      return this.basicSpecialTrainingEvery(s, 'digger', matchTimeSec);
    }
    if (type === 'monk') {
      return this.basicSpecialTrainingEvery(s, 'monk', matchTimeSec);
    }
    if (type === 'stonegolem') {
      if (!this.stoneGolemSpawnUnlocked(s)) return Infinity;
      return this.stoneGolemEveryForSide(s, matchTimeSec);
    }
    if (type === 'shield') {
      const repeatMul = this.specialRepeatSpawnEveryMultiplier(s, 'shield');
      const baseEvery = this.tier2SpecialBaseEveryForType(s, 'shield') * repeatMul;
      return this.scaledSpecialEveryForUi(baseEvery, matchTimeSec);
    }
    if (type === 'hero') {
      if (!s.towerDamagedOnce) return Infinity;
      const repeatMul = this.specialRepeatSpawnEveryMultiplier(s, 'hero');
      return this.scaledSpecialEveryForUi(Math.max(38, 56 - Math.floor((unit + power + eco) / 7)) * 10 * repeatMul, matchTimeSec);
    }
    if (type === 'president') {
      return this.basicSpecialTrainingEvery(s, 'president', matchTimeSec);
    }
    if (type === 'balloon') {
      if (balloon <= 0) return Infinity;
      const repeatMul = this.specialRepeatSpawnEveryMultiplier(s, 'balloon');
      return this.scaledSpecialEveryForUi(this.tier2SpecialBaseEveryForType(s, 'balloon') * repeatMul, matchTimeSec);
    }
    if (type === 'dragon') {
      if (dragon <= 0) return Infinity;
      const repeatMul = this.specialRepeatSpawnEveryMultiplier(s, 'dragon');
      return this.scaledSpecialEveryForUi(this.tier2SpecialBaseEveryForType(s, 'dragon') * repeatMul, matchTimeSec);
    }
    if (type === 'super') {
      if (sup <= 0) return Infinity;
      const repeatMul = this.specialRepeatSpawnEveryMultiplier(s, 'super');
      return this.scaledSpecialEveryForUi(this.tier2SpecialBaseEveryForType(s, 'super') * repeatMul, matchTimeSec);
    }
    return Infinity;
  }

  trainingInSpawns(sideState, every, specialType = null) {
    if (!Number.isFinite(every) || every <= 0) return Infinity;
    if (specialType) {
      const progressByType = sideState?.specialSpawnProgressByType;
      const rawProgress = progressByType?.[specialType];
      const progress = rawProgress == null ? NaN : Number(rawProgress);
      if (Number.isFinite(progress)) {
        const normalized = progress % every;
        const safeProgress = normalized >= 0 ? normalized : (normalized + every);
        if (every <= 1) return 1;
        const remaining = every - safeProgress;
        return remaining <= 1 ? 1 : remaining;
      }
    }
    const spawnCount = Math.max(0, Math.floor(Number(sideState?.spawnCount) || 0));
    if (every <= 1) return 1;
    const rem = spawnCount % every;
    const steps = (every - rem) % every;
    return steps === 0 ? every : steps;
  }

  emptyBarracksCounts() {
    return {
      militia: 0,
      necro: 0,
      gunner: 0,
      rider: 0,
      digger: 0,
      monk: 0,
      stonegolem: 0,
      shield: 0,
      hero: 0,
      president: 0,
      balloon: 0,
      dragon: 0,
      super: 0,
      candle: 0,
    };
  }

  buildBarracksActiveCounts(snapshot = null) {
    const counts = {
      left: this.emptyBarracksCounts(),
      right: this.emptyBarracksCounts(),
    };
    const minions = Array.isArray(snapshot?.minions) ? snapshot.minions : [];
    for (const m of minions) {
      if (!m || (Number(m.hp) || 0) <= 0) continue;
      const side = m.side === 'right' ? 'right' : 'left';
      const sideCounts = counts[side];
      if (m.super) {
        sideCounts.super += 1;
        continue;
      }
      if (m.dragon) {
        sideCounts.dragon += 1;
        continue;
      }
      if (m.digger) {
        sideCounts.digger += 1;
        continue;
      }
      if (m.gunner) {
        sideCounts.gunner += 1;
        continue;
      }
      if (m.necrominion) {
        sideCounts.necro += 1;
        continue;
      }
      if (m.rider) {
        sideCounts.rider += 1;
        continue;
      }
      if (m.hero) {
        sideCounts.hero += 1;
        continue;
      }
      if (m.monk) {
        sideCounts.monk += 1;
        continue;
      }
      if (m.stoneGolem) {
        sideCounts.stonegolem += 1;
        continue;
      }
      if (m.shieldBearer) {
        sideCounts.shield += 1;
        continue;
      }
      if (m.president) {
        sideCounts.president += 1;
        continue;
      }
      if (m.balloon) {
        sideCounts.balloon += 1;
        continue;
      }
      sideCounts.militia += 1;
    }

    const candles = Array.isArray(snapshot?.candles)
      ? snapshot.candles
      : (snapshot?.candle ? [snapshot.candle] : []);
    for (const candle of candles) {
      if (!candle || candle.destroyed) continue;
      const side = candle.spawnSide === 'right' ? 'right' : 'left';
      counts[side].candle += 1;
    }

    return counts;
  }

  barracksRows(sideState, sideName = 'left', minions = [], candles = [], precomputedCounts = null, matchTimeSec = 0) {
    const side = sideName === 'right' ? 'right' : 'left';
    const candleCd = Math.max(0, Number(sideState?.candleCd) || 0);
    const candleActive = Boolean(sideState?.candleActive);
    const activeCountByType = this.emptyBarracksCounts();
    if (precomputedCounts && typeof precomputedCounts === 'object') {
      for (const key of Object.keys(activeCountByType)) {
        activeCountByType[key] = Math.max(0, Number(precomputedCounts[key]) || 0);
      }
    } else {
      const liveMinions = Array.isArray(minions)
        ? minions.filter((m) => m && m.side === side && (Number(m.hp) || 0) > 0)
        : [];
      for (const m of liveMinions) {
        if (m.super) {
          activeCountByType.super += 1;
          continue;
        }
        if (m.dragon) {
          activeCountByType.dragon += 1;
          continue;
        }
        if (m.digger) {
          activeCountByType.digger += 1;
          continue;
        }
        if (m.gunner) {
          activeCountByType.gunner += 1;
          continue;
        }
        if (m.necrominion) {
          activeCountByType.necro += 1;
          continue;
        }
        if (m.rider) {
          activeCountByType.rider += 1;
          continue;
        }
        if (m.hero) {
          activeCountByType.hero += 1;
          continue;
        }
        if (m.monk) {
          activeCountByType.monk += 1;
          continue;
        }
        if (m.stoneGolem) {
          activeCountByType.stonegolem += 1;
          continue;
        }
        if (m.shieldBearer) {
          activeCountByType.shield += 1;
          continue;
        }
        if (m.president) {
          activeCountByType.president += 1;
          continue;
        }
        if (m.balloon) {
          activeCountByType.balloon += 1;
          continue;
        }
        activeCountByType.militia += 1;
      }
      if (Array.isArray(candles)) {
        for (const candle of candles) {
          if (!candle || candle.destroyed) continue;
          const candleSide = candle.spawnSide === 'right' ? 'right' : 'left';
          if (candleSide === side) activeCountByType.candle += 1;
        }
      }
    }
    const levelOf = {
      militia: Math.max(1, Number(sideState?.unitLevel) || 1),
      necro: Math.max(1, Number(sideState?.unitLevel) || 1),
      gunner: Math.max(1, Number(sideState?.powerLevel) || 1),
      rider: Math.max(1, Number(sideState?.unitLevel) || 1),
      digger: Math.max(1, Number(sideState?.unitHpLevel) || 1),
      monk: Math.max(1, Number(sideState?.powerLevel) || 1),
      stonegolem: Math.max(1, Number(sideState?.unitHpLevel) || 1),
      shield: Math.max(1, Number(sideState?.unitHpLevel) || 1),
      hero: Math.max(1, Number(sideState?.powerLevel) || 1),
      president: Math.max(1, Number(sideState?.resourceLevel) || 1),
      balloon: Math.max(0, Number(sideState?.balloonLevel) || 0),
      dragon: Math.max(0, Number(sideState?.dragonLevel) || 0),
      super: Math.max(0, Number(sideState?.superMinionLevel) || 0),
      candle: candleActive ? 1 : 0,
    };
    const rows = [
      { type: 'militia', label: unitLabel('militia', this.themeMode), color: '#d8dde6', unlockHint: '' },
      { type: 'necro', label: unitLabel('necro', this.themeMode), color: '#8ff7cc', unlockHint: '' },
      { type: 'gunner', label: unitLabel('gunner', this.themeMode), color: '#ffcc92', unlockHint: '' },
      { type: 'rider', label: unitLabel('rider', this.themeMode), color: '#d7c2a1', unlockHint: '' },
      { type: 'digger', label: unitLabel('digger', this.themeMode), color: '#b79a74', unlockHint: '' },
      { type: 'monk', label: unitLabel('monk', this.themeMode), color: '#cbffb6', unlockHint: '' },
      { type: 'stonegolem', label: unitLabel('stonegolem', this.themeMode), color: '#d2dee8', unlockHint: 'at tower 50% hp' },
      { type: 'shield', label: unitLabel('shield', this.themeMode), color: '#b0d7ff', unlockHint: '' },
      { type: 'hero', label: unitLabel('hero', this.themeMode), color: '#ffe2a0', unlockHint: 'after first hit' },
      { type: 'president', label: unitLabel('president', this.themeMode), color: '#f1c7a2', unlockHint: '' },
      { type: 'balloon', label: unitLabel('balloon', this.themeMode), color: '#bee6f4', unlockHint: 'need BA1 (upgrades after)' },
      { type: 'dragon', label: unitLabel('dragon', this.themeMode), color: '#ff9c7b', unlockHint: 'need DR1' },
      { type: 'super', label: unitLabel('super', this.themeMode), color: '#fff2aa', unlockHint: 'need SU1' },
      { type: 'candle', label: unitLabel('candle', this.themeMode), color: '#ffd7a2', unlockHint: '' },
    ];

    const spawnEvery = this.spawnEveryForSide(sideState);
    const minionCd = Math.max(0, Number(sideState?.minionCd) || 0);
    const specialRollByType = sideState?.specialRollByType && typeof sideState.specialRollByType === 'object'
      ? sideState.specialRollByType
      : {};
    const withCadence = (baseRow) => {
      const cadence = this.barracksCadenceForRow(sideState, baseRow, matchTimeSec);
      const rowWithCadence = {
        ...baseRow,
        ...cadence,
      };
      const cadenceCycleSpawns = Number(cadence.cycleSpawns);
      if (rowWithCadence.unlocked && rowWithCadence.type !== 'militia' && Number.isFinite(cadenceCycleSpawns) && cadenceCycleSpawns > 0) {
        const cadenceRemaining = Number.isFinite(Number(cadence.remainingSpawns))
          ? Math.max(0, Number(cadence.remainingSpawns))
          : cadenceCycleSpawns;
        const derivedInSpawns = Math.max(1, cadenceRemaining);
        rowWithCadence.inSpawns = derivedInSpawns;
        rowWithCadence.etaSec = rowWithCadence.type === 'candle' && rowWithCadence.candleActive
          ? 0
          : (minionCd + Math.max(0, derivedInSpawns - 1) * spawnEvery);
        rowWithCadence.progress = rowWithCadence.type === 'candle' && rowWithCadence.candleActive
          ? 1
          : Math.max(0, Math.min(1, 1 - (cadenceRemaining / cadenceCycleSpawns)));
      }
      return rowWithCadence;
    };

    const builtRows = rows.map((row, index) => {
      const rollChance = this.specialSpawnChanceForRow(sideState, row.type);
      const specialType = ROW_TO_SPECIAL_TYPE[row.type] || null;
      const supportAliveCount = specialType
        ? this.supportAliveCountForSpecialType(activeCountByType, specialType)
        : 0;
      const rollActualChance = specialType
        ? this.specialSpawnActualChanceForType(sideState, specialType, supportAliveCount)
        : rollChance;
      const rollDebuffLoss = Number.isFinite(rollChance) && Number.isFinite(rollActualChance)
        ? Math.max(0, rollChance - rollActualChance)
        : 0;
      const rollDebuffRatio = Number.isFinite(rollChance) && rollChance > 0
        ? Math.max(0, Math.min(1, rollDebuffLoss / rollChance))
        : 0;
      const lastRollEntry = specialType ? specialRollByType[specialType] : null;
      const lastRollSuccess = typeof lastRollEntry?.success === 'boolean' ? lastRollEntry.success : null;
      const lastRollDebuffCausedFail = typeof lastRollEntry?.debuffCausedFail === 'boolean'
        ? lastRollEntry.debuffCausedFail
        : false;
      if (row.type === 'candle') {
        const every = this.trainingEveryForType(sideState, row.type, matchTimeSec);
        const inSpawns = Math.max(1, Math.floor(Number(sideState?.candleSpawnInSpawns) || every));
        const etaSec = candleActive ? 0 : candleCd;
        const cycleSeconds = Math.max(1, this.spawnEveryForSide(sideState) * Math.max(1, every));
        const progress = candleActive ? 1 : Math.max(0, Math.min(1, 1 - etaSec / cycleSeconds));
        const candleRollSuccess = typeof sideState?.candleRollSuccess === 'boolean'
          ? sideState.candleRollSuccess
          : null;
        return withCadence({
          ...row,
          sourceIndex: index,
          level: levelOf[row.type],
          activeCount: activeCountByType[row.type] || 0,
          unlocked: true,
          every,
          inSpawns,
          progress,
          etaSec,
          candleActive,
          rollChance,
          rollActualChance,
          rollDebuffLoss,
          rollDebuffRatio,
          supportAliveCount,
          lastRollSuccess: candleRollSuccess,
          lastRollDebuffCausedFail: false,
        });
      }
      const every = this.trainingEveryForType(sideState, row.type, matchTimeSec);
      const unlocked = Number.isFinite(every);
      const inSpawns = unlocked ? this.trainingInSpawns(sideState, every, specialType) : Infinity;
      const typeProgressValue = specialType && every > 0
        ? sideState?.specialSpawnProgressByType?.[specialType]
        : null;
      const typeProgressNum = typeProgressValue == null ? NaN : Number(typeProgressValue);
      const normalizedTypeProgress = Number.isFinite(typeProgressNum) && every > 0
        ? ((typeProgressNum % every) + every) % every
        : NaN;
      const progress = unlocked && every > 1
        ? (
          Number.isFinite(normalizedTypeProgress)
            ? Math.max(0, Math.min(1, normalizedTypeProgress / every))
            : Math.max(0, Math.min(1, (every - inSpawns) / every))
        )
        : (unlocked ? 1 : 0);
      const etaSec = unlocked
        ? (minionCd + Math.max(0, inSpawns - 1) * spawnEvery)
        : Infinity;
      return withCadence({
        ...row,
        sourceIndex: index,
        level: levelOf[row.type],
        activeCount: activeCountByType[row.type] || 0,
        unlocked,
        every,
        inSpawns,
        progress,
        etaSec,
        rollChance,
        rollActualChance,
        rollDebuffLoss,
        rollDebuffRatio,
        supportAliveCount,
        lastRollSuccess,
        lastRollDebuffCausedFail,
      });
    });
    builtRows.sort((a, b) => {
      if (a.type === 'militia' && b.type !== 'militia') return -1;
      if (b.type === 'militia' && a.type !== 'militia') return 1;
      const aLocked = !a.unlocked && a.type !== 'militia';
      const bLocked = !b.unlocked && b.type !== 'militia';
      if (aLocked !== bLocked) return aLocked ? 1 : -1;
      const aMetric = Number.isFinite(a.sortMetric) ? a.sortMetric : Infinity;
      const bMetric = Number.isFinite(b.sortMetric) ? b.sortMetric : Infinity;
      if (aMetric !== bMetric) return aMetric - bMetric;
      return (a.sourceIndex || 0) - (b.sourceIndex || 0);
    });
    return builtRows;
  }

  barracksUpgradeLevel(sideState, type, base = 0) {
    return Math.max(base, Number(sideState?.[type]) || 0);
  }

  barracksMetaChipsForRow(sideState, row) {
    const s = sideState || {};
    const unit = this.barracksUpgradeLevel(s, 'unitLevel', 1);
    const hp = this.barracksUpgradeLevel(s, 'unitHpLevel', 1);
    const spawn = this.barracksUpgradeLevel(s, 'spawnLevel', 1);
    const power = this.barracksUpgradeLevel(s, 'powerLevel', 1);
    const balloon = this.barracksUpgradeLevel(s, 'balloonLevel', 0);
    const dragon = this.barracksUpgradeLevel(s, 'dragonLevel', 0);
    const dragonBreath = this.barracksUpgradeLevel(s, 'dragonSuperBreathLevel', 0);
    const sup = this.barracksUpgradeLevel(s, 'superMinionLevel', 0);
    const chips = [];
    const addChip = (text, category = 'misc', dim = false) => {
      chips.push({
        kind: 'text',
        text,
        category,
        dim,
      });
    };
    const addBaseChip = (parts, dim = false) => {
      chips.push({
        kind: 'stats',
        parts,
        dim,
      });
    };
    const addGlyphChip = (glyphType, active = false, category = 'special', text = '') => {
      if (!active) return;
      chips.push({
        kind: 'glyph',
        glyphType,
        active,
        text,
        category,
        dim: !active,
      });
    };

    switch (row?.type) {
      case 'militia':
        addBaseChip([
          { type: 'unitLevel', label: 'AT', value: unit },
          { type: 'unitHpLevel', label: 'HP', value: hp },
        ]);
        break;
      case 'necro':
        addBaseChip([
          { type: 'unitLevel', label: 'AT', value: unit },
          { type: 'unitHpLevel', label: 'HP', value: hp },
        ]);
        addGlyphChip('necroExpertSummonerLevel', this.barracksUpgradeLevel(s, 'necroExpertSummonerLevel', 0) > 0);
        addChip(`Lvl ${this.barracksUpgradeLevel(s, 'necroExpertSummonerLevel', 0)}`, 'special');
        break;
      case 'gunner':
        addBaseChip([
          { type: 'powerLevel', label: 'PW', value: power },
          { type: 'unitLevel', label: 'AT', value: unit },
        ]);
        addGlyphChip('gunnerSkyCannonLevel', this.barracksUpgradeLevel(s, 'gunnerSkyCannonLevel', 0) > 0);
        addChip(`Lvl ${this.barracksUpgradeLevel(s, 'gunnerSkyCannonLevel', 0)}`, 'special');
        break;
      case 'rider':
        addBaseChip([
          { type: 'unitLevel', label: 'AT', value: unit },
          { type: 'unitHpLevel', label: 'HP', value: hp },
        ]);
        addGlyphChip('riderSuperHorseLevel', this.barracksUpgradeLevel(s, 'riderSuperHorseLevel', 0) > 0);
        addChip(`Lvl ${this.barracksUpgradeLevel(s, 'riderSuperHorseLevel', 0)}`, 'special');
        break;
      case 'digger':
        addBaseChip([
          { type: 'unitLevel', label: 'AT', value: unit },
          { type: 'unitHpLevel', label: 'HP', value: hp },
        ]);
        addGlyphChip('diggerGoldFinderLevel', this.barracksUpgradeLevel(s, 'diggerGoldFinderLevel', 0) > 0);
        addChip(`Lvl ${this.barracksUpgradeLevel(s, 'diggerGoldFinderLevel', 0)}`, 'special');
        break;
      case 'monk':
        addBaseChip([
          { type: 'unitHpLevel', label: 'HP', value: hp },
          { type: 'powerLevel', label: 'PW', value: power },
        ]);
        addGlyphChip('monkHealCircleLevel', this.barracksUpgradeLevel(s, 'monkHealCircleLevel', 0) > 0);
        addChip(`Lvl ${this.barracksUpgradeLevel(s, 'monkHealCircleLevel', 0)}`, 'special');
        break;
      case 'stonegolem':
        addBaseChip([
          { type: 'unitHpLevel', label: 'HP', value: hp },
          { type: 'powerLevel', label: 'PW', value: power },
        ]);
        addChip(
          this.stoneGolemSpawnUnlocked(s) ? 'Gate open' : 'Gate 50% tower',
          this.stoneGolemSpawnUnlocked(s) ? 'special' : 'misc',
          !this.stoneGolemSpawnUnlocked(s)
        );
        break;
      case 'shield':
        addBaseChip([
          { type: 'unitHpLevel', label: 'HP', value: hp },
          { type: 'powerLevel', label: 'PW', value: power },
        ]);
        addGlyphChip('shieldDarkMetalLevel', this.barracksUpgradeLevel(s, 'shieldDarkMetalLevel', 0) > 0);
        addChip(`Lvl ${this.barracksUpgradeLevel(s, 'shieldDarkMetalLevel', 0)}`, 'special');
        break;
      case 'hero':
        addBaseChip([
          { type: 'unitLevel', label: 'AT', value: unit },
          { type: 'powerLevel', label: 'PW', value: power },
        ]);
        addChip(s.towerDamagedOnce ? 'Gate open' : 'Gate first hit', s.towerDamagedOnce ? 'special' : 'misc', !s.towerDamagedOnce);
        break;
      case 'president':
        addBaseChip([
          { type: 'unitHpLevel', label: 'HP', value: hp },
          { type: 'powerLevel', label: 'PW', value: power },
        ]);
        addGlyphChip('presidentExecutiveOrderLevel', this.barracksUpgradeLevel(s, 'presidentExecutiveOrderLevel', 0) > 0);
        addChip(`Lvl ${this.barracksUpgradeLevel(s, 'presidentExecutiveOrderLevel', 0)}`, 'special');
        break;
      case 'balloon':
        addBaseChip([
          { type: 'balloonLevel', label: 'BA', value: balloon },
        ], balloon <= 0);
        addChip(`Spawn SP${spawn}`, 'misc');
        break;
      case 'dragon':
        addGlyphChip('dragonSuperBreathLevel', dragonBreath > 0);
        addChip(`Lvl ${dragon}`, 'special', dragon <= 0);
        break;
      case 'super':
        addBaseChip([
          { type: 'unitLevel', label: 'AT', value: unit },
          { type: 'unitHpLevel', label: 'HP', value: hp },
        ]);
        addChip(`Lvl ${sup}`, 'special', sup <= 0);
        break;
      case 'candle':
        addBaseChip([
          { type: 'powerLevel', label: 'PW', value: power },
          { type: 'spawnLevel', label: 'SP', value: spawn },
        ]);
        break;
      default:
        break;
    }

    return chips;
  }

  drawBarracksMetaChips(x, y, maxWidth, chips = [], options = null) {
    const { ctx } = this;
    if (!Array.isArray(chips) || !chips.length || maxWidth <= 8) return;
    const compact = Boolean(options && options.compact);
    const chipH = compact ? 8 : 10;
    const chipHalfH = chipH * 0.5;
    const chipGap = compact ? 3 : 4;
    const glyphOnlyW = compact ? 10 : 14;
    const chipInsetX = compact ? 3 : 4;
    const glyphPadW = compact ? 12 : 20;
    const statsLeadLabel = compact ? 'B' : 'Base';
    const statsLeadPad = compact ? 4 : 6;
    const statsPartPad = compact ? 6 : 9;
    const textYOffset = compact ? -0.1 : 0;
    ctx.save();
    ctx.font = compact ? '7px sans-serif' : '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let cx = x;
    const right = x + maxWidth;
    for (const chip of chips) {
      const category = chip?.category || 'misc';
      const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
      const text = typeof chip?.text === 'string' ? chip.text : '';
      const glyphOnly = chip?.kind === 'glyph' && !text;
      let chipW = glyphOnly
        ? glyphOnlyW
        : Math.ceil(ctx.measureText(text).width) + (chip?.kind === 'glyph' ? glyphPadW : (compact ? 6 : 8));
      if (chip?.kind === 'stats') {
        chipW = (compact ? 8 : 10) + Math.ceil(ctx.measureText(statsLeadLabel).width);
        const parts = Array.isArray(chip.parts) ? chip.parts : [];
        for (const part of parts) {
          const partLabel = `${part?.label ?? ''}`;
          const partValue = `${part?.value ?? ''}`;
          chipW += Math.ceil(ctx.measureText(partLabel).width);
          chipW += Math.ceil(ctx.measureText(partValue).width) + statsPartPad;
        }
      }
      if (cx + chipW > right) break;
      const fillAlpha = chip?.dim ? 0.7 : 0.92;
      const borderAlpha = chip?.dim ? 0.36 : 0.58;
      const textColor = chip?.dim ? '#cbb8a8' : style.title;
      const panelColor = chip?.kind === 'stats' ? '#141b27' : style.panel;
      const borderColor = chip?.kind === 'stats' ? '#4d5d78' : style.border;
      ctx.fillStyle = this.withAlpha(panelColor, fillAlpha);
      ctx.fillRect(cx, y - chipHalfH, chipW, chipH);
      ctx.strokeStyle = this.withAlpha(borderColor, borderAlpha);
      ctx.lineWidth = compact ? 0.7 : 0.8;
      ctx.strokeRect(cx + 0.5, y - chipHalfH + 0.5, chipW - 1, chipH - 1);
      if (chip?.kind === 'glyph' && chip?.glyphType) {
        ctx.save();
        ctx.globalAlpha = chip?.dim ? 0.58 : 1;
        this.drawUpgradeGlyph(chip.glyphType, cx + (compact ? 5 : 7), y + textYOffset, compact ? 3.4 : 4.2, chip?.dim ? '#cbb8a8' : style.title);
        ctx.restore();
        if (!chip?.active) {
          ctx.strokeStyle = this.withAlpha('#f2b0a4', 0.8);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx + (compact ? 2.6 : 3.5), y + (compact ? 2.8 : 3.5));
          ctx.lineTo(cx + (compact ? 7.4 : 10.5), y - (compact ? 2.8 : 3.5));
          ctx.stroke();
        }
      }
      if (chip?.kind === 'stats') {
        let tx = cx + chipInsetX;
        ctx.fillStyle = chip?.dim ? '#aeb7c6' : '#d9e1ee';
        ctx.fillText(statsLeadLabel, tx, y + textYOffset);
        tx += Math.ceil(ctx.measureText(statsLeadLabel).width) + statsLeadPad;
        const parts = Array.isArray(chip.parts) ? chip.parts : [];
        for (const part of parts) {
          const partStyle = UPGRADE_CATEGORY_STYLE[upgradeCategory(part?.type)] || UPGRADE_CATEGORY_STYLE.misc;
          const label = `${part?.label ?? ''}`;
          const value = `${part?.value ?? ''}`;
          ctx.fillStyle = chip?.dim ? '#aeb7c6' : (partStyle.badge || partStyle.title);
          ctx.fillText(label, tx, y + textYOffset);
          tx += Math.ceil(ctx.measureText(label).width);
          ctx.fillStyle = chip?.dim ? '#d8dee9' : '#f4f7ff';
          ctx.fillText(value, tx, y + textYOffset);
          tx += Math.ceil(ctx.measureText(value).width) + (compact ? 4 : 6);
        }
      } else if (text) {
        ctx.fillStyle = textColor;
        ctx.fillText(text, cx + (chip?.kind === 'glyph' ? (compact ? 10 : 16) : chipInsetX), y + textYOffset);
      }
      cx += chipW + chipGap;
    }
    ctx.restore();
  }

  nextBarracksDoorPreviewRow(rows = []) {
    let bestRow = null;
    let bestEta = Infinity;
    let bestInSpawns = Infinity;
    let bestPriority = Infinity;
    for (const row of rows) {
      if (!row || !row.unlocked || row.type === 'militia' || row.type === 'candle') continue;
      const specialType = ROW_TO_SPECIAL_TYPE[row.type] || null;
      if (!specialType) continue;
      const eta = Number.isFinite(row.etaSec) ? Math.max(0, row.etaSec) : Infinity;
      const inSpawns = Number.isFinite(row.inSpawns) ? Math.max(0, row.inSpawns) : Infinity;
      const priority = SPECIAL_SPAWN_QUEUE_PRIORITY[specialType] ?? Number.MAX_SAFE_INTEGER;
      if (
        eta < bestEta
        || (eta === bestEta && inSpawns < bestInSpawns)
        || (eta === bestEta && inSpawns === bestInSpawns && priority < bestPriority)
      ) {
        bestRow = row;
        bestEta = eta;
        bestInSpawns = inSpawns;
        bestPriority = priority;
      }
    }
    return bestRow;
  }

  barracksDoorScaleForType(specialType, actorMode = false) {
    const base = specialType === 'balloon'
      ? 0.26
      : (specialType === 'dragon' ? 0.28 : (specialType === 'stonegolem' ? 0.34 : 0.4));
    return actorMode && specialType === 'super' ? base * 0.95 : base;
  }

  barracksDoorSpriteY(doorY, doorH, specialType) {
    if (specialType === 'balloon') return doorY + doorH - 1;
    if (specialType === 'dragon') return doorY + doorH - 7;
    return doorY + doorH - 5;
  }

  barracksRowForSpecialType(rows = [], specialType = null) {
    if (!specialType) return null;
    for (const row of rows) {
      if ((ROW_TO_SPECIAL_TYPE[row?.type] || null) === specialType) return row;
    }
    return null;
  }

  updateBarracksDoorActors(snapshot, barracksUi = null, dt = 0) {
    const sideNames = ['left', 'right'];
    if (!this.barracksDoorStatePrimed) {
      for (const side of sideNames) {
        const sideState = snapshot?.[side] || null;
        const rollType = typeof sideState?.specialRollType === 'string' ? sideState.specialRollType : null;
        const rollSuccess = typeof sideState?.specialRollSuccess === 'boolean' ? sideState.specialRollSuccess : null;
        const rollChance = Number(sideState?.specialRollChance);
        const rollValue = Number(sideState?.specialRollValue);
        this.prevBarracksRollState[side] = {
          ttl: Math.max(0, Number(sideState?.specialRollTtl) || 0),
          key: rollType && rollSuccess != null
            ? `${rollType}:${rollSuccess ? 1 : 0}:${Number.isFinite(rollChance) ? rollChance.toFixed(4) : 'n'}:${Number.isFinite(rollValue) ? rollValue.toFixed(4) : 'n'}`
            : '',
        };
      }
      this.barracksDoorStatePrimed = true;
      return;
    }

    for (const side of sideNames) {
      const actor = this.barracksDoorActors[side];
      if (actor) {
        actor.age += Math.max(0, Number(dt) || 0);
        if (actor.age >= actor.duration) this.barracksDoorActors[side] = null;
      }

      const sideState = snapshot?.[side] || null;
      const rollTtl = Math.max(0, Number(sideState?.specialRollTtl) || 0);
      const rollType = typeof sideState?.specialRollType === 'string' ? sideState.specialRollType : null;
      const rollSuccess = typeof sideState?.specialRollSuccess === 'boolean' ? sideState.specialRollSuccess : null;
      const rollChance = Number(sideState?.specialRollChance);
      const rollValue = Number(sideState?.specialRollValue);
      const rollKey = rollType && rollSuccess != null
        ? `${rollType}:${rollSuccess ? 1 : 0}:${Number.isFinite(rollChance) ? rollChance.toFixed(4) : 'n'}:${Number.isFinite(rollValue) ? rollValue.toFixed(4) : 'n'}`
        : '';
      const prev = this.prevBarracksRollState[side] || { ttl: 0, key: '' };
      const freshRoll = Boolean(
        rollType
        && rollSuccess != null
        && rollTtl > 0
        && (rollTtl > prev.ttl + 0.35 || (rollTtl >= 5.7 && rollKey && rollKey !== prev.key))
      );
      if (freshRoll) {
        const row = this.barracksRowForSpecialType(barracksUi?.[side]?.rows, rollType);
        this.barracksDoorActors[side] = {
          side,
          type: rollType,
          level: Math.max(1, Number(row?.level) || 1),
          success: Boolean(rollSuccess),
          age: 0,
          duration: rollSuccess ? 0.92 : 1.16,
          seed: Math.random() * 1000,
        };
      }
      this.prevBarracksRollState[side] = { ttl: rollTtl, key: rollKey };
    }
  }

  drawBarracksDoorActor(doorX, doorY, doorW, doorH, actor, side = 'left', actorBounds = null) {
    const specialType = typeof actor?.type === 'string' ? actor.type : null;
    const mini = this.miniFailedSpecialMinion(specialType, side, actor?.level);
    if (!mini) return;

    const { ctx } = this;
    const dir = side === 'left' ? 1 : -1;
    const progress = clamp01(actor.age / Math.max(0.001, Number(actor.duration) || 1));
    const scale = this.barracksDoorScaleForType(specialType, true);
    const spriteBaseX = doorX + doorW * 0.5;
    const spriteBaseY = this.barracksDoorSpriteY(doorY, doorH, specialType);
    const stride = Math.abs(Math.sin(actor.age * (actor.success ? 20 : 17) + actor.seed * 0.13));
    const frontY = Number.isFinite(actorBounds?.frontY) ? actorBounds.frontY : spriteBaseY;
    let offsetX = 0;
    let offsetY = stride * 0.9;
    let alpha = 1;
    let tilt = 0;
    let squashX = 1;
    let squashY = 1;
    let flip = false;

    if (actor.success) {
      const runP = easeOutCubic(progress / 0.86);
      const settleP = clamp01((progress - 0.66) / 0.34);
      offsetX = dir * lerp(-2, 60, runP);
      offsetY = lerp(0, frontY - spriteBaseY, runP) + Math.sin(runP * Math.PI * 3.4) * 0.35 + stride * 0.7;
      alpha = 1 - settleP * 0.18;
      tilt = dir * (0.05 + Math.sin(runP * Math.PI) * 0.03);
      squashX = 1 + stride * 0.03;
      squashY = 1 - stride * 0.02;
    } else {
      const runP = easeInCubic(progress);
      offsetX = -dir * lerp(0, 76, runP);
      offsetY = lerp(0, 3, runP) + stride * 0.72;
      alpha = 1 - clamp01((progress - 0.68) / 0.32);
      flip = true;
      tilt = -dir * (0.08 + runP * 0.08);
      squashX = 1 + stride * 0.035;
      squashY = 1 - stride * 0.026;
    }

    const spriteX = spriteBaseX + offsetX;
    const spriteY = spriteBaseY + offsetY;
    mini.x = spriteX;
    mini.y = spriteY;
    mini.speed = actor.success ? 96 : 84;
    mini.id = Math.round(actor.seed * 1000);

    const shadowW = Math.max(6, 24 * scale);
    const shadowH = Math.max(2.2, 8 * scale);

    ctx.save();
    const clipX = Number.isFinite(actorBounds?.clipX) ? actorBounds.clipX : (doorX - 14);
    const clipY = Number.isFinite(actorBounds?.clipY) ? actorBounds.clipY : (doorY + 1);
    const clipW = Number.isFinite(actorBounds?.clipW) ? actorBounds.clipW : (doorW + 28);
    const clipH = Number.isFinite(actorBounds?.clipH) ? actorBounds.clipH : (doorH + 8);
    ctx.beginPath();
    ctx.rect(clipX, clipY, clipW, clipH);
    ctx.clip();
    ctx.globalAlpha = clamp01(alpha);
    ctx.fillStyle = this.withAlpha('#000000', actor.success ? 0.16 : 0.14);
    ctx.beginPath();
    ctx.ellipse(spriteX, doorY + doorH - 1.5, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(spriteX, spriteY);
    if (flip) ctx.scale(-1, 1);
    ctx.rotate(tilt);
    ctx.scale(scale * squashX, scale * squashY);
    ctx.translate(-spriteX, -spriteY);
    this.drawMinionSprite(mini, { showHud: false, allowEffects: false });
    ctx.restore();
  }

  drawBarracksDoorPreview(doorX, doorY, doorW, doorH, row, side = 'left', actor = null, actorBounds = null) {
    const { ctx } = this;
    ctx.fillStyle = '#151e2e';
    ctx.fillRect(doorX, doorY, doorW, doorH);
    ctx.fillStyle = '#090d15';
    ctx.fillRect(doorX + 1, doorY + doorH - 4, doorW - 2, 3);
    if (actor) {
      this.drawBarracksDoorActor(doorX, doorY, doorW, doorH, actor, side, actorBounds);
      return;
    }
    if (!row) return;

    const specialType = ROW_TO_SPECIAL_TYPE[row.type] || null;
    if (!specialType) return;
    const mini = this.miniFailedSpecialMinion(specialType, side, row.level);
    if (!mini) return;

    const now = performance.now() * 0.001;
    const bob = Math.sin(now * 2.2 + (side === 'right' ? 1.7 : 0.4)) * 0.8;
    const scale = this.barracksDoorScaleForType(specialType);
    const spriteX = doorX + doorW * 0.5;
    const spriteY = this.barracksDoorSpriteY(doorY, doorH, specialType);

    ctx.save();
    ctx.beginPath();
    ctx.rect(doorX + 1, doorY + 1, doorW - 2, doorH - 2);
    ctx.clip();
    ctx.translate(spriteX, spriteY + bob);
    ctx.scale(scale, scale);
    ctx.translate(-spriteX, -spriteY);
    mini.x = spriteX;
    mini.y = spriteY;
    this.drawMinionSprite(mini, { showHud: false, allowEffects: false });
    ctx.restore();
  }

  drawBarracksBuilding(side, world, barracksUi = null) {
    const { ctx } = this;
    const sidePalette = TEAM_COLORS[side] || TEAM_COLORS.left;
    const towerX = side === 'right' ? (Number(world?.towerRightX) || 0) : (Number(world?.towerLeftX) || 0);
    const towerY = Number(world?.towerY) || 0;
    const bx = towerX;
    const by = towerY + 148;
    const bodyW = 76;
    const bodyH = 58;
    const doorW = 24;
    const doorH = 32;

    ctx.fillStyle = side === 'left' ? '#213650e8' : '#4a2830e8';
    ctx.fillRect(bx - bodyW / 2, by - bodyH, bodyW, bodyH);
    ctx.strokeStyle = sidePalette.dark;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx - bodyW / 2, by - bodyH, bodyW, bodyH);
    ctx.fillStyle = side === 'left' ? '#304d70f2' : '#633541f2';
    ctx.fillRect(bx - bodyW / 2 + 5, by - bodyH + 6, bodyW - 10, bodyH - 12);
    ctx.strokeStyle = this.withAlpha('#f3e4bf', 0.28);
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - bodyW / 2 + 9, by - bodyH + 11, bodyW - 18, bodyH - 22);
    const actorClipPaddingNear = 44;
    const actorClipPaddingFar = 94;
    const actorClipX = side === 'left'
      ? bx - bodyW / 2 - actorClipPaddingNear
      : bx - bodyW / 2 - actorClipPaddingFar;
    const actorClipW = bodyW + actorClipPaddingNear + actorClipPaddingFar;
    this.drawBarracksDoorPreview(
      bx - doorW / 2,
      by - doorH,
      doorW,
      doorH,
      barracksUi?.doorPreviewRow || null,
      side,
      this.barracksDoorActors[side] || null,
      {
        clipX: actorClipX,
        clipY: by - bodyH - 4,
        clipW: actorClipW,
        clipH: bodyH + 18,
        frontY: by - 5,
      }
    );

    ctx.fillStyle = '#f5e6b9';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sideBarracksLabel(side, this.themeMode), bx, by - bodyH + 14);
  }

  drawBarracks(side, sideState, world, snapshot = null, precomputedCounts = null) {
    const { ctx } = this;
    const sidePalette = TEAM_COLORS[side] || TEAM_COLORS.left;
    const failType = typeof sideState?.specialFailType === 'string' ? sideState.specialFailType : null;
    const failTtl = Math.max(0, Number(sideState?.specialFailTtl) || 0);
    const rollType = typeof sideState?.specialRollType === 'string' ? sideState.specialRollType : null;
    const rollSuccess = typeof sideState?.specialRollSuccess === 'boolean' ? sideState.specialRollSuccess : null;
    const rollDisplayChanceRaw = sideState?.specialRollDisplayChance;
    const rollChanceRaw = sideState?.specialRollChance;
    const rollChance = rollChanceRaw == null ? NaN : Number(rollChanceRaw);
    const rollDisplayChance = rollDisplayChanceRaw == null
      ? rollChance
      : Number(rollDisplayChanceRaw);
    const rollDebuffLoss = Math.max(0, Number(sideState?.specialRollDebuffLoss) || 0);
    const rollDebuffCausedFail = Boolean(sideState?.specialRollDebuffCausedFail);
    const rollValueRaw = sideState?.specialRollValue;
    const rollValue = rollValueRaw == null ? NaN : Number(rollValueRaw);
    const matchTimeSec = Math.max(0, Number(snapshot?.t) || 0);
    const rows = this.barracksRows(
      sideState,
      side,
      snapshot?.minions,
      Array.isArray(snapshot?.candles)
        ? snapshot.candles
        : (snapshot?.candle ? [snapshot.candle] : []),
      precomputedCounts,
      matchTimeSec
    );
    if (matchTimeSec <= 0.25) this.clearBarracksCadenceDeltaStateForSide(side);
    const nowMs = performance.now();
    this.updateBarracksCadenceDeltaFxForRows(side, rows, nowMs);
    const doorPreviewRow = this.nextBarracksDoorPreviewRow(rows);
    const panelW = 428;
    const rowH = 18;
    const rowStartY = 76;
    const panelH = rowStartY + rows.length * rowH + 12;
    const panelX = side === 'left' ? 350 : world.w - 350;
    const panelBottomPad = 10;
    const viewportBottom = Number(world?.h) || Number(world?.groundY) || 0;
    const panelY = Math.max(8, viewportBottom - panelH - panelBottomPad);

    // Training board.
    const px = panelX - panelW / 2;
    const py = panelY;

    ctx.fillStyle = '#0f1625d0';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = this.withAlpha(sidePalette.primary, 0.72);
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    ctx.fillStyle = '#f1e3b4';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sideBarracksLabel(side, this.themeMode), px + panelW / 2, py + 15);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#bac7da';
    ctx.font = '9px sans-serif';
    ctx.fillText(
      `Spawn L${Math.max(1, Number(sideState?.spawnLevel) || 1)} | Unit L${Math.max(1, Number(sideState?.unitLevel) || 1)} | HP L${Math.max(1, Number(sideState?.unitHpLevel) || 1)}`,
      px + 10,
      py + 28
    );
    if (
      rollType
      && Number.isFinite(rollChance)
      && Number.isFinite(rollDisplayChance)
      && Number.isFinite(rollValue)
      && rollSuccess != null
    ) {
      const statusTag = rollSuccess ? '[SUCCESS]' : '[FAIL]';
      ctx.fillStyle = rollSuccess ? '#97f2c2' : (rollDebuffCausedFail ? '#f09a2f' : '#ffb9a9');
      ctx.fillText(
        `Last roll ${statusTag} ${this.failedSpecialLabel(rollType)}`,
        px + 10,
        py + 48
      );
      this.drawSpecialRollOutcomeBar(
        px + 10,
        py + 52,
        panelW - 52,
        9,
        rollDisplayChance,
        rollChance,
        rollDebuffLoss,
        rollValue,
        rollSuccess
      );
      this.drawSpecialRollTypeBadge(rollType, px + panelW - 20, py + 56, side);
    } else {
      const fallbackText = failType && failTtl > 0
        ? `Last fail: ${this.failedSpecialLabel(failType)} (${Math.ceil(failTtl)}s)`
        : 'Last roll: waiting on first special attempt';
      ctx.fillStyle = '#8ea2bf';
      ctx.fillText(
        fallbackText,
        px + 10,
        py + 48
      );
      this.drawSpecialRollOutcomeBar(px + 10, py + 52, panelW - 52, 9, null, null, null, null, null);
      if (failType && failTtl > 0) this.drawSpecialRollTypeBadge(failType, px + panelW - 20, py + 56, side);
    }

    const countX = px + 10;
    const colLabelX = px + 34;
    const chipX = px + 82;
    const chipW = 70;
    const barX = px + 160;
    const barW = 124;
    const barH = 9;
    const resultX = px + 292;
    const resultW = 46;
    const baseSpeedX = px + 346;
    const baseChanceX = px + 390;
    const headerY = py + rowStartY - 8;
    const speedRows = rows.filter((row) => (
      row?.unlocked
      && Number.isFinite(Number(row?.baseCycleSeconds))
      && Number(row.baseCycleSeconds) > 0
    ));
    let baseSpeedMin = Infinity;
    let baseSpeedMax = 0;
    for (const row of speedRows) {
      const sec = Number(row.baseCycleSeconds);
      if (!Number.isFinite(sec) || sec <= 0) continue;
      baseSpeedMin = Math.min(baseSpeedMin, sec);
      baseSpeedMax = Math.max(baseSpeedMax, sec);
    }
    const speedRangeValid = Number.isFinite(baseSpeedMin)
      && Number.isFinite(baseSpeedMax)
      && baseSpeedMax > baseSpeedMin;

    ctx.fillStyle = '#7f93b1';
    ctx.font = 'bold 6px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('#', countX, headerY);
    ctx.textAlign = 'left';
    ctx.fillText('UNIT', colLabelX, headerY);
    ctx.textAlign = 'center';
    ctx.fillText('SPAWN', barX + barW * 0.5, headerY);
    ctx.fillText('ROLL', resultX + resultW * 0.5, headerY);
    ctx.fillText('BASE SPD', baseSpeedX, headerY);
    ctx.fillText('BASE %', baseChanceX, headerY);

    ctx.strokeStyle = '#2f415b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(barX - 8, py + rowStartY - 2);
    ctx.lineTo(barX - 8, py + panelH - 10);
    ctx.moveTo(resultX - 8, py + rowStartY - 2);
    ctx.lineTo(resultX - 8, py + panelH - 10);
    ctx.moveTo(baseSpeedX - 26, py + rowStartY - 2);
    ctx.lineTo(baseSpeedX - 26, py + panelH - 10);
    ctx.moveTo(baseChanceX - 22, py + rowStartY - 2);
    ctx.lineTo(baseChanceX - 22, py + panelH - 10);
    ctx.stroke();

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const ry = py + rowStartY + i * rowH;
      const lineY = ry + rowH * 0.56;
      const barY = Math.round(ry + rowH * 0.5 - barH * 0.5);
      const isLockedRow = !row.unlocked && row.type !== 'militia' && row.type !== 'candle';
      const rowBg = isLockedRow
        ? (i % 2 === 0 ? '#161c29e2' : '#0f1826e2')
        : (i % 2 === 0 ? '#1a2943cf' : '#13213acf');
      const labelColor = isLockedRow ? '#b8b0a8' : '#eaf0fc';

      ctx.fillStyle = rowBg;
      ctx.fillRect(px + 6, ry, panelW - 12, rowH - 1);

      const rowGlyph = BARRACKS_ROW_GLYPH_BY_TYPE[row.type] || 'unitLevel';
      const iconX = px + 22;
      const iconY = ry + rowH * 0.52;
      this.drawBarracksRowGlyph(row.type, rowGlyph, iconX, iconY, 5.8, '#1f2230');

      const active = Math.max(0, Number(row.activeCount) || 0);
      ctx.fillStyle = active > 0 ? '#f3e7c2' : '#7f8ba0';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(active), countX, lineY);

      ctx.fillStyle = labelColor;
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      const rowLabelText = row.label;
      const fittedRowLabel = this.fitUpgradeCardText(
        rowLabelText,
        Math.max(18, chipX - colLabelX - 6),
        '9px sans-serif'
      );
      ctx.fillText(fittedRowLabel, colLabelX, lineY);

      let rowStatusTag = 'WAIT';
      let rowStatusColor = '#9da8ba';
      if (isLockedRow) {
        rowStatusTag = 'LOCK';
        rowStatusColor = '#d8b59d';
      } else if (row.lastRollSuccess === true) {
        rowStatusTag = 'SUCCESS';
        rowStatusColor = '#8affcf';
      } else if (row.lastRollSuccess === false) {
        rowStatusTag = 'FAIL';
        rowStatusColor = row.lastRollDebuffCausedFail ? '#f09a2f' : '#ffb9a9';
      } else if (row.candleActive || row.every <= 1) {
        rowStatusTag = 'READY';
        rowStatusColor = '#ffe8a6';
      }
      if (rowStatusTag) {
        const statusMaxW = Math.max(24, resultW);
        const fittedStatusText = this.fitUpgradeCardText(
          rowStatusTag,
          statusMaxW,
          '7px sans-serif'
        );
        ctx.fillStyle = rowStatusColor;
        ctx.font = '7px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(fittedStatusText, resultX, lineY);
      }

      const chanceValue = Number.isFinite(row.rollActualChance)
        ? row.rollActualChance
        : (Number.isFinite(row.rollChance)
          ? row.rollChance
          : (row.type === 'militia' ? 1 : null));
      const chanceText = chanceValue == null ? '--' : `${Math.round(chanceValue * 100)}%`;
      const countdownText = row.unlocked ? this.barracksCountdownText(row.etaSec) : '--';
      const spawnText = `${countdownText} ${chanceText}`;
      const fittedSpawnText = this.fitUpgradeCardText(spawnText, Math.max(26, barW - 8), 'bold 7px sans-serif');

      const cadenceDeltaFx = this.barracksCadenceDeltaFxForRow(side, row.type, nowMs);
      if (cadenceDeltaFx && row.unlocked && row.type !== 'militia') {
        const deltaSeconds = Number(cadenceDeltaFx.deltaSeconds);
        const absDelta = Math.abs(deltaSeconds);
        const signedText = `${deltaSeconds < 0 ? '-' : '+'}${this.barracksCompactSeconds(absDelta)}`;
        ctx.save();
        ctx.globalAlpha = clamp01(cadenceDeltaFx.alpha);
        ctx.fillStyle = deltaSeconds < 0 ? '#86f3bf' : '#ffb9a9';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(signedText, barX + barW - 2, lineY - 7 + cadenceDeltaFx.yShift);
        ctx.restore();
      }

      ctx.fillStyle = '#1f2940';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = row.unlocked ? this.withAlpha(sidePalette.primary, 0.95) : '#6f7688';
      ctx.fillRect(barX, barY, barW * row.progress, barH);
      if (row.unlocked && row.supportAliveCount > 0 && row.rollDebuffRatio > 0) {
        const debuffW = barW * Math.max(0, Math.min(1, Number(row.rollDebuffRatio) || 0));
        if (debuffW > 0.25) {
          const debuffX = barX + barW - debuffW;
          ctx.fillStyle = '#f09a2f';
          ctx.fillRect(debuffX, barY, debuffW, barH);
          ctx.strokeStyle = '#ffd09d';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(debuffX + 0.5, barY);
          ctx.lineTo(debuffX + 0.5, barY + barH);
          ctx.stroke();
        }
      }

      ctx.fillStyle = row.unlocked ? '#dce9ff' : '#a4afbe';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fittedSpawnText, barX + barW * 0.5, barY + barH * 0.5 + 0.2);

      const baseSpeedSeconds = Number(row.baseCycleSeconds);
      const baseSpeedText = Number.isFinite(baseSpeedSeconds) && baseSpeedSeconds > 0
        ? this.barracksCompactSeconds(baseSpeedSeconds)
        : '--';
      const baseSpeedNorm = Number.isFinite(baseSpeedSeconds) && baseSpeedSeconds > 0
        ? (
          speedRangeValid
            ? clamp01(1 - ((baseSpeedSeconds - baseSpeedMin) / Math.max(0.0001, baseSpeedMax - baseSpeedMin)))
            : 0.5
        )
        : 0.5;
      const baseSpeedColor = Number.isFinite(baseSpeedSeconds) && baseSpeedSeconds > 0
        ? this.barracksHeatColor(baseSpeedNorm, row.unlocked ? 0.96 : 0.6)
        : '#7f8ba0';
      ctx.fillStyle = baseSpeedColor;
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(baseSpeedText, baseSpeedX, lineY);

      const baseChanceValue = Number.isFinite(row.rollChance)
        ? clamp01(row.rollChance)
        : (row.type === 'militia' ? 1 : null);
      const baseChanceText = baseChanceValue == null ? '--' : `${Math.round(baseChanceValue * 100)}%`;
      const baseChanceColor = baseChanceValue == null
        ? '#7f8ba0'
        : this.barracksHeatColor(baseChanceValue, row.unlocked ? 0.96 : 0.6);
      ctx.fillStyle = baseChanceColor;
      ctx.fillText(baseChanceText, baseChanceX, lineY);

      this.drawBarracksMetaChips(
        chipX,
        lineY,
        chipW,
        this.barracksMetaChipsForRow(sideState, row),
        { compact: true }
      );
    }

    ctx.strokeStyle = '#f2e4b24a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 8, py + panelH - 9);
    ctx.lineTo(px + panelW - 8, py + panelH - 9);
    ctx.stroke();
    // Removed: Training cadence by spawn cycle label (not useful)
    // ctx.fillStyle = '#aeb9ca';
    // ctx.font = '8px sans-serif';
    // ctx.textAlign = 'left';
    // ctx.fillText('Training cadence by spawn cycle', px + 10, py + panelH - 3);
    return { rows, doorPreviewRow };
  }

  drawSpecialRollOutcomeBar(x, y, w, h, displayChance, actualChance, debuffLoss, roll, success) {
    const { ctx } = this;
    const displayClamped = Number.isFinite(displayChance) ? Math.max(0, Math.min(1, displayChance)) : null;
    const actualRaw = Number.isFinite(actualChance) ? Math.max(0, Math.min(1, actualChance)) : displayClamped;
    const actualClamped = displayClamped == null
      ? null
      : Math.max(0, Math.min(displayClamped, Number(actualRaw)));
    const debuffLossClamped = Number.isFinite(debuffLoss)
      ? Math.max(0, Math.min(1, Number(debuffLoss) || 0))
      : 0;
    const rollClamped = Number.isFinite(roll) ? Math.max(0, Math.min(1, roll)) : null;

    ctx.fillStyle = '#162133';
    ctx.fillRect(x, y, w, h);

    if (displayClamped == null || actualClamped == null) {
      ctx.strokeStyle = '#2b3a56';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#73839f';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No roll yet', x + w * 0.5, y + h - 1);
      return;
    }

    const shownX = x + w * displayClamped;
    const actualX = x + w * actualClamped;
    ctx.fillStyle = '#6e2b34';
    ctx.fillRect(x, y, w, h);
    if (actualX > x) {
      ctx.fillStyle = '#2d784f';
      ctx.fillRect(x, y, Math.max(0, actualX - x), h);
    }
    const debuffZoneW = Math.max(0, shownX - actualX);
    if (debuffZoneW > 0.2) {
      ctx.fillStyle = '#e38b2c';
      ctx.fillRect(actualX, y, debuffZoneW, h);
    }

    ctx.strokeStyle = '#f4f8ffcc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(shownX + 0.5, y - 1);
    ctx.lineTo(shownX + 0.5, y + h + 1);
    ctx.stroke();
    if (Math.abs(actualX - shownX) > 0.5) {
      ctx.strokeStyle = '#b6ffd7';
      ctx.beginPath();
      ctx.moveTo(actualX + 0.5, y - 1);
      ctx.lineTo(actualX + 0.5, y + h + 1);
      ctx.stroke();
    }

    if (rollClamped != null) {
      const rollX = x + w * rollClamped;
      const marker = success === true ? '#86ffd3' : '#ff9f92';
      ctx.strokeStyle = marker;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rollX + 0.5, y - 2);
      ctx.lineTo(rollX + 0.5, y + h + 2);
      ctx.stroke();

      ctx.fillStyle = marker;
      ctx.beginPath();
      ctx.moveTo(rollX, y - 4);
      ctx.lineTo(rollX - 3, y - 1);
      ctx.lineTo(rollX + 3, y - 1);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#2b3a56';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#b8c8e2';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`shown ${Math.round(displayClamped * 100)}%`, x + 3, y + h - 1);
    ctx.textAlign = 'center';
    const debuffPct = Math.max(0, Math.round(Math.max(debuffLossClamped, displayClamped - actualClamped) * 100));
    const actualLabel = debuffPct > 0
      ? `actual ${Math.round(actualClamped * 100)}% (-${debuffPct}%)`
      : `actual ${Math.round(actualClamped * 100)}%`;
    ctx.fillText(actualLabel, x + w * 0.5, y + h - 1);
    if (rollClamped != null) {
      ctx.textAlign = 'right';
      ctx.fillText(`roll ${Math.round(rollClamped * 100)}%`, x + w - 3, y + h - 1);
    }
  }

  drawSpecialRollTypeBadge(type, x, y, side = 'left') {
    if (!type || !FAILED_SPECIAL_HAT_STYLES[type]) return;
    const { ctx } = this;
    const style = FAILED_SPECIAL_HAT_STYLES[type];
    ctx.fillStyle = '#0f1727';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = style.brim;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();
    this.drawFailedSpecialMini(type, x, y + 1, 8.2, side);
  }

  findPlayerInSlot(players = [], slot = 0) {
    if (!Array.isArray(players) || slot < 0) return null;
    return players.find((player) => {
      const playerSlot = Number(player?.slot);
      return Number.isFinite(playerSlot) && Math.floor(playerSlot) === slot;
    }) || null;
  }

  isCpuArcherSlot(players = [], cpuSlots = [], slot = 0) {
    const lane = Math.max(0, Math.floor(Number(slot) || 0));
    if (!Array.isArray(cpuSlots) || !cpuSlots[lane]) return false;
    return !this.findPlayerInSlot(players, lane);
  }

  drawCpuArcherBadge(side = 'left', archerX = 0, archerY = 0) {
    const { ctx } = this;
    const sideName = side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const badgeX = archerX + dir * 17;
    const badgeY = archerY - 32;
    const radius = 9;
    const ring = sideName === 'left' ? '#96d0ff' : '#ffafb8';
    const fill = sideName === 'left' ? '#18344f' : '#4a2230';
    const iconImage = this.getUpgradeGlyphImage(CPU_ARCHER_TWEMOJI);

    ctx.save();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = ring;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.arc(badgeX, badgeY, radius, 0, Math.PI * 2);
    ctx.stroke();

    const iconSize = 11;
    if (iconImage?.complete && iconImage.naturalWidth > 0 && iconImage.naturalHeight > 0) {
      ctx.drawImage(iconImage, badgeX - iconSize / 2, badgeY - iconSize / 2 - 0.5, iconSize, iconSize);
    } else {
      ctx.fillStyle = '#f2f7ff';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CPU', badgeX, badgeY + 0.5);
    }

    ctx.fillStyle = this.withAlpha('#07111f', 0.55);
    ctx.beginPath();
    ctx.ellipse(badgeX, badgeY + 9.5, 5.5, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCastle(side, x, y, hp, sideState = null, archerPulls = null, sidePlayers = null, sideCpuSlots = null) {
    const { ctx } = this;
    const palette = TEAM_COLORS[side];
    const dir = side === 'left' ? 1 : -1;
    const style = this.empireSpriteStyle(side);
    const themed = Boolean(style);
    const wallW = 118;
    const wallH = 290;
    const left = x - wallW / 2;
    const totalGold = Math.max(0, Number(sideState?.goldEarnedTotal) || 0);

    this.drawTreasureChest(side, x, this.treasureChestY(y), totalGold, 10, sideState);

    // Removed tower footing block for cleaner base silhouette.

    ctx.fillStyle = themed ? style.castleWall : palette.castle;
    ctx.fillRect(left, y - wallH / 2, wallW, wallH);
    ctx.strokeStyle = themed ? style.castleEdge : '#4c628a';
    ctx.lineWidth = themed ? 2.2 : 2;
    ctx.strokeRect(left, y - wallH / 2, wallW, wallH);

    const crenelW = 16;
    if (!themed || side === 'left') {
      for (let i = 0; i < 6; i += 1) {
        if (i % 2 === 1) continue;
        ctx.fillStyle = themed ? style.accentDark : palette.dark;
        ctx.fillRect(left + 10 + i * crenelW, y - wallH / 2 - 18, 12, 18);
      }
    } else {
      // East side gets layered pagoda roofs.
      for (let i = 0; i < 3; i += 1) {
        const roofY = y - wallH / 2 - 16 - i * 17;
        const roofW = wallW - 10 - i * 16;
        const roofX = x - roofW / 2;
        ctx.fillStyle = i % 2 === 0 ? '#4d5f73' : '#3f5164';
        ctx.beginPath();
        ctx.moveTo(roofX - 7, roofY + 8);
        ctx.lineTo(roofX + roofW + 7, roofY + 8);
        ctx.lineTo(roofX + roofW, roofY);
        ctx.lineTo(roofX, roofY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = style.trim;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(roofX - 7, roofY + 8);
        ctx.lineTo(roofX + roofW + 7, roofY + 8);
        ctx.stroke();
      }
    }

    if (themed && side === 'left') {
      ctx.fillStyle = '#c39863';
      ctx.beginPath();
      ctx.arc(left + 17, y - wallH / 2 + 12, 11, Math.PI, Math.PI * 2);
      ctx.arc(left + wallW - 17, y - wallH / 2 + 12, 11, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = themed ? style.gateDark : '#172338';
    ctx.fillRect(left + 18, y - 110, wallW - 36, 88);
    if (themed && side === 'right') {
      ctx.strokeStyle = '#cadbe8';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i += 1) {
        const wy = y - 98 + i * 20;
        ctx.beginPath();
        ctx.moveTo(left + 22, wy);
        ctx.lineTo(left + wallW - 22, wy);
        ctx.stroke();
      }
    }

    const slitX = side === 'left' ? left + wallW - 24 : left + 24;
    ctx.fillStyle = themed ? style.slitDark : '#09101d';
    ctx.fillRect(slitX - 7, y - 118, 14, 96);

    if (themed) {
      const bannerX = side === 'left' ? left + 26 : left + wallW - 26;
      this.drawEmpireBannerEmblem(side, bannerX, y - 60, 0.95);
      if (side === 'right') {
        // Lanterns for an east-asia silhouette.
        for (let i = 0; i < 2; i += 1) {
          const lx = left + 12 + i * (wallW - 24);
          const ly = y - 126;
          ctx.strokeStyle = '#d9e9f2';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(lx, ly - 11);
          ctx.lineTo(lx, ly - 1);
          ctx.stroke();
          ctx.fillStyle = '#f6edd5';
          ctx.beginPath();
          ctx.ellipse(lx, ly + 3, 4.2, 5.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#9eaebc';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    const pulls = Array.isArray(archerPulls) && archerPulls.length
      ? archerPulls
      : this.sideArcherPulls(side, sideState);
    const players = Array.isArray(sidePlayers) ? sidePlayers : [];
    const cpuSlots = Array.isArray(sideCpuSlots) ? sideCpuSlots : [];
    const archerX = side === 'left' ? x + 35 : x - 35;
    for (let idx = 0; idx < pulls.length; idx += 1) {
      const pull = pulls[idx];
      const archerY = y - 56 - idx * 78;
      const platformX = archerX + dir * 6;
      ctx.fillStyle = themed ? style.platform : '#4f607f';
      ctx.fillRect(platformX - 18, archerY + 12, 36, 10);

      const aim = worldAimAngle(side, pull.pullX, pull.pullY);
      const skinTone = themed
        ? (side === 'left' ? '#e0c39a' : '#efd7b0')
        : '#d7c29d';
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.arc(archerX, archerY - 16, themed ? 7.6 : 8, 0, Math.PI * 2);
      ctx.fill();

      if (themed && side === 'left') {
        // European archer with kettle helmet + tabard.
        ctx.fillStyle = '#c9d2de';
        ctx.beginPath();
        ctx.arc(archerX, archerY - 18, 7.3, Math.PI, 0, false);
        ctx.lineTo(archerX + 7.3, archerY - 15.5);
        ctx.lineTo(archerX - 7.3, archerY - 15.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#4f1820';
        ctx.fillRect(archerX - 1.1, archerY - 27, 2.2, 8);
        ctx.fillStyle = style.archerCloth;
        ctx.fillRect(archerX - 7, archerY - 9, 14, 16);
        ctx.fillStyle = style.archerTrim;
        ctx.fillRect(archerX - 1.5, archerY - 9, 3, 16);
      } else if (themed && side === 'right') {
        // East archer with kasa hat + robe.
        ctx.fillStyle = '#d7b777';
        ctx.beginPath();
        ctx.moveTo(archerX, archerY - 29);
        ctx.lineTo(archerX - 9, archerY - 15);
        ctx.lineTo(archerX + 9, archerY - 15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8d6b43';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = style.archerCloth;
        ctx.fillRect(archerX - 7, archerY - 9, 14, 16);
        ctx.fillStyle = style.archerTrim;
        ctx.fillRect(archerX - 7, archerY - 2, 14, 2.1);
      } else {
        ctx.strokeStyle = '#d7c29d';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(archerX, archerY - 8);
        ctx.lineTo(archerX, archerY + 14);
        ctx.stroke();
        ctx.fillStyle = palette.primary;
        ctx.fillRect(archerX - 6, archerY - 8, 12, 14);
      }

      const bx1 = archerX + Math.cos(aim) * 9;
      const by1 = archerY - 4 + Math.sin(aim) * 9;
      const bx2 = archerX + Math.cos(aim) * 24;
      const by2 = archerY - 4 + Math.sin(aim) * 24;
      if (themed && side === 'left') {
        // Baguette bolt launcher for the Bread Empire.
        ctx.strokeStyle = style.weaponWood;
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx2, by2);
        ctx.stroke();
        ctx.strokeStyle = '#f0cb95';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(bx1 + Math.cos(aim) * 4, by1 + Math.sin(aim) * 4);
        ctx.lineTo(bx1 + Math.cos(aim) * 10, by1 + Math.sin(aim) * 10);
        ctx.stroke();
        ctx.strokeStyle = style.weaponTip;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(bx2 - Math.sin(aim) * 3, by2 + Math.cos(aim) * 3);
        ctx.lineTo(bx2 + Math.sin(aim) * 3, by2 - Math.cos(aim) * 3);
        ctx.stroke();
      } else if (themed && side === 'right') {
        // Curved yumi + rice-straw arrow.
        const nx = -Math.sin(aim);
        const ny = Math.cos(aim);
        const bowMidX = (bx1 + bx2) * 0.5;
        const bowMidY = (by1 + by2) * 0.5;
        ctx.strokeStyle = style.weaponWood;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bx1 + nx * 4, by1 + ny * 4);
        ctx.quadraticCurveTo(bowMidX - nx * 8, bowMidY - ny * 8, bx2 + nx * 4, by2 + ny * 4);
        ctx.stroke();
        ctx.strokeStyle = style.trim;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx1 + nx * 3.4, by1 + ny * 3.4);
        ctx.lineTo(bx2 + nx * 3.4, by2 + ny * 3.4);
        ctx.stroke();
        ctx.strokeStyle = style.weaponTip;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx2, by2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#8b5a2b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bx1, by1);
        ctx.lineTo(bx2, by2);
        ctx.stroke();
        ctx.strokeStyle = palette.soft;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx1 - Math.sin(aim) * 6, by1 + Math.cos(aim) * 6);
        ctx.lineTo(bx1 + Math.sin(aim) * 6, by1 - Math.cos(aim) * 6);
        ctx.stroke();
      }

      if (this.isCpuArcherSlot(players, cpuSlots, idx)) {
        this.drawCpuArcherBadge(side, archerX, archerY);
      }

    }

    const hpW = 92;
    const pct = Math.max(0, hp / 6000);
    const hpX = x - hpW / 2;
    const hpY = y - wallH / 2 - 34;
    ctx.fillStyle = '#141414';
    ctx.fillRect(hpX, hpY, hpW, 10);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * pct, 10);
    this.drawHealthBarNotches(hpX, hpY, hpW, 10, 6000);

    this.drawTowerUpgradeBadges(side, x, y, sideState);
  }

  drawTreasureChest(side, x, y, totalGold, topCapY = -24, sideState = null) {
    const { ctx } = this;
    const chestW = 54;
    const chestH = 30;
    const chestAnchorX = this.treasureChestAnchorX(side, x);
    const chestX = chestAnchorX - chestW / 2;
    const chestY = y;
    const pileCenterX = chestAnchorX;
    const itemsPerLayer = 3.15;
    const rowStep = 7.1;
    const itemCount = Math.max(6, Math.floor(totalGold / 120) + 6);
    const availablePileHeight = Math.max(28, chestY + 4 - topCapY);
    const maxVisibleRows = Math.max(3, Math.floor(availablePileHeight / rowStep));
    const visibleCount = Math.min(itemCount, Math.ceil(maxVisibleRows * itemsPerLayer));
    const rows = Math.max(1, Math.ceil(visibleCount / itemsPerLayer));
    const pileItems = this.ensureTreasurePileEntries(side, totalGold, visibleCount);

    ctx.fillStyle = '#00000028';
    ctx.beginPath();
    ctx.ellipse(chestAnchorX, chestY + chestH + 6, chestW * 0.78, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = side === 'left' ? '#d7b07b' : '#ddd7cf';
    ctx.beginPath();
    ctx.ellipse(pileCenterX, chestY + 6, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = side === 'left' ? '#b98655' : '#b9b2a9';
    ctx.beginPath();
    ctx.ellipse(pileCenterX, chestY + 10, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    for (let i = visibleCount - 1; i >= 0; i -= 1) {
      const row = Math.floor(i / itemsPerLayer);
      const item = pileItems[i];
      const baseSeed = item?.seed ?? (i + 1) * 19.7;
      const spreadBias = item?.spreadBias ?? (stableHash(baseSeed + 2.3) * 2 - 1);
      const layerSpread = Math.max(4, 23 - row * 0.58 + stableHash(baseSeed + 3.6) * 3.1);
      const px = pileCenterX
        + spreadBias * layerSpread
        + (item?.jitterX ?? ((stableHash(baseSeed + 0.4) - 0.5) * 4.5))
        + (side === 'left' ? 1 : -1) * row * 0.12;
      const py = chestY + 8
        - row * rowStep
        - Math.abs(spreadBias) * (1.8 + row * 0.02)
        + (item?.jitterY ?? ((stableHash(baseSeed + 0.9) - 0.5) * 1.8));
      const scale = (item?.scale ?? (0.82 + stableHash(baseSeed + 1.5) * 0.44)) + Math.min(0.48, row * 0.022);
      const drawScale = scale * TREASURE_PILE_ITEM_SCALE_MULT;
      const itemTopY = py - 6.5 * drawScale;
      if (itemTopY < topCapY) continue;
      const kind = item?.kind || 'coin';
      this.drawTreasurePileItem(kind, px, py, drawScale, baseSeed);
    }

    const innerGlow = ctx.createLinearGradient(chestAnchorX, chestY - 2, chestAnchorX, chestY + 14);
    innerGlow.addColorStop(0, '#ffe8a8');
    innerGlow.addColorStop(1, '#d0901e');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.ellipse(pileCenterX, chestY + 6, chestW * 0.28, chestH * 0.23, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d5a754';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(chestX + 6, chestY + 2);
    ctx.lineTo(chestX + chestW - 6, chestY + 2);
    ctx.stroke();

    const chestGrad = ctx.createLinearGradient(chestX, chestY, chestX, chestY + chestH);
    chestGrad.addColorStop(0, '#b86e38');
    chestGrad.addColorStop(0.55, '#8f4d26');
    chestGrad.addColorStop(1, '#6f381d');
    ctx.fillStyle = chestGrad;
    ctx.fillRect(chestX, chestY, chestW, chestH);
    ctx.strokeStyle = '#5f2c16';
    ctx.lineWidth = 2;
    ctx.strokeRect(chestX, chestY, chestW, chestH);

    ctx.fillStyle = '#dcb35b';
    ctx.fillRect(chestX + 4, chestY + 5, chestW - 8, 4);
    ctx.fillRect(chestX + 5, chestY + chestH - 8, chestW - 10, 3);
    ctx.fillRect(chestX + 7, chestY + 3, 3, chestH - 6);
    ctx.fillRect(chestX + chestW - 10, chestY + 3, 3, chestH - 6);
    ctx.fillRect(chestAnchorX - 4, chestY + 4, 8, 11);

    ctx.fillStyle = '#ffdf7c';
    ctx.fillRect(chestAnchorX - 2, chestY + 6, 4, 7);
    ctx.fillStyle = '#7c5418';
    ctx.fillRect(chestAnchorX - 1, chestY + 7, 2, 4);

    for (let spill = 0; spill < 4; spill += 1) {
      const seed = (side === 'left' ? 701 : 1403) + spill * 17.9;
      const spillX = chestX + 10 + spill * 9 + (stableHash(seed) - 0.5) * 4;
      const spillY = chestY + chestH - 2 - stableHash(seed + 0.7) * 5;
      const spillKind = stableHash(seed + 1.9) > 0.78 ? 'goldBar' : (spill % 3 === 0 ? 'coinStack' : 'coin');
      this.drawTreasurePileItem(spillKind, spillX, spillY, 0.72 + stableHash(seed + 1.2) * 0.18, seed);
    }

    const chestLabel = totalGold.toLocaleString();
    ctx.strokeStyle = '#4a2810';
    ctx.lineWidth = 3;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText(chestLabel, chestAnchorX, chestY + chestH - 12);
    ctx.fillStyle = '#ffe08a';
    ctx.fillText(chestLabel, chestAnchorX, chestY + chestH - 12);

    const arrowsFired = Math.max(0, Number(sideState?.arrowsFired) || 0);
    if (arrowsFired > 0) {
      const shotGold = Math.max(0, Math.round(Number(sideState?.arrowShotGoldCurrent) || 0));
      const shotLabel = `+${shotGold.toLocaleString()}`;
      const nowMs = performance.now();
      const pulseState = this.treasureShotGoldState?.[side];
      if (pulseState) {
        if (pulseState.lastValue !== shotGold) {
          pulseState.lastValue = shotGold;
          pulseState.lastChangeMs = nowMs;
        }
      }
      const ageSec = pulseState ? Math.max(0, (nowMs - (pulseState.lastChangeMs || nowMs)) / 1000) : 1;
      const pulse = Math.max(0, 1 - ageSec / 0.34);
      const baseFont = Math.max(9, Math.min(15, 9 + Math.log10(shotGold + 1) * 3.2));
      const fontPx = Math.round(baseFont * (1 + pulse * 0.18));
      const lineY = chestY + chestH + 15;

      ctx.save();
      ctx.font = `bold ${fontPx}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textW = Math.max(8, ctx.measureText(shotLabel).width);
      const padX = Math.max(5, Math.round(fontPx * 0.32));
      const pillW = textW + padX * 2;
      const pillH = Math.max(11, fontPx + 2);
      const pillX = chestAnchorX - pillW / 2;
      const pillY = lineY - pillH / 2;
      const positive = shotGold > 0;
      ctx.fillStyle = this.withAlpha(positive ? '#38240f' : '#202a39', 0.78);
      ctx.fillRect(pillX, pillY, pillW, pillH);
      ctx.strokeStyle = this.withAlpha(positive ? '#d4a85f' : '#7d8ea8', 0.72);
      ctx.lineWidth = 1;
      ctx.strokeRect(pillX + 0.5, pillY + 0.5, pillW - 1, pillH - 1);
      ctx.strokeStyle = this.withAlpha(positive ? '#4a2a0f' : '#243247', 0.88);
      ctx.lineWidth = Math.max(2, fontPx * 0.24);
      ctx.strokeText(shotLabel, chestAnchorX, lineY);
      ctx.fillStyle = positive ? '#ffd774' : '#c4d2e8';
      ctx.fillText(shotLabel, chestAnchorX, lineY);
      ctx.restore();
    }
  }

  ensureTreasurePileEntries(side, totalGold, count) {
    const state = this.treasurePileState?.[side];
    if (!state) return [];
    if ((totalGold < 80 && state.lastGold > 300) || totalGold + 120 < state.lastGold * 0.4) {
      state.items = [];
    }
    while (state.items.length < count) {
      state.items.push(this.createTreasurePileEntry(side, state.items.length));
    }
    state.lastGold = totalGold;
    return state.items;
  }

  createTreasurePileEntry(side, index) {
    const richness = Math.min(1, index / 16);
    const roll = Math.random();
    let kind = 'coin';
    if (roll < 0.28) kind = 'coin';
    else if (roll < 0.46) kind = 'coinStack';
    else if (roll < 0.56) kind = 'goldBar';
    else if (side === 'left') {
      const breadKinds = ['bun', 'loaf'];
      if (richness > 0.15) breadKinds.push('croissant', 'baguette');
      if (richness > 0.45) breadKinds.push('pretzel', 'bagel', 'toast');
      if (richness > 0.72) breadKinds.push('brioche');
      kind = pickRandom(breadKinds);
    } else {
      const riceKinds = ['mochi', 'onigiri'];
      if (richness > 0.15) riceKinds.push('riceCake', 'riceBowl');
      if (richness > 0.45) riceKinds.push('riceSack', 'senbei', 'sushiRoll');
      if (richness > 0.72) riceKinds.push('riceCrate');
      kind = pickRandom(riceKinds);
    }
    return {
      kind,
      seed: Math.random() * 100000,
      jitterX: (Math.random() - 0.5) * 4.5,
      jitterY: (Math.random() - 0.5) * 1.8,
      spreadBias: Math.random() * 2 - 1,
      scale: 0.82 + Math.random() * 0.44,
    };
  }

  drawTreasurePileItem(kind, x, y, scale, seed) {
    const { ctx } = this;
    ctx.save();
    switch (kind) {
      case 'coin': {
        const rx = 4.1 * scale;
        const ry = 2.1 * scale;
        const grad = ctx.createLinearGradient(x, y - ry, x, y + ry);
        grad.addColorStop(0, '#fff2ad');
        grad.addColorStop(0.55, '#f3bf43');
        grad.addColorStop(1, '#ba7b18');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8d5e15';
        ctx.lineWidth = Math.max(1, 0.85 * scale);
        ctx.stroke();
        ctx.fillStyle = this.withAlpha('#ffffff', 0.42);
        ctx.beginPath();
        ctx.ellipse(x - rx * 0.18, y - ry * 0.38, rx * 0.34, ry * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'coinStack': {
        const layers = 2 + Math.floor(stableHash(seed + 0.9) * 3);
        for (let i = 0; i < layers; i += 1) {
          this.drawTreasurePileItem('coin', x, y - i * 2.1 * scale, scale * (1 - i * 0.05), seed + i * 3.1);
        }
        break;
      }
      case 'goldBar': {
        ctx.translate(x, y);
        ctx.rotate(-0.22 + stableHash(seed + 0.4) * 0.44);
        ctx.fillStyle = '#d9a63b';
        ctx.beginPath();
        ctx.moveTo(-5.8 * scale, 2.8 * scale);
        ctx.lineTo(-3.8 * scale, -2.8 * scale);
        ctx.lineTo(3.8 * scale, -2.8 * scale);
        ctx.lineTo(5.8 * scale, 2.8 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f8da84';
        ctx.beginPath();
        ctx.moveTo(-3.2 * scale, -1.8 * scale);
        ctx.lineTo(3.2 * scale, -1.8 * scale);
        ctx.lineTo(4.4 * scale, 1.5 * scale);
        ctx.lineTo(-4.4 * scale, 1.5 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8f651e';
        ctx.lineWidth = Math.max(1, 0.9 * scale);
        ctx.stroke();
        break;
      }
      case 'bun': {
        const rx = 6.1 * scale;
        const ry = 4 * scale;
        ctx.fillStyle = '#c7864f';
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e4b277';
        ctx.beginPath();
        ctx.ellipse(x - rx * 0.08, y - ry * 0.18, rx * 0.72, ry * 0.54, 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7a4321';
        ctx.lineWidth = Math.max(1, scale);
        ctx.stroke();
        ctx.fillStyle = '#f4dfb0';
        for (let i = 0; i < 4; i += 1) {
          const sx = x + (stableHash(seed + i * 1.1) - 0.5) * rx * 1.1;
          const sy = y - ry * 0.2 + (stableHash(seed + i * 2.3) - 0.5) * ry * 0.55;
          ctx.beginPath();
          ctx.ellipse(sx, sy, 0.7 * scale, 0.34 * scale, stableHash(seed + i * 3.7) * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'brioche': {
        ctx.fillStyle = '#cd8748';
        ctx.beginPath();
        ctx.arc(x, y + 1.4 * scale, 3.9 * scale, 0, Math.PI * 2);
        ctx.arc(x - 3.4 * scale, y - 0.8 * scale, 3.1 * scale, 0, Math.PI * 2);
        ctx.arc(x + 3.4 * scale, y - 0.8 * scale, 3.1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e8b57d';
        ctx.beginPath();
        ctx.arc(x, y + 0.6 * scale, 2.7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7b4320';
        ctx.lineWidth = Math.max(1, 0.85 * scale);
        ctx.stroke();
        break;
      }
      case 'loaf': {
        const rx = 6.6 * scale;
        const ry = 3.9 * scale;
        ctx.fillStyle = '#b87340';
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d89a61';
        ctx.beginPath();
        ctx.ellipse(x - rx * 0.06, y - ry * 0.18, rx * 0.72, ry * 0.52, 0.16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6b3d1f';
        ctx.lineWidth = Math.max(1, scale * 0.95);
        ctx.stroke();
        for (let i = -1; i <= 1; i += 1) {
          ctx.beginPath();
          ctx.moveTo(x + i * rx * 0.32 - 0.5 * scale, y - ry * 0.18);
          ctx.lineTo(x + i * rx * 0.32 + 0.9 * scale, y + ry * 0.26);
          ctx.stroke();
        }
        break;
      }
      case 'toast': {
        const w = 9 * scale;
        const h = 8.6 * scale;
        ctx.fillStyle = '#d2a06b';
        ctx.beginPath();
        ctx.moveTo(x - w * 0.46, y + h * 0.42);
        ctx.lineTo(x - w * 0.46, y - h * 0.05);
        ctx.quadraticCurveTo(x - w * 0.34, y - h * 0.55, x, y - h * 0.55);
        ctx.quadraticCurveTo(x + w * 0.34, y - h * 0.55, x + w * 0.46, y - h * 0.05);
        ctx.lineTo(x + w * 0.46, y + h * 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e8c18e';
        ctx.fillRect(x - w * 0.26, y - h * 0.08, w * 0.52, h * 0.34);
        ctx.strokeStyle = '#80502a';
        ctx.lineWidth = Math.max(1, 0.85 * scale);
        ctx.stroke();
        break;
      }
      case 'bagel': {
        ctx.fillStyle = '#bf7b45';
        ctx.beginPath();
        ctx.arc(x, y, 5.2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#82461f';
        ctx.beginPath();
        ctx.arc(x, y, 2.1 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#efd7a2';
        for (let i = 0; i < 5; i += 1) {
          ctx.beginPath();
          ctx.ellipse(
            x + (stableHash(seed + i * 1.4) - 0.5) * 6.4 * scale,
            y + (stableHash(seed + i * 2.2) - 0.5) * 3.2 * scale,
            0.7 * scale,
            0.28 * scale,
            stableHash(seed + i * 3.1) * Math.PI,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        break;
      }
      case 'baguette': {
        const len = 15 * scale;
        const h = 3.2 * scale;
        const rot = -0.28 + stableHash(seed + 0.5) * 0.56;
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = '#c68548';
        ctx.beginPath();
        ctx.ellipse(0, 0, len * 0.5, h, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e1ae74';
        ctx.beginPath();
        ctx.ellipse(-len * 0.04, -h * 0.22, len * 0.33, h * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#76411f';
        ctx.lineWidth = Math.max(1, scale * 0.85);
        ctx.stroke();
        for (let i = -2; i <= 2; i += 1) {
          ctx.beginPath();
          ctx.moveTo(i * len * 0.12 - 0.4 * scale, -h * 0.52);
          ctx.lineTo(i * len * 0.12 + 0.9 * scale, h * 0.54);
          ctx.stroke();
        }
        break;
      }
      case 'croissant': {
        const rot = -0.45 + stableHash(seed + 0.7) * 0.9;
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.strokeStyle = '#c47a42';
        ctx.lineWidth = Math.max(2.2, 3.4 * scale);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 1.1 * scale, 4.6 * scale, Math.PI * 1.1, Math.PI * 1.93);
        ctx.stroke();
        ctx.strokeStyle = '#e7bd8a';
        ctx.lineWidth = Math.max(1.1, 1.8 * scale);
        ctx.beginPath();
        ctx.arc(0, 1.1 * scale, 3.15 * scale, Math.PI * 1.13, Math.PI * 1.9);
        ctx.stroke();
        break;
      }
      case 'pretzel': {
        ctx.strokeStyle = '#9c5c2f';
        ctx.lineWidth = Math.max(1.8, 2.6 * scale);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(x - 2.1 * scale, y, 2.4 * scale, 0, Math.PI * 2);
        ctx.arc(x + 2.1 * scale, y, 2.4 * scale, 0, Math.PI * 2);
        ctx.moveTo(x - 4.5 * scale, y + 1.8 * scale);
        ctx.quadraticCurveTo(x, y + 5.8 * scale, x + 4.5 * scale, y + 1.8 * scale);
        ctx.stroke();
        ctx.strokeStyle = '#d5a06d';
        ctx.lineWidth = Math.max(1, 1.1 * scale);
        ctx.beginPath();
        ctx.moveTo(x - 2.2 * scale, y + 1.4 * scale);
        ctx.lineTo(x + 2.2 * scale, y + 1.4 * scale);
        ctx.stroke();
        break;
      }
      case 'mochi': {
        const tint = stableHash(seed + 1.2);
        const fill = tint < 0.33 ? '#f7f3ff' : (tint < 0.66 ? '#ffdbe5' : '#d7f1d2');
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.ellipse(x - 2.7 * scale, y + 0.2 * scale, 3.2 * scale, 2.6 * scale, 0.14, 0, Math.PI * 2);
        ctx.ellipse(x + 2.4 * scale, y - 0.2 * scale, 3.1 * scale, 2.5 * scale, -0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c7d6df';
        ctx.lineWidth = Math.max(1, 0.9 * scale);
        ctx.stroke();
        break;
      }
      case 'onigiri': {
        const w = 8.4 * scale;
        const h = 8.8 * scale;
        ctx.fillStyle = '#fbfeff';
        ctx.beginPath();
        ctx.moveTo(x, y - h * 0.52);
        ctx.lineTo(x - w * 0.52, y + h * 0.38);
        ctx.quadraticCurveTo(x, y + h * 0.66, x + w * 0.52, y + h * 0.38);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ccdbe5';
        ctx.lineWidth = Math.max(1, 0.9 * scale);
        ctx.stroke();
        ctx.fillStyle = '#1f3646';
        ctx.fillRect(x - 2.1 * scale, y + 1.3 * scale, 4.2 * scale, 3.3 * scale);
        ctx.fillStyle = this.withAlpha('#dff4ff', 0.74);
        for (let i = 0; i < 5; i += 1) {
          ctx.beginPath();
          ctx.ellipse(
            x + (stableHash(seed + i * 1.3) - 0.5) * 4.2 * scale,
            y + (stableHash(seed + i * 2.1) - 0.6) * 3.8 * scale,
            0.56 * scale,
            0.22 * scale,
            stableHash(seed + i * 3.1) * Math.PI,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        break;
      }
      case 'riceCake': {
        ctx.strokeStyle = '#a78356';
        ctx.lineWidth = Math.max(1, 0.85 * scale);
        ctx.beginPath();
        ctx.moveTo(x, y + 4.8 * scale);
        ctx.lineTo(x, y - 4.6 * scale);
        ctx.stroke();
        const colors = ['#f6f2ec', '#ffc8d7', '#d8f0cf'];
        for (let i = 0; i < 3; i += 1) {
          ctx.fillStyle = colors[i];
          ctx.beginPath();
          ctx.arc(x, y - 3.2 * scale + i * 3.2 * scale, 2.2 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d8dee6';
          ctx.lineWidth = Math.max(1, 0.75 * scale);
          ctx.stroke();
        }
        break;
      }
      case 'senbei': {
        ctx.fillStyle = '#d9b26b';
        ctx.beginPath();
        ctx.arc(x, y, 4.7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8c6232';
        ctx.lineWidth = Math.max(1, 0.8 * scale);
        ctx.stroke();
        ctx.fillStyle = '#9a6c36';
        for (let i = 0; i < 5; i += 1) {
          ctx.beginPath();
          ctx.arc(
            x + (stableHash(seed + i * 1.4) - 0.5) * 5.2 * scale,
            y + (stableHash(seed + i * 2.1) - 0.5) * 5.2 * scale,
            0.48 * scale,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        break;
      }
      case 'riceBowl': {
        ctx.fillStyle = '#f7fbff';
        ctx.beginPath();
        ctx.ellipse(x, y - 2.1 * scale, 5.4 * scale, 2.5 * scale, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d9e5ee';
        ctx.lineWidth = Math.max(1, 0.75 * scale);
        ctx.stroke();
        ctx.fillStyle = '#914b36';
        ctx.beginPath();
        ctx.moveTo(x - 5.7 * scale, y - 1.1 * scale);
        ctx.quadraticCurveTo(x, y + 5.6 * scale, x + 5.7 * scale, y - 1.1 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#cf7051';
        ctx.beginPath();
        ctx.moveTo(x - 4.8 * scale, y);
        ctx.quadraticCurveTo(x, y + 4.2 * scale, x + 4.8 * scale, y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fbfeff';
        ctx.beginPath();
        ctx.ellipse(x, y - 2.6 * scale, 4.2 * scale, 1.9 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'sushiRoll': {
        ctx.fillStyle = '#1c2f3d';
        ctx.beginPath();
        ctx.arc(x, y, 4.9 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f7fbff';
        ctx.beginPath();
        ctx.arc(x, y, 3.8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = stableHash(seed + 1.6) > 0.5 ? '#ff8e82' : '#8fd67b';
        ctx.beginPath();
        ctx.arc(x, y, 1.9 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'riceSack': {
        ctx.fillStyle = '#e5d0a5';
        ctx.beginPath();
        ctx.moveTo(x - 4.6 * scale, y + 5.2 * scale);
        ctx.quadraticCurveTo(x - 6.2 * scale, y - 0.6 * scale, x - 2.2 * scale, y - 4.2 * scale);
        ctx.lineTo(x + 2.2 * scale, y - 4.2 * scale);
        ctx.quadraticCurveTo(x + 6.2 * scale, y - 0.6 * scale, x + 4.6 * scale, y + 5.2 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#9d7c48';
        ctx.lineWidth = Math.max(1, 0.8 * scale);
        ctx.stroke();
        ctx.strokeStyle = '#7d5d2f';
        ctx.beginPath();
        ctx.moveTo(x - 2.8 * scale, y - 2.4 * scale);
        ctx.lineTo(x + 2.8 * scale, y - 2.4 * scale);
        ctx.stroke();
        ctx.fillStyle = '#f8fdff';
        for (let i = 0; i < 5; i += 1) {
          ctx.beginPath();
          ctx.ellipse(
            x + (stableHash(seed + i * 1.2) - 0.5) * 4 * scale,
            y - 4.6 * scale - stableHash(seed + i * 2.1) * 1.6 * scale,
            0.68 * scale,
            0.26 * scale,
            stableHash(seed + i * 2.7) * Math.PI,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        break;
      }
      case 'riceCrate': {
        ctx.fillStyle = '#c8a36d';
        ctx.fillRect(x - 5.6 * scale, y - 4.4 * scale, 11.2 * scale, 8.8 * scale);
        ctx.strokeStyle = '#886039';
        ctx.lineWidth = Math.max(1, 0.8 * scale);
        ctx.strokeRect(x - 5.6 * scale, y - 4.4 * scale, 11.2 * scale, 8.8 * scale);
        ctx.strokeRect(x - 3.8 * scale, y - 2.8 * scale, 7.6 * scale, 5.6 * scale);
        ctx.fillStyle = '#f7fcff';
        for (let i = 0; i < 6; i += 1) {
          ctx.beginPath();
          ctx.ellipse(
            x + (stableHash(seed + i * 1.5) - 0.5) * 7 * scale,
            y - 4.8 * scale - stableHash(seed + i * 2.2) * 1.7 * scale,
            0.7 * scale,
            0.26 * scale,
            stableHash(seed + i * 2.9) * Math.PI,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        break;
      }
      default:
        break;
    }
    ctx.restore();
  }

  getUpgradeBadgeData(sideState) {
    if (!sideState) return [];
    const out = [];
    for (const spec of UPGRADE_BADGE_SPECS) {
      const level = Math.max(0, Number(sideState[spec.type]) || 0);
      const count = Math.max(0, level - spec.base);
      if (count <= 0) continue;
      const category = upgradeCategory(spec.type);
      const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
      out.push({ ...spec, count, category, style, color: style.badge });
    }
    return out;
  }

  getTowerUpgradeGroups(sideState) {
    const badges = this.getUpgradeBadgeData(sideState);
    if (!badges.length) return [];
    const groups = [];
    for (const category of UPGRADE_CATEGORY_ORDER) {
      const items = badges.filter((badge) => badge.category === category);
      if (!items.length) continue;
      const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
      groups.push({
        category,
        style,
        label: UPGRADE_CATEGORY_TOWER_LABEL[category] || style.tag || 'Upgrades',
        items,
      });
    }
    return groups;
  }

  drawTowerUpgradeBadges(side, x, y, sideState) {
    const groups = this.getTowerUpgradeGroups(sideState);
    if (!groups.length) return;

    const { ctx } = this;
    const badgeDir = side === 'left' ? -1 : 1;
    const cols = 3;
    const iconStepX = 20;
    const iconStepY = 21;
    const iconR = 11;
    const groupGap = 9;
    const startX = x + badgeDir * 22;
    let startY = y - 126;
    const groupWidth = badgeDir * iconStepX * (cols - 1);
    const railLeft = Math.min(startX, startX + groupWidth) - 11;
    const railRight = Math.max(startX, startX + groupWidth) + 11;

    for (let g = 0; g < groups.length; g += 1) {
      const group = groups[g];
      const rows = Math.ceil(group.items.length / cols);

      for (let row = 0; row < rows; row += 1) {
        const rowStart = row * cols;
        const rowEnd = Math.min(group.items.length, rowStart + cols);
        for (let i = rowEnd - 1; i >= rowStart; i -= 1) {
          const badge = group.items[i];
          const col = i % cols;
          const bx = startX + badgeDir * col * iconStepX;
          const by = startY + row * iconStepY;

          ctx.fillStyle = '#09101ddd';
          ctx.beginPath();
          ctx.arc(bx, by, iconR + 2.9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = this.mixColor(badge.color, '#ffffff', 0.82);
          ctx.beginPath();
          ctx.arc(bx, by, iconR, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = this.withAlpha(group.style.border, 0.86);
          ctx.lineWidth = 1.15;
          ctx.stroke();
          this.drawUpgradeGlyph(badge.type, bx, by, 9.1, '#1f2230');

          if (badge.count > 1) {
            const tx = bx + badgeDir * 9;
            const ty = by - 8;
            ctx.fillStyle = '#18120cd8';
            ctx.beginPath();
            ctx.arc(tx, ty, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffe7a6';
            ctx.font = 'bold 7px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${badge.count}`, tx, ty + 2.4);
          }
        }
      }

      startY += rows * iconStepY + groupGap;
      if (g < groups.length - 1) {
        ctx.strokeStyle = this.withAlpha(group.style.border, 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(railLeft, startY - groupGap / 2);
        ctx.lineTo(railRight, startY - groupGap / 2);
        ctx.stroke();
      }
    }
  }

  drawShotRing(x, y, cd, color, cooldownDuration = SHOT_INTERVAL) {
    const { ctx } = this;
    const duration = Math.max(0.0001, Number(cooldownDuration) || SHOT_INTERVAL);
    const pct = 1 - Math.max(0, Math.min(1, cd / duration));
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();
  }

  drawComboBanner(side, x, y, sideState) {
    const { ctx } = this;
    const streak = Math.max(0, Math.min(10, Number(sideState?.comboHitStreak) || 0));
    const tier = comboTierFromStreak(streak);
    const active = tier > 1;
    const maxed = streak >= 10;
    const w = maxed ? 122 : 86;
    const h = maxed ? 30 : 24;

    ctx.fillStyle = active ? (side === 'left' ? '#12314fc9' : '#4f1f1ac9') : '#2026329f';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeStyle = maxed ? '#ffd78f' : (active ? '#9ed8ff' : '#66788b');
    ctx.lineWidth = maxed ? 2.2 : 1.4;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);

    ctx.fillStyle = active ? '#f6fbff' : '#cad4df';
    ctx.font = `bold ${maxed ? 12 : 11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(active ? `COMBO x${tier}` : 'COMBO x1', x, y + 1);

    if (maxed) {
      ctx.fillStyle = '#ffd28e';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('MAX BONUS AOE', x, y + 13);
    }
  }

  drawUpgradeChargeBar(side, x, y, bw, bh, current, max) {
    const { ctx } = this;
    const pct = Math.max(0, Math.min(1, current / Math.max(1, max)));
    const fillW = bw * pct;

    // Background bar
    ctx.fillStyle = '#1f1a10d6';
    ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = '#9a7a20';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, bw, bh);

    // Gold gradient fill - mirror direction based on side
    const goldGrad = side === 'left'
      ? ctx.createLinearGradient(x, 0, x + fillW, 0)  // Left to right for left side
      : ctx.createLinearGradient(x + bw, 0, x + bw - fillW, 0); // Right to left for right side

    goldGrad.addColorStop(0, '#c98d2d');
    goldGrad.addColorStop(0.55, '#f4c95d');
    goldGrad.addColorStop(1, '#fff4bf');
    ctx.fillStyle = goldGrad;

    // Fill from the tower side inward
    if (side === 'left') {
      ctx.fillRect(x + 2, y + 2, Math.max(0, fillW - 4), bh - 4);
    } else {
      ctx.fillRect(x + bw - fillW + 2, y + 2, Math.max(0, fillW - 4), bh - 4);
    }

    if (pct >= 1) {
      ctx.strokeStyle = '#fff4bf';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, bw + 4, bh + 4);
    }

    ctx.fillStyle = '#f6e6b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UPG', x + bw / 2, y - 8);
  }

  drawUpgradePlaceholders(snapshot) {
    const { ctx } = this;
    for (const sideName of ['left', 'right']) {
      const x0 = sideCardSlotX(sideName, 0);
      const x1 = sideCardSlotX(sideName, 1);
      const y = 90;
      const side = snapshot[sideName];
      const ready = side.upgradeCharge >= side.upgradeChargeMax;
      const pct = Math.round(Math.max(0, Math.min(1, side.upgradeCharge / Math.max(1, side.upgradeChargeMax))) * 100);
      const debtLeft = Math.max(0, Math.ceil(side.upgradeChargeMax - side.upgradeCharge));
      const committeeVote = snapshot?.committeeVotes?.[sideName] || null;
      const committeeActive = Boolean(committeeVote?.active);
      const committeeCount = Math.max(0, Number(committeeVote?.committeeCount) || 0);
      const committeeReady = Math.max(0, Number(committeeVote?.votersReady) || 0);
      const autoPickIn = Number.isFinite(side.upgradeAutoPickAt)
        ? Math.max(0, Math.ceil(side.upgradeAutoPickAt - snapshot.t))
        : 20;
      ctx.fillStyle = ready ? '#b8dcff' : '#7e8fa8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const centerX = (x0 + x1) / 2;
      const baseText = ready ? `Upgrade Ready: choose in ${autoPickIn}s` : `Upgrade debt ${debtLeft} (${pct}%)`;
      ctx.fillText(baseText, centerX, y - 29);
      if (committeeCount > 0) {
        ctx.fillStyle = committeeActive ? '#ffd49a' : '#e6b06d';
        ctx.font = '10px sans-serif';
        const timerText = committeeActive ? `vote ${Math.max(0, Number(committeeVote?.remaining) || 0).toFixed(1)}s` : 'vote idle';
        ctx.fillText(`Committee ${committeeReady}/${committeeCount} (${timerText})`, centerX, y - 18);
      }
    }
  }

  drawUpgradeCard(card, sideState = null) {
    const { ctx } = this;
    const category = upgradeCategory(card.type);
    const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
    const textX = card.x + 10;
    const cardLevel = Math.max(0, Number(sideState?.[card.type]) || 0);
    const committeeLocked = Boolean(card?.committeeLocked);
    const committeeVoteActive = Boolean(card?.committeeVoteActive);
    const capLevel = upgradeLevelCap(card.type);
    const isFinalCapUpgrade = Number.isFinite(capLevel) && capLevel > 0 && (cardLevel + 1 >= capLevel);
    ctx.fillStyle = style.panel;
    ctx.fillRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);
    ctx.fillStyle = style.glow;
    ctx.fillRect(card.x - card.w / 2 + 1, card.y - card.h / 2 + 1, card.w - 2, card.h - 2);
    ctx.strokeStyle = committeeLocked ? '#f2a75c' : (isFinalCapUpgrade ? '#f6ce62' : style.border);
    ctx.lineWidth = isFinalCapUpgrade ? 2.4 : 2;
    ctx.strokeRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);
    if (isFinalCapUpgrade) {
      ctx.strokeStyle = '#fff1b4';
      ctx.lineWidth = 1.05;
      ctx.strokeRect(card.x - card.w / 2 + 2.2, card.y - card.h / 2 + 2.2, card.w - 4.4, card.h - 4.4);
      const badgeW = 24;
      const badgeH = 10;
      const badgeX = card.x + card.w / 2 - badgeW - 4;
      const badgeY = card.y - card.h / 2 + 3;
      ctx.fillStyle = '#4a340aeb';
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      ctx.strokeStyle = '#ffd77b';
      ctx.lineWidth = 1;
      ctx.strokeRect(badgeX + 0.5, badgeY + 0.5, badgeW - 1, badgeH - 1);
      ctx.fillStyle = '#fff0bf';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CAP', badgeX + badgeW / 2, badgeY + 7.2);
    }

    const iconX = card.x - card.w / 2 + 11;
    const iconY = card.y - card.h / 2 + 10.5;
    ctx.fillStyle = '#0c1526d4';
    ctx.beginPath();
    ctx.arc(iconX, iconY, 10.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.mixColor(style.badge, '#ffffff', 0.82);
    ctx.beginPath();
    ctx.arc(iconX, iconY, 9.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.withAlpha(style.border, 0.92);
    ctx.lineWidth = 1.1;
    ctx.stroke();
    this.drawUpgradeGlyph(card.type, iconX, iconY, 8, '#1f2230');

    ctx.fillStyle = committeeLocked ? '#ffd5a7' : style.hint;
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(committeeLocked ? 'COMMITTEE' : style.tag, textX, card.y - 15);

    ctx.fillStyle = style.title;
    ctx.font = '10px sans-serif';
    const titleText = this.fitUpgradeCardText(
      upgradeLabelForLevel(card.type, cardLevel),
      Math.max(20, card.w - 22),
      '10px sans-serif'
    );
    ctx.fillText(titleText, textX, card.y - 5);
    ctx.fillStyle = style.hint;
    ctx.font = '8px sans-serif';
    const hintText = this.fitUpgradeCardText(
      upgradeHintForLevel(card.type, cardLevel),
      Math.max(18, card.w - 24),
      '8px sans-serif'
    );
    ctx.fillText(hintText, textX, card.y + 4);
    ctx.fillStyle = style.cost;
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(`cost ${Math.max(1, Math.round(Number(card.cost) || 0))}`, card.x, card.y + 13);
    ctx.fillStyle = committeeLocked ? '#f5cfab' : style.hint;
    ctx.font = '8px sans-serif';
    ctx.fillText(
      committeeLocked
        ? (committeeVoteActive ? 'phone vote live' : 'phone vote decides')
        : 'shoot to choose',
      card.x,
      card.y + 20
    );
  }

  upgradeOptionSlotPosition(sideName, slot = 0, optionCount = 2) {
    const count = Math.max(0, Math.floor(Number(optionCount) || 0));
    if (count > 2) return sideCommitteeVoteSlotPosition(sideName, slot);
    const lane = Math.max(0, Math.min(1, Math.floor(Number(slot) || 0)));
    return { x: sideCardSlotX(sideName, lane), y: 90 };
  }

  drawCommitteeVoteCards(snapshot) {
    const votes = snapshot?.committeeVotes;
    if (!votes || typeof votes !== 'object') return;
    this.drawCommitteeVoteCardsForSide('left', votes.left);
    this.drawCommitteeVoteCardsForSide('right', votes.right);
  }

  drawCommitteeVoteCardsForSide(sideName, voteState) {
    if (!voteState?.active) return;
    const options = Array.isArray(voteState.options) ? voteState.options : [];
    if (!options.length) return;
    const totalVotes = options.reduce((sum, option) => sum + Math.max(0, Number(option?.votes) || 0), 0);
    const timerArmed = (Number(voteState?.resolveAt) || 0) > 0;
    const timerText = timerArmed
      ? `${Math.max(0, Number(voteState?.remaining) || 0).toFixed(1)}s`
      : 'await first vote';
    for (let i = 0; i < options.length; i += 1) {
      const option = options[i];
      const type = option?.type;
      if (!type) continue;
      const votesForOption = Math.max(0, Number(option?.votes) || 0);
      const votePct = totalVotes > 0 ? Math.round((votesForOption / totalVotes) * 100) : 0;
      const pos = this.upgradeOptionSlotPosition(sideName, i, options.length);
      this.drawCommitteeVoteCard(type, Number(option?.level) || 0, pos.x, pos.y, {
        votes: votesForOption,
        pct: votePct,
        timerText,
      });
    }
  }

  drawCommitteeVoteCard(type, level, centerX, centerY, info = {}) {
    if (!type) return;
    const { ctx } = this;
    const category = upgradeCategory(type);
    const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
    const cardW = UPGRADE_SELECTION_CARD_W;
    const cardH = UPGRADE_SELECTION_CARD_H;
    const cardLevel = Math.max(0, Number(level) || 0);
    const votes = Math.max(0, Number(info?.votes) || 0);
    const pct = Math.max(0, Math.min(100, Math.round(Number(info?.pct) || 0)));
    const timerText = String(info?.timerText || 'vote');

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.fillStyle = this.mixColor(style.panel, '#000000', 0.08);
    ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
    ctx.fillStyle = style.glow;
    ctx.fillRect(-cardW / 2 + 1, -cardH / 2 + 1, cardW - 2, cardH - 2);
    ctx.strokeStyle = '#f2a75c';
    ctx.lineWidth = 1.9;
    ctx.strokeRect(-cardW / 2, -cardH / 2, cardW, cardH);

    const iconX = -cardW / 2 + 11;
    const iconY = -cardH / 2 + 10.5;
    ctx.fillStyle = '#0c1526d4';
    ctx.beginPath();
    ctx.arc(iconX, iconY, 10.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.mixColor(style.badge, '#ffffff', 0.82);
    ctx.beginPath();
    ctx.arc(iconX, iconY, 9.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.withAlpha(style.border, 0.92);
    ctx.lineWidth = 1.1;
    ctx.stroke();
    this.drawUpgradeGlyph(type, iconX, iconY, 8, '#1f2230');

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd5a7';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('COMMITTEE', 10, -15);
    ctx.fillStyle = style.title;
    ctx.font = '10px sans-serif';
    const title = this.fitUpgradeCardText(
      upgradeLabelForLevel(type, cardLevel),
      Math.max(20, cardW - 22),
      '10px sans-serif'
    );
    ctx.fillText(title, 10, -5);

    ctx.fillStyle = style.hint;
    ctx.font = '8px sans-serif';
    ctx.fillText(`${votes} vote${votes === 1 ? '' : 's'} | ${timerText}`, 10, 4);

    const meterW = cardW - 18;
    const meterH = 5;
    const meterX = -meterW / 2;
    const meterY = 11;
    ctx.fillStyle = '#0f1b2f';
    ctx.fillRect(meterX, meterY, meterW, meterH);
    ctx.strokeStyle = '#2d4568';
    ctx.lineWidth = 1;
    ctx.strokeRect(meterX, meterY, meterW, meterH);
    if (pct > 0) {
      const fillW = Math.max(1, Math.round((meterW - 2) * (pct / 100)));
      const grad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
      grad.addColorStop(0, this.mixColor(style.badge, '#ffffff', 0.12));
      grad.addColorStop(1, this.mixColor(style.badge, '#ffe0a3', 0.3));
      ctx.fillStyle = grad;
      ctx.fillRect(meterX + 1, meterY + 1, fillW, Math.max(1, meterH - 2));
    }
    ctx.restore();
  }

  drawUpgradeSelectionFx(snapshot) {
    const fxBySide = snapshot?.upgradeSelectionFx;
    if (!fxBySide || typeof fxBySide !== 'object') return;
    this.drawUpgradeSelectionFxForSide('left', fxBySide.left);
    this.drawUpgradeSelectionFxForSide('right', fxBySide.right);
  }

  drawUpgradeSelectionFxForSide(sideName, fxEntry) {
    if (!fxEntry || typeof fxEntry !== 'object') return;
    const ttl = Math.max(0, Number(fxEntry.ttl) || 0);
    if (ttl <= 0) return;
    const maxTtl = Math.max(0.001, Number(fxEntry.maxTtl) || 1);
    const progress = clamp01(1 - ttl / maxTtl);
    const loserProgress = easeOutCubic(clamp01(progress / UPGRADE_SELECTION_LOSER_EXIT_PORTION));
    const winnerFadeProgress = easeInCubic(clamp01((progress - UPGRADE_SELECTION_WINNER_FADE_START) / (1 - UPGRADE_SELECTION_WINNER_FADE_START)));
    const selectedId = fxEntry.selectedOptionId == null ? null : String(fxEntry.selectedOptionId);
    const selectedType = fxEntry.selectedType || null;
    const options = Array.isArray(fxEntry.options) ? fxEntry.options : [];
    if (!options.length) return;

    for (let i = 0; i < options.length; i += 1) {
      const option = options[i];
      const type = option?.type || null;
      if (!type) continue;
      const optionId = option?.id == null ? null : String(option.id);
      const selected = Boolean(option?.selected)
        || (selectedId !== null && optionId !== null && optionId === selectedId)
        || (selectedId === null && selectedType && type === selectedType);
      const slot = Math.max(0, Math.floor(Number(option?.slot) || i));
      const basePos = this.upgradeOptionSlotPosition(sideName, slot, options.length);
      const baseX = Number(basePos?.x) || sideCardSlotX(sideName, 0);
      const baseY = Number(basePos?.y) || 90;
      const driftDir = sideName === 'right' ? 1 : -1;
      const driftX = selected ? 0 : driftDir * 26 * loserProgress;
      const driftY = selected ? (-2 * Math.sin(Math.min(1, progress / 0.23) * Math.PI)) : (-9 * loserProgress);
      const alpha = selected
        ? Math.max(0, 1 - winnerFadeProgress * 0.96)
        : Math.max(0, 1 - loserProgress);
      const scale = selected
        ? (1 + 0.07 * Math.sin(Math.min(1, progress / 0.23) * Math.PI))
        : (1 - 0.18 * loserProgress);
      this.drawUpgradeSelectionFxCard(type, Number(option?.level) || 0, selected, baseX + driftX, baseY + driftY, alpha, scale);
    }
  }

  drawUpgradeSelectionFxCard(type, level, selected, centerX, centerY, alpha = 1, scale = 1) {
    if (!type || alpha <= 0.01) return;
    const { ctx } = this;
    const category = upgradeCategory(type);
    const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
    const cardW = UPGRADE_SELECTION_CARD_W;
    const cardH = UPGRADE_SELECTION_CARD_H;
    const cardLevel = Math.max(0, Number(level) || 0);
    const panelColor = style.panel;
    const glowColor = style.glow;
    const borderColor = style.border;
    const tagColor = style.hint;
    const titleColor = style.title;
    const subColor = style.hint;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.fillStyle = panelColor;
    ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
    ctx.fillStyle = glowColor;
    ctx.fillRect(-cardW / 2 + 1, -cardH / 2 + 1, cardW - 2, cardH - 2);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(-cardW / 2, -cardH / 2, cardW, cardH);
    if (selected) {
      // Keep original card palette; use a ring to show selection.
      ctx.strokeStyle = this.withAlpha('#ffe4a0', 0.95);
      ctx.lineWidth = 2.1;
      ctx.strokeRect(-cardW / 2 - 3, -cardH / 2 - 3, cardW + 6, cardH + 6);
    }

    const iconX = -cardW / 2 + 11;
    const iconY = -cardH / 2 + 10.5;
    ctx.fillStyle = '#0c1526d8';
    ctx.beginPath();
    ctx.arc(iconX, iconY, 10.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.mixColor(style.badge, '#ffffff', 0.82);
    ctx.beginPath();
    ctx.arc(iconX, iconY, 9.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.withAlpha(style.border, 0.95);
    ctx.lineWidth = 1.1;
    ctx.stroke();
    this.drawUpgradeGlyph(type, iconX, iconY, 8, '#1f2230');

    const textX = 10;
    ctx.textAlign = 'center';
    ctx.fillStyle = tagColor;
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText(style.tag, textX, -15);
    ctx.fillStyle = titleColor;
    ctx.font = '10px sans-serif';
    const title = this.fitUpgradeCardText(
      upgradeLabelForLevel(type, cardLevel),
      Math.max(20, cardW - 22),
      '10px sans-serif'
    );
    ctx.fillText(title, textX, -5);
    ctx.fillStyle = subColor;
    ctx.font = '8px sans-serif';
    const subText = selected ? 'selected' : 'not chosen';
    ctx.fillText(subText, textX, 4);
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText(`L${cardLevel}`, 0, 20);
    ctx.restore();
  }

  drawShotPowerIcon(powerType, x, y, size = 16, side = 'left', options = {}) {
    if (!powerType) return;
    const { ctx } = this;
    const drawBadge = options?.drawBadge !== false;
    const radius = Math.max(drawBadge ? 10 : 4, size);
    const iconSizeMultiplier = drawBadge ? 1.35 : 0.86;
    const outlineColor = side === 'right' ? '#ff6a6a' : '#4da7ff';
    const fg = powerType === 'flameShot' ? '#ffae2b'
      : powerType === 'pierceShot' ? '#80d1ff'
      : powerType === 'ultraShot' ? '#b877ff'
      : powerType === 'flareShot' ? '#ffd268'
      : '#96ed79';

    ctx.save();
    ctx.translate(x, y);

    if (drawBadge) {
      // Draw smaller base circle (0.9x gold resource) with side outline.
      ctx.fillStyle = '#1a1f2a';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.9, 0, Math.PI * 2);
      ctx.stroke();
    }

    const emojiSpec = SHOT_POWER_TWEMOJI_GLYPHS[powerType] || null;
    if (emojiSpec) {
      const image = this.getUpgradeGlyphImage(emojiSpec.src);
      if (image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0) {
        const drawSize = Math.max(drawBadge ? 12 : 7, radius * emojiSpec.scale * iconSizeMultiplier);
        const offsetY = radius * emojiSpec.yOffset * (drawBadge ? 1 : 0.62);
        ctx.drawImage(image, -drawSize / 2, offsetY - drawSize / 2, drawSize, drawSize);
        ctx.restore();
        return;
      }
    }

    // Fallback custom shapes while SVG is still loading.
    const iconScale = radius * (drawBadge ? 1.35 : 0.95) * iconSizeMultiplier;
    ctx.fillStyle = fg;
    if (powerType === 'multiShot') {
      for (let dx = -iconScale * 0.2; dx <= iconScale * 0.2; dx += iconScale * 0.2) {
        ctx.beginPath();
        ctx.arc(dx, 0, iconScale * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (powerType === 'ultraShot') {
      ctx.beginPath();
      ctx.moveTo(0, -iconScale * 0.4);
      ctx.lineTo(iconScale * 0.2, 0);
      ctx.lineTo(iconScale * 0.5, iconScale * 0.05);
      ctx.lineTo(iconScale * 0.25, iconScale * 0.2);
      ctx.lineTo(iconScale * 0.3, iconScale * 0.45);
      ctx.lineTo(0, iconScale * 0.3);
      ctx.lineTo(-iconScale * 0.3, iconScale * 0.45);
      ctx.lineTo(-iconScale * 0.25, iconScale * 0.2);
      ctx.lineTo(-iconScale * 0.5, iconScale * 0.05);
      ctx.lineTo(-iconScale * 0.2, 0);
      ctx.closePath();
      ctx.fill();
    } else if (powerType === 'pierceShot') {
      ctx.beginPath();
      ctx.moveTo(-iconScale * 0.4, -iconScale * 0.2);
      ctx.lineTo(iconScale * 0.45, 0);
      ctx.lineTo(-iconScale * 0.4, iconScale * 0.2);
      ctx.closePath();
      ctx.fill();
    } else if (powerType === 'flameShot') {
      ctx.beginPath();
      ctx.moveTo(0, -iconScale * 0.45);
      ctx.bezierCurveTo(iconScale * 0.45, -iconScale * 0.07, iconScale * 0.3, iconScale * 0.2, 0, iconScale * 0.45);
      ctx.bezierCurveTo(-iconScale * 0.3, iconScale * 0.2, -iconScale * 0.45, -iconScale * 0.07, 0, -iconScale * 0.45);
      ctx.fill();
    } else if (powerType === 'flareShot') {
      ctx.beginPath();
      ctx.arc(0, 0, iconScale * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = drawBadge ? '#fff9d3' : this.withAlpha(outlineColor, 0.85);
      ctx.lineWidth = drawBadge ? 1.4 : 1.1;
      ctx.beginPath();
      ctx.arc(0, 0, iconScale * 0.35, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, iconScale * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawShotPower(power) {
    this.drawShotPowerIcon(power.type, power.x, power.y, power.r * 0.9, power.side);
  }

  drawCannonBall(ball) {
    if (!ball) return;
    const { ctx } = this;
    const x = Number(ball.x) || 0;
    const y = Number(ball.y) || 0;
    const r = Math.max(6, Number(ball.r) || 12);
    const sideName = ball.side === 'right' ? 'right' : 'left';
    const tint = sideName === 'left' ? '#87baff' : '#ff9f9f';
    const phase = typeof ball.phase === 'string' ? ball.phase : 'fall';
    const isFlareStrike = Boolean(ball.isFlareStrike);
    const flareX = Number.isFinite(Number(ball.impactX)) ? Number(ball.impactX) : x;
    const flareY = Number.isFinite(Number(ball.impactY)) ? Number(ball.impactY) : y;
    const pulseT = performance.now() * 0.001 + (Number(ball.id) || 0) * 0.27;
    const pulse = 0.72 + Math.sin(pulseT * 9.2) * 0.28;
    const signalTtl = Math.max(0, Number(ball.signalFlareTtl) || 0);
    const signalMax = Math.max(0.01, Number(ball.signalFlareMaxTtl) || 0.36);
    const signalLife = Math.max(0, Math.min(1, signalTtl / signalMax));
    const signalX = Number.isFinite(Number(ball.signalFlareX)) ? Number(ball.signalFlareX) : flareX;
    const signalY = Number.isFinite(Number(ball.signalFlareY)) ? Number(ball.signalFlareY) : flareY;

    const drawSignalFlare = () => {
      if (signalLife <= 0) return;
      const launch = 1 - signalLife;
      const topY = signalY - launch * (signalY + 84);
      ctx.save();
      ctx.globalAlpha = 0.28 + signalLife * 0.62;
      const beam = ctx.createLinearGradient(signalX, signalY, signalX, topY);
      beam.addColorStop(0, '#ffdca3');
      beam.addColorStop(0.35, '#ffad68');
      beam.addColorStop(1, '#ff7c4500');
      ctx.strokeStyle = beam;
      ctx.lineWidth = 2.2 + signalLife * 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(signalX, signalY - 2);
      ctx.lineTo(signalX, topY);
      ctx.stroke();
      ctx.globalAlpha = 0.5 + signalLife * 0.35;
      ctx.fillStyle = '#ffeec8';
      ctx.beginPath();
      ctx.arc(signalX, topY, 1.9 + signalLife * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawFlareMarker = (markerAlpha = 1) => {
      ctx.save();
      const flareGlow = ctx.createRadialGradient(flareX, flareY, 2, flareX, flareY, 22 + pulse * 16);
      flareGlow.addColorStop(0, '#fff5d1');
      flareGlow.addColorStop(0.38, '#ffaf64d6');
      flareGlow.addColorStop(1, '#ff7c4500');
      ctx.globalAlpha = (0.42 + pulse * 0.33) * markerAlpha;
      ctx.fillStyle = flareGlow;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 22 + pulse * 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = (0.6 + pulse * 0.35) * markerAlpha;
      ctx.strokeStyle = '#ffd59a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 8 + pulse * 3.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    if (phase === 'flare') {
      drawSignalFlare();
      drawFlareMarker(0.52);
      const vx = Number(ball.vx) || 0;
      const vy = Number(ball.vy) || -1;
      const ang = Math.atan2(vy, vx);
      const nx = Math.cos(ang);
      const ny = Math.sin(ang);
      const trailLen = r * 4.6;
      ctx.save();
      ctx.globalAlpha = 0.92;
      const trail = ctx.createLinearGradient(x, y, x - nx * trailLen, y - ny * trailLen);
      trail.addColorStop(0, '#fff5d8');
      trail.addColorStop(0.45, `${tint}bb`);
      trail.addColorStop(1, `${tint}00`);
      ctx.strokeStyle = trail;
      ctx.lineWidth = Math.max(2.4, r * 0.34);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - nx * trailLen, y - ny * trailLen);
      ctx.stroke();
      ctx.fillStyle = '#ffe2b5';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2.8, r * 0.36), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Airstrike flare marker: persists until its bomb impacts.
    drawSignalFlare();
    drawFlareMarker(1);

    if (phase === 'mark') {
      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = '#ffe8b7';
      ctx.beginPath();
      ctx.arc(flareX, flareY - 2.2, 2.8 + pulse * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff934e';
      ctx.beginPath();
      ctx.arc(flareX + Math.sin(pulseT * 7) * 1.2, flareY - 5.8, 1.8 + pulse * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (isFlareStrike) {
      const vx = Number(ball.vx) || 0;
      const vy = Number(ball.vy) || 1;
      const ang = Math.atan2(vy, vx || 0.0001);
      const nx = Math.cos(ang);
      const ny = Math.sin(ang);
      const len = Math.max(34, r * 4.4);
      const shaftW = Math.max(2.8, r * 0.34);
      const trailLen = len * 2.4;

      ctx.save();
      const trail = ctx.createLinearGradient(x, y, x - nx * trailLen, y - ny * trailLen);
      trail.addColorStop(0, '#fff6e2');
      trail.addColorStop(0.42, '#ffc36eb8');
      trail.addColorStop(1, '#ff9c5c00');
      ctx.strokeStyle = trail;
      ctx.lineWidth = Math.max(2.6, r * 0.36);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - nx * trailLen, y - ny * trailLen);
      ctx.stroke();
      ctx.lineCap = 'butt';

      const glow = ctx.createRadialGradient(x, y, 2, x, y, len * 0.95);
      glow.addColorStop(0, '#fff7deaa');
      glow.addColorStop(0.5, '#ffbd7066');
      glow.addColorStop(1, '#ff9a5f00');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, len * 0.95, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(x, y);
      ctx.rotate(ang);

      ctx.strokeStyle = '#f5dfc0';
      ctx.lineWidth = shaftW;
      ctx.beginPath();
      ctx.moveTo(-len * 0.52, 0);
      ctx.lineTo(len * 0.42, 0);
      ctx.stroke();

      ctx.strokeStyle = '#fff5e6';
      ctx.lineWidth = Math.max(1.1, shaftW * 0.35);
      ctx.beginPath();
      ctx.moveTo(-len * 0.48, 0);
      ctx.lineTo(len * 0.34, 0);
      ctx.stroke();

      ctx.fillStyle = '#ffbf74';
      ctx.beginPath();
      ctx.moveTo(len * 0.55, 0);
      ctx.lineTo(len * 0.3, -Math.max(5.5, r * 0.62));
      ctx.lineTo(len * 0.3, Math.max(5.5, r * 0.62));
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#8a5f39';
      ctx.fillRect(-len * 0.52, -1.3, len * 0.1, 2.6);

      ctx.fillStyle = '#ffdca9';
      ctx.beginPath();
      ctx.moveTo(-len * 0.58, 0);
      ctx.lineTo(-len * 0.34, -Math.max(4.4, r * 0.46));
      ctx.lineTo(-len * 0.38, 0);
      ctx.lineTo(-len * 0.34, Math.max(4.4, r * 0.46));
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      return;
    }

    const glow = ctx.createRadialGradient(x, y, 2, x, y, r * 2.4);
    glow.addColorStop(0, '#fff4d1bb');
    glow.addColorStop(0.45, `${tint}66`);
    glow.addColorStop(1, `${tint}00`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2a2f3a';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c7d2e8';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = '#ffd8a6';
    ctx.beginPath();
    ctx.arc(x - r * 0.22, y - r * 0.24, Math.max(1.3, r * 0.22), 0, Math.PI * 2);
    ctx.fill();
  }

  drawResourceNode(res) {
    const { ctx } = this;
    const progress = this.resourceAppearProgress(res);
    const eased = easeOutCubic(progress);
    const scale = lerp(RESOURCE_APPEAR_START_SCALE, 1, eased);
    const alpha = lerp(RESOURCE_APPEAR_START_ALPHA, 1, eased);

    ctx.save();
    ctx.translate(res.x, res.y);
    ctx.scale(scale, scale);
    ctx.globalAlpha *= alpha;

    ctx.fillStyle = '#fef1b8';
    ctx.beginPath();
    ctx.arc(0, 0, res.r + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f4c95d';
    ctx.beginPath();
    ctx.moveTo(0, -res.r);
    ctx.lineTo(res.r, 0);
    ctx.lineTo(0, res.r);
    ctx.lineTo(-res.r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9a7a20';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#3b2b12';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${res.value}`, 0, 4);
    ctx.restore();
  }

  drawCandleScorch(scorch) {
    if (!scorch) return;
    const { ctx } = this;
    const t = performance.now() * 0.001;
    const pulse = 0.75 + Math.sin(t * 6.5) * 0.25;
    const towerBlaze = scorch.towerSide === 'left' || scorch.towerSide === 'right';
    const alpha = Math.max(0.2, Math.min(1, (Number(scorch.ttl) || 0) / 4.2));
    const r = Math.max(36, Number(scorch.r) || 90);
    const x = Number(scorch.x) || 0;
    const y = Number(scorch.y) || 0;

    ctx.save();
    ctx.globalAlpha = 0.35 + alpha * (towerBlaze ? 0.62 : 0.45);
    const burn = ctx.createRadialGradient(x, y, 8, x, y, r);
    burn.addColorStop(0, '#ffb26788');
    burn.addColorStop(0.3, towerBlaze ? '#ff7b3f88' : '#e36a3d66');
    burn.addColorStop(0.72, '#4e231f99');
    burn.addColorStop(1, '#00000000');
    ctx.fillStyle = burn;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.3 + alpha * 0.5;
    ctx.fillStyle = '#1a0b08c9';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    const tongues = towerBlaze ? 8 : 5;
    for (let i = 0; i < tongues; i += 1) {
      const phase = t * (5.8 + i * 0.7) + i * 1.5;
      const fx = x + Math.cos((Math.PI * 2 * i) / tongues + t * 0.5) * (r * 0.36);
      const fy = y - (towerBlaze ? 10 : 5) + Math.sin(phase * 0.8) * 2.2;
      const h = (towerBlaze ? 20 : 12) + pulse * (towerBlaze ? 11 : 7) + Math.sin(phase) * 3;
      const w = 5 + Math.cos(phase * 1.1) * 1.4;

      const flame = ctx.createLinearGradient(fx, fy + 8, fx, fy - h);
      flame.addColorStop(0, '#ff5f35');
      flame.addColorStop(0.48, '#ffaf52');
      flame.addColorStop(1, '#fff1bd');
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(fx, fy - h);
      ctx.bezierCurveTo(fx + w, fy - h * 0.5, fx + w * 0.7, fy + h * 0.14, fx, fy + h * 0.45);
      ctx.bezierCurveTo(fx - w * 0.7, fy + h * 0.14, fx - w, fy - h * 0.5, fx, fy - h);
      ctx.fill();
    }

    const smokeShieldTtl = Math.max(0, Number(scorch.smokeShieldTtl) || 0);
    if (smokeShieldTtl > 0) {
      const smokeShieldMaxTtl = Math.max(0.01, Number(scorch.smokeShieldMaxTtl) || 3.5);
      const life = Math.max(0, Math.min(1, smokeShieldTtl / smokeShieldMaxTtl));
      const smokeX = x;
      const smokeY = y + (Number(scorch.smokeShieldYOffset) || -28);
      const smokeRx = Math.max(0, Number(scorch.smokeShieldRx) || 0) * life;
      const smokeRy = Math.max(0, Number(scorch.smokeShieldRy) || 0) * life;
      if (smokeRx <= 0.6 || smokeRy <= 0.6) {
        ctx.restore();
        return;
      }
      const breathe = Math.sin(t * 5.1 + r * 0.02) * 0.06;
      const domeRx = smokeRx * (1 + breathe * 0.55);
      const domeRy = smokeRy * (1 + breathe * 0.32);

      ctx.globalAlpha = 0.05 + life * 0.51;
      const cloud = ctx.createRadialGradient(
        smokeX,
        smokeY - domeRy * 0.62,
        4,
        smokeX,
        smokeY,
        domeRx
      );
      cloud.addColorStop(0, '#f8fcffcc');
      cloud.addColorStop(0.42, '#d7deea99');
      cloud.addColorStop(1, '#8a97a800');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.ellipse(smokeX, smokeY, domeRx, domeRy, 0, Math.PI, Math.PI * 2, false);
      ctx.lineTo(smokeX + domeRx * 0.82, smokeY + domeRy * 0.24);
      ctx.quadraticCurveTo(smokeX, smokeY + domeRy * 0.46, smokeX - domeRx * 0.82, smokeY + domeRy * 0.24);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.06 + life * 0.6;
      ctx.strokeStyle = '#f5fbff';
      ctx.lineWidth = 1.3 + life * 1.2;
      ctx.beginPath();
      ctx.ellipse(smokeX, smokeY, domeRx * 0.97, domeRy * 0.95, 0, Math.PI, Math.PI * 2, false);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCandle(candle) {
    if (!candle) return;
    const { ctx } = this;
    const x = Number(candle.x) || 0;
    const y = Number(candle.y) || 0;
    const wax = Math.max(0, Number(candle.wax) || 0);
    const waxMax = Math.max(1, Number(candle.waxMax) || 1);
    const waxPct = Math.max(0, Math.min(1, wax / waxMax));
    const time = performance.now() * 0.001;
    const cartHalf = Math.max(28, Number(candle.cartHalfW) || 34);
    const pulse = Number(candle.flamePulse) || 0;
    const flicker = Math.sin(time * 7.8 + pulse) * 0.45
      + Math.sin(time * 12.2 + pulse * 0.6) * 0.22;
    ctx.save();

    if (candle.destroyed) {
      const ember = ctx.createRadialGradient(x, y - 7, 2, x, y - 7, 24);
      ember.addColorStop(0, '#ffd29f');
      ember.addColorStop(0.45, '#ff7b4d');
      ember.addColorStop(1, '#00000000');
      ctx.fillStyle = ember;
      ctx.beginPath();
      ctx.arc(x, y - 7, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3d302a';
      ctx.fillRect(x - 10, y - 6, 20, 18);
      ctx.fillStyle = '#1f1a17';
      ctx.fillRect(x - 3, y - 14, 6, 8);

      const cd = Math.max(0, Math.ceil(Number(candle.respawnCd) || 0));
      if (cd > 0) {
        ctx.fillStyle = '#f7d8a8';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Relight ${cd}s`, x, y - 20);
      }
      ctx.restore();
      return;
    }

    // Cart shadow
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y + 28, cartHalf + 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const smokeShieldTtl = Math.max(0, Number(candle.smokeShieldTtl) || 0);
    if (smokeShieldTtl > 0) {
      const life = Math.max(0, Math.min(1, smokeShieldTtl / 3.5));
      const smokeX = x;
      const smokeY = y - 8;
      const smokeRx = (cartHalf + 18) * 3;
      const smokeRy = 30 * 3;
      const pulseBreathe = Math.sin(time * 6.3 + pulse * 0.6) * 0.06;
      const domeRx = smokeRx * (1 + pulseBreathe * 0.6);
      const domeRy = smokeRy * (1 + pulseBreathe * 0.35);

      ctx.save();
      ctx.globalAlpha = 0.24 + life * 0.34;
      const cloud = ctx.createRadialGradient(
        smokeX,
        smokeY - domeRy * 0.62,
        4,
        smokeX,
        smokeY,
        domeRx
      );
      cloud.addColorStop(0, '#f6fbffcc');
      cloud.addColorStop(0.4, '#d6dde8aa');
      cloud.addColorStop(1, '#8a97a800');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.ellipse(smokeX, smokeY, domeRx, domeRy, 0, Math.PI, Math.PI * 2, false);
      ctx.lineTo(smokeX + domeRx * 0.84, smokeY + domeRy * 0.24);
      ctx.quadraticCurveTo(smokeX, smokeY + domeRy * 0.44, smokeX - domeRx * 0.84, smokeY + domeRy * 0.24);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.22 + life * 0.4;
      ctx.strokeStyle = '#f4fbff';
      ctx.lineWidth = 1.2 + life * 1.1;
      ctx.beginPath();
      ctx.ellipse(smokeX, smokeY, domeRx * 0.96, domeRy * 0.94, 0, Math.PI, Math.PI * 2, false);
      ctx.stroke();

      for (let i = 0; i < 5; i += 1) {
        const phase = time * (1.6 + i * 0.22) + i * 1.7 + pulse * 0.32;
        const px = smokeX + Math.cos(phase) * domeRx * 0.52;
        const py = smokeY - domeRy * (0.14 + (i % 3) * 0.16) + Math.sin(phase * 0.8) * 2.6;
        const pr = 4.6 + (i % 2) * 2.3;
        ctx.globalAlpha = 0.16 + life * 0.22;
        ctx.fillStyle = '#eff4fb';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const wheelY = y + 20;
    const wheelR = 9;
    for (const wx of [x - cartHalf + 7, x + cartHalf - 7]) {
      ctx.fillStyle = '#2c241f';
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8f7656';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.strokeStyle = '#c6a77b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx - wheelR + 2, wheelY);
      ctx.lineTo(wx + wheelR - 2, wheelY);
      ctx.moveTo(wx, wheelY - wheelR + 2);
      ctx.lineTo(wx, wheelY + wheelR - 2);
      ctx.stroke();
    }

    const cartGrad = ctx.createLinearGradient(x - cartHalf, y, x + cartHalf, y);
    cartGrad.addColorStop(0, '#6a5238');
    cartGrad.addColorStop(0.5, '#8c6a45');
    cartGrad.addColorStop(1, '#6a5238');
    ctx.fillStyle = cartGrad;
    ctx.fillRect(x - cartHalf, y + 7, cartHalf * 2, 10);
    ctx.strokeStyle = '#d2b180';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x - cartHalf, y + 7, cartHalf * 2, 10);

    ctx.fillStyle = '#4f3f31';
    ctx.fillRect(x - cartHalf + 5, y + 2, cartHalf * 2 - 10, 6);
    ctx.strokeStyle = '#b69266';
    ctx.strokeRect(x - cartHalf + 5, y + 2, cartHalf * 2 - 10, 6);

    // Pull/push handles so carrier spacing reads clearly.
    ctx.strokeStyle = '#c7a879';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + cartHalf, y + 9);
    ctx.lineTo(x + cartHalf + 18, y + 2);
    ctx.moveTo(x - cartHalf, y + 9);
    ctx.lineTo(x - cartHalf - 18, y + 2);
    ctx.stroke();

    const bodyH = 18 + waxPct * 34;
    const bodyW = 18;
    const deckY = y + 5;
    const topY = deckY - bodyH;
    const waxGrad = ctx.createLinearGradient(x, topY, x, deckY + 2);
    waxGrad.addColorStop(0, '#fff6df');
    waxGrad.addColorStop(0.42, '#fee9c8');
    waxGrad.addColorStop(1, '#d9c29a');
    ctx.fillStyle = waxGrad;
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.5, deckY + 2);
    ctx.lineTo(x - bodyW * 0.5, topY + 8);
    ctx.quadraticCurveTo(x - bodyW * 0.45, topY, x - bodyW * 0.3, topY);
    ctx.lineTo(x + bodyW * 0.3, topY);
    ctx.quadraticCurveTo(x + bodyW * 0.45, topY, x + bodyW * 0.5, topY + 8);
    ctx.lineTo(x + bodyW * 0.5, deckY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ceb58a';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    ctx.fillStyle = '#f7e7c4';
    ctx.beginPath();
    ctx.arc(x, topY + 3, bodyW * 0.46, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ecddbe';
    ctx.fillRect(x - 6, topY + 7, 3.5, 11 + (1 - waxPct) * 5);
    ctx.fillRect(x + 2.5, topY + 6, 2.8, 9 + (1 - waxPct) * 4);

    const wickY = topY - 2;
    ctx.strokeStyle = '#2e241d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, wickY + 7);
    ctx.lineTo(x, wickY - 2);
    ctx.stroke();

    const burstLife = Math.max(0, Math.min(1, (Number(candle.flameBurstTtl) || 0) / 0.26));
    const flameBoost = Math.max(0, Number(candle.flameBoost) || 0) * burstLife;
    const flameH = 28 + flicker * 2.1 + flameBoost * 10;
    const flameW = 11 + Math.max(0, flicker) * 1.25 + flameBoost * 3.4;
    const flameX = x + Math.sin(time * 6.2 + pulse) * 1.1;
    const flameY = wickY - flameH * 0.28;

    const outerGlow = ctx.createRadialGradient(flameX, flameY, 2, flameX, flameY, flameH * 1.2);
    outerGlow.addColorStop(0, 'rgba(255, 243, 176, 0.45)');
    outerGlow.addColorStop(0.4, 'rgba(255, 164, 74, 0.26)');
    outerGlow.addColorStop(1, 'rgba(255, 90, 40, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(flameX, flameY, flameH * 1.2, 0, Math.PI * 2);
    ctx.fill();

    const outerFlame = ctx.createLinearGradient(flameX, flameY + flameH * 0.56, flameX, flameY - flameH);
    outerFlame.addColorStop(0, '#ff5d33');
    outerFlame.addColorStop(0.48, '#ffb34f');
    outerFlame.addColorStop(1, '#fff7cb');
    ctx.fillStyle = outerFlame;
    ctx.beginPath();
    ctx.moveTo(flameX, flameY - flameH);
    ctx.bezierCurveTo(
      flameX + flameW,
      flameY - flameH * 0.36,
      flameX + flameW * 0.74,
      flameY + flameH * 0.2,
      flameX,
      flameY + flameH * 0.56
    );
    ctx.bezierCurveTo(
      flameX - flameW * 0.74,
      flameY + flameH * 0.2,
      flameX - flameW,
      flameY - flameH * 0.36,
      flameX,
      flameY - flameH
    );
    ctx.fill();

    const innerFlame = ctx.createLinearGradient(flameX, flameY + flameH * 0.26, flameX, flameY - flameH * 0.56);
    innerFlame.addColorStop(0, '#ffb347');
    innerFlame.addColorStop(0.58, '#fff8d0');
    innerFlame.addColorStop(1, '#ffffff');
    ctx.fillStyle = innerFlame;
    ctx.beginPath();
    ctx.moveTo(flameX, flameY - flameH * 0.58);
    ctx.bezierCurveTo(
      flameX + flameW * 0.45,
      flameY - flameH * 0.2,
      flameX + flameW * 0.3,
      flameY + flameH * 0.08,
      flameX,
      flameY + flameH * 0.3
    );
    ctx.bezierCurveTo(
      flameX - flameW * 0.3,
      flameY + flameH * 0.08,
      flameX - flameW * 0.45,
      flameY - flameH * 0.2,
      flameX,
      flameY - flameH * 0.58
    );
    ctx.fill();

    const beamTtl = Math.max(0, Number(candle.flameBeamTtl) || 0);
    if (beamTtl > 0) {
      const toX = Number.isFinite(candle.flameBeamToX) ? candle.flameBeamToX : flameX + 120;
      const toY = Number.isFinite(candle.flameBeamToY) ? candle.flameBeamToY : flameY + 8;
      const beamLife = Math.max(0, Math.min(1, beamTtl / 0.24));
      const arc = Math.sin(time * 15 + pulse) * 8;

      ctx.save();
      ctx.globalAlpha = 0.4 + beamLife * 0.5;
      const beamGrad = ctx.createLinearGradient(flameX, flameY, toX, toY);
      beamGrad.addColorStop(0, '#fff1b2');
      beamGrad.addColorStop(0.34, '#ffbb4e');
      beamGrad.addColorStop(0.75, '#ff7a33');
      beamGrad.addColorStop(1, '#ff4c2c');
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 6 + beamLife * 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(flameX, flameY);
      ctx.quadraticCurveTo(
        (flameX + toX) * 0.5 + arc,
        (flameY + toY) * 0.5 - 10 - beamLife * 5,
        toX,
        toY
      );
      ctx.stroke();

      ctx.globalAlpha = 0.58 + beamLife * 0.35;
      ctx.fillStyle = '#ffe7a0';
      ctx.beginPath();
      ctx.arc(flameX, flameY, 3 + beamLife * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const hitFlashTtl = Math.max(0, Number(candle.flameHitFlashTtl) || 0);
    if (hitFlashTtl > 0) {
      const flashLife = Math.max(0, Math.min(1, hitFlashTtl / 0.28));
      ctx.save();
      ctx.globalAlpha = 0.32 + flashLife * 0.56;
      const blast = ctx.createRadialGradient(flameX, flameY, 2, flameX, flameY, 38 + flashLife * 20);
      blast.addColorStop(0, '#fff4be');
      blast.addColorStop(0.2, '#ffbe69');
      blast.addColorStop(0.55, '#ff6a3f');
      blast.addColorStop(1, '#00000000');
      ctx.fillStyle = blast;
      ctx.beginPath();
      ctx.arc(flameX, flameY, 38 + flashLife * 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.4 + flashLife * 0.38;
      ctx.strokeStyle = '#ffd58f';
      ctx.lineWidth = 1.8 + flashLife * 1.4;
      ctx.beginPath();
      ctx.arc(flameX, flameY, 18 + flashLife * 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  drawMinionHpBar(minion, x, y, scale = 1) {
    const { ctx } = this;
    const hpPct = Math.max(0, minion.hp / minion.maxHp);
    const hpW = 36 * scale;
    const hpX = x - hpW / 2;
    const hpY = y - (26 * scale + 2);
    ctx.fillStyle = '#101420cc';
    ctx.fillRect(hpX, hpY, hpW, 5);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * hpPct, 5);
    this.drawHealthBarNotches(hpX, hpY, hpW, 5, minion.maxHp);

    const reviveShieldMax = Math.max(0, Number(minion.reviveShieldMax) || 0);
    const reviveShieldHp = Math.max(0, Number(minion.reviveShieldHp) || 0);
    const reviveShieldTtl = Math.max(0, Number(minion.reviveShieldTtl) || 0);
    const reviveShieldMaxTtl = Math.max(0.01, Number(minion.reviveShieldMaxTtl) || 2);
    if (reviveShieldMax > 0 && reviveShieldHp > 0 && reviveShieldTtl > 0) {
      const frac = Math.max(0, Math.min(1, reviveShieldHp / reviveShieldMax));
      const fade = Math.max(0, Math.min(1, reviveShieldTtl / reviveShieldMaxTtl));
      const sy = hpY - 9;
      ctx.fillStyle = '#0d1524cc';
      ctx.fillRect(hpX, sy, hpW, 3);
      ctx.fillStyle = this.withAlpha('#eff7ff', 0.38 + fade * 0.5);
      ctx.fillRect(hpX, sy, hpW * frac, 3);
    }

    if (minion.necrominion) {
      const shieldMax = Math.max(0, Number(minion.necroShieldMax) || 0);
      const shieldHp = Math.max(0, Number(minion.necroShieldHp) || 0);
      const shieldTtl = Math.max(0, Number(minion.necroShieldTtl) || 0);
      const shieldMaxTtl = Math.max(0.01, Number(minion.necroShieldMaxTtl) || 20);
      if (shieldMax > 0 && shieldHp > 0 && shieldTtl > 0) {
        const hpFrac = Math.max(0, Math.min(1, shieldHp / shieldMax));
        const fade = Math.max(0, Math.min(1, shieldTtl / shieldMaxTtl));
        const sy = hpY - 5;
        ctx.fillStyle = '#0d1524cc';
        ctx.fillRect(hpX, sy, hpW, 3);
        ctx.fillStyle = this.withAlpha('#97f5ff', 0.35 + fade * 0.5);
        ctx.fillRect(hpX, sy, hpW * hpFrac, 3);
      }
    }
  }

  drawExecutiveOrderEffects(minions) {
    if (!Array.isArray(minions) || !minions.length) return;
    const { ctx } = this;
    for (const minion of minions) {
      if (!minion || minion.removed) continue;
      const hitsLeft = Math.max(0, Math.round(Number(minion.executiveOrderHitsLeft) || 0));
      const hitsMax = Math.max(1, Math.round(Number(minion.executiveOrderHitsMax) || 4));
      const breakTtl = Math.max(0, Number(minion.executiveOrderBreakTtl) || 0);
      if (hitsLeft <= 0 && breakTtl <= 0) continue;
      const x = Number(minion.x) || 0;
      const y = Number(minion.y) || 0;
      const sideDir = minion.side === 'left' ? 1 : -1;
      const r = Math.max(10, Number(minion.r) || 14);
      const iconX = x + sideDir * r * 0.6;
      const iconY = y - r * 1.24;

      if (hitsLeft > 0) {
        const frac = Math.max(0, Math.min(1, hitsLeft / hitsMax));
        const ringR = r * 1.18;
        ctx.strokeStyle = this.withAlpha('#f8f1cf', 0.35 + frac * 0.34);
        ctx.lineWidth = 1.5 + frac * 1.2;
        ctx.beginPath();
        ctx.arc(x, y - r * 0.05, ringR, 0, Math.PI * 2);
        ctx.stroke();

        const docW = 11;
        const docH = 8.4;
        const fold = 2.2;
        ctx.save();
        ctx.translate(iconX, iconY);
        ctx.rotate(sideDir * 0.16);
        ctx.fillStyle = '#f2e7bf';
        ctx.beginPath();
        ctx.moveTo(-docW * 0.5, -docH * 0.5);
        ctx.lineTo(docW * 0.5 - fold, -docH * 0.5);
        ctx.lineTo(docW * 0.5, -docH * 0.5 + fold);
        ctx.lineTo(docW * 0.5, docH * 0.5);
        ctx.lineTo(-docW * 0.5, docH * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#9f8458';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(docW * 0.5 - fold, -docH * 0.5);
        ctx.lineTo(docW * 0.5 - fold, -docH * 0.5 + fold);
        ctx.lineTo(docW * 0.5, -docH * 0.5 + fold);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#2d2418';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${hitsLeft}`, iconX, iconY + 2.5);
      }

      if (breakTtl > 0) {
        const life = Math.max(0, Math.min(1, breakTtl / 0.55));
        const shardCount = 5;
        for (let i = 0; i < shardCount; i += 1) {
          const ang = (Math.PI * 2 * i) / shardCount + i * 0.34;
          const dist = (1 - life) * (10 + i * 2);
          const sx = iconX + Math.cos(ang) * dist;
          const sy = iconY + Math.sin(ang) * dist;
          ctx.fillStyle = this.withAlpha('#f2e7bf', 0.4 + life * 0.5);
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2 + life * 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  minionHitFlashLife(minion) {
    if (!minion) return 0;
    const ttl = Math.max(0, Number(minion.hitFlashTtl) || 0);
    return Math.max(0, Math.min(1, ttl / MINION_HIT_FLASH_TTL));
  }

  balloonCollisionCircles(minion) {
    if (!minion || !minion.balloon) return null;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const r = Math.max(16, Number(minion.r) || 16);
    const topY = y - r * 0.24;
    const basketY = y + r;
    return [
      { x, y: topY, r: r * 0.62 },
      { x, y: basketY, r: r * 0.34 * 1.32 },
    ];
  }

  drawBalloonHitFlash(minion) {
    if (!minion || !minion.balloon) return;
    const ttl = Math.max(0, Number(minion.balloonHitCircleTtl) || 0);
    const fallbackTtl = Math.max(0, Number(minion.hitFlashTtl) || 0);
    const activeTtl = ttl > 0 ? ttl : fallbackTtl;
    if (activeTtl <= 0) return;

    const circles = this.balloonCollisionCircles(minion);
    if (!Array.isArray(circles) || !circles.length) return;

    const sideName = minion?.side === 'right' ? 'right' : 'left';
    const hitCore = sideName === 'right' ? '#ffdede' : '#e6f4ff';
    const hitMid = sideName === 'right' ? '#ff8f8f' : '#72bcff';
    const hitStroke = sideName === 'right' ? '#ff6d6d' : '#4da7ff';
    const life = Math.max(0, Math.min(1, activeTtl / MINION_HIT_FLASH_TTL));
    const rawHitIndex = Number(minion.balloonHitCircleIndex);
    const fallbackIndex = Math.max(0, circles.length - 1);
    const desiredIndex = Number.isFinite(rawHitIndex) && rawHitIndex >= 0
      ? Math.max(0, Math.min(circles.length - 1, Math.round(rawHitIndex)))
      : fallbackIndex;
    const circle = circles[desiredIndex] || circles[fallbackIndex] || circles[0];
    if (!circle) return;

    const { ctx } = this;
    const cx = Number(circle.x) || 0;
    const cy = Number(circle.y) || 0;
    const cr = Math.max(4, Number(circle.r) || 4);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.28 + life * 0.42;
    const glow = ctx.createRadialGradient(cx, cy, 1, cx, cy, cr * (2.5 + life * 0.6));
    glow.addColorStop(0, hitCore);
    glow.addColorStop(0.56, hitMid);
    glow.addColorStop(1, this.withAlpha(hitMid, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, cr * (2.5 + life * 0.6), 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.26 + life * 0.34;
    ctx.strokeStyle = this.withAlpha(hitStroke, 0.92);
    ctx.lineWidth = 1.35 + life * 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, cr * (1.45 + life * 0.32), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawMinionHitFlashes(minions) {
    if (!Array.isArray(minions) || !minions.length) return;
    for (const minion of minions) {
      if (minion?.balloon) continue;
      const life = this.minionHitFlashLife(minion);
      if (life <= 0) continue;
      this.drawMinionHitFlash(minion, life);
    }
  }

  drawMinionHitFlash(minion, life) {
    const { ctx } = this;
    const x = Number(minion?.x) || 0;
    const y = Number(minion?.y) || 0;
    const sideName = minion?.side === 'right' ? 'right' : 'left';
    const sidePalette = TEAM_COLORS[sideName] || TEAM_COLORS.left;
    const hitCore = sideName === 'right' ? '#ffdede' : '#e6f4ff';
    const hitMid = sideName === 'right' ? '#ff8f8f' : '#72bcff';
    const hitStroke = sideName === 'right' ? '#ff6d6d' : '#4da7ff';
    const r = Math.max(10, Number(minion?.r) || 14);
    if (minion?.dragon) {
      const core = this.dragonHeartCore(minion);
      const cx = Number(core?.x) || x;
      const cy = Number(core?.y) || y;
      const cr = Math.max(5, Number(core?.r) || (r * 0.24));
      const ttl = Math.max(0, Number(minion?.hitFlashTtl) || 0);
      const heartBoost = Math.max(0, (ttl - MINION_HIT_FLASH_TTL) / Math.max(0.01, MINION_HIT_FLASH_TTL));
      const burst = Math.min(1.25, heartBoost);
      const sizeMul = 1 + burst * 0.8;
      const alphaBoost = burst * 0.16;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.32 + life * 0.42 + alphaBoost;
      const glow = ctx.createRadialGradient(cx, cy, 1, cx, cy, cr * (2.2 + life * 0.45) * sizeMul);
      glow.addColorStop(0, hitCore);
      glow.addColorStop(0.5, hitMid);
      glow.addColorStop(1, this.withAlpha(hitMid, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, cr * (2.2 + life * 0.45) * sizeMul, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.34 + life * 0.38 + alphaBoost * 0.8;
      ctx.strokeStyle = this.withAlpha(hitStroke, 0.92);
      ctx.lineWidth = 1.5 + life * 2.2;
      ctx.beginPath();
      ctx.arc(cx, cy, cr * (1.48 + life * 0.38) * (1 + burst * 0.65), 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.28 + life * 0.24 + alphaBoost * 0.7;
      ctx.strokeStyle = this.withAlpha(sidePalette.primary, 0.94);
      ctx.lineWidth = 1.15 + life * 1.4;
      const crossR = cr * (2.2 + burst * 0.8);
      ctx.beginPath();
      ctx.moveTo(cx - crossR, cy);
      ctx.lineTo(cx - cr * (1.2 + burst * 0.25), cy);
      ctx.moveTo(cx + cr * (1.2 + burst * 0.25), cy);
      ctx.lineTo(cx + crossR, cy);
      ctx.moveTo(cx, cy - crossR);
      ctx.lineTo(cx, cy - cr * (1.2 + burst * 0.25));
      ctx.moveTo(cx, cy + cr * (1.2 + burst * 0.25));
      ctx.lineTo(cx, cy + crossR);
      ctx.stroke();
      ctx.restore();
      return;
    }

    const rxMul = minion.dragon
      ? 2.3
      : (minion.stoneGolem
          ? 2.05
          : (minion.rider ? 1.86 : (minion.shieldBearer ? 1.6 : (minion.hero ? 1.46 : 1.28))));
    const ryMul = minion.dragon
      ? 1.55
      : (minion.stoneGolem
          ? 1.84
          : (minion.shieldBearer ? 1.92 : (minion.hero ? 1.72 : (minion.rider ? 1.38 : 1.34))));
    const centerY = y - (minion.shieldBearer ? r * 0.34 : (minion.hero ? r * 0.18 : (minion.dragon ? r * 0.2 : (minion.stoneGolem ? r * 0.12 : 0))));
    const rx = r * rxMul;
    const ry = r * ryMul;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.25 + life * 0.34;
    const glow = ctx.createRadialGradient(x, centerY - ry * 0.12, 2, x, centerY, Math.max(rx, ry) * 1.06);
    glow.addColorStop(0, hitCore);
    glow.addColorStop(0.56, hitMid);
    glow.addColorStop(1, this.withAlpha(hitMid, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x, centerY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.24 + life * 0.31;
    ctx.strokeStyle = this.withAlpha(hitStroke, 0.9);
    ctx.lineWidth = 1.6 + life * 2.2;
    ctx.beginPath();
    ctx.ellipse(x, centerY, rx * 0.92, ry * 0.88, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.16 + life * 0.22;
    ctx.strokeStyle = this.withAlpha(sidePalette.primary, 0.92);
    ctx.lineWidth = 1.2 + life * 1.45;
    ctx.beginPath();
    ctx.ellipse(x, centerY, rx * 1.06, ry * 1.02, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawGunnerSprite(minion, options = {}) {
    if (!minion) return;
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.gunnerSkyCannonUpgraded);
    const themed = this.isThemedEmpires();
    const scale = minion.super ? 1.34 : 1;
    const bodyW = 22 * scale;
    const bodyH = 18 * scale;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const dir = sideName === 'left' ? 1 : -1;
    const throwFromX = x + dir * bodyW * 0.74;
    const throwFromY = y + bodyH * 0.06;
    const throwLife = Math.max(
      0,
      Math.min(1, (Number(minion.balloonThrowTtl) || 0) / Math.max(0.01, Number(minion.balloonThrowMaxTtl) || 0.6))
    );
    const drawFoodThrowFx = () => {
      if (cacheRender || throwLife <= 0.001) return;
      if (!Number.isFinite(minion.balloonThrowToX) || !Number.isFinite(minion.balloonThrowToY)) return;
      const fromX = throwFromX;
      const fromY = throwFromY;
      const toX = Number(minion.balloonThrowToX);
      const toY = Number(minion.balloonThrowToY);
      const flight = 1 - throwLife;
      const arcLift = Math.max(16, bodyW * 0.92);
      const midX = fromX + (toX - fromX) * 0.5;
      const midY = Math.min(fromY, toY) - arcLift;
      const px = (1 - flight) * (1 - flight) * fromX + 2 * (1 - flight) * flight * midX + flight * flight * toX;
      const py = (1 - flight) * (1 - flight) * fromY + 2 * (1 - flight) * flight * midY + flight * flight * toY;
      // Match balloon throw size logic, then render gunners at 2x that size.
      const balloonThrowSize = Math.max(32, Number(minion.r) || 32) * 0.16;
      const throwSize = balloonThrowSize * 2;
      if (!themed) {
        const rockR = throwSize * 0.9;
        ctx.fillStyle = '#7f8895';
        ctx.beginPath();
        ctx.arc(px, py, rockR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.withAlpha('#adb5bf', 0.55);
        ctx.beginPath();
        ctx.arc(px - rockR * 0.24, py - rockR * 0.22, rockR * 0.46, 0, Math.PI * 2);
        ctx.fill();
      } else if (sideName === 'left') {
        ctx.fillStyle = '#d89a59';
        ctx.beginPath();
        ctx.ellipse(px, py, throwSize, throwSize * 0.69, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8a562b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - throwSize * 0.31, py - throwSize * 0.14);
        ctx.lineTo(px + throwSize * 0.13, py + throwSize * 0.2);
        ctx.stroke();
      } else {
        const riceThrowR = throwSize * 0.95;
        ctx.fillStyle = '#edf8ff';
        ctx.beginPath();
        ctx.arc(px, py, riceThrowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#213644';
        ctx.fillRect(px - riceThrowR * 0.3, py + riceThrowR * 0.26, riceThrowR * 0.6, riceThrowR * 0.34);
      }
    };
    if (this.drawThemedSpecialSprite(minion, 'gunner', options)) {
      drawFoodThrowFx();
      return;
    }
    if (!cacheRender) {
      const flashNorm = Math.max(0, Math.min(1, (minion.gunFlashTtl || 0) / 0.14));
      const flashBucket = Math.max(0, Math.min(3, Math.round(flashNorm * 3)));
      const cacheKey = `gunner:${sideName}:${minion.super ? 1 : 0}:${upgraded ? 1 : 0}:${flashBucket}`;
      const cacheWidth = Math.ceil(bodyW * 4 + 40);
      const cacheHeight = Math.ceil(bodyH * 3 + 44);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          gunFlashTtl: flashBucket > 0 ? (flashBucket / 3) * 0.14 : 0,
        };
        this.drawGunnerSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        this.drawThemedSpecialLook(minion, 'gunner', { cacheRender, upgraded });
        drawFoodThrowFx();
        if (showHud) {
          ctx.fillStyle = '#ffd7aa';
          ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('GUNNER', minion.x, minion.y - bodyH * 1.18);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const flash = Math.max(0, Math.min(1, (minion.gunFlashTtl || 0) / 0.14));

    ctx.fillStyle = '#0000002a';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyH * 0.9, bodyW * 0.62, 5.8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (minion.super) {
      ctx.strokeStyle = '#ffd48f8a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y - bodyH * 0.12, bodyW * 0.76, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);

    // Armored torso.
    ctx.fillStyle = '#2d3e5a';
    ctx.fillRect(-bodyW * 0.5, -bodyH * 0.5, bodyW, bodyH);
    ctx.strokeStyle = '#89a8d0';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-bodyW * 0.5, -bodyH * 0.5, bodyW, bodyH);
    ctx.fillStyle = palette.primary;
    ctx.fillRect(-bodyW * 0.18, -bodyH * 0.42, bodyW * 0.36, bodyH * 0.84);

    // Helmet and visor.
    ctx.fillStyle = '#8da6c5';
    ctx.beginPath();
    ctx.arc(0, -bodyH * 0.62, bodyH * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f2736';
    ctx.fillRect(-bodyH * 0.3, -bodyH * 0.66, bodyH * 0.6, bodyH * 0.2);
    ctx.fillStyle = '#9bf3ff';
    ctx.fillRect(-bodyH * 0.2, -bodyH * 0.62, bodyH * 0.4, bodyH * 0.08);

    // Legs.
    ctx.fillStyle = '#2a354a';
    ctx.fillRect(-bodyW * 0.34, bodyH * 0.48, bodyW * 0.22, bodyH * 0.48);
    ctx.fillRect(bodyW * 0.12, bodyH * 0.48, bodyW * 0.22, bodyH * 0.48);

    // Rifle.
    const gunLen = bodyW * (upgraded ? 1.82 : 1.35);
    const gunY = -bodyH * 0.06;
    ctx.strokeStyle = '#dce9ff';
    ctx.lineWidth = upgraded ? 4.2 : 3.1;
    ctx.beginPath();
    ctx.moveTo(bodyW * 0.18 * dir, gunY);
    ctx.lineTo((bodyW * 0.18 + gunLen) * dir, gunY - 1.2);
    ctx.stroke();
    ctx.fillStyle = '#415a7e';
    ctx.fillRect(
      Math.min(bodyW * 0.04 * dir, (bodyW * (upgraded ? 0.94 : 0.64)) * dir),
      gunY - (upgraded ? 4.4 : 3.2),
      Math.abs(bodyW * (upgraded ? 0.9 : 0.6)),
      upgraded ? 8.8 : 6.4
    );
    if (upgraded) {
      ctx.fillStyle = '#5a7398';
      ctx.fillRect(
        Math.min(bodyW * 0.14 * dir, (bodyW * 0.74) * dir),
        gunY - 7.6,
        Math.abs(bodyW * 0.6),
        3.2
      );
      ctx.fillStyle = '#7f97bb';
      ctx.beginPath();
      ctx.arc((bodyW * 0.18 + gunLen) * dir, gunY - 1.2, 2.1, 0, Math.PI * 2);
      ctx.fill();

      // Upward sky-cannon tube so upgraded gunners read clearly.
      const cannonBaseX = -bodyW * 0.08 * dir;
      const cannonBaseY = -bodyH * 0.58;
      const cannonLen = bodyW * 0.84;
      const cannonAngle = -Math.PI / 2 + dir * 0.19;
      const cannonTipX = cannonBaseX + Math.cos(cannonAngle) * cannonLen;
      const cannonTipY = cannonBaseY + Math.sin(cannonAngle) * cannonLen;

      ctx.fillStyle = '#2b3b53';
      ctx.fillRect(-bodyW * 0.2, -bodyH * 0.64, bodyW * 0.4, bodyH * 0.18);
      ctx.strokeStyle = '#b7c9e6';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cannonBaseX, cannonBaseY);
      ctx.lineTo(cannonTipX, cannonTipY);
      ctx.stroke();
      ctx.fillStyle = '#4f6689';
      ctx.beginPath();
      ctx.arc(cannonBaseX, cannonBaseY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#89a8d0';
      ctx.beginPath();
      ctx.arc(cannonTipX, cannonTipY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#1f2a3b';
    ctx.fillRect(
      Math.min((-bodyW * (upgraded ? 0.14 : 0.04)) * dir, (bodyW * 0.12) * dir),
      gunY + 1.2,
      Math.abs(bodyW * (upgraded ? 0.26 : 0.16)),
      upgraded ? 4.2 : 3.6
    );

    if (flash > 0) {
      const muzzleX = (bodyW * 0.18 + gunLen) * dir;
      const muzzleY = gunY - 1.2;
      const flashR = 2.2 + flash * 6.2;
      ctx.fillStyle = '#fff1b3';
      ctx.beginPath();
      ctx.arc(muzzleX, muzzleY, flashR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff9d64';
      ctx.beginPath();
      ctx.arc(muzzleX + dir * 2.6, muzzleY, flashR * 0.64, 0, Math.PI * 2);
      ctx.fill();

      if (upgraded) {
        const cannonBaseX = -bodyW * 0.08 * dir;
        const cannonBaseY = -bodyH * 0.58;
        const cannonLen = bodyW * 0.84;
        const cannonAngle = -Math.PI / 2 + dir * 0.19;
        const cannonTipX = cannonBaseX + Math.cos(cannonAngle) * cannonLen;
        const cannonTipY = cannonBaseY + Math.sin(cannonAngle) * cannonLen;
        const cannonFlashR = 1.8 + flash * 4.6;
        ctx.fillStyle = '#fff4bf';
        ctx.beginPath();
        ctx.arc(cannonTipX, cannonTipY, cannonFlashR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffab6a';
        ctx.beginPath();
        ctx.arc(
          cannonTipX + Math.cos(cannonAngle) * 2.2,
          cannonTipY + Math.sin(cannonAngle) * 2.2,
          cannonFlashR * 0.62,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();
    this.drawThemedSpecialLook(minion, 'gunner', { cacheRender, upgraded });
    drawFoodThrowFx();

    if (showHud) {
      ctx.fillStyle = '#ffd7aa';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('GUNNER', x, y - bodyH * 1.18);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawNecroSprite(minion, options = {}) {
    if (this.drawThemedSpecialSprite(minion, 'necro', options)) return;
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.necroExpertUpgraded);
    const scale = minion.super ? 1.45 : 1.08;
    const bodyR = 12 * scale;
    const shieldMax = Math.max(0, Number(minion.necroShieldMax) || 0);
    const shieldHp = Math.max(0, Number(minion.necroShieldHp) || 0);
    const shieldTtl = Math.max(0, Number(minion.necroShieldTtl) || 0);
    const shieldMaxTtl = Math.max(0.01, Number(minion.necroShieldMaxTtl) || 20);
    const shieldLife = shieldMax > 0 ? Math.max(0, Math.min(1, (shieldHp / shieldMax) * (shieldTtl / shieldMaxTtl))) : 0;
    if (!cacheRender) {
      const shieldBucket = Math.max(0, Math.min(6, Math.round(shieldLife * 6)));
      const cacheKey = `necro:${sideName}:${minion.super ? 1 : 0}:${upgraded ? 1 : 0}:${shieldBucket}`;
      const cacheWidth = Math.ceil(bodyR * 4 + 42);
      const cacheHeight = Math.ceil(bodyR * 4 + 42);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = { ...minion, x: w / 2, y: h / 2 };
        this.drawNecroSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        this.drawThemedSpecialLook(minion, 'necro', { cacheRender, upgraded });
        if (showHud) {
          ctx.fillStyle = '#a9ffe0';
          ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('NECRO', minion.x, minion.y - bodyR - (minion.super ? 26 : 20));
          this.drawMinionHpBar(minion, minion.x, minion.y, Math.max(1, scale * 0.95));
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;

    ctx.fillStyle = '#00000024';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR + 3, bodyR * 0.86, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (shieldLife > 0) {
      ctx.strokeStyle = this.withAlpha('#a3f4ff', 0.28 + shieldLife * 0.52);
      ctx.lineWidth = 1.8 + shieldLife * 1.8;
      ctx.beginPath();
      ctx.arc(x, y - bodyR * 0.08, bodyR * (1.28 + shieldLife * 0.18), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);

    // Cloak.
    ctx.fillStyle = '#21313f';
    ctx.beginPath();
    ctx.moveTo(0, -bodyR * 0.95);
    ctx.lineTo(-bodyR * 1.02, bodyR * 1.12);
    ctx.lineTo(bodyR * 1.02, bodyR * 1.12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#82ffd2';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#2d4458';
    ctx.beginPath();
    ctx.moveTo(0, -bodyR * 0.78);
    ctx.lineTo(-bodyR * 0.5, bodyR * 0.88);
    ctx.lineTo(bodyR * 0.5, bodyR * 0.88);
    ctx.closePath();
    ctx.fill();

    // Skull face.
    ctx.fillStyle = '#ebe8df';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.68, bodyR * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10161f';
    ctx.beginPath();
    ctx.arc(-bodyR * 0.16, -bodyR * 0.72, bodyR * 0.08, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.16, -bodyR * 0.72, bodyR * 0.08, 0, Math.PI * 2);
    ctx.fill();

    if (upgraded) {
      ctx.fillStyle = '#d6b95b';
      ctx.beginPath();
      ctx.moveTo(-bodyR * 0.5, -bodyR * 1.14);
      ctx.lineTo(-bodyR * 0.34, -bodyR * 1.52);
      ctx.lineTo(-bodyR * 0.14, -bodyR * 1.18);
      ctx.lineTo(0, -bodyR * 1.58);
      ctx.lineTo(bodyR * 0.14, -bodyR * 1.18);
      ctx.lineTo(bodyR * 0.34, -bodyR * 1.52);
      ctx.lineTo(bodyR * 0.5, -bodyR * 1.14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f7e59b';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.fillStyle = '#8cffd1';
      ctx.beginPath();
      ctx.arc(0, -bodyR * 1.32, bodyR * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#7ff7bf';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.16, -bodyR * 0.52);
    ctx.lineTo(bodyR * 0.16, -bodyR * 0.52);
    ctx.stroke();

    // Staff + orb.
    const staffX = dir * bodyR * 0.95;
    ctx.strokeStyle = '#d8cab0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(staffX, -bodyR * 0.12);
    ctx.lineTo(staffX + dir * 2, -bodyR * 1.02);
    ctx.stroke();
    ctx.fillStyle = '#81ffd0';
    ctx.beginPath();
    ctx.arc(staffX + dir * 2, -bodyR * 1.14, bodyR * 0.17, 0, Math.PI * 2);
    ctx.fill();

    if (minion.super) {
      ctx.strokeStyle = '#fff1a590';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -bodyR * 0.2, bodyR * 1.58, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
    this.drawThemedSpecialLook(minion, 'necro', { cacheRender, upgraded });

    if (showHud) {
      ctx.fillStyle = '#a9ffe0';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('NECRO', x, y - bodyR - (minion.super ? 26 : 20));
      this.drawMinionHpBar(minion, x, y, Math.max(1, scale * 0.95));
    }
  }

  drawBomberSprite(minion, options = {}) {
    if (this.drawThemedSpecialSprite(minion, 'bomber', options)) return;
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const scale = minion.super ? 1.22 : 1;
    const tier = Math.max(0, Math.min(3, Number(minion.tier) || 0));
    const r = (12 + tier) * scale;
    if (!cacheRender) {
      const cacheKey = `bomber:${sideName}:${minion.super ? 1 : 0}:${tier}`;
      const cacheWidth = Math.ceil(r * 5 + 42);
      const cacheHeight = Math.ceil(r * 4 + 36);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = { ...minion, x: w / 2, y: h / 2, tier };
        this.drawBomberSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        this.drawThemedSpecialLook(minion, 'bomber', { cacheRender, upgraded: minion.super });
        if (showHud) {
          ctx.fillStyle = '#f5d39f';
          ctx.font = `bold ${minion.super ? 12 : 10}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('BOMBER', minion.x, minion.y - r - 16);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;

    ctx.fillStyle = '#00000024';
    ctx.beginPath();
    ctx.ellipse(x, y + r + 4, r * 0.95, 5.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.dark;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Big strapped bomb on front.
    const bombX = x + dir * (r + 3);
    const bombY = y + 1;
    const bombR = r * 0.76;
    ctx.fillStyle = '#161a23';
    ctx.beginPath();
    ctx.arc(bombX, bombY, bombR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8995ac';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.strokeStyle = '#f7cf78';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(bombX + dir * 2, bombY - bombR + 1);
    ctx.lineTo(bombX + dir * 7.5, bombY - bombR - 5.5);
    ctx.stroke();
    ctx.fillStyle = '#ffd97f';
    ctx.beginPath();
    ctx.arc(bombX + dir * 9.4, bombY - bombR - 6.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff805f';
    ctx.beginPath();
    ctx.arc(bombX + dir * 12.4, bombY - bombR - 8.2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    this.drawThemedSpecialLook(minion, 'bomber', { cacheRender, upgraded: minion.super });

    if (showHud) {
      ctx.fillStyle = '#f5d39f';
      ctx.font = `bold ${minion.super ? 12 : 10}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('BOMBER', x, y - r - 16);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawHeroCookerHud(minion, x, y, r, scale, sideName, foodType) {
    const { ctx } = this;
    const label = foodType === 'rice' ? 'RICE COOKER' : 'BREAD OVEN';
    const eatCap = Math.max(1, Math.round(Number(minion.heroCookerEatCap) || 10));
    const eatCountRaw = Math.round(Number(minion.heroCookerEatCount) || 0);
    const eatCount = Math.max(0, Math.min(eatCap, eatCountRaw));
    const loadPct = Math.max(0, Math.min(1, eatCount / eatCap));

    ctx.fillStyle = '#fff1da';
    ctx.font = `bold ${sideName === 'right' ? 11 : 10}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - r - 20);

    const counterW = Math.max(28, r * 1.9);
    const counterH = Math.max(10, r * 0.56);
    const counterX = x - counterW / 2;
    const counterY = y + r * 0.74;
    ctx.fillStyle = sideName === 'right' ? '#211009cf' : '#0f1720cf';
    ctx.fillRect(counterX, counterY, counterW, counterH);
    ctx.fillStyle = foodType === 'rice'
      ? this.withAlpha('#ff9a4a', 0.48)
      : this.withAlpha('#ffac58', 0.48);
    ctx.fillRect(counterX + 1, counterY + 1, Math.max(0, (counterW - 2) * loadPct), Math.max(1, counterH - 2));
    ctx.strokeStyle = foodType === 'rice' ? '#ffe3b9' : '#ffd39d';
    ctx.lineWidth = 1;
    ctx.strokeRect(counterX + 0.5, counterY + 0.5, counterW - 1, counterH - 1);

    ctx.fillStyle = '#fff9ec';
    ctx.font = `bold ${Math.max(8, Math.round(scale * 8.2))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${eatCount}/${eatCap}`, x, counterY + counterH * 0.74);

    this.drawMinionHpBar(minion, x, y, Math.max(1, scale * 0.96));
  }

  drawHeroCookerSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const foodType = minion.heroCookerFoodType === 'rice' ? 'rice' : 'bread';
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const r = Math.max(14, Number(minion.r) || 18);
    const scale = Math.max(0.88, r / 20);
    const cookMax = Math.max(0.01, Number(minion.heroCookerCookMaxTtl) || 10);
    const cookLife = Math.max(0, Math.min(1, (Number(minion.heroCookerCookTtl) || 0) / cookMax));
    const animT = Number.isFinite(minion.heroCookerAnimT) ? Number(minion.heroCookerAnimT) : 0;
    const lidBounce = Math.sin(animT * 2.8) * (0.8 + (1 - cookLife) * 1.5) * scale;

    if (!cacheRender) {
      const cookBucket = Math.max(0, Math.min(8, Math.round(cookLife * 8)));
      const cacheKey = `heroCooker:${sideName}:${foodType}:${cookBucket}`;
      const cacheWidth = Math.ceil(r * 5.4 + 50);
      const cacheHeight = Math.ceil(r * 4.6 + 46);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          heroCookerAnimT: 0,
          heroCookerCookTtl: (cookBucket / 8) * cookMax,
          heroCookerCookMaxTtl: cookMax,
        };
        this.drawHeroCookerSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) this.drawHeroCookerHud(minion, x, y, r, scale, sideName, foodType);
        return;
      }
    }

    const bodyMain = foodType === 'rice' ? '#dbe8f6' : '#d39b5f';
    const bodyDark = foodType === 'rice' ? '#8da5be' : '#8a5b32';
    const trim = foodType === 'rice' ? '#f6fcff' : '#ffd9a6';
    const glow = foodType === 'rice' ? '#dcefff' : '#ffd6ab';

    ctx.fillStyle = '#0000002a';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 1.08, r * 0.96, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = bodyMain;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.08, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bodyDark;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = bodyDark;
    ctx.fillRect(-r * 1.06, -r * 0.08, r * 2.12, r * 0.68);
    ctx.strokeStyle = trim;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-r * 0.84, r * 0.1, r * 1.68, r * 0.34);

    ctx.fillStyle = trim;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.36 + lidBounce, r * 0.9, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bodyDark;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -r * 0.5 + lidBounce, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    const steamPuffs = 3;
    for (let i = 0; i < steamPuffs; i += 1) {
      const t = animT * 1.7 + i * 1.2;
      const sx = Math.sin(t) * r * 0.24;
      const sy = -r * 0.9 - i * r * 0.22 - Math.abs(Math.cos(t)) * r * 0.18;
      const puffR = r * (0.12 + (1 - cookLife) * 0.08) * (1 - i * 0.14);
      ctx.fillStyle = sideName === 'right' ? '#f5fbff9c' : '#ffeecf99';
      ctx.beginPath();
      ctx.arc(sx, sy, puffR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (showHud) this.drawHeroCookerHud(minion, x, y, r, scale, sideName, foodType);
  }

  drawHeroSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const scale = (minion.super ? 1.24 : 1.06) * 1.45;
    const bodyR = 14 * scale;
    const swingInput = Number.isFinite(minion.heroSwing) ? Number(minion.heroSwing) : 0;
    const attackSwing = Math.max(-1, Math.min(1, swingInput * 1.35));
    const providedIdleX = Number(minion.heroIdleJitterX);
    const providedIdleY = Number(minion.heroIdleJitterY);
    const idleMotion = (Number.isFinite(providedIdleX) && Number.isFinite(providedIdleY))
      ? { x: providedIdleX, y: providedIdleY, bucket: 0 }
      : this.heroIdleArmDrift(minion.id, attackSwing);
    const providedPunchX = Number(minion.heroPunchJitterX);
    const providedPunchY = Number(minion.heroPunchJitterY);
    const punchJitter = (Number.isFinite(providedPunchX) && Number.isFinite(providedPunchY))
      ? { x: providedPunchX, y: providedPunchY, bucket: 0 }
      : this.heroPunchJitter(minion.id, attackSwing);
    const smoothStep01 = (value) => {
      const t = Math.max(0, Math.min(1, Number(value) || 0));
      return t * t * (3 - 2 * t);
    };
    const swingAbs = Math.abs(attackSwing);
    const punchPulse = smoothStep01(swingAbs);
    const idleBlend = Math.max(0, 1 - punchPulse * 0.92);
    const bodyShiftX = bodyR * idleMotion.x * 0.035 * idleBlend;
    const bodyShiftY = bodyR * (idleMotion.y * 0.026 * idleBlend - punchPulse * 0.02);
    const torsoTilt = attackSwing * (0.088 + punchPulse * 0.06) + idleMotion.x * 0.024 * idleBlend;
    if (!cacheRender) {
      const swingBucket = Math.max(0, Math.min(10, Math.round((attackSwing + 1) * 5)));
      const quantSwing = (swingBucket / 5) - 1;
      const cacheKey = `heroJoint:${sideName}:${minion.super ? 1 : 0}:${swingBucket}:${punchJitter.bucket}:${idleMotion.bucket}`;
      const cacheWidth = Math.ceil(bodyR * 6.4 + 64);
      const cacheHeight = Math.ceil(bodyR * 6 + 64);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          heroSwing: quantSwing,
          heroPunchJitterX: punchJitter.x,
          heroPunchJitterY: punchJitter.y,
          heroIdleJitterX: idleMotion.x,
          heroIdleJitterY: idleMotion.y,
        };
        this.drawHeroSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        this.drawThemedSpecialLook(minion, 'hero', { cacheRender, upgraded: minion.super });
        if (showHud) {
          ctx.strokeStyle = '#2d1808';
          ctx.lineWidth = 2.2;
          ctx.font = `bold ${minion.super ? 14 : 12}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.strokeText('HERO', x, y - bodyR - 20);
          ctx.fillStyle = '#ffe6bb';
          ctx.fillText('HERO', x, y - bodyR - 20);
          this.drawMinionHpBar(minion, x, y, scale);
        }
        return;
      }
    }

    ctx.fillStyle = '#00000028';
    ctx.beginPath();
    ctx.ellipse(
      x + bodyShiftX * 0.52,
      y + bodyR + 6 + Math.max(0, bodyShiftY * 0.18),
      bodyR * (1.02 - punchPulse * 0.04),
      6.8,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.save();
    ctx.translate(x + bodyShiftX, y + bodyShiftY);
    ctx.rotate(torsoTilt);

    const capeColor = sideName === 'left' ? '#2f628f' : '#8a3840';
    const capeFlare = Math.max(0, punchPulse - 0.16);
    ctx.fillStyle = capeColor;
    ctx.beginPath();
    ctx.moveTo(-dir * 2.5, -bodyR * 0.92);
    ctx.lineTo(
      -dir * (bodyR * (1.15 + capeFlare * 0.24)),
      bodyR * (0.34 + capeFlare * 0.09)
    );
    ctx.lineTo(
      -dir * (bodyR * (0.72 + capeFlare * 0.16)),
      bodyR * (1.04 + capeFlare * 0.07)
    );
    ctx.lineTo(-dir * 1.8, bodyR * 0.54);
    ctx.closePath();
    ctx.fill();

    // Torso.
    ctx.fillStyle = sideName === 'left' ? '#7f5835' : '#4f6a82';
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyR * 0.76, bodyR * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = sideName === 'left' ? '#d8ae80' : '#bdd5eb';
    ctx.lineWidth = 1.9;
    ctx.stroke();
    ctx.fillStyle = sideName === 'left' ? '#f2ce9f' : '#e8f1fb';
    ctx.fillRect(-bodyR * 0.16, -bodyR * 0.76, bodyR * 0.32, bodyR * 1.32);

    // Head.
    const headX = dir * bodyR * (idleMotion.x * 0.02 * idleBlend - attackSwing * 0.02);
    const headY = -bodyR * 1.02 + bodyR * (idleMotion.y * 0.018 * idleBlend - punchPulse * 0.018);
    ctx.fillStyle = '#f2d5ba';
    ctx.beginPath();
    ctx.arc(headX, headY, bodyR * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2b2018';
    ctx.beginPath();
    ctx.arc(headX - dir * bodyR * 0.06, headY - bodyR * 0.22, bodyR * 0.24, Math.PI * 1.04, Math.PI * 2.06);
    ctx.fill();
    const eyeFocusX = headX + dir * bodyR * (0.03 + attackSwing * 0.025);
    const eyeFocusY = headY + bodyR * (-0.002 + idleMotion.y * 0.008 * idleBlend);
    ctx.fillStyle = '#1a202b';
    ctx.beginPath();
    ctx.arc(eyeFocusX - bodyR * 0.13, eyeFocusY, 1.15, 0, Math.PI * 2);
    ctx.arc(eyeFocusX + bodyR * 0.13, eyeFocusY, 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8f5d3b';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(headX - bodyR * 0.1, headY + bodyR * 0.14);
    ctx.lineTo(headX + bodyR * 0.1, headY + bodyR * 0.14);
    ctx.stroke();

    // Legs with knee joints.
    const hipY = bodyR * 0.34;
    const upperLegLen = bodyR * 0.56;
    const lowerLegLen = bodyR * 0.54;
    const stepPhase = swingInput * 1.08 + idleMotion.x * 0.74;
    for (const legSign of [-1, 1]) {
      const gait = Math.sin(stepPhase + legSign * 1.62) * (0.12 + punchPulse * 0.08)
        + idleMotion.y * 0.03 * idleBlend;
      const hipX = legSign * bodyR * 0.22;
      const upperA = Math.PI / 2 + gait + legSign * 0.06;
      const kneeX = hipX + Math.cos(upperA) * upperLegLen;
      const kneeY = hipY + Math.sin(upperA) * upperLegLen;
      const lowerA = upperA + legSign * 0.12 - gait * 0.55;
      const footX = kneeX + Math.cos(lowerA) * lowerLegLen;
      const footY = kneeY + Math.sin(lowerA) * lowerLegLen;
      ctx.strokeStyle = '#2d3542';
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(kneeX, kneeY);
      ctx.lineTo(footX, footY);
      ctx.stroke();
      ctx.fillStyle = '#d5dee8';
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const foodIsRice = sideName === 'right';
    const shoulderY = -bodyR * 0.21;
    const upperArmLen = bodyR * 0.76;
    const forearmLen = bodyR * 0.7;
    const baseForward = dir > 0 ? -0.08 : (Math.PI + 0.08);
    const drawFist = (wx, wy, punchOut) => {
      const fistR = bodyR * (0.16 + punchOut * 0.06);
      const skin = foodIsRice ? '#eef6ff' : '#f2d5ba';
      const rim = foodIsRice ? '#6d869e' : '#b98256';
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(wx, wy, fistR * 1.04, fistR * 0.92, 0.12 * dir, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      if (punchOut > 0.48) {
        const hitAlpha = Math.max(0, Math.min(1, (punchOut - 0.48) / 0.52));
        const fxLen = fistR * (2.6 + hitAlpha * 2.4);
        const fxDirX = Math.cos(baseForward);
        const fxDirY = Math.sin(baseForward);
        const fxSideX = -fxDirY;
        const fxSideY = fxDirX;
        ctx.strokeStyle = this.withAlpha(foodIsRice ? '#d8ebff' : '#ffd29c', 0.42 + hitAlpha * 0.5);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(wx + fxSideX * fistR * 0.2, wy + fxSideY * fistR * 0.2);
        ctx.lineTo(wx + fxDirX * fxLen, wy + fxDirY * fxLen);
        ctx.moveTo(wx - fxSideX * fistR * 0.35, wy - fxSideY * fistR * 0.35);
        ctx.lineTo(wx + fxDirX * (fxLen * 0.84), wy + fxDirY * (fxLen * 0.84));
        ctx.stroke();

        if (punchOut > 0.72) {
          const ringAlpha = Math.max(0, Math.min(1, (punchOut - 0.72) / 0.28));
          const ringCx = wx + fxDirX * fistR * (0.5 + ringAlpha * 0.4);
          const ringCy = wy + fxDirY * fistR * (0.5 + ringAlpha * 0.4);
          ctx.strokeStyle = this.withAlpha(foodIsRice ? '#e8f4ff' : '#ffe4bf', 0.28 + ringAlpha * 0.44);
          ctx.lineWidth = 1 + ringAlpha * 1.2;
          ctx.beginPath();
          ctx.ellipse(
            ringCx,
            ringCy,
            fistR * (0.8 + ringAlpha * 1.5),
            fistR * (0.46 + ringAlpha * 0.9),
            0.12 * dir,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }
    };

    const leadArmSign = dir;
    for (let i = 0; i < 2; i += 1) {
      const armSign = i === 0 ? -1 : 1;
      const isLeadArm = armSign === leadArmSign;
      const shoulderX = armSign * bodyR * 0.4;
      const shoulderYNow = shoulderY + (isLeadArm ? bodyR * 0.01 : -bodyR * 0.01);
      const armSwing = attackSwing * (armSign === -1 ? 1 : -1);
      const punchOutRaw = Math.max(0, armSwing);
      const retractRaw = Math.max(0, -armSwing);
      const punchOut = smoothStep01(punchOutRaw);
      const retract = smoothStep01(retractRaw);
      const armIdleMul = Math.max(0, 1 - Math.abs(armSwing));
      const windup = smoothStep01(Math.min(1, retract * 1.18));
      const followThrough = smoothStep01(Math.max(0, (punchOut - 0.72) / 0.28));

      // Guard stance stays forward-facing so the pose reads "ready to punch", not coiled.
      const guardX = dir * bodyR * (isLeadArm ? 0.78 : 0.62)
        - dir * bodyR * windup * (isLeadArm ? 0.21 : 0.15);
      const guardY = -bodyR * (isLeadArm ? 0.35 : 0.46)
        + bodyR * windup * (isLeadArm ? 0.1 : 0.08);
      const punchX = dir * bodyR * (
        isLeadArm
          ? (1.4 + punchJitter.x * 0.16)
          : (1.22 + punchJitter.x * 0.13)
      ) + dir * bodyR * followThrough * (isLeadArm ? 0.22 : 0.15);
      const punchY = -bodyR * (
        isLeadArm
          ? (0.27 - punchJitter.y * 0.07)
          : (0.31 - punchJitter.y * 0.06)
      ) - bodyR * followThrough * (isLeadArm ? 0.06 : 0.04);
      const targetX = lerp(guardX, punchX, punchOut)
        + dir * bodyR * idleMotion.x * (isLeadArm ? 0.12 : 0.09) * armIdleMul;
      const targetY = lerp(guardY, punchY, punchOut)
        + bodyR * idleMotion.y * 0.09 * armIdleMul
        + retract * bodyR * (isLeadArm ? 0.02 : 0.03);

      const upperLenNow = lerp(upperArmLen * 0.76, upperArmLen * 1.03, punchOut);
      const foreLenNow = lerp(
        forearmLen * 0.68,
        forearmLen * (isLeadArm ? 1.15 : 1.06),
        punchOut
      ) * (1 - retract * 0.08);

      // Two-bone IK so elbows bend naturally toward a boxer stance.
      const dx = targetX - shoulderX;
      const dy = targetY - shoulderYNow;
      const distRaw = Math.hypot(dx, dy);
      const minReach = Math.max(0.2, Math.abs(upperLenNow - foreLenNow) + 0.12);
      const maxReach = Math.max(minReach + 0.01, upperLenNow + foreLenNow - 0.8);
      const dist = Math.max(minReach, Math.min(maxReach, distRaw || minReach));
      const ux = distRaw > 0.0001 ? (dx / distRaw) : Math.cos(baseForward);
      const uy = distRaw > 0.0001 ? (dy / distRaw) : Math.sin(baseForward);
      const a = (upperLenNow * upperLenNow - foreLenNow * foreLenNow + dist * dist) / (2 * Math.max(0.0001, dist));
      const hSq = Math.max(0, upperLenNow * upperLenNow - a * a);
      const h = Math.sqrt(hSq);
      const midX = shoulderX + ux * a;
      const midY = shoulderYNow + uy * a;
      const bend = dir > 0 ? 1 : -1;
      const px = -uy;
      const py = ux;
      const bendStrength = Math.max(0.56, Math.min(1.02, lerp(0.94, 0.58, punchOut) + retract * 0.08));
      const elbowX = midX + px * h * bend * bendStrength;
      const elbowY = midY + py * h * bend * bendStrength + bodyR * (0.046 + retract * 0.03);
      const wristX = shoulderX + ux * dist;
      const wristY = shoulderYNow + uy * dist;

      ctx.strokeStyle = '#f2d5ba';
      ctx.lineWidth = (minion.super ? 4.4 : 4) + punchOut * 0.32;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderYNow);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(wristX, wristY);
      ctx.stroke();
      ctx.fillStyle = '#f7e5d0';
      ctx.beginPath();
      ctx.arc(elbowX, elbowY, 2 + punchOut * 0.4, 0, Math.PI * 2);
      ctx.fill();

      drawFist(wristX, wristY, punchOut);
    }

    ctx.restore();
    this.drawThemedSpecialLook(minion, 'hero', { cacheRender, upgraded: minion.super });

    if (showHud) {
      ctx.strokeStyle = '#2d1808';
      ctx.lineWidth = 2.2;
      ctx.font = `bold ${minion.super ? 14 : 12}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeText('HERO', x, y - bodyR - 20);
      ctx.fillStyle = '#ffe6bb';
      ctx.fillText('HERO', x, y - bodyR - 20);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawMonkSprite(minion, options = {}) {
    if (this.drawThemedSpecialSprite(minion, 'monk', options)) return;
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.monkHealCircleUpgraded);
    const scale = minion.super ? 1.18 : 1.04;
    const bodyR = 13 * scale;
    const healScale = Number.isFinite(minion.monkHealScale) ? minion.monkHealScale : 1;
    if (!cacheRender) {
      const healBucket = Math.max(0, Math.min(4, Math.round(healScale * 4)));
      const cacheKey = `monk:${sideName}:${minion.super ? 1 : 0}:${upgraded ? 1 : 0}:${healBucket}`;
      const cacheWidth = Math.ceil(bodyR * 4.6 + 44);
      const cacheHeight = Math.ceil(bodyR * 4.4 + 44);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          monkHealScale: healBucket / 4,
        };
        this.drawMonkSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        this.drawThemedSpecialLook(minion, 'monk', { cacheRender, upgraded });
        if (showHud) {
          ctx.fillStyle = '#ddffcb';
          ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('MONK', minion.x, minion.y - bodyR - 18);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;
    const auraAlpha = 0.18 + Math.max(0, Math.min(0.3, healScale * 0.25));

    ctx.fillStyle = '#0000002a';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR + 5, bodyR * 0.94, 6.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(130, 255, 190, ${auraAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 2, bodyR * 1.28, 0, Math.PI * 2);
    ctx.stroke();
    if (upgraded) {
      ctx.strokeStyle = 'rgba(180, 255, 215, 0.48)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(x, y + 2, bodyR * 1.76, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);

    // Robe.
    ctx.fillStyle = '#d0863d';
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f0cda6';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#8f4f24';
    ctx.fillRect(-bodyR * 0.2, -bodyR * 0.9, bodyR * 0.4, bodyR * 1.7);
    if (upgraded) {
      ctx.fillStyle = '#7fd9a5';
      ctx.beginPath();
      ctx.arc(0, -bodyR * 0.16, bodyR * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head.
    ctx.fillStyle = '#efcfb0';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.92, bodyR * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b3c22';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 1.06, bodyR * 0.19, 0, Math.PI * 2);
    ctx.fill();

    // Calm face.
    ctx.fillStyle = '#1e242e';
    ctx.beginPath();
    ctx.arc(-bodyR * 0.13, -bodyR * 0.92, 1.05, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.13, -bodyR * 0.92, 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5e2f1f';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.18, -bodyR * 0.73);
    ctx.lineTo(bodyR * 0.18, -bodyR * 0.73);
    ctx.stroke();

    // Prayer beads.
    ctx.strokeStyle = '#efe3b6';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.12, bodyR * 0.44, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();

    // Staff.
    ctx.strokeStyle = '#5a3c24';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(dir * (bodyR * 0.2), bodyR * 0.2);
    ctx.lineTo(dir * (bodyR * 1.2), -bodyR * 1.08);
    ctx.stroke();
    ctx.fillStyle = '#8ef5c0';
    ctx.beginPath();
    ctx.arc(dir * (bodyR * 1.2), -bodyR * 1.08, bodyR * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.soft;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(dir * (bodyR * 1.2), -bodyR * 1.08, bodyR * 0.32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
    this.drawThemedSpecialLook(minion, 'monk', { cacheRender, upgraded });

    if (showHud) {
      ctx.fillStyle = '#ddffcb';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('MONK', x, y - bodyR - 18);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawPresidentSprite(minion, options = {}) {
    if (this.drawThemedSpecialSprite(minion, 'president', options)) return;
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const sidePalette = TEAM_COLORS[sideName] || TEAM_COLORS.left;
    const scale = minion.super ? 1.2 : 1.04;
    const bodyR = 13 * scale;
    const setup = Boolean(minion.presidentSetup);
    const upgraded = Boolean(minion.presidentExecutiveOrderUpgraded);
    const auraRadius = Math.max(110, Number(minion.presidentAuraRadius) || 190) * PRESIDENT_AURA_RANGE_SCALE;
    const auraEnabled = setup && !minion.presidentAuraDisabled;
    const signLife = upgraded
      ? Math.max(0, Math.min(
        1,
        (Number(minion.presidentExecutiveOrderSignTtl) || 0) / Math.max(0.01, Number(minion.presidentExecutiveOrderSignMaxTtl) || 0.9)
      ))
      : 0;
    if (!cacheRender) {
      const signBucket = Math.max(0, Math.min(4, Math.round(signLife * 4)));
      const cacheKey = `president:${sideName}:${minion.super ? 1 : 0}:${setup ? 1 : 0}:${upgraded ? 1 : 0}:${signBucket}`;
      const cacheWidth = Math.ceil((setup ? (upgraded ? 244 : 220) : (upgraded ? 156 : 140)) * scale);
      const cacheHeight = Math.ceil((setup ? (upgraded ? 182 : 170) : (upgraded ? 146 : 136)) * scale);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          presidentExecutiveOrderSignTtl: (signBucket / 4) * (Number(minion.presidentExecutiveOrderSignMaxTtl) || 0.9),
        };
        this.drawPresidentSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (auraEnabled) {
          ctx.save();
          ctx.globalAlpha = 0.22;
          ctx.fillStyle = this.withAlpha(sidePalette.soft, 0.18);
          ctx.beginPath();
          ctx.arc(minion.x, minion.y, auraRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.62;
          ctx.strokeStyle = this.withAlpha(sidePalette.soft, 0.9);
          ctx.lineWidth = 1.8;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(minion.x, minion.y, auraRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
        const beamLife = upgraded
          ? Math.max(0, Math.min(
            1,
            (Number(minion.presidentExecutiveOrderBeamTtl) || 0) / Math.max(0.01, Number(minion.presidentExecutiveOrderBeamMaxTtl) || 0.55)
          ))
          : 0;
        if (beamLife > 0.001) {
          const toX = Number.isFinite(minion.presidentExecutiveOrderBeamToX)
            ? minion.presidentExecutiveOrderBeamToX
            : minion.x + (sideName === 'left' ? 1 : -1) * 80;
          const toY = Number.isFinite(minion.presidentExecutiveOrderBeamToY)
            ? minion.presidentExecutiveOrderBeamToY
            : minion.y - 12;
          const fromX = minion.x + (sideName === 'left' ? 1 : -1) * 10;
          const fromY = minion.y - bodyR * 0.2;
          const arc = (sideName === 'left' ? 1 : -1) * (8 + beamLife * 11);
          ctx.save();
          ctx.globalAlpha = 0.35 + beamLife * 0.62;
          const beam = ctx.createLinearGradient(fromX, fromY, toX, toY);
          beam.addColorStop(0, '#fff4bf');
          beam.addColorStop(0.42, '#f5d58a');
          beam.addColorStop(1, '#ffecc2');
          ctx.strokeStyle = beam;
          ctx.lineWidth = 2.8 + beamLife * 3.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(fromX, fromY);
          ctx.quadraticCurveTo((fromX + toX) * 0.5 + arc, (fromY + toY) * 0.5 - 9, toX, toY);
          ctx.stroke();
          ctx.fillStyle = '#fff0c4';
          ctx.beginPath();
          ctx.arc(toX, toY, 2 + beamLife * 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        this.drawThemedSpecialLook(minion, 'president', { cacheRender, upgraded });
        if (showHud) {
          ctx.fillStyle = '#ffe3b9';
          ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('PRESIDENT', minion.x, minion.y - bodyR - 18);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;

    if (!cacheRender && auraEnabled) {
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = this.withAlpha(sidePalette.soft, 0.18);
      ctx.beginPath();
      ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.62;
      ctx.strokeStyle = this.withAlpha(sidePalette.soft, 0.9);
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    ctx.fillStyle = '#00000026';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR + 4, bodyR * 0.9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);

    // Podium / desk.
    const podiumW = setup ? (upgraded ? 35 * scale : 26 * scale) : (upgraded ? 22 * scale : 16 * scale);
    const podiumH = setup ? (upgraded ? 25 * scale : 24 * scale) : (upgraded ? 16 * scale : 14 * scale);
    ctx.fillStyle = upgraded ? '#705234' : '#6a4b2f';
    ctx.fillRect(-podiumW / 2, bodyR * 0.35, podiumW, podiumH);
    ctx.strokeStyle = '#d8bd8e';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-podiumW / 2, bodyR * 0.35, podiumW, podiumH);
    if (setup && !upgraded) {
      ctx.fillStyle = '#2a3750';
      ctx.beginPath();
      ctx.arc(0, bodyR * 0.35 + podiumH * 0.45, 5.4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f4d487';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P', 0, bodyR * 0.35 + podiumH * 0.45 + 3);
    }
    if (upgraded) {
      const deskY = bodyR * 0.2;
      const paperW = 10.5 * scale;
      const paperH = 7.2 * scale;
      ctx.fillStyle = '#f2e7bf';
      ctx.fillRect(dir * 2.6 - paperW / 2, deskY - paperH / 2, paperW, paperH);
      ctx.strokeStyle = '#a2865c';
      ctx.lineWidth = 1;
      ctx.strokeRect(dir * 2.6 - paperW / 2, deskY - paperH / 2, paperW, paperH);
      ctx.strokeStyle = '#8f6f44';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(dir * 2.6 - paperW * 0.34, deskY - paperH * 0.06);
      ctx.lineTo(dir * 2.6 + paperW * 0.32, deskY - paperH * 0.06);
      ctx.moveTo(dir * 2.6 - paperW * 0.34, deskY + paperH * 0.16);
      ctx.lineTo(dir * 2.6 + paperW * 0.28, deskY + paperH * 0.16);
      ctx.stroke();

      const signShift = signLife * 3.6;
      const handX = dir * (bodyR * 0.68 + signShift);
      const handY = -bodyR * 0.02;
      ctx.strokeStyle = '#e4d3b5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dir * (bodyR * 0.42), -bodyR * 0.18);
      ctx.lineTo(handX, handY);
      ctx.stroke();
      ctx.fillStyle = '#f0d1b5';
      ctx.beginPath();
      ctx.arc(handX, handY, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4c2a2';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(handX + dir * 1.2, handY + 0.3);
      ctx.lineTo(handX + dir * 4.2, handY + 1.8);
      ctx.stroke();
    }

    // Suit body.
    ctx.fillStyle = '#1d2d45';
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9db4d2';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#f1f5ff';
    ctx.beginPath();
    ctx.moveTo(0, -bodyR * 0.24);
    ctx.lineTo(-bodyR * 0.22, bodyR * 0.28);
    ctx.lineTo(bodyR * 0.22, bodyR * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ad2f3f';
    ctx.fillRect(-1.6, -bodyR * 0.04, 3.2, bodyR * 0.42);

    // Head + hair.
    ctx.fillStyle = '#f0d1b5';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.9, bodyR * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a2d1f';
    ctx.beginPath();
    ctx.ellipse(-dir * 1.2, -bodyR * 1.08, bodyR * 0.34, bodyR * 0.16, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c2330';
    ctx.beginPath();
    ctx.arc(-bodyR * 0.14, -bodyR * 0.9, 1.1, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.14, -bodyR * 0.9, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#642a2a';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.16, -bodyR * 0.74);
    ctx.lineTo(bodyR * 0.16, -bodyR * 0.74);
    ctx.stroke();

    // Microphone.
    ctx.strokeStyle = '#cfd7e5';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(dir * 4, -bodyR * 0.2);
    ctx.lineTo(dir * (podiumW * 0.42), bodyR * 0.35);
    ctx.stroke();
    ctx.fillStyle = '#9fb3ce';
    ctx.beginPath();
    ctx.arc(dir * 4, -bodyR * 0.22, 2.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    const beamLife = upgraded
      ? Math.max(0, Math.min(
        1,
        (Number(minion.presidentExecutiveOrderBeamTtl) || 0) / Math.max(0.01, Number(minion.presidentExecutiveOrderBeamMaxTtl) || 0.55)
      ))
      : 0;
    if (!cacheRender && beamLife > 0.001) {
      const toX = Number.isFinite(minion.presidentExecutiveOrderBeamToX)
        ? minion.presidentExecutiveOrderBeamToX
        : x + dir * 80;
      const toY = Number.isFinite(minion.presidentExecutiveOrderBeamToY)
        ? minion.presidentExecutiveOrderBeamToY
        : y - 12;
      const fromX = x + dir * 10;
      const fromY = y - bodyR * 0.2;
      const arc = dir * (8 + beamLife * 11);
      ctx.save();
      ctx.globalAlpha = 0.35 + beamLife * 0.62;
      const beam = ctx.createLinearGradient(fromX, fromY, toX, toY);
      beam.addColorStop(0, '#fff4bf');
      beam.addColorStop(0.42, '#f5d58a');
      beam.addColorStop(1, '#ffecc2');
      ctx.strokeStyle = beam;
      ctx.lineWidth = 2.8 + beamLife * 3.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.quadraticCurveTo((fromX + toX) * 0.5 + arc, (fromY + toY) * 0.5 - 9, toX, toY);
      ctx.stroke();
      ctx.fillStyle = '#fff0c4';
      ctx.beginPath();
      ctx.arc(toX, toY, 2 + beamLife * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    this.drawThemedSpecialLook(minion, 'president', { cacheRender, upgraded });

    if (showHud) {
      ctx.fillStyle = '#ffe3b9';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('PRESIDENT', x, y - bodyR - 18);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawShieldBearerSprite(minion, options = {}) {
    if (this.drawThemedSpecialSprite(minion, 'shield', options)) return;
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.shieldDarkMetalUpgraded);
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;
    const baseR = Math.max(18, Number(minion.r) || 20);
    const scale = 1.1;
    const bodyW = baseR * 1.05;
    const bodyH = baseR * 2.02;
    const headR = baseR * 0.44;
    const pushLife = Math.max(0, Math.min(1, (Number(minion.shieldPushTtl) || 0) / 0.75));
    const darkMetalLife = Math.max(0, Math.min(1, (Number(minion.shieldDarkMetalTtl) || 0) / SHIELD_DARK_METAL_DURATION));
    const darkMetalActive = darkMetalLife > 0.001;
    const shieldGuardPose = Math.max(0, Math.min(1, Number(minion.shieldGuardPose) || 0));
    if (!cacheRender) {
      const baseRBucket = Math.max(18, Math.min(36, Math.round(baseR)));
      const pushBucket = Math.max(0, Math.min(5, Math.round(pushLife * 5)));
      const darkMetalBucket = Math.max(0, Math.min(5, Math.round(darkMetalLife * 5)));
      const poseBucket = Math.max(0, Math.min(6, Math.round(shieldGuardPose * 6)));
      const cacheKey = `shield:${sideName}:${baseRBucket}:${upgraded ? 1 : 0}:${pushBucket}:${darkMetalBucket}:${poseBucket}`;
      const cacheWidth = Math.ceil(baseRBucket * 6.2 + 64);
      const cacheHeight = Math.ceil(baseRBucket * 7.2 + 72);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          r: baseRBucket,
          shieldPushTtl: (pushBucket / 5) * 0.75,
          shieldDarkMetalTtl: (darkMetalBucket / 5) * SHIELD_DARK_METAL_DURATION,
          shieldGuardPose: poseBucket / 6,
        };
        this.drawShieldBearerSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        this.drawThemedSpecialLook(minion, 'shield', { cacheRender, upgraded: upgraded || darkMetalActive });
        const guideShieldScale = 1 + pushLife * 0.45;
        const guideShieldW = (baseR * 0.6 + 6) * guideShieldScale;
        const guideShieldH = (baseR * 1.45 + 14) * guideShieldScale;
        const guideShieldFrontX = x + dir * (baseR * 0.88);
        const guideShieldFrontY = y + baseR * 0.06;
        const guideShieldUpX = x + dir * (baseR * 0.28);
        const guideShieldUpY = y - baseR * 2.86;
        const guideShieldX = guideShieldFrontX + (guideShieldUpX - guideShieldFrontX) * shieldGuardPose;
        const guideShieldY = guideShieldFrontY + (guideShieldUpY - guideShieldFrontY) * shieldGuardPose;
        const guideShieldTiltRad = Math.PI / 12;
        const guideShieldRot = -((Math.PI * 0.5) - guideShieldTiltRad) * dir * shieldGuardPose;
        const guideHeadX = x - dir * (baseR * 0.06);
        const guideHeadY = y - baseR * 2;
        const guideBodyX = x + dir * (baseR * (0.04 - shieldGuardPose * 0.12));
        const guideBodyY = y - baseR * (0.68 + shieldGuardPose * 0.04);
        const guideBodyR = baseR * (0.76 + shieldGuardPose * 0.22);
        ctx.save();
        ctx.globalAlpha = darkMetalActive ? 0.8 : 0.74;
        ctx.setLineDash([4, 2.4]);
        ctx.strokeStyle = darkMetalActive ? '#f0c173' : '#ffd37f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(guideHeadX, guideHeadY, headR + 1.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = darkMetalActive ? '#98d2ef' : '#9bcdf0';
        ctx.beginPath();
        ctx.arc(guideBodyX, guideBodyY, guideBodyR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = darkMetalActive ? '#eef5ff' : '#e4f1ff';
        ctx.lineWidth = 1.75;
        ctx.beginPath();
        ctx.ellipse(guideShieldX, guideShieldY, guideShieldW * 0.62, guideShieldH * 0.52, guideShieldRot, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        if (showHud) {
          ctx.fillStyle = darkMetalActive ? '#d0d7e5' : '#d9ecff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(darkMetalActive ? 'DARK METAL' : 'SHIELD', minion.x, minion.y - bodyH - headR - 18);
          this.drawMinionHpBar(minion, minion.x, minion.y + 2, Math.max(1.4, (baseR / 16) * 1.25));
        }
        return;
      }
    }
    const shieldScale = 1 + pushLife * 0.45;
    const shieldW = (baseR * 0.6 + 6) * shieldScale;
    const shieldH = (baseR * 1.45 + 14) * shieldScale;
    const shieldFrontX = x + dir * (baseR * 0.88);
    const shieldFrontY = y + baseR * 0.06;
    const shieldUpX = x + dir * (baseR * 0.28);
    const shieldUpY = y - baseR * 2.86;
    const shieldX = shieldFrontX + (shieldUpX - shieldFrontX) * shieldGuardPose;
    const shieldY = shieldFrontY + (shieldUpY - shieldFrontY) * shieldGuardPose;
    const shieldTiltRad = Math.PI / 12;
    const shieldRot = -((Math.PI * 0.5) - shieldTiltRad) * dir * shieldGuardPose;
    const headX = x - dir * (baseR * 0.06);
    const headY = y - baseR * 2;

    ctx.fillStyle = '#0000002c';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyH + 6, bodyW * 1.08, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (pushLife > 0) {
      ctx.strokeStyle = this.withAlpha('#c7e3ff', 0.28 + pushLife * 0.35);
      ctx.lineWidth = 2 + pushLife * 2;
      ctx.beginPath();
      ctx.ellipse(shieldX, shieldY, shieldW * 0.6, shieldH * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (darkMetalActive) {
      ctx.strokeStyle = this.withAlpha('#d5dde8', 0.16 + darkMetalLife * 0.22);
      ctx.lineWidth = 1.6 + darkMetalLife * 1.8;
      ctx.beginPath();
      ctx.ellipse(shieldX, shieldY, shieldW * (0.62 + darkMetalLife * 0.06), shieldH * (0.52 + darkMetalLife * 0.06), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = darkMetalActive ? '#21252d' : '#384e6f';
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.64, -bodyH * 0.92);
    ctx.lineTo(-bodyW * 0.82, bodyH * 0.9);
    ctx.lineTo(bodyW * 0.62, bodyH * 0.9);
    ctx.lineTo(bodyW * 0.48, -bodyH * 0.92);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darkMetalActive ? '#596171' : '#a9c5e6';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = darkMetalActive ? '#141922' : '#25364f';
    ctx.fillRect(-bodyW * 0.74, -bodyH * 0.5, bodyW * 1.48, bodyH * 0.22);
    ctx.fillStyle = darkMetalActive ? '#2a303b' : '#6f86a9';
    ctx.fillRect(-bodyW * 0.72, bodyH * 0.48, bodyW * 0.58, bodyH * 0.25);
    ctx.fillRect(bodyW * 0.14, bodyH * 0.48, bodyW * 0.58, bodyH * 0.25);
    if (upgraded) {
      ctx.fillStyle = '#a8f0ff';
      for (let i = -1; i <= 1; i += 1) {
        const gemX = i * bodyW * 0.24;
        const gemY = -bodyH * 0.22;
        const gemW = bodyW * 0.12;
        const gemH = bodyW * 0.16;
        ctx.beginPath();
        ctx.moveTo(gemX, gemY - gemH);
        ctx.lineTo(gemX + gemW, gemY);
        ctx.lineTo(gemX, gemY + gemH);
        ctx.lineTo(gemX - gemW, gemY);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.save();
    ctx.translate(shieldX, shieldY);
    ctx.rotate(shieldRot);
    ctx.scale(dir, 1);
    const shW = shieldW;
    const shH = shieldH;
    const r = Math.max(8, baseR * 0.42);
    ctx.fillStyle = darkMetalActive ? '#151a20' : '#4f6688';
    ctx.beginPath();
    ctx.moveTo(-shW * 0.5 + r, -shH * 0.5);
    ctx.lineTo(shW * 0.5 - r, -shH * 0.5);
    ctx.quadraticCurveTo(shW * 0.5, -shH * 0.5, shW * 0.5, -shH * 0.5 + r);
    ctx.lineTo(shW * 0.5, shH * 0.5 - r);
    ctx.quadraticCurveTo(shW * 0.5, shH * 0.5, shW * 0.5 - r, shH * 0.5);
    ctx.lineTo(-shW * 0.5 + r, shH * 0.5);
    ctx.quadraticCurveTo(-shW * 0.5, shH * 0.5, -shW * 0.5, shH * 0.5 - r);
    ctx.lineTo(-shW * 0.5, -shH * 0.5 + r);
    ctx.quadraticCurveTo(-shW * 0.5, -shH * 0.5, -shW * 0.5 + r, -shH * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darkMetalActive ? '#5c6673' : '#d4e5fa';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.strokeStyle = darkMetalActive ? '#2f3948' : '#8eb4de';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-shW * 0.3, -shH * 0.36);
    ctx.lineTo(shW * 0.26, -shH * 0.36);
    ctx.moveTo(-shW * 0.3, 0);
    ctx.lineTo(shW * 0.26, 0);
    ctx.moveTo(-shW * 0.3, shH * 0.36);
    ctx.lineTo(shW * 0.26, shH * 0.36);
    ctx.stroke();
    if (upgraded) {
      ctx.fillStyle = darkMetalActive ? '#e9f4ff' : '#c6f6ff';
      const gemR = Math.max(3.2, baseR * 0.12);
      for (let i = -1; i <= 1; i += 1) {
        const gx = -shW * 0.12 + i * shW * 0.2;
        const gy = -shH * 0.16 + Math.abs(i) * shH * 0.18;
        ctx.beginPath();
        ctx.moveTo(gx, gy - gemR);
        ctx.lineTo(gx + gemR, gy);
        ctx.lineTo(gx, gy + gemR);
        ctx.lineTo(gx - gemR, gy);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

    // Clarify collision lanes on sprite: head ring, body ring, shield ring.
    const bodyHitX = x + dir * (baseR * (0.04 - shieldGuardPose * 0.12));
    const bodyHitY = y - baseR * (0.68 + shieldGuardPose * 0.04);
    const bodyHitR = baseR * (0.76 + shieldGuardPose * 0.22);
    ctx.save();
    ctx.globalAlpha = darkMetalActive ? 0.8 : 0.74;
    ctx.setLineDash([4, 2.4]);
    ctx.strokeStyle = darkMetalActive ? '#f0c173' : '#ffd37f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(headX, headY, headR + 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = darkMetalActive ? '#98d2ef' : '#9bcdf0';
    ctx.beginPath();
    ctx.arc(bodyHitX, bodyHitY, bodyHitR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = darkMetalActive ? '#eef5ff' : '#e4f1ff';
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    ctx.ellipse(shieldX, shieldY, shieldW * 0.62, shieldH * 0.52, shieldRot, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Face remains visible, but raised guard now sits farther forward and can cover the head lane.
    ctx.fillStyle = '#efcfb1';
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f1f1a';
    ctx.beginPath();
    ctx.ellipse(headX - dir * (headR * 0.12), headY - headR * 0.36, headR * 0.66, headR * 0.42, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    this.drawThemedSpecialLook(minion, 'shield', { cacheRender, upgraded: upgraded || darkMetalActive });

    if (showHud) {
      ctx.fillStyle = darkMetalActive ? '#d0d7e5' : '#d9ecff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(darkMetalActive ? 'DARK METAL' : 'SHIELD', x, y - bodyH - headR - 18);
      this.drawMinionHpBar(minion, x, y + 2, Math.max(1.4, (baseR / 16) * 1.25));
    }
  }

  drawStoneGolemSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const { ctx } = this;
    const x = minion.x;
    const y = minion.y;
    const dir = minion.side === 'left' ? 1 : -1;
    const baseR = Math.max(22, Number(minion.r) || 30);
    const bodyW = baseR * 1.9;
    const bodyH = baseR * 1.8;
    const animNow = performance.now() * 0.001;
    const animSeed = (Number(minion.id) || 0) * 0.37;
    const moveMag = Math.max(0.2, Math.min(1.2, (Number(minion.speed) || 0) / 90));
    const idlePulse = Math.sin(animNow * 3.1 + animSeed);
    const idleSway = Math.sin(animNow * 2.4 + animSeed * 1.7);
    const marchSwing = Math.sin((Number(minion.x) || 0) * 0.1 + animNow * (2.4 + moveMag * 1.6) + animSeed);
    const smashLife = Math.max(0, Math.min(1, (Number(minion.golemSmashTtl) || 0) / STONE_GOLEM_SMASH_TTL));
    const smashProgress = 1 - smashLife;
    const smashSpin = dir * (smashProgress * Math.PI * 2 * STONE_GOLEM_ATTACK_SPIN_TURNS);
    const biteJumpMax = Math.max(0.01, Number(minion.golemBiteJumpMaxTtl) || STONE_GOLEM_BITE_JUMP_TTL);
    const biteJumpLife = Math.max(0, Math.min(1, (Number(minion.golemBiteJumpTtl) || 0) / biteJumpMax));
    const biteJumpProgress = 1 - biteJumpLife;
    const biteLandMax = Math.max(0.01, Number(minion.golemBiteLandMaxTtl) || STONE_GOLEM_BITE_LAND_TTL);
    const biteLandLife = Math.max(0, Math.min(1, (Number(minion.golemBiteLandTtl) || 0) / biteLandMax));
    const biteHeld = Boolean(minion.golemBiteHeld);
    const biteChewPulse = biteHeld ? (0.5 + Math.sin(animNow * 19 + animSeed * 0.7) * 0.5) : 0;
    const shieldMax = Math.max(0, Number(minion.golemShieldMax) || 0);
    const shieldHp = Math.max(0, Number(minion.golemShieldHp) || 0);
    const shieldTtl = Math.max(0, Number(minion.golemShieldTtl) || 0);
    const shieldHpPct = shieldMax > 0 ? Math.max(0, Math.min(1, shieldHp / shieldMax)) : 0;
    const shieldFade = Math.max(0, Math.min(1, shieldTtl / STONE_GOLEM_SHIELD_TTL));
    const sidePalette = TEAM_COLORS[minion.side] || TEAM_COLORS.left;
    const themed = this.themeMode === 'themed';
    const breadGolem = themed && minion.side === 'left';
    const riceGolem = themed && minion.side === 'right';
    const bodyFill = breadGolem ? '#b77a41' : (riceGolem ? '#d7e2e8' : '#6f756f');
    const bodyStroke = breadGolem ? '#6b3f1f' : (riceGolem ? '#8da1ab' : '#9aa49a');
    const armFill = breadGolem ? '#966338' : (riceGolem ? '#c0ced6' : '#5d625d');
    const armAccent = breadGolem ? '#cf9558' : (riceGolem ? '#e9f3f8' : '#7b827b');
    const bootFill = breadGolem ? '#7a4925' : (riceGolem ? '#a8bbc5' : '#4e524e');
    const eyeSlot = breadGolem ? '#2d1a0f' : (riceGolem ? '#2a3f47' : '#23282a');
    const crackColor = breadGolem ? '#e8b678' : (riceGolem ? '#f6fbff' : '#aeb7ae');
    const eyeGlow = riceGolem ? '#ecfbff' : sidePalette.soft;
    const hudColor = themed ? '#fff1df' : '#e3eadf';
    const hudLabel = breadGolem ? 'BREAD GOLEM' : (riceGolem ? 'RICE GOLEM' : 'GOLEM');
    let smashJumpLift = 0;
    if (smashLife > 0) {
      if (smashProgress < 0.45) {
        smashJumpLift = Math.sin((smashProgress / 0.45) * (Math.PI * 0.5)) * (baseR * 0.34);
      } else {
        const fallT = Math.max(0, Math.min(1, (smashProgress - 0.45) / 0.55));
        smashJumpLift = (1 - fallT) * (baseR * 0.34);
      }
    }
    let biteJumpLift = 0;
    if (biteJumpLife > 0) {
      if (biteJumpProgress < 0.6) {
        biteJumpLift = Math.sin((biteJumpProgress / 0.6) * (Math.PI * 0.5)) * (baseR * 0.22);
      } else {
        const fallT = Math.max(0, Math.min(1, (biteJumpProgress - 0.6) / 0.4));
        biteJumpLift = (1 - fallT) * (baseR * 0.22);
      }
    }
    const biteLandSquash = biteLandLife > 0 ? Math.sin((1 - biteLandLife) * Math.PI) * (baseR * 0.16) : 0;
    const jumpLift = smashJumpLift + biteJumpLift;
    const impactLife = smashLife > 0 ? Math.max(0, 1 - Math.abs(smashProgress - 0.74) / 0.24) : 0;
    const biteLandShake = biteLandLife > 0 ? Math.sin(animNow * 42 + animSeed) * biteLandLife * 1.8 : 0;
    const drawX = x + idleSway * baseR * 0.03 + Math.sin(animNow * 26 + animSeed) * impactLife * 1.6 + biteLandShake;
    const drawY = y - jumpLift + biteLandSquash + idlePulse * baseR * 0.035;
    const shadowStretch = 1 + Math.max(0, jumpLift / (baseR * 0.72)) + biteLandLife * 0.18;

    ctx.fillStyle = '#00000033';
    ctx.beginPath();
    ctx.ellipse(drawX, y + bodyH * 0.66, bodyW * 0.84 * shadowStretch, bodyH * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    if (shieldHpPct > 0 && shieldFade > 0) {
      const auraAlpha = (0.14 + shieldHpPct * 0.2) * (0.45 + shieldFade * 0.55);
      ctx.fillStyle = this.withAlpha(sidePalette.soft, auraAlpha * 0.55);
      ctx.beginPath();
      ctx.ellipse(drawX, drawY - bodyH * 0.08, bodyW * 0.72, bodyH * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.withAlpha('#dcf5ff', auraAlpha + 0.14);
      ctx.lineWidth = 1.6 + shieldHpPct * 1.6;
      ctx.beginPath();
      ctx.ellipse(drawX, drawY - bodyH * 0.1, bodyW * (0.78 + shieldHpPct * 0.1), bodyH * (0.76 + shieldHpPct * 0.1), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (smashLife > 0) {
      ctx.strokeStyle = this.withAlpha(sidePalette.primary, 0.22 + smashLife * 0.3);
      ctx.lineWidth = 3 + smashLife * 3;
      ctx.beginPath();
      ctx.ellipse(drawX, y + bodyH * 0.54, bodyW * (0.58 + smashLife * 0.58), bodyH * (0.19 + smashLife * 0.22), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = this.withAlpha('#e7f5ff', 0.18 + smashLife * 0.22);
      ctx.lineWidth = 1.6 + smashLife * 1.2;
      ctx.beginPath();
      ctx.ellipse(drawX, y + bodyH * 0.56, bodyW * (0.45 + smashLife * 0.44), bodyH * (0.14 + smashLife * 0.15), 0, 0, Math.PI * 2);
      ctx.stroke();
      if (impactLife > 0) {
        ctx.strokeStyle = this.withAlpha('#f7dbe3', 0.2 + impactLife * 0.32);
        ctx.lineWidth = 2 + impactLife * 2;
        ctx.beginPath();
        ctx.ellipse(drawX, y + bodyH * 0.58, bodyW * (0.52 + impactLife * 0.38), bodyH * (0.12 + impactLife * 0.15), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.translate(drawX, drawY);
    const bitePoseLife = Math.max(biteJumpLife, biteLandLife, biteHeld ? (0.72 + biteChewPulse * 0.28) : 0);
    ctx.rotate((Math.sin(animNow * 4.2 + animSeed) * 0.018 + marchSwing * 0.018) * (1 - smashLife * 0.35) * (1 - bitePoseLife * 0.55));
    if (impactLife > 0) {
      const sx = 1 + impactLife * 0.06;
      const sy = 1 - impactLife * 0.08;
      ctx.scale(sx, sy);
    }

    ctx.fillStyle = bodyFill;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.52, -bodyH * 0.54);
    ctx.lineTo(-bodyW * 0.64, bodyH * 0.28);
    ctx.lineTo(-bodyW * 0.36, bodyH * 0.62);
    ctx.lineTo(bodyW * 0.36, bodyH * 0.62);
    ctx.lineTo(bodyW * 0.64, bodyH * 0.28);
    ctx.lineTo(bodyW * 0.52, -bodyH * 0.54);
    ctx.lineTo(bodyW * 0.12, -bodyH * 0.72);
    ctx.lineTo(-bodyW * 0.12, -bodyH * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = bodyStroke;
    ctx.lineWidth = 2.1;
    ctx.stroke();

    const armLen = bodyH * 0.86;
    const armWidth = bodyW * 0.24;
    const spinTrailAlpha = smashLife > 0 ? (0.16 + smashLife * 0.28) : 0;
    const drawArm = (sideSign) => {
      const shoulderX = sideSign * bodyW * 0.62;
      const shoulderY = -bodyH * 0.16;
      const biteRaise = bitePoseLife * (0.5 + biteChewPulse * 0.2);
      const idleAngle = sideSign * (0.16 + marchSwing * 0.34) - biteRaise * sideSign;
      const attackAngle = smashSpin + sideSign * Math.PI * 0.96;
      const armAngle = smashLife > 0 ? attackAngle : idleAngle;

      ctx.save();
      ctx.translate(shoulderX, shoulderY);
      ctx.rotate(armAngle);
      ctx.fillStyle = armFill;
      ctx.fillRect(-armWidth * 0.5, -armWidth * 0.32, armWidth, armLen * 0.92);
      ctx.fillStyle = armAccent;
      ctx.fillRect(-armWidth * 0.44, armLen * 0.45, armWidth * 0.88, armLen * 0.24);
      ctx.fillStyle = bodyStroke;
      ctx.fillRect(-armWidth * 0.58, armLen * 0.72, armWidth * 1.16, armLen * 0.2);
      ctx.restore();

      if (spinTrailAlpha > 0) {
        const trailR = bodyW * (0.54 + smashLife * 0.22);
        ctx.strokeStyle = this.withAlpha(sidePalette.soft, spinTrailAlpha + 0.08);
        ctx.lineWidth = 1.8 + smashLife * 1.8;
        ctx.beginPath();
        ctx.arc(shoulderX, shoulderY + bodyH * 0.08, trailR, armAngle - dir * 0.5, armAngle - dir * 2.25, dir < 0);
        ctx.stroke();
      }
    };
    drawArm(-1);
    drawArm(1);

    ctx.fillStyle = bootFill;
    const leftBootLift = Math.max(0, marchSwing) * baseR * 0.08 * (1 - smashLife * 0.35) + bitePoseLife * baseR * 0.18;
    const rightBootLift = Math.max(0, -marchSwing) * baseR * 0.08 * (1 - smashLife * 0.35) + bitePoseLife * baseR * 0.18;
    ctx.fillRect(-bodyW * 0.36, bodyH * 0.56 - leftBootLift, bodyW * 0.26, bodyH * 0.28);
    ctx.fillRect(bodyW * 0.1, bodyH * 0.56 - rightBootLift, bodyW * 0.26, bodyH * 0.28);

    ctx.fillStyle = eyeSlot;
    const eyeY = -bodyH * 0.3;
    ctx.fillRect(-bodyW * 0.18, eyeY, bodyW * 0.14, bodyH * 0.08);
    ctx.fillRect(bodyW * 0.04, eyeY, bodyW * 0.14, bodyH * 0.08);
    const eyePulse = 0.5 + Math.sin(animNow * 8.8 + animSeed + smashLife * 4.2) * 0.5;
    const eyeGlowW = bodyW * (0.094 + eyePulse * 0.012);
    const eyeGlowH = bodyH * (0.034 + eyePulse * 0.009 + smashLife * 0.006);
    ctx.fillStyle = this.withAlpha(eyeGlow, 0.5 + eyePulse * 0.3 + smashLife * 0.2);
    ctx.fillRect(-bodyW * 0.16, eyeY + bodyH * 0.014, eyeGlowW, eyeGlowH);
    ctx.fillRect(bodyW * 0.06, eyeY + bodyH * 0.014, eyeGlowW, eyeGlowH);

    const biteMouthOpen = Math.max(
      biteHeld ? (0.68 + biteChewPulse * 0.32) : 0,
      biteJumpLife * 0.95,
      biteLandLife * 0.62
    );
    const mouthCenterY = -bodyH * 0.09 + biteMouthOpen * bodyH * 0.045;
    const mouthW = bodyW * (0.13 + biteMouthOpen * 0.18);
    const mouthH = bodyH * (0.034 + biteMouthOpen * 0.24);
    ctx.fillStyle = this.withAlpha(eyeSlot, 0.84 + biteMouthOpen * 0.12);
    ctx.beginPath();
    ctx.ellipse(0, mouthCenterY, mouthW, mouthH, 0, 0, Math.PI * 2);
    ctx.fill();
    if (biteMouthOpen > 0.2) {
      ctx.strokeStyle = this.withAlpha('#f3fbff', 0.22 + biteMouthOpen * 0.28);
      ctx.lineWidth = 1.1 + biteMouthOpen * 0.9;
      ctx.beginPath();
      ctx.moveTo(-mouthW * 0.78, mouthCenterY - mouthH * 0.4);
      ctx.lineTo(mouthW * 0.78, mouthCenterY - mouthH * 0.4);
      ctx.stroke();
      ctx.strokeStyle = this.withAlpha(bodyStroke, 0.32 + biteMouthOpen * 0.34);
      ctx.lineWidth = 1 + biteMouthOpen * 0.8;
      ctx.beginPath();
      ctx.moveTo(-mouthW * 0.84, mouthCenterY + mouthH * 0.46);
      ctx.lineTo(mouthW * 0.84, mouthCenterY + mouthH * 0.46);
      ctx.stroke();
    }

    ctx.strokeStyle = crackColor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.24, -bodyH * 0.06);
    ctx.lineTo(-bodyW * 0.08, bodyH * 0.1);
    ctx.lineTo(bodyW * 0.04, -bodyH * 0.02);
    ctx.moveTo(bodyW * 0.26, -bodyH * 0.18);
    ctx.lineTo(bodyW * 0.1, bodyH * 0.02);
    ctx.stroke();

    if (breadGolem) {
      ctx.fillStyle = '#e8b46e';
      for (let i = 0; i < 7; i += 1) {
        const sx = -bodyW * 0.4 + i * (bodyW * 0.12);
        const sy = -bodyH * 0.48 + ((i % 2) * bodyH * 0.06);
        ctx.beginPath();
        ctx.ellipse(sx, sy, 2.4, 1.4, (i % 2 ? 0.32 : -0.24), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = '#f1cf98';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.32, -bodyH * 0.48);
      ctx.lineTo(bodyW * 0.32, -bodyH * 0.48);
      ctx.stroke();
    } else if (riceGolem) {
      ctx.fillStyle = '#f8fdff';
      for (let i = 0; i < 12; i += 1) {
        const gx = -bodyW * 0.38 + (i % 4) * (bodyW * 0.25);
        const gy = -bodyH * 0.52 + Math.floor(i / 4) * (bodyH * 0.18);
        ctx.beginPath();
        ctx.ellipse(gx, gy, 2.1, 1.35, 0.24, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#d7e8f0';
      ctx.beginPath();
      ctx.ellipse(0, -bodyH * 0.02, bodyW * 0.23, bodyH * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (smashLife > 0) {
      ctx.strokeStyle = this.withAlpha('#e4f4ff', 0.22 + smashLife * 0.34);
      ctx.lineWidth = 1.8 + smashLife * 1.8;
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.8 * dir, bodyH * 0.36);
      ctx.lineTo(-bodyW * 0.96 * dir, bodyH * 0.58);
      ctx.stroke();
    }

    ctx.restore();

    if (showHud) {
      ctx.fillStyle = hudColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hudLabel, drawX, drawY - bodyH - 20);
      if (shieldMax > 0 && (shieldHpPct > 0 || shieldFade > 0)) {
        const barScale = Math.max(1.7, (baseR / 16) * 1.4);
        const shieldW = 36 * barScale;
        const shieldX = drawX - shieldW / 2;
        const shieldY = (drawY + 8) - (26 * barScale + 2) - 8;
        ctx.fillStyle = '#101420d9';
        ctx.fillRect(shieldX, shieldY, shieldW, 4);
        if (shieldHpPct > 0) {
          ctx.fillStyle = this.withAlpha('#8de6ff', 0.55 + shieldFade * 0.35);
          ctx.fillRect(shieldX, shieldY, shieldW * shieldHpPct, 4);
        }
      }
      this.drawMinionHpBar(minion, drawX, drawY + 8, Math.max(1.7, (baseR / 16) * 1.4));
    }
  }

  miniFailedSpecialMinion(type, side = 'left', level = null) {
    const base = {
      side,
      x: 0,
      y: 0,
      r: 16,
      hp: 100,
      maxHp: 100,
      tier: 1,
      level: 8,
      super: false,
      summoned: false,
      explosive: false,
      gunner: false,
      rider: false,
      riderChargeReady: false,
      digger: false,
      digPhase: 0.8,
      monk: false,
      monkHealScale: 1,
      hero: false,
      heroSwing: 1.1,
      shieldBearer: false,
      shieldPushTtl: 0,
      shieldPushScale: 1,
      stoneGolem: false,
      golemSmashTtl: 0,
      golemShieldHp: 0,
      golemShieldMax: 0,
      golemShieldTtl: 0,
      golemBiteJumpTtl: 0,
      golemBiteJumpMaxTtl: STONE_GOLEM_BITE_JUMP_TTL,
      golemBiteLandTtl: 0,
      golemBiteLandMaxTtl: STONE_GOLEM_BITE_LAND_TTL,
      golemBiteHeld: false,
      president: false,
      presidentSetup: true,
      presidentAuraRadius: 180,
      dragon: false,
      flying: false,
      flyPhase: 0.8,
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunFlashTtl: 0,
      necrominion: false,
      failedSpecialType: null,
    };
    const previewLevel = Math.max(1, Number(level) || 1);
    if (type === 'dragon') {
      base.dragon = true;
      base.flying = true;
      base.r = 23;
      base.level = Math.max(14, previewLevel);
    } else if (type === 'shield') {
      base.shieldBearer = true;
      base.r = 26;
    } else if (type === 'digger') {
      base.digger = true;
      base.r = 13;
    } else if (type === 'necrominion') {
      base.necrominion = true;
      base.r = 20;
    } else if (type === 'gunner') {
      base.gunner = true;
      base.r = 15;
      base.level = Math.max(9, previewLevel);
    } else if (type === 'rider') {
      base.rider = true;
      base.riderChargeReady = true;
      base.r = 18;
      base.level = Math.max(10, previewLevel);
    } else if (type === 'monk') {
      base.monk = true;
      base.r = 18;
      base.level = Math.max(10, previewLevel);
    } else if (type === 'stonegolem') {
      base.stoneGolem = true;
      base.r = 30;
      base.level = Math.max(14, previewLevel);
      base.tier = 2;
    } else if (type === 'hero') {
      base.hero = true;
      base.r = 23;
      base.level = Math.max(16, previewLevel);
      base.tier = 2;
    } else if (type === 'president') {
      base.president = true;
      base.r = 18;
      base.level = Math.max(12, previewLevel);
    } else if (type === 'balloon') {
      base.balloon = true;
      base.flying = true;
      base.r = 32;
      base.balloonLevel = previewLevel;
      base.level = previewLevel;
    } else if (type === 'super') {
      base.super = true;
      base.r = 20;
      base.tier = 2;
      base.level = Math.max(14, previewLevel);
    } else {
      return null;
    }
    return base;
  }

  drawFailedSpecialMini(type, x, y, size = 3, side = 'left') {
    const mini = this.miniFailedSpecialMinion(type, side);
    if (!mini) return;
    const { ctx } = this;
    const s = Math.max(3, size);
    const scale = s / 22;
    ctx.save();
    ctx.translate(x, y + 1.5);
    ctx.scale(scale, scale);
    this.drawMinionSprite(mini, { showHud: false, allowEffects: false });
    ctx.restore();
  }

  drawFailedSpecialHat(minion, x, y, bodyR, scale = 1) {
    const type = typeof minion?.failedSpecialType === 'string' ? minion.failedSpecialType : null;
    if (!type) return;
    const style = FAILED_SPECIAL_HAT_STYLES[type] || null;
    if (!style) return;
    const { ctx } = this;
    const hatW = Math.max(16, bodyR * scale * 1.34);
    const hatH = Math.max(9, bodyR * scale * 0.82);
    const brimW = hatW + 10;
    const brimH = Math.max(3.4, bodyR * scale * 0.28);
    const topY = y - bodyR * scale - 12;

    ctx.fillStyle = '#00000025';
    ctx.beginPath();
    ctx.ellipse(x, topY + brimH + 1, brimW * 0.58, brimH * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style.cap;
    ctx.beginPath();
    ctx.moveTo(x - hatW * 0.55, topY);
    ctx.lineTo(x + hatW * 0.35, topY);
    ctx.lineTo(x + hatW * 0.15, topY - hatH);
    ctx.lineTo(x - hatW * 0.45, topY - hatH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = style.brim;
    ctx.fillRect(x - brimW * 0.5, topY, brimW, brimH);
    ctx.strokeStyle = '#182233';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - brimW * 0.5, topY, brimW, brimH);
    this.drawFailedSpecialMini(
      type,
      x - hatW * 0.08,
      topY - hatH - 4,
      Math.max(5.6, bodyR * scale * 0.34),
      minion.side
    );
  }

  militiaUpgradeVisualTier(minion, stage = 0, tier = 0) {
    const forced = Number(minion?.upgradeVisualTier);
    if (Number.isFinite(forced)) return Math.max(0, Math.min(3, Math.round(forced)));
    const level = Math.max(0, Number(minion?.level) || 0);
    let visualTier = 0;
    if (level >= 3 || stage >= 1) visualTier = 1;
    if (level >= 7 || stage >= 2) visualTier = 2;
    if (level >= 11 || stage >= 3) visualTier = 3;
    if (minion?.super) visualTier = Math.max(2, visualTier);
    return visualTier;
  }

  drawThemedMilitiaUpgradeGear(minion, bodyR, stage = 0, tier = 0) {
    if (!this.isThemedEmpires()) return;
    if (!minion || minion.rider) return;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const visualTier = this.militiaUpgradeVisualTier(minion, stage, tier);
    if (visualTier <= 0) return;

    const beltY = bodyR * 0.18;
    ctx.strokeStyle = sideName === 'left' ? '#6f452b' : '#31556d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.54, beltY - 0.08);
    ctx.lineTo(bodyR * 0.56, beltY + 0.12);
    ctx.stroke();

    if (sideName === 'left') {
      if (visualTier >= 1) {
        // European padded shoulders + chest strap.
        ctx.fillStyle = '#6d7988';
        ctx.beginPath();
        ctx.ellipse(dir * bodyR * 0.42, -bodyR * 0.1, bodyR * 0.28, bodyR * 0.21, -0.2 * dir, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4dce6';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.strokeStyle = '#d9be90';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-dir * bodyR * 0.46, -bodyR * 0.3);
        ctx.lineTo(dir * bodyR * 0.18, bodyR * 0.24);
        ctx.stroke();
      }
      if (visualTier >= 2) {
        // European steel helmet + nasal guard.
        ctx.fillStyle = '#bcc8d6';
        ctx.beginPath();
        ctx.arc(0, -bodyR * 0.66, bodyR * 0.43, Math.PI, 0, false);
        ctx.lineTo(bodyR * 0.32, -bodyR * 0.47);
        ctx.lineTo(-bodyR * 0.32, -bodyR * 0.47);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#e8eef6';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        ctx.fillStyle = '#7f8ea2';
        ctx.fillRect(-bodyR * 0.055, -bodyR * 0.66, bodyR * 0.11, bodyR * 0.24);

        // Sword on belt (scabbard + hilt).
        ctx.strokeStyle = '#553726';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-dir * bodyR * 0.06, beltY - 0.02);
        ctx.lineTo(-dir * bodyR * 0.58, bodyR * 0.58);
        ctx.stroke();

        ctx.strokeStyle = '#d8e0eb';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-dir * bodyR * 0.03, beltY - 0.02);
        ctx.lineTo(-dir * bodyR * 0.2, beltY - 0.18);
        ctx.stroke();
        ctx.fillStyle = '#d4ba82';
        ctx.beginPath();
        ctx.arc(-dir * bodyR * 0.025, beltY - 0.02, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      if (visualTier >= 3) {
        // High-tier knightly trim and second pauldron.
        ctx.fillStyle = '#78869a';
        ctx.beginPath();
        ctx.ellipse(-dir * bodyR * 0.38, -bodyR * 0.04, bodyR * 0.24, bodyR * 0.18, 0.18 * dir, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#dbe4ee';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.strokeStyle = '#f3d7aa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-bodyR * 0.25, -bodyR * 0.02);
        ctx.lineTo(bodyR * 0.27, -bodyR * 0.02);
        ctx.moveTo(-bodyR * 0.2, bodyR * 0.11);
        ctx.lineTo(bodyR * 0.21, bodyR * 0.11);
        ctx.stroke();
      }
    } else {
      if (visualTier >= 1) {
        // Asian lamellar vest slats.
        ctx.fillStyle = '#335d77';
        ctx.fillRect(-bodyR * 0.44, -bodyR * 0.35, bodyR * 0.88, bodyR * 0.35);
        ctx.strokeStyle = '#96b8cc';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < 4; i += 1) {
          const sx = -bodyR * 0.3 + i * bodyR * 0.2;
          ctx.moveTo(sx, -bodyR * 0.33);
          ctx.lineTo(sx, -bodyR * 0.03);
        }
        ctx.stroke();
      }
      if (visualTier >= 2) {
        // Kabuto-like helmet.
        ctx.fillStyle = '#233b55';
        ctx.beginPath();
        ctx.arc(0, -bodyR * 0.66, bodyR * 0.43, Math.PI, 0, false);
        ctx.lineTo(bodyR * 0.34, -bodyR * 0.48);
        ctx.lineTo(-bodyR * 0.34, -bodyR * 0.48);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#4b6f89';
        ctx.fillRect(-bodyR * 0.5, -bodyR * 0.49, bodyR, bodyR * 0.08);
        ctx.strokeStyle = '#b8d4e5';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-bodyR * 0.5, -bodyR * 0.49, bodyR, bodyR * 0.08);

        // Katana on belt (saya + tsuka).
        ctx.strokeStyle = '#2a3d4f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-dir * bodyR * 0.04, beltY - 0.03);
        ctx.lineTo(-dir * bodyR * 0.6, bodyR * 0.53);
        ctx.stroke();

        ctx.strokeStyle = '#d8b883';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-dir * bodyR * 0.01, beltY - 0.04);
        ctx.lineTo(-dir * bodyR * 0.15, beltY - 0.19);
        ctx.stroke();
        ctx.fillStyle = '#f2ddae';
        ctx.beginPath();
        ctx.arc(-dir * bodyR * 0.01, beltY - 0.04, 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
      if (visualTier >= 3) {
        // Higher-tier sode shoulder and crest line.
        ctx.fillStyle = '#3f6883';
        ctx.fillRect(dir * bodyR * 0.24, -bodyR * 0.2, bodyR * 0.26, bodyR * 0.22);
        ctx.strokeStyle = '#c7deea';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(dir * bodyR * 0.24, -bodyR * 0.2, bodyR * 0.26, bodyR * 0.22);

        ctx.strokeStyle = '#dcbf7f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-bodyR * 0.22, -bodyR * 0.82);
        ctx.lineTo(bodyR * 0.22, -bodyR * 0.82);
        ctx.stroke();
      }
    }
  }

  drawStandardMinionHud(minion, x, y, bodyR, scale, options = {}) {
    const isRider = options.isRider === true;
    const { ctx } = this;

    if (minion.super) {
      ctx.fillStyle = '#ffe6a8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SUPER', x, y - bodyR * scale - 18);
    }

    if (isRider) {
      ctx.fillStyle = '#ffe5bf';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('RIDER', x, y - bodyR * scale - (minion.super ? 34 : 20));
      if (minion.riderChargeReady) {
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.018 + (Number(minion.id) || 0) * 0.73);
        ctx.save();
        ctx.fillStyle = pulse > 0.5 ? '#fff5cf' : '#ffd88d';
        ctx.font = `bold ${minion.super ? 12 : 10}px sans-serif`;
        ctx.fillText('CHARGE READY', x, y - bodyR * scale - (minion.super ? 46 : 32));
        ctx.strokeStyle = '#fff1c7';
        ctx.lineWidth = 1.5;
        const markerY = y - bodyR * scale - (minion.super ? 39 : 27);
        ctx.beginPath();
        ctx.moveTo(x - 9, markerY - 2);
        ctx.lineTo(x - 3, markerY);
        ctx.lineTo(x - 9, markerY + 2);
        ctx.moveTo(x + 9, markerY - 2);
        ctx.lineTo(x + 3, markerY);
        ctx.lineTo(x + 9, markerY + 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    const hpPct = Math.max(0, minion.hp / minion.maxHp);
    const hpW = 36 * scale;
    const hpX = x - hpW / 2;
    const hpY = y - (26 * scale + 2);
    ctx.fillStyle = '#101420cc';
    ctx.fillRect(hpX, hpY, hpW, 5);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * hpPct, 5);
    this.drawHealthBarNotches(hpX, hpY, hpW, 5, minion.maxHp);
  }

  drawBalloonSprite(minion, options = {}) {
    if (!minion) return;
    const showHud = options.showHud !== false;
    const allowEffects = options.allowEffects !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const r = Math.max(32, Number(minion.r) || 32);
    const topScale = 0.5; // Half dimensions (about 1/4 area) per request.
    const dir = minion.side === 'right' ? -1 : 1;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const sidePalette = TEAM_COLORS[sideName] || TEAM_COLORS.left;
    const themed = this.isThemedEmpires();
    const balloonLevel = Math.max(1, Number(minion.balloonLevel) || 1);
    const upgraded = balloonLevel > 1;
    const t = performance.now() * 0.001;
    const crewAnim = Math.sin(t * 7.2 + (Number(minion.id) || 0) * 0.41);
    const swingA = Math.sin(t * 6.8 + (Number(minion.id) || 0) * 0.87);
    const swingB = Math.sin(t * 7.9 + (Number(minion.id) || 0) * 0.58 + 1.7);
    const bodyY = y + r * 0.98;
    const throwFromX = x + dir * r * 0.14;
    const throwFromY = bodyY + r * 0.08;
    const bombFromX = x + dir * r * 0.06;
    const bombFromY = bodyY + r * 0.22;
    const throwLife = Math.max(
      0,
      Math.min(1, (Number(minion.balloonThrowTtl) || 0) / Math.max(0.01, Number(minion.balloonThrowMaxTtl) || 0.6))
    );
    const bombLife = Math.max(
      0,
      Math.min(1, (Number(minion.balloonBombTtl) || 0) / Math.max(0.01, Number(minion.balloonBombMaxTtl) || 0.52))
    );

    const shellA = themed ? sidePalette.soft : this.withAlpha(sidePalette.soft, 0.94);
    const shellB = sidePalette.primary;
    const shellEdge = sidePalette.dark;
    const basketFill = themed
      ? (sideName === 'left' ? '#8c5e37' : '#607f93')
      : (sideName === 'left' ? '#5f85a3' : '#9d5f5f');
    const basketStroke = themed
      ? (sideName === 'left' ? '#f0d4ac' : '#d8edf8')
      : sidePalette.soft;

    ctx.save();

    const topRx = r * 1.22 * topScale;
    const topRy = r * 0.96 * topScale;
    const topY = y - r * 0.24;
    const shellGrad = ctx.createLinearGradient(x, topY - topRy, x, topY + topRy * 0.75);
    shellGrad.addColorStop(0, shellA);
    shellGrad.addColorStop(1, shellB);
    ctx.fillStyle = shellGrad;
    ctx.beginPath();
    ctx.ellipse(x, topY, topRx, topRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shellEdge;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Balloon shell segmentation for shape readability.
    ctx.strokeStyle = this.withAlpha(sidePalette.soft, themed ? 0.32 : 0.58);
    ctx.lineWidth = 1.2;
    for (let i = -2; i <= 2; i += 1) {
      const lx = x + i * (topRx * 0.35);
      ctx.beginPath();
      ctx.moveTo(lx, topY - topRy * 0.9);
      ctx.lineTo(lx, topY + topRy * 0.82);
      ctx.stroke();
    }
    ctx.strokeStyle = this.withAlpha(shellEdge, 0.34);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, topY - topRy * 0.08, topRx * 0.92, topRy * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Burner + cables.
    ctx.fillStyle = '#f6bc55';
    ctx.beginPath();
    ctx.ellipse(x, bodyY - r * 0.28, r * 0.1, r * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    if (upgraded && !cacheRender) {
      const flame = 0.6 + Math.sin(t * 11.4 + (Number(minion.id) || 0) * 0.5) * 0.4;
      ctx.fillStyle = this.withAlpha('#ffd06b', 0.45 + flame * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, bodyY - r * 0.22);
      ctx.lineTo(x - r * 0.06, bodyY - r * (0.22 + flame * 0.22));
      ctx.lineTo(x + r * 0.06, bodyY - r * (0.22 + flame * 0.22));
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#d5d5d5aa';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - topRx * 0.82, topY + topRy * 0.78);
    ctx.lineTo(x - r * 0.34, bodyY - r * 0.12);
    ctx.moveTo(x + topRx * 0.82, topY + topRy * 0.78);
    ctx.lineTo(x + r * 0.34, bodyY - r * 0.12);
    ctx.moveTo(x - topRx * 0.24, topY + topRy * 0.84);
    ctx.lineTo(x - r * 0.1, bodyY - r * 0.16);
    ctx.moveTo(x + topRx * 0.24, topY + topRy * 0.84);
    ctx.lineTo(x + r * 0.1, bodyY - r * 0.16);
    ctx.stroke();

    if (!themed) {
      // Wicker basket silhouette.
      ctx.fillStyle = basketFill;
      ctx.fillRect(x - r * 0.42, bodyY - r * 0.22, r * 0.84, r * 0.48);
      ctx.strokeStyle = basketStroke;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x - r * 0.42, bodyY - r * 0.22, r * 0.84, r * 0.48);
      ctx.strokeStyle = this.withAlpha('#f8edcf', 0.4);
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i += 1) {
        const wx = x + i * r * 0.14;
        ctx.beginPath();
        ctx.moveTo(wx, bodyY - r * 0.21);
        ctx.lineTo(wx, bodyY + r * 0.25);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(x - r * 0.4, bodyY - r * 0.02);
      ctx.lineTo(x + r * 0.4, bodyY - r * 0.02);
      ctx.moveTo(x - r * 0.4, bodyY + r * 0.11);
      ctx.lineTo(x + r * 0.4, bodyY + r * 0.11);
      ctx.stroke();
    } else if (sideName === 'left') {
      // Countertop bread maker silhouette: tall body, top lid window, front control pad.
      const bodyX = x - r * 0.5;
      const bodyYTop = bodyY - r * 0.36;
      const bodyW = r;
      const bodyH = r * 0.76;
      const loafPop = upgraded ? Math.max(0, Math.sin(t * 8 + (Number(minion.id) || 0) * 0.31)) : 0;

      // Main body.
      ctx.fillStyle = '#8cc9ff';
      ctx.fillRect(bodyX, bodyYTop, bodyW, bodyH);
      ctx.fillStyle = '#6eb4f4';
      ctx.fillRect(bodyX + r * 0.03, bodyYTop + r * 0.04, bodyW - r * 0.06, bodyH - r * 0.1);
      ctx.strokeStyle = '#2f6faa';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(bodyX, bodyYTop, bodyW, bodyH);

      // Lid cap.
      ctx.fillStyle = '#b8e0ff';
      ctx.beginPath();
      ctx.ellipse(x, bodyYTop + r * 0.02, r * 0.48, r * 0.085, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a9cd2';
      ctx.stroke();
      ctx.strokeStyle = '#4d90c8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.28, bodyYTop + r * 0.02);
      ctx.lineTo(x + r * 0.28, bodyYTop + r * 0.02);
      ctx.stroke();
      // Carry handle on lid.
      ctx.strokeStyle = '#2f6fa3';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.08, bodyYTop - r * 0.05);
      ctx.quadraticCurveTo(x, bodyYTop - r * 0.09, x + r * 0.08, bodyYTop - r * 0.05);
      ctx.stroke();

      // Viewing window on top.
      ctx.fillStyle = '#21425f';
      ctx.beginPath();
      ctx.ellipse(x, bodyYTop + r * 0.02, r * 0.2, r * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7fb9e6';
      ctx.beginPath();
      ctx.ellipse(x - r * 0.06, bodyYTop + r * 0.015, r * 0.055, r * 0.018, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Front panel.
      const panelX = x - r * 0.22;
      const panelY = bodyYTop + r * 0.36;
      const panelW = r * 0.44;
      const panelH = r * 0.2;
      ctx.fillStyle = '#2e5f86';
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.fillStyle = '#d8efff';
      ctx.fillRect(panelX + r * 0.03, panelY + r * 0.03, panelW - r * 0.06, r * 0.06);
      ctx.fillStyle = '#9fd2fb';
      ctx.beginPath();
      ctx.arc(panelX + r * 0.09, panelY + r * 0.14, r * 0.028, 0, Math.PI * 2);
      ctx.arc(panelX + r * 0.17, panelY + r * 0.14, r * 0.028, 0, Math.PI * 2);
      ctx.arc(panelX + r * 0.25, panelY + r * 0.14, r * 0.028, 0, Math.PI * 2);
      ctx.fill();

      // Side vents + feet.
      ctx.strokeStyle = '#5f9ece';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i += 1) {
        const vy = bodyYTop + r * (0.18 + i * 0.09);
        ctx.beginPath();
        ctx.moveTo(bodyX + r * 0.06, vy);
        ctx.lineTo(bodyX + r * 0.16, vy);
        ctx.moveTo(bodyX + bodyW - r * 0.16, vy);
        ctx.lineTo(bodyX + bodyW - r * 0.06, vy);
        ctx.stroke();
      }
      ctx.fillStyle = '#376f9f';
      ctx.fillRect(bodyX + r * 0.08, bodyYTop + bodyH, r * 0.1, r * 0.03);
      ctx.fillRect(bodyX + bodyW - r * 0.18, bodyYTop + bodyH, r * 0.1, r * 0.03);

      if (upgraded && !cacheRender) {
        // Toasts popping and warm steam.
        const popY = bodyYTop - loafPop * r * 0.14;
        ctx.fillStyle = '#e8b782';
        ctx.fillRect(x - r * 0.19, popY, r * 0.12, r * 0.08);
        ctx.fillRect(x + r * 0.07, popY + r * 0.01, r * 0.12, r * 0.08);
        ctx.strokeStyle = '#9d6432';
        ctx.strokeRect(x - r * 0.19, popY, r * 0.12, r * 0.08);
        ctx.strokeRect(x + r * 0.07, popY + r * 0.01, r * 0.12, r * 0.08);
        ctx.strokeStyle = this.withAlpha('#e9e1d1', 0.72);
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i += 1) {
          const sx = x - r * 0.15 + i * r * 0.14;
          const sway = Math.sin(t * 3 + i + (Number(minion.id) || 0) * 0.2) * r * 0.03;
          ctx.beginPath();
          ctx.moveTo(sx, bodyYTop - r * 0.01);
          ctx.quadraticCurveTo(sx + sway, bodyYTop - r * 0.14, sx + sway * 0.6, bodyYTop - r * 0.24);
          ctx.stroke();
        }
      }
    } else {
      // Countertop rice cooker silhouette: rounded pot, hinged lid, side handles, front panel.
      const cookerCx = x;
      const cookerCy = bodyY + r * 0.03;
      const cookerRx = r * 0.5;
      const cookerRy = r * 0.28;
      const lidPulse = upgraded ? Math.max(0, Math.sin(t * 6.4 + (Number(minion.id) || 0) * 0.24)) * r * 0.02 : 0;

      // Pot body.
      ctx.fillStyle = '#ffb2b2';
      ctx.beginPath();
      ctx.ellipse(cookerCx, cookerCy, cookerRx, cookerRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8f8f';
      ctx.beginPath();
      ctx.ellipse(cookerCx, cookerCy + r * 0.03, cookerRx * 0.9, cookerRy * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b34c4c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cookerCx, cookerCy, cookerRx, cookerRy, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Lid and knob.
      ctx.fillStyle = '#ffd0d0';
      ctx.beginPath();
      ctx.ellipse(cookerCx, cookerCy - r * 0.24 - lidPulse, cookerRx * 0.82, cookerRy * 0.34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d46666';
      ctx.stroke();
      ctx.fillStyle = '#8f3d3d';
      ctx.beginPath();
      ctx.ellipse(cookerCx, cookerCy - r * 0.31 - lidPulse, r * 0.06, r * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lid hinge back.
      ctx.fillStyle = '#c05d5d';
      ctx.fillRect(cookerCx - r * 0.08, cookerCy - r * 0.25 - lidPulse, r * 0.16, r * 0.03);

      // Side handles.
      ctx.fillStyle = '#8b3f3f';
      ctx.beginPath();
      ctx.ellipse(cookerCx - cookerRx * 0.96, cookerCy - r * 0.03, r * 0.055, r * 0.09, 0, 0, Math.PI * 2);
      ctx.ellipse(cookerCx + cookerRx * 0.96, cookerCy - r * 0.03, r * 0.055, r * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();

      // Front control panel with indicator.
      const pX = cookerCx - r * 0.2;
      const pY = cookerCy + r * 0.02;
      const pW = r * 0.4;
      const pH = r * 0.16;
      ctx.fillStyle = '#6f2f2f';
      ctx.fillRect(pX, pY, pW, pH);
      ctx.fillStyle = '#ffdede';
      ctx.fillRect(pX + r * 0.03, pY + r * 0.03, pW - r * 0.06, r * 0.04);
      ctx.fillStyle = upgraded ? '#57e17f' : '#d85454';
      ctx.beginPath();
      ctx.arc(cookerCx + r * 0.11, pY + r * 0.105, r * 0.022, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7baba';
      ctx.fillRect(cookerCx - r * 0.12, pY + r * 0.08, r * 0.12, r * 0.04);

      // Steam vent lines.
      ctx.strokeStyle = '#c66e6e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cookerCx + r * 0.26, cookerCy - r * 0.28 - lidPulse);
      ctx.lineTo(cookerCx + r * 0.36, cookerCy - r * 0.34 - lidPulse);
      ctx.moveTo(cookerCx + r * 0.34, cookerCy - r * 0.24 - lidPulse);
      ctx.lineTo(cookerCx + r * 0.45, cookerCy - r * 0.3 - lidPulse);
      ctx.stroke();
      // Rice paddle on side so silhouette reads like a kitchen cooker.
      ctx.strokeStyle = '#b95757';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cookerCx - cookerRx * 1.08, cookerCy - r * 0.06);
      ctx.lineTo(cookerCx - cookerRx * 1.2, cookerCy - r * 0.24);
      ctx.stroke();
      ctx.fillStyle = '#e89696';
      ctx.beginPath();
      ctx.ellipse(cookerCx - cookerRx * 1.22, cookerCy - r * 0.26, r * 0.04, r * 0.02, -0.3, 0, Math.PI * 2);
      ctx.fill();

      if (upgraded && !cacheRender) {
        // Active steam pulses + rice fluff hints.
        for (let i = 0; i < 4; i += 1) {
          const alpha = 0.24 + 0.2 * (1 - i / 4);
          const puffY = cookerCy - r * (0.32 + i * 0.1) - (Math.sin(t * 2.7 + i + (Number(minion.id) || 0) * 0.13) + 1) * r * 0.03;
          const puffX = cookerCx + r * (0.42 + Math.sin(t * 2.9 + i) * 0.03);
          ctx.fillStyle = this.withAlpha('#f1fbff', alpha);
          ctx.beginPath();
          ctx.ellipse(puffX, puffY, r * (0.06 + i * 0.015), r * (0.04 + i * 0.01), 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = this.withAlpha('#f8fdff', 0.8);
        ctx.beginPath();
        ctx.ellipse(cookerCx - r * 0.08, cookerCy - r * 0.24, r * 0.035, r * 0.025, 0.2, 0, Math.PI * 2);
        ctx.ellipse(cookerCx, cookerCy - r * 0.23, r * 0.035, r * 0.025, -0.15, 0, Math.PI * 2);
        ctx.ellipse(cookerCx + r * 0.08, cookerCy - r * 0.245, r * 0.035, r * 0.025, 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Crew sprites are optional for balloon variants.
    const crewY = bodyY - r * 0.08;
    if (!themed) {
      const leftCrewX = x - r * 0.2;
      const rightCrewX = x + r * 0.18;
      ctx.fillStyle = '#f2d8bc';
      ctx.beginPath();
      ctx.arc(leftCrewX, crewY - r * 0.1, r * 0.1, 0, Math.PI * 2);
      ctx.arc(rightCrewX, crewY - r * 0.12, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2f3948';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(leftCrewX, crewY - r * 0.01);
      ctx.lineTo(leftCrewX, crewY + r * 0.12);
      ctx.moveTo(rightCrewX, crewY - r * 0.01);
      ctx.lineTo(rightCrewX, crewY + r * 0.12);
      ctx.stroke();
      ctx.strokeStyle = '#d9e8f5';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(leftCrewX, crewY + r * 0.03);
      ctx.lineTo(leftCrewX + r * 0.24, crewY - r * 0.12 + swingA * r * 0.03);
      ctx.moveTo(rightCrewX, crewY + r * 0.03);
      ctx.lineTo(rightCrewX - r * 0.24, crewY - r * 0.14 + swingB * r * 0.03);
      ctx.stroke();

      if (Math.abs(crewAnim) > 0.64) {
        ctx.fillStyle = this.withAlpha('#ffdcb3', 0.5);
        ctx.beginPath();
        ctx.arc(x, crewY - r * 0.28, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Throw FX from the lower payload machine.
    if (allowEffects && throwLife > 0.001 && Number.isFinite(minion.balloonThrowToX) && Number.isFinite(minion.balloonThrowToY)) {
      const fromX = throwFromX;
      const fromY = throwFromY;
      const toX = Number(minion.balloonThrowToX);
      const toY = Number(minion.balloonThrowToY);
      const flight = 1 - throwLife;
      const arcLift = Math.max(22, r * 0.85);
      const midX = fromX + (toX - fromX) * 0.5;
      const midY = Math.min(fromY, toY) - arcLift;
      const px = (1 - flight) * (1 - flight) * fromX + 2 * (1 - flight) * flight * midX + flight * flight * toX;
      const py = (1 - flight) * (1 - flight) * fromY + 2 * (1 - flight) * flight * midY + flight * flight * toY;
      const throwSize = r * 0.16;
      if (!themed) {
        // Rock-style payload throw.
        const rockR = throwSize * 0.9;
        ctx.fillStyle = '#7f8895';
        ctx.beginPath();
        ctx.arc(px, py, rockR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = this.withAlpha('#adb5bf', 0.55);
        ctx.beginPath();
        ctx.arc(px - rockR * 0.24, py - rockR * 0.22, rockR * 0.46, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4c5460';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - rockR * 0.42, py - rockR * 0.04);
        ctx.lineTo(px + rockR * 0.3, py + rockR * 0.18);
        ctx.moveTo(px - rockR * 0.12, py - rockR * 0.4);
        ctx.lineTo(px + rockR * 0.22, py - rockR * 0.08);
        ctx.stroke();
      } else if (sideName === 'left') {
        // Bread chunk.
        ctx.fillStyle = '#d89a59';
        ctx.beginPath();
        ctx.ellipse(px, py, throwSize, throwSize * 0.69, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8a562b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px - throwSize * 0.31, py - throwSize * 0.14);
        ctx.lineTo(px + throwSize * 0.13, py + throwSize * 0.2);
        ctx.stroke();
      } else {
        // Rice ball.
        const riceThrowR = throwSize * 0.95;
        ctx.fillStyle = '#edf8ff';
        ctx.beginPath();
        ctx.arc(px, py, riceThrowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#213644';
        ctx.fillRect(px - riceThrowR * 0.3, py + riceThrowR * 0.26, riceThrowR * 0.6, riceThrowR * 0.34);
      }
    }

    // Bomb drop FX.
    if (allowEffects && bombLife > 0.001 && Number.isFinite(minion.balloonBombToX) && Number.isFinite(minion.balloonBombToY)) {
      const toX = Number(minion.balloonBombToX);
      const toY = Number(minion.balloonBombToY);
      const storedFromX = Number.isFinite(minion.balloonBombFromX) ? Number(minion.balloonBombFromX) : bombFromX;
      const storedFromY = Number.isFinite(minion.balloonBombFromY) ? Number(minion.balloonBombFromY) : bombFromY;
      const fromX = upgraded ? toX : storedFromX;
      const fromY = storedFromY;
      const impactHold = Math.abs(fromX - toX) < 0.01 && Math.abs(fromY - toY) < 0.01;
      const drop = 1 - bombLife;
      const impactPreview = impactHold
        ? Math.max(0, Math.min(1, Math.pow(drop, 0.9)))
        : 0;
      const impactBurst = impactHold
        ? Math.max(0, Math.min(1, Math.pow(drop, 1.15)))
        : 0;
      const px = fromX + (toX - fromX) * drop;
      const py = fromY + (toY - fromY) * drop;
      const bombScale = 5.2;
      const bombFootprintW = r * 0.23 * bombScale;
      const bombFootprintH = r * 0.164 * bombScale;
      ctx.save();
      if (impactHold) ctx.globalAlpha = 0.8 - drop * 0.44;
      if (!themed) {
        // Iron bomb payload.
        const bombR = Math.max(bombFootprintH * 0.55, bombFootprintW * 0.2);
        ctx.fillStyle = '#2f3640';
        ctx.beginPath();
        ctx.arc(px, py, bombR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6a737f';
        ctx.beginPath();
        ctx.arc(px - bombR * 0.24, py - bombR * 0.2, bombR * 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1b222b';
        ctx.lineWidth = upgraded ? 2.2 : 1.2;
        ctx.beginPath();
        ctx.arc(px, py, bombR, 0, Math.PI * 2);
        ctx.stroke();
        const fuseX = px + dir * bombR * 0.2;
        const fuseY = py - bombR * 0.9;
        ctx.strokeStyle = '#8a6a43';
        ctx.lineWidth = upgraded ? 1.9 : 1.3;
        ctx.beginPath();
        ctx.moveTo(fuseX, fuseY + bombR * 0.35);
        ctx.lineTo(fuseX + dir * bombR * 0.56, fuseY - bombR * 0.16);
        ctx.stroke();
        if (!impactHold) {
          ctx.fillStyle = this.withAlpha('#ffcb74', 0.88);
          ctx.beginPath();
          ctx.arc(fuseX + dir * bombR * 0.62, fuseY - bombR * 0.2, bombR * 0.17, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (sideName === 'left') {
        // Bread loaf bomb.
        const loafRx = bombFootprintW * 0.5;
        const loafRy = bombFootprintH * 0.5;
        ctx.fillStyle = '#bd7744';
        ctx.beginPath();
        ctx.ellipse(px, py, loafRx, loafRy, 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d99b62';
        ctx.beginPath();
        ctx.ellipse(px - loafRx * 0.08, py - loafRy * 0.18, loafRx * 0.7, loafRy * 0.5, 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7a4321';
        ctx.lineWidth = upgraded ? 2.2 : 1;
        ctx.beginPath();
        ctx.ellipse(px, py, loafRx, loafRy, 0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = this.withAlpha('#6b3d1f', 0.72);
        ctx.lineWidth = upgraded ? 1.8 : 0.9;
        for (let i = -1; i <= 1; i += 1) {
          const sx = px + i * loafRx * 0.28;
          ctx.beginPath();
          ctx.moveTo(sx - loafRx * 0.1, py - loafRy * 0.2);
          ctx.lineTo(sx + loafRx * 0.14, py + loafRy * 0.18);
          ctx.stroke();
        }
        // Crumb/seeds for readability at large size.
        ctx.fillStyle = this.withAlpha('#f6d7a3', 0.72);
        for (let i = 0; i < 6; i += 1) {
          const sx = px + (Math.random() * 0.7 - 0.35) * loafRx;
          const sy = py + (Math.random() * 0.52 - 0.28) * loafRy;
          ctx.beginPath();
          ctx.ellipse(sx, sy, loafRx * 0.045, loafRy * 0.032, Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Sticky rice-ball bomb.
        // Keep rice payload footprint aligned with bread payload size.
        const riceR = bombFootprintW / 3.26;
        ctx.fillStyle = '#f8fdff';
        ctx.beginPath();
        ctx.arc(px - riceR * 0.75, py + riceR * 0.18, riceR * 0.88, 0, Math.PI * 2);
        ctx.arc(px + riceR * 0.76, py + riceR * 0.14, riceR * 0.88, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, riceR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = this.withAlpha('#d7eaf7', 0.74);
        ctx.lineWidth = upgraded ? 2 : 1;
        ctx.beginPath();
        ctx.arc(px, py, riceR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#1f3646';
        const noriW = riceR * 1.28;
        const noriH = riceR * 0.42;
        ctx.fillRect(px - noriW * 0.5, py + riceR * 0.26, noriW, noriH);
        // Rice-grain texture.
        ctx.fillStyle = this.withAlpha('#e8f7ff', 0.82);
        for (let i = 0; i < 9; i += 1) {
          const gx = px + (Math.random() * 0.9 - 0.45) * riceR;
          const gy = py + (Math.random() * 0.74 - 0.46) * riceR;
          ctx.beginPath();
          ctx.ellipse(gx, gy, riceR * 0.11, riceR * 0.05, (i % 3) * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      // Broken impact ring instead of a full damage-circle outline.
      const impactBase = 2.08;
      const gameplayBlastRadius = Math.max(r * impactBase, Number(minion.balloonBombBlastRadius) || 0);
      // Keep gameplay damage radius unchanged. Visual blast size is capped so upgrades do not massively inflate VFX size.
      const visualBlastRadius = Math.min(
        Math.max(r * impactBase, gameplayBlastRadius * 0.34),
        r * (impactBase * 1.5)
      );
      const ringR = impactHold
        ? visualBlastRadius * (0.28 + impactPreview * 0.92)
        : r * impactBase * (0.78 + impactPreview * 0.95);
      if (impactHold) {
        const ringPieces = upgraded ? 10 : 7;
        ctx.strokeStyle = this.withAlpha(
          themed ? (sideName === 'left' ? '#ffd9a6' : '#e4f6ff') : '#ffd393',
          0.18 + impactPreview * 0.44
        );
        ctx.lineWidth = (upgraded ? 4 : 2.8) * (0.78 + impactPreview * 0.32);
        for (let i = 0; i < ringPieces; i += 1) {
          if (((i + ((Number(minion.id) || 0) % 3)) % 3) === 0) continue;
          const a0 = (Math.PI * 2 * i) / ringPieces + impactPreview * 0.42;
          const a1 = a0 + (Math.PI * 2 / ringPieces) * 0.55;
          ctx.beginPath();
          ctx.arc(toX, toY, ringR * (0.94 + (i % 2) * 0.08), a0, a1);
          ctx.stroke();
        }
      }

      if (impactBurst > 0.001) {
        const burstPieces = upgraded ? 18 : 11;
        const burstReach = visualBlastRadius * (0.22 + impactBurst * 0.52);
        const seedBase = (Number(minion.id) || 1) * 0.73;
        const hash = (n) => {
          const raw = Math.sin(n) * 43758.5453123;
          return raw - Math.floor(raw);
        };
        for (let i = 0; i < burstPieces; i += 1) {
          const a = hash(seedBase + i * 3.17) * Math.PI * 2;
          const dist = burstReach * (0.35 + hash(seedBase + i * 4.91) * 0.72);
          const bx = toX + Math.cos(a) * dist;
          const by = toY + Math.sin(a) * dist * (0.62 + hash(seedBase + i * 2.23) * 0.36);
          const chunkSize = r * (0.095 + hash(seedBase + i * 5.12) * 0.14) * (0.55 + impactBurst * 0.75);
          if (!themed) {
            const rr = chunkSize * (0.78 + hash(seedBase + i * 1.61) * 0.34);
            ctx.fillStyle = this.withAlpha('#6f7885', 0.24 + impactBurst * 0.62);
            ctx.beginPath();
            ctx.ellipse(bx, by, rr, rr * 0.76, a * 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = this.withAlpha('#2a313a', 0.2 + impactBurst * 0.45);
            ctx.lineWidth = Math.max(1, rr * 0.16);
            ctx.beginPath();
            ctx.moveTo(bx - rr * 0.44, by - rr * 0.12);
            ctx.lineTo(bx + rr * 0.4, by + rr * 0.19);
            ctx.stroke();
          } else if (sideName === 'left') {
            const rx = chunkSize;
            const ry = rx * (0.58 + hash(seedBase + i * 1.61) * 0.36);
            ctx.fillStyle = this.withAlpha('#d79b61', 0.25 + impactBurst * 0.6);
            ctx.beginPath();
            ctx.ellipse(bx, by, rx, ry, a * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = this.withAlpha('#8f562e', 0.2 + impactBurst * 0.45);
            ctx.lineWidth = Math.max(1, rx * 0.2);
            ctx.beginPath();
            ctx.moveTo(bx - rx * 0.45, by - ry * 0.2);
            ctx.lineTo(bx + rx * 0.5, by + ry * 0.24);
            ctx.stroke();
          } else {
            const rr = chunkSize * 0.88;
            ctx.fillStyle = this.withAlpha('#f3fcff', 0.24 + impactBurst * 0.62);
            ctx.beginPath();
            ctx.arc(bx, by, rr, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = this.withAlpha('#233748', 0.18 + impactBurst * 0.42);
            ctx.fillRect(bx - rr * 0.45, by + rr * 0.18, rr * 0.9, rr * 0.35);
          }
        }
      }
    }

    ctx.restore();
    if (!cacheRender) this.drawBalloonHitFlash(minion);

    this.drawFailedSpecialHat(minion, x, y, r, 1);
    if (showHud) this.drawStandardMinionHud(minion, x, y, r, 1, {});
  }

  drawNecroRevivedOverlay(minion) {
    if (!minion || !minion.necroRevived) return;
    const { ctx } = this;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const r = Math.max(10, Number(minion.r) || 12);
    const t = performance.now() * 0.001;
    const bob = Math.sin(t * 5 + (Number(minion.id) || 0) * 0.23) * 2.2;
    const coreY = y - r * 0.9 + bob;

    ctx.save();
    const aura = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.3);
    aura.addColorStop(0, '#b9ffe4aa');
    aura.addColorStop(0.55, '#91f5db52');
    aura.addColorStop(1, '#7fe6d100');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#dcfff4cc';
    ctx.beginPath();
    ctx.arc(x, coreY, r * 0.52, Math.PI, 0, false);
    ctx.lineTo(x + r * 0.5, coreY + r * 0.72);
    ctx.quadraticCurveTo(x + r * 0.2, coreY + r * 0.45, x, coreY + r * 0.72);
    ctx.quadraticCurveTo(x - r * 0.2, coreY + r * 0.45, x - r * 0.5, coreY + r * 0.72);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#173338';
    ctx.beginPath();
    ctx.arc(x - r * 0.17, coreY - r * 0.05, Math.max(1.2, r * 0.08), 0, Math.PI * 2);
    ctx.arc(x + r * 0.17, coreY - r * 0.05, Math.max(1.2, r * 0.08), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawMinionSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    if (minion.balloon) {
      this.drawBalloonSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.dragon) {
      this.drawDragonSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.digger) {
      this.drawDiggerSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.gunner) {
      this.drawGunnerSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.necrominion) {
      this.drawNecroSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.explosive) {
      this.drawBomberSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.heroCooker) {
      this.drawHeroCookerSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.hero) {
      this.drawHeroSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.monk) {
      this.drawMonkSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.shieldBearer) {
      this.drawShieldBearerSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.stoneGolem) {
      this.drawStoneGolemSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.president) {
      this.drawPresidentSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }

    const isSummoned = Boolean(minion.summoned);
    const isRider = Boolean(minion.rider);
    const riderSuperHorse = Boolean(minion.riderSuperHorse);
    const riderChargeReady = isRider && Boolean(minion.riderChargeReady);
    const riderGaitPhase = isRider && riderSuperHorse
      ? (Number.isFinite(minion.riderGaitPhase)
        ? minion.riderGaitPhase
        : (Number(minion.x) || 0) * 0.085)
      : 0;
    const riderGaitCycle = Math.PI * 2;
    const riderGaitWrapped = ((riderGaitPhase % riderGaitCycle) + riderGaitCycle) % riderGaitCycle;
    const riderGaitBucket = isRider && riderSuperHorse
      ? Math.max(0, Math.min(11, Math.round((riderGaitWrapped / riderGaitCycle) * 11)))
      : 0;
    if (isRider && this.drawThemedSpecialSprite(minion, 'rider', options)) {
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    const t = Math.max(0, Math.min(3, minion.tier || 0));
    const stage = Math.max(0, Math.min(5, Math.floor((minion.level || 0) / 4)));
    const scale = (minion.super ? 2 : 1) * (isRider && riderSuperHorse ? 1.22 : 1);
    const visualDamageTier = this.militiaUpgradeVisualTier(minion, stage, t);
    const bodyR = 12 + t + Math.min(2, stage * 0.35);
    const foodUtensilAnimating = !cacheRender
      && this.isMilitiaFoodMinion(minion)
      && this.militiaFoodFx.has(Number(minion.id));
    if (!cacheRender) {
      if (!foodUtensilAnimating) {
        const sideName = minion.side === 'right' ? 'right' : 'left';
        const cacheKey = [
          'minion',
          'v5',
          sideName,
          t,
          stage,
          visualDamageTier,
          minion.super ? 1 : 0,
          isSummoned ? 1 : 0,
          isRider ? 1 : 0,
          riderSuperHorse ? 1 : 0,
          riderGaitBucket,
          minion.riderChargeReady ? 1 : 0,
        ].join(':');
        const widthBase = isRider ? 188 : 128;
        const heightBase = isRider ? 148 : 126;
        const cacheWidth = Math.ceil(widthBase * Math.max(1, scale * 0.8));
        const cacheHeight = Math.ceil(heightBase * Math.max(1, scale * 0.8));
        const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
          const proxy = {
            ...minion,
            x: w / 2,
            y: h / 2,
            tier: t,
            level: stage * 4,
            upgradeVisualTier: visualDamageTier,
            riderGaitPhase: (riderGaitBucket / 11) * riderGaitCycle,
          };
          this.drawMinionSprite(proxy, { showHud: false, cacheRender: true });
        });
        if (drewCached) {
          if (isRider) this.drawEmpireStyleAccent(minion, { cacheRender });
          if (isRider) {
            this.drawThemedSpecialLook(minion, 'rider', { cacheRender, upgraded: riderSuperHorse || minion.super });
          }
          this.drawFailedSpecialHat(minion, minion.x, minion.y, bodyR, scale);
          if (showHud) this.drawStandardMinionHud(minion, minion.x, minion.y, bodyR, scale, { isRider });
          if (!cacheRender) this.drawNecroRevivedOverlay(minion);
          return;
        }
      }
    }

    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const armor = ['#5e748f', '#8b9ab2', '#d9b45f', '#b8e2ff'][t];
    const weaponLen = 8 + stage * 2.2;
    const plateW = 16 + stage * 2;
    const plateH = 7 + Math.floor(stage * 0.8);
    const dir = minion.side === 'left' ? 1 : -1;
    const themedEmpires = this.isThemedEmpires();

    ctx.fillStyle = '#00000022';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR * scale + 4, bodyR * scale, (4 + t) * scale * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (minion.super) {
      ctx.strokeStyle = '#ffe49a88';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, bodyR * scale + 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (isRider) {
      const horseBody = bodyR * 1.28;
      const horseY = bodyR * 0.78;
      const chargeGlow = Boolean(minion.riderChargeReady);
      const chargePulse = chargeGlow
        ? (0.5 + 0.5 * Math.sin(performance.now() * 0.018 + (Number(minion.id) || 0) * 0.71))
        : 0;
      const legSwing = riderSuperHorse ? Math.sin(riderGaitPhase) * (bodyR * 0.3) : 0;
      const neckX = dir * horseBody * 0.74;
      const neckY = horseY - bodyR * 0.32;
      const headX = dir * horseBody * 1.06;
      const headY = horseY - bodyR * 0.38;

      // Horse body
      ctx.fillStyle = '#5f3d27';
      ctx.beginPath();
      ctx.ellipse(0, horseY, horseBody, bodyR * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();

      // Horse neck + head
      ctx.fillStyle = '#65432b';
      ctx.beginPath();
      ctx.ellipse(neckX, neckY, bodyR * 0.42, bodyR * 0.26, -dir * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6f4a2f';
      ctx.beginPath();
      ctx.ellipse(headX, headY, bodyR * 0.46, bodyR * 0.34, -dir * 0.24, 0, Math.PI * 2);
      ctx.fill();

      // Ear
      ctx.fillStyle = '#805739';
      ctx.beginPath();
      ctx.moveTo(headX + dir * 1.5, headY - bodyR * 0.36);
      ctx.lineTo(headX + dir * 6.5, headY - bodyR * 0.64);
      ctx.lineTo(headX + dir * 4.6, headY - bodyR * 0.22);
      ctx.closePath();
      ctx.fill();

      // Mane + tail
      ctx.strokeStyle = '#3a2316';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(neckX - dir * 2, neckY - bodyR * 0.16);
      ctx.quadraticCurveTo(neckX - dir * 8, neckY - bodyR * 0.4, neckX - dir * 12, neckY - bodyR * 0.52);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-dir * (horseBody - 4), horseY - bodyR * 0.18);
      ctx.quadraticCurveTo(-dir * (horseBody + 10), horseY + 2, -dir * (horseBody + 8), horseY + bodyR * 0.48);
      ctx.stroke();

      // Saddle
      ctx.fillStyle = '#2d3d5f';
      ctx.fillRect(-bodyR * 0.44, horseY - bodyR * 0.62, bodyR * 0.88, bodyR * 0.3);
      ctx.strokeStyle = '#aec9f1';
      ctx.lineWidth = 1.1;
      ctx.strokeRect(-bodyR * 0.44, horseY - bodyR * 0.62, bodyR * 0.88, bodyR * 0.3);

      // Reins
      ctx.strokeStyle = '#d9d1bc';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(dir * 3, -2);
      ctx.lineTo(headX - dir * 3, headY - 1);
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#101217';
      ctx.beginPath();
      ctx.arc(headX + dir * 2.5, headY - 1, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.strokeStyle = '#2f1f14';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(-horseBody * 0.66, horseY + bodyR * 0.14);
      ctx.lineTo(-horseBody * 0.7 + legSwing * 0.46, horseY + bodyR * 1.03);
      ctx.moveTo(-horseBody * 0.2, horseY + bodyR * 0.17);
      ctx.lineTo(-horseBody * 0.18 - legSwing * 0.38, horseY + bodyR * 1.08);
      ctx.moveTo(horseBody * 0.25, horseY + bodyR * 0.13);
      ctx.lineTo(horseBody * 0.28 - legSwing * 0.42, horseY + bodyR * 1.02);
      ctx.moveTo(horseBody * 0.68, horseY + bodyR * 0.08);
      ctx.lineTo(horseBody * 0.72 + legSwing * 0.34, horseY + bodyR * 0.92);
      ctx.stroke();
      if (chargeGlow) {
        ctx.save();
        ctx.globalAlpha = 0.78 + chargePulse * 0.18;
        ctx.strokeStyle = '#fff2c7';
        ctx.lineWidth = 1.7;
        const shellPhase = performance.now() * 0.019 + (Number(minion.id) || 0) * 0.39;
        for (let band = 0; band < 3; band += 1) {
          const rx = horseBody * (0.94 + band * 0.12 + chargePulse * 0.06);
          const ry = bodyR * (0.66 + band * 0.1 + chargePulse * 0.05);
          for (let seg = 0; seg < 4; seg += 1) {
            const start = shellPhase + seg * (Math.PI * 0.5) + band * 0.24;
            const end = start + 0.52 + chargePulse * 0.12;
            ctx.beginPath();
            ctx.ellipse(0, horseY, rx, ry, 0, start, end);
            ctx.stroke();
          }
        }
        ctx.strokeStyle = '#fff8e5';
        ctx.lineWidth = 2.1;
        const markerY = horseY - bodyR * 1.34;
        for (let i = 0; i < 2; i += 1) {
          const markerX = headX + dir * (bodyR * (0.46 + i * 0.45));
          const markerSize = bodyR * (0.2 + i * 0.03);
          ctx.beginPath();
          ctx.moveTo(markerX - dir * markerSize, markerY - markerSize * 0.75);
          ctx.lineTo(markerX, markerY);
          ctx.lineTo(markerX - dir * markerSize, markerY + markerSize * 0.75);
          ctx.stroke();
        }
        ctx.strokeStyle = '#ffd48f';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 2; i += 1) {
          const startX = headX + dir * bodyR * (0.34 + i * 0.3);
          const startY = headY + (i === 0 ? -bodyR * 0.34 : bodyR * 0.26);
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + dir * bodyR * (0.42 + chargePulse * 0.2), startY + (i === 0 ? -0.4 : 0.4));
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    if (stage >= 2) {
      ctx.strokeStyle = '#ffffff20';
      ctx.lineWidth = 2 + stage * 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, bodyR + 3 + stage, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (themedEmpires && visualDamageTier > 0) {
      // Face + robe details to make basic troops less plain.
      const skin = minion.side === 'left' ? '#e8c9a1' : '#efd8b1';
      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.arc(0, -bodyR * 0.28, Math.max(2.4, bodyR * 0.24), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a212f';
      ctx.beginPath();
      ctx.arc(-bodyR * 0.08, -bodyR * 0.3, 0.8, 0, Math.PI * 2);
      ctx.arc(bodyR * 0.08, -bodyR * 0.3, 0.8, 0, Math.PI * 2);
      ctx.fill();
      if (minion.side === 'left') {
        ctx.strokeStyle = '#f2cf98';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-bodyR * 0.3, bodyR * 0.18);
        ctx.lineTo(bodyR * 0.3, bodyR * 0.18);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#def2ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-bodyR * 0.32, -bodyR * 0.06);
        ctx.lineTo(bodyR * 0.32, -bodyR * 0.06);
        ctx.stroke();
      }
    }

    if (isSummoned) {
      ctx.strokeStyle = '#88ffc680';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, bodyR - 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = armor;
    ctx.fillRect(-plateW / 2, -10 - t - stage * 0.2, plateW, plateH);
    if (themedEmpires && !isRider) this.drawThemedMilitiaUpgradeGear(minion, bodyR, stage, t);

    if (!themedEmpires && (t >= 1 || stage >= 1)) {
      ctx.fillStyle = '#e8edf7';
      ctx.fillRect(-2, -16 - t - stage * 0.4, 4, 6 + Math.min(4, stage));
    }
    if (t >= 2 || stage >= 2) {
      ctx.strokeStyle = '#c9d4e6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-(10 + stage * 1.5), 1);
      ctx.lineTo(10 + stage * 1.5, 1);
      ctx.stroke();
    }
    if (!themedEmpires && (t >= 3 || stage >= 4 || minion.super)) {
      ctx.fillStyle = '#fff7c0';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(4, -15);
      ctx.lineTo(-4, -15);
      ctx.closePath();
      ctx.fill();
    }

    const handX = dir * (isRider ? (bodyR - 3.6) : (bodyR - 1));
    const handY = isRider ? 1.4 : 2;

    if (!minion.explosive) {
      if (isRider) {
        if (riderChargeReady) {
          const lanceLen = weaponLen + 8.2 + (riderSuperHorse ? 2.2 : 0);
          const lanceTipX = handX + dir * lanceLen;
          const lanceTipY = handY - 4.3;
          ctx.strokeStyle = '#ffe4a7';
          ctx.lineWidth = minion.super ? 3.9 : 2.9;
          ctx.beginPath();
          ctx.moveTo(handX, handY - 1);
          ctx.lineTo(lanceTipX, lanceTipY);
          ctx.stroke();
          ctx.strokeStyle = '#f6fbff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(lanceTipX - dir * 1.7, lanceTipY - 1.7);
          ctx.lineTo(lanceTipX + dir * 3.8, lanceTipY);
          ctx.lineTo(lanceTipX - dir * 1.7, lanceTipY + 1.7);
          ctx.stroke();
        } else if (minion.side === 'left') {
          // West follow-up: short wagging melee profile.
          const wag = riderSuperHorse ? Math.sin(riderGaitPhase * 1.5) * 2.1 : 0.7;
          const swingLen = weaponLen + 5.4;
          ctx.strokeStyle = '#d4dde8';
          ctx.lineWidth = minion.super ? 3.6 : 2.7;
          ctx.beginPath();
          ctx.moveTo(handX, handY - 1);
          ctx.quadraticCurveTo(
            handX + dir * (swingLen * 0.55),
            handY - 4.6 - wag * 0.35,
            handX + dir * swingLen,
            handY - 4 + wag * 0.48
          );
          ctx.stroke();
          ctx.fillStyle = '#f0e2c7';
          ctx.beginPath();
          ctx.arc(handX + dir * (swingLen + 1), handY - 3.9 + wag * 0.48, minion.super ? 2.2 : 1.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // East follow-up: short-range arrow shooting profile (visual only).
          const bowBaseX = handX + dir * 0.9;
          const bowBaseY = handY - 2.8;
          const bowTopX = bowBaseX + dir * 2;
          const bowTopY = bowBaseY - 3.8;
          const bowBotX = bowBaseX + dir * 1.9;
          const bowBotY = bowBaseY + 1.2;
          const bowCurveX = bowBaseX + dir * 4;
          const bowCurveY = bowBaseY - 1.4;
          const stringOffsetX = -dir * 0.5;
          const arrowLen = weaponLen + 3.4 + (riderSuperHorse ? 1.2 : 0);
          const arrowStartX = bowBaseX + dir * 0.2;
          const arrowStartY = bowBaseY - 0.8;
          const arrowEndX = bowBaseX + dir * arrowLen;
          const arrowEndY = bowBaseY - 2.8;
          ctx.strokeStyle = '#f3d8e2';
          ctx.lineWidth = 1.9;
          ctx.beginPath();
          ctx.moveTo(bowTopX, bowTopY);
          ctx.quadraticCurveTo(bowCurveX, bowCurveY, bowBotX, bowBotY);
          ctx.stroke();
          ctx.strokeStyle = '#d1b8c2';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bowTopX + stringOffsetX, bowTopY + 0.2);
          ctx.lineTo(bowBotX + stringOffsetX, bowBotY - 0.2);
          ctx.stroke();
          ctx.strokeStyle = '#e8edf5';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(arrowStartX, arrowStartY);
          ctx.lineTo(arrowEndX, arrowEndY);
          ctx.stroke();
          ctx.strokeStyle = '#f8f7f2';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(arrowEndX - dir * 1.7, arrowEndY - 1.1);
          ctx.lineTo(arrowEndX + dir * 1, arrowEndY);
          ctx.lineTo(arrowEndX - dir * 1.7, arrowEndY + 1.1);
          ctx.stroke();
        }
      } else {
        if (themedEmpires && minion.side === 'left') {
          const offHandX = -dir * (bodyR - 2.4);
          const offHandY = handY + 0.9;
          const loafCx = -dir * (bodyR * 1.03);
          const loafCy = offHandY + 0.55;
          const loafLen = Math.max(10.5, bodyR * (minion.super ? 1.3 : 1.2));
          const loafH = Math.max(5.8, bodyR * (minion.super ? 0.66 : 0.58));
          const loafR = loafH * 0.46;
          const knifeLen = Math.max(12, weaponLen + (minion.super ? 2.4 : 1.6));
          const knifeTilt = -0.08 * dir;
          const knifeBaseX = handX - dir * 0.5;
          const knifeBaseY = handY + 0.1;
          const handleLen = Math.max(4.4, bodyR * 0.36);

          // Bread loaf in the off-hand.
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#9a6732';
          ctx.lineWidth = 1.15;
          ctx.beginPath();
          ctx.moveTo(offHandX, offHandY);
          ctx.lineTo(loafCx + dir * (loafLen * 0.34), loafCy + 0.1);
          ctx.stroke();
          ctx.save();
          ctx.translate(loafCx, loafCy);
          ctx.rotate(-0.08 * dir);
          ctx.fillStyle = '#ca8c49';
          ctx.beginPath();
          ctx.moveTo(-loafLen * 0.5 + loafR, -loafH * 0.5);
          ctx.lineTo(loafLen * 0.5 - loafR, -loafH * 0.5);
          ctx.quadraticCurveTo(loafLen * 0.5, -loafH * 0.5, loafLen * 0.5, -loafH * 0.5 + loafR);
          ctx.lineTo(loafLen * 0.5, loafH * 0.5 - loafR);
          ctx.quadraticCurveTo(loafLen * 0.5, loafH * 0.5, loafLen * 0.5 - loafR, loafH * 0.5);
          ctx.lineTo(-loafLen * 0.5 + loafR, loafH * 0.5);
          ctx.quadraticCurveTo(-loafLen * 0.5, loafH * 0.5, -loafLen * 0.5, loafH * 0.5 - loafR);
          ctx.lineTo(-loafLen * 0.5, -loafH * 0.5 + loafR);
          ctx.quadraticCurveTo(-loafLen * 0.5, -loafH * 0.5, -loafLen * 0.5 + loafR, -loafH * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#9a6732';
          ctx.lineWidth = 0.9;
          ctx.stroke();
          ctx.strokeStyle = '#f1d4a7';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          for (let i = 0; i < 3; i += 1) {
            const cutX = (i - 1) * loafLen * 0.24;
            ctx.moveTo(cutX - dir * 0.4, -loafH * 0.25);
            ctx.lineTo(cutX + dir * 0.66, -loafH * 0.03);
          }
          ctx.stroke();
          ctx.restore();

          if (!foodUtensilAnimating) {
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#7b4f2a';
            ctx.lineWidth = minion.super ? 2.4 : 2.1;
            ctx.beginPath();
            ctx.moveTo(knifeBaseX - dir * handleLen, knifeBaseY + 0.2);
            ctx.lineTo(knifeBaseX, knifeBaseY);
            ctx.stroke();

            ctx.save();
            ctx.translate(knifeBaseX, knifeBaseY);
            ctx.rotate(knifeTilt);

            // Butter knife blade.
            ctx.fillStyle = '#c7ccd3';
            ctx.beginPath();
            ctx.moveTo(0, -1.3);
            ctx.lineTo(dir * (knifeLen - 2.3), -2.1);
            ctx.quadraticCurveTo(dir * knifeLen, -1.8, dir * knifeLen, -0.8);
            ctx.lineTo(dir * knifeLen, 1);
            ctx.quadraticCurveTo(dir * knifeLen, 2, dir * (knifeLen - 2.2), 2.2);
            ctx.lineTo(0, 1.5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#8b9199';
            ctx.lineWidth = 0.9;
            ctx.stroke();

            // Butter dab near the front of the blade.
            ctx.fillStyle = '#f7df7f';
            ctx.beginPath();
            ctx.ellipse(dir * (knifeLen * 0.72), -0.35, 2.4, 1.2, 0.22 * dir, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff2b4';
            ctx.beginPath();
            ctx.ellipse(dir * (knifeLen * 0.75), -0.62, 1.1, 0.5, 0.2 * dir, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.lineCap = 'butt';
          }
        } else if (themedEmpires && minion.side === 'right') {
          const stickLen = weaponLen + 7.2;
          const stickTail = Math.max(3, bodyR * 0.28);
          const spread = minion.super ? 2.1 : 1.7;
          const potX = -dir * (bodyR * 1.03);
          const potY = handY + bodyR * 0.42;
          const offHandX = -dir * (bodyR - 2.2);
          const offHandY = handY + 0.9;
          if (!foodUtensilAnimating) {
            ctx.strokeStyle = '#f1e2c4';
            ctx.lineWidth = minion.super ? 2.5 : 1.9;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(handX - dir * stickTail, handY - spread * 0.5);
            ctx.lineTo(handX + dir * stickLen, handY - 2.8 - spread * 0.6);
            ctx.moveTo(handX - dir * stickTail, handY + spread * 0.5);
            ctx.lineTo(handX + dir * stickLen, handY - 1.2 + spread * 0.6);
            ctx.stroke();
          }
          // Off-hand rice pot on the opposite side.
          ctx.strokeStyle = '#9eb1bf';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(offHandX, offHandY);
          ctx.lineTo(potX - dir * 1.1, potY - 0.9);
          ctx.stroke();
          ctx.fillStyle = '#c8d7e2';
          ctx.beginPath();
          ctx.arc(potX, potY, 4.2, Math.PI, 0, false);
          ctx.lineTo(potX + 4.2, potY + 2.1);
          ctx.lineTo(potX - 4.2, potY + 2.1);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#8798a8';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.arc(potX, potY, 4.2, Math.PI, 0, false);
          ctx.stroke();
          ctx.fillStyle = '#f8fcff';
          ctx.beginPath();
          ctx.ellipse(potX - dir * 1.05, potY - 1.05, 1.4, 0.82, 0.18, 0, Math.PI * 2);
          ctx.ellipse(potX + dir * 0.28, potY - 1.28, 1.28, 0.78, -0.15, 0, Math.PI * 2);
          ctx.fill();
          if (!foodUtensilAnimating) ctx.lineCap = 'butt';
        } else {
          ctx.strokeStyle = '#d4dde8';
          ctx.lineWidth = minion.super ? 3.6 : 2.5;
          ctx.beginPath();
          ctx.moveTo(handX, handY);
          ctx.lineTo(handX + dir * weaponLen, handY - 2);
          ctx.stroke();

          if (stage >= 3 || minion.super) {
            ctx.strokeStyle = '#f3f7ff';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(handX + dir * (weaponLen - 1), handY - 4);
            ctx.lineTo(handX + dir * (weaponLen + 4), handY - 2);
            ctx.lineTo(handX + dir * (weaponLen - 1), handY);
            ctx.stroke();
          }
        }
      }
    }

    if (minion.explosive) {
      const bombX = handX + dir * 8;
      const bombY = handY - 3;
      const bombR = minion.super ? 11 : 8.5;
      ctx.fillStyle = '#161a23';
      ctx.beginPath();
      ctx.arc(bombX, bombY, bombR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#77839a';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.arc(bombX, bombY, bombR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#f8d27a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bombX + dir * 2, bombY - bombR + 1);
      ctx.lineTo(bombX + dir * 6, bombY - bombR - 4);
      ctx.stroke();

      ctx.fillStyle = '#ffd97a';
      ctx.beginPath();
      ctx.arc(bombX + dir * 7.5, bombY - bombR - 5.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ff7f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bombX + dir * 10.2, bombY - bombR - 5.5);
      ctx.lineTo(bombX + dir * 13, bombY - bombR - 7.3);
      ctx.stroke();

      ctx.fillStyle = '#ffd05e';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('B', bombX, bombY + 3);
    }

    ctx.restore();
    if (isRider) this.drawEmpireStyleAccent(minion, { cacheRender });
    if (isRider) {
      this.drawThemedSpecialLook(minion, 'rider', { cacheRender, upgraded: riderSuperHorse || minion.super });
    }
    // Keep failed-special hats out of cached sprite atlases; draw only in live render passes.
    if (!cacheRender) this.drawFailedSpecialHat(minion, x, y, bodyR, scale);
    if (showHud) this.drawStandardMinionHud(minion, x, y, bodyR, scale, { isRider });
    if (!cacheRender) this.drawNecroRevivedOverlay(minion);
  }

  drawDiggerSprite(minion, options = {}) {
    if (this.drawThemedSpecialSprite(minion, 'digger', options)) return;
    const showHud = options.showHud !== false;
    const allowEffects = options.allowEffects !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const r = Math.max(11, minion.r || 12);
    const dir = sideName === 'left' ? 1 : -1;
    const goldFinder = Boolean(minion.diggerGoldFinder);
    const phase = Number.isFinite(minion.digPhase) ? minion.digPhase : 0;
    const shovelSwing = Math.sin(phase * 3.1);
    const handY = -r * 0.14 + Math.cos(phase * 2.6) * 2.3;
    const digBob = Math.sin(phase * 1.9) * 2.1;
    const topY = y + digBob;
    if (!cacheRender) {
      const phaseCycle = Math.PI * 2;
      const wrappedPhase = ((phase % phaseCycle) + phaseCycle) % phaseCycle;
      const phaseBuckets = 10;
      const phaseBucket = Math.max(0, Math.min(phaseBuckets - 1, Math.round((wrappedPhase / phaseCycle) * (phaseBuckets - 1))));
      const radiusBucket = Math.max(11, Math.min(18, Math.round(r)));
      const cacheKey = `digger:${sideName}:${radiusBucket}:${phaseBucket}:${goldFinder ? 1 : 0}`;
      const cacheWidth = Math.ceil(radiusBucket * 5.2 + 42);
      const cacheHeight = Math.ceil(radiusBucket * 4.4 + 42);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          r: radiusBucket,
          digPhase: (phaseBucket / Math.max(1, phaseBuckets - 1)) * phaseCycle,
        };
        this.drawDiggerSprite(proxy, { showHud: false, allowEffects: false, cacheRender: true });
      });
      if (drewCached) {
        this.drawThemedSpecialLook(minion, 'digger', { cacheRender, upgraded: goldFinder });
        if (allowEffects) this.emitDiggerDirt(minion, minion.x, topY, dir, phase, shovelSwing);
        if (showHud) {
          ctx.fillStyle = '#e3d0ab';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DIGGER', minion.x, topY - r - 14);

          const hpPct = Math.max(0, minion.hp / minion.maxHp);
          const hpW = 28;
          const hpX = minion.x - hpW / 2;
          const hpY = topY - r - 9;
          ctx.fillStyle = '#101420cc';
          ctx.fillRect(hpX, hpY, hpW, 4);
          ctx.fillStyle = '#6bff95';
          ctx.fillRect(hpX, hpY, hpW * hpPct, 4);
          this.drawHealthBarNotches(hpX, hpY, hpW, 4, minion.maxHp);
        }
        return;
      }
    }

    ctx.fillStyle = '#00000020';
    ctx.beginPath();
    ctx.ellipse(x, y + r + 8, r * 1.15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dirt mound the digger sits in.
    ctx.fillStyle = '#5c4a35';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.82, r * 1.42, r * 0.76, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#776049';
    ctx.beginPath();
    ctx.ellipse(x - dir * 4, y + r * 0.72, r * 0.82, r * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper body above dirt.
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(x, topY - r * 0.08, r * 0.74, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.dark;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Helmet.
    ctx.fillStyle = '#8ea1b7';
    ctx.beginPath();
    ctx.arc(x, topY - r * 0.42, r * 0.48, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4f6176';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Face + eyes.
    ctx.fillStyle = '#f0dcc2';
    ctx.beginPath();
    ctx.arc(x, topY - r * 0.18, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a2233';
    ctx.beginPath();
    ctx.arc(x - dir * 2, topY - r * 0.2, 1.05, 0, Math.PI * 2);
    ctx.arc(x + dir * 2, topY - r * 0.2, 1.05, 0, Math.PI * 2);
    ctx.fill();

    if (goldFinder) {
      const lampX = x + dir * (r * 0.28);
      const lampY = topY - r * 0.44;
      const beamLen = r * 2.05;
      const beamHalf = r * 0.62;
      const beam = ctx.createLinearGradient(lampX, lampY, lampX + dir * beamLen, lampY + beamHalf * 0.2);
      beam.addColorStop(0, '#ffeaa899');
      beam.addColorStop(0.55, '#ffeaa833');
      beam.addColorStop(1, '#ffeaa800');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(lampX, lampY - 1.5);
      ctx.lineTo(lampX + dir * beamLen, lampY - beamHalf);
      ctx.lineTo(lampX + dir * beamLen, lampY + beamHalf);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f7bf47';
      ctx.beginPath();
      ctx.arc(lampX, lampY, 1.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff4c4';
      ctx.beginPath();
      ctx.arc(lampX + dir * 0.6, lampY, 1.05, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slow shovel animation.
    ctx.save();
    ctx.translate(x + dir * (r * 0.24), topY + handY);
    ctx.rotate(dir * (0.22 + shovelSwing * 0.46));
    ctx.strokeStyle = '#c9b18f';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * (r * 1.1), -r * 0.86);
    ctx.stroke();
    ctx.fillStyle = '#9fb3cc';
    ctx.beginPath();
    ctx.moveTo(dir * (r * 1.06), -r * 0.98);
    ctx.lineTo(dir * (r * 1.52), -r * 0.7);
    ctx.lineTo(dir * (r * 1.02), -r * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Dirt flick while shoveling.
    const dirtX = x + dir * (r * 1.3);
    const dirtY = topY + r * 0.24 - shovelSwing * 4.2;
    ctx.fillStyle = '#8f7558';
    ctx.beginPath();
    ctx.arc(dirtX, dirtY, 2.3, 0, Math.PI * 2);
    ctx.arc(dirtX + dir * 3.4, dirtY - 1.6, 1.8, 0, Math.PI * 2);
    ctx.arc(dirtX + dir * 6.4, dirtY - 2.6, 1.4, 0, Math.PI * 2);
    ctx.fill();
    if (allowEffects) this.emitDiggerDirt(minion, x, topY, dir, phase, shovelSwing);
    this.drawThemedSpecialLook(minion, 'digger', { cacheRender, upgraded: goldFinder });

    if (showHud) {
      ctx.fillStyle = '#e3d0ab';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(goldFinder ? 'GOLD FINDER' : 'DIGGER', x, topY - r - 14);

      const hpPct = Math.max(0, minion.hp / minion.maxHp);
      const hpW = 28;
      const hpX = x - hpW / 2;
      const hpY = topY - r - 9;
      ctx.fillStyle = '#101420cc';
      ctx.fillRect(hpX, hpY, hpW, 4);
      ctx.fillStyle = '#6bff95';
      ctx.fillRect(hpX, hpY, hpW * hpPct, 4);
      this.drawHealthBarNotches(hpX, hpY, hpW, 4, minion.maxHp);
    }
  }

  dragonHeartCore(minion) {
    const baseR = Math.max(14, Number(minion?.r) || 14);
    const dir = minion.side === 'left' ? 1 : -1;
    return {
      x: minion.x + dir * (baseR * 0.22),
      y: minion.y + baseR * 0.02,
      r: Math.max(6.5, baseR * 0.26),
    };
  }

  drawDragonHeartMarker(x, y, r, options = {}) {
    const { ctx } = this;
    const sideName = options.side === 'right' ? 'right' : 'left';
    const attackLife = Math.max(0, Math.min(1, Number(options.attackLife) || 0));
    const seed = Number(options.seed) || 0;
    const pulseT = performance.now() * 0.006 + seed * 0.09;
    const pulse = 0.5 + Math.sin(pulseT) * 0.5;
    const heartR = Math.max(4.5, r * (0.9 + pulse * 0.16 + attackLife * 0.14));
    const cx = Number(x) || 0;
    const cy = (Number(y) || 0) + Math.sin(pulseT * 0.8) * heartR * 0.08;
    const glow = sideName === 'right' ? '#ff9eb4' : '#9bd8ff';
    const fillA = sideName === 'right' ? '#ff6a87' : '#ff6a4f';
    const fillB = sideName === 'right' ? '#ff2f5d' : '#ff3127';
    const centerColor = sideName === 'right' ? '#ffd5e2' : '#ffe4cc';

    ctx.save();
    ctx.globalAlpha = 0.42 + attackLife * 0.3;
    const aura = ctx.createRadialGradient(cx, cy, 1, cx, cy, heartR * 2.4);
    aura.addColorStop(0, '#fff7ea');
    aura.addColorStop(0.34, glow);
    aura.addColorStop(1, this.withAlpha(glow, 0));
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, heartR * 2.4, 0, Math.PI * 2);
    ctx.fill();

    const heartGrad = ctx.createLinearGradient(cx, cy - heartR * 1.1, cx, cy + heartR * 1.2);
    heartGrad.addColorStop(0, '#ffd8c8');
    heartGrad.addColorStop(0.42, fillA);
    heartGrad.addColorStop(1, fillB);
    ctx.globalAlpha = 0.86;
    ctx.fillStyle = heartGrad;
    ctx.beginPath();
    ctx.moveTo(cx, cy + heartR * 0.95);
    ctx.bezierCurveTo(
      cx + heartR * 1.2, cy + heartR * 0.24,
      cx + heartR * 1.02, cy - heartR * 0.74,
      cx, cy - heartR * 0.24
    );
    ctx.bezierCurveTo(
      cx - heartR * 1.02, cy - heartR * 0.74,
      cx - heartR * 1.2, cy + heartR * 0.24,
      cx, cy + heartR * 0.95
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffe7cb';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = centerColor;
    ctx.beginPath();
    ctx.arc(cx, cy + heartR * 0.06, heartR * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffb9a0';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    const reticleR = heartR * 1.48 + attackLife * 1.6;
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = '#ffeed5';
    ctx.lineWidth = 1.1;
    ctx.setLineDash([3.2, 2.2]);
    ctx.beginPath();
    ctx.arc(cx, cy, reticleR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx - reticleR - 3.4, cy);
    ctx.lineTo(cx - reticleR + 1.2, cy);
    ctx.moveTo(cx + reticleR - 1.2, cy);
    ctx.lineTo(cx + reticleR + 3.4, cy);
    ctx.moveTo(cx, cy - reticleR - 3.4);
    ctx.lineTo(cx, cy - reticleR + 1.2);
    ctx.moveTo(cx, cy + reticleR - 1.2);
    ctx.lineTo(cx, cy + reticleR + 3.4);
    ctx.stroke();
    ctx.restore();
  }

  drawDragonSprite(minion, options = {}) {
    if (this.drawThemedSpecialSprite(minion, 'dragon', options)) return;
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.dragonSuperBreathUpgraded);
    const dir = sideName === 'left' ? 1 : -1;
    const x = minion.x;
    const y = minion.y;
    const baseR = Math.max(14, Number(minion.r) || 14);
    const scale = minion.super ? 1.22 : 1;
    const bodyW = baseR * 1.48 * scale;
    const bodyH = baseR * 0.86 * scale;
    const wingSpan = baseR * 2.78 * scale;
    const phase = Number.isFinite(minion.flyPhase) ? minion.flyPhase : (performance.now() * 0.004);
    const wingFlap = Math.sin(phase * 2.35);
    const wingSweep = Math.cos(phase * 1.22);
    const breathLife = Math.max(0, Math.min(1, (Number(minion.dragonBreathTtl) || 0) / 0.24));
    const superBreathLife = Math.max(0, Math.min(1, (Number(minion.dragonSuperBreathTtl) || 0) / 1.8));
    const attackLife = Math.max(breathLife, superBreathLife * 0.95);
    const mouthOpen = 0.14 + attackLife * 0.68;
    const mouthX = x + dir * (bodyW * 0.84);
    const mouthY = y - bodyH * 0.2;

    const drawDragonLabel = () => {
      if (!showHud) return;
      ctx.fillStyle = '#ffc78d';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DRAGON', x, y - bodyH - 18);
    };

    const drawDragonBreath = () => {
      const flameLife = Math.max(breathLife, superBreathLife);
      if (flameLife <= 0.001) return;
      const toX = Number.isFinite(minion.dragonBreathToX) ? minion.dragonBreathToX : mouthX + dir * 120;
      const toY = Number.isFinite(minion.dragonBreathToY) ? minion.dragonBreathToY : mouthY + 10;

      ctx.save();
      ctx.globalAlpha = 0.32 + flameLife * 0.6;
      const flameGradient = ctx.createLinearGradient(mouthX, mouthY, toX, toY);
      flameGradient.addColorStop(0, '#fff1b2');
      flameGradient.addColorStop(0.35, '#ffb648');
      flameGradient.addColorStop(0.75, '#ff7a33');
      flameGradient.addColorStop(1, '#ff4c2c');
      ctx.strokeStyle = flameGradient;
      ctx.lineWidth = 6 + flameLife * 11;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY);
      ctx.quadraticCurveTo(
        (mouthX + toX) * 0.5 + Math.sin(phase * 5.4) * (8 + flameLife * 6),
        (mouthY + toY) * 0.5 - (8 + flameLife * 5),
        toX,
        toY
      );
      ctx.stroke();

      ctx.globalAlpha = 0.5 + flameLife * 0.4;
      ctx.fillStyle = '#ffe7a0';
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 3.6 + flameLife * 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDragonHpBar = () => {
      if (!showHud) return;
      const hpPct = Math.max(0, minion.hp / minion.maxHp);
      const hpW = 48 * scale;
      const hpX = x - hpW / 2;
      const hpY = y - (bodyH + 12);
      ctx.fillStyle = '#101420cc';
      ctx.fillRect(hpX, hpY, hpW, 6);
      ctx.fillStyle = '#6bff95';
      ctx.fillRect(hpX, hpY, hpW * hpPct, 6);
      this.drawHealthBarNotches(hpX, hpY, hpW, 6, minion.maxHp);
    };

    if (!cacheRender) {
      const phaseCycle = Math.PI * 2;
      const wrappedPhase = ((phase % phaseCycle) + phaseCycle) % phaseCycle;
      const phaseBuckets = 12;
      const phaseBucket = Math.max(0, Math.min(phaseBuckets - 1, Math.round((wrappedPhase / phaseCycle) * (phaseBuckets - 1))));
      const mouthBuckets = 8;
      const mouthBucket = Math.max(0, Math.min(mouthBuckets - 1, Math.round(attackLife * (mouthBuckets - 1))));
      const radiusBucket = Math.max(14, Math.min(36, Math.round(baseR)));
      const cacheKey = `dragon:${sideName}:${minion.super ? 1 : 0}:${upgraded ? 1 : 0}:${radiusBucket}:${phaseBucket}:${mouthBucket}`;
      const cacheWidth = Math.ceil(radiusBucket * 8 * scale + 96);
      const cacheHeight = Math.ceil(radiusBucket * 5.6 * scale + 110);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          r: radiusBucket,
          flyPhase: (phaseBucket / Math.max(1, phaseBuckets - 1)) * phaseCycle,
          dragonBreathTtl: (mouthBucket / Math.max(1, mouthBuckets - 1)) * 0.24,
          dragonSuperBreathTtl: (mouthBucket / Math.max(1, mouthBuckets - 1)) * 1.8,
          dragonBreathToX: null,
          dragonBreathToY: null,
        };
        this.drawDragonSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        this.drawThemedSpecialLook(minion, 'dragon', { cacheRender, upgraded });
        drawDragonLabel();
        drawDragonBreath();
        drawDragonHpBar();
        return;
      }
    }

    // Dragon shadow removed
    // ctx.fillStyle = '#00000026';
    // ctx.beginPath();
    // ctx.ellipse(x, y + bodyH + 14, bodyW * 1.05, 8 + bodyH * 0.24, 0, 0, Math.PI * 2);
    // ctx.fill();

    ctx.save();
    ctx.translate(x, y);

    const backWingTopY = -bodyH * (1.02 + wingFlap * 0.48);
    const backWingTipY = bodyH * (0.16 + (1 - wingFlap) * 0.28);
    ctx.fillStyle = '#243449';
    ctx.beginPath();
    ctx.moveTo(-dir * 7, -5);
    ctx.lineTo(-dir * (wingSpan * 0.56), backWingTopY);
    ctx.lineTo(-dir * (wingSpan * 1.02), backWingTipY);
    ctx.lineTo(-dir * (wingSpan * 0.22), bodyH * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#485f7d';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-dir * 6, -4);
    ctx.lineTo(-dir * (wingSpan * 0.62), backWingTopY + bodyH * 0.12);
    ctx.lineTo(-dir * (wingSpan * 0.88), backWingTipY - bodyH * 0.16);
    ctx.stroke();

    const frontWingTopY = -bodyH * (0.9 + wingFlap * 0.66);
    const frontWingTipY = bodyH * (0.14 + (1 - wingFlap) * 0.32);
    ctx.fillStyle = '#2f4664';
    ctx.beginPath();
    ctx.moveTo(dir * 5, -2);
    ctx.lineTo(dir * (wingSpan * 0.54), frontWingTopY);
    ctx.lineTo(dir * (wingSpan * 0.98), frontWingTipY);
    ctx.lineTo(dir * (wingSpan * 0.2), bodyH * 0.38);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7598c2';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(dir * 4, -2.6);
    ctx.lineTo(dir * (wingSpan * 0.58), frontWingTopY + bodyH * 0.14);
    ctx.lineTo(dir * (wingSpan * 0.82), frontWingTipY - bodyH * 0.08);
    ctx.stroke();

    ctx.fillStyle = '#395579';
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a2a40';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.strokeStyle = '#8cbcff88';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-dir * (bodyW * 0.5), 2);
    ctx.lineTo(dir * (bodyW * 0.45), 2);
    ctx.stroke();
    ctx.globalAlpha = 0.36;
    ctx.fillStyle = '#b9d7ef';
    ctx.beginPath();
    ctx.ellipse(dir * (bodyW * 0.06), bodyH * 0.1, bodyW * 0.5, bodyH * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (upgraded) {
      ctx.fillStyle = '#9fd1ff';
      for (let i = 0; i < 5; i += 1) {
        const spikeX = -dir * (bodyW * (0.44 - i * 0.2));
        const spikeH = bodyH * (0.34 + i * 0.05);
        ctx.beginPath();
        ctx.moveTo(spikeX, -bodyH * 0.26);
        ctx.lineTo(spikeX + dir * 4.2, -bodyH * 0.26 - spikeH);
        ctx.lineTo(spikeX + dir * 8.2, -bodyH * 0.24);
        ctx.closePath();
        ctx.fill();
      }
    }

    const headX = dir * (bodyW * 0.82);
    const headY = -bodyH * (0.3 + wingSweep * 0.03);
    const headR = bodyH * 0.7;
    ctx.fillStyle = '#45648c';
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a2a40';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.strokeStyle = '#adc9ea';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(headX + dir * 2, headY - headR * 1.3);
    ctx.lineTo(headX + dir * 7, headY - headR * 1.86);
    ctx.moveTo(headX - dir * 1, headY - headR * 1.2);
    ctx.lineTo(headX + dir * 2, headY - headR * 1.78);
    ctx.stroke();
    if (upgraded) {
      ctx.strokeStyle = '#dce9ff';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(headX + dir * 1, headY - headR * 0.98);
      ctx.lineTo(headX + dir * 10.5, headY - headR * 2.18);
      ctx.moveTo(headX - dir * 4, headY - headR * 0.8);
      ctx.lineTo(headX + dir * 1.8, headY - headR * 1.9);
      ctx.stroke();
    }

    const jawDrop = headR * mouthOpen;
    ctx.fillStyle = '#2c3f59';
    ctx.beginPath();
    ctx.moveTo(headX - dir * (headR * 0.38), headY + headR * 0.12);
    ctx.quadraticCurveTo(
      headX + dir * (headR * 0.98),
      headY + headR * 0.34 + jawDrop,
      headX + dir * (headR * 0.32),
      headY + headR * 0.95 + jawDrop
    );
    ctx.quadraticCurveTo(
      headX - dir * (headR * 0.22),
      headY + headR * 0.8 + jawDrop * 0.76,
      headX - dir * (headR * 0.38),
      headY + headR * 0.12
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#556f90';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (attackLife > 0.001) {
      ctx.globalAlpha = 0.5 + attackLife * 0.35;
      const fireGrad = ctx.createRadialGradient(
        headX + dir * (headR * 0.48),
        headY + headR * 0.54 + jawDrop * 0.34,
        1,
        headX + dir * (headR * 0.48),
        headY + headR * 0.54 + jawDrop * 0.34,
        headR * 0.8
      );
      fireGrad.addColorStop(0, '#fff6cc');
      fireGrad.addColorStop(0.45, '#ffaf56');
      fireGrad.addColorStop(1, '#ff5c33');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.ellipse(
        headX + dir * (headR * 0.48),
        headY + headR * 0.54 + jawDrop * 0.34,
        headR * (0.48 + attackLife * 0.2),
        headR * (0.28 + attackLife * 0.15),
        -dir * 0.12,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = '#f8fbff';
    ctx.beginPath();
    ctx.arc(headX + dir * 4.8, headY - 1.2, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a2635';
    ctx.beginPath();
    ctx.arc(headX + dir * 5.1, headY - 1.1, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5e7ea6';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-dir * (bodyW * 0.82), bodyH * 0.08);
    ctx.quadraticCurveTo(
      -dir * (bodyW * 1.26 + wingSweep * bodyW * 0.08),
      bodyH * 0.18,
      -dir * (bodyW * 1.52),
      bodyH * 0.7 + wingFlap * bodyH * 0.08
    );
    ctx.stroke();

    ctx.restore();
    if (!cacheRender) {
      const heart = this.dragonHeartCore(minion);
      this.drawDragonHeartMarker(heart.x, heart.y, heart.r, {
        attackLife,
        side: sideName,
        seed: Number(minion.id) || 0,
      });
    }
    this.drawThemedSpecialLook(minion, 'dragon', { cacheRender, upgraded });

    drawDragonLabel();
    drawDragonBreath();
    drawDragonHpBar();
  }

  drawArrow(arrow, topSlotAsCannon = false) {
    if ((Number(arrow?.launchDelay) || 0) > 0) return;
    const { ctx } = this;
    const isStuck = Boolean(arrow.stuck);
    const stuckTtlMax = Math.max(0, Number(arrow.stuckTtlMax) || 0);
    const stuckTtl = Math.max(0, Number(arrow.stuckTtl) || 0);
    const stuckFade = isStuck && stuckTtlMax > 0
      ? Math.max(0, Math.min(1, stuckTtl / stuckTtlMax))
      : 1;
    if (isStuck && stuckFade <= 0) return;
    const angle = isStuck && Number.isFinite(arrow.stuckAngle)
      ? arrow.stuckAngle
      : Math.atan2(arrow.vy, arrow.vx);
    const len = 14 + arrow.r * 1.6;
    const isMainArrow = Boolean(arrow.mainArrow);
    const isImpactStuck = isStuck && Boolean(arrow.stuckHitUnit);
    const comboTier = Math.max(1, Math.min(4, Number(arrow.comboTier) || 1));
    const comboBoost = isMainArrow ? Math.max(0, (comboTier - 1) / 3) : 0;
    const arrowCount = Math.max(0, Number(this.frameArrowCount) || 0);
    const heavyArrowLoad = arrowCount >= 40;
    const veryHeavyArrowLoad = arrowCount >= 80;
    const archerSlot = Math.max(0, Math.floor(Number(arrow?.archerSlot) || 0));
    const useCannonVisual = Boolean(topSlotAsCannon && archerSlot === 1);

    if (useCannonVisual) {
      const x = Number(arrow?.x) || 0;
      const y = Number(arrow?.y) || 0;
      const sideName = arrow.side === 'right' ? 'right' : 'left';
      const vx = Number(arrow?.vx) || 0;
      const vy = Number(arrow?.vy) || 0;
      const speed = Math.hypot(vx, vy) || 1;
      const nx = vx / speed;
      const ny = vy / speed;
      const ballR = Math.max(4.2, Number(arrow?.r) || 3.5) * 1.45;
      let trailTint = sideName === 'left' ? '#87baff' : '#ff9f9f';
      let shellFill = '#2a2f3a';
      let shellRim = '#c7d2e8';
      let shellHighlight = '#ffd8a6';
      if (arrow.powerType === 'ultraShot') {
        trailTint = '#fff06d';
        shellFill = '#4b4732';
        shellRim = '#fff8b3';
        shellHighlight = '#fffad6';
      } else if (arrow.powerType === 'pierceShot') {
        trailTint = '#9af7ff';
        shellFill = '#2a434a';
        shellRim = '#c2fcff';
        shellHighlight = '#e9fcff';
      } else if (arrow.powerType === 'flameShot') {
        trailTint = '#ff8f52';
        shellFill = '#4a3428';
        shellRim = '#ffd098';
        shellHighlight = '#ffe2bf';
      } else if (arrow.powerType === 'multiShot') {
        trailTint = '#d2a4ff';
        shellFill = '#41324d';
        shellRim = '#e6ccff';
        shellHighlight = '#f0e0ff';
      } else if (arrow.powerType === 'flareShot') {
        trailTint = '#ffd268';
        shellFill = '#4a4032';
        shellRim = '#ffe7ad';
        shellHighlight = '#fff2ce';
      }
      if (isImpactStuck) {
        trailTint = '#ff5a5a';
        shellFill = '#6e2f2f';
        shellRim = '#ffb3a9';
        shellHighlight = '#ffd0cb';
      }

      ctx.save();
      if (isStuck) ctx.globalAlpha *= stuckFade;

      if (!isStuck && !veryHeavyArrowLoad) {
        const trailLen = ballR * (3.1 + comboBoost * 1.9);
        const trail = ctx.createLinearGradient(x, y, x - nx * trailLen, y - ny * trailLen);
        trail.addColorStop(0, '#fff5d8');
        trail.addColorStop(0.45, `${trailTint}b8`);
        trail.addColorStop(1, `${trailTint}00`);
        ctx.strokeStyle = trail;
        ctx.lineWidth = Math.max(1.9, ballR * 0.34);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - nx * trailLen, y - ny * trailLen);
        ctx.stroke();
        ctx.lineCap = 'butt';
      }

      const glow = ctx.createRadialGradient(x, y, 1.5, x, y, ballR * 2.25);
      glow.addColorStop(0, '#fff4d1bb');
      glow.addColorStop(0.45, `${trailTint}70`);
      glow.addColorStop(1, `${trailTint}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, ballR * 2.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = shellFill;
      ctx.beginPath();
      ctx.arc(x, y, ballR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = shellRim;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = shellHighlight;
      ctx.beginPath();
      ctx.arc(x - ballR * 0.22, y - ballR * 0.24, Math.max(1.2, ballR * 0.22), 0, Math.PI * 2);
      ctx.fill();

      if (isMainArrow && arrow.powerType) {
        const iconSize = Math.max(8.6, ballR * 1.32);
        this.drawShotPowerIcon(arrow.powerType, x, y, iconSize, arrow.side, { drawBadge: false });
      }
      ctx.restore();
      return;
    }

    let body = arrow.side === 'left' ? '#d5ecff' : '#ffe0e0';
    let glow = null;
    if (arrow.powerType === 'ultraShot') {
      body = '#fff06d';
      glow = '#fff8b3';
    } else if (arrow.powerType === 'pierceShot') {
      body = '#9af7ff';
      glow = '#c2fcff';
    } else if (arrow.powerType === 'flameShot') {
      body = '#ff8f52';
      glow = '#ffd098';
    } else if (arrow.powerType === 'multiShot') {
      body = '#d2a4ff';
      glow = '#e6ccff';
    }
    if (isImpactStuck) {
      body = '#ff5a5a';
      glow = '#ffb3a9';
    }
    if (isMainArrow && !glow) {
      glow = arrow.side === 'left' ? '#bfe8ff' : '#ffd2c7';
    }

    ctx.save();
    if (isStuck) ctx.globalAlpha *= stuckFade;
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(angle);
    if (isStuck) ctx.translate(-len * 0.18, 0);

    const allowGlow = glow && !veryHeavyArrowLoad && (isMainArrow || !heavyArrowLoad);
    if (allowGlow) {
      ctx.shadowColor = isMainArrow ? this.withAlpha(glow, 0.1) : glow;
      ctx.shadowBlur = isMainArrow ? 0.8 : 5;
    }

    if (!isStuck && comboBoost > 0 && !heavyArrowLoad) {
      const trailColor = comboTier >= 4
        ? (arrow.side === 'left' ? '#eefbffcc' : '#fff1c6cc')
        : (arrow.side === 'left' ? '#b9ecffb8' : '#ffcab7b8');
      const trailLength = len * (0.95 + comboBoost * 2.6);
      const wing = 0.8 + comboBoost * 2.2;

      // Simple long stem: clean, readable, and cheap to draw.
      ctx.lineCap = 'round';
      ctx.strokeStyle = trailColor;
      ctx.lineWidth = Math.max(1.4, arrow.r * (0.45 + comboBoost * 0.7));
      ctx.beginPath();
      ctx.moveTo(-len * 0.46, 0);
      ctx.lineTo(-trailLength, 0);
      ctx.stroke();

      ctx.strokeStyle = comboTier >= 4 ? '#fffbe8b8' : '#ffffff88';
      ctx.lineWidth = Math.max(1, arrow.r * 0.24);
      ctx.beginPath();
      ctx.moveTo(-trailLength * 0.7, -wing);
      ctx.lineTo(-trailLength, 0);
      ctx.lineTo(-trailLength * 0.7, wing);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    ctx.strokeStyle = body;
    ctx.lineWidth = Math.max(1.5, arrow.r * 0.6) * (isMainArrow ? 1.2 : 1);
    ctx.beginPath();
    ctx.moveTo(-len * 0.55, 0);
    ctx.lineTo(len * 0.45, 0);
    ctx.stroke();
    if (arrow.powerType === 'flameShot' && !isStuck) {
      if (heavyArrowLoad) {
        ctx.strokeStyle = '#ff8f52';
      } else {
        const flameGradient = ctx.createLinearGradient(-len * 0.5, 0, len * 0.2, 0);
        flameGradient.addColorStop(0, '#ffe09a');
        flameGradient.addColorStop(0.45, '#ff9c55');
        flameGradient.addColorStop(1, '#ff5f39');
        ctx.strokeStyle = flameGradient;
      }
      ctx.lineWidth = Math.max(1.2, arrow.r * 0.35) * (isMainArrow ? 1.18 : 1);
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.lineTo(len * 0.26, 0);
      ctx.stroke();
    }
    if (isMainArrow && !isStuck) {
      ctx.strokeStyle = '#ffffffdd';
      ctx.lineWidth = Math.max(1, arrow.r * 0.28);
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.lineTo(len * 0.38, 0);
      ctx.stroke();
    }

    ctx.fillStyle = '#6f4b2a';
    ctx.fillRect(-len * 0.5, -1.2, len * 0.1, 2.4);

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(len * 0.55, 0);
    ctx.lineTo(len * 0.28, -3.8);
    ctx.lineTo(len * 0.28, 3.8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = isImpactStuck ? '#ff8d8d' : (arrow.side === 'left' ? '#9ccfff' : '#ffb1b1');
    ctx.beginPath();
    ctx.moveTo(-len * 0.58, 0);
    ctx.lineTo(-len * 0.32, -2.8);
    ctx.lineTo(-len * 0.35, 0);
    ctx.lineTo(-len * 0.32, 2.8);
    ctx.closePath();
    ctx.fill();

    if (isMainArrow && arrow.powerType) {
      const iconSize = Math.max(9, arrow.r * 1.55) + 2;
      this.drawShotPowerIcon(arrow.powerType, len * 0.02, 0, iconSize, arrow.side, { drawBadge: false });
    }

    ctx.restore();
  }
}

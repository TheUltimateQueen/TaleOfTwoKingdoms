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
  UPGRADE_LEVEL_CAPS,
  SPAWN_EVERY_MIN_SECONDS,
  SPAWN_EVERY_BASE_SECONDS,
  SPAWN_EVERY_PER_LEVEL_REDUCTION,
} from './simConstants.js';
import {
  SPECIAL_SPAWN_QUEUE_ORDER,
  BASIC_SPECIAL_SPAWN_TYPES,
  SUPPORT_SPECIAL_TYPES,
  SUPPORT_SPAWN_DEBUFF_FIRST_MULT,
  SUPPORT_SPAWN_DEBUFF_ADDITIONAL_MULT,
  specialSpawnBaseChanceForType,
} from './constants.js';
import {
  DEFAULT_THEME_MODE,
  defaultArcherName,
  heroBattleLines,
  heroDeathEncoreLine,
  heroDeathLines,
  heroSummonLine,
  golemSummonLine,
  isDefaultPlayerName,
  normalizeThemeMode,
  presidentBattleLines,
  presidentRallyLine,
} from './themeConfig.js';
import {
  REPEAT_SPECIAL_UPGRADE_CONFIG,
  SPECIAL_BUCKET_UPGRADE_TYPES,
  SPECIAL_UNIT_UPGRADE_RULES,
} from './specialUnitUpgradeConfig.js';
const ARCHER_ORIGIN_Y = TOWER_Y - 56;
const ARCHER_VERTICAL_GAP = 78;
const SHOT_INTERVAL = 1;
const CPU_RETARGET_MIN_SECONDS = 0.18;
const CPU_RETARGET_MAX_SECONDS = 0.44;
const CPU_PULL_FOLLOW_SPEED = 8.2;
const CPU_MIN_SOLUTION_DX = 10;
const CPU_MIN_CLOSE_SOLUTION_DX = 1;
const CPU_CLOSE_TARGET_DX = 90;
const CPU_CLOSE_TARGET_PULL_Y = 0.72;
const CPU_MAX_SOLUTION_TTL = 5.6;
const CPU_GOLD_GAP_NORMALIZE = 1000;
const CPU_MINION_LEAD_TIME_MAX = 1.1;
const CPU_MINION_LEAD_TIME_SCALE = 0.72;
const CPU_MINION_CLOSE_LEAD_TIME_SCALE = 0.9;
const CPU_MINION_CLOSE_NOISE_SCALE = 0.2;
const CPU_MINION_CLOSE_MISS_NOISE_SCALE = 0.45;
const CPU_MINION_CLOSE_ACCURACY_BOOST = 0.34;

// Shot power drop frequency (seconds)
const SHOT_POWER_SPAWN_MIN_INTERVAL = 10;
const SHOT_POWER_SPAWN_MAX_INTERVAL = 50;
const SHOT_POWER_POWER_UPGRADE_MIN_INTERVAL = 5;
const SHOT_POWER_POWER_UPGRADE_MAX_INTERVAL = 10;
const SHOT_POWER_MULTI_SHOT_CHANCE_RATIO = 0.1;
const SHOT_POWER_FLARE_SPAWN_CHANCE_MULT = 0.25;
const RESOURCE_SPAWN_START_MIN_SECONDS = 2;
const RESOURCE_SPAWN_START_MAX_SECONDS = 10;
const RESOURCE_SPAWN_END_MIN_SECONDS = 8;
const RESOURCE_SPAWN_END_MAX_SECONDS = 25;
const RESOURCE_SPAWN_RANGE_RAMP_SECONDS = 120;
const RESOURCE_SPAWN_TELEGRAPH_DURATION = 1;
const RESOURCE_VALUE_BASE = 22;
const RESOURCE_VALUE_MIN = 10;
const RESOURCE_VALUE_REFERENCE_WAIT_SECONDS = (RESOURCE_SPAWN_START_MIN_SECONDS + RESOURCE_SPAWN_START_MAX_SECONDS) * 0.5;
const MINION_KILL_GOLD_BASE = 12;
const ECONOMY_RESOURCE_GOLD_BONUS_PER_LEVEL = 0.11;
const ECONOMY_COMBAT_GOLD_BONUS_PER_LEVEL = 0.1;
const ECONOMY_ARROW_HIT_FLAT_GOLD_PER_LEVEL = 1;
const NORMAL_MINION_HP_REFERENCE = 75 + 30;
const ARROW_DAMAGE_MIN_UNIT_HP_FRACTION = 0.2;
const ARROW_DAMAGE_BASE_UNIT_HP_FRACTION = 0.24;
const ARROW_DAMAGE_PER_UPGRADE_FRACTION = 0.01;
const ARROW_DAMAGE_MAX_UNIT_HP_FRACTION = 0.75;
const ARROW_DAMAGE_GOLD_UNIT_KILL_EQUIV = 1.35;
const ARROW_DAMAGE_GOLD_MAX_COMBO_MULT = 1.2;
const ARROW_DAMAGE_GOLD_UPGRADE_CHARGE_MULT = 1;
const ARROW_DAMAGE_GOLD_SHOT_CAP_RATIO = 1 / 5;
const COMBO_MAX_STREAK = 10;
const COMBO_OVERDRIVE_DAMAGE_PER_STACK = 2;
const COMBO_OVERDRIVE_AOE_DAMAGE_PER_STACK = 1;
const COMBO_SPECIAL_TIMER_BOOST_MIN_STREAK = 5;
const COMBO_SPECIAL_TIMER_BOOST_MAX_STREAK = COMBO_MAX_STREAK;
const COMBO_SPECIAL_TIMER_BOOST_MID_SECONDS = 0.5;
const COMBO_SPECIAL_TIMER_BOOST_MAX_SECONDS = 1;
const TOTAL_FEEDING_TRIGGER_SECONDS = 180;
const TOTAL_FEEDING_SPAWN_EVERY_MULT = 0.5;
const TOTAL_FEEDING_SPEED_MULT = 1.5;
const TOTAL_FEEDING_HP_MULT = 2;
const TOTAL_FEEDING_DAMAGE_MULT = 3;
const TOTAL_FEEDING_GOLD_MULT = 2;
const TOTAL_FEEDING_GRAIN_PICKUP_RADIUS = 26;
const TOTAL_FEEDING_GRAIN_THROW_TTL = 0.52;
const TOTAL_FEEDING_GRAIN_ARC_MIN = 34;
const TOTAL_FEEDING_GRAIN_ARC_MAX = 62;
const TOTAL_FEEDING_GRAIN_TOWER_Y = TOWER_Y - 18;
const TOTAL_FEEDING_GRAIN_JUMP_TTL = 0.58;
const TOTAL_FEEDING_GRAIN_JUMP_ARC_MIN = 62;
const TOTAL_FEEDING_GRAIN_JUMP_ARC_MAX = 96;
const RIDER_CHARGE_REARM_MOVE_TICKS = 3;
const RARE_SPECIAL_UPGRADE_CARD_CHANCE_LOCKED = 0.0005;
const RARE_SPECIAL_UPGRADE_CARD_CHANCE_UNLOCKED = 0.005;
const FIXED_RARE_SPECIAL_UPGRADE_CARD_TYPES = Object.freeze([
  'stoneGolemAncientCoreLevel',
  'heroDestinedChampionLevel',
]);

const TOWER_MAX_HP = 6000;
const UPGRADE_COST_RULES = {
  unitLevel: { base: 138, growth: 18, start: 1 },
  volleyLevel: { base: 190, growth: 24, start: 0 },
  spawnLevel: { base: 150, growth: 16, start: 1 },
  unitHpLevel: { base: 138, growth: 16, start: 1 },
  resourceLevel: { base: 122, growth: 14, start: 1 },
  powerLevel: { base: 164, growth: 20, start: 1 },
  balloonLevel: { base: 252, growth: 28, start: 0 },
  dragonLevel: { base: 236, growth: 26, start: 0 },
  dragonSuperBreathLevel: { base: 328, growth: 0, start: 0 },
  stoneGolemAncientCoreLevel: { base: 392, growth: 34, start: 0 },
  heroDestinedChampionLevel: { base: 408, growth: 36, start: 0 },
  shieldDarkMetalLevel: { base: 304, growth: 22, start: 0 },
  monkHealCircleLevel: { base: 286, growth: 18, start: 0 },
  necroExpertSummonerLevel: { base: 274, growth: 18, start: 0 },
  riderSuperHorseLevel: { base: 298, growth: 20, start: 0 },
  diggerGoldFinderLevel: { base: 282, growth: 18, start: 0 },
  gunnerSkyCannonLevel: { base: 294, growth: 20, start: 0 },
  presidentExecutiveOrderLevel: { base: 306, growth: 20, start: 0 },
  superMinionLevel: { base: 214, growth: 24, start: 0 },
};
const UPGRADE_DEBT_MULT = 0.75;
const UPGRADE_PATH_BY_TYPE = {
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
const SPECIAL_UNIT_UPGRADE_RULES_BY_SPECIAL_TYPE = Object.freeze(
  Object.fromEntries(
    Object.values(SPECIAL_UNIT_UPGRADE_RULES)
      .filter((rule) => typeof rule?.specialType === 'string' && rule.specialType)
      .map((rule) => [rule.specialType, rule])
  )
);
const SUPPORT_SPECIAL_TYPE_SET = new Set(SUPPORT_SPECIAL_TYPES);
const BASIC_SPECIAL_TYPE_SET = new Set(BASIC_SPECIAL_SPAWN_TYPES);
const TIER2_SPECIAL_SPAWN_TYPES = Object.freeze(['dragon', 'shield', 'super', 'balloon', 'candle']);
const TIER2_SPECIAL_TYPE_SET = new Set(TIER2_SPECIAL_SPAWN_TYPES);
const SPECIAL_RANDOM_CHANCE_TYPES = Object.freeze([...SPECIAL_SPAWN_QUEUE_ORDER, 'candle']);
const SPECIAL_CADENCE_MATCH_MULT_MIN = 0.5;
const SPECIAL_CADENCE_MATCH_MULT_MAX = 1.5;
const SPECIAL_CADENCE_JITTER_MAX = 0.3;
const SPECIAL_CADENCE_JITTER_BELL_SAMPLES = 6;
const BASIC_SPECIAL_SHARED_BASE_CENTER = 30;
const BASIC_SPECIAL_SHARED_BASE_VARIANCE = 15;
const TIER2_SPECIAL_BASE_EVERY_MIN = 75;
const TIER2_SPECIAL_BASE_EVERY_MAX = 140;
const BASIC_SPECIAL_BASE_CHANCE_MIN = 0.4;
const BASIC_SPECIAL_BASE_CHANCE_MAX = 0.6;
const TIER2_SPECIAL_BASE_CHANCE_MIN = 0.1;
const TIER2_SPECIAL_BASE_CHANCE_MAX = 0.3;
const CANDLE_TIER2_CADENCE_MULT = 2;
const SPECIAL_CADENCE_TRACKED_TYPES = Object.freeze([
  ...SPECIAL_SPAWN_QUEUE_ORDER,
  'candle',
]);
const DRAGON_SUPER_BREATH_INTERVAL = 5;
const DRAGON_SUPER_BREATH_COOLDOWN_JITTER = 1.25;
const DRAGON_SUPER_BREATH_RANGE = 300;
const DRAGON_SUPER_BREATH_HALF_ANGLE = Math.PI * 0.24;
const DRAGON_SUPER_BREATH_MINION_DAMAGE_MULT = 2.05;
const DRAGON_SUPER_BREATH_TOWER_DAMAGE_MULT = 1.48;
const DRAGON_SUPER_BREATH_LIFT = 34;
const DRAGON_SUPER_BREATH_RISE_TIME = 0.25;
const DRAGON_SUPER_BREATH_DURATION = 2;
const DRAGON_SUPER_BREATH_TICK = 0.2;
const DRAGON_SUPER_BREATH_CHANNEL_DAMAGE_MULT = 0.28;
const DRAGON_SUPER_BREATH_CHANNEL_TOWER_MULT = 0.16;
const DRAGON_SUPER_BREATH_GROUND_SCORCH_TTL = 3.4;
const DRAGON_SUPER_BREATH_GROUND_SCORCH_RADIUS = 108;
const DRAGON_SUPER_BREATH_GROUND_SCORCH_ENEMY_DPS = 58;
const FLAME_SHOT_SCORCH_TTL = 2.2;
const FLAME_SHOT_SCORCH_RADIUS = 58;
const FLAME_SHOT_SCORCH_ENEMY_DPS = 11;
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
const PRESIDENT_EXECUTIVE_ORDER_MIN_INTERVAL = 1;
const PRESIDENT_EXECUTIVE_ORDER_MAX_INTERVAL = 6;
const PRESIDENT_EXECUTIVE_ORDER_SIGN_TTL = 0.9;
const PRESIDENT_EXECUTIVE_ORDER_BEAM_TTL = 0.55;
const PRESIDENT_EXECUTIVE_ORDER_DAMAGE_TAKEN_MULT = 0.1;
const PRESIDENT_EXECUTIVE_ORDER_HITS = 1;
const PRESIDENT_AURA_RANGE_SCALE = 0.25;
const PRESIDENT_CREEP_SPEED_MULT = 0.12;
const PRESIDENT_CREEP_SPEED_MIN = 5.5;
const PRESIDENT_CREEP_TOWER_BUFFER = 118;
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
const GUNNER_SKY_CANNON_FLARE_SPEED = 880;
const GUNNER_SKY_CANNON_FLARE_MIN_TRAVEL = 0.12;
const GUNNER_SKY_CANNON_FLARE_MAX_TRAVEL = 0.5;
const GUNNER_SKY_CANNON_AIRSTRIKE_MARK_DELAY = 0.52;
const GUNNER_SKY_CANNON_SIGNAL_FLARE_TTL = 0.36;
const GUNNER_SKY_CANNON_BARRAGE_CHANCE = 0.5;
const GUNNER_SKY_CANNON_BARRAGE_MIN_SHOTS = 2;
const GUNNER_SKY_CANNON_BARRAGE_MAX_SHOTS = 5;
const GUNNER_SKY_CANNON_BARRAGE_SHOT_DELAY = 0.24;
const GUNNER_SKY_CANNON_BARRAGE_TOWER_APPROACH_MAX = 0.72;
const GUNNER_FOOD_THROW_UNLOCK_LEVEL = 2;
const GUNNER_FOOD_THROW_INTERVAL = 1.28;
const GUNNER_FOOD_THROW_COOLDOWN_JITTER = 0.42;
const GUNNER_FOOD_THROW_RANGE_MIN = 240;
const GUNNER_FOOD_THROW_RANGE_MAX = 430;
const GUNNER_FOOD_THROW_FLYING_RANGE_BONUS = 180;
const GUNNER_FOOD_THROW_FLYING_RANGE_MAX = 620;
const GUNNER_FOOD_THROW_DAMAGE_MULT = 0.56;
const GUNNER_FOOD_THROW_FLYING_BONUS = 1.16;
const BALLOON_BOMB_BASE_RADIUS = 72;
const BALLOON_BOMB_TOWER_DAMAGE_MULT = 0.82;
const BALLOON_THROW_TOWER_DAMAGE_MULT = 0.44;
const BALLOON_BOMB_BASE_INTERVAL = 3.2;
const BALLOON_BOMB_INTERVAL_JITTER = 1.05;
const BALLOON_BOMB_DROP_TTL_MIN = 1.4;
const BALLOON_BOMB_DROP_TTL_MULT = 1.85;
const BALLOON_HEAVY_BOMB_RADIUS_MULT = 5.5;
const BALLOON_HEAVY_BOMB_TOWER_DAMAGE_MULT = 1.18;
const BALLOON_BOMB_DAMAGE_VS_CANNON_MULT = 4;
const BALLOON_HEAVY_BOMB_DROP_TTL_MIN = 2.7;
const BALLOON_HEAVY_BOMB_DROP_TTL_MULT = 2.65;
const BALLOON_BOMB_EXPLOSION_VISUAL_TTL = 0.6;
const BALLOON_HEAVY_BOMB_INTERVAL_MIN = 2;
const BALLOON_HEAVY_BOMB_INTERVAL_MAX = 4;
const BALLOON_TOP_MIN_Y = 26;
const BALLOON_TOP_MAX_Y = 188;
const BALLOON_LOW_HP_MAX_Y = TOWER_Y + 120;
const BALLOON_HEALTH_DROP_MAX = Math.max(0, BALLOON_LOW_HP_MAX_Y - BALLOON_TOP_MAX_Y);
const BALLOON_HEALTH_DROP_SMOOTH_PER_SEC = 140;
const BALLOON_BAND_RECOVER_PER_SEC = 150;
const DRAGON_CANDLE_DAMAGE_MULT = 0.11; // 1/20th of previous 2.2x dragon-vs-candle wax damage.
const CANDLE_SPAWN_BASE_CHANCE = 0.18;
const NECRO_EXPERT_REVIVE_RADIUS = 176;
const NECRO_EXPERT_REVIVE_HP_FRACTION = 0.125;
const NECRO_REVIVE_SHIELD_SECONDS = 2;
const HERO_RANDOM_LINE_INTERVAL = 5;
const HERO_HP_MULT = 3;
const HERO_HP_BOOST_MULT = 2.5;
const HERO_SIZE_MULT = 1.5;
const HERO_ARROW_FINISHER_HITS = 9;
const HERO_SWING_ATTACK_WINDOW = 0.26;
const HERO_SWING_IDLE_RETURN_SPEED = 11;
const HERO_SWING_ATTACK_INTERVAL = 0.66;
const HERO_ENABLE_FOOD_RAIN = false;
const HERO_FOOD_RAIN_MIN_CD = 5;
const HERO_FOOD_RAIN_MAX_CD = 30;
const HERO_FOOD_RAIN_TARGET_DROPS = 20;
const HERO_FOOD_RAIN_DROP_VARIANCE = 2;
const HERO_FOOD_RAIN_MIN_DROPS = HERO_FOOD_RAIN_TARGET_DROPS - HERO_FOOD_RAIN_DROP_VARIANCE;
const HERO_FOOD_RAIN_MAX_DROPS = HERO_FOOD_RAIN_TARGET_DROPS + HERO_FOOD_RAIN_DROP_VARIANCE;
const HERO_FOOD_RAIN_RADIUS = 44;
const HERO_FOOD_RAIN_DAMAGE_MULT = 1;
const HERO_FOOD_RAIN_BIG_DAMAGE_MULT = 2.4;
const HERO_FOOD_RAIN_BIG_RADIUS_MULT = 1.35;
const HERO_FOOD_RAIN_BREAD_KINDS = Object.freeze(['bun', 'loaf', 'baguette', 'bagel', 'toast', 'brioche']);
const HERO_FOOD_RAIN_RICE_KINDS = Object.freeze(['mochi', 'onigiri', 'riceCake', 'riceBowl', 'sushiRoll', 'senbei']);
const HERO_FOOD_RAIN_BIG_PROJECTILES = 8;
const HERO_FOOD_RAIN_ENEMY_BASE_SAFE_RADIUS = 170;
const HERO_GROUND_RUMBLE_MIN_CD = 12;
const HERO_GROUND_RUMBLE_MAX_CD = 28;
const HERO_GROUND_RUMBLE_MIN_BURSTS = 2;
const HERO_GROUND_RUMBLE_MAX_BURSTS = 6;
const HERO_GROUND_RUMBLE_RADIUS = 76;
const HERO_GROUND_RUMBLE_DAMAGE_MULT = 1.4;
const HERO_GROUND_RUMBLE_KNOCKBACK = 24;
const HERO_COOKER_MIN_CD = 7.5;
const HERO_COOKER_MAX_CD = 100;
const HERO_COOKER_MAX_EAT = 10;
const HERO_COOKER_EAT_RADIUS = 52;
const HERO_COOKER_COOK_TIME = 10;
const HERO_COOKER_MOVE_SPEED = 10.6;
const HERO_COOKER_EMPTY_LOAD_SPEED_MULT = 2;
const HERO_COOKER_FULL_LOAD_SPEED_MULT = 1;
const HERO_COOKER_FLYOVER_CAPTURE_HALF_WIDTH = 34;
const HERO_COOKER_FLYOVER_MAX_HEIGHT = 240;
const HERO_COOKER_HEALTH_COST_FRACTION = 0.1;
const HERO_COOKER_READY_CAST_CHANCE = 0.46;
const HERO_COOKER_RETRY_MIN_CD = 3;
const HERO_COOKER_RETRY_MAX_CD = 7;
const HERO_COOKER_GUARANTEE_HP_PCT = 0.5;
const HERO_ABILITY_MIN_GAP = 0.5;
const HERO_GROUND_RUMBLE_PATH_PULSE_GAP_MULT = 2.05;
const HERO_ABILITY_TEST_MIN_CD = 5;
const HERO_ABILITY_TEST_MAX_CD = 10;
const SHIELD_PUSH_INTERVAL = 5;
const SHIELD_PUSH_TTL = 0.75;
const SHIELD_PUSH_SCALE = 1.35;
const SHIELD_PUSH_RANGE = 86;
const SHIELD_PUSH_DISTANCE = 18;
const SHIELD_HEADSHOT_DAMAGE_MULT = 3;
const SHIELD_BODYSHOT_DAMAGE_MULT = 1.4;
const SHIELD_HEADSHOT_RETREAT = 20;
const SHIELD_HEAD_HIT_RADIUS_MULT = 0.44;
const SHIELD_GUARD_POSE_RAISE_SPEED = 4.4;
const SHIELD_GUARD_POSE_LOWER_SPEED = 6.2;
const SHIELD_GUARD_POSE_BODY_VULN_THRESHOLD = 0.18;
const SHIELD_GUARD_POSE_HEAD_COVER_THRESHOLD = 0.45;
const STONE_GOLEM_HALF_HP_THRESHOLD = 0.5;
const STONE_GOLEM_HP_MULT = 15;
const STONE_GOLEM_DAMAGE_MULT = 0.8;
const STONE_GOLEM_SPEED_MULT = 0.58;
const STONE_GOLEM_SMASH_INTERVAL = 3;
const STONE_GOLEM_SMASH_RADIUS = 108;
const STONE_GOLEM_SMASH_TOWER_RADIUS = 92;
const STONE_GOLEM_SMASH_KNOCKBACK = 220;
const STONE_GOLEM_SMASH_MIDFIELD_PAD = 24;
const STONE_GOLEM_FLING_MAX_TARGETS_MIN = 4;
const STONE_GOLEM_FLING_MAX_TARGETS_MAX = 10;
const STONE_GOLEM_FLING_DELAY = 0.18;
const STONE_GOLEM_FLING_TTL = 0.72;
const STONE_GOLEM_FLING_ARC = 104;
const STONE_GOLEM_FLING_AIR_ARC = 72;
const STONE_GOLEM_SMASH_TTL = 0.45;
const STONE_GOLEM_SHIELD_TTL = 5;
const STONE_GOLEM_BITE_INTERVAL = 4.2;
const STONE_GOLEM_BITE_SEARCH_RADIUS = 420;
const STONE_GOLEM_BITE_X_RANGE = 108;
const STONE_GOLEM_BITE_MAX_OFFSET_X = 52;
const STONE_GOLEM_BITE_Y_MIN = 18;
const STONE_GOLEM_BITE_Y_MAX = 460;
const STONE_GOLEM_BITE_JUMP_TTL = 0.62;
const STONE_GOLEM_BITE_LAND_TTL = 0.24;
const STONE_GOLEM_BITE_CHEW_TICK = 0.2;
const STONE_GOLEM_BITE_CHEW_DAMAGE_MULT = 0.54;
const STONE_GOLEM_BITE_RELEASE_LOCK_TTL = 0.55;
const MINION_HIT_FLASH_TTL = 0.18;
const SPECIAL_COOLDOWN_START_MULT = 1.5;
const SPECIAL_COOLDOWN_END_MULT = 1;
const SPECIAL_TIER2_COOLDOWN_END_MULT = 0.4;
const SPECIAL_COOLDOWN_RAMP_SECONDS = 300;
const SPECIAL_COOLDOWN_STEP_SECONDS = 10;
const BASIC_SPECIAL_MIN_CADENCE_SECONDS = 10;
const TIER2_SPECIAL_MIN_CADENCE_SECONDS = 15;
const TIER2_SPECIAL_CHANCE_CAP = 0.99;
const TIER2_REPEAT_CHANCE_CURVE_RATE = 0.18;
const TIER2_REPEAT_EVERY_CURVE_RATE = 0.26;
const TIER2_REPEAT_EVERY_MIN_MULT = 0.18;
const SPECIAL_UNLOCK_BONUS_LEVEL_EQUIV = 1;
const BASIC_SPECIAL_REPEAT_CHANCE_MIN_PER_LEVEL = 0.05;
const SPECIAL_REPEAT_CHANCE_BONUS_PER_LEVEL = 0.0125;
const SPECIAL_REPEAT_CHANCE_BONUS_MAX = 0.2;
const SPECIAL_REPEAT_CHANCE_BONUS_PER_LEVEL_BY_TYPE = Object.freeze({
  dragon: 0.0175,
  super: 0.0225,
  shield: 0.005,
});
const SPECIAL_REPEAT_EVERY_BONUS_PER_LEVEL = 0.03;
const SPECIAL_REPEAT_EVERY_BONUS_MAX = 0.24;
const SPECIAL_REPEAT_EVERY_BONUS_PER_LEVEL_BY_TYPE = Object.freeze({
  shield: 0.02,
});
const SPECIAL_REPEAT_EVERY_TYPE_SET = new Set(SPECIAL_SPAWN_QUEUE_ORDER);
const SPECIAL_FAIL_TTL = 5;
const SPECIAL_ROLL_TTL = 6;
const PRESIDENT_RANDOM_LINE_INTERVAL = 5;
const CANDLE_WAX_MAX = 96;
const CANDLE_MAX_HOLDERS = 8;
const CANDLE_FAST_HOLDERS = 6;
const CANDLE_PICKUP_RANGE = 28;
const CANDLE_RECRUIT_RANGE = 210;
const CANDLE_SPAWN_OFFSET = 56;
const CANDLE_CART_HALF_W = 34;
const CANDLE_DELIVER_FUSE = 1.1;
const CANDLE_FIRE_RANGE = 250;
const CANDLE_FIRE_INTERVAL = 1.22 / 3;
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
const ARROW_STUCK_IMPACT_DURATION = 1.35;
const SHOT_POWER_FALL_MIN_SPEED = 78;
const SHOT_POWER_FALL_MAX_SPEED = 112;
const ARROW_TARGET_BUCKET_W = 120;
const ARROW_TARGET_BUCKET_SCAN = 2;
const MINION_TARGET_BUCKET_W = 140;
const MINION_TARGET_RADIUS_PAD = 84;
const MAX_DAMAGE_EVENTS_PER_TICK = 240;
const MAX_BUCKET_CELL_POOL = 2200;
const ROOM_SIDES = ['left', 'right'];
const DEBUG_RATE_MIN = 0.25;
const DEBUG_RATE_MAX = 6;
const DEBUG_CANDLE_BONUS_MIN = -0.5;
const DEBUG_CANDLE_BONUS_MAX = 0.8;
const DEBUG_SPECIAL_OVERRIDE_MIN = 0;
const DEBUG_SPECIAL_OVERRIDE_MAX = 0.99;
const DEBUG_FORCE_SPECIAL_TYPES = new Set([
  'dragon',
  'shield',
  'digger',
  'necrominion',
  'gunner',
  'rider',
  'monk',
  'stonegolem',
  'hero',
  'president',
  'balloon',
  'super',
]);
const MATCH_SAMPLE_INTERVAL_SEC = 1;
const MATCH_MAX_TIMELINE_POINTS = 2400;
const MATCH_MAX_UPGRADE_EVENTS = 600;
const MATCH_MAX_LUCK_EVENTS = 900;
const MAX_COMMITTEE_PLAYERS_PER_SIDE = 12;
const COMMITTEE_VOTE_OPTION_COUNT = 4;
const COMMITTEE_VOTE_DURATION_SECONDS = 5;
const UPGRADE_SELECTION_FX_DURATION = 2.2;
const REGULAR_SPECIAL_PAIR_PICK_CHANCE = 0.62;
const COMMITTEE_SPECIAL_BUCKET_WEIGHT_MULT = 1.75;
const ECONOMY_UPGRADE_CARD_WEIGHT_MULT = 0.25;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function lerp(from, to, t) {
  const a = Number(from) || 0;
  const b = Number(to) || 0;
  const p = Math.max(0, Math.min(1, Number(t) || 0));
  return a + (b - a) * p;
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function mirroredX(x) {
  return WORLD_W - x;
}

function presidentPodiumTargetX(sideName = 'left') {
  const centerX = WORLD_W * 0.5;
  const towerX = sideName === 'right' ? TOWER_X_RIGHT : TOWER_X_LEFT;
  const base = (towerX + centerX) * 0.5;
  const jitter = Math.random() * 26 - 13;
  return clamp(base + jitter, TOWER_X_LEFT + 80, TOWER_X_RIGHT - 80);
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function weightedRandomFrom(entries = []) {
  let total = 0;
  for (const entry of entries) {
    const weight = Math.max(0, Number(entry?.weight) || 0);
    total += weight;
  }
  if (!(total > 0)) return entries.length ? randomFrom(entries) : null;
  let roll = Math.random() * total;
  for (const entry of entries) {
    const weight = Math.max(0, Number(entry?.weight) || 0);
    if (weight <= 0) continue;
    roll -= weight;
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1] || null;
}

function defaultCommitteeName(sideName = 'left', ordinal = 1) {
  const side = sideName === 'right' ? 'right' : 'left';
  const index = Math.max(1, Math.floor(Number(ordinal) || 1));
  return `${side === 'left' ? 'Bread Council' : 'Rice Council'} ${index}`;
}

function isDefaultCommitteeName(name) {
  const value = String(name || '').trim();
  if (!value) return false;
  return (
    /^Bread Council \d+$/i.test(value)
    || /^Rice Council \d+$/i.test(value)
  );
}

function presidentExecutiveOrderCooldown() {
  const min = PRESIDENT_EXECUTIVE_ORDER_MIN_INTERVAL;
  const max = PRESIDENT_EXECUTIVE_ORDER_MAX_INTERVAL;
  return min + Math.random() * Math.max(0, max - min);
}

function roundTo(value, places = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

function randomCadenceMatchMultiplier() {
  return SPECIAL_CADENCE_MATCH_MULT_MIN
    + Math.random() * Math.max(0, SPECIAL_CADENCE_MATCH_MULT_MAX - SPECIAL_CADENCE_MATCH_MULT_MIN);
}

function randomBellRatio(maxAbs = SPECIAL_CADENCE_JITTER_MAX, sampleCount = SPECIAL_CADENCE_JITTER_BELL_SAMPLES) {
  const samples = Math.max(1, Math.floor(Number(sampleCount) || 1));
  const limit = Math.max(0, Number(maxAbs) || 0);
  if (limit <= 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples; i += 1) sum += Math.random();
  const centered = ((sum / samples) - 0.5) * 2;
  return clamp(centered, -1, 1) * limit;
}

function randomCadenceJitterRatio() {
  return randomBellRatio(SPECIAL_CADENCE_JITTER_MAX, SPECIAL_CADENCE_JITTER_BELL_SAMPLES);
}

function randomBasicSpecialBaseEvery() {
  const min = Math.max(1, BASIC_SPECIAL_SHARED_BASE_CENTER - BASIC_SPECIAL_SHARED_BASE_VARIANCE);
  const max = Math.max(min, BASIC_SPECIAL_SHARED_BASE_CENTER + BASIC_SPECIAL_SHARED_BASE_VARIANCE);
  return min + Math.random() * (max - min);
}

function randomBasicSpecialBaseEveryByType() {
  return Object.fromEntries(
    BASIC_SPECIAL_SPAWN_TYPES.map((type) => [type, roundTo(randomBasicSpecialBaseEvery(), 3)])
  );
}

function randomTier2SpecialBaseEvery() {
  const min = Math.max(1, Number(TIER2_SPECIAL_BASE_EVERY_MIN) || 1);
  const max = Math.max(min, Number(TIER2_SPECIAL_BASE_EVERY_MAX) || min);
  return min + Math.random() * (max - min);
}

function randomTier2SpecialBaseEveryForType(type = null) {
  const key = typeof type === 'string' ? type : '';
  const base = randomTier2SpecialBaseEvery();
  if (key === 'candle') return base * CANDLE_TIER2_CADENCE_MULT;
  return base;
}

function randomTier2SpecialBaseEveryByType() {
  return Object.fromEntries(
    TIER2_SPECIAL_SPAWN_TYPES.map((type) => [type, roundTo(randomTier2SpecialBaseEveryForType(type), 3)])
  );
}

function randomSpecialBaseChanceByType() {
  const values = {};
  for (const type of SPECIAL_RANDOM_CHANCE_TYPES) {
    if (BASIC_SPECIAL_TYPE_SET.has(type)) {
      values[type] = roundTo(
        BASIC_SPECIAL_BASE_CHANCE_MIN + Math.random() * (BASIC_SPECIAL_BASE_CHANCE_MAX - BASIC_SPECIAL_BASE_CHANCE_MIN),
        3
      );
      continue;
    }
    if (TIER2_SPECIAL_TYPE_SET.has(type)) {
      values[type] = roundTo(
        TIER2_SPECIAL_BASE_CHANCE_MIN + Math.random() * (TIER2_SPECIAL_BASE_CHANCE_MAX - TIER2_SPECIAL_BASE_CHANCE_MIN),
        3
      );
      continue;
    }
    values[type] = roundTo(Number(specialSpawnBaseChanceForType(type)) || 0, 3);
  }
  return values;
}

function finiteOrNull(value, places = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

function normalizeDebugConfig(raw = null) {
  const cfg = (raw && typeof raw === 'object') ? raw : {};
  const enabled = Boolean(cfg.enabled);
  const applyTo = (cfg.applyTo === 'left' || cfg.applyTo === 'right') ? cfg.applyTo : 'both';
  const spawnRateMultiplier = clamp(Number(cfg.spawnRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX);
  const specialSpawnRateMultiplier = clamp(Number(cfg.specialSpawnRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX);
  const resourceRateMultiplier = clamp(Number(cfg.resourceRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX);
  const powerDropRateMultiplier = clamp(Number(cfg.powerDropRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX);
  const startingGoldRaw = Number(cfg.startingGold);
  const startingGold = Number.isFinite(startingGoldRaw)
    ? Math.floor(startingGoldRaw)
    : null;
  const colliderDebug = Boolean(cfg.colliderDebug);
  const heroAbilityRapidTest = Boolean(cfg.heroAbilityRapidTest);
  const candleChanceBonus = clamp(Number(cfg.candleChanceBonus) || 0, DEBUG_CANDLE_BONUS_MIN, DEBUG_CANDLE_BONUS_MAX);
  const forcedSpecialType = (typeof cfg.forceSpecialType === 'string' && DEBUG_FORCE_SPECIAL_TYPES.has(cfg.forceSpecialType))
    ? cfg.forceSpecialType
    : null;
  const forceSpecialMinAlive = Math.max(1, Math.min(12, Math.floor(Number(cfg.forceSpecialMinAlive) || 1)));
  const specialChanceOverridesSource = (cfg.specialChanceOverrides && typeof cfg.specialChanceOverrides === 'object')
    ? cfg.specialChanceOverrides
    : {};
  const specialChanceOverrides = {};
  for (const type of SPECIAL_SPAWN_QUEUE_ORDER) {
    const rawValue = specialChanceOverridesSource[type];
    const raw = rawValue == null ? NaN : Number(rawValue);
    specialChanceOverrides[type] = Number.isFinite(raw)
      ? clamp(raw, DEBUG_SPECIAL_OVERRIDE_MIN, DEBUG_SPECIAL_OVERRIDE_MAX)
      : null;
  }

  const upgrades = {};
  const source = (cfg.upgrades && typeof cfg.upgrades === 'object') ? cfg.upgrades : {};
  for (const type of UPGRADE_TYPES) {
    const cap = UPGRADE_LEVEL_CAPS[type];
    const value = Math.max(0, Math.floor(Number(source[type]) || 0));
    upgrades[type] = Number.isFinite(cap) ? Math.min(cap, value) : value;
  }
  if (upgrades.dragonSuperBreathLevel > 0 && upgrades.dragonLevel <= 0) upgrades.dragonLevel = 1;

  return {
    enabled,
    applyTo,
    spawnRateMultiplier,
    specialSpawnRateMultiplier,
    resourceRateMultiplier,
    powerDropRateMultiplier,
    candleChanceBonus,
    forceSpecialType: forcedSpecialType,
    forceSpecialMinAlive,
    startingGold,
    colliderDebug,
    heroAbilityRapidTest,
    specialChanceOverrides,
    upgrades,
  };
}

function serializeSideState(side) {
  const state = side || {};
  const archerPulls = Array.isArray(state.archerPulls) ? state.archerPulls : [];
  const specialRollByTypeRaw = state.specialRollByType && typeof state.specialRollByType === 'object'
    ? state.specialRollByType
    : {};
  const specialSpawnProgressByTypeRaw = state.specialSpawnProgressByType && typeof state.specialSpawnProgressByType === 'object'
    ? state.specialSpawnProgressByType
    : {};
  const specialSpawnCadenceByTypeRaw = state.specialSpawnCadenceByType && typeof state.specialSpawnCadenceByType === 'object'
    ? state.specialSpawnCadenceByType
    : {};
  const specialBasicBaseEveryByTypeRaw = state.specialBasicBaseEveryByType && typeof state.specialBasicBaseEveryByType === 'object'
    ? state.specialBasicBaseEveryByType
    : {};
  const specialBaseChanceByTypeRaw = state.specialBaseChanceByType && typeof state.specialBaseChanceByType === 'object'
    ? state.specialBaseChanceByType
    : {};
  const specialTier2BaseEveryByTypeRaw = state.specialTier2BaseEveryByType && typeof state.specialTier2BaseEveryByType === 'object'
    ? state.specialTier2BaseEveryByType
    : {};
  const specialRollByType = {};
  const specialSpawnProgressByType = {};
  const specialSpawnCadenceByType = {};
  const specialBasicBaseEveryByType = {};
  const specialBaseChanceByType = {};
  const specialTier2BaseEveryByType = {};
  for (const type of SPECIAL_SPAWN_QUEUE_ORDER) {
    const entry = specialRollByTypeRaw[type];
    specialRollByType[type] = {
      success: typeof entry?.success === 'boolean' ? entry.success : null,
      chance: finiteOrNull(entry?.chance, 3),
      displayChance: finiteOrNull(entry?.displayChance, 3),
      debuffLoss: finiteOrNull(entry?.debuffLoss, 3),
      debuffCausedFail: typeof entry?.debuffCausedFail === 'boolean' ? entry.debuffCausedFail : null,
      roll: finiteOrNull(entry?.roll, 3),
    };
    specialSpawnProgressByType[type] = finiteOrNull(specialSpawnProgressByTypeRaw[type], 3);
  }
  for (const type of SPECIAL_CADENCE_TRACKED_TYPES) {
    const entry = specialSpawnCadenceByTypeRaw[type];
    specialSpawnCadenceByType[type] = {
      baseEvery: finiteOrNull(entry?.baseEvery, 3),
      currentEvery: finiteOrNull(entry?.currentEvery, 3),
      matchMultiplier: finiteOrNull(entry?.matchMultiplier, 3),
      jitterRatio: finiteOrNull(entry?.jitterRatio, 3),
      deltaRatio: finiteOrNull(entry?.deltaRatio, 3),
      progress: finiteOrNull(entry?.progress, 3),
      remainingSpawns: finiteOrNull(entry?.remainingSpawns, 3),
      comboBoostSecondsCurrentCycle: finiteOrNull(entry?.comboBoostSecondsCurrentCycle, 3),
    };
  }
  for (const type of BASIC_SPECIAL_SPAWN_TYPES) {
    specialBasicBaseEveryByType[type] = finiteOrNull(specialBasicBaseEveryByTypeRaw[type], 3);
  }
  for (const type of SPECIAL_RANDOM_CHANCE_TYPES) {
    specialBaseChanceByType[type] = finiteOrNull(specialBaseChanceByTypeRaw[type], 3);
  }
  for (const type of TIER2_SPECIAL_SPAWN_TYPES) {
    specialTier2BaseEveryByType[type] = finiteOrNull(specialTier2BaseEveryByTypeRaw[type], 3);
  }
  return {
    towerHp: roundTo(state.towerHp, 1),
    gold: roundTo(state.gold, 1),
    goldEarnedTotal: roundTo(state.goldEarnedTotal, 1),
    arrowResourceGoldCollected: roundTo(state.arrowResourceGoldCollected, 1),
    diggerResourceGoldCollected: roundTo(state.diggerResourceGoldCollected, 1),
    minionDamageGoldCollected: roundTo(state.minionDamageGoldCollected, 1),
    arrowShotGoldCurrent: roundTo(state.arrowShotGoldCurrent, 1),
    economyLevel: Math.max(0, Math.round(Number(state.economyLevel) || 0)),
    nextEcoCost: Math.max(0, Math.round(Number(state.nextEcoCost) || 0)),
    unitLevel: Math.max(0, Math.round(Number(state.unitLevel) || 0)),
    unitHpLevel: Math.max(0, Math.round(Number(state.unitHpLevel) || 0)),
    volleyLevel: Math.max(0, Math.round(Number(state.volleyLevel) || 0)),
    spawnLevel: Math.max(0, Math.round(Number(state.spawnLevel) || 0)),
    resourceLevel: Math.max(0, Math.round(Number(state.resourceLevel) || 0)),
    powerLevel: Math.max(0, Math.round(Number(state.powerLevel) || 0)),
    balloonLevel: Math.max(0, Math.round(Number(state.balloonLevel) || 0)),
    dragonLevel: Math.max(0, Math.round(Number(state.dragonLevel) || 0)),
    dragonSuperBreathLevel: Math.max(0, Math.round(Number(state.dragonSuperBreathLevel) || 0)),
    stoneGolemAncientCoreLevel: Math.max(0, Math.round(Number(state.stoneGolemAncientCoreLevel) || 0)),
    heroDestinedChampionLevel: Math.max(0, Math.round(Number(state.heroDestinedChampionLevel) || 0)),
    shieldDarkMetalLevel: Math.max(0, Math.round(Number(state.shieldDarkMetalLevel) || 0)),
    monkHealCircleLevel: Math.max(0, Math.round(Number(state.monkHealCircleLevel) || 0)),
    necroExpertSummonerLevel: Math.max(0, Math.round(Number(state.necroExpertSummonerLevel) || 0)),
    riderSuperHorseLevel: Math.max(0, Math.round(Number(state.riderSuperHorseLevel) || 0)),
    diggerGoldFinderLevel: Math.max(0, Math.round(Number(state.diggerGoldFinderLevel) || 0)),
    gunnerSkyCannonLevel: Math.max(0, Math.round(Number(state.gunnerSkyCannonLevel) || 0)),
    presidentExecutiveOrderLevel: Math.max(0, Math.round(Number(state.presidentExecutiveOrderLevel) || 0)),
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
    pendingShotPowerBySlot: Array.isArray(state.pendingShotPowerBySlot)
      ? state.pendingShotPowerBySlot.map((entry) => ({
        power: entry?.power || null,
        shots: Math.max(0, Math.round(Number(entry?.shots) || 0)),
      }))
      : [],
    pendingShotPower: state.pendingShotPower || null,
    pendingShotPowerShots: Math.max(0, Math.round(Number(state.pendingShotPowerShots) || 0)),
    arrowsFired: Math.max(0, Math.round(Number(state.arrowsFired) || 0)),
    arrowHits: Math.max(0, Math.round(Number(state.arrowHits) || 0)),
    comboHitStreak: Math.max(0, Math.round(Number(state.comboHitStreak) || 0)),
    minionCd: roundTo(state.minionCd, 2),
    spawnCount: Math.max(0, Math.round(Number(state.spawnCount) || 0)),
    candleCd: roundTo(state.candleCd, 2),
    candleSpawnInSpawns: finiteOrNull(state.candleSpawnInSpawns, 3),
    candleActive: Boolean(state.candleActive),
    candleRollSuccess: typeof state.candleRollSuccess === 'boolean' ? state.candleRollSuccess : null,
    candleRollChance: finiteOrNull(state.candleRollChance, 3),
    candleRollValue: finiteOrNull(state.candleRollValue, 3),
    specialFailType: typeof state.specialFailType === 'string' ? state.specialFailType : null,
    specialFailTtl: roundTo(state.specialFailTtl, 2),
    specialRollType: typeof state.specialRollType === 'string' ? state.specialRollType : null,
    specialRollSuccess: typeof state.specialRollSuccess === 'boolean' ? state.specialRollSuccess : null,
    specialRollDisplayChance: finiteOrNull(state.specialRollDisplayChance, 3),
    specialRollChance: finiteOrNull(state.specialRollChance, 3),
    specialRollDebuffLoss: finiteOrNull(state.specialRollDebuffLoss, 3),
    specialRollDebuffCausedFail: typeof state.specialRollDebuffCausedFail === 'boolean' ? state.specialRollDebuffCausedFail : null,
    specialRollValue: finiteOrNull(state.specialRollValue, 3),
    specialRollTtl: roundTo(state.specialRollTtl, 2),
    specialRollByType,
    specialSpawnProgressByType,
    specialSpawnCadenceByType,
    specialBasicBaseEveryByType,
    specialBaseChanceByType,
    specialTier2BaseEveryByType,
    specialBasicSharedBaseEvery: finiteOrNull(state.specialBasicSharedBaseEvery, 3),
    towerDamagedOnce: Boolean(state.towerDamagedOnce),
    towerHeroRescueUsed: Boolean(state.towerHeroRescueUsed),
    towerGolemRescueUsed: Boolean(state.towerGolemRescueUsed),
    debugSpawnRateMultiplier: roundTo(state.debugSpawnRateMultiplier, 2),
    debugSpecialSpawnRateMultiplier: roundTo(state.debugSpecialSpawnRateMultiplier, 2),
    debugSpecialChanceOverrides: Object.fromEntries(
      SPECIAL_SPAWN_QUEUE_ORDER.map((type) => [type, finiteOrNull(state?.debugSpecialChanceOverrides?.[type], 3)])
    ),
    debugCandleChanceBonus: roundTo(state.debugCandleChanceBonus, 2),
    debugHeroAbilityRapidTest: Boolean(state.debugHeroAbilityRapidTest),
    debugForceSpecialType: typeof state.debugForceSpecialType === 'string' ? state.debugForceSpecialType : null,
    debugForceSpecialMinAlive: Math.max(0, Math.round(Number(state.debugForceSpecialMinAlive) || 0)),
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

function syncPendingShotPowerState(side) {
  if (!side || !Array.isArray(side.pendingShotPowerBySlot)) {
    side.pendingShotPower = null;
    side.pendingShotPowerShots = 0;
    return;
  }
  let primaryPower = null;
  let totalShots = 0;
  for (const entry of side.pendingShotPowerBySlot) {
    if (entry && Number.isFinite(entry.shots) && entry.shots > 0) {
      if (!primaryPower) primaryPower = entry.power;
      totalShots += entry.shots;
    }
  }
  side.pendingShotPower = primaryPower;
  side.pendingShotPowerShots = totalShots;
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
    goldEarnedTotal: 0,
    arrowResourceGoldCollected: 0,
    diggerResourceGoldCollected: 0,
    minionDamageGoldCollected: 0,
    arrowShotGoldCurrent: 0,
    arrowShotVolleySeq: 0,
    pendingArrowVolleyId: 0,
    arrowShotGoldActiveVolleyId: 0,
    economyLevel: 0,
    nextEcoCost: 120,
    unitLevel: 1,
    unitHpLevel: 1,
    volleyLevel: 0,
    spawnLevel: 1,
    resourceLevel: 1,
    powerLevel: 1,
    balloonLevel: 0,
    dragonLevel: 0,
    dragonSuperBreathLevel: 0,
    stoneGolemAncientCoreLevel: 0,
    heroDestinedChampionLevel: 0,
    shieldDarkMetalLevel: 0,
    monkHealCircleLevel: 0,
    necroExpertSummonerLevel: 0,
    riderSuperHorseLevel: 0,
    diggerGoldFinderLevel: 0,
    gunnerSkyCannonLevel: 0,
    presidentExecutiveOrderLevel: 0,
    superMinionLevel: 0,
    upgradeCharge: 0,
    upgradeChargeMax: Math.max(1, Math.round(100 * UPGRADE_DEBT_MULT)),
    lastUpgradeSelectionSource: null,
    arrowDamageGoldRemainder: 0,
    upgradeAutoPickAt: null,
    archerAimY: archerPulls[0].archerAimY,
    pullX: archerPulls[0].pullX,
    pullY: 0,
    archerPulls,
    archerVolleyIndex: 0,
    shotCd: 1,
    pendingShotPowerBySlot: archerPulls.map(() => ({ power: null, shots: 0 })),
    pendingShotPower: null,
    pendingShotPowerShots: 0,
    pendingSpecialSpawns: [],
    specialSpawnProgressByType: {},
    specialSpawnCadenceByType: {},
    arrowsFired: 0,
    arrowHits: 0,
    comboHitStreak: 0,
    minionCd: 0,
    spawnCount: 0,
    candleCd: 0,
    candleSpawnInSpawns: 0,
    candleActive: false,
    candleRollSuccess: null,
    candleRollChance: null,
    candleRollValue: null,
    specialFailType: null,
    specialFailTtl: 0,
    specialRollType: null,
    specialRollSuccess: null,
    specialRollDisplayChance: null,
    specialRollChance: null,
    specialRollDebuffLoss: null,
    specialRollDebuffCausedFail: null,
    specialRollValue: null,
    specialRollTtl: 0,
    specialRollByType: {},
    specialBasicBaseEveryByType: {},
    specialBaseChanceByType: {},
    specialTier2BaseEveryByType: {},
    specialBasicSharedBaseEvery: null,
    towerDamagedOnce: false,
    towerHeroRescueUsed: false,
    towerGolemRescueUsed: false,
    heroLineCd: 0,
    debugSpawnRateMultiplier: 1,
    debugSpecialSpawnRateMultiplier: 1,
    debugSpecialChanceOverrides: {},
    debugCandleChanceBonus: 0,
    debugHeroAbilityRapidTest: false,
    debugForceSpecialType: null,
    debugForceSpecialMinAlive: 0,
  };
}

class GameRoom {
  constructor(id, baseUrl, options = {}) {
    this.mode = options?.mode === '2v2' ? '2v2' : '1v1';
    this.themeMode = DEFAULT_THEME_MODE;
    this.archersPerSide = this.mode === '2v2' ? 2 : 1;
    this.debugConfig = normalizeDebugConfig(options?.debugConfig || null);
    const left = makeSideState('left', this.archersPerSide);
    const right = makeSideState('right', this.archersPerSide);

    this.id = id;
    this.baseUrl = baseUrl;
    this.display = null;
    this.players = { left: [], right: [] };
    this.committeePlayers = { left: [], right: [] };
    this.cpuSlots = this.createCpuSlots();
    this.started = false;
    this.gameOver = false;
    this.winner = null;
    this.nextBalancedJoinSide = 'left';
    this.nextCommitteeJoinSide = 'left';
    this.t = 0;
    this.totalFeedingActive = false;
    this.cpuAimState = new Map();
    this.committeeVoteSeq = 1;
    this.committeeVotes = {
      left: this.createCommitteeVoteState('left'),
      right: this.createCommitteeVoteState('right'),
    };
    this.committeeVoteFx = {
      left: null,
      right: null,
    };
    this.upgradeSelectionFx = {
      left: null,
      right: null,
    };

    this.left = left;
    this.right = right;
    this.basicSpecialBaseEveryByType = randomBasicSpecialBaseEveryByType();
    this.specialBaseChanceByType = randomSpecialBaseChanceByType();
    this.tier2SpecialBaseEveryByType = randomTier2SpecialBaseEveryByType();
    this.left.specialBasicBaseEveryByType = { ...this.basicSpecialBaseEveryByType };
    this.right.specialBasicBaseEveryByType = { ...this.basicSpecialBaseEveryByType };
    this.left.specialBaseChanceByType = { ...this.specialBaseChanceByType };
    this.right.specialBaseChanceByType = { ...this.specialBaseChanceByType };
    this.left.specialTier2BaseEveryByType = { ...this.tier2SpecialBaseEveryByType };
    this.right.specialTier2BaseEveryByType = { ...this.tier2SpecialBaseEveryByType };
    this.basicSpecialSharedBaseEvery = this.basicSpecialBaseEveryByType[BASIC_SPECIAL_SPAWN_TYPES[0]] || null;
    this.left.specialBasicSharedBaseEvery = this.basicSpecialSharedBaseEvery;
    this.right.specialBasicSharedBaseEvery = this.basicSpecialSharedBaseEvery;
    this.specialCadenceSharedRollByType = {};
    for (const type of SPECIAL_CADENCE_TRACKED_TYPES) this.specialCadenceSharedRollForType(type);

    this.arrows = [];
    this.minions = [];
    this.resources = [];
    this.shotPowers = [];
    this.cannonBalls = [];
    this.totalFeedingGrainProjectiles = [];
    this.heroFoodRainImpacts = [];
    this.heroRumblePulses = [];
    this.upgradeCards = [];
    this.sfxEvents = [];
    this.damageEvents = [];
    this.lineEvents = [];
    this.sharedShotCd = SHOT_INTERVAL;
    this.nextArrowPrioritySide = 'left';
    this.activePresidents = { left: [], right: [] };
    this.candleCarrierCounts = { left: 0, right: 0 };
    this.debugResourceRateMultiplier = 1;
    this.debugPowerDropRateMultiplier = 1;
    this.debugColliderOverlay = false;
    this.worldInfo = {
      w: WORLD_W,
      h: WORLD_H,
      groundY: GROUND_Y,
      towerY: TOWER_Y,
      towerLeftX: TOWER_X_LEFT,
      towerRightX: TOWER_X_RIGHT,
    };
    this.displayPrimaryPlayers = { left: null, right: null };
    this.displayDebug = { colliderOverlay: false };
    this.displayCandles = [null, null];
    this.displaySnapshot = {
      id: this.id,
      mode: this.mode,
      themeMode: this.themeMode,
      archersPerSide: this.archersPerSide,
      requiredPlayers: this.requiredPlayers(),
      playerCount: 0,
      started: false,
      gameOver: false,
      winner: null,
      t: 0,
      world: this.worldInfo,
      left: this.left,
      right: this.right,
      arrows: this.arrows,
      minions: this.minions,
      candles: this.displayCandles,
      candleScorches: this.candleScorches,
      resources: this.resources,
      shotPowers: this.shotPowers,
      cannonBalls: this.cannonBalls,
      totalFeedingGrainProjectiles: this.totalFeedingGrainProjectiles,
      upgradeCards: this.upgradeCards,
      players: this.players,
      committeePlayers: this.committeePlayers,
      cpuSlots: this.cpuSlots,
      committeeVotes: this.committeeVotes,
      committeeVoteFx: this.committeeVoteFx,
      upgradeSelectionFx: this.upgradeSelectionFx,
      ready: null,
      primaryPlayers: this.displayPrimaryPlayers,
      postGameReport: null,
      debug: this.displayDebug,
      hasDisplay: false,
    };

    this.nextResourceAt = 0;
    this.nextResourceTelegraphAt = 0;
    this.pendingResourceInterval = RESOURCE_SPAWN_START_MIN_SECONDS;
    this.pendingResourceSpawns = null;
    this.nextShotPowerAt = 0;
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
    this.applyDebugConfigToRoom(false);
    this.scheduleNextResourceSpawn(this.t);
    this.scheduleNextShotPower(this.t);

    this.seedUpgradeCards();
    this.resetMatchReport();
  }

  snapshotForDisplay() {
    const snapshot = this.displaySnapshot;
    snapshot.mode = this.mode;
    snapshot.themeMode = this.themeMode;
    snapshot.archersPerSide = this.archersPerSide;
    snapshot.requiredPlayers = this.requiredPlayers();
    snapshot.playerCount = this.totalPlayers();
    snapshot.started = this.started;
    snapshot.gameOver = this.gameOver;
    snapshot.winner = this.winner;
    snapshot.t = this.t;
    snapshot.left = this.left;
    snapshot.right = this.right;
    snapshot.arrows = this.arrows;
    snapshot.minions = this.minions;
    this.displayCandles[0] = this.candles.left;
    this.displayCandles[1] = this.candles.right;
    snapshot.candles = this.displayCandles;
    snapshot.candleScorches = this.candleScorches;
    snapshot.resources = this.resources;
    snapshot.shotPowers = this.shotPowers;
    snapshot.cannonBalls = this.cannonBalls;
    snapshot.totalFeedingGrainProjectiles = this.totalFeedingGrainProjectiles;
    snapshot.upgradeCards = this.upgradeCards;
    snapshot.players = this.players;
    snapshot.committeePlayers = this.committeePlayers;
    snapshot.cpuSlots = this.cpuSlots;
    snapshot.committeeVotes = this.buildCommitteeVoteSnapshot();
    snapshot.committeeVoteFx = this.buildCommitteeVoteFxSnapshot();
    snapshot.upgradeSelectionFx = this.buildUpgradeSelectionFxSnapshot();
    snapshot.ready = this.readySummary();
    this.displayPrimaryPlayers.left = this.players.left[0] || null;
    this.displayPrimaryPlayers.right = this.players.right[0] || null;
    snapshot.primaryPlayers = this.displayPrimaryPlayers;
    snapshot.postGameReport = this.gameOver ? this.buildPostGameReport() : null;
    this.displayDebug.colliderOverlay = Boolean(this.debugColliderOverlay);
    snapshot.debug = this.displayDebug;
    snapshot.hasDisplay = Boolean(this.display);
    return snapshot;
  }

  defaultPlayerNameForSide(sideName, slot = 0) {
    return defaultArcherName(sideName, slot, this.themeMode);
  }

  renameDefaultPlayerNamesForTheme() {
    for (const sideName of ['left', 'right']) {
      const sidePlayers = Array.isArray(this.players?.[sideName]) ? this.players[sideName] : [];
      for (let i = 0; i < sidePlayers.length; i += 1) {
        const player = sidePlayers[i];
        if (!player || !isDefaultPlayerName(player.name)) continue;
        player.name = this.defaultPlayerNameForSide(sideName, Number.isFinite(player.slot) ? player.slot : i);
      }
    }
  }

  setThemeMode(nextThemeMode, options = {}) {
    const nextMode = normalizeThemeMode(nextThemeMode);
    if (this.themeMode === nextMode) return { changed: false, themeMode: this.themeMode };
    this.themeMode = nextMode;
    if (options?.renamePlayers !== false) this.renameDefaultPlayerNamesForTheme();
    if (options?.renamePlayers !== false) this.renameDefaultCommitteeNamesForTheme();
    return { changed: true, themeMode: this.themeMode };
  }

  renameDefaultCommitteeNamesForTheme() {
    for (const sideName of ['left', 'right']) {
      const committee = Array.isArray(this.committeePlayers?.[sideName]) ? this.committeePlayers[sideName] : [];
      for (let i = 0; i < committee.length; i += 1) {
        const member = committee[i];
        if (!member || !isDefaultCommitteeName(member.name)) continue;
        const ordinal = Number.isFinite(member.ordinal) ? member.ordinal : (i + 1);
        const nextName = defaultCommitteeName(sideName, ordinal);
        member.name = nextName;
        member.voterName = nextName;
      }
    }
  }

  createCommitteeVoteState(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    return {
      side,
      active: false,
      startedAt: 0,
      resolveAt: 0,
      options: [],
      votesByPlayerId: {},
    };
  }

  resetCommitteeVoteState(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    this.committeeVotes[side] = this.createCommitteeVoteState(side);
  }

  buildCommitteeVoteTallies(sideName = 'left', voteState = null) {
    const side = sideName === 'right' ? 'right' : 'left';
    const state = voteState || this.committeeVotes?.[side];
    if (!state?.active || !Array.isArray(state.options) || !state.options.length) return [];
    const members = this.sideCommitteePlayers(side);
    const memberById = new Map(members.map((member) => [member.id, member]));
    return state.options.map((option) => {
      const voters = [];
      let voteCount = 0;
      for (const [playerId, optionId] of Object.entries(state.votesByPlayerId || {})) {
        if (String(optionId) !== String(option.id)) continue;
        const member = memberById.get(playerId);
        if (!member) continue;
        voteCount += 1;
        voters.push(member.voterName || member.name || 'Voter');
      }
      return {
        id: option.id,
        type: option.type,
        level: Math.max(0, Number(option.level) || 0),
        votes: voteCount,
        voters,
      };
    });
  }

  sideCommitteePlayers(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    return Array.isArray(this.committeePlayers?.[side]) ? this.committeePlayers[side] : [];
  }

  committeeCountForSide(sideName = 'left') {
    return this.sideCommitteePlayers(sideName).length;
  }

  hasCommitteePlayers(sideName = 'left') {
    return this.committeeCountForSide(sideName) > 0;
  }

  allHumanPlayers() {
    return [
      ...(Array.isArray(this.players?.left) ? this.players.left : []),
      ...(Array.isArray(this.players?.right) ? this.players.right : []),
      ...(Array.isArray(this.committeePlayers?.left) ? this.committeePlayers.left : []),
      ...(Array.isArray(this.committeePlayers?.right) ? this.committeePlayers.right : []),
    ];
  }

  readySummary(socketId = null) {
    const archers = [...this.players.left, ...this.players.right];
    let readyCount = 0;
    for (const p of archers) {
      if (p?.ready !== false) readyCount += 1;
    }
    const connected = archers.length;
    const allReady = connected <= 0 ? true : readyCount >= connected;
    const committee = [...this.sideCommitteePlayers('left'), ...this.sideCommitteePlayers('right')];
    const committeeConnected = committee.length;
    const committeeReady = committee.filter((p) => p?.ready !== false).length;
    const people = this.allHumanPlayers();
    const self = socketId ? people.find((p) => p?.id === socketId) : null;
    const selfReady = self
      ? ((self.role === 'committee') ? true : (self.ready !== false))
      : false;
    return {
      connected,
      ready: readyCount,
      waiting: Math.max(0, connected - readyCount),
      allReady,
      selfReady,
      committeeConnected,
      committeeReady,
    };
  }

  allHumansReady() {
    const summary = this.readySummary();
    return summary.connected <= 0 ? true : summary.allReady;
  }

  committeePlayerBySocket(socketId) {
    const leftPlayer = this.sideCommitteePlayers('left').find((p) => p.id === socketId);
    if (leftPlayer) return { side: 'left', slot: null, role: 'committee', player: leftPlayer };
    const rightPlayer = this.sideCommitteePlayers('right').find((p) => p.id === socketId);
    if (rightPlayer) return { side: 'right', slot: null, role: 'committee', player: rightPlayer };
    return null;
  }

  controllerBySocket(socketId) {
    const archer = this.playerBySocket(socketId);
    if (archer) return { ...archer, role: 'archer' };
    return this.committeePlayerBySocket(socketId);
  }

  createCpuSlots() {
    return {
      left: Array.from({ length: this.archersPerSide }, () => false),
      right: Array.from({ length: this.archersPerSide }, () => false),
    };
  }

  normalizeCpuSlotsShape(raw = null) {
    const source = raw && typeof raw === 'object' ? raw : this.cpuSlots;
    const next = {
      left: Array.from({ length: this.archersPerSide }, (_unused, idx) => Boolean(source?.left?.[idx])),
      right: Array.from({ length: this.archersPerSide }, (_unused, idx) => Boolean(source?.right?.[idx])),
    };
    this.cpuSlots = next;
    return next;
  }

  setCpuSlots(nextSlots = null) {
    this.normalizeCpuSlotsShape(nextSlots);
    this.started = this.isReadyToStart();
  }

  hasHumanInSlot(sideName, slot = 0) {
    const side = sideName === 'right' ? 'right' : 'left';
    const lane = Math.max(0, Math.floor(Number(slot) || 0));
    return this.players[side].some((p) => Number(p?.slot) === lane);
  }

  isCpuSlotEnabled(sideName, slot = 0) {
    const side = sideName === 'right' ? 'right' : 'left';
    const lane = Math.max(0, Math.floor(Number(slot) || 0));
    if (lane >= this.archersPerSide) return false;
    return Boolean(this.cpuSlots?.[side]?.[lane]);
  }

  setCpuSlot(sideName, slot = 0, enabled = false) {
    const side = sideName === 'right' ? 'right' : 'left';
    const lane = Math.floor(Number(slot));
    if (!Number.isFinite(lane) || lane < 0 || lane >= this.archersPerSide) return { ok: false };
    if (Boolean(enabled) && this.hasHumanInSlot(side, lane)) {
      return { ok: false, message: 'Controller already connected in that slot.' };
    }
    this.normalizeCpuSlotsShape();
    this.cpuSlots[side][lane] = Boolean(enabled);
    this.started = this.isReadyToStart();
    return { ok: true };
  }

  filledSlotsForSide(sideName) {
    const side = sideName === 'right' ? 'right' : 'left';
    let count = 0;
    for (let slot = 0; slot < this.archersPerSide; slot += 1) {
      if (this.hasHumanInSlot(side, slot) || this.isCpuSlotEnabled(side, slot)) count += 1;
    }
    return count;
  }

  cpuSlotActive(sideName, slot = 0) {
    return this.isCpuSlotEnabled(sideName, slot) && !this.hasHumanInSlot(sideName, slot);
  }

  availableHumanJoinSlots(sideName) {
    const side = sideName === 'right' ? 'right' : 'left';
    const open = [];
    for (let slot = 0; slot < this.archersPerSide; slot += 1) {
      if (this.isCpuSlotEnabled(side, slot)) continue;
      if (this.hasHumanInSlot(side, slot)) continue;
      open.push(slot);
    }
    return open;
  }

  setDebugConfig(rawConfig = null) {
    this.debugConfig = normalizeDebugConfig(rawConfig || null);
    this.applyDebugConfigToRoom(true);
    return this.debugConfig;
  }

  resetMatchReport() {
    this.matchReport = {
      nextSampleAt: 0,
      timeline: [],
      upgrades: [],
      totals: {
        left: {
          arrowDamage: 0,
          unitDamage: 0,
          towerDamageDealt: 0,
          towerDamageTaken: 0,
          minionKills: 0,
          arrowResourceGoldCollected: 0,
          diggerResourceGoldCollected: 0,
          minionDamageGoldCollected: 0,
        },
        right: {
          arrowDamage: 0,
          unitDamage: 0,
          towerDamageDealt: 0,
          towerDamageTaken: 0,
          minionKills: 0,
          arrowResourceGoldCollected: 0,
          diggerResourceGoldCollected: 0,
          minionDamageGoldCollected: 0,
        },
      },
      luck: {
        left: {
          attempts: 0,
          expectedSuccess: 0,
          actualSuccess: 0,
          variance: 0,
          events: [],
        },
        right: {
          attempts: 0,
          expectedSuccess: 0,
          actualSuccess: 0,
          variance: 0,
          events: [],
        },
      },
    };
    this.postGameReportCache = null;
    this.recordMatchTimelineSample(true);
  }

  sideNameFromStateRef(sideRef) {
    if (sideRef === this.left) return 'left';
    if (sideRef === this.right) return 'right';
    return null;
  }

  sideUpgradeScore(sideRef) {
    if (!sideRef) return 0;
    let score = 0;
    for (const type of UPGRADE_TYPES) {
      const rule = UPGRADE_COST_RULES[type] || { start: 0 };
      const level = Math.max(0, Number(sideRef[type]) || 0);
      score += Math.max(0, level - Math.max(0, Number(rule.start) || 0));
    }
    return score;
  }

  recordMatchTimelineSample(force = false) {
    if (!this.matchReport) return;
    if (!force && this.t < this.matchReport.nextSampleAt) return;
    const point = {
      t: roundTo(this.t, 2),
      leftGold: roundTo(this.left?.gold, 1),
      rightGold: roundTo(this.right?.gold, 1),
      leftGoldEarned: roundTo(this.left?.goldEarnedTotal, 1),
      rightGoldEarned: roundTo(this.right?.goldEarnedTotal, 1),
      leftTowerHp: roundTo(this.left?.towerHp, 1),
      rightTowerHp: roundTo(this.right?.towerHp, 1),
      leftUpgradeScore: this.sideUpgradeScore(this.left),
      rightUpgradeScore: this.sideUpgradeScore(this.right),
      leftArrowHits: Math.max(0, Math.round(Number(this.left?.arrowHits) || 0)),
      rightArrowHits: Math.max(0, Math.round(Number(this.right?.arrowHits) || 0)),
      leftArrowsFired: Math.max(0, Math.round(Number(this.left?.arrowsFired) || 0)),
      rightArrowsFired: Math.max(0, Math.round(Number(this.right?.arrowsFired) || 0)),
    };
    const timeline = this.matchReport.timeline;
    const last = timeline.length ? timeline[timeline.length - 1] : null;
    const sameMoment = last && Math.abs((Number(last.t) || 0) - point.t) <= 0.001;
    if (sameMoment) timeline[timeline.length - 1] = point;
    else timeline.push(point);
    if (this.matchReport.timeline.length > MATCH_MAX_TIMELINE_POINTS) {
      this.matchReport.timeline.splice(0, this.matchReport.timeline.length - MATCH_MAX_TIMELINE_POINTS);
    }
    const nextBase = force ? this.t : (this.matchReport.nextSampleAt + MATCH_SAMPLE_INTERVAL_SEC);
    this.matchReport.nextSampleAt = Math.max(this.t + 0.001, nextBase);
    this.postGameReportCache = null;
  }

  recordDamage(sourceSide, sourceType, amount) {
    const sideName = sourceSide === 'right' ? 'right' : (sourceSide === 'left' ? 'left' : null);
    if (!sideName || !this.matchReport) return;
    const value = Math.max(0, Number(amount) || 0);
    if (value <= 0) return;
    const type = sourceType === 'arrow' ? 'arrow' : 'unit';
    const totals = this.matchReport.totals?.[sideName];
    if (totals) {
      if (type === 'arrow') totals.arrowDamage += value;
      else totals.unitDamage += value;
    }
    this.postGameReportCache = null;
  }

  recordTowerDamage(victimSide, amount, sourceSide = null) {
    if (!this.matchReport) return;
    const victim = victimSide === 'right' ? 'right' : (victimSide === 'left' ? 'left' : null);
    if (!victim) return;
    const dmg = Math.max(0, Number(amount) || 0);
    if (dmg <= 0) return;
    const attacker = sourceSide === 'right' || sourceSide === 'left'
      ? sourceSide
      : (victim === 'left' ? 'right' : 'left');
    const victimTotals = this.matchReport.totals?.[victim];
    const attackerTotals = this.matchReport.totals?.[attacker];
    if (victimTotals) victimTotals.towerDamageTaken += dmg;
    if (attackerTotals) attackerTotals.towerDamageDealt += dmg;
    this.postGameReportCache = null;
  }

  recordMinionKill(killerSide) {
    const sideName = killerSide === 'right' ? 'right' : (killerSide === 'left' ? 'left' : null);
    if (!sideName || !this.matchReport) return;
    const totals = this.matchReport.totals?.[sideName];
    if (totals) totals.minionKills += 1;
    this.postGameReportCache = null;
  }

  recordUpgradeEvent(sideName, type, gain, level) {
    if (!this.matchReport) return;
    this.matchReport.upgrades.push({
      t: roundTo(this.t, 2),
      side: sideName === 'right' ? 'right' : 'left',
      type,
      gain: Math.max(0, Number(gain) || 0),
      level: Math.max(0, Math.round(Number(level) || 0)),
    });
    if (this.matchReport.upgrades.length > MATCH_MAX_UPGRADE_EVENTS) {
      this.matchReport.upgrades.splice(0, this.matchReport.upgrades.length - MATCH_MAX_UPGRADE_EVENTS);
    }
    this.postGameReportCache = null;
  }

  recordSpecialRoll(sideName, type, success, chance, roll, meta = null) {
    if (!this.matchReport) return;
    const side = sideName === 'right' ? 'right' : 'left';
    const luck = this.matchReport.luck?.[side];
    if (!luck) return;
    const p = clamp(Number(chance) || 0, 0, 1);
    luck.attempts += 1;
    luck.expectedSuccess += p;
    luck.actualSuccess += success ? 1 : 0;
    luck.variance += p * (1 - p);
    const event = {
      t: roundTo(this.t, 2),
      side,
      type,
      success: Boolean(success),
      chance: roundTo(p, 4),
      displayChance: finiteOrNull(meta?.displayChance, 4),
      debuffLoss: finiteOrNull(meta?.debuffLoss, 4),
      debuffCausedFail: Boolean(meta?.debuffCausedFail),
      roll: roundTo(Number(roll) || 0, 4),
    };
    luck.events.push(event);
    if (luck.events.length > MATCH_MAX_LUCK_EVENTS) {
      luck.events.splice(0, luck.events.length - MATCH_MAX_LUCK_EVENTS);
    }
    this.postGameReportCache = null;
  }

  buildPostGameReport() {
    if (!this.matchReport) return null;
    if (this.gameOver && this.postGameReportCache) return this.postGameReportCache;
    const timeline = Array.isArray(this.matchReport.timeline) ? this.matchReport.timeline : [];
    const lastSample = timeline.length ? timeline[timeline.length - 1] : null;
    if (!lastSample || Math.abs((Number(lastSample.t) || 0) - this.t) > 0.001) {
      this.recordMatchTimelineSample(true);
    }
    const packLuck = (sideName) => {
      const raw = this.matchReport.luck?.[sideName] || {};
      const attempts = Math.max(0, Math.round(Number(raw.attempts) || 0));
      const expectedSuccess = Math.max(0, Number(raw.expectedSuccess) || 0);
      const actualSuccess = Math.max(0, Number(raw.actualSuccess) || 0);
      const variance = Math.max(0, Number(raw.variance) || 0);
      const sigma = Math.sqrt(variance || 0);
      const zScore = sigma > 1e-6 ? (actualSuccess - expectedSuccess) / sigma : 0;
      return {
        attempts,
        expectedSuccess: roundTo(expectedSuccess, 3),
        actualSuccess: roundTo(actualSuccess, 3),
        variance: roundTo(variance, 3),
        zScore: roundTo(zScore, 3),
        events: Array.isArray(raw.events) ? raw.events.slice(-180) : [],
      };
    };

    const totals = this.matchReport.totals || { left: {}, right: {} };
    const report = {
      durationSec: roundTo(this.t, 2),
      timeline: Array.isArray(this.matchReport.timeline) ? this.matchReport.timeline.slice() : [],
      upgrades: Array.isArray(this.matchReport.upgrades) ? this.matchReport.upgrades.slice() : [],
      totals: {
        left: {
          arrowDamage: roundTo(totals.left?.arrowDamage, 2),
          unitDamage: roundTo(totals.left?.unitDamage, 2),
          towerDamageDealt: roundTo(totals.left?.towerDamageDealt, 2),
          towerDamageTaken: roundTo(totals.left?.towerDamageTaken, 2),
          minionKills: Math.max(0, Math.round(Number(totals.left?.minionKills) || 0)),
          arrowResourceGoldCollected: roundTo(totals.left?.arrowResourceGoldCollected, 1),
          diggerResourceGoldCollected: roundTo(totals.left?.diggerResourceGoldCollected, 1),
          minionDamageGoldCollected: roundTo(totals.left?.minionDamageGoldCollected, 1),
        },
        right: {
          arrowDamage: roundTo(totals.right?.arrowDamage, 2),
          unitDamage: roundTo(totals.right?.unitDamage, 2),
          towerDamageDealt: roundTo(totals.right?.towerDamageDealt, 2),
          towerDamageTaken: roundTo(totals.right?.towerDamageTaken, 2),
          minionKills: Math.max(0, Math.round(Number(totals.right?.minionKills) || 0)),
          arrowResourceGoldCollected: roundTo(totals.right?.arrowResourceGoldCollected, 1),
          diggerResourceGoldCollected: roundTo(totals.right?.diggerResourceGoldCollected, 1),
          minionDamageGoldCollected: roundTo(totals.right?.minionDamageGoldCollected, 1),
        },
      },
      luck: {
        left: packLuck('left'),
        right: packLuck('right'),
      },
    };
    if (this.gameOver) this.postGameReportCache = report;
    return report;
  }

  debugTargetSides() {
    const applyTo = this.debugConfig?.applyTo;
    if (applyTo === 'left' || applyTo === 'right') return [applyTo];
    return ['left', 'right'];
  }

  applyDebugConfigToRoom(refreshExisting = true) {
    const cfg = this.debugConfig || normalizeDebugConfig(null);
    const targets = new Set(cfg.enabled ? this.debugTargetSides() : []);
    const allSides = ['left', 'right'];
    this.debugColliderOverlay = Boolean(cfg.enabled && cfg.colliderDebug);

    this.debugResourceRateMultiplier = cfg.enabled
      ? clamp(Number(cfg.resourceRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX)
      : 1;
    this.debugPowerDropRateMultiplier = cfg.enabled
      ? clamp(Number(cfg.powerDropRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX)
      : 1;

    for (const sideName of allSides) {
      const side = this[sideName];
      if (!side) continue;
      if (!targets.has(sideName)) {
        side.debugSpawnRateMultiplier = 1;
        side.debugSpecialSpawnRateMultiplier = 1;
        side.debugSpecialChanceOverrides = {};
        side.debugCandleChanceBonus = 0;
        side.debugHeroAbilityRapidTest = false;
        side.debugForceSpecialType = null;
        side.debugForceSpecialMinAlive = 0;
        continue;
      }
      side.debugSpawnRateMultiplier = clamp(Number(cfg.spawnRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX);
      side.debugSpecialSpawnRateMultiplier = clamp(Number(cfg.specialSpawnRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX);
      side.debugSpecialChanceOverrides = {};
      for (const type of SPECIAL_SPAWN_QUEUE_ORDER) {
        const fallback = clamp(this.specialBaseChanceForType(type) ?? 0, DEBUG_SPECIAL_OVERRIDE_MIN, DEBUG_SPECIAL_OVERRIDE_MAX);
        const rawValue = cfg?.specialChanceOverrides?.[type];
        const raw = rawValue == null ? NaN : Number(rawValue);
        side.debugSpecialChanceOverrides[type] = Number.isFinite(raw)
          ? clamp(raw, DEBUG_SPECIAL_OVERRIDE_MIN, DEBUG_SPECIAL_OVERRIDE_MAX)
          : fallback;
      }
      side.debugCandleChanceBonus = clamp(Number(cfg.candleChanceBonus) || 0, DEBUG_CANDLE_BONUS_MIN, DEBUG_CANDLE_BONUS_MAX);
      side.debugHeroAbilityRapidTest = Boolean(cfg.heroAbilityRapidTest);
      side.debugForceSpecialType = cfg.forceSpecialType && DEBUG_FORCE_SPECIAL_TYPES.has(cfg.forceSpecialType)
        ? cfg.forceSpecialType
        : null;
      side.debugForceSpecialMinAlive = side.debugForceSpecialType
        ? Math.max(1, Math.min(12, Math.floor(Number(cfg.forceSpecialMinAlive) || 1)))
        : 0;
      if (Number.isFinite(cfg.startingGold)) {
        const startValue = Math.floor(Number(cfg.startingGold) || 0);
        side.upgradeCharge = startValue;
        if (side.upgradeCharge < 0) side.upgradeCharge = 0;
      }
      const up = cfg.upgrades || {};
      for (const type of UPGRADE_TYPES) {
        const cap = this.upgradeLevelCap(type);
        const raw = Math.max(0, Math.floor(Number(up[type]) || 0));
        side[type] = Number.isFinite(cap) ? Math.min(cap, raw) : raw;
      }
      if ((Number(side.dragonSuperBreathLevel) || 0) > 0 && (Number(side.dragonLevel) || 0) <= 0) {
        side.dragonLevel = 1;
      }
      side.candleSpawnInSpawns = this.statCandleEvery(side);
      side.candleCd = this.candleSpawnEtaSeconds(sideName);
      side.minionCd = Math.min(Number(side.minionCd) || 0, 0.16);
      side.specialFailType = null;
      side.specialFailTtl = 0;
      side.specialRollType = null;
      side.specialRollDisplayChance = null;
      side.specialRollChance = null;
      side.specialRollDebuffLoss = null;
      side.specialRollDebuffCausedFail = null;
      side.specialRollValue = null;
      side.specialRollTtl = 0;
      side.specialRollByType = {};
      side.pendingSpecialSpawns = [];
      side.specialSpawnProgressByType = {};
      side.specialSpawnCadenceByType = {};
    }
    for (const sideName of allSides) this.primeSpecialSpawnCadenceState(sideName, this.t);

    if (refreshExisting) {
      for (const sideName of allSides) this.refreshDebugMinionFlags(sideName);
      this.nextResourceAt = Math.min(
        Number(this.nextResourceAt) || this.t + RESOURCE_SPAWN_END_MAX_SECONDS,
        this.t + 0.4
      );
      this.nextResourceTelegraphAt = Math.max(this.t, this.nextResourceAt - RESOURCE_SPAWN_TELEGRAPH_DURATION);
      this.pendingResourceInterval = Math.max(0.05, this.nextResourceAt - this.t);
      this.pendingResourceSpawns = null;
      this.nextShotPowerAt = Math.min(Number(this.nextShotPowerAt) || this.t + 7, this.t + 0.6);
    }
  }

  refreshDebugMinionFlags(sideName) {
    const side = this[sideName];
    if (!side) return;
    for (const m of this.minions) {
      if (!m || m.removed || m.side !== sideName) continue;
      if (m.dragon) {
        m.dragonSuperBreathUpgraded = (Number(side.dragonSuperBreathLevel) || 0) > 0;
        if (!m.dragonSuperBreathUpgraded) m.dragonSuperBreathCd = DRAGON_SUPER_BREATH_INTERVAL + Math.random() * DRAGON_SUPER_BREATH_COOLDOWN_JITTER;
      }
      if (m.shieldBearer) m.shieldDarkMetalUpgraded = (Number(side.shieldDarkMetalLevel) || 0) > 0;
      if (m.monk) m.monkHealCircleUpgraded = (Number(side.monkHealCircleLevel) || 0) > 0;
      if (m.necrominion) m.necroExpertUpgraded = (Number(side.necroExpertSummonerLevel) || 0) > 0;
      if (m.gunner) {
        const gunnerLevel = Number(side.gunnerSkyCannonLevel) || 0;
        m.gunnerSkyCannonUpgraded = gunnerLevel > 0;
        m.gunnerFoodThrowUnlocked = gunnerLevel >= GUNNER_FOOD_THROW_UNLOCK_LEVEL;
        if (!m.gunnerFoodThrowUnlocked) m.gunnerFoodThrowCd = 0;
        if (!m.gunnerSkyCannonUpgraded) m.gunnerSkyCannonCd = GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER;
      }
      if (m.digger) m.diggerGoldFinder = (Number(side.diggerGoldFinderLevel) || 0) > 0;
      if (m.rider) m.riderSuperHorse = (Number(side.riderSuperHorseLevel) || 0) > 0;
      if (m.president) {
        m.presidentExecutiveOrderUpgraded = (Number(side.presidentExecutiveOrderLevel) || 0) > 0;
        m.presidentExecutiveOrderCd = m.presidentExecutiveOrderUpgraded
          ? presidentExecutiveOrderCooldown()
          : 0;
      }
    }
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
    const leftPlayers = this.players.left.map((p) => ({
      id: p.id,
      role: p.role || 'archer',
      name: p.name,
      slot: p.slot,
      ready: Boolean(p.ready),
    }));
    const rightPlayers = this.players.right.map((p) => ({
      id: p.id,
      role: p.role || 'archer',
      name: p.name,
      slot: p.slot,
      ready: Boolean(p.ready),
    }));
    const leftCommittee = this.sideCommitteePlayers('left').map((member) => ({
      id: member.id,
      role: 'committee',
      side: 'left',
      slot: null,
      ordinal: Number.isFinite(member.ordinal) ? member.ordinal : null,
      name: member.name || member.voterName || null,
      voterName: member.voterName || member.name || null,
      ready: Boolean(member.ready),
    }));
    const rightCommittee = this.sideCommitteePlayers('right').map((member) => ({
      id: member.id,
      role: 'committee',
      side: 'right',
      slot: null,
      ordinal: Number.isFinite(member.ordinal) ? member.ordinal : null,
      name: member.name || member.voterName || null,
      voterName: member.voterName || member.name || null,
      ready: Boolean(member.ready),
    }));
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
      stuckHitUnit: Boolean(a.stuckHitUnit),
      stuckAngle: finiteOrNull(a.stuckAngle, 3),
      stuckTtl: roundTo(a.stuckTtl, 3),
      stuckTtlMax: roundTo(a.stuckTtlMax, 3),
      archerSlot: Math.max(0, Math.floor(Number(a.archerSlot) || 0)),
    }));
    const minions = this.minions.map((m) => ({
      id: m.id,
      side: m.side,
      x: roundTo(m.x, 1),
      y: roundTo(m.y, 1),
      r: roundTo(m.r, 2),
      hp: roundTo(m.hp, 1),
      maxHp: roundTo(m.maxHp, 1),
      dmg: roundTo(m.dmg, 1),
      atkCd: roundTo(m.atkCd, 3),
      super: Boolean(m.super),
      summoned: Boolean(m.summoned),
      necroRevived: Boolean(m.necroRevived),
      dragon: Boolean(m.dragon),
      balloon: Boolean(m.balloon),
      flying: Boolean(m.flying),
      balloonThrowTtl: roundTo(m.balloonThrowTtl, 2),
      balloonThrowMaxTtl: roundTo(m.balloonThrowMaxTtl, 2),
      balloonThrowToX: finiteOrNull(m.balloonThrowToX, 1),
      balloonThrowToY: finiteOrNull(m.balloonThrowToY, 1),
      balloonBombTtl: roundTo(m.balloonBombTtl, 2),
      balloonBombMaxTtl: roundTo(m.balloonBombMaxTtl, 2),
      balloonBombFromX: finiteOrNull(m.balloonBombFromX, 1),
      balloonBombFromY: finiteOrNull(m.balloonBombFromY, 1),
      balloonBombToX: finiteOrNull(m.balloonBombToX, 1),
      balloonBombToY: finiteOrNull(m.balloonBombToY, 1),
      balloonBombBlastRadius: roundTo(m.balloonBombBlastRadius, 1),
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
      shieldGuardPose: roundTo(m.shieldGuardPose, 3),
      shieldDarkMetalTtl: roundTo(m.shieldDarkMetalTtl, 2),
      stoneGolem: Boolean(m.stoneGolem),
      golemSmashTtl: roundTo(m.golemSmashTtl, 2),
      golemShieldHp: roundTo(m.golemShieldHp, 1),
      golemShieldMax: roundTo(m.golemShieldMax, 1),
      golemShieldTtl: roundTo(m.golemShieldTtl, 2),
      golemBiteJumpTtl: roundTo(m.golemBiteJumpTtl, 2),
      golemBiteJumpMaxTtl: roundTo(m.golemBiteJumpMaxTtl, 2),
      golemBiteLandTtl: roundTo(m.golemBiteLandTtl, 2),
      golemBiteLandMaxTtl: roundTo(m.golemBiteLandMaxTtl, 2),
      golemBiteHeld: Boolean(m.golemBiteHeldTargetId),
      necroShieldHp: roundTo(m.necroShieldHp, 1),
      necroShieldMax: roundTo(m.necroShieldMax, 1),
      necroShieldTtl: roundTo(m.necroShieldTtl, 2),
      necroShieldMaxTtl: roundTo(m.necroShieldMaxTtl, 2),
      reviveShieldHp: roundTo(m.reviveShieldHp, 1),
      reviveShieldMax: roundTo(m.reviveShieldMax, 1),
      reviveShieldTtl: roundTo(m.reviveShieldTtl, 2),
      reviveShieldMaxTtl: roundTo(m.reviveShieldMaxTtl, 2),
      hitFlashTtl: roundTo(m.hitFlashTtl, 3),
      balloonHitCircleIndex: Number.isFinite(m.balloonHitCircleIndex)
        ? clamp(Math.round(m.balloonHitCircleIndex), -1, 1)
        : -1,
      balloonHitCircleTtl: roundTo(m.balloonHitCircleTtl, 3),
      hero: Boolean(m.hero),
      heroCooker: Boolean(m.heroCooker),
      heroCookerFoodType: typeof m.heroCookerFoodType === 'string' ? m.heroCookerFoodType : null,
      heroCookerState: typeof m.heroCookerState === 'string' ? m.heroCookerState : null,
      heroCookerEatCap: Math.max(1, Math.round(Number(m.heroCookerEatCap) || HERO_COOKER_MAX_EAT)),
      heroCookerEatCount: Math.max(0, Math.round(Number(m.heroCookerEatCount) || 0)),
      heroCookerCookTtl: roundTo(m.heroCookerCookTtl, 2),
      heroCookerCookMaxTtl: roundTo(m.heroCookerCookMaxTtl, 2),
      heroCookerAnimT: roundTo(m.heroCookerAnimT, 3),
      heroCookerSpin: roundTo(m.heroCookerSpin, 3),
      monk: Boolean(m.monk),
      monkHealScale: roundTo(m.monkHealScale, 3),
      necrominion: Boolean(m.necrominion),
      president: Boolean(m.president),
      presidentSetup: Boolean(m.presidentSetup),
      presidentAuraRadius: roundTo(m.presidentAuraRadius, 1),
      presidentExecutiveOrderUpgraded: Boolean(m.presidentExecutiveOrderUpgraded),
      presidentExecutiveOrderSignTtl: roundTo(m.presidentExecutiveOrderSignTtl, 2),
      presidentExecutiveOrderSignMaxTtl: roundTo(m.presidentExecutiveOrderSignMaxTtl, 2),
      presidentExecutiveOrderBeamTtl: roundTo(m.presidentExecutiveOrderBeamTtl, 2),
      presidentExecutiveOrderBeamMaxTtl: roundTo(m.presidentExecutiveOrderBeamMaxTtl, 2),
      presidentExecutiveOrderBeamToX: finiteOrNull(m.presidentExecutiveOrderBeamToX, 1),
      presidentExecutiveOrderBeamToY: finiteOrNull(m.presidentExecutiveOrderBeamToY, 1),
      executiveOrderHitsLeft: Math.max(0, Math.round(Number(m.executiveOrderHitsLeft) || 0)),
      executiveOrderHitsMax: Math.max(0, Math.round(Number(m.executiveOrderHitsMax) || 0)),
      executiveOrderBreakTtl: roundTo(m.executiveOrderBreakTtl, 2),
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
      side: res.side === 'right' ? 'right' : 'left',
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
      isFlareStrike: Boolean(ball.isFlareStrike),
      x: roundTo(ball.x, 1),
      y: roundTo(ball.y, 1),
      r: roundTo(ball.r, 1),
      phase: typeof ball.phase === 'string' ? ball.phase : 'fall',
      flareTtl: roundTo(ball.flareTtl, 2),
      signalFlareTtl: roundTo(ball.signalFlareTtl, 2),
      signalFlareMaxTtl: roundTo(ball.signalFlareMaxTtl, 2),
      signalFlareX: finiteOrNull(ball.signalFlareX, 1),
      signalFlareY: finiteOrNull(ball.signalFlareY, 1),
      dropDelay: roundTo(ball.dropDelay, 2),
      vx: roundTo(ball.vx, 1),
      vy: roundTo(ball.vy, 1),
      impactX: roundTo(ball.impactX, 1),
      impactY: roundTo(ball.impactY, 1),
    }));
    const upgradeCards = this.upgradeCards.map((card) => ({
      id: card.id,
      side: card.side,
      slot: Number.isFinite(card.slot) ? card.slot : 0,
      type: card.type,
      x: roundTo(card.x, 1),
      y: roundTo(card.y, 1),
      w: roundTo(card.w, 1),
      h: roundTo(card.h, 1),
      cost: Math.max(1, Math.round(Number(card.cost) || 1)),
      committeeLocked: Boolean(card.committeeLocked),
      committeeVoteActive: Boolean(card.committeeVoteActive),
    }));

    return {
      id: this.id,
      mode: this.mode,
      themeMode: this.themeMode,
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
      committeePlayers: {
        left: leftCommittee,
        right: rightCommittee,
      },
      cpuSlots: {
        left: Array.isArray(this.cpuSlots?.left) ? this.cpuSlots.left.slice(0, this.archersPerSide).map(Boolean) : [],
        right: Array.isArray(this.cpuSlots?.right) ? this.cpuSlots.right.slice(0, this.archersPerSide).map(Boolean) : [],
      },
      committeeVotes: this.buildCommitteeVoteSnapshot(),
      committeeVoteFx: this.buildCommitteeVoteFxSnapshot(),
      upgradeSelectionFx: this.buildUpgradeSelectionFxSnapshot(),
      ready: this.readySummary(),
      primaryPlayers: {
        left: leftPrimary,
        right: rightPrimary,
      },
      postGameReport: this.gameOver ? this.buildPostGameReport() : null,
      debug: {
        colliderOverlay: Boolean(this.debugColliderOverlay),
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

  queueLine(text, x, y, side, extra = null) {
    if (!text || !Number.isFinite(x) || !Number.isFinite(y)) return;
    const event = { text: String(text), x, y, side };
    if (extra && typeof extra === 'object') Object.assign(event, extra);
    this.lineEvents.push(event);
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
    this.display = { id: socketId, name: name || 'Fuel Screen' };
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
    for (const side of ['left', 'right']) {
      const outOfRangeHuman = this.players[side].some((p) => (Number(p?.slot) || 0) >= nextArchersPerSide);
      if (outOfRangeHuman) {
        return { ok: false, message: 'Too many controllers are connected to switch to 2 players.' };
      }
      const outOfRangeCpu = Array.isArray(this.cpuSlots?.[side])
        && this.cpuSlots[side].some((flag, idx) => idx >= nextArchersPerSide && Boolean(flag));
      if (outOfRangeCpu) {
        return { ok: false, message: 'Disable extra CPU slots before switching to 2 players.' };
      }
    }

    this.mode = nextMode;
    this.archersPerSide = nextArchersPerSide;
    this.normalizeCpuSlotsShape();
    this.resizeSideArcherControls('left');
    this.resizeSideArcherControls('right');
    this.cpuAimState.clear();
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
    this.basicSpecialBaseEveryByType = randomBasicSpecialBaseEveryByType();
    this.specialBaseChanceByType = randomSpecialBaseChanceByType();
    this.tier2SpecialBaseEveryByType = randomTier2SpecialBaseEveryByType();
    this.left.specialBasicBaseEveryByType = { ...this.basicSpecialBaseEveryByType };
    this.right.specialBasicBaseEveryByType = { ...this.basicSpecialBaseEveryByType };
    this.left.specialBaseChanceByType = { ...this.specialBaseChanceByType };
    this.right.specialBaseChanceByType = { ...this.specialBaseChanceByType };
    this.left.specialTier2BaseEveryByType = { ...this.tier2SpecialBaseEveryByType };
    this.right.specialTier2BaseEveryByType = { ...this.tier2SpecialBaseEveryByType };
    this.basicSpecialSharedBaseEvery = this.basicSpecialBaseEveryByType[BASIC_SPECIAL_SPAWN_TYPES[0]] || null;
    this.left.specialBasicSharedBaseEvery = this.basicSpecialSharedBaseEvery;
    this.right.specialBasicSharedBaseEvery = this.basicSpecialSharedBaseEvery;
    this.specialCadenceSharedRollByType = {};
    for (const type of SPECIAL_CADENCE_TRACKED_TYPES) this.specialCadenceSharedRollForType(type);
    this.gameOver = false;
    this.winner = null;
    this.t = 0;
    this.totalFeedingActive = false;
    this.cpuAimState.clear();
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
    this.totalFeedingGrainProjectiles = [];
    this.heroFoodRainImpacts = [];
    this.heroRumblePulses = [];
    this.upgradeCards = [];
    this.candles = { left: null, right: null };
    this.candleScorches = [];
    this.sfxEvents = [];
    this.damageEvents = [];
    this.lineEvents = [];
    this.activePresidents = { left: [], right: [] };
    this.candleCarrierCounts = { left: 0, right: 0 };
    this.nextResourceAt = 0;
    this.nextResourceTelegraphAt = 0;
    this.pendingResourceInterval = RESOURCE_SPAWN_START_MIN_SECONDS;
    this.pendingResourceSpawns = null;
    this.nextShotPowerAt = 0;
    this.seq = 1;
    this.committeeVotes.left = this.createCommitteeVoteState('left');
    this.committeeVotes.right = this.createCommitteeVoteState('right');
    this.committeeVoteFx.left = null;
    this.committeeVoteFx.right = null;
    this.upgradeSelectionFx.left = null;
    this.upgradeSelectionFx.right = null;
    this.left.candleSpawnInSpawns = this.statCandleEvery(this.left);
    this.right.candleSpawnInSpawns = this.statCandleEvery(this.right);
    this.left.candleCd = this.candleSpawnEtaSeconds('left');
    this.right.candleCd = this.candleSpawnEtaSeconds('right');
    this.left.candleActive = false;
    this.right.candleActive = false;
    this.applyDebugConfigToRoom(false);
    this.scheduleNextResourceSpawn(this.t);
    this.scheduleNextShotPower(this.t);
    this.seedUpgradeCards();
    this.resetMatchReport();
    this.started = this.isReadyToStart();

    return { ok: true };
  }

  requiredPlayers() {
    return this.archersPerSide * 2;
  }

  totalPlayers() {
    return this.filledSlotsForSide('left') + this.filledSlotsForSide('right');
  }

  isReadyToStart() {
    const archersFilled = this.filledSlotsForSide('left') >= this.archersPerSide
      && this.filledSlotsForSide('right') >= this.archersPerSide;
    if (!archersFilled) return false;
    return this.allHumansReady();
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
    if (leftPlayer) return { side: 'left', slot: leftPlayer.slot, role: 'archer', player: leftPlayer };
    const rightPlayer = this.players.right.find((p) => p.id === socketId);
    if (rightPlayer) return { side: 'right', slot: rightPlayer.slot, role: 'archer', player: rightPlayer };
    return null;
  }

  sideBySocket(socketId) {
    const found = this.controllerBySocket(socketId);
    return found ? found.side : null;
  }

  addPlayer(socketId, name) {
    const existing = this.controllerBySocket(socketId);
    if (existing) {
      return {
        side: existing.side,
        slot: existing.slot,
        role: existing.role || 'archer',
        voterName: existing.player?.voterName || existing.player?.name || null,
        existing: true,
      };
    }
    const leftOpen = this.availableHumanJoinSlots('left');
    const rightOpen = this.availableHumanJoinSlots('right');
    const canJoinArcher = leftOpen.length || rightOpen.length;
    const canJoinCommittee = this.committeeCountForSide('left') < MAX_COMMITTEE_PLAYERS_PER_SIDE
      || this.committeeCountForSide('right') < MAX_COMMITTEE_PLAYERS_PER_SIDE;
    if (!canJoinArcher && !canJoinCommittee) return null;

    if (canJoinArcher) {
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
        role: 'archer',
        name: name || this.defaultPlayerNameForSide(side, slot),
        slot,
        ready: false,
      };
      this.players[side].push(player);
      this.started = this.isReadyToStart();
      return { side, slot, role: 'archer', voterName: null, existing: false };
    }

    let side = 'left';
    const leftCount = this.committeeCountForSide('left');
    const rightCount = this.committeeCountForSide('right');
    const leftOpenCommittee = leftCount < MAX_COMMITTEE_PLAYERS_PER_SIDE;
    const rightOpenCommittee = rightCount < MAX_COMMITTEE_PLAYERS_PER_SIDE;
    if (leftOpenCommittee && rightOpenCommittee) {
      if (leftCount === rightCount) {
        side = this.nextCommitteeJoinSide === 'right' ? 'right' : 'left';
        this.nextCommitteeJoinSide = side === 'left' ? 'right' : 'left';
      } else {
        side = leftCount <= rightCount ? 'left' : 'right';
      }
    } else if (leftOpenCommittee) {
      side = 'left';
    } else if (rightOpenCommittee) {
      side = 'right';
    } else {
      return null;
    }

    const committeeList = this.sideCommitteePlayers(side);
    const ordinal = committeeList.length + 1;
    const voterName = name || defaultCommitteeName(side, ordinal);
    const committeeMember = {
      id: socketId,
      role: 'committee',
      side,
      slot: null,
      ordinal,
      name: voterName,
      voterName,
      ready: false,
    };
    this.committeePlayers[side].push(committeeMember);
    this.started = this.isReadyToStart();
    return { side, slot: null, role: 'committee', voterName, existing: false };
  }

  setPlayerReady(socketId, ready = true) {
    const entry = this.controllerBySocket(socketId);
    if (!entry || !entry.player) return { ok: false, message: 'Controller not found.' };
    if (this.started && !this.gameOver) {
      return { ok: false, message: 'Match already started.' };
    }
    entry.player.ready = Boolean(ready);
    this.started = this.isReadyToStart();
    return {
      ok: true,
      side: entry.side,
      role: entry.role || 'archer',
      ready: Boolean(entry.player.ready),
      summary: this.readySummary(socketId),
    };
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
    if (this.players.left.length !== leftBefore) changed = true;
    const rightBefore = this.players.right.length;
    this.players.right = this.players.right.filter((p) => p.id !== socketId);
    if (this.players.right.length !== rightBefore) changed = true;
    const leftCommitteeBefore = this.sideCommitteePlayers('left').length;
    this.committeePlayers.left = this.sideCommitteePlayers('left').filter((p) => p.id !== socketId);
    if (this.committeePlayers.left.length !== leftCommitteeBefore) changed = true;
    const rightCommitteeBefore = this.sideCommitteePlayers('right').length;
    this.committeePlayers.right = this.sideCommitteePlayers('right').filter((p) => p.id !== socketId);
    if (this.committeePlayers.right.length !== rightCommitteeBefore) changed = true;
    if (this.committeeVotes?.left?.votesByPlayerId) delete this.committeeVotes.left.votesByPlayerId[socketId];
    if (this.committeeVotes?.right?.votesByPlayerId) delete this.committeeVotes.right.votesByPlayerId[socketId];

    if (changed) this.started = this.isReadyToStart();

    return {
      changed,
      empty: this.players.left.length === 0
        && this.players.right.length === 0
        && this.sideCommitteePlayers('left').length === 0
        && this.sideCommitteePlayers('right').length === 0
        && !this.display,
    };
  }

  minionMatchesSpecialType(minion, type) {
    if (!minion || !type) return false;
    if (type === 'dragon') return Boolean(minion.dragon);
    if (type === 'shield') return Boolean(minion.shieldBearer);
    if (type === 'digger') return Boolean(minion.digger);
    if (type === 'necrominion') return Boolean(minion.necrominion);
    if (type === 'gunner') return Boolean(minion.gunner);
    if (type === 'rider') return Boolean(minion.rider);
    if (type === 'monk') return Boolean(minion.monk);
    if (type === 'stonegolem') return Boolean(minion.stoneGolem);
    if (type === 'hero') return Boolean(minion.hero);
    if (type === 'president') return Boolean(minion.president);
    if (type === 'balloon') return Boolean(minion.balloon);
    if (type === 'super') return Boolean(minion.super);
    return false;
  }

  aliveSpecialCount(sideName, type) {
    let count = 0;
    for (const m of this.minions) {
      if (!m || m.side !== sideName) continue;
      if ((Number(m.hp) || 0) <= 0) continue;
      if (!this.minionMatchesSpecialType(m, type)) continue;
      count += 1;
    }
    return count;
  }

  enforceDebugFocusedMinimum(sideName) {
    const side = this[sideName];
    if (!side) return;
    const type = (typeof side.debugForceSpecialType === 'string' && DEBUG_FORCE_SPECIAL_TYPES.has(side.debugForceSpecialType))
      ? side.debugForceSpecialType
      : null;
    if (!type) return;
    const targetMin = Math.max(1, Math.min(12, Math.floor(Number(side.debugForceSpecialMinAlive) || 1)));
    const alive = this.aliveSpecialCount(sideName, type);
    const missing = Math.max(0, targetMin - alive);
    for (let i = 0; i < missing; i += 1) {
      this.spawnMinion(sideName, { forceType: type, countSpawn: false });
    }
  }

  tick(dt) {
    if (!this.started || this.gameOver) return;
    this.t += dt;
    if (!this.totalFeedingActive && this.t >= TOTAL_FEEDING_TRIGGER_SECONDS) {
      this.activateTotalFeeding();
    }

    // In 2v2, all archers fire together on the shared side-wide cadence.
    // Result: both teammates shoot once per second at the same moment.
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
    for (const sideName of ROOM_SIDES) {
      const fx = this.committeeVoteFx?.[sideName];
      if (!fx) continue;
      fx.ttl = Math.max(0, (Number(fx.ttl) || 0) - dt);
      if (fx.ttl <= 0) this.committeeVoteFx[sideName] = null;
    }
    for (const sideName of ROOM_SIDES) {
      const fx = this.upgradeSelectionFx?.[sideName];
      if (!fx) continue;
      fx.ttl = Math.max(0, (Number(fx.ttl) || 0) - dt);
      if (fx.ttl <= 0) this.upgradeSelectionFx[sideName] = null;
    }
    this.left.heroLineCd = Math.max(0, (Number(this.left.heroLineCd) || 0) - dt);
    this.right.heroLineCd = Math.max(0, (Number(this.right.heroLineCd) || 0) - dt);
    if (this.left.specialFailTtl === 0) this.left.specialFailType = null;
    if (this.right.specialFailTtl === 0) this.right.specialFailType = null;
    // Keep last special roll result visible for UI history; TTL controls recency only.
    this.updateCpuAiming(dt);

    if (this.sharedShotCd === 0) {
      this.beginArrowVolley('left');
      this.beginArrowVolley('right');
      // Alternate arrow resolution priority each volley to reduce deterministic side bias.
      // Arrows are processed in reverse array order, so we enqueue the priority side last.
      const prioritySide = this.nextArrowPrioritySide === 'right' ? 'right' : 'left';
      const otherSide = prioritySide === 'left' ? 'right' : 'left';
      if (this.archersPerSide > 1) {
        for (let slot = 0; slot < this.archersPerSide; slot += 1) {
          this.addArrowFromPull(otherSide, slot);
          this.addArrowFromPull(prioritySide, slot);
        }
        this.left.archerVolleyIndex = 0;
        this.right.archerVolleyIndex = 0;
      } else {
        this.addArrowFromPull(otherSide, 0);
        this.addArrowFromPull(prioritySide, 0);
      }
      this.nextArrowPrioritySide = otherSide;
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
    this.enforceDebugFocusedMinimum('left');
    this.enforceDebugFocusedMinimum('right');

    if (this.t >= this.nextResourceTelegraphAt && !this.pendingResourceSpawns) {
      this.pendingResourceSpawns = this.makeMirroredResourceSpawn(this.pendingResourceInterval);
      this.queueResourceTelegraph(this.pendingResourceSpawns);
    }
    if (this.t >= this.nextResourceAt) {
      const readySpawns = Array.isArray(this.pendingResourceSpawns) && this.pendingResourceSpawns.length
        ? this.pendingResourceSpawns
        : this.makeMirroredResourceSpawn(this.pendingResourceInterval);
      this.spawnMirroredResource(readySpawns);
      this.scheduleNextResourceSpawn(this.t);
    }

    if (this.t >= this.nextShotPowerAt) {
      this.spawnMirroredShotPower();
      this.scheduleNextShotPower(this.t);
    }

    this.syncUpgradeCards('left');
    this.syncUpgradeCards('right');
    this.refreshPresidentAuraCache();

    this.tickShotPowers(dt);
    const preBuckets = this.buildDualMinionBuckets(ARROW_TARGET_BUCKET_W, MINION_TARGET_BUCKET_W);
    this.tickCannonBalls(dt, preBuckets.minion);
    this.tickArrows(dt, preBuckets.arrow);
    this.tickHeroFoodRainImpacts(dt, preBuckets.minion, MINION_TARGET_BUCKET_W);
    this.tickHeroRumblePulses(dt, preBuckets.minion, MINION_TARGET_BUCKET_W);
    this.tickMinions(dt, preBuckets.minion, preBuckets.carrierCounts);
    this.tickTotalFeedingGrainProjectiles(dt);
    const candleBuckets = this.buildMinionBuckets(MINION_TARGET_BUCKET_W);
    const candleHolders = this.collectAllCandleHolders();
    this.tickCandle(dt, candleBuckets, candleHolders);

    this.processEconomy(this.left);
    this.processEconomy(this.right);

    this.recordMatchTimelineSample(false);

    if (this.left.towerHp <= 0 || this.right.towerHp <= 0) {
      this.postGameReportCache = null;
      this.gameOver = true;
      this.winner = this.resolveTowerWinner();
      this.recordMatchTimelineSample(true);
    }
  }

  resolveTowerWinner() {
    const leftHp = Number(this.left?.towerHp) || 0;
    const rightHp = Number(this.right?.towerHp) || 0;
    if (leftHp > rightHp) return 'left';
    if (rightHp > leftHp) return 'right';

    // On exact HP ties, prefer objective performance metrics before random fallback.
    const leftTotals = this.matchReport?.totals?.left || {};
    const rightTotals = this.matchReport?.totals?.right || {};
    const leftTowerDamage = Number(leftTotals.towerDamageDealt) || 0;
    const rightTowerDamage = Number(rightTotals.towerDamageDealt) || 0;
    if (leftTowerDamage > rightTowerDamage) return 'left';
    if (rightTowerDamage > leftTowerDamage) return 'right';

    const leftTotalDamage = (Number(leftTotals.arrowDamage) || 0)
      + (Number(leftTotals.unitDamage) || 0)
      + leftTowerDamage;
    const rightTotalDamage = (Number(rightTotals.arrowDamage) || 0)
      + (Number(rightTotals.unitDamage) || 0)
      + rightTowerDamage;
    if (leftTotalDamage > rightTotalDamage) return 'left';
    if (rightTotalDamage > leftTotalDamage) return 'right';

    const leftKills = Number(leftTotals.minionKills) || 0;
    const rightKills = Number(rightTotals.minionKills) || 0;
    if (leftKills > rightKills) return 'left';
    if (rightKills > leftKills) return 'right';

    return Math.random() < 0.5 ? 'left' : 'right';
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

  tickCannonBalls(dt, precomputedBuckets = null) {
    if (!Array.isArray(this.cannonBalls) || this.cannonBalls.length === 0) return;
    let write = 0;
    const preBuckets = precomputedBuckets || this.buildMinionBuckets(MINION_TARGET_BUCKET_W);
    for (let i = 0; i < this.cannonBalls.length; i += 1) {
      const ball = this.cannonBalls[i];
      if (!ball) continue;
      if ((Number(ball.signalFlareTtl) || 0) > 0) {
        ball.signalFlareTtl = Math.max(0, (Number(ball.signalFlareTtl) || 0) - dt);
      }
      if (ball.phase === 'flare') {
        ball.flareTtl = Math.max(0, (Number(ball.flareTtl) || 0) - dt);
        ball.x += (Number(ball.vx) || 0) * dt;
        ball.y += (Number(ball.vy) || 0) * dt;
        if (ball.flareTtl <= 0) {
          ball.phase = 'mark';
          ball.x = Number(ball.impactX) || ball.x;
          ball.y = Number(ball.impactY) || ball.y;
          ball.vx = 0;
          ball.vy = 0;
          ball.dropDelay = GUNNER_SKY_CANNON_AIRSTRIKE_MARK_DELAY + Math.random() * 0.14;
          this.queueHitSfx('powerup', ball.x, ball.y, ball.side);
        }
        this.cannonBalls[write] = ball;
        write += 1;
        continue;
      }
      if (ball.phase === 'mark') {
        ball.dropDelay = Math.max(0, (Number(ball.dropDelay) || 0) - dt);
        if (ball.dropDelay <= 0) {
          ball.phase = 'fall';
          ball.x = (Number(ball.impactX) || 0) + (Math.random() * 14 - 7);
          ball.y = GUNNER_SKY_CANNON_SKY_SPAWN_Y;
          ball.vx = Math.random() * 18 - 9;
          ball.vy = GUNNER_SKY_CANNON_FALL_SPEED + Math.random() * 36;
          this.queueHitSfx('powerup', ball.x, ball.y + 8, ball.side);
        }
        this.cannonBalls[write] = ball;
        write += 1;
        continue;
      }
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

  queueHeroFoodRainImpact(entry) {
    if (!entry || typeof entry !== 'object') return;
    if (!Array.isArray(this.heroFoodRainImpacts)) this.heroFoodRainImpacts = [];
    const sideName = entry.side === 'right' ? 'right' : 'left';
    this.heroFoodRainImpacts.push({
      side: sideName,
      x: clamp(Number(entry.x) || 0, TOWER_X_LEFT + 38, TOWER_X_RIGHT - 38),
      y: clamp(Number(entry.y) || 0, TOWER_Y - 180, TOWER_Y + 212),
      r: Math.max(1, Number(entry.r) || HERO_FOOD_RAIN_RADIUS),
      ttl: Math.max(0.05, Number(entry.ttl) || 0.9),
      preStyleDamage: Math.max(0, Number(entry.preStyleDamage) || 0),
      foodType: entry.foodType === 'rice' ? 'rice' : 'bread',
      goldScalar: Math.max(0, Number(entry.goldScalar) || 0.8),
    });
  }

  tickHeroFoodRainImpacts(dt, precomputedBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!Array.isArray(this.heroFoodRainImpacts) || this.heroFoodRainImpacts.length === 0) return;
    const minionBuckets = precomputedBuckets || this.buildMinionBuckets(bucketW);
    let write = 0;
    for (let i = 0; i < this.heroFoodRainImpacts.length; i += 1) {
      const impact = this.heroFoodRainImpacts[i];
      if (!impact) continue;
      impact.ttl = Math.max(0, (Number(impact.ttl) || 0) - dt);
      if (impact.ttl > 0) {
        this.heroFoodRainImpacts[write] = impact;
        write += 1;
        continue;
      }

      const sideName = impact.side === 'right' ? 'right' : 'left';
      const x = Number.isFinite(impact.x) ? impact.x : 0;
      const y = Number.isFinite(impact.y) ? impact.y : 0;
      const radius = Math.max(1, Number(impact.r) || HERO_FOOD_RAIN_RADIUS);
      const preStyleDamage = Math.max(0, Number(impact.preStyleDamage) || 0);
      const goldScalar = Math.max(0, Number(impact.goldScalar) || 0.8);
      const foodType = impact.foodType === 'rice' ? 'rice' : 'bread';

      this.queueHitSfx('explosion', x, y, sideName);
      this.queueHitSfx('foodburst', x, y, sideName, {
        foodType,
        heavy: true,
      });

      this.forEachEnemyMinionInRadius(
        sideName,
        x,
        y,
        radius,
        minionBuckets,
        bucketW,
        (other) => {
          if (!other || other.removed || other.side === sideName) return;
          const styleMul = this.minionDamageMultiplier(null, other, 'explosion');
          const damage = preStyleDamage * styleMul;
          if (damage <= 0) return;
          this.dealDamageToMinion(other, damage, sideName, 'unit');
          if ((Number(other.hp) || 0) <= 0) this.killMinionByRef(other, sideName, { goldScalar });
        }
      );
    }
    this.heroFoodRainImpacts.length = write;
  }

  queueHeroRumblePulse(entry) {
    if (!entry || typeof entry !== 'object') return;
    if (!Array.isArray(this.heroRumblePulses)) this.heroRumblePulses = [];
    const sideName = entry.side === 'right' ? 'right' : 'left';
    this.heroRumblePulses.push({
      side: sideName,
      x: clamp(Number(entry.x) || 0, TOWER_X_LEFT + 24, TOWER_X_RIGHT - 24),
      y: clamp(Number(entry.y) || 0, -180, WORLD_H + 40),
      r: Math.max(1, Number(entry.r) || HERO_GROUND_RUMBLE_RADIUS),
      ttl: Math.max(0.01, Number(entry.ttl) || 0.01),
      preStyleDamage: Math.max(0, Number(entry.preStyleDamage) || 0),
      foodType: entry.foodType === 'rice' ? 'rice' : 'bread',
      goldScalar: Math.max(0, Number(entry.goldScalar) || 0.82),
    });
  }

  tickHeroRumblePulses(dt, precomputedBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!Array.isArray(this.heroRumblePulses) || this.heroRumblePulses.length === 0) return;
    const minionBuckets = precomputedBuckets || this.buildMinionBuckets(bucketW);
    let write = 0;
    for (let i = 0; i < this.heroRumblePulses.length; i += 1) {
      const pulse = this.heroRumblePulses[i];
      if (!pulse) continue;
      pulse.ttl = Math.max(0, (Number(pulse.ttl) || 0) - dt);
      if (pulse.ttl > 0) {
        this.heroRumblePulses[write] = pulse;
        write += 1;
        continue;
      }

      const sideName = pulse.side === 'right' ? 'right' : 'left';
      const x = Number.isFinite(pulse.x) ? pulse.x : 0;
      const y = Number.isFinite(pulse.y) ? pulse.y : 0;
      const radius = Math.max(1, Number(pulse.r) || HERO_GROUND_RUMBLE_RADIUS);
      const preStyleDamage = Math.max(0, Number(pulse.preStyleDamage) || 0);
      const goldScalar = Math.max(0, Number(pulse.goldScalar) || 0.82);
      const foodType = pulse.foodType === 'rice' ? 'rice' : 'bread';

      this.queueHitSfx('foodburst', x, y, sideName, { foodType, heavy: true });
      this.forEachEnemyMinionInRadius(
        sideName,
        x,
        y,
        radius,
        minionBuckets,
        bucketW,
        (other) => {
          if (!other || other.removed || other.side === sideName) return;
          const styleMul = this.minionDamageMultiplier(null, other, 'explosion');
          const damage = preStyleDamage * styleMul;
          if (damage <= 0) return;
          this.dealDamageToMinion(other, damage, sideName, 'unit');
          if ((Number(other.hp) || 0) <= 0) this.killMinionByRef(other, sideName, { goldScalar });
        }
      );
    }
    this.heroRumblePulses.length = write;
  }

  candleSpawnX(sideName) {
    return sideName === 'right' ? (TOWER_X_RIGHT - CANDLE_SPAWN_OFFSET) : (TOWER_X_LEFT + CANDLE_SPAWN_OFFSET);
  }

  candleSpawnY() {
    return TOWER_Y + (Math.random() * 80 - 40);
  }

  statCandleEvery(side) {
    const baseEvery = this.tier2SpecialBaseEveryForType('candle');
    const every = this.scaleTier2SpecialCooldownEvery(baseEvery, side);
    return this.clampTier2CadenceInSpawns(every, side);
  }

  statCandleSpawnChance(side) {
    const base = clamp(Number(this.specialBaseChanceForType('candle')) || CANDLE_SPAWN_BASE_CHANCE, 0, 0.99);
    const bonus = clamp(Number(side?.debugCandleChanceBonus) || 0, DEBUG_CANDLE_BONUS_MIN, DEBUG_CANDLE_BONUS_MAX);
    return clamp(base + bonus, base, 0.92);
  }

  statStoneGolemEvery(side) {
    const spawn = Math.max(1, Number(side?.spawnLevel) || 1);
    const hp = Math.max(1, Number(side?.unitHpLevel) || 1);
    const power = Math.max(1, Number(side?.powerLevel) || 1);
    const resource = Math.max(1, Number(side?.resourceLevel) || 1);
    const golemTech = Math.floor((spawn + hp + power + resource) / 7);
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(side, 'stonegolem');
    const baseEvery = Math.max(30, 46 - golemTech * 2) * repeatMul;
    return this.scaleSpecialCooldownEvery(baseEvery, side, 0.88);
  }

  stoneGolemSpawnUnlocked(side) {
    const hp = Number(side?.towerHp) || 0;
    return Boolean(side?.towerGolemRescueUsed)
      || (hp > 0 && hp <= TOWER_MAX_HP * STONE_GOLEM_HALF_HP_THRESHOLD);
  }

  candleSpawnEtaSeconds(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const sideState = this[side];
    if (!sideState) return 0;
    if (this.candles?.[side]) return 0;
    const spawnEvery = this.statSpawnEvery(sideState);
    const minionCd = Math.max(0, Number(sideState.minionCd) || 0);
    const candleCadence = sideState.specialSpawnCadenceByType?.candle;
    const inSpawnsRaw = Number(candleCadence?.remainingSpawns);
    const fallbackInSpawns = Number(sideState.candleSpawnInSpawns);
    const inSpawns = Math.max(
      1,
      Number.isFinite(inSpawnsRaw)
        ? inSpawnsRaw
        : (Number.isFinite(fallbackInSpawns) && fallbackInSpawns > 0 ? fallbackInSpawns : this.statCandleEvery(sideState))
    );
    return minionCd + Math.max(0, inSpawns - 1) * spawnEvery;
  }

  stepCandleSpawnCycle(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const sideState = this[side];
    if (!sideState) return;
    if (this.candles?.[side]) return;
    const candleEvery = this.statCandleEvery(sideState);
    const dueCount = this.advanceSpecialSpawnProgress(sideName, 'candle', candleEvery, 1, this.t);
    const candleCadence = this.specialSpawnCadenceStateForType(sideState, 'candle', this.t);
    sideState.candleSpawnInSpawns = Number.isFinite(candleCadence?.remainingSpawns)
      ? candleCadence.remainingSpawns
      : Math.max(0, Number(sideState.candleSpawnInSpawns) || candleEvery);
    sideState.candleCd = this.candleSpawnEtaSeconds(side);
    if (dueCount > 0) {
      const chance = this.statCandleSpawnChance(sideState);
      const roll = Math.random();
      const success = roll <= chance;
      sideState.candleRollChance = chance;
      sideState.candleRollValue = roll;
      sideState.candleRollSuccess = success;
      if (success) this.spawnCandleUnit(side);
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
    const pose = this.shieldGuardPoseValue(minion);
    return {
      dir,
      pose,
      // Keep the raised shield slightly in front of the body so it can cover the head lane.
      x: (Number(minion.x) || 0) + dir * (baseR * (0.82 - pose * 0.48)),
      y: (Number(minion.y) || 0) + baseR * (0.06 - pose * 1.02),
      rx: (baseR * (0.84 - pose * 0.18) + 10) * pushScale,
      ry: (baseR * (1.18 + pose * 0.32) + 10) * pushScale,
      // Top opening narrows as guard pose rises so overhead shots meet the raised shield.
      topOpenY: (Number(minion.y) || 0) - baseR * (0.76 + pose * 2.05),
    };
  }

  shieldGuardPoseValue(minion) {
    return clamp(Number(minion?.shieldGuardPose) || 0, 0, 1);
  }

  setShieldGuardPoseTarget(minion, target) {
    if (!minion || !minion.shieldBearer) return;
    minion.shieldGuardTarget = clamp(Number(target) || 0, 0, 1);
  }

  shieldBearerHeadCircle(minion, arrow = null) {
    if (!minion || !minion.shieldBearer) return null;
    const dir = minion.side === 'left' ? 1 : -1;
    const baseR = Math.max(18, Number(minion.r) || 20);
    // Exact match for drawShieldBearerSprite head circle in GameRenderer.
    const headR = baseR * SHIELD_HEAD_HIT_RADIUS_MULT;
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

  segmentIntersectsEllipse(x1, y1, x2, y2, cx, cy, rx, ry) {
    const safeRx = Math.max(0.0001, Math.abs(rx) || 0.0001);
    const safeRy = Math.max(0.0001, Math.abs(ry) || 0.0001);
    return this.segmentIntersectsCircle(
      (x1 - cx) / safeRx,
      (y1 - cy) / safeRy,
      (x2 - cx) / safeRx,
      (y2 - cy) / safeRy,
      0,
      0,
      1
    );
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

  arrowHitsBalloonBody(arrow, minion, prevX = null, prevY = null) {
    if (!arrow || !minion || !minion.balloon) return -1;
    const circles = this.balloonCollisionCircles(minion);
    if (!Array.isArray(circles) || !circles.length) return -1;
    const arrowX = Number(arrow.x) || 0;
    const arrowY = Number(arrow.y) || 0;
    const fromX = Number.isFinite(prevX) ? prevX : arrowX;
    const fromY = Number.isFinite(prevY) ? prevY : arrowY;
    const arrowR = Math.max(0, Number(arrow.r) || 0);
    for (let i = 0; i < circles.length; i += 1) {
      const c = circles[i];
      if (!c) continue;
      const hitR = Math.max(1, (Number(c.r) || 0) + arrowR);
      const dx = arrowX - c.x;
      const dy = arrowY - c.y;
      if (dx * dx + dy * dy <= hitR * hitR) return i;
      if (this.segmentIntersectsCircle(fromX, fromY, arrowX, arrowY, c.x, c.y, hitR)) return i;
    }
    return -1;
  }

  minionInsideRadius(minion, centerX, centerY, radius) {
    if (!minion || minion.removed) return false;
    const x = Number.isFinite(centerX) ? centerX : 0;
    const y = Number.isFinite(centerY) ? centerY : 0;
    const r = Math.max(0, Number(radius) || 0);
    if (!minion.balloon) {
      const dx = (Number(minion.x) || 0) - x;
      const dy = (Number(minion.y) || 0) - y;
      return dx * dx + dy * dy <= r * r;
    }
    const circles = this.balloonCollisionCircles(minion);
    if (!Array.isArray(circles) || !circles.length) return false;
    for (const c of circles) {
      if (!c) continue;
      const dx = c.x - x;
      const dy = c.y - y;
      const hitR = Math.max(1, r + Math.max(0, Number(c.r) || 0));
      if (dx * dx + dy * dy <= hitR * hitR) return true;
    }
    return false;
  }

  arrowInsideShieldBearerShield(arrow, minion, prevX = null, prevY = null) {
    if (!arrow || !minion || !minion.shieldBearer) return false;
    if (arrow.side === minion.side) return false;
    const shield = this.shieldBearerShieldShape(minion);
    if (!shield) return false;
    const arrowX = Number(arrow.x) || 0;
    const arrowY = Number(arrow.y) || 0;
    const fromX = Number.isFinite(prevX) ? prevX : arrowX;
    const fromY = Number.isFinite(prevY) ? prevY : arrowY;
    const pose = shield.pose;

    // Keep low guard skill expression: head remains open until the guard is really raised.
    if (pose < SHIELD_GUARD_POSE_HEAD_COVER_THRESHOLD) {
      const head = this.shieldBearerHeadCircle(minion, arrow);
      if (head) {
        const dxHead = arrowX - head.x;
        const dyHead = arrowY - head.y;
        const directHead = dxHead * dxHead + dyHead * dyHead <= head.r * head.r;
        const sweptHead = this.segmentIntersectsCircle(fromX, fromY, arrowX, arrowY, head.x, head.y, head.r);
        if (directHead || sweptHead) return false;
      }
    }

    // Shield only blocks from the forward side and keeps a variable top opening.
    const minionX = Number(minion.x) || 0;
    const minionR = Math.max(18, Number(minion.r) || 20);
    const relativeFrontNow = (arrowX - minionX) * shield.dir;
    const relativeFrontPrev = (fromX - minionX) * shield.dir;
    if (Math.max(relativeFrontNow, relativeFrontPrev) < -Math.max(6, (Number(minion.r) || 0) * 0.42)) return false;
    if (pose < SHIELD_GUARD_POSE_HEAD_COVER_THRESHOLD && Math.min(arrowY, fromY) < shield.topOpenY) return false;

    // When guard is visibly raised, frontal head-lane shots should still count as shield blocks.
    if (pose >= SHIELD_GUARD_POSE_HEAD_COVER_THRESHOLD) {
      const head = this.shieldBearerHeadCircle(minion, arrow);
      if (head) {
        const dxHead = arrowX - head.x;
        const dyHead = arrowY - head.y;
        const directHead = dxHead * dxHead + dyHead * dyHead <= head.r * head.r;
        const sweptHead = this.segmentIntersectsCircle(fromX, fromY, arrowX, arrowY, head.x, head.y, head.r);
        const frontal = Math.max(relativeFrontNow, relativeFrontPrev) >= -Math.max(6, minionR * 0.22);
        if (frontal && (directHead || sweptHead)) return true;
      }
    }

    const hitRx = Math.max(1, shield.rx + (Number(arrow.r) || 0) * 0.9);
    const hitRy = Math.max(1, shield.ry + (Number(arrow.r) || 0) * 0.9);
    const nx = (arrowX - shield.x) / hitRx;
    const ny = (arrowY - shield.y) / hitRy;
    if (nx * nx + ny * ny <= 1) return true;
    return this.segmentIntersectsEllipse(fromX, fromY, arrowX, arrowY, shield.x, shield.y, hitRx, hitRy);
  }

  arrowHitsShieldBearerVulnerableZone(arrow, minion, prevX = null, prevY = null) {
    if (!arrow || !minion || !minion.shieldBearer) return false;
    if (arrow.side === minion.side) return false;
    const dir = minion.side === 'left' ? 1 : -1;
    const r = Math.max(18, Number(minion.r) || 20);
    const pose = this.shieldGuardPoseValue(minion);
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

    const bodyX = (Number(minion.x) || 0) + dir * (r * (0.04 - pose * 0.12));
    const bodyY = (Number(minion.y) || 0) - r * (0.68 + pose * 0.04);
    const bodyR = r * (0.76 + pose * 0.22) + (Number(arrow.r) || 0) * 0.82;
    const dxBody = arrowX - bodyX;
    const dyBody = arrowY - bodyY;
    const directBody = dxBody * dxBody + dyBody * dyBody <= bodyR * bodyR;
    const sweptBody = this.segmentIntersectsCircle(fromX, fromY, arrowX, arrowY, bodyX, bodyY, bodyR);
    if (directBody || sweptBody) return 'body';

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

  igniteMinion(minion, duration = 1.6, sourceSide = null) {
    if (!minion) return;
    minion.candleBurnTtl = Math.max(Number(minion.candleBurnTtl) || 0, duration);
    if (sourceSide === 'left' || sourceSide === 'right') minion.candleBurnSourceSide = sourceSide;
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
    const sourceSide = minion.candleBurnSourceSide === 'right' ? 'right' : (minion.candleBurnSourceSide === 'left' ? 'left' : null);
    this.dealDamageToMinion(minion, burnDamage, sourceSide, 'unit');
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
    this.igniteMinion(target, 1.05, sideName);
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
        this.igniteMinion(other, 0.7, sideName);
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
      const attackerSide = hitSide === 'right' ? this.right : this.left;
      const archerSlot = Number.isFinite(arrow?.archerSlot)
        ? Math.max(0, Math.floor(Number(arrow.archerSlot) || 0))
        : 0;
      this.queueHitSfx('minion', candle.x, candle.y + 3, hitSide, {
        archerSlot,
        comboHitStreak: Math.max(0, Number(attackerSide?.comboHitStreak) || 0),
        comboTier: Math.max(1, Number(this.comboTier(attackerSide)) || 1),
      });
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
    else if (minion.dragon) waxLoss *= DRAGON_CANDLE_DAMAGE_MULT;
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
      m.atkCd = Math.max(Number(m.atkCd) || 0, 0.22);
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
      const enemyDps = Number.isFinite(scorch.enemyDps) ? Math.max(0, scorch.enemyDps) : CANDLE_SCORCH_DPS_ENEMY;
      const scorchSide = scorch.side === 'right' ? 'right' : (scorch.side === 'left' ? 'left' : null);
      const scorchSourceType = scorch.sourceType === 'arrow' ? 'arrow' : 'unit';
      const scorchSourceRef = scorchSourceType === 'arrow' ? (scorch.sourceRef || null) : null;
      this.forEachEnemyMinionInRadius(
        candleSide,
        scorch.x,
        scorch.y,
        scorch.r,
        minionBuckets,
        MINION_TARGET_BUCKET_W,
        (minion) => {
          if (enemyDps > 0) this.dealDamageToMinion(minion, enemyDps * dt, scorchSide, scorchSourceType, scorchSourceRef);
        }
      );
      if (scorch.towerSide === 'left' || scorch.towerSide === 'right') {
        scorch.towerBurnTick = (Number(scorch.towerBurnTick) || 0) - dt;
        if (scorch.towerBurnTick <= 0) {
          const dps = Math.max(0, Number(scorch.towerBurnDps) || 0);
          if (dps > 0) this.dealDamageToTower(scorch.towerSide, dps * 0.25, scorch.x, TOWER_Y - 24, null, scorchSide);
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
        if (a.powerType === 'flareShot' && a.mainArrow && !a.flareShotTriggered) {
          a.flareShotTriggered = true;
          this.spawnFlareShotCannonBall(a.side, a.x, ARROW_STICK_GROUND_Y, a);
        }
        this.stickArrowInGround(a);
        continue;
      }

      let consumed = false;
      let stickImpact = null;

      for (let p = this.shotPowers.length - 1; p >= 0; p -= 1) {
        const power = this.shotPowers[p];
        if (power.side !== a.side) continue;
        const hitR = power.r + a.r;
        if (dist2(a, power) <= hitR * hitR) {
          this.markArrowHit(a);
          const side = a.side === 'left' ? this.left : this.right;
          const slotIndex = Number.isFinite(a.archerSlot)
            ? Math.max(0, Math.min(this.archersPerSide - 1, a.archerSlot))
            : 0;
          if (!Array.isArray(side.pendingShotPowerBySlot)) {
            side.pendingShotPowerBySlot = Array.from({ length: this.archersPerSide }, () => ({ power: null, shots: 0 }));
          }
          side.pendingShotPowerBySlot[slotIndex] = {
            power: power.type,
            shots: 3 + Math.max(0, Number(side.powerLevel) || 0),
          };
          syncPendingShotPowerState(side);
          this.queueHitSfx('powerup', power.x, power.y, a.side, {
            targetArcherSlot: slotIndex,
          });
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
          let dragonHeartshot = false;
          let balloonHitCircleIndex = -1;
          if (minion.shieldBearer) {
            if (this.arrowInsideShieldBearerShield(a, minion, prevX, prevY)) {
              this.markArrowMiss(a);
              this.queueLine('BLOCKED', a.x, a.y - 12, minion.side);
              this.queueHitSfx('blocked', a.x, a.y, minion.side);
              consumed = true;
              continue;
            }
            shieldVulnerableHit = this.arrowHitsShieldBearerVulnerableZone(a, minion, prevX, prevY);
            if (!shieldVulnerableHit) continue;
          } else if (minion.dragon) {
            // Dragons can only be damaged through their heart core.
            const core = this.dragonHeartCore(minion);
            if (!core) continue;
            const hitR = core.r * 1.69 + a.r;
            if (dist2(a, core) > hitR * hitR) continue;
            dragonHeartshot = true;
          } else if (minion.balloon) {
            balloonHitCircleIndex = this.arrowHitsBalloonBody(a, minion, prevX, prevY);
            if (balloonHitCircleIndex < 0) continue;
          } else {
            const hitR = minion.r + a.r;
            if (dist2(a, minion) > hitR * hitR) continue;
          }

          this.markArrowHit(a);
          a.hitAnyUnit = true;
          if (a.powerType === 'flareShot' && a.mainArrow && !a.flareShotTriggered) {
            a.flareShotTriggered = true;
            this.spawnFlareShotCannonBall(a.side, minion.x, minion.y, a);
          }
          let damage = a.dmg;
          if (minion.digger) damage *= 0.76;
          if (minion.balloon && balloonHitCircleIndex === 0) damage *= 2;
          const shieldHeadshot = Boolean(minion.shieldBearer && shieldVulnerableHit === 'head');
          if (shieldHeadshot) damage *= SHIELD_HEADSHOT_DAMAGE_MULT;
          else if (minion.shieldBearer && shieldVulnerableHit === 'body') damage *= SHIELD_BODYSHOT_DAMAGE_MULT;
          if (dragonHeartshot) {
            const core = this.dragonHeartCore(minion);
            damage *= 2.2;
            this.queueHitSfx('dragon', core?.x ?? minion.x, core?.y ?? minion.y, a.side);
          } else if (!minion.balloon) {
            const attackerSide = a.side === 'right' ? this.right : this.left;
            const archerSlot = Number.isFinite(a?.archerSlot)
              ? Math.max(0, Math.floor(Number(a.archerSlot) || 0))
              : 0;
            this.queueHitSfx('minion', minion.x, minion.y, a.side, {
              archerSlot,
              comboHitStreak: Math.max(0, Number(attackerSide?.comboHitStreak) || 0),
              comboTier: Math.max(1, Number(this.comboTier(attackerSide)) || 1),
            });
          }
          consumed = a.pierce <= 0;
          if (consumed) {
            stickImpact = {
              x: Number.isFinite(a.x) ? a.x : minion.x,
              y: Number.isFinite(a.y) ? a.y : minion.y,
            };
          }
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

          this.dealDamageToMinion(minion, damage, a.side, 'arrow', a);
          if (dragonHeartshot) {
            minion.hitFlashTtl = Math.max(Number(minion.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL * 1.85);
          }
          minion.hitFlashTtl = Math.max(Number(minion.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
          if (minion.balloon && balloonHitCircleIndex >= 0) {
            minion.balloonHitCircleIndex = clamp(Math.round(balloonHitCircleIndex), 0, 1);
            minion.balloonHitCircleTtl = Math.max(Number(minion.balloonHitCircleTtl) || 0, MINION_HIT_FLASH_TTL);
          }
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
            const awarded = this.grantGold('left', gain, true);
            this.recordResourceGoldCollected('left', awarded, 'arrow', a);
            this.addUpgradeCharge(this.left, awarded);
          } else {
            const gain = this.goldFromResource(this.right, res.value);
            const awarded = this.grantGold('right', gain, true);
            this.recordResourceGoldCollected('right', awarded, 'arrow', a);
            this.addUpgradeCharge(this.right, awarded);
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
          if (this.committeeVotingRequiredForSide(a.side)) continue;
          if (mySide.upgradeCharge < mySide.upgradeChargeMax) continue;
          this.markArrowHit(a);
          consumed = this.selectUpgradeCard(a.side, card);
        }
      }

      if (consumed) {
        if (stickImpact) {
          this.stickArrowAtImpact(a, stickImpact.x, stickImpact.y);
          continue;
        }
        this.arrows.splice(i, 1);
      }
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
    arrow.stuckHitUnit = Boolean(arrow.hitAnyUnit);
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

  stickArrowAtImpact(arrow, hitX, hitY) {
    if (!arrow || arrow.stuck) return;
    const sideName = arrow.side === 'right' ? 'right' : 'left';
    const sideDir = sideName === 'left' ? 1 : -1;
    const incoming = Math.atan2(
      Number(arrow.vy) || 0,
      Number(arrow.vx) || sideDir * 120
    );
    const baseAngle = sideName === 'left' ? 0.26 : Math.PI - 0.26;
    const minAngle = sideName === 'left' ? -0.72 : Math.PI - 2.42;
    const maxAngle = sideName === 'left' ? 1.2 : Math.PI - (-0.72);
    const duration = ARROW_STUCK_IMPACT_DURATION;
    arrow.stuck = true;
    arrow.hitAnyUnit = true;
    arrow.stuckHitUnit = true;
    arrow.stuckTtl = duration;
    arrow.stuckTtlMax = duration;
    arrow.ttl = duration;
    arrow.launchDelay = 0;
    arrow.gravity = 0;
    arrow.vx = 0;
    arrow.vy = 0;
    arrow.x = clamp(Number(hitX) || 0, TOWER_X_LEFT + 24, TOWER_X_RIGHT - 24);
    arrow.y = clamp(Number(hitY) || 0, 24, WORLD_H - 24);
    arrow.stuckAngle = clamp(baseAngle * 0.5 + incoming * 0.5, minAngle, maxAngle);
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

    if (buckets?.left instanceof Map && buckets?.right instanceof Map) {
      const width = Math.max(1, bucketW);
      const scan = Math.max(1, Math.ceil(r / width));
      const centerCell = Math.floor(x / width);
      for (let cell = centerCell - scan; cell <= centerCell + scan; cell += 1) {
        const leftBucket = buckets.left.get(cell);
        if (leftBucket) {
          for (const other of leftBucket) {
            if (!other || other.removed) continue;
            if (!this.minionInsideRadius(other, x, y, r)) continue;
            fn(other);
          }
        }
        const rightBucket = buckets.right.get(cell);
        if (!rightBucket) continue;
        for (const other of rightBucket) {
          if (!other || other.removed) continue;
          if (!this.minionInsideRadius(other, x, y, r)) continue;
          fn(other);
        }
      }
      return;
    }

    for (const other of this.minions) {
      if (!other || other.removed) continue;
      if (!this.minionInsideRadius(other, x, y, r)) continue;
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

    if (buckets && buckets[enemySide] instanceof Map) {
      const scan = Math.max(1, Math.ceil(r / Math.max(1, bucketW)));
      const centerCell = Math.floor(x / Math.max(1, bucketW));
      for (let cell = centerCell - scan; cell <= centerCell + scan; cell += 1) {
        const bucket = buckets[enemySide].get(cell);
        if (!bucket) continue;
        for (const other of bucket) {
          if (!other || other.removed || other.side === sideName) continue;
          if (!this.minionInsideRadius(other, x, y, r)) continue;
          fn(other);
        }
      }
      return;
    }

    for (const other of this.minions) {
      if (!other || other.removed || other.side === sideName) continue;
      if (!this.minionInsideRadius(other, x, y, r)) continue;
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
    const awarded = this.grantGold(minion.side, gain, true);
    this.recordResourceGoldCollected(minion.side, awarded, 'digger');
    this.addUpgradeCharge(side, awarded);
    this.queueHitSfx('resource', res.x, res.y, minion.side);
    this.queueHitSfx('powerup', minion.x, minion.y - Math.max(6, minion.r * 0.3), minion.side);
    this.resources.splice(resourceIndex, 1);
    minion.diggerMineTargetId = null;
    minion.diggerMineT = 0;
    minion.atkCd = Math.max(Number(minion.atkCd) || 0, 0.38);
    return true;
  }

  balloonThrowAtMinion(balloon, target) {
    if (!balloon || !target) return;
    const toX = target.x;
    const toY = target.y - Math.max(4, target.r * 0.2);
    balloon.balloonThrowTtl = Math.max(Number(balloon.balloonThrowMaxTtl) || 0.6, 0.6);
    balloon.balloonThrowToX = toX;
    balloon.balloonThrowToY = toY;
    this.dealMinionDamage(balloon, target, balloon.dmg * 0.68, 'gunshot');
    if (target.hp <= 0) this.killMinionByRef(target, balloon.side, { goldScalar: 0.9 });
  }

  balloonThrowAtTower(balloon, enemySideName, enemyX, enemyY) {
    if (!balloon) return;
    balloon.balloonThrowTtl = Math.max(Number(balloon.balloonThrowMaxTtl) || 0.6, 0.6);
    balloon.balloonThrowToX = enemyX;
    balloon.balloonThrowToY = enemyY;
    this.applyMinionTowerDamage(balloon, enemySideName, balloon.dmg * BALLOON_THROW_TOWER_DAMAGE_MULT, enemyX, enemyY);
  }

  balloonDropBomb(balloon, enemySideName, targetX, targetY, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!balloon) return false;
    if (balloon.balloonBombImpactPending) return false;
    const bombOrigin = this.balloonPayloadOrigin(balloon, 'bomb');
    const level = Math.max(1, Number(balloon.balloonLevel) || 1);
    const upgraded = level > 1;
    const impactX = bombOrigin.x;
    const safeTargetY = Number.isFinite(targetY) ? Number(targetY) : (TOWER_Y - 26);
    const impactY = Math.max(safeTargetY, TOWER_Y - 26);
    // Keep bomb AoE radius gameplay-stable across upgrades.
    // Upgrades increase damage/cadence, not blast footprint.
    const blastRadius = BALLOON_BOMB_BASE_RADIUS;
    const damage = balloon.dmg * GUNNER_SKY_CANNON_MINION_DAMAGE_MULT * BALLOON_BOMB_DAMAGE_VS_CANNON_MULT;
    const towerDamageMult = upgraded ? BALLOON_HEAVY_BOMB_TOWER_DAMAGE_MULT : BALLOON_BOMB_TOWER_DAMAGE_MULT;
    const dropDistance = Math.max(36, impactY - (Number(bombOrigin.y) || impactY));
    const baseDropTtl = Math.max(
      BALLOON_BOMB_DROP_TTL_MIN,
      (dropDistance / GUNNER_SKY_CANNON_FALL_SPEED) * BALLOON_BOMB_DROP_TTL_MULT
    );
    const heavyDropTtl = Math.max(
      BALLOON_HEAVY_BOMB_DROP_TTL_MIN,
      (dropDistance / GUNNER_SKY_CANNON_FALL_SPEED) * BALLOON_HEAVY_BOMB_DROP_TTL_MULT
    );
    const dropTtl = upgraded ? heavyDropTtl : baseDropTtl;
    balloon.balloonBombMaxTtl = dropTtl;
    balloon.balloonBombTtl = dropTtl;
    balloon.balloonBombFromX = bombOrigin.x;
    balloon.balloonBombFromY = bombOrigin.y;
    balloon.balloonBombToX = impactX;
    balloon.balloonBombToY = impactY;
    balloon.balloonBombImpactPending = true;
    balloon.balloonBombBlastRadius = blastRadius;
    balloon.balloonBombDamage = damage;
    balloon.balloonBombTowerDamageMult = towerDamageMult;
    balloon.balloonBombEnemySideName = enemySideName;
    return true;
  }

  resolveBalloonBombImpact(balloon, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!balloon || !balloon.balloonBombImpactPending) return;
    const impactX = Number(balloon.balloonBombToX);
    const impactY = Number(balloon.balloonBombToY);
    if (!Number.isFinite(impactX) || !Number.isFinite(impactY)) {
      balloon.balloonBombImpactPending = false;
      return;
    }
    // Consume the pending flag up front so chained balloon deaths cannot
    // re-enter the same impact while this explosion is still resolving.
    balloon.balloonBombImpactPending = false;
    const blastRadius = Math.max(1, Number(balloon.balloonBombBlastRadius) || 0);
    const damage = Math.max(0, Number(balloon.balloonBombDamage) || 0);
    const enemySideName = balloon.balloonBombEnemySideName === 'left' ? 'left' : 'right';
    const towerDamageMult = Math.max(0, Number(balloon.balloonBombTowerDamageMult) || 0);
    const enemyTowerX = enemySideName === 'right' ? TOWER_X_RIGHT : TOWER_X_LEFT;
    const enemyTowerY = TOWER_Y - 24;
    this.queueHitSfx('foodburst', impactX, impactY, balloon.side, {
      foodType: balloon.side === 'left' ? 'bread' : 'rice',
      heavy: (Number(balloon.balloonLevel) || 1) > 1,
    });
    this.forEachEnemyMinionInRadius(
      balloon.side,
      impactX,
      impactY,
      blastRadius,
      minionBuckets,
      bucketW,
      (other) => {
        if (!other || other.removed || other.side === balloon.side) return;
        this.dealMinionDamage(balloon, other, damage, 'explosion');
        if (other.hp <= 0) this.killMinionByRef(other, balloon.side, { goldScalar: 0.76 });
      }
    );
    const dx = enemyTowerX - impactX;
    const dy = enemyTowerY - impactY;
    if (dx * dx + dy * dy <= (blastRadius + 44) * (blastRadius + 44)) {
      this.applyMinionTowerDamage(balloon, enemySideName, damage * towerDamageMult, enemyTowerX, enemyTowerY);
    }
    // Keep a short post-impact visual phase so the blast is readable.
    balloon.balloonBombFromX = impactX;
    balloon.balloonBombFromY = impactY;
    balloon.balloonBombToX = impactX;
    balloon.balloonBombToY = impactY;
    balloon.balloonBombMaxTtl = BALLOON_BOMB_EXPLOSION_VISUAL_TTL;
    balloon.balloonBombTtl = BALLOON_BOMB_EXPLOSION_VISUAL_TTL;
  }

  balloonBombCooldown(balloon) {
    const level = Math.max(1, Number(balloon?.balloonLevel) || 1);
    if (level > 1) {
      return BALLOON_HEAVY_BOMB_INTERVAL_MIN
        + Math.random() * (BALLOON_HEAVY_BOMB_INTERVAL_MAX - BALLOON_HEAVY_BOMB_INTERVAL_MIN);
    }
    return Math.max(
      1.2,
      (BALLOON_BOMB_BASE_INTERVAL + Math.random() * BALLOON_BOMB_INTERVAL_JITTER)
        * Math.max(0.72, 1 - (level - 1) * 0.07)
    );
  }

  balloonPayloadOrigin(balloon, payload = 'throw') {
    if (!balloon) return { x: 0, y: 0 };
    const x = Number(balloon.x) || 0;
    const y = Number(balloon.y) || 0;
    const r = Math.max(16, Number(balloon.r) || 16);
    const dir = balloon.side === 'left' ? 1 : -1;
    const bodyY = y + r * 0.98;
    if (payload === 'bomb') {
      return {
        x: x + dir * r * 0.06,
        y: bodyY + r * 0.22,
      };
    }
    return {
      x: x + dir * r * 0.14,
      y: bodyY + r * 0.08,
    };
  }

  balloonHealthDropOffset(balloon, dt = null) {
    if (!balloon) return 0;
    const maxHp = Math.max(1, Number(balloon.maxHp) || 1);
    const hp = clamp(Number(balloon.hp) || 0, 0, maxHp);
    const targetDrop = BALLOON_HEALTH_DROP_MAX * (1 - hp / maxHp);
    if (!Number.isFinite(balloon.balloonHealthDropVisual)) {
      balloon.balloonHealthDropVisual = targetDrop;
      return clamp(targetDrop, 0, BALLOON_HEALTH_DROP_MAX);
    }
    if (Number.isFinite(dt) && dt > 0) {
      const maxStep = BALLOON_HEALTH_DROP_SMOOTH_PER_SEC * dt;
      const delta = clamp(targetDrop - balloon.balloonHealthDropVisual, -maxStep, maxStep);
      balloon.balloonHealthDropVisual += delta;
    }
    return clamp(Number(balloon.balloonHealthDropVisual) || 0, 0, BALLOON_HEALTH_DROP_MAX);
  }

  balloonFlightBand(balloon, dt = null) {
    const drop = this.balloonHealthDropOffset(balloon, dt);
    const minY = BALLOON_TOP_MIN_Y;
    const maxY = Math.min(BALLOON_LOW_HP_MAX_Y, BALLOON_TOP_MAX_Y + drop);
    return { minY, maxY, drop };
  }

  balloonSoftClampY(y, minY, maxY, dt) {
    if (!Number.isFinite(y)) return clamp(TOWER_Y - 120, minY, maxY);
    if (!Number.isFinite(dt) || dt <= 0) return clamp(y, minY, maxY);
    const maxStep = BALLOON_BAND_RECOVER_PER_SEC * dt;
    if (y < minY) return Math.min(minY, y + maxStep);
    if (y > maxY) return Math.max(maxY, y - maxStep);
    return y;
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
      if (!Number.isFinite(m.balloonHitCircleIndex)) m.balloonHitCircleIndex = -1;
      if (!Number.isFinite(m.balloonHitCircleTtl)) m.balloonHitCircleTtl = 0;
      if (!Number.isFinite(m.balloonHealthDropVisual)) m.balloonHealthDropVisual = null;
      if (!Number.isFinite(m.balloonThrowTtl)) m.balloonThrowTtl = 0;
      if (!Number.isFinite(m.balloonThrowMaxTtl) || m.balloonThrowMaxTtl <= 0) m.balloonThrowMaxTtl = 0.6;
      if (!Number.isFinite(m.balloonBombTtl)) m.balloonBombTtl = 0;
      if (!Number.isFinite(m.balloonBombMaxTtl) || m.balloonBombMaxTtl <= 0) m.balloonBombMaxTtl = 0.52;
      if (!Number.isFinite(m.balloonBombCd)) m.balloonBombCd = 0;
      if (!Number.isFinite(m.balloonBombFromX)) m.balloonBombFromX = null;
      if (!Number.isFinite(m.balloonBombFromY)) m.balloonBombFromY = null;
      if (!Number.isFinite(m.balloonBombBlastRadius)) m.balloonBombBlastRadius = 0;
      if (!Number.isFinite(m.balloonBombDamage)) m.balloonBombDamage = 0;
      if (!Number.isFinite(m.balloonBombTowerDamageMult)) m.balloonBombTowerDamageMult = BALLOON_BOMB_TOWER_DAMAGE_MULT;
      if (m.balloonBombEnemySideName !== 'left' && m.balloonBombEnemySideName !== 'right') {
        m.balloonBombEnemySideName = m.side === 'left' ? 'right' : 'left';
      }
      if (typeof m.totalFeedingGrainPicked !== 'boolean') m.totalFeedingGrainPicked = false;
      if (typeof m.totalFeedingGrainThrown !== 'boolean') m.totalFeedingGrainThrown = false;
      if (m.totalFeedingGrainFoodType !== 'rice' && m.totalFeedingGrainFoodType !== 'bread') {
        m.totalFeedingGrainFoodType = m.side === 'right' ? 'rice' : 'bread';
      }
      if (!Number.isFinite(m.totalFeedingGrainJumpTtl)) m.totalFeedingGrainJumpTtl = 0;
      if (!Number.isFinite(m.totalFeedingGrainJumpMaxTtl) || m.totalFeedingGrainJumpMaxTtl <= 0) {
        m.totalFeedingGrainJumpMaxTtl = TOTAL_FEEDING_GRAIN_JUMP_TTL;
      }
      if (!Number.isFinite(m.totalFeedingGrainJumpFromX)) m.totalFeedingGrainJumpFromX = null;
      if (!Number.isFinite(m.totalFeedingGrainJumpFromY)) m.totalFeedingGrainJumpFromY = null;
      if (!Number.isFinite(m.totalFeedingGrainJumpToX)) m.totalFeedingGrainJumpToX = null;
      if (!Number.isFinite(m.totalFeedingGrainJumpToY)) m.totalFeedingGrainJumpToY = null;
      if (!Number.isFinite(m.totalFeedingGrainJumpArc)) m.totalFeedingGrainJumpArc = 0;
      if (typeof m.balloonBombImpactPending !== 'boolean') m.balloonBombImpactPending = false;
      m.balloonThrowTtl = Math.max(0, m.balloonThrowTtl - dt);
      const prevBombTtl = Math.max(0, Number(m.balloonBombTtl) || 0);
      m.balloonBombTtl = Math.max(0, prevBombTtl - dt);
      if (m.balloonThrowTtl === 0) {
        m.balloonThrowToX = null;
        m.balloonThrowToY = null;
      }
      if (prevBombTtl > 0 && m.balloonBombTtl === 0 && m.balloonBombImpactPending) {
        this.resolveBalloonBombImpact(m, targetBuckets, MINION_TARGET_BUCKET_W);
      }
      if (m.balloonBombTtl === 0) {
        m.balloonBombFromX = null;
        m.balloonBombFromY = null;
        m.balloonBombToX = null;
        m.balloonBombToY = null;
        m.balloonBombBlastRadius = 0;
        m.balloonBombDamage = 0;
        m.balloonBombImpactPending = false;
      }
      m.hitFlashTtl = Math.max(0, m.hitFlashTtl - dt);
      m.balloonHitCircleTtl = Math.max(0, m.balloonHitCircleTtl - dt);
      if (m.balloonHitCircleTtl <= 0) m.balloonHitCircleIndex = -1;
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
      if (m.balloon) {
        const sideState = m.side === 'right' ? this.right : this.left;
        m.balloonLevel = Math.max(1, Number(sideState?.balloonLevel) || Number(m.balloonLevel) || 1);
        m.flying = true;
        m.balloonBombCd = Math.max(0, (Number(m.balloonBombCd) || 0) - dt);
      }
      if (m.gunFlashTtl > 0) m.gunFlashTtl = Math.max(0, m.gunFlashTtl - dt);
      if ((Number(m.executiveOrderBreakTtl) || 0) > 0) {
        m.executiveOrderBreakTtl = Math.max(0, (Number(m.executiveOrderBreakTtl) || 0) - dt);
      }
      if (m.gunner) {
        if (!Number.isFinite(m.gunnerSkyCannonCd)) {
          m.gunnerSkyCannonCd = GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER;
        }
        if (!Number.isFinite(m.gunnerFoodThrowCd)) m.gunnerFoodThrowCd = 0;
        const sideState = m.side === 'right' ? this.right : this.left;
        m.gunnerSkyCannonUpgraded = (Number(sideState?.gunnerSkyCannonLevel) || 0) > 0;
        m.gunnerFoodThrowUnlocked = (Number(sideState?.gunnerSkyCannonLevel) || 0) >= GUNNER_FOOD_THROW_UNLOCK_LEVEL;
        if ((Number(sideState?.gunnerSkyCannonLevel) || 0) > 0) {
          m.gunnerSkyCannonCd = Math.max(0, m.gunnerSkyCannonCd - dt);
        } else {
          m.gunnerSkyCannonCd = GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER;
        }
      }
      if (m.heroLineCd > 0) m.heroLineCd = Math.max(0, m.heroLineCd - dt);
      if (m.hero) {
        if (!Number.isFinite(m.heroSwing)) m.heroSwing = 0;
        if (!Number.isFinite(m.heroSwingDir) || m.heroSwingDir === 0) m.heroSwingDir = 1;
        if (!Number.isFinite(m.heroSwingAttackT)) m.heroSwingAttackT = 0;
        if (m.heroSwingAttackT > 0) {
          m.heroSwingAttackT = Math.max(0, m.heroSwingAttackT - dt);
          const swingT = 1 - (m.heroSwingAttackT / Math.max(0.0001, HERO_SWING_ATTACK_WINDOW));
          const swingArc = Math.sin(Math.max(0, Math.min(1, swingT)) * Math.PI);
          m.heroSwing = (m.heroSwingDir < 0 ? -1 : 1) * swingArc;
        } else {
          m.heroSwing += (0 - m.heroSwing) * Math.min(1, dt * HERO_SWING_IDLE_RETURN_SPEED);
          if (Math.abs(m.heroSwing) < 0.001) m.heroSwing = 0;
        }
        const sideState = m.side === 'right' ? this.right : this.left;
        this.tickHeroAbilities(m, sideState, dt, targetBuckets, MINION_TARGET_BUCKET_W);
      }
      if (m.heroCooker) {
        if (!Number.isFinite(m.heroCookerCookTtl)) m.heroCookerCookTtl = HERO_COOKER_COOK_TIME;
        if (!Number.isFinite(m.heroCookerCookMaxTtl) || m.heroCookerCookMaxTtl <= 0) {
          m.heroCookerCookMaxTtl = HERO_COOKER_COOK_TIME;
        }
        if (!Number.isFinite(m.heroCookerAnimT)) m.heroCookerAnimT = 0;
        if (!Number.isFinite(m.heroCookerSpin)) m.heroCookerSpin = 0;
        if (!Number.isFinite(m.heroCookerBubbleCd)) m.heroCookerBubbleCd = 0.24;
        if (!Number.isFinite(m.heroCookerEatCount)) m.heroCookerEatCount = 0;
        if (typeof m.heroCookerFoodType !== 'string') m.heroCookerFoodType = (m.side === 'right' ? 'rice' : 'bread');
        if (typeof m.heroCookerState !== 'string') m.heroCookerState = 'hunting';
      }
      if (m.shieldBearer) {
        m.dmg = 0;
        if (!Number.isFinite(m.shieldPushCd)) m.shieldPushCd = SHIELD_PUSH_INTERVAL;
        m.shieldPushCd = Math.max(0, m.shieldPushCd - dt);
        if (!Number.isFinite(m.shieldPushTtl)) m.shieldPushTtl = 0;
        m.shieldPushTtl = Math.max(0, m.shieldPushTtl - dt);
        if (!Number.isFinite(m.shieldPushScale) || m.shieldPushScale < 1) m.shieldPushScale = SHIELD_PUSH_SCALE;
        // Keep shield position static per user request.
        m.shieldGuardTarget = 0;
        m.shieldGuardPose = 0;
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
        if (!Number.isFinite(m.golemBiteCd)) m.golemBiteCd = 0;
        m.golemBiteCd = Math.max(0, m.golemBiteCd - dt);
        if (!Number.isFinite(m.golemBiteJumpTtl)) m.golemBiteJumpTtl = 0;
        if (!Number.isFinite(m.golemBiteJumpMaxTtl) || m.golemBiteJumpMaxTtl <= 0) m.golemBiteJumpMaxTtl = STONE_GOLEM_BITE_JUMP_TTL;
        if (!Number.isFinite(m.golemBiteLandTtl)) m.golemBiteLandTtl = 0;
        if (!Number.isFinite(m.golemBiteLandMaxTtl) || m.golemBiteLandMaxTtl <= 0) m.golemBiteLandMaxTtl = STONE_GOLEM_BITE_LAND_TTL;
        if (!Number.isFinite(m.golemBiteChewTickTtl)) m.golemBiteChewTickTtl = 0;
        if (!Number.isFinite(m.golemBiteTargetId)) m.golemBiteTargetId = 0;
        if (!Number.isFinite(m.golemBiteHeldTargetId)) m.golemBiteHeldTargetId = 0;
        if (!Number.isFinite(m.golemBiteStartY)) m.golemBiteStartY = m.y;
        if (!Number.isFinite(m.golemBiteJumpLift)) m.golemBiteJumpLift = 0;
        if (!Number.isFinite(m.golemBiteAnimT)) m.golemBiteAnimT = 0;
      }
      if (!Number.isFinite(m.golemBiteLockTtl)) m.golemBiteLockTtl = 0;
      m.golemBiteLockTtl = Math.max(0, m.golemBiteLockTtl - dt);
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
      if (this.tickStoneGolemFling(m, dt)) continue;
      if ((Number(m.golemBiteLockTtl) || 0) > 0 && !m.stoneGolem) {
        m.atkCd = Math.max(m.atkCd, 0.3);
        continue;
      }
      if (m.president) {
        const sideState = m.side === 'right' ? this.right : this.left;
        m.presidentExecutiveOrderUpgraded = (Number(sideState?.presidentExecutiveOrderLevel) || 0) > 0;
        if (!Number.isFinite(m.presidentExecutiveOrderCd)) {
          m.presidentExecutiveOrderCd = presidentExecutiveOrderCooldown();
        }
        if (!Number.isFinite(m.presidentExecutiveOrderSignTtl)) m.presidentExecutiveOrderSignTtl = 0;
        if (!Number.isFinite(m.presidentExecutiveOrderSignMaxTtl) || m.presidentExecutiveOrderSignMaxTtl <= 0) {
          m.presidentExecutiveOrderSignMaxTtl = PRESIDENT_EXECUTIVE_ORDER_SIGN_TTL;
        }
        if (!Number.isFinite(m.presidentExecutiveOrderBeamTtl)) m.presidentExecutiveOrderBeamTtl = 0;
        if (!Number.isFinite(m.presidentExecutiveOrderBeamMaxTtl) || m.presidentExecutiveOrderBeamMaxTtl <= 0) {
          m.presidentExecutiveOrderBeamMaxTtl = PRESIDENT_EXECUTIVE_ORDER_BEAM_TTL;
        }
        m.presidentExecutiveOrderSignTtl = Math.max(0, m.presidentExecutiveOrderSignTtl - dt);
        m.presidentExecutiveOrderBeamTtl = Math.max(0, m.presidentExecutiveOrderBeamTtl - dt);
        if (m.presidentExecutiveOrderBeamTtl === 0) {
          m.presidentExecutiveOrderBeamToX = null;
          m.presidentExecutiveOrderBeamToY = null;
        }
        if (m.presidentExecutiveOrderUpgraded) {
          m.presidentExecutiveOrderCd = Math.max(0, m.presidentExecutiveOrderCd - dt);
        } else {
          m.presidentExecutiveOrderCd = 0;
        }
        this.tickPresident(m, dt);
        continue;
      }
      if (m.monk) {
        const sideState = m.side === 'right' ? this.right : this.left;
        m.monkHealCircleUpgraded = (Number(sideState?.monkHealCircleLevel) || 0) > 0;
        this.tickMonk(m, dt);
        continue;
      }
      if (m.heroCooker) {
        this.tickHeroCooker(m, dt, targetBuckets, MINION_TARGET_BUCKET_W);
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
      if (m.shieldBearer) {
        if (!Number.isFinite(m.shieldBaseY)) m.shieldBaseY = m.y;
        if (!Number.isFinite(m.shieldBobPhase)) m.shieldBobPhase = Math.random() * Math.PI * 2;
        m.shieldBobPhase += dt * (1.18 + Math.min(0.45, m.speed / 180));
        const shieldBobAmp = 1.2 + Math.min(1.6, (Number(m.r) || 20) * 0.035);
        m.y = clamp(
          m.shieldBaseY + Math.sin(m.shieldBobPhase) * shieldBobAmp,
          TOWER_Y - 170,
          TOWER_Y + 170
        );
      }
      if (m.flying) {
        if (!Number.isFinite(m.flyBaseY)) m.flyBaseY = m.y;
        if (!Number.isFinite(m.flyPhase)) m.flyPhase = Math.random() * Math.PI * 2;
        const isBalloon = Boolean(m.balloon);
        m.flyPhase += dt * (isBalloon ? (0.82 + Math.min(0.5, m.speed / 220)) : (1.45 + Math.min(1.1, m.speed / 130)));
        const amp = isBalloon ? (8 + m.r * 0.14) : (12 + m.r * 0.22);
        const flight = isBalloon ? this.balloonFlightBand(m, dt) : null;
        const minY = isBalloon ? flight.minY : (TOWER_Y - 220);
        const maxY = isBalloon ? flight.maxY : (TOWER_Y + 150);
        const rawY = m.flyBaseY + Math.sin(m.flyPhase) * amp;
        m.y = isBalloon
          ? this.balloonSoftClampY(rawY, minY, maxY, dt)
          : clamp(rawY, minY, maxY);
      }
      const enemySideName = m.side === 'left' ? 'right' : 'left';
      const enemyX = m.side === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
      const dir = m.side === 'left' ? 1 : -1;
      this.processTotalFeedingGrainStateForMinion(m, enemySideName);
      if (this.tickTotalFeedingGrainJumpForMinion(m, dt, enemyX)) {
        m.atkCd = Math.max(m.atkCd, 0.08);
        continue;
      }
      if (m.rider) this.refreshRiderChargeState(m);
      const advanceSpeed = this.minionAdvanceSpeed(m);
      const mySideState = m.side === 'right' ? this.right : this.left;
      if (m.gunner) this.tickGunnerFoodThrow(m, dt, targetBuckets, MINION_TARGET_BUCKET_W);
      if (m.stoneGolem && this.tickStoneGolemBite(m, dt, enemySideName, enemyX, targetBuckets, MINION_TARGET_BUCKET_W)) {
        m.atkCd = Math.max(m.atkCd, 0.18);
        continue;
      }
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
        // Backline rule:
        // 1) Lead necro stays behind the most front ally.
        // 2) Additional necros choose (persistently) a 50/50 anchor:
        //    - behind second-most-front ally
        //    - behind the necro ahead of them.
        const homeX = m.side === 'left' ? TOWER_X_LEFT + 78 : TOWER_X_RIGHT - 78;
        const forwardSort = m.side === 'left'
          ? ((a, b) => (Number(b?.x) || 0) - (Number(a?.x) || 0))
          : ((a, b) => (Number(a?.x) || 0) - (Number(b?.x) || 0));
        const frontlineAllies = [];
        const expertNecros = [m];
        for (const ally of this.minions) {
          if (!ally || ally.side !== m.side || ally.id === m.id || ally.removed) continue;
          if ((Number(ally.hp) || 0) <= 0) continue;
          if (ally.necrominion && ally.necroExpertUpgraded) {
            expertNecros.push(ally);
            continue;
          }
          if (ally.monk || ally.president) continue;
          frontlineAllies.push(ally);
        }
        frontlineAllies.sort(forwardSort);
        expertNecros.sort(forwardSort);

        const myNecroRank = expertNecros.findIndex((ally) => ally.id === m.id);
        const leadFront = frontlineAllies[0] || null;
        const rankFront = (myNecroRank > 0 && frontlineAllies.length > 0)
          ? (frontlineAllies[Math.min(frontlineAllies.length - 1, myNecroRank)] || leadFront)
          : leadFront;
        let anchor = leadFront;

        if (expertNecros.length > 1 && myNecroRank > 0) {
          if (m.necroBacklineMode !== 'second' && m.necroBacklineMode !== 'necro') {
            m.necroBacklineMode = Math.random() < 0.5 ? 'second' : 'necro';
          }
          if (m.necroBacklineMode === 'necro') {
            anchor = expertNecros[myNecroRank - 1] || rankFront || leadFront;
          } else {
            anchor = rankFront || leadFront || expertNecros[myNecroRank - 1] || null;
          }
        }

        const anchorX = Number(anchor?.x);
        const anchorY = Number(anchor?.y);
        const fallbackFrontX = this.allyFrontX(m.side, m.id);
        const frontRef = Number.isFinite(anchorX)
          ? anchorX
          : (Number.isFinite(fallbackFrontX) ? fallbackFrontX : homeX + dir * 120);
        const monkKeepBehind = Math.max(90, 138 + (Math.max(1, Number(mySideState?.spawnLevel) || 1) * 3));
        const extraBack = Math.max(18, Number(m.r) || 14);
        let keepBehind = monkKeepBehind + extraBack;
        if (anchor) {
          const maxBackGap = Math.max(
            40,
            NECRO_EXPERT_REVIVE_RADIUS
              - Math.max(0, Number(m.r) || 14)
              - Math.max(0, Number(anchor.r) || 14)
              - 8
          );
          keepBehind = Math.min(keepBehind, maxBackGap);
        }

        let desiredX = frontRef - dir * keepBehind;
        desiredX = clamp(desiredX, TOWER_X_LEFT + 56, TOWER_X_RIGHT - 56);
        const advanceLimit = enemyX - dir * 110;
        if (m.side === 'left') desiredX = Math.min(desiredX, advanceLimit);
        else desiredX = Math.max(desiredX, advanceLimit);
        if (m.side === 'left') desiredX = Math.max(desiredX, homeX);
        else desiredX = Math.min(desiredX, homeX);

        let desiredY = Number.isFinite(anchorY) ? anchorY : m.y;

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
          : (m.balloon
              ? 430
          : (m.dragon
              ? 170
              : (m.gunner
                  ? (m.gunRange || 220)
                  : m.r + 24 + (m.digger ? 14 : 0) + (m.hero ? 24 : 0) + MINION_TARGET_RADIUS_PAD))));
      const scan = Math.max(1, Math.ceil(maxReach / MINION_TARGET_BUCKET_W));
      const centerCell = Math.floor((Number.isFinite(m.x) ? m.x : 0) / MINION_TARGET_BUCKET_W);
      const enemyBuckets = targetBuckets[enemySideName];
      for (let cell = centerCell - scan; cell <= centerCell + scan; cell += 1) {
        const bucket = enemyBuckets.get(cell);
        if (!bucket) continue;
        for (const other of bucket) {
          if (!other || other.removed || other.side === m.side || other.id === m.id) continue;
          if (m.stoneGolem && other.flying) continue;
          const dx = other.x - m.x;
          const dy = other.y - m.y;
          const d2 = dx * dx + dy * dy;
          const reach = m.stoneGolem
            ? STONE_GOLEM_SMASH_RADIUS
            : (m.shieldBearer
            ? Math.max(58, m.r + other.r + 22)
            : (m.balloon
                ? 430
            : (m.dragon
                ? 170
                : (m.gunner
                    ? (m.gunRange || 220)
                    : m.r + other.r + 24 + (m.digger ? 14 : 0) + (m.hero ? 24 : 0)))));
          if (d2 < bestSq && d2 < reach * reach) {
            target = other;
            bestSq = d2;
          }
        }
      }

      if (m.stoneGolem) {
        const biteTarget = this.findStoneGolemBiteTarget(m, targetBuckets, MINION_TARGET_BUCKET_W);
        if (biteTarget) {
          const step = Math.max(18, Number(m.speed) || 0) * dt;
          const dxFly = (Number(biteTarget.x) || 0) - (Number(m.x) || 0);
          if (Math.abs(dxFly) > 2) m.x += clamp(dxFly, -step, step);
          const biteBusy = (Number(m.golemBiteJumpTtl) || 0) > 0
            || (Number(m.golemBiteLandTtl) || 0) > 0
            || (Number(m.golemBiteHeldTargetId) || 0) > 0;
          if (!biteBusy && (Number(m.golemBiteCd) || 0) <= 0) {
            this.startStoneGolemBite(m, biteTarget);
          }
          m.atkCd = Math.max(m.atkCd, 0.24);
          continue;
        }
      }

      if (m.balloon) {
        const towerTargetY = TOWER_Y - 26;
        const towerInRange = Math.abs(m.x - enemyX) <= 252;
        const attackTarget = target;
        const isEnemyUnit = (other) => Boolean(other) && !other.removed && other.side !== m.side && other.id !== m.id;
        const isGroundEnemy = (other) => isEnemyUnit(other) && !other.flying && !other.balloon;
        let closestGroundTarget = null;
        let closestGroundSq = Infinity;
        const midfieldX = WORLD_W * 0.5;
        const enemySidePad = 6;
        const enemyHalfMinX = enemySideName === 'right' ? (midfieldX + enemySidePad) : -Infinity;
        const enemyHalfMaxX = enemySideName === 'left' ? (midfieldX - enemySidePad) : Infinity;
        const balloonScan = Math.max(1, Math.ceil(430 / MINION_TARGET_BUCKET_W));
        for (let cell = centerCell - balloonScan; cell <= centerCell + balloonScan; cell += 1) {
          const bucket = enemyBuckets.get(cell);
          if (!bucket) continue;
          for (const other of bucket) {
            if (!isEnemyUnit(other)) continue;
            const dx = other.x - m.x;
            const dy = other.y - m.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 430 * 430) continue;
            if (isGroundEnemy(other) && d2 < closestGroundSq) {
              closestGroundSq = d2;
              closestGroundTarget = other;
            }
          }
        }
        if ((Number(m.balloonBombCd) || 0) === 0) {
          const bombTarget = attackTarget || closestGroundTarget;
          if (bombTarget) {
            const dropped = this.balloonDropBomb(
              m,
              enemySideName,
              bombTarget.x,
              bombTarget.y,
              targetBuckets,
              MINION_TARGET_BUCKET_W
            );
            if (dropped) {
              m.balloonBombCd = this.balloonBombCooldown(m);
              m.atkCd = Math.max(m.atkCd, 0.22);
            }
          } else if (towerInRange) {
            const dropped = this.balloonDropBomb(
              m,
              enemySideName,
              enemyX,
              towerTargetY,
              targetBuckets,
              MINION_TARGET_BUCKET_W
            );
            if (dropped) {
              m.balloonBombCd = this.balloonBombCooldown(m);
              m.atkCd = Math.max(m.atkCd, 0.22);
            }
          }
        }

        if (closestGroundTarget) {
          // Movement priority: stay above the closest enemy ground unit, while staying on enemy half.
          const trackedX = Number.isFinite(closestGroundTarget.x) ? Number(closestGroundTarget.x) : (Number(m.x) || 0);
          const clampedTargetX = clamp(trackedX, enemyHalfMinX, enemyHalfMaxX);
          const dxToTarget = clampedTargetX - (Number(m.x) || 0);
          const alignPad = Math.max(10, (Number(closestGroundTarget.r) || 14) * 0.38);
          if (Math.abs(dxToTarget) > alignPad) {
            const moveStep = Math.max(20, Number(m.speed) || 0) * dt;
            m.x += clamp(dxToTarget, -moveStep, moveStep);
          }
        }

        if (attackTarget) {
          if (m.atkCd === 0) {
            this.balloonThrowAtMinion(m, attackTarget);
            m.atkCd = 0.82;
          }
        } else if (towerInRange) {
          if (m.atkCd === 0) {
            this.balloonThrowAtTower(m, enemySideName, enemyX, towerTargetY);
            m.atkCd = 0.92;
          }
        } else if (!closestGroundTarget) {
          const moveDx = dir * advanceSpeed * dt;
          m.x += moveDx;
          if (m.rider) this.refreshRiderChargeState(m, Math.abs(moveDx) > 0.001);
        }

        if (m.flying) {
          const flight = this.balloonFlightBand(m, dt);
          const desiredY = clamp(
            (TOWER_Y - 362) + flight.drop,
            flight.minY + 10,
            Math.max(flight.minY + 10, flight.maxY - 10)
          );
          m.flyBaseY += (desiredY - m.flyBaseY) * Math.min(1, dt * 1.7);
        }
        continue;
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
            m.atkCd = HERO_SWING_ATTACK_INTERVAL;
            this.triggerHeroAttackSwing(m);
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
            const moveDx = dir * advanceSpeed * dt;
            m.x += moveDx;
            if (m.rider) this.refreshRiderChargeState(m, Math.abs(moveDx) > 0.001);
          } else if (m.atkCd === 0) {
            this.stoneGolemSmash(m, enemySideName, enemyX, targetBuckets, MINION_TARGET_BUCKET_W);
            m.atkCd = STONE_GOLEM_SMASH_INTERVAL;
          }
        } else if (m.shieldBearer) {
          if (m.shieldPushCd === 0) this.triggerShieldPush(m, targetBuckets, MINION_TARGET_BUCKET_W);
          const holdDist = Math.max(58, m.r + target.r + 18);
          if (Math.abs(target.x - m.x) > holdDist) {
            const moveDx = dir * advanceSpeed * dt;
            m.x += moveDx;
            if (m.rider) this.refreshRiderChargeState(m, Math.abs(moveDx) > 0.001);
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
            m.atkCd = HERO_SWING_ATTACK_INTERVAL;
          } else if (m.digger) {
            this.dealMinionDamage(m, target, m.dmg, 'melee');
            m.atkCd = 1.18;
          } else {
            this.dealMinionDamage(m, target, m.dmg, 'melee');
            m.atkCd = 0.8;
          }
        }
      } else if (Math.abs(m.x - enemyX) < m.r + 20 + (m.flying ? 34 : 0) + (m.dragon ? 50 : 0) + (m.balloon ? 228 : 0) + (m.gunner ? Math.max(0, (m.gunRange || 0) - 40) : 0) + (m.rider ? 14 : 0) + (m.digger ? 8 : 0) + (m.hero ? 24 : 0) + (m.shieldBearer ? 26 : 0) + (m.stoneGolem ? 58 : 0)) {
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
            m.atkCd = HERO_SWING_ATTACK_INTERVAL;
          } else if (m.digger) {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg, enemyX, TOWER_Y - 10);
            m.atkCd = 1.22;
          } else {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg, enemyX, TOWER_Y - 18);
            m.atkCd = 0.65;
          }
        }
      } else {
        const moveDx = dir * advanceSpeed * dt;
        m.x += moveDx;
        if (m.rider) this.refreshRiderChargeState(m, Math.abs(moveDx) > 0.001);
        if (m.flying) {
          let desiredY = TOWER_Y - 120;
          if (m.balloon) {
            const flight = this.balloonFlightBand(m, dt);
            desiredY = clamp(
              (TOWER_Y - 120) + flight.drop * 0.55,
              flight.minY + 10,
              Math.max(flight.minY + 10, flight.maxY - 10)
            );
          }
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
    const progress = Math.max(0, this.sideUpgradeScore(side));
    const sideName = this.sideNameFromStateRef(side);
    const enemySide = sideName === 'left'
      ? this.right
      : (sideName === 'right' ? this.left : null);
    const referenceHp = Math.max(
      1,
      enemySide
        ? this.statMinionHp(enemySide)
        : NORMAL_MINION_HP_REFERENCE
    );
    const ratio = clamp(
      ARROW_DAMAGE_BASE_UNIT_HP_FRACTION + progress * ARROW_DAMAGE_PER_UPGRADE_FRACTION,
      ARROW_DAMAGE_MIN_UNIT_HP_FRACTION,
      ARROW_DAMAGE_MAX_UNIT_HP_FRACTION
    );
    const minDamage = referenceHp * ARROW_DAMAGE_MIN_UNIT_HP_FRACTION;
    const maxDamage = referenceHp * ARROW_DAMAGE_MAX_UNIT_HP_FRACTION;
    return clamp(referenceHp * ratio, minDamage, maxDamage);
  }

  statArrowCount(side) {
    const volleyCap = Number.isFinite(UPGRADE_LEVEL_CAPS.volleyLevel)
      ? Math.max(0, Math.floor(UPGRADE_LEVEL_CAPS.volleyLevel))
      : Number.POSITIVE_INFINITY;
    const volley = Math.max(0, Math.round(Number(side?.volleyLevel) || 0));
    return 1 + Math.min(volleyCap, volley);
  }

  comboProgress(side) {
    return Math.max(0, Math.min(1, (side.comboHitStreak || 0) / COMBO_MAX_STREAK));
  }

  comboTier(side) {
    const streak = Math.max(0, Math.min(COMBO_MAX_STREAK, side?.comboHitStreak || 0));
    if (streak >= COMBO_MAX_STREAK) return 4;
    if (streak >= 7) return 3;
    if (streak >= 4) return 2;
    return 1;
  }

  comboMultiplier(side) {
    return this.comboTier(side);
  }

  hasMaxCombo(side) {
    return Math.max(0, side?.comboHitStreak || 0) >= COMBO_MAX_STREAK;
  }

  comboOverdriveStacks(side) {
    const streak = Math.max(0, Math.floor(Number(side?.comboHitStreak) || 0));
    return Math.max(0, streak - COMBO_MAX_STREAK);
  }

  isTotalFeedingActive() {
    return Boolean(this.totalFeedingActive) || this.t >= TOTAL_FEEDING_TRIGGER_SECONDS;
  }

  totalFeedingSpawnEveryMultiplier() {
    return this.isTotalFeedingActive() ? TOTAL_FEEDING_SPAWN_EVERY_MULT : 1;
  }

  totalFeedingMinionSpeedMultiplier() {
    return this.isTotalFeedingActive() ? TOTAL_FEEDING_SPEED_MULT : 1;
  }

  totalFeedingMinionHpMultiplier() {
    return this.isTotalFeedingActive() ? TOTAL_FEEDING_HP_MULT : 1;
  }

  totalFeedingMinionDamageMultiplier() {
    return this.isTotalFeedingActive() ? TOTAL_FEEDING_DAMAGE_MULT : 1;
  }

  totalFeedingGoldMultiplier() {
    return this.isTotalFeedingActive() ? TOTAL_FEEDING_GOLD_MULT : 1;
  }

  isTotalFeedingBasicUnit(minion) {
    if (!minion) return false;
    if (typeof minion.totalFeedingBasicUnit === 'boolean') return minion.totalFeedingBasicUnit;
    return !Boolean(
      minion.super
      || minion.necrominion
      || minion.dragon
      || minion.balloon
      || minion.gunner
      || minion.rider
      || minion.digger
      || minion.shieldBearer
      || minion.monk
      || minion.stoneGolem
      || minion.hero
      || minion.president
      || minion.heroCooker
    );
  }

  processTotalFeedingGrainStateForMinion(minion, enemySideName) {
    if (!this.isTotalFeedingActive()) return;
    if (!this.isTotalFeedingBasicUnit(minion)) return;
    if (minion.candleCarrier) return;
    if (minion.totalFeedingGrainThrown) return;

    const midX = (TOWER_X_LEFT + TOWER_X_RIGHT) * 0.5;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const foodType = sideName === 'right' ? 'rice' : 'bread';
    if (!minion.totalFeedingGrainPicked) {
      if (Math.abs((Number(minion.x) || 0) - midX) > TOTAL_FEEDING_GRAIN_PICKUP_RADIUS) return;
      minion.totalFeedingGrainPicked = true;
      minion.totalFeedingGrainFoodType = foodType;
      const pickupY = (Number(minion.y) || TOWER_Y) - Math.max(6, (Number(minion.r) || 12) * 0.34);
      this.queueHitSfx('foodburst', Number(minion.x) || 0, pickupY, sideName, {
        foodType,
        heavy: false,
      });
      return;
    }

    const enemyTowerFaceX = enemySideName === 'left'
      ? (TOWER_X_LEFT + 54)
      : (TOWER_X_RIGHT - 54);
    const throwTriggerX = midX + (enemyTowerFaceX - midX) * 0.5;
    const reachedThrowPoint = sideName === 'left'
      ? (Number(minion.x) || 0) >= throwTriggerX
      : (Number(minion.x) || 0) <= throwTriggerX;
    if (!reachedThrowPoint) return;

    this.launchTotalFeedingGrainProjectile(minion, enemySideName, enemyTowerFaceX);
    this.beginTotalFeedingGrainJump(minion, enemyTowerFaceX);
    minion.totalFeedingGrainThrown = true;
  }

  beginTotalFeedingGrainJump(minion, enemyTowerFaceX) {
    if (!minion) return;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const startX = Number(minion.x) || 0;
    const startY = Number(minion.y) || TOWER_Y;
    const anchorX = Number.isFinite(enemyTowerFaceX)
      ? enemyTowerFaceX
      : (sideName === 'left' ? (TOWER_X_RIGHT - 46) : (TOWER_X_LEFT + 46));
    const landingX = clamp(
      anchorX - dir * Math.max(5, (Number(minion.r) || 12) * 0.2),
      TOWER_X_LEFT + 40,
      TOWER_X_RIGHT - 40
    );
    minion.totalFeedingGrainJumpTtl = TOTAL_FEEDING_GRAIN_JUMP_TTL;
    minion.totalFeedingGrainJumpMaxTtl = TOTAL_FEEDING_GRAIN_JUMP_TTL;
    minion.totalFeedingGrainJumpFromX = startX;
    minion.totalFeedingGrainJumpFromY = startY;
    minion.totalFeedingGrainJumpToX = landingX;
    minion.totalFeedingGrainJumpToY = startY;
    minion.totalFeedingGrainJumpArc = TOTAL_FEEDING_GRAIN_JUMP_ARC_MIN
      + Math.random() * (TOTAL_FEEDING_GRAIN_JUMP_ARC_MAX - TOTAL_FEEDING_GRAIN_JUMP_ARC_MIN);
  }

  tickTotalFeedingGrainJumpForMinion(minion, dt, enemyX) {
    if (!minion) return false;
    const ttl = Math.max(0, Number(minion.totalFeedingGrainJumpTtl) || 0);
    if (ttl <= 0) return false;

    const nextTtl = Math.max(0, ttl - dt);
    minion.totalFeedingGrainJumpTtl = nextTtl;
    const maxTtl = Math.max(0.0001, Number(minion.totalFeedingGrainJumpMaxTtl) || TOTAL_FEEDING_GRAIN_JUMP_TTL);
    const p = 1 - (nextTtl / maxTtl);
    const t = clamp(p, 0, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const fromX = Number(minion.totalFeedingGrainJumpFromX);
    const fromY = Number(minion.totalFeedingGrainJumpFromY);
    const toXRaw = Number(minion.totalFeedingGrainJumpToX);
    const toYRaw = Number(minion.totalFeedingGrainJumpToY);
    const toX = Number.isFinite(toXRaw)
      ? toXRaw
      : (Number.isFinite(enemyX) ? enemyX : (Number(minion.x) || 0));
    const toY = Number.isFinite(toYRaw)
      ? toYRaw
      : (Number(minion.y) || TOWER_Y);
    const arc = Math.max(0, Number(minion.totalFeedingGrainJumpArc) || TOTAL_FEEDING_GRAIN_JUMP_ARC_MIN);
    const x0 = Number.isFinite(fromX) ? fromX : (Number(minion.x) || 0);
    const y0 = Number.isFinite(fromY) ? fromY : (Number(minion.y) || TOWER_Y);
    minion.x = x0 + (toX - x0) * ease;
    minion.y = y0 + (toY - y0) * ease - Math.sin(Math.PI * ease) * arc;

    if (nextTtl > 0) return true;
    minion.x = toX;
    minion.y = toY;
    minion.totalFeedingGrainJumpFromX = null;
    minion.totalFeedingGrainJumpFromY = null;
    minion.totalFeedingGrainJumpToX = null;
    minion.totalFeedingGrainJumpToY = null;
    minion.totalFeedingGrainJumpArc = 0;
    return false;
  }

  launchTotalFeedingGrainProjectile(minion, enemySideName, enemyTowerFaceX) {
    if (!minion) return;
    if (!Array.isArray(this.totalFeedingGrainProjectiles)) this.totalFeedingGrainProjectiles = [];
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const foodType = minion.totalFeedingGrainFoodType === 'rice' ? 'rice' : 'bread';
    const fromX = Number(minion.x) || 0;
    const fromY = (Number(minion.y) || TOWER_Y) - Math.max(6, (Number(minion.r) || 12) * 0.56);
    const toX = Number.isFinite(enemyTowerFaceX)
      ? enemyTowerFaceX
      : (enemySideName === 'left' ? (TOWER_X_LEFT + 54) : (TOWER_X_RIGHT - 54));
    const toY = TOTAL_FEEDING_GRAIN_TOWER_Y + (Math.random() * 8 - 4);
    const maxTtl = TOTAL_FEEDING_GRAIN_THROW_TTL;
    this.totalFeedingGrainProjectiles.push({
      id: this.seq++,
      side: sideName,
      enemySide: enemySideName === 'left' ? 'left' : 'right',
      foodType,
      fromX,
      fromY,
      toX,
      toY,
      arcHeight: TOTAL_FEEDING_GRAIN_ARC_MIN
        + Math.random() * (TOTAL_FEEDING_GRAIN_ARC_MAX - TOTAL_FEEDING_GRAIN_ARC_MIN),
      damage: Math.max(0, this.minionOutgoingDamage(minion, Number(minion.dmg) || 0)),
      ttl: maxTtl,
      maxTtl,
    });
    this.queueHitSfx('foodburst', fromX, fromY, sideName, { foodType, heavy: false });
  }

  tickTotalFeedingGrainProjectiles(dt) {
    if (!Array.isArray(this.totalFeedingGrainProjectiles) || this.totalFeedingGrainProjectiles.length === 0) return;
    let write = 0;
    for (let i = 0; i < this.totalFeedingGrainProjectiles.length; i += 1) {
      const p = this.totalFeedingGrainProjectiles[i];
      if (!p) continue;
      const prevTtl = Math.max(0, Number(p.ttl) || 0);
      p.ttl = Math.max(0, prevTtl - dt);
      if (prevTtl > 0 && p.ttl === 0) {
        const sourceSide = p.side === 'right' ? 'right' : 'left';
        const enemySide = p.enemySide === 'left' ? 'left' : 'right';
        const impactX = Number(p.toX) || (enemySide === 'left' ? (TOWER_X_LEFT + 54) : (TOWER_X_RIGHT - 54));
        const impactY = Number(p.toY) || TOTAL_FEEDING_GRAIN_TOWER_Y;
        const dmg = this.dealDamageToTower(enemySide, Number(p.damage) || 0, impactX, impactY, 'unit', sourceSide);
        if (dmg > 0) {
          this.queueHitSfx('foodburst', impactX, impactY, sourceSide, {
            foodType: p.foodType === 'rice' ? 'rice' : 'bread',
            heavy: false,
          });
        }
        continue;
      }
      if (p.ttl <= 0) continue;
      this.totalFeedingGrainProjectiles[write] = p;
      write += 1;
    }
    this.totalFeedingGrainProjectiles.length = write;
  }

  unitHpUpgradeContribution(side) {
    return Math.max(0, Number(side?.unitHpLevel) || 0) * 30;
  }

  totalFeedingAdjustedHp(totalHp, hpFromUnitHpUpgrade = 0) {
    const hp = Math.max(0, Number(totalHp) || 0);
    if (!(hp > 0) || !this.isTotalFeedingActive()) return hp;
    const hpUpgrade = clamp(Number(hpFromUnitHpUpgrade) || 0, 0, hp);
    const nonUpgradeHp = Math.max(0, hp - hpUpgrade);
    return nonUpgradeHp * this.totalFeedingMinionHpMultiplier() + hpUpgrade;
  }

  activateTotalFeeding() {
    if (this.totalFeedingActive) return;
    this.totalFeedingActive = true;

    const spawnMul = this.totalFeedingSpawnEveryMultiplier();
    this.left.minionCd = Math.max(0, (Number(this.left.minionCd) || 0) * spawnMul);
    this.right.minionCd = Math.max(0, (Number(this.right.minionCd) || 0) * spawnMul);
    this.left.candleCd = this.candleSpawnEtaSeconds('left');
    this.right.candleCd = this.candleSpawnEtaSeconds('right');

    for (const minion of this.minions) {
      if (!minion || minion.removed) continue;
      if ((Number(minion.hp) || 0) <= 0) continue;
      const sideState = minion.side === 'right' ? this.right : this.left;
      const maxHpBefore = Math.max(1, Number(minion.maxHp) || 1);
      const hpBefore = clamp(Number(minion.hp) || 0, 0, maxHpBefore);
      const fallbackBaseHp = Math.max(1, this.statMinionHp(sideState));
      const fallbackUpgradeRatio = clamp(this.unitHpUpgradeContribution(sideState) / fallbackBaseHp, 0, 1);
      const maxHpUpgradeBeforeRaw = Number(minion.hpFromUnitHpUpgrade);
      const maxHpUpgradeBefore = clamp(
        Number.isFinite(maxHpUpgradeBeforeRaw) ? maxHpUpgradeBeforeRaw : (maxHpBefore * fallbackUpgradeRatio),
        0,
        maxHpBefore
      );
      const currentUpgradeRatio = clamp(maxHpUpgradeBefore / Math.max(1, maxHpBefore), 0, 1);
      const hpUpgradeBefore = clamp(hpBefore * currentUpgradeRatio, 0, hpBefore);

      minion.maxHp = Math.max(1, this.totalFeedingAdjustedHp(maxHpBefore, maxHpUpgradeBefore));
      minion.hp = clamp(this.totalFeedingAdjustedHp(hpBefore, hpUpgradeBefore), 0, minion.maxHp);
      minion.hpFromUnitHpUpgrade = Math.max(0, Math.min(minion.maxHp, maxHpUpgradeBefore));
      minion.dmg = Math.max(0, (Number(minion.dmg) || 0) * TOTAL_FEEDING_DAMAGE_MULT);
      minion.speed = Math.max(0, (Number(minion.speed) || 0) * TOTAL_FEEDING_SPEED_MULT);
    }

    const midX = (TOWER_X_LEFT + TOWER_X_RIGHT) * 0.5;
    const topY = TOWER_Y - 198;
    this.queueLine('TOTAL FEEDING!', midX, topY, null, {
      scale: 2.28,
      style: 'announcement',
    });
    this.queueHitSfx('explosion', midX, TOWER_Y - 80, 'left');
    this.queueHitSfx('explosion', midX, TOWER_Y - 80, 'right');
  }

  comboSpecialTimerBoostSeconds(side) {
    const streak = Math.max(0, Math.floor(Number(side?.comboHitStreak) || 0));
    if (streak >= COMBO_SPECIAL_TIMER_BOOST_MAX_STREAK) return COMBO_SPECIAL_TIMER_BOOST_MAX_SECONDS;
    if (streak >= COMBO_SPECIAL_TIMER_BOOST_MIN_STREAK) return COMBO_SPECIAL_TIMER_BOOST_MID_SECONDS;
    return 0;
  }

  applyComboSpecialTimerBoost(sideName, side) {
    if (!side || (sideName !== 'left' && sideName !== 'right')) return;
    const boostSeconds = this.comboSpecialTimerBoostSeconds(side);
    if (!(Number.isFinite(boostSeconds) && boostSeconds > 0)) return;
    const spawnEverySeconds = Math.max(0.0001, this.statSpawnEvery(side));
    const deltaSpawns = boostSeconds / spawnEverySeconds;
    if (!(Number.isFinite(deltaSpawns) && deltaSpawns > 0)) return;

    for (const type of SPECIAL_CADENCE_TRACKED_TYPES) {
      const every = this.specialSpawnBaseEveryForType(side, type, this.t);
      const dueCount = this.advanceSpecialSpawnProgress(sideName, type, every, deltaSpawns, this.t, boostSeconds);
      if (dueCount <= 0) continue;
      if (!this.specialSpawnQueueGateOpen(side, type)) continue;
      this.enqueuePendingSpecialSpawns(sideName, type, dueCount);
    }
  }

  markArrowHit(arrow) {
    this.activateArrowShotGoldTracker(arrow);
    if (!arrow || !arrow.mainArrow || arrow.comboCounted) return;
    arrow.comboCounted = true;
    const sideName = arrow.side === 'right' ? 'right' : 'left';
    const side = sideName === 'right' ? this.right : this.left;
    side.arrowHits = (side.arrowHits || 0) + 1;
    side.comboHitStreak = Math.max(0, Number(side.comboHitStreak) || 0) + 1;
    this.applyComboSpecialTimerBoost(sideName, side);
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

    const overdriveBonus = Math.max(0, Number(arrow?.comboOverdriveAoeBonus) || 0);
    const splash = Math.max(1, baseDamage * 0.34 + overdriveBonus);
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
      this.dealDamageToMinion(victim, splash, arrow.side, 'arrow', arrow);
      victim.hitFlashTtl = Math.max(Number(victim.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
      if (victim.hp <= 0) this.killMinionByRef(victim, arrow.side, { goldScalar: 0.75 });
    }
  }

  applyFlameArrowImpact(arrow, target, baseDamage, minionBuckets = null) {
    if (!arrow || arrow.powerType !== 'flameShot' || !target) return;

    const burnDamage = Math.max(1, baseDamage * (Number(arrow.flameBurn) || 0.18));
    this.dealDamageToMinion(target, burnDamage, arrow.side, 'arrow', arrow);
    target.hitFlashTtl = Math.max(Number(target.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);

    if (!arrow.flameScorchPlaced) {
      arrow.flameScorchPlaced = true;
      this.candleScorches.push({
        x: Number(target.x) || 0,
        y: (Number(target.y) || 0) + Math.max(8, (Number(target.r) || 12) * 0.5),
        r: FLAME_SHOT_SCORCH_RADIUS,
        ttl: FLAME_SHOT_SCORCH_TTL,
        smokeShieldTtl: 0,
        smokeShieldMaxTtl: 0,
        smokeShieldRx: 0,
        smokeShieldRy: 0,
        smokeShieldYOffset: 0,
        side: arrow.side,
        candleSide: arrow.side,
        sourceType: 'arrow',
        sourceRef: arrow,
        allyDps: 0,
        enemyDps: FLAME_SHOT_SCORCH_ENEMY_DPS,
        towerSide: null,
        towerBurnDps: 0,
        towerBurnTick: 0,
      });
    }

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
      this.dealDamageToMinion(victim, splashDamage, arrow.side, 'arrow', arrow);
      victim.hitFlashTtl = Math.max(Number(victim.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
      if (victim.hp <= 0) this.killMinionByRef(victim, arrow.side, { goldScalar: 0.8 });
    }
  }

  dealDamageToMinion(minion, amount, sourceSide = null, sourceType = null, sourceRef = null) {
    if (!minion) return 0;
    const dmg = Math.max(0, Number(amount) || 0);
    if (dmg <= 0) return 0;
    const side = sourceSide === 'right' ? 'right' : (sourceSide === 'left' ? 'left' : null);
    let remaining = dmg;
    if (remaining > 0) {
      if (!Number.isFinite(minion.executiveOrderHitsLeft)) minion.executiveOrderHitsLeft = 0;
      if (!Number.isFinite(minion.executiveOrderHitsMax) || minion.executiveOrderHitsMax <= 0) {
        minion.executiveOrderHitsMax = PRESIDENT_EXECUTIVE_ORDER_HITS;
      }
      if (!Number.isFinite(minion.executiveOrderBreakTtl)) minion.executiveOrderBreakTtl = 0;
      if (minion.executiveOrderHitsLeft > 0) {
        remaining *= PRESIDENT_EXECUTIVE_ORDER_DAMAGE_TAKEN_MULT;
        minion.executiveOrderHitsLeft = Math.max(0, minion.executiveOrderHitsLeft - 1);
        if (minion.executiveOrderHitsLeft <= 0) {
          minion.executiveOrderBreakTtl = 0.55;
          this.queueHitSfx('blocked', minion.x, minion.y - Math.max(6, (Number(minion.r) || 12) * 0.55), minion.side);
          this.queueHitSfx('powerup', minion.x, minion.y - Math.max(8, (Number(minion.r) || 12) * 0.2), minion.side);
        }
      }
    }
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
    const hpBefore = Math.max(0, Number(minion.hp) || 0);
    let hpDamage = 0;
    if (remaining > 0 && hpBefore > 0) {
      hpDamage = Math.min(remaining, hpBefore);
      minion.hp = hpBefore - hpDamage;
    }
    this.queueDamageNumber(dmg, minion.x, minion.y - Math.max(8, minion.r * 0.25));
    const effective = Math.max(0, hpDamage);
    if (side && effective > 0) this.recordDamage(side, sourceType === 'arrow' ? 'arrow' : 'unit', effective);
    if (side && sourceType === 'arrow' && effective > 0) {
      this.awardArrowDamageGold(side, effective, minion, sourceRef);
    }
    return effective;
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
    const sourceSide = attacker?.side === 'right' ? 'right' : (attacker?.side === 'left' ? 'left' : null);
    const sourceType = source === 'arrow' ? 'arrow' : 'unit';
    return this.dealDamageToMinion(target, scaled, sourceSide, sourceType);
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
      const auraR = Math.max(110, Number(m.presidentAuraRadius) || 190) * PRESIDENT_AURA_RANGE_SCALE;
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
    const sourceSide = attacker?.side === 'right' ? 'right' : (attacker?.side === 'left' ? 'left' : null);
    return this.dealDamageToTower(sideName, this.minionOutgoingDamage(attacker, amount), x, y, 'unit', sourceSide);
  }

  dealDamageToTower(sideName, amount, x = null, y = null, hitFx = null, sourceSide = null) {
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
    const source = sourceSide === 'left' || sourceSide === 'right'
      ? sourceSide
      : (sideName === 'left' ? 'right' : 'left');
    this.recordTowerDamage(sideName, dmg, source);
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

  baseSpawnEveryForLevel(spawnLevel) {
    const level = Math.max(1, Number(spawnLevel) || 1);
    return Math.max(
      SPAWN_EVERY_MIN_SECONDS,
      SPAWN_EVERY_BASE_SECONDS - level * SPAWN_EVERY_PER_LEVEL_REDUCTION
    );
  }

  statSpawnEvery(side) {
    const base = this.baseSpawnEveryForLevel(side.spawnLevel);
    const mul = clamp(Number(side?.debugSpawnRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX);
    const totalFeedingMul = this.totalFeedingSpawnEveryMultiplier();
    return Math.max(0.18 * totalFeedingMul, (base / mul) * totalFeedingMul);
  }

  basicSpecialBaseEveryByTypeForSide(side = null) {
    const resolved = {};
    const globalSource = this.basicSpecialBaseEveryByType;
    for (const type of BASIC_SPECIAL_SPAWN_TYPES) {
      const globalValue = Number(globalSource?.[type]);
      if (Number.isFinite(globalValue) && globalValue > 0) {
        resolved[type] = roundTo(globalValue, 3);
        continue;
      }
      resolved[type] = roundTo(randomBasicSpecialBaseEvery(), 3);
    }

    if (!this.basicSpecialBaseEveryByType || typeof this.basicSpecialBaseEveryByType !== 'object') {
      this.basicSpecialBaseEveryByType = {};
    }
    for (const type of BASIC_SPECIAL_SPAWN_TYPES) {
      this.basicSpecialBaseEveryByType[type] = resolved[type];
    }

    if (side && typeof side === 'object') {
      side.specialBasicBaseEveryByType = {
        ...(side.specialBasicBaseEveryByType && typeof side.specialBasicBaseEveryByType === 'object'
          ? side.specialBasicBaseEveryByType
          : {}),
        ...resolved,
      };
    }
    for (const sideRef of [this.left, this.right]) {
      if (!sideRef || typeof sideRef !== 'object') continue;
      sideRef.specialBasicBaseEveryByType = {
        ...(sideRef.specialBasicBaseEveryByType && typeof sideRef.specialBasicBaseEveryByType === 'object'
          ? sideRef.specialBasicBaseEveryByType
          : {}),
        ...resolved,
      };
    }

    const legacyShared = resolved[BASIC_SPECIAL_SPAWN_TYPES[0]];
    this.basicSpecialSharedBaseEvery = legacyShared;
    if (side && typeof side === 'object') side.specialBasicSharedBaseEvery = legacyShared;
    if (this.left && typeof this.left === 'object') this.left.specialBasicSharedBaseEvery = legacyShared;
    if (this.right && typeof this.right === 'object') this.right.specialBasicSharedBaseEvery = legacyShared;
    return resolved;
  }

  basicSpecialBaseEveryForSideType(side = null, specialType = null) {
    const type = BASIC_SPECIAL_TYPE_SET.has(specialType) ? specialType : BASIC_SPECIAL_SPAWN_TYPES[0];
    const byType = this.basicSpecialBaseEveryByTypeForSide(side);
    const value = Number(byType?.[type]);
    if (Number.isFinite(value) && value > 0) return value;
    const legacy = Number(side?.specialBasicSharedBaseEvery);
    if (Number.isFinite(legacy) && legacy > 0) return legacy;
    return roundTo(randomBasicSpecialBaseEvery(), 3);
  }

  statBasicSpecialEvery(side, specialType) {
    const baseEvery = this.basicSpecialBaseEveryForSideType(side, specialType);
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(side, specialType);
    const every = this.scaleSpecialCooldownEvery(baseEvery * repeatMul, side);
    return this.clampBasicCadenceInSpawns(every, side);
  }

  specialBaseChanceForType(type = null) {
    const key = typeof type === 'string' ? type : '';
    if (!this.specialBaseChanceByType || typeof this.specialBaseChanceByType !== 'object') {
      this.specialBaseChanceByType = randomSpecialBaseChanceByType();
      if (this.left && typeof this.left === 'object') this.left.specialBaseChanceByType = { ...this.specialBaseChanceByType };
      if (this.right && typeof this.right === 'object') this.right.specialBaseChanceByType = { ...this.specialBaseChanceByType };
    }
    const value = Number(this.specialBaseChanceByType[key]);
    if (Number.isFinite(value)) return value;
    const fallback = Number(specialSpawnBaseChanceForType(key));
    return Number.isFinite(fallback) ? fallback : 0;
  }

  tier2SpecialBaseEveryForType(type = null) {
    const key = typeof type === 'string' ? type : '';
    if (!TIER2_SPECIAL_TYPE_SET.has(key)) return Infinity;
    if (!this.tier2SpecialBaseEveryByType || typeof this.tier2SpecialBaseEveryByType !== 'object') {
      this.tier2SpecialBaseEveryByType = randomTier2SpecialBaseEveryByType();
      if (this.left && typeof this.left === 'object') this.left.specialTier2BaseEveryByType = { ...this.tier2SpecialBaseEveryByType };
      if (this.right && typeof this.right === 'object') this.right.specialTier2BaseEveryByType = { ...this.tier2SpecialBaseEveryByType };
    }
    const value = Number(this.tier2SpecialBaseEveryByType[key]);
    if (Number.isFinite(value) && value > 0) return value;
    const next = roundTo(randomTier2SpecialBaseEveryForType(key), 3);
    this.tier2SpecialBaseEveryByType[key] = next;
    if (this.left && typeof this.left === 'object') this.left.specialTier2BaseEveryByType = { ...this.tier2SpecialBaseEveryByType };
    if (this.right && typeof this.right === 'object') this.right.specialTier2BaseEveryByType = { ...this.tier2SpecialBaseEveryByType };
    return next;
  }

  statSpecialCooldownMultiplier(matchTimeSec = null, endMult = SPECIAL_COOLDOWN_END_MULT) {
    const t = Number.isFinite(matchTimeSec) ? matchTimeSec : this.t;
    const safeT = Math.max(0, Number(t) || 0);
    const startMult = SPECIAL_COOLDOWN_START_MULT;
    const baseEnd = Number.isFinite(Number(endMult)) ? Number(endMult) : SPECIAL_COOLDOWN_END_MULT;
    const totalSteps = Math.max(1, Math.round(SPECIAL_COOLDOWN_RAMP_SECONDS / SPECIAL_COOLDOWN_STEP_SECONDS));
    const elapsedSteps = Math.min(totalSteps, Math.floor(safeT / SPECIAL_COOLDOWN_STEP_SECONDS));
    const dropPerStep = (startMult - baseEnd) / totalSteps;
    const mult = startMult - elapsedSteps * dropPerStep;
    return clamp(mult, Math.min(baseEnd, startMult), Math.max(baseEnd, startMult));
  }

  scaleSpecialCooldownEvery(baseEvery, side = null, rampEffectScale = 1, endMult = SPECIAL_COOLDOWN_END_MULT) {
    if (!Number.isFinite(baseEvery)) return baseEvery;
    const startMult = SPECIAL_COOLDOWN_START_MULT;
    const rampBase = Number.isFinite(Number(endMult)) ? Number(endMult) : SPECIAL_COOLDOWN_END_MULT;
    const globalMult = this.statSpecialCooldownMultiplier(null, rampBase);
    const effectScale = Math.max(0, Number(rampEffectScale) || 1);
    const maxRampMult = rampBase + (startMult - rampBase) * effectScale;
    const adjustedMult = clamp(
      rampBase + (globalMult - rampBase) * effectScale,
      Math.min(rampBase, maxRampMult),
      Math.max(rampBase, maxRampMult)
    );
    const scaled = Math.max(1, Math.round(baseEvery * adjustedMult));
    const mul = clamp(Number(side?.debugSpecialSpawnRateMultiplier) || 1, DEBUG_RATE_MIN, DEBUG_RATE_MAX);
    return Math.max(1, Math.round(scaled / mul));
  }

  scaleTier2SpecialCooldownEvery(baseEvery, side = null) {
    return this.scaleSpecialCooldownEvery(baseEvery, side, 1, SPECIAL_TIER2_COOLDOWN_END_MULT);
  }

  basicMinCadenceInSpawns(side = null) {
    const spawnEverySeconds = Math.max(0.0001, this.statSpawnEvery(side || {}));
    const minCadenceSeconds = BASIC_SPECIAL_MIN_CADENCE_SECONDS * this.totalFeedingSpawnEveryMultiplier();
    return Math.max(1, Math.ceil(minCadenceSeconds / spawnEverySeconds));
  }

  clampBasicCadenceInSpawns(every, side = null) {
    if (!Number.isFinite(every)) return every;
    const floorInSpawns = this.basicMinCadenceInSpawns(side);
    return Math.max(floorInSpawns, Math.max(1, Math.round(every)));
  }

  tier2MinCadenceInSpawns(side = null) {
    const spawnEverySeconds = Math.max(0.0001, this.statSpawnEvery(side || {}));
    const minCadenceSeconds = TIER2_SPECIAL_MIN_CADENCE_SECONDS * this.totalFeedingSpawnEveryMultiplier();
    return Math.max(1, Math.ceil(minCadenceSeconds / spawnEverySeconds));
  }

  clampTier2CadenceInSpawns(every, side = null) {
    if (!Number.isFinite(every)) return every;
    const floorInSpawns = this.tier2MinCadenceInSpawns(side);
    return Math.max(floorInSpawns, Math.max(1, Math.round(every)));
  }

  statDragonEvery(side) {
    if (side.dragonLevel <= 0) return Infinity;
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(side, 'dragon');
    const baseEvery = this.tier2SpecialBaseEveryForType('dragon') * repeatMul;
    const every = this.scaleTier2SpecialCooldownEvery(baseEvery, side);
    return this.clampTier2CadenceInSpawns(every, side);
  }

  statGunnerEvery(side) {
    return this.statBasicSpecialEvery(side, 'gunner');
  }

  statRiderEvery(side) {
    return this.statBasicSpecialEvery(side, 'rider');
  }

  statDiggerEvery(side) {
    return this.statBasicSpecialEvery(side, 'digger');
  }

  statMonkEvery(side) {
    return this.statBasicSpecialEvery(side, 'monk');
  }

  statShieldEvery(side) {
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(side, 'shield');
    const baseEvery = this.tier2SpecialBaseEveryForType('shield') * repeatMul;
    const every = this.scaleTier2SpecialCooldownEvery(baseEvery, side);
    return this.clampTier2CadenceInSpawns(every, side);
  }

  statHeroEvery(side) {
    const mythicTech = Math.floor((side.unitLevel + side.powerLevel + side.economyLevel) / 7);
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(side, 'hero');
    const baseEvery = Math.max(38, 56 - mythicTech) * 10 * repeatMul;
    return this.scaleSpecialCooldownEvery(baseEvery, side);
  }

  statPresidentEvery(side) {
    return this.statBasicSpecialEvery(side, 'president');
  }

  statBalloonEvery(side) {
    if ((Number(side?.balloonLevel) || 0) <= 0) return Infinity;
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(side, 'balloon');
    const baseEvery = this.tier2SpecialBaseEveryForType('balloon') * repeatMul;
    const every = this.scaleTier2SpecialCooldownEvery(baseEvery, side);
    return this.clampTier2CadenceInSpawns(every, side);
  }

  statNecroEvery(side = null) {
    return this.statBasicSpecialEvery(side, 'necrominion');
  }

  statSuperEvery(side) {
    if (side.superMinionLevel <= 0) return Infinity;
    const repeatMul = this.specialRepeatSpawnEveryMultiplier(side, 'super');
    const baseEvery = this.tier2SpecialBaseEveryForType('super') * repeatMul;
    const every = this.scaleTier2SpecialCooldownEvery(baseEvery, side);
    return this.clampTier2CadenceInSpawns(every, side);
  }

  specialRepeatLevel(side, specialType) {
    const rule = SPECIAL_UNIT_UPGRADE_RULES_BY_SPECIAL_TYPE[specialType] || null;
    if (!rule?.upgradeType) return 0;
    const level = Math.max(0, Number(side?.[rule.upgradeType]) || 0);
    if (level <= 0) return 0;
    const repeatLevels = Math.max(0, level - 1);
    return repeatLevels + SPECIAL_UNLOCK_BONUS_LEVEL_EQUIV;
  }

  specialRepeatChanceBonusPerLevel(specialType, rule = null) {
    const configured = Math.max(0, Number(rule?.repeatChancePerLevel) || 0);
    if (configured > 0) return configured;
    const override = Number(SPECIAL_REPEAT_CHANCE_BONUS_PER_LEVEL_BY_TYPE[specialType]);
    let perLevel = Number.isFinite(override) ? Math.max(0, override) : SPECIAL_REPEAT_CHANCE_BONUS_PER_LEVEL;
    if (BASIC_SPECIAL_TYPE_SET.has(specialType)) {
      perLevel = Math.max(perLevel, BASIC_SPECIAL_REPEAT_CHANCE_MIN_PER_LEVEL);
    }
    return perLevel;
  }

  specialRepeatSpawnChanceBonus(side, specialType, baseChance = null) {
    const rule = SPECIAL_UNIT_UPGRADE_RULES_BY_SPECIAL_TYPE[specialType] || null;
    const repeatLevel = this.specialRepeatLevel(side, specialType);
    if (repeatLevel <= 0) return 0;
    if (TIER2_SPECIAL_TYPE_SET.has(specialType)) {
      const fromArg = baseChance == null ? NaN : Number(baseChance);
      const baseRaw = Number.isFinite(fromArg)
        ? fromArg
        : Number(this.specialBaseChanceForType(specialType));
      const base = clamp(baseRaw, 0, TIER2_SPECIAL_CHANCE_CAP);
      const progress = 1 - Math.exp(-TIER2_REPEAT_CHANCE_CURVE_RATE * repeatLevel);
      const bonus = (TIER2_SPECIAL_CHANCE_CAP - base) * progress;
      return clamp(bonus, 0, TIER2_SPECIAL_CHANCE_CAP - base);
    }
    const perLevel = this.specialRepeatChanceBonusPerLevel(specialType, rule);
    return Math.min(SPECIAL_REPEAT_CHANCE_BONUS_MAX, repeatLevel * perLevel);
  }

  specialRepeatSpawnEveryMultiplier(side, specialType) {
    const repeatLevel = this.specialRepeatLevel(side, specialType);
    if (repeatLevel <= 0) return 1;
    if (TIER2_SPECIAL_TYPE_SET.has(specialType)) {
      return clamp(
        TIER2_REPEAT_EVERY_MIN_MULT + (1 - TIER2_REPEAT_EVERY_MIN_MULT) * Math.exp(-TIER2_REPEAT_EVERY_CURVE_RATE * repeatLevel),
        TIER2_REPEAT_EVERY_MIN_MULT,
        1
      );
    }
    if (!SPECIAL_REPEAT_EVERY_TYPE_SET.has(specialType)) return 1;
    const override = Number(SPECIAL_REPEAT_EVERY_BONUS_PER_LEVEL_BY_TYPE[specialType]);
    const perLevel = Number.isFinite(override)
      ? Math.max(0, override)
      : SPECIAL_REPEAT_EVERY_BONUS_PER_LEVEL;
    const bonus = Math.min(SPECIAL_REPEAT_EVERY_BONUS_MAX, repeatLevel * perLevel);
    return Math.max(0.4, 1 - bonus);
  }

  ensureSpecialSpawnProgressMap(side) {
    if (!side || typeof side !== 'object') return {};
    if (!side.specialSpawnProgressByType || typeof side.specialSpawnProgressByType !== 'object') {
      side.specialSpawnProgressByType = {};
    }
    return side.specialSpawnProgressByType;
  }

  ensureSpecialSpawnCadenceMap(side) {
    if (!side || typeof side !== 'object') return {};
    if (!side.specialSpawnCadenceByType || typeof side.specialSpawnCadenceByType !== 'object') {
      side.specialSpawnCadenceByType = {};
    }
    return side.specialSpawnCadenceByType;
  }

  ensureSpecialCadenceSharedRollMap() {
    if (!this.specialCadenceSharedRollByType || typeof this.specialCadenceSharedRollByType !== 'object') {
      this.specialCadenceSharedRollByType = {};
    }
    return this.specialCadenceSharedRollByType;
  }

  specialCadenceSharedRollForType(type) {
    const key = typeof type === 'string' ? type : '';
    const map = this.ensureSpecialCadenceSharedRollMap();
    const existing = map[key];
    const existingMatch = Number(existing?.matchMultiplier);
    const existingJitter = Number(existing?.jitterRatio);
    if (
      Number.isFinite(existingMatch)
      && Number.isFinite(existingJitter)
    ) {
      return {
        matchMultiplier: roundTo(clamp(existingMatch, SPECIAL_CADENCE_MATCH_MULT_MIN, SPECIAL_CADENCE_MATCH_MULT_MAX), 3),
        jitterRatio: roundTo(clamp(existingJitter, -SPECIAL_CADENCE_JITTER_MAX, SPECIAL_CADENCE_JITTER_MAX), 3),
      };
    }
    const generated = {
      matchMultiplier: roundTo(randomCadenceMatchMultiplier(), 3),
      jitterRatio: roundTo(randomCadenceJitterRatio(), 3),
    };
    map[key] = generated;
    return generated;
  }

  specialSpawnBaseEveryForType(side, type, matchTimeSec = this.t) {
    const s = side || null;
    if (type === 'candle') return this.statCandleEvery(s);
    if (type === 'stonegolem') return this.statStoneGolemEvery(s);
    if (BASIC_SPECIAL_TYPE_SET.has(type)) return this.statBasicSpecialEvery(s, type);
    if (type === 'dragon') return this.statDragonEvery(s);
    if (type === 'shield') return this.statShieldEvery(s);
    if (type === 'hero') return this.statHeroEvery(s);
    if (type === 'balloon') return this.statBalloonEvery(s);
    if (type === 'super') return this.statSuperEvery(s);
    return Infinity;
  }

  specialSpawnCadenceStateForType(side, type, matchTimeSec = this.t) {
    const cadenceMap = this.ensureSpecialSpawnCadenceMap(side);
    const progressMap = this.ensureSpecialSpawnProgressMap(side);
    const existing = cadenceMap[type];
    if (existing && typeof existing === 'object') {
      const priorBaseEvery = Number(existing.baseEvery);
      const priorCurrentEvery = Number(existing.currentEvery);
      const priorProgress = Math.max(0, Number(existing.progress) || 0);
      const liveBaseEvery = this.specialSpawnBaseEveryForType(side, type, matchTimeSec);
      if (Number.isFinite(liveBaseEvery) && liveBaseEvery > 0) {
        const sharedRoll = this.specialCadenceSharedRollForType(type);
        let matchMultiplier = Number(existing.matchMultiplier);
        if (!Number.isFinite(matchMultiplier)) matchMultiplier = Number(sharedRoll.matchMultiplier);
        matchMultiplier = clamp(
          Number.isFinite(matchMultiplier) ? matchMultiplier : 1,
          SPECIAL_CADENCE_MATCH_MULT_MIN,
          SPECIAL_CADENCE_MATCH_MULT_MAX
        );
        let jitterRatio = Number(existing.jitterRatio);
        if (!Number.isFinite(jitterRatio)) {
          if (Number.isFinite(priorBaseEvery) && priorBaseEvery > 0 && Number.isFinite(priorCurrentEvery) && priorCurrentEvery > 0) {
            jitterRatio = (priorCurrentEvery / Math.max(0.0001, priorBaseEvery * matchMultiplier)) - 1;
          } else {
            jitterRatio = 0;
          }
        }
        jitterRatio = clamp(jitterRatio, -SPECIAL_CADENCE_JITTER_MAX, SPECIAL_CADENCE_JITTER_MAX);
        const currentEvery = Math.max(1, liveBaseEvery * matchMultiplier * (1 + jitterRatio));
        const priorCycleForProgress = (Number.isFinite(priorCurrentEvery) && priorCurrentEvery > 0)
          ? priorCurrentEvery
          : currentEvery;
        const progressRatio = clamp(priorProgress / Math.max(0.0001, priorCycleForProgress), 0, 1);
        const progress = progressRatio * currentEvery;
        existing.baseEvery = roundTo(liveBaseEvery, 3);
        existing.currentEvery = roundTo(currentEvery, 3);
        existing.matchMultiplier = roundTo(matchMultiplier, 3);
        existing.jitterRatio = roundTo(jitterRatio, 3);
        existing.deltaRatio = roundTo((currentEvery / Math.max(0.0001, liveBaseEvery)) - 1, 3);
        existing.progress = roundTo(progress, 3);
        existing.remainingSpawns = roundTo(Math.max(0, currentEvery - progress), 3);
        existing.comboBoostSecondsCurrentCycle = roundTo(Math.max(0, Number(existing.comboBoostSecondsCurrentCycle) || 0), 3);
        progressMap[type] = existing.progress;
        return existing;
      }
      const fallbackMatch = Number(existing.matchMultiplier);
      existing.matchMultiplier = Number.isFinite(fallbackMatch)
        ? roundTo(clamp(fallbackMatch, SPECIAL_CADENCE_MATCH_MULT_MIN, SPECIAL_CADENCE_MATCH_MULT_MAX), 3)
        : this.specialCadenceSharedRollForType(type).matchMultiplier;
      existing.baseEvery = null;
      existing.currentEvery = null;
      existing.jitterRatio = null;
      existing.deltaRatio = null;
      existing.progress = roundTo(priorProgress, 3);
      existing.remainingSpawns = null;
      existing.comboBoostSecondsCurrentCycle = roundTo(Math.max(0, Number(existing.comboBoostSecondsCurrentCycle) || 0), 3);
      progressMap[type] = existing.progress;
      return existing;
    }

    const baseEvery = this.specialSpawnBaseEveryForType(side, type, matchTimeSec);
    const sharedRoll = this.specialCadenceSharedRollForType(type);
    const matchMultiplier = sharedRoll.matchMultiplier;
    if (!Number.isFinite(baseEvery) || baseEvery <= 0) {
      const entry = {
        baseEvery: null,
        currentEvery: null,
        matchMultiplier,
        jitterRatio: null,
        deltaRatio: null,
        progress: roundTo(Math.max(0, Number(progressMap[type]) || 0), 3),
        remainingSpawns: null,
        comboBoostSecondsCurrentCycle: 0,
      };
      cadenceMap[type] = entry;
      progressMap[type] = entry.progress;
      return entry;
    }

    const jitterRatio = sharedRoll.jitterRatio;
    const currentEvery = Math.max(1, baseEvery * matchMultiplier * (1 + jitterRatio));
    const progress = Math.max(0, Number(progressMap[type]) || 0);
    const entry = {
      baseEvery: roundTo(baseEvery, 3),
      currentEvery: roundTo(currentEvery, 3),
      matchMultiplier,
      jitterRatio,
      deltaRatio: roundTo((currentEvery / Math.max(0.0001, baseEvery)) - 1, 3),
      progress: roundTo(progress, 3),
      remainingSpawns: roundTo(Math.max(0, currentEvery - progress), 3),
      comboBoostSecondsCurrentCycle: 0,
    };
    cadenceMap[type] = entry;
    progressMap[type] = entry.progress;
    return entry;
  }

  refreshSpecialSpawnCadenceCycle(sideName, type, matchTimeSec = this.t, carryProgress = 0) {
    const side = this[sideName];
    if (!side) return null;
    const cadenceMap = this.ensureSpecialSpawnCadenceMap(side);
    const progressMap = this.ensureSpecialSpawnProgressMap(side);
    const prev = cadenceMap[type] && typeof cadenceMap[type] === 'object' ? cadenceMap[type] : {};
    const matchMultiplier = Number.isFinite(prev.matchMultiplier)
      ? clamp(Number(prev.matchMultiplier), SPECIAL_CADENCE_MATCH_MULT_MIN, SPECIAL_CADENCE_MATCH_MULT_MAX)
      : this.specialCadenceSharedRollForType(type).matchMultiplier;
    const jitterRatio = randomCadenceJitterRatio();
    const baseEvery = this.specialSpawnBaseEveryForType(side, type, matchTimeSec);
    const progress = Math.max(0, Number(carryProgress) || 0);
    if (!Number.isFinite(baseEvery) || baseEvery <= 0) {
      const entry = {
        baseEvery: null,
        currentEvery: null,
        matchMultiplier: roundTo(matchMultiplier, 3),
        jitterRatio: null,
        deltaRatio: null,
        progress: roundTo(progress, 3),
        remainingSpawns: null,
        comboBoostSecondsCurrentCycle: 0,
      };
      cadenceMap[type] = entry;
      progressMap[type] = entry.progress;
      return entry;
    }
    const currentEvery = Math.max(1, baseEvery * matchMultiplier * (1 + jitterRatio));
    const entry = {
      baseEvery: roundTo(baseEvery, 3),
      currentEvery: roundTo(currentEvery, 3),
      matchMultiplier: roundTo(matchMultiplier, 3),
      jitterRatio: roundTo(jitterRatio, 3),
      deltaRatio: roundTo((currentEvery / Math.max(0.0001, baseEvery)) - 1, 3),
      progress: roundTo(progress, 3),
      remainingSpawns: roundTo(Math.max(0, currentEvery - progress), 3),
      comboBoostSecondsCurrentCycle: 0,
    };
    cadenceMap[type] = entry;
    progressMap[type] = entry.progress;
    return entry;
  }

  primeSpecialSpawnCadenceState(sideName, matchTimeSec = this.t) {
    const side = this[sideName];
    if (!side) return {};
    const cadenceMap = this.ensureSpecialSpawnCadenceMap(side);
    for (const type of SPECIAL_CADENCE_TRACKED_TYPES) {
      this.specialSpawnCadenceStateForType(side, type, matchTimeSec);
    }
    return cadenceMap;
  }

  specialSpawnQueueGateOpen(side, type) {
    if (!side) return false;
    if (type === 'hero') return Boolean(side.towerDamagedOnce);
    if (type === 'stonegolem') return this.stoneGolemSpawnUnlocked(side);
    return true;
  }

  specialSpawnProgressForType(side, type, every) {
    if (!Number.isFinite(every) || every <= 0) return null;
    const cadenceEntry = side?.specialSpawnCadenceByType?.[type];
    const cadenceProgress = Number(cadenceEntry?.progress);
    const cadenceEvery = Number(cadenceEntry?.currentEvery);
    if (Number.isFinite(cadenceProgress) && Number.isFinite(cadenceEvery) && cadenceEvery > 0) {
      const normalized = cadenceProgress % cadenceEvery;
      return normalized >= 0 ? normalized : (normalized + cadenceEvery);
    }
    const progressMap = this.ensureSpecialSpawnProgressMap(side);
    const stored = progressMap[type];
    const raw = stored == null ? NaN : Number(stored);
    if (Number.isFinite(raw)) {
      const normalized = raw % every;
      return normalized >= 0 ? normalized : (normalized + every);
    }
    const spawnCount = Math.max(0, Math.floor(Number(side?.spawnCount) || 0));
    return ((Math.max(0, spawnCount - 1)) % every);
  }

  advanceSpecialSpawnProgress(sideName, type, every, deltaSpawns = 0, matchTimeSec = this.t, comboBoostSeconds = 0) {
    const side = this[sideName];
    if (!side) return 0;
    const cadenceMap = this.ensureSpecialSpawnCadenceMap(side);
    const progressMap = this.ensureSpecialSpawnProgressMap(side);
    let entry = cadenceMap[type];
    if (!entry || typeof entry !== 'object') {
      entry = this.specialSpawnCadenceStateForType(side, type, matchTimeSec);
    }
    const increment = Math.max(0, Number(deltaSpawns) || 0);
    const spawnEverySeconds = Math.max(0.0001, this.statSpawnEvery(side));
    let comboRemainingSpawns = Math.max(0, Number(comboBoostSeconds) || 0) / spawnEverySeconds;
    if (Number.isFinite(increment) && increment > 0) {
      comboRemainingSpawns = Math.min(increment, comboRemainingSpawns);
    } else {
      comboRemainingSpawns = 0;
    }
    if (increment <= 0) {
      if (entry && typeof entry === 'object') {
        entry.progress = roundTo(Math.max(0, Number(entry.progress) || 0), 3);
        if (Number.isFinite(entry.currentEvery) && Number(entry.currentEvery) > 0) {
          entry.remainingSpawns = roundTo(Math.max(0, Number(entry.currentEvery) - Number(entry.progress || 0)), 3);
        }
        entry.comboBoostSecondsCurrentCycle = roundTo(Math.max(0, Number(entry.comboBoostSecondsCurrentCycle) || 0), 3);
        progressMap[type] = entry.progress;
      }
      return 0;
    }
    let remaining = increment;
    let dueCount = 0;
    let guard = 0;
    while (remaining > 0 && guard < 64) {
      if (!Number.isFinite(Number(entry?.currentEvery)) || Number(entry.currentEvery) <= 0) {
        const carry = Math.max(0, Number(entry?.progress) || 0);
        if (Number.isFinite(every) && every > 0) {
          entry = this.refreshSpecialSpawnCadenceCycle(sideName, type, matchTimeSec, carry);
        } else {
          entry.progress = carry + remaining;
          if (comboRemainingSpawns > 0) {
            const comboStep = Math.min(comboRemainingSpawns, remaining);
            entry.comboBoostSecondsCurrentCycle = Math.max(0, Number(entry.comboBoostSecondsCurrentCycle) || 0) + comboStep * spawnEverySeconds;
            comboRemainingSpawns -= comboStep;
          }
          remaining = 0;
          break;
        }
      }
      const cycleEvery = Math.max(0.0001, Number(entry.currentEvery) || 0.0001);
      const progressNow = Math.max(0, Number(entry.progress) || 0);
      const toBoundary = Math.max(0, cycleEvery - progressNow);
      const step = toBoundary > 0
        ? Math.min(remaining, toBoundary)
        : remaining;
      if (!(step > 0)) break;
      entry.progress = progressNow + step;
      if (comboRemainingSpawns > 0) {
        const comboStep = Math.min(comboRemainingSpawns, step);
        entry.comboBoostSecondsCurrentCycle = Math.max(0, Number(entry.comboBoostSecondsCurrentCycle) || 0) + comboStep * spawnEverySeconds;
        comboRemainingSpawns -= comboStep;
      }
      remaining -= step;
      if (entry.progress + 1e-9 >= cycleEvery) {
        const carry = Math.max(0, entry.progress - cycleEvery);
        dueCount += 1;
        entry = this.refreshSpecialSpawnCadenceCycle(sideName, type, matchTimeSec, carry);
      }
      guard += 1;
    }
    entry.progress = roundTo(Math.max(0, Number(entry.progress) || 0), 3);
    if (Number.isFinite(entry.currentEvery) && entry.currentEvery > 0) {
      entry.remainingSpawns = roundTo(Math.max(0, Number(entry.currentEvery) - Number(entry.progress)), 3);
    } else {
      entry.remainingSpawns = null;
    }
    entry.comboBoostSecondsCurrentCycle = roundTo(Math.max(0, Number(entry.comboBoostSecondsCurrentCycle) || 0), 3);
    progressMap[type] = entry.progress;
    cadenceMap[type] = entry;
    return Math.max(0, dueCount);
  }

  enqueuePendingSpecialSpawns(sideName, type, count = 0) {
    const side = this[sideName];
    if (!side || count <= 0) return;
    if (!Array.isArray(side.pendingSpecialSpawns)) side.pendingSpecialSpawns = [];
    for (let i = 0; i < count; i += 1) side.pendingSpecialSpawns.push(type);
  }

  queueDueSpecialSpawnsForNaturalSpawn(sideName, everyByType = null) {
    const side = this[sideName];
    if (!side) return;
    for (const type of SPECIAL_SPAWN_QUEUE_ORDER) {
      const every = Number(everyByType?.[type]);
      const dueCount = this.advanceSpecialSpawnProgress(sideName, type, every, 1, this.t);
      if (dueCount <= 0) continue;
      if (!this.specialSpawnQueueGateOpen(side, type)) continue;
      this.enqueuePendingSpecialSpawns(sideName, type, dueCount);
    }
  }

  redistributeSupportDebuffFailure(sideName, failedType, failedEvery, everyByType = null) {
    if (!SUPPORT_SPECIAL_TYPE_SET.has(failedType)) return;
    const side = this[sideName];
    if (!side) return;
    const totalSpawns = Number(failedEvery);
    if (!(Number.isFinite(totalSpawns) && totalSpawns > 0)) return;
    const targetTypes = [];
    for (const type of SPECIAL_SPAWN_QUEUE_ORDER) {
      const every = Number(everyByType?.[type]);
      if (!(Number.isFinite(every) && every > 0)) continue;
      if (SUPPORT_SPECIAL_TYPE_SET.has(type)) {
        const alive = this.aliveSpecialCount(sideName, type);
        if (alive > 0) continue;
      }
      targetTypes.push(type);
    }
    if (!targetTypes.length) return;
    const share = totalSpawns / targetTypes.length;
    for (const type of targetTypes) {
      const every = Number(everyByType?.[type]);
      const dueCount = this.advanceSpecialSpawnProgress(sideName, type, every, share, this.t);
      if (dueCount <= 0) continue;
      if (!this.specialSpawnQueueGateOpen(side, type)) continue;
      this.enqueuePendingSpecialSpawns(sideName, type, dueCount);
    }
  }

  statSpecialDisplayChance(side, type) {
    const rawOverride = side?.debugSpecialChanceOverrides?.[type];
    const overrideBase = rawOverride == null ? NaN : Number(rawOverride);
    const base = Number.isFinite(overrideBase)
      ? overrideBase
      : this.specialBaseChanceForType(type);
    if (!Number.isFinite(base)) return 0;
    if (type === 'stonegolem' && !this.stoneGolemSpawnUnlocked(side)) return 0;
    let chance = base;
    chance += this.specialRepeatSpawnChanceBonus(side, type, base);
    return clamp(chance, 0, 0.99);
  }

  supportSpecialAliveCount(sideName, type) {
    if (!SUPPORT_SPECIAL_TYPE_SET.has(type)) return 0;
    return this.aliveSpecialCount(sideName, type);
  }

  supportSpecialDebuffMultiplier(sideName, type, aliveCountOverride = null) {
    if (!SUPPORT_SPECIAL_TYPE_SET.has(type)) return 1;
    const aliveCount = aliveCountOverride == null
      ? this.supportSpecialAliveCount(sideName, type)
      : Math.max(0, Math.floor(Number(aliveCountOverride) || 0));
    if (aliveCount <= 0) return 1;
    const firstMul = clamp(Number(SUPPORT_SPAWN_DEBUFF_FIRST_MULT) || 1, 0.01, 1);
    if (aliveCount === 1) return firstMul;
    const additionalMul = clamp(Number(SUPPORT_SPAWN_DEBUFF_ADDITIONAL_MULT) || 1, 0.01, 1);
    return firstMul * Math.pow(additionalMul, aliveCount - 1);
  }

  statSpecialSuccessChance(side, type, options = null) {
    const displayChance = this.statSpecialDisplayChance(side, type);
    if (!Number.isFinite(displayChance) || displayChance <= 0) return 0;
    const includeSupportDebuff = options?.includeSupportDebuff !== false;
    if (!includeSupportDebuff || !SUPPORT_SPECIAL_TYPE_SET.has(type)) return displayChance;
    const sideName = options?.sideName || this.sideNameFromStateRef(side);
    if (!sideName) return displayChance;
    const aliveCountOverride = options?.supportAliveCount;
    const debuffMultiplier = this.supportSpecialDebuffMultiplier(sideName, type, aliveCountOverride);
    const chance = displayChance * debuffMultiplier;
    return clamp(chance, 0, 0.99);
  }

  dragonHeartCore(minion) {
    if (!minion.dragon) return null;
    const baseR = Math.max(14, Number(minion.r) || 14);
    const dir = minion.side === 'left' ? 1 : -1;
    return {
      x: minion.x + dir * (baseR * 0.22),
      y: minion.y + baseR * 0.02,
      r: Math.max(6.5, baseR * 0.26),
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

    dragon.dragonSuperBreathRiseTtl = DRAGON_SUPER_BREATH_RISE_TIME;
    dragon.dragonSuperBreathTtl = 0;
    dragon.dragonSuperBreathPulseCd = 0;
    dragon.dragonSuperBreathToX = toX;
    dragon.dragonSuperBreathToY = toY;
    dragon.dragonSuperBreathScorchDone = false;
    dragon.dragonBreathTtl = 0;
    dragon.dragonBreathToX = toX;
    dragon.dragonBreathToY = toY;

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

    // Super breath ground flame should not damage candles.

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
    if (!Number.isFinite(dragon.dragonSuperBreathRiseTtl)) dragon.dragonSuperBreathRiseTtl = 0;
    if (!Number.isFinite(dragon.dragonSuperBreathTtl)) dragon.dragonSuperBreathTtl = 0;
    if (dragon.dragonSuperBreathRiseTtl <= 0 && dragon.dragonSuperBreathTtl <= 0) return false;
    if (!Number.isFinite(dragon.dragonSuperBreathPulseCd)) dragon.dragonSuperBreathPulseCd = 0;

    let channelDt = Math.max(0, Number(dt) || 0);
    if (dragon.dragonSuperBreathRiseTtl > 0 && channelDt > 0) {
      const riseBefore = dragon.dragonSuperBreathRiseTtl;
      const riseStep = Math.min(riseBefore, channelDt);
      const riseAfter = Math.max(0, riseBefore - riseStep);
      dragon.dragonSuperBreathRiseTtl = riseAfter;
      channelDt -= riseStep;

      if (Number.isFinite(dragon.flyBaseY)) {
        const liftProgress = riseStep / Math.max(0.001, DRAGON_SUPER_BREATH_RISE_TIME);
        const riseLift = DRAGON_SUPER_BREATH_LIFT * 1.25 * liftProgress;
        dragon.flyBaseY = clamp(dragon.flyBaseY - riseLift, TOWER_Y - 238, TOWER_Y + 130);
      }

      if (riseAfter === 0 && dragon.dragonSuperBreathTtl <= 0) {
        dragon.dragonSuperBreathTtl = DRAGON_SUPER_BREATH_DURATION;
        dragon.dragonSuperBreathPulseCd = 0;
      }
    }

    if (dragon.dragonSuperBreathRiseTtl > 0) return true;
    if (dragon.dragonSuperBreathTtl <= 0) return false;

    dragon.dragonSuperBreathTtl = Math.max(0, dragon.dragonSuperBreathTtl - channelDt);
    dragon.dragonSuperBreathPulseCd -= channelDt;
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
    return dragon.dragonSuperBreathRiseTtl > 0 || dragon.dragonSuperBreathTtl > 0;
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

  pickGunnerFoodThrowTarget(gunner, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!gunner || !gunner.gunner) return null;
    const originX = Number(gunner.x) || 0;
    const originY = Number(gunner.y) || 0;
    const groundRange = clamp(
      Math.max(GUNNER_FOOD_THROW_RANGE_MIN, (Number(gunner.gunRange) || 220) * 0.92),
      GUNNER_FOOD_THROW_RANGE_MIN,
      GUNNER_FOOD_THROW_RANGE_MAX
    );
    const groundRangeSq = groundRange * groundRange;
    const flyingRange = clamp(
      groundRange + GUNNER_FOOD_THROW_FLYING_RANGE_BONUS,
      groundRange,
      GUNNER_FOOD_THROW_FLYING_RANGE_MAX
    );
    let bestFlying = null;
    let bestFlyingSq = Infinity;
    let bestGround = null;
    let bestGroundSq = Infinity;

    this.forEachEnemyMinionInRadius(
      gunner.side,
      originX,
      originY,
      flyingRange,
      minionBuckets,
      bucketW,
      (other) => {
        if (!other || other.removed || other.side === gunner.side || other.id === gunner.id) return;
        const dx = (Number(other.x) || 0) - originX;
        const dy = (Number(other.y) || 0) - originY;
        const d2 = dx * dx + dy * dy;
        if (other.flying) {
          if (d2 < bestFlyingSq) {
            bestFlyingSq = d2;
            bestFlying = other;
          }
          return;
        }
        if (d2 > groundRangeSq) return;
        if (d2 < bestGroundSq) {
          bestGroundSq = d2;
          bestGround = other;
        }
      }
    );

    return bestFlying || bestGround || null;
  }

  gunnerFoodThrowAtMinion(gunner, target) {
    if (!gunner || !gunner.gunner || !target || target.removed || target.side === gunner.side) return;
    const toX = Number(target.x) || Number(gunner.x) || 0;
    const toY = (Number(target.y) || Number(gunner.y) || 0) - Math.max(4, (Number(target.r) || 12) * 0.2);
    const throwTtl = Math.max(0.62, Number(gunner.balloonThrowMaxTtl) || 0.62);
    gunner.balloonThrowMaxTtl = throwTtl;
    gunner.balloonThrowTtl = throwTtl;
    gunner.balloonThrowToX = toX;
    gunner.balloonThrowToY = toY;

    const flyingBonus = target.flying ? GUNNER_FOOD_THROW_FLYING_BONUS : 1;
    const damage = Math.max(1, (Number(gunner.dmg) || 0) * GUNNER_FOOD_THROW_DAMAGE_MULT * flyingBonus);
    this.dealMinionDamage(gunner, target, damage, 'gunshot');
    target.hitFlashTtl = Math.max(Number(target.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
    this.queueHitSfx('foodburst', toX, toY, gunner.side, {
      foodType: gunner.side === 'left' ? 'bread' : 'rice',
      heavy: false,
    });
    if ((Number(target.hp) || 0) <= 0) this.killMinionByRef(target, gunner.side, { goldScalar: 0.82 });
  }

  tickGunnerFoodThrow(gunner, dt, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!gunner || !gunner.gunner) return;
    const sideState = gunner.side === 'right' ? this.right : this.left;
    const level = Math.max(0, Math.round(Number(sideState?.gunnerSkyCannonLevel) || 0));
    const unlocked = level >= GUNNER_FOOD_THROW_UNLOCK_LEVEL;
    gunner.gunnerFoodThrowUnlocked = unlocked;
    if (!unlocked) {
      gunner.gunnerFoodThrowCd = 0;
      return;
    }
    if (!Number.isFinite(gunner.gunnerFoodThrowCd)) {
      gunner.gunnerFoodThrowCd = 0.38 + Math.random() * 0.32;
    } else {
      gunner.gunnerFoodThrowCd = Math.max(0, gunner.gunnerFoodThrowCd - dt);
    }
    if (gunner.gunnerFoodThrowCd > 0) return;

    const target = this.pickGunnerFoodThrowTarget(gunner, minionBuckets, bucketW);
    if (!target) {
      gunner.gunnerFoodThrowCd = 0.2;
      return;
    }

    this.gunnerFoodThrowAtMinion(gunner, target);
    gunner.gunnerFoodThrowCd = Math.max(
      0.55,
      GUNNER_FOOD_THROW_INTERVAL
      - Math.min(0.22, Math.max(0, level - GUNNER_FOOD_THROW_UNLOCK_LEVEL) * 0.06)
      + Math.random() * GUNNER_FOOD_THROW_COOLDOWN_JITTER
    );
  }

  gunnerSkyCannon(gunner, impactX, impactY) {
    if (!gunner || !gunner.gunner) return;
    const sideName = gunner.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const enemyTowerX = sideName === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
    const enemyTowerY = TOWER_Y - 24;
    const strikeX = clamp(Number(impactX) || enemyTowerX, TOWER_X_LEFT + 38, TOWER_X_RIGHT - 38);
    const strikeY = clamp(Number(impactY) || (TOWER_Y - 24), TOWER_Y - 180, TOWER_Y + 212);
    const barrageActive = Math.random() < GUNNER_SKY_CANNON_BARRAGE_CHANCE;
    const shotCount = barrageActive
      ? (GUNNER_SKY_CANNON_BARRAGE_MIN_SHOTS
          + Math.floor(Math.random() * (GUNNER_SKY_CANNON_BARRAGE_MAX_SHOTS - GUNNER_SKY_CANNON_BARRAGE_MIN_SHOTS + 1)))
      : 1;
    const shotQueue = [];
    for (let i = 0; i < shotCount; i += 1) {
      const rowT = shotCount <= 1 ? 0 : (i / (shotCount - 1));
      const approach = rowT * GUNNER_SKY_CANNON_BARRAGE_TOWER_APPROACH_MAX;
      const shotX = strikeX + (enemyTowerX - strikeX) * approach;
      const shotY = strikeY + (enemyTowerY - strikeY) * approach;
      shotQueue.push({
        impactX: clamp(shotX, TOWER_X_LEFT + 38, TOWER_X_RIGHT - 38),
        impactY: clamp(shotY, TOWER_Y - 180, TOWER_Y + 212),
      });
    }
    gunner.gunnerSkyCannonSetupTtl = GUNNER_SKY_CANNON_SETUP_TIME;
    gunner.gunnerSkyCannonQueue = shotQueue;
    gunner.gunnerSkyCannonSignalUsed = false;
    gunner.gunnerSkyCannonAimX = Number(shotQueue[0]?.impactX) || strikeX;
    gunner.gunnerSkyCannonAimY = Number(shotQueue[0]?.impactY) || strikeY;
    gunner.gunnerSkyCannonCd = GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER;
    this.queueLine(
      shotCount > 1 ? `SETTING BARRAGE x${shotCount}!` : 'SETTING CANNON!',
      gunner.x,
      gunner.y - gunner.r - 18,
      sideName
    );
    this.queueHitSfx('powerup', gunner.x + dir * (gunner.r * 0.7), gunner.y - gunner.r * 0.5, sideName);
  }

  launchGunnerSkyCannonBall(gunner) {
    if (!gunner || !gunner.gunner) return;
    const sideName = gunner.side === 'right' ? 'right' : 'left';
    const dir = sideName === 'left' ? 1 : -1;
    const muzzleX = gunner.x + dir * (gunner.r + 7);
    const muzzleY = gunner.y - 2;
    const queued = Array.isArray(gunner.gunnerSkyCannonQueue) ? gunner.gunnerSkyCannonQueue : null;
    const queuedShot = queued && queued.length ? queued.shift() : null;
    const impactX = clamp(
      Number(queuedShot?.impactX) || Number(gunner.gunnerSkyCannonAimX) || gunner.x + dir * 80,
      TOWER_X_LEFT + 38,
      TOWER_X_RIGHT - 38
    );
    const impactY = clamp(
      Number(queuedShot?.impactY) || Number(gunner.gunnerSkyCannonAimY) || (TOWER_Y - 24),
      TOWER_Y - 180,
      TOWER_Y + 212
    );
    const flareDx = impactX - muzzleX;
    const flareDy = impactY - muzzleY;
    const flareDist = Math.hypot(flareDx, flareDy);
    const flareTravel = clamp(
      flareDist / Math.max(100, GUNNER_SKY_CANNON_FLARE_SPEED),
      GUNNER_SKY_CANNON_FLARE_MIN_TRAVEL,
      GUNNER_SKY_CANNON_FLARE_MAX_TRAVEL
    );
    const flareVx = flareDist > 0.001 ? flareDx / flareTravel : 0;
    const flareVy = flareDist > 0.001 ? flareDy / flareTravel : 0;
    const shouldSignalFlare = !gunner.gunnerSkyCannonSignalUsed;
    if (shouldSignalFlare) gunner.gunnerSkyCannonSignalUsed = true;
    gunner.gunFlashTtl = Math.max(Number(gunner.gunFlashTtl) || 0, 0.18);
    this.queueHitSfx('gunhit', muzzleX, muzzleY, sideName);
    if (!queued || !queued.length || Math.random() < 0.45) {
      this.queueLine('SKY CANNON!', gunner.x, gunner.y - gunner.r - 18, sideName);
    }

    this.cannonBalls.push({
      id: this.seq++,
      side: sideName,
      phase: 'flare',
      isFlareStrike: false,
      x: muzzleX + dir * 2,
      y: muzzleY - 2,
      r: 13 + (gunner.super ? 1.5 : 0),
      flareTtl: flareTravel,
      signalFlareTtl: shouldSignalFlare ? GUNNER_SKY_CANNON_SIGNAL_FLARE_TTL : 0,
      signalFlareMaxTtl: shouldSignalFlare ? GUNNER_SKY_CANNON_SIGNAL_FLARE_TTL : 0,
      signalFlareX: shouldSignalFlare ? muzzleX : null,
      signalFlareY: shouldSignalFlare ? muzzleY - 2 : null,
      vx: flareVx,
      vy: flareVy,
      dropDelay: 0,
      impactX,
      impactY,
      baseDamage: this.minionOutgoingDamage(gunner, gunner.dmg),
      sourceSuper: Boolean(gunner.super),
    });

    if (queued && queued.length > 0) {
      const nextShot = queued[0];
      gunner.gunnerSkyCannonSetupTtl = GUNNER_SKY_CANNON_BARRAGE_SHOT_DELAY;
      gunner.gunnerSkyCannonAimX = Number(nextShot?.impactX) || null;
      gunner.gunnerSkyCannonAimY = Number(nextShot?.impactY) || null;
    } else {
      gunner.gunnerSkyCannonSetupTtl = 0;
      gunner.gunnerSkyCannonAimX = null;
      gunner.gunnerSkyCannonAimY = null;
      gunner.gunnerSkyCannonQueue = null;
    }
  }

  spawnFlareShotCannonBall(sideName, x, y, sourceArrowRef = null) {
    const side = sideName === 'right' ? this.right : this.left;
    if (!side) return;
    const targetX = clamp(Number(x) || 0, TOWER_X_LEFT + 38, TOWER_X_RIGHT - 38);
    const targetY = clamp(Number(y) || 0, TOWER_Y - 180, TOWER_Y + 212);
    const baseArrow = this.statArrowDamage(side);
    const baseDamage = Math.max(1, this.minionOutgoingDamage({ side: sideName }, baseArrow * 1.6));

    this.queueHitSfx('powerup', targetX, targetY, sideName);
    this.cannonBalls.push({
      id: this.seq++,
      side: sideName,
      phase: 'mark',
      isFlareStrike: true,
      arrowSourceRef: sourceArrowRef && typeof sourceArrowRef === 'object' ? sourceArrowRef : null,
      x: targetX,
      y: targetY,
      r: 14,
      dropDelay: GUNNER_SKY_CANNON_AIRSTRIKE_MARK_DELAY + Math.random() * 0.14,
      impactX: targetX,
      impactY: targetY,
      baseDamage,
      sourceSuper: false,
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
      const sourceType = ball.isFlareStrike ? 'arrow' : 'unit';
      const sourceRef = ball.isFlareStrike ? (ball.arrowSourceRef || null) : null;
      this.dealDamageToMinion(victim, damage, sideName, sourceType, sourceRef);
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
        'unit',
        sideName
      );
    }
  }

  riderHitDamage(rider, hitX = null, hitY = null) {
    const base = Math.max(0, Number(rider?.dmg) || 0);
    if (!rider || !rider.rider || !rider.riderChargeReady) return base;

    rider.riderChargeReady = false;
    rider.riderChargeMoveTicks = 0;
    rider.riderChargeStartX = Number.isFinite(rider.x) ? rider.x : (Number(rider.riderChargeStartX) || 0);
    const baseMul = Math.max(1.4, Number(rider.riderChargeMul) || 2.2);
    const mul = rider.riderSuperHorse ? Math.max(baseMul, baseMul * 1.28) : baseMul;
    if (Number.isFinite(hitX) && Number.isFinite(hitY)) this.queueHitSfx('powerup', hitX, hitY, rider.side);
    return base * mul;
  }

  riderChargeImpactReady(rider) {
    return Boolean(rider && rider.rider && rider.riderChargeReady);
  }

  refreshRiderChargeState(rider, moved = false) {
    if (!rider || !rider.rider) return;
    if (!Number.isFinite(rider.riderChargeStartX)) rider.riderChargeStartX = Number(rider.x) || 0;
    if (!Number.isFinite(rider.riderChargeMoveTicks)) {
      rider.riderChargeMoveTicks = rider.riderChargeReady ? RIDER_CHARGE_REARM_MOVE_TICKS : 0;
    }
    if (rider.riderChargeReady) return;
    if (moved) rider.riderChargeMoveTicks += 1;
    if (rider.riderChargeMoveTicks >= RIDER_CHARGE_REARM_MOVE_TICKS) {
      rider.riderChargeReady = true;
      rider.riderChargeMoveTicks = RIDER_CHARGE_REARM_MOVE_TICKS;
    }
  }

  minionAdvanceSpeed(minion) {
    const baseSpeed = Math.max(0, Number(minion?.speed) || 0);
    if (!minion || !minion.rider || !minion.riderSuperHorse) return baseSpeed;
    if (!this.riderChargeImpactReady(minion)) return baseSpeed;
    return baseSpeed * 1.5;
  }

  riderChargeClashOutcome(riderA, riderB) {
    if (!riderA || !riderB) {
      return {
        winner: riderA || riderB || null,
        both: false,
      };
    }
    const midpoint = WORLD_W * 0.5;
    const aSide = riderA.side === 'right' ? 'right' : 'left';
    const bSide = riderB.side === 'right' ? 'right' : 'left';
    const aX = Number(riderA.x) || 0;
    const bX = Number(riderB.x) || 0;
    const aOnOwnSide = aSide === 'left' ? aX <= midpoint : aX >= midpoint;
    const bOnOwnSide = bSide === 'left' ? bX <= midpoint : bX >= midpoint;
    if (aOnOwnSide !== bOnOwnSide) {
      return {
        winner: aOnOwnSide ? riderA : riderB,
        both: false,
      };
    }

    const aTowerX = aSide === 'left' ? TOWER_X_LEFT : TOWER_X_RIGHT;
    const bTowerX = bSide === 'left' ? TOWER_X_LEFT : TOWER_X_RIGHT;
    const aTowerDist = Math.abs(aX - aTowerX);
    const bTowerDist = Math.abs(bX - bTowerX);
    if (Math.abs(aTowerDist - bTowerDist) <= 0.01) {
      return {
        winner: null,
        both: true,
      };
    }
    return {
      winner: aTowerDist < bTowerDist ? riderA : riderB,
      both: false,
    };
  }

  resolveRiderChargeClash(riderA, riderB) {
    if (!riderA || !riderB || riderA.removed || riderB.removed) return;
    if (!riderA.rider || !riderB.rider) return;
    if (riderA.side === riderB.side) return;

    const clash = this.riderChargeClashOutcome(riderA, riderB);
    const winner = clash.winner;
    const loser = winner === riderA ? riderB : riderA;
    const damageToB = this.riderHitDamage(riderA, riderB.x, riderB.y);
    const damageToA = this.riderHitDamage(riderB, riderA.x, riderA.y);
    this.dealMinionDamage(riderA, riderB, damageToB, 'melee');
    this.dealMinionDamage(riderB, riderA, damageToA, 'melee');
    riderA.atkCd = Math.max(Number(riderA.atkCd) || 0, 0.72);
    riderB.atkCd = Math.max(Number(riderB.atkCd) || 0, 0.72);

    if (clash.both) {
      if (!riderA.removed && (Number(riderA.hp) || 0) > 0 && !riderB.removed && (Number(riderB.hp) || 0) > 0) {
        const aKnockDir = riderB.side === 'left' ? 1 : -1;
        const bKnockDir = riderA.side === 'left' ? 1 : -1;
        const aLandingDamage = 1 + Math.floor(Math.random() * Math.max(1, Math.floor(Number(riderB.level) || 1)));
        const bLandingDamage = 1 + Math.floor(Math.random() * Math.max(1, Math.floor(Number(riderA.level) || 1)));
        this.startStoneGolemFling(riderA, aKnockDir, aLandingDamage, riderB.side, 0);
        this.startStoneGolemFling(riderB, bKnockDir, bLandingDamage, riderA.side, 0);
      }
      return;
    }

    if (!winner || !loser || winner.removed || loser.removed) return;
    if ((Number(winner.hp) || 0) <= 0) return;
    if ((Number(loser.hp) || 0) <= 0) return;
    const awayFromWinnerTowerDir = winner.side === 'left' ? 1 : -1;
    const winnerLevel = Math.max(1, Math.floor(Number(winner.level) || 1));
    const landingDamage = 1 + Math.floor(Math.random() * winnerLevel);
    this.startStoneGolemFling(loser, awayFromWinnerTowerDir, landingDamage, winner.side, 0);
  }

  riderStrikeMinion(rider, target) {
    const chargeImpact = this.riderChargeImpactReady(rider);
    const riderChargeClash = Boolean(
      chargeImpact
      && rider?.rider
      && target?.rider
      && target?.side !== rider?.side
      && this.riderChargeImpactReady(target)
    );
    if (riderChargeClash) {
      this.resolveRiderChargeClash(rider, target);
      return;
    }

    const damage = this.riderHitDamage(rider, target?.x, target?.y);
    this.dealMinionDamage(rider, target, damage, 'melee');
    if (!chargeImpact || !target || target.removed || target.side === rider?.side) return;
    if ((Number(target.hp) || 0) <= 0) return;

    const awayFromAllyTowerDir = rider.side === 'left' ? 1 : -1;
    const riderLevel = Math.max(1, Math.floor(Number(rider?.level) || 1));
    const landingDamage = 1 + Math.floor(Math.random() * riderLevel);
    this.startStoneGolemFling(target, awayFromAllyTowerDir, landingDamage, rider.side, 0);
  }

  riderStrikeTower(rider, enemySideName, x, y) {
    const damage = this.riderHitDamage(rider, x, y);
    this.applyMinionTowerDamage(rider, enemySideName, damage, x, y);
  }

  findMinionById(minionId) {
    const id = Math.round(Number(minionId) || 0);
    if (id <= 0) return null;
    for (const minion of this.minions) {
      if (!minion || minion.removed || minion.id !== id) continue;
      return minion;
    }
    return null;
  }

  stoneGolemMouthAnchor(golem) {
    if (!golem) return { x: 0, y: 0 };
    const dir = golem.side === 'left' ? 1 : -1;
    const radius = Math.max(20, Number(golem.r) || 28);
    return {
      x: (Number(golem.x) || 0) + dir * radius * 0.92,
      y: (Number(golem.y) || 0) - radius * 0.96,
    };
  }

  releaseStoneGolemHeldTarget(golem, lockTtl = STONE_GOLEM_BITE_RELEASE_LOCK_TTL) {
    if (!golem) return null;
    const heldTargetId = Math.round(Number(golem.golemBiteHeldTargetId) || 0);
    const held = heldTargetId > 0 ? this.findMinionById(heldTargetId) : null;
    if (held && !held.removed) {
      held.golemBiteLockTtl = Math.max(Number(held.golemBiteLockTtl) || 0, Math.max(0, Number(lockTtl) || 0));
    }
    golem.golemBiteHeldTargetId = 0;
    golem.golemBiteChewTickTtl = 0;
    return held;
  }

  findStoneGolemBiteTarget(golem, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!golem || !golem.stoneGolem) return null;
    const originX = Number(golem.x) || 0;
    const originY = Number(golem.y) || 0;
    const radius = Math.max(24, Number(golem.r) || 30);
    const searchR = Math.max(STONE_GOLEM_BITE_SEARCH_RADIUS, radius * 3.8);
    let best = null;
    let bestScore = Infinity;

    this.forEachEnemyMinionInRadius(
      golem.side,
      originX,
      originY - radius * 0.35,
      searchR,
      minionBuckets,
      bucketW,
      (other) => {
        if (!other || other.removed || !other.flying) return;
        if ((Number(other.golemBiteLockTtl) || 0) > 0) return;
        if ((Number(other.golemFlingTtl) || 0) > 0) return;
        const dx = (Number(other.x) || 0) - originX;
        const dy = originY - (Number(other.y) || 0);
        const absDx = Math.abs(dx);
        if (absDx > STONE_GOLEM_BITE_X_RANGE) return;
        if (dy < STONE_GOLEM_BITE_Y_MIN || dy > STONE_GOLEM_BITE_Y_MAX) return;
        const score = absDx * 2.2 + Math.abs((radius * 5.2) - dy) * 0.32;
        if (score < bestScore) {
          bestScore = score;
          best = other;
        }
      }
    );

    return best;
  }

  startStoneGolemBite(golem, target) {
    if (!golem || !golem.stoneGolem || !target || target.removed) return;
    golem.golemBiteCd = STONE_GOLEM_BITE_INTERVAL;
    golem.golemBiteTargetId = target.id;
    golem.golemBiteHeldTargetId = 0;
    golem.golemBiteChewTickTtl = 0;
    golem.golemBiteJumpMaxTtl = STONE_GOLEM_BITE_JUMP_TTL;
    golem.golemBiteJumpTtl = STONE_GOLEM_BITE_JUMP_TTL;
    golem.golemBiteLandMaxTtl = STONE_GOLEM_BITE_LAND_TTL;
    golem.golemBiteLandTtl = 0;
    golem.golemBiteStartX = Number(golem.x) || 0;
    golem.golemBiteStartY = Number(golem.y) || (TOWER_Y + 20);
    const radius = Math.max(24, Number(golem.r) || 30);
    const targetY = Number(target.y) || (golem.golemBiteStartY - radius * 2.4);
    const desiredLift = (golem.golemBiteStartY - targetY) + radius * 0.85;
    const maxLift = Math.max(
      radius * 6.2,
      (golem.golemBiteStartY - STONE_GOLEM_BITE_Y_MIN) + radius * 0.3
    );
    golem.golemBiteJumpLift = clamp(desiredLift, radius * 2.35, maxLift);
    this.queueHitSfx('powerup', golem.x, golem.y - (Number(golem.r) || 24) * 0.42, golem.side);
  }

  tickStoneGolemBite(golem, dt, enemySideName, enemyX, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!golem || !golem.stoneGolem) return false;
    const sideName = golem.side === 'right' ? 'right' : 'left';
    const animT = (Number(golem.golemBiteAnimT) || 0) + dt;
    golem.golemBiteAnimT = animT;

    const heldTargetId = Math.round(Number(golem.golemBiteHeldTargetId) || 0);
    if (heldTargetId > 0) {
      const held = this.findMinionById(heldTargetId);
      if (!held || held.removed || held.side === sideName || (Number(held.hp) || 0) <= 0) {
        this.releaseStoneGolemHeldTarget(golem, 0);
      } else {
        const mouth = this.stoneGolemMouthAnchor(golem);
        const golemDir = golem.side === 'left' ? 1 : -1;
        const holdX = mouth.x + golemDir * ((Math.max(20, Number(golem.r) || 28) * 0.44)) + Math.sin(animT * 11.2) * 2.6;
        const holdY = mouth.y + Math.sin(animT * 22) * 2.2;
        held.x = clamp(holdX, TOWER_X_LEFT + 24, TOWER_X_RIGHT - 24);
        held.y = clamp(holdY, 18, TOWER_Y + 145);
        if (held.flying && Number.isFinite(held.flyBaseY)) held.flyBaseY = held.y;
        if (held.shieldBearer && Number.isFinite(held.shieldBaseY)) held.shieldBaseY = held.y;
        if (held.digger && Number.isFinite(held.digBaseY)) held.digBaseY = held.y;
        held.golemBiteLockTtl = Math.max(Number(held.golemBiteLockTtl) || 0, dt + 0.14);

        const chewTickNow = Number(golem.golemBiteChewTickTtl) || STONE_GOLEM_BITE_CHEW_TICK;
        const chewTickNext = chewTickNow - dt;
        if (chewTickNext <= 0) {
          golem.golemBiteChewTickTtl = STONE_GOLEM_BITE_CHEW_TICK;
          const chewDamage = this.minionOutgoingDamage(
            golem,
            (Number(golem.dmg) || 0) * STONE_GOLEM_DAMAGE_MULT * STONE_GOLEM_BITE_CHEW_DAMAGE_MULT
          );
          this.dealMinionDamage(golem, held, chewDamage, 'melee');
          held.hitFlashTtl = Math.max(Number(held.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
          if ((Number(held.hp) || 0) <= 0) {
            this.killMinionByRef(held, sideName, { goldScalar: 0.92 });
            this.releaseStoneGolemHeldTarget(golem, 0);
            this.queueHitSfx('explosion', mouth.x, mouth.y, sideName);
          }
        } else {
          golem.golemBiteChewTickTtl = chewTickNext;
        }
      }
    }

    const jumpNow = Number(golem.golemBiteJumpTtl) || 0;
    if (jumpNow > 0) {
      const maxJump = Math.max(0.01, Number(golem.golemBiteJumpMaxTtl) || STONE_GOLEM_BITE_JUMP_TTL);
      const jumpNext = Math.max(0, jumpNow - dt);
      golem.golemBiteJumpTtl = jumpNext;

      const jumpProgress = Math.max(0, Math.min(1, 1 - (jumpNext / maxJump)));
      const startX = Number.isFinite(golem.golemBiteStartX) ? Number(golem.golemBiteStartX) : (Number(golem.x) || 0);
      const startY = Number.isFinite(golem.golemBiteStartY) ? Number(golem.golemBiteStartY) : (Number(golem.y) || (TOWER_Y + 20));
      const radius = Math.max(24, Number(golem.r) || 30);
      const target = this.findMinionById(golem.golemBiteTargetId);
      const maxLift = Math.max(
        radius * 6.2,
        (startY - STONE_GOLEM_BITE_Y_MIN) + radius * 0.3
      );
      if (target && !target.removed && target.side !== sideName) {
        const wantedLift = (startY - (Number(target.y) || startY)) + radius * 0.85;
        const currentLift = Number(golem.golemBiteJumpLift) || 0;
        golem.golemBiteJumpLift = clamp(Math.max(currentLift, wantedLift), radius * 2.35, maxLift);
      } else {
        golem.golemBiteJumpLift = clamp(
          Number(golem.golemBiteJumpLift) || (radius * 2.8),
          radius * 2.35,
          maxLift
        );
      }
      const jumpLiftMax = Math.max(16, Number(golem.golemBiteJumpLift) || (radius * 2.8));
      const jumpLift = Math.sin(jumpProgress * (Math.PI * 0.5)) * jumpLiftMax;
      golem.y = startY - jumpLift;
      if (target && !target.removed && target.side !== sideName) {
        const wantedX = Number(target.x) || startX;
        const lockX = clamp(
          wantedX,
          startX - STONE_GOLEM_BITE_MAX_OFFSET_X,
          startX + STONE_GOLEM_BITE_MAX_OFFSET_X
        );
        const alignRate = 0.16 + jumpProgress * 0.24;
        golem.x += (lockX - (Number(golem.x) || 0)) * Math.min(1, alignRate);
      } else {
        golem.x += (startX - (Number(golem.x) || 0)) * Math.min(1, dt * 6.8);
      }

      if (jumpNext <= 0) {
        golem.y = startY - jumpLiftMax;
        const latch = this.findMinionById(golem.golemBiteTargetId);
        if (
          latch
          && !latch.removed
          && latch.side !== sideName
          && latch.flying
          && (Number(latch.hp) || 0) > 0
          && Math.abs((Number(latch.x) || 0) - (Number(golem.x) || 0)) <= STONE_GOLEM_BITE_X_RANGE + 18
        ) {
          golem.golemBiteHeldTargetId = latch.id;
          golem.golemBiteChewTickTtl = STONE_GOLEM_BITE_CHEW_TICK * 0.45;
          latch.golemBiteLockTtl = Math.max(Number(latch.golemBiteLockTtl) || 0, 0.2);
          this.queueHitSfx('gunhit', latch.x, latch.y, sideName);
        }
        golem.golemBiteTargetId = 0;
        golem.golemBiteLandMaxTtl = STONE_GOLEM_BITE_LAND_TTL;
        golem.golemBiteLandTtl = STONE_GOLEM_BITE_LAND_TTL;
      }

      return true;
    }

    const landNow = Number(golem.golemBiteLandTtl) || 0;
    if (landNow > 0) {
      const landMax = Math.max(0.01, Number(golem.golemBiteLandMaxTtl) || STONE_GOLEM_BITE_LAND_TTL);
      const landNext = Math.max(0, landNow - dt);
      golem.golemBiteLandTtl = landNext;
      const startY = Number.isFinite(golem.golemBiteStartY) ? Number(golem.golemBiteStartY) : (Number(golem.y) || (TOWER_Y + 20));
      const jumpLiftMax = Math.max(16, Number(golem.golemBiteJumpLift) || (Math.max(24, Number(golem.r) || 30) * 2.8));
      const landProgress = Math.max(0, Math.min(1, 1 - (landNext / landMax)));
      const eased = landProgress * landProgress * (3 - 2 * landProgress);
      golem.y = startY - (1 - eased) * jumpLiftMax;
      if (landNext <= 0) {
        golem.y = startY;
        this.releaseStoneGolemHeldTarget(golem, STONE_GOLEM_BITE_RELEASE_LOCK_TTL);
        this.stoneGolemSmash(golem, enemySideName, enemyX, minionBuckets, bucketW);
        golem.atkCd = Math.max(Number(golem.atkCd) || 0, STONE_GOLEM_SMASH_INTERVAL * 0.52);
      }
      return true;
    }

    if ((Number(golem.golemBiteHeldTargetId) || 0) > 0) {
      this.releaseStoneGolemHeldTarget(golem, STONE_GOLEM_BITE_RELEASE_LOCK_TTL);
    }
    return false;
  }

  startStoneGolemFling(target, awayFromAllyTowerDir, landingDamage = 0, sourceSide = null, delay = 0) {
    if (!target || target.removed) return;
    const direction = awayFromAllyTowerDir >= 0 ? 1 : -1;
    const startX = Number(target.x) || 0;
    const startY = Number(target.y) || (TOWER_Y + 40);
    const midfieldX = WORLD_W * 0.5;
    const midfieldStop = direction > 0
      ? (midfieldX + STONE_GOLEM_SMASH_MIDFIELD_PAD)
      : (midfieldX - STONE_GOLEM_SMASH_MIDFIELD_PAD);
    const toMidfield = direction > 0
      ? Math.max(0, midfieldStop - startX)
      : Math.max(0, startX - midfieldStop);
    const launchMul = target.dragon ? 0.46 : (target.super ? 0.72 : 1);
    const launchDistance = Math.max(STONE_GOLEM_SMASH_KNOCKBACK * launchMul, toMidfield + 12);
    let endX = startX + direction * launchDistance;
    if (direction > 0) endX = Math.max(endX, midfieldStop);
    else endX = Math.min(endX, midfieldStop);
    endX = clamp(endX, TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);

    const flying = Boolean(target.flying);
    const endY = flying
      ? clamp(startY + (Math.random() * 12 - 6), TOWER_Y - 220, TOWER_Y + 150)
      : startY;
    const baseArc = flying ? STONE_GOLEM_FLING_AIR_ARC : STONE_GOLEM_FLING_ARC;
    const sizeMul = Math.max(0.72, Math.min(2.4, (Number(target.r) || 16) / 16));
    const arcMul = target.dragon ? 0.62 : (target.super ? 0.78 : 1);
    const arcHeight = Math.max(24, (baseArc * arcMul) / Math.sqrt(sizeMul));
    const ttl = STONE_GOLEM_FLING_TTL * (target.dragon ? 1.08 : 1);

    target.golemFlingFromX = startX;
    target.golemFlingFromY = startY;
    target.golemFlingToX = endX;
    target.golemFlingToY = endY;
    target.golemFlingArc = arcHeight;
    target.golemFlingMaxTtl = ttl;
    target.golemFlingTtl = ttl;
    target.golemFlingDelayTtl = Math.max(0, Number(delay) || 0);
    target.golemFlingLandingDamage = Math.max(0, Number(landingDamage) || 0);
    target.golemFlingSourceSide = sourceSide === 'right' ? 'right' : (sourceSide === 'left' ? 'left' : null);
  }

  tickStoneGolemFling(minion, dt) {
    if (!minion) return false;
    const delayNow = Number(minion.golemFlingDelayTtl) || 0;
    if (delayNow > 0) {
      const delayNext = Math.max(0, delayNow - dt);
      minion.golemFlingDelayTtl = delayNext;
      if (delayNext > 0) return true;
      minion.golemFlingFromX = Number(minion.x) || Number(minion.golemFlingFromX) || 0;
      minion.golemFlingFromY = Number(minion.y) || Number(minion.golemFlingFromY) || (TOWER_Y + 40);
    }
    const ttlNow = Number(minion.golemFlingTtl) || 0;
    if (ttlNow <= 0) return false;

    const maxTtl = Math.max(0.01, Number(minion.golemFlingMaxTtl) || STONE_GOLEM_FLING_TTL);
    const ttlNext = Math.max(0, ttlNow - dt);
    minion.golemFlingTtl = ttlNext;
    const progress = Math.max(0, Math.min(1, 1 - (ttlNext / maxTtl)));
    const fromX = Number.isFinite(minion.golemFlingFromX) ? Number(minion.golemFlingFromX) : (Number(minion.x) || 0);
    const fromY = Number.isFinite(minion.golemFlingFromY) ? Number(minion.golemFlingFromY) : (Number(minion.y) || (TOWER_Y + 40));
    const toX = Number.isFinite(minion.golemFlingToX) ? Number(minion.golemFlingToX) : fromX;
    const toY = Number.isFinite(minion.golemFlingToY) ? Number(minion.golemFlingToY) : fromY;
    const arc = Math.max(0, Number(minion.golemFlingArc) || 0);
    const eased = progress * progress * (3 - 2 * progress);

    minion.x = fromX + (toX - fromX) * eased;
    minion.y = fromY + (toY - fromY) * eased - Math.sin(Math.PI * eased) * arc;

    if (ttlNext > 0) return true;

    minion.x = toX;
    minion.y = toY;
    if (minion.flying && Number.isFinite(minion.flyBaseY)) minion.flyBaseY = toY;
    if (minion.shieldBearer) minion.shieldBaseY = toY;
    if (minion.digger) minion.digBaseY = toY;
    const landingDamage = Math.max(0, Number(minion.golemFlingLandingDamage) || 0);
    const sourceSide = minion.golemFlingSourceSide === 'right'
      ? 'right'
      : (minion.golemFlingSourceSide === 'left' ? 'left' : null);
    if (landingDamage > 0 && (Number(minion.hp) || 0) > 0) {
      this.dealDamageToMinion(minion, landingDamage, sourceSide, 'unit');
      minion.hitFlashTtl = Math.max(Number(minion.hitFlashTtl) || 0, MINION_HIT_FLASH_TTL);
      if ((Number(minion.hp) || 0) <= 0) {
        const killerSide = sourceSide || (minion.side === 'left' ? 'right' : 'left');
        this.killMinionByRef(minion, killerSide, { goldScalar: 0.86 });
      }
    }
    minion.golemFlingFromX = null;
    minion.golemFlingFromY = null;
    minion.golemFlingToX = null;
    minion.golemFlingToY = null;
    minion.golemFlingArc = 0;
    minion.golemFlingMaxTtl = 0;
    minion.golemFlingTtl = 0;
    minion.golemFlingDelayTtl = 0;
    minion.golemFlingLandingDamage = 0;
    minion.golemFlingSourceSide = null;
    return false;
  }

  stoneGolemSmash(golem, enemySideName, enemyX, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!golem || !golem.stoneGolem) return;
    const sideName = golem.side === 'right' ? 'right' : 'left';
    const awayFromAllyTowerDir = sideName === 'left' ? 1 : -1;
    const sideState = sideName === 'right' ? this.right : this.left;
    const smashR = Math.max(STONE_GOLEM_SMASH_RADIUS, (Number(golem.r) || 28) * 2.35);
    const baseDamage = this.minionOutgoingDamage(golem, (Number(golem.dmg) || 0) * STONE_GOLEM_DAMAGE_MULT * 3);
    const landingDamage = Math.max(1, this.statMinionHp(sideState) * 0.5);
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

    const uniqueVictims = [];
    const seenVictims = new Set();
    for (const other of victims) {
      if (!other || other.removed || other.side === sideName || other.id === golem.id) continue;
      if (seenVictims.has(other.id)) continue;
      seenVictims.add(other.id);
      uniqueVictims.push(other);
    }
    uniqueVictims.sort((a, b) => {
      const adx = (Number(a?.x) || 0) - (Number(golem.x) || 0);
      const ady = (Number(a?.y) || 0) - (Number(golem.y) || 0);
      const bdx = (Number(b?.x) || 0) - (Number(golem.x) || 0);
      const bdy = (Number(b?.y) || 0) - (Number(golem.y) || 0);
      return (adx * adx + ady * ady) - (bdx * bdx + bdy * bdy);
    });

    const firstFlingUsed = Boolean(golem.golemFirstFlingUsed);
    const maxFlingTargets = firstFlingUsed
      ? (
        STONE_GOLEM_FLING_MAX_TARGETS_MIN
        + Math.floor(Math.random() * (STONE_GOLEM_FLING_MAX_TARGETS_MAX - STONE_GOLEM_FLING_MAX_TARGETS_MIN + 1))
      )
      : Number.POSITIVE_INFINITY;
    let flungCount = 0;

    for (const other of uniqueVictims) {
      if (flungCount >= maxFlingTargets) break;
      if (!other || other.removed || other.side === sideName || other.id === golem.id) continue;
      hitAny = true;
      this.dealMinionDamage(golem, other, baseDamage, 'melee');
      if (other.hp <= 0) {
        this.killMinionByRef(other, sideName, { goldScalar: 0.9 });
        continue;
      }
      this.startStoneGolemFling(other, awayFromAllyTowerDir, landingDamage, sideName, STONE_GOLEM_FLING_DELAY);
      flungCount += 1;
    }
    if (!firstFlingUsed && flungCount > 0) golem.golemFirstFlingUsed = true;

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
    this.triggerHeroAttackSwing(hero);
    const sideState = hero.side === 'right' ? this.right : this.left;
    const slashR = Math.max(70, Number(hero.heroSlashRadius) || 88);
    const swingDamageMult = Math.max(0.72, Number(hero.heroLimbSwingDamageMult) || 0.96);
    const damage = this.minionOutgoingDamage(hero, hero.dmg * swingDamageMult);
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
      if (other.hp <= 0) {
        this.killMinionByRef(other, hero.side, { goldScalar: 0.9 });
      }
    }

    if (Math.abs(hero.x - enemyX) <= slashR + 10) {
      hitAny = true;
      this.dealDamageToTower(enemySideName, damage * 0.72, enemyX, TOWER_Y - 16, 'unit');
    }

    this.queueHitSfx(hitAny ? 'explosion' : 'powerup', hero.x, hero.y - 8, hero.side);
    if (
      (hitAny || hero.atkCd === 0)
      && (hero.heroLineCd || 0) === 0
      && ((Number(sideState?.heroLineCd) || 0) === 0)
    ) {
      this.queueLine(randomFrom(heroBattleLines(hero.side, this.themeMode)), hero.x, hero.y - hero.r - 26, hero.side);
      hero.heroLineCd = HERO_RANDOM_LINE_INTERVAL;
      if (sideState) sideState.heroLineCd = HERO_RANDOM_LINE_INTERVAL;
    }
  }

  triggerHeroAttackSwing(hero) {
    if (!hero || !hero.hero) return;
    const prevDir = Number(hero.heroSwingDir);
    hero.heroSwingDir = Number.isFinite(prevDir) && prevDir < 0 ? 1 : -1;
    hero.heroSwingAttackT = HERO_SWING_ATTACK_WINDOW;
    if (!Number.isFinite(hero.heroSwing)) hero.heroSwing = 0;
    hero.heroSwing = 0;
  }

  heroAbilityCooldown(minSeconds, maxSeconds) {
    const min = Math.max(0, Number(minSeconds) || 0);
    const max = Math.max(min, Number(maxSeconds) || min);
    return min + Math.random() * (max - min);
  }

  heroAbilityCooldownForSide(sideState, minSeconds, maxSeconds) {
    const rapid = Boolean(sideState?.debugHeroAbilityRapidTest);
    if (rapid) return this.heroAbilityCooldown(HERO_ABILITY_TEST_MIN_CD, HERO_ABILITY_TEST_MAX_CD);
    return this.heroAbilityCooldown(minSeconds, maxSeconds);
  }

  queueHeroAbilityAnnouncement(hero, text) {
    if (!hero || !hero.hero || !text) return;
    const x = Number(hero.x) || 0;
    const y = (Number(hero.y) || 0) - Math.max(16, (Number(hero.r) || 16)) - 38;
    this.queueLine(String(text), x, y, hero.side, {
      style: 'ability',
      scale: 1.05,
    });
  }

  sideHasActiveHeroCooker(sideName) {
    for (const m of this.minions) {
      if (!m || m.removed || !m.heroCooker || m.side !== sideName) continue;
      if ((Number(m.hp) || 0) <= 0) continue;
      return true;
    }
    return false;
  }

  refreshHeroCombatScaling(hero, sideState) {
    if (!hero || !hero.hero || !sideState) return;
    const powerLevel = Math.max(1, Number(sideState.powerLevel) || 1);
    const unitLevel = Math.max(1, Number(sideState.unitLevel) || 1);
    const hpTech = Math.max(1, Number(sideState.unitHpLevel) || 1);

    hero.heroSlashRadius = Math.max(84, 80 + unitLevel * 2.2 + powerLevel * 1.4);
    hero.heroLimbSwingDamageMult = 2.05 + Math.min(0.45, (powerLevel - 1) * 0.054) + Math.min(0.34, (unitLevel - 1) * 0.032);

    hero.heroRainDropCount = Math.max(
      HERO_FOOD_RAIN_MIN_DROPS,
      Math.min(HERO_FOOD_RAIN_MAX_DROPS, HERO_FOOD_RAIN_TARGET_DROPS + Math.floor((powerLevel - 1) * 0.12))
    );
    hero.heroRainRadius = Math.max(HERO_FOOD_RAIN_RADIUS, HERO_FOOD_RAIN_RADIUS + Math.floor((powerLevel - 1) * 2.2));
    hero.heroRainDamageMult = HERO_FOOD_RAIN_DAMAGE_MULT + Math.min(0.34, (powerLevel - 1) * 0.03);

    hero.heroRumbleBursts = Math.max(
      HERO_GROUND_RUMBLE_MIN_BURSTS,
      Math.min(HERO_GROUND_RUMBLE_MAX_BURSTS, 2 + Math.floor((powerLevel - 1) * 0.52) + Math.floor((unitLevel - 1) * 0.2))
    );
    hero.heroRumbleRadius = Math.max(HERO_GROUND_RUMBLE_RADIUS, HERO_GROUND_RUMBLE_RADIUS + Math.floor((unitLevel - 1) * 1.35));
    hero.heroRumbleDamageMult = HERO_GROUND_RUMBLE_DAMAGE_MULT + Math.min(0.36, (powerLevel - 1) * 0.032);
    hero.heroRumbleKnockback = HERO_GROUND_RUMBLE_KNOCKBACK + Math.min(18, (powerLevel - 1) * 1.45);

    if (!Number.isFinite(hero.heroFoodRainCd)) {
      hero.heroFoodRainCd = this.heroAbilityCooldownForSide(sideState, HERO_FOOD_RAIN_MIN_CD, HERO_FOOD_RAIN_MAX_CD);
    }
    if (!Number.isFinite(hero.heroGroundRumbleCd)) {
      hero.heroGroundRumbleCd = this.heroAbilityCooldownForSide(sideState, HERO_GROUND_RUMBLE_MIN_CD, HERO_GROUND_RUMBLE_MAX_CD);
    }
    if (!Number.isFinite(hero.heroCookerCd)) {
      hero.heroCookerCd = this.heroAbilityCooldownForSide(sideState, HERO_COOKER_MIN_CD, HERO_COOKER_MAX_CD);
    }
    if (typeof hero.heroCookerGuaranteedSpawned !== 'boolean') hero.heroCookerGuaranteedSpawned = false;
    if (!Number.isFinite(hero.heroAbilityGapCd)) hero.heroAbilityGapCd = 0;
  }

  heroFoodRainImpactX(sideName, minX, maxX) {
    const left = Math.min(Number(minX) || 0, Number(maxX) || 0);
    const right = Math.max(Number(minX) || 0, Number(maxX) || 0);
    if (right <= left) return left;
    const side = sideName === 'right' ? 'right' : 'left';
    const enemyTowerX = side === 'left' ? TOWER_X_RIGHT : TOWER_X_LEFT;
    const safeRadius = Math.max(1, HERO_FOOD_RAIN_ENEMY_BASE_SAFE_RADIUS);
    const safeMin = enemyTowerX - safeRadius;
    const safeMax = enemyTowerX + safeRadius;

    const leftEnd = Math.min(right, safeMin);
    const rightStart = Math.max(left, safeMax);
    const leftSpan = Math.max(0, leftEnd - left);
    const rightSpan = Math.max(0, right - rightStart);
    const totalSpan = leftSpan + rightSpan;

    if (totalSpan <= 0) return left + Math.random() * (right - left);
    const roll = Math.random() * totalSpan;
    if (roll < leftSpan) return left + Math.random() * leftSpan;
    return rightStart + Math.random() * rightSpan;
  }

  triggerHeroFoodRain(hero, sideState, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!hero || !hero.hero || !sideState) return;
    const foodType = hero.side === 'right' ? 'rice' : 'bread';
    this.queueHeroAbilityAnnouncement(hero, foodType === 'rice' ? 'RICE RAIN!' : 'BREAD RAIN!');
    const baseDropCount = Math.max(
      HERO_FOOD_RAIN_MIN_DROPS,
      Math.min(HERO_FOOD_RAIN_MAX_DROPS, Math.round(Number(hero.heroRainDropCount) || HERO_FOOD_RAIN_MIN_DROPS))
    );
    const dropVariance = Math.max(0, HERO_FOOD_RAIN_DROP_VARIANCE);
    const dropOffset = Math.floor(Math.random() * (dropVariance * 2 + 1)) - dropVariance;
    const dropCount = Math.max(HERO_FOOD_RAIN_MIN_DROPS, Math.min(HERO_FOOD_RAIN_MAX_DROPS, baseDropCount + dropOffset));
    const dropRadius = Math.max(HERO_FOOD_RAIN_RADIUS, Number(hero.heroRainRadius) || HERO_FOOD_RAIN_RADIUS);
    const rainDamageBaseRaw = (Number(hero.dmg) || 0)
      * Math.max(HERO_FOOD_RAIN_DAMAGE_MULT, Number(hero.heroRainDamageMult) || HERO_FOOD_RAIN_DAMAGE_MULT);
    const auraMulAtCast = this.presidentAuraMultiplier(hero);
    const baseDamage = this.minionOutgoingDamage(
      hero,
      rainDamageBaseRaw
    );
    const minX = TOWER_X_LEFT + 58;
    const maxX = TOWER_X_RIGHT - 58;
    const itemKinds = foodType === 'rice' ? HERO_FOOD_RAIN_RICE_KINDS : HERO_FOOD_RAIN_BREAD_KINDS;
    const bigKind = foodType === 'rice' ? 'balloonRiceBomb' : 'balloonBreadBomb';
    const bigQuota = Math.max(0, Math.min(HERO_FOOD_RAIN_BIG_PROJECTILES, dropCount));
    const bigDropIndices = new Set();
    while (bigDropIndices.size < bigQuota) bigDropIndices.add(Math.floor(Math.random() * dropCount));

    for (let i = 0; i < dropCount; i += 1) {
      const impactX = this.heroFoodRainImpactX(hero.side, minX, maxX);
      const impactY = TOWER_Y - 26 + (Math.random() * 156 - 58);
      const bigProjectile = bigDropIndices.has(i);
      const itemKind = bigProjectile
        ? bigKind
        : itemKinds[Math.floor(Math.random() * itemKinds.length)];
      const fromY = bigProjectile ? (-220 - Math.random() * 120) : (18 + Math.random() * 46);
      const duration = bigProjectile ? (1.22 + Math.random() * 0.42) : (0.34 + Math.random() * 0.36);
      const size = bigProjectile ? (2.24 + Math.random() * 0.46) : (0.8 + Math.random() * 0.52);
      this.queueHitSfx('herofoodrain', impactX, impactY, hero.side, {
        foodType,
        kind: itemKind,
        bigProjectile,
        seed: Math.random() * 100000,
        // Big payloads start well above the visible world so they clearly fall in from off-screen.
        fromY,
        toY: impactY,
        duration,
        size,
      });
      const impactRadius = bigProjectile ? (dropRadius * HERO_FOOD_RAIN_BIG_RADIUS_MULT) : dropRadius;
      if (bigProjectile) {
        const damageJitter = 1.12 + Math.random() * 0.58;
        const preStyleDamage = rainDamageBaseRaw
          * auraMulAtCast
          * auraMulAtCast
          * damageJitter
          * HERO_FOOD_RAIN_BIG_DAMAGE_MULT;
        this.queueHeroFoodRainImpact({
          side: hero.side,
          x: impactX,
          y: impactY,
          r: impactRadius,
          ttl: duration,
          preStyleDamage,
          foodType,
          goldScalar: 0.8,
        });
        continue;
      }

      this.queueHitSfx('foodburst', impactX, impactY, hero.side, { foodType, heavy: false });
      this.forEachEnemyMinionInRadius(
        hero.side,
        impactX,
        impactY,
        impactRadius,
        minionBuckets,
        bucketW,
        (other) => {
          if (!other || other.removed || other.side === hero.side || other.id === hero.id) return;
          const damageJitter = 0.95 + Math.random() * 0.4;
          this.dealMinionDamage(hero, other, baseDamage * damageJitter, 'explosion');
          if ((Number(other.hp) || 0) <= 0) this.killMinionByRef(other, hero.side, { goldScalar: 0.8 });
        }
      );
    }
    this.queueHitSfx('powerup', hero.x, hero.y - hero.r * 0.4, hero.side);
  }

  triggerHeroGroundRumble(hero, sideState, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!hero || !hero.hero || !sideState) return;
    const foodType = hero.side === 'right' ? 'rice' : 'bread';
    this.queueHeroAbilityAnnouncement(hero, foodType === 'rice' ? 'SUSHI RUMBLE!' : 'CROISSANT RUMBLE!');
    const maxBursts = Math.max(
      HERO_GROUND_RUMBLE_MIN_BURSTS,
      Math.min(HERO_GROUND_RUMBLE_MAX_BURSTS, Math.round(Number(hero.heroRumbleBursts) || HERO_GROUND_RUMBLE_MIN_BURSTS))
    );
    const rumbleRadius = Math.max(HERO_GROUND_RUMBLE_RADIUS, Number(hero.heroRumbleRadius) || HERO_GROUND_RUMBLE_RADIUS);
    const knockback = Math.max(HERO_GROUND_RUMBLE_KNOCKBACK, Number(hero.heroRumbleKnockback) || HERO_GROUND_RUMBLE_KNOCKBACK);
    const rumbleDamageBaseRaw = (Number(hero.dmg) || 0)
      * Math.max(HERO_GROUND_RUMBLE_DAMAGE_MULT, Number(hero.heroRumbleDamageMult) || HERO_GROUND_RUMBLE_DAMAGE_MULT);
    const auraMulAtCast = this.presidentAuraMultiplier(hero);
    const baseDamage = this.minionOutgoingDamage(
      hero,
      rumbleDamageBaseRaw
    );
    const candidates = [];
    this.forEachEnemyMinionInRadius(
      hero.side,
      hero.x,
      hero.y,
      360,
      minionBuckets,
      bucketW,
      (other) => {
        if (!other || other.removed || other.side === hero.side || other.id === hero.id) return;
        candidates.push(other);
      }
    );
    candidates.sort((a, b) => ((Number(a.x) || 0) - (Number(hero.x) || 0)) ** 2 + ((Number(a.y) || 0) - (Number(hero.y) || 0)) ** 2
      - (((Number(b.x) || 0) - (Number(hero.x) || 0)) ** 2 + ((Number(b.y) || 0) - (Number(hero.y) || 0)) ** 2));
    const chosenCenters = [];
    const used = new Set();
    for (const target of candidates) {
      if (chosenCenters.length >= maxBursts) break;
      if (!target || used.has(target.id)) continue;
      used.add(target.id);
      chosenCenters.push({ x: Number(target.x) || hero.x, y: Number(target.y) || hero.y });
    }
    if (chosenCenters.length === 0) {
      const dir = hero.side === 'left' ? 1 : -1;
      chosenCenters.push({
        x: clamp((Number(hero.x) || 0) + dir * 120, TOWER_X_LEFT + 60, TOWER_X_RIGHT - 60),
        y: clamp((Number(hero.y) || 0) + (Math.random() * 90 - 45), TOWER_Y - 160, TOWER_Y + 170),
      });
    }

    const pushDir = hero.side === 'left' ? 1 : -1;
    const rumbleKind = foodType === 'rice' ? 'sushiRoll' : 'croissant';
    const flingLandingDamage = Math.max(2, baseDamage * 0.42 + knockback * 0.1);
    for (const center of chosenCenters) {
      const cx = Number(center.x) || 0;
      const cy = Number(center.y) || 0;
      const fromY = clamp(cy + 14 + Math.random() * 18, TOWER_Y - 24, GROUND_Y - 6);
      const toY = -38 - Math.random() * 102;
      const rumbleVisualDuration = (0.56 + Math.random() * 0.24) * 4;
      this.queueHitSfx('herorumble', cx, cy, hero.side, {
        foodType,
        kind: rumbleKind,
        seed: Math.random() * 100000,
        fromY,
        toY,
        // Half current speed (2x longer than current rumble launch timing).
        duration: rumbleVisualDuration,
        size: 1.82 + Math.random() * 0.44,
      });
      this.queueHitSfx('foodburst', cx, cy, hero.side, { foodType, heavy: true });
      this.forEachEnemyMinionInRadius(
        hero.side,
        cx,
        cy,
        rumbleRadius,
        minionBuckets,
        bucketW,
        (other) => {
          if (!other || other.removed || other.side === hero.side || other.id === hero.id) return;
          this.dealMinionDamage(hero, other, baseDamage * (1.16 + Math.random() * 0.42), 'explosion');
          if ((Number(other.hp) || 0) <= 0) {
            this.killMinionByRef(other, hero.side, { goldScalar: 0.82 });
            return;
          }
          const resist = other.super || other.dragon || other.stoneGolem ? 0.62 : 1;
          const delay = 0.04 + Math.random() * 0.08;
          this.startStoneGolemFling(
            other,
            pushDir,
            flingLandingDamage * resist,
            hero.side,
            delay
          );
        }
      );

      // Add spaced AoE pulses along the upward path to hit airborne units in discrete circles.
      // Gap is slightly above 2r so neighboring checks do not overlap.
      const pathDistance = Math.max(0, Math.abs(toY - fromY));
      const pulseGap = Math.max(1, rumbleRadius * HERO_GROUND_RUMBLE_PATH_PULSE_GAP_MULT);
      for (let distAlong = pulseGap; distAlong < pathDistance; distAlong += pulseGap) {
        const t = pathDistance <= 0 ? 0 : (distAlong / pathDistance);
        const pulseY = lerp(fromY, toY, t);
        const delay = rumbleVisualDuration * t;
        const preStyleDamage = rumbleDamageBaseRaw
          * auraMulAtCast
          * auraMulAtCast
          * (1.02 + Math.random() * 0.34);
        this.queueHeroRumblePulse({
          side: hero.side,
          x: cx,
          y: pulseY,
          r: rumbleRadius,
          ttl: delay,
          preStyleDamage,
          foodType,
          goldScalar: 0.82,
        });
      }
    }
    this.queueHitSfx('explosion', hero.x, hero.y + hero.r * 0.1, hero.side);
  }

  heroCookerAbsorbNearby(cooker, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!cooker || !cooker.heroCooker) return 0;
    const cap = Math.max(1, Math.min(HERO_COOKER_MAX_EAT, Math.round(Number(cooker.heroCookerEatCap) || HERO_COOKER_MAX_EAT)));
    let stored = Math.max(0, Math.round(Number(cooker.heroCookerEatCount) || 0));
    if (stored >= cap) return 0;
    const canAbsorb = (other) => {
      if (!other || other.removed || other.side === cooker.side || other.id === cooker.id) return false;
      // Cooker should not eat enemy hero, golem, or other cooker units.
      if (other.hero || other.stoneGolem || other.heroCooker) return false;
      return true;
    };
    const seen = new Set();
    const victims = [];
    this.forEachEnemyMinionInRadius(
      cooker.side,
      cooker.x,
      cooker.y,
      Math.max(HERO_COOKER_EAT_RADIUS, Number(cooker.heroCookerEatRadius) || HERO_COOKER_EAT_RADIUS),
      minionBuckets,
      bucketW,
      (other) => {
        if (!canAbsorb(other)) return;
        if (seen.has(other.id)) return;
        seen.add(other.id);
        victims.push(other);
      }
    );
    // Airborne flyover capture: if a flying enemy crosses directly above the cooker, it falls in.
    const cookerX = Number(cooker.x) || 0;
    const cookerY = Number(cooker.y) || 0;
    const potTopY = cookerY - Math.max(8, (Number(cooker.r) || 16) * 0.52);
    for (const other of this.minions) {
      if (!canAbsorb(other) || !other.flying) continue;
      if (seen.has(other.id)) continue;
      const dx = Math.abs((Number(other.x) || 0) - cookerX);
      if (dx > HERO_COOKER_FLYOVER_CAPTURE_HALF_WIDTH) continue;
      const yAbove = potTopY - (Number(other.y) || 0);
      if (yAbove < 0 || yAbove > HERO_COOKER_FLYOVER_MAX_HEIGHT) continue;
      seen.add(other.id);
      victims.push(other);
    }
    victims.sort((a, b) => {
      const adx = (Number(a.x) || 0) - (Number(cooker.x) || 0);
      const ady = (Number(a.y) || 0) - (Number(cooker.y) || 0);
      const bdx = (Number(b.x) || 0) - (Number(cooker.x) || 0);
      const bdy = (Number(b.y) || 0) - (Number(cooker.y) || 0);
      return adx * adx + ady * ady - (bdx * bdx + bdy * bdy);
    });
    let absorbed = 0;
    for (const victim of victims) {
      if (stored >= cap) break;
      if (!canAbsorb(victim)) continue;
      const victimVisual = this.buildMinionGhostSnapshot(victim);
      const victimR = Math.max(8, Number(victim.r) || 12);
      const toX = (Number(cooker.x) || 0) + (Math.random() * 8 - 4);
      const toY = (Number(cooker.y) || 0) - Math.max(7, (Number(cooker.r) || 16) * 0.46);
      this.queueHitSfx('herocookerswallow', Number(victim.x) || 0, Number(victim.y) || 0, cooker.side, {
        victim: victimVisual,
        fromX: Number(victim.x) || 0,
        fromY: (Number(victim.y) || 0) - victimR * 0.2,
        toX,
        toY,
        duration: 0.34 + Math.random() * 0.2,
        arc: 18 + victimR * 0.7 + Math.random() * 16,
      });
      this.killMinionByRef(victim, cooker.side, { goldScalar: 0.56, suppressDeathGhost: true });
      stored += 1;
      absorbed += 1;
      cooker.heroCookerAnimT += 0.5;
    }
    cooker.heroCookerEatCount = stored;
    return absorbed;
  }

  startHeroCookerCooking(cooker) {
    if (!cooker || !cooker.heroCooker) return;
    cooker.heroCookerState = 'cooking';
    cooker.heroCookerCookTtl = Math.max(0.1, Number(cooker.heroCookerCookMaxTtl) || HERO_COOKER_COOK_TIME);
    cooker.heroCookerBubbleCd = 0.24;
    const maxHp = Math.max(1, Number(cooker.maxHp) || 1);
    const hpCost = maxHp * HERO_COOKER_HEALTH_COST_FRACTION;
    cooker.hp = Math.max(0, (Number(cooker.hp) || 0) - hpCost);
    this.queueHitSfx('herocooker', cooker.x, cooker.y, cooker.side, {
      foodType: cooker.heroCookerFoodType,
      count: Math.max(0, Math.round(Number(cooker.heroCookerEatCount) || 0)),
      pulse: true,
    });
  }

  spawnHeroCooker(hero, sideState, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!hero || !hero.hero || !sideState) return null;
    if (this.sideHasActiveHeroCooker(hero.side)) return null;
    const foodType = hero.side === 'right' ? 'rice' : 'bread';
    this.queueHeroAbilityAnnouncement(hero, foodType === 'rice' ? 'RICE COOKER!' : 'BREAD OVEN!');
    const dir = hero.side === 'left' ? 1 : -1;
    const x = clamp((Number(hero.x) || 0) + dir * (Math.max(16, Number(hero.r) || 16) + 24), TOWER_X_LEFT + 58, TOWER_X_RIGHT - 58);
    const y = clamp((Number(hero.y) || 0) + 6, TOWER_Y - 170, TOWER_Y + 170);
    const hp = Math.max(1, (Number(hero.maxHp) || 1) * 0.5);
    const radius = Math.max(18, (Number(hero.r) || 20) * 0.82);
    const cooker = {
      id: this.seq++,
      side: hero.side,
      x,
      y,
      hp,
      maxHp: hp,
      hpFromUnitHpUpgrade: 0,
      dmg: 0,
      speed: HERO_COOKER_MOVE_SPEED,
      atkCd: 0,
      r: radius,
      tier: Math.max(1, Math.min(3, Math.floor((Number(sideState.powerLevel) || 1) / 2))),
      level: Math.max(1, Math.round(Number(sideState.powerLevel) || 1) + 2),
      summoned: true,
      necroRevived: false,
      super: false,
      flying: false,
      heroCooker: true,
      heroCookerFoodType: foodType,
      heroCookerState: 'hunting',
      heroCookerEatCap: HERO_COOKER_MAX_EAT,
      heroCookerEatCount: 0,
      heroCookerEatRadius: HERO_COOKER_EAT_RADIUS,
      heroCookerMoveSpeed: HERO_COOKER_MOVE_SPEED,
      heroCookerCookTtl: 0,
      heroCookerCookMaxTtl: HERO_COOKER_COOK_TIME,
      heroCookerBubbleCd: 0.24,
      heroCookerAnimT: Math.random() * Math.PI * 2,
      heroCookerSpin: 0,
      hitFlashTtl: 0,
      candleCarrier: false,
      candleCarrierSide: null,
      candleBurnTtl: 0,
      candleBurnTick: 0,
      dragon: false,
      balloon: false,
      digger: false,
      gunner: false,
      necrominion: false,
      rider: false,
      shieldBearer: false,
      stoneGolem: false,
      hero: false,
      monk: false,
      president: false,
      explosive: false,
      failedSpecialType: null,
      heroSwing: 0,
    };
    this.minions.push(cooker);
    this.queueHitSfx('powerup', x, y - radius * 0.35, hero.side);
    return cooker;
  }

  tickHeroCooker(cooker, dt, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!cooker || !cooker.heroCooker) return;
    if (!Number.isFinite(cooker.heroCookerAnimT)) cooker.heroCookerAnimT = 0;
    if (!Number.isFinite(cooker.heroCookerSpin)) cooker.heroCookerSpin = 0;
    cooker.heroCookerAnimT += dt * 3.2;
    cooker.heroCookerSpin += dt * 2.8;
    cooker.atkCd = Math.max(0.2, Number(cooker.atkCd) || 0);
    const state = typeof cooker.heroCookerState === 'string' ? cooker.heroCookerState : 'hunting';
    cooker.heroCookerState = state;
    const cap = Math.max(1, Math.min(HERO_COOKER_MAX_EAT, Math.round(Number(cooker.heroCookerEatCap) || HERO_COOKER_MAX_EAT)));
    const stored = Math.max(0, Math.round(Number(cooker.heroCookerEatCount) || 0));
    const loadPct = Math.max(0, Math.min(1, stored / cap));
    const loadSpeedMul = HERO_COOKER_EMPTY_LOAD_SPEED_MULT
      + (HERO_COOKER_FULL_LOAD_SPEED_MULT - HERO_COOKER_EMPTY_LOAD_SPEED_MULT) * loadPct;
    const dir = cooker.side === 'left' ? 1 : -1;
    const baseMoveSpeed = Math.max(2, Number(cooker.heroCookerMoveSpeed) || HERO_COOKER_MOVE_SPEED);
    const moveSpeed = baseMoveSpeed * loadSpeedMul;
    cooker.x = clamp((Number(cooker.x) || 0) + dir * moveSpeed * dt, TOWER_X_LEFT + 56, TOWER_X_RIGHT - 56);
    if (state !== 'cooking') {
      const absorbed = this.heroCookerAbsorbNearby(cooker, minionBuckets, bucketW);
      if (absorbed > 0) {
        this.queueHitSfx('herocooker', cooker.x, cooker.y - cooker.r * 0.2, cooker.side, {
          foodType: cooker.heroCookerFoodType,
          pulse: false,
        });
      }
      if ((Number(cooker.heroCookerEatCount) || 0) >= cap) {
        this.startHeroCookerCooking(cooker);
      }
    }
    if (!Number.isFinite(cooker.heroCookerCookTtl)) cooker.heroCookerCookTtl = HERO_COOKER_COOK_TIME;
    if (!Number.isFinite(cooker.heroCookerCookMaxTtl) || cooker.heroCookerCookMaxTtl <= 0) {
      cooker.heroCookerCookMaxTtl = HERO_COOKER_COOK_TIME;
    }
    if (cooker.heroCookerState !== 'cooking') return;
    cooker.heroCookerCookTtl = Math.max(0, cooker.heroCookerCookTtl - dt);
    if (!Number.isFinite(cooker.heroCookerBubbleCd)) cooker.heroCookerBubbleCd = 0.24;
    cooker.heroCookerBubbleCd = Math.max(0, cooker.heroCookerBubbleCd - dt);
    if (cooker.heroCookerBubbleCd === 0 && cooker.heroCookerCookTtl > 0) {
      cooker.heroCookerBubbleCd = 0.34 + Math.random() * 0.26;
      this.queueHitSfx('herocooker', cooker.x, cooker.y - cooker.r * 0.3, cooker.side, {
        foodType: cooker.heroCookerFoodType,
        pulse: false,
      });
    }
    if (cooker.heroCookerCookTtl > 0) return;
    this.queueHitSfx('foodburst', cooker.x, cooker.y, cooker.side, {
      foodType: cooker.heroCookerFoodType,
      heavy: true,
    });
    cooker.heroCookerState = 'hunting';
    cooker.heroCookerEatCount = 0;
    cooker.heroCookerBubbleCd = 0.28;
  }

  tickHeroAbilities(hero, sideState, dt, minionBuckets = null, bucketW = MINION_TARGET_BUCKET_W) {
    if (!hero || !hero.hero || !sideState) return;
    this.refreshHeroCombatScaling(hero, sideState);
    if (HERO_ENABLE_FOOD_RAIN) {
      hero.heroFoodRainCd = Math.max(0, (Number(hero.heroFoodRainCd) || 0) - dt);
    } else {
      hero.heroFoodRainCd = Number.POSITIVE_INFINITY;
    }
    hero.heroGroundRumbleCd = Math.max(0, (Number(hero.heroGroundRumbleCd) || 0) - dt);
    hero.heroCookerCd = Math.max(0, (Number(hero.heroCookerCd) || 0) - dt);
    hero.heroAbilityGapCd = Math.max(0, (Number(hero.heroAbilityGapCd) || 0) - dt);
    if (typeof hero.heroCookerGuaranteedSpawned !== 'boolean') hero.heroCookerGuaranteedSpawned = false;

    const heroMaxHp = Math.max(1, Number(hero.maxHp) || 1);
    const heroHp = Math.max(0, Number(hero.hp) || 0);
    const cookerGuaranteedHp = heroMaxHp * HERO_COOKER_GUARANTEE_HP_PCT;
    if (!hero.heroRetreating
      && !hero.heroCookerGuaranteedSpawned
      && heroHp <= cookerGuaranteedHp
    ) {
      const forcedCooker = this.spawnHeroCooker(hero, sideState, minionBuckets, bucketW);
      if (forcedCooker) {
        hero.heroCookerGuaranteedSpawned = true;
        hero.heroCookerCd = this.heroAbilityCooldownForSide(sideState, HERO_COOKER_MIN_CD, HERO_COOKER_MAX_CD);
        hero.heroAbilityGapCd = HERO_ABILITY_MIN_GAP;
      }
      return;
    }

    if (hero.heroRetreating) return;
    if ((Number(hero.heroAbilityGapCd) || 0) > 0) return;
    const ready = [];
    if (HERO_ENABLE_FOOD_RAIN && (Number(hero.heroFoodRainCd) || 0) === 0) ready.push('rain');
    if ((Number(hero.heroGroundRumbleCd) || 0) === 0) ready.push('rumble');
    if ((Number(hero.heroCookerCd) || 0) === 0) ready.push('cooker');
    if (!ready.length) return;

    // Avoid hard priority bias when multiple abilities become ready at once.
    for (let i = ready.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = ready[i];
      ready[i] = ready[j];
      ready[j] = tmp;
    }

    let triggered = false;
    for (const ability of ready) {
      if (ability === 'rain') {
        this.triggerHeroFoodRain(hero, sideState, minionBuckets, bucketW);
        hero.heroFoodRainCd = this.heroAbilityCooldownForSide(sideState, HERO_FOOD_RAIN_MIN_CD, HERO_FOOD_RAIN_MAX_CD);
        triggered = true;
      } else if (ability === 'rumble') {
        this.triggerHeroGroundRumble(hero, sideState, minionBuckets, bucketW);
        hero.heroGroundRumbleCd = this.heroAbilityCooldownForSide(sideState, HERO_GROUND_RUMBLE_MIN_CD, HERO_GROUND_RUMBLE_MAX_CD);
        triggered = true;
      } else if (ability === 'cooker') {
        if (Math.random() <= HERO_COOKER_READY_CAST_CHANCE) {
          const cooker = this.spawnHeroCooker(hero, sideState, minionBuckets, bucketW);
          hero.heroCookerCd = cooker
            ? this.heroAbilityCooldownForSide(sideState, HERO_COOKER_MIN_CD, HERO_COOKER_MAX_CD)
            : 1.5;
          if (cooker) hero.heroCookerGuaranteedSpawned = true;
          triggered = Boolean(cooker);
        } else {
          hero.heroCookerCd = this.heroAbilityCooldownForSide(sideState, HERO_COOKER_RETRY_MIN_CD, HERO_COOKER_RETRY_MAX_CD);
        }
      }
      if (triggered) break;
    }
    if (triggered) hero.heroAbilityGapCd = HERO_ABILITY_MIN_GAP;
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
        president.presidentSpeechCd = PRESIDENT_RANDOM_LINE_INTERVAL;
        this.queueHitSfx('upgrade', president.x, president.y - 4, president.side);
        this.queueLine(
          presidentRallyLine(president.side, this.themeMode),
          president.x,
          president.y - president.r - 28,
          president.side
        );
      }
      return;
    }

    const dir = president.side === 'left' ? 1 : -1;
    const enemyX = president.side === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
    const crawlTargetX = enemyX - dir * PRESIDENT_CREEP_TOWER_BUFFER;
    const crawlSpeed = Math.max(PRESIDENT_CREEP_SPEED_MIN, (Number(president.speed) || 0) * PRESIDENT_CREEP_SPEED_MULT);
    const crawlDeltaX = crawlTargetX - president.x;
    if (Math.abs(crawlDeltaX) > 0.5) president.x += clamp(crawlDeltaX, -crawlSpeed * dt, crawlSpeed * dt);

    if (president.presidentExecutiveOrderUpgraded && (Number(president.presidentExecutiveOrderCd) || 0) === 0) {
      const target = this.pickPresidentialPardonTarget(president);
      if (target) {
        this.triggerPresidentialPardon(president, target);
        president.presidentExecutiveOrderCd = presidentExecutiveOrderCooldown();
      } else {
        president.presidentExecutiveOrderCd = 1.4;
      }
    }

    if (president.presidentSpeechCd === 0) {
      this.queueLine(
        randomFrom(presidentBattleLines(president.side, this.themeMode)),
        president.x,
        president.y - president.r - 28,
        president.side
      );
      president.presidentSpeechCd = PRESIDENT_RANDOM_LINE_INTERVAL;
      this.queueHitSfx('powerup', president.x, president.y - 8, president.side);
    }
  }

  pickPresidentialPardonTarget(president) {
    if (!president || !president.side) return null;
    const sideName = president.side === 'right' ? 'right' : 'left';
    const maxRange = Math.max(110, Number(president.presidentAuraRadius) || 190) * PRESIDENT_AURA_RANGE_SCALE;
    const maxRangeSq = maxRange * maxRange;
    let best = null;
    let bestScore = -Infinity;
    for (const ally of this.minions) {
      if (!ally || ally.removed || ally.side !== sideName || ally.id === president.id) continue;
      if ((Number(ally.hp) || 0) <= 0) continue;
      const dx = (Number(ally.x) || 0) - (Number(president.x) || 0);
      const dy = (Number(ally.y) || 0) - (Number(president.y) || 0);
      if (dx * dx + dy * dy > maxRangeSq) continue;
      const dist = Math.hypot(dx, dy);
      const frontBias = sideName === 'left'
        ? ((Number(ally.x) || 0) / WORLD_W)
        : ((WORLD_W - (Number(ally.x) || 0)) / WORLD_W);
      const maxHp = Math.max(1, Number(ally.maxHp) || 1);
      const hp = Math.max(0, Number(ally.hp) || 0);
      const missingPct = Math.max(0, (maxHp - hp) / maxHp);
      const hasPardon = (Number(ally.executiveOrderHitsLeft) || 0) > 0;
      const score = frontBias * 1.3 + missingPct * 0.45 - dist * 0.0024 + (hasPardon ? -1.5 : 1.55);
      if (score > bestScore) {
        bestScore = score;
        best = ally;
      }
    }
    return best;
  }

  triggerPresidentialPardon(president, target) {
    if (!president || !target) return;
    target.executiveOrderHitsMax = PRESIDENT_EXECUTIVE_ORDER_HITS;
    target.executiveOrderHitsLeft = PRESIDENT_EXECUTIVE_ORDER_HITS;
    target.executiveOrderBreakTtl = 0;

    president.presidentExecutiveOrderSignMaxTtl = PRESIDENT_EXECUTIVE_ORDER_SIGN_TTL;
    president.presidentExecutiveOrderSignTtl = PRESIDENT_EXECUTIVE_ORDER_SIGN_TTL;
    president.presidentExecutiveOrderBeamMaxTtl = PRESIDENT_EXECUTIVE_ORDER_BEAM_TTL;
    president.presidentExecutiveOrderBeamTtl = PRESIDENT_EXECUTIVE_ORDER_BEAM_TTL;
    president.presidentExecutiveOrderBeamToX = Number(target.x) || 0;
    president.presidentExecutiveOrderBeamToY = (Number(target.y) || 0) - Math.max(8, (Number(target.r) || 12) * 0.45);

    const signX = (Number(president.x) || 0) + (president.side === 'left' ? 1 : -1) * 10;
    const signY = (Number(president.y) || 0) - Math.max(8, (Number(president.r) || 16) * 0.45);
    this.queueHitSfx('upgrade', signX, signY, president.side);
    this.queueHitSfx('powerup', target.x, target.y - Math.max(8, (Number(target.r) || 12) * 0.45), president.side);
    this.queueHitSfx('blocked', target.x, target.y - Math.max(8, (Number(target.r) || 12) * 0.25), president.side);
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
    this.queueLine(heroSummonLine(sideName, this.themeMode), hx, hy - (hero?.r || 16) - 24, sideName);
  }

  triggerTowerStoneGolem(sideName, x, y) {
    const side = this[sideName];
    if (!side || side.towerGolemRescueUsed) return;
    side.towerGolemRescueUsed = true;

    const golem = this.spawnMinion(sideName, { forceType: 'stonegolem', countSpawn: false });
    const gx = golem?.x ?? (sideName === 'left' ? TOWER_X_LEFT + 64 : TOWER_X_RIGHT - 64);
    const gy = golem?.y ?? (TOWER_Y + 12);
    this.queueHitSfx('explosion', gx, gy, sideName);
    this.queueLine(golemSummonLine(sideName, this.themeMode), gx, gy - (golem?.r || 24) - 24, sideName);

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
    if (killerSide === 'left') return this.grantGold('left', this.goldFromMinionKill(this.left, scalar), true);
    if (killerSide === 'right') return this.grantGold('right', this.goldFromMinionKill(this.right, scalar), true);
    return 0;
  }

  arrowDamageGoldFromDamage(side, damage, target = null) {
    const dmg = Math.max(0, Number(damage) || 0);
    if (dmg <= 0 || !side) return 0;
    const maxHp = Math.max(1, Number(target?.maxHp) || 1);
    const hpRatio = clamp(dmg / maxHp, 0, 1);
    const economyLevel = Math.max(1, Number(side.resourceLevel) || 1);
    const combatBonus = 1 + (economyLevel - 1) * ECONOMY_COMBAT_GOLD_BONUS_PER_LEVEL;
    const comboBonus = this.hasMaxCombo(side) ? ARROW_DAMAGE_GOLD_MAX_COMBO_MULT : 1;
    const fullUnitGold = MINION_KILL_GOLD_BASE * ARROW_DAMAGE_GOLD_UNIT_KILL_EQUIV * combatBonus * comboBonus;
    const flatBonus = Math.max(0, economyLevel - 1) * ECONOMY_ARROW_HIT_FLAT_GOLD_PER_LEVEL;
    return hpRatio * fullUnitGold + flatBonus;
  }

  maxCurrentResourceCoinValue() {
    let maxValue = 1;
    if (Array.isArray(this.resources)) {
      for (const res of this.resources) {
        const value = Math.max(0, Math.floor(Number(res?.value) || 0));
        if (value > maxValue) maxValue = value;
      }
    }
    const pendingWait = Math.max(0.05, Number(this.pendingResourceInterval) || RESOURCE_SPAWN_START_MIN_SECONDS);
    const leftValue = this.resourceValueForSide('left', pendingWait);
    const rightValue = this.resourceValueForSide('right', pendingWait);
    return Math.max(1, maxValue, leftValue, rightValue);
  }

  arrowDamageGoldShotCap() {
    return Math.max(1, Math.floor(this.maxCurrentResourceCoinValue() * ARROW_DAMAGE_GOLD_SHOT_CAP_RATIO));
  }

  awardArrowDamageGold(sideName, damage, target = null, arrow = null) {
    const side = sideName === 'right' ? this.right : (sideName === 'left' ? this.left : null);
    if (!side) return 0;
    let raw = this.arrowDamageGoldFromDamage(side, damage, target);
    if (this.hasMaxCombo(side)) raw = Math.ceil(raw);
    if (!(raw > 0)) return 0;
    const cap = this.arrowDamageGoldShotCap();
    let capRemaining = cap;
    if (arrow && typeof arrow === 'object') {
      if (!Number.isFinite(arrow.arrowDamageGoldAwarded)) arrow.arrowDamageGoldAwarded = 0;
      capRemaining = Math.max(0, cap - (Number(arrow.arrowDamageGoldAwarded) || 0));
    }
    const maxWhole = Math.floor(capRemaining);
    if (maxWhole <= 0) return 0;
    const carry = Math.max(0, Number(side.arrowDamageGoldRemainder) || 0);
    const total = raw + carry;
    let gain = Math.floor(total);
    const capped = gain > maxWhole;
    if (capped) gain = maxWhole;
    side.arrowDamageGoldRemainder = capped ? 0 : (total - gain);
    if (gain <= 0) return 0;
    const awarded = this.grantGold(sideName, gain, true);
    this.recordMinionDamageGoldCollected(sideName, awarded);
    this.recordArrowShotGold(sideName, awarded, arrow);
    if (arrow && typeof arrow === 'object') arrow.arrowDamageGoldAwarded += gain;
    const chargeGain = Math.max(1, Math.round(awarded * ARROW_DAMAGE_GOLD_UPGRADE_CHARGE_MULT));
    this.addUpgradeCharge(side, chargeGain);
    return awarded;
  }

  buildMinionGhostSnapshot(minion) {
    if (!minion) return;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    return {
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
      heroCooker: Boolean(minion.heroCooker),
      heroCookerFoodType: typeof minion.heroCookerFoodType === 'string' ? minion.heroCookerFoodType : null,
      heroCookerCookTtl: roundTo(minion.heroCookerCookTtl, 2),
      heroCookerCookMaxTtl: roundTo(minion.heroCookerCookMaxTtl, 2),
      heroCookerAnimT: roundTo(minion.heroCookerAnimT, 3),
      heroCookerSpin: roundTo(minion.heroCookerSpin, 3),
      president: Boolean(minion.president),
      dragon: Boolean(minion.dragon),
      balloon: Boolean(minion.balloon),
      balloonLevel: Math.max(0, Math.round(Number(minion.balloonLevel) || 0)),
      flying: Boolean(minion.flying),
      necrominion: Boolean(minion.necrominion),
      failedSpecialType: typeof minion.failedSpecialType === 'string' ? minion.failedSpecialType : null,
      digPhase: Number.isFinite(minion.digPhase) ? minion.digPhase : (Math.random() * Math.PI * 2),
      flyPhase: Number.isFinite(minion.flyPhase) ? minion.flyPhase : (Math.random() * Math.PI * 2),
      heroSwing: Number.isFinite(minion.heroSwing) ? minion.heroSwing : 0,
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunFlashTtl: 0,
      shieldPushTtl: 0,
      shieldPushScale: 1,
      shieldGuardPose: roundTo(minion.shieldGuardPose, 3),
      shieldDarkMetalTtl: roundTo(minion.shieldDarkMetalTtl, 2),
      golemSmashTtl: 0,
      golemShieldHp: 0,
      golemShieldMax: 0,
      golemShieldTtl: 0,
      hitFlashTtl: 0,
      monkHealScale: Number.isFinite(minion.monkHealScale) ? minion.monkHealScale : 1,
    };
  }

  queueMinionDeathGhost(minion, killerSide = null) {
    if (!minion) return;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const ghost = this.buildMinionGhostSnapshot(minion);
    if (!ghost) return;
    const killer = killerSide === 'left' || killerSide === 'right' ? killerSide : null;
    this.queueHitSfx('ghostfall', ghost.x, ghost.y, sideName, { killerSide: killer, ghost });
  }

  killMinion(index, killerSide = null, options = {}) {
    const minion = this.minions[index];
    if (!minion || minion.removed) return;

    const {
      goldScalar = 1,
      triggerExplosion = false,
      impactDamage = null,
      suppressDeathGhost = false,
    } = options;

    if (this.tryNecroExpertRevive(minion, killerSide)) {
      minion.removed = true;
      this.minions.splice(index, 1);
      return;
    }

    // If a balloon already dropped a bomb, ensure it still detonates even if the
    // carrier dies before the bomb timer reaches zero.
    if (minion.balloon && minion.balloonBombImpactPending) {
      // Mark it removed before resolving the blast so a chained enemy balloon
      // explosion cannot target and kill this same minion again mid-stack.
      minion.removed = true;
      this.resolveBalloonBombImpact(minion);
    }

    this.awardMinionKillGold(killerSide, goldScalar);
    this.recordMinionKill(killerSide);
    if (minion.hero) this.triggerHeroDramaticDeath(minion, killerSide);
    if (!suppressDeathGhost) this.queueMinionDeathGhost(minion, killerSide);
    minion.removed = true;
    const currentIndex = this.minions.indexOf(minion);
    if (currentIndex >= 0) this.minions.splice(currentIndex, 1);

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
    this.queueLine(randomFrom(heroDeathLines(hero.side, this.themeMode)), x, y - (hero.r || 16) - 27, hero.side);
    this.queueLine(heroDeathEncoreLine(hero.side, this.themeMode), x, y - (hero.r || 16) - 45, hero.side);
  }

  canNecroExpertRevive(minion) {
    if (!minion || minion.removed) return false;
    if ((Number(minion.hp) || 0) > 0) return false;
    if (minion.summoned || minion.necroRevived) return false;
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
    const originalHpFromUnitHpUpgrade = clamp(Number(minion.hpFromUnitHpUpgrade) || 0, 0, originalMaxHp);
    const revivedHpFromUnitHpUpgrade = clamp(
      originalHpFromUnitHpUpgrade * NECRO_EXPERT_REVIVE_HP_FRACTION,
      0,
      revivedMaxHp
    );
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
      hpFromUnitHpUpgrade: revivedHpFromUnitHpUpgrade,
      atkCd: Math.max(0.18, Number(minion.atkCd) || 0),
      removed: false,
      summoned: true,
      necroRevived: true,
      candleCarrier: false,
      candleCarrierSide: null,
      candleBurnTtl: 0,
      candleBurnTick: 0,
      hitFlashTtl: 0,
      balloonHitCircleIndex: -1,
      balloonHitCircleTtl: 0,
      gunnerSkyCannonCd: 0,
      gunnerFoodThrowCd: 0,
      gunnerFoodThrowUnlocked: false,
      gunnerSkyCannonSetupTtl: 0,
      gunnerSkyCannonAimX: null,
      gunnerSkyCannonAimY: null,
      gunnerSkyCannonQueue: null,
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
      executiveOrderHitsLeft: 0,
      executiveOrderHitsMax: PRESIDENT_EXECUTIVE_ORDER_HITS,
      executiveOrderBreakTtl: 0,
      failedSpecialType: null,
      shieldGuardPose: 0,
      shieldGuardTarget: 0,
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
    revived.presidentExecutiveOrderUpgraded = revived.president
      ? (Number(sideState?.presidentExecutiveOrderLevel) || 0) > 0
      : false;

    if (revived.flying) {
      revived.flyBaseY = y;
      if (!Number.isFinite(revived.flyPhase)) revived.flyPhase = Math.random() * Math.PI * 2;
      if (revived.balloon) {
        revived.balloonHealthDropVisual = this.balloonHealthDropOffset(revived);
      }
      revived.dragonBreathTtl = 0;
      revived.dragonBreathToX = null;
      revived.dragonBreathToY = null;
      revived.dragonSuperBreathCd = DRAGON_SUPER_BREATH_INTERVAL * 0.5;
      revived.dragonSuperBreathRiseTtl = 0;
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
      revived.gunnerFoodThrowUnlocked = (Number(sideState?.gunnerSkyCannonLevel) || 0) >= GUNNER_FOOD_THROW_UNLOCK_LEVEL;
      revived.gunnerFoodThrowCd = revived.gunnerFoodThrowUnlocked
        ? (0.45 + Math.random() * 0.32)
        : 0;
      revived.gunnerSkyCannonSetupTtl = 0;
      revived.gunnerSkyCannonAimX = null;
      revived.gunnerSkyCannonAimY = null;
      revived.gunnerSkyCannonQueue = null;
    }
    if (revived.necrominion) {
      revived.necroShieldMax = revived.maxHp;
      revived.necroShieldHp = revived.maxHp;
      revived.necroShieldTtl = NECRO_SELF_SHIELD_FADE_SECONDS;
      revived.necroShieldMaxTtl = NECRO_SELF_SHIELD_FADE_SECONDS;
    }
    if (revived.rider) {
      revived.riderChargeReady = true;
      revived.riderChargeMoveTicks = RIDER_CHARGE_REARM_MOVE_TICKS;
      revived.riderChargeStartX = x;
    }
    if (revived.hero) {
      revived.heroRetreating = false;
      revived.heroArrowHits = 0;
      revived.heroSwing = 0;
      revived.heroSwingDir = 1;
      revived.heroSwingAttackT = 0;
      revived.heroCookerGuaranteedSpawned = false;
    }
    if (revived.monk) {
      revived.monkFirstHeal = true;
      revived.monkHealScale = Math.max(0.4, Number(revived.monkHealScale) || 1);
      revived.monkHealCircleCd = MONK_HEAL_CIRCLE_INTERVAL;
    }
    if (revived.president) {
      revived.presidentSetup = false;
      revived.presidentPodiumX = presidentPodiumTargetX(sideName);
      revived.presidentPodiumY = TOWER_Y + 18 + (Math.random() * 24 - 12);
      revived.presidentSpeechCd = 1 + Math.random() * 1.4;
      revived.presidentExecutiveOrderCd = presidentExecutiveOrderCooldown();
      revived.presidentExecutiveOrderSignTtl = 0;
      revived.presidentExecutiveOrderSignMaxTtl = PRESIDENT_EXECUTIVE_ORDER_SIGN_TTL;
      revived.presidentExecutiveOrderBeamTtl = 0;
      revived.presidentExecutiveOrderBeamMaxTtl = PRESIDENT_EXECUTIVE_ORDER_BEAM_TTL;
      revived.presidentExecutiveOrderBeamToX = null;
      revived.presidentExecutiveOrderBeamToY = null;
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
      riderChargeMoveTicks: 0,
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
      shieldGuardPose: 0,
      shieldGuardTarget: 0,
      shieldDarkMetalCd: 0,
      shieldDarkMetalTtl: 0,
      stoneGolem: false,
      golemSmashTtl: 0,
      golemShieldHp: 0,
      golemShieldMax: 0,
      golemShieldTtl: 0,
      golemBiteCd: 0,
      golemBiteTargetId: 0,
      golemBiteHeldTargetId: 0,
      golemBiteChewTickTtl: 0,
      golemBiteJumpTtl: 0,
      golemBiteJumpMaxTtl: STONE_GOLEM_BITE_JUMP_TTL,
      golemBiteLandTtl: 0,
      golemBiteLandMaxTtl: STONE_GOLEM_BITE_LAND_TTL,
      golemBiteStartX: null,
      golemBiteStartY: null,
      golemBiteJumpLift: 0,
      golemBiteAnimT: 0,
      golemBiteLockTtl: 0,
      necroShieldHp: 0,
      necroShieldMax: 0,
      necroShieldTtl: 0,
      necroShieldMaxTtl: NECRO_SELF_SHIELD_FADE_SECONDS,
      reviveShieldHp: 0,
      reviveShieldMax: 0,
      reviveShieldTtl: 0,
      reviveShieldMaxTtl: NECRO_REVIVE_SHIELD_SECONDS,
      hitFlashTtl: 0,
      balloonHitCircleIndex: -1,
      balloonHitCircleTtl: 0,
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
      heroBaseDmg: 0,
      heroArrowHits: 0,
      heroSlashRadius: 0,
      heroLimbSwingDamageMult: 0,
      heroLineCd: 0,
      heroSwing: 0,
      heroSwingDir: 1,
      heroSwingAttackT: 0,
      heroAbilityGapCd: 0,
      heroFoodRainCd: 0,
      heroGroundRumbleCd: 0,
      heroCookerCd: 0,
      heroCookerGuaranteedSpawned: false,
      heroRainDropCount: 0,
      heroRainRadius: 0,
      heroRainDamageMult: 0,
      heroRumbleBursts: 0,
      heroRumbleRadius: 0,
      heroRumbleDamageMult: 0,
      heroRumbleKnockback: 0,
      heroRetreating: false,
      heroRetreatHpPct: 0,
      heroReturnHpPct: 0,
      heroHealPerSec: 0,
      heroCooker: false,
      heroCookerFoodType: null,
      heroCookerState: null,
      heroCookerEatCap: 0,
      heroCookerEatCount: 0,
      heroCookerEatRadius: 0,
      heroCookerMoveSpeed: 0,
      heroCookerCookTtl: 0,
      heroCookerCookMaxTtl: 0,
      heroCookerBubbleCd: 0,
      heroCookerAnimT: 0,
      heroCookerSpin: 0,
      president: false,
      presidentSetup: false,
      presidentPodiumX: null,
      presidentPodiumY: null,
      presidentAuraRadius: 0,
      presidentAuraMult: 1,
      presidentSpeechCd: 0,
      presidentExecutiveOrderUpgraded: false,
      presidentExecutiveOrderCd: 0,
      presidentExecutiveOrderSignTtl: 0,
      presidentExecutiveOrderSignMaxTtl: PRESIDENT_EXECUTIVE_ORDER_SIGN_TTL,
      presidentExecutiveOrderBeamTtl: 0,
      presidentExecutiveOrderBeamMaxTtl: PRESIDENT_EXECUTIVE_ORDER_BEAM_TTL,
      presidentExecutiveOrderBeamToX: null,
      presidentExecutiveOrderBeamToY: null,
      executiveOrderHitsLeft: 0,
      executiveOrderHitsMax: PRESIDENT_EXECUTIVE_ORDER_HITS,
      executiveOrderBreakTtl: 0,
      gunRange: 0,
      gunDragonMul: 1,
      gunFlashTtl: 0,
      gunnerSkyCannonCd: 0,
      gunnerFoodThrowCd: 0,
      gunnerFoodThrowUnlocked: false,
      gunnerSkyCannonSetupTtl: 0,
      gunnerSkyCannonAimX: null,
      gunnerSkyCannonAimY: null,
      gunnerSkyCannonQueue: null,
      dragonSuperBreathCd: 0,
      dragonSuperBreathRiseTtl: 0,
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

  cpuDefaultPull(sideName = 'left') {
    return {
      x: sideName === 'right' ? 0.78 : -0.78,
      y: -0.08,
    };
  }

  cpuSideTotalGold(sideName = 'left') {
    const side = sideName === 'right' ? this.right : this.left;
    const total = Number(side?.goldEarnedTotal);
    if (Number.isFinite(total)) return Math.max(0, total);
    return Math.max(0, Number(side?.gold) || 0);
  }

  cpuRubberbandFactor(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const enemy = side === 'left' ? 'right' : 'left';
    const goldGap = this.cpuSideTotalGold(enemy) - this.cpuSideTotalGold(side);
    return clamp(goldGap / CPU_GOLD_GAP_NORMALIZE, -1, 1);
  }

  cpuAimProfile(sideName = 'left') {
    const rubber = this.cpuRubberbandFactor(sideName);
    const behind = Math.max(0, rubber);
    const ahead = Math.max(0, -rubber);
    const accuracy = clamp(0.7 + behind * 0.2 - ahead * 0.22, 0.42, 0.96);
    const hitNoisePx = 3 + (1 - accuracy) * 26;
    const missNoisePx = 24 + ahead * 92;
    const retargetMin = CPU_RETARGET_MIN_SECONDS * (1 + ahead * 0.8 - behind * 0.34);
    const retargetMax = CPU_RETARGET_MAX_SECONDS * (1 + ahead * 0.9 - behind * 0.28);
    return {
      accuracy,
      hitNoisePx,
      missNoisePx,
      retargetMin: clamp(retargetMin, 0.08, 0.6),
      retargetMax: clamp(Math.max(retargetMin + 0.01, retargetMax), 0.14, 0.9),
      behind,
      ahead,
    };
  }

  cpuUpgradeTarget(sideName = 'left', slot = 0) {
    if (this.committeeVotingRequiredForSide(sideName)) return null;
    const side = sideName === 'right' ? this.right : this.left;
    if ((Number(side?.upgradeCharge) || 0) < (Number(side?.upgradeChargeMax) || 0)) return null;
    const cards = this.upgradeCards.filter((card) => card
      && card.side === sideName
      && !Boolean(card.committeeLocked)
      && !Boolean(card.committeeVoteActive));
    if (!cards.length) return null;
    const preferredSlot = Math.max(0, Math.min(1, Math.floor(Number(slot) || 0)));
    const preferred = cards.find((card) => Math.floor(Number(card?.slot) || 0) === preferredSlot) || cards[0];
    if (!preferred) return null;
    return {
      type: 'upgrade',
      x: Number(preferred.x) || 0,
      y: Number(preferred.y) || 0,
    };
  }

  cpuResourceTarget(sideName = 'left', slot = 0, profile = null) {
    if (!Array.isArray(this.resources) || this.resources.length === 0) return null;
    const side = sideName === 'right' ? 'right' : 'left';
    const sx = side === 'left' ? TOWER_X_LEFT + 35 : TOWER_X_RIGHT - 35;
    const sy = ARCHER_ORIGIN_Y - Math.max(0, Math.floor(Number(slot) || 0)) * ARCHER_VERTICAL_GAP;
    const dir = side === 'left' ? 1 : -1;
    const behindBias = Math.max(0, Number(profile?.behind) || 0);
    let best = null;
    let bestScore = -Infinity;
    for (const res of this.resources) {
      if (!res) continue;
      const rx = Number(res.x) || 0;
      const ry = Number(res.y) || 0;
      const dxForward = (rx - sx) * dir;
      if (dxForward < CPU_MIN_SOLUTION_DX) continue;
      const dist = Math.hypot(rx - sx, ry - sy);
      // Gold/resource is high priority once there is no targetable upgrade card.
      const score = 160 + behindBias * 100 - dist * 0.22 + Math.random() * 8;
      if (score > bestScore) {
        bestScore = score;
        best = { type: 'resource', x: rx, y: ry };
      }
    }
    return best;
  }

  cpuMinionTarget(sideName = 'left', slot = 0, profile = null) {
    if (!Array.isArray(this.minions) || this.minions.length === 0) return null;
    const side = sideName === 'right' ? 'right' : 'left';
    const enemy = side === 'left' ? 'right' : 'left';
    const sx = side === 'left' ? TOWER_X_LEFT + 35 : TOWER_X_RIGHT - 35;
    const sy = ARCHER_ORIGIN_Y - Math.max(0, Math.floor(Number(slot) || 0)) * ARCHER_VERTICAL_GAP;
    const ourTowerX = side === 'left' ? TOWER_X_LEFT : TOWER_X_RIGHT;
    const dir = side === 'left' ? 1 : -1;
    const behindBias = Math.max(0, Number(profile?.behind) || 0);
    let best = null;
    let bestScore = -Infinity;
    for (const m of this.minions) {
      if (!m || m.removed || m.side !== enemy) continue;
      if ((Number(m.hp) || 0) <= 0) continue;
      const mx = Number(m.x) || 0;
      const my = Number(m.y) || 0;
      const dxForward = (mx - sx) * dir;
      if (dxForward < CPU_MIN_CLOSE_SOLUTION_DX) continue;
      const dist = Math.hypot(mx - sx, my - sy);
      const distToOurTower = Math.abs(mx - ourTowerX);
      let threat = 0;
      if (m.hero) threat += 90;
      if (m.stoneGolem) threat += 88;
      if (m.dragon) threat += 70;
      if (m.balloon) threat += 66;
      if (m.super) threat += 42;
      if (m.president || m.monk || m.necrominion) threat += 24;
      const moveDir = m.side === 'left' ? 1 : -1;
      const rawSpeed = Math.max(0, Number(m.speed) || 0);
      const likelyStationary = distToOurTower <= Math.max(26, (Number(m.r) || 16) + 30);
      const vxEstimate = likelyStationary ? 0 : moveDir * rawSpeed * (m.flying ? 0.58 : 0.68);
      const score = threat + behindBias * 22 + (420 - distToOurTower * 0.32) - dist * 0.16 + Math.random() * 7;
      if (score > bestScore) {
        bestScore = score;
        best = {
          type: 'minion',
          id: m.id,
          x: mx,
          y: my,
          vxEstimate,
        };
      }
    }
    return best;
  }

  cpuTargetForSlot(sideName = 'left', slot = 0, profile = null) {
    const upgradeTarget = this.cpuUpgradeTarget(sideName, slot);
    const side = sideName === 'right' ? this.right : this.left;
    const lastSelectionByKeyboard = side?.lastUpgradeSelectionSource === 'keyboard';
    if (upgradeTarget && !lastSelectionByKeyboard) return upgradeTarget;
    const resourceTarget = this.cpuResourceTarget(sideName, slot, profile);
    if (resourceTarget) return resourceTarget;
    const minionTarget = this.cpuMinionTarget(sideName, slot, profile);
    if (minionTarget) return minionTarget;
    if (upgradeTarget) return upgradeTarget;
    const enemyTowerX = sideName === 'left' ? TOWER_X_RIGHT - 48 : TOWER_X_LEFT + 48;
    return { type: 'tower', x: enemyTowerX, y: TOWER_Y - 24 };
  }

  solveCpuPullForTarget(sideName = 'left', slot = 0, targetX = 0, targetY = 0) {
    const side = sideName === 'right' ? 'right' : 'left';
    const dir = side === 'left' ? 1 : -1;
    const sx = side === 'left' ? TOWER_X_LEFT + 35 : TOWER_X_RIGHT - 35;
    const sy = ARCHER_ORIGIN_Y - Math.max(0, Math.floor(Number(slot) || 0)) * ARCHER_VERTICAL_GAP;
    const tx = Number(targetX) || 0;
    const ty = Number(targetY) || 0;
    const dx = (tx - sx) * dir;
    if (dx < CPU_MIN_CLOSE_SOLUTION_DX) return null;
    const closeBias = clamp(
      1 - ((dx - CPU_MIN_CLOSE_SOLUTION_DX) / Math.max(1, CPU_CLOSE_TARGET_DX - CPU_MIN_CLOSE_SOLUTION_DX)),
      0,
      1
    );
    const veryCloseBias = clamp(1 - (dx / 26), 0, 1);
    const minHorizontal = lerp(0.24, 0.006, closeBias);
    const minVertical = lerp(0, 0.24, closeBias);
    const ttlTarget = lerp(1.35, 0.62, closeBias);
    const ttlPenaltyWeight = lerp(3.2, 0.9, closeBias);

    let best = null;
    let bestErr = Infinity;
    const hStep = dx <= CPU_CLOSE_TARGET_DX ? 0.02 : 0.04;
    const vStep = dx <= CPU_CLOSE_TARGET_DX ? 0.02 : 0.04;
    for (let h = minHorizontal; h <= 1.0001; h += hStep) {
      for (let v = minVertical; v <= 0.9601; v += vStep) {
        const mag = Math.hypot(h, v);
        if (mag > 1) continue;
        const angle = Math.atan2(v, h);
        const strength = Math.max(0.05, Math.min(1, mag));
        const speed = (230 + strength * 380) * 1.5;
        const cos = Math.cos(angle);
        if (cos <= 0.001) continue;
        const ttl = dx / (cos * speed);
        if (!(ttl > 0.06 && ttl < CPU_MAX_SOLUTION_TTL)) continue;
        const gravity = 980 - strength * 220;
        const yPred = sy - Math.sin(angle) * speed * ttl + 0.5 * gravity * ttl * ttl;
        const closeLiftPenalty = closeBias > 0
          ? Math.max(0, (CPU_CLOSE_TARGET_PULL_Y - v)) * 40 * closeBias
          : 0;
        const err = Math.abs(yPred - ty) + Math.abs(ttl - ttlTarget) * ttlPenaltyWeight + closeLiftPenalty;
        if (err < bestErr) {
          bestErr = err;
          best = {
            pullX: side === 'left' ? -h : h,
            pullY: -v,
            ttl,
            error: err,
          };
        }
      }
    }

    if (dx <= CPU_CLOSE_TARGET_DX) {
      const fineMinH = clamp(dx / 2000, 0.0005, 0.03);
      const fineMaxH = clamp(dx / 120 + 0.03, 0.04, 0.18);
      const fineMinV = lerp(0.22, 0.6, 1 - veryCloseBias);
      const fineTtlPenaltyWeight = ttlPenaltyWeight * (1 - veryCloseBias * 0.95);
      for (let h = fineMinH; h <= fineMaxH + 0.0001; h += 0.0012) {
        for (let v = fineMinV; v <= 0.995; v += 0.008) {
          const mag = Math.hypot(h, v);
          if (mag > 1) continue;
          const angle = Math.atan2(v, h);
          const strength = Math.max(0.05, Math.min(1, mag));
          const speed = (230 + strength * 380) * 1.5;
          const cos = Math.cos(angle);
          if (cos <= 0.0006) continue;
          const ttl = dx / (cos * speed);
          if (!(ttl > 0.06 && ttl < CPU_MAX_SOLUTION_TTL)) continue;
          const gravity = 980 - strength * 220;
          const yPred = sy - Math.sin(angle) * speed * ttl + 0.5 * gravity * ttl * ttl;
          const closeLiftPenalty = Math.max(0, (CPU_CLOSE_TARGET_PULL_Y - v)) * 56 * closeBias * (1 - veryCloseBias * 0.85);
          const err = Math.abs(yPred - ty) + Math.abs(ttl - ttlTarget) * fineTtlPenaltyWeight + closeLiftPenalty;
          if (err < bestErr) {
            bestErr = err;
            best = {
              pullX: side === 'left' ? -h : h,
              pullY: -v,
              ttl,
              error: err,
            };
          }
        }
      }
    }
    return best;
  }

  updateCpuAiming(dt) {
    if (this.gameOver || !this.started) return;
    const staleKeys = [];
    for (const [key, entry] of this.cpuAimState.entries()) {
      const [sideName, slotText] = String(key).split(':');
      const slot = Math.max(0, Math.floor(Number(slotText) || 0));
      if (!this.cpuSlotActive(sideName, slot)) staleKeys.push(key);
      else if (!entry || typeof entry !== 'object') staleKeys.push(key);
    }
    for (const key of staleKeys) this.cpuAimState.delete(key);

    for (const sideName of ['left', 'right']) {
      for (let slot = 0; slot < this.archersPerSide; slot += 1) {
        if (!this.cpuSlotActive(sideName, slot)) continue;
        const key = `${sideName}:${slot}`;
        let state = this.cpuAimState.get(key);
        if (!state) {
          const base = this.cpuDefaultPull(sideName);
          state = {
            pullX: base.x,
            pullY: base.y,
            retargetAt: 0,
          };
          this.cpuAimState.set(key, state);
        }

        const profile = this.cpuAimProfile(sideName);
        if (this.t >= (Number(state.retargetAt) || 0)) {
          const target = this.cpuTargetForSlot(sideName, slot, profile);
          let aimX = Number(target?.x) || 0;
          let aimY = Number(target?.y) || 0;
          const sideDir = sideName === 'left' ? 1 : -1;
          const sx = sideName === 'left' ? TOWER_X_LEFT + 35 : TOWER_X_RIGHT - 35;
          const targetDx = target?.type === 'minion'
            ? Math.max(0, (aimX - sx) * sideDir)
            : 0;
          const minionCloseBias = target?.type === 'minion'
            ? clamp(
              1 - ((targetDx - CPU_MIN_CLOSE_SOLUTION_DX) / Math.max(1, CPU_CLOSE_TARGET_DX - CPU_MIN_CLOSE_SOLUTION_DX)),
              0,
              1
            )
            : 0;
          const effectiveAccuracy = target?.type === 'minion'
            ? clamp(profile.accuracy + minionCloseBias * CPU_MINION_CLOSE_ACCURACY_BOOST, 0, 0.995)
            : profile.accuracy;
          const miss = Math.random() > effectiveAccuracy;
          if (miss) {
            const missNoiseScale = target?.type === 'minion'
              ? lerp(1, CPU_MINION_CLOSE_MISS_NOISE_SCALE, minionCloseBias)
              : 1;
            const missNoise = profile.missNoisePx * missNoiseScale;
            aimX += sideDir * (12 + Math.random() * 56) * missNoiseScale;
            aimY += (Math.random() * 2 - 1) * missNoise;
          } else {
            const hitNoiseScale = target?.type === 'minion'
              ? lerp(1, CPU_MINION_CLOSE_NOISE_SCALE, minionCloseBias)
              : 1;
            const hitNoise = profile.hitNoisePx * hitNoiseScale;
            aimY += (Math.random() * 2 - 1) * hitNoise;
            aimX += (Math.random() * 2 - 1) * hitNoise * 0.32;
          }

          let solved = this.solveCpuPullForTarget(sideName, slot, aimX, aimY);
          if (solved && target?.type === 'minion' && Number.isFinite(target?.vxEstimate)) {
            const forwardMinX = sx + sideDir * CPU_MIN_CLOSE_SOLUTION_DX;
            const leadScale = lerp(CPU_MINION_LEAD_TIME_SCALE, CPU_MINION_CLOSE_LEAD_TIME_SCALE, minionCloseBias);
            const leadTime = clamp(Number(solved.ttl) * leadScale, 0, CPU_MINION_LEAD_TIME_MAX);
            if (leadTime > 0.02) {
              const predictedRawX = aimX + Number(target.vxEstimate) * leadTime;
              const predictedX = sideName === 'left'
                ? Math.max(forwardMinX, predictedRawX)
                : Math.min(forwardMinX, predictedRawX);
              const leadSolved = this.solveCpuPullForTarget(sideName, slot, predictedX, aimY);
              if (leadSolved) solved = leadSolved;
            }
          }
          if (solved) {
            state.pullX = solved.pullX;
            state.pullY = solved.pullY;
          } else {
            const fallback = this.cpuDefaultPull(sideName);
            const sx = sideName === 'left' ? TOWER_X_LEFT + 35 : TOWER_X_RIGHT - 35;
            const sy = ARCHER_ORIGIN_Y - slot * ARCHER_VERTICAL_GAP;
            const dir = sideName === 'left' ? 1 : -1;
            const dx = (aimX - sx) * dir;
            if (dx > CPU_MIN_CLOSE_SOLUTION_DX && dx < CPU_CLOSE_TARGET_DX) {
              const closeBias = clamp(
                1 - ((dx - CPU_MIN_CLOSE_SOLUTION_DX) / Math.max(1, CPU_CLOSE_TARGET_DX - CPU_MIN_CLOSE_SOLUTION_DX)),
                0,
                1
              );
              const downBias = clamp((aimY - sy) / 180, 0, 1);
              const fallbackHorizontal = lerp(0.16, 0.0025, closeBias);
              const fallbackVertical = lerp(0.95, 0.52, downBias);
              state.pullX = sideName === 'left' ? -fallbackHorizontal : fallbackHorizontal;
              state.pullY = -fallbackVertical;
            } else {
              state.pullX = fallback.x;
              state.pullY = fallback.y;
            }
          }
          const retargetWindow = profile.retargetMax - profile.retargetMin;
          state.retargetAt = this.t + profile.retargetMin + Math.random() * Math.max(0, retargetWindow);
        }

        const control = this.ensureArcherControl(sideName, slot);
        if (!control) continue;
        const follow = Math.min(1, Math.max(0.05, dt) * CPU_PULL_FOLLOW_SPEED);
        const nextX = Number(control.pullX) + (Number(state.pullX) - Number(control.pullX)) * follow;
        const nextY = Number(control.pullY) + (Number(state.pullY) - Number(control.pullY)) * follow;
        const pull = this.normalizePull(sideName, nextX, nextY);
        control.pullX = pull.x;
        control.pullY = pull.y;
        control.archerAimY = ARCHER_ORIGIN_Y - slot * ARCHER_VERTICAL_GAP;
      }
      this.syncSidePrimaryPull(sideName);
    }
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
    const comboOverdriveStacks = this.comboOverdriveStacks(side);
    const comboOverdriveDamageBonus = comboOverdriveStacks * COMBO_OVERDRIVE_DAMAGE_PER_STACK;
    const comboOverdriveAoeBonus = comboOverdriveStacks * COMBO_OVERDRIVE_AOE_DAMAGE_PER_STACK;
    const volleyId = Math.max(1, Math.round(Number(side.pendingArrowVolleyId) || 0));

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
    let ultraBonusShot = false;
    let ultraBonusSpeed = 0;
    let ultraBonusGravity = 0;
    const powerScale = 1 + (side.powerLevel - 1) * 0.18;
    const slotPowerEntry = Array.isArray(side.pendingShotPowerBySlot) && side.pendingShotPowerBySlot[slot]
      ? side.pendingShotPowerBySlot[slot]
      : { power: null, shots: 0 };
    const activePower = slotPowerEntry.shots > 0 ? slotPowerEntry.power : null;

    if (activePower === 'multiShot') {
      count += 2 + Math.floor(powerScale * 2);
      spread = 0.05;
      dmgMul = 1.08 + powerScale * 0.08;
      powerType = 'multiShot';
    } else if (activePower === 'ultraShot') {
      dmgMul = 1.3 + powerScale * 0.3;
      ultraBonusShot = true;
      ultraBonusSpeed = 70 + powerScale * 36;
      ultraBonusGravity = Math.max(620, gravity - 150);
      powerType = 'ultraShot';
    } else if (activePower === 'pierceShot') {
      dmgMul = 1.14 + powerScale * 0.16;
      pierce = 2 + Math.floor(powerScale * 2);
      speed += 50 + powerScale * 25;
      powerType = 'pierceShot';
    } else if (activePower === 'flameShot') {
      dmgMul = 1.32 + powerScale * 0.44;
      radius = 5 + Math.floor(powerScale * 0.45);
      flameSplash = 0.2 + powerScale * 0.07;
      flameBurn = 0.16 + powerScale * 0.06;
      powerType = 'flameShot';
    } else if (activePower === 'flareShot') {
      // Main arrow marks a flare location on hit and calls in a sky cannon impact.
      dmgMul = 1.16 + powerScale * 0.14;
      powerType = 'flareShot';
    }
    count = Math.min(29, count);
    const angleSteps = [0];
    for (let step = 1; angleSteps.length < count; step += 1) {
      // Add upper arc first, then fill the lower matching arc on the next Arrow Count upgrade.
      angleSteps.push(step);
      if (angleSteps.length < count) angleSteps.push(-step);
    }
    if (activePower) {
      slotPowerEntry.shots = Math.max(0, (Number(slotPowerEntry.shots) || 0) - 1);
      if (slotPowerEntry.shots === 0) slotPowerEntry.power = null;
    }

    syncPendingShotPowerState(side);
    const baseArrowDamage = this.statArrowDamage(side) * dmgMul * chargeMul * comboMul + comboOverdriveDamageBonus;

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
        dmg: baseArrowDamage * sideArrowMul,
        ttl: ARROW_FLIGHT_TTL,
        r: isMainArrow ? radius + 1.4 : radius,
        pierce,
        powerType,
        flameSplash,
        flameBurn,
        gravity,
        launchDelay,
        mainArrow: isMainArrow,
        arrowDamageGoldAwarded: 0,
        shotVolleyId: volleyId,
        comboTier: comboMul,
        comboOverdriveStacks,
        comboOverdriveAoeBonus,
        hitAnyUnit: false,
        stuck: false,
        stuckHitUnit: false,
        stuckAngle: null,
        stuckTtl: 0,
        stuckTtlMax: 0,
        archerSlot: slot,
      });
    }

    if (ultraBonusShot) {
      const ultraSpeed = speed + ultraBonusSpeed;
      const ultraVx = Math.cos(launch.angle) * ultraSpeed * forwardSign;
      const ultraVy = -Math.sin(launch.angle) * ultraSpeed;
      this.arrows.push({
        id: this.seq++,
        side: sideName,
        x: sx,
        y: sy,
        vx: ultraVx,
        vy: ultraVy,
        dmg: baseArrowDamage,
        ttl: ARROW_FLIGHT_TTL,
        r: radius + 1.8,
        pierce,
        powerType: 'ultraShot',
        flameSplash,
        flameBurn,
        gravity: ultraBonusGravity,
        launchDelay: 0.02,
        mainArrow: false,
        arrowDamageGoldAwarded: 0,
        shotVolleyId: volleyId,
        comboTier: comboMul,
        comboOverdriveStacks,
        comboOverdriveAoeBonus,
        hitAnyUnit: false,
        stuck: false,
        stuckHitUnit: false,
        stuckAngle: null,
        stuckTtl: 0,
        stuckTtlMax: 0,
        archerSlot: slot,
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
    const baseHp = this.statMinionHp(side);
    let hp = baseHp;
    const baseHpFromUnitHpUpgrade = this.unitHpUpgradeContribution(side);
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
    const stoneGolemEvery = this.statStoneGolemEvery(side);
    const heroEvery = this.statHeroEvery(side);
    const presidentEvery = this.statPresidentEvery(side);
    const balloonEvery = this.statBalloonEvery(side);
    const superEvery = this.statSuperEvery(side);
    const everyByType = {
      dragon: dragonEvery,
      shield: shieldEvery,
      digger: diggerEvery,
      necrominion: necroEvery,
      gunner: gunnerEvery,
      rider: riderEvery,
      monk: monkEvery,
      stonegolem: stoneGolemEvery,
      hero: heroEvery,
      president: presidentEvery,
      balloon: balloonEvery,
      super: superEvery,
    };

    if (naturalSpawn) {
      this.stepCandleSpawnCycle(sideName);
      this.queueDueSpecialSpawnsForNaturalSpawn(sideName, everyByType);
    }

    const queuedType = naturalSpawn && side.pendingSpecialSpawns.length
      ? side.pendingSpecialSpawns.shift()
      : null;
    let failedSpecialType = null;
    let spawnType = forceType;
    if (!spawnType && queuedType) {
      const supportAliveCount = SUPPORT_SPECIAL_TYPE_SET.has(queuedType)
        ? this.supportSpecialAliveCount(sideName, queuedType)
        : 0;
      const displayChance = this.statSpecialSuccessChance(side, queuedType, {
        sideName,
        includeSupportDebuff: false,
      });
      const chance = this.statSpecialSuccessChance(side, queuedType, {
        sideName,
        supportAliveCount,
      });
      const roll = Math.random();
      const success = roll <= chance;
      const debuffLoss = Math.max(0, displayChance - chance);
      const debuffCausedFail = !success
        && debuffLoss > 0
        && roll <= displayChance
        && roll > chance;
      side.specialRollType = queuedType;
      side.specialRollSuccess = success;
      side.specialRollDisplayChance = displayChance;
      side.specialRollChance = chance;
      side.specialRollDebuffLoss = debuffLoss;
      side.specialRollDebuffCausedFail = debuffCausedFail;
      side.specialRollValue = roll;
      side.specialRollTtl = SPECIAL_ROLL_TTL;
      side.specialRollByType[queuedType] = {
        success,
        chance,
        displayChance,
        debuffLoss,
        debuffCausedFail,
        roll,
      };
      this.recordSpecialRoll(sideName, queuedType, success, chance, roll, {
        displayChance,
        debuffLoss,
        debuffCausedFail,
      });
      if (success) {
        spawnType = queuedType;
        side.specialFailType = null;
        side.specialFailTtl = 0;
      } else {
        failedSpecialType = queuedType;
        side.specialFailType = queuedType;
        side.specialFailTtl = SPECIAL_FAIL_TTL;
        if (debuffCausedFail) {
          const failedEvery = Number(everyByType[queuedType]);
          this.redistributeSupportDebuffFailure(sideName, queuedType, failedEvery, everyByType);
        }
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
    const isBalloon = spawnType === 'balloon';
    const isSuper = spawnType === 'super';
    const repeatScaling = this.specialRepeatScalingForSpawnType(side, spawnType);
    const balloonSpawnLevel = isBalloon ? Math.max(1, Number(side.balloonLevel) || 1) : 0;
    const explosive = false;
    let radius = 16;
    let visualPower = power;
    let spawnY = TOWER_Y + (Math.random() * 110 - 55);
    if (failedSpecialType) {
      hp *= 1.1;
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
      const gunScale = 1 + (side.powerLevel - 1) * 0.08;
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

    if (isBalloon) {
      const balloonTech = balloonSpawnLevel;
      hp *= (1.72 + balloonTech * 0.34) * 2;
      dmg *= 0.62 + Math.min(0.28, balloonTech * 0.08);
      speed *= 0.76;
      radius = Math.max(32, radius * 2);
      tier = Math.min(3, tier + 1);
      visualPower += 10 + balloonTech * 2;
      spawnY = 58 + (Math.random() * 46);
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

    if (repeatScaling.repeatLevels > 0) {
      hp *= repeatScaling.hpMult;
      dmg *= repeatScaling.dmgMult;
      visualPower += repeatScaling.repeatLevels * 2;
    }

    const hpUpgradeRatio = clamp(baseHpFromUnitHpUpgrade / Math.max(1, baseHp), 0, 1);
    const hpFromUnitHpUpgrade = clamp(hp * hpUpgradeRatio, 0, hp);
    hp = this.totalFeedingAdjustedHp(hp, hpFromUnitHpUpgrade);
    dmg *= this.totalFeedingMinionDamageMultiplier();
    speed *= this.totalFeedingMinionSpeedMultiplier();

    const created = {
      id: this.seq++,
      side: sideName,
      x,
      y: spawnY,
      hp,
      maxHp: hp,
      hpFromUnitHpUpgrade: Math.max(0, Math.min(hp, hpFromUnitHpUpgrade)),
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
      balloon: isBalloon,
      flying: isDragon || isBalloon,
      flyBaseY: (isDragon || isBalloon) ? spawnY : null,
      flyPhase: (isDragon || isBalloon) ? Math.random() * Math.PI * 2 : null,
      balloonHealthDropVisual: isBalloon ? 0 : null,
      balloonLevel: balloonSpawnLevel,
      balloonThrowTtl: 0,
      balloonThrowMaxTtl: 0.6,
      balloonThrowToX: null,
      balloonThrowToY: null,
      balloonBombCd: isBalloon ? this.balloonBombCooldown({ balloonLevel: balloonSpawnLevel }) : 0,
      balloonBombTtl: 0,
      balloonBombMaxTtl: 0.52,
      balloonBombFromX: null,
      balloonBombFromY: null,
      balloonBombToX: null,
      balloonBombToY: null,
      balloonBombImpactPending: false,
      balloonBombBlastRadius: 0,
      balloonBombDamage: 0,
      balloonBombTowerDamageMult: BALLOON_BOMB_TOWER_DAMAGE_MULT,
      balloonBombEnemySideName: sideName === 'left' ? 'right' : 'left',
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunner: isGunner,
      rider: isRider,
      riderChargeReady: isRider,
      riderChargeMoveTicks: isRider ? RIDER_CHARGE_REARM_MOVE_TICKS : 0,
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
      shieldPushScale: isShieldBearer ? (SHIELD_PUSH_SCALE * repeatScaling.shieldPushMult) : 1,
      shieldGuardPose: isShieldBearer ? 0 : 0,
      shieldGuardTarget: isShieldBearer ? 0 : 0,
      shieldBaseY: isShieldBearer ? spawnY : null,
      shieldBobPhase: isShieldBearer ? Math.random() * Math.PI * 2 : null,
      shieldDarkMetalCd: isShieldBearer ? (SHIELD_DARK_METAL_INTERVAL + Math.random() * SHIELD_DARK_METAL_COOLDOWN_JITTER) : 0,
      shieldDarkMetalTtl: 0,
      stoneGolem: isStoneGolem,
      golemSmashTtl: 0,
      golemShieldHp: isStoneGolem ? hp : 0,
      golemShieldMax: isStoneGolem ? hp : 0,
      golemShieldTtl: isStoneGolem ? STONE_GOLEM_SHIELD_TTL : 0,
      golemBiteCd: isStoneGolem ? (1.1 + Math.random() * 1.2) : 0,
      golemFirstFlingUsed: false,
      golemBiteTargetId: 0,
      golemBiteHeldTargetId: 0,
      golemBiteChewTickTtl: 0,
      golemBiteJumpTtl: 0,
      golemBiteJumpMaxTtl: STONE_GOLEM_BITE_JUMP_TTL,
      golemBiteLandTtl: 0,
      golemBiteLandMaxTtl: STONE_GOLEM_BITE_LAND_TTL,
      golemBiteStartX: null,
      golemBiteStartY: isStoneGolem ? spawnY : null,
      golemBiteJumpLift: 0,
      golemBiteAnimT: Math.random() * Math.PI * 2,
      golemBiteLockTtl: 0,
      necroShieldHp: isNecrominion ? hp : 0,
      necroShieldMax: isNecrominion ? hp : 0,
      necroShieldTtl: isNecrominion ? NECRO_SELF_SHIELD_FADE_SECONDS : 0,
      necroShieldMaxTtl: NECRO_SELF_SHIELD_FADE_SECONDS,
      reviveShieldHp: 0,
      reviveShieldMax: 0,
      reviveShieldTtl: 0,
      reviveShieldMaxTtl: NECRO_REVIVE_SHIELD_SECONDS,
      hitFlashTtl: 0,
      balloonHitCircleIndex: -1,
      balloonHitCircleTtl: 0,
      digPhase: isDigger ? Math.random() * Math.PI * 2 : null,
      digBaseY: isDigger ? spawnY : null,
      monk: isMonk,
      monkAge: 0,
      monkHealBase: isMonk ? (Math.max(34, hp * 0.46) * repeatScaling.monkHealMult) : 0,
      monkHealRange: isMonk ? ((172 + side.powerLevel * 5 + side.unitHpLevel * 4) * repeatScaling.monkRangeMult) : 0,
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
      heroBaseDmg: isHero ? dmg : 0,
      heroArrowHits: 0,
      heroSlashRadius: isHero ? (84 + side.unitLevel * 2.4) : 0,
      heroLimbSwingDamageMult: isHero ? 0.96 : 0,
      heroLineCd: 0,
      heroSwing: 0,
      heroSwingDir: 1,
      heroSwingAttackT: 0,
      heroAbilityGapCd: 0,
      heroFoodRainCd: isHero ? this.heroAbilityCooldownForSide(side, HERO_FOOD_RAIN_MIN_CD, HERO_FOOD_RAIN_MAX_CD) : 0,
      heroGroundRumbleCd: isHero ? this.heroAbilityCooldownForSide(side, HERO_GROUND_RUMBLE_MIN_CD, HERO_GROUND_RUMBLE_MAX_CD) : 0,
      heroCookerCd: isHero ? this.heroAbilityCooldownForSide(side, HERO_COOKER_MIN_CD, HERO_COOKER_MAX_CD) : 0,
      heroCookerGuaranteedSpawned: false,
      heroRainDropCount: isHero ? HERO_FOOD_RAIN_MIN_DROPS : 0,
      heroRainRadius: isHero ? HERO_FOOD_RAIN_RADIUS : 0,
      heroRainDamageMult: isHero ? HERO_FOOD_RAIN_DAMAGE_MULT : 0,
      heroRumbleBursts: isHero ? HERO_GROUND_RUMBLE_MIN_BURSTS : 0,
      heroRumbleRadius: isHero ? HERO_GROUND_RUMBLE_RADIUS : 0,
      heroRumbleDamageMult: isHero ? HERO_GROUND_RUMBLE_DAMAGE_MULT : 0,
      heroRumbleKnockback: isHero ? HERO_GROUND_RUMBLE_KNOCKBACK : 0,
      heroRetreating: false,
      heroRetreatHpPct: isHero ? 0.3 : 0,
      heroReturnHpPct: isHero ? 0.92 : 0,
      heroHealPerSec: isHero ? Math.max(96, hp * 0.34) : 0,
      heroCooker: false,
      heroCookerFoodType: null,
      heroCookerState: null,
      heroCookerEatCap: 0,
      heroCookerEatCount: 0,
      heroCookerEatRadius: 0,
      heroCookerMoveSpeed: 0,
      heroCookerCookTtl: 0,
      heroCookerCookMaxTtl: 0,
      heroCookerBubbleCd: 0,
      heroCookerAnimT: 0,
      heroCookerSpin: 0,
      president: isPresident,
      presidentSetup: false,
      presidentPodiumX: isPresident ? presidentPodiumTargetX(sideName) : null,
      presidentPodiumY: isPresident ? (TOWER_Y + 18 + (Math.random() * 24 - 12)) : null,
      presidentAuraRadius: isPresident ? (178 + side.powerLevel * 8) : 0,
      presidentAuraMult: isPresident ? ((1.22 + Math.min(0.14, side.powerLevel * 0.02)) * repeatScaling.presidentAuraMult) : 1,
      presidentSpeechCd: isPresident ? (1 + Math.random() * 1.4) : 0,
      presidentExecutiveOrderUpgraded: isPresident && (Number(side.presidentExecutiveOrderLevel) || 0) > 0,
      presidentExecutiveOrderCd: isPresident ? presidentExecutiveOrderCooldown() : 0,
      presidentExecutiveOrderSignTtl: 0,
      presidentExecutiveOrderSignMaxTtl: PRESIDENT_EXECUTIVE_ORDER_SIGN_TTL,
      presidentExecutiveOrderBeamTtl: 0,
      presidentExecutiveOrderBeamMaxTtl: PRESIDENT_EXECUTIVE_ORDER_BEAM_TTL,
      presidentExecutiveOrderBeamToX: null,
      presidentExecutiveOrderBeamToY: null,
      executiveOrderHitsLeft: 0,
      executiveOrderHitsMax: PRESIDENT_EXECUTIVE_ORDER_HITS,
      executiveOrderBreakTtl: 0,
      gunRange: isGunner ? 198 + side.powerLevel * 10 + side.unitLevel * 6 : 0,
      gunDragonMul: isGunner ? (1.95 + side.powerLevel * 0.05) : 1,
      gunFlashTtl: 0,
      gunnerSkyCannonCd: isGunner ? (GUNNER_SKY_CANNON_INTERVAL + Math.random() * GUNNER_SKY_CANNON_COOLDOWN_JITTER) : 0,
      gunnerFoodThrowCd: isGunner && (Number(side.gunnerSkyCannonLevel) || 0) >= GUNNER_FOOD_THROW_UNLOCK_LEVEL
        ? (0.38 + Math.random() * 0.32)
        : 0,
      gunnerFoodThrowUnlocked: isGunner && (Number(side.gunnerSkyCannonLevel) || 0) >= GUNNER_FOOD_THROW_UNLOCK_LEVEL,
      gunnerSkyCannonSetupTtl: 0,
      gunnerSkyCannonAimX: null,
      gunnerSkyCannonAimY: null,
      gunnerSkyCannonQueue: null,
      dragonSuperBreathCd: isDragon ? (DRAGON_SUPER_BREATH_INTERVAL + Math.random() * DRAGON_SUPER_BREATH_COOLDOWN_JITTER) : 0,
      dragonSuperBreathRiseTtl: 0,
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
      totalFeedingBasicUnit: !(
        isSuper
        || isNecrominion
        || isDragon
        || isBalloon
        || isGunner
        || isRider
        || isDigger
        || isShieldBearer
        || isMonk
        || isStoneGolem
        || isHero
        || isPresident
      ),
      totalFeedingGrainPicked: false,
      totalFeedingGrainThrown: false,
      totalFeedingGrainFoodType: sideName === 'right' ? 'rice' : 'bread',
      totalFeedingGrainJumpTtl: 0,
      totalFeedingGrainJumpMaxTtl: TOTAL_FEEDING_GRAIN_JUMP_TTL,
      totalFeedingGrainJumpFromX: null,
      totalFeedingGrainJumpFromY: null,
      totalFeedingGrainJumpToX: null,
      totalFeedingGrainJumpToY: null,
      totalFeedingGrainJumpArc: 0,
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
    const base = MINION_KILL_GOLD_BASE * scalar;
    const level = Math.max(1, Number(side?.resourceLevel) || 1);
    const bonus = 1 + (level - 1) * ECONOMY_COMBAT_GOLD_BONUS_PER_LEVEL;
    return Math.floor(base * bonus);
  }

  goldFromResource(_side, value) {
    return Math.max(RESOURCE_VALUE_MIN, Math.floor(Number(value) || 0));
  }

  grantGold(sideName, amount, countAsEarned = true) {
    const side = sideName === 'right' ? this.right : this.left;
    if (!side) return 0;
    const gainBase = Math.max(0, Number(amount) || 0);
    const gain = gainBase * this.totalFeedingGoldMultiplier();
    if (gain <= 0) return 0;
    side.gold += gain;
    if (countAsEarned) side.goldEarnedTotal = Math.max(0, (Number(side.goldEarnedTotal) || 0) + gain);
    return gain;
  }

  recordResourceGoldCollected(sideName, amount, source = 'arrow', sourceRef = null) {
    const side = sideName === 'right' ? this.right : this.left;
    const totals = this.matchReport?.totals?.[sideName === 'right' ? 'right' : 'left'];
    const gain = Math.max(0, Number(amount) || 0);
    if (!side || gain <= 0) return;
    if (source === 'digger') {
      side.diggerResourceGoldCollected = Math.max(0, (Number(side.diggerResourceGoldCollected) || 0) + gain);
      if (totals) totals.diggerResourceGoldCollected = Math.max(0, (Number(totals.diggerResourceGoldCollected) || 0) + gain);
    } else {
      side.arrowResourceGoldCollected = Math.max(0, (Number(side.arrowResourceGoldCollected) || 0) + gain);
      if (totals) totals.arrowResourceGoldCollected = Math.max(0, (Number(totals.arrowResourceGoldCollected) || 0) + gain);
      this.recordArrowShotGold(sideName, gain, sourceRef);
    }
    this.postGameReportCache = null;
  }

  recordMinionDamageGoldCollected(sideName, amount) {
    const normalized = sideName === 'right' ? 'right' : (sideName === 'left' ? 'left' : null);
    if (!normalized) return;
    const side = normalized === 'right' ? this.right : this.left;
    const totals = this.matchReport?.totals?.[normalized];
    const gain = Math.max(0, Number(amount) || 0);
    if (!side || gain <= 0) return;
    side.minionDamageGoldCollected = Math.max(0, (Number(side.minionDamageGoldCollected) || 0) + gain);
    if (totals) {
      totals.minionDamageGoldCollected = Math.max(0, (Number(totals.minionDamageGoldCollected) || 0) + gain);
    }
    this.postGameReportCache = null;
  }

  beginArrowVolley(sideName) {
    const normalized = sideName === 'right' ? 'right' : (sideName === 'left' ? 'left' : null);
    if (!normalized) return 0;
    const side = normalized === 'right' ? this.right : this.left;
    if (!side) return 0;
    const seq = Math.max(0, Math.round(Number(side.arrowShotVolleySeq) || 0)) + 1;
    side.arrowShotVolleySeq = seq;
    side.pendingArrowVolleyId = seq;
    return seq;
  }

  activateArrowShotGoldTracker(arrow = null) {
    if (!arrow || typeof arrow !== 'object') return 0;
    const sideName = arrow.side === 'right' ? 'right' : (arrow.side === 'left' ? 'left' : null);
    if (!sideName) return 0;
    const side = sideName === 'right' ? this.right : this.left;
    if (!side) return 0;
    const volleyId = Math.max(
      1,
      Math.round(
        Number.isFinite(arrow.shotVolleyId)
          ? Number(arrow.shotVolleyId)
          : (Number(side.pendingArrowVolleyId) || 0)
      )
    );
    const activeId = Math.max(0, Math.round(Number(side.arrowShotGoldActiveVolleyId) || 0));
    if (activeId !== volleyId) {
      side.arrowShotGoldActiveVolleyId = volleyId;
      side.arrowShotGoldCurrent = 0;
    }
    return volleyId;
  }

  recordArrowShotGold(sideName, amount, sourceRef = null) {
    const normalized = sideName === 'right' ? 'right' : (sideName === 'left' ? 'left' : null);
    if (!normalized) return;
    const side = normalized === 'right' ? this.right : this.left;
    const gain = Math.max(0, Number(amount) || 0);
    if (!side || gain <= 0) return;
    if (sourceRef && typeof sourceRef === 'object') this.activateArrowShotGoldTracker(sourceRef);
    side.arrowShotGoldCurrent = Math.max(0, (Number(side.arrowShotGoldCurrent) || 0) + gain);
  }

  addUpgradeCharge(side, amount) {
    side.upgradeCharge = Math.min(99999, side.upgradeCharge + amount);
  }

  upgradeCost(side, type) {
    const rule = UPGRADE_COST_RULES[type] || { base: 140, growth: 18, start: 1 };
    const level = Math.max(0, Number(side?.[type]) || 0);
    const tier = Math.max(0, level - rule.start);
    const scaled = Math.round((rule.base + tier * rule.growth) * UPGRADE_DEBT_MULT);
    const minDebt = Math.max(1, Math.round(60 * UPGRADE_DEBT_MULT));
    return Math.max(minDebt, scaled);
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

  countSpecialMinionUpgrades(side) {
    const s = side || {};
    const types = [
      'dragonLevel',
      'dragonSuperBreathLevel',
      'stoneGolemAncientCoreLevel',
      'heroDestinedChampionLevel',
      'shieldDarkMetalLevel',
      'monkHealCircleLevel',
      'necroExpertSummonerLevel',
      'riderSuperHorseLevel',
      'diggerGoldFinderLevel',
      'gunnerSkyCannonLevel',
      'presidentExecutiveOrderLevel',
      'superMinionLevel',
    ];
    let count = 0;
    for (const type of types) {
      if ((Number(s?.[type]) || 0) > 0) count += 1;
    }
    return count;
  }

  countUnlockedRepeatSpecialUnits(side) {
    let count = 0;
    for (const rule of Object.values(SPECIAL_UNIT_UPGRADE_RULES)) {
      if (!rule?.hasInitialUnlock || !rule?.repeatEligible || !rule?.upgradeType) continue;
      if ((Number(side?.[rule.upgradeType]) || 0) > 0) count += 1;
    }
    return count;
  }

  isUpgradeUnlocked(side, type) {
    if (type === 'balloonLevel') {
      const specialCount = this.countSpecialMinionUpgrades(side);
      const balloonLevel = Math.max(0, Number(side?.balloonLevel) || 0);
      if (balloonLevel <= 0) return specialCount >= 1;
      return specialCount >= 3;
    }
    if (type === 'dragonSuperBreathLevel') return (Number(side?.dragonLevel) || 0) > 0;
    if (type === 'stoneGolemAncientCoreLevel') {
      return (Number(side?.stoneGolemAncientCoreLevel) || 0) > 0 || this.stoneGolemSpawnUnlocked(side);
    }
    if (type === 'heroDestinedChampionLevel') {
      return (Number(side?.heroDestinedChampionLevel) || 0) > 0 || Boolean(side?.towerDamagedOnce);
    }
    return true;
  }

  isRepeatSpecialUpgradeType(type) {
    return SPECIAL_BUCKET_UPGRADE_TYPES.includes(type);
  }

  isRegularUpgradeCardEligible(side, type) {
    if (!this.isUpgradeUnlocked(side, type)) return false;
    if (this.isRepeatSpecialUpgradeType(type)) return false;
    if (this.isUpgradeCapped(side, type)) return false;
    return true;
  }

  isRepeatSpecialBucketUnlocked(side) {
    return this.countUnlockedRepeatSpecialUnits(side) >= Math.max(1, Number(REPEAT_SPECIAL_UPGRADE_CONFIG.minUnlockedUnits) || 1);
  }

  repeatSpecialEligibleRules(side, excludedTypes = new Set()) {
    if (!this.isRepeatSpecialBucketUnlocked(side)) return [];
    return Object.values(SPECIAL_UNIT_UPGRADE_RULES).filter((rule) => (
      rule?.repeatEligible
      && rule?.hasInitialUnlock
      && typeof rule?.upgradeType === 'string'
      && !excludedTypes.has(rule.upgradeType)
      && (Number(side?.[rule.upgradeType]) || 0) > 0
      && !this.isUpgradeCapped(side, rule.upgradeType)
    ));
  }

  specialBucketEligibleRules(side, excludedTypes = new Set()) {
    const repeatUnlocked = this.isRepeatSpecialBucketUnlocked(side);
    return Object.values(SPECIAL_UNIT_UPGRADE_RULES).filter((rule) => {
      if (!rule?.hasInitialUnlock) return false;
      if (typeof rule?.upgradeType !== 'string' || !rule.upgradeType) return false;
      if (excludedTypes.has(rule.upgradeType)) return false;
      if (!this.isUpgradeUnlocked(side, rule.upgradeType)) return false;
      if (this.isUpgradeCapped(side, rule.upgradeType)) return false;
      const level = Number(side?.[rule.upgradeType]) || 0;
      if (level <= 0) return true;
      if (!rule.repeatEligible) return false;
      if (FIXED_RARE_SPECIAL_UPGRADE_CARD_TYPES.includes(rule.upgradeType)) return true;
      return repeatUnlocked;
    });
  }

  repeatSpecialExpectedSpawnSeconds(side, rule) {
    if (!side || !rule?.specialType) return Infinity;
    const spawnEvery = Math.max(0.0001, this.statSpawnEvery(side));
    switch (rule.specialType) {
      case 'necrominion':
        return spawnEvery * this.statNecroEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'necrominion'));
      case 'gunner':
        return spawnEvery * this.statGunnerEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'gunner'));
      case 'rider':
        return spawnEvery * this.statRiderEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'rider'));
      case 'digger':
        return spawnEvery * this.statDiggerEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'digger'));
      case 'monk':
        return spawnEvery * this.statMonkEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'monk'));
      case 'stonegolem':
        if (!this.stoneGolemSpawnUnlocked(side)) return Infinity;
        return spawnEvery * this.statStoneGolemEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'stonegolem'));
      case 'shield':
        return spawnEvery * this.statShieldEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'shield'));
      case 'hero':
        if (!side?.towerDamagedOnce) return Infinity;
        return spawnEvery * this.statHeroEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'hero'));
      case 'president':
        return spawnEvery * this.statPresidentEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'president'));
      case 'balloon':
        return spawnEvery * this.statBalloonEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'balloon'));
      case 'dragon':
        return spawnEvery * this.statDragonEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'dragon'));
      case 'super':
        return spawnEvery * this.statSuperEvery(side) / Math.max(0.0001, this.statSpecialSuccessChance(side, 'super'));
      case 'candle':
        return spawnEvery * this.statCandleEvery(side) / Math.max(0.0001, this.statCandleSpawnChance(side));
      default:
        return Infinity;
    }
  }

  repeatSpecialDynamicFactor(side, rule, eligibleRules = []) {
    const expected = this.repeatSpecialExpectedSpawnSeconds(side, rule);
    if (!Number.isFinite(expected) || expected <= 0) return 1;
    const expectedList = eligibleRules
      .map((entry) => this.repeatSpecialExpectedSpawnSeconds(side, entry))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b);
    if (!expectedList.length) return 1;
    const median = expectedList[Math.floor(expectedList.length / 2)] || expected;
    if (!(median > 0)) return 1;
    const ratio = median / expected;
    const exponent = Math.max(0, Number(REPEAT_SPECIAL_UPGRADE_CONFIG.dynamicWeightExponent) || 0);
    const scaled = exponent > 0 ? Math.pow(Math.max(0.0001, ratio), exponent) : 1;
    return clamp(
      scaled,
      Number(REPEAT_SPECIAL_UPGRADE_CONFIG.dynamicWeightMin) || 0.82,
      Number(REPEAT_SPECIAL_UPGRADE_CONFIG.dynamicWeightMax) || 1.18
    );
  }

  repeatSpecialLeaderPenalty(side, rule, eligibleRules = []) {
    const levels = eligibleRules
      .map((entry) => Math.max(0, Number(side?.[entry.upgradeType]) || 0))
      .filter((value) => Number.isFinite(value));
    if (!levels.length) return 1;
    const minLevel = Math.min(...levels);
    const currentLevel = Math.max(0, Number(side?.[rule.upgradeType]) || 0);
    const ahead = Math.max(0, currentLevel - minLevel);
    const penaltyPerLevel = Math.max(0, Number(REPEAT_SPECIAL_UPGRADE_CONFIG.leaderPenaltyPerLevelAhead) || 0);
    return Math.max(
      Number(REPEAT_SPECIAL_UPGRADE_CONFIG.leaderPenaltyFloor) || 0.85,
      1 - ahead * penaltyPerLevel
    );
  }

  specialRepeatScalingForSpawnType(side, spawnType) {
    const rule = SPECIAL_UNIT_UPGRADE_RULES_BY_SPECIAL_TYPE[spawnType] || null;
    if (!rule?.upgradeType) {
      return {
        repeatLevels: 0,
        hpMult: 1,
        dmgMult: 1,
        monkHealMult: 1,
        monkRangeMult: 1,
        shieldPushMult: 1,
        presidentAuraMult: 1,
      };
    }
    const repeatLevels = Math.max(0, (Number(side?.[rule.upgradeType]) || 0) - 1);
    const scaling = rule.repeatScaling || {};
    return {
      repeatLevels,
      hpMult: Math.pow(Number(scaling.hpMultPerLevel) || 1, repeatLevels),
      dmgMult: Math.pow(Number(scaling.dmgMultPerLevel) || 1, repeatLevels),
      monkHealMult: Math.pow(Number(scaling.monkHealMultPerLevel) || 1, repeatLevels),
      monkRangeMult: Math.pow(Number(scaling.monkRangeMultPerLevel) || 1, repeatLevels),
      shieldPushMult: Math.pow(Number(scaling.shieldPushMultPerLevel) || 1, repeatLevels),
      presidentAuraMult: Math.pow(Number(scaling.presidentAuraMultPerLevel) || 1, repeatLevels),
    };
  }

  fixedRareSpecialUpgradeCardChance(side, type) {
    if (!FIXED_RARE_SPECIAL_UPGRADE_CARD_TYPES.includes(type)) return null;
    const level = Math.max(0, Number(side?.[type]) || 0);
    return level > 0
      ? RARE_SPECIAL_UPGRADE_CARD_CHANCE_UNLOCKED
      : RARE_SPECIAL_UPGRADE_CARD_CHANCE_LOCKED;
  }

  applyFixedRareSpecialUpgradeCardChances(side, candidates = []) {
    if (!Array.isArray(candidates) || !candidates.length) return;
    const targets = [];
    for (const candidate of candidates) {
      if (!candidate || typeof candidate.type !== 'string') continue;
      const p = this.fixedRareSpecialUpgradeCardChance(side, candidate.type);
      if (!(Number.isFinite(p) && p > 0)) continue;
      targets.push({ candidate, p });
    }
    if (!targets.length) return;
    const targetP = targets.reduce((sum, entry) => sum + entry.p, 0);
    if (!(targetP > 0 && targetP < 0.9)) return;
    let otherWeight = 0;
    for (const candidate of candidates) {
      if (!candidate) continue;
      const p = this.fixedRareSpecialUpgradeCardChance(side, candidate.type);
      if (Number.isFinite(p) && p > 0) continue;
      otherWeight += Math.max(0, Number(candidate.weight) || 0);
    }
    if (!(otherWeight > 0)) return;
    const denom = Math.max(0.0001, 1 - targetP);
    for (const entry of targets) {
      entry.candidate.weight = Math.max(0.0001, otherWeight * (entry.p / denom));
    }
  }

  buildUpgradeCardCandidates(side, excludedTypes = new Set(), options = null) {
    const candidates = [];
    const regularWeight = Math.max(0, Number(REPEAT_SPECIAL_UPGRADE_CONFIG.regularUpgradeWeight) || 0);
    const specialBucketWeightMultiplier = Math.max(0, Number(options?.specialBucketWeightMultiplier) || 1);
    for (const type of UPGRADE_TYPES) {
      if (this.isRepeatSpecialUpgradeType(type)) continue;
      if (excludedTypes.has(type)) continue;
      if (!this.isRegularUpgradeCardEligible(side, type)) continue;
      candidates.push({
        type,
        source: 'random',
        path: this.upgradePathForType(type),
        weight: regularWeight * (type === 'resourceLevel' ? ECONOMY_UPGRADE_CARD_WEIGHT_MULT : 1),
      });
    }

    const repeatRules = this.repeatSpecialEligibleRules(side, excludedTypes);
    const specialRules = this.specialBucketEligibleRules(side, excludedTypes);
    if (specialRules.length) {
      const bucketWeight = Math.max(0, Number(REPEAT_SPECIAL_UPGRADE_CONFIG.bucketWeight) || 0) * specialBucketWeightMultiplier;
      const weightedRules = specialRules.map((rule) => {
        const base = Math.max(0.05, Number(rule.baseOfferWeight) || 1);
        const level = Number(side?.[rule.upgradeType]) || 0;
        const dynamic = level > 0 ? this.repeatSpecialDynamicFactor(side, rule, repeatRules) : 1;
        const leaderPenalty = level > 0 ? this.repeatSpecialLeaderPenalty(side, rule, repeatRules) : 1;
        return {
          rule,
          rawWeight: Math.max(0.0001, base * dynamic * leaderPenalty),
        };
      });
      const rawTotal = weightedRules.reduce((sum, entry) => sum + entry.rawWeight, 0);
      if (rawTotal > 0 && bucketWeight > 0) {
        for (const entry of weightedRules) {
          candidates.push({
            type: entry.rule.upgradeType,
            source: 'repeatSpecial',
            path: 'special',
            weight: bucketWeight * (entry.rawWeight / rawTotal),
          });
        }
      }
    }

    this.applyFixedRareSpecialUpgradeCardChances(side, candidates);
    return candidates;
  }

  resourceSpawnIntervalRangeAtTime(time = this.t) {
    const t = Math.max(0, Number(time) || 0);
    const rampT = clamp(t / Math.max(0.0001, RESOURCE_SPAWN_RANGE_RAMP_SECONDS), 0, 1);
    const minWait = RESOURCE_SPAWN_START_MIN_SECONDS
      + (RESOURCE_SPAWN_END_MIN_SECONDS - RESOURCE_SPAWN_START_MIN_SECONDS) * rampT;
    const maxWait = RESOURCE_SPAWN_START_MAX_SECONDS
      + (RESOURCE_SPAWN_END_MAX_SECONDS - RESOURCE_SPAWN_START_MAX_SECONDS) * rampT;
    return {
      minWait: Math.max(0.2, minWait),
      maxWait: Math.max(minWait, maxWait),
      rampT,
    };
  }

  resourceBaseValueForInterval(waitSeconds = RESOURCE_SPAWN_START_MIN_SECONDS) {
    const wait = Math.max(0.05, Number(waitSeconds) || RESOURCE_SPAWN_START_MIN_SECONDS);
    const ref = Math.max(0.05, RESOURCE_VALUE_REFERENCE_WAIT_SECONDS);
    return Math.max(RESOURCE_VALUE_MIN, Math.round(RESOURCE_VALUE_BASE * (wait / ref)));
  }

  resourceValueForSide(sideName, waitSeconds = RESOURCE_SPAWN_START_MIN_SECONDS) {
    const side = sideName === 'right' ? this.right : this.left;
    const baseValue = this.resourceBaseValueForInterval(waitSeconds);
    const bonus = 1 + (Math.max(1, Number(side?.resourceLevel) || 1) - 1) * ECONOMY_RESOURCE_GOLD_BONUS_PER_LEVEL;
    return Math.max(RESOURCE_VALUE_MIN, Math.floor(baseValue * bonus));
  }

  makeMirroredResourceSpawn(waitSeconds = this.pendingResourceInterval, time = this.nextResourceAt) {
    const { minWait } = this.resourceSpawnIntervalRangeAtTime(time);
    const wait = Math.max(0.05, Number(waitSeconds) || minWait);
    const x = 680 + Math.random() * 110;
    const y = 270 + Math.random() * 340;
    const leftValue = this.resourceValueForSide('left', wait);
    const rightValue = this.resourceValueForSide('right', wait);
    return [
      { x, y, r: 14, value: leftValue, side: 'left' },
      { x: mirroredX(x), y, r: 14, value: rightValue, side: 'right' },
    ];
  }

  queueResourceTelegraph(spawns = []) {
    if (!Array.isArray(spawns)) return;
    for (const entry of spawns) {
      if (!entry) continue;
      this.queueHitSfx('resource_telegraph', Number(entry.x) || 0, Number(entry.y) || 0, null, {
        ttl: RESOURCE_SPAWN_TELEGRAPH_DURATION,
      });
    }
  }

  resourceSpawnInterval(time = this.t) {
    const { minWait: minBase, maxWait: maxBase } = this.resourceSpawnIntervalRangeAtTime(time);
    const roll = minBase + Math.random() * Math.max(0, maxBase - minBase);
    const mul = Math.max(DEBUG_RATE_MIN, Number(this.debugResourceRateMultiplier) || 1);
    return Math.max(0.2, roll / mul);
  }

  shotPowerSpawnInterval(minSeconds = SHOT_POWER_SPAWN_MIN_INTERVAL, maxSeconds = SHOT_POWER_SPAWN_MAX_INTERVAL) {
    const minBase = Math.max(0.2, Number(minSeconds) || SHOT_POWER_SPAWN_MIN_INTERVAL);
    const maxBase = Math.max(minBase, Number(maxSeconds) || SHOT_POWER_SPAWN_MAX_INTERVAL);
    const roll = minBase + Math.random() * Math.max(0, maxBase - minBase);
    const mul = Math.max(DEBUG_RATE_MIN, Number(this.debugPowerDropRateMultiplier) || 1);
    return Math.max(0.2, roll / mul);
  }

  scheduleNextShotPower(
    fromTime = this.t,
    minSeconds = SHOT_POWER_SPAWN_MIN_INTERVAL,
    maxSeconds = SHOT_POWER_SPAWN_MAX_INTERVAL,
    options = null
  ) {
    const now = Math.max(0, Number(fromTime) || 0);
    const delay = this.shotPowerSpawnInterval(minSeconds, maxSeconds);
    const targetAt = now + delay;
    if (options?.preferEarlier) {
      const existing = Number(this.nextShotPowerAt);
      this.nextShotPowerAt = Number.isFinite(existing) ? Math.min(existing, targetAt) : targetAt;
      return this.nextShotPowerAt;
    }
    this.nextShotPowerAt = targetAt;
    return targetAt;
  }

  scheduleNextResourceSpawn(fromTime = this.t) {
    const now = Math.max(0, Number(fromTime) || 0);
    const delay = this.resourceSpawnInterval(now);
    this.pendingResourceInterval = delay;
    this.nextResourceAt = now + delay;
    this.nextResourceTelegraphAt = Math.max(now, this.nextResourceAt - RESOURCE_SPAWN_TELEGRAPH_DURATION);
    this.pendingResourceSpawns = null;
  }

  spawnMirroredResource(spawns = null) {
    const chosen = Array.isArray(spawns) && spawns.length ? spawns : this.makeMirroredResourceSpawn(this.pendingResourceInterval);
    for (const entry of chosen) {
      if (!entry) continue;
      this.resources.push({
        id: this.seq++,
        x: Number(entry.x) || 0,
        y: Number(entry.y) || 0,
        r: Math.max(6, Number(entry.r) || 14),
        value: Math.max(1, Number(entry.value) || 1),
        side: entry.side === 'right' ? 'right' : 'left',
      });
    }
  }

  spawnMirroredShotPower() {
    const x = 680 + Math.random() * 110;
    const hasMultiShot = SHOT_POWER_TYPES.includes('multiShot');
    const nonMultiCount = Math.max(0, SHOT_POWER_TYPES.length - (hasMultiShot ? 1 : 0));
    const equalChance = SHOT_POWER_TYPES.length > 0 ? (1 / SHOT_POWER_TYPES.length) : 0;
    const targetMultiChance = Math.max(0, Math.min(0.95, equalChance * SHOT_POWER_MULTI_SHOT_CHANCE_RATIO));
    const multiWeight = (!hasMultiShot || nonMultiCount <= 0 || targetMultiChance <= 0)
      ? 1
      : ((targetMultiChance * nonMultiCount) / Math.max(0.0001, 1 - targetMultiChance));
    const weightedTypes = SHOT_POWER_TYPES.map((type) => ({
      type,
      weight: type === 'multiShot'
        ? multiWeight
        : (type === 'flareShot' ? SHOT_POWER_FLARE_SPAWN_CHANCE_MULT : 1),
    }));
    const picked = weightedRandomFrom(weightedTypes);
    const type = picked?.type || randomFrom(SHOT_POWER_TYPES);
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
      committeeLocked: false,
    });
  }

  committeeVotingRequiredForSide(sideName = 'left') {
    return this.hasCommitteePlayers(sideName);
  }

  setUpgradeCardCommitteeLock(sideName = 'left', locked = false, voteActive = false) {
    const side = sideName === 'right' ? 'right' : 'left';
    for (const card of this.upgradeCards) {
      if (!card || card.side !== side) continue;
      card.committeeLocked = Boolean(locked);
      card.committeeVoteActive = Boolean(voteActive);
    }
  }

  buildCommitteeVoteOptions(sideName = 'left', optionCount = COMMITTEE_VOTE_OPTION_COUNT) {
    const side = sideName === 'right' ? 'right' : 'left';
    const sideState = this[side];
    const targetCount = Math.max(2, Math.floor(Number(optionCount) || COMMITTEE_VOTE_OPTION_COUNT));
    const options = [];
    const usedTypes = new Set();
    const candidateOptions = { specialBucketWeightMultiplier: COMMITTEE_SPECIAL_BUCKET_WEIGHT_MULT };

    for (let i = 0; i < targetCount; i += 1) {
      const candidates = this.buildUpgradeCardCandidates(sideState, usedTypes, candidateOptions);
      if (!candidates.length) break;
      const choice = weightedRandomFrom(candidates);
      const type = choice?.type;
      if (!type || usedTypes.has(type)) continue;
      usedTypes.add(type);
      options.push({
        id: `${side}-${this.committeeVoteSeq++}`,
        type,
        level: Math.max(0, Number(sideState?.[type]) || 0),
      });
    }

    if (options.length < targetCount) {
      let guard = 0;
      while (options.length < targetCount && guard < targetCount * 12) {
        guard += 1;
        const fallback = this.buildUpgradeCardCandidates(sideState, usedTypes, candidateOptions);
        if (!fallback.length) break;
        const choice = weightedRandomFrom(fallback);
        const type = choice?.type;
        if (!type || usedTypes.has(type)) continue;
        usedTypes.add(type);
        options.push({
          id: `${side}-${this.committeeVoteSeq++}`,
          type,
          level: Math.max(0, Number(sideState?.[type]) || 0),
        });
      }
    }
    return options;
  }

  ensureCommitteeVoteSession(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const sideState = this[side];
    const voteState = this.committeeVotes[side] || this.createCommitteeVoteState(side);
    this.committeeVotes[side] = voteState;
    if (!this.committeeVotingRequiredForSide(side)) {
      this.resetCommitteeVoteState(side);
      return;
    }
    if ((Number(sideState?.upgradeCharge) || 0) < (Number(sideState?.upgradeChargeMax) || 0)) {
      this.resetCommitteeVoteState(side);
      return;
    }
    if (voteState.active && Array.isArray(voteState.options) && voteState.options.length) return;

    let options = this.buildCommitteeVoteOptions(side, COMMITTEE_VOTE_OPTION_COUNT);
    if (!options.length) {
      const cards = this.upgradeCards.filter((card) => card?.side === side);
      options = cards.slice(0, COMMITTEE_VOTE_OPTION_COUNT).map((card) => ({
        id: `${side}-${this.committeeVoteSeq++}`,
        type: card.type,
        level: Math.max(0, Number(sideState?.[card.type]) || 0),
      }));
    }
    if (!options.length) {
      this.resetCommitteeVoteState(side);
      return;
    }
    voteState.active = true;
    voteState.startedAt = 0;
    voteState.resolveAt = 0;
    voteState.options = options;
    voteState.votesByPlayerId = {};
  }

  castCommitteeVote(socketId, optionId) {
    const member = this.committeePlayerBySocket(socketId);
    if (!member?.player) return { ok: false, message: 'Only committee members can vote.' };
    const side = member.side === 'right' ? 'right' : 'left';
    const voteState = this.committeeVotes[side];
    if (!voteState?.active || !Array.isArray(voteState.options) || !voteState.options.length) {
      return { ok: false, message: 'No active vote for your committee right now.' };
    }
    const targetId = String(optionId || '').trim();
    if (!targetId) return { ok: false, message: 'Choose an option to vote.' };
    const option = voteState.options.find((entry) => String(entry?.id) === targetId);
    if (!option) return { ok: false, message: 'That vote option is no longer available.' };
    voteState.votesByPlayerId[socketId] = targetId;
    if ((Number(voteState.resolveAt) || 0) <= 0) {
      voteState.startedAt = this.t;
      voteState.resolveAt = this.t + COMMITTEE_VOTE_DURATION_SECONDS;
    }
    return { ok: true, side, optionId: targetId };
  }

  committeeVoteWinner(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const voteState = this.committeeVotes[side];
    if (!voteState?.active || !Array.isArray(voteState.options) || !voteState.options.length) return null;
    const tally = new Map(voteState.options.map((option) => [option.id, 0]));
    for (const [playerId, optionId] of Object.entries(voteState.votesByPlayerId || {})) {
      const member = this.committeePlayerBySocket(playerId);
      if (!member || member.side !== side) continue;
      if (!tally.has(optionId)) continue;
      tally.set(optionId, (tally.get(optionId) || 0) + 1);
    }
    let maxVotes = -1;
    let winner = null;
    for (const option of voteState.options) {
      const votes = tally.get(option.id) || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = option;
      }
    }
    if (winner) return winner;
    return randomFrom(voteState.options);
  }

  resolveCommitteeVoteIfDue(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const voteState = this.committeeVotes[side];
    if (!voteState?.active) return;
    const resolveAt = Number(voteState.resolveAt) || 0;
    if (resolveAt <= 0) return;
    if (this.t < resolveAt) return;
    const winner = this.committeeVoteWinner(side);
    if (!winner?.type) {
      this.resetCommitteeVoteState(side);
      return;
    }
    const options = this.buildCommitteeVoteTallies(side, voteState);
    this.committeeVoteFx[side] = {
      ttl: 2.2,
      maxTtl: 2.2,
      winningOptionId: winner.id || null,
      winningType: winner.type || null,
      options,
    };
    const fallbackCard = {
      id: this.seq++,
      side,
      slot: 0,
      source: 'committee',
      type: winner.type,
      value: 1,
      cost: this.upgradeCost(this[side], winner.type),
      x: this.sideCardSlotX(side, 0),
      y: CARD_Y,
      w: CARD_W,
      h: CARD_H,
      committeeLocked: true,
      committeeVoteActive: true,
    };
    const matchingShown = this.upgradeCards.find((card) => card?.side === side && card?.type === winner.type)
      || fallbackCard;
    const fxOptions = options.map((entry, index) => ({
      id: entry?.id ?? `${side}-fx-${index}`,
      slot: index,
      type: entry?.type || null,
      level: Math.max(0, Number(entry?.level) || 0),
      selected: String(entry?.id || '') === String(winner.id || ''),
    })).filter((entry) => Boolean(entry.type));
    this.selectUpgradeCard(side, matchingShown, {
      selectedOptionId: winner.id || null,
      fxOptions,
    });
    this.resetCommitteeVoteState(side);
  }

  buildCommitteeVoteSnapshotForSide(sideName = 'left') {
    const side = sideName === 'right' ? 'right' : 'left';
    const state = this.committeeVotes?.[side] || this.createCommitteeVoteState(side);
    const now = this.t;
    const resolveAt = Number(state.resolveAt) || 0;
    const remaining = state.active && resolveAt > 0
      ? Math.max(0, resolveAt - now)
      : 0;
    const members = this.sideCommitteePlayers(side);
    const options = this.buildCommitteeVoteTallies(side, state);
    return {
      side,
      active: Boolean(state.active),
      startedAt: Number(state.startedAt) || 0,
      resolveAt: Number(state.resolveAt) || 0,
      remaining,
      optionCount: options.length,
      options,
      votesByPlayerId: { ...(state.votesByPlayerId || {}) },
      committeeCount: members.length,
      votersReady: members.filter((member) => Boolean(member?.ready)).length,
    };
  }

  buildCommitteeVoteSnapshot() {
    return {
      left: this.buildCommitteeVoteSnapshotForSide('left'),
      right: this.buildCommitteeVoteSnapshotForSide('right'),
    };
  }

  buildCommitteeVoteFxSnapshot() {
    const mapSide = (sideName = 'left') => {
      const entry = this.committeeVoteFx?.[sideName];
      if (!entry) return null;
      return {
        side: sideName,
        ttl: Math.max(0, Number(entry.ttl) || 0),
        maxTtl: Math.max(0.001, Number(entry.maxTtl) || 1),
        winningOptionId: entry.winningOptionId || null,
        winningType: entry.winningType || null,
        options: Array.isArray(entry.options) ? entry.options.map((option) => ({
          id: option?.id || null,
          type: option?.type || null,
          level: Math.max(0, Number(option?.level) || 0),
          votes: Math.max(0, Number(option?.votes) || 0),
          voters: Array.isArray(option?.voters) ? option.voters.map((name) => String(name || '')).filter(Boolean) : [],
        })) : [],
      };
    };
    return {
      left: mapSide('left'),
      right: mapSide('right'),
    };
  }

  setUpgradeSelectionFx(sideName = 'left', selectedCard = null, options = []) {
    const side = sideName === 'right' ? 'right' : 'left';
    const sideState = this[side];
    const selectedType = selectedCard?.type || null;
    const selectedId = selectedCard?.id || null;
    if (!selectedType) {
      this.upgradeSelectionFx[side] = null;
      return;
    }
    const normalizedOptions = Array.isArray(options) ? options.map((entry, index) => ({
      id: entry?.id ?? `opt-${index}`,
      slot: Number.isFinite(entry?.slot) ? entry.slot : index,
      type: entry?.type || null,
      level: Number.isFinite(Number(entry?.level))
        ? Math.max(0, Number(entry?.level) || 0)
        : Math.max(0, Number(sideState?.[entry?.type]) || 0),
      selected: String(entry?.id) === String(selectedId),
    })).filter((entry) => Boolean(entry.type)) : [];
    this.upgradeSelectionFx[side] = {
      side,
      ttl: UPGRADE_SELECTION_FX_DURATION,
      maxTtl: UPGRADE_SELECTION_FX_DURATION,
      selectedType,
      selectedOptionId: selectedId,
      options: normalizedOptions,
    };
  }

  buildUpgradeSelectionFxSnapshot() {
    const mapSide = (sideName = 'left') => {
      const entry = this.upgradeSelectionFx?.[sideName];
      if (!entry) return null;
      return {
        side: sideName,
        ttl: Math.max(0, Number(entry.ttl) || 0),
        maxTtl: Math.max(0.001, Number(entry.maxTtl) || 1),
        selectedType: entry.selectedType || null,
        selectedOptionId: entry.selectedOptionId || null,
        options: Array.isArray(entry.options) ? entry.options.map((option) => ({
          id: option?.id ?? null,
          slot: Number.isFinite(option?.slot) ? option.slot : 0,
          type: option?.type || null,
          level: Math.max(0, Number(option?.level) || 0),
          selected: Boolean(option?.selected),
        })) : [],
      };
    };
    return {
      left: mapSide('left'),
      right: mapSide('right'),
    };
  }

  upgradePathForType(type) {
    return UPGRADE_PATH_BY_TYPE[type] || 'misc';
  }

  pickUpgradeCardChoice(side, excludedTypes = new Set(), excludedPaths = new Set(), options = null) {
    const allCandidates = this.buildUpgradeCardCandidates(side, excludedTypes, options?.candidateOptions || null);
    const blockedPaths = new Set(excludedPaths);
    if (options?.allowSpecialPathDuplicate) blockedPaths.delete('special');
    const withPathSpread = allCandidates.filter((candidate) => !blockedPaths.has(candidate.path));
    const pool = withPathSpread.length ? withPathSpread : allCandidates;
    if (!pool.length) return null;
    const preferSpecialChance = Math.max(0, Math.min(1, Number(options?.preferSpecialChance) || 0));
    if (preferSpecialChance > 0 && Math.random() < preferSpecialChance) {
      const specialPool = pool.filter((candidate) => candidate?.path === 'special');
      if (specialPool.length) return weightedRandomFrom(specialPool);
    }
    if (pool.length) return weightedRandomFrom(pool);
    return null;
  }

  refillRegularCards(sideName) {
    const side = this[sideName];
    if (!side) return;
    const shown = this.upgradeCards.filter((c) => c.side === sideName && c.slot >= 0 && c.slot < 2);
    const usedTypes = new Set(shown.map((c) => c.type));
    const usedPaths = new Set(shown.map((c) => this.upgradePathForType(c.type)));

    for (let slot = 0; slot < 2; slot += 1) {
      if (!this.hasCardInSlot(sideName, slot)) {
        const allowSpecialPair = usedPaths.has('special');
        const choice = this.pickUpgradeCardChoice(side, usedTypes, usedPaths, {
          allowSpecialPathDuplicate: allowSpecialPair,
          preferSpecialChance: allowSpecialPair ? REGULAR_SPECIAL_PAIR_PICK_CHANCE : 0,
        });
        if (!choice?.type) continue;
        this.addUpgradeCard(sideName, slot, choice.type, choice.source || 'random');
        usedTypes.add(choice.type);
        usedPaths.add(choice.path || this.upgradePathForType(choice.type));
      }
    }
  }

  clearCardsForSide(sideName) {
    this.upgradeCards = this.upgradeCards.filter((c) => c.side !== sideName);
  }

  selectUpgradeCard(sideName, card, options = null) {
    const side = this[sideName];
    if (!side || !card || card.side !== sideName) return false;
    if (side.upgradeCharge < side.upgradeChargeMax) return false;
    const sideCardsBeforeSelect = this.upgradeCards.filter((entry) => entry?.side === sideName);
    const selectedOptionId = options?.selectedOptionId ?? card?.id ?? null;
    const fxOptionSeed = Array.isArray(options?.fxOptions) && options.fxOptions.length
      ? options.fxOptions
      : sideCardsBeforeSelect;
    const levelBeforeByType = new Map();
    for (const entry of fxOptionSeed) {
      const type = entry?.type;
      if (!type || levelBeforeByType.has(type)) continue;
      levelBeforeByType.set(type, Math.max(0, Number(side?.[type]) || 0));
    }
    const fxOptions = fxOptionSeed.map((entry, index) => ({
      id: entry?.id ?? `opt-${index}`,
      slot: Number.isFinite(entry?.slot) ? entry.slot : index,
      type: entry?.type || null,
      level: Number.isFinite(Number(entry?.level))
        ? Math.max(0, Number(entry?.level) || 0)
        : Math.max(0, Number(levelBeforeByType.get(entry?.type)) || 0),
      selected: String(entry?.id ?? '') === String(selectedOptionId ?? ''),
    })).filter((entry) => Boolean(entry?.type));

    const spentDebt = Math.max(1, side.upgradeChargeMax);
    const overflow = Math.max(0, side.upgradeCharge - spentDebt);
    const nextDebt = Math.max(1, this.upgradeCost(side, card.type));

    this.awardUpgrade(side, card.type, card.value);
    side.lastUpgradeSelectionSource = (typeof options?.selectionSource === 'string' && options.selectionSource)
      ? options.selectionSource
      : 'shot';
    this.primeSpecialSpawnCadenceState(sideName, this.t);
    side.candleSpawnInSpawns = this.statCandleEvery(side);
    this.triggerUpgradeActivation(sideName, card.type, card.value, card.x, card.y);
    this.setUpgradeSelectionFx(sideName, { ...card, id: selectedOptionId }, fxOptions);
    this.clearCardsForSide(sideName);

    side.upgradeCharge = overflow;
    side.upgradeChargeMax = nextDebt;
    side.upgradeAutoPickAt = null;
    this.resetCommitteeVoteState(sideName);
    return true;
  }

  selectUpgradeCardBySlot(sideName = 'left', slot = 0, options = null) {
    const side = sideName === 'right' ? 'right' : 'left';
    const lane = Math.max(0, Math.floor(Number(slot) || 0));
    if (this.committeeVotingRequiredForSide(side) && !Boolean(options?.ignoreCommittee)) return false;
    const card = this.upgradeCards.find((entry) => entry?.side === side && Number(entry?.slot) === lane);
    if (!card) return false;
    return this.selectUpgradeCard(side, card, options);
  }

  syncUpgradeCards(sideName) {
    const side = this[sideName];
    if (side.upgradeCharge < side.upgradeChargeMax) {
      this.clearCardsForSide(sideName);
      side.upgradeAutoPickAt = null;
      this.resetCommitteeVoteState(sideName);
      return;
    }

    const upgradeFxActive = (Number(this.upgradeSelectionFx?.[sideName]?.ttl) || 0) > 0;
    if (upgradeFxActive) {
      this.clearCardsForSide(sideName);
      side.upgradeAutoPickAt = null;
      this.resetCommitteeVoteState(sideName);
      return;
    }

    for (const card of this.upgradeCards) {
      if (!card || card.side !== sideName || !card.type) continue;
      card.cost = this.upgradeCost(side, card.type);
    }

    const hadCards = this.upgradeCards.some((c) => c.side === sideName);
    this.refillRegularCards(sideName);
    const committeeRequired = this.committeeVotingRequiredForSide(sideName);
    if (committeeRequired) {
      side.upgradeAutoPickAt = null;
      this.ensureCommitteeVoteSession(sideName);
      this.resolveCommitteeVoteIfDue(sideName);
      const voteActive = Boolean(this.committeeVotes?.[sideName]?.active);
      this.setUpgradeCardCommitteeLock(sideName, true, voteActive);
      return;
    }
    this.resetCommitteeVoteState(sideName);
    this.setUpgradeCardCommitteeLock(sideName, false, false);
    if (!hadCards || !Number.isFinite(side.upgradeAutoPickAt)) side.upgradeAutoPickAt = this.t + 20;

    if (Number.isFinite(side.upgradeAutoPickAt) && this.t >= side.upgradeAutoPickAt) {
      const cards = this.upgradeCards.filter((c) => c.side === sideName);
      if (cards.length) this.selectUpgradeCard(sideName, randomFrom(cards));
    }
  }

  seedUpgradeCards() {
    this.clearCardsForSide('left');
    this.clearCardsForSide('right');
    this.resetCommitteeVoteState('left');
    this.resetCommitteeVoteState('right');
    this.upgradeSelectionFx.left = null;
    this.upgradeSelectionFx.right = null;
  }

  awardUpgrade(side, type, value) {
    const cap = this.upgradeLevelCap(type);
    const gain = Math.max(0, Number(value) || 0);
    const current = Math.max(0, Number(side?.[type]) || 0);
    const sideName = this.sideNameFromStateRef(side) || 'left';
    if (Number.isFinite(cap)) {
      side[type] = Math.min(cap, current + gain);
      this.recordUpgradeEvent(sideName, type, gain, side[type]);
      return;
    }
    side[type] = current + gain;
    this.recordUpgradeEvent(sideName, type, gain, side[type]);
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

    if (type === 'balloonLevel') {
      this.spawnMinion(sideName, { forceType: 'balloon', countSpawn: false });
      this.queueHitSfx('powerup', towerX + dir * 28, towerY - 72, sideName);
      this.queueHitSfx('explosion', towerX + dir * 58, towerY - 126, sideName);
      return;
    }

    if (type === 'dragonSuperBreathLevel') {
      this.spawnMinion(sideName, { forceType: 'dragon', countSpawn: false });
      this.queueHitSfx('dragonfire', towerX + dir * 34, towerY - 14, sideName);
      return;
    }

    if (type === 'stoneGolemAncientCoreLevel') {
      this.spawnMinion(sideName, { forceType: 'stonegolem', countSpawn: false });
      this.queueHitSfx('explosion', towerX + dir * 30, towerY + 4, sideName);
      this.queueHitSfx('blocked', towerX + dir * 26, towerY - 4, sideName);
      return;
    }

    if (type === 'heroDestinedChampionLevel') {
      this.spawnMinion(sideName, { forceType: 'hero', countSpawn: false });
      this.queueHitSfx('powerup', towerX + dir * 22, towerY - 16, sideName);
      this.queueHitSfx('upgrade', towerX + dir * 42, towerY - 24, sideName);
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

    if (type === 'presidentExecutiveOrderLevel') {
      this.spawnMinion(sideName, { forceType: 'president', countSpawn: false });
      for (const m of this.minions) {
        if (!m || m.removed || !m.president || m.side !== sideName) continue;
        m.presidentExecutiveOrderUpgraded = true;
        m.presidentExecutiveOrderCd = presidentExecutiveOrderCooldown();
      }
      this.queueHitSfx('upgrade', towerX + dir * 22, towerY - 10, sideName);
      this.queueHitSfx('blocked', towerX + dir * 42, towerY - 18, sideName);
      return;
    }

    // For non-summon upgrades, accelerate the relevant cooldown so impact is immediate.
    if (type === 'volleyLevel' || type === 'powerLevel') {
      this.sharedShotCd = Math.min(this.sharedShotCd, 0.16);
      this.left.shotCd = this.sharedShotCd;
      this.right.shotCd = this.sharedShotCd;
      if (type === 'powerLevel') {
        this.scheduleNextShotPower(
          this.t,
          SHOT_POWER_POWER_UPGRADE_MIN_INTERVAL,
          SHOT_POWER_POWER_UPGRADE_MAX_INTERVAL
        );
      }
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

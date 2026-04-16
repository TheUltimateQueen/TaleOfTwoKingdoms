export const WORLD_W = 1600;
export const WORLD_H = 900;
export const TOWER_X_LEFT = 120;
export const TOWER_X_RIGHT = 1600 - 120;
export const TOWER_Y = 900 / 2;
export const GROUND_Y = 900 - 60;
export const CARD_Y = 90;
export const CARD_W = 90;
export const CARD_H = 44;
export const UPGRADE_TYPES = [
  'unitLevel',
  'volleyLevel',
  'spawnLevel',
  'unitHpLevel',
  'resourceLevel',
  'powerLevel',
  'balloonLevel',
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
export const SHOT_POWER_TYPES = ['multiShot', 'ultraShot', 'pierceShot', 'flameShot', 'flareShot'];

// Spawn cadence tuning shared by sim + renderer-facing cap displays.
export const SPAWN_EVERY_MIN_SECONDS = 0.65;
export const SPAWN_EVERY_BASE_SECONDS = 2.2;
export const SPAWN_EVERY_PER_LEVEL_REDUCTION = 0.09;
export const SPAWN_LEVEL_EFFECTIVE_CAP = Math.max(
  1,
  Math.ceil((SPAWN_EVERY_BASE_SECONDS - SPAWN_EVERY_MIN_SECONDS) / SPAWN_EVERY_PER_LEVEL_REDUCTION)
);

// Central place for level caps so "final upgrade" UI and sim card eligibility stay aligned.
export const UPGRADE_LEVEL_CAPS = Object.freeze({
  volleyLevel: 2,
  spawnLevel: SPAWN_LEVEL_EFFECTIVE_CAP,
  dragonSuperBreathLevel: 1,
});

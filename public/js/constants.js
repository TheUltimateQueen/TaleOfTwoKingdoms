import { SPECIAL_UNIT_UPGRADE_RULES_BY_TYPE } from './specialUnitUpgradeConfig.js';

export const SHOT_INTERVAL = 1;

export const UPGRADE_LABELS = {
  unitLevel: 'Unit Damage+',
  volleyLevel: 'Arrow Count+',
  spawnLevel: 'Spawn Speed+',
  unitHpLevel: 'Unit HP+',
  resourceLevel: 'Economy+',
  powerLevel: 'Power Effects+',
  balloonLevel: '+Balloon',
  dragonLevel: '+Dragon',
  dragonSuperBreathLevel: 'Dragon Breath Burst',
  stoneGolemAncientCoreLevel: '+Golem',
  heroDestinedChampionLevel: '+Hero',
  shieldDarkMetalLevel: '+Shield',
  monkHealCircleLevel: '+Monk',
  necroExpertSummonerLevel: '+Necro',
  riderSuperHorseLevel: '+Rider',
  diggerGoldFinderLevel: '+Digger',
  gunnerSkyCannonLevel: '+Gunner',
  presidentExecutiveOrderLevel: '+President',
  superMinionLevel: '+Super',
};

export const UPGRADE_HINTS = {
  unitLevel: 'increases minion damage',
  volleyLevel: 'adds extra arrows per shot',
  spawnLevel: 'reduces time between minion spawns',
  unitHpLevel: 'increases minion hp',
  resourceLevel: 'more center-coin and combat gold, plus +1 arrow-hit gold per level',
  powerLevel: 'stronger power shots and support ability scaling',
  balloonLevel: 'unlocks balloons at BA1, then improves balloon stats',
  dragonLevel: 'improves dragon spawn chance and speed',
  dragonSuperBreathLevel: 'unlocks dragon cone breath burst (5s cycle)',
  stoneGolemAncientCoreLevel: 'summons a stone golem and upgrades golem scaling',
  heroDestinedChampionLevel: 'summons the hero and upgrades hero scaling',
  shieldDarkMetalLevel: '10s cycle: 5s at 95% damage reduction and shield chance x2',
  monkHealCircleLevel: 'unlocks monk healing pulse (every 10s)',
  necroExpertSummonerLevel: 'nearby deaths revive as allied minions at 1/8 hp',
  riderSuperHorseLevel: 'rider hp x4 with stronger charge impact',
  diggerGoldFinderLevel: 'diggers seek and collect gold resources',
  gunnerSkyCannonLevel: 'gunners fire periodic sky-cannon AoE blasts',
  presidentExecutiveOrderLevel: 'first hit on marked allies only deals 10% damage',
  superMinionLevel: 'improves super minion spawn chance and speed',
};

export const SPECIAL_SPAWN_BASE_CHANCE = Object.freeze({
  necrominion: 0.40,
  gunner: 0.60,
  rider: 0.5,
  digger: 0.5,
  monk: 0.46,
  stonegolem: 0.02,
  shield: 0.1,
  hero: 0.1,
  president: 0.41,
  dragon: 0.33,
  balloon: 0.14,
  super: 0.3,
});

export const SPECIAL_SPAWN_QUEUE_ORDER = Object.freeze([
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

export const SUPPORT_SPECIAL_TYPES = Object.freeze([
  'necrominion',
  'monk',
  'president',
]);

export const SUPPORT_SPAWN_DEBUFF_FIRST_MULT = 0.9;
export const SUPPORT_SPAWN_DEBUFF_ADDITIONAL_MULT = 0.6;

export function specialSpawnBaseChanceForType(type) {
  const chance = Number(SPECIAL_SPAWN_BASE_CHANCE[type]);
  return Number.isFinite(chance) ? chance : null;
}

const STAGED_UPGRADE_COPY = Object.freeze(
  Object.fromEntries(
    Object.entries(SPECIAL_UNIT_UPGRADE_RULES_BY_TYPE).map(([type, rule]) => [type, {
      unlockLabel: rule.unlockLabel,
      upgradedLabel: rule.repeatLabel,
      unlockHint: rule.unlockHint,
      upgradedHint: rule.repeatHint,
    }])
  )
);

export function upgradeLabelForLevel(type, level = null) {
  const staged = STAGED_UPGRADE_COPY[type];
  if (!staged) return UPGRADE_LABELS[type] || 'Upgrade';
  const value = Math.max(0, Number(level) || 0);
  return value <= 0 ? staged.unlockLabel : staged.upgradedLabel;
}

export function upgradeHintForLevel(type, level = null) {
  const staged = STAGED_UPGRADE_COPY[type];
  if (!staged) return UPGRADE_HINTS[type] || 'upgrade effect';
  const value = Math.max(0, Number(level) || 0);
  return value <= 0 ? staged.unlockHint : staged.upgradedHint;
}

export const SHOT_POWER_LABELS = {
  multiShot: 'Multi',
  ultraShot: 'Ultra',
  pierceShot: 'Pierce',
  flameShot: 'Flame',
  flareShot: 'Flare',
};

export const TEAM_COLORS = {
  left: {
    primary: '#4da7ff',
    dark: '#1e5b9f',
    soft: '#b9deff',
    castle: '#2f4566',
    ring: '#66b7ff',
  },
  right: {
    primary: '#ff6a6a',
    dark: '#983636',
    soft: '#ffd0d0',
    castle: '#61343f',
    ring: '#ff7b7b',
  },
};

import { SPECIAL_UNIT_UPGRADE_RULES_BY_TYPE } from './specialUnitUpgradeConfig.js';

export const SHOT_INTERVAL = 1;

export const UPGRADE_LABELS = {
  arrowLevel: 'Arrow Damage+',
  unitLevel: 'Unit Damage+',
  volleyLevel: 'Arrow Count+',
  spawnLevel: 'Spawn Speed+',
  unitHpLevel: 'Unit HP+',
  resourceLevel: 'Economy+ Increase Gold Get',
  bountyLevel: 'Combat Gold+',
  powerLevel: 'Power Effects+',
  specialRateLevel: 'Special Chance+',
  balloonLevel: 'Balloon Upgrade+',
  dragonLevel: 'Dragon Rate+',
  dragonSuperBreathLevel: 'Dragon Super Breath',
  shieldDarkMetalLevel: 'Shield Dark Metal',
  monkHealCircleLevel: 'Monk Heal Circle',
  necroExpertSummonerLevel: 'Necro Death Revival',
  riderSuperHorseLevel: 'Rider Super Horse',
  diggerGoldFinderLevel: 'Digger Gold Finder',
  gunnerSkyCannonLevel: 'Gunner Sky Cannon',
  presidentExecutiveOrderLevel: 'Pardon President',
  superMinionLevel: 'Super Rate+',
};

export const UPGRADE_HINTS = {
  arrowLevel: '+arrow damage',
  unitLevel: '+unit damage',
  volleyLevel: '+extra arrows per shot',
  spawnLevel: '+spawn speed',
  unitHpLevel: '+unit hp',
  resourceLevel: '+center-gold value and combat gold (half each), +1 arrow-hit gold/level',
  bountyLevel: '+minion kill and arrow damage gold',
  powerLevel: '+shot power and support scaling',
  specialRateLevel: '+special spawn chance',
  balloonLevel: 'unlocks sky balloons at BA1, then boosts balloon power/spawn rate',
  dragonLevel: '+dragon spawn rate',
  dragonSuperBreathLevel: 'unlocks 5s cone burst for dragons',
  shieldDarkMetalLevel: '10s cycle: 5s at 95% damage reduction, shield chance x2',
  monkHealCircleLevel: 'unlocks 10s monk healing pulse',
  necroExpertSummonerLevel: 'nearby deaths revive at 1/8 hp',
  riderSuperHorseLevel: 'rider hp x4, larger horse, stronger charge hit',
  diggerGoldFinderLevel: 'diggers seek and collect gold resources',
  gunnerSkyCannonLevel: 'gunners fire periodic sky-cannon AoE blasts',
  presidentExecutiveOrderLevel: 'signs a pardon paper: first hit takes 10% damage',
  superMinionLevel: '+super spawn rate',
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

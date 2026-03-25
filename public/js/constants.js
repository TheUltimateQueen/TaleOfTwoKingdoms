export const SHOT_INTERVAL = 1;

export const UPGRADE_LABELS = {
  arrowLevel: 'Arrow Damage+',
  unitLevel: 'Unit Damage+',
  volleyLevel: 'Arrow Count+',
  spawnLevel: 'Spawn Speed+',
  unitHpLevel: 'Unit HP+',
  resourceLevel: 'Resource Gold+',
  bountyLevel: 'Kill Gold+',
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
  resourceLevel: '+resource gold',
  bountyLevel: '+kill gold',
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

const STAGED_UPGRADE_COPY = {
  balloonLevel: {
    unlockLabel: 'Unlock Balloon',
    upgradedLabel: 'Balloon+',
    unlockHint: 'BA1 unlocks sky balloons',
    upgradedHint: '+balloon hp/dmg/spawn rate',
  },
  dragonLevel: {
    unlockLabel: 'Unlock Dragon',
    upgradedLabel: 'Dragon+',
    unlockHint: 'DR1 unlocks dragons',
    upgradedHint: '+dragon spawn rate',
  },
  superMinionLevel: {
    unlockLabel: 'Unlock Super',
    upgradedLabel: 'Super+',
    unlockHint: 'SU1 unlocks super minions',
    upgradedHint: '+super spawn rate',
  },
};

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

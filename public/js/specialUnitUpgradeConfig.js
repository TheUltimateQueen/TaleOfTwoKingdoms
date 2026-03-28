export const REPEAT_SPECIAL_UPGRADE_CONFIG = Object.freeze({
  minUnlockedUnits: 3,
  regularUpgradeWeight: 1,
  bucketWeight: 4,
  dynamicWeightExponent: 0.4,
  dynamicWeightMin: 0.82,
  dynamicWeightMax: 1.18,
  leaderPenaltyPerLevelAhead: 0.05,
  leaderPenaltyFloor: 0.85,
});

const SPECIAL_UNIT_UPGRADE_ENTRIES = [
  {
    unitType: 'necrominion',
    specialType: 'necrominion',
    upgradeType: 'necroExpertSummonerLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 1.04,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.1,
    },
    unlockLabel: 'Necro Death Revival',
    repeatLabel: 'Necro+',
    unlockHint: 'nearby deaths revive at 1/8 hp',
    repeatHint: '+necro hp/dmg',
  },
  {
    unitType: 'gunner',
    specialType: 'gunner',
    upgradeType: 'gunnerSkyCannonLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 1.08,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.1,
    },
    unlockLabel: 'Gunner Sky Cannon',
    repeatLabel: 'Gunner+',
    unlockHint: 'gunners fire periodic sky-cannon AoE blasts',
    repeatHint: '+gunner hp/dmg',
  },
  {
    unitType: 'rider',
    specialType: 'rider',
    upgradeType: 'riderSuperHorseLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 1.05,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.1,
    },
    unlockLabel: 'Rider Super Horse',
    repeatLabel: 'Rider+',
    unlockHint: 'rider hp x4, larger horse, stronger charge hit',
    repeatHint: '+rider hp/dmg',
  },
  {
    unitType: 'digger',
    specialType: 'digger',
    upgradeType: 'diggerGoldFinderLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 1.06,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.1,
    },
    unlockLabel: 'Digger Gold Finder',
    repeatLabel: 'Digger+',
    unlockHint: 'diggers seek and collect gold resources',
    repeatHint: '+digger hp/dmg',
  },
  {
    unitType: 'monk',
    specialType: 'monk',
    upgradeType: 'monkHealCircleLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 1,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.04,
      monkHealMultPerLevel: 1.1,
      monkRangeMultPerLevel: 1.04,
    },
    unlockLabel: 'Monk Heal Circle',
    repeatLabel: 'Monk+',
    unlockHint: 'unlocks 10s monk healing pulse',
    repeatHint: '+monk hp/healing',
  },
  {
    unitType: 'stonegolem',
    specialType: 'stonegolem',
    upgradeType: null,
    hasInitialUnlock: false,
    repeatEligible: false,
    baseOfferWeight: 0.58,
    repeatChancePerLevel: 0,
    unlockLabel: 'Stone Golem Upgrade',
    repeatLabel: 'Golem+',
    unlockHint: 'future stone golem unlock',
    repeatHint: '+stone golem spawn chance',
  },
  {
    unitType: 'shield',
    specialType: 'shield',
    upgradeType: 'shieldDarkMetalLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 0.66,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.12,
      shieldPushMultPerLevel: 1.08,
    },
    unlockLabel: 'Shield Dark Metal',
    repeatLabel: 'Shield+',
    unlockHint: '10s cycle: 5s at 95% damage reduction, shield chance x2',
    repeatHint: '+shield hp/push',
  },
  {
    unitType: 'hero',
    specialType: 'hero',
    upgradeType: null,
    hasInitialUnlock: false,
    repeatEligible: false,
    baseOfferWeight: 0.55,
    repeatChancePerLevel: 0,
    unlockLabel: 'Hero Upgrade',
    repeatLabel: 'Hero+',
    unlockHint: 'future hero unlock',
    repeatHint: '+hero rescue chance',
  },
  {
    unitType: 'president',
    specialType: 'president',
    upgradeType: 'presidentExecutiveOrderLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 0.94,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.04,
      presidentAuraMultPerLevel: 1.08,
    },
    unlockLabel: 'Pardon President',
    repeatLabel: 'President+',
    unlockHint: 'signs a pardon paper: first hit takes 10% damage',
    repeatHint: '+president hp/aura',
  },
  {
    unitType: 'balloon',
    specialType: 'balloon',
    upgradeType: 'balloonLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 0.76,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.1,
    },
    unlockLabel: 'Unlock Balloon',
    repeatLabel: 'Balloon+',
    unlockHint: 'BA1 unlocks sky balloons',
    repeatHint: '+balloon hp/dmg',
  },
  {
    unitType: 'dragon',
    specialType: 'dragon',
    upgradeType: 'dragonLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 0.82,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.1,
    },
    unlockLabel: 'Unlock Dragon',
    repeatLabel: 'Dragon+',
    unlockHint: 'DR1 unlocks dragons',
    repeatHint: '+dragon hp/dmg',
  },
  {
    unitType: 'super',
    specialType: 'super',
    upgradeType: 'superMinionLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 0.84,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.1,
    },
    unlockLabel: 'Unlock Super',
    repeatLabel: 'Super+',
    unlockHint: 'SU1 unlocks super minions',
    repeatHint: '+super hp/dmg',
  },
  {
    unitType: 'candle',
    specialType: 'candle',
    upgradeType: null,
    hasInitialUnlock: false,
    repeatEligible: false,
    baseOfferWeight: 0.74,
    repeatChancePerLevel: 0,
    unlockLabel: 'Candle Upgrade',
    repeatLabel: 'Candle+',
    unlockHint: 'future candle unlock',
    repeatHint: '+candle spawn chance',
  },
];

export const SPECIAL_UNIT_UPGRADE_RULES = Object.freeze(
  Object.fromEntries(
    SPECIAL_UNIT_UPGRADE_ENTRIES.map((entry) => [entry.unitType, Object.freeze({ ...entry })])
  )
);

export const SPECIAL_UNIT_UPGRADE_RULES_BY_TYPE = Object.freeze(
  Object.fromEntries(
    SPECIAL_UNIT_UPGRADE_ENTRIES
      .filter((entry) => typeof entry.upgradeType === 'string' && entry.upgradeType)
      .map((entry) => [entry.upgradeType, Object.freeze({ ...entry })])
  )
);

export const REPEAT_SPECIAL_UPGRADE_TYPES = Object.freeze(
  SPECIAL_UNIT_UPGRADE_ENTRIES
    .filter((entry) => entry.repeatEligible && typeof entry.upgradeType === 'string' && entry.upgradeType)
    .map((entry) => entry.upgradeType)
);

export function specialUnitUpgradeRuleForType(type) {
  return SPECIAL_UNIT_UPGRADE_RULES_BY_TYPE[type] || null;
}

export function specialUnitUpgradeRuleForUnit(unitType) {
  return SPECIAL_UNIT_UPGRADE_RULES[unitType] || null;
}

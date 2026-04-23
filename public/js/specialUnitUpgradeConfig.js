export const REPEAT_SPECIAL_UPGRADE_CONFIG = Object.freeze({
  minUnlockedUnits: 3,
  regularUpgradeWeight: 1,
  bucketWeight: 4,
  dynamicWeightExponent: 0.4,
  dynamicWeightMin: 0.82,
  dynamicWeightMax: 1.18,
  leaderPenaltyPerLevelAhead: 0.03,
  leaderPenaltyFloor: 0.9,
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
    unlockLabel: 'Revival Necro',
    repeatLabel: '+Necro',
    unlockHint: 'nearby deaths revive as allied minions at 1/8 hp',
    repeatHint: 'increases necro hp and damage',
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
    unlockLabel: 'Cannon Gunner',
    repeatLabel: '+Gunner',
    unlockHint: 'gunners fire periodic sky-cannon AoE blasts',
    repeatHint: 'increases gunner hp and damage',
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
    unlockLabel: 'Super Rider',
    repeatLabel: '+Rider',
    unlockHint: 'rider hp x4, larger horse, stronger charge hit',
    repeatHint: 'increases rider hp and damage',
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
    unlockLabel: 'Gold Digger',
    repeatLabel: '+Digger',
    unlockHint: 'diggers seek and collect gold resources',
    repeatHint: 'increases digger hp and damage',
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
    unlockLabel: 'Healing Monk',
    repeatLabel: '+Monk',
    unlockHint: 'unlocks 10s monk healing pulse',
    repeatHint: 'increases monk hp and healing',
  },
  {
    unitType: 'stonegolem',
    specialType: 'stonegolem',
    upgradeType: 'stoneGolemAncientCoreLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 0.18,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.1,
      dmgMultPerLevel: 1.08,
    },
    unlockLabel: 'Ancient Golem',
    repeatLabel: '+Golem',
    unlockHint: 'summons a stone golem',
    repeatHint: 'increases golem hp and damage',
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
    unlockLabel: 'Dark Shield',
    repeatLabel: '+Shield',
    unlockHint: '10s cycle: 5s at 95% damage reduction',
    repeatHint: 'increases shield hp and push strength',
  },
  {
    unitType: 'hero',
    specialType: 'hero',
    upgradeType: 'heroDestinedChampionLevel',
    hasInitialUnlock: true,
    repeatEligible: true,
    baseOfferWeight: 0.18,
    repeatChancePerLevel: 0,
    repeatScaling: {
      hpMultPerLevel: 1.08,
      dmgMultPerLevel: 1.08,
    },
    unlockLabel: 'Champion Hero',
    repeatLabel: '+Hero',
    unlockHint: 'summons the hero',
    repeatHint: 'increases hero hp and damage',
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
    repeatLabel: '+President',
    unlockHint: 'first hit on marked allies only deals 10% damage',
    repeatHint: 'increases president hp and aura power',
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
    repeatLabel: '+Balloon',
    unlockHint: 'BA1 unlocks sky balloons',
    repeatHint: 'increases balloon hp and damage',
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
    repeatLabel: '+Dragon',
    unlockHint: 'DR1 unlocks dragons',
    repeatHint: 'increases dragon hp and damage',
  },
  {
    unitType: 'dragonSuperBreath',
    specialType: null,
    upgradeType: 'dragonSuperBreathLevel',
    hasInitialUnlock: true,
    repeatEligible: false,
    baseOfferWeight: 0.62,
    repeatChancePerLevel: 0,
    unlockLabel: 'Dragon Breath Burst',
    repeatLabel: 'Dragon Breath Burst',
    unlockHint: 'unlocks dragon cone breath burst (5s cycle)',
    repeatHint: 'unlocks dragon cone breath burst (5s cycle)',
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
    repeatLabel: '+Super',
    unlockHint: 'SU1 unlocks super minions',
    repeatHint: 'increases super minion hp and damage',
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
    repeatLabel: '+Candle',
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

export const SPECIAL_UNIT_UPGRADE_RULES_BY_SPECIAL_TYPE = Object.freeze(
  Object.fromEntries(
    SPECIAL_UNIT_UPGRADE_ENTRIES
      .filter((entry) => typeof entry.specialType === 'string' && entry.specialType)
      .map((entry) => [entry.specialType, Object.freeze({ ...entry })])
  )
);

export const REPEAT_SPECIAL_UPGRADE_TYPES = Object.freeze(
  SPECIAL_UNIT_UPGRADE_ENTRIES
    .filter((entry) => entry.repeatEligible && typeof entry.upgradeType === 'string' && entry.upgradeType)
    .map((entry) => entry.upgradeType)
);

export const SPECIAL_BUCKET_UPGRADE_TYPES = Object.freeze(
  SPECIAL_UNIT_UPGRADE_ENTRIES
    .filter((entry) => entry.hasInitialUnlock && typeof entry.upgradeType === 'string' && entry.upgradeType)
    .map((entry) => entry.upgradeType)
);

export function specialUnitUpgradeRuleForType(type) {
  return SPECIAL_UNIT_UPGRADE_RULES_BY_TYPE[type] || null;
}

export function specialUnitUpgradeRuleForUnit(unitType) {
  return SPECIAL_UNIT_UPGRADE_RULES[unitType] || null;
}

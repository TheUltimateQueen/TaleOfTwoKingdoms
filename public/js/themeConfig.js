export const THEME_MODE_THEMED = 'themed';
export const THEME_MODE_UNTHEMED = 'unthemed';
export const DEFAULT_THEME_MODE = THEME_MODE_THEMED;

const SIDE_DISPLAY_NAMES = {
  [THEME_MODE_UNTHEMED]: {
    left: 'West',
    right: 'East',
  },
  [THEME_MODE_THEMED]: {
    left: 'West Bread Empire',
    right: 'East Rice Empire',
  },
};

const SIDE_SHORT_NAMES = {
  [THEME_MODE_UNTHEMED]: {
    left: 'West',
    right: 'East',
  },
  [THEME_MODE_THEMED]: {
    left: 'West Bread',
    right: 'East Rice',
  },
};

const SIDE_CONTROLLER_LABELS = {
  [THEME_MODE_UNTHEMED]: {
    left: 'Blue (West)',
    right: 'Red (East)',
  },
  [THEME_MODE_THEMED]: {
    left: 'Golden Crust (West Bread, European)',
    right: 'Steamy Pearl (East Rice, Asian)',
  },
};

const DEFAULT_ARCHER_BASE_NAMES = {
  [THEME_MODE_UNTHEMED]: {
    left: 'West Archer',
    right: 'East Archer',
  },
  [THEME_MODE_THEMED]: {
    left: 'West Bread Slinger',
    right: 'East Rice Flinger',
  },
};

const DEFAULT_KEYBOARD_NAMES = {
  [THEME_MODE_UNTHEMED]: {
    left: 'West Keyboard',
    right: 'East Keyboard',
  },
  [THEME_MODE_THEMED]: {
    left: 'West Bread Keyboard',
    right: 'East Rice Keyboard',
  },
};

const UNIT_LABELS = {
  [THEME_MODE_UNTHEMED]: {
    militia: 'Militia',
    necro: 'Necro',
    necrominion: 'Necro',
    gunner: 'Gunner',
    rider: 'Rider',
    digger: 'Digger',
    monk: 'Monk',
    shield: 'Shield',
    hero: 'Hero',
    president: 'President',
    dragon: 'Dragon',
    balloon: 'Balloon',
    super: 'Super',
    candle: 'Candle',
    stonegolem: 'Golem',
    special: 'Special',
  },
  [THEME_MODE_THEMED]: {
    militia: 'Militia',
    necro: 'Necro',
    necrominion: 'Necro',
    gunner: 'Gunner',
    rider: 'Rider',
    digger: 'Digger',
    monk: 'Monk',
    shield: 'Shield',
    hero: 'Hero',
    president: 'President',
    dragon: 'Dragon',
    balloon: 'Balloon',
    super: 'Super',
    candle: 'Candle',
    stonegolem: 'Golem',
    special: 'Special',
  },
};

const HERO_LINES_UNTHEMED = [
  'Justice is my cardio!',
  'Hope you brought a villain permit!',
  'My cape has plot armor!',
  'Behold my dramatic entrance!',
  'I slash, therefore I am!',
  'Fear my perfectly timed monologue!',
];

const HERO_LINES_THEMED = {
  left: [
    'Crust first, questions later!',
    'I knead no backup!',
    'Fresh from the oven and ready!',
    'Bow before the Bread Blade!',
    'Carbs and chaos, lets go!',
    'I rise, therefore I roll!',
  ],
  right: [
    'You cannot out-steam me!',
    'Rice and shine, rivals!',
    'Polite warning: I am spicy.',
    'Sticky beats your crispy.',
    'Bow to the grain of destiny!',
    'I am one with the cooker!',
  ],
};

const PRESIDENT_LINES_UNTHEMED = [
  'Team, we are absolutely crushing this!',
  'Believe in yourselves and swing harder!',
  'Great units do great things together!',
  'No panic, just power and discipline!',
  'We came here to win this battlefield!',
  'Stay strong, stay sharp, stay united!',
];

const PRESIDENT_LINES_THEMED = {
  left: [
    'Bread council says: extra butter, extra bravery!',
    'No crumb left behind!',
    'Rise, troops, rise like dough!',
    'Tonight we dine in victory!',
    'Keep toasting, keep boasting!',
    'For loaf and glory!',
  ],
  right: [
    'Rice council approves this strategy.',
    'Stay fluffy, strike swiftly.',
    'Steam hard, fight harder.',
    'Every grain matters!',
    'Neat lines, clean wins.',
    'We serve victory hot!',
  ],
};

const HERO_DEATH_LINES_UNTHEMED = [
  'Tell my fans... I was fabulous!',
  'No sequel? This is a travesty!',
  'I regret... absolutely nothing!',
  'My agent said this was safe!',
  'Remember me in slow motion!',
  'This cape deserved better!',
];

const HERO_DEATH_LINES_THEMED = {
  left: [
    'Tell the bakery... I fought toasted!',
    'I have... gone stale...',
    'No! My heroic breadcrumbs!',
    'I regret not adding garlic!',
    'Avenge my sandwich legacy!',
    'My crust was too brave...',
  ],
  right: [
    'Scatter my grains with honor...',
    'I have become rice confetti...',
    'My cooker timer... has ended...',
    'Tell mother I was al dente!',
    'I fall with fluffy dignity.',
    'I should have worn sauce armor!',
  ],
};

const HERO_DEATH_ENCORE_LINES = {
  [THEME_MODE_UNTHEMED]: 'Cue the tragic violin solo!',
  [THEME_MODE_THEMED]: {
    left: 'Play the dramatic toaster anthem!',
    right: 'Play the sorrowful rice flute!',
  },
};

const HERO_SUMMON_LINES = {
  [THEME_MODE_UNTHEMED]: 'I will save the day.',
  [THEME_MODE_THEMED]: {
    left: 'The Bread Hero has preheated destiny!',
    right: 'The Rice Hero serves justice steaming!',
  },
};

const GOLEM_SUMMON_LINES = {
  [THEME_MODE_UNTHEMED]: 'Stone golem awakened!',
  [THEME_MODE_THEMED]: {
    left: 'West Bread golem awakened!',
    right: 'East Rice golem awakened!',
  },
};

const PRESIDENT_RALLY_LINES = {
  [THEME_MODE_UNTHEMED]: 'Citizens, we stand together!',
  [THEME_MODE_THEMED]: {
    left: 'Citizens, rally for the sacred loaf!',
    right: 'Citizens, rally for perfect rice!',
  },
};

export function normalizeThemeMode(value) {
  return value === THEME_MODE_UNTHEMED ? THEME_MODE_UNTHEMED : THEME_MODE_THEMED;
}

export function isThemedMode(value) {
  return normalizeThemeMode(value) === THEME_MODE_THEMED;
}

export function sideDisplayName(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  const sideName = side === 'right' ? 'right' : 'left';
  return SIDE_DISPLAY_NAMES[mode][sideName];
}

export function sideShortName(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  const sideName = side === 'right' ? 'right' : 'left';
  return SIDE_SHORT_NAMES[mode][sideName];
}

export function sideControllerLabel(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  const sideName = side === 'right' ? 'right' : 'left';
  return SIDE_CONTROLLER_LABELS[mode][sideName];
}

export function sideVictoryLabel(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  if (side !== 'left' && side !== 'right') {
    return mode === THEME_MODE_THEMED ? 'No Empire' : 'No Kingdom';
  }
  if (mode === THEME_MODE_THEMED) return sideDisplayName(side, mode);
  return `${sideDisplayName(side, mode)} Kingdom`;
}

export function sideBarracksLabel(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  const sideName = side === 'right' ? 'right' : 'left';
  if (mode === THEME_MODE_THEMED) {
    return sideName === 'left' ? 'Bread Pantry' : 'Rice Granary';
  }
  return sideName === 'left' ? 'West Barracks' : 'East Barracks';
}

export function defaultArcherName(side, slot = 0, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  const sideName = side === 'right' ? 'right' : 'left';
  const base = DEFAULT_ARCHER_BASE_NAMES[mode][sideName];
  return `${base} ${Math.max(1, Math.floor(Number(slot) || 0) + 1)}`;
}

export function defaultKeyboardName(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  const sideName = side === 'right' ? 'right' : 'left';
  return DEFAULT_KEYBOARD_NAMES[mode][sideName];
}

export function isDefaultPlayerName(name) {
  const value = String(name || '').trim();
  if (!value) return false;
  return (
    /^West Archer \d+$/i.test(value)
    || /^East Archer \d+$/i.test(value)
    || /^Bread Slinger \d+$/i.test(value)
    || /^Rice Flinger \d+$/i.test(value)
    || /^West Bread Slinger \d+$/i.test(value)
    || /^East Rice Flinger \d+$/i.test(value)
    || /^West Keyboard$/i.test(value)
    || /^East Keyboard$/i.test(value)
    || /^Bread Keyboard$/i.test(value)
    || /^Rice Keyboard$/i.test(value)
    || /^West Bread Keyboard$/i.test(value)
    || /^East Rice Keyboard$/i.test(value)
  );
}

export function unitLabel(type, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  const labels = UNIT_LABELS[mode];
  return labels[type] || labels.special;
}

export function heroBattleLines(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  if (mode === THEME_MODE_UNTHEMED) return HERO_LINES_UNTHEMED;
  return side === 'right' ? HERO_LINES_THEMED.right : HERO_LINES_THEMED.left;
}

export function presidentBattleLines(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  if (mode === THEME_MODE_UNTHEMED) return PRESIDENT_LINES_UNTHEMED;
  return side === 'right' ? PRESIDENT_LINES_THEMED.right : PRESIDENT_LINES_THEMED.left;
}

export function heroDeathLines(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  if (mode === THEME_MODE_UNTHEMED) return HERO_DEATH_LINES_UNTHEMED;
  return side === 'right' ? HERO_DEATH_LINES_THEMED.right : HERO_DEATH_LINES_THEMED.left;
}

export function heroDeathEncoreLine(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  if (mode === THEME_MODE_UNTHEMED) return HERO_DEATH_ENCORE_LINES[THEME_MODE_UNTHEMED];
  return side === 'right'
    ? HERO_DEATH_ENCORE_LINES[THEME_MODE_THEMED].right
    : HERO_DEATH_ENCORE_LINES[THEME_MODE_THEMED].left;
}

export function heroSummonLine(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  if (mode === THEME_MODE_UNTHEMED) return HERO_SUMMON_LINES[THEME_MODE_UNTHEMED];
  return side === 'right'
    ? HERO_SUMMON_LINES[THEME_MODE_THEMED].right
    : HERO_SUMMON_LINES[THEME_MODE_THEMED].left;
}

export function golemSummonLine(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  if (mode === THEME_MODE_UNTHEMED) return GOLEM_SUMMON_LINES[THEME_MODE_UNTHEMED];
  return side === 'right'
    ? GOLEM_SUMMON_LINES[THEME_MODE_THEMED].right
    : GOLEM_SUMMON_LINES[THEME_MODE_THEMED].left;
}

export function presidentRallyLine(side, themeMode = DEFAULT_THEME_MODE) {
  const mode = normalizeThemeMode(themeMode);
  if (mode === THEME_MODE_UNTHEMED) return PRESIDENT_RALLY_LINES[THEME_MODE_UNTHEMED];
  return side === 'right'
    ? PRESIDENT_RALLY_LINES[THEME_MODE_THEMED].right
    : PRESIDENT_RALLY_LINES[THEME_MODE_THEMED].left;
}

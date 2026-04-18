export const THEME_MODE_THEMED = 'themed';
export const DEFAULT_THEME_MODE = THEME_MODE_THEMED;

const SIDE_DISPLAY_NAMES = {
  left: 'West Bread Empire',
  right: 'East Rice Empire',
};

const SIDE_SHORT_NAMES = {
  left: 'West Bread',
  right: 'East Rice',
};

const SIDE_CONTROLLER_LABELS = {
  left: 'Golden Crust (West Bread, European)',
  right: 'Steamy Pearl (East Rice, Asian)',
};

const DEFAULT_ARCHER_BASE_NAMES = {
  left: 'West Bread Slinger',
  right: 'East Rice Flinger',
};

const DEFAULT_KEYBOARD_NAMES = {
  left: 'West Bread Keyboard',
  right: 'East Rice Keyboard',
};

const UNIT_LABELS = {
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
};

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
  left: 'Play the dramatic toaster anthem!',
  right: 'Play the sorrowful rice flute!',
};

const HERO_SUMMON_LINES = {
  left: 'The Bread Hero has preheated destiny!',
  right: 'The Rice Hero serves justice steaming!',
};

const GOLEM_SUMMON_LINES = {
  left: 'West Bread golem awakened!',
  right: 'East Rice golem awakened!',
};

const PRESIDENT_RALLY_LINES = {
  left: 'Citizens, rally for the sacred loaf!',
  right: 'Citizens, rally for perfect rice!',
};

export function normalizeThemeMode(_value) {
  return THEME_MODE_THEMED;
}

export function isThemedMode(_value) {
  return true;
}

export function sideDisplayName(side, _themeMode = DEFAULT_THEME_MODE) {
  const sideName = side === 'right' ? 'right' : 'left';
  return SIDE_DISPLAY_NAMES[sideName];
}

export function sideShortName(side, _themeMode = DEFAULT_THEME_MODE) {
  const sideName = side === 'right' ? 'right' : 'left';
  return SIDE_SHORT_NAMES[sideName];
}

export function sideControllerLabel(side, _themeMode = DEFAULT_THEME_MODE) {
  const sideName = side === 'right' ? 'right' : 'left';
  return SIDE_CONTROLLER_LABELS[sideName];
}

export function sideVictoryLabel(side, _themeMode = DEFAULT_THEME_MODE) {
  if (side !== 'left' && side !== 'right') return 'No Empire';
  return sideDisplayName(side);
}

export function sideBarracksLabel(side, _themeMode = DEFAULT_THEME_MODE) {
  return side === 'right' ? 'Rice Granary' : 'Bread Pantry';
}

export function defaultArcherName(side, slot = 0, _themeMode = DEFAULT_THEME_MODE) {
  const sideName = side === 'right' ? 'right' : 'left';
  const base = DEFAULT_ARCHER_BASE_NAMES[sideName];
  return `${base} ${Math.max(1, Math.floor(Number(slot) || 0) + 1)}`;
}

export function defaultKeyboardName(side, _themeMode = DEFAULT_THEME_MODE) {
  const sideName = side === 'right' ? 'right' : 'left';
  return DEFAULT_KEYBOARD_NAMES[sideName];
}

export function isDefaultPlayerName(name) {
  const value = String(name || '').trim();
  if (!value) return false;
  return (
    /^Bread Slinger \d+$/i.test(value)
    || /^Rice Flinger \d+$/i.test(value)
    || /^West Bread Slinger \d+$/i.test(value)
    || /^East Rice Flinger \d+$/i.test(value)
    || /^Bread Keyboard$/i.test(value)
    || /^Rice Keyboard$/i.test(value)
    || /^West Bread Keyboard$/i.test(value)
    || /^East Rice Keyboard$/i.test(value)
  );
}

export function unitLabel(type, _themeMode = DEFAULT_THEME_MODE) {
  return UNIT_LABELS[type] || UNIT_LABELS.special;
}

export function heroBattleLines(side, _themeMode = DEFAULT_THEME_MODE) {
  return side === 'right' ? HERO_LINES_THEMED.right : HERO_LINES_THEMED.left;
}

export function presidentBattleLines(side, _themeMode = DEFAULT_THEME_MODE) {
  return side === 'right' ? PRESIDENT_LINES_THEMED.right : PRESIDENT_LINES_THEMED.left;
}

export function heroDeathLines(side, _themeMode = DEFAULT_THEME_MODE) {
  return side === 'right' ? HERO_DEATH_LINES_THEMED.right : HERO_DEATH_LINES_THEMED.left;
}

export function heroDeathEncoreLine(side, _themeMode = DEFAULT_THEME_MODE) {
  return side === 'right' ? HERO_DEATH_ENCORE_LINES.right : HERO_DEATH_ENCORE_LINES.left;
}

export function heroSummonLine(side, _themeMode = DEFAULT_THEME_MODE) {
  return side === 'right' ? HERO_SUMMON_LINES.right : HERO_SUMMON_LINES.left;
}

export function golemSummonLine(side, _themeMode = DEFAULT_THEME_MODE) {
  return side === 'right' ? GOLEM_SUMMON_LINES.right : GOLEM_SUMMON_LINES.left;
}

export function presidentRallyLine(side, _themeMode = DEFAULT_THEME_MODE) {
  return side === 'right' ? PRESIDENT_RALLY_LINES.right : PRESIDENT_RALLY_LINES.left;
}

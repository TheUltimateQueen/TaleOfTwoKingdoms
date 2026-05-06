import { GameRoom as SimGameRoom } from './SimGameRoom.js';
import { UPGRADE_LABELS } from './constants.js';
import { UPGRADE_TYPES } from './simConstants.js';

const MAX_WORKERS_UI = 16;
const DEFAULT_WORKER_CAP = 8;
const RUNNING_STATUS_REFRESH_MS = 250;
const DEFAULT_AUTO_BALANCE_CYCLES = 4;
const DEFAULT_AUTO_BALANCE_STEP_PCT = 12;
const AUTO_BALANCE_CYCLE_MAX = 30;
const AUTO_BALANCE_STEP_MIN_PCT = 0.5;
const AUTO_BALANCE_STEP_MAX_PCT = 100;
const AUTO_BALANCE_CONFIDENCE_MATCHES = 60;
const AUTO_BALANCE_MIN_STEP_EDGE = 0.04;
const AUTO_BALANCE_MIN_STEP_CONFIDENCE = 0.12;
const PRICE_NUDGE_FACTOR_MIN = 0.75;
const PRICE_NUDGE_FACTOR_MAX = 1.25;
const COST_MULTIPLIER_MIN = 0.2;
const COST_MULTIPLIER_MAX = 5;
const UPGRADE_CODE = Object.freeze({
  unitLevel: 'UN',
  volleyLevel: 'VO',
  spawnLevel: 'SP',
  unitHpLevel: 'HP',
  resourceLevel: 'EC',
  powerLevel: 'PW',
  balloonLevel: 'BA',
  dragonLevel: 'DR',
  dragonSuperBreathLevel: 'SB',
  stoneGolemAncientCoreLevel: 'GO',
  heroDestinedChampionLevel: 'HE',
  shieldDarkMetalLevel: 'DM',
  monkHealCircleLevel: 'HC',
  necroExpertSummonerLevel: 'NE',
  riderSuperHorseLevel: 'RH',
  diggerGoldFinderLevel: 'GF',
  gunnerSkyCannonLevel: 'SC',
  presidentExecutiveOrderLevel: 'EO',
  superMinionLevel: 'SU',
});
const UPGRADE_ORDER = Object.freeze([...UPGRADE_TYPES]);

const dom = {
  modeInput: document.getElementById('simModeInput'),
  perUpgradeInput: document.getElementById('simPerUpgradeInput'),
  cardBiasMultInput: document.getElementById('simCardBiasMultInput'),
  baselineInput: document.getElementById('simBaselineInput'),
  workersInput: document.getElementById('simWorkersInput'),
  coreUpdateMsInput: document.getElementById('simCoreUpdateMsInput'),
  maxSecondsInput: document.getElementById('simMaxSecondsInput'),
  priceBoundsEnabledInput: document.getElementById('simPriceBoundsEnabledInput'),
  priceMinInput: document.getElementById('simPriceMinInput'),
  priceMaxInput: document.getElementById('simPriceMaxInput'),
  autoBalanceEnabledInput: document.getElementById('simAutoBalanceEnabledInput'),
  autoBalanceCyclesInput: document.getElementById('simAutoBalanceCyclesInput'),
  autoBalanceStepPctInput: document.getElementById('simAutoBalanceStepPctInput'),
  runContinueBtn: document.getElementById('simRunContinueBtn'),
  runFreshBtn: document.getElementById('simRunFreshBtn'),
  stopBtn: document.getElementById('simStopBtn'),
  statusText: document.getElementById('simStatusText'),
  autoBalanceText: document.getElementById('simAutoBalanceText'),
  cyclePriceChangeText: document.getElementById('simCyclePriceChangeText'),
  progressBar: document.getElementById('simProgressBar'),
  previewFormula: document.getElementById('simPreviewFormula'),
  previewUpgradeTypes: document.getElementById('simPreviewUpgradeTypes'),
  previewBaselineCycle: document.getElementById('simPreviewBaselineCycle'),
  previewUpgradeCycle: document.getElementById('simPreviewUpgradeCycle'),
  previewCycleTotal: document.getElementById('simPreviewCycleTotal'),
  previewCycles: document.getElementById('simPreviewCycles'),
  previewRunTotal: document.getElementById('simPreviewRunTotal'),
  priceSeedHint: document.getElementById('simPriceSeedHint'),
  copyAllTablesBtn: document.getElementById('simCopyAllTablesBtn'),
  copyAllTablesMsg: document.getElementById('simCopyAllTablesMsg'),
  copyUpgradeTableBtn: document.getElementById('simCopyUpgradeTableBtn'),
  copyUpgradeTableMsg: document.getElementById('simCopyUpgradeTableMsg'),
  copyMetaTableBtn: document.getElementById('simCopyMetaTableBtn'),
  copyMetaTableMsg: document.getElementById('simCopyMetaTableMsg'),
  summaryMatches: document.getElementById('simSummaryMatches'),
  summaryLeftRate: document.getElementById('simSummaryLeftRate'),
  summaryRightRate: document.getElementById('simSummaryRightRate'),
  summaryAvgDuration: document.getElementById('simSummaryAvgDuration'),
  summaryTimeouts: document.getElementById('simSummaryTimeouts'),
  summaryMinPrice: document.getElementById('simSummaryMinPrice'),
  summaryMaxPrice: document.getElementById('simSummaryMaxPrice'),
  upgradeRankTable: document.getElementById('simUpgradeRankTable'),
  metaRankTable: document.getElementById('simMetaRankTable'),
  upgradeRankBody: document.getElementById('simUpgradeRankBody'),
  metaRankBody: document.getElementById('simMetaRankBody'),
  coreGrid: document.getElementById('simCoreGrid'),
};

const state = {
  runId: 0,
  running: false,
  startedAtMs: 0,
  cycleStartedAtMs: 0,
  finishedAtMs: 0,
  queue: [],
  totalJobs: 0,
  completedJobs: 0,
  completedOverall: 0,
  jobsPerCycle: 0,
  totalPlannedJobs: 0,
  cycleIndex: 1,
  cycleTotal: 1,
  summary: null,
  suggestedPriceByType: null,
  currentUpgradePriceByType: null,
  baseUpgradePriceByType: null,
  activeCostMultipliersByType: null,
  cycleLogs: [],
  config: null,
  workers: new Map(),
  activeJobs: new Map(),
  coreState: new Map(),
  coreEls: new Map(),
  baselineCacheByMode: new Map(),
  modeDefaultsByMode: new Map(),
  priceByMode: new Map(),
  runSeedMode: 'continue',
  lastCyclePriceDelta: null,
  statusMessage: 'Ready.',
  statusTimer: null,
};
const copyMessageTimers = new WeakMap();

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function clampFloat(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function normalizeMode(value) {
  return value === '2v2' ? '2v2' : '1v1';
}

function formatPercent(value) {
  if (!Number.isFinite(value)) return '0.0%';
  return `${(value * 100).toFixed(1)}%`;
}

function formatSeconds(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.0s';
  return `${n.toFixed(1)}s`;
}

function formatWhole(value) {
  const n = Math.max(0, Math.floor(Number(value) || 0));
  return n.toLocaleString();
}

function formatEta(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)}h`;
  if (seconds >= 60) return `${(seconds / 60).toFixed(1)}m`;
  return `${seconds.toFixed(0)}s`;
}

function upgradeLabel(type) {
  return UPGRADE_LABELS[type] || type;
}

function defaultWorkerCount() {
  const raw = Number(navigator.hardwareConcurrency) || 4;
  return Math.max(1, Math.min(DEFAULT_WORKER_CAP, Math.floor(raw)));
}

function createSummary() {
  const upgrade = {};
  const meta = {};
  for (const type of UPGRADE_ORDER) {
    upgrade[type] = {
      matches: 0,
      biasedWins: 0,
      leftBiasMatches: 0,
      leftBiasWins: 0,
      rightBiasMatches: 0,
      rightBiasWins: 0,
      durationSum: 0,
      timedOut: 0,
    };
    meta[type] = {
      samples: 0,
      wins: 0,
      gapSum: 0,
    };
  }
  return {
    matches: 0,
    leftWins: 0,
    rightWins: 0,
    durationSum: 0,
    timedOut: 0,
    baseline: {
      matches: 0,
      leftWins: 0,
      rightWins: 0,
    },
    upgrade,
    meta,
  };
}

function deriveBaselineLevelsByMode(mode = '1v1') {
  const normalizedMode = normalizeMode(mode);
  const cached = state.baselineCacheByMode.get(normalizedMode);
  if (cached) return { ...cached };

  const room = new SimGameRoom(`BASE-${normalizedMode}`, '', { mode: normalizedMode });
  const levels = {};
  for (const type of UPGRADE_ORDER) {
    levels[type] = Math.max(0, Math.floor(Number(room.left?.[type]) || 0));
  }
  state.baselineCacheByMode.set(normalizedMode, { ...levels });
  return levels;
}

function levelArrayFromMap(levelsByType = {}) {
  return UPGRADE_ORDER.map((type) => Math.max(0, Math.floor(Number(levelsByType?.[type]) || 0)));
}

function deriveUpgradePriceByMode(mode = '1v1', baselineLevelsByType = null) {
  const normalizedMode = normalizeMode(mode);
  const levels = baselineLevelsByType || deriveBaselineLevelsByMode(normalizedMode);
  const room = new SimGameRoom(`PRICE-${normalizedMode}`, '', { mode: normalizedMode });
  const prices = {};
  for (const type of UPGRADE_ORDER) {
    const simulatedSide = {
      ...room.left,
      [type]: Math.max(0, Math.floor(Number(levels?.[type]) || 0)),
    };
    prices[type] = Math.max(1, Math.round(Number(room.upgradeCost(simulatedSide, type)) || 0));
  }
  return prices;
}

function shuffleInPlace(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}

function createJobs(config) {
  let nextId = 1;
  const jobs = [];
  for (let i = 0; i < config.baselineSims; i += 1) {
    jobs.push({
      id: nextId++,
      kind: 'baseline',
    });
  }
  for (const type of UPGRADE_ORDER) {
    for (const side of ['left', 'right']) {
      for (let i = 0; i < config.perUpgradePerSide; i += 1) {
        jobs.push({
          id: nextId++,
          kind: 'upgrade',
          upgradeType: type,
          biasedSide: side,
        });
      }
    }
  }
  return shuffleInPlace(jobs);
}

function clonePriceMap(source = {}) {
  const copy = {};
  for (const type of UPGRADE_ORDER) {
    const value = Math.round(Number(source?.[type]) || 0);
    copy[type] = Math.max(1, value || 1);
  }
  return copy;
}

function priceRangeFromMap(priceMap = {}) {
  let min = Infinity;
  let max = -Infinity;
  for (const type of UPGRADE_ORDER) {
    const value = Math.max(1, Math.round(Number(priceMap?.[type]) || 0));
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 1, max: 1 };
  return { min, max };
}

function deriveModePriceDefaults(mode = '1v1') {
  const normalizedMode = normalizeMode(mode);
  const cached = state.modeDefaultsByMode.get(normalizedMode);
  if (cached) {
    return {
      mode: normalizedMode,
      baselineLevelsByType: { ...cached.baselineLevelsByType },
      upgradePriceByType: { ...cached.upgradePriceByType },
      minPrice: cached.minPrice,
      maxPrice: cached.maxPrice,
    };
  }
  const baselineLevelsByType = deriveBaselineLevelsByMode(normalizedMode);
  const upgradePriceByType = deriveUpgradePriceByMode(normalizedMode, baselineLevelsByType);
  const range = priceRangeFromMap(upgradePriceByType);
  const defaults = {
    mode: normalizedMode,
    baselineLevelsByType,
    upgradePriceByType,
    minPrice: range.min,
    maxPrice: range.max,
  };
  state.modeDefaultsByMode.set(normalizedMode, {
    mode: normalizedMode,
    baselineLevelsByType: { ...baselineLevelsByType },
    upgradePriceByType: { ...upgradePriceByType },
    minPrice: range.min,
    maxPrice: range.max,
  });
  return defaults;
}

function applyModePriceDefaults(mode = '1v1') {
  const defaults = deriveModePriceDefaults(mode);
  if (dom.priceMinInput) dom.priceMinInput.value = String(defaults.minPrice);
  if (dom.priceMaxInput) dom.priceMaxInput.value = String(defaults.maxPrice);
  return defaults;
}

function createCostMultiplierMap(priceByType = {}, basePriceByType = {}) {
  const multipliers = {};
  for (const type of UPGRADE_ORDER) {
    const price = Math.max(1, Math.round(Number(priceByType?.[type]) || 0));
    const base = Math.max(1, Math.round(Number(basePriceByType?.[type]) || 0));
    const raw = price / base;
    multipliers[type] = clampFloat(raw, COST_MULTIPLIER_MIN, COST_MULTIPLIER_MAX, 1);
  }
  return multipliers;
}

function withMinStepFallback(currentPrice, suggestedPrice, edge, confidence, config = null) {
  const current = Math.max(1, Math.round(Number(currentPrice) || 0));
  let suggested = Math.max(1, Math.round(Number(suggestedPrice) || 0));
  if (suggested !== current) return suggested;
  if (Math.abs(edge) < AUTO_BALANCE_MIN_STEP_EDGE) return suggested;
  if (confidence < AUTO_BALANCE_MIN_STEP_CONFIDENCE) return suggested;
  suggested = current + (edge > 0 ? 1 : -1);
  if (config?.priceBoundsEnabled) {
    suggested = clampInt(suggested, config.priceMin, config.priceMax, suggested);
  }
  return Math.max(1, suggested);
}

function suggestPriceMapFromUpgradeStats(summary, currentPriceByType = {}, config = null) {
  const next = clonePriceMap(currentPriceByType);
  if (!summary || !summary.upgrade) return next;
  const strength = clampFloat(
    Number(config?.autoBalanceStep) || (DEFAULT_AUTO_BALANCE_STEP_PCT / 100),
    AUTO_BALANCE_STEP_MIN_PCT / 100,
    AUTO_BALANCE_STEP_MAX_PCT / 100,
    DEFAULT_AUTO_BALANCE_STEP_PCT / 100
  );
  for (const type of UPGRADE_ORDER) {
    const stat = summary.upgrade[type];
    const matches = Math.max(0, Number(stat?.matches) || 0);
    if (matches <= 0) continue;
    const winRate = (Number(stat?.biasedWins) || 0) / matches;
    const edge = winRate - 0.5;
    const confidence = clampFloat(matches / AUTO_BALANCE_CONFIDENCE_MATCHES, 0, 1, 0);
    const nudgeFactor = clampFloat(
      1 + (edge * 2 * strength * confidence),
      PRICE_NUDGE_FACTOR_MIN,
      PRICE_NUDGE_FACTOR_MAX,
      1
    );
    const current = Math.max(1, Math.round(Number(next[type]) || 1));
    let suggested = Math.round(current * nudgeFactor);
    if (config?.priceBoundsEnabled) {
      suggested = clampInt(suggested, config.priceMin, config.priceMax, suggested);
    }
    suggested = withMinStepFallback(current, suggested, edge, confidence, config);
    next[type] = Math.max(1, suggested);
  }
  return next;
}

function suggestPriceMapFromMetaStats(summary, currentPriceByType = {}, config = null) {
  const next = clonePriceMap(currentPriceByType);
  if (!summary || !summary.meta) return next;
  const strength = clampFloat(
    Number(config?.autoBalanceStep) || (DEFAULT_AUTO_BALANCE_STEP_PCT / 100),
    AUTO_BALANCE_STEP_MIN_PCT / 100,
    AUTO_BALANCE_STEP_MAX_PCT / 100,
    DEFAULT_AUTO_BALANCE_STEP_PCT / 100
  );
  for (const type of UPGRADE_ORDER) {
    const stat = summary.meta[type];
    const samples = Math.max(0, Number(stat?.samples) || 0);
    if (samples <= 0) continue;
    const winRate = (Number(stat?.wins) || 0) / samples;
    const edge = winRate - 0.5;
    const confidence = clampFloat(samples / AUTO_BALANCE_CONFIDENCE_MATCHES, 0, 1, 0);
    const nudgeFactor = clampFloat(
      1 + (edge * 2 * strength * confidence),
      PRICE_NUDGE_FACTOR_MIN,
      PRICE_NUDGE_FACTOR_MAX,
      1
    );
    const current = Math.max(1, Math.round(Number(next[type]) || 1));
    let suggested = Math.round(current * nudgeFactor);
    if (config?.priceBoundsEnabled) {
      suggested = clampInt(suggested, config.priceMin, config.priceMax, suggested);
    }
    suggested = withMinStepFallback(current, suggested, edge, confidence, config);
    next[type] = Math.max(1, suggested);
  }
  return next;
}

function clampPriceMapToBounds(priceByType = {}, config = null) {
  const clamped = clonePriceMap(priceByType);
  if (!config?.priceBoundsEnabled) return clamped;
  const min = Math.max(1, Math.round(Number(config.priceMin) || 1));
  const max = Math.max(min, Math.round(Number(config.priceMax) || min));
  for (const type of UPGRADE_ORDER) {
    clamped[type] = clampInt(clamped[type], min, max, clamped[type]);
  }
  return clamped;
}

function resolvedPriceMapForMode(mode = '1v1', fallbackMap = {}) {
  const normalizedMode = normalizeMode(mode);
  if (state.running && state.config?.mode === normalizedMode && state.currentUpgradePriceByType) {
    return clonePriceMap(state.currentUpgradePriceByType);
  }
  const saved = state.priceByMode.get(normalizedMode);
  if (saved) return clonePriceMap(saved);
  return clonePriceMap(fallbackMap);
}

function readConfigFromUi() {
  const modeDefaults = deriveModePriceDefaults(normalizeMode(dom.modeInput?.value));
  const mode = modeDefaults.mode;
  const perUpgradePerSide = clampInt(dom.perUpgradeInput?.value, 1, 500, 6);
  const cardBiasMultiplierRaw = Number(dom.cardBiasMultInput?.value);
  const cardBiasMultiplier = Number.isFinite(cardBiasMultiplierRaw)
    ? Math.max(0, Math.min(50, cardBiasMultiplierRaw))
    : 2;
  const baselineSims = clampInt(dom.baselineInput?.value, 0, 3000, 60);
  const workers = clampInt(dom.workersInput?.value, 1, MAX_WORKERS_UI, defaultWorkerCount());
  const emitIntervalMs = clampInt(dom.coreUpdateMsInput?.value, 80, 5000, 240);
  const maxMatchSeconds = clampInt(dom.maxSecondsInput?.value, 120, 7200, 900);
  const autoBalanceEnabled = Boolean(dom.autoBalanceEnabledInput?.checked);
  const autoBalanceCycles = autoBalanceEnabled
    ? clampInt(dom.autoBalanceCyclesInput?.value, 1, AUTO_BALANCE_CYCLE_MAX, DEFAULT_AUTO_BALANCE_CYCLES)
    : 1;
  const autoBalanceStepPct = clampFloat(
    dom.autoBalanceStepPctInput?.value,
    AUTO_BALANCE_STEP_MIN_PCT,
    AUTO_BALANCE_STEP_MAX_PCT,
    DEFAULT_AUTO_BALANCE_STEP_PCT
  );
  const priceBoundsEnabled = Boolean(dom.priceBoundsEnabledInput?.checked);
  const fallbackMin = Math.max(1, modeDefaults.minPrice);
  const fallbackMax = Math.max(fallbackMin, modeDefaults.maxPrice);
  let priceMin = clampInt(dom.priceMinInput?.value, 1, 9999, fallbackMin);
  let priceMax = clampInt(dom.priceMaxInput?.value, 1, 9999, fallbackMax);
  if (priceMin > priceMax) {
    const tmp = priceMin;
    priceMin = priceMax;
    priceMax = tmp;
  }
  if (dom.priceMinInput) dom.priceMinInput.value = String(priceMin);
  if (dom.priceMaxInput) dom.priceMaxInput.value = String(priceMax);

  const baselineLevelsByType = modeDefaults.baselineLevelsByType;
  const baselineLevelArray = levelArrayFromMap(baselineLevelsByType);
  const upgradePriceByType = modeDefaults.upgradePriceByType;
  return {
    mode,
    perUpgradePerSide,
    cardBiasMultiplier,
    baselineSims,
    workers,
    emitIntervalMs,
    maxMatchSeconds,
    autoBalanceEnabled,
    autoBalanceCycles,
    autoBalanceStepPct,
    autoBalanceStep: autoBalanceStepPct / 100,
    priceBoundsEnabled,
    priceMin,
    priceMax,
    baselineLevelsByType,
    baselineLevelArray,
    upgradePriceByType,
  };
}

function renderRunSizingPreview() {
  const mode = normalizeMode(dom.modeInput?.value);
  const perUpgradePerSide = clampInt(dom.perUpgradeInput?.value, 1, 500, 6);
  const baselineSims = clampInt(dom.baselineInput?.value, 0, 3000, 60);
  const autoBalanceEnabled = Boolean(dom.autoBalanceEnabledInput?.checked);
  const cycles = autoBalanceEnabled
    ? clampInt(dom.autoBalanceCyclesInput?.value, 1, AUTO_BALANCE_CYCLE_MAX, DEFAULT_AUTO_BALANCE_CYCLES)
    : 1;
  const upgradeTypeCount = UPGRADE_ORDER.length;
  const upgradeSweepPerCycle = upgradeTypeCount * 2 * perUpgradePerSide;
  const totalPerCycle = baselineSims + upgradeSweepPerCycle;
  const totalMatches = totalPerCycle * cycles;
  if (dom.previewFormula) {
    dom.previewFormula.textContent = `Total = (${formatWhole(baselineSims)} baseline + (${formatWhole(upgradeTypeCount)} upgrades x 2 sides x ${formatWhole(perUpgradePerSide)})) x ${formatWhole(cycles)} = ${formatWhole(totalMatches)}`;
  }
  if (dom.previewUpgradeTypes) dom.previewUpgradeTypes.textContent = formatWhole(upgradeTypeCount);
  if (dom.previewBaselineCycle) dom.previewBaselineCycle.textContent = formatWhole(baselineSims);
  if (dom.previewUpgradeCycle) dom.previewUpgradeCycle.textContent = formatWhole(upgradeSweepPerCycle);
  if (dom.previewCycleTotal) dom.previewCycleTotal.textContent = formatWhole(totalPerCycle);
  if (dom.previewCycles) dom.previewCycles.textContent = formatWhole(cycles);
  if (dom.previewRunTotal) dom.previewRunTotal.textContent = formatWhole(totalMatches);
  const hasSaved = state.priceByMode.has(mode);
  const modeLabel = mode === '2v2' ? '2v2' : '1v1';
  if (dom.priceSeedHint) {
    if (state.runSeedMode === 'fresh') {
      dom.priceSeedHint.textContent = `Fresh run selected: starts ${modeLabel} from default prices.`;
    } else if (hasSaved) {
      dom.priceSeedHint.textContent = `Continue selected: starts ${modeLabel} from last saved balanced prices.`;
    } else {
      dom.priceSeedHint.textContent = `Continue selected: no saved ${modeLabel} prices yet, so this run starts from defaults.`;
    }
  }
}

function setControlsRunning(running) {
  if (dom.runContinueBtn) dom.runContinueBtn.disabled = running;
  if (dom.runFreshBtn) dom.runFreshBtn.disabled = running;
  if (dom.stopBtn) dom.stopBtn.disabled = !running;
  const disabled = running;
  if (dom.modeInput) dom.modeInput.disabled = disabled;
  if (dom.perUpgradeInput) dom.perUpgradeInput.disabled = disabled;
  if (dom.cardBiasMultInput) dom.cardBiasMultInput.disabled = disabled;
  if (dom.baselineInput) dom.baselineInput.disabled = disabled;
  if (dom.workersInput) dom.workersInput.disabled = disabled;
  if (dom.coreUpdateMsInput) dom.coreUpdateMsInput.disabled = disabled;
  if (dom.maxSecondsInput) dom.maxSecondsInput.disabled = disabled;
  if (dom.priceBoundsEnabledInput) dom.priceBoundsEnabledInput.disabled = disabled;
  if (dom.autoBalanceEnabledInput) dom.autoBalanceEnabledInput.disabled = disabled;
  if (dom.priceMinInput) dom.priceMinInput.disabled = disabled;
  if (dom.priceMaxInput) dom.priceMaxInput.disabled = disabled;
  if (dom.autoBalanceCyclesInput) dom.autoBalanceCyclesInput.disabled = disabled;
  if (dom.autoBalanceStepPctInput) dom.autoBalanceStepPctInput.disabled = disabled;
  syncOptionalControlState();
}

function syncOptionalControlState() {
  if (state.running) return;
  const autoOn = Boolean(dom.autoBalanceEnabledInput?.checked);
  if (dom.autoBalanceCyclesInput) dom.autoBalanceCyclesInput.disabled = !autoOn;
  if (dom.autoBalanceStepPctInput) dom.autoBalanceStepPctInput.disabled = !autoOn;
}

function setRunSeedMode(mode = 'continue') {
  state.runSeedMode = mode === 'fresh' ? 'fresh' : 'continue';
  renderRunSizingPreview();
}

function workerJobLabel(job = null) {
  if (!job) return 'Idle';
  if (job.kind === 'upgrade') {
    const side = job.biasedSide === 'right' ? 'right' : 'left';
    return `Upgrade: ${upgradeLabel(job.upgradeType)} (${side} bias)`;
  }
  return 'Baseline CPU vs CPU';
}

function formatUpgradeDelta(levelArray, baselineArray) {
  if (!Array.isArray(levelArray)) return 'none';
  const bits = [];
  for (let idx = 0; idx < UPGRADE_ORDER.length; idx += 1) {
    const current = Math.max(0, Math.floor(Number(levelArray[idx]) || 0));
    const baseline = Math.max(0, Math.floor(Number(baselineArray?.[idx]) || 0));
    if (current <= baseline) continue;
    const code = UPGRADE_CODE[UPGRADE_ORDER[idx]] || `U${idx + 1}`;
    bits.push(`${code}${current}`);
  }
  if (!bits.length) return 'base only';
  return bits.slice(0, 8).join(' ');
}

function createCoreCard(workerId) {
  const card = document.createElement('article');
  card.className = 'sim-core-card';
  card.dataset.workerId = String(workerId);

  const head = document.createElement('header');
  head.className = 'sim-core-head';
  const title = document.createElement('h3');
  title.textContent = `Core ${workerId + 1}`;
  const statePill = document.createElement('span');
  statePill.className = 'sim-core-state idle';
  statePill.textContent = 'Idle';
  head.append(title, statePill);

  const doneLine = document.createElement('p');
  doneLine.className = 'sim-core-line';
  doneLine.textContent = 'Completed: 0';

  const jobLine = document.createElement('p');
  jobLine.className = 'sim-core-line';
  jobLine.textContent = 'Job: Idle';

  const timeLine = document.createElement('p');
  timeLine.className = 'sim-core-line';
  timeLine.textContent = 'Sim: 0.0s | Tick: 0';

  const hpLine = document.createElement('p');
  hpLine.className = 'sim-core-line';
  hpLine.textContent = 'HP L 0 | R 0';

  const goldLine = document.createElement('p');
  goldLine.className = 'sim-core-line';
  goldLine.textContent = 'Gold L 0 | R 0';

  const leftUp = document.createElement('p');
  leftUp.className = 'sim-core-upgrades left';
  leftUp.textContent = 'L+: base only';

  const rightUp = document.createElement('p');
  rightUp.className = 'sim-core-upgrades right';
  rightUp.textContent = 'R+: base only';

  card.append(head, doneLine, jobLine, timeLine, hpLine, goldLine, leftUp, rightUp);
  return {
    card,
    statePill,
    doneLine,
    jobLine,
    timeLine,
    hpLine,
    goldLine,
    leftUp,
    rightUp,
  };
}

function buildCoreGrid(workerCount) {
  if (!dom.coreGrid) return;
  dom.coreGrid.innerHTML = '';
  state.coreState.clear();
  state.coreEls.clear();
  for (let workerId = 0; workerId < workerCount; workerId += 1) {
    state.coreState.set(workerId, {
      status: 'idle',
      completed: 0,
      job: null,
      frame: null,
      errored: false,
    });
    const els = createCoreCard(workerId);
    dom.coreGrid.appendChild(els.card);
    state.coreEls.set(workerId, els);
  }
}

function renderCoreCard(workerId) {
  const core = state.coreState.get(workerId);
  const els = state.coreEls.get(workerId);
  if (!core || !els) return;

  const status = core.errored
    ? 'Error'
    : core.status === 'running'
      ? 'Running'
      : 'Idle';
  els.statePill.textContent = status;
  els.statePill.classList.toggle('running', core.status === 'running');
  els.statePill.classList.toggle('idle', core.status !== 'running');
  els.statePill.classList.toggle('error', core.errored);
  els.doneLine.textContent = `Completed: ${core.completed}`;
  els.jobLine.textContent = `Job: ${workerJobLabel(core.job)}`;

  const frame = core.frame || null;
  if (!frame) {
    els.timeLine.textContent = 'Sim: 0.0s | Tick: 0';
    els.hpLine.textContent = 'HP L 0 | R 0';
    els.goldLine.textContent = 'Gold L 0 | R 0';
    els.leftUp.textContent = 'L+: base only';
    els.rightUp.textContent = 'R+: base only';
    return;
  }

  els.timeLine.textContent = `Sim: ${formatSeconds(frame.simSeconds)} | Tick: ${Math.max(0, Math.floor(Number(frame.tick) || 0))}`;
  els.hpLine.textContent = `HP L ${Math.round(Number(frame.leftTowerHp) || 0)} | R ${Math.round(Number(frame.rightTowerHp) || 0)}`;
  els.goldLine.textContent = `Gold L ${Math.round(Number(frame.leftGold) || 0)} | R ${Math.round(Number(frame.rightGold) || 0)}`;
  els.leftUp.textContent = `L+: ${formatUpgradeDelta(frame.leftLevels, state.config?.baselineLevelArray || [])}`;
  els.rightUp.textContent = `R+: ${formatUpgradeDelta(frame.rightLevels, state.config?.baselineLevelArray || [])}`;
}

function refreshAllCoreCards() {
  for (const workerId of state.coreState.keys()) renderCoreCard(workerId);
}

function refreshStatusLine() {
  if (!dom.statusText) return;
  if (!state.running) {
    dom.statusText.textContent = state.statusMessage || 'Ready.';
    return;
  }
  const elapsedSec = Math.max(0.001, (performance.now() - state.startedAtMs) / 1000);
  const completed = Math.max(0, state.completedOverall);
  const total = Math.max(1, state.totalPlannedJobs || state.totalJobs);
  const active = state.activeJobs.size;
  const rate = completed / elapsedSec;
  const remaining = Math.max(0, total - completed);
  const etaSec = rate > 0 ? remaining / rate : Infinity;
  const pct = Math.min(100, (completed / total) * 100);
  const cycleLabel = state.cycleTotal > 1
    ? `Cycle ${state.cycleIndex}/${state.cycleTotal}. `
    : '';
  dom.statusText.textContent = `${cycleLabel}Running ${completed}/${total} matches (${pct.toFixed(1)}%). ${rate.toFixed(2)} matches/s. ETA ${formatEta(etaSec)}. Active cores ${active}/${state.config?.workers || 1}.`;
}

function startStatusTicker() {
  stopStatusTicker();
  state.statusTimer = window.setInterval(() => {
    refreshStatusLine();
  }, RUNNING_STATUS_REFRESH_MS);
}

function stopStatusTicker() {
  if (state.statusTimer != null) {
    window.clearInterval(state.statusTimer);
    state.statusTimer = null;
  }
}

function setProgress() {
  if (!dom.progressBar) return;
  const max = Math.max(1, state.totalPlannedJobs || state.totalJobs || 1);
  const value = state.running
    ? Math.max(0, state.completedOverall || 0)
    : Math.max(0, state.completedOverall || state.completedJobs || 0);
  dom.progressBar.max = max;
  dom.progressBar.value = Math.min(max, value);
}

function updateSummary(result) {
  if (!state.summary) return;
  const summary = state.summary;
  summary.matches += 1;
  summary.durationSum += Math.max(0, Number(result?.durationSeconds) || 0);
  if (result?.winner === 'right') summary.rightWins += 1;
  else summary.leftWins += 1;
  if (result?.timedOut) summary.timedOut += 1;

  if (result?.kind === 'baseline') {
    summary.baseline.matches += 1;
    if (result?.winner === 'right') summary.baseline.rightWins += 1;
    else summary.baseline.leftWins += 1;
    const leftLevels = Array.isArray(result.leftLevels) ? result.leftLevels : [];
    const rightLevels = Array.isArray(result.rightLevels) ? result.rightLevels : [];
    for (let idx = 0; idx < UPGRADE_ORDER.length; idx += 1) {
      const type = UPGRADE_ORDER[idx];
      const left = Math.max(0, Math.floor(Number(leftLevels[idx]) || 0));
      const right = Math.max(0, Math.floor(Number(rightLevels[idx]) || 0));
      if (left === right) continue;
      const stat = summary.meta[type];
      stat.samples += 1;
      stat.gapSum += Math.abs(left - right);
      if ((left > right && result.winner === 'left') || (right > left && result.winner === 'right')) {
        stat.wins += 1;
      }
    }
    return;
  }

  if (result?.kind === 'upgrade' && result?.upgradeType && summary.upgrade[result.upgradeType]) {
    const stat = summary.upgrade[result.upgradeType];
    stat.matches += 1;
    stat.durationSum += Math.max(0, Number(result?.durationSeconds) || 0);
    if (result?.timedOut) stat.timedOut += 1;
    if (result?.biasedWon) stat.biasedWins += 1;
    const side = result?.biasedSide === 'right' ? 'right' : 'left';
    if (side === 'left') {
      stat.leftBiasMatches += 1;
      if (result?.winner === 'left') stat.leftBiasWins += 1;
    } else {
      stat.rightBiasMatches += 1;
      if (result?.winner === 'right') stat.rightBiasWins += 1;
    }
  }
}

function renderSummary() {
  const summary = state.summary || createSummary();
  const matches = Math.max(0, summary.matches);
  const leftRate = matches > 0 ? summary.leftWins / matches : 0;
  const rightRate = matches > 0 ? summary.rightWins / matches : 0;
  const avgDuration = matches > 0 ? (summary.durationSum / matches) : 0;
  const mode = normalizeMode(dom.modeInput?.value);
  const modeDefaults = deriveModePriceDefaults(mode);
  const activePriceMap = resolvedPriceMapForMode(mode, modeDefaults.upgradePriceByType);
  const range = priceRangeFromMap(activePriceMap);
  if (dom.summaryMatches) dom.summaryMatches.textContent = String(matches);
  if (dom.summaryLeftRate) dom.summaryLeftRate.textContent = formatPercent(leftRate);
  if (dom.summaryRightRate) dom.summaryRightRate.textContent = formatPercent(rightRate);
  if (dom.summaryAvgDuration) dom.summaryAvgDuration.textContent = formatSeconds(avgDuration);
  if (dom.summaryTimeouts) dom.summaryTimeouts.textContent = String(Math.max(0, summary.timedOut));
  if (dom.summaryMinPrice) dom.summaryMinPrice.textContent = String(range.min);
  if (dom.summaryMaxPrice) dom.summaryMaxPrice.textContent = String(range.max);
}

function renderAutoBalanceText() {
  if (!dom.autoBalanceText) return;
  if (state.running) {
    if (state.config?.autoBalanceEnabled) {
      const lastNote = state.cycleLogs[state.cycleLogs.length - 1] || null;
      const suffix = lastNote ? ` ${lastNote}` : '';
      dom.autoBalanceText.textContent = `Auto-balance ON. Cycle ${state.cycleIndex}/${state.cycleTotal}.${suffix}`;
      return;
    }
    dom.autoBalanceText.textContent = 'Auto-balance is off for this run.';
    return;
  }
  dom.autoBalanceText.textContent = dom.autoBalanceEnabledInput?.checked
    ? 'Auto-balance ready. Run sweep to iterate price tuning.'
    : 'Auto-balance is off.';
}

function renderCyclePriceChangeText() {
  if (!dom.cyclePriceChangeText) return;
  const delta = state.lastCyclePriceDelta || null;
  if (!delta) {
    dom.cyclePriceChangeText.textContent = 'Cycle price change summary will appear here during auto-balance.';
    return;
  }
  dom.cyclePriceChangeText.textContent = `Last cycle price changes: ${delta.changed} upgrades changed, total delta ${delta.totalDelta >= 0 ? '+' : ''}${delta.totalDelta}, max single change ${delta.maxAbsDelta}.`;
}

function renderUpgradeRankTable() {
  if (!dom.upgradeRankBody) return;
  const summary = state.summary;
  const mode = normalizeMode(dom.modeInput?.value);
  const modeDefaults = deriveModePriceDefaults(mode);
  const priceMap = resolvedPriceMapForMode(mode, modeDefaults.upgradePriceByType);
  const suggestedMap = suggestPriceMapFromUpgradeStats(summary, priceMap, state.config || null);
  if (!summary) {
    dom.upgradeRankBody.innerHTML = '<tr><td colspan="9">Run a simulation to populate upgrade rankings.</td></tr>';
    return;
  }

  const rows = UPGRADE_ORDER.map((type) => {
    const stat = summary.upgrade[type];
    const matches = Math.max(0, stat.matches);
    const biasedRate = matches > 0 ? stat.biasedWins / matches : 0;
    const leftRate = stat.leftBiasMatches > 0 ? stat.leftBiasWins / stat.leftBiasMatches : 0;
    const rightRate = stat.rightBiasMatches > 0 ? stat.rightBiasWins / stat.rightBiasMatches : 0;
    const avgDuration = matches > 0 ? stat.durationSum / matches : 0;
    return {
      type,
      label: upgradeLabel(type),
      goldPrice: Math.max(1, Math.round(Number(priceMap?.[type]) || 0)),
      suggestedPrice: Math.max(1, Math.round(Number(suggestedMap?.[type]) || 0)),
      matches,
      biasedRate,
      leftRate,
      rightRate,
      avgDuration,
    };
  }).sort((a, b) => {
    if (b.biasedRate !== a.biasedRate) return b.biasedRate - a.biasedRate;
    if (b.matches !== a.matches) return b.matches - a.matches;
    return a.label.localeCompare(b.label);
  });

  const html = [];
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    html.push(
      `<tr>
        <td>${i + 1}</td>
        <td>${row.label}</td>
        <td>${row.goldPrice}</td>
        <td>${row.suggestedPrice}</td>
        <td>${formatPercent(row.biasedRate)}</td>
        <td>${row.matches}</td>
        <td>${formatPercent(row.leftRate)}</td>
        <td>${formatPercent(row.rightRate)}</td>
        <td>${formatSeconds(row.avgDuration)}</td>
      </tr>`
    );
  }
  dom.upgradeRankBody.innerHTML = html.join('');
}

function renderMetaRankTable() {
  if (!dom.metaRankBody) return;
  const summary = state.summary;
  const mode = normalizeMode(dom.modeInput?.value);
  const modeDefaults = deriveModePriceDefaults(mode);
  const priceMap = resolvedPriceMapForMode(mode, modeDefaults.upgradePriceByType);
  const suggestedMap = suggestPriceMapFromMetaStats(summary, priceMap, state.config || null);
  if (!summary) {
    dom.metaRankBody.innerHTML = '<tr><td colspan="6">Run baseline sims to populate observed meta correlations.</td></tr>';
    return;
  }

  const rows = UPGRADE_ORDER.map((type) => {
    const stat = summary.meta[type];
    const samples = Math.max(0, stat.samples);
    const advantageRate = samples > 0 ? stat.wins / samples : 0;
    const avgGap = samples > 0 ? stat.gapSum / samples : 0;
    return {
      type,
      label: upgradeLabel(type),
      goldPrice: Math.max(1, Math.round(Number(priceMap?.[type]) || 0)),
      suggestedPrice: Math.max(1, Math.round(Number(suggestedMap?.[type]) || 0)),
      samples,
      advantageRate,
      avgGap,
    };
  }).sort((a, b) => {
    if (b.advantageRate !== a.advantageRate) return b.advantageRate - a.advantageRate;
    if (b.samples !== a.samples) return b.samples - a.samples;
    return a.label.localeCompare(b.label);
  });

  const html = [];
  for (const row of rows) {
    html.push(
      `<tr>
        <td>${row.label}</td>
        <td>${row.goldPrice}</td>
        <td>${row.suggestedPrice}</td>
        <td>${formatPercent(row.advantageRate)}</td>
        <td>${row.samples}</td>
        <td>${row.avgGap.toFixed(2)}</td>
      </tr>`
    );
  }
  dom.metaRankBody.innerHTML = html.join('');
}

function sanitizeCellText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function tableElementToTsv(tableEl) {
  if (!tableEl) return '';
  const lines = [];
  const rows = tableEl.querySelectorAll('thead tr, tbody tr');
  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('th, td')).map((cell) => sanitizeCellText(cell.textContent));
    if (!cells.length) continue;
    lines.push(cells.join('\t'));
  }
  return lines.join('\n');
}

function summaryToTsv() {
  const rows = [
    ['Metric', 'Value'],
    ['Total Matches', sanitizeCellText(dom.summaryMatches?.textContent)],
    ['Left Win Rate', sanitizeCellText(dom.summaryLeftRate?.textContent)],
    ['Right Win Rate', sanitizeCellText(dom.summaryRightRate?.textContent)],
    ['Avg Match Time', sanitizeCellText(dom.summaryAvgDuration?.textContent)],
    ['Timed Out', sanitizeCellText(dom.summaryTimeouts?.textContent)],
    ['Min Price', sanitizeCellText(dom.summaryMinPrice?.textContent)],
    ['Max Price', sanitizeCellText(dom.summaryMaxPrice?.textContent)],
  ];
  return rows.map((row) => row.join('\t')).join('\n');
}

function setCopyMessage(messageEl, text, isError = false) {
  if (!messageEl) return;
  messageEl.textContent = text || '';
  messageEl.classList.toggle('error', Boolean(isError));
  messageEl.classList.toggle('success', Boolean(!isError && text));
  const previousTimer = copyMessageTimers.get(messageEl);
  if (previousTimer) window.clearTimeout(previousTimer);
  if (!text) return;
  const timer = window.setTimeout(() => {
    messageEl.textContent = '';
    messageEl.classList.remove('error');
    messageEl.classList.remove('success');
    copyMessageTimers.delete(messageEl);
  }, 2200);
  copyMessageTimers.set(messageEl, timer);
}

async function copyTextToClipboard(text) {
  const payload = String(text ?? '');
  if (!payload.trim()) throw new Error('No table data to copy yet.');
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(payload);
    return;
  }
  const area = document.createElement('textarea');
  area.value = payload;
  area.setAttribute('readonly', 'readonly');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.focus();
  area.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(area);
  if (!copied) throw new Error('Clipboard copy is blocked in this browser.');
}

async function copyTableForSheets(tableEl, messageEl) {
  try {
    const tsv = tableElementToTsv(tableEl);
    await copyTextToClipboard(tsv);
    setCopyMessage(messageEl, 'Copied. Paste directly into Sheets.');
  } catch (error) {
    setCopyMessage(messageEl, error?.message || 'Copy failed.', true);
  }
}

async function copyAllTablesForSheets() {
  try {
    const parts = [
      ['Summary', summaryToTsv()],
      ['Upgrade Rank', tableElementToTsv(dom.upgradeRankTable)],
      ['Meta Correlation', tableElementToTsv(dom.metaRankTable)],
    ].filter((entry) => String(entry?.[1] || '').trim());
    if (!parts.length) throw new Error('No table data to copy yet.');
    const tsv = parts.map(([title, body]) => `${title}\n${body}`).join('\n\n');
    await copyTextToClipboard(tsv);
    setCopyMessage(dom.copyAllTablesMsg, 'Copied all tables. Paste into Sheets.');
  } catch (error) {
    setCopyMessage(dom.copyAllTablesMsg, error?.message || 'Copy failed.', true);
  }
}

function renderAll() {
  renderRunSizingPreview();
  setProgress();
  renderSummary();
  renderAutoBalanceText();
  renderCyclePriceChangeText();
  renderUpgradeRankTable();
  renderMetaRankTable();
  refreshAllCoreCards();
  refreshStatusLine();
}

function teardownWorkers() {
  for (const worker of state.workers.values()) worker.terminate();
  state.workers.clear();
  state.activeJobs.clear();
}

function finalizeRun(statusMessage = '') {
  if (!state.running) return;
  if (state.config?.mode && state.currentUpgradePriceByType) {
    state.priceByMode.set(state.config.mode, clonePriceMap(state.currentUpgradePriceByType));
  }
  state.running = false;
  state.finishedAtMs = performance.now();
  stopStatusTicker();
  teardownWorkers();
  setControlsRunning(false);
  if (statusMessage) state.statusMessage = statusMessage;
  state.activeCostMultipliersByType = null;
  renderAll();
}

function stopRun(statusMessage = 'Run stopped.') {
  if (!state.running) {
    state.statusMessage = statusMessage;
    renderAutoBalanceText();
    refreshStatusLine();
    return;
  }
  finalizeRun(statusMessage);
}

function startCycle(cycleIndex) {
  if (!state.running || !state.config) return;
  state.runId += 1;
  state.cycleIndex = cycleIndex;
  state.summary = createSummary();
  state.queue = createJobs(state.config);
  state.totalJobs = state.queue.length;
  state.completedJobs = 0;
  state.cycleStartedAtMs = performance.now();
  state.activeCostMultipliersByType = createCostMultiplierMap(
    state.currentUpgradePriceByType || state.config.upgradePriceByType,
    state.baseUpgradePriceByType || state.config.upgradePriceByType
  );
  teardownWorkers();
  buildCoreGrid(state.config.workers);
  renderAll();
  for (let workerId = 0; workerId < state.config.workers; workerId += 1) {
    spawnWorker(workerId);
  }
  for (let workerId = 0; workerId < state.config.workers; workerId += 1) {
    dispatchNextJob(workerId);
  }
}

function maybeFinishCycle() {
  if (!state.running) return;
  if (state.completedJobs < state.totalJobs) return;
  if (state.activeJobs.size > 0) return;
  const cycleElapsedSec = Math.max(0, (performance.now() - state.cycleStartedAtMs) / 1000);
  if (state.config?.autoBalanceEnabled && state.cycleIndex < state.cycleTotal) {
    const before = clonePriceMap(state.currentUpgradePriceByType || state.config.upgradePriceByType);
    const after = suggestPriceMapFromUpgradeStats(state.summary, before, state.config);
    state.currentUpgradePriceByType = clampPriceMapToBounds(after, state.config);
    state.priceByMode.set(state.config.mode, clonePriceMap(state.currentUpgradePriceByType));
    state.suggestedPriceByType = clonePriceMap(state.currentUpgradePriceByType);
    let changed = 0;
    let totalDelta = 0;
    let maxAbsDelta = 0;
    for (const type of UPGRADE_ORDER) {
      const prev = Math.max(1, Math.round(Number(before[type]) || 0));
      const next = Math.max(1, Math.round(Number(state.currentUpgradePriceByType[type]) || 0));
      const delta = next - prev;
      if (delta !== 0) changed += 1;
      totalDelta += delta;
      const absDelta = Math.abs(delta);
      if (absDelta > maxAbsDelta) maxAbsDelta = absDelta;
    }
    state.lastCyclePriceDelta = {
      changed,
      totalDelta,
      maxAbsDelta,
    };
    const cycleNote = `Cycle ${state.cycleIndex} complete in ${formatEta(cycleElapsedSec)}. Adjusted ${changed} prices.`;
    state.cycleLogs.push(cycleNote);
    const nextCycle = state.cycleIndex + 1;
    state.statusMessage = `${cycleNote} Starting cycle ${nextCycle}/${state.cycleTotal}...`;
    startCycle(nextCycle);
    return;
  }
  const elapsedSec = Math.max(0, (performance.now() - state.startedAtMs) / 1000);
  finalizeRun(`Completed ${state.completedOverall} matches in ${formatEta(elapsedSec)}.`);
}

function dispatchNextJob(workerId) {
  if (!state.running) return;
  const worker = state.workers.get(workerId);
  if (!worker) return;
  const nextJob = state.queue.pop() || null;
  const core = state.coreState.get(workerId);
  if (!nextJob) {
    state.activeJobs.delete(workerId);
    if (core) {
      core.status = 'idle';
      core.job = null;
      renderCoreCard(workerId);
    }
    maybeFinishCycle();
    return;
  }

  state.activeJobs.set(workerId, nextJob);
  if (core) {
    core.status = 'running';
    core.job = nextJob;
    core.errored = false;
    core.frame = null;
    renderCoreCard(workerId);
  }

  worker.postMessage({
    type: 'runJob',
    runId: state.runId,
    workerId,
    job: nextJob,
    options: {
      mode: state.config.mode,
      baselineLevelsByType: state.config.baselineLevelsByType,
      cardBiasMultiplier: state.config.cardBiasMultiplier,
      maxMatchSeconds: state.config.maxMatchSeconds,
      emitIntervalMs: state.config.emitIntervalMs,
      upgradeCostMultipliersByType: state.activeCostMultipliersByType,
    },
  });
}

function handleCoreUpdateMessage(payload) {
  if (!state.running) return;
  if (payload.runId !== state.runId) return;
  const workerId = clampInt(payload.workerId, 0, MAX_WORKERS_UI, 0);
  const core = state.coreState.get(workerId);
  if (!core) return;
  core.status = payload.final ? 'running' : 'running';
  core.frame = payload.frame || null;
  if (payload.jobKind === 'upgrade') {
    core.job = {
      kind: 'upgrade',
      upgradeType: payload.upgradeType,
      biasedSide: payload.biasedSide,
    };
  } else {
    core.job = {
      kind: 'baseline',
    };
  }
  renderCoreCard(workerId);
}

function handleJobResultMessage(payload) {
  if (!state.running) return;
  if (payload.runId !== state.runId) return;
  const workerId = clampInt(payload.workerId, 0, MAX_WORKERS_UI, 0);
  const result = payload.result || null;
  if (!result) return;

  updateSummary(result);
  state.completedJobs += 1;
  state.completedOverall += 1;
  state.activeJobs.delete(workerId);
  const core = state.coreState.get(workerId);
  if (core) {
    core.completed += 1;
    core.status = 'idle';
    core.job = null;
    core.errored = false;
    renderCoreCard(workerId);
  }
  renderSummary();
  setProgress();
  if ((state.completedJobs % 8) === 0 || state.completedJobs >= state.totalJobs) {
    renderUpgradeRankTable();
    renderMetaRankTable();
  }
  refreshStatusLine();
  dispatchNextJob(workerId);
}

function handleJobErrorMessage(payload) {
  if (!state.running) return;
  if (payload.runId !== state.runId) return;
  const workerId = clampInt(payload.workerId, 0, MAX_WORKERS_UI, 0);
  const core = state.coreState.get(workerId);
  if (core) {
    core.errored = true;
    core.status = 'idle';
    renderCoreCard(workerId);
  }
  const message = payload?.message || 'Simulation worker failed.';
  stopRun(`Stopped after worker error: ${message}`);
}

function spawnWorker(workerId) {
  const worker = new Worker('/js/simLabWorker.js', { type: 'module' });
  worker.onmessage = (event) => {
    const payload = event?.data || {};
    if (payload.type === 'coreUpdate') {
      handleCoreUpdateMessage(payload);
      return;
    }
    if (payload.type === 'jobResult') {
      handleJobResultMessage(payload);
      return;
    }
    if (payload.type === 'jobError') {
      handleJobErrorMessage(payload);
    }
  };
  worker.onerror = () => {
    stopRun('Stopped because a worker crashed.');
  };
  state.workers.set(workerId, worker);
  return worker;
}

function startRun(seedMode = 'continue') {
  if (state.running) return;
  state.runSeedMode = seedMode === 'fresh' ? 'fresh' : 'continue';
  state.config = readConfigFromUi();
  state.baseUpgradePriceByType = clonePriceMap(state.config.upgradePriceByType);
  const savedForMode = state.priceByMode.get(state.config.mode);
  const shouldUseSaved = state.runSeedMode === 'continue' && Boolean(savedForMode);
  const startSeed = shouldUseSaved
    ? clonePriceMap(savedForMode)
    : clonePriceMap(state.baseUpgradePriceByType);
  state.currentUpgradePriceByType = clampPriceMapToBounds(startSeed, state.config);
  state.priceByMode.set(state.config.mode, clonePriceMap(state.currentUpgradePriceByType));
  state.suggestedPriceByType = clonePriceMap(state.currentUpgradePriceByType);
  state.lastCyclePriceDelta = null;
  state.cycleLogs = [];
  state.cycleTotal = Math.max(1, Number(state.config.autoBalanceCycles) || 1);
  state.jobsPerCycle = state.config.baselineSims + (UPGRADE_ORDER.length * 2 * state.config.perUpgradePerSide);
  state.totalPlannedJobs = Math.max(1, state.jobsPerCycle * state.cycleTotal);
  state.completedOverall = 0;
  state.cycleIndex = 1;
  state.startedAtMs = performance.now();
  state.finishedAtMs = 0;
  state.running = true;
  const resumeTag = shouldUseSaved ? ' (continuing from saved prices)' : ' (fresh default prices)';
  state.statusMessage = state.config.autoBalanceEnabled
    ? `Starting cycle 1/${state.cycleTotal}${resumeTag}...`
    : `Starting simulation workers${resumeTag}...`;

  setControlsRunning(true);
  startStatusTicker();
  startCycle(1);
}

function init() {
  if (dom.workersInput) dom.workersInput.value = String(defaultWorkerCount());
  if (dom.autoBalanceCyclesInput) dom.autoBalanceCyclesInput.value = String(DEFAULT_AUTO_BALANCE_CYCLES);
  if (dom.autoBalanceStepPctInput) dom.autoBalanceStepPctInput.value = String(DEFAULT_AUTO_BALANCE_STEP_PCT);
  const previewInputs = [
    dom.perUpgradeInput,
    dom.baselineInput,
    dom.autoBalanceEnabledInput,
    dom.autoBalanceCyclesInput,
  ];
  for (const input of previewInputs) {
    if (!input) continue;
    input.addEventListener('input', renderRunSizingPreview);
    input.addEventListener('change', renderRunSizingPreview);
  }
  applyModePriceDefaults(normalizeMode(dom.modeInput?.value));
  if (dom.modeInput) dom.modeInput.addEventListener('change', () => {
    applyModePriceDefaults(normalizeMode(dom.modeInput?.value));
    syncOptionalControlState();
    renderAll();
  });
  if (dom.priceBoundsEnabledInput) dom.priceBoundsEnabledInput.addEventListener('change', () => {
    syncOptionalControlState();
    renderAll();
  });
  if (dom.priceMinInput) dom.priceMinInput.addEventListener('change', renderAll);
  if (dom.priceMaxInput) dom.priceMaxInput.addEventListener('change', renderAll);
  if (dom.autoBalanceEnabledInput) dom.autoBalanceEnabledInput.addEventListener('change', () => {
    syncOptionalControlState();
    renderAll();
  });
  if (dom.autoBalanceCyclesInput) dom.autoBalanceCyclesInput.addEventListener('change', renderAll);
  if (dom.autoBalanceStepPctInput) dom.autoBalanceStepPctInput.addEventListener('change', renderAll);
  if (dom.runContinueBtn) dom.runContinueBtn.addEventListener('click', () => {
    setRunSeedMode('continue');
    startRun('continue');
  });
  if (dom.runFreshBtn) dom.runFreshBtn.addEventListener('click', () => {
    setRunSeedMode('fresh');
    startRun('fresh');
  });
  if (dom.stopBtn) dom.stopBtn.addEventListener('click', () => stopRun('Run stopped.'));
  if (dom.copyUpgradeTableBtn) dom.copyUpgradeTableBtn.addEventListener('click', () => {
    copyTableForSheets(dom.upgradeRankTable, dom.copyUpgradeTableMsg);
  });
  if (dom.copyMetaTableBtn) dom.copyMetaTableBtn.addEventListener('click', () => {
    copyTableForSheets(dom.metaRankTable, dom.copyMetaTableMsg);
  });
  if (dom.copyAllTablesBtn) dom.copyAllTablesBtn.addEventListener('click', () => {
    copyAllTablesForSheets();
  });
  setRunSeedMode('continue');
  syncOptionalControlState();
  renderAll();
}

init();

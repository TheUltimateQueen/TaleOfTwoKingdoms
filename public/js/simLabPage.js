import { GameRoom as SimGameRoom } from './SimGameRoom.js';
import { UPGRADE_LABELS } from './constants.js';
import { UPGRADE_TYPES } from './simConstants.js';

const MAX_WORKERS_UI = 16;
const DEFAULT_WORKER_CAP = 8;
const RUNNING_STATUS_REFRESH_MS = 250;
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
  baselineInput: document.getElementById('simBaselineInput'),
  workersInput: document.getElementById('simWorkersInput'),
  coreUpdateMsInput: document.getElementById('simCoreUpdateMsInput'),
  maxSecondsInput: document.getElementById('simMaxSecondsInput'),
  runBtn: document.getElementById('simRunBtn'),
  stopBtn: document.getElementById('simStopBtn'),
  statusText: document.getElementById('simStatusText'),
  progressBar: document.getElementById('simProgressBar'),
  summaryMatches: document.getElementById('simSummaryMatches'),
  summaryLeftRate: document.getElementById('simSummaryLeftRate'),
  summaryRightRate: document.getElementById('simSummaryRightRate'),
  summaryAvgDuration: document.getElementById('simSummaryAvgDuration'),
  summaryTimeouts: document.getElementById('simSummaryTimeouts'),
  upgradeRankBody: document.getElementById('simUpgradeRankBody'),
  metaRankBody: document.getElementById('simMetaRankBody'),
  coreGrid: document.getElementById('simCoreGrid'),
};

const state = {
  runId: 0,
  running: false,
  startedAtMs: 0,
  finishedAtMs: 0,
  queue: [],
  totalJobs: 0,
  completedJobs: 0,
  summary: null,
  config: null,
  workers: new Map(),
  activeJobs: new Map(),
  coreState: new Map(),
  coreEls: new Map(),
  baselineCacheByMode: new Map(),
  statusMessage: 'Ready.',
  statusTimer: null,
};

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
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
      boostedWins: 0,
      leftBoostMatches: 0,
      leftBoostWins: 0,
      rightBoostMatches: 0,
      rightBoostWins: 0,
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
          boostedSide: side,
        });
      }
    }
  }
  return shuffleInPlace(jobs);
}

function readConfigFromUi() {
  const mode = normalizeMode(dom.modeInput?.value);
  const perUpgradePerSide = clampInt(dom.perUpgradeInput?.value, 1, 500, 6);
  const baselineSims = clampInt(dom.baselineInput?.value, 0, 3000, 60);
  const workers = clampInt(dom.workersInput?.value, 1, MAX_WORKERS_UI, defaultWorkerCount());
  const emitIntervalMs = clampInt(dom.coreUpdateMsInput?.value, 80, 5000, 240);
  const maxMatchSeconds = clampInt(dom.maxSecondsInput?.value, 120, 7200, 900);
  const baselineLevelsByType = deriveBaselineLevelsByMode(mode);
  const baselineLevelArray = levelArrayFromMap(baselineLevelsByType);
  return {
    mode,
    perUpgradePerSide,
    baselineSims,
    workers,
    emitIntervalMs,
    maxMatchSeconds,
    baselineLevelsByType,
    baselineLevelArray,
  };
}

function setControlsRunning(running) {
  if (dom.runBtn) dom.runBtn.disabled = running;
  if (dom.stopBtn) dom.stopBtn.disabled = !running;
  const disabled = running;
  if (dom.modeInput) dom.modeInput.disabled = disabled;
  if (dom.perUpgradeInput) dom.perUpgradeInput.disabled = disabled;
  if (dom.baselineInput) dom.baselineInput.disabled = disabled;
  if (dom.workersInput) dom.workersInput.disabled = disabled;
  if (dom.coreUpdateMsInput) dom.coreUpdateMsInput.disabled = disabled;
  if (dom.maxSecondsInput) dom.maxSecondsInput.disabled = disabled;
}

function workerJobLabel(job = null) {
  if (!job) return 'Idle';
  if (job.kind === 'upgrade') {
    const side = job.boostedSide === 'right' ? 'right' : 'left';
    return `Upgrade: ${upgradeLabel(job.upgradeType)} (${side} boosted)`;
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
  const completed = Math.max(0, state.completedJobs);
  const total = Math.max(1, state.totalJobs);
  const active = state.activeJobs.size;
  const rate = completed / elapsedSec;
  const remaining = Math.max(0, total - completed);
  const etaSec = rate > 0 ? remaining / rate : Infinity;
  const pct = Math.min(100, (completed / total) * 100);
  dom.statusText.textContent = `Running ${completed}/${total} matches (${pct.toFixed(1)}%). ${rate.toFixed(2)} matches/s. ETA ${formatEta(etaSec)}. Active cores ${active}/${state.config?.workers || 1}.`;
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
  dom.progressBar.max = Math.max(1, state.totalJobs || 1);
  dom.progressBar.value = Math.max(0, state.completedJobs || 0);
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
    if (result?.boostedWon) stat.boostedWins += 1;
    const side = result?.boostedSide === 'right' ? 'right' : 'left';
    if (side === 'left') {
      stat.leftBoostMatches += 1;
      if (result?.winner === 'left') stat.leftBoostWins += 1;
    } else {
      stat.rightBoostMatches += 1;
      if (result?.winner === 'right') stat.rightBoostWins += 1;
    }
  }
}

function renderSummary() {
  const summary = state.summary || createSummary();
  const matches = Math.max(0, summary.matches);
  const leftRate = matches > 0 ? summary.leftWins / matches : 0;
  const rightRate = matches > 0 ? summary.rightWins / matches : 0;
  const avgDuration = matches > 0 ? (summary.durationSum / matches) : 0;
  if (dom.summaryMatches) dom.summaryMatches.textContent = String(matches);
  if (dom.summaryLeftRate) dom.summaryLeftRate.textContent = formatPercent(leftRate);
  if (dom.summaryRightRate) dom.summaryRightRate.textContent = formatPercent(rightRate);
  if (dom.summaryAvgDuration) dom.summaryAvgDuration.textContent = formatSeconds(avgDuration);
  if (dom.summaryTimeouts) dom.summaryTimeouts.textContent = String(Math.max(0, summary.timedOut));
}

function renderUpgradeRankTable() {
  if (!dom.upgradeRankBody) return;
  const summary = state.summary;
  if (!summary) {
    dom.upgradeRankBody.innerHTML = '<tr><td colspan="7">Run a simulation to populate upgrade rankings.</td></tr>';
    return;
  }

  const rows = UPGRADE_ORDER.map((type) => {
    const stat = summary.upgrade[type];
    const matches = Math.max(0, stat.matches);
    const boostedRate = matches > 0 ? stat.boostedWins / matches : 0;
    const leftRate = stat.leftBoostMatches > 0 ? stat.leftBoostWins / stat.leftBoostMatches : 0;
    const rightRate = stat.rightBoostMatches > 0 ? stat.rightBoostWins / stat.rightBoostMatches : 0;
    const avgDuration = matches > 0 ? stat.durationSum / matches : 0;
    return {
      type,
      label: upgradeLabel(type),
      matches,
      boostedRate,
      leftRate,
      rightRate,
      avgDuration,
    };
  }).sort((a, b) => {
    if (b.boostedRate !== a.boostedRate) return b.boostedRate - a.boostedRate;
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
        <td>${formatPercent(row.boostedRate)}</td>
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
  if (!summary) {
    dom.metaRankBody.innerHTML = '<tr><td colspan="4">Run baseline sims to populate observed meta correlations.</td></tr>';
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
        <td>${formatPercent(row.advantageRate)}</td>
        <td>${row.samples}</td>
        <td>${row.avgGap.toFixed(2)}</td>
      </tr>`
    );
  }
  dom.metaRankBody.innerHTML = html.join('');
}

function renderAll() {
  setProgress();
  renderSummary();
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
  state.running = false;
  state.finishedAtMs = performance.now();
  stopStatusTicker();
  teardownWorkers();
  setControlsRunning(false);
  if (statusMessage) state.statusMessage = statusMessage;
  renderAll();
}

function stopRun(statusMessage = 'Run stopped.') {
  if (!state.running) {
    state.statusMessage = statusMessage;
    refreshStatusLine();
    return;
  }
  finalizeRun(statusMessage);
}

function maybeFinishRun() {
  if (!state.running) return;
  if (state.completedJobs < state.totalJobs) return;
  if (state.activeJobs.size > 0) return;
  const elapsedSec = Math.max(0, (performance.now() - state.startedAtMs) / 1000);
  finalizeRun(`Completed ${state.completedJobs} matches in ${formatEta(elapsedSec)}.`);
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
    maybeFinishRun();
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
      maxMatchSeconds: state.config.maxMatchSeconds,
      emitIntervalMs: state.config.emitIntervalMs,
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
      boostedSide: payload.boostedSide,
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

function startRun() {
  if (state.running) return;
  state.config = readConfigFromUi();
  state.summary = createSummary();
  state.queue = createJobs(state.config);
  state.totalJobs = state.queue.length;
  state.completedJobs = 0;
  state.startedAtMs = performance.now();
  state.finishedAtMs = 0;
  state.runId += 1;
  state.running = true;
  state.statusMessage = 'Starting simulation workers...';

  setControlsRunning(true);
  setProgress();
  buildCoreGrid(state.config.workers);
  renderSummary();
  renderUpgradeRankTable();
  renderMetaRankTable();
  refreshStatusLine();
  startStatusTicker();

  for (let workerId = 0; workerId < state.config.workers; workerId += 1) {
    spawnWorker(workerId);
  }
  for (let workerId = 0; workerId < state.config.workers; workerId += 1) {
    dispatchNextJob(workerId);
  }
}

function init() {
  if (dom.workersInput) dom.workersInput.value = String(defaultWorkerCount());
  if (dom.runBtn) dom.runBtn.addEventListener('click', startRun);
  if (dom.stopBtn) dom.stopBtn.addEventListener('click', () => stopRun('Run stopped.'));
  renderUpgradeRankTable();
  renderMetaRankTable();
  renderSummary();
  refreshStatusLine();
}

init();

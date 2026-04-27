import { GameRoom as SimGameRoom } from './SimGameRoom.js';
import { UPGRADE_TYPES } from './simConstants.js';

const FIXED_DT = 1 / 30;

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  const floored = Math.floor(n);
  return Math.max(min, Math.min(max, floored));
}

function normalizeMode(value) {
  return value === '2v2' ? '2v2' : '1v1';
}

function normalizeSide(value) {
  return value === 'right' ? 'right' : 'left';
}

function sideLevelArray(sideState) {
  return UPGRADE_TYPES.map((type) => Math.max(0, Math.floor(Number(sideState?.[type]) || 0)));
}

function snapshotRoomState(room, nowTick = 0) {
  return {
    tick: nowTick,
    simSeconds: Number(room?.t) || 0,
    leftTowerHp: Math.max(0, Number(room?.left?.towerHp) || 0),
    rightTowerHp: Math.max(0, Number(room?.right?.towerHp) || 0),
    leftGold: Math.max(0, Number(room?.left?.gold) || 0),
    rightGold: Math.max(0, Number(room?.right?.gold) || 0),
    leftLevels: sideLevelArray(room?.left),
    rightLevels: sideLevelArray(room?.right),
  };
}

function createCpuRoom(mode = '1v1', debugConfig = null) {
  const room = new SimGameRoom(`SIM-${Math.random().toString(36).slice(2, 10)}`, '', {
    mode: normalizeMode(mode),
    debugConfig,
  });
  const slots = {
    left: Array.from({ length: room.archersPerSide }, () => true),
    right: Array.from({ length: room.archersPerSide }, () => true),
  };
  room.setCpuSlots(slots);
  return room;
}

function buildBoostConfig(upgradeType, boostedSide, baselineLevelsByType) {
  const side = normalizeSide(boostedSide);
  const upgrades = {};
  for (const type of UPGRADE_TYPES) {
    upgrades[type] = Math.max(0, Math.floor(Number(baselineLevelsByType?.[type]) || 0));
  }
  upgrades[upgradeType] = Math.max(0, (Number(upgrades[upgradeType]) || 0) + 1);
  return {
    enabled: true,
    applyTo: side,
    upgrades,
  };
}

function runCpuMatch(options = {}, context = {}) {
  const mode = normalizeMode(options.mode);
  const maxMatchSeconds = clampInt(options.maxMatchSeconds, 120, 7200, 900);
  const emitIntervalMs = clampInt(options.emitIntervalMs, 80, 5000, 240);
  const reportCoreFrame = typeof context.reportCoreFrame === 'function'
    ? context.reportCoreFrame
    : null;
  const room = createCpuRoom(mode, options.debugConfig || null);

  const maxTicks = Math.max(1, Math.floor(maxMatchSeconds / FIXED_DT));
  let ticks = 0;
  let timedOut = false;
  let nextPulseAt = performance.now() + emitIntervalMs;

  while (!room.gameOver && ticks < maxTicks) {
    room.tick(FIXED_DT);
    ticks += 1;
    if (reportCoreFrame && performance.now() >= nextPulseAt) {
      reportCoreFrame(snapshotRoomState(room, ticks), false);
      nextPulseAt = performance.now() + emitIntervalMs;
    }
  }

  if (!room.gameOver) {
    timedOut = true;
    room.gameOver = true;
    room.winner = room.resolveTowerWinner();
  }

  const finalState = snapshotRoomState(room, ticks);
  if (reportCoreFrame) reportCoreFrame(finalState, true);

  return {
    winner: room.winner === 'right' ? 'right' : 'left',
    timedOut,
    ticks,
    durationSeconds: Number(room.t) || 0,
    leftTowerHp: finalState.leftTowerHp,
    rightTowerHp: finalState.rightTowerHp,
    leftGold: finalState.leftGold,
    rightGold: finalState.rightGold,
    leftLevels: finalState.leftLevels,
    rightLevels: finalState.rightLevels,
  };
}

function runJob(job = {}, options = {}, context = {}) {
  const kind = job.kind === 'upgrade' ? 'upgrade' : 'baseline';
  const upgradeType = typeof job.upgradeType === 'string' ? job.upgradeType : null;
  const boostedSide = normalizeSide(job.boostedSide);
  let debugConfig = null;

  if (kind === 'upgrade' && upgradeType && UPGRADE_TYPES.includes(upgradeType)) {
    debugConfig = buildBoostConfig(upgradeType, boostedSide, options.baselineLevelsByType || {});
  }

  const result = runCpuMatch({
    mode: options.mode,
    maxMatchSeconds: options.maxMatchSeconds,
    emitIntervalMs: options.emitIntervalMs,
    debugConfig,
  }, context);

  return {
    ...result,
    kind,
    upgradeType,
    boostedSide,
    boostedWon: kind === 'upgrade' && result.winner === boostedSide,
  };
}

self.onmessage = (event) => {
  const payload = event?.data || {};
  if (payload.type !== 'runJob') return;
  const runId = payload.runId;
  const workerId = clampInt(payload.workerId, 0, 9999, 0);
  const jobId = payload?.job?.id ?? null;
  const job = payload.job || {};
  const options = payload.options || {};

  try {
    const result = runJob(job, options, {
      reportCoreFrame: (frame, final = false) => {
        self.postMessage({
          type: 'coreUpdate',
          runId,
          workerId,
          jobId,
          final: Boolean(final),
          jobKind: job.kind === 'upgrade' ? 'upgrade' : 'baseline',
          upgradeType: typeof job.upgradeType === 'string' ? job.upgradeType : null,
          boostedSide: normalizeSide(job.boostedSide),
          frame,
        });
      },
    });
    self.postMessage({
      type: 'jobResult',
      runId,
      workerId,
      jobId,
      result,
    });
  } catch (error) {
    self.postMessage({
      type: 'jobError',
      runId,
      workerId,
      jobId,
      message: error?.message || String(error || 'Simulation worker error'),
    });
  }
};

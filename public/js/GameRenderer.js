import {
  SHOT_INTERVAL,
  SHOT_POWER_LABELS,
  TEAM_COLORS,
  UPGRADE_HINTS,
  UPGRADE_LABELS,
} from './constants.js';

function sideCardSlotX(sideName, slot) {
  const leftRegular = [220, 320];
  if (sideName === 'left') return leftRegular[slot];
  return 1600 - leftRegular[slot];
}

function launchAngleFromPull(sideName, pullX, pullY) {
  const horizontal = Math.max(0, Math.abs(pullX));
  const vertical = Math.max(0, -pullY);
  return Math.max(0, Math.min(Math.PI / 2, Math.atan2(vertical, horizontal || (vertical > 0 ? 0.0001 : 1))));
}

function worldAimAngle(sideName, pullX, pullY) {
  const a = launchAngleFromPull(sideName, pullX, pullY);
  if (sideName === 'left') return -a;
  return -Math.PI + a;
}

function launchStrengthFromPull(sideName, pullX, pullY) {
  const horizontal = Math.max(0, Math.abs(pullX));
  const vertical = Math.max(0, -pullY);
  return Math.max(0.05, Math.min(1, Math.hypot(horizontal, vertical)));
}

function comboTierFromStreak(streak) {
  const value = Math.max(0, Math.min(10, Number(streak) || 0));
  if (value >= 10) return 4;
  if (value >= 7) return 3;
  if (value >= 4) return 2;
  return 1;
}

function arrowAccuracy(sideState) {
  const fired = Math.max(0, sideState?.arrowsFired || 0);
  const hits = Math.max(0, sideState?.arrowHits || 0);
  const rate = fired ? Math.round((hits / fired) * 100) : 0;
  return { fired, hits, rate };
}

const UPGRADE_BADGE_SPECS = [
  { type: 'arrowLevel', code: 'AR', base: 1 },
  { type: 'unitLevel', code: 'AT', base: 1 },
  { type: 'volleyLevel', code: 'VO', base: 0 },
  { type: 'spawnLevel', code: 'SP', base: 1 },
  { type: 'unitHpLevel', code: 'HP', base: 1 },
  { type: 'resourceLevel', code: 'RS', base: 1 },
  { type: 'bountyLevel', code: 'KG', base: 1 },
  { type: 'powerLevel', code: 'PW', base: 1 },
  { type: 'specialRateLevel', code: 'SR', base: 1 },
  { type: 'dragonLevel', code: 'DR', base: 0 },
  { type: 'dragonSuperBreathLevel', code: 'SB', base: 0 },
  { type: 'shieldDarkMetalLevel', code: 'DM', base: 0 },
  { type: 'monkHealCircleLevel', code: 'HC', base: 0 },
  { type: 'necroExpertSummonerLevel', code: 'NS', base: 0 },
  { type: 'riderSuperHorseLevel', code: 'RH', base: 0 },
  { type: 'diggerGoldFinderLevel', code: 'GF', base: 0 },
  { type: 'gunnerSkyCannonLevel', code: 'SC', base: 0 },
  { type: 'superMinionLevel', code: 'SU', base: 0 },
];

const UPGRADE_CATEGORY_BY_TYPE = {
  arrowLevel: 'arrow',
  volleyLevel: 'arrow',
  unitLevel: 'unit',
  unitHpLevel: 'unit',
  spawnLevel: 'unit',
  resourceLevel: 'economy',
  bountyLevel: 'economy',
  powerLevel: 'power',
  specialRateLevel: 'special',
  dragonLevel: 'special',
  dragonSuperBreathLevel: 'special',
  shieldDarkMetalLevel: 'special',
  monkHealCircleLevel: 'special',
  necroExpertSummonerLevel: 'special',
  riderSuperHorseLevel: 'special',
  diggerGoldFinderLevel: 'special',
  gunnerSkyCannonLevel: 'special',
  superMinionLevel: 'special',
};

const UPGRADE_CATEGORY_STYLE = {
  arrow: {
    tag: 'ARROW',
    panel: '#1f3446',
    glow: '#89d0ff2a',
    border: '#6cb5ee',
    title: '#dbf2ff',
    hint: '#9ecde9',
    cost: '#b9e4ff',
    badge: '#7ec9ff',
  },
  unit: {
    tag: 'UNIT',
    panel: '#243f2c',
    glow: '#93e59d26',
    border: '#7dcf8c',
    title: '#e4ffe7',
    hint: '#a8ddb2',
    cost: '#c8f5ce',
    badge: '#86dd95',
  },
  economy: {
    tag: 'ECO',
    panel: '#4b3a1d',
    glow: '#ffd86d29',
    border: '#e8c46a',
    title: '#fff3ce',
    hint: '#e1cb90',
    cost: '#ffe7aa',
    badge: '#f4cf70',
  },
  power: {
    tag: 'POWER',
    panel: '#3d2746',
    glow: '#d6a1ff2a',
    border: '#bc8de8',
    title: '#f6e5ff',
    hint: '#d6b9ea',
    cost: '#e5cbff',
    badge: '#c999ff',
  },
  special: {
    tag: 'SPECIAL',
    panel: '#4a2e21',
    glow: '#ffb0832b',
    border: '#ea9a6d',
    title: '#ffe6da',
    hint: '#e6b8a3',
    cost: '#ffd1bc',
    badge: '#ffaf86',
  },
  misc: {
    tag: 'UPG',
    panel: '#3a3020',
    glow: '#f4d5852b',
    border: '#cfab52',
    title: '#fff1c8',
    hint: '#d9c08a',
    cost: '#ffe3a5',
    badge: '#d8be86',
  },
};

const UPGRADE_CATEGORY_ORDER = ['arrow', 'unit', 'economy', 'power', 'special', 'misc'];

const UPGRADE_CATEGORY_TOWER_LABEL = {
  arrow: 'Arrow',
  unit: 'Units',
  economy: 'Economy',
  power: 'Power',
  special: 'Specials',
  misc: 'Other',
};

const ROW_TO_SPECIAL_TYPE = {
  necro: 'necrominion',
  gunner: 'gunner',
  rider: 'rider',
  digger: 'digger',
  monk: 'monk',
  shield: 'shield',
  hero: 'hero',
  president: 'president',
  dragon: 'dragon',
  super: 'super',
};

const SPECIAL_SPAWN_BASE_CHANCE = {
  necrominion: 0.56,
  gunner: 0.52,
  rider: 0.5,
  digger: 0.5,
  monk: 0.46,
  shield: 0.1,
  hero: 0.1,
  president: 0.41,
  dragon: 0.33,
  super: 0.3,
};
const CANDLE_SPAWN_COOLDOWN_MULT = 1.5;
const CANDLE_SPAWN_BASE_CHANCE = 0.18;

const FAILED_SPECIAL_HAT_STYLES = {
  dragon: { code: 'DR', cap: '#5f86b3', brim: '#aec8e7' },
  shield: { code: 'SH', cap: '#4f6688', brim: '#d4e5fa' },
  digger: { code: 'DG', cap: '#6f5a43', brim: '#bca07e' },
  necrominion: { code: 'NC', cap: '#2b5f4f', brim: '#8ef0c9' },
  gunner: { code: 'GN', cap: '#655447', brim: '#ffd6a1' },
  rider: { code: 'RD', cap: '#7f5f44', brim: '#e8d0b0' },
  monk: { code: 'MK', cap: '#486345', brim: '#c5f2b5' },
  hero: { code: 'HR', cap: '#6a4f2d', brim: '#ffe2a0' },
  president: { code: 'PR', cap: '#6f4632', brim: '#f1c7a2' },
  super: { code: 'SU', cap: '#7f7537', brim: '#fff2aa' },
};

function upgradeCategory(type) {
  return UPGRADE_CATEGORY_BY_TYPE[type] || 'misc';
}

const GAME_OVER_CINEMATIC_MS = 4000;
const SPECIAL_COOLDOWN_START_MULT = 1.5;
const SPECIAL_COOLDOWN_END_MULT = 1;
const SPECIAL_COOLDOWN_RAMP_SECONDS = 300;
const SPECIAL_COOLDOWN_STEP_SECONDS = 10;
const MINION_HIT_FLASH_TTL = 0.18;
const SHIELD_DARK_METAL_DURATION = 5;
const STONE_GOLEM_SMASH_TTL = 0.45;
const STONE_GOLEM_SHIELD_TTL = 5;
const MAX_PARTICLES = 1800;
const MAX_POOLED_PARTICLES = MAX_PARTICLES * 2;
const MAX_DAMAGE_TEXTS = 180;
const MAX_HERO_LINES = 80;
const MAX_DEATH_GHOSTS = 110;
const MAX_REVIVE_SPIRITS = 90;
const MAX_HEAL_CIRCLES = 42;
const TOWER_HIT_PARTICLE_COLORS = ['#b8c6d8', '#8ea0b7', '#6e7f96', '#e3c088'];
const BLOCKED_PARTICLE_COLORS = ['#f4f8ff', '#cad3de', '#adb8c5', '#8f9aa8'];
const CANDLE_HIT_FIRE_COLORS = ['#ff5f35', '#ff9f47', '#ffd37a', '#fff0c7'];
const CANDLE_HIT_PLUME_COLORS = ['#ff5f35', '#ffb24c', '#ffe7b1'];
const CANDLE_HIT_WAX_COLORS = ['#fff4d8', '#f7e6bf', '#e6cfa4'];
const TOWER_IMPACT_PARTICLE_COLORS = ['#c5d4e6', '#8fa1b8', '#73839a'];
const TOWER_COLLAPSE_PARTICLE_COLORS = ['#ced9e7', '#9baec3', '#6f8094', '#d9b483', '#7f6852'];
const FX_QUALITY_RANK = {
  low: 0,
  medium: 1,
  high: 2,
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particlePool = [];
    this.diggerDustMarks = new Map();
    this.damageTexts = [];
    this.heroLines = [];
    this.deathGhosts = [];
    this.reviveSpirits = [];
    this.healCircles = [];
    this.towerShake = {
      left: { ttl: 0, amp: 0, seed: Math.random() * 1000 },
      right: { ttl: 0, amp: 0, seed: Math.random() * 1000 },
    };
    this.gameOverCinematic = {
      active: false,
      startMs: 0,
      durationMs: GAME_OVER_CINEMATIC_MS,
      winner: null,
      loser: null,
      lastBurstMs: 0,
    };
    this.cachedBackgroundGradient = null;
    this.cachedBackgroundHeight = 0;
    this.spriteCache = new Map();
    this.spriteCacheMaxEntries = 180;
    this.fxQuality = 'high';
    this.fxFrameDtAvg = 1 / 60;
    this.fxQualityHold = 0;
    this.frameArrowCount = 0;
    this.lastFrameAt = performance.now();
  }

  backgroundGradient(height) {
    if (!this.cachedBackgroundGradient || this.cachedBackgroundHeight !== height) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#17263d');
      gradient.addColorStop(1, '#102033');
      this.cachedBackgroundGradient = gradient;
      this.cachedBackgroundHeight = height;
    }
    return this.cachedBackgroundGradient;
  }

  spawnParticle(x, y, vx, vy, life, maxLife, size, color, gravity) {
    if (this.particles.length >= this.maxLiveParticles()) return;
    const particle = this.particlePool.pop() || {};
    particle.x = x;
    particle.y = y;
    particle.vx = vx;
    particle.vy = vy;
    particle.life = life;
    particle.maxLife = maxLife;
    particle.size = size;
    particle.color = color;
    particle.gravity = gravity;
    this.particles.push(particle);
  }

  recycleParticle(particle) {
    if (!particle) return;
    if (this.particlePool.length >= MAX_POOLED_PARTICLES) return;
    particle.color = null;
    this.particlePool.push(particle);
  }

  maxLiveParticles() {
    if (this.fxQuality === 'low') return 700;
    if (this.fxQuality === 'medium') return 1200;
    return MAX_PARTICLES;
  }

  particleBurstScale() {
    if (this.fxQuality === 'low') return 0.45;
    if (this.fxQuality === 'medium') return 0.72;
    return 1;
  }

  scaledParticleCount(baseCount, minCount = 1) {
    const scaled = Math.round(baseCount * this.particleBurstScale());
    return Math.max(minCount, scaled);
  }

  updateFxQuality(dt) {
    const alpha = 0.08;
    this.fxFrameDtAvg += (dt - this.fxFrameDtAvg) * alpha;
    if (this.fxQualityHold > 0) this.fxQualityHold = Math.max(0, this.fxQualityHold - dt);

    let target = this.fxQuality;
    if (this.fxQuality === 'high') {
      target = this.fxFrameDtAvg > 0.0215 ? 'medium' : 'high';
    } else if (this.fxQuality === 'medium') {
      if (this.fxFrameDtAvg > 0.0255) target = 'low';
      else if (this.fxFrameDtAvg < 0.0178) target = 'high';
      else target = 'medium';
    } else {
      target = this.fxFrameDtAvg < 0.021 ? 'medium' : 'low';
    }

    if (target === this.fxQuality) return;
    const currentRank = FX_QUALITY_RANK[this.fxQuality] ?? 2;
    const targetRank = FX_QUALITY_RANK[target] ?? currentRank;
    const qualityDrop = targetRank < currentRank;
    if (!qualityDrop && this.fxQualityHold > 0) return;
    this.fxQuality = target;
    this.fxQualityHold = qualityDrop ? 1.2 : 0.6;
  }

  createSpriteCanvas(width, height) {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    if (typeof OffscreenCanvas !== 'undefined') {
      return new OffscreenCanvas(w, h);
    }
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      return canvas;
    }
    return null;
  }

  cachedSpriteEntry(key, width, height, renderFn) {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    const cached = this.spriteCache.get(key);
    if (cached && cached.w === w && cached.h === h) {
      // Refresh insertion order for simple LRU behavior.
      this.spriteCache.delete(key);
      this.spriteCache.set(key, cached);
      return cached;
    }

    const canvas = this.createSpriteCanvas(w, h);
    if (!canvas) return null;
    const cacheCtx = canvas.getContext('2d');
    if (!cacheCtx) return null;
    cacheCtx.clearRect(0, 0, w, h);

    const prevCtx = this.ctx;
    this.ctx = cacheCtx;
    try {
      renderFn(cacheCtx, w, h);
    } finally {
      this.ctx = prevCtx;
    }

    const entry = { canvas, w, h };
    this.spriteCache.delete(key);
    this.spriteCache.set(key, entry);
    while (this.spriteCache.size > this.spriteCacheMaxEntries) {
      const oldestKey = this.spriteCache.keys().next().value;
      this.spriteCache.delete(oldestKey);
    }
    return entry;
  }

  drawSpriteFromCache(minion, key, width, height, renderFn) {
    const entry = this.cachedSpriteEntry(key, width, height, renderFn);
    if (!entry) return false;
    this.ctx.drawImage(entry.canvas, minion.x - entry.w / 2, minion.y - entry.h / 2);
    return true;
  }

  pushDamageText(text) {
    if (this.damageTexts.length >= MAX_DAMAGE_TEXTS) this.damageTexts.shift();
    this.damageTexts.push(text);
  }

  pushHeroLine(line) {
    if (this.heroLines.length >= MAX_HERO_LINES) this.heroLines.shift();
    this.heroLines.push(line);
  }

  draw(snapshot, world) {
    if (!snapshot || !world) return;

    const { ctx, canvas } = this;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameAt) / 1000);
    this.lastFrameAt = now;
    this.updateFxQuality(dt);
    this.updateTowerShake(dt);
    this.updateGameOverCinematic(snapshot, world, now, dt);

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = this.backgroundGradient(h);
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#20354f';
    ctx.fillRect(w / 2 - 3, 0, 6, h);
    ctx.fillStyle = '#2d3b53';
    ctx.fillRect(0, world.groundY, w, 4);

    const barracksCounts = this.buildBarracksActiveCounts(snapshot);
    this.drawBarracks('left', snapshot.left, world, snapshot, barracksCounts.left);
    this.drawBarracks('right', snapshot.right, world, snapshot, barracksCounts.right);

    const leftPulls = this.sideArcherPulls('left', snapshot.left);
    const rightPulls = this.sideArcherPulls('right', snapshot.right);
    const leftShake = this.towerShakeOffset('left');
    const rightShake = this.towerShakeOffset('right');
    this.drawCastle(
      'left',
      world.towerLeftX + leftShake.x,
      world.towerY + leftShake.y,
      snapshot.left.towerHp,
      snapshot.left,
      leftPulls
    );
    this.drawCastle(
      'right',
      world.towerRightX + rightShake.x,
      world.towerY + rightShake.y,
      snapshot.right.towerHp,
      snapshot.right,
      rightPulls
    );
    for (let i = 0; i < leftPulls.length; i += 1) {
      this.drawShotRing(world.towerLeftX, world.towerY - 185 - i * 60, snapshot.left.shotCd, TEAM_COLORS.left.ring);
    }
    for (let i = 0; i < rightPulls.length; i += 1) {
      this.drawShotRing(world.towerRightX, world.towerY - 185 - i * 60, snapshot.right.shotCd, TEAM_COLORS.right.ring);
    }
    this.drawComboBanner('left', world.towerLeftX, world.towerY - 230, snapshot.left);
    this.drawComboBanner('right', world.towerRightX, world.towerY - 230, snapshot.right);
    this.drawUpgradeChargeBar('left', 42, 220, 16, 270, snapshot.left.upgradeCharge, snapshot.left.upgradeChargeMax);
    this.drawUpgradeChargeBar('right', w - 58, 220, 16, 270, snapshot.right.upgradeCharge, snapshot.right.upgradeChargeMax);

    this.drawUpgradePlaceholders(snapshot);

    for (const res of snapshot.resources) this.drawResourceNode(res);
    for (const power of snapshot.shotPowers) this.drawShotPower(power);
    if (Array.isArray(snapshot.cannonBalls)) {
      for (const ball of snapshot.cannonBalls) this.drawCannonBall(ball);
    }
    for (const card of snapshot.upgradeCards) this.drawUpgradeCard(card);
    if (Array.isArray(snapshot.candleScorches)) {
      for (let i = 0; i < snapshot.candleScorches.length; i += 1) {
        if (this.fxQuality === 'low' && i % 2 === 1) continue;
        this.drawCandleScorch(snapshot.candleScorches[i]);
      }
    } else if (snapshot.candleScorch) {
      this.drawCandleScorch(snapshot.candleScorch);
    }
    for (const minion of snapshot.minions) this.drawMinionSprite(minion);
    if (this.fxQuality !== 'low') this.drawMinionHitFlashes(snapshot.minions);
    this.updateHealCircles(dt);
    this.drawHealCircles();
    this.updateReviveSpirits(dt);
    this.drawReviveSpirits();
    this.updateDeathGhosts(dt);
    this.drawDeathGhosts();
    if (Array.isArray(snapshot.candles)) {
      for (const candle of snapshot.candles) this.drawCandle(candle);
    } else if (snapshot.candle) {
      this.drawCandle(snapshot.candle);
    }
    this.updateParticles(dt);
    this.drawParticles();
    this.frameArrowCount = Array.isArray(snapshot.arrows) ? snapshot.arrows.length : 0;
    for (const arrow of snapshot.arrows) this.drawArrow(arrow);
    this.updateDamageTexts(dt);
    this.drawDamageTexts();
    this.updateHeroLines(dt);
    this.drawHeroLines();

    for (let i = 0; i < leftPulls.length; i += 1) {
      const pull = leftPulls[i];
      const leftAim = worldAimAngle('left', pull.pullX, pull.pullY);
      const leftStrength = launchStrengthFromPull('left', pull.pullX, pull.pullY);
      this.drawAimGuide('left', world.towerLeftX + 35, pull.archerAimY, leftAim, leftStrength);
    }
    for (let i = 0; i < rightPulls.length; i += 1) {
      const pull = rightPulls[i];
      const rightAim = worldAimAngle('right', pull.pullX, pull.pullY);
      const rightStrength = launchStrengthFromPull('right', pull.pullX, pull.pullY);
      this.drawAimGuide('right', world.towerRightX - 35, pull.archerAimY, rightAim, rightStrength);
    }

    const gameOverCinematicActive = this.isGameOverCinematicActive(now);
    if (gameOverCinematicActive) this.drawTowerCollapseCinematic(world, now);

    if (snapshot.gameOver && !gameOverCinematicActive) {
      const leftAcc = arrowAccuracy(snapshot.left);
      const rightAcc = arrowAccuracy(snapshot.right);
      ctx.fillStyle = '#00000099';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = '56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${snapshot.winner === 'left' ? 'West' : 'East'} Kingdom Wins`, w / 2, h / 2 - 12);
      ctx.font = '24px sans-serif';
      ctx.fillText(`West Arrow Accuracy: ${leftAcc.rate}% (${leftAcc.hits} hits / ${leftAcc.fired} arrows fired)`, w / 2, h / 2 + 34);
      ctx.fillText(`East Arrow Accuracy: ${rightAcc.rate}% (${rightAcc.hits} hits / ${rightAcc.fired} arrows fired)`, w / 2, h / 2 + 68);
      ctx.font = '20px sans-serif';
      ctx.fillText('Arrow Accuracy = hits / arrows fired', w / 2, h / 2 + 98);
      ctx.fillText('Host can press Restart Match to play again with same room', w / 2, h / 2 + 128);
    }
  }

  emitHitParticles(typeOrEvent, x, y, side) {
    const event = (typeOrEvent && typeof typeOrEvent === 'object') ? typeOrEvent : null;
    const type = event ? event.type : typeOrEvent;
    const px = event ? event.x : x;
    const py = event ? event.y : y;
    const pside = event ? event.side : side;
    if (type === 'ghostfall') {
      this.emitDeathGhost(event);
      return;
    }
    if (type === 'revive') {
      this.emitReviveSpirit(event);
      const burstCount = this.scaledParticleCount(26, 4);
      for (let i = 0; i < burstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 110 + Math.random() * 160;
        this.spawnParticle(
          px + (Math.random() * 6 - 3),
          py + (Math.random() * 4 - 2),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 36,
          0.36 + Math.random() * 0.18,
          0.56,
          1.8 + Math.random() * 2.2,
          pickRandom(['#b6ffea', '#7ef2d8', '#f0fff8']),
          300
        );
      }
      return;
    }
    const palette = TEAM_COLORS[pside] || TEAM_COLORS.left;
    if (type === 'towerhit') {
      const half = (this.canvas?.width || 1600) * 0.5;
      const towerSide = pside === 'left' || pside === 'right' ? pside : (px < half ? 'left' : 'right');
      this.registerTowerImpact(towerSide, px, py, 1);
      const burstCount = this.scaledParticleCount(20, 3);
      for (let i = 0; i < burstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 90 + Math.random() * 220;
        this.spawnParticle(
          px + (Math.random() * 8 - 4),
          py + (Math.random() * 6 - 3),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 24,
          0.42 + Math.random() * 0.22,
          0.62,
          1.8 + Math.random() * 2.6,
          pickRandom(TOWER_HIT_PARTICLE_COLORS),
          640
        );
      }
      return;
    }
    if (type === 'blocked') {
      const burstCount = this.scaledParticleCount(18, 3);
      for (let i = 0; i < burstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 80 + Math.random() * 140;
        this.spawnParticle(
          px + (Math.random() * 6 - 3),
          py + (Math.random() * 4 - 2),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 16,
          0.34 + Math.random() * 0.2,
          0.58,
          2 + Math.random() * 2.6,
          pickRandom(BLOCKED_PARTICLE_COLORS),
          320
        );
      }
      return;
    }
    if (type === 'candlehit') {
      // Fire burst centered on the flame hit.
      const fireBurstCount = this.scaledParticleCount(30, 5);
      for (let i = 0; i < fireBurstCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 120 + Math.random() * 250;
        this.spawnParticle(
          px + (Math.random() * 4 - 2),
          py + (Math.random() * 3 - 1.5),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 45,
          0.34 + Math.random() * 0.16,
          0.48,
          2.2 + Math.random() * 2.8,
          pickRandom(CANDLE_HIT_FIRE_COLORS),
          540
        );
      }
      // Stem plume so wax/embers clearly eject from the candle body.
      const plumeBurstCount = this.scaledParticleCount(14, 2);
      for (let i = 0; i < plumeBurstCount; i += 1) {
        const ang = -Math.PI / 2 + (Math.random() * 0.85 - 0.425);
        const mag = 200 + Math.random() * 170;
        this.spawnParticle(
          px + (Math.random() * 8 - 4),
          py + 8 + (Math.random() * 3 - 1.5),
          Math.cos(ang) * mag * 0.46,
          Math.sin(ang) * mag - 35,
          0.42 + Math.random() * 0.16,
          0.58,
          2 + Math.random() * 2.2,
          pickRandom(CANDLE_HIT_PLUME_COLORS),
          560
        );
      }
      // Wax chunks spraying outward from the stem.
      const waxBurstCount = this.scaledParticleCount(22, 4);
      for (let i = 0; i < waxBurstCount; i += 1) {
        const ang = -Math.PI / 2 + (Math.random() * 1.8 - 0.9);
        const mag = 110 + Math.random() * 180;
        this.spawnParticle(
          px + (Math.random() * 8 - 4),
          py + 10 + (Math.random() * 5 - 2.5),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 10,
          0.64 + Math.random() * 0.3,
          0.92,
          1.9 + Math.random() * 2.4,
          pickRandom(CANDLE_HIT_WAX_COLORS),
          660
        );
      }
      return;
    }
    if (type === 'healbeam') {
      const fromX = Number.isFinite(event?.fromX) ? event.fromX : px;
      const fromY = Number.isFinite(event?.fromY) ? event.fromY : py;
      const toX = Number.isFinite(event?.toX) ? event.toX : px;
      const toY = Number.isFinite(event?.toY) ? event.toY : py;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const len = Math.hypot(dx, dy);
      const steps = Math.max(3, Math.min(14, Math.round(len / 18)));
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const bx = fromX + dx * t + (Math.random() * 4 - 2);
        const by = fromY + dy * t + (Math.random() * 4 - 2);
        const ang = Math.random() * Math.PI * 2;
        const mag = 34 + Math.random() * 62;
        this.spawnParticle(
          bx,
          by,
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 10,
          0.22 + Math.random() * 0.14,
          0.34,
          1.5 + Math.random() * 1.8,
          pickRandom(['#c6ffb8', '#89f0a4', '#e4ffd8']),
          180
        );
      }
      return;
    }
    if (type === 'healcircle') {
      const r = Math.max(34, Number(event?.r) || 96);
      const ringCount = this.scaledParticleCount(44, 8);
      for (let i = 0; i < ringCount; i += 1) {
        const ang = (Math.PI * 2 * i) / ringCount + (Math.random() * 0.12 - 0.06);
        const ringR = r * (0.72 + Math.random() * 0.36);
        const sx = px + Math.cos(ang) * ringR;
        const sy = py + Math.sin(ang) * ringR;
        const mag = 48 + Math.random() * 74;
        this.spawnParticle(
          sx,
          sy,
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - 8,
          0.38 + Math.random() * 0.16,
          0.52,
          1.8 + Math.random() * 2.2,
          pickRandom(['#9ff2ad', '#d7ffcf', '#66d98b']),
          220
        );
      }
      this.healCircles.push({
        x: px,
        y: py,
        r,
        life: 0.95,
        maxLife: 0.95,
      });
      if (this.healCircles.length > MAX_HEAL_CIRCLES) {
        this.healCircles.splice(0, this.healCircles.length - MAX_HEAL_CIRCLES);
      }
      return;
    }

    let count = 8;
    let colors = [palette.soft, '#ffffff'];
    let speed = 180;
    let life = 0.3;
    let gravity = 420;
    let sizeBase = 1.8;
    let sizeRand = 2.7;

    if (type === 'resource') {
      count = 12;
      colors = ['#f4c95d', '#fff4bf', '#9a7a20'];
      speed = 220;
      life = 0.42;
      gravity = 480;
    } else if (type === 'powerup') {
      count = 14;
      colors = ['#b88dff', '#79f3ff', '#fff3a3'];
      speed = 210;
      life = 0.48;
      gravity = 360;
    } else if (type === 'upgrade') {
      count = 16;
      colors = ['#7df0a7', '#d7ffd7', '#6fb0ff'];
      speed = 190;
      life = 0.5;
      gravity = 300;
    } else if (type === 'explosion') {
      count = 38;
      colors = ['#ffcf7a', '#ff8f5f', '#ffe8b7', '#ff6b4d'];
      speed = 340;
      life = 0.68;
      gravity = 500;
      sizeBase = 2.8;
      sizeRand = 3.8;
    } else if (type === 'dragon') {
      count = 24;
      colors = ['#ffd76e', '#ff9955', '#fff1b8', '#99f7ff'];
      speed = 320;
      life = 0.48;
      gravity = 540;
    } else if (type === 'dragonfire') {
      count = 30;
      colors = ['#ffc44c', '#ff8d47', '#ff5f35', '#ffe3a1'];
      speed = 330;
      life = 0.5;
      gravity = 520;
    } else if (type === 'gunhit') {
      count = 22;
      colors = ['#ffd58a', '#ff955f', '#ff6b4c', '#f2f6ff'];
      speed = 290;
      life = 0.42;
      gravity = 560;
    }

    const burstCount = this.scaledParticleCount(count, 2);
    for (let i = 0; i < burstCount; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const mag = speed * (0.45 + Math.random() * 0.65);
      this.spawnParticle(
        px,
        py,
        Math.cos(ang) * mag,
        Math.sin(ang) * mag - 40,
        life,
        life,
        sizeBase + Math.random() * sizeRand,
        colors[Math.floor(Math.random() * colors.length)],
        gravity
      );
    }
  }

  createGhostMinion(ghost, side, x, y) {
    if (!ghost || typeof ghost !== 'object') return null;
    const sideName = ghost.side === 'right' ? 'right' : (side === 'right' ? 'right' : 'left');
    return {
      side: sideName,
      x: Number.isFinite(ghost.x) ? ghost.x : (Number.isFinite(x) ? x : 0),
      y: Number.isFinite(ghost.y) ? ghost.y : (Number.isFinite(y) ? y : 0),
      r: Math.max(8, Number(ghost.r) || 14),
      hp: 100,
      maxHp: 100,
      tier: Math.max(0, Number(ghost.tier) || 0),
      level: Math.max(0, Number(ghost.level) || 1),
      super: Boolean(ghost.super),
      summoned: Boolean(ghost.summoned),
      necroRevived: Boolean(ghost.necroRevived),
      explosive: Boolean(ghost.explosive),
      gunner: Boolean(ghost.gunner),
      rider: Boolean(ghost.rider),
      riderChargeReady: Boolean(ghost.riderChargeReady),
      riderSuperHorse: Boolean(ghost.riderSuperHorse),
      digger: Boolean(ghost.digger),
      diggerGoldFinder: Boolean(ghost.diggerGoldFinder),
      dragonSuperBreathUpgraded: Boolean(ghost.dragonSuperBreathUpgraded),
      shieldDarkMetalUpgraded: Boolean(ghost.shieldDarkMetalUpgraded),
      monkHealCircleUpgraded: Boolean(ghost.monkHealCircleUpgraded),
      necroExpertUpgraded: Boolean(ghost.necroExpertUpgraded),
      gunnerSkyCannonUpgraded: Boolean(ghost.gunnerSkyCannonUpgraded),
      digPhase: Number.isFinite(ghost.digPhase) ? ghost.digPhase : 0.8,
      monk: Boolean(ghost.monk),
      monkHealScale: Number.isFinite(ghost.monkHealScale) ? ghost.monkHealScale : 1,
      hero: Boolean(ghost.hero),
      heroSwing: Number.isFinite(ghost.heroSwing) ? ghost.heroSwing : 1.1,
      shieldBearer: Boolean(ghost.shieldBearer),
      shieldPushTtl: 0,
      shieldPushScale: 1,
      shieldDarkMetalTtl: Math.max(0, Number(ghost.shieldDarkMetalTtl) || 0),
      stoneGolem: Boolean(ghost.stoneGolem),
      golemSmashTtl: 0,
      golemShieldHp: 0,
      golemShieldMax: 0,
      golemShieldTtl: 0,
      president: Boolean(ghost.president),
      presidentSetup: Boolean(ghost.president),
      presidentAuraRadius: 180,
      dragon: Boolean(ghost.dragon),
      flying: Boolean(ghost.flying),
      flyPhase: Number.isFinite(ghost.flyPhase) ? ghost.flyPhase : 0.8,
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunFlashTtl: 0,
      necrominion: Boolean(ghost.necrominion),
      failedSpecialType: typeof ghost.failedSpecialType === 'string' ? ghost.failedSpecialType : null,
      hitFlashTtl: 0,
    };
  }

  emitDeathGhost(event) {
    if (!event || typeof event !== 'object') return;
    const ghostMinion = this.createGhostMinion(event.ghost, event.side, event.x, event.y);
    if (!ghostMinion) return;
    const life = 0.72 + Math.random() * 0.24;
    const killerSide = event.killerSide === 'left' || event.killerSide === 'right' ? event.killerSide : null;
    const fallbackTilt = Math.random() < 0.5 ? -1 : 1;
    const tiltSign = killerSide
      ? (killerSide === 'left' ? 1 : -1)
      : fallbackTilt;
    this.deathGhosts.push({
      minion: ghostMinion,
      x: ghostMinion.x,
      y: ghostMinion.y,
      vx: Math.random() * 12 - 6,
      vy: -24 - Math.random() * 20,
      gravity: 168 + Math.random() * 90,
      rot: 0,
      rotV: tiltSign * (1.55 + Math.random() * 1.25),
      life,
      maxLife: life,
    });
    if (this.deathGhosts.length > MAX_DEATH_GHOSTS) {
      this.deathGhosts.splice(0, this.deathGhosts.length - MAX_DEATH_GHOSTS);
    }
  }

  emitReviveSpirit(event) {
    if (!event || typeof event !== 'object') return;
    const ghostMinion = this.createGhostMinion(event.ghost, event.side, event.x, event.y);
    if (!ghostMinion) return;
    const life = 0.62 + Math.random() * 0.22;
    const fromX = Number.isFinite(event.fromX) ? event.fromX : ghostMinion.x;
    const fromY = Number.isFinite(event.fromY) ? event.fromY : (ghostMinion.y - Math.max(12, ghostMinion.r * 0.6));
    const toX = Number.isFinite(event.toX) ? event.toX : ghostMinion.x;
    const toY = Number.isFinite(event.toY) ? event.toY : (ghostMinion.y - Math.max(8, ghostMinion.r * 0.22));
    this.reviveSpirits.push({
      minion: ghostMinion,
      x: ghostMinion.x,
      y: ghostMinion.y + Math.max(8, ghostMinion.r * 0.25),
      fromX,
      fromY,
      toX,
      toY,
      drift: Math.random() * 12 - 6,
      phase: Math.random() * Math.PI * 2,
      life,
      maxLife: life,
    });
    if (this.reviveSpirits.length > MAX_REVIVE_SPIRITS) {
      this.reviveSpirits.splice(0, this.reviveSpirits.length - MAX_REVIVE_SPIRITS);
    }
  }

  emitDiggerDirt(minion, x, y, dir, phase, shovelSwing) {
    if (!minion || !Number.isFinite(minion.id)) return;
    const mark = Math.floor(phase * 2.4);
    if (this.diggerDustMarks.get(minion.id) === mark) return;
    this.diggerDustMarks.set(minion.id, mark);
    if (this.diggerDustMarks.size > 2400) this.diggerDustMarks.clear();
    if (shovelSwing < 0.5) return;

    const r = Math.max(11, Number(minion.r) || 12);
    const burstX = x + dir * (r * 1.3);
    const burstY = y + r * 0.2;
    const colors = ['#8f7558', '#b89a75', '#6d5a44', '#9e825f'];
    const count = this.scaledParticleCount(3 + Math.floor(Math.random() * 3), 1);
    for (let i = 0; i < count; i += 1) {
      this.spawnParticle(
        burstX + (Math.random() * 3 - 1.5),
        burstY + (Math.random() * 2 - 1),
        dir * (70 + Math.random() * 90) + (Math.random() * 26 - 13),
        -40 - Math.random() * 55,
        0.34 + Math.random() * 0.26,
        0.6,
        1.6 + Math.random() * 1.9,
        colors[Math.floor(Math.random() * colors.length)],
        480 + Math.random() * 140
      );
    }
  }

  emitDamageNumber(amount, x, y) {
    const dmg = Math.max(1, Math.round(Number(amount) || 0));
    this.pushDamageText({
      amount: dmg,
      x: x + (Math.random() * 14 - 7),
      y: y + (Math.random() * 6 - 3),
      vx: Math.random() * 16 - 8,
      vy: -70 - Math.random() * 18,
      life: 0.8,
      maxLife: 0.8,
    });
  }

  emitHeroLine(text, x, y, side) {
    if (!text) return;
    this.pushHeroLine({
      text: String(text).slice(0, 56),
      side,
      x,
      y,
      life: 1.8,
      maxLife: 1.8,
      vy: -24,
    });
  }

  updateParticles(dt) {
    let write = 0;
    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      p.vy += p.gravity * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.recycleParticle(p);
        continue;
      }
      this.particles[write] = p;
      write += 1;
    }
    this.particles.length = write;
  }

  updateDeathGhosts(dt) {
    let write = 0;
    for (let i = 0; i < this.deathGhosts.length; i += 1) {
      const g = this.deathGhosts[i];
      g.vy += g.gravity * dt;
      g.vx *= 0.985;
      g.vy *= 0.985;
      g.rotV *= 0.986;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.rot += g.rotV * dt;
      g.life -= dt;
      if (g.minion) {
        g.minion.x = g.x;
        g.minion.y = g.y;
      }
      if (g.life <= 0) continue;
      this.deathGhosts[write] = g;
      write += 1;
    }
    this.deathGhosts.length = write;
  }

  updateReviveSpirits(dt) {
    let write = 0;
    for (let i = 0; i < this.reviveSpirits.length; i += 1) {
      const g = this.reviveSpirits[i];
      g.phase += dt * 6.5;
      g.y -= dt * (70 + Math.sin(g.phase) * 10);
      g.x += Math.sin(g.phase) * dt * (12 + g.drift * 0.5);
      g.life -= dt;
      if (g.minion) {
        g.minion.x = g.x;
        g.minion.y = g.y;
      }
      if (g.life <= 0) continue;
      this.reviveSpirits[write] = g;
      write += 1;
    }
    this.reviveSpirits.length = write;
  }

  updateHealCircles(dt) {
    if (!Array.isArray(this.healCircles) || this.healCircles.length === 0) return;
    let write = 0;
    for (let i = 0; i < this.healCircles.length; i += 1) {
      const ring = this.healCircles[i];
      ring.life -= dt;
      if (ring.life <= 0) continue;
      this.healCircles[write] = ring;
      write += 1;
    }
    this.healCircles.length = write;
  }

  updateDamageTexts(dt) {
    let write = 0;
    for (let i = 0; i < this.damageTexts.length; i += 1) {
      const t = this.damageTexts[i];
      t.vy -= 50 * dt;
      t.vx *= 0.96;
      t.vy *= 0.98;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) continue;
      this.damageTexts[write] = t;
      write += 1;
    }
    this.damageTexts.length = write;
  }

  updateHeroLines(dt) {
    let write = 0;
    for (let i = 0; i < this.heroLines.length; i += 1) {
      const b = this.heroLines[i];
      b.y += b.vy * dt;
      b.vy -= 18 * dt;
      b.life -= dt;
      if (b.life <= 0) continue;
      this.heroLines[write] = b;
      write += 1;
    }
    this.heroLines.length = write;
  }

  registerTowerImpact(side, x, y, intensity = 1) {
    const key = side === 'right' ? 'right' : 'left';
    const state = this.towerShake[key];
    const mag = Math.max(0.7, Number(intensity) || 1);
    state.ttl = Math.max(state.ttl, 0.16 + mag * 0.05);
    state.amp = Math.min(8, state.amp + 1.1 + mag * 0.8);

    const burstCount = this.scaledParticleCount(12, 2);
    for (let i = 0; i < burstCount; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const magV = 60 + Math.random() * 150;
      this.spawnParticle(
        x + (Math.random() * 7 - 3.5),
        y + (Math.random() * 5 - 2.5),
        Math.cos(ang) * magV,
        Math.sin(ang) * magV - 18,
        0.35 + Math.random() * 0.2,
        0.56,
        1.6 + Math.random() * 2.2,
        pickRandom(TOWER_IMPACT_PARTICLE_COLORS),
        620
      );
    }
  }

  updateGameOverCinematic(snapshot, world, nowMs, dt) {
    void dt;
    if (!snapshot?.gameOver || !world) {
      this.gameOverCinematic.active = false;
      return;
    }

    const winner = snapshot.winner === 'right' ? 'right' : 'left';
    const loser = winner === 'left' ? 'right' : 'left';
    const state = this.gameOverCinematic;
    if (!state.active || state.winner !== winner) {
      state.active = true;
      state.startMs = nowMs;
      state.winner = winner;
      state.loser = loser;
      state.lastBurstMs = 0;
    }

    if (!this.isGameOverCinematicActive(nowMs)) return;

    const progress = this.gameOverCinematicProgress(nowMs);
    const towerX = loser === 'left' ? world.towerLeftX : world.towerRightX;
    const baseY = world.towerY;
    const burstGap = 70 - Math.min(30, progress * 30);
    if (nowMs - state.lastBurstMs >= burstGap) {
      const impactY = baseY - 110 + Math.random() * 150;
      this.registerTowerImpact(loser, towerX + (Math.random() * 20 - 10), impactY, 1.2 + progress * 1.7);

      const chunkCount = this.scaledParticleCount(18 + Math.floor(progress * 16), 4);
      for (let i = 0; i < chunkCount; i += 1) {
        const ang = Math.random() * Math.PI * 2;
        const mag = 100 + Math.random() * (180 + progress * 120);
        this.spawnParticle(
          towerX + (Math.random() * 36 - 18),
          impactY + (Math.random() * 30 - 15),
          Math.cos(ang) * mag,
          Math.sin(ang) * mag - (40 + progress * 45),
          0.55 + Math.random() * 0.46,
          0.96,
          2 + Math.random() * 3.8,
          pickRandom(TOWER_COLLAPSE_PARTICLE_COLORS),
          660
        );
      }
      state.lastBurstMs = nowMs;
    }
  }

  gameOverCinematicProgress(nowMs = performance.now()) {
    const state = this.gameOverCinematic;
    if (!state.active) return 1;
    const elapsed = Math.max(0, nowMs - state.startMs);
    return Math.max(0, Math.min(1, elapsed / state.durationMs));
  }

  isGameOverCinematicActive(nowMs = performance.now()) {
    const state = this.gameOverCinematic;
    if (!state.active) return false;
    return nowMs - state.startMs < state.durationMs;
  }

  drawTowerCollapseCinematic(world, nowMs = performance.now()) {
    const state = this.gameOverCinematic;
    if (!state.active || !world) return;
    const loser = state.loser === 'right' ? 'right' : 'left';
    const x = loser === 'left' ? world.towerLeftX : world.towerRightX;
    const y = world.towerY;
    const dir = loser === 'left' ? -1 : 1;
    const p = this.gameOverCinematicProgress(nowMs);
    const ease = 1 - (1 - p) ** 3;
    const drop = ease * 160;
    const angle = dir * (0.02 + ease * 1.15);

    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = 0.26 + Math.min(0.56, p * 0.7);
    const dust = ctx.createRadialGradient(x, y + 26, 8, x, y + 26, 180 + p * 80);
    dust.addColorStop(0, 'rgba(211, 189, 165, 0.48)');
    dust.addColorStop(0.4, 'rgba(127, 110, 94, 0.32)');
    dust.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = dust;
    ctx.beginPath();
    ctx.ellipse(x, y + 26, 180 + p * 80, 66 + p * 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(x, y - 112 + drop);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.42 + (1 - p) * 0.3;
    ctx.fillStyle = '#526479';
    ctx.fillRect(-58, -132, 116, 236);
    ctx.fillStyle = '#364659';
    ctx.fillRect(-42, -114, 84, 18);
    ctx.fillRect(-42, -70, 84, 14);
    ctx.fillRect(-42, -30, 84, 14);
    ctx.fillRect(-42, 10, 84, 14);
    ctx.strokeStyle = '#98adbf';
    ctx.globalAlpha = 0.38 + (1 - p) * 0.24;
    ctx.lineWidth = 4;
    ctx.strokeRect(-58, -132, 116, 236);
    ctx.restore();
  }

  updateTowerShake(dt) {
    for (const key of ['left', 'right']) {
      const s = this.towerShake[key];
      s.ttl = Math.max(0, s.ttl - dt);
      s.amp = Math.max(0, s.amp - dt * 15);
      if (s.ttl === 0 && s.amp < 0.08) s.amp = 0;
    }
  }

  towerShakeOffset(side) {
    const key = side === 'right' ? 'right' : 'left';
    const s = this.towerShake[key];
    if (!s || s.ttl <= 0 || s.amp <= 0) return { x: 0, y: 0 };
    const t = performance.now() * 0.001 + s.seed;
    const fade = Math.max(0, Math.min(1, s.ttl / 0.28));
    const amp = s.amp * fade;
    return {
      x: Math.sin(t * 52) * amp,
      y: Math.cos(t * 37) * amp * 0.48,
    };
  }

  drawDamageTexts() {
    const { ctx } = this;
    for (const t of this.damageTexts) {
      const a = Math.max(0, t.life / t.maxLife);
      const size = Math.min(32, 14 + Math.log10(t.amount + 1) * 7);
      ctx.globalAlpha = 0.2 + a * 0.8;
      ctx.font = `bold ${size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#3b0707';
      ctx.lineWidth = 3;
      ctx.strokeText(`${t.amount}`, t.x, t.y);
      ctx.fillStyle = '#ff5656';
      ctx.fillText(`${t.amount}`, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  drawHeroLines() {
    const { ctx } = this;
    for (const b of this.heroLines) {
      const alpha = Math.max(0, b.life / b.maxLife);
      const w = Math.max(96, Math.min(290, b.text.length * 6.4 + 22));
      const h = 24;
      const x = b.x;
      const y = b.y;
      const bg = b.side === 'right' ? '#54231fcc' : '#203d59cc';
      const stroke = b.side === 'right' ? '#ffb19b' : '#a8d9ff';

      ctx.globalAlpha = 0.22 + alpha * 0.78;
      ctx.fillStyle = bg;
      ctx.fillRect(x - w / 2, y - h, w, h);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x - w / 2, y - h, w, h);
      ctx.beginPath();
      ctx.moveTo(x - 7, y);
      ctx.lineTo(x + 7, y);
      ctx.lineTo(x, y + 8);
      ctx.closePath();
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff7e0';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.text, x, y - 8);
    }
    ctx.globalAlpha = 1;
  }

  drawParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.75 + 0.5 * a), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawDeathGhosts() {
    const { ctx } = this;
    for (const g of this.deathGhosts) {
      if (!g?.minion) continue;
      const life = Math.max(0, g.life / g.maxLife);
      const fade = life ** 0.8;
      const sway = Math.sin((1 - life) * Math.PI * 1.2) * 0.07;
      const sideName = g.minion.side === 'right' ? 'right' : 'left';
      const tintFill = sideName === 'right' ? '#ff7474' : '#5db5ff';
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot + sway);
      ctx.translate(-g.x, -g.y);
      if (this.fxQuality === 'low') {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.12 + fade * 0.25;
        this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });
      } else if (this.fxQuality === 'medium') {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.16 + fade * 0.35;
        ctx.filter = 'grayscale(1) saturate(0) brightness(2.3)';
        this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });
      } else {
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.16 + fade * 0.4;
        ctx.filter = 'grayscale(1) saturate(0) brightness(2.3)';
        this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });

        // Team tint as a sprite-shaped glow, avoiding rectangular overlays.
        ctx.filter = 'grayscale(1) saturate(0) brightness(2.5)';
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.12 + fade * 0.2;
        ctx.shadowColor = tintFill;
        ctx.shadowBlur = 12 + fade * 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  }

  drawReviveSpirits() {
    const { ctx } = this;
    for (const g of this.reviveSpirits) {
      if (!g?.minion) continue;
      const life = Math.max(0, g.life / g.maxLife);
      const rise = 1 - life;
      const scale = 0.42 + rise * 0.92;
      const glow = 0.2 + life * 0.42;

      const beamFromX = Number.isFinite(g.fromX) ? g.fromX : g.x;
      const beamFromY = Number.isFinite(g.fromY) ? g.fromY : g.y;
      const beamToX = Number.isFinite(g.toX) ? g.toX : g.x;
      const beamToY = Number.isFinite(g.toY) ? g.toY : g.y;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.24 + life * 0.58;
      const beamGrad = ctx.createLinearGradient(beamFromX, beamFromY, beamToX, beamToY);
      beamGrad.addColorStop(0, '#ffffff');
      beamGrad.addColorStop(0.5, '#f8fdff');
      beamGrad.addColorStop(1, '#eff8ff');
      ctx.strokeStyle = beamGrad;
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.8 + life * 2.8;
      ctx.beginPath();
      ctx.moveTo(beamFromX, beamFromY);
      ctx.lineTo(beamToX, beamToY);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.scale(scale, scale);
      ctx.translate(-g.x, -g.y);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.18 + life * 0.55;
      ctx.filter = 'grayscale(1) saturate(0) brightness(2.5)';
      this.drawMinionSprite(g.minion, { showHud: false, allowEffects: false });
      ctx.filter = 'none';

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = glow;
      const ringR = Math.max(16, (Number(g.minion.r) || 12) * (1 + rise * 1.35));
      ctx.strokeStyle = '#9fffe4';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(g.x, g.y + Math.max(2, (Number(g.minion.r) || 12) * 0.28), ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'source-over';
  }

  drawHealCircles() {
    if (!Array.isArray(this.healCircles) || this.healCircles.length === 0) return;
    const { ctx } = this;
    for (const ring of this.healCircles) {
      const life = Math.max(0, Math.min(1, ring.life / ring.maxLife));
      const x = Number(ring.x) || 0;
      const y = Number(ring.y) || 0;
      const baseR = Math.max(28, Number(ring.r) || 96);
      const expand = 1 + (1 - life) * 0.2;
      const drawR = baseR * expand;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.2 + life * 0.35;
      const glow = ctx.createRadialGradient(x, y, drawR * 0.3, x, y, drawR * 1.15);
      glow.addColorStop(0, '#ceffcf66');
      glow.addColorStop(0.62, '#7ff0a355');
      glow.addColorStop(1, '#7ff0a300');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, drawR * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.35 + life * 0.5;
      ctx.strokeStyle = '#b9ffd4';
      ctx.lineWidth = 2.4 + life * 1.6;
      ctx.beginPath();
      ctx.arc(x, y, drawR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  sideArcherPulls(sideName, sideState) {
    const fallbackPullX = sideName === 'right' ? 0.8 : -0.8;
    const pulls = Array.isArray(sideState?.archerPulls) && sideState.archerPulls.length
      ? sideState.archerPulls
      : [{ pullX: sideState?.pullX, pullY: sideState?.pullY, archerAimY: sideState?.archerAimY }];
    return pulls.map((pull, idx) => ({
      pullX: Number.isFinite(pull?.pullX) ? pull.pullX : fallbackPullX,
      pullY: Number.isFinite(pull?.pullY) ? pull.pullY : 0,
      archerAimY: Number.isFinite(pull?.archerAimY)
        ? pull.archerAimY
        : ((Number(sideState?.archerAimY) || (900 / 2 - 56)) - idx * 78),
    }));
  }

  drawAimGuide(side, ox, oy, angle, strength) {
    const { ctx } = this;
    const palette = TEAM_COLORS[side];
    const len = 90 + strength * 180;
    const lineW = 1.5 + strength * 3.5;
    const alpha = 0.35 + strength * 0.55;
    const ex = ox + Math.cos(angle) * len;
    const ey = oy + Math.sin(angle) * len;

    ctx.strokeStyle = `rgba(255,255,255,${0.18 + strength * 0.35})`;
    ctx.lineWidth = lineW + 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.strokeStyle = this.withAlpha(palette.primary, alpha);
    ctx.lineWidth = lineW;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    ctx.fillStyle = this.withAlpha(palette.soft, alpha);
    ctx.beginPath();
    ctx.arc(ex, ey, 2.5 + strength * 3.5, 0, Math.PI * 2);
    ctx.fill();

    const px = ox + Math.cos(angle) * 40;
    const py = oy + Math.sin(angle) * 40;
    ctx.fillStyle = this.withAlpha('#ffffff', 0.65);
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(strength * 100)}%`, px, py - 6);
  }

  withAlpha(hex, alpha) {
    const clean = hex.replace('#', '');
    const n = Number.parseInt(clean, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  drawUpgradeGlyph(type, x, y, size = 7, color = '#1f2230') {
    const { ctx } = this;
    const s = Math.max(4, Number(size) || 7);
    const lineW = Math.max(1, s * 0.18);

    const drawArrow = (sx, sy, ex, ey, headScale = 0.3) => {
      const dx = ex - sx;
      const dy = ey - sy;
      const ang = Math.atan2(dy, dx);
      const headLen = s * headScale;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.cos(ang - Math.PI / 6) * headLen, ey - Math.sin(ang - Math.PI / 6) * headLen);
      ctx.lineTo(ex - Math.cos(ang + Math.PI / 6) * headLen, ey - Math.sin(ang + Math.PI / 6) * headLen);
      ctx.closePath();
      ctx.fill();
    };

    const drawBurst = (cx, cy, innerR, outerR, rays) => {
      for (let i = 0; i < rays; i += 1) {
        const ang = (Math.PI * 2 * i) / rays;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * innerR, cy + Math.sin(ang) * innerR);
        ctx.lineTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
        ctx.stroke();
      }
    };

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (type) {
      case 'arrowLevel': {
        drawArrow(-0.62 * s, 0.52 * s, 0.58 * s, -0.5 * s, 0.34);
        ctx.beginPath();
        ctx.moveTo(-0.58 * s, 0.4 * s);
        ctx.lineTo(-0.38 * s, 0.58 * s);
        ctx.lineTo(-0.52 * s, 0.62 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'unitLevel': {
        ctx.lineWidth = Math.max(1.2, s * 0.2);
        ctx.beginPath();
        ctx.moveTo(-0.44 * s, 0.5 * s);
        ctx.lineTo(0.5 * s, -0.44 * s);
        ctx.moveTo(-0.5 * s, -0.44 * s);
        ctx.lineTo(0.44 * s, 0.5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.58 * s, -0.52 * s);
        ctx.lineTo(0.36 * s, -0.3 * s);
        ctx.lineTo(0.7 * s, -0.26 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0.52 * s, 0.58 * s);
        ctx.lineTo(0.3 * s, 0.36 * s);
        ctx.lineTo(0.26 * s, 0.7 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-0.58 * s, 0.42 * s, 0.2 * s, 0.14 * s);
        ctx.fillRect(-0.56 * s, -0.56 * s, 0.2 * s, 0.14 * s);
        break;
      }
      case 'volleyLevel': {
        drawArrow(-0.6 * s, 0.55 * s, -0.16 * s, -0.5 * s, 0.26);
        drawArrow(-0.12 * s, 0.55 * s, 0.22 * s, -0.5 * s, 0.26);
        drawArrow(0.34 * s, 0.55 * s, 0.56 * s, -0.5 * s, 0.26);
        break;
      }
      case 'spawnLevel': {
        ctx.beginPath();
        ctx.arc(0, 0, 0.54 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -0.28 * s);
        ctx.moveTo(0, 0);
        ctx.lineTo(0.24 * s, 0.08 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-0.9 * s, -0.26 * s);
        ctx.lineTo(-0.56 * s, -0.26 * s);
        ctx.moveTo(-0.86 * s, 0.04 * s);
        ctx.lineTo(-0.48 * s, 0.04 * s);
        ctx.stroke();
        break;
      }
      case 'unitHpLevel': {
        ctx.beginPath();
        ctx.moveTo(0, 0.58 * s);
        ctx.bezierCurveTo(-0.64 * s, 0.14 * s, -0.62 * s, -0.44 * s, 0, -0.12 * s);
        ctx.bezierCurveTo(0.62 * s, -0.44 * s, 0.64 * s, 0.14 * s, 0, 0.58 * s);
        ctx.fill();
        break;
      }
      case 'resourceLevel': {
        ctx.beginPath();
        ctx.moveTo(0, -0.62 * s);
        ctx.lineTo(0.56 * s, -0.08 * s);
        ctx.lineTo(0, 0.62 * s);
        ctx.lineTo(-0.56 * s, -0.08 * s);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-0.5 * s, -0.08 * s);
        ctx.lineTo(0.5 * s, -0.08 * s);
        ctx.stroke();
        break;
      }
      case 'bountyLevel': {
        ctx.beginPath();
        ctx.arc(0, 0, 0.56 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = `bold ${Math.max(7, Math.round(s * 1.2))}px sans-serif`;
        ctx.fillText('$', 0, 0);
        break;
      }
      case 'powerLevel': {
        ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
          const ang = (-Math.PI / 2) + (Math.PI * 2 * i) / 10;
          const r = i % 2 === 0 ? 0.62 * s : 0.28 * s;
          const px = Math.cos(ang) * r;
          const py = Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'specialRateLevel': {
        const box = 1.06 * s;
        const half = box / 2;
        const radius = Math.max(1.8, s * 0.16);
        ctx.beginPath();
        ctx.moveTo(-half + radius, -half);
        ctx.lineTo(half - radius, -half);
        ctx.quadraticCurveTo(half, -half, half, -half + radius);
        ctx.lineTo(half, half - radius);
        ctx.quadraticCurveTo(half, half, half - radius, half);
        ctx.lineTo(-half + radius, half);
        ctx.quadraticCurveTo(-half, half, -half, half - radius);
        ctx.lineTo(-half, -half + radius);
        ctx.quadraticCurveTo(-half, -half, -half + radius, -half);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-0.22 * s, -0.18 * s, 0.13 * s, 0, Math.PI * 2);
        ctx.arc(0.22 * s, 0.02 * s, 0.13 * s, 0, Math.PI * 2);
        ctx.arc(-0.02 * s, 0.24 * s, 0.13 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'dragonLevel': {
        ctx.beginPath();
        ctx.moveTo(-0.64 * s, 0.32 * s);
        ctx.lineTo(-0.2 * s, -0.54 * s);
        ctx.lineTo(0.2 * s, -0.18 * s);
        ctx.lineTo(0.56 * s, -0.28 * s);
        ctx.lineTo(0.38 * s, 0.06 * s);
        ctx.lineTo(0.62 * s, 0.42 * s);
        ctx.lineTo(0.12 * s, 0.26 * s);
        ctx.lineTo(-0.18 * s, 0.54 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'dragonSuperBreathLevel': {
        ctx.beginPath();
        ctx.moveTo(0, -0.62 * s);
        ctx.lineTo(0.58 * s, 0.36 * s);
        ctx.lineTo(0.12 * s, 0.18 * s);
        ctx.lineTo(0, 0.62 * s);
        ctx.lineTo(-0.12 * s, 0.18 * s);
        ctx.lineTo(-0.58 * s, 0.36 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'shieldDarkMetalLevel': {
        ctx.beginPath();
        ctx.moveTo(0, -0.64 * s);
        ctx.lineTo(0.54 * s, -0.34 * s);
        ctx.lineTo(0.4 * s, 0.38 * s);
        ctx.lineTo(0, 0.64 * s);
        ctx.lineTo(-0.4 * s, 0.38 * s);
        ctx.lineTo(-0.54 * s, -0.34 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'monkHealCircleLevel': {
        ctx.beginPath();
        ctx.arc(0, 0, 0.58 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillRect(-0.13 * s, -0.44 * s, 0.26 * s, 0.88 * s);
        ctx.fillRect(-0.44 * s, -0.13 * s, 0.88 * s, 0.26 * s);
        break;
      }
      case 'necroExpertSummonerLevel': {
        ctx.beginPath();
        ctx.arc(0, -0.08 * s, 0.46 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-0.18 * s, -0.14 * s, 0.08 * s, 0, Math.PI * 2);
        ctx.arc(0.18 * s, -0.14 * s, 0.08 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-0.22 * s, 0.22 * s, 0.44 * s, 0.16 * s);
        drawArrow(0, 0.66 * s, 0, 0.3 * s, 0.24);
        break;
      }
      case 'riderSuperHorseLevel': {
        ctx.lineWidth = Math.max(1.2, s * 0.22);
        ctx.beginPath();
        ctx.moveTo(-0.46 * s, -0.42 * s);
        ctx.quadraticCurveTo(0, 0.68 * s, 0.46 * s, -0.42 * s);
        ctx.stroke();
        ctx.fillRect(-0.48 * s, -0.5 * s, 0.16 * s, 0.2 * s);
        ctx.fillRect(0.32 * s, -0.5 * s, 0.16 * s, 0.2 * s);
        break;
      }
      case 'diggerGoldFinderLevel': {
        ctx.beginPath();
        ctx.moveTo(-0.34 * s, 0.48 * s);
        ctx.lineTo(0.32 * s, -0.3 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-0.5 * s, -0.06 * s);
        ctx.lineTo(0.02 * s, -0.24 * s);
        ctx.lineTo(-0.08 * s, -0.44 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0.5 * s, 0.34 * s, 0.16 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'gunnerSkyCannonLevel': {
        ctx.beginPath();
        ctx.arc(-0.14 * s, 0.26 * s, 0.72 * s, Math.PI * 1.06, Math.PI * 1.52);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0.38 * s, -0.26 * s, 0.16 * s, 0, Math.PI * 2);
        ctx.fill();
        drawBurst(0.56 * s, -0.44 * s, 0.06 * s, 0.24 * s, 6);
        break;
      }
      case 'superMinionLevel': {
        ctx.beginPath();
        ctx.moveTo(-0.62 * s, 0.42 * s);
        ctx.lineTo(-0.52 * s, -0.02 * s);
        ctx.lineTo(-0.22 * s, 0.16 * s);
        ctx.lineTo(0, -0.36 * s);
        ctx.lineTo(0.22 * s, 0.16 * s);
        ctx.lineTo(0.52 * s, -0.02 * s);
        ctx.lineTo(0.62 * s, 0.42 * s);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0.26 * s, 0.1 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      default: {
        ctx.beginPath();
        ctx.arc(0, 0, 0.2 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  spawnEveryForSide(sideState) {
    const spawnLevel = Math.max(1, Number(sideState?.spawnLevel) || 1);
    return Math.max(0.65, 2.2 - spawnLevel * 0.09);
  }

  specialSpawnRateBonus(sideState) {
    const level = Math.max(1, Number(sideState?.specialRateLevel) || 1);
    return Math.min(0.24, (level - 1) * 0.03);
  }

  specialSpawnChanceForType(sideState, specialType) {
    const base = Number(SPECIAL_SPAWN_BASE_CHANCE[specialType]);
    if (!Number.isFinite(base)) return null;
    let chance = base + this.specialSpawnRateBonus(sideState);
    if (specialType === 'dragon') {
      const dragonLevel = Math.max(0, Number(sideState?.dragonLevel) || 0);
      chance += Math.max(0, dragonLevel - 1) * 0.014;
    }
    if (specialType === 'super') {
      const superLevel = Math.max(0, Number(sideState?.superMinionLevel) || 0);
      chance += Math.max(0, superLevel - 1) * 0.018;
    }
    return Math.max(0.08, Math.min(0.92, chance));
  }

  candleSpawnChance(sideState) {
    const chance = CANDLE_SPAWN_BASE_CHANCE + this.specialSpawnRateBonus(sideState);
    return Math.max(CANDLE_SPAWN_BASE_CHANCE, Math.min(0.92, chance));
  }

  specialSpawnChanceForRow(sideState, rowType) {
    if (rowType === 'candle') return this.candleSpawnChance(sideState);
    const specialType = ROW_TO_SPECIAL_TYPE[rowType];
    if (!specialType) return null;
    if (specialType === 'hero' && !sideState?.towerDamagedOnce) return 0;
    return this.specialSpawnChanceForType(sideState, specialType);
  }

  specialCooldownMultiplierAt(matchTimeSec = 0) {
    const safeT = Math.max(0, Number(matchTimeSec) || 0);
    const totalSteps = Math.max(1, Math.round(SPECIAL_COOLDOWN_RAMP_SECONDS / SPECIAL_COOLDOWN_STEP_SECONDS));
    const elapsedSteps = Math.min(totalSteps, Math.floor(safeT / SPECIAL_COOLDOWN_STEP_SECONDS));
    const dropPerStep = (SPECIAL_COOLDOWN_START_MULT - SPECIAL_COOLDOWN_END_MULT) / totalSteps;
    const mult = SPECIAL_COOLDOWN_START_MULT - elapsedSteps * dropPerStep;
    return Math.max(SPECIAL_COOLDOWN_END_MULT, Math.min(SPECIAL_COOLDOWN_START_MULT, mult));
  }

  scaledSpecialEveryForUi(baseEvery, matchTimeSec = 0) {
    if (!Number.isFinite(baseEvery)) return baseEvery;
    return Math.max(1, Math.round(baseEvery * this.specialCooldownMultiplierAt(matchTimeSec)));
  }

  failedSpecialLabel(type) {
    if (type === 'necrominion') return 'Necro';
    if (type === 'gunner') return 'Gunner';
    if (type === 'rider') return 'Rider';
    if (type === 'digger') return 'Digger';
    if (type === 'monk') return 'Monk';
    if (type === 'shield') return 'Shield';
    if (type === 'hero') return 'Hero';
    if (type === 'president') return 'President';
    if (type === 'dragon') return 'Dragon';
    if (type === 'super') return 'Super';
    return 'Special';
  }

  trainingEveryForType(sideState, type, matchTimeSec = 0) {
    const s = sideState || {};
    const unit = Math.max(1, Number(s.unitLevel) || 1);
    const hp = Math.max(1, Number(s.unitHpLevel) || 1);
    const arrow = Math.max(1, Number(s.arrowLevel) || 1);
    const spawn = Math.max(1, Number(s.spawnLevel) || 1);
    const resource = Math.max(1, Number(s.resourceLevel) || 1);
    const power = Math.max(1, Number(s.powerLevel) || 1);
    const eco = Math.max(0, Number(s.economyLevel) || 0);
    const dragon = Math.max(0, Number(s.dragonLevel) || 0);
    const sup = Math.max(0, Number(s.superMinionLevel) || 0);
    const mythicPressure = Math.floor((power + eco) / 6);
    if (type === 'militia') return 1;
    if (type === 'candle') {
      const tech = Math.floor((spawn + resource + eco) / 6);
      const baseEvery = Math.max(24, 35 - tech);
      return Math.max(12, Math.round(baseEvery * CANDLE_SPAWN_COOLDOWN_MULT));
    }
    if (type === 'necro') return this.scaledSpecialEveryForUi(12, matchTimeSec);
    if (type === 'gunner') return this.scaledSpecialEveryForUi(Math.max(14, 22 - Math.floor((unit + arrow + eco) / 6)), matchTimeSec);
    if (type === 'rider') return this.scaledSpecialEveryForUi(Math.max(15, 23 - Math.floor((unit + spawn + eco) / 5)), matchTimeSec);
    if (type === 'digger') return this.scaledSpecialEveryForUi(Math.max(14, 24 - Math.floor((hp + spawn + eco) / 6)), matchTimeSec);
    if (type === 'monk') return this.scaledSpecialEveryForUi(Math.max(20, 30 - Math.floor((hp + power + resource) / 7)), matchTimeSec);
    if (type === 'shield') return this.scaledSpecialEveryForUi(Math.max(17, 26 - Math.floor((hp + power + spawn) / 6)) * 4, matchTimeSec);
    if (type === 'hero') {
      if (!s.towerDamagedOnce) return Infinity;
      return this.scaledSpecialEveryForUi(Math.max(38, 56 - Math.floor((unit + power + eco) / 7)) * 10, matchTimeSec);
    }
    if (type === 'president') return this.scaledSpecialEveryForUi(Math.max(36, 54 - Math.floor((eco + resource + power) / 6)), matchTimeSec);
    if (type === 'dragon') return dragon <= 0 ? Infinity : this.scaledSpecialEveryForUi(Math.max(34, 68 - dragon * 5 - mythicPressure * 2), matchTimeSec);
    if (type === 'super') return sup <= 0 ? Infinity : this.scaledSpecialEveryForUi(Math.max(28, 58 - sup * 4), matchTimeSec);
    return Infinity;
  }

  trainingInSpawns(sideState, every) {
    if (!Number.isFinite(every) || every <= 0) return Infinity;
    const spawnCount = Math.max(0, Math.floor(Number(sideState?.spawnCount) || 0));
    if (every <= 1) return 1;
    const rem = spawnCount % every;
    const steps = (every - rem) % every;
    return steps === 0 ? every : steps;
  }

  emptyBarracksCounts() {
    return {
      militia: 0,
      necro: 0,
      gunner: 0,
      rider: 0,
      digger: 0,
      monk: 0,
      shield: 0,
      hero: 0,
      president: 0,
      dragon: 0,
      super: 0,
      candle: 0,
    };
  }

  buildBarracksActiveCounts(snapshot = null) {
    const counts = {
      left: this.emptyBarracksCounts(),
      right: this.emptyBarracksCounts(),
    };
    const minions = Array.isArray(snapshot?.minions) ? snapshot.minions : [];
    for (const m of minions) {
      if (!m || (Number(m.hp) || 0) <= 0) continue;
      const side = m.side === 'right' ? 'right' : 'left';
      const sideCounts = counts[side];
      if (m.super) {
        sideCounts.super += 1;
        continue;
      }
      if (m.dragon) {
        sideCounts.dragon += 1;
        continue;
      }
      if (m.digger) {
        sideCounts.digger += 1;
        continue;
      }
      if (m.gunner) {
        sideCounts.gunner += 1;
        continue;
      }
      if (m.necrominion) {
        sideCounts.necro += 1;
        continue;
      }
      if (m.rider) {
        sideCounts.rider += 1;
        continue;
      }
      if (m.hero) {
        sideCounts.hero += 1;
        continue;
      }
      if (m.monk) {
        sideCounts.monk += 1;
        continue;
      }
      if (m.shieldBearer) {
        sideCounts.shield += 1;
        continue;
      }
      if (m.president) {
        sideCounts.president += 1;
        continue;
      }
      if (m.stoneGolem) continue;
      sideCounts.militia += 1;
    }

    const candles = Array.isArray(snapshot?.candles)
      ? snapshot.candles
      : (snapshot?.candle ? [snapshot.candle] : []);
    for (const candle of candles) {
      if (!candle || candle.destroyed) continue;
      const side = candle.spawnSide === 'right' ? 'right' : 'left';
      counts[side].candle += 1;
    }

    return counts;
  }

  barracksRows(sideState, sideName = 'left', minions = [], candles = [], precomputedCounts = null, matchTimeSec = 0) {
    const side = sideName === 'right' ? 'right' : 'left';
    const candleCd = Math.max(0, Number(sideState?.candleCd) || 0);
    const candleActive = Boolean(sideState?.candleActive);
    const activeCountByType = this.emptyBarracksCounts();
    if (precomputedCounts && typeof precomputedCounts === 'object') {
      for (const key of Object.keys(activeCountByType)) {
        activeCountByType[key] = Math.max(0, Number(precomputedCounts[key]) || 0);
      }
    } else {
      const liveMinions = Array.isArray(minions)
        ? minions.filter((m) => m && m.side === side && (Number(m.hp) || 0) > 0)
        : [];
      for (const m of liveMinions) {
        if (m.super) {
          activeCountByType.super += 1;
          continue;
        }
        if (m.dragon) {
          activeCountByType.dragon += 1;
          continue;
        }
        if (m.digger) {
          activeCountByType.digger += 1;
          continue;
        }
        if (m.gunner) {
          activeCountByType.gunner += 1;
          continue;
        }
        if (m.necrominion) {
          activeCountByType.necro += 1;
          continue;
        }
        if (m.rider) {
          activeCountByType.rider += 1;
          continue;
        }
        if (m.hero) {
          activeCountByType.hero += 1;
          continue;
        }
        if (m.monk) {
          activeCountByType.monk += 1;
          continue;
        }
        if (m.shieldBearer) {
          activeCountByType.shield += 1;
          continue;
        }
        if (m.president) {
          activeCountByType.president += 1;
          continue;
        }
        if (m.stoneGolem) continue;
        activeCountByType.militia += 1;
      }
      if (Array.isArray(candles)) {
        for (const candle of candles) {
          if (!candle || candle.destroyed) continue;
          const candleSide = candle.spawnSide === 'right' ? 'right' : 'left';
          if (candleSide === side) activeCountByType.candle += 1;
        }
      }
    }
    const levelOf = {
      militia: Math.max(1, Number(sideState?.unitLevel) || 1),
      necro: Math.max(1, Number(sideState?.unitLevel) || 1),
      gunner: Math.max(1, Number(sideState?.arrowLevel) || 1),
      rider: Math.max(1, Number(sideState?.unitLevel) || 1),
      digger: Math.max(1, Number(sideState?.unitHpLevel) || 1),
      monk: Math.max(1, Number(sideState?.powerLevel) || 1),
      shield: Math.max(1, Number(sideState?.unitHpLevel) || 1),
      hero: Math.max(1, Number(sideState?.powerLevel) || 1),
      president: Math.max(1, Number(sideState?.resourceLevel) || 1),
      dragon: Math.max(0, Number(sideState?.dragonLevel) || 0),
      super: Math.max(0, Number(sideState?.superMinionLevel) || 0),
      candle: candleActive ? 1 : 0,
    };
    const rows = [
      { type: 'militia', label: 'Militia', color: '#d8dde6', unlockHint: '' },
      { type: 'necro', label: 'Necro', color: '#8ff7cc', unlockHint: '' },
      { type: 'gunner', label: 'Gunner', color: '#ffcc92', unlockHint: '' },
      { type: 'rider', label: 'Rider', color: '#d7c2a1', unlockHint: '' },
      { type: 'digger', label: 'Digger', color: '#b79a74', unlockHint: '' },
      { type: 'monk', label: 'Monk', color: '#cbffb6', unlockHint: '' },
      { type: 'shield', label: 'Shield', color: '#b0d7ff', unlockHint: '' },
      { type: 'hero', label: 'Hero', color: '#ffe2a0', unlockHint: 'after first hit' },
      { type: 'president', label: 'President', color: '#f1c7a2', unlockHint: '' },
      { type: 'dragon', label: 'Dragon', color: '#ff9c7b', unlockHint: 'need DR1' },
      { type: 'super', label: 'Super', color: '#fff2aa', unlockHint: 'need SU1' },
      { type: 'candle', label: 'Candle', color: '#ffd7a2', unlockHint: '' },
    ];

    const spawnEvery = this.spawnEveryForSide(sideState);
    const minionCd = Math.max(0, Number(sideState?.minionCd) || 0);
    const specialRollByType = sideState?.specialRollByType && typeof sideState.specialRollByType === 'object'
      ? sideState.specialRollByType
      : {};

    return rows.map((row) => {
      const rollChance = this.specialSpawnChanceForRow(sideState, row.type);
      const specialType = ROW_TO_SPECIAL_TYPE[row.type] || null;
      const lastRollEntry = specialType ? specialRollByType[specialType] : null;
      const lastRollSuccess = typeof lastRollEntry?.success === 'boolean' ? lastRollEntry.success : null;
      if (row.type === 'candle') {
        const every = this.trainingEveryForType(sideState, row.type, matchTimeSec);
        const inSpawns = Math.max(1, Math.floor(Number(sideState?.candleSpawnInSpawns) || every));
        const etaSec = candleActive ? 0 : candleCd;
        const cycleSeconds = Math.max(1, this.spawnEveryForSide(sideState) * Math.max(1, every));
        const progress = candleActive ? 1 : Math.max(0, Math.min(1, 1 - etaSec / cycleSeconds));
        const candleRollSuccess = typeof sideState?.candleRollSuccess === 'boolean'
          ? sideState.candleRollSuccess
          : null;
        return {
          ...row,
          level: levelOf[row.type],
          activeCount: activeCountByType[row.type] || 0,
          unlocked: true,
          every,
          inSpawns,
          progress,
          etaSec,
          candleActive,
          rollChance,
          lastRollSuccess: candleRollSuccess,
        };
      }
      const every = this.trainingEveryForType(sideState, row.type, matchTimeSec);
      const unlocked = Number.isFinite(every);
      const inSpawns = unlocked ? this.trainingInSpawns(sideState, every) : Infinity;
      const progress = unlocked && every > 1
        ? Math.max(0, Math.min(1, (every - inSpawns) / every))
        : (unlocked ? 1 : 0);
      const etaSec = unlocked
        ? (minionCd + Math.max(0, inSpawns - 1) * spawnEvery)
        : Infinity;
      return {
        ...row,
        level: levelOf[row.type],
        activeCount: activeCountByType[row.type] || 0,
        unlocked,
        every,
        inSpawns,
        progress,
        etaSec,
        rollChance,
        lastRollSuccess,
      };
    });
  }

  drawBarracks(side, sideState, world, snapshot = null, precomputedCounts = null) {
    const { ctx } = this;
    const sidePalette = TEAM_COLORS[side] || TEAM_COLORS.left;
    const panelW = 336;
    const panelH = 304;
    const panelX = side === 'left' ? 350 : world.w - 350;
    const panelY = world.groundY - panelH - 8;
    const bx = side === 'left' ? 220 : world.w - 220;
    const by = world.groundY - 8;
    const specialRateLevel = Math.max(1, Number(sideState?.specialRateLevel) || 1);
    const specialBonusPct = Math.round(this.specialSpawnRateBonus(sideState) * 100);
    const failType = typeof sideState?.specialFailType === 'string' ? sideState.specialFailType : null;
    const failTtl = Math.max(0, Number(sideState?.specialFailTtl) || 0);
    const rollType = typeof sideState?.specialRollType === 'string' ? sideState.specialRollType : null;
    const rollSuccess = typeof sideState?.specialRollSuccess === 'boolean' ? sideState.specialRollSuccess : null;
    const rollChance = Number(sideState?.specialRollChance);
    const rollValue = Number(sideState?.specialRollValue);

    // Barracks building silhouette.
    ctx.fillStyle = side === 'left' ? '#213650cc' : '#4a2830cc';
    ctx.fillRect(bx - 48, by - 88, 96, 80);
    ctx.strokeStyle = sidePalette.dark;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx - 48, by - 88, 96, 80);
    ctx.fillStyle = side === 'left' ? '#304d70d9' : '#633541d9';
    ctx.beginPath();
    ctx.moveTo(bx - 56, by - 88);
    ctx.lineTo(bx + 56, by - 88);
    ctx.lineTo(bx, by - 124);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#151e2e';
    ctx.fillRect(bx - 12, by - 42, 24, 34);
    ctx.fillStyle = sidePalette.primary;
    ctx.fillRect(bx - 2, by - 124, 4, 22);
    ctx.fillStyle = '#f5e6b9';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BARRACKS', bx, by - 58);

    // Training board.
    const px = panelX - panelW / 2;
    const py = panelY;
    const rows = this.barracksRows(
      sideState,
      side,
      snapshot?.minions,
      Array.isArray(snapshot?.candles)
        ? snapshot.candles
        : (snapshot?.candle ? [snapshot.candle] : []),
      precomputedCounts,
      Math.max(0, Number(snapshot?.t) || 0)
    );
    const rowH = 17;

    ctx.fillStyle = '#0f1625d0';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = this.withAlpha(sidePalette.primary, 0.72);
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    ctx.fillStyle = '#f1e3b4';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(side === 'left' ? 'West Barracks' : 'East Barracks', px + 10, py + 15);
    ctx.fillStyle = '#bac7da';
    ctx.font = '9px sans-serif';
    ctx.fillText(
      `Spawn L${Math.max(1, Number(sideState?.spawnLevel) || 1)} | Unit L${Math.max(1, Number(sideState?.unitLevel) || 1)} | HP L${Math.max(1, Number(sideState?.unitHpLevel) || 1)}`,
      px + 10,
      py + 28
    );
    ctx.fillStyle = '#9ec0e7';
    ctx.fillText(`Special Chance L${specialRateLevel} (+${specialBonusPct}%)`, px + 10, py + 38);
    if (
      rollType
      && Number.isFinite(rollChance)
      && Number.isFinite(rollValue)
      && rollSuccess != null
    ) {
      const statusTag = rollSuccess ? '[OK]' : '[X]';
      ctx.fillStyle = rollSuccess ? '#97f2c2' : '#ffb9a9';
      ctx.fillText(
        `Last roll ${statusTag} ${this.failedSpecialLabel(rollType)}`,
        px + 10,
        py + 48
      );
      this.drawSpecialRollOutcomeBar(px + 10, py + 52, panelW - 52, 9, rollChance, rollValue, rollSuccess);
      this.drawSpecialRollTypeBadge(rollType, px + panelW - 20, py + 56, side);
    } else {
      const fallbackText = failType && failTtl > 0
        ? `Last fail: ${this.failedSpecialLabel(failType)} (${Math.ceil(failTtl)}s)`
        : 'Last roll: waiting on first special attempt';
      ctx.fillStyle = '#8ea2bf';
      ctx.fillText(
        fallbackText,
        px + 10,
        py + 48
      );
      this.drawSpecialRollOutcomeBar(px + 10, py + 52, panelW - 52, 9, null, null, null);
      if (failType && failTtl > 0) this.drawSpecialRollTypeBadge(failType, px + panelW - 20, py + 56, side);
    }

    const colLabelX = px + 24;
    const colStatusX = px + 62;
    const colChanceX = px + 86;
    const colMetaX = px + 116;
    const barX = px + 162;
    const barYOff = -8;
    const barW = 78;
    const barH = 6;

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const ry = py + 76 + i * rowH;

      ctx.fillStyle = i % 2 === 0 ? '#162033a8' : '#121a2ba8';
      ctx.fillRect(px + 6, ry - 10, panelW - 12, rowH - 1);

      ctx.fillStyle = row.color;
      ctx.beginPath();
      ctx.arc(px + 16, ry - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#eaf0fc';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, colLabelX, ry + 1);
      let rowStatusTag = '[ ]';
      let rowStatusColor = '#9da8ba';
      if (row.lastRollSuccess === true) {
        rowStatusTag = '[OK]';
        rowStatusColor = '#8affcf';
      } else if (row.lastRollSuccess === false) {
        rowStatusTag = '[X]';
        rowStatusColor = '#ffb9a9';
      }
      ctx.fillStyle = rowStatusColor;
      ctx.fillText(rowStatusTag, colStatusX, ry + 1);
      const rowChancePct = Number.isFinite(row.rollChance) ? Math.round(row.rollChance * 100) : null;
      if (rowChancePct != null && row.unlocked && row.type !== 'militia') {
        ctx.fillStyle = '#9fc8ef';
        ctx.fillText(`${rowChancePct}%`, colChanceX, ry + 1);
      } else if (!row.unlocked && row.type !== 'militia') {
        ctx.fillStyle = '#7f8aa0';
        ctx.fillText('LOCK', colChanceX, ry + 1);
      }
      ctx.fillStyle = '#c7d4e9';
      const active = Math.max(0, Number(row.activeCount) || 0);
      ctx.fillText(`L${row.level} A${active}`, colMetaX, ry + 1);

      const barY = ry + barYOff;
      ctx.fillStyle = '#1f2940';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = row.unlocked ? this.withAlpha(sidePalette.primary, 0.95) : '#6f7688';
      ctx.fillRect(barX, barY, barW * row.progress, barH);

      ctx.textAlign = 'right';
      if (row.type === 'candle') {
        if (row.candleActive) {
          ctx.fillStyle = '#ffe8a6';
          ctx.fillText(`active x${active}`, px + panelW - 10, ry + 1);
        } else {
          ctx.fillStyle = '#b8c8e2';
          ctx.fillText(`x${active} roll ${Math.max(0, Math.ceil(row.etaSec))}s`, px + panelW - 10, ry + 1);
        }
      } else if (!row.unlocked) {
        ctx.fillStyle = '#9da8ba';
        ctx.fillText(`x${active} ${row.unlockHint || 'locked'}`, px + panelW - 10, ry + 1);
      } else if (row.every <= 1) {
        ctx.fillStyle = '#8affcf';
        ctx.fillText(`active x${active}`, px + panelW - 10, ry + 1);
      } else {
        const eta = Math.max(0, Math.ceil(row.etaSec));
        const tag = row.inSpawns === 1
          ? `x${active} next ${eta}s`
          : `x${active} ${row.inSpawns}sp ${eta}s`;
        ctx.fillStyle = row.inSpawns === 1 ? '#ffe8a6' : '#b8c8e2';
        ctx.fillText(tag, px + panelW - 10, ry + 1);
      }
    }

    ctx.strokeStyle = '#f2e4b24a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 8, py + panelH - 9);
    ctx.lineTo(px + panelW - 8, py + panelH - 9);
    ctx.stroke();
    ctx.fillStyle = '#aeb9ca';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Training cadence by spawn cycle', px + 10, py + panelH - 3);
  }

  drawSpecialRollOutcomeBar(x, y, w, h, chance, roll, success) {
    const { ctx } = this;
    const chanceClamped = Number.isFinite(chance) ? Math.max(0, Math.min(1, chance)) : null;
    const rollClamped = Number.isFinite(roll) ? Math.max(0, Math.min(1, roll)) : null;

    ctx.fillStyle = '#162133';
    ctx.fillRect(x, y, w, h);

    if (chanceClamped == null) {
      ctx.strokeStyle = '#2b3a56';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#73839f';
      ctx.font = '8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No roll yet', x + w * 0.5, y + h - 1);
      return;
    }

    const splitX = x + w * chanceClamped;
    ctx.fillStyle = '#6e2b34';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#2d784f';
    ctx.fillRect(x, y, Math.max(0, splitX - x), h);

    ctx.strokeStyle = '#f4f8ffcc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splitX + 0.5, y - 1);
    ctx.lineTo(splitX + 0.5, y + h + 1);
    ctx.stroke();

    if (rollClamped != null) {
      const rollX = x + w * rollClamped;
      const marker = success === true ? '#86ffd3' : '#ff9f92';
      ctx.strokeStyle = marker;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rollX + 0.5, y - 2);
      ctx.lineTo(rollX + 0.5, y + h + 2);
      ctx.stroke();

      ctx.fillStyle = marker;
      ctx.beginPath();
      ctx.moveTo(rollX, y - 4);
      ctx.lineTo(rollX - 3, y - 1);
      ctx.lineTo(rollX + 3, y - 1);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = '#2b3a56';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = '#b8c8e2';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`spawn ${Math.round(chanceClamped * 100)}%`, x + 3, y + h - 1);
    if (rollClamped != null) {
      ctx.textAlign = 'right';
      ctx.fillText(`roll ${Math.round(rollClamped * 100)}%`, x + w - 3, y + h - 1);
    }
  }

  drawSpecialRollTypeBadge(type, x, y, side = 'left') {
    if (!type || !FAILED_SPECIAL_HAT_STYLES[type]) return;
    const { ctx } = this;
    const style = FAILED_SPECIAL_HAT_STYLES[type];
    ctx.fillStyle = '#0f1727';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = style.brim;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();
    this.drawFailedSpecialMini(type, x, y + 1, 8.2, side);
  }

  drawCastle(side, x, y, hp, sideState = null, archerPulls = null) {
    const { ctx } = this;
    const palette = TEAM_COLORS[side];
    const dir = side === 'left' ? 1 : -1;
    const wallW = 118;
    const wallH = 290;
    const baseY = y + 138;
    const left = x - wallW / 2;

    ctx.fillStyle = '#1f2b3f';
    ctx.fillRect(left - 12, baseY - 22, wallW + 24, 30);

    ctx.fillStyle = palette.castle;
    ctx.fillRect(left, y - wallH / 2, wallW, wallH);
    ctx.strokeStyle = '#4c628a';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, y - wallH / 2, wallW, wallH);

    const crenelW = 16;
    for (let i = 0; i < 6; i += 1) {
      if (i % 2 === 1) continue;
      ctx.fillStyle = palette.dark;
      ctx.fillRect(left + 10 + i * crenelW, y - wallH / 2 - 18, 12, 18);
    }

    ctx.fillStyle = '#172338';
    ctx.fillRect(left + 18, y - 110, wallW - 36, 86);

    const slitX = side === 'left' ? left + wallW - 24 : left + 24;
    ctx.fillStyle = '#09101d';
    ctx.fillRect(slitX - 7, y - 118, 14, 96);

    const pulls = Array.isArray(archerPulls) && archerPulls.length
      ? archerPulls
      : this.sideArcherPulls(side, sideState);
    const archerX = side === 'left' ? x + 35 : x - 35;
    for (let idx = 0; idx < pulls.length; idx += 1) {
      const pull = pulls[idx];
      const archerY = y - 56 - idx * 78;
      const platformX = archerX + dir * 6;
      ctx.fillStyle = '#4f607f';
      ctx.fillRect(platformX - 18, archerY + 12, 36, 10);

      const aim = worldAimAngle(side, pull.pullX, pull.pullY);
      ctx.fillStyle = '#d7c29d';
      ctx.beginPath();
      ctx.arc(archerX, archerY - 16, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#d7c29d';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(archerX, archerY - 8);
      ctx.lineTo(archerX, archerY + 14);
      ctx.stroke();

      ctx.fillStyle = palette.primary;
      ctx.fillRect(archerX - 6, archerY - 8, 12, 14);

      const bx1 = archerX + Math.cos(aim) * 9;
      const by1 = archerY - 4 + Math.sin(aim) * 9;
      const bx2 = archerX + Math.cos(aim) * 24;
      const by2 = archerY - 4 + Math.sin(aim) * 24;

      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(bx1, by1);
      ctx.lineTo(bx2, by2);
      ctx.stroke();

      ctx.strokeStyle = palette.soft;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx1 - Math.sin(aim) * 6, by1 + Math.cos(aim) * 6);
      ctx.lineTo(bx1 + Math.sin(aim) * 6, by1 - Math.cos(aim) * 6);
      ctx.stroke();
    }

    const hpW = 92;
    const pct = Math.max(0, hp / 6000);
    ctx.fillStyle = '#141414';
    ctx.fillRect(x - hpW / 2, y - wallH / 2 - 34, hpW, 10);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(x - hpW / 2, y - wallH / 2 - 34, hpW * pct, 10);

    this.drawTowerUpgradeBadges(side, x, y, sideState);
  }

  getUpgradeBadgeData(sideState) {
    if (!sideState) return [];
    const out = [];
    for (const spec of UPGRADE_BADGE_SPECS) {
      const level = Math.max(0, Number(sideState[spec.type]) || 0);
      const count = Math.max(0, level - spec.base);
      if (count <= 0) continue;
      const category = upgradeCategory(spec.type);
      const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
      out.push({ ...spec, count, category, style, color: style.badge });
    }
    return out;
  }

  getTowerUpgradeGroups(sideState) {
    const badges = this.getUpgradeBadgeData(sideState);
    if (!badges.length) return [];
    const groups = [];
    for (const category of UPGRADE_CATEGORY_ORDER) {
      const items = badges.filter((badge) => badge.category === category);
      if (!items.length) continue;
      const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
      groups.push({
        category,
        style,
        label: UPGRADE_CATEGORY_TOWER_LABEL[category] || style.tag || 'Upgrades',
        items,
      });
    }
    return groups;
  }

  drawTowerUpgradeBadges(side, x, y, sideState) {
    const groups = this.getTowerUpgradeGroups(sideState);
    if (!groups.length) return;

    const { ctx } = this;
    const badgeDir = side === 'left' ? -1 : 1;
    const cols = 2;
    const iconStepX = 21;
    const iconStepY = 20;
    const iconR = 8;
    const groupGap = 8;
    const startX = x + badgeDir * 30;
    let startY = y - 126;
    const railLeft = Math.min(startX, startX + badgeDir * iconStepX) - 10;
    const railRight = Math.max(startX, startX + badgeDir * iconStepX) + 10;

    for (let g = 0; g < groups.length; g += 1) {
      const group = groups[g];
      const rows = Math.ceil(group.items.length / cols);

      for (let i = 0; i < group.items.length; i += 1) {
        const badge = group.items[i];
        const col = i % cols;
        const row = Math.floor(i / cols);
        const bx = startX + badgeDir * col * iconStepX;
        const by = startY + row * iconStepY;

        ctx.fillStyle = '#09101ddd';
        ctx.beginPath();
        ctx.arc(bx, by, iconR + 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = badge.color;
        ctx.beginPath();
        ctx.arc(bx, by, iconR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef7d2cc';
        ctx.lineWidth = 1.15;
        ctx.stroke();
        this.drawUpgradeGlyph(badge.type, bx, by, 6.2, '#1f2230');

        if (badge.count > 1) {
          const tx = bx + badgeDir * 9;
          const ty = by - 8;
          ctx.fillStyle = '#18120cd8';
          ctx.beginPath();
          ctx.arc(tx, ty, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffe7a6';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${badge.count}`, tx, ty + 2.4);
        }
      }

      startY += rows * iconStepY + groupGap;
      if (g < groups.length - 1) {
        ctx.strokeStyle = this.withAlpha(group.style.border, 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(railLeft, startY - groupGap / 2);
        ctx.lineTo(railRight, startY - groupGap / 2);
        ctx.stroke();
      }
    }
  }

  drawShotRing(x, y, cd, color) {
    const { ctx } = this;
    const pct = 1 - Math.max(0, Math.min(1, cd / SHOT_INTERVAL));
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();
  }

  drawComboBanner(side, x, y, sideState) {
    const { ctx } = this;
    const streak = Math.max(0, Math.min(10, Number(sideState?.comboHitStreak) || 0));
    const tier = comboTierFromStreak(streak);
    const active = tier > 1;
    const maxed = streak >= 10;
    const w = maxed ? 122 : 86;
    const h = maxed ? 30 : 24;

    ctx.fillStyle = active ? (side === 'left' ? '#12314fc9' : '#4f1f1ac9') : '#2026329f';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeStyle = maxed ? '#ffd78f' : (active ? '#9ed8ff' : '#66788b');
    ctx.lineWidth = maxed ? 2.2 : 1.4;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);

    ctx.fillStyle = active ? '#f6fbff' : '#cad4df';
    ctx.font = `bold ${maxed ? 12 : 11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(active ? `COMBO x${tier}` : 'COMBO x1', x, y + 1);

    if (maxed) {
      ctx.fillStyle = '#ffd28e';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('MAX BONUS AOE', x, y + 13);
    }
  }

  drawUpgradeChargeBar(side, x, y, bw, bh, current, max) {
    const { ctx } = this;
    const pct = Math.max(0, Math.min(1, current / Math.max(1, max)));
    const fillH = bh * pct;

    ctx.fillStyle = '#1f1a10d6';
    ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = '#9a7a20';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, bw, bh);

    const goldGrad = ctx.createLinearGradient(0, y + bh, 0, y);
    goldGrad.addColorStop(0, '#c98d2d');
    goldGrad.addColorStop(0.55, '#f4c95d');
    goldGrad.addColorStop(1, '#fff4bf');
    ctx.fillStyle = goldGrad;
    ctx.fillRect(x + 2, y + bh - fillH + 1, bw - 4, Math.max(0, fillH - 2));

    if (pct >= 1) {
      ctx.strokeStyle = '#fff4bf';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, bw + 4, bh + 4);
    }

    ctx.fillStyle = '#f6e6b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('UPG', x + bw / 2, y - 8);
  }

  drawUpgradePlaceholders(snapshot) {
    const { ctx } = this;
    for (const sideName of ['left', 'right']) {
      const x0 = sideCardSlotX(sideName, 0);
      const x1 = sideCardSlotX(sideName, 1);
      const y = 90;
      const side = snapshot[sideName];
      const ready = side.upgradeCharge >= side.upgradeChargeMax;
      const pct = Math.round(Math.max(0, Math.min(1, side.upgradeCharge / Math.max(1, side.upgradeChargeMax))) * 100);
      const debtLeft = Math.max(0, Math.ceil(side.upgradeChargeMax - side.upgradeCharge));
      const autoPickIn = Number.isFinite(side.upgradeAutoPickAt)
        ? Math.max(0, Math.ceil(side.upgradeAutoPickAt - snapshot.t))
        : 20;
      ctx.fillStyle = ready ? '#b8dcff' : '#7e8fa8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        ready ? `Upgrade Ready: choose in ${autoPickIn}s` : `Upgrade debt ${debtLeft} (${pct}%)`,
        (x0 + x1) / 2,
        y - 34
      );
    }
  }

  drawUpgradeCard(card) {
    const { ctx } = this;
    const category = upgradeCategory(card.type);
    const style = UPGRADE_CATEGORY_STYLE[category] || UPGRADE_CATEGORY_STYLE.misc;
    const textX = card.x + 10;
    const fitCardText = (text, maxWidth) => {
      const raw = String(text || '');
      if (!raw) return '';
      if (ctx.measureText(raw).width <= maxWidth) return raw;
      const ellipsis = '...';
      let out = raw;
      while (out.length > 0 && ctx.measureText(`${out}${ellipsis}`).width > maxWidth) {
        out = out.slice(0, -1);
      }
      return out ? `${out}${ellipsis}` : ellipsis;
    };
    ctx.fillStyle = style.panel;
    ctx.fillRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);
    ctx.fillStyle = style.glow;
    ctx.fillRect(card.x - card.w / 2 + 1, card.y - card.h / 2 + 1, card.w - 2, card.h - 2);
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);

    const iconX = card.x - card.w / 2 + 11;
    const iconY = card.y - card.h / 2 + 10.5;
    ctx.fillStyle = '#0c1526d4';
    ctx.beginPath();
    ctx.arc(iconX, iconY, 8.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = style.badge;
    ctx.beginPath();
    ctx.arc(iconX, iconY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef7d2cc';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    this.drawUpgradeGlyph(card.type, iconX, iconY, 5.8, '#1f2230');

    ctx.fillStyle = style.hint;
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(style.tag, textX, card.y - 15);

    ctx.fillStyle = style.title;
    ctx.font = '10px sans-serif';
    const titleText = fitCardText(UPGRADE_LABELS[card.type] || 'Upgrade', Math.max(20, card.w - 22));
    ctx.fillText(titleText, textX, card.y - 5);
    ctx.fillStyle = style.hint;
    ctx.font = '8px sans-serif';
    const hintText = fitCardText(UPGRADE_HINTS[card.type] || 'upgrade effect', Math.max(18, card.w - 24));
    ctx.fillText(hintText, textX, card.y + 4);
    ctx.fillStyle = style.cost;
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(`cost ${Math.max(1, Math.round(Number(card.cost) || 0))}`, card.x, card.y + 13);
    ctx.fillStyle = style.hint;
    ctx.font = '8px sans-serif';
    ctx.fillText('shoot to choose', card.x, card.y + 20);
  }

  drawShotPower(power) {
    const { ctx } = this;
    const palette = TEAM_COLORS[power.side];
    let aura = '#ffffff22';
    let fill = '#1f2338';
    let border = palette.primary;
    let text = '#fff3b2';

    if (power.type === 'flameShot') {
      aura = '#ff9a3a2a';
      fill = '#3c2017';
      border = '#ff9a4a';
      text = '#ffe3b0';
    }

    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(power.x, power.y, power.r + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(power.x, power.y - power.r);
    ctx.lineTo(power.x + power.r, power.y);
    ctx.lineTo(power.x, power.y + power.r);
    ctx.lineTo(power.x - power.r, power.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = text;
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(SHOT_POWER_LABELS[power.type] || 'Power', power.x, power.y + 3);
  }

  drawCannonBall(ball) {
    if (!ball) return;
    const { ctx } = this;
    const x = Number(ball.x) || 0;
    const y = Number(ball.y) || 0;
    const r = Math.max(6, Number(ball.r) || 12);
    const sideName = ball.side === 'right' ? 'right' : 'left';
    const tint = sideName === 'left' ? '#87baff' : '#ff9f9f';
    const phase = typeof ball.phase === 'string' ? ball.phase : 'fall';
    const flareX = Number.isFinite(Number(ball.impactX)) ? Number(ball.impactX) : x;
    const flareY = Number.isFinite(Number(ball.impactY)) ? Number(ball.impactY) : y;
    const pulseT = performance.now() * 0.001 + (Number(ball.id) || 0) * 0.27;
    const pulse = 0.72 + Math.sin(pulseT * 9.2) * 0.28;
    const signalTtl = Math.max(0, Number(ball.signalFlareTtl) || 0);
    const signalMax = Math.max(0.01, Number(ball.signalFlareMaxTtl) || 0.36);
    const signalLife = Math.max(0, Math.min(1, signalTtl / signalMax));
    const signalX = Number.isFinite(Number(ball.signalFlareX)) ? Number(ball.signalFlareX) : flareX;
    const signalY = Number.isFinite(Number(ball.signalFlareY)) ? Number(ball.signalFlareY) : flareY;

    const drawSignalFlare = () => {
      if (signalLife <= 0) return;
      const launch = 1 - signalLife;
      const topY = signalY - launch * (signalY + 84);
      ctx.save();
      ctx.globalAlpha = 0.28 + signalLife * 0.62;
      const beam = ctx.createLinearGradient(signalX, signalY, signalX, topY);
      beam.addColorStop(0, '#ffdca3');
      beam.addColorStop(0.35, '#ffad68');
      beam.addColorStop(1, '#ff7c4500');
      ctx.strokeStyle = beam;
      ctx.lineWidth = 2.2 + signalLife * 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(signalX, signalY - 2);
      ctx.lineTo(signalX, topY);
      ctx.stroke();
      ctx.globalAlpha = 0.5 + signalLife * 0.35;
      ctx.fillStyle = '#ffeec8';
      ctx.beginPath();
      ctx.arc(signalX, topY, 1.9 + signalLife * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawFlareMarker = (markerAlpha = 1) => {
      ctx.save();
      const flareGlow = ctx.createRadialGradient(flareX, flareY, 2, flareX, flareY, 22 + pulse * 16);
      flareGlow.addColorStop(0, '#fff5d1');
      flareGlow.addColorStop(0.38, '#ffaf64d6');
      flareGlow.addColorStop(1, '#ff7c4500');
      ctx.globalAlpha = (0.42 + pulse * 0.33) * markerAlpha;
      ctx.fillStyle = flareGlow;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 22 + pulse * 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = (0.6 + pulse * 0.35) * markerAlpha;
      ctx.strokeStyle = '#ffd59a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(flareX, flareY, 8 + pulse * 3.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    if (phase === 'flare') {
      drawSignalFlare();
      drawFlareMarker(0.52);
      const vx = Number(ball.vx) || 0;
      const vy = Number(ball.vy) || -1;
      const ang = Math.atan2(vy, vx);
      const nx = Math.cos(ang);
      const ny = Math.sin(ang);
      const trailLen = r * 4.6;
      ctx.save();
      ctx.globalAlpha = 0.92;
      const trail = ctx.createLinearGradient(x, y, x - nx * trailLen, y - ny * trailLen);
      trail.addColorStop(0, '#fff5d8');
      trail.addColorStop(0.45, `${tint}bb`);
      trail.addColorStop(1, `${tint}00`);
      ctx.strokeStyle = trail;
      ctx.lineWidth = Math.max(2.4, r * 0.34);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - nx * trailLen, y - ny * trailLen);
      ctx.stroke();
      ctx.fillStyle = '#ffe2b5';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(2.8, r * 0.36), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Airstrike flare marker: persists until its bomb impacts.
    drawSignalFlare();
    drawFlareMarker(1);

    if (phase === 'mark') {
      ctx.save();
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = '#ffe8b7';
      ctx.beginPath();
      ctx.arc(flareX, flareY - 2.2, 2.8 + pulse * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff934e';
      ctx.beginPath();
      ctx.arc(flareX + Math.sin(pulseT * 7) * 1.2, flareY - 5.8, 1.8 + pulse * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const glow = ctx.createRadialGradient(x, y, 2, x, y, r * 2.4);
    glow.addColorStop(0, '#fff4d1bb');
    glow.addColorStop(0.45, `${tint}66`);
    glow.addColorStop(1, `${tint}00`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2a2f3a';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c7d2e8';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.fillStyle = '#ffd8a6';
    ctx.beginPath();
    ctx.arc(x - r * 0.22, y - r * 0.24, Math.max(1.3, r * 0.22), 0, Math.PI * 2);
    ctx.fill();
  }

  drawResourceNode(res) {
    const { ctx } = this;
    ctx.fillStyle = '#fef1b8';
    ctx.beginPath();
    ctx.arc(res.x, res.y, res.r + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f4c95d';
    ctx.beginPath();
    ctx.moveTo(res.x, res.y - res.r);
    ctx.lineTo(res.x + res.r, res.y);
    ctx.lineTo(res.x, res.y + res.r);
    ctx.lineTo(res.x - res.r, res.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9a7a20';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#3b2b12';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+${res.value}`, res.x, res.y + 4);
  }

  drawCandleScorch(scorch) {
    if (!scorch) return;
    const { ctx } = this;
    const t = performance.now() * 0.001;
    const pulse = 0.75 + Math.sin(t * 6.5) * 0.25;
    const towerBlaze = scorch.towerSide === 'left' || scorch.towerSide === 'right';
    const alpha = Math.max(0.2, Math.min(1, (Number(scorch.ttl) || 0) / 4.2));
    const r = Math.max(36, Number(scorch.r) || 90);
    const x = Number(scorch.x) || 0;
    const y = Number(scorch.y) || 0;

    ctx.save();
    ctx.globalAlpha = 0.35 + alpha * (towerBlaze ? 0.62 : 0.45);
    const burn = ctx.createRadialGradient(x, y, 8, x, y, r);
    burn.addColorStop(0, '#ffb26788');
    burn.addColorStop(0.3, towerBlaze ? '#ff7b3f88' : '#e36a3d66');
    burn.addColorStop(0.72, '#4e231f99');
    burn.addColorStop(1, '#00000000');
    ctx.fillStyle = burn;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.3 + alpha * 0.5;
    ctx.fillStyle = '#1a0b08c9';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    const tongues = towerBlaze ? 8 : 5;
    for (let i = 0; i < tongues; i += 1) {
      const phase = t * (5.8 + i * 0.7) + i * 1.5;
      const fx = x + Math.cos((Math.PI * 2 * i) / tongues + t * 0.5) * (r * 0.36);
      const fy = y - (towerBlaze ? 10 : 5) + Math.sin(phase * 0.8) * 2.2;
      const h = (towerBlaze ? 20 : 12) + pulse * (towerBlaze ? 11 : 7) + Math.sin(phase) * 3;
      const w = 5 + Math.cos(phase * 1.1) * 1.4;

      const flame = ctx.createLinearGradient(fx, fy + 8, fx, fy - h);
      flame.addColorStop(0, '#ff5f35');
      flame.addColorStop(0.48, '#ffaf52');
      flame.addColorStop(1, '#fff1bd');
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(fx, fy - h);
      ctx.bezierCurveTo(fx + w, fy - h * 0.5, fx + w * 0.7, fy + h * 0.14, fx, fy + h * 0.45);
      ctx.bezierCurveTo(fx - w * 0.7, fy + h * 0.14, fx - w, fy - h * 0.5, fx, fy - h);
      ctx.fill();
    }

    const smokeShieldTtl = Math.max(0, Number(scorch.smokeShieldTtl) || 0);
    if (smokeShieldTtl > 0) {
      const smokeShieldMaxTtl = Math.max(0.01, Number(scorch.smokeShieldMaxTtl) || 3.5);
      const life = Math.max(0, Math.min(1, smokeShieldTtl / smokeShieldMaxTtl));
      const smokeX = x;
      const smokeY = y + (Number(scorch.smokeShieldYOffset) || -28);
      const smokeRx = Math.max(0, Number(scorch.smokeShieldRx) || 0) * life;
      const smokeRy = Math.max(0, Number(scorch.smokeShieldRy) || 0) * life;
      if (smokeRx <= 0.6 || smokeRy <= 0.6) {
        ctx.restore();
        return;
      }
      const breathe = Math.sin(t * 5.1 + r * 0.02) * 0.06;
      const domeRx = smokeRx * (1 + breathe * 0.55);
      const domeRy = smokeRy * (1 + breathe * 0.32);

      ctx.globalAlpha = 0.05 + life * 0.51;
      const cloud = ctx.createRadialGradient(
        smokeX,
        smokeY - domeRy * 0.62,
        4,
        smokeX,
        smokeY,
        domeRx
      );
      cloud.addColorStop(0, '#f8fcffcc');
      cloud.addColorStop(0.42, '#d7deea99');
      cloud.addColorStop(1, '#8a97a800');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.ellipse(smokeX, smokeY, domeRx, domeRy, 0, Math.PI, Math.PI * 2, false);
      ctx.lineTo(smokeX + domeRx * 0.82, smokeY + domeRy * 0.24);
      ctx.quadraticCurveTo(smokeX, smokeY + domeRy * 0.46, smokeX - domeRx * 0.82, smokeY + domeRy * 0.24);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.06 + life * 0.6;
      ctx.strokeStyle = '#f5fbff';
      ctx.lineWidth = 1.3 + life * 1.2;
      ctx.beginPath();
      ctx.ellipse(smokeX, smokeY, domeRx * 0.97, domeRy * 0.95, 0, Math.PI, Math.PI * 2, false);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawCandle(candle) {
    if (!candle) return;
    const { ctx } = this;
    const x = Number(candle.x) || 0;
    const y = Number(candle.y) || 0;
    const wax = Math.max(0, Number(candle.wax) || 0);
    const waxMax = Math.max(1, Number(candle.waxMax) || 1);
    const waxPct = Math.max(0, Math.min(1, wax / waxMax));
    const time = performance.now() * 0.001;
    const cartHalf = Math.max(28, Number(candle.cartHalfW) || 34);
    const pulse = Number(candle.flamePulse) || 0;
    const flicker = Math.sin(time * 7.8 + pulse) * 0.45
      + Math.sin(time * 12.2 + pulse * 0.6) * 0.22;
    ctx.save();

    if (candle.destroyed) {
      const ember = ctx.createRadialGradient(x, y - 7, 2, x, y - 7, 24);
      ember.addColorStop(0, '#ffd29f');
      ember.addColorStop(0.45, '#ff7b4d');
      ember.addColorStop(1, '#00000000');
      ctx.fillStyle = ember;
      ctx.beginPath();
      ctx.arc(x, y - 7, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3d302a';
      ctx.fillRect(x - 10, y - 6, 20, 18);
      ctx.fillStyle = '#1f1a17';
      ctx.fillRect(x - 3, y - 14, 6, 8);

      const cd = Math.max(0, Math.ceil(Number(candle.respawnCd) || 0));
      if (cd > 0) {
        ctx.fillStyle = '#f7d8a8';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Relight ${cd}s`, x, y - 20);
      }
      ctx.restore();
      return;
    }

    // Cart shadow
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(x, y + 28, cartHalf + 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const smokeShieldTtl = Math.max(0, Number(candle.smokeShieldTtl) || 0);
    if (smokeShieldTtl > 0) {
      const life = Math.max(0, Math.min(1, smokeShieldTtl / 3.5));
      const smokeX = x;
      const smokeY = y - 8;
      const smokeRx = (cartHalf + 18) * 3;
      const smokeRy = 30 * 3;
      const pulseBreathe = Math.sin(time * 6.3 + pulse * 0.6) * 0.06;
      const domeRx = smokeRx * (1 + pulseBreathe * 0.6);
      const domeRy = smokeRy * (1 + pulseBreathe * 0.35);

      ctx.save();
      ctx.globalAlpha = 0.24 + life * 0.34;
      const cloud = ctx.createRadialGradient(
        smokeX,
        smokeY - domeRy * 0.62,
        4,
        smokeX,
        smokeY,
        domeRx
      );
      cloud.addColorStop(0, '#f6fbffcc');
      cloud.addColorStop(0.4, '#d6dde8aa');
      cloud.addColorStop(1, '#8a97a800');
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.ellipse(smokeX, smokeY, domeRx, domeRy, 0, Math.PI, Math.PI * 2, false);
      ctx.lineTo(smokeX + domeRx * 0.84, smokeY + domeRy * 0.24);
      ctx.quadraticCurveTo(smokeX, smokeY + domeRy * 0.44, smokeX - domeRx * 0.84, smokeY + domeRy * 0.24);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.22 + life * 0.4;
      ctx.strokeStyle = '#f4fbff';
      ctx.lineWidth = 1.2 + life * 1.1;
      ctx.beginPath();
      ctx.ellipse(smokeX, smokeY, domeRx * 0.96, domeRy * 0.94, 0, Math.PI, Math.PI * 2, false);
      ctx.stroke();

      for (let i = 0; i < 5; i += 1) {
        const phase = time * (1.6 + i * 0.22) + i * 1.7 + pulse * 0.32;
        const px = smokeX + Math.cos(phase) * domeRx * 0.52;
        const py = smokeY - domeRy * (0.14 + (i % 3) * 0.16) + Math.sin(phase * 0.8) * 2.6;
        const pr = 4.6 + (i % 2) * 2.3;
        ctx.globalAlpha = 0.16 + life * 0.22;
        ctx.fillStyle = '#eff4fb';
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const wheelY = y + 20;
    const wheelR = 9;
    for (const wx of [x - cartHalf + 7, x + cartHalf - 7]) {
      ctx.fillStyle = '#2c241f';
      ctx.beginPath();
      ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8f7656';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.strokeStyle = '#c6a77b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx - wheelR + 2, wheelY);
      ctx.lineTo(wx + wheelR - 2, wheelY);
      ctx.moveTo(wx, wheelY - wheelR + 2);
      ctx.lineTo(wx, wheelY + wheelR - 2);
      ctx.stroke();
    }

    const cartGrad = ctx.createLinearGradient(x - cartHalf, y, x + cartHalf, y);
    cartGrad.addColorStop(0, '#6a5238');
    cartGrad.addColorStop(0.5, '#8c6a45');
    cartGrad.addColorStop(1, '#6a5238');
    ctx.fillStyle = cartGrad;
    ctx.fillRect(x - cartHalf, y + 7, cartHalf * 2, 10);
    ctx.strokeStyle = '#d2b180';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x - cartHalf, y + 7, cartHalf * 2, 10);

    ctx.fillStyle = '#4f3f31';
    ctx.fillRect(x - cartHalf + 5, y + 2, cartHalf * 2 - 10, 6);
    ctx.strokeStyle = '#b69266';
    ctx.strokeRect(x - cartHalf + 5, y + 2, cartHalf * 2 - 10, 6);

    // Pull/push handles so carrier spacing reads clearly.
    ctx.strokeStyle = '#c7a879';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + cartHalf, y + 9);
    ctx.lineTo(x + cartHalf + 18, y + 2);
    ctx.moveTo(x - cartHalf, y + 9);
    ctx.lineTo(x - cartHalf - 18, y + 2);
    ctx.stroke();

    const bodyH = 18 + waxPct * 34;
    const bodyW = 18;
    const deckY = y + 5;
    const topY = deckY - bodyH;
    const waxGrad = ctx.createLinearGradient(x, topY, x, deckY + 2);
    waxGrad.addColorStop(0, '#fff6df');
    waxGrad.addColorStop(0.42, '#fee9c8');
    waxGrad.addColorStop(1, '#d9c29a');
    ctx.fillStyle = waxGrad;
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.5, deckY + 2);
    ctx.lineTo(x - bodyW * 0.5, topY + 8);
    ctx.quadraticCurveTo(x - bodyW * 0.45, topY, x - bodyW * 0.3, topY);
    ctx.lineTo(x + bodyW * 0.3, topY);
    ctx.quadraticCurveTo(x + bodyW * 0.45, topY, x + bodyW * 0.5, topY + 8);
    ctx.lineTo(x + bodyW * 0.5, deckY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ceb58a';
    ctx.lineWidth = 1.7;
    ctx.stroke();

    ctx.fillStyle = '#f7e7c4';
    ctx.beginPath();
    ctx.arc(x, topY + 3, bodyW * 0.46, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ecddbe';
    ctx.fillRect(x - 6, topY + 7, 3.5, 11 + (1 - waxPct) * 5);
    ctx.fillRect(x + 2.5, topY + 6, 2.8, 9 + (1 - waxPct) * 4);

    const wickY = topY - 2;
    ctx.strokeStyle = '#2e241d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, wickY + 7);
    ctx.lineTo(x, wickY - 2);
    ctx.stroke();

    const burstLife = Math.max(0, Math.min(1, (Number(candle.flameBurstTtl) || 0) / 0.26));
    const flameBoost = Math.max(0, Number(candle.flameBoost) || 0) * burstLife;
    const flameH = 28 + flicker * 2.1 + flameBoost * 10;
    const flameW = 11 + Math.max(0, flicker) * 1.25 + flameBoost * 3.4;
    const flameX = x + Math.sin(time * 6.2 + pulse) * 1.1;
    const flameY = wickY - flameH * 0.28;

    const outerGlow = ctx.createRadialGradient(flameX, flameY, 2, flameX, flameY, flameH * 1.2);
    outerGlow.addColorStop(0, 'rgba(255, 243, 176, 0.45)');
    outerGlow.addColorStop(0.4, 'rgba(255, 164, 74, 0.26)');
    outerGlow.addColorStop(1, 'rgba(255, 90, 40, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(flameX, flameY, flameH * 1.2, 0, Math.PI * 2);
    ctx.fill();

    const outerFlame = ctx.createLinearGradient(flameX, flameY + flameH * 0.56, flameX, flameY - flameH);
    outerFlame.addColorStop(0, '#ff5d33');
    outerFlame.addColorStop(0.48, '#ffb34f');
    outerFlame.addColorStop(1, '#fff7cb');
    ctx.fillStyle = outerFlame;
    ctx.beginPath();
    ctx.moveTo(flameX, flameY - flameH);
    ctx.bezierCurveTo(
      flameX + flameW,
      flameY - flameH * 0.36,
      flameX + flameW * 0.74,
      flameY + flameH * 0.2,
      flameX,
      flameY + flameH * 0.56
    );
    ctx.bezierCurveTo(
      flameX - flameW * 0.74,
      flameY + flameH * 0.2,
      flameX - flameW,
      flameY - flameH * 0.36,
      flameX,
      flameY - flameH
    );
    ctx.fill();

    const innerFlame = ctx.createLinearGradient(flameX, flameY + flameH * 0.26, flameX, flameY - flameH * 0.56);
    innerFlame.addColorStop(0, '#ffb347');
    innerFlame.addColorStop(0.58, '#fff8d0');
    innerFlame.addColorStop(1, '#ffffff');
    ctx.fillStyle = innerFlame;
    ctx.beginPath();
    ctx.moveTo(flameX, flameY - flameH * 0.58);
    ctx.bezierCurveTo(
      flameX + flameW * 0.45,
      flameY - flameH * 0.2,
      flameX + flameW * 0.3,
      flameY + flameH * 0.08,
      flameX,
      flameY + flameH * 0.3
    );
    ctx.bezierCurveTo(
      flameX - flameW * 0.3,
      flameY + flameH * 0.08,
      flameX - flameW * 0.45,
      flameY - flameH * 0.2,
      flameX,
      flameY - flameH * 0.58
    );
    ctx.fill();

    const beamTtl = Math.max(0, Number(candle.flameBeamTtl) || 0);
    if (beamTtl > 0) {
      const toX = Number.isFinite(candle.flameBeamToX) ? candle.flameBeamToX : flameX + 120;
      const toY = Number.isFinite(candle.flameBeamToY) ? candle.flameBeamToY : flameY + 8;
      const beamLife = Math.max(0, Math.min(1, beamTtl / 0.24));
      const arc = Math.sin(time * 15 + pulse) * 8;

      ctx.save();
      ctx.globalAlpha = 0.4 + beamLife * 0.5;
      const beamGrad = ctx.createLinearGradient(flameX, flameY, toX, toY);
      beamGrad.addColorStop(0, '#fff1b2');
      beamGrad.addColorStop(0.34, '#ffbb4e');
      beamGrad.addColorStop(0.75, '#ff7a33');
      beamGrad.addColorStop(1, '#ff4c2c');
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 6 + beamLife * 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(flameX, flameY);
      ctx.quadraticCurveTo(
        (flameX + toX) * 0.5 + arc,
        (flameY + toY) * 0.5 - 10 - beamLife * 5,
        toX,
        toY
      );
      ctx.stroke();

      ctx.globalAlpha = 0.58 + beamLife * 0.35;
      ctx.fillStyle = '#ffe7a0';
      ctx.beginPath();
      ctx.arc(flameX, flameY, 3 + beamLife * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const hitFlashTtl = Math.max(0, Number(candle.flameHitFlashTtl) || 0);
    if (hitFlashTtl > 0) {
      const flashLife = Math.max(0, Math.min(1, hitFlashTtl / 0.28));
      ctx.save();
      ctx.globalAlpha = 0.32 + flashLife * 0.56;
      const blast = ctx.createRadialGradient(flameX, flameY, 2, flameX, flameY, 38 + flashLife * 20);
      blast.addColorStop(0, '#fff4be');
      blast.addColorStop(0.2, '#ffbe69');
      blast.addColorStop(0.55, '#ff6a3f');
      blast.addColorStop(1, '#00000000');
      ctx.fillStyle = blast;
      ctx.beginPath();
      ctx.arc(flameX, flameY, 38 + flashLife * 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.4 + flashLife * 0.38;
      ctx.strokeStyle = '#ffd58f';
      ctx.lineWidth = 1.8 + flashLife * 1.4;
      ctx.beginPath();
      ctx.arc(flameX, flameY, 18 + flashLife * 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  drawMinionHpBar(minion, x, y, scale = 1) {
    const { ctx } = this;
    const hpPct = Math.max(0, minion.hp / minion.maxHp);
    const hpW = 36 * scale;
    const hpX = x - hpW / 2;
    const hatLift = minion.failedSpecialType ? 12 : 0;
    const hpY = y - (26 * scale + 2 + hatLift);
    ctx.fillStyle = '#101420cc';
    ctx.fillRect(hpX, hpY, hpW, 5);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * hpPct, 5);

    const reviveShieldMax = Math.max(0, Number(minion.reviveShieldMax) || 0);
    const reviveShieldHp = Math.max(0, Number(minion.reviveShieldHp) || 0);
    const reviveShieldTtl = Math.max(0, Number(minion.reviveShieldTtl) || 0);
    const reviveShieldMaxTtl = Math.max(0.01, Number(minion.reviveShieldMaxTtl) || 2);
    if (reviveShieldMax > 0 && reviveShieldHp > 0 && reviveShieldTtl > 0) {
      const frac = Math.max(0, Math.min(1, reviveShieldHp / reviveShieldMax));
      const fade = Math.max(0, Math.min(1, reviveShieldTtl / reviveShieldMaxTtl));
      const sy = hpY - 9;
      ctx.fillStyle = '#0d1524cc';
      ctx.fillRect(hpX, sy, hpW, 3);
      ctx.fillStyle = this.withAlpha('#eff7ff', 0.38 + fade * 0.5);
      ctx.fillRect(hpX, sy, hpW * frac, 3);
    }

    if (minion.necrominion) {
      const shieldMax = Math.max(0, Number(minion.necroShieldMax) || 0);
      const shieldHp = Math.max(0, Number(minion.necroShieldHp) || 0);
      const shieldTtl = Math.max(0, Number(minion.necroShieldTtl) || 0);
      const shieldMaxTtl = Math.max(0.01, Number(minion.necroShieldMaxTtl) || 20);
      if (shieldMax > 0 && shieldHp > 0 && shieldTtl > 0) {
        const hpFrac = Math.max(0, Math.min(1, shieldHp / shieldMax));
        const fade = Math.max(0, Math.min(1, shieldTtl / shieldMaxTtl));
        const sy = hpY - 5;
        ctx.fillStyle = '#0d1524cc';
        ctx.fillRect(hpX, sy, hpW, 3);
        ctx.fillStyle = this.withAlpha('#97f5ff', 0.35 + fade * 0.5);
        ctx.fillRect(hpX, sy, hpW * hpFrac, 3);
      }
    }
  }

  minionHitFlashLife(minion) {
    if (!minion) return 0;
    const ttl = Math.max(0, Number(minion.hitFlashTtl) || 0);
    return Math.max(0, Math.min(1, ttl / MINION_HIT_FLASH_TTL));
  }

  drawMinionHitFlashes(minions) {
    if (!Array.isArray(minions) || !minions.length) return;
    for (const minion of minions) {
      const life = this.minionHitFlashLife(minion);
      if (life <= 0) continue;
      this.drawMinionHitFlash(minion, life);
    }
  }

  drawMinionHitFlash(minion, life) {
    const { ctx } = this;
    const x = Number(minion?.x) || 0;
    const y = Number(minion?.y) || 0;
    const sideName = minion?.side === 'right' ? 'right' : 'left';
    const sidePalette = TEAM_COLORS[sideName] || TEAM_COLORS.left;
    const hitCore = sideName === 'right' ? '#ffdede' : '#e6f4ff';
    const hitMid = sideName === 'right' ? '#ff8f8f' : '#72bcff';
    const hitStroke = sideName === 'right' ? '#ff6d6d' : '#4da7ff';
    const r = Math.max(10, Number(minion?.r) || 14);
    const rxMul = minion.dragon
      ? 2.3
      : (minion.stoneGolem
          ? 2.05
          : (minion.rider ? 1.86 : (minion.shieldBearer ? 1.6 : (minion.hero ? 1.46 : 1.28))));
    const ryMul = minion.dragon
      ? 1.55
      : (minion.stoneGolem
          ? 1.84
          : (minion.shieldBearer ? 1.92 : (minion.hero ? 1.72 : (minion.rider ? 1.38 : 1.34))));
    const centerY = y - (minion.shieldBearer ? r * 0.34 : (minion.hero ? r * 0.18 : (minion.dragon ? r * 0.2 : (minion.stoneGolem ? r * 0.12 : 0))));
    const rx = r * rxMul;
    const ry = r * ryMul;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.25 + life * 0.34;
    const glow = ctx.createRadialGradient(x, centerY - ry * 0.12, 2, x, centerY, Math.max(rx, ry) * 1.06);
    glow.addColorStop(0, hitCore);
    glow.addColorStop(0.56, hitMid);
    glow.addColorStop(1, this.withAlpha(hitMid, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x, centerY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.24 + life * 0.31;
    ctx.strokeStyle = this.withAlpha(hitStroke, 0.9);
    ctx.lineWidth = 1.6 + life * 2.2;
    ctx.beginPath();
    ctx.ellipse(x, centerY, rx * 0.92, ry * 0.88, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.16 + life * 0.22;
    ctx.strokeStyle = this.withAlpha(sidePalette.primary, 0.92);
    ctx.lineWidth = 1.2 + life * 1.45;
    ctx.beginPath();
    ctx.ellipse(x, centerY, rx * 1.06, ry * 1.02, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawGunnerSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.gunnerSkyCannonUpgraded);
    const scale = minion.super ? 1.34 : 1;
    const bodyW = 22 * scale;
    const bodyH = 18 * scale;
    if (!cacheRender) {
      const flashNorm = Math.max(0, Math.min(1, (minion.gunFlashTtl || 0) / 0.14));
      const flashBucket = Math.max(0, Math.min(3, Math.round(flashNorm * 3)));
      const cacheKey = `gunner:${sideName}:${minion.super ? 1 : 0}:${upgraded ? 1 : 0}:${flashBucket}`;
      const cacheWidth = Math.ceil(bodyW * 4 + 40);
      const cacheHeight = Math.ceil(bodyH * 3 + 44);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          gunFlashTtl: flashBucket > 0 ? (flashBucket / 3) * 0.14 : 0,
        };
        this.drawGunnerSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) {
          ctx.fillStyle = '#ffd7aa';
          ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('GUNNER', minion.x, minion.y - bodyH * 1.18);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;
    const flash = Math.max(0, Math.min(1, (minion.gunFlashTtl || 0) / 0.14));

    ctx.fillStyle = '#0000002a';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyH * 0.9, bodyW * 0.62, 5.8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (minion.super) {
      ctx.strokeStyle = '#ffd48f8a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y - bodyH * 0.12, bodyW * 0.76, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);

    // Armored torso.
    ctx.fillStyle = '#2d3e5a';
    ctx.fillRect(-bodyW * 0.5, -bodyH * 0.5, bodyW, bodyH);
    ctx.strokeStyle = '#89a8d0';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(-bodyW * 0.5, -bodyH * 0.5, bodyW, bodyH);
    ctx.fillStyle = palette.primary;
    ctx.fillRect(-bodyW * 0.18, -bodyH * 0.42, bodyW * 0.36, bodyH * 0.84);

    // Helmet and visor.
    ctx.fillStyle = '#8da6c5';
    ctx.beginPath();
    ctx.arc(0, -bodyH * 0.62, bodyH * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f2736';
    ctx.fillRect(-bodyH * 0.3, -bodyH * 0.66, bodyH * 0.6, bodyH * 0.2);
    ctx.fillStyle = '#9bf3ff';
    ctx.fillRect(-bodyH * 0.2, -bodyH * 0.62, bodyH * 0.4, bodyH * 0.08);

    // Legs.
    ctx.fillStyle = '#2a354a';
    ctx.fillRect(-bodyW * 0.34, bodyH * 0.48, bodyW * 0.22, bodyH * 0.48);
    ctx.fillRect(bodyW * 0.12, bodyH * 0.48, bodyW * 0.22, bodyH * 0.48);

    // Rifle.
    const gunLen = bodyW * (upgraded ? 1.82 : 1.35);
    const gunY = -bodyH * 0.06;
    ctx.strokeStyle = '#dce9ff';
    ctx.lineWidth = upgraded ? 4.2 : 3.1;
    ctx.beginPath();
    ctx.moveTo(bodyW * 0.18 * dir, gunY);
    ctx.lineTo((bodyW * 0.18 + gunLen) * dir, gunY - 1.2);
    ctx.stroke();
    ctx.fillStyle = '#415a7e';
    ctx.fillRect(
      Math.min(bodyW * 0.04 * dir, (bodyW * (upgraded ? 0.94 : 0.64)) * dir),
      gunY - (upgraded ? 4.4 : 3.2),
      Math.abs(bodyW * (upgraded ? 0.9 : 0.6)),
      upgraded ? 8.8 : 6.4
    );
    if (upgraded) {
      ctx.fillStyle = '#5a7398';
      ctx.fillRect(
        Math.min(bodyW * 0.14 * dir, (bodyW * 0.74) * dir),
        gunY - 7.6,
        Math.abs(bodyW * 0.6),
        3.2
      );
      ctx.fillStyle = '#7f97bb';
      ctx.beginPath();
      ctx.arc((bodyW * 0.18 + gunLen) * dir, gunY - 1.2, 2.1, 0, Math.PI * 2);
      ctx.fill();

      // Upward sky-cannon tube so upgraded gunners read clearly.
      const cannonBaseX = -bodyW * 0.08 * dir;
      const cannonBaseY = -bodyH * 0.58;
      const cannonLen = bodyW * 0.84;
      const cannonAngle = -Math.PI / 2 + dir * 0.19;
      const cannonTipX = cannonBaseX + Math.cos(cannonAngle) * cannonLen;
      const cannonTipY = cannonBaseY + Math.sin(cannonAngle) * cannonLen;

      ctx.fillStyle = '#2b3b53';
      ctx.fillRect(-bodyW * 0.2, -bodyH * 0.64, bodyW * 0.4, bodyH * 0.18);
      ctx.strokeStyle = '#b7c9e6';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cannonBaseX, cannonBaseY);
      ctx.lineTo(cannonTipX, cannonTipY);
      ctx.stroke();
      ctx.fillStyle = '#4f6689';
      ctx.beginPath();
      ctx.arc(cannonBaseX, cannonBaseY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#89a8d0';
      ctx.beginPath();
      ctx.arc(cannonTipX, cannonTipY, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#1f2a3b';
    ctx.fillRect(
      Math.min((-bodyW * (upgraded ? 0.14 : 0.04)) * dir, (bodyW * 0.12) * dir),
      gunY + 1.2,
      Math.abs(bodyW * (upgraded ? 0.26 : 0.16)),
      upgraded ? 4.2 : 3.6
    );

    if (flash > 0) {
      const muzzleX = (bodyW * 0.18 + gunLen) * dir;
      const muzzleY = gunY - 1.2;
      const flashR = 2.2 + flash * 6.2;
      ctx.fillStyle = '#fff1b3';
      ctx.beginPath();
      ctx.arc(muzzleX, muzzleY, flashR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff9d64';
      ctx.beginPath();
      ctx.arc(muzzleX + dir * 2.6, muzzleY, flashR * 0.64, 0, Math.PI * 2);
      ctx.fill();

      if (upgraded) {
        const cannonBaseX = -bodyW * 0.08 * dir;
        const cannonBaseY = -bodyH * 0.58;
        const cannonLen = bodyW * 0.84;
        const cannonAngle = -Math.PI / 2 + dir * 0.19;
        const cannonTipX = cannonBaseX + Math.cos(cannonAngle) * cannonLen;
        const cannonTipY = cannonBaseY + Math.sin(cannonAngle) * cannonLen;
        const cannonFlashR = 1.8 + flash * 4.6;
        ctx.fillStyle = '#fff4bf';
        ctx.beginPath();
        ctx.arc(cannonTipX, cannonTipY, cannonFlashR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffab6a';
        ctx.beginPath();
        ctx.arc(
          cannonTipX + Math.cos(cannonAngle) * 2.2,
          cannonTipY + Math.sin(cannonAngle) * 2.2,
          cannonFlashR * 0.62,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();

    if (showHud) {
      ctx.fillStyle = '#ffd7aa';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('GUNNER', x, y - bodyH * 1.18);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawNecroSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.necroExpertUpgraded);
    const scale = minion.super ? 1.45 : 1.08;
    const bodyR = 12 * scale;
    const shieldMax = Math.max(0, Number(minion.necroShieldMax) || 0);
    const shieldHp = Math.max(0, Number(minion.necroShieldHp) || 0);
    const shieldTtl = Math.max(0, Number(minion.necroShieldTtl) || 0);
    const shieldMaxTtl = Math.max(0.01, Number(minion.necroShieldMaxTtl) || 20);
    const shieldLife = shieldMax > 0 ? Math.max(0, Math.min(1, (shieldHp / shieldMax) * (shieldTtl / shieldMaxTtl))) : 0;
    if (!cacheRender) {
      const shieldBucket = Math.max(0, Math.min(6, Math.round(shieldLife * 6)));
      const cacheKey = `necro:${sideName}:${minion.super ? 1 : 0}:${upgraded ? 1 : 0}:${shieldBucket}`;
      const cacheWidth = Math.ceil(bodyR * 4 + 42);
      const cacheHeight = Math.ceil(bodyR * 4 + 42);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = { ...minion, x: w / 2, y: h / 2 };
        this.drawNecroSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) {
          ctx.fillStyle = '#a9ffe0';
          ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('NECRO', minion.x, minion.y - bodyR - (minion.super ? 26 : 20));
          this.drawMinionHpBar(minion, minion.x, minion.y, Math.max(1, scale * 0.95));
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;

    ctx.fillStyle = '#00000024';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR + 3, bodyR * 0.86, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();

    const auraR = bodyR + (minion.super ? 13 : 9);
    const aura = ctx.createRadialGradient(x, y - 2, 2, x, y - 2, auraR);
    aura.addColorStop(0, '#7df6bf44');
    aura.addColorStop(1, '#1b2d2d00');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y - 2, auraR, 0, Math.PI * 2);
    ctx.fill();

    if (shieldLife > 0) {
      ctx.strokeStyle = this.withAlpha('#a3f4ff', 0.28 + shieldLife * 0.52);
      ctx.lineWidth = 1.8 + shieldLife * 1.8;
      ctx.beginPath();
      ctx.arc(x, y - bodyR * 0.08, bodyR * (1.28 + shieldLife * 0.18), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);

    // Cloak.
    ctx.fillStyle = '#21313f';
    ctx.beginPath();
    ctx.moveTo(0, -bodyR * 0.95);
    ctx.lineTo(-bodyR * 1.02, bodyR * 1.12);
    ctx.lineTo(bodyR * 1.02, bodyR * 1.12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#82ffd2';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#2d4458';
    ctx.beginPath();
    ctx.moveTo(0, -bodyR * 0.78);
    ctx.lineTo(-bodyR * 0.5, bodyR * 0.88);
    ctx.lineTo(bodyR * 0.5, bodyR * 0.88);
    ctx.closePath();
    ctx.fill();

    // Skull face.
    ctx.fillStyle = '#ebe8df';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.68, bodyR * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10161f';
    ctx.beginPath();
    ctx.arc(-bodyR * 0.16, -bodyR * 0.72, bodyR * 0.08, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.16, -bodyR * 0.72, bodyR * 0.08, 0, Math.PI * 2);
    ctx.fill();

    if (upgraded) {
      ctx.fillStyle = '#d6b95b';
      ctx.beginPath();
      ctx.moveTo(-bodyR * 0.5, -bodyR * 1.14);
      ctx.lineTo(-bodyR * 0.34, -bodyR * 1.52);
      ctx.lineTo(-bodyR * 0.14, -bodyR * 1.18);
      ctx.lineTo(0, -bodyR * 1.58);
      ctx.lineTo(bodyR * 0.14, -bodyR * 1.18);
      ctx.lineTo(bodyR * 0.34, -bodyR * 1.52);
      ctx.lineTo(bodyR * 0.5, -bodyR * 1.14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f7e59b';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.fillStyle = '#8cffd1';
      ctx.beginPath();
      ctx.arc(0, -bodyR * 1.32, bodyR * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#7ff7bf';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.16, -bodyR * 0.52);
    ctx.lineTo(bodyR * 0.16, -bodyR * 0.52);
    ctx.stroke();

    // Staff + orb.
    const staffX = dir * bodyR * 0.95;
    ctx.strokeStyle = '#d8cab0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(staffX, -bodyR * 0.12);
    ctx.lineTo(staffX + dir * 2, -bodyR * 1.02);
    ctx.stroke();
    ctx.fillStyle = '#81ffd0';
    ctx.beginPath();
    ctx.arc(staffX + dir * 2, -bodyR * 1.14, bodyR * 0.17, 0, Math.PI * 2);
    ctx.fill();

    if (minion.super) {
      ctx.strokeStyle = '#fff1a590';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -bodyR * 0.2, bodyR * 1.58, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    if (showHud) {
      ctx.fillStyle = '#a9ffe0';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('NECRO', x, y - bodyR - (minion.super ? 26 : 20));
      this.drawMinionHpBar(minion, x, y, Math.max(1, scale * 0.95));
    }
  }

  drawBomberSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const scale = minion.super ? 1.22 : 1;
    const tier = Math.max(0, Math.min(3, Number(minion.tier) || 0));
    const r = (12 + tier) * scale;
    if (!cacheRender) {
      const cacheKey = `bomber:${sideName}:${minion.super ? 1 : 0}:${tier}`;
      const cacheWidth = Math.ceil(r * 5 + 42);
      const cacheHeight = Math.ceil(r * 4 + 36);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = { ...minion, x: w / 2, y: h / 2, tier };
        this.drawBomberSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) {
          ctx.fillStyle = '#f5d39f';
          ctx.font = `bold ${minion.super ? 12 : 10}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('BOMBER', minion.x, minion.y - r - 16);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;

    ctx.fillStyle = '#00000024';
    ctx.beginPath();
    ctx.ellipse(x, y + r + 4, r * 0.95, 5.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.dark;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Big strapped bomb on front.
    const bombX = x + dir * (r + 3);
    const bombY = y + 1;
    const bombR = r * 0.76;
    ctx.fillStyle = '#161a23';
    ctx.beginPath();
    ctx.arc(bombX, bombY, bombR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8995ac';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.strokeStyle = '#f7cf78';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(bombX + dir * 2, bombY - bombR + 1);
    ctx.lineTo(bombX + dir * 7.5, bombY - bombR - 5.5);
    ctx.stroke();
    ctx.fillStyle = '#ffd97f';
    ctx.beginPath();
    ctx.arc(bombX + dir * 9.4, bombY - bombR - 6.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff805f';
    ctx.beginPath();
    ctx.arc(bombX + dir * 12.4, bombY - bombR - 8.2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    if (showHud) {
      ctx.fillStyle = '#f5d39f';
      ctx.font = `bold ${minion.super ? 12 : 10}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('BOMBER', x, y - r - 16);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawHeroSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;
    const scale = (minion.super ? 1.26 : 1.08) * 1.5;
    const bodyR = 14 * scale;
    const swingInput = Number.isFinite(minion.heroSwing) ? minion.heroSwing : 0;
    const swing = Math.sin(swingInput * 1.4);
    if (!cacheRender) {
      const swingBucket = Math.max(0, Math.min(8, Math.round((swing + 1) * 4)));
      const quantSwing = (Math.asin(swingBucket / 4 - 1) || 0) / 1.4;
      const cacheKey = `hero:${sideName}:${minion.super ? 1 : 0}:${swingBucket}`;
      const cacheWidth = Math.ceil(bodyR * 6 + 56);
      const cacheHeight = Math.ceil(bodyR * 5.4 + 56);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          heroSwing: quantSwing,
        };
        this.drawHeroSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) {
          ctx.strokeStyle = '#311707';
          ctx.lineWidth = 2.6;
          ctx.font = `bold ${minion.super ? 14 : 12}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.strokeText('HERO!!!', minion.x, minion.y - bodyR - 20);
          ctx.fillStyle = '#ffe4b0';
          ctx.fillText('HERO!!!', minion.x, minion.y - bodyR - 20);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const dramaPulse = 0.65 + Math.abs(swing) * 0.55;

    const aura = ctx.createRadialGradient(x, y - bodyR * 0.2, bodyR * 0.6, x, y - bodyR * 0.2, bodyR * (2.2 + dramaPulse * 0.35));
    aura.addColorStop(0, sideName === 'left' ? 'rgba(147, 214, 255, 0.24)' : 'rgba(255, 154, 154, 0.24)');
    aura.addColorStop(0.5, sideName === 'left' ? 'rgba(116, 194, 255, 0.14)' : 'rgba(255, 128, 128, 0.13)');
    aura.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y - bodyR * 0.2, bodyR * (2.2 + dramaPulse * 0.35), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0000002a';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR + 5, bodyR * 0.94, 6.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cape.
    ctx.fillStyle = minion.side === 'left' ? '#2a5f9a' : '#9a2f38';
    ctx.beginPath();
    ctx.moveTo(x - dir * 3, y - bodyR * 0.92);
    ctx.lineTo(x - dir * (bodyR * 1.18), y + bodyR * 0.34);
    ctx.lineTo(x - dir * (bodyR * 0.72), y + bodyR * 1.1);
    ctx.lineTo(x - dir * 2, y + bodyR * 0.62);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);

    // Torso armor.
    ctx.fillStyle = '#334864';
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a6c1e5';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.fillStyle = palette.primary;
    ctx.fillRect(-bodyR * 0.24, -bodyR * 0.88, bodyR * 0.48, bodyR * 1.6);

    // Belt and boots.
    ctx.fillStyle = '#6d502f';
    ctx.fillRect(-bodyR * 0.54, bodyR * 0.2, bodyR * 1.08, bodyR * 0.18);
    ctx.fillStyle = '#202a38';
    ctx.fillRect(-bodyR * 0.5, bodyR * 0.92, bodyR * 0.28, bodyR * 0.46);
    ctx.fillRect(bodyR * 0.22, bodyR * 0.92, bodyR * 0.28, bodyR * 0.46);

    // Face and hair.
    ctx.fillStyle = '#f0d2b7';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.9, bodyR * 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2418';
    ctx.beginPath();
    ctx.arc(-dir * bodyR * 0.12, -bodyR * 1.16, bodyR * 0.28, Math.PI * 1.02, Math.PI * 2.05);
    ctx.fill();
    ctx.fillStyle = '#1a2233';
    ctx.beginPath();
    ctx.arc(-bodyR * 0.15, -bodyR * 0.92, 1.15, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.15, -bodyR * 0.92, 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7d1616';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.04, -bodyR * 0.78);
    ctx.lineTo(bodyR * 0.2, -bodyR * 0.66);
    ctx.stroke();
    ctx.strokeStyle = '#402114';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.2, -bodyR * 0.72);
    ctx.lineTo(bodyR * 0.2, -bodyR * 0.72);
    ctx.stroke();

    // Sword slash stance.
    const swordLen = bodyR * 1.65;
    const swordAng = dir * (0.44 + swing * 0.34);
    const sx1 = Math.cos(swordAng) * bodyR * 0.18;
    const sy1 = Math.sin(swordAng) * bodyR * 0.18;
    const sx2 = Math.cos(swordAng) * swordLen;
    const sy2 = Math.sin(swordAng) * swordLen;
    ctx.strokeStyle = '#e8f3ff';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();
    ctx.strokeStyle = '#8ec8ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx2 - dir * 2, sy2 - 1);
    ctx.lineTo(sx2 + dir * 4, sy2 + 1.2);
    ctx.stroke();
    ctx.strokeStyle = '#ffd89a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx1 - dir * 2, sy1 + 2.4);
    ctx.lineTo(sx1 + dir * 3.5, sy1 - 2.2);
    ctx.stroke();

    ctx.restore();

    if (showHud) {
      ctx.strokeStyle = '#311707';
      ctx.lineWidth = 2.6;
      ctx.font = `bold ${minion.super ? 14 : 12}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.strokeText('HERO!!!', x, y - bodyR - 20);
      ctx.fillStyle = '#ffe4b0';
      ctx.fillText('HERO!!!', x, y - bodyR - 20);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawMonkSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.monkHealCircleUpgraded);
    const scale = minion.super ? 1.18 : 1.04;
    const bodyR = 13 * scale;
    const healScale = Number.isFinite(minion.monkHealScale) ? minion.monkHealScale : 1;
    if (!cacheRender) {
      const healBucket = Math.max(0, Math.min(4, Math.round(healScale * 4)));
      const cacheKey = `monk:${sideName}:${minion.super ? 1 : 0}:${upgraded ? 1 : 0}:${healBucket}`;
      const cacheWidth = Math.ceil(bodyR * 4.6 + 44);
      const cacheHeight = Math.ceil(bodyR * 4.4 + 44);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          monkHealScale: healBucket / 4,
        };
        this.drawMonkSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) {
          ctx.fillStyle = '#ddffcb';
          ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('MONK', minion.x, minion.y - bodyR - 18);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;
    const auraAlpha = 0.18 + Math.max(0, Math.min(0.3, healScale * 0.25));

    ctx.fillStyle = '#0000002a';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR + 5, bodyR * 0.94, 6.1, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(130, 255, 190, ${auraAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 2, bodyR * 1.28, 0, Math.PI * 2);
    ctx.stroke();
    if (upgraded) {
      ctx.strokeStyle = 'rgba(180, 255, 215, 0.48)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(x, y + 2, bodyR * 1.76, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);

    // Robe.
    ctx.fillStyle = '#d0863d';
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f0cda6';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#8f4f24';
    ctx.fillRect(-bodyR * 0.2, -bodyR * 0.9, bodyR * 0.4, bodyR * 1.7);
    if (upgraded) {
      ctx.fillStyle = '#7fd9a5';
      ctx.beginPath();
      ctx.arc(0, -bodyR * 0.16, bodyR * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Head.
    ctx.fillStyle = '#efcfb0';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.92, bodyR * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b3c22';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 1.06, bodyR * 0.19, 0, Math.PI * 2);
    ctx.fill();

    // Calm face.
    ctx.fillStyle = '#1e242e';
    ctx.beginPath();
    ctx.arc(-bodyR * 0.13, -bodyR * 0.92, 1.05, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.13, -bodyR * 0.92, 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5e2f1f';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.18, -bodyR * 0.73);
    ctx.lineTo(bodyR * 0.18, -bodyR * 0.73);
    ctx.stroke();

    // Prayer beads.
    ctx.strokeStyle = '#efe3b6';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.12, bodyR * 0.44, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();

    // Staff.
    ctx.strokeStyle = '#5a3c24';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(dir * (bodyR * 0.2), bodyR * 0.2);
    ctx.lineTo(dir * (bodyR * 1.2), -bodyR * 1.08);
    ctx.stroke();
    ctx.fillStyle = '#8ef5c0';
    ctx.beginPath();
    ctx.arc(dir * (bodyR * 1.2), -bodyR * 1.08, bodyR * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.soft;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(dir * (bodyR * 1.2), -bodyR * 1.08, bodyR * 0.32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    if (showHud) {
      ctx.fillStyle = '#ddffcb';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('MONK', x, y - bodyR - 18);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawPresidentSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const scale = minion.super ? 1.2 : 1.04;
    const bodyR = 13 * scale;
    const setup = Boolean(minion.presidentSetup);
    if (!cacheRender) {
      const auraRadius = Math.max(0, Number(minion.presidentAuraRadius) || 0);
      const auraBucket = Math.max(0, Math.min(8, Math.round(auraRadius / 30)));
      const cacheKey = `president:${sideName}:${minion.super ? 1 : 0}:${setup ? 1 : 0}:${auraBucket}`;
      const cacheWidth = Math.ceil((setup ? 220 : 140) * scale);
      const cacheHeight = Math.ceil((setup ? 170 : 136) * scale);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          presidentAuraRadius: auraBucket * 30,
        };
        this.drawPresidentSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) {
          ctx.fillStyle = '#ffe3b9';
          ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('PRESIDENT', minion.x, minion.y - bodyR - 18);
          this.drawMinionHpBar(minion, minion.x, minion.y, scale);
        }
        return;
      }
    }
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;

    ctx.fillStyle = '#00000026';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR + 4, bodyR * 0.9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (setup) {
      const auraR = Math.max(36, Math.min(72, (minion.presidentAuraRadius || 180) * 0.28));
      ctx.strokeStyle = '#ffe2a266';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y + 3, auraR, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);

    // Podium.
    const podiumW = setup ? 26 * scale : 16 * scale;
    const podiumH = setup ? 24 * scale : 14 * scale;
    ctx.fillStyle = '#6a4b2f';
    ctx.fillRect(-podiumW / 2, bodyR * 0.35, podiumW, podiumH);
    ctx.strokeStyle = '#d8bd8e';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-podiumW / 2, bodyR * 0.35, podiumW, podiumH);
    if (setup) {
      ctx.fillStyle = '#2a3750';
      ctx.beginPath();
      ctx.arc(0, bodyR * 0.35 + podiumH * 0.45, 5.4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f4d487';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P', 0, bodyR * 0.35 + podiumH * 0.45 + 3);
    }

    // Suit body.
    ctx.fillStyle = '#1d2d45';
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9db4d2';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#f1f5ff';
    ctx.beginPath();
    ctx.moveTo(0, -bodyR * 0.24);
    ctx.lineTo(-bodyR * 0.22, bodyR * 0.28);
    ctx.lineTo(bodyR * 0.22, bodyR * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ad2f3f';
    ctx.fillRect(-1.6, -bodyR * 0.04, 3.2, bodyR * 0.42);

    // Head + hair.
    ctx.fillStyle = '#f0d1b5';
    ctx.beginPath();
    ctx.arc(0, -bodyR * 0.9, bodyR * 0.44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a2d1f';
    ctx.beginPath();
    ctx.ellipse(-dir * 1.2, -bodyR * 1.08, bodyR * 0.34, bodyR * 0.16, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c2330';
    ctx.beginPath();
    ctx.arc(-bodyR * 0.14, -bodyR * 0.9, 1.1, 0, Math.PI * 2);
    ctx.arc(bodyR * 0.14, -bodyR * 0.9, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#642a2a';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-bodyR * 0.16, -bodyR * 0.74);
    ctx.lineTo(bodyR * 0.16, -bodyR * 0.74);
    ctx.stroke();

    // Microphone.
    ctx.strokeStyle = '#cfd7e5';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(dir * 4, -bodyR * 0.2);
    ctx.lineTo(dir * (podiumW * 0.42), bodyR * 0.35);
    ctx.stroke();
    ctx.fillStyle = '#9fb3ce';
    ctx.beginPath();
    ctx.arc(dir * 4, -bodyR * 0.22, 2.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (showHud) {
      ctx.fillStyle = '#ffe3b9';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('PRESIDENT', x, y - bodyR - 18);
      this.drawMinionHpBar(minion, x, y, scale);
    }
  }

  drawShieldBearerSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.shieldDarkMetalUpgraded);
    const x = minion.x;
    const y = minion.y;
    const dir = sideName === 'left' ? 1 : -1;
    const baseR = Math.max(18, Number(minion.r) || 20);
    const scale = 1.1;
    const bodyW = baseR * 1.05;
    const bodyH = baseR * 1.78;
    const headR = baseR * 0.36;
    const pushLife = Math.max(0, Math.min(1, (Number(minion.shieldPushTtl) || 0) / 0.75));
    const darkMetalLife = Math.max(0, Math.min(1, (Number(minion.shieldDarkMetalTtl) || 0) / SHIELD_DARK_METAL_DURATION));
    const darkMetalActive = darkMetalLife > 0.001;
    if (!cacheRender) {
      const baseRBucket = Math.max(18, Math.min(36, Math.round(baseR)));
      const pushBucket = Math.max(0, Math.min(5, Math.round(pushLife * 5)));
      const darkMetalBucket = Math.max(0, Math.min(5, Math.round(darkMetalLife * 5)));
      const cacheKey = `shield:${sideName}:${baseRBucket}:${upgraded ? 1 : 0}:${pushBucket}:${darkMetalBucket}`;
      const cacheWidth = Math.ceil(baseRBucket * 6.2 + 64);
      const cacheHeight = Math.ceil(baseRBucket * 7.2 + 72);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          r: baseRBucket,
          shieldPushTtl: (pushBucket / 5) * 0.75,
          shieldDarkMetalTtl: (darkMetalBucket / 5) * SHIELD_DARK_METAL_DURATION,
        };
        this.drawShieldBearerSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) {
          ctx.fillStyle = darkMetalActive ? '#d0d7e5' : '#d9ecff';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(darkMetalActive ? 'DARK METAL' : 'SHIELD', minion.x, minion.y - bodyH - headR - 18);
          this.drawMinionHpBar(minion, minion.x, minion.y + 2, Math.max(1.4, (baseR / 16) * 1.25));
        }
        return;
      }
    }
    const shieldScale = 1 + pushLife * 0.45;
    const shieldW = (baseR * 1.14 + 10) * shieldScale;
    const shieldH = (baseR * 1.9 + 10) * shieldScale;
    const shieldX = x + dir * (baseR * 0.88);
    const shieldY = y + baseR * 0.06;
    const headX = x - dir * (baseR * 0.06);
    const headY = y - baseR * 2;

    ctx.fillStyle = '#0000002c';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyH + 6, bodyW * 1.08, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (pushLife > 0) {
      ctx.strokeStyle = this.withAlpha('#c7e3ff', 0.28 + pushLife * 0.35);
      ctx.lineWidth = 2 + pushLife * 2;
      ctx.beginPath();
      ctx.ellipse(shieldX, shieldY, shieldW * 0.6, shieldH * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (darkMetalActive) {
      ctx.strokeStyle = this.withAlpha('#d5dde8', 0.16 + darkMetalLife * 0.22);
      ctx.lineWidth = 1.6 + darkMetalLife * 1.8;
      ctx.beginPath();
      ctx.ellipse(shieldX, shieldY, shieldW * (0.62 + darkMetalLife * 0.06), shieldH * (0.52 + darkMetalLife * 0.06), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = darkMetalActive ? '#21252d' : '#384e6f';
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.64, -bodyH * 0.92);
    ctx.lineTo(-bodyW * 0.82, bodyH * 0.9);
    ctx.lineTo(bodyW * 0.62, bodyH * 0.9);
    ctx.lineTo(bodyW * 0.48, -bodyH * 0.92);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darkMetalActive ? '#596171' : '#a9c5e6';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = darkMetalActive ? '#141922' : '#25364f';
    ctx.fillRect(-bodyW * 0.74, -bodyH * 0.5, bodyW * 1.48, bodyH * 0.22);
    ctx.fillStyle = darkMetalActive ? '#2a303b' : '#6f86a9';
    ctx.fillRect(-bodyW * 0.72, bodyH * 0.48, bodyW * 0.58, bodyH * 0.25);
    ctx.fillRect(bodyW * 0.14, bodyH * 0.48, bodyW * 0.58, bodyH * 0.25);
    if (upgraded) {
      ctx.fillStyle = '#a8f0ff';
      for (let i = -1; i <= 1; i += 1) {
        const gemX = i * bodyW * 0.24;
        const gemY = -bodyH * 0.22;
        const gemW = bodyW * 0.12;
        const gemH = bodyW * 0.16;
        ctx.beginPath();
        ctx.moveTo(gemX, gemY - gemH);
        ctx.lineTo(gemX + gemW, gemY);
        ctx.lineTo(gemX, gemY + gemH);
        ctx.lineTo(gemX - gemW, gemY);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.save();
    ctx.translate(shieldX, shieldY);
    ctx.scale(dir, 1);
    const shW = shieldW;
    const shH = shieldH;
    const r = Math.max(8, baseR * 0.42);
    ctx.fillStyle = darkMetalActive ? '#151a20' : '#4f6688';
    ctx.beginPath();
    ctx.moveTo(-shW * 0.5 + r, -shH * 0.5);
    ctx.lineTo(shW * 0.5 - r, -shH * 0.5);
    ctx.quadraticCurveTo(shW * 0.5, -shH * 0.5, shW * 0.5, -shH * 0.5 + r);
    ctx.lineTo(shW * 0.5, shH * 0.5 - r);
    ctx.quadraticCurveTo(shW * 0.5, shH * 0.5, shW * 0.5 - r, shH * 0.5);
    ctx.lineTo(-shW * 0.5 + r, shH * 0.5);
    ctx.quadraticCurveTo(-shW * 0.5, shH * 0.5, -shW * 0.5, shH * 0.5 - r);
    ctx.lineTo(-shW * 0.5, -shH * 0.5 + r);
    ctx.quadraticCurveTo(-shW * 0.5, -shH * 0.5, -shW * 0.5 + r, -shH * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = darkMetalActive ? '#5c6673' : '#d4e5fa';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.strokeStyle = darkMetalActive ? '#2f3948' : '#8eb4de';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-shW * 0.3, -shH * 0.36);
    ctx.lineTo(shW * 0.26, -shH * 0.36);
    ctx.moveTo(-shW * 0.3, 0);
    ctx.lineTo(shW * 0.26, 0);
    ctx.moveTo(-shW * 0.3, shH * 0.36);
    ctx.lineTo(shW * 0.26, shH * 0.36);
    ctx.stroke();
    if (upgraded) {
      ctx.fillStyle = darkMetalActive ? '#e9f4ff' : '#c6f6ff';
      const gemR = Math.max(3.2, baseR * 0.12);
      for (let i = -1; i <= 1; i += 1) {
        const gx = -shW * 0.12 + i * shW * 0.2;
        const gy = -shH * 0.16 + Math.abs(i) * shH * 0.18;
        ctx.beginPath();
        ctx.moveTo(gx, gy - gemR);
        ctx.lineTo(gx + gemR, gy);
        ctx.lineTo(gx, gy + gemR);
        ctx.lineTo(gx - gemR, gy);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();

    // Head is drawn above the shield top so players can target it.
    ctx.fillStyle = '#efcfb1';
    ctx.beginPath();
    ctx.arc(headX, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f1f1a';
    ctx.beginPath();
    ctx.ellipse(headX - dir * (headR * 0.12), headY - headR * 0.36, headR * 0.66, headR * 0.42, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    if (showHud) {
      ctx.fillStyle = darkMetalActive ? '#d0d7e5' : '#d9ecff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(darkMetalActive ? 'DARK METAL' : 'SHIELD', x, y - bodyH - headR - 18);
      this.drawMinionHpBar(minion, x, y + 2, Math.max(1.4, (baseR / 16) * 1.25));
    }
  }

  drawStoneGolemSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const { ctx } = this;
    const x = minion.x;
    const y = minion.y;
    const dir = minion.side === 'left' ? 1 : -1;
    const baseR = Math.max(22, Number(minion.r) || 30);
    const bodyW = baseR * 1.9;
    const bodyH = baseR * 1.8;
    const smashLife = Math.max(0, Math.min(1, (Number(minion.golemSmashTtl) || 0) / STONE_GOLEM_SMASH_TTL));
    const smashProgress = 1 - smashLife;
    const shieldMax = Math.max(0, Number(minion.golemShieldMax) || 0);
    const shieldHp = Math.max(0, Number(minion.golemShieldHp) || 0);
    const shieldTtl = Math.max(0, Number(minion.golemShieldTtl) || 0);
    const shieldHpPct = shieldMax > 0 ? Math.max(0, Math.min(1, shieldHp / shieldMax)) : 0;
    const shieldFade = Math.max(0, Math.min(1, shieldTtl / STONE_GOLEM_SHIELD_TTL));
    const sidePalette = TEAM_COLORS[minion.side] || TEAM_COLORS.left;
    let jumpLift = 0;
    if (smashLife > 0) {
      if (smashProgress < 0.45) {
        jumpLift = Math.sin((smashProgress / 0.45) * (Math.PI * 0.5)) * (baseR * 0.34);
      } else {
        const fallT = Math.max(0, Math.min(1, (smashProgress - 0.45) / 0.55));
        jumpLift = (1 - fallT) * (baseR * 0.34);
      }
    }
    const impactLife = smashLife > 0 ? Math.max(0, 1 - Math.abs(smashProgress - 0.74) / 0.24) : 0;
    const drawY = y - jumpLift;
    const shadowStretch = 1 + Math.max(0, jumpLift / (baseR * 0.72));

    ctx.fillStyle = '#00000033';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyH * 0.66, bodyW * 0.84 * shadowStretch, bodyH * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();

    if (shieldHpPct > 0 && shieldFade > 0) {
      const auraAlpha = (0.14 + shieldHpPct * 0.2) * (0.45 + shieldFade * 0.55);
      ctx.fillStyle = this.withAlpha(sidePalette.soft, auraAlpha * 0.55);
      ctx.beginPath();
      ctx.ellipse(x, drawY - bodyH * 0.08, bodyW * 0.72, bodyH * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.withAlpha('#dcf5ff', auraAlpha + 0.14);
      ctx.lineWidth = 1.6 + shieldHpPct * 1.6;
      ctx.beginPath();
      ctx.ellipse(x, drawY - bodyH * 0.1, bodyW * (0.78 + shieldHpPct * 0.1), bodyH * (0.76 + shieldHpPct * 0.1), 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (smashLife > 0) {
      ctx.strokeStyle = this.withAlpha(sidePalette.primary, 0.22 + smashLife * 0.3);
      ctx.lineWidth = 3 + smashLife * 3;
      ctx.beginPath();
      ctx.ellipse(x, y + bodyH * 0.54, bodyW * (0.58 + smashLife * 0.58), bodyH * (0.19 + smashLife * 0.22), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = this.withAlpha('#e7f5ff', 0.18 + smashLife * 0.22);
      ctx.lineWidth = 1.6 + smashLife * 1.2;
      ctx.beginPath();
      ctx.ellipse(x, y + bodyH * 0.56, bodyW * (0.45 + smashLife * 0.44), bodyH * (0.14 + smashLife * 0.15), 0, 0, Math.PI * 2);
      ctx.stroke();
      if (impactLife > 0) {
        ctx.strokeStyle = this.withAlpha('#f0fbff', 0.2 + impactLife * 0.32);
        ctx.lineWidth = 2 + impactLife * 2;
        ctx.beginPath();
        ctx.ellipse(x, y + bodyH * 0.58, bodyW * (0.52 + impactLife * 0.38), bodyH * (0.12 + impactLife * 0.15), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.translate(x, drawY);
    if (impactLife > 0) {
      const sx = 1 + impactLife * 0.06;
      const sy = 1 - impactLife * 0.08;
      ctx.scale(sx, sy);
    }

    ctx.fillStyle = '#6f756f';
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.52, -bodyH * 0.54);
    ctx.lineTo(-bodyW * 0.64, bodyH * 0.28);
    ctx.lineTo(-bodyW * 0.36, bodyH * 0.62);
    ctx.lineTo(bodyW * 0.36, bodyH * 0.62);
    ctx.lineTo(bodyW * 0.64, bodyH * 0.28);
    ctx.lineTo(bodyW * 0.52, -bodyH * 0.54);
    ctx.lineTo(bodyW * 0.12, -bodyH * 0.72);
    ctx.lineTo(-bodyW * 0.12, -bodyH * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#9aa49a';
    ctx.lineWidth = 2.1;
    ctx.stroke();

    ctx.fillStyle = '#5d625d';
    ctx.fillRect(-bodyW * 0.82, -bodyH * 0.26, bodyW * 0.28, bodyH * 0.7);
    ctx.fillRect(bodyW * 0.54, -bodyH * 0.26, bodyW * 0.28, bodyH * 0.7);
    ctx.fillStyle = '#7b827b';
    ctx.fillRect(-bodyW * 0.78, bodyH * 0.32, bodyW * 0.2, bodyH * 0.24);
    ctx.fillRect(bodyW * 0.58, bodyH * 0.32, bodyW * 0.2, bodyH * 0.24);

    ctx.fillStyle = '#4e524e';
    ctx.fillRect(-bodyW * 0.36, bodyH * 0.56, bodyW * 0.26, bodyH * 0.28);
    ctx.fillRect(bodyW * 0.1, bodyH * 0.56, bodyW * 0.26, bodyH * 0.28);

    ctx.fillStyle = '#23282a';
    const eyeY = -bodyH * 0.3;
    ctx.fillRect(-bodyW * 0.18, eyeY, bodyW * 0.14, bodyH * 0.08);
    ctx.fillRect(bodyW * 0.04, eyeY, bodyW * 0.14, bodyH * 0.08);
    ctx.fillStyle = sidePalette.soft;
    ctx.fillRect(-bodyW * 0.16, eyeY + bodyH * 0.014, bodyW * 0.1, bodyH * 0.035);
    ctx.fillRect(bodyW * 0.06, eyeY + bodyH * 0.014, bodyW * 0.1, bodyH * 0.035);

    ctx.strokeStyle = '#aeb7ae';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-bodyW * 0.24, -bodyH * 0.06);
    ctx.lineTo(-bodyW * 0.08, bodyH * 0.1);
    ctx.lineTo(bodyW * 0.04, -bodyH * 0.02);
    ctx.moveTo(bodyW * 0.26, -bodyH * 0.18);
    ctx.lineTo(bodyW * 0.1, bodyH * 0.02);
    ctx.stroke();

    if (smashLife > 0) {
      ctx.strokeStyle = this.withAlpha('#e4f4ff', 0.22 + smashLife * 0.34);
      ctx.lineWidth = 1.8 + smashLife * 1.8;
      ctx.beginPath();
      ctx.moveTo(-bodyW * 0.8 * dir, bodyH * 0.36);
      ctx.lineTo(-bodyW * 0.96 * dir, bodyH * 0.58);
      ctx.stroke();
    }

    ctx.restore();

    if (showHud) {
      ctx.fillStyle = '#e3eadf';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GOLEM', x, drawY - bodyH - 20);
      if (shieldMax > 0 && (shieldHpPct > 0 || shieldFade > 0)) {
        const barScale = Math.max(1.7, (baseR / 16) * 1.4);
        const shieldW = 36 * barScale;
        const shieldX = x - shieldW / 2;
        const shieldY = (drawY + 8) - (26 * barScale + 2) - 8;
        ctx.fillStyle = '#101420d9';
        ctx.fillRect(shieldX, shieldY, shieldW, 4);
        if (shieldHpPct > 0) {
          ctx.fillStyle = this.withAlpha('#8de6ff', 0.55 + shieldFade * 0.35);
          ctx.fillRect(shieldX, shieldY, shieldW * shieldHpPct, 4);
        }
      }
      this.drawMinionHpBar(minion, x, drawY + 8, Math.max(1.7, (baseR / 16) * 1.4));
    }
  }

  miniFailedSpecialMinion(type, side = 'left') {
    const base = {
      side,
      x: 0,
      y: 0,
      r: 16,
      hp: 100,
      maxHp: 100,
      tier: 1,
      level: 8,
      super: false,
      summoned: false,
      explosive: false,
      gunner: false,
      rider: false,
      riderChargeReady: false,
      digger: false,
      digPhase: 0.8,
      monk: false,
      monkHealScale: 1,
      hero: false,
      heroSwing: 1.1,
      shieldBearer: false,
      shieldPushTtl: 0,
      shieldPushScale: 1,
      stoneGolem: false,
      golemSmashTtl: 0,
      golemShieldHp: 0,
      golemShieldMax: 0,
      golemShieldTtl: 0,
      president: false,
      presidentSetup: true,
      presidentAuraRadius: 180,
      dragon: false,
      flying: false,
      flyPhase: 0.8,
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunFlashTtl: 0,
      necrominion: false,
      failedSpecialType: null,
    };
    if (type === 'dragon') {
      base.dragon = true;
      base.flying = true;
      base.r = 23;
      base.level = 14;
    } else if (type === 'shield') {
      base.shieldBearer = true;
      base.r = 26;
    } else if (type === 'digger') {
      base.digger = true;
      base.r = 13;
    } else if (type === 'necrominion') {
      base.necrominion = true;
      base.r = 20;
    } else if (type === 'gunner') {
      base.gunner = true;
      base.r = 15;
      base.level = 9;
    } else if (type === 'rider') {
      base.rider = true;
      base.riderChargeReady = true;
      base.r = 18;
      base.level = 10;
    } else if (type === 'monk') {
      base.monk = true;
      base.r = 18;
      base.level = 10;
    } else if (type === 'hero') {
      base.hero = true;
      base.r = 23;
      base.level = 16;
      base.tier = 2;
    } else if (type === 'president') {
      base.president = true;
      base.r = 18;
      base.level = 12;
    } else if (type === 'super') {
      base.super = true;
      base.r = 20;
      base.tier = 2;
      base.level = 14;
    } else {
      return null;
    }
    return base;
  }

  drawFailedSpecialMini(type, x, y, size = 3, side = 'left') {
    const mini = this.miniFailedSpecialMinion(type, side);
    if (!mini) return;
    const { ctx } = this;
    const s = Math.max(3, size);
    const scale = s / 22;
    ctx.save();
    ctx.translate(x, y + 1.5);
    ctx.scale(scale, scale);
    this.drawMinionSprite(mini, { showHud: false, allowEffects: false });
    ctx.restore();
  }

  drawFailedSpecialHat(minion, x, y, bodyR, scale = 1) {
    const type = typeof minion?.failedSpecialType === 'string' ? minion.failedSpecialType : null;
    if (!type) return;
    const style = FAILED_SPECIAL_HAT_STYLES[type] || null;
    if (!style) return;
    const { ctx } = this;
    const hatW = Math.max(16, bodyR * scale * 1.34);
    const hatH = Math.max(9, bodyR * scale * 0.82);
    const brimW = hatW + 10;
    const brimH = Math.max(3.4, bodyR * scale * 0.28);
    const topY = y - bodyR * scale - 12;

    ctx.fillStyle = '#00000025';
    ctx.beginPath();
    ctx.ellipse(x, topY + brimH + 1, brimW * 0.58, brimH * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = style.cap;
    ctx.beginPath();
    ctx.moveTo(x - hatW * 0.55, topY);
    ctx.lineTo(x + hatW * 0.35, topY);
    ctx.lineTo(x + hatW * 0.15, topY - hatH);
    ctx.lineTo(x - hatW * 0.45, topY - hatH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = style.brim;
    ctx.fillRect(x - brimW * 0.5, topY, brimW, brimH);
    ctx.strokeStyle = '#182233';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - brimW * 0.5, topY, brimW, brimH);
    this.drawFailedSpecialMini(
      type,
      x - hatW * 0.08,
      topY - hatH - 4,
      Math.max(5.6, bodyR * scale * 0.34),
      minion.side
    );
  }

  drawStandardMinionHud(minion, x, y, bodyR, scale, options = {}) {
    const isRider = options.isRider === true;
    const { ctx } = this;
    this.drawFailedSpecialHat(minion, x, y, bodyR, scale);

    if (minion.super) {
      ctx.fillStyle = '#ffe6a8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SUPER', x, y - bodyR * scale - 18);
    }

    if (isRider) {
      ctx.fillStyle = '#ffe5bf';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('RIDER', x, y - bodyR * scale - (minion.super ? 34 : 20));
    }

    const hpPct = Math.max(0, minion.hp / minion.maxHp);
    const hpW = 36 * scale;
    const hpX = x - hpW / 2;
    const hpY = y - (26 * scale + 2);
    ctx.fillStyle = '#101420cc';
    ctx.fillRect(hpX, hpY, hpW, 5);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * hpPct, 5);
  }

  drawNecroRevivedOverlay(minion) {
    if (!minion || !minion.necroRevived) return;
    const { ctx } = this;
    const x = Number(minion.x) || 0;
    const y = Number(minion.y) || 0;
    const r = Math.max(10, Number(minion.r) || 12);
    const t = performance.now() * 0.001;
    const bob = Math.sin(t * 5 + (Number(minion.id) || 0) * 0.23) * 2.2;
    const coreY = y - r * 0.9 + bob;

    ctx.save();
    const aura = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.3);
    aura.addColorStop(0, '#b9ffe4aa');
    aura.addColorStop(0.55, '#91f5db52');
    aura.addColorStop(1, '#7fe6d100');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#dcfff4cc';
    ctx.beginPath();
    ctx.arc(x, coreY, r * 0.52, Math.PI, 0, false);
    ctx.lineTo(x + r * 0.5, coreY + r * 0.72);
    ctx.quadraticCurveTo(x + r * 0.2, coreY + r * 0.45, x, coreY + r * 0.72);
    ctx.quadraticCurveTo(x - r * 0.2, coreY + r * 0.45, x - r * 0.5, coreY + r * 0.72);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#173338';
    ctx.beginPath();
    ctx.arc(x - r * 0.17, coreY - r * 0.05, Math.max(1.2, r * 0.08), 0, Math.PI * 2);
    ctx.arc(x + r * 0.17, coreY - r * 0.05, Math.max(1.2, r * 0.08), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawMinionSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    if (minion.dragon) {
      this.drawDragonSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.digger) {
      this.drawDiggerSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.gunner) {
      this.drawGunnerSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.necrominion) {
      this.drawNecroSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.explosive) {
      this.drawBomberSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.hero) {
      this.drawHeroSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.monk) {
      this.drawMonkSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.shieldBearer) {
      this.drawShieldBearerSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.stoneGolem) {
      this.drawStoneGolemSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }
    if (minion.president) {
      this.drawPresidentSprite(minion, options);
      if (!cacheRender) this.drawNecroRevivedOverlay(minion);
      return;
    }

    const isSummoned = Boolean(minion.summoned);
    const isRider = Boolean(minion.rider);
    const riderSuperHorse = Boolean(minion.riderSuperHorse);
    const riderGaitPhase = isRider && riderSuperHorse
      ? (Number.isFinite(minion.riderGaitPhase)
        ? minion.riderGaitPhase
        : (Number(minion.x) || 0) * 0.085)
      : 0;
    const riderGaitCycle = Math.PI * 2;
    const riderGaitWrapped = ((riderGaitPhase % riderGaitCycle) + riderGaitCycle) % riderGaitCycle;
    const riderGaitBucket = isRider && riderSuperHorse
      ? Math.max(0, Math.min(11, Math.round((riderGaitWrapped / riderGaitCycle) * 11)))
      : 0;
    const t = Math.max(0, Math.min(3, minion.tier || 0));
    const stage = Math.max(0, Math.min(5, Math.floor((minion.level || 0) / 4)));
    const scale = (minion.super ? 2 : 1) * (isRider && riderSuperHorse ? 1.22 : 1);
    const bodyR = 12 + t + Math.min(2, stage * 0.35);
    if (!cacheRender) {
      const sideName = minion.side === 'right' ? 'right' : 'left';
      const cacheKey = [
        'minion',
        sideName,
        t,
        stage,
        minion.super ? 1 : 0,
        isSummoned ? 1 : 0,
        isRider ? 1 : 0,
        riderSuperHorse ? 1 : 0,
        riderGaitBucket,
        minion.riderChargeReady ? 1 : 0,
      ].join(':');
      const widthBase = isRider ? 188 : 128;
      const heightBase = isRider ? 148 : 126;
      const cacheWidth = Math.ceil(widthBase * Math.max(1, scale * 0.8));
      const cacheHeight = Math.ceil(heightBase * Math.max(1, scale * 0.8));
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          tier: t,
          level: stage * 4,
          riderGaitPhase: (riderGaitBucket / 11) * riderGaitCycle,
        };
        this.drawMinionSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        if (showHud) this.drawStandardMinionHud(minion, minion.x, minion.y, bodyR, scale, { isRider });
        if (!cacheRender) this.drawNecroRevivedOverlay(minion);
        return;
      }
    }

    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const armor = ['#5e748f', '#8b9ab2', '#d9b45f', '#b8e2ff'][t];
    const weaponLen = 8 + stage * 2.2;
    const plateW = 16 + stage * 2;
    const plateH = 7 + Math.floor(stage * 0.8);
    const dir = minion.side === 'left' ? 1 : -1;

    ctx.fillStyle = '#00000022';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyR * scale + 4, bodyR * scale, (4 + t) * scale * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    if (minion.super) {
      ctx.strokeStyle = '#ffe49a88';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, bodyR * scale + 15, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (isRider) {
      const horseBody = bodyR * 1.28;
      const horseY = bodyR * 0.78;
      const chargeGlow = Boolean(minion.riderChargeReady);
      const legSwing = riderSuperHorse ? Math.sin(riderGaitPhase) * (bodyR * 0.3) : 0;
      const neckX = dir * horseBody * 0.74;
      const neckY = horseY - bodyR * 0.32;
      const headX = dir * horseBody * 1.06;
      const headY = horseY - bodyR * 0.38;

      // Horse body
      ctx.fillStyle = '#5f3d27';
      ctx.beginPath();
      ctx.ellipse(0, horseY, horseBody, bodyR * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();

      // Horse neck + head
      ctx.fillStyle = '#65432b';
      ctx.beginPath();
      ctx.ellipse(neckX, neckY, bodyR * 0.42, bodyR * 0.26, -dir * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6f4a2f';
      ctx.beginPath();
      ctx.ellipse(headX, headY, bodyR * 0.46, bodyR * 0.34, -dir * 0.24, 0, Math.PI * 2);
      ctx.fill();

      // Ear
      ctx.fillStyle = '#805739';
      ctx.beginPath();
      ctx.moveTo(headX + dir * 1.5, headY - bodyR * 0.36);
      ctx.lineTo(headX + dir * 6.5, headY - bodyR * 0.64);
      ctx.lineTo(headX + dir * 4.6, headY - bodyR * 0.22);
      ctx.closePath();
      ctx.fill();

      // Mane + tail
      ctx.strokeStyle = '#3a2316';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(neckX - dir * 2, neckY - bodyR * 0.16);
      ctx.quadraticCurveTo(neckX - dir * 8, neckY - bodyR * 0.4, neckX - dir * 12, neckY - bodyR * 0.52);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-dir * (horseBody - 4), horseY - bodyR * 0.18);
      ctx.quadraticCurveTo(-dir * (horseBody + 10), horseY + 2, -dir * (horseBody + 8), horseY + bodyR * 0.48);
      ctx.stroke();

      // Saddle
      ctx.fillStyle = '#2d3d5f';
      ctx.fillRect(-bodyR * 0.44, horseY - bodyR * 0.62, bodyR * 0.88, bodyR * 0.3);
      ctx.strokeStyle = '#aec9f1';
      ctx.lineWidth = 1.1;
      ctx.strokeRect(-bodyR * 0.44, horseY - bodyR * 0.62, bodyR * 0.88, bodyR * 0.3);

      // Reins
      ctx.strokeStyle = '#d9d1bc';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(dir * 3, -2);
      ctx.lineTo(headX - dir * 3, headY - 1);
      ctx.stroke();

      // Eye
      ctx.fillStyle = '#101217';
      ctx.beginPath();
      ctx.arc(headX + dir * 2.5, headY - 1, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Legs
      ctx.strokeStyle = '#2f1f14';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(-horseBody * 0.66, horseY + bodyR * 0.14);
      ctx.lineTo(-horseBody * 0.7 + legSwing * 0.46, horseY + bodyR * 1.03);
      ctx.moveTo(-horseBody * 0.2, horseY + bodyR * 0.17);
      ctx.lineTo(-horseBody * 0.18 - legSwing * 0.38, horseY + bodyR * 1.08);
      ctx.moveTo(horseBody * 0.25, horseY + bodyR * 0.13);
      ctx.lineTo(horseBody * 0.28 - legSwing * 0.42, horseY + bodyR * 1.02);
      ctx.moveTo(horseBody * 0.68, horseY + bodyR * 0.08);
      ctx.lineTo(horseBody * 0.72 + legSwing * 0.34, horseY + bodyR * 0.92);
      ctx.stroke();
      if (chargeGlow) {
        ctx.strokeStyle = '#ffd88d88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, horseY, horseBody + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (stage >= 2) {
      ctx.strokeStyle = '#ffffff20';
      ctx.lineWidth = 2 + stage * 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, bodyR + 3 + stage, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.dark;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (isSummoned) {
      ctx.strokeStyle = '#88ffc680';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, bodyR - 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = armor;
    ctx.fillRect(-plateW / 2, -10 - t - stage * 0.2, plateW, plateH);

    if (t >= 1 || stage >= 1) {
      ctx.fillStyle = '#e8edf7';
      ctx.fillRect(-2, -16 - t - stage * 0.4, 4, 6 + Math.min(4, stage));
    }
    if (t >= 2 || stage >= 2) {
      ctx.strokeStyle = '#c9d4e6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-(10 + stage * 1.5), 1);
      ctx.lineTo(10 + stage * 1.5, 1);
      ctx.stroke();
    }
    if (t >= 3 || stage >= 4 || minion.super) {
      ctx.fillStyle = '#fff7c0';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(4, -15);
      ctx.lineTo(-4, -15);
      ctx.closePath();
      ctx.fill();
    }

    const handX = dir * (bodyR - 1);
    const handY = 2;

    if (!minion.explosive) {
      if (isRider) {
        const lanceLen = weaponLen + 13;
        ctx.strokeStyle = minion.riderChargeReady ? '#ffe4a7' : '#d4dde8';
        ctx.lineWidth = minion.super ? 3.8 : 2.8;
        ctx.beginPath();
        ctx.moveTo(handX, handY - 1);
        ctx.lineTo(handX + dir * lanceLen, handY - 3);
        ctx.stroke();
        ctx.strokeStyle = '#f6fbff';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(handX + dir * (lanceLen - 2), handY - 5);
        ctx.lineTo(handX + dir * (lanceLen + 5), handY - 3);
        ctx.lineTo(handX + dir * (lanceLen - 2), handY - 1);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#d4dde8';
        ctx.lineWidth = minion.super ? 3.6 : 2.5;
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(handX + dir * weaponLen, handY - 2);
        ctx.stroke();

        if (stage >= 3 || minion.super) {
          ctx.strokeStyle = '#f3f7ff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(handX + dir * (weaponLen - 1), handY - 4);
          ctx.lineTo(handX + dir * (weaponLen + 4), handY - 2);
          ctx.lineTo(handX + dir * (weaponLen - 1), handY);
          ctx.stroke();
        }
      }
    }

    if (minion.explosive) {
      const bombX = handX + dir * 8;
      const bombY = handY - 3;
      const bombR = minion.super ? 11 : 8.5;
      ctx.fillStyle = '#161a23';
      ctx.beginPath();
      ctx.arc(bombX, bombY, bombR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#77839a';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.arc(bombX, bombY, bombR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#f8d27a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bombX + dir * 2, bombY - bombR + 1);
      ctx.lineTo(bombX + dir * 6, bombY - bombR - 4);
      ctx.stroke();

      ctx.fillStyle = '#ffd97a';
      ctx.beginPath();
      ctx.arc(bombX + dir * 7.5, bombY - bombR - 5.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ff7f5e';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bombX + dir * 10.2, bombY - bombR - 5.5);
      ctx.lineTo(bombX + dir * 13, bombY - bombR - 7.3);
      ctx.stroke();

      ctx.fillStyle = '#ffd05e';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('B', bombX, bombY + 3);
    }

    ctx.restore();
    if (showHud) this.drawStandardMinionHud(minion, x, y, bodyR, scale, { isRider });
    if (!cacheRender) this.drawNecroRevivedOverlay(minion);
  }

  drawDiggerSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const allowEffects = options.allowEffects !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const r = Math.max(11, minion.r || 12);
    const dir = sideName === 'left' ? 1 : -1;
    const goldFinder = Boolean(minion.diggerGoldFinder);
    const phase = Number.isFinite(minion.digPhase) ? minion.digPhase : 0;
    const shovelSwing = Math.sin(phase * 3.1);
    const handY = -r * 0.14 + Math.cos(phase * 2.6) * 2.3;
    const digBob = Math.sin(phase * 1.9) * 2.1;
    const topY = y + digBob;
    if (!cacheRender) {
      const phaseCycle = Math.PI * 2;
      const wrappedPhase = ((phase % phaseCycle) + phaseCycle) % phaseCycle;
      const phaseBuckets = 10;
      const phaseBucket = Math.max(0, Math.min(phaseBuckets - 1, Math.round((wrappedPhase / phaseCycle) * (phaseBuckets - 1))));
      const radiusBucket = Math.max(11, Math.min(18, Math.round(r)));
      const cacheKey = `digger:${sideName}:${radiusBucket}:${phaseBucket}:${goldFinder ? 1 : 0}`;
      const cacheWidth = Math.ceil(radiusBucket * 5.2 + 42);
      const cacheHeight = Math.ceil(radiusBucket * 4.4 + 42);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          r: radiusBucket,
          digPhase: (phaseBucket / Math.max(1, phaseBuckets - 1)) * phaseCycle,
        };
        this.drawDiggerSprite(proxy, { showHud: false, allowEffects: false, cacheRender: true });
      });
      if (drewCached) {
        if (allowEffects) this.emitDiggerDirt(minion, minion.x, topY, dir, phase, shovelSwing);
        if (showHud) {
          ctx.fillStyle = '#e3d0ab';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DIGGER', minion.x, topY - r - 14);

          const hpPct = Math.max(0, minion.hp / minion.maxHp);
          const hpW = 28;
          const hpX = minion.x - hpW / 2;
          const hpY = topY - r - 9;
          ctx.fillStyle = '#101420cc';
          ctx.fillRect(hpX, hpY, hpW, 4);
          ctx.fillStyle = '#6bff95';
          ctx.fillRect(hpX, hpY, hpW * hpPct, 4);
        }
        return;
      }
    }

    ctx.fillStyle = '#00000020';
    ctx.beginPath();
    ctx.ellipse(x, y + r + 8, r * 1.15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dirt mound the digger sits in.
    ctx.fillStyle = '#5c4a35';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.82, r * 1.42, r * 0.76, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#776049';
    ctx.beginPath();
    ctx.ellipse(x - dir * 4, y + r * 0.72, r * 0.82, r * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper body above dirt.
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.arc(x, topY - r * 0.08, r * 0.74, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.dark;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Helmet.
    ctx.fillStyle = '#8ea1b7';
    ctx.beginPath();
    ctx.arc(x, topY - r * 0.42, r * 0.48, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4f6176';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Face + eyes.
    ctx.fillStyle = '#f0dcc2';
    ctx.beginPath();
    ctx.arc(x, topY - r * 0.18, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a2233';
    ctx.beginPath();
    ctx.arc(x - dir * 2, topY - r * 0.2, 1.05, 0, Math.PI * 2);
    ctx.arc(x + dir * 2, topY - r * 0.2, 1.05, 0, Math.PI * 2);
    ctx.fill();

    if (goldFinder) {
      const lampX = x + dir * (r * 0.28);
      const lampY = topY - r * 0.44;
      const beamLen = r * 2.05;
      const beamHalf = r * 0.62;
      const beam = ctx.createLinearGradient(lampX, lampY, lampX + dir * beamLen, lampY + beamHalf * 0.2);
      beam.addColorStop(0, '#ffeaa899');
      beam.addColorStop(0.55, '#ffeaa833');
      beam.addColorStop(1, '#ffeaa800');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(lampX, lampY - 1.5);
      ctx.lineTo(lampX + dir * beamLen, lampY - beamHalf);
      ctx.lineTo(lampX + dir * beamLen, lampY + beamHalf);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f7bf47';
      ctx.beginPath();
      ctx.arc(lampX, lampY, 1.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff4c4';
      ctx.beginPath();
      ctx.arc(lampX + dir * 0.6, lampY, 1.05, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slow shovel animation.
    ctx.save();
    ctx.translate(x + dir * (r * 0.24), topY + handY);
    ctx.rotate(dir * (0.22 + shovelSwing * 0.46));
    ctx.strokeStyle = '#c9b18f';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * (r * 1.1), -r * 0.86);
    ctx.stroke();
    ctx.fillStyle = '#9fb3cc';
    ctx.beginPath();
    ctx.moveTo(dir * (r * 1.06), -r * 0.98);
    ctx.lineTo(dir * (r * 1.52), -r * 0.7);
    ctx.lineTo(dir * (r * 1.02), -r * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Dirt flick while shoveling.
    const dirtX = x + dir * (r * 1.3);
    const dirtY = topY + r * 0.24 - shovelSwing * 4.2;
    ctx.fillStyle = '#8f7558';
    ctx.beginPath();
    ctx.arc(dirtX, dirtY, 2.3, 0, Math.PI * 2);
    ctx.arc(dirtX + dir * 3.4, dirtY - 1.6, 1.8, 0, Math.PI * 2);
    ctx.arc(dirtX + dir * 6.4, dirtY - 2.6, 1.4, 0, Math.PI * 2);
    ctx.fill();
    if (allowEffects) this.emitDiggerDirt(minion, x, topY, dir, phase, shovelSwing);

    if (showHud) {
      ctx.fillStyle = '#e3d0ab';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(goldFinder ? 'GOLD FINDER' : 'DIGGER', x, topY - r - 14);

      const hpPct = Math.max(0, minion.hp / minion.maxHp);
      const hpW = 28;
      const hpX = x - hpW / 2;
      const hpY = topY - r - 9;
      ctx.fillStyle = '#101420cc';
      ctx.fillRect(hpX, hpY, hpW, 4);
      ctx.fillStyle = '#6bff95';
      ctx.fillRect(hpX, hpY, hpW * hpPct, 4);
    }
  }

  dragonHeartCore(minion) {
    const baseR = Math.max(14, Number(minion?.r) || 14);
    const dir = minion.side === 'left' ? 1 : -1;
    return {
      x: minion.x + dir * (baseR * 0.34),
      y: minion.y - baseR * 0.14,
      r: Math.max(7, baseR * 0.3),
    };
  }

  drawDragonSprite(minion, options = {}) {
    const showHud = options.showHud !== false;
    const cacheRender = options.cacheRender === true;
    const { ctx } = this;
    const sideName = minion.side === 'right' ? 'right' : 'left';
    const upgraded = Boolean(minion.dragonSuperBreathUpgraded);
    const palette = TEAM_COLORS[minion.side];
    const dir = sideName === 'left' ? 1 : -1;
    const x = minion.x;
    const y = minion.y;
    const baseR = Math.max(14, Number(minion.r) || 14);
    const scale = minion.super ? 1.22 : 1;
    const bodyW = baseR * 1.42 * scale;
    const bodyH = baseR * 0.82 * scale;
    const wingSpan = baseR * 2.4 * scale;
    const phase = Number.isFinite(minion.flyPhase) ? minion.flyPhase : 0;
    const wingLift = 0.35 + (Math.sin(phase * 2) + 1) * 0.27;
    const mouthX = x + dir * (baseR * 0.95);
    const mouthY = y - baseR * 0.24;

    const drawDragonLabel = () => {
      if (!showHud) return;
      ctx.fillStyle = '#ffc78d';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DRAGON', x, y - bodyH - 18);
    };

    const drawDragonBreath = () => {
      if ((minion.dragonBreathTtl || 0) <= 0) return;
      const toX = Number.isFinite(minion.dragonBreathToX) ? minion.dragonBreathToX : mouthX + dir * 120;
      const toY = Number.isFinite(minion.dragonBreathToY) ? minion.dragonBreathToY : mouthY + 10;
      const flameLife = Math.max(0, Math.min(1, minion.dragonBreathTtl / 0.24));

      ctx.save();
      ctx.globalAlpha = 0.35 + flameLife * 0.55;
      const flameGradient = ctx.createLinearGradient(mouthX, mouthY, toX, toY);
      flameGradient.addColorStop(0, '#fff1b2');
      flameGradient.addColorStop(0.35, '#ffb648');
      flameGradient.addColorStop(0.75, '#ff7a33');
      flameGradient.addColorStop(1, '#ff4c2c');
      ctx.strokeStyle = flameGradient;
      ctx.lineWidth = 6 + flameLife * 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY);
      ctx.quadraticCurveTo(
        (mouthX + toX) * 0.5 + Math.sin(phase * 5) * 10,
        (mouthY + toY) * 0.5 - 8,
        toX,
        toY
      );
      ctx.stroke();

      ctx.globalAlpha = 0.6 + flameLife * 0.35;
      ctx.fillStyle = '#ffe7a0';
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 3.2 + flameLife * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawDragonHpBar = () => {
      if (!showHud) return;
      const hpPct = Math.max(0, minion.hp / minion.maxHp);
      const hpW = 48 * scale;
      const hpX = x - hpW / 2;
      const hpY = y - (bodyH + 12);
      ctx.fillStyle = '#101420cc';
      ctx.fillRect(hpX, hpY, hpW, 6);
      ctx.fillStyle = '#6bff95';
      ctx.fillRect(hpX, hpY, hpW * hpPct, 6);
    };

    if (!cacheRender) {
      const phaseCycle = Math.PI * 2;
      const wrappedPhase = ((phase % phaseCycle) + phaseCycle) % phaseCycle;
      const phaseBuckets = 12;
      const phaseBucket = Math.max(0, Math.min(phaseBuckets - 1, Math.round((wrappedPhase / phaseCycle) * (phaseBuckets - 1))));
      const radiusBucket = Math.max(14, Math.min(36, Math.round(baseR)));
      const cacheKey = `dragon:${sideName}:${minion.super ? 1 : 0}:${upgraded ? 1 : 0}:${radiusBucket}:${phaseBucket}`;
      const cacheWidth = Math.ceil(radiusBucket * 8 * scale + 96);
      const cacheHeight = Math.ceil(radiusBucket * 5.6 * scale + 110);
      const drewCached = this.drawSpriteFromCache(minion, cacheKey, cacheWidth, cacheHeight, (_cacheCtx, w, h) => {
        const proxy = {
          ...minion,
          x: w / 2,
          y: h / 2,
          r: radiusBucket,
          flyPhase: (phaseBucket / Math.max(1, phaseBuckets - 1)) * phaseCycle,
          dragonBreathTtl: 0,
          dragonBreathToX: null,
          dragonBreathToY: null,
        };
        this.drawDragonSprite(proxy, { showHud: false, cacheRender: true });
      });
      if (drewCached) {
        drawDragonLabel();
        drawDragonBreath();
        drawDragonHpBar();
        return;
      }
    }

    ctx.fillStyle = '#00000026';
    ctx.beginPath();
    ctx.ellipse(x, y + bodyH + 14, bodyW * 0.95, 8 + bodyH * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#263850';
    ctx.beginPath();
    ctx.moveTo(-dir * 8, -4);
    ctx.lineTo(-dir * (wingSpan * 0.55), -bodyH * (0.8 + wingLift));
    ctx.lineTo(-dir * (wingSpan * 0.95), -bodyH * (0.15 + wingLift * 0.3));
    ctx.lineTo(-dir * (wingSpan * 0.2), bodyH * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2f4664';
    ctx.beginPath();
    ctx.moveTo(dir * 4, -2);
    ctx.lineTo(dir * (wingSpan * 0.5), -bodyH * (0.75 + wingLift * 0.9));
    ctx.lineTo(dir * (wingSpan * 0.92), -bodyH * (0.08 + wingLift * 0.25));
    ctx.lineTo(dir * (wingSpan * 0.18), bodyH * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#395579';
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a2a40';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.strokeStyle = '#8cbcff88';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-dir * (bodyW * 0.5), 2);
    ctx.lineTo(dir * (bodyW * 0.45), 2);
    ctx.stroke();
    if (upgraded) {
      ctx.fillStyle = '#9fd1ff';
      for (let i = 0; i < 5; i += 1) {
        const spikeX = -dir * (bodyW * (0.44 - i * 0.2));
        const spikeH = bodyH * (0.34 + i * 0.05);
        ctx.beginPath();
        ctx.moveTo(spikeX, -bodyH * 0.26);
        ctx.lineTo(spikeX + dir * 4.2, -bodyH * 0.26 - spikeH);
        ctx.lineTo(spikeX + dir * 8.2, -bodyH * 0.24);
        ctx.closePath();
        ctx.fill();
      }
    }

    const headX = dir * (bodyW * 0.82);
    const headY = -bodyH * 0.28;
    ctx.fillStyle = '#45648c';
    ctx.beginPath();
    ctx.arc(headX, headY, bodyH * 0.68, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a2a40';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.strokeStyle = '#adc9ea';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(headX + dir * 2, headY - bodyH * 0.95);
    ctx.lineTo(headX + dir * 7, headY - bodyH * 1.4);
    ctx.moveTo(headX - dir * 1, headY - bodyH * 0.88);
    ctx.lineTo(headX + dir * 2, headY - bodyH * 1.36);
    ctx.stroke();
    if (upgraded) {
      ctx.strokeStyle = '#dce9ff';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(headX + dir * 1, headY - bodyH * 0.72);
      ctx.lineTo(headX + dir * 10.5, headY - bodyH * 1.72);
      ctx.moveTo(headX - dir * 4, headY - bodyH * 0.58);
      ctx.lineTo(headX + dir * 1.8, headY - bodyH * 1.46);
      ctx.stroke();
    }

    ctx.fillStyle = '#f8fbff';
    ctx.beginPath();
    ctx.arc(headX + dir * 4.5, headY - 1, 1.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#5e7ea6';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-dir * (bodyW * 0.8), bodyH * 0.05);
    ctx.quadraticCurveTo(-dir * (bodyW * 1.2), bodyH * 0.2, -dir * (bodyW * 1.45), bodyH * 0.65);
    ctx.stroke();

    const heart = this.dragonHeartCore(minion);
    const heartGradient = ctx.createRadialGradient(heart.x - x, heart.y - y, 1, heart.x - x, heart.y - y, heart.r + 4);
    heartGradient.addColorStop(0, '#fff5d4');
    heartGradient.addColorStop(0.45, '#ff7f4b');
    heartGradient.addColorStop(1, '#ff3a2e');
    ctx.fillStyle = heartGradient;
    ctx.beginPath();
    ctx.arc(heart.x - x, heart.y - y, heart.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffdcb0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(heart.x - x, heart.y - y, heart.r + 2.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    drawDragonLabel();
    drawDragonBreath();
    drawDragonHpBar();
  }

  drawArrow(arrow) {
    if ((Number(arrow?.launchDelay) || 0) > 0) return;
    const { ctx } = this;
    const isStuck = Boolean(arrow.stuck);
    const stuckTtlMax = Math.max(0, Number(arrow.stuckTtlMax) || 0);
    const stuckTtl = Math.max(0, Number(arrow.stuckTtl) || 0);
    const stuckFade = isStuck && stuckTtlMax > 0
      ? Math.max(0, Math.min(1, stuckTtl / stuckTtlMax))
      : 1;
    if (isStuck && stuckFade <= 0) return;
    const angle = isStuck && Number.isFinite(arrow.stuckAngle)
      ? arrow.stuckAngle
      : Math.atan2(arrow.vy, arrow.vx);
    const len = 14 + arrow.r * 1.6;
    const isMainArrow = Boolean(arrow.mainArrow);
    const comboTier = Math.max(1, Math.min(4, Number(arrow.comboTier) || 1));
    const comboBoost = isMainArrow ? Math.max(0, (comboTier - 1) / 3) : 0;
    const arrowCount = Math.max(0, Number(this.frameArrowCount) || 0);
    const heavyArrowLoad = arrowCount >= 40;
    const veryHeavyArrowLoad = arrowCount >= 80;

    let body = arrow.side === 'left' ? '#d5ecff' : '#ffe0e0';
    let glow = null;
    if (arrow.powerType === 'ultraShot') {
      body = '#fff06d';
      glow = '#fff8b3';
    } else if (arrow.powerType === 'pierceShot') {
      body = '#9af7ff';
      glow = '#c2fcff';
    } else if (arrow.powerType === 'flameShot') {
      body = '#ff8f52';
      glow = '#ffd098';
    } else if (arrow.powerType === 'multiShot') {
      body = '#d2a4ff';
      glow = '#e6ccff';
    }
    if (isMainArrow && !glow) {
      glow = arrow.side === 'left' ? '#bfe8ff' : '#ffd2c7';
    }

    ctx.save();
    if (isStuck) ctx.globalAlpha *= stuckFade;
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(angle);
    if (isStuck) ctx.translate(-len * 0.18, 0);

    const allowGlow = glow && !veryHeavyArrowLoad && (isMainArrow || !heavyArrowLoad);
    if (allowGlow) {
      ctx.shadowColor = isMainArrow ? this.withAlpha(glow, 0.1) : glow;
      ctx.shadowBlur = isMainArrow ? 0.8 : 5;
    }

    if (!isStuck && comboBoost > 0 && !heavyArrowLoad) {
      const trailColor = comboTier >= 4
        ? (arrow.side === 'left' ? '#eefbffcc' : '#fff1c6cc')
        : (arrow.side === 'left' ? '#b9ecffb8' : '#ffcab7b8');
      const trailLength = len * (0.95 + comboBoost * 2.6);
      const wing = 0.8 + comboBoost * 2.2;

      // Simple long stem: clean, readable, and cheap to draw.
      ctx.lineCap = 'round';
      ctx.strokeStyle = trailColor;
      ctx.lineWidth = Math.max(1.4, arrow.r * (0.45 + comboBoost * 0.7));
      ctx.beginPath();
      ctx.moveTo(-len * 0.46, 0);
      ctx.lineTo(-trailLength, 0);
      ctx.stroke();

      ctx.strokeStyle = comboTier >= 4 ? '#fffbe8b8' : '#ffffff88';
      ctx.lineWidth = Math.max(1, arrow.r * 0.24);
      ctx.beginPath();
      ctx.moveTo(-trailLength * 0.7, -wing);
      ctx.lineTo(-trailLength, 0);
      ctx.lineTo(-trailLength * 0.7, wing);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    ctx.strokeStyle = body;
    ctx.lineWidth = Math.max(1.5, arrow.r * 0.6) * (isMainArrow ? 1.2 : 1);
    ctx.beginPath();
    ctx.moveTo(-len * 0.55, 0);
    ctx.lineTo(len * 0.45, 0);
    ctx.stroke();
    if (arrow.powerType === 'flameShot' && !isStuck) {
      if (heavyArrowLoad) {
        ctx.strokeStyle = '#ff8f52';
      } else {
        const flameGradient = ctx.createLinearGradient(-len * 0.5, 0, len * 0.2, 0);
        flameGradient.addColorStop(0, '#ffe09a');
        flameGradient.addColorStop(0.45, '#ff9c55');
        flameGradient.addColorStop(1, '#ff5f39');
        ctx.strokeStyle = flameGradient;
      }
      ctx.lineWidth = Math.max(1.2, arrow.r * 0.35) * (isMainArrow ? 1.18 : 1);
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.lineTo(len * 0.26, 0);
      ctx.stroke();
    }
    if (isMainArrow && !isStuck) {
      ctx.strokeStyle = '#ffffffdd';
      ctx.lineWidth = Math.max(1, arrow.r * 0.28);
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.lineTo(len * 0.38, 0);
      ctx.stroke();
    }

    ctx.fillStyle = '#6f4b2a';
    ctx.fillRect(-len * 0.5, -1.2, len * 0.1, 2.4);

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(len * 0.55, 0);
    ctx.lineTo(len * 0.28, -3.8);
    ctx.lineTo(len * 0.28, 3.8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = arrow.side === 'left' ? '#9ccfff' : '#ffb1b1';
    ctx.beginPath();
    ctx.moveTo(-len * 0.58, 0);
    ctx.lineTo(-len * 0.32, -2.8);
    ctx.lineTo(-len * 0.35, 0);
    ctx.lineTo(-len * 0.32, 2.8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

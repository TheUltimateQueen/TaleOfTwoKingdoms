const {
  WORLD_W,
  WORLD_H,
  TOWER_X_LEFT,
  TOWER_X_RIGHT,
  TOWER_Y,
  GROUND_Y,
  CARD_Y,
  CARD_W,
  CARD_H,
  UPGRADE_TYPES,
  SHOT_POWER_TYPES,
} = require('./constants');
const ARCHER_ORIGIN_Y = TOWER_Y - 56;
const SHOT_INTERVAL = 1;
const UPGRADE_COST_RULES = {
  arrowLevel: { base: 130, growth: 18, start: 1 },
  unitLevel: { base: 138, growth: 18, start: 1 },
  multiShotLevel: { base: 170, growth: 22, start: 1 },
  volleyLevel: { base: 190, growth: 24, start: 0 },
  spawnLevel: { base: 150, growth: 16, start: 1 },
  unitHpLevel: { base: 138, growth: 16, start: 1 },
  resourceLevel: { base: 122, growth: 14, start: 1 },
  bountyLevel: { base: 118, growth: 14, start: 1 },
  explosiveLevel: { base: 166, growth: 18, start: 1 },
  powerLevel: { base: 164, growth: 20, start: 1 },
  dragonLevel: { base: 236, growth: 26, start: 0 },
  superMinionLevel: { base: 214, growth: 24, start: 0 },
};
const HERO_LINES = [
  'Justice is my cardio!',
  'Hope you brought a villain permit!',
  'My cape has plot armor!',
  'Behold my dramatic entrance!',
  'I slash, therefore I am!',
  'Fear my perfectly timed monologue!',
];
const PRESIDENT_LINES = [
  'Team, we are absolutely crushing this!',
  'Believe in yourselves and swing harder!',
  'Great units do great things together!',
  'No panic, just power and discipline!',
  'We came here to win this battlefield!',
  'Stay strong, stay sharp, stay united!',
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function mirroredX(x) {
  return WORLD_W - x;
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function launchFromPull(sideName, pullX, pullY) {
  const horizontal = Math.max(0, Math.abs(pullX));
  const vertical = Math.max(0, -pullY);
  const rawAngle = Math.atan2(vertical, horizontal || (vertical > 0 ? 0.0001 : 1));
  const angle = Math.max(0, Math.min(Math.PI / 2, rawAngle));
  const strength = Math.max(0.05, Math.min(1, Math.hypot(horizontal, vertical)));
  return { angle, strength };
}

function makeSideState() {
  return {
    towerHp: 6000,
    gold: 0,
    economyLevel: 0,
    nextEcoCost: 120,
    unitLevel: 1,
    unitHpLevel: 1,
    arrowLevel: 1,
    multiShotLevel: 1,
    volleyLevel: 0,
    spawnLevel: 1,
    resourceLevel: 1,
    bountyLevel: 1,
    explosiveLevel: 1,
    powerLevel: 1,
    dragonLevel: 0,
    superMinionLevel: 0,
    upgradeCharge: 0,
    upgradeChargeMax: 140,
    upgradeAutoPickAt: null,
    archerAimY: ARCHER_ORIGIN_Y,
    pullX: -0.8,
    pullY: 0,
    shotCd: 1,
    pendingShotPower: null,
    pendingShotPowerShots: 0,
    arrowsFired: 0,
    arrowHits: 0,
    comboHitStreak: 0,
    minionCd: 0,
    spawnCount: 0,
    towerDamagedOnce: false,
    towerHeroRescueUsed: false,
  };
}

class GameRoom {
  constructor(id, baseUrl) {
    const left = makeSideState();
    const right = makeSideState();
    right.pullX = 0.8;

    this.id = id;
    this.baseUrl = baseUrl;
    this.display = null;
    this.players = { left: null, right: null };
    this.started = false;
    this.gameOver = false;
    this.winner = null;
    this.t = 0;

    this.left = left;
    this.right = right;

    this.arrows = [];
    this.minions = [];
    this.resources = [];
    this.shotPowers = [];
    this.upgradeCards = [];
    this.sfxEvents = [];
    this.damageEvents = [];
    this.lineEvents = [];
    this.sharedShotCd = SHOT_INTERVAL;

    this.nextResourceAt = 5;
    this.nextShotPowerAt = 7;
    this.seq = 1;

    this.seedUpgradeCards();
  }

  serialize() {
    return {
      id: this.id,
      started: this.started,
      gameOver: this.gameOver,
      winner: this.winner,
      t: this.t,
      world: {
        w: WORLD_W,
        h: WORLD_H,
        groundY: GROUND_Y,
        towerY: TOWER_Y,
        towerLeftX: TOWER_X_LEFT,
        towerRightX: TOWER_X_RIGHT,
      },
      left: this.left,
      right: this.right,
      arrows: this.arrows,
      minions: this.minions,
      resources: this.resources,
      shotPowers: this.shotPowers,
      upgradeCards: this.upgradeCards,
      players: {
        left: this.players.left ? { id: this.players.left.id, name: this.players.left.name } : null,
        right: this.players.right ? { id: this.players.right.id, name: this.players.right.name } : null,
      },
      hasDisplay: Boolean(this.display),
    };
  }

  queueHitSfx(type, x, y, side) {
    this.sfxEvents.push({ type, x, y, side });
  }

  queueDamageNumber(amount, x, y) {
    const dmg = Math.round(Number(amount) || 0);
    if (dmg <= 0) return;
    this.damageEvents.push({ amount: dmg, x, y });
  }

  queueLine(text, x, y, side) {
    if (!text || !Number.isFinite(x) || !Number.isFinite(y)) return;
    this.lineEvents.push({ text: String(text), x, y, side });
  }

  consumeSfxEvents() {
    if (!this.sfxEvents.length) return [];
    const out = this.sfxEvents;
    this.sfxEvents = [];
    return out;
  }

  consumeDamageEvents() {
    if (!this.damageEvents.length) return [];
    const out = this.damageEvents;
    this.damageEvents = [];
    return out;
  }

  consumeLineEvents() {
    if (!this.lineEvents.length) return [];
    const out = this.lineEvents;
    this.lineEvents = [];
    return out;
  }

  attachDisplay(socketId, name) {
    this.display = { id: socketId, name: name || 'War Screen' };
  }

  sideBySocket(socketId) {
    if (this.players.left && this.players.left.id === socketId) return 'left';
    if (this.players.right && this.players.right.id === socketId) return 'right';
    return null;
  }

  addPlayer(socketId, name) {
    let side = this.sideBySocket(socketId);
    if (side) return side;

    if (!this.players.left) {
      this.players.left = { id: socketId, name: name || 'Kingdom West' };
      side = 'left';
    } else if (!this.players.right) {
      this.players.right = { id: socketId, name: name || 'Kingdom East' };
      side = 'right';
    }

    if (this.players.left && this.players.right && !this.started) this.started = true;
    return side || null;
  }

  setControlPull(socketId, x, y) {
    if (this.gameOver) return;
    const sideName = this.sideBySocket(socketId);
    if (!sideName) return;

    const pull = this.normalizePull(sideName, x, y);
    this[sideName].pullX = pull.x;
    this[sideName].pullY = pull.y;
    this[sideName].archerAimY = ARCHER_ORIGIN_Y;
  }

  removeSocket(socketId) {
    let changed = false;
    if (this.display && this.display.id === socketId) {
      this.display = null;
      changed = true;
    }
    if (this.players.left && this.players.left.id === socketId) {
      this.players.left = null;
      changed = true;
    }
    if (this.players.right && this.players.right.id === socketId) {
      this.players.right = null;
      changed = true;
    }

    if (changed) this.started = false;

    return {
      changed,
      empty: !this.players.left && !this.players.right && !this.display,
    };
  }

  tick(dt) {
    if (!this.started || this.gameOver) return;
    this.t += dt;

    this.sharedShotCd = Math.max(0, this.sharedShotCd - dt);
    this.left.shotCd = this.sharedShotCd;
    this.right.shotCd = this.sharedShotCd;
    this.left.minionCd = Math.max(0, this.left.minionCd - dt);
    this.right.minionCd = Math.max(0, this.right.minionCd - dt);

    if (this.sharedShotCd === 0) {
      this.addArrowFromPull('left');
      this.addArrowFromPull('right');
      this.sharedShotCd = SHOT_INTERVAL;
      this.left.shotCd = this.sharedShotCd;
      this.right.shotCd = this.sharedShotCd;
    }

    if (this.left.minionCd === 0) {
      this.spawnMinion('left');
      this.left.minionCd = this.statSpawnEvery(this.left);
    }
    if (this.right.minionCd === 0) {
      this.spawnMinion('right');
      this.right.minionCd = this.statSpawnEvery(this.right);
    }

    if (this.t >= this.nextResourceAt) {
      this.spawnMirroredResource();
      this.nextResourceAt = this.t + Math.max(3.2, 6 - this.t / 200);
    }

    if (this.t >= this.nextShotPowerAt) {
      this.spawnMirroredShotPower();
      this.nextShotPowerAt = this.t + Math.max(5.2, 8.8 - this.t / 260);
    }

    this.syncUpgradeCards('left');
    this.syncUpgradeCards('right');

    this.tickShotPowers(dt);
    this.tickArrows(dt);
    this.tickMinions(dt);

    this.processEconomy(this.left);
    this.processEconomy(this.right);

    if (this.left.towerHp <= 0 || this.right.towerHp <= 0) {
      this.gameOver = true;
      this.winner = this.left.towerHp > this.right.towerHp ? 'left' : 'right';
    }
  }

  tickShotPowers(dt) {
    for (let i = this.shotPowers.length - 1; i >= 0; i -= 1) {
      const p = this.shotPowers[i];
      p.y += p.vy * dt;
      if (p.y >= GROUND_Y) this.shotPowers.splice(i, 1);
    }
  }

  tickArrows(dt) {
    for (let i = this.arrows.length - 1; i >= 0; i -= 1) {
      const a = this.arrows[i];
      a.vy += (a.gravity || 560) * dt;
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.ttl -= dt;

      if (a.ttl <= 0 || a.x < -50 || a.x > WORLD_W + 50 || a.y < -50 || a.y > WORLD_H + 50) {
        this.markArrowMiss(a);
        this.arrows.splice(i, 1);
        continue;
      }

      if (a.y >= GROUND_Y + 12 && a.vy > 0) {
        this.markArrowMiss(a);
        this.arrows.splice(i, 1);
        continue;
      }

      let consumed = false;

      for (let p = this.shotPowers.length - 1; p >= 0; p -= 1) {
        const power = this.shotPowers[p];
        if (power.side !== a.side) continue;
        const hitR = power.r + a.r;
        if (dist2(a, power) <= hitR * hitR) {
          this.markArrowHit(a);
          const side = a.side === 'left' ? this.left : this.right;
          side.pendingShotPower = power.type;
          side.pendingShotPowerShots = 3;
          this.queueHitSfx('powerup', power.x, power.y, a.side);
          this.shotPowers.splice(p, 1);
        }
      }

      for (let m = this.minions.length - 1; m >= 0 && !consumed; m -= 1) {
        const minion = this.minions[m];
        if (minion.side === a.side) continue;
        const hitR = minion.r + a.r;
        if (dist2(a, minion) <= hitR * hitR) {
          this.markArrowHit(a);
          let damage = a.dmg;
          if (minion.digger) damage *= 0.76;
          const core = this.dragonHeartCore(minion);
          if (core) {
            const coreHitR = core.r + a.r;
            if (dist2(a, core) <= coreHitR * coreHitR) {
              damage *= 2.85;
              this.queueHitSfx('dragon', core.x, core.y, a.side);
            } else {
              this.queueHitSfx('minion', minion.x, minion.y, a.side);
            }
          } else {
            this.queueHitSfx('minion', minion.x, minion.y, a.side);
          }
          consumed = a.pierce <= 0;
          if (a.pierce > 0) a.pierce -= 1;

          if (minion.hero) {
            minion.heroArrowHits = (minion.heroArrowHits || 0) + 1;
            if (minion.heroArrowHits >= 3) {
              this.queueHitSfx('explosion', minion.x, minion.y - 6, a.side);
              this.killMinion(m, a.side, { goldScalar: 1.2 });
              continue;
            }
          }

          if (minion.explosive) {
            this.killMinion(m, a.side, { triggerExplosion: true, impactDamage: a.dmg });
            continue;
          }

          this.dealDamageToMinion(minion, damage);
          this.applyMaxComboSplash(a, minion, damage);
          if (minion.hp <= 0) this.killMinion(m, a.side);
        }
      }

      for (let r = this.resources.length - 1; r >= 0 && !consumed; r -= 1) {
        const res = this.resources[r];
        const hitR = res.r + a.r;
        if (dist2(a, res) <= hitR * hitR) {
          this.markArrowHit(a);
          if (a.side === 'left') {
            const gain = this.goldFromResource(this.left, res.value);
            this.left.gold += gain;
            this.addUpgradeCharge(this.left, gain);
          } else {
            const gain = this.goldFromResource(this.right, res.value);
            this.right.gold += gain;
            this.addUpgradeCharge(this.right, gain);
          }
          this.queueHitSfx('resource', res.x, res.y, a.side);
          this.resources.splice(r, 1);
          consumed = a.pierce <= 0;
          if (a.pierce > 0) a.pierce -= 1;
        }
      }

      for (let u = this.upgradeCards.length - 1; u >= 0 && !consumed; u -= 1) {
        const card = this.upgradeCards[u];
        if (card.side !== a.side) continue;
        const hit =
          a.x >= card.x - card.w / 2 - a.r &&
          a.x <= card.x + card.w / 2 + a.r &&
          a.y >= card.y - card.h / 2 - a.r &&
          a.y <= card.y + card.h / 2 + a.r;
        if (hit) {
          const mySide = a.side === 'left' ? this.left : this.right;
          if (mySide.upgradeCharge < mySide.upgradeChargeMax) continue;
          this.markArrowHit(a);
          consumed = this.selectUpgradeCard(a.side, card);
        }
      }

      if (consumed) this.arrows.splice(i, 1);
    }
  }

  tickMinions(dt) {
    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const m = this.minions[i];
      if (!m) continue;
      m.atkCd = Math.max(0, m.atkCd - dt);
      if (m.dragonBreathTtl > 0) m.dragonBreathTtl = Math.max(0, m.dragonBreathTtl - dt);
      if (m.gunFlashTtl > 0) m.gunFlashTtl = Math.max(0, m.gunFlashTtl - dt);
      if (m.heroLineCd > 0) m.heroLineCd = Math.max(0, m.heroLineCd - dt);
      if (m.hero) {
        if (!Number.isFinite(m.heroSwing)) m.heroSwing = Math.random() * Math.PI * 2;
        m.heroSwing += dt * 8.2;
      }
      if (m.president) {
        this.tickPresident(m, dt);
        continue;
      }
      if (m.monk) {
        this.tickMonk(m, dt);
        continue;
      }
      if (m.digger) {
        if (!Number.isFinite(m.digPhase)) m.digPhase = Math.random() * Math.PI * 2;
        if (!Number.isFinite(m.digBaseY)) m.digBaseY = m.y;
        m.digPhase += dt * (0.9 + Math.min(0.4, m.speed / 170));
        m.y = clamp(m.digBaseY + Math.sin(m.digPhase) * 1.6, TOWER_Y + 28, TOWER_Y + 172);
      }
      if (m.flying) {
        if (!Number.isFinite(m.flyBaseY)) m.flyBaseY = m.y;
        if (!Number.isFinite(m.flyPhase)) m.flyPhase = Math.random() * Math.PI * 2;
        m.flyPhase += dt * (1.45 + Math.min(1.1, m.speed / 130));
        const amp = 12 + m.r * 0.22;
        m.y = clamp(m.flyBaseY + Math.sin(m.flyPhase) * amp, TOWER_Y - 220, TOWER_Y + 150);
      }
      const enemySideName = m.side === 'left' ? 'right' : 'left';
      const enemyX = m.side === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
      const dir = m.side === 'left' ? 1 : -1;

      if (m.hero) {
        const retreatHp = Math.max(1, m.maxHp * (Number(m.heroRetreatHpPct) || 0.3));
        if (!m.heroRetreating && m.hp <= retreatHp) {
          m.heroRetreating = true;
          this.queueLine('Strategic retreat... heroically!', m.x, m.y - m.r - 24, m.side);
        }

        if (m.heroRetreating) {
          const homeX = m.side === 'left' ? TOWER_X_LEFT + 58 : TOWER_X_RIGHT - 58;
          const retreatDir = m.side === 'left' ? -1 : 1;
          const retreatSpeed = Math.max(42, m.speed * 1.55);
          const reachedHome = m.side === 'left' ? m.x <= homeX : m.x >= homeX;

          if (!reachedHome) {
            m.x += retreatDir * retreatSpeed * dt;
            if (m.side === 'left') m.x = Math.max(m.x, homeX);
            else m.x = Math.min(m.x, homeX);
          } else {
            m.x = homeX;
            const healPerSec = Number(m.heroHealPerSec) || Math.max(90, m.maxHp * 0.34);
            m.hp = Math.min(m.maxHp, m.hp + healPerSec * dt);
            const returnHp = Math.max(1, m.maxHp * (Number(m.heroReturnHpPct) || 0.92));
            if (m.hp >= returnHp) {
              m.heroRetreating = false;
              m.heroArrowHits = 0;
              this.queueLine('Back and ridiculously refreshed!', m.x, m.y - m.r - 24, m.side);
            }
          }
          continue;
        }
      }

      let target = null;
      let best = Infinity;
      for (const other of this.minions) {
        if (other.side === m.side) continue;
        const dx = other.x - m.x;
        const dy = other.y - m.y;
        const d = Math.hypot(dx, dy);
        const reach = m.dragon
          ? 170
          : (m.gunner
              ? (m.gunRange || 220)
              : m.r + other.r + 24 + (m.digger ? 14 : 0) + (m.hero ? 24 : 0));
        if (d < best && d < reach) {
          target = other;
          best = d;
        }
      }

      if (target) {
        if (m.atkCd === 0) {
          if (m.dragon) {
            this.dragonBreath(m, target);
            m.atkCd = 1.05;
          } else if (m.gunner) {
            this.gunnerShot(m, target);
            m.atkCd = 0.66;
          } else if (m.rider) {
            this.riderStrikeMinion(m, target);
            m.atkCd = 0.72;
          } else if (m.hero) {
            this.heroSlash(m, enemySideName, enemyX);
            m.atkCd = 0.46;
          } else if (m.digger) {
            this.dealMinionDamage(m, target, m.dmg, 'melee');
            m.atkCd = 1.18;
          } else {
            this.dealMinionDamage(m, target, m.dmg, 'melee');
            m.atkCd = 0.8;
          }
        }
      } else if (Math.abs(m.x - enemyX) < m.r + 20 + (m.flying ? 34 : 0) + (m.dragon ? 50 : 0) + (m.gunner ? Math.max(0, (m.gunRange || 0) - 40) : 0) + (m.rider ? 14 : 0) + (m.digger ? 8 : 0) + (m.hero ? 24 : 0)) {
        if (m.atkCd === 0) {
          if (m.dragon) {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg * 1.24, enemyX, TOWER_Y - 26);
            const mouthX = m.x + dir * (m.r * 0.95);
            const mouthY = m.y - m.r * 0.24;
            const impactX = enemyX;
            const impactY = TOWER_Y - 26;
            m.dragonBreathTtl = 0.24;
            m.dragonBreathToX = impactX;
            m.dragonBreathToY = impactY;
            this.queueHitSfx('dragonfire', mouthX, mouthY, m.side);
            this.queueHitSfx('dragonfire', impactX, impactY, m.side);
            m.atkCd = 0.92;
          } else if (m.gunner) {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg * 0.72, enemyX, TOWER_Y - 24);
            const muzzleX = m.x + dir * (m.r + 7);
            const muzzleY = m.y - 2;
            m.gunFlashTtl = 0.12;
            this.queueHitSfx('gunhit', muzzleX, muzzleY, m.side);
            this.queueHitSfx('gunhit', enemyX, TOWER_Y - 24, m.side);
            m.atkCd = 0.72;
          } else if (m.rider) {
            this.riderStrikeTower(m, enemySideName, enemyX, TOWER_Y - 18);
            m.atkCd = 0.72;
          } else if (m.hero) {
            this.heroSlash(m, enemySideName, enemyX);
            m.atkCd = 0.46;
          } else if (m.digger) {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg, enemyX, TOWER_Y - 10);
            m.atkCd = 1.22;
          } else {
            this.applyMinionTowerDamage(m, enemySideName, m.dmg, enemyX, TOWER_Y - 18);
            m.atkCd = 0.65;
          }
        }
      } else {
        m.x += dir * m.speed * dt;
        if (m.flying) {
          const desiredY = TOWER_Y - 120 + (m.side === 'left' ? -16 : 16);
          m.flyBaseY += (desiredY - m.flyBaseY) * Math.min(1, dt * 2.2);
        }
      }
    }

    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      if (this.minions[i].hp <= 0) this.killMinion(i, null);
    }
  }

  statArrowDamage(side) {
    return 20 + side.arrowLevel * 8;
  }

  statArrowCount(side) {
    return 1 + Math.floor((side.multiShotLevel - 1) / 2) + Math.max(0, side.volleyLevel || 0);
  }

  comboProgress(side) {
    return Math.max(0, Math.min(1, (side.comboHitStreak || 0) / 10));
  }

  comboTier(side) {
    const streak = Math.max(0, Math.min(10, side?.comboHitStreak || 0));
    if (streak >= 10) return 4;
    if (streak >= 7) return 3;
    if (streak >= 4) return 2;
    return 1;
  }

  comboMultiplier(side) {
    return this.comboTier(side);
  }

  hasMaxCombo(side) {
    return Math.max(0, side?.comboHitStreak || 0) >= 10;
  }

  markArrowHit(arrow) {
    if (!arrow || !arrow.mainArrow || arrow.comboCounted) return;
    arrow.comboCounted = true;
    const side = arrow.side === 'left' ? this.left : this.right;
    side.arrowHits = (side.arrowHits || 0) + 1;
    side.comboHitStreak = Math.min(10, (side.comboHitStreak || 0) + 1);
  }

  markArrowMiss(arrow) {
    if (!arrow || !arrow.mainArrow || arrow.comboCounted) return;
    const side = arrow.side === 'left' ? this.left : this.right;
    side.comboHitStreak = Math.max(0, (side.comboHitStreak || 0) - 1);
  }

  applyMaxComboSplash(arrow, target, baseDamage) {
    if (!arrow?.mainArrow || !target) return;
    const side = arrow.side === 'left' ? this.left : this.right;
    if (!this.hasMaxCombo(side)) return;

    const splash = Math.max(1, baseDamage * 0.34);
    const splashR2 = 76 * 76;
    const victims = [];

    for (const other of this.minions) {
      if (other.side === arrow.side || other.id === target.id) continue;
      const dx = other.x - target.x;
      const dy = other.y - target.y;
      if (dx * dx + dy * dy <= splashR2) victims.push(other.id);
    }

    if (!victims.length) return;
    this.queueHitSfx('explosion', target.x, target.y, arrow.side);

    for (const id of victims) {
      const idx = this.minions.findIndex((m) => m.id === id);
      if (idx < 0) continue;
      const victim = this.minions[idx];
      this.dealDamageToMinion(victim, splash);
      if (victim.hp <= 0) this.killMinion(idx, arrow.side, { goldScalar: 0.75 });
    }
  }

  dealDamageToMinion(minion, amount) {
    if (!minion) return 0;
    const dmg = Math.max(0, Number(amount) || 0);
    if (dmg <= 0) return 0;
    minion.hp -= dmg;
    this.queueDamageNumber(dmg, minion.x, minion.y - Math.max(8, minion.r * 0.25));
    return dmg;
  }

  minionDamageMultiplier(attacker, target, source = 'melee') {
    if (!target) return 1;
    let mul = 1;

    if (source === 'melee') {
      if (target.dragon || target.flying) mul *= 0.72; // Harder for ground units to connect.
      if (target.gunner) mul *= 1.2; // Melee pressure counters ranged units.
      if (target.summoned) mul *= 1.1;
      if (target.super) mul *= 0.9;
      if (attacker && attacker.super && target.gunner) mul *= 1.14;
    } else if (source === 'dragonfire') {
      if (target.gunner) mul *= 1.28;
      if (target.necrominion || target.summoned) mul *= 1.22;
      if (target.explosive) mul *= 1.12;
      if (target.dragon) mul *= 0.9;
      if (target.super) mul *= 0.9;
    } else if (source === 'gunshot') {
      if (target.super) mul *= 0.82;
      if (target.explosive) mul *= 1.25;
      if (target.summoned) mul *= 1.15;
      if (target.gunner) mul *= 0.96;
    } else if (source === 'explosion') {
      if (target.dragon || target.flying) mul *= 0.65;
      if (target.summoned) mul *= 1.2;
      if (target.super) mul *= 0.86;
      if (target.explosive) mul *= 0.92;
    }

    return clamp(mul, 0.45, 2.4);
  }

  dealMinionDamage(attacker, target, amount, source = 'melee') {
    if (!target) return 0;
    const base = Math.max(0, Number(amount) || 0);
    if (base <= 0) return 0;
    const buffed = base * this.presidentAuraMultiplier(attacker);
    const scaled = buffed * this.minionDamageMultiplier(attacker, target, source);
    return this.dealDamageToMinion(target, scaled);
  }

  presidentAuraMultiplier(attacker) {
    if (!attacker || !attacker.side) return 1;
    let mul = 1;
    for (const m of this.minions) {
      if (!m.president || m.side !== attacker.side || !m.presidentSetup) continue;
      const dx = attacker.x - m.x;
      const dy = attacker.y - m.y;
      const auraR = Math.max(110, Number(m.presidentAuraRadius) || 190);
      if (dx * dx + dy * dy > auraR * auraR) continue;
      mul = Math.max(mul, Number(m.presidentAuraMult) || 1.24);
    }
    return mul;
  }

  minionOutgoingDamage(attacker, amount) {
    const base = Math.max(0, Number(amount) || 0);
    if (base <= 0) return 0;
    return base * this.presidentAuraMultiplier(attacker);
  }

  applyMinionTowerDamage(attacker, sideName, amount, x = null, y = null) {
    return this.dealDamageToTower(sideName, this.minionOutgoingDamage(attacker, amount), x, y);
  }

  dealDamageToTower(sideName, amount, x = null, y = null) {
    const side = this[sideName];
    if (!side) return 0;
    const dmg = Math.max(0, Number(amount) || 0);
    if (dmg <= 0) return 0;
    const firstDamage = !side.towerDamagedOnce;
    side.towerHp -= dmg;
    if (firstDamage) side.towerDamagedOnce = true;
    const tx = Number.isFinite(x) ? x : (sideName === 'left' ? TOWER_X_LEFT : TOWER_X_RIGHT);
    const ty = Number.isFinite(y) ? y : (TOWER_Y - 100);
    this.queueDamageNumber(dmg, tx, ty);
    if (firstDamage) this.triggerTowerHeroRescue(sideName, tx, ty);
    return dmg;
  }

  healMinion(minion, amount) {
    if (!minion) return 0;
    const raw = Math.max(0, Number(amount) || 0);
    if (raw <= 0) return 0;
    const missing = Math.max(0, (Number(minion.maxHp) || 0) - (Number(minion.hp) || 0));
    if (missing <= 0) return 0;
    const healed = Math.min(missing, raw);
    minion.hp += healed;
    return healed;
  }

  allyFrontX(sideName, excludeId = null) {
    let front = null;

    for (const m of this.minions) {
      if (!m || m.side !== sideName || m.id === excludeId) continue;
      if (m.monk || m.president) continue;
      if (front == null) front = m.x;
      else front = sideName === 'left' ? Math.max(front, m.x) : Math.min(front, m.x);
    }

    if (front != null) return front;

    for (const m of this.minions) {
      if (!m || m.side !== sideName || m.id === excludeId) continue;
      if (front == null) front = m.x;
      else front = sideName === 'left' ? Math.max(front, m.x) : Math.min(front, m.x);
    }

    return front;
  }

  statMinionDamage(side) {
    return 12 + side.unitLevel * 6 + side.economyLevel * 3;
  }

  statMinionHp(side) {
    return 75 + side.unitHpLevel * 30 + side.economyLevel * 18;
  }

  statSpawnEvery(side) {
    return Math.max(0.65, 2.2 - side.spawnLevel * 0.09);
  }

  statDragonEvery(side) {
    if (side.dragonLevel <= 0) return Infinity;
    return Math.max(12, 28 - side.dragonLevel * 3);
  }

  statGunnerEvery(side) {
    const tech = Math.floor((side.unitLevel + side.arrowLevel + side.economyLevel) / 6);
    return Math.max(9, 13 - tech);
  }

  statRiderEvery(side) {
    const cavalryTech = Math.floor((side.unitLevel + side.spawnLevel + side.economyLevel) / 5);
    return Math.max(7, 12 - cavalryTech);
  }

  statDiggerEvery(side) {
    const burrowTech = Math.floor((side.unitHpLevel + side.spawnLevel + side.economyLevel) / 6);
    return Math.max(9, 16 - burrowTech);
  }

  statMonkEvery(side) {
    const supportTech = Math.floor((side.unitHpLevel + side.powerLevel + side.resourceLevel) / 7);
    return Math.max(11, 19 - supportTech);
  }

  statHeroEvery(side) {
    const mythicTech = Math.floor((side.unitLevel + side.powerLevel + side.economyLevel) / 7);
    return Math.max(15, 24 - mythicTech);
  }

  statPresidentEvery(side) {
    const civicTech = Math.floor((side.economyLevel + side.resourceLevel + side.powerLevel) / 6);
    return Math.max(17, 27 - civicTech);
  }

  statNecroEvery() {
    return 8;
  }

  statSuperEvery(side) {
    if (side.superMinionLevel <= 0) return Infinity;
    return Math.max(3, 11 - side.superMinionLevel * 2);
  }

  dragonHeartCore(minion) {
    if (!minion.dragon) return null;
    const dir = minion.side === 'left' ? 1 : -1;
    return {
      x: minion.x + dir * (minion.r * 0.34),
      y: minion.y - minion.r * 0.14,
      r: Math.max(7, minion.r * 0.3),
    };
  }

  dragonBreath(dragon, target) {
    const base = dragon.dmg * 1.22;
    const splash = base * 0.44;
    const splashR2 = 72 * 72;
    const dir = dragon.side === 'left' ? 1 : -1;
    const mouthX = dragon.x + dir * (dragon.r * 0.95);
    const mouthY = dragon.y - dragon.r * 0.24;
    this.dealMinionDamage(dragon, target, base, 'dragonfire');
    dragon.dragonBreathTtl = 0.24;
    dragon.dragonBreathToX = target.x;
    dragon.dragonBreathToY = target.y;
    this.queueHitSfx('dragonfire', mouthX, mouthY, dragon.side);
    this.queueHitSfx('dragonfire', target.x, target.y, dragon.side);

    for (const other of this.minions) {
      if (other.id === target.id || other.side === dragon.side) continue;
      const dx = other.x - target.x;
      const dy = other.y - target.y;
      if (dx * dx + dy * dy <= splashR2) this.dealMinionDamage(dragon, other, splash, 'dragonfire');
    }
  }

  gunnerShot(gunner, target) {
    const dir = gunner.side === 'left' ? 1 : -1;
    const muzzleX = gunner.x + dir * (gunner.r + 7);
    const muzzleY = gunner.y - 2;
    const dragonMul = Number.isFinite(gunner.gunDragonMul) ? gunner.gunDragonMul : 2;
    const damage = gunner.dmg * (target.dragon ? dragonMul : 1.06);
    const splash = damage * 0.2;
    const splashR2 = 42 * 42;

    this.dealMinionDamage(gunner, target, damage, 'gunshot');
    gunner.gunFlashTtl = 0.14;
    this.queueHitSfx('gunhit', muzzleX, muzzleY, gunner.side);
    this.queueHitSfx('gunhit', target.x, target.y, gunner.side);

    for (const other of this.minions) {
      if (other.id === target.id || other.side === gunner.side) continue;
      const dx = other.x - target.x;
      const dy = other.y - target.y;
      if (dx * dx + dy * dy <= splashR2) this.dealMinionDamage(gunner, other, splash, 'gunshot');
    }
  }

  riderHitDamage(rider, hitX = null, hitY = null) {
    const base = Math.max(0, Number(rider?.dmg) || 0);
    if (!rider || !rider.rider || !rider.riderChargeReady) return base;

    rider.riderChargeReady = false;
    const originX = Number.isFinite(rider.riderChargeStartX) ? rider.riderChargeStartX : rider.x;
    const distance = Math.abs(rider.x - originX);
    const threshold = Math.max(90, Number(rider.riderChargeDistance) || 170);
    if (distance < threshold) return base;

    const mul = Math.max(1.4, Number(rider.riderChargeMul) || 2.2);
    if (Number.isFinite(hitX) && Number.isFinite(hitY)) this.queueHitSfx('powerup', hitX, hitY, rider.side);
    return base * mul;
  }

  riderStrikeMinion(rider, target) {
    const damage = this.riderHitDamage(rider, target?.x, target?.y);
    this.dealMinionDamage(rider, target, damage, 'melee');
  }

  riderStrikeTower(rider, enemySideName, x, y) {
    const damage = this.riderHitDamage(rider, x, y);
    this.applyMinionTowerDamage(rider, enemySideName, damage, x, y);
  }

  heroSlash(hero, enemySideName, enemyX) {
    if (!hero || !hero.hero) return;
    const slashR2 = Math.max(70, Number(hero.heroSlashRadius) || 88) ** 2;
    const damage = this.minionOutgoingDamage(hero, hero.dmg * 0.96);
    let hitAny = false;

    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const other = this.minions[i];
      if (other.side === hero.side || other.id === hero.id) continue;
      const dx = other.x - hero.x;
      const dy = other.y - hero.y;
      if (dx * dx + dy * dy > slashR2) continue;
      hitAny = true;
      this.dealMinionDamage(hero, other, damage, 'melee');
      if (other.hp <= 0) this.killMinion(i, hero.side, { goldScalar: 0.9 });
    }

    if (Math.abs(hero.x - enemyX) <= Math.sqrt(slashR2) + 10) {
      hitAny = true;
      this.dealDamageToTower(enemySideName, damage * 0.72, enemyX, TOWER_Y - 16);
    }

    this.queueHitSfx('powerup', hero.x, hero.y - 8, hero.side);
    if ((hitAny || hero.atkCd === 0) && (hero.heroLineCd || 0) === 0) {
      this.queueLine(randomFrom(HERO_LINES), hero.x, hero.y - hero.r - 26, hero.side);
      hero.heroLineCd = 0.38;
    }
  }

  tickMonk(monk, dt) {
    if (!monk || !monk.monk) return;
    if (!Number.isFinite(monk.monkAge)) monk.monkAge = 0;
    monk.monkAge += dt;

    const minScale = Math.max(0.16, Number(monk.monkHealMinScale) || 0.24);
    const decayPerSec = Math.max(0, Number(monk.monkHealDecayPerSec) || 0.014);
    if (!Number.isFinite(monk.monkHealScale) || monk.monkHealScale <= 0) monk.monkHealScale = 1;
    monk.monkHealScale = Math.max(minScale, monk.monkHealScale - decayPerSec * dt);

    const dir = monk.side === 'left' ? 1 : -1;
    const homeX = monk.side === 'left' ? TOWER_X_LEFT + 78 : TOWER_X_RIGHT - 78;
    const enemyX = monk.side === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
    const allyFrontX = this.allyFrontX(monk.side, monk.id);
    const frontRef = Number.isFinite(allyFrontX) ? allyFrontX : homeX + dir * 120;
    const keepBehind = Math.max(90, Number(monk.monkKeepBehind) || 140);

    let desiredX = frontRef - dir * keepBehind;
    desiredX = clamp(desiredX, TOWER_X_LEFT + 56, TOWER_X_RIGHT - 56);
    const advanceLimit = enemyX - dir * 110;
    if (monk.side === 'left') desiredX = Math.min(desiredX, advanceLimit);
    else desiredX = Math.max(desiredX, advanceLimit);
    if (monk.side === 'left') desiredX = Math.max(desiredX, homeX);
    else desiredX = Math.min(desiredX, homeX);

    const xDelta = desiredX - monk.x;
    const moveStep = Math.max(26, monk.speed * 0.9) * dt;
    if (Math.abs(xDelta) > 1.6) monk.x += clamp(xDelta, -moveStep, moveStep);

    const healRange = Math.max(90, Number(monk.monkHealRange) || 170);
    const healR2 = healRange * healRange;
    let target = null;
    let bestScore = -Infinity;
    let desiredY = monk.y;

    for (const ally of this.minions) {
      if (!ally || ally.side !== monk.side || ally.id === monk.id) continue;
      const missing = Math.max(0, (Number(ally.maxHp) || 0) - (Number(ally.hp) || 0));
      if (missing <= 0.5) continue;
      const dx = ally.x - monk.x;
      const dy = ally.y - monk.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > healR2) continue;

      const dist = Math.sqrt(d2);
      const missingPct = missing / Math.max(1, ally.maxHp || 1);
      const frontBias = ally.side === 'left' ? (ally.x / WORLD_W) : ((WORLD_W - ally.x) / WORLD_W);
      const score = missingPct * 1.5 + (1 - dist / healRange) * 0.7 + frontBias * 0.24;
      if (score > bestScore) {
        bestScore = score;
        target = ally;
        desiredY = ally.y;
      }
    }

    desiredY = clamp(desiredY, TOWER_Y - 130, TOWER_Y + 140);
    monk.y += (desiredY - monk.y) * Math.min(1, dt * 2.8);

    if (!target || monk.atkCd > 0) return;

    const baseHeal = Math.max(12, Number(monk.monkHealBase) || Math.max(32, monk.maxHp * 0.48));
    let heal = baseHeal * Math.max(minScale, monk.monkHealScale || 1);
    if (monk.monkFirstHeal) {
      heal *= Math.max(2, Number(monk.monkFirstHealMul) || 2.8);
      monk.monkFirstHeal = false;
    }

    const healed = this.healMinion(target, heal);
    if (healed <= 0) return;

    const stepDecay = Math.max(0.55, Math.min(0.99, Number(monk.monkHealStepDecay) || 0.86));
    monk.monkHealScale = Math.max(minScale, monk.monkHealScale * stepDecay);
    monk.atkCd = Math.max(0.3, Number(monk.monkHealCd) || 0.92);
    this.queueHitSfx('powerup', monk.x, monk.y - 6, monk.side);
    this.queueHitSfx('powerup', target.x, target.y - Math.max(8, target.r * 0.2), monk.side);
  }

  tickPresident(president, dt) {
    if (!president || !president.president) return;
    if (president.presidentSpeechCd > 0) {
      president.presidentSpeechCd = Math.max(0, president.presidentSpeechCd - dt);
    }

    const tx = Number.isFinite(president.presidentPodiumX) ? president.presidentPodiumX : president.x;
    const ty = Number.isFinite(president.presidentPodiumY) ? president.presidentPodiumY : president.y;
    const dx = tx - president.x;
    const dy = ty - president.y;
    const d = Math.hypot(dx, dy);
    const moveSpeed = Math.max(18, president.speed * 0.72);

    if (!president.presidentSetup) {
      if (d > 2.2) {
        const step = Math.min(d, moveSpeed * dt);
        const nx = d > 0 ? dx / d : 0;
        const ny = d > 0 ? dy / d : 0;
        president.x += nx * step;
        president.y += ny * step;
      } else {
        president.x = tx;
        president.y = ty;
        president.presidentSetup = true;
        president.presidentSpeechCd = 0.2;
        this.queueHitSfx('upgrade', president.x, president.y - 4, president.side);
        this.queueLine('Citizens, we stand together!', president.x, president.y - president.r - 28, president.side);
      }
      return;
    }

    if (president.presidentSpeechCd === 0) {
      this.queueLine(
        randomFrom(PRESIDENT_LINES),
        president.x,
        president.y - president.r - 28,
        president.side
      );
      president.presidentSpeechCd = 2.2 + Math.random() * 2.2;
      this.queueHitSfx('powerup', president.x, president.y - 8, president.side);
    }
  }

  triggerTowerHeroRescue(sideName, x, y) {
    const side = this[sideName];
    if (!side || side.towerHeroRescueUsed) return;
    side.towerHeroRescueUsed = true;

    const hero = this.spawnMinion(sideName, { forceType: 'hero', countSpawn: false });
    const hx = hero?.x ?? (sideName === 'left' ? TOWER_X_LEFT + 58 : TOWER_X_RIGHT - 58);
    const hy = hero?.y ?? (TOWER_Y + 6);
    this.queueHitSfx('powerup', x, y, sideName);
    this.queueHitSfx('upgrade', hx, hy, sideName);
    this.queueLine('I will save the day.', hx, hy - (hero?.r || 16) - 24, sideName);
  }

  awardMinionKillGold(killerSide, scalar = 1) {
    if (killerSide === 'left') this.left.gold += this.goldFromMinionKill(this.left, scalar);
    else if (killerSide === 'right') this.right.gold += this.goldFromMinionKill(this.right, scalar);
  }

  killMinion(index, killerSide = null, options = {}) {
    const minion = this.minions[index];
    if (!minion) return;

    const {
      goldScalar = 1,
      triggerExplosion = false,
      impactDamage = null,
    } = options;

    this.awardMinionKillGold(killerSide, goldScalar);
    this.minions.splice(index, 1);

    if (triggerExplosion && minion.explosive) {
      this.explodeMinion(
        minion.id,
        minion.x,
        minion.y,
        killerSide,
        minion.explosiveLevel || 1,
        impactDamage,
        minion.side
      );
    }

    if (minion.necrominion) this.raiseNecroServants(minion);
  }

  raiseNecroServants(minion) {
    const servantCount = minion.super ? 6 : 4;
    const ring = minion.r + 22;
    const baseHp = Math.max(30, minion.maxHp * 0.38);
    const baseDmg = Math.max(7, minion.dmg * 0.42);
    const speed = Math.max(56, minion.speed * 1.14);
    const radius = Math.max(10, minion.r * 0.52);
    const tier = Math.max(0, Math.min(2, (minion.tier || 0) - 1));
    const level = Math.max(1, Math.floor((minion.level || 1) * 0.55));

    this.queueHitSfx('powerup', minion.x, minion.y, minion.side);

    for (let i = 0; i < servantCount; i += 1) {
      const angle = (Math.PI * 2 * i) / servantCount + Math.random() * 0.45;
      const radial = ring + (Math.random() * 14 - 7);
      const x = clamp(minion.x + Math.cos(angle) * radial, TOWER_X_LEFT + 40, TOWER_X_RIGHT - 40);
      const y = clamp(minion.y + Math.sin(angle) * Math.min(28, ring * 0.55), TOWER_Y - 170, TOWER_Y + 170);

      this.minions.push({
        id: this.seq++,
        side: minion.side,
        x,
        y,
        hp: baseHp,
        maxHp: baseHp,
        dmg: baseDmg,
        speed,
        atkCd: Math.random() * 0.18,
        r: radius,
        tier,
        level,
        super: false,
        explosive: false,
        explosiveLevel: 1,
        necrominion: false,
        summoned: true,
        dragon: false,
        flying: false,
        gunner: false,
        rider: false,
        riderChargeReady: false,
        riderChargeStartX: null,
        riderChargeDistance: 0,
        riderChargeMul: 1,
        digger: false,
        digPhase: null,
        digBaseY: null,
        monk: false,
        monkAge: 0,
        monkHealBase: 0,
        monkHealRange: 0,
        monkHealCd: 0,
        monkHealScale: 0,
        monkHealMinScale: 0,
        monkHealDecayPerSec: 0,
        monkHealStepDecay: 1,
        monkFirstHeal: false,
        monkFirstHealMul: 1,
        monkKeepBehind: 0,
        hero: false,
        heroArrowHits: 0,
        heroSlashRadius: 0,
        heroLineCd: 0,
        heroSwing: 0,
        heroRetreating: false,
        heroRetreatHpPct: 0,
        heroReturnHpPct: 0,
        heroHealPerSec: 0,
        president: false,
        presidentSetup: false,
        presidentPodiumX: null,
        presidentPodiumY: null,
        presidentAuraRadius: 0,
        presidentAuraMult: 1,
        presidentSpeechCd: 0,
        gunRange: 0,
        gunDragonMul: 1,
        gunFlashTtl: 0,
      });
    }
  }

  normalizePull(sideName, x, y) {
    let nx = Number.isFinite(x) ? x : 0;
    let ny = Number.isFinite(y) ? y : 0;
    if (sideName === 'left') nx = Math.min(nx, 0);
    else nx = Math.max(nx, 0);
    ny = Math.min(ny, 0);

    const mag = Math.hypot(nx, ny) || 1;
    if (mag > 1) {
      nx /= mag;
      ny /= mag;
    }
    return { x: nx, y: ny };
  }

  addArrowFromPull(sideName) {
    const side = this[sideName];
    const sx = sideName === 'left' ? TOWER_X_LEFT + 35 : TOWER_X_RIGHT - 35;
    const pull = this.normalizePull(sideName, side.pullX, side.pullY);
    side.pullX = pull.x;
    side.pullY = pull.y;
    side.archerAimY = ARCHER_ORIGIN_Y;

    const sy = ARCHER_ORIGIN_Y;
    const launch = launchFromPull(sideName, pull.x, pull.y);
    const forwardSign = sideName === 'left' ? 1 : -1;
    const comboMul = this.comboMultiplier(side);

    let count = this.statArrowCount(side);
    let spread = 0.08 + Math.min(0.07, Math.max(0, count - 1) * 0.006);
    let speed = 230 + launch.strength * 380;
    speed *= 1.5;
    const chargeMul = 0.55 + launch.strength * 0.95;
    let dmgMul = 1;
    let radius = 4;
    let pierce = 0;
    let gravity = 980 - launch.strength * 220;
    let powerType = null;
    const powerScale = 1 + (side.powerLevel - 1) * 0.18;
    const activePower = side.pendingShotPowerShots > 0 ? side.pendingShotPower : null;

    if (activePower === 'multiShot') {
      count += 2 + Math.floor(powerScale * 2);
      spread = 0.14;
      powerType = 'multiShot';
    } else if (activePower === 'ultraShot') {
      dmgMul = 2.2 + powerScale * 0.8;
      speed += 70 + powerScale * 36;
      radius = 6;
      gravity = Math.max(620, gravity - 150);
      powerType = 'ultraShot';
    } else if (activePower === 'pierceShot') {
      pierce = 2 + Math.floor(powerScale * 2);
      speed += 50 + powerScale * 25;
      powerType = 'pierceShot';
    } else if (activePower === 'heavyShot') {
      dmgMul = 1.6 + powerScale * 0.5;
      speed *= 0.82;
      radius = 7 + Math.floor(powerScale * 0.8);
      gravity += 180;
      powerType = 'heavyShot';
    }
    count = Math.min(29, count);
    if (count > 1 && count % 2 === 0) count += 1;
    const mainIndex = Math.floor(count / 2);
    if (activePower) {
      side.pendingShotPowerShots = Math.max(0, side.pendingShotPowerShots - 1);
      if (side.pendingShotPowerShots === 0) side.pendingShotPower = null;
    } else {
      side.pendingShotPower = null;
      side.pendingShotPowerShots = 0;
    }

    for (let i = 0; i < count; i += 1) {
      const isMainArrow = i === mainIndex;
      const localAngle = Math.max(
        0,
        Math.min(Math.PI / 2, launch.angle + (i - (count - 1) / 2) * spread)
      );
      const vx = Math.cos(localAngle) * speed * forwardSign;
      const vy = -Math.sin(localAngle) * speed;
      if (isMainArrow) side.arrowsFired = (side.arrowsFired || 0) + 1;
      this.arrows.push({
        id: this.seq++,
        side: sideName,
        x: sx,
        y: sy,
        vx,
        vy,
        dmg: this.statArrowDamage(side) * dmgMul * chargeMul * comboMul,
        ttl: 3.5,
        r: isMainArrow ? radius + 1.4 : radius,
        pierce,
        powerType,
        gravity,
        mainArrow: isMainArrow,
      });
    }
  }

  spawnMinion(sideName, options = {}) {
    const {
      forceType = null,
      countSpawn = true,
    } = options;
    const side = this[sideName];
    if (countSpawn) side.spawnCount += 1;
    const x = sideName === 'left' ? TOWER_X_LEFT + 56 : TOWER_X_RIGHT - 56;
    let hp = this.statMinionHp(side);
    let dmg = this.statMinionDamage(side);
    let speed = 54 + side.unitLevel * 1.5 + side.economyLevel * 0.6;
    const power = side.unitLevel + side.unitHpLevel + side.economyLevel;
    let tier = Math.min(3, Math.floor(power / 8));
    const dragonEvery = this.statDragonEvery(side);
    const isDragon = forceType === 'dragon' || (!forceType && Number.isFinite(dragonEvery) && side.spawnCount % dragonEvery === 0);
    const necroEvery = this.statNecroEvery(side);
    const isNecrominion = forceType === 'necrominion' || (!forceType && !isDragon && side.spawnCount % necroEvery === 0);
    const gunnerEvery = this.statGunnerEvery(side);
    const isGunner = forceType === 'gunner' || (!forceType && !isDragon && !isNecrominion && side.spawnCount % gunnerEvery === 0);
    const riderEvery = this.statRiderEvery(side);
    const isRider = forceType === 'rider'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && side.spawnCount % riderEvery === 0);
    const diggerEvery = this.statDiggerEvery(side);
    const isDigger = forceType === 'digger'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && !isRider && side.spawnCount % diggerEvery === 0);
    const monkEvery = this.statMonkEvery(side);
    const isMonk = forceType === 'monk'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && !isRider && !isDigger && side.spawnCount % monkEvery === 0);
    const heroEvery = this.statHeroEvery(side);
    const isHero = forceType === 'hero'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && !isRider && !isDigger && !isMonk && side.spawnCount % heroEvery === 0);
    const presidentEvery = this.statPresidentEvery(side);
    const isPresident = forceType === 'president'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && !isRider && !isDigger && !isMonk && !isHero && side.spawnCount % presidentEvery === 0);
    const explosiveEvery = Math.max(3, 6 - (side.explosiveLevel - 1));
    const superEvery = this.statSuperEvery(side);
    const isSuper = forceType === 'super'
      || (!forceType && !isDragon && !isGunner && !isRider && !isDigger && !isMonk && !isHero && !isPresident && Number.isFinite(superEvery) && side.spawnCount % superEvery === 0);
    const explosive = forceType === 'explosive'
      || (!forceType && !isDragon && !isNecrominion && !isGunner && !isRider && !isDigger && !isMonk && !isHero && !isPresident && !isSuper && side.spawnCount % explosiveEvery === 0);
    let radius = 16;
    let visualPower = power;
    let spawnY = TOWER_Y + (Math.random() * 110 - 55);

    if (isSuper) {
      const levelBoost = Math.max(1, side.superMinionLevel);
      hp *= 2.2 + levelBoost * 0.28;
      dmg *= 2 + levelBoost * 0.24;
      speed *= 0.84 + Math.min(0.12, levelBoost * 0.02);
      radius = 32;
      tier = Math.min(3, tier + 1);
      visualPower = power + 8 + levelBoost * 3;
    }

    if (isNecrominion) {
      hp *= 1.26;
      dmg *= 0.92;
      speed *= 0.9;
      radius = Math.max(radius, 20);
      tier = Math.min(3, tier + 1);
      visualPower += 6;
    }

    if (isGunner) {
      const gunScale = 1 + (side.arrowLevel - 1) * 0.08;
      hp *= 0.82;
      dmg *= 1.22 * gunScale;
      speed *= 0.94;
      radius = Math.max(14, radius - 1);
      visualPower += 6 + Math.floor(gunScale * 2);
    }

    if (isRider) {
      hp *= 0.9;
      dmg *= 1.08 + Math.min(0.18, side.unitLevel * 0.012);
      speed *= 1.52;
      radius = Math.max(18, radius + 1);
      visualPower += 7;
    }

    if (isDigger) {
      hp *= 0.62;
      dmg *= 0.58;
      speed *= 0.42;
      radius = Math.max(12, radius - 2);
      visualPower += 2;
      spawnY = TOWER_Y + 70 + (Math.random() * 28 - 14);
    }

    if (isMonk) {
      hp *= 0.98;
      dmg *= 0.12;
      speed *= 0.94;
      radius = Math.max(18, radius + 1);
      tier = Math.min(3, tier + 1);
      visualPower += 8;
      spawnY = TOWER_Y + (Math.random() * 40 - 20);
    }

    if (isHero) {
      hp *= 1.12;
      dmg *= 0.9;
      speed *= 1.02;
      radius = Math.max(20, radius + 2);
      tier = Math.min(3, tier + 1);
      visualPower += 11;
    }

    if (isPresident) {
      hp *= 1.46;
      dmg *= 0.45;
      speed *= 0.86;
      radius = Math.max(18, radius + 1);
      tier = Math.min(3, tier + 1);
      visualPower += 9;
      spawnY = TOWER_Y + 34 + (Math.random() * 18 - 9);
    }

    if (isDragon) {
      const dragonBoost = Math.max(1, side.dragonLevel);
      hp *= 1.9 + dragonBoost * 0.32;
      dmg *= 1.45 + dragonBoost * 0.16;
      speed *= 1.18 + Math.min(0.22, dragonBoost * 0.04);
      radius = Math.max(radius, 26);
      tier = Math.min(3, tier + 1);
      visualPower += 11 + dragonBoost * 2;
      spawnY = TOWER_Y - 124 + (Math.random() * 70 - 35);
    }

    const created = {
      id: this.seq++,
      side: sideName,
      x,
      y: spawnY,
      hp,
      maxHp: hp,
      dmg,
      speed,
      atkCd: 0,
      r: radius,
      tier,
      level: visualPower,
      super: isSuper,
      explosive,
      explosiveLevel: side.explosiveLevel,
      necrominion: isNecrominion,
      summoned: false,
      dragon: isDragon,
      flying: isDragon,
      flyBaseY: isDragon ? spawnY : null,
      flyPhase: isDragon ? Math.random() * Math.PI * 2 : null,
      dragonBreathTtl: 0,
      dragonBreathToX: null,
      dragonBreathToY: null,
      gunner: isGunner,
      rider: isRider,
      riderChargeReady: isRider,
      riderChargeStartX: isRider ? x : null,
      riderChargeDistance: isRider ? (165 + side.spawnLevel * 5) : 0,
      riderChargeMul: isRider ? (2.05 + Math.min(0.35, side.unitLevel * 0.02)) : 1,
      digger: isDigger,
      digPhase: isDigger ? Math.random() * Math.PI * 2 : null,
      digBaseY: isDigger ? spawnY : null,
      monk: isMonk,
      monkAge: 0,
      monkHealBase: isMonk ? Math.max(34, hp * 0.46) : 0,
      monkHealRange: isMonk ? (172 + side.powerLevel * 5 + side.unitHpLevel * 4) : 0,
      monkHealCd: isMonk ? 0.94 : 0,
      monkHealScale: isMonk ? 1 : 0,
      monkHealMinScale: isMonk ? 0.24 : 0,
      monkHealDecayPerSec: isMonk ? 0.014 : 0,
      monkHealStepDecay: isMonk ? 0.86 : 1,
      monkFirstHeal: isMonk,
      monkFirstHealMul: isMonk ? 2.8 : 1,
      monkKeepBehind: isMonk ? (138 + side.spawnLevel * 3) : 0,
      hero: isHero,
      heroArrowHits: 0,
      heroSlashRadius: isHero ? (84 + side.unitLevel * 2.4) : 0,
      heroLineCd: 0,
      heroSwing: isHero ? Math.random() * Math.PI * 2 : 0,
      heroRetreating: false,
      heroRetreatHpPct: isHero ? 0.3 : 0,
      heroReturnHpPct: isHero ? 0.92 : 0,
      heroHealPerSec: isHero ? Math.max(96, hp * 0.34) : 0,
      president: isPresident,
      presidentSetup: false,
      presidentPodiumX: isPresident ? (sideName === 'left' ? (700 + Math.random() * 55) : (WORLD_W - (700 + Math.random() * 55))) : null,
      presidentPodiumY: isPresident ? (TOWER_Y + 18 + (Math.random() * 24 - 12)) : null,
      presidentAuraRadius: isPresident ? (178 + side.powerLevel * 8) : 0,
      presidentAuraMult: isPresident ? (1.22 + Math.min(0.14, side.powerLevel * 0.02)) : 1,
      presidentSpeechCd: isPresident ? (1 + Math.random() * 1.4) : 0,
      gunRange: isGunner ? 198 + side.arrowLevel * 10 + side.unitLevel * 6 : 0,
      gunDragonMul: isGunner ? (1.95 + side.arrowLevel * 0.05) : 1,
      gunFlashTtl: 0,
    };
    this.minions.push(created);
    return created;
  }

  explodeMinion(sourceId, x, y, killerSide, explosiveLevel = 1, impactDamage = null, sourceSide = null) {
    const radius = 112 + (explosiveLevel - 1) * 16;
    const source = sourceSide && this[sourceSide] ? this[sourceSide] : null;
    const arrowDamage = source ? this.statArrowDamage(source) : 24;
    const damage = Math.max(1, Number.isFinite(impactDamage) ? impactDamage : arrowDamage);
    this.queueHitSfx('explosion', x, y, killerSide);

    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const m = this.minions[i];
      if (m.id === sourceId) continue;
      const dx = m.x - x;
      const dy = m.y - y;
      if (dx * dx + dy * dy > radius * radius) continue;
      this.dealMinionDamage(null, m, damage, 'explosion');
      if (m.hp <= 0) this.killMinion(i, killerSide, { goldScalar: 0.75 });
    }
  }

  goldFromMinionKill(side, scalar = 1) {
    const base = 8 * scalar;
    const bonus = 1 + (side.bountyLevel - 1) * 0.2;
    return Math.floor(base * bonus);
  }

  goldFromResource(side, value) {
    const bonus = 1 + (side.resourceLevel - 1) * 0.22;
    return Math.floor(value * bonus);
  }

  addUpgradeCharge(side, amount) {
    side.upgradeCharge = Math.min(99999, side.upgradeCharge + amount);
  }

  upgradeCost(side, type) {
    const rule = UPGRADE_COST_RULES[type] || { base: 140, growth: 18, start: 1 };
    const level = Math.max(0, Number(side?.[type]) || 0);
    const tier = Math.max(0, level - rule.start);
    return Math.max(60, Math.round(rule.base + tier * rule.growth));
  }

  spawnMirroredResource() {
    const x = 680 + Math.random() * 110;
    const y = 270 + Math.random() * 340;
    const value = 26 + Math.floor(this.t / 35) * 2;
    this.resources.push({ id: this.seq++, x, y, r: 14, value });
    this.resources.push({ id: this.seq++, x: mirroredX(x), y, r: 14, value });
  }

  spawnMirroredShotPower() {
    const x = 680 + Math.random() * 110;
    const type = randomFrom(SHOT_POWER_TYPES);
    const vy = 120 + Math.random() * 40;

    this.shotPowers.push({ id: this.seq++, side: 'left', x, y: 40, r: 16, type, vy });
    this.shotPowers.push({ id: this.seq++, side: 'right', x: mirroredX(x), y: 40, r: 16, type, vy });
  }

  sideCardSlotX(sideName, slot) {
    const leftRegular = [220, 320];
    if (sideName === 'left') return leftRegular[slot];
    return WORLD_W - leftRegular[slot];
  }

  hasCardInSlot(sideName, slot) {
    return this.upgradeCards.some((c) => c.side === sideName && c.slot === slot);
  }

  addUpgradeCard(sideName, slot, type, source = 'random') {
    const side = this[sideName];
    const cost = this.upgradeCost(side, type);
    this.upgradeCards.push({
      id: this.seq++,
      side: sideName,
      slot,
      source,
      type,
      value: 1,
      cost,
      x: this.sideCardSlotX(sideName, slot),
      y: CARD_Y,
      w: CARD_W,
      h: CARD_H,
    });
  }

  refillRegularCards(sideName) {
    for (let slot = 0; slot < 2; slot += 1) {
      if (!this.hasCardInSlot(sideName, slot)) {
        this.addUpgradeCard(sideName, slot, randomFrom(UPGRADE_TYPES), 'random');
      }
    }
  }

  clearCardsForSide(sideName) {
    this.upgradeCards = this.upgradeCards.filter((c) => c.side !== sideName);
  }

  selectUpgradeCard(sideName, card) {
    const side = this[sideName];
    if (!side || !card || card.side !== sideName) return false;
    if (side.upgradeCharge < side.upgradeChargeMax) return false;

    const spentDebt = Math.max(1, side.upgradeChargeMax);
    const overflow = Math.max(0, side.upgradeCharge - spentDebt);
    const nextDebt = Math.max(1, Math.round(Number(card.cost) || this.upgradeCost(side, card.type)));

    this.awardUpgrade(side, card.type, card.value);
    this.triggerUpgradeActivation(sideName, card.type, card.value, card.x, card.y);
    this.clearCardsForSide(sideName);

    side.upgradeCharge = overflow;
    side.upgradeChargeMax = nextDebt;
    side.upgradeAutoPickAt = null;
    return true;
  }

  syncUpgradeCards(sideName) {
    const side = this[sideName];
    if (side.upgradeCharge < side.upgradeChargeMax) {
      this.clearCardsForSide(sideName);
      side.upgradeAutoPickAt = null;
      return;
    }

    const hadCards = this.upgradeCards.some((c) => c.side === sideName);
    this.refillRegularCards(sideName);
    if (!hadCards || !Number.isFinite(side.upgradeAutoPickAt)) side.upgradeAutoPickAt = this.t + 20;

    if (Number.isFinite(side.upgradeAutoPickAt) && this.t >= side.upgradeAutoPickAt) {
      const cards = this.upgradeCards.filter((c) => c.side === sideName);
      if (cards.length) this.selectUpgradeCard(sideName, randomFrom(cards));
    }
  }

  seedUpgradeCards() {
    this.clearCardsForSide('left');
    this.clearCardsForSide('right');
  }

  awardUpgrade(side, type, value) {
    side[type] += value;
  }

  triggerUpgradeActivation(sideName, type, value, x, y) {
    const side = this[sideName];
    const towerX = sideName === 'left' ? TOWER_X_LEFT + 38 : TOWER_X_RIGHT - 38;
    const towerY = TOWER_Y - 96;
    const dir = sideName === 'left' ? 1 : -1;

    this.queueHitSfx('upgrade', x, y, sideName);
    this.queueHitSfx('powerup', towerX, towerY, sideName);

    if (type === 'dragonLevel') {
      this.spawnMinion(sideName, { forceType: 'dragon', countSpawn: false });
      this.queueHitSfx('dragonfire', towerX + dir * 40, towerY - 12, sideName);
      return;
    }

    if (type === 'superMinionLevel') {
      this.spawnMinion(sideName, { forceType: 'super', countSpawn: false });
      return;
    }

    // For non-summon upgrades, accelerate the relevant cooldown so impact is immediate.
    if (type === 'arrowLevel' || type === 'multiShotLevel' || type === 'volleyLevel' || type === 'powerLevel') {
      this.sharedShotCd = Math.min(this.sharedShotCd, 0.16);
      this.left.shotCd = this.sharedShotCd;
      this.right.shotCd = this.sharedShotCd;
    } else {
      side.minionCd = Math.min(side.minionCd, 0.16);
    }
  }

  processEconomy(side) {
    while (side.gold >= side.nextEcoCost) {
      side.gold -= side.nextEcoCost;
      side.economyLevel += 1;
      side.nextEcoCost = Math.floor(side.nextEcoCost * 1.24 + 18);
    }
  }
}

module.exports = { GameRoom };

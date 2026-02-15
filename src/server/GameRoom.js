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
    spawnLevel: 1,
    resourceLevel: 1,
    bountyLevel: 1,
    explosiveLevel: 1,
    powerLevel: 1,
    dragonLevel: 0,
    superMinionLevel: 0,
    upgradeCharge: 0,
    upgradeChargeMax: 140,
    archerAimY: ARCHER_ORIGIN_Y,
    pullX: -0.8,
    pullY: 0,
    shotCd: 1,
    pendingShotPower: null,
    pendingShotPowerShots: 0,
    minionCd: 0,
    spawnCount: 0,
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

  consumeSfxEvents() {
    if (!this.sfxEvents.length) return [];
    const out = this.sfxEvents;
    this.sfxEvents = [];
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

    this.left.shotCd = Math.max(0, this.left.shotCd - dt);
    this.right.shotCd = Math.max(0, this.right.shotCd - dt);
    this.left.minionCd = Math.max(0, this.left.minionCd - dt);
    this.right.minionCd = Math.max(0, this.right.minionCd - dt);

    if (this.left.shotCd === 0) {
      this.addArrowFromPull('left');
      this.left.shotCd = 1;
    }
    if (this.right.shotCd === 0) {
      this.addArrowFromPull('right');
      this.right.shotCd = 1;
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
        this.arrows.splice(i, 1);
        continue;
      }

      if (a.y >= GROUND_Y + 12 && a.vy > 0) {
        this.arrows.splice(i, 1);
        continue;
      }

      let consumed = false;

      for (let p = this.shotPowers.length - 1; p >= 0; p -= 1) {
        const power = this.shotPowers[p];
        if (power.side !== a.side) continue;
        const hitR = power.r + a.r;
        if (dist2(a, power) <= hitR * hitR) {
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
          let damage = a.dmg;
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

          if (minion.explosive) {
            this.killMinion(m, a.side, { triggerExplosion: true, impactDamage: a.dmg });
            continue;
          }

          minion.hp -= damage;
          if (minion.hp <= 0) this.killMinion(m, a.side);
        }
      }

      for (let r = this.resources.length - 1; r >= 0 && !consumed; r -= 1) {
        const res = this.resources[r];
        const hitR = res.r + a.r;
        if (dist2(a, res) <= hitR * hitR) {
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
          this.awardUpgrade(mySide, card.type, card.value);
          this.queueHitSfx('upgrade', card.x, card.y, a.side);
          this.clearCardsForSide(card.side);
          mySide.upgradeCharge = 0;
          consumed = true;
        }
      }

      if (consumed) this.arrows.splice(i, 1);
    }
  }

  tickMinions(dt) {
    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const m = this.minions[i];
      m.atkCd = Math.max(0, m.atkCd - dt);
      if (m.dragonBreathTtl > 0) m.dragonBreathTtl = Math.max(0, m.dragonBreathTtl - dt);
      if (m.gunFlashTtl > 0) m.gunFlashTtl = Math.max(0, m.gunFlashTtl - dt);
      if (m.flying) {
        if (!Number.isFinite(m.flyBaseY)) m.flyBaseY = m.y;
        if (!Number.isFinite(m.flyPhase)) m.flyPhase = Math.random() * Math.PI * 2;
        m.flyPhase += dt * (1.45 + Math.min(1.1, m.speed / 130));
        const amp = 12 + m.r * 0.22;
        m.y = clamp(m.flyBaseY + Math.sin(m.flyPhase) * amp, TOWER_Y - 220, TOWER_Y + 150);
      }
      const enemySide = m.side === 'left' ? this.right : this.left;
      const enemyX = m.side === 'left' ? TOWER_X_RIGHT - 46 : TOWER_X_LEFT + 46;
      const dir = m.side === 'left' ? 1 : -1;

      let target = null;
      let best = Infinity;
      for (const other of this.minions) {
        if (other.side === m.side) continue;
        const dx = other.x - m.x;
        const dy = other.y - m.y;
        const d = Math.hypot(dx, dy);
        const reach = m.dragon ? 170 : (m.gunner ? (m.gunRange || 220) : m.r + other.r + 24);
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
          } else {
            target.hp -= m.dmg;
            m.atkCd = 0.8;
          }
        }
      } else if (Math.abs(m.x - enemyX) < m.r + 20 + (m.flying ? 34 : 0) + (m.dragon ? 50 : 0) + (m.gunner ? Math.max(0, (m.gunRange || 0) - 40) : 0)) {
        if (m.atkCd === 0) {
          if (m.dragon) {
            enemySide.towerHp -= m.dmg * 1.24;
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
            enemySide.towerHp -= m.dmg * 0.72;
            const muzzleX = m.x + dir * (m.r + 7);
            const muzzleY = m.y - 2;
            m.gunFlashTtl = 0.12;
            this.queueHitSfx('gunhit', muzzleX, muzzleY, m.side);
            this.queueHitSfx('gunhit', enemyX, TOWER_Y - 24, m.side);
            m.atkCd = 0.72;
          } else {
            enemySide.towerHp -= m.dmg;
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
    return 1 + Math.floor((side.multiShotLevel - 1) / 2);
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
    target.hp -= base;
    dragon.dragonBreathTtl = 0.24;
    dragon.dragonBreathToX = target.x;
    dragon.dragonBreathToY = target.y;
    this.queueHitSfx('dragonfire', mouthX, mouthY, dragon.side);
    this.queueHitSfx('dragonfire', target.x, target.y, dragon.side);

    for (const other of this.minions) {
      if (other.id === target.id || other.side === dragon.side) continue;
      const dx = other.x - target.x;
      const dy = other.y - target.y;
      if (dx * dx + dy * dy <= splashR2) other.hp -= splash;
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

    target.hp -= damage;
    gunner.gunFlashTtl = 0.14;
    this.queueHitSfx('gunhit', muzzleX, muzzleY, gunner.side);
    this.queueHitSfx('gunhit', target.x, target.y, gunner.side);

    for (const other of this.minions) {
      if (other.id === target.id || other.side === gunner.side) continue;
      const dx = other.x - target.x;
      const dy = other.y - target.y;
      if (dx * dx + dy * dy <= splashR2) other.hp -= splash;
    }
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
      this.explodeMinion(minion.id, minion.x, minion.y, killerSide, minion.explosiveLevel || 1, impactDamage);
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

    let count = this.statArrowCount(side);
    let spread = 0.09;
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
    if (activePower) {
      side.pendingShotPowerShots = Math.max(0, side.pendingShotPowerShots - 1);
      if (side.pendingShotPowerShots === 0) side.pendingShotPower = null;
    } else {
      side.pendingShotPower = null;
      side.pendingShotPowerShots = 0;
    }

    for (let i = 0; i < count; i += 1) {
      const localAngle = Math.max(
        0,
        Math.min(Math.PI / 2, launch.angle + (i - (count - 1) / 2) * spread)
      );
      const vx = Math.cos(localAngle) * speed * forwardSign;
      const vy = -Math.sin(localAngle) * speed;
      this.arrows.push({
        id: this.seq++,
        side: sideName,
        x: sx,
        y: sy,
        vx,
        vy,
        dmg: this.statArrowDamage(side) * dmgMul * chargeMul,
        ttl: 3.5,
        r: radius,
        pierce,
        powerType,
        gravity,
      });
    }
  }

  spawnMinion(sideName) {
    const side = this[sideName];
    side.spawnCount += 1;
    const x = sideName === 'left' ? TOWER_X_LEFT + 56 : TOWER_X_RIGHT - 56;
    let hp = this.statMinionHp(side);
    let dmg = this.statMinionDamage(side);
    let speed = 54 + side.unitLevel * 1.5 + side.economyLevel * 0.6;
    const power = side.unitLevel + side.unitHpLevel + side.economyLevel;
    let tier = Math.min(3, Math.floor(power / 8));
    const dragonEvery = this.statDragonEvery(side);
    const isDragon = Number.isFinite(dragonEvery) && side.spawnCount % dragonEvery === 0;
    const necroEvery = this.statNecroEvery(side);
    const isNecrominion = !isDragon && side.spawnCount % necroEvery === 0;
    const gunnerEvery = this.statGunnerEvery(side);
    const isGunner = !isDragon && !isNecrominion && side.spawnCount % gunnerEvery === 0;
    const explosiveEvery = Math.max(3, 6 - (side.explosiveLevel - 1));
    const explosive = !isDragon && !isNecrominion && !isGunner && side.spawnCount % explosiveEvery === 0;
    const superEvery = this.statSuperEvery(side);
    const isSuper = !isDragon && !isGunner && Number.isFinite(superEvery) && side.spawnCount % superEvery === 0;
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

    this.minions.push({
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
      gunRange: isGunner ? 198 + side.arrowLevel * 10 + side.unitLevel * 6 : 0,
      gunDragonMul: isGunner ? (1.95 + side.arrowLevel * 0.05) : 1,
      gunFlashTtl: 0,
    });
  }

  explodeMinion(sourceId, x, y, killerSide, explosiveLevel = 1, impactDamage = null) {
    const radius = 78 + (explosiveLevel - 1) * 9;
    const damage = Math.max(1, Number.isFinite(impactDamage) ? impactDamage : (72 + (explosiveLevel - 1) * 26));
    this.queueHitSfx('explosion', x, y, killerSide);

    for (let i = this.minions.length - 1; i >= 0; i -= 1) {
      const m = this.minions[i];
      if (m.id === sourceId) continue;
      const dx = m.x - x;
      const dy = m.y - y;
      if (dx * dx + dy * dy > radius * radius) continue;
      m.hp -= damage;
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
    side.upgradeCharge = Math.min(side.upgradeChargeMax, side.upgradeCharge + amount);
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
    this.upgradeCards.push({
      id: this.seq++,
      side: sideName,
      slot,
      source,
      type,
      value: 1,
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

  syncUpgradeCards(sideName) {
    const side = this[sideName];
    if (side.upgradeCharge >= side.upgradeChargeMax) this.refillRegularCards(sideName);
    else this.clearCardsForSide(sideName);
  }

  seedUpgradeCards() {
    this.clearCardsForSide('left');
    this.clearCardsForSide('right');
  }

  awardUpgrade(side, type, value) {
    side[type] += value;
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

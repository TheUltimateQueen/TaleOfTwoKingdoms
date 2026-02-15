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

const UPGRADE_BADGE_SPECS = [
  { type: 'arrowLevel', code: 'AR', base: 1, color: '#76c1ff' },
  { type: 'unitLevel', code: 'AT', base: 1, color: '#7ab8ff' },
  { type: 'multiShotLevel', code: 'MS', base: 1, color: '#7ff0c9' },
  { type: 'volleyLevel', code: 'VO', base: 0, color: '#5ccad6' },
  { type: 'spawnLevel', code: 'SP', base: 1, color: '#f5c56b' },
  { type: 'unitHpLevel', code: 'HP', base: 1, color: '#7de2ff' },
  { type: 'resourceLevel', code: 'RS', base: 1, color: '#ffe17a' },
  { type: 'bountyLevel', code: 'KG', base: 1, color: '#f7df8e' },
  { type: 'explosiveLevel', code: 'BM', base: 1, color: '#ffab7c' },
  { type: 'powerLevel', code: 'PW', base: 1, color: '#f4a3ff' },
  { type: 'dragonLevel', code: 'DR', base: 0, color: '#ff8f78' },
  { type: 'superMinionLevel', code: 'SU', base: 0, color: '#fff3ad' },
];

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.damageTexts = [];
    this.heroLines = [];
    this.lastFrameAt = performance.now();
  }

  draw(snapshot, world) {
    if (!snapshot || !world) return;

    const { ctx, canvas } = this;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameAt) / 1000);
    this.lastFrameAt = now;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#17263d');
    g.addColorStop(1, '#102033');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#20354f';
    ctx.fillRect(w / 2 - 3, 0, 6, h);
    ctx.fillStyle = '#2d3b53';
    ctx.fillRect(0, world.groundY, w, 4);

    this.drawBarracks('left', snapshot.left, world);
    this.drawBarracks('right', snapshot.right, world);

    this.drawCastle('left', world.towerLeftX, world.towerY, snapshot.left.towerHp, snapshot.left.pullX, snapshot.left.pullY, snapshot.left);
    this.drawCastle('right', world.towerRightX, world.towerY, snapshot.right.towerHp, snapshot.right.pullX, snapshot.right.pullY, snapshot.right);
    this.drawShotRing(world.towerLeftX, world.towerY - 185, snapshot.left.shotCd, TEAM_COLORS.left.ring);
    this.drawShotRing(world.towerRightX, world.towerY - 185, snapshot.right.shotCd, TEAM_COLORS.right.ring);
    this.drawComboBanner('left', world.towerLeftX, world.towerY - 230, snapshot.left);
    this.drawComboBanner('right', world.towerRightX, world.towerY - 230, snapshot.right);
    this.drawUpgradeChargeBar('left', 42, 220, 16, 270, snapshot.left.upgradeCharge, snapshot.left.upgradeChargeMax);
    this.drawUpgradeChargeBar('right', w - 58, 220, 16, 270, snapshot.right.upgradeCharge, snapshot.right.upgradeChargeMax);

    this.drawUpgradePlaceholders(snapshot);

    for (const res of snapshot.resources) this.drawResourceNode(res);
    for (const power of snapshot.shotPowers) this.drawShotPower(power);
    for (const card of snapshot.upgradeCards) this.drawUpgradeCard(card);
    for (const minion of snapshot.minions) this.drawMinionSprite(minion);
    this.updateParticles(dt);
    this.drawParticles();
    for (const arrow of snapshot.arrows) this.drawArrow(arrow);
    this.updateDamageTexts(dt);
    this.drawDamageTexts();
    this.updateHeroLines(dt);
    this.drawHeroLines();

    const leftAim = worldAimAngle('left', snapshot.left.pullX, snapshot.left.pullY);
    const rightAim = worldAimAngle('right', snapshot.right.pullX, snapshot.right.pullY);
    const leftStrength = launchStrengthFromPull('left', snapshot.left.pullX, snapshot.left.pullY);
    const rightStrength = launchStrengthFromPull('right', snapshot.right.pullX, snapshot.right.pullY);
    this.drawAimGuide('left', world.towerLeftX + 35, snapshot.left.archerAimY, leftAim, leftStrength);
    this.drawAimGuide('right', world.towerRightX - 35, snapshot.right.archerAimY, rightAim, rightStrength);

    if (snapshot.gameOver) {
      ctx.fillStyle = '#00000099';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = '56px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${snapshot.winner === 'left' ? 'West' : 'East'} Kingdom Wins`, w / 2, h / 2 - 12);
      ctx.font = '24px sans-serif';
      ctx.fillText('Refresh to start a new war', w / 2, h / 2 + 40);
    }
  }

  emitHitParticles(type, x, y, side) {
    const palette = TEAM_COLORS[side] || TEAM_COLORS.left;
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

    for (let i = 0; i < count; i += 1) {
      const ang = Math.random() * Math.PI * 2;
      const mag = speed * (0.45 + Math.random() * 0.65);
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * mag,
        vy: Math.sin(ang) * mag - 40,
        life,
        maxLife: life,
        size: sizeBase + Math.random() * sizeRand,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity,
      });
    }
  }

  emitDamageNumber(amount, x, y) {
    const dmg = Math.max(1, Math.round(Number(amount) || 0));
    this.damageTexts.push({
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
    this.heroLines.push({
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
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.vy += p.gravity * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  updateDamageTexts(dt) {
    for (let i = this.damageTexts.length - 1; i >= 0; i -= 1) {
      const t = this.damageTexts[i];
      t.vy -= 50 * dt;
      t.vx *= 0.96;
      t.vy *= 0.98;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) this.damageTexts.splice(i, 1);
    }
  }

  updateHeroLines(dt) {
    for (let i = this.heroLines.length - 1; i >= 0; i -= 1) {
      const b = this.heroLines[i];
      b.y += b.vy * dt;
      b.vy -= 18 * dt;
      b.life -= dt;
      if (b.life <= 0) this.heroLines.splice(i, 1);
    }
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

  spawnEveryForSide(sideState) {
    const spawnLevel = Math.max(1, Number(sideState?.spawnLevel) || 1);
    return Math.max(0.65, 2.2 - spawnLevel * 0.09);
  }

  trainingEveryForType(sideState, type) {
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
    const explosive = Math.max(1, Number(s.explosiveLevel) || 1);

    if (type === 'militia') return 1;
    if (type === 'necro') return 8;
    if (type === 'gunner') return Math.max(9, 13 - Math.floor((unit + arrow + eco) / 6));
    if (type === 'rider') return Math.max(7, 12 - Math.floor((unit + spawn + eco) / 5));
    if (type === 'digger') return Math.max(9, 16 - Math.floor((hp + spawn + eco) / 6));
    if (type === 'monk') return Math.max(11, 19 - Math.floor((hp + power + resource) / 7));
    if (type === 'hero') return Math.max(15, 24 - Math.floor((unit + power + eco) / 7));
    if (type === 'president') return Math.max(17, 27 - Math.floor((eco + resource + power) / 6));
    if (type === 'bomber') return Math.max(3, 6 - (explosive - 1));
    if (type === 'dragon') return dragon <= 0 ? Infinity : Math.max(12, 28 - dragon * 3);
    if (type === 'super') return sup <= 0 ? Infinity : Math.max(3, 11 - sup * 2);
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

  barracksRows(sideState) {
    const levelOf = {
      militia: Math.max(1, Number(sideState?.unitLevel) || 1),
      necro: Math.max(1, Number(sideState?.unitLevel) || 1),
      gunner: Math.max(1, Number(sideState?.arrowLevel) || 1),
      rider: Math.max(1, Number(sideState?.unitLevel) || 1),
      digger: Math.max(1, Number(sideState?.unitHpLevel) || 1),
      monk: Math.max(1, Number(sideState?.powerLevel) || 1),
      hero: Math.max(1, Number(sideState?.powerLevel) || 1),
      president: Math.max(1, Number(sideState?.resourceLevel) || 1),
      bomber: Math.max(1, Number(sideState?.explosiveLevel) || 1),
      dragon: Math.max(0, Number(sideState?.dragonLevel) || 0),
      super: Math.max(0, Number(sideState?.superMinionLevel) || 0),
    };
    const rows = [
      { type: 'militia', label: 'Militia', color: '#d8dde6', unlockHint: '' },
      { type: 'necro', label: 'Necro', color: '#8ff7cc', unlockHint: '' },
      { type: 'gunner', label: 'Gunner', color: '#ffcc92', unlockHint: '' },
      { type: 'rider', label: 'Rider', color: '#d7c2a1', unlockHint: '' },
      { type: 'digger', label: 'Digger', color: '#b79a74', unlockHint: '' },
      { type: 'monk', label: 'Monk', color: '#cbffb6', unlockHint: '' },
      { type: 'hero', label: 'Hero', color: '#ffe2a0', unlockHint: '' },
      { type: 'president', label: 'President', color: '#f1c7a2', unlockHint: '' },
      { type: 'bomber', label: 'Bomber', color: '#ffb07d', unlockHint: '' },
      { type: 'dragon', label: 'Dragon', color: '#ff9c7b', unlockHint: 'need DR1' },
      { type: 'super', label: 'Super', color: '#fff2aa', unlockHint: 'need SU1' },
    ];

    const spawnEvery = this.spawnEveryForSide(sideState);
    const minionCd = Math.max(0, Number(sideState?.minionCd) || 0);

    return rows.map((row) => {
      const every = this.trainingEveryForType(sideState, row.type);
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
        unlocked,
        every,
        inSpawns,
        progress,
        etaSec,
      };
    });
  }

  drawBarracks(side, sideState, world) {
    const { ctx } = this;
    const sidePalette = TEAM_COLORS[side] || TEAM_COLORS.left;
    const panelW = 250;
    const panelH = 236;
    const panelX = side === 'left' ? 350 : world.w - 350;
    const panelY = world.groundY - panelH - 8;
    const bx = side === 'left' ? 220 : world.w - 220;
    const by = world.groundY - 8;

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
    const rows = this.barracksRows(sideState);
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

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      const ry = py + 39 + i * rowH;

      ctx.fillStyle = i % 2 === 0 ? '#162033a8' : '#121a2ba8';
      ctx.fillRect(px + 6, ry - 10, panelW - 12, rowH - 1);

      ctx.fillStyle = row.color;
      ctx.beginPath();
      ctx.arc(px + 16, ry - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#eaf0fc';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, px + 24, ry + 1);
      ctx.fillStyle = '#c7d4e9';
      ctx.fillText(`L${row.level}`, px + 86, ry + 1);

      const barX = px + 108;
      const barY = ry - 8;
      const barW = 66;
      const barH = 6;
      ctx.fillStyle = '#1f2940';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = row.unlocked ? this.withAlpha(sidePalette.primary, 0.95) : '#6f7688';
      ctx.fillRect(barX, barY, barW * row.progress, barH);

      ctx.textAlign = 'right';
      if (!row.unlocked) {
        ctx.fillStyle = '#9da8ba';
        ctx.fillText(row.unlockHint || 'locked', px + panelW - 10, ry + 1);
      } else if (row.every <= 1) {
        ctx.fillStyle = '#8affcf';
        ctx.fillText('active', px + panelW - 10, ry + 1);
      } else {
        const eta = Math.max(0, Math.ceil(row.etaSec));
        const tag = row.inSpawns === 1 ? `NEXT ${eta}s` : `${row.inSpawns}sp ${eta}s`;
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

  drawCastle(side, x, y, hp, pullX, pullY, sideState = null) {
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

    const archerX = side === 'left' ? x + 35 : x - 35;
    const platformX = archerX + dir * 6;
    ctx.fillStyle = '#4f607f';
    ctx.fillRect(platformX - 18, y - 44, 36, 10);

    const archerY = y - 56;
    const aim = worldAimAngle(side, pullX, pullY);

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

    const hpW = 92;
    const pct = Math.max(0, hp / 6000);
    ctx.fillStyle = '#141414';
    ctx.fillRect(x - hpW / 2, y - wallH / 2 - 34, hpW, 10);
    ctx.fillStyle = palette.primary;
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
      out.push({ ...spec, count });
    }
    return out;
  }

  drawTowerUpgradeBadges(side, x, y, sideState) {
    const badges = this.getUpgradeBadgeData(sideState);
    if (!badges.length) return;

    const { ctx } = this;
    const dir = side === 'left' ? 1 : -1;
    const columns = 2;
    const stepX = 21;
    const stepY = 22;
    const r = 8;
    const ox = x + dir * 30;
    const oy = y - 124;

    for (let i = 0; i < badges.length; i += 1) {
      const b = badges[i];
      const col = i % columns;
      const row = Math.floor(i / columns);
      const bx = ox + dir * col * stepX;
      const by = oy + row * stepY;

      ctx.fillStyle = '#09101ddd';
      ctx.beginPath();
      ctx.arc(bx, by, r + 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef7d2cc';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#1f2230';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.code, bx, by + 2.5);

      if (b.count > 1) {
        const tx = bx + dir * 10;
        const ty = by - 7;
        ctx.fillStyle = '#18120ccf';
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffe7a6';
        ctx.font = 'bold 7px sans-serif';
        ctx.fillText(`${b.count}`, tx, ty + 2.5);
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
    const tint = card.side === 'left' ? '#cfab52' : '#c58f3b';
    const bg = '#3a3020';
    ctx.fillStyle = bg;
    ctx.fillRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);
    ctx.fillStyle = '#f4d5852b';
    ctx.fillRect(card.x - card.w / 2 + 1, card.y - card.h / 2 + 1, card.w - 2, card.h - 2);
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);

    ctx.fillStyle = '#fff1c8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(UPGRADE_LABELS[card.type] || 'Upgrade', card.x, card.y - 8);
    ctx.fillStyle = '#d9c08a';
    ctx.font = '8px sans-serif';
    ctx.fillText(UPGRADE_HINTS[card.type] || 'upgrade effect', card.x, card.y + 2);
    ctx.fillStyle = '#ffe3a5';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(`cost ${Math.max(1, Math.round(Number(card.cost) || 0))}`, card.x, card.y + 11);
    ctx.fillStyle = '#d4b67e';
    ctx.font = '8px sans-serif';
    ctx.fillText('shoot to choose', card.x, card.y + 19);
  }

  drawShotPower(power) {
    const { ctx } = this;
    const palette = TEAM_COLORS[power.side];
    ctx.fillStyle = '#ffffff22';
    ctx.beginPath();
    ctx.arc(power.x, power.y, power.r + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1f2338';
    ctx.beginPath();
    ctx.moveTo(power.x, power.y - power.r);
    ctx.lineTo(power.x + power.r, power.y);
    ctx.lineTo(power.x, power.y + power.r);
    ctx.lineTo(power.x - power.r, power.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff3b2';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(SHOT_POWER_LABELS[power.type] || 'Power', power.x, power.y + 3);
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

  drawMinionHpBar(minion, x, y, scale = 1) {
    const { ctx } = this;
    const hpPct = Math.max(0, minion.hp / minion.maxHp);
    const hpW = 36 * scale;
    const hpX = x - hpW / 2;
    const hpY = y - (26 * scale + 2);
    ctx.fillStyle = '#101420cc';
    ctx.fillRect(hpX, hpY, hpW, 5);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * hpPct, 5);
  }

  drawGunnerSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = minion.side === 'left' ? 1 : -1;
    const scale = minion.super ? 1.34 : 1;
    const bodyW = 22 * scale;
    const bodyH = 18 * scale;
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
    const gunLen = bodyW * 1.35;
    const gunY = -bodyH * 0.06;
    ctx.strokeStyle = '#dce9ff';
    ctx.lineWidth = 3.1;
    ctx.beginPath();
    ctx.moveTo(bodyW * 0.18 * dir, gunY);
    ctx.lineTo((bodyW * 0.18 + gunLen) * dir, gunY - 1.2);
    ctx.stroke();
    ctx.fillStyle = '#415a7e';
    ctx.fillRect(Math.min(bodyW * 0.04 * dir, (bodyW * 0.64) * dir), gunY - 3.2, Math.abs(bodyW * 0.6), 6.4);
    ctx.fillStyle = '#1f2a3b';
    ctx.fillRect(Math.min((-bodyW * 0.04) * dir, (bodyW * 0.12) * dir), gunY + 1.2, Math.abs(bodyW * 0.16), 3.6);

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
    }

    ctx.restore();

    ctx.fillStyle = '#ffd7aa';
    ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('GUNNER', x, y - bodyH * 1.18);
    this.drawMinionHpBar(minion, x, y, scale);
  }

  drawNecroSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = minion.side === 'left' ? 1 : -1;
    const scale = minion.super ? 1.45 : 1.08;
    const bodyR = 12 * scale;

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

    ctx.fillStyle = '#a9ffe0';
    ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('NECRO', x, y - bodyR - (minion.super ? 26 : 20));
    this.drawMinionHpBar(minion, x, y, Math.max(1, scale * 0.95));
  }

  drawBomberSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = minion.side === 'left' ? 1 : -1;
    const scale = minion.super ? 1.22 : 1;
    const r = (12 + Math.min(3, minion.tier || 0)) * scale;

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

    ctx.fillStyle = '#f5d39f';
    ctx.font = `bold ${minion.super ? 12 : 10}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('BOMBER', x, y - r - 16);
    this.drawMinionHpBar(minion, x, y, scale);
  }

  drawHeroSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = minion.side === 'left' ? 1 : -1;
    const scale = minion.super ? 1.26 : 1.08;
    const bodyR = 14 * scale;
    const swing = Math.sin((Number.isFinite(minion.heroSwing) ? minion.heroSwing : 0) * 1.4);

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

    ctx.fillStyle = '#ffe4b0';
    ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('HERO', x, y - bodyR - 20);
    this.drawMinionHpBar(minion, x, y, scale);
  }

  drawMonkSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = minion.side === 'left' ? 1 : -1;
    const scale = minion.super ? 1.18 : 1.04;
    const bodyR = 13 * scale;
    const healScale = Number.isFinite(minion.monkHealScale) ? minion.monkHealScale : 1;
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

    ctx.fillStyle = '#ddffcb';
    ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('MONK', x, y - bodyR - 18);
    this.drawMinionHpBar(minion, x, y, scale);
  }

  drawPresidentSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const dir = minion.side === 'left' ? 1 : -1;
    const scale = minion.super ? 1.2 : 1.04;
    const bodyR = 13 * scale;
    const setup = Boolean(minion.presidentSetup);

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

    ctx.fillStyle = '#ffe3b9';
    ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('PRESIDENT', x, y - bodyR - 18);
    this.drawMinionHpBar(minion, x, y, scale);
  }

  drawMinionSprite(minion) {
    if (minion.dragon) {
      this.drawDragonSprite(minion);
      return;
    }
    if (minion.digger) {
      this.drawDiggerSprite(minion);
      return;
    }
    if (minion.gunner) {
      this.drawGunnerSprite(minion);
      return;
    }
    if (minion.necrominion) {
      this.drawNecroSprite(minion);
      return;
    }
    if (minion.explosive) {
      this.drawBomberSprite(minion);
      return;
    }
    if (minion.hero) {
      this.drawHeroSprite(minion);
      return;
    }
    if (minion.monk) {
      this.drawMonkSprite(minion);
      return;
    }
    if (minion.president) {
      this.drawPresidentSprite(minion);
      return;
    }

    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const isNecro = Boolean(minion.necrominion);
    const isSummoned = Boolean(minion.summoned);
    const isGunner = Boolean(minion.gunner);
    const isRider = Boolean(minion.rider);
    const t = Math.max(0, Math.min(3, minion.tier || 0));
    const stage = Math.max(0, Math.min(5, Math.floor((minion.level || 0) / 4)));
    const scale = minion.super ? 2 : 1;
    const x = minion.x;
    const y = minion.y;
    const bodyR = 12 + t + Math.min(2, stage * 0.35);
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

    if (isNecro) {
      ctx.strokeStyle = '#6ff8bf80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, bodyR * scale + 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (isRider) {
      const horseBody = bodyR * 1.28;
      const horseY = bodyR * 0.78;
      const chargeGlow = Boolean(minion.riderChargeReady);
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
      ctx.lineTo(-horseBody * 0.7, horseY + bodyR * 1.03);
      ctx.moveTo(-horseBody * 0.2, horseY + bodyR * 0.17);
      ctx.lineTo(-horseBody * 0.18, horseY + bodyR * 1.08);
      ctx.moveTo(horseBody * 0.25, horseY + bodyR * 0.13);
      ctx.lineTo(horseBody * 0.28, horseY + bodyR * 1.02);
      ctx.moveTo(horseBody * 0.68, horseY + bodyR * 0.08);
      ctx.lineTo(horseBody * 0.72, horseY + bodyR * 0.92);
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

    if (isNecro) {
      ctx.strokeStyle = '#97ffd2';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, -2, 4.8, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-3, 2);
      ctx.lineTo(3, 2);
      ctx.stroke();
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
      } else if (isGunner) {
        const gunLen = weaponLen + 7;
        const muzzleX = handX + dir * (gunLen + 2);
        const muzzleY = handY - 2;
        const bodyStart = handX + dir * 1;
        const bodyEnd = handX + dir * (gunLen * 0.58);

        ctx.strokeStyle = '#d9e5fb';
        ctx.lineWidth = minion.super ? 4 : 3.1;
        ctx.beginPath();
        ctx.moveTo(handX, handY);
        ctx.lineTo(handX + dir * gunLen, handY - 2);
        ctx.stroke();

        ctx.fillStyle = '#455977';
        ctx.fillRect(Math.min(bodyStart, bodyEnd), handY - 3.2, Math.abs(bodyEnd - bodyStart), 6.4);
        ctx.fillStyle = '#1f2736';
        ctx.fillRect(Math.min(handX, handX + dir * 4), handY + 1, Math.abs(dir * 4), 3.5);

        const flash = Math.max(0, Math.min(1, (minion.gunFlashTtl || 0) / 0.14));
        if (flash > 0) {
          const flashR = 2 + flash * 5;
          ctx.fillStyle = '#fff2b0';
          ctx.beginPath();
          ctx.arc(muzzleX, muzzleY, flashR, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ff9f5f';
          ctx.beginPath();
          ctx.arc(muzzleX + dir * 2, muzzleY, flashR * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }
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

    if (minion.super) {
      ctx.fillStyle = '#ffe6a8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SUPER', x, y - bodyR * scale - 18);
    }

    if (isNecro) {
      ctx.fillStyle = '#a9ffe0';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('NECRO', x, y - bodyR * scale - (minion.super ? 34 : 20));
    }

    if (isGunner) {
      ctx.fillStyle = '#ffd6a1';
      ctx.font = `bold ${minion.super ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('GUNNER', x, y - bodyR * scale - (minion.super ? 34 : 20));
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

  drawDiggerSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const x = minion.x;
    const y = minion.y;
    const r = Math.max(11, minion.r || 12);
    const dir = minion.side === 'left' ? 1 : -1;
    const phase = Number.isFinite(minion.digPhase) ? minion.digPhase : 0;
    const shovelSwing = Math.sin(phase * 2.1);
    const handY = -r * 0.14 + Math.cos(phase * 1.9) * 1.3;

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
    ctx.arc(x, y - r * 0.08, r * 0.74, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = palette.dark;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Helmet.
    ctx.fillStyle = '#8ea1b7';
    ctx.beginPath();
    ctx.arc(x, y - r * 0.42, r * 0.48, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4f6176';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Face + eyes.
    ctx.fillStyle = '#f0dcc2';
    ctx.beginPath();
    ctx.arc(x, y - r * 0.18, r * 0.32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a2233';
    ctx.beginPath();
    ctx.arc(x - dir * 2, y - r * 0.2, 1.05, 0, Math.PI * 2);
    ctx.arc(x + dir * 2, y - r * 0.2, 1.05, 0, Math.PI * 2);
    ctx.fill();

    // Slow shovel animation.
    ctx.save();
    ctx.translate(x + dir * (r * 0.26), y + handY);
    ctx.rotate(dir * (0.2 + shovelSwing * 0.28));
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
    const dirtX = x + dir * (r * 1.28);
    const dirtY = y + r * 0.22 - shovelSwing * 2;
    ctx.fillStyle = '#8f7558';
    ctx.beginPath();
    ctx.arc(dirtX, dirtY, 2.1, 0, Math.PI * 2);
    ctx.arc(dirtX + dir * 3.5, dirtY - 1.6, 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e3d0ab';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DIGGER', x, y - r - 14);

    const hpPct = Math.max(0, minion.hp / minion.maxHp);
    const hpW = 28;
    const hpX = x - hpW / 2;
    const hpY = y - r - 9;
    ctx.fillStyle = '#101420cc';
    ctx.fillRect(hpX, hpY, hpW, 4);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * hpPct, 4);
  }

  dragonHeartCore(minion) {
    const dir = minion.side === 'left' ? 1 : -1;
    return {
      x: minion.x + dir * (minion.r * 0.34),
      y: minion.y - minion.r * 0.14,
      r: Math.max(7, minion.r * 0.3),
    };
  }

  drawDragonSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
    const dir = minion.side === 'left' ? 1 : -1;
    const x = minion.x;
    const y = minion.y;
    const scale = minion.super ? 1.22 : 1;
    const bodyW = minion.r * 1.42 * scale;
    const bodyH = minion.r * 0.82 * scale;
    const wingSpan = minion.r * 2.4 * scale;
    const wingLift = 0.35 + (Math.sin((minion.flyPhase || 0) * 2) + 1) * 0.27;
    const mouthX = x + dir * (minion.r * 0.95);
    const mouthY = y - minion.r * 0.24;

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

    ctx.fillStyle = '#ffc78d';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DRAGON', x, y - bodyH - 18);

    if ((minion.dragonBreathTtl || 0) > 0) {
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
        (mouthX + toX) * 0.5 + Math.sin((minion.flyPhase || 0) * 5) * 10,
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
    }

    const hpPct = Math.max(0, minion.hp / minion.maxHp);
    const hpW = 48 * scale;
    const hpX = x - hpW / 2;
    const hpY = y - (bodyH + 12);
    ctx.fillStyle = '#101420cc';
    ctx.fillRect(hpX, hpY, hpW, 6);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * hpPct, 6);
  }

  drawArrow(arrow) {
    const { ctx } = this;
    const angle = Math.atan2(arrow.vy, arrow.vx);
    const len = 14 + arrow.r * 1.6;
    const isMainArrow = Boolean(arrow.mainArrow);

    let body = arrow.side === 'left' ? '#d5ecff' : '#ffe0e0';
    let glow = null;
    if (arrow.powerType === 'ultraShot') {
      body = '#fff06d';
      glow = '#fff8b3';
    } else if (arrow.powerType === 'pierceShot') {
      body = '#9af7ff';
      glow = '#c2fcff';
    } else if (arrow.powerType === 'heavyShot') {
      body = '#ffb56d';
      glow = '#ffd2a3';
    } else if (arrow.powerType === 'multiShot') {
      body = '#d2a4ff';
      glow = '#e6ccff';
    }
    if (isMainArrow && !glow) {
      glow = arrow.side === 'left' ? '#bfe8ff' : '#ffd2c7';
    }

    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(angle);

    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
    }

    ctx.strokeStyle = body;
    ctx.lineWidth = Math.max(1.5, arrow.r * 0.6) * (isMainArrow ? 1.2 : 1);
    ctx.beginPath();
    ctx.moveTo(-len * 0.55, 0);
    ctx.lineTo(len * 0.45, 0);
    ctx.stroke();
    if (isMainArrow) {
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

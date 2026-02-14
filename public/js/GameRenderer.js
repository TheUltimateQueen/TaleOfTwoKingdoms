import { SHOT_INTERVAL, SHOT_POWER_LABELS, TEAM_COLORS, UPGRADE_LABELS } from './constants.js';

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

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
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

    this.drawCastle('left', world.towerLeftX, world.towerY, snapshot.left.towerHp, snapshot.left.pullX, snapshot.left.pullY);
    this.drawCastle('right', world.towerRightX, world.towerY, snapshot.right.towerHp, snapshot.right.pullX, snapshot.right.pullY);
    this.drawShotRing(world.towerLeftX, world.towerY - 185, snapshot.left.shotCd, TEAM_COLORS.left.ring);
    this.drawShotRing(world.towerRightX, world.towerY - 185, snapshot.right.shotCd, TEAM_COLORS.right.ring);
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
      count = 28;
      colors = ['#ffcf7a', '#ff8f5f', '#ffe8b7', '#ff6b4d'];
      speed = 300;
      life = 0.56;
      gravity = 520;
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
        size: 1.8 + Math.random() * 2.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity,
      });
    }
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

  drawCastle(side, x, y, hp, pullX, pullY) {
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

  drawUpgradeChargeBar(side, x, y, bw, bh, current, max) {
    const { ctx } = this;
    const palette = TEAM_COLORS[side];
    const pct = Math.max(0, Math.min(1, current / Math.max(1, max)));
    const fillH = bh * pct;

    ctx.fillStyle = '#0e1829d0';
    ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = '#4e6288';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, bw, bh);

    ctx.fillStyle = palette.primary;
    ctx.fillRect(x + 2, y + bh - fillH + 1, bw - 4, Math.max(0, fillH - 2));

    if (pct >= 1) {
      ctx.strokeStyle = '#fff4b2';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, bw + 4, bh + 4);
    }

    ctx.fillStyle = '#c7d8f3';
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
      const pct = Math.round((side.upgradeCharge / Math.max(1, side.upgradeChargeMax)) * 100);
      ctx.fillStyle = ready ? '#b8dcff' : '#7e8fa8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        ready ? 'Upgrade Ready: choose 1 of 2' : `Upgrade charge ${pct}%`,
        (x0 + x1) / 2,
        y - 34
      );
    }
  }

  drawUpgradeCard(card) {
    const { ctx } = this;
    const tint = card.side === 'left' ? '#3e6fa8' : '#8a4a4a';
    const bg = '#253753';
    ctx.fillStyle = bg;
    ctx.fillRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x - card.w / 2, card.y - card.h / 2, card.w, card.h);

    ctx.fillStyle = '#e9f1ff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(UPGRADE_LABELS[card.type] || 'Upgrade', card.x, card.y - 2);
    ctx.fillStyle = '#a8bad9';
    ctx.font = '10px sans-serif';
    ctx.fillText('shoot to take', card.x, card.y + 12);
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

  drawMinionSprite(minion) {
    const { ctx } = this;
    const palette = TEAM_COLORS[minion.side];
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

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

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

    const hpPct = Math.max(0, minion.hp / minion.maxHp);
    const hpW = 36 * scale;
    const hpX = x - hpW / 2;
    const hpY = y - (26 * scale + 2);
    ctx.fillStyle = '#101420cc';
    ctx.fillRect(hpX, hpY, hpW, 5);
    ctx.fillStyle = '#6bff95';
    ctx.fillRect(hpX, hpY, hpW * hpPct, 5);
  }

  drawArrow(arrow) {
    const { ctx } = this;
    const angle = Math.atan2(arrow.vy, arrow.vx);
    const len = 14 + arrow.r * 1.6;

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

    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(angle);

    if (glow) {
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
    }

    ctx.strokeStyle = body;
    ctx.lineWidth = Math.max(1.5, arrow.r * 0.6);
    ctx.beginPath();
    ctx.moveTo(-len * 0.55, 0);
    ctx.lineTo(len * 0.45, 0);
    ctx.stroke();

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

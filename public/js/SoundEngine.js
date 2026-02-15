export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.unlocked = false;
    this.lastAt = {
      minion: 0,
      resource: 0,
      powerup: 0,
      upgrade: 0,
      explosion: 0,
      dragon: 0,
      dragonfire: 0,
      gunhit: 0,
    };
  }

  unlock() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.13;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.unlocked = true;
  }

  play(type) {
    if (!this.unlocked || !this.ctx || !this.master) return;

    const nowMs = performance.now();
    const minGap = type === 'minion' || type === 'gunhit' ? 45 : 80;
    if (nowMs - this.lastAt[type] < minGap) return;
    this.lastAt[type] = nowMs;

    if (type === 'minion') this.playMinionHit();
    else if (type === 'resource') this.playResourceHit();
    else if (type === 'powerup') this.playPowerupHit();
    else if (type === 'upgrade') this.playUpgradeHit();
    else if (type === 'explosion') this.playExplosionHit();
    else if (type === 'dragon') this.playDragonHurt();
    else if (type === 'dragonfire') this.playDragonFire();
    else if (type === 'gunhit') this.playGunHit();
  }

  envGain(start, peak, decay) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + decay);
    g.connect(this.master);
    return g;
  }

  osc(type, freq, start, dur, gainNode) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    o.connect(gainNode);
    o.start(start);
    o.stop(start + dur);
    return o;
  }

  playMinionHit() {
    const t = this.ctx.currentTime;
    const g = this.envGain(t, 0.22, 0.07);
    this.osc('triangle', 160, t, 0.08, g);
  }

  playResourceHit() {
    const t = this.ctx.currentTime;
    const g1 = this.envGain(t, 0.16, 0.11);
    const g2 = this.envGain(t + 0.03, 0.12, 0.1);
    this.osc('sine', 980, t, 0.12, g1);
    this.osc('sine', 1320, t + 0.03, 0.11, g2);
  }

  playPowerupHit() {
    const t = this.ctx.currentTime;
    const g = this.envGain(t, 0.18, 0.22);
    const o = this.osc('sawtooth', 440, t, 0.24, g);
    o.frequency.exponentialRampToValueAtTime(940, t + 0.2);
  }

  playUpgradeHit() {
    const t = this.ctx.currentTime;
    const g1 = this.envGain(t, 0.16, 0.18);
    const g2 = this.envGain(t + 0.04, 0.14, 0.15);
    this.osc('triangle', 520, t, 0.2, g1);
    this.osc('triangle', 780, t + 0.04, 0.16, g2);
  }

  playExplosionHit() {
    const t = this.ctx.currentTime;
    const g = this.envGain(t, 0.24, 0.26);
    const o = this.osc('sawtooth', 180, t, 0.28, g);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.22);
  }

  playDragonHurt() {
    const t = this.ctx.currentTime;
    const g1 = this.envGain(t, 0.21, 0.3);
    const g2 = this.envGain(t + 0.03, 0.12, 0.22);
    const o1 = this.osc('sawtooth', 260, t, 0.32, g1);
    const o2 = this.osc('triangle', 520, t + 0.03, 0.24, g2);
    o1.frequency.exponentialRampToValueAtTime(132, t + 0.26);
    o2.frequency.exponentialRampToValueAtTime(240, t + 0.21);
  }

  playDragonFire() {
    const t = this.ctx.currentTime;
    const g1 = this.envGain(t, 0.2, 0.2);
    const g2 = this.envGain(t + 0.02, 0.11, 0.17);
    const o1 = this.osc('sawtooth', 150, t, 0.22, g1);
    const o2 = this.osc('square', 310, t + 0.02, 0.18, g2);
    o1.frequency.exponentialRampToValueAtTime(88, t + 0.18);
    o2.frequency.exponentialRampToValueAtTime(170, t + 0.16);
  }

  playGunHit() {
    const t = this.ctx.currentTime;
    const g1 = this.envGain(t, 0.2, 0.09);
    const g2 = this.envGain(t + 0.01, 0.1, 0.12);
    const o1 = this.osc('square', 220, t, 0.1, g1);
    const o2 = this.osc('triangle', 480, t + 0.01, 0.11, g2);
    o1.frequency.exponentialRampToValueAtTime(110, t + 0.08);
    o2.frequency.exponentialRampToValueAtTime(260, t + 0.1);
  }
}

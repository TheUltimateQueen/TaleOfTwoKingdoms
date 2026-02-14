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
    const minGap = type === 'minion' ? 45 : 80;
    if (nowMs - this.lastAt[type] < minGap) return;
    this.lastAt[type] = nowMs;

    if (type === 'minion') this.playMinionHit();
    else if (type === 'resource') this.playResourceHit();
    else if (type === 'powerup') this.playPowerupHit();
    else if (type === 'upgrade') this.playUpgradeHit();
    else if (type === 'explosion') this.playExplosionHit();
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
}

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuffer = null;
    this.unlocked = false;
    this.lastAt = {
      minion: 0,
      resource: 0,
      powerup: 0,
      upgrade: 0,
      explosion: 0,
      candlehit: 0,
      dragon: 0,
      dragonfire: 0,
      gunhit: 0,
      blocked: 0,
      golemsmash: 0,
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
      this.noiseBuffer = this.createNoiseBuffer(0.35);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.unlocked = true;
  }

  play(type, spatial = null) {
    if (!this.unlocked || !this.ctx || !this.master) return;

    const nowMs = performance.now();
    const minGap = type === 'minion' || type === 'gunhit' ? 45 : 80;
    if (nowMs - this.lastAt[type] < minGap) return;
    this.lastAt[type] = nowMs;

    if (type === 'minion') this.playMinionHit(spatial);
    else if (type === 'resource') this.playResourceHit();
    else if (type === 'powerup') this.playPowerupHit();
    else if (type === 'upgrade') this.playUpgradeHit();
    else if (type === 'explosion') this.playExplosionHit();
    else if (type === 'candlehit') this.playCandleHit();
    else if (type === 'dragon') this.playDragonHurt();
    else if (type === 'dragonfire') this.playDragonFire();
    else if (type === 'gunhit') this.playGunHit();
    else if (type === 'blocked') this.playBlocked();
    else if (type === 'golemsmash') this.playGolemSmash();
  }

  envGain(start, peak, decay, output = null, gainMul = 1) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    const scaledPeak = Math.max(0.0002, (Number(peak) || 0.1) * Math.max(0.2, Number(gainMul) || 1));
    g.gain.exponentialRampToValueAtTime(scaledPeak, start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, start + decay);
    g.connect(output || this.master);
    return g;
  }

  osc(type, freq, start, dur, gainNode, detuneCents = 0) {
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (Number.isFinite(detuneCents)) o.detune.setValueAtTime(detuneCents, start);
    o.connect(gainNode);
    o.start(start);
    o.stop(start + dur);
    return o;
  }

  createNoiseBuffer(seconds = 0.35) {
    if (!this.ctx) return null;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * Math.max(0.04, Number(seconds) || 0.35)));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  noiseBurst(start, peak, decay, centerHz, q = 1.1, output = null, gainMul = 1, detuneCents = 0) {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const detuneScale = Math.pow(2, (Number(detuneCents) || 0) / 1200);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(Math.max(80, (Number(centerHz) || 1800) * detuneScale), start);
    filter.Q.setValueAtTime(Math.max(0.2, Number(q) || 1.1), start);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    const scaledPeak = Math.max(0.0002, (Number(peak) || 0.08) * Math.max(0.2, Number(gainMul) || 1));
    g.gain.exponentialRampToValueAtTime(scaledPeak, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + Math.max(0.02, Number(decay) || 0.08));

    source.connect(filter);
    filter.connect(g);
    g.connect(output || this.master);
    source.start(start);
    source.stop(start + Math.max(0.03, Number(decay) || 0.08));
  }

  buildSpatialFx(spatial = null) {
    if (!this.ctx || !this.master || !spatial || typeof spatial !== 'object') {
      return { output: this.master, gainMul: 1, detuneCents: (Math.random() * 8 - 4), pan: 0, cleanup: null };
    }
    let pan = 0;
    if (Number.isFinite(spatial.x)) {
      const worldW = Math.max(320, Number(spatial?.world?.w) || Number(spatial.worldWidth) || 1600);
      pan = ((Number(spatial.x) || (worldW * 0.5)) - worldW * 0.5) / (worldW * 0.5);
    } else if (spatial.side === 'left') {
      pan = -0.55;
    } else if (spatial.side === 'right') {
      pan = 0.55;
    }
    pan = Math.max(-1, Math.min(1, pan));
    const edge = Math.abs(pan);
    const gainMul = 0.72 + (1 - edge) * 0.28;
    const detuneCents = pan * 68 + (Math.random() * 10 - 5);

    if (typeof this.ctx.createStereoPanner !== 'function') {
      return { output: this.master, gainMul, detuneCents, pan, cleanup: null };
    }
    const panner = this.ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, this.ctx.currentTime);
    panner.connect(this.master);
    return { output: panner, gainMul, detuneCents, pan, cleanup: panner };
  }

  cleanupNodeLater(node, seconds = 0.2) {
    if (!node || node === this.master) return;
    const ms = Math.max(40, Math.round((Number(seconds) || 0.2) * 1000) + 40);
    window.setTimeout(() => {
      try {
        node.disconnect();
      } catch {
        // no-op
      }
    }, ms);
  }

  comboStrength(spatial = null) {
    if (!spatial || typeof spatial !== 'object') return 0;
    const rawStreak = Number(spatial.comboHitStreak ?? spatial.comboStreak ?? spatial.combo);
    if (Number.isFinite(rawStreak) && rawStreak > 0) {
      return Math.max(0, Math.min(1, rawStreak / 10));
    }
    const rawTier = Number(spatial.comboTier);
    if (Number.isFinite(rawTier) && rawTier > 1) {
      return Math.max(0, Math.min(1, (rawTier - 1) / 3));
    }
    return 0;
  }

  playMinionHit(spatial = null) {
    const t = this.ctx.currentTime;
    const fx = this.buildSpatialFx(spatial);
    const combo = this.comboStrength(spatial);
    const comboGain = 1 + combo * 0.56;
    const comboPitchCents = combo * 104;
    const totalGainMul = fx.gainMul * comboGain;
    const sub = this.envGain(t, 0.235, 0.142, fx.output, totalGainMul);
    const punch = this.envGain(t + 0.0015, 0.152, 0.102, fx.output, totalGainMul);
    const attack = this.envGain(t, 0.074, 0.046, fx.output, totalGainMul);
    const sparkle = this.envGain(t + 0.014, 0.049 + combo * 0.012, 0.078, fx.output, totalGainMul);

    const subOsc = this.osc('sine', 162, t, 0.145, sub, fx.detuneCents * 0.45 + comboPitchCents * 0.24);
    const punchOsc = this.osc('triangle', 306, t + 0.0015, 0.104, punch, fx.detuneCents * 0.7 + comboPitchCents * 0.36);
    const attackOsc = this.osc('square', 430, t, 0.052, attack, fx.detuneCents * 0.92 + comboPitchCents * 0.48);
    const sparkleOsc = this.osc('sine', 1540, t + 0.014, 0.078, sparkle, fx.detuneCents * 0.82 + comboPitchCents * 0.72);

    subOsc.frequency.exponentialRampToValueAtTime(58, t + 0.128);
    punchOsc.frequency.exponentialRampToValueAtTime(116, t + 0.096);
    attackOsc.frequency.exponentialRampToValueAtTime(188, t + 0.05);
    sparkleOsc.frequency.exponentialRampToValueAtTime(760 + combo * 140, t + 0.086);

    // Low-mid noise bursts add a tactile "impact" instead of a sharp sparkle.
    this.noiseBurst(
      t + 0.0008,
      0.052 + combo * 0.019,
      0.068,
      390 + combo * 92,
      0.95,
      fx.output,
      totalGainMul,
      fx.detuneCents + comboPitchCents * 0.28
    );
    this.noiseBurst(
      t + 0.006,
      0.038 + combo * 0.013,
      0.072,
      1060 + combo * 130,
      1.1,
      fx.output,
      totalGainMul,
      fx.detuneCents + comboPitchCents * 0.34
    );
    // A short high "air" layer after the thud for a satisfying follow-through.
    this.noiseBurst(
      t + 0.018,
      0.018 + combo * 0.007,
      0.054,
      1980 + combo * 200,
      1.24,
      fx.output,
      totalGainMul,
      fx.detuneCents + comboPitchCents * 0.58
    );
    this.cleanupNodeLater(fx.cleanup, 0.28);
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

  playCandleHit() {
    const t = this.ctx.currentTime;
    const g1 = this.envGain(t, 0.22, 0.2);
    const g2 = this.envGain(t + 0.02, 0.14, 0.16);
    const o1 = this.osc('sawtooth', 240, t, 0.22, g1);
    const o2 = this.osc('triangle', 460, t + 0.02, 0.17, g2);
    o1.frequency.exponentialRampToValueAtTime(130, t + 0.18);
    o2.frequency.exponentialRampToValueAtTime(220, t + 0.16);
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

  playBlocked() {
    const t = this.ctx.currentTime;
    const g1 = this.envGain(t, 0.16, 0.16);
    const g2 = this.envGain(t + 0.015, 0.12, 0.14);
    const o1 = this.osc('square', 190, t, 0.18, g1);
    const o2 = this.osc('triangle', 420, t + 0.015, 0.14, g2);
    o1.frequency.exponentialRampToValueAtTime(96, t + 0.15);
    o2.frequency.exponentialRampToValueAtTime(210, t + 0.12);
  }

  playGolemSmash() {
    const t = this.ctx.currentTime;
    const rumble = this.envGain(t, 0.28, 0.42);
    const growlA = this.envGain(t + 0.01, 0.2, 0.22);
    const growlB = this.envGain(t + 0.055, 0.18, 0.2);
    const growlC = this.envGain(t + 0.1, 0.16, 0.19);
    const impact = this.envGain(t + 0.12, 0.17, 0.13);

    const low = this.osc('sawtooth', 118, t, 0.44, rumble);
    low.frequency.exponentialRampToValueAtTime(56, t + 0.36);

    const a = this.osc('square', 240, t + 0.01, 0.24, growlA);
    const b = this.osc('triangle', 208, t + 0.055, 0.21, growlB);
    const c = this.osc('square', 182, t + 0.1, 0.19, growlC);
    a.frequency.exponentialRampToValueAtTime(128, t + 0.22);
    b.frequency.exponentialRampToValueAtTime(118, t + 0.24);
    c.frequency.exponentialRampToValueAtTime(96, t + 0.2);

    const thud = this.osc('sine', 94, t + 0.12, 0.14, impact);
    thud.frequency.exponentialRampToValueAtTime(46, t + 0.23);
  }
}

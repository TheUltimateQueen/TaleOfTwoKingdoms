export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.noiseBuffer = null;
    this.unlocked = false;
    this.comboNoteState = {
      left: { streak: 0, at: 0, shepardStep: 0 },
      right: { streak: 0, at: 0, shepardStep: 12 },
    };
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
    const mix = this.effectMix(type);

    if (type === 'minion') this.playMinionHit(spatial, mix);
    else if (type === 'resource') this.playResourceHit(mix);
    else if (type === 'powerup') this.playPowerupHit(mix);
    else if (type === 'upgrade') this.playUpgradeHit(mix);
    else if (type === 'explosion') this.playExplosionHit(mix);
    else if (type === 'candlehit') this.playCandleHit(mix);
    else if (type === 'dragon') this.playDragonHurt(mix);
    else if (type === 'dragonfire') this.playDragonFire(mix);
    else if (type === 'gunhit') this.playGunHit(mix);
    else if (type === 'blocked') this.playBlocked(mix);
    else if (type === 'golemsmash') this.playGolemSmash(mix);
  }

  effectMix(type) {
    if (type === 'minion') return 1.32;
    return 0.855;
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

  comboStreak(spatial = null) {
    if (!spatial || typeof spatial !== 'object') return 0;
    const rawStreak = Number(spatial.comboHitStreak ?? spatial.comboStreak ?? spatial.combo);
    if (Number.isFinite(rawStreak)) return Math.max(0, Math.min(10, Math.round(rawStreak)));
    const rawTier = Number(spatial.comboTier);
    if (Number.isFinite(rawTier) && rawTier > 0) return Math.max(0, Math.min(10, Math.round((rawTier - 1) * 3 + 1)));
    return 0;
  }

  comboSide(spatial = null) {
    if (!spatial || typeof spatial !== 'object') return 'left';
    if (spatial.side === 'right') return 'right';
    if (spatial.side === 'left') return 'left';
    if (Number.isFinite(spatial.x)) {
      const worldW = Math.max(320, Number(spatial?.world?.w) || Number(spatial.worldWidth) || 1600);
      return (Number(spatial.x) || 0) > worldW * 0.5 ? 'right' : 'left';
    }
    return 'left';
  }

  nextComboShepardStep(spatial = null, streak = 0) {
    const sideName = this.comboSide(spatial);
    const state = this.comboNoteState[sideName] || {
      streak: 0,
      at: 0,
      shepardStep: sideName === 'right' ? 12 : 0,
    };
    const nowMs = performance.now();
    const nextStreak = Math.max(0, Math.min(10, Math.round(Number(streak) || 0)));
    if (nextStreak <= 1) {
      state.streak = nextStreak;
      state.at = nowMs;
      this.comboNoteState[sideName] = state;
      return null;
    }
    // If combo dropped (miss happened), re-arm so the next build-up can sing again.
    if (nextStreak < state.streak) state.streak = nextStreak - 1;
    const atCapLoop = nextStreak >= 10 && state.streak >= 10;
    if (!atCapLoop && nextStreak <= state.streak) return null;
    const minGap = atCapLoop ? 120 : 45;
    if (nowMs - (Number(state.at) || 0) < minGap) return null;
    state.streak = nextStreak;
    state.at = nowMs;
    const stepToPlay = Math.max(0, Math.round(Number(state.shepardStep) || 0));
    state.shepardStep = (stepToPlay + 1) % 24;
    this.comboNoteState[sideName] = state;
    return stepToPlay;
  }

  playComboNote(output, detuneCents, combo, streak, shepardStep, gainMul = 1) {
    if (!this.ctx) return;
    const level = Math.max(0, Math.min(1, Number(combo) || 0));
    const step = Math.max(0, Number(shepardStep) || 0);
    const chroma = (step * 0.5) % 12;
    const root = 261.626; // C4
    const pitchClassFreq = root * Math.pow(2, chroma / 12);
    const noteGainMul = Math.max(0.2, Number(gainMul) || 1) * (0.46 + level * 0.08);
    const t = this.ctx.currentTime + 0.004;
    const centerHz = 880;
    const spread = 1.04;
    const layers = [0.5, 1, 2, 4];

    for (let i = 0; i < layers.length; i += 1) {
      const freq = pitchClassFreq * layers[i];
      if (!Number.isFinite(freq) || freq < 70 || freq > 4200) continue;
      const distance = Math.log2(freq / centerHz);
      const weight = Math.exp(-0.5 * Math.pow(distance / spread, 2));
      const peak = (0.017 + level * 0.01) * (0.18 + weight * 0.98);
      if (peak <= 0.001) continue;

      const start = t + i * 0.0018;
      const body = this.envGain(start, peak, 0.15 + weight * 0.04, output, noteGainMul);
      const over = this.envGain(start + 0.007, peak * 0.62, 0.14, output, noteGainMul);

      const n1 = this.osc('sine', freq, start, 0.16, body, detuneCents + level * 14 + i * 3);
      const n2 = this.osc('triangle', freq * 1.995, start + 0.007, 0.15, over, detuneCents * 0.8 + level * 20 + i * 2);
      n1.frequency.exponentialRampToValueAtTime(freq * 1.028, start + 0.15);
      n2.frequency.exponentialRampToValueAtTime(freq * 2.06, start + 0.147);
    }
  }

  playMinionHit(spatial = null, mix = 1) {
    const t = this.ctx.currentTime;
    const fx = this.buildSpatialFx(spatial);
    const combo = this.comboStrength(spatial);
    const streak = this.comboStreak(spatial);
    const comboGain = 1 + combo * 0.56;
    const comboPitchCents = combo * 104;
    const totalGainMul = fx.gainMul * comboGain * Math.max(0.2, Number(mix) || 1);
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
    const shepardStep = this.nextComboShepardStep(spatial, streak);
    if (Number.isFinite(shepardStep)) {
      this.playComboNote(
        fx.output,
        fx.detuneCents + comboPitchCents * 0.35,
        combo,
        streak,
        shepardStep,
        totalGainMul
      );
    }
    this.cleanupNodeLater(fx.cleanup, 0.28);
  }

  playResourceHit(mix = 1) {
    const t = this.ctx.currentTime;
    const gainMul = Math.max(0.2, Number(mix) || 1);
    const g1 = this.envGain(t, 0.16, 0.11, null, gainMul);
    const g2 = this.envGain(t + 0.03, 0.12, 0.1, null, gainMul);
    this.osc('sine', 980, t, 0.12, g1);
    this.osc('sine', 1320, t + 0.03, 0.11, g2);
  }

  playPowerupHit(mix = 1) {
    const t = this.ctx.currentTime;
    const g = this.envGain(t, 0.18, 0.22, null, Math.max(0.2, Number(mix) || 1));
    const o = this.osc('sawtooth', 440, t, 0.24, g);
    o.frequency.exponentialRampToValueAtTime(940, t + 0.2);
  }

  playUpgradeHit(mix = 1) {
    const t = this.ctx.currentTime;
    const gainMul = Math.max(0.2, Number(mix) || 1);
    const g1 = this.envGain(t, 0.16, 0.18, null, gainMul);
    const g2 = this.envGain(t + 0.04, 0.14, 0.15, null, gainMul);
    this.osc('triangle', 520, t, 0.2, g1);
    this.osc('triangle', 780, t + 0.04, 0.16, g2);
  }

  playExplosionHit(mix = 1) {
    const t = this.ctx.currentTime;
    const g = this.envGain(t, 0.24, 0.26, null, Math.max(0.2, Number(mix) || 1));
    const o = this.osc('sawtooth', 180, t, 0.28, g);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.22);
  }

  playCandleHit(mix = 1) {
    const t = this.ctx.currentTime;
    const gainMul = Math.max(0.2, Number(mix) || 1);
    const g1 = this.envGain(t, 0.22, 0.2, null, gainMul);
    const g2 = this.envGain(t + 0.02, 0.14, 0.16, null, gainMul);
    const o1 = this.osc('sawtooth', 240, t, 0.22, g1);
    const o2 = this.osc('triangle', 460, t + 0.02, 0.17, g2);
    o1.frequency.exponentialRampToValueAtTime(130, t + 0.18);
    o2.frequency.exponentialRampToValueAtTime(220, t + 0.16);
  }

  playDragonHurt(mix = 1) {
    const t = this.ctx.currentTime;
    const gainMul = Math.max(0.2, Number(mix) || 1);
    const g1 = this.envGain(t, 0.21, 0.3, null, gainMul);
    const g2 = this.envGain(t + 0.03, 0.12, 0.22, null, gainMul);
    const o1 = this.osc('sawtooth', 260, t, 0.32, g1);
    const o2 = this.osc('triangle', 520, t + 0.03, 0.24, g2);
    o1.frequency.exponentialRampToValueAtTime(132, t + 0.26);
    o2.frequency.exponentialRampToValueAtTime(240, t + 0.21);
  }

  playDragonFire(mix = 1) {
    const t = this.ctx.currentTime;
    const gainMul = Math.max(0.2, Number(mix) || 1);
    const g1 = this.envGain(t, 0.2, 0.2, null, gainMul);
    const g2 = this.envGain(t + 0.02, 0.11, 0.17, null, gainMul);
    const o1 = this.osc('sawtooth', 150, t, 0.22, g1);
    const o2 = this.osc('square', 310, t + 0.02, 0.18, g2);
    o1.frequency.exponentialRampToValueAtTime(88, t + 0.18);
    o2.frequency.exponentialRampToValueAtTime(170, t + 0.16);
  }

  playGunHit(mix = 1) {
    const t = this.ctx.currentTime;
    const gainMul = Math.max(0.2, Number(mix) || 1);
    const g1 = this.envGain(t, 0.2, 0.09, null, gainMul);
    const g2 = this.envGain(t + 0.01, 0.1, 0.12, null, gainMul);
    const o1 = this.osc('square', 220, t, 0.1, g1);
    const o2 = this.osc('triangle', 480, t + 0.01, 0.11, g2);
    o1.frequency.exponentialRampToValueAtTime(110, t + 0.08);
    o2.frequency.exponentialRampToValueAtTime(260, t + 0.1);
  }

  playBlocked(mix = 1) {
    const t = this.ctx.currentTime;
    const gainMul = Math.max(0.2, Number(mix) || 1);
    const g1 = this.envGain(t, 0.16, 0.16, null, gainMul);
    const g2 = this.envGain(t + 0.015, 0.12, 0.14, null, gainMul);
    const o1 = this.osc('square', 190, t, 0.18, g1);
    const o2 = this.osc('triangle', 420, t + 0.015, 0.14, g2);
    o1.frequency.exponentialRampToValueAtTime(96, t + 0.15);
    o2.frequency.exponentialRampToValueAtTime(210, t + 0.12);
  }

  playGolemSmash(mix = 1) {
    const t = this.ctx.currentTime;
    const gainMul = Math.max(0.2, Number(mix) || 1);
    const rumble = this.envGain(t, 0.28, 0.42, null, gainMul);
    const growlA = this.envGain(t + 0.01, 0.2, 0.22, null, gainMul);
    const growlB = this.envGain(t + 0.055, 0.18, 0.2, null, gainMul);
    const growlC = this.envGain(t + 0.1, 0.16, 0.19, null, gainMul);
    const impact = this.envGain(t + 0.12, 0.17, 0.13, null, gainMul);

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

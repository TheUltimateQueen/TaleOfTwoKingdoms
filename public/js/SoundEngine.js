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
    this.archerPianoSlotMap = [0, 1, 2, 3];
    this.archerDuoInstrumentSet = [6, 0];
    this.archerQuadInstrumentSet = [0, 4, 5, 6];
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
    else if (type === 'resource') this.playResourceHit(spatial, mix);
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

  randomizeArcherPianoSlots() {
    const profiles = this.getArcherInstrumentProfiles();
    const order = [0, 1, 2, 3];
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = order[i];
      order[i] = order[j];
      order[j] = temp;
    }
    this.archerPianoSlotMap = order;

    const byName = new Map(profiles.map((p, idx) => [p.instrument, idx]));
    const pickOne = (names) => {
      const available = names
        .map((name) => byName.get(name))
        .filter((idx) => Number.isFinite(idx));
      if (!available.length) return 0;
      return available[Math.floor(Math.random() * available.length)];
    };
    const keyboard = pickOne(['felt_piano', 'upright_piano', 'rhodes_ep']);
    const brightKeys = pickOne(['harpsichord', 'celesta_bell']);
    const woodwind = pickOne(['clarinet_reed', 'flute_breath']);
    const brass = pickOne(['brass_stab']);

    const duoPairs = [
      [brass, keyboard],
      [woodwind, brightKeys],
      [brass, brightKeys],
      [woodwind, keyboard],
    ];
    const duo = duoPairs[Math.floor(Math.random() * duoPairs.length)].slice();
    if (Math.random() < 0.5) duo.reverse();
    this.archerDuoInstrumentSet = duo;

    const quad = [keyboard, brightKeys, woodwind, brass];
    for (let i = quad.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = quad[i];
      quad[i] = quad[j];
      quad[j] = temp;
    }
    this.archerQuadInstrumentSet = quad;
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

  archerSlotIndex(spatial = null) {
    if (!spatial || typeof spatial !== 'object') return 0;
    const raw = Number(spatial.archerSlot ?? spatial.slot ?? spatial.lane);
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(3, Math.floor(raw)));
  }

  activeArcherCount(spatial = null) {
    if (spatial && typeof spatial === 'object') {
      const rawCount = Number(spatial.archersTotal ?? spatial.totalArchers);
      if (Number.isFinite(rawCount) && rawCount >= 4) return 4;
      if (Number.isFinite(rawCount) && rawCount >= 2) return 2;
      if (spatial.mode === '2v2') return 4;
      if (spatial.mode === '1v1') return 2;
    }
    return 2;
  }

  archerVoiceIndex(spatial = null) {
    const total = this.activeArcherCount(spatial);
    const sideIndex = spatial?.side === 'right' ? 1 : 0;
    if (total <= 2) return sideIndex;
    const slot = this.archerSlotIndex(spatial);
    const lane = Math.max(0, Math.min(1, slot));
    return sideIndex * 2 + lane;
  }

  archerHarmonySemitone(spatial = null) {
    const total = this.activeArcherCount(spatial);
    const voice = Math.max(0, this.archerVoiceIndex(spatial));
    const mappedVoice = this.archerPianoSlotMap[voice] ?? voice;
    if (total <= 2) {
      const twoVoice = [0, 7];
      return twoVoice[mappedVoice % twoVoice.length];
    }
    const fourVoice = [0, 4, 7, 11];
    return fourVoice[mappedVoice % fourVoice.length];
  }

  getArcherInstrumentProfiles() {
    return [
      {
        instrument: 'felt_piano',
        rootHz: 311.127,
        scale: [0, 2, 4, 7, 9],
        stepOffset: 0,
        gainMul: 0.72,
        bodyWave: 'triangle',
        harmWave: 'sine',
        fifthWave: 'sine',
        airWave: 'sine',
        bodyDecay: 0.2,
        harmDecay: 0.16,
        airDecay: 0.056,
        clickFreq: 2360,
        clickQ: 1.7,
        tailFreq: 1320,
      },
      {
        instrument: 'upright_piano',
        rootHz: 349.228,
        scale: [0, 2, 5, 7, 11],
        stepOffset: 1,
        gainMul: 0.78,
        bodyWave: 'triangle',
        harmWave: 'triangle',
        fifthWave: 'sine',
        airWave: 'sine',
        bodyDecay: 0.18,
        harmDecay: 0.146,
        airDecay: 0.05,
        clickFreq: 2750,
        clickQ: 2.12,
        tailFreq: 1510,
      },
      {
        instrument: 'rhodes_ep',
        rootHz: 293.665,
        scale: [0, 3, 5, 7, 10],
        stepOffset: 2,
        gainMul: 0.74,
        bodyWave: 'sine',
        harmWave: 'triangle',
        fifthWave: 'triangle',
        airWave: 'sine',
        bodyDecay: 0.214,
        harmDecay: 0.172,
        airDecay: 0.062,
        clickFreq: 2230,
        clickQ: 1.46,
        tailFreq: 1250,
      },
      {
        instrument: 'harpsichord',
        rootHz: 329.628,
        scale: [0, 2, 4, 6, 9],
        stepOffset: 3,
        gainMul: 0.77,
        bodyWave: 'triangle',
        harmWave: 'sine',
        fifthWave: 'sine',
        airWave: 'triangle',
        bodyDecay: 0.19,
        harmDecay: 0.154,
        airDecay: 0.058,
        clickFreq: 2920,
        clickQ: 2.35,
        tailFreq: 1630,
      },
      {
        instrument: 'celesta_bell',
        rootHz: 392.0,
        scale: [0, 2, 4, 7, 11],
        stepOffset: 1,
        gainMul: 0.7,
        bodyWave: 'sine',
        harmWave: 'sine',
        fifthWave: 'sine',
        airWave: 'sine',
        bodyDecay: 0.22,
        harmDecay: 0.2,
        airDecay: 0.08,
        clickFreq: 3180,
        clickQ: 2.8,
        tailFreq: 2140,
      },
      {
        instrument: 'clarinet_reed',
        rootHz: 246.942,
        scale: [0, 2, 3, 7, 10],
        stepOffset: 0,
        gainMul: 0.73,
        bodyWave: 'square',
        harmWave: 'triangle',
        fifthWave: 'square',
        airWave: 'sine',
        bodyDecay: 0.2,
        harmDecay: 0.17,
        airDecay: 0.065,
        clickFreq: 1140,
        clickQ: 1.15,
        tailFreq: 980,
      },
      {
        instrument: 'brass_stab',
        rootHz: 220.0,
        scale: [0, 2, 5, 7, 9],
        stepOffset: 2,
        gainMul: 0.75,
        bodyWave: 'sawtooth',
        harmWave: 'square',
        fifthWave: 'triangle',
        airWave: 'sawtooth',
        bodyDecay: 0.16,
        harmDecay: 0.13,
        airDecay: 0.05,
        clickFreq: 1760,
        clickQ: 1.5,
        tailFreq: 1360,
      },
      {
        instrument: 'flute_breath',
        rootHz: 523.251,
        scale: [0, 2, 4, 7, 9],
        stepOffset: 0,
        gainMul: 0.68,
        bodyWave: 'sine',
        harmWave: 'sine',
        fifthWave: 'triangle',
        airWave: 'sine',
        bodyDecay: 0.23,
        harmDecay: 0.18,
        airDecay: 0.075,
        clickFreq: 1420,
        clickQ: 0.9,
        tailFreq: 1220,
      },
    ];
  }

  archerPianoProfile(spatial = null) {
    const voice = Math.max(0, this.archerVoiceIndex(spatial));
    const mappedSlot = this.archerPianoSlotMap[voice] ?? voice;
    const total = this.activeArcherCount(spatial);
    const profiles = this.getArcherInstrumentProfiles();
    let instrumentIndex = mappedSlot;
    if (total <= 2) {
      const duo = Array.isArray(this.archerDuoInstrumentSet) && this.archerDuoInstrumentSet.length >= 2
        ? this.archerDuoInstrumentSet
        : [6, 0];
      instrumentIndex = duo[Math.max(0, Math.min(1, voice))];
    } else {
      const quad = Array.isArray(this.archerQuadInstrumentSet) && this.archerQuadInstrumentSet.length >= 4
        ? this.archerQuadInstrumentSet
        : [0, 4, 5, 6];
      instrumentIndex = quad[Math.max(0, Math.min(3, voice))];
    }
    const idx = Number.isFinite(instrumentIndex) ? Math.max(0, Math.floor(instrumentIndex)) : mappedSlot;
    return profiles[idx] || profiles[mappedSlot] || profiles[0];
  }

  instrumentIconSrc(instrument = 'felt_piano') {
    const iconByInstrument = {
      felt_piano: '/icons/twemoji/1f3b9.svg', // musical keyboard
      upright_piano: '/icons/twemoji/1f3b9.svg',
      rhodes_ep: '/icons/twemoji/1f3b9.svg',
      harpsichord: '/icons/twemoji/1fa97.svg', // banjo (plucked timbre proxy)
      celesta_bell: '/icons/twemoji/1f514.svg', // bell
      clarinet_reed: '/icons/twemoji/1f3b7.svg', // saxophone (reed proxy)
      brass_stab: '/icons/twemoji/1f3ba.svg', // trumpet
      flute_breath: '/icons/twemoji/1fa88.svg', // flute
    };
    return iconByInstrument[instrument] || '/icons/twemoji/1f3bc.svg';
  }

  archerInstrumentUi(spatial = null) {
    const profile = this.archerPianoProfile(spatial);
    const instrument = profile?.instrument || 'felt_piano';
    return {
      instrument,
      iconSrc: this.instrumentIconSrc(instrument),
    };
  }

  playArcherInstrumentAccent(profile, rootHz, t, output, detuneCents, comboPitchCents, combo, totalGainMul) {
    if (!this.ctx || !profile) return;
    const kind = profile.instrument || 'felt_piano';
    const level = Math.max(0, Math.min(1, Number(combo) || 0));
    const nonPiano = kind === 'celesta_bell' || kind === 'clarinet_reed' || kind === 'brass_stab' || kind === 'flute_breath';
    const accentMul = totalGainMul * (nonPiano ? (1.02 + level * 0.42) : (0.82 + level * 0.36));

    if (kind === 'upright_piano') {
      const body = this.envGain(t + 0.0015, 0.032 + level * 0.01, 0.13, output, accentMul);
      const bark = this.envGain(t + 0.002, 0.018 + level * 0.008, 0.09, output, accentMul);
      const b1 = this.osc('triangle', rootHz * 1.01, t + 0.0015, 0.14, body, detuneCents * 0.7 + comboPitchCents * 0.18);
      const b2 = this.osc('square', rootHz * 2.48, t + 0.002, 0.1, bark, detuneCents * 0.95 + comboPitchCents * 0.34);
      b1.frequency.exponentialRampToValueAtTime(rootHz * 0.98, t + 0.13);
      b2.frequency.exponentialRampToValueAtTime(rootHz * 2.18, t + 0.09);
      this.noiseBurst(t + 0.0014, 0.013 + level * 0.005, 0.042, 3250, 2.4, output, accentMul, detuneCents);
      return;
    }

    if (kind === 'rhodes_ep') {
      const tone = this.envGain(t + 0.003, 0.028 + level * 0.012, 0.22, output, accentMul);
      const bell = this.envGain(t + 0.005, 0.013 + level * 0.007, 0.18, output, accentMul);
      const r1 = this.osc('sine', rootHz, t + 0.003, 0.24, tone, detuneCents * 0.5 + comboPitchCents * 0.16);
      const r2 = this.osc('sine', rootHz * 1.006, t + 0.003, 0.24, tone, detuneCents * 0.62 + comboPitchCents * 0.22);
      const r3 = this.osc('triangle', rootHz * 2.01, t + 0.005, 0.2, bell, detuneCents * 0.82 + comboPitchCents * 0.3);
      r1.frequency.exponentialRampToValueAtTime(rootHz * 0.992, t + 0.22);
      r2.frequency.exponentialRampToValueAtTime(rootHz * 1.0, t + 0.22);
      r3.frequency.exponentialRampToValueAtTime(rootHz * 1.88, t + 0.17);
      return;
    }

    if (kind === 'harpsichord') {
      const pluck = this.envGain(t + 0.0012, 0.029 + level * 0.012, 0.095, output, accentMul);
      const upper = this.envGain(t + 0.0018, 0.019 + level * 0.007, 0.08, output, accentMul);
      const h1 = this.osc('square', rootHz, t + 0.0012, 0.1, pluck, detuneCents * 0.72 + comboPitchCents * 0.2);
      const h2 = this.osc('square', rootHz * 2.0, t + 0.0018, 0.085, upper, detuneCents * 0.9 + comboPitchCents * 0.35);
      h1.frequency.exponentialRampToValueAtTime(rootHz * 0.965, t + 0.09);
      h2.frequency.exponentialRampToValueAtTime(rootHz * 1.84, t + 0.08);
      this.noiseBurst(t + 0.001, 0.011 + level * 0.004, 0.036, 2920, 2.7, output, accentMul, detuneCents);
      return;
    }

    if (kind === 'celesta_bell') {
      const bell = this.envGain(t + 0.0018, 0.046 + level * 0.018, 0.28, output, accentMul);
      const overtone = this.envGain(t + 0.0034, 0.03 + level * 0.012, 0.25, output, accentMul);
      const c1 = this.osc('sine', rootHz * 1.995, t + 0.002, 0.26, bell, detuneCents * 0.84 + comboPitchCents * 0.26);
      const c2 = this.osc('sine', rootHz * 3.0, t + 0.004, 0.24, overtone, detuneCents * 0.92 + comboPitchCents * 0.34);
      c1.frequency.exponentialRampToValueAtTime(rootHz * 1.9, t + 0.24);
      c2.frequency.exponentialRampToValueAtTime(rootHz * 2.82, t + 0.22);
      this.noiseBurst(t + 0.002, 0.009 + level * 0.004, 0.052, 3540, 2.6, output, accentMul, detuneCents);
      return;
    }

    if (kind === 'clarinet_reed') {
      const reed = this.envGain(t + 0.0022, 0.045 + level * 0.018, 0.22, output, accentMul);
      const body = this.envGain(t + 0.0034, 0.03 + level * 0.012, 0.19, output, accentMul);
      const cl1 = this.osc('square', rootHz, t + 0.003, 0.21, reed, detuneCents * 0.6 + comboPitchCents * 0.16);
      const cl2 = this.osc('triangle', rootHz * 1.5, t + 0.004, 0.18, body, detuneCents * 0.72 + comboPitchCents * 0.22);
      cl1.frequency.exponentialRampToValueAtTime(rootHz * 0.98, t + 0.2);
      cl2.frequency.exponentialRampToValueAtTime(rootHz * 1.44, t + 0.17);
      this.noiseBurst(t + 0.002, 0.012 + level * 0.005, 0.054, 940, 0.82, output, accentMul, detuneCents);
      return;
    }

    if (kind === 'brass_stab') {
      const stab = this.envGain(t + 0.0016, 0.052 + level * 0.02, 0.14, output, accentMul);
      const edge = this.envGain(t + 0.002, 0.03 + level * 0.011, 0.11, output, accentMul);
      const br1 = this.osc('sawtooth', rootHz * 0.99, t + 0.0018, 0.14, stab, detuneCents * 0.76 + comboPitchCents * 0.26);
      const br2 = this.osc('square', rootHz * 1.99, t + 0.0024, 0.11, edge, detuneCents * 0.92 + comboPitchCents * 0.34);
      br1.frequency.exponentialRampToValueAtTime(rootHz * 0.93, t + 0.13);
      br2.frequency.exponentialRampToValueAtTime(rootHz * 1.86, t + 0.1);
      this.noiseBurst(t + 0.0018, 0.016 + level * 0.006, 0.044, 1720, 1.42, output, accentMul, detuneCents);
      return;
    }

    if (kind === 'flute_breath') {
      const tone = this.envGain(t + 0.0038, 0.038 + level * 0.014, 0.24, output, accentMul);
      const air = this.envGain(t + 0.0028, 0.019 + level * 0.008, 0.15, output, accentMul);
      const fl1 = this.osc('sine', rootHz, t + 0.004, 0.24, tone, detuneCents * 0.44 + comboPitchCents * 0.16);
      const fl2 = this.osc('triangle', rootHz * 2.0, t + 0.006, 0.2, tone, detuneCents * 0.58 + comboPitchCents * 0.22);
      fl1.frequency.exponentialRampToValueAtTime(rootHz * 1.008, t + 0.22);
      fl2.frequency.exponentialRampToValueAtTime(rootHz * 1.93, t + 0.19);
      this.noiseBurst(t + 0.0032, 0.013 + level * 0.005, 0.062, 1280, 0.72, output, accentMul, detuneCents);
      return;
    }

    const felt = this.envGain(t + 0.0022, 0.024 + level * 0.009, 0.2, output, accentMul);
    const feltAir = this.envGain(t + 0.0038, 0.01 + level * 0.005, 0.13, output, accentMul);
    const f1 = this.osc('triangle', rootHz * 0.99, t + 0.0022, 0.22, felt, detuneCents * 0.54 + comboPitchCents * 0.16);
    const f2 = this.osc('sine', rootHz * 1.98, t + 0.0038, 0.14, feltAir, detuneCents * 0.68 + comboPitchCents * 0.24);
    f1.frequency.exponentialRampToValueAtTime(rootHz * 0.972, t + 0.2);
    f2.frequency.exponentialRampToValueAtTime(rootHz * 1.9, t + 0.13);
    this.noiseBurst(t + 0.0022, 0.006 + level * 0.003, 0.05, 2100, 1.35, output, accentMul, detuneCents);
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
    const pianoProfile = this.archerPianoProfile(spatial);
    const pianoScale = Array.isArray(pianoProfile.scale) && pianoProfile.scale.length
      ? pianoProfile.scale
      : [0, 2, 4, 7, 9];
    const pianoStep = pianoScale[
      (Math.max(0, streak - 1) + Math.max(0, Number(pianoProfile.stepOffset) || 0)) % pianoScale.length
    ];
    const pianoRootBase = Math.max(120, Number(pianoProfile.rootHz) || 329.628);
    const harmonySemitone = this.archerHarmonySemitone(spatial);
    const pianoRoot = pianoRootBase * Math.pow(2, (pianoStep + harmonySemitone) / 12);
    const kind = pianoProfile.instrument || 'felt_piano';
    const isNonPianoFamily = kind === 'celesta_bell' || kind === 'clarinet_reed' || kind === 'brass_stab' || kind === 'flute_breath';
    const baseLayerScale = isNonPianoFamily ? 0.24 : 0.44;
    const pianoGainMul = totalGainMul * Math.max(0.2, Number(pianoProfile.gainMul) || 0.62) * baseLayerScale;
    const bodyDecay = Math.max(0.09, Number(pianoProfile.bodyDecay) || 0.19);
    const harmDecay = Math.max(0.08, Number(pianoProfile.harmDecay) || 0.15);
    const airDecay = Math.max(0.04, Number(pianoProfile.airDecay) || 0.052);
    const pianoBody = this.envGain(t + 0.0028, 0.023 + combo * 0.006, bodyDecay, fx.output, pianoGainMul);
    const pianoHarm = this.envGain(t + 0.006, 0.013 + combo * 0.004, harmDecay, fx.output, pianoGainMul);
    const pianoAir = this.envGain(t + 0.001, 0.0065, airDecay, fx.output, pianoGainMul);

    const subOsc = this.osc('sine', 162, t, 0.145, sub, fx.detuneCents * 0.45 + comboPitchCents * 0.24);
    const punchOsc = this.osc('triangle', 306, t + 0.0015, 0.104, punch, fx.detuneCents * 0.7 + comboPitchCents * 0.36);
    const attackOsc = this.osc('square', 430, t, 0.052, attack, fx.detuneCents * 0.92 + comboPitchCents * 0.48);
    const sparkleOsc = this.osc('sine', 1540, t + 0.014, 0.078, sparkle, fx.detuneCents * 0.82 + comboPitchCents * 0.72);
    const pianoBodyOsc = this.osc(
      pianoProfile.bodyWave || 'triangle',
      pianoRoot,
      t + 0.0028,
      0.2,
      pianoBody,
      fx.detuneCents * 0.58 + comboPitchCents * 0.2
    );
    const pianoHarmOsc = this.osc(
      pianoProfile.harmWave || 'sine',
      pianoRoot * 2.01,
      t + 0.006,
      0.16,
      pianoHarm,
      fx.detuneCents * 0.6 + comboPitchCents * 0.3
    );
    const pianoFifthOsc = this.osc(
      pianoProfile.fifthWave || 'sine',
      pianoRoot * 1.5,
      t + 0.004,
      0.13,
      pianoHarm,
      fx.detuneCents * 0.45 + comboPitchCents * 0.16
    );
    const pianoAirOsc = this.osc(
      pianoProfile.airWave || 'sine',
      pianoRoot * 3.02,
      t + 0.001,
      0.07,
      pianoAir,
      fx.detuneCents * 0.72 + comboPitchCents * 0.34
    );

    subOsc.frequency.exponentialRampToValueAtTime(58, t + 0.128);
    punchOsc.frequency.exponentialRampToValueAtTime(116, t + 0.096);
    attackOsc.frequency.exponentialRampToValueAtTime(188, t + 0.05);
    sparkleOsc.frequency.exponentialRampToValueAtTime(760 + combo * 140, t + 0.086);
    pianoBodyOsc.frequency.exponentialRampToValueAtTime(pianoRoot * 0.985, t + 0.185);
    pianoHarmOsc.frequency.exponentialRampToValueAtTime(pianoRoot * 1.95, t + 0.145);
    pianoFifthOsc.frequency.exponentialRampToValueAtTime(pianoRoot * 1.45, t + 0.12);
    pianoAirOsc.frequency.exponentialRampToValueAtTime(pianoRoot * 2.86, t + 0.066);

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
    this.noiseBurst(
      t + 0.002,
      0.008 + combo * 0.002,
      0.044,
      (Number(pianoProfile.clickFreq) || 2550) + combo * 160,
      Math.max(0.4, Number(pianoProfile.clickQ) || 1.9),
      fx.output,
      pianoGainMul,
      fx.detuneCents + comboPitchCents * 0.2
    );
    this.noiseBurst(
      t + 0.01,
      0.0048,
      0.065,
      (Number(pianoProfile.tailFreq) || 1380) + combo * 90,
      0.85,
      fx.output,
      pianoGainMul,
      fx.detuneCents + comboPitchCents * 0.14
    );
    this.playArcherInstrumentAccent(
      pianoProfile,
      pianoRoot,
      t,
      fx.output,
      fx.detuneCents + comboPitchCents * 0.08,
      comboPitchCents,
      combo,
      totalGainMul
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

  playResourceHit(spatial = null, mix = 1) {
    const t = this.ctx.currentTime;
    const fx = this.buildSpatialFx(spatial);
    const gainMul = fx.gainMul * Math.max(0.2, Number(mix) || 1);
    const g1 = this.envGain(t, 0.16, 0.11, fx.output, gainMul);
    const g2 = this.envGain(t + 0.03, 0.12, 0.1, fx.output, gainMul);
    this.osc('sine', 980, t, 0.12, g1, fx.detuneCents * 0.42);
    this.osc('sine', 1320, t + 0.03, 0.11, g2, fx.detuneCents * 0.65);
    this.cleanupNodeLater(fx.cleanup, 0.2);
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

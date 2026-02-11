// ===== Audio Manager =====
// Procedural game audio using Web Audio API. No external files needed.

type OscType = OscillatorType;

class GameAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicNodes: OscillatorNode[] = [];
  private musicPlaying = false;

  // Volume settings
  private _sfxEnabled = true;
  private _musicEnabled = false;
  private _masterVolume = 0.5;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.15;
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  set sfxEnabled(v: boolean) { this._sfxEnabled = v; }
  get sfxEnabled() { return this._sfxEnabled; }

  set musicEnabled(v: boolean) {
    this._musicEnabled = v;
    if (v) this.startMusic();
    else this.stopMusic();
  }
  get musicEnabled() { return this._musicEnabled; }

  set masterVolume(v: number) {
    this._masterVolume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  // --- Sound Effects ---

  private playTone(freq: number, duration: number, type: OscType = 'sine', vol = 0.3) {
    if (!this._sfxEnabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /** Quick chirp for clicks/taps */
  playClick() {
    this.playTone(800, 0.06, 'square', 0.15);
  }

  /** Toggle switch sound */
  playToggle(on: boolean) {
    this.playTone(on ? 1000 : 600, 0.08, 'sine', 0.2);
  }

  /** XP gain - ascending arpeggio */
  playXPGain() {
    if (!this._sfxEnabled) return;
    const ctx = this.getCtx();
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  /** Level up - triumphant fanfare */
  playLevelUp() {
    if (!this._sfxEnabled) return;
    const ctx = this.getCtx();
    const notes = [
      { f: 523, t: 0, d: 0.2 },    // C5
      { f: 659, t: 0.15, d: 0.2 },  // E5
      { f: 784, t: 0.3, d: 0.2 },   // G5
      { f: 1047, t: 0.45, d: 0.4 }, // C6
      { f: 1175, t: 0.55, d: 0.4 }, // D6
      { f: 1318, t: 0.65, d: 0.6 }, // E6
    ];
    notes.forEach(({ f, t: delay, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d);
      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);
      osc.start(t);
      osc.stop(t + d);
    });
  }

  /** Habit complete - satisfying confirmation */
  playHabitComplete() {
    if (!this._sfxEnabled) return;
    const ctx = this.getCtx();
    [660, 880].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  /** Error / warning buzz */
  playError() {
    if (!this._sfxEnabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  /** Navigation / page transition whoosh */
  playNavigate() {
    if (!this._sfxEnabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain || ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // --- Ambient Music ---

  startMusic() {
    if (this.musicPlaying || !this._musicEnabled) return;
    const ctx = this.getCtx();
    this.musicPlaying = true;

    // Create a low ambient drone with slow modulation
    const chordNotes = [65.41, 98.0, 130.81, 196.0]; // C2, G2, C3, G3
    chordNotes.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slow vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.3 + Math.random() * 0.2;
      lfoGain.gain.value = 2;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 1;

      osc.connect(filter);
      filter.connect(this.musicGain || ctx.destination);
      osc.start();

      this.musicNodes.push(osc);
    });
  }

  stopMusic() {
    this.musicPlaying = false;
    this.musicNodes.forEach((osc) => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    this.musicNodes = [];
  }

  dispose() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton
export const audioManager = typeof window !== 'undefined'
  ? new GameAudioManager()
  : (null as unknown as GameAudioManager);

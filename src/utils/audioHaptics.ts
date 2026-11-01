// Float Web Audio Micro-Haptics Engine
// Pure synthetic audio - 0 audio assets, 0ms network latency

export type SoundProfile = 'thock' | 'crisp' | 'bubble' | 'silent';

const SOUND_PROFILE_KEY = 'float_sound_profile';

class AudioHapticsEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public profile: SoundProfile = 'thock';

  constructor() {
    try {
      const saved = localStorage.getItem(SOUND_PROFILE_KEY) as SoundProfile | null;
      if (saved && ['thock', 'crisp', 'bubble', 'silent'].includes(saved)) {
        this.profile = saved;
        this.enabled = saved !== 'silent';
      }
    } catch {}
  }

  public setProfile(newProfile: SoundProfile): void {
    this.profile = newProfile;
    this.enabled = newProfile !== 'silent';
    try {
      localStorage.setItem(SOUND_PROFILE_KEY, newProfile);
    } catch {}
    if (this.enabled) {
      this.playCheck();
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || this.profile === 'silent') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Checkmark celebration pop
  public playCheck(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;

      if (this.profile === 'thock') {
        // Deep mechanical switch bottom-out
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.05);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
      } else if (this.profile === 'bubble') {
        // Organic water drop pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.06);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.start(now);
        osc.stop(now + 0.06);
      } else {
        // Crisp metallic click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(1250, now + 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {}
  }

  // Soft low uncheck tap
  public playUncheck(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  // Celebratory ascending chime
  public playSuccess(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [
        { freq: 587.33, start: 0, dur: 0.12 }, // D5
        { freq: 880.0, start: 0.08, dur: 0.16 }, // A5
      ].forEach(tone => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(tone.freq, now + tone.start);

        gain.gain.setValueAtTime(0.06, now + tone.start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.dur);

        osc.start(now + tone.start);
        osc.stop(now + tone.start + tone.dur);
      });
    } catch {}
  }

  // Tactile button / key click
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (this.profile === 'thock') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.022);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
        osc.start(now);
        osc.stop(now + 0.022);
      } else if (this.profile === 'bubble') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.02);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.016);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);
        osc.start(now);
        osc.stop(now + 0.016);
      }
    } catch {}
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.profile = 'thock';
      this.playCheck();
    } else {
      this.profile = 'silent';
    }
    try {
      localStorage.setItem(SOUND_PROFILE_KEY, this.profile);
    } catch {}
    return this.enabled;
  }
}

export const haptics = new AudioHapticsEngine();

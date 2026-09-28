import { type Note, RECIPES, type SoundName } from './sounds';

export interface SoundEngine {
  /** Browsers only allow audio after a user gesture; call from a click/keydown. */
  unlock(): void;
  play(name: SoundName): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  readonly ready: boolean;
  dispose(): void;
}

export interface SoundEngineOptions {
  createContext?: () => AudioContext;
  volume?: number;
  muted?: boolean;
}

export const createSoundEngine = ({
  createContext = () => new AudioContext(),
  volume = 0.6,
  muted = false,
}: SoundEngineOptions = {}): SoundEngine => {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let noiseBuffer: AudioBuffer | null = null;
  let vol = volume;
  let mute = muted;

  const applyGain = (): void => {
    if (master) master.gain.value = mute ? 0 : vol;
  };

  const getNoise = (c: AudioContext): AudioBuffer => {
    if (!noiseBuffer) {
      noiseBuffer = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  };

  const playNote = (c: AudioContext, out: GainNode, n: Note): void => {
    const start = c.currentTime + (n.delay ?? 0);
    const end = start + n.duration;
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(n.gain ?? 0.2, start + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, end);
    env.connect(out);
    if (n.noise) {
      const src = c.createBufferSource();
      src.buffer = getNoise(c);
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = n.freq;
      src.connect(filter);
      filter.connect(env);
      src.start(start);
      src.stop(end);
      return;
    }
    const osc = c.createOscillator();
    osc.type = n.type ?? 'sine';
    osc.frequency.setValueAtTime(n.freq, start);
    if (n.slideTo) osc.frequency.exponentialRampToValueAtTime(n.slideTo, end);
    osc.connect(env);
    osc.start(start);
    osc.stop(end + 0.02);
  };

  return {
    get ready() {
      return ctx !== null;
    },
    unlock: () => {
      if (ctx) {
        if (ctx.state === 'suspended') void ctx.resume();
        return;
      }
      try {
        ctx = createContext();
        master = ctx.createGain();
        master.connect(ctx.destination);
        applyGain();
      } catch {
        ctx = null; // Audio unsupported: the game stays silent rather than failing.
      }
    },
    play: (name) => {
      if (!ctx || !master || mute) return;
      for (const n of RECIPES[name]) playNote(ctx, master, n);
    },
    setVolume: (v) => {
      vol = Math.min(1, Math.max(0, v));
      applyGain();
    },
    setMuted: (m) => {
      mute = m;
      applyGain();
    },
    dispose: () => {
      void ctx?.close();
      ctx = null;
      master = null;
    },
  };
};

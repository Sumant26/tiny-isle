import type { MusicTrackId, Weather } from '../core/types';
import { type Note, RECIPES, type SoundName } from './sounds';

export type TimeOfDay = 'day' | 'dusk' | 'night';

export interface SoundEngine {
  /** Browsers only allow audio after a user gesture; call from a click/keydown. */
  unlock(): void;
  play(name: SoundName): void;
  setVolume(volume: number): void;
  setMusicVolume(volume: number): void;
  setMuted(muted: boolean): void;
  setAmbience(weather: Weather, timeOfDay: TimeOfDay): void;
  setMusicTrack(track: MusicTrackId): void;
  readonly ready: boolean;
  dispose(): void;
}

export interface SoundEngineOptions {
  createContext?: () => AudioContext;
  volume?: number;
  musicVolume?: number;
  muted?: boolean;
}

export const createSoundEngine = ({
  createContext = () => new AudioContext(),
  volume = 0.6,
  musicVolume = 0.4,
  muted = false,
}: SoundEngineOptions = {}): SoundEngine => {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let musicGain: GainNode | null = null;
  let ambientGain: GainNode | null = null;
  let noiseBuffer: AudioBuffer | null = null;
  let vol = volume;
  let musicVol = musicVolume;
  let mute = muted;

  let currentTrack: MusicTrackId = 'morning_breeze';
  let musicInterval: ReturnType<typeof setInterval> | null = null;
  let cricketInterval: ReturnType<typeof setInterval> | null = null;
  let rainSource: AudioBufferSourceNode | null = null;
  let rainFilter: BiquadFilterNode | null = null;
  let currentWeather: Weather = 'clear';
  let currentTimeOfDay: TimeOfDay = 'day';

  const applyGain = (): void => {
    if (master) master.gain.value = mute ? 0 : vol;
    if (musicGain) musicGain.gain.value = mute ? 0 : musicVol;
    if (ambientGain) ambientGain.gain.value = mute ? 0 : vol * 0.5;
  };

  const getNoise = (c: AudioContext): AudioBuffer => {
    if (!noiseBuffer) {
      noiseBuffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-like smooth noise
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
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

  // Scales for tracks
  const SCALES: Record<MusicTrackId, readonly number[]> = {
    morning_breeze: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99],
    lofi_rain: [220.0, 261.63, 293.66, 311.13, 349.23, 392.0, 440.0, 523.25],
    warm_hearth: [196.0, 246.94, 293.66, 329.63, 392.0, 493.88, 587.33],
    off: [],
  };

  const startGenerativeMusic = (): void => {
    if (musicInterval) return;
    let step = 0;
    musicInterval = setInterval(() => {
      if (!ctx || !musicGain || mute || musicVol <= 0 || currentTrack === 'off') return;
      step++;
      const scale = SCALES[currentTrack];
      if (scale.length === 0) return;

      if (step % 2 === 0) {
        const freq = scale[Math.floor(Math.random() * scale.length)] ?? 261.63;
        const duration = currentTrack === 'lofi_rain' ? 1.6 : 1.2 + Math.random() * 0.8;
        const type: OscillatorType = currentTrack === 'warm_hearth' ? 'triangle' : 'sine';
        playNote(ctx, musicGain, {
          freq,
          duration,
          type,
          gain: currentTrack === 'lofi_rain' ? 0.045 : 0.06,
        });
      }
    }, 1400);
  };

  const updateAmbienceAudio = (): void => {
    if (!ctx || !ambientGain) return;

    // Rain noise loop
    if (currentWeather === 'rain') {
      if (!rainSource) {
        try {
          rainSource = ctx.createBufferSource();
          rainSource.buffer = getNoise(ctx);
          rainSource.loop = true;
          rainFilter = ctx.createBiquadFilter();
          rainFilter.type = 'lowpass';
          rainFilter.frequency.value = 800;
          rainSource.connect(rainFilter);
          rainFilter.connect(ambientGain);
          rainSource.start();
        } catch {
          // ignore if unavailable
        }
      }
    } else {
      if (rainSource) {
        try {
          rainSource.stop();
          rainSource.disconnect();
        } catch {
          // ignore
        }
        rainSource = null;
        rainFilter = null;
      }
    }

    // Crickets at dusk / night
    if (currentTimeOfDay === 'dusk' || currentTimeOfDay === 'night') {
      cricketInterval ??= setInterval(() => {
        if (!ctx || !ambientGain || mute) return;
        // Cricket chirp
        playNote(ctx, ambientGain, {
          freq: 4600,
          duration: 0.04,
          type: 'sine',
          gain: 0.025,
        });
        playNote(ctx, ambientGain, {
          freq: 4800,
          duration: 0.04,
          delay: 0.05,
          type: 'sine',
          gain: 0.025,
        });
      }, 2200);
    } else {
      if (cricketInterval) {
        clearInterval(cricketInterval);
        cricketInterval = null;
      }
    }
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
        musicGain = ctx.createGain();
        ambientGain = ctx.createGain();

        master.connect(ctx.destination);
        musicGain.connect(master);
        ambientGain.connect(master);

        applyGain();
        startGenerativeMusic();
        updateAmbienceAudio();
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
    setMusicVolume: (v) => {
      musicVol = Math.min(1, Math.max(0, v));
      applyGain();
    },
    setMuted: (m) => {
      mute = m;
      applyGain();
    },
    setAmbience: (weather, timeOfDay) => {
      currentWeather = weather;
      currentTimeOfDay = timeOfDay;
      updateAmbienceAudio();
    },
    setMusicTrack: (t) => {
      currentTrack = t;
    },
    dispose: () => {
      if (musicInterval) clearInterval(musicInterval);
      if (cricketInterval) clearInterval(cricketInterval);
      if (rainSource) {
        try {
          rainSource.stop();
        } catch {
          // ignore
        }
      }
      void ctx?.close();
      ctx = null;
      master = null;
      musicGain = null;
      ambientGain = null;
    },
  };
};

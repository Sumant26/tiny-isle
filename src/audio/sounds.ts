import type { GameEvent } from '../core/types';

export type SoundName =
  | 'till'
  | 'plant'
  | 'water'
  | 'harvest'
  | 'coin'
  | 'buy'
  | 'reject'
  | 'levelup'
  | 'visitor'
  | 'sleep'
  | 'click'
  | 'purr'
  | 'cook'
  | 'fish_bite'
  | 'fish_catch'
  | 'achievement'
  | 'expand'
  | 'forage'
  | 'gift'
  | 'needle'
  | 'bark'
  | 'quack';

export interface Note {
  /** Hz */
  readonly freq: number;
  /** Seconds */
  readonly duration: number;
  readonly delay?: number;
  readonly type?: OscillatorType;
  readonly gain?: number;
  /** Glide to this frequency over the note. */
  readonly slideTo?: number;
  /** Use filtered noise instead of an oscillator. */
  readonly noise?: boolean;
}

/** Every sound is a tiny synth recipe, so there are no audio files to license or load. */
export const RECIPES: Readonly<Record<SoundName, readonly Note[]>> = {
  till: [{ freq: 300, duration: 0.12, noise: true, gain: 0.25 }],
  plant: [
    { freq: 520, duration: 0.08, type: 'sine', gain: 0.2 },
    { freq: 780, duration: 0.1, delay: 0.06, type: 'sine', gain: 0.15 },
  ],
  water: [{ freq: 1800, duration: 0.35, noise: true, gain: 0.12 }],
  harvest: [
    { freq: 440, duration: 0.09, type: 'triangle', gain: 0.25, slideTo: 880 },
    { freq: 880, duration: 0.12, delay: 0.08, type: 'sine', gain: 0.18 },
  ],
  coin: [
    { freq: 988, duration: 0.07, type: 'square', gain: 0.08 },
    { freq: 1319, duration: 0.18, delay: 0.07, type: 'square', gain: 0.08 },
  ],
  buy: [
    { freq: 660, duration: 0.08, type: 'triangle', gain: 0.2 },
    { freq: 990, duration: 0.14, delay: 0.07, type: 'triangle', gain: 0.18 },
  ],
  reject: [{ freq: 240, duration: 0.14, type: 'sine', gain: 0.18, slideTo: 180 }],
  levelup: [
    { freq: 523, duration: 0.12, type: 'triangle', gain: 0.2 },
    { freq: 659, duration: 0.12, delay: 0.1, type: 'triangle', gain: 0.2 },
    { freq: 784, duration: 0.12, delay: 0.2, type: 'triangle', gain: 0.2 },
    { freq: 1047, duration: 0.3, delay: 0.3, type: 'sine', gain: 0.2 },
  ],
  visitor: [
    { freq: 784, duration: 0.1, type: 'sine', gain: 0.18 },
    { freq: 988, duration: 0.16, delay: 0.1, type: 'sine', gain: 0.18 },
  ],
  sleep: [
    { freq: 392, duration: 0.5, type: 'sine', gain: 0.15 },
    { freq: 330, duration: 0.6, delay: 0.35, type: 'sine', gain: 0.12 },
  ],
  click: [{ freq: 1200, duration: 0.03, type: 'sine', gain: 0.1 }],
  purr: [
    { freq: 90, duration: 0.2, type: 'triangle', gain: 0.15 },
    { freq: 110, duration: 0.2, delay: 0.15, type: 'sine', gain: 0.12 },
    { freq: 95, duration: 0.25, delay: 0.3, type: 'triangle', gain: 0.1 },
  ],
  cook: [
    { freq: 600, duration: 0.2, noise: true, gain: 0.15 },
    { freq: 880, duration: 0.1, delay: 0.15, type: 'sine', gain: 0.2 },
    { freq: 1174, duration: 0.25, delay: 0.25, type: 'triangle', gain: 0.22 },
  ],
  fish_bite: [
    { freq: 350, duration: 0.08, type: 'sine', gain: 0.25, slideTo: 180 },
    { freq: 1200, duration: 0.15, delay: 0.05, noise: true, gain: 0.18 },
  ],
  fish_catch: [
    { freq: 523, duration: 0.1, type: 'sine', gain: 0.2 },
    { freq: 659, duration: 0.12, delay: 0.08, type: 'sine', gain: 0.2 },
    { freq: 784, duration: 0.15, delay: 0.16, type: 'triangle', gain: 0.22 },
    { freq: 1046, duration: 0.3, delay: 0.26, type: 'triangle', gain: 0.25 },
  ],
  achievement: [
    { freq: 587, duration: 0.15, type: 'triangle', gain: 0.2 },
    { freq: 740, duration: 0.15, delay: 0.12, type: 'triangle', gain: 0.2 },
    { freq: 880, duration: 0.18, delay: 0.24, type: 'triangle', gain: 0.22 },
    { freq: 1174, duration: 0.45, delay: 0.38, type: 'sine', gain: 0.25 },
  ],
  expand: [
    { freq: 261, duration: 0.2, type: 'triangle', gain: 0.2 },
    { freq: 329, duration: 0.25, delay: 0.15, type: 'triangle', gain: 0.2 },
    { freq: 392, duration: 0.3, delay: 0.3, type: 'sine', gain: 0.25 },
    { freq: 523, duration: 0.5, delay: 0.45, type: 'sine', gain: 0.25 },
  ],
  forage: [
    { freq: 659, duration: 0.08, type: 'sine', gain: 0.22 },
    { freq: 988, duration: 0.14, delay: 0.06, type: 'sine', gain: 0.25 },
  ],
  gift: [
    { freq: 440, duration: 0.12, type: 'triangle', gain: 0.2 },
    { freq: 554, duration: 0.12, delay: 0.08, type: 'triangle', gain: 0.2 },
    { freq: 659, duration: 0.15, delay: 0.16, type: 'sine', gain: 0.22 },
    { freq: 880, duration: 0.3, delay: 0.24, type: 'sine', gain: 0.25 },
  ],
  needle: [
    { freq: 800, duration: 0.04, noise: true, gain: 0.1 },
    { freq: 300, duration: 0.05, delay: 0.03, type: 'sine', gain: 0.08 },
  ],
  bark: [
    { freq: 350, duration: 0.07, type: 'triangle', gain: 0.22, slideTo: 220 },
    { freq: 380, duration: 0.09, delay: 0.08, type: 'triangle', gain: 0.22, slideTo: 240 },
  ],
  quack: [
    { freq: 420, duration: 0.1, type: 'sawtooth', gain: 0.14, slideTo: 320 },
    { freq: 400, duration: 0.12, delay: 0.1, type: 'sawtooth', gain: 0.12, slideTo: 300 },
  ],
};

export const soundForEvent = (event: GameEvent): SoundName | null => {
  switch (event.type) {
    case 'tilled':
      return 'till';
    case 'planted':
      return 'plant';
    case 'watered':
      return 'water';
    case 'harvested':
    case 'orchard-harvested':
      return 'harvest';
    case 'sold':
    case 'visitor-helped':
      return 'coin';
    case 'bought-seeds':
    case 'bought-decoration':
    case 'pet-adopted':
      return 'buy';
    case 'plot-expanded':
    case 'islet-unlocked':
      return 'expand';
    case 'cooked':
    case 'cottage-activity':
    case 'meal-eaten':
    case 'fish-eaten':
      return 'cook';
    case 'fish-caught':
      return 'fish_catch';
    case 'pet-cat':
      return 'purr';
    case 'pet-interacted':
      return event.pet === 'puppy' ? 'bark' : event.pet === 'duckling' ? 'quack' : 'purr';
    case 'foraged':
      return 'forage';
    case 'visitor-gifted':
      return 'gift';
    case 'music-track-changed':
      return 'needle';
    case 'achievement-unlocked':
      return 'achievement';
    case 'rejected':
      return 'reject';
    case 'bloom-level-up':
      return 'levelup';
    case 'visitor-arrived':
      return 'visitor';
    case 'day-started':
    case 'moved':
    case 'crop-unlocked':
    case 'journal-entry':
      return null;
  }
};

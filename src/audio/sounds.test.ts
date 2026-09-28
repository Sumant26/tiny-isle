import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../core/types';
import { RECIPES, soundForEvent } from './sounds';

describe('soundForEvent', () => {
  it.each<[GameEvent, string | null]>([
    [{ type: 'tilled', index: 0 }, 'till'],
    [{ type: 'planted', index: 0, crop: 'carrot' }, 'plant'],
    [{ type: 'watered', index: 0 }, 'water'],
    [{ type: 'harvested', index: 0, crop: 'carrot' }, 'harvest'],
    [{ type: 'sold', crop: 'carrot', quantity: 1, coins: 5 }, 'coin'],
    [{ type: 'visitor-helped', visitor: 'hazel', unlocked: null }, 'coin'],
    [{ type: 'bought-seeds', crop: 'carrot', quantity: 1 }, 'buy'],
    [{ type: 'bought-decoration', decoration: 'bench' }, 'buy'],
    [{ type: 'rejected', reason: 'locked' }, 'reject'],
    [{ type: 'bloom-level-up', level: 1 }, 'levelup'],
    [{ type: 'visitor-arrived', visitor: 'hazel' }, 'visitor'],
    [{ type: 'day-started', day: 2, weather: 'clear' }, null],
    [{ type: 'moved', to: { x: 1, z: 1 } }, null],
    [{ type: 'crop-unlocked', crop: 'tomato' }, null],
  ])('%j -> %s', (event, sound) => {
    expect(soundForEvent(event)).toBe(sound);
  });

  it('every recipe has at least one valid note', () => {
    for (const notes of Object.values(RECIPES)) {
      expect(notes.length).toBeGreaterThan(0);
      for (const n of notes) {
        expect(n.freq).toBeGreaterThan(0);
        expect(n.duration).toBeGreaterThan(0);
      }
    }
  });
});

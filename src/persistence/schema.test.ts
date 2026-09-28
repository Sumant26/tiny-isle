import { describe, expect, it } from 'vitest';
import { makeState } from '../test/fixtures';
import { validateState } from './schema';

const corrupt = (patch: Record<string, unknown>) => ({ ...makeState(), ...patch });

describe('validateState', () => {
  it('accepts a valid state', () => {
    const s = makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } });
    expect(validateState(JSON.parse(JSON.stringify(s)))).toEqual({ ok: true, value: s });
  });

  it('rejects non-objects', () => {
    expect(validateState(null).ok).toBe(false);
    expect(validateState([]).ok).toBe(false);
    expect(validateState('x').ok).toBe(false);
  });

  it.each([
    ['day', { day: 0 }],
    ['coins', { coins: -1 }],
    ['coins', { coins: 1.5 }],
    ['plot', { plot: { width: 2, height: 2, tiles: [] } }],
    [
      'plot',
      { plot: { width: 1, height: 1, tiles: [{ tilled: 'yes', watered: false, crop: null }] } },
    ],
    [
      'plot',
      {
        plot: {
          width: 1,
          height: 1,
          tiles: [{ tilled: true, watered: false, crop: { id: 'kale', growth: 0 } }],
        },
      },
    ],
    ['player', { player: { x: 'a', z: 1 } }],
    ['selectedTool', { selectedTool: 'axe' }],
    ['selectedSeed', { selectedSeed: 'kale' }],
    ['inventory', { inventory: { seeds: {}, produce: {} } }],
    ['unlockedCrops', { unlockedCrops: ['kale'] }],
    ['decorations', { decorations: ['statue'] }],
    ['bloom', { bloom: -3 }],
    ['visitor', { visitor: { id: 'bob', arrivedOnDay: 1 } }],
    ['visitorsHelped', { visitorsHelped: ['bob'] }],
    ['weather', { weather: 'snow' }],
    ['rngSeed', { rngSeed: -1 }],
    ['settings', { settings: { muted: false, volume: 2 } }],
    ['stats', { stats: { harvested: 0 } }],
  ])('rejects a bad %s', (field, patch) => {
    expect(validateState(corrupt(patch))).toEqual({ ok: false, error: `invalid field: ${field}` });
  });
});

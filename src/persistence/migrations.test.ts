import { describe, expect, it } from 'vitest';
import { migrate, SAVE_VERSION } from './migrations';

describe('migrate', () => {
  it('is a no-op for the current version', () => {
    const s = { a: 1 };
    expect(migrate(s, SAVE_VERSION)).toEqual({ ok: true, value: s });
  });

  it('applies migrations in order', () => {
    const r = migrate({ n: 1 }, 1, 3, {
      1: (s) => ({ ...s, n: (s.n as number) + 1, v2: true }),
      2: (s) => ({ ...s, n: (s.n as number) * 10 }),
    });
    expect(r).toEqual({ ok: true, value: { n: 20, v2: true } });
  });

  it('migrates v1 save to v2 save', () => {
    const v1State = {
      day: 1,
      coins: 20,
      plot: { width: 6, height: 4, tiles: [] },
      player: { x: 7, z: 9 },
      selectedTool: 'hoe',
      selectedSeed: 'carrot',
      inventory: { seeds: { carrot: 6 }, produce: {} },
      unlockedCrops: ['carrot'],
      decorations: [],
      bloom: 0,
      visitor: null,
      visitorsHelped: [],
      weather: 'clear',
      rngSeed: 1234,
      settings: { muted: false, volume: 0.6 },
      stats: { harvested: 0, earned: 0 },
    };
    const result = migrate(v1State, 1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.season).toBe('spring');
      expect(result.value.achievements).toEqual([]);
      expect(result.value.journal).toEqual(['Arrived on the peaceful Tiny Isle.']);
      expect((result.value.settings as Record<string, unknown>).highContrast).toBe(false);
      expect(result.value.currentOutfit).toBe('classic');
      expect(result.value.currentHat).toBe('straw_hat');
    }
  });

  it('migrates v3 save to v4 save', () => {
    const v3State = {
      day: 5,
      coins: 100,
      stats: { harvested: 10, earned: 80 },
    };
    const result = migrate(v3State, 3);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.currentOutfit).toBe('classic');
      expect(result.value.currentHat).toBe('straw_hat');
      expect(result.value.honeyJars).toBe(0);
      expect(result.value.campfireLit).toBe(false);
      expect((result.value.stats as Record<string, unknown>).ordersServed).toBe(0);
    }
  });

  it('fails on missing migrations, bad versions and future saves', () => {
    expect(migrate({}, 1, 2, {})).toEqual({ ok: false, error: 'no migration from v1' });
    expect(migrate({}, 0).ok).toBe(false);
    expect(migrate({}, 1.5).ok).toBe(false);
    expect(migrate({}, SAVE_VERSION + 1)).toEqual({
      ok: false,
      error: 'save is from a newer version of the game',
    });
  });
});

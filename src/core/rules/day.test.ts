import { describe, expect, it } from 'vitest';
import { BALANCE } from '../config';
import { makeState, seedWhereFirstRoll, withTile } from '../../test/fixtures';
import { growOvernight, sleep } from './day';

const clearSeed = seedWhereFirstRoll((v) => v >= BALANCE.rainChance);
const rainSeed = seedWhereFirstRoll((v) => v < BALANCE.rainChance);

describe('growOvernight', () => {
  it('grows watered crops and dries the soil', () => {
    const t = growOvernight({ tilled: true, watered: true, crop: { id: 'carrot', growth: 0 } });
    expect(t).toEqual({ tilled: true, watered: false, crop: { id: 'carrot', growth: 1 } });
  });

  it('does not grow dry crops (same reference)', () => {
    const tile = { tilled: true, watered: false, crop: { id: 'carrot' as const, growth: 0 } };
    expect(growOvernight(tile)).toBe(tile);
  });

  it('does not grow past ripe', () => {
    const t = growOvernight({ tilled: true, watered: true, crop: { id: 'carrot', growth: 2 } });
    expect(t.crop?.growth).toBe(2);
  });

  it('dries empty watered soil', () => {
    expect(growOvernight({ tilled: true, watered: true, crop: null }).watered).toBe(false);
  });
});

describe('sleep', () => {
  it('advances the day and grows watered crops on a clear morning', () => {
    const s = withTile(makeState({ rngSeed: clearSeed }), 0, {
      tilled: true,
      watered: true,
      crop: { id: 'carrot', growth: 0 },
    });
    const r = sleep(s);
    expect(r.state.day).toBe(2);
    expect(r.state.weather).toBe('clear');
    expect(r.state.plot.tiles[0]).toEqual({
      tilled: true,
      watered: false,
      crop: { id: 'carrot', growth: 1 },
    });
    expect(r.state.rngSeed).not.toBe(s.rngSeed);
    expect(r.events[0]).toEqual({
      type: 'day-started',
      day: 2,
      weather: 'clear',
      season: 'spring',
    });
  });

  it('rain waters every tilled tile in the morning', () => {
    const s = withTile(withTile(makeState({ rngSeed: rainSeed }), 0, { tilled: true }), 1, {});
    const r = sleep(s);
    expect(r.state.weather).toBe('rain');
    expect(r.state.plot.tiles[0]?.watered).toBe(true);
    expect(r.state.plot.tiles[1]?.watered).toBe(false);
  });

  it('is deterministic for the same state', () => {
    const s = makeState({ rngSeed: 777 });
    expect(sleep(s)).toEqual(sleep(s));
  });
});

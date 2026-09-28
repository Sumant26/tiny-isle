import { describe, expect, it } from 'vitest';
import { BALANCE, CROP_IDS } from './config';
import { createInitialState, emptyCounts } from './initialState';
import { LAYOUT } from './world';

describe('createInitialState', () => {
  it('starts a cozy new game', () => {
    const s = createInitialState(1);
    expect(s.day).toBe(1);
    expect(s.coins).toBe(BALANCE.startingCoins);
    expect(s.plot.tiles).toHaveLength(BALANCE.plotWidth * BALANCE.plotHeight);
    expect(s.player).toEqual(LAYOUT.playerStart);
    expect(s.inventory.seeds.carrot).toBe(6);
    expect(s.unlockedCrops).toEqual(['carrot']);
    expect(s.rngSeed).toBe(1);
  });

  it('uses a random seed by default', () => {
    expect(Number.isInteger(createInitialState().rngSeed)).toBe(true);
  });

  it('emptyCounts has every crop at zero', () => {
    const c = emptyCounts();
    for (const id of CROP_IDS) expect(c[id]).toBe(0);
  });
});

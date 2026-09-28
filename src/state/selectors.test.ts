import { describe, expect, it } from 'vitest';
import { makeState, withProduce } from '../test/fixtures';
import * as sel from './selectors';

describe('selectors', () => {
  it('read simple slices', () => {
    const s = makeState();
    expect(sel.selectCoins(s)).toBe(20);
    expect(sel.selectDay(s)).toBe(1);
    expect(sel.selectWeather(s)).toBe('clear');
    expect(sel.selectPlot(s)).toBe(s.plot);
    expect(sel.selectTiles(s)).toBe(s.plot.tiles);
    expect(sel.selectPlayer(s)).toBe(s.player);
    expect(sel.selectTool(s)).toBe('hoe');
    expect(sel.selectSeed(s)).toBe('carrot');
    expect(sel.selectSettings(s)).toBe(s.settings);
    expect(sel.selectDecorations(s)).toBe(s.decorations);
    expect(sel.selectVisitor(s)).toBeNull();
    expect(sel.selectInventory(s)).toBe(s.inventory);
    expect(sel.selectUnlocked(s)).toBe(s.unlockedCrops);
    expect(sel.selectBloomPoints(s)).toBe(0);
    expect(sel.selectSeedCount(s, 'carrot')).toBe(6);
  });

  it('derives bloom info', () => {
    expect(sel.selectBloomLevel(makeState({ bloom: 30 }))).toBe(2);
    expect(sel.selectBloomInfo(makeState({ bloom: 5 }))).toEqual({
      level: 0,
      name: 'Quiet',
      progress: 0.5,
    });
  });

  it('derives produce totals and value', () => {
    const s = withProduce(withProduce(makeState(), 'carrot', 2), 'pumpkin', 1);
    expect(sel.selectProduceTotal(s)).toBe(3);
    expect(sel.selectProduceValue(s)).toBe(42);
  });

  it('checks affordability', () => {
    const s = makeState({ coins: 10 });
    expect(sel.selectCanAffordSeeds(s, 'carrot', 5)).toBe(true);
    expect(sel.selectCanAffordSeeds(s, 'carrot', 6)).toBe(false);
    expect(sel.selectCanAffordDecoration(s, 'flowerbed')).toBe(false);
  });

  it('describes the current visitor', () => {
    expect(sel.selectVisitorInfo(makeState())).toBeNull();
    const s = withProduce(makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } }), 'carrot', 3);
    expect(sel.selectVisitorInfo(s)).toMatchObject({
      crop: 'carrot',
      quantity: 3,
      have: 3,
      canFulfill: true,
    });
  });
});

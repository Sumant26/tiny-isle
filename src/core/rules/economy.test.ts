import { describe, expect, it } from 'vitest';
import { makeState, unlockAll, withProduce } from '../../test/fixtures';
import { buyDecoration, buySeeds, sell, sellAll } from './economy';

describe('sell', () => {
  it('sells produce for coins and tracks earnings', () => {
    const r = sell(withProduce(makeState({ coins: 0 }), 'carrot', 3), 'carrot', 2);
    expect(r.state.coins).toBe(10);
    expect(r.state.inventory.produce.carrot).toBe(1);
    expect(r.state.stats.earned).toBe(10);
    expect(r.events).toEqual([{ type: 'sold', crop: 'carrot', quantity: 2, coins: 10 }]);
  });

  it('rejects selling more than you have or silly quantities', () => {
    const s = withProduce(makeState(), 'carrot', 1);
    expect(sell(s, 'carrot', 2).state).toBe(s);
    expect(sell(s, 'carrot', 0).events[0]).toMatchObject({ reason: 'not-enough-produce' });
    expect(sell(s, 'carrot', 0.5).events[0]).toMatchObject({ reason: 'not-enough-produce' });
  });
});

describe('sellAll', () => {
  it('sells every kind of produce', () => {
    const s = withProduce(withProduce(makeState({ coins: 0 }), 'carrot', 2), 'tomato', 1);
    const r = sellAll(s);
    expect(r.state.coins).toBe(16);
    expect(r.events).toHaveLength(2);
  });

  it('rejects when there is nothing to sell', () => {
    expect(sellAll(makeState()).events[0]).toMatchObject({ reason: 'not-enough-produce' });
  });
});

describe('buySeeds', () => {
  it('buys seeds', () => {
    const r = buySeeds(makeState({ coins: 10 }), 'carrot', 3);
    expect(r.state.coins).toBe(4);
    expect(r.state.inventory.seeds.carrot).toBe(9);
    expect(r.events).toEqual([{ type: 'bought-seeds', crop: 'carrot', quantity: 3 }]);
  });

  it('rejects locked crops, bad quantities and insufficient coins', () => {
    expect(buySeeds(makeState(), 'pumpkin', 1).events[0]).toMatchObject({ reason: 'locked' });
    expect(buySeeds(makeState(), 'carrot', 0).events[0]).toMatchObject({
      reason: 'not-enough-coins',
    });
    expect(buySeeds(unlockAll(makeState({ coins: 5 })), 'pumpkin', 1).events[0]).toMatchObject({
      reason: 'not-enough-coins',
    });
  });
});

describe('buyDecoration', () => {
  it('buys a decoration and adds its bloom', () => {
    const r = buyDecoration(makeState({ coins: 100 }), 'bench');
    expect(r.state.coins).toBe(70);
    expect(r.state.decorations).toEqual(['bench']);
    expect(r.state.bloom).toBe(3);
    expect(r.events[0]).toEqual({ type: 'bought-decoration', decoration: 'bench' });
  });

  it('rejects duplicates and insufficient coins', () => {
    const owned = makeState({ coins: 100, decorations: ['bench'] });
    expect(buyDecoration(owned, 'bench').events[0]).toMatchObject({ reason: 'already-owned' });
    expect(buyDecoration(makeState({ coins: 1 }), 'gnome').events[0]).toMatchObject({
      reason: 'not-enough-coins',
    });
  });
});

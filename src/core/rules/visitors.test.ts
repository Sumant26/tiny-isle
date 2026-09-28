import { describe, expect, it } from 'vitest';
import { BALANCE } from '../config';
import { makeState, seedWhereFirstRoll, unlockAll, withProduce } from '../../test/fixtures';
import {
  fulfillVisitor,
  GIFT_SEEDS,
  maybeVisitorArrives,
  nextEligibleVisitor,
  visitorDef,
} from './visitors';

const arriveSeed = seedWhereFirstRoll((v) => v < BALANCE.visitorChance);
const staySeed = seedWhereFirstRoll((v) => v >= BALANCE.visitorChance);

describe('visitorDef', () => {
  it('looks up visitors and throws on unknown ids', () => {
    expect(visitorDef('hazel').wants.crop).toBe('carrot');
    expect(() => visitorDef('nobody' as never)).toThrow(/Unknown visitor/);
  });
});

describe('nextEligibleVisitor', () => {
  it('picks the first unhelped visitor whose crop is unlocked', () => {
    expect(nextEligibleVisitor(makeState())?.id).toBe('hazel');
    expect(nextEligibleVisitor(makeState({ visitorsHelped: ['hazel'] }))).toBeNull();
    expect(nextEligibleVisitor(unlockAll(makeState({ visitorsHelped: ['hazel'] })))?.id).toBe(
      'pip',
    );
  });
});

describe('maybeVisitorArrives', () => {
  it('stays quiet on the first day', () => {
    const s = makeState({ day: 1, rngSeed: arriveSeed });
    expect(maybeVisitorArrives(s).state).toBe(s);
  });

  it('does nothing when a visitor is already here or nobody is eligible', () => {
    const here = makeState({ day: 3, visitor: { id: 'hazel', arrivedOnDay: 2 } });
    expect(maybeVisitorArrives(here).state).toBe(here);
    const none = makeState({ day: 3, visitorsHelped: ['hazel', 'pip', 'moss'] });
    expect(maybeVisitorArrives(none).state).toBe(none);
  });

  it('brings a visitor when the roll succeeds', () => {
    const r = maybeVisitorArrives(makeState({ day: 2, rngSeed: arriveSeed }));
    expect(r.state.visitor).toEqual({ id: 'hazel', arrivedOnDay: 2 });
    expect(r.events).toEqual([{ type: 'visitor-arrived', visitor: 'hazel' }]);
  });

  it('only advances the seed when the roll fails', () => {
    const s = makeState({ day: 2, rngSeed: staySeed });
    const r = maybeVisitorArrives(s);
    expect(r.state.visitor).toBeNull();
    expect(r.state.rngSeed).not.toBe(s.rngSeed);
    expect(r.events).toEqual([]);
  });
});

describe('fulfillVisitor', () => {
  it('trades produce for coins, unlocks a crop, gifts seeds and adds bloom', () => {
    const s = withProduce(
      makeState({ coins: 0, visitor: { id: 'hazel', arrivedOnDay: 2 } }),
      'carrot',
      4,
    );
    const r = fulfillVisitor(s);
    expect(r.state.visitor).toBeNull();
    expect(r.state.coins).toBe(15);
    expect(r.state.inventory.produce.carrot).toBe(1);
    expect(r.state.unlockedCrops).toContain('strawberry');
    expect(r.state.inventory.seeds.strawberry).toBe(GIFT_SEEDS);
    expect(r.state.visitorsHelped).toEqual(['hazel']);
    expect(r.state.bloom).toBe(BALANCE.visitorBloomPoints);
    expect(r.events[0]).toEqual({
      type: 'visitor-helped',
      visitor: 'hazel',
      unlocked: 'strawberry',
    });
    expect(r.events).toContainEqual({ type: 'crop-unlocked', crop: 'strawberry' });
  });

  it('works for visitors without an unlock', () => {
    const s = withProduce(
      unlockAll(makeState({ visitor: { id: 'pip', arrivedOnDay: 3 } })),
      'tomato',
      2,
    );
    const r = fulfillVisitor(s);
    expect(r.state.inventory.produce.tomato).toBe(0);
    expect(r.events[0]).toMatchObject({ unlocked: null });
  });

  it('rejects when there is no visitor or not enough produce', () => {
    expect(fulfillVisitor(makeState()).events[0]).toMatchObject({ reason: 'no-visitor' });
    const s = makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } });
    expect(fulfillVisitor(s).events[0]).toMatchObject({ reason: 'not-enough-produce' });
  });
});

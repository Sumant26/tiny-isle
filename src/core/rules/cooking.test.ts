import { describe, expect, it } from 'vitest';
import { makeState, withProduce } from '../../test/fixtures';
import { cook } from './cooking';

describe('cook', () => {
  it('cooks a recipe when ingredients are available', () => {
    let state = makeState();
    state = withProduce(state, 'carrot', 3);
    const result = cook(state, 'carrot_soup');

    expect(result.state.inventory.produce.carrot).toBe(1);
    expect(result.state.cookedInventory?.carrot_soup).toBe(1);
    expect(result.state.stats.cooked).toBe(1);
    expect(result.events.some((e) => e.type === 'cooked')).toBe(true);
  });

  it('rejects when ingredients are insufficient', () => {
    const state = makeState();
    const result = cook(state, 'carrot_soup');
    expect(result.state).toBe(state);
    expect(result.events).toEqual([{ type: 'rejected', reason: 'not-enough-ingredients' }]);
  });
});

import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { changeHat, changeOutfit, setPetAccessory } from './wardrobe';

describe('wardrobe rules', () => {
  it('changes character outfit and produces event', () => {
    const s0 = makeState();
    const { state, events } = changeOutfit(s0, 'gardener');
    expect(state.currentOutfit).toBe('gardener');
    expect(events).toEqual([{ type: 'outfit-changed', outfit: 'gardener' }]);
  });

  it('no-ops when changing to same outfit', () => {
    const s0 = makeState();
    const { state, events } = changeOutfit(s0, s0.currentOutfit ?? 'classic');
    expect(state).toBe(s0);
    expect(events).toHaveLength(0);
  });

  it('changes character hat', () => {
    const s0 = makeState();
    const { state, events } = changeHat(s0, 'flower_crown');
    expect(state.currentHat).toBe('flower_crown');
    expect(events).toEqual([{ type: 'hat-changed', hat: 'flower_crown' }]);
  });

  it('sets pet accessory', () => {
    const s0 = makeState();
    const { state, events } = setPetAccessory(s0, 'cat', 'flower_collar');
    expect(state.petAccessories?.cat).toBe('flower_collar');
    expect(events).toEqual([
      { type: 'pet-accessory-changed', pet: 'cat', accessory: 'flower_collar' },
    ]);
  });
});

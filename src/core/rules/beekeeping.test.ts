import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { harvestHoney, restHammock, toggleCampfire } from './beekeeping';

describe('beekeeping and cottage leisure rules', () => {
  it('rejects harvesting honey if beehive is not owned', () => {
    const s0 = makeState();
    const { state, events } = harvestHoney(s0);
    expect(state).toBe(s0);
    expect(events).toEqual([{ type: 'rejected', reason: 'locked' }]);
  });

  it('harvests honey when beehive is owned', () => {
    const s0 = { ...makeState(), decorations: ['beehive' as const] };
    const { state, events } = harvestHoney(s0);
    expect(state.honeyJars).toBe(1);
    expect(state.stats.honeyCollected).toBe(1);
    expect(events).toEqual([{ type: 'honey-harvested', count: 1 }]);
  });

  it('toggles campfire when campfire is owned', () => {
    const s0 = { ...makeState(), decorations: ['campfire' as const] };
    const { state: s1, events: e1 } = toggleCampfire(s0);
    expect(s1.campfireLit).toBe(true);
    expect(e1).toEqual([{ type: 'campfire-toggled', lit: true }]);

    const { state: s2, events: e2 } = toggleCampfire(s1);
    expect(s2.campfireLit).toBe(false);
    expect(e2).toEqual([{ type: 'campfire-toggled', lit: false }]);
  });

  it('rests in hammock and increases bloom', () => {
    const s0 = { ...makeState(), decorations: ['hammock' as const] };
    const { state, events } = restHammock(s0);
    expect(state.bloom).toBe(s0.bloom + 2);
    expect(events).toEqual([{ type: 'hammock-rested' }]);
  });
});

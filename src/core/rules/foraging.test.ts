import { describe, expect, it } from 'vitest';
import { createInitialState } from '../initialState';
import { forageItem, spawnForageNodes } from './foraging';

describe('foraging rules', () => {
  it('collects a forage item, adds to inventory and blooms', () => {
    const state = createInitialState(1234);
    const target = state.forageNodes?.[0];
    expect(target).toBeDefined();
    if (!target) return;

    const result = forageItem(state, target.id);
    expect(result.events).toContainEqual({ type: 'foraged', item: target.type });
    expect(result.state.forageInventory?.[target.type]).toBe(1);
    expect(result.state.stats.foraged).toBe(1);
    expect(result.state.forageNodes?.some((n) => n.id === target.id)).toBe(false);
  });

  it('rejects collecting an invalid or missing forage node', () => {
    const state = createInitialState(1234);
    const result = forageItem(state, 'nonexistent_id');
    expect(result.events).toContainEqual({ type: 'rejected', reason: 'no-crop' });
  });

  it('spawns additional forage nodes when sparse', () => {
    const state = { ...createInitialState(1234), forageNodes: [] };
    const spawned = spawnForageNodes(state);
    expect(spawned.forageNodes?.length).toBeGreaterThan(0);
  });
});

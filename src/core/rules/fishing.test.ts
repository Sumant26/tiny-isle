import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { fish } from './fishing';

describe('fish', () => {
  it('catches a fish and records stats', () => {
    const state = makeState();
    const result = fish(state);

    expect(result.state.stats.fishCaught).toBe(1);
    expect(result.events.some((e) => e.type === 'fish-caught')).toBe(true);
    expect(result.state.journal?.length).toBeGreaterThan(0);
  });
});

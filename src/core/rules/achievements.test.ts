import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { checkAchievements } from './achievements';

describe('checkAchievements', () => {
  it('unlocks first_harvest when harvested >= 1', () => {
    let state = makeState();
    state = { ...state, stats: { ...state.stats, harvested: 1 } };
    const result = checkAchievements(state);

    expect(result.state.achievements).toContain('first_harvest');
    expect(result.events.some((e) => e.type === 'achievement-unlocked')).toBe(true);
  });

  it('is a no-op when no new achievements are earned', () => {
    const state = makeState();
    const result = checkAchievements(state);
    expect(result.state).toBe(state);
    expect(result.events).toHaveLength(0);
  });
});

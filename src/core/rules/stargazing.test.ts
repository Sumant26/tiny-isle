import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { snapPostcard, stargazeTelescope, tossWishingWell, unlockGreenhouse } from './stargazing';

describe('stargazing, wishing well, and greenhouse rules', () => {
  it('stargazes through telescope and gains bloom', () => {
    const s0 = makeState();
    const { state, events } = stargazeTelescope(s0);
    expect(state.bloom).toBe(s0.bloom + 3);
    expect(state.stats.starsObserved).toBe(1);
    expect(events[0]?.type).toBe('stargazed');
  });

  it('tosses coin into wishing well when owned', () => {
    const s0 = {
      ...makeState(),
      coins: 50,
      decorations: ['wishing_well' as const],
    };
    const { state, events } = tossWishingWell(s0);
    expect(state.coins).toBe(40);
    expect(state.bloom).toBe(s0.bloom + 6);
    expect(state.stats.wishesMade).toBe(1);
    expect(events[0]?.type).toBe('wishing-well-blessed');
  });

  it('unlocks greenhouse when player has sufficient bloom and coins', () => {
    const s0 = {
      ...makeState(),
      coins: 150,
      bloom: 50,
      greenhouseUnlocked: false,
    };
    const { state, events } = unlockGreenhouse(s0);
    expect(state.greenhouseUnlocked).toBe(true);
    expect(state.coins).toBe(50);
    expect(events).toEqual([{ type: 'greenhouse-unlocked' }]);
  });

  it('snaps a postcard memory into album', () => {
    const s0 = makeState();
    const { state, events } = snapPostcard(
      s0,
      'Sunset at the Pier',
      'polaroid',
      'Beautiful golden hour reflection.',
    );
    expect(state.postcards).toHaveLength(1);
    expect(state.postcards?.[0]?.title).toBe('Sunset at the Pier');
    expect(state.postcards?.[0]?.filter).toBe('polaroid');
    expect(state.stats.postcardsTaken).toBe(1);
    expect(events).toEqual([{ type: 'postcard-snapped', title: 'Sunset at the Pier' }]);
  });
});

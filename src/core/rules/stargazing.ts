import { CONSTELLATIONS, GREENHOUSE_EXPANSION } from '../config';
import type { GameState, Outcome, Postcard, Season } from '../types';

export const stargazeTelescope = (state: GameState): Outcome => {
  const index = state.day % CONSTELLATIONS.length;
  const constellation = CONSTELLATIONS[index]?.name ?? 'The Golden Koi';
  const currentCount = state.stats.starsObserved ?? 0;

  return {
    state: {
      ...state,
      bloom: state.bloom + 3,
      stats: {
        ...state.stats,
        starsObserved: currentCount + 1,
      },
    },
    events: [{ type: 'stargazed', constellation }],
  };
};

export const tossWishingWell = (state: GameState): Outcome => {
  if (!state.decorations.includes('wishing_well')) {
    return { state, events: [{ type: 'rejected', reason: 'locked' }] };
  }
  const cost = 10;
  if (state.coins < cost) {
    return { state, events: [{ type: 'rejected', reason: 'not-enough-coins' }] };
  }

  const blessings = [
    '✨ Luminous Firefly Swarm (+6 Bloom)',
    '🌟 Golden Harvest Fortune (+8 Bloom)',
    '🌈 Rainbow Pet Happiness (+10 Bloom)',
  ];
  const blessing =
    blessings[state.day % blessings.length] ?? '✨ Luminous Firefly Swarm (+6 Bloom)';
  const wishesCount = state.stats.wishesMade ?? 0;

  return {
    state: {
      ...state,
      coins: state.coins - cost,
      bloom: state.bloom + 6,
      stats: {
        ...state.stats,
        wishesMade: wishesCount + 1,
      },
    },
    events: [{ type: 'wishing-well-blessed', blessing }],
  };
};

export const unlockGreenhouse = (state: GameState): Outcome => {
  if (state.greenhouseUnlocked) {
    return { state, events: [] };
  }
  if (state.bloom < GREENHOUSE_EXPANSION.requiredBloom) {
    return { state, events: [{ type: 'rejected', reason: 'locked' }] };
  }
  if (state.coins < GREENHOUSE_EXPANSION.cost) {
    return { state, events: [{ type: 'rejected', reason: 'not-enough-coins' }] };
  }

  const journal = state.journal ?? [];
  return {
    state: {
      ...state,
      coins: state.coins - GREENHOUSE_EXPANSION.cost,
      greenhouseUnlocked: true,
      bloom: state.bloom + 15,
      journal: [
        ...journal,
        'Built the magnificent Glass Conservatory & Greenhouse Dome on the meadow!',
      ],
    },
    events: [{ type: 'greenhouse-unlocked' }],
  };
};

export const snapPostcard = (
  state: GameState,
  title: string,
  filter: 'vintage' | 'polaroid' | 'warm_sun' | 'misty_dusk',
  caption: string,
): Outcome => {
  const currentPostcards = state.postcards ?? [];
  const currentSeason: Season = state.season ?? 'spring';
  const newPostcard: Postcard = {
    id: `postcard_${state.day}_${Date.now()}`,
    title: title.trim() || `Memories of Day ${state.day}`,
    day: state.day,
    season: currentSeason,
    filter,
    caption: caption.trim() || 'A peaceful moment under the island skies.',
  };

  const count = state.stats.postcardsTaken ?? 0;
  return {
    state: {
      ...state,
      postcards: [newPostcard, ...currentPostcards].slice(0, 20),
      bloom: state.bloom + 2,
      stats: {
        ...state.stats,
        postcardsTaken: count + 1,
      },
    },
    events: [{ type: 'postcard-snapped', title: newPostcard.title }],
  };
};

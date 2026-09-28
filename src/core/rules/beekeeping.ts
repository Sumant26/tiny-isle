import type { GameState, Outcome } from '../types';

export const harvestHoney = (state: GameState): Outcome => {
  if (!state.decorations.includes('beehive')) {
    return { state, events: [{ type: 'rejected', reason: 'locked' }] };
  }
  const currentHoney = state.honeyJars ?? 0;
  const currentHarvested = state.stats.honeyCollected ?? 0;
  return {
    state: {
      ...state,
      honeyJars: currentHoney + 1,
      stats: {
        ...state.stats,
        honeyCollected: currentHarvested + 1,
      },
    },
    events: [{ type: 'honey-harvested', count: 1 }],
  };
};

export const toggleCampfire = (state: GameState): Outcome => {
  if (!state.decorations.includes('campfire')) {
    return { state, events: [{ type: 'rejected', reason: 'locked' }] };
  }
  const nextLit = !(state.campfireLit ?? false);
  return {
    state: {
      ...state,
      campfireLit: nextLit,
    },
    events: [{ type: 'campfire-toggled', lit: nextLit }],
  };
};

export const restHammock = (state: GameState): Outcome => {
  if (!state.decorations.includes('hammock')) {
    return { state, events: [{ type: 'rejected', reason: 'locked' }] };
  }
  return {
    state: {
      ...state,
      bloom: state.bloom + 2,
    },
    events: [{ type: 'hammock-rested' }],
  };
};

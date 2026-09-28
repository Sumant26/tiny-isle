import { bloomLevel } from '../bloom';
import { ACHIEVEMENTS } from '../config';
import type { GameEvent, GameState, Outcome } from '../types';

export const checkAchievements = (state: GameState): Outcome => {
  const current = new Set(state.achievements ?? []);
  const newlyUnlocked: string[] = [];

  // first_harvest
  if (!current.has('first_harvest') && state.stats.harvested >= 1) {
    newlyUnlocked.push('first_harvest');
  }

  // first_pumpkin
  if (
    !current.has('first_pumpkin') &&
    (state.inventory.produce.pumpkin > 0 || state.stats.harvested >= 10)
  ) {
    newlyUnlocked.push('first_pumpkin');
  }

  // master_chef
  if (!current.has('master_chef') && (state.stats.cooked ?? 0) >= 1) {
    newlyUnlocked.push('master_chef');
  }

  // first_fish
  if (!current.has('first_fish') && (state.stats.fishCaught ?? 0) >= 1) {
    newlyUnlocked.push('first_fish');
  }

  // pet_cat
  if (!current.has('pet_cat') && (state.stats.catPets ?? 0) >= 1) {
    newlyUnlocked.push('pet_cat');
  }

  // help_5_visitors
  if (!current.has('help_5_visitors') && state.visitorsHelped.length >= 5) {
    newlyUnlocked.push('help_5_visitors');
  }

  // thriving_island
  if (!current.has('thriving_island') && bloomLevel(state.bloom) >= 5) {
    newlyUnlocked.push('thriving_island');
  }

  // garden_expansion
  if (!current.has('garden_expansion') && state.plot.height > 4) {
    newlyUnlocked.push('garden_expansion');
  }

  // forager_master
  if (!current.has('forager_master') && (state.stats.foraged ?? 0) >= 1) {
    newlyUnlocked.push('forager_master');
  }

  // gift_visitor
  if (!current.has('gift_visitor') && (state.stats.visitorGifts ?? 0) >= 1) {
    newlyUnlocked.push('gift_visitor');
  }

  // orchard_expansion
  if (!current.has('orchard_expansion') && state.isletUnlocked) {
    newlyUnlocked.push('orchard_expansion');
  }

  if (newlyUnlocked.length === 0) {
    return { state, events: [] };
  }

  const nextAchievements = [...(state.achievements ?? []), ...newlyUnlocked];
  const events: GameEvent[] = newlyUnlocked.map((id) => {
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    return { type: 'achievement-unlocked', achievement: def?.title ?? id };
  });

  return {
    state: {
      ...state,
      achievements: nextAchievements,
    },
    events,
  };
};

export const unlockAchievement = (state: GameState, achievementId: string): Outcome => {
  const current = new Set(state.achievements ?? []);
  if (current.has(achievementId)) return { state, events: [] };
  const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
  return {
    state: {
      ...state,
      achievements: [...(state.achievements ?? []), achievementId],
    },
    events: [{ type: 'achievement-unlocked', achievement: def?.title ?? achievementId }],
  };
};

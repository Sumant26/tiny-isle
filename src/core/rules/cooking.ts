import { RECIPES } from '../config';
import type { CropId, FishId, GameState, Outcome, RecipeId } from '../types';
import { addCount, chain, ok, reject } from './outcome';
import { addBloom } from './progression';

export const cook = (state: GameState, recipeId: RecipeId): Outcome => {
  const recipe = RECIPES[recipeId];

  // Check ingredients
  for (const [crop, needed] of Object.entries(recipe.ingredients) as [CropId, number][]) {
    if (state.inventory.produce[crop] < needed) {
      return reject(state, 'not-enough-ingredients');
    }
  }

  // Deduct ingredients
  let nextProduce = { ...state.inventory.produce };
  for (const [crop, needed] of Object.entries(recipe.ingredients) as [CropId, number][]) {
    nextProduce = addCount(nextProduce, crop, -needed);
  }

  const currentCooked = (state.cookedInventory?.[recipeId] ?? 0) + 1;
  const nextCookedInventory = {
    ...(state.cookedInventory ?? {}),
    [recipeId]: currentCooked,
  };

  const unlocked = state.unlockedRecipes ?? [];
  const nextUnlocked = unlocked.includes(recipeId) ? unlocked : [...unlocked, recipeId];

  const totalCooked = (state.stats.cooked ?? 0) + 1;
  const nextStats = { ...state.stats, cooked: totalCooked };

  const journal = state.journal ?? [];
  const journalEntry = `Cooked delicious ${recipe.name}!`;
  const nextJournal = journal.includes(journalEntry) ? journal : [...journal, journalEntry];

  return chain(
    ok(
      {
        ...state,
        inventory: {
          ...state.inventory,
          produce: nextProduce,
        },
        cookedInventory: nextCookedInventory,
        unlockedRecipes: nextUnlocked,
        stats: nextStats,
        journal: nextJournal,
      },
      { type: 'cooked', recipe: recipeId },
      { type: 'journal-entry', entry: journalEntry },
    ),
    (s) => addBloom(s, recipe.bloomPoints),
  );
};

export const eatMeal = (state: GameState, recipeId: RecipeId): Outcome => {
  const current = state.cookedInventory?.[recipeId] ?? 0;
  if (current <= 0) return reject(state, 'no-meal-to-eat');
  const recipe = RECIPES[recipeId];
  const nextCooked = {
    ...state.cookedInventory,
    [recipeId]: current - 1,
  };
  return chain(
    ok({ ...state, cookedInventory: nextCooked }, { type: 'meal-eaten', recipe: recipeId }),
    (s) => addBloom(s, Math.max(2, Math.floor(recipe.bloomPoints / 2))),
  );
};

export const eatFish = (state: GameState, fishId: FishId): Outcome => {
  const current = state.fishInventory?.[fishId] ?? 0;
  if (current <= 0) return reject(state, 'no-fish-to-eat');
  const nextFish = {
    ...state.fishInventory,
    [fishId]: current - 1,
  };
  return chain(
    ok({ ...state, fishInventory: nextFish }, { type: 'fish-eaten', fish: fishId }),
    (s) => addBloom(s, 2),
  );
};

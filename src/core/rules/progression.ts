import { bloomLevel } from '../bloom';
import { BALANCE, ISLET_EXPANSION } from '../config';
import type { CropId, GameEvent, GameState, Outcome } from '../types';
import { unlockAchievement } from './achievements';
import { chain, ok, reject } from './outcome';

export const unlockCrop = (state: GameState, crop: CropId): Outcome =>
  state.unlockedCrops.includes(crop)
    ? ok(state)
    : ok(
        { ...state, unlockedCrops: [...state.unlockedCrops, crop] },
        { type: 'crop-unlocked', crop },
      );

/** Adds bloom points, emitting a level-up (and any crop unlock) for every level crossed. */
export const addBloom = (state: GameState, points: number): Outcome => {
  if (points <= 0) return ok(state);
  const before = bloomLevel(state.bloom);
  let next: GameState = { ...state, bloom: state.bloom + points };
  const after = bloomLevel(next.bloom);
  const events: GameEvent[] = [];
  for (let level = before + 1; level <= after; level++) {
    events.push({ type: 'bloom-level-up', level });
    const crop = BALANCE.bloomUnlocks[level];
    if (crop) {
      const unlocked = unlockCrop(next, crop);
      next = unlocked.state;
      events.push(...unlocked.events);
    }
  }
  return { state: next, events };
};

export const unlockIslet = (state: GameState): Outcome => {
  if (state.isletUnlocked) return reject(state, 'already-owned');
  if (state.bloom < ISLET_EXPANSION.requiredBloom) return reject(state, 'locked');
  if (state.coins < ISLET_EXPANSION.cost) return reject(state, 'not-enough-coins');

  const journal = state.journal ?? [];
  const entry = 'Restored the rustic footbridge and unlocked the Orchard Islet!';
  const nextJournal = journal.includes(entry) ? journal : [...journal, entry];

  const next: GameState = {
    ...state,
    coins: state.coins - ISLET_EXPANSION.cost,
    isletUnlocked: true,
    journal: nextJournal,
  };

  let outcome = ok(next, { type: 'islet-unlocked' }, { type: 'journal-entry', entry });
  outcome = chain(outcome, (s) => addBloom(s, 15));
  outcome = chain(outcome, (s) => unlockAchievement(s, 'orchard_expansion'));
  return outcome;
};

export const harvestOrchard = (state: GameState): Outcome => {
  if (!state.isletUnlocked) return reject(state, 'islet-locked');

  const curFruits = state.fruitInventory ?? { apple: 0, cherry: 0, citrus: 0 };
  const next: GameState = {
    ...state,
    fruitInventory: {
      apple: (curFruits.apple ?? 0) + 2,
      cherry: (curFruits.cherry ?? 0) + 2,
      citrus: (curFruits.citrus ?? 0) + 2,
    },
    stats: {
      ...state.stats,
      harvested: state.stats.harvested + 6,
    },
  };

  return ok(
    next,
    { type: 'orchard-harvested', fruit: 'apple', count: 2 },
    { type: 'orchard-harvested', fruit: 'cherry', count: 2 },
    { type: 'orchard-harvested', fruit: 'citrus', count: 2 },
  );
};

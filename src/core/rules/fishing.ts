import { FISH, FISH_IDS } from '../config';
import { nextRandom } from '../rng';
import type { FishId, GameState, Outcome } from '../types';
import { chain, ok } from './outcome';
import { addBloom } from './progression';

export const fish = (state: GameState): Outcome => {
  const roll = nextRandom(state.rngSeed);
  const r = roll.value;

  // Determine which fish was caught based on rarity
  let caughtFish: FishId = 'goldfish';
  let cumulative = 0;
  for (const id of FISH_IDS) {
    cumulative += FISH[id].rarity;
    if (r <= cumulative) {
      caughtFish = id;
      break;
    }
  }

  const def = FISH[caughtFish];
  const count = (state.fishInventory?.[caughtFish] ?? 0) + 1;
  const nextFishInventory = {
    ...(state.fishInventory ?? {}),
    [caughtFish]: count,
  };

  const totalCaught = (state.stats.fishCaught ?? 0) + 1;
  const nextStats = { ...state.stats, fishCaught: totalCaught };

  const journal = state.journal ?? [];
  const entry = `Caught a lively ${def.name} from the pond!`;
  const nextJournal = journal.includes(entry) ? journal : [...journal, entry];

  return chain(
    ok(
      {
        ...state,
        fishInventory: nextFishInventory,
        stats: nextStats,
        journal: nextJournal,
        rngSeed: roll.nextSeed,
      },
      { type: 'fish-caught', fish: caughtFish },
      { type: 'journal-entry', entry },
    ),
    (s) => addBloom(s, def.bloomPoints),
  );
};

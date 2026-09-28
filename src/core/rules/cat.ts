import type { GameState, Outcome } from '../types';
import { chain, ok } from './outcome';
import { addBloom } from './progression';

export const petCat = (state: GameState): Outcome => {
  const currentPets = (state.stats.catPets ?? 0) + 1;
  const happiness = (state.catHappiness ?? 0) + 1;

  const journal = state.journal ?? [];
  const entry = 'Gave the island cat some gentle scratches. It purred happily!';
  const nextJournal = journal.includes(entry) ? journal : [...journal, entry];

  return chain(
    ok(
      {
        ...state,
        catHappiness: happiness,
        stats: {
          ...state.stats,
          catPets: currentPets,
        },
        journal: nextJournal,
      },
      { type: 'pet-cat', happiness },
      { type: 'journal-entry', entry },
    ),
    (s) => addBloom(s, 2),
  );
};

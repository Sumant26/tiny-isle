import type { GameState, Outcome } from '../types';
import { chain, ok } from './outcome';
import { addBloom } from './progression';

export type CottageActivity =
  | 'kindle_fire'
  | 'clean_cottage'
  | 'read_book'
  | 'brew_tea'
  | 'sit_hearth'
  | 'sit_table'
  | 'take_nap';

const ACTIVITY_DETAILS: Record<CottageActivity, { name: string; bloom: number; journal: string }> =
  {
    kindle_fire: {
      name: 'Fireplace',
      bloom: 3,
      journal: 'Lit a cozy crackling fire in the cottage hearth.',
    },
    clean_cottage: {
      name: 'Tidy & Clean',
      bloom: 4,
      journal: 'Swept the floor and polished the rustic table sparkling clean.',
    },
    read_book: {
      name: 'Reading Corner',
      bloom: 3,
      journal: 'Read a captivating chapter of Island Almanac from the cottage bookshelf.',
    },
    brew_tea: {
      name: 'Herbal Tea',
      bloom: 2,
      journal: 'Brewed and enjoyed a warm cup of fragrant chamomile herbal tea.',
    },
    sit_hearth: {
      name: 'Fireplace Hearth',
      bloom: 2,
      journal: 'Sat comfortably by the fireplace hearth enjoying the crackling flames.',
    },
    sit_table: {
      name: 'Oak Table',
      bloom: 2,
      journal: 'Sat peacefully at the cottage oak table enjoying the quiet breeze.',
    },
    take_nap: {
      name: 'Afternoon Nap',
      bloom: 2,
      journal: 'Rested for a cozy afternoon nap under the quilted bedsheets.',
    },
  };

export const cottageActivity = (state: GameState, activity: CottageActivity): Outcome => {
  const info = ACTIVITY_DETAILS[activity];
  const journal = state.journal ?? [];
  const nextJournal = journal.includes(info.journal) ? journal : [...journal, info.journal];

  return chain(
    ok(
      {
        ...state,
        journal: nextJournal,
      },
      { type: 'cottage-activity', activity },
      { type: 'journal-entry', entry: info.journal },
    ),
    (s) => addBloom(s, info.bloom),
  );
};

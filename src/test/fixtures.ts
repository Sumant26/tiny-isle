import { createInitialState } from '../core/initialState';
import { updateTile } from '../core/plot';
import { nextRandom } from '../core/rng';
import type { CropId, GameState, Tile } from '../core/types';

/** Deterministic starting state for tests. */
export const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  ...createInitialState(12345),
  ...overrides,
});

export const withTile = (state: GameState, index: number, tile: Partial<Tile>): GameState => {
  const current = state.plot.tiles[index];
  if (!current) throw new Error(`No tile ${index}`);
  return { ...state, plot: updateTile(state.plot, index, { ...current, ...tile }) };
};

export const withProduce = (state: GameState, crop: CropId, n: number): GameState => ({
  ...state,
  inventory: { ...state.inventory, produce: { ...state.inventory.produce, [crop]: n } },
});

export const withSeeds = (state: GameState, crop: CropId, n: number): GameState => ({
  ...state,
  inventory: { ...state.inventory, seeds: { ...state.inventory.seeds, [crop]: n } },
});

export const unlockAll = (state: GameState): GameState => ({
  ...state,
  unlockedCrops: ['carrot', 'tomato', 'strawberry', 'sunflower', 'pumpkin'],
});

/** Finds a seed whose first random roll satisfies a predicate (for rain/visitor tests). */
export const seedWhereFirstRoll = (predicate: (value: number) => boolean): number => {
  for (let s = 1; s < 100000; s++) if (predicate(nextRandom(s).value)) return s;
  throw new Error('No seed found');
};

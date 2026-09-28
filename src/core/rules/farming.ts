import { CROPS } from '../config';
import { isRipe, isValidIndex, updateTile } from '../plot';
import type { CropId, GameState, Outcome } from '../types';
import { addCount, chain, ok, reject } from './outcome';
import { addBloom } from './progression';

export const till = (state: GameState, index: number): Outcome => {
  if (!isValidIndex(state.plot, index)) return reject(state, 'out-of-bounds');
  const tile = state.plot.tiles[index];
  if (!tile) return reject(state, 'out-of-bounds');
  if (tile.tilled) return reject(state, 'already-tilled');
  const plot = updateTile(state.plot, index, { ...tile, tilled: true });
  return ok({ ...state, plot }, { type: 'tilled', index });
};

export const plant = (state: GameState, index: number, crop: CropId): Outcome => {
  const tile = state.plot.tiles[index];
  if (!tile) return reject(state, 'out-of-bounds');
  if (!tile.tilled) return reject(state, 'not-tilled');
  if (tile.crop) return reject(state, 'occupied');
  if (!state.unlockedCrops.includes(crop)) return reject(state, 'locked');
  if (state.inventory.seeds[crop] <= 0) return reject(state, 'no-seeds');
  const plot = updateTile(state.plot, index, { ...tile, crop: { id: crop, growth: 0 } });
  const inventory = { ...state.inventory, seeds: addCount(state.inventory.seeds, crop, -1) };
  return ok({ ...state, plot, inventory }, { type: 'planted', index, crop });
};

export const water = (state: GameState, index: number): Outcome => {
  const tile = state.plot.tiles[index];
  if (!tile) return reject(state, 'out-of-bounds');
  if (!tile.tilled) return reject(state, 'not-tilled');
  if (tile.watered) return reject(state, 'already-watered');
  const plot = updateTile(state.plot, index, { ...tile, watered: true });
  return ok({ ...state, plot }, { type: 'watered', index });
};

export const harvest = (state: GameState, index: number): Outcome => {
  const tile = state.plot.tiles[index];
  if (!tile) return reject(state, 'out-of-bounds');
  const crop = tile.crop;
  if (!crop) return reject(state, 'no-crop');
  if (!isRipe(crop)) return reject(state, 'not-ripe');
  const def = CROPS[crop.id];
  const remaining = def.regrowTo === null ? null : { id: crop.id, growth: def.regrowTo };
  const plot = updateTile(state.plot, index, { ...tile, crop: remaining });
  const inventory = { ...state.inventory, produce: addCount(state.inventory.produce, crop.id, 1) };
  const stats = { ...state.stats, harvested: state.stats.harvested + 1 };
  return chain(
    ok({ ...state, plot, inventory, stats }, { type: 'harvested', index, crop: crop.id }),
    (s) => addBloom(s, def.bloomPoints),
  );
};

/** Applies whichever tool is selected to a plot tile. */
export const useTool = (state: GameState, index: number): Outcome => {
  switch (state.selectedTool) {
    case 'hoe':
      return till(state, index);
    case 'seeds':
      return plant(state, index, state.selectedSeed);
    case 'water':
      return water(state, index);
    case 'basket':
      return harvest(state, index);
  }
};

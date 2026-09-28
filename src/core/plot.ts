import { CROPS } from './config';
import type { CropStage, PlantedCrop, Plot, Tile } from './types';

export const EMPTY_TILE: Tile = Object.freeze({ tilled: false, watered: false, crop: null });

export const createPlot = (width: number, height: number): Plot => ({
  width,
  height,
  tiles: Array.from({ length: width * height }, () => EMPTY_TILE),
});

export const isValidIndex = (plot: Plot, index: number): boolean =>
  Number.isInteger(index) && index >= 0 && index < plot.tiles.length;

/** Returns a new plot with one tile replaced; all other tiles keep their identity. */
export const updateTile = (plot: Plot, index: number, tile: Tile): Plot => {
  if (plot.tiles[index] === tile) return plot;
  const tiles = plot.tiles.slice();
  tiles[index] = tile;
  return { ...plot, tiles };
};

/** Maps every tile, returning the same plot object if nothing changed. */
export const mapTiles = (plot: Plot, fn: (tile: Tile, index: number) => Tile): Plot => {
  const tiles = plot.tiles.map(fn);
  return tiles.some((t, i) => t !== plot.tiles[i]) ? { ...plot, tiles } : plot;
};

export const isRipe = (crop: PlantedCrop): boolean => crop.growth >= CROPS[crop.id].growthDays;

export const cropStage = (crop: PlantedCrop): CropStage => {
  const days = CROPS[crop.id].growthDays;
  if (crop.growth >= days) return 'ripe';
  if (crop.growth === 0) return 'seed';
  return crop.growth / days < 0.5 ? 'sprout' : 'growing';
};

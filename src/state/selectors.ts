import { bloomLevel, bloomLevelName, bloomProgress } from '../core/bloom';
import { CROP_IDS, CROPS, DECORATIONS } from '../core/config';
import { visitorDef } from '../core/rules/visitors';
import type { CropId, DecorationId, GameState } from '../core/types';

export const selectCoins = (s: GameState): number => s.coins;
export const selectDay = (s: GameState): number => s.day;
export const selectWeather = (s: GameState): GameState['weather'] => s.weather;
export const selectPlot = (s: GameState): GameState['plot'] => s.plot;
export const selectTiles = (s: GameState): GameState['plot']['tiles'] => s.plot.tiles;
export const selectPlayer = (s: GameState): GameState['player'] => s.player;
export const selectTool = (s: GameState): GameState['selectedTool'] => s.selectedTool;
export const selectSeed = (s: GameState): CropId => s.selectedSeed;
export const selectSettings = (s: GameState): GameState['settings'] => s.settings;
export const selectDecorations = (s: GameState): GameState['decorations'] => s.decorations;
export const selectVisitor = (s: GameState): GameState['visitor'] => s.visitor;
export const selectInventory = (s: GameState): GameState['inventory'] => s.inventory;
export const selectUnlocked = (s: GameState): GameState['unlockedCrops'] => s.unlockedCrops;
export const selectBloomPoints = (s: GameState): number => s.bloom;
export const selectBloomLevel = (s: GameState): number => bloomLevel(s.bloom);

export interface BloomInfo {
  readonly level: number;
  readonly name: string;
  readonly progress: number;
}
export const selectBloomInfo = (s: GameState): BloomInfo => {
  const level = bloomLevel(s.bloom);
  return { level, name: bloomLevelName(level), progress: bloomProgress(s.bloom) };
};

export const selectSeedCount = (s: GameState, crop: CropId): number => s.inventory.seeds[crop];
export const selectProduceTotal = (s: GameState): number =>
  CROP_IDS.reduce((n, c) => n + s.inventory.produce[c], 0);
export const selectProduceValue = (s: GameState): number =>
  CROP_IDS.reduce((n, c) => n + s.inventory.produce[c] * CROPS[c].sellPrice, 0);

export const selectCanAffordSeeds = (s: GameState, crop: CropId, qty = 1): boolean =>
  s.coins >= CROPS[crop].seedCost * qty;
export const selectCanAffordDecoration = (s: GameState, id: DecorationId): boolean =>
  s.coins >= DECORATIONS[id].cost;

export interface VisitorInfo {
  readonly name: string;
  readonly greeting: string;
  readonly crop: CropId;
  readonly quantity: number;
  readonly have: number;
  readonly canFulfill: boolean;
}
export const selectVisitorInfo = (s: GameState): VisitorInfo | null => {
  if (!s.visitor) return null;
  const def = visitorDef(s.visitor.id);
  const have = s.inventory.produce[def.wants.crop];
  return {
    name: def.name,
    greeting: def.greeting,
    crop: def.wants.crop,
    quantity: def.wants.quantity,
    have,
    canFulfill: have >= def.wants.quantity,
  };
};

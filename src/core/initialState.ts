import { BALANCE, CROP_IDS } from './config';
import { createPlot } from './plot';
import { createSeed } from './rng';
import type { CropCounts, GameState } from './types';
import { LAYOUT } from './world';

export const emptyCounts = (): CropCounts =>
  Object.fromEntries(CROP_IDS.map((c) => [c, 0])) as Record<(typeof CROP_IDS)[number], number>;

export const createInitialState = (seed: number = createSeed()): GameState => ({
  day: 1,
  coins: BALANCE.startingCoins,
  plot: createPlot(BALANCE.plotWidth, BALANCE.plotHeight),
  player: { ...LAYOUT.playerStart },
  selectedTool: 'hoe',
  selectedSeed: 'carrot',
  inventory: {
    seeds: { ...emptyCounts(), ...BALANCE.startingSeeds },
    produce: emptyCounts(),
  },
  unlockedCrops: [...BALANCE.startingCrops],
  decorations: [],
  bloom: 0,
  visitor: null,
  visitorsHelped: [],
  weather: 'clear',
  rngSeed: seed >>> 0,
  settings: { muted: false, volume: 0.6 },
  stats: { harvested: 0, earned: 0 },
});

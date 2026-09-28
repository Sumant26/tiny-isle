import { BALANCE, CROP_IDS } from './config';
import { createPlot } from './plot';
import { createSeed } from './rng';
import type { CropCounts, GameState } from './types';
import { LAYOUT } from './world';

export const emptyCounts = (): CropCounts =>
  Object.fromEntries(CROP_IDS.map((c) => [c, 0])) as Record<(typeof CROP_IDS)[number], number>;

export const INITIAL_FORAGE_NODES = [
  { id: 'forage_1', type: 'mushroom' as const, cell: { x: 13, z: 5 } },
  { id: 'forage_2', type: 'berry' as const, cell: { x: 3, z: 6 } },
  { id: 'forage_3', type: 'seashell' as const, cell: { x: 1, z: 12 } },
  { id: 'forage_4', type: 'wildflower' as const, cell: { x: 10, z: 2 } },
];

export const createInitialState = (seed: number = createSeed()): GameState => ({
  day: 1,
  season: 'spring',
  coins: BALANCE.startingCoins,
  plot: createPlot(BALANCE.plotWidth, BALANCE.plotHeight),
  player: { ...LAYOUT.playerStart },
  selectedTool: 'hoe',
  selectedSeed: 'carrot',
  inventory: {
    seeds: { ...emptyCounts(), ...BALANCE.startingSeeds },
    produce: emptyCounts(),
  },
  cookedInventory: {},
  fishInventory: {},
  forageInventory: { mushroom: 0, berry: 0, seashell: 0, wildflower: 0 },
  fruitInventory: { apple: 0, cherry: 0, citrus: 0 },
  forageNodes: INITIAL_FORAGE_NODES,
  isletUnlocked: false,
  pets: ['cat'],
  activeMusicTrack: 'morning_breeze',
  unlockedCrops: [...BALANCE.startingCrops],
  unlockedRecipes: ['carrot_soup'],
  decorations: [],
  bloom: 0,
  visitor: null,
  visitorsHelped: [],
  weather: 'clear',
  catHappiness: 0,
  achievements: [],
  journal: ['Arrived on the peaceful Tiny Isle.'],
  rngSeed: seed >>> 0,
  settings: {
    muted: false,
    volume: 0.6,
    musicVolume: 0.5,
    highContrast: false,
    largeText: false,
    colorblindMode: false,
    language: 'en',
  },
  stats: { harvested: 0, earned: 0, cooked: 0, fishCaught: 0, catPets: 0, foraged: 0 },
});

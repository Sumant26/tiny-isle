import type { CropId, DecorationId, VisitorId } from './types';

/**
 * Game content and balance live here as plain data. Adding a crop, decoration or
 * visitor means adding an entry, not writing new logic.
 */

export interface CropDef {
  readonly id: CropId;
  readonly name: string;
  /** Watered nights needed to ripen. */
  readonly growthDays: number;
  readonly seedCost: number;
  readonly sellPrice: number;
  /** After harvest, regrowable crops drop back to this growth value instead of disappearing. */
  readonly regrowTo: number | null;
  readonly bloomPoints: number;
}

export const CROPS: Readonly<Record<CropId, CropDef>> = {
  carrot: {
    id: 'carrot',
    name: 'Carrot',
    growthDays: 2,
    seedCost: 2,
    sellPrice: 5,
    regrowTo: null,
    bloomPoints: 1,
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    growthDays: 3,
    seedCost: 4,
    sellPrice: 6,
    regrowTo: 1,
    bloomPoints: 1,
  },
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    growthDays: 3,
    seedCost: 5,
    sellPrice: 11,
    regrowTo: null,
    bloomPoints: 2,
  },
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    growthDays: 4,
    seedCost: 6,
    sellPrice: 14,
    regrowTo: null,
    bloomPoints: 4,
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    growthDays: 6,
    seedCost: 10,
    sellPrice: 32,
    regrowTo: null,
    bloomPoints: 5,
  },
};

export const CROP_IDS = Object.keys(CROPS) as CropId[];

export interface DecorationDef {
  readonly id: DecorationId;
  readonly name: string;
  readonly cost: number;
  readonly bloomPoints: number;
}

export const DECORATIONS: Readonly<Record<DecorationId, DecorationDef>> = {
  flowerbed: { id: 'flowerbed', name: 'Flower bed', cost: 20, bloomPoints: 4 },
  bench: { id: 'bench', name: 'Garden bench', cost: 30, bloomPoints: 3 },
  birdbath: { id: 'birdbath', name: 'Bird bath', cost: 45, bloomPoints: 6 },
  windchime: { id: 'windchime', name: 'Wind chime', cost: 35, bloomPoints: 4 },
  gnome: { id: 'gnome', name: 'Garden gnome', cost: 60, bloomPoints: 8 },
};

export const DECORATION_IDS = Object.keys(DECORATIONS) as DecorationId[];

export interface VisitorDef {
  readonly id: VisitorId;
  readonly name: string;
  readonly greeting: string;
  readonly thanks: string;
  readonly wants: { readonly crop: CropId; readonly quantity: number };
  readonly rewardCoins: number;
  readonly unlocks: CropId | null;
}

/** Visitors arrive in this order, once their wanted crop is available to the player. */
export const VISITORS: readonly VisitorDef[] = [
  {
    id: 'hazel',
    name: 'Hazel the hedgehog',
    greeting: 'Could I have 3 carrots for my soup?',
    thanks: 'Thank you! Take these strawberry seeds.',
    wants: { crop: 'carrot', quantity: 3 },
    rewardCoins: 15,
    unlocks: 'strawberry',
  },
  {
    id: 'pip',
    name: 'Pip the bluebird',
    greeting: 'Two ripe tomatoes would make my day!',
    thanks: 'Tweet! Here is something for your trouble.',
    wants: { crop: 'tomato', quantity: 2 },
    rewardCoins: 30,
    unlocks: null,
  },
  {
    id: 'moss',
    name: 'Old Moss',
    greeting: 'A sunflower would brighten my cabin.',
    thanks: 'Lovely. Pumpkins grow well here, you know.',
    wants: { crop: 'sunflower', quantity: 1 },
    rewardCoins: 40,
    unlocks: 'pumpkin',
  },
];

export const BALANCE = {
  startingCoins: 20,
  startingSeeds: { carrot: 6 } as Partial<Record<CropId, number>>,
  startingCrops: ['carrot'] as readonly CropId[],
  plotWidth: 6,
  plotHeight: 4,
  rainChance: 0.2,
  visitorChance: 0.6,
  /** Visitors never arrive before this day, so the first morning is quiet. */
  firstVisitorDay: 2,
  visitorBloomPoints: 5,
  /** Bloom points needed to reach each level (index = level). */
  bloomLevels: [0, 10, 25, 45, 70, 100] as readonly number[],
  /** Crops unlocked by reaching a bloom level. */
  bloomUnlocks: { 1: 'tomato', 2: 'sunflower' } as Readonly<Partial<Record<number, CropId>>>,
} as const;

export const BLOOM_LEVEL_NAMES = [
  'Quiet',
  'Sprouting',
  'Buzzing',
  'Blooming',
  'Flourishing',
  'Thriving',
] as const;

import type { CropId, DecorationId, FishId, RecipeId, VisitorId } from './types';

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

export interface RecipeDef {
  readonly id: RecipeId;
  readonly name: string;
  readonly ingredients: Readonly<Partial<Record<CropId, number>>>;
  readonly sellPrice: number;
  readonly bloomPoints: number;
  readonly description: string;
}

export const RECIPES: Readonly<Record<RecipeId, RecipeDef>> = {
  carrot_soup: {
    id: 'carrot_soup',
    name: 'Cozy Carrot Soup',
    ingredients: { carrot: 2 },
    sellPrice: 16,
    bloomPoints: 3,
    description: 'A warm, comforting bowl of simmered garden carrots.',
  },
  tomato_pasta: {
    id: 'tomato_pasta',
    name: 'Sun-dried Pasta',
    ingredients: { tomato: 2, carrot: 1 },
    sellPrice: 24,
    bloomPoints: 4,
    description: 'Rich tomato sauce over fresh hand-rolled pasta.',
  },
  berry_jam: {
    id: 'berry_jam',
    name: 'Sweet Berry Jam',
    ingredients: { strawberry: 2 },
    sellPrice: 30,
    bloomPoints: 5,
    description: 'A fragrant jar of sweet strawberry preserves.',
  },
  pumpkin_pie: {
    id: 'pumpkin_pie',
    name: 'Autumn Pumpkin Pie',
    ingredients: { pumpkin: 1, strawberry: 1 },
    sellPrice: 55,
    bloomPoints: 8,
    description: 'A spiced, golden pie baked with fresh garden pumpkin.',
  },
  salad: {
    id: 'salad',
    name: 'Garden Harvest Salad',
    ingredients: { carrot: 1, tomato: 1, sunflower: 1 },
    sellPrice: 40,
    bloomPoints: 6,
    description: 'A colorful tossed salad with sunflower seeds.',
  },
  grilled_fish: {
    id: 'grilled_fish',
    name: 'Charbroiled Pond Fish',
    ingredients: { carrot: 1 },
    sellPrice: 35,
    bloomPoints: 5,
    description: 'Fresh pond fish seasoned with herbs and garden carrots.',
  },
  fish_stew: {
    id: 'fish_stew',
    name: 'Hearty Island Bouillabaisse',
    ingredients: { tomato: 2, carrot: 1 },
    sellPrice: 65,
    bloomPoints: 9,
    description: 'A rich, savory seafood stew packed with pond catch and tomatoes.',
  },
};

export const RECIPE_IDS: readonly RecipeId[] = [
  'carrot_soup',
  'tomato_pasta',
  'berry_jam',
  'grilled_fish',
  'salad',
  'pumpkin_pie',
  'fish_stew',
];

export interface FishDef {
  readonly id: FishId;
  readonly name: string;
  readonly rarity: number; // 0..1 chance weight
  readonly sellPrice: number;
  readonly bloomPoints: number;
}

export const FISH: Readonly<Record<FishId, FishDef>> = {
  goldfish: { id: 'goldfish', name: 'Little Goldfish', rarity: 0.45, sellPrice: 8, bloomPoints: 1 },
  perch: { id: 'perch', name: 'Pond Perch', rarity: 0.3, sellPrice: 15, bloomPoints: 2 },
  koi: { id: 'koi', name: 'Calico Koi', rarity: 0.2, sellPrice: 28, bloomPoints: 4 },
  sparklefish: {
    id: 'sparklefish',
    name: 'Moon Sparklefish',
    rarity: 0.05,
    sellPrice: 60,
    bloomPoints: 8,
  },
};

export const FISH_IDS: readonly FishId[] = ['goldfish', 'perch', 'koi', 'sparklefish'];

export interface AchievementDef {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  {
    id: 'first_harvest',
    title: 'Green Thumb',
    description: 'Harvest your first crop.',
    icon: '🌱',
  },
  {
    id: 'first_pumpkin',
    title: 'Pumpkin Master',
    description: 'Grow and harvest a giant pumpkin.',
    icon: '🎃',
  },
  {
    id: 'master_chef',
    title: 'Cottage Chef',
    description: 'Cook a delicious recipe at the cottage.',
    icon: '🍲',
  },
  {
    id: 'first_fish',
    title: 'Patient Angler',
    description: 'Catch a fish from the pond.',
    icon: '🎣',
  },
  {
    id: 'pet_cat',
    title: 'Feline Friend',
    description: 'Pet the island cat and hear it purr.',
    icon: '🐱',
  },
  {
    id: 'help_5_visitors',
    title: 'Island Host',
    description: 'Help 5 visitor requests.',
    icon: '💌',
  },
  {
    id: 'thriving_island',
    title: 'Thriving Island',
    description: 'Reach Bloom Level 5 (Flourishing or higher).',
    icon: '🌸',
  },
  {
    id: 'garden_expansion',
    title: 'Expanding Horizons',
    description: 'Expand your garden plot.',
    icon: '🏡',
  },
];

export const PLOT_EXPANSIONS = [
  { targetHeight: 5, cost: 50, requiredBloom: 20 },
  { targetHeight: 6, cost: 100, requiredBloom: 45 },
  { targetHeight: 7, cost: 180, requiredBloom: 70 },
] as const;

export const SEASON_LENGTH = 10; // Days per season

export const BALANCE = {
  startingCoins: 20,
  startingSeeds: { carrot: 6 } as Partial<Record<CropId, number>>,
  startingCrops: ['carrot'] as readonly CropId[],
  plotWidth: 6,
  plotHeight: 4,
  maxPlotHeight: 7,
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

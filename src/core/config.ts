import type {
  CropId,
  DecorationId,
  FishId,
  ForageId,
  FruitId,
  HatId,
  MusicTrackId,
  OutfitId,
  PetAccessoryId,
  PetId,
  RecipeId,
  VisitorId,
} from './types';

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

export interface ForageDef {
  readonly id: ForageId;
  readonly name: string;
  readonly icon: string;
  readonly sellPrice: number;
  readonly bloomPoints: number;
  readonly description: string;
}

export const FORAGE: Readonly<Record<ForageId, ForageDef>> = {
  mushroom: {
    id: 'mushroom',
    name: 'Forest Chanterelle',
    icon: '🍄',
    sellPrice: 8,
    bloomPoints: 1,
    description: 'Golden wild mushrooms gathered from mossy roots.',
  },
  berry: {
    id: 'berry',
    name: 'Wild Brambleberry',
    icon: '🫐',
    sellPrice: 10,
    bloomPoints: 2,
    description: 'Sweet and tangy wild berries bursting with juice.',
  },
  seashell: {
    id: 'seashell',
    name: 'Iridescent Conch',
    icon: '🐚',
    sellPrice: 12,
    bloomPoints: 2,
    description: 'A polished pearl shell washed ashore on the coastline.',
  },
  wildflower: {
    id: 'wildflower',
    name: 'Island Bellflower',
    icon: '🌸',
    sellPrice: 7,
    bloomPoints: 1,
    description: 'Delicate wildflower petals with sweet aroma.',
  },
  starfish: {
    id: 'starfish',
    name: 'Amber Starfish',
    icon: '⭐',
    sellPrice: 15,
    bloomPoints: 2,
    description: 'A tiny amber starfish found resting in the beach tide pool.',
  },
  sea_pearl: {
    id: 'sea_pearl',
    name: 'Luminous Sea Pearl',
    icon: '🦪',
    sellPrice: 35,
    bloomPoints: 5,
    description: 'A rare shimmering pearl retrieved from the ocean shallows.',
  },
};

export const FORAGE_IDS: readonly ForageId[] = [
  'mushroom',
  'berry',
  'seashell',
  'wildflower',
  'starfish',
  'sea_pearl',
];

export interface FruitDef {
  readonly id: FruitId;
  readonly name: string;
  readonly icon: string;
  readonly sellPrice: number;
  readonly bloomPoints: number;
}

export const FRUITS: Readonly<Record<FruitId, FruitDef>> = {
  apple: { id: 'apple', name: 'Crisp Red Apple', icon: '🍎', sellPrice: 14, bloomPoints: 2 },
  cherry: { id: 'cherry', name: 'Sweet Cherry', icon: '🍒', sellPrice: 18, bloomPoints: 3 },
  citrus: { id: 'citrus', name: 'Golden Lemon', icon: '🍋', sellPrice: 16, bloomPoints: 3 },
};

export const FRUIT_IDS: readonly FruitId[] = ['apple', 'cherry', 'citrus'];

export interface PetDef {
  readonly id: PetId;
  readonly name: string;
  readonly icon: string;
  readonly description: string;
  readonly cost: number;
  readonly sound: string;
}

export const PETS: Readonly<Record<PetId, PetDef>> = {
  cat: {
    id: 'cat',
    name: 'Island Calico Cat',
    icon: '🐱',
    description: 'Loves sunbeams, porch naps, and fish treats.',
    cost: 0,
    sound: 'Purrr... Meow! ❤️',
  },
  puppy: {
    id: 'puppy',
    name: 'Shiba Puppy',
    icon: '🐶',
    description: 'Playful pup that loves following you around the farm.',
    cost: 40,
    sound: 'Woof woof! 🐾❤️',
  },
  bunny: {
    id: 'bunny',
    name: 'Fluffy White Bunny',
    icon: '🐰',
    description: 'Gentle hopper that nibbles carrots in flowerbeds.',
    cost: 35,
    sound: 'Twitch twitch! 🥕❤️',
  },
  duckling: {
    id: 'duckling',
    name: 'Pond Duckling',
    icon: '🦆',
    description: 'Splashes happily near the pier and pond.',
    cost: 30,
    sound: 'Quack quack! 🌊❤️',
  },
};

export const PET_IDS: readonly PetId[] = ['cat', 'puppy', 'bunny', 'duckling'];

export interface PetAccessoryDef {
  readonly id: PetAccessoryId;
  readonly name: string;
  readonly icon: string;
}

export const PET_ACCESSORIES: Readonly<Record<PetAccessoryId, PetAccessoryDef>> = {
  flower_collar: { id: 'flower_collar', name: 'Spring Flower Collar', icon: '🌸' },
  red_bandana: { id: 'red_bandana', name: 'Red Plaid Bandana', icon: '🧣' },
  winter_scarf: { id: 'winter_scarf', name: 'Warm Knitted Scarf', icon: '🧣' },
  none: { id: 'none', name: 'No Collar', icon: '⚪' },
};

export const PET_ACCESSORY_IDS: readonly PetAccessoryId[] = [
  'flower_collar',
  'red_bandana',
  'winter_scarf',
  'none',
];

export interface MusicTrackDef {
  readonly id: MusicTrackId;
  readonly title: string;
  readonly icon: string;
  readonly description: string;
}

export const MUSIC_TRACKS: Readonly<Record<MusicTrackId, MusicTrackDef>> = {
  morning_breeze: {
    id: 'morning_breeze',
    title: 'Morning Breeze',
    icon: '☀️',
    description: 'Bright, airy melodic acoustic pentatonic tones.',
  },
  lofi_rain: {
    id: 'lofi_rain',
    title: 'Lofi Rain',
    icon: '🌧️',
    description: 'Cozy jazz chords, soft tape texture, and mellow notes.',
  },
  warm_hearth: {
    id: 'warm_hearth',
    title: 'Warm Hearth Piano',
    icon: '🔥',
    description: 'Resonant, comforting cottage fireplace piano melody.',
  },
  off: {
    id: 'off',
    title: 'Mute Gramophone',
    icon: '⏹️',
    description: 'Natural island ambience only.',
  },
};

export const MUSIC_TRACK_IDS: readonly MusicTrackId[] = [
  'morning_breeze',
  'lofi_rain',
  'warm_hearth',
  'off',
];

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
  beehive: { id: 'beehive', name: 'Beehive apiary', cost: 75, bloomPoints: 10 },
  campfire: { id: 'campfire', name: 'Stone campfire', cost: 50, bloomPoints: 8 },
  picnic_mat: { id: 'picnic_mat', name: 'Meadow picnic spot', cost: 40, bloomPoints: 6 },
  hammock: { id: 'hammock', name: 'Orchard hammock', cost: 65, bloomPoints: 8 },
  wishing_well: { id: 'wishing_well', name: 'Ancient Wishing Well', cost: 80, bloomPoints: 10 },
  greenhouse: { id: 'greenhouse', name: 'Glass Greenhouse Dome', cost: 120, bloomPoints: 15 },
};

export const DECORATION_IDS: readonly DecorationId[] = [
  'flowerbed',
  'bench',
  'birdbath',
  'windchime',
  'gnome',
  'beehive',
  'campfire',
  'picnic_mat',
  'hammock',
  'wishing_well',
  'greenhouse',
];

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
  berry_tart: {
    id: 'berry_tart',
    name: 'Rustic Berry Tart',
    ingredients: { strawberry: 1, pumpkin: 1 },
    sellPrice: 48,
    bloomPoints: 7,
    description: 'A crisp, flaky pastry bursting with glazed sweet berries.',
  },
  mushroom_soup: {
    id: 'mushroom_soup',
    name: 'Woodland Mushroom Bisque',
    ingredients: { carrot: 1, tomato: 1 },
    sellPrice: 42,
    bloomPoints: 6,
    description: 'Creamy, rich forest bisque simmered to perfection.',
  },
  apple_pie: {
    id: 'apple_pie',
    name: 'Cinnamon Orchard Pie',
    ingredients: { pumpkin: 1, carrot: 1 },
    sellPrice: 60,
    bloomPoints: 8,
    description: 'Warm spiced orchard dessert fresh from the oven.',
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
  honey_tea: {
    id: 'honey_tea',
    name: 'Golden Honey Chamomile Tea',
    ingredients: { sunflower: 1 },
    sellPrice: 38,
    bloomPoints: 6,
    description: 'Soothing chamomile tea sweetened with golden wildflower honey.',
  },
  honey_berries: {
    id: 'honey_berries',
    name: 'Honey Glazed Summer Berries',
    ingredients: { strawberry: 2 },
    sellPrice: 46,
    bloomPoints: 7,
    description: 'Fresh sweet strawberries glazed in thick golden honey.',
  },
};

export const RECIPE_IDS: readonly RecipeId[] = [
  'carrot_soup',
  'tomato_pasta',
  'berry_jam',
  'berry_tart',
  'mushroom_soup',
  'apple_pie',
  'grilled_fish',
  'salad',
  'pumpkin_pie',
  'fish_stew',
  'honey_tea',
  'honey_berries',
];

export interface OutfitDef {
  readonly id: OutfitId;
  readonly name: string;
  readonly description: string;
  readonly shirtHex: string;
  readonly overallsHex: string;
  readonly hatHex: string;
}

export const OUTFITS: Readonly<Record<OutfitId, OutfitDef>> = {
  classic: {
    id: 'classic',
    name: 'Classic Denim',
    description: 'Classic rustic farming denim overalls.',
    shirtHex: '#F2C9A0',
    overallsHex: '#7FA7D6',
    hatHex: '#E8C872',
  },
  gardener: {
    id: 'gardener',
    name: 'Garden Meadow Apron',
    description: 'Earthy green botanical apron tailored for planting.',
    shirtHex: '#FFF1DC',
    overallsHex: '#588157',
    hatHex: '#DDA15E',
  },
  autumn_sweater: {
    id: 'autumn_sweater',
    name: 'Autumn Knit Sweater',
    description: 'Warm, cozy crimson knit wool sweater.',
    shirtHex: '#E9C46A',
    overallsHex: '#BC4749',
    hatHex: '#F4A261',
  },
  floral_apron: {
    id: 'floral_apron',
    name: 'Floral Sun Dress',
    description: 'Cheerful golden floral dress adorned with sunny petals.',
    shirtHex: '#FCE7A8',
    overallsHex: '#F7B267',
    hatHex: '#F25C54',
  },
};

export const OUTFIT_IDS: readonly OutfitId[] = [
  'classic',
  'gardener',
  'autumn_sweater',
  'floral_apron',
];

export interface HatDef {
  readonly id: HatId;
  readonly name: string;
  readonly icon: string;
}

export const HATS: Readonly<Record<HatId, HatDef>> = {
  straw_hat: { id: 'straw_hat', name: 'Woven Straw Sunhat', icon: '👒' },
  flower_crown: { id: 'flower_crown', name: 'Wildflower Crown', icon: '👑' },
  bandana: { id: 'bandana', name: 'Meadow Bandana', icon: '🧣' },
  none: { id: 'none', name: 'No Hat', icon: '👤' },
};

export const HAT_IDS: readonly HatId[] = ['straw_hat', 'flower_crown', 'bandana', 'none'];

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
    id: 'forager_master',
    title: 'Shoreline Forager',
    description: 'Forage wild mushrooms, berries, or seashells along the shoreline.',
    icon: '🍄',
  },
  {
    id: 'gift_visitor',
    title: 'Generous Host',
    description: 'Gift a delicious cooked meal or hot tea to a visitor.',
    icon: '🎁',
  },
  {
    id: 'orchard_expansion',
    title: 'Orchard Haven',
    description: 'Unlock the wooden bridge and miniature fruit islet.',
    icon: '🍎',
  },
  {
    id: 'jukebox_tunes',
    title: 'Vinyl Nostalgia',
    description: 'Select cozy melodies on the vintage cottage gramophone.',
    icon: '🎵',
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
  {
    id: 'tea_stand_barista',
    title: 'Cozy Stand Host',
    description: 'Serve hungry visitors from your roadside farmstand.',
    icon: '☕',
  },
  {
    id: 'stargazer',
    title: 'Night Stargazer',
    description: 'Gaze into the night sky through the islet telescope.',
    icon: '🔭',
  },
  {
    id: 'wishing_well_blessed',
    title: 'Wish Upon a Coin',
    description: 'Toss a coin into the ancient stone wishing well.',
    icon: '🪙',
  },
  {
    id: 'photo_album_first',
    title: 'Postcard Memories',
    description: 'Snap your first island photo and save it to the album.',
    icon: '📸',
  },
];

export interface ConstellationDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
}

export const CONSTELLATIONS: readonly ConstellationDef[] = [
  {
    id: 'golden_koi',
    name: 'The Golden Koi',
    description: 'A shimmering constellation said to bring bountiful harvests and calm waters.',
    icon: '✨🐟',
  },
  {
    id: 'cosmic_cat',
    name: 'The Hearthside Feline',
    description: 'Four bright stars depicting a curled up cat resting by celestial embers.',
    icon: '✨🐱',
  },
  {
    id: 'great_sprout',
    name: 'The Great Island Sprout',
    description: 'Guiding star cluster that sparkles above tranquil meadow blossoms.',
    icon: '✨🌱',
  },
  {
    id: 'sailors_beacon',
    name: "Sailor's Beacon",
    description: 'A luminous northern lantern constellation guiding wandering island travelers.',
    icon: '✨🏮',
  },
];

export interface BottleLetterDef {
  readonly letter: string;
  readonly rewardCoins: number;
  readonly rewardSeed?: CropId;
}

export const BOTTLE_LETTERS: readonly BottleLetterDef[] = [
  {
    letter:
      'Dear friend across the tides, may your crops drink deeply of the morning dew and your hearth burn bright.',
    rewardCoins: 15,
  },
  {
    letter:
      'Found a pocket of rare heirloom seeds along the coral reef! Hope they flourish under your gentle care.',
    rewardSeed: 'sunflower',
    rewardCoins: 20,
  },
  {
    letter:
      'The sea was calm tonight. A wandering seagull sang of a quiet green isle where honey and chamomile tea brew.',
    rewardCoins: 25,
  },
  {
    letter:
      'Toss a gold coin into the wishing well when the moon is full; ancient spirits whisper good fortune to island farmers.',
    rewardCoins: 30,
  },
];

export const FARMSTAND_CUSTOMERS = [
  'Traveler Rowan',
  'Captain Finn',
  'Botanist Clover',
  'Sailor Maeve',
  'Forager Bramble',
];

export const ISLET_EXPANSION = {
  cost: 60,
  requiredBloom: 25,
} as const;

export const GREENHOUSE_EXPANSION = {
  cost: 100,
  requiredBloom: 40,
} as const;

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

/**
 * Core domain types. Everything in `src/core` is pure TypeScript with no DOM or
 * Babylon.js dependency, so it can be unit-tested in Node and reused anywhere.
 *
 * All state objects are treated as immutable: rules return new objects and keep
 * unchanged branches by reference (structural sharing). Views rely on that to
 * detect changes with a cheap `===` check.
 */

export type CropId = 'carrot' | 'tomato' | 'strawberry' | 'sunflower' | 'pumpkin';
export type ToolId = 'hoe' | 'seeds' | 'water' | 'basket';
export type DecorationId =
  | 'bench'
  | 'flowerbed'
  | 'birdbath'
  | 'windchime'
  | 'gnome'
  | 'beehive'
  | 'campfire'
  | 'picnic_mat'
  | 'hammock'
  | 'wishing_well'
  | 'greenhouse';
export type VisitorId = 'hazel' | 'pip' | 'moss';
export type Weather = 'clear' | 'rain';
export type CropStage = 'seed' | 'sprout' | 'growing' | 'ripe';

export type OutfitId = 'classic' | 'gardener' | 'autumn_sweater' | 'floral_apron';
export type HatId = 'straw_hat' | 'flower_crown' | 'bandana' | 'none';
export type PetAccessoryId = 'flower_collar' | 'red_bandana' | 'winter_scarf' | 'none';

/** Integer cell coordinate on the island's walk grid. */
export interface Cell {
  readonly x: number;
  readonly z: number;
}

export interface PlantedCrop {
  readonly id: CropId;
  /** Number of watered nights this crop has grown. */
  readonly growth: number;
}

export interface Tile {
  readonly tilled: boolean;
  readonly watered: boolean;
  readonly crop: PlantedCrop | null;
}

export interface Plot {
  readonly width: number;
  readonly height: number;
  /** Row-major: index = y * width + x. */
  readonly tiles: readonly Tile[];
}

export type CropCounts = Readonly<Record<CropId, number>>;

export interface Inventory {
  readonly seeds: CropCounts;
  readonly produce: CropCounts;
}

export interface ActiveVisitor {
  readonly id: VisitorId;
  readonly arrivedOnDay: number;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type RecipeId =
  | 'carrot_soup'
  | 'berry_jam'
  | 'pumpkin_pie'
  | 'salad'
  | 'tomato_pasta'
  | 'grilled_fish'
  | 'fish_stew'
  | 'berry_tart'
  | 'mushroom_soup'
  | 'apple_pie'
  | 'honey_tea'
  | 'honey_berries';
export type FishId = 'koi' | 'goldfish' | 'perch' | 'sparklefish';
export type ForageId = 'mushroom' | 'berry' | 'seashell' | 'wildflower' | 'starfish' | 'sea_pearl';
export type FruitId = 'apple' | 'cherry' | 'citrus';
export type MusicTrackId = 'morning_breeze' | 'lofi_rain' | 'warm_hearth' | 'off';
export type PetId = 'cat' | 'puppy' | 'bunny' | 'duckling';

export interface ForageNode {
  readonly id: string;
  readonly type: ForageId;
  readonly cell: Cell;
}

export interface FarmstandOrder {
  readonly id: string;
  readonly item: RecipeId | CropId;
  readonly itemType: 'recipe' | 'crop';
  readonly customerName: string;
  readonly rewardCoins: number;
  readonly rewardBloom: number;
}

export interface BeachBottle {
  readonly id: string;
  readonly letter: string;
  readonly rewardSeed?: CropId;
  readonly rewardCoins?: number;
  readonly read: boolean;
}

export type PostcardFilter = 'vintage' | 'polaroid' | 'warm_sun' | 'misty_dusk';

export interface Postcard {
  readonly id: string;
  readonly title: string;
  readonly day: number;
  readonly season: Season;
  readonly filter: PostcardFilter;
  readonly caption: string;
}

export interface Settings {
  readonly muted: boolean;
  /** 0..1 */
  readonly volume: number;
  readonly musicVolume?: number;
  readonly highContrast?: boolean;
  readonly largeText?: boolean;
  readonly colorblindMode?: boolean;
  readonly language?: string;
}

export interface Stats {
  readonly harvested: number;
  readonly earned: number;
  readonly cooked?: number;
  readonly fishCaught?: number;
  readonly catPets?: number;
  readonly foraged?: number;
  readonly visitorGifts?: number;
  readonly honeyCollected?: number;
  readonly ordersServed?: number;
  readonly wishesMade?: number;
  readonly starsObserved?: number;
  readonly postcardsTaken?: number;
}

export interface GameState {
  readonly day: number;
  readonly season?: Season;
  readonly coins: number;
  readonly plot: Plot;
  readonly player: Cell;
  readonly selectedTool: ToolId;
  readonly selectedSeed: CropId;
  readonly inventory: Inventory;
  readonly cookedInventory?: Readonly<Partial<Record<RecipeId, number>>>;
  readonly fishInventory?: Readonly<Partial<Record<FishId, number>>>;
  readonly forageInventory?: Readonly<Partial<Record<ForageId, number>>>;
  readonly fruitInventory?: Readonly<Partial<Record<FruitId, number>>>;
  readonly honeyJars?: number;
  readonly campfireLit?: boolean;
  readonly currentOutfit?: OutfitId;
  readonly currentHat?: HatId;
  readonly petAccessories?: Readonly<Partial<Record<PetId, PetAccessoryId>>>;
  readonly forageNodes?: readonly ForageNode[];
  readonly isletUnlocked?: boolean;
  readonly greenhouseUnlocked?: boolean;
  readonly pets?: readonly PetId[];
  readonly activeMusicTrack?: MusicTrackId;
  readonly unlockedCrops: readonly CropId[];
  readonly unlockedRecipes?: readonly RecipeId[];
  readonly decorations: readonly DecorationId[];
  readonly bloom: number;
  readonly visitor: ActiveVisitor | null;
  readonly visitorsHelped: readonly VisitorId[];
  readonly farmstandOrders?: readonly FarmstandOrder[];
  readonly beachBottle?: BeachBottle | null;
  readonly postcards?: readonly Postcard[];
  readonly weather: Weather;
  readonly catHappiness?: number;
  readonly achievements?: readonly string[];
  readonly journal?: readonly string[];
  /** Seed for the deterministic PRNG; advanced whenever randomness is consumed. */
  readonly rngSeed: number;
  readonly settings: Settings;
  readonly stats: Stats;
}

/** Why an action could not be applied. Surfaced to the player as a gentle hint. */
export type RejectReason =
  | 'not-tilled'
  | 'already-tilled'
  | 'occupied'
  | 'no-seeds'
  | 'no-crop'
  | 'not-ripe'
  | 'already-watered'
  | 'locked'
  | 'not-enough-coins'
  | 'not-enough-produce'
  | 'not-enough-ingredients'
  | 'not-enough-forage'
  | 'not-enough-fruit'
  | 'islet-locked'
  | 'greenhouse-locked'
  | 'already-owned'
  | 'max-size'
  | 'no-visitor'
  | 'no-order'
  | 'no-bottle'
  | 'no-meal-to-eat'
  | 'no-fish-to-eat'
  | 'blocked'
  | 'out-of-bounds';

/** Things that happened as a result of an action. Drives sounds, particles and toasts. */
export type GameEvent =
  | { readonly type: 'tilled'; readonly index: number }
  | { readonly type: 'planted'; readonly index: number; readonly crop: CropId }
  | { readonly type: 'watered'; readonly index: number }
  | { readonly type: 'harvested'; readonly index: number; readonly crop: CropId }
  | {
      readonly type: 'sold';
      readonly crop: CropId;
      readonly quantity: number;
      readonly coins: number;
    }
  | { readonly type: 'bought-seeds'; readonly crop: CropId; readonly quantity: number }
  | { readonly type: 'bought-decoration'; readonly decoration: DecorationId }
  | { readonly type: 'plot-expanded'; readonly newHeight: number }
  | {
      readonly type: 'day-started';
      readonly day: number;
      readonly weather: Weather;
      readonly season?: Season;
    }
  | { readonly type: 'visitor-arrived'; readonly visitor: VisitorId }
  | {
      readonly type: 'visitor-helped';
      readonly visitor: VisitorId;
      readonly unlocked: CropId | null;
    }
  | {
      readonly type: 'visitor-gifted';
      readonly visitor: VisitorId;
      readonly gift: string;
    }
  | { readonly type: 'farmstand-served'; readonly orderId: string; readonly rewardCoins: number }
  | { readonly type: 'bottle-read'; readonly letter: string; readonly rewardCoins?: number }
  | { readonly type: 'stargazed'; readonly constellation: string }
  | { readonly type: 'wishing-well-blessed'; readonly blessing: string }
  | { readonly type: 'greenhouse-unlocked' }
  | { readonly type: 'postcard-snapped'; readonly title: string }
  | { readonly type: 'bloom-level-up'; readonly level: number }
  | { readonly type: 'crop-unlocked'; readonly crop: CropId }
  | { readonly type: 'cooked'; readonly recipe: RecipeId }
  | { readonly type: 'meal-eaten'; readonly recipe: RecipeId }
  | { readonly type: 'fish-caught'; readonly fish: FishId }
  | { readonly type: 'fish-eaten'; readonly fish: FishId }
  | { readonly type: 'foraged'; readonly item: ForageId }
  | { readonly type: 'islet-unlocked' }
  | { readonly type: 'orchard-harvested'; readonly fruit: FruitId; readonly count: number }
  | { readonly type: 'music-track-changed'; readonly track: MusicTrackId }
  | { readonly type: 'pet-adopted'; readonly pet: PetId }
  | {
      readonly type: 'pet-accessory-changed';
      readonly pet: PetId;
      readonly accessory: PetAccessoryId;
    }
  | { readonly type: 'pet-interacted'; readonly pet: PetId; readonly sound: string }
  | {
      readonly type: 'cottage-activity';
      readonly activity:
        | 'kindle_fire'
        | 'clean_cottage'
        | 'read_book'
        | 'brew_tea'
        | 'sit_hearth'
        | 'sit_table'
        | 'take_nap';
    }
  | { readonly type: 'outfit-changed'; readonly outfit: OutfitId }
  | { readonly type: 'hat-changed'; readonly hat: HatId }
  | { readonly type: 'honey-harvested'; readonly count: number }
  | { readonly type: 'campfire-toggled'; readonly lit: boolean }
  | { readonly type: 'hammock-rested' }
  | { readonly type: 'pet-cat'; readonly happiness: number }
  | { readonly type: 'achievement-unlocked'; readonly achievement: string }
  | { readonly type: 'journal-entry'; readonly entry: string }
  | { readonly type: 'moved'; readonly to: Cell }
  | { readonly type: 'rejected'; readonly reason: RejectReason };

/** Result of applying a rule: the next state plus what happened. */
export interface Outcome {
  readonly state: GameState;
  readonly events: readonly GameEvent[];
}

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
export type DecorationId = 'bench' | 'flowerbed' | 'birdbath' | 'windchime' | 'gnome';
export type VisitorId = 'hazel' | 'pip' | 'moss';
export type Weather = 'clear' | 'rain';
export type CropStage = 'seed' | 'sprout' | 'growing' | 'ripe';

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

export type Season = 'spring' | 'summer' | 'autumn';
export type RecipeId = 'carrot_soup' | 'berry_jam' | 'pumpkin_pie' | 'salad' | 'tomato_pasta';
export type FishId = 'koi' | 'goldfish' | 'perch' | 'sparklefish';

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
  readonly unlockedCrops: readonly CropId[];
  readonly unlockedRecipes?: readonly RecipeId[];
  readonly decorations: readonly DecorationId[];
  readonly bloom: number;
  readonly visitor: ActiveVisitor | null;
  readonly visitorsHelped: readonly VisitorId[];
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
  | 'already-owned'
  | 'max-size'
  | 'no-visitor'
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
  | { readonly type: 'bloom-level-up'; readonly level: number }
  | { readonly type: 'crop-unlocked'; readonly crop: CropId }
  | { readonly type: 'cooked'; readonly recipe: RecipeId }
  | { readonly type: 'fish-caught'; readonly fish: FishId }
  | {
      readonly type: 'cottage-activity';
      readonly activity: 'kindle_fire' | 'clean_cottage' | 'read_book' | 'brew_tea';
    }
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

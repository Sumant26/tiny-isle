import type {
  Cell,
  CropId,
  DecorationId,
  FishId,
  GameState,
  RecipeId,
  Settings,
  ToolId,
} from '../core/types';

/**
 * Every change to game state goes through one of these serialisable actions.
 * That gives a single audit trail (handy for debugging and replays) and keeps
 * the reducer the only place where state is produced.
 */
export type Action =
  | { readonly type: 'tool/select'; readonly tool: ToolId }
  | { readonly type: 'seed/select'; readonly crop: CropId }
  | { readonly type: 'seed/cycle'; readonly direction: 1 | -1 }
  | { readonly type: 'player/move'; readonly to: Cell }
  | { readonly type: 'tile/use'; readonly index: number }
  | { readonly type: 'day/sleep' }
  | { readonly type: 'market/sell'; readonly crop: CropId; readonly quantity: number }
  | { readonly type: 'market/sellAll' }
  | { readonly type: 'shop/buySeeds'; readonly crop: CropId; readonly quantity: number }
  | { readonly type: 'shop/buyDecoration'; readonly decoration: DecorationId }
  | { readonly type: 'shop/expandPlot' }
  | { readonly type: 'cottage/cook'; readonly recipe: RecipeId }
  | { readonly type: 'cottage/eat'; readonly recipe: RecipeId }
  | {
      readonly type: 'cottage/activity';
      readonly activity:
        | 'kindle_fire'
        | 'clean_cottage'
        | 'read_book'
        | 'brew_tea'
        | 'sit_hearth'
        | 'sit_table'
        | 'take_nap';
    }
  | { readonly type: 'pond/fish' }
  | { readonly type: 'pond/eatFish'; readonly fish: FishId }
  | { readonly type: 'market/sellFish'; readonly fish: FishId; readonly quantity: number }
  | { readonly type: 'cat/pet' }
  | { readonly type: 'visitor/fulfill' }
  | { readonly type: 'settings/update'; readonly patch: Partial<Settings> }
  | { readonly type: 'game/load'; readonly state: GameState };

export type ActionType = Action['type'];

/** Typed action creators, so call sites never hand-write action objects. */
export const actions = {
  selectTool: (tool: ToolId): Action => ({ type: 'tool/select', tool }),
  selectSeed: (crop: CropId): Action => ({ type: 'seed/select', crop }),
  cycleSeed: (direction: 1 | -1): Action => ({ type: 'seed/cycle', direction }),
  move: (to: Cell): Action => ({ type: 'player/move', to }),
  useTile: (index: number): Action => ({ type: 'tile/use', index }),
  sleep: (): Action => ({ type: 'day/sleep' }),
  sell: (crop: CropId, quantity: number): Action => ({ type: 'market/sell', crop, quantity }),
  sellFish: (fish: FishId, quantity: number): Action => ({
    type: 'market/sellFish',
    fish,
    quantity,
  }),
  sellAll: (): Action => ({ type: 'market/sellAll' }),
  buySeeds: (crop: CropId, quantity: number): Action => ({ type: 'shop/buySeeds', crop, quantity }),
  buyDecoration: (decoration: DecorationId): Action => ({ type: 'shop/buyDecoration', decoration }),
  expandPlot: (): Action => ({ type: 'shop/expandPlot' }),
  cook: (recipe: RecipeId): Action => ({ type: 'cottage/cook', recipe }),
  eatMeal: (recipe: RecipeId): Action => ({ type: 'cottage/eat', recipe }),
  eatFish: (fish: FishId): Action => ({ type: 'pond/eatFish', fish }),
  cottageActivity: (
    activity:
      | 'kindle_fire'
      | 'clean_cottage'
      | 'read_book'
      | 'brew_tea'
      | 'sit_hearth'
      | 'sit_table'
      | 'take_nap',
  ): Action => ({ type: 'cottage/activity', activity }),
  fish: (): Action => ({ type: 'pond/fish' }),
  petCat: (): Action => ({ type: 'cat/pet' }),
  fulfillVisitor: (): Action => ({ type: 'visitor/fulfill' }),
  updateSettings: (patch: Partial<Settings>): Action => ({ type: 'settings/update', patch }),
  load: (state: GameState): Action => ({ type: 'game/load', state }),
} as const;

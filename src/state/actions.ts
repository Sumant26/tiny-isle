import type { Cell, CropId, DecorationId, GameState, Settings, ToolId } from '../core/types';

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
  sellAll: (): Action => ({ type: 'market/sellAll' }),
  buySeeds: (crop: CropId, quantity: number): Action => ({ type: 'shop/buySeeds', crop, quantity }),
  buyDecoration: (decoration: DecorationId): Action => ({ type: 'shop/buyDecoration', decoration }),
  fulfillVisitor: (): Action => ({ type: 'visitor/fulfill' }),
  updateSettings: (patch: Partial<Settings>): Action => ({ type: 'settings/update', patch }),
  load: (state: GameState): Action => ({ type: 'game/load', state }),
} as const;

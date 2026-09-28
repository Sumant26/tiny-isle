import { sleep } from '../core/rules/day';
import { buyDecoration, buySeeds, sell, sellAll } from '../core/rules/economy';
import { useTool } from '../core/rules/farming';
import { ok } from '../core/rules/outcome';
import { cycleSeed, moveTo, selectSeed, selectTool, updateSettings } from '../core/rules/player';
import { fulfillVisitor } from '../core/rules/visitors';
import type { GameState, Outcome } from '../core/types';
import type { Action } from './actions';

/** Pure: (state, action) -> { state, events }. Delegates to the domain rules. */
export const reducer = (state: GameState, action: Action): Outcome => {
  switch (action.type) {
    case 'tool/select':
      return selectTool(state, action.tool);
    case 'seed/select':
      return selectSeed(state, action.crop);
    case 'seed/cycle':
      return cycleSeed(state, action.direction);
    case 'player/move':
      return moveTo(state, action.to);
    case 'tile/use':
      return useTool(state, action.index);
    case 'day/sleep':
      return sleep(state);
    case 'market/sell':
      return sell(state, action.crop, action.quantity);
    case 'market/sellAll':
      return sellAll(state);
    case 'shop/buySeeds':
      return buySeeds(state, action.crop, action.quantity);
    case 'shop/buyDecoration':
      return buyDecoration(state, action.decoration);
    case 'visitor/fulfill':
      return fulfillVisitor(state);
    case 'settings/update':
      return updateSettings(state, action.patch);
    case 'game/load':
      return ok(action.state);
  }
};

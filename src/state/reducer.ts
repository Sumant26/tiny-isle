import { checkAchievements } from '../core/rules/achievements';
import { petCat } from '../core/rules/cat';
import { cook } from '../core/rules/cooking';
import { sleep } from '../core/rules/day';
import { buyDecoration, buySeeds, sell, sellAll } from '../core/rules/economy';
import { expandPlot } from '../core/rules/expansion';
import { useTool } from '../core/rules/farming';
import { fish } from '../core/rules/fishing';
import { chain, ok } from '../core/rules/outcome';
import { cycleSeed, moveTo, selectSeed, selectTool, updateSettings } from '../core/rules/player';
import { fulfillVisitor } from '../core/rules/visitors';
import type { GameState, Outcome } from '../core/types';
import type { Action } from './actions';

/** Pure: (state, action) -> { state, events }. Delegates to the domain rules. */
export const reducer = (state: GameState, action: Action): Outcome => {
  const handleAction = (): Outcome => {
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
      case 'shop/expandPlot':
        return expandPlot(state);
      case 'cottage/cook':
        return cook(state, action.recipe);
      case 'pond/fish':
        return fish(state);
      case 'cat/pet':
        return petCat(state);
      case 'visitor/fulfill':
        return fulfillVisitor(state);
      case 'settings/update':
        return updateSettings(state, action.patch);
      case 'game/load':
        return ok(action.state);
    }
  };

  const outcome = handleAction();
  if (outcome.state === state) return outcome;
  return chain(outcome, checkAchievements);
};

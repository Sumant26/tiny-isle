import { checkAchievements, unlockAchievement } from '../core/rules/achievements';
import { petCat } from '../core/rules/cat';
import { cook, eatFish, eatMeal } from '../core/rules/cooking';
import { cottageActivity } from '../core/rules/cottage';
import { sleep } from '../core/rules/day';
import {
  buyDecoration,
  buySeeds,
  sell,
  sellAll,
  sellFish,
  sellForage,
  sellFruit,
} from '../core/rules/economy';
import { expandPlot } from '../core/rules/expansion';
import { useTool } from '../core/rules/farming';
import { fish } from '../core/rules/fishing';
import { forageItem } from '../core/rules/foraging';
import { chain, ok } from '../core/rules/outcome';
import { adoptPet, petAnimal } from '../core/rules/pets';
import { cycleSeed, moveTo, selectSeed, selectTool, updateSettings } from '../core/rules/player';
import { harvestOrchard, unlockIslet } from '../core/rules/progression';
import { fulfillVisitor, giftVisitor } from '../core/rules/visitors';
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
      case 'market/sellFish':
        return sellFish(state, action.fish, action.quantity);
      case 'market/sellForage':
        return sellForage(state, action.item, action.quantity);
      case 'market/sellFruit':
        return sellFruit(state, action.fruit, action.quantity);
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
      case 'cottage/eat':
        return eatMeal(state, action.recipe);
      case 'cottage/activity':
        return cottageActivity(state, action.activity);
      case 'pond/fish':
        return fish(state);
      case 'pond/eatFish':
        return eatFish(state, action.fish);
      case 'forage/collect':
        return forageItem(state, action.nodeId);
      case 'visitor/gift':
        return giftVisitor(state, action.recipe);
      case 'islet/unlock':
        return unlockIslet(state);
      case 'orchard/harvest':
        return harvestOrchard(state);
      case 'pet/adopt':
        return adoptPet(state, action.pet);
      case 'pet/interact':
        return petAnimal(state, action.pet);
      case 'music/setTrack':
        return chain(
          ok(
            { ...state, activeMusicTrack: action.track },
            { type: 'music-track-changed', track: action.track },
          ),
          (s) => (action.track !== 'off' ? unlockAchievement(s, 'jukebox_tunes') : ok(s)),
        );
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

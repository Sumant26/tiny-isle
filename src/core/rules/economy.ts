import { CROP_IDS, CROPS, DECORATIONS, FISH, FISH_IDS } from '../config';
import type { CropId, DecorationId, FishId, GameEvent, GameState, Outcome } from '../types';
import { addCount, chain, ok, reject } from './outcome';
import { addBloom } from './progression';

const isPositiveInt = (n: number): boolean => Number.isInteger(n) && n > 0;

export const sell = (state: GameState, crop: CropId, quantity: number): Outcome => {
  if (!isPositiveInt(quantity) || state.inventory.produce[crop] < quantity) {
    return reject(state, 'not-enough-produce');
  }
  const coins = CROPS[crop].sellPrice * quantity;
  return ok(
    {
      ...state,
      coins: state.coins + coins,
      inventory: {
        ...state.inventory,
        produce: addCount(state.inventory.produce, crop, -quantity),
      },
      stats: { ...state.stats, earned: state.stats.earned + coins },
    },
    { type: 'sold', crop, quantity, coins },
  );
};

export const sellFish = (state: GameState, fish: FishId, quantity: number): Outcome => {
  const current = state.fishInventory?.[fish] ?? 0;
  if (!isPositiveInt(quantity) || current < quantity) {
    return reject(state, 'not-enough-produce');
  }
  const coins = FISH[fish].sellPrice * quantity;
  return ok(
    {
      ...state,
      coins: state.coins + coins,
      fishInventory: {
        ...state.fishInventory,
        [fish]: current - quantity,
      },
      stats: { ...state.stats, earned: state.stats.earned + coins },
    },
    { type: 'sold', crop: 'carrot', quantity, coins },
  );
};

export const sellAll = (state: GameState): Outcome => {
  const events: GameEvent[] = [];
  let next = state;
  for (const crop of CROP_IDS) {
    const qty = next.inventory.produce[crop];
    if (qty > 0) {
      const r = sell(next, crop, qty);
      next = r.state;
      events.push(...r.events);
    }
  }
  for (const f of FISH_IDS) {
    const qty = next.fishInventory?.[f] ?? 0;
    if (qty > 0) {
      const r = sellFish(next, f, qty);
      next = r.state;
      events.push(...r.events);
    }
  }
  return events.length ? { state: next, events } : reject(state, 'not-enough-produce');
};

export const buySeeds = (state: GameState, crop: CropId, quantity: number): Outcome => {
  if (!state.unlockedCrops.includes(crop)) return reject(state, 'locked');
  if (!isPositiveInt(quantity)) return reject(state, 'not-enough-coins');
  const cost = CROPS[crop].seedCost * quantity;
  if (state.coins < cost) return reject(state, 'not-enough-coins');
  return ok(
    {
      ...state,
      coins: state.coins - cost,
      inventory: { ...state.inventory, seeds: addCount(state.inventory.seeds, crop, quantity) },
    },
    { type: 'bought-seeds', crop, quantity },
  );
};

export const buyDecoration = (state: GameState, id: DecorationId): Outcome => {
  if (state.decorations.includes(id)) return reject(state, 'already-owned');
  const def = DECORATIONS[id];
  if (state.coins < def.cost) return reject(state, 'not-enough-coins');
  return chain(
    ok(
      { ...state, coins: state.coins - def.cost, decorations: [...state.decorations, id] },
      { type: 'bought-decoration', decoration: id },
    ),
    (s) => addBloom(s, def.bloomPoints),
  );
};

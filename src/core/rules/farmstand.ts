import type { CropId, GameState, Outcome, RecipeId } from '../types';

export const serveFarmstandOrder = (state: GameState, orderId: string): Outcome => {
  const orders = state.farmstandOrders ?? [];
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return { state, events: [{ type: 'rejected', reason: 'no-order' }] };
  }

  if (order.itemType === 'recipe') {
    const cooked = state.cookedInventory ?? {};
    const count = cooked[order.item as RecipeId] ?? 0;
    if (count < 1) {
      return { state, events: [{ type: 'rejected', reason: 'not-enough-ingredients' }] };
    }
    const nextCooked = { ...cooked, [order.item as RecipeId]: count - 1 };
    const nextOrders = orders.filter((o) => o.id !== orderId);
    return {
      state: {
        ...state,
        coins: state.coins + order.rewardCoins,
        bloom: state.bloom + order.rewardBloom,
        cookedInventory: nextCooked,
        farmstandOrders: nextOrders,
        stats: {
          ...state.stats,
          earned: state.stats.earned + order.rewardCoins,
          ordersServed: (state.stats.ordersServed ?? 0) + 1,
        },
      },
      events: [{ type: 'farmstand-served', orderId, rewardCoins: order.rewardCoins }],
    };
  } else {
    const produceCount = state.inventory.produce[order.item as CropId];
    if (produceCount < 1) {
      return { state, events: [{ type: 'rejected', reason: 'not-enough-produce' }] };
    }
    const nextProduce = {
      ...state.inventory.produce,
      [order.item as CropId]: produceCount - 1,
    };
    const nextOrders = orders.filter((o) => o.id !== orderId);
    return {
      state: {
        ...state,
        coins: state.coins + order.rewardCoins,
        bloom: state.bloom + order.rewardBloom,
        inventory: {
          ...state.inventory,
          produce: nextProduce,
        },
        farmstandOrders: nextOrders,
        stats: {
          ...state.stats,
          earned: state.stats.earned + order.rewardCoins,
          ordersServed: (state.stats.ordersServed ?? 0) + 1,
        },
      },
      events: [{ type: 'farmstand-served', orderId, rewardCoins: order.rewardCoins }],
    };
  }
};

export const readBeachBottle = (state: GameState): Outcome => {
  const bottle = state.beachBottle;
  if (!bottle || bottle.read) {
    return { state, events: [{ type: 'rejected', reason: 'no-bottle' }] };
  }

  const coinsAwarded = bottle.rewardCoins ?? 0;
  let nextInventory = state.inventory;
  if (bottle.rewardSeed) {
    const currentSeedCount = state.inventory.seeds[bottle.rewardSeed];
    nextInventory = {
      ...state.inventory,
      seeds: {
        ...state.inventory.seeds,
        [bottle.rewardSeed]: currentSeedCount + 2,
      },
    };
  }

  const updatedBottle = { ...bottle, read: true };
  const journalEntry = `Read ocean message in a bottle: "${bottle.letter}"`;
  const currentJournal = state.journal ?? [];

  return {
    state: {
      ...state,
      coins: state.coins + coinsAwarded,
      inventory: nextInventory,
      beachBottle: updatedBottle,
      journal: [...currentJournal, journalEntry],
      stats: {
        ...state.stats,
        earned: state.stats.earned + coinsAwarded,
      },
    },
    events: [
      {
        type: 'bottle-read',
        letter: bottle.letter,
        ...(coinsAwarded > 0 ? { rewardCoins: coinsAwarded } : {}),
      },
    ],
  };
};

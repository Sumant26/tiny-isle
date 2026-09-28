import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { readBeachBottle, serveFarmstandOrder } from './farmstand';

describe('farmstand and beach bottle rules', () => {
  it('serves farmstand order when player has cooked dish', () => {
    const s0 = {
      ...makeState(),
      cookedInventory: { carrot_soup: 2 },
      farmstandOrders: [
        {
          id: 'ord_1',
          item: 'carrot_soup' as const,
          itemType: 'recipe' as const,
          customerName: 'Traveler Rowan',
          rewardCoins: 25,
          rewardBloom: 5,
        },
      ],
    };

    const { state, events } = serveFarmstandOrder(s0, 'ord_1');
    expect(state.coins).toBe(s0.coins + 25);
    expect(state.bloom).toBe(s0.bloom + 5);
    expect(state.cookedInventory?.carrot_soup).toBe(1);
    expect(state.farmstandOrders).toHaveLength(0);
    expect(state.stats.ordersServed).toBe(1);
    expect(events).toEqual([{ type: 'farmstand-served', orderId: 'ord_1', rewardCoins: 25 }]);
  });

  it('rejects order if player does not have the dish', () => {
    const s0 = {
      ...makeState(),
      cookedInventory: { carrot_soup: 0 },
      farmstandOrders: [
        {
          id: 'ord_1',
          item: 'carrot_soup' as const,
          itemType: 'recipe' as const,
          customerName: 'Traveler Rowan',
          rewardCoins: 25,
          rewardBloom: 5,
        },
      ],
    };

    const { state, events } = serveFarmstandOrder(s0, 'ord_1');
    expect(state).toBe(s0);
    expect(events).toEqual([{ type: 'rejected', reason: 'not-enough-ingredients' }]);
  });

  it('reads beach message in a bottle and grants rewards', () => {
    const s0 = {
      ...makeState(),
      beachBottle: {
        id: 'bot_1',
        letter: 'Greetings from the high seas!',
        rewardCoins: 20,
        rewardSeed: 'sunflower' as const,
        read: false,
      },
    };

    const { state, events } = readBeachBottle(s0);
    expect(state.coins).toBe(s0.coins + 20);
    expect(state.inventory.seeds.sunflower).toBe(2);
    expect(state.beachBottle?.read).toBe(true);
    expect(events).toEqual([
      {
        type: 'bottle-read',
        letter: 'Greetings from the high seas!',
        rewardCoins: 20,
      },
    ]);
  });
});

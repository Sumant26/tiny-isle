import { describe, expect, it } from 'vitest';
import { makeState, unlockAll, withProduce } from '../test/fixtures';
import { actions } from './actions';
import { reducer } from './reducer';

describe('reducer', () => {
  it('routes every action type to its rule', () => {
    let s = unlockAll(makeState({ coins: 500 }));
    s = reducer(s, actions.selectTool('water')).state;
    expect(s.selectedTool).toBe('water');
    s = reducer(s, actions.selectSeed('tomato')).state;
    expect(s.selectedSeed).toBe('tomato');
    s = reducer(s, actions.cycleSeed(1)).state;
    expect(s.selectedSeed).toBe('strawberry');
    s = reducer(s, actions.move({ x: 5, z: 5 })).state;
    expect(s.player).toEqual({ x: 5, z: 5 });
    s = reducer({ ...s, selectedTool: 'hoe' }, actions.useTile(0)).state;
    expect(s.plot.tiles[0]?.tilled).toBe(true);
    s = reducer(s, actions.sleep()).state;
    expect(s.day).toBe(2);
    s = reducer(withProduce(s, 'carrot', 2), actions.sell('carrot', 1)).state;
    expect(s.inventory.produce.carrot).toBe(1);
    s = reducer(s, actions.sellAll()).state;
    expect(s.inventory.produce.carrot).toBe(0);
    s = reducer(s, actions.buySeeds('pumpkin', 1)).state;
    expect(s.inventory.seeds.pumpkin).toBe(1);
    s = reducer(s, actions.buyDecoration('gnome')).state;
    expect(s.decorations).toContain('gnome');
    s = reducer(
      withProduce({ ...s, visitor: { id: 'hazel', arrivedOnDay: 2 } }, 'carrot', 3),
      actions.fulfillVisitor(),
    ).state;
    expect(s.visitor).toBeNull();
    s = reducer({ ...s, coins: 500, bloom: 50 }, actions.expandPlot()).state;
    expect(s.plot.height).toBe(5);
    s = reducer(s, actions.cook('carrot_soup')).state;
    s = reducer(s, actions.fish()).state;
    s = reducer(s, actions.sellFish('goldfish', 1)).state;
    s = reducer(s, actions.eatFish('goldfish')).state;
    s = reducer(s, actions.petCat()).state;
    s = reducer(s, actions.collectForage('node1')).state;
    s = reducer(s, actions.sellForage('mushroom', 1)).state;
    s = reducer(s, actions.unlockIslet()).state;
    s = reducer(s, actions.harvestOrchard()).state;
    s = reducer(s, actions.sellFruit('apple', 1)).state;
    s = reducer(s, actions.giftVisitor('carrot_soup')).state;
    s = reducer(s, actions.setMusicTrack('lofi_rain')).state;
    expect(s.activeMusicTrack).toBe('lofi_rain');
    s = reducer(s, actions.adoptPet('puppy')).state;
    expect(s.pets).toContain('puppy');
    s = reducer(s, actions.interactPet('puppy')).state;
    s = reducer(s, actions.cottageActivity('kindle_fire')).state;
    s = reducer(s, actions.harvestHoney()).state;
    s = reducer(s, actions.toggleCampfire()).state;
    s = reducer(s, actions.restHammock()).state;
    s = reducer(s, actions.changeOutfit('gardener')).state;
    expect(s.currentOutfit).toBe('gardener');
    s = reducer(s, actions.changeHat('flower_crown')).state;
    expect(s.currentHat).toBe('flower_crown');
    s = reducer(s, actions.setPetAccessory('cat', 'flower_collar')).state;
    expect(s.petAccessories?.cat).toBe('flower_collar');
    s = reducer(
      {
        ...s,
        farmstandOrders: [
          {
            id: 'order_1',
            item: 'carrot',
            itemType: 'crop',
            customerName: 'Rowan',
            rewardCoins: 10,
            rewardBloom: 2,
          },
        ],
      },
      actions.serveFarmstandOrder('order_1'),
    ).state;
    s = reducer(
      { ...s, beachBottle: { id: 'b1', letter: 'Hello', rewardCoins: 10, read: false } },
      actions.readBeachBottle(),
    ).state;
    s = reducer(s, actions.stargazeTelescope()).state;
    s = reducer(
      { ...s, decorations: [...s.decorations, 'wishing_well'] },
      actions.tossWishingWell(),
    ).state;
    s = reducer(s, actions.unlockGreenhouse()).state;
    s = reducer(s, actions.snapPostcard('Sunny Day', 'polaroid', 'Cozy memory')).state;
    expect(s.postcards?.length).toBe(1);
    s = reducer(s, actions.updateSettings({ muted: true })).state;
    expect(s.settings.muted).toBe(true);
    const fresh = makeState();
    expect(reducer(s, actions.load(fresh)).state).toBe(fresh);
  });
});

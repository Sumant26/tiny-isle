import { describe, expect, it } from 'vitest';
import type { GameEvent, RejectReason } from '../core/types';
import { messageForEvent, REJECT_MESSAGES } from './text';

describe('messageForEvent', () => {
  it.each<[GameEvent, RegExp | null]>([
    [{ type: 'harvested', index: 0, crop: 'carrot' }, /\+1 Carrot/],
    [{ type: 'sold', crop: 'tomato', quantity: 2, coins: 12 }, /Sold 2 Tomato for 12 coins/],
    [{ type: 'bought-seeds', crop: 'carrot', quantity: 5 }, /Bought 5 Carrot seeds/],
    [{ type: 'bought-decoration', decoration: 'gnome' }, /Garden gnome placed/],
    [{ type: 'plot-expanded', newHeight: 5 }, /Garden expanded/],
    [{ type: 'cooked', recipe: 'carrot_soup' }, /Cooked/],
    [{ type: 'meal-eaten', recipe: 'carrot_soup' }, /Ate delicious/],
    [{ type: 'fish-caught', fish: 'goldfish' }, /Caught a goldfish/],
    [{ type: 'fish-eaten', fish: 'goldfish' }, /Ate fresh/],
    [{ type: 'foraged', item: 'mushroom' }, /Foraged/],
    [{ type: 'islet-unlocked' }, /bridge to Orchard/],
    [{ type: 'greenhouse-unlocked' }, /Greenhouse Dome/],
    [{ type: 'orchard-harvested', fruit: 'apple', count: 2 }, /Harvested 2/],
    [{ type: 'pet-adopted', pet: 'puppy' }, /Adopted a new island companion/],
    [{ type: 'pet-interacted', pet: 'puppy', sound: 'Woof!' }, /pet looks very happy/],
    [{ type: 'pet-accessory-changed', pet: 'cat', accessory: 'flower_collar' }, /accessory/],
    [{ type: 'outfit-changed', outfit: 'gardener' }, /outfit/],
    [{ type: 'hat-changed', hat: 'flower_crown' }, /hat/],
    [{ type: 'honey-harvested', count: 1 }, /Honey Jar/],
    [{ type: 'campfire-toggled', lit: true }, /Lit the warm evening campfire/],
    [{ type: 'campfire-toggled', lit: false }, /Put out the campfire/],
    [{ type: 'hammock-rested' }, /hammock/],
    [{ type: 'farmstand-served', orderId: 'o1', rewardCoins: 10 }, /Served customer order/],
    [{ type: 'bottle-read', letter: 'Hi' }, /Read beach bottle/],
    [{ type: 'stargazed', constellation: 'The Golden Koi' }, /constellation/],
    [{ type: 'wishing-well-blessed', blessing: 'Fortune' }, /Wishing well/],
    [{ type: 'postcard-snapped', title: 'Photo' }, /Postcard saved/],
    [{ type: 'visitor-gifted', visitor: 'hazel', gift: 'Seeds' }, /Gifted visitor/],
    [{ type: 'cottage-activity', activity: 'kindle_fire' }, /Cozy cottage moment/],
    [{ type: 'pet-cat', happiness: 10 }, /Purr/],
    [{ type: 'achievement-unlocked', achievement: 'First Harvest' }, /Achievement/],
    [{ type: 'day-started', day: 2, weather: 'rain' }, /rain/i],
    [{ type: 'day-started', day: 2, weather: 'clear' }, null],
    [{ type: 'visitor-arrived', visitor: 'pip' }, /Pip the bluebird has come/],
    [{ type: 'visitor-helped', visitor: 'hazel', unlocked: 'strawberry' }, /strawberry seeds/],
    [{ type: 'bloom-level-up', level: 2 }, /Buzzing/],
    [{ type: 'crop-unlocked', crop: 'pumpkin' }, /Pumpkin/],
    [{ type: 'rejected', reason: 'no-seeds' }, /Out of seeds/],
    [{ type: 'rejected', reason: 'blocked' }, null],
    [{ type: 'tilled', index: 0 }, null],
    [{ type: 'planted', index: 0, crop: 'carrot' }, null],
    [{ type: 'watered', index: 0 }, null],
    [{ type: 'moved', to: { x: 1, z: 1 } }, null],
    [{ type: 'music-track-changed', track: 'lofi_rain' }, null],
    [{ type: 'journal-entry', entry: 'Log' }, null],
  ])('%j', (event, pattern) => {
    const m = messageForEvent(event);
    if (pattern === null) expect(m).toBeNull();
    else expect(m?.text).toMatch(pattern);
  });

  it('has a friendly message for every rejection reason', () => {
    for (const reason of Object.keys(REJECT_MESSAGES) as RejectReason[]) {
      expect(REJECT_MESSAGES[reason].length).toBeGreaterThan(5);
    }
  });
});

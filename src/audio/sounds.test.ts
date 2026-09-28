import { describe, expect, it } from 'vitest';
import type { GameEvent } from '../core/types';
import { RECIPES, soundForEvent } from './sounds';

describe('soundForEvent', () => {
  it.each<[GameEvent, string | null]>([
    [{ type: 'tilled', index: 0 }, 'till'],
    [{ type: 'planted', index: 0, crop: 'carrot' }, 'plant'],
    [{ type: 'watered', index: 0 }, 'water'],
    [{ type: 'harvested', index: 0, crop: 'carrot' }, 'harvest'],
    [{ type: 'orchard-harvested', fruit: 'apple', count: 2 }, 'harvest'],
    [{ type: 'sold', crop: 'carrot', quantity: 1, coins: 5 }, 'coin'],
    [{ type: 'visitor-helped', visitor: 'hazel', unlocked: null }, 'coin'],
    [{ type: 'farmstand-served', orderId: 'o1', rewardCoins: 10 }, 'coin'],
    [{ type: 'bottle-read', letter: 'Hi', rewardCoins: 10 }, 'coin'],
    [{ type: 'honey-harvested', count: 1 }, 'coin'],
    [{ type: 'stargazed', constellation: 'The Golden Koi' }, 'levelup'],
    [{ type: 'wishing-well-blessed', blessing: 'Fortune' }, 'levelup'],
    [{ type: 'greenhouse-unlocked' }, 'expand'],
    [{ type: 'islet-unlocked' }, 'expand'],
    [{ type: 'plot-expanded', newHeight: 5 }, 'expand'],
    [{ type: 'bought-seeds', crop: 'carrot', quantity: 1 }, 'buy'],
    [{ type: 'bought-decoration', decoration: 'bench' }, 'buy'],
    [{ type: 'pet-adopted', pet: 'puppy' }, 'buy'],
    [{ type: 'cooked', recipe: 'carrot_soup' }, 'cook'],
    [{ type: 'meal-eaten', recipe: 'carrot_soup' }, 'cook'],
    [{ type: 'fish-eaten', fish: 'goldfish' }, 'cook'],
    [{ type: 'cottage-activity', activity: 'kindle_fire' }, 'cook'],
    [{ type: 'fish-caught', fish: 'goldfish' }, 'fish_catch'],
    [{ type: 'pet-cat', happiness: 10 }, 'purr'],
    [{ type: 'pet-interacted', pet: 'puppy', sound: 'Woof!' }, 'bark'],
    [{ type: 'pet-interacted', pet: 'duckling', sound: 'Quack!' }, 'quack'],
    [{ type: 'pet-interacted', pet: 'cat', sound: 'Purr' }, 'purr'],
    [{ type: 'foraged', item: 'mushroom' }, 'forage'],
    [{ type: 'postcard-snapped', title: 'Photo' }, 'forage'],
    [{ type: 'outfit-changed', outfit: 'gardener' }, 'forage'],
    [{ type: 'hat-changed', hat: 'flower_crown' }, 'forage'],
    [{ type: 'pet-accessory-changed', pet: 'cat', accessory: 'flower_collar' }, 'forage'],
    [{ type: 'campfire-toggled', lit: true }, 'forage'],
    [{ type: 'hammock-rested' }, 'forage'],
    [{ type: 'visitor-gifted', visitor: 'hazel', gift: 'Seeds' }, 'gift'],
    [{ type: 'music-track-changed', track: 'lofi_rain' }, 'needle'],
    [{ type: 'achievement-unlocked', achievement: 'First Harvest' }, 'achievement'],
    [{ type: 'rejected', reason: 'locked' }, 'reject'],
    [{ type: 'bloom-level-up', level: 1 }, 'levelup'],
    [{ type: 'visitor-arrived', visitor: 'hazel' }, 'visitor'],
    [{ type: 'day-started', day: 2, weather: 'clear' }, null],
    [{ type: 'moved', to: { x: 1, z: 1 } }, null],
    [{ type: 'crop-unlocked', crop: 'tomato' }, null],
    [{ type: 'journal-entry', entry: 'Log' }, null],
  ])('%j -> %s', (event, sound) => {
    expect(soundForEvent(event)).toBe(sound);
  });

  it('every recipe has at least one valid note', () => {
    for (const notes of Object.values(RECIPES)) {
      expect(notes.length).toBeGreaterThan(0);
      for (const n of notes) {
        expect(n.freq).toBeGreaterThan(0);
        expect(n.duration).toBeGreaterThan(0);
      }
    }
  });
});

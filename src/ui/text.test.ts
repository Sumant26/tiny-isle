import { describe, expect, it } from 'vitest';
import type { GameEvent, RejectReason } from '../core/types';
import { messageForEvent, REJECT_MESSAGES } from './text';

describe('messageForEvent', () => {
  it.each<[GameEvent, RegExp | null]>([
    [{ type: 'harvested', index: 0, crop: 'carrot' }, /\+1 Carrot/],
    [{ type: 'sold', crop: 'tomato', quantity: 2, coins: 12 }, /Sold 2 Tomato for 12 coins/],
    [{ type: 'bought-seeds', crop: 'carrot', quantity: 5 }, /Bought 5 Carrot seeds/],
    [{ type: 'bought-decoration', decoration: 'gnome' }, /Garden gnome placed/],
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

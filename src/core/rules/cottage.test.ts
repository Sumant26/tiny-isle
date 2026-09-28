import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { cottageActivity } from './cottage';

describe('cottageActivity', () => {
  it('adds bloom and records in journal when lighting fireplace', () => {
    const s = makeState({ bloom: 5 });
    const r = cottageActivity(s, 'kindle_fire');
    expect(r.state.bloom).toBe(8);
    expect(r.state.journal).toContain('Lit a cozy crackling fire in the cottage hearth.');
    expect(r.events).toEqual(
      expect.arrayContaining([
        { type: 'cottage-activity', activity: 'kindle_fire' },
        { type: 'journal-entry', entry: 'Lit a cozy crackling fire in the cottage hearth.' },
      ]),
    );
  });

  it('adds bloom and records in journal when sitting by the hearth or taking a nap', () => {
    const s = makeState({ bloom: 10 });
    const r1 = cottageActivity(s, 'sit_hearth');
    expect(r1.state.bloom).toBe(12);
    expect(r1.state.journal).toContain(
      'Sat comfortably by the fireplace hearth enjoying the crackling flames.',
    );

    const r2 = cottageActivity(s, 'take_nap');
    expect(r2.state.bloom).toBe(12);
    expect(r2.state.journal).toContain(
      'Rested for a cozy afternoon nap under the quilted bedsheets.',
    );
  });
});

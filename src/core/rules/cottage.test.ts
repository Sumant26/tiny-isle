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

  it('adds bloom and records in journal when cleaning the cottage', () => {
    const s = makeState({ bloom: 10 });
    const r = cottageActivity(s, 'clean_cottage');
    expect(r.state.bloom).toBe(14);
    expect(r.state.journal).toContain(
      'Swept the floor and polished the rustic table sparkling clean.',
    );
  });
});

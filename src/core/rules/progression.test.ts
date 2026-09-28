import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { addBloom, unlockCrop } from './progression';

describe('unlockCrop', () => {
  it('unlocks once', () => {
    const r = unlockCrop(makeState(), 'tomato');
    expect(r.state.unlockedCrops).toEqual(['carrot', 'tomato']);
    expect(r.events).toEqual([{ type: 'crop-unlocked', crop: 'tomato' }]);
    const again = unlockCrop(r.state, 'tomato');
    expect(again.state).toBe(r.state);
    expect(again.events).toEqual([]);
  });
});

describe('addBloom', () => {
  it('ignores non-positive points', () => {
    const s = makeState();
    expect(addBloom(s, 0).state).toBe(s);
    expect(addBloom(s, -5).state).toBe(s);
  });

  it('emits one level-up per level crossed, with unlocks', () => {
    const r = addBloom(makeState(), 30);
    expect(r.state.bloom).toBe(30);
    expect(r.events).toEqual([
      { type: 'bloom-level-up', level: 1 },
      { type: 'crop-unlocked', crop: 'tomato' },
      { type: 'bloom-level-up', level: 2 },
      { type: 'crop-unlocked', crop: 'sunflower' },
    ]);
  });

  it('adds points without events below the next threshold', () => {
    expect(addBloom(makeState(), 3).events).toEqual([]);
  });
});

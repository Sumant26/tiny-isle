import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { petCat } from './cat';

describe('petCat', () => {
  it('increases cat happiness and records pet event', () => {
    const state = makeState();
    const result = petCat(state);

    expect(result.state.catHappiness).toBe(1);
    expect(result.state.stats.catPets).toBe(1);
    expect(result.events.some((e) => e.type === 'pet-cat')).toBe(true);
  });
});

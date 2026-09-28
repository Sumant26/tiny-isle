import { describe, expect, it } from 'vitest';
import { createSeed, nextRandom } from './rng';

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    expect(nextRandom(42)).toEqual(nextRandom(42));
  });

  it('produces values in [0, 1) and advances the seed', () => {
    let seed = 7;
    for (let i = 0; i < 1000; i++) {
      const r = nextRandom(seed);
      expect(r.value).toBeGreaterThanOrEqual(0);
      expect(r.value).toBeLessThan(1);
      expect(r.nextSeed).not.toBe(seed);
      seed = r.nextSeed;
    }
  });

  it('is roughly uniform', () => {
    let seed = 99;
    let sum = 0;
    const n = 5000;
    for (let i = 0; i < n; i++) {
      const r = nextRandom(seed);
      sum += r.value;
      seed = r.nextSeed;
    }
    expect(sum / n).toBeGreaterThan(0.45);
    expect(sum / n).toBeLessThan(0.55);
  });

  it('createSeed uses the injected source and returns an unsigned int', () => {
    expect(createSeed(() => 0.5)).toBe(2147483648);
    expect(createSeed(() => 0)).toBe(0);
    expect(Number.isInteger(createSeed())).toBe(true);
  });
});

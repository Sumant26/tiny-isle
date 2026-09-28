/**
 * Deterministic PRNG (mulberry32). Randomness is part of the game state, so a
 * saved game reloads to exactly the same future, and tests are reproducible.
 */
export interface RandomResult {
  /** Uniform value in [0, 1). */
  readonly value: number;
  readonly nextSeed: number;
}

export const nextRandom = (seed: number): RandomResult => {
  const nextSeed = (seed + 0x6d2b79f5) >>> 0;
  let t = nextSeed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextSeed };
};

/** A fresh seed for a new game. Accepts an injected source for testing. */
export const createSeed = (source: () => number = Math.random): number =>
  Math.floor(source() * 4294967296) >>> 0;

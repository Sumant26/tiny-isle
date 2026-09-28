import { nextRandom } from '../core/rng';

export interface BootOptions {
  quality: 'high' | 'low';
  /** Expose `window.__tinyIsle` for e2e tests and debugging. */
  debug: boolean;
  /** Deterministic, frozen scene for screenshot comparison tests. */
  visual: boolean;
  frozenTime: boolean;
  seed?: number;
  random?: () => number;
}

/** A seeded `() => number` built on the game's PRNG, for reproducible scenery. */
export const seededRandom = (seed: number): (() => number) => {
  let s = seed;
  return () => {
    const r = nextRandom(s);
    s = r.nextSeed;
    return r.value;
  };
};

/**
 * Decides how to boot from the build mode and URL. Pure, so it's unit-tested
 * instead of being buried in `main.ts`.
 */
export const resolveBootOptions = ({
  mode,
  search,
  smallScreen,
}: {
  mode: string;
  search: string;
  smallScreen: boolean;
}): BootOptions => {
  const debug = mode !== 'production';
  const visual = debug && new URLSearchParams(search).has('visual');
  // Shadows and glow are the heaviest effects: skip them on small screens and in
  // e2e builds, which run on a software GPU in CI.
  const quality = smallScreen || mode === 'e2e' ? 'low' : 'high';
  if (!visual) return { quality, debug, visual, frozenTime: false };
  return { quality, debug, visual, frozenTime: true, seed: 1, random: seededRandom(7) };
};

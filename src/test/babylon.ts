import { NullEngine } from '../render/babylon';
import {
  createSceneContext,
  type SceneContext,
  type SceneContextOptions,
} from '../render/SceneContext';

/** Headless Babylon scene for tests: real scene graph, no GPU. */
export const createTestContext = (
  options: SceneContextOptions = { shadows: false, glow: false },
): SceneContext => {
  const engine = new NullEngine();
  return createSceneContext(engine, options);
};

/** Advances tweens and per-frame observers by `seconds` in fixed steps. */
export const advance = async (ctx: SceneContext, seconds: number, step = 0.05): Promise<void> => {
  for (let t = 0; t < seconds; t += step) {
    ctx.tweener.update(step);
    ctx.scene.onBeforeRenderObservable.notifyObservers(ctx.scene);
    await Promise.resolve();
  }
};

/** Deterministic pseudo-random source for render tests. */
export const seededRandom = (seed = 1): (() => number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

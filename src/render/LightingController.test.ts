import { describe, expect, it, vi } from 'vitest';
import { advance, createTestContext, seededRandom } from '../test/babylon';
import { buildEnvironment } from './builders/environment';
import { LightingController, LOOKS } from './LightingController';

const setup = () => {
  const ctx = createTestContext();
  const env = buildEnvironment(ctx, seededRandom());
  const onChange = vi.fn();
  const lighting = new LightingController(
    ctx,
    env.lampLight,
    env.lamp,
    env.cottageWindow,
    onChange,
  );
  return { ctx, env, lighting, onChange };
};

describe('LightingController', () => {
  it('starts in daylight', () => {
    const { ctx, lighting, env } = setup();
    expect(lighting.timeOfDay).toBe('day');
    expect(ctx.hemi.intensity).toBeCloseTo(LOOKS.day.hemi);
    expect(env.lampLight.intensity).toBe(0);
  });

  it('switches instantly with set()', () => {
    const { ctx, lighting, env, onChange } = setup();
    lighting.set('dusk');
    expect(lighting.blendAmount).toBe(1);
    expect(ctx.sun.intensity).toBeCloseTo(LOOKS.dusk.sun);
    expect(env.lampLight.intensity).toBeCloseTo(LOOKS.dusk.lamp);
    expect(onChange).toHaveBeenCalledWith('dusk');
  });

  it('transitions smoothly over time', async () => {
    const { ctx, lighting } = setup();
    const done = lighting.transitionTo('dusk', 1);
    ctx.tweener.update(0.5);
    expect(lighting.blendAmount).toBeGreaterThan(0);
    expect(lighting.blendAmount).toBeLessThan(1);
    await advance(ctx, 0.6);
    await done;
    expect(lighting.blendAmount).toBe(1);
    const back = lighting.transitionTo('day', 0.2);
    await advance(ctx, 0.3);
    await back;
    expect(lighting.timeOfDay).toBe('day');
  });

  it('uses a no-op change handler by default', () => {
    const ctx = createTestContext();
    const env = buildEnvironment(ctx, seededRandom());
    const l = new LightingController(ctx, env.lampLight, env.lamp, env.cottageWindow);
    expect(() => l.set('dusk')).not.toThrow();
  });
});

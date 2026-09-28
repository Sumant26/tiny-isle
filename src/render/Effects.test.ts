import { describe, expect, it } from 'vitest';
import { advance, createTestContext, seededRandom } from '../test/babylon';
import { Vector3 } from './babylon';
import { Effects } from './Effects';

const sparks = (ctx: ReturnType<typeof createTestContext>) =>
  ctx.scene.meshes.filter((m) => m.name === 'spark').length;

describe('Effects', () => {
  it('bursts particles that clean themselves up', async () => {
    const ctx = createTestContext();
    const fx = new Effects(ctx, seededRandom());
    fx.burst(Vector3.Zero(), '#ffffff', 5);
    expect(sparks(ctx)).toBe(5);
    await advance(ctx, 1);
    await Promise.resolve();
    expect(sparks(ctx)).toBe(0);
  });

  it('reacts to farming events and ignores others', () => {
    const ctx = createTestContext();
    const fx = new Effects(ctx);
    fx.handle({ type: 'tilled', index: 0 });
    fx.handle({ type: 'watered', index: 0 });
    fx.handle({ type: 'planted', index: 0, crop: 'carrot' });
    fx.handle({ type: 'harvested', index: 0, crop: 'pumpkin' });
    expect(sparks(ctx)).toBe(6 + 10 + 5 + 12);
    fx.handle({ type: 'day-started', day: 2, weather: 'clear' });
    expect(sparks(ctx)).toBe(33);
  });
});

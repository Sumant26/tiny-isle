import { describe, expect, it, vi } from 'vitest';
import { easings, lerp, Tweener } from './tween';

describe('easings', () => {
  it.each(Object.entries(easings))('%s starts at 0 and ends at 1', (_name, ease) => {
    expect(ease(0)).toBeCloseTo(0);
    expect(ease(1)).toBeCloseTo(1);
  });
});

describe('Tweener', () => {
  it('runs a tween to completion over time', async () => {
    const t = new Tweener();
    const onUpdate = vi.fn();
    const { promise } = t.tween({ duration: 1, onUpdate });
    expect(onUpdate).toHaveBeenLastCalledWith(0);
    expect(t.active).toBe(1);
    t.update(0.5);
    expect(onUpdate).toHaveBeenLastCalledWith(0.5);
    t.update(0.6);
    expect(onUpdate).toHaveBeenLastCalledWith(1);
    await expect(promise).resolves.toBe(true);
    expect(t.active).toBe(0);
  });

  it('applies easing', () => {
    const t = new Tweener();
    const onUpdate = vi.fn();
    t.tween({ duration: 1, onUpdate, ease: () => 0.25 });
    t.update(0.5);
    expect(onUpdate).toHaveBeenLastCalledWith(0.25);
  });

  it('completes zero-length tweens immediately', async () => {
    const t = new Tweener();
    const onUpdate = vi.fn();
    const tw = t.tween({ duration: 0, onUpdate });
    expect(onUpdate).toHaveBeenCalledWith(1);
    tw.cancel();
    await expect(tw.promise).resolves.toBe(true);
  });

  it('cancels one or all tweens', async () => {
    const t = new Tweener();
    const a = t.tween({ duration: 1, onUpdate: () => undefined });
    const b = t.wait(1);
    a.cancel();
    a.cancel(); // idempotent
    await expect(a.promise).resolves.toBe(false);
    t.cancelAll();
    await expect(b).resolves.toBe(false);
    expect(t.active).toBe(0);
  });

  it('lerps', () => {
    expect(lerp(0, 10, 0.3)).toBe(3);
  });
});

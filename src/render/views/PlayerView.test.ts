import { describe, expect, it, vi } from 'vitest';
import { cellToWorld, LAYOUT } from '../../core/world';
import { advance, createTestContext } from '../../test/babylon';
import { facingAngle, PlayerView, STEP_SECONDS } from './PlayerView';

describe('PlayerView', () => {
  it('starts at the given cell with the cat nearby', () => {
    const ctx = createTestContext();
    const view = new PlayerView(ctx, LAYOUT.playerStart);
    expect(view.position).toEqual(cellToWorld(LAYOUT.playerStart));
    expect(view.cat.position.x).toBeLessThan(view.position.x);
  });

  it('walks along a path, reporting each step', async () => {
    const ctx = createTestContext();
    const view = new PlayerView(ctx, { x: 7, z: 9 });
    const onStep = vi.fn();
    const path = [
      { x: 7, z: 10 },
      { x: 7, z: 11 },
    ];
    const walking = view.walk(path, { onStep });
    await advance(ctx, STEP_SECONDS * 3);
    await expect(walking).resolves.toBe(true);
    expect(onStep).toHaveBeenCalledTimes(2);
    expect(view.position.z).toBeCloseTo(cellToWorld({ x: 7, z: 11 }).z);
  });

  it('stops when aborted', async () => {
    const ctx = createTestContext();
    const view = new PlayerView(ctx, { x: 7, z: 9 });
    const ac = new AbortController();
    const walking = view.walk(
      [
        { x: 7, z: 10 },
        { x: 7, z: 11 },
      ],
      { signal: ac.signal },
    );
    ctx.tweener.update(STEP_SECONDS / 2);
    ac.abort();
    await expect(walking).resolves.toBe(false);
    const again = view.walk([{ x: 7, z: 10 }], { signal: ac.signal });
    await expect(again).resolves.toBe(false);
  });

  it('plays a tool gesture and shows the can only for watering', async () => {
    const ctx = createTestContext();
    const view = new PlayerView(ctx, { x: 7, z: 9 });
    const acting = view.act('water');
    expect(view.farmer.can.isEnabled()).toBe(true);
    await advance(ctx, 0.4);
    await acting;
    expect(view.farmer.can.isEnabled()).toBe(false);
    expect(view.farmer.root.rotation.x).toBe(0);
    const digging = view.act('dig');
    expect(view.farmer.can.isEnabled()).toBe(false);
    await advance(ctx, 0.4);
    await digging;
  });

  it('bobs, and the cat follows at a distance', () => {
    const ctx = createTestContext();
    const view = new PlayerView(ctx, { x: 7, z: 9 });
    view.place({ x: 2, z: 7 });
    for (let i = 0; i < 200; i++) view.tick(0.05);
    const d = Math.hypot(
      view.cat.position.x - view.position.x,
      view.cat.position.z - view.position.z,
    );
    expect(d).toBeLessThan(1.2);
    expect(view.farmer.root.position.y).toBeGreaterThanOrEqual(0.25);
    view.dispose();
    expect(view.farmer.root.isDisposed()).toBe(true);
  });

  it('computes facing angles', () => {
    expect(facingAngle(0, 1)).toBe(0);
    expect(facingAngle(1, 0)).toBeCloseTo(Math.PI / 2);
  });
});

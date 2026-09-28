import { describe, expect, it, vi } from 'vitest';
import { actions } from '../state/actions';
import { reducer } from '../state/reducer';
import { createStore } from '../state/store';
import { advance, createTestContext, seededRandom } from '../test/babylon';
import { makeState } from '../test/fixtures';
import { type ArcRotateCamera, PointerEventTypes, Vector3 } from './babylon';
import { createCamera, DEFAULT_ALPHA } from './CameraRig';
import { createGameRenderer } from './GameRenderer';
import { attachPicker } from './Picker';

describe('createCamera', () => {
  it('sets up a constrained orbit camera', () => {
    const ctx = createTestContext();
    const cam = createCamera(ctx.scene, null);
    expect(cam.alpha).toBe(DEFAULT_ALPHA);
    expect(cam.lowerRadiusLimit).toBeLessThan(cam.upperRadiusLimit!);
    expect(ctx.scene.activeCamera).toBe(cam);
  });
});

describe('attachPicker', () => {
  it('turns taps on pickable meshes into cells and ignores misses and other pointer events', () => {
    const ctx = createTestContext();
    const onCell = vi.fn();
    const pick = vi.spyOn(ctx.scene, 'pick');
    const detach = attachPicker(ctx.scene, onCell);
    const notify = (type: number) =>
      ctx.scene.onPointerObservable.notifyObservers({ type } as never);
    pick.mockReturnValue({ hit: true, pickedPoint: new Vector3(0.2, 0, -0.3) } as never);
    notify(PointerEventTypes.POINTERTAP);
    expect(onCell).toHaveBeenCalledWith({ x: 7, z: 7 });
    notify(PointerEventTypes.POINTERMOVE);
    pick.mockReturnValue({ hit: false, pickedPoint: null } as never);
    notify(PointerEventTypes.POINTERTAP);
    expect(onCell).toHaveBeenCalledTimes(1);
    const predicate = pick.mock.calls[0]![2]!;
    expect(predicate({ isPickable: true, isEnabled: () => true } as never, -1)).toBe(true);
    detach();
  });
});

describe('createGameRenderer', () => {
  it('composes all views and wires picking and events', async () => {
    const ctx = createTestContext();
    const store = createStore({ reducer, initialState: makeState() });
    const r = createGameRenderer(ctx, store, { canvas: null, random: seededRandom() });
    expect(ctx.scene.activeCamera).toBeTruthy();
    const onCell = vi.fn();
    r.onCellPicked(onCell);
    vi.spyOn(ctx.scene, 'pick').mockReturnValue({
      hit: true,
      pickedPoint: new Vector3(0, 0, 0),
    } as never);
    ctx.scene.onPointerObservable.notifyObservers({ type: PointerEventTypes.POINTERTAP } as never);
    expect(onCell).toHaveBeenCalledWith({ x: 7, z: 7 });

    store.dispatch(actions.useTile(0));
    expect(ctx.scene.meshes.some((m) => m.name === 'spark')).toBe(true);

    const dusk = r.setTimeOfDay('dusk');
    await advance(ctx, 1.5);
    await dusk;
    expect(r.lighting.timeOfDay).toBe('dusk');
    await r.setTimeOfDay('day', false);
    expect(r.lighting.timeOfDay).toBe('day');

    // Loading a save far away snaps the farmer there.
    store.dispatch(actions.load(makeState({ player: { x: 3, z: 6 } })));
    expect(r.player.position).toEqual({ x: -4, z: -1 });
    r.dispose();
  });

  it('works with the default random source', () => {
    const ctx = createTestContext();
    const store = createStore({ reducer, initialState: makeState() });
    const r = createGameRenderer(ctx, store, { canvas: null });
    expect((ctx.scene.activeCamera as ArcRotateCamera).radius).toBeGreaterThan(0);
    r.dispose();
  });
});

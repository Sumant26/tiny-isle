import { describe, expect, it, vi } from 'vitest';
import type { Cell } from '../core/types';
import { LAYOUT, tileIndexToCell } from '../core/world';
import type { Mover } from '../render/views/PlayerView';
import { actions } from '../state/actions';
import { reducer } from '../state/reducer';
import { createStore } from '../state/store';
import { makeState } from '../test/fixtures';
import { InteractionController } from './InteractionController';

/** Instant mover that records paths; optionally never finishes (to test cancelling). */
const fakeMover = (hang = false) => {
  const walks: Cell[][] = [];
  const mover: Mover & { walks: Cell[][] } = {
    walks,
    walk: vi.fn(
      (
        path: readonly Cell[],
        { signal, onStep }: { signal?: AbortSignal; onStep?: (c: Cell) => void } = {},
      ) => {
        walks.push([...path]);
        if (hang) {
          return new Promise<boolean>((resolve) =>
            signal?.addEventListener('abort', () => resolve(false)),
          );
        }
        for (const c of path) {
          if (signal?.aborted) return Promise.resolve(false);
          onStep?.(c);
        }
        return Promise.resolve(true);
      },
    ),
    act: vi.fn(() => Promise.resolve()),
  };
  return mover;
};

const setup = (hang = false, state = makeState()) => {
  const store = createStore({ reducer, initialState: state });
  const mover = fakeMover(hang);
  const onOpenShop = vi.fn();
  const onVisitor = vi.fn();
  const controller = new InteractionController({ store, mover, onOpenShop, onVisitor });
  return { store, mover, controller, onOpenShop, onVisitor };
};

describe('InteractionController', () => {
  it('walks to a plot tile and uses the selected tool there', async () => {
    const { store, mover, controller } = setup();
    const result = await controller.clickCell(tileIndexToCell(0));
    expect(result).toBe('used');
    expect(store.getState().player).toEqual(tileIndexToCell(0));
    expect(store.getState().plot.tiles[0]?.tilled).toBe(true);
    expect(mover.act).toHaveBeenCalledWith('dig');
  });

  it('skips the gesture when the action is rejected', async () => {
    const { mover, controller, store } = setup();
    store.dispatch(actions.selectTool('basket'));
    expect(await controller.clickCell(tileIndexToCell(0))).toBe('used');
    expect(mover.act).not.toHaveBeenCalled();
  });

  it('walks to plain ground and ignores solid cells', async () => {
    const { store, controller } = setup();
    expect(await controller.clickCell({ x: 5, z: 10 })).toBe('walked');
    expect(store.getState().player).toEqual({ x: 5, z: 10 });
    expect(await controller.clickCell({ x: LAYOUT.tree.x, z: LAYOUT.tree.z })).toBe('ignored');
  });

  it('reports unreachable cells', async () => {
    const store = createStore({ reducer, initialState: makeState() });
    const c = new InteractionController({
      store,
      mover: fakeMover(),
      walkable: (cell) => cell.x === 5 && cell.z === 5,
    });
    expect(await c.clickCell({ x: 5, z: 5 })).toBe('unreachable');
    expect(await c.goToMarket()).toBe('unreachable');
    const v = new InteractionController({
      store: createStore({
        reducer,
        initialState: makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } }),
      }),
      mover: fakeMover(),
      walkable: () => false,
    });
    expect(await v.clickCell(LAYOUT.visitorSpot)).toBe('unreachable');
  });

  it('opens the shop after walking to the market', async () => {
    const { store, controller, onOpenShop } = setup();
    expect(await controller.clickCell({ x: LAYOUT.market.x, z: LAYOUT.market.z })).toBe('shop');
    expect(store.getState().player).toEqual(LAYOUT.marketFront);
    expect(onOpenShop).toHaveBeenCalled();
  });

  it('walks up to a visitor and highlights them', async () => {
    const { controller, onVisitor } = setup(
      false,
      makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } }),
    );
    expect(await controller.clickCell(LAYOUT.visitorSpot)).toBe('visitor');
    expect(onVisitor).toHaveBeenCalled();
  });

  it('a new click cancels the current walk', async () => {
    const { controller } = setup(true);
    const first = controller.clickCell({ x: 5, z: 10 });
    const second = controller.clickCell({ x: 9, z: 12 });
    await expect(first).resolves.toBe('cancelled');
    controller.cancel();
    await expect(second).resolves.toBe('cancelled');
    const shop = controller.goToMarket();
    controller.cancel();
    await expect(shop).resolves.toBe('cancelled');
    const visitorCtl = setup(
      true,
      makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } }),
    ).controller;
    const v = visitorCtl.clickCell(LAYOUT.visitorSpot);
    visitorCtl.cancel();
    await expect(v).resolves.toBe('cancelled');
  });

  it('steps one cell with the keyboard', async () => {
    const { store, controller } = setup();
    expect(await controller.step(0, 1)).toBe('walked');
    expect(store.getState().player).toEqual({ x: 7, z: 10 });
    expect(await controller.step(0, -2)).toBe('walked'); // (7,8) is the gate: walkable
    const s = setup(true);
    const p = s.controller.step(0, 1);
    s.controller.cancel();
    await expect(p).resolves.toBe('cancelled');
    expect(await setup().controller.step(10, 0)).toBe('ignored');
  });

  it('uses the tool on the tile underfoot', async () => {
    const { store, controller } = setup(false, makeState({ player: tileIndexToCell(2) }));
    expect(await controller.useHere()).toBe('used');
    expect(store.getState().plot.tiles[2]?.tilled).toBe(true);
    expect(await setup().controller.useHere()).toBe('ignored');
  });

  it('works without optional callbacks', async () => {
    const store = createStore({
      reducer,
      initialState: makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } }),
    });
    const c = new InteractionController({ store, mover: fakeMover() });
    expect(await c.goToMarket()).toBe('shop');
    expect(await c.clickCell(LAYOUT.visitorSpot)).toBe('visitor');
  });
});

import { describe, expect, it } from 'vitest';
import { actions } from '../../state/actions';
import { reducer } from '../../state/reducer';
import { createStore } from '../../state/store';
import { advance, createTestContext } from '../../test/babylon';
import { makeState, withTile } from '../../test/fixtures';
import type { StandardMaterial } from '../babylon';
import { PALETTE } from '../palette';
import { PlotView } from './PlotView';

const setup = (state = makeState()) => {
  const ctx = createTestContext();
  const store = createStore({ reducer, initialState: state });
  return { ctx, store, view: new PlotView(ctx, store) };
};

describe('PlotView', () => {
  it('creates one tile visual per plot tile, positioned on the grid', () => {
    const { view, store } = setup();
    const n = store.getState().plot.tiles.length;
    for (let i = 0; i < n; i++) expect(view.tileRoot(i)).toBeDefined();
    expect(view.describeTile(0)).toEqual({ tilled: false, crop: null });
    expect(view.describeTile(999)).toEqual({ tilled: false, crop: null });
  });

  it('reflects existing crops from a loaded save', () => {
    const s = withTile(makeState(), 3, { tilled: true, crop: { id: 'carrot', growth: 2 } });
    const { view } = setup(s);
    expect(view.describeTile(3)).toEqual({ tilled: true, crop: 'carrot:ripe' });
    expect(view.swaying.size).toBe(1);
  });

  it('updates only the tile that changed', () => {
    const { view, store } = setup();
    const before = view.tileRoot(1)!.getChildren().length;
    store.dispatch(actions.useTile(0));
    expect(view.describeTile(0).tilled).toBe(true);
    expect(view.tileRoot(1)!.getChildren().length).toBe(before);
  });

  it('switches soil material when watered and grows crop visuals', async () => {
    const { view, store, ctx } = setup();
    store.dispatch(actions.useTile(0));
    store.dispatch(actions.selectTool('seeds'));
    store.dispatch(actions.useTile(0));
    expect(view.describeTile(0).crop).toBe('carrot:seed');
    await advance(ctx, 0.5); // pop-in animation
    store.dispatch(actions.selectTool('water'));
    store.dispatch(actions.useTile(0));
    const soil = view
      .tileRoot(0)!
      .getChildMeshes(true)
      .find((m) => m.name === 'soil_0')!;
    expect((soil.material as StandardMaterial).diffuseColor.toHexString()).toBe(
      PALETTE.soilWet.toUpperCase(),
    );
    store.dispatch(actions.sleep());
    expect(view.describeTile(0).crop).toBe('carrot:growing'); // 1 of 2 days
  });

  it('removes crop visuals after harvest', () => {
    const s = withTile(makeState({ selectedTool: 'basket' }), 0, {
      tilled: true,
      crop: { id: 'carrot', growth: 2 },
    });
    const { view, store } = setup(s);
    store.dispatch(actions.useTile(0));
    expect(view.describeTile(0).crop).toBeNull();
    expect(view.swaying.size).toBe(0);
  });

  it('stops listening after dispose', () => {
    const { view, store } = setup();
    view.dispose();
    expect(() => store.dispatch(actions.useTile(0))).not.toThrow();
  });
});

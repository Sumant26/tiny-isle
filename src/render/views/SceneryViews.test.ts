import { describe, expect, it } from 'vitest';
import { actions } from '../../state/actions';
import { reducer } from '../../state/reducer';
import { createStore } from '../../state/store';
import { advance, createTestContext } from '../../test/babylon';
import { makeState, withProduce } from '../../test/fixtures';
import { DecorationView, VisitorView } from './SceneryViews';

describe('DecorationView', () => {
  it('shows owned decorations and adds new ones when bought', async () => {
    const ctx = createTestContext();
    const store = createStore({
      reducer,
      initialState: makeState({ coins: 100, decorations: ['bench'] }),
    });
    const view = new DecorationView(ctx, store);
    expect(view.has('bench')).toBe(true);
    store.dispatch(actions.buyDecoration('flowerbed'));
    expect(view.has('flowerbed')).toBe(true);
    await advance(ctx, 0.6);
    expect(ctx.scene.getTransformNodeByName('decoration_flowerbed')?.scaling.x).toBeCloseTo(1);
  });

  it('removes decorations that are no longer owned (new game)', () => {
    const ctx = createTestContext();
    const store = createStore({ reducer, initialState: makeState({ decorations: ['bench'] }) });
    const view = new DecorationView(ctx, store);
    store.dispatch(actions.load(makeState()));
    expect(view.has('bench')).toBe(false);
    view.dispose();
  });
});

describe('VisitorView', () => {
  it('shows and hides the visitor as state changes', () => {
    const ctx = createTestContext();
    const store = createStore({
      reducer,
      initialState: withProduce(
        makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } }),
        'carrot',
        3,
      ),
    });
    const view = new VisitorView(ctx, store);
    expect(view.visitor).toBe('hazel');
    expect(ctx.scene.getTransformNodeByName('visitor_hazel')).not.toBeNull();
    ctx.scene.onBeforeRenderObservable.notifyObservers(ctx.scene); // bob marker
    store.dispatch(actions.fulfillVisitor());
    expect(view.visitor).toBeNull();
    expect(ctx.scene.getTransformNodeByName('visitor_hazel')).toBeNull();
    view.dispose();
  });
});

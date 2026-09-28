import { describe, expect, it, vi } from 'vitest';
import { makeState } from '../test/fixtures';
import { actions } from './actions';
import { reducer } from './reducer';
import { createStore, shallowEqual } from './store';

const setup = () => createStore({ reducer, initialState: makeState() });

describe('store', () => {
  it('exposes state and applies actions', () => {
    const store = setup();
    store.dispatch(actions.selectTool('water'));
    expect(store.getState().selectedTool).toBe('water');
  });

  it('notifies subscribers only on real changes', () => {
    const store = setup();
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch(actions.selectTool('hoe')); // no-op
    expect(listener).not.toHaveBeenCalled();
    store.dispatch(actions.selectTool('water'));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('select() fires only when the selected slice changes', () => {
    const store = setup();
    const coins = vi.fn();
    store.select((s) => s.coins, coins);
    store.dispatch(actions.selectTool('water'));
    expect(coins).not.toHaveBeenCalled();
    store.dispatch(actions.buySeeds('carrot', 1));
    expect(coins).toHaveBeenCalledWith(18, 20);
  });

  it('select() supports fireImmediately and custom equality', () => {
    const store = setup();
    const l = vi.fn();
    store.select((s) => ({ c: s.coins }), l, { fireImmediately: true, equals: shallowEqual });
    expect(l).toHaveBeenCalledTimes(1);
    store.dispatch(actions.selectTool('water')); // new object, same content
    expect(l).toHaveBeenCalledTimes(1);
  });

  it('returns and broadcasts events, including rejections', () => {
    const store = setup();
    const onEvent = vi.fn();
    store.onEvent(onEvent);
    const events = store.dispatch(actions.useTile(0));
    expect(events).toEqual([{ type: 'tilled', index: 0 }]);
    expect(onEvent).toHaveBeenCalledWith({ type: 'tilled', index: 0 }, store.getState());
    store.dispatch(actions.useTile(0));
    expect(onEvent).toHaveBeenLastCalledWith(
      { type: 'rejected', reason: 'already-tilled' },
      expect.anything(),
    );
  });

  it('unsubscribes cleanly, even during notification', () => {
    const store = setup();
    const b = vi.fn();
    const unsubA = store.subscribe(() => unsubA());
    store.subscribe(b);
    const unsubE = store.onEvent(() => {});
    unsubE();
    store.dispatch(actions.selectTool('water'));
    store.dispatch(actions.selectTool('hoe'));
    expect(b).toHaveBeenCalledTimes(2);
  });

  it('forbids dispatching from inside the reducer', () => {
    const store = createStore({
      initialState: makeState(),
      reducer: (s, a) => {
        if (a.type === 'day/sleep') store.dispatch(actions.selectTool('water'));
        return reducer(s, a);
      },
    });
    expect(() => store.dispatch(actions.sleep())).toThrow(/while reducing/);
    // Store is still usable afterwards.
    store.dispatch(actions.selectTool('water'));
    expect(store.getState().selectedTool).toBe('water');
  });

  it('calls the onAction hook', () => {
    const onAction = vi.fn();
    const store = createStore({ reducer, initialState: makeState(), onAction });
    store.dispatch(actions.sleep());
    expect(onAction).toHaveBeenCalledWith(
      { type: 'day/sleep' },
      expect.objectContaining({ events: expect.any(Array) }),
    );
  });
});

describe('shallowEqual', () => {
  it('compares shallowly', () => {
    expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual<unknown>(null, {})).toBe(false);
    expect(shallowEqual<unknown>(1, 2)).toBe(false);
  });
});

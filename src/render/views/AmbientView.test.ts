import { describe, expect, it } from 'vitest';
import { actions } from '../../state/actions';
import { reducer } from '../../state/reducer';
import { createStore } from '../../state/store';
import { createTestContext, seededRandom } from '../../test/babylon';
import { makeState } from '../../test/fixtures';
import { TransformNode } from '../babylon';
import { AmbientView } from './AmbientView';

const setup = (state = makeState()) => {
  const ctx = createTestContext();
  const store = createStore({ reducer, initialState: state });
  const plant = new TransformNode('plant', ctx.scene);
  const view = new AmbientView(ctx, store, () => [plant], seededRandom());
  return { ctx, store, view, plant };
};

describe('AmbientView', () => {
  it('adds two butterflies per bloom level, live', () => {
    const { view, store } = setup(makeState({ bloom: 10 }));
    expect(view.butterflyCount).toBe(2);
    store.dispatch(actions.load(makeState({ bloom: 45 })));
    expect(view.butterflyCount).toBe(6);
    store.dispatch(actions.load(makeState({ bloom: 0 })));
    expect(view.butterflyCount).toBe(0);
  });

  it('follows the weather', () => {
    const { view, store } = setup(makeState({ weather: 'rain' }));
    expect(view.isRaining).toBe(true);
    store.dispatch(actions.load(makeState({ weather: 'clear' })));
    expect(view.isRaining).toBe(false);
  });

  it('animates plants, butterflies, fireflies and rain each tick', () => {
    const { view, plant, ctx } = setup(makeState({ bloom: 30, weather: 'rain' }));
    view.setNight(true);
    const fly = ctx.scene.getMeshByName('firefly')!;
    expect(fly.isEnabled()).toBe(true);
    view.tick(0.5);
    expect(plant.rotation.z).not.toBe(0);
    const drop = ctx.scene.getMeshByName('rain')!;
    const y = drop.position.y;
    for (let i = 0; i < 20; i++) view.tick(0.1);
    expect(drop.position.y).not.toBe(y);
    ctx.scene.onBeforeRenderObservable.notifyObservers(ctx.scene);
    view.setNight(false);
    expect(fly.isEnabled()).toBe(false);
    view.dispose();
  });

  it('uses Math.random by default', () => {
    const ctx = createTestContext();
    const store = createStore({ reducer, initialState: makeState() });
    expect(() => new AmbientView(ctx, store, () => [])).not.toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { makeState } from '../../test/fixtures';
import { expandPlot } from './expansion';

describe('expandPlot', () => {
  it('expands plot height when bloom and coins are sufficient', () => {
    const state = makeState({ coins: 100, bloom: 30 });
    const initialHeight = state.plot.height;
    const result = expandPlot(state);

    expect(result.state.plot.height).toBe(initialHeight + 1);
    expect(result.state.coins).toBe(50);
    expect(result.events.some((e) => e.type === 'plot-expanded')).toBe(true);
  });

  it('rejects when bloom is insufficient', () => {
    const state = makeState({ coins: 100, bloom: 0 });
    const result = expandPlot(state);
    expect(result.state).toBe(state);
    expect(result.events).toEqual([{ type: 'rejected', reason: 'locked' }]);
  });
});

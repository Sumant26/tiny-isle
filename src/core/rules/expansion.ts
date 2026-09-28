import { BALANCE, PLOT_EXPANSIONS } from '../config';
import { EMPTY_TILE } from '../plot';
import type { GameState, Outcome } from '../types';
import { chain, ok, reject } from './outcome';
import { addBloom } from './progression';

export const expandPlot = (state: GameState): Outcome => {
  const currentHeight = state.plot.height;
  if (currentHeight >= BALANCE.maxPlotHeight) {
    return reject(state, 'max-size');
  }

  const expansion = PLOT_EXPANSIONS.find((e) => e.targetHeight === currentHeight + 1);
  if (!expansion) {
    return reject(state, 'max-size');
  }

  if (state.bloom < expansion.requiredBloom) {
    return reject(state, 'locked');
  }

  if (state.coins < expansion.cost) {
    return reject(state, 'not-enough-coins');
  }

  const newHeight = currentHeight + 1;
  const newTiles = [...state.plot.tiles];
  for (let x = 0; x < state.plot.width; x++) {
    newTiles.push(EMPTY_TILE);
  }

  const nextPlot = {
    ...state.plot,
    height: newHeight,
    tiles: newTiles,
  };

  return chain(
    ok(
      {
        ...state,
        coins: state.coins - expansion.cost,
        plot: nextPlot,
      },
      { type: 'plot-expanded', newHeight },
    ),
    (s) => addBloom(s, 5),
  );
};

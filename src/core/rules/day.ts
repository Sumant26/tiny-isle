import { BALANCE } from '../config';
import { isRipe, mapTiles } from '../plot';
import { nextRandom } from '../rng';
import type { GameState, Outcome, Tile } from '../types';
import { chain, ok } from './outcome';
import { maybeVisitorArrives } from './visitors';

/** Overnight: watered crops grow one step, then all soil dries out. */
export const growOvernight = (tile: Tile): Tile => {
  if (!tile.watered) return tile;
  const crop =
    tile.crop && !isRipe(tile.crop) ? { ...tile.crop, growth: tile.crop.growth + 1 } : tile.crop;
  return { ...tile, watered: false, crop };
};

const rainWater = (tile: Tile): Tile =>
  tile.tilled && !tile.watered ? { ...tile, watered: true } : tile;

/** Sleep: advance to the next morning, roll the weather, maybe greet a visitor. */
export const sleep = (state: GameState): Outcome => {
  const grown = mapTiles(state.plot, growOvernight);
  const roll = nextRandom(state.rngSeed);
  const weather = roll.value < BALANCE.rainChance ? 'rain' : 'clear';
  const plot = weather === 'rain' ? mapTiles(grown, rainWater) : grown;
  const day = state.day + 1;
  return chain(
    ok(
      { ...state, plot, day, weather, rngSeed: roll.nextSeed },
      { type: 'day-started', day, weather },
    ),
    maybeVisitorArrives,
  );
};

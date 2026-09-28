import type { BottleLetterDef } from '../config';
import { BALANCE, BOTTLE_LETTERS, FARMSTAND_CUSTOMERS, SEASON_LENGTH } from '../config';
import { isRipe, mapTiles } from '../plot';
import { nextRandom } from '../rng';
import type {
  BeachBottle,
  FarmstandOrder,
  GameState,
  Outcome,
  RecipeId,
  Season,
  Tile,
} from '../types';
import { spawnForageNodes } from './foraging';
import { chain, ok } from './outcome';
import { maybeVisitorArrives } from './visitors';

export const getSeasonForDay = (day: number): Season => {
  const s = Math.floor((day - 1) / SEASON_LENGTH) % 4;
  return s === 0 ? 'spring' : s === 1 ? 'summer' : s === 2 ? 'autumn' : 'winter';
};

/** Overnight: watered crops grow one step, then all soil dries out. */
export const growOvernight = (tile: Tile): Tile => {
  if (!tile.watered) return tile;
  const crop =
    tile.crop && !isRipe(tile.crop) ? { ...tile.crop, growth: tile.crop.growth + 1 } : tile.crop;
  return { ...tile, watered: false, crop };
};

const rainWater = (tile: Tile): Tile =>
  tile.tilled && !tile.watered ? { ...tile, watered: true } : tile;

const generateMorningOrders = (day: number): readonly FarmstandOrder[] => {
  const customer1 =
    FARMSTAND_CUSTOMERS[day % FARMSTAND_CUSTOMERS.length] ?? FARMSTAND_CUSTOMERS[0] ?? 'Traveler';
  const customer2 =
    FARMSTAND_CUSTOMERS[(day + 1) % FARMSTAND_CUSTOMERS.length] ??
    FARMSTAND_CUSTOMERS[0] ??
    'Traveler';
  const dishes: readonly RecipeId[] = ['carrot_soup', 'berry_jam', 'tomato_pasta', 'honey_tea'];
  const dish1 = dishes[day % dishes.length] ?? 'carrot_soup';
  const dish2 = dishes[(day + 2) % dishes.length] ?? 'berry_jam';

  return [
    {
      id: `order_${day}_1`,
      item: dish1,
      itemType: 'recipe',
      customerName: customer1,
      rewardCoins: 24,
      rewardBloom: 4,
    },
    {
      id: `order_${day}_2`,
      item: dish2,
      itemType: 'recipe',
      customerName: customer2,
      rewardCoins: 28,
      rewardBloom: 5,
    },
  ];
};

/** Sleep: advance to the next morning, roll the weather, maybe greet a visitor. */
export const sleep = (state: GameState): Outcome => {
  const grown = mapTiles(state.plot, growOvernight);
  const roll = nextRandom(state.rngSeed);
  const weather = roll.value < BALANCE.rainChance ? 'rain' : 'clear';
  const plot = weather === 'rain' ? mapTiles(grown, rainWater) : grown;
  const day = state.day + 1;
  const season = getSeasonForDay(day);

  // Daily message in a bottle on the shoreline
  const letterIndex = day % BOTTLE_LETTERS.length;
  const bottleData: BottleLetterDef | undefined = BOTTLE_LETTERS[letterIndex] ?? BOTTLE_LETTERS[0];
  const beachBottle: BeachBottle | undefined = bottleData
    ? {
        id: `bottle_${day}`,
        letter: bottleData.letter,
        rewardCoins: bottleData.rewardCoins,
        ...(bottleData.rewardSeed !== undefined ? { rewardSeed: bottleData.rewardSeed } : {}),
        read: false,
      }
    : undefined;

  const farmstandOrders = generateMorningOrders(day);

  const withForage = spawnForageNodes({
    ...state,
    plot,
    day,
    season,
    weather,
    farmstandOrders,
    beachBottle: beachBottle ?? null,
    rngSeed: roll.nextSeed,
  });

  return chain(ok(withForage, { type: 'day-started', day, weather, season }), maybeVisitorArrives);
};

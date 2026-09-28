import { CROP_IDS, DECORATION_IDS, VISITORS } from '../core/config';
import type { CropCounts, GameState, Tile } from '../core/types';

/**
 * Hand-written runtime validation for save data. Saves come from outside the
 * program (browser storage, imported files), so they are never trusted.
 */

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isInt = (v: unknown, min = 0): v is number => Number.isInteger(v) && (v as number) >= min;
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const oneOf = <T extends string>(v: unknown, values: readonly T[]): v is T =>
  typeof v === 'string' && (values as readonly string[]).includes(v);

const TOOLS = ['hoe', 'seeds', 'water', 'basket'] as const;
const VISITOR_IDS = VISITORS.map((v) => v.id);

const isCounts = (v: unknown): v is CropCounts => isObj(v) && CROP_IDS.every((c) => isInt(v[c]));

const isTile = (v: unknown): v is Tile =>
  isObj(v) &&
  isBool(v.tilled) &&
  isBool(v.watered) &&
  (v.crop === null || (isObj(v.crop) && oneOf(v.crop.id, CROP_IDS) && isInt(v.crop.growth)));

const checks: [string, (s: Obj) => boolean][] = [
  ['day', (s) => isInt(s.day, 1)],
  ['coins', (s) => isInt(s.coins)],
  [
    'plot',
    (s) =>
      isObj(s.plot) &&
      isInt(s.plot.width, 1) &&
      isInt(s.plot.height, 1) &&
      Array.isArray(s.plot.tiles) &&
      s.plot.tiles.length === s.plot.width * s.plot.height &&
      s.plot.tiles.every(isTile),
  ],
  ['player', (s) => isObj(s.player) && isInt(s.player.x) && isInt(s.player.z)],
  ['selectedTool', (s) => oneOf(s.selectedTool, TOOLS)],
  ['selectedSeed', (s) => oneOf(s.selectedSeed, CROP_IDS)],
  [
    'inventory',
    (s) => isObj(s.inventory) && isCounts(s.inventory.seeds) && isCounts(s.inventory.produce),
  ],
  [
    'unlockedCrops',
    (s) => Array.isArray(s.unlockedCrops) && s.unlockedCrops.every((c) => oneOf(c, CROP_IDS)),
  ],
  [
    'decorations',
    (s) => Array.isArray(s.decorations) && s.decorations.every((d) => oneOf(d, DECORATION_IDS)),
  ],
  ['bloom', (s) => isInt(s.bloom)],
  [
    'visitor',
    (s) =>
      s.visitor === null ||
      (isObj(s.visitor) && oneOf(s.visitor.id, VISITOR_IDS) && isInt(s.visitor.arrivedOnDay)),
  ],
  [
    'visitorsHelped',
    (s) => Array.isArray(s.visitorsHelped) && s.visitorsHelped.every((v) => oneOf(v, VISITOR_IDS)),
  ],
  ['weather', (s) => oneOf(s.weather, ['clear', 'rain'] as const)],
  ['rngSeed', (s) => isInt(s.rngSeed)],
  [
    'settings',
    (s) =>
      isObj(s.settings) &&
      isBool(s.settings.muted) &&
      typeof s.settings.volume === 'number' &&
      s.settings.volume >= 0 &&
      s.settings.volume <= 1,
  ],
  ['stats', (s) => isObj(s.stats) && isInt(s.stats.harvested) && isInt(s.stats.earned)],
];

export const validateState = (value: unknown): Result<GameState> => {
  if (!isObj(value)) return { ok: false, error: 'state is not an object' };
  for (const [field, check] of checks) {
    if (!check(value)) return { ok: false, error: `invalid field: ${field}` };
  }
  return { ok: true, value: value as unknown as GameState };
};

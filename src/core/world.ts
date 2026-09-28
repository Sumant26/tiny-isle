import type { Cell } from './types';

/**
 * Static island layout on an integer walk grid. The renderer builds the scene
 * from this same data, so what you see and where you can walk always agree.
 *
 * World units: one cell = 1 unit. Cell (x, z) is centred at world
 * (x - CENTER, z - CENTER).
 */

export const WORLD_SIZE = 15;
export const CENTER = (WORLD_SIZE - 1) / 2;
export const ISLAND_RADIUS = 7.2;

export interface Rect {
  readonly x: number;
  readonly z: number;
  readonly w: number;
  readonly d: number;
}

export const LAYOUT = {
  plot: { x: 4, z: 4, w: 6, d: 4 },
  fence: { x: 3, z: 3, w: 8, d: 6 },
  gate: [
    { x: 6, z: 8 },
    { x: 7, z: 8 },
    { x: 3, z: 3 },
    { x: 4, z: 3 },
  ],
  cottage: { x: 3, z: 1, w: 2, d: 2 },
  pond: { x: 1, z: 9, w: 3, d: 3 },
  tree: { x: 12, z: 4, w: 1, d: 1 },
  market: { x: 11, z: 9, w: 2, d: 2 },
  lantern: { x: 9, z: 10 },
  path: [
    { x: 7, z: 9 },
    { x: 7, z: 10 },
    { x: 6, z: 11 },
    { x: 7, z: 12 },
  ],
  playerStart: { x: 7, z: 9 },
  /** Where the player stands to trade. */
  marketFront: { x: 10, z: 10 },
  visitorSpot: { x: 5, z: 10 },
  decorationSlots: {
    flowerbed: { x: 9, z: 12 },
    bench: { x: 11, z: 6 },
    birdbath: { x: 5, z: 12 },
    windchime: { x: 2, z: 5 },
    gnome: { x: 11, z: 3 },
  },
} as const;

export const inRect = (c: Cell, r: Rect): boolean =>
  c.x >= r.x && c.x < r.x + r.w && c.z >= r.z && c.z < r.z + r.d;

export const sameCell = (a: Cell, b: Cell): boolean => a.x === b.x && a.z === b.z;

export const onIsland = (c: Cell): boolean =>
  c.x >= 0 &&
  c.z >= 0 &&
  c.x < WORLD_SIZE &&
  c.z < WORLD_SIZE &&
  Math.hypot(c.x - CENTER, c.z - CENTER) <= ISLAND_RADIUS;

/** Cells on the fence ring around the plot (excluding the gate opening). */
export const isFence = (c: Cell): boolean => {
  const f = LAYOUT.fence;
  if (!inRect(c, f)) return false;
  const edge = c.x === f.x || c.x === f.x + f.w - 1 || c.z === f.z || c.z === f.z + f.d - 1;
  return edge && !LAYOUT.gate.some((g) => sameCell(g, c));
};

const SOLID: readonly Rect[] = [LAYOUT.cottage, LAYOUT.pond, LAYOUT.tree, LAYOUT.market];

export const isWalkable = (c: Cell): boolean =>
  onIsland(c) &&
  !isFence(c) &&
  !SOLID.some((r) => inRect(c, r)) &&
  !(c.x === LAYOUT.lantern.x && c.z === LAYOUT.lantern.z);

/** Plot tile index for a world cell, or -1 when the cell is not on the plot. */
export const cellToTileIndex = (c: Cell): number => {
  const p = LAYOUT.plot;
  if (!inRect(c, p)) return -1;
  return (c.z - p.z) * p.w + (c.x - p.x);
};

export const tileIndexToCell = (index: number): Cell => {
  const p = LAYOUT.plot;
  return { x: p.x + (index % p.w), z: p.z + Math.floor(index / p.w) };
};

export const cellToWorld = (c: Cell): { x: number; z: number } => ({
  x: c.x - CENTER,
  z: c.z - CENTER,
});

export const worldToCell = (x: number, z: number): Cell => ({
  x: Math.round(x + CENTER),
  z: Math.round(z + CENTER),
});

/** Centre of a rectangle in world coordinates. */
export const rectCenterWorld = (r: Rect): { x: number; z: number } => ({
  x: r.x + (r.w - 1) / 2 - CENTER,
  z: r.z + (r.d - 1) / 2 - CENTER,
});

export const isMarketCell = (c: Cell): boolean => inRect(c, LAYOUT.market);

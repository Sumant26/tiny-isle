import type { Cell } from './types';

export type WalkableFn = (cell: Cell) => boolean;

const key = (c: Cell): number => (c.z + 100) * 1000 + (c.x + 100);
const manhattan = (a: Cell, b: Cell): number => Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
const DIRS: readonly Cell[] = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
];

/**
 * A* over a 4-connected grid. Returns the cells to step through after `start`
 * (ending at `goal`), an empty array when already there, or null if unreachable.
 * The grid is tiny (15x15), so a simple sorted open list is plenty fast.
 */
export const findPath = (
  start: Cell,
  goal: Cell,
  walkable: WalkableFn,
  maxNodes = 4096,
): Cell[] | null => {
  if (start.x === goal.x && start.z === goal.z) return [];
  if (!walkable(goal)) return null;

  const open: { cell: Cell; f: number }[] = [{ cell: start, f: manhattan(start, goal) }];
  const g = new Map<number, number>([[key(start), 0]]);
  const cameFrom = new Map<number, Cell>();
  const closed = new Set<number>();

  while (open.length > 0 && closed.size < maxNodes) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    if (!current) break;
    const ck = key(current.cell);
    if (closed.has(ck)) continue;
    if (current.cell.x === goal.x && current.cell.z === goal.z) {
      const path: Cell[] = [];
      let c: Cell | undefined = current.cell;
      while (c && key(c) !== key(start)) {
        path.unshift(c);
        c = cameFrom.get(key(c));
      }
      return path;
    }
    closed.add(ck);
    const baseG = g.get(ck) ?? 0;
    for (const d of DIRS) {
      const n = { x: current.cell.x + d.x, z: current.cell.z + d.z };
      const nk = key(n);
      if (closed.has(nk) || !walkable(n)) continue;
      const tentative = baseG + 1;
      if (tentative < (g.get(nk) ?? Infinity)) {
        g.set(nk, tentative);
        cameFrom.set(nk, current.cell);
        open.push({ cell: n, f: tentative + manhattan(n, goal) });
      }
    }
  }
  return null;
};

/** Nearest walkable neighbour of `target` reachable from `start` (for walking up to solid objects). */
export const findPathToNeighbor = (
  start: Cell,
  target: Cell,
  walkable: WalkableFn,
): Cell[] | null => {
  let best: Cell[] | null = null;
  for (const d of DIRS) {
    const n = { x: target.x + d.x, z: target.z + d.z };
    const p = findPath(start, n, walkable);
    if (p && (best === null || p.length < best.length)) best = p;
  }
  return best;
};

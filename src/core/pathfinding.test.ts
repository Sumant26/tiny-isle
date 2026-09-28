import { describe, expect, it } from 'vitest';
import { findPath, findPathToNeighbor } from './pathfinding';
import type { Cell } from './types';
import { isWalkable, LAYOUT } from './world';

const open = (): boolean => true;
const grid = (rows: string[]) => (c: Cell) => rows[c.z]?.[c.x] === '.';

describe('findPath', () => {
  it('returns an empty path when already at the goal', () => {
    expect(findPath({ x: 1, z: 1 }, { x: 1, z: 1 }, open)).toEqual([]);
  });

  it('returns a shortest straight path on open ground', () => {
    const p = findPath({ x: 0, z: 0 }, { x: 3, z: 0 }, open);
    expect(p).toEqual([
      { x: 1, z: 0 },
      { x: 2, z: 0 },
      { x: 3, z: 0 },
    ]);
  });

  it('walks around walls', () => {
    const walk = grid(['.#.', '.#.', '...']);
    const p = findPath({ x: 0, z: 0 }, { x: 2, z: 0 }, walk);
    expect(p).not.toBeNull();
    expect(p).toHaveLength(6);
    expect(p!.every(walk)).toBe(true);
  });

  it('returns null when the goal is blocked or unreachable', () => {
    expect(findPath({ x: 0, z: 0 }, { x: 1, z: 0 }, grid(['.#']))).toBeNull();
    expect(findPath({ x: 0, z: 0 }, { x: 2, z: 0 }, grid(['.#.']))).toBeNull();
  });

  it('respects the node budget', () => {
    expect(findPath({ x: 0, z: 0 }, { x: 50, z: 50 }, open, 10)).toBeNull();
  });

  it('can reach every plot tile from the player start on the real island', () => {
    for (let z = LAYOUT.plot.z; z < LAYOUT.plot.z + LAYOUT.plot.d; z++) {
      for (let x = LAYOUT.plot.x; x < LAYOUT.plot.x + LAYOUT.plot.w; x++) {
        expect(findPath(LAYOUT.playerStart, { x, z }, isWalkable)).not.toBeNull();
      }
    }
  });
});

describe('findPathToNeighbor', () => {
  it('finds the closest walkable neighbour of a solid target', () => {
    const p = findPathToNeighbor(LAYOUT.playerStart, { x: 11, z: 9 }, isWalkable);
    expect(p).not.toBeNull();
    const end = p!.at(-1)!;
    expect(Math.abs(end.x - 11) + Math.abs(end.z - 9)).toBe(1);
  });

  it('returns null when no neighbour is reachable', () => {
    expect(
      findPathToNeighbor({ x: 0, z: 0 }, { x: 5, z: 5 }, (c) => c.x === 0 && c.z === 0),
    ).toBeNull();
  });
});

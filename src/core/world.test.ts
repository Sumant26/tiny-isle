import { describe, expect, it } from 'vitest';
import {
  cellToTileIndex,
  cellToWorld,
  isFence,
  isMarketCell,
  isWalkable,
  LAYOUT,
  onIsland,
  rectCenterWorld,
  tileIndexToCell,
  worldToCell,
} from './world';

describe('world layout', () => {
  it('round-trips tile index <-> cell for every plot tile', () => {
    const n = LAYOUT.plot.w * LAYOUT.plot.d;
    for (let i = 0; i < n; i++) expect(cellToTileIndex(tileIndexToCell(i))).toBe(i);
  });

  it('returns -1 for cells outside the plot', () => {
    expect(cellToTileIndex({ x: 0, z: 0 })).toBe(-1);
    expect(cellToTileIndex(LAYOUT.playerStart)).toBe(-1);
  });

  it('supports expanded plot heights', () => {
    // Row 5 (z = 8) is outside 4-row plot
    expect(cellToTileIndex({ x: 4, z: 8 }, 4)).toBe(-1);
    // Row 5 is valid when plot is expanded to height 5
    expect(cellToTileIndex({ x: 4, z: 8 }, 5)).toBe(24);
  });

  it('round-trips cell <-> world coordinates', () => {
    const c = { x: 3, z: 11 };
    const w = cellToWorld(c);
    expect(worldToCell(w.x, w.z)).toEqual(c);
    expect(worldToCell(w.x + 0.4, w.z - 0.4)).toEqual(c);
  });

  it('knows the island boundary', () => {
    expect(onIsland({ x: 7, z: 7 })).toBe(true);
    expect(onIsland({ x: 0, z: 0 })).toBe(false);
    expect(onIsland({ x: -1, z: 7 })).toBe(false);
    expect(onIsland({ x: 15, z: 7 })).toBe(false);
  });

  it('treats the fence ring as solid except for the gate', () => {
    expect(isFence({ x: 3, z: 5 })).toBe(true);
    expect(isFence({ x: 6, z: 8 })).toBe(false);
    expect(isFence({ x: 5, z: 5 })).toBe(false);
    expect(isFence({ x: 0, z: 0 })).toBe(false);
  });

  it('marks buildings and props as not walkable', () => {
    expect(isWalkable(LAYOUT.playerStart)).toBe(true);
    expect(isWalkable({ x: 5, z: 5 })).toBe(true);
    expect(isWalkable({ x: LAYOUT.cottage.x, z: LAYOUT.cottage.z })).toBe(false);
    expect(isWalkable({ x: LAYOUT.pond.x + 1, z: LAYOUT.pond.z + 1 })).toBe(false);
    expect(isWalkable({ x: LAYOUT.tree.x, z: LAYOUT.tree.z })).toBe(false);
    expect(isWalkable({ x: LAYOUT.market.x, z: LAYOUT.market.z })).toBe(false);
    expect(isWalkable(LAYOUT.lantern)).toBe(false);
    expect(isWalkable({ x: 3, z: 5 })).toBe(false);
  });

  it('keeps important spots walkable and on the island', () => {
    expect(isWalkable(LAYOUT.marketFront)).toBe(true);
    expect(isWalkable(LAYOUT.visitorSpot)).toBe(true);
    for (const slot of Object.values(LAYOUT.decorationSlots)) expect(onIsland(slot)).toBe(true);
  });

  it('identifies market cells and rectangle centres', () => {
    expect(isMarketCell({ x: 11, z: 9 })).toBe(true);
    expect(isMarketCell({ x: 10, z: 9 })).toBe(false);
    expect(rectCenterWorld({ x: 7, z: 7, w: 1, d: 1 })).toEqual({ x: 0, z: 0 });
    expect(rectCenterWorld({ x: 7, z: 7, w: 2, d: 2 })).toEqual({ x: 0.5, z: 0.5 });
  });
});

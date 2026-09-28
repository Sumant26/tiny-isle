import { describe, expect, it } from 'vitest';
import {
  createPlot,
  cropStage,
  EMPTY_TILE,
  isRipe,
  isValidIndex,
  mapTiles,
  updateTile,
} from './plot';

describe('plot', () => {
  it('creates width*height empty tiles', () => {
    const p = createPlot(3, 2);
    expect(p.tiles).toHaveLength(6);
    expect(p.tiles.every((t) => t === EMPTY_TILE)).toBe(true);
  });

  it('validates indices', () => {
    const p = createPlot(2, 2);
    expect(isValidIndex(p, 0)).toBe(true);
    expect(isValidIndex(p, 3)).toBe(true);
    expect(isValidIndex(p, 4)).toBe(false);
    expect(isValidIndex(p, -1)).toBe(false);
    expect(isValidIndex(p, 1.5)).toBe(false);
  });

  it('updateTile keeps other tiles by reference (structural sharing)', () => {
    const p = createPlot(2, 2);
    const t = { ...EMPTY_TILE, tilled: true };
    const next = updateTile(p, 1, t);
    expect(next).not.toBe(p);
    expect(next.tiles[1]).toBe(t);
    expect(next.tiles[0]).toBe(p.tiles[0]);
    expect(p.tiles[1]).toBe(EMPTY_TILE);
  });

  it('updateTile returns the same plot when the tile is identical', () => {
    const p = createPlot(2, 2);
    expect(updateTile(p, 0, p.tiles[0]!)).toBe(p);
  });

  it('mapTiles returns the same plot when nothing changes', () => {
    const p = createPlot(2, 2);
    expect(mapTiles(p, (t) => t)).toBe(p);
    const changed = mapTiles(p, (t, i) => (i === 0 ? { ...t, tilled: true } : t));
    expect(changed).not.toBe(p);
    expect(changed.tiles[0]?.tilled).toBe(true);
    expect(changed.tiles[1]).toBe(p.tiles[1]);
  });

  it('computes crop stages', () => {
    expect(cropStage({ id: 'sunflower', growth: 0 })).toBe('seed');
    expect(cropStage({ id: 'sunflower', growth: 1 })).toBe('sprout');
    expect(cropStage({ id: 'sunflower', growth: 2 })).toBe('growing');
    expect(cropStage({ id: 'sunflower', growth: 4 })).toBe('ripe');
    expect(isRipe({ id: 'carrot', growth: 2 })).toBe(true);
    expect(isRipe({ id: 'carrot', growth: 1 })).toBe(false);
  });
});

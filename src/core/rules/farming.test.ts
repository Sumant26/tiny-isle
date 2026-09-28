import { describe, expect, it } from 'vitest';
import { makeState, unlockAll, withSeeds, withTile } from '../../test/fixtures';
import { harvest, plant, till, useTool, water } from './farming';

describe('till', () => {
  it('turns grass into soil', () => {
    const s = makeState();
    const r = till(s, 0);
    expect(r.state.plot.tiles[0]?.tilled).toBe(true);
    expect(r.events).toEqual([{ type: 'tilled', index: 0 }]);
    expect(r.state.plot.tiles[1]).toBe(s.plot.tiles[1]);
  });

  it('rejects already tilled and out-of-bounds tiles without changing state', () => {
    const s = withTile(makeState(), 0, { tilled: true });
    expect(till(s, 0)).toEqual({
      state: s,
      events: [{ type: 'rejected', reason: 'already-tilled' }],
    });
    expect(till(s, 999).events[0]).toEqual({ type: 'rejected', reason: 'out-of-bounds' });
    expect(till(s, -1).state).toBe(s);
  });
});

describe('plant', () => {
  const tilled = () => withTile(makeState(), 2, { tilled: true });

  it('plants a seed and uses one from the inventory', () => {
    const r = plant(tilled(), 2, 'carrot');
    expect(r.state.plot.tiles[2]?.crop).toEqual({ id: 'carrot', growth: 0 });
    expect(r.state.inventory.seeds.carrot).toBe(5);
    expect(r.events).toEqual([{ type: 'planted', index: 2, crop: 'carrot' }]);
  });

  it('needs tilled soil', () => {
    expect(plant(makeState(), 2, 'carrot').events[0]).toMatchObject({ reason: 'not-tilled' });
  });

  it('will not plant on top of another crop', () => {
    const s = withTile(tilled(), 2, { crop: { id: 'carrot', growth: 0 } });
    expect(plant(s, 2, 'carrot').events[0]).toMatchObject({ reason: 'occupied' });
  });

  it('refuses locked crops', () => {
    expect(plant(withSeeds(tilled(), 'pumpkin', 3), 2, 'pumpkin').events[0]).toMatchObject({
      reason: 'locked',
    });
  });

  it('needs seeds', () => {
    expect(plant(withSeeds(tilled(), 'carrot', 0), 2, 'carrot').events[0]).toMatchObject({
      reason: 'no-seeds',
    });
  });

  it('rejects out-of-bounds tiles', () => {
    expect(plant(makeState(), 99, 'carrot').events[0]).toMatchObject({ reason: 'out-of-bounds' });
  });
});

describe('water', () => {
  it('waters tilled soil', () => {
    const r = water(withTile(makeState(), 1, { tilled: true }), 1);
    expect(r.state.plot.tiles[1]?.watered).toBe(true);
    expect(r.events).toEqual([{ type: 'watered', index: 1 }]);
  });

  it('rejects grass, already-watered and out-of-bounds tiles', () => {
    expect(water(makeState(), 1).events[0]).toMatchObject({ reason: 'not-tilled' });
    const wet = withTile(makeState(), 1, { tilled: true, watered: true });
    expect(water(wet, 1).events[0]).toMatchObject({ reason: 'already-watered' });
    expect(water(makeState(), 99).events[0]).toMatchObject({ reason: 'out-of-bounds' });
  });
});

describe('harvest', () => {
  it('collects a ripe crop, clears the tile and adds bloom', () => {
    const s = withTile(makeState(), 0, { tilled: true, crop: { id: 'carrot', growth: 2 } });
    const r = harvest(s, 0);
    expect(r.state.plot.tiles[0]).toEqual({ tilled: true, watered: false, crop: null });
    expect(r.state.inventory.produce.carrot).toBe(1);
    expect(r.state.stats.harvested).toBe(1);
    expect(r.state.bloom).toBe(1);
    expect(r.events[0]).toEqual({ type: 'harvested', index: 0, crop: 'carrot' });
  });

  it('leaves regrowable crops in the ground', () => {
    const s = withTile(unlockAll(makeState()), 0, {
      tilled: true,
      crop: { id: 'tomato', growth: 3 },
    });
    expect(harvest(s, 0).state.plot.tiles[0]?.crop).toEqual({ id: 'tomato', growth: 1 });
  });

  it('rejects empty, unripe and out-of-bounds tiles', () => {
    expect(harvest(makeState(), 0).events[0]).toMatchObject({ reason: 'no-crop' });
    const young = withTile(makeState(), 0, { tilled: true, crop: { id: 'carrot', growth: 1 } });
    expect(harvest(young, 0).events[0]).toMatchObject({ reason: 'not-ripe' });
    expect(harvest(makeState(), 99).events[0]).toMatchObject({ reason: 'out-of-bounds' });
  });

  it('can trigger a bloom level-up and crop unlock', () => {
    let s = withTile(makeState({ bloom: 9 }), 0, {
      tilled: true,
      crop: { id: 'carrot', growth: 2 },
    });
    const r = harvest(s, 0);
    s = r.state;
    expect(r.events).toContainEqual({ type: 'bloom-level-up', level: 1 });
    expect(r.events).toContainEqual({ type: 'crop-unlocked', crop: 'tomato' });
    expect(s.unlockedCrops).toContain('tomato');
  });
});

describe('useTool', () => {
  it('dispatches to the rule for the selected tool', () => {
    let s = makeState();
    s = useTool({ ...s, selectedTool: 'hoe' }, 0).state;
    expect(s.plot.tiles[0]?.tilled).toBe(true);
    s = useTool({ ...s, selectedTool: 'seeds' }, 0).state;
    expect(s.plot.tiles[0]?.crop?.id).toBe('carrot');
    s = useTool({ ...s, selectedTool: 'water' }, 0).state;
    expect(s.plot.tiles[0]?.watered).toBe(true);
    const r = useTool({ ...s, selectedTool: 'basket' }, 0);
    expect(r.events[0]).toMatchObject({ reason: 'not-ripe' });
  });
});

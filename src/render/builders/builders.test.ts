import { describe, expect, it } from 'vitest';
import { CROP_IDS, DECORATION_IDS, VISITORS } from '../../core/config';
import type { CropStage } from '../../core/types';
import { cellToWorld, LAYOUT } from '../../core/world';
import { createTestContext, seededRandom } from '../../test/babylon';
import { buildCat, buildFarmer, buildVisitor } from './characters';
import { buildCrop } from './crops';
import { buildDecoration } from './decorations';
import { buildEnvironment } from './environment';

describe('buildEnvironment', () => {
  it('builds the island scenery from the world layout', () => {
    const ctx = createTestContext({ shadows: true, glow: false });
    const env = buildEnvironment(ctx, seededRandom());
    const names = new Set(ctx.scene.transformNodes.map((n) => n.name));
    for (const n of ['environment', 'pond', 'cottage', 'tree', 'market', 'lantern', 'fence'])
      expect(names).toContain(n);
    const tree = ctx.scene.getTransformNodeByName('tree')!;
    expect(tree.position.x).toBeCloseTo(cellToWorld(LAYOUT.tree).x);
    expect(env.lampLight.intensity).toBe(0);
    expect(env.ground.isPickable).toBe(true);
    // Fence posts and flowers are GPU instances of a few source meshes.
    expect(ctx.scene.meshes.filter((m) => m.name.startsWith('post_')).length).toBeGreaterThan(20);
    expect(ctx.scene.meshes.filter((m) => m.name === 'flower').length).toBe(40);
  });

  it('works with the default random source', () => {
    const ctx = createTestContext();
    expect(buildEnvironment(ctx).swaying).toHaveLength(4);
  });
});

describe('buildCrop', () => {
  const stages: CropStage[] = ['seed', 'sprout', 'growing', 'ripe'];
  it.each(CROP_IDS)('builds every stage of %s', (crop) => {
    const ctx = createTestContext();
    for (const stage of stages) {
      const node = buildCrop(ctx, crop, stage);
      expect(node.metadata).toEqual({ crop, stage });
      expect(node.getChildMeshes().length).toBeGreaterThan(0);
    }
  });
});

describe('characters and decorations', () => {
  it('builds the farmer with a hidden watering can and the cat', () => {
    const ctx = createTestContext();
    const farmer = buildFarmer(ctx);
    expect(farmer.root.getChildMeshes().length).toBeGreaterThan(5);
    expect(farmer.can.isEnabled()).toBe(false);
    expect(buildCat(ctx).getChildMeshes().length).toBeGreaterThan(3);
  });

  it.each(VISITORS.map((v) => v.id))('builds visitor %s', (id) => {
    const ctx = createTestContext();
    const v = buildVisitor(ctx, id);
    expect(v.metadata).toEqual({ visitor: id });
    expect(v.getChildMeshes().length).toBeGreaterThan(2);
  });

  it.each(DECORATION_IDS)('builds decoration %s', (id) => {
    const ctx = createTestContext();
    const d = buildDecoration(ctx, id);
    expect(d.metadata).toEqual({ decoration: id });
    expect(d.getChildMeshes().length).toBeGreaterThan(0);
  });
});

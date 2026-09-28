import { describe, expect, it, vi } from 'vitest';
import { createTestContext } from '../../test/babylon';
import { CreateBox, type Scene, TransformNode } from '../babylon';
import { createSceneContext } from '../SceneContext';
import { NullEngine } from '../babylon';
import { buildCat, buildVisitor } from '../builders/characters';
import { buildCrop } from '../builders/crops';
import { buildDecoration } from '../builders/decorations';
import { buildEnvironment } from '../builders/environment';
import { type ModelLoader, ModelLibrary, wrapRoots } from './ModelLibrary';

/** A loader that "loads" a box for any URL, recording what was requested. */
const boxLoader = (fail: string[] = []) => {
  const urls: string[] = [];
  const loader: ModelLoader = (scene: Scene, url: string) => {
    urls.push(url);
    if (fail.some((f) => url.endsWith(f))) return Promise.reject(new Error('404'));
    return Promise.resolve({
      instantiate: (name: string) => wrapRoots(scene, name, [CreateBox(`${name}_box`, {}, scene)]),
    });
  };
  return { loader, urls };
};

describe('ModelLibrary', () => {
  it('uses the fallback when nothing is loaded', () => {
    const ctx = createTestContext();
    const lib = new ModelLibrary();
    const fallback = new TransformNode('fallback', ctx.scene);
    expect(lib.create('prop/tree', () => fallback)).toBe(fallback);
    expect(lib.size).toBe(0);
  });

  it('reports every entry as failed when there is no loader', async () => {
    const ctx = createTestContext();
    expect(await new ModelLibrary().preload(ctx.scene, { 'prop/tree': { file: 't.glb' } })).toEqual(
      ['prop/tree'],
    );
  });

  it('preloads manifest entries and applies scale, rotation and offset', async () => {
    const ctx = createTestContext();
    const { loader, urls } = boxLoader();
    const lib = new ModelLibrary(loader, '/assets/models/');
    const failed = await lib.preload(ctx.scene, {
      'prop/tree': { file: 'tree.glb', scale: 2, rotationY: 90, offsetY: 0.5 },
    });
    expect(failed).toEqual([]);
    expect(urls).toEqual(['/assets/models/tree.glb']);
    expect(lib.has('prop/tree')).toBe(true);
    const onMesh = vi.fn();
    const node = lib.create('prop/tree', () => new TransformNode('x', ctx.scene), onMesh);
    expect(node.name).toBe('prop/tree');
    expect(node.scaling.x).toBe(2);
    expect(node.rotation.y).toBeCloseTo(Math.PI / 2);
    expect(node.position.y).toBe(0.5);
    expect(onMesh).toHaveBeenCalledTimes(1);
  });

  it('skips entries that fail to load', async () => {
    const ctx = createTestContext();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const lib = new ModelLibrary(boxLoader(['bad.glb']).loader);
    const failed = await lib.preload(ctx.scene, {
      'prop/tree': { file: 'bad.glb' },
      'pet/cat': { file: 'cat.glb' },
    });
    expect(failed).toEqual(['prop/tree']);
    expect(lib.has('pet/cat')).toBe(true);
    expect(warn).toHaveBeenCalled();
  });
});

describe('builders with a model library', () => {
  it('swap procedural models for loaded ones and keep metadata', async () => {
    const lib = new ModelLibrary(boxLoader().loader);
    const ctx = createSceneContext(new NullEngine(), { shadows: true, glow: false, models: lib });
    await lib.preload(ctx.scene, {
      'crop/carrot/ripe': { file: 'c.glb' },
      'decoration/bench': { file: 'b.glb' },
      'visitor/hazel': { file: 'h.glb' },
      'pet/cat': { file: 'cat.glb' },
      'prop/tree': { file: 't.glb' },
      'prop/market': { file: 'm.glb' },
    });
    expect(buildCrop(ctx, 'carrot', 'ripe')).toMatchObject({
      name: 'crop/carrot/ripe',
      metadata: { crop: 'carrot', stage: 'ripe' },
    });
    expect(buildCrop(ctx, 'carrot', 'seed').name).toBe('crop_carrot_seed'); // not in manifest
    expect(buildDecoration(ctx, 'bench')).toMatchObject({
      name: 'decoration/bench',
      metadata: { decoration: 'bench' },
    });
    expect(buildVisitor(ctx, 'hazel')).toMatchObject({
      name: 'visitor/hazel',
      metadata: { visitor: 'hazel' },
    });
    expect(buildCat(ctx).name).toBe('pet/cat');
    buildEnvironment(ctx);
    expect(ctx.scene.getTransformNodeByName('prop/tree')?.parent?.name).toBe('tree');
    expect(ctx.scene.getTransformNodeByName('treeProcedural')).toBeNull();
    expect(ctx.scene.getTransformNodeByName('prop/market')?.parent?.name).toBe('market');
    // Loaded meshes cast and receive shadows like the procedural ones.
    const box = ctx.scene.getMeshByName('prop/tree_box')!;
    expect(box.receiveShadows).toBe(true);
    expect(ctx.shadows?.getShadowMap()?.renderList).toContain(box);
  });
});

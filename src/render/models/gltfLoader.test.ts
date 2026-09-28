import { describe, expect, it, vi } from 'vitest';
import { createTestContext } from '../../test/babylon';
import { TransformNode } from '../babylon';

const load = vi.fn();
vi.mock('@babylonjs/core/Loading/sceneLoader', () => ({ LoadAssetContainerAsync: load }));
vi.mock('@babylonjs/loaders/glTF', () => ({}));

describe('createGltfLoader', () => {
  it('loads a container once and instantiates copies under a named root', async () => {
    const ctx = createTestContext();
    const instantiate = vi.fn((nameFn: (s: string) => string) => ({
      rootNodes: [new TransformNode(nameFn('__root__'), ctx.scene)],
    }));
    load.mockResolvedValue({ instantiateModelsToScene: instantiate });
    const { createGltfLoader } = await import('./gltfLoader');
    const template = await createGltfLoader()(ctx.scene, './models/tree.glb');
    expect(load).toHaveBeenCalledWith('./models/tree.glb', ctx.scene);
    const node = template.instantiate('prop/tree');
    expect(node.name).toBe('prop/tree');
    expect(node.getChildren()[0]?.name).toBe('prop/tree___root__');
    template.instantiate('prop/tree');
    expect(load).toHaveBeenCalledTimes(1);
    expect(instantiate).toHaveBeenCalledTimes(2);
  });
});

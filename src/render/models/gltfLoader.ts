import type { Scene, TransformNode } from '../babylon';
import { type ModelLoader, wrapRoots } from './ModelLibrary';

/**
 * Loads .glb/.gltf files. The glTF loader is imported on first use, so games
 * without custom models never download it.
 */
export const createGltfLoader = (): ModelLoader => async (scene: Scene, url: string) => {
  const [{ LoadAssetContainerAsync }] = await Promise.all([
    import('@babylonjs/core/Loading/sceneLoader'),
    import('@babylonjs/loaders/glTF'),
  ]);
  const container = await LoadAssetContainerAsync(url, scene);
  return {
    instantiate: (name: string) => {
      const entries = container.instantiateModelsToScene((source) => `${name}_${source}`, false);
      return wrapRoots(scene, name, entries.rootNodes as TransformNode[]);
    },
  };
};

import type { AbstractMesh, Scene } from '../babylon';
import { TransformNode } from '../babylon';
import type { ModelEntry, ModelManifest } from './manifest';

/** A loaded model that can be stamped out many times. */
export interface ModelTemplate {
  instantiate(name: string): TransformNode;
}

export type ModelLoader = (scene: Scene, url: string) => Promise<ModelTemplate>;

/**
 * Swaps procedural models for glTF files listed in the manifest. Anything that
 * isn't listed, or fails to load, falls back to the procedural builder, so the
 * game always renders.
 */
export class ModelLibrary {
  private readonly templates = new Map<string, { template: ModelTemplate; entry: ModelEntry }>();

  constructor(
    private readonly loader: ModelLoader | null = null,
    private readonly baseUrl = './models/',
  ) {}

  get size(): number {
    return this.templates.size;
  }

  has(key: string): boolean {
    return this.templates.has(key);
  }

  /** Loads every manifest entry in parallel. Resolves with the keys that failed. */
  async preload(scene: Scene, manifest: ModelManifest): Promise<string[]> {
    const entries = Object.entries(manifest);
    const loader = this.loader;
    if (!loader) return entries.map(([key]) => key);
    const failed: string[] = [];
    await Promise.all(
      entries.map(async ([key, entry]) => {
        try {
          const template = await loader(scene, `${this.baseUrl}${entry.file}`);
          this.templates.set(key, { template, entry });
        } catch (error) {
          console.warn(`[tiny-isle] could not load model ${key} (${entry.file})`, error);
          failed.push(key);
        }
      }),
    );
    return failed;
  }

  /** A loaded model for `key`, or whatever `fallback` builds. */
  create(
    key: string,
    fallback: () => TransformNode,
    onMesh?: (mesh: AbstractMesh) => void,
  ): TransformNode {
    const found = this.templates.get(key);
    if (!found) return fallback();
    const node = found.template.instantiate(key);
    const { scale = 1, rotationY = 0, offsetY = 0 } = found.entry;
    node.scaling.setAll(scale);
    node.rotation.y = (rotationY * Math.PI) / 180;
    node.position.y += offsetY;
    if (onMesh) for (const m of node.getChildMeshes(false)) onMesh(m);
    return node;
  }
}

/** Wraps nodes produced by an instantiation under one named root. */
export const wrapRoots = (
  scene: Scene,
  name: string,
  roots: readonly TransformNode[],
): TransformNode => {
  const root = new TransformNode(name, scene);
  for (const r of roots) r.parent = root;
  return root;
};

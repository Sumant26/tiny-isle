import { describe, expect, it } from 'vitest';
import { babylonChunks } from './babylonChunks';

interface Info {
  isEntry?: boolean;
  importedIds: string[];
  dynamicallyImportedIds: string[];
}

const run = (graph: Record<string, Info>) => {
  const chunks = babylonChunks();
  const ctx = {
    getModuleIds: () => Object.keys(graph)[Symbol.iterator](),
    getModuleInfo: (id: string) => graph[id] ?? null,
  };
  (chunks.plugin.buildEnd as unknown as (this: typeof ctx) => void).call(ctx);
  return chunks.group;
};

const B = (p: string) => `/x/node_modules/@babylonjs/${p}`;

describe('babylonChunks', () => {
  it('puts engine code the app reaches in "babylon" and loader-only code in "gltf"', () => {
    const group = run({
      '/x/src/main.ts': {
        isEntry: true,
        importedIds: [B('core/scene.js'), '/x/src/render/models/gltfLoader.ts'],
        dynamicallyImportedIds: [],
      },
      [B('core/scene.js')]: {
        importedIds: [],
        dynamicallyImportedIds: [B('core/Shaders/default.js')],
      },
      [B('core/Shaders/default.js')]: { importedIds: [], dynamicallyImportedIds: [] },
      '/x/src/render/models/gltfLoader.ts': {
        importedIds: [],
        dynamicallyImportedIds: [B('core/Loading/sceneLoader.js'), B('loaders/glTF/index.js')],
      },
      [B('core/Loading/sceneLoader.js')]: {
        importedIds: [B('core/scene.js')],
        dynamicallyImportedIds: [],
      },
      [B('loaders/glTF/index.js')]: { importedIds: [], dynamicallyImportedIds: [] },
    });
    expect(group(B('core/scene.js'))).toBe('babylon');
    expect(group(B('core/Shaders/default.js'))).toBe('babylon'); // on-demand shader, still the app's
    expect(group(B('core/Loading/sceneLoader.js'))).toBe('gltf');
    expect(group(B('loaders/glTF/index.js'))).toBe('gltf');
    expect(group('/x/src/main.ts')).toBeNull();
  });

  it('tolerates modules without info', () => {
    const group = run({
      '/x/src/main.ts': {
        isEntry: true,
        importedIds: ['/x/missing.js'],
        dynamicallyImportedIds: [],
      },
    });
    expect(group(B('core/anything.js'))).toBe('gltf');
  });
});

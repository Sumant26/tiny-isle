import type { Plugin } from 'vite';

/**
 * Splits Babylon.js into two chunks:
 *
 * - `babylon`: every engine module the game can reach without the glTF loader
 *   (including shaders it loads on demand). Long-cached and precached offline.
 * - `gltf`: the glTF loader plus the extra engine code only it needs. Loaded
 *   the first time a custom model is used, so games without models never pay for it.
 *
 * A path test alone can't tell those apart, so this plugin walks the module graph
 * after it's built and records which modules the app reaches.
 */
export const babylonChunks = (
  lazyBoundaries: RegExp[] = [/src[\\/]render[\\/]models[\\/]gltfLoader\.ts$/],
): { plugin: Plugin; group: (id: string) => 'babylon' | 'gltf' | null } => {
  const appReach = new Set<string>();

  const plugin: Plugin = {
    name: 'tiny-isle:babylon-chunks',
    apply: 'build',
    buildEnd() {
      appReach.clear();
      const queue = [...this.getModuleIds()].filter((id) => this.getModuleInfo(id)?.isEntry);
      while (queue.length) {
        const id = queue.pop();
        if (id === undefined || appReach.has(id)) continue;
        appReach.add(id);
        const info = this.getModuleInfo(id);
        if (!info) continue;
        queue.push(...info.importedIds);
        // Follow on-demand imports too (e.g. shaders), except across the lazy boundary.
        if (!lazyBoundaries.some((re) => re.test(id))) queue.push(...info.dynamicallyImportedIds);
      }
    },
  };

  const group = (id: string): 'babylon' | 'gltf' | null => {
    if (!/node_modules[\\/]@babylonjs[\\/]/.test(id)) return null;
    return appReach.has(id) ? 'babylon' : 'gltf';
  };

  return { plugin, group };
};

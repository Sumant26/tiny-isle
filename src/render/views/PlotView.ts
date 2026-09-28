import { cropStage } from '../../core/plot';
import type { CropStage, Tile } from '../../core/types';
import { cellToWorld, tileIndexToCell } from '../../core/world';
import { selectTiles } from '../../state/selectors';
import type { Store } from '../../state/store';
import { CreateBox, type Mesh, TransformNode } from '../babylon';
import { buildCrop } from '../builders/crops';
import { PALETTE } from '../palette';
import { GROUND_Y, type SceneContext } from '../SceneContext';
import { easings } from '../tween';

interface TileVisual {
  readonly root: TransformNode;
  readonly soil: Mesh;
  readonly furrows: Mesh[];
  crop: TransformNode | null;
  cropKey: string | null;
}

const cropKey = (tile: Tile): string | null => {
  if (!tile.crop) return null;
  const stage: CropStage = cropStage(tile.crop);
  return `${tile.crop.id}:${stage}`;
};

/**
 * Keeps plot meshes in sync with `state.plot.tiles`. Because state is immutable,
 * a tile whose object reference is unchanged is skipped entirely: sleeping on a
 * plot with one watered crop touches exactly one tile's meshes.
 */
export class PlotView {
  readonly root: TransformNode;
  private readonly visuals: TileVisual[] = [];
  private readonly unsubscribe: () => void;
  /** Crop nodes that sway gently each frame. */
  readonly swaying = new Set<TransformNode>();

  constructor(
    private readonly ctx: SceneContext,
    store: Store,
  ) {
    this.root = new TransformNode('plot', ctx.scene);
    const tiles = selectTiles(store.getState());
    tiles.forEach((tile, i) => {
      this.visuals.push(this.createTile(i));
      this.sync(i, tile, false);
    });
    this.unsubscribe = store.select(selectTiles, (next, prev) => {
      next.forEach((tile, i) => {
        if (tile !== prev[i]) this.sync(i, tile, true);
      });
    });
  }

  private createTile(index: number): TileVisual {
    const { scene, shape } = this.ctx;
    const root = new TransformNode(`tile_${index}`, scene);
    root.parent = this.root;
    const w = cellToWorld(tileIndexToCell(index));
    root.position.set(w.x, GROUND_Y, w.z);
    root.metadata = { tileIndex: index };
    const soil = shape(
      CreateBox(`soil_${index}`, { width: 0.94, depth: 0.94, height: 0.12 }, scene),
      PALETTE.soil,
      {
        parent: root,
        castShadow: false,
      },
    );
    soil.position.y = 0.04;
    const furrows = [-1, 0, 1].map((i) => {
      const f = shape(
        CreateBox('furrow', { width: 0.78, depth: 0.07, height: 0.03 }, scene),
        PALETTE.soilFurrow,
        {
          parent: root,
          castShadow: false,
          pickable: false,
        },
      );
      f.position.set(0, 0.11, i * 0.26);
      return f;
    });
    return { root, soil, furrows, crop: null, cropKey: null };
  }

  private sync(index: number, tile: Tile, animate: boolean): void {
    const v = this.visuals[index];
    if (!v) return;
    v.soil.setEnabled(tile.tilled);
    for (const f of v.furrows) {
      f.setEnabled(tile.tilled);
      f.material = this.ctx.material(tile.watered ? PALETTE.soilWetFurrow : PALETTE.soilFurrow);
    }
    v.soil.material = this.ctx.material(tile.watered ? PALETTE.soilWet : PALETTE.soil);

    const key = cropKey(tile);
    if (key === v.cropKey) return;
    if (v.crop) {
      this.swaying.delete(v.crop);
      v.crop.dispose();
      v.crop = null;
    }
    v.cropKey = key;
    if (tile.crop) {
      const node = buildCrop(this.ctx, tile.crop.id, cropStage(tile.crop));
      node.parent = v.root;
      node.position.y = 0.1;
      this.swaying.add(node);
      v.crop = node;
      if (animate) {
        this.ctx.tweener.tween({
          duration: 0.35,
          ease: easings.outBack,
          onUpdate: (t) => node.scaling.setAll(Math.max(0.01, t)),
        });
      }
    }
  }

  /** Test/debug helper: which crop visual a tile currently shows. */
  describeTile(index: number): { tilled: boolean; crop: string | null } {
    const v = this.visuals[index];
    return { tilled: v?.soil.isEnabled() ?? false, crop: v?.cropKey ?? null };
  }

  tileRoot(index: number): TransformNode | undefined {
    return this.visuals[index]?.root;
  }

  dispose(): void {
    this.unsubscribe();
    this.root.dispose();
  }
}

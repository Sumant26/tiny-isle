import type { GameEvent } from '../core/types';
import { cellToWorld, tileIndexToCell } from '../core/world';
import { CreateSphere, Vector3 } from './babylon';
import { PALETTE } from './palette';
import { GROUND_Y, type SceneContext } from './SceneContext';
import { easings } from './tween';

const HARVEST_COLORS: Record<string, string> = {
  carrot: PALETTE.carrot,
  tomato: PALETTE.tomato,
  strawberry: PALETTE.strawberry,
  sunflower: PALETTE.petal,
  pumpkin: PALETTE.pumpkin,
};

/** Small one-shot particle bursts, built from a handful of spheres. */
export class Effects {
  constructor(
    private readonly ctx: SceneContext,
    private readonly random: () => number = Math.random,
  ) {}

  burst(at: Vector3, hex: string, count = 8, spread = 0.6, rise = 0.8): void {
    for (let i = 0; i < count; i++) {
      const p = this.ctx.shape(
        CreateSphere('spark', { diameter: 0.09, segments: 4 }, this.ctx.scene),
        hex,
        { castShadow: false, pickable: false },
      );
      const a = this.random() * Math.PI * 2;
      const r = spread * (0.5 + this.random() * 0.5);
      const end = new Vector3(
        at.x + Math.cos(a) * r,
        at.y + rise * (0.5 + this.random()),
        at.z + Math.sin(a) * r,
      );
      p.position.copyFrom(at);
      void this.ctx.tweener
        .tween({
          duration: 0.5 + this.random() * 0.2,
          ease: easings.outQuad,
          onUpdate: (t) => {
            p.position = Vector3.Lerp(at, end, t);
            p.position.y -= t * t * rise * 0.8;
            p.scaling.setAll(1 - t * 0.8);
          },
        })
        .promise.then(() => {
          p.dispose();
        });
    }
  }

  /** Maps game events to visual feedback. */
  handle(event: GameEvent): void {
    if (!('index' in event)) return;
    const w = cellToWorld(tileIndexToCell(event.index));
    const at = new Vector3(w.x, GROUND_Y + 0.2, w.z);
    switch (event.type) {
      case 'tilled':
        this.burst(at, PALETTE.soil, 6, 0.4, 0.4);
        break;
      case 'watered':
        this.burst(at, PALETTE.waterDrop, 10, 0.45, 0.5);
        break;
      case 'planted':
        this.burst(at, PALETTE.sprout, 5, 0.3, 0.3);
        break;
      case 'harvested':
        this.burst(at, HARVEST_COLORS[event.crop] ?? PALETTE.petal, 12, 0.7, 1.2);
        break;
    }
  }
}

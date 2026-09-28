import type { Cell } from '../../core/types';
import { cellToWorld } from '../../core/world';
import type { TransformNode } from '../babylon';
import { buildCat, buildFarmer, type Farmer } from '../builders/characters';
import { GROUND_Y, type SceneContext } from '../SceneContext';
import { easings, lerp } from '../tween';

/** Anything that can walk the player along a path (the renderer, or a fake in tests). */
export interface Mover {
  walk(
    path: readonly Cell[],
    options?: { signal?: AbortSignal; onStep?: (cell: Cell) => void },
  ): Promise<boolean>;
  /** Plays a short "use tool" gesture. */
  act(kind: 'water' | 'dig' | 'pick' | 'plant'): Promise<void>;
}

export const STEP_SECONDS = 0.2;

export const facingAngle = (dx: number, dz: number): number => Math.atan2(dx, dz);

export class PlayerView implements Mover {
  readonly farmer: Farmer;
  readonly cat: TransformNode;
  private bobTime = 0;
  private walking = false;
  private readonly observer;

  constructor(
    private readonly ctx: SceneContext,
    start: Cell,
  ) {
    this.farmer = buildFarmer(ctx);
    this.cat = buildCat(ctx);
    const w = cellToWorld(start);
    this.farmer.root.position.set(w.x, GROUND_Y, w.z);
    this.cat.position.set(w.x - 0.6, GROUND_Y, w.z + 0.4);
    this.observer = ctx.scene.onBeforeRenderObservable.add(() => {
      this.tick(ctx.frameDelta());
    });
  }

  get position(): { x: number; z: number } {
    return { x: this.farmer.root.position.x, z: this.farmer.root.position.z };
  }

  private idleTime = 0;

  get isIdle(): boolean {
    return !this.walking && this.idleTime > 3;
  }

  /** Plays a happy jump and heart reaction when cat is pet. */
  async petCatReact(): Promise<void> {
    const origY = this.cat.position.y;
    await this.ctx.tweener.tween({
      duration: 0.35,
      ease: easings.outBack,
      onUpdate: (k) => {
        this.cat.position.y = origY + Math.sin(k * Math.PI) * 0.25;
        this.cat.rotation.y += 0.2;
      },
    }).promise;
    this.cat.position.y = origY;
  }

  /** Plays an energetic fishing catch celebration jump on the farmer. */
  async catchFishReact(): Promise<void> {
    const root = this.farmer.root;
    const origY = root.position.y;
    await this.ctx.tweener.tween({
      duration: 0.6,
      ease: easings.outBack,
      onUpdate: (k) => {
        root.position.y = origY + Math.sin(k * Math.PI) * 0.45;
        root.rotation.y += 0.15;
      },
    }).promise;
    root.position.y = origY;
  }

  /** Per-frame idle bob and cat follow. Exposed for tests. */
  tick(dt: number): void {
    this.bobTime += dt;
    if (!this.walking) this.idleTime += dt;
    else this.idleTime = 0;

    const speed = this.walking ? 12 : 2.2;
    const amp = this.walking ? 0.06 : 0.03;
    this.farmer.root.position.y = GROUND_Y + Math.abs(Math.sin(this.bobTime * speed)) * amp;

    // The cat trails behind at a comfortable distance or naps when idle.
    const p = this.farmer.root.position;
    const c = this.cat.position;
    const dx = p.x - c.x;
    const dz = p.z - c.z;
    const dist = Math.hypot(dx, dz);

    if (this.isIdle) {
      // Cat naps: lowered position, slight breathing scale
      this.cat.scaling.y = 1.0 + Math.sin(this.bobTime * 1.5) * 0.08;
      this.cat.position.y = GROUND_Y - 0.04;
    } else {
      this.cat.scaling.y = 1.2;
      this.cat.position.y = GROUND_Y;
      if (dist > 0.9) {
        const k = Math.min(1, dt * 3);
        c.x += dx * k * ((dist - 0.9) / dist);
        c.z += dz * k * ((dist - 0.9) / dist);
        this.cat.rotation.y = facingAngle(dx, dz);
      }
    }
  }

  async walk(
    path: readonly Cell[],
    { signal, onStep }: { signal?: AbortSignal; onStep?: (cell: Cell) => void } = {},
  ): Promise<boolean> {
    this.walking = true;
    try {
      for (const cell of path) {
        if (signal?.aborted) return false;
        const from = { ...this.position };
        const to = cellToWorld(cell);
        this.farmer.root.rotation.y = facingAngle(to.x - from.x, to.z - from.z);
        const t = this.ctx.tweener.tween({
          duration: STEP_SECONDS,
          ease: easings.linear,
          onUpdate: (k) => {
            this.farmer.root.position.x = lerp(from.x, to.x, k);
            this.farmer.root.position.z = lerp(from.z, to.z, k);
          },
        });
        const onAbort = (): void => t.cancel();
        signal?.addEventListener('abort', onAbort, { once: true });
        const done = await t.promise;
        signal?.removeEventListener('abort', onAbort);
        if (!done) return false;
        onStep?.(cell);
      }
      return true;
    } finally {
      this.walking = false;
    }
  }

  async act(kind: 'water' | 'dig' | 'pick' | 'plant'): Promise<void> {
    const root = this.farmer.root;
    this.farmer.can.setEnabled(kind === 'water');
    await this.ctx.tweener.tween({
      duration: 0.3,
      ease: easings.inOutSine,
      onUpdate: (t) => {
        root.rotation.x = Math.sin(t * Math.PI) * 0.35;
      },
    }).promise;
    root.rotation.x = 0;
    this.farmer.can.setEnabled(false);
  }

  /** Snap to a cell (after loading a save). */
  place(cell: Cell): void {
    const w = cellToWorld(cell);
    this.farmer.root.position.x = w.x;
    this.farmer.root.position.z = w.z;
  }

  dispose(): void {
    this.ctx.scene.onBeforeRenderObservable.remove(this.observer);
    this.farmer.root.dispose();
    this.cat.dispose();
  }
}

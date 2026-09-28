/**
 * Tiny frame-driven tween runner. Pure TypeScript (no Babylon), driven by
 * `update(dtSeconds)` from the render loop, which keeps it deterministic and
 * unit-testable with synthetic time.
 */
export type Ease = (t: number) => number;

export const easings = {
  linear: (t: number) => t,
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
} satisfies Record<string, Ease>;

export interface TweenOptions {
  duration: number;
  onUpdate: (t: number) => void;
  ease?: Ease;
}

interface Running {
  elapsed: number;
  opts: TweenOptions;
  resolve: (completed: boolean) => void;
}

export class Tweener {
  private running = new Set<Running>();

  get active(): number {
    return this.running.size;
  }

  /** Resolves true when finished, false when cancelled. */
  tween(opts: TweenOptions): { promise: Promise<boolean>; cancel: () => void } {
    let entry!: Running;
    const promise = new Promise<boolean>((resolve) => {
      entry = { elapsed: 0, opts, resolve };
    });
    if (opts.duration <= 0) {
      opts.onUpdate(1);
      entry.resolve(true);
      return { promise, cancel: () => undefined };
    }
    this.running.add(entry);
    opts.onUpdate(0);
    return {
      promise,
      cancel: () => {
        if (this.running.delete(entry)) entry.resolve(false);
      },
    };
  }

  /** Waits for a number of seconds of game time. */
  wait(seconds: number): Promise<boolean> {
    return this.tween({ duration: seconds, onUpdate: () => undefined }).promise;
  }

  update(dt: number): void {
    for (const r of [...this.running]) {
      r.elapsed += dt;
      const t = Math.min(1, r.elapsed / r.opts.duration);
      r.opts.onUpdate((r.opts.ease ?? easings.linear)(t));
      if (t >= 1) {
        this.running.delete(r);
        r.resolve(true);
      }
    }
  }

  cancelAll(): void {
    for (const r of this.running) r.resolve(false);
    this.running.clear();
  }
}

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

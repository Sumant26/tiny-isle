import { selectBloomLevel, selectWeather } from '../../state/selectors';
import type { Store } from '../../state/store';
import { CreateSphere, type Mesh, type StandardMaterial, TransformNode } from '../babylon';
import { PALETTE } from '../palette';
import { color, GROUND_Y, type SceneContext } from '../SceneContext';

interface Flyer {
  node: TransformNode | Mesh;
  x: number;
  z: number;
  y: number;
  phase: number;
}

/**
 * Life on the island: swaying plants, butterflies (more as bloom grows),
 * fireflies at night and rain drops. All motion is cheap per-frame math.
 */
export class AmbientView {
  private readonly butterflies: Flyer[] = [];
  private readonly fireflies: Flyer[] = [];
  private readonly drops: Mesh[] = [];
  private time = 0;
  private night = false;
  private raining = false;
  private readonly unsubscribers: (() => void)[] = [];
  private readonly observer;
  private readonly fireflyMaterial: StandardMaterial;

  constructor(
    private readonly ctx: SceneContext,
    store: Store,
    private readonly swaying: () => Iterable<TransformNode>,
    private readonly random: () => number = Math.random,
  ) {
    this.fireflyMaterial = ctx.material(PALETTE.firefly, PALETTE.firefly);
    for (let i = 0; i < 16; i++) {
      const f = ctx.shape(
        CreateSphere('firefly', { diameter: 0.08, segments: 4 }, ctx.scene),
        this.fireflyMaterial,
        { castShadow: false, pickable: false },
      );
      f.setEnabled(false);
      this.fireflies.push(this.flyer(f));
    }
    for (let i = 0; i < 60; i++) {
      const d = ctx.shape(
        CreateSphere(
          'rain',
          { diameterX: 0.03, diameterY: 0.25, diameterZ: 0.03, segments: 3 },
          ctx.scene,
        ),
        PALETTE.waterDrop,
        { castShadow: false, pickable: false },
      );
      d.position.set((random() - 0.5) * 14, random() * 8, (random() - 0.5) * 14);
      d.setEnabled(false);
      this.drops.push(d);
    }
    this.setButterflies(selectBloomLevel(store.getState()));
    this.setRain(selectWeather(store.getState()) === 'rain');
    this.unsubscribers.push(
      store.select(selectBloomLevel, (l) => this.setButterflies(l)),
      store.select(selectWeather, (w) => this.setRain(w === 'rain')),
    );
    this.observer = ctx.scene.onBeforeRenderObservable.add(() => {
      this.tick(ctx.frameDelta());
    });
  }

  private flyer(node: TransformNode | Mesh): Flyer {
    return {
      node,
      x: (this.random() - 0.5) * 11,
      z: (this.random() - 0.5) * 11,
      y: 0.8 + this.random() * 1.4,
      phase: this.random() * 6,
    };
  }

  get butterflyCount(): number {
    return this.butterflies.length;
  }

  get isRaining(): boolean {
    return this.raining;
  }

  /** Two butterflies per bloom level. */
  setButterflies(level: number): void {
    const target = level * 2;
    while (this.butterflies.length < target) {
      const i = this.butterflies.length;
      const node = new TransformNode('butterfly', this.ctx.scene);
      const hex = PALETTE.butterfly[i % PALETTE.butterfly.length] ?? PALETTE.flowers[0];
      for (const side of [-1, 1]) {
        const wing = this.ctx.shape(
          CreateSphere(
            'wing',
            { diameterX: 0.16, diameterY: 0.02, diameterZ: 0.12 },
            this.ctx.scene,
          ),
          hex,
          { parent: node, castShadow: false, pickable: false },
        );
        wing.position.x = side * 0.08;
      }
      this.butterflies.push(this.flyer(node));
    }
    while (this.butterflies.length > target) this.butterflies.pop()?.node.dispose();
  }

  setNight(night: boolean): void {
    this.night = night;
    for (const f of this.fireflies) f.node.setEnabled(night);
  }

  setRain(raining: boolean): void {
    this.raining = raining;
    for (const d of this.drops) d.setEnabled(raining);
  }

  tick(dt: number): void {
    this.time += dt;
    const t = this.time;
    for (const node of this.swaying()) {
      const ph = node.uniqueId * 0.7;
      node.rotation.z = Math.sin(t * 1.6 + ph) * 0.08;
      node.rotation.x = Math.cos(t * 1.3 + ph) * 0.04;
    }
    for (const b of this.butterflies) {
      b.node.position.set(
        b.x + Math.sin(t * 0.4 + b.phase) * 2,
        b.y + Math.sin(t * 2 + b.phase) * 0.3,
        b.z + Math.cos(t * 0.35 + b.phase) * 2,
      );
      const wings = b.node.getChildren();
      wings.forEach((w, i) => {
        (w as TransformNode).rotation.z = (i ? -1 : 1) * Math.sin(t * 14 + b.phase) * 0.8;
      });
    }
    if (this.night) {
      for (const f of this.fireflies) {
        f.node.position.set(
          f.x + Math.sin(t * 0.6 + f.phase) * 0.8,
          f.y + Math.sin(t * 1.3 + f.phase) * 0.3,
          f.z + Math.cos(t * 0.5 + f.phase) * 0.8,
        );
      }
      this.fireflyMaterial.emissiveColor = color(PALETTE.firefly).scale(
        0.6 + 0.4 * Math.sin(t * 3),
      );
    }
    if (this.raining) {
      for (const d of this.drops) {
        d.position.y -= dt * 9;
        if (d.position.y < GROUND_Y) d.position.y += 8;
      }
    }
  }

  dispose(): void {
    for (const u of this.unsubscribers) u();
    this.ctx.scene.onBeforeRenderObservable.remove(this.observer);
    for (const b of this.butterflies) b.node.dispose();
    for (const f of this.fireflies) f.node.dispose();
    for (const d of this.drops) d.dispose();
  }
}

import { LAYOUT, rectCenterWorld } from '../../core/world';
import { selectBloomLevel, selectSeason, selectWeather } from '../../state/selectors';
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

interface SmokePuff {
  mesh: Mesh;
  progress: number;
  phase: number;
}

/**
 * Life on the island: swaying plants, butterflies, fireflies, rain drops,
 * animated chimney smoke, and rocking chair.
 */
export class AmbientView {
  private readonly butterflies: Flyer[] = [];
  private readonly fireflies: Flyer[] = [];
  private readonly drops: Mesh[] = [];
  private readonly smokePuffs: SmokePuff[] = [];
  private time = 0;
  private night = false;
  private raining = false;
  private readonly unsubscribers: (() => void)[] = [];
  private readonly observer;
  private readonly fireflyMaterial: StandardMaterial;
  private readonly smokeMaterial: StandardMaterial;
  private readonly chimneyPos: { x: number; y: number; z: number };
  private readonly rockingChair: TransformNode | undefined;
  private readonly flowerBoxFlowers: Mesh[] | undefined;
  private readonly random: () => number;

  constructor(
    private readonly ctx: SceneContext,
    store: Store,
    private readonly swaying: () => Iterable<TransformNode>,
    chairOrRandom?: TransformNode | (() => number),
    flowerBoxFlowers?: Mesh[],
    random: () => number = Math.random,
  ) {
    if (typeof chairOrRandom === 'function') {
      this.random = chairOrRandom;
      this.rockingChair = undefined;
      this.flowerBoxFlowers = undefined;
    } else {
      this.rockingChair = chairOrRandom;
      this.flowerBoxFlowers = flowerBoxFlowers;
      this.random = random;
    }

    this.fireflyMaterial = ctx.material(PALETTE.firefly, PALETTE.firefly);
    this.smokeMaterial = ctx.material('#D0D4DC', '#A0A4AC');
    this.smokeMaterial.alpha = 0.65;

    const cottageCenter = rectCenterWorld(LAYOUT.cottage);
    this.chimneyPos = {
      x: cottageCenter.x + 0.6,
      y: 2.7,
      z: cottageCenter.z - 0.3,
    };

    // Smoke puffs from chimney
    for (let i = 0; i < 8; i++) {
      const puff = ctx.shape(
        CreateSphere('chimneySmoke', { diameter: 0.16, segments: 4 }, ctx.scene),
        this.smokeMaterial,
        { castShadow: false, pickable: false },
      );
      const progress = i / 8;
      puff.position.set(this.chimneyPos.x, this.chimneyPos.y + progress * 1.5, this.chimneyPos.z);
      this.smokePuffs.push({
        mesh: puff,
        progress,
        phase: random() * Math.PI * 2,
      });
    }

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
    this.setSeason(selectSeason(store.getState()));
    this.unsubscribers.push(
      store.select(selectBloomLevel, (l) => this.setButterflies(l)),
      store.select(selectWeather, (w) => this.setRain(w === 'rain')),
      store.select(selectSeason, (s) => this.setSeason(s)),
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

  setSeason(season: 'spring' | 'summer' | 'autumn' | 'winter' = 'spring'): void {
    if (!this.flowerBoxFlowers || this.flowerBoxFlowers.length === 0) return;
    const seasonPalette = {
      spring: ['#FFB7C5', '#FF9EAA', '#FFCCD5', '#FFF0F5'],
      summer: ['#FFC83B', '#FFAA00', '#FF5722', '#FFD166'],
      autumn: ['#E06D27', '#B83B26', '#D4A373', '#9D0208'],
      winter: ['#2E6F40', '#E63946', '#FFFFFF', '#A8DADC'],
    }[season];

    this.flowerBoxFlowers.forEach((mesh, idx) => {
      const hex = seasonPalette[idx % seasonPalette.length] ?? '#FFB7C5';
      mesh.material = this.ctx.material(hex);
    });
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
    if (this.rockingChair) {
      this.rockingChair.rotation.x = Math.sin(t * 1.8) * 0.08;
    }
    // Animate chimney smoke puffs
    for (const puff of this.smokePuffs) {
      puff.progress += dt * 0.35;
      if (puff.progress > 1) {
        puff.progress = 0;
      }
      const p = puff.progress;
      const xOffset = Math.sin(t * 1.2 + puff.phase) * 0.25 * p;
      const zOffset = Math.cos(t * 0.9 + puff.phase) * 0.2 * p;
      puff.mesh.position.set(
        this.chimneyPos.x + xOffset,
        this.chimneyPos.y + p * 1.6,
        this.chimneyPos.z + zOffset,
      );
      const scale = 0.5 + p * 1.4;
      puff.mesh.scaling.set(scale, scale * 1.2, scale);
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
    for (const p of this.smokePuffs) p.mesh.dispose();
  }
}

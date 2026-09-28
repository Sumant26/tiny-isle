import { Color3, Color4, type Mesh, type PointLight, type StandardMaterial } from './babylon';
import { PALETTE } from './palette';
import { color, type SceneContext } from './SceneContext';
import { easings } from './tween';

export type TimeOfDay = 'day' | 'dusk';

interface Look {
  sky: string;
  hemi: number;
  hemiColor: string;
  hemiGround: string;
  sun: number;
  sunColor: string;
  lamp: number;
  glow: number;
}

export const LOOKS: Record<TimeOfDay, Look> = {
  day: {
    sky: PALETTE.skyDay,
    hemi: 0.62,
    hemiColor: '#FFF4E2',
    hemiGround: '#C9B6A0',
    sun: 0.85,
    sunColor: '#FFE6C4',
    lamp: 0,
    glow: 0,
  },
  dusk: {
    sky: PALETTE.skyDusk,
    hemi: 0.42,
    hemiColor: '#B7B4E8',
    hemiGround: '#5A4E6E',
    sun: 0.35,
    sunColor: '#FFA77A',
    lamp: 1.2,
    glow: 1,
  },
};

const mix = (a: Color3, b: Color3, t: number): Color3 => Color3.Lerp(a, b, t);

/** Blends every light between the day and dusk looks. */
export class LightingController {
  private current: TimeOfDay = 'day';
  private blend = 0; // 0 = day, 1 = dusk

  constructor(
    private readonly ctx: SceneContext,
    private readonly lampLight: PointLight,
    private readonly lamp: Mesh,
    private readonly window: Mesh,
    private readonly onChange: (time: TimeOfDay) => void = () => undefined,
  ) {
    this.apply(0);
  }

  get timeOfDay(): TimeOfDay {
    return this.current;
  }

  get blendAmount(): number {
    return this.blend;
  }

  /** Applies a blend between day (0) and dusk (1). */
  apply(t: number): void {
    this.blend = t;
    const d = LOOKS.day;
    const n = LOOKS.dusk;
    const { scene, hemi, sun } = this.ctx;
    const sky = mix(color(d.sky), color(n.sky), t);
    scene.clearColor = new Color4(sky.r, sky.g, sky.b, 1);
    hemi.intensity = d.hemi + (n.hemi - d.hemi) * t;
    hemi.diffuse = mix(color(d.hemiColor), color(n.hemiColor), t);
    hemi.groundColor = mix(color(d.hemiGround), color(n.hemiGround), t);
    sun.intensity = d.sun + (n.sun - d.sun) * t;
    sun.diffuse = mix(color(d.sunColor), color(n.sunColor), t);
    this.lampLight.intensity = n.lamp * t;
    (this.lamp.material as StandardMaterial).emissiveColor = mix(
      color('#4A3F20'),
      color('#F6C45A'),
      t,
    );
    (this.window.material as StandardMaterial).emissiveColor = mix(
      color('#000000'),
      color('#E8B34A'),
      t,
    );
  }

  /** Smoothly transitions to a time of day. Resolves when done. */
  async transitionTo(time: TimeOfDay, seconds = 1.2): Promise<void> {
    const from = this.blend;
    const to = time === 'dusk' ? 1 : 0;
    this.current = time;
    this.onChange(time);
    await this.ctx.tweener.tween({
      duration: seconds,
      ease: easings.inOutSine,
      onUpdate: (k) => this.apply(from + (to - from) * k),
    }).promise;
  }

  set(time: TimeOfDay): void {
    this.current = time;
    this.apply(time === 'dusk' ? 1 : 0);
    this.onChange(time);
  }
}

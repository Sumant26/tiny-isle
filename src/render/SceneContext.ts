import {
  type AbstractEngine,
  Color3,
  Color4,
  DirectionalLight,
  GlowLayer,
  HemisphericLight,
  ImageProcessingConfiguration,
  type Mesh,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  type TransformNode,
  Vector3,
} from './babylon';
import { ModelLibrary } from './models/ModelLibrary';
import { PALETTE } from './palette';
import { Tweener } from './tween';

export const GROUND_Y = 0.25;

export interface ShapeOptions {
  parent?: TransformNode | null;
  castShadow?: boolean;
  receiveShadow?: boolean;
  pickable?: boolean;
}

export interface SceneContext {
  readonly engine: AbstractEngine;
  readonly scene: Scene;
  readonly tweener: Tweener;
  readonly hemi: HemisphericLight;
  readonly sun: DirectionalLight;
  readonly shadows: ShadowGenerator | null;
  readonly glow: GlowLayer | null;
  /** Seconds since the last frame, clamped. Returns 0 when time is frozen (visual tests). */
  frameDelta: () => number;
  readonly models: ModelLibrary;
  /** A loaded glTF model for `key` if the manifest has one, else the procedural `fallback`. */
  model: (key: string, fallback: () => TransformNode) => TransformNode;
  /** Shared matte material per colour. Reused across meshes to keep draw state small. */
  material: (hex: string, emissive?: string) => StandardMaterial;
  /** Applies material, parent and shadow settings to a freshly built mesh. */
  shape: <T extends Mesh>(mesh: T, hex: string | StandardMaterial, options?: ShapeOptions) => T;
  dispose: () => void;
}

export interface SceneContextOptions {
  shadows?: boolean;
  glow?: boolean;
  /** Freeze all per-frame animation so screenshots are pixel-stable. */
  frozenTime?: boolean;
  /** Preloaded glTF models; defaults to none (all procedural). */
  models?: ModelLibrary;
}

export const color = (hex: string): Color3 => Color3.FromHexString(hex);

export const createSceneContext = (
  engine: AbstractEngine,
  {
    shadows = true,
    glow = true,
    frozenTime = false,
    models = new ModelLibrary(),
  }: SceneContextOptions = {},
): SceneContext => {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString(`${PALETTE.skyDay}FF`);
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.toneMappingType =
    ImageProcessingConfiguration.TONEMAPPING_STANDARD;
  scene.imageProcessingConfiguration.exposure = 1.1;
  scene.imageProcessingConfiguration.vignetteEnabled = true;
  scene.imageProcessingConfiguration.vignetteWeight = 1.2;

  const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.62;
  hemi.diffuse = color('#FFF4E2');
  hemi.groundColor = color('#C9B6A0');

  const sun = new DirectionalLight('sun', new Vector3(-0.6, -1, 0.45), scene);
  sun.position = new Vector3(14, 22, -10);
  sun.intensity = 0.85;
  sun.diffuse = color('#FFE6C4');

  let shadowGen: ShadowGenerator | null = null;
  if (shadows) {
    shadowGen = new ShadowGenerator(1024, sun);
    shadowGen.useBlurExponentialShadowMap = true;
    shadowGen.blurKernel = 24;
    shadowGen.darkness = 0.45;
  }

  let glowLayer: GlowLayer | null = null;
  if (glow) {
    glowLayer = new GlowLayer('glow', scene, { mainTextureSamples: 2 });
    glowLayer.intensity = 0.6;
  }

  // Clamp so a background tab doesn't fast-forward animations on return.
  const frameDelta = frozenTime ? () => 0 : () => Math.min(engine.getDeltaTime() / 1000, 0.1);
  const tweener = new Tweener();
  scene.onBeforeRenderObservable.add(() => {
    tweener.update(frameDelta());
  });

  const materials = new Map<string, StandardMaterial>();
  const material = (hex: string, emissive?: string): StandardMaterial => {
    const key = emissive ? `${hex}|${emissive}` : hex;
    let m = materials.get(key);
    if (!m) {
      m = new StandardMaterial(`m${key}`, scene);
      m.diffuseColor = color(hex);
      m.specularColor = new Color3(0.04, 0.04, 0.04);
      if (emissive) m.emissiveColor = color(emissive);
      materials.set(key, m);
    }
    return m;
  };

  const shape = <T extends Mesh>(
    mesh: T,
    hex: string | StandardMaterial,
    { parent = null, castShadow = true, receiveShadow = true, pickable = true }: ShapeOptions = {},
  ): T => {
    mesh.material = typeof hex === 'string' ? material(hex) : hex;
    if (parent) mesh.parent = parent;
    mesh.receiveShadows = receiveShadow;
    mesh.isPickable = pickable;
    if (castShadow) shadowGen?.addShadowCaster(mesh);
    return mesh;
  };

  const model = (key: string, fallback: () => TransformNode): TransformNode =>
    models.create(key, fallback, (mesh) => {
      mesh.receiveShadows = true;
      shadowGen?.addShadowCaster(mesh);
    });

  return {
    engine,
    scene,
    tweener,
    hemi,
    sun,
    shadows: shadowGen,
    glow: glowLayer,
    frameDelta,
    models,
    model,
    material,
    shape,
    dispose: () => {
      tweener.cancelAll();
      scene.dispose();
    },
  };
};

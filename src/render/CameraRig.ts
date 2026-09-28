import { ArcRotateCamera, type Scene, Vector3 } from './babylon';

/** Default view: from the front of the island (the gate side), slightly to the right. */
export const DEFAULT_ALPHA = Math.PI / 2 - 0.3;

export interface IslandCamera extends ArcRotateCamera {
  focusFarmer?: (position: { x: number; y?: number; z: number }) => void;
  resetView?: () => void;
}

export const createCamera = (scene: Scene, canvas: HTMLCanvasElement | null): IslandCamera => {
  const cam = new ArcRotateCamera(
    'camera',
    DEFAULT_ALPHA,
    0.95,
    18,
    new Vector3(0, 0.4, 0),
    scene,
  ) as IslandCamera;
  cam.lowerRadiusLimit = 10;
  cam.upperRadiusLimit = 36;
  cam.lowerBetaLimit = 0.4;
  cam.upperBetaLimit = 1.35;
  cam.wheelDeltaPercentage = 0.01;
  cam.pinchDeltaPercentage = 0.005;
  cam.panningSensibility = 0; // no panning: the island is the whole world
  cam.fov = 0.7;

  let lastInteraction = Date.now();

  if (canvas) {
    cam.attachControl(canvas, true);
    const onUserAction = () => {
      lastInteraction = Date.now();
    };
    canvas.addEventListener('pointerdown', onUserAction);
    canvas.addEventListener('pointermove', onUserAction);
    canvas.addEventListener('wheel', onUserAction);
  }

  // Gentle slow idle orbit
  scene.onBeforeRenderObservable.add(() => {
    const idleTime = Date.now() - lastInteraction;
    if (idleTime > 6000) {
      cam.alpha += 0.0004;
    }
  });

  cam.focusFarmer = (pos) => {
    lastInteraction = Date.now();
    cam.setTarget(new Vector3(pos.x, (pos.y ?? 0) + 0.5, pos.z));
    cam.radius = 14;
  };

  cam.resetView = () => {
    lastInteraction = Date.now();
    cam.setTarget(new Vector3(0, 0.4, 0));
    cam.radius = 18;
    cam.alpha = DEFAULT_ALPHA;
    cam.beta = 0.95;
  };

  return cam;
};

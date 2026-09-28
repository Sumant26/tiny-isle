import { ArcRotateCamera, type Scene, Vector3 } from './babylon';

/** Default view: from the front of the island (the gate side), slightly to the right. */
export const DEFAULT_ALPHA = Math.PI / 2 - 0.3;

export const createCamera = (scene: Scene, canvas: HTMLCanvasElement | null): ArcRotateCamera => {
  const cam = new ArcRotateCamera('camera', DEFAULT_ALPHA, 0.95, 18, new Vector3(0, 0.4, 0), scene);
  cam.lowerRadiusLimit = 12;
  cam.upperRadiusLimit = 32;
  cam.lowerBetaLimit = 0.45;
  cam.upperBetaLimit = 1.25;
  cam.wheelDeltaPercentage = 0.01;
  cam.pinchDeltaPercentage = 0.005;
  cam.panningSensibility = 0; // no panning: the island is the whole world
  cam.fov = 0.7;
  if (canvas) cam.attachControl(canvas, true);
  return cam;
};

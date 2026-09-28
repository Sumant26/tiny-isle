import './ui/styles.css';
import { installDebugHook } from './app/debugHook';
import { createGame } from './app/Game';
import { createBrowserStorage } from './persistence/storage';
import { Engine } from './render/babylon';
import { createFallback } from './ui/Overlays';

const canvas = document.querySelector<HTMLCanvasElement>('#scene');
const uiRoot = document.querySelector<HTMLElement>('#ui');

const fail = (message: string): void => {
  document.body.append(createFallback(message));
};

if (!canvas || !uiRoot) {
  fail('The page is missing its game container.');
} else if (!Engine.isSupported()) {
  fail(
    'Your browser does not support WebGL, which Tiny Isle needs to draw the island. Try a recent Chrome, Firefox, Edge or Safari.',
  );
} else {
  try {
    const engine = new Engine(
      canvas,
      true,
      { preserveDrawingBuffer: false, stencil: true, antialias: true },
      true,
    );
    // Shadows and glow are the heaviest effects; skip them on small screens and in e2e runs (software GPU).
    const lowPower =
      window.matchMedia('(max-width: 600px)').matches || import.meta.env.MODE === 'e2e';
    const game = createGame({
      engine,
      canvas,
      uiRoot,
      storage: createBrowserStorage(),
      quality: lowPower ? 'low' : 'high',
    });
    engine.runRenderLoop(() => game.ctx.scene.render());
    new ResizeObserver(() => engine.resize()).observe(canvas);
    document.body.dataset.ready = 'true';
    if (import.meta.env.MODE !== 'production') installDebugHook(game);
  } catch (error) {
    console.error(error);
    fail('Something went wrong while planting the island. Please reload the page.');
  }
}

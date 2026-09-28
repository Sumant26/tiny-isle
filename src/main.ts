import './ui/styles.css';
import { resolveBootOptions } from './app/bootOptions';
import { installDebugHook } from './app/debugHook';
import { createErrorReporter } from './app/errorReporting';
import { createGame } from './app/Game';
import { OFFLINE_READY_SEEN_KEY, setupPwa } from './app/pwa';
import { createBrowserStorage, createMemoryStorage } from './persistence/storage';
import { Engine } from './render/babylon';
import { createGltfLoader } from './render/models/gltfLoader';
import { fetchManifest } from './render/models/manifest';
import { ModelLibrary } from './render/models/ModelLibrary';
import { createSceneContext } from './render/SceneContext';
import { createFallback } from './ui/Overlays';

const canvas = document.querySelector<HTMLCanvasElement>('#scene');
const uiRoot = document.querySelector<HTMLElement>('#ui');

const fail = (message: string): void => {
  document.body.append(createFallback(message));
};

const boot = resolveBootOptions({
  mode: import.meta.env.MODE,
  search: window.location.search,
  smallScreen: window.matchMedia('(max-width: 600px)').matches,
});
// Visual tests always start from the same fresh island.
const storage = boot.visual
  ? createMemoryStorage({ 'tiny-isle/help-seen': '1' })
  : createBrowserStorage();
const errorReporter = createErrorReporter({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  storage,
  release: import.meta.env.VITE_APP_VERSION ?? 'dev',
  environment: import.meta.env.MODE,
});

if (!canvas || !uiRoot) {
  fail('The page is missing its game container.');
} else if (!Engine.isSupported()) {
  fail(
    'Your browser does not support WebGL, which Tiny Isle needs to draw the island. Try a recent Chrome, Firefox, Edge or Safari.',
  );
} else {
  void (async () => {
    try {
      const engine = new Engine(
        canvas,
        true,
        { preserveDrawingBuffer: boot.visual, stencil: true, antialias: true },
        true,
      );
      // Optional glTF models (public/models/manifest.json). With none listed, nothing extra loads.
      const manifest = boot.visual ? {} : await fetchManifest('./models/manifest.json');
      const models = new ModelLibrary(Object.keys(manifest).length ? createGltfLoader() : null);
      const ctx = createSceneContext(engine, {
        shadows: boot.quality === 'high',
        glow: boot.quality === 'high',
        frozenTime: boot.frozenTime,
        models,
      });
      await models.preload(ctx.scene, manifest);

      const game = createGame({
        ctx,
        engine,
        canvas,
        uiRoot,
        storage,
        errorReporter,
        ...(boot.seed !== undefined ? { seed: boot.seed } : {}),
        ...(boot.random ? { random: boot.random } : {}),
      });
      engine.runRenderLoop(() => game.ctx.scene.render());
      new ResizeObserver(() => engine.resize()).observe(canvas);
      if (boot.debug) installDebugHook(game);
      document.body.dataset.ready = 'true';

      // Installable app + offline play (production builds only; never in visual tests).
      if (import.meta.env.PROD && !boot.visual && 'serviceWorker' in navigator) {
        void import('virtual:pwa-register').then(({ registerSW }) => {
          setupPwa(registerSW, {
            onUpdateReady: (apply) => {
              game.ui.prompt.show('A new version of Tiny Isle is ready.', 'Update', () => {
                game.saves.flush();
                void apply();
              });
            },
            onOfflineReady: () => {
              if (storage.getItem(OFFLINE_READY_SEEN_KEY) === '1') return;
              storage.setItem(OFFLINE_READY_SEEN_KEY, '1');
              game.ui.toasts.show('Tiny Isle is ready to play offline.', 'good');
            },
            onError: (error) => errorReporter.capture(error),
          });
        });
      }
    } catch (error) {
      console.error(error);
      errorReporter.capture(error);
      fail('Something went wrong while planting the island. Please reload the page.');
    }
  })();
}

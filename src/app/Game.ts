import { soundForEvent } from '../audio/sounds';
import { createSoundEngine, type SoundEngine } from '../audio/SoundEngine';
import { createInitialState } from '../core/initialState';
import { bindKeyboard, cameraRelativeStep, type Command } from '../input/keyboard';
import { createSaveManager, type SaveManager } from '../persistence/saveManager';
import { exportSave, importSave } from '../persistence/saveFile';
import { createMemoryStorage, type StorageAdapter } from '../persistence/storage';
import type { AbstractEngine, ArcRotateCamera } from '../render/babylon';
import { DEFAULT_ALPHA } from '../render/CameraRig';
import { createGameRenderer, type GameRenderer } from '../render/GameRenderer';
import { createSceneContext, type SceneContext } from '../render/SceneContext';
import { actions } from '../state/actions';
import { reducer } from '../state/reducer';
import { selectSettings } from '../state/selectors';
import { createStore, type Store } from '../state/store';
import { mountUI, type GameUI } from '../ui/mountUI';
import type { ErrorReporter } from './errorReporting';
import { InteractionController } from './InteractionController';

export const HELP_SEEN_KEY = 'tiny-isle/help-seen';

export interface GameOptions {
  engine: AbstractEngine;
  canvas: HTMLCanvasElement | null;
  uiRoot: HTMLElement;
  storage?: StorageAdapter;
  sound?: SoundEngine;
  /** Graphics extras (shadows, glow). Off for headless tests. */
  quality?: 'high' | 'low';
  /** Stops per-frame animation (for screenshot tests). */
  frozenTime?: boolean;
  seed?: number;
  random?: () => number;
  keyboardTarget?: Window | HTMLElement;
  /** Opt-in crash reporting; the settings toggle appears only when it's available. */
  errorReporter?: ErrorReporter;
  /** A pre-built scene (e.g. with glTF models already loaded). Overrides quality/frozenTime. */
  ctx?: SceneContext;
}

export interface Game {
  readonly store: Store;
  readonly ctx: SceneContext;
  readonly renderer: GameRenderer;
  readonly controller: InteractionController;
  readonly ui: GameUI;
  readonly saves: SaveManager;
  readonly sound: SoundEngine;
  /** Plays the dusk → night → morning transition around the sleep action. */
  sleep(): Promise<void>;
  handleCommand(command: Command): void;
  newGame(seed?: number): void;
  dispose(): void;
}

/**
 * Composition root: builds the store, renderer, UI, input, audio and saving, and
 * wires them together. Each piece only knows about the store and its own job.
 */
export const createGame = ({
  engine,
  canvas,
  uiRoot,
  storage = createMemoryStorage(),
  sound = createSoundEngine(),
  quality = 'high',
  frozenTime = false,
  seed,
  random = Math.random,
  keyboardTarget = window,
  errorReporter,
  ctx: providedCtx,
}: GameOptions): Game => {
  const saves = createSaveManager({ storage });
  const loaded = saves.load();
  if (loaded && !loaded.ok) console.warn(`[tiny-isle] ignoring unreadable save: ${loaded.error}`);
  const initialState = loaded?.ok ? loaded.value : createInitialState(seed);

  const store = createStore({ reducer, initialState });
  const ctx =
    providedCtx ??
    createSceneContext(engine, {
      shadows: quality === 'high',
      glow: quality === 'high',
      frozenTime,
    });
  const renderer = createGameRenderer(ctx, store, { canvas, random });

  let sleeping = false;
  const sleep = async (): Promise<void> => {
    if (sleeping) return;
    sleeping = true;
    try {
      controller.cancel();
      ui.closeTop();
      sound.play('sleep');
      await renderer.setTimeOfDay('dusk');
      await ui.dayOverlay.cover(`Day ${store.getState().day + 1}`);
      store.dispatch(actions.sleep());
      renderer.lighting.set('day');
      await ui.dayOverlay.reveal();
    } finally {
      sleeping = false;
    }
  };

  const newGame = (s?: number): void => {
    controller.cancel();
    saves.clear();
    store.dispatch(actions.load(createInitialState(s)));
    renderer.lighting.set('day');
  };

  const ui = mountUI(uiRoot, store, {
    onSleep: () => void sleep(),
    onShop: () => void controller.goToMarket(),
    onExport: () => exportSave(store.getState()),
    onImport: (file) => {
      void importSave(file).then((r) => {
        if (r.ok) {
          store.dispatch(actions.load(r.value));
          ui.toasts.show('Island loaded. Welcome back!', 'good');
        } else ui.toasts.show(`Could not load that file (${r.error}).`, 'gentle');
      });
    },
    onNewGame: () => newGame(),
    onHelpDismissed: () => storage.setItem(HELP_SEEN_KEY, '1'),
    ...(errorReporter?.available
      ? {
          crashReports: {
            isEnabled: () => errorReporter.enabled,
            onChange: (on: boolean) => {
              void errorReporter.setEnabled(on).then(() => {
                ui.toasts.show(
                  on ? 'Thanks! Crash reports are on.' : 'Crash reports are off.',
                  'info',
                );
              });
            },
          },
        }
      : {}),
  });

  const controller = new InteractionController({
    store,
    mover: renderer.player,
    onOpenShop: () => ui.shop.open(),
    onVisitor: () => ui.visitor.highlight(),
  });
  renderer.onCellPicked((cell) => void controller.clickCell(cell));

  const camera = ctx.scene.activeCamera as ArcRotateCamera | null;
  const handleCommand = (c: Command): void => {
    switch (c.type) {
      case 'tool':
        store.dispatch(actions.selectTool(c.tool));
        break;
      case 'cycle-seed':
        store.dispatch(actions.cycleSeed(c.direction));
        break;
      case 'move': {
        const { dx, dz } = cameraRelativeStep(c.forward, c.right, camera?.alpha ?? DEFAULT_ALPHA);
        void controller.step(dx, dz);
        break;
      }
      case 'use':
        void controller.useHere();
        break;
      case 'sleep':
        void sleep();
        break;
      case 'shop':
        if (ui.shop.isOpen) ui.shop.close();
        else void controller.goToMarket();
        break;
      case 'mute':
        store.dispatch(actions.updateSettings({ muted: !store.getState().settings.muted }));
        break;
      case 'close':
        ui.closeTop();
        break;
    }
  };

  // Audio follows settings and events; it unlocks on the first user gesture.
  const offSettings = store.select(
    selectSettings,
    (s) => {
      sound.setMuted(s.muted);
      sound.setVolume(s.volume);
    },
    { fireImmediately: true },
  );
  const offSound = store.onEvent((e) => {
    const name = soundForEvent(e);
    if (name) sound.play(name);
  });
  const unlockAudio = (): void => sound.unlock();
  uiRoot.ownerDocument.addEventListener('pointerdown', unlockAudio);
  uiRoot.ownerDocument.addEventListener('keydown', unlockAudio);

  const offKeys = bindKeyboard(keyboardTarget, handleCommand);
  const offSave = saves.attach(store);
  const flush = (): void => saves.flush();
  const onVisibility = (): void => {
    if (uiRoot.ownerDocument.visibilityState === 'hidden') flush();
  };
  uiRoot.ownerDocument.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', flush);

  if (storage.getItem(HELP_SEEN_KEY) !== '1') ui.help.show();

  return {
    store,
    ctx,
    renderer,
    controller,
    ui,
    saves,
    sound,
    sleep,
    handleCommand,
    newGame,
    dispose: () => {
      flush();
      offKeys();
      offSave();
      offSettings();
      offSound();
      uiRoot.ownerDocument.removeEventListener('pointerdown', unlockAudio);
      uiRoot.ownerDocument.removeEventListener('keydown', unlockAudio);
      uiRoot.ownerDocument.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      controller.cancel();
      ui.dispose();
      renderer.dispose();
      ctx.dispose();
      sound.dispose();
    },
  };
};

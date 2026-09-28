// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSoundEngine } from '../audio/SoundEngine';
import { tileIndexToCell } from '../core/world';
import { SAVE_KEY, serialize } from '../persistence/saveManager';
import { createMemoryStorage } from '../persistence/storage';
import { NullEngine } from '../render/babylon';
import { actions } from '../state/actions';
import { advance, seededRandom } from '../test/babylon';
import { createFakeAudioContext } from '../test/fakeAudio';
import { makeState } from '../test/fixtures';
import { createGame, type Game, HELP_SEEN_KEY } from './Game';
import { installDebugHook } from './debugHook';
import { createErrorReporter, CRASH_REPORTS_KEY } from './errorReporting';
import { createSceneContext } from '../render/SceneContext';

let game: Game | null = null;

const setup = (storage = createMemoryStorage()) => {
  const uiRoot = document.createElement('div');
  document.body.append(uiRoot);
  const keys = document.createElement('div');
  const fake = createFakeAudioContext();
  const sound = createSoundEngine({ createContext: () => fake as unknown as AudioContext });
  game = createGame({
    engine: new NullEngine(),
    canvas: null,
    uiRoot,
    storage,
    sound,
    quality: 'low',
    seed: 42,
    random: seededRandom(),
    keyboardTarget: keys,
  });
  return { game, uiRoot, storage, keys, fake };
};

/** Runs the game's clock until a promise settles. */
const settle = async <T>(g: Game, p: Promise<T>, seconds = 10): Promise<T> => {
  const status = { done: false };
  void p.then(() => {
    status.done = true;
  });
  for (let t = 0; t < seconds && !status.done; t += 0.1) await advance(g.ctx, 0.1, 0.1);
  return p;
};

afterEach(() => {
  game?.dispose();
  game = null;
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('createGame', () => {
  it('starts a new game and shows the help panel the first time', () => {
    const { game, storage } = setup();
    expect(game.store.getState().day).toBe(1);
    expect(game.store.getState().rngSeed).toBe(42);
    expect(game.ui.help.isOpen).toBe(true);
    game.ui.help.hide();
    document.querySelector<HTMLElement>('[data-testid="help-close"]')!.click();
    expect(storage.getItem(HELP_SEEN_KEY)).toBe('1');
  });

  it('resumes from a saved game and skips help', () => {
    const storage = createMemoryStorage({
      [SAVE_KEY]: serialize(makeState({ day: 9, coins: 77 })),
      [HELP_SEEN_KEY]: '1',
    });
    const { game } = setup(storage);
    expect(game.store.getState().day).toBe(9);
    expect(game.ui.help.isOpen).toBe(false);
  });

  it('ignores a corrupt save and starts fresh', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { game } = setup(createMemoryStorage({ [SAVE_KEY]: '{broken' }));
    expect(game.store.getState().day).toBe(1);
    expect(warn).toHaveBeenCalled();
  });

  it('plays a full day: till, plant, water, sleep, grow', async () => {
    const { game } = setup();
    const cell = tileIndexToCell(0);
    for (const tool of ['hoe', 'seeds', 'water'] as const) {
      game.store.dispatch(actions.selectTool(tool));
      await settle(game, game.controller.clickCell(cell));
    }
    expect(game.store.getState().plot.tiles[0]).toMatchObject({
      tilled: true,
      watered: true,
      crop: { id: 'carrot', growth: 0 },
    });
    await settle(game, game.sleep());
    expect(game.store.getState().day).toBe(2);
    expect(game.store.getState().plot.tiles[0]?.crop?.growth).toBe(1);
    expect(game.renderer.lighting.timeOfDay).toBe('day');
  });

  it('ignores a second sleep while one is in progress', async () => {
    const { game } = setup();
    const a = game.sleep();
    const b = game.sleep();
    await settle(game, Promise.all([a, b]));
    expect(game.store.getState().day).toBe(2);
  });

  it('handles every keyboard command', async () => {
    const { game, keys } = setup();
    const press = (key: string) => keys.dispatchEvent(new KeyboardEvent('keydown', { key }));
    press('3');
    expect(game.store.getState().selectedTool).toBe('water');
    press('e');
    expect(game.store.getState().selectedTool).toBe('seeds');
    press('m');
    expect(game.store.getState().settings.muted).toBe(true);
    press('Escape');
    expect(game.ui.help.isOpen).toBe(false);
    press('s'); // step towards the camera
    await settle(game, Promise.resolve());
    press(' ');
    press('b');
    await advance(game.ctx, 5, 0.1);
    expect(game.ui.shop.isOpen).toBe(true);
    press('b');
    expect(game.ui.shop.isOpen).toBe(false);
    press('z');
    await advance(game.ctx, 5, 0.1);
    await vi.waitFor(() => expect(game.store.getState().day).toBe(2), { timeout: 3000 });
  });

  it('exports, imports and starts a new game from settings', async () => {
    const { game } = setup();
    Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:x'), revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    document.querySelector<HTMLElement>('[data-testid="export"]')!.click();

    const input = document.querySelector<HTMLInputElement>('[data-testid="import-input"]')!;
    const good = new File([serialize(makeState({ day: 5 }))], 'save.json');
    Object.defineProperty(input, 'files', { value: [good], configurable: true });
    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(game.store.getState().day).toBe(5));

    Object.defineProperty(input, 'files', {
      value: [new File(['nope'], 'bad.json')],
      configurable: true,
    });
    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(document.body.textContent).toContain('Could not load'));

    const newGame = document.querySelector<HTMLElement>('[data-testid="new-game"]')!;
    newGame.click();
    newGame.click();
    expect(game.store.getState().day).toBe(1);
  });

  it('opens the shop via the hotbar and plays sounds for events', async () => {
    const { game, fake } = setup();
    document.dispatchEvent(new Event('pointerdown'));
    expect(game.sound.ready).toBe(true);
    game.store.dispatch(actions.useTile(0));
    expect(fake.sources).toBeGreaterThan(0);
    document.querySelector<HTMLElement>('[data-testid="shop-button"]')!.click();
    await advance(game.ctx, 5, 0.1);
    await vi.waitFor(() => expect(game.ui.shop.isOpen).toBe(true));
    document.querySelector<HTMLElement>('[data-testid="sleep-button"]')!.click();
    await advance(game.ctx, 5, 0.1);
    await vi.waitFor(() => expect(game.store.getState().day).toBe(2));
  });

  it('highlights the visitor card when walking up to a visitor', async () => {
    const storage = createMemoryStorage({
      [SAVE_KEY]: serialize(makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } })),
    });
    const { game } = setup(storage);
    await settle(game, game.controller.clickCell({ x: 5, z: 10 }));
    expect(
      document.querySelector('[data-testid="visitor-card"]')?.classList.contains('pulse'),
    ).toBe(true);
  });

  it('flushes saves when the page is hidden', () => {
    const { game, storage } = setup();
    game.store.dispatch(actions.selectTool('water'));
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(storage.getItem(SAVE_KEY)).toContain('"selectedTool":"water"');
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });

  it('uses sensible defaults', () => {
    const uiRoot = document.createElement('div');
    document.body.append(uiRoot);
    game = createGame({ engine: new NullEngine(), canvas: null, uiRoot, quality: 'low' });
    expect(game.store.getState().day).toBe(1);
  });
});

describe('createGame options', () => {
  it('uses a pre-built scene context when given one', () => {
    const uiRoot = document.createElement('div');
    document.body.append(uiRoot);
    const ctx = createSceneContext(new NullEngine(), {
      shadows: false,
      glow: false,
      frozenTime: true,
    });
    game = createGame({ engine: ctx.engine, ctx, canvas: null, uiRoot });
    expect(game.ctx).toBe(ctx);
  });

  it('wires the crash-report toggle to the error reporter', async () => {
    const uiRoot = document.createElement('div');
    document.body.append(uiRoot);
    const storage = createMemoryStorage();
    const sdk = {
      init: vi.fn(),
      captureException: vi.fn(() => ''),
      close: vi.fn(() => Promise.resolve(true)),
    };
    const errorReporter = createErrorReporter({
      dsn: 'dsn',
      storage,
      load: () => Promise.resolve(sdk),
    });
    game = createGame({
      engine: new NullEngine(),
      canvas: null,
      uiRoot,
      storage,
      quality: 'low',
      errorReporter,
    });
    const toggle = document.querySelector<HTMLInputElement>('[data-testid="crash-reports"]')!;
    expect(toggle.checked).toBe(false);
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(sdk.init).toHaveBeenCalled());
    expect(storage.getItem(CRASH_REPORTS_KEY)).toBe('1');
    await vi.waitFor(() => expect(document.body.textContent).toContain('Crash reports are on'));
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(document.body.textContent).toContain('Crash reports are off'));
  });

  it('hides the toggle when the build has no DSN', () => {
    const uiRoot = document.createElement('div');
    document.body.append(uiRoot);
    const storage = createMemoryStorage();
    game = createGame({
      engine: new NullEngine(),
      canvas: null,
      uiRoot,
      storage,
      quality: 'low',
      errorReporter: createErrorReporter({ dsn: undefined, storage }),
    });
    expect(document.querySelector('[data-testid="crash-reports"]')).toBeNull();
  });
});

describe('installDebugHook', () => {
  it('exposes the game and click helpers', async () => {
    const { game } = setup();
    const target: Record<string, unknown> = {};
    const hook = installDebugHook(game, target);
    expect(target.__tinyIsle).toBe(hook);
    expect(await settle(game, hook.clickTile(0))).toBe('used');
    expect(await settle(game, hook.clickCell({ x: 5, z: 10 }))).toBe('walked');
    game.ctx.scene.render(); // computes the camera matrices
    const p = hook.projectCell({ x: 7, z: 7 });
    expect(p).not.toBeNull();
    expect(Number.isFinite(p!.x)).toBe(true);
    // settle() finishes pending tweens and draws a frame.
    let t = 0;
    game.ctx.tweener.tween({ duration: 1, onUpdate: (k) => (t = k) });
    hook.settle();
    expect(t).toBe(1);
    hook.settle(0.5);
    game.ctx.scene.activeCamera = null;
    expect(hook.projectCell({ x: 7, z: 7 })).toBeNull();
  });

  it('installs on window by default', () => {
    const { game } = setup();
    installDebugHook(game);
    expect((window as unknown as Record<string, unknown>).__tinyIsle).toBeDefined();
  });
});

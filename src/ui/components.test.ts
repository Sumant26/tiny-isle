// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { actions } from '../state/actions';
import { reducer } from '../state/reducer';
import { createStore } from '../state/store';
import { makeState, unlockAll, withProduce } from '../test/fixtures';
import { createHotbar } from './Hotbar';
import { createHud } from './Hud';
import { createDayOverlay, createFallback, createHelpPanel } from './Overlays';
import { createSettingsPanel } from './SettingsPanel';
import { createShopPanel } from './ShopPanel';
import { createToasts } from './Toasts';
import { createVisitorCard } from './VisitorCard';

const storeWith = (s = makeState()) => createStore({ reducer, initialState: s });
const q = (root: HTMLElement, id: string) =>
  root.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Hud', () => {
  it('shows coins, day, weather and bloom, and updates live', () => {
    const store = storeWith();
    const onSettings = vi.fn();
    const onHelp = vi.fn();
    const hud = createHud(store, { onSettings, onHelp });
    expect(q(hud.el, 'coins').textContent).toBe('20');
    expect(q(hud.el, 'day').textContent).toBe('1');
    expect(q(hud.el, 'bloom-name').textContent).toBe('Quiet');
    store.dispatch(actions.load(makeState({ coins: 7, day: 4, bloom: 12, weather: 'rain' })));
    expect(q(hud.el, 'coins').textContent).toBe('7');
    expect(q(hud.el, 'day').textContent).toBe('4');
    expect(q(hud.el, 'bloom-name').textContent).toBe('Sprouting');
    expect(hud.el.textContent).toContain('🌧');
    q(hud.el, 'settings-button').click();
    expect(onSettings).toHaveBeenCalled();
    hud.el.querySelector<HTMLButtonElement>('[aria-label="How to play"]')!.click();
    expect(onHelp).toHaveBeenCalled();
    hud.dispose();
  });
});

describe('Hotbar', () => {
  it('selects tools, cycles seeds, and calls sleep/shop', () => {
    const store = storeWith(unlockAll(makeState()));
    const onSleep = vi.fn();
    const onShop = vi.fn();
    const bar = createHotbar(store, { onSleep, onShop });
    expect(q(bar.el, 'tool-hoe').getAttribute('aria-pressed')).toBe('true');
    q(bar.el, 'tool-water').click();
    expect(store.getState().selectedTool).toBe('water');
    expect(q(bar.el, 'tool-water').classList.contains('on')).toBe(true);
    expect(q(bar.el, 'seed-count').textContent).toBe('6');
    q(bar.el, 'cycle-seed').click();
    expect(store.getState().selectedSeed).toBe('tomato');
    expect(q(bar.el, 'seed-count').textContent).toBe('0');
    q(bar.el, 'sleep-button').click();
    q(bar.el, 'shop-button').click();
    expect(onSleep).toHaveBeenCalled();
    expect(onShop).toHaveBeenCalled();
    bar.dispose();
  });
});

describe('Toasts', () => {
  it('shows messages for events, collapses repeats, caps and expires', () => {
    const store = storeWith();
    const scheduled: (() => void)[] = [];
    const toasts = createToasts(store, { max: 2, schedule: (fn) => scheduled.push(fn) });
    store.dispatch(actions.useTile(0));
    expect(toasts.el.childElementCount).toBe(0); // tilling needs no toast
    store.dispatch(actions.useTile(0)); // rejected: already tilled
    store.dispatch(actions.useTile(0)); // same message: collapsed
    expect(toasts.el.childElementCount).toBe(1);
    toasts.show('a');
    toasts.show('b');
    expect(toasts.el.childElementCount).toBe(2);
    scheduled.forEach((fn) => fn());
    expect(toasts.el.childElementCount).toBe(0);
    toasts.dispose();
  });

  it('uses real timers by default', () => {
    vi.useFakeTimers();
    const toasts = createToasts(storeWith());
    toasts.show('hello', 'good');
    expect(toasts.el.querySelector('.toast-good')).not.toBeNull();
    vi.advanceTimersByTime(3000);
    expect(toasts.el.childElementCount).toBe(0);
    vi.useRealTimers();
  });
});

describe('ShopPanel', () => {
  it('opens on a tab and buys seeds', () => {
    const store = storeWith(makeState({ coins: 10 }));
    const shop = createShopPanel(store);
    expect(shop.isOpen).toBe(false);
    shop.open('seeds');
    expect(shop.el.hidden).toBe(false);
    expect(shop.el.textContent).toContain('???'); // locked crops are hidden
    q(shop.el, 'buy-carrot-1').click();
    expect(store.getState().inventory.seeds.carrot).toBe(7);
    expect((q(shop.el, 'buy-carrot-5') as HTMLButtonElement).disabled).toBe(true); // 8 coins left
    shop.close();
    expect(shop.el.hidden).toBe(true);
  });

  it('buys decorations and shows owned ones', () => {
    const store = storeWith(makeState({ coins: 30 }));
    const shop = createShopPanel(store);
    shop.open();
    q(shop.el, 'shop-tab-decor').click();
    expect(shop.tab).toBe('decor');
    q(shop.el, 'buy-flowerbed').click();
    expect(store.getState().decorations).toContain('flowerbed');
    expect(q(shop.el, 'buy-flowerbed').textContent).toBe('Owned');
  });

  it('sells produce one at a time or all at once', () => {
    const store = storeWith(
      withProduce(withProduce(makeState({ coins: 0 }), 'carrot', 2), 'tomato', 1),
    );
    const shop = createShopPanel(store);
    shop.open('sell');
    q(shop.el, 'sell-carrot-1').click();
    expect(store.getState().coins).toBe(5);
    q(shop.el, 'sell-all').click();
    expect(store.getState().coins).toBe(16);
    expect(shop.el.textContent).toContain('Nothing to sell');
    shop.el.querySelector<HTMLButtonElement>('[aria-label="Close market"]')!.click();
    expect(shop.isOpen).toBe(false);
    shop.dispose();
  });
});

describe('VisitorCard', () => {
  it('shows the visitor request and fulfils it', () => {
    const store = storeWith(makeState({ visitor: { id: 'hazel', arrivedOnDay: 2 } }));
    const card = createVisitorCard(store);
    expect(card.el.hidden).toBe(false);
    expect(q(card.el, 'visitor-progress').textContent).toContain('0 / 3');
    expect((q(card.el, 'visitor-give') as HTMLButtonElement).disabled).toBe(true);
    store.dispatch(actions.load(withProduce(store.getState(), 'carrot', 5)));
    expect(q(card.el, 'visitor-progress').textContent).toContain('3 / 3');
    card.highlight();
    expect(card.el.classList.contains('pulse')).toBe(true);
    q(card.el, 'visitor-give').click();
    expect(card.el.hidden).toBe(true);
    card.dispose();
  });
});

describe('SettingsPanel', () => {
  it('controls sound, save files and new game (with a two-step confirm)', () => {
    const store = storeWith();
    const handlers = { onExport: vi.fn(), onImport: vi.fn(), onNewGame: vi.fn() };
    const panel = createSettingsPanel(store, handlers);
    document.body.append(panel.el);
    panel.toggle();
    expect(panel.isOpen).toBe(true);
    const mute = q(panel.el, 'mute') as HTMLInputElement;
    mute.checked = true;
    mute.dispatchEvent(new Event('change'));
    expect(store.getState().settings.muted).toBe(true);
    const volume = q(panel.el, 'volume') as HTMLInputElement;
    volume.value = '25';
    volume.dispatchEvent(new Event('input'));
    expect(store.getState().settings.volume).toBe(0.25);
    q(panel.el, 'export').click();
    expect(handlers.onExport).toHaveBeenCalled();
    const input = q(panel.el, 'import-input') as HTMLInputElement;
    const click = vi.spyOn(input, 'click').mockImplementation(() => undefined);
    q(panel.el, 'import').click();
    expect(click).toHaveBeenCalled();
    const file = new File(['{}'], 'save.json');
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    expect(handlers.onImport).toHaveBeenCalledWith(file);
    Object.defineProperty(input, 'files', { value: [], configurable: true });
    input.dispatchEvent(new Event('change'));
    expect(handlers.onImport).toHaveBeenCalledTimes(1);
    const newGame = q(panel.el, 'new-game');
    newGame.click();
    expect(handlers.onNewGame).not.toHaveBeenCalled();
    expect(newGame.textContent).toMatch(/again/);
    newGame.click();
    expect(handlers.onNewGame).toHaveBeenCalled();
    expect(panel.isOpen).toBe(false);
    panel.toggle();
    panel.el.querySelector<HTMLButtonElement>('[aria-label="Close settings"]')!.click();
    expect(panel.isOpen).toBe(false);
    panel.dispose();
  });
});

describe('Overlays', () => {
  it('help panel shows, hides and reports dismissal', () => {
    const onDismiss = vi.fn();
    const help = createHelpPanel(onDismiss);
    help.show();
    expect(help.isOpen).toBe(true);
    q(help.el, 'help-close').click();
    expect(help.isOpen).toBe(false);
    expect(onDismiss).toHaveBeenCalled();
    help.dispose();
    const plain = createHelpPanel();
    plain.show();
    q(plain.el, 'help-close').click();
    expect(plain.isOpen).toBe(false);
  });

  it('day overlay covers and reveals', async () => {
    const wait = vi.fn(() => Promise.resolve());
    const o = createDayOverlay(wait);
    await o.cover('Day 2');
    expect(o.el.classList.contains('show')).toBe(true);
    expect(q(o.el, 'day-overlay-label').textContent).toBe('Day 2');
    await o.reveal();
    expect(o.el.classList.contains('show')).toBe(false);
    expect(wait).toHaveBeenCalledTimes(2);
    o.dispose();
  });

  it('day overlay waits with real timers by default', async () => {
    vi.useFakeTimers();
    const o = createDayOverlay();
    const p = o.cover('Day 3');
    await vi.advanceTimersByTimeAsync(500);
    await p;
    vi.useRealTimers();
  });

  it('fallback explains the problem', () => {
    expect(createFallback('No WebGL').getAttribute('role')).toBe('alert');
  });
});

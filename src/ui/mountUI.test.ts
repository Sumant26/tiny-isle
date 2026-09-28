// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { reducer } from '../state/reducer';
import { createStore } from '../state/store';
import { makeState } from '../test/fixtures';
import { mountUI } from './mountUI';

describe('mountUI', () => {
  it('mounts every part and closes panels top-down', () => {
    const root = document.createElement('div');
    const store = createStore({ reducer, initialState: makeState() });
    const ui = mountUI(root, store, {
      onSleep: vi.fn(),
      onShop: vi.fn(),
      onExport: vi.fn(),
      onImport: vi.fn(),
      onNewGame: vi.fn(),
    });
    expect(root.querySelector('.hud')).not.toBeNull();
    expect(root.querySelector('.hotbar')).not.toBeNull();
    ui.shop.open();
    ui.settings.toggle();
    ui.help.show();
    expect(ui.closeTop()).toBe(true);
    expect(ui.help.isOpen).toBe(false);
    expect(ui.closeTop()).toBe(true);
    expect(ui.settings.isOpen).toBe(false);
    expect(ui.closeTop()).toBe(true);
    expect(ui.shop.isOpen).toBe(false);
    expect(ui.closeTop()).toBe(false);
    ui.dispose();
    expect(root.childElementCount).toBe(0);
  });
});

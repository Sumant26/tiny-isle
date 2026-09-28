import type { Store } from '../state/store';
import { createHotbar } from './Hotbar';
import { createHud } from './Hud';
import { createDayOverlay, createHelpPanel, type DayOverlay, type HelpPanel } from './Overlays';
import { createSettingsPanel, type SettingsHandlers, type SettingsPanel } from './SettingsPanel';
import { createShopPanel, type ShopPanel } from './ShopPanel';
import { createToasts, type Toasts } from './Toasts';
import { createVisitorCard, type VisitorCard } from './VisitorCard';

export interface UiHandlers extends SettingsHandlers {
  onSleep: () => void;
  onShop: () => void;
  onHelpDismissed?: () => void;
}

export interface GameUI {
  readonly shop: ShopPanel;
  readonly settings: SettingsPanel;
  readonly help: HelpPanel;
  readonly toasts: Toasts;
  readonly visitor: VisitorCard;
  readonly dayOverlay: DayOverlay;
  /** Closes the top-most open panel. Returns false if nothing was open. */
  closeTop(): boolean;
  dispose(): void;
}

export const mountUI = (root: HTMLElement, store: Store, handlers: UiHandlers): GameUI => {
  const shop = createShopPanel(store);
  const settings = createSettingsPanel(store, handlers);
  const help = createHelpPanel(handlers.onHelpDismissed);
  const toasts = createToasts(store);
  const visitor = createVisitorCard(store);
  const dayOverlay = createDayOverlay();
  const hud = createHud(store, {
    onSettings: () => settings.toggle(),
    onHelp: () => help.show(),
  });
  const hotbar = createHotbar(store, { onSleep: handlers.onSleep, onShop: handlers.onShop });

  const parts = [hud, hotbar, toasts, visitor, shop, settings, help, dayOverlay];
  root.append(...parts.map((p) => p.el));

  return {
    shop,
    settings,
    help,
    toasts,
    visitor,
    dayOverlay,
    closeTop: () => {
      if (help.isOpen) help.hide();
      else if (settings.isOpen) settings.close();
      else if (shop.isOpen) shop.close();
      else return false;
      return true;
    },
    dispose: () => {
      for (const p of parts) {
        p.dispose();
        p.el.remove();
      }
    },
  };
};

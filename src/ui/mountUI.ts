import type { Store } from '../state/store';
import { CookDialog } from './CookDialog';
import { FishDialog } from './FishDialog';
import { createHotbar } from './Hotbar';
import { createHud } from './Hud';
import { JournalDialog } from './JournalDialog';
import {
  type ActionPrompt,
  createActionPrompt,
  createDayOverlay,
  createHelpPanel,
  type DayOverlay,
  type HelpPanel,
} from './Overlays';
import { PhotoMode } from './PhotoMode';
import { createSettingsPanel, type SettingsHandlers, type SettingsPanel } from './SettingsPanel';
import { createShopPanel, type ShopPanel } from './ShopPanel';
import { createToasts, type Toasts } from './Toasts';
import { createVisitorCard, type VisitorCard } from './VisitorCard';

export interface UiHandlers extends SettingsHandlers {
  onSleep: () => void;
  onShop: () => void;
  onHelpDismissed?: () => void;
  canvas?: HTMLCanvasElement | null;
}

export interface GameUI {
  readonly shop: ShopPanel;
  readonly settings: SettingsPanel;
  readonly help: HelpPanel;
  readonly journal: JournalDialog;
  readonly cook: CookDialog;
  readonly fish: FishDialog;
  readonly photo: PhotoMode;
  readonly toasts: Toasts;
  readonly visitor: VisitorCard;
  readonly dayOverlay: DayOverlay;
  readonly prompt: ActionPrompt;
  /** Closes the top-most open panel. Returns false if nothing was open. */
  closeTop(): boolean;
  dispose(): void;
}

export const mountUI = (root: HTMLElement, store: Store, handlers: UiHandlers): GameUI => {
  const shop = createShopPanel(store);
  const settings = createSettingsPanel(store, handlers);
  const help = createHelpPanel(handlers.onHelpDismissed);
  const journal = new JournalDialog(store, () => journal.hide());
  const cook = new CookDialog(store, () => cook.hide(), handlers.onSleep);
  const fish = new FishDialog(store, () => fish.hide());
  const photo = new PhotoMode(root, handlers.canvas ?? null, () => undefined);

  const toasts = createToasts(store);
  const visitor = createVisitorCard(store);
  const dayOverlay = createDayOverlay();
  const prompt = createActionPrompt();
  const closeAll = (except?: unknown): void => {
    if (photo.isActive && photo !== except) photo.exit();
    if (help.isOpen && help !== except) help.hide();
    if (settings.isOpen && settings !== except) settings.close();
    if (shop.isOpen && shop !== except) shop.close();
    if (journal.isOpen && journal !== except) journal.hide();
    if (cook.isOpen && cook !== except) cook.hide();
    if (fish.isOpen && fish !== except) fish.hide();
  };

  const origShopOpen = shop.open.bind(shop);
  shop.open = (tab) => {
    closeAll(shop);
    origShopOpen(tab);
  };

  const origCookShow = cook.show.bind(cook);
  cook.show = () => {
    closeAll(cook);
    origCookShow();
  };

  const origFishShow = fish.show.bind(fish);
  fish.show = () => {
    closeAll(fish);
    origFishShow();
  };

  const origJournalShow = journal.show.bind(journal);
  journal.show = () => {
    closeAll(journal);
    origJournalShow();
  };

  const hud = createHud(store, {
    onSettings: () => {
      if (settings.isOpen) {
        settings.close();
      } else {
        closeAll(settings);
        settings.toggle();
      }
    },
    onHelp: () => {
      closeAll(help);
      help.show();
    },
    onJournal: () => {
      closeAll(journal);
      journal.show();
    },
    onPhotoMode: () => {
      closeAll(photo);
      photo.enter();
    },
  });
  const hotbar = createHotbar(store, {
    onSleep: handlers.onSleep,
    onShop: () => {
      closeAll(shop);
      handlers.onShop();
    },
  });

  const parts = [hud, hotbar, toasts, prompt, visitor, shop, settings, help, dayOverlay];
  root.append(...parts.map((p) => p.el));
  root.appendChild(journal.root);
  root.appendChild(cook.root);
  root.appendChild(fish.root);
  root.appendChild(photo.root);

  return {
    shop,
    settings,
    help,
    journal,
    cook,
    fish,
    photo,
    toasts,
    visitor,
    dayOverlay,
    prompt,
    closeTop: () => {
      if (photo.isActive) photo.exit();
      else if (help.isOpen) help.hide();
      else if (settings.isOpen) settings.close();
      else if (shop.isOpen) shop.close();
      else if (journal.isOpen) journal.hide();
      else if (cook.isOpen) cook.hide();
      else if (fish.isOpen) fish.hide();
      else return false;
      return true;
    },
    dispose: () => {
      for (const p of parts) {
        p.dispose();
        p.el.remove();
      }
      journal.root.remove();
      cook.root.remove();
      fish.root.remove();
      photo.root.remove();
    },
  };
};

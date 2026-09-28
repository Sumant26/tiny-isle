import type { RegisterSWOptions } from 'vite-plugin-pwa/types';

export type RegisterSW = (options: RegisterSWOptions) => (reloadPage?: boolean) => Promise<void>;

export interface PwaCallbacks {
  /** A new version was downloaded; call `apply` to switch to it. */
  onUpdateReady: (apply: () => Promise<void>) => void;
  /** Everything is cached; the game now works offline. */
  onOfflineReady: () => void;
  onError?: (error: unknown) => void;
}

/**
 * Registers the service worker (installable app + offline play). The register
 * function is injected so this is testable without a real service worker.
 */
export const setupPwa = (register: RegisterSW, callbacks: PwaCallbacks): void => {
  let update: ((reloadPage?: boolean) => Promise<void>) | null = null;
  update = register({
    onNeedRefresh: () => {
      callbacks.onUpdateReady(async () => {
        await update?.(true);
      });
    },
    onOfflineReady: callbacks.onOfflineReady,
    onRegisterError: (error: unknown) => callbacks.onError?.(error),
  });
};

export const OFFLINE_READY_SEEN_KEY = 'tiny-isle/offline-ready-seen';

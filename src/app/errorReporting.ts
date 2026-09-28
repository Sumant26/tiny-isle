import type { BrowserOptions } from '@sentry/browser';
import type { StorageAdapter } from '../persistence/storage';

export const CRASH_REPORTS_KEY = 'tiny-isle/crash-reports';

/** The slice of the Sentry SDK we use; injected so tests never load the real SDK. */
export interface SentryLike {
  init(options: BrowserOptions): unknown;
  captureException(error: unknown): string;
  close(timeout?: number): Promise<boolean>;
}

export interface ErrorReporter {
  /** False when the build has no DSN: the settings toggle is hidden. */
  readonly available: boolean;
  /** True only after the player has opted in. */
  readonly enabled: boolean;
  setEnabled(enabled: boolean): Promise<void>;
  capture(error: unknown): void;
  /** Resolves once the SDK is running (if the player opted in earlier). */
  readonly ready: Promise<void>;
}

export interface ErrorReporterOptions {
  dsn: string | undefined;
  storage: StorageAdapter;
  release?: string;
  environment?: string;
  load?: () => Promise<SentryLike>;
}

/**
 * Opt-in crash reporting. Nothing is loaded or sent unless the build has a
 * Sentry DSN *and* the player ticks "Share crash reports" in Settings. The SDK
 * is a separate lazy chunk, so players who don't opt in never download it.
 */
export const createErrorReporter = ({
  dsn,
  storage,
  release,
  environment,
  load = () => import('@sentry/browser'),
}: ErrorReporterOptions): ErrorReporter => {
  const available = Boolean(dsn);
  let enabled = available && storage.getItem(CRASH_REPORTS_KEY) === '1';
  let sdk: SentryLike | null = null;

  const start = async (): Promise<void> => {
    if (sdk || !dsn) return;
    const loaded = await load();
    loaded.init({
      dsn,
      ...(release ? { release } : {}),
      ...(environment ? { environment } : {}),
      // Crashes only: no performance tracing, no session replay, no breadcrumbs of what the player typed.
      tracesSampleRate: 0,
      beforeBreadcrumb: (crumb) => (crumb.category === 'ui.input' ? null : crumb),
    });
    sdk = loaded;
  };

  const ready = enabled ? start().catch(() => undefined) : Promise.resolve();

  return {
    available,
    get enabled() {
      return enabled;
    },
    ready,
    setEnabled: async (on) => {
      if (!available) return;
      enabled = on;
      storage.setItem(CRASH_REPORTS_KEY, on ? '1' : '0');
      if (on) {
        await start();
      } else if (sdk) {
        const running = sdk;
        sdk = null;
        await running.close();
      }
    },
    capture: (error) => {
      if (enabled && sdk) sdk.captureException(error);
    },
  };
};

import { describe, expect, it, vi } from 'vitest';
import { createMemoryStorage } from '../persistence/storage';
import { CRASH_REPORTS_KEY, createErrorReporter, type SentryLike } from './errorReporting';

const fakeSentry = () => {
  const sdk = {
    init: vi.fn(),
    captureException: vi.fn(() => 'id'),
    close: vi.fn(() => Promise.resolve(true)),
  } satisfies SentryLike;
  return { sdk, load: vi.fn(() => Promise.resolve(sdk)) };
};

describe('createErrorReporter', () => {
  it('is unavailable and inert without a DSN', async () => {
    const { load } = fakeSentry();
    const r = createErrorReporter({
      dsn: undefined,
      storage: createMemoryStorage({ [CRASH_REPORTS_KEY]: '1' }),
      load,
    });
    expect(r.available).toBe(false);
    expect(r.enabled).toBe(false);
    await r.setEnabled(true);
    expect(r.enabled).toBe(false);
    expect(load).not.toHaveBeenCalled();
  });

  it('loads nothing until the player opts in', async () => {
    const { sdk, load } = fakeSentry();
    const storage = createMemoryStorage();
    const r = createErrorReporter({
      dsn: 'https://k@o.ingest.sentry.io/1',
      storage,
      load,
      release: '1.2.3',
      environment: 'production',
    });
    await r.ready;
    expect(r.available).toBe(true);
    expect(r.enabled).toBe(false);
    r.capture(new Error('ignored'));
    expect(load).not.toHaveBeenCalled();

    await r.setEnabled(true);
    expect(storage.getItem(CRASH_REPORTS_KEY)).toBe('1');
    expect(sdk.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://k@o.ingest.sentry.io/1',
        release: '1.2.3',
        environment: 'production',
        tracesSampleRate: 0,
      }),
    );
    r.capture(new Error('boom'));
    expect(sdk.captureException).toHaveBeenCalledWith(new Error('boom'));

    await r.setEnabled(true); // already running: no second init
    expect(sdk.init).toHaveBeenCalledTimes(1);

    await r.setEnabled(false);
    expect(sdk.close).toHaveBeenCalled();
    expect(storage.getItem(CRASH_REPORTS_KEY)).toBe('0');
    r.capture(new Error('after opt-out'));
    expect(sdk.captureException).toHaveBeenCalledTimes(1);
    await r.setEnabled(false); // nothing running: fine
  });

  it('starts automatically when the player opted in earlier', async () => {
    const { sdk, load } = fakeSentry();
    const r = createErrorReporter({
      dsn: 'dsn',
      storage: createMemoryStorage({ [CRASH_REPORTS_KEY]: '1' }),
      load,
    });
    await r.ready;
    expect(r.enabled).toBe(true);
    expect(sdk.init).toHaveBeenCalledWith(
      expect.not.objectContaining({ release: expect.anything() }),
    );
  });

  it('drops input breadcrumbs', async () => {
    const { sdk, load } = fakeSentry();
    const r = createErrorReporter({ dsn: 'dsn', storage: createMemoryStorage(), load });
    await r.setEnabled(true);
    const opts = sdk.init.mock.calls[0]![0] as {
      beforeBreadcrumb: (c: { category?: string }) => unknown;
    };
    expect(opts.beforeBreadcrumb({ category: 'ui.input' })).toBeNull();
    expect(opts.beforeBreadcrumb({ category: 'console' })).toEqual({ category: 'console' });
  });

  it('survives an SDK that fails to load', async () => {
    const r = createErrorReporter({
      dsn: 'dsn',
      storage: createMemoryStorage({ [CRASH_REPORTS_KEY]: '1' }),
      load: () => Promise.reject(new Error('offline')),
    });
    await expect(r.ready).resolves.toBeUndefined();
    expect(() => r.capture(new Error('x'))).not.toThrow();
  });

  it('uses the real SDK loader by default', () => {
    const r = createErrorReporter({ dsn: 'dsn', storage: createMemoryStorage() });
    expect(r.available).toBe(true);
  });
});

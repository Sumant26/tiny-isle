import { describe, expect, it, vi } from 'vitest';
import type { RegisterSWOptions } from 'vite-plugin-pwa/types';
import { setupPwa } from './pwa';

const fakeRegister = () => {
  let options: RegisterSWOptions = {};
  const update = vi.fn(() => Promise.resolve());
  const register = vi.fn((o: RegisterSWOptions) => {
    options = o;
    return update;
  });
  return { register, update, options: () => options };
};

describe('setupPwa', () => {
  it('offers an update and applies it with a reload', async () => {
    const sw = fakeRegister();
    const onUpdateReady = vi.fn();
    setupPwa(sw.register, { onUpdateReady, onOfflineReady: vi.fn() });
    sw.options().onNeedRefresh?.();
    expect(onUpdateReady).toHaveBeenCalledTimes(1);
    const apply = onUpdateReady.mock.calls[0]![0] as () => Promise<void>;
    await apply();
    expect(sw.update).toHaveBeenCalledWith(true);
  });

  it('reports offline readiness and registration errors', () => {
    const sw = fakeRegister();
    const onOfflineReady = vi.fn();
    const onError = vi.fn();
    setupPwa(sw.register, { onUpdateReady: vi.fn(), onOfflineReady, onError });
    sw.options().onOfflineReady?.();
    sw.options().onRegisterError?.(new Error('nope'));
    expect(onOfflineReady).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(new Error('nope'));
  });

  it('ignores registration errors without a handler', () => {
    const sw = fakeRegister();
    setupPwa(sw.register, { onUpdateReady: vi.fn(), onOfflineReady: vi.fn() });
    expect(() => sw.options().onRegisterError?.(new Error('x'))).not.toThrow();
  });
});

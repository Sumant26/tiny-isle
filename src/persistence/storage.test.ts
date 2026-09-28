import { describe, expect, it, vi } from 'vitest';
import { createBrowserStorage, createMemoryStorage } from './storage';

const fakeStorage = (overrides: Partial<Storage> = {}): Storage => {
  const data = new Map<string, string>();
  const storage: Storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  };
  return Object.assign(storage, overrides);
};

describe('createMemoryStorage', () => {
  it('stores, reads and removes values', () => {
    const s = createMemoryStorage({ a: '1' });
    expect(s.getItem('a')).toBe('1');
    s.setItem('b', '2');
    expect(s.getItem('b')).toBe('2');
    s.removeItem('a');
    expect(s.getItem('a')).toBeNull();
  });
});

describe('createBrowserStorage', () => {
  it('uses the real storage when it works', () => {
    const real = fakeStorage();
    const s = createBrowserStorage(() => real);
    s.setItem('k', 'v');
    expect(real.getItem('k')).toBe('v');
    expect(s.getItem('k')).toBe('v');
    s.removeItem('k');
    expect(real.getItem('k')).toBeNull();
  });

  it('falls back to memory when storage is unavailable', () => {
    const s = createBrowserStorage(() => {
      throw new Error('SecurityError');
    });
    s.setItem('k', 'v');
    expect(s.getItem('k')).toBe('v');
  });

  it('falls back per call when storage throws later (quota, private mode)', () => {
    let broken = false;
    const boom = (): never => {
      throw new Error('QuotaExceeded');
    };
    const real = fakeStorage();
    const flaky = {
      clear: () => undefined,
      key: () => null,
      length: 0,
      getItem: (k: string) => (broken ? boom() : real.getItem(k)),
      setItem: (k: string, v: string) => (broken ? boom() : real.setItem(k, v)),
      removeItem: (k: string) => (broken ? boom() : real.removeItem(k)),
    } as Storage;
    const s = createBrowserStorage(() => flaky);
    broken = true;
    expect(() => s.setItem('k', 'v')).not.toThrow();
    expect(s.getItem('k')).toBe('v');
    expect(() => s.removeItem('k')).not.toThrow();
    expect(s.getItem('k')).toBeNull();
  });

  it('defaults to window.localStorage', () => {
    const spy = vi.fn(() => fakeStorage());
    vi.stubGlobal('window', {
      get localStorage() {
        return spy();
      },
    });
    createBrowserStorage();
    expect(spy).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

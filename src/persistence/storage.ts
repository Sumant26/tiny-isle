/** Minimal key/value storage so persistence never talks to `localStorage` directly. */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const createMemoryStorage = (initial: Record<string, string> = {}): StorageAdapter => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

/**
 * Wraps browser storage. Private windows and blocked site data make
 * localStorage throw, so every call is guarded and we fall back to memory.
 */
export const createBrowserStorage = (
  getStorage: () => Storage = () => window.localStorage,
): StorageAdapter => {
  const fallback = createMemoryStorage();
  let storage: Storage | null;
  try {
    storage = getStorage();
    const probe = '__tiny_isle_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
  } catch {
    storage = null;
  }
  const s = storage;
  if (!s) return fallback;
  return {
    getItem: (k) => {
      try {
        return s.getItem(k);
      } catch {
        return fallback.getItem(k);
      }
    },
    setItem: (k, v) => {
      try {
        s.setItem(k, v);
      } catch {
        fallback.setItem(k, v);
      }
    },
    removeItem: (k) => {
      try {
        s.removeItem(k);
      } catch {
        fallback.removeItem(k);
      }
    },
  };
};

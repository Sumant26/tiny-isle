import type { GameState } from '../core/types';
import type { Store, Unsubscribe } from '../state/store';
import { migrate, SAVE_VERSION } from './migrations';
import { type Result, validateState } from './schema';
import type { StorageAdapter } from './storage';

export const SAVE_KEY = 'tiny-isle/save';

export interface SaveFile {
  readonly version: number;
  readonly savedAt: string;
  readonly state: GameState;
}

export const serialize = (state: GameState, now: Date = new Date()): string =>
  JSON.stringify({ version: SAVE_VERSION, savedAt: now.toISOString(), state } satisfies SaveFile);

/** Parses, migrates and validates a save string. Never throws. */
export const deserialize = (raw: string): Result<GameState> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'not valid JSON' };
  }
  if (typeof parsed !== 'object' || parsed === null) return { ok: false, error: 'not a save file' };
  const { version, state } = parsed as { version?: unknown; state?: unknown };
  if (typeof version !== 'number') return { ok: false, error: 'missing version' };
  if (typeof state !== 'object' || state === null) return { ok: false, error: 'missing state' };
  const migrated = migrate(state as Record<string, unknown>, version);
  if (!migrated.ok) return migrated;
  return validateState(migrated.value);
};

export interface SaveManagerOptions {
  storage: StorageAdapter;
  key?: string;
  /** Debounce for autosave after ordinary changes. */
  debounceMs?: number;
  schedule?: (fn: () => void, ms: number) => unknown;
  cancel?: (handle: unknown) => void;
  onError?: (error: unknown) => void;
}

export interface SaveManager {
  load(): Result<GameState> | null;
  save(state: GameState): void;
  clear(): void;
  /** Autosaves: immediately on important events, debounced otherwise. */
  attach(store: Store): Unsubscribe;
  /** Writes any pending debounced save now (e.g. on page hide). */
  flush(): void;
}

const IMPORTANT_EVENTS = new Set(['day-started', 'bought-decoration', 'visitor-helped']);

export const createSaveManager = ({
  storage,
  key = SAVE_KEY,
  debounceMs = 1500,
  schedule = (fn, ms) => setTimeout(fn, ms),
  cancel = (h) => {
    clearTimeout(h as ReturnType<typeof setTimeout>);
  },
  onError = (e) => {
    console.warn('[tiny-isle] could not save', e);
  },
}: SaveManagerOptions): SaveManager => {
  let pending: { handle: unknown; state: GameState } | null = null;

  const save = (state: GameState): void => {
    try {
      storage.setItem(key, serialize(state));
    } catch (e) {
      onError(e);
    }
  };

  const flush = (): void => {
    if (!pending) return;
    cancel(pending.handle);
    const { state } = pending;
    pending = null;
    save(state);
  };

  const queue = (state: GameState): void => {
    if (pending) cancel(pending.handle);
    pending = { state, handle: schedule(flush, debounceMs) };
  };

  return {
    load: () => {
      const raw = storage.getItem(key);
      return raw === null ? null : deserialize(raw);
    },
    save,
    clear: () => {
      if (pending) cancel(pending.handle);
      pending = null;
      storage.removeItem(key);
    },
    flush,
    attach: (store) => {
      const offState = store.subscribe((s) => {
        queue(s);
      });
      const offEvents = store.onEvent((e, s) => {
        if (IMPORTANT_EVENTS.has(e.type)) {
          if (pending) cancel(pending.handle);
          pending = null;
          save(s);
        }
      });
      return () => {
        offState();
        offEvents();
      };
    },
  };
};

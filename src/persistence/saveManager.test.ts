import { describe, expect, it, vi } from 'vitest';
import { actions } from '../state/actions';
import { reducer } from '../state/reducer';
import { createStore } from '../state/store';
import { makeState } from '../test/fixtures';
import { createSaveManager, deserialize, SAVE_KEY, serialize } from './saveManager';
import { createMemoryStorage } from './storage';

const manualScheduler = () => {
  const tasks = new Map<number, () => void>();
  let id = 0;
  return {
    schedule: (fn: () => void) => {
      tasks.set(++id, fn);
      return id;
    },
    cancel: (h: unknown) => void tasks.delete(h as number),
    runAll: () => {
      for (const [k, fn] of [...tasks]) {
        tasks.delete(k);
        fn();
      }
    },
    get size() {
      return tasks.size;
    },
  };
};

describe('serialize / deserialize', () => {
  it('round-trips a state', () => {
    const s = makeState();
    const raw = serialize(s, new Date('2026-01-01T00:00:00Z'));
    expect(JSON.parse(raw)).toMatchObject({ version: 2, savedAt: '2026-01-01T00:00:00.000Z' });
    expect(deserialize(raw)).toEqual({ ok: true, value: s });
  });

  it('never throws on garbage', () => {
    expect(deserialize('{nope')).toEqual({ ok: false, error: 'not valid JSON' });
    expect(deserialize('42')).toEqual({ ok: false, error: 'not a save file' });
    expect(deserialize('{"state":{}}')).toEqual({ ok: false, error: 'missing version' });
    expect(deserialize('{"version":1}')).toEqual({ ok: false, error: 'missing state' });
    expect(deserialize('{"version":99,"state":{}}').ok).toBe(false);
    expect(deserialize('{"version":1,"state":{"day":1}}').ok).toBe(false);
  });
});

describe('createSaveManager', () => {
  it('saves, loads and clears', () => {
    const storage = createMemoryStorage();
    const m = createSaveManager({ storage });
    expect(m.load()).toBeNull();
    const s = makeState({ coins: 99 });
    m.save(s);
    expect(m.load()).toEqual({ ok: true, value: s });
    m.clear();
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it('reports storage errors instead of throwing', () => {
    const onError = vi.fn();
    const m = createSaveManager({
      storage: {
        getItem: () => null,
        removeItem: () => undefined,
        setItem: () => {
          throw new Error('full');
        },
      },
      onError,
    });
    m.save(makeState());
    expect(onError).toHaveBeenCalled();
  });

  it('debounces ordinary changes and flushes on demand', () => {
    const storage = createMemoryStorage();
    const sched = manualScheduler();
    const m = createSaveManager({ storage, schedule: sched.schedule, cancel: sched.cancel });
    const store = createStore({ reducer, initialState: makeState() });
    const detach = m.attach(store);
    store.dispatch(actions.selectTool('water'));
    store.dispatch(actions.selectTool('basket'));
    expect(sched.size).toBe(1);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
    sched.runAll();
    expect(deserialize(storage.getItem(SAVE_KEY)!)).toMatchObject({
      ok: true,
      value: { selectedTool: 'basket' },
    });
    store.dispatch(actions.selectTool('hoe'));
    m.flush();
    expect(deserialize(storage.getItem(SAVE_KEY)!)).toMatchObject({
      value: { selectedTool: 'hoe' },
    });
    m.flush(); // nothing pending: no-op
    detach();
    store.dispatch(actions.selectTool('water'));
    expect(sched.size).toBe(0);
  });

  it('saves immediately on important events like a new day', () => {
    const storage = createMemoryStorage();
    const sched = manualScheduler();
    const m = createSaveManager({ storage, schedule: sched.schedule, cancel: sched.cancel });
    const store = createStore({ reducer, initialState: makeState() });
    m.attach(store);
    store.dispatch(actions.sleep());
    expect(sched.size).toBe(0);
    expect(deserialize(storage.getItem(SAVE_KEY)!)).toMatchObject({ value: { day: 2 } });
  });

  it('clear cancels a pending save', () => {
    const storage = createMemoryStorage();
    const sched = manualScheduler();
    const m = createSaveManager({ storage, schedule: sched.schedule, cancel: sched.cancel });
    const store = createStore({ reducer, initialState: makeState() });
    m.attach(store);
    store.dispatch(actions.selectTool('water'));
    m.clear();
    expect(sched.size).toBe(0);
  });

  it('uses real timers by default', () => {
    vi.useFakeTimers();
    const storage = createMemoryStorage();
    const m = createSaveManager({ storage, debounceMs: 100 });
    const store = createStore({ reducer, initialState: makeState() });
    m.attach(store);
    store.dispatch(actions.selectTool('water'));
    store.dispatch(actions.selectTool('basket'));
    vi.advanceTimersByTime(100);
    expect(storage.getItem(SAVE_KEY)).not.toBeNull();
    vi.useRealTimers();
  });

  it('warns on errors by default', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const m = createSaveManager({
      storage: {
        getItem: () => null,
        removeItem: () => undefined,
        setItem: () => {
          throw new Error('x');
        },
      },
    });
    m.save(makeState());
    expect(warn).toHaveBeenCalled();
  });
});

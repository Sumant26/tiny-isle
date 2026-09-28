import type { GameEvent, GameState, Outcome } from '../core/types';
import type { Action } from './actions';

export type Reducer = (state: GameState, action: Action) => Outcome;
export type Listener = (state: GameState, previous: GameState) => void;
export type EventListener = (event: GameEvent, state: GameState) => void;
export type Unsubscribe = () => void;
export type Equality<T> = (a: T, b: T) => boolean;

export interface Store {
  getState(): GameState;
  /** Applies an action synchronously and returns the events it produced. */
  dispatch(action: Action): readonly GameEvent[];
  /** Called after every state change (not for no-op actions). */
  subscribe(listener: Listener): Unsubscribe;
  /**
   * Called only when the selected slice changes. Views use this so a coin change
   * never re-renders the plot, and a single tile change touches a single mesh.
   */
  select<T>(
    selector: (s: GameState) => T,
    listener: (value: T, previous: T) => void,
    options?: { equals?: Equality<T>; fireImmediately?: boolean },
  ): Unsubscribe;
  onEvent(listener: EventListener): Unsubscribe;
}

export interface StoreOptions {
  reducer: Reducer;
  initialState: GameState;
  /** Optional hook for logging/devtools. */
  onAction?: (action: Action, outcome: Outcome) => void;
}

export const createStore = ({ reducer, initialState, onAction }: StoreOptions): Store => {
  let state = initialState;
  let dispatching = false;
  const listeners = new Set<Listener>();
  const eventListeners = new Set<EventListener>();

  const dispatch = (action: Action): readonly GameEvent[] => {
    if (dispatching) throw new Error(`Cannot dispatch "${action.type}" while reducing`);
    let outcome: Outcome;
    try {
      dispatching = true;
      outcome = reducer(state, action);
    } finally {
      dispatching = false;
    }
    onAction?.(action, outcome);
    const previous = state;
    state = outcome.state;
    if (state !== previous) {
      // Snapshot so listeners may unsubscribe while being notified.
      for (const l of [...listeners]) l(state, previous);
    }
    for (const e of outcome.events) for (const l of [...eventListeners]) l(e, state);
    return outcome.events;
  };

  const subscribe = (listener: Listener): Unsubscribe => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const select: Store['select'] = (selector, listener, options = {}) => {
    const equals = options.equals ?? Object.is;
    let current = selector(state);
    if (options.fireImmediately) listener(current, current);
    return subscribe((s) => {
      const next = selector(s);
      if (!equals(next, current)) {
        const prev = current;
        current = next;
        listener(next, prev);
      }
    });
  };

  const onEvent = (listener: EventListener): Unsubscribe => {
    eventListeners.add(listener);
    return () => eventListeners.delete(listener);
  };

  return { getState: () => state, dispatch, subscribe, select, onEvent };
};

/** Shallow equality for arrays/objects of primitives, for selectors that build new objects. */
export const shallowEqual = <T>(a: T, b: T): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  const ka = Object.keys(a) as (keyof T)[];
  const kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.is(a[k], b[k]));
};

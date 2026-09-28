import type { GameEvent, GameState, Outcome, RejectReason } from '../types';

export const ok = (state: GameState, ...events: GameEvent[]): Outcome => ({ state, events });

/** A rejected action leaves state untouched (same reference) and explains why. */
export const reject = (state: GameState, reason: RejectReason): Outcome => ({
  state,
  events: [{ type: 'rejected', reason }],
});

/** Runs `next` on the state produced by `first`, concatenating events. */
export const chain = (first: Outcome, next: (s: GameState) => Outcome): Outcome => {
  const second = next(first.state);
  return { state: second.state, events: [...first.events, ...second.events] };
};

export const addCount = <K extends string>(
  counts: Readonly<Record<K, number>>,
  key: K,
  delta: number,
): Readonly<Record<K, number>> => ({ ...counts, [key]: counts[key] + delta });

import { bloomLevel } from '../bloom';
import { BALANCE } from '../config';
import type { CropId, GameEvent, GameState, Outcome } from '../types';
import { ok } from './outcome';

export const unlockCrop = (state: GameState, crop: CropId): Outcome =>
  state.unlockedCrops.includes(crop)
    ? ok(state)
    : ok(
        { ...state, unlockedCrops: [...state.unlockedCrops, crop] },
        { type: 'crop-unlocked', crop },
      );

/** Adds bloom points, emitting a level-up (and any crop unlock) for every level crossed. */
export const addBloom = (state: GameState, points: number): Outcome => {
  if (points <= 0) return ok(state);
  const before = bloomLevel(state.bloom);
  let next: GameState = { ...state, bloom: state.bloom + points };
  const after = bloomLevel(next.bloom);
  const events: GameEvent[] = [];
  for (let level = before + 1; level <= after; level++) {
    events.push({ type: 'bloom-level-up', level });
    const crop = BALANCE.bloomUnlocks[level];
    if (crop) {
      const unlocked = unlockCrop(next, crop);
      next = unlocked.state;
      events.push(...unlocked.events);
    }
  }
  return { state: next, events };
};

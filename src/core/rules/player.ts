import { CROP_IDS } from '../config';
import { isWalkable } from '../world';
import type { Cell, CropId, GameState, Outcome, Settings, ToolId } from '../types';
import { ok, reject } from './outcome';

export const moveTo = (state: GameState, to: Cell): Outcome => {
  if (!isWalkable(to, state.isletUnlocked)) return reject(state, 'blocked');
  if (state.player.x === to.x && state.player.z === to.z) return ok(state);
  return ok({ ...state, player: { x: to.x, z: to.z } }, { type: 'moved', to });
};

export const selectTool = (state: GameState, tool: ToolId): Outcome =>
  state.selectedTool === tool ? ok(state) : ok({ ...state, selectedTool: tool });

export const selectSeed = (state: GameState, crop: CropId): Outcome => {
  if (!state.unlockedCrops.includes(crop)) return reject(state, 'locked');
  return ok({ ...state, selectedSeed: crop, selectedTool: 'seeds' });
};

/** Cycles through unlocked seeds (direction +1 / -1). */
export const cycleSeed = (state: GameState, direction: 1 | -1): Outcome => {
  const unlocked = CROP_IDS.filter((c) => state.unlockedCrops.includes(c));
  const i = unlocked.indexOf(state.selectedSeed);
  const next = unlocked[(i + direction + unlocked.length) % unlocked.length] ?? state.selectedSeed;
  return selectSeed(state, next);
};

export const updateSettings = (state: GameState, patch: Partial<Settings>): Outcome => {
  const volume = Math.min(1, Math.max(0, patch.volume ?? state.settings.volume));
  const muted = patch.muted ?? state.settings.muted;
  if (volume === state.settings.volume && muted === state.settings.muted) return ok(state);
  return ok({ ...state, settings: { volume, muted } });
};

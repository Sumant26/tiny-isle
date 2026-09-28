import { describe, expect, it } from 'vitest';
import { makeState, unlockAll } from '../../test/fixtures';
import { LAYOUT } from '../world';
import { cycleSeed, moveTo, selectSeed, selectTool, updateSettings } from './player';

describe('moveTo', () => {
  it('moves to walkable cells', () => {
    const r = moveTo(makeState(), { x: 5, z: 5 });
    expect(r.state.player).toEqual({ x: 5, z: 5 });
    expect(r.events).toEqual([{ type: 'moved', to: { x: 5, z: 5 } }]);
  });

  it('is a no-op when already there, and rejects blocked cells', () => {
    const s = makeState();
    expect(moveTo(s, LAYOUT.playerStart).state).toBe(s);
    expect(moveTo(s, { x: 0, z: 0 }).events[0]).toMatchObject({ reason: 'blocked' });
  });
});

describe('selection', () => {
  it('selects tools (no-op when unchanged)', () => {
    const s = makeState();
    expect(selectTool(s, 'hoe').state).toBe(s);
    expect(selectTool(s, 'water').state.selectedTool).toBe('water');
  });

  it('selects unlocked seeds and switches to the seed tool', () => {
    const r = selectSeed(unlockAll(makeState()), 'tomato');
    expect(r.state.selectedSeed).toBe('tomato');
    expect(r.state.selectedTool).toBe('seeds');
    expect(selectSeed(makeState(), 'pumpkin').events[0]).toMatchObject({ reason: 'locked' });
  });

  it('cycles through unlocked seeds in both directions', () => {
    const s = unlockAll(makeState());
    expect(cycleSeed(s, 1).state.selectedSeed).toBe('tomato');
    expect(cycleSeed(s, -1).state.selectedSeed).toBe('pumpkin');
    expect(cycleSeed(makeState(), 1).state.selectedSeed).toBe('carrot');
  });
});

describe('updateSettings', () => {
  it('clamps volume and toggles mute', () => {
    const s = makeState();
    expect(updateSettings(s, { volume: 5 }).state.settings.volume).toBe(1);
    expect(updateSettings(s, { volume: -1 }).state.settings.volume).toBe(0);
    expect(updateSettings(s, { muted: true }).state.settings.muted).toBe(true);
    expect(updateSettings(s, {}).state).toBe(s);
  });
});

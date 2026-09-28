import { describe, expect, it } from 'vitest';
import { makeState, unlockAll, withProduce } from '../test/fixtures';
import { actions } from './actions';
import { reducer } from './reducer';

describe('reducer', () => {
  it('routes every action type to its rule', () => {
    let s = unlockAll(makeState({ coins: 500 }));
    s = reducer(s, actions.selectTool('water')).state;
    expect(s.selectedTool).toBe('water');
    s = reducer(s, actions.selectSeed('tomato')).state;
    expect(s.selectedSeed).toBe('tomato');
    s = reducer(s, actions.cycleSeed(1)).state;
    expect(s.selectedSeed).toBe('strawberry');
    s = reducer(s, actions.move({ x: 5, z: 5 })).state;
    expect(s.player).toEqual({ x: 5, z: 5 });
    s = reducer({ ...s, selectedTool: 'hoe' }, actions.useTile(0)).state;
    expect(s.plot.tiles[0]?.tilled).toBe(true);
    s = reducer(s, actions.sleep()).state;
    expect(s.day).toBe(2);
    s = reducer(withProduce(s, 'carrot', 2), actions.sell('carrot', 1)).state;
    expect(s.inventory.produce.carrot).toBe(1);
    s = reducer(s, actions.sellAll()).state;
    expect(s.inventory.produce.carrot).toBe(0);
    s = reducer(s, actions.buySeeds('pumpkin', 1)).state;
    expect(s.inventory.seeds.pumpkin).toBe(1);
    s = reducer(s, actions.buyDecoration('gnome')).state;
    expect(s.decorations).toContain('gnome');
    s = reducer(
      withProduce({ ...s, visitor: { id: 'hazel', arrivedOnDay: 2 } }, 'carrot', 3),
      actions.fulfillVisitor(),
    ).state;
    expect(s.visitor).toBeNull();
    s = reducer(s, actions.updateSettings({ muted: true })).state;
    expect(s.settings.muted).toBe(true);
    const fresh = makeState();
    expect(reducer(s, actions.load(fresh)).state).toBe(fresh);
  });
});

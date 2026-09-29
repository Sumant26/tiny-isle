// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { bindKeyboard, cameraRelativeStep, keyToCommand } from './keyboard';

describe('keyToCommand', () => {
  it.each([
    ['1', { type: 'tool', tool: 'hoe' }],
    ['2', { type: 'tool', tool: 'seeds' }],
    ['3', { type: 'tool', tool: 'water' }],
    ['4', { type: 'tool', tool: 'basket' }],
    ['q', { type: 'cycle-seed', direction: -1 }],
    ['E', { type: 'cycle-seed', direction: 1 }],
    ['w', { type: 'move', forward: 1, right: 0 }],
    ['ArrowUp', { type: 'move', forward: 1, right: 0 }],
    ['s', { type: 'move', forward: -1, right: 0 }],
    ['ArrowDown', { type: 'move', forward: -1, right: 0 }],
    ['a', { type: 'move', forward: 0, right: -1 }],
    ['ArrowLeft', { type: 'move', forward: 0, right: -1 }],
    ['d', { type: 'move', forward: 0, right: 1 }],
    ['ArrowRight', { type: 'move', forward: 0, right: 1 }],
    [' ', { type: 'use' }],
    ['Enter', { type: 'use' }],
    ['z', { type: 'sleep' }],
    ['b', { type: 'shop' }],
    ['h', { type: 'house' }],
    ['m', { type: 'mute' }],
    ['Escape', { type: 'close' }],
  ])('maps %j', (key, command) => {
    expect(keyToCommand(key)).toEqual(command);
  });

  it('ignores unmapped keys', () => {
    expect(keyToCommand('x')).toBeNull();
    expect(keyToCommand('Shift')).toBeNull();
  });
});

describe('cameraRelativeStep', () => {
  it('moves away from a camera placed on +z when pressing forward', () => {
    expect(cameraRelativeStep(1, 0, Math.PI / 2)).toEqual({ dx: 0, dz: -1 });
    expect(cameraRelativeStep(-1, 0, Math.PI / 2)).toEqual({ dx: 0, dz: 1 });
  });

  it('strafes perpendicular to the view', () => {
    const r = cameraRelativeStep(0, 1, Math.PI / 2);
    expect(Math.abs(r.dx)).toBe(1);
    expect(r.dz).toBe(0);
  });

  it('snaps diagonal views to the dominant axis', () => {
    expect(cameraRelativeStep(1, 0, 0.1)).toEqual({ dx: -1, dz: 0 });
  });
});

describe('bindKeyboard', () => {
  it('dispatches commands, ignores modifiers and typing, and unbinds', () => {
    const onCommand = vi.fn();
    const off = bindKeyboard(window, onCommand);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    expect(onCommand).toHaveBeenCalledWith({ type: 'tool', tool: 'water' });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    const input = document.createElement('input');
    document.body.append(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
    expect(onCommand).toHaveBeenCalledTimes(1);
    off();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    expect(onCommand).toHaveBeenCalledTimes(1);
  });
});

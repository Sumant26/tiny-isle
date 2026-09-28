import type { ToolId } from '../core/types';

export type Command =
  | { readonly type: 'tool'; readonly tool: ToolId }
  | { readonly type: 'cycle-seed'; readonly direction: 1 | -1 }
  | { readonly type: 'move'; readonly forward: number; readonly right: number }
  | { readonly type: 'use' }
  | { readonly type: 'sleep' }
  | { readonly type: 'shop' }
  | { readonly type: 'mute' }
  | { readonly type: 'close' };

const TOOL_KEYS: Record<string, ToolId> = { '1': 'hoe', '2': 'seeds', '3': 'water', '4': 'basket' };

/** Pure key -> command mapping (uses KeyboardEvent.key, lower-cased for letters). */
export const keyToCommand = (key: string): Command | null => {
  const k = key.length === 1 ? key.toLowerCase() : key;
  const tool = TOOL_KEYS[k];
  if (tool) return { type: 'tool', tool };
  switch (k) {
    case 'q':
      return { type: 'cycle-seed', direction: -1 };
    case 'e':
      return { type: 'cycle-seed', direction: 1 };
    case 'w':
    case 'ArrowUp':
      return { type: 'move', forward: 1, right: 0 };
    case 's':
    case 'ArrowDown':
      return { type: 'move', forward: -1, right: 0 };
    case 'a':
    case 'ArrowLeft':
      return { type: 'move', forward: 0, right: -1 };
    case 'd':
    case 'ArrowRight':
      return { type: 'move', forward: 0, right: 1 };
    case ' ':
    case 'Enter':
      return { type: 'use' };
    case 'z':
      return { type: 'sleep' };
    case 'b':
      return { type: 'shop' };
    case 'm':
      return { type: 'mute' };
    case 'Escape':
      return { type: 'close' };
    default:
      return null;
  }
};

/**
 * Turns a screen-relative move into a grid step, based on where the camera is
 * looking (ArcRotateCamera alpha). "Forward" always means "away from the camera".
 */
export const cameraRelativeStep = (
  forward: number,
  right: number,
  alpha: number,
): { dx: number; dz: number } => {
  const fx = -Math.cos(alpha);
  const fz = -Math.sin(alpha);
  const rx = -Math.sin(alpha);
  const rz = Math.cos(alpha);
  const x = forward * fx + right * rx;
  const z = forward * fz + right * rz;
  if (Math.abs(x) >= Math.abs(z)) return { dx: Math.sign(x), dz: 0 };
  return { dx: 0, dz: Math.sign(z) };
};

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const bindKeyboard = (
  target: Window | HTMLElement,
  onCommand: (c: Command) => void,
): (() => void) => {
  const handler = (e: Event): void => {
    const ev = e as KeyboardEvent;
    if (ev.ctrlKey || ev.metaKey || ev.altKey || isTyping(ev.target)) return;
    const cmd = keyToCommand(ev.key);
    if (!cmd) return;
    ev.preventDefault();
    onCommand(cmd);
  };
  target.addEventListener('keydown', handler);
  return () => target.removeEventListener('keydown', handler);
};

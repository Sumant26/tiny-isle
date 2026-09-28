import type { Cell } from '../core/types';
import { worldToCell } from '../core/world';
import { PointerEventTypes, type Scene } from './babylon';

export interface PickerHandlers {
  onTap: (cell: Cell) => void;
  onHover?: (cell: Cell | null) => void;
  onDoubleTap?: (cell: Cell) => void;
}

/** Converts taps, drags and hover on the island into grid cells. */
export const attachPicker = (
  scene: Scene,
  handlers: ((cell: Cell) => void) | PickerHandlers,
): (() => void) => {
  const h: PickerHandlers = typeof handlers === 'function' ? { onTap: handlers } : handlers;

  let isPointerDown = false;
  let lastTapTime = 0;
  let continuousInterval: ReturnType<typeof setInterval> | null = null;
  let currentTargetCell: Cell | null = null;

  const pickCurrentCell = (): Cell | null => {
    const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m.isPickable && m.isEnabled());
    if (!pick.hit || !pick.pickedPoint) return null;
    return worldToCell(pick.pickedPoint.x, pick.pickedPoint.z);
  };

  const observer = scene.onPointerObservable.add((info) => {
    if (info.type === PointerEventTypes.POINTERDOWN) {
      isPointerDown = true;
      const cell = pickCurrentCell();
      if (cell) {
        currentTargetCell = cell;
        const now = Date.now();
        if (now - lastTapTime < 300) {
          h.onDoubleTap?.(cell);
        }
        lastTapTime = now;
      }
      continuousInterval ??= setInterval(() => {
        if (isPointerDown && currentTargetCell) {
          h.onTap(currentTargetCell);
        }
      }, 300);
    } else if (info.type === PointerEventTypes.POINTERUP) {
      isPointerDown = false;
      currentTargetCell = null;
      if (continuousInterval) {
        clearInterval(continuousInterval);
        continuousInterval = null;
      }
    } else if (info.type === PointerEventTypes.POINTERTAP) {
      const cell = pickCurrentCell();
      if (cell) h.onTap(cell);
    } else if (info.type === PointerEventTypes.POINTERMOVE) {
      const cell = pickCurrentCell();
      if (isPointerDown && cell) {
        currentTargetCell = cell;
      }
      h.onHover?.(cell);
    }
  });

  return () => {
    if (continuousInterval) clearInterval(continuousInterval);
    scene.onPointerObservable.remove(observer);
  };
};

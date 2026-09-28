import type { Cell } from '../core/types';
import { worldToCell } from '../core/world';
import { PointerEventTypes, type Scene } from './babylon';

/** Converts taps/clicks on the island into grid cells. Drags (camera orbit) are ignored. */
export const attachPicker = (scene: Scene, onCell: (cell: Cell) => void): (() => void) => {
  const observer = scene.onPointerObservable.add((info) => {
    if (info.type !== PointerEventTypes.POINTERTAP) return;
    const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m.isPickable && m.isEnabled());
    if (!pick.hit || !pick.pickedPoint) return;
    onCell(worldToCell(pick.pickedPoint.x, pick.pickedPoint.z));
  });
  return () => scene.onPointerObservable.remove(observer);
};

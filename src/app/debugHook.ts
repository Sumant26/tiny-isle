import type { Cell } from '../core/types';
import { cellToWorld, tileIndexToCell } from '../core/world';
import { Matrix, Vector3 } from '../render/babylon';
import { GROUND_Y } from '../render/SceneContext';
import { actions } from '../state/actions';
import type { Game } from './Game';

export interface DebugHook {
  readonly game: Game;
  readonly actions: typeof actions;
  clickCell(cell: Cell): Promise<string>;
  clickTile(index: number): Promise<string>;
  /** CSS-pixel position of a cell on the canvas, so e2e tests can click the real 3D scene. */
  projectCell(cell: Cell): { x: number; y: number } | null;
  /** Finishes pending tweens (pop-ins, fades) and renders one frame. For screenshot tests. */
  settle(seconds?: number): void;
}

/**
 * Exposes the game on `window.__tinyIsle` in development and e2e builds only.
 * End-to-end tests drive the real input pipeline through this instead of
 * guessing pixel positions on a 3D canvas.
 */
export const installDebugHook = (
  game: Game,
  target: Record<string, unknown> = window as unknown as Record<string, unknown>,
): DebugHook => {
  const hook: DebugHook = {
    game,
    actions,
    clickCell: (cell) => game.controller.clickCell(cell),
    clickTile: (index) => game.controller.clickCell(tileIndexToCell(index)),
    projectCell: (cell) => {
      const { scene, engine } = game.ctx;
      const camera = scene.activeCamera;
      if (!camera) return null;
      const w = cellToWorld(cell);
      const p = Vector3.Project(
        new Vector3(w.x, GROUND_Y + 0.05, w.z),
        Matrix.Identity(),
        scene.getTransformMatrix(),
        camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight()),
      );
      const scale = engine.getHardwareScalingLevel();
      return { x: p.x * scale, y: p.y * scale };
    },
    settle: (seconds = 2) => {
      game.ctx.tweener.update(seconds);
      game.ctx.scene.render();
    },
  };
  target.__tinyIsle = hook;
  return hook;
};

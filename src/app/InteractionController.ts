import { findPath, findPathToNeighbor, type WalkableFn } from '../core/pathfinding';
import type { Cell, ToolId } from '../core/types';
import { cellToTileIndex, inRect, isMarketCell, isWalkable, LAYOUT, sameCell } from '../core/world';
import type { Mover } from '../render/views/PlayerView';
import { actions } from '../state/actions';
import type { Store } from '../state/store';

export type ClickResult =
  'used' | 'walked' | 'shop' | 'visitor' | 'ignored' | 'cancelled' | 'unreachable';

const GESTURE: Record<ToolId, 'dig' | 'plant' | 'water' | 'pick'> = {
  hoe: 'dig',
  seeds: 'plant',
  water: 'water',
  basket: 'pick',
};

export interface InteractionDeps {
  store: Store;
  mover: Mover;
  walkable?: WalkableFn;
  onOpenShop?: () => void;
  onVisitor?: () => void;
  onCottage?: () => void;
  onPond?: () => void;
  onPetCat?: () => void;
}

/**
 * Turns player intent (click a cell, press a key) into walking + actions.
 * Only one intent runs at a time; a new click cancels the current walk.
 */
export class InteractionController {
  private current: AbortController | null = null;
  private readonly walkable: WalkableFn;

  constructor(private readonly deps: InteractionDeps) {
    this.walkable = deps.walkable ?? isWalkable;
  }

  cancel(): void {
    this.current?.abort();
    this.current = null;
  }

  private begin(): AbortSignal {
    this.cancel();
    this.current = new AbortController();
    return this.current.signal;
  }

  private async walkPath(path: Cell[], signal: AbortSignal): Promise<boolean> {
    const { store, mover } = this.deps;
    return mover.walk(path, { signal, onStep: (cell) => store.dispatch(actions.move(cell)) });
  }

  private async useTile(index: number, signal: AbortSignal): Promise<ClickResult> {
    if (signal.aborted) return 'cancelled';
    const { store, mover } = this.deps;
    const tool = store.getState().selectedTool;
    const events = store.dispatch(actions.useTile(index));
    if (events.some((e) => e.type !== 'rejected')) await mover.act(GESTURE[tool]);
    return 'used';
  }

  async clickCell(cell: Cell): Promise<ClickResult> {
    const signal = this.begin();
    const { store } = this.deps;
    const player = store.getState().player;

    if (isMarketCell(cell)) return this.goToMarket(signal);

    // Cottage Kitchen
    if (inRect(cell, LAYOUT.cottage)) {
      const path = findPathToNeighbor(player, cell, this.walkable);
      if (!path) return 'unreachable';
      if (!(await this.walkPath(path, signal))) return 'cancelled';
      this.deps.onCottage?.();
      return 'shop';
    }

    // Pond Fishing
    if (inRect(cell, LAYOUT.pond)) {
      const path = findPathToNeighbor(player, cell, this.walkable);
      if (!path) return 'unreachable';
      if (!(await this.walkPath(path, signal))) return 'cancelled';
      this.deps.onPond?.();
      return 'shop';
    }

    // Pet the cat if clicked near player / cat
    if (Math.hypot(cell.x - player.x, cell.z - player.z) <= 1.8) {
      this.deps.onPetCat?.();
    }

    const visitor = store.getState().visitor;
    if (visitor && sameCell(cell, LAYOUT.visitorSpot)) {
      const path = findPathToNeighbor(player, cell, this.walkable);
      if (!path) return 'unreachable';
      if (!(await this.walkPath(path, signal))) return 'cancelled';
      this.deps.onVisitor?.();
      return 'visitor';
    }

    if (!this.walkable(cell)) return 'ignored';
    const path = findPath(player, cell, this.walkable);
    if (!path) return 'unreachable';
    if (!(await this.walkPath(path, signal))) return 'cancelled';

    const index = cellToTileIndex(cell);
    return index >= 0 ? this.useTile(index, signal) : 'walked';
  }

  async goToMarket(signal: AbortSignal = this.begin()): Promise<ClickResult> {
    const { store } = this.deps;
    const path = findPath(store.getState().player, LAYOUT.marketFront, this.walkable);
    if (!path) return 'unreachable';
    if (!(await this.walkPath(path, signal))) return 'cancelled';
    this.deps.onOpenShop?.();
    return 'shop';
  }

  /** One grid step (keyboard). */
  async step(dx: number, dz: number): Promise<ClickResult> {
    const signal = this.begin();
    const p = this.deps.store.getState().player;
    const to = { x: p.x + dx, z: p.z + dz };
    if (!this.walkable(to)) return 'ignored';
    return (await this.walkPath([to], signal)) ? 'walked' : 'cancelled';
  }

  /** Use the selected tool on the tile the player is standing on (keyboard). */
  async useHere(): Promise<ClickResult> {
    const signal = this.begin();
    const index = cellToTileIndex(this.deps.store.getState().player);
    return index >= 0 ? this.useTile(index, signal) : 'ignored';
  }
}

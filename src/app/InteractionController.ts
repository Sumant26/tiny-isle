import { findPath, findPathToNeighbor, type WalkableFn } from '../core/pathfinding';
import type { Cell, PetId, ToolId } from '../core/types';
import {
  cellToTileIndex,
  inRect,
  isBridgeOrIslet,
  isMarketCell,
  isWalkable,
  LAYOUT,
  sameCell,
} from '../core/world';
import type { Mover } from '../render/views/PlayerView';
import { actions } from '../state/actions';
import type { Store } from '../state/store';

export type ClickResult =
  | 'used'
  | 'walked'
  | 'shop'
  | 'visitor'
  | 'ignored'
  | 'cancelled'
  | 'unreachable'
  | 'pet'
  | 'harvest';

const GESTURE: Record<ToolId, 'dig' | 'plant' | 'water' | 'pick'> = {
  hoe: 'dig',
  seeds: 'plant',
  water: 'water',
  basket: 'pick',
};

const PET_SPOTS: Record<Exclude<PetId, 'cat'>, Cell> = {
  puppy: { x: 10, z: 9 },
  bunny: { x: 12, z: 6 },
  duckling: { x: 2, z: 8 },
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
  onPetPet?: (pet: PetId) => void;
  onHarvestOrchard?: () => void;
  onLockedIslet?: () => void;
}

/**
 * Turns player intent (click a cell, press a key) into walking + actions.
 * Only one intent runs at a time; a new click cancels the current walk.
 */
export class InteractionController {
  private current: AbortController | null = null;

  constructor(private readonly deps: InteractionDeps) {}

  private get walkable(): WalkableFn {
    return (
      this.deps.walkable ??
      ((cell: Cell) => isWalkable(cell, this.deps.store.getState().isletUnlocked))
    );
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
    const state = store.getState();
    const player = state.player;
    const plotHeight = state.plot.height;
    const index = cellToTileIndex(cell, plotHeight);

    // Farming on plot tiles has priority
    if (index >= 0) {
      if (!this.walkable(cell)) return 'ignored';
      const path = findPath(player, cell, this.walkable);
      if (!path) return 'unreachable';
      if (!(await this.walkPath(path, signal))) return 'cancelled';
      return this.useTile(index, signal);
    }

    if (isMarketCell(cell)) return this.goToMarket(signal);

    // Cottage Kitchen / Cozy House
    if (inRect(cell, LAYOUT.cottage)) {
      const path =
        findPath(player, { x: 4, z: 3 }, this.walkable) ??
        findPathToNeighbor(player, cell, this.walkable);
      if (!path) return 'unreachable';
      if (!(await this.walkPath(path, signal))) return 'cancelled';
      this.deps.onCottage?.();
      return 'shop';
    }

    // Check Petting for adopted puppy, bunny, duckling or companion cat
    const ownedPets = state.pets ?? ['cat'];
    for (const petId of ownedPets) {
      if (petId === 'cat') {
        if (Math.hypot(cell.x - player.x, cell.z - player.z) <= 1.2) {
          if (this.deps.onPetPet) this.deps.onPetPet('cat');
          else this.deps.onPetCat?.();
          return 'pet';
        }
      } else {
        const spot = PET_SPOTS[petId];
        if (Math.hypot(cell.x - spot.x, cell.z - spot.z) <= 1.5) {
          if (this.deps.onPetPet) this.deps.onPetPet(petId);
          return 'pet';
        }
      }
    }

    // Pond Fishing
    if (inRect(cell, LAYOUT.pond)) {
      const path = findPathToNeighbor(player, cell, this.walkable);
      if (!path) return 'unreachable';
      if (!(await this.walkPath(path, signal))) return 'cancelled';
      this.deps.onPond?.();
      return 'shop';
    }

    // Orchard Islet click
    if (isBridgeOrIslet(cell)) {
      if (!state.isletUnlocked) {
        const path =
          findPath(player, { x: 12, z: 1 }, this.walkable) ??
          findPath(player, { x: 12, z: 2 }, this.walkable);
        if (path) await this.walkPath(path, signal);
        this.deps.onLockedIslet?.();
        return 'ignored';
      }

      // Check clicking near orchard trees to harvest
      const nearTree = LAYOUT.orchardTrees.some(
        (t) => Math.hypot(cell.x - t.cell.x, cell.z - t.cell.z) <= 1.5,
      );
      if (nearTree && this.deps.onHarvestOrchard) {
        const path = findPathToNeighbor(player, cell, this.walkable);
        if (path && (await this.walkPath(path, signal))) {
          this.deps.onHarvestOrchard();
          return 'harvest';
        }
      }
    }

    const visitor = state.visitor;
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

    return 'walked';
  }

  async goToCottage(signal: AbortSignal = this.begin()): Promise<ClickResult> {
    const { store } = this.deps;
    const player = store.getState().player;
    const path =
      findPath(player, { x: 4, z: 3 }, this.walkable) ??
      findPathToNeighbor(player, { x: 3, z: 2 }, this.walkable);
    if (!path) {
      this.deps.onCottage?.();
      return 'shop';
    }
    if (!(await this.walkPath(path, signal))) return 'cancelled';
    this.deps.onCottage?.();
    return 'shop';
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
    const state = this.deps.store.getState();
    const index = cellToTileIndex(state.player, state.plot.height);
    return index >= 0 ? this.useTile(index, signal) : 'ignored';
  }
}

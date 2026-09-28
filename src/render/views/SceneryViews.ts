import type { DecorationId, VisitorId } from '../../core/types';
import { cellToWorld, LAYOUT } from '../../core/world';
import { selectDecorations, selectVisitor } from '../../state/selectors';
import type { Store } from '../../state/store';
import { CreateCylinder, CreateSphere, TransformNode } from '../babylon';
import { buildVisitor } from '../builders/characters';
import { buildDecoration } from '../builders/decorations';
import { PALETTE } from '../palette';
import { GROUND_Y, type SceneContext } from '../SceneContext';
import { easings } from '../tween';

/** Shows owned decorations in their fixed slots. */
export class DecorationView {
  private readonly nodes = new Map<DecorationId, TransformNode>();
  private readonly unsubscribe: () => void;

  constructor(
    private readonly ctx: SceneContext,
    store: Store,
  ) {
    this.unsubscribe = store.select(selectDecorations, (list) => this.sync(list, true), {
      fireImmediately: false,
    });
    this.sync(selectDecorations(store.getState()), false);
  }

  private sync(list: readonly DecorationId[], animate: boolean): void {
    for (const id of list) {
      if (this.nodes.has(id)) continue;
      const node = buildDecoration(this.ctx, id);
      const w = cellToWorld(LAYOUT.decorationSlots[id]);
      node.position.set(w.x, GROUND_Y, w.z);
      this.nodes.set(id, node);
      if (animate) {
        this.ctx.tweener.tween({
          duration: 0.5,
          ease: easings.outBack,
          onUpdate: (t) => node.scaling.setAll(Math.max(0.01, t)),
        });
      }
    }
    for (const [id, node] of this.nodes) {
      if (!list.includes(id)) {
        node.dispose();
        this.nodes.delete(id);
      }
    }
  }

  has(id: DecorationId): boolean {
    return this.nodes.has(id);
  }

  dispose(): void {
    this.unsubscribe();
    for (const n of this.nodes.values()) n.dispose();
    this.nodes.clear();
  }
}

/** Shows the current visitor with a bobbing marker above their head. */
export class VisitorView {
  private node: TransformNode | null = null;
  private current: VisitorId | null = null;
  private readonly unsubscribe: () => void;
  private readonly observer;
  private time = 0;

  constructor(
    private readonly ctx: SceneContext,
    store: Store,
  ) {
    this.sync(selectVisitor(store.getState())?.id ?? null);
    this.unsubscribe = store.select(
      (s) => selectVisitor(s)?.id ?? null,
      (id) => this.sync(id),
    );
    this.observer = ctx.scene.onBeforeRenderObservable.add(() => {
      this.time += ctx.frameDelta();
      const marker = this.node?.getChildren((n) => n.name === 'marker', false)[0] as
        TransformNode | undefined;
      if (marker) marker.position.y = 1.9 + Math.sin(this.time * 3) * 0.08;
    });
  }

  get visitor(): VisitorId | null {
    return this.current;
  }

  private sync(id: VisitorId | null): void {
    if (id === this.current) return;
    this.node?.dispose();
    this.node = null;
    this.current = id;
    if (!id) return;
    const node = buildVisitor(this.ctx, id);
    const w = cellToWorld(LAYOUT.visitorSpot);
    node.position.set(w.x, GROUND_Y, w.z);
    node.rotation.y = Math.PI * 0.8;
    const marker = new TransformNode('marker', this.ctx.scene);
    marker.parent = node;
    const glow = this.ctx.material(PALETTE.petal, '#8A6A10');
    this.ctx.shape(CreateCylinder('bang', { diameter: 0.1, height: 0.3 }, this.ctx.scene), glow, {
      parent: marker,
      castShadow: false,
    }).position.y = 0.12;
    this.ctx.shape(CreateSphere('dot', { diameter: 0.11 }, this.ctx.scene), glow, {
      parent: marker,
      castShadow: false,
    }).position.y = -0.12;
    this.node = node;
  }

  dispose(): void {
    this.unsubscribe();
    this.ctx.scene.onBeforeRenderObservable.remove(this.observer);
    this.node?.dispose();
  }
}

import type { DecorationId, VisitorId } from '../../core/types';
import { cellToWorld, LAYOUT } from '../../core/world';
import { selectDecorations, selectVisitor } from '../../state/selectors';
import type { Store } from '../../state/store';
import { CreateCylinder, CreateSphere, TransformNode } from '../babylon';
import { buildPet, buildVisitor } from '../builders/characters';
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

/** Shows interactive wild forage items (mushrooms, berries, seashells, wildflowers). */
export class ForageView {
  private readonly nodes = new Map<string, TransformNode>();
  private readonly unsubscribe: () => void;
  private readonly observer;
  private time = 0;

  constructor(
    private readonly ctx: SceneContext,
    store: Store,
  ) {
    this.sync(store.getState().forageNodes ?? []);
    this.unsubscribe = store.select(
      (s) => s.forageNodes ?? [],
      (list) => this.sync(list),
    );
    this.observer = ctx.scene.onBeforeRenderObservable.add(() => {
      this.time += ctx.frameDelta();
      for (const node of this.nodes.values()) {
        node.position.y = GROUND_Y + 0.05 + Math.sin(this.time * 2.5 + node.uniqueId) * 0.03;
      }
    });
  }

  private sync(
    list: readonly {
      readonly id: string;
      readonly type: string;
      readonly cell: { readonly x: number; readonly z: number };
    }[],
  ): void {
    const activeIds = new Set(list.map((n) => n.id));
    for (const item of list) {
      if (this.nodes.has(item.id)) continue;
      const root = new TransformNode(`forage_${item.id}`, this.ctx.scene);
      const w = cellToWorld(item.cell);
      root.position.set(w.x, GROUND_Y + 0.05, w.z);

      const o = { parent: root, castShadow: false };
      if (item.type === 'mushroom') {
        this.ctx.shape(
          CreateCylinder('stem', { diameter: 0.08, height: 0.16 }, this.ctx.scene),
          '#F4EDE0',
          o,
        ).position.y = 0.08;
        this.ctx.shape(
          CreateSphere(
            'cap',
            { diameterX: 0.25, diameterY: 0.15, diameterZ: 0.25 },
            this.ctx.scene,
          ),
          '#E63946',
          o,
        ).position.y = 0.18;
      } else if (item.type === 'berry') {
        this.ctx.shape(
          CreateSphere('bush', { diameter: 0.32 }, this.ctx.scene),
          PALETTE.leaf,
          o,
        ).position.y = 0.12;
        const berryCoords: readonly (readonly [number, number, number])[] = [
          [0.08, 0.18, 0.08],
          [-0.08, 0.16, 0.06],
          [0, 0.22, -0.05],
        ];
        for (const [bx, by, bz] of berryCoords) {
          this.ctx
            .shape(CreateSphere('berry', { diameter: 0.09 }, this.ctx.scene), '#4361EE', o)
            .position.set(bx, by, bz);
        }
      } else if (item.type === 'seashell') {
        this.ctx.shape(
          CreateSphere(
            'shell',
            { diameterX: 0.22, diameterY: 0.08, diameterZ: 0.2 },
            this.ctx.scene,
          ),
          '#F1FAEE',
          o,
        ).position.y = 0.05;
        this.ctx.shape(
          CreateSphere(
            'shellInner',
            { diameterX: 0.14, diameterY: 0.06, diameterZ: 0.14 },
            this.ctx.scene,
          ),
          '#FFB703',
          o,
        ).position.y = 0.07;
      } else {
        // Wildflower
        this.ctx.shape(
          CreateCylinder('stem', { diameter: 0.04, height: 0.2 }, this.ctx.scene),
          PALETTE.leafLight,
          o,
        ).position.y = 0.1;
        this.ctx.shape(
          CreateSphere('bloom', { diameter: 0.18 }, this.ctx.scene),
          '#F72585',
          o,
        ).position.y = 0.22;
      }

      this.nodes.set(item.id, root);
    }
    for (const [id, node] of this.nodes) {
      if (!activeIds.has(id)) {
        node.dispose();
        this.nodes.delete(id);
      }
    }
  }

  dispose(): void {
    this.unsubscribe();
    this.ctx.scene.onBeforeRenderObservable.remove(this.observer);
    for (const n of this.nodes.values()) n.dispose();
    this.nodes.clear();
  }
}

/** Shows adopted pets (Cat, Puppy, Bunny, Duckling) playing around the island. */
export class PetsView {
  private readonly petNodes = new Map<string, TransformNode>();
  private readonly unsubscribe: () => void;
  private readonly observer;
  private time = 0;

  constructor(
    private readonly ctx: SceneContext,
    store: Store,
  ) {
    this.sync(store.getState().pets ?? ['cat']);
    this.unsubscribe = store.select(
      (s) => s.pets ?? ['cat'],
      (pets) => this.sync(pets),
    );
    this.observer = ctx.scene.onBeforeRenderObservable.add(() => {
      this.time += ctx.frameDelta();
      const t = this.time;
      const puppy = this.petNodes.get('puppy');
      if (puppy) {
        puppy.position.x = 2.5 + Math.sin(t * 0.8) * 1.2;
        puppy.position.z = 1.8 + Math.cos(t * 0.8) * 1.2;
        puppy.rotation.y = t * 0.8 + Math.PI / 2;
      }
      const bunny = this.petNodes.get('bunny');
      if (bunny) {
        bunny.position.y = GROUND_Y + Math.abs(Math.sin(t * 3)) * 0.12;
      }
      const duck = this.petNodes.get('duckling');
      if (duck) {
        duck.position.x = -5.0 + Math.sin(t * 0.6) * 0.6;
        duck.position.z = 2.5 + Math.cos(t * 0.6) * 0.6;
        duck.rotation.y = t * 0.6;
      }
    });
  }

  private sync(pets: readonly string[]): void {
    const active = new Set(pets);
    const petSpots: Record<string, { x: number; z: number }> = {
      cat: { x: -2.0, z: -4.5 },
      puppy: { x: 2.5, z: 1.8 },
      bunny: { x: 4.5, z: -1.5 },
      duckling: { x: -5.0, z: 2.5 },
    };

    for (const p of pets) {
      if (this.petNodes.has(p)) continue;
      const node = new TransformNode(`pet_${p}`, this.ctx.scene);
      const spot = petSpots[p] ?? { x: 0, z: 0 };
      node.position.set(spot.x, GROUND_Y, spot.z);

      // Procedural mesh
      const mesh = buildPet(this.ctx, p);
      mesh.parent = node;
      this.petNodes.set(p, node);
    }

    for (const [p, node] of this.petNodes) {
      if (!active.has(p)) {
        node.dispose();
        this.petNodes.delete(p);
      }
    }
  }

  /** Plays a happy jump reaction when the pet is petted. */
  async petReact(pet: string): Promise<void> {
    const node = this.petNodes.get(pet);
    if (!node) return;
    const origY = node.position.y;
    await this.ctx.tweener.tween({
      duration: 0.35,
      ease: easings.outBack,
      onUpdate: (k) => {
        node.position.y = origY + Math.sin(k * Math.PI) * 0.3;
        node.rotation.y += 0.25;
      },
    }).promise;
    node.position.y = origY;
  }

  dispose(): void {
    this.unsubscribe();
    this.ctx.scene.onBeforeRenderObservable.remove(this.observer);
    for (const n of this.petNodes.values()) n.dispose();
    this.petNodes.clear();
  }
}

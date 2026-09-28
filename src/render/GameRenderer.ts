import type { Cell } from '../core/types';
import { cellToWorld } from '../core/world';
import type { Store } from '../state/store';
import { selectPlayer } from '../state/selectors';
import { buildEnvironment } from './builders/environment';
import { createCamera } from './CameraRig';
import { Effects } from './Effects';
import { LightingController, type TimeOfDay } from './LightingController';
import { attachPicker } from './Picker';
import type { SceneContext } from './SceneContext';
import { AmbientView } from './views/AmbientView';
import { PlayerView } from './views/PlayerView';
import { PlotView } from './views/PlotView';
import { DecorationView, VisitorView } from './views/SceneryViews';

export interface GameRenderer {
  readonly player: PlayerView;
  readonly plot: PlotView;
  readonly lighting: LightingController;
  readonly ambient: AmbientView;
  readonly decorations: DecorationView;
  readonly visitor: VisitorView;
  readonly effects: Effects;
  onCellPicked(handler: (cell: Cell) => void): void;
  setTimeOfDay(time: TimeOfDay, animate?: boolean): Promise<void>;
  dispose(): void;
}

export interface RendererOptions {
  canvas: HTMLCanvasElement | null;
  random?: () => number;
}

/** Composition root for everything visual. Views subscribe to the store themselves. */
export const createGameRenderer = (
  ctx: SceneContext,
  store: Store,
  { canvas, random = Math.random }: RendererOptions,
): GameRenderer => {
  createCamera(ctx.scene, canvas);
  const env = buildEnvironment(ctx, random);
  const plot = new PlotView(ctx, store);
  const player = new PlayerView(ctx, selectPlayer(store.getState()));
  const decorations = new DecorationView(ctx, store);
  const visitor = new VisitorView(ctx, store);
  const ambient = new AmbientView(
    ctx,
    store,
    function* () {
      yield* plot.swaying;
      yield* env.swaying;
    },
    random,
  );
  const lighting = new LightingController(ctx, env.lampLight, env.lamp, env.cottageWindow, (t) =>
    ambient.setNight(t === 'dusk'),
  );
  const effects = new Effects(ctx, random);
  const offEvents = store.onEvent((e) => effects.handle(e));

  let pickHandler: (cell: Cell) => void = () => undefined;
  const detachPicker = attachPicker(ctx.scene, (cell) => pickHandler(cell));

  // Snap the farmer if state is replaced wholesale (loading a save / new game).
  const offLoad = store.select(selectPlayer, (p) => {
    const cur = player.position;
    const target = cellToWorld(p);
    if (Math.hypot(cur.x - target.x, cur.z - target.z) > 1.5) player.place(p);
  });

  return {
    player,
    plot,
    lighting,
    ambient,
    decorations,
    visitor,
    effects,
    onCellPicked: (h) => {
      pickHandler = h;
    },
    setTimeOfDay: async (time, animate = true) => {
      if (animate) await lighting.transitionTo(time);
      else lighting.set(time);
    },
    dispose: () => {
      offEvents();
      offLoad();
      detachPicker();
      ambient.dispose();
      visitor.dispose();
      decorations.dispose();
      player.dispose();
      plot.dispose();
    },
  };
};

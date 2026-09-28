import type { DecorationId } from '../../core/types';
import { CreateBox, CreateCylinder, CreateSphere, CreateTorus, TransformNode } from '../babylon';
import { PALETTE } from '../palette';
import type { SceneContext } from '../SceneContext';

type Builder = (ctx: SceneContext, root: TransformNode) => void;

const BUILDERS: Record<DecorationId, Builder> = {
  flowerbed: ({ scene, shape }, root) => {
    shape(CreateBox('bed', { width: 0.9, depth: 0.6, height: 0.2 }, scene), PALETTE.woodLight, {
      parent: root,
    }).position.y = 0.1;
    PALETTE.flowers.forEach((hex, i) => {
      shape(CreateSphere('bloom', { diameter: 0.18 }, scene), hex, { parent: root }).position.set(
        -0.3 + i * 0.2,
        0.28,
        (i % 2) * 0.15 - 0.07,
      );
    });
  },
  bench: ({ scene, shape }, root) => {
    shape(CreateBox('seat', { width: 1.1, depth: 0.4, height: 0.08 }, scene), PALETTE.wood, {
      parent: root,
    }).position.y = 0.38;
    shape(CreateBox('back', { width: 1.1, depth: 0.06, height: 0.35 }, scene), PALETTE.wood, {
      parent: root,
    }).position.set(0, 0.6, -0.18);
    for (const x of [-0.45, 0.45]) {
      shape(CreateBox('leg', { width: 0.08, depth: 0.35, height: 0.36 }, scene), PALETTE.woodDark, {
        parent: root,
      }).position.set(x, 0.18, 0);
    }
  },
  birdbath: ({ scene, shape }, root) => {
    shape(
      CreateCylinder('pedestal', { diameterTop: 0.15, diameterBottom: 0.3, height: 0.6 }, scene),
      PALETTE.stoneGrey,
      { parent: root },
    ).position.y = 0.3;
    shape(
      CreateCylinder('bowl', { diameterTop: 0.7, diameterBottom: 0.4, height: 0.15 }, scene),
      PALETTE.stoneGrey,
      { parent: root },
    ).position.y = 0.66;
    shape(CreateCylinder('bathWater', { diameter: 0.58, height: 0.02 }, scene), PALETTE.water, {
      parent: root,
    }).position.y = 0.73;
  },
  windchime: ({ scene, shape }, root) => {
    shape(CreateCylinder('pole', { diameter: 0.06, height: 1.6 }, scene), PALETTE.bark, {
      parent: root,
    }).position.y = 0.8;
    shape(CreateTorus('ring', { diameter: 0.35, thickness: 0.04 }, scene), PALETTE.hat, {
      parent: root,
    }).position.y = 1.55;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      shape(CreateCylinder('chime', { diameter: 0.04, height: 0.3 }, scene), PALETTE.can, {
        parent: root,
      }).position.set(Math.cos(a) * 0.15, 1.35, Math.sin(a) * 0.15);
    }
  },
  gnome: ({ scene, shape }, root) => {
    shape(
      CreateCylinder('gnomeBody', { diameterTop: 0.2, diameterBottom: 0.34, height: 0.35 }, scene),
      PALETTE.overalls,
      { parent: root },
    ).position.y = 0.18;
    shape(CreateSphere('gnomeHead', { diameter: 0.22 }, scene), PALETTE.skin, {
      parent: root,
    }).position.y = 0.44;
    shape(
      CreateSphere('gnomeBeard', { diameterX: 0.2, diameterY: 0.18, diameterZ: 0.1 }, scene),
      PALETTE.beard,
      { parent: root },
    ).position.set(0, 0.38, 0.09);
    shape(
      CreateCylinder(
        'gnomeHat',
        { diameterTop: 0, diameterBottom: 0.24, height: 0.32, tessellation: 16 },
        scene,
      ),
      PALETTE.gnomeHat,
      { parent: root },
    ).position.y = 0.66;
  },
};

export const buildDecoration = (ctx: SceneContext, id: DecorationId): TransformNode => {
  const root = ctx.model(`decoration/${id}`, () => {
    const proc = new TransformNode(`decoration_${id}`, ctx.scene);
    BUILDERS[id](ctx, proc);
    return proc;
  });
  root.metadata = { decoration: id };
  return root;
};

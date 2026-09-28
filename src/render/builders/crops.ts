import type { CropId, CropStage } from '../../core/types';
import { CreateBox, CreateCylinder, CreateSphere, TransformNode } from '../babylon';
import { PALETTE } from '../palette';
import type { SceneContext } from '../SceneContext';

type Builder = (ctx: SceneContext, node: TransformNode) => void;

const sprout: Builder = ({ scene, shape }, node) => {
  const o = { parent: node };
  shape(
    CreateCylinder('stem', { diameter: 0.06, height: 0.25 }, scene),
    PALETTE.stem,
    o,
  ).position.y = 0.12;
  const l1 = shape(
    CreateSphere('leaf', { diameterX: 0.28, diameterY: 0.08, diameterZ: 0.14 }, scene),
    PALETTE.sprout,
    o,
  );
  l1.position.set(-0.1, 0.25, 0);
  l1.rotation.z = 0.4;
  const l2 = shape(
    CreateSphere('leaf', { diameterX: 0.28, diameterY: 0.08, diameterZ: 0.14 }, scene),
    PALETTE.sproutLight,
    o,
  );
  l2.position.set(0.1, 0.25, 0);
  l2.rotation.z = -0.4;
};

const seedMound: Builder = ({ scene, shape }, node) => {
  shape(
    CreateSphere('mound', { diameterX: 0.3, diameterY: 0.1, diameterZ: 0.3, segments: 8 }, scene),
    PALETTE.soilWetFurrow,
    { parent: node, castShadow: false },
  );
};

const leafyTop = (ctx: SceneContext, node: TransformNode, height: number): void => {
  for (let i = 0; i < 3; i++) {
    const l = ctx.shape(
      CreateCylinder('frond', { diameterTop: 0.02, diameterBottom: 0.07, height }, ctx.scene),
      PALETTE.stem,
      { parent: node },
    );
    l.position.set((i - 1) * 0.07, height / 2 + 0.15, 0);
    l.rotation.z = (i - 1) * 0.35;
  }
};

const bush = (ctx: SceneContext, node: TransformNode, d: number, hex: string, y: number): void => {
  ctx.shape(CreateSphere('bush', { diameter: d, segments: 12 }, ctx.scene), hex, {
    parent: node,
  }).position.y = y;
};

const RIPE: Record<CropId, Builder> = {
  carrot: (ctx, node) => {
    ctx.shape(
      CreateCylinder('carrot', { diameterTop: 0.34, diameterBottom: 0.1, height: 0.3 }, ctx.scene),
      PALETTE.carrot,
      { parent: node },
    ).position.y = 0.05;
    leafyTop(ctx, node, 0.42);
  },
  tomato: (ctx, node) => {
    bush(ctx, node, 0.72, PALETTE.tomatoBush, 0.42);
    const fruit: [number, number, number][] = [
      [0.26, 0.5, 0.18],
      [-0.22, 0.36, 0.24],
      [0.05, 0.62, -0.27],
      [-0.18, 0.58, -0.12],
      [0.22, 0.28, -0.2],
    ];
    for (const p of fruit)
      ctx
        .shape(CreateSphere('tomato', { diameter: 0.2 }, ctx.scene), PALETTE.tomato, {
          parent: node,
        })
        .position.set(...p);
  },
  strawberry: (ctx, node) => {
    ctx.shape(
      CreateSphere(
        'leaves',
        { diameterX: 0.8, diameterY: 0.3, diameterZ: 0.8, segments: 12 },
        ctx.scene,
      ),
      PALETTE.strawberryLeaf,
      { parent: node },
    ).position.y = 0.12;
    const berries: [number, number, number][] = [
      [0.22, 0.2, 0.2],
      [-0.2, 0.2, -0.12],
      [0.05, 0.24, -0.28],
    ];
    for (const p of berries)
      ctx
        .shape(
          CreateCylinder(
            'berry',
            { diameterTop: 0.16, diameterBottom: 0.04, height: 0.16 },
            ctx.scene,
          ),
          PALETTE.strawberry,
          { parent: node },
        )
        .position.set(...p);
  },
  sunflower: (ctx, node) => {
    const { scene, shape } = ctx;
    shape(CreateCylinder('stalk', { diameter: 0.08, height: 1.1 }, scene), PALETTE.stem, {
      parent: node,
    }).position.y = 0.55;
    const head = new TransformNode('head', scene);
    head.parent = node;
    head.position.y = 1.15;
    head.rotation.x = -0.5;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const p = shape(
        CreateSphere('petal', { diameterX: 0.2, diameterY: 0.05, diameterZ: 0.1 }, scene),
        PALETTE.petal,
        { parent: head },
      );
      p.position.set(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2);
      p.rotation.y = -a;
    }
    shape(CreateCylinder('seeds', { diameter: 0.24, height: 0.08 }, scene), PALETTE.seedHead, {
      parent: head,
    }).position.y = 0.02;
  },
  pumpkin: (ctx, node) => {
    const { scene, shape } = ctx;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const lobe = shape(
        CreateSphere(
          'lobe',
          { diameterX: 0.34, diameterY: 0.42, diameterZ: 0.5, segments: 10 },
          scene,
        ),
        PALETTE.pumpkin,
        { parent: node },
      );
      lobe.position.set(Math.cos(a) * 0.14, 0.2, Math.sin(a) * 0.14);
      lobe.rotation.y = -a;
    }
    shape(CreateBox('stalk', { width: 0.06, depth: 0.06, height: 0.14 }, scene), PALETTE.bark, {
      parent: node,
    }).position.y = 0.45;
    shape(
      CreateSphere('leaf', { diameterX: 0.4, diameterY: 0.05, diameterZ: 0.25 }, scene),
      PALETTE.pumpkinLeaf,
      { parent: node },
    ).position.set(0.3, 0.05, 0.25);
  },
};

const GROWING: Record<CropId, Builder> = {
  carrot: (ctx, node) => leafyTop(ctx, node, 0.3),
  tomato: (ctx, node) => bush(ctx, node, 0.5, PALETTE.tomatoBush, 0.3),
  strawberry: (ctx, node) =>
    (ctx.shape(
      CreateSphere(
        'leaves',
        { diameterX: 0.55, diameterY: 0.22, diameterZ: 0.55, segments: 10 },
        ctx.scene,
      ),
      PALETTE.strawberryLeaf,
      { parent: node },
    ).position.y = 0.1),
  sunflower: (ctx, node) => {
    ctx.shape(CreateCylinder('stalk', { diameter: 0.07, height: 0.7 }, ctx.scene), PALETTE.stem, {
      parent: node,
    }).position.y = 0.35;
    ctx.shape(CreateSphere('bud', { diameter: 0.18 }, ctx.scene), PALETTE.sprout, {
      parent: node,
    }).position.y = 0.75;
  },
  pumpkin: (ctx, node) => {
    bush(ctx, node, 0.45, PALETTE.pumpkinLeaf, 0.18);
    ctx
      .shape(CreateSphere('babyPumpkin', { diameter: 0.18 }, ctx.scene), PALETTE.pumpkinLeaf, {
        parent: node,
      })
      .position.set(0.2, 0.1, 0.15);
  },
};

/** Builds the visual for a crop at a growth stage, under a fresh node. */
export const buildCrop = (ctx: SceneContext, crop: CropId, stage: CropStage): TransformNode => {
  const node = new TransformNode(`crop_${crop}_${stage}`, ctx.scene);
  node.metadata = { crop, stage };
  switch (stage) {
    case 'seed':
      seedMound(ctx, node);
      break;
    case 'sprout':
      sprout(ctx, node);
      break;
    case 'growing':
      GROWING[crop](ctx, node);
      break;
    case 'ripe':
      RIPE[crop](ctx, node);
      break;
  }
  return node;
};

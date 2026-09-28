import type { VisitorId } from '../../core/types';
import { CreateCapsule, CreateCylinder, CreateSphere, TransformNode } from '../babylon';
import { PALETTE } from '../palette';
import type { SceneContext } from '../SceneContext';

export interface Farmer {
  readonly root: TransformNode;
  readonly can: TransformNode;
}

export const buildFarmer = (ctx: SceneContext): Farmer => {
  const { scene, shape } = ctx;
  const root = new TransformNode('farmer', scene);
  const o = { parent: root };
  shape(
    CreateCapsule('body', { height: 0.95, radius: 0.3 }, scene),
    PALETTE.overalls,
    o,
  ).position.y = 0.5;
  shape(CreateSphere('head', { diameter: 0.55, segments: 16 }, scene), PALETTE.skin, o).position.y =
    1.2;
  shape(
    CreateCylinder('brim', { diameter: 0.95, height: 0.05, tessellation: 32 }, scene),
    PALETTE.hat,
    o,
  ).position.y = 1.42;
  shape(
    CreateCylinder(
      'crown',
      { diameterTop: 0.36, diameterBottom: 0.46, height: 0.25, tessellation: 24 },
      scene,
    ),
    PALETTE.hatTop,
    o,
  ).position.y = 1.56;
  shape(
    CreateCylinder('band', { diameter: 0.47, height: 0.07, tessellation: 24 }, scene),
    PALETTE.roof,
    o,
  ).position.y = 1.47;
  for (const x of [-0.1, 0.1]) {
    shape(CreateSphere('eye', { diameter: 0.06 }, scene), PALETTE.eye, o).position.set(
      x,
      1.24,
      0.26,
    );
    shape(
      CreateSphere('cheek', { diameterX: 0.1, diameterY: 0.05, diameterZ: 0.04 }, scene),
      PALETTE.cheek,
      o,
    ).position.set(x * 1.6, 1.15, 0.25);
  }
  const can = new TransformNode('can', scene);
  can.parent = root;
  can.position.set(0.38, 0.55, 0.2);
  shape(CreateCylinder('canBody', { diameter: 0.28, height: 0.26 }, scene), PALETTE.can, {
    parent: can,
  });
  const spout = shape(
    CreateCylinder('spout', { diameterTop: 0.04, diameterBottom: 0.07, height: 0.36 }, scene),
    PALETTE.can,
    { parent: can },
  );
  spout.position.set(0, 0.05, 0.22);
  spout.rotation.x = 1.0;
  can.setEnabled(false);
  return { root, can };
};

export const buildCat = (ctx: SceneContext): TransformNode => {
  const { scene, shape } = ctx;
  const root = new TransformNode('cat', scene);
  const o = { parent: root };
  shape(
    CreateSphere(
      'catBody',
      { diameterX: 0.3, diameterY: 0.26, diameterZ: 0.45, segments: 12 },
      scene,
    ),
    PALETTE.cat,
    o,
  ).position.y = 0.2;
  shape(
    CreateSphere('catHead', { diameter: 0.26, segments: 12 }, scene),
    PALETTE.cat,
    o,
  ).position.set(0, 0.38, 0.22);
  for (const x of [-0.07, 0.07]) {
    const ear = shape(
      CreateCylinder(
        'ear',
        { diameterTop: 0, diameterBottom: 0.09, height: 0.1, tessellation: 4 },
        scene,
      ),
      PALETTE.catStripe,
      o,
    );
    ear.position.set(x, 0.52, 0.22);
  }
  const tail = shape(
    CreateCylinder('tail', { diameter: 0.05, height: 0.35 }, scene),
    PALETTE.catStripe,
    o,
  );
  tail.position.set(0, 0.35, -0.28);
  tail.rotation.x = -0.6;
  root.scaling.setAll(1.2);
  return root;
};

const hedgehog = (ctx: SceneContext, root: TransformNode): void => {
  const { scene, shape } = ctx;
  const o = { parent: root };
  shape(
    CreateSphere(
      'hogBody',
      { diameterX: 0.55, diameterY: 0.42, diameterZ: 0.6, segments: 12 },
      scene,
    ),
    PALETTE.hedgehog,
    o,
  ).position.y = 0.22;
  shape(
    CreateSphere('hogFace', { diameterX: 0.26, diameterY: 0.22, diameterZ: 0.3 }, scene),
    PALETTE.hedgehogFace,
    o,
  ).position.set(0, 0.2, 0.3);
  shape(CreateSphere('hogNose', { diameter: 0.07 }, scene), PALETTE.eye, o).position.set(
    0,
    0.2,
    0.46,
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI - Math.PI / 2;
    const spike = shape(
      CreateCylinder(
        'spike',
        { diameterTop: 0, diameterBottom: 0.1, height: 0.18, tessellation: 5 },
        scene,
      ),
      PALETTE.bark,
      o,
    );
    spike.position.set(Math.sin(a) * 0.22, 0.38, -0.05 + Math.cos(a) * 0.05);
    spike.rotation.z = -Math.sin(a) * 0.8;
  }
};

const bird = (ctx: SceneContext, root: TransformNode): void => {
  const { scene, shape } = ctx;
  const o = { parent: root };
  shape(
    CreateSphere('birdBody', { diameter: 0.42, segments: 12 }, scene),
    PALETTE.bird,
    o,
  ).position.y = 0.3;
  const beak = shape(
    CreateCylinder(
      'beak',
      { diameterTop: 0, diameterBottom: 0.1, height: 0.14, tessellation: 6 },
      scene,
    ),
    PALETTE.beak,
    o,
  );
  beak.position.set(0, 0.34, 0.26);
  beak.rotation.x = Math.PI / 2;
  for (const x of [-1, 1]) {
    const wing = shape(
      CreateSphere('wing', { diameterX: 0.08, diameterY: 0.22, diameterZ: 0.3 }, scene),
      PALETTE.overalls,
      o,
    );
    wing.position.set(x * 0.2, 0.3, -0.02);
  }
};

const oldMoss = (ctx: SceneContext, root: TransformNode): void => {
  const { scene, shape } = ctx;
  const o = { parent: root };
  shape(CreateCapsule('cloak', { height: 1.0, radius: 0.32 }, scene), PALETTE.moss, o).position.y =
    0.5;
  shape(
    CreateSphere('mossHead', { diameter: 0.5, segments: 14 }, scene),
    PALETTE.skin,
    o,
  ).position.y = 1.15;
  shape(
    CreateSphere('beard', { diameterX: 0.4, diameterY: 0.35, diameterZ: 0.25 }, scene),
    PALETTE.beard,
    o,
  ).position.set(0, 1.0, 0.16);
  shape(
    CreateCylinder(
      'mossHat',
      { diameterTop: 0, diameterBottom: 0.6, height: 0.5, tessellation: 20 },
      scene,
    ),
    PALETTE.leaf,
    o,
  ).position.y = 1.55;
};

const VISITOR_BUILDERS: Record<VisitorId, (ctx: SceneContext, root: TransformNode) => void> = {
  hazel: hedgehog,
  pip: bird,
  moss: oldMoss,
};

export const buildVisitor = (ctx: SceneContext, id: VisitorId): TransformNode => {
  const root = new TransformNode(`visitor_${id}`, ctx.scene);
  root.metadata = { visitor: id };
  VISITOR_BUILDERS[id](ctx, root);
  return root;
};

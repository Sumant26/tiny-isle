import type { VisitorId } from '../../core/types';
import { CreateBox, CreateCapsule, CreateCylinder, CreateSphere, TransformNode } from '../babylon';
import { PALETTE } from '../palette';
import type { SceneContext } from '../SceneContext';

export interface Farmer {
  readonly root: TransformNode;
  readonly can: TransformNode;
}

export const buildFarmer = (ctx: SceneContext): Farmer => {
  const { scene, shape } = ctx;
  const root = new TransformNode('farmer', scene);

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

  const model = ctx.model('char/farmer', () => buildProceduralFarmer(ctx));
  model.parent = root;

  return { root, can };
};

const buildProceduralFarmer = (ctx: SceneContext): TransformNode => {
  const { scene, shape } = ctx;
  const proc = new TransformNode('farmerProcedural', scene);
  const o = { parent: proc };
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
  return proc;
};

export const buildCat = (ctx: SceneContext): TransformNode =>
  ctx.model('pet/cat', () => buildProceduralCat(ctx));

const buildProceduralCat = (ctx: SceneContext): TransformNode => {
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

export const buildPuppy = (ctx: SceneContext): TransformNode =>
  ctx.model('pet/puppy', () => buildProceduralPuppy(ctx));

const buildProceduralPuppy = (ctx: SceneContext): TransformNode => {
  const { scene, shape } = ctx;
  const root = new TransformNode('puppy', scene);
  const o = { parent: root };
  shape(
    CreateSphere(
      'pupBody',
      { diameterX: 0.34, diameterY: 0.3, diameterZ: 0.5, segments: 12 },
      scene,
    ),
    '#E08738',
    o,
  ).position.y = 0.22;
  shape(CreateSphere('pupHead', { diameter: 0.3, segments: 12 }, scene), '#E08738', o).position.set(
    0,
    0.42,
    0.24,
  );
  shape(
    CreateSphere('pupSnout', { diameterX: 0.16, diameterY: 0.13, diameterZ: 0.18 }, scene),
    '#FFF5EA',
    o,
  ).position.set(0, 0.38, 0.38);
  shape(CreateSphere('pupNose', { diameter: 0.06 }, scene), PALETTE.eye, o).position.set(
    0,
    0.41,
    0.46,
  );
  for (const x of [-0.09, 0.09]) {
    const ear = shape(
      CreateCylinder(
        'pupEar',
        { diameterTop: 0, diameterBottom: 0.1, height: 0.12, tessellation: 4 },
        scene,
      ),
      '#C76F26',
      o,
    );
    ear.position.set(x, 0.56, 0.22);
  }
  const collar = shape(
    CreateCylinder('pupCollar', { diameter: 0.28, height: 0.05, tessellation: 16 }, scene),
    '#E63946',
    o,
  );
  collar.position.set(0, 0.32, 0.16);
  const tail = shape(
    CreateCylinder('pupTail', { diameter: 0.06, height: 0.25 }, scene),
    '#E08738',
    o,
  );
  tail.position.set(0, 0.34, -0.28);
  tail.rotation.x = -1.1;
  root.scaling.setAll(1.15);
  return root;
};

export const buildBunny = (ctx: SceneContext): TransformNode =>
  ctx.model('pet/bunny', () => buildProceduralBunny(ctx));

const buildProceduralBunny = (ctx: SceneContext): TransformNode => {
  const { scene, shape } = ctx;
  const root = new TransformNode('bunny', scene);
  const o = { parent: root };
  shape(
    CreateSphere(
      'bunBody',
      { diameterX: 0.3, diameterY: 0.28, diameterZ: 0.38, segments: 12 },
      scene,
    ),
    '#FAF8F5',
    o,
  ).position.y = 0.18;
  shape(
    CreateSphere('bunHead', { diameter: 0.24, segments: 12 }, scene),
    '#FAF8F5',
    o,
  ).position.set(0, 0.35, 0.18);
  for (const x of [-0.06, 0.06]) {
    const ear = shape(
      CreateCylinder(
        'bunEar',
        { diameterTop: 0.03, diameterBottom: 0.07, height: 0.28, tessellation: 8 },
        scene,
      ),
      '#FAF8F5',
      o,
    );
    ear.position.set(x, 0.52, 0.16);
    shape(
      CreateSphere('bunEarInner', { diameterX: 0.03, diameterY: 0.2, diameterZ: 0.02 }, scene),
      '#FFAEC9',
      { parent: ear },
    ).position.z = 0.02;
  }
  shape(CreateSphere('bunTail', { diameter: 0.1 }, scene), '#FAF8F5', o).position.set(
    0,
    0.2,
    -0.22,
  );
  root.scaling.setAll(1.1);
  return root;
};

export const buildDuckling = (ctx: SceneContext): TransformNode =>
  ctx.model('pet/duckling', () => buildProceduralDuckling(ctx));

const buildProceduralDuckling = (ctx: SceneContext): TransformNode => {
  const { scene, shape } = ctx;
  const root = new TransformNode('duckling', scene);
  const o = { parent: root };
  shape(
    CreateSphere(
      'duckBody',
      { diameterX: 0.28, diameterY: 0.25, diameterZ: 0.36, segments: 12 },
      scene,
    ),
    '#FFD13B',
    o,
  ).position.y = 0.16;
  shape(
    CreateSphere('duckHead', { diameter: 0.22, segments: 12 }, scene),
    '#FFD13B',
    o,
  ).position.set(0, 0.32, 0.16);
  const bill = shape(
    CreateBox('duckBill', { width: 0.12, depth: 0.14, height: 0.04 }, scene),
    '#FF7F11',
    o,
  );
  bill.position.set(0, 0.3, 0.3);
  root.scaling.setAll(1.1);
  return root;
};

export const buildPet = (ctx: SceneContext, pet: string): TransformNode => {
  switch (pet) {
    case 'puppy':
      return buildPuppy(ctx);
    case 'bunny':
      return buildBunny(ctx);
    case 'duckling':
      return buildDuckling(ctx);
    default:
      return buildCat(ctx);
  }
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
  const root = ctx.model(`visitor/${id}`, () => {
    const proc = new TransformNode(`visitor_${id}`, ctx.scene);
    VISITOR_BUILDERS[id](ctx, proc);
    return proc;
  });
  root.metadata = { visitor: id };
  return root;
};

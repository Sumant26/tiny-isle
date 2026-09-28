import { type Cell } from '../../core/types';
import { cellToWorld, isFence, LAYOUT, rectCenterWorld, WORLD_SIZE } from '../../core/world';
import {
  CreateBox,
  CreateCylinder,
  CreateSphere,
  CreateTorus,
  type Mesh,
  PointLight,
  TransformNode,
  Vector3,
} from '../babylon';
import { PALETTE } from '../palette';
import { color, GROUND_Y, type SceneContext } from '../SceneContext';

export interface Environment {
  readonly root: TransformNode;
  readonly ground: Mesh;
  readonly lampLight: PointLight;
  readonly lamp: Mesh;
  readonly cottageWindow: Mesh;
  readonly rockingChair?: TransformNode;
  readonly flowerBoxFlowers?: Mesh[];
  readonly isletRoot?: TransformNode;
  readonly swaying: TransformNode[];
}

const at = (node: TransformNode, c: Cell, y = GROUND_Y): void => {
  const w = cellToWorld(c);
  node.position.set(w.x, y, w.z);
};

const buildCottage = (
  ctx: SceneContext,
  root: TransformNode,
): { windowMesh: Mesh; rockingChair: TransformNode; flowerBoxFlowers: Mesh[] } => {
  const { scene, shape } = ctx;
  const node = new TransformNode('cottage', scene);
  node.parent = root;
  const c = rectCenterWorld(LAYOUT.cottage);
  node.position.set(c.x, GROUND_Y, c.z);

  const windowMesh = shape(
    CreateBox('window', { width: 0.5, depth: 0.08, height: 0.45 }, scene),
    ctx.material(PALETTE.window, '#000000'),
    { parent: node },
  );
  windowMesh.position.set(-0.5, 0.95, 0.96);

  // Window Flower Box with seasonal flowers
  const flowerBox = shape(
    CreateBox('flowerBox', { width: 0.62, depth: 0.22, height: 0.16 }, scene),
    PALETTE.woodDark,
    { parent: node },
  );
  flowerBox.position.set(-0.5, 0.68, 1.05);

  const flowerBoxFlowers: Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const fl = shape(
      CreateSphere(`boxFlower_${i}`, { diameter: 0.13, segments: 6 }, scene),
      PALETTE.flowers[i % PALETTE.flowers.length] ?? PALETTE.petal,
      { parent: flowerBox, castShadow: false },
    );
    fl.position.set(-0.22 + i * 0.14, 0.12, 0);
    flowerBoxFlowers.push(fl);
  }

  // Porch Deck, Steps and Overhang
  const porchDeck = shape(
    CreateBox('porchDeck', { width: 2.3, depth: 0.9, height: 0.08 }, scene),
    PALETTE.woodDark,
    { parent: node },
  );
  porchDeck.position.set(0, 0.04, 1.15);

  const porchStep = shape(
    CreateBox('porchStep', { width: 1.2, depth: 0.3, height: 0.04 }, scene),
    PALETTE.wood,
    { parent: node },
  );
  porchStep.position.set(0.35, 0.02, 1.65);

  // Welcome mat
  shape(
    CreateBox('welcomeMat', { width: 0.55, depth: 0.3, height: 0.02 }, scene),
    PALETTE.woodLight,
    { parent: node },
  ).position.set(0.35, 0.05, 1.15);

  for (const x of [-1.05, 1.05]) {
    const post = shape(
      CreateCylinder('porchPost', { diameter: 0.07, height: 1.4 }, scene),
      PALETTE.bark,
      { parent: node },
    );
    post.position.set(x, 0.7, 1.55);
  }

  const porchRoof = shape(
    CreateBox('porchRoof', { width: 2.45, depth: 0.95, height: 0.08 }, scene),
    PALETTE.roof,
    { parent: node },
  );
  porchRoof.position.set(0, 1.42, 1.2);
  porchRoof.rotation.x = 0.15;

  // Porch Rocking Chair
  const rockingChair = new TransformNode('rockingChair', scene);
  rockingChair.parent = node;
  rockingChair.position.set(-0.65, 0.08, 1.15);

  for (const x of [-0.14, 0.14]) {
    const runner = shape(
      CreateBox('runner', { width: 0.04, depth: 0.42, height: 0.04 }, scene),
      PALETTE.woodLight,
      { parent: rockingChair },
    );
    runner.position.set(x, 0.02, 0);
    runner.rotation.x = -0.05;
  }
  const seat = shape(
    CreateBox('seat', { width: 0.32, depth: 0.28, height: 0.04 }, scene),
    PALETTE.wood,
    { parent: rockingChair },
  );
  seat.position.set(0, 0.18, 0);
  const back = shape(
    CreateBox('chairBack', { width: 0.3, depth: 0.04, height: 0.34 }, scene),
    PALETTE.wood,
    { parent: rockingChair },
  );
  back.position.set(0, 0.35, -0.12);
  back.rotation.x = -0.12;

  // Vintage Brass Gramophone on Porch Side Table
  const table = shape(
    CreateCylinder('table', { diameter: 0.28, height: 0.26 }, scene),
    PALETTE.woodDark,
    { parent: node },
  );
  table.position.set(0.85, 0.18, 1.15);

  const gramoBase = shape(
    CreateBox('gramoBase', { width: 0.18, depth: 0.18, height: 0.08 }, scene),
    PALETTE.wood,
    { parent: table },
  );
  gramoBase.position.y = 0.16;

  const vinyl = shape(
    CreateCylinder('vinyl', { diameter: 0.16, height: 0.02, tessellation: 16 }, scene),
    '#1A1A1A',
    { parent: gramoBase },
  );
  vinyl.position.y = 0.05;

  const horn = shape(
    CreateCylinder(
      'gramoHorn',
      { diameterTop: 0.2, diameterBottom: 0.04, height: 0.22, tessellation: 12 },
      scene,
    ),
    '#DDA15E',
    { parent: gramoBase },
  );
  horn.position.set(0.04, 0.18, -0.02);
  horn.rotation.x = -0.45;
  horn.rotation.z = 0.25;

  const model = ctx.model('prop/cottage', () => {
    const proc = new TransformNode('cottageProcedural', scene);
    const o = { parent: proc };
    shape(
      CreateBox('walls', { width: 2.2, depth: 1.9, height: 1.6 }, scene),
      PALETTE.cream,
      o,
    ).position.y = 0.8;
    for (const side of [-1, 1]) {
      const r = shape(
        CreateBox('roof', { width: 2.6, depth: 1.45, height: 0.14 }, scene),
        PALETTE.roof,
        o,
      );
      r.rotation.x = side * 0.62;
      r.position.set(0, 1.95, side * 0.56);
    }
    shape(
      CreateBox('door', { width: 0.5, depth: 0.08, height: 0.9 }, scene),
      PALETTE.woodDark,
      o,
    ).position.set(0.35, 0.45, 0.96);
    shape(
      CreateBox('chimney', { width: 0.3, depth: 0.3, height: 0.7 }, scene),
      PALETTE.dirt,
      o,
    ).position.set(0.6, 2.3, -0.3);
    return proc;
  });
  model.parent = node;
  return { windowMesh, rockingChair, flowerBoxFlowers };
};

const buildTree = (ctx: SceneContext, root: TransformNode): TransformNode => {
  const { scene, shape } = ctx;
  const node = new TransformNode('tree', scene);
  node.parent = root;
  at(node, LAYOUT.tree);
  // A glTF model from public/models can replace the procedural tree (see docs/ASSETS.md).
  const model = ctx.model('prop/tree', () => {
    const proc = new TransformNode('treeProcedural', scene);
    const o = { parent: proc };
    shape(
      CreateCylinder('trunk', { diameterTop: 0.3, diameterBottom: 0.48, height: 1.5 }, scene),
      PALETTE.bark,
      o,
    ).position.y = 0.75;
    const blobs: [number, number, number, number, string][] = [
      [0, 2.1, 0, 2.0, PALETTE.leaf],
      [-0.6, 1.75, 0.25, 1.3, PALETTE.leaf],
      [0.6, 1.85, 0.2, 1.3, PALETTE.leafMid],
      [0.1, 2.65, 0.2, 1.1, PALETTE.leafLight],
    ];
    for (const [x, y, z, d, hex] of blobs)
      shape(CreateSphere('leaves', { diameter: d, segments: 14 }, scene), hex, o).position.set(
        x,
        y,
        z,
      );
    for (const [x, y, z] of [
      [0.55, 2.1, 0.8],
      [-0.7, 1.75, 0.7],
      [0.2, 1.6, 0.9],
    ] as const) {
      shape(CreateSphere('apple', { diameter: 0.2 }, scene), PALETTE.tomato, o).position.set(
        x,
        y,
        z,
      );
    }
    return proc;
  });
  model.parent = node;
  return node;
};

const buildMarket = (ctx: SceneContext, root: TransformNode): void => {
  const { scene, shape } = ctx;
  const node = new TransformNode('market', scene);
  node.parent = root;
  const c = rectCenterWorld(LAYOUT.market);
  node.position.set(c.x, GROUND_Y, c.z);
  node.rotation.y = -Math.PI / 4;
  const model = ctx.model('prop/market', () => {
    const proc = new TransformNode('marketProcedural', scene);
    const o = { parent: proc };
    for (const [x, z] of [
      [-0.9, -0.45],
      [0.9, -0.45],
      [-0.9, 0.45],
      [0.9, 0.45],
    ] as const) {
      shape(
        CreateCylinder('post', { diameter: 0.11, height: 1.8 }, scene),
        PALETTE.woodDark,
        o,
      ).position.set(x, 0.9, z);
    }
    shape(
      CreateBox('counter', { width: 2, depth: 1, height: 0.65 }, scene),
      PALETTE.wood,
      o,
    ).position.y = 0.33;
    for (let i = 0; i < 5; i++) {
      const s = shape(
        CreateBox('awning', { width: 0.42, depth: 1.3, height: 0.07 }, scene),
        i % 2 ? PALETTE.awningLight : PALETTE.roof,
        o,
      );
      s.position.set(-0.84 + i * 0.42, 1.85, 0.05);
      s.rotation.x = 0.15;
    }
    const crates: [string, number][] = [
      [PALETTE.tomato, -0.55],
      [PALETTE.carrot, 0],
      [PALETTE.petal, 0.55],
    ];
    for (const [hex, x] of crates) {
      shape(
        CreateBox('crate', { width: 0.45, depth: 0.38, height: 0.18 }, scene),
        PALETTE.woodLight,
        o,
      ).position.set(x, 0.74, 0.2);
      for (let i = 0; i < 3; i++)
        shape(CreateSphere('goods', { diameter: 0.15 }, scene), hex, o).position.set(
          x - 0.12 + i * 0.12,
          0.88,
          0.2,
        );
    }
    return proc;
  });
  model.parent = node;
};

const buildLantern = (
  ctx: SceneContext,
  root: TransformNode,
): { lamp: Mesh; light: PointLight } => {
  const { scene, shape } = ctx;
  const node = new TransformNode('lantern', scene);
  node.parent = root;
  at(node, LAYOUT.lantern);
  shape(CreateCylinder('lanternPost', { diameter: 0.1, height: 1.4 }, scene), PALETTE.bark, {
    parent: node,
  }).position.y = 0.7;
  const lamp = shape(
    CreateBox('lamp', { size: 0.3 }, scene),
    ctx.material(PALETTE.lampGlow, '#4A3F20'),
    { parent: node, castShadow: false },
  );
  lamp.position.y = 1.5;
  shape(
    CreateCylinder(
      'lampCap',
      { diameterTop: 0.05, diameterBottom: 0.42, height: 0.16, tessellation: 4 },
      scene,
    ),
    PALETTE.bark,
    { parent: node },
  ).position.y = 1.73;
  const w = cellToWorld(LAYOUT.lantern);
  const light = new PointLight('lanternLight', new Vector3(w.x, 1.9, w.z), scene);
  light.diffuse = color('#FFC86B');
  light.intensity = 0;
  light.range = 7;
  return { lamp, light };
};

const buildFence = (ctx: SceneContext, root: TransformNode): void => {
  const { scene, shape } = ctx;
  const node = new TransformNode('fence', scene);
  node.parent = root;
  // One source post; the rest are GPU instances, so ~30 posts cost one draw call.
  const post = shape(
    CreateBox('fencePost', { width: 0.14, depth: 0.14, height: 0.65 }, scene),
    PALETTE.woodLight,
    { parent: node },
  );
  post.isVisible = false;
  const rails: Cell[] = [];
  for (let z = 0; z < WORLD_SIZE; z++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      if (!isFence({ x, z })) continue;
      const inst = post.createInstance(`post_${x}_${z}`);
      inst.parent = node;
      at(inst, { x, z }, 0.55);
      ctx.shadows?.addShadowCaster(inst);
      rails.push({ x, z });
    }
  }
  // Rails between neighbouring fence cells.
  for (const c of rails) {
    for (const [dx, dz] of [
      [1, 0],
      [0, 1],
    ] as const) {
      const n = { x: c.x + dx, z: c.z + dz };
      if (!isFence(n)) continue;
      for (const y of [0.42, 0.68]) {
        const r = shape(
          CreateBox('rail', { width: dx ? 1 : 0.05, depth: dz ? 1 : 0.05, height: 0.06 }, scene),
          PALETTE.fence,
          { parent: node },
        );
        const w = cellToWorld(c);
        r.position.set(w.x + dx / 2, y, w.z + dz / 2);
      }
    }
  }
};

const buildPathAndFlowers = (
  ctx: SceneContext,
  root: TransformNode,
  random: () => number,
): void => {
  const { scene, shape } = ctx;
  const stone = shape(
    CreateCylinder('stone', { diameter: 0.7, height: 0.1, tessellation: 20 }, scene),
    PALETTE.stone,
    { parent: root, castShadow: false },
  );
  stone.isVisible = false;
  for (const c of LAYOUT.path) {
    const s = stone.createInstance('pathStone');
    s.parent = root;
    at(s, c, GROUND_Y + 0.02);
  }
  const flowerBases = PALETTE.flowers.map((hex, i) => {
    const m = shape(CreateSphere(`flower${i}`, { diameter: 0.15, segments: 6 }, scene), hex, {
      parent: root,
      castShadow: false,
      pickable: false,
    });
    m.isVisible = false;
    return m;
  });
  for (let i = 0; i < 40; i++) {
    const a = random() * Math.PI * 2;
    const r = 5.2 + random() * 2.6;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const base = flowerBases[i % flowerBases.length];
    if (!base) continue;
    const f = base.createInstance('flower');
    f.parent = root;
    f.position.set(x, GROUND_Y + 0.05, z);
  }
};

const buildIsland = (ctx: SceneContext, root: TransformNode): Mesh => {
  const { scene, shape } = ctx;
  const opts = { parent: root, castShadow: false };
  shape(
    CreateCylinder(
      'dirt',
      { diameterTop: 17, diameterBottom: 13, height: 2.4, tessellation: 64 },
      scene,
    ),
    PALETTE.dirt,
    opts,
  ).position.y = -1.3;
  shape(
    CreateCylinder(
      'dirtDeep',
      { diameterTop: 12.6, diameterBottom: 6, height: 2.2, tessellation: 64 },
      scene,
    ),
    PALETTE.dirtDeep,
    opts,
  ).position.y = -3.4;
  const ground = shape(
    CreateCylinder('ground', { diameter: 17.4, height: 0.5, tessellation: 64 }, scene),
    PALETTE.grass,
    opts,
  );
  shape(
    CreateTorus('lip', { diameter: 17.2, thickness: 0.5, tessellation: 64 }, scene),
    PALETTE.grassLip,
    { ...opts, pickable: false },
  ).position.y = 0.02;
  return ground;
};

const buildPond = (ctx: SceneContext, root: TransformNode): void => {
  const { scene, shape } = ctx;
  const node = new TransformNode('pond', scene);
  node.parent = root;
  const c = rectCenterWorld(LAYOUT.pond);
  node.position.set(c.x, 0, c.z);
  const o = { parent: node, castShadow: false };
  shape(
    CreateCylinder('pondRim', { diameter: 3.4, height: 0.3, tessellation: 48 }, scene),
    PALETTE.stone,
    o,
  ).position.y = 0.2;
  shape(
    CreateCylinder('pondWater', { diameter: 2.8, height: 0.32, tessellation: 48 }, scene),
    PALETTE.water,
    o,
  ).position.y = 0.22;
  const lily = shape(
    CreateCylinder('lily', { diameter: 0.7, height: 0.05, tessellation: 24, arc: 0.85 }, scene),
    PALETTE.strawberryLeaf,
    o,
  );
  lily.position.set(0.5, 0.4, -0.4);
  shape(CreateSphere('lilyFlower', { diameter: 0.22 }, scene), PALETTE.flowers[0], o).position.set(
    0.5,
    0.46,
    -0.4,
  );
};

const buildPier = (ctx: SceneContext, root: TransformNode): void => {
  const { scene, shape } = ctx;
  const node = new TransformNode('pier', scene);
  node.parent = root;
  node.position.set(-6.8, 0, -1.8);
  node.rotation.y = -0.35;

  // Deck planks
  const deck = shape(
    CreateBox('pierDeck', { width: 2.8, depth: 1.1, height: 0.1 }, scene),
    PALETTE.woodDark,
    { parent: node },
  );
  deck.position.set(0, 0.32, 0);

  // Cross plank accents
  for (let i = -1.1; i <= 1.1; i += 0.45) {
    shape(
      CreateBox('pierPlank', { width: 0.04, depth: 1.12, height: 0.11 }, scene),
      PALETTE.woodLight,
      { parent: node, castShadow: false },
    ).position.set(i, 0.32, 0);
  }

  // Support Pilings into water
  for (const [x, z] of [
    [-1.2, -0.45],
    [1.2, -0.45],
    [-1.2, 0.45],
    [1.2, 0.45],
    [0, -0.45],
    [0, 0.45],
  ] as const) {
    const piling = shape(
      CreateCylinder('pierPiling', { diameter: 0.12, height: 1.4 }, scene),
      PALETTE.bark,
      { parent: node },
    );
    piling.position.set(x, -0.3, z);
  }

  // Pier End Lantern Post & Bollard
  const post = shape(
    CreateCylinder('pierPost', { diameter: 0.1, height: 1.1 }, scene),
    PALETTE.wood,
    { parent: node },
  );
  post.position.set(-1.25, 0.8, 0.45);

  const lantern = shape(
    CreateBox('pierLantern', { size: 0.22 }, scene),
    ctx.material(PALETTE.lampGlow, '#4A3F20'),
    { parent: post, castShadow: false },
  );
  lantern.position.y = 0.55;

  // Mooring bollards
  for (const [bx, bz] of [
    [1.2, 0.45],
    [-1.2, -0.45],
  ] as const) {
    shape(CreateCylinder('bollard', { diameter: 0.12, height: 0.2 }, scene), PALETTE.woodLight, {
      parent: node,
    }).position.set(bx, 0.42, bz);
  }
};

const buildOrchardIslet = (
  ctx: SceneContext,
  root: TransformNode,
): { isletRoot: TransformNode; orchardTrees: TransformNode[] } => {
  const { scene, shape } = ctx;
  const isletRoot = new TransformNode('orchardIslet', scene);
  isletRoot.parent = root;
  isletRoot.position.set(11.0, 0, -6.5);

  // Arched wooden footbridge connecting main island to islet
  const bridge = new TransformNode('bridge', scene);
  bridge.parent = root;
  bridge.position.set(7.5, 0, -6.5);

  const bridgeDeck = shape(
    CreateBox('bridgeDeck', { width: 3.4, depth: 0.9, height: 0.1 }, scene),
    PALETTE.woodDark,
    { parent: bridge },
  );
  bridgeDeck.position.y = 0.35;

  for (const z of [-0.4, 0.4]) {
    const rail = shape(
      CreateBox('bridgeRail', { width: 3.4, depth: 0.06, height: 0.06 }, scene),
      PALETTE.woodLight,
      { parent: bridge },
    );
    rail.position.set(0, 0.65, z);

    for (const rx of [-1.5, -0.75, 0, 0.75, 1.5]) {
      shape(CreateCylinder('bridgePost', { diameter: 0.06, height: 0.35 }, scene), PALETTE.bark, {
        parent: bridge,
      }).position.set(rx, 0.5, z);
    }
  }

  // Islet mound
  shape(
    CreateCylinder(
      'isletDirt',
      { diameterTop: 6.2, diameterBottom: 4.5, height: 1.8, tessellation: 32 },
      scene,
    ),
    PALETTE.dirt,
    { parent: isletRoot, castShadow: false },
  ).position.y = -0.9;

  shape(
    CreateCylinder('isletGrass', { diameter: 6.4, height: 0.4, tessellation: 32 }, scene),
    PALETTE.grass,
    { parent: isletRoot, castShadow: false },
  ).position.y = 0.1;

  // 3 Fruit Orchard Trees
  const orchardTrees: TransformNode[] = [];
  const treeDefs = [
    { name: 'appleTree', pos: [-1.2, 0, -0.6], leafHex: PALETTE.leaf, fruitHex: PALETTE.tomato },
    { name: 'cherryTree', pos: [1.1, 0, -0.5], leafHex: '#FFAAA6', fruitHex: '#D90429' },
    { name: 'citrusTree', pos: [0, 0, 1.2], leafHex: PALETTE.leafLight, fruitHex: '#FFD166' },
  ] as const;

  for (const def of treeDefs) {
    const tNode = new TransformNode(def.name, scene);
    tNode.parent = isletRoot;
    tNode.position.set(def.pos[0], 0.2, def.pos[2]);

    shape(
      CreateCylinder('trunk', { diameterTop: 0.22, diameterBottom: 0.35, height: 1.2 }, scene),
      PALETTE.bark,
      { parent: tNode },
    ).position.y = 0.6;

    shape(CreateSphere('canopy', { diameter: 1.5, segments: 10 }, scene), def.leafHex, {
      parent: tNode,
    }).position.y = 1.6;

    // Fruits on tree
    const fruitCoords: readonly (readonly [number, number, number])[] = [
      [0.4, 1.5, 0.5],
      [-0.4, 1.6, 0.4],
      [0.1, 1.8, 0.6],
    ];
    for (const [fx, fy, fz] of fruitCoords) {
      shape(CreateSphere('fruit', { diameter: 0.16 }, scene), def.fruitHex, {
        parent: tNode,
        castShadow: false,
      }).position.set(fx, fy, fz);
    }
    orchardTrees.push(tNode);
  }

  return { isletRoot, orchardTrees };
};

/** Builds all static scenery from the shared world layout. */
export const buildEnvironment = (
  ctx: SceneContext,
  random: () => number = Math.random,
): Environment => {
  const root = new TransformNode('environment', ctx.scene);
  const ground = buildIsland(ctx, root);
  buildPond(ctx, root);
  buildPier(ctx, root);
  const { windowMesh, rockingChair, flowerBoxFlowers } = buildCottage(ctx, root);
  const { isletRoot, orchardTrees } = buildOrchardIslet(ctx, root);
  const tree = buildTree(ctx, root);
  buildMarket(ctx, root);
  const { lamp, light } = buildLantern(ctx, root);
  buildFence(ctx, root);
  buildPathAndFlowers(ctx, root, random);
  return {
    root,
    ground,
    lampLight: light,
    lamp,
    cottageWindow: windowMesh,
    rockingChair,
    flowerBoxFlowers,
    isletRoot,
    swaying: [tree, ...orchardTrees],
  };
};

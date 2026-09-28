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
  beehive: ({ scene, shape }, root) => {
    // Wooden Apiary Box on 4 small legs
    shape(
      CreateBox('hiveBody', { width: 0.6, depth: 0.6, height: 0.5 }, scene),
      PALETTE.woodLight,
      {
        parent: root,
      },
    ).position.y = 0.35;
    // Hive Roof
    shape(
      CreateBox('hiveRoof', { width: 0.7, depth: 0.7, height: 0.08 }, scene),
      PALETTE.woodDark,
      {
        parent: root,
      },
    ).position.y = 0.62;
    // Hive Entrance slit
    shape(CreateBox('hiveSlot', { width: 0.3, depth: 0.04, height: 0.06 }, scene), '#3A2E2B', {
      parent: root,
    }).position.set(0, 0.2, 0.29);
    // Legs
    for (const x of [-0.25, 0.25]) {
      for (const z of [-0.25, 0.25]) {
        shape(
          CreateBox('hiveLeg', { width: 0.06, depth: 0.06, height: 0.2 }, scene),
          PALETTE.woodDark,
          {
            parent: root,
          },
        ).position.set(x, 0.1, z);
      }
    }
    // Buzzing particle bees (small golden spheres)
    shape(CreateSphere('bee1', { diameter: 0.06 }, scene), '#F9C74F', {
      parent: root,
    }).position.set(0.25, 0.7, 0.15);
    shape(CreateSphere('bee2', { diameter: 0.05 }, scene), '#F9C74F', {
      parent: root,
    }).position.set(-0.2, 0.65, -0.2);
  },
  campfire: ({ scene, shape }, root) => {
    // Stone ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      shape(CreateSphere(`stone_${i}`, { diameter: 0.2 }, scene), PALETTE.stoneGrey, {
        parent: root,
      }).position.set(Math.cos(a) * 0.38, 0.08, Math.sin(a) * 0.38);
    }
    // Logs
    shape(CreateCylinder('log1', { diameter: 0.08, height: 0.55 }, scene), PALETTE.bark, {
      parent: root,
    }).rotation.z = Math.PI / 4;
    shape(CreateCylinder('log2', { diameter: 0.08, height: 0.55 }, scene), PALETTE.bark, {
      parent: root,
    }).rotation.x = Math.PI / 4;
    // Glowing Embers
    shape(CreateSphere('embers', { diameter: 0.22 }, scene), '#F94144', {
      parent: root,
    }).position.set(0, 0.1, 0);
  },
  picnic_mat: ({ scene, shape }, root) => {
    // Red & Cream picnic blanket
    shape(CreateBox('mat', { width: 1.2, depth: 0.9, height: 0.02 }, scene), '#E76F51', {
      parent: root,
    }).position.y = 0.01;
    // Teapot & Cups
    shape(
      CreateCylinder('pot', { diameterTop: 0.12, diameterBottom: 0.16, height: 0.15 }, scene),
      '#FFFFFF',
      {
        parent: root,
      },
    ).position.set(-0.25, 0.08, 0);
    shape(CreateCylinder('cup1', { diameter: 0.07, height: 0.06 }, scene), '#F4A261', {
      parent: root,
    }).position.set(0.1, 0.04, -0.15);
    shape(CreateCylinder('cup2', { diameter: 0.07, height: 0.06 }, scene), '#F4A261', {
      parent: root,
    }).position.set(0.2, 0.04, 0.15);
  },
  hammock: ({ scene, shape }, root) => {
    // Wooden anchor posts
    for (const x of [-0.65, 0.65]) {
      shape(CreateCylinder(`post_${x}`, { diameter: 0.1, height: 1.2 }, scene), PALETTE.woodDark, {
        parent: root,
      }).position.set(x, 0.6, 0);
    }
    // Fabric sling
    shape(CreateBox('sling', { width: 1.1, depth: 0.5, height: 0.04 }, scene), '#F4F1DE', {
      parent: root,
    }).position.set(0, 0.45, 0);
    // Soft Pillow
    shape(CreateBox('pillow', { width: 0.25, depth: 0.35, height: 0.08 }, scene), '#E9C46A', {
      parent: root,
    }).position.set(-0.35, 0.5, 0);
  },
  wishing_well: ({ scene, shape }, root) => {
    // Stone Circular Well
    shape(
      CreateCylinder('wellBase', { diameter: 0.9, height: 0.6, tessellation: 16 }, scene),
      PALETTE.stoneGrey,
      { parent: root },
    ).position.y = 0.3;
    shape(CreateCylinder('wellWater', { diameter: 0.72, height: 0.05 }, scene), PALETTE.water, {
      parent: root,
    }).position.y = 0.45;
    // Timber Upright Posts
    for (const x of [-0.4, 0.4]) {
      shape(
        CreateBox(`wellPost_${x}`, { width: 0.08, depth: 0.08, height: 1.1 }, scene),
        PALETTE.woodDark,
        {
          parent: root,
        },
      ).position.set(x, 0.75, 0);
    }
    // Timber Pitched Roof
    shape(CreateBox('wellRoof', { width: 1.1, depth: 0.9, height: 0.1 }, scene), PALETTE.wood, {
      parent: root,
    }).position.set(0, 1.3, 0);
  },
  greenhouse: ({ scene, shape }, root) => {
    // Glass Conservatory Frame & Base
    shape(CreateBox('ghBase', { width: 1.4, depth: 1.1, height: 0.25 }, scene), PALETTE.woodDark, {
      parent: root,
    }).position.y = 0.12;
    // Translucent Glass Conservatory Dome
    shape(CreateBox('ghGlass', { width: 1.3, depth: 1.0, height: 0.8 }, scene), '#A8DADC', {
      parent: root,
    }).position.y = 0.6;
    // Planters inside
    shape(CreateBox('planter1', { width: 0.35, depth: 0.7, height: 0.2 }, scene), PALETTE.soil, {
      parent: root,
    }).position.set(-0.35, 0.35, 0);
    shape(CreateBox('planter2', { width: 0.35, depth: 0.7, height: 0.2 }, scene), PALETTE.soil, {
      parent: root,
    }).position.set(0.35, 0.35, 0);
    // Lush green flora inside
    shape(CreateSphere('flora1', { diameter: 0.25 }, scene), PALETTE.leafLight, {
      parent: root,
    }).position.set(-0.35, 0.55, 0);
    shape(CreateSphere('flora2', { diameter: 0.25 }, scene), PALETTE.leafLight, {
      parent: root,
    }).position.set(0.35, 0.55, 0);
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

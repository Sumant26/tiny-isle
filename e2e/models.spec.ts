import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { openGame } from './helpers';

const cube = readFileSync(new URL('./fixtures/cube.gltf', import.meta.url), 'utf8');

test('loads a glTF model from the manifest in place of the procedural one', async ({ page }) => {
  await page.route('**/models/manifest.json', (route) =>
    route.fulfill({
      json: { 'prop/tree': { file: 'test/cube.gltf', scale: 2, rotationY: 45 } },
    }),
  );
  await page.route('**/models/test/cube.gltf', (route) =>
    route.fulfill({ body: cube, contentType: 'model/gltf+json' }),
  );
  await openGame(page);
  const result = await page.evaluate(() => {
    const { ctx } = window.__tinyIsle.game;
    const node = ctx.scene.getTransformNodeByName('prop/tree');
    return {
      loaded: ctx.models.has('prop/tree'),
      scale: node?.scaling.x,
      hasFixtureMesh: ctx.scene.meshes.some((m) => m.name.includes('FixtureCube')),
      proceduralTree: ctx.scene.getTransformNodeByName('treeProcedural') !== null,
    };
  });
  expect(result).toEqual({ loaded: true, scale: 2, hasFixtureMesh: true, proceduralTree: false });
});

test('falls back to procedural models when a file is missing', async ({ page }) => {
  await page.route('**/models/manifest.json', (route) =>
    route.fulfill({ json: { 'prop/tree': { file: 'missing.glb' } } }),
  );
  await openGame(page);
  const hasProcedural = await page.evaluate(
    () => window.__tinyIsle.game.ctx.scene.getTransformNodeByName('treeProcedural') !== null,
  );
  expect(hasProcedural).toBe(true);
});

import { describe, expect, it } from 'vitest';
import { CreateBox, NullEngine, StandardMaterial } from './babylon';
import { createSceneContext } from './SceneContext';

describe('createSceneContext', () => {
  it('creates a scene with lights and optional shadows/glow', () => {
    const ctx = createSceneContext(new NullEngine(), { shadows: true, glow: true });
    expect(ctx.hemi.intensity).toBeGreaterThan(0);
    expect(ctx.sun.intensity).toBeGreaterThan(0);
    expect(ctx.shadows).not.toBeNull();
    expect(ctx.glow).not.toBeNull();
    ctx.dispose();
    const plain = createSceneContext(new NullEngine(), { shadows: false, glow: false });
    expect(plain.shadows).toBeNull();
    expect(plain.glow).toBeNull();
  });

  it('shares one material per colour', () => {
    const ctx = createSceneContext(new NullEngine(), { shadows: false, glow: false });
    expect(ctx.material('#ff0000')).toBe(ctx.material('#ff0000'));
    expect(ctx.material('#ff0000')).not.toBe(ctx.material('#ff0000', '#000000'));
    expect(ctx.material('#ff0000', '#112233').emissiveColor.toHexString()).toBe('#112233');
  });

  it('shape() applies material, parent, pickability and shadows', () => {
    const ctx = createSceneContext(new NullEngine(), { shadows: true, glow: false });
    const parent = CreateBox('p', {}, ctx.scene);
    const box = ctx.shape(CreateBox('b', {}, ctx.scene), '#00ff00', {
      parent,
      pickable: false,
      receiveShadow: false,
    });
    expect((box.material as StandardMaterial).diffuseColor.toHexString()).toBe('#00FF00');
    expect(box.parent).toBe(parent);
    expect(box.isPickable).toBe(false);
    expect(box.receiveShadows).toBe(false);
    expect(ctx.shadows?.getShadowMap()?.renderList).toContain(box);
    const custom = new StandardMaterial('c', ctx.scene);
    expect(ctx.shape(CreateBox('c', {}, ctx.scene), custom).material).toBe(custom);
  });

  it('drives the tweener from the render loop', () => {
    const ctx = createSceneContext(new NullEngine(), { shadows: false, glow: false });
    let value = 0;
    ctx.tweener.tween({ duration: 0.01, onUpdate: (t) => (value = t) });
    ctx.scene.onBeforeRenderObservable.notifyObservers(ctx.scene);
    expect(ctx.tweener.active).toBeLessThanOrEqual(1);
    expect(value).toBeGreaterThanOrEqual(0);
  });
});

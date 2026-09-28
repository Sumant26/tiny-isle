import { describe, expect, it, vi } from 'vitest';
import { fetchManifest, MODEL_KEYS, validateManifest } from './manifest';

describe('MODEL_KEYS', () => {
  it('covers every crop stage, decoration, visitor and prop', () => {
    expect(MODEL_KEYS).toContain('crop/carrot/ripe');
    expect(MODEL_KEYS).toContain('crop/pumpkin/seed');
    expect(MODEL_KEYS).toContain('decoration/gnome');
    expect(MODEL_KEYS).toContain('visitor/hazel');
    expect(MODEL_KEYS).toEqual(
      expect.arrayContaining([
        'prop/tree',
        'prop/market',
        'pet/cat',
        'char/farmer',
        'prop/cottage',
      ]),
    );
    expect(MODEL_KEYS).toHaveLength(5 * 4 + 5 + 3 + 3 + 2);
  });
});

describe('validateManifest', () => {
  it('accepts valid entries and ignores $comment keys', () => {
    const r = validateManifest({
      $comment: 'hi',
      'prop/tree': { file: 'kenney/tree.glb', scale: 1.5, rotationY: 90, offsetY: 0.1 },
      'pet/cat': { file: 'cat.gltf' },
    });
    expect(r).toEqual({
      ok: true,
      value: {
        'prop/tree': { file: 'kenney/tree.glb', scale: 1.5, rotationY: 90, offsetY: 0.1 },
        'pet/cat': { file: 'cat.gltf' },
      },
    });
  });

  it('rejects non-objects', () => {
    expect(validateManifest(null).ok).toBe(false);
    expect(validateManifest([]).ok).toBe(false);
  });

  it.each([
    [{ 'prop/rocket': { file: 'a.glb' } }, /unknown model slot/],
    [{ 'prop/tree': 'tree.glb' }, /must be an object/],
    [{ 'prop/tree': { file: 'tree.fbx' } }, /relative \.glb/],
    [{ 'prop/tree': { file: '../secret.glb' } }, /relative \.glb/],
    [{ 'prop/tree': { file: '/abs.glb' } }, /relative \.glb/],
    [{ 'prop/tree': { file: 'https://evil.example/x.glb' } }, /relative \.glb/],
    [{ 'prop/tree': { file: 'ok.glb', scale: 'big' } }, /"scale" must be a number/],
  ])('reports problems: %j', (input, message) => {
    const r = validateManifest(input);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join('\n')).toMatch(message);
  });
});

describe('fetchManifest', () => {
  const respond = (body: unknown, ok = true) =>
    vi.fn(() => Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response));

  it('returns the validated manifest', async () => {
    const m = await fetchManifest('/m.json', respond({ 'prop/tree': { file: 't.glb' } }));
    expect(m).toEqual({ 'prop/tree': { file: 't.glb' } });
  });

  it('treats missing, invalid or unreachable manifests as empty', async () => {
    const warn = vi.fn();
    expect(await fetchManifest('/m.json', respond({}, false))).toEqual({});
    expect(await fetchManifest('/m.json', respond({ nope: 1 }), warn)).toEqual({});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown model slot'));
    expect(
      await fetchManifest(
        '/m.json',
        vi.fn(() => Promise.reject(new Error('offline'))),
      ),
    ).toEqual({});
  });

  it('warns on the console by default', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await fetchManifest('/m.json', respond({ nope: 1 }));
    expect(spy).toHaveBeenCalled();
  });

  it('uses global fetch by default', async () => {
    vi.stubGlobal('fetch', respond({}));
    expect(await fetchManifest('/m.json')).toEqual({});
    vi.unstubAllGlobals();
  });
});

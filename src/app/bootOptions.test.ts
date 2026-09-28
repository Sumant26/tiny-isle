import { describe, expect, it } from 'vitest';
import { resolveBootOptions, seededRandom } from './bootOptions';

describe('resolveBootOptions', () => {
  it('production: no debug hook, high quality on big screens', () => {
    expect(resolveBootOptions({ mode: 'production', search: '', smallScreen: false })).toEqual({
      quality: 'high',
      debug: false,
      visual: false,
      frozenTime: false,
    });
  });

  it('uses low quality on small screens and in e2e builds', () => {
    expect(resolveBootOptions({ mode: 'production', search: '', smallScreen: true }).quality).toBe(
      'low',
    );
    expect(resolveBootOptions({ mode: 'e2e', search: '', smallScreen: false }).quality).toBe('low');
  });

  it('enables the debug hook outside production', () => {
    expect(resolveBootOptions({ mode: 'development', search: '', smallScreen: false }).debug).toBe(
      true,
    );
  });

  it('visual mode freezes time and seeds randomness, but never in production', () => {
    const v = resolveBootOptions({ mode: 'e2e', search: '?visual', smallScreen: false });
    expect(v).toMatchObject({ visual: true, frozenTime: true, seed: 1 });
    expect(typeof v.random).toBe('function');
    expect(
      resolveBootOptions({ mode: 'production', search: '?visual', smallScreen: false }).visual,
    ).toBe(false);
  });
});

describe('seededRandom', () => {
  it('is deterministic and in [0, 1)', () => {
    const a = seededRandom(5);
    const b = seededRandom(5);
    for (let i = 0; i < 20; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

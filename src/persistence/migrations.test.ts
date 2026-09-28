import { describe, expect, it } from 'vitest';
import { migrate, SAVE_VERSION } from './migrations';

describe('migrate', () => {
  it('is a no-op for the current version', () => {
    const s = { a: 1 };
    expect(migrate(s, SAVE_VERSION)).toEqual({ ok: true, value: s });
  });

  it('applies migrations in order', () => {
    const r = migrate({ n: 1 }, 1, 3, {
      1: (s) => ({ ...s, n: (s.n as number) + 1, v2: true }),
      2: (s) => ({ ...s, n: (s.n as number) * 10 }),
    });
    expect(r).toEqual({ ok: true, value: { n: 20, v2: true } });
  });

  it('fails on missing migrations, bad versions and future saves', () => {
    expect(migrate({}, 1, 2, {})).toEqual({ ok: false, error: 'no migration from v1' });
    expect(migrate({}, 0).ok).toBe(false);
    expect(migrate({}, 1.5).ok).toBe(false);
    expect(migrate({}, SAVE_VERSION + 1)).toEqual({
      ok: false,
      error: 'save is from a newer version of the game',
    });
  });
});

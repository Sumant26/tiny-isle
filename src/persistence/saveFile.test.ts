// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { makeState } from '../test/fixtures';
import { exportSave, importSave } from './saveFile';
import { serialize } from './saveManager';

describe('exportSave', () => {
  it('downloads a JSON file named after the day', () => {
    const create = vi.fn(() => 'blob:x');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const name = exportSave(makeState({ day: 7 }));
    expect(name).toBe('tiny-isle-day-7.json');
    expect(click).toHaveBeenCalled();
    expect(revoke).toHaveBeenCalledWith('blob:x');
    expect(document.querySelector('a')).toBeNull();
  });
});

describe('importSave', () => {
  it('loads a valid file', async () => {
    const s = makeState();
    expect(await importSave(new Blob([serialize(s)]))).toEqual({ ok: true, value: s });
  });

  it('rejects huge or invalid files', async () => {
    expect(await importSave(new Blob(['x'.repeat(1_000_001)]))).toEqual({
      ok: false,
      error: 'file is too large',
    });
    expect((await importSave(new Blob(['nope']))).ok).toBe(false);
  });
});

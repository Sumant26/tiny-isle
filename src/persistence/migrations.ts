import type { Result } from './schema';

/** Bump when the saved state shape changes, and add a migration from the previous version. */
export const SAVE_VERSION = 1;

export type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

/**
 * migrations[n] upgrades a version-n save to version n+1. Example for a future v2:
 *   1: (s) => ({ ...s, pets: [] }),
 */
export const MIGRATIONS: Readonly<Record<number, Migration>> = {};

export const migrate = (
  state: Record<string, unknown>,
  fromVersion: number,
  toVersion: number = SAVE_VERSION,
  migrations: Readonly<Record<number, Migration>> = MIGRATIONS,
): Result<Record<string, unknown>> => {
  if (!Number.isInteger(fromVersion) || fromVersion < 1) return { ok: false, error: 'bad version' };
  if (fromVersion > toVersion)
    return { ok: false, error: 'save is from a newer version of the game' };
  let current = state;
  for (let v = fromVersion; v < toVersion; v++) {
    const m = migrations[v];
    if (!m) return { ok: false, error: `no migration from v${v}` };
    current = m(current);
  }
  return { ok: true, value: current };
};

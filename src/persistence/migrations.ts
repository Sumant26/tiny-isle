import type { Result } from './schema';

/** Bump when the saved state shape changes, and add a migration from the previous version. */
export const SAVE_VERSION = 3;

export type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

/**
 * migrations[n] upgrades a version-n save to version n+1.
 */
export const MIGRATIONS: Readonly<Record<number, Migration>> = {
  1: (s) => ({
    ...s,
    season: 'spring',
    cookedInventory: {},
    fishInventory: {},
    unlockedRecipes: ['carrot_soup'],
    catHappiness: 0,
    achievements: [],
    journal: ['Arrived on the peaceful Tiny Isle.'],
    settings: {
      ...(typeof s.settings === 'object' && s.settings !== null
        ? s.settings
        : { muted: false, volume: 0.6 }),
      musicVolume: 0.5,
      highContrast: false,
      largeText: false,
      colorblindMode: false,
      language: 'en',
    },
    stats: {
      ...(typeof s.stats === 'object' && s.stats !== null ? s.stats : { harvested: 0, earned: 0 }),
      cooked: 0,
      fishCaught: 0,
      catPets: 0,
    },
  }),
  2: (s) => ({
    ...s,
    forageInventory: { mushroom: 0, berry: 0, seashell: 0, wildflower: 0 },
    fruitInventory: { apple: 0, cherry: 0, citrus: 0 },
    isletUnlocked: false,
    pets: ['cat'],
    activeMusicTrack: 'morning_breeze',
    stats: {
      ...(typeof s.stats === 'object' && s.stats !== null
        ? s.stats
        : { harvested: 0, earned: 0, cooked: 0, fishCaught: 0, catPets: 0 }),
      foraged: 0,
    },
  }),
};

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

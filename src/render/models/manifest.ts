import { CROP_IDS, DECORATION_IDS, VISITORS } from '../../core/config';
import type { CropStage } from '../../core/types';

/**
 * Which 3D model files replace which procedural models. Lives in
 * `public/models/manifest.json`; see docs/ASSETS.md.
 */
export interface ModelEntry {
  /** Path relative to `public/models/`, e.g. "kenney/crop_carrot.glb". */
  readonly file: string;
  /** Uniform scale applied after loading (models come in many sizes). */
  readonly scale?: number;
  /** Rotation around Y in degrees, to face the model the way the game expects. */
  readonly rotationY?: number;
  /** Vertical offset in world units. */
  readonly offsetY?: number;
}

export type ModelManifest = Readonly<Record<string, ModelEntry>>;

const STAGES: readonly CropStage[] = ['seed', 'sprout', 'growing', 'ripe'];

/** Every slot a model can fill. Anything not listed keeps its procedural model. */
export const MODEL_KEYS: readonly string[] = [
  ...CROP_IDS.flatMap((c) => STAGES.map((s) => `crop/${c}/${s}`)),
  ...DECORATION_IDS.map((d) => `decoration/${d}`),
  ...VISITORS.map((v) => `visitor/${v.id}`),
  'prop/tree',
  'prop/market',
  'prop/cottage',
  'char/farmer',
  'pet/cat',
];

export type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Validates a manifest. Files must be relative paths ending in .glb/.gltf
 * (no URLs), so models are always served and cached with the game.
 */
export const validateManifest = (value: unknown): Result<ModelManifest> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { ok: false, errors: ['manifest must be an object'] };
  }
  const errors: string[] = [];
  const out: Record<string, ModelEntry> = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (key.startsWith('$')) continue; // "$comment" etc.
    if (!MODEL_KEYS.includes(key)) {
      errors.push(`unknown model slot "${key}"`);
      continue;
    }
    if (typeof raw !== 'object' || raw === null) {
      errors.push(`${key}: entry must be an object`);
      continue;
    }
    const e = raw as Record<string, unknown>;
    const file = e.file;
    if (
      typeof file !== 'string' ||
      !/^[\w./-]+\.(glb|gltf)$/i.test(file) ||
      file.includes('..') ||
      file.startsWith('/')
    ) {
      errors.push(`${key}: "file" must be a relative .glb/.gltf path`);
      continue;
    }
    for (const opt of ['scale', 'rotationY', 'offsetY'] as const) {
      if (e[opt] !== undefined && !isFiniteNumber(e[opt]))
        errors.push(`${key}: "${opt}" must be a number`);
    }
    out[key] = {
      file,
      ...(isFiniteNumber(e.scale) ? { scale: e.scale } : {}),
      ...(isFiniteNumber(e.rotationY) ? { rotationY: e.rotationY } : {}),
      ...(isFiniteNumber(e.offsetY) ? { offsetY: e.offsetY } : {}),
    };
  }
  return errors.length ? { ok: false, errors } : { ok: true, value: out };
};

/** Fetches and validates the manifest. A missing or broken manifest means "no models". */
export const fetchManifest = async (
  url: string,
  fetchFn: typeof fetch = fetch,
  warn: (msg: string) => void = (m) => {
    console.warn(m);
  },
): Promise<ModelManifest> => {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return {};
    const parsed = validateManifest(await res.json());
    if (parsed.ok) return parsed.value;
    warn(`[tiny-isle] model manifest has problems:\n  ${parsed.errors.join('\n  ')}`);
    return {};
  } catch {
    return {};
  }
};

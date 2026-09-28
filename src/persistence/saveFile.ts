import type { GameState } from '../core/types';
import type { Result } from './schema';
import { deserialize, serialize } from './saveManager';

/** Triggers a browser download of the save, so players can back up or move their island. */
export const exportSave = (
  state: GameState,
  doc: Document = document,
  now: Date = new Date(),
): string => {
  const json = serialize(state, now);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = doc.createElement('a');
  a.href = url;
  a.download = `tiny-isle-day-${state.day}.json`;
  doc.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return a.download;
};

export const importSave = async (file: Blob): Promise<Result<GameState>> => {
  if (file.size > 1_000_000) return { ok: false, error: 'file is too large' };
  return deserialize(await file.text());
};

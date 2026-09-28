import { FORAGE, type ForageDef } from '../config';
import { nextRandom } from '../rng';
import type { Cell, ForageId, ForageNode, GameState, Outcome } from '../types';
import { unlockAchievement } from './achievements';
import { chain, ok, reject } from './outcome';
import { addBloom } from './progression';

export const forageDef = (id: ForageId): ForageDef => FORAGE[id];

export const FORAGE_SPAWN_CANDIDATES: readonly { readonly cell: Cell; readonly type: ForageId }[] =
  [
    { cell: { x: 13, z: 5 }, type: 'mushroom' },
    { cell: { x: 12, z: 2 }, type: 'mushroom' },
    { cell: { x: 3, z: 6 }, type: 'berry' },
    { cell: { x: 2, z: 7 }, type: 'berry' },
    { cell: { x: 1, z: 12 }, type: 'seashell' },
    { cell: { x: 2, z: 13 }, type: 'seashell' },
    { cell: { x: 8, z: 13 }, type: 'seashell' },
    { cell: { x: 10, z: 2 }, type: 'wildflower' },
    { cell: { x: 5, z: 1 }, type: 'wildflower' },
    { cell: { x: 13, z: 8 }, type: 'wildflower' },
  ];

export const spawnForageNodes = (state: GameState): GameState => {
  let seed = state.rngSeed;
  const existing = state.forageNodes ?? [];
  if (existing.length >= 5) return state;

  const available = FORAGE_SPAWN_CANDIDATES.filter(
    (c) => !existing.some((e) => e.cell.x === c.cell.x && e.cell.z === c.cell.z),
  );
  if (available.length === 0) return state;

  const nextNodes: ForageNode[] = [...existing];
  const toSpawn = Math.min(3, available.length);

  for (let i = 0; i < toSpawn; i++) {
    const r = nextRandom(seed);
    seed = r.nextSeed;
    const idx = Math.floor(r.value * available.length);
    const candidate = available.splice(idx, 1)[0];
    if (candidate) {
      nextNodes.push({
        id: `forage_${state.day}_${i}_${Math.floor(r.value * 1000)}`,
        type: candidate.type,
        cell: candidate.cell,
      });
    }
  }

  return {
    ...state,
    forageNodes: nextNodes,
    rngSeed: seed,
  };
};

export const forageItem = (state: GameState, nodeId: string): Outcome => {
  const nodes = state.forageNodes ?? [];
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return reject(state, 'no-crop');

  const def = FORAGE[node.type];
  const currentCount = state.forageInventory?.[node.type] ?? 0;
  const nextNodes = nodes.filter((n) => n.id !== nodeId);

  const next: GameState = {
    ...state,
    forageNodes: nextNodes,
    forageInventory: {
      ...(state.forageInventory ?? { mushroom: 0, berry: 0, seashell: 0, wildflower: 0 }),
      [node.type]: currentCount + 1,
    },
    stats: {
      ...state.stats,
      foraged: (state.stats.foraged ?? 0) + 1,
    },
  };

  let outcome = ok(next, { type: 'foraged', item: node.type });
  outcome = chain(outcome, (s) => addBloom(s, def.bloomPoints));
  outcome = chain(outcome, (s) => unlockAchievement(s, 'forager_master'));

  return outcome;
};

import { BALANCE, VISITORS, type VisitorDef } from '../config';
import { nextRandom } from '../rng';
import type { CropId, GameState, Outcome, RecipeId, VisitorId } from '../types';
import { addCount, chain, ok, reject } from './outcome';
import { addBloom, unlockCrop } from './progression';

export const visitorDef = (id: VisitorId): VisitorDef => {
  const def = VISITORS.find((v) => v.id === id);
  if (!def) throw new Error(`Unknown visitor: ${id}`);
  return def;
};

/** The next visitor who could come: not yet helped, and wanting a crop the player can grow. */
export const nextEligibleVisitor = (state: GameState): VisitorDef | null =>
  VISITORS.find(
    (v) => !state.visitorsHelped.includes(v.id) && state.unlockedCrops.includes(v.wants.crop),
  ) ?? null;

/** Called each morning: maybe a visitor wanders over. */
export const maybeVisitorArrives = (state: GameState): Outcome => {
  if (state.visitor || state.day < BALANCE.firstVisitorDay) return ok(state);
  const candidate = nextEligibleVisitor(state);
  if (!candidate) return ok(state);
  const roll = nextRandom(state.rngSeed);
  const seeded = { ...state, rngSeed: roll.nextSeed };
  if (roll.value >= BALANCE.visitorChance) return ok(seeded);
  return ok(
    { ...seeded, visitor: { id: candidate.id, arrivedOnDay: state.day } },
    { type: 'visitor-arrived', visitor: candidate.id },
  );
};

export const GIFT_SEEDS = 3;

export const fulfillVisitor = (state: GameState): Outcome => {
  if (!state.visitor) return reject(state, 'no-visitor');
  const def = visitorDef(state.visitor.id);
  const { crop, quantity } = def.wants;
  if (state.inventory.produce[crop] < quantity) return reject(state, 'not-enough-produce');

  const journal = state.journal ?? [];
  const entry = `Helped ${def.name} with ${quantity} ${crop}(s). ${def.thanks}`;
  const nextJournal = journal.includes(entry) ? journal : [...journal, entry];

  let next: GameState = {
    ...state,
    coins: state.coins + def.rewardCoins,
    inventory: { ...state.inventory, produce: addCount(state.inventory.produce, crop, -quantity) },
    visitor: null,
    visitorsHelped: [...state.visitorsHelped, def.id],
    journal: nextJournal,
  };
  let outcome = ok(
    next,
    { type: 'visitor-helped', visitor: def.id, unlocked: def.unlocks },
    { type: 'journal-entry', entry },
  );
  if (def.unlocks) {
    const gift = def.unlocks;
    outcome = chain(outcome, (s) => unlockCrop(s, gift));
    next = outcome.state;
    outcome = {
      ...outcome,
      state: {
        ...next,
        inventory: { ...next.inventory, seeds: addCount(next.inventory.seeds, gift, GIFT_SEEDS) },
      },
    };
  }
  return chain(outcome, (s) => addBloom(s, BALANCE.visitorBloomPoints));
};

export const giftVisitor = (state: GameState, recipe: RecipeId | 'tea'): Outcome => {
  if (!state.visitor) return reject(state, 'no-visitor');
  const def = visitorDef(state.visitor.id);

  if (recipe !== 'tea') {
    const count = state.cookedInventory?.[recipe] ?? 0;
    if (count <= 0) return reject(state, 'not-enough-ingredients');
  }

  const giftDesc =
    recipe === 'tea'
      ? 'freshly brewed island herbal tea'
      : `warm homemade ${recipe.replace(/_/g, ' ')}`;
  const journal = state.journal ?? [];
  const entry = `Gifted ${def.name} ${giftDesc}. In return, ${def.name} shared heirloom seeds and cozy friendship.`;
  const nextJournal = journal.includes(entry) ? journal : [...journal, entry];

  // Gift rewards: 3 rare seeds (sunflower or pumpkin), 30 bonus coins, and 8 bloom points
  const giftSeed: CropId = state.unlockedCrops.includes('sunflower') ? 'sunflower' : 'carrot';

  const cooked =
    recipe === 'tea'
      ? state.cookedInventory
      : {
          ...state.cookedInventory,
          [recipe]: (state.cookedInventory?.[recipe] ?? 1) - 1,
        };

  const next: GameState = {
    ...state,
    coins: state.coins + 30,
    ...(cooked !== undefined ? { cookedInventory: cooked } : {}),
    inventory: {
      ...state.inventory,
      seeds: addCount<CropId>(state.inventory.seeds, giftSeed, 3),
    },
    journal: nextJournal,
  };

  let outcome = ok(
    next,
    {
      type: 'visitor-gifted',
      visitor: def.id,
      gift: `3 ${giftSeed} seeds and 30 gold coins`,
    },
    { type: 'journal-entry', entry },
  );

  outcome = chain(outcome, (s) => addBloom(s, 8));
  return outcome;
};

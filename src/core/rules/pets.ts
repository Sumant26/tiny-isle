import { PETS } from '../config';
import type { GameState, Outcome, PetId } from '../types';
import { unlockAchievement } from './achievements';
import { chain, ok, reject } from './outcome';

export const adoptPet = (state: GameState, petId: PetId): Outcome => {
  const currentPets = state.pets ?? ['cat'];
  if (currentPets.includes(petId)) {
    return reject(state, 'already-owned');
  }
  const def = PETS[petId];
  if (state.coins < def.cost) {
    return reject(state, 'not-enough-coins');
  }

  const nextPets = [...currentPets, petId];
  const next: GameState = {
    ...state,
    coins: state.coins - def.cost,
    pets: nextPets,
  };

  let outcome = ok(next, { type: 'pet-adopted', pet: petId });
  if (nextPets.length >= 2) {
    outcome = chain(outcome, (s) => unlockAchievement(s, 'pet_cat'));
  }
  return outcome;
};

export const petAnimal = (state: GameState, petId: PetId): Outcome => {
  const currentPets = state.pets ?? ['cat'];
  if (!currentPets.includes(petId)) {
    return reject(state, 'no-crop');
  }
  const def = PETS[petId];
  const currentHappiness = (state.catHappiness ?? 0) + 1;
  const currentPetsStat = (state.stats.catPets ?? 0) + 1;

  const next: GameState = {
    ...state,
    catHappiness: currentHappiness,
    stats: {
      ...state.stats,
      catPets: currentPetsStat,
    },
  };

  let outcome = ok(
    next,
    { type: 'pet-cat', happiness: currentHappiness },
    { type: 'pet-interacted', pet: petId, sound: def.sound },
  );
  outcome = chain(outcome, (s) => unlockAchievement(s, 'pet_cat'));
  return outcome;
};

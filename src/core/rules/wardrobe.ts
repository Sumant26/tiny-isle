import type { GameState, HatId, OutfitId, Outcome, PetAccessoryId, PetId } from '../types';

export const changeOutfit = (state: GameState, outfit: OutfitId): Outcome => {
  if (state.currentOutfit === outfit) {
    return { state, events: [] };
  }
  return {
    state: {
      ...state,
      currentOutfit: outfit,
    },
    events: [{ type: 'outfit-changed', outfit }],
  };
};

export const changeHat = (state: GameState, hat: HatId): Outcome => {
  if (state.currentHat === hat) {
    return { state, events: [] };
  }
  return {
    state: {
      ...state,
      currentHat: hat,
    },
    events: [{ type: 'hat-changed', hat }],
  };
};

export const setPetAccessory = (
  state: GameState,
  pet: PetId,
  accessory: PetAccessoryId,
): Outcome => {
  const currentAccessories = state.petAccessories ?? {};
  if (currentAccessories[pet] === accessory) {
    return { state, events: [] };
  }
  return {
    state: {
      ...state,
      petAccessories: {
        ...currentAccessories,
        [pet]: accessory,
      },
    },
    events: [{ type: 'pet-accessory-changed', pet, accessory }],
  };
};

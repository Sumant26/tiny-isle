import { describe, expect, it } from 'vitest';
import { createInitialState } from '../initialState';
import { adoptPet, petAnimal } from './pets';

describe('pets rules', () => {
  it('adopts a new pet when player has enough coins', () => {
    const s = { ...createInitialState(1), coins: 50 };
    const r = adoptPet(s, 'puppy');
    expect(r.state.coins).toBe(10);
    expect(r.state.pets).toContain('puppy');
    expect(r.events).toContainEqual({ type: 'pet-adopted', pet: 'puppy' });
  });

  it('rejects adopting a pet already owned', () => {
    const s = { ...createInitialState(1), pets: ['cat' as const], coins: 50 };
    const r = adoptPet(s, 'cat');
    expect(r.events).toContainEqual({ type: 'rejected', reason: 'already-owned' });
  });

  it('rejects adopting a pet when coins are insufficient', () => {
    const s = { ...createInitialState(1), coins: 5 };
    const r = adoptPet(s, 'puppy');
    expect(r.events).toContainEqual({ type: 'rejected', reason: 'not-enough-coins' });
  });

  it('interacts with an owned pet', () => {
    const s = { ...createInitialState(1), pets: ['cat' as const, 'puppy' as const] };
    const r = petAnimal(s, 'puppy');
    expect(r.events).toContainEqual(
      expect.objectContaining({ type: 'pet-interacted', pet: 'puppy' }),
    );
  });
});

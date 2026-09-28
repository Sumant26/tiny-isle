# ADR 0002: Pure core, reducer and custom store

- Status: accepted
- Date: 2026-09-28

## Context

Game rules must be easy to test and reason about, saves must be reliable, and rendering must update efficiently.

## Decision

- Game rules are pure functions `(state, …args) => { state, events }` in `src/core`.
- A small custom store (no library) holds immutable state, supports sliced `select` subscriptions and an event channel.
- Randomness is a seeded PRNG stored in state.

## Alternatives considered

- **Mutable ECS**: great for thousands of entities; overkill for a 24-tile garden and harder to save/test.
- **Redux / Zustand**: fine, but add dependencies for ~100 lines of code we control, and neither has a first-class event channel.

## Consequences

- Rules are trivially unit-testable; the full rules layer runs in milliseconds.
- Views must diff by reference, which is cheap thanks to structural sharing.
- Adding a feature means: action → reducer case → rule → test → view/UI subscription.

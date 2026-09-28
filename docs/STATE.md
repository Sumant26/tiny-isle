# State management

All game state lives in one immutable `GameState` object (`src/core/types.ts`). It changes only by dispatching an `Action` to the store.

## The pieces

```
Action ──dispatch──▶ reducer(state, action) ──▶ { state, events }
                        │                            │
                        └── core/rules/*             ├─▶ select(...) listeners (views, UI, save)
                                                     └─▶ onEvent(...) listeners (sound, particles, toasts)
```

### Actions — `src/state/actions.ts`

Serialisable objects such as `{ type: 'tile/use', index: 4 }`. Always create them with the `actions` helpers so call sites are typed:

```ts
store.dispatch(actions.buySeeds('carrot', 5));
```

### Reducer — `src/state/reducer.ts`

A `switch` that delegates to pure rules in `src/core/rules`. Each rule returns an `Outcome`:

```ts
interface Outcome {
  state: GameState;
  events: readonly GameEvent[];
}
```

Rules never throw for player mistakes. They return the **same state object** plus `{ type: 'rejected', reason }`, which the UI turns into a gentle hint.

### Store — `src/state/store.ts`

| Method                                                    | Use it for                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| `getState()`                                              | Reading current state inside handlers                      |
| `dispatch(action)`                                        | Changing state. Returns the events produced                |
| `select(selector, listener, { equals, fireImmediately })` | Reacting to one slice. Fires only when that slice changes  |
| `subscribe(listener)`                                     | Reacting to any change (used by autosave)                  |
| `onEvent(listener)`                                       | Reacting to things that happened (sounds, effects, toasts) |

Dispatching from inside the reducer throws, which keeps updates predictable.

### Selectors — `src/state/selectors.ts`

Small functions that read or derive data (`selectCoins`, `selectBloomInfo`, `selectVisitorInfo`). If a selector builds a new object, pass `equals: shallowEqual` so listeners don't fire needlessly.

## Why it is efficient

- **Structural sharing.** Updating tile 4 creates a new `tiles` array and a new tile 4; the other 23 tiles are the same objects. `PlotView` compares tile references and touches only tile 4's meshes.
- **No-op detection.** Rules return the identical state when nothing changes (selecting the tool you already hold, rejected actions), so no listener runs.
- **Sliced subscriptions.** The HUD's coin label listens to `selectCoins` only; walking around never re-renders it.
- **Debounced saves.** Ordinary changes are saved at most every 1.5 s; important moments (new day, purchases, helping a visitor) save immediately; page hide flushes.

## Determinism

Randomness (weather, visitor arrivals) uses a seeded PRNG whose seed is **part of the state**. Reloading a save gives the same future, and tests can pick seeds that force rain or a visitor.

## Saving

`src/persistence` stores `{ version, savedAt, state }`. On load it parses, migrates from older versions, and validates every field. A bad save is ignored (the player starts fresh) rather than crashing the game.

When you change the shape of `GameState`:

1. Bump `SAVE_VERSION` in `migrations.ts`.
2. Add `MIGRATIONS[oldVersion] = (s) => ({ ...s, newField: default })`.
3. Update `validateState` in `schema.ts`.
4. Add tests for the migration.

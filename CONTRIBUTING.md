# Contributing to Tiny Isle

Thanks for helping make the island cozier!

## Setup

1. Install Node.js 22.12+ (`nvm use` reads `.nvmrc`).
2. `npm install` (installs Husky git hooks).
3. `npm run dev`.

Recommended VS Code extensions are listed in `.vscode/extensions.json`.

## Workflow

1. Create a branch: `feat/pumpkin-patch`, `fix/sleep-overlay`.
2. Make your change with tests (see [docs/TESTING.md](docs/TESTING.md)).
3. `npm run check` must pass. Run `npm run test:e2e` if you touched gameplay, rendering or UI.
4. Commit using [Conventional Commits](https://www.conventionalcommits.org). The `commit-msg` hook enforces it.
   - `feat: add rain sounds`
   - `fix(ui): keep hotbar on screen on small phones`
   - `test(core): cover tomato regrowth`
5. Open a pull request. The PR title must also be a conventional commit.

## Where things go

| You want to…                      | Change                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Add a crop, decoration or visitor | `src/core/config.ts` (+ a model in `src/render/builders/`, + an icon in `src/ui/text.ts`)   |
| Change a game rule                | `src/core/rules/*` (pure functions) and its `.test.ts`                                      |
| Add a new player action           | `src/state/actions.ts` → `src/state/reducer.ts` → a rule in `core/rules`                    |
| Show something new in 3D          | A view in `src/render/views/` that subscribes with `store.select`                           |
| Add UI                            | A component in `src/ui/` mounted from `mountUI.ts`                                          |
| Change the saved state shape      | Bump `SAVE_VERSION`, add a migration in `src/persistence/migrations.ts`, update `schema.ts` |

## Rules of thumb

- `src/core` never imports Babylon or touches the DOM.
- State is immutable. Return the **same object** when nothing changed, and keep unchanged branches by reference.
- Rules never throw for player mistakes; they return a `rejected` event with a reason.
- Randomness only comes from the seeded RNG in state.
- Keep it cozy: no fail states, no pressure.

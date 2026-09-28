# Testing

| Kind        | Tool                                  | Where                                   | Command            |
| ----------- | ------------------------------------- | --------------------------------------- | ------------------ |
| Unit        | Vitest                                | `src/**/*.test.ts` next to the code     | `npm test`         |
| Integration | Vitest + jsdom + Babylon `NullEngine` | `src/app/Game.test.ts`, `src/render/**` | `npm test`         |
| End-to-end  | Playwright (Chromium)                 | `e2e/*.spec.ts`                         | `npm run test:e2e` |

Coverage thresholds are enforced in `vitest.config.ts` (95% lines/statements/functions, 90% branches). Open `coverage/index.html` after `npm run test:coverage`.

## What is tested where

| Area                           | Tests                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rules (`core/rules`)           | Every rule's success path, every rejection reason, state identity on no-ops                                                                               |
| RNG, pathfinding, world layout | Determinism, walls, unreachable goals, every plot tile reachable                                                                                          |
| Store                          | Sliced notifications, events, unsubscribe during notify, re-entrant dispatch guard                                                                        |
| Persistence                    | Round-trip, garbage input, each invalid field, migrations, debounce/flush, storage failures                                                               |
| Rendering                      | Every builder in a headless `NullEngine` scene; views react to state (tile sync, visitors, decorations, butterflies, rain); lighting transitions; picking |
| UI                             | Each component in jsdom: rendering, live updates, clicks, two-step "new game" confirm                                                                     |
| Game                           | Full day loop, keyboard commands, import/export, save/resume, corrupt save recovery                                                                       |
| E2E                            | Boots and draws, real canvas click → walk → till, full day, market, keyboard, reload persistence, phone layout                                            |

## Helpers

- `src/test/fixtures.ts`: `makeState`, `withTile`, `withProduce`, `unlockAll`, `seedWhereFirstRoll` (find an RNG seed that forces rain/visitors).
- `src/test/babylon.ts`: `createTestContext()` (NullEngine scene), `advance(ctx, seconds)` (drive tweens and per-frame observers), `seededRandom()`.
- `src/test/fakeAudio.ts`: a minimal Web Audio fake.

## E2E notes

- Playwright builds with `--mode e2e`, which keeps the `window.__tinyIsle` debug hook (never present in production builds).
- Tests click the real canvas using `__tinyIsle.projectCell(cell)` to get pixel positions, so picking is covered without brittle coordinates.
- CI has no GPU, so Chromium uses SwiftShader. It's slow (a few fps) and the e2e build turns off shadows and glow; timeouts are generous.
- First run locally: `npx playwright install chromium`.

## Writing a new test

- Pure logic: build a state with fixtures, call the rule, assert on `state` and `events`.
- A new view: create it with `createTestContext()` and a real store, dispatch actions, assert on scene nodes.
- A new UI component: add `// @vitest-environment jsdom` at the top and query by `data-testid`.

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

## Visual tests

`e2e/visual.spec.ts` compares screenshots against baselines in `e2e/__screenshots__/`. The page is opened with `?visual`, which:

- freezes time (every per-frame animation holds still),
- seeds all randomness (flower placement, butterflies, weather),
- starts from a fixed new island and blocks web fonts.

So the same code always draws the same pixels, and any change larger than 1% of pixels fails CI with a diff image (download the **visual-diffs** artifact).

Rendering and fonts differ between operating systems, so baselines are only generated in CI's Docker image (`mcr.microsoft.com/playwright`). To create or refresh them after an intentional visual change:

**Actions → Update visual baselines → Run workflow** (choose your branch). It commits the new PNGs to that branch; review them in the PR.

Running visual tests locally on Windows or macOS creates `*-win32.png`/`*-darwin.png` baselines for your machine only; they're git-ignored.

## Bundle-size budget

`npm run size` (after `npm run build`) checks each chunk's gzipped size against `.size-limit.json`. CI fails if a chunk grows past its limit and prints a size table in the job summary. If growth is intended, raise the limit in the same PR and explain why.

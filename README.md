# 🌱 Tiny Isle

A cozy, soft-3D gardening game on a tiny floating island. Till, plant, water and harvest; sell your crops, help visitors, and watch your island bloom. There are no timers and no way to fail.

Built with **Babylon.js**, **TypeScript** and **Vite**. Runs in any modern browser, on desktop and mobile.

## Quick start

Requires **Node.js 22.12+** (see `.nvmrc`).

```bash
git init            # Husky hooks need a git repository
npm install         # also installs the git hooks
npm run dev         # http://localhost:5173
```

## How to play

| Action                       | Mouse / touch         | Keyboard                             |
| ---------------------------- | --------------------- | ------------------------------------ |
| Walk / use tool on a patch   | Click a tile          | WASD / arrows, then Space            |
| Choose tool                  | Hotbar                | 1 hoe · 2 seeds · 3 water · 4 basket |
| Change seed                  | › button              | Q / E                                |
| Market (buy, sell, decorate) | 🏪 or click the stand | B                                    |
| Sleep to the next day        | 🌙                    | Z                                    |
| Look around                  | Drag / pinch          |                                      |
| Mute                         | Settings ⚙            | M                                    |

Watered crops grow one stage each night. Rain waters everything for you. Visitors ask for small gifts and reward you with coins and new seeds. Harvests, decorations and helping visitors raise your island's **bloom**, which unlocks new crops and brings butterflies.

## Scripts

| Script                            | What it does                                                             |
| --------------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                     | Start the dev server with hot reload                                     |
| `npm run build`                   | Typecheck and build to `dist/`                                           |
| `npm run preview`                 | Serve the production build                                               |
| `npm test`                        | Run unit and integration tests (Vitest)                                  |
| `npm run test:watch`              | Tests in watch mode                                                      |
| `npm run test:coverage`           | Tests with coverage report (`coverage/index.html`)                       |
| `npm run test:e2e`                | Browser tests (Playwright). First run: `npx playwright install chromium` |
| `npm run lint` / `lint:fix`       | ESLint (strict, type-aware)                                              |
| `npm run format` / `format:check` | Prettier                                                                 |
| `npm run typecheck`               | TypeScript, no emit                                                      |
| `npm run check`                   | Everything CI checks except e2e                                          |

## Project layout

```
src/
  core/         Pure game logic: types, content config, rules, pathfinding, RNG (no DOM, no Babylon)
  state/        Actions, reducer, store with selectors and events
  persistence/  Versioned saves, validation, migrations, storage adapters, export/import
  render/       Babylon.js scene: builders (models), views (sync with state), lighting, effects
  ui/           DOM HUD, hotbar, market, visitor card, settings, toasts
  input/        Keyboard mapping
  audio/        Web Audio synth sounds
  app/          Composition root (Game), interaction controller, debug hook
  test/         Shared test helpers
e2e/            Playwright tests
docs/           Architecture, state, testing, design, roadmap, decisions (ADRs)
```

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) first, then [docs/STATE.md](docs/STATE.md).

## Quality gates

- **Husky** runs `lint-staged` (ESLint + Prettier on staged files) before each commit, checks commit messages follow [Conventional Commits](https://www.conventionalcommits.org), and runs typecheck + tests before each push.
- **GitHub Actions** runs lint, format, typecheck, unit tests with coverage thresholds (95% lines), a production build and Playwright e2e on every push and PR. CodeQL scans weekly. Pushes to `main` deploy to GitHub Pages.
- **Dependabot** opens weekly dependency updates.

## Deploying

Push to `main` on GitHub and enable **Settings → Pages → Source: GitHub Actions**. The site is built with a relative base path, so `dist/` also works on itch.io or any static host.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please read the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
# tiny-isle

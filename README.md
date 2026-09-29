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

## Play anywhere, even offline

Tiny Isle is a **Progressive Web App**. After the first visit it's cached for offline play, and browsers offer **Install** (desktop) or **Add to Home Screen** (phones). When a new version is deployed, the game shows an **Update** button instead of reloading under you.

## Custom 3D models

Every model is built from shapes in code, but you can swap any of them for a low-poly `.glb` from Kenney, Quaternius or Blender by listing it in `public/models/manifest.json`. See [docs/ASSETS.md](docs/ASSETS.md).

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
| `npm run size`                    | Check the bundle-size budget (run `npm run build` first)                 |
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
    models/     Optional glTF model manifest, library and lazy loader
  ui/           DOM HUD, hotbar, market, visitor card, settings, toasts
  input/        Keyboard mapping
  audio/        Web Audio synth sounds
  app/          Composition root (Game), interaction controller, boot options, PWA, crash reports, debug hook
  test/         Shared test helpers
e2e/            Playwright tests (+ __screenshots__/ visual baselines, fixtures/)
public/models/  Your .glb files and manifest.json (empty by default)
build/          Build helpers (Babylon chunk splitting)
docs/           Architecture, state, testing, design, roadmap, decisions (ADRs)
```

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) first, then [docs/STATE.md](docs/STATE.md).

## Quality gates

- **Husky** runs `lint-staged` (ESLint + Prettier on staged files) before each commit, checks commit messages follow [Conventional Commits](https://www.conventionalcommits.org), and runs typecheck + tests before each push.
- **GitHub Actions (CI)** on every push and PR:
  - lint, format, typecheck, and unit tests with coverage thresholds (95% lines);
  - production build plus a **bundle-size budget** (`.size-limit.json`: Babylon ≤ 420 KB gzipped, game code ≤ 40 KB);
  - Playwright end-to-end tests, including offline play and custom-model loading;
  - **screenshot comparison** of five key scenes against committed baselines.
- **CodeQL** scans weekly; **Dependabot** opens weekly dependency updates.

## Releases

Releases are automated with **release-please**. Every push to `main` updates a "chore(main): release x.y.z" pull request whose version and changelog come from your commit messages (`feat:` → minor, `fix:` → patch while below 1.0). Merge it to tag the release, update `CHANGELOG.md` and publish a GitHub release.

## One-time GitHub setup

1. **Settings → Actions → General → Workflow permissions:** "Read and write" and **Allow GitHub Actions to create and approve pull requests** (release-please and the baseline workflow need this).
2. **Actions → Update visual baselines → Run workflow** once, to create the screenshot baselines.
3. Optional: add a `SENTRY_DSN` repository secret to enable opt-in crash reports (see below).

## Crash reports (opt-in)

If the build has a Sentry DSN (`VITE_SENTRY_DSN`, see `.env.example`), **Settings** shows "Share crash reports". It's **off by default**: nothing is loaded or sent until a player turns it on. Only error details are sent, with no saves, no performance tracing and no session replay. Without a DSN the option doesn't appear and the Sentry SDK is never downloaded.

## Deploying

The game is deployed on **Vercel**. Every push to `main` automatically creates a production deployment, and pull requests get instant preview deployments.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please read the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)

# Notes for AI coding assistants

Read `docs/ARCHITECTURE.md` and `docs/STATE.md` before changing code.

- Keep `src/core` pure: no Babylon, no DOM, no `Math.random` (use the seeded RNG in state).
- State is immutable; return the same object for no-ops; keep unchanged branches by reference.
- New gameplay = action (`state/actions.ts`) → reducer case → rule in `core/rules` → tests.
- Import Babylon only from `src/render/babylon.ts`; add side-effect imports there.
- Every change needs tests. Run `npm run check` (and `npm run test:e2e` for UI/gameplay) before finishing.
- Commit messages follow Conventional Commits.
- If you change `GameState`'s shape, bump `SAVE_VERSION` and add a migration.
- Optional features (glTF loader, Sentry) must stay lazily imported; `npm run build && npm run size` must pass.
- Visual changes: CI compares screenshots; baselines are regenerated only via the "Update visual baselines" workflow.
- Don't bump versions or edit released CHANGELOG sections; release-please does that.

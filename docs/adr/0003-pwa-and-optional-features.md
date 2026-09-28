# ADR 0003: PWA, and optional features as lazy chunks

- Status: accepted
- Date: 2026-09-28

## Context

The game should work offline and be installable on phones. We also want crash reports and custom 3D models, but most players will never use either, and Babylon alone is ~390 KB gzipped.

## Decision

- Use vite-plugin-pwa (Workbox `generateSW`) with `registerType: 'prompt'`: the core game is precached; updates are offered with an in-game **Update** button instead of silent reloads.
- Load the Sentry SDK and the glTF loader with dynamic `import()` into named chunks (`sentry`, `gltf`). They're excluded from precache and cached on first use.
- Split Babylon by walking the module graph (`build/babylonChunks.ts`), since loader-only engine code can't be told apart by path.
- Enforce chunk sizes with size-limit in CI.

## Consequences

- First load is unchanged for most players; offline play needs one prior visit.
- Workbox caches must be versioned correctly; `cleanupOutdatedCaches` handles old precaches.
- The chunking plugin relies on Rolldown's module info API; if it changes, the size budget will catch regressions.

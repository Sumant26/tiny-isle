# ADR 0001: Babylon.js for rendering

- Status: accepted
- Date: 2026-09-28

## Context

We want a soft-3D diorama that runs in the browser on desktop and mobile, with shadows, glow, picking, tweens and particles, and room to grow into a full game.

## Decision

Use Babylon.js (`@babylonjs/core`, ES modules) with deep imports through `src/render/babylon.ts`.

## Consequences

- Batteries included (shadows, glow layer, picking, camera behaviours, NullEngine for headless tests).
- Larger than Three.js at its minimum; deep imports and a separate cached chunk keep it manageable (~390 KB gzip).
- Side-effect modules must be imported explicitly; `babylon.ts` is the single place for that.

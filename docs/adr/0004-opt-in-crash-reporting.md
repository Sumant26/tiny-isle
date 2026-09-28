# ADR 0004: Opt-in crash reporting

- Status: accepted
- Date: 2026-09-28

## Context

We want to hear about crashes from real players without tracking them.

## Decision

Sentry, gated twice: the build must have `VITE_SENTRY_DSN`, and the player must turn on "Share crash reports" in Settings (off by default). No tracing, no replay, input breadcrumbs dropped. The preference lives outside the save file, so importing a save never changes consent.

## Consequences

- Fewer reports than opt-out would give, in exchange for respecting players.
- The toggle is hidden in builds without a DSN (e.g. forks and local dev).

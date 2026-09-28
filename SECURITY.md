# Security Policy

Tiny Isle is a client-side game with no server or accounts. The main risks are in dependencies and in loading save files.

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private vulnerability reporting (**Security → Report a vulnerability**) on this repository. You'll get a reply within a week.

## What we do

- Save files (from browser storage or imported) are parsed defensively, size-limited and validated field by field before use (`src/persistence/schema.ts`).
- Dependencies are kept current by Dependabot; CodeQL scans the code weekly.
- No `eval`, no remote code, no third-party scripts at runtime (fonts only).
- Custom model paths from `public/models/manifest.json` must be relative `.glb`/`.gltf` files; URLs and `..` are rejected.

## Privacy

Crash reporting is **opt-in**. It only exists in builds with a Sentry DSN, is off by default, and the SDK isn't downloaded until a player enables it in Settings. Reports contain error details and browser information only: no save data, no performance tracing, no session replay, and input breadcrumbs are dropped. Turning it off stops reporting immediately. The choice is stored in the browser (`tiny-isle/crash-reports`).

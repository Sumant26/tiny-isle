# Security Policy

Tiny Isle is a client-side game with no server or accounts. The main risks are in dependencies and in loading save files.

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private vulnerability reporting (**Security → Report a vulnerability**) on this repository. You'll get a reply within a week.

## What we do

- Save files (from browser storage or imported) are parsed defensively, size-limited and validated field by field before use (`src/persistence/schema.ts`).
- Dependencies are kept current by Dependabot; CodeQL scans the code weekly.
- No `eval`, no remote code, no third-party scripts at runtime (fonts only).

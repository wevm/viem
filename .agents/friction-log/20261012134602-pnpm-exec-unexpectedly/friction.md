---
title: 'pnpm exec unexpectedly synchronizes dependencies and runs install hooks'
severity: 'minor'
---

### Expected Behavior
An inspection command executes the already-installed binary without synchronizing dependencies.

### Current Behavior
During PR #5199 review, pnpm exec bun --eval automatically synchronized dependencies (including ox 0.14.56 to pinned 0.14.45), initialized submodules, rebuilt contract fixtures, and installed Git hooks. No additional tracked files changed.

### Possible Solution
Use an already-installed binary directly when dependency synchronization is unwanted. Documented this in AGENTS.md.

### Minimal Reproducible Example
With dependencies out of sync with the checked-out branch, run pnpm exec bun --eval "console.log(1)".

### Context
A read-only PR inspection unexpectedly ran install hooks under pnpm 11.13.1.

---
title: 'pnpm exec reruns postinstall in fresh viem worktrees'
severity: 'minor'
---

## Expected Behavior
Formatting a file with pnpm exec should run Biome after dependencies were installed with --ignore-scripts.

## Current Behavior
The dependency status check reruns pnpm install and postinstall, including contract generation, before Biome starts.

## Possible Solution
Document using ./node_modules/.bin/biome directly for focused worktree checks, or avoid the implicit install.

## Minimal Reproducible Example
In a fresh worktree, run CI=true pnpm install --ignore-scripts --frozen-lockfile, then pnpm exec biome check src/tempo/Abis.ts.

## Context
This occurred while updating Zone ABI files in an isolated viem worktree.

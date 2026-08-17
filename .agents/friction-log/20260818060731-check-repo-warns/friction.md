---
title: 'check:repo warns about the test workspace'
severity: 'minor'
---

## Expected Behavior

`pnpm check:repo` completes without warnings in a fresh worktree after dependency setup.

## Current Behavior

Sherif reports `packages-without-package-json` because `pnpm-workspace.yaml` includes `test` while `test/package.json` does not exist.

## Possible Solution

Exclude the test fixture directory from workspace package discovery or add the intended workspace manifest.

## Minimal Reproducible Example

Run `pnpm install --frozen-lockfile`, then run `pnpm check:repo` in a fresh worktree.

## Context

The command exits successfully with one warning and no errors.

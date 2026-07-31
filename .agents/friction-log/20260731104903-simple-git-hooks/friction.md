---
title: 'simple-git-hooks cannot install hooks in a Git worktree'
severity: 'minor'
---

## Expected Behavior

`pnpm install` should configure hooks through the worktree common Git directory, or skip hook setup without reporting an error.

## Current Behavior

Both the dependency postinstall and root prepare scripts try to create `<worktree>/.git/hooks`. Because `.git` is a file in linked worktrees, `simple-git-hooks` reports `ENOTDIR` twice while `pnpm install --frozen-lockfile` otherwise succeeds.

## Possible Solution

Resolve the hooks directory with `git rev-parse --git-path hooks`, or skip hook installation when `.git` is not a directory.

## Minimal Reproducible Example

1. Create a linked worktree with `git worktree add`.
2. Run `pnpm install --frozen-lockfile` in that worktree.

## Context

This added false error output while validating the Foundry nightly CI update from an isolated v3 worktree.

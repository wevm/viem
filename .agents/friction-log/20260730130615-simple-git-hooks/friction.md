---
title: 'simple-git-hooks cannot install in a worktree'
severity: 'minor'
---

## Expected Behavior

`pnpm install --frozen-lockfile` installs Git hooks in an isolated worktree.

## Current Behavior

`simple-git-hooks` reports `ENOTDIR .../.git/hooks` because `.git` is a file. Installation continues without hooks.

## Possible Solution

Resolve the common Git directory with `git rev-parse --git-common-dir` before creating the hooks directory.

## Minimal Reproducible Example

Create a Git worktree, then run `pnpm install --frozen-lockfile` in it.

## Context

Observed while verifying the Tempo localnet matrix on macOS.

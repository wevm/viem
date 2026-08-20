---
title: '`pnpm install` cannot configure hooks in a Git worktree'
severity: 'minor'
---

## Expected Behavior

`pnpm install --frozen-lockfile` configures repository hooks in a linked worktree.

## Current Behavior

The install reports `ENOTDIR` while trying to create `.git/hooks` because `.git` is a file. Installation continues without configuring hooks.

## Possible Solution

Resolve the common Git directory before writing hooks.

## Minimal Reproducible Example

Create a linked worktree and run `pnpm install --frozen-lockfile`.

## Context

Observed while setting up a fresh Viem worktree.

---
title: 'Repository pnpm shim cannot install pinned pnpm'
severity: 'minor'
---

## Expected Behavior

The repository pnpm shim runs the pinned package manager.

## Current Behavior

Any `pnpm` command fails because the expected 11.13.1 executable is missing. `corepack pnpm` works.

## Possible Solution

Repair the pnpm managed-tool installation or document the Corepack fallback.

## Minimal Reproducible Example

Run `pnpm --version` from the repository root.

## Context

This blocks generation and validation scripts until commands are invoked through Corepack.

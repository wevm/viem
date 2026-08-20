---
title: '`pnpm changeset status` rejects workspace file dependencies'
severity: 'minor'
---

## Expected Behavior

`pnpm changeset status` validates scoped changesets in a development checkout.

## Current Behavior

The command rejects environment packages whose manifests use `file:../../src/` because the dependency does not equal the current Viem version.

## Possible Solution

Allow the repository's intentional local file dependencies during changeset validation.

## Minimal Reproducible Example

Run `pnpm changeset status` after adding a Viem changeset.

## Context

This blocks local changeset validation without changing unrelated environment manifests.

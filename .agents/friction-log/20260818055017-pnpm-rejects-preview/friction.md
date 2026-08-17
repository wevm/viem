---
title: 'pnpm rejects preview dependencies in workspace packages'
severity: 'minor'
---

## Expected Behavior

A preview dependency can be tested across workspace consumers without changing published package metadata.

## Current Behavior

`pnpm install --lockfile-only` fails with `ERR_PNPM_EXOTIC_SUBDEP` when `src/package.json` points to an Ox pkg.pr.new URL because `blockExoticSubdeps` rejects URL dependencies beneath workspace consumers.

## Possible Solution

Document that preview dependencies require a repository-level `pnpm.overrides` entry and `blockExoticSubdeps: false`.

## Minimal Reproducible Example

Set the `ox` dependency in `src/package.json` to a pkg.pr.new URL and run `pnpm install --lockfile-only`.

## Context

The working pattern retains the released manifest version, overrides Ox at the workspace root, and temporarily allows exotic subdependencies.

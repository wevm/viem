---
title: 'Pinned Tempo Zone tests stall during local Docker provisioning'
severity: 'minor'
---

## Expected Behavior

Pinned Tempo Zone integration tests either provision the Zone successfully or fail with a bounded diagnostic.

## Current Behavior

On an arm64 macOS Docker host, the parent Tempo server starts but Zone provisioning can stall indefinitely with no progress or timeout.

## Possible Solution

Add bounded startup diagnostics or document that this pinned integration lane requires a Linux/amd64 runner.

## Minimal Reproducible Example

Run `pnpm test --run --bail=1 --project tempo src/tempo/actions/zone.test.ts` with the T10 Tempo and Zone image environment variables pinned to amd64 GHCR images.

## Context

This blocked local verification of the T10 sender-bound deposit fixture while the same images run on Linux GitHub Actions.

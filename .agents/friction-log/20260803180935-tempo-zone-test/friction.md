---
title: 'Tempo Zone test container rejects configured dev key'
severity: 'major'
---

## Expected Behavior

The latest Tempo and Zone images start and the Zone integration tests run.

## Current Behavior

The Zone container exits during HTTP healthCheck because the ZoneFactory owner is `0xf39F...2266` while the configured dev key resolves to `0x7099...79C8`.

## Possible Solution

Align the default Zone dev key with the factory owner, or provision a factory ownership transfer before the health check.

## Minimal Reproducible Example

Run `VITE_TEMPO_ZONES=true pnpm test --run src/tempo/actions/zone.test.ts`.

## Context

This blocks local validation of the Zone integration lane with the documented latest-image defaults before any tests execute.

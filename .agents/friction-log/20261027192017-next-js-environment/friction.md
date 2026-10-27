---
title: 'Next.js environment tests depend on public RPC and race server startup'
severity: 'minor'
---

## Expected Behavior
Framework compatibility tests use a local chain and wait for server startup.

## Current Behavior
The fixture calls public HTTP and WebSocket RPC endpoints and has no Playwright readiness URL. CI recorded connection refusal and client-success timeouts; 15 local checks passed unchanged.

## Possible Solution
Use a real local Anvil node and explicit readiness checks.

## Minimal Reproducible Example
Run pnpm test:env:next. Adding a startup delay exposes the missing readiness check.

## Context
Post-merge run https://github.com/wevm/viem/actions/runs/40589915741.

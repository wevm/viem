---
title: 'Tempo relay tests cannot import createHttpServer without Forge-generated contracts'
severity: 'minor'
---

### Expected Behavior

`pnpm test --project tempo --run src/tempo/internal/relay/<plugin>.test.ts` runs on a machine without Foundry, since Tempo relay tests never deploy the generated contracts.

### Current Behavior

The suite fails at import time with `Cannot find module '../../contracts/generated.js' imported from test/src/utils.ts`. Relay plugin tests import `createHttpServer` from `~test/utils.js`, which statically imports `contracts/generated.js`, a file that only exists after `pnpm contracts:build` (Foundry + submodules).

### Possible Solution

Move `createHttpServer` (and other contract-free helpers) into a module without contract imports, or lazy-load the generated contracts in `test/src/utils.ts`.

### Minimal Reproducible Example

Fresh clone, `pnpm install --ignore-scripts`, then `pnpm test --project tempo --run src/tempo/internal/relay/feeToken.test.ts`.

### Context

Hit while adding the `Relay.keyAuthorization` plugin tests in an environment where Foundry could not be installed.

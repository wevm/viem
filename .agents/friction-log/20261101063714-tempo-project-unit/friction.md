---
title: 'Tempo project unit tests need Docker even when they make no RPC calls'
severity: 'minor'
---

### Expected Behavior

Pure tests under `src/tempo/**`, such as `.call()` encoding snapshots, run without a node.

### Current Behavior

They run in the `tempo` Vitest project, whose global setup boots a Tempo Docker container. Without Docker, the only options are a hand-written Vitest config, or `VITE_TEMPO_ENV=testnet`, whose setup funds an account from the faucet.

### Possible Solution

A node-free Vitest project, or a filename convention such as `*.unit.test.ts`.

### Minimal Reproducible Example

`pnpm test --run src/tempo/Addresses.test.ts` on a machine without a Docker daemon.

### Context

Hit while adding `Actions.attested` call-encoding tests in a container without Docker.

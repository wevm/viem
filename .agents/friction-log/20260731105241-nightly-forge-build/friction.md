---
title: 'nightly forge build lint reports false missing imports'
severity: 'major'
target: 'foundry-rs/foundry'
---

## Expected Behavior

`forge build --config-path ./contracts/foundry.toml` should succeed when compilation succeeds and all Solidity imports resolve.

## Current Behavior

Foundry `1.7.2-nightly` at commit `160b60260db63ce6204f2ee15764aca3e9ef04fe` compiles 87 files successfully, then its post-build lint phase reports 33 false missing-import errors and exits 1. The same command exits 0 with Foundry `v1.7.1` at commit `4072e48705af9d93e3c0f6e29e93b5e9a40caed8`.

## Possible Solution

Keep lint import resolution aligned with the compiler remappings and include paths. `--no-lint` avoids the failure but skips the new build-time lint phase.

## Minimal Reproducible Example

From viem v3 commit `6956d17ce43c804dda2ff05a176e941477decfbf`, run `pnpm install --frozen-lockfile`, then `forge build --config-path ./contracts/foundry.toml` with the nightly binary.

## Context

This blocks testing a move from Foundry `v1.7.1` to nightly to obtain `anvil_dealTIP20`.

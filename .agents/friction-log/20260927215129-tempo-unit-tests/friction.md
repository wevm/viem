---
title: 'Tempo unit tests require a running node before testing pure modules'
severity: 'minor'
---

### Expected Behavior
Pure handler and export tests can run without a chain.

### Current Behavior
The tempo project unconditionally runs test/src/tempo/setup.ts. Pure Relay and export tests fail in beforeAll with RPC HTTP 400 and all tests skipped if no local node is available.

### Possible Solution
Separate chain-independent tests from the integration harness.

### Minimal Reproducible Example
Run pnpm test --run --project tempo src/tempo/Relay.test.ts src/tempo/index.test.ts without a local Tempo node.

### Context
Testing the plugin composition contract, which does not access a node. A temporary test configuration excluding chain setup is sufficient for these tests.

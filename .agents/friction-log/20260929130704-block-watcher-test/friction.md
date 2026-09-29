---
title: 'Block watcher test races the first poll against fork startup'
severity: 'minor'
---

### Expected Behavior
The block watcher test should verify emitted block numbers consistently on a cold fork.

### Current Behavior
Main run 36512103000 repeatedly observed five callbacks where the test expected four. The first poll can return the starting block before the first mining request finishes.

### Possible Solution
Wait for the initial block observation, then mine and await each subsequent block.

### Minimal Reproducible Example
Run pnpm test --run --project core src/actions/public/watchBlockNumber.test.ts against a cold Anvil fork.

### Context
This blocks the main CI core test shard.

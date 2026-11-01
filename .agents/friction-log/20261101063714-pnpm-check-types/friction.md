---
title: '`pnpm check:types` runs out of memory at the default Node heap'
severity: 'minor'
---

### Expected Behavior

`pnpm check:types` completes with the default Node heap.

### Current Behavior

`tsc -b` aborts with "JavaScript heap out of memory" after about 2.5 minutes on a 16 GB machine.

### Possible Solution

Set `NODE_OPTIONS=--max-old-space-size=8192` in the script. With it, the check completes in about 2 minutes.

### Minimal Reproducible Example

`pnpm check:types` on Node 22 with 16 GB of RAM.

### Context

Hit while type-checking `viem/tempo` changes.

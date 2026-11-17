---
"viem": patch
---

Fetched the nonce, block, and priority fee concurrently in `Actions.transaction.prepare` and `Actions.fee.estimateFeesPerGas` when the chain has no fee hooks, and stopped fetching the block for legacy fees.

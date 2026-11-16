---
"viem": patch
---

Requested the block and the priority fee concurrently in `estimateFeesPerGas` when the chain has no fee hooks, and stopped requesting the unused block for legacy fees.

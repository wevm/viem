---
"viem": patch
---

Stopped requesting the latest block for legacy fees in `prepareTransactionRequest` when the chain has no fee hooks.

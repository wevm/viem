---
"viem": patch
---

Fetched the nonce, block, and priority fee concurrently in `prepareTransactionRequest` when the chain has no fee hooks.

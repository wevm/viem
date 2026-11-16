---
"viem": patch
---

Bounded the `withCache` caches and the EIP-1559 network cache in `prepareTransactionRequest`, which grew by one entry per client.

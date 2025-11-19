---
"viem": minor
---

Hooked up `eth_fillTransaction` routing to `prepareTransactionRequest`, to reduce the RPC calls required to prepare a local transaction from 3-4, to 1 (if `eth_fillTransaction` is supported by the execution node).

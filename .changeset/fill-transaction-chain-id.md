---
"viem": patch
---

Changed `prepareTransactionRequest` to keep the `chainId` argument or chain id over the `eth_fillTransaction` result and throw `ChainMismatchError` when they differ.

---
"viem": patch
---

Changed `Actions.transaction.prepare` to keep the `chainId` option or chain id over the `eth_fillTransaction` result and throw `Chain.MismatchError` when they differ.

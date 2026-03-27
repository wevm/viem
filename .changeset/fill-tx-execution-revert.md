---
"viem": patch
---

Propagated execution reverted errors (code 3) from `eth_fillTransaction` in `prepareTransactionRequest` instead of silently falling through.

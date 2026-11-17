---
"viem": patch
---

Added an `afterFillTransactionError` phase to chain `transaction.prepare` hooks that receives the fill error and retries `eth_fillTransaction` once with the request the hook returns.

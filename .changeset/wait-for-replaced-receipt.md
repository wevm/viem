---
"viem": patch
---

Added a `replacement` option to `waitForTransactionReceipt` so a transaction dropped before the wait reads it is still detected as replaced when its sender and nonce are provided.

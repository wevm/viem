---
"viem": patch
---

Added a `replacement` parameter to `waitForTransactionReceipt` that detects a replacement of a Transaction the node dropped before the wait first read it, and fixed `onReplaced` not being called for a replacement when `confirmations` is greater than 1.

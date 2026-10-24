---
"viem": patch
---

Fixed `waitForTransactionReceipt` not calling `onReplaced` for a replacement when `confirmations` is greater than 1.

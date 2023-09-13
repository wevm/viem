---
"viem": patch
---

Fixed an issue where `waitForTransactionReceipt` would throw an error if `receipt.blockNumber` was undefined.

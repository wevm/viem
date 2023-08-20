---
"viem": patch
---

Fixed an issue where `waitForTransactionReceipt` would be infinitely pending when an error is thrown after a transaction has been replaced.

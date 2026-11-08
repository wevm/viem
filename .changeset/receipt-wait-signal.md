---
"viem": patch
---

Added a `signal` parameter to `waitForTransactionReceipt` that stops the wait, rejecting with the signal's reason.

---
"viem": patch
---

Added a `signal` option to `transaction.waitForReceipt` that stops the wait, rejecting `receipt` with the signal's reason.

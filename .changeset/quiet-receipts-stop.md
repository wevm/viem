---
"viem": patch
---

Stopped `waitForTransactionReceipt` from starting to poll when its `timeout` fired during the first receipt lookup.

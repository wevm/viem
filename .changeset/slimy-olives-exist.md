---
"viem": patch
---

Fixed a race condition in `waitForTransactionReceipt` causing multiple parallel instances to not resolve.

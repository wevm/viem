---
"viem": patch
---

Fixed issue where `waitForTransactionReceipt` would throw immediately for RPC Providers which may be slow to sync mined transactions.

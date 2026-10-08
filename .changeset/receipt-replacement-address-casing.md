---
"viem": patch
---

Fixed `waitForTransactionReceipt` missing a replacement transaction, or reporting a repriced one as `replaced`, when the RPC returned addresses in a different case than for the replaced transaction.

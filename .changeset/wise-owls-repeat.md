---
"viem": patch
---

Fixed `waitForTransactionReceipt` so concurrent calls for the same hash on one client each honor their own `timeout`, `confirmations`, `pollingInterval`, `retryCount` and `checkReplacement` instead of inheriting the first call's options.

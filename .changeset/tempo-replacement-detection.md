---
"viem": patch
---

Added a `transactionReplacement` chain config hook to `waitForTransactionReceipt`. Fixed `viem/tempo` replacement detection to respect nonce slots, so expiring-nonce waits no longer resolve to an earlier transaction's receipt.

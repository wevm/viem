---
"viem": patch
---

Fixed `sendTransaction`, `sendTransactionSync`, `writeContract`, `writeContractSync`, `sendCalls`, and `simulateBlocks` shifting calldata when `dataSuffix` has an odd length.

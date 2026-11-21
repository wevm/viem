---
"viem": patch
---

Fixed `sendTransaction`, `sendTransactionSync`, `writeContract`, `writeContractSync`, `sendCalls`, `simulateBlocks`, `simulateContract`, `estimateContractGas`, `prepareUserOperation`, and the Tempo `simulate` actions producing misaligned calldata when `dataSuffix` has an odd length.

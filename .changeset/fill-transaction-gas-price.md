---
"viem": patch
---

Fixed `fillTransaction` and `prepareTransactionRequest` returning `gasPrice` next to EIP-1559 fees on Anvil, which made `estimateGas` and `sendTransaction` fail on Anvil 1.8.5 and later with "both gasPrice and (maxFeePerGas or maxPriorityFeePerGas) specified".

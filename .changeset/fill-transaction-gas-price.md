---
"viem": patch
---

Fixed `transaction.fill` returning `gasPrice` next to EIP-1559 fees on Anvil, which Geth, reth, and Anvil 1.8.5 and later reject when sent back with "both gasPrice and (maxFeePerGas or maxPriorityFeePerGas) specified".

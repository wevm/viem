---
"viem": patch
---

Fixed `finalizeWithdrawal`, `estimateFee`, and `estimateGasL1ToL2` in `viem/zksync` falling back to the client account when `account` is `null`.

---
"viem": patch
---

Fixed `maxPriorityFeePerGas` above a `maxFeePerGas` of `0n` not raising `TipAboveFeeCapError` or `MaxFeePerGasTooLowError`.

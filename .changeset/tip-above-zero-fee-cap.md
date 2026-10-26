---
"viem": patch
---

Fixed `maxPriorityFeePerGas` above a `maxFeePerGas` of `0n` not raising `TipAboveFeeCapError` or `MaxFeePerGasTooLowError` (including in actions that validate requests before calling the node, such as `call` and `estimateGas`), and fixed fee error messages dropping `0n` values.

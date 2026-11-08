---
"viem": patch
---

Fixed `maxPriorityFeePerGas` above a `maxFeePerGas` of `0n` not raising `RpcError.TipAboveFeeCapError` or `TransactionPrepare.MaxFeePerGasTooLowError` in actions that validate requests before calling the node (such as `Actions.call`, `Actions.transaction.estimateGas` and `Actions.transaction.send`), and fixed fee error messages dropping `0n` values.

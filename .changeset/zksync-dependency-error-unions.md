---
"viem": patch
---

Added the error types of the actions and helpers called internally to `GetL1TokenBalanceErrorType` and `IsWithdrawalFinalizedErrorType`, so propagated contract and RPC failures are described by those unions.

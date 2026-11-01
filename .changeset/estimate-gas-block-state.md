---
"viem": patch
---

Fixed `estimateGas` and `estimateContractGas` ignoring `blockNumber`, `blockTag`, and `stateOverride` for Local Accounts when the RPC supports `eth_fillTransaction`.

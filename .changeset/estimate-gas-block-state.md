---
"viem": patch
---

Fixed `estimateGas` and `estimateContractGas` returning a gas limit filled by `eth_fillTransaction` that ignored `blockNumber`, `blockTag`, and `stateOverride`.

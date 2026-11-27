---
'viem': patch
---

Fixed `estimateGas` in `viem/linea` failing with an internal RPC error when `blockNumber` or `blockTag` was set, since `linea_estimateGas` reads its second param as state overrides and always estimates against the pending block.

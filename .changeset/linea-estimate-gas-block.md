---
'viem': patch
---

Fixed `estimateGas` in `viem/linea` failing with an internal RPC error when `blockNumber` or `blockTag` was set; they are now ignored, since `linea_estimateGas` takes no block parameter and always estimates against the pending block.

---
'viem': patch
---

Fixed `stateOverride` being silently dropped by `estimateGas` in `viem/linea` — it was destructured into an unused rest object and never serialized onto the `linea_estimateGas` request, so overrides never reached the node.

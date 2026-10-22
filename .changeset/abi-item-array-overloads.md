---
"viem": patch
---

Fixed `getAbiItem` not matching array arguments whose element type has a `0` in its size (e.g. `uint160[]`, `bytes20[]`, `int40[2]`), which made `encodeFunctionData`, `readContract` and friends pick the wrong overload. Array overloads with ambiguous element types, such as `address[]` and `bytes20[]`, now throw `AbiItemAmbiguityError` like `address` and `bytes20` do.

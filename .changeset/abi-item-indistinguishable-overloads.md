---
"viem": patch
---

Fixed `getAbiItem` to throw `AbiItemAmbiguityError` for overloads that JavaScript cannot distinguish, such as `bytes` vs `bytes32` and `uint256` vs `int256`.

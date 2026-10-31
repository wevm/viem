---
"viem": patch
---

Fixed `getAbiItem` to throw `AbiItemAmbiguityError` for overloads that JavaScript cannot distinguish, such as `bytes` vs `bytes32`, `uint256` vs `int256`, and `uint256[]` vs `uint256[2]`, while resolving distinguishable values by byte length and integer range.

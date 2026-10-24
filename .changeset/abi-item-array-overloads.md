---
"viem": patch
---

Fixed `getAbiItem` overload resolution for arrays with a `0` in the element size (e.g. `uint160[]`) or the wrong fixed length, tuple objects with reordered keys, and ambiguous `address[]` overloads.

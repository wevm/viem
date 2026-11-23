---
"viem": patch
---

Fixed `decodeAbiParameters` returning integers outside their ABI type for non-canonical data. It now throws `IntegerOutOfRangeError`, as Solidity's decoder and ox do.

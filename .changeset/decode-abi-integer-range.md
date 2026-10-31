---
"viem": patch
---

Fixed `decodeAbiParameters` accepting `intN`/`uintN` words outside the declared type's range and `address` words with non-zero padding; it now throws `IntegerOutOfRangeError` or `InvalidAddressError`, matching Solidity's `abi.decode`.

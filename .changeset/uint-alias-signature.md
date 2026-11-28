---
"viem": patch
---

Fixed `toFunctionSelector`, `toEventSelector`, `toFunctionSignature`, `toEventSignature`, `toFunctionHash`, and `toEventHash` keeping the `uint` and `int` aliases instead of expanding them to `uint256` and `int256`, so `toFunctionSelector('function transfer(address to, uint amount)')` returned `0x6cb927d8` instead of `0xa9059cbb`.

---
"viem": patch
---

Fixed `validateTypedData` and `hashTypedData` rejecting EIP-712 struct names that only start with a Solidity type name, such as `intent` or `bytesInfo`.

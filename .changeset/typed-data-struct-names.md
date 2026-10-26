---
"viem": patch
---

Fixed `validateTypedData` and `hashTypedData` to accept struct names that start with a Solidity type name (such as `intent`), to reject struct names that shadow a Solidity type (such as `uint256[]` or `uint7`), and to include struct names that contain `$` in the encoded type.

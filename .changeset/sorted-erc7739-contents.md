---
"viem": patch
---

Fixed `wrapTypedDataSignature` (and the ERC-7739 `signTypedData` action) to send the contents type in the order the `TypedDataSign` type encoding sorts it, using explicit mode when a nested type sorts before the primary type. Previously, such signatures did not verify on ERC-7739 accounts.

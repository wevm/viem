---
"viem": patch
---

Fixed `validateTypedData` (and so `hashTypedData`, `signTypedData`, `verifyTypedData` and `recoverTypedDataAddress`) accepting a fixed-length array field such as `uint256[2]` whose value has a different number of elements, in any dimension or inside a struct array; it now throws `AbiEncodingArrayLengthMismatchError`.

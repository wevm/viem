---
"viem": patch
---

Fixed `validateTypedData` (and so `hashTypedData` and `signTypedData`) accepting field types that are not EIP-712 types, such as `uint7`, `uint264`, `uint08`, `int0` or `bytes0`, and field types that reference a struct missing from `types`; it now throws `InvalidTypedDataTypeError`.

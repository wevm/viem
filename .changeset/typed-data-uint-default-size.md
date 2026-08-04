---
"viem": patch
---

Fixed `validateTypedData` crashing with `RangeError` on `uint`/`int` types (no explicit bit size) instead of defaulting to 256-bit like `encodeAbiParameters` and `encodePacked`.

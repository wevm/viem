---
"viem": patch
---

Fixed `serializeTransaction` dropping the `r`, `s`, and `v` set on a legacy transaction, so a parsed signed legacy transaction serialized as unsigned.

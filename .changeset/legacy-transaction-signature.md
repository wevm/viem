---
"viem": patch
---

Fixed `serializeTransaction` dropping the `r`, `s`, and `v` set on a legacy transaction, so a parsed signed legacy transaction serialized as unsigned, and `signTransaction` hashing a signature set on the transaction, so re-signing a parsed signed transaction produced an invalid signature.

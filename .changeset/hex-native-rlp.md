---
"viem": patch
---

Sped up `toRlp`, `fromRlp`, `serializeTransaction` and `parseTransaction` by encoding and decoding hex RLP directly from strings instead of converting through bytes.

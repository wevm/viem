---
"viem": patch
---

Fixed `fromRlp` accepting non-minimal RLP length prefixes and length-prefixed single bytes below `0x80`, which now throw `RlpNonCanonicalError`.

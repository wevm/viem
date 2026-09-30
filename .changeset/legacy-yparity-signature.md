---
"viem": patch
---

Fixed `serializeTransaction` for legacy transactions when the signature only has `yParity`, or has `v` as `0n`/`1n`.

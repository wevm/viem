---
"viem": patch
---

Fixed `serializeTransaction` for legacy transactions to accept signatures carrying `yParity` (preferred over `v`, as in typed transactions) or a `v` of `0`/`1`, which previously threw or produced an invalid EIP-155 `v`.

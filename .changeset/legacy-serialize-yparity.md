---
"viem": patch
---

Fixed `serializeTransaction` for legacy transactions when the signature only carries `yParity` (e.g. from `parseSignature` or `compactSignatureToSignature`) or a `v` of `0`/`1`, which previously threw or produced an invalid EIP-155 `v`.

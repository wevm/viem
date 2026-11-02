---
"viem": patch
---

Fixed `SignatureErc2098.toSignature` returning an unpadded `r`, and `SignatureErc2098.from` silently corrupting signatures with a high `s` or a `yParity` other than `0` or `1`, which now throw `SignatureErc2098.InvalidSError` and `Signature.InvalidYParityError`.

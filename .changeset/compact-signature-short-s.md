---
"viem": patch
---

Fixed `signatureToCompactSignature` and `compactSignatureToSignature` for values shorter than 32 bytes and a legacy `v` with a chain id, and added errors for invalid `v` and high `s`.

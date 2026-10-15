---
"viem": patch
---

Fixed `signatureToCompactSignature` for an `s` shorter than 32 bytes and for a legacy `v` with a chain id.

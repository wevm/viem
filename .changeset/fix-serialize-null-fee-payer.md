---
"viem": patch
---

`viem/tempo`: Fixed `serializeTempo` collapsing `feePayerSignature: null` (presign marker) to `undefined`, causing the `0x00` fee-payer marker to be omitted from serialization.

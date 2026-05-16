---
"viem": patch
---

**Tempo**: Preserve `feeToken` in the broadcast envelope once the fee
payer has signed. Previously `feeToken` was unconditionally stripped
whenever `feePayer === true`, which removed it from the post-signed
envelope and caused the chain to fall back to the sender's default
account token. The strip is now gated on `!feePayerSignature`.

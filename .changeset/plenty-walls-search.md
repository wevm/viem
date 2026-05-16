---
"viem": patch
---

`viem/tempo`: Preserved `feeToken` on broadcast envelope when `feePayerSignature` is present. Previously stripped unconditionally when `feePayer === true`, breaking fee payer signature verification on-chain.

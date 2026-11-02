---
"viem": patch
---

`viem/tempo`: Fixed `Account.signTransaction` signing the unsponsored payload for a `feePayer` request passed without the `feePayerSignature: null` marker, and serializing a prefilled fee payer signature into the fee payer handoff format.

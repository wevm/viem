---
"viem": patch
---

Fixed sponsored `prepareTransactionRequest` fills keeping a requested `feeToken` that the fee payer did not sign, which made the fee payer signature invalid.

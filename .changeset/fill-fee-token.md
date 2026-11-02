---
"viem": patch
---

Fixed sponsored `Actions.transaction.prepare` fills keeping a requested `feeToken` (and validity bounds) that the fee payer did not sign, which made the fee payer signature invalid.

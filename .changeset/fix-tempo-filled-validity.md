---
"viem": patch
---

Fixed `prepareTransactionRequest` to preserve relay-filled `validBefore` and `validAfter` bounds so sponsored Tempo transactions retain a valid fee-payer signature.

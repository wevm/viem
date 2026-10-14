---
"viem": patch
---

Preserved `validBefore` and `validAfter` from `eth_fillTransaction` in `prepareTransactionRequest`, so Tempo fee payer signatures that cover a relay-set validity window remain valid.

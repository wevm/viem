---
"viem": patch
---

Kept supplied gas, fee, and nonce values in `fillTransaction` unless the filled transaction is a Tempo transaction with a fee payer signature.

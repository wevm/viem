---
"viem": patch
---

Adopted `calls` from `eth_fillTransaction` response in `prepareTransactionRequest` so the broadcast envelope matches what the fee payer signed over (e.g. Tempo sponsor autoSwap calls).

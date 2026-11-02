---
"viem": patch
---

Fixed `Chain.ExtractBlock` for chains with a block codec, such as Tempo and OP Stack, to narrow `transactions` on `includeTransactions` and the hash, logs bloom, nonce, and number on a `'pending'` `blockTag`.

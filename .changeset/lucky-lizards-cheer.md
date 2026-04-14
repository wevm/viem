---
'viem': patch
---

Updated `withFeePayer` transports to forward `eth_fillTransaction` requests to the fee payer transport only when `feePayer: true` is requested.

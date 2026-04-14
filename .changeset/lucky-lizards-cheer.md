---
'viem': patch
---

Updated `withFeePayer` transports to forward `eth_fillTransaction` requests only when `feePayer: true` is requested, and to relay raw Tempo transactions only after the sender signature is present.

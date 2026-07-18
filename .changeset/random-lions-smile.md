---
'viem': patch
---

Defaulted omitted `validAfter` values to random past timestamps for Tempo expiring-nonce transactions, preventing otherwise-identical transactions from sharing a nonce hash.

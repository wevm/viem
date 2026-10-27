---
"viem": patch
---

`viem/tempo`: Fixed formatting of Tempo transactions whose nonce exceeds `Number.MAX_SAFE_INTEGER` (such as expiring-nonce transactions), which made `getTransaction`, `getBlock` with `includeTransactions` and `waitForTransactionReceipt` replacement checks throw `IntegerOutOfRangeError`.

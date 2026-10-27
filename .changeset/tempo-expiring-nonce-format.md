---
"viem": patch
---

`viem/tempo`: Fixed formatting of Tempo transactions whose nonce exceeds `Number.MAX_SAFE_INTEGER` (such as TIP-1106 expiring-nonce discriminators), which made `getTransaction`, `getBlock` with `includeTransactions` and `waitForTransactionReceipt` replacement checks throw `IntegerOutOfRangeError`. Formatted Tempo transactions now carry `nonce` as an exact `bigint`.

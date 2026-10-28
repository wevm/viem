---
"viem": patch
---

`viem/tempo`: Fixed formatting of Tempo transactions whose nonce exceeds `Number.MAX_SAFE_INTEGER` (such as TIP-1106 expiring-nonce discriminators), which made `getTransaction`, `getBlock` with `includeTransactions` and `waitForTransactionReceipt` replacement checks throw `IntegerOutOfRangeError`, and added `nonceExact` to formatted Tempo transactions, which carries the nonce as an exact `bigint` while `nonce` stays a `number`.

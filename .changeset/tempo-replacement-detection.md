---
"viem": patch
---

`waitForTransactionReceipt`: Replacement detection now only matches transactions with the same nonce key, and `chain.supportsTransactionReplacementDetection` can be a per-transaction predicate. `viem/tempo` uses it to skip detection for expiring-nonce transactions, which cannot be replaced; previously a wait could resolve to an earlier expiring-nonce transaction's receipt.

---
"viem": patch
---

`viem/tempo`: Filled the protocol nonce for `nonceKey: 0n`, decoded Tempo transactions inside blocks (keeping expiring nonces above `Number.MAX_SAFE_INTEGER` exact), and made `Actions.transaction.waitForReceipt` detect replacements per Tempo nonce slot through a new `chain.transaction.replacement` hook.

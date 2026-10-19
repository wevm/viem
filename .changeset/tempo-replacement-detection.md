---
"viem": patch
---

`viem/tempo`: Disabled transaction replacement detection on Tempo chains. Expiring-nonce transactions share nonce 0, so `waitForTransactionReceipt` could resolve to an earlier transaction's receipt.

---
"viem": patch
---

Added `dedupe` to `getTransactionReceipt`, and fixed `waitForTransactionReceipt` timing out on a mined transaction when the transaction's block arrived while an earlier receipt request was still waiting for its response.

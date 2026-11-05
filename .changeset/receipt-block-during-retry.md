---
"viem": patch
---

Fixed `waitForTransactionReceipt` dropping a block that arrived while it looked up the transaction or scanned for a replacement, which timed out the wait on a chain that mined no later block.

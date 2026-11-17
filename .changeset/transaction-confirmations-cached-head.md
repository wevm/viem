---
"viem": patch
---

Fixed `Actions.transaction.getConfirmations` returning zero or negative counts when the block number was cached or behind the transaction's block.

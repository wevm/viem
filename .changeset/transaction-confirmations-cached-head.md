---
"viem": patch
---

Fixed `getTransactionConfirmations` returning `0n` or a negative number for a transaction already in a block, when the block number it read was lower than the transaction's block number.

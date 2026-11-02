---
'viem': patch
---

Fixed `Actions.transaction.waitForReceipt` reporting another transaction in the same nonce slot as a replacement when the awaited transaction was already mined but its receipt was not yet indexed.

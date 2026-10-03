---
"viem": patch
---

Fixed `waitForUserOperationReceipt` hanging until timeout on a later call for the same hash after concurrent calls for that hash had settled.

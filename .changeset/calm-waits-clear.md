---
"viem": patch
---

Fixed `waitForTransactionReceipt` leaving a listener behind for concurrent calls with the same options, which made later waits for the same hash join an observer that was no longer polling and never settle.

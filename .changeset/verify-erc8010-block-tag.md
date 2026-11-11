---
"viem": patch
---

Fixed `verifyHash` ignoring `blockTag` when verifying pre-delegated ERC-8010 signatures, which now fall back to `'pending'` only when no block is selected.

---
"viem": patch
---

Added `blockHash` and `requireCanonical` parameters to `verifyHash` (and `verifyMessage`/`verifyTypedData`), allowing onchain signature verification to be pinned to a specific block via EIP-1898.

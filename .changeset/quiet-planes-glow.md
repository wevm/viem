---
"viem": patch
---

Fixed error decoding in `simulateBlocks` when RPC returns revert data in `returnData` instead of `error.data`.

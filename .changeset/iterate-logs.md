---
"viem": patch
---

Added `iterateLogs` and a `blockRange` parameter on `getLogs`, which read logs across a block range in pages of blocks and split pages that an RPC Provider rejects.

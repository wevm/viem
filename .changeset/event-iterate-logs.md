---
"viem": patch
---

Added `event.iterateLogs` and a `blockRange` option on `event.getLogs`, which read logs across a block range in pages of blocks and split pages that an RPC Provider rejects.

---
"viem": patch
---

Added `iterateLogs`, which iterates over the event logs in a block range one page of blocks at a time, splitting pages that an RPC Provider rejects.

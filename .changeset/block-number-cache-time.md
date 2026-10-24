---
"viem": patch
---

Changed the default `cacheTime` to the shorter of `pollingInterval` and half of `chain.blockTime`, so block numbers are cached for at most half a block and a long `pollingInterval` no longer lengthens the cache.

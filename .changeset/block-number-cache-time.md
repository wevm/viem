---
"viem": patch
---

Changed the default `cacheTime` to the shorter of the default `pollingInterval` and half of `chain.blockTime` when `pollingInterval` is not set, so block numbers on sub-second chains are cached for at most half a block.

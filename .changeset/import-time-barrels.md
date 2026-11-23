---
"viem": patch
---

Reduced `viem` and `viem/tempo` import time by importing ox modules and the Tempo chain directly instead of through their barrels, and by no longer hashing `simulateCalls` signatures at load.

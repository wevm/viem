---
"viem": patch
---

Fixed `getGame`, `getGames`, `getTimeToNextGame` and `getTimeToNextL2Output` to treat a dispute game (or L2 output) at exactly the requested L2 block number as covering it.

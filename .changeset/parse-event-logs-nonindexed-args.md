---
"viem": patch
---

Fixed `parseEventLogs` `args` filters dropping logs whose `string` or `bytes` values were decoded from data or differed in hex case, and matching every partially decoded log.

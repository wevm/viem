---
"viem": patch
---

Fixed `parseEventLogs` dropping logs when filtering on a non-indexed `string` or `bytes` argument, and matching `bytes` filters regardless of hex case.

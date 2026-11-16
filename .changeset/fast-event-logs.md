---
"viem": patch
---

Sped up `parseEventLogs` and `decodeEventLog` by preparing each event once per call, looking events up by selector, and reading `address`, `uint` and `bytesN` topics directly.

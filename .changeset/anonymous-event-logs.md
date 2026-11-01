---
"viem": patch
---

Fixed `decodeEventLog` and `parseEventLogs` so anonymous event logs decode, including when `getLogs` or `watchEvent` reads them back.

---
"viem": patch
---

Fixed `parseEventLogs` / `getLogs` args filters dropping matches when integer filters are JS numbers and decoded values are bigints.

---
"viem": patch
---

Fixed `decodeEventLog` and `parseEventLogs` so anonymous event logs decode, including when `getLogs` or `watchEvent` reads them back with a single anonymous `event`. Anonymous events are only matched when `eventName` names them, or when every event in `abi` is anonymous.

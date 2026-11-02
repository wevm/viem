---
"viem": patch
---

Fixed `decodeEventLog` and `parseEventLogs` to decode anonymous event logs when `eventName` names the event or every event in `abi` is anonymous, as with `getLogs` and `watchEvent` given a single anonymous `event`.

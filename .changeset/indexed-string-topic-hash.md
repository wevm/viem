---
"viem": patch
---

Fixed `encodeEventTopics` and `parseEventLogs` hashing an indexed `string` arg as raw bytes instead of UTF-8 when the string looked like hex (e.g. `0x1234`).

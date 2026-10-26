---
"viem": patch
---

Fixed `watchEvent` to pass `strict` to its `getLogs` fallback, so a `strict: true` watcher on an RPC Provider without filters no longer gets logs that do not match the event.

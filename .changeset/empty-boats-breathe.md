---
"viem": major
---

**Breaking (edge case):** `getLogs`, `getFilterLogs`, `getFilterChanges` no longer attempts to decode event args if it does not match the event definition/ABI (`event`) (ie. mismatch between the number of indexed & non-indexed arguments to `topics` & `data`). If there is an error decoding the event args, `args` will be `undefined` on the log.
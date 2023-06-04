---
"viem": patch
---

Added a `strict` parameter to `getLogs`, `createEventFilter` & `createContractEventFilter`. 

When `strict` mode is turned **on**, only logs that conform to the indexed/non-indexed arguments on the event definition/ABI (`event`) will be returned.
When `strict` mode is turned **off (default)**, logs that do not conform to the indexed/non-indexed arguments on the event definition/ABI (`event`) will be included, but the `args` property will be `undefined` (as we cannot decode these events).
---
"viem": major
---

**Breaking (edge case):** `decodeEventLog` no longer attempts to partially decode events. If the log does not conform to the ABI (mismatch between the number of indexed/non-indexed arguments to topics/data), it will throw an error.
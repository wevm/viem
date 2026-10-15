---
"viem": patch
---

Fixed `Relay.feePayer` to reject raw Tempo transactions that do not re-serialize to their exact bytes, such as `u64` fields above the safe integer range.

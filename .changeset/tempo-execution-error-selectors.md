---
"viem": patch
---

Improved `ExecutionError.from` performance by indexing Tempo error selectors as they are first hashed instead of hashing every signature on each call.

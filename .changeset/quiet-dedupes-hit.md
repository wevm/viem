---
"viem": patch
---

Looked up the in-flight request cache once instead of twice on deduplicated cache hits, halving the LRU refreshes per hit.

---
"viem": patch
---

Fixed an issue where Filter querying (`eth_getFilterChanges`, etc) was not being scoped to the Transport that created the Filter.

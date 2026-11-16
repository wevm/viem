---
"viem": patch
---

Appended calls to `multicall` chunks in place instead of copying the chunk for every call, making chunking linear in the number of calls.

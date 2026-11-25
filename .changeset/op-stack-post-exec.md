---
"viem": patch
---

Added `viem/op-stack` support for the post-exec transaction type (`0x7d`) from OP Stack Upgrade 22 (Lagoon), which the formatters now return as `type: 'postExec'` and `parseTransaction` and `serializeTransaction` now handle.

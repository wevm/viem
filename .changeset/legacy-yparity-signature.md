---
"viem": patch
---

Fixed `serializeTransaction` throwing for legacy transactions signed with a signature that has `yParity` but no `v`.

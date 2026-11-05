---
"viem": patch
---

Fixed `prepareUserOperation` dropping a falsy per-operation `paymasterContext` (`false`, `0`, or `''`) in favor of the bundler client default.

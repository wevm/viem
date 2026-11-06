---
"viem": patch
---

Fixed `prepareUserOperation` replacing a falsy per-operation `paymasterContext` (`false`, `0`, `''`, or `null`) with the bundler client's default `paymasterContext`.

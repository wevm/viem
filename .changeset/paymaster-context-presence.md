---
"viem": patch
---

Fixed the ERC-4337 `Actions.userOperation.prepare` replacing a falsy per-operation `paymasterContext` (`false`, `0`, `''`, or `null`) with the Bundler Client's default `paymasterContext`.

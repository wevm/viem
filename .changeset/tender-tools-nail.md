---
"viem": patch
---

Made `GetValue` return `{ value?: never }` instead of `unknown` for contract functions that are not payable.

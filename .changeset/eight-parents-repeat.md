---
"viem": patch
---

Fixed `TS7056` when a consumer exports a contract with a wide ABI: `Contract.from`'s return type no longer flattens, so declaration emit references it by name instead of expanding every method.

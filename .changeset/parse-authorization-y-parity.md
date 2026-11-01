---
"viem": patch
---

Fixed `parseTransaction` to accept an EIP-7702 authorization `yParity` above 1 (any value below 2**8, as EIP-7702 permits) instead of throwing `InvalidYParityError`, so a transaction that `serializeTransaction` produces can be parsed back.

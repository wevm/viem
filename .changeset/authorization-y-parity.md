---
"viem": patch
---

Fixed `serializeAuthorizationList` and `serializeTransaction` to encode an EIP-7702 authorization `yParity` above 1 as is instead of normalizing it to 1, which changed the transaction hash.

---
"viem": patch
---

Fixed `formatUserOperationRequest` encoding an EIP-7702 authorization `yParity` of `0` as a 32-byte zero value instead of `0x00`.

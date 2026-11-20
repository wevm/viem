---
"viem": patch
---

Fixed `validateSiweMessage` to assume the `https` scheme when the message omits `scheme`, per EIP-4361.

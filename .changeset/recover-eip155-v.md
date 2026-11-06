---
"viem": patch
---

Fixed `recoverPublicKey` and `recoverAddress` throwing `Invalid yParityOrV value` for signature objects with an EIP-155 `v` (e.g. from a legacy transaction).

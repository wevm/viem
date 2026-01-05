---
"viem": patch
---

Fixed encoding of `paymasterSignature` in `toPackedUserOperation` to use the correct ERC-4337 format with magic suffix and length prefix.

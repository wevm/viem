---
"viem": patch
---

Fixed `parseSiweMessage` accepting a nonce shorter than 8 characters and a version other than `1`. EIP-4361 requires `nonce = 8*( ALPHA / DIGIT )` and `version = "1"`, which `createSiweMessage` already enforces.

---
"viem": patch
---

Fixed `verifyHash` for Tempo `allowAccessKey` mode with `secp256k1` keychain access keys, whose inner envelope did not carry a `publicKey`.
